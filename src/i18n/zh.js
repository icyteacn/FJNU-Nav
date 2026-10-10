/**
 * 中文语言包（FJNU-Nav · i18n 渐进式覆盖第一梯队）
 * key 规范：区块.子项；英文包 en.js 必须保持同构 key（缺词自动回落本包）
 * 覆盖范围：全局 / 顶栏 / 底部导航 / 首页 / 欢迎页 / 新应用标题
 */
export default {
  common: {
    back: '‹ 返回',
    home: '首页',
    loading: '加载中…',
    empty: '暂无内容',
    confirm: '确认执行',
    cancel: '取消',
    copy: '⧉ 复制',
    copied: '✓ 已复制',
    send: '➤ 发送',
    search: '搜索',
    open: '打开',
    close: '关闭',
    save: '保存',
    delete: '删除',
    offline: '本机模式',
    online: '已连接'
  },
  site: {
    name: 'FJNU 校园导航',
    tagline: '福建师范大学 · 校园服务聚合入口',
    heroSub: '聚合你所需的校园服务',
    legendLive: '官方实时：校园动态 · 校历 · 课程总表（抓自教务处公开页面）',
    legendDemo: '官方通道：学号查询 · 体测成绩 · 个人课表（需统一身份认证）',
    legendTool: '校园工具：食堂 · 空教室 · 吃什么 · 问答 · 轮盘 · 速配'
  },
  nav: {
    home: '首页',
    news: '动态',
    portal: '官网',
    budget: '生活费',
    schedule: '日程',
    rooms: '教室',
    calendar: '校历',
    agent: '智能体'
  },
  header: {
    notice: '查看公告',
    tour: '查看新手引导',
    themeLight: '切换到浅色模式',
    themeDark: '切换到深色模式',
    agentBtn: '智能助手 · 说一句话办事',
    langSwitch: 'Switch to English',
    announcement: '公告'
  },
  home: {
    searchPlaceholder: '说出你的需求：明天有空教室吗、今天吃什么、加个日程…',
    exec: '执行 ›',
    tryLabel: '试试：',
    publicApps: '公开应用',
    quickApps: '高频应用一键直达',
    viewAllCats: '查看全部分类 ›',
    noResult: '没有找到相关内容，试试：奖学金 / 空教室 / 记账',
    appCountHint: '按学习、生活、游戏等分组浏览全部',
    apps: '个应用',
    statsCampus: '大校区',
    statsCollege: '个学院',
    statsMajor: '个本科专业',
    statsApp: '个校园应用',
    about: '关于本站',
    courseInsight: '数据洞察',
    fullStats: '查看完整统计 ›',
    wikiTitle: '校园 Wiki',
    downloadTitle: '课表 App · 安卓版',
    downloadDesc: '独立课表应用，离线可用，仅 1.5MB',
    downloadBtn: '下载 APK ↗'
  },
  welcome: {
    tip: '非官方校园服务聚合演示站 · 数据仅供学习交流',
    enter: '开始使用',
    motto: '校训'
  },
  apps: {
    assistant: '智能助手',
    campusWall: '校园墙',
    skills: '技能市场',
    aboutagent: '关于智能体',
    importer: '课表导入器',
    reminder: '提醒中心',
    insights: '社区洞察',
    rebrand: '换校向导'
  },
  agent: {
    listening: '说出你的需求…',
    thinking: '思考中',
    hint: '按 🎤 说话 · 点卡片按钮直接办事 · 每条回答可溯源',
    localMode: '本地推理',
    cloudMode: '云端推理',
    source: '来源',
    confirmTpl: '即将为你执行：{text}，确认吗？'
  },
  wall: {
    title: '校园墙',
    sub: '论坛 · 求助悬赏 · 资源公示 · 二手拼车',
    post: '✏️ 发帖',
    hot: '🔥 热门',
    new: '⏱ 最新',
    top: '📌 置顶/精华',
    signIn: '📅 签到 +2 积分',
    signed: '✓ 今日已签到'
  },
  visitStats: {
    uv: '独立访客',
    pv: '累计访问',
    note: '本站累计 · Vercount 统计',
    bszTag: '不蒜子实时',
    bszHome: '首页浏览',
    bszSitePv: '站点浏览',
    bszSiteUv: '站点访客',
    bszLoading: '不蒜子统计加载中…',
    bszFail: '不蒜子统计暂不可用，看看其他统计吧'
  }
}
