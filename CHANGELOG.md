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

## v1.7.14 (2026-10-15) · APK：移除 4x2 课表小组件（部分桌面无法添加），只保留 2x2 与 1x1（patch）
【缘由】你反馈 4x2 课表小组件「每次都是这个无法添加」——在部分桌面（尤其国产 ROM 的启动器）上
反复添加失败，而另外两个组件正常。既然它添不上，留着只是干扰项，按要求 **删掉**：
 · AndroidManifest 移除 `ScheduleWidgetProvider` 的 receiver 与 meta-data；
 · 删除 `ScheduleWidgetProvider.java`、`res/xml/schedule_widget_info.xml`、
   `res/layout/schedule_widget.xml`（紧凑版）、`res/layout/schedule_widget_large.xml`（大号自适应版）、
   `res/values/widget_styles.xml`（`QduWidgetRow` 仅供大号版使用）；
 · `ScheduleNotifier.show()` 里对它的两处刷新调用一并去掉；
 · `strings.xml` 清掉只服务于它的 `widget_description`。

【顺手修掉一个隐患】`applyBadge()`（状态徽章换色：在上课=绿 / 下一节=金 / 假期=蓝 / 空闲=灰）
原本写在 4x2 组件里，却被 2x2 与 1x1 **共用**——直接删类会让另两个组件编译不过。现迁到
新建的 `WidgetKit.java`。教训记进文档：**共用渲染逻辑不要挂在某个具体组件类上**，
否则删一个组件会带崩其余组件。

【保留】2x2「下一节课」（倒计时为主角 + 课程/教室 + 今日进度条）与 1x1「今日」
（状态徽章 + 一句最短结论），两者继续共用 `ScheduleNotifier.widgetDashboard()` 的数据面板。
静态 App Shortcuts（今日/下一节课/课表）与动态快捷方式「下一节课」不受影响。

版本：versionName 仍 **1.3**（按你要求）；versionCode 升到 **9**（单调递增才能覆盖安装）。

验证：gradle BUILD SUCCESSFUL；build-apk.bat exit=0 且有 [OK]；aapt 核验 versionCode=9 / versionName=1.3，
**包内只剩 `ScheduleWidgetProviderNext` 与 `ScheduleWidgetProviderToday` 两个组件**（4x2 已完全不在包内），
`android.app.shortcuts` 仍在；源码资源目录已无 4x2 残留（只余 next/today 的 layout 与 info）；
产物 1.02MB 已同步 public/downloads 与 releases（两处 SHA256 一致）。
回归：e2e-integrity 18/18；audit-refs 0/0；test_schedule 通过；独立课表页 11/11。
文档：skills/fjnu-nav-maintainer/references/apk.md 组件表改为 ×2，并写明移除原因与
「共用逻辑勿挂具体组件类」的教训。

说明：本机无安卓设备，仍未真机验证。装上后请在桌面小组件列表里确认：只应看到
「下一节课」与「今日」两个，且都能正常添加；此前已添加过 4x2 的桌面会显示为失效占位，手动移除即可。


## v1.7.13 (2026-10-15) · 统计上报加「本地/测试环境绝不打点」硬闸 + 真机断言（patch）
【缘由】核对线上「独立访客」是否被本地测试污染时，做了四条实测：
 ① QDU-Nav 打开本地首页，**零请求**打到自建计数服务（site.js staticMode=true 生效，读写都被挡住）；
 ② 其 busuanzi 在 127.0.0.1 下回填的是全局公共桶数值（实测 810 万级），与线上域名并非同一个桶；
 ③ FJNU-Nav 本地首页**没有**任何 Vercount 上报请求；
 ④ QDU-Wiki 的 Vercount 在本地**不回填数值**（卡片停在占位符），说明它不认本地域名。
 结论：既有测试没有污染线上统计。但第三方（Vercount / busuanzi）的分桶规则在服务端、对我们是黑盒，
 而发布前必然要在本地反复预览与跑自动化测试，规则一变就可能真的打点。因此不再把这件事寄托在
 第三方行为上，改为代码层硬闸。

【改动】新增 isLocalEnv()：localhost / 127.0.0.1 / ::1 / *.local / 常见内网段（192.168.、10.、
172.16-31.）/ file: 一律判为本地；判断异常时按本地处理（宁可少统计，不可误上报）。命中则：
 · 不注入 busuanzi / Vercount 第三方脚本（脚本自身会打点）；
 · QDU-Nav 的 VisitStats 把计数服务 api 置空 —— 所有 `if (!api)` 分支自然短路，全链路不发请求；
 · FJNU-Nav 的 Vercount 脚本注入与直连 API 两处都直接返回；
 · QDU-Wiki 的 visit-counter.js 在 IIFE 开头直接 return（既不注入脚本也不直连 API）。

