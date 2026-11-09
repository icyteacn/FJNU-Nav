// 文件路径: /fjnu-nav/mp-weixin/pages/about/about.js
const { fetchSchedule, SITE_URL, cacheTime } = require('../../utils/api.js');

Page({
  data: { refreshText: '点击同步最新数据' },
  onShareAppMessage() { return { title: '福star导航 · 课表/日程/校园服务', path: '/pages/index/index' }; },
  onShow() {
    const t = cacheTime();
    if (t) this.setData({ refreshText: `上次 ${t}` });
  },
  async refresh() {
    this.setData({ refreshText: '同步中…' });
    const { data } = await fetchSchedule(true);
    this.setData({ refreshText: data ? `已更新（${cacheTime()}）` : '同步失败，请检查网络' });
  },
  copySite() {
    wx.setClipboardData({ data: SITE_URL });
  },
  clearCache() {
    wx.showModal({
      title: '清除缓存', content: '将清空课表缓存并重新拉取，确定？',
      success: r => {
        if (!r.confirm) return;
        wx.removeStorageSync('fjnu_schedule_cache_v1');
        wx.removeStorageSync('fjnu_schedule_cache_time');
        this.refresh();
      },
    });
  },
});
