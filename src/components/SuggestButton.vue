<script setup>
/**
 * 提建议入口（网页端）
 * ------------------------------------------------------------------
 * variant='float' → 左下角悬浮胶囊（主站全局，避开右下 AI 助手球与底部导航）
 * variant='icon'  → 顶栏小图标按钮（移动端课表顶栏等窄位）
 * 提交主通道 = 校园墙「💡 建议」分区（Supabase 云端，开发者打开墙即见）；
 * 失败自动给 GitHub Issue 预填链接 / 一键复制两种兜底，保证建议送得出去。
 */
import { ref, computed } from 'vue'
import { useI18n } from '../i18n/index.js'
import {
  submitSuggestion, buildIssueUrl, buildSuggestText, copyText,
} from '../suggest.js'

const props = defineProps({
  variant: { type: String, default: 'float' },
})
const { t } = useI18n()

const open = ref(false)
const type = ref('feature')
const text = ref('')
const contact = ref('')
const sending = ref(false)
const done = ref(false)
const fail = ref(false)
const copied = ref(false)
const emptyTip = ref(false)

const TYPES = computed(() => [
  { key: 'feature', label: t('suggest.typeFeature') },
  { key: 'bug', label: t('suggest.typeBug') },
  { key: 'other', label: t('suggest.typeOther') },
])
const payload = computed(() => ({
  type: type.value,
  content: text.value,
  contact: contact.value,
}))
const issueUrl = computed(() => buildIssueUrl(payload.value))

function openBox() {
  open.value = true
  emptyTip.value = false
}
function closeBox() {
  open.value = false
  if (done.value || fail.value) reset()
}
function reset() {
  done.value = false
  fail.value = false
  copied.value = false
  sending.value = false
}
function fresh() {
  reset()
  text.value = ''
  contact.value = ''
  type.value = 'feature'
}
async function submit() {
  if (!text.value.trim()) { emptyTip.value = true; return }
  emptyTip.value = false
  sending.value = true
  fail.value = false
  try {
    await submitSuggestion({
      type: type.value,
      content: text.value.trim(),
      contact: contact.value.trim(),
      from: location.hash || '/',
    })
    done.value = true
  } catch {
    fail.value = true
  } finally {
    sending.value = false
  }
}
async function doCopy() {
  const ok = await copyText(buildSuggestText(payload.value))
  copied.value = ok
}
function goWall() {
  window.location.hash = '#/app/campusWall'
  closeBox()
  fresh()
}
</script>

