package com.feike.schedule;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
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

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
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
                ScheduleWidgetProvider.updateAll(ctx); // 内部 30s 节流
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
                ScheduleWidgetProvider.updateAll(ctx); // 同步桌面小组件（内部 30s 节流）
            } catch (Throwable ignored) {
            }
        } catch (Throwable ignored) {
            // 通知失败绝不影响主程序
        }
    }

    /**
     * 桌面小组件 4x4 数据快照：{top1, top2, n1, n2, n3}
     *   上半区 top1/top2 —— 正在上课（含下课倒计时）/ 上一节已下课 / 今日第一节预告
     *   下半区 n1..n3    —— 接下来 3 节列表（与应用内倒计时卡同源：时间 课名 · 教室 · 倒计时）
     * 数据缺失 / 过期返回 null（小组件显示占位）。
     */
    public static String[] widgetSnapshot(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONObject s = readSummary(ctx);
            if (s == null || !today.equals(s.optString("date"))) return null;
            String l1 = s.optString("text", "");
            if (l1.isEmpty()) return null;
            long now = System.currentTimeMillis();
            JSONArray lines = s.optJSONArray("lines");
            String line2 = lines != null ? lines.optString(0, "") : "";
            String top1, top2;
            if ("live".equals(s.optString("mode"))) {
                long anchor = s.optLong("anchor", 0);
                top1 = l1;
                top2 = line2 + (anchor > now ? " · ⏳ 还有 " + fmtCd(anchor - now) + "下课" : " · 💤 即将下课");
            } else {
                JSONObject prev = s.optJSONObject("prev");
                if (prev != null) {
                    top1 = "💤 上一节 · " + prev.optString("name", "");
                    top2 = prev.optString("time", "") + " · " + prev.optString("loc", "") + " · 已下课";
                } else {
                    top1 = "☕️ 今天还没有上过的课";
                    JSONArray up0 = s.optJSONArray("upcoming");
                    JSONObject first = up0 != null && up0.length() > 0 ? up0.optJSONObject(0) : null;
                    top2 = (first != null && first.optBoolean("today", false))
                            ? "🌅 今日第一节课 " + first.optString("time", "") + " 开始"
                            : "打开 App 查看今日课程";
                }
            }
            String n1 = "", n2 = "", n3 = "";
            JSONArray up = s.optJSONArray("upcoming");
            if (up != null) {
                StringBuilder[] sb = { new StringBuilder(), new StringBuilder(), new StringBuilder() };
                for (int i = 0; i < up.length() && i < 3; i++) {
                    JSONObject u = up.optJSONObject(i);
                    if (u == null) continue;
                    long at = u.optLong("at", 0);
                    String when = (u.optBoolean("today", false) ? "" : u.optString("day", "") + " ") + u.optString("time", "");
                    String rest = at > now ? " · " + fmtCountShort(at - now) + "后" : "";
                    sb[i].append(when).append(" ").append(u.optString("name", ""))
                         .append(" · ").append(u.optString("loc", "")).append(rest);
                }
                n1 = sb[0].toString();
                n2 = sb[1].toString();
                n3 = sb[2].toString();
            }
            return new String[]{ top1, top2, n1, n2, n3 };
        } catch (Throwable t) {
            return null;
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

    /** 开机恢复：重启手机后无需打开 App，通知 / 每小时闹钟 / 课前提醒 / 小组件全部自动恢复 */
    public static class Boot extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            try {
                if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
                Context app = context.getApplicationContext();
                startLiveUpdates(app);
                scheduleHourly(app);
                show(app); // 内含课前提醒闹钟重排 + 小组件刷新
            } catch (Throwable ignored) {
            }
        }
    }
}
