/**
 * APK 网页层冒烟：node scripts/e2e-standalone.mjs
 *
 * @职责  对 public/standalone-schedule.html（APK 里真正跑的那个单文件课表）做真机验证：
 *        ① 页面能正常初始化并渲染周课表；② 深链 ?view=today|next|week 生效；
 *        ③ 表格/单日列表可切换；④ localStorage 被写脏时不崩；⑤ 全程零 JS 运行时错误。
 *        这个文件此前**没有任何自动化验证**（全靠人工按 references/apk.md 走查）。
 * @用法  node scripts/e2e-standalone.mjs（缺 playwright-core / 浏览器时 SKIP，不拦本地）
 * @说明  自带零依赖静态服务器托管 public/（不需要 python / 不需要网关）。
 */
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUB = path.join(ROOT, 'public')
const PORT = Number(process.env.PORT || 8797)
const SHOTS = path.join(os.tmpdir(), 'nav-e2e-shots')

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' }
const CHROME = [
  process.env.CHROME_PATH,
  path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe'),
  path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1208', 'chrome-win64', 'chrome.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome'
].filter(Boolean)

let pass = 0
let fail = 0
const log = (s) => process.stdout.write(s + '\n')

async function main() {
  if (!fs.existsSync(path.join(PUB, 'standalone-schedule.html'))) {
    log('e2e-standalone: SKIP（找不到 public/standalone-schedule.html）')
    process.exit(0)
  }
  let pw = null
  try { pw = await import('playwright-core') } catch {
    log('e2e-standalone: SKIP（无 playwright-core）')
    process.exit(0)
  }
  const exe = CHROME.find((p) => { try { return fs.existsSync(p) } catch { return false } })
  if (!exe) {
    log('e2e-standalone: SKIP（找不到浏览器；CHROME_PATH 可指定）')
    process.exit(0)
  }

  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0])
    let f = path.join(PUB, url)
    if (!f.startsWith(PUB)) { res.writeHead(403); res.end(); return }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' })
    fs.createReadStream(f).pipe(res)
  })
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r))
  const BASE = `http://127.0.0.1:${PORT}`

  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
  const errs = []
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.on('pageerror', (e) => errs.push(String(e && e.message)))

  const assert = (c, m) => { if (!c) throw new Error(m || '断言失败') }
  async function ok(name, fn) {
    try { await fn(); pass++; log('  PASS  ' + name) } catch (e) {
      fail++
      log('  FAIL  ' + name + ' → ' + String(e && e.message).slice(0, 240))
      try { await page.screenshot({ path: path.join(SHOTS, 'standalone-' + name.replace(/\W+/g, '_') + '.png') }) } catch { /* noop */ }
    }
  }
  const body = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ')

  try {
    await ok('独立课表页正常初始化并渲染', async () => {
      await page.goto(`${BASE}/standalone-schedule.html`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(1200)
      const t = await body()
      assert(t.length > 20, '页面几乎是空的：' + t.slice(0, 80))
      assert(await page.locator('#tableContainer').count() === 1, '缺少周课表容器')
    })

    await ok('周课表渲染出课程格或空态说明', async () => {
      const cells = await page.locator('#tableContainer td').count()
      assert(cells > 20, '课表单元格过少：' + cells)
    })

    await ok('深链 ?view=today 切到单日列表', async () => {
      await page.goto(`${BASE}/standalone-schedule.html?view=today`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(1200)
      const listDisplay = await page.locator('#dayList').evaluate((el) => getComputedStyle(el).display)
      const tblDisplay = await page.locator('#tableContainer').evaluate((el) => getComputedStyle(el).display)
      assert(listDisplay !== 'none', '单日列表未显示（display=' + listDisplay + '）')
      assert(tblDisplay === 'none', '周课表未隐藏（display=' + tblDisplay + '）')
    })

    await ok('深链 ?view=week 回到周课表', async () => {
      await page.goto(`${BASE}/standalone-schedule.html?view=week`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(1000)
      const tblDisplay = await page.locator('#tableContainer').evaluate((el) => getComputedStyle(el).display)
      assert(tblDisplay !== 'none', '周课表未显示')
    })

    await ok('深链 ?view=next 不报错且定位到卡片', async () => {
      await page.goto(`${BASE}/standalone-schedule.html?view=next`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(1200)
      assert(await page.locator('#nextCard').count() === 1, '缺少下一节课卡片')
    })

    await ok('非法/缺参深链静默忽略（回落到默认视图）', async () => {
      await page.goto(`${BASE}/standalone-schedule.html?view=__bad__`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(900)
      assert((await body()).length > 20, '页面应正常渲染')
    })

    await ok('localStorage 被写脏时仍能启动', async () => {
      await page.goto(`${BASE}/standalone-schedule.html`, { waitUntil: 'load', timeout: 30000 })
      await page.evaluate(() => {
        localStorage.setItem('sche_pet', '{不是合法 JSON')
        localStorage.setItem('sche_state', '###')
        localStorage.setItem('sche_adjustments', 'none')
      })
      const errsBefore = errs.length
      await page.goto(`${BASE}/standalone-schedule.html`, { waitUntil: 'load', timeout: 30000 })
      await page.waitForTimeout(1200)
      assert((await body()).length > 20, '脏存储下页面未渲染')
      const added = errs.slice(errsBefore).filter((m) => !/favicon|net::ERR/.test(m))
      assert(added.length === 0, '脏存储触发了未捕获异常：' + added.slice(0, 2).join(' | '))
    })

    // ───────── APK 配套能力（返回键 / 电池优化引导）─────────
    await ok('返回键钩子：默认视图交还原生', async () => {
      await page.goto(BASE + '/standalone-schedule.html', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)
      const r = await page.evaluate(() => {
        try {
          return { has: typeof window.__feikeBack === 'function', ret: window.__feikeBack() }
        } catch (e) {
          return { err: String(e) }
        }
      })
      assert(r.has, '页面未暴露 __feikeBack（原生返回键会盲目退出应用）')
      assert(r.ret === false, '周课表视图应返回 false（交还原生退出），实际：' + JSON.stringify(r))
    })

    await ok('返回键钩子：先关弹层，再把单日视图退回周课表', async () => {
      const closed = await page.evaluate(() => {
        const el = document.getElementById('moreMenu')
        if (!el) return 'no-moreMenu'
        el.classList.add('show')
        const consumed = window.__feikeBack()
        return { consumed, stillOpen: el.classList.contains('show') }
      })
      assert(closed !== 'no-moreMenu', '找不到 moreMenu，弹层 id 可能改名了')
      assert(closed.consumed === true && closed.stillOpen === false, '弹层应被关闭并消费返回键：' + JSON.stringify(closed))

      const grid = await page.evaluate(() => {
        try {
          state.viewMode = 'list'
          saveState()
          render()
          const consumed = window.__feikeBack()
          return { consumed, mode: state.viewMode }
        } catch (e) {
          return { err: String(e) }
        }
      })
      assert(grid.consumed === true && grid.mode === 'grid', '单日视图按返回应回到周课表：' + JSON.stringify(grid))
    })

    await ok('电池优化引导：未加白名单时提示、点「去设置」调原生后不再打扰', async () => {
      await page.goto(BASE + '/standalone-schedule.html', { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => {
        localStorage.removeItem('sche_battery_tip')
        window.__openedBattery = false
        window.FeikeNative = { isIgnoringBattery: () => false, openBatterySettings: () => { window.__openedBattery = true } }
        maybeBatteryTip()
      })
      // 页面故意延迟 1.5s 才弹（避免刚打开就打扰用户），所以这里要等够
      await page.waitForTimeout(2200)
      const shown = await page.evaluate(() => document.getElementById('batteryTip').classList.contains('show'))
      assert(shown === true, '未加白名单时应弹出引导条')

      await page.evaluate(() => openBatterySettings())
      const after = await page.evaluate(() => ({
        opened: !!window.__openedBattery,
        hidden: !document.getElementById('batteryTip').classList.contains('show'),
        remembered: !!localStorage.getItem('sche_battery_tip')
      }))
      assert(after.opened, '点「去设置」应调用原生 openBatterySettings')
      assert(after.hidden, '点击后引导条应收起')
      assert(after.remembered, '应记住已提示过，不再重复打扰')

      const again = await page.evaluate(() => {
        localStorage.removeItem('sche_battery_tip')
        window.FeikeNative = { isIgnoringBattery: () => true }
        maybeBatteryTip()
        return document.getElementById('batteryTip').classList.contains('show')
      })
      assert(again === false, '已在白名单里就不该再提示')
    })

    // ───────── 列表模式：星期标签与今日定位（曾出现整格错位/偏一天）─────────
    await ok('列表模式：星期标签不串位，且今日高亮落在真实的星期上', async () => {
      await page.goto(BASE + '/standalone-schedule.html', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)
      await page.evaluate(() => { state.viewMode = 'list'; saveState(); render() })
      await page.waitForTimeout(400)
      const info = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('.day-chip'))
        const g = new Date().getDay()
        return {
          count: chips.length,
          labels: chips.map((c) => (c.querySelector('b') || {}).textContent || ''),
          todayIdx: chips.findIndex((c) => c.classList.contains('today')),
          onIdx: chips.findIndex((c) => c.classList.contains('on')),
          jsWeekday: g === 0 ? 7 : g
        }
      })
      assert(info.count === 7, '应有 7 个星期按钮，实际 ' + info.count)
      // 修前：数组多了前导空串，导致周一显示空白、周二显示「一」…周日显示「六」
      assert(['一', '今'].includes(info.labels[0]), '第 1 个(周一)标签应为「一」(或今天的「今」)，实际：' + JSON.stringify(info.labels[0]))
      assert(['日', '今'].includes(info.labels[6]), '第 7 个(周日)标签应为「日」(或今天的「今」)，实际：' + JSON.stringify(info.labels[6]))
      // 今日高亮必须落在真实星期（修前会偏一天或整个落空）
      assert(info.todayIdx === info.jsWeekday - 1,
        `今日高亮应在索引 ${info.jsWeekday - 1}（今天第 ${info.jsWeekday} 天），实际 ${info.todayIdx}`)
      // 刚切进列表模式时，默认选中日就是今天
      assert(info.onIdx === info.todayIdx, `默认选中应为今天(索引 ${info.todayIdx})，实际选中 ${info.onIdx}`)
    })

    await ok('深链 ?view=today 定位到真正的今天（不偏一天）', async () => {
      await page.goto(BASE + '/standalone-schedule.html?view=today', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(900)
      const r = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('.day-chip'))
        const g = new Date().getDay()
        return { listDay: state.listDay, onIdx: chips.findIndex((c) => c.classList.contains('on')), expect: (g === 0 ? 7 : g) - 1 }
      })
      assert(r.listDay >= 1 && r.listDay <= 7, 'listDay 必须是 1-7 的约定，实际 ' + r.listDay)
      assert(r.onIdx === r.expect, `深链应选中今天（索引 ${r.expect}），实际 ${r.onIdx}`)
    })

    // ───────── 远程课表下发：改课表不需要发新版 APK ─────────
    // 拦截线上数据地址，下发一份「删掉当代科技 + 加一门标记课」的课表，
    // 页面必须采用它（而不是包内内置数据）—— 这直接证明线上改数据即生效。
    await ok('线上课表优先：远程下发即生效（不更新 App 也能换课表）', async () => {
      const payload = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/schedule-data.json'), 'utf8'))
      const target = payload.courses.find((c) => c.id === 'TECH-001') || payload.courses[0]
      const mark = '远程下发验证课'
      payload.courses = payload.courses
        .filter((c) => c.id !== 'TECH-001')
        .concat([{ ...target, id: 'REMOTE-TEST-1', name: mark }])

      const pattern = '**/FJNU-Nav/data/schedule-data.json*'
      await page.route(pattern, (route) => route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(payload)
      }))
      try {
        await page.goto(BASE + '/standalone-schedule.html', { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(2500)
        const got = await page.evaluate((m) => {
          const dump = typeof ALL_COURSES !== 'undefined' ? JSON.stringify(ALL_COURSES) : ''
          return { hasMark: dump.includes(m), hasTech: dump.includes('当代科技') }
        }, mark)
        assert(got.hasMark, '页面没有采用线上下发的课表（仍在用包内内置数据）')
        assert(!got.hasTech, '页面仍在显示已被线上数据删除的「当代科技」')
      } finally {
        await page.unroute(pattern)
      }
    })

    await ok('全程无未捕获 JS 错误', async () => {
      const real = errs.filter((m) => !/favicon|net::ERR/.test(m))
      assert(real.length === 0, real.slice(0, 3).join(' | '))
    })
  } finally {
    await browser.close()
    server.close()
  }

  log('')
  log(`e2e-standalone: pass=${pass} fail=${fail}`)
  if (fail) log(`失败截图目录：${SHOTS}`)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => {
  log('e2e-standalone: FATAL ' + (e && e.stack ? e.stack : e))
  process.exit(1)
})
