/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  src/suggest.js
 * @职责      「提建议」提交通道：**直接提交**到开发者眼前的校园墙「💡 建议」
 *            分区（复用仓库既有 Supabase，无需自建后端、无需跳转任何第三方）
 *            主通道 = cloudCreate(tag=suggest)
 *            失败处理 = 写入本地暂存队列 → 页面下次打开 / 浏览器 online 事件
 *            时**自动补交**，全程不离开本站（不跳 GitHub、不换渠道）
 * @调用方    components/SuggestButton.vue（网页）· standalone-schedule.html（APK）
 * ════════════════════════════════════════════════════════════════════
 */
import { cloudCreate, cloudEnabled } from './wall/cloud.js'

/** 校园墙里承载建议的分区 tag */
export const SUGGEST_TAG = 'suggest'
/** 暂存队列键（提交失败的建议，联网后自动补交） */
export const SUGGEST_QUEUE_KEY = 'fjnu_suggest_queue'

const LABELS = { feature: '功能建议', bug: '问题反馈', other: '其他建议' }
export const suggestLabel = (type) => LABELS[type] || '建议'

/** 建议正文（含联系方式与来源，方便开发者定位问题） */
export function buildSuggestBody({ type, content, contact, from }) {
  const lines = [String(content || '').trim()]
  if (contact && contact.trim()) lines.push('', '联系方式：' + contact.trim())
  lines.push('', '—— 来自 ' + (from || '站点') + ' · ' + new Date().toLocaleString())
  return lines.join('\n')
}

export function buildSuggestTitle(type, content) {
  const text = String(content || '').trim().replace(/\s+/g, ' ')
  return `【${suggestLabel(type)}】${text.slice(0, 36)}${text.length > 36 ? '…' : ''}`
}

/**
 * 直接提交到云端（校园墙「💡 建议」分区）
 * @throws 网络/云端异常时抛错，调用方转入暂存队列
 */
export async function submitSuggestion({ type, content, contact, from }) {
  if (!cloudEnabled()) throw new Error('cloud disabled')
  await cloudCreate({
    title: buildSuggestTitle(type, content),
    content: buildSuggestBody({ type, content, contact, from }),
    tag: SUGGEST_TAG,
    type: 'normal',
    anonymous: true,
    author: '匿名同学',
  })
  return true
}

/* ── 暂存队列：提交失败先存本机，联网自动补交（保证「直接送达」不断链） ── */
export function loadQueue() {
  try {
    const q = JSON.parse(localStorage.getItem(SUGGEST_QUEUE_KEY) || '[]')
    return Array.isArray(q) ? q : []
  } catch { return [] }
}
function saveQueue(list) {
  try { localStorage.setItem(SUGGEST_QUEUE_KEY, JSON.stringify(list.slice(-20))) } catch {}
}
/** 提交失败入队（返回队列长度） */
export function enqueueSuggestion(item) {
  const q = loadQueue()
  q.push({ ...item, ts: Date.now() })
  saveQueue(q)
  return q.length
}
/**
 * 补交队列：逐条直提，成功即移除；全清返回 true
 * @param {object} opt {from} 补交时使用的来源标注
 */
export async function flushSuggestions(opt = {}) {
  const q = loadQueue()
  if (!q.length) return { pending: 0, flushed: 0 }
  const rest = []
  let flushed = 0
  for (const item of q) {
    try {
      await submitSuggestion({ ...item, from: item.from || opt.from || '站内补交' })
      flushed++
    } catch {
      rest.push(item) // 仍然失败 → 留队，下次再试
    }
  }
  saveQueue(rest)
  return { pending: rest.length, flushed }
}
/** 注册自动补交：页面打开时 + 网络恢复时各试一次 */
export function armAutoFlush() {
  const run = () => {
    if (!loadQueue().length) return
    flushSuggestions({ from: '站内自动补交' }).catch(() => {})
  }
  try {
    window.addEventListener('online', run)
    setTimeout(run, 1500)
  } catch { /* noop */ }
}

/** 纯文本（最后兜底：复制后粘给开发者任意渠道，不依赖任何网站） */
export function buildSuggestText({ type, content, contact }) {
  return buildSuggestTitle(type, content) + '\n' + buildSuggestBody({ type, content, contact, from: 'FJNU-Nav' })
}

/** 复制到剪贴板（非安全上下文回退 execCommand） */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* fallthrough */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch { return false }
}
