<script setup>
/**
 * 课程表视图 v4
 * - 周次选择器（1-20周），显示对应日期
 * - 课程类型筛选
 * - 表格视图按周显示，周几下面显示具体日期
 * - 列表视图按天分组
 * - 预览全部课表
 */
import { ref, computed, onMounted } from 'vue'
import {
  WEEKDAYS, TABLE_ROWS, SINGLE_PERIOD_TIMES,
  COURSES, REQUIRED_COURSES, COURSE_TYPES,
  getCurrentWeek, isCourseInWeek,
  getCourseAtRow, getCourseRowSpan, isMergedCell,
  formatWeekdayType, getCourseTimeDetail, getCoursePeriodText,
  getDateInWeek, formatDateShort, getWeekDateRange,
  getArrangedCredits, getTotalCredits, getUnarrangedCourses,
} from '../data/classSchedule'

const emit = defineEmits(['open', 'back'])

const selectedWeek = ref(getCurrentWeek())
const selectedCourse = ref(null)
const showDetail = ref(false)
const viewMode = ref('grid') // 'grid' | 'list'
const showUnarranged = ref(false)
const typeFilter = ref('all')
const showAllWeeks = ref(false)

const weekdayHeaders = computed(() => WEEKDAYS.filter(w => w.key <= 5))

// 当前周显示的课程
const displayCourses = computed(() => {
  if (showAllWeeks.value) {
    // 预览全部：显示所有课程
    let courses = COURSES
    if (typeFilter.value !== 'all') {
      courses = courses.filter(c => c.category === typeFilter.value)
    }
    return courses
  }
  let courses = COURSES.filter(c => isCourseInWeek(c, selectedWeek.value))
  if (typeFilter.value !== 'all') {
    courses = courses.filter(c => c.category === typeFilter.value)
  }
  return courses
})

// 按天分组的课程（列表视图用）
const coursesByDay = computed(() => {
  const map = new Map()
  for (let wd = 1; wd <= 5; wd++) {
    const dayCourses = displayCourses.value.filter(c => c.weekday === wd)
    if (dayCourses.length) map.set(wd, dayCourses)
  }
  return [...map.entries()]
})

const totalCredits = computed(() => getArrangedCredits())
const allCredits = computed(() => getTotalCredits())
const unarrangedCourses = computed(() => getUnarrangedCourses())

// 获取指定周几的日期
function getDate(weekday) {
  return getDateInWeek(selectedWeek.value, weekday)
}

