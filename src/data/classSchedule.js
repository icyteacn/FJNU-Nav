/**
 * 课程表数据 v3
 * 结构：周几 → 节次 → 课程信息
 * 用于日程助手的课表日程 tab
 */

/** 单节课时间映射（每节45分钟） */
export const SINGLE_PERIOD_TIMES = {
  1: '08:20-09:05',
  2: '09:15-10:00',
  3: '10:20-11:05',
  4: '11:15-12:00',
  5: '14:00-14:45',
  6: '14:55-15:40',
  7: '15:50-16:35',
  8: '16:45-17:30',
  9: '18:30-19:15',
  10: '19:25-20:10',
  11: '20:20-21:05',
  12: '21:15-22:00',
}

/** 节次组时间映射（用于表格显示） */
export const PERIOD_GROUP_TIMES = {
  '1-2': '08:20-10:00',
  '3-4': '10:20-12:00',
  '5-6': '14:00-15:40',
  '7-8': '15:50-17:30',
  '9-10': '18:30-20:10',
  '11-12': '20:20-22:00',
}

/** 星期映射 */
export const WEEKDAYS = [
  { key: 1, label: '周一', short: '一' },
  { key: 2, label: '周二', short: '二' },
  { key: 3, label: '周三', short: '三' },
  { key: 4, label: '周四', short: '四' },
  { key: 5, label: '周五', short: '五' },
  { key: 6, label: '周六', short: '六' },
  { key: 7, label: '周日', short: '日' },
]

/** 表格行：每2节为一行 */
export const TABLE_ROWS = [
  { label: '1-2', periods: [1, 2], time: '08:20-10:00' },
  { label: '3-4', periods: [3, 4], time: '10:20-12:00' },
  { label: '5-6', periods: [5, 6], time: '14:00-15:40' },
  { label: '7-8', periods: [7, 8], time: '15:50-17:30' },
  { label: '9-10', periods: [9, 10], time: '18:30-20:10' },
  { label: '11-12', periods: [11, 12], time: '20:20-22:00' },
]

/**
 * 课程表数据
 * 每个课程包含：
 * - name: 课程名称
 * - id: 课程编号
 * - teacher: 任课教师
 * - location: 上课地点
 * - weeks: 上课周数（如 '3-14'）
 * - weekdayType: 单双周类型（'all' | 'odd' | 'even'）
 * - period: 起止节次（如 '9-12' 表示9到12节）
 * - weekday: 星期几（1-7）
 * - credits: 学分
 * - hours: 学时
 * - category: 课程类别
 * - color: 显示颜色
 */
export const COURSES = [
  // 周一 1-2节（研究生英语B）
  {
    name: '研究生英语B',
    id: 'ENG-B-001',
    teacher: '蒋宏影',
    location: '笃行1-218',
    weeks: '3-18',
    weekdayType: 'all',
    period: '1-2',
    weekday: 1,
    credits: 2,
    hours: 32,
    category: '公共必修课',
    color: '#c62828',
  },
  // 周二 5-6节（当代科技）
  {
    name: '当代科技',
    id: 'TECH-001',
    teacher: '黄正华',
    location: '知明2-202',
    weeks: '3-10',
    weekdayType: 'all',
    period: '5-6',
    weekday: 2,
    credits: 2,
    hours: 32,
    category: '公共选修课',
    color: '#ad1457',
  },
  // 周二 9-10节（人工智能通识课）
  {
    name: '人工智能通识课',
    id: 'ZSZX027085410049',
    teacher: '黄培凯、林燊',
    location: '笃行1-113',
    weeks: '3-10',
    weekdayType: 'all',
    period: '9-10',
    weekday: 2,
    credits: 2,
    hours: 32,
    category: '专业必修课',
    color: '#e65100',
  },
  // 周四 5-6节（机器学习）
  {
    name: '机器学习',
    id: 'XZB0270812104',
    teacher: '陈丽萍',
    location: '笃行1-321A',
    weeks: '3-14',
    weekdayType: 'all',
    period: '5-6',
    weekday: 4,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#00695c',
  },
  // 周五 5-6节（高级算法设计与分析）
  {
    name: '高级算法设计与分析',
    id: 'XZB0270812103',
    teacher: '张筱辰',
    location: '计网楼406',
    weeks: '3-14',
    weekdayType: 'all',
    period: '5-6',
    weekday: 5,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#6a1b9a',
  },
  // 周五 9-12节（高等工程数学 - 4节课）
  {
    name: '高等工程数学',
    id: 'XZB0270812102',
    teacher: '林劼、胡丽莹',
    location: '笃行1-201',
    weeks: '3-14',
    weekdayType: 'all',
    period: '9-12',
    weekday: 5,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#1565c0',
  },
]

