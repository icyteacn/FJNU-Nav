<script setup>
import { ref } from 'vue'
import ZcAccumulator from '../components/ZcAccumulator.vue'
import { loadState, saveState } from '../stores/scholarship'

const emit = defineEmits(['back'])

const activeTab = ref('links')
loadState()
saveState()


const graduateLinks = [
  { name: '研究生信息管理系统', url: 'https://gedu.fjnu.edu.cn/cas/login?service=https://gedu.fjnu.edu.cn', desc: '培养方案 / 选课 / 成绩 / 论文管理', icon: '🔑', featured: true },
  { name: '研究生院官网', url: 'https://yjsy.fjnu.edu.cn', desc: '招生 / 培养 / 学位 / 管理制度', icon: '🏛️' },
  { name: '学位论文管理', url: 'https://yjsy.fjnu.edu.cn/xwgl/list.htm', desc: '论文开题 / 答辩 / 查重 / 学位申请', icon: '📝' },
  { name: '培养方案查询', url: 'https://yjsy.fjnu.edu.cn/pygl/list.htm', desc: '培养计划 / 课程设置 / 学分要求', icon: '📋' },
  { name: '导师信息查询', url: 'https://yjsy.fjnu.edu.cn/dsxx/list.htm', desc: '导师简介 / 研究方向 / 联系方式', icon: '👨‍🏫' },
  { name: '研究生招生', url: 'https://yjsy.fjnu.edu.cn/zs/list.htm', desc: '招生简章 / 专业目录 / 复试调剂', icon: '🎓' },
  { name: '福Star VPN', url: 'https://vpn3.fjnu.edu.cn/auth/login?returnUrl=https://zhifu-cnki-net-s.vpn3.fjnu.edu.cn/', desc: '校外访问知网等学术资源', icon: '🌐', featured: true },
  { name: '中国知网', url: 'https://www.cnki.net', desc: '学术论文检索（需VPN或校园网）', icon: '📚' },
  { name: '万方数据', url: 'https://www.wanfangdata.com.cn', desc: '学术论文检索（需VPN或校园网）', icon: '📖' },
  { name: '超星学习通', url: 'https://fjnu.zlgc2.chaoxing.com', desc: '在线课程 / 教学资源', icon: '📱' },
  { name: 'NextFStar', url: 'https://nfs.pcdawn.cn', desc: '校园服务聚合 · 课程表 / 食堂 / 教室导航', icon: '🌐' },
  { name: '研究生会', url: 'https://yjsy.fjnu.edu.cn/yjsh/list.htm', desc: '研究生会活动 / 社团 / 讲座', icon: '🎭' },
]

const creditRequirements = [
  { type: '硕士学位（学术型）', total: 30, required: 18, electives: 12, details: [
    { name: '公共必修课', credits: 7, courses: ['中国特色社会主义理论与实践研究', '自然辩证法概论', '英语'] },
    { name: '专业必修课', credits: 11, courses: ['专业核心课程', '方法论课程', '前沿讲座'] },
    { name: '选修课', credits: 12, courses: ['跨专业选修', '方法工具类', '人文素养类'] },
  ]},
  { type: '硕士学位（专业型）', total: 32, required: 20, electives: 12, details: [
    { name: '公共必修课', credits: 7, courses: ['中国特色社会主义理论与实践研究', '自然辩证法概论', '英语'] },
    { name: '专业必修课', credits: 13, courses: ['专业核心课程', '案例分析', '实践训练'] },
    { name: '选修课', credits: 12, courses: ['跨专业选修', '职业技能类', '人文素养类'] },
  ]},
  { type: '博士学位', total: 18, required: 12, electives: 6, details: [
    { name: '公共必修课', credits: 4, courses: ['中国马克思主义与当代', '英语'] },
    { name: '专业必修课', credits: 8, courses: ['高级专业课程', '方法论', '前沿研讨'] },
    { name: '选修课', credits: 6, courses: ['跨学科选修', '学术工具类'] },
  ]},
]

