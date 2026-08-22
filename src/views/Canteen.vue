<script setup>
import { ref, computed, onMounted } from 'vue'
import { canteens, canteenStats } from '../data/canteens'
import { menu } from '../data/foods'
import { apiFetch } from '../api/index'

const emit = defineEmits(['back'])
const campus = ref('全部')
const live = ref(null)
const loading = ref(true)
const openFood = ref(null)

const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const now = new Date()
const today = dayNames[now.getDay()]
const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')

async function loadLive() {
  try {
    const r = await apiFetch('/canteen')
    if (r && Array.isArray(r.items) && r.items.length) {
      live.value = r
      return
    }
  } catch (e) { /* noop */ }
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/canteen_live.json', { signal: AbortSignal.timeout(6000) })
    if (res.ok) {
      const d = await res.json()
      if (d && Array.isArray(d.items) && d.items.length) live.value = d
    }
  } catch (e) { /* noop */ }
}

onMounted(async () => {
  await loadLive()
  loading.value = false
})

const list = computed(() => {
  if (campus.value === '全部') return canteens
  return canteens.filter((c) => c.campus === campus.value)
})

function peopleOf(c) {
  if (!live.value || !live.value.items) return null
  const hit = live.value.items.find((it) => {
    const a = (it.name || '').replace(/\s/g, '')
    const b = (c.name || '').replace(/\s/g, '')
    return a === b || a.includes(b) || b.includes(a)
  })
  return hit ? hit.people : null
}
function dailyOf(c) {
  if (!live.value || !live.value.items) return null
  const hit = live.value.items.find((it) => {
    const a = (it.name || '').replace(/\s/g, '')
    const b = (c.name || '').replace(/\s/g, '')
    return a === b || a.includes(b) || b.includes(a)
  })
  return hit ? hit.daily : null
}
function seatsOf(c) {
  if (!live.value || !live.value.items) return c.seats ? String(c.seats) : '—'
  const hit = live.value.items.find((it) => {
    const a = (it.name || '').replace(/\s/g, '')
    const b = (c.name || '').replace(/\s/g, '')
    return a === b || a.includes(b) || b.includes(a)
  })
  return hit ? (hit.seats || c.seats || '—') : (c.seats ? String(c.seats) : '—')
}
function busyOf(c) {
  const p = peopleOf(c)
  const s = seatsOf(c)
  if (p == null || s == null || s === '—') return null
  const ratio = p / Number(s)
  if (ratio < 0.2) return { label: '宽松', cls: 'busy-easy', pct: Math.round(ratio * 100) }
  if (ratio < 0.5) return { label: '适中', cls: 'busy-ok', pct: Math.round(ratio * 100) }
  return { label: '拥挤', cls: 'busy-full', pct: Math.round(ratio * 100) }
}
function busyPct(c) {
  const p = peopleOf(c)
  const s = seatsOf(c)
  if (p == null || s == null || s === '—') return 0
  return Math.min(100, Math.round((p / Number(s)) * 100))
}
function foodsOf(c) {
  return c.foods.map((f) => ({ name: f, dishes: menu[f] || [] }))
}

function basicOpen() {
  const h = now.getHours()
  const m = now.getMinutes()
  const t = h * 60 + m
  return (t >= 390 && t <= 540) || (t >= 630 && t <= 780) || (t >= 990 && t <= 1140)
}
const isFlavorOpen = computed(() => {
  const t = now.getHours() * 60 + now.getMinutes()
  return t >= 390 && t <= 1290
})
const mealTag = computed(() => {
  const h = now.getHours()
  if (h < 6) return { t: '未营业', open: false }
  if (h < 9) return { t: '早餐时段', open: true }
  if (h < 10) return { t: '非供餐时段', open: false }
  if (h < 13.5) return { t: '午餐时段', open: true }
  if (h < 16.5) return { t: '非供餐时段', open: false }
  if (h < 19) return { t: '晚餐时段', open: true }
  if (h < 21.5) return { t: '风味持续供餐', open: true }
  return { t: '已过供餐时段', open: false }
})
const openCount = computed(() => list.value.filter((c) => (c.type === 'basic' ? basicOpen() : isFlavorOpen.value)).length)

function toggleFood(name) {
  openFood.value = openFood.value === name ? null : name
}
</script>

