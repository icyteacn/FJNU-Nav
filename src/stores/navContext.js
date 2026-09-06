/**
 * 跨应用导航上下文（轻量级事件总线）
 * ---------------------------------------------------------------------------
 * 应用 A 想跳转到应用 B 并携带参数时：
 *   setNavContext({ app: 'timetable', params: { room: '101' } })
 *   openApp('timetable')
 * 应用 B 在 onMounted 中：
 *   const ctx = consumeNavContext()
 *   if (ctx?.params?.room) { ... }
 */
import { ref } from 'vue'

const navCtx = ref(null)

export function setNavContext(ctx) { navCtx.value = ctx }
export function consumeNavContext() { const c = navCtx.value; navCtx.value = null; return c }
export function peekNavContext() { return navCtx.value }
