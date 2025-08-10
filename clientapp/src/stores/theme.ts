/**
 * 主題狀態管理 Store
 * 實作 Issue #7: Pinia 狀態切分與時間旅行除錯
 * 基於深色模式設計規範
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

interface ThemePreferences {
  theme: Theme
  followSystem: boolean
  lastChanged: number
}

export const useThemeStore = defineStore('theme', () => {
  // ===================
  // 核心狀態
  // ===================
  
  const currentTheme = ref<Theme>('system')
  const systemTheme = ref<'light' | 'dark'>('light')
  const followSystem = ref(true)
  
  // 內部狀態
  const isInitialized = ref(false)
  const mediaQuery = ref<MediaQueryList | null>(null)

  // ===================
  // 計算屬性
  // ===================
  
  const effectiveTheme = computed<'light' | 'dark'>(() => {
    if (currentTheme.value === 'system') {
      return systemTheme.value
    }
    return currentTheme.value as 'light' | 'dark'
  })
  
  const isDarkMode = computed(() => effectiveTheme.value === 'dark')
  const isLightMode = computed(() => effectiveTheme.value === 'light')
  const isFollowingSystem = computed(() => currentTheme.value === 'system')
  
  const themeIcon = computed(() => {
    if (isFollowingSystem.value) {
      return '🖥️'
    }
    return isDarkMode.value ? '🌙' : '☀️'
  })
  
  const themeLabel = computed(() => {
    if (isFollowingSystem.value) {
      return `系統 (${systemTheme.value === 'dark' ? '深色' : '淺色'})`
    }
    return isDarkMode.value ? '深色模式' : '淺色模式'
  })

  // ===================
  // 核心動作
  // ===================
  
  /**
   * 初始化主題系統
   */
  function initializeTheme() {
    if (isInitialized.value) return
    
    // 檢測系統主題偏好
    if (typeof window !== 'undefined') {
      mediaQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = mediaQuery.value.matches ? 'dark' : 'light'
      
      // 監聽系統主題變更
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
      }
      
      mediaQuery.value.addEventListener('change', handleSystemThemeChange)
    }
    
    // 從本地儲存載入主題偏好
    loadThemeFromStorage()
    
    // 應用主題到 DOM
    applyThemeToDom()
    
    isInitialized.value = true
  }
  
  /**
   * 設定主題
   */
  function setTheme(theme: Theme) {
    currentTheme.value = theme
    followSystem.value = theme === 'system'
    
    applyThemeToDom()
    saveThemeToStorage()
  }
  
  /**
   * 切換主題
   */
  function toggleTheme() {
    if (isFollowingSystem.value) {
      // 從系統模式切換到相反的固定模式
      setTheme(systemTheme.value === 'dark' ? 'light' : 'dark')
    } else {
      // 在淺色和深色模式間切換
      setTheme(isDarkMode.value ? 'light' : 'dark')
    }
  }
  
  /**
   * 切換到系統主題
   */
  function useSystemTheme() {
    setTheme('system')
  }
  
  /**
   * 強制設定深色模式
   */
  function forceDarkMode() {
    setTheme('dark')
  }
  
  /**
   * 強制設定淺色模式
   */
  function forceLightMode() {
    setTheme('light')
  }
  
  /**
   * 將主題應用到 DOM
   */
  function applyThemeToDom() {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const body = document.body
    
    // 移除之前的主題類別
    body.classList.remove('theme-light', 'theme-dark')
    root.removeAttribute('data-theme')
    
    // 應用新的主題
    const theme = effectiveTheme.value
    body.classList.add(`theme-${theme}`)
    root.setAttribute('data-theme', theme)
    
    // 更新 meta theme-color
    updateMetaThemeColor(theme)
  }
  
  /**
   * 更新 meta theme-color
   */
  function updateMetaThemeColor(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    
    const color = theme === 'dark' ? '#0f172a' : '#ffffff'
    metaThemeColor.setAttribute('content', color)
  }
  
  /**
   * 從本地儲存載入主題
   */
  function loadThemeFromStorage() {
    if (typeof localStorage === 'undefined') return
    
    try {
      const stored = localStorage.getItem('theme-preferences')
      if (stored) {
        const preferences: ThemePreferences = JSON.parse(stored)
        currentTheme.value = preferences.theme
        followSystem.value = preferences.followSystem
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error)
    }
  }
  
  /**
   * 保存主題到本地儲存
   */
  function saveThemeToStorage() {
    if (typeof localStorage === 'undefined') return
    
    try {
      const preferences: ThemePreferences = {
        theme: currentTheme.value,
        followSystem: followSystem.value,
        lastChanged: Date.now()
      }
      localStorage.setItem('theme-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }
  
  /**
   * 重置主題到預設值
   */
  function resetTheme() {
    setTheme('system')
  }
  
  /**
   * 獲取主題統計資訊
   */
  function getThemeStats() {
    return {
      currentTheme: currentTheme.value,
      effectiveTheme: effectiveTheme.value,
      systemTheme: systemTheme.value,
      followSystem: followSystem.value,
      isInitialized: isInitialized.value,
      supportsSystemTheme: typeof window !== 'undefined' && 
                          window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined
    }
  }

  // ===================
  // 監聽器
  // ===================
  
  // 監聽主題變更，自動應用到 DOM
  watch(
    [currentTheme, systemTheme],
    () => {
      if (isInitialized.value) {
        applyThemeToDom()
      }
    },
    { immediate: false }
  )

  // ===================
  // 返回公開 API
  // ===================
  
  return {
    // 狀態
    currentTheme,
    systemTheme,
    followSystem,
    isInitialized,
    
    // 計算屬性
    effectiveTheme,
    isDarkMode,
    isLightMode,
    isFollowingSystem,
    themeIcon,
    themeLabel,
    
    // 動作
    initializeTheme,
    setTheme,
    toggleTheme,
    useSystemTheme,
    forceDarkMode,
    forceLightMode,
    resetTheme,
    getThemeStats
  }
})
