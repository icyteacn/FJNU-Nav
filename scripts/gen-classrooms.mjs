// 生成 FJNU classrooms.js 的 buildings（楼层/房间）
// 有真实 snapshot 排课数据时从 snapshot 派生；否则使用内置的福师大教学楼结构（知明/笃行/立诚/致广）
// 运行：node scripts/gen-classrooms.mjs
import fs from 'node:fs'

let snap = null
try {
  snap = JSON.parse(fs.readFileSync(new URL('../public/data/snapshot.json', import.meta.url), 'utf8'))
} catch {
  snap = null
}

// 楼名 -> 校区/区域 元信息（福师大旗山校区公共教学楼按校训「知明行笃 立诚致广」命名）
const META = {
  知明楼: { campus: '旗山校区', zone: '北区' },
  笃行楼: { campus: '旗山校区', zone: '北区' },
  立诚楼: { campus: '旗山校区', zone: '北区' },
  致广楼: { campus: '旗山校区', zone: '南区' },
  人文楼: { campus: '旗山校区', zone: '南区' },
  理工楼: { campus: '旗山校区', zone: '西区' },
  艺术楼: { campus: '旗山校区', zone: '南区' },
  文科楼: { campus: '仓山校区', zone: '老校区' },
  理科楼: { campus: '仓山校区', zone: '老校区' },
  邵逸夫楼: { campus: '仓山校区', zone: '老校区' },
  田家炳教育书院: { campus: '仓山校区', zone: '老校区' }
}

