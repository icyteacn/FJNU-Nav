package com.feike.schedule;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
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
        installJsBridge(); // 页面可调用的少量原生能力（电池白名单引导等）
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
        try {
            Bridge bridge = getBridge();
            if (bridge == null) {
                Log.w(TAG, "deep link: bridge not ready, view=" + v);
                return;
            }
            final WebView web = bridge.getWebView();
            if (web == null) {
                Log.w(TAG, "deep link: webview null, view=" + v);
                return;
            }
            // 300ms 后开始尝试：此时 Capacitor 才刚把首页交给 WebView
            web.postDelayed(new Runnable() {
                @Override
                public void run() {
                    navigateDeepLink(web, v, 0);
                }
            }, 300);
        } catch (Throwable e) {
            Log.w(TAG, "deep link error, view=" + v, e);
        }
    }

    /**
     * 深链跳转：**必须给绝对 URL**，origin 只能来自 WebView 当前地址。
     *
     * 【两次踩坑记录，别再走回头路】
     * 1) 旧实现把 getServerUrl() 直接拼成 "base + /index.html?view=x"，且 catch 静默吞异常；
     *    onCreate 早期 serverUrl 可能为空 → 拼出 "/index.html?view=x" → 打不开且无任何线索。
     * 2) 改成"拿不到 base 就用相对 URL"同样不行：WebView.loadUrl() 不按当前页解析相对路径，
     *    会把 "standalone-schedule.html?view=week" 当成域名 → 补成
     *    http://standalone-schedule.html/?view=week → Android 9+ 直接
     *    ERR_CLEARTEXT_NOT_PERMITTED（Capacitor 只对 localhost 放行明文）。
     * 因此：origin 取自 web.getUrl()（此刻必为 https://localhost），拿不到就等下一轮重试。
     */
    private void navigateDeepLink(final WebView web, final String v, final int attempt) {
        try {
            String origin = originOf(web.getUrl());
            if (origin == null) origin = originOf(serverUrlSafe());
            if (origin == null) {
                if (attempt < 8) { // 最多等约 3.2s，冷启动首帧慢的机型也够
                    web.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            navigateDeepLink(web, v, attempt + 1);
                        }
                    }, 400);
                } else {
                    Log.w(TAG, "deep link given up: no absolute origin after retries, view=" + v);
                }
                return;
            }
            String url = origin + "/standalone-schedule.html?view=" + v;
            Log.i(TAG, "deep link -> " + url + " (attempt " + attempt + ")");
            web.loadUrl(url);
            // 校验：1s 后若仍不在目标页，再补一次（部分机型首次 loadUrl 会被首帧加载盖掉）
            if (attempt < 2) {
                web.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String cur = web.getUrl();
                            if (cur == null || cur.indexOf("view=" + v) < 0) {
                                navigateDeepLink(web, v, attempt + 1);
                            }
                        } catch (Throwable ignored) {
                        }
                    }
                }, 1000);
            }
        } catch (Throwable e) {
            Log.w(TAG, "deep link navigate failed, view=" + v, e);
        }
    }

    /** 取 origin（scheme://host[:port]）；about:blank / data: / 非法地址一律返回 null */
    private static String originOf(String u) {
        if (u == null) return null;
        String s = u.trim();
        if (s.isEmpty() || s.startsWith("about:") || s.startsWith("data:") || s.startsWith("blob:")) return null;
        try {
            Uri uri = Uri.parse(s);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (scheme == null || host == null) return null;
            if (!"http".equals(scheme) && !"https".equals(scheme)) return null;
            int port = uri.getPort();
            return scheme + "://" + host + (port > 0 ? ":" + port : "");
        } catch (Throwable t) {
            return null;
        }
    }

    private String serverUrlSafe() {
        try {
            Bridge b = getBridge();
            if (b == null) return null;
            String s = b.getServerUrl();
            return s == null ? null : s.trim();
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * 返回键接管（Android 用户的肌肉记忆，不该一按就退出应用）。
     *
     * 顺序：页面若消费（关闭当前弹层 / 从单日视图回到周课表）→ 什么都不做；
     *      否则 WebView 有历史 → 后退；再否则才退出。
     * 注意 evaluateJavascript 是异步的，所以这里**不调用 super**，由回调决定是否 finish。
     */
    @Override
    public void onBackPressed() {
        try {
            Bridge bridge = getBridge();
            final WebView web = bridge == null ? null : bridge.getWebView();
            if (web != null) {
                web.evaluateJavascript(
                        "(function(){try{return window.__feikeBack?window.__feikeBack()===true:false}catch(e){return false}})()",
                        value -> {
                            try {
                                if ("true".equals(value)) return;      // 页面已处理
                                if (web.canGoBack()) {
                                    web.goBack();
                                    return;
                                }
                                finish();                               // 真的到头了才退出
                            } catch (Throwable e) {
                                finish();
                            }
                        });
                return;
            }
        } catch (Throwable e) {
            Log.w(TAG, "onBackPressed fallback", e);
        }
        super.onBackPressed();
    }

    /**
     * 给网页暴露极少量原生能力（对象名 FeikeNative）。
     * 只暴露「打开电池优化设置」这类无副作用动作，且页面加载的是本地 assets，风险可控。
     * 用途：国产 ROM（MIUI/ColorOS/EMUI…）会杀后台，是「课前提醒不响」的头号原因，
     * 需要引导用户把本应用加进电池优化白名单。
     */
    private void installJsBridge() {
        try {
            Bridge bridge = getBridge();
            WebView web = bridge == null ? null : bridge.getWebView();
            if (web == null) {
                Log.w(TAG, "js bridge skipped: webview null");
                return;
            }
            web.addJavascriptInterface(new FeikeBridge(), "FeikeNative");
            Log.i(TAG, "js bridge installed");
        } catch (Throwable e) {
            Log.w(TAG, "js bridge install failed", e);
        }
    }

    /** 暴露给网页的能力集合 */
    private class FeikeBridge {
        @JavascriptInterface
        public boolean isIgnoringBattery() {
            return MainActivity.this.isIgnoringBattery();
        }

        @JavascriptInterface
        public void openBatterySettings() {
            MainActivity.this.openBatterySettings();
        }

        @JavascriptInterface
        public String apkVersion() {
            return "1.3";
        }
    }

    /** 是否已在电池优化白名单里（Android 6 以下视为已优化） */
    private boolean isIgnoringBattery() {
        try {
            if (Build.VERSION.SDK_INT < 23) return true;
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            return pm != null && pm.isIgnoringBatteryOptimizations(getPackageName());
        } catch (Throwable t) {
            return true; // 判断不了就当已优化，避免无端打扰用户
        }
    }

    /** 打开系统的电池优化白名单列表（无需任何权限；拿不到就退到应用详情页） */
    private void openBatterySettings() {
        try {
            Intent i = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
            return;
        } catch (Throwable ignored) {
        }
        try {
            Intent i2 = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i2.setData(android.net.Uri.parse("package:" + getPackageName()));
            i2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i2);
        } catch (Throwable e) {
            Log.w(TAG, "open battery settings failed", e);
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
