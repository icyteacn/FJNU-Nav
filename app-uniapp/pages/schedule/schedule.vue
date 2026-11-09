<!-- 文件路径: /fjnu-nav/app-uniapp/pages/schedule/schedule.vue -->
<template>
  <view class="page safe-bottom">
    <!-- 顶部：专业 + 周切换 -->
    <view class="top">
      <picker mode="selector" :range="majorLabels" :value="majorIdx" @change="onMajor">
        <view class="major-pick">{{ majorLabel }} ▾</view>
      </picker>
      <view class="week-pick">
        <text class="wk-btn" @click="shiftWeek(-1)">‹</text>
        <text class="wk">第 {{ week }} 周</text>
        <text class="wk-btn" @click="shiftWeek(1)">›</text>
      </view>
    </view>
    <view class="src mut" v-if="source==='cache'">⚠ 离线缓存数据（{{ cacheT }} 更新）</view>

    <!-- 周视图 -->
    <scroll-view scroll-x class="week-scroll" :scroll-left="scrollLeft">
      <view class="week-grid">
        <view class="col head">
          <view class="cell-h">节次</view>
          <view v-for="p in 12" :key="p" class="cell-p">
            <text class="pn">{{ p }}</text>
            <text class="pt">{{ periodShort(p) }}</text>
          </view>
        </view>
        <view v-for="d in 7" :key="d" class="col">
          <view class="cell-h" :class="{ today: isToday(d) }">
            <text>周{{ weekCn[d-1] }}</text>
            <text class="hd">{{ dayLabel(d) }}</text>
          </view>
          <view class="day-body">
            <view v-for="c in coursesOf(d)" :key="c.id || c.name + c.startPeriod"
                  class="course" :style="courseStyle(c)" @click="showCourse(c)">
              <text class="cn">{{ c.name }}</text>
              <text class="cl">{{ c.location }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空态 -->
    <view v-if="!loading && !courses.length" class="empty">
      <text>本周没有课程</text>
      <text class="mut">可切换周次或专业查看</text>
    </view>
    <view v-if="loading" class="empty"><text>加载中…</text></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { fetchSchedule, scheduleSource, cacheTime } from '../../utils/api.js';
import { weekCourses, currentWeek, mondayOf, addDays, fmtDate, WEEK_CN } from '../../utils/schedule.js';

const data = ref(null);
const courses = ref([]);
const week = ref(1);
const majorIdx = ref(0);
const loading = ref(true);
const source = scheduleSource;
const cacheT = computed(() => cacheTime());
const weekCn = WEEK_CN;

const majors = computed(() => (data.value && data.value.majors) || []);
const majorLabels = computed(() => majors.value.map(m => m.label));
const majorLabel = computed(() => (majors.value[majorIdx.value] || {}).short || '选择专业');
const majorKey = computed(() => (majors.value[majorIdx.value] || {}).key || '');

const weekMonday = computed(() => addDays(mondayOf(), (week.value - currentWeek((data.value || {}).semesterStart || fmtDate(new Date()))) * 7));
const scrollLeft = computed(() => {
  const today = new Date().getDay();
  return today >= 6 ? 700 : 0;
});

function load() {
  if (!data.value) return;
  courses.value = weekCourses(data.value, majorKey.value, week.value);
}
function coursesOf(weekday) {
  return courses.value.filter(c => c.weekday === weekday);
}
function courseStyle(c) {
  const top = (c.startPeriod - 1) * 88;
  const h = Math.max(1, c.endPeriod - c.startPeriod + 1) * 88 - 6;
  return { top: top + 'rpx', height: h + 'rpx', background: (c.color || '#1565c0') + 'e6' };
}
function isToday(d) {
  const t = new Date();
  return fmtDate(addDays(weekMonday.value, d - 1)) === fmtDate(t);
}
function dayLabel(d) {
  const t = addDays(weekMonday.value, d - 1);
  return `${t.getMonth() + 1}/${t.getDate()}`;
}
function periodShort(p) {
  const t = ((data.value || {}).periodTimes || {})[p] || '';
  return t.split('-')[0];
}
function onMajor(e) {
  majorIdx.value = +e.detail.value;
  uni.setStorageSync('fjnu_major_idx', majorIdx.value);
  load();
}
function shiftWeek(n) {
  week.value = Math.min(25, Math.max(1, week.value + n));
  load();
}
function showCourse(c) {
  uni.showModal({
    title: c.name,
    content: `教师：${c.teacher || '-'}\n教室：${c.location || '-'}\n周次：第${c.weeks}周\n节次：${c.startPeriod}-${c.endPeriod}节\n学分：${c.credits || '-'}（${c.hours || '-'}学时）`,
    showCancel: false,
  });
}

async function boot(force) {
  loading.value = true;
  const j = await fetchSchedule(force);
  data.value = j;
  if (j) {
    majorIdx.value = uni.getStorageSync('fjnu_major_idx') || 0;
    week.value = Math.max(1, Math.min(25, j.currentWeek || currentWeek(j.semesterStart)));
    load();
  }
  loading.value = false;
}
onShow(() => boot());
onPullDownRefresh(async () => { await boot(true); uni.stopPullDownRefresh(); });
</script>

<style>
.top { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; background: #fff; }
.major-pick { font-size: 28rpx; font-weight: 600; color: #1565c0; }
.week-pick { display: flex; align-items: center; }
.wk { font-size: 28rpx; font-weight: 600; margin: 0 20rpx; }
.wk-btn { font-size: 44rpx; color: #1565c0; padding: 0 16rpx; }
.src { padding: 8rpx 24rpx; background: #fff8e1; }
.week-scroll { white-space: nowrap; }
.week-grid { display: flex; padding: 8rpx; min-width: 100%; }
.col { width: 13%; min-width: 92rpx; flex-shrink: 0; }
.col.head { width: 9%; min-width: 64rpx; }
.cell-h { height: 84rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 600; }
.cell-h .hd { font-size: 18rpx; color: #8a8f99; font-weight: 400; }
.cell-h.today { color: #1565c0; }
.cell-h.today .hd { color: #1565c0; }
.cell-p { height: 88rpx; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 8rpx; }
.pn { font-size: 22rpx; font-weight: 600; }
.pt { font-size: 16rpx; color: #8a8f99; }
.day-body { position: relative; height: 1056rpx; }
.course {
  position: absolute; left: 4rpx; right: 4rpx; border-radius: 10rpx;
  color: #fff; padding: 8rpx; box-sizing: border-box; overflow: hidden;
  display: flex; flex-direction: column;
}
.cn { font-size: 20rpx; font-weight: 600; line-height: 1.25; }
.cl { font-size: 17rpx; opacity: .9; margin-top: 2rpx; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 80rpx 0; color: #8a8f99; }
</style>
