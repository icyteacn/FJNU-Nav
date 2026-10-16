package com.feike.schedule;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.os.Bundle;
import android.widget.RemoteViews;

/**
 * 课表小组件（尺寸自适应）。
 *
 * 数据源与常驻通知同源：notify.json → {@link ScheduleNotifier#widgetDashboard}，
 * 三套组件共用同一份面板数据，因此口径永远一致、也不会各读各的解析出不同结果。
 *
 *   · 紧凑 {@code schedule_widget}（默认 4x2）：日期 / 状态徽章 / 课程 / 教室·节次 / 倒计时 + 今日进度
 *   · 大号 {@code schedule_widget_large}（高度 ≥170dp 自动切换）：上面全部 + 今日进度条 +
 *     今日剩余课程（最多 4 条）+ 底部明日首节 —— 拉伸后信息真的变多，而不是把几行硬撑开
 *
 * 点击分流：整体→今日、徽章→本周课表、倒计时→下一节课。
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

    /** 用户拖动改变大小时立刻重排（不等 30s 节流） */
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
                if (o != null) {
                    tall = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) >= TALL_THRESHOLD_DP;
                }
            } catch (Throwable ignored) {
            }
            if (tall) renderTall(ctx, mgr, id);
            else renderCompact(ctx, mgr, id);
        } catch (Throwable ignored) {
        }
    }

    /** 状态徽章按 kind 换底色与字色（绿=在上课 / 金=下一节 / 蓝=假期 / 灰=空闲） */
    static void applyBadge(RemoteViews rv, int viewId, String[] d) {
        int kind = ScheduleNotifier.KIND_IDLE;
        try {
            kind = Integer.parseInt(d[ScheduleNotifier.W_KIND]);
        } catch (Throwable ignored) {
        }
        int bg;
        int fg;
        if (kind == ScheduleNotifier.KIND_LIVE) {
            bg = R.drawable.badge_live;
            fg = 0xFFD8FFF0;
        } else if (kind == ScheduleNotifier.KIND_NEXT) {
            bg = R.drawable.badge_next;
            fg = 0xFFFFE9B0;
        } else if (kind == ScheduleNotifier.KIND_HOLIDAY) {
            bg = R.drawable.badge_holiday;
            fg = 0xFFD3E7FF;
        } else {
            bg = R.drawable.badge_idle;
            fg = 0xFFCBD8E6;
        }
        rv.setTextViewText(viewId, d[ScheduleNotifier.W_BADGE]);
        rv.setTextColor(viewId, fg);
        // RemoteViews 没有 setBackgroundResource 直调方法，要用 setInt 走反射 setter
        rv.setInt(viewId, "setBackgroundResource", bg);
    }

    private static void setProgress(RemoteViews rv, int viewId, String[] d) {
        try {
            int pct = Integer.parseInt(d[ScheduleNotifier.W_PCT]);
            rv.setProgressBar(viewId, 100, Math.max(0, Math.min(100, pct)), false);
        } catch (Throwable ignored) {
            rv.setProgressBar(viewId, 100, 0, false);
        }
    }

    private static void renderCompact(Context ctx, AppWidgetManager mgr, int id) {
        String[] d = ScheduleNotifier.widgetDashboard(ctx);
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget);
        rv.setTextViewText(R.id.w_date, d[ScheduleNotifier.W_DATE]);
        applyBadge(rv, R.id.w_badge, d);
        rv.setTextViewText(R.id.w_title, d[ScheduleNotifier.W_TITLE]);
        rv.setTextViewText(R.id.w_sub, d[ScheduleNotifier.W_SUB]);
        rv.setTextViewText(R.id.w_count, d[ScheduleNotifier.W_COUNT]);
        rv.setTextViewText(R.id.w_progress, d[ScheduleNotifier.W_PROGRESS]);
        rv.setOnClickPendingIntent(R.id.w_root, ScheduleNotifier.launchIntentView(ctx, "today"));
        rv.setOnClickPendingIntent(R.id.w_badge, ScheduleNotifier.launchIntentView(ctx, "week"));
        rv.setOnClickPendingIntent(R.id.w_count, ScheduleNotifier.launchIntentView(ctx, "next"));
        mgr.updateAppWidget(id, rv);
    }

    private static void renderTall(Context ctx, AppWidgetManager mgr, int id) {
        String[] d = ScheduleNotifier.widgetDashboard(ctx);
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.schedule_widget_large);
        rv.setTextViewText(R.id.wl_date, d[ScheduleNotifier.W_DATE]);
        applyBadge(rv, R.id.wl_badge, d);
        rv.setTextViewText(R.id.wl_title, d[ScheduleNotifier.W_TITLE]);
        rv.setTextViewText(R.id.wl_sub, d[ScheduleNotifier.W_SUB]);
        rv.setTextViewText(R.id.wl_count, d[ScheduleNotifier.W_COUNT]);
        rv.setTextViewText(R.id.wl_progress, d[ScheduleNotifier.W_PROGRESS]);
        setProgress(rv, R.id.wl_bar, d);
        int[] rows = {R.id.wl_c1, R.id.wl_c2, R.id.wl_c3, R.id.wl_c4};
        for (int i = 0; i < rows.length; i++) {
            String v = d[ScheduleNotifier.W_C1 + i];
            boolean blank = v == null || v.trim().isEmpty();
            if (blank) {
                rv.setViewVisibility(rows[i], android.view.View.GONE);
            } else {
                rv.setViewVisibility(rows[i], android.view.View.VISIBLE);
                rv.setTextViewText(rows[i], v);
            }
        }
        rv.setTextViewText(R.id.wl_foot, d[ScheduleNotifier.W_FOOT]);
        rv.setOnClickPendingIntent(R.id.wl_root, ScheduleNotifier.launchIntentView(ctx, "today"));
        rv.setOnClickPendingIntent(R.id.wl_badge, ScheduleNotifier.launchIntentView(ctx, "week"));
        rv.setOnClickPendingIntent(R.id.wl_count, ScheduleNotifier.launchIntentView(ctx, "next"));
        rv.setOnClickPendingIntent(R.id.wl_foot, ScheduleNotifier.launchIntentView(ctx, "week"));
        mgr.updateAppWidget(id, rv);
    }
}
