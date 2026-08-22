import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 8787
const execFileP = promisify(execFile)
const PY = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3')
const PARSE_PY = process.env.PARSE_PY || path.join(__dirname, 'parse_kcb.py')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
// 福建师范大学教务处（正方 Sudy 系统）
const JWC = 'https://jwc.fjnu.edu.cn'
const XJW = 'https://jwglxt.fjnu.edu.cn/jwglxt/xtgl/login_slogin.html'
const NOTICE_LIST = '/tzgg_9107/list.htm'   // 通知公告列表
const NEWS_LIST = '/430/list.htm'           // 工作动态列表
const CALENDAR_LIST = '/jxrl/list.htm'      // 教学日历列表
// 计算机与网络空间安全学院官网（同为 Sudy 系统）
const CSE = 'https://ccs.fjnu.edu.cn'
const CSE_LIST = '/tzgg/list.htm'

/** 解析学院通知列表（news-slick 结构） */
function parseCseList(html, base) {
  const out = []
  const seen = new Set()
  const re =
    /<a\s+href="([^"]+)"[^>]*class="clearfix">[\s\S]{0,400}?news-slick-date[^>]*>\s*<span>\s*(\d{1,2})\s*<\/span>\s*<br>\s*(\d{4}-\d{2})[\s\S]{0,600}?list-right-tt[^>]*>([\s\S]*?)<\/div>/g
  let m
  while ((m = re.exec(html))) {
    const [, path, day, ym, rawTitle] = m
    const title = rawTitle.replace(/<[^>]+>/g, '').trim()
    if (!title) continue
    const url = new URL(path, base).href
    if (seen.has(url)) continue
    seen.add(url)
    out.push({ date: `${ym}-${String(Number(day)).padStart(2, '0')}`, title, url })
  }
  return out
}

const cache = new Map()
const TTL = 5 * 60 * 1000

async function fetchText(url, force) {
  const hit = cache.get(url)
  if (!force && hit && Date.now() - hit.time < TTL) {
    return { text: hit.data, cached: true, ageMs: Date.now() - hit.time }
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    cache.set(url, { time: Date.now(), data: text })
    if (cache.size > 200) {
      const now = Date.now()
      for (const [k, v] of cache) if (now - v.time > TTL) cache.delete(k)
    }
    return { text, cached: false, ageMs: 0, costMs: Date.now() - start }
  } finally {
    clearTimeout(timer)
  }
}

/** 相对地址补全为教务处域名绝对地址 */
const abs = (p) =>
  /^(https?:)?\/\//.test(p) || p.startsWith('data:') ? p : JWC + '/' + p.replace(/^\//, '')

/** 正方列表页条目：<div class="column-news-item ..."><span class="column-news-title"><a href='...' title='...'>标题</a></span><span class="column-news-date ...">2026-07-28</span></div> */
function parseList(html, base) {
  const out = []
  const re =
    /<span class="column-news-title"><a[^>]+href='([^']+)'[^>]*>(.*?)<\/a><\/span><span class="column-news-date[^"]*">([^<]*)<\/span>/g
  let m
  while ((m = re.exec(html))) {
    out.push({
      date: (m[3] || '').trim(),
      title: (m[2] || '').replace(/<[^>]+>/g, '').trim(),
      url: new URL(m[1], base).href
    })
  }
  // 兜底：首页样式 <li class="clearfix"> <span class="notice-time">日期</span> <span class="notice-tit"><a ...>标题</a></span> </li>
  if (!out.length) {
    const re2 =
      /<li class="clearfix">\s*<span class="notice-time">([^<]*)<\/span>\s*<span class="notice-tit"><a[^>]+href='([^']+)'[^>]*>(.*?)<\/a><\/span>\s*<\/li>/g
    let m2
    while ((m2 = re2.exec(html))) {
      out.push({
        date: (m2[1] || '').trim(),
        title: (m2[3] || '').replace(/<[^>]+>/g, '').trim(),
        url: new URL(m2[2], base).href
      })
    }
  }
  return out
}

/** 正方列表页分页链接：/tzgg_9107/list2.htm … list66.htm */
function parsePager(html, baseListUrl) {
  const nums = new Set()
  const re = /href="(\/[^"]*list(\d+)\.htm)"/g
  let m
  while ((m = re.exec(html))) {
    const n = Number(m[2])
    if (n > 1 && !/javascript/.test(m[1])) nums.add(n)
  }
  return [...nums].sort((a, b) => b - a).map((n) => baseListUrl.replace(/list\.htm$/, `list${n}.htm`))
}

