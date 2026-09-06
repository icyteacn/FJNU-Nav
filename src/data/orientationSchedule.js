/**
 * 日程安排数据（版本化 + 智能元数据）
 * 支持多版本历史日程、智能提醒、分类筛选。
 * 结构：SCHEDULE_VERSIONS[] → 每个版本含 events[]，每事件含 preparation / category / importance 等。
 */

export const EVENT_CATEGORIES = {
  checkin: { label: '报到', icon: '📋', color: '#2e7d32' },
  lecture: { label: '讲座', icon: '🎤', color: '#1565c0' },
  ceremony: { label: '典礼', icon: '🎓', color: '#c62828' },
  major: { label: '专业', icon: '💻', color: '#6a1b9a' },
  health: { label: '健康', icon: '🏥', color: '#e65100' },
  safety: { label: '安全', icon: '🛡️', color: '#00695c' },
  election: { label: '选举', icon: '🗳️', color: '#ad1457' },
  other: { label: '其他', icon: '📌', color: '#455a64' },
}

export const SCHEDULE_VERSIONS = [
  {
    id: '2026-orientation-v1',
    label: '2026级研究生新生入学教育安排',
    createdAt: '2026-09-01',
    events: [
      {
        id: 'sep5-checkin',
        date: '2026-09-05',
        time: '08:00-17:00',
        endTime: '17:00',
        location: '桂15架空层',
        topic: '新生报到',
        audience: '全体研究生',
        speaker: '/',
        category: 'checkin',
        importance: 'critical',
        preparation: ['携带录取通知书原件', '携带身份证原件及复印件', '准备户口迁移证（如需）', '携带本科毕业证、学位证原件', '准备一寸证件照若干张'],
        tip: '建议上午尽早到达，避开下午高峰。报到后先去宿舍放行李，再回来办手续。',
        duration: '全天',
      },
      {
        id: 'sep5-dorm',
        date: '2026-09-05',
        time: '全天',
        endTime: '全天',
        location: '桂16宿舍楼',
        topic: '新生宿舍内务卫生整理',
        audience: '全体研究生',
        speaker: '/',
        category: 'other',
        importance: 'normal',
        preparation: ['自带被褥或到校购买', '准备生活用品'],
        tip: '建议和室友一起整理，互相认识。',
      },
      {
        id: 'sep5-night',
        date: '2026-09-05',
        time: '20:00',
        endTime: '21:00',
        location: '立诚1-101（博士、学硕）/ 立诚1-102（专硕）',
        topic: '晚点名、校园安全和纪律教育',
        audience: '全体研究生',
        speaker: '陈巍延',
        category: 'safety',
        importance: 'high',
        preparation: ['携带报到材料5、6、8、9（如有）', '黑笔'],
        tip: '必须参加，点名签到。注意区分学硕在101、专硕在102。',
        duration: '约1小时',
      },
      {
        id: 'sep6-psy',
        date: '2026-09-06',
        time: '15:20',
        endTime: '16:10',
        location: '笃行1-114',
        topic: '新生"心"适应心理健康专题讲座',
        audience: '全体研究生',
        speaker: '辛聪',
        category: 'lecture',
        importance: 'normal',
        preparation: [],
        tip: '提前10分钟到场签到。',
      },
      {
        id: 'sep6-scholar',
        date: '2026-09-06',
        time: '16:20',
        endTime: '17:30',
        location: '笃行1-114',
        topic: '奖学金评审解读 + 网络安全教育 + 预防诈骗 + 安全稳定',
        audience: '全体研究生',
        speaker: '陈巍延',
        category: 'safety',
        importance: 'high',
        preparation: ['携带证件照1张', '黑笔', '胶水', '填写研究生证（现场发）'],
        tip: '重要！涉及奖学金评审规则，建议认真听。记得带证件照和胶水填研究生证。',
        duration: '约1小时',
      },
      {
        id: 'sep7-ceremony',
        date: '2026-09-07',
        time: '08:20',
        endTime: '09:30',
        location: '东区田径场',
        topic: '学校开学典礼',
        audience: '全体研究生',
        speaker: '/',
        category: 'ceremony',
        importance: 'high',
        preparation: ['穿着整洁', '提前到场', '带水'],
        tip: '室外活动，注意防晒/带伞。建议提前15分钟到达指定位置。',
      },
      {
        id: 'sep7-photo',
        date: '2026-09-07',
        time: '09:50',
        endTime: '10:30',
        location: '计网楼507',
        topic: '研究生信息采集（新生照片采集）',
        audience: '全体研究生',
        speaker: '柒象',
        category: 'other',
        importance: 'high',
        preparation: ['穿着深色有领衣服（拍照要求）', '整理仪容'],
        tip: '照片用于研究生证和学信网，务必认真对待。建议穿深色衣服。',
      },
      {
        id: 'sep7-ai',
        date: '2026-09-07',
        time: '10:00',
        endTime: '11:30',
        location: '计网楼511',
        topic: '人工智能专业介绍会暨班委选举',
        audience: '人工智能专业（本部）',
        speaker: '陈黎飞',
        category: 'major',
        importance: 'high',
        preparation: ['了解本专业培养方案', '如有意向竞选班委可准备自我介绍'],
        tip: '了解专业方向和导师信息。有意竞选班委的同学准备1分钟自我介绍。',
      },
      {
        id: 'sep7-cyber',
        date: '2026-09-07',
        time: '14:30',
        endTime: '16:00',
        location: '笃行1-110',
        topic: '网络空间安全专业介绍会暨班委选举',
        audience: '网络空间安全专业硕博',
        speaker: '林丽美',
        category: 'major',
        importance: 'high',
        preparation: ['了解本专业培养方案', '如有意向竞选班委可准备自我介绍'],
        tip: '博士和学硕都在这个教室。注意区分专硕在其他教室。',
      },
      {
        id: 'sep8-interview',
        date: '2026-09-08',
        time: '09:30',
        endTime: '12:00',
        location: '计网楼512',
        topic: '研究生"两委"面试',
        audience: '递交申请表的同学',
        speaker: '陈巍延',
        category: 'election',
        importance: 'normal',
        preparation: ['提前准备好面试内容', '着装整洁'],
        tip: '仅限已递交申请表的同学。建议提前10分钟到场。',
      },
      {
        id: 'sep9-college',
        date: '2026-09-09',
        time: '09:00',
        endTime: '10:30',
        location: '图书馆大会堂',
        topic: '学院新生开学典礼',
        audience: '全体研究生',
        speaker: '邓胜柱',
        category: 'ceremony',
        importance: 'high',
        preparation: ['穿着整洁', '提前到场'],
        tip: '学院级别的开学典礼，会介绍学院领导和导师团队。',
      },
      {
        id: 'sep9-orientation',
        date: '2026-09-09',
        time: '19:00',
        endTime: '21:00',
        location: '立诚1-206',
        topic: '2026级研究生入学教育专题会',
        audience: '全体研究生',
        speaker: '研究生院',
        category: 'lecture',
        importance: 'high',
        preparation: ['笔记本'],
        tip: '研究生院组织，涉及学籍管理、培养方案等重要信息。',
      },
      {
        id: 'sep10-special',
        date: '2026-09-10',
        time: '09:00',
        endTime: '11:30',
        location: '致广1-109',
        topic: '教学管理、实验室安全、党务工作、团学工作、校情校史专题教育',
        audience: '全体研究生',
        speaker: '邓远欣、周赵斌、忻海然、陈巍延',
        category: 'safety',
        importance: 'high',
        preparation: ['笔记本', '手机充满电（可能需要扫码签到）'],
        tip: '多个主题连续进行，内容较多。实验室安全是重点，后续做实验必须通过考核。',
      },
      {
        id: 'sep10-cybersec',
        date: '2026-09-10',
        time: '14:30',
        endTime: '16:00',
        location: '计网楼507',
        topic: '网络与信息安全专业介绍会暨班委选举',
        audience: '网络与信息安全专业',
        speaker: '林晖',
        category: 'major',
        importance: 'high',
        preparation: ['了解本专业培养方案'],
        tip: '注意：这个专业在507教室，不要走错。',
      },
      {
        id: 'sep10-cs',
        date: '2026-09-10',
        time: '14:30',
        endTime: '16:00',
        location: '计网楼511',
        topic: '计算机科学与技术专业介绍会暨班委选举',
        audience: '计算机科学与技术专业',
        speaker: '林崧',
        category: 'major',
        importance: 'high',
        preparation: ['了解本专业培养方案'],
        tip: '注意：计算机科学与技术专业在511教室。',
      },
      {
        id: 'sep10-se',
        date: '2026-09-10',
        time: '14:30',
        endTime: '15:30',
        location: '计网楼512',
        topic: '软件工程专业介绍会',
        audience: '软件工程专业',
        speaker: '杜欣',
        category: 'major',
        importance: 'normal',
        preparation: ['了解本专业培养方案'],
        tip: '软件工程专业在512教室。',
      },
      {
        id: 'sep10-ai-hx',
        date: '2026-09-10',
        time: '15:00',
        endTime: '16:00',
        location: '线上',
        topic: '人工智能（海西联培）专业介绍会',
        audience: '人工智能专业（海西联培）',
        speaker: '李俊',
        category: 'major',
        importance: 'normal',
        preparation: ['提前获取线上会议链接', '测试网络和设备'],
        tip: '线上进行，提前获取腾讯会议/飞书链接。如未收到请联系辅导员。',
      },
      {
        id: 'sep10-class3',
        date: '2026-09-10',
        time: '16:00',
        endTime: '17:00',
        location: '计网楼512',
        topic: '研究生2026级3班班委选举',
        audience: '软件工程专业、人工智能（海西联培未参与天津大学联培的）',
        speaker: '张夏玮',
        category: 'election',
        importance: 'normal',
        preparation: ['如有意向竞选班委可准备自我介绍'],
        tip: '3班同学必须参加。有意竞选班委的同学准备1分钟自我介绍。',
      },
      {
        id: 'sep11-rolemodel',
        date: '2026-09-11',
        time: '09:30',
        endTime: '10:20',
        location: '立诚1-106',
        topic: '榜样引领：研途启航，做自己的掌舵者',
        audience: '全体研究生',
        speaker: '陈宇',
        category: 'lecture',
        importance: 'normal',
        preparation: [],
        tip: '优秀学长学姐经验分享，对新生很有参考价值。',
      },
      {
        id: 'sep11-library',
        date: '2026-09-11',
        time: '10:30',
        endTime: '11:20',
        location: '立诚1-106',
        topic: '图书馆资源使用专题',
        audience: '全体研究生',
        speaker: '李佳璐',
        category: 'lecture',
        importance: 'normal',
        preparation: ['手机充满电（可能需要现场操作）'],
        tip: '学习如何使用知网、万方等学术数据库，对写论文很有帮助。',
      },
      {
        id: 'sep23-checkup',
        date: '2026-09-23',
        time: '14:00',
        endTime: '17:00',
        location: '旗山校区校医院',
        topic: '新生入学体检',
        audience: '全体研究生',
        speaker: '赵燕华',
        category: 'health',
        importance: 'high',
        preparation: ['空腹（体检前一天晚上10点后不进食）', '携带身份证', '穿宽松衣服', '女生避开生理期'],
        tip: '体检项目包括抽血、胸透等，建议空腹前往。旗山校区校医院，注意路程时间。',
      },
      {
        id: 'oct-aids',
        date: '2026-10-15',
        time: '待定',
        endTime: '待定',
        location: '待定',
        topic: '艾滋病和校园常见传染病防控专题教育',
        audience: '全体研究生',
        speaker: '黄晓敏',
        category: 'health',
        importance: 'normal',
        preparation: [],
        tip: '时间地点待定，关注学院通知。',
        pending: true,
      },
    ],
  },
]

