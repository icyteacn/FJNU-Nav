/**
 * 楼宇导航指引生成器
 * ---------------------------------------------------------------------------
 * 为「全校教室大全」中没有详细指引的楼栋生成分步路线与必要介绍。
 * 内容按楼名特征归类（公共教学区 / 学院楼 / 实验楼群 / 体育场馆 / 仓山校区），
 * 只陈述可靠的通用信息（命名规律、所在校区、找教室思路），具体门牌以实地为准。
 */
import { buildings } from './classrooms'

const CAMPUS_URL = (kw) => 'https://www.amap.com/search?query=' + encodeURIComponent('福建师范大学' + kw)

const KNOWN_ZONES = {
  知明: { zone: '旗山校区 · 公共教学区', desc: '校训「知明行笃、立诚致广」依次命名的四栋公共教学楼之一，一层常设自习空间。' },
  笃行: { zone: '旗山校区 · 公共教学区', desc: '公共教学楼群之一，与知明楼相邻，考试周座位紧张。' },
  立诚: { zone: '旗山校区 · 公共教学区', desc: '公共教学楼群之一，多媒体教室为主。' },
  致广: { zone: '旗山校区 · 公共教学区', desc: '公共教学楼群之一，靠近生活区，课间人流较大。' },
  人文楼: { zone: '旗山校区 · 文科组团', desc: '人文社会科学学科楼群，分多号楼，含案例教室与实验室。' },
  理工楼: { zone: '旗山校区 · 理科组团', desc: '理工科学科楼群，分多个编号，实验室与阶梯教室分布其中。' },
  外语楼: { zone: '旗山校区 · 外国语学院', desc: '外国语学院教学楼，配语音室与录音实验室。' },
  计网楼: { zone: '旗山校区 · 计算机与网络空间安全学院', desc: '计算机与网络空间安全学院楼，机房与专业实验室集中于此。' },
  文: { zone: '旗山校区 · 文科组团', desc: '文学院相关教学楼，教室以「文+数字」编号。' },
  邵逸夫: { zone: '旗山校区', desc: '邵逸夫楼，部分公共课程在此上课。' },
  田家炳: { zone: '旗山校区', desc: '田家炳教育书院，教育学类课程与讲座常用场地。' },
  琴房: { zone: '旗山校区 · 音乐学院', desc: '音乐学院琴房区，练习位通常需预约或排队。' },
  音: { zone: '旗山校区 · 音乐学院', desc: '音乐学院教学楼，含琴房与演奏空间。' },
  美院大楼: { zone: '旗山校区 · 美术学院', desc: '美术学院主楼，画室与展厅集中于此。' },
  雕塑楼: { zone: '旗山校区 · 美术学院', desc: '美术学院雕塑方向工作室楼。' },
  成功楼: { zone: '仓山校区', desc: '仓山校区教学楼之一。' },
}

const SPORT_TIP = '体育场馆多为专用场地，进入前请确认是否对个人开放，上课时段优先保证教学使用。'

/** 返回该楼组的导航指引；无匹配时给出通用兜底 */
export function guideOf(bname, sampleRoom = '') {
  const key = bname.replace(/栋$/, '')
  const known = Object.keys(KNOWN_ZONES).find((k) => bname.startsWith(k) || k.startsWith(key))
  if (known) {
    const z = KNOWN_ZONES[known]
    return buildGuide(bname, z.zone, z.desc, sampleRoom)
  }
  if (/馆|场/.test(bname)) {
    return buildGuide(bname, sampleRoom.includes('仓山') ? '仓山校区 · 体育场馆' : '旗山校区 · 体育场馆',
      '体育场馆类场地（田径场 / 球馆 / 健身房等）。' + SPORT_TIP, sampleRoom)
  }
  if (/实验|实验/.test(bname) || /^\d+/.test(bname)) {
    return buildGuide(bname, '旗山校区 · 实验楼群',
      '以数字开头的教室多分布于各学院实验楼群（如 16 栋为地生实验楼群），同一编号前缀的教室集中在同一栋内。', sampleRoom)
  }
  return buildGuide(bname, '福建师范大学', '该校室的所属楼栋暂无详细介绍，可点击下方按钮在地图中直接定位搜索。', sampleRoom)
}

function buildGuide(bname, zone, desc, sampleRoom) {
  const steps = [
    `先抵达${zone.split(' · ')[0]}（旗山校区为新建校区，主干道两侧即是各学院楼群；仓山校区为老校区）`,
    `在校区内找到「${bname}」——${sampleRoom ? '形如「' + sampleRoom + '」' : '本组'}的教室都在这一栋`,
    '进楼后查看楼层索引牌或楼梯口导视，按门牌号中的楼层数上楼即可找到教室',
  ]
  return {
    zone,
    desc,
    steps,
    mapUrl: CAMPUS_URL(zone.replace(' · ', '') + bname),
    hasDetail: buildings.some((b) => bname.startsWith(b.name) || b.name.startsWith(bname.replace(/\d+$/, ''))),
  }
}
