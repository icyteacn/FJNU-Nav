<script setup>
/**
 * 新手引导覆盖层组件（v2 - 修复定位和交互问题）
 * ---------------------------------------------------------------------------
 * 使用 fixed 定位确保弹窗始终在视口内可见。
 * 移除淡出动画，步骤切换更直接。
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTour } from '../utils/useTour'

const { isActive, currentStep, currentStepData, totalSteps, isFirstStep, isLastStep, nextStep, prevStep, completeTour, skipTour } = useTour()

const tooltipRef = ref(null)
const highlightRect = ref({ top: 0, left: 0, width: 0, height: 0 })
const tooltipStyle = ref({})
const arrowDir = ref('bottom')
const isVisible = ref(false)

/** 获取目标元素的位置信息（相对于视口） */
function getTargetRect(selector) {
  if (!selector) return null
  const el = document.querySelector(selector)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right
  }
}

/** 计算高亮区域和弹窗位置 */
function calculatePosition() {
  const step = currentStepData.value
  if (!step) return

  const rect = getTargetRect(step.target)
  if (!rect || rect.width === 0) {
    // 目标元素不存在或不可见，居中显示
    highlightRect.value = { top: window.innerHeight / 2 - 30, left: window.innerWidth / 2 - 100, width: 200, height: 60 }
    tooltipStyle.value = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: Math.min(320, window.innerWidth - 32) + 'px'
    }
    arrowDir.value = 'none'
    return
  }

  // 高亮区域（带 padding）
  const padding = 8
  highlightRect.value = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  }

  // 弹窗尺寸
  const tooltipWidth = Math.min(320, window.innerWidth - 32)
  const tooltipHeight = 200
  const gap = 12

  const viewW = window.innerWidth
  const viewH = window.innerHeight

  // 目标元素中心点
  const targetCenterX = rect.left + rect.width / 2
  const targetCenterY = rect.top + rect.height / 2

  // 优先尝试的方向
  const preferredDir = step.placement || 'bottom'
  let top, left, dir

  // 计算各方向的位置
  const positions = {
    bottom: { top: rect.bottom + gap, left: targetCenterX - tooltipWidth / 2, dir: 'bottom' },
    top: { top: rect.top - tooltipHeight - gap, left: targetCenterX - tooltipWidth / 2, dir: 'top' },
    left: { top: targetCenterY - tooltipHeight / 2, left: rect.left - tooltipWidth - gap, dir: 'left' },
    right: { top: targetCenterY - tooltipHeight / 2, left: rect.right + gap, dir: 'right' }
  }

  // 检查位置是否在视口内
  function isInViewport(pos) {
    return pos.top >= 8 && pos.top + tooltipHeight <= viewH - 8 &&
           pos.left >= 8 && pos.left + tooltipWidth <= viewW - 8
  }

  // 优先使用指定方向
  if (isInViewport(positions[preferredDir])) {
    ({ top, left, dir } = positions[preferredDir])
  } else {
    // 尝试其他方向
    const dirs = ['bottom', 'top', 'right', 'left']
    let found = false
    for (const d of dirs) {
      if (isInViewport(positions[d])) {
        ({ top, left, dir } = positions[d])
        found = true
        break
      }
    }
    // 都放不下时，强制放在底部并居中
    if (!found) {
      top = rect.bottom + gap
      left = (viewW - tooltipWidth) / 2
      dir = 'bottom'
      // 如果底部放不下，放到顶部
      if (top + tooltipHeight > viewH - 8) {
        top = rect.top - tooltipHeight - gap
        dir = 'top'
      }
    }
  }

  // 最终边界修正
  if (left < 8) left = 8
  if (left + tooltipWidth > viewW - 8) left = viewW - tooltipWidth - 8

  tooltipStyle.value = {
    position: 'fixed',
    top: top + 'px',
    left: left + 'px',
    width: tooltipWidth + 'px'
  }
  arrowDir.value = dir
}

/** 滚动到目标元素（平滑滚动到视口中央） */
function scrollToTarget() {
  const step = currentStepData.value
  if (!step?.target) return
  const el = document.querySelector(step.target)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/** 监听步骤变化 - 直接切换，无淡出动画 */
watch(currentStep, () => {
  nextTick(() => {
    scrollToTarget()
    // 延迟计算位置，等待滚动完成
    setTimeout(() => {
      calculatePosition()
    }, 100)
  })
})

/** 监听引导激活状态 */
watch(isActive, (val) => {
  if (val) {
    isVisible.value = true
    nextTick(() => {
      calculatePosition()
    })
  } else {
    // 直接隐藏，无淡出
    isVisible.value = false
  }
})

/** 窗口大小变化时重新计算 */
function handleResize() {
  calculatePosition()
}

/** 滚动时重新计算位置 */
function handleScroll() {
  calculatePosition()
}

/** ESC 键关闭 */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    skipTour()
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault()
    nextStep()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevStep()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('keydown', handleKeydown)
})