<template>
  <div>
    <div class="view-top">
      <button class="back-btn" @click="emit('back')">← 返回首页</button>
      <div class="view-title">食堂空座率</div>
      <div class="view-sub">福star食堂名单 · 实时空座监测 · 档口菜价一览</div>
    </div>

    <div class="panel status-panel">
      <div class="status-header">
        <span class="status-dot" :class="mealTag.open ? 'on' : 'off'"></span>
        <div class="status-info">
          <div class="status-title">{{ mealTag.t }} · {{ today }} {{ hm }}</div>
          <div class="muted" style="font-size: 12px; margin-top: 2px;">
            当前在营餐厅 {{ openCount }} / {{ list.length }} 家
          </div>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat-pill">
          <b>{{ canteenStats.total }}</b>
          <span>校内餐厅</span>
        </div>
        <div class="stat-pill">
          <b>{{ canteenStats.basic }}</b>
          <span>大众窗口</span>
        </div>
        <div class="stat-pill">
          <b>{{ canteenStats.flavor }}</b>
          <span>风味档口</span>
        </div>
      </div>
      <div class="hour-row">
        <span class="hour-tag basic">大众窗口 {{ canteenStats.basicHours }}</span>
        <span class="hour-tag flavor">风味档口 {{ canteenStats.flavorHours }}</span>
      </div>
      <div class="muted" style="font-size: 11px; margin-top: 6px">
        服务热线 {{ canteenStats.hotline }} · 数据来源：福建师范大学后勤服务集团
      </div>
    </div>

    <div class="seg" style="margin: 12px 0">
      <button class="seg-btn" :class="{ active: campus === '全部' }" @click="campus = '全部'">全部</button>
      <button class="seg-btn" :class="{ active: campus === '旗山校区' }" @click="campus = '旗山校区'">旗山</button>
      <button class="seg-btn" :class="{ active: campus === '仓山校区' }" @click="campus = '仓山校区'">仓山</button>
    </div>

    <div v-if="loading" class="skeleton-list">
      <div v-for="i in 4" :key="i" class="skeleton-row"><div class="skeleton" style="width: 90%; height: 56px"></div></div>
    </div>
    <div v-else class="canteen-list">
      <div v-for="c in list" :key="c.name" class="canteen-card">
        <button class="canteen-header" @click="toggleFood(c.name)">
          <div class="canteen-name-row">
            <span class="canteen-name">{{ c.name }}</span>
            <span class="type-tag" :class="c.type">{{ c.type === 'basic' ? '大众窗口' : '风味档口' }}</span>
            <span v-if="c.note" class="note-tag">{{ c.note }}</span>
          </div>
          <div class="canteen-meta">
            <span class="canteen-area">📍 {{ c.area }}</span>
            <span class="canteen-toggle">{{ openFood === c.name ? '收起 ▴' : '菜单·菜价 ▾' }}</span>
          </div>
        </button>
        <div class="canteen-metrics">
          <div class="metric-main">
            <span class="metric-people">{{ peopleOf(c) != null ? peopleOf(c) : '--' }}</span>
            <span class="metric-slash">/</span>
            <span class="metric-seats">{{ seatsOf(c) }}</span>
            <span class="metric-unit">人</span>
          </div>
          <div class="metric-bar-wrap">
            <div class="metric-bar"><div class="metric-bar-fill" :style="{ width: busyPct(c) + '%' }" :class="busyOf(c)?.cls || ''"></div></div>
          </div>
          <div class="metric-right">
            <span class="metric-count" v-if="dailyOf(c) != null">*{{ dailyOf(c) }} 次</span>
            <span v-if="busyOf(c)" class="busy-tag" :class="busyOf(c).cls">{{ busyOf(c).label }}</span>
          </div>
        </div>
        <div v-if="openFood === c.name" class="food-list">
          <div v-for="f in foodsOf(c)" :key="f.name" class="food-card">
            <div class="food-name">{{ f.name }}</div>
            <div v-if="f.dishes.length" class="food-dishes">
              <span v-for="d in f.dishes" :key="d.name" class="dish-chip">
                {{ d.name }} · <b class="price">{{ d.price }}元</b>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="live && live.updatedAt" class="update-info">
        <div class="update-time">
          <span class="update-label">数据更新：</span>
          <span class="update-value">{{ live.updatedAt }}</span>
        </div>
        <div class="update-hint">
          <span v-if="mealTag.open" class="update-status live">实时数据</span>
          <span v-else class="update-status snapshot">快照数据</span>
          <span class="muted">建议在早(7-9点)、中(11-13点)、晚(17-19点)餐时段查看最新数据</span>
        </div>
      </div>
    </div>

    <div class="source-bar" style="margin-top: 14px">
      <span>📋 名单与菜价：福star后勤服务集团 + 福starWiki《校园餐饮》 · 实时空座：福Star「食堂人流量分析」</span>
    </div>
  </div>
