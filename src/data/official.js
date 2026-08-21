export const officialGroups = [
  {
    name: '研究生服务（重点）',
    icon: '🎓',
    sites: [
      { name: '研究生信息管理系统', url: 'https://gedu.fjnu.edu.cn/cas/login?service=https://gedu.fjnu.edu.cn', desc: '研究生培养 / 选课 / 成绩 / 论文管理（需登录）', featured: true },
      { name: '研究生院', url: 'https://yjsy.fjnu.edu.cn', desc: '研究生招生 / 培养 / 学位 / 管理制度' },
      { name: '研究生招生', url: 'https://yjsy.fjnu.edu.cn/zs/list.htm', desc: '招生简章 / 专业目录 / 复试调剂' },
      { name: '学位论文', url: 'https://yjsy.fjnu.edu.cn/xwgl/list.htm', desc: '论文开题 / 答辩 / 查重 / 学位申请' }
    ]
  },
  {
    name: '信息化与服务',
    icon: '🖥️',
    sites: [
      { name: '福Star VPN 服务', url: 'https://vpn3.fjnu.edu.cn/auth/login?returnUrl=https://zhifu-cnki-net-s.vpn3.fjnu.edu.cn/', desc: '校园 VPN · 校外访问知网等学术资源', featured: true },
      { name: '福Star 智慧校园', url: 'https://fstar.fjnu.edu.cn', desc: '校园卡 / 食堂人流量 / 办事服务一站式入口' },
      { name: '校园邮件系统', url: 'https://mail.fjnu.edu.cn', desc: '学生邮箱 Webmail · 账号：学号@fjnu.edu.cn' },
      { name: '信息化建设与管理办公室', url: 'https://xxhb.fjnu.edu.cn/main.htm', desc: '网络 / 账号 / 智慧校园' }
    ]
  },
  {
    name: '学校主站与新闻',
    icon: '🏛️',
    sites: [
      { name: '福建师范大学官网', url: 'https://www.fjnu.edu.cn', desc: '学校主站，校情总览' },
      { name: '师大要闻', url: 'https://www.fjnu.edu.cn/xxgk/sdyw.htm', desc: '师大要闻 / 部处动态 / 学院动态' }
    ]
  },
  {
    name: '教务与教学',
    icon: '📚',
    sites: [
      { name: '教务处', url: 'https://jwc.fjnu.edu.cn', desc: '通知公告 / 教学日历 / 培养方案' },
      { name: '新版教务系统', url: 'https://jwglxt.fjnu.edu.cn', desc: '选课 / 成绩 / 课表查询（需登录）' },
      { name: '教学云平台', url: 'https://fjnu.zlgc2.chaoxing.com', desc: '在线课程 / 教学资源' }
    ]
  },
  {
    name: '招生与继续教育',
    icon: '📋',
    sites: [
      { name: '本科招生网', url: 'https://zsb.fjnu.edu.cn', desc: '招生简章 / 专业目录 / 录取查询' },
      { name: '继续教育招生', url: 'https://wjzy.fjnu.edu.cn', desc: '成教 / 自考 / 同等学力招生' },
      { name: '创新创业学院', url: 'https://cyxy.fjnu.edu.cn', desc: '创新创业教育 / 大赛 / 实践基地' }
    ]
  },
  {
    name: '图书馆与资源',
    icon: '📖',
    sites: [
      { name: '图书馆', url: 'https://library.fjnu.edu.cn/main.htm', desc: '又玄图书馆 · 馆藏检索 / 数据库 / 自习座位预约' },
      { name: '中国知网（VPN）', url: 'https://vpn3.fjnu.edu.cn/auth/login?returnUrl=https://zhifu-cnki-net-s.vpn3.fjnu.edu.cn/', desc: '通过 VPN 校外访问知网学术资源' }
    ]
  },
  {
    name: '官方新媒体',
    icon: '📱',
    sites: [
      { name: '福建师范大学官方微博', url: 'https://weibo.com/fjnu1907', desc: '官方微博 · 校园动态实时发布' },
      { name: '福建师范大学官方微信', url: 'https://mp.weixin.qq.com/s/ibNLp1NsS5Ku-go4WeH_oA', desc: '官方微信公众号 · 深度推文与通知' },
      { name: '共青团福建师范大学委员会抖音', url: 'https://www.douyin.com/user/MS4wLjABAAAA8gUpav6WigJEMTmHEVS2cq-_nBlU_ziOjmbG_KrVYVY?from_tab_name=main', desc: '共青团官方抖音 · 校园短视频' }
    ]
  },
  {
    name: '附属与地标',
    icon: '🌳',
    sites: [
      { name: '附属中学', url: 'https://sdfz.fjnu.edu.cn', desc: '福建师大附中 · 省级示范校' },
      { name: '附属小学', url: 'https://aps.fjnu.edu.cn', desc: '福建师大附小 · 省级示范校' },
      { name: '实验幼儿园', url: 'https://kid.fjnu.edu.cn', desc: '福建师大实验幼儿园 · 省级示范园' }
    ]
  }
]

