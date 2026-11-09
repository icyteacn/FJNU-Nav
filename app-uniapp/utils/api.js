// 文件路径: /fjnu-nav/app-uniapp/utils/api.js
// 课表数据接口：与福star导航网站同一份 schedule-data.json，多源竞速容错
import { ref } from 'vue';

export const SITE_URL = 'https://icyteacn.github.io/FJNU-Nav';
// 读路径：网站 Pages → jsDelivr → raw（与网页版 apk-release 同思路）
const SCHEDULE_URLS = [
  `${SITE_URL}/data/schedule-data.json`,
  'https://cdn.jsdelivr.net/gh/icyteacn/FJNU-Nav@main/public/data/schedule-data.json',
  'https://raw.githubusercontent.com/icyteacn/FJNU-Nav/main/public/data/schedule-data.json',
];
const CACHE_KEY = 'fjnu_schedule_cache_v1';
const CACHE_T = 'fjnu_schedule_cache_time';

export const scheduleData = ref(null);   // 当前内存中的课表全量数据
export const scheduleSource = ref('');   // 'live' | 'cache' | ''

function req(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    uni.request({
      url, timeout, method: 'GET',
      success: r => (r.statusCode === 200 && r.data ? resolve(r.data) : reject(new Error('HTTP ' + r.statusCode))),
      fail: reject,
    });
  });
}

/** 多源依次拉取课表数据；全部失败回退本地缓存 */
export async function fetchSchedule(force = false) {
  if (scheduleData.value && !force) return scheduleData.value;
  // 先用缓存秒开界面，再后台刷新
  if (!scheduleData.value) {
    const cached = uni.getStorageSync(CACHE_KEY);
    if (cached) { scheduleData.value = cached; scheduleSource.value = 'cache'; }
  }
  for (const url of SCHEDULE_URLS) {
    try {
      const j = await req(url + '?t=' + Date.now());
      if (j && j.courses && j.courses.length) {
        scheduleData.value = j;
        scheduleSource.value = 'live';
        uni.setStorageSync(CACHE_KEY, j);
        uni.setStorageSync(CACHE_T, Date.now());
        return j;
      }
    } catch (e) { /* 下一源 */ }
  }
  return scheduleData.value; // 可能仍是缓存
}

/** App 启动预热（不阻塞界面） */
export function preloadSchedule() {
  fetchSchedule().catch(() => {});
}

export function cacheTime() {
  const t = uni.getStorageSync(CACHE_T);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
