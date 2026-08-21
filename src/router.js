/**
 * 路由与视图注册
 * ---------------------------------------------------------------------------
 * 单页应用使用 Hash 路由（兼容纯静态托管），本模块是「视图注册表」的单一来源：
 *  - VIEWS：应用 id → 视图组件的映射（新增应用时在此登记）
 *  - NAV_APPS：底部快捷导航配置（首页 + 高频应用）
 *  - useViewState()：组合式函数，封装打开应用 / 返回首页 / 解析地址栏 hash
 *
 * 新增一个应用页面的完整流程见 README「二次开发：新增应用」。
 */
import { ref, computed, markRaw } from 'vue'
import Home from './views/Home.vue'

/** 首页组件同步加载，其他页面懒加载（减少首屏 JS 体积） */
const VIEWS = {
  campusNews: () => import('./views/CampusNews.vue'),
  timetable: () => import('./views/Timetable.vue'),
  studentId: () => import('./views/StudentId.vue'),
  physicalTest: () => import('./views/PhysicalTest.vue'),
  calendar: () => import('./views/Calendar.vue'),
  whatToEat: () => import('./views/WhatToEat.vue'),
  classroomNav: () => import('./views/ClassroomNav.vue'),
  canteen: () => import('./views/Canteen.vue'),
  quiz: () => import('./views/QuizGame.vue'),
  foodWheel: () => import('./views/FoodWheel.vue'),
  officialSites: () => import('./views/OfficialSites.vue'),
  categories: () => import('./views/Categories.vue'),
  buildingMatch: () => import('./views/BuildingMatch.vue'),
  leaderTest: () => import('./views/LeaderTest.vue'),
  courseStats: () => import('./views/CourseStats.vue'),
  budget: () => import('./views/Budget.vue'),
  tiebaSentiment: () => import('./views/TiebaSentiment.vue'),
  contributors: () => import('./views/Contributors.vue')
}

/** 应用 id → 视图组件注册表（懒加载版，返回 Promise） */
export const VIEWS_LAZY = VIEWS

/** 底部快捷导航（首页 + 高频应用） */
export const NAV_APPS = [
  { id: 'campusNews', icon: '📢', label: '动态' },
  { id: 'officialSites', icon: '🏛️', label: '官网' },
  { id: 'budget', icon: '🧮', label: '生活费' },
  { id: 'physicalTest', icon: '💪', label: '体测' },
  { id: 'classroomNav', icon: '🧭', label: '教室' },
  { id: 'calendar', icon: '📅', label: '校历' }
]

/** 应用页路由前缀（视图需匹配 parseHash 正则 /^#\/app\/(\w+)/） */
export const APP_ROUTE = '#/app/'

/** 组件缓存（避免重复动态导入） */
const componentCache = new Map()

async function loadComponent(id) {
  if (componentCache.has(id)) return componentCache.get(id)
  const loader = VIEWS[id]
  if (!loader) return Home
  const mod = await loader()
  const comp = markRaw(mod.default)
  componentCache.set(id, comp)
  return comp
}

/**
 * 视图状态组合式函数：供 App.vue 使用
 * @returns {{ current: import('vue').Ref<string>, currentComp: import('vue').ComputedRef, openApp: Function, goHome: Function }}
 */
export function useViewState() {
  /** 当前视图 id（'home' 表示首页） */
  const current = ref('home')
  /** 当前视图组件（支持异步加载） */
  const currentComp = ref(Home)
  /** 是否正在加载组件 */
  const loadingView = ref(false)

  /** 加载并设置视图组件 */
  async function setView(id) {
    if (id === 'home') {
      currentComp.value = Home
      return
    }
    loadingView.value = true
    try {
      currentComp.value = await loadComponent(id)
    } catch {
      currentComp.value = Home
    } finally {
      loadingView.value = false
    }
  }

  /** 解析地址栏 hash，决定渲染哪个视图（支持分享链接直达应用页） */
  function parseHash() {
    const m = location.hash.match(/^#\/app\/(\w+)/)
    const id = m && VIEWS[m[1]] ? m[1] : 'home'
    current.value = id
    setView(id)
  }
  window.addEventListener('hashchange', parseHash)
  parseHash()

  /** 打开应用页 */
  function openApp(id) {
    current.value = id
    location.hash = APP_ROUTE + id
    setView(id)
    window.scrollTo(0, 0)
  }

  /** 返回首页 */
  function goHome() {
    current.value = 'home'
    currentComp.value = Home
    location.hash = '#/'
    window.scrollTo(0, 0)
  }

  return { current, currentComp, openApp, goHome, loadingView }
}
