<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['back'])

const activeTab = ref('links')

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

const scholarships = [
  { name: '硕士研究生国家奖学金', amount: 20000, type: '学业优秀', cycle: '每年', requirement: '成绩优异 + 科研成果突出', icon: '🏆' },
  { name: '博士研究生国家奖学金', amount: 30000, type: '学业优秀', cycle: '每年', requirement: '成绩优异 + 科研成果突出', icon: '🏆' },
  { name: '学业奖学金（一等）', amount: 12000, type: '学业优秀', cycle: '每年', requirement: '综合排名前20%', icon: '🥇' },
  { name: '学业奖学金（二等）', amount: 8000, type: '学业优秀', cycle: '每年', requirement: '综合排名前50%', icon: '🥈' },
  { name: '学业奖学金（三等）', amount: 4000, type: '学业优秀', cycle: '每年', requirement: '综合排名前80%', icon: '🥉' },
  { name: '国家助学金（每月）', amount: 600, type: '基本保障', cycle: '每月', requirement: '所有全日制研究生', icon: '💰' },
  { name: '省政府奖学金', amount: 10000, type: '省级荣誉', cycle: '每年', requirement: '省级评选', icon: '🏅' },
  { name: '优秀研究生奖学金', amount: 5000, type: '学业优秀', cycle: '每年', requirement: '综合表现优秀', icon: '⭐' },
  { name: '竞赛奖学金（挑战杯·国特）', amount: 30000, type: '竞赛奖励', cycle: '按项目', requirement: '国家级特等奖', icon: '🎯' },
  { name: '竞赛奖学金（A类·国一）', amount: 5000, type: '竞赛奖励', cycle: '按项目', requirement: '国家级一等奖', icon: '🎖️' },
  { name: '博学奖学金（发明专利）', amount: 5000, type: '科研奖励', cycle: '按成果', requirement: '发明专利授权', icon: '📜' },
  { name: '研究生助研津贴', amount: 0, type: '岗位津贴', cycle: '每月', requirement: '导师课题组', icon: '🔬' },
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
  { title: '奖学金申请', content: '国家奖学金每年9-10月申请，成果不可重复申报。学业成绩优异 + 科研成果突出是核心竞争力。', icon: '🏆' },
  { title: '学术资源', content: '通过VPN可校外访问知网、万方等学术数据库。建议收藏常用数据库入口。', icon: '📚' },
  { title: '导师沟通', content: '定期与导师沟通研究进展，参加导师组会。遇到问题及时寻求帮助。', icon: '👨‍🏫' },
  { title: '论文查重', content: '论文提交前务必进行查重检测。学校提供免费查重机会，请合理使用。', icon: '🔍' },
  { title: '英语六级', content: '研究生期间建议通过英语六级，部分奖学金和出国机会需要六级成绩。', icon: '📝' },
  { title: '学术会议', content: '积极参加学术会议，了解领域前沿。学校有会议资助政策，可申请报销。', icon: '🎤' },
  { title: '实习实践', content: '专业型研究生需要完成实习实践环节，建议提前联系实习单位。', icon: '💼' },
  { title: '档案管理', content: '研究生档案包含成绩单、获奖证书等重要材料，请妥善保管。', icon: '📁' },
  { title: '国家奖学金评审', content: '评审标准：科研创新占90% + 综合素质占10%。评审时间：每年9-10月。可多次获奖但成果不可重复使用。', icon: '📊' },
  { title: '科研成果要求', content: '论文须为第一作者（导师一作需为通讯/共同一作）；专利须导师一作、研究生二作；竞赛获奖可累加计分。', icon: '🔬' },
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
    <div class="panel">
      <div class="section-title" style="margin:0 0 12px;"><span class="bar"></span>🏆 奖学金与资助</div>
      <div class="scholarship-grid">
        <div v-for="s in scholarships" :key="s.name" class="scholarship-card">
          <div class="scholarship-header">
            <span class="scholarship-icon">{{ s.icon }}</span>
            <span class="scholarship-name">{{ s.name }}</span>
          </div>
          <div class="scholarship-amount">{{ s.amount > 0 ? '¥' + s.amount.toLocaleString() : '按标准' }}</div>
          <div class="scholarship-meta">
            <span class="scholarship-type">{{ s.type }}</span>
            <span class="scholarship-cycle">{{ s.cycle }}</span>
          </div>
          <div class="scholarship-req">{{ s.requirement }}</div>
        </div>
      </div>
    </div>
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

.scholarship-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.scholarship-card { padding: 16px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); }
.scholarship-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.scholarship-icon { font-size: 20px; }
.scholarship-name { font-weight: 700; font-size: 14px; }
.scholarship-amount { font-size: 22px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
.scholarship-meta { display: flex; gap: 8px; margin-bottom: 8px; }
.scholarship-type, .scholarship-cycle { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--soft-gray); color: var(--text-sub); }
.scholarship-req { font-size: 12px; color: var(--text-sub); }

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
