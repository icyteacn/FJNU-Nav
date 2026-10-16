package com.feike.schedule;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.widget.RemoteViews;

/**
 * 1x1「今日」小部件 —— 桌面一键直达今日课程。
 *
 * 为什么单独做一个小部件：App Shortcuts（长按图标）在部分国产桌面/启动器上不展示或不支持，
 * 而小部件是所有启动器都有的能力，因此它是最可靠的「免进应用即可直达」入口。
 *
 * 点击行为：`ScheduleNotifier.launchIntentView(ctx, "today")` → MainActivity 读取 extra `view`
 * → WebView 载入 `index.html?view=today`（单文件课表据此切到单日列表并定位今天）。
 */
public class ScheduleWidgetProviderToday extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        render(context, mgr, ids);
    }

    /** 与其它组件同批刷新（show() 调用链） */
    public static void updateAll(Context context) {
        try {
            Context ctx = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            if (mgr == null) return;
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ScheduleWidgetProviderToday.class));
            if (ids == null || ids.length == 0) return;
            render(ctx, mgr, ids);
        } catch (Throwable ignored) {
        }
    }

    private static void render(Context ctx, AppWidgetManager mgr, int[] ids) {
        try {
            String[] lines = ScheduleNotifier.widgetTodayLines(ctx);
            String sub = "查看课表";
            if (lines != null && lines.length > 1) {
                String first = lines[1];
                int sp = first.indexOf(' ');
                sub = sp > 0 ? first.substring(0, sp) : "查看课表";
            } else if (lines != null && lines.length > 0) {
                sub = "今日无课";
            }
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget_today);
            rv.setTextViewText(R.id.wt_label, ctx.getString(R.string.widget_today_label));
            rv.setTextViewText(R.id.wt_sub, sub);
            PendingIntent pi = ScheduleNotifier.launchIntentView(ctx, "today");
            rv.setOnClickPendingIntent(R.id.wt_root, pi);
            for (int id : ids) mgr.updateAppWidget(id, rv);
        } catch (Throwable ignored) {
        }
    }
}