/**
 * 学院官网清单
 * 依据福建师范大学官网「学院」目录与招生网「学院巡礼」整理；category 用于官网页按学科分类展示。
 */
export const colleges = [
  // 人文社科
  { name: '教育学院', url: 'https://jyxy.fjnu.edu.cn/main.htm', category: '人文社科' },
  { name: '教师教育学院', url: 'https://jsjyxy.fjnu.edu.cn/', category: '人文社科' },
  { name: '心理学院', url: 'https://psy.fjnu.edu.cn/main.htm', category: '人文社科' },
  { name: '经济学院', url: 'https://jjxy.fjnu.edu.cn', category: '人文社科' },
  { name: '法学院', url: 'https://fxy.fjnu.edu.cn', category: '人文社科' },
  { name: '纪检监察学院', url: 'https://jjjcxy.fjnu.edu.cn', category: '人文社科' },
  { name: '马克思主义学院', url: 'https://mkszyxy.fjnu.edu.cn/mainm.htm', category: '人文社科' },
  { name: '文学院', url: 'https://wxy.fjnu.edu.cn', category: '人文社科' },
  { name: '外国语学院', url: 'https://cfl.fjnu.edu.cn', category: '人文社科' },
  { name: '传播学院', url: 'https://cbxy.fjnu.edu.cn', category: '人文社科' },
  { name: '社会历史学院', url: 'https://csh.fjnu.edu.cn', category: '人文社科' },
  { name: '文化旅游与公共管理学院', url: 'https://wlgg.fjnu.edu.cn', category: '人文社科' },
  { name: '海外教育学院', url: 'https://iccs.fjnu.edu.cn', category: '人文社科' },
  // 理工
  { name: '数学与统计学院', url: 'https://math.fjnu.edu.cn', category: '理工' },
  { name: '计算机与网络空间安全学院', url: 'https://ccs.fjnu.edu.cn', category: '理工' },
  { name: '物理与能源学院', url: 'https://cpe.fjnu.edu.cn', category: '理工' },
  { name: '光电与信息工程学院', url: 'https://paee.fjnu.edu.cn', category: '理工' },
  { name: '化学与材料学院', url: 'https://chem.fjnu.edu.cn', category: '理工' },
  { name: '环境与资源学院', url: 'https://env.fjnu.edu.cn', category: '理工' },
  { name: '地理科学学院', url: 'https://geo.fjnu.edu.cn', category: '理工' },
  { name: '生命科学学院', url: 'https://life.fjnu.edu.cn', category: '理工' },
  // 艺术与体育
  { name: '音乐学院', url: 'https://music.fjnu.edu.cn', category: '艺术与体育' },
  { name: '美术学院', url: 'https://art.fjnu.edu.cn', category: '艺术与体育' },
  { name: '体育科学学院', url: 'https://tky.fjnu.edu.cn', category: '艺术与体育' },
  // 继续教育与合作办学
  { name: '网络与继续教育学院', url: 'https://wjzy.fjnu.edu.cn', category: '继续教育' },
  { name: '海峡柔性电子学院', url: 'https://sife.fjnu.edu.cn', category: '合作办学' },
  { name: '协和学院', url: 'https://xiehe.fjnu.edu.cn', category: '合作办学' }
]

export const emergency = {
  campusPolice: '保卫处（旗山）0591-22867110',
  gatePhone: '仓山校区保卫处 0591-83465110',
  health: '校医院 0591-22867373',
  switchboard: '总机 0591-22867412'
}
