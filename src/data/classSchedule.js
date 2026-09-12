/**
 * 课程表数据
 * 结构：周几 → 节次 → 课程信息
 * 用于日程助手的课表日程 tab
 */

/** 节次时间映射（正确的上课时间） */
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

/** 节次列表（上午/下午/晚上分组） */
export const PERIOD_GROUPS = [
  { label: '上午', periods: ['1-2', '3-4'] },
  { label: '下午', periods: ['5-6', '7-8'] },
  { label: '晚上', periods: ['9-10', '11-12'] },
]

/** 全部节次 */
export const ALL_PERIODS = ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12']

/**
 * 课程表数据
 * 每个课程包含：
 * - name: 课程名称
 * - id: 课程编号
 * - teacher: 任课教师
 * - location: 上课地点
 * - weeks: 上课周数
 * - period: 节次（如 '9-10' 表示9-10节）
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
    period: '5-6',
    weekday: 5,
    credits: 3,
    hours: 48,
    category: '专业必修课',
    color: '#6a1b9a',
  },
  // 周五 9-10节（高等工程数学）
  {
    name: '高等工程数学',
    id: 'XZB0270812102',
    teacher: '林劼、胡丽莹',
    location: '笃行1-201',
    weeks: '3-14',
    period: '9-10',
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
 * 获取指定周几和节次的课程
 * @param {number} weekday - 星期几（1-7）
 * @param {string} period - 节次（如 '9-10'）
 * @returns {Object|null} 课程信息或null
 */
export function getCourseAt(weekday, period) {
  return COURSES.find(c => c.weekday === weekday && c.period === period) || null
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
 * 生成周视图数据（周一到周五，1-12节）
 * @returns {Object} { weekday: { period: course } }
 */
export function getWeekView() {
  const view = {}
  for (let wd = 1; wd <= 5; wd++) {
    view[wd] = {}
    for (const p of ALL_PERIODS) {
      view[wd][p] = getCourseAt(wd, p)
    }
  }
  return view
}

/**
 * 获取本周课程列表（按周几分组）
 * @returns {Array} [[weekday, courses], ...]
 */
export function getWeekCourses() {
  const map = new Map()
  for (let wd = 1; wd <= 5; wd++) {
    const courses = getCoursesByWeekday(wd)
    if (courses.length) map.set(wd, courses)
  }
  return [...map.entries()]
}

/**
 * 获取当前是第几教学周（基于日期计算）
 * @param {Date} now - 当前日期
 * @returns {number} 教学周（1-20）
 */
export function getCurrentWeek(now = new Date()) {
  // 假设第3周从2026-09-14开始（周一）
  const semesterStart = new Date('2026-09-07') // 第1周的周一
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
  return week >= start && week <= end
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
 * 生成日程事件列表（用于日程助手）
 * @returns {Array} 事件数组
 */
export function generateScheduleEvents() {
  const events = []
  const now = new Date()
  const currentWeek = getCurrentWeek(now)

  for (const course of COURSES) {
    if (!isCourseInWeek(course, currentWeek)) continue

    const periodNum = parseInt(course.period.split('-')[0])
    const periodEnd = parseInt(course.period.split('-')[1])
    const startTime = PERIOD_TIMES[periodNum]?.split('-')[0] || '08:20'
    const endTime = PERIOD_TIMES[periodEnd]?.split('-')[1] || '10:00'

    // 计算本周对应的日期
    const semesterStart = new Date('2026-09-07')
    const weekOffset = (currentWeek - 1) * 7
    const courseDate = new Date(semesterStart.getTime() + weekOffset * 86400000)
    courseDate.setDate(courseDate.getDate() + (course.weekday - 1))
    const dateStr = `${courseDate.getFullYear()}-${String(courseDate.getMonth() + 1).padStart(2, '0')}-${String(courseDate.getDate()).padStart(2, '0')}`

    events.push({
      id: `course-${course.id}-${currentWeek}`,
      date: dateStr,
      time: `${startTime}-${endTime}`,
      endTime: endTime,
      location: course.location,
      topic: course.name,
      audience: '计算机科学与技术',
      speaker: course.teacher,
      category: 'class',
      importance: 'normal',
      preparation: ['携带课本', '携带笔记本'],
      tip: `${course.category} · ${course.credits}学分 · 教学周${course.weeks}`,
      courseData: course,
    })
  }

  return events
}