const scholarshipGroups = [
  {
    key: 'phd', title: '博士研究生', icon: '🎓', base: '按全日制博士生总数',
    tiers: [
      { name: '一等', amount: 15000, ratio: '10%', icon: '🥇' },
      { name: '二等', amount: 10000, ratio: '10%', icon: '🥈' },
      { name: '三等', amount: 6000, ratio: '20%', icon: '🥉' },
    ]
  },
  {
    key: 'master-new', title: '硕士新生（统考生）', icon: '🌱', base: '按统考生总数',
    tiers: [
      { name: '一等', amount: 10000, ratio: '5%', icon: '🥇' },
      { name: '二等', amount: 6000, ratio: '10%', icon: '🥈' },
      { name: '三等', amount: 3000, ratio: '20%', icon: '🥉' },
    ],
    note: '推免生单列：所有推免生（含研究生支教团）直接获评一等奖学金'
  },
  {
    key: 'master-senior', title: '硕士二年级及以上', icon: '📚', base: '按全日制硕士生总数',
    tiers: [
      { name: '一等', amount: 10000, ratio: '10%', icon: '🥇' },
      { name: '二等', amount: 6000, ratio: '10%', icon: '🥈' },
      { name: '三等', amount: 3000, ratio: '20%', icon: '🥉' },
    ]
  },
]


const scholarshipGuide = [
  { title: '评审时间', content: '每年 10-11 月申请，学院公示不少于 5 个工作日；对结果有异议可在公示期向学院评审委员会申诉。', icon: '📅', highlight: true },
  { title: '成果有效期', content: '上年 9 月 1 日 至 当年 8 月 31 日；毕业学年延长至评选通知落款时间。所有成果须在学制培养期限内取得。', icon: '⏰', highlight: true },
  { title: '材料不重复使用', content: '学业奖学金可与国家奖学金、国家助学金兼得，但同一年度国奖与学业奖学金的参评材料不得重复使用。', icon: '📑' },
  { title: '课程成绩口径', content: '仅计公共必修 + 专业必修（见学院计分课程目录），加权平均 = Σ(成绩×学分) ÷ Σ学分；选修课、补修课不计入。', icon: '📚' },
  { title: '超满分换算', content: '科研分满分：硕二 35 / 博二 50 / 硕三 85 / 博三四及五年级直博 90。若同年级有人超满分，则全员按「个人得分 ÷ 最高分 × 满分」比例换算。', icon: '⚖️' },
  { title: '身份界定', content: '硕博连读生注册为博士生前按硕士身份参评，注册后按博士身份参评；保留入学资格者复学后第一学年参评。', icon: '🔁' },
]

const disqualifications = [
  '保留入学资格 / 休学 / 保留学籍',
  '未按期完成培养方案规定进度',
  '受到学校纪律处分或仍在处分期',
  '因违反实验室、宿舍管理规定被通报批评',
  '有必修课或专业选修课不合格应予重修',
]

const academicTools = [
  { name: 'Zotero', desc: '免费文献管理工具，支持PDF标注和引用', url: 'https://www.zotero.org', icon: '📚', category: '文献管理' },
  { name: 'Mendeley', desc: 'Elsevier旗下文献管理工具', url: 'https://www.mendeley.com', icon: '📖', category: '文献管理' },
  { name: 'EndNote', desc: '专业文献管理软件（学校可能提供授权）', url: 'https://endnote.com', icon: '📝', category: '文献管理' },
  { name: 'Grammarly', desc: '英语语法检查和写作辅助', url: 'https://www.grammarly.com', icon: '✍️', category: '写作工具' },
  { name: 'LaTeX Online', desc: '在线LaTeX编辑器', url: 'https://www.overleaf.com', icon: '📄', category: '写作工具' },
  { name: 'DeepL', desc: '高质量机器翻译', url: 'https://www.deepl.com', icon: '🌐', category: '翻译工具' },
  { name: 'Sci-Hub', desc: '学术论文下载（仅供学术研究）', url: 'https://sci-hub.se', icon: '🔓', category: '论文下载' },
  { name: 'Google Scholar', desc: '谷歌学术搜索', url: 'https://scholar.google.com', icon: '🔍', category: '学术搜索' },
  { name: 'Web of Science', desc: '国际权威学术索引', url: 'https://www.webofscience.com', icon: '📊', category: '学术搜索' },
  { name: 'PubMed', desc: '生物医学文献数据库', url: 'https://pubmed.ncbi.nlm.nih.gov', icon: '🧬', category: '学术搜索' },
]

