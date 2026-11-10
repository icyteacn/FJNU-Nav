// 文件路径: /fjnu-nav/mp-schedule/pages/schedule/schedule.js
const { fetchSchedule, cacheTime } = require('../../utils/api.js');
const S = require('../../utils/schedule.js');

Page({
  data: {
    majors: [], majorIdx: 0, majorLabel: '选择专业',
    semesters: [], semIdx: 0,
    week: 1, courses: [], days: [],
    loading: true, source: '', cacheT: '', weekCn: S.WEEK_CN,
    periods: [1,2,3,4,5,6,7,8,9,10,11,12],
    next: null, evs: [], mono: false,
  },

  onShow() {
    this.setData({ mono: !!wx.getStorageSync('fjnu_mono') });
    this.load();
  },

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
      semesters: (data.semesters || []).map((s, i) => ({ name: s.name || s.title || `学期${i + 1}`, i })),
    });
    this.apply();
  },

  apply() {
    const { majors, majorIdx, week } = this.data;
    const key = (majors[majorIdx] || {}).key || '';
    const courses = S.weekCourses(this._data || {}, key, week);
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
    // 下节课卡（提前提醒分钟取自设置）
    const nxt = S.nextCourse(this._data || {}, key);
    const remindMin = wx.getStorageSync('fjnu_remind') || 30;
    let next = null;
    if (nxt) {
      const c = nxt.course;
      const when = nxt.inDays === 0 ? '今天' : nxt.inDays === 1 ? '明天' : `${nxt.inDays} 天后`;
      next = {
        name: c.name,
        loc: c.location || '待定',
        time: `${when} ${S.fmtDate(nxt.date).slice(5)} 周${S.WEEK_CN[nxt.weekday - 1]} 第${c.startPeriod}-${c.endPeriod}节`,
        teacher: c.teacher || '',
        remind: `已设课前 ${remindMin} 分钟提醒`,
      };
    }
    // 近 14 天日程提醒条
    const evs = S.upcomingEvents(this._data || {}).map(e => ({
      ...e,
      when: e.inDays === 0 ? '今天' : e.inDays === 1 ? '明天' : e.inDays < 0 ? '昨天' : `${e.inDays} 天后`,
    }));
    this.setData({ courses, days, next, evs });
  },

  onMajor(e) {
    const majorIdx = +e.detail.value;
    wx.setStorageSync('fjnu_major_idx', majorIdx);
    this.setData({ majorIdx, majorLabel: (this.data.majors[majorIdx] || {}).short || '选择专业' });
    this.apply();
  },
  onSem(e) { this.setData({ semIdx: +e.detail.value }); },
  prevWeek() { this.shiftWeek(-1); },
  nextWeek() { this.shiftWeek(1); },
  shiftWeek(n) {
    const week = Math.min(25, Math.max(1, this.data.week + n));
    this.setData({ week });
    this.apply();
  },
  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  showCourse(e) {
    const c = e.currentTarget.dataset.c;
    wx.showModal({
      title: c.name,
      content: `教师：${c.teacher || '-'}\n教室：${c.location || '-'}\n周次：第${c.weeks}周\n节次：${c.startPeriod}-${c.endPeriod}节\n类型：${c.category || '-'}\n学分：${c.credits || '-'}（${c.hours || '-'}学时）`,
      showCancel: false,
    });
  },
  onPullDownRefresh() { this.load(true).then(() => wx.stopPullDownRefresh()); },
  onShareAppMessage() { return { title: '福star课表 · 本周课表', path: '/pages/schedule/schedule' }; },
  onShareTimeline() { return { title: '福star课表 · 本周课表' }; },
});
