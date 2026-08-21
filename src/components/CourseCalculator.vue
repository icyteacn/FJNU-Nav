<script setup>
/** 课程加权平均分计算器：按专业预设计分课程目录，逐门输入成绩实时折算 */
import { computed } from 'vue'
import {
  state, setCourseScore, clearCourseScores, weightedAvg, profileOf,
} from '../stores/scholarship'
import { majorsForDegree, majorById } from '../data/courseCredits'

const prof = computed(profileOf)
const majors = computed(() => majorsForDegree(prof.value.degree))
const w = weightedAvg
const currentMajor = computed(() => majorById(state.major))

function onMajorChange(e) {
  const v = e.target.value
  if (state.major !== v) {
    state.major = v
    clearCourseScores()
  }
}
</script>

<template>
  <div class="cc">
    <div class="cc-head">
      <label class="cc-field">
        <span class="cc-label">我的专业（按计分课程目录预设）</span>
        <select :value="state.major" class="cc-select" @change="onMajorChange">
          <option value="">选择专业…</option>
          <option v-for="m in majors" :key="m.id" :value="m.id">{{ m.label }}</option>
        </select>
      </label>
      <button v-if="state.major" class="cc-clear" @click="clearCourseScores">清空成绩</button>
    </div>

    <p class="cc-tip">ℹ️ 仅公共必修 + 专业必修计入（选修课、补修课不计）；逐门输入成绩，加权平均 = Σ(成绩×学分) ÷ Σ学分，自动汇入综合成绩总分。</p>

    <template v-if="state.major && currentMajor">
      <div class="cc-rows">
        <div v-for="c in currentMajor.courses" :key="c.id" class="cc-row">
          <span class="cc-name">{{ c.name }}</span>
          <span class="cc-credit">{{ c.credit }} 学分</span>
          <input
            type="number" min="0" max="100" placeholder="成绩"
            :value="state.courseScores[c.id] ?? ''"
            class="cc-input" @input="setCourseScore(c.id, $event.target.value)"
          />
        </div>
      </div>
      <div class="cc-result">
        <span>已输入 <b>{{ w.filled }}</b>/{{ w.total }} 门 · 共 {{ w.credits }} 学分</span>
        <span class="cc-avg">加权平均 <b>{{ w.avg ?? '—' }}</b></span>
      </div>
    </template>
    <div v-else class="cc-empty">选择专业后，这里会列出该专业全部计分课程与学分</div>
  </div>
</template>

<style scoped>
.cc { display: flex; flex-direction: column; gap: 10px; }
.cc-head { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.cc-field { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px; }
.cc-label { font-size: 12px; color: var(--text-sub); font-weight: 700; }
.cc-select { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 13px; outline: none; }
.cc-select:focus { border-color: var(--primary); }
.cc-clear { padding: 8px 14px; border-radius: var(--radius); border: 1px solid #ef9a9a; background: none; color: #c62828; font-size: 12px; cursor: pointer; flex-shrink: 0; }
.cc-clear:hover { background: #ffebee; }
.cc-tip { margin: 0; font-size: 11px; line-height: 1.7; color: var(--text-sub); background: var(--primary-soft); border-radius: 8px; padding: 7px 10px; }

.cc-rows { display: flex; flex-direction: column; gap: 6px; }
.cc-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 10px; }
.cc-name { flex: 1; font-size: 12.5px; line-height: 1.4; min-width: 0; }
.cc-credit { font-size: 10.5px; padding: 2px 8px; border-radius: 999px; background: var(--soft-gray, #f2f2f2); color: var(--text-sub); white-space: nowrap; }
.cc-input { width: 72px; padding: 7px 8px; border: 1.5px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text); font-size: 13px; text-align: center; outline: none; flex-shrink: 0; transition: border-color .15s; }
.cc-input:focus { border-color: var(--primary); }
.cc-input::placeholder { color: var(--text-sub); opacity: .6; font-size: 11px; }

.cc-result { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 10px 14px; border-radius: 10px; background: var(--primary-soft); font-size: 12px; color: var(--text-sub); }
.cc-avg b { font-size: 20px; font-weight: 800; color: var(--primary); margin-left: 6px; }
.cc-empty { text-align: center; font-size: 12px; color: var(--text-sub); padding: 18px 10px; border: 1px dashed var(--border); border-radius: 10px; }
</style>
