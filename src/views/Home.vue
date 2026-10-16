<script setup>
/** 首页：欢迎语 / 应用网格 / 分类入口 / 校园数据 / 数据洞察 / 校区 / 关于本站 */
import { ref, computed, onMounted } from 'vue'
import { apps, campusStats } from '../data/apps.js'
import { searchApps } from '../data/searchIndex.js'
import { AGENT_PROFILE } from '../agent/config.js'
import { campuses } from '../data/campus.js'
import { getCourseStats, EMPTY_STATS } from '../api/courseStats.js'
import { SITE } from '../config/site.js'
import { createFavorites } from '../utils/favorites.js'
import { useI18n } from '../i18n/index.js'
import VisitStats from '../components/VisitStats.vue'
import { cachedRelease, fetchApkRelease } from '../utils/apkRelease.js'

const emit = defineEmits(['open'])

/* ── 我的快捷：把常用应用固定到首页顶部（只存本机，跨设备请用备份） ── */
const fav = createFavorites('fjnu_favorites')
const favList = ref(fav.load())
function isFav(appId) { return favList.value.some((f) => f.kind === 'app' && f.target === appId) }
function toggleFav(app, ev) {
  if (ev) ev.stopPropagation()
  favList.value = fav.toggle({ kind: 'app', target: app.id, label: app.title, sub: app.desc, icon: app.icon }).list
}
function removeFav(f, ev) {
  if (ev) ev.stopPropagation()
  favList.value = fav.remove(f.id)
}
function openFav(f) {
  if (f.kind === 'link') { window.open(f.target, '_blank', 'noopener'); return }
  emit('open', f.target)
}
const { lang, t } = useI18n()

/** 应用标题/简介：英文模式优先英文（无则回落中文） */
function appTitle(a) {
  try { return (lang.value === 'en' && a.titleEn) ? a.titleEn : a.title } catch { return a.title }
}
function appDesc(a) {
  try { return (lang.value === 'en' && a.descEn) ? a.descEn : a.desc } catch { return a.desc }
}

/* ── APK 下载量 ──────────────────────────────────────────────────────────
   本站托管在 GitHub Pages（纯静态，没有服务端），页面上的下载**无法计数**。
   唯一免费又真实的是 GitHub Releases 的 download_count，所以：
     · 只有当 Releases 里存在**与当前版本同名**的 asset 时，下载入口才切到 Releases；
     · 否则保持本地 downloads/feike-schedule.apk —— 保证不 404、也绝不会给到旧版本；
     · 读取失败（限流/断网/国内慢）一律静默降级，不阻塞首屏。 */
const apkInfo = ref(cachedRelease())
const apkHref = computed(() => (apkInfo.value && apkInfo.value.currentUrl) || 'downloads/feike-schedule.apk')
const apkDownloads = computed(() => {
  const d = apkInfo.value
  // 只有已经切到 Releases（说明认出了当前这份包）才显示次数；此时 0 也显示，
  // 便于刚发布后立刻确认「计数已生效」，之后随下载增长。
  if (!d || !d.currentUrl) return null
  const n = Number(d.currentDownloads)
  return Number.isFinite(n) ? n : null
})
onMounted(async () => {
  try {
    const d = await fetchApkRelease()
    if (d) apkInfo.value = d
  } catch { /* 计数失败绝不影响首页 */ }
})

const keyword = ref('')

const stats = ref(EMPTY_STATS)
const maxTerm = ref(1)

function barH(v, m) {
  return m ? Math.max(6, Math.round((v / m) * 100)) : 6
}

onMounted(async () => {
  stats.value = await getCourseStats()
  maxTerm.value = stats.value.terms.reduce((m, t) => Math.max(m, t.count), 1)
})

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return t('home.greetingNight')
  if (h < 12) return t('home.greetingMorning')
  if (h < 14) return t('home.greetingNoon')
  if (h < 18) return t('home.greetingAfternoon')
  return t('home.greetingEvening')
}

const filtered = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return []
  return searchApps(kw)
})

const expanded = ref(null)
function toggleCampus(name) {
  expanded.value = expanded.value === name ? null : name
}

/* 首页对话式入口：回车先过意图识别，命中即交给智能体办事 */
function pushInbox(text) {
  try { localStorage.setItem('qdu_agent_inbox', text) } catch { /* noop */ }
}
function onSearchEnter() {
  const q = keyword.value.trim()
  if (!q) return
  // 识别链（FAQ / BM25 知识层）按需加载：首屏不背这个包
  import('../agent/intents.js').then(({ recognize }) => {
    const r = recognize(q)
    if (r.layer === 'intent' || r.layer === 'faq') {
      pushInbox(q)
      keyword.value = ''
      emit('open', 'assistant')
    }
  }).catch(() => { /* 识别层失败不阻塞本地过滤 */ })
}
function askAgent(text) {
  pushInbox(text)
  emit('open', 'assistant')
}
</script>

