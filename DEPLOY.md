# 客户端上架部署清单 · FJNU-Nav

> 双端源码已就绪（`app-uniapp/` iOS、`mp-weixin/` 微信小程序）。以下是需要人工完成的项，按序照做即可。

## 一、微信小程序（约 15 分钟）

1. 打开 [mp.weixin.qq.com](https://mp.weixin.qq.com) →「小程序」注册（免费，需未注册过公众号的邮箱）→ 记录 **AppID**（开发 → 开发管理 → 开发设置）。
2. `mp-weixin/project.config.json`：把 `"appid"` 换成你的 AppID；**项目名/目录不动**。
3. 微信开发者工具 →「导入项目」选 `mp-weixin/` → 预览。
4. **request 合法域名**（mp 后台 → 开发设置 → 服务器域名），逐条填入：
   - `https://icyteacn.github.io`
   - `https://cdn.jsdelivr.net`
   - `https://raw.githubusercontent.com`
5. 上传 → mp 后台「版本管理」提交审核。类目建议「教育 > 教育信息服务」。

## 二、iOS App（uni-app，两条路线）

**路线 A · 零成本先用（推荐）**：HBuilderX 发行 → H5，产物传 GitHub Pages/任意静态托管，iOS 用户 Safari「添加到主屏幕」即为类原生体验。无需任何证书。

**路线 B · 正式 ipa**：需要 **Apple 开发者账号（$99/年，个人可注册）**：
1. [developer.apple.com](https://developer.apple.com) 付费注册 → 后台生成 **iOS 证书（p12）** 和 **描述文件（mobileprovision）**。
2. `app-uniapp/manifest.json`：填 **DCloud appid**（HBuilderX 登录 dcloud.net.cn 免费获取）+ 应用名称/版本。
3. HBuilderX → 发行 → 云打包 iOS → 上传 p12 与描述文件 → 得 ipa。
4. 上架 App Store 走 App Store Connect；或 TestFlight 内测分发（免上架审核）。

## 三、后端（可选，默认关闭）

`backend-options/` 四套方案均已内置代码；启用时按对应 README 配置——所有写凭据只存本机，**绝不提交仓库**。

---
*客户端基建记录见 `AGENTS.md` 更新日志 2026-11-09 条目。*
