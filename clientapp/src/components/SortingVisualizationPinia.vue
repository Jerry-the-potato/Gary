<!--
  Pinia 驅動的排序視覺化組件
  實作 Issue #7: Pinia 狀態切分與時間旅行除錯
-->

<template>
  <div class="sorting-visualization-pinia">
    <!-- 演算法選擇器 -->
    <div class="algorithm-selector">
      <h2>🎯 選擇排序演算法</h2>
      <div class="algorithm-buttons">
        <button
          v-for="algorithm in algorithms"
          :key="algorithm.type"
          :class="[
            'algorithm-button',
            { active: selectedAlgorithm === algorithm.type }
          ]"
          @click="selectAlgorithm(algorithm.type)"
        >
          {{ algorithm.name }}
        </button>
      </div>
    </div>

    <!-- 數據輸入 -->
    <div class="data-input">
      <h3>📊 輸入數據</h3>
      <div class="input-controls">
        <input
          v-model="dataInput"
          type="text"
          placeholder="輸入數字，用逗號分隔 (例: 64,34,25,12,22,11,90)"
          class="data-input-field"
        />
        <button @click="generateRandomData" class="generate-button">
          🎲 隨機生成
        </button>
        <button @click="resetData" class="reset-button">
          🔄 重置
        </button>
      </div>
      <div class="current-data">
        <strong>當前數據:</strong> [{{ currentData.join(', ') }}]
      </div>
    </div>

    <!-- 視覺化畫布 -->
    <div class="visualization-container">
      <canvas
        ref="canvasElement"
        class="visualization-canvas"
        :width="renderConfig.width"
        :height="renderConfig.height"
      ></canvas>

      <!-- 渲染引擎信息 -->
      <div class="engine-info" v-if="activeRenderer">
        🚀 渲染引擎: {{ activeRenderer === 'webgpu' ? 'WebGPU' : 'Canvas2D' }}
        <span class="performance-info" v-if="showPerformance">
          | FPS: {{ performanceSummary.fps }} |
          幀時間: {{ performanceSummary.frameTime }}ms
        </span>
      </div>
    </div>

    <!-- 播放控制器 -->
    <div class="player-controls">
      <div class="control-buttons">
        <button @click="startSorting" :disabled="!canStart" class="start-button">
          ▶️ 開始排序
        </button>
        <button @click="pausePlayback" :disabled="playerState !== 'playing'" class="pause-button">
          ⏸️ 暫停
        </button>
        <button @click="resumePlayback" :disabled="playerState !== 'paused'" class="resume-button">
          ▶️ 繼續
        </button>
        <button @click="stopPlayback" :disabled="playerState === 'idle'" class="stop-button">
          ⏹️ 停止
        </button>
        <button @click="previousStep" :disabled="!canNavigate" class="step-button">
          ⏮️ 上一步
        </button>
        <button @click="nextStep" :disabled="!canNavigate" class="step-button">
          ⏭️ 下一步
        </button>
      </div>

      <!-- 播放速度控制 -->
      <div class="speed-control">
        <label>播放速度:</label>
        <input
          :value="playbackSpeed"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          class="speed-slider"
          @input="updateSpeed"
        />
        <span class="speed-display">{{ playbackSpeed.toFixed(1) }}x</span>
      </div>

      <!-- 進度條 -->
      <div class="progress-container" v-if="totalSteps > 0">
        <div class="progress-info">
          步驟 {{ currentStep + 1 }} / {{ totalSteps }}
          ({{ Math.round(progress * 100) }}%)
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${progress * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 當前步驟信息 -->
    <div class="step-info" v-if="currentStepInfo">
      <h3>📋 當前步驟</h3>
      <div class="step-details">
        <div class="step-type">
          <strong>操作類型:</strong> {{ currentStepInfo.operation.type.toUpperCase() }}
        </div>
        <div class="step-description">
          <strong>說明:</strong> {{ currentStepInfo.operation.description }}
        </div>
        <div class="step-complexity" v-if="currentStepInfo.operation.complexity">
          <strong>複雜度:</strong>
          時間 {{ currentStepInfo.operation.complexity.time }} |
          空間 {{ currentStepInfo.operation.complexity.space }}
        </div>
      </div>
    </div>

    <!-- 演算法信息 -->
    <div class="algorithm-info" v-if="selectedAlgorithmInfo">
      <h3>📚 演算法資訊</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>名稱:</strong> {{ selectedAlgorithmInfo.name }}
        </div>
        <div class="info-item">
          <strong>描述:</strong> {{ selectedAlgorithmInfo.description }}
        </div>
        <div class="info-item">
          <strong>時間複雜度:</strong>
          最佳: {{ selectedAlgorithmInfo.complexity.bestCase }} |
          平均: {{ selectedAlgorithmInfo.complexity.averageCase }} |
          最差: {{ selectedAlgorithmInfo.complexity.worstCase }}
        </div>
        <div class="info-item">
          <strong>空間複雜度:</strong> {{ selectedAlgorithmInfo.complexity.spaceComplexity }}
        </div>
        <div class="info-item">
          <strong>優點:</strong> {{ selectedAlgorithmInfo.prosAndCons.pros.join(', ') }}
        </div>
        <div class="info-item">
          <strong>缺點:</strong> {{ selectedAlgorithmInfo.prosAndCons.cons.join(', ') }}
        </div>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <div class="error-message" v-if="errorMessage">
      ❌ {{ errorMessage }}
    </div>

    <!-- 載入提示 -->
    <div class="loading" v-if="isLoading">
      ⏳ 正在初始化視覺化引擎...
    </div>

    <!-- 時間旅行面板 -->
    <TimeTravelPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSortingVisualizationStore } from '../stores/sortingVisualization'
