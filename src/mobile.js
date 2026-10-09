/**
 * @模块路径  src/mobile.js
 * @职责      移动端课表独立入口逻辑
 */
import { createApp } from 'vue'
import MobileSchedule from './views/MobileSchedule.vue'

const app = createApp(MobileSchedule)
app.mount('#app')
