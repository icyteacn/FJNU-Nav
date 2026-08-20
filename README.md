# FJNU 校园导航

> **🌐 在线访问：<https://github.com/Xuuyuan/FJNU-Nav>**（由 GitHub Actions 自动构建并部署到 GitHub Pages，见下方「部署」）
>
> **🏷️ 当前版本：v1.0.0**（福建师范大学校园服务聚合入口。版本号在 `src/config/site.js` 中维护，页脚与「关于本站」面板同步展示）

面向福建师范大学的校园服务聚合入口（非官方演示站），暖色系「闽都红」主题、移动端优先。**本站同时是一套可直接复用的「学习导航站」工程模板**：品牌、文案、配色、应用注册、数据源均已模块化，参考本仓库改造为其他学校 / 其他主题的导航站成本极低（见「二次开发：移植与扩展」）。

## 功能

| 应用 | 说明 |
| --- | --- |
| 🏯 学校官网 | 福建师范大学主站 / 教务 / 招生 / 服务入口大全；**学院官网按学科分类**（人文社科 / 理工 / 艺术与体育 / 继续教育 / 合作办学）；社区与资源含**福建师范大学吧**链接与福师大 Wiki |
| 📰 校园动态 | 教务处官网通知/动态，随快照定时更新 |
| 🗓️ 校历 | 官方教学日历列表 + 学期时间线（以校历图片附件发布，附官方入口） |
| 🧭 教室导航 | 空教室查询（结果独立页）+ 教室一周占用 + 教学楼导航指引（知明楼/笃行楼/立诚楼/致广楼等，按校训命名） |
| 📅 校历 | 官方校历入口 + 学期时间线 |
| 🍚 食堂空座率 | 福师大食堂名单 + 营业时段实时判定 + **实时空座监测（福Star「食堂人流量分析」接入）** + 档口菜单与菜价一览 |
| 🎓 新生学号查询 | 官方录取查询入口与流程引导（录取系统需登录，不做代查） |
| 📈 数据洞察 | 基于课程排课数据的统计：热门教室 / 教师 / 课程、学期趋势、周节次分布（排课数据不可得时如实降级为空态） |
| 🏃 体测计算器 | 按《国家学生体质健康标准》计算体测总分与等级 |
| 🍲 今天吃什么 | 随机推荐食堂真实档口 + 菜价，支持**按校区筛选**（旗山 / 仓山） |
| 💰 生活费计数器 | 收支随手记（**批量记账**）+ **微信/支付宝/建行账单导入**（仅本地解析、自动归类、退款冲抵 + 智能清洗 + 去重）+ **生活费专业版**（近 12 月收支图表 / 商户排行 / 明细筛选 / 导出 Excel 分析）+ **生活费模拟三合一** + **奖学金预设** + **分级成就墙**（20 个）与彩蛋 |
| 🧠 福师大知多少 | **约 100 题**校园知识问答，含**错题回顾**与**本机排行榜**（题库按福师大校史 / 校园知识重置） |
| 🎠 美食轮盘 · 🃏 教学楼速配 | 校园小游戏（速配按校训「知明行笃 立诚致广」与校园地标配对） |
| 👔 校领导测试 | 35 题校园管理场景 + 多维原型比对，测出你像哪位福建师范大学校领导（10 位原型：历任校长 / 书记） |
| 💬 贴吧舆情 | 爬取**福建师范大学吧**公开列表页的轻量舆情分析：热帖榜 / 关键词 / 话题分布 / 近 14 天发帖趋势（贴吧反爬较严时如实降级显示空态，随仓库内置空结构文件避免 404，附官方入口） |
| 🎖️ 贡献者墙 | 词云式展示项目贡献者，点击跳转 GitHub 主页；社区 PR 合入者在此致谢 |

## 技术栈

- **前端**：Vue 3 + Vite，静态资源部署，支持 Hash 路由分享
- **网关**：原生 Node HTTP（`server/index.mjs`，端口 8787），抓取并解析教务数据
- **Python 数据侧**：`crawler/`（优先 requests / 标准库回退）承担**爬取 → 校验 → 测试 → 分析 → 差异**整条数据链路，与 Node 版双实现互为保障
- **数据层**：快照 `public/data/snapshot.json`（含教务通知 / 工作动态 / 教学日历，前端 API 请求失败时自动回退快照，保证纯静态托管可用）+ 洞察 `public/data/course_stats.json` + 贴吧舆情 `public/data/tieba_stats.json` + 食堂实时快照 `public/data/canteen_live.json`

### 前端模块划分（`src/`）

