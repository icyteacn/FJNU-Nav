package com.feike.schedule;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.widget.RemoteViews;

/**
 * 「下一节课」2x2 小组件。
 *
 * 与 4x2 组件（{@link ScheduleWidgetProvider}）**共用同一份数据源**：
 *   notify.json → {@link ScheduleNotifier#widgetSnapshot(Context)} 的三行快照
 *     snap[0] 状态行（正在上课 / 下一节课 / 今日已上完 / 假期…）
 *     snap[1] 下一节课（时间 · 课名 · 教室）
 *     snap[2] 倒计时（距开始 / 距下课）
 * 差别只在于版式：2x2 空间小，把三者竖排并加粗课程名与倒计时，桌面一眼可读。
 *
 * 刷新沿用 4x2 的策略：每次 show() 调用 {@link #updateAll}（内部 30s 节流）
 * + 系统 updatePeriodMillis（30 分钟）兜底；点击任一位置打开应用今日视图。
 */
public class ScheduleWidgetProviderNext extends AppWidgetProvider {

    private static long sLastUi;

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        render(context, mgr, ids);
    }

    /** 与 4x2 组件同源调用；失败一律静默（组件不应影响主流程） */
    public static void updateAll(Context context) {
        try {
            long now = System.currentTimeMillis();
            if (now - sLastUi < 30 * 1000L) return;
            sLastUi = now;
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
        try {
            String[] snap = ScheduleNotifier.widgetSnapshot(ctx);
            RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget_next);
            if (snap != null) {
                rv.setTextViewText(R.id.wn_state, safe(snap[0]));
                rv.setTextViewText(R.id.wn_course, safe(snap[1]));
                rv.setTextViewText(R.id.wn_clock, safe(snap[2]));
            } else {
                rv.setTextViewText(R.id.wn_state, ctx.getString(R.string.widget_next_default_state));
                rv.setTextViewText(R.id.wn_course, ctx.getString(R.string.widget_next_default_course));
                rv.setTextViewText(R.id.wn_clock, " ");
            }
            rv.setOnClickPendingIntent(R.id.wn_root, ScheduleNotifier.launchIntent(ctx));
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
