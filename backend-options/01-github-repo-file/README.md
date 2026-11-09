# 方案 01：GitHub 仓内 JSON 文件

**价格**：完全免费（含在现有 GitHub Pages 托管内）。

## 原理

动态文档存仓内 `data/dynamic/*.json`：读走 jsDelivr/raw（公开免凭据），
写走 Contents API（需 PAT）或直接网页编辑提交。每次写入都有 git 版本史，可回滚。

## 启用步骤

1. 仓内建 `data/dynamic/` 目录，放初始文件（如 `announcements.json`）
2. 前端：
   ```js
   import { configure, pull } from '../backend-options/shared/cloud-sync.js';
   configure({ type: 'github', repo: 'IceofTea/FJNU-Nav', branch: 'main', dir: 'data/dynamic' });
   const doc = await pull('announcements');   // → { data, rev } | null
   ```
3. 写（仅管理端 Web，需 PAT 存本机 localStorage，key 如 `nav_gh_token`）：
   ```js
   configure({ type:'github', repo:'IceofTea/FJNU-Nav', token: localStorage.nav_gh_token });
   await push('announcements', data);
   ```
4. 无 token 时退化：复制 JSON → 打开
   `https://github.com/<repo>/edit/main/data/dynamic/announcements.json` 粘贴提交。

## 权限

- 读：公开。写：PAT 持有者是仓库 collaborator（GitHub ACL 强制）。
- **小程序端只读**（request 域名加 `cdn.jsdelivr.net`）；不要在小程序包内放 token。

## 注意

- jsDelivr 有 CDN 缓存（分钟级）；写后实时性要求高时读 raw + `?t=`。
- 并发写无乐观锁——单人运营足够；多人写建议换方案 02/03。
