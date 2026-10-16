/**
 * APK 下载量模块单测：node scripts/test_apkRelease.mjs
 * 覆盖：下载量汇总、草稿跳过、只认 .apk、**版本不匹配时不得暴露旧版链接**、缓存有效期、asset 命名。
 * 「版本不匹配就回退本地文件」是这里最重要的一条：一旦漏了，用户点下载会拿到旧版本 APK。
 */
import assert from 'node:assert/strict'
import { summarizeReleases, isFresh, apkAssetName } from '../src/utils/apkRelease.js'

let failed = 0
function check(name, fn) {
  try {
    fn()
    console.log('✔', name)
  } catch (e) {
    failed++
    console.error('✘', name, '\n   ', e.message)
  }
}

/** 造一个 GitHub releases 响应片段 */
const rel = (tag, assets, extra = {}) => ({
  tag_name: tag,
  draft: false,
  prerelease: false,
  assets: assets.map(([name, count]) => ({ name, download_count: count, browser_download_url: `https://github.com/x/y/releases/download/${tag}/${name}` })),
  ...extra
})

check('apkAssetName：当前版本命名规则', () => {
  assert.equal(apkAssetName('1.3'), 'feike-schedule-1.3.apk')
  assert.equal(apkAssetName(''), '')
})

check('空/异常输入不抛错，返回零值', () => {
  for (const v of [null, undefined, 'x', 42, {}]) {
    const r = summarizeReleases(v, '1.3')
    assert.equal(r.totalDownloads, 0)
    assert.equal(r.currentUrl, null)
    assert.equal(r.assets, 0)
  }
})

check('汇总所有版本 APK 的下载量，忽略草稿与非 apk 资源', () => {
  const r = summarizeReleases([
    rel('apk-v1.3', [['feike-schedule-1.3.apk', 12], ['notes.txt', 999]]),
    rel('apk-v1.2', [['feike-schedule-1.2.apk', 30]]),
    rel('apk-v0.9-draft', [['feike-schedule-0.9.apk', 500]], { draft: true })
  ], '1.3')
  assert.equal(r.totalDownloads, 42, '只应统计非草稿的 .apk')
  assert.equal(r.assets, 2)
})

check('版本匹配 → 提供 Releases 链接与该版本下载量', () => {
  const r = summarizeReleases([{
    tag_name: 'apk-v1.3',
    draft: false,
    assets: [{ name: 'feike-schedule-1.3.apk', download_count: 7, browser_download_url: 'https://gh/1.3.apk' }]
  }], '1.3')
  assert.equal(r.currentUrl, 'https://gh/1.3.apk')
  assert.equal(r.currentTag, 'apk-v1.3')
  assert.equal(r.currentDownloads, 7)
})

check('★ 版本不匹配（例如只有旧版 asset）→ 绝不给出链接', () => {
  // 现实场景：仓库里只有 v1.0.0 的旧包，而站点已是 1.3 —— 必须回退本地文件，否则用户下到旧版
  const r = summarizeReleases([
    rel('v1.0.0', [['-.apk', 3]]),
    rel('apk-v1.2', [['feike-schedule-1.2.apk', 8]])
  ], '1.3')
  assert.equal(r.currentUrl, null, '不匹配时 currentUrl 必须为 null')
  assert.equal(r.currentDownloads, 0)
  assert.equal(r.totalDownloads, 11, '总下载量仍应统计')
})

check('同名但大小写不同也算匹配（GitHub 文件名不区分大小写展示）', () => {
  const r = summarizeReleases([rel('apk-v1.3', [['Feike-Schedule-1.3.APK', 5]])], '1.3')
  assert.equal(r.currentUrl !== null, true)
  assert.equal(r.currentDownloads, 5)
})

check('缺 browser_download_url 的 asset 被忽略（避免生成坏链接）', () => {
  const r = summarizeReleases([{ tag_name: 'apk-v1.3', draft: false, assets: [{ name: 'feike-schedule-1.3.apk', download_count: 9 }] }], '1.3')
  assert.equal(r.assets, 0)
  assert.equal(r.currentUrl, null)
})

check('download_count 为异常值时不产生 NaN', () => {
  const r = summarizeReleases([
    rel('apk-v1.3', [['feike-schedule-1.3.apk', undefined], ['feike-schedule-1.3-1.apk', -5]])
  ], '1.3')
  assert.equal(Number.isNaN(r.totalDownloads), false)
  assert.equal(r.currentDownloads, 0)
})

check('isFresh：10 分钟有效期与边界', () => {
  const now = 1_000_000_000_000
  assert.equal(isFresh(null, now), false)
  assert.equal(isFresh({}, now), false)
  assert.equal(isFresh({ at: now - 60_000 }, now), true)
  assert.equal(isFresh({ at: now - 10 * 60 * 1000 }, now), false, '正好到期应视为过期')
  assert.equal(isFresh({ at: now - 10 * 60 * 1000 + 1 }, now), true)
  assert.equal(isFresh({ at: now + 60_000 }, now), false, '未来时间戳视为无效')
})

console.log(failed ? `\n${failed} 项失败` : '\n全部通过')
process.exit(failed ? 1 : 0)
