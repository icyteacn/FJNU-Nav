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

## 1.3 组件与深链（versionCode 9 / versionName 1.3）

| 能力 | 实现 | 说明 |
|---|---|---|
| 桌面组件 ×2 | `ScheduleWidgetProviderNext`(2x2「下一节课」) · `ScheduleWidgetProviderToday`(1x1「今日」) | 两套**共用** `ScheduleNotifier.widgetDashboard()` 的 14 槽位数据面板 |
| 组件信息量 | 日期 / 状态徽章 / 课程 / 教室·节次 / 倒计时 / 今日进度 / 进度条 | 2x2 以倒计时为主角；1x1 只放「状态 + 一句最短结论」 |
| 共用渲染工具 | `WidgetKit.applyBadge()` | 徽章换色逻辑从这里走（原先挂在已移除的 4x2 组件上） |
| 状态徽章 | 正在上课=绿 `badge_live` / 下一节=金 `badge_next` / 假期=蓝 `badge_holiday` / 空闲=灰 `badge_idle` | 用 `rv.setInt(id,"setBackgroundResource",res)` 反射换底色 |
| 长按快捷方式 | `res/xml/shortcuts.xml` 三个静态 shortcut（today/next/week） | 显式 intent + extra `view` |
| 深链跳转 | `MainActivity.buildViewUrl()` + `consumePendingView()` | base 规范化→拿不到就退回相对 URL；延迟 400ms 跳 + 1200ms 兜底重试；日志 tag `FeikeSchedule` |

**改动组件时必须同步的三处**：
1. `ScheduleNotifier.widgetDashboard()` 的槽位常量（`W_DATE`…`W_SHORT`，顺序即下标）
2. 两个 `layout/schedule_widget_{next,today}.xml` 的 view id
3. 对应 Provider 里的 `setTextViewText` / `setProgressBar` 调用

**⚠️ 4x2 课表组件已按要求移除**（versionCode 9）：它在部分桌面「一添加就失败」，
用户实测反复无法添加，故只保留 2x2 与 1x1。移除时注意 `applyBadge` 被另两个组件复用，
已迁到 `WidgetKit.java`——**不要再把共用逻辑挂在某个具体组件类上**，否则删组件会带崩其余组件。
若要重新加回，务必先在两三种国产桌面（MIUI/ColorOS/EMUI）实测「能否添加」，而不是只看编译通过。

**网页侧数据源**：`notify.json`（由 `standalone-schedule.html` 的 `buildNotifySummary()` 写）。
native 组件**完全依赖**它，因此改网页字段时要一并想好 native 有没有消费；新增字段记得在
`buildNotifySummary()` 的 `base` 初始对象里也声明（holiday 分支会提前 return）。

**已知坑**：
- `RemoteViews` 没有 `setBackgroundResource` 直调方法，必须 `setInt(viewId,"setBackgroundResource",res)`；
- Java 字符串里写 `\p{...}` 正则要双层转义，写在 Python heredoc 里极易丢一层 —— 优先用字符类判断代替正则；
- release 构建资源名会被混淆成短名，`aapt list` 查不到 `badge_xxx` 属正常，编译通过即代表资源有效。
### 深链踩坑（1.3 实测两连坑，务必别走回头路）

1. **WebView 深链必须给绝对 URL**。`web.loadUrl("standalone-schedule.html?view=week")` 不会按当前页解析，
   它把 `standalone-schedule.html` 当成**主机名**并补 `http://` → `http://standalone-schedule.html/?view=week`
   → Android 9+ 报 `net::ERR_CLEARTEXT_NOT_PERMITTED`（Capacitor 只对 localhost 放行明文）。
   正确做法：origin 取自 `web.getUrl()`（此刻必为 `https://localhost`），拼
   `origin + "/standalone-schedule.html?view=" + v`；拿不到 origin 就递归重试，跳转后再校验一次。
2. **cmd 的 `if (...)` 块内不能有未转义括号**。块内写 `echo ... JDK 17 (AGP 8 requires it).` 会让 cmd
   在解析阶段把 `)` 当成块结束，剩下的 `.` 变成意外符号 → 无论条件真假都打印「此时不应有 .」，
   且块后的 `echo [OK]` 被整体跳过（表现为"打包成功但脚本报错、看不到 [OK]"）。
   规避：块内文案不要用圆括号，或写成 `^(` `^)`。

### 排查快捷方式的命令

```
adb logcat -s FeikeSchedule     # 深链会打印 "deep link -> https://localhost/standalone-schedule.html?view=week (attempt 0)"
adb shell am start -n com.feike.schedule/.MainActivity -e view week   # 直接模拟快捷方式
```
### 1.3 稳健性清单（审计后补齐，改动 APK 时对照检查）