const tips = [
  { title: '选课建议', content: '研究生选课前请仔细阅读培养方案，必修课优先选修。选课系统开放时间有限，建议提前准备好课程列表。', icon: '💡' },
  { title: '论文进度', content: '学位论文有严格的时间节点，请提前规划好写作进度。开题报告、中期检查、答辩申请等材料需提前准备。', icon: '📅' },
  { title: '奖学金申请', content: '学业奖学金每年10-11月申请，国家奖学金每年9-10月申请；同一年度两者参评材料不可重复使用。科研成果是核心竞争力。', icon: '🏆' },
  { title: '学术资源', content: '通过VPN可校外访问知网、万方等学术数据库。建议收藏常用数据库入口。', icon: '📚' },
  { title: '导师沟通', content: '定期与导师沟通研究进展，参加导师组会。遇到问题及时寻求帮助。', icon: '👨‍🏫' },
  { title: '论文查重', content: '论文提交前务必进行查重检测。学校提供免费查重机会，请合理使用。', icon: '🔍' },
  { title: '英语六级', content: '研究生期间建议通过英语六级，部分奖学金和出国机会需要六级成绩。', icon: '📝' },
  { title: '学术会议', content: '积极参加学术会议，了解领域前沿。学校有会议资助政策，可申请报销。', icon: '🎤' },
  { title: '实习实践', content: '专业型研究生需要完成实习实践环节，建议提前联系实习单位。', icon: '💼' },
  { title: '档案管理', content: '研究生档案包含成绩单、获奖证书等重要材料，请妥善保管。', icon: '📁' },
  { title: '科研成果要求', content: '论文须为第一作者（导师一作需为通讯/共同一作）；专利须导师一作、研究生二作；署名单位须为福建师大或本学院。', icon: '🔬' },
]

const academicCalendar = [
  { period: '2026-2027学年第一学期', events: [
    { date: '2026-09-01', event: '研究生新生报到', type: 'important' },
    { date: '2026-09-02', event: '新生入学教育', type: 'normal' },
    { date: '2026-09-05', event: '研究生选课开始', type: 'important' },
    { date: '2026-09-12', event: '选课截止', type: 'important' },
    { date: '2026-10-01', event: '国庆节放假', type: 'holiday' },
    { date: '2026-11-15', event: '期中考试', type: 'exam' },
    { date: '2026-12-20', event: '期末考试开始', type: 'exam' },
    { date: '2027-01-10', event: '期末考试结束', type: 'exam' },
    { date: '2027-01-15', event: '寒假开始', type: 'holiday' },
  ]},
  { period: '学位论文时间节点', events: [
    { date: '每年3月', event: '硕士学位论文开题', type: 'important' },
    { date: '每年5月', event: '硕士学位论文中期检查', type: 'important' },
    { date: '每年9月', event: '硕士学位论文答辩', type: 'important' },
    { date: '每年10月', event: '博士学位论文开题', type: 'important' },
    { date: '每年12月', event: '博士学位论文中期检查', type: 'important' },
    { date: '次年3月', event: '博士学位论文预答辩', type: 'important' },
    { date: '次年5月', event: '博士学位论文答辩', type: 'important' },
  ]},
  { period: '重要考试时间', events: [
    { date: '每年6月', event: '英语六级考试', type: 'exam' },
    { date: '每年12月', event: '英语六级考试', type: 'exam' },
    { date: '每年3月', event: '博士学位英语考试', type: 'exam' },
    { date: '每年9月', event: '硕士学位英语考试', type: 'exam' },
  ]},
]

