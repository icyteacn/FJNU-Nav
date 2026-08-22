<script setup>
/** 校园动态：教务处通知/动态 + 计网学院官网动态，支持关键词过滤 */
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../api'
import { fallbackNotices, fallbackNews } from '../data/news'
import NoticeDetail from './NoticeDetail.vue'

const emit = defineEmits(['back'])

const tab = ref('notice')
const loading = ref(true)
const refreshing = ref(false)
const online = ref(false)
const staticMode = ref(false)
const fetchedAt = ref('')
const costMs = ref(null)
const cached = ref(false)
const notices = ref([])
const news = ref([])
const cseNews = ref([])
const cseState = ref(null) // 'live' | 'static' | null
const selected = ref(null)
const kw = ref('')

function matches(it) {
  const k = kw.value.trim().toLowerCase()
  if (!k) return true
  return (it.title || '').toLowerCase().includes(k) || (it.date || '').includes(k)
}
const filteredNotices = computed(() => notices.value.filter(matches))
const filteredNews = computed(() => news.value.filter(matches))
const filteredCse = computed(() => cseNews.value.filter(matches))

const loadAll = async (force) => {
  refreshing.value = true
  const [n, ns, all, cse] = await Promise.all([
    apiFetch('/notices' + (force ? '?force=1' : '')),
    apiFetch('/news' + (force ? '?force=1' : '')),
    apiFetch('/notices?all=1' + (force ? '&force=1' : '')),
    apiFetch('/cseNews' + (force ? '?force=1' : ''))
  ])
  if (n && Array.isArray(n.items) && n.items.length) {
    notices.value = n.items
    online.value = true
    staticMode.value = !!n.static
    fetchedAt.value = n.fetchedAt
    costMs.value = n.costMs
    cached.value = n.cached
  } else {
    notices.value = fallbackNotices
    staticMode.value = false
  }
  if (ns && Array.isArray(ns.items) && ns.items.length) news.value = ns.items
  else news.value = fallbackNews
  if (all && Array.isArray(all.items) && all.items.length) {
    notices.value = all.items
    fetchedAt.value = all.fetchedAt
    costMs.value = all.costMs
    cached.value = all.cached
  }
  if (cse && Array.isArray(cse.items) && cse.items.length) {
    cseNews.value = cse.items
    cseState.value = cse.static ? 'static' : 'live'
  }
  refreshing.value = false
  loading.value = false
}

const refresh = () => loadAll(true)

onMounted(loadAll)

function openItem(it) {
  if (tab.value === 'cse') window.open(it.url, '_blank', 'noopener')
  else selected.value = it
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">校园动态</div>
    <div class="view-sub">教务处官方通知 · 计网学院官网动态 · 实时同步</div>
  </div>

  <template v-if="selected">
    <NoticeDetail :notice="selected" @back="selected = null" />
  </template>

  <template v-else>
    <div v-if="!loading" class="source-bar">
      <span class="dot" :class="online ? 'live' : 'off'"></span>
      <span>{{ staticMode ? '官方数据快照（构建时）' : online ? '官方实时数据' : '官方接口暂不可达，展示演示数据' }}</span>
      <template v-if="online">
        <span class="sep">·</span>
        <span>抓取于 {{ new Date(fetchedAt).toLocaleTimeString('zh-CN', { hour12: false }) }}</span>
        <span v-if="cached" class="sep">·</span><span v-if="cached">命中缓存</span>
      </template>
      <button class="refresh-btn" :disabled="refreshing" @click="refresh">{{ refreshing ? '刷新中…' : '🔄 刷新' }}</button>
    </div>

    <div class="tab-row" style="margin-bottom:12px;flex-wrap:wrap;gap:6px;">
      <button class="tab" :class="{ active: tab === 'notice' }" @click="tab = 'notice'">📢 教务通知（{{ filteredNotices.length }}）</button>
      <button class="tab" :class="{ active: tab === 'news' }" @click="tab = 'news'">📰 工作动态（{{ filteredNews.length }}）</button>
      <button class="tab" :class="{ active: tab === 'cse' }" @click="tab = 'cse'">
        🏫 学院动态<span v-if="cseNews.length">（{{ filteredCse.length }}）</span>
      </button>
    </div>

    <div class="panel" style="margin-bottom:16px;">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="kw" class="search-input" placeholder="过滤当前栏目：奖学金 / 竞赛 / 日期…" />
      </div>
    </div>

    <!-- 教务通知 -->
    <div v-if="tab === 'notice'" class="panel">
      <div class="cal-list">
        <button v-for="it in filteredNotices" :key="it.url" class="news-item news-click" @click="selected = it">
          <span class="news-date">{{ it.date }}</span>
          <span class="news-title">{{ it.title }}</span>
          <span class="news-go">详情 ›</span>
        </button>
        <div v-if="!filteredNotices.length" class="empty">没有匹配的通知</div>
      </div>
      <div class="muted" style="font-size:13px;margin-top:10px;">共 {{ filteredNotices.length }} 条通知（抓取自教务处通知列表页前 4 页）</div>
    </div>

    <!-- 工作动态 -->
    <div v-else-if="tab === 'news'" class="panel">
      <div class="cal-list">
        <a v-for="it in filteredNews" :key="it.url" class="news-item" :href="it.url" target="_blank" rel="noopener">
          <span class="news-date">{{ it.date }}</span>
          <span class="news-title">{{ it.title }}</span>
          <span class="news-go">原文 ↗</span>
        </a>
        <div v-if="!filteredNews.length" class="empty">没有匹配的动态</div>
      </div>
    </div>

    <!-- 计网学院动态 -->
    <div v-else class="panel">
      <div class="source-bar" style="margin-bottom:12px;background:none;padding-left:0;">
        <span class="dot" :class="cseState === 'live' ? 'live' : 'off'"></span>
        <span>{{ cseState === 'live' ? '学院官网实时数据' : cseState === 'static' ? '学院动态快照（构建时）' : '学院官网暂不可达' }}</span>
        <span class="sep">·</span><span>来源 ccs.fjnu.edu.cn/tzgg</span>
      </div>
      <div class="cal-list">
        <a v-for="it in filteredCse" :key="it.url" class="news-item" :href="it.url" target="_blank" rel="noopener">
          <span class="news-date">{{ it.date }}</span>
          <span class="news-title">{{ it.title }}</span>
          <span class="news-go">原文 ↗</span>
        </a>
        <div v-if="loading" class="empty">加载中…</div>
        <div v-else-if="!filteredCse.length" class="empty">
          暂无学院动态<br />
          <a href="https://ccs.fjnu.edu.cn/tzgg/list.htm" target="_blank" rel="noopener" style="color:var(--primary);">前往计网学院官网查看 ↗</a>
        </div>
      </div>
      <div class="muted" style="font-size:13px;margin-top:10px;">研究生国奖评选、竞赛通知、博士招生等学院级通知都会发布在这里。</div>
    </div>
  </template>
</template>

<style scoped>
.news-click { cursor: pointer; background: none; border: none; width: 100%; text-align: left; font: inherit; color: inherit; }
</style>