import { useRendererStore } from '../stores/renderer'
import { useAppStore } from '../stores/app'
import { getAlgorithmMetadata } from '../composables/useAlgorithmMapping'
import TimeTravelPanel from './TimeTravelPanel.vue'

// Stores
const sortingStore = useSortingVisualizationStore()
const rendererStore = useRendererStore()
const appStore = useAppStore()

// 組件狀態
const canvasElement = ref<HTMLCanvasElement | null>(null)
const dataInput = ref('64,34,25,12,22,11,90')

// 從 stores 計算屬性
const selectedAlgorithm = computed(() => sortingStore.selectedAlgorithm)
const currentData = computed(() => sortingStore.currentData)
const playerState = computed(() => sortingStore.playerState)
const currentStep = computed(() => sortingStore.currentStep)
const totalSteps = computed(() => sortingStore.totalSteps)
const progress = computed(() => sortingStore.progress)
const currentStepInfo = computed(() => sortingStore.currentStepInfo)
const playbackSpeed = computed(() => sortingStore.playbackSpeed)
const canStart = computed(() => sortingStore.canStart)
const canNavigate = computed(() => sortingStore.canNavigate)
const errorMessage = computed(() => sortingStore.errorMessage)
const isLoading = computed(() => sortingStore.isLoading)

// 渲染器相關
const activeRenderer = computed(() => rendererStore.activeRenderer)
const renderConfig = computed(() => rendererStore.config)
const performanceSummary = computed(() => rendererStore.performanceSummary)
const showPerformance = computed(() => appStore.isDebugMode)

// 演算法配置
const algorithms = [
  { type: 'bubble-sort' as const, name: '氣泡排序' },
  { type: 'selection-sort' as const, name: '選擇排序' },
  { type: 'insertion-sort' as const, name: '插入排序' }
]

// 計算演算法資訊
const selectedAlgorithmInfo = computed(() => {
  return getAlgorithmMetadata(selectedAlgorithm.value)
})

// 方法
function selectAlgorithm(algorithm: typeof algorithms[0]['type']) {
  try {
    sortingStore.selectAlgorithm(algorithm)
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '切換演算法失敗',
      message: error instanceof Error ? error.message : '無法切換演算法',
      autoClose: true
    })
  }
}

function generateRandomData() {
  const count = 8
  const min = 10
  const max = 100
  const randomData = Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  )

  dataInput.value = randomData.join(',')
  setDataFromInput()
}

function resetData() {
  dataInput.value = '64,34,25,12,22,11,90'
  setDataFromInput()
}

function setDataFromInput() {
  try {
    const numbers = dataInput.value
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => {
        const num = parseInt(s, 10)
        if (isNaN(num)) {
          throw new Error(`"${s}" 不是有效的數字`)
        }
        return num
      })

    if (numbers.length === 0) {
      throw new Error('請輸入至少一個數字')
    }

    if (numbers.length > 20) {
      throw new Error('數字數量不能超過 20 個')
    }

    sortingStore.setData(numbers)

  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '數據輸入錯誤',
      message: error instanceof Error ? error.message : '數據格式不正確',
      autoClose: true
    })
  }
}

