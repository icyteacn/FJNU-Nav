<script setup>
/** 综测积累模块：课程加权测算 + 科研/综测快速选档 + 计分速查，总分实时联动并本地持久化 */
import { computed } from 'vue'
import ScorePicker from './ScorePicker.vue'
import CourseCalculator from './CourseCalculator.vue'
import {
  state, loadState, saveState, resetKind, profileOf, PROFILES,
  researchDetail, researchScore, qualityDetail, qualityScore,
  coursePart, totalScore,
} from '../stores/scholarship'

const emit = defineEmits(['goto'])

loadState()
saveState()

const prof = computed(profileOf)
const rs = researchScore
const qs = qualityScore
const cp = computed(() => coursePart.value.toFixed(2))
const total = computed(() => totalScore.value.toFixed(2))
const researchOver = computed(() => rs.value.raw > rs.value.cap)
const qualityOver = computed(() => qs.value.raw > qs.value.cap)
const excludedRows = computed(() => {
  const out = []
  for (const d of qualityDetail.value) for (const r of d.rows) if (r.excluded) out.push(r)
  return out
})
const cappedGroups = computed(() => qualityDetail.value.filter(d => d.capped > 0))
const cappedResearch = computed(() => researchDetail.value.filter(d => d.capped > 0))

const scoreRules = [
  { title: '论文得分（权重最高）', icon: '📝', highlight: true,
    rows: [
      ['顶级学术期刊', '160 分/篇'], ['国际 A 类（含 CCF-A）', '80 分/篇'],
      ['国际 B 类（含 CCF-B）', '40 分/篇'], ['国际 C 类 / 国内 A 类', '20 分/篇'],
      ['国内 B 类', '10 分/篇'], ['国内 C 类', '5 分/篇'],
    ],
    note: '须研究生一作；导师一作时研究生须通讯/共同一作' },
  { title: '专利 · 项目 · 转让 · 交流', icon: '🔬',
    rows: [
      ['发明专利授权 / 实用新型', '20 / 5 分'], ['国自然博士生项目', '60 分'],
      ['一流网安学院创新资助', '20 分'], ['成果转让', '1 分/万元 ≤40'],
      ['学术交流 国际/国家/省级', '4 / 2 / 1 ≤4'],
    ],
    note: '专利须导师一作、研究生二作；署名单位须为福建师大或本学院' },
  { title: 'A 类竞赛（负责人满分）', icon: '🎯',
    rows: [
      ['国家级特/一/二/三等', '80 / 54 / 36 / 24'], ['省级特/一/二/三等', '20 / 16 / 12 / 9'],
      ['校级一/二/三等', '5 / 3 / 2'], ['院级一/二/三等', '2 / 1 / 0.5'],
    ],
    note: '成员系数：2-5 人 ×0.9 · 6-8 ×0.8 · 9-12 ×0.7 · 13-15 ×0.6' },
  { title: 'B 类竞赛（全员同分）', icon: '🏅',
    rows: [
      ['国家级一/二/三/优', '20 / 16 / 12 / 5'], ['省级一/二/三/优', '10 / 8 / 6 / 2'],
      ['校级一/二/三', '3 / 2 / 1'], ['院级一/二/三', '1.5 / 1 / 0.5'],
    ],
    note: '团队项目每位成员均获对应奖励分' },
]

function clearZc() {
  if (confirm('确定清空全部综测选择记录？')) resetKind('z')
}
</script>

