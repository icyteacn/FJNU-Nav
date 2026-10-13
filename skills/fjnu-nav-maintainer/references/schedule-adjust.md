# 课表调课 / 节假日数据落地

适用于：教务调课通知、法定假日停课、调休补课、课程数据变更。改完**三端（网页课程表 / 移动端 / APK）自动同步，无需重打 APK**。

## 数据源与条目结构

唯一数据源 `src/data/classSchedule.js` 的 `HOLIDAY_MAP`（按日期索引），三种类型：

| type | 含义 | 必填字段 |
| --- | --- | --- |
| `holiday` | 法定假日停课 | `name`、`icon` |
| `makeup` | 调休补课（当天按 `scheduleWeekday` 的课表上课） | `scheduleWeekday`、`desc`、`overrides?` |
| `adjust` | 单次调课（当天课表不变，仅 `overrides` 指定节次改期） | `scheduleWeekday`、`desc`、`overrides` |

`overrides` 条目：`{ srcPeriods, destDate, destPeriods, destLocation, courseHint }`
- `srcPeriods` = 源日被调走的节次（源格显示 `↗️ 已调整无课` 角标）
- `destDate/destPeriods/destLocation` = 调入日期/节次/教室（目标格显示 `⬅️ 调入` 角标 + 新教室）
- `courseHint` = 详情文案用的课程名关键词
- `scheduleWeekday` = 源日的课表周几，供调入侧反查源课表

示例（2026-10-13 实例）：

```js
'2026-10-13': {
  type: 'adjust', scheduleWeekday: 2, icon: '🔀',
  descShort: '调课',
  desc: '第七周周二(10/13)晚9-12节人工智能通识课调至周四(10/15)笃行1-114',
  overrides: [
    { srcPeriods: [9, 10, 11, 12], destDate: '2026-10-15', destPeriods: [9, 10, 11, 12], destLocation: '笃行1-114', courseHint: '人工智能通识' },
  ],
},
```

## 落地步骤

1. **前置数据验证**（用 node 脚本查，不靠肉眼）：
   - 源日课是否在开课周范围内（课程 `weeks` 字段 vs 源日期所在周）；
   - **目标日同时段是否冲突**（查 `COURSES` 里目标周几 + 节次区间是否有课）；
   - 多专业场景：`HOLIDAY_MAP` 按日期全局生效、不分专业——确认该时段所有专业上的都是这门课（或无课），避免误伤他课。
2. **改 `src/data/classSchedule.js`** 的 `HOLIDAY_MAP`（加/改条目）。
3. **同步 APK 内置兜底数据**：`public/standalone-schedule.html` 里的内置 `HOLIDAY_MAP` 也有一份（离线回退第④级），必须与源数据一致——历史上漏同步过（10/20 条目曾缺失）。
4. **重新生成接口**：`npm run build` 自动跑 `scripts/gen-schedule-data.mjs` → `public/data/schedule-data.json`（version = 内容哈希，数据变了自动变，客户端「检测更新」与自动同步全靠它）。**不要手改这两个 JSON。**
5. 需要时同步 `standalone-schedule.html` 的文案/逻辑（若调课影响通知、倒计时卡等）。

## 渲染链路（排查显示 bug 时读）

**表格视图**（三端一致，成熟）：
- 源格：`getCourseOverride` → `moved-badge`（`↗️ 目标日 第X-Y节 / 已调整无课`，点击 `jumpToOverride` 跳目标格）
- 目标格：`getIncomingInfo(dateStr, period, findCourse)` → `incoming-badge`（`⬅️ 调入 源日`）+ `destLocation`
- 合并格：`isCellMerged`/`getRowspan` 按 `overrides.srcPeriods` 与 `destPeriods` 判定（不受类型筛选/搜索影响，防 rowspan 溢出）
- **跨周调入**：调入源必须用 `majorCourses` 全量池反查（目标周可能超出课程 `weeks` 范围，`displayCourses` 按周过滤会解析不到导致格子空）；`showSemester` 学期视图下不套用改期（按周次取日期会误伤）
- 假日/补课日：`getScheduleWeekday` 决定当天按周几查课；表头 `.is-holiday`/`.is-makeup` 样式

**非表格视图**（v1.6.9 修过「调入日看不到课」，改动 HOLIDAY_MAP 后回归这三处）：
1. **今日课程卡 `todayCourses`**：按 `weekday` 过滤 + `isPeriodMoved` 剔除后，还要遍历 `getAllAdjustments()` 把 `destDate === 今天` 的调入课 push 进来（覆写 `weekday` 为目标周几、`startPeriod/endPeriod` 为 `destPeriods`、`location` 为 `destLocation`、附 `_incomingAdj`）。
2. **列表视图 `coursesByDay`**：同样要剔除 moved + 并入当天 incoming。
3. **下一节课倒计时 `futureCourses`**：常规课循环里 `isPeriodMoved(ds, startPeriod)` 则 `continue`；再把未来的调入课按 `destDate + destPeriods[0]` 起始时间加入排序。否则会把已调走的课报成「下一节课」、且漏掉调入课。
4. `jumpToCourse` 对带 `_incomingAdj` 的课要按 `destDate` 反算周次（否则错跳到源课第一周）。

## 三端清单

| 端 | 文件 | 入口 |
| --- | --- | --- |
| 网页课程表 | `src/views/ClassSchedule.vue` | `Timetable.vue` 研究生 tab + `OrientationSchedule.vue` 日程助手课表 tab 共用此组件 |
| 移动端课表 | `src/views/MobileSchedule.vue` | `mobile.html` / `src/mobile.js` 独立入口 |
| APK | `public/standalone-schedule.html` | 单文件应用（内置数据仅为离线兜底，联网时拉线上接口整体替换） |

## 验证清单

```bash
npm run build && node scripts/e2e-integrity.mjs   # 构建 + 门禁 18 项
# 浏览器实测（本地服务端口 8788，切到调课所在周）：
#  ① 源格出现 moved-badge 且文案为「已调整无课」
#  ② 目标格出现 incoming-badge + destLocation
#  ③ 当日为源日时：今日课程卡剔除被调走的课
#  ④ 倒计时卡不报被调走的课（调入日应报调入课）
#  ⑤ 日程助手/课程表两处入口都打开看一眼
```
