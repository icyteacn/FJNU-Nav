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
    private static final String CHANNEL_SOON = "schedule_soon";
    private static final String FILE_NAME = "notify.json";
    public static final int NOTIFICATION_ID = 1001;
    public static final int SOON_NOTIFICATION_ID = 1002;
    public static final int ALARM_REQUEST = 2001;
    public static final int SOON_ALARM_REQUEST = 3001;

    private static final long SOON_WINDOW_MS = 30 * 60 * 1000L; // 距下节课 ≤30 分钟额外提醒
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
            NotificationChannel ch = new NotificationChannel(CHANNEL_SOON, "下课前提醒", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("距下节课 30 分钟时提醒教室与时间");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
    }

    private static boolean notifyGranted(Context context) {
        return Build.VERSION.SDK_INT < 33
                || context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
    }

    private static PendingIntent launchIntent(Context context) {
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
                    .setContentTitle(title)
                    .setContentText(text) // 收起态：行2（日期节次教室）
                    .setContentIntent(launchIntent(ctx))
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setShowWhen(false);

            if (threeLine) {
                // 展开态：大标题=行1，正文=行2 + 行3实时读秒
                StringBuilder sb = new StringBuilder(line2);
                if (!l3.isEmpty()) sb.append('\n').append(l3);
                b.setStyle(new Notification.BigTextStyle().setBigContentTitle(title).bigText(sb.toString()));
            }
            nm.notify(NOTIFICATION_ID, b.build());

            if (fresh) {
                maybeSoonNotify(ctx, s, nm, now);
                scheduleSoonAlarm(ctx, s, now);
            }
        } catch (Throwable ignored) {
            // 通知失败绝不影响主程序
        }
    }

    /** 距下节课 ≤30 分钟 → 额外弹一条有声提醒（时间 + 课程 + 教室），按 nextStart 去重只弹一次 */
    private static void maybeSoonNotify(Context ctx, JSONObject s, NotificationManager nm, long now) {
        try {
            if (!notifyGranted(ctx)) return; // 未授权不记录，授权后仍能弹
            long ns = s.optLong("nextStart", 0);
            if (ns <= 0 || now >= ns) return;
            long diff = ns - now;
            if (diff > SOON_WINDOW_MS) return;
            SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (String.valueOf(ns).equals(p.getString(KEY_SOON_FIRED, ""))) return;

            String name = s.optString("nextName", "下节课");
            String loc = s.optString("nextLoc", "");
            String time = s.optString("nextTime", "");
            String when = s.optString("nextWhen", "");
            String head = diff >= 25 * 60 * 1000L
                    ? "⏰ 还有半小时上课"
                    : "⏰ 还有 " + Math.max(1, (diff + 59999) / 60000) + " 分钟上课";
            String body = (time.isEmpty() ? "" : time + " ") + name + (loc.isEmpty() ? "" : " · 请前往 " + loc);

            p.edit().putString(KEY_SOON_FIRED, String.valueOf(ns)).apply();
            ensureSoonChannel(nm);

            Notification.Builder b;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) b = new Notification.Builder(ctx, CHANNEL_SOON);
            else b = new Notification.Builder(ctx);
            b.setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(head)
                    .setContentText(body)
                    .setContentIntent(launchIntent(ctx))
                    .setAutoCancel(true)
                    .setShowWhen(true);
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
            long trigger = Math.max(ns - SOON_WINDOW_MS, now + 1000);
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
}
