# Changelog · FJNU-Nav-agent

> 逐条工程日志见 AGENTS.md 更新日志；本文件为版本摘要。

## v1.7.1 (2026-10-15) · 备份恢复 + 真机冒烟 + 部署门禁（minor，承接 v1.7.0）
- 💾 **新增「备份与恢复」**（`src/utils/budgetBackup.js` + 计数器页新面板）。动机：记账数据只存本机 localStorage，页面自己都写着「清缓存会丢失」。现在可一键导出 JSON（含日期/类型/分类/金额/备注/商户，**不含任何账号或身份信息**），换设备或清缓存后导入恢复；导入支持**追加去重**与**整体替换**两种模式；外部 JSON 逐条规范化并丢弃非法项，不因一条脏数据整包失败；兼容「完整备份 / 裸数组 / 旧版 data」三种形态。
- 🧪 **新增真机冒烟 `scripts/e2e-budget.mjs`（12 项）**：自带零依赖静态服务器托管 `dist/`，预置记账样本后断言稳健月均/置信度/当月外推/三口径并列/加权占比/预测/订阅体检/一键配平/抄进分配器/零 JS 错误；支持 `E2E_DIST`+`E2E_APP` 跨仓冒烟。
- 🛡 **部署门禁加厚**：`deploy.yml` 在 integrity 之后新增 6 个前端单测门禁；`e2e.yml` 追跑 `e2e-budget.mjs`。
- 🔧 **引擎边界加固**：金额统一按**绝对值**聚合（方向由 `type` 表达），修掉负号金额静默抵消支出的隐患。
- 🧪 单测扩容：`test_budgetengine.mjs` 22→31 项，新增 `test_budgetbackup.mjs` 10 项。
- ✅ 验证：`npm run build` 通过；`e2e-integrity` 18/18；unit×4 175 全过；`audit-refs` 0/0；三个新/扩单测全绿；**真机冒烟 12/12**（复用本机 ms-playwright 既有 chromium，未下载）。

## v1.7.0 (2026-10-15) · 生活费预算引擎（minor，与 QDU 1.7.0 同算法）
- 🧮 新增 `src/utils/budgetEngine.js`，与 QDU-Nav **字节级一致**（纯函数 · 零依赖 · 可 Node 单测）：稳健月均（Tukey 离群剔除 + 截尾均值 / 中位数降级）、**剔除进行中的当月并做跑量外推**、**加权分类占比**、样本置信度分级、趋势预测（线性回归 vs Holt 平滑按 MAPE 择优）、固定扣费体检、占比自动配平、剩余生活费日预算节奏。
- 📈 校准页由「近 3 个月简单算术平均」升级为稳健口径：新增置信度徽标与原因提示、当月外推（含建议日限额）、下月支出预测、订阅体检三个面板；参考区间与「按习惯粗估」改为同源模型。
- ⚖️ 分配器新增一键配平（最大余额法，尊重各项上下限）；估算器改为「基准 + 增量」模型（福州物价系数 1.04）。
- 🧾 `billImport.js` 与 QDU 同源升级：独立收入词表、微信交易类型映射、统一内部转账识别、金额/日期解析加固、xlsx 多工作表定位、`recordFingerprint()` 去重指纹、银行通用流水（单列 / 借贷双列）。**修掉旧版中行 PDF 分支里硬编码的真实人名判定**（改为通用的"用户/个人/本人"泛化判定，避免把个人信息写进仓库）。
- 🧪 单测：`scripts/test_budgetengine.mjs` 22 项 + `scripts/test_billimport.mjs` 8 项。
- ✅ 验证：`npm run build` 通过（Budget 分包 120→142KB / gzip 51KB）；`e2e-integrity` 18/18；`unit-grow/agent/wall/im` 51+24+47+53 全过；`audit-refs` 0/0；两个新单测全绿。

## v1.5.20 (2026-10-12) · GitHub 评论巡检同源（patch，与 QDU 1.6.18 同步）
- 🔍 `community.mjs` 同步：`/api/admin/gh-comments` 敏感词事后巡检（字节级与 QDU 一致）
- 🏅 （10-12 追加）`/api/comments/gh-count` 全网评论计数端点同步（与 QDU 1.6.19 对应，供 Wiki 徽章显示 GitHub 评论数）
- 🧹 （10-12 精简，与 QDU 1.6.20 对应）gh-count 端点**删除**——徽章统一前端直连 GitHub，网关分支为死路径（两仓 community.mjs 保持字节级同源）

