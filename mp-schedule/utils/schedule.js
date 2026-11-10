// 文件路径: /fjnu-nav/mp-schedule/utils/schedule.js
// 课表计算逻辑（与网页版口径一致）

function parseWeeks(weeks) {
  if (weeks == null) return [];
  return String(weeks).split(',')
    .map(s => s.trim()).filter(Boolean)
    .map(s => {
      const m = s.split(/[-–—~]/).map(x => parseInt(x, 10)).filter(n => !isNaN(n));
      if (!m.length) return null;
      const a = m[0], b = m.length > 1 ? m[1] : m[0];
      return [Math.min(a, b), Math.max(a, b)];
    }).filter(Boolean);
}

function inWeek(course, week) {
  return parseWeeks(course.weeks).some(([a, b]) => week >= a && week <= b);
}

function currentWeek(semesterStart, now = new Date()) {
  const s = new Date(semesterStart + 'T00:00:00');
  const diff = Math.floor((now - s) / 86400000);
  return Math.max(1, Math.floor(diff / 7) + 1);
}

function courseOnDay(course, week, weekday) {
  if (!inWeek(course, week)) return false;
  const wt = course.weekdayType || 'all';
  if (wt === 'odd' && week % 2 === 0) return false;
  if (wt === 'even' && week % 2 === 1) return false;
  return course.weekday === weekday;
}

function weekCourses(data, major, week) {
  return (data.courses || [])
    .filter(c => c.major === major && inWeek(c, week))
    .sort((a, b) => a.weekday - b.weekday || a.startPeriod - b.startPeriod);
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function mondayOf(d = new Date()) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = t.getDay() === 0 ? 7 : t.getDay();
  t.setDate(t.getDate() - wd + 1);
  return t;
}
function addDays(d, n) { const t = new Date(d); t.setDate(t.getDate() + n); return t; }
const WEEK_CN = ['一', '二', '三', '四', '五', '六', '日'];

// 节次开始时间兜底（数据自带 periodTimes 时优先用数据）
const PERIOD_START = { 1: '08:00', 2: '08:55', 3: '10:10', 4: '11:05', 5: '14:00', 6: '14:55', 7: '16:05', 8: '17:00', 9: '19:00', 10: '19:55', 11: '20:50', 12: '21:45' };

function startMin(data, p) {
  const t = (data.periodTimes || {})[p] || PERIOD_START[p] || '08:00';
  const [h, m] = String(t).split(/[-—~]/)[0].split(':').map(Number);
  return h * 60 + (m || 0);
}

// 下节课：从今日起向后最多找 8 天，取第一门尚未开始的课
function nextCourse(data, major, now = new Date()) {
  const wd0 = now.getDay() === 0 ? 7 : now.getDay();
  const wk0 = currentWeek(data.semesterStart, now);
  const curMin = now.getHours() * 60 + now.getMinutes();
  for (let off = 0; off < 8; off++) {
    const wd = ((wd0 - 1 + off) % 7) + 1;
    const _dd = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), off);
    const _dt = dayType(data, fmtDate(_dd));
    if (_dt && _dt.type === 'holiday') continue; // 节假日停课，跳过整天
    const _eff = (_dt && _dt.scheduleWeekday) ? _dt.scheduleWeekday : wd;
    const wk = wk0 + Math.floor((wd0 - 1 + off) / 7);
    const list = (data.courses || [])
      .filter(c => c.major === major && courseOnDay(c, wk, _eff))
      .sort((a, b) => a.startPeriod - b.startPeriod);
    for (const c of list) {
      if (off === 0 && startMin(data, c.startPeriod) <= curMin) continue;
      const date = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), off);
      return { course: c, week: wk, weekday: wd, date, inDays: off, startMin: startMin(data, c.startPeriod) };
    }
  }
  return null;
}