<template>
  <div class="page home">
    <section class="hero" data-tour="hero">
      <h2 class="hero-title">{{ greeting() }}</h2>
      <p class="hero-sub">{{ lang === 'en' ? 'Welcome to' : '欢迎回到' }} {{ t('site.name') }}，{{ t('site.heroSub') }}</p>
      <div class="search-bar" data-tour="search">
        <span class="search-icon">🤖</span>
        <input
          v-model="keyword"
          class="search-input"
          :placeholder="t('home.searchPlaceholder')"
          @keydown.enter.prevent="onSearchEnter"
        />
        <button class="search-agent-go" title="交给智能体执行" @click="askAgent(keyword || '你能做什么')">执行 ›</button>
      </div>
      <div class="hero-chips">
        <span class="hero-chips-label">{{ t('home.tryLabel') }}</span>
        <button v-for="s in AGENT_PROFILE.examples.slice(0, 4)" :key="s" class="hero-chip" @click="askAgent(s)">{{ s }}</button>
      </div>
    </section>

    <section class="section">
      <div class="wiki-card">
        <div class="wiki-main">
          <div class="wiki-emoji">📚</div>
          <div>
            <div class="wiki-title">{{ SITE.wiki.title }}</div>
            <div class="wiki-desc">{{ SITE.wiki.desc }}</div>
          </div>
        </div>
        <div class="wiki-links">
          <a class="wiki-link" :href="SITE.wiki.links.site" target="_blank" rel="noopener">{{ t('home.wikiSite') }} ↗</a>
          <a class="wiki-link" :href="SITE.wiki.links.github" target="_blank" rel="noopener">GitHub ↗</a>
          <a v-if="SITE.wiki.links.docs" class="wiki-link" :href="SITE.wiki.links.docs" target="_blank" rel="noopener">{{ t('home.wikiDocs') }} ↗</a>
        </div>
      </div>
    </section>

    <section class="section">
      <a :href="apkHref" class="app-download-card" download>
        <div class="download-left">
          <span class="download-icon">🐔🩸</span>
          <div>
            <div class="download-title">{{ t('home.downloadTitle') }}</div>
            <div class="download-desc">{{ t('home.downloadDesc') }}</div>
            <div v-if="apkDownloads !== null" class="download-count">🔥 {{ t('home.downloadCount', { n: apkDownloads.toLocaleString() }) }}</div>
          </div>
        </div>
        <span class="download-btn">{{ t('home.downloadBtn') }}</span>
      </a>
    </section>

    <section class="section">
      <div class="section-head">
        <h3 class="section-title">{{ t('home.quickTitle') }}</h3>
        <div class="section-head-right">
          <span class="section-sub">{{ t('home.quickSub') }}</span>
          <button v-if="favList.length" class="section-link" @click="favList = fav.clear()">{{ t('home.quickClear') }}</button>
        </div>
      </div>
      <div v-if="favList.length" class="fav-row">
        <div v-for="f in favList" :key="f.id" class="fav-chip" :class="{ pinned: f.pinned }">
          <button class="fav-open" @click="openFav(f)" :title="f.label">
            <span class="fav-icon">{{ f.icon }}</span>
            <span class="fav-label">{{ f.label }}</span>
          </button>
          <button class="fav-pin" :class="{ on: f.pinned }" :title="t('home.quickPin')" @click="favList = fav.pin(f.id, !f.pinned)">📌</button>
          <button class="fav-x" :title="t('home.quickRemove')" @click="removeFav(f, $event)">✕</button>
        </div>
      </div>
      <div v-else class="fav-empty">{{ t('home.quickEmpty') }}</div>
      <div class="hint">{{ t('home.quickHint') }}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3 class="section-title">{{ t('home.publicApps') }}</h3>
        <div class="section-head-right">
          <span class="section-sub">{{ t('home.quickApps') }}</span>
          <button class="section-link" @click="emit('open', 'categories')">{{ t('home.viewAllCats') }}</button>
        </div>
      </div>
      <div v-if="keyword.trim() && filtered.length" class="tile-grid" data-tour="app-grid">
        <button
          v-for="r in filtered"
          :key="r.app.id"
          class="service-tile"
          @click="emit('open', r.app.id)"
        >
          <span class="tile-icon" :style="{ background: r.app.color + '1a', color: r.app.color }">{{ r.app.icon }}</span>
          <span class="tile-body">
            <span class="tile-title">{{ appTitle(r.app) }}</span>
            <span v-if="r.hits.length" class="tile-hit">{{ t('home.matchLabel') }}{{ r.hits.join(' · ') }}</span>
            <span v-else class="tile-desc">{{ appDesc(r.app) }}</span>
          </span>
          <span
            class="tile-fav"
            :class="{ on: isFav(r.app.id) }"
            role="button"
            tabindex="0"
            :aria-label="isFav(r.app.id) ? t('home.favOn') : t('home.favOff')"
            :title="isFav(r.app.id) ? t('home.favOn') : t('home.favOff')"
            @click="toggleFav(r.app, $event)"
            @keydown.enter.prevent="toggleFav(r.app, $event)"
          >{{ isFav(r.app.id) ? '★' : '☆' }}</span>
        </button>
      </div>
      <div v-else-if="!keyword.trim()" class="tile-grid" data-tour="app-grid">
        <button
          v-for="a in apps"
          :key="a.id"
          class="service-tile"
          @click="emit('open', a.id)"
        >
          <span class="tile-icon" :style="{ background: a.color + '1a', color: a.color }">{{ a.icon }}</span>
          <span class="tile-body">
            <span class="tile-title">{{ appTitle(a) }}</span>
            <span class="tile-desc">{{ appDesc(a) }}</span>
          </span>
          <span
            class="tile-fav"
            :class="{ on: isFav(a.id) }"
            role="button"
            tabindex="0"
            :aria-label="isFav(a.id) ? t('home.favOn') : t('home.favOff')"
            :title="isFav(a.id) ? t('home.favOn') : t('home.favOff')"
            @click="toggleFav(a, $event)"
            @keydown.enter.prevent="toggleFav(a, $event)"
          >{{ isFav(a.id) ? '★' : '☆' }}</span>
        </button>
      </div>
      <div v-else class="empty">{{ t('home.noResult') }}</div>
      <div class="hint">{{ t('home.appCountHint') }} {{ apps.length }} {{ t('home.apps') }}</div>
    </section>

    <section class="section stats">
      <div class="stat" v-for="s in [
        { v: campusStats.campuses, l: t('home.statsCampus') },
        { v: campusStats.colleges, l: t('home.statsCollege') },
        { v: campusStats.majors, l: t('home.statsMajor') },
        { v: campusStats.apps, l: t('home.statsApp') }
      ]" :key="s.l">
        <div class="stat-value">{{ s.v }}</div>
        <div class="stat-label">{{ s.l }}</div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3 class="section-title">{{ t('home.courseInsight') }}</h3>
        <button class="section-link" @click="emit('open', 'courseStats')">{{ t('home.fullStats') }}</button>
      </div>
      <div class="insight-card">
        <div class="insight-main">
          <div class="insight-title">📈 {{ lang === 'en' ? 'Campus heat · course insights' : '校园热度 · 课程数据洞察' }}</div>
          <div v-if="stats.periods" class="insight-desc">
            <template v-if="lang === 'en'">
              {{ stats.terms.length }} terms, <b>{{ stats.periods }}</b> entries: hottest room
              <b>{{ stats.hotRooms[0] && stats.hotRooms[0].name }}</b> ({{ stats.hotRooms[0] && stats.hotRooms[0].periods }} periods),
              hottest teacher <b>{{ stats.hotTeachers[0] && stats.hotTeachers[0].name }}</b>
            </template>
            <template v-else>
              近 {{ stats.terms.length }} 个学期共 <b>{{ stats.periods }}</b> 条排课：最热教室
              <b>{{ stats.hotRooms[0] && stats.hotRooms[0].name }}</b>（{{ stats.hotRooms[0] && stats.hotRooms[0].periods }} 节次）、
              最热教师 <b>{{ stats.hotTeachers[0] && stats.hotTeachers[0].name }}</b>
            </template>
          </div>
          <div v-else class="insight-desc muted">{{ lang === 'en' ? 'Stats temporarily unavailable' : '统计数据暂不可用' }}</div>
        </div>
        <div class="insight-bars">
          <div v-for="t in stats.terms.slice(0, 5)" :key="t.semester" class="insight-bar" :title="t.semester + ' · ' + t.count">
            <div class="insight-bar-fill" :style="{ height: barH(t.count, maxTerm) + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">{{ t('home.campusesTitle') }}</h3>
      <div class="campus-cards">
        <button
          v-for="c in campuses"
          :key="c.name"
          class="campus-card"
          :class="{ open: expanded === c.name }"
          @click="toggleCampus(c.name)"
        >
          <div class="campus-head">
            <div class="campus-emoji">{{ c.emoji }}</div>
            <div class="campus-main">
              <div class="campus-name">{{ c.name }}</div>
              <div class="campus-alias">{{ c.alias }}</div>
            </div>
            <span class="campus-toggle">{{ expanded === c.name ? t('home.collapse') : t('home.expand') }} {{ expanded === c.name ? '▴' : '▾' }}</span>
          </div>
          <div class="campus-addr">{{ c.address }}</div>
          <div v-if="expanded === c.name" class="campus-detail">
            <div class="campus-desc">{{ c.desc }}</div>
            <div class="campus-colleges">
              <span v-for="col in c.colleges" :key="col" class="campus-tag">{{ col }}</span>
            </div>
            <div class="campus-links">
              <button v-for="l in c.links" :key="l.label" class="btn ghost small" @click.stop="emit('open', l.app)">
                {{ l.label }} ›
              </button>
            </div>
          </div>
        </button>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">{{ t('home.about') }}</h3>
      <div class="about-card">
          <div class="about-line"><b>{{ t('home.aboutDev') }}</b>{{ SITE.developer }}</div>
          <div class="about-line"><b>{{ t('home.aboutVer') }}</b>v{{ SITE.version }}</div>
          <div class="about-line"><b>{{ t('home.aboutSrcLabel') }}</b>{{ SITE.aboutSource }}</div>
          <div class="about-line"><b>{{ t('home.aboutCrawlLabel') }}</b>{{ SITE.aboutCrawl }}</div>
          <div class="about-line"><b>{{ t('home.aboutUsageLabel') }}</b>{{ SITE.aboutUsage }}</div>
        <div class="about-actions">
          <button class="btn ghost small" @click="emit('open', 'contributors')">🎖️ 查看贡献者墙 ›</button>
        </div>
        <VisitStats />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── 我的快捷（收藏） ── */
