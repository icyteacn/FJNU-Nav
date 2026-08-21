<script setup>
/** 通用加分快速选档器：手风琴分类 + 档位 chips + 计数步进，供科研分 / 综测分两处复用 */
import { reactive, computed } from 'vue'
import { state, togglePick, getCount, setCount, factorIdxOf, setFactorIdx } from '../stores/scholarship'
import { MEMBER_FACTORS } from '../data/researchRules'

const props = defineProps({
  kind: { type: String, required: true },
  detail: { type: Array, required: true },
})

const open = reactive({})
function toggleGroup(id) { open[id] = !open[id] }

function optsOf(item) {
  if (item.opts) return item.opts
  if (item.pts !== undefined) return [{ label: '', pts: item.pts }]
  return null
}
function isFlat(item) { return !item.opts && item.pts !== undefined }

const pickedKeys = computed(() => {
  const picks = props.kind === 'r' ? state.rPicks : state.zPicks
  return new Set(picks.map(p => p.gid + ':' + p.iid + ':' + p.oi))
})
function isPicked(gid, iid, oi) { return pickedKeys.value.has(gid + ':' + iid + ':' + oi) }
</script>

<template>
  <div class="sp">
    <div v-for="d in detail" :key="d.g.id" class="sp-group" :class="{ open: open[d.g.id], neg: d.g.mode === 'neg' }">
      <button class="sp-head" @click="toggleGroup(d.g.id)">
        <span class="sp-icon">{{ d.g.icon }}</span>
        <span class="sp-name">{{ d.g.name }}</span>
        <span v-if="d.active" class="sp-badge" :class="{ warn: d.capped > 0 }">{{ d.capped > 0 ? '超上限' : '+' + d.sum }}</span>
        <span class="sp-arrow">{{ open[d.g.id] ? '▾' : '▸' }}</span>
      </button>

      <div v-show="open[d.g.id]" class="sp-body">
        <p v-if="d.g.tip" class="sp-tip">ℹ️ {{ d.g.tip }}</p>

        <div v-if="d.g.factor" class="sp-factor">
          <span class="sp-factor-label">我的排名</span>
          <div class="sp-factor-btns">
            <button
              v-for="(f, i) in MEMBER_FACTORS" :key="f.label"
              class="sp-chip sm" :class="{ on: factorIdxOf(d.g.id) === i }"
              @click="setFactorIdx(d.g.id, i)"
            >{{ f.label }}<i v-if="f.f !== 1"> ×{{ f.f }}</i></button>
          </div>
        </div>

        <div v-for="item in d.g.items" :key="item.id" class="sp-item">
          <div v-if="!isFlat(item)" class="sp-item-label">
            {{ item.label }}
            <em v-if="item.opts && item.opts.length === 1 && isPicked(d.g.id, item.id, 0)" class="sp-check">✓</em>
          </div>
          <div v-if="!isFlat(item) && item.note" class="sp-item-note">{{ item.note }}</div>
          <div v-if="isFlat(item)" class="sp-opts">
            <button
              class="sp-chip wide" :class="{ on: isPicked(d.g.id, item.id, 0) }"
              @click="togglePick(props.kind, d.g.id, item, 0)"
            >{{ item.label }}<i>{{ item.pts > 0 ? '+' : '' }}{{ item.pts }}</i></button>
          </div>
          <div v-else-if="optsOf(item)" class="sp-opts">
            <button
              v-for="(o, oi) in optsOf(item)" :key="oi"
              class="sp-chip" :class="{ on: isPicked(d.g.id, item.id, oi), single: optsOf(item).length === 1 }"
              @click="togglePick(props.kind, d.g.id, item, oi)"
            ><template v-if="o.label">{{ o.label }}</template><i>{{ o.pts > 0 ? '+' : '' }}{{ o.pts }}</i></button>
          </div>
          <div v-else-if="item.count" class="sp-count">
            <button class="sp-step" @click="setCount(d.g.id, item, getCount(d.g.id, item) - 1)">−</button>
            <span class="sp-count-num">{{ getCount(d.g.id, item) }} {{ item.count.unit }}</span>
            <button class="sp-step" @click="setCount(d.g.id, item, getCount(d.g.id, item) + 1)">＋</button>
          </div>
        </div>

        <div v-if="d.capped > 0" class="sp-capwarn">⚠️ 本类累计已超上限 {{ d.g.cap }} 分，超出 {{ d.capped }} 分计入明细但总分按上限计</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sp { display: flex; flex-direction: column; gap: 8px; }
.sp-group { border: 1px solid var(--border); border-radius: var(--radius); background: var(--soft-fg); overflow: hidden; transition: box-shadow .2s; }
.sp-group.open { box-shadow: var(--shadow-hover, 0 4px 14px rgba(0,0,0,.08)); }
.sp-group.neg { border-color: #ef9a9a; }
.sp-head { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 14px; background: none; border: none; cursor: pointer; color: var(--text); text-align: left; }
.sp-head:hover { background: var(--primary-soft); }
.sp-icon { font-size: 18px; flex-shrink: 0; }
.sp-name { flex: 1; font-weight: 700; font-size: 14px; }
.sp-badge { font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 999px; background: var(--primary); color: #fff; flex-shrink: 0; }
.sp-badge.warn { background: #e65100; }
.sp-arrow { font-size: 12px; color: var(--text-sub); flex-shrink: 0; }
.sp-body { padding: 4px 14px 14px; display: flex; flex-direction: column; gap: 12px; animation: spIn .18s ease; }
@keyframes spIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.sp-tip { margin: 6px 0 0; font-size: 11px; line-height: 1.7; color: var(--text-sub); background: var(--primary-soft); border-radius: 8px; padding: 8px 10px; }

.sp-factor { display: flex; flex-direction: column; gap: 6px; }
.sp-factor-label { font-size: 12px; font-weight: 700; color: var(--text-sub); }
.sp-factor-btns { display: flex; flex-wrap: wrap; gap: 6px; }

.sp-item { display: flex; flex-direction: column; gap: 5px; padding-top: 8px; border-top: 1px dashed var(--border); }
.sp-item:first-of-type { border-top: none; padding-top: 0; }
.sp-item-label { font-size: 13px; font-weight: 600; line-height: 1.5; display: flex; align-items: center; gap: 6px; }
.sp-check { color: var(--primary); font-style: normal; font-weight: 800; }
.sp-item-note { font-size: 11px; color: var(--text-sub); }
.sp-opts { display: flex; flex-wrap: wrap; gap: 6px; }

.sp-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-size: 12px; cursor: pointer; transition: all .15s; }
.sp-chip i { font-style: normal; font-weight: 800; color: var(--primary); font-size: 11px; }
.sp-chip:hover { border-color: var(--primary); transform: translateY(-1px); }
.sp-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.sp-chip.on i { color: #fff; }
.sp-chip.sm { padding: 4px 10px; font-size: 11px; }
.sp-chip.single { min-width: 88px; justify-content: center; }
.sp-chip.wide { width: 100%; justify-content: space-between; border-radius: 10px; }

.sp-count { display: inline-flex; align-items: center; gap: 10px; }
.sp-count-num { min-width: 64px; text-align: center; font-weight: 800; font-size: 14px; color: var(--primary); }
.sp-step { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-size: 16px; cursor: pointer; transition: all .15s; line-height: 1; }
.sp-step:hover { border-color: var(--primary); color: var(--primary); }

.sp-capwarn { font-size: 11px; color: #b45309; background: var(--soft-yellow); border-radius: 8px; padding: 8px 10px; line-height: 1.6; }
</style>
