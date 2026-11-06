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
    📲 {{ busy ? '正在准备下载…' : `课表 App 有新版本${ver ? ' v' + ver : ''}，点击下载安装包` }}
  </button>
</template>

<style scoped>
.apk-frame-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 9999;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--brand-1, #b8433f), var(--brand-2, #d4704e));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}
.apk-frame-banner:active { transform: scale(0.98) }
.apk-frame-banner:disabled { opacity: 0.75 }
</style>
