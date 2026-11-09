# FJNU-Nav 后端备选方案（预置 · 未启用）

> 本站当前是纯前端 + GitHub Pages 静态托管 + `public/data/` 快照，**保持现状即可**。
> 本目录是「哪天需要动态后端时直接取用」的备选方案，**全部默认关闭**，不影响现有前端。

## 统一抽象

全站动态数据抽象为「一组 JSON 文档」：`announcements`（公告）、`events`（日程）、
`schedule-extras`（课表补充）、`settings`（运营配置）。
所有方案共享同一接口：

```js
pull(key)          // → { data, rev } | null   拉取文档
push(key, data)    // → boolean                写文档（仅运营/管理员持有写凭据）
```

- `shared/cloud-sync.js` —— Web / uni-app 通用（ESM，fetch）
- `shared/cloud-sync.mp.js` —— 微信小程序专用（CJS，wx.request）

## 方案矩阵

| # | 方案 | 免费额度 | 国内可达 | 适用 |
| --- | --- | --- | --- | --- |
| 01 | GitHub 仓内 JSON 文件 | 完全免费 | ⚠️ 需代理写，jsDelivr 读 | 数据低频更新，最省事 |
| 02 | Cloudflare Workers + KV | 10万请求/日 | ✅ 多数可通 | 公告/日程实时读写 |
| 03 | LeanCloud | 开发版免费 | ✅ 直达 | 想要控制台 + 国内稳定 |
| 04 | PocketBase + Oracle VPS | 永久免费 ARM | ✅ 自建 | 要真数据库/账号体系 |

## 权限模型（三项目通用）

- **读**：公开（JSON 文档无敏感信息）
- **写**：仅运营者持有凭据（token/AK）——存本机 localStorage 或 CI Secret，
  **绝不进代码、不进仓库、不进小程序包**（小程序包可被反编译！）
- 小程序端默认只读；写操作只给管理端 Web 做

## 启用步骤（通用）

1. 选一套方案，按对应子目录 README 部署
2. 在站点前端引入 `shared/cloud-sync.js`，`configure({type, base, ...})` 填 endpoint
3. 页面启动 `pull('announcements')` 合并进现有数据流；管理页 `push` 前做本地口令门
4. 写凭据仅进 `localStorage` / CI Secret，永不提交

价格细节见各子目录 README。
