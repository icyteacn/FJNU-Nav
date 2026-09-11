<script setup>
/**
 * 入党日程表：入党流程指南 + 五批次时间安排 + 材料清单 + 注意事项
 * 合并入日程助手应用，通过按钮切换
 */
import { ref, computed } from 'vue'

const emit = defineEmits(['back', 'open'])

const activeTab = ref('overview')
const activeBatch = ref(1)
const expandedStat = ref(null)

const tabs = [
  { id: 'overview', label: '总览', icon: '📊' },
  { id: 'timeline', label: '时间线', icon: '📅' },
  { id: 'materials', label: '材料清单', icon: '📋' },
  { id: 'notes', label: '注意事项', icon: '⚠️' },
]

const batches = [
  {
    id: 1,
    label: '第一批',
    time: '2026年9月-2029年6月',
    description: '2026年10-11月评选入党积极分子，2029年6月毕业前转正',
    status: 'current',
    statusLabel: '当前阶段',
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
    id: 2,
    label: '第二批',
    time: '2027年3月-2029年6月',
    description: '2027年3月评选入党积极分子，2029年6月毕业前转正',
    status: 'upcoming',
    statusLabel: '即将开始',
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
    id: 3,
    label: '第三批',
    time: '2027年10-11月-2030年6月',
    description: '2027年10-11月评选入党积极分子，毕业后转正',
    status: 'future',
    statusLabel: '未来批次',
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
    id: 4,
    label: '第四批',
    time: '2028年3月-2030年6月',
    description: '2028年3月评选入党积极分子，毕业前转为预备党员',
    status: 'future',
    statusLabel: '未来批次',
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
    id: 5,
    label: '第五/六批',
    time: '2028年9月/2029年3月-毕业后',
    description: '2028年9月或2029年3月评选入党积极分子，毕业前只能有积极分子身份',
    status: 'future',
    statusLabel: '最晚批次',
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
  { 
    stage: '入党积极分子阶段', 
    duration: '约1年',
    items: [
      { name: '入党申请书', note: '手写，3000字左右，师大400字方格纸' },
      { name: '群团组织推优评测表', note: '团组织推优时填写' },
      { name: '入党积极分子培养考察登记表', note: '记录培养考察情况' },
      { name: '积极分子党课结业证书', note: '党课培训合格后颁发' }
    ]
  },
  { 
    stage: '发展对象阶段', 
    duration: '约2-3个月',
    items: [
      { name: '入党自传', note: '个人成长经历、家庭情况等' },
      { name: '政审材料', note: '政治审查相关材料' },
      { name: '思想汇报', note: '每季度一篇，积极分子期间约4-10篇' },
      { name: '党校培训结业证书', note: '确定为发展对象后参加' },
      { name: '成绩单', note: '学习成绩是评选的重要条件' }
    ]
  },
  { 
    stage: '预备党员阶段', 
    duration: '1年',
    items: [
      { name: '入党志愿书', note: '正式入党材料' },
      { name: '预备党员考察登记表', note: '预备期一年考察' },
      { name: '思想汇报', note: '预备党员期间4篇' }
    ]
  },
]

const thoughtReportRules = [
  { 
    stage: '入党积极分子期间', 
    requirement: '每季度一篇思想汇报', 
    count: '约4-10篇', 
    note: '积极分子培养考察登记表一共就留了填写12次思想汇报记录的页',
    detail: '若尽早被评为积极分子，并顺利在研二第一学期秋季学期评上发展对象，思想汇报仅需约4篇；若研一第一学期评上积极分子、研三第二学期才评上发展对象，则需书写约10篇思想汇报。具体数量取决于入党积极分子到发展对象期间的时长。'
  },
  { 
    stage: '预备党员期间', 
    requirement: '四篇思想汇报', 
    count: '4篇', 
    note: '预备期一年内完成',
    detail: '预备党员期间也需要定期提交思想汇报，共4篇'
  },
]

const importantNotes = [
  {
    title: '组织关系转接',
    icon: '🔄',
    content: [
      '入党积极分子转到其他学校、单位、社区等党组织时，其积极分子身份不一定被认可，一般需要从头开始发展',
      '发展对象带到其他地方，同样有可能不被认可，但学院一般肯定会在毕业前开支部党员大会审议转为预备',
      '若毕业前已转为预备党员则不受影响：转正不消耗转入组织的发展名额，可以继承并如期转正',
      '建议在发展过程中注意留档相关电子记录，勤拍证明材料保存到手机'
    ]
  },
  {
    title: '学习成绩要求',
    icon: '📚',
    content: [
      '学习成绩是评选的重要条件：成绩好是首要条件，但不是充分条件',
      '具体以导员和院团委书记、支部书记的意见为主',
      '建议具备干部等任职经历，同时注意积累志愿服务时长'
    ]
  },
  {
    title: '入党目标建议',
    icon: '🎯',
    content: [
      '以毕业前转为正式党员为目标，建议多搞成果出来，包括学习、科研、志愿服务',
      '毕业前能够成功转为"预备党员"也算顺利入党，只不过到下一个单位提交转正材料的时候相对麻烦一点点',
      '一般在研二第二学期（2028年3月）及之前被评为入党积极分子有机会在毕业前获得"顺利入党"的机会',
      '研三也会组织评入党积极分子，但意义不大，不过也可以积极尝试，后续单位有可能认可并接收继续发展'
    ]
  },
  {
    title: '发展时间说明',
    icon: '⏱️',
    content: [
      '发展入党全流程最快是2年3个月',
      '入党积极分子到发展对象期间有可能延长',
      '例如：第一批入党积极分子，2026年10月份评为积极分子，但2029年3月份才评为发展对象（10篇思想汇报），2030年6月份才能转正，发展流程就是3年9个月'
    ]
  }
]

const quickStats = [
  { 
    id: 'speed',
    label: '最快入党时间', 
    value: '2年3个月', 
    icon: '⚡',
    detail: '从提交入党申请书到转为正式党员的最短时间。以第一批为例：2026年9月提交申请 → 2026年10-11月评为积极分子 → 2027年10-11月评为发展对象 → 2028年3月成为发展对象 → 2028年6月成为预备党员 → 2029年6月转为正式党员。实际时间可能因评选时间、个人表现等因素有所延长。'
  },
  { 
    id: 'deadline-prep',
    label: '毕业前转预备截止', 
    value: '研二第二学期（2028年3月）', 
    icon: '🎯',
    detail: '2028年3月之前被评为入党积极分子，有机会在毕业前转为预备党员。如果晚于这个时间被评为积极分子，可能只能在毕业前成为发展对象，或者毕业后继续发展。'
  },
  { 
    id: 'deadline-formal',
    label: '毕业前转正截止', 
    value: '研一第二学期（2027年3月）', 
    icon: '🏆',
    detail: '2027年3月之前被评为入党积极分子，有机会在毕业前转为正式党员。这是毕业前能够转为正式党员的最后机会。如果晚于这个时间被评为积极分子，可能只能在毕业前转为预备党员，或者毕业后继续发展。'
  },
]

const batchOverview = [
  {
    id: 1,
    label: '第一批',
    time: '2026年9月-2029年6月',
    description: '2026年10-11月评选入党积极分子，2029年6月毕业前转正',
    status: 'current',
    statusLabel: '当前阶段',
    target: '毕业前转为正式党员',
    result: '2029年6月毕业前转为正式党员'
  },
  {
    id: 2,
    label: '第二批',
    time: '2027年3月-2029年6月',
    description: '2027年3月评选入党积极分子，2029年6月毕业前转正',
    status: 'upcoming',
    statusLabel: '即将开始',
    target: '毕业前转为正式党员',
    result: '2029年6月毕业前转为正式党员'
  },
  {
    id: 3,
    label: '第三批',
    time: '2027年10-11月-2030年6月',
    description: '2027年10-11月评选入党积极分子，毕业后转正',
    status: 'future',
    statusLabel: '未来批次',
    target: '毕业后转为正式党员',
    result: '2030年6月毕业后转为正式党员'
  },
  {
    id: 4,
    label: '第四批',
    time: '2028年3月-2030年6月',
    description: '2028年3月评选入党积极分子，毕业前转为预备党员',
    status: 'future',
    statusLabel: '未来批次',
    target: '毕业前转为预备党员',
    result: '2030年6月毕业前转为预备党员'
  },
  {
    id: 5,
    label: '第五/六批',
    time: '2028年9月/2029年3月-毕业后',
    description: '2028年9月或2029年3月评选入党积极分子，毕业前只能有积极分子身份',
    status: 'future',
    statusLabel: '最晚批次',
    target: '毕业后转为正式党员',
    result: '毕业后继续发展，转为正式党员'
  }
]

function toggleStat(statId) {
  expandedStat.value = expandedStat.value === statId ? null : statId
}

function goBack() { emit('back') }
</script>

<template>
  <div class="party-view">
    <div class="view-top">
      <button class="back-btn" @click="goBack">← 返回日程助手</button>
      <div class="view-title">🏛️ 入党日程表</div>
      <div class="view-sub">入党流程指南 + 五批次时间安排 + 材料清单 + 注意事项</div>
    </div>

    <!-- 快速统计（可点击展开） -->
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
          <div v-if="expandedStat === stat.id" class="stat-detail">
            {{ stat.detail }}
          </div>
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

    <!-- 总览视图 -->
    <div v-if="activeTab === 'overview'" class="overview-section">
      <!-- 整体流程 -->
      <div class="panel flow-panel">
        <div class="section-title">入党整体流程</div>
        <div class="flow-steps">
          <div class="flow-step">📝 提交入党申请书</div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">🗳️ 评选入党积极分子</div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">🌟 评选发展对象</div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">📚 党课培训与考试</div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">🎉 转为预备党员</div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">🏆 转为正式党员</div>
        </div>
      </div>

      <!-- 批次概览 -->
      <div class="panel batch-overview">
        <div class="section-title">五批次概览</div>
        <div class="batch-list">
          <div v-for="batch in batchOverview" :key="batch.id" class="batch-card" :class="[batch.status]">
            <div class="batch-header">
              <div class="batch-badge" :class="batch.status">{{ batch.statusLabel }}</div>
              <h4>{{ batch.label }}</h4>
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

      <!-- 关键提醒 -->
      <div class="panel key-reminder">
        <div class="section-title">关键提醒</div>
        <div class="reminder-content">
          <p><strong>毕业前转正截止时间：</strong>研一第二学期（2027年3月）及之前被评为入党积极分子，才有机会在毕业前转为正式党员。</p>
          <p><strong>毕业前转预备截止时间：</strong>研二第二学期（2028年3月）及之前被评为入党积极分子，有机会在毕业前转为预备党员。</p>
          <p><strong>最快入党时间：</strong>从提交入党申请书到转为正式党员的最短时间约为2年3个月。以第一批为例：2026年9月提交申请 → 2026年10-11月评为积极分子 → 2027年10-11月评为发展对象 → 2028年3月成为发展对象 → 2028年6月成为预备党员 → 2029年6月转为正式党员。</p>
        </div>
      </div>
    </div>

    <!-- 时间线视图 -->
    <div v-if="activeTab === 'timeline'" class="timeline-section">
      <!-- 批次选择 -->
      <div class="panel batch-panel">
        <div class="section-title">五批次时间安排</div>
        <div class="batch-tabs">
          <button v-for="batch in batches" :key="batch.id" class="batch-tab" :class="{ active: activeBatch === batch.id }" @click="activeBatch = batch.id">
            {{ batch.label }}
          </button>
        </div>
      </div>

      <!-- 当前批次详情 -->
      <div class="panel batch-detail">
        <div class="batch-header">
          <div class="batch-badge" :class="batches[activeBatch - 1].status">{{ batches[activeBatch - 1].statusLabel }}</div>
          <h3>{{ batches[activeBatch - 1].label }}</h3>
          <div class="batch-time">{{ batches[activeBatch - 1].time }}</div>
          <div class="batch-desc">{{ batches[activeBatch - 1].description }}</div>
        </div>
        
        <div class="timeline">
          <div v-for="(milestone, index) in batches[activeBatch - 1].milestones" :key="index" class="tl-item" :class="[milestone.status]">
            <div class="tl-dot">{{ milestone.icon }}</div>
            <div class="tl-content">
              <div class="tl-time">{{ milestone.time }}</div>
              <div class="tl-event">{{ milestone.event }}</div>
            </div>
          </div>
        </div>
        
        <div class="batch-note">
          <span>💡</span> {{ batches[activeBatch - 1].note }}
        </div>
        
        <div class="batch-meta">
          <span class="meta-item">🎯 目标：{{ batches[activeBatch - 1].target }}</span>
        </div>
      </div>
    </div>

    <!-- 材料清单视图 -->
    <div v-if="activeTab === 'materials'" class="materials-section">
      <div class="panel materials-panel">
        <div class="section-title">党员材料明细（共不少于12种）</div>
        
        <div v-for="(stage, index) in materials" :key="index" class="stage-card">
          <div class="stage-header">
            <h4>{{ stage.stage }}</h4>
            <div class="stage-duration">{{ stage.duration }}</div>
          </div>
          <div class="stage-items">
            <div v-for="(item, i) in stage.items" :key="i" class="material-item">
              <div class="material-main">
                <span class="item-icon">📄</span>
                <span class="item-name">{{ item.name }}</span>
              </div>
              <div class="item-note">{{ item.note }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 思想汇报要求 -->
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

    <!-- 注意事项视图 -->
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

      <!-- 实用建议 -->
      <div class="panel advice-panel">
        <div class="section-title">实用建议</div>
        <div class="advice-content">
          <div class="advice-item">
            <div class="advice-icon">📚</div>
            <div class="advice-text">保持良好的学习成绩，这是评选的重要条件</div>
          </div>
          <div class="advice-item">
            <div class="advice-icon">🔬</div>
            <div class="advice-text">积极参与科研项目，争取发表论文或参与课题</div>
          </div>
          <div class="advice-item">
            <div class="advice-icon">👥</div>
            <div class="advice-text">积极参与班级工作，争取干部等任职经历</div>
          </div>
          <div class="advice-item">
            <div class="advice-icon">🤝</div>
            <div class="advice-text">积累志愿服务时长，建议40小时/学年以上</div>
          </div>
          <div class="advice-item">
            <div class="advice-icon">📱</div>
            <div class="advice-text">注意留档相关电子记录，勤拍证明材料保存到手机</div>
          </div>
          <div class="advice-item">
            <div class="advice-icon">⏰</div>
            <div class="advice-text">研一第二学期（2027年3月）前被评为积极分子，毕业前可以转为正式党员；研二第二学期（2028年3月）前被评为积极分子，毕业前可以转为预备党员</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.party-view { padding: 0 0 20px; }

.stats-panel { margin-bottom: 12px; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
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

.flow-panel { margin-bottom: 12px; }
.flow-steps { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
.flow-step { padding: 8px 12px; background: var(--primary-soft); border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--primary); }
.flow-arrow { color: var(--text-sub); font-weight: bold; }

.batch-overview { margin-bottom: 12px; }
.batch-list { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
.batch-card { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); transition: all .15s; }
.batch-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
.batch-card.current { border-color: var(--primary); border-width: 2px; background: var(--primary-soft); }
.batch-card.upcoming { border-color: #fbbf24; background: #fffbeb; }
.batch-card.future { border-color: var(--border); }
.batch-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.batch-badge { padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: #fff; }
.batch-badge.current { background: var(--primary); }
.batch-badge.upcoming { background: #f59e0b; }
.batch-badge.future { background: var(--text-sub); }
.batch-header h4 { margin: 0; font-size: 16px; font-weight: 800; color: var(--text); }
.batch-time { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.batch-desc { font-size: 13px; color: var(--text); margin-bottom: 8px; }
.batch-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--text-sub); margin-bottom: 8px; }
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
.timeline::before { content: ''; position: absolute; left: 12px; top: 0; bottom: 0; width: 2px; background: var(--border); }
.tl-item { position: relative; margin-bottom: 20px; }
.tl-dot { position: absolute; left: -30px; width: 24px; height: 24px; border-radius: 50%; background: var(--card); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; }
.tl-item.current .tl-dot { background: var(--primary); border-color: var(--primary); }
.tl-item.upcoming .tl-dot { background: #fef3c7; border-color: #fbbf24; }
.tl-item.future .tl-dot { background: var(--soft-fg); border-color: var(--border); }
.tl-content { padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; }
.tl-item.current .tl-content { border-color: var(--primary); background: var(--primary-soft); }
.tl-time { font-size: 12px; color: var(--text-sub); margin-bottom: 4px; }
.tl-event { font-size: 14px; font-weight: 600; color: var(--text); }

.batch-note { margin-top: 16px; padding: 12px; background: var(--soft-yellow, #fff8e1); border: 1px dashed var(--accent, #b8860b); border-radius: 8px; font-size: 13px; color: var(--text); display: flex; gap: 8px; align-items: flex-start; }

.materials-panel { margin-bottom: 12px; }
.stage-card { margin-bottom: 16px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.stage-header { padding: 12px 16px; background: var(--soft-fg); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.stage-header h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
.stage-duration { font-size: 12px; color: var(--text-sub); }
.stage-items { padding: 12px 16px; }
.material-item { padding: 10px 0; border-bottom: 1px dashed var(--border); }
.material-item:last-child { border-bottom: none; }
.material-main { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.item-icon { font-size: 16px; }
.item-name { font-size: 13px; font-weight: 600; color: var(--text); }
.item-note { font-size: 12px; color: var(--text-sub); padding-left: 24px; }

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

@media (max-width: 640px) {
  .flow-steps { flex-direction: column; align-items: stretch; }
  .flow-arrow { transform: rotate(90deg); align-self: center; }
  .batch-tabs { flex-wrap: wrap; }
  .batch-tab { min-width: calc(33.33% - 8px); }
  .batch-meta { flex-direction: column; gap: 4px; }
  .tab-btn { padding: 8px; }
  .tab-icon { font-size: 14px; }
  .tab-text { font-size: 10px; }
}
</style>