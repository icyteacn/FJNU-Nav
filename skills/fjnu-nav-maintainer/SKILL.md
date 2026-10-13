---
name: fjnu-nav-maintainer
description: FJNU-Nav（福star导航，福建师大校园导航）项目专属维护手册。当在 FJNU-Nav-agent 仓库中进行任何维护任务时使用——修改功能或修 bug、调整课表/节假日/调课数据、新增应用页面、改爬虫与快照数据、发布新版本、打包或签名 APK、跑测试门禁、追加版本日志、排查构建/部署问题。只要工作对象是这个仓库的代码或数据，即使用户没有提到「维护」「发布」等词，也应加载本技能，它会引导读取对应的操作参考文档并执行规范流程。
---

# FJNU-Nav 项目维护技能

本技能是 FJNU-Nav 仓库的操作型知识库：**架构与数据链路、发布流程、课表调课套路、APK 打包签名**。
仓库根目录的 `AGENTS.md` 常驻于每次会话（项目简介、红线、更新日志），本技能承载它的操作章节，按任务需要读取对应参考文档。

## 第一步永远是

1. 读仓库根目录 `AGENTS.md` 的**红线**章节（不碰 keystore、不编造数据、版本号唯一维护点等）。
2. 读 `AGENTS.md` **更新日志**的最近 3-5 条，接续上下文（上次做到哪、有没有未推送的修订）。
3. 按下面的路由表打开本次任务需要的参考文档。

## 参考文档路由

| 任务 | 读取 |
| --- | --- |
| 改功能 / 修 bug / 新增应用页面 / 改路由或应用注册表 | `references/architecture.md`（架构速览 + 数据链路） |
| 发布新版本 / 改版本号 / 跑测试门禁 / 提交推送 | `references/release.md`（维护清单 8 步） |
| 改课表、调课、节假日调休、课程数据 | `references/schedule-adjust.md`（调课落地套路 + 渲染链路） |
| 打包 APK / 签名 / 覆盖安装 / 版本比对 | `references/apk.md`（打包与签名） |

任务横跨多类时全部读取（如「改课表数据并发布」= schedule-adjust + release）。

## 高频易错点（详见 AGENTS.md 红线）

- **版本号只在 `src/config/site.js` 维护**，页面模板里不许硬编码；小改动只加 z 位。
- **推送一律 `git push origin`**（严禁手写其他 URL），push 前先 `git fetch` 看抢推。
- 改 `faq.js`/`workflows.js`/`apps.js` 后必须重跑 `node scripts/gen_kb_nav.mjs` 并提交。
- 本地测试网关用 `COMMUNITY_DATA=server/data/community.test.json`，别写脏正式数据。
- 本机 `python` 可能过旧，Wiki 侧用 `py -3.13`；本仓前端测试用 node 即可。
- 课表数据的**唯一数据源**是 `src/data/classSchedule.js`，改完 `npm run build` 自动生成接口，不要手改 `public/data/schedule-*.json`。

## 完成任务后

按 `references/release.md` 的 8 步清单收尾——其中第 4-7 步（README 版本历史、Contributors 贡献者墙、`site.js` 版本号、`AGENTS.md` 更新日志）是每次发布的固定动作，漏掉会被后续会话的完整性检查发现。
