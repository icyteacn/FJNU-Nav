/**
 * 跨应用导航上下文
 * 用 localStorage 传递参数（可靠、无状态依赖）
 * setNavContext({ room: '计网楼507' }) → emit('open', 'classroomNav')
 * 目标应用 onMounted 读取 navCtx() 获取参数并清除
 */
const NAV_KEY = 'fjnu_nav_ctx'

export function setNavContext(ctx) {
  try { sessionStorage.setItem(NAV_KEY, JSON.stringify(ctx)) } catch {}
}
export function navCtx() {
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    if (!raw) return null
    sessionStorage.removeItem(NAV_KEY)
    return JSON.parse(raw)
  } catch { return null }
}
