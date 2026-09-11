<script setup>
/**
 * 入党日程表 v2：流程跳转联动 + 材料勾选 + 批次卡片联动 + 视觉增强
 */
import { ref, computed, nextTick } from 'vue'

const emit = defineEmits(['back', 'open'])

const activeTab = ref('overview')
const activeBatch = ref(1)
const expandedStat = ref(null)
const checkedMaterials = ref(new Set())

const tabs = [
  { id: 'overview', label: '总览', icon: '📊' },
  { id: 'timeline', label: '时间线', icon: '📅' },
  { id: 'materials', label: '材料清单', icon: '📋' },
  { id: 'notes', label: '注意事项', icon: '⚠️' },
]

const flowSteps = [
  { icon: '📝', label: '提交入党申请书', tab: 'notes', anchor: 'writing-section', desc: '手写3000字，师大400字方格纸' },
  { icon: '🗳️', label: '评选入党积极分子', tab: 'materials', anchor: 'stage-0', desc: '团组织推优，约2-3个月' },
  { icon: '🌟', label: '评选发展对象', tab: 'materials', anchor: 'stage-1', desc: '积极分子满一年，约2-3个月' },
  { icon: '📚', label: '党课培训与考试', tab: 'materials', anchor: 'stage-1', desc: '24学时党校培训' },
  { icon: '🎉', label: '转为预备党员', tab: 'materials', anchor: 'stage-2', desc: '预备期一年' },
  { icon: '🏆', label: '转为正式党员', tab: 'materials', anchor: 'stage-2', desc: '预备期满转正' },
]

