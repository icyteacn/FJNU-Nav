package com.feike.schedule;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.widget.RemoteViews;

/**
 * 2x2「下一节课」小组件：倒计时是主角（超大字重），下方给出课程、教室与今日进度条。
 * 数据来自 {@link ScheduleNotifier#widgetDashboard}，与课表组件同一份面板。
 */
public class ScheduleWidgetProviderNext extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        render(context, mgr, ids);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, android.os.Bundle newOptions) {
        try {
            renderOne(context.getApplicationContext(), mgr, id);
        } catch (Throwable ignored) {
        }
    }

    public static void updateAll(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            if (mgr == null) return;
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ScheduleWidgetProviderNext.class));
            if (ids == null || ids.length == 0) return;
            render(ctx, mgr, ids);
        } catch (Throwable ignored) {
        }
    }

    private static void render(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) renderOne(ctx, mgr, id);
    }

    private static void renderOne(Context ctx, AppWidgetManager mgr, int id) {
        try {
            String[] d = ScheduleNotifier.widgetDashboard(ctx);
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget_next);
            rv.setTextViewText(R.id.wn_date, d[ScheduleNotifier.W_DATE]);
            WidgetKit.applyBadge(rv, R.id.wn_badge, d);
            rv.setTextViewText(R.id.wn_count, d[ScheduleNotifier.W_COUNT]);
            rv.setTextViewText(R.id.wn_title, d[ScheduleNotifier.W_TITLE]);
            rv.setTextViewText(R.id.wn_sub, d[ScheduleNotifier.W_SUB]);
            rv.setTextViewText(R.id.wn_progress, d[ScheduleNotifier.W_PROGRESS]);
            try {
                int pct = Integer.parseInt(d[ScheduleNotifier.W_PCT]);
                rv.setProgressBar(R.id.wn_bar, 100, Math.max(0, Math.min(100, pct)), false);
            } catch (Throwable ignored) {
                rv.setProgressBar(R.id.wn_bar, 100, 0, false);
            }
            rv.setOnClickPendingIntent(R.id.wn_root, ScheduleNotifier.launchIntentView(ctx, "next"));
            rv.setOnClickPendingIntent(R.id.wn_title, ScheduleNotifier.launchIntentView(ctx, "today"));
            rv.setOnClickPendingIntent(R.id.wn_badge, ScheduleNotifier.launchIntentView(ctx, "week"));
            mgr.updateAppWidget(id, rv);
        } catch (Throwable ignored) {
        }
    }
}
