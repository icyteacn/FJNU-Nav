<script setup>
/**
 * 课程表视图 v2
 * 参考 NFS 课表设计，优化手机端显示
 * - 手机端7天均分一屏，无需横滑
 * - 行高压缩，一屏显示全部课程
 * - 课程卡片显示关键信息
 * - 未安排课程提示
 * - 与研究生服务联动
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  WEEKDAYS, ALL_PERIODS, PERIOD_TIMES, PERIOD_GROUP_TIMES, PERIOD_GROUPS,
  COURSES, REQUIRED_COURSES,
  getWeekView, getCurrentWeek, isCourseInWeek, getAllCourses,
  getUnarrangedCourses, getArrangedCredits, getTotalCredits,
} from '../data/classSchedule'

const emit = defineEmits(['open', 'back'])

const currentWeek = ref(getCurrentWeek())
const weekView = ref(getWeekView())
const selectedCourse = ref(null)
const showDetail = ref(false)
const viewMode = ref('grid') // 'grid' | 'list'
const showUnarranged = ref(false)

const weekdayHeaders = computed(() => WEEKDAYS.filter(w => w.key <= 5))

const weekCourses = computed(() => {
  const courses = getAllCourses()
  return courses.filter(c => isCourseInWeek(c, currentWeek.value))
})

const totalCredits = computed(() => getArrangedCredits())
const allCredits = computed(() => getTotalCredits())
const unarrangedCourses = computed(() => getUnarrangedCourses())

function getCourse(weekday, period) {
  const view = weekView.value
  if (!view[weekday]) return null
  if (view[weekday][period]) return view[weekday][period]
  const courses = COURSES.filter(c => c.weekday === weekday && isCourseInWeek(c, currentWeek.value))
  for (const c of courses) {
    const [start, end] = c.period.split('-').map(Number)
    const periodStart = parseInt(period.split('-')[0])
    const periodEnd = parseInt(period.split('-')[1])
    if (periodStart >= start && periodEnd <= end) return c
  }
  return null
}

function getPeriodTime(period) {
  const [start] = period.split('-').map(Number)
  const [startTime] = PERIOD_TIMES[start]?.split('-') || ['']
  const [, endStr] = PERIOD_TIMES[start + 1]?.split('-') || ['', '']
  return `${startTime}-${endStr}`
}

function getCourseSpan(course) {
  if (!course) return 1
  const [start, end] = course.period.split('-').map(Number)
  return Math.ceil((end - start + 1) / 2)
}

function isMergedCell(weekday, period) {
  const courses = COURSES.filter(c => c.weekday === weekday && isCourseInWeek(c, currentWeek.value))
  for (const c of courses) {
    const [start, end] = c.period.split('-').map(Number)
    const periodStart = parseInt(period.split('-')[0])
    if (periodStart > start && periodStart <= end) return true
  }
  return false
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
  if (selectedCourse.value) {
    emit('open', 'classroomNav')
  }
}

function goToCanteen() {
  emit('open', 'canteen')
}

function goToGraduatePlan() {
  emit('open', 'graduatePlan')
}

onMounted(() => {
  currentWeek.value = getCurrentWeek()
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
          <span class="stat-value">{{ currentWeek }}</span>
          <span class="stat-label">教学周</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ weekCourses.length }}</span>
          <span class="stat-label">已安排</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCredits }}/{{ allCredits }}</span>
          <span class="stat-label">学分</span>
        </div>
      </div>
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
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="period in ALL_PERIODS" :key="period">
              <tr v-if="!isMergedCell(1, period)">
                <td class="period-cell">
                  <div class="period-number">{{ period.split('-')[0] }}</div>
                  <div class="period-time">{{ getPeriodTime(period) }}</div>
                </td>
                <template v-for="wd in weekdayHeaders" :key="wd.key">
                  <td
                    v-if="!isMergedCell(wd.key, period)"
                    :rowspan="getCourseSpan(getCourse(wd.key, period))"
                    class="course-cell"
                    :class="{ 'has-course': getCourse(wd.key, period) }"
                    @click="getCourse(wd.key, period) && openCourseDetail(getCourse(wd.key, period))"
                  >
                    <div v-if="getCourse(wd.key, period)" class="course-card" :style="{ borderLeftColor: getCourse(wd.key, period).color }">
                      <div class="course-name">{{ getCourse(wd.key, period).name }}</div>
                      <div class="course-location">{{ getCourse(wd.key, period).location }}</div>
                      <div class="course-teacher">{{ getCourse(wd.key, period).teacher }}</div>
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
      <div v-for="course in weekCourses" :key="course.id" class="list-card" :style="{ borderLeftColor: course.color }" @click="openCourseDetail(course)">
        <div class="list-header">
          <div class="list-name">{{ course.name }}</div>
          <div class="list-badge" :style="{ background: course.color }">{{ course.category }}</div>
        </div>
        <div class="list-info">
          <div class="info-row">
            <span class="info-icon">📅</span>
            <span>{{ WEEKDAYS.find(w => w.key === course.weekday)?.label }} · 第{{ course.period }}节</span>
          </div>
          <div class="info-row">
            <span class="info-icon">🕐</span>
            <span>{{ PERIOD_GROUP_TIMES[course.period] || course.period }}</span>
          </div>
          <div class="info-row">
            <span class="info-icon">📍</span>
            <span>{{ course.location }}</span>
          </div>
          <div class="info-row">
            <span class="info-icon">👤</span>
            <span>{{ course.teacher }}</span>
          </div>
        </div>
        <div class="list-footer">
          <span class="credits-badge">{{ course.credits }}学分</span>
          <span class="weeks-badge">教学周 {{ course.weeks }}</span>
        </div>
      </div>
    </div>

    <!-- 未安排课程提示 -->
    <div class="unarranged-panel">
      <div class="panel-header" @click="showUnarranged = !showUnarranged">
        <span class="panel-title">📋 培养方案课程对比</span>
        <span class="panel-arrow">{{ showUnarranged ? '▾' : '▸' }}</span>
      </div>
      <div v-show="showUnarranged" class="panel-body">
        <div class="arranged-info">
          <span>已安排 <b>{{ weekCourses.length }}</b> 门课程（<b>{{ totalCredits }}</b>学分）</span>
          <span>共需 <b>{{ allCredits }}</b> 学分</span>
        </div>
        <div class="unarranged-list">
          <div class="unarranged-header">⚠️ 以下课程尚未安排上课时间：</div>
          <div v-for="course in unarrangedCourses" :key="course.name" class="unarranged-item">
            <span class="unarranged-name">{{ course.name }}</span>
            <span class="unarranged-credits">{{ course.credits }}学分</span>
          </div>
        </div>
        <div class="unarranged-note">
          <div class="note-title">💡 说明</div>
          <div class="note-content">
            以上课程尚未在教务系统中显示上课时间，可能是因为官网系统更新不及时。
            <br><br>
            <b>建议</b>：先按8月31日发布的Excel课表去上课，后续教务系统会陆续更新选修课、公共必修课（政治课）等课程安排。
            <br><br>
            如有疑问，请咨询研究生院或辅导员。
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
            <span class="detail-value">{{ WEEKDAYS.find(w => w.key === selectedCourse?.weekday)?.label }} · 第{{ selectedCourse?.period }}节</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">具体时间</span>
            <span class="detail-value">{{ PERIOD_GROUP_TIMES[selectedCourse?.period] }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">上课周数</span>
            <span class="detail-value">第{{ selectedCourse?.weeks }}周</span>
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

.schedule-header {
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000));
  color: #fff;
  padding: 16px 20px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 16px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  padding: 12px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
}

/* 表格视图 */
.grid-view {
  padding: 0 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.schedule-table-wrapper {
  min-width: 580px;
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
  padding: 10px 4px;
}

.period-cell {
  background: var(--soft-fg);
  text-align: center;
  padding: 8px 4px;
  vertical-align: middle;
}

.period-number {
  font-weight: 800;
  font-size: 14px;
  color: var(--primary);
}

.period-time {
  font-size: 9px;
  color: var(--text-sub);
  margin-top: 2px;
}

.course-cell {
  padding: 6px;
  height: 70px;
  vertical-align: middle;
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
  border-radius: 8px;
  padding: 6px;
  height: 100%;
  box-sizing: border-box;
}

.course-name {
  font-weight: 700;
  font-size: 11px;
  line-height: 1.3;
  margin-bottom: 2px;
  color: var(--text);
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

/* 列表视图 */
.list-view {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 4px solid;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.list-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.list-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  flex: 1;
}

.list-badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
}

.list-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-sub);
}