const batches = [
  {
    id: 1, label: '第一批', time: '2026年9月-2029年6月',
    description: '2026年10-11月评选入党积极分子，2029年6月毕业前转正',
    status: 'current', statusLabel: '当前阶段',
    milestones: [
      { time: '2026年9月', event: '提交入党申请书', status: 'current', icon: '📝' },
      { time: '2026年10-11月', event: '团组织"推优"评选入党积极分子', status: 'upcoming', icon: '🗳️' },
      { time: '2026年12月', event: '党课培训（24学时）', status: 'upcoming', icon: '📚' },
      { time: '2027年1月', event: '党章考试及格，成为入党积极分子', status: 'upcoming', icon: '✅' },
      { time: '2027年10-11月', event: '被评为入党积极分子满一年，可评选发展对象', status: 'future', icon: '🎯' },
      { time: '2027年12月', event: '参加党校培训（24学时）', status: 'future', icon: '📚' },
      { time: '2028年1月', event: '校党委组织谈话', status: 'future', icon: '🗣️' },
      { time: '2028年3月', event: '成为发展对象', status: 'future', icon: '🌟' },
      { time: '2028年6月', event: '成为预备党员', status: 'future', icon: '🎉' },
      { time: '2029年6月', event: '转为正式党员', status: 'future', icon: '🏆' },
    ],
    note: '2027年3月前评上积极分子，毕业前可以转为正式党员',
    target: '毕业前转为正式党员',
  },
  {
    id: 2, label: '第二批', time: '2027年3月-2029年6月',
    description: '2027年3月评选入党积极分子，2029年6月毕业前转正',
    status: 'upcoming', statusLabel: '即将开始',
    milestones: [
      { time: '2027年3月', event: '团组织"推优"评选入党积极分子', status: 'upcoming', icon: '🗳️' },
      { time: '2027年4月', event: '党课培训（24学时）', status: 'upcoming', icon: '📚' },
      { time: '2027年6月', event: '党章考试及格，成为入党积极分子', status: 'upcoming', icon: '✅' },
      { time: '2028年3月', event: '被评为入党积极分子满一年，可评选发展对象', status: 'future', icon: '🎯' },
      { time: '2028年4月', event: '参加党校培训（24学时）', status: 'future', icon: '📚' },
      { time: '2028年5月', event: '校党委组织谈话', status: 'future', icon: '🗣️' },
      { time: '2028年6月', event: '成为发展对象', status: 'future', icon: '🌟' },
      { time: '2028年9月', event: '成为预备党员', status: 'future', icon: '🎉' },
      { time: '2029年9月', event: '转为正式党员', status: 'future', icon: '🏆' },
    ],
    note: '第二批2029年6月毕业前转为正式党员',
    target: '毕业前转为正式党员',
  },
  {
    id: 3, label: '第三批', time: '2027年10-11月-2030年6月',
    description: '2027年10-11月评选入党积极分子，毕业后转正',
    status: 'future', statusLabel: '未来批次',
    milestones: [
      { time: '2027年10-11月', event: '团组织"推优"评选入党积极分子', status: 'upcoming', icon: '🗳️' },
      { time: '2027年12月', event: '党课培训（24学时）', status: 'upcoming', icon: '📚' },
      { time: '2028年1月', event: '党章考试及格，成为入党积极分子', status: 'upcoming', icon: '✅' },
      { time: '2028年10-11月', event: '被评为入党积极分子满一年，可评选发展对象', status: 'future', icon: '🎯' },
      { time: '2028年12月', event: '参加党校培训（24学时）', status: 'future', icon: '📚' },
      { time: '2029年1月', event: '校党委组织谈话', status: 'future', icon: '🗣️' },
      { time: '2029年3月', event: '成为发展对象', status: 'future', icon: '🌟' },
      { time: '2029年6月', event: '成为预备党员', status: 'future', icon: '🎉' },
      { time: '2030年6月', event: '转为正式党员', status: 'future', icon: '🏆' },
    ],
    note: '第三批2030年6月毕业后转为正式党员',
    target: '毕业后转为正式党员',
  },
  {
    id: 4, label: '第四批', time: '2028年3月-2030年6月',
    description: '2028年3月评选入党积极分子，毕业前转为预备党员',
    status: 'future', statusLabel: '未来批次',
    milestones: [
      { time: '2028年3月', event: '团组织"推优"评选入党积极分子', status: 'upcoming', icon: '🗳️' },
      { time: '2028年4月', event: '党课培训（24学时）', status: 'upcoming', icon: '📚' },
      { time: '2028年6月', event: '党章考试及格，成为入党积极分子', status: 'upcoming', icon: '✅' },
      { time: '2029年3月', event: '被评为入党积极分子满一年，可评选发展对象', status: 'future', icon: '🎯' },
      { time: '2029年4月', event: '参加党校培训（24学时）', status: 'future', icon: '📚' },
      { time: '2029年5月', event: '校党委组织谈话', status: 'future', icon: '🗣️' },
      { time: '2029年6月', event: '成为发展对象', status: 'future', icon: '🌟' },
      { time: '2029年9月', event: '成为预备党员', status: 'future', icon: '🎉' },
      { time: '2030年9月', event: '转为正式党员', status: 'future', icon: '🏆' },
    ],
    note: '2028年3月前评上积极分子，毕业前可以转为预备党员',
    target: '毕业前转为预备党员',
  },
  {
    id: 5, label: '第五/六批', time: '2028年9月/2029年3月-毕业后',
    description: '2028年9月或2029年3月评选入党积极分子，毕业前只能有积极分子身份',
    status: 'future', statusLabel: '最晚批次',
    milestones: [
      { time: '2028年9月/2029年3月', event: '团组织"推优"评选入党积极分子', status: 'upcoming', icon: '🗳️' },
      { time: '2028年10月/2029年4月', event: '党课培训（24学时）', status: 'upcoming', icon: '📚' },
      { time: '2028年12月/2029年6月', event: '党章考试及格，成为入党积极分子', status: 'upcoming', icon: '✅' },
      { time: '2029年9月/2030年3月', event: '被评为入党积极分子满一年，可评选发展对象', status: 'future', icon: '🎯' },
      { time: '2029年10月/2030年4月', event: '参加党校培训（24学时）', status: 'future', icon: '📚' },
      { time: '2029年11月/2030年5月', event: '校党委组织谈话', status: 'future', icon: '🗣️' },
      { time: '2029年12月/2030年6月', event: '成为发展对象', status: 'future', icon: '🌟' },
      { time: '2030年3月/2030年9月', event: '成为预备党员', status: 'future', icon: '🎉' },
      { time: '2031年3月/2031年9月', event: '转为正式党员', status: 'future', icon: '🏆' },
    ],
    note: '第五/六批评上积极分子，毕业前只能有积极分子身份，毕业后继续发展',
    target: '毕业后转为正式党员',
  }
]

const materials = [
  { stage: '入党积极分子阶段', duration: '约1年', id: 'stage-0', items: [
    { name: '入党申请书', note: '手写，3000字左右，师大400字方格纸' },
    { name: '群团组织推优评测表', note: '团组织推优时填写' },
    { name: '入党积极分子培养考察登记表', note: '记录培养考察情况' },
    { name: '积极分子党课结业证书', note: '党课培训合格后颁发' }
  ]},
  { stage: '发展对象阶段', duration: '约2-3个月', id: 'stage-1', items: [
    { name: '入党自传', note: '个人成长经历、家庭情况等' },
    { name: '政审材料', note: '政治审查相关材料' },
    { name: '思想汇报', note: '每季度一篇，积极分子期间约4-10篇' },
    { name: '党校培训结业证书', note: '确定为发展对象后参加' },
    { name: '成绩单', note: '学习成绩是评选的重要条件' }
  ]},
  { stage: '预备党员阶段', duration: '1年', id: 'stage-2', items: [
    { name: '入党志愿书', note: '正式入党材料' },
    { name: '预备党员考察登记表', note: '预备期一年考察' },
    { name: '思想汇报', note: '预备党员期间4篇' }
  ]},
]

