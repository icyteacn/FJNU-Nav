// 文件路径: /fjnu-nav/mp-weixin/pages/index/index.js
const { APP_GROUPS } = require('../../data/apps.js');
const { fetchSchedule, SITE_URL } = require('../../utils/api.js');
const { currentWeek } = require('../../utils/schedule.js');

Page({
  data: { groups: APP_GROUPS, week: 0, todayStr: '' },
  onShow() { this.tick(); },
  onPullDownRefresh() {
    fetchSchedule(true)
      .then(({ data }) => { if (data && data.semesterStart) this.setData({ week: currentWeek(data.semesterStart) }); })
      .catch(() => {})
      .finally(() => wx.stopPullDownRefresh());
  },
  onShareAppMessage() { return { title: '福star导航 · 课表/日程/校园服务', path: '/pages/index/index' }; },
  onShareTimeline() { return { title: '福star导航 · 课表/日程/校园服务' }; },
  tick() {
    const d = new Date();
    const cn = ['日', '一', '二', '三', '四', '五', '六'];
    this.setData({ todayStr: `${d.getMonth() + 1}月${d.getDate()}日 周${cn[d.getDay()]}` });
    fetchSchedule().then(({ data }) => {
      if (data && data.semesterStart) this.setData({ week: currentWeek(data.semesterStart) });
    }).catch(() => {});
  },
  open(e) {
    const a = e.currentTarget.dataset.app;
    if (a.native && a.tab) { wx.switchTab({ url: a.tab }); return; }
    const url = SITE_URL + a.url;
    wx.setClipboardData({
      data: url,
      success: () => wx.showModal({
        title: a.title,
        content: '该功能为网页版，链接已复制：\n' + url + '\n\n请在浏览器中打开使用。',
        showCancel: false,
      }),
    });
  },
});
