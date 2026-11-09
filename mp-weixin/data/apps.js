// 文件路径: /fjnu-nav/mp-weixin/data/apps.js
// 导航网格数据（与网站 apps.js 同源精选；native:true 本端可用，false 复制网页链接）
const APP_GROUPS = [
  {
    group: '学习',
    apps: [
      { id: 'timetable', title: '课程表', icon: '📚', color: '#1565c0', native: true, tab: '/pages/schedule/schedule' },
      { id: 'events', title: '日程活动', icon: '📅', color: '#0f766e', native: true, tab: '/pages/events/events' },
      { id: 'classroomNav', title: '教室导航', icon: '🗺️', color: '#00695c', url: '/#/classroomNav', desc: '空教室查询与路线' },
      { id: 'calendar', title: '校历', icon: '🗓️', color: '#f9a825', url: '/#/calendar', desc: '学期校历与放假安排' },
      { id: 'importer', title: '课表导入', icon: '📥', color: '#0f766e', url: '/#/importer', desc: '粘贴课表即解析' },
      { id: 'gpa', title: '学分绩点', icon: '📈', color: '#0284c7', url: '/#/courseCredits', desc: '学分绩点核算' },
    ],
  },
  {
    group: '生活',
    apps: [
      { id: 'canteen', title: '食堂空座率', icon: '🍽️', color: '#ea580c', url: '/#/canteen', desc: '实时空座与高峰' },
      { id: 'whatToEat', title: '今天吃什么', icon: '🍜', color: '#e76f51', url: '/#/whatToEat', desc: '帮你做决定' },
      { id: 'budget', title: '生活费', icon: '🧮', color: '#0e7490', url: '/#/budget', desc: '收支随手记' },
      { id: 'reminder', title: '提醒中心', icon: '⏰', color: '#d97706', url: '/#/reminder', desc: '定时提醒' },
      { id: 'physical', title: '体测计算', icon: '💪', color: '#16a34a', url: '/#/physical', desc: '体测成绩' },
    ],
  },
  {
    group: '服务',
    apps: [
      { id: 'assistant', title: '智能助手', icon: '🤖', color: '#1b66c9', url: '/#/assistant', desc: '一句话办事' },
      { id: 'campusNews', title: '校园动态', icon: '📢', color: '#e11d48', url: '/#/campusNews', desc: '教务处通知' },
      { id: 'campus', title: '校园导览', icon: '🏫', color: '#7c3aed', url: '/#/campus', desc: '校区楼宇地图' },
      { id: 'official', title: '官方链接', icon: '🔗', color: '#475569', url: '/#/official', desc: '教务/学工/图书馆' },
      { id: 'jobs', title: '就业信息', icon: '💼', color: '#9a3412', url: '/#/jobs', desc: '招聘宣讲' },
      { id: 'leaders', title: '通讯录', icon: '☎️', color: '#0369a1', url: '/#/leaders', desc: '学院部门电话' },
    ],
  },
  {
    group: '新生',
    apps: [
      { id: 'orientation', title: '新生日程', icon: '🎓', color: '#dc2626', url: '/#/orientationSchedule', desc: '入学报到安排' },
      { id: 'campusLife', title: '校园生活', icon: '🧳', color: '#0d9488', url: '/#/campusLife', desc: '生活指南' },
      { id: 'quiz', title: '入学测试', icon: '📝', color: '#65a30d', url: '/#/quiz', desc: '校情知识问答' },
    ],
  },
];
module.exports = { APP_GROUPS };
