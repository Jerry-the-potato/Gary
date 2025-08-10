/**
 * 排序視覺化播放器
 * 實作 Issue #6: MVP 三排序視覺化
 *
 * 提供步驟播放、暫停、快進等控制功能
 */

import type { AlgorithmStep } from '../types/algorithm'
import { VisualizationManager, type RenderConfig } from './useVisualizationRenderer'

/**
 * 播放器狀態
 */
export type PlayerState = 'idle' | 'playing' | 'paused' | 'completed'

/**
 * 播放器配置
 */
export interface PlayerConfig {
  autoPlay: boolean
  playbackSpeed: number // 0.5x 到 3x
  loopMode: boolean
  showStepInfo: boolean
}

/**
 * 預設播放器配置
 */
export const defaultPlayerConfig: PlayerConfig = {
  autoPlay: false,
  playbackSpeed: 1.0,
  loopMode: false,
  showStepInfo: true
}

/**
 * 播放器事件
 */
export interface PlayerEvents {
  onStateChange?: (state: PlayerState) => void
  onStepChange?: (currentStep: number, totalSteps: number, step: AlgorithmStep) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * 排序視覺化播放器
 */
export class SortingPlayer {
  private steps: AlgorithmStep[] = []
  private currentStepIndex = 0
  private state: PlayerState = 'idle'
  private playTimer: number | null = null
  private visualizationManager: VisualizationManager | null = null
  private config: PlayerConfig = defaultPlayerConfig
  private events: PlayerEvents = {}

  constructor(
    canvas: HTMLCanvasElement,
    renderConfig?: Partial<RenderConfig>,
    playerConfig?: Partial<PlayerConfig>,
    events?: PlayerEvents
  ) {
    this.visualizationManager = new VisualizationManager(canvas, renderConfig)

    if (playerConfig) {
      this.config = { ...defaultPlayerConfig, ...playerConfig }
    }

    if (events) {
      this.events = events
    }

    console.log('🎬 排序視覺化播放器已創建')
  }

  /**
   * 初始化播放器
   */
  async initialize(preferWebGPU = true): Promise<void> {
    if (!this.visualizationManager) {
      throw new Error('視覺化管理器未設定')
    }

    try {
      await this.visualizationManager.initialize(preferWebGPU)
      console.log('✅ 播放器初始化完成')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      this.handleError(new Error(`播放器初始化失敗: ${errorMessage}`))
      throw error
    }
  }

  /**
   * 載入演算法步驟
   */
  loadSteps(steps: AlgorithmStep[]): void {
    if (!steps || steps.length === 0) {
      throw new Error('步驟序列不能為空')
    }

    this.steps = [...steps] // 深度複製
    this.currentStepIndex = 0
    this.setState('idle')

    // 渲染第一步
    this.renderCurrentStep()

    console.log(`📖 已載入 ${this.steps.length} 個演算法步驟`)

    if (this.config.autoPlay) {
      this.play()
    }
  }

  /**
   * 開始播放
   */
  play(): void {
    if (this.state === 'playing') return

    if (this.state === 'completed' && this.config.loopMode) {
      this.reset()
    }

    this.setState('playing')
    this.scheduleNextStep()
  }

  /**
   * 暫停播放
   */
  pause(): void {
    if (this.state !== 'playing') return

    this.setState('paused')
    this.clearTimer()
  }

  /**
   * 停止播放並重置到開始
   */
  stop(): void {
    this.pause()
    this.reset()
  }

  /**
   * 重置到第一步
   */
  reset(): void {
    this.currentStepIndex = 0
    this.setState('idle')
    this.renderCurrentStep()
  }

