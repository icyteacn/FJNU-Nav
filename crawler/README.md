# FJNU-Nav 爬虫（Python）

本目录提供将「FJNU 校园导航」数据对接福建师范大学**公开页面**的爬虫工具，**优先 requests / 标准库回退**，零安装成本，CI 与本地均可直接运行。

## 模块职责

| 文件 | 职责 |
| --- | --- |
| `config.py` | 数据源地址、抓取参数、输出路径 |
| `fetcher.py` | 通用抓取（文本/二进制，带超时与重试；优先 requests 规避学校 TLS 兼容问题） |
| `parsers.py` | 正方 Sudy 页面结构解析（通知/动态/校历列表、多页合并去重） |
| `build_snapshot.py` | **快照构建器（定时任务首选入口）**：抓取通知、工作动态、教学日历 + 尽力抓取课程总表，生成 `public/data/snapshot.json` |
| `validate.py` | 快照质量校验（schema/数量/一致性），CI 质量门禁 |
| `analysis.py` | 课程数据洞察：从排课聚合统计，生成 `public/data/course_stats.json` |
| `canteen.py` | 食堂空座率抓取（福Star「食堂人流量分析」，校园网环境），生成 `public/data/canteen_live.json` |
| `tieba.py` | 贴吧舆情抓取（福建师范大学吧），生成 `public/data/tieba_stats.json` |
| `diff.py` | 快照差异摘要，对比上次快照输出变更（写入 CI 提交信息） |
| `split_snapshot.py` | 按学期拆分排课数据（`timetable_meta.json` + `terms/*.json`，加速课程表加载） |
| `make_baseline.py` | 生成基于真实数据的离线基线快照（无网环境兜底） |
| `fjnu_crawler.py` | 公开公告 / 校历图片抓取（工具，演示用法） |

## 使用

```bash
# 生成快照（定时任务可选用 Python 或 Node 版）
python crawler/build_snapshot.py

# 校验快照（错误退出码 = 校验不通过）
python crawler/validate.py

# 课程数据洞察
python crawler/analysis.py

# 食堂空座率快照（校园网环境，校外失败保留旧数据）
python crawler/canteen.py

# 单元测试（解析器 / schema / xlsx 解析 / 公开抓取）
python -m unittest discover -s tests

# 公开抓取演示
python crawler/fjnu_crawler.py --source jwc --out output/announcements.json
python crawler/fjnu_crawler.py --calendar
```

## 与 Node 版的关系

`scripts/snapshot.mjs` / `scripts/canteen.mjs` / `scripts/tieba.mjs` 为等价实现，输出格式完全一致。CI 优先使用 Python 版，失败自动回退 Node 版。

## 数据来源

全部来自福建师范大学官网公开页面（`https://jwc.fjnu.edu.cn` 教务处、`https://zsb.fjnu.edu.cn` 招生网）。本站**不抓取任何需要账号的个人数据**；早期「正方教务模拟登录」示例因合规与安全原因已移除。福师大教务系统（`jwglxt.fjnu.edu.cn`）需统一身份登录，课程总表如无公开附件则如实降级为空态，绝不捏造。