async function startSorting() {
  try {
    await sortingStore.startSorting()
    appStore.recordSortingRun(selectedAlgorithm.value)

    appStore.addNotification({
      type: 'success',
      title: '開始排序',
      message: `已開始 ${getAlgorithmName(selectedAlgorithm.value)} 排序`,
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '排序啟動失敗',
      message: error instanceof Error ? error.message : '無法開始排序',
      autoClose: true
    })
  }
}

function pausePlayback() {
  sortingStore.pausePlayback()
}

function resumePlayback() {
  sortingStore.resumePlayback()
}

function stopPlayback() {
  sortingStore.stopPlayback()
}

function previousStep() {
  sortingStore.previousStep()
}

function nextStep() {
  sortingStore.nextStep()
}

function updateSpeed(event: Event) {
  const target = event.target as HTMLInputElement
  const speed = parseFloat(target.value)
  sortingStore.updatePlaybackSpeed(speed)
}

function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    'bubble-sort': '氣泡排序',
    'selection-sort': '選擇排序',
    'insertion-sort': '插入排序'
  }
  return names[algorithm] || algorithm
}

// 初始化渲染器
async function initializeRenderer() {
  try {
    await rendererStore.checkBrowserSupport()
    await rendererStore.initializeRenderer()

    appStore.addNotification({
      type: 'success',
      title: '渲染引擎已就緒',
      message: `已啟用 ${activeRenderer.value === 'webgpu' ? 'WebGPU' : 'Canvas2D'} 渲染引擎`,
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '渲染引擎初始化失敗',
      message: error instanceof Error ? error.message : '無法初始化渲染引擎',
      autoClose: false
    })
  }
}

// 監聽數據輸入變化
watch(dataInput, () => {
  setDataFromInput()
}, { immediate: true })

// 生命週期鉤子
onMounted(async () => {
  await initializeRenderer()
})

onBeforeUnmount(() => {
  sortingStore.stopPlayback()
})
</script>

<style scoped>
/*
  深色模式適配的排序視覺化樣式
  基於 Gary 專案深色模式設計規範
*/

.sorting-visualization-pinia {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
               'Helvetica Neue', Arial, sans-serif;
}

/* 演算法選擇器 */
.algorithm-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  color: var(--ui-button-text);
  position: relative;
  overflow: hidden;
}