async function fetchListPages(listUrl, force, pageCount = 4) {
  const firstRes = await fetchText(JWC + listUrl, force)
  const first = firstRes.text
  const items = parseList(first, JWC + listUrl)
  let cached = firstRes.cached
  const seen = new Set(items.map((i) => i.url))
  const pages = parsePager(first, JWC + listUrl)
  for (const p of pages.slice(0, pageCount - 1)) {
    const res = await fetchText(p, force)
    cached = cached || res.cached
    for (const it of parseList(res.text, p)) {
      if (!seen.has(it.url)) {
        seen.add(it.url)
        items.push(it)
      }
    }
  }
  return { items, cached }
}

function parseNoticeDetail(html) {
  const titleRaw = /<title>([^<]*)<\/title>/.exec(html)?.[1] || ''
  const title = (titleRaw
    .replace(/\s*[-—–_]\s*(?:福建师范大学)?教务处\s*$/, '')
    .replace(/\s*[-—–_]\s*(?:福建师范大学)?\s*$/, '')
    .trim() || titleRaw.trim())
  const s = html.indexOf('wp_articlecontent')
  const e = html.indexOf('</div>', s > 0 ? s : 0)
  let body = ''
  if (s >= 0 && e > s) body = html.slice(s + 'wp_articlecontent'.length, e)
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\son\w+/gi, '')
  body = body.replace(/(src|href)="(?!https?:|#|data:)([^"]+)"/g, (_, attr, v) => `${attr}="${abs(v)}"`)
  return { title, body }
}

const nowIso = () => new Date().toISOString()

async function fetchBuf(url, referer) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 30000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA, referer } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

let courseIndex = null
const COURSE_TTL = 12 * 60 * 60 * 1000
const normRoom = (r) => (r || '').replace(/[（(]智慧[)）]/g, '').trim()

const clsSplit = (cls) => {
  const out = []
  for (const s of (cls || '').split(/[,，、]/)) {
    const t = s.trim()
    if (!t) continue
    const m = t.match(/^(.+?)\[(\d{1,2})\s*[-–]\s*(\d{1,2})\](班)?$/)
    if (m) {
      const [, pre, a, b] = m
      for (let n = +a; n <= +b; n++) out.push(`${pre}${String(n).padStart(2, '0')}班`)
    } else {
      out.push(t)
    }
  }
  return out
}

/** 福star课程总表：教务系统需登录，暂无公开 xlsx 课程总表下载。
 *  尽力尝试教务处下载中心/教室使用栏目中的课程总表附件；抓不到时如实降级（返回 null），前端走静态快照空态。 */
async function getCourseIndex(force) {
  if (courseIndex && Date.now() - courseIndex.time < COURSE_TTL && !force) return courseIndex
  // 尝试在下载中心寻找课程总表附件
  const candidates = ['/xzzx/list.htm', '/xzzx/jxglk/list.htm', '/xzzx/jwglk/list.htm', '/xzzx/jczx/list.htm']
  for (const url of candidates) {
    try {
      const { text } = await fetchText(JWC + url, force)
      const m = /课程总表|教学任务|排课表/.test(text)
      if (!m) continue
      const dl = /href="([^"]*(?:_upload|download)[^"]*)"/.exec(text)?.[1] || /href="([^"]+\.(?:xlsx|xls))"/i.exec(text)?.[1]
      if (!dl) continue
      const dlUrl = new URL(dl, JWC + url).href
      const buf = await fetchBuf(dlUrl, JWC + url)
      const tmp = path.join(os.tmpdir(), `kcb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.xlsx`)
      fs.writeFileSync(tmp, buf)
      let parsed
      try {
        const { stdout } = await execFileP(PY, [PARSE_PY, tmp], { maxBuffer: 64 * 1024 * 1024 })
        parsed = JSON.parse(stdout)
      } finally {
        fs.rmSync(tmp, { force: true })
      }
      const byRoom = new Map()
      for (const r of parsed.rows) {
        if (!r.r) continue
        const nr = normRoom(r.r)
        if (!byRoom.has(nr)) byRoom.set(nr, [])
        byRoom.get(nr).push(r)
      }
      const semester = '当前学期'
      courseIndex = { time: Date.now(), semester, count: parsed.count, rows: parsed.rows, byRoom, latestUrl: dlUrl }
      return courseIndex
    } catch (e) {
      // 单个候选失败继续尝试
    }
  }
  return null
}

const PERIOD_MAX = 12