  /**
   * 跳到下一步
   */
  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++
      this.renderCurrentStep()
      this.triggerStepChange()
    } else {
      this.complete()
    }
  }

  /**
   * 跳到上一步
   */
  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--
      this.renderCurrentStep()
      this.triggerStepChange()
    }
  }

  /**
   * 跳到指定步驟
   */
  jumpToStep(stepIndex: number): void {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      throw new Error(`步驟索引超出範圍: ${stepIndex}`)
    }

    this.currentStepIndex = stepIndex
    this.renderCurrentStep()
    this.triggerStepChange()
  }

  /**
   * 設定播放速度
   */
  setPlaybackSpeed(speed: number): void {
    if (speed < 0.1 || speed > 5.0) {
      throw new Error('播放速度必須在 0.1x 到 5.0x 之間')
    }

    this.config.playbackSpeed = speed

    // 如果正在播放，重新調度計時器
    if (this.state === 'playing') {
      this.clearTimer()
      this.scheduleNextStep()
    }

    console.log(`⚡ 播放速度設定為 ${speed}x`)
  }

  /**
   * 設定循環模式
   */
  setLoopMode(enabled: boolean): void {
    this.config.loopMode = enabled
    console.log(`🔄 循環模式 ${enabled ? '開啟' : '關閉'}`)
  }

  /**
   * 取得當前狀態
   */
  getState(): PlayerState {
    return this.state
  }

  /**
   * 取得當前步驟信息
   */
  getCurrentStepInfo() {
    return {
      currentStep: this.currentStepIndex,
      totalSteps: this.steps.length,
      step: this.steps[this.currentStepIndex] || null,
      progress: this.steps.length > 0 ? (this.currentStepIndex + 1) / this.steps.length : 0
    }
  }

  /**
   * 取得渲染引擎類型
   */
  getRendererType(): string | null {
    return this.visualizationManager?.getRendererType() || null
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.clearTimer()
    this.visualizationManager?.cleanup()
    this.visualizationManager = null
    this.steps = []
    this.setState('idle')
    console.log('🧹 播放器資源已清理')
  }

  // 私有方法

  private setState(newState: PlayerState): void {
    if (this.state !== newState) {
      this.state = newState
      this.events.onStateChange?.(newState)
      console.log(`🎬 播放器狀態變更: ${newState}`)
    }
  }

  private renderCurrentStep(): void {
    const currentStep = this.steps[this.currentStepIndex]
    if (currentStep && this.visualizationManager) {
      try {
        this.visualizationManager.renderStep(currentStep)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '渲染錯誤'
        this.handleError(new Error(`步驟渲染失敗: ${errorMessage}`))
      }
    }
  }

  private scheduleNextStep(): void {
    if (this.state !== 'playing') return

    const baseDelay = 600 // 基礎延遲毫秒
    const delay = baseDelay / this.config.playbackSpeed

    this.playTimer = window.setTimeout(() => {
      this.nextStep()

      if (this.state === 'playing') {
        this.scheduleNextStep()
      }
    }, delay)
  }

  private clearTimer(): void {
    if (this.playTimer !== null) {
      clearTimeout(this.playTimer)
      this.playTimer = null
    }
  }

  private complete(): void {
    this.clearTimer()
    this.setState('completed')
    this.events.onComplete?.()
    console.log('🎯 播放完成')

    if (this.config.loopMode) {
      setTimeout(() => {
        this.reset()
        this.play()
      }, 1000)
    }
  }

  private triggerStepChange(): void {
    const currentStep = this.steps[this.currentStepIndex]
    if (currentStep) {
      this.events.onStepChange?.(
        this.currentStepIndex,
        this.steps.length,
        currentStep
      )
    }
  }

  private handleError(error: Error): void {
    console.error('播放器錯誤:', error)
    this.events.onError?.(error)
  }
}

/**
 * Vue Composable for Sorting Player
 */
export function useSortingPlayer(
  canvas: HTMLCanvasElement | null,
  renderConfig?: Partial<RenderConfig>,
  playerConfig?: Partial<PlayerConfig>
) {
  let player: SortingPlayer | null = null

  /**
   * 創建播放器實例
   */
  const createPlayer = async (
    events?: PlayerEvents,
    preferWebGPU = true
  ): Promise<SortingPlayer> => {
    if (!canvas) {
      throw new Error('Canvas 元素為 null')
    }

    player = new SortingPlayer(canvas, renderConfig, playerConfig, events)
    await player.initialize(preferWebGPU)

    return player
  }

  /**
   * 銷毀播放器
   */
  const destroyPlayer = (): void => {
    if (player) {
      player.cleanup()
      player = null
    }
  }

  /**
   * 取得播放器實例
   */
  const getPlayer = (): SortingPlayer | null => {
    return player
  }

  return {
    createPlayer,
    destroyPlayer,
    getPlayer
  }
}

// 工具函數

/**
 * 計算播放總時間（估算）
 */
export function estimatePlaybackDuration(
  stepCount: number,
  playbackSpeed = 1.0
): number {
  const baseStepDelay = 600 // 毫秒
  return (stepCount * baseStepDelay) / playbackSpeed
}

/**
 * 格式化播放時間
 */
export function formatPlaybackTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${remainingSeconds}秒`
}
