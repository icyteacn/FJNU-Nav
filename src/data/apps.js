/**
 * 应用注册表（单一数据源）
 * ---------------------------------------------------------------------------
 * 首页应用网格与「应用分类」面板都从本数组渲染。
 * 新增一个应用页面：
 *   1. 在 src/views/ 新建视图组件（接收 @open / @back 事件）
 *   2. 在本文件追加一项 { id, title, titleEn, desc, descEn, icon, color, group, groupEn }
 *   3. 在 src/router.js 的 VIEWS 注册表中登记 id → 组件
 * 详见 README「二次开发：新增应用」。
 */
export const apps = [
  { id: 'orientationSchedule', title: '日程助手', titleEn: 'Orientation Schedule', desc: '新生入学教育日程 · 智能提醒 · 准备清单', descEn: 'Orientation schedules, reminders & checklists', icon: '📅', color: '#1565c0', group: '新生', groupEn: 'Newcomer' },
  { id: 'graduatePlan', title: '研究生服务', titleEn: 'Graduate Services', desc: '培养方案 / 学术日历 / 常用资源 / 研究生专属服务', descEn: 'Programs, calendars & resources for postgrads', icon: '🎓', color: '#6a1b9a', group: '服务', groupEn: 'Services' },
  { id: 'timetable', title: '课程表', titleEn: 'Timetable', desc: '查看班级、教室与教师课表，支持预览下学期', descEn: 'View class, room & teacher schedules', icon: '📚', color: '#1565c0', group: '学习', groupEn: 'Study' },
  { id: 'calendar', title: '校历', titleEn: 'Academic Calendar', desc: '查看每学期校历与放假安排', descEn: 'View academic calendar & holidays', icon: '🗓️', color: '#f9a825', group: '学习', groupEn: 'Study' },
  { id: 'importer', title: '课表导入器', titleEn: 'Course Importer', desc: '粘贴课表即解析存本机，解锁免班级查课表', descEn: 'Paste to import schedule, query without class', icon: '📥', color: '#0f766e', group: '学习', groupEn: 'Study' },
  { id: 'classroomNav', title: '教室导航', titleEn: 'Room Navigator', desc: '实时空教室查询、教室占用表与分步路线', descEn: 'Find empty rooms, schedules & directions', icon: '🗺️', color: '#00695c', group: '学习', groupEn: 'Study' },
  { id: 'focus', title: '番茄钟', titleEn: 'Focus Timer', desc: '经典/深度/冲刺三预设 + 艾宾浩斯复习排期', descEn: 'Pomodoro presets & spaced-repetition plan', icon: '🍅', color: '#e11d48', group: '学习', groupEn: 'Study' },
  { id: 'campusNews', title: '校园动态', titleEn: 'Campus News', desc: '教务处官方通知与动态实时同步', descEn: 'Real-time Academic Affairs notices', icon: '📰', color: '#d81b60', group: '学习', groupEn: 'Study' },
  { id: 'buildingGallery', title: '楼宇图鉴', titleEn: 'Building Gallery', desc: '真实排课数据生成：楼层房间格子图，点房查占用', descEn: 'Real schedule data: floor maps & room status', icon: '🏢', color: '#b63a46', group: '学习', groupEn: 'Study' },
  { id: 'courseStats', title: '数据洞察', titleEn: 'Course Insights', desc: '从近7学期排课数据看教室/教师/课程热度', descEn: 'Analytics from course scheduling data', icon: '📈', color: '#00838f', group: '学习', groupEn: 'Study' },
  { id: 'studentId', title: '新生学号查询', titleEn: 'Student ID Lookup', desc: '凭录取信息查询本人学号', descEn: 'Look up student ID from admission info', icon: '📋', color: '#0277bd', group: '新生', groupEn: 'Newcomer' },
  { id: 'physicalTest', title: '体测成绩计算器', titleEn: 'PE Test Calculator', desc: '保存并计算大一到大四体测成绩', descEn: 'Calculate PE test scores Year 1-4', icon: '🏃', color: '#ef6c00', group: '健康', groupEn: 'Health' },
  { id: 'officialSites', title: '学校官网', titleEn: 'University Portal', desc: '福建师范大学官方网站与各学院官网大全', descEn: 'Official FJNU website and college portals', icon: '🏯', color: '#c62828', group: '服务', groupEn: 'Services' },
  { id: 'assistant', title: '智能助手', titleEn: 'AI Assistant', desc: '说一句话就能办事：查课表、找空教室、加日程、直达服务', descEn: 'One sentence to get things done', icon: '🤖', color: '#1b66c9', group: '服务', groupEn: 'Services' },
  { id: 'data', title: '数据管家', titleEn: 'Data Manager', desc: '网关地址一键切线上版 + 本机备份恢复 + 存储用量', descEn: 'Gateway switch, backup/restore & storage', icon: '🗄️', color: '#0f766e', group: '服务', groupEn: 'Services' },
  { id: 'skills', title: '技能市场', titleEn: 'Skill Market', desc: '27 条工作流卡片化：分类搜索、使用统计、一键运行', descEn: 'Workflows as cards: search, stats, run', icon: '🧩', color: '#2563eb', group: '服务', groupEn: 'Services' },
  { id: 'insights', title: '社区洞察', titleEn: 'Insights', desc: '评论趋势、分区占比、热词与治理健康度的可视化看板', descEn: 'Comment trends, tags & governance board', icon: '📈', color: '#0f766e', group: '服务', groupEn: 'Services' },
  { id: 'rebrand', title: '换校向导', titleEn: 'Rebrand Wizard', desc: '一键换校可视化：品牌实时预览、9 套主题、导出配置脚本直改', descEn: 'One-click rebrand preview', icon: '🔁', color: '#7c3aed', group: '服务', groupEn: 'Services' },
  { id: 'jobs', title: '求职招聘', titleEn: 'Jobs', desc: '勤工俭学/实习岗位 + 画像匹配 + 活动报名', descEn: 'Part-time/intern jobs matched to your profile', icon: '💼', color: '#b45309', group: '服务', groupEn: 'Services' },
  { id: 'compare', title: '为什么选我', titleEn: 'Why Us', desc: 'vs 官网/小程序/通用大模型三段对比 + 防御问答', descEn: 'How we differ, with evidence', icon: '⚔️', color: '#b91c1c', group: '服务', groupEn: 'Services' },
  { id: 'flywheel', title: '协作飞轮', titleEn: 'Flywheel', desc: '双 Agent 可视化 + AI 治理日报 + 争议选题', descEn: 'Two-agent flywheel made visible', icon: '🔄', color: '#6d28d9', group: '服务', groupEn: 'Services' },
  { id: 'transplant', title: '换校移植', titleEn: 'Transplant', desc: '3 插槽 + 工作流可移植矩阵 + 两校验证', descEn: 'Rebrand slots & portability matrix', icon: '🔁', color: '#0e7490', group: '服务', groupEn: 'Services' },
  { id: 'profile', title: '我的画像', titleEn: 'My Profile', desc: '学院技能画像 + 行为可解释 + 推送预览', descEn: 'Your profile, explainable', icon: '🧬', color: '#7c3aed', group: '服务', groupEn: 'Services' },
  { id: 'aboutagent', title: '关于智能体', titleEn: 'About Agent', desc: '架构五层、三模式、双 Agent 飞轮与现场演示引导', descEn: 'Architecture, modes, flywheel & demo guide', icon: '🤖', color: '#0891b2', group: '服务', groupEn: 'Services' },
  { id: 'contributors', title: '贡献者墙', titleEn: 'Contributors', desc: '词云致敬每一位代码贡献者', descEn: 'A word cloud honoring our contributors', icon: '🎖️', color: '#bf360c', group: '服务', groupEn: 'Services' },
  { id: 'reminder', title: '提醒中心', titleEn: 'Reminders', desc: '定时提醒引擎：页内弹窗+桌面通知+提示音，与智能体日程打通', descEn: 'Timer engine with toast & notification', icon: '⏰', color: '#d97706', group: '生活', groupEn: 'Life' },
  { id: 'campusWall', title: '校园墙', titleEn: 'Campus Wall', desc: '发帖吐槽、失物招领、求助美食，匿名互动全员可见', descEn: 'Anonymous posts, lost & found, help & food', icon: '🧱', color: '#ea580c', group: '生活', groupEn: 'Life' },
  { id: 'messages', title: '站内私信', titleEn: 'Messages', desc: '点对点私聊：会话草稿保留、未读提醒、联系人推荐', descEn: 'Direct messages with drafts & unread badges', icon: '💬', color: '#7c3aed', group: '生活', groupEn: 'Life' },
  { id: 'canteen', title: '食堂空座率', titleEn: 'Cafeteria Status', desc: '各食堂实时空座人数与就餐高峰提示', descEn: 'Real-time seating & peak hours', icon: '🍚', color: '#d84315', group: '生活', groupEn: 'Life' },
  { id: 'whatToEat', title: '今天吃什么', titleEn: 'What to Eat', desc: '是啊，吃什么', descEn: "Can't decide? Let us pick!", icon: '🍲', color: '#f4511e', group: '生活', groupEn: 'Life' },
  { id: 'budget', title: '生活费计数器', titleEn: 'Budget Tracker', desc: '收支随手记，月底不吃土 · 支持奖学金收入', descEn: 'Track income & expenses easily', icon: '💰', color: '#2e7d32', group: '生活', groupEn: 'Life' },
  { id: 'tiebaSentiment', title: '贴吧舆情', titleEn: 'Tieba Sentiment', desc: '福建师范大学吧热帖与话题舆情分析', descEn: 'Sentiment analysis from FJNU Tieba', icon: '💬', color: '#4527a0', group: '生活', groupEn: 'Life' },
  { id: 'quiz', title: '福star知多少', titleEn: 'FJNU Quiz', desc: '福star知识问答小游戏，测测你的校史功底', descEn: 'Test your knowledge of FJNU', icon: '🧠', color: '#5e35b1', group: '游戏', groupEn: 'Games' },
  { id: 'buildingMatch', title: '教学楼速配', titleEn: 'Building Match', desc: '翻牌配对教学楼新旧名称，测测你的记忆', descEn: 'Match old & new building names', icon: '🃏', color: '#00897b', group: '游戏', groupEn: 'Games' },
  { id: 'foodWheel', title: '美食轮盘', titleEn: 'Food Wheel', desc: '食堂美食转盘，随机抽一个开吃', descEn: "Spin the wheel for today's meal", icon: '🎠', color: '#fb8c00', group: '游戏', groupEn: 'Games' },
  { id: 'leaderTest', title: '校领导测试', titleEn: 'Leader Personality Test', desc: '测出你像哪位福建师范大学校领导', descEn: 'Which FJNU leader are you most like?', icon: '👔', color: '#ad1457', group: '游戏', groupEn: 'Games' }
]

export const appGroups = ['学习', '新生', '健康', '服务', '生活', '游戏']
export const appGroupsEn = ['Study', 'Newcomer', 'Health', 'Services', 'Life', 'Games']

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
