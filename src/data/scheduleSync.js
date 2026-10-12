/**
 * ════════════════════════════════════════════════════════════════════
 * @模块路径  src/data/scheduleSync.js
 * @职责      课表数据接口加载器（网页与 APK 共用同一份 schedule-data.json）
 *            回退链：在线接口 → 同域/包内接口 → localStorage 缓存 → 内置数据
 *            —— 任一环节失败都能打开课表，断网时显示上次成功同步的数据
 * @同步      数据源是 scripts/gen-schedule-data.mjs 在 npm run build 时从
 *            src/data/classSchedule.js 导出的，改完课表源码构建即自动同步
 * @响应      成功应用远程数据后 scheduleRevision +1，组件 computed 依赖它即可
 *            自动重渲染（classSchedule.js 内的数组是原地替换，引用不变）
 * ════════════════════════════════════════════════════════════════════
 */
import { ref } from 'vue'
import { applyRemoteSchedule, HOLIDAY_MAP, COURSES } from './classSchedule.js'

/** 数据修订号：远程数据应用成功后 +1（组件用它触发重算） */
export const scheduleRevision = ref(0)

/** 同步状态：idle | syncing | synced | cached | builtin | error */
export const syncStatus = ref({
  state: 'idle',
  version: null,
  updatedAt: null,
  semester: null,
  appVersion: null,
  source: null,      // remote | cache | builtin
  updated: false,    // 远程数据是否与内置不同（有新课表/调课可看）
  error: null,
})

const CACHE_KEY = 'fjnu_schedule_data_cache'
const STATION = 'https://icyteacn.github.io/FJNU-Nav'

function readCache() {
  try { const d = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); return d && d.courses ? d : null } catch { return null }
}
function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch {}
}

async function fetchJson(url) {
  const res = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const data = await res.json()
  if (!data || !Array.isArray(data.courses) || !data.courses.length) throw new Error('bad payload')
  return data
}

/**
 * 加载课表数据
 * @param {object} opts
 * @param {boolean} opts.preferRemote  true=先试站点绝对地址（APK 内用），false=先试同域
 * @param {string}  opts.base          相对基址（默认 ''）
 * @returns {Promise<object>} 同步状态
 */
export async function loadScheduleData({ preferRemote = false, base = '' } = {}) {
  if (syncStatus.value.state === 'syncing') return syncStatus.value
  syncStatus.value = { ...syncStatus.value, state: 'syncing', error: null }

  const rel = base ? `${base}data/schedule-data.json` : 'data/schedule-data.json'
  const abs = `${STATION}/data/schedule-data.json`
  const order = preferRemote ? [abs, rel] : [rel, abs]

  let remote = null
  for (const url of order) {
    try { remote = await fetchJson(url); break } catch (e) { syncStatus.value = { ...syncStatus.value, error: String(e.message || e) } }
  }

  if (remote) {
    writeCache(remote)
    const touched = applyRemoteSchedule(remote)
    scheduleRevision.value++
    syncStatus.value = {
      state: 'synced', version: remote.version || null, updatedAt: remote.updatedAt || null,
      semester: remote.semester || null, appVersion: remote.appVersion || null,
      source: 'remote', updated: touched, error: null,
    }
    return syncStatus.value
  }

  // 在线失败 → 用上次成功同步的缓存（保证换机/断网也能看到最近课表）
  const cached = readCache()
  if (cached) {
    const touched = applyRemoteSchedule(cached)
    scheduleRevision.value++
    syncStatus.value = {
      state: 'cached', version: cached.version || null, updatedAt: cached.updatedAt || null,
      semester: cached.semester || null, appVersion: cached.appVersion || null,
      source: 'cache', updated: touched, error: syncStatus.value.error,
    }
    return syncStatus.value
  }

  // 缓存也没有 → 内置数据（打包时带的那份，永远可开）
  syncStatus.value = {
    state: 'builtin', version: null, updatedAt: null,
    semester: null, appVersion: null, source: 'builtin', updated: false,
    error: syncStatus.value.error,
  }
  scheduleRevision.value++
  return syncStatus.value
}

/** 站点是否发布了比内置更新的课表（用于「发现新课表」提示） */
export function hasNewerSchedule() {
  const st = syncStatus.value
  if (!st.updatedAt) return false
  const cachedVersion = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')?.version } catch { return null } })()
  return !!(st.version && cachedVersion && st.version !== cachedVersion) || !!st.updated
}

export { HOLIDAY_MAP, COURSES }
