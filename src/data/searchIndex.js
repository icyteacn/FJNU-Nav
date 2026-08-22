/**
 * 全局搜索索引（单一数据源）
 * ---------------------------------------------------------------------------
 * 每个应用三层可检索文本：
 * - keywords  别名 / 同义词（权重最高，如「课表」「吃饭」「记账」）
 * - content   应用内核心功能点（让搜索直达应用内的能力）
 * - title/desc 基础字段
 * 匹配时按 权重(标题3 > 别名2 > 简介1.5 > 内容1) 求和排序，并给出命中标签。
 */
import { apps } from './apps'

const EXTRA = {
  graduatePlan: {
    keywords: ['奖学金', '学业奖学金', '国奖', '综测', '综质', '科研分', '测算器', '研究生', '读研', '保研', '学分', '培养方案', '导师', '学术', '论文', '开题', '中期'],
    content: ['学业奖学金标准与比例', '综合成绩测算器', '课程加权平均分', '综测分积累计算', '科研加分快速选档', '竞赛计分系数', '计分速查', '学术日历', '学位论文节点', '文献工具', '六级考试', '研究生管理系统', 'VPN 知网'],
  },
  officialSites: {
    keywords: ['官网', '网址', '教务处', '邮箱', '图书馆', '学院网站', 'portal'],
    content: ['学校官网入口', '28 个学院官网', '校园邮箱', '统一身份认证'],
  },
  campusNews: {
    keywords: ['通知', '公告', '动态', '教务通知', '新闻'],
    content: ['教务处通知列表', '工作动态', '通知详情查看'],
  },
  calendar: {
    keywords: ['校历', '放假', '寒假', '暑假', '开学', '教学周', '学期'],
    content: ['官方校历图片预览', '学期切换', '放假安排时间线', '教务处校历原文'],
  },
  classroomNav: {
    keywords: ['空教室', '自习', '教室', '上课地点', '楼宇', '教学楼', '导航'],
    content: ['空教室实时查询', '教室一周占用表', '全校教室大全检索', '分步路线指引', '高德地图定位'],
  },
  physicalTest: {
    keywords: ['体测', '跑步', '八百', '一千', '立定跳远', '肺活量', '体质'],
    content: ['体测成绩计算', '大一到大四保存记录', '总分等级评定'],
  },
  budget: {
    keywords: ['记账', '生活费', '花钱', '账单', '收支', '消费', '存钱'],
    content: ['随手记账', '微信支付宝账单导入', '奖学金收入', '月度统计图表', '成就徽章'],
  },
  studentId: {
    keywords: ['学号', '新生', '查询学号', '录取'],
    content: ['凭录取信息查学号', '新生报到指引'],
  },
  canteen: {
    keywords: ['食堂', '空座', '人多吗', '吃饭', '就餐', '档口'],
    content: ['各食堂实时空座率', '就餐高峰提示', '档口菜单菜价'],
  },
  whatToEat: {
    keywords: ['吃什么', '吃饭', '美食推荐', '随机', '选择困难'],
    content: ['按食堂/口味筛选菜品', '随机推荐今天吃什么'],
  },
  foodWheel: {
    keywords: ['轮盘', '转盘', '随机', '抽奖', '吃什么'],
    content: ['美食转盘随机抽取'],
  },
  quiz: {
    keywords: ['问答', '答题', '校史', '知识', '测试'],
    content: ['福star知识题库', '校史校情问答'],
  },
  buildingMatch: {
    keywords: ['配对', '翻牌', '记忆', '新旧楼名', '游戏'],
    content: ['教学楼新旧名称配对'],
  },
  leaderTest: {
    keywords: ['校领导', '人格测试', '趣味测试'],
    content: ['测你像哪位校领导'],
  },
  timetable: {
    keywords: ['课表', '课程表', '上课时间', '周次', '下学期'],
    content: ['班级/教师/教室课表', '预览下学期', '当前周高亮'],
  },
  courseStats: {
    keywords: ['数据', '统计', '热度', '洞察', '排课'],
    content: ['教室/教师/课程热度排行', '近七学期趋势'],
  },
  tiebaSentiment: {
    keywords: ['贴吧', '舆情', '热帖', '论坛', '讨论'],
    content: ['福建师范大学吧热帖', '话题情绪分析'],
  },
  contributors: {
    keywords: ['贡献者', '开发者', '致谢', '版本历史', '更新日志'],
    content: ['代码贡献者词云', '版本更新历史'],
  },
}

/** 应用 id → 检索文档 */
export const searchDocs = apps.map((a) => ({
  ...a,
  keywords: EXTRA[a.id]?.keywords || [],
  content: EXTRA[a.id]?.content || [],
}))

/**
 * 检索：支持多关键词（空格拆分，全部需命中），
 * 返回 { app, score, hits[] } 按 score 降序。
 */
export function searchApps(query) {
  const q = query.trim().toLowerCase()
  if (!q) return searchDocs.map((app) => ({ app, score: 0, hits: [] }))
  const terms = q.split(/\s+/).filter(Boolean)
  const results = []
  for (const app of searchDocs) {
    let total = 0
    const hits = []
    let allMatched = true
    for (const t of terms) {
      let s = 0
      let hitLabel = ''
      if (app.title.toLowerCase().includes(t)) { s += 3; hitLabel = app.title }
      const kw = app.keywords.find((k) => k.toLowerCase().includes(t))
      if (kw) { s += kw.toLowerCase() === t ? 2.5 : 2; hitLabel = hitLabel || kw }
      if (app.desc.toLowerCase().includes(t)) { s += 1.5; hitLabel = hitLabel || t }
      const ct = app.content.find((c) => c.toLowerCase().includes(t))
      if (ct) { s += 1; hitLabel = hitLabel || ct }
      if (s === 0) { allMatched = false; break }
      total += s
      if (hitLabel && !hits.includes(hitLabel)) hits.push(hitLabel)
    }
    if (allMatched && total > 0) results.push({ app, score: total, hits: hits.slice(0, 3) })
  }
  return results.sort((a, b) => b.score - a.score)
}
