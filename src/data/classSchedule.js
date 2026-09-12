/**
 * 课程表数据 v5
 * 每节课单独一行，课间用分界线隔开
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

/** 星期映射 */
export const WEEKDAYS = [
  { key: 1, label: '周一', short: '周一' },
  { key: 2, label: '周二', short: '周二' },
  { key: 3, label: '周三', short: '周三' },
  { key: 4, label: '周四', short: '周四' },
  { key: 5, label: '周五', short: '周五' },
  { key: 6, label: '周六', short: '周六' },
  { key: 7, label: '周日', short: '周日' },
]

/** 表格行：每节课单独一行，节次和时间合并显示 */
export const TABLE_ROWS = [
  { period: 1, label: '1', time: '08:20', timeEnd: '09:05', section: 'morning' },
  { period: 2, label: '2', time: '09:15', timeEnd: '10:00', section: 'morning' },
  { period: 3, label: '3', time: '10:20', timeEnd: '11:05', section: 'morning' },
  { period: 4, label: '4', time: '11:15', timeEnd: '12:00', section: 'morning' },
  { period: 5, label: '5', time: '14:00', timeEnd: '14:45', section: 'afternoon' },
  { period: 6, label: '6', time: '14:55', timeEnd: '15:40', section: 'afternoon' },
  { period: 7, label: '7', time: '15:50', timeEnd: '16:35', section: 'afternoon' },
  { period: 8, label: '8', time: '16:45', timeEnd: '17:30', section: 'afternoon' },
  { period: 9, label: '9', time: '18:30', timeEnd: '19:15', section: 'evening' },
  { period: 10, label: '10', time: '19:25', timeEnd: '20:10', section: 'evening' },
  { period: 11, label: '11', time: '20:20', timeEnd: '21:05', section: 'evening' },
  { period: 12, label: '12', time: '21:15', timeEnd: '22:00', section: 'evening' },
]

