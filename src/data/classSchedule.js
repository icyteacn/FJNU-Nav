/**
 * 课程表数据 v6
 * 支持多专业/班级课表查看
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

/** 表格行：每节课单独一行 */
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

/** 节次时间段 */
export const PERIOD_TIMES = {
  1: '08:20-09:05', 2: '09:15-10:00', 3: '10:20-11:05', 4: '11:15-12:00',
  5: '14:00-14:45', 6: '14:55-15:40', 7: '15:50-16:35', 8: '16:45-17:30',
  9: '18:30-19:15', 10: '19:25-20:10', 11: '20:20-21:05', 12: '21:15-22:00',
}

/** 专业/班级列表 */
export const MAJORS = [
  { key: 'cs-master', label: '计算机科学与技术（学术硕士）', short: '计科学硕', color: '#1565c0' },
  { key: 'cyber-master', label: '网络空间安全（学术硕士）', short: '网安学硕', color: '#00695c' },
  { key: 'cyber-phd', label: '网络空间安全（博士）', short: '网安博士', color: '#6a1b9a' },
  { key: 'se-master', label: '软件工程（专业硕士）', short: '软工专硕', color: '#e65100' },
  { key: 'ai-master', label: '人工智能（专业硕士）', short: 'AI专硕', color: '#ad1457' },
  { key: 'nis-master', label: '网络与信息安全（专业硕士）', short: '网信专硕', color: '#c62828' },
]

/** 课程类别 */
export const COURSE_TYPES = [
  { key: 'all', label: '全部', color: '#666' },
  { key: '专业必修课', label: '专业必修', color: '#1565c0' },
  { key: '专业选修课', label: '专业选修', color: '#00695c' },
  { key: '公共必修课', label: '公共必修', color: '#c62828' },
  { key: '公共选修课', label: '公共选修', color: '#ad1457' },
]

/**
 * 2026级研究生课程表
 * major: 专业/班级key
 * shared: 是否与其他专业合班
 */
