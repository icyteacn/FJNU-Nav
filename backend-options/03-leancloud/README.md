# 方案 03：LeanCloud（国内直达）

**价格**：开发版免费（API 3万次/天），商用 ¥30+/月；导航站用量开发版足够。
**国内可达性**：✅ 自有节点，免梯子。

## 部署

1. 注册 leancloud.cn → 创建应用 → 记 `AppID` / `AppKey` / REST 域名（`xxx.lc-cn-n1-shared.com`）
2. 控制台建 Class `DynDoc`，字段：`key`(String) / `data`(Object)
3. Class 权限：读 = 所有用户；写 = 仅指定用户/关闭客户端写，只走 REST+MasterKey 或控制台

## 前端接入

```js
configure({
  type: 'leancloud', base: 'https://xxx.lc-cn-n1-shared.com',
  appId: 'APP_ID', appKey: 'APP_KEY', class: 'DynDoc',
});
await pull('announcements');
```

## 权限提醒

- AppKey 进前端代码即等于公开——**写权限必须在 LeanCloud 侧用 ACL/Class 权限收紧**，
  或写操作只通过服务端/控制台完成。建议：客户端只读，运营写走控制台或自建脚本（MasterKey 不下发）。
- 小程序 request 域名加 REST 域名。
