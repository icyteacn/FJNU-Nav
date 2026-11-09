// 文件路径: /fjnu-nav/app-uniapp/utils/schedule.js
// 课表计算逻辑（与网页版口径一致：逗号分段周次 + 单值当周 + 调休映射）

/** "3-7,8-11,11" → [[3,7],[8,11],[11,11]]；支持 - – — ~ 四类连接符 */
export function parseWeeks(weeks) {
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

/** 课程在第 week 周是否上课 */
export function inWeek(course, week) {
  return parseWeeks(course.weeks).some(([a, b]) => week >= a && week <= b);
}

/** 距开学日的教学周（1 起）；开学前返回 1 */
export function currentWeek(semesterStart, now = new Date()) {
  const s = new Date(semesterStart + 'T00:00:00');
  const diff = Math.floor((now - s) / 86400000);
  return Math.max(1, Math.floor(diff / 7) + 1);
}

/** 某天是教学周第几周（可为负→开学前） */
export function weekOfDate(semesterStart, date) {
  const s = new Date(semesterStart + 'T00:00:00');
  return Math.floor((date - s) / 86400000 / 7) + 1;
}

/** 某课程在某周的哪一天（weekday 1-7，1=周一；weekdayType 处理调课） */
export function courseOnDay(course, week, weekday) {
  if (!inWeek(course, week)) return false;
  const wt = course.weekdayType || 'all';
  if (wt === 'odd' && week % 2 === 0) return false;
  if (wt === 'even' && week % 2 === 1) return false;
  return course.weekday === weekday;
}

/** 取某专业某周全部课，按 weekday+startPeriod 排 */
export function weekCourses(data, major, week) {
  return (data.courses || [])
    .filter(c => c.major === major && inWeek(c, week))
    .sort((a, b) => a.weekday - b.weekday || a.startPeriod - b.startPeriod);
}

/** 取某专业某天（week 周 weekday 日）的课 */
export function dayCourses(data, major, week, weekday) {
  return (data.courses || [])
    .filter(c => c.major === major && courseOnDay(c, week, weekday))
    .sort((a, b) => a.startPeriod - b.startPeriod);
}

/** 某天的 events（schedule-data.events[]，按 date 字符串匹配 yyyy-mm-dd） */
export function dayEvents(data, dateStr) {
  return (data.events || []).filter(e => e.date === dateStr);
}

/** holidayMap 某天的标记（放假/调课/活动） */
export function dayFlag(data, dateStr) {
  const m = data.holidayMap || {};
  return m[dateStr] || null;
}

export function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** 本周一日期 */
export function mondayOf(d = new Date()) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = t.getDay() === 0 ? 7 : t.getDay();
  t.setDate(t.getDate() - wd + 1);
  return t;
}
export function addDays(d, n) {
  const t = new Date(d); t.setDate(t.getDate() + n); return t;
}
export const WEEK_CN = ['一', '二', '三', '四', '五', '六', '日'];
