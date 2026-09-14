<script setup>
/**
 * 课程表视图 v11
 * 支持多专业/班级课表查看
 */
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  WEEKDAYS, TABLE_ROWS, SINGLE_PERIOD_TIMES, PERIOD_TIMES,
  COURSES, MAJORS, COURSE_TYPES,
  getCurrentWeek, isCourseInWeek, getCoursesByMajor,
  getCourseTimeDetail, getCoursePeriodText,
  getDateInWeek, formatDateShort, getWeekDateRange,
  formatWeekdayType,
  getDateHolidayInfo, getScheduleWeekday, getCourseOverride, isPeriodMoved,
  getIncomingInfo as getIncomingInfoFromData, HOLIDAY_MAP,
} from '../data/classSchedule'


const emit = defineEmits(['open', 'back'])

const selectedMajor = ref('cs-master')
const selectedWeek = ref(getCurrentWeek())
const selectedCourse = ref(null)
const showDetail = ref(false)
const viewMode = ref('grid')
const typeFilter = ref('all')
const showSemester = ref(false)
const searchKw = ref('')
const fontSize = ref(100)
const colorMode = ref('white')
const showOtherWeek = ref(false)
const highlightToday = ref(true)
const flashingCourse = ref(null)
const mounted = ref(false)

const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

const weekdayHeaders = computed(() => WEEKDAYS)
const todayWeekday = computed(() => { const d = now.value.getDay(); return d === 0 ? 7 : d })
const todayDateStr = computed(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })

// 当前专业的课程
const majorCourses = computed(() => getCoursesByMajor(selectedMajor.value))

// 今日课程（处理调休/假日）
const todayCourses = computed(() => {
  const scheduleWd = getTodayScheduleWeekday()
  if (scheduleWd === null) return []
  return majorCourses.value.filter(c => {
    if (c.weekday !== scheduleWd) return false
    if (!showSemester.value && !isCourseInWeek(c, selectedWeek.value)) return false
    return true
  }).sort((a, b) => a.startPeriod - b.startPeriod)
})
const hasTodayCourses = computed(() => todayCourses.value.length > 0)

// 显示的课程列表
const displayCourses = computed(() => {
  let courses = showSemester.value || showOtherWeek.value ? majorCourses.value : majorCourses.value.filter(c => isCourseInWeek(c, selectedWeek.value))
  if (typeFilter.value !== 'all') courses = courses.filter(c => c.category === typeFilter.value)
  if (searchKw.value) {
    const kw = searchKw.value.toLowerCase()
    courses = courses.filter(c => c.name.toLowerCase().includes(kw) || c.teacher.toLowerCase().includes(kw) || c.location.toLowerCase().includes(kw))
  }
  return courses
})

const coursesByDay = computed(() => {
  const map = new Map()
  for (let wd = 1; wd <= 7; wd++) {
    const dc = displayCourses.value.filter(c => c.weekday === wd)
    if (dc.length) map.set(wd, dc)
  }
  return [...map.entries()]
})

// 未来课程（下一节课）
const futureCourses = computed(() => {
  const today = new Date(), currentDay = today.getDay() || 7, nowMinutes = today.getHours() * 60 + today.getMinutes()
  const result = []
  for (const course of majorCourses.value) {
    let diffDays = course.weekday - currentDay; if (diffDays < 0) diffDays += 7
    const courseDate = new Date(today); courseDate.setDate(today.getDate() + diffDays)
    const startTime = SINGLE_PERIOD_TIMES[course.startPeriod]; if (!startTime) continue
    const [sh, sm] = startTime.split('-')[0].split(':').map(Number)
    const targetDate = new Date(courseDate); targetDate.setHours(sh, sm, 0, 0)
    if (targetDate.getTime() > today.getTime() || (course.weekday === currentDay && nowMinutes < sh * 60 + sm))
      result.push({ ...course, _date: targetDate })
  }
  result.sort((a, b) => a._date - b._date || a.startPeriod - b.startPeriod)
  return result
})

const nextCourse = computed(() => futureCourses.value[0] || null)
const nextCountdown = computed(() => {
  if (!nextCourse.value) return null
  const diff = nextCourse.value._date - now.value
  if (diff <= 0) return { text: '进行中', isOngoing: true }
  const days = Math.floor(diff / 86400000), hours = Math.floor((diff % 86400000) / 3600000), mins = Math.floor((diff % 3600000) / 60000), secs = Math.floor((diff % 60000) / 1000)
  if (days > 0) return { text: `${days}天${hours}时${mins}分`, isOngoing: false }
  if (hours > 0) return { text: `${hours}时${mins}分${secs}秒`, isOngoing: false }
  return { text: `${mins}分${secs}秒`, isOngoing: false }
})
const nextInfo = computed(() => {
  if (!nextCourse.value) return null
  return { course: nextCourse.value, countdown: nextCountdown.value, weekdayLabel: WEEKDAYS.find(w => w.key === nextCourse.value.weekday)?.label, dateStr: formatDateShort(nextCourse.value._date) }
})

/** 查找某日某节次是否有调入的课程（从别处调来） */
function getIncomingCourse(dateStr, period) {
  const info = getIncomingInfoFromData(dateStr, period, (wd, sp, ep) => {
    return displayCourses.value.find(c => c.weekday === wd && sp >= c.startPeriod && sp <= c.endPeriod) || null
  })
  return info?.course || null
}

/** 获取某日某节次的调入信息（用于显示来源标记） */
function getIncomingInfoLocal(dateStr, period) {
  return getIncomingInfoFromData(dateStr, period, (wd, sp, ep) => {
    return displayCourses.value.find(c => c.weekday === wd && sp >= c.startPeriod && sp <= c.endPeriod) || null
  })
}

