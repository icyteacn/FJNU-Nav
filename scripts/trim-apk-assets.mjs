/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  scripts/trim-apk-assets.mjs
 * @职责      APK 资产裁剪：cap sync 会把整个 dist 拷进安装包（2.7MB+），
 *            但课表 App 只用得上三样东西。本脚本在 gradle 打包前把
 *            android/app/src/main/assets/public 裁到白名单，避免包体虚胖。
 * @白名单    ① standalone-schedule.html  课表单文件（APK 实际界面）
 *            ② data/schedule-data.json   课表数据接口（离线回退用）
 *            ③ index.html                由本脚本生成的最小跳转入口
 *            （Capacitor 默认加载 index.html，需跳到课表单文件）
 * @用法      node scripts/trim-apk-assets.mjs（已链入 scripts/build-apk.bat）
 * ════════════════════════════════════════════════════════════════════
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUB = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public')

function dirSize(p) {
  if (!fs.existsSync(p)) return 0
  let total = 0
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, e.name)
    total += e.isDirectory() ? dirSize(full) : fs.statSync(full).size
  }
  return total
}

if (!fs.existsSync(PUB)) {
  console.error('  trim-apk-assets: 未找到 assets/public（先跑 npx cap sync android）')
  process.exit(1)
}

const before = dirSize(PUB)
const KB = (n) => (n / 1024).toFixed(1) + ' KB'

// 1) 白名单外一律删除；data/ 目录只留接口文件
for (const entry of fs.readdirSync(PUB, { withFileTypes: true })) {
  const full = path.join(PUB, entry.name)
  if (entry.name === 'standalone-schedule.html') continue
  if (entry.isDirectory() && entry.name === 'data') {
    for (const f of fs.readdirSync(full)) {
      if (f !== 'schedule-data.json') fs.rmSync(path.join(full, f), { recursive: true, force: true })
    }
    continue
  }
  fs.rmSync(full, { recursive: true, force: true })
}

// 2) 最小入口：Capacitor 加载 index.html → 立即跳到课表单文件
//    （用内联脚本而非 meta refresh，避免 WebView 闪烁；不引用任何外部资源）
const shell = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>🐔🩸课表</title>
</head>
<body>
  <script>location.replace('standalone-schedule.html' + location.search + location.hash)</script>
</body>
</html>
`
fs.writeFileSync(path.join(PUB, 'index.html'), shell, 'utf8')

const after = dirSize(PUB)
const files = []
;(function walk(p, prefix = '') {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(p, e.name), prefix + e.name + '/')
    else files.push(prefix + e.name)
  }
})(PUB)

console.log(`  trim-apk-assets: ${KB(before)} → ${KB(after)}（省 ${KB(before - after)}）`)
console.log('  trim-apk-assets: 保留文件 → ' + files.join(', '))
if (!files.includes('standalone-schedule.html')) {
  console.error('  trim-apk-assets: 错误——课表单文件不在包内')
  process.exit(1)
}
