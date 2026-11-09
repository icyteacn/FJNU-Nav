<!-- 文件路径: /fjnu-nav/app-uniapp/pages/index/index.vue -->
<template>
  <view class="page safe-bottom">
    <view class="hero">
      <view class="hero-title">福star导航</view>
      <view class="hero-sub">福建师范大学 · 研究生服务台</view>
      <view class="hero-week" v-if="week">第 {{ week }} 教学周 · {{ todayStr }}</view>
    </view>

    <view v-for="g in groups" :key="g.group" class="card">
      <view class="g-title">{{ g.group }}</view>
      <view class="grid">
        <view v-for="a in g.apps" :key="a.id" class="cell" @click="open(a)">
          <view class="ic" :style="{ background: a.color + '18', color: a.color }">{{ a.icon }}</view>
          <text class="t">{{ a.title }}</text>
          <text class="d" v-if="a.desc">{{ a.desc }}</text>
        </view>
      </view>
    </view>

    <view class="foot mut">点击图标：本端已内置的直接打开，其余复制网页版链接后浏览器访问</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { APP_GROUPS } from '../../data/apps.js';
import { fetchSchedule, SITE_URL } from '../../utils/api.js';
import { currentWeek, fmtDate } from '../../utils/schedule.js';

const groups = APP_GROUPS;
const week = ref(0);
const todayStr = computed(() => {
  const d = new Date();
  const cn = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 周${cn[d.getDay()]}`;
});

onShow(async () => {
  const data = await fetchSchedule();
  if (data && data.semesterStart) {
    week.value = currentWeek(data.semesterStart);
  }
});

function open(a) {
  if (a.native && a.tab) {
    uni.switchTab({ url: a.tab });
    return;
  }
  const url = SITE_URL + a.url;
  uni.setClipboardData({
    data: url,
    success: () => uni.showModal({
      title: a.title,
      content: '该功能为网页版，链接已复制：\n' + url + '\n\n请在浏览器中打开使用。',
      showCancel: false,
    }),
  });
}
</script>

<style>
.page { min-height: 100vh; }
.hero {
  background: linear-gradient(135deg, #1565c0, #1e88e5);
  color: #fff; padding: 48rpx 32rpx 36rpx;
}
.hero-title { font-size: 44rpx; font-weight: 700; }
.hero-sub { opacity: .85; margin-top: 8rpx; font-size: 26rpx; }
.hero-week { margin-top: 16rpx; font-size: 24rpx; background: rgba(255,255,255,.18); display: inline-block; padding: 6rpx 20rpx; border-radius: 999rpx; }
.g-title { font-size: 30rpx; font-weight: 600; margin-bottom: 18rpx; }
.grid { display: flex; flex-wrap: wrap; }
.cell { width: 33.33%; padding: 18rpx 8rpx; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
.cell:active { opacity: .6; }
.ic { width: 88rpx; height: 88rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; font-size: 44rpx; }
.t { margin-top: 12rpx; font-size: 26rpx; font-weight: 500; }
.d { font-size: 20rpx; color: #8a8f99; margin-top: 4rpx; }
.foot { text-align: center; padding: 30rpx 40rpx; line-height: 1.6; }
</style>