/**
 * 培养方案课程列表（完整）
 * 用于对比已安排/未安排课程
 */
export const REQUIRED_COURSES = [
  // 公共必修课
  { name: '新时代中国特色社会主义理论与实践研究', credits: 2, category: '公共必修课', arranged: false },
  { name: '自然辩证法概论', credits: 1, category: '公共必修课', arranged: false },
  { name: '硕士生第一外国语', credits: 4, category: '公共必修课', arranged: true, arrangedName: '研究生英语B' },
  { name: '科研伦理与学术规范', credits: 1, category: '公共必修课', arranged: false },
  // 专业必修课
  { name: '实验室安全知识', credits: 1, category: '专业必修课', arranged: false },
  { name: '学术论文写作', credits: 2, category: '专业必修课', arranged: false },
  { name: '高等工程数学', credits: 3, category: '专业必修课', arranged: true },
  { name: '高级算法设计与分析', credits: 3, category: '专业必修课', arranged: true },
  { name: '机器学习', credits: 3, category: '专业必修课', arranged: true },
]

/**
 * 获取指定周几的课程
 * @param {number} weekday - 星期几（1-7）
 * @returns {Array} 该天的课程列表
 */
export function getCoursesByWeekday(weekday) {
  return COURSES.filter(c => c.weekday === weekday)
}

/**
 * 获取指定节次的课程（考虑9-12节这样的跨行课程）
 * @param {number} weekday - 星期几（1-7）
 * @param {number} period - 节次（1-12）
 * @returns {Object|null} 课程信息或null
 */
export function getCourseAtPeriod(weekday, period) {
  return COURSES.find(c => {
    if (c.weekday !== weekday) return false
    const [start, end] = c.period.split('-').map(Number)
    return period >= start && period <= end
  }) || null
}

/**
 * 获取指定行（2节为一行）的课程
 * @param {number} weekday - 星期几（1-7）
 * @param {number} rowStart - 行起始节次（1,3,5,7,9,11）
 * @returns {Object|null} 课程信息或null
 */
export function getCourseAtRow(weekday, rowStart) {
  return COURSES.find(c => {
    if (c.weekday !== weekday) return false
    const [start, end] = c.period.split('-').map(Number)
    // 课程的起始节次 <= 行起始节次 且 课程结束节次 >= 行起始节次
    return start <= rowStart && end >= rowStart
  }) || null
}

/**
 * 判断课程是否从当前行开始（用于rowspan计算）
 */
export function isCourseStartAtRow(course, rowStart) {
  if (!course) return false
  const [start] = course.period.split('-').map(Number)
  return start === rowStart
}

/**
 * 计算课程占用的行数（每行2节）
 */
export function getCourseRowSpan(course) {
  if (!course) return 1
  const [start, end] = course.period.split('-').map(Number)
  return Math.ceil((end - start + 1) / 2)
}

/**
 * 判断单元格是否被合并（课程从其他行开始）
 */
export function isMergedCell(weekday, rowStart) {
  const courses = COURSES.filter(c => c.weekday === weekday)
  for (const c of courses) {
    const [start, end] = c.period.split('-').map(Number)
    // 课程跨越多行，且当前行不是起始行
    if (start < rowStart && end >= rowStart) return true
  }
  return false
}

/**
 * 获取所有课程（去重）
 * @returns {Array} 去重后的课程列表
 */
export function getAllCourses() {
  const seen = new Set()
  return COURSES.filter(c => {
    if (seen.has(c.name)) return false
    seen.add(c.name)
    return true
  })
}

/**
 * 获取当前是第几教学周（基于日期计算）
 * @param {Date} now - 当前日期
 * @returns {number} 教学周（1-20）
 */
export function getCurrentWeek(now = new Date()) {
  const semesterStart = new Date('2026-09-07')
  const diffDays = Math.floor((now - semesterStart) / 86400000)
  const week = Math.floor(diffDays / 7) + 1
  return Math.max(1, Math.min(20, week))
}

