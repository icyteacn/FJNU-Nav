# 福star课表 · iOS App（uni-app）

> 本目录是 **uni-app 源码**，用于 HBuilderX 云打包生成 iOS 安装包。
> 与 `mp-weixin/`（微信小程序原生端）完全独立，互不引用。

## 功能

- **课程表**：专业选择（记忆）· 周切换 · 周网格视图 · 课程详情
- **日程活动**：官方日程/准备清单/受众标记（schedule-data.json 的 events）
- **导航首页**：应用网格，未内置功能复制网页版链接
- **数据同步**：与福star导航网站同一份 `data/schedule-data.json`，
  Pages → jsDelivr → raw 三源依次尝试，离线回落本地缓存

## 数据接口

```
https://icyteacn.github.io/FJNU-Nav/data/schedule-data.json
https://cdn.jsdelivr.net/gh/icyteacn/FJNU-Nav@main/public/data/schedule-data.json
https://raw.githubusercontent.com/icyteacn/FJNU-Nav/main/public/data/schedule-data.json
```

`schedule-data.json` 由网站构建生成（`src/data/classSchedule.js` 唯一数据源），
网站改课表 → 重新 build → App 下次启动自动同步，**无需重新打包**。

## iOS 打包（HBuilderX 云打包）

1. HBuilderX → 文件 → 打开目录 → 选本目录 `app-uniapp/`
2. `manifest.json`：
   - 基础配置填 DCloud appid（登录后即有一键获取）
   - App 图标配置填 `static/icon.png`
   - iOS 证书：填 Apple 开发者 p12 + mobileprovision（个人开发者账号 $99/年，
     或用「爱思助手签名免费版」自签安装，7 天有效）
3. 菜单 发行 → 原生App-云打包 → iOS → 打包生成 .ipa
4. 安装：爱思助手 / AltStore / TestFlight / Apple Configurator

## 注意

- 不使用 `#ifdef` 条件编译，本目录不写小程序特有语法
- `static/icon.png` 需自行放入 1024×1024 图标
- 网络请求走 `uni.request`，存储走 `uni.getStorageSync`
