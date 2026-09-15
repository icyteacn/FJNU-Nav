<script setup>
/** 课程表：班级/教室/教师课表查询 + 研究生课表 + 官方课程总表入口
 *  数据来自本地快照（loadSnap），网关可用时用网关补充元信息
 *  灵感参考：https://nfs.pcdawn.cn/app/timetable（NextFStar 周视图网格 + 实时时间线）
 *  本项目保留原有班级/教室/教师三维查询 + 周视图/列表视图切换，未完全复刻课程编辑器和分享功能。
 */
import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick, inject } from 'vue'
import { apiFetch } from '../api/index'
import { loadSnap } from '../api/localCourse'
import { loadTimetableMeta, loadTermRows } from '../api/termTimetable'
import { normRoom, clsSplit, profOf, gradeOf, parseWeeks } from '../utils/course'
import { fmtTime } from '../utils/format'
import { setNavContext } from '../stores/navContext'
import ClassSchedule from './ClassSchedule.vue'
import { COURSES as GRAD_COURSES, MAJORS, SINGLE_PERIOD_TIMES, TABLE_ROWS } from '../data/classSchedule'

const emit = defineEmits(['back', 'open'])

const setSubTour = inject('setSubTour', () => {})

const mainTab = ref('graduate') // 'graduate' | 'school'
const tab = ref('class')
const kw = ref('')
const snap = ref(null)

watch(mainTab, (val) => { setSubTour(val) }, { immediate: true })

const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))
const mounted = ref(false)

