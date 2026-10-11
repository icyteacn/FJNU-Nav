# AGENTS.md — 本站维护须知（每次会话必读）

> 本文件是 AI 助手与本仓库协作的「维护手册」：先读本项目须知，再读下方「维护清单」与「更新日志」，
> 确保每次改动都遵循既有架构与发布流程。更新日志的机制与 `FJNU-Wiki/prompt/AGENT-GUIDE.md` 一脉相承：
> **每次发布都把「改了什么 / 为什么改 / 验证结果」追加到日志**，方便后续会话快速接续上下文。

## 一、项目是什么

**FJNU-Nav（福star导航）**：面向福建师范大学的纯静态校园导航单页应用。

- 技术栈：Vite + Vue 3（Composition API）+ 无后端，托管于 GitHub Pages。
- 数据策略：**「优先抓实时、回退用快照」**——有 server 网关时请求实时接口，纯静态托管下读取 `public/data/` 下的静态快照。
- 定时数据：GitHub Actions `snapshot.yml` 每 6 小时抓取福建师范大学教务处公开数据并自动提交；前端「数据洞察 / 贴吧舆情 / 食堂空座率」等依赖该产物。

## 二、架构速览（改动前先确认位置）

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 应用注册 | `src/data/apps.js` | 首页应用网格的唯一来源 |
| 路由注册 | `src/router.js` | 应用 id → 视图组件的映射（新增页面必须双登记） |
| 站点配置 | `src/config/site.js` | 站点名 / 副标题 / 版本号（**版本号唯一维护点**） |
| 视图 | `src/views/*.vue` | 各应用页面 |
| 静态数据 | `src/data/*.js` | 校历、食堂、学院官网、题库、配置等前端内置数据 |
| 数据抓取（Python 首选） | `crawler/` | `fetcher.py` 抓取 / `parsers.py` 解析 / `build_snapshot.py` 快照 / `analysis.py` 洞察 / `canteen.py` 食堂空座率 / `tieba.py` 贴吧舆情 / `validate.py` 校验 / `diff.py` 差异摘要 / `make_baseline.py` 离线基线 |
| 数据抓取（Node 回退） | `scripts/snapshot.mjs`、`scripts/tieba.mjs`、`scripts/canteen.mjs` | 与 Python 版输出格式一致 |
| 静态产物 | `public/data/*.json` | `snapshot.json`、`course_stats.json`、`tieba_stats.json`、`canteen_live.json`（由 CI 提交） |
| 定时任务 | `.github/workflows/snapshot.yml` | 每 6h 抓取并自动提交；`deploy.yml` 构建部署 |

## 三、数据链路（新增数据源时照此办理）

1. 在 `crawler/` 新增抓取/解析脚本（requests 优先、标准库回退；保持 `scripts/` 有 Node 回退）。
2. 在 `.github/workflows/snapshot.yml` 的 crawl job 中加入步骤，并在 `git add` 中登记产物文件。
3. 前端在 `src/views/` 下新建视图，在 `apps.js` + `router.js` 双登记。
4. 抓取应「尽力而为」：失败不覆盖上一次成功数据、不阻塞整体提交（参见 `crawler/tieba.py` 的处理方式）。
5. 静态数据文件必须能被 404 优雅降级（前端做好空态），因为首次部署前产物文件可能不存在。

## 四、维护清单（每次改动必须按序执行）

