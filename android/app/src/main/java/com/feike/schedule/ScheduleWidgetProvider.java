package com.feike.schedule;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.widget.RemoteViews;

/**
 * 桌面小组件 4x4 列表倒计时：
 *   上半区 —— 正在上课（下课倒计时）/ 上一节已下课 / 今日第一节预告（随状态切换）
 *   下半区 —— 接下来 3 节列表（时间 课名 · 教室 · 距开始倒计时，与应用内倒计时卡同源）
 * 数据：notify.json 经 ScheduleNotifier.widgetSnapshot；刷新由 show() 推送（30s 节流）
 *      + 系统半小时兜底；点击进 MainActivity。
 */
public class ScheduleWidgetProvider extends AppWidgetProvider {

    private static final long UI_THROTTLE_MS = 30 * 1000L;
    private static long sLastUi;

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        render(context, mgr, ids);
    }

    /** show() 每秒调用（内部 30s 节流）：通知刷新顺带刷小组件 */
    public static void updateAll(Context context) {
        try {
            long now = System.currentTimeMillis();
            if (now - sLastUi < UI_THROTTLE_MS) return;
            sLastUi = now;
            Context ctx = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            if (mgr == null) return;
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ScheduleWidgetProvider.class));
            if (ids == null || ids.length == 0) return;
            render(ctx, mgr, ids);
        } catch (Throwable ignored) {
        }
    }

    private static void render(Context ctx, AppWidgetManager mgr, int[] ids) {
        try {
            String[] snap = ScheduleNotifier.widgetSnapshot(ctx);
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget);
            if (snap != null) {
                rv.setTextViewText(R.id.w_top1, safe(snap[0]));
                rv.setTextViewText(R.id.w_top2, safe(snap[1]));
                rv.setTextViewText(R.id.w_n1, safe(snap[2]));
                rv.setTextViewText(R.id.w_n2, safe(snap[3]));
                rv.setTextViewText(R.id.w_n3, safe(snap[4]));
            } else {
                rv.setTextViewText(R.id.w_top1, "🐔🩸课表");
                rv.setTextViewText(R.id.w_top2, "打开应用查看今日课程");
                rv.setTextViewText(R.id.w_n1, " ");
                rv.setTextViewText(R.id.w_n2, " ");
                rv.setTextViewText(R.id.w_n3, " ");
            }
            rv.setOnClickPendingIntent(R.id.w_root, ScheduleNotifier.launchIntent(ctx));
            for (int id : ids) {
                mgr.updateAppWidget(id, rv);
            }
        } catch (Throwable ignored) {
        }
    }

    private static String safe(String s) {
        return (s == null || s.isEmpty()) ? " " : s;
    }
}
