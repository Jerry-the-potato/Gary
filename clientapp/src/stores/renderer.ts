/**
 * 渲染器狀態管理 Store
 * 實作 Issue #7: Pinia 狀態切分與時間旅行除錯
 * 
 * 管理 WebGPU/Canvas2D 雙引擎渲染狀態
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 渲染器類型
export type RendererType = 'webgpu' | 'canvas2d'

// 渲染配置介面
interface RenderConfig {
  width: number
  height: number
  backgroundColor: string
  barColor: string
  compareColor: string
  swapColor: string
  sortedColor: string
  targetFPS: number
  antialias: boolean
}

// 渲染性能指標
interface PerformanceMetrics {
  currentFPS: number
  frameTime: number
  drawCalls: number
  lastRenderTime: number
}

// 渲染器狀態
interface RendererStatus {
  isInitialized: boolean
  isSupported: boolean
  errorMessage: string
  features: string[]
}

export const useRendererStore = defineStore('renderer', () => {
  // ===================
  // 核心狀態
  // ===================
  
  const activeRenderer = ref<RendererType | null>(null)
  const preferredRenderer = ref<RendererType>('webgpu')
  const fallbackRenderer = ref<RendererType>('canvas2d')
  
  // 渲染器狀態
  const webgpuStatus = ref<RendererStatus>({
    isInitialized: false,
    isSupported: false,
    errorMessage: '',
    features: []
  })
  
  const canvas2dStatus = ref<RendererStatus>({
    isInitialized: false,
    isSupported: false,
    errorMessage: '',
    features: []
  })
  
  // 渲染配置
  const config = ref<RenderConfig>({
    width: 800,
    height: 400,
    backgroundColor: '#1a1a1a',
    barColor: '#4a9eff',
    compareColor: '#ff9f43',
    swapColor: '#ee5a52',
    sortedColor: '#10ac84',
    targetFPS: 60,
    antialias: true
  })
  
  // 性能指標
  const performance = ref<PerformanceMetrics>({
    currentFPS: 0,
    frameTime: 0,
    drawCalls: 0,
    lastRenderTime: 0
  })
  
  // 內部狀態
  const isRendering = ref(false)
  const isInitializing = ref(false)

  // ===================
  // 計算屬性
  // ===================
  
  const isWebGPUAvailable = computed(() => {
    return webgpuStatus.value.isSupported
  })
  
  const isCanvas2DAvailable = computed(() => {
    return canvas2dStatus.value.isSupported
  })
  
  const currentRendererStatus = computed(() => {
    if (!activeRenderer.value) return null
    
    return activeRenderer.value === 'webgpu' 
      ? webgpuStatus.value 
      : canvas2dStatus.value
  })
  
  const canRender = computed(() => {
    return activeRenderer.value !== null && 
           currentRendererStatus.value?.isInitialized === true
  })
  
  const rendererFeatures = computed(() => {
    return currentRendererStatus.value?.features || []
  })
  
  const performanceSummary = computed(() => {
    return {
      fps: Math.round(performance.value.currentFPS),
      frameTime: Math.round(performance.value.frameTime * 1000) / 1000,
      efficiency: performance.value.currentFPS / config.value.targetFPS,
      drawCalls: performance.value.drawCalls
    }
  })

  // ===================
  // 核心動作
  // ===================
  
  /**
   * 檢查瀏覽器支援
   */
  async function checkBrowserSupport() {
    // 檢查 WebGPU 支援
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter()
        if (adapter) {
          webgpuStatus.value.isSupported = true
          webgpuStatus.value.features = Array.from(adapter.features || [])
        }
      } catch (error) {
        webgpuStatus.value.errorMessage = error instanceof Error ? error.message : 'WebGPU 初始化失敗'
      }
    }
    
    // 檢查 Canvas2D 支援
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas2dStatus.value.isSupported = true
        canvas2dStatus.value.features = [
          'basic-2d',
          ctx.imageSmoothingEnabled !== undefined ? 'antialiasing' : '',
          typeof ctx.filter !== 'undefined' ? 'filters' : ''
        ].filter(Boolean)
      }
    } catch (error) {
      canvas2dStatus.value.errorMessage = error instanceof Error ? error.message : 'Canvas2D 初始化失敗'
    }
  }
  
  /**
   * 自動選擇最佳渲染器
   */
  function selectBestRenderer(): RendererType {
    if (preferredRenderer.value === 'webgpu' && webgpuStatus.value.isSupported) {
      return 'webgpu'
    }
    
    if (canvas2dStatus.value.isSupported) {
      return 'canvas2d'
    }
    
    throw new Error('沒有可用的渲染器')
  }
  
  /**
   * 初始化渲染器
   */
  async function initializeRenderer(rendererType?: RendererType) {
    if (isInitializing.value) {
      throw new Error('渲染器正在初始化中')
    }
    
    isInitializing.value = true
    
    try {
      // 如果沒有指定渲染器，自動選擇
      const targetRenderer = rendererType || selectBestRenderer()
      
      if (targetRenderer === 'webgpu') {
        await initializeWebGPU()
      } else {
        await initializeCanvas2D()
      }
      
      activeRenderer.value = targetRenderer
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '渲染器初始化失敗'
      
      // 如果首選渲染器失敗，嘗試備用渲染器
      if (!rendererType && preferredRenderer.value === 'webgpu') {
        try {
          await initializeCanvas2D()
          activeRenderer.value = 'canvas2d'
        } catch (fallbackError) {
          throw new Error(`所有渲染器初始化失敗: ${errorMessage}`)
        }
      } else {
        throw error
      }
    } finally {
      isInitializing.value = false
    }
  }
  
  /**
   * 初始化 WebGPU
   */
  async function initializeWebGPU() {
    if (!webgpuStatus.value.isSupported) {
      throw new Error('WebGPU 不被支援')
    }
    
    try {
      // 這裡實際會創建 WebGPU 上下文
      // 目前只標記為已初始化
      webgpuStatus.value.isInitialized = true
      webgpuStatus.value.errorMessage = ''
    } catch (error) {
      webgpuStatus.value.errorMessage = error instanceof Error ? error.message : 'WebGPU 初始化失敗'
      throw error
    }
  }
  
  /**
   * 初始化 Canvas2D
   */
  async function initializeCanvas2D() {
    if (!canvas2dStatus.value.isSupported) {
      throw new Error('Canvas2D 不被支援')
    }
    
    try {
      // 這裡實際會創建 Canvas2D 上下文
      // 目前只標記為已初始化
      canvas2dStatus.value.isInitialized = true
      canvas2dStatus.value.errorMessage = ''
    } catch (error) {
      canvas2dStatus.value.errorMessage = error instanceof Error ? error.message : 'Canvas2D 初始化失敗'
      throw error
    }
  }
  
  /**
   * 切換渲染器
   */
  async function switchRenderer(newRenderer: RendererType) {
    if (activeRenderer.value === newRenderer) {
      return // 已經是目標渲染器
    }
    
    await initializeRenderer(newRenderer)
  }
  
  /**
   * 更新渲染配置
   */
  function updateConfig(newConfig: Partial<RenderConfig>) {
    config.value = { ...config.value, ...newConfig }
  }
  
  /**
   * 更新性能指標
   */
  function updatePerformance(metrics: Partial<PerformanceMetrics>) {
    performance.value = { ...performance.value, ...metrics }
  }
  
  /**
   * 重置渲染器
   */
  function resetRenderer() {
    activeRenderer.value = null
    webgpuStatus.value.isInitialized = false
    canvas2dStatus.value.isInitialized = false
    isRendering.value = false
  }
  
  /**
   * 設定渲染狀態
   */
  function setRenderingState(rendering: boolean) {
    isRendering.value = rendering
  }
  
  /**
   * 設定首選渲染器
   */
  function setPreferredRenderer(renderer: RendererType) {
    preferredRenderer.value = renderer
  }
  
  /**
   * 獲取渲染器診斷信息
   */
  function getDiagnostics() {
    return {
      activeRenderer: activeRenderer.value,
      preferredRenderer: preferredRenderer.value,
      webgpu: {
        supported: webgpuStatus.value.isSupported,
        initialized: webgpuStatus.value.isInitialized,
        features: webgpuStatus.value.features,
        error: webgpuStatus.value.errorMessage
      },
      canvas2d: {
        supported: canvas2dStatus.value.isSupported,
        initialized: canvas2dStatus.value.isInitialized,
        features: canvas2dStatus.value.features,
        error: canvas2dStatus.value.errorMessage
      },
      performance: performanceSummary.value,
      config: config.value
    }
  }

  // ===================
  // 返回公開 API
  // ===================
  
  return {
    // 狀態
    activeRenderer,
    preferredRenderer,
    fallbackRenderer,
    webgpuStatus,
    canvas2dStatus,
    config,
    performance,
    isRendering,
    isInitializing,
    
    // 計算屬性
    isWebGPUAvailable,
    isCanvas2DAvailable,
    currentRendererStatus,
    canRender,
    rendererFeatures,
    performanceSummary,
    
    // 動作
    checkBrowserSupport,
    selectBestRenderer,
    initializeRenderer,
    switchRenderer,
    updateConfig,
    updatePerformance,
    resetRenderer,
    setRenderingState,
    setPreferredRenderer,
    getDiagnostics
  }
})
