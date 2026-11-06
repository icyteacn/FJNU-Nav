// 全路由自动审计：溢出/空页/JS错误/4xx/截图 五联检
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import * as pw from 'playwright-core'

const DIST = 'dist'
const OUT = 'C:\\Users\\Administrator\\_work\\audit-fjnu'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.map': 'application/json' }
fs.mkdirSync(OUT, { recursive: true })
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  let f = path.join(DIST, p)
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f))
})
await new Promise(r => srv.listen(0, r))
const PORT = srv.address().port

// 路由表与 _smoke 同源
const ROUTES = ['home', 'assistant', 'campusWall', 'reminder', 'insights', 'rebrand', 'skills', 'aboutagent', 'importer', 'buildingGallery', 'messages', 'focus', 'data', 'jobs', 'compare', 'flywheel', 'transplant', 'profile', 'orientationSchedule', 'graduatePlan', 'campusNews', 'timetable', 'studentId', 'physicalTest', 'calendar', 'whatToEat', 'classroomNav', 'canteen', 'quiz', 'foodWheel', 'officialSites', 'categories', 'buildingMatch', 'leaderTest', 'courseStats', 'budget', 'tiebaSentiment', 'contributors', 'branchWork']
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await pw.chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const report = {}
for (const name of ROUTES) {
  for (const [tag, w, h] of [['pc', 1440, 900], ['m', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    const es = []
    page.on('pageerror', e => es.push('pageerror:' + e.message.slice(0, 120)))
    page.on('response', r => { if (r.status() >= 400) es.push(`HTTP${r.status()} ${r.url().slice(-55)}`) })
    try {
      await page.addInitScript(() => { try { sessionStorage.setItem('fjnu_welcome_seen', '1') } catch {} })
      await page.goto(`http://127.0.0.1:${PORT}/index.html#/${name === 'home' ? '' : 'app/' + name}`, { waitUntil: 'domcontentloaded', timeout: 25000 })
      await page.waitForTimeout(900)
      const skip = page.locator('text=跳过')
      if (await skip.count()) { await skip.first().click().catch(() => {}); await page.waitForTimeout(400) }
      await page.waitForTimeout(1500)
      const info = await page.evaluate(() => {
        const el = document.scrollingElement || document.documentElement
        const txt = (document.body.innerText || '').trim()
        return {
          overflowX: el.scrollWidth > document.documentElement.clientWidth + 2,
          textLen: txt.length,
          title: (document.querySelector('h1,h2,.page-title,.card h3') || {}).textContent || '',
          imgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length
        }
      })
      await page.screenshot({ path: path.join(OUT, `${name}-${tag}.png`) })
      report[`${name}-${tag}`] = { ...info, errors: es }
    } catch (e) { report[`${name}-${tag}`] = { errors: ['goto:' + e.message.slice(0, 100)] } }
    await page.close()
    console.log(name, tag)
  }
}
fs.writeFileSync(path.join(OUT, '_report.json'), JSON.stringify(report, null, 1))
const flagged = Object.entries(report).filter(([k, v]) => v.errors?.length || v.overflowX || (v.textLen ?? 99) < 30 || v.imgs > 2)
console.log('\n=== FLAGGED', flagged.length)
flagged.forEach(([k, v]) => console.log(k, JSON.stringify(v).slice(0, 220)))
await browser.close(); srv.close()
