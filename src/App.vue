<script setup>
/**
 * 应用根组件：欢迎页 / 顶栏 / 主视图 / 页脚 / 底部导航
 * ---------------------------------------------------------------------------
 * 视图注册、路由解析、导航逻辑集中在 src/router.js；
 * 品牌、版权、文案集中在 src/config/site.js。此处只做组装。
 */
import { ref, computed, onMounted } from 'vue'
import Welcome from './views/Welcome.vue'
import { SITE } from './config/site'
import { NAV_APPS, useViewState, preloadPopular } from './router'

/** 会话级初始页：每次新开浏览器先展示欢迎页，进入后本会话不再打扰 */
const stage = ref(sessionStorage.getItem('fjnu_welcome_seen') ? 'main' : 'welcome')
function enter() {
  sessionStorage.setItem('fjnu_welcome_seen', '1')
  stage.value = 'main'
}

/* 深色模式：localStorage 记忆 + 跟随系统偏好，<html data-theme> 驱动。
 * index.html 已内联首屏脚本预置 data-theme（消除欢迎页/首屏 FOUC），
 * 此处读取其值初始化，并兜底计算（内联脚本失败时）。 */
const THEME_KEY = 'fjnu_theme'
const theme = ref(document.documentElement.getAttribute('data-theme') || 'light')
function applyTheme(t) {
  theme.value = t
  document.documentElement.setAttribute('data-theme', t)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t === 'dark' ? '#171310' : '#c62828')
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch {
    /* noop */
  }
}
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}
onMounted(() => {
  if (document.documentElement.getAttribute('data-theme')) return
  let t = 'light'
  try {
    t = localStorage.getItem(THEME_KEY) || ''
  } catch {
    /* noop */
  }
  if (!t) {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  applyTheme(t)
})

const { current, currentComp, openApp, goHome, loadingView } = useViewState()

/* 公告系统 */
const NOTICE_KEY = 'fjnu_notice_read'
const showNotice = ref(false)
const notices = ref([])
const readVersion = ref(0)
const unreadCount = computed(() => {
  readVersion.value
  try {
    const read = JSON.parse(localStorage.getItem(NOTICE_KEY) || '[]')
    return notices.value.filter(n => !read.includes(n.id)).length
  } catch { return notices.value.length }
})
function markNoticeRead() {
  try {
    const read = JSON.parse(localStorage.getItem(NOTICE_KEY) || '[]')
    const newRead = notices.value.map(n => n.id).filter(id => !read.includes(id))
    localStorage.setItem(NOTICE_KEY, JSON.stringify([...read, ...newRead]))
    readVersion.value++
  } catch { /* noop */ }
}
async function loadNotices() {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/announcements.json')
    if (res.ok) {
      const data = await res.json()
      notices.value = Array.isArray(data) ? data : (data.notices || [])
    }
  } catch { /* noop */ }
}
onMounted(loadNotices)

// 预加载热门应用（减少首次点击延迟）
onMounted(() => {
  setTimeout(preloadPopular, 1000)
})
</script>

<template>
  <Welcome v-if="stage === 'welcome'" @enter="enter" />

  <div v-else class="app-shell">
    <header class="header">
      <div class="header-inner">
        <div class="brand" @click="goHome">
          <div class="brand-logo"><span>{{ SITE.brand }}</span></div>
          <div>
            <div class="brand-name">{{ SITE.name }}</div>
            <div class="brand-sub">{{ SITE.tagline }}</div>
          </div>
        </div>
        <div class="header-right">
          <button class="ghost-btn notice-bell" v-if="notices.length" @click="showNotice = true">
            🔔
            <span class="notice-dot" v-if="unreadCount">{{ unreadCount }}</span>
          </button>
          <button class="ghost-btn" :title="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'" @click="toggleTheme">{{ theme === 'dark' ? '☀️' : '🌙' }}</button>
          <button class="ghost-btn" @click="goHome">🏠 首页</button>
        </div>
      </div>
    </header>

    <main class="main">
      <div v-if="loadingView" class="view-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
      <component v-else :is="currentComp" @open="openApp" @back="goHome" />
    </main>

    <footer class="footer">
      <div class="footer-legend">
        <span class="legend-item"><i class="dot live"></i>{{ SITE.legendLive }}</span>
        <span class="legend-item"><i class="dot demo"></i>{{ SITE.legendDemo }}</span>
        <span class="legend-item"><i class="dot tool"></i>{{ SITE.legendTool }}</span>
      </div>
      <div class="footer-copy">{{ SITE.copy }}<span class="footer-ver"> v{{ SITE.version }}</span></div>
      <div class="footer-dev">{{ SITE.devLine }}</div>
    </footer>

    <nav class="bottom-nav">
      <button class="bottom-nav__item" :class="{ 'is-active': current === 'home' }" @click="goHome">
        <span class="bn-icon">🏠</span><span>首页</span>
      </button>
      <button
        v-for="a in NAV_APPS"
        :key="a.id"
        class="bottom-nav__item"
        :class="{ 'is-active': current === a.id }"
        @click="openApp(a.id)"
      >
        <span class="bn-icon">{{ a.icon }}</span>
        <span>{{ a.label }}</span>
      </button>
    </nav>

    <!-- 公告弹窗 -->
    <div v-if="showNotice" class="notice-mask" @click.self="showNotice = false; markNoticeRead()">
      <div class="notice-modal">
        <div class="notice-modal-head">
          <span class="notice-modal-title">📢 站点公告</span>
          <button class="notice-modal-close" @click="showNotice = false; markNoticeRead()">✕</button>
        </div>
        <div class="notice-modal-body">
          <div v-for="n in notices" :key="n.id" class="notice-item">
            <div class="notice-item-title">
              <span>{{ n.title }}</span>
              <span class="notice-item-date muted">{{ n.date }}</span>
            </div>
            <div class="notice-item-content">{{ n.content }}</div>
          </div>
          <div v-if="!notices.length" class="empty">暂无公告</div>
        </div>
      </div>
    </div>
  </div>
</template>