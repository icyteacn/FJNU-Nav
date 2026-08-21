<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['back'])

const activeTab = ref('links')
const selectedCollege = ref('')

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

const tips = [
  { title: '选课建议', content: '研究生选课前请仔细阅读培养方案，必修课优先选修。选课系统开放时间有限，建议提前准备好课程列表。', icon: '💡' },
  { title: '论文进度', content: '学位论文有严格的时间节点，请提前规划好写作进度。开题报告、中期检查、答辩申请等材料需提前准备。', icon: '📅' },
  { title: '奖学金申请', content: '国家奖学金、学业奖学金等有固定的申请时间，请关注研究生院通知。申请材料需提前准备。', icon: '🏆' },
  { title: '学术资源', content: '通过VPN可校外访问知网、万方等学术数据库。建议收藏常用数据库入口。', icon: '📚' },
  { title: '导师沟通', content: '定期与导师沟通研究进展，参加导师组会。遇到问题及时寻求帮助。', icon: '👨‍🏫' },
  { title: '论文查重', content: '论文提交前务必进行查重检测。学校提供免费查重机会，请合理使用。', icon: '🔍' },
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

  <div class="tab-row" style="margin-bottom:16px;">
    <button class="tab" :class="{ active: activeTab === 'links' }" @click="activeTab = 'links'">常用网站</button>
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
.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  text-decoration: none;
  color: var(--text);
  transition: all 0.2s;
}
.link-card:hover { border-color: var(--primary); box-shadow: var(--shadow-hover); }
.link-card.featured { border-color: var(--primary); background: var(--primary-soft); }
.link-icon { font-size: 24px; flex-shrink: 0; }
.link-info { flex: 1; min-width: 0; }
.link-name { font-weight: 700; font-size: 14px; }
.link-desc { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
.link-go { color: var(--primary); font-weight: 700; flex-shrink: 0; }

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
