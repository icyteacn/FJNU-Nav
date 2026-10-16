package com.feike.schedule;

import android.widget.RemoteViews;

/**
 * 桌面小组件公共渲染工具。
 *
 * 这些方法原先挂在 4x2 课表组件（ScheduleWidgetProvider）上，却被 2x2「下一节课」与
 * 1x1「今日」复用；该组件在部分桌面「一添加就失败」，已按要求移除（只留 2x2 / 1x1）。
 * 于是把共用能力独立到本类，避免"删一个组件带崩另外两个"。
 */
final class WidgetKit {

    private WidgetKit() {
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
}