.info-icon {
  font-size: 14px;
}

.list-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.credits-badge,
.weeks-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--soft-fg);
  color: var(--text-sub);
  font-weight: 600;
}

/* 未安排课程面板 */
.unarranged-panel {
  margin: 16px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--soft-fg);
}

.panel-title {
  font-weight: 700;
  font-size: 14px;
}

.panel-arrow {
  font-size: 12px;
  color: var(--text-sub);
}

.panel-body {
  padding: 16px;
}

.arranged-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border);
}

.unarranged-list {
  margin-bottom: 16px;
}

.unarranged-header {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 10px;
  color: #e65100;
}

.unarranged-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.unarranged-name {
  color: #92400e;
  font-weight: 600;
}

.unarranged-credits {
  color: #b45309;
  font-size: 12px;
}

.unarranged-note {
  background: var(--soft-fg);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.note-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
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
    margin: -16px -16px 16px;
    padding: 16px;
  }

  .header-title {
    font-size: 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .list-view {
    padding: 0 0 16px;
  }

  .list-card {
    border-radius: 0;
    border-left: none;
    border-left-width: 4px;
    border-left-style: solid;
  }

  .course-cell {
    height: 60px;
    padding: 4px;
  }

  .course-name {
    font-size: 10px;
  }

  .course-location,
  .course-teacher {
    font-size: 8px;
  }

  .unarranged-panel {
    margin: 16px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>