## v1.5.18 (2026-10-11) · 评论网关同源加固（patch，与 QDU 1.6.17 同步）
- 🛡 `community.mjs` 同步：admin 删除评论多级子孙收敛（字节级与 QDU 一致）

## v1.5.17 (2026-10-11) · 评论网关同源增强（patch，与 QDU 1.6.16 同步）
- 🗑 `community.mjs` 与 QDU 字节级同步：delete owner 鉴权（连子级）+ POST 收 owner + GET/queue 防盗删过滤
- 🔧 目的：保持两仓 server 同源可 diff（sync-diff 干净），Wiki 评论增强跨校可用

## v1.5.16 (2026-10-11) · 视觉走查（patch）
- 📸 真机截图肉眼走查：顶栏「FJI…」截断修复（home 按钮桌面专属 + site.name 短名 'FJNU 校园' + ellipsis + ghost-btn 收紧，五按钮清爽一行）；私信空态一行；洞察柱 flex 防挤出；APK 标题一行
- 🌐 EN 夹生清零：hero-sub / Welcome 欢迎页（name/tagline/motto/badges/enter/tip）全量词包化——EN DOM 断言欢迎页与首页无中文泄漏
- ✅ 验证：build / integrity 18 项 / unit×4 / 本地网关 E2E 11 项全绿

## v1.5.15 (2026-10-11) · 复盘修复（patch）
- 🌐 首页 i18n 补全：问候语/试试 chips/Wiki 链接/APK 下载卡/高频应用副标/匹配前缀/空结果/浏览提示/校区统计卡/数据洞察区/两大校区/收起展开/关于本站 5 标签——词包 home 节补 16 键全部接线，**英文模式首页不再夹生中文**
- 🐛 unit-agent「明天→day」周日公式修正（实现正确、单测 bug）；gen_kb_nav 应用语料逐行解析加固（重生成 byte 一致）
- ✅ 验证：build / integrity 18 项 / unit×4（24/0）/ 本地网关 E2E 11 项全绿

## v1.5.14 (2026-10-10) · 防复发门禁与工程体检（patch，与 QDU 1.6.13 同批）
- 🚧 integrity 新增两道硬门禁：⑤ kb-nav 与 faq/workflows/apps 源同步；⑥ i18n zh/en 键对等双向同构（FJNU 词包本就同构，零修补直接硬拦）
- 🧪 网关支持 `COMMUNITY_DATA` 环境变量（测试写数据副本，已 gitignore）；snapshot 降频 4 次/天 → 1 次/天
- 🛠 新增 `crosscheck-kbnav.mjs` 与 `sync-diff.mjs`（QDU↔FJNU 漏同步盘点）；e2e-browser 新增「375 全应用无横向溢出」检查
- ✅ 验证：build / integrity（含新门禁）/ unit×4 / 本地网关 E2E 全绿

## v1.5.13 (2026-10-10) · 应用排序调优（patch）
- 📱 日程助手、研究生服务置顶（用户指定）；其余按组内「老前新后」重排（纯重排零内容改动，36 应用新旧行集合校验一致）
- 🎯 首页「高频应用」平铺网格与分类页组内顺序同源生效（均以 `apps` 数组顺序为准）

## v1.5.12 (2026-10-10) · 访问统计卡 i18n（patch，第四棒接力）
- 🌐 VisitStats.vue 接入 i18n：独立访客/累计访问/Vercount 注/不蒜子实时等硬编码中文全部 t() 化
- 📦 zh/en 词包同构新增 `visitStats` 节 9 键（参照 QDU `visitStats.bsz*` 键模式），英文模式不再出中文
- ✅ 验证：npm build / unit×4 / e2e-integrity 全绿；回补 Contributors 版本历史 v1.5.11 缺行

## v1.5.11 (2026-10-10) · 不蒜子第三方实时统计三指标（首页浏览/站点浏览/站点访客）（patch）
- ✨ 访问统计卡新增 busuanzi.ibruce.info 实时行（首页浏览 / 站点浏览 / 站点访客），与 Vercount 原统计并存
- 🛠 新增共享模块 `utils/busuanzi.js`：串行队列 JSONP（防路由快速切换竞态）+ 常驻隐藏 span（组件卸载不丢）+ 注入前清空防旧值 + ensureHost 逐个补齐（兼容 Vercount 自建的 site_pv/site_uv span）
- 🔁 `router.parseHash` 每次导航注入一次 → site_pv +1；hash 路由下 page_pv 按前端路由 path 缓存展示
- ✅ 验证：npm build 通过；CDP 冒烟 ALL PASS（三指标回填/导航 site_pv 递增/host 常驻/375 首页与应用页无溢出/零业务 JS 错误）

