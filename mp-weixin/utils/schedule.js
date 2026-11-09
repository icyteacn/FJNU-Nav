// 文件路径: /fjnu-nav/mp-weixin/utils/schedule.js
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

module.exports = { parseWeeks, inWeek, currentWeek, courseOnDay, weekCourses, fmtDate, mondayOf, addDays, WEEK_CN };
