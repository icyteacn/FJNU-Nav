<script setup>
/**
 * 日程助手 v2：实时倒计时 + 专业筛选 + 出席打卡 + 自动滚动 + 更多功能
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { SCHEDULE_VERSIONS, EVENT_CATEGORIES, MAJORS, audienceMajors, groupByDate, eventStatus, nextEvent, timeUntil, nextEventDate } from '../data/orientationSchedule'

const emit = defineEmits(['back', 'open'])

const versionId = ref(SCHEDULE_VERSIONS[0]?.id || '')
const version = computed(() => SCHEDULE_VERSIONS.find(v => v.id === versionId.value) || SCHEDULE_VERSIONS[0])
const events = computed(() => version.value?.events || [])
const grouped = computed(() => groupByDate(events.value))

const catFilter = ref('')
const majorFilter = ref('')
const searchKw = ref('')
const expanded = ref(null)
const showDetail = ref(null)
const showCalendar = ref(false)
const checked = ref(new Set())
const detailRef = ref(null)

/* 实时 now — 每秒刷新 */
const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

onMounted(() => {
  const saved = localStorage.getItem('fjnu_schedule_version')
  if (saved && SCHEDULE_VERSIONS.some(v => v.id === saved)) versionId.value = saved
  const savedChecked = localStorage.getItem('fjnu_schedule_checked')
  if (savedChecked) try { checked.value = new Set(JSON.parse(savedChecked)) } catch {}
  const nd = nextEventDate(events.value)
  if (nd) expanded.value = nd
})

function persistChecked() { try { localStorage.setItem('fjnu_schedule_checked', JSON.stringify([...checked.value])) } catch {} }
function toggleCheck(id) {
  if (checked.value.has(id)) checked.value.delete(id)
  else checked.value.add(id)
  checked.value = new Set(checked.value)
  persistChecked()
}

/* 专业筛选 */
const selectedMajor = ref('')
function filterByMajor(major) { selectedMajor.value = selectedMajor.value === major ? '' : major }

const filtered = computed(() => {
  let list = events.value
  if (catFilter.value) list = list.filter(e => e.category === catFilter.value)
  if (selectedMajor.value) {
    list = list.filter(e => {
      const majors = audienceMajors(e.audience)
      return majors.includes(selectedMajor.value)
    })
  }
  if (searchKw.value) {
    const kw = searchKw.value.toLowerCase()
    list = list.filter(e => e.topic.toLowerCase().includes(kw) || e.location.toLowerCase().includes(kw) || e.audience.toLowerCase().includes(kw))
  }
  return list
})
const filteredGrouped = computed(() => groupByDate(filtered.value))

/* 下一个活动 + 实时倒计时（直接依赖 now.value 保证秒级更新） */
const nextEvt = computed(() => nextEvent(events.value, now.value))
const countdown = computed(() => {
  if (!nextEvt.value) return null
  void now.value
  return timeUntil(nextEvt.value.date, nextEvt.value.time)
})

