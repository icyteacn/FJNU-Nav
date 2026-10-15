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

---

## 附：APK 1.3（versionCode 5）新增能力与验证（2026-10-15）

### 新增能力
| 能力 | 落点 | 说明 |
| --- | --- | --- |
| 静态 App Shortcuts | `res/xml/shortcuts.xml` + `AndroidManifest.xml` 的 `android.app.shortcuts` meta-data | 长按桌面图标直达「今日 / 下一节课 / 课表」三项；走自定义 action `com.feike.schedule.OPEN_VIEW` + extra `view` |
| 深链入口 | `MainActivity.extractView/consumePendingView` | 读 extra/Uri → `getBridge().getServerUrl() + "/index.html?view=xxx"`；`trim-apk-assets` 的 index 垫片保留 `location.search` 转发到单文件课表 |
| 网页端视图切换 | `public/standalone-schedule.html` 的 `applyDeepLink()` | `?view=today` 切单日列表（按今天定位）/ `week` 回周课表 / `next` 滚到「下一节课」卡片；非法参数静默忽略 |
| 2x2「下一节课」小组件 | `ScheduleWidgetProviderNext.java` + `res/layout/schedule_widget_next.xml` + `res/xml/schedule_widget_info_next.xml` | 与 4x2 组件**同源数据**（`notify.json` → `ScheduleNotifier.widgetSnapshot` 三行快照），版式改为竖排、课程名与倒计时加粗；点击打开应用 |
| 精确闹钟权限 | `USE_EXACT_ALARM` | Android 13+ 日历/闹钟类应用可直接用精确闹钟（无需用户手动开开关），配合既有 `SCHEDULE_EXACT_ALARM`，课前提醒更可靠 |

### 构建环境的坑（已修，但请记住）
- **`JAVA_HOME` 必须指向 JDK 17**：AGP 8 在 JDK 8 上会报一个很绕的错误
  （`Could not resolve com.android.tools.build:gradle:8.0.0 … compatible with Java 8`）。
  原 `build-apk.bat` 只在「路径不存在」时才回退 JDK17——本机 `JAVA_HOME=E:\G\JDK1.8` 是存在的，
  于是**不会回退**、构建必失败。现脚本改为**优先选用 `C:\Program Files\Java\jdk-17.0.10`**（存在即用）。
- **脚本曾无论成败都打印 `[OK]`**：gradle 失败时也会走到结尾提示，容易把旧 APK 当新包发出。
  现已在 gradle 之后传播 `errorlevel`，失败即 `exit /b 1` 并提示 JAVA_HOME 需为 JDK 17。
- 本机 `aapt` 读不了含中文的仓库路径（`Illegal byte sequence`）——验证 APK 时先把它复制到纯 ASCII 路径再 dump。

### 验证命令（本机实测通过）
```powershell
# 1) 打包（脚本自动选 JDK17、自动检测可覆盖签名钥匙）
scripts\build-apk.bat

# 2) 把产物复制到 ASCII 路径后核验
copy android\app\build\outputs\apk\release\app-release.apk %TEMP%\check.apk
"%LOCALAPPDATA%\Android\Sdk\build-tools\35.0.0\aapt.exe" dump badging %TEMP%\check.apk
#   期望：package name='com.feike.schedule' versionCode='5' versionName='1.3'
#         uses-permission … USE_EXACT_ALARM / SCHEDULE_EXACT_ALARM
"%LOCALAPPDATA%\Android\Sdk\build-tools\35.0.0\aapt.exe" dump xmltree %TEMP%\check.apk AndroidManifest.xml
#   期望：android.app.shortcuts / ScheduleWidgetProviderNext / 两个 appwidget.provider meta-data
"%LOCALAPPDATA%\Android\Sdk\build-tools\35.0.0\apksigner.bat" verify --print-certs %TEMP%\check.apk
#   期望：Signer #1 … SHA-256 2277d065…4c4b（可覆盖用户已装版本）

# 3) 网页层回归（无需真机）
node scripts/e2e-standalone.mjs      # 8 项：初始化/周表/?view=today|week|next/非法深链/脏存储/零异常
```

### 发布收尾（沿用既有纪律）
1. 版本三处同步：`package.json.apkVersion` = 单文件 `APP_VERSION` = 接口产物 `appVersion`
   （`node scripts/test_schedule.mjs` 会断言三者一致）；`build.gradle` 的 `versionCode` 递增。
2. 覆盖 `public/downloads/feike-schedule.apk` 与 `releases/feike-schedule.apk`，两者 SHA256 必须一致。
3. 首页 APK 卡片文案与 README 的版本/体积说明同步。
