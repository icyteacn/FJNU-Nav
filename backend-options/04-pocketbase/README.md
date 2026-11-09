# 方案 04：PocketBase + 免费 VPS（自建真后端）

**价格**：Oracle Cloud Always Free ARM VPS（0 元/月，4C24G）+ PocketBase 单二进制。
**适合**：想要账号体系、管理后台、关系型数据的场景。

## 部署

```bash
# Oracle 控制台开 Ubuntu ARM 实例后：
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.x/pb.zip && unzip pb.zip
./pocketbase serve --http 0.0.0.0:8090   # 建议挂 systemd + Caddy/Nginx 反代 HTTPS
```

建 collection `dyn_docs`：`key`(text, unique) / `data`(json)。
规则：`list/view = ""`（公开读），`create/update/delete = @request.auth.id != ""`（仅管理员）。

## 前端接入

```js
configure({ type:'pocketbase', base:'https://pb.example.com', collection:'dyn_docs' });
await pull('announcements');
// 管理端先 POST /api/collections/users/auth-with-password 拿 token 再 push
```

## 权限

- 公开读，写需登录（PocketBase 规则引擎强制）。admin UI 在 `/ _/` 路径。
- 数据自持有 SQLite 单文件，备份=拷文件。