const thoughtReportRules = [
  { stage: '入党积极分子期间', requirement: '每季度一篇思想汇报', count: '约4-10篇', note: '积极分子培养考察登记表一共就留了填写12次思想汇报记录的页', detail: '若尽早被评为积极分子，并顺利在研二第一学期秋季学期评上发展对象，思想汇报仅需约4篇；若研一第一学期评上积极分子、研三第二学期才评上发展对象，则需书写约10篇思想汇报。具体数量取决于入党积极分子到发展对象期间的时长。' },
  { stage: '预备党员期间', requirement: '四篇思想汇报', count: '4篇', note: '预备期一年内完成', detail: '预备党员期间也需要定期提交思想汇报，共4篇' },
]

const importantNotes = [
  { title: '组织关系转接', icon: '🔄', content: ['入党积极分子转到其他学校、单位、社区等党组织时，其积极分子身份不一定被认可，一般需要从头开始发展', '发展对象带到其他地方，同样有可能不被认可，但学院一般肯定会在毕业前开支部党员大会审议转为预备', '若毕业前已转为预备党员则不受影响：转正不消耗转入组织的发展名额，可以继承并如期转正', '建议在发展过程中注意留档相关电子记录，勤拍证明材料保存到手机'] },
  { title: '学习成绩要求', icon: '📚', content: ['学习成绩是评选的重要条件：成绩好是首要条件，但不是充分条件', '具体以导员和院团委书记、支部书记的意见为主', '建议具备干部等任职经历，同时注意积累志愿服务时长'] },
  { title: '入党目标建议', icon: '🎯', content: ['以毕业前转为正式党员为目标，建议多搞成果出来，包括学习、科研、志愿服务', '毕业前能够成功转为"预备党员"也算顺利入党，只不过到下一个单位提交转正材料的时候相对麻烦一点点', '一般在研二第二学期（2028年3月）及之前被评为入党积极分子有机会在毕业前获得"顺利入党"的机会', '研三也会组织评入党积极分子，但意义不大，不过也可以积极尝试，后续单位有可能认可并接收继续发展'] },
  { title: '发展时间说明', icon: '⏱️', content: ['发展入党全流程最快是2年3个月', '入党积极分子到发展对象期间有可能延长', '例如：第一批入党积极分子，2026年10月份评为积极分子，但2029年3月份才评为发展对象（10篇思想汇报），2030年6月份才能转正，发展流程就是3年9个月'] },
]

const writingWarnings = [
  { title: '入党申请书落款日期', level: 'critical', icon: '⚠️', content: '入党申请书建议最后一行的落款日期先空着，后续确定入党积极分子的时候再填写。因为日期可能需要与"入党积极分子培养考察登记表"上的日期保持一致，如果提前写好导致日期不一致，还需要重新抄写带有落款的最后一页。' },
  { title: '抄写党章原文务必准确', level: 'critical', icon: '⚠️', content: '书写入党申请书时，如果通过抄写党章原文来凑字数，务必抄写完整的同一句话，不能漏字、错字或私自修改，否则会被视为内容有问题，需要把出现问题的段落往后的几张都重新写。' },
  { title: '党的指导思想必须一字不差', level: 'critical', icon: '🔴', content: '如果在入党申请书中写"党的指导思想"或"行动指南"，必须从头到尾一字不差地写下来。要么不写，如果写就必须完整准确。', example: { wrong: '党的指导思想：马克思主义，毛主席思想，邓小平理论，三个代表思想，科学发展观，新时代中国特色社会主义思想', correct: '党的指导思想是马克思列宁主义、毛泽东思想、邓小平理论、"三个代表"重要思想、科学发展观、习近平新时代中国特色社会主义思想', errors: ['"马克思主义"应为"马克思列宁主义"', '"毛主席思想"应为"毛泽东思想"', '"三个代表思想"应为""三个代表"重要思想"（缺少引号和"重要"二字）', '"新时代中国特色社会主义思想"应为"习近平新时代中国特色社会主义思想"（缺少"习近平"）'] } },
  { title: '两个先锋队必须完整表述', level: 'critical', icon: '🔴', content: '关于"两个先锋队"的表述，必须完整写出："中国共产党是中国工人阶级的先锋队，同时是中国人民和中华民族的先锋队"。不能只写其中一个，不能私自更改顺序，不能省略"同时是"的连接词。建议把"一个领导核心"和"三个代表"也同时写上，最好不要单独只写两个先锋队，要写就写全套。' },
]