【防回归】真机冒烟新增断言「本地/测试环境不向第三方统计打点」：用 Playwright 监听页面全部请求，
断言没有任何请求命中 busuanzi / vercount / iceoftea / deno.net。两站冒烟 24 → 25 项。

验证：npm run build；e2e-integrity 17/17 与 18/18；audit-refs 0/0；真机冒烟 25/25；
FJNU 独立课表页 11/11；test_schedule / test_sanitize / test_favorites / test_budgetengine /
test_budgetbackup / test_billimport 全绿。


## v1.7.12 (2026-10-15) · APK 全面审计：补齐 5 处稳健性/实用性缺口（系统事件恢复 / 返回键 / 通知按钮 / 动态快捷方式 / 电池白名单引导）
本轮不是加装饰，而是把 APK 当"要长期装在学生手机上天天用"的产品重新过了一遍。逐项结论如下。

【R1 系统性缺口 · 已修】提醒只在「开机」时恢复
Manifest 里 Boot 接收器**只挂了 BOOT_COMPLETED**，而 Boot.onReceive 里还额外做了
`if (!ACTION_BOOT_COMPLETED.equals(action)) return;` 双重限制。后果：
  · 手机时间被改（晚自习调时间、跨时区出差）→ 课前提醒算的是旧时间轴，可能不响或早响；
  · 跨零点 → 今天/明天的课判断错，要等最长 1 小时的下一次 Tick 才纠正；
  · **升级 APK 后**（MY_PACKAGE_REPLACED）闹钟全丢 → 要等下次开机或手动打开 App 才恢复。
改为监听 TIME_SET / TIMEZONE_CHANGED / DATE_CHANGED / MY_PACKAGE_REPLACED / LOCALE_CHANGED，
任一事件立即重排「常驻通知 + 每小时 Tick + 课前精确闹钟 + 桌面小组件 + 动态快捷方式」，
并打日志 `system event -> reschedule: <action>`。

【U1 高频触点 · 已修】返回键一按就退出应用
MainActivity 没有接管 onBackPressed，Android 用户在课表页按返回是**肌肉记忆**，直接退出很突兀。
新增：页面暴露 `window.__feikeBack()`，原生按返回时先问页面——
  ① 有弹层（详情/添加/更多菜单/桌宠面板等 15 个）→ 关掉最上层；
  ② 处于单日列表视图 → 回到周课表；
  ③ 都不是 → 返回 false，原生再退出。
（evaluateJavascript 是异步的，所以 onBackPressed 里**不调用 super**，由回调决定是否 finish。）
新增真机断言 2 项覆盖。

【U2 · 已修】通知只能点进去一次，没有操作按钮
常驻通知加「今日」「周课表」两个按钮，课前提醒加「看课表」「下一节」。
这些按钮走的就是本轮刚修好的深链，因此点击直达对应视图。

【U3 · 已修】长按图标只有固定文案
新增**动态快捷方式**「下一节课」：长按图标直接看到实时内容（如「08:20 高数」），
随课表刷新同步；用独立 id（next_live）避免与静态 shortcuts.xml 的 next 冲突。

【U4 · 已修】提醒不响的头号原因没人管：国产 ROM 杀后台
MIUI/ColorOS/EMUI 等会限制后台，导致课前提醒不触发。新增 JS 桥 `FeikeNative` 暴露
`isIgnoringBattery()` / `openBatterySettings()` / `apkVersion()`；页面在**未加白名单**时弹一次引导条
（延迟 1.5s、可关闭、跳过即不再打扰），点「去设置」直达系统电池优化白名单列表。
刻意**不申请** REQUEST_IGNORE_BATTERY_OPTIMIZATIONS（那是敏感权限且有 Play 政策限制），
只跳转到系统设置列表页，零权限、零政策风险。
新增真机断言 1 项覆盖（含"已加白名单就不打扰"）。

【U5 · 已修】两个权限从头到尾没用过
`READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` 全仓 grep 零引用（课表数据只写应用私有目录
filesDir/notify.json），且在 Android 11+ 基本失效 —— 留着只会让用户安装时看到莫名其妙的「存储」权限。
已删除；顺带清掉 targetSdk 33 下已无意义的 `requestLegacyExternalStorage`。
核验：包内权限从 7 条降到 5 条（INTERNET / POST_NOTIFICATIONS / RECEIVE_BOOT_COMPLETED /
SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM）。

