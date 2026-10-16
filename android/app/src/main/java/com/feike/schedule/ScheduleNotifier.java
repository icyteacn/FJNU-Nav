package com.feike.schedule;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.drawable.Icon;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.FileObserver;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * 课表常驻通知（锁屏 / 通知栏）+ 下课前半小时提醒
 *
 * 数据来源：网页侧 standalone-schedule.html 写入 filesDir/notify.json（严格三行结构）：
 *   text        行1「🔔 下一节课 / 📖 正在上课 · 周几 几点 什么课」
 *   lines[0]    行2「📅 几月几日 第几节 哪个教室」
 *   lines[1]    行3「⏳ 倒计时」初值 —— 本类按 anchor 锚点实时读秒覆写
 *               （anchor: live=下课时刻 / next=上课时刻，进程内每秒重绘，锁屏跟着走秒）
 *   nextStart 等 距下节课 ≤30 分钟弹一条非常驻提醒（时间 + 课程 + 教室，按 nextStart 去重）
 * 设计约束：
 *   1. 全程 try/catch —— 通知任何异常都不得影响主程序；
 *   2. 过期保护 —— date 不是今天才降级为「打开应用查看」，正常态永远三行；
 *   3. 权限 —— Android 13+ 未授予 POST_NOTIFICATIONS 时静默跳过，授权后下次刷新自动出现。
 */
public final class ScheduleNotifier {

    private static final String TAG = "FeikeSchedule";

    private static final String CHANNEL_ID = "schedule_daily";
    private static final String CHANNEL_SOON = "schedule_soon_hi"; // 新 id：旧包已把 schedule_soon 建成 DEFAULT，换 id 才能升为 HIGH 横幅
    private static final String FILE_NAME = "notify.json";
    public static final int NOTIFICATION_ID = 1001;
    public static final int SOON_NOTIFICATION_ID = 1002;
    public static final int ALARM_REQUEST = 2001;
    public static final int SOON_ALARM_REQUEST = 3001;

    private static final long TICK_MS = 1000L;                  // 读秒重绘（每秒刷新倒计时）
    private static final String PREFS = "sched_notify";
    private static final String KEY_SOON_FIRED = "soon_fired";  // 已提醒的 nextStart（每节课只弹一次）

    private static final Handler sHandler = new Handler(Looper.getMainLooper());
    private static Context sApp;
    private static FileObserver sObserver;
    private static boolean sTicking;

    private ScheduleNotifier() {}

    /** 网页侧写入的今日概要文件（与 Capacitor Filesystem 的 Directory.DATA 同目录） */
    public static File dataFile(Context context) {
        return new File(context.getFilesDir(), FILE_NAME);
    }

    private static JSONObject readSummary(Context context) {
        try {
            File f = dataFile(context);
            if (!f.exists() || f.length() == 0 || f.length() > 64 * 1024) return null;
            byte[] buf = new byte[(int) f.length()];
            try (FileInputStream in = new FileInputStream(f)) {
                int off = 0;
                while (off < buf.length) {
                    int n = in.read(buf, off, buf.length - off);
                    if (n < 0) break;
                    off += n;
                }
            }
            return new JSONObject(new String(buf, StandardCharsets.UTF_8));
        } catch (Throwable t) {
            return null;
        }
    }