const routes = {
  async '/api/health'() {
    return { ok: true, time: nowIso() }
  },
  async '/api/notices'(q) {
    const force = q.get('force') === '1'
    const all = q.get('all') === '1'
    if (all) {
      const { items, cached: allCached } = await fetchListPages(NOTICE_LIST, force)
      return { source: JWC, fetchedAt: nowIso(), cached: allCached, costMs: 0, ttl: TTL, items }
    }
    const { text, cached, ageMs, costMs } = await fetchText(JWC + '/main.htm', force)
    // 首页「通知公告」区块
    const out = []
    const re =
      /<li class="clearfix">\s*<span class="notice-time">([^<]*)<\/span>\s*<span class="notice-tit"><a[^>]+href='([^']+)'[^>]*>(.*?)<\/a><\/span>\s*<\/li>/g
    let m
    while ((m = re.exec(text))) {
      out.push({
        date: (m[1] || '').trim(),
        title: (m[3] || '').replace(/<[^>]+>/g, '').trim(),
        url: new URL(m[2], JWC + '/main.htm').href
      })
    }
    return { source: JWC, fetchedAt: nowIso(), cached, ageMs, costMs, ttl: TTL, items: out }
  },
  async '/api/news'(q) {
    const force = q.get('force') === '1'
    const { text, cached, ageMs, costMs } = await fetchText(JWC + '/main.htm', force)
    // 首页「工作动态」区块
    const out = []
    const re =
      /<li class="clearfix">\s*<span class="notice-time">([^<]*)<\/span>\s*<span class="notice-tit"><a[^>]+href='([^']+)'[^>]*>(.*?)<\/a><\/span>\s*<\/li>/g
    let m
    const all = []
    while ((m = re.exec(text))) {
      all.push({
        date: (m[1] || '').trim(),
        title: (m[3] || '').replace(/<[^>]+>/g, '').trim(),
        url: new URL(m[2], JWC + '/main.htm').href
      })
    }
    // 工作动态通常是从 index 起第二条列表（通知公告在前）；简单取第 8 条之后
    out.push(...all.slice(8))
    return { source: JWC, fetchedAt: nowIso(), cached, ageMs, costMs, ttl: TTL, items: out }
  },
  async '/api/calendar'(q) {
    const force = q.get('force') === '1'
    const { text, cached, ageMs, costMs } = await fetchText(JWC + CALENDAR_LIST, force)
    return { source: JWC, fetchedAt: nowIso(), cached, ageMs, costMs, ttl: TTL, items: parseList(text, JWC + CALENDAR_LIST) }
  },
  async '/api/cseNews'(q) {
    const force = q.get('force') === '1'
    const first = await fetchText(CSE + CSE_LIST, force)
    const items = parseCseList(first.text, CSE + CSE_LIST)
    let cached = first.cached
    // 第二页（存在时）
    if (items.length) {
      try {
        const res2 = await fetchText(CSE + '/tzgg/list2.htm', force)
        cached = cached || res2.cached
        for (const it of parseCseList(res2.text, CSE + '/tzgg/list2.htm')) {
          if (!items.some((x) => x.url === it.url)) items.push(it)
        }
      } catch { /* 第二页可能不存在 */ }
    }
    return { source: CSE, fetchedAt: nowIso(), cached, ageMs: first.ageMs, costMs: first.costMs, ttl: TTL, items }
  },
  async '/api/courses'(q) {
    const force = q.get('force') === '1'
    const { text, cached, ageMs, costMs } = await fetchText(JWC + '/xzzx/list.htm', force)
    return { source: JWC, fetchedAt: nowIso(), cached, ageMs, costMs, ttl: TTL, items: parseList(text, JWC + '/xzzx/list.htm') }
  },
  async '/api/notice'(q) {
    const id = q.get('id')
    const force = q.get('force') === '1'
    const host = q.get('host') === 'ccs' ? CSE : JWC
    if (!id || !/^[a-z0-9/_.]+$/i.test(id)) return { ok: false, error: 'need valid id' }
    const url = host + '/' + id.replace(/^\//, '')
    const { text, cached, ageMs, costMs } = await fetchText(url, force)
    return { source: host, sourceUrl: url, fetchedAt: nowIso(), cached, ageMs, costMs, ttl: TTL, ...parseNoticeDetail(text) }
  },
  async '/api/systems'() {
    return {
      items: [
        { name: '新版教务系统（正方）', url: XJW, desc: '选课 / 成绩 / 课表' },
        { name: '教学云平台', url: 'http://fjnu.fanya.chaoxing.com/portal', desc: '在线课程与教学资源' },
        { name: '智慧教育平台', url: 'https://zhihui.fjnu.edu.cn/', desc: '智慧教育服务' }
      ]
    }
  },
  async '/api/courseTable'(q) {
    const force = q.get('force') === '1'
    const idx = await getCourseIndex(force)
    if (!idx) return { ok: false, error: '课程总表暂不可用（教务系统需登录，暂无公开附件）' }
    return {
      semester: idx.semester,
      count: idx.count,
      rooms: idx.byRoom.size,
      updatedAt: new Date(idx.time).toISOString(),
      cached: Date.now() - idx.time < COURSE_TTL,
      latestUrl: idx.latestUrl
    }
  },
  async '/api/roomSchedule'(q) {
    const force = q.get('force') === '1'
    const room = normRoom(q.get('room') || '')
    if (!room) return { ok: false, error: 'need room' }
    const idx = await getCourseIndex(force)
    if (!idx) return { ok: false, error: '课程总表暂不可用' }
    const list = idx.byRoom.get(room) || []
    list.sort((a, b) => a.d - b.d || a.s - b.s)
    return { semester: idx.semester, room, count: list.length, schedule: list }
  },
  async '/api/emptyRooms'(q) {
    const force = q.get('force') === '1'
    const day = Number(q.get('day'))
    const period = Number(q.get('period'))
    const kw = (q.get('kw') || '').trim()
    if (!day || day < 1 || day > 7 || !period || period < 1 || period > PERIOD_MAX)
      return { ok: false, error: 'need day(1-7) and period(1-12)' }
    const idx = await getCourseIndex(force)
    if (!idx) return { ok: false, error: '课程总表暂不可用' }
    const busy = new Set()
    for (const [room, list] of idx.byRoom) {
      if (list.some((r) => r.d === day && period >= r.s && period <= r.e)) busy.add(room)
    }
    let all = [...idx.byRoom.keys()]
    if (kw) all = all.filter((r) => r.includes(kw))
    const empty = all.filter((r) => !busy.has(r)).sort()
    return { semester: idx.semester, day, period, total: all.length, emptyCount: empty.length, rooms: empty }
  },
  async '/api/courseQuery'(q) {
    const force = q.get('force') === '1'
    const kw = (q.get('q') || '').trim()
    if (!kw) return { ok: false, error: 'need q' }
    const idx = await getCourseIndex(force)
    if (!idx) return { ok: false, error: '课程总表暂不可用' }
    const hits = idx.rows.filter((r) => clsSplit(r.cls).includes(kw) || r.c.includes(kw) || r.t.includes(kw))
    return { semester: idx.semester, q: kw, count: hits.length, rows: hits.slice(0, 200) }
  },
  // 食堂空座率：尽力抓取福star「食堂人流量分析」接口（校园网环境），否则返回静态快照数据
  async '/api/canteen'(q) {
    // 校园网环境接口（如存在）：形如 https://canteen.fjnu.edu.cn/api/... ；抓不到时返回空由前端读快照
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch('https://canteen.fjnu.edu.cn/api/live', { signal: ctrl.signal, headers: { 'User-Agent': UA } })
      clearTimeout(timer)
      if (res.ok) {
        const d = await res.json()
        if (d && Array.isArray(d.items)) return { status: 'live', updatedAt: nowIso(), items: d.items }
      }
    } catch (e) { /* 校外环境抓不到，走快照 */ }
    return { status: 'snapshot', updatedAt: null, items: [] }
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
}