【审计后确认「不需要动」的点（同样重要，说明是真审计而不是乱加）】
· `allowBackup="true"`：保留。换手机时课表/自定义课程能随系统备份恢复，是有价值的；页面早已对
  localStorage 写脏做容错（有真机断言覆盖）。
· WebView 加载失败：Capacitor 自带错误页，无需自造。
· 外部链接：Capacitor 默认用系统浏览器打开，不会把用户困在应用内。
· 精确闹钟：已有 `canScheduleExactAlarms()` 判断 + 非精确回退，Android 12/13 行为正确。
· minSdk 22：高于 addJavascriptInterface 的安全分界（API 17），JS 桥无历史漏洞风险。

版本：versionName 仍是 **1.3**（按你要求）；versionCode 升到 **8**（必须单调递增才能覆盖安装并被识别为升级）。

验证：gradle BUILD SUCCESSFUL；build-apk.bat exit=0 且有 [OK]；aapt 核验 versionCode=8 / versionName=1.3 /
权限已精简 / 新增 4 个系统广播 / 三个 widget provider / android.app.shortcuts 全部在包内；
包内 standalone-schedule.html 抽查确认 __feikeBack、FeikeNative、batteryTip 已进包；
产物 1.03MB 已同步 public/downloads 与 releases（两处 SHA256 一致）。
真机断言：standalone **8 → 11 项**全绿（新增返回键 2 项 + 电池引导 1 项）；真机冒烟 24/24；integrity 18/18。

说明：本机无安卓设备，仍未真机安装验证。建议装上后依次试：
长按图标（应看到静态三项 +「08:20 课名」动态项）、通知上的四个按钮、课表页按返回（应回周课表而不是退出）、
以及首屏 1.5s 后是否出现电池白名单引导条。


## v1.7.11 (2026-10-15) · 修「快捷方式打不开」的真正根因（WebView 相对 URL）+ 修 bat 成功却报错（patch）
【现象】长按图标三个快捷方式点进去：`网页无法打开 · http://standalone-schedule.html/?view=week ·
net::ERR_CLEARTEXT_NOT_PERMITTED`。

【根因（上一版没修对，这次是实测报错直接指认的）】
WebView.loadUrl() **不会把相对路径按"当前页"解析**：上一版我在拿不到 getServerUrl() 时回退成
相对 URL "standalone-schedule.html?view=week"，WebView 把 `standalone-schedule.html` 当成了**主机名**，
补成 `http://standalone-schedule.html/?view=week`（所以路径变成了 `/?view=week`），而 Capacitor 只对
localhost 放行明文 → Android 9+ 直接 ERR_CLEARTEXT_NOT_PERMITTED。
（项目里 capacitor.config.json 配的是 androidScheme: https，正确目标应是
 `https://localhost/standalone-schedule.html?view=week`。）
同时旧实现把 getServerUrl() 拼进 onCreate 极早路径，拿不到 base 时还会拼出 "/index.html?view=x"，
并且 catch 静默吞异常 —— 手机上完全看不到线索。

【修法】
- origin **只从 WebView 当前地址取**（`web.getUrl()`，此刻必为 https://localhost），
  getServerUrl() 仅作次要兜底；
- `originOf()` 对 about:blank / data: / blob: / 非 http(s) 一律返回 null；
- 拿不到 origin 就**递归重试**（400ms × 最多 8 次 ≈ 3.2s，覆盖冷启动首帧慢的机型）；
- 跳转后 **1s 校验**：若仍不在目标页（部分机型首次 loadUrl 会被首帧加载盖掉）就补跳一次，上限 2 次；
- 全程打日志（tag=FeikeSchedule）：`adb logcat -s FeikeSchedule` 能看到实际跳转地址与重试次数。

【顺带修掉一个会误导人的 bat 缺陷】
build-apk.bat 里我上一轮加的失败检查块内含未转义的括号：
    echo  ... JAVA_HOME must point to JDK 17 (AGP 8 requires it).
cmd 在**解析** if(...) 块时会把 `)` 当成块结束，剩下的 `.` 变成意外符号 → 无论构建成败都打印
「此时不应有 .」，并且其后的 `echo [OK] build done` 被整体跳过 —— 也就是"打包明明成功，脚本却报错、
还看不到 [OK]"。已去掉括号（改为逗号从句），实测 `bat exit=0` 且正常输出 `[OK] build done`。