## v1.5.10 (2026-10-09) · i18n/E2E/收尾（patch，与 QDU 1.6.10 同批校本同步）
- 🌐 注册表英文字段 + 浏览器 E2E 脚本 + 树形回复视图切换 + 多草稿箱 UI + RichEditor 进私信

## v1.5.9 (2026-10-09) · 高级感与新工作流（patch，与 QDU 1.6.9 同批校本同步）
- ✨ 富文本/TTS/ICS/组合动作 + 8 新工作流（福州坐标+旗山仓山数据）

## v1.5.8 (2026-10-09) · 代码治理校本同步（patch，与 QDU 1.6.8 同批）
- 🗂️ 草稿统一 + 📦 统一出口 + 🧪 脚手架统一 + ✅ 审计 0/0

## v1.5.7 (2026-10-09) · 管理入口收敛（patch，与 QDU 1.6.7 同批校本同步）
- 🛰️ 暗门口令先验后开 + 🧹 用户面去管理字样 + 报修工单解析加固

## v1.5.6 (2026-10-09) · 入口修复（patch，与 QDU 1.6.6 同批校本同步）
- 🛰️ 管理端暗门改 `adminUrl()`，根除子路径跳域名根 404

## v1.5.5 (2026-10-09) · 公有云开箱共享（patch，与 QDU 1.6.5 同批校本同步）
- ☁️ 缺省配置 + 🧱 云网并集不断存量

## v1.5.4 (2026-10-09) · 体验与门禁（patch，与 QDU 1.6.4 同批校本同步）
- 📊 技能数据看板 + 🗂️ 帖子详情抽屉 + ✅ 完整性门禁进 CI + postbuild 固化 404

## v1.5.3 (2026-10-08) · 管理端线上可用（patch，与 QDU 1.6.3 同批校本同步）
- 🌐 `/admin` 跳转垫片 + ☁️ 管理台云端直连（看帖删帖）+ `/console` 垫片

## v1.5.2 (2026-10-08) · 🩹 白屏热修（patch 小版本）
- 🩹 根因：App.vue 模板调用未定义的 `navLabel`（i18n 重构遗留断头引用），根组件挂载抛错 → 整站空白；补齐 `lang/toggleLang/navLabel` + 全局渲染保险
- ✅ 真机验证：主界面/求职/智能体问候/校园墙/飞轮 5 视图全活

## v1.5.1 (2026-10-08) · 智能体交互升级（patch，与 QDU 1.6.1 同批校本同步）
- 💬 上下文追问 + 👋 主动问候 + ⌨️ 打字机回复 + 🏷️ 专属追问 chips
- 🔧 /admin 跳转垫片；✅ converse 10 项单测全绿

## v1.5.0 (2026-10-08) · 🎉 冲奖大版本（与 QDU 1.6.0 同批校本同步）
- 🤖 三新工作流 + 🧬 画像推送 + 💼 招聘板块 + ⚔️🔄🔁🧬 四应用 + 🛡️ AI 评论治理
- ✅ 增长单测 34 项，构建/全单测/场景包全绿

## v1.4.0 (2026-10-08) · 🎉 在线化大版本（与 QDU 1.5.0 同批校本同步）
- 🌐 API 基地址可配 + 🗄️ 数据管家 + 💬 私信 + 🍅 番茄钟 + 📡 SSE 退避
- 🧱 墙检索引擎/治理/通知/草稿/评论树/编辑器/洞察聚合/学习计划算法
- 🔧 网关 SSE 路由补齐 + 默认端口 8788 修正 + deploy 补 configure-pages
- ✅ 单测 105 项 + E2E 场景包 10/10，构建通过

## v1.3.1 (2026-10-08) — 技能市场与信任体系（patch 小版本）
- 🧩 技能市场 · 🏅 信任等级与徽章 · 📥 课表导入器 · 🤖 关于智能体页
- ✍️ 草稿保存 · 楼层引用 · 输入历史 · AI 帖子摘要 · 管理台反馈聚类

## v1.3.0 (2026-10-08) — 🎉 大版本「对话式智能体 × 超级论坛」（校本版）

> 汇总 v1.2.23–v1.2.27。站内公告已发布。