function serveStatic(req, res, urlPath) {
  let p
  try {
    p = decodeURIComponent(urlPath)
  } catch {
    p = urlPath
  }
  const file = path.join(DIST, p === '/' ? 'index.html' : p)
  if (!file.startsWith(DIST)) {
    res.writeHead(403)
    return res.end()
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(DIST, 'index.html'), (err2, html) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          return res.end('Not Found（请先 npm run build）')
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] })
        res.end(html)
      })
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' })
    res.end(data)
  })
}

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('Method Not Allowed')
  }
  const u = new URL(req.url, 'http://localhost')
  const urlPath = u.pathname
  if (urlPath.startsWith('/api/')) {
    const handler = routes[urlPath]
    if (handler) {
      try {
        json(res, 200, await handler(u.searchParams))
      } catch (e) {
        console.error(`[fjnu-nav] /api 错误 ${urlPath}:`, e.message)
        json(res, 502, { ok: false, error: e.message })
      }
      return
    }
    return json(res, 404, { ok: false, error: 'not found' })
  }
  serveStatic(req, res, urlPath)
})

server.listen(PORT, () => {
  console.log(`[fjnu-nav] 服务已启动：http://localhost:${PORT}`)
  console.log(`[fjnu-nav] API 网关：${JWC} / ${XJW}`)
})