验证：真实 gradle 编译 BUILD SUCCESSFUL；build-apk.bat exit=0 且输出 [OK]；aapt 核验
versionCode=7 / versionName=1.3 / 三个 widget provider / android.app.shortcuts 均在包内；
产物 1.02MB 已同步 public/downloads 与 releases（两处 SHA256 一致）。
skills/fjnu-nav-maintainer/references/apk.md 补充两条「已知坑」：
① WebView 深链必须给绝对 URL（相对路径会被当成域名 + 明文拦截）；
② cmd 的 if(...) 块内不能有未转义括号。

说明：本机无安卓设备，**仍未真机验证**。装上后若快捷方式还有问题，把
`adb logcat -s FeikeSchedule` 的输出发我，日志会直接显示它试图跳转的完整地址。


## v1.7.10 (2026-10-15) · APK 修「长按快捷方式打不开网页」+ 桌面组件全面升级 + 桌宠拖动去卡顿 + 版本号回 1.3（patch）
【① 修 Bug：长按图标的三个快捷方式点进去都是「网页无法打开」】
根因在 MainActivity.consumePendingView()：它把 bridge.getServerUrl() 的返回值直接拼成
"base + /index.html?view=xxx"，并且 **catch (Throwable) 把所有异常静默吞掉**，于是手机上什么都看不到：
  · getServerUrl() 返回 null 或带尾斜杠时，拼出的是 "/index.html?view=today" 或
    "https://localhost//index.html" 这类非法地址 → WebView 直接报「网页无法打开」；
  · onCreate 里 super.onCreate() 刚跑完、Capacitor 正在加载首页，此时立刻 loadUrl 会与之打架。
（shortcuts.xml 本身没问题：三个 shortcut 都是显式 intent + extra view，已复核。）
修法：
  · 地址规范化：去掉尾斜杠；拿不到 base 或 base 不是合法绝对地址时**退回相对 URL**，交给 WebView 按当前页解析；
  · 延迟 400ms 再跳（给首次加载让路），并在 1200ms 做一次兜底重试（先判断是否已在目标页，避免重复加载）；
  · 直接命中 APK 内真实页面 standalone-schedule.html（少一次垫片跳转），该页 applyDeepLink() 读
    location.search 切视图，网页端这段行为已有真机断言覆盖（e2e-standalone 8/8）；
  · 全程打日志（tag=FeikeSchedule），出问题可直接 adb logcat 定位，不再静默失败。

【② 桌面组件升级：功能翻倍 + 视觉重做】
数据层新增 ScheduleNotifier.widgetDashboard()：三套组件**共用同一份 14 槽位数据面板**
（日期 / 状态徽章 / 课程 / 教室·节次 / 倒计时 / 今日进度 / 今日剩余 4 条 / 明日首节 / 进度百分比 / 徽章类型 / 1x1 短文案）。
以前三个组件各读各的、字段口径还不一致，现在只有一份真相。
网页端 buildNotifySummary 同步补 todayTotal / todayDone —— 原先 notify.json 里只有 upcoming(≤3)，
native 端拿不到进度分母，「今日 4 节 · 已上 2 节」这类进度根本没数据可显示。
视觉与功能：
  · 紧凑版（4x2）：日期 + 状态徽章 + 课程名 + 教室·节次 + 倒计时 + 今日进度文字；
  · 大号版（高度 ≥170dp 自动切）：上面全部 + **今日进度条** + **今日剩余课程最多 4 条** + **底部明日首节**；
  · 2x2「下一节课」：倒计时放大到 24sp 当主角 + 课程/教室 + 今日进度条；
  · 1x1「今日」：状态胶囊 + 一句最短结论（「还剩 2 节」/「都上完了」/「今日无课」/「剩 23分」）；
  · **状态徽章按状态换色**：正在上课=绿 / 下一节=金 / 假期=蓝 / 空闲=灰，一眼看出当前状态；
  · 点击区域分流：整体→今日、徽章→本周课表、倒计时→下一节课、底部→周视图；
  · 三套布局统一走 RemoteViews 支持的控件 + weight 分配，任意尺寸都不裁切。

