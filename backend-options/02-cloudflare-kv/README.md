# 方案 02：Cloudflare Workers + KV

**价格**：免费档 10 万请求/天、KV 1GB 存储 / 10 万次读·1000 次写每天——导航站用量零成本。
**国内可达性**：`*.workers.dev` 多数地区可通；要稳可绑自有域名。

## 部署

```bash
cd backend-options/02-cloudflare-kv
npx wrangler login
npx wrangler kv namespace create NAV_DOCS   # 把 id 填进 wrangler.toml
npx wrangler secret put WRITE_TOKEN         # 输入写口令（服务端校验，不进前端代码）
npx wrangler deploy                         # 得到 https://fjnu-nav-docs.<sub>.workers.dev
```

## 前端接入

```js
configure({ type: 'cfkv', base: 'https://fjnu-nav-docs.<sub>.workers.dev' });
await pull('announcements');
// 管理端写：
configure({ type:'cfkv', base:'…', token: localStorage.nav_write_token });
await push('announcements', data);
```

## 权限

- 读公开；写需 `X-Write-Token` 与 Worker 环境变量 `WRITE_TOKEN` 一致（服务端强制）。
- 小程序 request 域名加 `https://fjnu-nav-docs.<sub>.workers.dev`。

## 扩展

多文档类型直接换 `:key`（announcements / events / schedule-extras）。
要历史版本可在 PUT 时同时写 `${key}-history/${Date.now()}`。
