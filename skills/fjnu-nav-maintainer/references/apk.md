# APK 打包与签名

课表 App（`com.feike.schedule`），Capacitor 5 打包的单页 WebView，主体是 `public/standalone-schedule.html`。

## 版本号单一事实来源链

```
package.json 的 apkVersion  ← 唯一维护点
   ├─ scripts/gen-schedule-data.mjs 读它 → schedule-data.json 的 appVersion（网页/检测更新比对用）
   ├─ android/app/build.gradle versionName 由 gradle 正则读同一文件（回退值同步）
   └─ standalone-schedule.html 的 APP_VERSION 手动同步（改版本时三处对齐）
```

- `versionName` **不影响覆盖安装**；覆盖条件是**证书一致 + `versionCode` ≥ 已装**。
- CI 构建前会 `rm -rf android`，所以版本**不能**只写在 `build.gradle`（历史上因此回退成 1.0 导致检测更新误报）。

## 签名（覆盖安装的关键）

- **可覆盖钥匙**：`%USERPROFILE%\.android\cover-debug.keystore`（**仓库外，绝不入库**），SHA-256 指纹 `2277d0655b73f4c1...`，与用户手机已装 1.0 同证书。
- `scripts/build-apk.bat` 已内置探测：该 keystore 存在则**默认用它签名**，否则回退仓库内 `keystore.jks`（⚠ 那把的指纹 `6b38568d` 与手机不一致，签出来无法覆盖）。
- 手动换钥匙：`gradlew assembleRelease -PksPath=<路径> -PksAlias=androiddebugkey -PksPass=android`。
- 验证签名：`apksigner verify --print-certs app.apk` 比对指纹；`aapt dump badging` 看 `versionCode/versionName`。
- 私钥不可伪造/破解；若指纹对不上，唯一正路是找回原 keystore（密码恒 `android`、alias `androiddebugkey`）或卸载重装一次（先「📤 导出数据」备份）。

## 打包流程

```bat
scripts\build-apk.bat
```

- **`JAVA_HOME` 必须指向 JDK 17**（本机默认 JAVA_HOME 常指 JDK8，会让 AGP 8 挂掉）。
- 前置：`npm run build` 且 `npm install` 完整（缺 `@capacitor/filesystem` 等插件会被 `cap sync` 从 gradle 清掉，导致 notify.json 写不进、通知降级——v1.6.8 踩过的坑）。
- `scripts/trim-apk-assets.mjs` 白名单裁剪 assets：只留 `standalone-schedule.html` + `data/schedule-data.json`（离线兜底），包体约 1MB。
- 出包位置与下载入口：`public/dist` 的 APK 副本，改完核对 SHA256 与构建产物一致。

## 数据更新 vs APK 更新（别混淆）

- **改课表/调课数据不需要重打包**：APK 启动即拉线上 `schedule-data.json`（四级回退：线上接口 → 包内 → localStorage 缓存 → 内置），推送部署后自动同步。
- **只有改 App 功能/原生代码才需要**：打包 → 验证签名/版本 → 替换下载入口 → `package.json.apkVersion` 升版。
- 「🔄 检测更新」按钮逻辑：`isNewer()` 数值逐段比对 `appVersion`（站点 vs 本机），站点不比本机新一律显示「本机已是最新」（防误报）；课表数据的更新靠启动时自动同步，不依赖按钮。

## 打包后验证清单

```bash
aapt dump badging app.apk | findstr version        # versionCode / versionName 符合预期
apksigner verify --print-certs app.apk             # 指纹 = 2277d065...（可覆盖）
# 包体 ~1MB；下载入口副本 SHA256 与构建产物一致
```
