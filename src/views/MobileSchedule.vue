<script setup>
/**
 * 🩸 课表 — 移动端独立应用
 * 双模式：页面版（完整功能）/ 纯课表（全屏表格）
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
  loadUserOverrides, saveUserOverride,
} from '../data/classSchedule'

const CUSTOM_KEY = 'feike_custom_courses'
const DELETED_KEY = 'feike_deleted_courses'
const OVERLAY_KEY = 'feike_day_overrides'
const MODE_KEY = 'feike_display_mode'

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}
function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const customCourses = ref(loadJSON(CUSTOM_KEY, []))
const deletedCourses = ref(loadJSON(DELETED_KEY, []))
const displayMode = ref(localStorage.getItem(MODE_KEY) || 'page')
watch(displayMode, v => localStorage.setItem(MODE_KEY, v))

const selectedMajor = ref('cs-master')
const selectedWeek = ref(getCurrentWeek())
const showSemester = ref(false)
const typeFilter = ref('all')
const searchKw = ref('')
const fontSize = ref(100)
const colorMode = ref('white')
const highlightToday = ref(true)
const mounted = ref(false)
const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

const weekdayHeaders = computed(() => WEEKDAYS)
const todayWeekday = computed(() => { const d = now.value.getDay(); return d === 0 ? 7 : d })
const todayDateStr = computed(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })

const allCourses = computed(() => {
  const editedIds = new Set(customCourses.value.filter(c => c._editId).map(c => c._editId))
  const base = COURSES.filter(c => !editedIds.has(c.id) && c.major === selectedMajor.value)
  const custom = customCourses.value.filter(c => c.major === selectedMajor.value)
  return [...base, ...custom].filter(c => !deletedCourses.value.includes(c.id) && !deletedCourses.value.includes(c._editId || c.id))
})
const majorCourses = computed(() => allCourses.value.filter(c => c.major === selectedMajor.value))

const todayCourses = computed(() => {
  const scheduleWd = getTodayScheduleWeekday()
  if (scheduleWd === null) return []
  return majorCourses.value.filter(c => {
    if (c.weekday !== scheduleWd) return false
    if (!showSemester.value && !isCourseInWeek(c, selectedWeek.value)) return false
    if (!showSemester.value && deletedCourses.value.includes(c.id + '_wk' + selectedWeek.value)) return false
    return true
  }).sort((a, b) => a.startPeriod - b.startPeriod)
})
const hasTodayCourses = computed(() => todayCourses.value.length > 0)

const displayCourses = computed(() => {
  let courses = showSemester.value ? majorCourses.value : majorCourses.value.filter(c => {
    if (!isCourseInWeek(c, selectedWeek.value)) return false
    if (deletedCourses.value.includes(c.id + '_wk' + selectedWeek.value)) return false
    return true
  })
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

function getIncomingCourse(dateStr, period) {
  const info = getIncomingInfoFromData(dateStr, period, (wd, sp) => {
    return displayCourses.value.find(c => c.weekday === wd && sp >= c.startPeriod && sp <= c.endPeriod) || null
  })
  return info?.course || null
}
function getIncomingInfoLocal(dateStr, period) {
  return getIncomingInfoFromData(dateStr, period, (wd, sp) => {
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
  if (effectiveWd !== weekday) {
    return majorCourses.value.find(c => c.weekday === effectiveWd && period >= c.startPeriod && period <= c.endPeriod) || null
  }
  return displayCourses.value.find(c => c.weekday === effectiveWd && period >= c.startPeriod && period <= c.endPeriod) || null
}
function getCourseSpan(course) { return course ? (course.endPeriod - course.startPeriod + 1) : 1 }
function isCellMerged(weekday, period) {
  if (isHoliday(weekday)) return false
  const ds = dateStrOf(weekday)
  const incoming = getIncomingCourse(ds, period)
  if (incoming) return displayCourses.value.some(c => c.weekday === incoming.weekday && period > c.startPeriod && period <= c.endPeriod)
  const effectiveWd = getMakeupWeekday(weekday)
  if (effectiveWd !== weekday) return majorCourses.value.some(c => c.weekday === effectiveWd && period > c.startPeriod && period <= c.endPeriod)
  return displayCourses.value.some(c => c.weekday === effectiveWd && period > c.startPeriod && period <= c.endPeriod)
}
function isToday(weekday) { if (!highlightToday.value) return false; const date = getDateInWeek(selectedWeek.value, weekday); return date.toISOString().slice(0, 10) === todayDateStr.value }
function getCourseColor(course, alpha = 1) { if (!course) return 'transparent'; const hex = course.color || '#1565c0'; return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})` }
function getDateText(weekday) { return formatDateShort(getDateInWeek(selectedWeek.value, weekday)) }
function getWeekRange() { return getWeekDateRange(selectedWeek.value) }
function getWeekTypeInfo(course) { return formatWeekdayType(course.weekdayType) }
function dateStrOf(weekday) {
  const d = getDateInWeek(selectedWeek.value, weekday)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function getHolidayInfo(weekday) { return getDateHolidayInfo(dateStrOf(weekday)) }
function isHoliday(weekday) { const h = getHolidayInfo(weekday); return h?.type === 'holiday' }
function isMakeup(weekday) { const h = getHolidayInfo(weekday); return h?.type === 'makeup' }
function getMakeupWeekday(weekday) {
  const h = getHolidayInfo(weekday)
  if (h?.type === 'makeup') return h.scheduleWeekday
  return weekday
}
function getOverride(weekday, period) { return getCourseOverride(dateStrOf(weekday), period) || null }
function getTodayScheduleWeekday() {
  const info = getDateHolidayInfo(todayDateStr.value)
  if (!info) return todayWeekday.value
  if (info.type === 'holiday') return null
  if (info.type === 'makeup') return info.scheduleWeekday
  return todayWeekday.value
}

const weekShortcuts = computed(() => Array.from({ length: 18 }, (_, i) => ({ value: i + 1, dateRange: getWeekDateRange(i + 1) })))
const currentMajor = computed(() => MAJORS.find(m => m.key === selectedMajor.value))

// ===== 联动跳转（纯课表模式下不使用） =====
const selectedCourse = ref(null)
const showDetail = ref(false)
function openCourseDetail(course) { selectedCourse.value = course; showDetail.value = true }

// ===== 添加课程 =====
const showAddModal = ref(false)
const addForm = ref({ name: '', location: '', teacher: '', weekday: 1, startPeriod: 1, endPeriod: 2, weekStart: 1, weekEnd: 18, weekdayType: 'all', id: '', category: '专业必修课', credits: 2, hours: 32 })
function openAddModal(weekday, period) {
  addForm.value = { name: '', location: '', teacher: '', weekday: weekday || 1, startPeriod: period || 1, endPeriod: (period || 1) + 1, weekStart: 1, weekEnd: 18, weekdayType: 'all', id: '', category: '专业必修课', credits: 2, hours: 32 }
  showAddModal.value = true
}
function doAddCourse() {
  const f = addForm.value
  if (!f.name.trim() || !f.location.trim()) return
  const colors = ['#1565c0', '#00695c', '#6a1b9a', '#e65100', '#ad1457', '#c62828', '#2e7d32', '#0277bd']
  const newCourse = {
    _id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    _custom: true,
    name: f.name.trim(),
    id: f.id.trim() || 'CUSTOM-' + Date.now(),
    teacher: f.teacher.trim() || '待定',
    location: f.location.trim(),
    weeks: f.weekStart + '-' + f.weekEnd,
    weekdayType: f.weekdayType,
    startPeriod: f.startPeriod,
    endPeriod: f.endPeriod,
    weekday: f.weekday,
    credits: f.credits || 2,
    hours: f.hours || 32,
    category: f.category || '专业必修课',
    color: colors[Math.floor(Math.random() * colors.length)],
    major: selectedMajor.value,
  }
  customCourses.value.push(newCourse)
  saveJSON(CUSTOM_KEY, customCourses.value)
  showAddModal.value = false
}

// ===== 编辑课程 =====
const showEditModal = ref(false)
const editForm = ref({})
const editTarget = ref(null)
function openEditModal(course) {
  if (!course) return
  editTarget.value = course
  const [ws, we] = (course.weeks || '1-18').split('-').map(Number)
  editForm.value = { name: course.name, location: course.location, teacher: course.teacher || '', weekday: course.weekday, startPeriod: course.startPeriod, endPeriod: course.endPeriod, weekStart: ws, weekEnd: we, weekdayType: course.weekdayType || 'all', id: course.id || '', category: course.category || '专业必修课', credits: course.credits || 2, hours: course.hours || 32 }
  showDetail.value = false
  showEditModal.value = true
}
function doEditCourse() {
  const f = editForm.value, c = editTarget.value
  if (!f.name.trim() || !f.location.trim() || !c) return
  const updated = { ...c, name: f.name.trim(), id: f.id.trim() || c.id, teacher: f.teacher.trim() || '待定', location: f.location.trim(), weekdayType: f.weekdayType, startPeriod: f.startPeriod, endPeriod: f.endPeriod, weekday: f.weekday, credits: f.credits || 2, hours: f.hours || 32, category: f.category || '专业必修课', weeks: f.weekStart + '-' + f.weekEnd }
  if (c._custom) {
    const idx = customCourses.value.findIndex(x => x._id === c._id)
    if (idx !== -1) customCourses.value[idx] = { ...updated, _custom: true, _id: c._id }
    else customCourses.value.push({ ...updated, _custom: true, _id: c._id })
  } else {
    const existingIdx = customCourses.value.findIndex(x => x._editId === c.id && x.major === c.major)
    if (existingIdx !== -1) customCourses.value[existingIdx] = { ...updated, _custom: true, _editId: c.id }
    else customCourses.value.push({ ...updated, _custom: true, _editId: c.id })
  }
  saveJSON(CUSTOM_KEY, customCourses.value)
  showEditModal.value = false
}

// ===== 删除课程 =====
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)
function confirmDeleteCourse(course) { deleteTarget.value = course; showDeleteConfirm.value = true }
function doDeleteCourse() {
  const c = deleteTarget.value
  if (!c) { showDeleteConfirm.value = false; return }
  if (c._custom) {
    customCourses.value = customCourses.value.filter(x => x._id !== c._id)
  } else {
    deletedCourses.value = [...deletedCourses.value, c.id]
    saveJSON(DELETED_KEY, deletedCourses.value)
  }
  saveJSON(CUSTOM_KEY, customCourses.value)
  showDeleteConfirm.value = false
  showDetail.value = false
}

// ===== 恢复默认 =====
const showResetConfirm = ref(false)
function doResetAll() {
  customCourses.value = []
  deletedCourses.value = []
  saveJSON(CUSTOM_KEY, [])
  saveJSON(DELETED_KEY, [])
  showResetConfirm.value = false
}

// ===== 导入/导出 =====
const showImportExport = ref(false)
const importText = ref('')
function doExport() {
  const data = { custom: customCourses.value, deleted: deletedCourses.value, major: selectedMajor.value }
  importText.value = JSON.stringify(data, null, 2)
}
function doImport() {
  try {
    const data = JSON.parse(importText.value)
    if (data.custom) { customCourses.value = data.custom; saveJSON(CUSTOM_KEY, data.custom) }
    if (data.deleted) { deletedCourses.value = data.deleted; saveJSON(DELETED_KEY, data.deleted) }
    if (data.major) selectedMajor.value = data.major
    showImportExport.value = false
  } catch { alert('导入格式错误') }
}
function copyExport() {
  navigator.clipboard?.writeText(importText.value)
  alert('已复制到剪贴板')
}

// ===== 编辑周几（补课/停课） =====
const showDayEdit = ref(false)
const dayEditTarget = ref(null)
const dayEditType = ref('none')
const dayEditMakeupWd = ref(2)
const dayEditName = ref('')
function openDayEdit(weekday) {
  dayEditTarget.value = weekday
  const ds = dateStrOf(weekday)
  const existing = loadUserOverrides()[ds]
  if (existing) { dayEditType.value = existing.type || 'none'; dayEditMakeupWd.value = existing.scheduleWeekday || 2; dayEditName.value = existing.name || '' }
  else { dayEditType.value = 'none'; dayEditMakeupWd.value = 2; dayEditName.value = '' }
  showDayEdit.value = true
}
function doDayEdit() {
  const wd = dayEditTarget.value; if (!wd) return
  const ds = dateStrOf(wd)
  if (dayEditType.value === 'none') saveUserOverride(ds, null)
  else if (dayEditType.value === 'holiday') saveUserOverride(ds, { type: 'holiday', name: dayEditName.value || '停课', icon: '🚫' })
  else if (dayEditType.value === 'makeup') {
    const labels = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
    saveUserOverride(ds, { type: 'makeup', scheduleWeekday: dayEditMakeupWd.value, icon: '📅', descShort: '补' + labels[dayEditMakeupWd.value] + '课', desc: '补' + labels[dayEditMakeupWd.value] })
  }
  showDayEdit.value = false
}

// ===== 截图 =====
async function doSave() {
  try {
    if (!window.html2canvas) { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; document.head.appendChild(s); await new Promise((r, j) => { s.onload = r; s.onerror = j }) }
    const el = document.querySelector('.schedule-table-wrapper')
    if (!el) return
    const canvas = await window.html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = `课表_${currentMajor?.value?.short || ''}_${showSemester.value ? '学期' : '第' + selectedWeek.value + '周'}_${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png'); link.click()
  } catch (e) { console.error('截图失败:', e) }
}

// ===== 触摸手势：左右滑动切换周次 =====
let touchStartX = 0, touchStartY = 0
function onTouchStart(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
    if (dx < 0 && selectedWeek.value < 18) selectedWeek.value++
    else if (dx > 0 && selectedWeek.value > 1) selectedWeek.value--
  }
}

onMounted(() => { selectedWeek.value = getCurrentWeek(); nextTick(() => { mounted.value = true }) })
</script>

<template>
  <div class="app" :class="[displayMode, 'mode-' + displayMode]" @touchstart="onTouchStart" @touchend="onTouchEnd">

    <!-- ===== 顶部栏 ===== -->
    <header class="top-bar">
      <div class="top-left">
        <button v-if="displayMode === 'page'" class="icon-btn" @click="displayMode = 'pure'">📐</button>
        <button v-else class="icon-btn" @click="displayMode = 'page'">📄</button>
      </div>
      <div class="top-center">
        <span class="app-title">🩸 课表</span>
        <span class="app-sub" v-if="displayMode === 'page'">{{ currentMajor?.short }} · {{ showSemester ? '学期' : '第' + selectedWeek + '周' }}</span>
      </div>
      <div class="top-right">
        <button class="icon-btn" @click="showImportExport = true">📥</button>
        <button class="icon-btn" @click="doSave">📷</button>
      </div>
    </header>

    <!-- ===== 页面版内容 ===== -->
    <template v-if="displayMode === 'page'">
      <!-- 专业选择 -->
      <div class="major-bar">
        <button v-for="m in MAJORS" :key="m.key" class="major-chip" :class="{ active: selectedMajor === m.key }" :style="{ '--mc': m.color }" @click="selectedMajor = m.key">{{ m.short }}</button>
      </div>

      <!-- 下一节课 -->
      <div v-if="nextInfo" class="next-card">
        <div class="next-badge">⏰ {{ nextInfo.countdown?.text }}</div>
        <div class="next-name">{{ nextInfo.course.name }}</div>
        <div class="next-meta">{{ nextInfo.weekdayLabel }} · 第{{ nextInfo.course.startPeriod }}-{{ nextInfo.course.endPeriod }}节 · {{ nextInfo.course.location }}</div>
      </div>

      <!-- 今日课程 -->
      <div v-if="hasTodayCourses" class="today-card">
        <div class="today-title">📚 今日 {{ todayCourses.length }} 门</div>
        <div v-for="c in todayCourses" :key="c.id" class="today-item" :style="{ borderLeftColor: c.color }" @click="openCourseDetail(c)">
          <span class="today-time">{{ c.startPeriod }}-{{ c.endPeriod }}节</span>
          <span class="today-name">{{ c.name }}</span>
          <span class="today-loc">{{ c.location }}</span>
        </div>
      </div>

      <!-- 控制栏 -->
      <div class="ctrl-bar">
        <div class="week-nav">
          <button class="wn-btn" :disabled="selectedWeek <= 1" @click="selectedWeek--">‹</button>
          <span class="wn-text">第{{ selectedWeek }}周</span>
          <button class="wn-btn" :disabled="selectedWeek >= 18" @click="selectedWeek++">›</button>
        </div>
        <div class="ctrl-btns">
          <button class="ctrl-btn" @click="showSemester = !showSemester">{{ showSemester ? '📅 周' : '📊 学期' }}</button>
          <button class="ctrl-btn" @click="colorMode = colorMode === 'white' ? 'color' : 'white'">{{ colorMode === 'white' ? '🎨' : '📄' }}</button>
          <button class="ctrl-btn" @click="highlightToday = !highlightToday">{{ highlightToday ? '✨' : '⬜' }}</button>
          <button class="ctrl-btn" @click="showAddModal = true">➕</button>
        </div>
      </div>

      <!-- 搜索 -->
      <div class="search-bar">
        <input v-model="searchKw" class="search-input" placeholder="🔍 搜索课程、教师、教室…" />
      </div>
    </template>

    <!-- ===== 纯课表模式顶部：仅周次导航 ===== -->
    <template v-if="displayMode === 'pure'">
      <div class="pure-week-bar">
        <button class="pw-btn" :disabled="selectedWeek <= 1" @click="selectedWeek--">‹</button>
        <span class="pw-text">第{{ selectedWeek }}周 · {{ getWeekRange() }}</span>
        <button class="pw-btn" :disabled="selectedWeek >= 18" @click="selectedWeek++">›</button>
      </div>
    </template>

    <!-- ===== 课表网格（两种模式共用） ===== -->
    <div class="schedule-scroll">
      <div class="schedule-table-wrapper" :style="{ '--font-scale': fontSize / 100 }">
        <table class="schedule-table">
          <thead><tr>
            <th class="period-col">节</th>
            <th v-for="wd in weekdayHeaders" :key="wd.key" class="weekday-col" :class="{ weekend: wd.key >= 6, 'is-today': isToday(wd.key), 'is-holiday': isHoliday(wd.key), 'is-makeup': isMakeup(wd.key) }" @click="openDayEdit(wd.key)">
              <div class="weekday-label">{{ wd.short }}</div>
              <div class="weekday-date" v-if="displayMode === 'page'">{{ showSemester ? '' : getDateText(wd.key) }}</div>
              <div v-if="getHolidayInfo(wd.key)" class="holiday-badge" :class="getHolidayInfo(wd.key).type">
                <span>{{ getHolidayInfo(wd.key).icon }}</span>
                <span>{{ getHolidayInfo(wd.key).type === 'holiday' ? getHolidayInfo(wd.key).name : getHolidayInfo(wd.key).descShort }}</span>
              </div>
            </th>
          </tr></thead>
          <tbody>
            <template v-for="row in TABLE_ROWS" :key="row.period">
              <tr :class="'section-' + row.section" :data-period="row.period">
                <td class="period-cell"><div class="period-num">{{ row.label }}</div><div class="period-time">{{ row.time }}</div></td>
                <template v-for="wd in weekdayHeaders" :key="wd.key">
                  <td v-if="isHoliday(wd.key) && row.period === 1" :rowspan="12" class="course-cell is-holiday-col holiday-empty-cell">
                    <div class="holiday-empty"><span class="holiday-empty-icon">🎉</span><span class="holiday-empty-text">{{ getHolidayInfo(wd.key)?.name }}</span></div>
                  </td>
                  <td v-else-if="!isHoliday(wd.key) && !isCellMerged(wd.key, row.period)" :rowspan="getOverride(wd.key, row.period) ? getOverride(wd.key, row.period).srcPeriods.length : getCourseSpan(getCourse(wd.key, row.period))" class="course-cell" :data-key="wd.key + '-' + row.period"
                    :class="{ 'has-course': getCourse(wd.key, row.period) || getOverride(wd.key, row.period), weekend: wd.key >= 6, 'is-today': isToday(wd.key), 'is-holiday-col': isHoliday(wd.key), 'is-makeup-col': isMakeup(wd.key) }"
                    @click="getOverride(wd.key, row.period) ? null : getCourse(wd.key, row.period) ? openCourseDetail(getCourse(wd.key, row.period)) : openAddModal(wd.key, row.period)">
                    <div v-if="getOverride(wd.key, row.period)" class="moved-badge">
                      <span>↗️</span>
                      <span>{{ getOverride(wd.key, row.period).destDate.slice(5) }} 第{{ getOverride(wd.key, row.period).destPeriods[0] }}-{{ getOverride(wd.key, row.period).destPeriods.at(-1) }}节</span>
                    </div>
                    <div v-else-if="getCourse(wd.key, row.period)" class="course-card" :style="colorMode === 'color' ? { background: getCourseColor(getCourse(wd.key, row.period), 0.15), borderLeftColor: getCourseColor(getCourse(wd.key, row.period)) } : { borderLeftColor: getCourse(wd.key, row.period).color }">
                      <div class="course-name">{{ getCourse(wd.key, row.period).name }}</div>
                      <div class="course-info">{{ getCourse(wd.key, row.period).location }} · {{ getCourse(wd.key, row.period).teacher }}</div>
                    </div>
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== 页面版底部工具栏 ===== -->
    <div v-if="displayMode === 'page'" class="bottom-bar">
      <button class="bb-item" :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">全部</button>
      <button class="bb-item" :class="{ active: typeFilter === '专业必修课' }" @click="typeFilter = '专业必修课'">专必</button>
      <button class="bb-item" :class="{ active: typeFilter === '专业选修课' }" @click="typeFilter = '专业选修'">专选</button>
      <button class="bb-item" :class="{ active: typeFilter === '公共必修课' }" @click="typeFilter = '公共必修'">公必</button>
      <div class="bb-zoom">
        <button class="zb" @click="fontSize = Math.max(70, fontSize - 10)">A-</button>
        <span class="zl">{{ fontSize }}%</span>
        <button class="zb" @click="fontSize = Math.min(200, fontSize + 10)">A+</button>
      </div>
    </div>

    <!-- ===== 纯课表底部：简洁操作 ===== -->
    <div v-if="displayMode === 'pure'" class="pure-bottom">
      <button class="pb-btn" @click="selectedWeek = getCurrentWeek()">📍 本周</button>
      <button class="pb-btn" @click="doSave">📷 截图</button>
      <button class="pb-btn" @click="displayMode = 'page'">📄 完整</button>
    </div>

    <!-- ===== 弹窗们 ===== -->
    <!-- 课程详情 -->
    <div v-if="showDetail" class="overlay" @click.self="showDetail = false">
      <div class="modal detail-modal">
        <div class="modal-header" :style="{ background: selectedCourse?.color }">
          <span class="modal-title">{{ selectedCourse?.name }}</span>
          <button class="modal-close" @click="showDetail = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-row"><span>编号</span><b>{{ selectedCourse?.id }}</b></div>
          <div class="detail-row"><span>类别</span><b>{{ selectedCourse?.category }}</b></div>
          <div class="detail-row"><span>学分</span><b>{{ selectedCourse?.credits }}</b></div>
          <div class="detail-row"><span>时间</span><b>{{ WEEKDAYS.find(w => w.key === selectedCourse?.weekday)?.label }} · {{ getCoursePeriodText(selectedCourse) }}</b></div>
          <div class="detail-row"><span>周次</span><b>第{{ selectedCourse?.weeks }}周</b></div>
          <div class="detail-row"><span>地点</span><b>{{ selectedCourse?.location }}</b></div>
          <div class="detail-row"><span>教师</span><b>{{ selectedCourse?.teacher }}</b></div>
        </div>
        <div class="modal-actions">
          <button class="btn-edit" @click="openEditModal(selectedCourse)">✏️ 编辑</button>
          <button class="btn-delete" @click="confirmDeleteCourse(selectedCourse)">🗑️ 删除</button>
        </div>
      </div>
    </div>

    <!-- 添加课程 -->
    <div v-if="showAddModal" class="overlay" @click.self="showAddModal = false">
      <div class="modal add-modal">
        <div class="modal-header"><span class="modal-title">➕ 添加课程</span><button class="modal-close" @click="showAddModal = false">✕</button></div>
        <div class="modal-body">
          <div class="form-row"><label>课程名称 *</label><input v-model="addForm.name" placeholder="如：高等数学"></div>
          <div class="form-row"><label>上课地点 *</label><input v-model="addForm.location" placeholder="如：笃行1-201"></div>
          <div class="form-row"><label>任课教师</label><input v-model="addForm.teacher" placeholder="如：张教授"></div>
          <div class="form-row"><label>星期</label>
            <div class="btn-group">
              <button v-for="w in 7" :key="w" class="sel-btn" :class="{ active: addForm.weekday === w }" @click="addForm.weekday = w">{{ ['','一','二','三','四','五','六','日'][w] }}</button>
            </div>
          </div>
          <div class="form-row"><label>节次</label>
            <div class="btn-group">
              <button v-for="p in 12" :key="p" class="sel-btn sm" :class="{ active: p >= addForm.startPeriod && p <= addForm.endPeriod }" @click="addForm.startPeriod = addForm.startPeriod === p ? p : Math.min(addForm.startPeriod, p); addForm.endPeriod = Math.max(addForm.endPeriod, p)">{{ p }}</button>
            </div>
          </div>
          <div class="form-row"><label>周次</label><input v-model="addForm.weekStart" type="number" min="1" max="18" style="width:60px"> ~ <input v-model="addForm.weekEnd" type="number" min="1" max="18" style="width:60px"></div>
          <div class="form-row"><label>类别</label>
            <div class="btn-group">
              <button v-for="t in ['专业必修课','专业选修课','公共必修课','公共选修课']" :key="t" class="sel-btn" :class="{ active: addForm.category === t }" @click="addForm.category = t">{{ t.slice(0,2) }}</button>
            </div>
          </div>
        </div>
        <div class="modal-actions"><button class="btn-cancel" @click="showAddModal = false">取消</button><button class="btn-primary" @click="doAddCourse">添加</button></div>
      </div>
    </div>

    <!-- 编辑课程 -->
    <div v-if="showEditModal" class="overlay" @click.self="showEditModal = false">
      <div class="modal add-modal">
        <div class="modal-header"><span class="modal-title">✏️ 编辑课程</span><button class="modal-close" @click="showEditModal = false">✕</button></div>
        <div class="modal-body">
          <div class="form-row"><label>课程名称 *</label><input v-model="editForm.name"></div>
          <div class="form-row"><label>上课地点 *</label><input v-model="editForm.location"></div>
          <div class="form-row"><label>任课教师</label><input v-model="editForm.teacher"></div>
          <div class="form-row"><label>星期</label>
            <div class="btn-group">
              <button v-for="w in 7" :key="w" class="sel-btn" :class="{ active: editForm.weekday === w }" @click="editForm.weekday = w">{{ ['','一','二','三','四','五','六','日'][w] }}</button>
            </div>
          </div>
          <div class="form-row"><label>节次</label>
            <div class="btn-group">
              <button v-for="p in 12" :key="p" class="sel-btn sm" :class="{ active: p >= editForm.startPeriod && p <= editForm.endPeriod }" @click="editForm.startPeriod = editForm.startPeriod === p ? p : Math.min(editForm.startPeriod, p); editForm.endPeriod = Math.max(editForm.endPeriod, p)">{{ p }}</button>
            </div>
          </div>
          <div class="form-row"><label>周次</label><input v-model="editForm.weekStart" type="number" min="1" max="18" style="width:60px"> ~ <input v-model="editForm.weekEnd" type="number" min="1" max="18" style="width:60px"></div>
        </div>
        <div class="modal-actions"><button class="btn-cancel" @click="showEditModal = false">取消</button><button class="btn-primary" @click="doEditCourse">保存</button></div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="showDeleteConfirm" class="overlay" @click.self="showDeleteConfirm = false">
      <div class="modal small-modal">
        <div class="modal-title" style="padding:16px 16px 8px;">确认删除「{{ deleteTarget?.name }}」？</div>
        <div class="modal-actions"><button class="btn-cancel" @click="showDeleteConfirm = false">取消</button><button class="btn-danger" @click="doDeleteCourse">删除</button></div>
      </div>
    </div>

    <!-- 恢复默认 -->
    <div v-if="showResetConfirm" class="overlay" @click.self="showResetConfirm = false">
      <div class="modal small-modal">
        <div class="modal-title" style="padding:16px 16px 8px;">确认恢复默认课表？</div>
        <div class="modal-actions"><button class="btn-cancel" @click="showResetConfirm = false">取消</button><button class="btn-danger" @click="doResetAll">恢复</button></div>
      </div>
    </div>

    <!-- 导入/导出 -->
    <div v-if="showImportExport" class="overlay" @click.self="showImportExport = false">
      <div class="modal add-modal">
        <div class="modal-header"><span class="modal-title">📥 导入 / 导出</span><button class="modal-close" @click="showImportExport = false">✕</button></div>
        <div class="modal-body">
          <div class="ie-btns">
            <button class="btn-primary" @click="doExport">📤 导出当前数据</button>
            <button class="btn-primary" @click="doImport" :disabled="!importText.trim()">📥 导入数据</button>
            <button class="btn-primary" v-if="importText" @click="copyExport">📋 复制</button>
          </div>
          <textarea v-model="importText" class="import-textarea" placeholder="粘贴导出的 JSON 数据到这里…"></textarea>
        </div>
      </div>
    </div>

    <!-- 编辑周几 -->
    <div v-if="showDayEdit" class="overlay" @click.self="showDayEdit = false">
      <div class="modal small-modal">
        <div class="modal-title" style="padding:16px 16px 8px;">📅 编辑{{ ['','周一','周二','周三','周四','周五','周六','周日'][dayEditTarget] }}</div>
        <div class="modal-body">
          <label class="radio-row"><input type="radio" v-model="dayEditType" value="none"><span>✅ 正常上课</span></label>
          <label class="radio-row"><input type="radio" v-model="dayEditType" value="holiday"><span>🚫 停课</span></label>
          <label class="radio-row"><input type="radio" v-model="dayEditType" value="makeup"><span>📅 调休补课</span></label>
          <div v-if="dayEditType === 'holiday'" class="form-row" style="margin-top:8px;"><input v-model="dayEditName" placeholder="备注（如：运动会）"></div>
          <div v-if="dayEditType === 'makeup'" class="form-row" style="margin-top:8px;">
            <div class="btn-group">
              <button v-for="w in [1,2,3,4,5]" :key="w" class="sel-btn" :class="{ active: dayEditMakeupWd === w }" @click="dayEditMakeupWd = w">{{ ['','一','二','三','四','五'][w] }}</button>
            </div>
          </div>
        </div>
        <div class="modal-actions"><button class="btn-cancel" @click="showDayEdit = false">取消</button><button class="btn-primary" @click="doDayEdit">确定</button></div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; background: #f5f5f5; color: #1a1a1a; overflow: hidden; }
.app.pure { background: #fff; }

/* 顶部栏 */
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; padding-top: calc(8px + env(safe-area-inset-top)); background: linear-gradient(135deg, #c62828, #ad1457); color: #fff; flex-shrink: 0; z-index: 10; }
.top-center { flex: 1; text-align: center; }
.app-title { font-size: 16px; font-weight: 800; }
.app-sub { display: block; font-size: 11px; opacity: 0.85; margin-top: 1px; }
.icon-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 36px; height: 36px; border-radius: 10px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* 专业选择 */
.major-bar { display: flex; gap: 6px; padding: 8px 12px; overflow-x: auto; flex-shrink: 0; -webkit-overflow-scrolling: touch; }
.major-chip { flex-shrink: 0; padding: 5px 12px; border-radius: 999px; border: 1.5px solid #ddd; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
.major-chip.active { background: var(--mc, #c62828); border-color: var(--mc, #c62828); color: #fff; }

/* 下一节课 */
.next-card { margin: 0 12px 8px; padding: 10px 14px; background: linear-gradient(135deg, #c62828, #ad1457); border-radius: 12px; color: #fff; flex-shrink: 0; }
.next-badge { font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.2); display: inline-block; padding: 2px 8px; border-radius: 999px; margin-bottom: 4px; }
.next-name { font-size: 15px; font-weight: 800; margin-bottom: 2px; }
.next-meta { font-size: 11px; opacity: 0.85; }

/* 今日课程 */
.today-card { margin: 0 12px 8px; padding: 10px 14px; background: #fff; border-radius: 12px; border: 1px solid #eee; flex-shrink: 0; }
.today-title { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.today-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-left: 3px solid; padding-left: 8px; margin-bottom: 4px; font-size: 12px; cursor: pointer; }
.today-time { font-weight: 700; color: #c62828; min-width: 40px; }
.today-name { font-weight: 600; flex: 1; }
.today-loc { color: #888; font-size: 11px; }

/* 控制栏 */
.ctrl-bar { display: flex; align-items: center; gap: 8px; padding: 0 12px 8px; flex-shrink: 0; }
.week-nav { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 4px 8px; }
.wn-btn { width: 28px; height: 28px; border: none; border-radius: 50%; background: #f0f0f0; font-size: 16px; cursor: pointer; }
.wn-btn:disabled { opacity: 0.3; }
.wn-text { font-size: 13px; font-weight: 700; color: #c62828; min-width: 50px; text-align: center; }
.ctrl-btns { display: flex; gap: 4px; margin-left: auto; }
.ctrl-btn { padding: 4px 8px; border: 1px solid #eee; border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer; }

/* 搜索 */
.search-bar { padding: 0 12px 8px; flex-shrink: 0; }
.search-input { width: 100%; padding: 8px 12px; border: 1px solid #eee; border-radius: 10px; background: #fff; font-size: 13px; outline: none; }
.search-input:focus { border-color: #c62828; }

/* 纯课表周次栏 */
.pure-week-bar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 6px 12px; flex-shrink: 0; background: #fff; border-bottom: 1px solid #eee; }
.pw-btn { width: 30px; height: 30px; border: none; border-radius: 50%; background: #f0f0f0; font-size: 18px; cursor: pointer; }
.pw-btn:disabled { opacity: 0.3; }
.pw-text { font-size: 13px; font-weight: 700; color: #333; }

/* 课表滚动区 */
.schedule-scroll { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; }
.schedule-table-wrapper { --font-scale: 1; min-width: 100%; }
.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: calc(10px * var(--font-scale)); }
.schedule-table th, .schedule-table td { border: 1px solid #e5e5e5; padding: 0; text-align: center; }
.period-col { width: 32px; background: #fafafa; }
.period-cell { background: #fafafa; vertical-align: middle; }
.period-num { font-weight: 800; font-size: calc(12px * var(--font-scale)); color: #c62828; }
.period-time { font-size: calc(7px * var(--font-scale)); color: #999; }
.weekday-col { background: #fafafa; font-weight: 700; padding: 4px 0; cursor: pointer; }
.weekday-col.is-today { background: #dbeafe; }
.weekday-col.is-holiday { background: #fef2f2; }
.weekday-col.is-makeup { background: #fffbeb; }
.weekday-label { font-size: calc(11px * var(--font-scale)); }
.weekday-date { font-size: calc(8px * var(--font-scale)); color: #999; }
.holiday-badge { display: inline-flex; align-items: center; gap: 2px; margin: 2px auto; padding: 1px 6px; border-radius: 999px; font-size: calc(8px * var(--font-scale)); font-weight: 700; }
.holiday-badge.holiday { background: #fca5a5; color: #991b1b; }
.holiday-badge.makeup { background: #fbbf24; color: #78350f; }
.course-cell { padding: 1px; height: calc(38px * var(--font-scale)); vertical-align: middle; cursor: pointer; }
.course-cell.weekend { background: #fafafa; }
.course-cell.is-today { background: #eff6ff; }
.course-cell.has-course { cursor: pointer; }
.course-card { border-left: 3px solid; border-radius: 4px; padding: 2px 4px; height: 100%; display: flex; flex-direction: column; justify-content: center; background: #fff; }
.course-card.color { }
.course-name { font-weight: 700; font-size: calc(9px * var(--font-scale)); line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-info { font-size: calc(7px * var(--font-scale)); color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.holiday-empty-cell { background: repeating-linear-gradient(45deg, #fef2f2, #fef2f2 8px, #fff5f5 8px, #fff5f5 16px); vertical-align: middle; }
.holiday-empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; }
.holiday-empty-icon { font-size: 24px; }
.holiday-empty-text { font-size: 11px; font-weight: 700; color: #dc2626; }
.moved-badge { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: calc(8px * var(--font-scale)); color: #b45309; font-weight: 600; }
.is-makeup-col { background: linear-gradient(135deg, #fffbeb, #fef3c7); }

/* 底部工具栏 */
.bottom-bar { display: flex; align-items: center; gap: 4px; padding: 8px 12px; padding-bottom: calc(8px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #eee; flex-shrink: 0; overflow-x: auto; }
.bb-item { flex-shrink: 0; padding: 4px 10px; border-radius: 999px; border: 1px solid #ddd; background: #fff; font-size: 11px; font-weight: 600; cursor: pointer; }
.bb-item.active { background: #c62828; border-color: #c62828; color: #fff; }
.bb-zoom { display: flex; align-items: center; gap: 4px; margin-left: auto; flex-shrink: 0; }
.zb { width: 26px; height: 26px; border: 1px solid #ddd; border-radius: 6px; background: #fff; font-size: 11px; font-weight: 700; cursor: pointer; }
.zl { font-size: 11px; color: #888; min-width: 28px; text-align: center; }

/* 纯课表底部 */
.pure-bottom { display: flex; gap: 8px; padding: 8px 12px; padding-bottom: calc(8px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #eee; flex-shrink: 0; justify-content: center; }
.pb-btn { padding: 6px 16px; border-radius: 999px; border: 1px solid #ddd; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }

/* 弹窗 */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; padding: 0; }
.modal { background: #fff; border-radius: 16px 16px 0 0; width: 100%; max-height: 85vh; display: flex; flex-direction: column; animation: slideUp .25s ease; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; color: #fff; border-radius: 16px 16px 0 0; flex-shrink: 0; }
.modal-title { font-size: 15px; font-weight: 700; }
.modal-close { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; cursor: pointer; }
.modal-body { padding: 12px 16px; overflow-y: auto; flex: 1; }
.modal-actions { display: flex; gap: 8px; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom)); border-top: 1px solid #eee; flex-shrink: 0; }
.modal-actions button { flex: 1; padding: 10px; border-radius: 10px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #c62828; color: #fff; }
.btn-cancel { background: #f0f0f0; color: #333; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-edit { background: #1565c0; color: #fff; }
.btn-delete { background: #dc2626; color: #fff; }
.small-modal { max-width: 320px; border-radius: 16px; margin: auto; }
.small-modal .modal-actions { border-radius: 0 0 16px 16px; }

/* 表单 */
.form-row { margin-bottom: 10px; }
.form-row label { display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 4px; }
.form-row input, .form-row select { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; outline: none; }
.form-row input:focus { border-color: #c62828; }
.btn-group { display: flex; gap: 4px; flex-wrap: wrap; }
.sel-btn { padding: 5px 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff; font-size: 12px; cursor: pointer; }
.sel-btn.sm { padding: 4px 7px; font-size: 11px; min-width: 28px; }
.sel-btn.active { background: #c62828; border-color: #c62828; color: #fff; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.detail-row span { color: #888; }
.detail-row b { font-weight: 600; }
.radio-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; cursor: pointer; }
.ie-btns { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.ie-btns button { flex: 1; min-width: 80px; padding: 8px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; background: #c62828; color: #fff; }
.import-textarea { width: 100%; height: 120px; border: 1px solid #ddd; border-radius: 8px; padding: 8px; font-size: 11px; font-family: monospace; resize: vertical; }

/* 纯课表模式：隐藏非必要元素 */
.mode-pure .major-bar, .mode-pure .next-card, .mode-pure .today-card,
.mode-pure .ctrl-bar, .mode-pure .search-bar, .mode-pure .bottom-bar { display: none; }
.mode-pure .schedule-scroll { flex: 1; }
</style>
