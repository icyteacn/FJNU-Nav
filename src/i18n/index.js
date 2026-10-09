/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  src/i18n/index.js
 * @职责      FJNU-Nav 国际化框架（与 QDU-Nav 同构设计）：reactive 语言状态 ·
 *            t('a.b.c') 点分路径取词 · localStorage 持久化 · 零依赖切换
 * @入口      useI18n() → { lang, t, toggleLang }
 * @词典      ./zh.js 中文包 · ./en.js 英文包（同构 key，缺词回落中文）
 * @覆盖策略  渐进式：首页/顶栏/底部导航/欢迎页/新应用 先行覆盖；
 *            其余深度视图文案保留中文（en 下显示中文优于显示残缺英文）
 * @被谁用    App.vue · Home.vue · Welcome.vue · 新应用视图
 * ════════════════════════════════════════════════════════════════════
 */
import { ref, reactive } from 'vue'
import zh from './zh.js'
import en from './en.js'

const LANG_KEY = 'fjnu_lang'

function detect() {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch { /* noop */ }
  return 'zh'
}

const lang = ref(detect())
const dict = reactive({ zh, en })

function pick(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return null
    cur = cur[p]
  }
  return typeof cur === 'string' ? cur : null
}

/**
 * 取词：按点分路径读取当前语言包；英文缺词自动回落中文；都缺则回显 key
 * @param {string} path 如 'home.searchPlaceholder'
 */
export function t(path) {
  const v = pick(dict[lang.value], path)
  if (v != null) return v
  const fb = pick(dict.zh, path)
  return fb != null ? fb : path
}

export function useI18n() {
  function toggleLang() {
    lang.value = lang.value === 'zh' ? 'en' : 'zh'
    try { localStorage.setItem(LANG_KEY, lang.value) } catch { /* noop */ }
    document.documentElement.setAttribute('lang', lang.value === 'en' ? 'en' : 'zh-CN')
  }
  return { lang, t, toggleLang }
}

/** 供脚本/调试：列出某语言包的全部点分 key（维护双语一致性用） */
export function keysOf(langCode) {
  const out = []
  const walk = (obj, prefix) => {
    for (const k in obj) {
      const v = obj[k]
      const p = prefix ? prefix + '.' + k : k
      if (v && typeof v === 'object') walk(v, p)
      else out.push(p)
    }
  }
  walk(dict[langCode] || {}, '')
  return out
}