/** 节次时间段（用于详情显示） */
export const PERIOD_TIMES = {
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

/** 课间休息时间段 */
export const BREAK_TIMES = {
  '2-3': '10:00-10:20 (课间20分钟)',
  '4-5': '12:00-14:00 (午休)',
  '6-7': '15:40-15:50 (课间10分钟)',
  '8-9': '17:30-18:30 (晚饭时间)',
  '10-11': '20:10-20:20 (课间10分钟)',
}

/**
 * 课程表数据（修正版）
 * 节次为起止单节课（如9-12表示第9、10、11、12节）
 */
export const COURSES = [
  {
    name: '研究生英语B',
    id: 'ENG-B-001',
    teacher: '蒋宏影',
    location: '笃行1-218',
    weeks: '3-18',
    weekdayType: 'all',
    startPeriod: 1,
    endPeriod: 2,
    weekday: 1,
    credits: 2,
    hours: 32,
    category: '公共必修课',
    color: '#c62828',
  },
  {
    name: '当代科技',
    id: 'TECH-001',
    teacher: '黄正华',
    location: '知明2-202',
    weeks: '3-10',
    weekdayType: 'all',
    startPeriod: 5,
    endPeriod: 6,
    weekday: 2,
    credits: 2,
    hours: 32,
    category: '公共选修课',
    color: '#ad1457',
  },
  {
    name: '人工智能通识课',
    id: 'ZSZX027085410049',
    teacher: '黄培凯、林燊',
    location: '笃行1-113',
    weeks: '3-10',
    weekdayType: 'all',
    startPeriod: 9,
    endPeriod: 12,
    weekday: 2,
    credits: 2,
    hours: 32,
    category: '专业必修课',
    color: '#e65100',
  },
  {
    name: '机器学习',
    id: 'XZB0270812104',
    teacher: '陈丽萍',
    location: '笃行1-321A',
    weeks: '3-14',
    weekdayType: 'all',
    startPeriod: 5,
    endPeriod: 8,
    weekday: 4,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#00695c',
  },
  {
    name: '高级算法设计与分析',
    id: 'XZB0270812103',
    teacher: '张筱辰',
    location: '计网楼406',
    weeks: '3-14',
    weekdayType: 'all',
    startPeriod: 5,
    endPeriod: 8,
    weekday: 5,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#6a1b9a',
  },
  {
    name: '高等工程数学',
    id: 'XZB0270812102',
    teacher: '林劼、胡丽莹',
    location: '笃行1-201',
    weeks: '3-14',
    weekdayType: 'all',
    startPeriod: 9,
    endPeriod: 12,
    weekday: 5,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#1565c0',
  },
]

/** 培养方案课程列表 */
export const REQUIRED_COURSES = [
  { name: '新时代中国特色社会主义理论与实践研究', credits: 2, category: '公共必修课', arranged: false },
  { name: '自然辩证法概论', credits: 1, category: '公共必修课', arranged: false },
  { name: '硕士生第一外国语', credits: 4, category: '公共必修课', arranged: true, arrangedName: '研究生英语B' },
  { name: '科研伦理与学术规范', credits: 1, category: '公共必修课', arranged: false },
  { name: '实验室安全知识', credits: 1, category: '专业必修课', arranged: false },
  { name: '学术论文写作', credits: 2, category: '专业必修课', arranged: false },
  { name: '高等工程数学', credits: 3, category: '专业必修课', arranged: true },
  { name: '高级算法设计与分析', credits: 3, category: '专业必修课', arranged: true },
  { name: '机器学习', credits: 3, category: '专业必修课', arranged: true },
]

/** 课程类型列表 */
export const COURSE_TYPES = [
  { key: 'all', label: '全部', color: '#666' },
  { key: '专业必修课', label: '专业必修', color: '#1565c0' },
  { key: '公共必修课', label: '公共必修', color: '#c62828' },
  { key: '公共选修课', label: '公共选修', color: '#ad1457' },
]

/**
 * 获取指定节次的课程（考虑周次筛选）
 */
export function getCourseAtPeriod(weekday, period, week) {
  return COURSES.find(c => {
    if (c.weekday !== weekday) return false
    if (period < c.startPeriod || period > c.endPeriod) return false
    // 如果指定了周次，检查课程是否在该周上课
    if (week !== undefined && !isCourseInWeek(c, week)) return false
    return true
  }) || null
}

/**
 * 判断课程是否从该节开始（用于合并单元格）
 */
export function isCourseStartAtPeriod(course, period) {
  if (!course) return false
  return course.startPeriod === period
}

/**
 * 计算课程占用的行数
 */
export function getCourseRowSpan(course) {
  if (!course) return 1
  return course.endPeriod - course.startPeriod + 1
}

/**
 * 判断单元格是否被合并（考虑周次筛选）
 */
export function isMergedCell(weekday, period, week) {
  const courses = COURSES.filter(c => {
    if (c.weekday !== weekday) return false
    if (week !== undefined && !isCourseInWeek(c, week)) return false
    return true
  })
  for (const c of courses) {
    if (period > c.startPeriod && period <= c.endPeriod) return true
  }
  return false
}

/** 第1周的周一日期（2026-08-31） */
const SEMESTER_START = new Date('2026-08-31')

/**
 * 获取当前教学周（第1周=8.31-9.6）
 */
export function getCurrentWeek(now = new Date()) {
  const diffDays = Math.floor((now - SEMESTER_START) / 86400000)
  const week = Math.floor(diffDays / 7) + 1
  return Math.max(1, Math.min(18, week))
}

/**
 * 检查课程在指定周是否上课
 */
export function isCourseInWeek(course, week) {
  if (!course.weeks) return true
  const [start, end] = course.weeks.split('-').map(Number)
  if (week < start || week > end) return false
  if (course.weekdayType === 'odd') return week % 2 === 1
  if (course.weekdayType === 'even') return week % 2 === 0
  return true
}

/**
 * 获取指定教学周的周一日期（第1周=8.31）
 */
export function getWeekStartDate(week) {
  const date = new Date(SEMESTER_START)
  date.setDate(date.getDate() + (week - 1) * 7)
  return date
}

/**
 * 获取指定教学周的周日日期
 */
export function getWeekEndDate(week) {
  const date = getWeekStartDate(week)
  date.setDate(date.getDate() + 6)
  return date
}

/**
 * 获取指定教学周、指定周几的日期
 */
export function getDateInWeek(week, weekday) {
  const monday = getWeekStartDate(week)
  const date = new Date(monday)
  date.setDate(date.getDate() + (weekday - 1))
  return date
}

/**
 * 格式化日期为 M-D
 */
export function formatDateShort(date) {
  return `${date.getMonth() + 1}-${date.getDate()}`
}

/**
 * 获取周次的日期范围文本
 */
export function getWeekDateRange(week) {
  const start = getWeekStartDate(week)
  const end = getWeekEndDate(week)
  return `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`
}

/**
 * 格式化单双周显示
 */
export function formatWeekdayType(type) {
  if (type === 'odd') return '单周'
  if (type === 'even') return '双周'
  return ''
}

/**
 * 获取课程显示的详细时间
 */
export function getCourseTimeDetail(course) {
  const startTime = SINGLE_PERIOD_TIMES[course.startPeriod]?.split('-')[0] || ''
  const endTime = SINGLE_PERIOD_TIMES[course.endPeriod]?.split('-')[1] || ''
  return `${startTime}-${endTime}`
}

/**
 * 获取课程显示的节次文本
 */
export function getCoursePeriodText(course) {
  if (course.startPeriod === course.endPeriod) return `第${course.startPeriod}节`
  return `第${course.startPeriod}-${course.endPeriod}节`
}

/**
 * 获取未安排的课程列表
 */
export function getUnarrangedCourses() {
  return REQUIRED_COURSES.filter(c => !c.arranged)
}

/**
 * 获取已安排的学分
 */
export function getArrangedCredits() {
  return REQUIRED_COURSES.filter(c => c.arranged).reduce((sum, c) => sum + c.credits, 0)
}

/**
 * 获取总学分
 */
export function getTotalCredits() {
  return REQUIRED_COURSES.reduce((sum, c) => sum + c.credits, 0)
}
