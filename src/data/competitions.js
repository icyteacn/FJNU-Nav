/**
 * 学科竞赛清单与奖学金标准
 * 依据《福建师范大学计算机与网络空间安全学院学生高水平创新创业竞赛实施办法（修订）》（师大计网〔2026〕5号）
 * 供研究生服务「学科竞赛」tab 与综测积累「科研创新」选档联动使用。
 */

/** A类创新创业竞赛清单 */
export const COMPETITIONS_A = [
  { name: '中国国际大学生创新大赛', organizer: '教育部等', local: '福建省大学生创新大赛', scholarship: '国一54分 · 国二36分 · 国三24分 · 省一16分 · 省二12分' },
  { name: '"挑战杯"全国大学生课外学术科技作品竞赛', organizer: '共青团中央等', local: '福建省赛', scholarship: '国一54分 · 国二36分 · 国三24分 · 省一16分 · 省二12分' },
  { name: '"挑战杯"中国大学生创业计划竞赛', organizer: '共青团中央等', local: '福建省赛', scholarship: '国一54分 · 国二36分 · 国三24分 · 省一16分 · 省二12分' },
]

/** B类重点竞赛清单 */
export const COMPETITIONS_B_KEY = [
  { name: '中国研究生创新实践系列大赛', sub: '数学建模 · AI创新 · 网络安全', organizer: '中国学位与研究生教育学会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '数字中国创新大赛', organizer: '数字中国建设峰会组委会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '全国大学生职业规划大赛', organizer: '教育部', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '网络安全学院学生创新资助计划', organizer: '中央网信办指导', scholarship: '立项按B类国家级一等认定', note: '获立项即算国一' },
  { name: '网络空间安全学院开源安全奖励计划', organizer: '中央网信办指导', scholarship: '按B类获奖等级认定' },
  { name: '全国大学生信息安全竞赛', organizer: '教育部信息安全类教指委', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '"强网杯"全国网络安全挑战赛', organizer: '中央网信办等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: 'ACM-ICPC 国际大学生程序设计竞赛', organizer: 'ICPC基金会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国大学生程序设计竞赛（CCPC）', organizer: 'CCPC组委会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '"中国软件杯"大学生软件设计大赛', organizer: '中国软件行业协会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '华为ICT大赛', organizer: '华为技术有限公司', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '全国大学生数字媒体科技作品及创意竞赛', organizer: '中国人工智能学会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国机器人及人工智能大赛', organizer: '中国机器人及人工智能大赛组委会', scholarship: '国一20分 · 国二16分 · 国三12分' },
]

/** B类一般竞赛清单 */
export const COMPETITIONS_B_NORMAL = [
  { name: '全国密码技术竞赛', organizer: '中国密码学会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '全国大学生信息安全与对抗技术竞赛', organizer: '中国兵工学会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '"长城杯"信息安全铁人三项赛', organizer: '中国信息安全测评中心等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '"数信杯"数据安全大赛', organizer: '中国电子信息产业发展研究院等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国大学生服务外包创新创业大赛', organizer: '教育部等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国高校计算机大赛', sub: '天梯赛 · 大数据 · 网络技术', organizer: '全国高等学校计算机教育研究会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国大学生计算机设计大赛', organizer: '中国大学生计算机设计大赛组委会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '百度之星·程序设计大赛', organizer: '百度在线网络技术（北京）有限公司', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '中国好创意暨全国数字艺术设计大赛', organizer: '中国电子视像行业协会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '蓝桥杯全国软件和信息技术专业人才大赛', organizer: '蓝桥杯组委会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '教育信息技术应用创新大赛', organizer: '中国教育技术协会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '全国大学生软件测试大赛', organizer: '全国大学生软件测试大赛组委会等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '国际（美国）大学生数学建模竞赛', organizer: '美国数学及其应用联合会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '全国大学生数学建模竞赛', organizer: '中国工业与应用数学学会', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '海峡两岸信息服务创新大赛', organizer: '福建省工信厅等', scholarship: '国一20分 · 国二16分 · 国三12分' },
  { name: '福建省大学生数据安全大赛', organizer: '福建省教育厅', scholarship: '省级按相应等级认定' },
  { name: '福建省大学生计算科学与智能创新大赛', organizer: '福建省教育厅', scholarship: '省级按相应等级认定' },
]

/** A类竞赛学院奖学金标准（团队奖金，单位：元） */
export const SCHOLARSHIP_A = [
  { level: '国家级', tiers: [
    { rank: '一等奖（金奖）', amount: 30000 },
    { rank: '二等奖（银奖）', amount: 20000 },
    { rank: '三等奖（铜奖）', amount: 10000 },
    { rank: '四等奖（入围奖）', amount: 8000 },
  ]},
  { level: '省级', tiers: [
    { rank: '一等奖', amount: 8000 },
    { rank: '二等奖', amount: 5000 },
    { rank: '三等奖', amount: 3000 },
  ]},
]

/** B类重点竞赛学院奖学金标准（团队奖金，单位：元） */
export const SCHOLARSHIP_B = [
  { level: '国家级', tiers: [
    { rank: '一等奖', amount: 5000 },
    { rank: '二等奖', amount: 3500 },
    { rank: '三等奖', amount: 2000 },
  ]},
  { level: '省级', tiers: [
    { rank: '一等奖', amount: 2000 },
    { rank: '二等奖', amount: 1200 },
    { rank: '三等奖', amount: 600 },
  ]},
]