| 目录 / 文件 | 职责 | 移植时 |
| --- | --- | --- |
| `config/site.js` | **站点唯一配置**：名称、品牌、版本、版权、来源说明、外部链接 | ✅ 改这里即可换品牌与文案 |
| `router.js` | 视图注册表（`VIEWS`）+ 底部导航（`NAV_APPS`）+ Hash 路由解析 | ✅ 新增/调整应用入口 |
| `data/` | 全部静态数据（应用注册表、校区、食堂、教室、题库等） | ✅ 换成本校数据 |
| `api/` | 网关优先 + 快照兜底的数据访问层 | 一般不动 |
| `utils/` | 公共工具（课程解析 / 格式化 / 账单导入 / Excel 导出） | 一般不动 |
| `views/` | 各应用页面（每个 `.vue` 一个应用） | ✅ 增删应用 |
| `components/` | 可复用组件（`CountUp` 数字滚动 / 图表 / 洞察面板等） | 一般不动 |
| `styles.css` | 全局样式，`:root` CSS 变量控制主色调 | ✅ 换配色只改变量 |

### Python 数据链路（`crawler/`）

| 模块 | 职责 | 入口 |
| --- | --- | --- |
| `build_snapshot.py` | 抓取教务处通知/工作动态/教学日历 + 尽力抓取课程总表 → 生成快照 | `python crawler/build_snapshot.py` |
| `validate.py` | 快照质量门禁（schema / 数量 / 一致性），CI 提交前强制运行 | `python crawler/validate.py` |
| `analysis.py` | 聚合课程数据 → 数据洞察页数据 | `python crawler/analysis.py` |
| `tieba.py` | 尽力抓取「福建师范大学吧」列表页 → 舆情分析（热帖/关键词/话题/趋势）；失败保留旧数据 | `python crawler/tieba.py`（Node 回退 `node scripts/tieba.mjs`） |
| `canteen.py` | 抓取福师大「食堂人流量分析」接口 → 食堂实时空座快照 | `python crawler/canteen.py`（Node 回退 `node scripts/canteen.mjs`） |
| `diff.py` | 对比上次快照输出变更摘要，写入 CI 提交信息 | `python crawler/diff.py` |
| `fetcher.py` / `parsers.py` / `config.py` | 通用抓取 / 页面解析 / 配置 | — |
| `split_snapshot.py` | 按学期拆分排课数据（`timetable_meta.json` + `terms/*.json`） | `python crawler/split_snapshot.py` |
| `make_baseline.py` | 生成基于真实数据的基线快照（离线兜底） | `python crawler/make_baseline.py` |

**质量保障**：`tests/` 含 17 个单元测试（解析器 / 快照 schema / xlsx 解析 / 贴吧解析），CI 与本地 `python -m unittest discover -s tests` 均会运行；快照在任何提交前都必须通过 `validate.py`，防止学校改版导致数据静默退化。

## 数据来源与爬取原理

网站所有「实时」数据均来自**福建师范大学官网公开页面**（`jwc.fjnu.edu.cn` 教务处，正方 Sudy 系统），本站不做任何数据转发/代理，仅定时抓取后静态聚合展示：

| 数据 | 来源 | 抓取内容 |
| --- | --- | --- |
| 教务通知（前 4 页约 56 条） | 教务处通知公告列表 `tzgg_9107/list.htm` 及分页 `listN.htm`（合并去重） | 标题 / 日期 / 原文链接 |
| 工作动态（8 条） | 教务处首页 / 工作动态列表 `430/list.htm` | 标题 / 日期 / 原文链接 |
| 校历（约 14 条） | 教务处教学日历列表 `jxrl/list.htm` | 标题 / 日期 / 原文链接 |
| 课程总表 | 福师大教务系统（`jwglxt.fjnu.edu.cn`）需统一身份登录，暂无公开 xlsx 附件 → 下载中心尽力尝试，缺失时如实降级为空态 | 课程 / 教师 / 班级 / 周次 / 节次 / 教室 |
| 食堂空座率 | 福师大后勤服务集团「食堂人流量分析」服务（福Star APP，校园网环境） + 校内档口/菜价整理（福师大Wiki） | 在座人数 / 座位数 / 当日消费次数 / 菜单与菜价 |
| 贴吧舆情 | 百度贴吧「福建师范大学吧」公开列表页 `tieba.baidu.com/mo/q/threadlist?kw=福建师范大学`（前 4 页约 120 帖） | 标题 / 作者 / 回复数 / 发帖时间 |

解析规则与上游页面结构一一对应（正方列表页 `column-news-item` / 首页 `notice-tit` 结构），学校改版时需要同步更新解析器。爬取频率克制（每 6 小时一次），仅在公开页面抓取公开信息。