<template>
  <div class="zc">
    <div class="zc-toolbar">
      <div class="zc-id">
        <span class="zc-id-label">评定身份</span>
        <select v-model="state.profile" class="zc-select">
          <option v-for="(p, k) in PROFILES" :key="k" :value="k">{{ p.label }}</option>
        </select>
      </div>
      <button class="zc-clear" @click="clearZc">🗑 清空综测</button>
    </div>

    <div class="zc-total">
      <div class="zc-total-head">
        <span class="zc-total-label">预计综合成绩总分</span>
        <span class="zc-save">💾 已保存在本设备</span>
      </div>
      <div class="zc-total-num">{{ total }}</div>
      <div class="zc-parts">
          <div class="zc-part">
            <div class="zc-part-top"><span>课程 {{ prof.courseW }}%</span><b>{{ cp }}</b></div>
          <div class="zc-bar"><i :style="{ width: prof.courseW ? Math.min(100, Number(state.course) || 0) + '%' : 0 }"></i></div>
          <em v-if="prof.courseW">{{ state.course ?? '—' }} 分</em><em v-else>本阶段不计</em>
        </div>
        <div class="zc-part">
          <div class="zc-part-top"><span>科研 满分{{ rs.cap }}</span><b>{{ rs.score.toFixed(2) }}</b></div>
          <div class="zc-bar"><i :style="{ width: Math.min(100, rs.raw / rs.cap * 100) + '%' }"></i></div>
          <em>原始 {{ rs.raw }}{{ researchOver ? ' · 已封顶' : '' }}</em>
        </div>
        <div class="zc-part">
          <div class="zc-part-top"><span>综质 满分{{ qs.cap }}</span><b>{{ qs.score.toFixed(2) }}</b></div>
          <div class="zc-bar alt"><i :style="{ width: Math.min(100, Math.max(0, qs.raw) / qs.cap * 100) + '%' }"></i></div>
          <em>原始 {{ qs.raw }}{{ qualityOver ? ' · 已封顶' : '' }}</em>
        </div>
      </div>
      <div v-if="researchOver || qualityOver" class="zc-warn">
        ⚠️ 原始得分超出满分上限，已按封顶值计；若同年级有人超满分，全员按「个人 ÷ 最高 × 满分」比例换算
      </div>
      <div class="zc-gates">{{ prof.gates }}</div>
    </div>

    <div class="panel zc-panel">
      <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>📚 课程成绩 · 加权平均测算</div>
      <CourseCalculator />
    </div>

    <div class="panel zc-panel">
      <div class="section-title" style="margin:0 0 4px;"><span class="bar"></span>🔬 科研创新 · 加分快速选档</div>
      <p class="muted" style="font-size:12px;margin:0 0 12px;">点击档位即累加，再点取消；A 类竞赛先选排名自动乘成员系数。</p>
      <template v-if="cappedResearch.length">
        <div v-for="d in cappedResearch" :key="d.g.id" class="zc-alert" style="margin-bottom:8px;">
          ⚠️ 「{{ d.g.name }}」超上限：明细保留 {{ d.sum + d.capped }} 分，计入 {{ d.g.cap }} 分
        </div>
      </template>
      <ScorePicker kind="r" :detail="researchDetail" />
    </div>

    <div class="panel zc-panel">
      <div class="section-title" style="margin:0 0 4px;"><span class="bar"></span>🌟 综合素质 · 加分快速选档</div>
      <p class="muted" style="font-size:12px;margin:0 0 12px;">同岗位就高取最高、分类超限自动封顶、扣分项计入负分。</p>
      <div v-if="excludedRows.length || cappedGroups.length" class="zc-alerts">
        <div v-if="excludedRows.length" class="zc-alert">
          🔁 就高不计：<span v-for="(r, i) in excludedRows" :key="r.uid">{{ r.label }}<template v-if="i < excludedRows.length - 1">、</template></span>
        </div>
        <div v-for="d in cappedGroups" :key="d.g.id" class="zc-alert">
          ⚠️ 「{{ d.g.name }}」超上限：明细保留 {{ d.sum + d.capped }} 分，计入 {{ d.g.cap }} 分
        </div>
      </div>
      <ScorePicker kind="z" :detail="qualityDetail" />
    </div>

    <div class="panel zc-panel">
      <div class="section-title" style="margin:0 0 14px;"><span class="bar"></span>📋 计分速查</div>
      <div class="rules-grid">
        <div v-for="r in scoreRules" :key="r.title" class="rule-card" :class="{ highlight: r.highlight }">
          <div class="rule-header"><span class="rule-icon">{{ r.icon }}</span><span class="rule-title">{{ r.title }}</span></div>
          <table class="rule-table">
            <tr v-for="row in r.rows" :key="row[0]"><td>{{ row[0] }}</td><td class="rule-score">{{ row[1] }}</td></tr>
          </table>
          <div class="rule-note">{{ r.note }}</div>
        </div>
      </div>
      <p class="muted" style="font-size:11px;margin:12px 0 0;">综合素质含荣誉嘉奖、社会工作、体育美育劳育等，完整分值以「综质选档」各分类为准；细则全文以学院最新通知为准。</p>
    </div>

    <div class="zc-link">
      <div class="zc-link-info">
        <b>评定标准与比例</b>
        <span>奖学金金额、比例与申请要点见「奖学金」标签页</span>
      </div>
      <button class="zc-link-btn" @click="emit('goto')">去查看 →</button>
    </div>
  </div>
