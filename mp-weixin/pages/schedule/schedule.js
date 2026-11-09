// 文件路径: /fjnu-nav/mp-weixin/pages/schedule/schedule.js
const { fetchSchedule, cacheTime } = require('../../utils/api.js');
const S = require('../../utils/schedule.js');

Page({
  data: {
    majors: [], majorIdx: 0, majorLabel: '选择专业',
    week: 1, courses: [], days: [],
    loading: true, source: '', cacheT: '', weekCn: S.WEEK_CN,
    periods: [1,2,3,4,5,6,7,8,9,10,11,12],
  },

  onShow() { this.load(); },

  async load(force) {
    this.setData({ loading: true });
    const { data, source } = await fetchSchedule(force);
    this.setData({ loading: false, source, cacheT: cacheTime() });
    if (!data) return;
    this._data = data;
    const majorIdx = wx.getStorageSync('fjnu_major_idx') || 0;
    const week = Math.max(1, Math.min(25, data.currentWeek || S.currentWeek(data.semesterStart)));
    this.setData({
      majors: data.majors || [], majorIdx, week,
      majorLabel: ((data.majors || [])[majorIdx] || {}).short || '选择专业',
      periodTimes: data.periodTimes || {},
      semesterStart: data.semesterStart,
    });
    this.apply();
  },

  apply() {
    const { majors, majorIdx, week } = this.data;
    const key = (majors[majorIdx] || {}).key || '';
    const courses = S.weekCourses(this._data || {}, key, week);
    // 计算本周一与列头日期
    const monday = S.addDays(S.mondayOf(), (week - S.currentWeek(this.data.semesterStart || S.fmtDate(new Date()))) * 7);
    const days = [];
    const today = S.fmtDate(new Date());
    for (let d = 1; d <= 7; d++) {
      const dt = S.addDays(monday, d - 1);
      days.push({
        weekday: d,
        label: `${dt.getMonth() + 1}/${dt.getDate()}`,
        today: S.fmtDate(dt) === today,
        courses: courses.filter(c => c.weekday === d).map(c => ({
          ...c,
          _top: (c.startPeriod - 1) * 88,
          _h: Math.max(1, c.endPeriod - c.startPeriod + 1) * 88 - 6,
        })),
      });
    }
    this.setData({ courses, days });
  },

  onMajor(e) {
    const majorIdx = +e.detail.value;
    wx.setStorageSync('fjnu_major_idx', majorIdx);
    this.setData({ majorIdx, majorLabel: (this.data.majors[majorIdx] || {}).short || '选择专业' });
    this.apply();
  },
  prevWeek() { this.shiftWeek(-1); },
  nextWeek() { this.shiftWeek(1); },
  shiftWeek(n) {
    const week = Math.min(25, Math.max(1, this.data.week + n));
    this.setData({ week });
    this.apply();
  },
  showCourse(e) {
    const c = e.currentTarget.dataset.c;
    wx.showModal({
      title: c.name,
      content: `教师：${c.teacher || '-'}\n教室：${c.location || '-'}\n周次：第${c.weeks}周\n节次：${c.startPeriod}-${c.endPeriod}节\n学分：${c.credits || '-'}（${c.hours || '-'}学时）`,
      showCancel: false,
    });
  },
  onPullDownRefresh() { this.load(true).then(() => wx.stopPullDownRefresh()); },
});