## 数据更新（定时爬取）

网站数据不是「部署时的一次性快照」，而是**持续定时爬取**：

- GitHub Actions `refresh-snapshot` 工作流**每 6 小时**（北京时间 08:23 / 14:23 / 20:23 / 02:23）自动运行：**Python 版爬虫**（`crawler/build_snapshot.py`，失败自动回退 Node 版 `scripts/snapshot.mjs`）→ 重新抓取通知 / 工作动态 / 教学日历 → 生成洞察数据（`analysis.py`）→ **贴吧舆情**（`tieba.py`，反爬失败时跳过并保留旧数据，不阻塞）→ **食堂空座快照**（`canteen.py`）→ **质量校验**（`validate.py` + 单元测试）→ 计算差异摘要（`diff.py`）→ 有变化时提交推送 main 分支
- 推送自动触发 `deploy` 工作流重新构建并部署 GitHub Pages，因此线上站点始终反映**最近一次抓取**的数据

### 手动更新（随时触发）

**方式一：网页一键触发（推荐）**
1. 打开仓库 **Actions** 页签
2. 选中左侧 **refresh-snapshot** 工作流
3. 点 **Run workflow** → 绿色按钮，立即在 GitHub 云端重跑抓取并自动部署

**方式二：本地命令行**
```bash
python crawler/make_baseline.py   # 离线生成基线快照（无网环境）
python crawler/build_snapshot.py   # 在线抓取快照（Python 版，首选）
python crawler/analysis.py         # 生成数据洞察统计
python crawler/validate.py         # 质量校验（可选，CI 会自动跑）
# 或
node scripts/snapshot.mjs          # Node 版（等价）
git add -A && git commit -m "data: refresh snapshot" && git push origin main
```

## 本地运行

```bash
npm install
npm run dev        # 前端开发服务器
node server/index.mjs   # 数据网关 8787（可选，前端无网关时回退快照）
```

## 部署

- 推送/定时任务提交到 `main` 分支，即由 `deploy.yml`（GitHub Actions）自动执行 `npm run build`，将产物发布到 **GitHub Pages**，全程无需手动干预
- 仓库 Pages 的 **Source** 已配置为 **GitHub Actions**（由 `actions/deploy-pages` 发布），后续版本更新无需再修改任何 Pages 设置
- `refresh-snapshot`（数据）与 `deploy`（构建）两个工作流相互独立：数据变化才触发重新部署，避免无谓构建

## 目录结构

```
FJNU-Nav/
├── src/                    # Vue 前端
│   ├── config/site.js      #   ★ 站点唯一配置（品牌/版本/文案/版权，移植入口）
│   ├── router.js           #   ★ 视图注册表 + 底部导航 + Hash 路由
│   ├── main.js / App.vue   #   应用入口 / 根组件（组装 Welcome + 顶栏 + 视图 + 页脚）
│   ├── styles.css          #   全局样式（:root CSS 变量控制主色调）
│   ├── api/                #   数据访问层（网关优先 / 快照兜底 / 数据洞察）
│   ├── utils/              #   公共工具（课程班级解析 / 时间格式化 / 账单导入 / Excel 导出）
│   ├── components/         #   可复用组件（CountUp 等）
│   ├── data/               #   静态数据（应用注册表 / 校区 / 食堂 / 教室 / 题库…）
│   └── views/              #   应用页面（一个 .vue 一个应用）
├── server/
│   ├── index.mjs           # 原生 Node 网关（8787）
│   └── parse_kcb.py        # 课程总表 xlsx 解析（仅 Python 标准库）
├── crawler/                # Python 数据侧（优先 requests / 标准库回退）
│   ├── config.py           # 数据源 / 抓取参数 / 输出路径
│   ├── fetcher.py          # 通用抓取（超时 / 重试）
│   ├── parsers.py          # 正方页面结构解析（通知 / 动态 / 多页合并）
│   ├── build_snapshot.py   # 快照构建器（定时任务首选入口）
│   ├── validate.py         # 快照质量校验（CI 质量门禁）
│   ├── analysis.py         # 课程数据洞察聚合
│   ├── canteen.py          # 食堂空座率抓取
│   ├── diff.py             # 快照差异摘要
│   └── make_baseline.py    # 离线基线快照生成
├── tests/                  # Python 单元测试（解析器 / schema / xlsx / 贴吧）
├── scripts/
│   ├── snapshot.mjs        # Node 版快照抓取脚本（等价实现，回退用）
│   ├── canteen.mjs         # Node 版食堂空座率抓取（回退用）
│   └── gen-classrooms.mjs  # 楼宇/教室数据生成（从课程总表派生）
├── public/data/snapshot.json     # 定时更新的数据快照
├── public/data/course_stats.json # 定时更新的数据洞察统计
└── .github/workflows/      # snapshot.yml 定时爬取 / deploy.yml 构建部署
```

