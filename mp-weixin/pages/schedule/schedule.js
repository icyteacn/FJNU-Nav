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
    viewMode: 'grid', listDay: 1, listItems: [], listEmpty: null,
    nowLine: null, showEdit: false, editForm: null, localDirty: false,
  },

  onShow() {
    this.setData({
      mono: !!wx.getStorageSync('fjnu_mono'),
      showNext: wx.getStorageSync('fjnu_show_next') !== false,
      viewMode: wx.getStorageSync('fjnu_view') || 'grid',
      listDay: new Date().getDay() === 0 ? 7 : new Date().getDay(),
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
    if (diff <= 0) { this.apply(); return; } // 到点自动切换（下课→课间/下一节，开课→上课中）
    const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5),
      m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
    const hm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const label = this._cdMode === 'live' ? '距下课 ' : this._cdMode === 'break' ? '距上课 ' : '';
    this.setData({ 'next.countdown': label + (d ? `${d}天${hm}` : hm) });
  },

  async load(force) {
    this.setData({ loading: true });
    const { data, source } = await fetchSchedule(force);
    this.setData({ loading: false, source, cacheT: cacheTime() });
    if (!data) return;
    this._data = data;
    const majorIdx = wx.getStorageSync('fjnu_major_idx') || 0;
    // 学期选择生效（对齐 App：选中学期 → 周次窗口切到该学期 start）
    const semIdx = wx.getStorageSync('fjnu_sem_idx') || 0;
    const sem = (data.semesters || [])[semIdx];
    const semesterStart = sem && sem.type === 'term' ? sem.start : data.semesterStart;
    // 默认学期用服务端 currentWeek；自选其它学期按其 start 重新计算
    const week = Math.max(1, Math.min(25,
      sem && semIdx > 0 ? S.currentWeek(semesterStart) : (data.currentWeek || S.currentWeek(semesterStart))));
    const mIdx = Math.min(majorIdx, Math.max(0, (data.majors || []).length - 1));
    this.setData({
      majors: data.majors || [], majorIdx: mIdx, week, semIdx,
      majorLabel: ((data.majors || [])[mIdx] || {}).short || '选择专业',
      periodTimes: data.periodTimes || {},
      semesterStart,
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

  // ===== 本地覆盖层（对齐 App customCourses/deletedCourses/userOverrides）=====
  // 原则：网站数据只读，本机修改存 storage，合并成 _view 渲染，可随时清空还原
  _overlay() {
    const del = wx.getStorageSync('fjnu_delweek') || {};      // {courseId:[weeks]}
    const cus = wx.getStorageSync('fjnu_custom') || [];       // 自建课程
    const edt = wx.getStorageSync('fjnu_edits') || {};        // {id:{field:val}}
    const ovr = wx.getStorageSync('fjnu_ovr') || {};          // {date:{type,...}}
    const src = this._data || {};
    const view = { ...src, holidayMap: { ...(src.holidayMap || {}), ...ovr } };
    view.courses = (src.courses || [])
      .filter(c => !(del[c.id] && del[c.id].includes('all')))
      .map(c => edt[c.id] ? { ...c, ...edt[c.id] } : c)
      .concat(cus);
    view._delWeek = del;
    this._view = view;
    this.setData({ localDirty: !!(cus.length || Object.keys(edt).length || Object.keys(del).length || Object.keys(ovr).length) });
    return view;
  },

  apply() {
    const { majors, majorIdx, week } = this.data;
    const key = (majors[majorIdx] || {}).key || '';
    const view = this._view || this._overlay();
    const curWk = S.currentWeek(this.data.semesterStart || S.fmtDate(new Date()));
    const monday = S.addDays(S.mondayOf(), (week - curWk) * 7);
    const today = S.fmtDate(new Date());
    const isCurWeek = week === curWk;
    const days = [];
    let courseCount = 0;
    for (let d = 1; d <= 7; d++) {
      const res = S.dayCourses(view, key, week, d, monday);
      // 按周删除：本机隐藏该周该课
      const delW = (view._delWeek || {});
      res.cells = res.cells.filter(x => !((delW[x.course.id] || []).includes(week) || (delW[x.course.id] || []).includes('all')));
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
          ov: cell.ov, adj: cell.adj,
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
        dayType: res.dayType,
        dayBadge: dtp && dtp.type !== 'holiday'
          ? { icon: dtp.icon || '📅', text: dtp.descShort || dtp.name || '', type: dtp.type }
          : null,
        cells,
        gridH: 12 * cellH,
      });
    }
    const courses = days.reduce((n, d) => n + d.cells.filter(c => c.kind === 'course').length, 0);
    // ===== 当前时间轴红线（对齐 App updateTimeLine，仅当前周） =====
    let nowLine = null;
    const cellH = this._metric ? this._metric.cellH : 40;
    if (isCurWeek) {
      const twd = new Date().getDay() === 0 ? 7 : new Date().getDay();
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const starts = [1,2,3,4,5,6,7,8,9,10,11,12].map(p => S.startMin(view, p));
      const lastEnd = starts[11] + 50;
      if (nowMin >= starts[0] - 20 && nowMin <= lastEnd && !days[twd - 1].holiday) {
        let y = 12 * cellH;
        for (let i = 0; i < 12; i++) {
          const s = starts[i], e2 = i < 11 ? starts[i + 1] : lastEnd;
          if (nowMin >= s && nowMin < e2) { y = i * cellH + (nowMin - s) / (e2 - s) * cellH; break; }
          if (nowMin < s && i === 0) { y = 0; break; }
        }
        nowLine = {
          col: twd - 1, top: Math.round(y),
          t: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        };
      }
    }
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
    // ===== 下节课卡状态机（对齐 App）：上课中→距下课 / 课间→距上课 / 其余→下一节 =====
    const remindMin = wx.getStorageSync('fjnu_remind') || 30;
    let next = null;
    this._cdMode = '';
    const nowD = new Date();
    const nowMin = nowD.getHours() * 60 + nowD.getMinutes();
    const todayWd = nowD.getDay() === 0 ? 7 : nowD.getDay();
    const tRes = S.dayCourses(view, key, curWk, todayWd, S.mondayOf());
    const endMinOf = p => {
      const t = (view.periodEndTimes || {})[p];
      if (t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
      return S.startMin(view, p) + 50;
    };
    const realCells = (tRes.holiday ? [] : (tRes.cells || [])).filter(x => x.kind !== 'moved');
    const live = realCells.find(x => nowMin >= S.startMin(view, x.start) && nowMin < endMinOf(x.end));
    const mkTarget = min => { const t = new Date(nowD); t.setHours(Math.floor(min / 60), min % 60, 0, 0); return +t; };
    if (live) {
      // 上课中：倒计时到下课，附已上课时
      const c = live.course || {};
      this._cdMode = 'live';
      this._cdTarget = mkTarget(endMinOf(live.end));
      next = {
        tag: '📖 上课中',
        name: c.name || live.name,
        time: `今天 · 第${live.start}-${live.end}节 · ${live.loc || c.location || '待定'}`,
        teacher: c.teacher || '',
        countdown: '',
        remind: `已上 ${nowMin - S.startMin(view, live.start)} 分钟`,
      };
    } else {
      const nxt = S.nextCourse(view, key);
      if (nxt) {
        const c = nxt.course;
        // 课间：今天已有课下课，且下一节仍在今天
        const onBreak = nxt.inDays === 0 && realCells.some(x => nowMin >= endMinOf(x.end));
        this._cdMode = onBreak ? 'break' : 'next';
        const target = new Date(nxt.date); target.setHours(Math.floor(nxt.startMin / 60), nxt.startMin % 60, 0, 0);
        this._cdTarget = +target;
        next = {
          tag: onBreak ? '🌿 课间休息中' : '⏰ 下一节课',
          name: c.name,
          time: `周${S.WEEK_CN[nxt.weekday - 1]} ${S.fmtDate(nxt.date).slice(5).replace('-', '/')} · 第${c.startPeriod}-${c.endPeriod}节 · ${c.location || '待定'}`,
          teacher: c.teacher || '',
          countdown: '',
          remind: onBreak ? '下节马上开始，准备一下' : `已设课前 ${remindMin} 分钟提醒`,
        };
      }
    }
    // 近 14 天日程提醒条
    const evs = S.upcomingEvents(this._data || {}).map(e => ({
      ...e,
      when: e.inDays === 0 ? '今天' : e.inDays === 1 ? '明天' : e.inDays < 0 ? '昨天' : `${e.inDays} 天后`,
    }));
    // ===== 列表模式：当前选中日的课表列表（对齐 App renderDayList） =====
    const sel = this.data.listDay;
    const selRes = days[sel - 1] || { cells: [] };
    const listItems = [];
    if (selRes.holiday) {
      this._listEmpty = { icon: selRes.holiday.icon || '🎉', name: selRes.holiday.name || '假期', sub: '假期停课' };
    } else if (!selRes.cells.length) {
      this._listEmpty = { icon: '☕️', name: '这一天没有课', sub: '好好休息，或去图书馆坐坐' };
    } else {
      this._listEmpty = null;
      const endOf = p => S.startMin(this._data, p) + 45; // 下课≈本节上课+45min
      let prevEnd = null;
      let nextMarked = false;
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      selRes.cells.forEach(cell => {
        const s = S.startMin(this._data, cell.start), e = endOf(cell.end);
        // 空闲时段卡（≥40min，调走不计）
        if (cell.kind !== 'moved' && prevEnd !== null && s - prevEnd >= 40) {
          const gap = s - prevEnd;
          listItems.push({ isGap: true, gap: `🌿 空闲 ${Math.floor(gap / 60) ? Math.floor(gap / 60) + '小时' : ''}${gap % 60 ? gap % 60 + '分' : ''}（${Math.floor(prevEnd / 60)}:${String(prevEnd % 60).padStart(2, '0')} - ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}）` });
        }
        if (cell.kind !== 'moved') prevEnd = e;
        // 状态徽标
        let badge = '';
        if (selRes.today) {
          if (nowMin >= s && nowMin < e) badge = 'live';
          else if (nowMin >= e) badge = 'done';
          else if (!nextMarked) { badge = 'next'; nextMarked = true; }
        }
        const p2 = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
        listItems.push({
          isGap: false, kind: cell.kind, id: cell.id, badge,
          timeStart: p2(s), timeEnd: p2(e),
          name: cell.kind === 'moved' ? cell.course.name : cell.name,
          loc: cell.loc || (cell.course || {}).location || '待定',
          teacher: (cell.course || {}).teacher || '',
          periodText: `第${cell.start}-${cell.end}节`,
          note: cell.kind === 'moved' ? `↗️ 已调至 ${cell.movedNote} ${cell.movedSub}` : cell.kind === 'incoming' ? `⬅️ ${cell.inNote}` : '',
          color: cell.color, course: cell.course, ov: cell.ov, adj: cell.adj,
        });
      });
    }
    // 当日 event 类型（如讲座/参会）在列表末尾补提示卡
    const sdt = selRes.dayType;
    if (sdt && sdt.type === 'event') {
      listItems.push({ isEvent: true, icon: sdt.icon || '📌', title: sdt.descShort || '日程', desc: sdt.desc || '' });
    }
    this.setData({ courseCount: courses, days, next, evs, summary, listItems, listEmpty: this._listEmpty, nowLine });
    if (!next) this._cdTarget = 0;
    this._tick();
  },

  onMajor(e) {
    const majorIdx = +e.detail.value;
    wx.setStorageSync('fjnu_major_idx', majorIdx);
    this.setData({ majorIdx, majorLabel: (this.data.majors[majorIdx] || {}).short || '选择专业' });
    this.apply();
  },
  onSem(e) {
    const semIdx = +e.detail.value;
    const sem = ((this._data || {}).semesters || [])[semIdx] || {};
    wx.setStorageSync('fjnu_sem_idx', semIdx);
    const semesterStart = sem.type === 'term' ? sem.start : (this._data || {}).semesterStart;
    this.setData({ semIdx, semesterStart });
    if (sem.type === 'term') {
      this.setData({ week: Math.max(1, Math.min(25, S.currentWeek(semesterStart))) });
    }
    this.apply();
  },
  prevWeek() { this.shiftWeek(-1); },
  nextWeek() { this.shiftWeek(1); },
  shiftWeek(n) {
    const week = Math.min(25, Math.max(1, this.data.week + n));
    this.setData({ week });
    this.apply();
  },
  goSearch() { wx.navigateTo({ url: '/pages/search/search' }); },
  // ===== 编辑/加课/删除/停课（本地覆盖层写入） =====
  _store(key, val) { wx.setStorageSync(key, val); this._view = this._overlay(); this.apply(); },

  openAdd() { this._openForm(null); },
  openEdit(course) { this._openForm(course); },
  _openForm(c) {
    this.setData({
      showEdit: true,
      editForm: c ? {
        id: c.id, isCustom: !!String(c.id).startsWith('u-'),
        name: c.name, teacher: c.teacher || '', location: c.location || '',
        weekday: c.weekday, startPeriod: c.startPeriod, endPeriod: c.endPeriod,
        weeks: c.weeks, category: c.category || '自定义',
      } : {
        id: '', isCustom: true, name: '', teacher: '', location: '',
        weekday: 1, startPeriod: 1, endPeriod: 2, weeks: '1-16', category: '自定义',
      },
      wdIdx: (c ? c.weekday : 1) - 1, spIdx: (c ? c.startPeriod : 1) - 1, epIdx: (c ? c.endPeriod : 2) - 1,
    });
  },
  closeForm() { this.setData({ showEdit: false }); },
  onFormField(e) {
    const f = e.currentTarget.dataset.f;
    const map = { weekday: 'wdIdx', startPeriod: 'spIdx', endPeriod: 'epIdx' };
    const v = e.detail.value;
    if (map[f]) {
      const idx = +v;
      this.setData({ [`editForm.${f}`]: idx + 1, [map[f]]: idx });
    } else {
      this.setData({ [`editForm.${f}`]: v });
    }
  },
  saveForm() {
    const f = this.data.editForm;
    if (!f.name || !f.name.trim()) return wx.showToast({ title: '课名必填', icon: 'none' });
    const majors = this.data.majors;
    const major = (majors[this.data.majorIdx] || {}).key || '';
    const obj = {
      name: f.name.trim(), teacher: f.teacher, location: f.location,
      weekday: f.weekday,
      startPeriod: Math.min(f.startPeriod, f.endPeriod),
      endPeriod: Math.max(f.startPeriod, f.endPeriod),
      weeks: f.weeks || '1-16', weekdayType: 'all', category: f.category || '自定义',
      credits: 0, hours: 0, color: '#c62828', major,
    };
    if (f.isCustom) {
      const cus = wx.getStorageSync('fjnu_custom') || [];
      const id = f.id && String(f.id).startsWith('u-') ? f.id : 'u-' + Date.now();
      const i = cus.findIndex(x => x.id === id);
      const rec = { ...obj, id };
      if (i >= 0) cus[i] = rec; else cus.push(rec);
      this._store('fjnu_custom', cus);
    } else {
      const edt = wx.getStorageSync('fjnu_edits') || {};
      edt[f.id] = obj;
      this._store('fjnu_edits', edt);
    }
    this.setData({ showEdit: false });
    wx.showToast({ title: '已保存' });
  },
  noop() {},
  delCustom(e) {
    const id = e.currentTarget.dataset.id;
    const cus = (wx.getStorageSync('fjnu_custom') || []).filter(x => x.id !== id);
    this._store('fjnu_custom', cus);
    this.setData({ showEdit: false });
  },
  menuActions() {
    const items = ['添加课程', '设置某天停课', '清空本地修改'];
    wx.showActionSheet({
      itemList: items,
      success: r => {
        if (r.tapIndex === 0) this.openAdd();
        else if (r.tapIndex === 1) this.setOffDay();
        else this.clearLocal();
      },
    });
  },
  setOffDay() {
    wx.showModal({
      title: '设置某天停课', editable: true, placeholderText: '日期 如 2026-11-20',
      success: r => {
        if (!r.confirm || !r.content) return;
        const ds = r.content.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) return wx.showToast({ title: '格式 YYYY-MM-DD', icon: 'none' });
        const ovr = wx.getStorageSync('fjnu_ovr') || {};
        ovr[ds] = { type: 'holiday', name: '停课', icon: '⛔', descShort: '手动停课', user: true };
        this._store('fjnu_ovr', ovr);
        wx.showToast({ title: '已设为停课' });
      },
    });
  },
  clearLocal() {
    wx.showModal({
      title: '清空本地修改', content: '将还原为网站原始课表数据，确定？',
      success: r => {
        if (!r.confirm) return;
        ['fjnu_custom', 'fjnu_edits', 'fjnu_delweek', 'fjnu_ovr'].forEach(k => wx.removeStorageSync(k));
        this._view = this._overlay();
        this.apply();
        wx.showToast({ title: '已还原' });
      },
    });
  },
  toggleView() {
    const v = this.data.viewMode === 'grid' ? 'list' : 'grid';
    wx.setStorageSync('fjnu_view', v);
    this.setData({ viewMode: v });
  },
  setListDay(e) {
    this.setData({ listDay: +e.currentTarget.dataset.d });
    this.apply();
  },
  toggleNext() {
    const v = !this.data.showNext;
    wx.setStorageSync('fjnu_show_next', v);
    this.setData({ showNext: v });
  },
  _detail(it) {
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
  showCourse(e) {
    const it = e.currentTarget.dataset.c;
    const c = it.course || it;
    if (it.kind && it.kind !== 'course') { this._detail(it); return; }
    wx.showActionSheet({
      itemList: ['查看详情', '编辑本课', '本周停课（仅此周隐藏）', '删除本课（全部周）'],
      success: r => {
        if (r.tapIndex === 0) this._detail(it);
        else if (r.tapIndex === 1) this.openEdit(c);
        else if (r.tapIndex === 2) {
          const del = wx.getStorageSync('fjnu_delweek') || {};
          del[c.id] = [...new Set([...(del[c.id] || []), this.data.week])];
          this._store('fjnu_delweek', del);
          wx.showToast({ title: '本周已隐藏' });
        } else {
          wx.showModal({
            title: '删除本课', content: `「${c.name}」全部周次都隐藏？（清空本地修改可还原）`,
            success: r2 => {
              if (!r2.confirm) return;
              const del = wx.getStorageSync('fjnu_delweek') || {};
              del[c.id] = ['all'];
              this._store('fjnu_delweek', del);
            },
          });
        }
      },
    });
  },
  onPullDownRefresh() { this.load(true).then(() => wx.stopPullDownRefresh()); },
  onShareAppMessage() { return { title: '福star课表 · 本周课表', path: '/pages/schedule/schedule' }; },
  onShareTimeline() { return { title: '福star课表 · 本周课表' }; },
});
