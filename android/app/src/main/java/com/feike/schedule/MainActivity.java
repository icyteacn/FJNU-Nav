package com.feike.schedule;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "FeikeSchedule";

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
     * 把 WebView 定位到「目标视图」。
     *
     * 【为什么以前会「网页无法打开」】旧实现直接把 getServerUrl() 的返回值拼成
     * "base + /index.html?view=xxx"，并且把所有异常都吞掉：
     *   · getServerUrl() 返回 null 或带尾斜杠时，拼出的地址非法（//index.html 或 /index.html 无 host），
     *     WebView 直接报「网页无法打开」，而手机上什么都看不到；
     *   · onCreate 里 super.onCreate() 刚跑完、Capacitor 正在加载首页，此时立刻 loadUrl 会与之打架。
     * 现在：① 地址规范化，拿不到 base 就用相对 URL 交给 WebView 解析；② 延迟到页面就绪再跳，
     * 并做一次兜底重试；③ 直接命中 APK 内真实页面 standalone-schedule.html（少一跳，
     * 该页面的 applyDeepLink() 读 location.search 切视图）；④ 全程打日志，出问题可查。
     */
    private void consumePendingView() {
        final String v = pendingView;
        if (v == null) return;
        pendingView = null;
        final String url = buildViewUrl(v);
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                Log.w(TAG, "deep link skipped: bridge not ready, view=" + v);
                return;
            }
            final WebView web = bridge.getWebView();
            if (web == null) {
                Log.w(TAG, "deep link skipped: webview null, view=" + v);
                return;
            }
            Log.i(TAG, "deep link -> " + url);
            // 400ms：给 Capacitor 首次加载首页让路；1200ms 再兜一次（部分机型首帧很慢）
            web.postDelayed(new Runnable() {
                @Override
                public void run() {
                    try {
                        web.loadUrl(url);
                    } catch (Throwable e) {
                        Log.w(TAG, "deep link loadUrl failed: " + url, e);
                    }
                }
            }, 400);
            web.postDelayed(new Runnable() {
                @Override
                public void run() {
                    try {
                        String cur = web.getUrl();
                        if (cur != null && cur.indexOf("view=" + v) >= 0) return; // 已经在目标页
                        web.loadUrl(url);
                    } catch (Throwable e) {
                        Log.w(TAG, "deep link retry failed: " + url, e);
                    }
                }
            }, 1200);
        } catch (Throwable e) {
            Log.w(TAG, "deep link error, view=" + v, e);
        }
    }

    /** 拼目标视图地址：base 规范化；拿不到 base 就返回相对 URL，由 WebView 按当前页解析 */
    private String buildViewUrl(String v) {
        String base = "";
        try {
            Bridge bridge = getBridge();
            if (bridge != null) base = String.valueOf(bridge.getServerUrl());
        } catch (Throwable ignored) {
        }
        base = base.trim();
        while (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String path = "standalone-schedule.html?view=" + v;
        if (base.isEmpty()) return path;          // 相对 URL
        if (base.indexOf("://") < 0) return path; // 不是合法绝对地址就别硬拼
        return base + "/" + path;
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
