// 文件路径: /fjnu-nav/mp-weixin/data/apps.js
// 全量应用网格：与网站 src/data/apps.js 注册表一一对应。
// native:true 本端内置直接打开；其余复制网页版链接。
const APP_GROUPS = [
  {
    group: '服务',
    apps: [
      { id: 'assistant', title: '智能助手', icon: '🤖', color: '#1b66c9', url: '/#/assistant', desc: '说一句话就能办事' },
      { id: 'graduatePlan', title: '研究生服务', icon: '🎓', color: '#6a1b9a', url: '/#/graduatePlan', desc: '培养方案/学术日历' },
      { id: 'jobs', title: '求职招聘', icon: '💼', color: '#b45309', url: '/#/jobs', desc: '勤工俭学/实习岗位' },
      { id: 'officialSites', title: '学校官网', icon: '🏯', color: '#c62828', url: '/#/officialSites', desc: '官网与学院门户大全' },
      { id: 'skills', title: '技能市场', icon: '🧩', color: '#2563eb', url: '/#/skills', desc: '27 条工作流卡片' },
      { id: 'data', title: '数据管家', icon: '🗄️', color: '#0f766e', url: '/#/data', desc: '备份恢复/网关切换' },
      { id: 'branchWork', title: '团支部工作台', icon: '🚩', color: '#c62828', url: '/#/branchWork', desc: '三会两制一课留痕' },
    ],
  },
  {
    group: '学习',
    apps: [
      { id: 'timetable', title: '课程表', icon: '📚', color: '#1565c0', native: true, tab: '/pages/schedule/schedule', desc: '班级/教室/教师课表' },
      { id: 'importer', title: '课表导入器', icon: '📥', color: '#0f766e', url: '/#/importer', desc: '粘贴课表即解析' },
      { id: 'classroomNav', title: '教室导航', icon: '🗺️', color: '#00695c', url: '/#/classroomNav', desc: '空教室查询与路线' },
      { id: 'calendar', title: '校历', icon: '🗓️', color: '#f9a825', url: '/#/calendar', desc: '学期校历与放假' },
      { id: 'focus', title: '番茄钟', icon: '🍅', color: '#e11d48', url: '/#/focus', desc: '专注计时+复习排期' },
      { id: 'campusNews', title: '校园动态', icon: '📰', color: '#d81b60', url: '/#/campusNews', desc: '教务处通知实时同步' },
      { id: 'buildingGallery', title: '楼宇图鉴', icon: '🏢', color: '#b63a46', url: '/#/buildingGallery', desc: '楼层房间格子图' },
      { id: 'courseStats', title: '数据洞察', icon: '📈', color: '#00838f', url: '/#/courseStats', desc: '排课热度分析' },
    ],
  },
  {
    group: '新生',
    apps: [
      { id: 'orientationSchedule', title: '日程助手', icon: '📅', color: '#1565c0', native: true, tab: '/pages/events/events', desc: '官方日程+自定义' },
      { id: 'studentId', title: '学号查询', icon: '📋', color: '#0277bd', url: '/#/studentId', desc: '录取信息查学号' },
    ],
  },
  {
    group: '健康',
    apps: [
      { id: 'physicalTest', title: '体测计算器', icon: '🏃', color: '#ef6c00', url: '/#/physicalTest', desc: '大一到大四体测成绩' },
    ],
  },
  {
    group: '生活',
    apps: [
      { id: 'reminder', title: '提醒中心', icon: '⏰', color: '#d97706', url: '/#/reminder', desc: '定时提醒引擎' },
      { id: 'canteen', title: '食堂空座率', icon: '🍚', color: '#d84315', url: '/#/canteen', desc: '实时空座与高峰' },
      { id: 'whatToEat', title: '今天吃什么', icon: '🍲', color: '#f4511e', url: '/#/whatToEat', desc: '帮你做决定' },
      { id: 'budget', title: '生活费计数器', icon: '💰', color: '#2e7d32', url: '/#/budget', desc: '收支随手记' },
      { id: 'campusWall', title: '校园墙', icon: '🧱', color: '#ea580c', url: '/#/campusWall', desc: '匿名互动' },
      { id: 'messages', title: '站内私信', icon: '💬', color: '#7c3aed', url: '/#/messages', desc: '点对点私聊' },
      { id: 'tiebaSentiment', title: '贴吧舆情', icon: '💬', color: '#4527a0', url: '/#/tiebaSentiment', desc: '贴吧热帖分析' },
    ],
  },
  {
    group: '游戏',
    apps: [
      { id: 'foodWheel', title: '美食轮盘', icon: '🎠', color: '#fb8c00', url: '/#/foodWheel', desc: '随机抽一个开吃' },
      { id: 'quiz', title: '福star知多少', icon: '🧠', color: '#5e35b1', url: '/#/quiz', desc: '校史知识问答' },
      { id: 'buildingMatch', title: '教学楼速配', icon: '🃏', color: '#00897b', url: '/#/buildingMatch', desc: '新旧楼名翻牌配对' },
      { id: 'leaderTest', title: '校领导测试', icon: '👔', color: '#ad1457', url: '/#/leaderTest', desc: '你像哪位校领导' },
    ],
  },
  {
    group: '关于',
    apps: [
      { id: 'rebrand', title: '换校向导', icon: '🔁', color: '#7c3aed', url: '/#/rebrand', desc: '一键换校可视化' },
      { id: 'transplant', title: '换校移植', icon: '🔁', color: '#0e7490', url: '/#/transplant', desc: '可移植矩阵' },
      { id: 'compare', title: '为什么选我', icon: '⚔️', color: '#b91c1c', url: '/#/compare', desc: '三段对比' },
      { id: 'flywheel', title: '协作飞轮', icon: '🔄', color: '#6d28d9', url: '/#/flywheel', desc: '双 Agent 可视化' },
      { id: 'insights', title: '社区洞察', icon: '📈', color: '#0f766e', url: '/#/insights', desc: '治理健康度看板' },
      { id: 'profile', title: '我的画像', icon: '🧬', color: '#7c3aed', url: '/#/profile', desc: '行为可解释' },
      { id: 'aboutagent', title: '关于智能体', icon: '🤖', color: '#0891b2', url: '/#/aboutagent', desc: '架构五层三模式' },
      { id: 'contributors', title: '贡献者墙', icon: '🎖️', color: '#bf360c', url: '/#/contributors', desc: '致敬贡献者' },
    ],
  },
];

module.exports = { APP_GROUPS };
