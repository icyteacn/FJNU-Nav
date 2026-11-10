# 客户端上架部署清单 · FJNU-Nav

> 双端源码已就绪（`app-uniapp/` iOS、`mp-weixin/` 微信小程序）。以下是需要人工完成的项，按序照做即可。

## 一、微信小程序（约 15 分钟）

1. 打开 [mp.weixin.qq.com](https://mp.weixin.qq.com) →「小程序」注册（免费，需未注册过公众号的邮箱）→ 记录 **AppID**（开发 → 开发管理 → 开发设置）。
2. `mp-weixin/project.config.json`："appid" 已填 `wx313c28f3fdf79289`（如需换小程序账号再改）；**项目名/目录不动**。
3. 微信开发者工具 →「导入项目」选 `mp-weixin/` → 预览。
4. **request 合法域名**（mp 后台 → 开发设置 → 服务器域名），逐条填入：
   - `https://icyteacn.github.io`
   - `https://cdn.jsdelivr.net`
   - `https://raw.githubusercontent.com`
5. 上传 → mp 后台「版本管理」提交审核。类目建议「教育 > 教育信息服务」。

## 二、iOS App —— 已完成（H5 免费路线）

uni-app 工程已补齐 CLI 构建体系（`package.json` + `vite.config.js` + `index.html` + `scripts/`）。
**H5 产物已构建并铺进 `public/app/`**，随站点 Pages 流水线自动上线：

- iOS 使用：Safari 打开 **https://icyteacn.github.io/FJNU-Nav/app/** → 分享 →「添加到主屏幕」即类原生 App（图标、独立窗口、安全区适配）。
- 重新构建：`cd app-uniapp && npm install && npm run build:h5`（产物 `dist/` 已拷入 `public/app/`）。
- 本地预览：`npm run dev:h5` → http://localhost:5173
- 上架 App Store 才需 Apple 开发者 $99/年（路线 B，暂不启用）。

## 三、后端（可选，默认关闭）

`backend-options/` 四套方案均已内置代码；启用时按对应 README 配置——所有写凭据只存本机，**绝不提交仓库**。

---
*客户端基建记录见 `AGENTS.md` 更新日志 2026-11-09 条目。*