function getCourse(weekday, period) {
  if (isHoliday(weekday)) return null
  const ds = dateStrOf(weekday)
  if (isPeriodMoved(ds, period)) return null
  const incoming = getIncomingCourse(ds, period)
  if (incoming) return incoming
  const effectiveWd = getMakeupWeekday(weekday)
  return displayCourses.value.find(c => c.weekday === effectiveWd && period >= c.startPeriod && period <= c.endPeriod) || null
}
function getCourseSpan(course) { return course ? (course.endPeriod - course.startPeriod + 1) : 1 }
function isCellMerged(weekday, period) {
  if (isHoliday(weekday)) return false
  const ds = dateStrOf(weekday)
  const incoming = getIncomingCourse(ds, period)
  if (incoming) {
    return displayCourses.value.some(c => c.weekday === incoming.weekday && period > c.startPeriod && period <= c.endPeriod)
  }
  const effectiveWd = getMakeupWeekday(weekday)
  return displayCourses.value.some(c => c.weekday === effectiveWd && period > c.startPeriod && period <= c.endPeriod)
}
function isToday(weekday) { if (!highlightToday.value) return false; const date = getDateInWeek(selectedWeek.value, weekday); return date.toISOString().slice(0, 10) === todayDateStr.value }
function getCourseColor(course, alpha = 1) { if (!course) return 'transparent'; const hex = course.color || '#1565c0'; return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})` }
function getDateText(weekday) { return formatDateShort(getDateInWeek(selectedWeek.value, weekday)) }
function getWeekRange() { return getWeekDateRange(selectedWeek.value) }
function getWeekTypeInfo(course) { return formatWeekdayType(course.weekdayType) }
function openCourseDetail(course) { selectedCourse.value = course; showDetail.value = true }

/** 日期字符串 YYYY-MM-DD */
function dateStrOf(weekday) {
  const d = getDateInWeek(selectedWeek.value, weekday)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** 获取某天的节假日信息 */
function getHolidayInfo(weekday) { return getDateHolidayInfo(dateStrOf(weekday)) }
/** 该天是否为法定假日（停课） */
function isHoliday(weekday) { const h = getHolidayInfo(weekday); return h?.type === 'holiday' }
/** 该天是否为调休补课日 */
function isMakeup(weekday) { const h = getHolidayInfo(weekday); return h?.type === 'makeup' }
/** 获取调休日实际应上的课表周几 */
function getMakeupWeekday(weekday) {
  const h = getHolidayInfo(weekday)
  if (h?.type === 'makeup') return h.scheduleWeekday
  return weekday
}
/** 获取某节课的调课信息 */
function getOverride(weekday, period) {
  return getCourseOverride(dateStrOf(weekday), period) || null
}

/** 今天是否为调休/假日（用于今日课程卡片判断） */
function getTodayScheduleWeekday() {
  const info = getDateHolidayInfo(todayDateStr.value)
  if (!info) return todayWeekday.value
  if (info.type === 'holiday') return null
  if (info.type === 'makeup') return info.scheduleWeekday
  return todayWeekday.value
}

// 时间射线位置计算 — 基于真实课表时间精确映射，课间停在分界线
function getRowTop(period) {
  const table = document.querySelector('.schedule-table')
  if (!table) return null
  const tr = table.querySelector(`tr[data-period="${period}"]`)
  if (!tr) return null
  const wrapper = document.querySelector('.schedule-table-wrapper')
  if (!wrapper) return null
  return tr.getBoundingClientRect().top - wrapper.getBoundingClientRect().top
}

function getRowBottom(period) {
  const top = getRowTop(period)
  if (top === null) return null
  const table = document.querySelector('.schedule-table')
  if (!table) return null
  const tr = table.querySelector(`tr[data-period="${period}"]`)
  if (!tr) return null
  return top + tr.offsetHeight
}

function getHeaderBottom() {
  const table = document.querySelector('.schedule-table')
  if (!table) return 0
  const thead = table.querySelector('thead')
  if (!thead) return 0
  const wrapper = document.querySelector('.schedule-table-wrapper')
  if (!wrapper) return 0
  return thead.getBoundingClientRect().bottom - wrapper.getBoundingClientRect().top
}

// 课表时间边界定义（分钟数，从0:00起算）
const PERIOD_BOUNDS = [
  { start: 8*60+20, end: 9*60+5,   row: 1 },   // 第1节 08:20-09:05
  { start: 9*60+15, end: 10*60,     row: 2 },   // 第2节 09:15-10:00
  { start: 10*60+20, end: 11*60+5,  row: 3 },   // 第3节 10:20-11:05
  { start: 11*60+15, end: 12*60,     row: 4 },   // 第4节 11:15-12:00
  { start: 14*60,     end: 14*60+45, row: 5 },   // 第5节 14:00-14:45
  { start: 14*60+55, end: 15*60+40, row: 6 },   // 第6节 14:55-15:40
  { start: 15*60+50, end: 16*60+35, row: 7 },   // 第7节 15:50-16:35
  { start: 16*60+45, end: 17*60+30, row: 8 },   // 第8节 16:45-17:30
  { start: 18*60+30, end: 19*60+15, row: 9 },   // 第9节 18:30-19:15
  { start: 19*60+25, end: 20*60+10, row: 10 },  // 第10节 19:25-20:10
  { start: 20*60+20, end: 21*60+5,  row: 11 },  // 第11节 20:20-21:05
  { start: 21*60+15, end: 22*60,     row: 12 },  // 第12节 21:15-22:00
]

const timeLinePos = computed(() => {
  if (!highlightToday.value || !mounted.value) return null
  const today = new Date()
  const h = today.getHours(), m = today.getMinutes()
  const t = h * 60 + m
  if (t < 8 * 60 + 20 || t >= 22 * 60) return null

  const headerBottom = getHeaderBottom()
  if (!headerBottom) return null

  const now = new Date()

  // 查找当前时间所在的节次
  for (const bound of PERIOD_BOUNDS) {
    if (t >= bound.start && t < bound.end) {
      // 在上课中 — 精确计算节内位置
      const top = getRowTop(bound.row)
      const bottom = getRowBottom(bound.row)
      if (top === null || bottom === null) return null
      const progress = (t - bound.start) / (bound.end - bound.start)
      return top + progress * (bottom - top)
    }
  }

  // 课间/午休/晚休 — 停在上一节的底部（分界线）
  // 找到当前时间之前最近的那节课
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
  if (!highlightToday.value || !mounted.value) return null
  const today = new Date()
  const day = today.getDay()
  return day === 0 ? 7 : day
})

function getTodayColumnLeft() {
  const table = document.querySelector('.schedule-table')
  if (!table) return 0
  const periodCol = table.querySelector('.period-col')
  if (!periodCol) return 0
  const periodWidth = periodCol.offsetWidth
  const todayIndex = weekdayHeaders.value.findIndex(w => w.key === timeLineWeekday.value)
  if (todayIndex === -1) return periodWidth
  const cols = table.querySelectorAll('.weekday-col')
  if (cols[todayIndex]) return cols[todayIndex].offsetLeft
  return periodWidth + todayIndex * 80
}

function getTodayColumnWidth() {
  const table = document.querySelector('.schedule-table')
  if (!table) return 80
  const todayIndex = weekdayHeaders.value.findIndex(w => w.key === timeLineWeekday.value)
  const cols = table.querySelectorAll('.weekday-col')
  if (cols[todayIndex]) return cols[todayIndex].offsetWidth
  return 80
}

let flashTimer = null
function jumpToCourse(course) {
  viewMode.value = 'grid'
  for (let w = 1; w <= 18; w++) { if (isCourseInWeek(course, w)) { selectedWeek.value = w; break } }
  if (showSemester.value) showSemester.value = false
  showDetail.value = false
  nextTick(() => {
    setTimeout(() => {
      flashingCourse.value = `${course.weekday}-${course.startPeriod}`
      const el = document.querySelector(`[data-key="${course.weekday}-${course.startPeriod}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearTimeout(flashTimer)
      flashTimer = setTimeout(() => { flashingCourse.value = null }, 2000)
    }, 100)
  })
}

