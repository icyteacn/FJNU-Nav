# 福star课表 · 微信小程序（原生）

> 本目录是 **微信小程序原生源码**（WXML/WXSS/JS/JSON），与 `app-uniapp/` 完全独立。

## 功能

首页 38 应用导航网格 / 课程表（与 `mp-schedule/` 同款完整实现：白底课程卡、停课/调课列、列表模式、时间轴、编辑覆盖层、秒级倒计时）/ 课程搜索 / 日程活动 / 我的（课表设置+联动入口+导入导出）。

## 导入开发

1. 微信开发者工具 → 导入项目 → 选本目录 `mp-weixin/`
2. `project.config.json` 的 `appid` 换成自己的小程序 AppID（测试号可用 touristappid）
3. 编译预览

## 上架必配

- **request 合法域名**（mp 后台 → 开发管理 → 服务器域名）：
  ```
  https://icyteacn.github.io
  https://cdn.jsdelivr.net
  https://raw.githubusercontent.com
  ```
  不配则课表拉不到数据（开发期可勾「不校验合法域名」跳过）。
- 类目建议：教育 → 教育信息服务
- 隐私协议：本程序不收集个人信息（仅本地缓存课表数据），如实勾选即可

## 数据

与福star导航同一份 `data/schedule-data.json`，网站更新后小程序启动自动同步。
