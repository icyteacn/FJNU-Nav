<script setup>
/**
 * 今日速览卡：日期+教学周+今日课表摘要+下一节倒计时
 * ---------------------------------------------------------------
 * 数据源与课表页同一份 classSchedule.js（含节假日/调课映射），
 * 自定义课程(feike_custom_courses)与按周删除(feike_deleted_courses)同样生效；
 * 未选专业时给出引导跳转，不编造数据。
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  MAJORS, COURSES, SINGLE_PERIOD_TIMES,
  getCurrentWeek, isCourseInWeek, getScheduleWeekday, getDateHolidayInfo,
} from '../data/classSchedule.js'
import { useI18n } from '../i18n/index.js'

const emit = defineEmits(['open'])
const { lang } = useI18n()

const CUSTOM_KEY = 'feike_custom_courses'
const DELETED_KEY = 'feike_deleted_courses'
function loadJSON(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : d } catch { return d } }

const major = ref(localStorage.getItem('fjnu_selected_major') || '')
const now = ref(new Date())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 30000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const majorInfo = computed(() => MAJORS.find(m => m.key === major.value) || null)
const week = computed(() => getCurrentWeek(now.value))
const dateStr = computed(() => {
  const d = now.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
const weekdayZh = computed(() => '日一二三四五六'[now.value.getDay()])

/** 当日实际排课星期（调休换课日映射到补课星期；放假返回 null） */
const schedWd = computed(() => {
  const wd = now.value.getDay() === 0 ? 7 : now.value.getDay()
  return getScheduleWeekday(wd, dateStr.value)
})
const holiday = computed(() => getDateHolidayInfo(dateStr.value))

const deleted = computed(() => new Set(loadJSON(DELETED_KEY, [])))
const todayCourses = computed(() => {
  if (!major.value || schedWd.value == null) return []
  const base = COURSES.filter(c => c.major === major.value)
  const custom = loadJSON(CUSTOM_KEY, []).filter(c => c && c.major === major.value && c.weekday === schedWd.value)
  return base.concat(custom)
    .filter(c => c.weekday === schedWd.value)
    .filter(c => isCourseInWeek(c, week.value))
    .filter(c => !deleted.value.has(c.id + '_wk' + week.value))
    .sort((a, b) => a.startPeriod - b.startPeriod)
})

function minutesOf(hm) {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
const nowMin = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

/** 下一节：今日尚未开始的第一门；全上完则为 null */
const nextCourse = computed(() => {
  for (const c of todayCourses.value) {
    const t = SINGLE_PERIOD_TIMES[c.startPeriod]
    if (t && minutesOf(t.split('-')[0]) > nowMin.value) return c
  }
  return null
})

const countdown = computed(() => {
  const c = nextCourse.value
  if (!c) return ''
  const t = SINGLE_PERIOD_TIMES[c.startPeriod]
  const diff = minutesOf(t.split('-')[0]) - nowMin.value
  const h = Math.floor(diff / 60), m = diff % 60
  return lang.value === 'en'
    ? (h ? `${h}h ${m}m` : `${m}m`)
    : (h ? `${h} 时 ${m} 分` : `${m} 分钟`)
})

const L = (zh, en) => (lang.value === 'en' ? en : zh)
const dateLabel = computed(() => `${now.value.getMonth() + 1}${L('月', '/')}${now.value.getDate()}${L('日', '')} ${L('周', '')}${weekdayZh.value}`)
const summary = computed(() => {
  if (!major.value) return L('选择专业后可在此看今日课表', 'Pick a major to see today\'s classes')
  if (schedWd.value == null) return L('今日放假，无排课', 'Holiday — no classes today')
  const n = todayCourses.value.length
  if (!n) return L('今日无课', 'No classes today')
  if (!nextCourse.value) return `${n} ${L('门课 · 已全部结束', 'class(es) — all done')}`
  return `${n} ${L('门课', 'class(es)')}`
})
</script>

<template>
  <section class="section">
    <div class="today-card" role="button" tabindex="0" @click="emit('open', 'timetable')" @keydown.enter="emit('open', 'timetable')">
      <div class="today-left">
        <div class="today-date">
          {{ dateLabel }}<span class="today-week">{{ L(' · 第 ', ' · Week ') }}{{ week }}{{ L(' 教学周', '') }}</span>
          <span v-if="holiday" class="today-badge" :class="'tb-' + (holiday.type || 'info')">{{ holiday.icon || '📌' }} {{ holiday.descShort || holiday.desc }}</span>
        </div>
        <div class="today-line">{{ summary }}</div>
        <div v-if="!major" class="today-hint">{{ L('点我去课表选专业', 'Tap to pick a major') }}</div>
      </div>
      <div v-if="nextCourse" class="today-next">
        <div class="today-next-label">{{ L('下一节', 'Next') }}</div>
        <div class="today-next-name">{{ nextCourse.name }}</div>
        <div class="today-next-meta">
          {{ L('第', 'P') }}{{ nextCourse.startPeriod }}-{{ nextCourse.endPeriod }}{{ L('节', '') }}
          <template v-if="nextCourse.location"> · {{ nextCourse.location }}</template>
        </div>
        <div class="today-count">⏳ {{ countdown }}{{ L('后', '') }}</div>
      </div>
      <span class="today-go">›</span>
    </div>
  </section>
</template>

<style scoped>
.today-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: 16px; cursor: pointer;
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.06), rgba(225, 29, 72, 0.02));
  border: 1px solid rgba(225, 29, 72, 0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.today-card:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(225, 29, 72, 0.12); }
.today-left { flex: 1; min-width: 0; }
.today-date { font-size: 13px; color: var(--text-2, #6b7280); font-weight: 600; }
.today-week { opacity: 0.85; }
.today-badge {
  display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; background: rgba(225, 29, 72, 0.1); color: #be123c;
}
.today-badge.tb-holiday { background: rgba(22, 163, 74, 0.12); color: #15803d; }
.today-badge.tb-makeup, .today-badge.tb-adjust { background: rgba(217, 119, 6, 0.12); color: #b45309; }
.today-line { font-size: 15px; font-weight: 700; color: var(--text-1, #1f2937); margin-top: 3px; }
.today-hint { font-size: 12px; color: #e11d48; margin-top: 2px; }
.today-next { text-align: right; flex-shrink: 0; }
.today-next-label { font-size: 11px; color: var(--text-2, #6b7280); }
.today-next-name { font-size: 14px; font-weight: 700; color: var(--text-1, #1f2937); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.today-next-meta { font-size: 12px; color: var(--text-2, #6b7280); }
.today-count { font-size: 12px; font-weight: 700; color: #e11d48; margin-top: 2px; }
.today-go { font-size: 22px; color: #e11d48; opacity: 0.7; flex-shrink: 0; }
html[data-theme='dark'] .today-card { background: linear-gradient(135deg, rgba(251, 113, 133, 0.1), rgba(251, 113, 133, 0.04)); border-color: rgba(251, 113, 133, 0.2); }
@media (max-width: 480px) {
  .today-next-name { max-width: 130px; }
  .today-card { padding: 12px 14px; gap: 10px; }
}
</style>
