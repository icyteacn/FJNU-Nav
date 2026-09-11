<script setup>
/**
 * 访问统计卡片：客户端 UV/PV 统计
 * 纯静态托管方案：localStorage 存储匿名访客 ID，sessionStorage 缓存当次数据
 */
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'fjnu_nav_visit_v1'
const VID_KEY = 'fjnu_nav_vid'

const uv = ref(0)
const pv = ref(0)
const loaded = ref(false)

function getVisitorId() {
  let vid = localStorage.getItem(VID_KEY)
  if (!vid) {
    vid = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(VID_KEY, vid)
  }
  return vid
}

function getVisitData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { visitors: [], totalPv: 0 }
  } catch { return { visitors: [], totalPv: 0 } }
}

function saveVisitData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

onMounted(() => {
  const data = getVisitData()
  const vid = getVisitorId()

  if (!data.visitors.includes(vid)) {
    data.visitors.push(vid)
  }
  data.totalPv++
  saveVisitData(data)

  const cached = sessionStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      const c = JSON.parse(cached)
      uv.value = c.uv
      pv.value = c.pv
      loaded.value = true
    } catch {}
  }

  setTimeout(() => {
    uv.value = data.visitors.length
    pv.value = data.totalPv
    loaded.value = true
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ uv: uv.value, pv: pv.value }))
  }, 300)
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
    <div class="vs-note">本站累计 · 本地统计</div>
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