/** 遮罩层点击（空白区域关闭） */
function handleOverlayClick(e) {
  if (e.target.classList.contains('tour-overlay')) {
    skipTour()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible && isActive" class="tour-overlay" @click="handleOverlayClick">
      <!-- 高亮遮罩：使用 CSS 实现 -->
      <div class="tour-mask"></div>

      <!-- 高亮区域（透明可点击） -->
      <div
        class="tour-highlight-area"
        :style="{
          top: highlightRect.top + 'px',
          left: highlightRect.left + 'px',
          width: highlightRect.width + 'px',
          height: highlightRect.height + 'px'
        }"
      ></div>

      <!-- 高亮边框动画 -->
      <div
        class="tour-highlight-border"
        :style="{
          top: highlightRect.top + 'px',
          left: highlightRect.left + 'px',
          width: highlightRect.width + 'px',
          height: highlightRect.height + 'px'
        }"
      ></div>

      <!-- 引导弹窗 -->
      <div
        ref="tooltipRef"
        class="tour-tooltip"
        :class="`tour-tooltip--${arrowDir}`"
        :style="tooltipStyle"
        @click.stop
      >
        <!-- 箭头 -->
        <div class="tour-arrow" :class="`tour-arrow--${arrowDir}`"></div>

        <!-- 步骤指示器 -->
        <div class="tour-steps">
          <span
            v-for="(_, idx) in totalSteps"
            :key="idx"
            class="tour-step-dot"
            :class="{ 'tour-step-dot--active': idx === currentStep, 'tour-step-dot--done': idx < currentStep }"
          ></span>
          <span class="tour-step-text">{{ currentStep + 1 }}/{{ totalSteps }}</span>
        </div>

        <!-- 内容 -->
        <div class="tour-content">
          <div class="tour-header">
            <span v-if="currentStepData?.icon" class="tour-icon">{{ currentStepData.icon }}</span>
            <h4 class="tour-title">{{ currentStepData?.title }}</h4>
          </div>
          <p class="tour-desc">{{ currentStepData?.content }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="tour-actions">
          <button class="tour-btn tour-btn--skip" @click="skipTour">跳过</button>
          <div class="tour-actions-right">
            <button v-if="!isFirstStep" class="tour-btn tour-btn--prev" @click="prevStep">‹</button>
            <button class="tour-btn tour-btn--next" @click="nextStep">
              {{ isLastStep ? '完成 ✓' : '下一步 ›' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
}

.tour-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.tour-highlight-area {
  position: fixed;
  background: transparent;
  z-index: 1;
  border-radius: 12px;
}

.tour-highlight-border {
  position: fixed;
  border: 3px solid var(--primary);
  border-radius: 12px;
  pointer-events: none;
  z-index: 2;
  box-shadow: 0 0 0 4px rgba(198, 40, 40, 0.2), 0 0 20px rgba(198, 40, 40, 0.15);
  animation: tour-pulse 2s ease-in-out infinite;
}

@keyframes tour-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(198, 40, 40, 0.2), 0 0 20px rgba(198, 40, 40, 0.15); }
  50% { box-shadow: 0 0 0 8px rgba(198, 40, 40, 0.1), 0 0 30px rgba(198, 40, 40, 0.2); }
}

.tour-tooltip {
  z-index: 1000;
  background: var(--card);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  overflow: visible;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

/* 箭头 */
.tour-arrow {
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--card);
  transform: rotate(45deg);
  z-index: -1;
}
.tour-arrow--bottom {
  top: -7px;
  left: 50%;
  margin-left: -7px;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}
.tour-arrow--top {
  bottom: -7px;
  left: 50%;
  margin-left: -7px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}
.tour-arrow--left {
  right: -7px;
  top: 50%;
  margin-top: -7px;
  box-shadow: 2px -2px 4px rgba(0, 0, 0, 0.05);
}
.tour-arrow--right {
  left: -7px;
  top: 50%;
  margin-top: -7px;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.05);
}

/* 步骤指示器 */
.tour-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 16px 0;
}
.tour-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  transition: all 0.2s ease;
}
.tour-step-dot--active {
  background: var(--primary);
  transform: scale(1.2);
}
.tour-step-dot--done {
  background: var(--primary-soft);
}
.tour-step-text {
  font-size: 11px;
  color: var(--text-light);
  margin-left: 8px;
}

/* 内容 */
.tour-content {
  padding: 12px 16px 8px;
}
.tour-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.tour-icon {
  font-size: 22px;
}
.tour-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.tour-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-sub);
  margin: 0;
}

/* 操作按钮 */
.tour-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px 12px;
}
.tour-actions-right {
  display: flex;
  gap: 6px;
}
.tour-btn {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  font-family: inherit;
}
.tour-btn--skip {
  background: transparent;
  color: var(--text-light);
  padding: 7px 10px;
}
.tour-btn--skip:hover {
  color: var(--text-sub);
}
.tour-btn--prev {
  background: var(--soft-gray);
  color: var(--text-sub);
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.tour-btn--prev:hover {
  background: var(--hover-bg);
}
.tour-btn--next {
  background: var(--primary);
  color: #fff;
}
.tour-btn--next:hover {
  background: var(--primary-dark);
}

/* 响应式 - 手机端优化 */
@media (max-width: 480px) {
  .tour-tooltip {
    max-width: calc(100vw - 24px);
  }
  .tour-content {
    padding: 10px 14px 6px;
  }
  .tour-actions {
    padding: 6px 12px 10px;
  }
}
</style>
