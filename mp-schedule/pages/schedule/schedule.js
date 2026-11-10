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
    this.setData({
      mono: !!wx.getStorageSync('fjnu_mono'),
      showNext: wx.getStorageSync('fjnu_show_next') !== false,
    });
    if (!this._metric) {
      const w = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      // 一屏全显：节次高 = (可用高 - 顶栏/下节课卡/汇总/底栏) / 12
      const reserved = 228; // px：header+选择行+下节课卡+汇总行+tab栏+间距
      const cellH = Math.min(46, Math.max(28, Math.floor((w.windowHeight - reserved) / 12)));
      const headW = 40;
      const colW = Math.floor((w.windowWidth - headW - 10) / 7);
      this._metric = { cellH, colW, headW };
      this.setData({ cellH, colW, headW });
    }
    this.load();
    // 秒级倒计时
    if (!this._timer) this._timer = setInterval(() => this._tick(), 1000);
  },
  onHide() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },
  _tick() {
    if (!this._cdTarget) return;
    const diff = this._cdTarget - Date.now();
    if (diff <= 0) { this.setData({ 'next.countdown': '上课中' }); return; }
    const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5),
      m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
    const hm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    this.setData({ 'next.countdown': d ? `${d}天${hm}` : hm });
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
    // 网站更新实时生效：后台静默拉新，版本变了就重渲染
    if (!force) {
      fetchSchedule(true).then(r => {
        if (r.data && r.data.updatedAt !== (this._data || {}).updatedAt) {
          this._data = r.data;
          this.setData({ source: r.source, cacheT: cacheTime() });
          this.apply();
        }
      });
    }
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
      const cellH = this._metric.cellH;
      const cells = res.cells.map(cell => {
        const c = cell.course;
        const base = {
          kind: cell.kind, id: c.id + cell.kind,
          // 信息分级：卡越高显示越多（1节只显课名，2节+教室，3节+教师，5节+周次）
          lv: cell.end - cell.start + 1 >= 5 ? 3 : cell.end - cell.start + 1 >= 3 ? 2 : cell.end - cell.start + 1 >= 2 ? 1 : 0,
          start: cell.start, end: cell.end,
          _top: (cell.start - 1) * this._metric.cellH,
          _h: Math.max(1, cell.end - cell.start + 1) * this._metric.cellH - 2,
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
        gridH: 12 * cellH,
      });
    }
    const courses = days.reduce((n, d) => n + d.cells.filter(c => c.kind === 'course').length, 0);
    // ===== 周汇总（对齐 App 顶行：N门课N次N节·N天有课·空档N节） =====
    let sessions = 0, periods = 0; const nameSet = new Set(); let busyDays = 0;
    days.forEach(d => {
      const real = d.cells.filter(c => c.kind !== 'moved');
      if (real.length) busyDays++;
      real.forEach(c => { sessions++; periods += c.end - c.start + 1; nameSet.add(c.course.name); });
    });
    const summary = {
      range: `${days[0].label} - ${days[6].label}`,
      text: `${nameSet.size}门课${sessions}次${periods}节 · ${busyDays}天有课 · 空档${7 * 12 - periods}节`,
    };
    // 下节课卡（已跳过停课日；提前提醒分钟取自设置）
    const nxt = S.nextCourse(this._data || {}, key);
    const remindMin = wx.getStorageSync('fjnu_remind') || 30;
    let next = null;
    if (nxt) {
      const c = nxt.course;
      const when = nxt.inDays === 0 ? '今天' : nxt.inDays === 1 ? '明天' : `${nxt.inDays} 天后`;
      // 倒计时目标时间戳（秒级 ticker 每秒刷新）
      const [hh, mm] = [Math.floor(nxt.startMin / 60), nxt.startMin % 60];
      const target = new Date(nxt.date); target.setHours(hh, mm, 0, 0);
      this._cdTarget = +target;
      const cd = '';
      next = {
        name: c.name,
        loc: c.location || '待定',
        time: `周${S.WEEK_CN[nxt.weekday - 1]} ${S.fmtDate(nxt.date).slice(5).replace('-', '/')} · 第${c.startPeriod}-${c.endPeriod}节 · ${c.location || '待定'}`,
        teacher: c.teacher || '',
        countdown: cd,
        remind: `已设课前 ${remindMin} 分钟提醒`,
      };
    }
    // 近 14 天日程提醒条
    const evs = S.upcomingEvents(this._data || {}).map(e => ({
      ...e,
      when: e.inDays === 0 ? '今天' : e.inDays === 1 ? '明天' : e.inDays < 0 ? '昨天' : `${e.inDays} 天后`,
    }));
    this.setData({ courseCount: courses, days, next, evs, summary });
    if (!next) this._cdTarget = 0;
    this._tick();
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
  toggleNext() {
    const v = !this.data.showNext;
    wx.setStorageSync('fjnu_show_next', v);
    this.setData({ showNext: v });
  },
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