const todayDateStr = computed(() => {
  const d = now.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
const todayWeekday = computed(() => { const d = now.value.getDay(); return d === 0 ? 7 : d })

const highlightToday = ref(true)
/** 当前学期排课（shallowRef：数据只读，避免 Vue 深度代理 5k+ 元素数组拖慢遍历） */
const termRows = shallowRef([])
const loading = ref(true)
const opened = ref(null)
const term = ref('')
const weekFilter = ref('')

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const PERIOD = 12

/** 研究生课程转为全校总表行格式 */
const GRAD_SEMESTER = '2026-2027学年第一学期'
const gradRows = GRAD_COURSES.map(c => {
  const major = MAJORS.find(m => m.key === c.major)
  const clsName = major ? major.short : c.major
  return {
    c: c.name, cls: clsName, d: c.weekday, s: c.startPeriod, e: c.endPeriod,
    r: c.location, t: c.teacher, w: c.weeks, campus: '旗山校区',
    cat: c.category, credit: c.credits, _color: c.color, _major: c.major,
  }
})

onMounted(async () => {
  const mm = await loadTimetableMeta()
  if (mm && mm.semesters && mm.semesters.length) {
    snap.value = mm
    const cur = mm.semesters.find((s) => s.semester === mm.currentSemester) || mm.semesters[0]
    term.value = cur.semester
    const t = await loadTermRows(cur.file)
    termRows.value = t.rows || []
  } else {
    const d = await loadSnap()
    snap.value = d
    termRows.value = d?.rows || []
    term.value = d?.courseTable?.semester || ''
  }
  loading.value = false
  nextTick(() => { mounted.value = true })
})

const semester = computed(() => snap.value?.courseTable?.semester || '')

const semesters = computed(() => {
  const s = snap.value?.semesters?.map((t) => t.semester) || []
  const base = s.length ? s : [semester.value]
  return [GRAD_SEMESTER, ...base]
})

/** termRows 始终是「当前选中学期」的 rows（onMounted/switchTerm 已按学期载入），直接返回省去重复 filter */
const curRows = computed(() => term.value === GRAD_SEMESTER ? gradRows : termRows.value)

const rooms = computed(() => [...new Set(curRows.value.map((r) => r.r && normRoom(r.r)).filter(Boolean))].sort())
const teachers = computed(() => [...new Set(curRows.value.map((r) => r.t).filter(Boolean))])

const sourceName = computed(() => (tab.value === 'class' ? '班级' : tab.value === 'room' ? '教室' : '教师'))

const singleClasses = computed(() => {
  const set = new Set()
  for (const r of curRows.value) clsSplit(r.cls).forEach((c) => set.add(c))
  return [...set].sort((a, b) => {
    const y = (s) => Number((s.match(/^2\d/) || [0])[0])
    return y(b) - y(a) || a.localeCompare(b, 'zh')
  })
})
const years = computed(() => [...new Set(singleClasses.value.map((c) => gradeOf(c)).filter(Boolean))].sort().reverse())
const profs = computed(() => {
  const m = {}
  for (const c of singleClasses.value) {
    const p = profOf(c)
    if (p) m[p] = (m[p] || 0) + 1
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([p]) => p)
})
const gradeFilter = ref('')
const profFilter = ref('')

const result = computed(() => {
  const k = kw.value.trim()
  if (tab.value === 'class') {
    let list = singleClasses.value
    if (gradeFilter.value) list = list.filter((c) => gradeOf(c) === gradeFilter.value)
    if (profFilter.value) list = list.filter((c) => profOf(c) === profFilter.value)
    if (k) {
      const pre = list.filter((c) => c.startsWith(k))
      list = pre.length ? pre : list.filter((c) => c.includes(k))
    }
    return list
  }
  const src = tab.value === 'room' ? rooms.value : teachers.value
  return k ? src.filter((x) => x.includes(k)) : src
})

const resultItems = computed(() => result.value.map((name) => ({ name, count: counts.value.get(name) || 0 })))

const PAGE_SIZE = 10
const page = ref(1)
const expandAll = ref(false)
const pageCount = computed(() => Math.max(1, Math.ceil(resultItems.value.length / PAGE_SIZE)))
const shown = computed(() =>
  expandAll.value
    ? resultItems.value
    : resultItems.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)
function toggleExpand() {
  expandAll.value = !expandAll.value
}

/** 智能页码：页数多时折叠为 首 1 2 3 … 末几页 */
const pageNos = computed(() => {
  const total = pageCount.value
  if (expandAll.value || total <= 7) {
    return expandAll.value ? [] : Array.from({ length: total }, (_, i) => i + 1)
  }
  const cur = page.value
  const nums = [...new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of nums) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
})
const jumpPage = ref('')
function goPage(n) {
  const num = Math.floor(Number(n))
  if (!Number.isFinite(num)) return
  page.value = Math.max(1, Math.min(pageCount.value, num))
  jumpPage.value = ''
}

watch([kw, gradeFilter, profFilter, tab, term], () => {
  page.value = 1
  expandAll.value = false
})

function switchTab(t) {
  tab.value = t
  gradeFilter.value = ''
  profFilter.value = ''
  page.value = 1
  expandAll.value = false
}

async function switchTerm(t) {
  term.value = t
  kw.value = ''
  gradeFilter.value = ''
  profFilter.value = ''
  opened.value = null
  page.value = 1
  expandAll.value = false
  if (t === GRAD_SEMESTER) return
  const mm = snap.value
  const cur = mm?.semesters?.find((s) => s.semester === t)
  if (cur) {
    const d = await loadTermRows(cur.file)
    termRows.value = d.rows || []
  }
}

// ===== 时间射线 — 全校课程总表 =====
const PERIOD_BOUNDS = [
  { start: 8*60+20, end: 9*60+5,   row: 1 },
  { start: 9*60+15, end: 10*60,     row: 2 },
  { start: 10*60+20, end: 11*60+5,  row: 3 },
  { start: 11*60+15, end: 12*60,     row: 4 },
  { start: 14*60,     end: 14*60+45, row: 5 },
  { start: 14*60+55, end: 15*60+40, row: 6 },
  { start: 15*60+50, end: 16*60+35, row: 7 },
  { start: 16*60+45, end: 17*60+30, row: 8 },
  { start: 18*60+30, end: 19*60+15, row: 9 },
  { start: 19*60+25, end: 20*60+10, row: 10 },
  { start: 20*60+20, end: 21*60+5,  row: 11 },
  { start: 21*60+15, end: 22*60,     row: 12 },
]

function getRowTop(period) {
  const table = document.querySelector('.tt-table')
  if (!table) return null
  const tr = table.querySelector(`tr[data-period="${period}"]`)
  if (!tr) return null
  const wrapper = document.querySelector('.tt-table-wrap')
  if (!wrapper) return null
  return tr.getBoundingClientRect().top - wrapper.getBoundingClientRect().top
}

function getRowBottom(period) {
  const top = getRowTop(period)
  if (top === null) return null
  const table = document.querySelector('.tt-table')
  if (!table) return null
  const tr = table.querySelector(`tr[data-period="${period}"]`)
  if (!tr) return null
  return top + tr.offsetHeight
}

function getHeaderBottom() {
  const table = document.querySelector('.tt-table')
  if (!table) return 0
  const thead = table.querySelector('thead')
  if (!thead) return 0
  const wrapper = document.querySelector('.tt-table-wrap')
  if (!wrapper) return 0
  return thead.getBoundingClientRect().bottom - wrapper.getBoundingClientRect().top
}

const timeLinePos = computed(() => {
  if (!highlightToday.value || !mounted.value || mainTab.value !== 'school' || !opened.value) return null
  const cur = now.value
  const h = cur.getHours(), m = cur.getMinutes()
  const t = h * 60 + m
  if (t < 8 * 60 + 20 || t >= 22 * 60) return null

  const headerBottom = getHeaderBottom()
  if (!headerBottom) return null

  for (const bound of PERIOD_BOUNDS) {
    if (t >= bound.start && t < bound.end) {
      const top = getRowTop(bound.row)
      const bottom = getRowBottom(bound.row)
      if (top === null || bottom === null) return null
      const progress = (t - bound.start) / (bound.end - bound.start)
      return top + progress * (bottom - top)
    }
  }

  for (let i = PERIOD_BOUNDS.length - 1; i >= 0; i--) {
    const bound = PERIOD_BOUNDS[i]
    if (t >= bound.end) {
      const bottom = getRowBottom(bound.row)
      if (bottom === null) return null
      return bottom
    }
  }

  return headerBottom
})

const timeLineWeekday = computed(() => {
  if (!highlightToday.value || !mounted.value || mainTab.value !== 'school' || !opened.value) return null
  const day = now.value.getDay()
  return day === 0 ? 7 : day
})

function getTodayColumnLeft() {
  const table = document.querySelector('.tt-table')
  if (!table) return 0
  const periodCol = table.querySelector('.tt-period-col')
  if (!periodCol) return 0
  const periodWidth = periodCol.offsetWidth
  const todayIndex = dayNames.findIndex((d, i) => i + 1 === timeLineWeekday.value)
  if (todayIndex === -1) return periodWidth
  const cols = table.querySelectorAll('.tt-weekday-col')
  if (cols[todayIndex]) return cols[todayIndex].offsetLeft
  return periodWidth + todayIndex * 80
}

function getTodayColumnWidth() {
  const table = document.querySelector('.tt-table')
  if (!table) return 80
  const todayIndex = dayNames.findIndex((d, i) => i + 1 === timeLineWeekday.value)
  const cols = table.querySelectorAll('.tt-weekday-col')
  if (cols[todayIndex]) return cols[todayIndex].offsetWidth
  return 80
}

function isTodayCol(d) {
  if (!highlightToday.value || !mounted.value) return false
  return d === todayWeekday.value
}

/** 各班级/教室/教师的一次性计数表（遍历一次 curRows 建 Map，供 resultItems O(1) 查询） */
const counts = computed(() => {
  const rows = curRows.value
  const m = new Map()
  const mode = tab.value
  if (mode === 'class') {
    for (const r of rows) {
      for (const c of clsSplit(r.cls)) m.set(c, (m.get(c) || 0) + 1)
    }
  } else if (mode === 'room') {
    for (const r of rows) {
      const k = normRoom(r.r)
      if (k) m.set(k, (m.get(k) || 0) + 1)
    }
  } else {
    for (const r of rows) if (r.t) m.set(r.t, (m.get(r.t) || 0) + 1)
  }
  return m
})

function coursesOf(obj) {
  const rows = curRows.value
  if (tab.value === 'class') return rows.filter((r) => clsSplit(r.cls).includes(obj))
  if (tab.value === 'room') return rows.filter((r) => normRoom(r.r) === obj)
  return rows.filter((r) => r.t === obj)
}

function open(obj) {
  const list = coursesOf(obj)
  const days = {}
  for (const co of list) {
    if (!days[co.d]) days[co.d] = []
    days[co.d].push(co)
  }
  opened.value = { name: obj, mode: tab.value, count: list.length, days }
  weekFilter.value = ''
}

const weekOptions = computed(() => {
  if (!opened.value) return []
  const s = new Set()
  for (const d of Object.values(opened.value.days)) for (const co of d) parseWeeks(co.w).forEach((n) => s.add(n))
  return [...s].sort((a, b) => a - b)
})

function subOf(co) {
  if (opened.value.mode === 'room') return `${co.cls} · ${co.t}`
  if (opened.value.mode === 'teacher') return `${co.cls} · ${co.r}`
  return [co.t, co.r].filter(Boolean).join(' · ') || co.cls
}

/** 表格视图辅助函数 */
function getCourseCell(weekday, period) {
  if (!opened.value) return null
  const list = opened.value.days?.[weekday] || []
  return list.find(co => period >= co.s && period <= co.e && (!weekFilter.value || parseWeeks(co.w).has(+weekFilter.value))) || null
}
function getCourseSpan(co) { return co ? (co.e - co.s + 1) : 1 }
function isCellMerged(weekday, period) {
  if (!opened.value) return false
  const list = opened.value.days?.[weekday] || []
  return list.some(co => period > co.s && period <= co.e && (!weekFilter.value || parseWeeks(co.w).has(+weekFilter.value)))
}
function getCourseColor(co, alpha = 1) {
  if (!co?._color) return alpha === 1 ? 'var(--primary)' : 'var(--primary-soft)'
  const hex = co._color
  return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`
}
const TABLE_ROWS_TIMETABLE = TABLE_ROWS

/** 周课表视图：网格 / 列表；点击课程弹出详情 */
const viewMode = ref('grid')
const detail = ref(null)
function showCourse(co) {
  detail.value = co
}
const dayLabel = (d) => dayNames[d - 1] || ('周' + d)

const dayCourses = (d) => {
  const list = (opened.value?.days?.[d] || [])
    .slice()
    .filter((co) => !weekFilter.value || parseWeeks(co.w).has(+weekFilter.value))
    .sort((a, b) => a.s - b.s || (a.c < b.c ? -1 : a.c > b.c ? 1 : 0))
  // 同一课程·同一节次多位教师（分段授课，如大学英语读写译 4 位老师）合并为一条
  const map = new Map()
  for (const co of list) {
    const k = co.c + '|' + co.s + '|' + co.e
    if (!map.has(k)) map.set(k, { ...co, tList: [], wList: [] })
    const g = map.get(k)
    if (!g.tList.includes(co.t)) g.tList.push(co.t)
    if (!g.wList.includes(co.w)) g.wList.push(co.w)
  }
  return [...map.values()].map((g) => ({ ...g, t: g.tList.join('、'), w: g.wList.join('、') }))
}

/** 合班备注：该课面向哪些班（与当前查看对象不同或含范围时提示） */
function clsNote(co) {
  const raw = co.cls
  if (!raw) return ''
  if (opened.value?.mode !== 'class') return raw
  if (raw === opened.value.name) return ''
  return '合班 ' + raw
}

// 官方课程总表
const courses = ref(null)
const coursesLoading = ref(true)
async function loadCourses(force) {
  coursesLoading.value = true
  courses.value = await apiFetch('/courses' + (force ? '?force=1' : ''))
  coursesLoading.value = false
}
onMounted(loadCourses)

function goClassroomNav(room) {
  setNavContext({ room })
  emit('open', 'classroomNav')
}
function goCanteen() {
  emit('open', 'canteen')
}
</script>

<template>
<div class="view-top">
      <button class="back-btn" @click="emit('back')">← 返回首页</button>
      <div class="view-title">课程表</div>
      <div class="view-sub">{{ mainTab === 'graduate' ? '2026级研究生课表' : '真实课表 · ' + (term || semester) + '《课程总表》，' + curRows.length + ' 条排课' }}</div>
    </div>

  <!-- 主标签页：研究生课表 / 全校课表 -->
  <div class="main-tabs" data-tour="tt-tabs">
    <button class="main-tab" :class="{ active: mainTab === 'graduate' }" @click="mainTab = 'graduate'">📚 2026级研究生课表</button>
    <button class="main-tab" :class="{ active: mainTab === 'school' }" @click="mainTab = 'school'">🏫 全校课程总表</button>
  </div>

  <!-- 研究生课表 -->
  <ClassSchedule v-if="mainTab === 'graduate'" @back="emit('back')" />

  <!-- 全校课程总表 -->
  <template v-if="mainTab === 'school'">
  <div v-if="loading" class="skeleton-list">
    <div v-for="i in 4" :key="i" class="skeleton-row"><div class="skeleton" style="width: 90%; height: 48px"></div></div>
  </div>

  <template v-else-if="opened">
    <div class="view-top" style="padding-top:0;">
      <button class="back-btn" @click="opened = null">← 返回查询</button>
      <div class="view-title">{{ opened.name }}</div>
      <div class="view-sub">{{ sourceName }}课表 · {{ term || semester }} · 共 {{ opened.count }} 门</div>
    </div>
    <div class="panel" style="margin-bottom:12px;">
      <div class="muted" style="font-size:12px;margin-bottom:6px;">按周次筛选（默认显示全部周次）</div>
      <div class="tab-row" style="flex-wrap:wrap;gap:6px;">
        <button class="tab" :class="{ active: weekFilter === '' }" @click="weekFilter = ''">全部</button>
        <button v-for="w in weekOptions" :key="w" class="tab" :class="{ active: weekFilter === String(w) }" @click="weekFilter = String(w)">第{{ w }}周</button>
      </div>
      <div class="tab-row" style="flex-wrap:wrap;gap:6px;margin-top:10px;">
        <button class="tab" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">📅 周视图</button>
        <button class="tab" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">📋 列表视图</button>
        <span class="muted" style="font-size:12px;margin-left:auto;">手机建议用列表视图，点课程看详情</span>
      </div>
    </div>
    <div class="panel">
        <div v-if="viewMode === 'grid'" class="tt-grid">
        <div class="tt-table-wrap">
          <table class="tt-table">
            <thead><tr>
              <th class="tt-period-col">节</th>
              <th v-for="d in dayNames" :key="d" class="tt-weekday-col" :class="{ 'is-today': isTodayCol(dayNames.indexOf(d) + 1) }">{{ d }}</th>
            </tr></thead>
            <tbody>
              <template v-for="row in TABLE_ROWS_TIMETABLE" :key="row.period">
                <tr :class="'tt-section-' + row.section" :data-period="row.period">
                  <td class="tt-period-cell"><div class="tt-period-num">{{ row.label }}</div><div class="tt-period-time">{{ row.time }}</div><div class="tt-period-time-end">{{ row.timeEnd }}</div></td>
                  <template v-for="(d, di) in dayNames" :key="di">
                    <td v-if="!isCellMerged(di + 1, row.period)" :rowspan="getCourseSpan(getCourseCell(di + 1, row.period))" class="tt-course-cell" :class="{ 'has-course': getCourseCell(di + 1, row.period), 'is-today': isTodayCol(di + 1) }" @click="getCourseCell(di + 1, row.period) && showCourse(getCourseCell(di + 1, row.period))">
                      <div v-if="getCourseCell(di + 1, row.period)" class="tt-course-card" :style="{ borderLeftColor: getCourseColor(getCourseCell(di + 1, row.period)), background: getCourseColor(getCourseCell(di + 1, row.period), 0.12) }">
                        <div class="tt-course-name">{{ getCourseCell(di + 1, row.period).c }}</div>
                        <div class="tt-course-info">{{ getCourseCell(di + 1, row.period).r }}</div>
                        <div class="tt-course-info">{{ getCourseCell(di + 1, row.period).t }} · 第{{ getCourseCell(di + 1, row.period).w }}周</div>
                      </div>
                    </td>
                  </template>
                </tr>
              </template>
            </tbody>
          </table>
          <div v-if="timeLinePos !== null && timeLineWeekday && opened" class="time-line" :style="{ top: timeLinePos + 'px', left: getTodayColumnLeft() + 'px', width: getTodayColumnWidth() + 'px' }">
            <span class="time-label">{{ now.getHours() }}:{{ String(now.getMinutes()).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>

      <div v-else class="wg-list">
        <div v-for="(d, i) in dayNames" :key="d" class="wg-list-day">
          <div v-if="dayCourses(i + 1).length" class="wg-list-dayname">{{ d }}</div>
          <button v-for="co in dayCourses(i + 1)" :key="co.c + co.s + co.r" class="wg-list-item" @click="showCourse(co)">
            <span class="wg-li-time">{{ co.s }}–{{ co.e }} 节</span>
            <span class="wg-li-main">
              <b>{{ co.c }}</b>
              <span class="wg-li-sub">{{ subOf(co) }}</span>
              <span v-if="clsNote(co)" class="wg-li-cls">📌 {{ clsNote(co) }}</span>
            </span>
            <span class="wg-li-go">›</span>
          </button>
        </div>
        <p v-if="!Object.values(opened.days).flat().length" class="muted" style="padding:14px;text-align:center;">该学期暂无排课</p>
      </div>
    </div>

    <div v-if="detail" class="overlay" @click.self="detail = null">
      <div class="overlay-card course-detail">
        <div class="course-detail-head">
          <div class="course-detail-title">{{ detail.c }}</div>
          <button class="overlay-close" @click="detail = null">✕</button>
        </div>
        <div class="course-detail-row"><span>教师</span><b>{{ detail.t || '—' }}</b></div>
        <div class="course-detail-row"><span>教室</span><b>{{ detail.r || '—' }}</b></div>
        <div class="course-detail-row"><span>班级</span><b>{{ detail.cls || '—' }}</b></div>
        <div class="course-detail-row"><span>时间</span><b>{{ dayLabel(detail.d) }} · 第 {{ detail.s }}–{{ detail.e }} 节</b></div>
        <div class="course-detail-row"><span>周次</span><b>第 {{ detail.w }} 周</b></div>
        <div v-if="detail.campus && detail.campus !== '未标注'" class="course-detail-row"><span>校区</span><b>{{ detail.campus }}</b></div>
        <div v-if="detail.cat" class="course-detail-row"><span>类别</span><b>{{ detail.cat }}</b></div>
        <div v-if="detail.credit" class="course-detail-row"><span>学分</span><b>{{ detail.credit }}</b></div>
        <div v-if="detail.r" class="course-detail-actions">
          <button class="btn" style="flex:1;" @click="goClassroomNav(detail.r)">🧭 教室导航</button>
          <button class="btn" style="flex:1;" @click="goCanteen()">🍚 去哪吃</button>
        </div>
        <button class="btn accent" style="width:100%;margin-top:14px;" @click="detail = null">知道了</button>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="panel" style="margin-bottom:16px;">
      <div class="source-bar" style="flex-wrap:wrap;">
        <i class="dot live"></i>
        {{ term || semester }} · {{ singleClasses.length }} 个班级 · {{ rooms.length }} 间教室 · {{ teachers.length }} 位教师
        <span class="sep">·</span>
        <span>数据更新于 {{ snap?.updatedAt ? fmtTime(snap.updatedAt) : '—' }}</span>
      </div>
      <div v-if="semesters.length > 1" class="tab-row" style="margin-top:10px;">
        <button v-for="t in semesters" :key="t" class="tab" :class="{ active: term === t }" @click="switchTerm(t)">{{ t }}</button>
      </div>
      <div class="tab-row" style="margin-top:10px;" data-tour="tt-search">
        <button class="tab" :class="{ active: tab === 'class' }" @click="switchTab('class')">班级课表</button>
        <button class="tab" :class="{ active: tab === 'room' }" @click="switchTab('room')">教室课表</button>
        <button class="tab" :class="{ active: tab === 'teacher' }" @click="switchTab('teacher')">教师课表</button>
      </div>
      <div class="input-row" style="margin-top:12px;">
        <input class="input" v-model="kw" :placeholder="'搜索' + sourceName + '（中文）'" @keyup.enter="resultItems[0] && open(resultItems[0].name)" />
      </div>
      <div class="muted" style="font-size:12px;margin-top:6px;">
        可直接点选下方{{ sourceName }}，或用关键字搜索。例如班级「23高材」、教室「博学楼307」。
      </div>
      <template v-if="tab === 'class'">
        <div class="tab-row" style="flex-wrap:wrap;gap:6px;margin-top:10px;" data-tour="tt-filters">
          <button class="tab" :class="{ active: gradeFilter === '' }" @click="gradeFilter = ''">全部年级</button>
          <button v-for="y in years" :key="y" class="tab" :class="{ active: gradeFilter === y }" @click="gradeFilter = y">{{ y }}级</button>
        </div>
        <div class="tab-row" style="flex-wrap:wrap;gap:6px;margin-top:8px;">
          <button class="tab" :class="{ active: profFilter === '' }" @click="profFilter = ''">全部专业</button>
          <button v-for="p in profs" :key="p" class="tab" :class="{ active: profFilter === p }" @click="profFilter = p">{{ p }}</button>
        </div>
      </template>
    </div>

    <div class="panel">
      <div class="muted" style="font-size:12px;margin-bottom:8px;">
        共 {{ resultItems.length }} 个{{ sourceName }}（{{ tab === 'class' ? '默认按年级排序，含合班课拆分' : '按名称排序' }}），点击查看周课表{{ resultItems.length > PAGE_SIZE ? ' · 每页 ' + PAGE_SIZE + ' 条' : '' }}
      </div>
      <div class="cal-list">
        <button v-for="it in shown" :key="it.name" class="cal-item" style="width:100%;text-align:left;cursor:pointer;border:none;background:none;font-family:inherit;" @click="open(it.name)">
          <span class="cal-title">{{ it.name }}</span>
          <span class="cal-count">{{ it.count }} 门课</span>
          <span class="cal-go">查看课表 ›</span>
        </button>
        <div v-if="!resultItems.length" class="muted" style="padding:16px;text-align:center;">没有匹配的{{ sourceName }}，换个关键字或筛选试试</div>
      </div>
      <div v-if="resultItems.length > PAGE_SIZE" class="pager">
        <button class="tab" :class="{ disabled: page <= 1 || expandAll }" @click="goPage(1)">«</button>
        <button class="tab" :class="{ disabled: page <= 1 || expandAll }" @click="goPage(page - 1)">‹ 上一页</button>
        <template v-for="(p, i) in pageNos" :key="i">
          <span v-if="p === '…'" class="pager-ellipsis">…</span>
          <button v-else class="tab" :class="{ active: page === p && !expandAll }" @click="goPage(p)">{{ p }}</button>
        </template>
        <button class="tab" :class="{ disabled: page >= pageCount || expandAll }" @click="goPage(page + 1)">下一页 ›</button>
        <button class="tab" :class="{ disabled: page >= pageCount || expandAll }" @click="goPage(pageCount)">»</button>
        <span class="pager-jump">
          <input class="input" v-model="jumpPage" type="number" min="1" :max="pageCount" placeholder="页" :disabled="expandAll" @keyup.enter="goPage(jumpPage)" />
          <button class="tab" @click="goPage(jumpPage)">跳转</button>
        </span>
        <button class="tab accent" :class="{ active: expandAll }" @click="toggleExpand">{{ expandAll ? '收起分页' : '展开全部' }}</button>
      </div>
    </div>
  </template>

  <div class="panel" style="margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
    <div style="flex:1;min-width:200px;">
      <div style="font-weight:700;">📖 教务系统 · 个人课表</div>
      <div class="muted" style="font-size:12px;margin-top:2px;">个人课表需登录教务系统查询（需统一身份认证，无法免登录对接）。</div>
    </div>
    <a class="btn" href="https://gedu.fjnu.edu.cn/cas/login?service=https://gedu.fjnu.edu.cn" target="_blank" rel="noopener" style="text-decoration:none;">研究生系统 ↗</a>
    <a class="btn" href="https://jwglxt.fjnu.edu.cn" target="_blank" rel="noopener" style="text-decoration:none;background:var(--primary-soft);color:var(--primary);">教务系统 ↗</a>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="flex:1;font-weight:700;">📄 官方课程总表（教务处公开数据）</div>
      <button class="refresh-btn" :disabled="coursesLoading" @click="loadCourses(true)">🔄 刷新</button>
    </div>
    <div class="source-bar" style="margin-top:6px;">
      <i class="dot" :class="courses?.cached ? 'off' : 'live'"></i>
      来源 jwc.fjnu.edu.cn
      <span v-if="courses" class="sep">·</span>
      <span v-if="courses">抓取于 {{ fmtTime(courses.fetchedAt) }}</span>
    </div>
    <div v-if="coursesLoading" class="skeleton-list" style="margin-top:8px;">
      <div v-for="i in 3" :key="i" class="skeleton-row"><div class="skeleton" style="width:60%;height:16px"></div></div>
    </div>
    <div v-else-if="courses" class="cal-list" style="margin-top:8px;">
      <a v-for="c in courses.items" :key="c.url" class="cal-item" :href="c.url" target="_blank" rel="noopener">
        <span class="cal-title">{{ c.title }}</span>
        <span class="cal-date">{{ c.date }}</span>
        <span class="cal-go">官方页 ↗</span>
      </a>
    </div>
    <div v-else style="padding:16px;text-align:center;">
      <div style="font-size:36px;margin-bottom:10px;">📚</div>
      <div style="font-weight:700;margin-bottom:6px;">课程总表暂未在教务处公开发布</div>
      <div class="muted" style="font-size:12px;line-height:1.8;max-width:400px;margin:0 auto;">
        福建师范大学教务处公开网站不提供课程总表附件下载，排课数据存储在正方教务系统中（需统一身份认证登录）。
        <br>以下方式可查看个人课表：
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
        <a class="btn" href="https://gedu.fjnu.edu.cn/cas/login?service=https://gedu.fjnu.edu.cn" target="_blank" rel="noopener" style="text-decoration:none;">🎓 研究生信息管理系统</a>
        <a class="btn" href="https://jwglxt.fjnu.edu.cn" target="_blank" rel="noopener" style="text-decoration:none;background:var(--primary-soft);color:var(--primary);">📋 本科教务系统</a>
        <a class="btn" href="https://fjnu.zlgc2.chaoxing.com" target="_blank" rel="noopener" style="text-decoration:none;background:var(--soft-green-bg);color:var(--soft-green-text);">📱 超星学习通</a>
      </div>
    </div>
  </div>
  </template>
</template>

<style scoped>
/* 主标签页 */
.main-tabs {
  display: flex;
  gap: 0;
  margin: 0 12px 12px;
  background: var(--soft-fg);
  border-radius: 10px;
  padding: 4px;
}
.main-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.main-tab:hover {
  background: var(--card);
}
.main-tab.active {
  background: var(--primary);
  color: #fff;
}

.pager {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  align-items: center;
}
.pager .tab.disabled {
  opacity: 0.45;
  pointer-events: none;
}
.pager-ellipsis {
  color: var(--text-sub);
  font-size: 13px;
  padding: 0 2px;
  user-select: none;
}
.pager-jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pager-jump .input {
  width: 52px;
  padding: 5px 8px;
  text-align: center;
}
/* 表格视图 — 统一课程表风格 */
.tt-grid { padding: 0; overflow-x: auto; }
.tt-table-wrap { position: relative; }
.tt-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.tt-table th { border: none; padding: 0; }
.tt-table thead th { border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); background: var(--soft-fg); font-weight: 700; }
.tt-table thead th:last-child { border-right: none; }
.tt-period-col { width: 38px; background: var(--soft-fg); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.tt-period-cell { background: var(--soft-fg); text-align: center; padding: 4px 2px; vertical-align: middle; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
.tt-period-num { font-weight: 800; font-size: 14px; color: var(--primary); line-height: 1.2; }
.tt-period-time { font-size: 7px; color: var(--text-sub); line-height: 1.1; margin-top: 1px; }
.tt-period-time-end { font-size: 6.5px; color: var(--text-sub); line-height: 1.1; }
.tt-weekday-col { background: var(--soft-fg); font-weight: 700; }
.tt-weekday-col.is-today { background: #dbeafe; }
.tt-weekday-label { padding: 6px 0 0; font-size: 12px; font-weight: 700; }
.tt-section-afternoon .tt-period-cell { border-top: 2px solid var(--border); }
.tt-section-evening .tt-period-cell { border-top: 2px solid var(--border); }
.tt-course-cell { padding: 3px; height: 46px; vertical-align: middle; cursor: default; transition: background .15s; }
.tt-course-cell.is-today { background: #eff6ff; }
.tt-course-cell.has-course { cursor: pointer; }
.tt-course-cell.has-course:hover { background: var(--primary-soft); }
.tt-course-card { border-left: 3px solid; border-radius: 4px; padding: 4px 8px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.tt-course-name { font-weight: 700; font-size: 11px; line-height: 1.3; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt-course-info { font-size: 9px; color: var(--text-sub); line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 时间射线 */
.time-line { position: absolute; height: 2px; background: #ef4444; z-index: 10; pointer-events: none; }
.time-line::before { content: ''; position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; }
.time-label { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px; white-space: nowrap; }

@media (max-width: 640px) {
  .tt-period-col { width: 30px; }
  .tt-period-cell { padding: 3px 2px; }
  .tt-period-num { font-size: 12px; }
  .tt-period-time { font-size: 6px; }
  .tt-period-time-end { font-size: 5.5px; }
  .tt-course-cell { height: 44px; padding: 2px; }
  .tt-course-card { padding: 3px 5px; }
  .tt-course-name { font-size: 10px; }
  .tt-course-info { font-size: 8px; }
  .time-line::before { width: 8px; height: 8px; left: -4px; top: -3px; }
  .time-label { font-size: 9px; padding: 1px 4px; border-radius: 3px 0 0 3px; }
}

/* 列表视图 */
.wg-list { display: flex; flex-direction: column; gap: 12px; }
.wg-list-day { display: flex; flex-direction: column; gap: 6px; }
.wg-list-dayname { font-size: 13px; font-weight: 800; color: var(--primary); margin-top: 4px; }
.wg-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: 10px;
  background: var(--soft);
  padding: 10px 12px;
  font-family: inherit;
  cursor: pointer;
  transition: 0.15s;
}
.wg-list-item:active { background: var(--primary-soft); }
.wg-li-time { flex: 0 0 58px; font-size: 12px; font-weight: 700; color: var(--primary); }
.wg-li-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wg-li-main b { font-size: 14px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wg-li-sub { font-size: 12px; color: var(--text-sub); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wg-li-cls { font-size: 11px; color: #92400e; background: var(--soft-yellow); border-radius: 6px; padding: 1px 6px; align-self: flex-start; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.wg-li-go { color: var(--text-light); font-size: 16px; }

/* 课程详情弹窗 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 60;
}
.overlay-card {
  background: var(--card);
  border-radius: 16px;
  padding: 18px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.course-detail-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.course-detail-title { font-size: 16px; font-weight: 800; flex: 1; }
.overlay-close { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--text-sub); }
.course-detail-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: 13px; }
.course-detail-row span { flex: 0 0 52px; color: var(--text-sub); }
.course-detail-row b { flex: 1; color: var(--text); font-weight: 600; word-break: break-all; }
.course-detail-actions { display: flex; gap: 8px; margin-top: 12px; }
@media (max-width: 640px) {
  /* 手机端：隐藏节次时间列，7 天均分一屏 */
  .tt-grid { overflow-x: auto; }
  .tt-period-col { width: 30px; }
  .tt-course-cell { height: 44px; padding: 2px; }
  .tt-course-card { padding: 3px 5px; }
  .tt-course-name { font-size: 10px; }
  .tt-course-info { font-size: 8px; }
}
</style>