## v1.7.6 (2026-10-15) · APK 升级 + 课表页健壮性 + 两处真实缺陷修复（patch）
【APK 安卓优势功能】
① 静态 App Shortcuts（长按桌面图标直达）：新增 res/xml/shortcuts.xml，三项「今日 / 下一节课 / 课表」，
   走自定义 action com.feike.schedule.OPEN_VIEW + extra view；MainActivity 新增 extractView/consumePendingView，
   用 getBridge().getServerUrl() 把 WebView 定位到 index.html?view=xxx（trim-apk-assets 的垫片会保留 search 转发）。
② 新增 2x2「下一节课」小组件：res/layout/schedule_widget_next.xml + res/xml/schedule_widget_info_next.xml +
   ScheduleWidgetProviderNext.java，与既有 4x2 组件**共用同一份数据源**（notify.json → widgetSnapshot 三行快照），
   只是版式改为竖排、课程名与倒计时加粗，桌面一眼可读；点击任一位置打开应用。
③ 权限：新增 USE_EXACT_ALARM（Android 13+ 日历/闹钟类应用可直接使用精确闹钟，无需用户手动开开关），
   配合既有 SCHEDULE_EXACT_ALARM，课前提醒更可靠。
④ Web 层新增深链：standalone-schedule.html 增加 applyDeepLink()，支持 ?view=today|next|week 直接切到
   单日列表 / 下一节课卡片 / 周课表；非法参数静默忽略，绝不影响正常启动。
⑤ 版本链：apkVersion 1.2 → 1.3、versionCode 4 → 5、standalone APP_VERSION 同步（test_schedule 断言三方一致）。

【课表页健壮性】
- 三处 JSON.parse 加 try/catch（sche_pet 宠物状态、导入文件、Supabase 配置）：脏数据/被清空的存储不该让整页初始化失败。
- 新增 esc() 转义助手：远程 schedule-data.json 与用户自定义课程都算「不可信输入」，拼 innerHTML 前一律转义。

【两处真实缺陷修复】
- src/stores/scholarship.js：成员系数取值 MEMBER_FACTORS[factorIdxOf(gid)].f 在 state.factors 被历史版本/手工编辑
  污染成越界下标时会抛 TypeError，导致整个综测面板渲染失败；现统一回落「独立作者 ×1」，并新增 memberFactor() 收敛。
- scripts/build-apk.bat：gradle 失败后脚本仍打印 [OK]，维护者可能据此把旧 APK 当新包发出；现改为传播 errorlevel
  并以非零码退出 + 明确提示「JAVA_HOME 必须指向 JDK 17（AGP 8 要求）」。

【新增自动化验证】
- scripts/e2e-standalone.mjs（8 项，真机 Chromium）：独立课表页（APK 里真正跑的那个单文件）此前**零自动化验证**，
  现覆盖 初始化渲染 / 周课表单元格 / ?view=today 切单日 / ?view=week 回周表 / ?view=next 定位卡片 /
  非法深链静默回落 / localStorage 写脏仍能启动 / 全程零未捕获异常。
- scripts/test_schedule.mjs 已在 v1.7.5 接入 deploy 门禁；本次 e2e-standalone 接入每日 e2e 工作流。

验证：npm run build 通过；test_schedule 全绿（三方版本一致）；e2e-standalone 8/8；真实 APK 由 scripts/build-apk.bat 打包验证。


## v1.7.5 (2026-10-15) · 课表三端一致性回归测试（patch）
背景：课表有三份实现——src/data/classSchedule.js（网页数据源）、public/standalone-schedule.html（APK/移动端
单文件内置一份 HOLIDAY_MAP）、public/data/schedule-data.json（构建产物，供远程同步）。历史上真实出过一次事故：
改课表时 APK 内置的 HOLIDAY_MAP 漏同步（见 skills/fjnu-nav-maintainer/references/schedule-adjust.md），三端因此长期漂移，
而当时没有任何自动手段能发现。

新增 scripts/test_schedule.mjs（10 项），把「三端一致」与「调课语义」变成可自动回归的断言：
- 三端 HOLIDAY_MAP 键集合一致（源 / APK 内置 / 构建产物三方交叉）
- 三端条目内容逐条深度相等（含 type / scheduleWeekday / overrides 的 srcPeriods、destDate、destLocation）
- 版本单一事实来源链：package.json.apkVersion == APK 内置 APP_VERSION == 接口产物 appVersion
- 构建产物数量口径：课程数 / 专业数 / 节假日条目数与源一致，schema 与内容哈希 version 存在
- 语义：停课日无课；调休补课日映射到被补的那天（9/20→周二、10/10→周三）；调课源日节次被标记 moved、
  目标日能解析出调入；跨周调课 10/20→11/19 立诚1-105；课程节次不倒挂