export const COURSES = [
  // ===== 计算机科学与技术（学术硕士）=====
  {
    name: '研究生英语B', id: 'ENG-B-001', teacher: '蒋宏影', location: '笃行1-218',
    weeks: '3-18', weekdayType: 'all', startPeriod: 1, endPeriod: 2, weekday: 1,
    credits: 2, hours: 32, category: '公共必修课', color: '#c62828', major: 'cs-master',
  },
  {
    name: '当代科技', id: 'TECH-001', teacher: '黄正华', location: '知明2-202',
    weeks: '3-10', weekdayType: 'all', startPeriod: 5, endPeriod: 6, weekday: 2,
    credits: 2, hours: 32, category: '公共选修课', color: '#ad1457', major: 'cs-master',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'cs-master',
  },
  {
    name: '机器学习', id: 'XZB0270812104', teacher: '陈丽萍', location: '笃行1-321A',
    weeks: '3-14', weekdayType: 'all', startPeriod: 5, endPeriod: 8, weekday: 4,
    credits: 3, hours: 48, category: '专业必修课', color: '#00695c', major: 'cs-master',
  },
  {
    name: '高级算法设计与分析', id: 'XZB0270812103', teacher: '张筱辰', location: '计网楼406',
    weeks: '3-14', weekdayType: 'all', startPeriod: 5, endPeriod: 8, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#6a1b9a', major: 'cs-master',
  },
  {
    name: '高等工程数学', id: 'XZB0270812102', teacher: '林劼、胡丽莹', location: '笃行1-201',
    weeks: '3-14', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#1565c0', major: 'cs-master',
  },

  // ===== 网络空间安全（学术硕士）=====
  {
    name: '学术论文写作', id: 'XZB027083900001', teacher: '许胜民、马金花', location: '笃行1-204',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 3,
    credits: 2, hours: 32, category: '专业必修课', color: '#00695c', major: 'cyber-master', shared: '与网信专硕、博士生合班',
  },
  {
    name: '网络空间安全导论', id: 'XZB027083900002', teacher: '林丽美、汪晓丁、许力、方定邦', location: '科技楼1004',
    weeks: '3-10', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 4,
    credits: 2, hours: 32, category: '专业必修课', color: '#00695c', major: 'cyber-master', shared: '与博士生合班',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'cyber-master',
  },
  {
    name: '研究生英语B', id: 'ENG-B-001', teacher: '蒋宏影', location: '笃行1-218',
    weeks: '3-18', weekdayType: 'all', startPeriod: 1, endPeriod: 2, weekday: 1,
    credits: 2, hours: 32, category: '公共必修课', color: '#c62828', major: 'cyber-master',
  },

  // ===== 网络空间安全（博士）=====
  {
    name: '学术论文写作', id: 'BZB027083900001', teacher: '许胜民、马金花', location: '笃行1-204',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 3,
    credits: 2, hours: 32, category: '专业必修课', color: '#6a1b9a', major: 'cyber-phd',
  },
  {
    name: '网络空间安全导论', id: 'BZB027083900002', teacher: '林丽美、汪晓丁、许力、方定邦', location: '科技楼1004',
    weeks: '3-10', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 4,
    credits: 2, hours: 32, category: '专业必修课', color: '#6a1b9a', major: 'cyber-phd',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'cyber-phd',
  },

  // ===== 软件工程（专业硕士）=====
  {
    name: '论文写作指导', id: 'ZSZB027085405401', teacher: '倪友聪、张仕、杜欣、林立', location: '知明1-315',
    weeks: '3-10', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 4,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'se-master',
  },
  {
    name: '高等工程数学', id: 'ZSZB027085405402', teacher: '林劼、胡丽莹', location: '笃行1-201',
    weeks: '3-14', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#1565c0', major: 'se-master',
  },
  {
    name: '高级算法设计与分析', id: 'ZSZB027085405403', teacher: '张仕', location: '计网楼402b',
    weeks: '3-14', weekdayType: 'all', startPeriod: 5, endPeriod: 8, weekday: 2,
    credits: 3, hours: 48, category: '专业必修课', color: '#6a1b9a', major: 'se-master',
  },
  {
    name: '软件体系结构', id: 'ZSZB027085405404', teacher: '肖如良', location: '知明1-411',
    weeks: '3-14', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 5,
    credits: 2, hours: 48, category: '专业必修课', color: '#00695c', major: 'se-master',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'se-master',
  },
  {
    name: '研究生英语B', id: 'ENG-B-001', teacher: '蒋宏影', location: '笃行1-218',
    weeks: '3-18', weekdayType: 'all', startPeriod: 1, endPeriod: 2, weekday: 1,
    credits: 2, hours: 32, category: '公共必修课', color: '#c62828', major: 'se-master',
  },

  // ===== 人工智能（专业硕士）=====
  {
    name: '机器学习', id: 'ZSZB027085410005', teacher: '陈丽萍', location: '笃行1-321A',
    weeks: '3-14', weekdayType: 'all', startPeriod: 5, endPeriod: 8, weekday: 4,
    credits: 3, hours: 48, category: '专业必修课', color: '#00695c', major: 'ai-master',
  },
  {
    name: '高等工程数学', id: 'ZSZB027085410002', teacher: '林劼、胡丽莹', location: '笃行1-201',
    weeks: '3-14', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#1565c0', major: 'ai-master',
  },
  {
    name: '高级人工智能原理与应用', id: 'ZSZB027085410004', teacher: '林佳胤', location: '知明1-309',
    weeks: '3-14', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#ad1457', major: 'ai-master',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'ai-master',
  },
  {
    name: '研究生英语B', id: 'ENG-B-001', teacher: '蒋宏影', location: '笃行1-218',
    weeks: '3-18', weekdayType: 'all', startPeriod: 1, endPeriod: 2, weekday: 1,
    credits: 2, hours: 32, category: '公共必修课', color: '#c62828', major: 'ai-master',
  },

  // ===== 网络与信息安全（专业硕士）=====
  {
    name: '论文写作指导', id: 'ZSZB027085412301', teacher: '许胜民、马金花', location: '笃行1-204',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 3,
    credits: 2, hours: 32, category: '专业必修课', color: '#c62828', major: 'nis-master',
  },
  {
    name: '算法设计与分析', id: 'ZSZB027085412303', teacher: '陈丽萍、周赵斌', location: '计网楼207',
    weeks: '3-14', weekdayType: 'all', startPeriod: 5, endPeriod: 8, weekday: 5,
    credits: 3, hours: 48, category: '专业必修课', color: '#6a1b9a', major: 'nis-master',
  },
  {
    name: '人工智能通识课', id: 'ZSZX027085410049', teacher: '黄培凯、林燊', location: '笃行1-113',
    weeks: '3-10', weekdayType: 'all', startPeriod: 9, endPeriod: 12, weekday: 2,
    credits: 2, hours: 32, category: '专业必修课', color: '#e65100', major: 'nis-master',
  },
  {
    name: '研究生英语B', id: 'ENG-B-001', teacher: '蒋宏影', location: '笃行1-218',
    weeks: '3-18', weekdayType: 'all', startPeriod: 1, endPeriod: 2, weekday: 1,
    credits: 2, hours: 32, category: '公共必修课', color: '#c62828', major: 'nis-master',
  },
]

/**
 * 按专业获取课程
 */