【③ 修 Bug：桌宠悬浮球拖动卡顿】
旧实现拖动过程中每帧写 style.left/top —— 这是**布局属性**，每帧强制同步重排；再叠加
.pet-fab 上 0.28s 的 transform transition（造成拖影）和 9s 一圈的 petSpin 旋转动画（持续占用合成器），
低端机上就是肉眼可见的卡顿；移动端还缺 touch-action:none，拖动会和页面滚动打架。
修法：
  · 拖动全程只写 translate3d（合成器层，不触发布局），松手时才一次性把落点写回 left/top（只一次重排，视觉无感）；
  · 拖动期间给按钮挂 .dragging，停掉 transition 与所有动画；
  · 补 touch-action:none 与 will-change:transform；位置持久化格式不变（sche_pet.pos）。

【④ 版本号】按要求回到 **versionName 1.3**；versionCode 升到 **7**（versionCode 必须单调递增才能覆盖安装，
你手机上已装的 1.4/versionCode 6 会被正常升级，不会降级安装失败）。站点版本按惯例只走小版本 z：1.7.9 → 1.7.10。
三方版本一致性由 test_schedule.mjs 守着（package.json apkVersion = standalone APP_VERSION = schedule-data.json.appVersion = 1.3）。

验证：真实 gradle 编译 BUILD SUCCESSFUL；aapt 核验 versionCode=7 / versionName=1.3 / 三个 widget provider /
android.app.shortcuts 都在包内；包内 standalone-schedule.html 抽查确认 todayTotal、translate3d、
touch-action:none、dragging 全部就位；产物 1.02MB 已同步 public/downloads 与 releases。
网页侧回归：e2e-standalone 8/8（含 ?view= 深链三项）、真机冒烟 24/24、integrity 18/18、audit 0/0、
test_schedule / test_sanitize / test_favorites / test_budgetengine / test_budgetbackup / test_billimport 全绿。

说明：本机没有安卓设备，**APK 未在真机安装验证**。装上后请重点看：长按图标的三个快捷方式是否都能
打开对应视图（看 adb logcat -s FeikeSchedule 能看到跳转地址）；三套组件添加后拖拽拉伸是否切换布局。


## v1.7.9 (2026-10-15) · 部署加固（npm ci 失败自动回退 + 失败现场诊断摘要）（patch）
【背景】上一次 push 的 deploy 在 21 秒内挂在 build job（exit code 1）。本地严格模拟 CI
（rm -rf android ios → npm run build → integrity → 全部门禁）全部通过，锁文件也与 package.json 一致，
因此判定失败发生在 Ubuntu 侧的某一步（最可能是 npm ci 的平台/网络差异），而**本机看不到 Actions 日志**。
与其继续猜，不如让部署更不容易被单点卡死，并让下次失败当场看清原因。

【加固 1】依赖安装带回退
  `npm ci --no-audit --no-fund` 失败时自动回退 `npm install --no-audit --no-fund` 并打 warning。
  个人站点要的是「能部署」，锁文件严格性不该成为整站上线的单点故障。
  （NCSS-Nav 上一轮已修过同类问题：package-lock.json 未同步导致 npm ci 快速失败。）

【加固 2】失败现场摘要（if: always()）
  无论成败都往 run 页面底部写一份 Step Summary：commit、node/npm 版本、runner 平台、
  dist 产物清单，以及 index.html / mobile.html / standalone-schedule.html / 404.html /
  admin.html / admin/index.html / console/index.html / downloads/feike-schedule.apk
  八个关键产物的存在性与字节数。下次再挂，不用猜就能直接看出是"构建没产物"还是"产物缺哪个"。

【步骤命名】原先 `npm ci`、`npm run build` 都是匿名步骤，失败时 GitHub 只显示 job 名；
现在每步都有中文名，失败定位一眼可见。

【顺带】同步共享冒烟脚本（QDU-Nav 新增的绩点/分学期断言：本站无该应用时自动跳过）。

验证：YAML 语法解析通过；本地模拟 CI（android/ios 移开）build / integrity 18/18 / audit 0/0 /
7 个专项单测全绿；真机冒烟 22/22。

注：本机无 gh CLI/token，**仍看不到 Actions 结果**，需你在网页端确认这次 run 是否通过；
若仍失败，run 页面底部的诊断摘要会直接写明失败位置与产物状态。