</template>

<style scoped>
.zc { display: flex; flex-direction: column; gap: 14px; }
.zc-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.zc-id { display: flex; align-items: center; gap: 8px; }
.zc-id-label { font-size: 12px; color: var(--text-sub); font-weight: 700; }
.zc-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 13px; outline: none; }
.zc-select:focus { border-color: var(--primary); }
.zc-clear { padding: 8px 14px; border-radius: var(--radius); border: 1px solid #ef9a9a; background: none; color: #c62828; font-size: 12px; cursor: pointer; transition: all .15s; }
.zc-clear:hover { background: #ffebee; }

.zc-total { position: sticky; top: 62px; z-index: 5; padding: 16px 18px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; box-shadow: 0 8px 24px rgba(198, 40, 40, .28); }
.zc-total-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.zc-total-label { font-size: 13px; font-weight: 800; }
.zc-save { font-size: 10px; opacity: .7; }
.zc-total-num { font-size: 44px; font-weight: 800; line-height: 1.15; letter-spacing: 1px; }
.zc-parts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
.zc-part { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.zc-part-top { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; font-size: 10.5px; opacity: .95; }
.zc-part-top b { font-size: 14px; font-weight: 800; }
.zc-bar { height: 5px; border-radius: 999px; background: rgba(255,255,255,.25); overflow: hidden; }
.zc-bar i { display: block; height: 100%; border-radius: 999px; background: #fff; transition: width .35s ease; }
.zc-bar.alt i { background: #ffd54f; }
.zc-part em { font-style: normal; font-size: 10px; opacity: .75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.zc-warn { margin-top: 10px; font-size: 11px; background: rgba(255,255,255,.16); border-radius: 8px; padding: 6px 10px; line-height: 1.6; }
.zc-gates { margin-top: 8px; font-size: 11px; opacity: .88; line-height: 1.6; }

.zc-panel { margin-bottom: 2px; }
.zc-alerts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.zc-alert { font-size: 11px; line-height: 1.7; color: #b45309; background: var(--soft-yellow); border: 1px dashed #e65100; border-radius: 8px; padding: 7px 10px; }

.rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
.rule-card { padding: 14px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); }
.rule-card.highlight { border-color: var(--accent); background: var(--soft-yellow); }
.rule-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.rule-icon { font-size: 18px; }
.rule-title { font-weight: 700; font-size: 13px; }
.rule-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.rule-table td { padding: 5px 0; border-bottom: 1px dashed var(--border); color: var(--text-sub); }
.rule-table tr:last-child td { border-bottom: none; }
.rule-score { text-align: right; font-weight: 700; color: var(--primary); white-space: nowrap; }
.rule-note { font-size: 11px; color: var(--text-sub); margin-top: 8px; line-height: 1.6; opacity: .85; }

.zc-link { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 14px; border: 1px solid var(--primary); background: linear-gradient(135deg, var(--primary-soft), transparent); border-radius: var(--radius); }
.zc-link-info { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--text-sub); }
.zc-link-info b { font-size: 13px; color: var(--text); }
.zc-link-btn { padding: 9px 16px; border: none; border-radius: 999px; background: var(--primary); color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; flex-shrink: 0; }
.zc-link-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
</style>
