package com.feike.schedule;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

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
 * 课表常驻通知（锁屏 / 通知栏）
 *
 * 数据来源：网页侧 standalone-schedule.html 每次渲染后把「今日概要」写入
 *   filesDir/notify.json（title / text / lines / date），本类只负责读取与展示。
 * 设计约束：
 *   1. 全程 try/catch —— 通知任何异常都不得影响主程序；
 *   2. 过期保护 —— 文件里的 date 不是今天则降级为「打开应用查看」，绝不展示过期课表；
 *   3. 权限 —— Android 13+ 未授予 POST_NOTIFICATIONS 时静默跳过，授权后下次刷新自动出现。
 */
public final class ScheduleNotifier {

    private static final String CHANNEL_ID = "schedule_daily";
    private static final String FILE_NAME = "notify.json";
    public static final int NOTIFICATION_ID = 1001;
    public static final int ALARM_REQUEST = 2001;

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
            ch.setDescription("锁屏与通知栏常驻：今日课程与下一节课");
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        }
    }

    private static PendingIntent launchIntent(Context context) {
        Intent it = new Intent(context, MainActivity.class);
        it.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(context, 1, it, flags);
    }

    /** 展示 / 刷新常驻通知（幂等，重复调用只更新同一条） */
    public static void show(Context context) {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (Build.VERSION.SDK_INT >= 33
                    && context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return;
            }
            ensureChannel(nm);

            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONObject s = readSummary(context);
            boolean fresh = s != null && today.equals(s.optString("date"));
            String title = fresh ? s.optString("title", "今日课程") : "🐔🩸课表";
            String text = fresh ? s.optString("text", "") : "打开应用查看今日课程与下一节课";

            Notification.Builder b;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) b = new Notification.Builder(context, CHANNEL_ID);
            else b = new Notification.Builder(context);
            b.setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setContentIntent(launchIntent(context))
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setShowWhen(false);

            if (fresh) {
                JSONArray lines = s.optJSONArray("lines");
                if (lines != null && lines.length() > 0) {
                    StringBuilder sb = new StringBuilder(text);
                    for (int i = 0; i < lines.length() && i < 5; i++) {
                        sb.append('\n').append(lines.optString(i));
                    }
                    b.setStyle(new Notification.BigTextStyle().setBigContentTitle(title).bigText(sb.toString()));
                }
            }
            nm.notify(NOTIFICATION_ID, b.build());
        } catch (Throwable ignored) {
            // 通知失败绝不影响主程序
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
        } catch (Throwable ignored) {}
    }

    /** 定时刷新接收器（独立类，R8 由 Manifest 引用自动保留） */
    public static class Tick extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            show(context);
        }
    }
}