<template>
  <!-- 入口 -->
  <button
    v-if="variant === 'icon'"
    class="sugg-icon-btn"
    :title="t('suggest.title')"
    @click="openBox"
  >💡</button>
  <button v-else class="sugg-fab" :title="t('suggest.title')" @click="openBox">
    <span class="sugg-fab-ico">💡</span>
    <span class="sugg-fab-txt">{{ t('suggest.btn') }}</span>
  </button>

  <!-- 弹窗 -->
  <div v-if="open" class="sugg-overlay" @click.self="closeBox">
    <div class="sugg-card">
      <div class="sugg-head">
        <div>
          <div class="sugg-title">{{ t('suggest.title') }}</div>
          <div class="sugg-sub">{{ t('suggest.sub') }}</div>
        </div>
        <button class="sugg-close" @click="closeBox">✕</button>
      </div>

      <!-- 成功态 -->
      <div v-if="done" class="sugg-body sugg-done">
        <div class="sugg-done-ico">🎉</div>
        <div class="sugg-done-t">{{ t('suggest.ok') }}</div>
        <div class="sugg-done-s">{{ t('suggest.okSub') }}</div>
        <div class="sugg-actions">
          <button class="sugg-btn primary" @click="goWall">{{ t('suggest.viewWall') }}</button>
          <button class="sugg-btn" @click="fresh">{{ t('suggest.title') }}</button>
        </div>
      </div>

      <!-- 失败兜底 -->
      <div v-else-if="fail" class="sugg-body">
        <div class="sugg-fail-tip">⚠️ {{ t('suggest.fail') }}</div>
        <div class="sugg-actions">
          <button class="sugg-btn primary" @click="doCopy">{{ copied ? t('suggest.copyOk') : t('suggest.copy') }}</button>
          <a class="sugg-btn" :href="issueUrl" target="_blank" rel="noopener">{{ t('suggest.github') }}</a>
        </div>
        <div class="sugg-actions">
          <button class="sugg-btn" @click="fail = false">←</button>
        </div>
      </div>

      <!-- 表单 -->
      <div v-else class="sugg-body">
        <div class="sugg-types">
          <button
            v-for="x in TYPES" :key="x.key"
            class="sugg-chip" :class="{ on: type === x.key }"
            @click="type = x.key"
          >{{ x.label }}</button>
        </div>
        <textarea
          v-model="text" class="sugg-textarea" rows="5"
          :placeholder="t('suggest.placeholder')"
          @input="emptyTip = false"
        ></textarea>
        <div v-if="emptyTip" class="sugg-empty">{{ t('suggest.empty') }}</div>
        <input
          v-model="contact" class="sugg-input"
          :placeholder="t('suggest.contactPh')"
        >
        <div class="sugg-actions">
          <button class="sugg-btn" @click="closeBox">{{ t('suggest.close') }}</button>
          <button class="sugg-btn primary" :disabled="sending" @click="submit">
            {{ sending ? t('suggest.sending') : t('suggest.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sugg-fab {
  position: fixed;
  left: 14px;
  bottom: 72px;
  z-index: 980;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 14px 9px 11px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .5px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(249, 115, 22, .38);
  transition: transform .15s, box-shadow .15s;
}
.sugg-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(249, 115, 22, .45); }
.sugg-fab-ico { font-size: 15px; }
.sugg-icon-btn {
  width: 36px; height: 36px;
  border: none; border-radius: 10px;
  background: rgba(255, 255, 255, .2);
  color: #fff; font-size: 16px;
  cursor: pointer;
}
.sugg-icon-btn:hover { background: rgba(255, 255, 255, .34); }

.sugg-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, .45);
  z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.sugg-card {
  width: 100%; max-width: 400px;
  background: var(--card, #fff);
  color: var(--text, #1a1a1a);
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, .28);
  overflow: hidden;
  animation: suggIn .2s ease;
}
@keyframes suggIn { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
.sugg-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px;
  padding: 16px 16px 10px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-bottom: 1px solid rgba(249, 115, 22, .18);
}
.sugg-title { font-size: 16px; font-weight: 800; color: #c2410c; }
.sugg-sub { font-size: 12px; color: #9a6b52; margin-top: 3px; line-height: 1.5; }
.sugg-close {
  border: none; background: rgba(0, 0, 0, .06);
  width: 28px; height: 28px; border-radius: 50%;
  font-size: 14px; cursor: pointer; color: inherit; flex-shrink: 0;
}
.sugg-body { padding: 14px 16px 16px; }
.sugg-types { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.sugg-chip {
  padding: 6px 12px;
  border: 1.5px solid rgba(0, 0, 0, .12);
  border-radius: 999px;
  background: transparent;
  font-size: 12.5px; font-weight: 600;
  color: inherit; cursor: pointer;
}
.sugg-chip.on { background: #f97316; border-color: #f97316; color: #fff; }
.sugg-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  background: var(--card, #fff);
  color: inherit;
  font-size: 14px; line-height: 1.55;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
}
.sugg-textarea:focus { border-color: #f97316; }
.sugg-input {
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  background: var(--card, #fff);
  color: inherit;
  font-size: 13.5px;
  box-sizing: border-box;
  outline: none;
}
.sugg-input:focus { border-color: #f97316; }
.sugg-empty { color: #dc2626; font-size: 12px; margin-top: 6px; }
.sugg-actions { display: flex; gap: 8px; margin-top: 14px; }
.sugg-btn {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  background: var(--soft, #f5f5f5);
  color: inherit;
  font-size: 13.5px; font-weight: 700;
  text-align: center; text-decoration: none;
  cursor: pointer;
}
.sugg-btn.primary { background: #f97316; border-color: #f97316; color: #fff; }
.sugg-btn:disabled { opacity: .6; cursor: default; }
.sugg-done { text-align: center; padding-top: 6px; }
.sugg-done-ico { font-size: 40px; }
.sugg-done-t { font-size: 17px; font-weight: 800; margin-top: 6px; color: #16a34a; }
.sugg-done-s { font-size: 13px; color: var(--text-sub, #6b7280); margin-top: 6px; line-height: 1.6; }
.sugg-fail-tip { font-size: 13px; color: #b45309; line-height: 1.6; }

@media (max-width: 640px) {
  .sugg-fab { left: 12px; bottom: 66px; padding: 8px 12px 8px 10px; }
}
</style>