export function getCoursesByMajor(majorKey) {
  return COURSES.filter(c => c.major === majorKey)
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
 * 获取当前是第几教学周
 */
export function getCurrentWeek(now = new Date()) {
  const semesterStart = new Date('2026-08-31')
  const diffDays = Math.floor((now - semesterStart) / 86400000)
  const week = Math.floor(diffDays / 7) + 1
  return Math.max(1, Math.min(18, week))
}

/**
 * 获取指定教学周的周一日期
 */
export function getWeekStartDate(week) {
  const date = new Date('2026-08-31')
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
 * 获取指定教学周的日期范围
 */
export function getWeekDateRange(week) {
  const start = getWeekStartDate(week)
  const end = getWeekEndDate(week)
  return `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`
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
 * 格式化日期
 */
export function formatDateShort(date) {
  return `${date.getMonth() + 1}-${date.getDate()}`
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
 * 格式化单双周
 */
export function formatWeekdayType(type) {
  if (type === 'odd') return '单周'
  if (type === 'even') return '双周'
  return ''
}

/**
 * 2026-2027学年节假日与调休日历
 * type: 'holiday' = 法定假日停课, 'makeup' = 调休补课（按指定周几课表上课）
 */
export const HOLIDAY_MAP = {
  // —— 中秋节 ——
  '2026-09-25': { type: 'holiday', name: '中秋节', icon: '🥮' },
  '2026-09-26': { type: 'holiday', name: '中秋节', icon: '🥮' },
  '2026-09-27': { type: 'holiday', name: '中秋节', icon: '🥮' },
  // —— 国庆节 ——
  '2026-10-01': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-02': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-03': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-04': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-05': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-06': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  '2026-10-07': { type: 'holiday', name: '国庆节', icon: '🇨🇳' },
  // —— 调休补课日 ——
  '2026-09-20': {
    type: 'makeup', scheduleWeekday: 2, icon: '📅',
    descShort: '补周二课',
    desc: '补周二(10/6)',
    overrides: [
      { srcPeriods: [9, 10, 11, 12], destDate: '2026-10-08', destPeriods: [9, 10, 11, 12], destLocation: '笃行1-114', courseHint: '人工智能通识' },
    ],
  },
  '2026-10-10': {
    type: 'makeup', scheduleWeekday: 3, icon: '📅',
    descShort: '补周三课',
    desc: '补周三(10/7)',
  },
}

/**
 * 获取日期的节假日/调休信息（合并用户自定义覆盖）
 * @param {string} dateStr YYYY-MM-DD
 * @returns {{ type, name?, label?, icon?, desc?, scheduleWeekday? } | null}
 */
export function getDateHolidayInfo(dateStr) {
  const userOverride = loadUserOverrides()[dateStr]
  if (userOverride) return userOverride
  return HOLIDAY_MAP[dateStr] || null
}

const USER_OVERRIDE_KEY = 'fjnu_day_overrides'
export function loadUserOverrides() {
  try { return JSON.parse(localStorage.getItem(USER_OVERRIDE_KEY) || '{}') } catch { return {} }
}
export function saveUserOverride(dateStr, override) {
  const all = loadUserOverrides()
  if (override === null) { delete all[dateStr] } else { all[dateStr] = override }
  try { localStorage.setItem(USER_OVERRIDE_KEY, JSON.stringify(all)) } catch {}
}
export function clearUserOverrides() {
  try { localStorage.removeItem(USER_OVERRIDE_KEY) } catch {}
}

/**
 * 获取某日实际应上的课表周几（处理调休）
 * @param {number} originalWeekday 1-7（真实星期几）
 * @param {string} dateStr YYYY-MM-DD
 * @returns {number|null} 返回课表周几，null 表示该天停课
 */
export function getScheduleWeekday(originalWeekday, dateStr) {
  const info = HOLIDAY_MAP[dateStr]
  if (!info) return originalWeekday
  if (info.type === 'holiday') return null
  if (info.type === 'makeup') return info.scheduleWeekday
  return originalWeekday
}

/**
 * 获取调休日某节次的调课信息
 */
export function getCourseOverride(dateStr, period) {
  const info = HOLIDAY_MAP[dateStr]
  if (!info?.overrides) return null
  return info.overrides.find(o => o.srcPeriods.includes(period)) || null
}

/**
 * 检查某日某节次是否被调走（不在此日上课）
 */
export function isPeriodMoved(dateStr, period) {
  return !!getCourseOverride(dateStr, period)
}

/**
 * 查找某日某节次是否有调入的课程（从别处调来）
 * @param {string} dateStr 目标日期 YYYY-MM-DD
 * @param {number} period 节次 1-12
 * @param {Function} findCourse 查找课程的回调 (weekday, startPeriod) => course | null
 * @returns {{ course, srcDate, srcPeriods, destLocation } | null}
 */
export function getIncomingInfo(dateStr, period, findCourse) {
  for (const key of Object.keys(HOLIDAY_MAP)) {
    const info = HOLIDAY_MAP[key]
    if (!info?.overrides) continue
    for (const o of info.overrides) {
      if (o.destDate === dateStr && period >= o.destPeriods[0] && period <= o.destPeriods.at(-1)) {
        const srcWd = info.scheduleWeekday
        const course = findCourse(srcWd, o.srcPeriods[0])
        return course ? { course, srcDate: key, srcPeriods: o.srcPeriods, destLocation: o.destLocation } : null
      }
    }
  }
  return null
}
