<script setup>
/**
 * 日程助手 v3：实时倒计时全覆盖 + 地点跳转地图 + 智能提醒 + 出席打卡 + 专业筛选
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  SCHEDULE_VERSIONS, EVENT_CATEGORIES, MAJORS, audienceMajors,
  groupByDate, eventStatus, nextEvent, timeUntil, nextEventDate,
  eventCountdown, isImminent,
} from '../data/orientationSchedule'
import { setNavContext } from '../stores/navContext'

const emit = defineEmits(['back', 'open'])

const versionId = ref(SCHEDULE_VERSIONS[0]?.id || '')
const version = computed(() => SCHEDULE_VERSIONS.find(v => v.id === versionId.value) || SCHEDULE_VERSIONS[0])
const events = computed(() => version.value?.events || [])

const catFilter = ref('')
const selectedMajor = ref('')
const searchKw = ref('')
const expanded = ref(null)
const showDetail = ref(null)
const checked = ref(new Set())
const detailRef = ref(null)
const showTips = ref(false)

const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

onMounted(() => {
  const sv = localStorage.getItem('fjnu_schedule_version')
  if (sv && SCHEDULE_VERSIONS.some(v => v.id === sv)) versionId.value = sv
  const sc = localStorage.getItem('fjnu_schedule_checked')
  if (sc) try { checked.value = new Set(JSON.parse(sc)) } catch {}
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

function filterByMajor(m) { selectedMajor.value = selectedMajor.value === m ? '' : m }

const filtered = computed(() => {
  let list = events.value
  if (catFilter.value) list = list.filter(e => e.category === catFilter.value)
  if (selectedMajor.value) list = list.filter(e => audienceMajors(e.audience).includes(selectedMajor.value))
  if (searchKw.value) {
    const kw = searchKw.value.toLowerCase()
    list = list.filter(e => e.topic.toLowerCase().includes(kw) || e.location.toLowerCase().includes(kw) || e.audience.toLowerCase().includes(kw))
  }
  return list
})
const filteredGrouped = computed(() => groupByDate(filtered.value))

const nextEvt = computed(() => {
  let evts = events.value
  if (selectedMajor.value) evts = evts.filter(e => audienceMajors(e.audience).includes(selectedMajor.value))
  return nextEvent(evts, now.value)
})
const countdown = computed(() => {
  if (!nextEvt.value) return null
  void now.value
  return timeUntil(nextEvt.value.date, nextEvt.value.time)
})

function getCD(e) { return eventCountdown(e, now.value) }
function getImminent(e) { return isImminent(e, now.value) }

async function openDetail(e) {
  showDetail.value = e
  await nextTick()
  if (detailRef.value) detailRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function catInfo(k) { return EVENT_CATEGORIES[k] || EVENT_CATEGORIES.other }
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
function weekDay(ds) { return ['周日','周一','周二','周三','周四','周五','周六'][new Date(ds+'T00:00:00').getDay()] }
function toggleExpand(d) { expanded.value = expanded.value === d ? null : d }
function impIcon(i) { return i === 'critical' ? '🔴' : i === 'high' ? '🟡' : '⚪' }
function isToday(ds) {
  const t = new Date()
  return ds === `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}

const completedCount = computed(() => events.value.filter(e => eventStatus(e, now.value) === 'past').length)
const totalCount = computed(() => events.value.length)
const progress = computed(() => totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0)
const checkedCount = computed(() => checked.value.size)
const todayEvents = computed(() => {
  void now.value
  let list = events.value.filter(e => isToday(e.date) && !e.pending)
  if (selectedMajor.value) list = list.filter(e => audienceMajors(e.audience).includes(selectedMajor.value))
  return list
})
const imminentCount = computed(() => {
  let list = events.value.filter(e => getImminent(e))
  if (selectedMajor.value) list = list.filter(e => audienceMajors(e.audience).includes(selectedMajor.value))
  return list.length
})

function goClassroomNav(loc) {
  if (loc) setNavContext({ room: loc })
  emit('open', 'classroomNav')
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

  <!-- 智能提醒横幅 -->
  <div v-if="imminentCount > 0" class="alert-banner">
    <span class="alert-icon">🔔</span>
    <span>有 <b>{{ imminentCount }}</b> 场活动即将在30分钟内开始！</span>
  </div>

  <!-- 下一个活动提醒 -->
  <div v-if="nextEvt" class="next-banner" :style="{ '--cat-color': catInfo(nextEvt.category).color }">
    <div class="next-head">
      <span class="next-badge">⏰ 下一个活动</span>
      <span v-if="countdown" class="next-countdown">⏱ {{ countdown.text }}</span>
    </div>
    <div class="next-topic">{{ catInfo(nextEvt.category).icon }} {{ nextEvt.topic }}</div>
    <div class="next-meta">
      <span>📅 {{ nextEvt.date }} {{ weekDay(nextEvt.date) }}</span>
      <span>🕐 {{ nextEvt.time }}</span>
      <span class="next-loc" @click.stop="goClassroomNav(nextEvt.location)">📍 {{ nextEvt.location }} 🧭</span>
    </div>
    <div v-if="nextEvt.preparation?.length" class="next-prep-hint">📋 需准备 {{ nextEvt.preparation.length }} 项</div>
    <div class="next-btns">
      <button class="next-detail-btn" @click="openDetail(nextEvt)">查看详情 & 准备清单 →</button>
    </div>
  </div>
  <div v-else class="next-banner empty">
    <div class="next-badge">🎉 入学教育全部完成！</div>
  </div>

  <!-- 今日速览 -->
  <div v-if="todayEvents.length" class="panel today-panel">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>📌 今日活动（{{ todayEvents.length }} 场）</div>
    <div v-for="e in todayEvents" :key="e.id" class="today-card" :class="{ imminent: getImminent(e) }" @click="openDetail(e)">
      <span class="today-time">{{ e.time }}</span>
      <span class="today-topic">{{ catInfo(e.category).icon }} {{ e.topic }}</span>
      <span v-if="getCD(e)" class="today-cd">⏱ {{ getCD(e) }}</span>
      <span class="today-status" :class="statusCls(e)">{{ statusLabel(e) }}</span>
    </div>
  </div>

  <!-- 进度 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="prog-row">
      <span class="prog-label">完成进度</span>
      <span class="prog-num">{{ completedCount }}/{{ totalCount }} 场（{{ progress }}%）<span v-if="checkedCount"> · 已打卡 {{ checkedCount }}</span></span>
    </div>
    <div class="prog-bar"><div class="prog-fill" :style="{ width: progress + '%' }"></div></div>
  </div>

  <!-- 专业筛选 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>🎓 选择专业</div>
    <div class="major-chips">
      <button class="major-chip" :class="{ active: !selectedMajor }" @click="selectedMajor = ''">全部</button>
      <button v-for="m in MAJORS" :key="m.key" class="major-chip" :class="{ active: selectedMajor === m.key }" @click="filterByMajor(m.key)">
        {{ m.icon }} {{ m.short }}
      </button>
    </div>
  </div>

  <!-- 搜索 + 分类 -->
  <div class="panel" style="margin-bottom:12px;">
    <div class="input-row" style="margin-bottom:10px;">
      <input class="input" v-model="searchKw" placeholder="搜索活动名称、地点…" />
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
      <div v-show="expanded === date" class="tl-events">
        <div v-for="e in evts" :key="e.id" class="tl-card" :class="[statusCls(e), { 'is-next': nextEvt && e.id === nextEvt.id, 'is-checked': checked.has(e.id), imminent: getImminent(e) }]" @click="openDetail(e)">
          <div class="tl-left">
            <div class="tl-time">{{ e.time }}</div>
            <button class="tl-check" :class="{ on: checked.has(e.id) }" @click.stop="toggleCheck(e.id)" :title="checked.has(e.id) ? '取消打卡' : '打卡'">
              {{ checked.has(e.id) ? '✅' : '⬜' }}
            </button>
          </div>
          <div class="tl-body">
            <div class="tl-topic">
              <span class="tl-imp">{{ impIcon(e.importance) }}</span>
              {{ e.topic }}
              <span v-if="e.pending" class="tl-pending">待定</span>
              <span v-if="getCD(e)" class="tl-cd-badge">⏱ {{ getCD(e) }}</span>
              <span v-if="getImminent(e)" class="tl-alert-badge">⚡即将开始</span>
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

  <!-- 实用信息 -->
  <div class="panel tips-panel" @click="showTips = !showTips">
    <div class="section-title" style="margin:0;"><span class="bar"></span>💡 实用信息 <span style="float:right;font-size:12px;">{{ showTips ? '▾' : '▸' }}</span></div>
    <div v-show="showTips" class="tips-body">
      <div class="tip-item"><span>📍 计网楼</span><span>旗山校区东门进，直行约200米</span></div>
      <div class="tip-item"><span>📍 笃行楼</span><span>校训「行笃」，旗山校区中部</span></div>
      <div class="tip-item"><span>📍 立诚楼</span><span>校训「立诚」，旗山校区</span></div>
      <div class="tip-item"><span>📍 致广楼</span><span>校训「致广」，旗山校区</span></div>
      <div class="tip-item"><span>📍 东区田径场</span><span>旗山校区东区，开学典礼用</span></div>
      <div class="tip-item"><span>📍 图书馆大会堂</span><span>图书馆一楼</span></div>
      <div class="tip-item"><span>📍 旗山校区校医院</span><span>体检用，注意空腹</span></div>
      <div class="tip-item" style="border:none;"><span>🧭</span><span>点击详情中的地点可跳转教室导航查看教学楼</span></div>
    </div>
  </div>

  <!-- 详情弹窗 -->
  <div v-if="showDetail" class="overlay" @click.self="showDetail = null">
    <div ref="detailRef" class="overlay-card detail-card">
      <div class="detail-head">
        <span class="detail-cat" :style="{ background: catInfo(showDetail.category).color }">{{ catInfo(showDetail.category).icon }} {{ catInfo(showDetail.category).label }}</span>
        <button class="overlay-close" @click="showDetail = null">✕</button>
      </div>
      <div class="detail-title">{{ showDetail.topic }}</div>
      <div v-if="getCD(showDetail)" class="detail-countdown">⏱ 距开始还有 {{ getCD(showDetail) }}</div>
      <div v-if="getImminent(showDetail)" class="detail-imminent">⚡ 即将开始！请尽快前往</div>
      <div class="detail-grid">
        <div class="detail-row"><span>📅 日期</span><b>{{ showDetail.date }} {{ weekDay(showDetail.date) }}</b></div>
        <div class="detail-row"><span>🕐 时间</span><b>{{ showDetail.time }}{{ showDetail.duration ? '（' + showDetail.duration + '）' : '' }}</b></div>
        <div class="detail-row"><span>📍 地点</span><b class="detail-loc" @click="goClassroomNav(showDetail.location); showDetail = null">{{ showDetail.location }} 🧭</b></div>
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
        <button class="btn accent" @click="showDetail = null" style="width:100%;">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: var(--radius); margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #92400e; animation: alertPulse 2s ease infinite; }
@keyframes alertPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.3); } 50% { box-shadow: 0 0 0 8px rgba(251,191,36,0); } }
.alert-icon { font-size: 18px; }

.next-banner { background: linear-gradient(135deg, var(--cat-color, var(--primary)), color-mix(in srgb, var(--cat-color, var(--primary)) 70%, #000)); color: #fff; border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 12px; }
.next-banner.empty { background: var(--soft-fg); color: var(--text-sub); text-align: center; }
.next-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.next-badge { font-size: 13px; font-weight: 800; }
.next-countdown { font-size: 13px; font-weight: 800; background: rgba(255,255,255,.2); padding: 3px 10px; border-radius: 999px; font-variant-numeric: tabular-nums; }
.next-topic { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
.next-meta { display: flex; gap: 14px; font-size: 13px; opacity: .9; margin-bottom: 10px; flex-wrap: wrap; }
.next-loc { cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.next-loc:hover { opacity: .8; }
.next-prep-hint { font-size: 12px; opacity: .85; margin-bottom: 8px; }
.next-btns { display: flex; gap: 8px; }
.next-detail-btn { flex: 1; padding: 10px; border: 1.5px solid rgba(255,255,255,.5); border-radius: 999px; background: rgba(255,255,255,.15); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.next-detail-btn:hover { background: rgba(255,255,255,.3); }

.today-panel { border-left: 3px solid var(--primary); }
.today-card { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 6px; cursor: pointer; transition: all .15s; }
.today-card:hover { border-color: var(--primary); background: var(--primary-soft); }
.today-card.imminent { border-color: #f59e0b; background: #fffbeb; }
.today-time { font-weight: 800; color: var(--primary); min-width: 70px; font-size: 13px; }
.today-topic { flex: 1; font-weight: 600; font-size: 13px; }
.today-cd { font-size: 11px; font-weight: 700; color: #f59e0b; font-variant-numeric: tabular-nums; }
.today-status { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.today-status.st-ongoing { background: #dcfce7; color: #166534; }
.today-status.st-past { background: var(--soft-gray); color: var(--text-sub); }
.today-status.st-upcoming { background: var(--primary-soft); color: var(--primary); }

.prog-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.prog-label { font-size: 13px; font-weight: 700; }
.prog-num { font-size: 12px; color: var(--text-sub); }
.prog-bar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; }
.prog-fill { height: 100%; border-radius: 999px; background: var(--primary); transition: width .5s ease; }

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
.tl-card.imminent { border-color: #f59e0b; background: #fffbeb; animation: imminentPulse 1.5s ease infinite; }
@keyframes imminentPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,.2); } 50% { box-shadow: 0 0 0 6px rgba(245,158,11,0); } }
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
.tl-cd-badge { font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: #dbeafe; color: #1e40af; font-variant-numeric: tabular-nums; }
.tl-alert-badge { font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; animation: alertBlink 1s ease infinite; }
@keyframes alertBlink { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
.tl-sub { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--text-sub); }
.tl-loc { cursor: pointer; }
.tl-loc:hover { color: var(--primary); }
.tl-cat-badge { font-size: 10px; padding: 1px 8px; border-radius: 999px; color: #fff; font-weight: 600; }
.tl-status { font-size: 11px; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; align-self: flex-start; font-weight: 600; }
.tl-status.st-ongoing { background: #dcfce7; color: #166534; }
.tl-status.st-past { background: var(--soft-gray); color: var(--text-sub); }
.tl-status.st-upcoming { background: var(--primary-soft); color: var(--primary); }

.tips-panel { cursor: pointer; }
.tips-body { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.tip-item { display: flex; gap: 12px; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed var(--border); }
.tip-item:last-child { border: none; }
.tip-item span:first-child { font-weight: 700; min-width: 100px; color: var(--text); }
.tip-item span:last-child { color: var(--text-sub); }

.empty-state { text-align: center; padding: 40px 0; color: var(--text-sub); font-size: 14px; }

.detail-card { max-height: 85vh; overflow-y: auto; }
.detail-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.detail-cat { font-size: 12px; padding: 4px 12px; border-radius: 999px; color: #fff; font-weight: 700; }
.detail-title { font-size: 20px; font-weight: 800; margin-bottom: 12px; line-height: 1.4; }
.detail-countdown { font-size: 15px; font-weight: 800; color: var(--primary); margin-bottom: 8px; padding: 8px 12px; background: var(--primary-soft); border-radius: 8px; font-variant-numeric: tabular-nums; }
.detail-imminent { font-size: 14px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; animation: alertPulse 2s ease infinite; }
.detail-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.detail-row { display: flex; gap: 10px; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed var(--border); }
.detail-row span { flex: 0 0 70px; color: var(--text-sub); }
.detail-row b { flex: 1; color: var(--text); font-weight: 600; }
.detail-loc { cursor: pointer; color: var(--primary) !important; }
.detail-loc:hover { text-decoration: underline; }
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
  .tl-card { flex-direction: column; gap: 6px; }
  .tl-left { flex-direction: row; justify-content: space-between; }
  .tl-time { min-width: auto; text-align: left; }
  .tl-sub { flex-direction: column; gap: 4px; }
  .tl-loc, .tl-audience, .tl-speaker { white-space: normal; }
  .detail-row { flex-direction: column; gap: 2px; }
  .detail-row span { flex: none; }
  .cat-chips, .major-chips { gap: 4px; }
  .cat-chip, .major-chip { padding: 4px 10px; font-size: 11px; }
  .today-card { flex-direction: column; gap: 4px; }
}
</style>
