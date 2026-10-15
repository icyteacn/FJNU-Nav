package com.feike.schedule;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int REQ_POST_NOTIFICATIONS = 1002;

    /** 静态快捷键 / 深链带来的目标视图（today / next / week），启动后一次性消费 */
    private String pendingView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        pendingView = extractView(getIntent());
        super.onCreate(savedInstanceState);
        requestNotificationPermission(); // Android 13+：常驻通知需运行时授权
        ScheduleNotifier.scheduleHourly(this); // 每小时刷新通知
        ScheduleNotifier.startLiveUpdates(this); // 30s 倒计时重绘 + notify.json 监听
        ScheduleNotifier.show(this); // 每次打开 App 都刷新今日概要
        consumePendingView(); // 长按图标进来的「今日 / 下一节课 / 课表」
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String v = extractView(intent);
        if (v != null) {
            pendingView = v;
            consumePendingView();
        }
    }

    /** 取目标视图：优先 extra "view"，其次 Uri（如 feike://today） */
    private String extractView(Intent intent) {
        try {
            if (intent == null) return null;
            String v = intent.getStringExtra("view");
            if (v == null || v.isEmpty()) {
                Uri d = intent.getData();
                if (d != null) v = d.getHost();
            }
            if (v == null) return null;
            v = v.trim().toLowerCase();
            if ("today".equals(v) || "next".equals(v) || "week".equals(v)) return v;
            return null;
        } catch (Throwable ignored) {
            return null;
        }
    }

    /**
     * 把 WebView 定位到 index.html?view=xxx。
     * trim-apk-assets 生成的 index.html 垫片会保留 location.search 转发到 standalone-schedule.html，
     * 因此这里只需带上查询串，网页端 applyDeepLink() 负责切换视图。
     */
    private void consumePendingView() {
        final String v = pendingView;
        if (v == null) return;
        pendingView = null;
        try {
            Bridge bridge = getBridge();
            if (bridge == null) return;
            final WebView web = bridge.getWebView();
            if (web == null) return;
            final String base = bridge.getServerUrl();
            web.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        web.loadUrl((base == null ? "" : base) + "/index.html?view=" + v);
                    } catch (Throwable ignored) {
                    }
                }
            });
        } catch (Throwable ignored) {
        }
    }

    private void requestNotificationPermission() {
        try {
            if (Build.VERSION.SDK_INT >= 33
                    && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_POST_NOTIFICATIONS);
            }
        } catch (Throwable ignored) {
        }
    }
}
