/**
 * 應用程式全域狀態管理 Store
 * 實作 Issue #7: Pinia 狀態切分與時間旅行除錯
 * 
 * 管理主題、語言、使用者偏好等全域設定
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 主題類型
export type ThemeType = 'light' | 'dark' | 'auto'

// 語言類型
export type LanguageType = 'zh-TW' | 'zh-CN' | 'en-US'

// 使用者偏好設定
interface UserPreferences {
  theme: ThemeType
  language: LanguageType
  animations: boolean
  sounds: boolean
  autoSave: boolean
  debugMode: boolean
  showTips: boolean
}

// 應用程式元資訊
interface AppMetadata {
  version: string
  buildTime: string
  environment: 'development' | 'production' | 'test'
  features: string[]
}

// 使用者活動統計
interface ActivityStats {
  totalSessions: number
  totalSortingRuns: number
  totalTimeSpent: number // 毫秒
  lastActiveTime: number
  favoriteAlgorithm: string
}

export const useAppStore = defineStore('app', () => {
  // ===================
  // 核心狀態
  // ===================
  
  // 使用者偏好
  const preferences = ref<UserPreferences>({
    theme: 'auto',
    language: 'zh-TW',
    animations: true,
    sounds: false,
    autoSave: true,
    debugMode: false,
    showTips: true
  })
  
  // 應用程式元資訊
  const metadata = ref<AppMetadata>({
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    environment: 'development',
    features: ['sorting-visualization', 'time-travel-debugging', 'dual-renderer']
  })
  
  // 活動統計
  const stats = ref<ActivityStats>({
    totalSessions: 0,
    totalSortingRuns: 0,
    totalTimeSpent: 0,
    lastActiveTime: Date.now(),
    favoriteAlgorithm: 'bubble-sort'
  })
  
  // 內部狀態
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const notifications = ref<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: number
    autoClose: boolean
  }>>([])

  // ===================
  // 計算屬性
  // ===================
  
  const currentTheme = computed(() => {
    if (preferences.value.theme === 'auto') {
      // 檢查系統主題偏好
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return preferences.value.theme
  })
  
  const isDebugMode = computed(() => {
    return preferences.value.debugMode || metadata.value.environment === 'development'
  })
  
  const sessionDuration = computed(() => {
    return Date.now() - stats.value.lastActiveTime
  })
  
  const averageSessionTime = computed(() => {
    if (stats.value.totalSessions === 0) return 0
    return stats.value.totalTimeSpent / stats.value.totalSessions
  })
  
  const recentNotifications = computed(() => {
    return notifications.value
      .filter(n => Date.now() - n.timestamp < 10000) // 最近 10 秒
      .sort((a, b) => b.timestamp - a.timestamp)
  })

  // ===================
  // 核心動作
  // ===================
  
  /**
   * 初始化應用程式
   */
  async function initializeApp() {
    if (isInitialized.value) return
    
    isLoading.value = true
    
    try {
      // 載入使用者偏好設定
      await loadUserPreferences()
      
      // 載入活動統計
      await loadActivityStats()
      
      // 開始新的會話
      startNewSession()
      
      // 初始化主題
      applyTheme(currentTheme.value)
      
      isInitialized.value = true
      
      addNotification({
        type: 'success',
        title: '應用程式已就緒',
        message: '演算法視覺化工具已成功載入',
        autoClose: true
      })
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: '初始化失敗',
        message: error instanceof Error ? error.message : '應用程式初始化失敗',
        autoClose: false
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 載入使用者偏好設定
   */
  async function loadUserPreferences() {
    try {
      const saved = localStorage.getItem('app-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        preferences.value = { ...preferences.value, ...parsed }
      }
    } catch (error) {
      console.warn('無法載入使用者偏好設定:', error)
    }
  }
  
  /**
   * 儲存使用者偏好設定
   */
  async function saveUserPreferences() {
    try {
      localStorage.setItem('app-preferences', JSON.stringify(preferences.value))
    } catch (error) {
      console.warn('無法儲存使用者偏好設定:', error)
    }
  }
  
  /**
   * 載入活動統計
   */
  async function loadActivityStats() {
    try {
      const saved = localStorage.getItem('app-stats')
      if (saved) {
        const parsed = JSON.parse(saved)
        stats.value = { ...stats.value, ...parsed }
      }
    } catch (error) {
      console.warn('無法載入活動統計:', error)
    }
  }
  
  /**
   * 儲存活動統計
   */
  async function saveActivityStats() {
    try {
      localStorage.setItem('app-stats', JSON.stringify(stats.value))
    } catch (error) {
      console.warn('無法儲存活動統計:', error)
    }
  }
  
  /**
   * 開始新的會話
   */
  function startNewSession() {
    stats.value.totalSessions++
    stats.value.lastActiveTime = Date.now()
    saveActivityStats()
  }
  
  /**
   * 結束當前會話
   */
  function endCurrentSession() {
    const sessionTime = sessionDuration.value
    stats.value.totalTimeSpent += sessionTime
    saveActivityStats()
  }
  
  /**
   * 更新偏好設定
   */
  function updatePreferences(newPreferences: Partial<UserPreferences>) {
    const oldTheme = preferences.value.theme
    preferences.value = { ...preferences.value, ...newPreferences }
    
    // 如果主題改變，立即應用
    if (oldTheme !== preferences.value.theme) {
      applyTheme(currentTheme.value)
    }
    
    saveUserPreferences()
  }
  
  /**
   * 應用主題
   */
  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }
  
  /**
   * 切換主題
   */
  function toggleTheme() {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    updatePreferences({ theme: newTheme })
  }
  
  /**
   * 記錄排序運行
   */
  function recordSortingRun(algorithm: string) {
    stats.value.totalSortingRuns++
    stats.value.favoriteAlgorithm = algorithm
    saveActivityStats()
  }
  
  /**
   * 添加通知
   */
  function addNotification(notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    autoClose?: boolean
  }) {
    const newNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      autoClose: notification.autoClose !== false,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // 自動關閉通知
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }
    
    return newNotification.id
  }
  
  /**
   * 移除通知
   */
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  /**
   * 清除所有通知
   */
  function clearAllNotifications() {
    notifications.value = []
  }
  
  /**
   * 重置應用程式狀態
   */
  function resetApp() {
    // 清除本地存儲
    localStorage.removeItem('app-preferences')
    localStorage.removeItem('app-stats')
    
    // 重置狀態
    preferences.value = {
      theme: 'auto',
      language: 'zh-TW',
      animations: true,
      sounds: false,
      autoSave: true,
      debugMode: false,
      showTips: true
    }
    
    stats.value = {
      totalSessions: 0,
      totalSortingRuns: 0,
      totalTimeSpent: 0,
      lastActiveTime: Date.now(),
      favoriteAlgorithm: 'bubble-sort'
    }
    
    notifications.value = []
    isInitialized.value = false
    
    addNotification({
      type: 'info',
      title: '應用程式已重置',
      message: '所有設定已恢復為預設值',
      autoClose: true
    })
  }
  
  /**
   * 導出應用程式狀態
   */
  function exportAppState() {
    return {
      preferences: preferences.value,
      stats: stats.value,
      metadata: metadata.value,
      exportTime: new Date().toISOString()
    }
  }
  
  /**
   * 導入應用程式狀態
   */
  function importAppState(data: {
    preferences?: UserPreferences
    stats?: ActivityStats
  }) {
    if (data.preferences) {
      updatePreferences(data.preferences)
    }
    
    if (data.stats) {
      stats.value = { ...stats.value, ...data.stats }
      saveActivityStats()
    }
  }

  // ===================
  // 返回公開 API
  // ===================
  
  return {
    // 狀態
    preferences,
    metadata,
    stats,
    isInitialized,
    isLoading,
    notifications,
    
    // 計算屬性
    currentTheme,
    isDebugMode,
    sessionDuration,
    averageSessionTime,
    recentNotifications,
    
    // 動作
    initializeApp,
    updatePreferences,
    toggleTheme,
    recordSortingRun,
    addNotification,
    removeNotification,
    clearAllNotifications,
    resetApp,
    exportAppState,
    importAppState,
    startNewSession,
    endCurrentSession
  }
})
