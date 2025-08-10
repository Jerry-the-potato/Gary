<!--
  MVP 排序視覺化組件
  實作 Issue #6: 三種基礎排序的視覺化與播放器
-->

<template>
  <div class="sorting-visualization">
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
        :width="canvasConfig.width"
        :height="canvasConfig.height"
      ></canvas>
      
      <!-- 渲染引擎信息 -->
      <div class="engine-info" v-if="rendererType">
        🚀 渲染引擎: {{ rendererType === 'webgpu' ? 'WebGPU' : 'Canvas2D' }}
      </div>
    </div>

    <!-- 播放控制器 -->
    <div class="player-controls">
      <div class="control-buttons">
        <button @click="startSorting" :disabled="!canStart" class="start-button">
          ▶️ 開始排序
        </button>
        <button @click="pausePlayer" :disabled="playerState !== 'playing'" class="pause-button">
          ⏸️ 暫停
        </button>
        <button @click="resumePlayer" :disabled="playerState !== 'paused'" class="resume-button">
          ▶️ 繼續
        </button>
        <button @click="stopPlayer" :disabled="playerState === 'idle'" class="stop-button">
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
          v-model.number="playbackSpeed"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          class="speed-slider"
          @input="updatePlaybackSpeed"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { AlgorithmStep } from '../types/algorithm'
import { SortingAlgorithmFactory } from '../composables/useSortingAlgorithms'
import { useSortingPlayer, type PlayerState, type PlayerEvents } from '../composables/useSortingPlayer'
import { getAlgorithmMetadata } from '../composables/useAlgorithmMapping'
import { defaultRenderConfig } from '../composables/useVisualizationRenderer'

// 響應式狀態
const canvasElement = ref<HTMLCanvasElement | null>(null)
const selectedAlgorithm = ref<'bubble-sort' | 'selection-sort' | 'insertion-sort'>('bubble-sort')
const dataInput = ref('64,34,25,12,22,11,90')
const currentData = ref<number[]>([64, 34, 25, 12, 22, 11, 90])
const playerState = ref<PlayerState>('idle')
const currentStep = ref(0)
const totalSteps = ref(0)
const progress = ref(0)
const currentStepInfo = ref<AlgorithmStep | null>(null)
const playbackSpeed = ref(1.0)
const errorMessage = ref('')
const isLoading = ref(true)
const rendererType = ref<string | null>(null)

// 演算法配置
const algorithms = [
  { type: 'bubble-sort' as const, name: '氣泡排序' },
  { type: 'selection-sort' as const, name: '選擇排序' },
  { type: 'insertion-sort' as const, name: '插入排序' }
]

// 畫布配置
const canvasConfig = reactive({
  width: 800,
  height: 400
})

// 播放器管理
const { createPlayer, destroyPlayer, getPlayer } = useSortingPlayer(
  canvasElement.value,
  defaultRenderConfig
)

// 計算屬性
const canStart = computed(() => 
  playerState.value === 'idle' && currentData.value.length > 0
)

const canNavigate = computed(() => 
  playerState.value !== 'playing' && totalSteps.value > 0
)

const selectedAlgorithmInfo = computed(() => 
  getAlgorithmMetadata(selectedAlgorithm.value)
)

// 播放器事件處理
const playerEvents: PlayerEvents = {
  onStateChange: (state) => {
    playerState.value = state
  },
  onStepChange: (current, total, step) => {
    currentStep.value = current
    totalSteps.value = total
    progress.value = total > 0 ? (current + 1) / total : 0
    currentStepInfo.value = step
  },
  onComplete: () => {
    console.log('🎯 排序動畫播放完成')
  },
  onError: (error) => {
    errorMessage.value = error.message
    console.error('播放器錯誤:', error)
  }
}

// 方法
const selectAlgorithm = (algorithm: typeof selectedAlgorithm.value) => {
  selectedAlgorithm.value = algorithm
  stopPlayer() // 停止當前播放
}

const parseDataInput = () => {
  try {
    const numbers = dataInput.value
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0)
    
    if (numbers.length === 0) {
      throw new Error('請輸入有效的正整數')
    }

    currentData.value = numbers
    errorMessage.value = ''
    
    // 停止當前播放
    stopPlayer()
  } catch (error) {
    errorMessage.value = '數據格式錯誤，請輸入用逗號分隔的正整數'
    console.error('數據解析錯誤:', error)
  }
}