// 近 14 天的日程事件（校运会/补课等），防御字段差异
function upcomingEvents(data, days = 14, now = new Date()) {
  const list = [];
  for (const e of data.events || []) {
    const dstr = e.date || e.day || e.start;
    if (!dstr) continue;
    const d = new Date(dstr + 'T00:00:00');
    if (isNaN(d)) continue;
    const diff = Math.ceil((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (diff < -1 || diff > days) continue;
    list.push({ title: e.title || e.name || '日程', tip: e.tip || e.desc || '', date: dstr, inDays: diff });
  }
  return list.sort((a, b) => a.inDays - b.inDays).slice(0, 4);
}

// 搜索课程：名称/教师/教室模糊匹配，可选类型筛选
// ===== 节假日/调休/调课（对齐 App holidayMap 逻辑） =====
function dayType(data, dateStr) { return (data.holidayMap || {})[dateStr] || null; }

// 收集全部调课调整项：{srcDate, srcWeekday, srcPeriods, destDate, destPeriods, destLocation}
function allAdjustments(data) {
  const out = [];
  const hm = data.holidayMap || {};
  Object.keys(hm).forEach(ds => {
    const e = hm[ds];
    (e.overrides || []).forEach(o => out.push({
      srcDate: ds, srcWeekday: e.scheduleWeekday,
      srcPeriods: o.srcPeriods || [], destDate: o.destDate,
      destPeriods: o.destPeriods || [], destLocation: o.destLocation,
      courseHint: o.courseHint || '',
    }));
  });
  return out;
}

/**
 * 某一天的课程列表（含停课/调休/调入/调走），对齐 App getDayCourses。
 * 返回 { holiday, dayType, cells:[{kind:'course'|'incoming'|'moved', course, start, end, ov/adj}] }
 */
function dayCourses(data, major, week, weekday, monday) {
  const d = addDays(monday, weekday - 1);
  const ds = fmtDate(d);
  const dt = dayType(data, ds);
  if (dt && dt.type === 'holiday') return { ds, holiday: dt, dayType: dt, cells: [] };
  const eff = (dt && (dt.type === 'makeup' || dt.type === 'adjust') && dt.scheduleWeekday) ? dt.scheduleWeekday : weekday;
  const pool = (data.courses || []).filter(c => c.major === major);
  const weekList = weekCourses(data, major, week);
  const adjs = allAdjustments(data);
  const cells = [];
  weekList.filter(c => c.weekday === eff).forEach(c => {
    const ov = adjs.find(a => a.srcDate === ds && a.srcPeriods[0] === c.startPeriod);
    cells.push(ov
      ? { kind: 'moved', course: c, start: c.startPeriod, end: c.endPeriod, ov }
      : { kind: 'course', course: c, start: c.startPeriod, end: c.endPeriod });
  });
  adjs.filter(a => a.destDate === ds && a.destPeriods.length).forEach(a => {
    const c = pool.find(x => x.weekday === a.srcWeekday && a.srcPeriods[0] >= x.startPeriod && a.srcPeriods[0] <= x.endPeriod);
    if (c) cells.push({ kind: 'incoming', course: c, start: a.destPeriods[0], end: a.destPeriods[a.destPeriods.length - 1], adj: a });
  });
  cells.sort((x, y) => x.start - y.start);
  return { ds, holiday: null, dayType: dt, cells };
}

// 状态徽标：今天这一天某节课是 上课中/下一节/已结束/待上
function periodStatus(data, start, end, isToday) {
  if (!isToday) return '';
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const s = startMin(data, start), e = startMin(data, end) + 50; // 近似下课=本节上课+50min
  const endMin = (() => { const t = (data.periodEndTimes || {})[end]; if (t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; } return e; })();
  if (nowMin >= s && nowMin < endMin) return 'live';
  if (nowMin >= endMin) return 'done';
  return 'later';
}

function searchCourses(data, major, kw, cat) {
  kw = (kw || '').trim().toLowerCase();
  const out = [];
  for (const c of data.courses || []) {
    if (major && c.major !== major) continue;
    if (cat && cat !== '全部' && (c.category || '') !== cat) continue;
    if (kw) {
      const hay = `${c.name} ${c.teacher || ''} ${c.location || ''}`.toLowerCase();
      if (!hay.includes(kw)) continue;
    }
    out.push(c);
  }
  return out.slice(0, 60);
}

function categories(data, major) {
  const s = new Set();
  for (const c of data.courses || []) {
    if (c.major === major && c.category) s.add(c.category);
  }
  return ['全部', ...s];
}

module.exports = { parseWeeks, inWeek, currentWeek, courseOnDay, weekCourses, fmtDate, mondayOf, addDays, WEEK_CN, PERIOD_START, startMin, nextCourse, upcomingEvents, searchCourses, categories, dayType, allAdjustments, dayCourses, periodStatus };
