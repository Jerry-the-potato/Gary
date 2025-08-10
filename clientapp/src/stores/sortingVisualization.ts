/**
 * 排序視覺化狀態管理 Store
 * 實作 Issue #7: Pinia 狀態切分與時間旅行除錯
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AlgorithmStep, SupportedAlgorithms } from '../types/algorithm'
import type { PlayerState } from '../composables/useSortingPlayer'
import { SortingAlgorithmFactory } from '../composables/useSortingAlgorithms'

// 支援的排序演算法類型 (MVP 階段)
type SortingAlgorithmType = 'bubble-sort' | 'selection-sort' | 'insertion-sort'

// 時間旅行狀態介面
interface TimelineSnapshot {
  id: string
  timestamp: number
  description: string
  state: {
    currentData: number[]
    currentStep: number
    playerState: PlayerState
    selectedAlgorithm: SortingAlgorithmType
    steps: AlgorithmStep[]
  }
}

// 排序視覺化配置
interface VisualizationConfig {
  playbackSpeed: number
  autoPlay: boolean
  highlightComparisons: boolean
  showComplexity: boolean
  canvasWidth: number
  canvasHeight: number
}

export const useSortingVisualizationStore = defineStore('sortingVisualization', () => {
  // ===================
  // 核心狀態
  // ===================

  // 演算法狀態
  const selectedAlgorithm = ref<SortingAlgorithmType>('bubble-sort')
  const originalData = ref<number[]>([64, 34, 25, 12, 22, 11, 90])
  const currentData = ref<number[]>([...originalData.value])
  const steps = ref<AlgorithmStep[]>([])

  // 播放器狀態
  const playerState = ref<PlayerState>('idle')
  const currentStep = ref(0)
  const playbackSpeed = ref(1.0)
  const isLooping = ref(false)

  // 視覺化狀態
  const rendererType = ref<'webgpu' | 'canvas2d' | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  // 配置狀態
  const config = ref<VisualizationConfig>({
    playbackSpeed: 1.0,
    autoPlay: false,
    highlightComparisons: true,
    showComplexity: true,
    canvasWidth: 800,
    canvasHeight: 400
  })

  // ===================
  // 時間旅行狀態
  // ===================

  const timeline = ref<TimelineSnapshot[]>([])
  const currentSnapshotIndex = ref(-1)
  const isTimeTravel = ref(false)
  const maxSnapshots = ref(100) // 最大快照數量

  // ===================
  // 計算屬性
  // ===================

  const totalSteps = computed(() => steps.value.length)

  const progress = computed(() => {
    if (totalSteps.value === 0) return 0
    return currentStep.value / totalSteps.value
  })

  const currentStepInfo = computed(() => {
    if (currentStep.value >= 0 && currentStep.value < steps.value.length) {
      return steps.value[currentStep.value]
    }
    return null
  })

  const canStart = computed(() => {
    return playerState.value === 'idle' && currentData.value.length > 0
  })

  const canNavigate = computed(() => {
    return playerState.value !== 'playing' && totalSteps.value > 0
  })

  const canTimeTravel = computed(() => {
    return timeline.value.length > 0 && !isTimeTravel.value
  })

  const timelineSummary = computed(() => {
    return timeline.value.map(snapshot => ({
      id: snapshot.id,
      timestamp: snapshot.timestamp,
      description: snapshot.description,
      step: snapshot.state.currentStep,
      algorithm: snapshot.state.selectedAlgorithm
    }))
  })

  // ===================
  // 核心動作
  // ===================

  /**
   * 設定輸入數據
   */
  function setData(data: number[]) {
    if (playerState.value === 'playing') {
      throw new Error('無法在播放期間更改數據')
    }

    originalData.value = [...data]
    currentData.value = [...data]
    resetPlayback()

    saveSnapshot('設定數據', `數據: [${data.join(', ')}]`)
  }

  /**
   * 選擇演算法
   */
  function selectAlgorithm(algorithm: SortingAlgorithmType) {
    if (playerState.value === 'playing') {
      throw new Error('無法在播放期間更改演算法')
    }

    selectedAlgorithm.value = algorithm
    resetPlayback()

    saveSnapshot('選擇演算法', `演算法: ${algorithm}`)
  }

  /**
   * 開始排序
   */
  async function startSorting() {
    if (!canStart.value) {
      throw new Error('無法開始排序')
    }

    try {
      isLoading.value = true
      errorMessage.value = ''

      // 生成排序步驟
      const algorithm = SortingAlgorithmFactory.create(selectedAlgorithm.value, [...originalData.value])
      const sortingSteps = algorithm.sort()

      steps.value = sortingSteps
      currentStep.value = 0
      currentData.value = [...originalData.value]
      playerState.value = 'playing'

      saveSnapshot('開始排序', `開始 ${selectedAlgorithm.value} 排序`)

    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '排序失敗'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 暫停播放
   */
  function pausePlayback() {
    if (playerState.value === 'playing') {
      playerState.value = 'paused'
      saveSnapshot('暫停播放', `在步驟 ${currentStep.value + 1} 暫停`)
    }
  }

  /**
   * 繼續播放
   */
  function resumePlayback() {
    if (playerState.value === 'paused') {
      playerState.value = 'playing'
      saveSnapshot('繼續播放', `從步驟 ${currentStep.value + 1} 繼續`)
    }
  }

  /**
   * 停止播放
   */
  function stopPlayback() {
    playerState.value = 'idle'
    currentStep.value = 0
    currentData.value = [...originalData.value]

    saveSnapshot('停止播放', '重置到初始狀態')
  }

  /**
   * 重置播放狀態
   */
  function resetPlayback() {
    playerState.value = 'idle'
    currentStep.value = 0
    steps.value = []
    currentData.value = [...originalData.value]
    errorMessage.value = ''
  }

  /**
   * 跳到指定步驟
   */
  function jumpToStep(stepIndex: number) {
    if (!canNavigate.value) {
      throw new Error('無法在播放期間跳轉步驟')
    }

    if (stepIndex < 0 || stepIndex >= totalSteps.value) {
      throw new Error('步驟索引超出範圍')
    }

    currentStep.value = stepIndex

    // 直接使用步驟中的陣列狀態
    const step = steps.value[stepIndex]
    if (step) {
      currentData.value = [...step.arrayState.data]
    }

    saveSnapshot('跳轉步驟', `跳轉到步驟 ${stepIndex + 1}`)
  }

  /**
   * 下一步
   */
  function nextStep() {
    if (currentStep.value < totalSteps.value - 1) {
      jumpToStep(currentStep.value + 1)
    }
  }

  /**
   * 上一步
   */
  function previousStep() {
    if (currentStep.value > 0) {
      jumpToStep(currentStep.value - 1)
    }
  }

  /**
   * 更新播放速度
   */
  function updatePlaybackSpeed(speed: number) {
    playbackSpeed.value = Math.max(0.1, Math.min(5.0, speed))
    config.value.playbackSpeed = playbackSpeed.value

    saveSnapshot('調整速度', `播放速度: ${playbackSpeed.value.toFixed(1)}x`)
  }

  /**
   * 更新配置
   */
  function updateConfig(newConfig: Partial<VisualizationConfig>) {
    config.value = { ...config.value, ...newConfig }
    saveSnapshot('更新配置', '配置已更新')
  }

  /**
   * 設定渲染器類型
   */
  function setRendererType(type: 'webgpu' | 'canvas2d') {
    rendererType.value = type
  }

  /**
   * 設定錯誤訊息
   */
  function setError(message: string) {
    errorMessage.value = message
  }

  /**
   * 清除錯誤訊息
   */
  function clearError() {
    errorMessage.value = ''
  }

  // ===================
  // 時間旅行功能
  // ===================

  /**
   * 保存當前狀態快照
   */
  function saveSnapshot(description: string, details?: string) {
    // 如果正在時間旅行，不保存新快照
    if (isTimeTravel.value) return

    const snapshot: TimelineSnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      description: details ? `${description}: ${details}` : description,
      state: {
        currentData: [...currentData.value],
        currentStep: currentStep.value,
        playerState: playerState.value,
        selectedAlgorithm: selectedAlgorithm.value,
        steps: [...steps.value]
      }
    }

    timeline.value.push(snapshot)
    currentSnapshotIndex.value = timeline.value.length - 1

    // 限制快照數量
    if (timeline.value.length > maxSnapshots.value) {
      timeline.value.shift()
      currentSnapshotIndex.value--
    }
  }

  /**
   * 恢復到指定快照
   */
  function restoreSnapshot(snapshotId: string) {
    const snapshot = timeline.value.find(s => s.id === snapshotId)
    if (!snapshot) {
      throw new Error('找不到指定的快照')
    }

    isTimeTravel.value = true

    try {
      // 恢復狀態
      currentData.value = [...snapshot.state.currentData]
      currentStep.value = snapshot.state.currentStep
      playerState.value = snapshot.state.playerState
      selectedAlgorithm.value = snapshot.state.selectedAlgorithm
      steps.value = [...snapshot.state.steps]

      // 更新快照索引
      currentSnapshotIndex.value = timeline.value.findIndex(s => s.id === snapshotId)

    } finally {
      isTimeTravel.value = false
    }
  }

  /**
   * 清除時間旅行歷史
   */
  function clearTimeline() {
    timeline.value = []
    currentSnapshotIndex.value = -1
  }

  /**
   * 導出時間旅行歷史
   */
  function exportTimeline() {
    return {
      snapshots: timeline.value,
      totalCount: timeline.value.length,
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 導入時間旅行歷史
   */
  function importTimeline(data: { snapshots: TimelineSnapshot[] }) {
    timeline.value = data.snapshots
    currentSnapshotIndex.value = timeline.value.length - 1
  }

  // ===================
  // 返回公開 API
  // ===================

  return {
    // 狀態
    selectedAlgorithm,
    originalData,
    currentData,
    steps,
    playerState,
    currentStep,
    playbackSpeed,
    isLooping,
    rendererType,
    isLoading,
    errorMessage,
    config,
    timeline,
    currentSnapshotIndex,
    isTimeTravel,

    // 計算屬性
    totalSteps,
    progress,
    currentStepInfo,
    canStart,
    canNavigate,
    canTimeTravel,
    timelineSummary,

    // 核心動作
    setData,
    selectAlgorithm,
    startSorting,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    resetPlayback,
    jumpToStep,
    nextStep,
    previousStep,
    updatePlaybackSpeed,
    updateConfig,
    setRendererType,
    setError,
    clearError,

    // 時間旅行動作
    saveSnapshot,
    restoreSnapshot,
    clearTimeline,
    exportTimeline,
    importTimeline
  }
})