## 二次开发：移植与扩展

本站按「**改配置 → 换数据 → 增应用**」三步即可改造成任意主题的学习导航站，视图与逻辑无需改动。

### 1. 换品牌与文案（3 分钟）

编辑 `src/config/site.js` 一个文件即可：`name` / `brand` / `tagline` / `motto` / `version` / 版权与来源说明 / Wiki 社区链接。顶栏、欢迎页、页脚、首页关于面板、数据来源声明会全部同步更新。

### 2. 换主色调（1 分钟）

编辑 `src/styles.css` 顶部的 `:root` 变量（`--primary` 主色、`--accent` 强调色、`--bg` 背景等），全站配色即换，无需改任何组件。

### 3. 换成本校数据

- **静态数据**：`src/data/` 下的校区、食堂、教室、题库等直接替换为本校内容；
- **动态数据**：本仓库的爬虫链路（`crawler/` + `scripts/snapshot.mjs`）面向「教务处公开栏目」设计——把 `crawler/config.py` 的抓取 URL 与 `crawler/parsers.py` / `server/parse_kcb.py` 的解析规则换成目标站点的页面结构即可；若暂无爬虫，也可以直接准备一份符合 `snapshot.json` schema 的静态文件放进 `public/data/`（schema 定义见 `tests/test_snapshot_schema.py`），站点即可离线工作。

### 4. 新增一个应用（3 步）

1. 在 `src/views/` 新建页面组件（可仿照任一现有应用；页面内统一通过 `emit('back')` 返回、`emit('open', appId)` 跳转其他应用）；
2. 在 `src/data/apps.js` 的 `apps` 数组追加一项 `{ id, title, desc, icon, color, group, link: '#/app/<id>' }`（首页网格与应用分类会自动出现）；
3. 在 `src/router.js` 的 `VIEWS` 注册表登记 `id → 组件`；如需出现在底部导航，再在 `NAV_APPS` 加一项。

完成。移除一个应用同理：删视图、删 `apps` 条目、删 `VIEWS` 登记即可。

### 5. 版本管理约定

- 版本号只维护在 `src/config/site.js` 的 `SITE.version`，页脚与「关于本站」自动展示；README 顶部的版本行请在发版时同步更新；
- 建议语义化版本：`1.x.y`（功能迭代）/ `2.x.y`（较大重构）。

## 关于与版权

- **网站开发者**：FJNU-Nav 团队
- **数据版权**：站内数据抓取自福建师范大学官网公开页面，版权归福建师范大学及相关版权方所有；本站仅聚合展示并在界面标注来源
- **用途**：本站为学习与校园生活便利而制作，内容仅供学习交流与实用参考，**不用于任何商业目的**
- 页面脚本均为本站原创（MIT 许可），但爬取的课程数据、通知、校历等文本版权归属原发布方

## 版本历史

| 版本 | 说明 |
| --- | --- |
| **v1.0.0** | **首版发布**。以福建师范大学公开数据打造的校园服务聚合入口：17 个应用全面移植（学校官网 / 校园动态 / 校历 / 教室导航 / 体测计算器 / 生活费计数器 / 新生学号 / 食堂空座率 / 今天吃什么 / 美食轮盘 / 福师大知多少 / 教学楼速配 / 校领导测试 / 课程表 / 数据洞察 / 贴吧舆情 / 贡献者墙）；福师大知多少题库重置（约 100 题校史知识）；校领导测试 10 位原型（历任校长/书记）；食堂空座率接入福Star「食堂人流量分析」实时数据（校园网环境）+ 静态快照双模式 + 档口菜单与菜价；教室导航按校训命名的知明楼/笃行楼/立诚楼/致广楼等；爬虫链路改造为福建师范大学教务处/贴吧/食堂数据源（Python 与 Node 双实现）；全局样式焕新为闽都红主题。验证：Python 单测 17/17、构建通过、本地网关全 API 冒烟通过（通知/动态/校历/食堂空座率/教室占用/空教室查询/课程查询）。 |

## 免责声明

非福建师范大学官方服务。数据来自学校公开渠道并定时抓取，仅供学习交流，请以学校官方最新通知为准；任何接入官方系统的自动化行为请遵守校规校纪与法律法规。