.algorithm-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(255,255,255,0.1) 0%,
    transparent 50%,
    rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.algorithm-selector h2 {
  margin: 0 0 1rem 0;
  color: var(--ui-button-text);
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.algorithm-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.algorithm-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: var(--ui-button-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.algorithm-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.algorithm-button.active {
  background: var(--bg-overlay);
  color: var(--accent-primary);
  border-color: var(--bg-overlay);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.algorithm-button.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-success);
  animation: activeGlow 2s ease-in-out infinite alternate;
}

@keyframes activeGlow {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

/* 數據輸入區域 */
.data-input {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.data-input h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.input-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.data-input-field {
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  background: var(--ui-input-bg);
  border: 2px solid var(--ui-input-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.data-input-field:focus {
  border-color: var(--ui-input-focus);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  outline: none;
}

.generate-button, .reset-button {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.generate-button {
  background: var(--accent-success);
  color: var(--ui-button-text);
}

.generate-button:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.reset-button {
  background: var(--accent-warning);
  color: var(--ui-button-text);
}

.reset-button:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.current-data {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-muted);
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 視覺化容器 */
.visualization-container {
  position: relative;
  margin-bottom: 2rem;
  background: var(--canvas-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition: background-color 0.3s ease;
}

.visualization-canvas {
  display: block;
  width: 100%;
  height: auto;
  background: var(--canvas-bg);
  transition: background-color 0.3s ease;
}

.engine-info {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-overlay);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-weight: 500;
}

/* 播放控制器 */
.player-controls {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.control-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.start-button, .pause-button, .resume-button,
.stop-button, .step-button {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.start-button {
  background: var(--accent-success);
  color: var(--ui-button-text);
}

.start-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.pause-button {
  background: var(--accent-warning);
  color: var(--ui-button-text);
}

.pause-button:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.resume-button {
  background: var(--accent-primary);
  color: var(--ui-button-text);
}

.resume-button:hover:not(:disabled) {
  background: var(--ui-button-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.stop-button {
  background: var(--accent-error);
  color: var(--ui-button-text);
}

.stop-button:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.step-button {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.step-button:hover:not(:disabled) {
  background: var(--border-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.control-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: var(--ui-button-disabled) !important;
}

/* 播放速度控制 */
.speed-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.speed-control label {
  font-weight: 500;
  color: var(--text-secondary);
}

.speed-slider {
  flex: 1;
  max-width: 200px;
  accent-color: var(--accent-primary);
}

.speed-display {
  min-width: 3rem;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-muted);
}

/* 進度條 */
.progress-container {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-muted);
}

.progress-info {
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 步驟信息 */
.step-info, .algorithm-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.step-info h3, .algorithm-info h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.step-details, .info-grid {
  display: grid;
  gap: 0.75rem;
}

.step-type, .step-description, .step-complexity,
.info-item {
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-muted);
}

.info-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* 錯誤和載入狀態 */
.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--accent-error);
  border-radius: 8px;
  color: var(--accent-error);
  margin-bottom: 1rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.loading {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .sorting-visualization-pinia {
    padding: 1rem;
  }

  .algorithm-buttons {
    flex-direction: column;
  }

  .algorithm-button {
    text-align: center;
  }

  .input-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .data-input-field {
    min-width: auto;
  }

  .control-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .speed-control {
    flex-direction: column;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .sorting-visualization-pinia,
  .algorithm-selector,
  .data-input,
  .player-controls,
  .step-info,
  .algorithm-info {
    border-width: 2px;
  }

  .algorithm-button,
  .start-button,
  .pause-button,
  .resume-button,
  .stop-button,
  .step-button {
    border-width: 2px;
    font-weight: 600;
  }
}

/* 減少動畫偏好 */
@media (prefers-reduced-motion: reduce) {
  .algorithm-button,
  .generate-button,
  .reset-button,
  .start-button,
  .pause-button,
  .resume-button,
  .stop-button,
  .step-button,
  .progress-fill {
    transition: none;
  }

  .activeGlow,
  .shimmer {
    animation: none;
  }
}

/* 列印樣式 */
@media print {
  .sorting-visualization-pinia {
    box-shadow: none;
    border: 1px solid #000;
    background: white;
    color: black;
  }

  .control-buttons,
  .speed-control {
    display: none;
  }

  .algorithm-selector {
    background: #f0f0f0;
    color: black;
  }
}

.algorithm-selector {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
}

.algorithm-selector h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
}

.algorithm-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.algorithm-button {
  padding: 12px 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.algorithm-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.algorithm-button.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-color: white;
}

.data-input {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.data-input h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.input-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.data-input-field {
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.data-input-field:focus {
  outline: none;
  border-color: #667eea;
}

.generate-button, .reset-button {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-button {
  background: #10b981;
  color: white;
}

.generate-button:hover {
  background: #059669;
}

.reset-button {
  background: #6b7280;
  color: white;
}

.reset-button:hover {
  background: #4b5563;
}

.current-data {
  font-size: 14px;
  color: #6b7280;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.visualization-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.visualization-canvas {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.engine-info {
  margin-top: 12px;
  font-size: 14px;
  color: #6b7280;
}

.performance-info {
  color: #10b981;
  font-weight: 500;
}

.player-controls {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.control-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
}

.control-buttons button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-button:not(:disabled) {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.start-button:hover:not(:disabled) {
  background: #059669;
}

.pause-button:not(:disabled), .resume-button:not(:disabled) {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.pause-button:hover:not(:disabled), .resume-button:hover:not(:disabled) {
  background: #d97706;
}

.stop-button:not(:disabled) {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.stop-button:hover:not(:disabled) {
  background: #dc2626;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.speed-control label {
  font-weight: 500;
  color: #374151;
}

.speed-slider {
  width: 200px;
}

.speed-display {
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
}

.progress-container {
  text-align: center;
}

.progress-info {
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.step-info, .algorithm-info {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.step-info h3, .algorithm-info h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.step-details, .info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-type, .step-description, .step-complexity,
.info-item {
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #fecaca;
}

.loading {
  background: #fef3c7;
  color: #92400e;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  border: 1px solid #fde68a;
}

/* 深色主題支援 */
[data-theme="dark"] .sorting-visualization-pinia {
  background: #111827;
  color: #f9fafb;
}

[data-theme="dark"] .data-input,
[data-theme="dark"] .visualization-container,
[data-theme="dark"] .player-controls,
[data-theme="dark"] .step-info,
[data-theme="dark"] .algorithm-info {
  background: #1f2937;
}

[data-theme="dark"] .visualization-canvas {
  background: #374151;
  border-color: #4b5563;
}

[data-theme="dark"] .control-buttons button {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
</style>
