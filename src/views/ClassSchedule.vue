<script setup>
/**
 * 课程表视图 v10 - 修复版
 */
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  WEEKDAYS, TABLE_ROWS, SINGLE_PERIOD_TIMES,
  COURSES, REQUIRED_COURSES, COURSE_TYPES,
  getCurrentWeek, isCourseInWeek,
  getCourseAtPeriod, getCourseRowSpan, isMergedCell,
  formatWeekdayType, getCourseTimeDetail, getCoursePeriodText,
  getDateInWeek, formatDateShort, getWeekDateRange,
  getArrangedCredits, getTotalCredits, getUnarrangedCourses,
} from '../data/classSchedule'

const emit = defineEmits(['open', 'back'])

const selectedWeek = ref(getCurrentWeek())
const savedWeek = ref(getCurrentWeek()) // 保存切换前的周次
const selectedCourse = ref(null)
const showDetail = ref(false)
const viewMode = ref('grid')
const showUnarranged = ref(false)
const typeFilter = ref('all')
const showSemester = ref(false)
const searchKw = ref('')
const fontSize = ref(100)
const colorMode = ref('white')
const showOtherWeek = ref(false)
const highlightToday = ref(true)
const flashingCourse = ref(null) // 闪烁的课程

const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

const weekdayHeaders = computed(() => WEEKDAYS)

const todayWeekday = computed(() => { const d = now.value.getDay(); return d === 0 ? 7 : d })
const todayDateStr = computed(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })

const todayCourses = computed(() => {
  return COURSES.filter(c => {
    if (c.weekday !== todayWeekday.value) return false
    if (!showSemester.value && !isCourseInWeek(c, selectedWeek.value)) return false
    return true
  }).sort((a, b) => a.startPeriod - b.startPeriod)
})
const hasTodayCourses = computed(() => todayCourses.value.length > 0)

function getCurrentPeriod() {
  const h = now.value.getHours(), m = now.value.getMinutes(), t = h * 60 + m
  if (t < 8 * 60 + 20) return 0; if (t < 9 * 60 + 15) return 1; if (t < 10 * 60 + 20) return 3; if (t < 11 * 60 + 15) return 4
  if (t < 14 * 60) return 0; if (t < 14 * 60 + 55) return 5; if (t < 15 * 60 + 50) return 6; if (t < 16 * 60 + 45) return 7
  if (t < 17 * 60 + 30) return 8; if (t < 18 * 60 + 30) return 0; if (t < 19 * 60 + 25) return 9; if (t < 20 * 60 + 20) return 10
  if (t < 21 * 60 + 15) return 11; if (t < 22 * 60) return 12; return 0
}

function getCourseDate(course) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const currentDay = today.getDay() || 7
  let diffDays = course.weekday - currentDay; if (diffDays < 0) diffDays += 7
  const courseDate = new Date(today); courseDate.setDate(today.getDate() + diffDays)
  return courseDate
}

const futureCourses = computed(() => {
  const today = new Date(), currentDay = today.getDay() || 7, nowMinutes = today.getHours() * 60 + today.getMinutes()
  const result = []
  for (const course of COURSES) {
    const courseDate = getCourseDate(course), startTime = SINGLE_PERIOD_TIMES[course.startPeriod]
    if (!startTime) continue
    const [sh, sm] = startTime.split('-')[0].split(':').map(Number)
    const targetDate = new Date(courseDate); targetDate.setHours(sh, sm, 0, 0)
    const isToday = course.weekday === currentDay
    if (targetDate.getTime() > today.getTime() || (isToday && nowMinutes < sh * 60 + sm)) result.push({ ...course, _date: targetDate })
  }
  result.sort((a, b) => a._date - b._date || a.startPeriod - b.startPeriod)
  return result
})

