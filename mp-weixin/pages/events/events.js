// 文件路径: /fjnu-nav/mp-weixin/pages/events/events.js
const { fetchSchedule } = require('../../utils/api.js');

Page({
  data: { groups: [], loading: true },
  onShow() { this.load(); },
  onPullDownRefresh() { this.load(true).finally(() => wx.stopPullDownRefresh()); },
  onShareAppMessage() { return { title: '日程助手 · 官方日程与自定义', path: '/pages/events/events' }; },
  async load(force) {
    this.setData({ loading: true });
    const { data } = await fetchSchedule(force);
    this.setData({ loading: false });
    if (!data) return;
    const flags = data.holidayMap || {};
    const evs = (data.events || []).slice()
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
    const g = {};
    evs.forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
    const groups = Object.keys(g).sort().map(date => ({
      date,
      flag: flags[date] ? (flags[date].label || flags[date].type || '') : '',
      items: g[date],
    }));
    this.setData({ groups });
  },
  show(e) {
    const ev = e.currentTarget.dataset.e;
    const parts = [`时间：${ev.date} ${ev.time || ''}`.trim()];
    if (ev.location) parts.push(`地点：${ev.location}`);
    if (ev.audience) parts.push(`受众：${ev.audience}`);
    if (ev.prep && ev.prep.length) parts.push('准备：\n· ' + ev.prep.join('\n· '));
    if (ev.tip) parts.push('\n提示：' + ev.tip);
    wx.showModal({ title: ev.title, content: parts.join('\n'), showCancel: false });
  },
});
