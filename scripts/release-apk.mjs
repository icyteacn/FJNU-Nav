/**
 * 把 APK 发布到 GitHub Releases —— 首页「下载量」就是读它的 download_count。
 *
 * 为什么必须走 Releases：本站托管在 GitHub Pages（纯静态，无服务端），
 * 页面上的下载无法计数；Releases 的 asset 下载数由 GitHub 统计，公开 API 可读，
 * 免费、无需自建服务、无额度问题。
 *
 * 用法：
 *   GITHUB_TOKEN=ghp_xxx node scripts/release-apk.mjs
 *   （token 只需 repo 读写的经典 PAT，或对公开仓库有 contents:write 的细粒度 PAT）
 *   可选：--tag=apk-v1.3  指定 tag；默认用 package.json 的 apkVersion 生成 apk-v<版本>
 *         --file=path     指定 APK 路径；默认 public/downloads/feike-schedule.apk
 *
 * 行为：tag 已存在则复用该 Release；同名 asset 已存在则先删后传（替换），实现可重复执行。
 * 注意：文件名必须是 feike-schedule-<版本>.apk —— 首页只认这个「与当前版本同名」的 asset，
 *       否则会回退到本地文件下载（保护用户不会下到旧版本）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = process.env.REPO || 'icyteacn/FJNU-Nav'
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const APK = process.argv.find((a) => a.startsWith('--file='))?.slice(7) ||
  path.join(ROOT, 'public', 'downloads', 'feike-schedule.apk')

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const VERSION = pkg.apkVersion || ''
const TAG = (process.argv.find((a) => a.startsWith('--tag='))?.slice(6)) || `apk-v${VERSION}`
const ASSET = `feike-schedule-${VERSION}.apk`
const API = `https://api.github.com/repos/${REPO}`
const UA = 'FJNU-Nav-release-script'

function die(msg) {
  console.error('\n[FAIL] ' + msg)
  process.exit(1)
}

function needToken() {
  if (TOKEN) return
  console.error(`
缺少 GITHUB_TOKEN —— 上传 Release 需要写权限的令牌。

两种做法（任选）：
  A. 本地跑（推荐，一次搞定）：
     PowerShell:  $env:GITHUB_TOKEN="ghp_你的令牌"; node scripts/release-apk.mjs
     CMD:         set GITHUB_TOKEN=ghp_你的令牌 && node scripts/release-apk.mjs
     令牌在 https://github.com/settings/tokens 生成（经典 PAT 勾 repo 即可）。

  B. 网页手动上传（不想用令牌时）：
     1) 打开 https://github.com/${REPO}/releases
     2) 点 "Draft a new release"，Tag 填 ${TAG}，标题自取，点 "Publish release"
     3) 把本地 public/downloads/feike-schedule.apk 改名为 ${ASSET} 后拖进去上传
     4) 首页刷新即会显示下载量（首次为 0，之后每被下载一次 +1）
`)
  process.exit(2)
}

async function gh(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': UA,
      ...(opts.headers || {})
    }
  })
  const text = await r.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* 非 JSON */ }
  if (!r.ok) {
    const msg = json?.message || text.slice(0, 200)
    const err = new Error(`HTTP ${r.status} ${msg}`)
    err.status = r.status
    throw err
  }
  return json
}

async function main() {
  if (!VERSION) die('package.json 缺少 apkVersion')
  if (!fs.existsSync(APK)) die(`找不到 APK：${APK}\n  先跑 scripts/build-apk.bat 生成，或把已发布的包放到 public/downloads/feike-schedule.apk`)
  needToken()

  const size = (fs.statSync(APK).size / 1024).toFixed(1)
  console.log(`仓库   : ${REPO}`)
  console.log(`版本   : ${VERSION}  (tag=${TAG})`)
  console.log(`文件   : ${APK}  ${size} KB`)
  console.log(`目标名 : ${ASSET}\n`)

  // 1) 找/建 release
  let release = null
  try {
    release = await gh(`${API}/releases/tags/${TAG}`)
    console.log(`✓ 复用已存在的 Release ${TAG}`)
  } catch (e) {
    if (e.status !== 404) throw e
    release = await gh(`${API}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_name: TAG,
        name: `🐔🩸课表 v${VERSION}`,
        body: `Android 课表 App v${VERSION}（下载量统计由本 Release 的 asset 计数提供）`,
        draft: false,
        prerelease: false
      })
    })
    console.log(`✓ 新建 Release ${TAG}`)
  }

  // 2) 同名 asset 已存在则先删（可重复执行）
  const old = (release.assets || []).find((a) => a.name === ASSET)
  if (old) {
    await gh(`${API}/releases/assets/${old.id}`, { method: 'DELETE' })
    console.log(`✓ 删除同名旧 asset（原下载数 ${old.download_count}）`)
  }

  // 3) 上传
  const buf = fs.readFileSync(APK)
  const uploaded = await gh(
    `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(ASSET)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.android.package-archive', 'Content-Length': String(buf.length) },
      body: buf
    }
  )
  console.log(`✓ 上传成功：${uploaded.name}（${(uploaded.size / 1024).toFixed(1)} KB）`)
  console.log(`  下载直链：${uploaded.browser_download_url}`)
  console.log(`\n首页刷新后即会被识别：下载入口切到 Releases、并显示累计下载量。`)
}

main().catch((e) => die(e.message))
