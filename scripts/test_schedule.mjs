/**
 * 课表「三端一致性 + 语义」自测：node scripts/test_schedule.mjs
 *
 * 为什么需要：课表有三份实现——`src/data/classSchedule.js`（网页数据源）、
 * `public/standalone-schedule.html`（APK / 移动端单文件内置一份 HOLIDAY_MAP）、
 * `public/data/schedule-data.json`（构建产物，供远程同步）。
 * 历史上出过一次真实事故：**改课表时 APK 内置的 HOLIDAY_MAP 漏同步**
 * （见 skills/fjnu-nav-maintainer/references/schedule-adjust.md），三端由此长期漂移。
 * 本测试把「三端数据是否一致」和「调课语义是否仍然正确」变成可自动回归的断言。
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/* Node 无 DOM：给 classSchedule.js 装内存 localStorage（它有用户自定义调课/覆盖） */
if (typeof localStorage === 'undefined') {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  }
}

let failed = 0
function check(name, fn) {
  try {
    fn()
    console.log('✔', name)
  } catch (e) {
    failed++
    console.error('✘', name, '\n   ', e.message)
  }
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

/** 从源码里取出 `const NAME = { ... }` 的对象字面量（花括号配平），再求值成对象 */
function extractObjectLiteral(src, decl) {
  const i = src.indexOf(decl)
  if (i < 0) throw new Error('找不到声明: ' + decl)
  const start = src.indexOf('{', i)
  let depth = 0
  for (let j = start; j < src.length; j++) {
    const ch = src[j]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return new Function('return ' + src.slice(start, j + 1))()
    }
  }
  throw new Error('花括号不配平: ' + decl)
}

const mod = await import('../src/data/classSchedule.js')
const { HOLIDAY_MAP, COURSES, MAJORS, getDateHolidayInfo, getScheduleWeekday, isPeriodMoved, getIncomingInfo } = mod

const standaloneSrc = read('public/standalone-schedule.html')
const standaloneMap = extractObjectLiteral(standaloneSrc, 'const HOLIDAY_MAP')
const dataJson = JSON.parse(read('public/data/schedule-data.json'))
const pkg = JSON.parse(read('package.json'))

const sortKeys = (o) => Object.keys(o).sort()
const jsonEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

check('三端 HOLIDAY_MAP 键集合一致（源 / APK 内置 / 构建产物）', () => {
  const srcKeys = sortKeys(HOLIDAY_MAP)
  const apkKeys = sortKeys(standaloneMap)
  const dataKeys = sortKeys(dataJson.holidayMap || {})
  assert.ok(srcKeys.length > 10, '源 HOLIDAY_MAP 条目过少: ' + srcKeys.length)
  assert.deepEqual(apkKeys, srcKeys, 'APK 内置 HOLIDAY_MAP 与源不一致（漏同步）：\n  APK 独有 ' +
    JSON.stringify(apkKeys.filter((k) => !srcKeys.includes(k))) + '\n  源独有 ' +
    JSON.stringify(srcKeys.filter((k) => !apkKeys.includes(k))))
  assert.deepEqual(dataKeys, srcKeys, '构建产物 schedule-data.json 与源不一致（忘了 npm run build？）')
})

check('三端 HOLIDAY_MAP 内容逐条一致（含 type/scheduleWeekday/overrides）', () => {
  for (const k of sortKeys(HOLIDAY_MAP)) {
    assert.ok(jsonEqual(HOLIDAY_MAP[k], standaloneMap[k]),
      `APK 内置条目 ${k} 与源不一致：\n  源   ${JSON.stringify(HOLIDAY_MAP[k])}\n  APK  ${JSON.stringify(standaloneMap[k])}`)
    assert.ok(jsonEqual(HOLIDAY_MAP[k], dataJson.holidayMap[k]),
      `构建产物条目 ${k} 与源不一致：\n  源   ${JSON.stringify(HOLIDAY_MAP[k])}\n  产物 ${JSON.stringify(dataJson.holidayMap[k])}`)
  }
})

check('版本单一事实来源链：package.json.apkVersion = APK 内置 = 接口产物', () => {
  const apkVersion = pkg.apkVersion
  assert.ok(apkVersion, 'package.json 缺少 apkVersion')
  const m = standaloneSrc.match(/APP_VERSION\s*=\s*'([^']+)'/)
  assert.ok(m, '未找到 standalone 的 APP_VERSION')
  assert.equal(m[1], apkVersion, `APK 内置 APP_VERSION(${m[1]}) 与 package.json.apkVersion(${apkVersion}) 不一致`)
  assert.equal(dataJson.appVersion, apkVersion, `接口产物 appVersion(${dataJson.appVersion}) 与 package.json.apkVersion 不一致`)
})

