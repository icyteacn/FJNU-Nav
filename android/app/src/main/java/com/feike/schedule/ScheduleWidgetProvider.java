package com.feike.schedule;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.os.Bundle;
import android.widget.RemoteViews;

/**
 * 课表小组件（自适应尺寸）。
 *
 * 数据源与常驻通知同源：notify.json → {@link ScheduleNotifier}。
 *   · 紧凑布局 {@code schedule_widget}：状态行 / 下一节课 / 倒计时三行（默认 4x2）
 *   · 大号布局 {@code schedule_widget_large}：状态行 + 今日后续课程（最多 4 条）+ 底部倒计时
 *     —— 由 {@link #onAppWidgetOptionsChanged} 按实际高度自动切换，因此**拉伸后内容会变多，
 *     而不是把三行硬撑开**（这是「可拉伸」真正的意义）。
 *
 * 刷新沿用既有策略：show() 每次调用 {@link #updateAll}（30s 节流）+ 系统 updatePeriodMillis 兜底。
 */
public class ScheduleWidgetProvider extends AppWidgetProvider {

    /** 高于该高度（dp）切到大号布局 */
    private static final int TALL_THRESHOLD_DP = 170;
    private static final long UI_THROTTLE_MS = 30 * 1000L;
    private static long sLastUi;

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        render(context, mgr, ids);
    }

    /** 用户拖动改变大小时立刻重排（不依赖 30s 节流） */
    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, Bundle newOptions) {
        try {
            renderOne(context.getApplicationContext(), mgr, id);
        } catch (Throwable ignored) {
        }
    }

    /** 通知/网页每次刷新后调用；内部节流，避免频繁重绘 */
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
        for (int id : ids) renderOne(ctx, mgr, id);
    }

    private static void renderOne(Context ctx, AppWidgetManager mgr, int id) {
        try {
            boolean tall = false;
            try {
                Bundle o = mgr.getAppWidgetOptions(id);
                if (o != null) tall = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) >= TALL_THRESHOLD_DP;
            } catch (Throwable ignored) {
            }
            if (tall) renderTall(ctx, mgr, id);
            else renderCompact(ctx, mgr, id);
        } catch (Throwable ignored) {
        }
    }

    private static void renderCompact(Context ctx, AppWidgetManager mgr, int id) {
        String[] snap = ScheduleNotifier.widgetSnapshot(ctx);
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget);
        if (snap != null) {
            rv.setTextViewText(R.id.w_top1, safe(snap[0]));
            rv.setTextViewText(R.id.w_top2, safe(snap[1]));
            rv.setTextViewText(R.id.w_top3, safe(snap[2]));
        } else {
            rv.setTextViewText(R.id.w_top1, ctx.getString(R.string.widget_brand));
            rv.setTextViewText(R.id.w_top2, ctx.getString(R.string.widget_placeholder_hint));
            rv.setTextViewText(R.id.w_top3, " ");
        }
        rv.setOnClickPendingIntent(R.id.w_root, ScheduleNotifier.launchIntentView(ctx, "today"));
        mgr.updateAppWidget(id, rv);
    }

    private static void renderTall(Context ctx, AppWidgetManager mgr, int id) {
        String[] lines = ScheduleNotifier.widgetTodayLines(ctx);
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget_large);
        int[] rows = { R.id.wl_c1, R.id.wl_c2, R.id.wl_c3, R.id.wl_c4 };
        if (lines != null && lines.length > 0) {
            rv.setTextViewText(R.id.wl_state, safe(lines[0]));
            for (int i = 0; i < rows.length; i++) {
                int idx = i + 1;
                if (idx < lines.length) {
                    rv.setViewVisibility(rows[i], android.view.View.VISIBLE);
                    rv.setTextViewText(rows[i], safe(lines[idx]));
                } else {
                    rv.setViewVisibility(rows[i], android.view.View.GONE);
                }
            }
            // 末行单独显示时序信息（保持与常驻通知同源的“下一节倒计时”口径）
            String[] snap = ScheduleNotifier.widgetSnapshot(ctx);
            rv.setTextViewText(R.id.wl_foot, snap != null ? safe(snap[2]) : " ");
        } else {
            rv.setTextViewText(R.id.wl_state, ctx.getString(R.string.widget_brand));
            rv.setTextViewText(rows[0], ctx.getString(R.string.widget_placeholder_hint));
            rv.setViewVisibility(rows[1], android.view.View.GONE);
            rv.setViewVisibility(rows[2], android.view.View.GONE);
            rv.setViewVisibility(rows[3], android.view.View.GONE);
            rv.setTextViewText(R.id.wl_foot, " ");
        }
        rv.setOnClickPendingIntent(R.id.wl_root, ScheduleNotifier.launchIntentView(ctx, "today"));
        rv.setOnClickPendingIntent(R.id.wl_state, ScheduleNotifier.launchIntentView(ctx, "week"));
        rv.setOnClickPendingIntent(R.id.wl_foot, ScheduleNotifier.launchIntentView(ctx, "next"));
        mgr.updateAppWidget(id, rv);
    }

    private static String safe(String s) {
        return (s == null || s.isEmpty()) ? " " : s;
    }
}
