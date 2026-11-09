<!-- 文件路径: /fjnu-nav/app-uniapp/pages/about/about.vue -->
<template>
  <view class="page safe-bottom">
    <view class="card center">
      <view class="logo">📚</view>
      <view class="name">福star课表</view>
      <view class="mut">v1.0.0 · 数据与福star导航网站同步</view>
    </view>

    <view class="card">
      <view class="row-item" @click="refresh">
        <text>🔄 刷新课表数据</text>
        <text class="mut">{{ refreshText }}</text>
      </view>
      <view class="row-item" @click="copySite">
        <text>🌐 打开网页版（复制链接）</text>
        <text class="mut">icyteacn.github.io/FJNU-Nav</text>
      </view>
      <view class="row-item" @click="clearCache">
        <text>🗑 清除本地缓存</text>
        <text class="mut">重新拉取全部数据</text>
      </view>
    </view>

    <view class="card">
      <view class="sec-title">数据说明</view>
      <view class="mut li">· 课表/日程与福star导航同源：data/schedule-data.json，App 启动自动同步、离线用缓存</view>
      <view class="mut li">· 数据仅供参考，以教务处正式通知为准</view>
      <view class="mut li">· 本应用数据存本机，不上传任何个人信息</view>
    </view>

    <view class="card">
      <view class="sec-title">iOS 打包说明（HBuilderX 云打包）</view>
      <view class="mut li">1. HBuilderX 打开本目录 → manifest.json 填 DCloud appid 与 iOS 证书（p12+描述文件）</view>
      <view class="mut li">2. 菜单 发行 → 原生App-云打包 → iOS(ipa) → 选证书打包</view>
      <view class="mut li">3. 生成 .ipa 后可用爱思助手/AltStore/TestFlight 安装到手机</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { fetchSchedule, SITE_URL, cacheTime } from '../../utils/api.js';

const refreshText = ref(cacheTime() ? `上次 ${cacheTime()}` : '点击同步最新数据');

async function refresh() {
  refreshText.value = '同步中…';
  const j = await fetchSchedule(true);
  refreshText.value = j ? `已更新（${cacheTime()}）` : '同步失败，请检查网络';
}
function copySite() {
  uni.setClipboardData({
    data: SITE_URL,
    success: () => uni.showToast({ title: '链接已复制' }),
  });
}
function clearCache() {
  uni.showModal({
    title: '清除缓存', content: '将清空课表缓存并重新拉取，确定？',
    success: r => {
      if (!r.confirm) return;
      uni.removeStorageSync('fjnu_schedule_cache_v1');
      uni.removeStorageSync('fjnu_schedule_cache_time');
      refresh();
    },
  });
}
</script>

<style>
.center { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.logo { font-size: 72rpx; }
.name { font-size: 34rpx; font-weight: 700; margin-top: 12rpx; }
.row-item { display: flex; align-items: center; justify-content: space-between; padding: 26rpx 0; border-bottom: 1rpx solid #f0f1f5; }
.row-item:last-child { border-bottom: none; }
.row-item:active { opacity: .6; }
.sec-title { font-weight: 600; margin-bottom: 12rpx; }
.li { line-height: 1.8; }
</style>