## v1.7.8 (2026-10-15) · APK 1.4 组件全面升级 + i18n 按需加载 + 冒烟日期动态化（patch）
【APK 1.4（versionCode 6）—— 针对「长按出不来快捷方式 / 组件不好看、不能拉伸」的反馈】
① **1x1「今日」小部件**（ScheduleWidgetProviderToday）：部分国产桌面不支持 App Shortcuts（长按图标），
   小部件是所有启动器都有的能力，因此新增一个 1x1 入口：显示「🗓 今日 + 首节课时间」，点一下直达今日课程
   （走 ScheduleNotifier.launchIntentView(ctx,"today") 深链）。
② **课表组件改为真正的「尺寸自适应 + 可拉伸」**：
   - 4x2 起支持横纵拉伸，补 minResizeWidth/minResizeHeight（缺它部分桌面不给拖拽把手）、
     targetCellWidth/Height 与 previewLayout（API 31+ 桌面显示真实预览而非图标）。
   - 新增 onAppWidgetOptionsChanged：拉高到 170dp 以上**自动切换为大号布局**（状态行 + 今日后续课程最多 4 条 +
     底部下一节倒计时），而不是把三行硬撑开——这才是「可拉伸」的实际意义；三个区域还能分别点进 今日/课表/下一节。
   - 2x2 与 1x1 组件同样补齐可拉伸与预览；三个组件统一使用新的圆角渐变背景 widget_bg，视觉一致、更像系统原生卡片。
③ 三套组件的刷新收敛到同一条链路（show() → Provider/Today/Next.updateAll，各自 30s 节流），避免各刷各的。
④ 版本链：apkVersion 1.3 → 1.4、versionCode 5 → 6、APP_VERSION 同步（test_schedule 断言三方一致）。
   产物 1.02MB，签名 2277d065…（可覆盖安装），已同步 public/downloads 与 releases。

【性能】i18n 英文包（约 49KB）改为按需动态 import：main.js 挂载前 await ensureLang()，
中文用户零开销；英文用户不会闪中文。实测 FJNU 首屏入口 main chunk 再降。

【测试】真机冒烟脚本原先把日期写死（一跨天就误报），现按当前月份动态生成样本与期望值；
新增 2 项断言（首屏不请求英文包 / 切换后界面变英文），18 → 20 项。

验证：npm run build；test_schedule / test_favorites / test_sanitize / test_budgetengine / test_budgetbackup /
test_billimport 全绿；e2e-integrity 18/18；audit-refs 0/0；e2e-standalone 8/8；真机冒烟 20/20；
真实 APK 由 build-apk.bat 打包并 aapt/apksigner 核验（versionCode 6、versionName 1.4、三个 widget provider、
android.app.shortcuts、USE_EXACT_ALARM 均在包内）。


## v1.7.7 (2026-10-15) · 健壮性收尾：全面扫描 + 修 2 处真实缺陷 + 存储写入兜底（patch）
对 src/ 做了一次跨仓机器扫描（JSON.parse 有无 try 兜底 / localStorage 写入有无保护 / innerHTML 与 v-html 赋值的
数据来源），逐条人工核对后处置：

【修掉 2 处本仓特有的真实缺陷】
- src/views/Budget.vue：`achShown = ref(JSON.parse(localStorage.getItem('fjnu_ach') || '{}'))` 无兜底——
  一旦本机存储被历史版本/手工编辑污染成非法 JSON，**进入生活费计数器就会直接崩页**（QDU 侧早已是带 try 的写法，
  本仓漏同步）。现改为等价的可捕获写法。
- src/views/MobileSchedule.vue：`watch(displayMode, v => localStorage.setItem(MODE_KEY, v))` 裸写——
  禁用存储/配额满时切换页面/纯课表模式会抛异常；紧邻的 selectedMajor 写入本来就带 try，属同文件内不一致。现统一。

【兜底补齐】
- WhatToEat.vue 2 处 sessionStorage.setItem 包 try（禁用存储时退化为内存态）。

【扫描结论（未新增注入面）】
- JSON.parse 共 66 处，扫描点名的 navContext.js:17 实际已在 try 内（假阳性）；其余 64 处均带兜底。
- v-html/innerHTML 6 处逐条确认：NoticeDetail 用白名单消毒后的 safeBody；AgentChat/CommentTree/RichEditor 先转义再渲染；
  main.js 为固定错误文案。
- setItem 报出的位置经核对多数已带 try（扫描窗口假阳性）；剩余已在本次一并补齐。

验证：npm run build 通过；test_schedule / test_favorites / test_sanitize / test_budgetengine / test_budgetbackup /
test_billimport 全绿；e2e-integrity 18/18；audit-refs 0/0；e2e-standalone 8/8。


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
