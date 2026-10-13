# 发布流程：维护清单 8 步

每次改动必须按序执行，全部走完才算一次完整发布。

1. **改完跑 Python 单测**：`python -m unittest discover -s tests`（解析器/构建器改动必须补单测）。
2. **前端构建**：`npm run build`，确认无报错、JS 体积合理。
   - 构建会自动链跑 `scripts/gen-schedule-data.mjs`（课表接口）与 `scripts/postbuild.mjs`。
3. **回归**：`node scripts/e2e-integrity.mjs`（18 项门禁，退出码 0 才可发布）；有 CDP 回归基线时按 AGENTS.md 记录的路径跑真机断言。
   - 本地服务默认端口 **8788**（`node server/index.mjs`）。
4. **更新 README**：功能表 / 数据来源 / 版权说明如有变化需同步；**版本历史追加一行**；头部「当前版本」行同步。
5. **更新贡献者墙**：`Contributors.vue` 的「社区贡献记录 / 版本历史」追加一条新版本简介（与 README 版本历史同步），这是每次版本更新的固定动作。
6. **更新版本号**：按 `x.y.z`——小更新（bug 修复 / 文案 / 维护性改动）只加 z（如 1.6.8→1.6.9）；功能迭代 / 新功能加 y 并归零 z。**版本号只在 `src/config/site.js` 维护。**
7. **追加 `AGENTS.md` 更新日志**：表格新增一行（日期 | 版本 | 内容），写清楚改了什么、为什么、验证结果——这是跨会话接续上下文的唯一途径，漏写等于丢历史。
8. **提交并推送**：commit message 用 `feat:` / `fix:` / `data:` 前缀；**push 前先 `git fetch`** 处理定时任务的自动提交（需要时 rebase）；**推送一律 `git push origin`**。

## 常用验证命令速查

```bash
npm run build                      # 构建（含课表接口生成）
node scripts/e2e-integrity.mjs     # 发布门禁 18 项
node scripts/unit-agent.mjs        # 智能体单测
node scripts/unit-grow.mjs         # 成长体系单测
node scripts/unit-im.mjs           # 私信单测
node scripts/unit-wall.mjs          # 校园墙单测
python -m unittest discover -s tests   # 爬虫/解析器单测（本机用 py -3.13）
node server/index.mjs              # 本地网关，端口 8788
```

四套 node 单测全绿基线：unit-agent 24 + unit-grow 51 + unit-im 53 + unit-wall 47 = 175。

## 发布后的固定认知

- 推送 `main` 即触发 GitHub Actions 自动构建部署到 GitHub Pages（约 1-2 分钟生效）。
- 课表类数据改动**不需要重新打 APK**：线上 `schedule-data.json` 的内容哈希 version 变化后，APK 下次打开/点检测更新即自动同步（详见 schedule-adjust.md）。