/** 按日期分组事件 */
export function groupByDate(events) {
  const map = new Map()
  for (const e of events) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date).push(e)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

/** 安全解析时间字符串（支持 HH:MM / HH:MM-HH:MM / 全天 / 待定） */
function parseTime(timeStr) {
  if (!timeStr || timeStr === '全天' || timeStr === '待定') return null
  const m = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** 获取事件状态：past / ongoing / upcoming */
export function eventStatus(e, now = new Date()) {
  if (e.pending) return 'upcoming'
  const t = parseTime(e.time)
  if (!t) return 'upcoming'
  const d = new Date(e.date + 'T' + t)
  if (isNaN(d.getTime())) return 'upcoming'
  const et = parseTime(e.endTime)
  const end = et ? new Date(e.date + 'T' + et) : new Date(d.getTime() + 2 * 3600 * 1000)
  if (now < d) return 'upcoming'
  if (now > end) return 'past'
  return 'ongoing'
}

/** 获取下一个即将到来的事件 */
export function nextEvent(events, now = new Date()) {
  const upcoming = events.filter(e => eventStatus(e, now) === 'upcoming')
  if (!upcoming.length) return null
  return upcoming.sort((a, b) => {
    const ta = parseTime(a.time) || '00:00'
    const tb = parseTime(b.time) || '00:00'
    const da = new Date(a.date + 'T' + ta)
    const db = new Date(b.date + 'T' + tb)
    return da - db
  })[0]
}

/** 距今多久（安全版） */
export function timeUntil(dateStr, timeStr) {
  const t = parseTime(timeStr)
  if (!t) return null
  const target = new Date(dateStr + 'T' + t)
  const now = new Date()
  const diff = target - now
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  if (days > 0) return { text: `${days}天${hours}小时${mins}分`, days, hours, mins, secs }
  if (hours > 0) return { text: `${hours}小时${mins}分${secs}秒`, days: 0, hours, mins, secs }
  return { text: `${mins}分${secs}秒`, days: 0, hours: 0, mins, secs }
}

/** 获取下一个活动的日期字符串（用于自动展开） */
export function nextEventDate(events, now = new Date()) {
  const n = nextEvent(events, now)
  return n ? n.date : null
}