- 用户自定义调课写独立键、删除可还原、且不污染站点调课集合（getSiteAdjustments 与 getAllAdjustments 分离）

**有效性验证**：故意把 APK 内置 2026-10-20 条目的 scheduleWeekday 由 2 改成 3（模拟漏同步）→ 测试立即失败并
指出是哪条不一致；还原后恢复全绿。这直接防住了历史事故的复发。

该测试为纯 JS、零依赖、毫秒级，已接入 deploy.yml 部署门禁（与其余前端单测同批）。


## v1.7.4 (2026-10-15) · 首屏性能优化：智能体大脑移出首屏 + 预载按网络状况收敛（patch）
用户反馈「好卡／首次缓冲太大」，实测定位到根因：App.vue 静态 import 了智能体悬浮舱，依赖链一路静态到
agent/engine.js → navAnswer.js → kb-nav.json（121KB）+ workflows.js（79KB）——也就是「打开首页就把整个智能体
知识库下载完」，移动端首屏因此很沉。修复：
- ChatDock 改为 defineAsyncComponent（异步组件）：它与其依赖（engine/workflows/navAnswer/kb-nav.json）全部
  落到按需 chunk，不再进首屏；首帧后在非弱网环境闲时预热，用户点开时已就绪。
- Home.vue 的「回车交给智能体」改为动态 import('../agent/intents.js')：识别链（FAQ + BM25）按需加载，
  未命中时仍走本地关键词过滤，行为不变。
- 新增 src/utils/netHint.js（isSlowConnection / whenIdle / afterPaint）：预载统一改为「弱网(2G/saveData)直接跳过
  + 空闲时执行」；router.js 的 preloadPopular 同时去掉 assistant（它已被悬浮舱的懒载链路覆盖）并加空闲调度。

实测收益（构建产物）：
- QDU-Nav 首屏入口 chunk 499KB → 272KB（-45%）
- FJNU-Nav 首屏入口 chunk 276KB → 76KB（-72%）
- kb-nav.json 与 workflows 独立成块（navAnswer-*.js 79KB / workflows-*.js 55KB），仅在真正使用智能体时下载

真机冒烟新增 2 项断言（12 → 18 项）：①在 DOMContentLoaded 时刻抓取资源清单，断言首屏未请求任何
智能体包（navAnswer/workflows/AgentChat/ChatDock）；②闲时预热后悬浮舱就绪、助手页输入框可渲染。


## v1.7.3 (2026-10-15) · 新增「我的快捷」跨应用收藏（patch）：首页常用入口 + 应用卡片收藏
痛点：站内 35+ 个应用，常用的其实只有三五项（课表 / 空教室 / 生活费 / 食堂），每次都要翻网格。
新增 src/utils/favorites.js（纯函数 · 零依赖 · 可单测）提供站点无关的收藏模型：makeFavoriteId 以 kind:target 生成稳定 id（同项不会收藏两条）、normalizeFavorite 逐条规范化脏数据、pruneFavorites 超 40 条时置顶项与最新项优先保留、toggleFavorite 幂等开关、moveFavorite 上/下移、setPinned 置顶、groupByKind 分组、exportFavorites/importFavorites 支持「完整对象 / 裸数组 / items」三形态、mergeFavorites 追加去重或整体替换；存储键由 createFavorites(key) 注入，同一份实现被多站复用，读写全部经 safeStorage 不抛异常。
首页新增「我的快捷」区块：空态给出引导文案，有收藏时按用户排好的顺序展示为胶囊（点击直达 · 📌 置顶 · ✕ 移除 · 一键清空），并提示「只存本机、换设备请用数据管家备份」。应用卡片右上角新增 ☆/★ 星标（用 span + role=button 实现，避免按钮嵌套导致的无效 HTML；带 aria-label 与键盘 Enter 支持）。
顺带修掉一个真实缺陷：新手引导遮罩挂在 App 层，用户在引导进行中切换页面时遮罩不会收起——锚点元素已随视图卸载，遮罩会残留在新页面上并吞掉用户的所有点击（表现为「切页后什么都点不动」）。现给 useTour 增加 cancelTour()（收起但不标记完成，用户回到该页仍能看到引导），并在路由变化时先收起进行中的引导。
真机冒烟扩容：scripts/e2e-budget.mjs 12 → 16 项，新增「首页空态 / 点星标出现快捷项 / 收藏落本机并刷新后仍在 / 取消后恢复空态」四个断言；脚本会自动从源码读取各校引导 key 与 TOUR_VERSION（QDU=v1 / FJNU=v2）并预置为已完成，避免遮罩干扰。
新增单测 scripts/test_favorites.mjs（17 项）。


