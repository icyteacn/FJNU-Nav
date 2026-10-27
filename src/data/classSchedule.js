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
    // 第 10 周（11/3 周二 5-6 节）停课，其余周次照常；改这里后 build 会重新生成
    // public/data/schedule-data.json，APK 打开时从线上拉取即生效（无需发版）
    weeks: '3-9', weekdayType: 'all', startPeriod: 5, endPeriod: 6, weekday: 2,
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
    name: '高等工程数学', id: 'XZB0270812102', teacher: '林劼、胡丽莹', location: '笃行1-209',
    weeks: '8-11', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 6,
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
    name: '高等工程数学', id: 'ZSZB027085405402', teacher: '林劼、胡丽莹', location: '笃行1-209',
    weeks: '8-11', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 6,
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
    name: '高等工程数学', id: 'ZSZB027085410002', teacher: '林劼、胡丽莹', location: '笃行1-209',
    weeks: '8-11', weekdayType: 'all', startPeriod: 1, endPeriod: 4, weekday: 6,
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
// 学期起点按本地零点构造（'YYYY-MM-DD' 直接喂 new Date 会走 UTC，
// 东八区每周一 00:00-08:00 会把周次少算一周）
const SEMESTER_START = new Date(2026, 7, 31)

/* ── 学期注册表（通用课表地基）──────────────────────────────
 * type: 'term' 教学学期（有周课表）| 'winter_break' | 'summer_break'（假期模式）
 * term 只需 start+weeks（end 推导）；break 用 start+end（窗口由相邻学期推导估算，
 * estimate:true 表示官方校历公布后需复核修订，不视为权威放假日期） */
export const SEMESTERS = [
  { id: '2026-2027-1', name: '2026-2027学年第一学期', type: 'term', start: '2026-08-31', weeks: 18 },
  { id: '2027-winter', name: '2027年寒假', type: 'winter_break', start: '2027-01-05', end: '2027-02-28', estimate: true },
  { id: '2026-2027-2', name: '2026-2027学年第二学期', type: 'term', start: '2027-03-01', weeks: 18, estimate: true },
  { id: '2027-summer', name: '2027年暑假', type: 'summer_break', start: '2027-07-05', end: '2027-08-29', estimate: true },
]