.fav-row { display: flex; flex-wrap: wrap; gap: 8px; }
.fav-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px 2px 2px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 999px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.fav-chip:hover { border-color: var(--primary); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07); }
.fav-chip.pinned { border-color: var(--primary); background: var(--primary-soft); }
.fav-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  padding: 5px 4px 5px 9px;
  max-width: 190px;
}
.fav-icon { font-size: 15px; }
.fav-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav-pin, .fav-x {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  padding: 6px 5px;
  border-radius: 999px;
  color: var(--text-light, #9aa4b2);
  font-family: inherit;
}
.fav-pin:hover, .fav-x:hover { background: var(--bar); color: var(--primary); }
.fav-pin.on { color: var(--primary); }
.fav-x { padding-right: 8px; }
.fav-empty {
  font-size: 12.5px;
  color: var(--text-sub);
  padding: 14px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  line-height: 1.8;
}
/* 应用卡片右上角的收藏星标（span 而非 button，避免按钮嵌套） */
.tile-fav {
  position: absolute;
  top: 8px;
  right: 9px;
  font-size: 15px;
  line-height: 1;
  color: var(--text-light, #b6bfcc);
  cursor: pointer;
  padding: 4px;
  border-radius: 999px;
}
.tile-fav:hover { color: #f59e0b; background: var(--bar); }
.tile-fav.on { color: #f59e0b; }
.service-tile { position: relative; }
.section-head-right { display: flex; align-items: center; gap: 10px; }
.about-actions { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.tile-hit { font-size: 11px; color: var(--primary); background: var(--primary-soft); border-radius: 999px; padding: 2px 8px; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-download-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: linear-gradient(135deg, #c62828, #ad1457); border-radius: 14px; color: #fff; text-decoration: none; transition: transform .15s, box-shadow .15s; }
.app-download-card:active { transform: scale(0.98); }
.download-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.download-icon { font-size: 28px; flex-shrink: 0; }
.download-title { font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.download-desc { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.download-btn { flex-shrink: 0; padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 8px; font-size: 13px; font-weight: 700; color: #fff; }

.search-agent-go {
  flex-shrink: 0;
  border: none;
  background: var(--primary, #1b66c9);
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  padding: 7px 13px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
}
.hero-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; align-items: center; justify-content: center; }
.hero-chips-label { font-size: 12px; color: var(--muted, #8a94a6); }
.hero-chip {
  border: 1px dashed var(--border, #e5eaf2);
  background: var(--card, rgba(255, 255, 255, 0.75));
  color: var(--text, #24292f);
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
}
.hero-chip:hover { border-color: var(--primary, #1b66c9); color: var(--primary, #1b66c9); }

.download-count { font-size: 11px; margin-top: 2px; font-weight: 600; color: var(--primary, #1b66c9); }
</style>
