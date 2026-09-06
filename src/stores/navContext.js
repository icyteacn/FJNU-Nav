/**
 * 跨应用导航上下文（轻量级事件总线）
 * ---------------------------------------------------------------------------
 * 应用 A 想跳转到应用 B 并携带参数时：
 *   setNavContext({ room: '101' })
 *   openApp('classroomNav')
 * 应用 B 在 setup() 中 watch navCtx 自动消费：
 *   import { navCtx } from '../stores/navContext'
 *   watch(navCtx, (ctx) => { if (ctx) { ... navCtx.value = null } }, { immediate: true })
 */
import { ref } from 'vue'

/** 导出 ref 供组件 watch */
export const navCtx = ref(null)

export function setNavContext(ctx) { navCtx.value = ctx }
