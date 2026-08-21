<script setup>
/**
 * 今天吃什么页面
 * 灵感参考：https://nfs.pcdawn.cn/app/whatToEatToday（NextFStar 多维度筛选 + 抽取动画）
 * 本项目复刻了校区/餐次/预算/口味筛选 + 菜品详情弹窗 + 抽取动画功能。
 */
import { ref, computed, onMounted } from 'vue'
import { foods, halls, menu } from '../data/foods'
import CountUp from '../components/CountUp.vue'

const emit = defineEmits(['back'])

const picks = ref([])
const pickedCount = ref(0)
const showAll = ref(false)
const campusFilter = ref('全部')
const mealFilter = ref('全部')
const budgetFilter = ref('全部')
const tasteFilter = ref('全部')
const selectedDish = ref(null)
const showDetail = ref(false)
const drawing = ref(false)

const CAMPUSES = ['全部', '旗山校区', '仓山校区']
const MEALS = ['全部', '早餐', '正餐', '夜宵']
const BUDGETS = ['全部', '8元以内', '8-15元', '15-25元', '25元以上']
const TASTES = ['全部', '清淡', '微辣', '中辣', '重辣']

const mealTypeMap = {
  '全部': null,
  '早餐': '早餐',
  '正餐': '正餐',
  '夜宵': '夜宵'
}

const budgetMap = {
  '全部': null,
  '8元以内': [0, 8],
  '8-15元': [8, 15],
  '15-25元': [15, 25],
  '25元以上': [25, 999]
}

const spiceMap = {
  '全部': null,
  '清淡': 0,
  '微辣': 1,
  '中辣': 2,
  '重辣': 3
}

const filteredPool = computed(() => {
  let pool = [...foods]
  if (campusFilter.value !== '全部') {
    pool = pool.filter(f => f.campus === campusFilter.value)
  }
  if (mealFilter.value !== '全部') {
    pool = pool.filter(f => f.tag === mealFilter.value)
  }
  if (budgetFilter.value !== '全部') {
    const [min, max] = budgetMap[budgetFilter.value] || [0, 999]
    pool = pool.filter(f => {
      const dishes = menu[f.name] || []
      return dishes.some(d => d.price >= min && d.price < max)
    })
  }
  if (tasteFilter.value !== '全部') {
    const targetSpice = spiceMap[tasteFilter.value]
    pool = pool.filter(f => {
      const dishes = menu[f.name] || []
      return dishes.some(d => d.spicy === targetSpice)
    })
  }
  return pool
})

function pickFrom(pool, count) {
  const p = [...pool]
  const res = []
  while (res.length < count && p.length) {
    const i = Math.floor(Math.random() * p.length)
    const item = p.splice(i, 1)[0]
    const dishes = menu[item.name] || []
    const dish = dishes.length ? dishes[Math.floor(Math.random() * dishes.length)] : null
    res.push({ ...item, dish })
  }
  return res
}

async function roll() {
  drawing.value = true
  await new Promise(r => setTimeout(r, 600))
  picks.value = pickFrom(filteredPool.value, 3)
  pickedCount.value += 1
  sessionStorage.setItem('fjnu_food_picked', String(pickedCount.value))
  drawing.value = false
}

function pickOne() {
  const single = pickFrom(filteredPool.value, 1)
  picks.value = single
  pickedCount.value += 1
  sessionStorage.setItem('fjnu_food_picked', String(pickedCount.value))
}

function openDetail(f) {
  selectedDish.value = f
  showDetail.value = true
}

function setCampus(c) {
  campusFilter.value = c
  roll()
}

function spiceIcon(level) {
  return '🌶️'.repeat(level) || '🍽️'
}

function priceOf(f) {
  if (f.dish) return f.dish.price
  const dishes = menu[f.name] || []
  return dishes.length ? dishes[0].price : 0
}

function descOf(f) {
  if (f.dish) return f.dish.desc
  const dishes = menu[f.name] || []
  return dishes.length ? dishes[0].desc : ''
}

