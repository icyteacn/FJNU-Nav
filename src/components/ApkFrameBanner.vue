<script setup>
/* 旧版课表 App 的"网页版"用 iframe 装本站（switchToWeb → timetable 路由）。
 * 旧 WebView 壳无下载能力、子帧导航会被吞——本横幅是唯一可达的下载入口：
 * 点击后经 launchApkDownload 走 top.location 主帧导航，Capacitor 拦成外部 intent，
 * 由系统浏览器/下载器接管 APK。仅在 iframe 内渲染，正常站点访问零成本。 */
import { ref, onMounted } from 'vue'
import { fetchApkManifest, probeApkUrl, launchApkDownload } from '../utils/apkRelease.js'

const visible = ref(false)
const ver = ref('')
const busy = ref(false)

onMounted(async () => {
  try {
    if (!window.top || window.top === window.self) return
    const m = await fetchApkManifest()
    if (!m || !Array.isArray(m.urls) || !m.urls.length) return
    ver.value = m.version || ''
    visible.value = true
  } catch { /* 静默 */ }
})

async function download() {
  if (busy.value) return
  busy.value = true
  try {
    const m = await fetchApkManifest()
    if (!m || !m.urls?.length) { busy.value = false; return }
    const best = await probeApkUrl(m.urls)
    launchApkDownload(best || new URL(m.urls[0], location.href).href, m.file || 'feike-schedule.apk')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <button v-if="visible" class="apk-frame-banner" :disabled="busy" @click="download">
    <span class="afb-glow"></span>
    <span class="afb-icon">🔥</span>
    <span class="afb-text">
      <b>{{ busy ? '正在准备下载…' : `课表 App 新版本${ver ? ' v' + ver : ''} 可下载` }}</b>
      <small v-if="!busy">点这里 · 自动跳转浏览器下载安装包</small>
    </span>
    <span class="afb-arrow">›</span>
  </button>
</template>

<style scoped>
.apk-frame-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  background: linear-gradient(135deg, #c03434, #e0552e 55%, #f0823a);
  color: #fff;
  font-size: 15px;
  box-shadow: 0 8px 26px rgba(192, 52, 52, 0.45), 0 0 0 4px rgba(224, 85, 46, 0.18);
  cursor: pointer;
  overflow: hidden;
  animation: afb-pulse 2.2s ease-in-out infinite;
}
.afb-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.32) 50%, transparent 65%);
  animation: afb-shine 2.6s linear infinite;
  pointer-events: none;
}
.afb-icon { font-size: 20px; flex-shrink: 0 }
.afb-text { flex: 1; text-align: left; line-height: 1.3 }
.afb-text b { display: block; font-size: 15px; font-weight: 800; letter-spacing: 0.2px }
.afb-text small { display: block; font-size: 11px; opacity: 0.92; margin-top: 2px }
.afb-arrow { font-size: 22px; font-weight: 700; opacity: 0.9 }
.apk-frame-banner:active { transform: scale(0.97) }
.apk-frame-banner:disabled { opacity: 0.8; animation: none }
@keyframes afb-pulse {
  0%, 100% { box-shadow: 0 8px 26px rgba(192, 52, 52, 0.45), 0 0 0 4px rgba(224, 85, 46, 0.18) }
  50% { box-shadow: 0 8px 30px rgba(192, 52, 52, 0.6), 0 0 0 8px rgba(224, 85, 46, 0.06) }
}
@keyframes afb-shine {
  0% { transform: translateX(-100%) }
  60%, 100% { transform: translateX(100%) }
}
</style>
