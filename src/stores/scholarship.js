/**
 * 奖学金测算共享状态（科研分 + 综测分联动）
 * ---------------------------------------------------------------------------
 * 科研快速选档、综测积累器、综合成绩测算器三处共用同一份 reactive 状态，
 * 任一处改动实时同步；选择结果自动持久化到 localStorage（仅本设备）。
 */
import { reactive, watch, computed } from 'vue'
import { RESEARCH_GROUPS, MEMBER_FACTORS } from '../data/researchRules'
import { ZC_GROUPS } from '../data/zcRules'
import { majorById } from '../data/courseCredits'

const LS_KEY = 'fjnu-scholar-calc-v1'

/** 评定身份 → 综合成绩构成（课程权重% / 科研满分 / 综质满分，满分已含权重） */
export const PROFILES = {
  'master-2': { label: '硕士二年级', degree: 'master', courseW: 50, rCap: 35, qCap: 15, gates: '一等需课程排名前 30% · 二等前 50%（或前 2 名）· 三等前 70%' },
  'master-3': { label: '硕士三年级', degree: 'master', courseW: 0, rCap: 85, qCap: 15, gates: '一等需开题合格 + 中期考核优秀 · 二等需开题合格 + 中期良好以上' },
  'phd-2': { label: '博士二年级', degree: 'phd', courseW: 40, rCap: 50, qCap: 10, gates: '以综合成绩总分从高到低排序' },
  'phd-34': { label: '博三四年级 / 五年级直博', degree: 'phd', courseW: 0, rCap: 90, qCap: 10, gates: '以综合成绩总分从高到低排序' },
}

export const state = reactive({
  profile: 'master-2',
  course: null,
  major: '',
  courseScores: {},
  rPicks: [],
  zPicks: [],
  counts: {},
  factors: {},
})

let _loaded = false
let _watched = false
export function loadState() {
  if (_loaded) return
  _loaded = true
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY))
    if (s && typeof s === 'object') {
      for (const k of ['profile', 'course', 'major', 'courseScores', 'rPicks', 'zPicks', 'counts', 'factors']) {
        if (s[k] !== undefined) state[k] = s[k]
      }
    }
  } catch { /* 忽略损坏的本地数据 */ }
  if (!_watched) {
    _watched = true
    watch(state, saveState, { deep: true })
  }
}
export function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({
    profile: state.profile, course: state.course, major: state.major, courseScores: state.courseScores,
    rPicks: state.rPicks, zPicks: state.zPicks, counts: state.counts, factors: state.factors,
  })) } catch { /* 存储不可用时静默降级 */ }
}

let _uid = Date.now() % 100000
export function nextUid() { return 'p' + (++_uid) + '_' + Math.random().toString(36).slice(2, 6) }

export function profileOf() { return PROFILES[state.profile] || PROFILES['master-2'] }

/** 切换一个档位选项（同条目同档位再点取消；同条目换档位自动替换） */
export function togglePick(kind, gid, item, oi) {
  const opts = item.opts || [{ label: '', pts: item.pts }]
  const opt = opts[oi]
  const picks = kind === 'r' ? state.rPicks : state.zPicks
  const sameItem = picks.filter(p => p.gid === gid && p.iid === item.id)
  const hit = sameItem.find(p => p.oi === oi)
  if (hit) {
    picks.splice(picks.indexOf(hit), 1)
    return false
  }
  if (sameItem.length) picks.splice(picks.indexOf(sameItem[0]), 1)
  picks.push({ uid: nextUid(), gid, iid: item.id, oi, label: item.label, optLabel: opt.label, pts: opt.pts })
  return true
}

export function setCount(gid, item, n) {
  const key = gid + ':' + item.id
  const cap = item.count.cap
  if (cap != null) n = Math.min(Math.max(n, 0), cap)
  else n = Math.max(n, 0)
  if (n === 0) delete state.counts[key]
  else state.counts[key] = n
}

export function getCount(gid, item) {
  return state.counts[gid + ':' + item.id] || 0
}

export function factorIdxOf(gid) { return state.factors[gid] || 0 }
export function setFactorIdx(gid, i) { state.factors = { ...state.factors, [gid]: i } }

