<script setup>
import { ref, computed, onMounted } from 'vue'
import CountUp from '../components/CountUp.vue'

const emit = defineEmits(['back'])

const PAIRS = [
  ['知明楼', '校训「知明」'],
  ['笃行楼', '校训「行笃」'],
  ['立诚楼', '校训「立诚」'],
  ['致广楼', '校训「致广」'],
  ['又玄图书馆', '旗山校区东门旁'],
  ['星雨湖', '人文楼旁'],
  ['人文楼', '心理学院在 7 层'],
  ['长安山', '仓山老校区后山'],
  ['邵逸夫楼', '仓山地理学院'],
  ['田家炳教育书院', '仓山老校区'],
  ['翠竹园餐厅', '共青团广场旁'],
  ['百草园餐厅', '二楼有麦当劳'],
  ['嘉树园餐厅', '有 5 元营养餐'],
  ['随园餐厅', '南区 · 兰苑旁'],
  ['星雨剧场', '传播学院旁'],
  ['建明 76 游泳馆', '海外教育学院旁']
]

const BACK_IMGS = []

const DIFFS = {
  easy: { label: '简单', pairs: 6, cols: 4 },
  normal: { label: '普通', pairs: 10, cols: 5 },
  hard: { label: '挑战', pairs: 15, cols: 6 }
}
/** 卡背图加载失败记录（弱网/校外环境回退到 emoji 卡片） */
const broken = ref([])
onMounted(() => {
  BACK_IMGS.forEach((u) => {
    const img = new Image()
    img.onerror = () => { if (!broken.value.includes(u)) broken.value.push(u) }
    img.src = u
  })
})
const diff = ref('easy')
const activePairs = computed(() => PAIRS.slice(0, DIFFS[diff.value].pairs))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildCards() {
  const cards = activePairs.value.flatMap(([a, b], pair) => [
    { id: a + b + 'a' + pair, pair, label: a, newName: true, img: BACK_IMGS[(pair * 2) % Math.max(BACK_IMGS.length, 1)] },
    { id: a + b + 'b' + pair, pair, label: b, newName: false, img: BACK_IMGS[(pair * 2 + 1) % Math.max(BACK_IMGS.length, 1)] }
  ])
  return shuffle(cards)
}

const cards = ref(buildCards())
const flipped = ref([])
const matched = ref(new Set())
const confirmPair = ref(null)
const pickedId = ref(null)
const moves = ref(0)
const best = ref(Number(localStorage.getItem('fjnu_bm_best')) || null)
const done = ref(false)
const found = ref(false)
const noPair = ref(false)
const help = ref(false)
const cheat = ref(false)
const cheatTimer = ref(null)

const finished = computed(() => matched.value.size === activePairs.value.length)
const stars = computed(() => {
  if (!finished.value) return 0
  const n = activePairs.value.length
  if (moves.value <= n * 1.6) return 3
  if (moves.value <= n * 2.2) return 2
  return 1
})

function pickDiff(d) {
  diff.value = d
  restart()
}

function isOpen(c) {
  return matched.value.has(c.pair) || flipped.value.includes(c.id)
}

function byId(id) {
  return cards.value.find((c) => c.id === id)
}

function checkWin() {
  if (matched.value.size === activePairs.value.length) {
    done.value = true
    if (!best.value || moves.value < best.value) {
      best.value = moves.value
      localStorage.setItem('fjnu_bm_best', String(best.value))
    }
  }
}

function flip(card) {
  if (done.value || matched.value.has(card.pair)) return

  if (confirmPair.value) {
    const cp = confirmPair.value
    if (card.id !== cp.a && card.id !== cp.b) return
    if (!pickedId.value) {
      pickedId.value = card.id
      return
    }
    if (pickedId.value !== card.id) {
      matched.value.add(cp.pair)
      flipped.value = []
      confirmPair.value = null
      pickedId.value = null
      found.value = false
      checkWin()
    }
    return
  }

  if (flipped.value.includes(card.id) || flipped.value.length >= 4) return
  flipped.value.push(card.id)

  if (flipped.value.length === 4) {
    moves.value += 1
    const group = {}
    flipped.value.forEach((id) => {
      const p = byId(id).pair
      ;(group[p] = group[p] || []).push(id)
    })
    const pairFound = Object.values(group).find((arr) => arr.length === 2)
    if (pairFound) {
      found.value = true
      const pair = byId(pairFound[0]).pair
      confirmPair.value = { a: pairFound[0], b: pairFound[1], pair }
      flipped.value = pairFound
    } else {
      noPair.value = true
      setTimeout(() => {
        flipped.value = []
        noPair.value = false
      }, 700)
    }
  }
}

