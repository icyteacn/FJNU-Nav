# 架构速览与数据链路

改动前先在下表定位自己的修改点，避免碰错层级。

## 架构速览

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 应用注册 | `src/data/apps.js` | 首页应用网格的唯一来源 |
| 路由注册 | `src/router.js` | 应用 id → 视图组件的映射（**新增页面必须双登记**） |
| 站点配置 | `src/config/site.js` | 站点名 / 副标题 / 版本号（**版本号唯一维护点**） |
| 视图 | `src/views/*.vue` | 各应用页面 |
| 静态数据 | `src/data/*.js` | 校历、食堂、学院官网、题库、课表、配置等前端内置数据 |
| 课表数据源 | `src/data/classSchedule.js` | 课程 + `HOLIDAY_MAP` 调课/节假 **唯一数据源**（详见 schedule-adjust.md） |
| 数据抓取（Python 首选） | `crawler/` | `fetcher.py` 抓取 / `parsers.py` 解析 / `build_snapshot.py` 快照 / `analysis.py` 洞察 / `canteen.py` 食堂 / `tieba.py` 贴吧 / `validate.py` 校验 / `diff.py` 差异摘要 / `make_baseline.py` 离线基线 |
| 数据抓取（Node 回退） | `scripts/snapshot.mjs`、`scripts/tieba.mjs`、`scripts/canteen.mjs` | 与 Python 版输出格式一致 |
| 静态产物 | `public/data/*.json` | `snapshot.json`、`course_stats.json`、`tieba_stats.json`、`canteen_live.json`（由 CI 提交）、`schedule-data.json`（build 自动生成） |
| 定时任务 | `.github/workflows/snapshot.yml` | 定时抓取并自动提交；`deploy.yml` 构建部署 |
| 单测脚手架 | `scripts/harness.mjs` | localStorage 内存 mock + ok/okAsync，四套单测唯一来源（防脚手架漂移） |
| 门禁 | `scripts/e2e-integrity.mjs` | 发布完整性检查（无浏览器），CI 在 `npm run build` 后实跑 |

## 数据链路（新增数据源时照此办理）

1. 在 `crawler/` 新增抓取/解析脚本（requests 优先、标准库回退；保持 `scripts/` 有 Node 回退）。
2. 在 `.github/workflows/snapshot.yml` 的 crawl job 中加入步骤，并在 `git add` 中登记产物文件。
3. 前端在 `src/views/` 下新建视图，在 `apps.js` + `router.js` 双登记。
4. 抓取应「尽力而为」：失败不覆盖上一次成功数据、不阻塞整体提交（参见 `crawler/tieba.py` 的处理方式）。
5. 静态数据文件必须能被 404 优雅降级（前端做好空态），因为首次部署前产物文件可能不存在。

## 项目定位（改动时的边界参考）

- 纯静态校园导航单页应用：Vite + Vue 3（Composition API）+ 无后端，托管于 GitHub Pages。
- 数据策略：**「优先抓实时、回退用快照」**——有 server 网关时请求实时接口，纯静态托管下读 `public/data/` 快照。
- GitHub Actions `snapshot.yml` 定时抓教务处公开数据并自动提交，「数据洞察 / 贴吧舆情 / 食堂空座率」依赖该产物。