function eventType(type) {
  const types = { important: '重要', normal: '普通', holiday: '假期', exam: '考试' }
  return types[type] || '普通'
}

function eventClass(type) {
  const classes = { important: 'event-important', normal: 'event-normal', holiday: 'event-holiday', exam: 'event-exam' }
  return classes[type] || ''
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">研究生服务</div>
    <div class="view-sub">培养方案 · 学术日历 · 常用资源 · 研究生专属服务</div>
  </div>

  <div class="tab-row" style="margin-bottom:16px;flex-wrap:wrap;gap:6px;">
    <button class="tab" :class="{ active: activeTab === 'links' }" @click="activeTab = 'links'">常用网站</button>
    <button class="tab" :class="{ active: activeTab === 'credit' }" @click="activeTab = 'credit'">学分要求</button>
    <button class="tab" :class="{ active: activeTab === 'scholarship' }" @click="activeTab = 'scholarship'">奖学金</button>
    <button class="tab" :class="{ active: activeTab === 'zc' }" @click="activeTab = 'zc'">综测积累</button>
    <button class="tab" :class="{ active: activeTab === 'tools' }" @click="activeTab = 'tools'">学术工具</button>
    <button class="tab" :class="{ active: activeTab === 'calendar' }" @click="activeTab = 'calendar'">学术日历</button>
    <button class="tab" :class="{ active: activeTab === 'tips' }" @click="activeTab = 'tips'">研究生指南</button>
  </div>

  <template v-if="activeTab === 'links'">
    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>🎓 核心系统</div>
      <div class="link-grid">
        <a v-for="link in graduateLinks.filter(l => l.featured)" :key="link.name" :href="link.url" target="_blank" rel="noopener" class="link-card featured">
          <span class="link-icon">{{ link.icon }}</span>
          <div class="link-info">
            <div class="link-name">{{ link.name }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </div>
          <span class="link-go">↗</span>
        </a>
      </div>
    </div>
    <div class="panel">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>📚 学术资源</div>
      <div class="link-grid">
        <a v-for="link in graduateLinks.filter(l => !l.featured)" :key="link.name" :href="link.url" target="_blank" rel="noopener" class="link-card">
          <span class="link-icon">{{ link.icon }}</span>
          <div class="link-info">
            <div class="link-name">{{ link.name }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </div>
          <span class="link-go">↗</span>
        </a>
      </div>
    </div>
  </template>

  <template v-if="activeTab === 'credit'">
    <div v-for="req in creditRequirements" :key="req.type" class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>{{ req.type }}</div>
      <div class="credit-summary">
        <div class="credit-item"><span class="credit-num">{{ req.total }}</span><span class="credit-label">总学分</span></div>
        <div class="credit-item"><span class="credit-num">{{ req.required }}</span><span class="credit-label">必修学分</span></div>
        <div class="credit-item"><span class="credit-num">{{ req.electives }}</span><span class="credit-label">选修学分</span></div>
      </div>
      <div class="credit-details">
        <div v-for="d in req.details" :key="d.name" class="credit-detail">
          <div class="credit-detail-header">
            <span class="credit-detail-name">{{ d.name }}</span>
            <span class="credit-detail-credits">{{ d.credits }} 学分</span>
          </div>
          <div class="credit-detail-courses">
            <span v-for="c in d.courses" :key="c" class="course-tag">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-if="activeTab === 'scholarship'">
    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 6px;"><span class="bar"></span>🏆 学业奖学金 · 奖励标准与比例</div>
      <p class="muted" style="font-size:12px;margin:0 0 14px;">依据《计算机与网络空间安全学院研究生学业奖学金评审细则（修订）》，每学年评审 1 次，金额单位：元/生·年</p>

      <div v-for="g in scholarshipGroups" :key="g.key" class="std-group">
        <div class="std-group-head">
          <span class="std-group-title">{{ g.icon }} {{ g.title }}</span>
          <span class="std-group-base">{{ g.base }}</span>
        </div>
        <div class="std-tiers">
          <div v-for="t in g.tiers" :key="t.name" class="std-tier">
            <div class="std-tier-icon">{{ t.icon }}</div>
            <div class="std-tier-name">{{ t.name }}</div>
            <div class="std-tier-amount">¥{{ t.amount.toLocaleString() }}</div>
            <div class="std-tier-ratio">占 {{ t.ratio }}</div>
          </div>
        </div>
        <div v-if="g.note" class="std-note">💡 {{ g.note }}</div>
      </div>

      <div class="scholarship-extra">
        <span>另可兼得：国家奖学金（硕士 ¥20,000 / 博士 ¥30,000）· 国家助学金（¥600/月）· 省政府奖学金等</span>
      </div>
    </div>

    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 16px;"><span class="bar"></span>📊 综合成绩构成与门槛</div>
      <div class="score-composition">
        <div class="comp-card">
          <div class="comp-title">硕士二年级</div>
          <div class="comp-bars">
            <div class="comp-bar" style="width:50%"><span>课程 50%</span></div>
            <div class="comp-bar alt" style="width:35%"><span>科研 35%</span></div>
            <div class="comp-bar alt2" style="width:15%"><span>综质 15%</span></div>
          </div>
          <div class="comp-note">一等需课程排名前 30% · 二等前 50%（或前 2 名）· 三等前 70%</div>
        </div>
        <div class="comp-card">
          <div class="comp-title">硕士三年级</div>
          <div class="comp-bars">
            <div class="comp-bar alt" style="width:85%"><span>科研 85%</span></div>
            <div class="comp-bar alt2" style="width:15%"><span>综质 15%</span></div>
          </div>
          <div class="comp-note">一等：开题合格 + 中期优秀 · 二等：开题合格 + 中期良好以上；开题/中期未按期通过不得申请</div>
        </div>
        <div class="comp-card">
          <div class="comp-title">博士二年级</div>
          <div class="comp-bars">
            <div class="comp-bar" style="width:40%"><span>课程 40%</span></div>
            <div class="comp-bar alt" style="width:50%"><span>科研 50%</span></div>
            <div class="comp-bar alt2" style="width:10%"><span>综质 10%</span></div>
          </div>
          <div class="comp-note">综合成绩总分从高到低排序</div>
        </div>
        <div class="comp-card">
          <div class="comp-title">博三四年级 / 五年级直博</div>
          <div class="comp-bars">
            <div class="comp-bar alt" style="width:90%"><span>科研 90%</span></div>
            <div class="comp-bar alt2" style="width:10%"><span>综质 10%</span></div>
          </div>
          <div class="comp-note">综合成绩总分从高到低排序</div>
        </div>
      </div>
    </div>

    <div class="panel calc-entry" style="margin-bottom:16px;">
      <div class="calc-entry-info">
        <b>🧮 综合成绩测算 · 加分积累</b>
        <span>课程加权平均（按专业预设目录）· 科研/综测快速选档累加 · 总分实时测算，已移至「综测积累」标签页</span>
      </div>
      <button class="calc-entry-btn" @click="activeTab = 'zc'">前往测算 →</button>
    </div>

    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 16px;"><span class="bar"></span>🎯 申请要点</div>
      <div class="guide-grid">
        <div v-for="g in scholarshipGuide" :key="g.title" class="guide-card" :class="{ highlight: g.highlight }">
          <div class="guide-header">
            <span class="guide-icon">{{ g.icon }}</span>
            <span class="guide-title">{{ g.title }}</span>
          </div>
          <div class="guide-content">{{ g.content }}</div>
        </div>
      </div>
    </div>

    <div class="panel disqual-panel">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>⚠️ 这些情况不能参评</div>
      <ul class="disqual-list">
        <li v-for="d in disqualifications" :key="d">{{ d }}</li>
      </ul>
      <p class="muted" style="font-size:12px;margin:10px 0 0;">细则全文以学院最新通知为准，本页内容仅供快速参考。</p>
    </div>
  </template>

  <template v-if="activeTab === 'zc'">
    <ZcAccumulator @goto="activeTab = 'scholarship'" />
  </template>

  <template v-if="activeTab === 'tools'">
    <div class="panel">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>🔧 学术工具推荐</div>
      <div class="tools-grid">
        <a v-for="t in academicTools" :key="t.name" :href="t.url" target="_blank" rel="noopener" class="tool-card">
          <div class="tool-header">
            <span class="tool-icon">{{ t.icon }}</span>
            <span class="tool-name">{{ t.name }}</span>
          </div>
          <div class="tool-desc">{{ t.desc }}</div>
          <span class="tool-category">{{ t.category }}</span>
        </a>
      </div>
    </div>
  </template>

  <template v-if="activeTab === 'calendar'">
    <div v-for="cal in academicCalendar" :key="cal.period" class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>{{ cal.period }}</div>
      <div class="timeline">
        <div v-for="(event, i) in cal.events" :key="i" class="timeline-item" :class="eventClass(event.type)">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">{{ event.date }}</div>
            <div class="timeline-event">{{ event.event }}</div>
            <span class="timeline-tag" :class="eventClass(event.type)">{{ eventType(event.type) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-if="activeTab === 'tips'">
    <div class="panel">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>📖 研究生指南</div>
      <div class="tips-grid">
        <div v-for="tip in tips" :key="tip.title" class="tip-card">
          <div class="tip-header">
            <span class="tip-icon">{{ tip.icon }}</span>
            <span class="tip-title">{{ tip.title }}</span>
          </div>
          <div class="tip-content">{{ tip.content }}</div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.link-grid { display: flex; flex-direction: column; gap: 10px; }
.link-card { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); text-decoration: none; color: var(--text); transition: all 0.2s; }
.link-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
.link-card.featured { border-color: var(--primary); background: var(--primary-soft); }
.link-icon { font-size: 24px; flex-shrink: 0; }
.link-info { flex: 1; min-width: 0; }
.link-name { font-weight: 700; font-size: 14px; }
.link-desc { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
.link-go { color: var(--primary); font-weight: 700; flex-shrink: 0; }

.credit-summary { display: flex; gap: 20px; margin-bottom: 16px; padding: 16px; background: var(--primary-soft); border-radius: var(--radius); }
.credit-item { text-align: center; flex: 1; }
.credit-num { display: block; font-size: 28px; font-weight: 800; color: var(--primary); }
.credit-label { font-size: 12px; color: var(--text-sub); }
.credit-details { display: flex; flex-direction: column; gap: 12px; }
.credit-detail { padding: 12px; background: var(--soft-fg); border-radius: var(--radius); border: 1px solid var(--border); }
.credit-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.credit-detail-name { font-weight: 700; font-size: 14px; }
.credit-detail-credits { font-size: 13px; color: var(--primary); font-weight: 700; }
.credit-detail-courses { display: flex; flex-wrap: wrap; gap: 6px; }
.course-tag { font-size: 11px; padding: 4px 10px; border-radius: 999px; background: var(--soft-gray); color: var(--text-sub); }

.std-group { padding: 14px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 12px; }
.std-group-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; flex-wrap: wrap; gap: 4px; }
.std-group-title { font-weight: 700; font-size: 14px; }
.std-group-base { font-size: 11px; color: var(--text-sub); }
.std-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.std-tier { text-align: center; padding: 12px 6px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
.std-tier-icon { font-size: 18px; }
.std-tier-name { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
.std-tier-amount { font-size: 20px; font-weight: 800; color: var(--primary); margin: 2px 0; }
.std-tier-ratio { font-size: 11px; padding: 1px 8px; border-radius: 999px; background: var(--primary-soft); color: var(--primary); display: inline-block; }
.std-note { font-size: 12px; color: var(--text-sub); margin-top: 10px; line-height: 1.6; }
.scholarship-extra { margin-top: 12px; padding: 10px 12px; background: var(--soft-yellow, #fff8e1); border: 1px dashed var(--accent, #b8860b); border-radius: var(--radius); font-size: 12px; color: var(--text-sub); }

.calc-entry { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; border-color: var(--primary); background: linear-gradient(135deg, var(--primary-soft), transparent); }
.calc-entry-info { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-sub); min-width: 200px; }
.calc-entry-info b { font-size: 14px; color: var(--text); }
.calc-entry-btn { padding: 10px 18px; border: none; border-radius: 999px; background: var(--primary); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; flex-shrink: 0; }
.calc-entry-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

.disqual-panel { border-color: #ef5350; }
.disqual-list { margin: 0; padding-left: 20px; font-size: 13px; line-height: 2; color: var(--text); }

.score-composition { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.comp-card { padding: 16px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); }
.comp-title { font-weight: 700; font-size: 14px; margin-bottom: 10px; }
.comp-bars { display: flex; gap: 4px; height: 32px; border-radius: 8px; overflow: hidden; }
.comp-bar { display: flex; align-items: center; justify-content: center; background: var(--primary); color: #fff; font-size: 11px; font-weight: 600; transition: all 0.3s; }
.comp-bar.alt { background: var(--primary-dark, #8e0000); }
.comp-bar.alt2 { background: #b8860b; }
.comp-bar:hover { opacity: 0.9; transform: scaleY(1.1); }
.comp-note { font-size: 11px; color: var(--text-sub); margin-top: 8px; }

.guide-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 16px; }
.guide-card { padding: 16px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); transition: all 0.2s; }
.guide-card:hover { border-color: var(--primary); }
.guide-card.highlight { border-color: var(--accent); background: var(--soft-yellow); }
.guide-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.guide-icon { font-size: 20px; }
.guide-title { font-weight: 700; font-size: 14px; }
.guide-content { font-size: 13px; color: var(--text-sub); line-height: 1.7; }

.tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.tool-card { padding: 16px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); text-decoration: none; color: var(--text); transition: all 0.2s; }
.tool-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
.tool-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tool-icon { font-size: 20px; }
.tool-name { font-weight: 700; font-size: 14px; }
.tool-desc { font-size: 12px; color: var(--text-sub); margin-bottom: 8px; }
.tool-category { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: var(--primary-soft); color: var(--primary); }

.timeline { position: relative; padding-left: 20px; }
.timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: var(--border); }
.timeline-item { position: relative; padding: 12px 0; }
.timeline-dot { position: absolute; left: -20px; top: 16px; width: 12px; height: 12px; border-radius: 50%; background: var(--border); border: 2px solid var(--card); }
.timeline-item.important .timeline-dot { background: var(--primary); }
.timeline-item.holiday .timeline-dot { background: #22c55e; }
.timeline-item.exam .timeline-dot { background: #f59e0b; }
.timeline-content { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.timeline-date { font-size: 12px; color: var(--text-sub); font-weight: 600; min-width: 80px; }
.timeline-event { font-size: 14px; font-weight: 600; }
.timeline-tag { font-size: 10px; padding: 2px 8px; border-radius: 999px; }
.timeline-tag.important { background: var(--primary-soft); color: var(--primary); }
.timeline-tag.holiday { background: #dcfce7; color: #166534; }
.timeline-tag.exam { background: #fef3c7; color: #92400e; }
.timeline-tag.normal { background: var(--soft-gray); color: var(--text-sub); }

.tips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
.tip-card { background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tip-icon { font-size: 20px; }
.tip-title { font-weight: 700; font-size: 14px; }
.tip-content { font-size: 13px; color: var(--text-sub); line-height: 1.7; }
</style>
