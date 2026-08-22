// 生成静态数据快照 public/data/snapshot.json
// 供 GitHub Pages 等纯静态托管使用：前端 apiFetch 请求网关失败时回退到本快照。
// 运行：node scripts/snapshot.mjs
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const execFileP = promisify(execFile)
const PY = process.env.PYTHON || 'python'
const PARSE_PY = process.env.PARSE_PY || path.join(__dirname, '..', 'server', 'parse_kcb.py')
const JWC = 'https://jwc.fjnu.edu.cn'
const NOTICE_LIST = '/tzgg_9107/list.htm'
const NEWS_LIST = '/430/list.htm'
const CALENDAR_LIST = '/jxrl/list.htm'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function fetchText(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { text: await res.text() }
  } finally {
    clearTimeout(timer)
  }
}

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

// 正方列表页条目
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

function parseNews(html, base) {
  return parseList(html, base)
}

// 教务处通知列表前 N 页合并去重
async function fetchNoticePages(pageCount = 4) {
  const firstUrl = JWC + NOTICE_LIST
  const first = (await fetchText(firstUrl)).text
  const items = parseList(first, firstUrl)
  const seen = new Set(items.map((i) => i.url))
  const pager = [...first.matchAll(/href="(\/[^"]*list(\d+)\.htm)"/g)]
    .map((m) => ({ href: m[1], n: Number(m[2]) }))
    .filter((p) => p.n > 1 && !/javascript/.test(p.href))
    .sort((a, b) => b.n - a.n)
    .filter((p, i, arr) => arr.findIndex((x) => x.n === p.n) === i)
  for (const p of pager.slice(0, pageCount - 1)) {
    const url = new URL(p.href, JWC).href
    const html = (await fetchText(url)).text
    for (const it of parseList(html, url)) {
      if (!seen.has(it.url)) {
        seen.add(it.url)
        items.push(it)
      }
    }
  }
  return items
}

const normRoom = (r) => (r || '').replace(/[（(]智慧[)）]/g, '').trim()

// 福star教务系统需登录，公开课程总表可能缺失 → 尽力尝试，失败返回空
async function getCourses() {
  const results = []
  for (const listPath of ['/xzzx/list.htm', '/xzzx/jxglk/list.htm', '/xzzx/jwglk/list.htm', '/xzzx/jczx/list.htm']) {
    try {
      const listHtml = (await fetchText(JWC + listPath)).text
      if (!/课程总表|教学任务|排课表/.test(listHtml)) continue
      const dl = /href="([^"]+\.(?:xlsx|xls))"/i.exec(listHtml)?.[1] || /href="([^"]*download[^"]*)"/i.exec(listHtml)?.[1]
      if (!dl) continue
      const dlUrl = new URL(dl, JWC + listPath).href
      const buf = await fetchBuf(dlUrl, JWC + listPath)
      const tmp = path.join(os.tmpdir(), `kcb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.xlsx`)
      fs.writeFileSync(tmp, buf)
      let parsed
      try {
        const { stdout } = await execFileP(PY, [PARSE_PY, tmp], { maxBuffer: 64 * 1024 * 1024 })
        parsed = JSON.parse(stdout)
      } finally {
        fs.rmSync(tmp, { force: true })
      }
      results.push({ semester: '当前学期', title: '福建师范大学课程总表', count: parsed.count, url: dlUrl, rows: parsed.rows })
      console.log(`  ${results[results.length - 1].title}: ${parsed.count} 条`)
      if (results.length) break
    } catch (e) {
      console.warn(`skip 课程总表(${listPath}): ${e.message}`)
    }
  }
  return results
}

const [courses, notices, news, calendar, courseTables] = await Promise.all([
  fetchText(JWC + '/xzzx/list.htm').then(({ text }) => ({ items: parseList(text, JWC + '/xzzx/list.htm') })),
  fetchNoticePages().then((items) => ({ items })),
  fetchText(JWC + NEWS_LIST).then(({ text }) => ({ items: parseNews(text, JWC + NEWS_LIST) })),
  fetchText(JWC + CALENDAR_LIST).then(({ text }) => ({ items: parseList(text, JWC + CALENDAR_LIST) })),
  getCourses()
])

const latest = courseTables[0] || null
const mergedRows = []
for (const t of courseTables) {
  const term = t.semester
  for (const row of t.rows) {
    mergedRows.push({
      c: row.c, t: row.t, cls: row.cls, d: row.d, s: row.s, e: row.e, w: row.w, r: row.r, term,
      col: row.col || '', campus: row.campus || '', kind: row.kind || '',
      cat: row.cat || '', credit: row.credit || '', weeks: row.weeks || ''
    })
  }
}
const allRooms = new Set(mergedRows.map((r) => r.r && normRoom(r.r)).filter(Boolean)).size

const snap = {
  updatedAt: new Date().toISOString(),
  source: JWC,
  courses,
  notices,
  news,
  calendar,
  courseTables: courseTables.map((t) => ({ semester: t.semester, title: t.title, count: t.count, url: t.url })),
  courseTable: {
    semester: latest ? latest.semester : '',
    count: latest ? latest.count : 0,
    rooms: allRooms,
    updatedAt: new Date().toISOString(),
    cached: true,
    latestUrl: latest ? latest.url : ''
  },
  rows: mergedRows
}

const outDir = path.join(__dirname, '..', 'public', 'data')
fs.mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, 'snapshot.json')
fs.writeFileSync(outFile, JSON.stringify(snap))
console.log(`snapshot written: ${outFile}`)
console.log(`courseTable: ${snap.courseTable.semester} / ${snap.courseTable.count} 条 / ${snap.courseTable.rooms} 教室（${snap.courseTables.length} 个学期并集）`)
console.log(`courses ${snap.courses.items.length} / notices ${snap.notices.items.length} / news ${snap.news.items.length} / calendar ${snap.calendar.items.length}`)
console.log(`size: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`)