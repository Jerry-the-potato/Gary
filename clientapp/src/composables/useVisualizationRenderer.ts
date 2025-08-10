/**
 * 排序視覺化渲染器
 * 實作 Issue #6: MVP 三排序視覺化
 * 
 * 支援 WebGPU 和 Canvas2D 雙引擎渲染
 */

import type { AlgorithmStep, ArrayState, VisualHints } from '../types/algorithm'

/**
 * 渲染配置
 */
export interface RenderConfig {
  width: number
  height: number
  barWidth: number
  barSpacing: number
  maxValue: number
  colors: {
    default: string
    highlighted: string
    comparing: string
    swapping: string
    sorted: string
    background: string
  }
  animation: {
    duration: number
    easing: string
  }
}

/**
 * 預設渲染配置
 */
export const defaultRenderConfig: RenderConfig = {
  width: 800,
  height: 400,
  barWidth: 40,
  barSpacing: 8,
  maxValue: 100,
  colors: {
    default: '#3b82f6',      // 藍色
    highlighted: '#fbbf24',   // 黃色
    comparing: '#f59e0b',     // 橙色
    swapping: '#ef4444',      // 紅色
    sorted: '#10b981',        // 綠色
    background: '#f8fafc'     // 淺灰色
  },
  animation: {
    duration: 300,
    easing: 'ease-in-out'
  }
}

/**
 * 渲染引擎接口
 */
export interface RenderEngine {
  readonly type: 'webgpu' | 'canvas2d'
  initialize(canvas: HTMLCanvasElement, config: RenderConfig): Promise<void>
  render(step: AlgorithmStep, config: RenderConfig): void
  cleanup(): void
  isSupported(): boolean
}

/**
 * Canvas2D 渲染引擎
 */
export class Canvas2DRenderer implements RenderEngine {
  readonly type = 'canvas2d' as const
  private context: CanvasRenderingContext2D | null = null
  private canvas: HTMLCanvasElement | null = null

  async initialize(canvas: HTMLCanvasElement, config: RenderConfig): Promise<void> {
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    
    if (!this.context) {
      throw new Error('無法取得 Canvas 2D 上下文')
    }

    // 設定畫布尺寸
    canvas.width = config.width
    canvas.height = config.height
    
    console.log('✅ Canvas2D 渲染引擎初始化完成')
  }

  render(step: AlgorithmStep, config: RenderConfig): void {
    if (!this.context || !this.canvas) {
      throw new Error('渲染引擎未初始化')
    }

    const { arrayState } = step
    const { data, highlightedIndices = [], comparisonPair = [], swapPair = [], sortedRegions = [] } = arrayState
    
    // 清空畫布
    this.context.fillStyle = config.colors.background
    this.context.fillRect(0, 0, config.width, config.height)

    // 計算柱狀圖尺寸
    const totalWidth = data.length * (config.barWidth + config.barSpacing) - config.barSpacing
    const startX = (config.width - totalWidth) / 2
    const maxBarHeight = config.height - 80 // 預留空間顯示數值

    // 創建已排序區域的集合
    const sortedIndices = new Set<number>()
    sortedRegions.forEach(region => {
      for (let i = region.start; i <= region.end; i++) {
        sortedIndices.add(i)
      }
    })

    // 確保數組存在且有效
    const safeSwapPair: number[] = (swapPair as number[]) || []
    const safeComparisonPair: number[] = (comparisonPair as number[]) || []

    // 繪製每個數據條
    data.forEach((value, index) => {
      const x = startX + index * (config.barWidth + config.barSpacing)
      const barHeight = (value / config.maxValue) * maxBarHeight
      const y = config.height - barHeight - 40

      // 決定顏色
      let color = config.colors.default
      if (safeSwapPair.includes(index)) {
        color = config.colors.swapping
      } else if (safeComparisonPair.includes(index)) {
        color = config.colors.comparing
      } else if (highlightedIndices.includes(index)) {
        color = config.colors.highlighted
      } else if (sortedIndices.has(index)) {
        color = config.colors.sorted
      }

      // 繪製柱狀圖
      this.context!.fillStyle = color
      this.context!.fillRect(x, y, config.barWidth, barHeight)

      // 繪製數值標籤
      this.context!.fillStyle = '#374151'
      this.context!.font = '14px sans-serif'
      this.context!.textAlign = 'center'
      this.context!.fillText(
        value.toString(),
        x + config.barWidth / 2,
        config.height - 20
      )

      // 繪製索引標籤
      this.context!.fillStyle = '#6b7280'
      this.context!.font = '12px sans-serif'
      this.context!.fillText(
        index.toString(),
        x + config.barWidth / 2,
        config.height - 5
      )
    })

    // 繪製操作說明
    this.drawOperationInfo(step, config)
  }

  private drawOperationInfo(step: AlgorithmStep, config: RenderConfig): void {
    if (!this.context) return

    const { operation } = step
    
    // 背景框
    this.context.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.context.fillRect(10, 10, config.width - 20, 60)
    
    this.context.strokeStyle = '#d1d5db'
    this.context.strokeRect(10, 10, config.width - 20, 60)

    // 操作類型
    this.context.fillStyle = '#1f2937'
    this.context.font = 'bold 16px sans-serif'
    this.context.textAlign = 'left'
    this.context.fillText(`步驟 ${step.sequenceNumber}: ${operation.type.toUpperCase()}`, 20, 30)

    // 操作描述
    this.context.fillStyle = '#4b5563'
    this.context.font = '14px sans-serif'
    this.context.fillText(operation.description, 20, 50)

    // 複雜度信息
    if (operation.complexity) {
      this.context.fillStyle = '#6b7280'
      this.context.font = '12px sans-serif'
      this.context.textAlign = 'right'
      this.context.fillText(
        `時間: ${operation.complexity.time} | 空間: ${operation.complexity.space}`,
        config.width - 20,
        50
      )
    }
  }

