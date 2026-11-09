// 文件路径: /fjnu-nav/mp-weixin/utils/api.js
// 课表数据接口：与福star导航网站同一份 schedule-data.json，多源容错
const SITE_URL = 'https://icyteacn.github.io/FJNU-Nav';
const SCHEDULE_URLS = [
  `${SITE_URL}/data/schedule-data.json`,
  'https://cdn.jsdelivr.net/gh/icyteacn/FJNU-Nav@main/public/data/schedule-data.json',
  'https://raw.githubusercontent.com/icyteacn/FJNU-Nav/main/public/data/schedule-data.json',
];
const CACHE_KEY = 'fjnu_schedule_cache_v1';
const CACHE_T = 'fjnu_schedule_cache_time';

let _data = null;
let _source = '';

function req(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    wx.request({
      url, timeout, method: 'GET',
      success: r => (r.statusCode === 200 && r.data ? resolve(r.data) : reject(new Error('HTTP ' + r.statusCode))),
      fail: reject,
    });
  });
}

/** 多源拉取；全部失败回退缓存。返回 {data, source} */
async function fetchSchedule(force = false) {
  if (_data && !force) return { data: _data, source: _source };
  if (!_data) {
    const cached = wx.getStorageSync(CACHE_KEY);
    if (cached) { _data = cached; _source = 'cache'; }
  }
  for (const url of SCHEDULE_URLS) {
    try {
      const j = await req(url + '?t=' + Date.now());
      if (j && j.courses && j.courses.length) {
        _data = j; _source = 'live';
        wx.setStorageSync(CACHE_KEY, j);
        wx.setStorageSync(CACHE_T, Date.now());
        return { data: j, source: 'live' };
      }
    } catch (e) { /* 下一源 */ }
  }
  return { data: _data, source: _source };
}

function cacheTime() {
  const t = wx.getStorageSync(CACHE_T);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

module.exports = { SITE_URL, fetchSchedule, cacheTime };