1. **改完跑 Python 单测**：`python -m unittest discover -s tests`（解析器/构建器改动必须补单测）。
2. **前端构建**：`npm run build`，确认无报错、JS 体积合理。
3. **回归**：用 `node server/index.mjs` 起服务（端口 8787），跑 CDP 回归脚本（基线见 `C:\Users\13111\AppData\Local\Temp\opencode\fjnu-nav\`），确认全绿。
4. **更新 README**：功能表 / 数据来源 / 版权说明如有变化需同步；版本历史追加一行。
5. **更新贡献者墙**：`Contributors.vue` 的「社区贡献记录」务必追加一条新版本简介（与 README 版本历史同步），这是每次版本更新的固定动作。
6. **更新版本号**：按 `x.y.z`——小更新（bug 修复 / 文案 / 维护性改动）只加 z（如 1.0.0→1.0.1）；功能迭代 / 新功能等大更新加 y 并归零 z（如 1.0.x→1.1.0）。版本号只在 `src/config/site.js` 维护，README 头部版本行同步。
7. **追加本文件「更新日志」**：写清楚改了什么、为什么、验证结果。
8. **提交并推送**：commit message 用 `feat:` / `fix:` / `data:` 前缀；push 前先 `git fetch` 处理定时任务的自动提交（需要时 rebase）。

## 五、红线

- 不引入前端注释（除非必要）；不新增未经确认的依赖库。
- 不编造数据：抓不到就如实降级（空态 + 提示），绝不捏造课程/食堂/舆情数据。
- 版权与隐私：贴吧帖子等第三方内容只做轻量聚合，页面需注明来源。
- 版本号只在 `site.js` 维护，不要在页面模板里硬编码。
- **改 `faq.js`/`workflows.js`/`apps.js` 后必须重跑 `node scripts/gen_kb_nav.mjs` 并提交**（integrity 门禁拦陈旧）；出处交叉审计 `node scripts/crosscheck-kbnav.mjs`。
- **推送一律 `git push origin`**（本仓属 icyteacn 账户，严禁手写 IceofTea URL 防误推旧副本）；push 前必 fetch 看抢推。
- **本地测试网关用 `COMMUNITY_DATA=server/data/community.test.json node server/index.mjs`**（测试写数据副本；正式 community.json 勿被场景/冒烟测试写脏）。
- 本机默认 `python` 可能过旧 → Wiki 侧构建/单测用 `py -3.13`（本仓前端测试用 node 即可）。

---

## 六、更新日志

| 日期 | 版本 | 内容 |
| --- | --- | --- |
| 2026-10-11 | v1.5.16 | **视觉走查（patch）**。22 张真机截图肉眼审查：① **顶栏挤压**（390px 下 brand+6 按钮溢出，「FJNU 校园导航」截成「FJI」）→ home 按钮 `desktop-only`（与 logo 点击重复）+ site.name 短名（'FJNU 校园'/'FJNU Nav'）+ @640 ellipsis 兜底 + ghost-btn padding 再收 → 五按钮清爽一行、短名完整显示；② **私信空态竖排折行** → @640 会话列表 132px + msg-none nowrap；③ **洞察柱被挤出卡片**（文字 min-width:220 撑爆 + bars 无 shrink，只剩一根贴边）→ min-width:0 + flex-shrink:0；④ APK 标题「课表 App · 安卓版」折行 → nowrap+ellipsis；⑤ **hero-sub 与 Welcome 欢迎页 EN 夹生** → site 节补 motto/welcomeTip/heroBadges，Welcome.vue 全量 t() 化（对齐 QDU），EN DOM 断言欢迎页（FJNU Nav / Insight·Action·Sincerity·Reach / 2 Campuses）与首页无中文泄漏。**验证**：build/integrity 18 项/unit×4/E2E 11 项全绿。 |
| 2026-10-11 | v1.5.15 | **复盘修复（patch）**。① **首页 i18n 夹生修复**：Home.vue 模板 28 处硬编码中文排查——词包 home 节其实早已预置 tryLabel/quickApps/noResult/stats*/download* 等键但模板漏接，本次全部接线并补 16 新键（greeting×5/wikiSite/wikiDocs/matchLabel/campusesTitle/collapse/expand/about×5 标签），数据洞察长句用 lang 三元，**EN 模式首页从约 28 处夹生中文降到 0**（仅剩 SITE.* config 引用，与 QDU 口径一致）；② `unit-agent`「明天」期望公式周日 bug 修正（实现对、单测错）24/0；③ `gen_kb_nav` 应用语料逐行解析加固（重生成 byte 一致）；④ 复核 kb-nav 词条零错位、integrity 门禁已在 deploy.yml 实跑。**验证**：build/integrity 18 项/unit×4/本地网关 E2E 11 项（含 375 扫描）全绿。 |
| 2026-10-10 | v1.5.14 | **防复发门禁与工程体检（patch，与 QDU 1.6.13 同批）**。与 QDU 同套：integrity ⑤ kb-nav 新鲜度门禁（KB_NAV_OUT 临时重生成比对）+ ⑥ i18n zh/en 键对等双向硬门禁（FJNU 词包 92 键本就同构，零修补直接拦）；`community.mjs` 支持 `COMMUNITY_DATA`（persist 按实际路径建目录）+ 副本入 gitignore；snapshot cron 4 次/天→1 次/天；新增 `crosscheck-kbnav.mjs`/`sync-diff.mjs`；e2e-browser 11 号「375 全应用无横向溢出」；红线补 4 条纪律（gen_kb_nav/origin推送/COMMUNITY_DATA/py -3.13）。**验证**：build/integrity 17 项/unit×4/本地网关 E2E 全绿。 |
| 2026-10-10 | v1.5.13 | **应用排序调优（patch）**。应维护者要求：日程助手（orientationSchedule）、研究生服务（graduatePlan）置顶数组最前；其余 34 项按组内「老前新后」重排——学习：课程表/校历/课表导入/教室导航/番茄钟/校园动态/楼宇图鉴/数据洞察；新生：学号查询；健康：体测；服务：学校官网/智能助手/数据管家/技能市场/社区洞察/换校向导 → 冲奖六件套（jobs/compare/flywheel/transplant/profile/aboutagent）后置 → 贡献者墙殿后；生活：提醒中心/校园墙/私信/食堂/今天吃什么/生活费/贴吧；游戏：知识问答→速配→轮盘→领导测试。**实现**：仅调 `src/data/apps.js` 数组顺序（脚本化纯重排，新旧行集合比对 36/36 一致零内容改动）；首页「高频应用」平铺网格（`v-for apps`）与 Categories 组内顺序（filter 保序）同源生效；`appGroups` 组间顺序未动。**验证**：build/integrity/unit×4/audit 全绿。 |
| 2026-10-10 | v1.5.12 | **访问统计卡 i18n（patch，第四棒接力）**。`VisitStats.vue` 原为硬编码中文（独立访客/累计访问/本站累计·Vercount 统计/不蒜子实时/首页浏览/站点浏览/站点访客/加载中/暂不可用），本次全部 t() 化并引入 `useI18n`；zh/en 词包同构新增 `visitStats` 节 9 键（uv/pv/note/bszTag/bszHome/bszSitePv/bszSiteUv/bszLoading/bszFail，参照 QDU `visitStats.bsz*` 键模式）；**验证**：npm build 通过、unit grow/wall/im/agent 全过、e2e-integrity 全过；**回补**：Contributors 版本历史补 v1.5.11 缺行（第二棒 busuanzi 批次漏挂）。背景：接力任务文档 §0 三-3，与另一台设备工作对齐。 |
| 2026-10-10 | v1.5.11 | **不蒜子第三方实时统计三指标（patch）**。访问统计卡 `VisitStats.vue` 在 Vercount 行下新增 busuanzi.ibruce.info 实时行（首页浏览/站点浏览/站点访客），i18n 形态与组件现状一致（硬编码中文，该组件尚未接 i18n）。实现收敛为共享模块 `src/utils/busuanzi.js`：**串行队列**防路由快速切换竞态 + **常驻隐藏 span** 不随组件卸载丢失 + 注入前清空 span 防旧值误判 + **ensureHost 逐个补齐**（本站 Vercount 会自建 site_pv/site_uv 两个 span，整体判断会漏建 page_pv 致卡 loading，此坑在 QDU 侧实测踩出）。`router.parseHash` 每次导航注入一次 JSONP（site_pv +1），组件只读共享状态。**基线说明**：任务最初基于 v1.2.22 实现，推送时远端已推进至 v1.5.10（另线 i18n/E2E 工作），已重基线到 v1.5.10 重新移植功能，版本号跟随远端序列 bump 至 1.5.11（旧提交留档分支 backup-v1223-busuanzi）。**验证**：npm build 通过；CDP（Chrome 151）冒烟 **ALL PASS**——首页三指标回填、路由切换 site_pv 实测递增、返回首页 host 仍在且数据更新、375 首页/应用页无横向溢出、零业务 JS 错误。**注意**：`site_pv/site_uv` 为 `iceoftea.github.io` 域名级口径；hash 路由下 Referer 不含 `#hash`，各页共享站点根 `page_pv` 计数，前端按前端路由 path 缓存展示。 |
| 2026-10-09 | v1.5.10 | **i18n/E2E/收尾校本同步（patch）**。FJNU 注册表 EN 字段/网格/分类/底部导航跟进/门禁检查；E2E 脚本+workflow；树形视图切换/多草稿箱UI/RichEditor 进私信。验证：build/e2e-integrity/unit×5/E2E 10/10 全绿。 |
| 2026-10-09 | v1.5.9 | **高级感与新工作流校本同步（patch）**。富文本/TTS/ICS/记忆/曲线/自检/高级检索 + 8 工作流移植。 |
| 2026-10-09 | v1.5.8 | **代码治理校本同步（patch）**。草稿统一/统一出口/脚手架统一/审计0/0。 |
| 2026-10-09 | v1.5.7 | **管理入口收敛校本同步（patch）**。先验后开 + 去管理字样 + 工单解析加固。 |
| 2026-10-09 | v1.5.6 | **入口修复校本同步（patch）**。暗门改 adminUrl。 |
| 2026-10-09 | v1.5.5 | **公有云开箱共享校本同步（patch）**。缺省配置 + 并集/降级 + 单测同步。 |
| 2026-10-09 | v1.5.4 | **体验与门禁校本同步（patch）**。技能看板/详情抽屉/门禁CI/postbuild 全同步。 |
| 2026-10-08 | v1.5.3 | **管理端线上可用校本同步（patch）**。云端直连移植 + 双垫片进包验证。 |
| 2026-10-08 | v1.5.2 | **白屏热修（patch）**。根因定位（真机复现）：App.vue 模板 `navLabel(a)` 未在 setup 定义（660c40b i18n 重构遗留，早于本轮），Vue 根挂载抛错整站空白；补 `lang/toggleLang/navLabel` + main.js 全局 errorHandler 报错盒；Playwright 真机验证主界面/Jobs/Assistant问候/Wall/Flywheel。 |
| 2026-10-08 | v1.5.1 | **智能体交互升级校本同步（patch）**：converse/engine/AgentChat 同批移植 + /admin 垫片。验证：grow 44 项/build 全绿。 |
| 2026-10-08 | **v1.5.0** | **【大版本·冲奖六件套校本同步】**三新工作流移植 + 画像/aiMod/jobs/activities/五视图/playbooks/单测 34 项同步 + 意图 8 新增 + 路由行为记录。验证：build/单测 148 项/scenes 全绿。 |
| 2026-10-08 | **v1.4.0** | **【大版本·在线化（与 QDU 1.5.0 同批校本同步）】**14 文件同步（墙检索/治理/通知/草稿/洞察/评论树/编辑器/IM双件/学习计划/私信页/番茄钟/数据管家/E2E场景包）+懒加载登记；API基地址五源+SSE退避；网关SSE路由补齐+默认端口8788修正；deploy补configure-pages。验证：build/单测105/scenes10/10。 |
| 2026-10-08 | v1.3.1 | **技能市场与信任体系（patch，与 QDU 1.4.1 同批）**：SkillMarket/Level+Badges/CourseImporter/AboutAgent 四视图 + 草稿引用历史摘要聚类六项增强，双站同步、校本保留。验证：build 通过。 |
| 2026-10-08 | **v1.3.0** | **【大版本·公告发布】"对话式智能体 × 超级论坛"（校本版）**——汇总 v1.2.23–v1.2.26：①师大智答 27 条工作流 + BM25 校本知识层；②校园墙 12 分区 5 帖型超级论坛；③隐秘管理台与云脑配置；④一键换校（含智能体大脑）+ bat 启动器 + 网站工坊。对外公告见 public/data/announcements.json。 |
| 2026-10-08 | v1.2.27 | **换校 bat 启动器 + 网站工坊**：「换校工具.bat」数字菜单一键启动；换校向导升级文案表单/样式实时生效/生成 site.js 源码/智能体联动播报。 |
| 2026-10-08 | v1.2.26 | **BM25 校本知识层 + 文档体系**：kb-nav.json（由 faq/workflows/apps 真实语料重建）+ navAnswer 五级识别链；文档：架构/部署白皮书 · CHANGELOG · agent 总纲与 27 剧本。 |
| 2026-10-08 | v1.2.25 | **超级论坛 + 三新应用同步（从 QDU-Nav-agent 合并，保留 FJNU 校本适配）**。①`src/wall/` 模块化论坛全量同步（12 分区/5 帖型/悬赏采纳/楼中楼/表情/投票/签到积分/俏皮话广告位/API_CONTRACT 后端预留）；②新增 ReminderCenter/CommunityInsights/RebrandPreview 三应用（router 懒加载登记 + apps 注册）；③Agent 27 工作流 + FAQ 校本版保留 + intents 重新校本补丁（师大吧/迎新/研究生 + 三新应用直达）；④暗门三入口 + Logo 三连点；⑤`scripts/smoke-community.mjs`（默认端口 8788）+ `src/agent/README.md` 总纲 + `playbooks/` 27 剧本同步。验证：`npm run build` 通过；server 8788 实跑正常。 |
| 2026-10-07 | v1.2.24 | **智能体 v2 + 社区安全治理同步（从 QDU-Nav-agent 合并，保留 FJNU 校本适配）**。①合并 v2 核心：三模式（⚡直达/📋计划/💬问答+计划确认卡）、耗时计时、⏹停止、步骤折叠、消息操作、`/` 命令面板、会话历史；workflows.js/engine.js/slots.js 整体同步（17 条工作流）；②intents.js 同步后重新校本适配：师大吧/迎新日程/研究生培养 patterns、siteStats→contributors 兜底；③新增 `views/CampusWall.vue` 校园墙 + apps/router（懒加载 `campusWall: () => import(...)`）登记；④社区治理：`server/community.mjs` + `server/admin.html` + `/admin` 路由（独立数据目录）。**保留 FJNU 校本版** `agent/faq.js`（8 条流程型问答）与 `agent/config.js`（师大智答）。验证：`npm run build` 通过（25.7s）；server 以 8788 端口实跑 health/wall/敏感词接口正常。 |
| 2026-10-07 | v1.2.23 | **对话式智能体落地（从 QDU-Nav-agent 移植并校本适配，挑战杯专家意见专项）**。①`src/agent/` 全套移植：40+ 意图三层识别、13 条真实工作流（真实调 API + 快照兜底）、多轮澄清与写操作确认状态机；**校本适配**：`config.js` 品牌换为「师大智答/师大」，`faq.js` 重写为 8 条流程型问答（转专业/校园卡/医保/校园网/选课/成绩/奖助学金/VPN，全部标注"以当年通知为准"，删除一切未经核实的校本数字），`intents.js` 贴吧/迎新等 patterns 对齐 FJNU（新增 orientationSchedule 直达，siteStats 兜底改为 contributors）。②`components/agent/`（ChatDock/AgentChat）+ `views/Assistant.vue` 全屏页移植，`apps.js`（首位登记 assistant）+ `router.js`（懒加载 `assistant: () => import(...)` + NAV_APPS 首位🤖）双登记；`App.vue` 顶栏🤖按钮 + 根层挂 ChatDock；`Home.vue` 对话入口（无 i18n 版本，独立 hero-chips）。③`server/comments.mjs` 评论服务 + `index.mjs` 挂接（含 type/paraIndex/quote 透传）。④一键换校：`customize.py`/`customize_tui.py` + `templates/{pku,qdu,fjnu}.json`，含 agent 大脑与 index.html 标题落点。验证：`npm run build` 构建通过（33s，懒加载分包正常）。 |
| 2026-09-14 | v1.2.22 | **课表节假日调休系统**。①`classSchedule.js` 新增 `HOLIDAY_MAP` 数据：2026中秋（9/25-27 停课3天）+ 国庆（10/1-7 停课7天）法定假日，调休补课日（9/20 补周二10/6课程、10/10 补周三10/7课程）；②新增 `getDateHolidayInfo()` / `getScheduleWeekday()` 工具函数：根据日期自动返回课表映射周几（假日→null停课、调休→指定周几）；③`ClassSchedule.vue` 修改 `getCourse()` / `isCellMerged()` / `todayCourses`：调休日按映射周几查课、假日返回空；④表头 `<th>` 动态添加 `.is-holiday` / `.is-makeup` CSS 类：假日红渐变背景 + 🎉停课卡片、调休琥珀渐变背景 + 📅补课标签；⑤假日列 `<td rowspan=12>` 居中显示「🎉 国庆节 / 假期停课」条纹背景；⑥调休列单元格琥珀渐变背景 + 右上角「📅 补」角标。验证：Python 单测 17/17 全绿、`npm run build` 通过。 |
| 2026-09-08 | v1.2.18 | **生活费计数器全方位优化：跨平台重复检测 + 专业版搜索 + 全部明细时间线**。①新增「跨平台重复支出检测」：自动识别微信/支付宝支付 vs 银行卡同一笔支出（同天同金额，一条来自微信/支付宝关键词，一条来自银行关键词），可视化展示并支持一键删除银行侧重复记录，防止导入多平台账单时虚增支出；②基础版+专业版均新增「📋 全部明细」时间线视图：跨所有年份按日期分组展示全部账单，每组显示日期/笔数/当日净收支，支持全文搜索（备注/商户/分类/金额），点击编辑自动跳回月度视图；③专业版新增搜索框：收支明细区域支持实时关键词过滤；④专业版KPI新增「全部记录」计数；⑤基础版+专业版明细记录行均显示精确时间戳（有time字段时）；⑥数据清洗面板改为双按钮布局（倒钱检测+跨平台重复检测）；⑦版本号升至v1.2.18。验证：`npm run build`通过。 |
| 2026-09-08 | v1.2.17 | **生活费计数器增强：多格式账单导入 + 搜索 + 倒钱检测**。①新增中国银行PDF账单导入支持（pdfjs-dist解析，自动提取记账日期/时间/金额/交易对方，跳过跨行转账等内部中转）；②账单导入扩展为四种格式：微信CSV/xlsx、支付宝CSV、建设银行xls、中国银行PDF，文件选择器同步更新accept属性；③收支明细新增搜索框：支持按备注、商户名、分类、金额关键词实时过滤；④新增「一键清理倒钱记录」功能：检测同一天或相邻日期内金额相同但收支方向相反的交易对（如微信转出→支付宝收入），可视化展示并支持批量删除；⑤时间精度优化：银行账单无精确时间时默认00:00:00，微信/支付宝有精确时间则保留到秒，明细列表有time字段时显示完整时间戳；⑥版本号升至v1.2.17。验证：`npm run build`通过。 |
| 2026-09-08 | v1.2.16 | **深链接新手引导修复 + 手机端顶栏瘦身**。①修复通过深链接（如 #/app/orientationSchedule）直接进入页面时不触发新手引导的bug：checkAndTriggerTour() 不再限制仅首页触发，而是对当前页面统一检测并触发；②手机端顶栏「🏠 首页」按钮隐藏「首页」文字，仅保留🏠图标，避免遮挡左侧品牌名称。验证：`npm run build` 通过。 |
| 2026-09-07 | v1.2.15 | **研究生服务链接修复 + 新手引导持久化**。①新增知网CARSI校外访问快捷链接（fsso.cnki.net）至核心系统区域，校外访问知网不再依赖VPN；②新增知网CARSI校外访问攻略入口卡片，位于核心系统区域下方，点击可跳转图书馆图文教程（含手机端/漫游账号/常见问题解答）；③修复研究生招生链接为正确URL（yjsy.fjnu.edu.cn/4223/list.htm），原 zs/list.htm 已失效；④修复培养方案查询链接为正确URL（yjsy.fjnu.edu.cn/pyfa/list.htm），原 pygl/list.htm 已失效；⑤移除无效的学位论文管理和研究生会链接（均返回"访问地址无效"错误）；⑥修复新手引导每次打开都弹出的bug：skipTour() 现在也会标记为已完成，用户关闭/跳过引导后不再自动弹出，仅首次访问时触发。验证：`npm run build` 通过。 |
| 2026-09-07 | v1.2.14 | **全站新手引导系统**。①新增 TourOverlay.vue 引导覆盖层组件：fixed 定位确保弹窗始终在视口内可见、SVG 镂空遮罩高亮目标区域、脉冲边框动画、自动方向检测（优先指定方向→智能切换→兜底居中）、手机端响应式适配；②新增 useTour.js 状态管理：步骤控制、localStorage 记忆（版本化防重复触发）、键盘快捷键（ESC关闭/←→切换/Enter下一步）；③新增 tourSteps.js 引导步骤定义：20个页面全覆盖，首页4步（搜索→应用→导航→❓按钮）、研究生服务5步（8模块→网站→奖学金→学分→指南）、日程助手6步（倒计时→今日→进度→专业筛选→分类→活动卡片）、生活费4步（模式→类别→金额→统计），其他页面2-3步直击核心；④App.vue 集成：欢迎页完成后才触发引导、切换页面自动检测是否需要引导、顶栏❓按钮随时重新查看；⑤交互优化：移除淡出动画改为直接切换、滚动时实时重新计算位置、点击遮罩空白区可关闭。验证：`npm run build` 通过。 |
| 2026-09-06 | v1.2.13 | **新增日程助手应用**。①orientationSchedule.js 版本化日程数据：21场入学教育事件，每事件含 category/importance/preparation/tip 等智能元数据；②OrientationSchedule.vue 时间轴界面：顶部「下一个活动」倒计时提醒卡片（自动检测最近未开始活动）、完成进度条、分类筛选 chips（报到/典礼/讲座/专业/安全/选举/健康）、搜索框、按日期分组手风琴、事件卡片显示时间/地点/主讲/分类/状态；③点击事件弹出详情弹窗：完整信息 + 💡智能提示 + ✅准备清单（checkbox 样式）；④版本化历史日程：SCHEDULE_VERSIONS 数组支持多版本，UI 顶部分 selector 切换旧版日程，localStorage 记忆用户选择；⑤数据模块化：groupByDate/eventStatus/nextEvent/timeUntil 工具函数独立导出，新增日程只需追加 events 数组。验证：Python 单测 17/17 全绿、`npm run build` 通过。 |
| 2026-09-06 | v1.2.12 | **全站跨应用联动体系**。①课程表→教室导航/食堂：课程详情弹窗加「🧭教室导航」「🍚去哪吃」按钮，传入教室名自动搜索；②食堂→记账：每道菜旁💰按钮一键跳转Budget记餐费（自动填充类别+金额+菜名）；③吃什么→食堂/记账：菜品详情弹窗加「📍查看空座」「💰记一笔」；④美食轮盘→食堂：抽中餐厅后加「📍查看空座」；⑤数据洞察→教室导航：热门教室可直接跳转查看占用；⑥教学楼速配→教室导航：配对成功后加「去教室导航看看这些楼」；⑦贴吧→应用推荐：话题分布改为可点击行，点击自动跳转对应应用（考研→研究生服务·学习→课程表·生活→食堂·就业→官网·事务→动态）；⑧体测→饮食推荐：BMI计算后加「根据BMI获取健康饮食推荐」跳转WhatToEat；⑨奖学金→记账：奖学金页加「记一笔奖学金」跳转Budget；⑩学号→邮箱助手：StudentId加学号输入+跳转OfficialSites邮箱助手；⑪navContext共享状态：新增跨应用上下文传递store，应用A设置参数后跳转应用B自动消费。验证：Python单测17/17全绿、`npm run build`通过。 |
| 2026-09-06 | v1.2.11 | **研究生服务学科竞赛清单 + 联动综测积累选档**。①新增「学科竞赛」tab（GraduatePlan.vue），按 A/B类重点/B类一般三档手风琴展示 33 项竞赛清单（名称、主办方、综测分参考）；②新增学院奖学金标准表格（A类：国一3万~四等0.8万；B类重点：国一5000~省三600），含第二/第三单位20%、个人赛1/3、就高不重复、年封顶20万等规则提示；③「快速加分」按钮一键跳转综测积累 tab 科研创新选档区；④scholarship.js 新增 highlightGroup 状态 + ScorePicker 监听自动展开 contestA/contestB 手风琴，实现竞赛清单→选档的无缝联动；⑤competitions.js 独立数据文件，33项竞赛按政策文件逐条录入。验证：`npm run build` 通过、无新增 lint 警告。 |
| 2026-08-25 | v1.2.10 | **校历轮播方向修正 + 切换动画丝滑化**（仅动校历页，其余功能未触碰）。①滑动方向反转：全屏模态 track 改 `flex-direction: row-reverse`（旧学期排左、新学期排右，符合时间线直觉），位移公式改为 `translateX(+termIdx*100%)`，手势映射翻转为「右滑翻更旧 / 左滑翻更新」，跟手方向与松手落点一致；②修复阻尼条件未随排列翻转的 bug（最新学期最右应防左拖越界、最旧学期最左应防右拖越界），并新增 `dragRawDx` 以原始未阻尼位移判定翻页意图，杜绝边界阻尼拖动的衰减位移越过 ±60 阈值误触翻页；③非模态工具栏 ←/→ 按钮从「弹一下换图」升级为方向性平滑过渡（Vue Transition + key，旧图从左入/新图从右入，与模态 track 观感一致），切换不再触发 skeleton 闪烁；下拉选择器按目标位置自动推断方向。验证：Python 单测 17/17 全绿、`npm run build` 通过、CDP 冒烟 22/22 全绿（方向映射/两处边界阻尼回弹/按钮与键盘语义/过渡动画断言）。 |
| 2026-08-22 | v1.2.9 | **学术工具箱扩充 + 就业信息直达**（面向研究生痛点的小步优化）。①GraduatePlan 学术工具从 10 个扩至 17 个并按类别分组展示：新增「期刊与会议」组（LetPub 影响因子/审稿周期、中科院分区表、CCF 推荐目录、小木虫投稿经验）与「文献检索」增强组（Semantic Scholar、Connected Papers 文献关系图、arXiv 预印本），原「翻译工具/学术搜索」类目归并为「写作工具/文献检索」；②研究生服务常用网站与学校官网页各加「就业指导中心」直达（career.fjnu.edu.cn，招聘会/宣讲会/选调生）；③搜索索引同步：搜「期刊」「影响因子」「CCF」「查重」「就业」等可直达研究生服务/学校官网；④工具卡底部加 VPN 提示行。深色模式、通知聚合过滤等建议项此前版本已实现，无需重复开发；需后端与身份验证的功能（问答 Bot/评价墙/拼团板）按红线跳过。验证：`npm run build` 通过、Python 单测全绿。 |
| 2026-08-22 | v1.2.8 | **校园动态学院栏目 + 搜索过滤**。①新增计网学院官网动态爬取链路：`crawler/fetch_cse.py`（解析 ccs.fjnu.edu.cn/tzgg 的 news-slick 结构，合并模式写入快照 `cseNews` 字段，CI 失败时继承旧值不阻塞）、server `/api/cseNews` 实时路由（`parseCseList` 独立函数 + list2 页兜底）、前端 `staticCseNews` 静态回退（localCourse.js / api index.js 各登记一处）；②CampusNews.vue 重构为三 tab（教务通知/工作动态/学院动态），学院动态点击直达原文，全栏目共用关键词过滤框；③`/api/notice` 放宽支持 ccs 域名详情（host 参数，正则放行路径点号）；④研究生服务「常用网站」加计网学院通知直达链接；⑤按用户要求本次不发公告（仅特别重要的版本更新才发公告）。模块化检查：新逻辑均为独立模块/函数（fetch_cse.py、parseCseList、staticCseNews），遵循既有「实时优先+快照回退」架构。验证：构建通过、Python 单测 OK、Playwright 冒烟 11/11 全绿（网关 20 条真实学院动态/tab 切换/两栏过滤/空态/教务详情回归）。 |
| 2026-08-22 | v1.2.7 | **教室大全导航指引**。①新增 `src/data/buildingGuides.js` 楼宇指引生成器：86 栋楼按特征归类（公共教学区四楼 / 人文理工组团 / 外语·计网·音美学院楼 / 数字开头实验楼群 / 体育场馆 / 仓山校区），展开楼栋即显示「所属区域 + 楼宇介绍 + 三步找教室路线」指引卡；②每卡附高德地图定位外链（query=校区+楼名），有详细数据的楼栋保留「楼宇详细指引 ›」联动原版列表；③内容只陈述可靠通用信息（命名规律/校区/找教室思路），不编造门牌细节；④公告与版本历史同步至 v1.2.7。验证：构建通过、Playwright 冒烟 18/18 全绿（指引卡渲染/地图按钮/联动断言）。 |
| 2026-08-22 | v1.2.6++ | **轮播重构 + 教室大全分页分组**。①校历全屏模态重写为 NFS 式 track 轮播：5 个学期排成一条轨道 translateX 百分比位移 + cubic-bezier 缓动，拖动实时跟手、松手丝滑滑入相邻学期（替换原先「抖动跳转」式切换），非活跃 slide 半透明缩小形成景深；首尾拖动边界阻尼 0.35 回弹；修复拖动后合成 click 误触遮罩关闭的 bug（capture 阶段吞 click）；放大态独立 zoom 层支持平移且滚轮不缩放。②教室大全重构为「楼栋手风琴 + 分页」：700 间教室按楼名前缀自动归组为 86 栋，每页 8 栋 ‹›翻页 + 页码输入跳转，点击楼栋展开才显示门牌号双列网格；「查看楼宇指引与地图定位」与下方原版楼宇列表联动（自动展开对应楼宇卡并平滑滚动定位，无指引时提示）；修复搜索/切类时页码未重置导致空列表的 bug。③探测确认 NFS 无教室占用 API（其教室导航仅路线规划），占用查询继续使用本项目教务处课程总表真实链路。验证：Playwright 冒烟 17/17 全绿（track 跟手/松手换页/边界禁用/分页跳转/楼栋展开/联动滚动断言）。 |
| 2026-08-22 | v1.2.6+ | **预览交互打磨 + 品牌统一**。①校历全屏模态：新增左右切换按钮与键盘方向键翻页、1:1 下左右拖动直接换页、滑动动画（拖出→换图→对侧滑入），放大态仍可平移细节，滚轮不绑定缩放；②教室大全重排：修复「全部」被 slice(60) 截断导致与其他分类总数不符的 bug，分类 chips 显示实时计数，紧凑双列网格 + 彩色类型角标（实验室绿 / 场馆橙）+ 每页 48 条「加载更多」；③公告恢复：找回 v1.0.0「部署逻辑与安全说明」并永久置顶，补齐 v1.2.4/v1.2.5 版本公告（共 5 条）；④品牌统一：「福师大」全部更名「福star」（29 个文件 53 处）。验证：Playwright 冒烟 14/14 全绿（含模态翻页/拖动换页/chips 计数/加载更多/角标归类断言）。 |
| 2026-08-22 | v1.2.6 | **校历预览 + 搜索索引 + 教室大全**。①校历页新增「图片预览」模式（参考 NextFStar schoolCalendar）：5 个学期原图（来源 NFS 静态资源，标注教务处原文链接），学期切换工具栏、按日期默认选中当前学期、点击全屏预览模态（缩放/拖动/ESC），原有「官方链接跳转」模式完整保留；②首页搜索升级为三层索引（`searchIndex.js`）：标题3 / 别名关键词2.5 / 简介1.5 / 功能点1 加权评分，支持多词组合检索与命中标签展示，搜「奖学金」「记账」等直达应用内能力；③教室导航新增「全校教室大全」：抓取 NFS `classroomNavigation/public/bootstrap` 接口 700 间教室（`crawler/gen_nfs_classrooms.py` → `nfsClassrooms.js`），分类过滤（实验室/体育场馆等）+ 关键词检索，点击直查一周占用；修复从大全进入占用视图时 `emptyResult` 为空导致页面崩溃的 bug（占用卡上移至视图公共层）；④公告更新至 v1.2.6。验证：Python 单测全绿、apps/router 双登记一致（18/18）、构建通过、Playwright 冒烟 18/18 全绿。 |
| 2026-08-21 | v1.2.5 | **综测积累模块 + 测算联动体系**。①新增「综测积累」tab（`ZcAccumulator.vue`）：按官方计分办法把综质分拆为 8 大类手风琴快速选档（社工职务/荣誉称号/嘉奖通报/集体荣誉/志愿公益/体育美育/劳育宿舍/扣分项），点击累加、再点取消，localStorage 持久化；②智能检测：同岗位就高取最高（不计项明示）、分类上限自动封顶（学术交流≤4、文体名次≤10、献血≤2 等）、扣分负分累计、总分超满分按「个人÷最高×满分」换算提示；③课程加权平均测算器（`CourseCalculator.vue` + `courseCredits.js`）：按附件2 计分课程目录预设 6 个专业（网安学博/计算机学硕/网安学硕/软工专硕/网安信安专硕/AI 专硕）必修课与学分，逐门输入成绩实时折算加权平均并汇入总分；④科研快速选档：论文/专利/项目/学术交流/A/B 类竞赛按钮化累加，A 类竞赛成员系数（×0.9~×0.6）自动折算；⑤共享状态层 `src/stores/scholarship.js`：身份/课程/科研/综测四处联动，总分卡 sticky 实时显示三项构成与封顶警告；⑥布局重组：测算器+选档+计分速查迁入综测积累页，奖学金页保留标准比例/门槛/申请要点并加跳转入口卡。验证：Python 单测全绿、构建通过、Playwright 冒烟 12/12 + 15/15 全绿（就高/封顶/扣分/持久化/加权平均 82.86 案例断言）。 |
| 2026-08-21 | v1.2.4 | **奖学金页重写 + 数据链路修复**。①奖学金 tab 按《计算机与网络空间安全学院研究生学业奖学金评审细则（修订）》全面重写：修正奖励比例谬误（博士 10%/10%/20%，硕士新生按统考生 5%/10%/20%、推免生单列直评一等，硕士高年级按全日制硕士生 10%/10%/20%），补齐硕二课程排名门槛（一等前30%/二等前50%或前2名/三等前70%）与硕三开题+中期考核门槛、A/B 类竞赛计分与成员系数、科研分满分换算规则、不参评红线清单；②新增「科研分测算器」：选身份 → 输入课程/科研/综质原始分，实时换算综合成绩总分并提示等级门槛；③修复快照 schema 脱节 bug：`nfs_courses.py` 曾整份覆盖 `snapshot.json` 导致通知/动态/校历丢失、rows 缺 `term`（静态托管下校园动态/校历回退失效），现改为合并模式；`build_snapshot.py` 课程总表缺失时继承上一份快照课程数据（防 CI 冲掉 NextFStar 排课），`validate.py` 放行可信来源 `nfs.pcdawn.cn`；④`Budget.vue` 奖学金预设金额修正为最新标准；⑤贡献者墙版本历史精简。验证：Python 单测 17/17 全绿、`crawler/validate.py` 通过（notices 29 / news 14 / calendar 14 / rows 1659）、`npm run build` 构建通过。 |
| 2026-08-20 | v1.0.0 | **首版发布**。从 QDU-Nav 模板一比一移植 17 个应用；品牌焕新为 FJNU-Nav（闽都红主题）；数据全面替换为福建师大（学院官网 / 校史 / 题库 / 教室导航 / 贴吧舆情）；食堂空座率接入福Star 实时 + 快照双模式；爬虫链路适配教务处 Sudy 系统；移除本站舆情与访问统计。验证：单测全绿、构建通过、本地网关冒烟通过。 |