  cleanup(): void {
    this.context = null
    this.canvas = null
    console.log('🧹 Canvas2D 渲染引擎已清理')
  }

  isSupported(): boolean {
    if (typeof document === 'undefined') {
      return false // Node.js 環境
    }
    
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      return !!context
    } catch {
      return false
    }
  }
}

/**
 * WebGPU 渲染引擎 (預留接口，後續實作)
 */
export class WebGPURenderer implements RenderEngine {
  readonly type = 'webgpu' as const
  private device: GPUDevice | null = null
  private canvas: HTMLCanvasElement | null = null
  private context: GPUCanvasContext | null = null

  async initialize(canvas: HTMLCanvasElement, config: RenderConfig): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('WebGPU 不受支援')
    }

    this.canvas = canvas
    this.context = canvas.getContext('webgpu')
    
    if (!this.context) {
      throw new Error('無法取得 WebGPU 上下文')
    }

    // 請求 WebGPU 設備
    const gpu = navigator.gpu
    if (!gpu) {
      throw new Error('WebGPU 不可用')
    }

    const adapter = await gpu.requestAdapter()
    if (!adapter) {
      throw new Error('無法取得 WebGPU 適配器')
    }

    this.device = await adapter.requestDevice()
    
    // 配置 WebGPU 上下文
    this.context.configure({
      device: this.device,
      format: gpu.getPreferredCanvasFormat(),
      alphaMode: 'premultiplied'
    })

    console.log('✅ WebGPU 渲染引擎初始化完成')
  }

  render(step: AlgorithmStep, config: RenderConfig): void {
    // TODO: 實作 WebGPU 渲染邏輯
    console.log('🚧 WebGPU 渲染器開發中，回退到 Canvas2D')
    
    // 暫時回退到 Canvas2D
    const fallbackRenderer = new Canvas2DRenderer()
    if (this.canvas) {
      fallbackRenderer.initialize(this.canvas, config)
      fallbackRenderer.render(step, config)
    }
  }

  cleanup(): void {
    this.device = null
    this.canvas = null
    this.context = null
    console.log('🧹 WebGPU 渲染引擎已清理')
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator && !!navigator.gpu
  }
}

/**
 * 渲染器工廠
 */
export class RendererFactory {
  /**
   * 創建最適合的渲染引擎
   */
  static async createBestRenderer(preferWebGPU = true): Promise<RenderEngine> {
    if (preferWebGPU && WebGPURenderer.prototype.isSupported()) {
      try {
        const webgpuRenderer = new WebGPURenderer()
        console.log('🚀 選擇 WebGPU 渲染引擎')
        return webgpuRenderer
      } catch (error) {
        console.warn('WebGPU 初始化失敗，回退到 Canvas2D:', error)
      }
    }

    const canvas2dRenderer = new Canvas2DRenderer()
    if (canvas2dRenderer.isSupported()) {
      console.log('🎨 選擇 Canvas2D 渲染引擎')
      return canvas2dRenderer
    }

    throw new Error('沒有可用的渲染引擎')
  }

  /**
   * 創建指定類型的渲染引擎
   */
  static createRenderer(type: 'webgpu' | 'canvas2d'): RenderEngine {
    switch (type) {
      case 'webgpu':
        return new WebGPURenderer()
      case 'canvas2d':
        return new Canvas2DRenderer()
      default:
        throw new Error(`不支援的渲染引擎類型: ${type}`)
    }
  }
}

/**
 * 視覺化管理器
 */
export class VisualizationManager {
  private renderer: RenderEngine | null = null
  private canvas: HTMLCanvasElement | null = null
  private config: RenderConfig = defaultRenderConfig

  constructor(canvas: HTMLCanvasElement, config?: Partial<RenderConfig>) {
    this.canvas = canvas
    if (config) {
      this.config = { ...defaultRenderConfig, ...config }
    }
  }

  /**
   * 初始化視覺化管理器
   */
  async initialize(preferWebGPU = true): Promise<void> {
    if (!this.canvas) {
      throw new Error('Canvas 元素未設定')
    }

    this.renderer = await RendererFactory.createBestRenderer(preferWebGPU)
    await this.renderer.initialize(this.canvas, this.config)
    
    console.log(`✅ 視覺化管理器初始化完成，使用 ${this.renderer.type} 引擎`)
  }

  /**
   * 渲染單個步驟
   */
  renderStep(step: AlgorithmStep): void {
    if (!this.renderer) {
      throw new Error('渲染器未初始化')
    }

    this.renderer.render(step, this.config)
  }

  /**
   * 更新渲染配置
   */
  updateConfig(newConfig: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    if (this.renderer) {
      this.renderer.cleanup()
      this.renderer = null
    }
    console.log('🧹 視覺化管理器已清理')
  }

  /**
   * 取得當前渲染引擎類型
   */
  getRendererType(): string | null {
    return this.renderer?.type || null
  }
}