function openCheat() {
  cheat.value = true
  clearTimeout(cheatTimer.value)
  cheatTimer.value = setTimeout(() => { cheat.value = false }, 3200)
}

function restart() {
  cards.value = buildCards()
  flipped.value = []
  matched.value = new Set()
  confirmPair.value = null
  pickedId.value = null
  found.value = false
  noPair.value = false
  moves.value = 0
  done.value = false
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">教学楼速配</div>
    <div class="view-sub">楼名 × 地标配对 · 一次可翻 4 张记忆 · 配对应从照片上翻起</div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <div class="stat-pill"><b>{{ moves }}</b><span>步数</span></div>
      <div class="stat-pill"><b>{{ matched.size }}/{{ activePairs.length }}</b><span>已配对</span></div>
      <div class="stat-pill" v-if="best"><b>{{ best }}</b><span>最佳</span></div>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <button class="btn ghost" style="padding:7px 14px;" @click="help = true">❓ 玩法</button>
        <button class="btn ghost" style="padding:7px 14px;" @click="openCheat">✨ 开挂</button>
        <button class="btn ghost" style="padding:7px 14px;" @click="restart">🔄 重开</button>
      </div>
    </div>

    <div class="tab-row" style="margin-top:12px;">
      <button v-for="(d, k) in DIFFS" :key="k" class="tab" :class="{ active: diff === k }" @click="pickDiff(k)">
        {{ d.label }} · {{ d.pairs }} 对
      </button>
    </div>

    <div v-if="finished" class="result-box" style="text-align:center;margin-top:12px;">
      <div style="font-size:26px;">🎉</div>
      <div style="font-weight:800;font-size:18px;">全部配对成功！</div>
      <div style="margin-top:4px;">{{ DIFFS[diff].label }}难度 · 用了 {{ moves }} 步 · 获得 {{ stars }} 星</div>
    </div>

    <div
      v-if="found"
      class="found-tip"
    >🔍 发现配对！点击两张高亮卡片确认（还需翻到对应两张才算成功哦）</div>
    <div v-else-if="noPair" class="found-tip bad">这 4 张里没有配对，已翻回，再试试</div>
    <div v-else-if="confirmPair && !pickedId" class="found-tip">先点击一张高亮卡片选中，再点击另一张完成配对</div>
    <div v-else-if="confirmPair && pickedId" class="found-tip good">已选中 ✅ 点击另一张高亮卡片配对</div>

    <div class="card-grid" :style="{ '--cols': DIFFS[diff].cols }">
      <button
        v-for="c in cards"
        :key="c.id"
        class="card"
        :class="{
          open: isOpen(c),
          match: matched.has(c.pair),
          confirm: confirmPair && (c.id === confirmPair.a || c.id === confirmPair.b),
          picked: pickedId === c.id,
          shake: noPair && flipped.includes(c.id)
        }"
        :style="!isOpen(c) && c.img && !broken.includes(c.img) ? { backgroundImage: 'url(' + c.img + ')' } : null"
        @click="flip(c)"
      >
        <template v-if="!isOpen(c) && broken.includes(c.img)">
          <span class="card-fallback">🏫</span>
        </template>
        <template v-if="isOpen(c)">
          <span class="card-label" :class="{ new: c.newName }">{{ c.label }}</span>
        </template>
        <template v-else>
          <span class="card-badge">福师大</span>
        </template>
      </button>
    </div>
    <div class="muted" style="font-size:11px;margin-top:10px;">卡背为福师大校园实景 · 名称对应据校训「知明行笃 立诚致广」与校园地标整理</div>
  </div>

  <div v-if="help" class="overlay" @click="help = false">
    <div class="overlay-card" @click.stop>
      <div style="font-weight:800;font-size:17px;margin-bottom:12px;">📖 玩法说明</div>
      <div style="font-size:14px;line-height:2;">
        <p>1. 卡片背面是福师大校园实景照片，点击翻开看楼名 / 地标。</p>
        <p>2. 每次可同时翻开 <b>4 张</b> 记忆：若 4 张里没有配对会自动翻回；<b>若发现配对</b>，两张卡片会高亮，但你还需依次点击这两张确认才算配对成功。</p>
        <p>3. 目标是找出「楼名 / 地标 ⇄ 位置 / 特征」的全部配对，步数越少星级越高。</p>
        <p>4. 卡住了？点「✨ 开挂」会显示 3 秒全部配对答案。</p>
      </div>
      <button class="btn accent" style="width:100%;margin-top:6px;" @click="help = false">明白了，开始！</button>
    </div>
  </div>

  <div v-if="cheat" class="overlay">
    <div class="cheat-box">
      <div style="font-weight:800;font-size:15px;margin-bottom:10px;">✨ 答案速览（3 秒后自动关闭）</div>
      <div v-for="(p, i) in activePairs" :key="i" class="cheat-row">
        <b style="color:var(--primary);">{{ p[0] }}</b>
        <span style="opacity:.6;">⇄</span>
        <span>{{ p[1] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), 1fr);
  gap: 10px;
  margin-top: 14px;
}
/* 手机端降列：挑战 6 列每列过窄（约 55px），统一压到 3 列保证可点 */
@media (max-width: 640px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
}
.card {
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  border: 1px solid var(--border);
  background-color: #c62828;
  background-image: linear-gradient(150deg, #c62828 0%, #e11d48 55%, #8b1e2d 100%);
  background-size: cover;
  background-position: center;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, box-shadow 0.15s ease;
  overflow: hidden;
}
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(198, 40, 40, 0.18), rgba(139, 30, 45, 0.42));
  pointer-events: none;
}
.card.open { background: var(--soft-fg); color: var(--text); border-color: var(--primary); }
.card.open::after { display: none; }
.card.match { background: var(--soft-green-bg); color: var(--soft-green-text); border-color: var(--soft-green-text); }
.card.match::after { display: none; }
.card.confirm {
  border-color: #f5a623;
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.55);
  animation: glow 1.1s ease-in-out infinite;
}
.card.picked { box-shadow: 0 0 0 4px var(--primary); }
.card.shake { animation: shake 0.4s ease; }
.card:not(.open):not(.match):not(.confirm):hover { transform: translateY(-2px); }
.card-label { position: relative; z-index: 1; font-size: 13px; font-weight: 800; padding: 0 4px; }
.card-fallback { font-size: 30px; line-height: 1; }
.card.open .card-label { color: var(--text); }
.card.match .card-label { color: var(--soft-green-text); }
.card-label.new { color: var(--primary); }
.card-badge {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(198, 40, 40, 0.55);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 54px;
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--bg);
}
.stat-pill b { font-size: 18px; color: var(--primary); }
.stat-pill span { font-size: 10px; color: var(--text-light); }
.found-tip {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--notice-bg);
  border: 1px solid var(--notice-border);
  color: var(--notice-text);
  font-size: 13px;
  font-weight: 600;
}
.found-tip.bad { background: var(--soft-red-bg); border-color: var(--soft-red-border); color: var(--soft-red-text); }
.found-tip.good { background: var(--soft-green-bg); border-color: var(--soft-green-border); color: var(--soft-green-text); }
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 20, 40, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 20px;
}
.overlay-card {
  background: var(--card);
  border-radius: 18px;
  padding: 22px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.overlay-card p { margin: 0; }
.cheat-box {
  background: var(--card);
  border-radius: 16px;
  padding: 18px 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.cheat-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  padding: 5px 0;
  border-bottom: 1px dashed var(--border);
}
.cheat-row:last-child { border-bottom: none; }
@keyframes glow {
  0%, 100% { box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.55); }
  50% { box-shadow: 0 0 0 6px rgba(245, 166, 35, 0.25); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>