const quickStats = [
  { id: 'speed', label: '最快入党时间', value: '2年3个月', icon: '⚡', detail: '从提交入党申请书到转为正式党员的最短时间。以第一批为例：2026年9月提交申请 → 2026年10-11月评为积极分子 → 2027年10-11月评为发展对象 → 2028年3月成为发展对象 → 2028年6月成为预备党员 → 2029年6月转为正式党员。实际时间可能因评选时间、个人表现等因素有所延长。' },
  { id: 'deadline-prep', label: '毕业前转预备截止', value: '研二第二学期（2028年3月）', icon: '🎯', detail: '2028年3月之前被评为入党积极分子，有机会在毕业前转为预备党员。如果晚于这个时间被评为积极分子，可能只能在毕业前成为发展对象，或者毕业后继续发展。' },
  { id: 'deadline-formal', label: '毕业前转正截止', value: '研一第二学期（2027年3月）', icon: '🏆', detail: '2027年3月之前被评为入党积极分子，有机会在毕业前转为正式党员。这是毕业前能够转为正式党员的最后机会。如果晚于这个时间被评为积极分子，可能只能在毕业前转为预备党员，或者毕业后继续发展。' },
]

const batchOverview = [
  { id: 1, label: '第一批', time: '2026年9月-2029年6月', description: '2026年10-11月评选入党积极分子，2029年6月毕业前转正', status: 'current', statusLabel: '当前阶段', target: '毕业前转为正式党员', result: '2029年6月毕业前转为正式党员' },
  { id: 2, label: '第二批', time: '2027年3月-2029年6月', description: '2027年3月评选入党积极分子，2029年6月毕业前转正', status: 'upcoming', statusLabel: '即将开始', target: '毕业前转为正式党员', result: '2029年6月毕业前转为正式党员' },
  { id: 3, label: '第三批', time: '2027年10-11月-2030年6月', description: '2027年10-11月评选入党积极分子，毕业后转正', status: 'future', statusLabel: '未来批次', target: '毕业后转为正式党员', result: '2030年6月毕业后转为正式党员' },
  { id: 4, label: '第四批', time: '2028年3月-2030年6月', description: '2028年3月评选入党积极分子，毕业前转为预备党员', status: 'future', statusLabel: '未来批次', target: '毕业前转为预备党员', result: '2030年6月毕业前转为预备党员' },
  { id: 5, label: '第五/六批', time: '2028年9月/2029年3月-毕业后', description: '2028年9月或2029年3月评选入党积极分子，毕业前只能有积极分子身份', status: 'future', statusLabel: '最晚批次', target: '毕业后转为正式党员', result: '毕业后继续发展，转为正式党员' },
]

function toggleStat(statId) { expandedStat.value = expandedStat.value === statId ? null : statId }