check('构建产物与源的数量口径一致', () => {
  assert.equal(dataJson.courses.length, COURSES.length, '课程数不一致（忘了重新构建接口？）')
  assert.equal(dataJson.majors.length, MAJORS.length, '专业数不一致')
  assert.equal(Object.keys(dataJson.holidayMap).length, Object.keys(HOLIDAY_MAP).length, '节假日条目数不一致')
  assert.equal(dataJson.schema >= 1, true, 'schema 版本缺失')
  assert.ok(typeof dataJson.version === 'string' && dataJson.version.length >= 6, '内容哈希 version 缺失')
})

check('停课日语义：holiday 且当日无课（scheduleWeekday 为空）', () => {
  const info = getDateHolidayInfo('2026-10-01')
  assert.ok(info && info.type === 'holiday', '2026-10-01 应为 holiday：' + JSON.stringify(info))
  const wd = getScheduleWeekday(4, '2026-10-01')
  assert.ok(wd === null || wd === undefined || wd === false || wd === 0 && false,
    '停课日不应映射出上课周几：' + JSON.stringify(wd))
})

check('调休补课日语义：makeup 且映射到被补的那天', () => {
  const a = getDateHolidayInfo('2026-09-20')
  assert.ok(a && a.type === 'makeup', '2026-09-20 应为 makeup：' + JSON.stringify(a))
  assert.equal(a.scheduleWeekday, 2, '9/20 应补周二课')
  const b = getDateHolidayInfo('2026-10-10')
  assert.ok(b && b.type === 'makeup', '2026-10-10 应为 makeup')
  assert.equal(b.scheduleWeekday, 3, '10/10 应补周三课')
})

check('调课（换日）语义：源日节次被移走、目标日可解析出调入', () => {
  const d1 = HOLIDAY_MAP['2026-10-13']
  assert.ok(d1 && d1.type === 'adjust', '2026-10-13 应为 adjust')
  const ov = d1.overrides[0]
  assert.deepEqual(ov.srcPeriods, [9, 10, 11, 12])
  assert.equal(ov.destDate, '2026-10-15')
  assert.equal(ov.destLocation, '笃行1-114')
  // 源日第 9 节应被判定为「已移走」
  assert.equal(isPeriodMoved('2026-10-13', 9), true, '源日第 9 节应标记为 moved')
  assert.equal(isPeriodMoved('2026-10-13', 1), false, '未涉及的节次不应被标记')
  // 目标日应能解析出「调入」信息
  const inc = getIncomingInfo('2026-10-15', 9, () => ({ id: 'ai', weekday: 2, startPeriod: 9, endPeriod: 12, location: '原教室' }))
  assert.ok(inc, '2026-10-15 第 9 节应能解析出调入信息')
})

check('调课（跨周换日）语义：10/20 → 11/19 立诚1-105', () => {
  const d = HOLIDAY_MAP['2026-10-20']
  assert.ok(d && d.type === 'adjust', '2026-10-20 应为 adjust')
  assert.equal(d.overrides[0].destDate, '2026-11-19')
  assert.equal(d.overrides[0].destLocation, '立诚1-105')
  assert.equal(isPeriodMoved('2026-10-20', 12), true)
})

check('大量课程与专业数据未损坏', () => {
  assert.ok(COURSES.length >= 20, '课程数异常：' + COURSES.length)
  assert.ok(MAJORS.length >= 5, '专业数异常：' + MAJORS.length)
  for (const c of COURSES.slice(0, 40)) {
    assert.ok(typeof c.name === 'string' && c.name.length > 0, '课程缺少名称：' + JSON.stringify(c).slice(0, 80))
    assert.ok(Number.isFinite(c.startPeriod) && Number.isFinite(c.endPeriod), '课程节次非法：' + c.name)
    assert.ok(c.endPeriod >= c.startPeriod, '课程节次倒挂：' + c.name)
  }
})

check('用户自定义调课写入/删除走独立键，且不影响站点调课', () => {
  const { setUserAdjustKey, loadUserAdjustments, saveUserAdjustment, removeUserAdjustment, getAllAdjustments, getSiteAdjustments } = mod
  setUserAdjustKey('fjnu_adjustments_test')
  const siteCount = getSiteAdjustments().length
  const before = loadUserAdjustments().length
  saveUserAdjustment({ id: 'ut-1', srcDate: '2026-11-02', srcPeriods: [1, 2], destDate: '2026-11-03', destPeriods: [1, 2], destLocation: '测试楼101', origin: 'user' })
  assert.equal(loadUserAdjustments().length, before + 1)
  assert.equal(getSiteAdjustments().length, siteCount, '用户调课不应污染站点调课集合')
  assert.ok(getAllAdjustments().length >= siteCount + 1, '合并集合应同时含站点与用户调课')
  removeUserAdjustment('ut-1')
  assert.equal(loadUserAdjustments().length, before, '删除后应还原')
  localStorage.removeItem('fjnu_adjustments_test')
})

console.log(failed ? `\n${failed} 项失败` : '\n全部通过')
process.exit(failed ? 1 : 0)
