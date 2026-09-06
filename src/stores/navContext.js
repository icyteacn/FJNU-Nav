/**
 * 跨应用导航上下文（轻量级事件总线）
 * ---------------------------------------------------------------------------
 * 应用 A 想跳转到应用 B 并携带参数时：
 *   setNavContext({ app: 'timetable', params: { room: '101' } })
 *   openApp('timetable')
 * 应用 B 通过 watchNavContext() 监听变化自动消费：
 *   const ctx = watchNavContext()
 *   // ctx 变化时自动触发
 */
import { ref, watch } from 'vue'

const navCtx = ref(null)

export function setNavContext(ctx) { navCtx.value = ctx }
export function consumeNavContext() { const c = navCtx.value; navCtx.value = null; return c }
export function peekNavContext() { return navCtx.value }

/** 监听 navContext 变化，有新值时自动消费并执行回调 */
export function watchNavContext(callback) {
  watch(navCtx, (ctx) => {
    if (ctx) {
      callback(ctx)
      navCtx.value = null
    }
  }, { immediate: true })
}