## v1.7.2 (2026-10-15) · 安全与健壮性加固（patch）：外部 HTML 白名单消毒 + 本机存储兜底 + 死代码清理 + 门禁补挂
新增 src/utils/sanitizeHtml.js（零依赖 · DOM-free，浏览器与 Node 行为一致）：通知详情页 v-html 渲染的教务处正文来自校外服务器，属外部不可信输入，原实现仅在网关侧剥 on* 且无标签白名单，纯静态降级路径更是完全裸露。现改为严格白名单：标签白名单（非白名单标签「拆壳保字」）、内容丢弃表（script/style/iframe/svg/math/form 等连子树一起丢）、属性按标签限定（a[href]、img[src/alt]、td[colspan/rowspan]…）、URL 协议白名单（javascript:/vbscript:/非图片 data: 一律拒绝，先做实体解码与空白/控制字符归一，防 &#106;avascript: 绕过）、外链自动补 rel="noopener noreferrer"。测试中还揪出并修掉一个真实缺陷：script 内出现 "<script>" 字符串时深度配对计数会误判，导致脚本体被当正文输出——按 HTML 规范改为「原始文本元素在第一个 </tag 处结束」。
新增 src/utils/safeStorage.js：localStorage/sessionStorage 的「永不抛异常」薄壳（隐私模式/配额满/沙箱下 setItem 会抛 QuotaExceededError/SecurityError，裸调用会中断交互），提供 safeGet/safeSet/safeRemove/getJson/setJson/makeStore 与可用性探测。
修复 8 处未保护的本机写入：Budget 记录写回与隐藏皮肤、PhysicalTest 体测偏好、FoodWheel 历史与余额、QuizGame 最佳分/轮次/排行榜、BuildingMatch 最佳步数，全部改走 safeStorage。
死代码清理：删除未被任何地方引用的导出 utils/busuanzi.js bszPagePv()。
门禁补挂：deploy.yml 的前端单测门禁补上 test_budgetbackup.mjs（上一版漏挂）与新增 test_sanitize.mjs。
新增单测 scripts/test_sanitize.mjs（15 项）：标签白名单/内容丢弃/属性限定/伪协议与实体绕过/标签配对/真实公报样本。


## v1.2.27 (2026-10-08) — 换校 bat + 网站工坊
- 换校工具.bat 数字菜单；换校向导升级网站工坊（文案/样式实时/生成 site.js/智能体联动）

## v1.2.26 (2026-10-08) — BM25 知识层 + 文档
- kb-nav 校本重建 + navAnswer 五级识别；架构/部署白皮书与剧本文档体系

## v1.2.25 (2026-10-08) — 超级论坛与三新应用同步

- `src/wall/` 模块化超级论坛：12 分区 / 5 帖型 / 悬赏采纳 / 楼中楼 / 表情 /
  投票防重 / 签到积分 / 俏皮话广告位 / API_CONTRACT 后端预留
- 新应用：⏰ 提醒中心 · 📈 社区洞察 · 🔁 换校向导（懒加载登记）
- 智能体 27 工作流（校本补丁：师大吧 / 迎新 / 研究生 / 三新应用直达）
- 暗门三入口 + Logo 三连点；`smoke-community.mjs` 默认 8788
- `src/agent/README.md` 总纲 + `playbooks/` 27 剧本同步
- 验证：`npm run build` 通过；server 8788 实跑 health/wall/敏感词正常

## v1.2.24 (2026-10-07) — 智能体首版（校本适配）

- ChatDock 悬浮舱 / Assistant 全屏页 / 首页对话入口；40+ 意图三层识别
- FAQ 校本化：8 条流程型（删除一切未核实校本数字）；品牌 = 师大智答
- 评论网关 + 一键换校脚本（含智能体大脑落点 update_agent_profile）

## 更早

- v1.3.0 课表节假日调休 · v1.2.4 奖学金页重写 + 数据链路修复 ·
  v1.2.22 调休系统 · v1.0.0 首版（从 QDU-Nav 移植 17 应用）
  （完整表见 AGENTS.md 更新日志）
