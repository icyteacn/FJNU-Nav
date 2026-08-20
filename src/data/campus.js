/** 福建师范大学两大校区静态数据（旗山 / 仓山），用于首页「校区」卡片 */
export const campuses = [
  {
    name: '旗山校区',
    alias: '主校区（大学城）',
    address: '福州市闽侯县上街镇乌龙江中大道 18 号',
    postal: '350117',
    desc: '校本部主校区，坐落于福州大学城，绝大部分学院与新生在此就读',
    emoji: '🏢',
    links: [
      { label: '教学楼与教室', app: 'classroomNav' },
      { label: '课程表', app: 'timetable' },
      { label: '食堂', app: 'canteen' }
    ],
    colleges: ['教育学院', '教师教育学院', '心理学院', '经济学院', '法学院', '马克思主义学院', '文学院', '外国语学院', '传播学院', '社会历史学院', '文化旅游与公共管理学院', '体育科学学院', '音乐学院', '美术学院', '数学与统计学院', '计算机与网络空间安全学院', '物理与能源学院', '光电与信息工程学院', '化学与材料学院', '环境与资源学院', '地理科学学院', '生命科学学院', '海外教育学院', '网络与继续教育学院', '海峡柔性电子学院']
  },
  {
    name: '仓山校区',
    alias: '百年老校区',
    address: '福州市仓山区上三路 8 号',
    postal: '350007',
    desc: '百年办学发源地，坐落于长安山麓，古木参天、人文底蕴深厚',
    emoji: '🎓',
    links: [
      { label: '教学楼与教室', app: 'classroomNav' },
      { label: '食堂', app: 'canteen' },
      { label: '今天吃什么', app: 'whatToEat' }
    ],
    colleges: ['网络与继续教育学院', '协和学院（仓山）', '部分研究生培养单位']
  }
]

export const collegeCampusMap = [
  { college: '教育学院', campus: '旗山校区', major: '教育学、学前教育、教育技术学' },
  { college: '教师教育学院', campus: '旗山校区', major: '小学教育、思想政治教育（师范）' },
  { college: '心理学院', campus: '旗山校区', major: '心理学、应用心理学' },
  { college: '经济学院', campus: '旗山校区', major: '经济学、金融学、国际经济与贸易等' },
  { college: '法学院', campus: '旗山校区', major: '法学、纪检监察' },
  { college: '马克思主义学院', campus: '旗山校区', major: '思想政治教育、马克思主义理论' },
  { college: '文学院', campus: '旗山校区', major: '汉语言文学、汉语国际教育、文化产业管理' },
  { college: '外国语学院', campus: '旗山校区', major: '英语、日语、翻译、西班牙语等' },
  { college: '传播学院', campus: '旗山校区', major: '新闻传播学类、播音与主持艺术、广播电视编导' },
  { college: '社会历史学院', campus: '旗山校区', major: '历史学、图书馆学、档案学' },
  { college: '文化旅游与公共管理学院', campus: '旗山校区', major: '旅游管理、行政管理、会展经济与管理等' },
  { college: '体育科学学院', campus: '旗山校区', major: '体育教育、运动训练' },
  { college: '音乐学院', campus: '旗山校区', major: '音乐学、音乐表演' },
  { college: '美术学院', campus: '旗山校区', major: '美术学、设计学类' },
  { college: '数学与统计学院', campus: '旗山校区', major: '数学与应用数学、统计学、数据科学' },
  { college: '计算机与网络空间安全学院', campus: '旗山校区', major: '计算机科学与技术、网络空间安全、软件工程、人工智能' },
  { college: '物理与能源学院', campus: '旗山校区', major: '物理学、材料物理、新能源科学与工程' },
  { college: '光电与信息工程学院', campus: '旗山校区', major: '电子信息类、光电信息科学与工程' },
  { college: '化学与材料学院', campus: '旗山校区', major: '化学、应用化学、材料科学与工程' },
  { college: '环境与资源学院', campus: '旗山校区', major: '环境工程、资源循环科学与工程' },
  { college: '地理科学学院', campus: '旗山校区', major: '地理科学类、生态学' },
  { college: '生命科学学院', campus: '旗山校区', major: '生物科学、生物工程、食品科学与工程' },
  { college: '海外教育学院', campus: '旗山校区', major: '汉语国际教育（国际学生）' },
  { college: '网络与继续教育学院', campus: '仓山校区', major: '成人教育、继续教育' },
  { college: '协和学院', campus: '仓山校区（河西）', major: '独立学院（多学科门类）' }
]

export const landmarks = [
  { name: '又玄图书馆', place: '旗山校区东门旁 · 全国古籍重点保护单位' },
  { name: '星雨湖', place: '旗山校区人文楼旁' },
  { name: '长安山公园', place: '仓山校区 · 百年老校区后山' },
  { name: '校训石', place: '仓山校区 · 镌刻「知明行笃 立诚致广」' }
]