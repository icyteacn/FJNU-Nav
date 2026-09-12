<script setup>
/**
 * 课程表视图 v8
 * - 当日课程 + 下一节课倒计时
 * - 可调节字体大小（70%-200%）
 * - 优化手机端显示
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const selectedCourse = ref(null)
const showDetail = ref(false)
const viewMode = ref('grid')
const showUnarranged = ref(false)
const typeFilter = ref('all')
const showSemester = ref(false)
const searchKw = ref('')
const fontSize = ref(100)

const now = ref(new Date())
const tick = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => clearInterval(tick))

const weekdayHeaders = computed(() => WEEKDAYS)

// 当天是周几（1-7，0表示周日转为7）
const todayWeekday = computed(() => {
  const d = now.value.getDay()
  return d === 0 ? 7 : d
})

// 当天要上的课
const todayCourses = computed(() => {
  return COURSES.filter(c => {
    if (c.weekday !== todayWeekday.value) return false
    if (!showSemester.value && !isCourseInWeek(c, selectedWeek.value)) return false
    return true
  }).sort((a, b) => a.startPeriod - b.startPeriod)
})

// 是否今天有课
const hasTodayCourses = computed(() => todayCourses.value.length > 0)

// 当前节次
function getCurrentPeriod() {
  const h = now.value.getHours()
  const m = now.value.getMinutes()
  const t = h * 60 + m
  if (t < 8 * 60 + 20) return 0
  if (t < 9 * 60 + 5) return 1
  if (t < 9 * 60 + 15) return 2
  if (t < 10 * 60) return 2
  if (t < 10 * 60 + 20) return 3
  if (t < 11 * 60 + 5) return 3
  if (t < 11 * 60 + 15) return 4
  if (t < 12 * 60) return 4
  if (t < 14 * 60) return 0
  if (t < 14 * 60 + 45) return 5
  if (t < 14 * 60 + 55) return 6
  if (t < 15 * 60 + 40) return 6
  if (t < 15 * 60 + 50) return 7
  if (t < 16 * 60 + 35) return 7
  if (t < 16 * 60 + 45) return 8
  if (t < 17 * 60 + 30) return 8
  if (t < 18 * 60 + 30) return 0
  if (t < 19 * 60 + 15) return 9
  if (t < 19 * 60 + 25) return 10
  if (t < 20 * 60 + 10) return 10
  if (t < 20 * 60 + 20) return 11
  if (t < 21 * 60 + 5) return 11
  if (t < 21 * 60 + 15) return 12
  if (t < 22 * 60) return 12
  return 0
}

// 获取课程对应的日期（本周或下周）
function getCourseDate(course) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDay = today.getDay() || 7 // 1=周一, 7=周日
  
  // 计算到目标周几的天数差
  let diffDays = course.weekday - currentDay
  if (diffDays < 0) diffDays += 7 // 如果目标日已过，跳到下周
  
  const courseDate = new Date(today)
  courseDate.setDate(today.getDate() + diffDays)
  return courseDate
}

// 未来所有课程（按时间排序）- 不受selectedWeek限制，总是显示真实未来的课
const futureCourses = computed(() => {
  const curPeriod = getCurrentPeriod()
  const today = new Date()
  const currentDay = today.getDay() || 7
  const nowMinutes = today.getHours() * 60 + today.getMinutes()

  // 使用所有课程（不按selectedWeek筛选），因为要找真正的下一节课
  const allCourses = COURSES
  const result = []

  for (const course of allCourses) {
    const courseDate = getCourseDate(course)
    const startTime = SINGLE_PERIOD_TIMES[course.startPeriod]
    if (!startTime) continue
    const [sh, sm] = startTime.split('-')[0].split(':').map(Number)
    
    // 设置课程开始时间
    const targetDate = new Date(courseDate)
    targetDate.setHours(sh, sm, 0, 0)
    
    // 判断是否是未来：日期在未来，或者今天且当前时间小于课程开始时间
    const isToday = course.weekday === currentDay
    const isAfterNow = targetDate.getTime() > today.getTime()
    const isTodayFuture = isToday && nowMinutes < sh * 60 + sm
    
    if (isAfterNow || isTodayFuture) {
      result.push({ ...course, _date: targetDate })
    }
  }

  // 按日期时间排序
  result.sort((a, b) => a._date - b._date || a.startPeriod - b.startPeriod)
  return result
})

// 下一节课（未来最近的一节）
const nextCourse = computed(() => futureCourses.value[0] || null)

// 下一节课倒计时
const nextCountdown = computed(() => {
  if (!nextCourse.value) return null
  const target = nextCourse.value._date
  const diff = target - now.value
  if (diff <= 0) return { text: '进行中', isOngoing: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  if (days > 0) return { text: `${days}天${hours}时${mins}分`, isOngoing: false }
  if (hours > 0) return { text: `${hours}时${mins}分${secs}秒`, isOngoing: false }
  return { text: `${mins}分${secs}秒`, isOngoing: false }
})

// 下节课信息
const nextInfo = computed(() => {
  if (!nextCourse.value) return null
  return {
    course: nextCourse.value,
    countdown: nextCountdown.value,
    weekdayLabel: WEEKDAYS.find(w => w.key === nextCourse.value.weekday)?.label,
    dateStr: formatDateShort(nextCourse.value._date),
  }
})

const displayCourses = computed(() => {
  let courses
  if (showSemester.value) {
    courses = COURSES
  } else {
    courses = COURSES.filter(c => isCourseInWeek(c, selectedWeek.value))
  }
  if (typeFilter.value !== 'all') {
    courses = courses.filter(c => c.category === typeFilter.value)
  }
  if (searchKw.value) {
    const kw = searchKw.value.toLowerCase()
    courses = courses.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.teacher.toLowerCase().includes(kw) ||
      c.location.toLowerCase().includes(kw)
    )
  }
  return courses
})

const coursesByDay = computed(() => {
  const map = new Map()
  for (let wd = 1; wd <= 7; wd++) {
    const dayCourses = displayCourses.value.filter(c => c.weekday === wd)
    if (dayCourses.length) map.set(wd, dayCourses)
  }
  return [...map.entries()]
})

const totalCredits = computed(() => getArrangedCredits())
const allCredits = computed(() => getTotalCredits())
const unarrangedCourses = computed(() => getUnarrangedCourses())

const extraCourses = computed(() => {
  const requiredNames = REQUIRED_COURSES.map(c => c.arrangedName || c.name)
  const extra = []
  const seen = new Set()
  for (const c of COURSES) {
    if (!requiredNames.includes(c.name) && !seen.has(c.name)) {
      seen.add(c.name)
      extra.push({ name: c.name, credits: c.credits, category: c.category })
    }
  }
  return extra
})

function getDateText(weekday) {
  const date = getDateInWeek(selectedWeek.value, weekday)
  return formatDateShort(date)
}

function getWeekRange() {
  return getWeekDateRange(selectedWeek.value)
}

function getCourse(weekday, period) {
  if (showSemester.value) return getCourseAtPeriod(weekday, period)
  return getCourseAtPeriod(weekday, period, selectedWeek.value)
}

function getCourseSpan(course) {
  if (!course) return 1
  return getCourseRowSpan(course)
}

function isCellMerged(weekday, period) {
  if (showSemester.value) return isMergedCell(weekday, period)
  return isMergedCell(weekday, period, selectedWeek.value)
}

function openCourseDetail(course) {
  selectedCourse.value = course
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedCourse.value = null
}

function goToClassroomNav() { emit('open', 'classroomNav') }
function goToCanteen() { emit('open', 'canteen') }
function goToGraduatePlan() { emit('open', 'graduatePlan') }

function getWeekTypeInfo(course) {
  return formatWeekdayType(course.weekdayType)
}

// 字体大小调节
function setFontSize(size) {
  fontSize.value = size
}

const weekShortcuts = computed(() => {
  const weeks = []
  for (let i = 1; i <= 18; i++) {
    weeks.push({ value: i, label: `${i}`, dateRange: getWeekDateRange(i) })
  }
  return weeks
})

onMounted(() => {
  selectedWeek.value = getCurrentWeek()
})
</script>

<template>
  <div class="schedule-view">
    <!-- 顶部信息栏 -->
    <div class="schedule-header">
      <div class="header-top">
        <button class="back-btn" @click="emit('back')">← 返回</button>
        <div class="header-title">📚 我的课表</div>
        <div class="header-right">
          <button class="view-toggle" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
            {{ viewMode === 'grid' ? '📋 列表' : '📊 表格' }}
          </button>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ showSemester ? '学期' : '第' + selectedWeek + '周' }}</span>
          <span class="stat-label">{{ showSemester ? '全部课程' : getWeekRange() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ displayCourses.length }}门</span>
          <span class="stat-label">课程</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCredits }}/{{ allCredits }}</span>
          <span class="stat-label">学分</span>
        </div>
      </div>
    </div>

    <!-- 当日课程提醒卡片 -->
    <div class="today-card" :class="{ 'has-courses': hasTodayCourses }">
      <!-- 下一节课倒计时 -->
      <div v-if="nextInfo" class="next-banner">
        <div class="next-top">
          <span class="next-badge">⏰ 下一节课</span>
          <span class="next-countdown" :class="{ ongoing: nextInfo.countdown?.isOngoing }">{{ nextInfo.countdown?.text }}</span>
        </div>
        <div class="next-info">
          <span class="next-name">{{ nextInfo.course.name }}</span>
          <span class="next-meta">{{ nextInfo.weekdayLabel }} {{ nextInfo.dateStr }} · 第{{ nextInfo.course.startPeriod }}-{{ nextInfo.course.endPeriod }}节 · {{ nextInfo.course.location }}</span>
        </div>
      </div>
      <div v-else class="next-banner no-class">
        <span class="next-badge">🎉 近期没有更多课程了</span>
      </div>

      <!-- 今日课程列表 -->
      <div class="today-header">
        <span class="today-badge">{{ hasTodayCourses ? '📚 今日课程（' + todayCourses.length + '门）' : '🎉 今天没课' }}</span>
        <span class="today-date">{{ WEEKDAYS.find(w => w.key === todayWeekday)?.label }} {{ formatDateShort(now) }}</span>
      </div>
      <div v-if="hasTodayCourses" class="today-list">
        <div v-for="course in todayCourses" :key="course.id" class="today-item" @click="openCourseDetail(course)">
          <div class="today-time">第{{ course.startPeriod }}-{{ course.endPeriod }}节</div>
          <div class="today-info">
            <div class="today-name">{{ course.name }}</div>
            <div class="today-meta">{{ course.location }} · {{ course.teacher }}</div>
          </div>
          <div class="today-arrow">›</div>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <input class="search-input" v-model="searchKw" placeholder="🔍 搜索课程、教师、教室…" />
    </div>

    <!-- 周次选择器 -->
    <div v-if="!showSemester" class="week-selector">
      <div class="week-nav">
        <button class="week-nav-btn" :disabled="selectedWeek <= 1" @click="selectedWeek--">‹</button>
        <div class="week-current">
          <span class="week-num">第{{ selectedWeek }}周</span>
          <span class="week-date">{{ getWeekRange() }}</span>
        </div>
        <button class="week-nav-btn" :disabled="selectedWeek >= 18" @click="selectedWeek++">›</button>
      </div>
      <div class="week-scroll">
        <button
          v-for="w in weekShortcuts"
          :key="w.value"
          class="week-chip"
          :class="{ active: selectedWeek === w.value }"
          @click="selectedWeek = w.value"
        >
          <span class="chip-week">{{ w.value }}</span>
          <span class="chip-date">{{ w.dateRange }}</span>
        </button>
      </div>
    </div>

    <!-- 筛选行：类型 + 缩放 + 周/学期切换 -->
    <div class="filter-row">
      <div class="type-filter">
        <button
          v-for="t in COURSE_TYPES"
          :key="t.key"
          class="type-chip"
          :class="{ active: typeFilter === t.key }"
          :style="{ '--type-color': t.color }"
          @click="typeFilter = t.key"
        >
          {{ t.label }}
        </button>
      </div>
    </div>
    <div class="control-row">
      <div class="zoom-control">
        <button class="zoom-btn" @click="setFontSize(Math.max(70, fontSize - 10))">A-</button>
        <span class="zoom-label">{{ fontSize }}%</span>
        <button class="zoom-btn" @click="setFontSize(Math.min(200, fontSize + 10))">A+</button>
      </div>
      <button
        class="semester-btn"
        :class="{ active: showSemester }"
        @click="showSemester = !showSemester"
      >
        {{ showSemester ? '→ 切换周课表' : '→ 切换学期课表' }}
      </button>
    </div>

    <!-- 当前模式提示 -->
    <div class="mode-hint">
      <span v-if="showSemester">📚 当前：学期课表（全部课程）</span>
      <span v-else>📅 当前：第{{ selectedWeek }}周课表</span>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="schedule-table-wrapper" :style="{ '--font-scale': fontSize / 100 }">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="period-col"></th>
              <th v-for="wd in weekdayHeaders" :key="wd.key" class="weekday-col" :class="{ weekend: wd.key >= 6 }">
                <div class="weekday-label">{{ wd.short }}</div>
                <div class="weekday-date">{{ showSemester ? '' : getDateText(wd.key) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in TABLE_ROWS" :key="row.period">
              <tr :class="'section-' + row.section">
                <td class="period-cell">
                  <div class="period-num">{{ row.label }}</div>
                </td>
                <template v-for="wd in weekdayHeaders" :key="wd.key">
                  <td
                    v-if="!isCellMerged(wd.key, row.period)"
                    :rowspan="getCourseSpan(getCourse(wd.key, row.period))"
                    class="course-cell"
                    :class="{ 'has-course': getCourse(wd.key, row.period), weekend: wd.key >= 6 }"
                    @click="getCourse(wd.key, row.period) && openCourseDetail(getCourse(wd.key, row.period))"
                  >
                    <div v-if="getCourse(wd.key, row.period)" class="course-card" :style="{ borderLeftColor: getCourse(wd.key, row.period).color }">
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
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <template v-for="[wd, dayCourses] in coursesByDay" :key="wd">
        <div class="list-day">
          <div class="list-day-header">
            <span class="day-name">{{ WEEKDAYS.find(w => w.key === wd)?.label }}</span>
            <span class="day-date">{{ showSemester ? '' : getDateText(wd) }}</span>
          </div>
          <div
            v-for="course in dayCourses"
            :key="course.id"
            class="list-card"
            :style="{ borderLeftColor: course.color }"
            @click="openCourseDetail(course)"
          >
            <div class="list-card-top">
              <div class="list-card-time">
                <div class="list-card-period">第{{ course.startPeriod }}-{{ course.endPeriod }}节</div>
                <div class="list-card-clock">{{ getCourseTimeDetail(course) }}</div>
              </div>
              <div class="list-card-info">
                <div class="list-card-name">{{ course.name }}</div>
                <div class="list-card-location">{{ course.location }}</div>
                <div class="list-card-teacher">{{ course.teacher }}</div>
              </div>
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
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (REQUIRED_COURSES.filter(c => c.arranged).length / REQUIRED_COURSES.length * 100) + '%' }"></div>
          </div>
        </div>

        <div class="course-section">
          <div class="section-title">✅ 已安排课程</div>
          <div class="course-grid">
            <div v-for="course in REQUIRED_COURSES.filter(c => c.arranged)" :key="course.name" class="course-chip arranged">
              <span class="chip-name">{{ course.arrangedName || course.name }}</span>
              <span class="chip-credits">{{ course.credits }}学分</span>
            </div>
          </div>
        </div>

        <div class="course-section warning">
          <div class="section-title">⚠️ 未安排课程</div>
          <div class="course-grid">
            <div v-for="course in unarrangedCourses" :key="course.name" class="course-chip unarranged">
              <span class="chip-name">{{ course.name }}</span>
              <span class="chip-credits">{{ course.credits }}学分</span>
            </div>
          </div>
        </div>

        <div v-if="extraCourses.length" class="course-section extra">
          <div class="section-title">📌 课表额外课程（非评审计分目录）</div>
          <div class="course-grid">
            <div v-for="course in extraCourses" :key="course.name" class="course-chip extra">
              <span class="chip-name">{{ course.name }}</span>
              <span class="chip-credits">{{ course.credits }}学分</span>
            </div>
          </div>
        </div>

        <div class="unarranged-note">
          <div class="note-icon">💡</div>
          <div class="note-content">
            <b>说明</b>：本目录为《计算机与网络空间安全学院研究生学业奖学金评审细则》中的计分课程目录，共9门。课表中可能还包含其他课程（如公共选修课、通识课等），这些课程不计入奖学金评审分数。
            <br><br>
            未安排课程可能因教务系统更新不及时，<b>建议</b>先按8月31日发布的Excel课表去上课。
          </div>
        </div>

        <button class="btn-more" @click="goToGraduatePlan">🎓 查看研究生服务</button>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail" class="overlay" @click.self="closeDetail">
      <div class="detail-modal">
        <div class="detail-header" :style="{ background: selectedCourse?.color }">
          <div class="detail-title">{{ selectedCourse?.name }}</div>
          <button class="detail-close" @click="closeDetail">✕</button>
        </div>
        <div class="detail-body">
          <div class="detail-row">
            <span class="detail-label">课程编号</span>
            <span class="detail-value">{{ selectedCourse?.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">课程类别</span>
            <span class="detail-value">{{ selectedCourse?.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">学分/学时</span>
            <span class="detail-value">{{ selectedCourse?.credits }}学分 / {{ selectedCourse?.hours }}学时</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">上课时间</span>
            <span class="detail-value">{{ WEEKDAYS.find(w => w.key === selectedCourse?.weekday)?.label }} · {{ getCoursePeriodText(selectedCourse) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">具体时间</span>
            <span class="detail-value">{{ getCourseTimeDetail(selectedCourse) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">上课周数</span>
            <span class="detail-value">第{{ selectedCourse?.weeks }}周</span>
          </div>
          <div v-if="getWeekTypeInfo(selectedCourse)" class="detail-row">
            <span class="detail-label">单双周</span>
            <span class="detail-value">{{ getWeekTypeInfo(selectedCourse) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">上课地点</span>
            <span class="detail-value">{{ selectedCourse?.location }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">任课教师</span>
            <span class="detail-value">{{ selectedCourse?.teacher }}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="action-btn" @click="goToClassroomNav">🧭 教室导航</button>
          <button class="action-btn" @click="goToCanteen">🍚 去哪吃</button>
        </div>
        <div class="detail-footer">
          <button class="btn-close" @click="closeDetail">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-view { padding: 0; }

/* 顶部 */
.schedule-header { background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000)); color: #fff; padding: 16px 20px 14px; border-radius: 0 0 16px 16px; margin-bottom: 0; }
.header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.back-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; }
.header-title { font-size: 18px; font-weight: 800; }
.header-right { display: flex; gap: 8px; }
.view-toggle { background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.view-toggle:hover { background: rgba(255,255,255,0.35); border-color: #fff; }
.header-stats { display: flex; justify-content: space-around; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 0; }
.stat-item { text-align: center; }
.stat-value { display: block; font-size: 16px; font-weight: 800; color: #fff; }
.stat-label { font-size: 10px; color: rgba(255,255,255,0.8); }

/* 当日课程提醒卡片 */
.today-card { margin: 14px 12px 0; background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.today-card.has-courses { border-color: var(--primary); box-shadow: 0 2px 8px rgba(21,101,192,0.15); }

/* 下一节课倒计时 */
.next-banner { padding: 12px 14px; background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 75%, #000)); color: #fff; }
.next-banner.no-class { background: var(--soft-fg); color: var(--text-sub); }
.next-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.next-badge { font-size: 13px; font-weight: 700; }
.next-countdown { font-size: 14px; font-weight: 800; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 999px; }
.next-countdown.ongoing { background: #22c55e; }
.next-info { display: flex; flex-direction: column; gap: 2px; }
.next-name { font-size: 15px; font-weight: 700; }
.next-meta { font-size: 12px; opacity: 0.85; }

/* 今日课程列表标题 */
.today-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--soft-fg); border-top: 1px solid var(--border); }
.today-card.has-courses .today-header { background: var(--primary-soft); }
.today-badge { font-weight: 700; font-size: 13px; color: var(--text); }
.today-card.has-courses .today-badge { color: var(--primary); }
.today-date { font-size: 12px; color: var(--text-sub); }
.today-list { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 6px; }
.today-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--primary); border-radius: 8px; cursor: pointer; transition: all .15s; }
.today-item:hover { border-color: var(--primary); background: var(--primary-soft); }
.today-time { font-size: 11px; font-weight: 700; color: var(--primary); min-width: 50px; text-align: center; }
.today-info { flex: 1; min-width: 0; }
.today-name { font-size: 13px; font-weight: 700; color: var(--text); }
.today-meta { font-size: 11px; color: var(--text-sub); margin-top: 2px; }
.today-arrow { font-size: 16px; color: var(--text-sub); }

/* 搜索框 */
.search-bar { padding: 10px 12px 0; }
.search-input { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--card); color: var(--text); font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: var(--primary); }

/* 周次选择器 */
.week-selector { padding: 0 12px; margin-top: 10px; margin-bottom: 8px; }
.week-nav { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; }
.week-nav-btn { width: 32px; height: 32px; border: none; border-radius: 50%; background: var(--soft-fg); color: var(--text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.week-nav-btn:hover:not(:disabled) { background: var(--primary); color: #fff; }
.week-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.week-current { text-align: center; }
.week-num { font-size: 16px; font-weight: 800; color: var(--primary); display: block; }
.week-date { font-size: 11px; color: var(--text-sub); }
.week-scroll { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; -webkit-overflow-scrolling: touch; }
.week-scroll::-webkit-scrollbar { height: 4px; }
.week-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
.week-chip { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); cursor: pointer; transition: all .15s; min-width: 50px; }
.week-chip:hover { border-color: var(--primary); }
.week-chip.active { background: var(--primary); border-color: var(--primary); }
.chip-week { font-size: 14px; font-weight: 700; color: var(--text); }
.week-chip.active .chip-week { color: #fff; }
.chip-date { font-size: 9px; color: var(--text-sub); }
.week-chip.active .chip-date { color: rgba(255,255,255,0.8); }

/* 筛选行 */
.filter-row { display: flex; gap: 6px; padding: 0 12px; margin-bottom: 6px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.type-chip { flex-shrink: 0; padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); color: var(--text); font-size: 12px; cursor: pointer; transition: all .15s; }
.type-chip:hover { border-color: var(--type-color, var(--primary)); }
.type-chip.active { background: var(--type-color, var(--primary)); border-color: var(--type-color, var(--primary)); color: #fff; }

/* 控制行：缩放 + 周/学期切换 */
.control-row { display: flex; gap: 8px; padding: 0 12px; margin-bottom: 6px; align-items: center; }
.zoom-control { display: flex; align-items: center; gap: 4px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; }
.zoom-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: var(--soft-fg); color: var(--text); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.zoom-btn:hover { background: var(--primary); color: #fff; }
.zoom-label { font-size: 11px; font-weight: 600; color: var(--text-sub); min-width: 36px; text-align: center; }
.semester-btn { flex: 1; padding: 8px 12px; border: 2px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text); font-size: 12px; cursor: pointer; transition: all .15s; font-weight: 700; text-align: center; }
.semester-btn:hover { border-color: #6a1b9a; }
.semester-btn.active { background: #6a1b9a; border-color: #6a1b9a; color: #fff; }

/* 当前模式提示 */
.mode-hint { padding: 6px 12px; margin: 0 12px 8px; font-size: 12px; color: var(--primary); font-weight: 600; background: var(--primary-soft); border-radius: 8px; text-align: center; }

/* 表格视图 */
.grid-view { padding: 0; }
.schedule-table-wrapper { --font-scale: 1; }
.schedule-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.schedule-table th, .schedule-table td { border: 1px solid var(--border); padding: 0; }

.period-col { width: 26px; background: var(--soft-fg); }
.weekday-col { background: var(--soft-fg); font-weight: 700; }
.weekday-col.weekend { background: #f5f5f5; width: 48px; }
.weekday-label { padding: 6px 0 0; font-size: 12px; font-weight: 700; }
.weekday-date { padding: 0 0 4px; font-size: 9px; color: var(--text-sub); }

.period-cell { background: var(--soft-fg); text-align: center; padding: 4px 0; vertical-align: middle; }
.period-num { font-weight: 800; font-size: 13px; color: var(--primary); }

.section-morning .period-cell { border-top: 2px solid #1565c0; }
.section-afternoon .period-cell { border-top: 2px solid #e65100; }
.section-evening .period-cell { border-top: 2px solid #6a1b9a; }

.course-cell { padding: 2px; height: 46px; vertical-align: middle; cursor: default; }
.course-cell.weekend { background: #fafafa; }
.course-cell.has-course { cursor: pointer; }
.course-cell.has-course:hover { background: var(--primary-soft); }

.course-card { background: var(--card); border-left: 3px solid; border-radius: 4px; padding: 4px 6px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.course-name { font-weight: 700; font-size: 11px; line-height: 1.3; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.course-info { display: flex; flex-direction: column; gap: 0; }
.course-location, .course-teacher, .course-weeks { font-size: 9px; color: var(--text-sub); line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-weeks { color: var(--primary); font-weight: 600; }

/* 列表视图 */
.list-view { padding: 0 12px; display: flex; flex-direction: column; gap: 16px; }
.list-day { display: flex; flex-direction: column; gap: 10px; }
.list-day-header { display: flex; align-items: baseline; gap: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--primary); }
.day-name { font-size: 16px; font-weight: 800; color: var(--primary); }
.day-date { font-size: 12px; color: var(--text-sub); }
.list-card { background: var(--card); border: 1px solid var(--border); border-left: 4px solid; border-radius: 10px; padding: 12px; cursor: pointer; transition: all .15s; }
.list-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
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
.empty-state { text-align: center; padding: 40px 0; color: var(--text-sub); font-size: 14px; }

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
.action-btn { flex: 1; padding: 10px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.action-btn:hover { background: var(--primary-soft); border-color: var(--primary); color: var(--primary); }
.detail-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
.btn-close { width: 100%; padding: 12px; border: none; border-radius: 8px; background: var(--soft-fg); color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-close:hover { background: var(--border); }

/* 手机端 */
@media (max-width: 640px) {
  .schedule-header { border-radius: 0; margin: -16px -16px 0; padding: 12px 16px 14px; }
  .header-title { font-size: 16px; }
  .stat-value { font-size: 14px; color: #fff; }
  .today-card { margin: 14px 8px 14px; }
  .next-banner { padding: 10px 12px; }
  .next-name { font-size: 14px; }
  .next-meta { font-size: 11px; }
  .search-bar { padding: 0 8px; margin-bottom: 4px; }
  .week-selector, .filter-row, .control-row { padding: 0 8px; }
  .mode-hint { margin: 0 8px 8px; font-size: 11px; }
  .grid-view { padding: 0; overflow: hidden; }
  .schedule-table-wrapper { --font-scale: v-bind(fontSize / 100); }
  .period-col { width: 24px; }
  .period-num { font-size: 12px; }
  .weekday-col.weekend { width: 42px; }
  .weekday-label { font-size: 11px; padding: 5px 0 0; }
  .weekday-date { font-size: 8px; }
  .course-cell { height: 40px; }
  .course-name { font-size: 10px; }
  .course-location, .course-teacher { font-size: 8px; }
  .list-view { padding: 0 8px; }
  .unarranged-panel { margin: 12px 0; border-radius: 0; border-left: none; border-right: none; }
  .week-chip { min-width: 45px; padding: 5px 8px; }
  .chip-week { font-size: 13px; }
  .chip-date { font-size: 8px; }
  .filter-row { flex-wrap: nowrap; }
  .control-row { flex-wrap: wrap; }
  .semester-btn { flex: none; width: 100%; }
}
</style>