onMounted(() => {
  pickedCount.value = Number(sessionStorage.getItem('fjnu_food_picked')) || 0
  roll()
})
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">今天吃什么</div>
    <div class="view-sub">选择困难？帮你随机决定 · 今日已随机 <CountUp :value="pickedCount" /> 次</div>
  </div>

  <div class="panel draw-panel">
    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">校区</span>
        <div class="filter-chips">
          <button v-for="c in CAMPUSES" :key="c" class="chip" :class="{ active: campusFilter === c }" @click="setCampus(c)">{{ c }}</button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">餐次</span>
        <div class="filter-chips">
          <button v-for="m in MEALS" :key="m" class="chip" :class="{ active: mealFilter === m }" @click="mealFilter = m; roll()">{{ m }}</button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">预算</span>
        <div class="filter-chips">
          <button v-for="b in BUDGETS" :key="b" class="chip" :class="{ active: budgetFilter === b }" @click="budgetFilter = b; roll()">{{ b }}</button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">口味</span>
        <div class="filter-chips">
          <button v-for="t in TASTES" :key="t" class="chip" :class="{ active: tasteFilter === t }" @click="tasteFilter = t; roll()">{{ t }}</button>
        </div>
      </div>
    </div>

    <div v-if="drawing" class="drawing-state">
      <div class="drawing-spinner">🍽️</div>
      <div>正在替你想办法...</div>
    </div>

    <div v-else class="draw-result">
      <div v-if="picks.length" class="result-cards">
        <div v-for="(f, i) in picks" :key="i" class="result-card" @click="openDetail(f)">
          <div class="card-header">
            <span class="card-emoji">{{ f.tag === '早餐' ? '🌅' : f.tag === '夜宵' ? '🌙' : '☀️' }}</span>
            <span class="card-price">¥{{ priceOf(f) }}</span>
          </div>
          <div class="card-name">{{ f.name }}</div>
          <div class="card-dish" v-if="f.dish">{{ f.dish.name }}</div>
          <div class="card-desc muted">{{ descOf(f) }}</div>
          <div class="card-tags">
            <span class="card-tag">{{ f.tag }}</span>
            <span class="card-spice">{{ spiceIcon(f.dish?.spicy || 0) }}</span>
          </div>
          <div class="card-location">
            <span>📍 {{ f.hall }}</span>
            <span class="muted">{{ f.campus }} · {{ f.zone }}</span>
          </div>
          <div class="card-detail-hint">点击查看详情 ›</div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div style="font-size:48px;margin-bottom:12px;">🍜</div>
        <div>没有符合筛选条件的菜品</div>
        <div class="muted" style="font-size:13px;margin-top:6px;">试试调整筛选条件</div>
      </div>
    </div>

    <div class="draw-actions">
      <button class="btn" @click="roll">🔄 换一个</button>
      <button class="btn accent" @click="pickOne">🎯 就吃这个</button>
    </div>

    <div class="muted" style="text-align:center;font-size:12px;margin-top:12px;">
      菜品均为食堂真实档口（据福师大Wiki《校园餐饮》与公开信息），价格仅供参考
    </div>
  </div>

  <div class="panel">
    <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>档口库（<CountUp :value="foods.length" /> 个）</div>
    <div class="tab-row" style="flex-wrap:wrap;gap:6px;">
      <button v-for="t in ['全部', '早餐', '正餐', '夜宵']" :key="t" class="tab" :class="{ active: filter === t }" @click="filter = t">{{ t }}</button>
    </div>
    <div style="overflow-x:auto;">
      <table class="data">
        <thead><tr><th>档口</th><th>参考价</th><th>餐厅</th><th>校区</th><th>口味</th></tr></thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.hall + f.name" @click="openDetail(f)" style="cursor:pointer;">
            <td><b>{{ f.name }}</b></td>
            <td>¥{{ priceOf(f) }}</td>
            <td>{{ f.hall }}</td>
            <td>{{ f.campus }}</td>
            <td>{{ spiceIcon(f.spicy || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="panel" style="margin-top:16px;">
    <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>食堂一览（<CountUp :value="halls.length" /> 家）</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
      <div v-for="h in halls" :key="h.name" style="background:var(--soft-fg);border-radius:12px;padding:12px;">
        <b>{{ h.name }}</b>
        <div class="muted" style="font-size:12px;margin-top:4px;">{{ h.campus }} · {{ h.zone }}</div>
      </div>
    </div>
  </div>

  <div v-if="showDetail && selectedDish" class="overlay" @click.self="showDetail = false">
    <div class="overlay-card dish-detail">
      <div class="detail-head">
        <div class="detail-title">{{ selectedDish.name }}</div>
        <button class="overlay-close" @click="showDetail = false">✕</button>
      </div>
      <div class="detail-price">¥{{ priceOf(selectedDish) }}</div>
      <div class="detail-desc">{{ descOf(selectedDish) || '暂无详细描述' }}</div>
      <div class="detail-row"><span>餐次</span><b>{{ selectedDish.tag }}</b></div>
      <div class="detail-row"><span>口味</span><b>{{ spiceIcon(selectedDish.spicy || 0) }}</b></div>
      <div class="detail-row"><span>餐厅</span><b>{{ selectedDish.hall }}</b></div>
      <div class="detail-row"><span>位置</span><b>{{ selectedDish.campus }} · {{ selectedDish.zone }}</b></div>
      <div class="detail-row"><span>类型</span><b>{{ selectedDish.tag }}</b></div>
      <div v-if="selectedDish.tags?.length" class="detail-tags">
        <span v-for="t in selectedDish.tags" :key="t" class="detail-tag">{{ t }}</span>
      </div>
      <button class="btn accent" style="width:100%;margin-top:14px;" @click="showDetail = false">知道了</button>
    </div>
  </div>
</template>

<style scoped>
.draw-panel { text-align: center; }
.filter-section { margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.filter-label { font-size: 13px; font-weight: 600; color: var(--text-sub); min-width: 40px; }
.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 6px 12px; border-radius: 999px; background: var(--soft-gray); border: 1px solid transparent; color: var(--text-sub); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: 0.2s; }
.chip.active { background: var(--primary); color: #fff; }
.drawing-state { padding: 40px 0; }
.drawing-spinner { font-size: 48px; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.result-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
.result-card {
  background: var(--soft-fg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.result-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-emoji { font-size: 24px; }
.card-price { font-size: 18px; font-weight: 800; color: var(--primary); }
.card-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.card-dish { font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 12px; line-height: 1.5; margin-bottom: 8px; }
.card-tags { display: flex; gap: 6px; margin-bottom: 8px; }
.card-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--primary-soft); color: var(--primary); font-weight: 600; }
.card-spice { font-size: 11px; }
.card-location { font-size: 11px; color: var(--text-sub); display: flex; flex-direction: column; gap: 2px; }
.card-detail-hint { font-size: 11px; color: var(--primary); margin-top: 8px; font-weight: 600; }
.draw-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.empty-state { padding: 30px 0; }
.overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 60; }
.overlay-card { background: var(--card); border-radius: var(--radius-lg); padding: 18px; width: 100%; max-width: 420px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25); }
.detail-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.detail-title { font-size: 18px; font-weight: 800; flex: 1; }
.overlay-close { border: none; background: none; font-size: 16px; cursor: pointer; color: var(--text-sub); }
.detail-price { font-size: 24px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
.detail-desc { font-size: 14px; color: var(--text-sub); margin-bottom: 12px; line-height: 1.6; }
.detail-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: 13px; }
.detail-row span { flex: 0 0 52px; color: var(--text-sub); }
.detail-row b { flex: 1; color: var(--text); font-weight: 600; }
.detail-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.detail-tag { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--soft-gray); color: var(--text-sub); font-weight: 600; }
</style>