// 获取日期文本
function getDateText(weekday) {
  const date = getDate(weekday)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 获取周次日期范围
function getWeekRange() {
  return getWeekDateRange(selectedWeek.value)
}

function getCourse(weekday, rowStart) {
  return getCourseAtRow(weekday, rowStart)
}

function getCourseSpan(course) {
  return getCourseRowSpan(course)
}

function isCellMerged(weekday, rowStart) {
  return isMergedCell(weekday, rowStart)
}

function openCourseDetail(course) {
  selectedCourse.value = course
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedCourse.value = null
}

function goToClassroomNav() {
  emit('open', 'classroomNav')
}

function goToCanteen() {
  emit('open', 'canteen')
}

function goToGraduatePlan() {
  emit('open', 'graduatePlan')
}

function getWeekTypeInfo(course) {
  return formatWeekdayType(course.weekdayType)
}

// 周次快捷选择
const weekShortcuts = computed(() => {
  const weeks = []
  for (let i = 1; i <= 20; i++) {
    weeks.push({
      value: i,
      label: `${i}`,
      dateRange: getWeekDateRange(i),
    })
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
        <button class="view-toggle" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
          {{ viewMode === 'grid' ? '📋 列表' : '📊 表格' }}
        </button>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">第{{ selectedWeek }}周</span>
          <span class="stat-label">{{ getWeekRange() }}</span>
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

    <!-- 周次选择器 -->
    <div class="week-selector">
      <div class="week-nav">
        <button class="week-nav-btn" :disabled="selectedWeek <= 1" @click="selectedWeek--">‹</button>
        <div class="week-current">
          <span class="week-num">第{{ selectedWeek }}周</span>
          <span class="week-date">{{ getWeekRange() }}</span>
        </div>
        <button class="week-nav-btn" :disabled="selectedWeek >= 20" @click="selectedWeek++">›</button>
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

    <!-- 课程类型筛选 -->
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
      <button
        class="type-chip preview-btn"
        :class="{ active: showAllWeeks }"
        @click="showAllWeeks = !showAllWeeks"
      >
        {{ showAllWeeks ? '📅 返回当前周' : '👁️ 预览全部' }}
      </button>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="schedule-table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="period-col">节次</th>
              <th v-for="wd in weekdayHeaders" :key="wd.key" class="weekday-col">
                <div class="weekday-label">{{ wd.short }}</div>
                <div class="weekday-date">{{ getDateText(wd.key) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in TABLE_ROWS" :key="row.label">
              <td class="period-cell">
                <div class="period-label">{{ row.label }}</div>
                <div class="period-time">{{ row.time }}</div>
              </td>
              <template v-for="wd in weekdayHeaders" :key="wd.key">
                <td
                  v-if="!isCellMerged(wd.key, row.periods[0])"
                  :rowspan="getCourseSpan(getCourse(wd.key, row.periods[0]))"
                  class="course-cell"
                  :class="{ 'has-course': getCourse(wd.key, row.periods[0]) }"
                  @click="getCourse(wd.key, row.periods[0]) && openCourseDetail(getCourse(wd.key, row.periods[0]))"
                >
                  <div v-if="getCourse(wd.key, row.periods[0])" class="course-card" :style="{ borderLeftColor: getCourse(wd.key, row.periods[0]).color }">
                    <div class="course-name">{{ getCourse(wd.key, row.periods[0]).name }}</div>
                    <div class="course-meta">
                      <span class="course-location">{{ getCourse(wd.key, row.periods[0]).location }}</span>
                      <span class="course-teacher">{{ getCourse(wd.key, row.periods[0]).teacher }}</span>
                    </div>
                    <div class="course-weeks">第{{ getCourse(wd.key, row.periods[0]).weeks }}周</div>
                  </div>
                </td>
              </template>
            </tr>
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
            <span class="day-date">{{ getDateText(wd) }}</span>
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
                <div class="list-card-period">{{ course.period }}节</div>
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
      <div v-if="!coursesByDay.length" class="empty-state">本周暂无课程</div>
    </div>

    <!-- 未安排课程提示 -->
    <div class="unarranged-panel" :class="{ 'has-warning': unarrangedCourses.length > 0 }">
      <div class="panel-header" @click="showUnarranged = !showUnarranged">
        <div class="panel-title-row">
          <span class="panel-icon">📋</span>
          <span class="panel-title">培养方案课程对比</span>
          <span v-if="unarrangedCourses.length" class="panel-badge">{{ unarrangedCourses.length }}门未安排</span>
        </div>
        <span class="panel-arrow">{{ showUnarranged ? '▾' : '▸' }}</span>
      </div>
      <div v-show="showUnarranged" class="panel-body">
        <div class="progress-section">
          <div class="progress-info">
            <span>已完成 <b>{{ displayCourses.length }}</b>/{{ REQUIRED_COURSES.length }} 门</span>
            <span><b>{{ totalCredits }}</b>/{{ allCredits }} 学分</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (displayCourses.length / REQUIRED_COURSES.length * 100) + '%' }"></div>
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

        <div class="unarranged-note">
          <div class="note-icon">💡</div>
          <div class="note-content">
            <b>说明</b>：以上未安排课程尚未在教务系统中显示上课时间，可能是因为官网系统更新不及时。
            <b>建议</b>：先按8月31日发布的Excel课表去上课，后续教务系统会陆续更新选修课、公共必修课（政治课）等课程安排。
          </div>
        </div>

        <button class="btn-more" @click="goToGraduatePlan">🎓 查看研究生服务</button>
      </div>
    </div>

    <!-- 课程详情弹窗 -->
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
.schedule-view {
  padding: 0;
}

/* 顶部信息栏 */
.schedule-header {
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000));
  color: #fff;
  padding: 16px 20px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 12px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 800;
}

.view-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.header-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

/* 周次选择器 */
.week-selector {
  padding: 0 12px;
  margin-bottom: 12px;
}

.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.week-nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--soft-fg);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.week-nav-btn:hover:not(:disabled) {
  background: var(--primary);
  color: #fff;
}

.week-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.week-current {
  text-align: center;
}

.week-num {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
  display: block;
}

.week-date {
  font-size: 11px;
  color: var(--text-sub);
}

.week-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
}

.week-scroll::-webkit-scrollbar {
  height: 4px;
}

.week-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 999px;
}

.week-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 50px;
}

.week-chip:hover {
  border-color: var(--primary);
}

.week-chip.active {
  background: var(--primary);
  border-color: var(--primary);
}