export function parseLocalDate(s) {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** 学期结束时刻（不含）：term = start + weeks*7d；break = end 次日零点 */
export function semesterEndDate(s) {
  if (s.type === 'term') {
    const d = parseLocalDate(s.start)
    d.setDate(d.getDate() + (s.weeks || 18) * 7)
    return d
  }
  const d = parseLocalDate(s.end || s.start)
  d.setDate(d.getDate() + 1)
  return d
}

/** 按日期自动选学期；落在区间外时取最近的相邻学期 */
export function getActiveSemester(now = new Date(), list = SEMESTERS) {
  const t = now.getTime()
  for (const s of list) {
    if (t >= parseLocalDate(s.start).getTime() && t < semesterEndDate(s).getTime()) return s
  }
  return t < parseLocalDate(list[0].start).getTime() ? list[0] : list[list.length - 1]
}

/** 某学期下一教学学期（假期倒计时用） */
export function nextTermAfter(s, list = SEMESTERS) {
  const i = list.indexOf(s)
  for (let k = i + 1; k < list.length; k++) if (list[k].type === 'term') return list[k]
  return null
}

export function getSemesterStart(sem) { return sem ? parseLocalDate(sem.start) : new Date(SEMESTER_START) }

export function getCurrentWeek(now = new Date(), sem) {
  const start = getSemesterStart(sem)
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((day - start) / 86400000)
  const week = Math.floor(diffDays / 7) + 1
  return Math.max(1, Math.min(sem?.weeks || 18, week))
}

/**
 * 获取指定教学周的周一日期
 */
export function getWeekStartDate(week, sem) {
  const date = getSemesterStart(sem)
  date.setDate(date.getDate() + (week - 1) * 7)
  return date
}

/**
 * 获取指定教学周的周日日期
 */
export function getWeekEndDate(week, sem) {
  const date = getWeekStartDate(week, sem)
  date.setDate(date.getDate() + 6)
  return date
}

/**
 * 获取指定教学周的日期范围
 */
export function getWeekDateRange(week, sem) {
  const start = getWeekStartDate(week, sem)
  const end = getWeekEndDate(week, sem)
  return `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`
}

/**
 * 获取指定教学周、指定周几的日期
 */
export function getDateInWeek(week, weekday, sem) {
  const monday = getWeekStartDate(week, sem)
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
 * type: 'holiday' = 法定假日停课, 'makeup' = 调休补课（按指定周几课表上课）,
 *       'adjust'  = 单次调课（该日课表不变，仅 overrides 指定节次改到 destDate 上）
 * overrides: { srcPeriods, destDate, destPeriods, destLocation, courseHint }
 *   srcPeriods = 该日被调走的节次（原格显示 ↗️ 改期角标）；
 *   destDate/destPeriods/destLocation = 调入日期/节次/教室（目标格显示 ⬅️ 调入角标）
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
  // —— 单次调课 ——
  '2026-10-13': {
    type: 'adjust', scheduleWeekday: 2, icon: '🔀',
    descShort: '调课',
    desc: '第七周周二(10/13)晚9-12节人工智能通识课调至周四(10/15)笃行1-114',
    overrides: [
      { srcPeriods: [9, 10, 11, 12], destDate: '2026-10-15', destPeriods: [9, 10, 11, 12], destLocation: '笃行1-114', courseHint: '人工智能通识' },
    ],
  },
  '2026-10-20': {
    type: 'adjust', scheduleWeekday: 2, icon: '🔀',
    descShort: '调课',
    desc: '第八周周二(10/20)晚9-12节人工智能通识课调至第12周周四(11/19)立诚1-105',
    overrides: [
      { srcPeriods: [9, 10, 11, 12], destDate: '2026-11-19', destPeriods: [9, 10, 11, 12], destLocation: '立诚1-105', courseHint: '人工智能通识' },
    ],
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
  if (HOLIDAY_MAP[dateStr]) return HOLIDAY_MAP[dateStr]
  // 用户自建调课的源日：表头也给一个「调课」标记（与官方 adjust 同款样式）
  const adj = getAllAdjustments().find(a => a.srcDate === dateStr)
  if (adj) {
    return { type: 'adjust', icon: '🔀', descShort: '调课', desc: `${adj.courseHint || '课程'} 调至 ${adj.destDate} 第${adj.destPeriods[0]}-${adj.destPeriods.at(-1)}节` }
  }
  return null
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

/* ══════════════ 调课（改期）统一模型 ══════════════
 * 条目：{ id, srcDate, srcWeekday, srcPeriods[], destDate, destPeriods[],
 *         destLocation, courseHint, origin: 'site' | 'user' }
 * site = 随数据接口下发的官方调课（HOLIDAY_MAP.overrides）
 * user = 用户在课表里点课程设置的本地调课（localStorage）
 */
let userAdjustKey = 'fjnu_adjustments'
/** 设置本地调课记录的存储键（课表 App 用 feike_adjustments 等隔离） */
export function setUserAdjustKey(key) { userAdjustKey = key || 'fjnu_adjustments' }
export function loadUserAdjustments() {
  try {
    const list = JSON.parse(localStorage.getItem(userAdjustKey) || '[]')
    return Array.isArray(list) ? list : []
  } catch { return [] }
}
export function saveUserAdjustment(adj) {
  const all = loadUserAdjustments()
  const id = adj.id || ('usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6))
  const item = { ...adj, id, origin: 'user' }
  const idx = all.findIndex(a => a.id === id)
  if (idx >= 0) all[idx] = item; else all.push(item)
  try { localStorage.setItem(userAdjustKey, JSON.stringify(all)) } catch {}
  return item
}
export function removeUserAdjustment(id) {
  const all = loadUserAdjustments().filter(a => a.id !== id)
  try { localStorage.setItem(userAdjustKey, JSON.stringify(all)) } catch {}
}
/** 清空全部本地调课（用于「恢复默认课表」） */
export function clearUserAdjustments() {
  try { localStorage.removeItem(userAdjustKey) } catch {}
}
/** 官方调课（来自数据接口的 HOLIDAY_MAP.overrides） */
export function getSiteAdjustments() {
  const list = []
  for (const date of Object.keys(HOLIDAY_MAP)) {
    const info = HOLIDAY_MAP[date]
    if (!info?.overrides) continue
    for (const o of info.overrides) {
      list.push({
        id: `site_${date}_${o.srcPeriods[0]}`,
        srcDate: date, srcWeekday: info.scheduleWeekday, srcPeriods: o.srcPeriods,
        destDate: o.destDate, destPeriods: o.destPeriods,
        destLocation: o.destLocation, courseHint: o.courseHint || '', origin: 'site',
      })
    }
  }
  return list
}
/** 官方 + 用户本地调课合并列表 */
export function getAllAdjustments() {
  return [...getSiteAdjustments(), ...loadUserAdjustments()]
}

/**
 * 应用远程课表数据（接口 schedule-data.json）：整体替换课程与节假日/调课表。
 * 模块内数组/对象保持引用不变（原地替换内容），调用方靠 scheduleRevision 触发重算。
 */
export function applyRemoteSchedule(data) {
  if (!data || typeof data !== 'object') return false
  let touched = false
  if (Array.isArray(data.courses) && data.courses.length && data.courses.length !== COURSES.length) touched = true
  else if (Array.isArray(data.courses) && data.courses.length) {
    touched = JSON.stringify(data.courses) !== JSON.stringify(COURSES)
  }
  if (Array.isArray(data.courses) && data.courses.length) {
    COURSES.length = 0
    COURSES.push(...data.courses)
  }
  if (data.holidayMap && typeof data.holidayMap === 'object') {
    const next = JSON.stringify(data.holidayMap)
    if (next !== JSON.stringify(HOLIDAY_MAP)) {
      touched = true
      for (const k of Object.keys(HOLIDAY_MAP)) delete HOLIDAY_MAP[k]
      Object.assign(HOLIDAY_MAP, data.holidayMap)
    }
  }
  return touched
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
 * 获取某日某节次的调课信息（官方 + 用户本地调课合并）
 */
export function getCourseOverride(dateStr, period) {
  const a = getAllAdjustments().find(x => x.srcDate === dateStr && x.srcPeriods.includes(period))
  if (!a) return null
  return { srcPeriods: a.srcPeriods, destDate: a.destDate, destPeriods: a.destPeriods, destLocation: a.destLocation, courseHint: a.courseHint, origin: a.origin, id: a.id }
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
 * @returns {{ course, srcDate, srcPeriods, destPeriods, destLocation } | null}
 */
export function getIncomingInfo(dateStr, period, findCourse) {
  for (const a of getAllAdjustments()) {
    if (a.destDate !== dateStr) continue
    if (period < a.destPeriods[0] || period > a.destPeriods.at(-1)) continue
    const course = findCourse(a.srcWeekday, a.srcPeriods[0])
    if (!course) continue
    return { course, srcDate: a.srcDate, srcPeriods: a.srcPeriods, destPeriods: a.destPeriods, destLocation: a.destLocation, origin: a.origin }
  }
  return null
}