/* 详情弹窗自动滚动 */
async function openDetail(e) {
  showDetail.value = e
  await nextTick()
  if (detailRef.value) detailRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function catInfo(key) { return EVENT_CATEGORIES[key] || EVENT_CATEGORIES.other }
function statusLabel(e) {
  const s = eventStatus(e, now.value)
  if (s === 'ongoing') return '🔴 进行中'
  if (s === 'past') return '✅ 已结束'
  return '⏳ 即将到来'
}
function statusCls(e) {
  const s = eventStatus(e, now.value)
  if (s === 'ongoing') return 'st-ongoing'
  if (s === 'past') return 'st-past'
  return 'st-upcoming'
}
function weekDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}
function toggleExpand(date) { expanded.value = expanded.value === date ? null : date }
function importanceIcon(imp) { return imp === 'critical' ? '🔴' : imp === 'high' ? '🟡' : '⚪' }
function isToday(dateStr) {
  const t = new Date()
  return dateStr === `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}

/* 统计 */
const completedCount = computed(() => events.value.filter(e => eventStatus(e, now.value) === 'past').length)
const totalCount = computed(() => events.value.length)
const progress = computed(() => totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0)
const checkedCount = computed(() => checked.value.size)
const todayEvents = computed(() => events.value.filter(e => isToday(e.date) && !e.pending))

/* 快捷导航到教室 */
function goClassroomNav(loc) {
  const match = loc.match(/计网楼|笃行|立诚|致广|桂\d+/)
  if (match) { emit('open', 'classroomNav') }
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">📅 日程助手</div>
    <div class="view-sub">{{ version.label }}</div>
  </div>

  <!-- 版本选择 -->
  <div v-if="SCHEDULE_VERSIONS.length > 1" class="panel" style="margin-bottom:12px;">
    <div class="ver-row">
      <span class="ver-label">📋 日程版本</span>
      <select v-model="versionId" class="ver-select">
        <option v-for="v in SCHEDULE_VERSIONS" :key="v.id" :value="v.id">{{ v.label }}（{{ v.createdAt }}）</option>
      </select>
    </div>
  </div>

  <!-- 下一个活动提醒（实时倒计时） -->
  <div v-if="nextEvt" class="next-banner" :style="{ '--cat-color': catInfo(nextEvt.category).color }">
    <div class="next-head">
      <span class="next-badge">⏰ 下一个活动</span>
      <span v-if="countdown" class="next-countdown">⏱ {{ countdown.text }}</span>
    </div>
    <div class="next-topic">{{ catInfo(nextEvt.category).icon }} {{ nextEvt.topic }}</div>
    <div class="next-meta">
      <span>📅 {{ nextEvt.date }} {{ weekDay(nextEvt.date) }}</span>
      <span>🕐 {{ nextEvt.time }}</span>
      <span>📍 {{ nextEvt.location }}</span>
    </div>
    <div v-if="nextEvt.preparation?.length" class="next-prep-hint">📋 需准备 {{ nextEvt.preparation.length }} 项</div>
    <button class="next-detail-btn" @click="openDetail(nextEvt)">查看详情 & 准备清单 →</button>
  </div>
  <div v-else class="next-banner empty">
    <div class="next-badge">🎉 入学教育全部完成！</div>
    <div class="next-meta" style="justify-content:center;margin-top:6px;">所有活动已结束，祝研究生生活愉快</div>
  </div>

  <!-- 今日速览 -->
  <div v-if="todayEvents.length" class="panel today-panel">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>📌 今日活动（{{ todayEvents.length }} 场）</div>
    <div v-for="e in todayEvents" :key="e.id" class="today-card" @click="openDetail(e)">
      <span class="today-time">{{ e.time }}</span>
      <span class="today-topic">{{ catInfo(e.category).icon }} {{ e.topic }}</span>
      <span class="today-status" :class="statusCls(e)">{{ statusLabel(e) }}</span>
    </div>
  </div>

  <!-- 进度 + 打卡统计 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="prog-row">
      <span class="prog-label">完成进度</span>
      <span class="prog-num">{{ completedCount }}/{{ totalCount }} 场（{{ progress }}%）</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" :style="{ width: progress + '%' }"></div></div>
    <div v-if="checkedCount" class="prog-checked">✅ 已打卡 {{ checkedCount }} 场</div>
  </div>

  <!-- 专业筛选 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>🎓 选择专业筛选</div>
    <div class="major-chips">
      <button class="major-chip" :class="{ active: !selectedMajor }" @click="selectedMajor = ''">全部专业</button>
      <button v-for="m in MAJORS" :key="m.key" class="major-chip" :class="{ active: selectedMajor === m.key }" @click="filterByMajor(m.key)">
        {{ m.icon }} {{ m.short }}
      </button>
    </div>
  </div>

  <!-- 搜索 + 分类筛选 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="input-row" style="margin-bottom:10px;">
      <input class="input" v-model="searchKw" placeholder="搜索活动名称、地点、参加对象…" />
    </div>
    <div class="cat-chips">
      <button class="cat-chip" :class="{ active: catFilter === '' }" @click="catFilter = ''">全部</button>
      <button v-for="(c, k) in EVENT_CATEGORIES" :key="k" class="cat-chip" :class="{ active: catFilter === k }" :style="{ '--chip-c': c.color }" @click="catFilter = catFilter === k ? '' : k">
        {{ c.icon }} {{ c.label }}
      </button>
    </div>
  </div>

  <!-- 时间轴 -->
  <div class="timeline">
    <div v-for="([date, evts]) in filteredGrouped" :key="date" class="tl-day" :class="{ 'is-today': isToday(date) }">
      <button class="tl-day-head" @click="toggleExpand(date)">
        <span v-if="isToday(date)" class="tl-today-badge">今天</span>
        <span class="tl-date">{{ date.slice(5) }}</span>
        <span class="tl-weekday">{{ weekDay(date) }}</span>
        <span class="tl-count">{{ evts.length }} 场</span>
        <span class="tl-arrow">{{ expanded === date ? '▾' : '▸' }}</span>
      </button>
      <div v-show="expanded === date || catFilter || selectedMajor || searchKw" class="tl-events">
        <div v-for="e in evts" :key="e.id" class="tl-card" :class="[statusCls(e), { 'is-next': nextEvt && e.id === nextEvt.id, 'is-checked': checked.has(e.id) }]" @click="openDetail(e)">
          <div class="tl-left">
            <div class="tl-time">{{ e.time }}</div>
            <button class="tl-check" :class="{ on: checked.has(e.id) }" @click.stop="toggleCheck(e.id)" :title="checked.has(e.id) ? '取消打卡' : '打卡'">
              {{ checked.has(e.id) ? '✅' : '⬜' }}
            </button>
          </div>
          <div class="tl-body">
            <div class="tl-topic">
              <span class="tl-imp" :title="e.importance">{{ importanceIcon(e.importance) }}</span>
              {{ e.topic }}
              <span v-if="e.pending" class="tl-pending">待定</span>
            </div>
            <div class="tl-sub">
              <span class="tl-loc">📍 {{ e.location }}</span>
              <span class="tl-cat-badge" :style="{ background: catInfo(e.category).color }">{{ catInfo(e.category).icon }} {{ catInfo(e.category).label }}</span>
            </div>
            <div class="tl-sub">
              <span class="tl-audience">👥 {{ e.audience }}</span>
              <span v-if="e.speaker && e.speaker !== '/'" class="tl-speaker">🎤 {{ e.speaker }}</span>
            </div>
          </div>
          <span class="tl-status" :class="statusCls(e)">{{ statusLabel(e) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!filteredGrouped.length" class="empty-state">
    <div style="font-size:48px;margin-bottom:12px;">🔍</div>
    <div>没有匹配的活动</div>
  </div>

  <!-- 详情弹窗 -->
  <div v-if="showDetail" class="overlay" @click.self="showDetail = null">
    <div ref="detailRef" class="overlay-card detail-card">
      <div class="detail-head">
        <span class="detail-cat" :style="{ background: catInfo(showDetail.category).color }">{{ catInfo(showDetail.category).icon }} {{ catInfo(showDetail.category).label }}</span>
        <button class="overlay-close" @click="showDetail = null">✕</button>
      </div>
      <div class="detail-title">{{ showDetail.topic }}</div>
      <div class="detail-grid">
        <div class="detail-row"><span>📅 日期</span><b>{{ showDetail.date }} {{ weekDay(showDetail.date) }}</b></div>
        <div class="detail-row"><span>🕐 时间</span><b>{{ showDetail.time }}{{ showDetail.duration ? '（' + showDetail.duration + '）' : '' }}</b></div>
        <div class="detail-row"><span>📍 地点</span><b>{{ showDetail.location }}</b></div>
        <div class="detail-row"><span>👥 参加</span><b>{{ showDetail.audience }}</b></div>
        <div v-if="showDetail.speaker && showDetail.speaker !== '/'" class="detail-row"><span>🎤 主讲</span><b>{{ showDetail.speaker }}</b></div>
        <div class="detail-row"><span>⚡ 重要性</span><b>{{ showDetail.importance === 'critical' ? '🔴 必须参加' : showDetail.importance === 'high' ? '🟡 重要' : '⚪ 一般' }}</b></div>
      </div>
      <div v-if="showDetail.tip" class="detail-tip">💡 {{ showDetail.tip }}</div>
      <div v-if="showDetail.preparation?.length" class="detail-prep">
        <div class="detail-prep-title">✅ 准备清单（点击打勾）</div>
        <div v-for="(p, i) in showDetail.preparation" :key="i" class="detail-prep-item" @click="toggleCheck(showDetail.id + '-' + i)">
          <span class="prep-check">{{ checked.has(showDetail.id + '-' + i) ? '☑️' : '☐' }}</span>
          <span :class="{ 'prep-done': checked.has(showDetail.id + '-' + i) }">{{ p }}</span>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn" style="flex:1;" @click="showDetail = null; $el.closest('.overlay')?.remove()">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.next-banner { background: linear-gradient(135deg, var(--cat-color, var(--primary)), color-mix(in srgb, var(--cat-color, var(--primary)) 70%, #000)); color: #fff; border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 12px; }
.next-banner.empty { background: var(--soft-fg); color: var(--text-sub); text-align: center; }
.next-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.next-badge { font-size: 13px; font-weight: 800; }
.next-countdown { font-size: 13px; font-weight: 800; background: rgba(255,255,255,.2); padding: 3px 10px; border-radius: 999px; font-variant-numeric: tabular-nums; }
.next-topic { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
.next-meta { display: flex; gap: 16px; font-size: 13px; opacity: .9; margin-bottom: 10px; flex-wrap: wrap; }
.next-detail-btn { width: 100%; padding: 10px; border: 1.5px solid rgba(255,255,255,.5); border-radius: 999px; background: rgba(255,255,255,.15); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.next-detail-btn:hover { background: rgba(255,255,255,.3); }
.next-prep-hint { font-size: 12px; opacity: .85; margin-bottom: 8px; }

.today-panel { border-left: 3px solid var(--primary); }
.today-card { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 6px; cursor: pointer; transition: all .15s; }
.today-card:hover { border-color: var(--primary); background: var(--primary-soft); }
.today-time { font-weight: 800; color: var(--primary); min-width: 70px; font-size: 13px; }
.today-topic { flex: 1; font-weight: 600; font-size: 13px; }
.today-status { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.today-status.st-ongoing { background: #dcfce7; color: #166534; }
.today-status.st-past { background: var(--soft-gray); color: var(--text-sub); }
.today-status.st-upcoming { background: var(--primary-soft); color: var(--primary); }

.prog-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.prog-label { font-size: 13px; font-weight: 700; }
.prog-num { font-size: 12px; color: var(--text-sub); }
.prog-bar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; }
.prog-fill { height: 100%; border-radius: 999px; background: var(--primary); transition: width .5s ease; }
.prog-checked { font-size: 12px; color: var(--text-sub); margin-top: 6px; }

.major-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.major-chip { padding: 6px 14px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.major-chip:hover { border-color: var(--primary); }
.major-chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }

.cat-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-chip { padding: 5px 12px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-size: 12px; cursor: pointer; transition: all .15s; }
.cat-chip:hover { border-color: var(--chip-c, var(--primary)); }
.cat-chip.active { background: var(--chip-c, var(--primary)); border-color: var(--chip-c, var(--primary)); color: #fff; }

.ver-row { display: flex; align-items: center; gap: 10px; }
.ver-label { font-size: 13px; font-weight: 700; flex-shrink: 0; }
.ver-select { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 13px; outline: none; }

.timeline { display: flex; flex-direction: column; gap: 12px; }
.tl-day { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--card); }
.tl-day.is-today { border-color: var(--primary); border-width: 2px; }
.tl-day-head { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--soft-fg); border: none; cursor: pointer; color: var(--text); text-align: left; }
.tl-day.is-today .tl-day-head { background: var(--primary-soft); }
.tl-day-head:hover { background: var(--primary-soft); }
.tl-today-badge { font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: var(--primary); color: #fff; }
.tl-date { font-size: 16px; font-weight: 800; color: var(--primary); }
.tl-weekday { font-size: 13px; color: var(--text-sub); }
.tl-count { margin-left: auto; font-size: 12px; color: var(--text-sub); background: var(--border); padding: 2px 8px; border-radius: 999px; }
.tl-arrow { font-size: 12px; color: var(--text-sub); }
.tl-events { padding: 4px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
.tl-card { display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all .15s; align-items: flex-start; }
.tl-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
.tl-card.is-next { border-color: var(--primary); border-width: 2px; background: var(--primary-soft); }
.tl-card.is-checked { border-left: 3px solid #22c55e; }
.tl-card.st-past { opacity: .55; }
.tl-card.st-ongoing { border-color: #22c55e; background: #f0fdf4; }
.tl-left { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.tl-time { font-size: 14px; font-weight: 800; color: var(--primary); min-width: 80px; text-align: center; }
.tl-check { background: none; border: none; cursor: pointer; font-size: 18px; padding: 0; transition: transform .15s; }
.tl-check:hover { transform: scale(1.2); }
.tl-check.on { animation: checkPop .3s ease; }
@keyframes checkPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
.tl-body { flex: 1; min-width: 0; }
.tl-topic { font-weight: 700; font-size: 14px; line-height: 1.4; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.tl-imp { font-size: 12px; }
.tl-pending { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: #fef3c7; color: #92400e; }
.tl-sub { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--text-sub); }
.tl-loc, .tl-audience, .tl-speaker { white-space: nowrap; }
.tl-cat-badge { font-size: 10px; padding: 1px 8px; border-radius: 999px; color: #fff; font-weight: 600; }
.tl-status { font-size: 11px; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; align-self: flex-start; font-weight: 600; }
.tl-status.st-ongoing { background: #dcfce7; color: #166534; }
.tl-status.st-past { background: var(--soft-gray); color: var(--text-sub); }
.tl-status.st-upcoming { background: var(--primary-soft); color: var(--primary); }

.empty-state { text-align: center; padding: 40px 0; color: var(--text-sub); font-size: 14px; }

.detail-card { max-height: 80vh; overflow-y: auto; }
.detail-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.detail-cat { font-size: 12px; padding: 4px 12px; border-radius: 999px; color: #fff; font-weight: 700; }
.detail-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; line-height: 1.4; }
.detail-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.detail-row { display: flex; gap: 10px; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed var(--border); }
.detail-row span { flex: 0 0 70px; color: var(--text-sub); }
.detail-row b { flex: 1; color: var(--text); font-weight: 600; }
.detail-tip { padding: 12px; background: var(--soft-yellow, #fff8e1); border: 1px dashed var(--accent, #b8860b); border-radius: 10px; font-size: 13px; line-height: 1.7; margin-bottom: 16px; }
.detail-prep { background: var(--soft-fg); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.detail-prep-title { font-weight: 700; font-size: 14px; margin-bottom: 10px; }
.detail-prep-item { font-size: 13px; padding: 8px 0; border-bottom: 1px dashed var(--border); display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background .1s; }
.detail-prep-item:last-child { border-bottom: none; }
.detail-prep-item:hover { background: var(--primary-soft); border-radius: 6px; padding-left: 4px; }
.prep-check { font-size: 16px; }
.prep-done { text-decoration: line-through; opacity: .5; }
.detail-actions { display: flex; gap: 8px; }

@media (max-width: 640px) {
  .next-banner { padding: 14px 16px; }
  .next-topic { font-size: 16px; }
  .next-meta { flex-direction: column; gap: 4px; }
  .next-countdown { font-size: 12px; }
  .tl-card { flex-direction: column; gap: 6px; }
  .tl-left { flex-direction: row; justify-content: space-between; }
  .tl-time { min-width: auto; text-align: left; }
  .tl-sub { flex-direction: column; gap: 4px; }
  .tl-loc, .tl-audience, .tl-speaker { white-space: normal; }
  .detail-row { flex-direction: column; gap: 2px; }
  .detail-row span { flex: none; }
  .cat-chips { gap: 4px; }
  .cat-chip { padding: 4px 10px; font-size: 11px; }
  .major-chips { gap: 4px; }
  .major-chip { padding: 5px 12px; font-size: 12px; }
  .today-card { flex-direction: column; gap: 4px; }
  .today-time { min-width: auto; }
}
</style>
