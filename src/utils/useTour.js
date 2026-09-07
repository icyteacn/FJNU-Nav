/**
 * 新手引导状态管理
 * ---------------------------------------------------------------------------
 * 管理引导的显示/隐藏、当前步骤、localStorage 记忆用户是否已完成引导。
 * 首次访问自动触发，之后用户可随时通过按钮重新开启。
 */
import { ref, computed, watch } from 'vue'

const TOUR_KEY = 'fjnu_tour_completed'
const TOUR_VERSION = 'v2'

/** 全局状态：当前激活的引导 key（null 表示无引导） */
const activeTour = ref(null)
/** 当前步骤索引 */
const currentStep = ref(0)
/** 引导步骤数据 */
const tourSteps = ref([])

/** 检查某个引导是否已完成 */
function isTourCompleted(key) {
  try {
    const completed = JSON.parse(localStorage.getItem(TOUR_KEY) || '{}')
    return completed[key] === TOUR_VERSION
  } catch {
    return false
  }
}

/** 标记某个引导已完成 */
function markTourCompleted(key) {
  try {
    const completed = JSON.parse(localStorage.getItem(TOUR_KEY) || '{}')
    completed[key] = TOUR_VERSION
    localStorage.setItem(TOUR_KEY, JSON.stringify(completed))
  } catch { /* noop */ }
}

/** 清除所有引导完成标记（用于测试） */
function resetAllTours() {
  try {
    localStorage.removeItem(TOUR_KEY)
  } catch { /* noop */ }
}

/**
 * 启动一个引导
 * @param {string} key - 引导唯一标识（如 'home', 'classroomNav'）
 * @param {Array} steps - 步骤数组，每项 { target: CSS选择器, title: 标题, content: 说明, placement?: 'top'|'bottom'|'left'|'right' }
 */
function startTour(key, steps) {
  if (!steps || !steps.length) return
  activeTour.value = key
  tourSteps.value = steps
  currentStep.value = 0
}

/** 下一步 */
function nextStep() {
  if (currentStep.value < tourSteps.value.length - 1) {
    currentStep.value++
  } else {
    completeTour()
  }
}

/** 上一步 */
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

/** 跳转到指定步骤 */
function goToStep(idx) {
  if (idx >= 0 && idx < tourSteps.value.length) {
    currentStep.value = idx
  }
}

/** 完成/关闭引导 */
function completeTour() {
  if (activeTour.value) {
    markTourCompleted(activeTour.value)
  }
  activeTour.value = null
  currentStep.value = 0
  tourSteps.value = []
}

/** 跳过引导（标记为已完成，不再自动弹出） */
function skipTour() {
  if (activeTour.value) {
    markTourCompleted(activeTour.value)
  }
  activeTour.value = null
  currentStep.value = 0
  tourSteps.value = []
}

/** 当前步骤数据 */
const currentStepData = computed(() => tourSteps.value[currentStep.value] || null)
/** 总步骤数 */
const totalSteps = computed(() => tourSteps.value.length)
/** 是否是第一步 */
const isFirstStep = computed(() => currentStep.value === 0)
/** 是否是最后一步 */
const isLastStep = computed(() => currentStep.value === tourSteps.value.length - 1)
/** 是否有引导正在进行 */
const isActive = computed(() => activeTour.value !== null)

/** 组合式函数 */
export function useTour() {
  return {
    activeTour,
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    isActive,
    tourSteps,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    completeTour,
    skipTour,
    isTourCompleted,
    resetAllTours
  }
}

export default useTour
