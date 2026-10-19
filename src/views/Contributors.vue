<script setup>
/** 贡献者墙：词云式展示项目贡献者，点击跳转 GitHub 主页
 *  社区代码贡献（含已合入的 Pull Request）都会在此致谢。 */
import { reactive } from 'vue'
import { contributors } from '../data/contributors.js'

const emit = defineEmits(['back'])

/** GitHub 头像直链（公开头像无需 API key），避免 github.com 302 链路波动 */
function avatarOf(c) {
  return `https://avatars.githubusercontent.com/${c.login}?size=96`
}

const broken = reactive(new Set())
function markBroken(c) {
  broken.add(c.login)
}

function fontOf(w) {
  return 18 + Math.round(w * 14)
}

function hueOf(i) {
  return 200 + i * 60
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">贡献者墙</div>
    <div class="view-sub">感谢每一位让 FJNU 校园导航变得更好的人</div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <span style="font-size:30px;">🏆</span>
      <div style="flex:1;min-width:200px;">
        <div style="font-weight:700;font-size:14px;">本项目由开源社区共同维护</div>
        <div class="muted" style="font-size:12px;margin-top:2px;">
          除了数据抓取机器人，站点代码的每一次改进都来自真实的人类贡献者 —— 点击名字可跳转 GitHub 主页。
        </div>
      </div>
    </div>
  </div>

  <div class="cloud panel">
    <a
      v-for="(c, i) in contributors"
      :key="c.name"
      class="cloud-item"
      :href="c.url"
      target="_blank"
      rel="noopener"
      :style="{ fontSize: fontOf(c.weight) + 'px', '--hue': hueOf(i) }"
    >
      <img
        v-if="c.login && !broken.has(c.login)"
        class="cloud-avatar"
        :src="avatarOf(c)"
        alt=""
        referrerpolicy="no-referrer"
        @error="markBroken(c)"
      />
      <span v-else class="cloud-emoji">{{ c.emoji }}</span>
      <span class="cloud-name">{{ c.name }}</span>
      <span class="cloud-role">{{ c.role }}</span>
    </a>
  </div>

  <div class="panel" style="margin-top:16px;">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>版本历史</div>
    <ul class="changelog">
      
      <li><b>v1.7.24</b> — {{ '夜间模式修缮（APK 1.3.14）：课表今日列/节假日/补课/调课徽标亮色块暗色化；表单控件暗底亮字；课程卡染色暗色下防发灰。' }}</li>
      <li><b>v1.7.23</b> — {{ '课表学期同步闭环（APK 1.3.13）：站点发新学期数据后 app 自动换课表/学期起点/节假日；专业列表跟随站点同步。' }}</li>
      <li><b>v1.7.22</b> — {{ '课表 App 维护（APK 1.3.12）：修复学期起点 UTC 解析致周一凌晨周次偏少的时区 bug（5 处）；日列表新增「空闲时段」卡；周导航显示本周门数/节数；深链 ?view=tomorrow；主题默认跟随系统深色。' }}</li>
      <li><b>v1.7.21</b> — {{ 'Agent 新工具：内联计算器（纯算式直出结果）、「帮我做决定」随机抽选、相对时间快速提醒入提醒中心；Ctrl+K/Alt+A 全局唤起悬浮舱；番茄钟直达意图。' }}</li>
      <li><b>v1.7.20</b> — {{ 'Agent 智能升级：复合指令（「顺便/然后」自动拆句，仅自动执行只读免确认的工作流）、时段感知建议、近似意图「猜你想说」、未命中话术本机记录进 Agent 看板；本地存储键统一为中立命名（旧数据自动迁移不丢）；界面残留异校文案清理。' }}</li>
      <li><b>v1.7.1</b> — {{ '备份与恢复：记账数据可导出 JSON 自行保管、清缓存/换设备后导入恢复（追加去重 + 整体替换双模式）；新增预算页真机冒烟 12 项与部署前端单测门禁。' }}</li>
      <li><b>v1.7.0</b> — {{ '生活费预算引擎：与 QDU 同一套统计算法（稳健月均 / 剔除进行中当月 + 跑量外推 / 加权分类占比 / 样本置信度 / 趋势预测 / 订阅体检 / 占比一键配平）；账单导入扩展银行通用流水并补齐独立收入词表。' }}</li>
      <li><b>v1.6.11</b> — {{ '账单导入修复：中行 PDF 解析改为按需加载 pdfjs（Vite ?url 打包同版本本地 worker，修正原 CDN 旧版 worker 不匹配），Budget 分包 605KB→120KB。' }}</li>
      <li><b>v1.6.10</b> — {{ '维护知识 skill 化：架构/发布清单/调课套路/APK 打包拆入项目专属技能 fjnu-nav-maintainer（随 git 分发、按需加载），AGENTS.md 瘦身为项目简介+红线+更新日志。' }}</li>
      <li><b>v1.6.9</b> — {{ '课表调课与体验修复：10/13 周二晚人工智能通识课调至 10/15 周四晚·笃行1-114（26级全专业三端同步）；修复调入日今日课程卡/列表/倒计时看不到调入课；日程助手课表可切专业并持久化。' }}</li>
      <li><b>v1.6.8</b> — {{ 'APK 版本号改 1.1（versionCode 3，签名仍为可覆盖的 2277d065，直接覆盖手机上的 1.0）。' }}</li>
      <li><b>v1.6.7</b> — {{ 'APK 换用可覆盖签名（与手机已装 1.0 同证书 2277d065，直接覆盖安装）；打包脚本默认自动使用该钥匙且 keystore 不入库；调课原位置显示「已调整无课」。' }}</li>
      <li><b>v1.6.6</b> — {{ '调课后原位置改「已调整无课」不再显示教室（三端）；APK versionName 回 1.0（versionCode 3 保证覆盖）；签名不可伪造结论与三条路线。' }}</li>
      <li><b>v1.6.5</b> — {{ '提建议增加邮件备用通道（收件人与正文预填、零后端，APK 端同时复制内容兜底）；签名诊断：维护者提供的 1.0 包为 Android Debug 签名且非本机，打包支持 -PksPath 换 keystore。' }}</li>
      <li><b>v1.6.4</b> — {{ 'APK 顶栏「⏰ 下一节课」实时倒计时卡（跨天找课、每秒刷新、点击跳周）；提建议失败自动重试 3 次并显示真实原因；常驻通知跨天给出下一节；签名诊断：仓库新旧包同证书可覆盖。' }}</li>
      <li><b>v1.6.3</b> — {{ '课表 App 常驻通知：锁屏/通知栏显示下一节课与今日课程（每小时刷新、过期自动降级、Android 13+ 授权）；清理 camera 残留权限。' }}</li>
      <li><b>v1.6.2</b> — {{ '课表 App 修复与增强：检测更新不再误报（版本单一事实来源 + 数值比较）、同步状态不常驻、调课三路可撤销、恢复默认清调课并补入口、夜间模式、顶栏单日列表 + 当前时刻时间线；APK 1.2。' }}</li>
      <li><b>v1.6.1</b> — {{ '提建议改为纯站内直接提交：直提校园墙建议分区实测通过，移除 GitHub 跳转，失败自动暂存本机、联网补交。' }}</li>
      <li><b>v1.6.0</b> — {{ '课表同步与建议通道：课表数据接口（网页/APK 共用，断网有缓存）、点课程调课与单周删改、APK 1.1 覆盖升级且包体 2.88MB→0.99MB、三端「💡提建议」直达校园墙建议分区。' }}</li>
      <li><b>v1.5.19</b> — {{ '课表单次调课：第八周 10/20 晚人工智能通识课调至第十二周 11/19 立诚1-105（改期/调入双角标，日程助手·课程表·移动端三端同步）。' }}</li>
      <li><b>v1.5.20</b> — {{ 'GitHub 评论敏感词巡检与姊妹仓同源：gh-comments 事后巡检 API。' }}</li>
      <li><b>v1.5.18</b> — {{ '评论网关与姊妹仓同源加固：admin 删除评论多级子孙收敛。' }}</li>
      <li><b>v1.5.17</b> — {{ '评论网关与姊妹仓同源增强：delete owner 鉴权 + GET 防盗删过滤。' }}</li>
      <li><b>v1.5.16</b> — {{ '视觉走查：顶栏短名/私信一行/洞察柱防挤出/EN 欢迎页与首页夹生清零（真机截图肉眼审查）。' }}</li>
      <li><b>v1.5.15</b> — {{ '复盘修复：首页 i18n 补全（16 键接线，EN 模式不再夹生）+ 单测周日公式修正 + gen 加固。' }}</li>
      <li><b>v1.5.14</b> — {{ '防复发门禁：kb-nav 新鲜度 + i18n 键对等 + COMMUNITY_DATA 隔离 + crosscheck/sync-diff + 375 扫描。' }}</li>
      <li><b>v1.5.13</b> — {{ '应用排序调优：日程助手/研究生服务置顶，其余组内老前新后重排。' }}</li>
      <li><b>v1.5.12</b> — {{ '访问统计卡 i18n：VisitStats 中文全部 t() 化，zh/en 词包新增 visitStats 9 键。' }}</li>
      <li><b>v1.5.11</b> — {{ '不蒜子第三方实时统计三指标：共享模块 utils/busuanzi.js + ensureHost 兼容 Vercount。' }}</li>
      <li><b>v1.5.10</b> — {{ 'i18n/E2E/收尾：注册表英文字段 + 浏览器 E2E + 树形回复 + 多草稿箱 + RichEditor 进私信。' }}</li>
      <li><b>v1.5.9</b> — {{ '高级感与新工作流：富文本/TTS/ICS + 8 工作流校本同步。' }}</li>
      <li><b>v1.5.8</b> — {{ '代码治理校本同步：草稿统一/洞察去重/统一出口/脚手架统一。' }}</li>
      <li><b>v1.5.7</b> — {{ '暗门口令先验后开 + 用户面去管理字样 + 报修工单解析加固。' }}</li>
      <li><b>v1.5.6</b> — {{ '管理端入口修复：暗门改 adminUrl，根除子路径跳域名根 404。' }}</li>
      <li><b>v1.5.5</b> — {{ '公有云开箱共享：缺省配置 + 云网并集不断存量。' }}</li>
      <li><b>v1.5.4</b> — {{ '技能数据看板 + 帖子详情抽屉 + 发布完整性门禁进CI。' }}</li>
      <li><b>v1.5.3</b> — {{ '管理端线上可用：/admin 跳转垫片进包 + 云端直连模式（看帖删帖）+ console 垫片。' }}</li>
      <li><b>v1.5.2</b> — {{ '白屏热修：补齐模板缺失的 lang/toggleLang/navLabel；全局渲染保险。' }}</li>
      <li><b>v1.5.1</b> — {{ '智能体交互升级：上下文追问、主动问候、打字机回复、专属追问；/admin 跳转垫片。' }}</li>
      <li><b>v1.5.0 大版本</b> — {{ '冲奖六件套校本同步：三新工作流、画像推送、招聘板块、对比/飞轮/移植/画像五应用、AI 评论治理。' }}</li>
      <li><b>v1.4.0 大版本</b> — {{ '在线化（与姊妹仓同批）：API 基地址切换、数据管家、私信+番茄钟、SSE 退避、网关 SSE 补齐、E2E 场景包 10/10。' }}</li>
      <li><b>v1.3.1</b> — {{ '技能市场、信任等级徽章、课表导入器、智能体介绍页、草稿保存、AI 帖子摘要。' }}</li>
      <li><b>v1.3.0 大版本</b> — {{ '对话式智能体 × 超级论坛：师大智答 27 工作流、BM25 校本知识、12 分区论坛、隐秘管理台、换校 bat 与网站工坊。' }}</li>
      <li><b>v1.2.27</b> — {{ '换校工具.bat 一键启动 + 网站工坊（表单编辑、样式实时、生成 site.js）。' }}</li>
      <li><b>v1.2.26</b> — {{ 'BM25 校本知识层五级识别链；架构/部署白皮书与 27 工作流剧本。' }}</li>
      <li><b>v1.2.25</b> — {{ '超级论坛（12 分区/悬赏投票资源/积分广告位）+ 提醒中心/社区洞察/换校向导。' }}</li>
      <li><b>v1.2.24</b> — {{ '智能体 v2 三模式与计划卡；敏感词拦截、举报与管理台。' }}</li>
      <li><b>v1.2.23</b> — {{ '智能体首版校本适配：师大智答、40+ 意图、13 工作流、评论网关。' }}</li>
      <li><b>v1.2.22</b> 课表节假日调休系统（中秋国庆法定假日标记 · 调休补课日自动映射课表周几）</li>
      <li><b>v1.2.13</b> 新增日程助手应用（智能时间轴 + 实时提醒 + 准备清单 + 版本化历史日程）</li>
      <li><b>v1.2.12</b> 全站跨应用联动体系（课程表→教室导航/食堂·食堂→记账·贴吧→应用推荐·体测→饮食·奖学金→记账·学号→邮箱·速配→导航）</li>
      <li><b>v1.2.11</b> 研究生服务新增学科竞赛清单 · A/B类竞赛分类展示 · 奖学金标准 · 联动综测积累选档</li>
      <li><b>v1.2.10</b> 校历轮播滑动方向修正 · 边界阻尼修复 · 按钮切换丝滑过渡</li>
      <li><b>v1.2.9</b> 学术工具箱分组扩充（期刊/会议查询 · 文献发现）· 就业信息直达</li>
      <li><b>v1.2.8</b> 校园动态新增计网学院官网栏目 · 搜索过滤</li>
      <li><b>v1.2.7</b> 教室大全楼栋指引卡 · 分步导航与地图定位</li>
      <li><b>v1.2.6</b> 校历图片预览 · 搜索功能索引 · 教室大全</li>
      <li><b>v1.2.5</b> 综测积累模块 · 课程加权测算 · 科研/综测快速选档联动</li>
      <li><b>v1.2.4</b> 奖学金页按最新评审细则重写 · 新增科研分测算器</li>
      <li><b>v1.2.3</b> 修正奖学金金额 · 更新官网链接 · 研究生指南完善</li>
      <li><b>v1.2.2</b> 研究生服务 · 学术日历</li>
      <li><b>v1.2.1</b> 文字头像美化 · 加载动画 · 预加载</li>
      <li><b>v1.2.0</b> 课程表接入 NextFStar · 食堂重设计</li>
      <li><b>v1.1.0</b> 公告系统 · 路由懒加载</li>
      <li><b>v1.0.0</b> 首版发布</li>
    
    </ul>
    <p class="muted" style="font-size:12px;margin-top:10px;">
      每个版本的完整改动清单见 <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区文档</a> 与仓库 README 版本历史。
    </p>
    <p class="muted" style="font-size:12px;margin-top:6px;">
      想加入贡献者墙？给
      <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区</a>
      提 Pull Request，被合入后你的名字就会出现在这里。
    </p>
    <div style="margin-top:16px;padding:12px;background:var(--soft-fg);border-radius:var(--radius);border:1px solid var(--border);">
      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">💡 灵感参考与致谢</div>
      <div class="muted" style="font-size:12px;line-height:1.8;">
        本项目的课程表、教室导航、今天吃什么等功能设计参考了
        <a href="https://nfs.pcdawn.cn/" target="_blank" rel="noopener">NextFStar（nfs.pcdawn.cn）</a>
        的交互设计，在此致谢。原项目采用 Vue 3 + Element Plus 实现，功能完整且体验优秀，
        本项目在此基础上适配了福建师范大学的数据源。
      </div>
    </div>
  </div>
</template>

<style scoped>
.cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding: 28px 16px;
  min-height: 220px;
}
.cloud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  max-width: 250px;
  padding: 14px 16px 12px;
  border-radius: 16px;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, hsl(var(--hue) 65% 45%), hsl(calc(var(--hue) + 30) 65% 60%));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  text-align: center;
}
.cloud-item:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
}
.cloud-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.75);
  object-fit: cover;
  flex: none;
}
.cloud-emoji { font-size: 26px; }
.cloud-name {
  font-weight: 800;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.cloud-role {
  font-size: 11px;
  opacity: 0.95;
  line-height: 1.5;
  white-space: normal;
  max-width: 220px;
  word-break: break-word;
}
.changelog {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text);
}
.changelog a {
  color: var(--primary, #c62828);
}
</style>