| 面 | 现状 | 要点 |
|---|---|---|
| 系统事件恢复 | Manifest `ScheduleNotifier$Boot` 监听 BOOT_COMPLETED / TIME_SET / TIMEZONE_CHANGED / DATE_CHANGED / MY_PACKAGE_REPLACED / LOCALE_CHANGED | **升级 APK 后闹钟会丢**，必须靠 MY_PACKAGE_REPLACED 恢复；`onReceive` 里不要再用 if 限定单一 action |
| 返回键 | `MainActivity.onBackPressed` + 页面 `window.__feikeBack()` | 弹层→关；单日视图→回周课表；否则退出。evaluateJavascript 是异步的，**不要调 super** |
| 通知按钮 | 常驻通知「今日/周课表」、课前提醒「看课表/下一节」 | 走 `launchIntentView()` 深链，深链坏了按钮就是死键 |
| 动态快捷方式 | `ScheduleNotifier.syncNextShortcut()`（id `next_live`） | 不能与静态 shortcuts.xml 的 id 重复；API 25+ |
| 电池白名单 | JS 桥 `FeikeNative`（isIgnoringBattery/openBatterySettings/apkVersion） | 只跳系统设置列表页，**不申请** REQUEST_IGNORE_BATTERY_OPTIMIZATIONS（Play 政策风险） |
| 权限 | 仅 INTERNET / POST_NOTIFICATIONS / RECEIVE_BOOT_COMPLETED / SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM | 外部存储权限已删（零引用）；`requestLegacyExternalStorage` 在 targetSdk 33 无效已删 |
| 不动的点 | allowBackup=true 保留（换机恢复有价值）；Capacitor 自带 WebView 错误页；外链默认走系统浏览器；精确闹钟已有 canScheduleExactAlarms 回退 | 审计结论，别重复加功能 |

**JS 桥测试要点**：页面里 `window.FeikeNative` 在真机才存在，e2e 通过注入假对象验证；
电池引导条**故意延迟 1.5s** 弹出，断言要等够时间。

## APK 下载量计数（v1.7.15 起）

**为什么不能沿用网页统计**：GitHub Pages 是纯静态托管，`public/downloads/feike-schedule.apk`
被点了多少次**服务端无从记录**（busuanzi/Vercount 只管页面 PV/UV，管不到文件下载）。
所以改用 **GitHub Releases 的 asset `download_count`**：真实、免费、无额度、公开 API 可读。

### 关键设计（改之前先读懂，否则容易把下载搞坏）

| 规则 | 原因 |
|---|---|
| **优先按内容哈希识别**：asset 的 `digest`(sha256) 与构建时算出的本地包哈希一致即认定为当前包（**与文件名无关**，手动上传随便改名都认得） | 靠文件名匹配太脆：实测手动上传得到的是 `feike-schedule.apk`，按名字找不到 |
| digest 存在但**不一致** → 坚决不认，回退本地下载 | 防止把旧包当新版发出去 |
| 没有 digest 时才退化为文件名匹配（要求 `feike-schedule-<apkVersion>.apk`） | 兼容旧 API 行为 |
| 找不到匹配版本 → 回退 `downloads/feike-schedule.apk` | 保证永不 404 |
| 读取失败（403 限流 / 断网）→ 静默降级，不显示次数 | 计数不能影响下载与首屏 |
| 结果缓存 10 分钟 | GitHub 未认证 API 限流 60 次/时/IP，校园网共用出口极易打满 |
| asset 文件名必须带版本号 | 前端靠文件名判断"是不是当前版本" |

相关文件：`src/utils/apkRelease.js`（取数与汇总）、`Home.vue`（渲染）、
`vite.config.js`（注入 `__APK_VERSION__` / `__APK_REPO__`）、`scripts/test_apkRelease.mjs`（单测）。

### 发布新 APK 后如何让计数生效

**推荐：打 tag 自动发布（无需任何令牌）**
```bash
# 1) 本地跑 scripts/build-apk.bat，把 public/downloads/feike-schedule.apk 一并提交推送
# 2) 打 tag 并推送 —— .github/workflows/release-apk.yml 会自动创建 Release 并上传 asset
git tag apk-v1.4 && git push origin apk-v1.4
```
工作流用的是 Actions 内置 `secrets.GITHUB_TOKEN`（配 `permissions: contents: write`），
**不需要自备 PAT**，也不用在网页上手动拖文件。也可在 Actions 页面手动触发并指定 tag。

**备用：本地手动跑（需要 PAT）**
```powershell
$env:GITHUB_TOKEN="ghp_xxx"; node scripts/release-apk.mjs
# 可选：--tag=apk-v1.3  --file=path/to/apk
```
或网页手动：Releases → Draft a new release → Tag 填 `apk-v<版本>` →
把 `public/downloads/feike-schedule.apk` 拖进去 → Publish。

发布脚本可重复执行：同 tag 复用、同名 asset 先删后传（旧下载数会随之清零，属正常）。

### 两条下载路径（别搞混）

| 路径 | 位置 | 是否计数 |
|---|---|---|
| **主下载按钮** | 同域 `downloads/feike-schedule.apk` | ❌ 不计数（Pages 无服务端） |
| **GitHub 镜像入口** | Release asset 直链 | ✅ 计数（页面显示的「镜像通道已下载 N 次」） |

主下载刻意走本地文件：**点击即下载、不跳界面、不依赖外网**（体验优先）。
页面上的数字只反映镜像通道，因此文案里明确标注，不冒充总下载量。
想要"真实总下载量/安装量"，需要 APK 首启上报 + 一个计数端点，属于另一套东西。

### 排查

- 首页不显示次数：先确认 Releases 里 asset 名**完全等于** `feike-schedule-<package.json 的 apkVersion>.apk`。
- 打开 DevTools 看 `api.github.com/repos/icyteacn/FJNU-Nav/releases` 是否 403（限流属正常，等一小时或换个网络）。
- download_count 有分钟级延迟，刚上传后显示 0 是正常的。

### 已知取舍

- 下载数的**统计口径是"经过 Releases 的下载"**：如果用户在别处（网盘、群文件）转发 APK，不会被计入。
  想要"真实安装量"需要 APK 首启上报 + 一个计数端点，属于另一套东西，暂未做。
- 国内直连 GitHub Releases 的下载速度可能不如 CDN，若日后觉得慢，可保留 Releases 计数、
  同时把下载按钮换回 Pages 本地文件（此时计数不再增长，需要在首页文案上说明）。