const nextCourse = computed(() => futureCourses.value[0] || null)
const nextCountdown = computed(() => {
  if (!nextCourse.value) return null
  const diff = nextCourse.value._date - now.value
  if (diff <= 0) return { text: '进行中', isOngoing: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  if (days > 0) return { text: `${days}天${hours}时${mins}分`, isOngoing: false }
  if (hours > 0) return { text: `${hours}时${mins}分${secs}秒`, isOngoing: false }
  if (mins > 0) return { text: `${mins}分${secs}秒`, isOngoing: false }
  return { text: `${secs}秒`, isOngoing: false }
})
const nextInfo = computed(() => {
  if (!nextCourse.value) return null
  return { course: nextCourse.value, countdown: nextCountdown.value, weekdayLabel: WEEKDAYS.find(w => w.key === nextCourse.value.weekday)?.label, dateStr: formatDateShort(nextCourse.value._date) }
})

// 核心：displayCourses 根据所有筛选条件
const displayCourses = computed(() => {
  let courses = showSemester.value || showOtherWeek.value ? COURSES : COURSES.filter(c => isCourseInWeek(c, selectedWeek.value))
  if (typeFilter.value !== 'all') courses = courses.filter(c => c.category === typeFilter.value)
  if (searchKw.value) {
    const kw = searchKw.value.toLowerCase()
    courses = courses.filter(c => c.name.toLowerCase().includes(kw) || c.teacher.toLowerCase().includes(kw) || c.location.toLowerCase().includes(kw))
  }
  return courses
})

const coursesByDay = computed(() => {
  const map = new Map()
  for (let wd = 1; wd <= 7; wd++) { const dc = displayCourses.value.filter(c => c.weekday === wd); if (dc.length) map.set(wd, dc) }
  return [...map.entries()]
})

const totalCredits = computed(() => getArrangedCredits())
const allCredits = computed(() => getTotalCredits())
const unarrangedCourses = computed(() => getUnarrangedCourses())
const extraCourses = computed(() => {
  const requiredNames = REQUIRED_COURSES.map(c => c.arrangedName || c.name), extra = [], seen = new Set()
  for (const c of COURSES) { if (!requiredNames.includes(c.name) && !seen.has(c.name)) { seen.add(c.name); extra.push({ name: c.name, credits: c.credits, category: c.category }) } }
  return extra
})

function getDateText(weekday) { return formatDateShort(getDateInWeek(selectedWeek.value, weekday)) }
function getWeekRange() { return getWeekDateRange(selectedWeek.value) }

// 关键修复：使用 displayCourses 来获取课程
function getCourse(weekday, period) {
  return displayCourses.value.find(c => {
    if (c.weekday !== weekday) return false
    return period >= c.startPeriod && period <= c.endPeriod
  }) || null
}

function getCourseSpan(course) { return course ? getCourseRowSpan(course) : 1 }
function isCellMerged(weekday, period) {
  return displayCourses.value.some(c => c.weekday === weekday && period > c.startPeriod && period <= c.endPeriod)
}

function isCurrentWeekCourse(course) { return showSemester.value ? isCourseInWeek(course, selectedWeek.value) : true }
function isToday(weekday) {
  if (!highlightToday.value) return false
  const date = getDateInWeek(selectedWeek.value, weekday)
  return date.toISOString().slice(0, 10) === todayDateStr.value
}
function getCourseColor(course, alpha = 1) {
  if (!course) return 'transparent'
  const hex = course.color || '#1565c0'
  return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`
}

function openCourseDetail(course) { selectedCourse.value = course; showDetail.value = true }
function closeDetail() { showDetail.value = false; selectedCourse.value = null }
function goToClassroomNav() { emit('open', 'classroomNav') }
function goToCanteen() { emit('open', 'canteen') }
function goToGraduatePlan() { emit('open', 'graduatePlan') }
function getWeekTypeInfo(course) { return formatWeekdayType(course.weekdayType) }

// 保存周次记忆
watch(showSemester, (val) => { if (!val) selectedWeek.value = savedWeek.value })
watch(selectedWeek, (val) => { if (!showSemester.value) savedWeek.value = val })

// 闪烁效果
let flashTimer = null
function jumpToCourse(course) {
  // 确保显示表格视图
  viewMode.value = 'grid'
  // 切换到课程所在的周次
  for (let w = 1; w <= 18; w++) { if (isCourseInWeek(course, w)) { selectedWeek.value = w; break } }
  // 如果是学期课表模式，切换到周课表
  if (showSemester.value) showSemester.value = false
  showDetail.value = false
  // 等待DOM更新后闪烁
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

// 截图 - 保存当前页面显示的内容
const showSaveModal = ref(false)
function saveScreenshot() { showSaveModal.value = true }
async function doSave() {
  try {
    if (!window.html2canvas) {
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; document.head.appendChild(s)
      await new Promise((r, j) => { s.onload = r; s.onerror = j })
    }
    const el = document.querySelector('.schedule-table-wrapper')
    if (!el) return
    const canvas = await window.html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    const link = document.createElement('a')
    // 自动识别当前显示的是学期课表还是周课表
    const typeLabel = showSemester.value ? '学期课表' : `第${selectedWeek.value}周课表`
    link.download = `课表_${typeLabel}_${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click(); showSaveModal.value = false
  } catch (e) { console.error('截图失败:', e) }
}

const weekShortcuts = computed(() => Array.from({ length: 18 }, (_, i) => ({ value: i + 1, dateRange: getWeekDateRange(i + 1) })))

// 时间射线位置计算
const timeLinePos = computed(() => {
  if (!highlightToday.value) return null
  const today = new Date()
  const h = today.getHours(), m = today.getMinutes()
  // 上午 8:20-12:00，下午 14:00-17:30，晚上 18:30-22:00
  const t = h * 60 + m
  if (t < 8 * 60 + 20 || t >= 22 * 60) return null // 不在上课时间
  
  // 计算在表格中的位置（每行高度约46px + 边框1px）
  const rowHeight = 47 // 46px + 1px border
  const headerHeight = 40 // 表头高度
  
  let row = 0
  if (t < 12 * 60) {
    // 上午：8:20-12:00，对应第1-4节
    const mins = t - (8 * 60 + 20)
    row = Math.floor(mins / 45) // 每节45分钟
    const offset = (mins % 45) / 45
    return headerHeight + (row + offset) * rowHeight
  } else if (t < 14 * 60) {
    return null // 午休
  } else if (t < 17 * 60 + 30) {
    // 下午：14:00-17:30，对应第5-8节
    const mins = t - (14 * 60)
    row = Math.floor(mins / 45) + 4
    const offset = (mins % 45) / 45
    return headerHeight + (row + offset) * rowHeight
  } else {
    // 晚上：18:30-22:00，对应第9-12节
    const mins = t - (18 * 60 + 30)
    row = Math.floor(mins / 45) + 8
    const offset = (mins % 45) / 45
    return headerHeight + (row + offset) * rowHeight
  }
})

// 当前是周几（用于时间射线定位到正确的列）
const timeLineWeekday = computed(() => {
  if (!highlightToday.value) return null
  const today = new Date()
  const day = today.getDay()
  return day === 0 ? 7 : day
})

// 获取当日列的左边距
function getTodayColumnLeft() {
  const table = document.querySelector('.schedule-table')
  if (!table) return 0
  const periodCol = table.querySelector('.period-col')
  if (!periodCol) return 0
  const periodWidth = periodCol.offsetWidth
  const todayIndex = weekdayHeaders.value.findIndex(w => w.key === timeLineWeekday.value)
  if (todayIndex === -1) return periodWidth
  const cols = table.querySelectorAll('.weekday-col')
  if (cols[todayIndex]) {
    return cols[todayIndex].offsetLeft
  }
  return periodWidth + todayIndex * 80
}

// 获取当日列的宽度
function getTodayColumnWidth() {
  const table = document.querySelector('.schedule-table')
  if (!table) return 80
  const todayIndex = weekdayHeaders.value.findIndex(w => w.key === timeLineWeekday.value)
  const cols = table.querySelectorAll('.weekday-col')
  if (cols[todayIndex]) {
    return cols[todayIndex].offsetWidth
  }
  return 80
}

onMounted(() => { selectedWeek.value = getCurrentWeek(); savedWeek.value = selectedWeek.value })
</script>

<template>
  <div class="schedule-view">
    <div class="schedule-header">
      <div class="header-top">
        <button class="back-btn" @click="emit('back')">← 返回</button>
        <div class="header-title">📚 我的课表</div>
        <button class="view-toggle" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">{{ viewMode === 'grid' ? '📋 列表' : '📊 表格' }}</button>
      </div>
      <div class="header-stats">
        <div class="stat-item"><span class="stat-value">{{ showSemester ? '学期' : '第' + selectedWeek + '周' }}</span><span class="stat-label">{{ showSemester ? '全部课程' : getWeekRange() }}</span></div>
        <div class="stat-item"><span class="stat-value">{{ displayCourses.length }}门</span><span class="stat-label">课程</span></div>
        <div class="stat-item"><span class="stat-value">{{ totalCredits }}/{{ allCredits }}</span><span class="stat-label">学分</span></div>
      </div>
    </div>

    <!-- 下一节课 -->
    <div v-if="nextInfo" class="next-card" :style="{ '--c': nextInfo.course.color }">
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
        <div v-for="course in todayCourses" :key="course.id" class="today-item" :style="{ borderLeftColor: course.color }" @click="jumpToCourse(course)">
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

    <!-- 控制行1：筛选按钮 -->
    <div class="control-row">
      <button v-for="t in COURSE_TYPES" :key="t.key" class="type-chip" :class="{ active: typeFilter === t.key }" :style="{ '--type-color': t.color }" @click="typeFilter = t.key">{{ t.label }}</button>
    </div>
    <!-- 控制行2：功能按钮 -->
    <div class="control-row">
      <button class="opt-btn" :class="{ active: colorMode === 'color' }" @click="colorMode = colorMode === 'white' ? 'color' : 'white'">{{ colorMode === 'white' ? '🎨 彩色' : '📄 白色' }}</button>
      <button class="opt-btn" :class="{ active: showOtherWeek }" @click="showOtherWeek = !showOtherWeek">{{ showOtherWeek ? '📅 仅本周' : '📆 全部' }}</button>
      <button class="opt-btn" :class="{ active: highlightToday }" @click="highlightToday = !highlightToday">{{ highlightToday ? '✨ 高亮' : '⬜ 高亮' }}</button>
      <button class="semester-btn" :class="{ active: showSemester }" @click="showSemester = !showSemester">{{ showSemester ? '→ 周课表' : '→ 学期课表' }}</button>
    </div>
    <!-- 控制行3：缩放 + 保存 -->
    <div class="control-row">
      <div class="zoom-group">
        <button class="zoom-btn" @click="fontSize = Math.max(70, fontSize - 10)">A-</button>
        <span class="zoom-label">{{ fontSize }}%</span>
        <button class="zoom-btn" @click="fontSize = Math.min(200, fontSize + 10)">A+</button>
      </div>
      <button class="save-btn" @click="saveScreenshot">📷 保存截图</button>
    </div>

    <div class="mode-hint">
      <span>{{ showSemester ? '📚 学期课表' : '📅 第' + selectedWeek + '周课表' }}</span>
      <span v-if="showOtherWeek" class="hint-tag">含非本周</span>
    </div>

    <!-- 表格 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="schedule-table-wrapper" :style="{ '--font-scale': fontSize / 100 }">
        <table class="schedule-table">
          <thead><tr>
            <th class="period-col">节</th>
            <th v-for="wd in weekdayHeaders" :key="wd.key" class="weekday-col" :class="{ weekend: wd.key >= 6, 'is-today': isToday(wd.key) }">
              <div class="weekday-label">{{ wd.short }}</div><div class="weekday-date">{{ showSemester ? '' : getDateText(wd.key) }}</div>
            </th>
          </tr></thead>
          <tbody>
            <template v-for="row in TABLE_ROWS" :key="row.period">
              <tr :class="'section-' + row.section">
                <td class="period-cell"><div class="period-num">{{ row.label }}</div><div class="period-time">{{ row.time }}</div><div class="period-time-end">{{ row.timeEnd }}</div></td>
                <template v-for="wd in weekdayHeaders" :key="wd.key">
                  <td v-if="!isCellMerged(wd.key, row.period)" :rowspan="getCourseSpan(getCourse(wd.key, row.period))" class="course-cell" :data-key="wd.key + '-' + row.period"
                    :class="{ 'has-course': getCourse(wd.key, row.period), weekend: wd.key >= 6, 'is-today': isToday(wd.key), 'other-week': showOtherWeek && getCourse(wd.key, row.period) && !isCurrentWeekCourse(getCourse(wd.key, row.period)), 'is-flashing': flashingCourse === wd.key + '-' + row.period }"
                    @click="getCourse(wd.key, row.period) && openCourseDetail(getCourse(wd.key, row.period))">
                    <div v-if="getCourse(wd.key, row.period)" class="course-card" :class="[colorMode]" :style="colorMode === 'color' ? { background: getCourseColor(getCourse(wd.key, row.period), 0.15), borderLeftColor: getCourseColor(getCourse(wd.key, row.period)) } : { borderLeftColor: getCourse(wd.key, row.period).color }">
                      <div class="course-name">{{ getCourse(wd.key, row.period).name }}</div>
                      <div class="course-info">
                        <span class="course-location">{{ getCourse(wd.key, row.period).location }}</span>
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
        <!-- 时间射线 - 只在当日列内显示 -->
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
          <div v-for="course in dayCourses" :key="course.id" class="list-card" :class="{ 'other-week': showOtherWeek && !isCurrentWeekCourse(course) }" :style="colorMode === 'color' ? { background: getCourseColor(course, 0.1), borderLeftColor: course.color } : { borderLeftColor: course.color }" @click="openCourseDetail(course)">
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

    <!-- 奖学金评审计分课程目录 -->
    <div class="unarranged-panel" :class="{ 'has-warning': unarrangedCourses.length > 0 }">
      <div class="panel-header" @click="showUnarranged = !showUnarranged">
        <div class="panel-title-row">
          <span class="panel-icon">📋</span>
          <span class="panel-title">奖学金评审计分课程目录</span>
          <span v-if="unarrangedCourses.length" class="panel-badge">{{ unarrangedCourses.length }}门未安排</span>
        </div>
        <span class="panel-arrow">{{ showUnarranged ? '▾' : '▸' }}</span>
      </div>
      <div v-show="showUnarranged" class="panel-body">
        <div class="progress-section">
          <div class="progress-info">
            <span>已安排 <b>{{ REQUIRED_COURSES.filter(c => c.arranged).length }}</b>/{{ REQUIRED_COURSES.length }} 门</span>
            <span><b>{{ totalCredits }}</b>/{{ allCredits }} 学分</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" :style="{ width: (REQUIRED_COURSES.filter(c => c.arranged).length / REQUIRED_COURSES.length * 100) + '%' }"></div></div>
        </div>
        <div class="course-section">
          <div class="section-title">✅ 已安排课程</div>
          <div class="course-grid">
            <div v-for="course in REQUIRED_COURSES.filter(c => c.arranged)" :key="course.name" class="course-chip arranged"><span class="chip-name">{{ course.arrangedName || course.name }}</span><span class="chip-credits">{{ course.credits }}学分</span></div>
          </div>
        </div>
        <div class="course-section warning">
          <div class="section-title">⚠️ 未安排课程</div>
          <div class="course-grid">
            <div v-for="course in unarrangedCourses" :key="course.name" class="course-chip unarranged"><span class="chip-name">{{ course.name }}</span><span class="chip-credits">{{ course.credits }}学分</span></div>
          </div>
        </div>
        <div v-if="extraCourses.length" class="course-section extra">
          <div class="section-title">📌 课表额外课程</div>
          <div class="course-grid">
            <div v-for="course in extraCourses" :key="course.name" class="course-chip extra"><span class="chip-name">{{ course.name }}</span><span class="chip-credits">{{ course.credits }}学分</span></div>
          </div>
        </div>
        <div class="unarranged-note">
          <div class="note-icon">💡</div>
          <div class="note-content"><b>说明</b>：本目录为《奖学金评审细则》计分课程。未安排课程可能因教务系统更新不及时，<b>建议</b>先按8月31日发布的Excel课表去上课。</div>
        </div>
        <button class="btn-more" @click="goToGraduatePlan">🎓 查看研究生服务</button>
      </div>
    </div>

    <!-- 保存弹窗 -->
    <div v-if="showSaveModal" class="overlay" @click.self="showSaveModal = false">
      <div class="save-modal">
        <div class="save-title">📷 保存课程表截图</div>
        <div class="save-hint">💡 提示：只能保存当前页面显示的课表形式</div>
        <div class="save-current">
          <span v-if="showSemester">📚 当前显示：学期课表</span>
          <span v-else>📅 当前显示：第{{ selectedWeek }}周课表</span>
        </div>
        <div class="save-actions"><button class="btn-cancel" @click="showSaveModal = false">取消</button><button class="btn-save" @click="doSave">保存</button></div>
      </div>
    </div>

    <!-- 详情 -->
    <div v-if="showDetail" class="overlay" @click.self="closeDetail">
      <div class="detail-modal">
        <div class="detail-header" :style="{ background: selectedCourse?.color }"><div class="detail-title">{{ selectedCourse?.name }}</div><button class="detail-close" @click="closeDetail">✕</button></div>
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
        </div>
        <div class="detail-actions"><button class="action-btn" @click="goToClassroomNav">🧭 教室导航</button><button class="action-btn" @click="goToCanteen">🍚 去哪吃</button></div>
        <div class="detail-footer"><button class="btn-close" @click="closeDetail">关闭</button></div>
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
.next-card { margin: 14px 12px 0; background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; position: relative; }
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
.control-row { display: flex; gap: 6px; padding: 0 12px; margin-bottom: 6px; overflow-x: auto; flex-wrap: nowrap; align-items: center; }
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

.mode-hint { padding: 6px 12px; margin: 0 12px 8px; font-size: 12px; color: var(--primary); font-weight: 600; background: var(--primary-soft); border-radius: 8px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; }
.hint-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #fef3c7; color: #92400e; }

/* 表格 */
.grid-view { padding: 0; }
.schedule-table-wrapper { --font-scale: 1; position: relative; }
.schedule-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.schedule-table th, .schedule-table td { border: 1px solid var(--border); padding: 0; }
.period-col { width: 38px; background: var(--soft-fg); }
.weekday-col { background: var(--soft-fg); font-weight: 700; }
.weekday-col.weekend { background: #f5f5f5; }
.weekday-col.is-today { background: #dbeafe; }
.weekday-label { padding: 6px 0 0; font-size: 12px; font-weight: 700; }
.weekday-date { padding: 0 0 4px; font-size: 9px; color: var(--text-sub); }
.period-cell { background: var(--soft-fg); text-align: center; padding: 4px 2px; vertical-align: middle; }
.period-num { font-weight: 800; font-size: 14px; color: var(--primary); line-height: 1.2; }
.period-time { font-size: 7px; color: var(--text-sub); line-height: 1.1; margin-top: 1px; }
.period-time-end { font-size: 6.5px; color: var(--text-sub); line-height: 1.1; }

/* 4-5节和8-9节分隔线（加粗） */
tr.section-afternoon td { border-top: 2px solid var(--text) !important; }
tr.section-evening td { border-top: 2px solid var(--text) !important; }
.course-cell { padding: 3px; height: 46px; vertical-align: middle; cursor: default; transition: background .15s; }
.course-cell.weekend { background: #fafafa; }
.course-cell.is-today { background: #eff6ff; }
.course-cell.has-course { cursor: pointer; }
.course-cell.has-course:hover { background: var(--primary-soft); }
.course-cell.other-week { opacity: 0.5; }
.course-cell.is-flashing { animation: flashHighlight 0.6s ease 4; z-index: 1; position: relative; }
@keyframes flashHighlight {
  0%, 100% { background-color: transparent; }
  25%, 75% { background-color: #fef08a; }
  50% { background-color: #fde047; }
}
.course-cell.is-flashing::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid #eab308;
  border-radius: 4px;
  animation: flashBorder 0.6s ease 4;
}
@keyframes flashBorder {
  0%, 100% { border-color: transparent; }
  50% { border-color: #eab308; }
}
.course-card { border-left: 3px solid; border-radius: 4px; padding: 4px 8px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.course-card.white { background: var(--card); }
.course-card.color { backdrop-filter: blur(8px); }
.course-name { font-weight: 700; font-size: calc(11px * var(--font-scale)); line-height: 1.3; color: var(--text); }
.course-info { display: flex; flex-direction: column; gap: 0; }
.course-location, .course-teacher, .course-weeks { font-size: calc(9px * var(--font-scale)); color: var(--text-sub); line-height: 1.2; }
.course-weeks { color: var(--primary); font-weight: 600; }

/* 时间射线 - 只在当日列内显示 */
.time-line { position: absolute; height: 2px; background: #ef4444; z-index: 10; pointer-events: none; }
.time-line::before { content: ''; position: absolute; left: -5px; top: -4px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; }
.time-label { position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 3px; white-space: nowrap; line-height: 1; }

/* 列表 */
.list-view { padding: 0 12px; display: flex; flex-direction: column; gap: 16px; }
.list-day { display: flex; flex-direction: column; gap: 10px; }
.list-day.is-today { background: #eff6ff; padding: 8px; border-radius: 12px; }
.list-day-header { display: flex; align-items: baseline; gap: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--primary); }
.day-name { font-size: 16px; font-weight: 800; color: var(--primary); }
.day-date { font-size: 12px; color: var(--text-sub); }
.list-card { background: var(--card); border: 1px solid var(--border); border-left: 4px solid; border-radius: 10px; padding: 12px; cursor: pointer; }
.list-card.other-week { opacity: 0.5; }
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

/* 奖学金评审计分课程目录面板 */
.unarranged-panel { margin: 16px 12px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.unarranged-panel.has-warning { border-color: #f59e0b; box-shadow: 0 2px 8px rgba(245,158,11,0.15); }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; background: var(--soft-fg); }
.unarranged-panel.has-warning .panel-header { background: #fffbeb; }
.panel-title-row { display: flex; align-items: center; gap: 8px; }
.panel-icon { font-size: 16px; }
.panel-title { font-weight: 700; font-size: 13px; }
.panel-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #f59e0b; color: #fff; font-weight: 600; }
.panel-arrow { font-size: 12px; color: var(--text-sub); }
.panel-body { padding: 16px; }
.progress-section { margin-bottom: 16px; }
.progress-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.progress-bar { height: 8px; border-radius: 999px; background: var(--border); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 999px; background: var(--primary); transition: width .3s ease; }
.course-section { margin-bottom: 16px; }
.course-section.warning { background: #fffbeb; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24; }
.course-section.extra { background: #f0f9ff; padding: 12px; border-radius: 8px; border: 1px solid #bae6fd; }
.section-title { font-weight: 700; font-size: 13px; margin-bottom: 10px; color: var(--text); }
.course-section.warning .section-title { color: #b45309; }
.course-section.extra .section-title { color: #0369a1; }
.course-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.course-chip { display: flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 8px; font-size: 12px; }
.course-chip.arranged { background: #dcfce7; border: 1px solid #86efac; }
.course-chip.arranged .chip-name { color: #166534; font-weight: 600; }
.course-chip.unarranged { background: #fef3c7; border: 1px solid #fbbf24; }
.course-chip.unarranged .chip-name { color: #92400e; font-weight: 600; }
.course-chip.extra { background: #e0f2fe; border: 1px solid #7dd3fc; }
.course-chip.extra .chip-name { color: #0c4a6e; font-weight: 600; }
.chip-credits { font-size: 10px; color: var(--text-sub); }
.unarranged-note { display: flex; gap: 10px; background: var(--soft-fg); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.note-icon { font-size: 16px; flex-shrink: 0; }
.note-content { font-size: 12px; color: var(--text-sub); line-height: 1.6; }
.btn-more { width: 100%; padding: 12px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-more:hover { background: color-mix(in srgb, var(--primary) 80%, #000); }

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
.detail-actions { display: flex; gap: 8px; padding: 0 20px 16px; }
.action-btn { flex: 1; padding: 10px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.detail-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
.btn-close { width: 100%; padding: 12px; border: none; border-radius: 8px; background: var(--soft-fg); color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer; }

/* 手机端 */
@media (max-width: 640px) {
  .schedule-header { border-radius: 0; margin: -16px -16px 0; padding: 12px 16px 14px; }
  .header-title { font-size: 16px; }
  .stat-value { font-size: 14px; color: #fff; }
  .next-card, .today-section { margin: 10px 8px 0; }
  .search-bar { padding: 10px 8px 0; }
  .week-selector, .control-row { padding: 0 8px; }
  .mode-hint { margin: 0 8px 8px; font-size: 11px; }
  .grid-view { padding: 0; overflow-x: auto; }
  .period-col { width: 30px; }
  .course-cell { height: 44px; padding: 2px; }
  .course-card { padding: 3px 5px; }
  .course-name { font-size: 10px; }
  .course-location, .course-teacher { font-size: 8px; }
  .list-view { padding: 0 8px; }
  .week-chip { min-width: 45px; padding: 5px 8px; }
  .zoom-group { padding: 2px 4px; }
  .zoom-btn { width: 22px; height: 22px; font-size: 10px; }
  .save-btn { padding: 5px 8px; font-size: 10px; }
  .opt-btn { padding: 5px 8px; font-size: 10px; }
  .time-line::before { width: 8px; height: 8px; left: -4px; top: -3px; }
  .time-label { font-size: 9px; padding: 1px 4px; }
  .unarranged-panel { margin: 12px 0; border-radius: 0; border-left: none; border-right: none; }
}
</style>