.chip-week {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.week-chip.active .chip-week {
  color: #fff;
}

.chip-date {
  font-size: 9px;
  color: var(--text-sub);
}

.week-chip.active .chip-date {
  color: rgba(255, 255, 255, 0.8);
}

/* 课程类型筛选 */
.type-filter {
  display: flex;
  gap: 6px;
  padding: 0 12px;
  margin-bottom: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.type-chip {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.type-chip:hover {
  border-color: var(--type-color, var(--primary));
}

.type-chip.active {
  background: var(--type-color, var(--primary));
  border-color: var(--type-color, var(--primary));
  color: #fff;
}

.preview-btn {
  --type-color: #6a1b9a;
}

/* 表格视图 */
.grid-view {
  padding: 0 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.schedule-table-wrapper {
  min-width: 540px;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid var(--border);
  padding: 0;
}

.period-col {
  width: 60px;
  background: var(--soft-fg);
  font-weight: 700;
}

.weekday-col {
  background: var(--soft-fg);
  font-weight: 700;
}

.weekday-label {
  padding: 8px 4px 2px;
  font-size: 14px;
}

.weekday-date {
  padding: 0 4px 6px;
  font-size: 10px;
  color: var(--text-sub);
  font-weight: 400;
}

.period-cell {
  background: var(--soft-fg);
  text-align: center;
  padding: 8px 4px;
  vertical-align: middle;
}

.period-label {
  font-weight: 800;
  font-size: 13px;
  color: var(--primary);
}

.period-time {
  font-size: 9px;
  color: var(--text-sub);
  margin-top: 2px;
}

.course-cell {
  padding: 4px;
  height: 80px;
  vertical-align: middle;
  cursor: default;
}

.course-cell.has-course {
  cursor: pointer;
  transition: background 0.15s;
}

.course-cell.has-course:hover {
  background: var(--primary-soft);
}

.course-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 3px solid;
  border-radius: 6px;
  padding: 6px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-name {
  font-weight: 700;
  font-size: 11px;
  line-height: 1.3;
  color: var(--text);
  margin-bottom: 2px;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.course-location,
.course-teacher {
  font-size: 9px;
  color: var(--text-sub);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-weeks {
  font-size: 8px;
  color: var(--primary);
  margin-top: 2px;
}

/* 列表视图 */
.list-view {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-day {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-day-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--primary);
}

.day-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
}

.day-date {
  font-size: 12px;
  color: var(--text-sub);
}

.list-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 4px solid;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.list-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover);
}

.list-card-top {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.list-card-time {
  background: var(--primary-soft);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
  min-width: 70px;
}

.list-card-period {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
}

.list-card-clock {
  font-size: 10px;
  color: var(--text-sub);
  margin-top: 2px;
}

.list-card-info {
  flex: 1;
  min-width: 0;
}

.list-card-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.list-card-location,
.list-card-teacher {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.4;
}

.list-card-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.list-card-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
}

.list-card-weeks,
.list-card-type,
.list-card-credits {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--soft-fg);
  color: var(--text-sub);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--text-sub);
  font-size: 14px;
}

/* 未安排课程面板 */
.unarranged-panel {
  margin: 16px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.unarranged-panel.has-warning {
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--soft-fg);
}

.unarranged-panel.has-warning .panel-header {
  background: #fffbeb;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  font-size: 16px;
}

.panel-title {
  font-weight: 700;
  font-size: 14px;
}

.panel-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f59e0b;
  color: #fff;
  font-weight: 600;
}

.panel-arrow {
  font-size: 12px;
  color: var(--text-sub);
}

.panel-body {
  padding: 16px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
  transition: width 0.3s ease;
}

.course-section {
  margin-bottom: 16px;
}

.course-section.warning {
  background: #fffbeb;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fbbf24;
}

.section-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text);
}

.course-section.warning .section-title {
  color: #b45309;
}

.course-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.course-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.course-chip.arranged {
  background: #dcfce7;
  border: 1px solid #86efac;
}

.course-chip.arranged .chip-name {
  color: #166534;
  font-weight: 600;
}

.course-chip.unarranged {
  background: #fef3c7;
  border: 1px solid #fbbf24;
}

.course-chip.unarranged .chip-name {
  color: #92400e;
  font-weight: 600;
}

.chip-credits {
  font-size: 10px;
  color: var(--text-sub);
}

.unarranged-note {
  display: flex;
  gap: 10px;
  background: var(--soft-fg);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.note-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.note-content {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.6;
}

.btn-more {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-more:hover {
  background: color-mix(in srgb, var(--primary) 80%, #000);
}

/* 详情弹窗 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.detail-modal {
  background: var(--card);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-header {
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 18px;
  font-weight: 800;
  flex: 1;
}

.detail-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}

.detail-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 80px;
  font-size: 13px;
  color: var(--text-sub);
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.detail-actions {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  background: var(--soft-fg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
  color: var(--primary);
}

.detail-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-close {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--soft-fg);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-close:hover {
  background: var(--border);
}

/* 手机端适配 */
@media (max-width: 640px) {
  .schedule-header {
    border-radius: 0;
    margin: -16px -16px 12px;
    padding: 12px 16px;
  }

  .header-title {
    font-size: 16px;
  }

  .stat-value {
    font-size: 14px;
    color: #fff;
  }

  .week-selector {
    padding: 0 8px;
  }

  .type-filter {
    padding: 0 8px;
  }

  .grid-view {
    padding: 0 8px;
  }

  .schedule-table-wrapper {
    min-width: 480px;
  }

  .course-cell {
    height: 70px;
    padding: 3px;
  }

  .course-name {
    font-size: 10px;
  }

  .course-location,
  .course-teacher {
    font-size: 8px;
  }

  .course-weeks {
    font-size: 7px;
  }

  .list-view {
    padding: 0 8px;
  }

  .unarranged-panel {
    margin: 16px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .week-chip {
    min-width: 45px;
    padding: 5px 8px;
  }

  .chip-week {
    font-size: 13px;
  }

  .chip-date {
    font-size: 8px;
  }
}
</style>