</template>

<style scoped>
.status-panel { }
.status-header { display: flex; align-items: center; gap: 12px; }
.status-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.status-dot.on { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15); }
.status-dot.off { background: #d1d5db; }
.status-info { flex: 1; }
.status-title { font-weight: 800; font-size: 16px; }
.update-info { margin-top: 12px; padding: 12px; background: var(--soft-fg); border-radius: var(--radius); border: 1px solid var(--border); }
.update-time { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.update-label { font-size: 12px; color: var(--text-sub); }
.update-value { font-size: 12px; font-weight: 600; color: var(--text); }
.update-hint { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.update-status { font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.update-status.live { background: #dcfce7; color: #166534; }
.update-status.snapshot { background: #fef3c7; color: #92400e; }
.stat-grid { display: flex; gap: 10px; margin-top: 12px; }
.stat-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  background: var(--bg);
}
.stat-pill b { font-size: 18px; color: var(--primary); }
.stat-pill span { font-size: 10px; color: var(--text-light); }
.hour-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.hour-tag { font-size: 11px; padding: 4px 10px; border-radius: 999px; }
.hour-tag.basic { background: var(--soft-blue); color: var(--primary); }
.hour-tag.flavor { background: var(--soft-yellow); color: #e65100; }
.canteen-list { display: flex; flex-direction: column; gap: 10px; }
.canteen-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.canteen-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.canteen-header:hover { background: var(--soft-fg); }
.canteen-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.canteen-name { font-weight: 800; font-size: 14px; }
.type-tag { font-size: 10px; padding: 2px 8px; border-radius: 999px; }
.type-tag.basic { background: var(--soft-blue); color: var(--primary); }
.type-tag.flavor { background: var(--soft-yellow); color: #e65100; }
.note-tag { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: var(--soft-yellow); color: #e65100; }
.canteen-meta { display: flex; justify-content: space-between; align-items: center; }
.canteen-area { font-size: 11px; color: var(--text-light); }
.canteen-toggle { font-size: 11px; color: var(--primary); font-weight: 600; }
.canteen-metrics {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px 12px;
  font-variant-numeric: tabular-nums;
}
.metric-main { display: flex; align-items: baseline; gap: 3px; }
.metric-people { font-weight: 800; font-size: 18px; color: var(--primary); }
.metric-slash { color: var(--text-light); font-size: 14px; }
.metric-seats { color: var(--text-light); font-size: 14px; }
.metric-unit { color: var(--text-light); font-size: 11px; margin-left: 2px; }
.metric-bar-wrap { flex: 1; }
.metric-bar { height: 6px; background: var(--soft-gray); border-radius: 3px; overflow: hidden; }
.metric-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.metric-bar-fill.busy-easy { background: #22c55e; }
.metric-bar-fill.busy-ok { background: #f59e0b; }
.metric-bar-fill.busy-full { background: #ef4444; }
.metric-right { display: flex; align-items: center; gap: 6px; }
.metric-count { color: var(--text-light); font-size: 11px; }
.busy-tag { font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
.busy-easy { background: var(--soft-green-bg); color: var(--soft-green-text); }
.busy-ok { background: var(--soft-yellow); color: #b45309; }
.busy-full { background: var(--soft-red-bg); color: var(--soft-red-text); }
.food-list { display: flex; flex-direction: column; gap: 6px; padding: 0 14px 12px; }
.food-card { border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; background: var(--soft-fg); }
.food-name { font-size: 12px; font-weight: 700; color: var(--primary-dark); }
.food-dishes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.dish-chip { font-size: 11px; padding: 3px 8px; border-radius: 8px; background: var(--card); border: 1px solid var(--border); color: var(--text); }
.dish-chip .price { color: #e65100; }
</style>