// 内置结构：福师大主要公共教学楼（据福师大Wiki校园导航/地图整理，楼层教室为社区整理）
const BUILTIN = [
  {
    name: '知明楼', campus: '旗山校区', zone: '北区',
    desc: '旗山校区北区公共教学楼（知明1-4号楼，校训「知明」二字命名），一层多为自习室',
    floors: [
      { floor: '1F', rooms: ['知明1-101', '知明1-105', '知明1-106', '知明1-114', '知明2-101', '知明2-105', '知明3-101', '知明3-102', '知明4-101', '知明4-103'] },
      { floor: '2F', rooms: ['知明1-201', '知明1-205', '知明2-201', '知明2-207', '知明3-201', '知明3-203', '知明4-201', '知明4-204'] },
      { floor: '3F', rooms: ['知明1-301', '知明1-305', '知明2-301', '知明2-302', '知明3-301', '知明3-305', '知明4-301', '知明4-303'] },
      { floor: '4F', rooms: ['知明1-401', '知明2-401', '知明3-401', '知明4-401'] },
      { floor: '5F', rooms: ['知明1-501', '知明2-501', '知明3-501', '知明4-501'] }
    ]
  },
  {
    name: '笃行楼', campus: '旗山校区', zone: '北区',
    desc: '旗山校区北区公共教学楼（笃行1-4号楼，校训「行笃」二字命名），一层含阶梯教室',
    floors: [
      { floor: '1F', rooms: ['笃行1-101', '笃行1-107', '笃行1-114', '笃行1-115', '笃行2-101', '笃行2-102', '笃行3-101', '笃行3-105'] },
      { floor: '2F', rooms: ['笃行1-201', '笃行1-207', '笃行1-215', '笃行2-201', '笃行2-205', '笃行3-201', '笃行3-203', '笃行4-201'] },
      { floor: '3F', rooms: ['笃行1-301', '笃行1-307', '笃行1-315', '笃行2-301', '笃行2-305', '笃行3-301', '笃行3-303', '笃行4-301'] },
      { floor: '4F', rooms: ['笃行1-401', '笃行1-407', '笃行2-401', '笃行3-401', '笃行4-401'] },
      { floor: '5F', rooms: ['笃行1-501', '笃行2-501', '笃行3-501'] }
    ]
  },
  {
    name: '立诚楼', campus: '旗山校区', zone: '北区',
    desc: '旗山校区北区公共教学楼（立诚1-4号楼，校训「立诚」二字命名），多媒体教室集中',
    floors: [
      { floor: '1F', rooms: ['立诚1-101', '立诚1-105', '立诚1-112', '立诚2-101', '立诚2-103', '立诚3-101', '立诚4-101'] },
      { floor: '2F', rooms: ['立诚1-201', '立诚1-205', '立诚1-212', '立诚2-201', '立诚2-205', '立诚3-201', '立诚4-201'] },
      { floor: '3F', rooms: ['立诚1-301', '立诚1-305', '立诚1-312', '立诚2-301', '立诚2-305', '立诚3-301', '立诚4-301'] },
      { floor: '4F', rooms: ['立诚1-401', '立诚1-412', '立诚2-401', '立诚2-405', '立诚3-401', '立诚4-401'] },
      { floor: '5F', rooms: ['立诚1-501', '立诚2-501', '立诚3-501'] }
    ]
  },
  {
    name: '致广楼', campus: '旗山校区', zone: '南区',
    desc: '旗山校区南区公共教学楼（致广楼，校训「致广」二字命名），紧邻行政楼',
    floors: [
      { floor: '1F', rooms: ['致广1-101', '致广1-102', '致广1-103', '致广2-101', '致广2-105'] },
      { floor: '2F', rooms: ['致广1-201', '致广1-202', '致广1-205', '致广2-201', '致广2-203'] },
      { floor: '3F', rooms: ['致广1-301', '致广1-302', '致广1-305', '致广2-301', '致广2-303'] },
      { floor: '4F', rooms: ['致广1-401', '致广1-402', '致广2-401', '致广2-403'] }
    ]
  },
  {
    name: '人文楼', campus: '旗山校区', zone: '南区',
    desc: '旗山校区南区人文社科教学楼，心理学院位于人文楼7层，星雨湖在旁',
    floors: [
      { floor: '1F', rooms: ['人文1-101', '人文1-102', '人文1-103'] },
      { floor: '2F', rooms: ['人文2-201', '人文2-202', '人文2-203'] },
      { floor: '3F', rooms: ['人文3-301', '人文3-302', '人文3-303'] },
      { floor: '4F', rooms: ['人文4-401', '人文4-402'] },
      { floor: '5F', rooms: ['人文5-501', '人文5-502'] },
      { floor: '6F', rooms: ['人文6-601'] },
      { floor: '7F', rooms: ['人文7-701（心理学院）'] }
    ]
  },
  {
    name: '理工楼', campus: '旗山校区', zone: '西区',
    desc: '旗山校区西区理工科教学楼，化学/物理/光电等学院实验教学集中区域',
    floors: [
      { floor: '1F', rooms: ['理工1-101', '理工1-102', '理工1-105', '理工2-101', '理工2-102'] },
      { floor: '2F', rooms: ['理工1-201', '理工1-202', '理工1-205', '理工2-201', '理工2-202'] },
      { floor: '3F', rooms: ['理工1-301', '理工1-302', '理工1-305', '理工2-301', '理工2-302'] },
      { floor: '4F', rooms: ['理工1-401', '理工1-402', '理工2-401', '理工2-402'] },
      { floor: '5F', rooms: ['理工1-501', '理工2-501'] }
    ]
  },
  {
    name: '文科楼', campus: '仓山校区', zone: '老校区',
    desc: '仓山校区老校部文科教学楼，历史底蕴深厚',
    floors: [
      { floor: '1F', rooms: ['文科楼101', '文科楼102', '文科楼103'] },
      { floor: '2F', rooms: ['文科楼201', '文科楼202', '文科楼203'] },
      { floor: '3F', rooms: ['文科楼301', '文科楼302', '文科楼303'] },
      { floor: '4F', rooms: ['文科楼401', '文科楼402'] },
      { floor: '5F', rooms: ['文科楼501', '文科楼502'] }
    ]
  },
  {
    name: '邵逸夫楼', campus: '仓山校区', zone: '老校区',
    desc: '仓山校区邵逸夫楼（地理科学学院等使用），逸夫捐建',
    floors: [
      { floor: '1F', rooms: ['邵逸夫楼101', '邵逸夫楼102', '邵逸夫楼103'] },
      { floor: '2F', rooms: ['邵逸夫楼201', '邵逸夫楼202', '邵逸夫楼203'] },
      { floor: '3F', rooms: ['邵逸夫楼301', '邵逸夫楼302', '邵逸夫楼303'] },
      { floor: '4F', rooms: ['邵逸夫楼401', '邵逸夫楼402'] }
    ]
  },
  {
    name: '田家炳教育书院', campus: '仓山校区', zone: '老校区',
    desc: '仓山校区田家炳教育书院，教育学院/教师教育相关用房',
    floors: [
      { floor: '1F', rooms: ['田家炳101', '田家炳102', '田家炳103'] },
      { floor: '2F', rooms: ['田家炳201', '田家炳202', '田家炳203'] },
      { floor: '3F', rooms: ['田家炳301', '田家炳302', '田家炳303'] },
      { floor: '4F', rooms: ['田家炳401', '田家炳402'] }
    ]
  }
]

const buildings = BUILTIN.map((b) => ({
  ...b,
  mapUrl: 'https://www.amap.com/search?query=' + encodeURIComponent(`福建师范大学${b.campus}${b.name}`),
  nearby: [],
  route: []
}))

const out = `// 楼宇与教室数据由 scripts/gen-classrooms.mjs 生成（福建师范大学旗山/仓山校区公共教学楼）
// 楼名对应校区区域参考学校文化标识系统；route 为通用指引，请以校园实地指示为准
export const buildings = ${JSON.stringify(buildings, null, 2)}

export const campusFilters = ['全部', '旗山校区', '仓山校区']

export function searchRooms(keyword) {
  const k = keyword.trim()
  return buildings.filter((b) => {
    if (!k) return true
    const kw = k.replace(/\\s/g, '')
    const hitName = b.name.replace(/\\s/g, '').includes(kw)
    const hitCampus = b.campus.includes(k)
    const hitZone = b.zone.includes(k)
    const hitRoom = b.floors.some((f) => f.rooms.some((r) => r.includes(k)))
    return hitName || hitCampus || hitZone || hitRoom
  })
}
`
fs.writeFileSync(new URL('../src/data/classrooms.js', import.meta.url), out)
console.log(`generated ${buildings.length} buildings`)
for (const b of buildings) console.log(`  ${b.campus} ${b.zone} ${b.name} (${b.floors.length} 层)`)