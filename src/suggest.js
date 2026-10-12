/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  src/suggest.js
 * @职责      「提建议」提交通道：把用户建议送到开发者眼前，全程无自建后端
 *            主通道 = 复用墙的 Supabase 云端（仓库内置配置）→ 校园墙
 *            「💡 建议」分区（tag=suggest），开发者打开墙即见
 *            兜底通道 = 主通道不可用时给 GitHub Issue 预填链接 / 一键复制
 * @调用方    components/SuggestButton.vue（网页）· standalone-schedule.html（APK）
 * ════════════════════════════════════════════════════════════════════
 */
import { cloudCreate, cloudEnabled } from './wall/cloud.js'

/** 校园墙里承载建议的分区 tag */
export const SUGGEST_TAG = 'suggest'
/** 仓库 Issue 兜底地址（开发者 = 仓库 owner，Issue 有邮件通知） */
export const SUGGEST_ISSUE_BASE = 'https://github.com/icyteacn/FJNU-Nav/issues/new'

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
 * 主通道：提交到云端（校园墙「💡 建议」分区）
 * @throws 云未配置 / 网络失败时抛错，调用方转兜底
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

/** 兜底一：GitHub Issue 预填链接（打开即带标题与正文） */
export function buildIssueUrl({ type, content, contact }) {
  const title = encodeURIComponent(buildSuggestTitle(type, content))
  const body = encodeURIComponent(buildSuggestBody({ type, content, contact, from: 'FJNU-Nav 站内「提建议」按钮' }))
  return `${SUGGEST_ISSUE_BASE}?title=${title}&body=${body}`
}

/** 兜底二：纯文本（一键复制，粘给开发者任意渠道） */
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
