/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  scripts/gen-schedule-data.mjs
 * @职责      课表数据接口生成器：把 src/data/classSchedule.js（唯一数据源）
 *            导出为静态接口，供网页与 APK 共用
 *            ① public/data/schedule-data.json  完整接口（课程 + 调课/节假日
 *               + 学期信息 + APK 版本），网页与新版 APK 读它
 *            ② public/data/schedule-courses.json 兼容接口（仅 courses/version
 *               /updatedAt），旧版 1.0 APK 仍在拉它，保持可用
 * @用法      node scripts/gen-schedule-data.mjs（已链入 npm run build）
 * @版本      version = 内容哈希：只有数据真变才变，客户端据此判断是否需要更新
 * @updatedAt 内容未变时沿用旧时间戳，避免每次构建都产生无意义的 git 变更
 * ════════════════════════════════════════════════════════════════════
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { COURSES, HOLIDAY_MAP, MAJORS, WEEKDAYS, TABLE_ROWS, SINGLE_PERIOD_TIMES, getWeekStartDate } from '../src/data/classSchedule.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'public', 'data')
const FULL_OUT = path.join(DATA_DIR, 'schedule-data.json')
const LEGACY_OUT = path.join(DATA_DIR, 'schedule-courses.json')

/** APK 版本单一事实来源 = package.json 的 apkVersion
 *  （CI 构建前会 rm -rf android，读不到 build.gradle，曾导致线上 appVersion 回退成 1.0） */
function readApkVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (pkg.apkVersion) return String(pkg.apkVersion)
  } catch { /* fallthrough */ }
  try {
    const g = fs.readFileSync(path.join(ROOT, 'android', 'app', 'build.gradle'), 'utf8')
    const v = (g.match(/versionName\s+"([^"]+)"/) || [])[1]
    if (v) return v
  } catch { /* fallthrough */ }
  return '1.2'
}

/** 读旧接口的 updatedAt（内容未变时沿用，避免时间戳每次跳变） */
function readPrevUpdatedAt(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')).updatedAt || null } catch { return null }
}

function readJsonIfExists(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

fs.mkdirSync(DATA_DIR, { recursive: true })

const semesterStart = getWeekStartDate(1)
const semesterStartStr = `${semesterStart.getFullYear()}-${String(semesterStart.getMonth() + 1).padStart(2, '0')}-${String(semesterStart.getDate()).padStart(2, '0')}`

// 内容哈希：只对会改变课表表现的字段做 hash（时间戳不参与）
const contentForHash = JSON.stringify({ courses: COURSES, holidayMap: HOLIDAY_MAP, semesterStart: semesterStartStr })
const version = crypto.createHash('sha256').update(contentForHash).digest('hex').slice(0, 10)

const prevFull = readJsonIfExists(FULL_OUT)
const prevLegacy = readJsonIfExists(LEGACY_OUT)
const unchanged = prevFull && prevFull.version === version
const updatedAt = unchanged ? prevFull.updatedAt : new Date().toISOString()
const semester = `${semesterStart.getFullYear()}-${semesterStart.getFullYear() + 1}学年第一学期`

const full = {
  schema: 2,
  version,
  appVersion: readApkVersion(),
  semester,
  semesterStart: semesterStartStr,
  weeks: 18,
  currentWeek: Math.max(1, Math.min(18, Math.floor((Date.now() - new Date(semesterStartStr).getTime()) / (7 * 86400000)) + 1)),
  updatedAt,
  counts: { courses: COURSES.length, adjustments: Object.values(HOLIDAY_MAP).filter(v => v.overrides).length },
  majors: MAJORS,
  weekdays: WEEKDAYS,
  tableRows: TABLE_ROWS,
  periodTimes: SINGLE_PERIOD_TIMES,
  courses: COURSES,
  holidayMap: HOLIDAY_MAP,
}

// 兼容接口：旧版 1.0 APK 只读 courses / version / updatedAt
const legacy = {
  courses: COURSES,
  version,
  semester,
  updatedAt: (!unchanged || !prevLegacy) ? updatedAt : prevLegacy.updatedAt,
}

function writeIfChanged(file, data) {
  const text = JSON.stringify(data, null, 2) + '\n'
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  if (prev === text) { console.log(`  gen-schedule-data: ${path.relative(ROOT, file)} 无变化`); return }
  fs.writeFileSync(file, text, 'utf8')
  console.log(`  gen-schedule-data: ${path.relative(ROOT, file)} ✓ (${(text.length / 1024).toFixed(1)} KB)`)
}

writeIfChanged(FULL_OUT, full)
writeIfChanged(LEGACY_OUT, legacy)
console.log(`  gen-schedule-data: version=${version} appVersion=${full.appVersion} courses=${COURSES.length} updatedAt=${updatedAt}`)
