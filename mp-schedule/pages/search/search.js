// 文件路径: /fjnu-nav/mp-schedule/pages/search/search.js
const { fetchSchedule } = require('../../utils/api.js');
const S = require('../../utils/schedule.js');

Page({
  data: { kw: '', cats: ['全部'], catIdx: 0, results: [], searched: false, weekCn: S.WEEK_CN },
  onShareAppMessage() { return { title: '福star课表 · 课程搜索', path: '/pages/schedule/schedule' }; },
  async onLoad() {
    const { data } = await fetchSchedule(false);
    this._data = data || {};
    const midx = wx.getStorageSync('fjnu_major_idx') || 0;
    this._major = ((this._data.majors || [])[midx] || {}).key || '';
    this.setData({ cats: S.categories(this._data, this._major) });
  },
  onKw(e) { this.setData({ kw: e.detail.value }); },
  onCat(e) {
    this.setData({ catIdx: +e.detail.value });
    this.doSearch();
  },
  doSearch() {
    const cat = this.data.cats[this.data.catIdx];
    const results = S.searchCourses(this._data, this._major, this.data.kw, cat)
      .map(c => ({ ...c, weekS: `第${c.weeks}周`, wdS: `周${S.WEEK_CN[(c.weekday || 1) - 1]} 第${c.startPeriod}-${c.endPeriod}节` }));
    this.setData({ results, searched: true });
  },
  show(e) {
    const c = e.currentTarget.dataset.c;
    wx.showModal({
      title: c.name,
      content: `教师：${c.teacher || '-'}\n教室：${c.location || '-'}\n周次：第${c.weeks}周\n节次：周${S.WEEK_CN[(c.weekday || 1) - 1]} 第${c.startPeriod}-${c.endPeriod}节\n类型：${c.category || '-'}\n学分：${c.credits || '-'}（${c.hours || '-'}学时）`,
      showCancel: false,
    });
  },
});
