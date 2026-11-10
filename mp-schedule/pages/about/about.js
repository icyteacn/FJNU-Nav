// 文件路径: /fjnu-nav/mp-schedule/pages/about/about.js
const { fetchSchedule, SITE_URL, cacheTime } = require('../../utils/api.js');

const REMINDS = [15, 30, 45, 60];

Page({
  data: {
    refreshText: '点击同步最新数据',
    mono: false, remindIdx: 1, showNext: true,
    majors: [], majorIdx: 0, majorLabel: '未选择',
  },
  onShareAppMessage() { return { title: '福star课表 · 本周课表', path: '/pages/schedule/schedule' }; },
  async onShow() {
    const t = cacheTime();
    const mono = !!wx.getStorageSync('fjnu_mono');
    const rm = wx.getStorageSync('fjnu_remind') || 30;
    const midx = wx.getStorageSync('fjnu_major_idx') || 0;
    const { data } = await fetchSchedule(false);
    this._data = data;
    this.setData({
      refreshText: t ? `上次 ${t}` : '点击同步最新数据',
      mono, remindIdx: Math.max(0, REMINDS.indexOf(rm)),
      showNext: wx.getStorageSync('fjnu_show_next') !== false,
      majors: (data && data.majors) || [],
      majorIdx: midx,
      majorLabel: (((data && data.majors) || [])[midx] || {}).short || '未选择',
    });
  },
  onMajor(e) {
    const majorIdx = +e.detail.value;
    wx.setStorageSync('fjnu_major_idx', majorIdx);
    this.setData({ majorIdx, majorLabel: (this.data.majors[majorIdx] || {}).short });
  },
  onMono(e) {
    const v = e.detail.value;
    wx.setStorageSync('fjnu_mono', v);
    this.setData({ mono: v });
  },
  onShowNext(e) {
    const v = e.detail.value;
    wx.setStorageSync('fjnu_show_next', v);
    this.setData({ showNext: v });
  },
  onRemind(e) {
    const i = +e.detail.value;
    wx.setStorageSync('fjnu_remind', REMINDS[i]);
    this.setData({ remindIdx: i });
  },
  async refresh() {
    this.setData({ refreshText: '同步中…' });
    const { data } = await fetchSchedule(true);
    this.setData({ refreshText: data ? `已更新（${cacheTime()}）` : '同步失败，请检查网络' });
  },
  exportData() {
    const raw = wx.getStorageSync('fjnu_schedule_cache_v1');
    if (!raw) return wx.showToast({ title: '暂无缓存数据', icon: 'none' });
    wx.setClipboardData({ data: typeof raw === 'string' ? raw : JSON.stringify(raw) });
    wx.showToast({ title: '已复制 JSON 数据' });
  },
  importData() {
    wx.showModal({
      title: '导入数据',
      editable: true,
      placeholderText: '粘贴导出的课表 JSON',
      success: r => {
        if (!r.confirm || !r.content) return;
        try {
          const j = JSON.parse(r.content);
          if (!j.courses) throw 0;
          wx.setStorageSync('fjnu_schedule_cache_v1', j);
          wx.setStorageSync('fjnu_schedule_cache_time', Date.now());
          wx.showToast({ title: '导入成功' });
        } catch (e) {
          wx.showToast({ title: 'JSON 格式不正确', icon: 'none' });
        }
      },
    });
  },
  resetAll() {
    wx.showModal({
      title: '恢复默认', content: '清空专业/配色/提醒等本机设置与缓存，确定？',
      success: r => {
        if (!r.confirm) return;
        ['fjnu_major_idx', 'fjnu_mono', 'fjnu_remind', 'fjnu_schedule_cache_v1', 'fjnu_schedule_cache_time'].forEach(k => wx.removeStorageSync(k));
        this.onShow();
        wx.showToast({ title: '已恢复默认' });
      },
    });
  },
  copySite() { wx.setClipboardData({ data: SITE_URL }); },
  _go(url, name) {
    wx.showModal({
      title: name, content: `${url}\n（复制链接到浏览器打开）`,
      confirmText: '复制链接', showCancel: false,
      success: () => wx.setClipboardData({ data: url }),
    });
  },
  openNav() { this._go(SITE_URL, 'FJNU-Nav 导航网站'); },
  openLeague() { this._go('https://icyteacn.github.io/CYSL-26CS', '智团慧建·团工作平台'); },
});
