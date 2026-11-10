// 文件路径: /fjnu-nav/mp-schedule/pages/schedule/schedule.js
const { fetchSchedule, cacheTime } = require('../../utils/api.js');
const S = require('../../utils/schedule.js');

Page({
  data: {
    majors: [], majorIdx: 0, majorLabel: '选择专业',
    semesters: [], semIdx: 0,
    week: 1, courses: [], days: [],
    loading: true, source: '', cacheT: '', weekCn: S.WEEK_CN, courseCount: 0,
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
    const curWk = S.currentWeek(this.data.semesterStart || S.fmtDate(new Date()));
    const monday = S.addDays(S.mondayOf(), (week - curWk) * 7);
    const today = S.fmtDate(new Date());
    const isCurWeek = week === curWk;
    const days = [];
    let courseCount = 0;
    for (let d = 1; d <= 7; d++) {
      const res = S.dayCourses(this._data || {}, key, week, d, monday);
      const dt = S.addDays(monday, d - 1);
      const isToday = S.fmtDate(dt) === today && isCurWeek;
      // 逐格卡片：白底+左色条，停课整列放假卡，调入虚线蓝卡，调走灰卡
      const cells = res.cells.map(cell => {
        const c = cell.course;
        const base = {
          kind: cell.kind, id: c.id + cell.kind,
          _top: (cell.start - 1) * 88,
          _h: Math.max(1, cell.end - cell.start + 1) * 88 - 6,
          color: this.data.mono ? '#c62828' : (c.color || '#c62828'),
          status: isToday ? S.periodStatus(this._data, cell.start, cell.end, true) : '',
        };
        if (cell.kind === 'moved') {
          const o = cell.ov;
          base.movedNote = `已调至 ${o.destDate.slice(5).replace('-', '/')}`;
          base.movedSub = `第${o.destPeriods[0]}-${o.destPeriods[o.destPeriods.length - 1]}节${o.destLocation ? ' · ' + o.destLocation : ''}`;
        } else if (cell.kind === 'incoming') {
          const a = cell.adj;
          base.inNote = `自 ${a.srcDate.slice(5).replace('-', '/')} 调入`;
          base.name = c.name;
          base.loc = a.destLocation || c.location;
        } else {
          base.name = c.name; base.loc = c.location; base.teacher = c.teacher;
          base.weeks = `第${c.weeks}周`;
        }
        base.course = c;
        return base;
      });
      courseCount += cells.length;
      const dtp = res.dayType;
      days.push({
        weekday: d,
        label: `${dt.getMonth() + 1}/${dt.getDate()}`,
        today: isToday,
        holiday: res.holiday,
        dayBadge: dtp && dtp.type !== 'holiday' && dtp.type !== 'event'
          ? { icon: dtp.icon || '📅', text: dtp.descShort || dtp.name || '', type: dtp.type }
          : null,
        cells,
      });
    }
    const courses = days.reduce((n, d) => n + d.cells.filter(c => c.kind === 'course').length, 0);
    // 下节课卡（已跳过停课日；提前提醒分钟取自设置）
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
    this.setData({ courseCount: courses, days, next, evs });
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
    const it = e.currentTarget.dataset.c;
    const c = it.course || it;
    if (it.kind === 'moved') {
      const o = it.ov || {};
      wx.showModal({
        title: `${c.name} · 已调课`,
        content: `本节已调至 ${o.destDate} 第${(o.destPeriods || [])[0] || ''}-${(o.destPeriods || []).slice(-1)[0] || ''}节\n新教室：${o.destLocation || '-'}\n（原时段不再上课）`,
        showCancel: false,
      });
      return;
    }
    if (it.kind === 'incoming') {
      const a = it.adj || {};
      wx.showModal({
        title: `${c.name} · 调课补入`,
        content: `自 ${a.srcDate} 调来\n教室：${a.destLocation || c.location || '-'}\n教师：${c.teacher || '-'}`,
        showCancel: false,
      });
      return;
    }
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