    private static void ensureChannel(NotificationManager nm) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "课表提醒", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("锁屏与通知栏常驻：三行实时课表（正在上课 / 下一节课 + 倒计时）");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
    }

    private static void ensureSoonChannel(NotificationManager nm) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_SOON, "课前提醒", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("上课前提醒：剩余时间 + 课程 + 教室（提前量可在菜单调整）");
            ch.setShowBadge(false);
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
    }

    private static boolean notifyGranted(Context context) {
        return Build.VERSION.SDK_INT < 33
                || context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
    }

    public static PendingIntent launchIntent(Context context) {
        Intent it = new Intent(context, MainActivity.class);
        it.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(context, 1, it, flags);
    }

    /** 行3读秒倒计时（锁屏每秒重绘跟着走秒）：`2小时15分08秒` / `25分08秒` / `1天3小时15分` */
    private static String fmtCd(long ms) {
        long s = ms / 1000;
        long d = s / 86400, h = (s % 86400) / 3600, m = (s % 3600) / 60, sec = s % 60;
        if (d > 0) return d + "天" + h + "小时" + m + "分";
        if (h > 0) return h + "小时" + String.format(Locale.US, "%02d", m) + "分" + String.format(Locale.US, "%02d", sec) + "秒";
        return m + "分" + String.format(Locale.US, "%02d", sec) + "秒";
    }

    /** 行3：按锚点实时读秒（过期给出明确状态，绝不显示负数倒计时） */
    private static String countdownLine(JSONObject s, long now) {
        try {
            long anchor = s.optLong("anchor", 0);
            if (anchor <= 0) return s.optJSONArray("lines") != null
                    ? s.optJSONArray("lines").optString(1, "") : "";
            long diff = anchor - now;
            boolean live = "live".equals(s.optString("mode"));
            if (diff > 0) return "⏳ 还有 " + fmtCd(diff) + (live ? "下课" : "");
            return live ? "💤 本节课已下课" : "▶️ 即将开始";
        } catch (Throwable t) {
            return "";
        }
    }

    /** 展示 / 刷新常驻通知（幂等；进程内每秒调用一次保持行3走秒） */
    public static void show(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            // 小组件先刷：它不依赖通知权限，不能被下方权限检查连带卡死
            try {
                ScheduleWidgetProvider.updateAll(ctx);
        ScheduleWidgetProviderToday.updateAll(ctx);
        ScheduleWidgetProviderNext.updateAll(ctx);  // 内部 30s 节流
            } catch (Throwable ignored) {
            }
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (!notifyGranted(ctx)) return;
            ensureChannel(nm);

            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONObject s = readSummary(ctx);
            boolean fresh = s != null && today.equals(s.optString("date"));
            long now = System.currentTimeMillis();

            // 大标题=行1（系统自动显示应用名「🐔🩸课表」，不再重复设标题）；正文=行2+行3
            String title = "🐔🩸课表", text = "打开应用查看今日课程与下一节课";
            String line2 = "", l3 = "";
            boolean threeLine = false;
            if (fresh) {
                String t1 = s.optString("text", "");
                if (!t1.isEmpty()) {
                    title = t1;
                    JSONArray lines = s.optJSONArray("lines");
                    line2 = lines != null ? lines.optString(0, "") : "";
                    l3 = countdownLine(s, now);
                    text = line2;
                    if (text.isEmpty()) text = l3.isEmpty() ? "打开应用查看今日课程" : l3;
                    threeLine = true;
                }
            }

            Notification.Builder b;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) b = new Notification.Builder(ctx, CHANNEL_ID);
            else b = new Notification.Builder(ctx);
            b.setSmallIcon(R.mipmap.ic_launcher)
                    .setColor(0xFFC62828)                            // 品牌红着色（状态栏图标圆底，高级感）
                    .setVisibility(Notification.VISIBILITY_PUBLIC)   // 锁屏完整显示三行
                    .setCategory(Notification.CATEGORY_EVENT)
                    .setContentTitle(title)
                    .setContentText(text) // 收起态：行2（日期节次教室）
                    .setContentIntent(launchIntent(ctx))
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setShowWhen(false);
            // 通知上的操作按钮：深链修好后可真正直达（Android 7+ 才有操作按钮，低版本忽略即可）
            if (Build.VERSION.SDK_INT >= 16) {
                try {
                    b.addAction(new Notification.Action.Builder(null, "今日", launchIntentView(ctx, "today")).build());
                    b.addAction(new Notification.Action.Builder(null, "周课表", launchIntentView(ctx, "week")).build());
                } catch (Throwable ignored) {
                }
            }
            if (fresh) {
                int week = s.optInt("week", 0);
                if (week > 0) b.setSubText("第" + week + "周"); // 右侧小字：当前周次
            }

            if (threeLine) {
                // 展开态：大标题=行1，正文=行2 + 行3实时读秒
                StringBuilder sb = new StringBuilder(line2);
                if (!l3.isEmpty()) sb.append('\n').append(l3);
                b.setStyle(new Notification.BigTextStyle().setBigContentTitle(title).bigText(sb.toString()));
                // 上课中：本节课进度条（0→100% 随每秒 ticker 前进，锁屏直观看到上了多久）
                if (fresh && "live".equals(s.optString("mode")) && Build.VERSION.SDK_INT >= 24) {
                    long ls = s.optLong("liveStart", 0), le = s.optLong("anchor", 0);
                    if (ls > 0 && le > ls) {
                        int pct = (int) Math.max(0, Math.min(100, (now - ls) * 100 / (le - ls)));
                        b.setProgress(100, pct, false);
                    }
                }
            }
            nm.notify(NOTIFICATION_ID, b.build());

            if (fresh) {
                maybeSoonNotify(ctx, s, nm, now);
                scheduleSoonAlarm(ctx, s, now);
            }
            try {
                if (fresh) syncNextShortcut(ctx, s); // 长按图标的「下一节课」实时更新
            } catch (Throwable ignored) {
            }
            try {
                ScheduleWidgetProvider.updateAll(ctx);
        ScheduleWidgetProviderToday.updateAll(ctx);
        ScheduleWidgetProviderNext.updateAll(ctx);  // 同步桌面小组件（内部 30s 节流）
            } catch (Throwable ignored) {
            }
        } catch (Throwable ignored) {
            // 通知失败绝不影响主程序
        }
    }

    /**
     * 桌面小组件 4x2 数据快照：{状态行, 下一节信息, 下一节倒计时}
     *   行1 —— 正在上课（含下课倒计时）/ 上一节已下课 / 今日第一节预告
     *   行2 —— 下一节课：时间 课名 · 教室（与应用内倒计时卡同源）
     *   行3 —— 下一节课距开始倒计时
     * 数据缺失 / 过期返回 null（小组件显示占位）。
     */
    public static String[] widgetSnapshot(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONObject s = readSummary(ctx);
            if (s == null || !today.equals(s.optString("date"))) return null;
            String l1 = s.optString("text", "");
            if (l1.isEmpty()) l1 = s.optString("l1", ""); // 兼容 1.1 旧 schema
            if (l1.isEmpty()) return null;
            long now = System.currentTimeMillis();
            JSONArray lines = s.optJSONArray("lines");
            String line2 = lines != null ? lines.optString(0, "") : s.optString("l2", "");
            String top1;
            if ("live".equals(s.optString("mode"))) {
                long anchor = s.optLong("anchor", 0);
                top1 = l1 + (anchor > now ? " · 还剩 " + fmtCd(anchor - now) + "下课" : " · 即将下课");
            } else {
                JSONObject prev = s.optJSONObject("prev");
                if (prev != null) {
                    top1 = "上一节 · " + prev.optString("name", "") + " · 已下课";
                } else {
                    JSONArray up0 = s.optJSONArray("upcoming");
                    JSONObject first = up0 != null && up0.length() > 0 ? up0.optJSONObject(0) : null;
                    top1 = (first != null && first.optBoolean("today", false))
                            ? "今日第一节课 " + first.optString("time", "") + " 开始"
                            : "打开 App 查看今日课程";
                }
            }
            String top2 = "", top3 = "";
            JSONArray up = s.optJSONArray("upcoming");
            JSONObject u = up != null && up.length() > 0 ? up.optJSONObject(0) : null;
            if (u != null) {
                String when = (u.optBoolean("today", false) ? "" : u.optString("day", "") + " ") + u.optString("time", "");
                top2 = "下一节 " + when + " " + u.optString("name", "") + " · " + u.optString("loc", "");
                long at = u.optLong("at", 0);
                top3 = at > now ? "还有 " + fmtCountShort(at - now) + "开始" : "即将开始";
            } else if (s.optLong("nextStart", 0) > now) {
                // 兼容 1.1 旧 schema：无 upcoming 时用 next* 字段
                top2 = "下一节 " + s.optString("nextTime", "") + " " + s.optString("nextName", "") + " · " + s.optString("nextLoc", "");
                top3 = "还有 " + fmtCountShort(s.optLong("nextStart", 0) - now) + "开始";
            }
            return new String[]{ top1, top2, top3 };
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * 「大号组件」数据：首行状态 + 今日后续课程逐条（最多 4 条）。
     *   [0] 状态行（正在上课 / 下一节课 / 今日已上完 …）
     *   [1..] "08:20 高等数学 · 知明2-202"（只取 today=true 的 upcoming）
     * 数据缺失/日期过期返回 null，由组件显示占位文案。
     */
    public static String[] widgetTodayLines(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONObject s = readSummary(ctx);
            if (s == null || !today.equals(s.optString("date"))) return null;
            String status = s.optString("text", "");
            if (status.isEmpty()) status = s.optString("l1", "");
            List<String> out = new ArrayList<>();
            out.add(status.isEmpty() ? "" : status);
            JSONArray up = s.optJSONArray("upcoming");
            int shown = 0;
            if (up != null) {
                for (int i = 0; i < up.length() && shown < 4; i++) {
                    JSONObject u = up.optJSONObject(i);
                    if (u == null || !u.optBoolean("today", false)) continue;
                    String time = u.optString("time", "");
                    String name = u.optString("name", "");
                    String loc = u.optString("loc", "");
                    if (name.isEmpty()) continue;
                    out.add((time.isEmpty() ? "" : time + " ") + name + (loc.isEmpty() ? "" : " · " + loc));
                    shown++;
                }
            }
            if (shown == 0) {
                JSONArray lines = s.optJSONArray("lines");
                String hint = lines != null ? lines.optString(0, "") : "";
                out.add(hint.isEmpty() ? "今日没有课程 🎉" : hint);
            }
            return out.toArray(new String[0]);
        } catch (Throwable t) {
            return null;
        }
    }

    /* ── 三套桌面小组件共用的数据面板（顺序即下标，改动请同步布局与 Provider）─────────────────
     * W_DATE    周四 10/16
     * W_BADGE   状态徽章：正在上课 / 下一节课 / 今日已上完 / 假期停课
     * W_TITLE   主标题（课程名；无课时为一句提示）
     * W_SUB     副标题：教室 · 第3-4节
     * W_COUNT   倒计时：剩 23分 / 1小时23分
     * W_PROGRESS 今日 4 节 · 已上 2 节
     * W_C1..C4  今日剩余课程：08:20 高等数学 · 博学楼208
     * W_FOOT    底部：明天 08:00 马克思主义
     * W_PCT     今日进度百分比（0-100，喂给 ProgressBar）
     * W_KIND    徽章样式 0 正在上课 / 1 下一节 / 2 空闲 / 3 假期
     */
    public static final int W_DATE = 0, W_BADGE = 1, W_TITLE = 2, W_SUB = 3,
            W_COUNT = 4, W_PROGRESS = 5, W_C1 = 6, W_C2 = 7, W_C3 = 8, W_C4 = 9,
            W_FOOT = 10, W_PCT = 11, W_KIND = 12, W_SHORT = 13, W_SLOTS = 14;
    public static final int KIND_LIVE = 0, KIND_NEXT = 1, KIND_IDLE = 2, KIND_HOLIDAY = 3;

    /** 组件专用课程行（今日剩余，最多 4 条） */
    private static String courseLine(JSONObject u) {
        if (u == null) return " ";
        String time = u.optString("time", "");
        String name = u.optString("name", "");
        String loc = u.optString("loc", "");
        if (name.isEmpty()) return " ";
        return (time.isEmpty() ? "" : time + "  ") + name + (loc.isEmpty() ? "" : " · " + loc);
    }

    /**
     * 桌面组件统一数据面板。数据缺失或日期过期返回带「打开 App」提示的面板，
     * 组件因此永远有内容可渲染（不会空白，也不会抛异常）。
     */
    public static String[] widgetDashboard(Context context) {
        String[] out = new String[W_SLOTS];
        for (int i = 0; i < W_SLOTS; i++) out[i] = " ";
        try {
            Context ctx = context.getApplicationContext();
            Calendar cal = Calendar.getInstance();
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.getTime());
            int wd = cal.get(Calendar.DAY_OF_WEEK);
            String[] WD = {"", "周一", "周二", "周三", "周四", "周五", "周六", "周日"};
            out[W_DATE] = WD[wd == 1 ? 7 : wd] + " " + (cal.get(Calendar.MONTH) + 1) + "/" + cal.get(Calendar.DAY_OF_MONTH);

            JSONObject s = readSummary(ctx);
            if (s == null || !today.equals(s.optString("date"))) {
                out[W_BADGE] = "打开 App";
                out[W_TITLE] = "还没有今日课表数据";
                out[W_SUB] = "进入应用打开一次课表页即可";
                out[W_KIND] = String.valueOf(KIND_IDLE);
                return out;
            }

            long now = System.currentTimeMillis();
            String mode = s.optString("mode", "rest");
            int total = s.optInt("todayTotal", 0);
            int done = s.optInt("todayDone", 0);
            long anchor = s.optLong("anchor", 0);

            // 今日剩余课程（today=true）与明天第一节（!today）
            JSONArray up = s.optJSONArray("upcoming");
            JSONObject live = null;
            String[] rows = new String[]{out[W_C1], out[W_C2], out[W_C3], out[W_C4]};
            int n = 0;
            String foot = "";
            if (up != null) {
                for (int i = 0; i < up.length(); i++) {
                    JSONObject u = up.optJSONObject(i);
                    if (u == null) continue;
                    if (u.optBoolean("today", false)) {
                        if (live == null && u.optLong("at", 0) <= now) live = u; // 正在上的那节
                        if (n < rows.length) rows[n++] = courseLine(u);
                    } else if (foot.isEmpty()) {
                        String time = u.optString("time", "");
                        String name = u.optString("name", "");
                        if (!name.isEmpty()) {
                            String day = u.optString("day", "");
                            foot = (day.isEmpty() ? "" : day + " ") + time + " " + name;
                        }
                    }
                }
            }
            for (int i = 0; i < rows.length; i++) out[W_C1 + i] = rows[i];

            // 状态徽章 + 主副标题 + 倒计时
            if ("holiday".equals(mode)) {
                out[W_KIND] = String.valueOf(KIND_HOLIDAY);
                out[W_BADGE] = "假期停课";
                String txt = s.optString("text", "");
                out[W_TITLE] = stripLeadingSymbols(txt);
                if (out[W_TITLE].isEmpty()) out[W_TITLE] = "今天不用上课";
                out[W_SUB] = "好好休息";
                out[W_FOOT] = foot.isEmpty() ? " " : foot;
            } else if ("live".equals(mode) || live != null) {
                out[W_KIND] = String.valueOf(KIND_LIVE);
                out[W_BADGE] = "正在上课";
                if (live != null) {
                    out[W_TITLE] = live.optString("name", "");
                    out[W_SUB] = live.optString("loc", "") + (live.optString("time", "").isEmpty() ? "" : " · " + live.optString("time", "") + " 节");
                } else {
                    out[W_TITLE] = stripLeadingSymbols(s.optString("text", "上课中"));
                    out[W_SUB] = " ";
                }
                out[W_COUNT] = anchor > now ? "剩 " + fmtCd(anchor - now) : "即将下课";
                out[W_FOOT] = foot.isEmpty() ? " " : foot;
            } else if (s.optLong("nextStart", 0) > 0) {
                out[W_KIND] = String.valueOf(KIND_NEXT);
                out[W_BADGE] = "下一节课";
                out[W_TITLE] = s.optString("nextName", "");
                String loc = s.optString("nextLoc", "");
                String tm = s.optString("nextTime", "");
                out[W_SUB] = (loc.isEmpty() ? "" : loc) + (tm.isEmpty() ? "" : (loc.isEmpty() ? "" : " · ") + tm + " 节");
                long t0 = s.optLong("nextStart", 0);
                out[W_COUNT] = t0 > now ? fmtCd(t0 - now) + "后开课" : "即将开课";
                out[W_FOOT] = foot.isEmpty() ? " " : foot;
            } else {
                out[W_KIND] = String.valueOf(KIND_IDLE);
                out[W_BADGE] = total > 0 ? "今日已上完" : "今日无课";
                out[W_TITLE] = total > 0 ? "今天 " + total + " 节都结束了 🎉" : "今天没有课 ☕";
                out[W_SUB] = " ";
                out[W_FOOT] = foot.isEmpty() ? " " : foot;
            }

            // 今日进度
            if (total > 0) {
                out[W_PROGRESS] = "今日 " + total + " 节 · 已上 " + Math.min(done, total) + " 节";
                out[W_PCT] = String.valueOf(Math.max(0, Math.min(100, Math.round(done * 100f / total))));
            } else {
                out[W_PROGRESS] = "今日没有课程安排";
                out[W_PCT] = "0";
            }
            // 1x1 只放得下几个字：给一句最短状态（剩 23分 / 还剩 2 节 / 今日无课）
            if (out[W_KIND].equals(String.valueOf(KIND_LIVE))) {
                out[W_SHORT] = out[W_COUNT];
            } else if (total > done) {
                out[W_SHORT] = "还剩 " + (total - done) + " 节";
            } else {
                out[W_SHORT] = total > 0 ? "都上完了" : "今日无课";
            }
            out[W_TITLE] = trimOrSpace(out[W_TITLE]);
            out[W_SUB] = trimOrSpace(out[W_SUB]);
        } catch (Throwable t) {
            // 兜底：面板永不为空，组件不会白屏
            out[W_BADGE] = "打开 App";
            out[W_TITLE] = "课表数据读取失败";
            out[W_KIND] = String.valueOf(KIND_IDLE);
        }
        return out;
    }

    /** 剥掉文案开头的 emoji / 符号（如 "🔔 正在上课" → "正在上课"），不用正则以避开转义坑 */
    private static String stripLeadingSymbols(String s) {
        if (s == null) return "";
        int i = 0;
        while (i < s.length() && !Character.isLetterOrDigit(s.charAt(i))) i++;
        return (i == 0 ? s : s.substring(i)).trim();
    }

    private static String trimOrSpace(String s) {
        if (s == null) return " ";
        String v = s.trim();
        return v.isEmpty() ? " " : v;
    }

    /** 带目标视图的启动意图（供组件/快捷方式直达「今日 / 下一节课 / 课表」） */
    public static PendingIntent launchIntentView(Context context, String view) {
        try {
            Intent it = new Intent(context, MainActivity.class);
            it.setAction("com.feike.schedule.OPEN_VIEW");
            if (view != null && !view.isEmpty()) it.putExtra("view", view);
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
            return PendingIntent.getActivity(context, (view == null ? "app" : view).hashCode(), it, flags);
        } catch (Throwable t) {
            return launchIntent(context);
        }
    }

    /** 小组件列表用的短倒计时：`1天18小时` / `14小时23分` / `25分08秒` */
    private static String fmtCountShort(long ms) {
        long s = ms / 1000;
        long d = s / 86400, h = (s % 86400) / 3600, m = (s % 3600) / 60, sec = s % 60;
        if (d > 0) return d + "天" + h + "小时";
        if (h > 0) return h + "小时" + m + "分";
        return m + "分" + String.format(Locale.US, "%02d", sec) + "秒";
    }

    /** 距下节课 ≤leadMin 分钟 → 弹一条有声 heads-up 提醒（剩余时间 + 课程 + 教室），按 nextStart 去重只弹一次 */
    private static void maybeSoonNotify(Context ctx, JSONObject s, NotificationManager nm, long now) {
        try {
            if (!notifyGranted(ctx)) return; // 未授权不记录，授权后仍能弹
            long ns = s.optLong("nextStart", 0);
            if (ns <= 0 || now >= ns) return;
            long diff = ns - now;
            int lead = s.optInt("leadMin", 30); // 菜单可配：提前 10/15/30/60 分钟
            if (diff > (long) lead * 60000L) return;
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (String.valueOf(ns).equals(p.getString(KEY_SOON_FIRED, ""))) return;

            String name = s.optString("nextName", "下节课");
            String loc = s.optString("nextLoc", "");
            String time = s.optString("nextTime", "");
            String when = s.optString("nextWhen", "");
            long min = (diff + 59999) / 60000;
            String head = min <= 1 ? "⏰ 马上要上课了"
                    : (min >= 25 && min <= 35 ? "⏰ 还有半小时上课" : "⏰ 还有 " + min + " 分钟上课");
            String body = (time.isEmpty() ? "" : time + " ") + name + (loc.isEmpty() ? "" : " · 请前往 " + loc);

            p.edit().putString(KEY_SOON_FIRED, String.valueOf(ns)).apply();
            ensureSoonChannel(nm);

            Notification.Builder b;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) b = new Notification.Builder(ctx, CHANNEL_SOON);
            else b = new Notification.Builder(ctx);
            b.setSmallIcon(R.mipmap.ic_launcher)
                    .setColor(0xFFF59E0B)                            // 琥珀色：与常驻课表通知区分
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setCategory(Notification.CATEGORY_REMINDER)
                    .setContentTitle(head)
                    .setContentText(body)
                    .setContentIntent(launchIntent(ctx))
                    .setAutoCancel(true)
                    .setShowWhen(true);
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) b.setPriority(Notification.PRIORITY_HIGH);
            if (!when.isEmpty()) {
                b.setStyle(new Notification.BigTextStyle().setBigContentTitle(head).bigText(body + "\n" + when));
        if (Build.VERSION.SDK_INT >= 16) {
            try {
                b.addAction(new Notification.Action.Builder(null, "看课表", launchIntentView(ctx, "today")).build());
                b.addAction(new Notification.Action.Builder(null, "下一节", launchIntentView(ctx, "next")).build());
            } catch (Throwable ignored) {
            }
        }
            }
            nm.notify(SOON_NOTIFICATION_ID, b.build());
        } catch (Throwable ignored) {
        }
    }

    /** 把「下课前 30 分钟」排成一次性闹钟，App 被杀也能准点弹；无精确闹钟权限则回退非精确 */
    private static void scheduleSoonAlarm(Context ctx, JSONObject s, long now) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent it = new Intent(ctx, SoonTick.class);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            PendingIntent pi = PendingIntent.getBroadcast(ctx, SOON_ALARM_REQUEST, it, flags);

            long ns = s.optLong("nextStart", 0);
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            boolean fired = String.valueOf(ns).equals(p.getString(KEY_SOON_FIRED, ""));
            if (ns <= 0 || now >= ns || fired) {
                am.cancel(pi);
                return;
            }
            int lead = s.optInt("leadMin", 30); // 与 maybeSoonNotify 同源：提前量跟随菜单设置
            long trigger = Math.max(ns - (long) lead * 60000L, now + 1000);
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    throw new SecurityException("exact alarms not permitted");
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC, trigger, pi);
                } else {
                    am.setExact(AlarmManager.RTC, trigger, pi);
                }
            } catch (Throwable notExact) {
                am.set(AlarmManager.RTC, trigger, pi); // 精确权限被拒：非精确回退，每秒 ticker / 每小时兜底
            }
        } catch (Throwable ignored) {
        }
    }

    /** 每小时刷新一次（内容仍是网页侧最近写入的，日期过期自动降级） */
    public static void scheduleHourly(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent it = new Intent(context, Tick.class);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            PendingIntent pi = PendingIntent.getBroadcast(context, ALARM_REQUEST, it, flags);
            Calendar c = Calendar.getInstance();
            c.set(Calendar.MINUTE, 0);
            c.set(Calendar.SECOND, 0);
            c.set(Calendar.MILLISECOND, 0);
            c.add(Calendar.HOUR_OF_DAY, 1);
            am.setInexactRepeating(AlarmManager.RTC, c.getTimeInMillis(), AlarmManager.INTERVAL_HOUR, pi);
        } catch (Throwable ignored) {
        }
    }

    /**
     * 进程内实时通道（MainActivity.onCreate 调一次）：
     *   1. 每秒重算行3读秒重绘常驻通知 + 检测半小时窗口（锁屏实时走秒，不依赖网页节流）；
     *   2. FileObserver 监听 notify.json —— 网页写入（上课/下课状态跨边界）立即刷新。
     */
    public static void startLiveUpdates(Context context) {
        try {
            sApp = context.getApplicationContext();
            if (!sTicking) {
                sTicking = true;
                sHandler.postDelayed(sTick, TICK_MS);
            }
            if (sObserver == null) {
                FileObserver obs = new FileObserver(sApp.getFilesDir().getAbsolutePath(),
                        FileObserver.CLOSE_WRITE | FileObserver.MOVED_TO) {
                    @Override
                    public void onEvent(int event, String path) {
                        sHandler.removeCallbacks(sShow);
                        sHandler.postDelayed(sShow, 400); // 写盘去抖
                    }
                };
                obs.startWatching();
                sObserver = obs;
            }
        } catch (Throwable ignored) {
        }
    }

    private static final Runnable sShow = new Runnable() {
        @Override
        public void run() {
            if (sApp != null) show(sApp);
        }
    };

    private static final Runnable sTick = new Runnable() {
        @Override
        public void run() {
            try {
                if (sApp != null) show(sApp);
            } catch (Throwable ignored) {
            }
            sHandler.postDelayed(this, TICK_MS);
        }
    };

    /** 每小时定时刷新接收器（独立类，R8 由 Manifest 引用自动保留） */
    public static class Tick extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            show(context);
        }
    }

    /** 下课前 30 分钟精确闹钟接收器（触发一次即消耗，下次课由 show 重新排程） */
    public static class SoonTick extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            show(context);
        }
    }

    /**
     * 系统事件恢复：重启 / 改时间 / 换时区 / 跨零点 / 应用升级后，
     * 无需打开 App 即可把通知、每小时闹钟、课前提醒闹钟、桌面小组件、动态快捷方式全部重排一遍。
     */
    public static class Boot extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            try {
                Context app = context.getApplicationContext();
                String action = intent == null ? null : intent.getAction();
                Log.i(TAG, "system event -> reschedule: " + action);
                startLiveUpdates(app);
                scheduleHourly(app);
                show(app); // 内含课前提醒闹钟重排 + 小组件刷新 + 动态快捷方式
            } catch (Throwable ignored) {
            }
        }
    }

    /**
     * 动态快捷方式「下一节课」：长按图标即可看到**实时**的下一节课与时间，
     * 比静态快捷方式更实用（静态只有固定的「下一节课」四个字）。
     * 用独立 id（next_live），避免与静态 shortcuts.xml 的 next 冲突。
     */
    private static void syncNextShortcut(Context ctx, JSONObject s) {
        try {
            if (Build.VERSION.SDK_INT < 25) return; // Android 7.1 以下没有动态快捷方式
            ShortcutManager sm = ctx.getSystemService(ShortcutManager.class);
            if (sm == null) return;
            String[] d = widgetDashboard(ctx);
            String name = trimOrSpace(d[W_TITLE]);
            String time = "";
            try {
                time = s == null ? "" : s.optString("nextTime", "");
            } catch (Throwable ignored) {
            }
            String shortLabel;
            if (name.isEmpty()) {
                shortLabel = "今天没课";
            } else if (!time.isEmpty()) {
                shortLabel = time + " " + clip(name, 7);
            } else {
                shortLabel = clip(name, 10);
            }
            Intent it = new Intent(ctx, MainActivity.class);
            it.setAction("com.feike.schedule.OPEN_VIEW");
            it.putExtra("view", "next");
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ShortcutInfo info = new ShortcutInfo.Builder(ctx, "next_live")
                    .setShortLabel(shortLabel)
                    .setLongLabel(trimOrSpace(d[W_BADGE]) + " · " + trimOrSpace(d[W_SUB]))
                    .setIcon(Icon.createWithResource(ctx, R.mipmap.ic_launcher))
                    .setIntent(it)
                    .build();
            sm.setDynamicShortcuts(Collections.singletonList(info));
        } catch (Throwable ignored) {
            // 动态快捷方式失败绝不影响通知主流程
        }
    }

    private static String clip(String s, int n) {
        if (s == null) return "";
        String v = s.trim();
        return v.length() <= n ? v : v.substring(0, n);
    }
}
