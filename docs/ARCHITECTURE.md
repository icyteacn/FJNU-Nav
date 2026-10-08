# 架构白皮书 · FJNU-Nav-agent

> 与 QDU-Nav-agent 同构内核 + 福建师大校本适配。
> 分层、设计决策、换校原理与 QDU 版完全一致——**本文只记差异点**（新维护者优先读）。

## 同构部分（详见 QDU-Nav-agent/docs/ARCHITECTURE.md）

L5 入口（对话框/悬浮舱/全屏页）· L4 智能体（27 工作流 · 三模式 · 云脑代理）·
L3 应用注册表（apps + router 双登记）· L2 社区层（wall 模块 + community.mjs）·
L1 数据层（网关优先 + 快照兜底）——全部一致。

## FJNU 特有

| 项 | 说明 |
|---|---|
| 校本智能体 | `agent/config.js` 品牌 = **师大智答**；`agent/faq.js` 8 条流程型问答（全部标注"以当年通知为准"，**无未核实校本数字**） |
| 懒加载路由 | `router.js` 为 `() => import()` 形式（QDU 为同步 import），**新应用登记写法不同** |
| 专属应用 | 迎新日程 · 研究生培养 · 综测与奖学金 · 党建 · 课表 App（mobile.html + Capacitor APK） |
| intents 校本补丁 | 贴吧 patterns = 师大吧；siteStats 兜底到 contributors；含 orient / graduate 直达 |
| 数据链路 | 教务 Sudy 系统爬虫 + NextFStar 排课；快照**合并模式**防互相覆盖 |
| 节假日课表 | `classSchedule.js` HOLIDAY_MAP 停课/调休标记 |
| 社区网关端口 | **8788**（QDU 版为 8787，双站并行互不冲突） |

## 端口约定

| 服务 | 端口 |
|---|---|
| Vite | 5173 |
| 社区网关 | **8788** |
| 冒烟 | `node scripts/smoke-community.mjs`（默认打 8788，可传参覆盖） |

## 换校

与 QDU 完全同款：`python customize.py --config templates/{pku,qdu,fjnu}.json`，
7 处落点（含 **agent 大脑**）；端到端沙盒验证 7/7 通过。