/**
 * 检查课程在指定周是否上课
 * @param {Object} course - 课程对象
 * @param {number} week - 教学周
 * @returns {boolean}
 */
export function isCourseInWeek(course, week) {
  if (!course.weeks) return true
  const [start, end] = course.weeks.split('-').map(Number)
  if (week < start || week > end) return false
  // 检查单双周
  if (course.weekdayType === 'odd') return week % 2 === 1
  if (course.weekdayType === 'even') return week % 2 === 0
  return true
}

/**
 * 获取未安排的课程列表
 * @returns {Array}
 */
export function getUnarrangedCourses() {
  return REQUIRED_COURSES.filter(c => !c.arranged)
}

/**
 * 获取已安排的学分
 * @returns {number}
 */
export function getArrangedCredits() {
  return REQUIRED_COURSES.filter(c => c.arranged).reduce((sum, c) => sum + c.credits, 0)
}

/**
 * 获取总学分
 * @returns {number}
 */
export function getTotalCredits() {
  return REQUIRED_COURSES.reduce((sum, c) => sum + c.credits, 0)
}

/**
 * 格式化单双周显示
 * @param {string} type - 'all' | 'odd' | 'even'
 * @returns {string}
 */
export function formatWeekdayType(type) {
  if (type === 'odd') return '单周'
  if (type === 'even') return '双周'
  return ''
}

/**
 * 获取节次详细时间
 * @param {number} period - 节次（1-12）
 * @returns {string}
 */
export function getPeriodTime(period) {
  return SINGLE_PERIOD_TIMES[period] || ''
}

/**
 * 获取课程显示的详细时间
 * @param {Object} course - 课程对象
 * @returns {string}
 */
export function getCourseTimeDetail(course) {
  const [start, end] = course.period.split('-').map(Number)
  const startTime = SINGLE_PERIOD_TIMES[start]?.split('-')[0] || ''
  const endTime = SINGLE_PERIOD_TIMES[end]?.split('-')[1] || ''
  return `${startTime}-${endTime}`
}

/**
 * 获取课程显示的节次文本
 * @param {Object} course - 课程对象
 * @returns {string}
 */
export function getCoursePeriodText(course) {
  const [start, end] = course.period.split('-').map(Number)
  if (start === end) return `第${start}节`
  return `第${start}-${end}节`
}

/** 第1周的周一日期（2026-09-07） */
const SEMESTER_START = new Date('2026-09-07')

/**
 * 获取指定教学周的周一日期
 * @param {number} week - 教学周（1-20）
 * @returns {Date}
 */
export function getWeekStartDate(week) {
  const date = new Date(SEMESTER_START)
  date.setDate(date.getDate() + (week - 1) * 7)
  return date
}

/**
 * 获取指定教学周的周日日期
 * @param {number} week - 教学周（1-20）
 * @returns {Date}
 */
export function getWeekEndDate(week) {
  const date = getWeekStartDate(week)
  date.setDate(date.getDate() + 6)
  return date
}

/**
 * 获取指定教学周、指定周几的日期
 * @param {number} week - 教学周（1-20）
 * @param {number} weekday - 周几（1-7，1=周一）
 * @returns {Date}
 */
export function getDateInWeek(week, weekday) {
  const monday = getWeekStartDate(week)
  const date = new Date(monday)
  date.setDate(date.getDate() + (weekday - 1))
  return date
}

/**
 * 格式化日期为 M月D日
 * @param {Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 获取周次的日期范围文本
 * @param {number} week - 教学周
 * @returns {string} 如 "9.7-9.13"
 */
export function getWeekDateRange(week) {
  const start = getWeekStartDate(week)
  const end = getWeekEndDate(week)
  const s = `${start.getMonth() + 1}.${start.getDate()}`
  const e = `${end.getMonth() + 1}.${end.getDate()}`
  return `${s}-${e}`
}

/**
 * 课程类型列表（用于筛选）
 */
export const COURSE_TYPES = [
  { key: 'all', label: '全部', color: '#666' },
  { key: '专业必修课', label: '专业必修', color: '#1565c0' },
  { key: '公共必修课', label: '公共必修', color: '#c62828' },
  { key: '公共选修课', label: '公共选修', color: '#ad1457' },
]
