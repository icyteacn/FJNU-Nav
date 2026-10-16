/**
 * @模块路径  src/utils/apkRelease.js
 * @职责      APK 下载量（GitHub Releases 的 download_count）
 *
 * 背景：本站托管在 GitHub Pages（纯静态，没有服务端），所以**页面上的下载无法计数**。
 * 唯一免费又真实可得的下载量是 GitHub Releases 的 asset `download_count`：
 * 用户从 Releases 下载一次，计数 +1，公开 API 可直接读，无需任何后端与额度。
 *
 * 设计原则（很重要，避免"加了个计数把下载搞坏"）：
 *  1. **只在存在与当前版本文件名完全匹配的 asset 时**，才把下载入口切到 Releases；
 *     否则保持原来的 Pages 本地文件下载 —— 下载永远不会 404、也永远不会拿到旧版本。
 *  2. 读取失败（限流 / 断网 / 国内访问慢）一律静默降级，绝不阻塞首屏渲染。
 *  3. 未认证的 GitHub API 限流 60 次/时/IP（校园网共用出口很容易打满），
 *     所以结果缓存 10 分钟，且优先用缓存先渲染、后台再刷新。
 */

const REPO = (typeof __APK_REPO__ !== 'undefined' && __APK_REPO__) || 'icyteacn/FJNU-Nav'
const APK_VERSION = (typeof __APK_VERSION__ !== 'undefined' && __APK_VERSION__) || ''
const CACHE_KEY = 'fjnu_apk_release_v1'
const TTL_MS = 10 * 60 * 1000

/** 当前版本对应的 asset 文件名（发布脚本上传时就用这个名字） */
export function apkAssetName(version = APK_VERSION) {
  return version ? `feike-schedule-${version}.apk` : ''
}

/** 本地缓存读写（storage 不可用时全部静默跳过） */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object') return null
    return d
  } catch {
    return null
  }
}

function writeCache(obj) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch { /* 隐私模式等：不影响功能 */ }
}

/**
 * 纯函数（可单测）：从 GitHub `GET /releases` 的返回体里汇总下载信息。
 * @param {Array} releases API 返回的 release 数组
 * @param {string} version 当前 APK 版本（用于挑选匹配的 asset）
 * @returns {{ totalDownloads:number, assets:number, currentUrl:string|null, currentTag:string|null, currentDownloads:number }}
 */
export function summarizeReleases(releases, version = APK_VERSION) {
  const out = { totalDownloads: 0, assets: 0, currentUrl: null, currentTag: null, currentDownloads: 0 }
  if (!Array.isArray(releases)) return out
  const want = version ? `feike-schedule-${version}.apk` : ''
  for (const r of releases) {
    if (!r || r.draft) continue
    const apks = (r.assets || []).filter((a) => a && /\.apk$/i.test(a.name || '') && a.browser_download_url)
    if (!apks.length) continue
    for (const a of apks) {
      const n = Number(a.download_count)
      out.totalDownloads += Number.isFinite(n) && n > 0 ? n : 0
      out.assets += 1
      // 只认「文件名与当前版本完全一致」的 asset，避免把旧版本链接暴露出去
      if (want && (a.name || '').toLowerCase() === want.toLowerCase()) {
        out.currentUrl = a.browser_download_url
        out.currentTag = r.tag_name || ''
        out.currentDownloads += Number.isFinite(n) && n > 0 ? n : 0
      }
    }
  }
  return out
}

/** 缓存是否仍在有效期内 */
export function isFresh(cache, now = Date.now(), ttl = TTL_MS) {
  if (!cache || typeof cache.at !== 'number') return false
  return now - cache.at >= 0 && now - cache.at < ttl
}

/** 立即返回缓存（可能是陈旧的），供首屏先用起来 */
export function cachedRelease() {
  return readCache()
}

/**
 * 拉取并汇总（失败返回缓存或 null，绝不抛错）。
 * @param {{ force?:boolean }} opts force=true 时忽略 TTL 强制刷新
 */
export async function fetchApkRelease({ force = false } = {}) {
  const cached = readCache()
  if (!force && isFresh(cached)) return cached
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' }
    })
    clearTimeout(timer)
    if (!r.ok) return cached || null // 限流(403)/网络异常：用旧数据，不报错
    const list = await r.json()
    const sum = summarizeReleases(list, APK_VERSION)
    const data = { ...sum, at: Date.now() }
    writeCache(data)
    return data
  } catch {
    return cached || null
  }
}

export default { apkAssetName, summarizeReleases, isFresh, cachedRelease, fetchApkRelease }
