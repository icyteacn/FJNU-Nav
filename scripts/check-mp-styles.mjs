/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  scripts/check-mp-styles.mjs
 * @职责      小程序样式防回归门禁（mp-schedule / mp-weixin）。
 *            v1.3.1 曾把 4 个页面的 .wxss 清成 0 字节，线上表现为
 *            「只有文字没有布局」，因此这里硬性检查：
 *            ① 每个 .wxss 必须存在且非空（≥ 200 字节）
 *            ② wxml 里静态 class 必须在 app.wxss 或本页 wxss 有定义
 *            ③ 课表页关键能力样式（今日列/深色/单色）必须存在
 * @用法      node scripts/check-mp-styles.mjs（CI deploy 前置）
 * ════════════════════════════════════════════════════════════════════
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const MIN_WXSS_BYTES = 200

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '')

/** 提取样式表里定义过的 class 名（含 `.a.b` 复合写法） */
function definedClasses(css) {
  const out = new Set()
  const re = /\.(-?[A-Za-z_][\w-]*)/g
  let m
  while ((m = re.exec(css))) out.add(m[1])
  return out
}

/**
 * 提取 wxml 中静态 class。
 * {{...}} 先换成占位符：`lv{{c.lv}}` 这类拼接片段会被跳过，
 * 避免把动态值（course/live/lv1…）误判为缺失样式。
 */
function usedClasses(wxml) {
  const out = new Set()
  const re = /class\s*=\s*"([^"]*)"/g
  let m
  while ((m = re.exec(wxml))) {
    const raw = m[1].replace(/\{\{[^}]*\}\}/g, '\u0000')
    for (const t of raw.split(/\s+/)) {
      if (!t || t.includes('\u0000')) continue
      out.add(t)
    }
  }
  return out
}

/** 仓库根下所有小程序目录（含 app.json 的） */
function miniPrograms() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, e.name, 'app.json')))
    .map((e) => path.join(ROOT, e.name))
}

const errors = []
let wxssCount = 0

for (const MP of miniPrograms()) {
  const name = path.basename(MP)
  const appCss = read(path.join(MP, 'app.wxss'))
  const appClasses = definedClasses(appCss)
  if (Buffer.byteLength(appCss) < MIN_WXSS_BYTES) {
    errors.push(`${name}/app.wxss 内容过少（${Buffer.byteLength(appCss)} 字节），疑似被清空`)
  }

  // ① 所有 wxss 非空
  const wxssFiles = []
  ;(function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.wxss')) wxssFiles.push(full)
    }
  })(MP)
  wxssCount += wxssFiles.length
  for (const f of wxssFiles) {
    const css = read(f)
    const size = Buffer.byteLength(css)
    if (size < MIN_WXSS_BYTES) {
      errors.push(`${path.relative(ROOT, f)} 只有 ${size} 字节（< ${MIN_WXSS_BYTES}），样式疑似被清空`)
    }
    // 花括号必须配对（能抓住被截断/合并坏的文件）
    const open = (css.match(/\{/g) || []).length
    const close = (css.match(/\}/g) || []).length
    if (open !== close) {
      errors.push(`${path.relative(ROOT, f)} 花括号不配对（{ ${open} 个 / } ${close} 个）`)
    }
    // 替换字符 U+FFFD = 编码被破坏
    if (css.includes('\uFFFD')) {
      errors.push(`${path.relative(ROOT, f)} 含乱码替换字符 U+FFFD，编码已损坏`)
    }
  }

  // ② 每页静态 class 都要有定义
  const pagesDir = path.join(MP, 'pages')
  if (!fs.existsSync(pagesDir)) continue
  for (const dir of fs.readdirSync(pagesDir)) {
    const base = path.join(pagesDir, dir, dir)
    const wxml = read(base + '.wxml')
    const wxss = read(base + '.wxss')
    if (!wxml) continue
    const own = definedClasses(wxss)
    const missing = [...usedClasses(wxml)].filter((c) => !appClasses.has(c) && !own.has(c)).sort()
    if (missing.length) {
      errors.push(`pages/${dir}/${dir}.wxml 缺少样式定义：${missing.join(', ')}`)
    }
  }
}

// ③ 课表页关键能力样式必须存在（只校验独立课表小程序）
const scheduleCss = read(path.join(ROOT, 'mp-schedule', 'pages', 'schedule', 'schedule.wxss'))
for (const k of ['today-col', '.page.dark', '.mono .ccard']) {
  if (!scheduleCss.includes(k)) errors.push(`mp-schedule/pages/schedule/schedule.wxss 缺少关键样式：${k}`)
}

if (errors.length) {
  console.error('check-mp-styles: FAIL')
  for (const e of errors) console.error('  ✗ ' + e)
  process.exit(1)
}

console.log(`check-mp-styles: OK（${miniPrograms().length} 个小程序 / ${wxssCount} 个 wxss，样式与 class 定义齐全）`)
