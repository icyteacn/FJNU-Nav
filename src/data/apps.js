/**
 * 应用注册表（单一数据源）
 * ---------------------------------------------------------------------------
 * 首页应用网格与「应用分类」面板都从本数组渲染。
 * 新增一个应用页面：
 *   1. 在 src/views/ 新建视图组件（接收 @open / @back 事件）
 *   2. 在本文件追加一项 { id, title, desc, icon, color, group }
 *   3. 在 src/router.js 的 VIEWS 注册表中登记 id → 组件
 * 详见 README「二次开发：新增应用」。
 */
export const apps = [
  { id: 'graduatePlan', title: '研究生服务', desc: '培养方案 / 学术日历 / 常用资源 / 研究生专属服务', icon: '🎓', color: '#6a1b9a', group: '服务', },
  { id: 'officialSites', title: '学校官网', desc: '福建师范大学官方网站与各学院官网大全', icon: '🏯', color: '#c62828', group: '服务', },
  { id: 'campusNews', title: '校园动态', desc: '教务处官方通知与动态实时同步', icon: '📰', color: '#d81b60', group: '学习', },
  { id: 'calendar', title: '校历', desc: '查看每学期校历与放假安排', icon: '🗓️', color: '#f9a825', group: '学习', },
  { id: 'classroomNav', title: '教室导航', desc: '实时空教室查询、教室占用表与分步路线', icon: '🗺️', color: '#00695c', group: '学习', },
  { id: 'physicalTest', title: '体测成绩计算器', desc: '保存并计算大一到大四体测成绩', icon: '🏃', color: '#ef6c00', group: '健康', },
  { id: 'budget', title: '生活费计数器', desc: '收支随手记，月底不吃土 · 支持奖学金收入', icon: '💰', color: '#2e7d32', group: '生活', },
  { id: 'studentId', title: '新生学号查询', desc: '凭录取信息查询本人学号', icon: '📋', color: '#0277bd', group: '新生', },
  { id: 'canteen', title: '食堂空座率', desc: '各食堂实时空座人数与就餐高峰提示', icon: '🍚', color: '#d84315', group: '生活', },
  { id: 'whatToEat', title: '今天吃什么', desc: '是啊，吃什么', icon: '🍲', color: '#f4511e', group: '生活', },
  { id: 'foodWheel', title: '美食轮盘', desc: '食堂美食转盘，随机抽一个开吃', icon: '🎠', color: '#fb8c00', group: '游戏', },
  { id: 'quiz', title: '福师大知多少', desc: '福师大知识问答小游戏，测测你的校史功底', icon: '🧠', color: '#5e35b1', group: '游戏', },
  { id: 'buildingMatch', title: '教学楼速配', desc: '翻牌配对教学楼新旧名称，测测你的记忆', icon: '🃏', color: '#00897b', group: '游戏', },
  { id: 'leaderTest', title: '校领导测试', desc: '测出你像哪位福建师范大学校领导', icon: '👔', color: '#ad1457', group: '游戏', },
  { id: 'timetable', title: '课程表', desc: '查看班级、教室与教师课表，支持预览下学期', icon: '📚', color: '#1565c0', group: '学习', },
  { id: 'courseStats', title: '数据洞察', desc: '从近7学期排课数据看教室/教师/课程热度', icon: '📈', color: '#00838f', group: '学习', },
  { id: 'tiebaSentiment', title: '贴吧舆情', desc: '福建师范大学吧热帖与话题舆情分析', icon: '💬', color: '#4527a0', group: '生活', },
  { id: 'contributors', title: '贡献者墙', desc: '词云致敬每一位代码贡献者', icon: '🎖️', color: '#bf360c', group: '服务', }
]

export const appGroups = ['学习', '新生', '健康', '服务', '生活', '游戏']

/** 分组主题色（分类面板分组圆点 / 分组标签统一取色） */
export const groupColors = {
  学习: '#1565c0',
  新生: '#0277bd',
  健康: '#2e7d32',
  服务: '#c62828',
  生活: '#d84315',
  游戏: '#5e35b1'
}

export const campusStats = {
  campuses: 2,
  colleges: 28,
  majors: 84,
  apps: apps.length
}