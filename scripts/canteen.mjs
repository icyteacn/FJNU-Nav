// 福建师范大学食堂空座率抓取（Node 版，crawler/canteen.py 的回退实现）
// 尽力抓取福师大「食堂人流量分析」接口（校园网环境），输出 public/data/canteen_live.json。
// 失败不覆盖旧数据（尽力而为），以非零码退出。
// 运行：node scripts/canteen.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'data', 'canteen_live.json')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const CANDIDATE_URLS = [
  'https://canteen.fjnu.edu.cn/api/live',
  'https://fstar.fjnu.edu.cn/api/canteen/live'
]

function normalize(rawItems) {
  const out = []
  for (const it of rawItems || []) {
    if (!it || typeof it !== 'object') continue
    const name = it.name || it.canteen || it.title || ''
    const people = it.people ?? it.count ?? it.current ?? 0
    const seats = it.seats ?? it.capacity ?? 0
    const daily = it.daily ?? it.consumes ?? it.consumption ?? 0
    if (!name) continue
    out.push({ name, people: Number(people) || 0, seats: Number(seats) || 0, daily: Number(daily) || 0 })
  }
  return out
}

async function main() {
  let lastErr = null
  for (const url of CANDIDATE_URLS) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 10000)
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } })
      clearTimeout(timer)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const d = await res.json()
      const items = normalize(Array.isArray(d) ? d : d.items)
      if (!items.length) throw new Error('empty items')
      const snap = {
        status: 'live',
        updatedAt: new Date().toISOString(),
        items
      }
      fs.mkdirSync(path.dirname(OUT), { recursive: true })
      fs.writeFileSync(OUT, JSON.stringify(snap))
      console.log(`canteen live written: ${OUT} (${items.length} 家)`)
      return
    } catch (e) {
      lastErr = e
    }
  }
  if (fs.existsSync(OUT)) console.log('canteen live unavailable（校园网环境），保留上一次快照')
  else console.log('canteen live unavailable（校园网环境），无旧快照')
  console.log('last error:', lastErr ? lastErr.message : 'n/a')
  process.exit(1)
}

main()