function jumpToOverride(weekday, period) {
  const o = getOverride(weekday, period)
  if (!o) return
  const destDate = new Date(o.destDate)
  const semesterStart = new Date('2026-08-31')
  const diffDays = Math.floor((destDate - semesterStart) / 86400000)
  const destWeek = Math.max(1, Math.min(18, Math.floor(diffDays / 7) + 1))
  const destWd = destDate.getDay() === 0 ? 7 : destDate.getDay()
  const destPeriod = o.destPeriods[0]
  selectedWeek.value = destWeek
  viewMode.value = 'grid'
  showSemester.value = false
  showDetail.value = false
  nextTick(() => {
    setTimeout(() => {
      flashingCourse.value = `${destWd}-${destPeriod}`
      const el = document.querySelector(`[data-key="${destWd}-${destPeriod}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearTimeout(flashTimer)
      flashTimer = setTimeout(() => { flashingCourse.value = null }, 2500)
    }, 100)
  })
}

const showSaveModal = ref(false)
function saveScreenshot() { showSaveModal.value = true }
async function doSave() {
  try {
    if (!window.html2canvas) { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; document.head.appendChild(s); await new Promise((r, j) => { s.onload = r; s.onerror = j }) }
    const el = document.querySelector('.schedule-table-wrapper')
    if (!el) return
    const canvas = await window.html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    const link = document.createElement('a')
    const majorLabel = MAJORS.find(m => m.key === selectedMajor.value)?.short || '课表'
    const typeLabel = showSemester.value ? '学期' : `第${selectedWeek.value}周`
    link.download = `课表_${majorLabel}_${typeLabel}_${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click(); showSaveModal.value = false
  } catch (e) { console.error('截图失败:', e) }
}

const weekShortcuts = computed(() => Array.from({ length: 18 }, (_, i) => ({ value: i + 1, dateRange: getWeekDateRange(i + 1) })))
const currentMajor = computed(() => MAJORS.find(m => m.key === selectedMajor.value))

onMounted(() => { selectedWeek.value = getCurrentWeek(); nextTick(() => { mounted.value = true }) })
</script>

<template>
  <div class="schedule-view">
    <div class="schedule-header">
      <div class="header-top">
        <button class="back-btn" @click="emit('back')">← 返回</button>
        <div class="header-title">📚 课程表</div>
        <button class="view-toggle" @click="viewMode = viewMode === 'grid' ? '📋 列表' : '📊 表格'">{{ viewMode === 'grid' ? '📋 列表' : '📊 表格' }}</button>
      </div>
      <div class="header-stats">
        <div class="stat-item"><span class="stat-value">{{ showSemester ? '学期' : '第' + selectedWeek + '周' }}</span><span class="stat-label">{{ showSemester ? '全部课程' : getWeekRange() }}</span></div>
        <div class="stat-item"><span class="stat-value">{{ displayCourses.length }}门</span><span class="stat-label">课程</span></div>
        <div class="stat-item"><span class="stat-value">{{ displayCourses.reduce((s, c) => s + c.credits, 0) }}</span><span class="stat-label">学分</span></div>
      </div>
    </div>

    <!-- 下一节课 -->
    <div v-if="nextInfo" class="next-card">
      <div class="next-left">
        <div class="next-badge-row"><span class="next-badge">⏰ 下一节课</span><span class="next-countdown" :class="{ ongoing: nextInfo.countdown?.isOngoing }">{{ nextInfo.countdown?.text }}</span></div>
        <div class="next-name" @click="jumpToCourse(nextInfo.course)">{{ nextInfo.course.name }} ›</div>
        <div class="next-meta">{{ nextInfo.weekdayLabel }} {{ nextInfo.dateStr }} · 第{{ nextInfo.course.startPeriod }}-{{ nextInfo.course.endPeriod }}节 · {{ nextInfo.course.location }}</div>
      </div>
      <div class="next-color-bar" :style="{ background: nextInfo.course.color }"></div>
    </div>
    <div v-else class="next-card empty"><span class="next-badge">🎉 近期没有更多课程</span></div>

    <!-- 今日课程 -->
    <div class="today-section" v-if="hasTodayCourses">
      <div class="today-header"><span>📚 今日课程（{{ todayCourses.length }}门）</span><span class="today-date">{{ WEEKDAYS.find(w => w.key === todayWeekday)?.label }} {{ formatDateShort(now) }}</span></div>
      <div class="today-list">
        <div v-for="course in todayCourses" :key="course.id + course.major" class="today-item" :style="{ borderLeftColor: course.color }" @click="jumpToCourse(course)">
          <div class="today-time">第{{ course.startPeriod }}-{{ course.endPeriod }}节</div>
          <div class="today-info"><div class="today-name">{{ course.name }}</div><div class="today-meta">{{ course.location }} · {{ course.teacher }}</div></div>
        </div>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="search-bar"><input class="search-input" v-model="searchKw" placeholder="🔍 搜索课程、教师、教室…" /></div>

    <!-- 周次选择 -->
    <div v-if="!showSemester" class="week-selector">
      <div class="week-nav">
        <button class="week-nav-btn" :disabled="selectedWeek <= 1" @click="selectedWeek--">‹</button>
        <div class="week-current"><span class="week-num">第{{ selectedWeek }}周</span><span class="week-date">{{ getWeekRange() }}</span></div>
        <button class="week-nav-btn" :disabled="selectedWeek >= 18" @click="selectedWeek++">›</button>
      </div>
      <div class="week-scroll"><button v-for="w in weekShortcuts" :key="w.value" class="week-chip" :class="{ active: selectedWeek === w.value }" @click="selectedWeek = w.value"><span class="chip-week">{{ w.value }}</span><span class="chip-date">{{ w.dateRange }}</span></button></div>
    </div>

    <!-- 控制行 -->
    <div class="control-row">
      <button v-for="t in COURSE_TYPES" :key="t.key" class="type-chip" :class="{ active: typeFilter === t.key }" :style="{ '--type-color': t.color }" @click="typeFilter = t.key">{{ t.label }}</button>
      <button class="opt-btn" :class="{ active: colorMode === 'color' }" @click="colorMode = colorMode === 'white' ? 'color' : 'white'">{{ colorMode === 'white' ? '🎨 彩色' : '📄 白色' }}</button>
      <button class="opt-btn" :class="{ active: highlightToday }" @click="highlightToday = !highlightToday">{{ highlightToday ? '✨ 高亮' : '⬜ 高亮' }}</button>
      <button class="semester-btn" :class="{ active: showSemester }" @click="showSemester = !showSemester">{{ showSemester ? '→ 周课表' : '→ 学期课表' }}</button>
      <div class="zoom-group"><button class="zoom-btn" @click="fontSize = Math.max(70, fontSize - 10)">A-</button><span class="zoom-label">{{ fontSize }}%</span><button class="zoom-btn" @click="fontSize = Math.min(200, fontSize + 10)">A+</button></div>
      <button class="save-btn" @click="saveScreenshot">📷 保存</button>
    </div>

    <div class="mode-hint">
      <span>{{ currentMajor?.short }} · {{ showSemester ? '学期课表' : '第' + selectedWeek + '周课表' }}</span>
    </div>

    <!-- 表格 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="schedule-table-wrapper" :style="{ '--font-scale': fontSize / 100 }">
        <table class="schedule-table">
          <thead><tr>
            <th class="period-col">节</th>
            <th v-for="wd in weekdayHeaders" :key="wd.key" class="weekday-col" :class="{ weekend: wd.key >= 6, 'is-today': isToday(wd.key), 'is-holiday': isHoliday(wd.key), 'is-makeup': isMakeup(wd.key) }">
              <div class="weekday-label">{{ wd.short }}</div>
              <div class="weekday-date">{{ showSemester ? '' : getDateText(wd.key) }}</div>
              <div v-if="getHolidayInfo(wd.key)" class="holiday-badge" :class="getHolidayInfo(wd.key).type">
                <span class="holiday-icon">{{ getHolidayInfo(wd.key).icon }}</span>
                <span class="holiday-text">{{ getHolidayInfo(wd.key).type === 'holiday' ? getHolidayInfo(wd.key).name : getHolidayInfo(wd.key).descShort || getHolidayInfo(wd.key).desc }}</span>
              </div>
            </th>
          </tr></thead>
          <tbody>
            <template v-for="row in TABLE_ROWS" :key="row.period">
              <tr :class="'section-' + row.section" :data-period="row.period">
                <td class="period-cell"><div class="period-num">{{ row.label }}</div><div class="period-time">{{ row.time }}</div><div class="period-time-end">{{ row.timeEnd }}</div></td>
                <template v-for="wd in weekdayHeaders" :key="wd.key">
                  <td v-if="isHoliday(wd.key) && row.period === 1" :rowspan="12" class="course-cell is-holiday-col holiday-empty-cell">
                    <div class="holiday-empty"><span class="holiday-empty-icon">🎉</span><span class="holiday-empty-text">{{ getHolidayInfo(wd.key)?.name }}</span><span class="holiday-empty-sub">假期停课</span></div>
                  </td>
                  <td v-else-if="!isHoliday(wd.key) && !isCellMerged(wd.key, row.period)" :rowspan="getCourseSpan(getCourse(wd.key, row.period))" class="course-cell" :data-key="wd.key + '-' + row.period"
                    :class="{ 'has-course': getCourse(wd.key, row.period), weekend: wd.key >= 6, 'is-today': isToday(wd.key), 'is-holiday-col': isHoliday(wd.key), 'is-makeup-col': isMakeup(wd.key), 'other-week': showOtherWeek && getCourse(wd.key, row.period) && !isCourseInWeek(getCourse(wd.key, row.period), selectedWeek), 'is-flashing': flashingCourse === wd.key + '-' + row.period }"
                    @click="getOverride(wd.key, row.period) ? jumpToOverride(wd.key, row.period) : getCourse(wd.key, row.period) && openCourseDetail(getCourse(wd.key, row.period))">
                    <div v-if="getOverride(wd.key, row.period)" class="moved-badge" :title="'点击跳转至' + getOverride(wd.key, row.period).destDate.slice(5)">
                      <span class="moved-icon">↗️</span>
                      <span class="moved-text">{{ getOverride(wd.key, row.period).destDate.slice(5) }} 第{{ getOverride(wd.key, row.period).destPeriods[0] }}-{{ getOverride(wd.key, row.period).destPeriods.at(-1) }}节</span>
                      <span class="moved-loc">📍{{ getOverride(wd.key, row.period).destLocation }}</span>
                    </div>
                    <div v-else-if="getCourse(wd.key, row.period)" class="course-card" :class="[colorMode, { 'is-incoming': getIncomingInfoLocal(dateStrOf(wd.key), row.period) }]" :style="colorMode === 'color' ? { background: getCourseColor(getCourse(wd.key, row.period), 0.15), borderLeftColor: getCourseColor(getCourse(wd.key, row.period)) } : { borderLeftColor: getCourse(wd.key, row.period).color }">
                      <div v-if="getIncomingInfoLocal(dateStrOf(wd.key), row.period)" class="incoming-badge">⬅️ 调入 {{ getIncomingInfoLocal(dateStrOf(wd.key), row.period).srcDate.slice(5) }}第{{ getIncomingInfoLocal(dateStrOf(wd.key), row.period).srcPeriods[0] }}节</div>
                      <div class="course-name">{{ getCourse(wd.key, row.period).name }}</div>
                      <div class="course-info">
                        <span class="course-location" :class="{ 'new-location': getIncomingInfoLocal(dateStrOf(wd.key), row.period)?.destLocation !== getCourse(wd.key, row.period)?.location }">{{ getIncomingInfoLocal(dateStrOf(wd.key), row.period)?.destLocation || getCourse(wd.key, row.period).location }}</span>
                        <span class="course-teacher">{{ getCourse(wd.key, row.period).teacher }}</span>
                        <span v-if="showSemester" class="course-weeks">第{{ getCourse(wd.key, row.period).weeks }}周</span>
                      </div>
                    </div>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-if="timeLinePos !== null && isToday(timeLineWeekday)" class="time-line" :style="{ top: timeLinePos + 'px', left: getTodayColumnLeft() + 'px', width: getTodayColumnWidth() + 'px' }">
          <span class="time-label">{{ now.getHours() }}:{{ String(now.getMinutes()).padStart(2, '0') }}</span>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <template v-for="[wd, dayCourses] in coursesByDay" :key="wd">
        <div class="list-day" :class="{ 'is-today': isToday(wd) }">
          <div class="list-day-header"><span class="day-name">{{ WEEKDAYS.find(w => w.key === wd)?.label }}</span><span class="day-date">{{ showSemester ? '' : getDateText(wd) }}</span></div>
          <div v-for="course in dayCourses" :key="course.id + course.major" class="list-card" :style="colorMode === 'color' ? { background: getCourseColor(course, 0.1), borderLeftColor: course.color } : { borderLeftColor: course.color }" @click="openCourseDetail(course)">
            <div class="list-card-top">
              <div class="list-card-time"><div class="list-card-period">第{{ course.startPeriod }}-{{ course.endPeriod }}节</div><div class="list-card-clock">{{ getCourseTimeDetail(course) }}</div></div>
              <div class="list-card-info"><div class="list-card-name">{{ course.name }}</div><div class="list-card-location">{{ course.location }}</div><div class="list-card-teacher">{{ course.teacher }}</div></div>
            </div>
            <div class="list-card-bottom">
              <span class="list-card-badge" :style="{ background: course.color }">{{ course.category }}</span>
              <span class="list-card-weeks">第{{ course.weeks }}周</span>
              <span v-if="getWeekTypeInfo(course)" class="list-card-type">{{ getWeekTypeInfo(course) }}</span>
              <span class="list-card-credits">{{ course.credits }}学分</span>
            </div>
          </div>
        </div>
      </template>
      <div v-if="!coursesByDay.length" class="empty-state">没有找到匹配的课程</div>
    </div>

    <!-- 保存弹窗 -->
    <div v-if="showSaveModal" class="overlay" @click.self="showSaveModal = false">
      <div class="save-modal">
        <div class="save-title">📷 保存课表截图</div>
        <div class="save-hint">💡 提示：只能保存当前页面显示的课表形式</div>
        <div class="save-current"><span v-if="showSemester">📚 学期课表</span><span v-else>📅 第{{ selectedWeek }}周课表</span></div>
        <div class="save-actions"><button class="btn-cancel" @click="showSaveModal = false">取消</button><button class="btn-save" @click="doSave">保存</button></div>
      </div>
    </div>

    <!-- 详情 -->
    <div v-if="showDetail" class="overlay" @click.self="showDetail = false">
      <div class="detail-modal">
        <div class="detail-header" :style="{ background: selectedCourse?.color }"><div class="detail-title">{{ selectedCourse?.name }}</div><button class="detail-close" @click="showDetail = false">✕</button></div>
        <div class="detail-body">
          <div class="detail-row"><span class="detail-label">课程编号</span><span class="detail-value">{{ selectedCourse?.id }}</span></div>
          <div class="detail-row"><span class="detail-label">课程类别</span><span class="detail-value">{{ selectedCourse?.category }}</span></div>
          <div class="detail-row"><span class="detail-label">学分/学时</span><span class="detail-value">{{ selectedCourse?.credits }}学分 / {{ selectedCourse?.hours }}学时</span></div>
          <div class="detail-row"><span class="detail-label">上课时间</span><span class="detail-value">{{ WEEKDAYS.find(w => w.key === selectedCourse?.weekday)?.label }} · {{ getCoursePeriodText(selectedCourse) }}</span></div>
          <div class="detail-row"><span class="detail-label">具体时间</span><span class="detail-value">{{ getCourseTimeDetail(selectedCourse) }}</span></div>
          <div class="detail-row"><span class="detail-label">上课周数</span><span class="detail-value">第{{ selectedCourse?.weeks }}周</span></div>
          <div v-if="getWeekTypeInfo(selectedCourse)" class="detail-row"><span class="detail-label">单双周</span><span class="detail-value">{{ getWeekTypeInfo(selectedCourse) }}</span></div>
          <div class="detail-row"><span class="detail-label">上课地点</span><span class="detail-value">{{ selectedCourse?.location }}</span></div>
          <div class="detail-row"><span class="detail-label">任课教师</span><span class="detail-value">{{ selectedCourse?.teacher }}</span></div>
          <div v-if="selectedCourse?.shared" class="detail-row"><span class="detail-label">备注</span><span class="detail-value">{{ selectedCourse.shared }}</span></div>
        </div>
        <div class="detail-footer"><button class="btn-close" @click="showDetail = false">关闭</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-view { padding: 0; }
.schedule-header { background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000)); color: #fff; padding: 16px 20px 14px; border-radius: 0 0 16px 16px; margin-bottom: 0; }
.header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.back-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; }
.header-title { font-size: 18px; font-weight: 800; }
.view-toggle { background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.header-stats { display: flex; justify-content: space-around; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 0; }
.stat-item { text-align: center; }
.stat-value { display: block; font-size: 16px; font-weight: 800; color: #fff; }
.stat-label { font-size: 10px; color: rgba(255,255,255,0.8); }

/* 下一节课 */
.next-card { margin: 12px 12px 0; background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; }
.next-card.empty { justify-content: center; padding: 14px; }
.next-left { flex: 1; padding: 14px 16px; }
.next-color-bar { width: 6px; flex-shrink: 0; }
.next-badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.next-badge { font-size: 13px; font-weight: 700; color: var(--text); }
.next-countdown { font-size: 13px; font-weight: 800; background: var(--primary-soft); color: var(--primary); padding: 3px 10px; border-radius: 999px; }
.next-countdown.ongoing { background: #dcfce7; color: #166534; }
.next-name { font-size: 16px; font-weight: 800; color: var(--text); cursor: pointer; margin-bottom: 4px; }
.next-name:hover { color: var(--primary); }
.next-meta { font-size: 12px; color: var(--text-sub); }

/* 今日课程 */
.today-section { margin: 12px 12px 0; background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.today-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--soft-fg); font-weight: 700; font-size: 13px; }
.today-date { font-size: 12px; color: var(--text-sub); font-weight: 500; }
.today-list { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 6px; }
.today-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-left: 3px solid; border-radius: 8px; cursor: pointer; }
.today-item:hover { border-color: var(--primary); background: var(--primary-soft); }
.today-time { font-size: 11px; font-weight: 700; color: var(--primary); min-width: 50px; text-align: center; }
.today-info { flex: 1; min-width: 0; }
.today-name { font-size: 13px; font-weight: 700; color: var(--text); }
.today-meta { font-size: 11px; color: var(--text-sub); margin-top: 2px; }

.search-bar { padding: 10px 12px 0; }
.search-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--card); color: var(--text); font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: var(--primary); }

.week-selector { padding: 0 12px; margin-top: 10px; margin-bottom: 8px; }
.week-nav { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; }
.week-nav-btn { width: 32px; height: 32px; border: none; border-radius: 50%; background: var(--soft-fg); color: var(--text); font-size: 18px; cursor: pointer; }
.week-nav-btn:hover:not(:disabled) { background: var(--primary); color: #fff; }
.week-nav-btn:disabled { opacity: 0.3; }
.week-current { text-align: center; }
.week-num { font-size: 16px; font-weight: 800; color: var(--primary); display: block; }
.week-date { font-size: 11px; color: var(--text-sub); }
.week-scroll { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; }
.week-chip { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); cursor: pointer; min-width: 50px; }
.week-chip.active { background: var(--primary); border-color: var(--primary); }
.chip-week { font-size: 14px; font-weight: 700; color: var(--text); }
.week-chip.active .chip-week { color: #fff; }
.chip-date { font-size: 9px; color: var(--text-sub); }

/* 控制行 */
.control-row { display: flex; flex-wrap: nowrap; gap: 6px; padding: 0 12px; margin-bottom: 6px; align-items: center; overflow-x: auto; }
.type-chip { flex-shrink: 0; padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); color: var(--text); font-size: 12px; cursor: pointer; }
.type-chip.active { background: var(--type-color, var(--primary)); border-color: var(--type-color, var(--primary)); color: #fff; }
.zoom-group { display: flex; align-items: center; gap: 4px; flex-shrink: 0; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 2px 6px; }
.zoom-btn { width: 24px; height: 24px; border: none; border-radius: 4px; background: var(--soft-fg); color: var(--text); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.zoom-btn:hover { background: var(--primary); color: #fff; }
.zoom-label { font-size: 11px; color: var(--text-sub); min-width: 32px; text-align: center; }
.save-btn { flex-shrink: 0; padding: 6px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--primary); color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; }
.save-btn:hover { background: color-mix(in srgb, var(--primary) 80%, #000); }
.opt-btn { flex-shrink: 0; padding: 6px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); color: var(--text); font-size: 11px; cursor: pointer; font-weight: 600; }
.opt-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.semester-btn { flex-shrink: 0; padding: 6px 10px; border: 2px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text); font-size: 11px; cursor: pointer; font-weight: 700; white-space: nowrap; }
.semester-btn.active { background: #6a1b9a; border-color: #6a1b9a; color: #fff; }

.mode-hint { padding: 6px 12px; margin: 0 12px 8px; font-size: 12px; color: var(--primary); font-weight: 600; background: var(--primary-soft); border-radius: 8px; text-align: center; }

/* 表格 */
.grid-view { padding: 0; overflow-x: auto; }
.schedule-table-wrapper { --font-scale: 1; position: relative; }
.schedule-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.schedule-table th { border: none; padding: 0; }
.schedule-table thead th { border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
.schedule-table thead th:last-child { border-right: none; }
.period-col { width: 38px; background: var(--soft-fg); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.period-cell { background: var(--soft-fg); text-align: center; padding: 4px 2px; vertical-align: middle; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
.period-num { font-weight: 800; font-size: 14px; color: var(--primary); line-height: 1.2; }
.period-time { font-size: 7px; color: var(--text-sub); line-height: 1.1; margin-top: 1px; }
.period-time-end { font-size: 6.5px; color: var(--text-sub); line-height: 1.1; }
.weekday-col { background: var(--soft-fg); font-weight: 700; }
.weekday-col.weekend { background: #f5f5f5; }
.weekday-col.is-today { background: #dbeafe; }
.weekday-col.is-holiday { background: linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%); }
.weekday-col.is-holiday .weekday-label { color: #dc2626; font-weight: 800; }
.weekday-col.is-makeup { background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%); }
.weekday-col.is-makeup .weekday-label { color: #b45309; font-weight: 800; }
.holiday-badge { display: inline-flex; align-items: center; gap: 3px; margin: 3px auto 5px; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; line-height: 1.4; white-space: nowrap; letter-spacing: 0.3px; }
.holiday-badge.holiday { background: #fca5a5; color: #991b1b; }
.holiday-badge.makeup { background: #fbbf24; color: #78350f; }
.holiday-icon { font-size: 11px; }
.holiday-text { font-size: 9px; }
.holiday-empty-cell { text-align: center; vertical-align: middle; background: repeating-linear-gradient(45deg, #fef2f2, #fef2f2 10px, #fff5f5 10px, #fff5f5 20px); border-left: 2px dashed #fca5a5; border-right: 2px dashed #fca5a5; }
.holiday-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; }
.holiday-empty-icon { font-size: 32px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.1)); }
.holiday-empty-text { font-size: 14px; font-weight: 800; color: #dc2626; letter-spacing: 1px; }
.holiday-empty-sub { font-size: 11px; color: #9ca3af; font-weight: 500; }
.makeup-cell { position: relative; }
.weekday-label { padding: 6px 0 0; font-size: 12px; font-weight: 700; }
.weekday-date { padding: 0 0 4px; font-size: 9px; color: var(--text-sub); }
tr[data-period="5"] .course-cell { border-top: 1px solid var(--border); }
tr[data-period="9"] .course-cell { border-top: 1px solid var(--border); }
.course-cell { padding: 3px; height: 46px; vertical-align: middle; cursor: default; transition: background .15s; }
.course-cell.weekend { background: #fafafa; }
.course-cell.is-today { background: #eff6ff; }
.course-cell.is-holiday-col { background: #fef2f2; }
.course-cell.is-makeup-col { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
.course-cell.has-course { cursor: pointer; }
.course-cell.has-course:hover { background: var(--primary-soft); }
.course-cell.other-week { opacity: 0.5; }
.course-cell.is-flashing { animation: flashHighlight 0.6s ease 4; z-index: 1; position: relative; }
@keyframes flashHighlight { 0%, 100% { background-color: transparent; } 25%, 75% { background-color: #fef08a; } 50% { background-color: #fde047; } }
.course-cell.is-flashing::after { content: ''; position: absolute; inset: 0; border: 3px solid #eab308; border-radius: 4px; animation: flashBorder 0.6s ease 4; }
@keyframes flashBorder { 0%, 100% { border-color: transparent; } 50% { border-color: #eab308; } }
.course-card { border-left: 3px solid; border-radius: 4px; padding: 4px 8px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.course-card.white { background: var(--card); }
.course-card.color { backdrop-filter: blur(8px); }
.course-name { font-weight: 700; font-size: calc(11px * var(--font-scale)); line-height: 1.3; color: var(--text); }
.course-info { display: flex; flex-direction: column; gap: 0; }
.course-location, .course-teacher, .course-weeks { font-size: calc(9px * var(--font-scale)); color: var(--text-sub); line-height: 1.2; }
.course-weeks { color: var(--primary); font-weight: 600; }
.moved-badge { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px; text-align: center; background: linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%); border-radius: 6px; border-left: 3px solid #7c3aed; height: 100%; justify-content: center; cursor: pointer; transition: all .15s; }
.moved-badge:hover { background: linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 100%); transform: scale(1.02); }
.moved-icon { font-size: 14px; }
.moved-text { font-size: 9px; font-weight: 700; color: #6d28d9; line-height: 1.2; }
.moved-loc { font-size: 8px; font-weight: 600; color: #7c3aed; background: #ede9fe; padding: 1px 4px; border-radius: 3px; }
.course-card.is-incoming { border-left-style: dashed !important; position: relative; }
.incoming-badge { font-size: 8px; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 1px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; }
.course-location.new-location { color: #dc2626; font-weight: 700; }

/* 时间射线 - 只在当日列内显示 */
.time-line { position: absolute; height: 2px; background: #ef4444; z-index: 10; pointer-events: none; }
.time-line::before { content: ''; position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; }
.time-label { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px; white-space: nowrap; }

/* 列表 */
.list-view { padding: 0 12px; display: flex; flex-direction: column; gap: 16px; }
.list-day { display: flex; flex-direction: column; gap: 10px; }
.list-day.is-today { background: #eff6ff; padding: 8px; border-radius: 12px; }
.list-day-header { display: flex; align-items: baseline; gap: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--primary); }
.day-name { font-size: 16px; font-weight: 800; color: var(--primary); }
.day-date { font-size: 12px; color: var(--text-sub); }
.list-card { background: var(--card); border: 1px solid var(--border); border-left: 4px solid; border-radius: 10px; padding: 12px; cursor: pointer; }
.list-card-top { display: flex; gap: 12px; margin-bottom: 8px; }
.list-card-time { background: var(--primary-soft); border-radius: 8px; padding: 8px 10px; text-align: center; min-width: 70px; }
.list-card-period { font-size: 11px; font-weight: 700; color: var(--primary); }
.list-card-clock { font-size: 10px; color: var(--text-sub); margin-top: 2px; }
.list-card-info { flex: 1; min-width: 0; }
.list-card-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.list-card-location, .list-card-teacher { font-size: 12px; color: var(--text-sub); line-height: 1.4; }
.list-card-bottom { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 8px; border-top: 1px dashed var(--border); }
.list-card-badge { font-size: 10px; padding: 2px 8px; border-radius: 999px; color: #fff; font-weight: 600; }
.list-card-weeks, .list-card-type, .list-card-credits { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: var(--soft-fg); color: var(--text-sub); font-weight: 600; }
.empty-state { text-align: center; padding: 40px 0; color: var(--text-sub); }

/* 保存弹窗 */
.save-modal { background: var(--card); border-radius: 16px; width: 100%; max-width: 320px; padding: 20px; }
.save-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 12px; }
.save-hint { font-size: 12px; color: var(--text-sub); text-align: center; margin-bottom: 12px; padding: 8px; background: var(--soft-fg); border-radius: 8px; }
.save-current { font-size: 14px; font-weight: 600; text-align: center; margin-bottom: 16px; padding: 10px; background: var(--primary-soft); border-radius: 8px; color: var(--primary); }
.save-actions { display: flex; gap: 10px; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text); font-size: 14px; cursor: pointer; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: var(--primary); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }

/* 详情弹窗 */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.detail-modal { background: var(--card); border-radius: 16px; width: 100%; max-width: 400px; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; }
.detail-header { color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
.detail-title { font-size: 18px; font-weight: 800; flex: 1; }
.detail-close { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; cursor: pointer; }
.detail-body { padding: 20px; overflow-y: auto; flex: 1; }
.detail-row { display: flex; padding: 12px 0; border-bottom: 1px dashed var(--border); }
.detail-row:last-child { border-bottom: none; }
.detail-label { width: 80px; font-size: 13px; color: var(--text-sub); flex-shrink: 0; }
.detail-value { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); }
.detail-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
.btn-close { width: 100%; padding: 12px; border: none; border-radius: 8px; background: var(--soft-fg); color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer; }

/* 手机端 */
@media (max-width: 640px) {
  .schedule-header { border-radius: 0; margin: -16px -16px 0; padding: 12px 16px 14px; }
  .header-title { font-size: 16px; }
  .stat-value { font-size: 14px; color: #fff; }
  .next-card, .today-section { margin: 10px 8px 0; }
  .search-bar { padding: 10px 8px 0; }
  .week-selector { padding: 0 8px; }
  .control-row { padding: 0 8px; flex-wrap: wrap; gap: 4px; padding-bottom: 60px; }
  .control-row > * { flex: 0 0 auto; }
  .mode-hint { margin: 0 8px 8px; font-size: 11px; }
  .period-col { width: 30px; }
  .period-cell { padding: 3px 2px; }
  .period-num { font-size: calc(12px * var(--font-scale)); }
  .period-time { font-size: calc(6px * var(--font-scale)); }
  .period-time-end { font-size: calc(5.5px * var(--font-scale)); }
  .course-cell { height: 44px; padding: 2px; }
  .course-card { padding: 3px 5px; }
  .course-name { font-size: calc(10px * var(--font-scale)); }
  .course-location, .course-teacher { font-size: calc(8px * var(--font-scale)); }
  .holiday-badge { padding: 1px 4px; font-size: 8px; gap: 1px; margin: 2px auto 3px; }
  .holiday-icon { font-size: 9px; }
  .holiday-text { font-size: 8px; }
  .moved-badge { padding: 2px; gap: 1px; }
  .moved-icon { font-size: 12px; }
  .moved-text { font-size: 8px; }
  .moved-loc { font-size: 7px; }
  .holiday-empty-icon { font-size: 24px; }
  .holiday-empty-text { font-size: 12px; }
  .incoming-badge { font-size: 7px; padding: 0 3px; }
  .course-location.new-color { font-size: calc(7px * var(--font-scale)); }
  .list-view { padding: 0 8px; }
  .time-line::before { width: 8px; height: 8px; left: -4px; top: -3px; }
  .time-label { font-size: 9px; padding: 1px 4px; border-radius: 3px 0 0 3px; }
}
</style>
