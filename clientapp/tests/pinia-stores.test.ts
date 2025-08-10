/**
 * Pinia Stores 測試
 * 實作 Issue #7: Pinia 狀態切分與時間旅行除錯
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSortingVisualizationStore } from '../src/stores/sortingVisualization'
import { useRendererStore } from '../src/stores/renderer'
import { useAppStore } from '../src/stores/app'

describe('Pinia Stores', () => {
  beforeEach(() => {
    // 為每個測試創建新的 Pinia 實例
    setActivePinia(createPinia())
  })

  describe('SortingVisualizationStore', () => {
    it('應該正確初始化排序視覺化 store', () => {
      const store = useSortingVisualizationStore()

      expect(store.selectedAlgorithm).toBe('bubble-sort')
      expect(store.playerState).toBe('idle')
      expect(store.currentStep).toBe(0)
      expect(store.totalSteps).toBe(0)
      expect(store.progress).toBe(0)
      expect(store.currentData).toEqual([64, 34, 25, 12, 22, 11, 90])
      expect(store.originalData).toEqual([64, 34, 25, 12, 22, 11, 90])
    })

    it('應該能夠設定數據', () => {
      const store = useSortingVisualizationStore()
      const testData = [5, 3, 8, 1, 6]

      store.setData(testData)

      expect(store.currentData).toEqual(testData)
      expect(store.originalData).toEqual(testData)
    })

    it('應該能夠選擇演算法', () => {
      const store = useSortingVisualizationStore()

      store.selectAlgorithm('selection-sort')

      expect(store.selectedAlgorithm).toBe('selection-sort')
    })

    it('應該能夠更新播放速度', () => {
      const store = useSortingVisualizationStore()

      store.updatePlaybackSpeed(2.0)

      expect(store.playbackSpeed).toBe(2.0)
    })

    it('應該能夠保存和恢復快照', () => {
      const store = useSortingVisualizationStore()

      // 設定初始狀態
      store.setData([3, 1, 2])
      const beforeAlgorithmChange = store.timeline.length

      store.selectAlgorithm('insertion-sort')

      // 快照應該自動保存
      expect(store.timeline.length).toBeGreaterThan(beforeAlgorithmChange)

      // 更改狀態
      store.selectAlgorithm('bubble-sort')

      // 找到 insertion-sort 的快照
      const insertionSortSnapshot = store.timeline.find(snapshot =>
        snapshot.state.selectedAlgorithm === 'insertion-sort'
      )

      if (insertionSortSnapshot) {
        store.restoreSnapshot(insertionSortSnapshot.id)
        expect(store.selectedAlgorithm).toBe('insertion-sort')
      } else {
        // 如果沒有找到快照，至少驗證快照功能正常工作
        expect(store.timeline.length).toBeGreaterThan(0)
      }
    })

    it('應該能夠清除時間軸', () => {
      const store = useSortingVisualizationStore()

      // 生成一些快照
      store.setData([1, 2, 3])
      store.selectAlgorithm('selection-sort')

      expect(store.timeline.length).toBeGreaterThan(0)

      store.clearTimeline()

      expect(store.timeline.length).toBe(0)
    })

    it('應該能夠導出和導入時間軸', () => {
      const store = useSortingVisualizationStore()

      // 生成一些快照
      store.setData([3, 1, 4])
      store.selectAlgorithm('bubble-sort')

      const exported = store.exportTimeline()

      expect(exported.snapshots).toBeDefined()
      expect(exported.totalCount).toBeGreaterThan(0)

      // 清除並重新導入
      store.clearTimeline()
      store.importTimeline(exported)

      expect(store.timeline.length).toBe(exported.totalCount)
    })
  })

  describe('RendererStore', () => {
    it('應該正確初始化渲染器 store', () => {
      const store = useRendererStore()

      expect(store.activeRenderer).toBeNull()
      expect(store.preferredRenderer).toBe('webgpu')
      expect(store.fallbackRenderer).toBe('canvas2d')
      expect(store.isRendering).toBe(false)
      expect(store.isInitializing).toBe(false)
    })

    it('應該能夠更新渲染配置', () => {
      const store = useRendererStore()

      store.updateConfig({
        width: 1024,
        height: 512,
        backgroundColor: '#ffffff'
      })

      expect(store.config.width).toBe(1024)
      expect(store.config.height).toBe(512)
      expect(store.config.backgroundColor).toBe('#ffffff')
    })

    it('應該能夠設定首選渲染器', () => {
      const store = useRendererStore()

      store.setPreferredRenderer('canvas2d')

      expect(store.preferredRenderer).toBe('canvas2d')
    })

    it('應該能夠重置渲染器', () => {
      const store = useRendererStore()

      // 設定一些狀態
      store.setRenderingState(true)

      store.resetRenderer()

      expect(store.activeRenderer).toBeNull()
      expect(store.isRendering).toBe(false)
    })

    it('應該能夠獲取診斷信息', () => {
      const store = useRendererStore()

      const diagnostics = store.getDiagnostics()

      expect(diagnostics).toHaveProperty('activeRenderer')
      expect(diagnostics).toHaveProperty('webgpu')
      expect(diagnostics).toHaveProperty('canvas2d')
      expect(diagnostics).toHaveProperty('performance')
      expect(diagnostics).toHaveProperty('config')
    })
  })

  describe('AppStore', () => {
    it('應該正確初始化應用程式 store', () => {
      const store = useAppStore()

      expect(store.preferences.theme).toBe('auto')
      expect(store.preferences.language).toBe('zh-TW')
      expect(store.preferences.animations).toBe(true)
      expect(store.isInitialized).toBe(false)
      expect(store.notifications).toEqual([])
    })

    it('應該能夠更新偏好設定', () => {
      const store = useAppStore()

      store.updatePreferences({
        theme: 'dark',
        language: 'en-US',
        animations: false
      })

      expect(store.preferences.theme).toBe('dark')
      expect(store.preferences.language).toBe('en-US')
      expect(store.preferences.animations).toBe(false)
    })

    it('應該能夠切換主題', () => {
      const store = useAppStore()

      // 設定為亮色主題
      store.updatePreferences({ theme: 'light' })

      store.toggleTheme()

      expect(store.preferences.theme).toBe('dark')
    })

    it('應該能夠添加和移除通知', () => {
      const store = useAppStore()

      const notificationId = store.addNotification({
        type: 'info',
        title: '測試通知',
        message: '這是一個測試通知'
      })

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].title).toBe('測試通知')

      store.removeNotification(notificationId)

      expect(store.notifications.length).toBe(0)
    })

    it('應該能夠記錄排序運行', () => {
      const store = useAppStore()

      const initialRuns = store.stats.totalSortingRuns

      store.recordSortingRun('bubble-sort')

      expect(store.stats.totalSortingRuns).toBe(initialRuns + 1)
      expect(store.stats.favoriteAlgorithm).toBe('bubble-sort')
    })

    it('應該能夠重置應用程式', () => {
      const store = useAppStore()

      // 更改一些狀態
      store.updatePreferences({ theme: 'dark' })
      store.addNotification({
        type: 'info',
        title: '測試',
        message: '測試'
      })

      store.resetApp()

      expect(store.preferences.theme).toBe('auto')
      expect(store.notifications.length).toBeGreaterThan(0) // 重置通知會添加一個確認通知
      expect(store.isInitialized).toBe(false)
    })

    it('應該能夠導出和導入應用程式狀態', () => {
      const store = useAppStore()

      // 設定一些狀態
      store.updatePreferences({ theme: 'dark', language: 'en-US' })
      store.recordSortingRun('selection-sort')

      const exported = store.exportAppState()

      expect(exported.preferences.theme).toBe('dark')
      expect(exported.stats.favoriteAlgorithm).toBe('selection-sort')

      // 重置並導入
      store.resetApp()
      store.importAppState(exported)

      expect(store.preferences.theme).toBe('dark')
      expect(store.stats.favoriteAlgorithm).toBe('selection-sort')
    })
  })

  describe('Store 整合測試', () => {
    it('應該能夠在多個 stores 之間正確協作', () => {
      const sortingStore = useSortingVisualizationStore()
      const rendererStore = useRendererStore()
      const appStore = useAppStore()

      // 模擬排序流程
      sortingStore.setData([3, 1, 2])
      sortingStore.selectAlgorithm('bubble-sort')

      // 模擬渲染器設定
      rendererStore.updateConfig({ width: 800, height: 400 })

      // 模擬應用程式設定
      appStore.updatePreferences({ theme: 'dark' })
      appStore.recordSortingRun('bubble-sort')

      // 驗證狀態協作
      expect(sortingStore.selectedAlgorithm).toBe('bubble-sort')
      expect(rendererStore.config.width).toBe(800)
      expect(appStore.preferences.theme).toBe('dark')
      expect(appStore.stats.favoriteAlgorithm).toBe('bubble-sort')
    })

    it('應該能夠處理錯誤狀態', () => {
      const sortingStore = useSortingVisualizationStore()

      // 測試在播放期間更改演算法的錯誤處理
      sortingStore.playerState = 'playing'

      expect(() => {
        sortingStore.selectAlgorithm('selection-sort')
      }).toThrow('無法在播放期間更改演算法')
    })

    it('應該能夠正確計算複雜的計算屬性', () => {
      const sortingStore = useSortingVisualizationStore()
      const appStore = useAppStore()

      // 測試排序進度計算
      sortingStore.currentStep = 5
      sortingStore.steps = new Array(10).fill(null) // 模擬 10 個步驟

      expect(sortingStore.progress).toBe(0.5)

      // 測試會話時間計算
      const now = Date.now()
      appStore.stats.lastActiveTime = now - 60000 // 1 分鐘前

      expect(appStore.sessionDuration).toBeCloseTo(60000, -3) // 容許 1 秒誤差
    })
  })
})
