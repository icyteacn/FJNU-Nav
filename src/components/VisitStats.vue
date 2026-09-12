<script setup>
/**
 * 访问统计卡片：使用 Vercount 第三方统计服务
 * 服务端持久化，支持跨设备共享真实 UV/PV
 */
import { ref, onMounted } from 'vue'

const uv = ref(0)
const pv = ref(0)
const loaded = ref(false)

const VERCOUNT_SCRIPT = 'https://vercount.one/js'
const VERCOUNT_API = 'https://events.vercount.one/api/v2/log'
const UV_COOKIE = 'vercount_uv_fjnu'
const STORAGE_KEY = 'fjnu_nav_visit_cache'

function getUvCookie() {
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + UV_COOKIE + '=([^;]*)'))
  return m ? m[1] : null
}

function setUvCookie() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  document.cookie = UV_COOKIE + '=1; expires=' + d.toUTCString() + '; path=/'
}

function fetchFromAPI() {
  const url = location.href
  const isNewUv = !getUvCookie()
  if (isNewUv) setUvCookie()

  return fetch(VERCOUNT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, isNewUv }),
  }).then(r => r.json()).then(res => {
    const data = res.data || res
    return { pv: Number(data.site_pv) || 0, uv: Number(data.site_uv) || 0 }
  }).catch(() => null)
}

function loadScript() {
  return new Promise(resolve => {
    if (document.querySelector('script[src="' + VERCOUNT_SCRIPT + '"]')) {
      resolve(); return
    }
    const s = document.createElement('script')
    s.src = VERCOUNT_SCRIPT
    s.async = true
    s.onload = resolve
    s.onerror = resolve
    document.head.appendChild(s)
  })
}

function readFromDOM() {
  const pvEl = document.getElementById('busuanzi_value_site_pv')
  const uvEl = document.getElementById('busuanzi_value_site_uv')
  const pvVal = pvEl ? parseInt(pvEl.textContent) : NaN
  const uvVal = uvEl ? parseInt(uvEl.textContent) : NaN
  if (!isNaN(pvVal) && !isNaN(uvVal) && pvVal > 0) {
    return { pv: pvVal, uv: uvVal }
  }
  return null
}

onMounted(async () => {
  // 1. 先用缓存快速回填
  try {
    const cached = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
    if (cached.pv > 0) {
      pv.value = cached.pv
      uv.value = cached.uv
      loaded.value = true
    }
  } catch {}

  // 2. 加载 Vercount 脚本
  await loadScript()

  // 3. 等 DOM 锚点渲染
  await new Promise(r => setTimeout(r, 800))
  let data = readFromDOM()

  // 4. DOM 没拿到就直连 API
  if (!data) {
    data = await fetchFromAPI()
  }

  // 5. 更新数据
  if (data) {
    pv.value = data.pv
    uv.value = data.uv
    loaded.value = true
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
})
</script>

<template>
  <div class="visit-stats">
    <div class="vs-grid">
      <div class="vs-card">
        <span class="vs-icon">👥</span>
        <div class="vs-cell">
          <span class="vs-num">{{ loaded ? uv : '···' }}</span>
          <span class="vs-label">独立访客</span>
        </div>
      </div>
      <div class="vs-card">
        <span class="vs-icon">📈</span>
        <div class="vs-cell">
          <span class="vs-num">{{ loaded ? pv : '···' }}</span>
          <span class="vs-label">累计访问</span>
        </div>
      </div>
    </div>
    <div class="vs-note">本站累计 · Vercount 统计</div>
  </div>
</template>

<style scoped>
.visit-stats {
  background: linear-gradient(135deg, var(--primary-soft, #e8f0fe), var(--soft-fg, #f8f9fa));
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 12px;
}
.vs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.vs-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--card, #fff);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all .2s;
}
.vs-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.vs-icon { font-size: 22px; }
.vs-cell { display: flex; flex-direction: column; }
.vs-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary, #1565c0);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.vs-label {
  font-size: 11px;
  color: var(--text-sub, #888);
  margin-top: 1px;
}
.vs-note {
  text-align: center;
  font-size: 11px;
  color: var(--text-sub, #aaa);
  margin-top: 8px;
}
</style>