const generateRandomData = () => {
  const count = 8
  const maxValue = 99
  const randomData = Array.from(
    { length: count }, 
    () => Math.floor(Math.random() * maxValue) + 1
  )
  
  currentData.value = randomData
  dataInput.value = randomData.join(',')
  
  stopPlayer()
}

const resetData = () => {
  currentData.value = [64, 34, 25, 12, 22, 11, 90]
  dataInput.value = currentData.value.join(',')
  stopPlayer()
}

const startSorting = async () => {
  try {
    errorMessage.value = ''
    
    // 解析輸入數據
    parseDataInput()
    
    // 生成排序步驟
    console.log(`🚀 開始 ${selectedAlgorithm.value} 排序`)
    const steps = SortingAlgorithmFactory.generateSteps(
      selectedAlgorithm.value,
      currentData.value
    )
    
    // 載入步驟到播放器
    const player = getPlayer()
    if (player) {
      player.loadSteps(steps)
      player.play()
    }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : '排序啟動失敗'
    errorMessage.value = message
    console.error('排序錯誤:', error)
  }
}

const pausePlayer = () => {
  getPlayer()?.pause()
}

const resumePlayer = () => {
  getPlayer()?.play()
}

const stopPlayer = () => {
  getPlayer()?.stop()
  // 重置狀態
  currentStep.value = 0
  totalSteps.value = 0
  progress.value = 0
  currentStepInfo.value = null
}

const nextStep = () => {
  getPlayer()?.nextStep()
}

const previousStep = () => {
  getPlayer()?.previousStep()
}

const updatePlaybackSpeed = () => {
  getPlayer()?.setPlaybackSpeed(playbackSpeed.value)
}

// 生命週期
onMounted(async () => {
  try {
    await nextTick()
    
    if (canvasElement.value) {
      const player = await createPlayer(playerEvents, true)
      rendererType.value = player.getRendererType()
      console.log('✅ 視覺化組件初始化完成')
    }
  } catch (error) {
    errorMessage.value = '視覺化引擎初始化失敗'
    console.error('初始化錯誤:', error)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  destroyPlayer()
})
</script>

<style scoped>
.sorting-visualization {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.algorithm-selector {
  margin-bottom: 20px;
}

.algorithm-selector h2 {
  color: #1f2937;
  margin-bottom: 10px;
}

.algorithm-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.algorithm-button {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.algorithm-button:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.algorithm-button.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.data-input {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.input-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.data-input-field {
  flex: 1;
  min-width: 300px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.generate-button, .reset-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
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
  color: #374151;
}

.visualization-container {
  position: relative;
  margin-bottom: 20px;
  text-align: center;
}

.visualization-canvas {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.engine-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.player-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.start-button {
  background: #10b981;
  color: white;
}

.start-button:hover:not(:disabled) {
  background: #059669;
}

.pause-button, .resume-button {
  background: #f59e0b;
  color: white;
}

.pause-button:hover:not(:disabled), .resume-button:hover:not(:disabled) {
  background: #d97706;
}

.stop-button {
  background: #ef4444;
  color: white;
}

.stop-button:hover:not(:disabled) {
  background: #dc2626;
}

.step-button {
  background: #6366f1;
  color: white;
}

.step-button:hover:not(:disabled) {
  background: #4f46e5;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.speed-slider {
  flex: 1;
  max-width: 200px;
}

.speed-display {
  min-width: 40px;
  font-weight: 500;
}

.progress-container {
  margin-top: 10px;
}

.progress-info {
  text-align: center;
  margin-bottom: 5px;
  font-size: 14px;
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
  background: #3b82f6;
  transition: width 0.3s ease;
}

.step-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #eff6ff;
  border-radius: 8px;
}

.step-details {
  display: grid;
  gap: 8px;
}

.algorithm-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0fdf4;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 10px;
}

.info-item {
  font-size: 14px;
  line-height: 1.5;
}

.error-message {
  padding: 10px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-style: italic;
}

@media (max-width: 768px) {
  .sorting-visualization {
    padding: 10px;
  }
  
  .input-controls {
    flex-direction: column;
  }
  
  .data-input-field {
    min-width: unset;
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .visualization-canvas {
    width: 100%;
    height: auto;
  }
}
</style>
