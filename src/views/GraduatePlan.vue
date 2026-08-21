<script setup>
import { ref, reactive, computed } from 'vue'

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

const scoreRules = [
  { title: '论文得分（权重最高）', icon: '📝', highlight: true,
    rows: [
      ['顶级学术期刊', '160 分/篇'], ['国际 A 类（含 CCF-A）', '80 分/篇'],
      ['国际 B 类（含 CCF-B）', '40 分/篇'], ['国际 C 类 / 国内 A 类', '20 分/篇'],
      ['国内 B 类', '10 分/篇'], ['国内 C 类', '5 分/篇'],
    ],
    note: '须研究生一作；导师一作时研究生须通讯/共同一作。外文论文须有 DOI 且在线时间在截止日前' },
  { title: '专利 · 项目 · 转让', icon: '🔬',
    rows: [
      ['发明专利授权', '20 分/件'], ['实用新型专利授权', '5 分/件'],
      ['国自然博士生项目', '60 分/项'], ['一流网安学院创新资助立项', '20 分/项'],
      ['成果转让 / 技术服务', '1 分/万元（上限 40 分）'],
    ],
    note: '专利须导师一作、研究生二作；署名单位须为福建师大或本学院' },
  { title: 'A 类竞赛（负责人满分）', icon: '🎯',
    rows: [
      ['国家级特等/一等/二等/三等', '80 / 54 / 36 / 24'], ['省级特等/一等/二等/三等', '20 / 16 / 12 / 9'],
      ['校级一等/二等/三等', '5 / 3 / 2'], ['院级一等/二等/三等', '2 / 1 / 0.5'],
    ],
    note: '成员按系数折减：第 2-5 人 ×0.9，6-8 人 ×0.8，9-12 人 ×0.7，13-15 人 ×0.6；同项目多档次取最高' },
  { title: 'B 类竞赛（全员同分）', icon: '🏅',
    rows: [
      ['国家级一等/二等/三等/优秀', '20 / 16 / 12 / 5'], ['省级一等/二等/三等/优秀', '10 / 8 / 6 / 2'],
      ['校级一等/二等/三等', '3 / 2 / 1'], ['院级一等/二等/三等', '1.5 / 1 / 0.5'],
    ],
    note: '团队项目每位成员均获对应奖励分；清单见学院高水平创新创业竞赛实施办法' },
  { title: '综合素质分（硕士满分 15 / 博士满分 10）', icon: '🌟',
    rows: [
      ['荣誉称号 国家级 / 省级 / 校级', '10 / 7 / 5'], ['研究生会主席等核心岗位', '8 分'],
      ['部长 / 班长 / 团支书 / 党支书', '6 分'], ['志愿服务每 20 小时', '1 分（上限 4 分）'],
      ['无偿献血', '1 分/次（上限 2 分）'],
    ],
    note: '含荣誉嘉奖、社会工作、体育美育劳育；处分与通报批评按档扣分' },
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

const calcProfiles = {
  'master-2': { label: '硕士二年级', course: 50, research: 35, quality: 15, cap: 35, qCap: 15, gates: '一等需课程排名前 30% · 二等前 50%（或前 2 名）· 三等前 70%' },
  'master-3': { label: '硕士三年级', course: 0, research: 85, quality: 15, cap: 85, qCap: 15, gates: '一等需开题合格 + 中期考核优秀 · 二等需开题合格 + 中期良好以上' },
  'phd-2': { label: '博士二年级', course: 40, research: 50, quality: 10, cap: 50, qCap: 10, gates: '以综合成绩总分从高到低排序' },
  'phd-3': { label: '博三四年级 / 五年级直博', course: 0, research: 90, quality: 10, cap: 90, qCap: 10, gates: '以综合成绩总分从高到低排序' },
}

const calcForm = reactive({ profile: 'master-2', course: 85, research: 20, quality: 8 })

const calcResult = computed(() => {
  const p = calcProfiles[calcForm.profile]
  // 细则口径：科研分/综质分的满分已含权重（如硕三科研满分 85 = 占比 85%），
  // 直接取封顶后的得分相加即可；课程学习成绩分 = 加权平均分 × 占比。
  const research = Math.min(Number(calcForm.research) || 0, p.cap)
  const quality = Math.min(Number(calcForm.quality) || 0, p.qCap)
  const coursePart = (Math.min(Math.max(Number(calcForm.course) || 0, 0), 100)) * p.course / 100
  const total = coursePart + research + quality
  return {
    total: total.toFixed(2),
    parts: [
      p.course ? { label: `课程(${p.course}%)`, value: coursePart.toFixed(2) } : null,
      p.research ? { label: `科研(满分${p.cap})`, value: research.toFixed(2) } : null,
      p.quality ? { label: `综质(满分${p.qCap})`, value: quality.toFixed(2) } : null,
    ].filter(Boolean),
    gates: p.gates,
    capped: Number(calcForm.research) > p.cap || Number(calcForm.quality) > p.qCap,
  }
})

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

    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 16px;"><span class="bar"></span>🧮 科研分测算器</div>
      <div class="calc-layout">
        <div class="calc-form">
          <label class="calc-field">
            <span class="calc-label">我的身份</span>
            <select v-model="calcForm.profile" class="calc-input">
              <option v-for="(p, k) in calcProfiles" :key="k" :value="k">{{ p.label }}</option>
            </select>
          </label>
          <label class="calc-field" v-if="calcProfiles[calcForm.profile].course > 0">
            <span class="calc-label">课程加权平均分（仅必修课，0-100）</span>
            <input type="number" min="0" max="100" v-model.number="calcForm.course" class="calc-input" />
          </label>
          <label class="calc-field">
            <span class="calc-label">科研创新原始得分（论文+专利+竞赛…，满分 {{ calcProfiles[calcForm.profile].cap }}）</span>
            <input type="number" min="0" v-model.number="calcForm.research" class="calc-input" />
          </label>
          <label class="calc-field">
            <span class="calc-label">综合素质原始得分（满分 {{ calcProfiles[calcForm.profile].qCap }}）</span>
            <input type="number" min="0" v-model.number="calcForm.quality" class="calc-input" />
          </label>
        </div>
        <div class="calc-result">
          <div class="calc-total-label">预计综合成绩总分</div>
          <div class="calc-total">{{ calcResult.total }}</div>
          <div class="calc-parts">
            <div v-for="part in calcResult.parts" :key="part.label" class="calc-part">
              <span>{{ part.label }}</span><b>{{ part.value }}</b>
            </div>
          </div>
          <div v-if="calcResult.capped" class="calc-warn">⚠️ 得分超出满分上限，已按封顶值计算；若同年级有人超满分，全员按比例换算</div>
          <div class="calc-gates">{{ calcResult.gates }}</div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:16px;">
      <div class="section-title" style="margin:0 0 16px;"><span class="bar"></span>📋 计分速查</div>
      <div class="rules-grid">
        <div v-for="r in scoreRules" :key="r.title" class="rule-card" :class="{ highlight: r.highlight }">
          <div class="rule-header"><span class="rule-icon">{{ r.icon }}</span><span class="rule-title">{{ r.title }}</span></div>
          <table class="rule-table">
            <tr v-for="row in r.rows" :key="row[0]"><td>{{ row[0] }}</td><td class="rule-score">{{ row[1] }}</td></tr>
          </table>
          <div class="rule-note">{{ r.note }}</div>
        </div>
      </div>
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

.rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
.rule-card { padding: 16px; background: var(--soft-fg); border: 1px solid var(--border); border-radius: var(--radius); }
.rule-card.highlight { border-color: var(--accent, #b8860b); background: var(--soft-yellow, #fff8e1); }
.rule-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.rule-icon { font-size: 18px; }
.rule-title { font-weight: 700; font-size: 13px; }
.rule-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.rule-table td { padding: 5px 0; border-bottom: 1px dashed var(--border); color: var(--text-sub); }
.rule-table tr:last-child td { border-bottom: none; }
.rule-score { text-align: right; font-weight: 700; color: var(--primary); white-space: nowrap; }
.rule-note { font-size: 11px; color: var(--text-sub); margin-top: 8px; line-height: 1.6; opacity: 0.85; }

.calc-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .calc-layout { grid-template-columns: 1fr; } }
.calc-form { display: flex; flex-direction: column; gap: 12px; }
.calc-field { display: flex; flex-direction: column; gap: 4px; }
.calc-label { font-size: 12px; color: var(--text-sub); }
.calc-input { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); color: var(--text); font-size: 14px; outline: none; }
.calc-input:focus { border-color: var(--primary); }
.calc-result { padding: 16px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: var(--radius-lg); color: #fff; display: flex; flex-direction: column; gap: 8px; }
.calc-total-label { font-size: 12px; opacity: 0.9; }
.calc-total { font-size: 40px; font-weight: 800; line-height: 1.1; }
.calc-parts { display: flex; flex-wrap: wrap; gap: 6px; }
.calc-part { font-size: 11px; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.18); display: flex; gap: 6px; }
.calc-warn { font-size: 11px; background: rgba(255,255,255,0.15); padding: 6px 10px; border-radius: 8px; line-height: 1.5; }
.calc-gates { font-size: 11px; opacity: 0.9; line-height: 1.6; }

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