function navigateTo(tab, anchor) {
  activeTab.value = tab
  nextTick(() => {
    if (anchor) {
      const el = document.getElementById(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function goToTimeline(batchId) {
  activeBatch.value = batchId
  activeTab.value = 'timeline'
}

function toggleMaterial(stageIdx, itemIdx) {
  const key = `${stageIdx}-${itemIdx}`
  if (checkedMaterials.value.has(key)) checkedMaterials.value.delete(key)
  else checkedMaterials.value.add(key)
  checkedMaterials.value = new Set(checkedMaterials.value)
  try { localStorage.setItem('fjnu_party_materials', JSON.stringify([...checkedMaterials.value])) } catch {}
}

function initCheckedMaterials() {
  try {
    const saved = localStorage.getItem('fjnu_party_materials')
    if (saved) checkedMaterials.value = new Set(JSON.parse(saved))
  } catch {}
}
initCheckedMaterials()

const materialsCheckedCount = computed(() => checkedMaterials.value.size)
const materialsTotalCount = computed(() => materials.reduce((s, m) => s + m.items.length, 0))

function goBack() { emit('back') }
</script>

<template>
  <div class="party-view">
    <div class="view-top">
      <button class="back-btn" @click="goBack">← 返回日程助手</button>
      <div class="view-title">🏛️ 入党日程表</div>
      <div class="view-sub">入党流程指南 + 五批次时间安排 + 材料清单 + 注意事项</div>
    </div>

    <!-- 关键数据 -->
    <div class="panel stats-panel">
      <div class="section-title">关键数据</div>
      <div class="stats-grid">
        <div v-for="stat in quickStats" :key="stat.id" class="stat-card" :class="{ expanded: expandedStat === stat.id }" @click="toggleStat(stat.id)">
          <div class="stat-header">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-content">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
            <div class="stat-expand">{{ expandedStat === stat.id ? '▾' : '▸' }}</div>
          </div>
          <div v-if="expandedStat === stat.id" class="stat-detail">{{ stat.detail }}</div>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="panel tab-nav">
      <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ========== 总览 ========== -->
    <div v-if="activeTab === 'overview'" class="overview-section">
      <div class="panel flow-panel">
        <div class="section-title">入党整体流程 <span class="flow-hint">点击可查看详情</span></div>
        <div class="flow-steps">
          <template v-for="(step, i) in flowSteps" :key="i">
            <button class="flow-step clickable" @click="navigateTo(step.tab, step.anchor)" :title="step.desc">
              <span class="flow-step-icon">{{ step.icon }}</span>
              <span class="flow-step-text">{{ step.label.replace(/^[^\u4e00-\u9fa5]+/, '') }}</span>
              <span class="flow-step-arrow-link">↗</span>
            </button>
            <span v-if="i < flowSteps.length - 1" class="flow-arrow">→</span>
          </template>
        </div>
        <div class="flow-step-desc">
          <div v-for="(step, i) in flowSteps" :key="'d'+i" class="flow-desc-item" @click="navigateTo(step.tab, step.anchor)">
            <span class="flow-desc-dot" :style="{ background: i === 0 ? 'var(--primary)' : i < 3 ? '#f59e0b' : '#22c55e' }"></span>
            <span>{{ step.desc }}</span>
          </div>
        </div>
      </div>

      <div class="panel batch-overview">
        <div class="section-title">五批次概览 <span class="flow-hint">点击跳转时间线</span></div>
        <div class="batch-list">
          <div v-for="batch in batchOverview" :key="batch.id" class="batch-card clickable" :class="[batch.status]" @click="goToTimeline(batch.id)">
            <div class="batch-header">
              <div class="batch-badge" :class="batch.status">{{ batch.statusLabel }}</div>
              <h4>{{ batch.label }}</h4>
              <span class="batch-goto">→</span>
            </div>
            <div class="batch-time">{{ batch.time }}</div>
            <div class="batch-desc">{{ batch.description }}</div>
            <div class="batch-meta">
              <span class="meta-item">🎯 {{ batch.target }}</span>
            </div>
            <div class="batch-result">{{ batch.result }}</div>
          </div>
        </div>
      </div>

      <div class="panel key-reminder">
        <div class="section-title">关键提醒</div>
        <div class="reminder-content">
          <p><strong>毕业前转正截止时间：</strong>研一第二学期（2027年3月）及之前被评为入党积极分子，才有机会在毕业前转为正式党员。</p>
          <p><strong>毕业前转预备截止时间：</strong>研二第二学期（2028年3月）及之前被评为入党积极分子，有机会在毕业前转为预备党员。</p>
          <p><strong>最快入党时间：</strong>从提交入党申请书到转为正式党员的最短时间约为2年3个月。以第一批为例：2026年9月提交申请 → 2026年10-11月评为积极分子 → 2027年10-11月评为发展对象 → 2028年3月成为发展对象 → 2028年6月成为预备党员 → 2029年6月转为正式党员。</p>
        </div>
      </div>
    </div>

    <!-- ========== 时间线 ========== -->
    <div v-if="activeTab === 'timeline'" class="timeline-section">
      <div class="panel batch-panel">
        <div class="section-title">五批次时间安排</div>
        <div class="batch-tabs">
          <button v-for="batch in batches" :key="batch.id" class="batch-tab" :class="{ active: activeBatch === batch.id }" @click="activeBatch = batch.id">
            {{ batch.label }}
          </button>
        </div>
      </div>

      <div class="panel batch-detail">
        <div class="batch-header">
          <div class="batch-badge" :class="batches[activeBatch - 1].status">{{ batches[activeBatch - 1].statusLabel }}</div>
          <h3>{{ batches[activeBatch - 1].label }}</h3>
          <div class="batch-time">{{ batches[activeBatch - 1].time }}</div>
          <div class="batch-desc">{{ batches[activeBatch - 1].description }}</div>
        </div>
        <div class="timeline">
          <div v-for="(m, index) in batches[activeBatch - 1].milestones" :key="index" class="tl-item" :class="[m.status]">
            <div class="tl-dot">{{ m.icon }}</div>
            <div class="tl-content">
              <div class="tl-time">{{ m.time }}</div>
              <div class="tl-event">{{ m.event }}</div>
            </div>
          </div>
        </div>
        <div class="batch-note"><span>💡</span> {{ batches[activeBatch - 1].note }}</div>
        <div class="batch-meta"><span class="meta-item">🎯 目标：{{ batches[activeBatch - 1].target }}</span></div>
      </div>
    </div>

    <!-- ========== 材料清单 ========== -->
    <div v-if="activeTab === 'materials'" class="materials-section">
      <div class="panel materials-progress">
        <div class="prog-row">
          <span class="prog-label">材料准备进度</span>
          <span class="prog-num">{{ materialsCheckedCount }}/{{ materialsTotalCount }} 项（{{ materialsTotalCount ? Math.round(materialsCheckedCount / materialsTotalCount * 100) : 0 }}%）</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" :style="{ width: (materialsTotalCount ? materialsCheckedCount / materialsTotalCount * 100 : 0) + '%' }"></div></div>
      </div>

      <div class="panel materials-panel">
        <div class="section-title">党员材料明细（共不少于12种）<span class="flow-hint">点击可勾选已备齐</span></div>
        <div v-for="(stage, si) in materials" :key="si" class="stage-card" :id="stage.id">
          <div class="stage-header">
            <h4>{{ stage.stage }}</h4>
            <div class="stage-duration">{{ stage.duration }}</div>
          </div>
          <div class="stage-items">
            <div v-for="(item, ii) in stage.items" :key="ii" class="material-item clickable" :class="{ checked: checkedMaterials.has(si + '-' + ii) }" @click="toggleMaterial(si, ii)">
              <span class="item-check">{{ checkedMaterials.has(si + '-' + ii) ? '☑️' : '☐' }}</span>
              <div class="material-main">
                <span class="item-name">{{ item.name }}</span>
              </div>
              <div class="item-note">{{ item.note }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel thought-panel">
        <div class="section-title">思想汇报要求</div>
        <div v-for="(rule, index) in thoughtReportRules" :key="index" class="thought-card">
          <div class="thought-header">
            <h4>{{ rule.stage }}</h4>
            <div class="thought-count">{{ rule.count }}</div>
          </div>
          <div class="thought-requirement">{{ rule.requirement }}</div>
          <div class="thought-detail">{{ rule.detail }}</div>
          <div class="thought-note">{{ rule.note }}</div>
        </div>
      </div>
    </div>

    <!-- ========== 注意事项 ========== -->
    <div v-if="activeTab === 'notes'" class="notes-section">
      <div v-for="(note, index) in importantNotes" :key="index" class="panel note-panel">
        <div class="section-title">{{ note.icon }} {{ note.title }}</div>
        <div class="note-content">
          <div v-for="(item, i) in note.content" :key="i" class="note-item">
            <span class="note-bullet">•</span>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <div class="panel advice-panel">
        <div class="section-title">实用建议</div>
        <div class="advice-content">
          <div class="advice-item"><div class="advice-icon">📚</div><div class="advice-text">保持良好的学习成绩，这是评选的重要条件</div></div>
          <div class="advice-item"><div class="advice-icon">🔬</div><div class="advice-text">积极参与科研项目，争取发表论文或参与课题</div></div>
          <div class="advice-item"><div class="advice-icon">👥</div><div class="advice-text">积极参与班级工作，争取干部等任职经历</div></div>
          <div class="advice-item"><div class="advice-icon">🤝</div><div class="advice-text">积累志愿服务时长，建议40小时/学年以上</div></div>
          <div class="advice-item"><div class="advice-icon">📱</div><div class="advice-text">注意留档相关电子记录，勤拍证明材料保存到手机</div></div>
          <div class="advice-item"><div class="advice-icon">⏰</div><div class="advice-text">研一第二学期（2027年3月）前被评为积极分子，毕业前可以转为正式党员；研二第二学期（2028年3月）前被评为积极分子，毕业前可以转为预备党员</div></div>
        </div>
      </div>

      <div class="panel writing-warning-panel" id="writing-section">
        <div class="section-title writing-title">🚨 入党申请书书写注意事项</div>
        <div class="writing-warnings">
          <div v-for="(warn, index) in writingWarnings" :key="index" class="writing-card" :class="warn.level">
            <div class="writing-header">
              <span class="writing-icon">{{ warn.icon }}</span>
              <span class="writing-name">{{ warn.title }}</span>
            </div>
            <div class="writing-content">{{ warn.content }}</div>
            <div v-if="warn.example" class="writing-example">
              <div class="example-row wrong">
                <span class="example-label">❌ 错误示例：</span>
                <span class="example-text">{{ warn.example.wrong }}</span>
              </div>
              <div class="example-row correct">
                <span class="example-label">✅ 正确写法：</span>
                <span class="example-text">{{ warn.example.correct }}</span>
              </div>
              <div class="error-list">
                <div v-for="(err, i) in warn.example.errors" :key="i" class="error-item">
                  <span class="error-bullet">•</span> {{ err }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="http://ach.xujc.com/2021/0801/c4464a130995/page.htm" target="_blank" class="writing-ref-link">
          📄 入党申请书撰写规范说明（点击查看详细参考）
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.party-view { padding: 0 0 20px; }

.stats-panel { margin-bottom: 12px; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
.flow-hint { font-size: 11px; font-weight: 400; color: var(--text-sub); margin-left: 6px; }
.stats-grid { display: flex; flex-direction: column; gap: 8px; }
.stat-card { padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all .15s; }
.stat-card:hover { border-color: var(--primary); }
.stat-card.expanded { border-color: var(--primary); background: var(--primary-soft); }
.stat-header { display: flex; align-items: center; gap: 10px; }
.stat-icon { font-size: 20px; }
.stat-content { flex: 1; }
.stat-label { font-size: 11px; color: var(--text-sub); margin-bottom: 2px; }
.stat-value { font-size: 13px; font-weight: 700; color: var(--primary); }
.stat-expand { font-size: 12px; color: var(--text-sub); }
.stat-detail { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 12px; line-height: 1.6; color: var(--text); }

.tab-nav { display: flex; gap: 8px; margin-bottom: 12px; }
.tab-btn { flex: 1; padding: 10px; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.tab-btn:hover { border-color: var(--primary); }
.tab-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.tab-icon { font-size: 16px; }
.tab-text { font-size: 11px; }

.clickable { cursor: pointer; }

.flow-panel { margin-bottom: 12px; }
.flow-steps { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 10px; }
.flow-step { display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; background: var(--primary-soft); border: 1.5px solid transparent; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--primary); cursor: pointer; transition: all .15s; }
.flow-step:hover { border-color: var(--primary); background: var(--card); box-shadow: var(--shadow-hover); }
.flow-step.clickable { position: relative; }
.flow-step-icon { font-size: 14px; }
.flow-step-text { font-size: 12px; }
.flow-step-arrow-link { font-size: 10px; opacity: 0; transition: opacity .15s; }
.flow-step:hover .flow-step-arrow-link { opacity: 1; }
.flow-arrow { color: var(--text-sub); font-weight: bold; font-size: 14px; }
.flow-step-desc { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.flow-desc-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 11px; color: var(--text-sub); border-radius: 6px; cursor: pointer; transition: background .15s; }
.flow-desc-item:hover { background: var(--soft-fg); color: var(--text); }
.flow-desc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.batch-overview { margin-bottom: 12px; }
.batch-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.batch-card { padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); transition: all .2s; cursor: pointer; position: relative; }
.batch-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); transform: translateY(-1px); }
.batch-card.current { border-color: var(--primary); border-width: 2px; background: var(--primary-soft); }
.batch-card.upcoming { border-color: #fbbf24; background: #fffbeb; }
.batch-card.future { border-color: var(--border); }
.batch-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.batch-badge { padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: #fff; }
.batch-badge.current { background: var(--primary); }
.batch-badge.upcoming { background: #f59e0b; }
.batch-badge.future { background: var(--text-sub); }
.batch-header h4 { margin: 0; font-size: 15px; font-weight: 800; color: var(--text); }
.batch-goto { margin-left: auto; font-size: 14px; color: var(--text-sub); transition: transform .15s; }
.batch-card:hover .batch-goto { transform: translateX(4px); color: var(--primary); }
.batch-time { font-size: 12px; color: var(--text-sub); margin-bottom: 3px; }
.batch-desc { font-size: 13px; color: var(--text); margin-bottom: 6px; }
.batch-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--text-sub); margin-bottom: 6px; }
.batch-result { font-size: 12px; font-weight: 600; color: var(--primary); }
.meta-item { display: flex; align-items: center; gap: 4px; }

.key-reminder { margin-bottom: 12px; }
.reminder-content { margin-top: 10px; font-size: 13px; line-height: 1.6; color: var(--text); }
.reminder-content p { margin: 0 0 8px; }
.reminder-content strong { color: var(--primary); }

.batch-panel { margin-bottom: 12px; }
.batch-tabs { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.batch-tab { flex: 1; min-width: calc(20% - 8px); padding: 10px; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.batch-tab:hover { border-color: var(--primary); }
.batch-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }

.batch-detail { margin-bottom: 12px; }
.batch-header { margin-bottom: 16px; }
.batch-header h3 { font-size: 18px; font-weight: 800; margin: 8px 0 8px; color: var(--primary); }
.batch-time { font-size: 13px; color: var(--text-sub); margin-bottom: 4px; }
.batch-desc { font-size: 14px; color: var(--text); }

.timeline { position: relative; padding-left: 30px; }
.timeline::before { content: ''; position: absolute; left: 12px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, var(--primary), #fbbf24, var(--border)); border-radius: 2px; }
.tl-item { position: relative; margin-bottom: 18px; }
.tl-dot { position: absolute; left: -30px; width: 24px; height: 24px; border-radius: 50%; background: var(--card); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all .3s; }
.tl-item.current .tl-dot { background: var(--primary); border-color: var(--primary); animation: pulse 2s ease infinite; }
.tl-item.upcoming .tl-dot { background: #fef3c7; border-color: #fbbf24; }
.tl-item.future .tl-dot { background: var(--soft-fg); border-color: var(--border); }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(21,101,192,.4); } 50% { box-shadow: 0 0 0 8px rgba(21,101,192,0); } }
.tl-content { padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; transition: all .15s; }
.tl-item.current .tl-content { border-color: var(--primary); background: var(--primary-soft); }
.tl-time { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.tl-event { font-size: 14px; font-weight: 600; color: var(--text); }

.batch-note { margin-top: 16px; padding: 12px; background: var(--soft-yellow, #fff8e1); border: 1px dashed var(--accent, #b8860b); border-radius: 8px; font-size: 13px; color: var(--text); display: flex; gap: 8px; align-items: flex-start; }

.materials-progress { margin-bottom: 12px; }
.prog-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.prog-label { font-size: 13px; font-weight: 700; }
.prog-num { font-size: 12px; color: var(--text-sub); }
.prog-bar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; }
.prog-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--primary), #22c55e); transition: width .5s ease; }

.materials-panel { margin-bottom: 12px; }
.stage-card { margin-bottom: 16px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.stage-header { padding: 12px 16px; background: var(--soft-fg); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.stage-header h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
.stage-duration { font-size: 12px; color: var(--text-sub); }
.stage-items { padding: 8px 16px; }
.material-item { padding: 10px 0; border-bottom: 1px dashed var(--border); cursor: pointer; transition: all .15s; border-radius: 6px; padding-left: 8px; margin: 0 -8px; }
.material-item:last-child { border-bottom: none; }
.material-item:hover { background: var(--primary-soft); }
.material-item.checked { background: #f0fdf4; }
.material-item.checked .item-name { text-decoration: line-through; opacity: .6; }
.item-check { font-size: 16px; margin-right: 6px; }
.material-main { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
.item-name { font-size: 13px; font-weight: 600; color: var(--text); }
.item-note { font-size: 12px; color: var(--text-sub); padding-left: 28px; }

.thought-panel { margin-bottom: 12px; }
.thought-card { margin-bottom: 16px; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); }
.thought-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.thought-header h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
.thought-count { padding: 4px 8px; background: var(--primary-soft); border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--primary); }
.thought-requirement { font-size: 13px; color: var(--text); margin-bottom: 8px; }
.thought-detail { font-size: 12px; color: var(--text); margin-bottom: 8px; line-height: 1.5; }
.thought-note { font-size: 12px; color: var(--text-sub); font-style: italic; }

.note-panel { margin-bottom: 12px; }
.note-content { margin-top: 10px; }
.note-item { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; line-height: 1.5; color: var(--text); }
.note-bullet { color: var(--primary); font-weight: bold; }

.advice-panel { margin-bottom: 12px; }
.advice-content { margin-top: 10px; }
.advice-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--soft-fg); border-radius: 8px; margin-bottom: 8px; }
.advice-icon { font-size: 20px; }
.advice-text { font-size: 13px; color: var(--text); flex: 1; }

.writing-warning-panel { margin-bottom: 12px; border: 2px solid #dc2626; }
.writing-title { color: #dc2626 !important; font-size: 15px !important; }
.writing-warnings { display: flex; flex-direction: column; gap: 12px; }
.writing-card { padding: 14px; border-radius: var(--radius); border: 1.5px solid #fca5a5; background: #fef2f2; }
.writing-card.critical { border-color: #dc2626; background: #fee2e2; }
.writing-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.writing-icon { font-size: 16px; }
.writing-name { font-size: 14px; font-weight: 700; color: #dc2626; }
.writing-content { font-size: 13px; line-height: 1.6; color: #7f1d1d; }
.writing-example { margin-top: 12px; padding: 12px; background: rgba(255,255,255,.7); border-radius: 8px; }
.example-row { margin-bottom: 8px; padding: 8px; border-radius: 6px; font-size: 12px; line-height: 1.5; }
.example-row.wrong { background: #fee2e2; border: 1px solid #fca5a5; }
.example-row.correct { background: #dcfce7; border: 1px solid #86efac; }
.example-label { font-weight: 700; display: block; margin-bottom: 4px; }
.example-row.wrong .example-label { color: #dc2626; }
.example-row.correct .example-label { color: #16a34a; }
.example-text { color: var(--text); }
.error-list { margin-top: 8px; }
.error-item { font-size: 12px; color: #991b1b; margin-bottom: 4px; display: flex; gap: 4px; }
.error-bullet { color: #dc2626; font-weight: bold; }
.writing-ref-link { display: block; margin-top: 12px; padding: 12px; background: #fff; border: 1.5px dashed #dc2626; border-radius: 8px; color: #dc2626; font-size: 13px; font-weight: 600; text-align: center; text-decoration: none; transition: all .15s; }
.writing-ref-link:hover { background: #dc2626; color: #fff; }

@media (max-width: 640px) {
  .flow-steps { flex-direction: column; align-items: stretch; }
  .flow-arrow { transform: rotate(90deg); align-self: center; }
  .flow-step-desc { grid-template-columns: 1fr; }
  .batch-tabs { flex-wrap: wrap; }
  .batch-tab { min-width: calc(33.33% - 8px); }
  .batch-meta { flex-direction: column; gap: 4px; }
  .tab-btn { padding: 8px; }
  .tab-icon { font-size: 14px; }
  .tab-text { font-size: 10px; }
}
</style>