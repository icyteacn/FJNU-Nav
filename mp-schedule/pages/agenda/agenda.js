// 文件路径: /fjnu-nav/mp-schedule/pages/agenda/agenda.js
// 日程提醒页：未来 14 天按天分组的列表视图（对齐 App 单日列表的数据管线）
const { fetchSchedule } = require('../../utils/api.js');
const S = require('../../utils/schedule.js');

Page({
  data: {
    days: [], loading: true, dark: false,
    source: '', majorLabel: '',
  },
  onShareAppMessage() { return { title: '福star课表 · 日程提醒', path: '/pages/agenda/agenda' }; },
  onPullDownRefresh() { this.load(true).then(() => wx.stopPullDownRefresh()); },
  onShow() {
    const dark = getApp().resolveDark ? getApp().resolveDark() : false;
    this.setData({ dark });
    if (getApp().applyChrome) getApp().applyChrome(dark);
    this.load(false);
  },
  async load(force) {
    this.setData({ loading: true });
    const { data, source } = await fetchSchedule(force);
    this.setData({ loading: false, source });
    if (!data) return;
    const majorIdx = Math.min(wx.getStorageSync('fjnu_major_idx') || 0, Math.max(0, (data.majors || []).length - 1));
    const key = ((data.majors || [])[majorIdx] || {}).key || '';
    const majorLabel = ((data.majors || [])[majorIdx] || {}).short || '';
    const view = this._overlay(data);
    this._view = view;
    this.setData({ majorLabel });
    this.render(view, key);
  },
  // 本地覆盖层（自建/改/按周删/停课），与课表页同一套键
  _overlay(src) {
    const del = wx.getStorageSync('fjnu_delweek') || {};
    const cus = wx.getStorageSync('fjnu_custom') || [];
    const edt = wx.getStorageSync('fjnu_edits') || {};
    const ovr = wx.getStorageSync('fjnu_ovr') || {};
    const view = { ...src, holidayMap: { ...(src.holidayMap || {}), ...ovr } };
    view.courses = (src.courses || [])
      .filter(c => !(del[c.id] && del[c.id].includes('all')))
      .map(c => edt[c.id] ? { ...c, ...edt[c.id] } : c)
      .concat(cus);
    view._delWeek = del;
    return view;
  },
  render(view, key) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayStr = S.fmtDate(now);
    const endMinOf = p => {
      const t = (view.periodEndTimes || {})[p];
      if (t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
      return S.startMin(view, p) + 50;
    };
    const p2 = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
    const days = [];
    // 未来 14 天：逐日分组（跳过完全无内容的日期）
    for (let i = 0; i < 14 && days.length < 14; i++) {
      const d = S.addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), i);
      const ds = S.fmtDate(d);
      const wd = d.getDay() === 0 ? 7 : d.getDay();
      const wk = S.currentWeek(view.semesterStart, d);
      const monday = S.mondayOf(d);
      const res = S.dayCourses(view, key, wk, wd, monday);
      const isToday = ds === todayStr;
      const items = [];
      // 课程条目（节间空隙≥40min 插空闲卡，与课表页列表模式同款）
      const realCells = (res.cells || []).filter(x => x.kind !== 'moved')
        .sort((a, b) => a.start - b.start);
      let prevEnd = null, nextMarked = false;
      realCells.forEach(cell => {
        const s = S.startMin(view, cell.start), e = endMinOf(cell.end);
        if (prevEnd !== null && s - prevEnd >= 40) {
          const gap = s - prevEnd;
          items.push({ isGap: true, gap: `🌿 空闲 ${Math.floor(gap / 60) ? Math.floor(gap / 60) + '小时' : ''}${gap % 60 ? gap % 60 + '分' : ''}` });
        }
        prevEnd = e;
        let badge = '';
        if (isToday) {
          if (nowMin >= s && nowMin < e) badge = 'live';
          else if (nowMin >= e) badge = 'done';
          else if (!nextMarked) { badge = 'next'; nextMarked = true; }
        }
        const c = cell.course || {};
        const mono = wx.getStorageSync('fjnu_mono');
        items.push({
          kind: cell.kind, badge,
          color: mono ? (this.data.dark ? '#e8e8e8' : '#1a1a1a') : (c.color || '#c62828'),
          timeStart: p2(s), timeEnd: p2(e),
          name: cell.kind === 'incoming' ? (cell.name || c.name) : c.name,
          loc: cell.loc || c.location || '待定',
          teacher: c.teacher || '',
          periodText: `第${cell.start}-${cell.end}节`,
          note: cell.kind === 'incoming' ? `⬅️ ${cell.inNote || '调入'}` : '',
          isEvent: false,
        });
      });
      // 调走的课 → 灰色条
      (res.cells || []).filter(x => x.kind === 'moved').forEach(cell => {
        items.push({
          kind: 'moved', badge: '', color: '#b0b7c3',
          timeStart: '', timeEnd: '',
          name: cell.course.name, loc: '', teacher: '',
          periodText: `第${cell.start}-${cell.end}节`,
          note: `↗️ 已调至 ${cell.movedNote || ''} ${cell.movedSub || ''}`,
          isEvent: false,
        });
      });
      // 当日事件卡（调课/补课/日程标注）
      const sdt = res.dayType;
      if (sdt && sdt.type === 'event') {
        items.push({ isEvent: true, icon: sdt.icon || '📌', title: sdt.descShort || '日程', desc: sdt.desc || '' });
      }
      const holiday = res.holiday;
      if (!items.length && !holiday) continue; // 空白日不展示
      days.push({
        date: ds.slice(5).replace('-', '/'),
        wd: `周${S.WEEK_CN[wd - 1]}`,
        wk: `第${wk}周`,
        isToday, holiday,
        items,
      });
    }
    this.setData({ days });
  },
  // 点条目看详情（只读）
  showItem(e) {
    const it = e.currentTarget.dataset.c;
    if (!it || it.isGap || it.isEvent) return;
    wx.showModal({
      title: it.name,
      content: `${it.timeStart || ''}${it.timeEnd ? ' - ' + it.timeEnd : ''}\n${it.periodText}\n${it.loc ? '教室：' + it.loc : ''}${it.teacher ? '\n教师：' + it.teacher : ''}${it.note ? '\n' + it.note : ''}`,
      showCancel: false,
    });
  },
});
