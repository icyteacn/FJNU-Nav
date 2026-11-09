<!-- 文件路径: /fjnu-nav/app-uniapp/pages/events/events.vue -->
<template>
  <view class="page safe-bottom">
    <view v-if="!items.length && !loading" class="empty">
      <text>近期暂无日程活动</text>
    </view>
    <view v-if="loading" class="empty"><text>加载中…</text></view>

    <view v-for="(g, date) in grouped" :key="date" class="card">
      <view class="g-date">
        <text class="d1">{{ date }}</text>
        <text class="d2" v-if="flagOf(date)">{{ flagOf(date).label || flagOf(date).type }}</text>
      </view>
      <view v-for="(e, i) in g" :key="i" class="ev" @click="show(e)">
        <view class="ev-time">{{ e.time || '全天' }}</view>
        <view class="ev-body">
          <text class="ev-title">{{ e.title }}</text>
          <text class="ev-sub" v-if="e.location">📍 {{ e.location }}</text>
          <text class="ev-sub" v-if="e.audience">👥 {{ e.audience }}</text>
        </view>
        <text class="ev-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { fetchSchedule } from '../../utils/api.js';

const items = ref([]);
const grouped = ref({});
const flags = ref({});
const loading = ref(true);

function flagOf(date) { return flags.value[date]; }
function show(e) {
  const parts = [`时间：${e.date} ${e.time || ''}`.trim()];
  if (e.location) parts.push(`地点：${e.location}`);
  if (e.audience) parts.push(`受众：${e.audience}`);
  if (e.prep && e.prep.length) parts.push('准备：\n· ' + e.prep.join('\n· '));
  if (e.tip) parts.push('\n提示：' + e.tip);
  uni.showModal({ title: e.title, content: parts.join('\n'), showCancel: false });
}

onShow(async () => {
  loading.value = true;
  const j = await fetchSchedule();
  loading.value = false;
  if (!j) return;
  flags.value = j.holidayMap || {};
  const evs = (j.events || []).slice().sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  items.value = evs;
  const g = {};
  evs.forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
  grouped.value = g;
});
</script>

<style>
.g-date { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14rpx; }
.d1 { font-weight: 700; font-size: 30rpx; }
.d2 { font-size: 22rpx; color: #b45309; background: #fef3c7; padding: 4rpx 14rpx; border-radius: 999rpx; }
.ev { display: flex; align-items: center; padding: 16rpx 0; border-top: 1rpx solid #f0f1f5; }
.ev:first-of-type { border-top: none; }
.ev-time { width: 110rpx; color: #1565c0; font-weight: 600; font-size: 26rpx; flex-shrink: 0; }
.ev-body { flex: 1; display: flex; flex-direction: column; }
.ev-title { font-size: 28rpx; font-weight: 500; }
.ev-sub { font-size: 22rpx; color: #8a8f99; margin-top: 4rpx; }
.ev-arrow { color: #c0c4cc; font-size: 36rpx; }
.empty { display: flex; align-items: center; justify-content: center; padding: 100rpx 0; color: #8a8f99; }
</style>