/** 计算一组分类的得分明细：就高 / 上限 / 成员系数 / 计数项统一在此处理 */
function evalGroups(groups, picks) {
  return groups.map(g => {
    let rows = picks.filter(p => p.gid === g.id).map(p => ({
      ...p,
      effPts: +(p.pts * (g.factor ? MEMBER_FACTORS[factorIdxOf(g.id)].f : 1)).toFixed(2),
    }))
    for (const item of groups.find(x => x.id === g.id).items) {
      if (!item.count) continue
      const n = getCount(g.id, item)
      if (n > 0) {
        rows.push({ uid: 'c_' + g.id + '_' + item.id, gid: g.id, iid: item.id, label: item.label, optLabel: `×${n} ${item.count.unit}`, effPts: +(n * item.count.per).toFixed(2), isCount: true })
      }
    }
    if (g.mode === 'max' && rows.length > 1) {
      const best = Math.max(...rows.map(r => r.effPts))
      rows.forEach(r => { if (r.effPts < best) r.excluded = '就高不计' })
    }
    let sum = rows.filter(r => !r.excluded).reduce((s, r) => s + r.effPts, 0)
    sum = +sum.toFixed(2)
    let capped = 0
    if (g.cap != null && sum > g.cap) { capped = +(sum - g.cap).toFixed(2); sum = g.cap }
    const active = rows.filter(r => !r.excluded).length
    return { g, rows, sum, capped, active }
  })
}

export const researchDetail = computed(() => evalGroups(RESEARCH_GROUPS, state.rPicks))
export const researchRaw = computed(() => +researchDetail.value.reduce((s, d) => s + d.sum, 0).toFixed(2))

export const qualityDetail = computed(() => evalGroups(ZC_GROUPS, state.zPicks))
export const qualityRaw = computed(() => +qualityDetail.value.reduce((s, d) => s + d.sum, 0).toFixed(2))

const profile = computed(profileOf)

export const researchScore = computed(() => {
  const cap = profile.value.rCap
  return { raw: researchRaw.value, score: Math.min(researchRaw.value, cap), cap }
})
export const qualityScore = computed(() => {
  const cap = profile.value.qCap
  return { raw: qualityRaw.value, score: qualityRaw.value, cap }
})

export const coursePart = computed(() => {
  const c = Math.min(Math.max(Number(state.course) || 0, 0), 100)
  return +(c * profile.value.courseW / 100).toFixed(2)
})

export function setCourseScore(courseId, v) {
  const n = Math.min(Math.max(Number(v) || 0, 0), 100)
  if (v === '' || v === null || v === undefined) delete state.courseScores[courseId]
  else state.courseScores = { ...state.courseScores, [courseId]: n }
}

export function clearCourseScores() {
  state.courseScores = {}
  state.course = null
}

/** 按已输入课程计算加权平均分：Σ(成绩×学分) ÷ Σ学分（仅计已输入项） */
export const weightedAvg = computed(() => {
  const major = majorById(state.major)
  if (!major) return null
  let sum = 0
  let credits = 0
  let filled = 0
  for (const c of major.courses) {
    const v = state.courseScores[c.id]
    if (v === undefined || v === null || v === '') continue
    sum += v * c.credit
    credits += c.credit
    filled += 1
  }
  if (!credits) return { avg: null, filled: 0, total: major.courses.length, credits: 0 }
  return { avg: +(sum / credits).toFixed(2), filled, total: major.courses.length, credits }
})

watch(weightedAvg, (w) => {
  if (w && w.avg !== null) state.course = w.avg
})

export const totalScore = computed(() => +(coursePart.value + researchScore.value.score + qualityScore.value.score).toFixed(2))

export function resetKind(kind) {
  if (kind === 'r') state.rPicks = []
  else state.zPicks = []
  const prefix = kind === 'r' ? ['project:prT', 'conf'] : []
  Object.keys(state.counts).forEach(k => {
    const inKind = kind === 'r'
      ? ['project:', 'conf:'].some(p => k.startsWith(p))
      : !['project:', 'conf:'].some(p => k.startsWith(p))
    if (inKind) delete state.counts[k]
  })
}
