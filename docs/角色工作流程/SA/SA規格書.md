## **演算法視覺化系統 - Vue.js 技術規格書 v1.0**

### **文件資訊**
- **專案名稱**: Algorithm Visualization Platform
- **技術負責人**: Jerry-the-potato (Frontend Lead)
- **後端負責人**: Gary (Backend Engineer)
- **文件版本**: v2.0 (Vue.js 架構)
- **最後更新**: 2025-08-10 10:56:19 UTC

---

## **1. 系統概述**

### **1.1 技術棧選擇說明**
```
架構1: React + TypeScript + WebGPU + Rust WASM
架構2: Vue 3 + TypeScript + WebGPU + Rust WASM
```

**戰略傾向**：
- Vue 3 的 Composition API 更適合複雜狀態管理
- 更直觀的模板語法，有利於視覺化元件開發
- 更小的打包體積，適合演算法視覺化的效能需求

### **1.2 核心架構設計**
```typescript
Frontend Architecture:
├── Vue 3.4+ (Composition API)
├── TypeScript 5.0+
├── Pinia (狀態管理)
├── WebGPU Rendering Engine
├── Rust WASM Algorithm Engine
└── Vite 5.0+ (建置工具)

Backend Architecture:
├── .NET 8 (主要 API)
├── PostgreSQL (資料庫)
├── Redis (快取層)
└── Windows Server + IIS (部署環境)
```

---

## **2. Vue.js 前端架構規格**

### **2.1 專案結構設計**
```
algorithm-visualization-vue/
├── src/
│   ├── components/           # Vue 元件
│   │   ├── algorithm/        # 演算法相關元件
│   │   ├── visualization/    # 視覺化元件
│   │   ├── controls/         # 控制面板元件
│   │   └── ui/              # 通用 UI 元件
│   ├── composables/         # Vue 3 Composition 函式
│   │   ├── useAlgorithm.ts  # 演算法邏輯
│   │   ├── useWebGPU.ts     # WebGPU 管理
│   │   └── useWasm.ts       # WASM 整合
│   ├── stores/              # Pinia 狀態管理
│   │   ├── algorithm.ts     # 演算法狀態
│   │   ├── visualization.ts # 視覺化狀態
│   │   └── user.ts          # 使用者狀態
│   ├── services/            # API 服務層
│   ├── types/               # TypeScript 型別定義
│   ├── utils/               # 工具函式
│   ├── wasm/                # Rust WASM 模組
│   └── shaders/             # WebGPU 著色器
├── public/
│   └── wasm/                # WASM 靜態檔案
├── tests/                   # 測試檔案
├── docs/                    # 技術文件
└── scripts/                 # 建置腳本
```

### **2.2 核心 Vue 元件設計**

#### **主要視覺化元件**
```vue
<!-- AlgorithmVisualizer.vue -->
<template>
  <div class="algorithm-visualizer">
    <!-- WebGPU Canvas 容器 -->
    <canvas 
      ref="webgpuCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
    />
    
    <!-- 演算法控制面板 -->
    <AlgorithmControls
      :is-playing="isPlaying"
      :current-step="currentStep"
      :total-steps="totalSteps"
      @play="handlePlay"
      @pause="handlePause"
      @step="handleStep"
      @reset="handleReset"
    />
    
    <!-- 演算法狀態顯示 -->
    <AlgorithmStatus
      :algorithm-type="algorithmType"
      :current-operation="currentOperation"
      :complexity-info="complexityInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAlgorithm } from '@/composables/useAlgorithm'
import { useWebGPU } from '@/composables/useWebGPU'
import { useWasm } from '@/composables/useWasm'

// Props 定義
interface Props {
  algorithmType: AlgorithmType
  initialData: number[]
}

const props = defineProps<Props>()

// 模板引用
const webgpuCanvas = ref<HTMLCanvasElement>()

// Composables
const { 
  isPlaying, 
  currentStep, 
  totalSteps, 
  currentOperation,
  executeStep,
  reset 
} = useAlgorithm(props.algorithmType, props.initialData)

const { 
  initializeWebGPU, 
  renderFrame,
  canvasWidth,
  canvasHeight 
} = useWebGPU()

const { 
  initializeWasm,
  executeAlgorithmStep 
} = useWasm()

// 生命週期
onMounted(async () => {
  await initializeWebGPU(webgpuCanvas.value!)
  await initializeWasm()
})

// 監聽狀態變化，同步渲染
watch([currentStep, currentOperation], () => {
  renderFrame({
    data: algorithmState.data,
    highlightedIndices: algorithmState.highlightedIndices,
    operationType: currentOperation.value
  })
})
</script>
```

### **2.3 Composition API 設計**

#### **演算法管理 Composable**
```typescript
// composables/useAlgorithm.ts
import { ref, computed, reactive } from 'vue'
import { useAlgorithmStore } from '@/stores/algorithm'
import { useWasm } from './useWasm'

export interface AlgorithmState {
  data: number[]
  currentStep: number
  totalSteps: number
  isComplete: boolean
  highlightedIndices: number[]
  currentOperation: string
}

export function useAlgorithm(algorithmType: AlgorithmType, initialData: number[]) {
  const store = useAlgorithmStore()
  const { executeWasmStep } = useWasm()
  
  // 響應式狀態
  const state = reactive<AlgorithmState>({
    data: [...initialData],
    currentStep: 0,
    totalSteps: 0,
    isComplete: false,
    highlightedIndices: [],
    currentOperation: ''
  })
  
  const isPlaying = ref(false)
  const playbackSpeed = ref(1000) // ms
  
  // 計算屬性
  const progress = computed(() => 
    state.totalSteps > 0 ? (state.currentStep / state.totalSteps) * 100 : 0
  )
  
  const complexityInfo = computed(() => 
    getComplexityInfo(algorithmType, state.data.length)
  )
  
  // 方法
  const executeStep = async () => {
    if (state.isComplete) return
    
    try {
      const result = await executeWasmStep(algorithmType, state.data, state.currentStep)
      
      if (result) {
        state.data = result.newData
        state.highlightedIndices = result.highlightedIndices
        state.currentOperation = result.operation
        state.currentStep++
        
        // 更新 Pinia store
        store.updateState(state)
      } else {
        state.isComplete = true
        isPlaying.value = false
      }
    } catch (error) {
      console.error('Algorithm execution error:', error)
      // 發送錯誤到後端分析
      await reportError(error, { algorithmType, step: state.currentStep })
    }
  }
  
  const play = () => {
    isPlaying.value = true
    playbackLoop()
  }
  
  const pause = () => {
    isPlaying.value = false
  }
  
  const reset = () => {
    state.data = [...initialData]
    state.currentStep = 0
    state.isComplete = false
    state.highlightedIndices = []
    state.currentOperation = ''
    isPlaying.value = false
  }
  
  const playbackLoop = async () => {
    if (!isPlaying.value || state.isComplete) return
    
    await executeStep()
    
    if (isPlaying.value && !state.isComplete) {
      setTimeout(playbackLoop, playbackSpeed.value)
    }
  }
  
  return {
    // 狀態
    ...toRefs(state),
    isPlaying: readonly(isPlaying),
    progress,
    complexityInfo,
    
    // 方法
    executeStep,
    play,
    pause,
    reset,
    setPlaybackSpeed: (speed: number) => playbackSpeed.value = speed
  }
}
```

#### **WebGPU 渲染 Composable**
```typescript
// composables/useWebGPU.ts
import { ref, reactive } from 'vue'

interface WebGPUState {
  device: GPUDevice | null
  context: GPUCanvasContext | null
  renderPipeline: GPURenderPipeline | null
  isInitialized: boolean
}

export function useWebGPU() {
  const state = reactive<WebGPUState>({
    device: null,
    context: null,
    renderPipeline: null,
    isInitialized: false
  })
  
  const canvasWidth = ref(800)
  const canvasHeight = ref(600)
  
  const initializeWebGPU = async (canvas: HTMLCanvasElement) => {
    try {
      // 檢查 WebGPU 支援
      if (!navigator.gpu) {
        throw new Error('WebGPU not supported')
      }
      
      // 取得 GPU 裝置
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        throw new Error('No GPU adapter found')
      }
      
      state.device = await adapter.requestDevice()
      state.context = canvas.getContext('webgpu')!
      
      // 配置 Canvas 上下文
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
      state.context.configure({
        device: state.device,
        format: canvasFormat,
      })
      
      // 建立渲染管線
      state.renderPipeline = await createRenderPipeline(state.device, canvasFormat)
      state.isInitialized = true
      
    } catch (error) {
      console.error('WebGPU initialization failed:', error)
      // 回退到 Canvas2D
      await fallbackToCanvas2D(canvas)
    }
  }
  
  const renderFrame = (frameData: FrameData) => {
    if (!state.isInitialized || !state.device || !state.context) return
    
    const commandEncoder = state.device.createCommandEncoder()
    const textureView = state.context.getCurrentTexture().createView()
    
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    }
    
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(state.renderPipeline!)
    
    // 更新頂點緩衝區
    updateVertexBuffer(frameData)
    
    // 執行繪製
    passEncoder.draw(frameData.data.length * 6) // 每個柱狀圖 6 個頂點
    passEncoder.end()
    
    state.device.queue.submit([commandEncoder.finish()])
  }
  
  return {
    canvasWidth,
    canvasHeight,
    isInitialized: readonly(ref(() => state.isInitialized)),
    initializeWebGPU,
    renderFrame
  }
}
```

### **2.4 Pinia 狀態管理**

#### **演算法狀態 Store**
```typescript
// stores/algorithm.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlgorithmStore = defineStore('algorithm', () => {
  // 狀態
  const currentAlgorithm = ref<AlgorithmType>('bubble-sort')
  const inputData = ref<number[]>([])
  const algorithmHistory = ref<AlgorithmEvent[]>([])
  const performanceMetrics = ref<PerformanceMetrics>({
    comparisons: 0,
    swaps: 0,
    timeComplexity: '',
    spaceComplexity: ''
  })
  
  // 計算屬性
  const isAlgorithmRunning = computed(() => 
    algorithmHistory.value.length > 0 && 
    !algorithmHistory.value[algorithmHistory.value.length - 1].isComplete
  )
  
  const totalOperations = computed(() => 
    performanceMetrics.value.comparisons + performanceMetrics.value.swaps
  )
  
  // 動作
  const setAlgorithm = (algorithm: AlgorithmType) => {
    currentAlgorithm.value = algorithm
  }
  
  const setInputData = (data: number[]) => {
    inputData.value = [...data]
  }
  
  const addEvent = (event: AlgorithmEvent) => {
    algorithmHistory.value.push(event)
  }
  
  const clearHistory = () => {
    algorithmHistory.value = []
    performanceMetrics.value = {
      comparisons: 0,
      swaps: 0,
      timeComplexity: '',
      spaceComplexity: ''
    }
  }
  
  const updateMetrics = (metrics: Partial<PerformanceMetrics>) => {
    performanceMetrics.value = { ...performanceMetrics.value, ...metrics }
  }
  
  return {
    // 狀態
    currentAlgorithm,
    inputData,
    algorithmHistory,
    performanceMetrics,
    
    // 計算屬性
    isAlgorithmRunning,
    totalOperations,
    
    // 動作
    setAlgorithm,
    setInputData,
    addEvent,
    clearHistory,
    updateMetrics
  }
})
```

---

## **3. Rust WASM 整合規格**

### **3.1 WASM 模組架構**
```rust
// algorithm_engine/src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct AlgorithmStep {
    pub new_data: Vec<i32>,
    pub highlighted_indices: Vec<usize>,
    pub operation: String,
    pub is_complete: bool,
    pub metrics: PerformanceMetrics,
}

#[derive(Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub comparisons: u32,
    pub swaps: u32,
    pub memory_accesses: u32,
}

#[wasm_bindgen]
pub struct AlgorithmEngine {
    data: Vec<i32>,
    current_step: usize,
    total_comparisons: u32,
    total_swaps: u32,
    algorithm_type: AlgorithmType,
}

#[wasm_bindgen]
impl AlgorithmEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(data: &[i32], algorithm_type: &str) -> Result<AlgorithmEngine, JsValue> {
        let algo_type = match algorithm_type {
            "bubble-sort" => AlgorithmType::BubbleSort,
            "quick-sort" => AlgorithmType::QuickSort,
            "merge-sort" => AlgorithmType::MergeSort,
            _ => return Err(JsValue::from_str("Unsupported algorithm type")),
        };
        
        Ok(AlgorithmEngine {
            data: data.to_vec(),
            current_step: 0,
            total_comparisons: 0,
            total_swaps: 0,
            algorithm_type: algo_type,
        })
    }
    
    #[wasm_bindgen]
    pub fn execute_step(&mut self) -> Result<JsValue, JsValue> {
        let step_result = match self.algorithm_type {
            AlgorithmType::BubbleSort => self.bubble_sort_step(),
            AlgorithmType::QuickSort => self.quick_sort_step(),
            AlgorithmType::MergeSort => self.merge_sort_step(),
        };
        
        match step_result {
            Ok(step) => Ok(serde_wasm_bindgen::to_value(&step)?),
            Err(e) => Err(JsValue::from_str(&e)),
        }
    }
    
    fn bubble_sort_step(&mut self) -> Result<AlgorithmStep, String> {
        let n = self.data.len();
        let step = self.current_step;
        
        if step >= n * (n - 1) / 2 {
            return Ok(AlgorithmStep {
                new_data: self.data.clone(),
                highlighted_indices: vec![],
                operation: "完成".to_string(),
                is_complete: true,
                metrics: self.get_metrics(),
            });
        }
        
        // 計算當前比較的索引
        let i = step % (n - 1);
        let j = i + 1;
        
        self.total_comparisons += 1;
        
        let mut highlighted = vec![i, j];
        let mut operation = format!("比較 {} 和 {}", self.data[i], self.data[j]);
        
        if self.data[i] > self.data[j] {
            self.data.swap(i, j);
            self.total_swaps += 1;
            operation = format!("交換 {} 和 {}", self.data[j], self.data[i]);
        }
        
        self.current_step += 1;
        
        Ok(AlgorithmStep {
            new_data: self.data.clone(),
            highlighted_indices: highlighted,
            operation,
            is_complete: false,
            metrics: self.get_metrics(),
        })
    }
    
    fn get_metrics(&self) -> PerformanceMetrics {
        PerformanceMetrics {
            comparisons: self.total_comparisons,
            swaps: self.total_swaps,
            memory_accesses: self.total_comparisons + self.total_swaps * 2,
        }
    }
}
```

### **3.2 Vue-WASM 橋接層**
```typescript
// composables/useWasm.ts
import { ref } from 'vue'

export function useWasm() {
  const isWasmLoaded = ref(false)
  const wasmModule = ref<any>(null)
  
  const initializeWasm = async () => {
    try {
      // 動態載入 WASM 模組
      const wasm = await import('@/wasm/algorithm_engine')
      await wasm.default()
      wasmModule.value = wasm
      isWasmLoaded.value = true
    } catch (error) {
      console.error('WASM loading failed:', error)
      throw error
    }
  }
  
  const executeWasmStep = async (
    algorithmType: string,
    data: number[],
    step: number
  ): Promise<AlgorithmStep | null> => {
    if (!isWasmLoaded.value || !wasmModule.value) {
      throw new Error('WASM module not loaded')
    }
    
    try {
      const engine = new wasmModule.value.AlgorithmEngine(data, algorithmType)
      const result = engine.execute_step()
      return result
    } catch (error) {
      console.error('WASM execution error:', error)
      return null
    }
  }
  
  return {
    isWasmLoaded: readonly(isWasmLoaded),
    initializeWasm,
    executeWasmStep
  }
}
```

---

## **4. 建置與部署配置**

### **4.1 Vite 配置**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['@/wasm/algorithm_engine'],
      output: {
        paths: {
          '@/wasm/algorithm_engine': '/wasm/algorithm_engine.js'
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['@/wasm/algorithm_engine']
  }
})
```

### **4.2 TypeScript 配置**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["webgpu"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## **5. 測試策略**

### **5.1 單元測試配置**
```typescript
// tests/unit/useAlgorithm.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAlgorithm } from '@/composables/useAlgorithm'

describe('useAlgorithm', () => {
  beforeEach(() => {
    // 重置測試環境
  })
  
  it('should initialize with correct initial state', () => {
    const { currentStep, isPlaying, data } = useAlgorithm('bubble-sort', [3, 1, 2])
    
    expect(currentStep.value).toBe(0)
    expect(isPlaying.value).toBe(false)
    expect(data.value).toEqual([3, 1, 2])
  })
  
  it('should execute algorithm step correctly', async () => {
    const { executeStep, currentStep, data } = useAlgorithm('bubble-sort', [3, 1, 2])
    
    await executeStep()
    
    expect(currentStep.value).toBe(1)
    // 根據演算法邏輯驗證結果
  })
})
```

### **5.2 E2E 測試**
```typescript
// tests/e2e/algorithm-visualization.test.ts
import { test, expect } from '@playwright/test'

test.describe('Algorithm Visualization', () => {
  test('should render sorting visualization correctly', async ({ page }) => {
    await page.goto('/')
    
    // 選擇演算法
    await page.selectOption('#algorithm-selector', 'bubble-sort')
    
    // 輸入資料
    await page.fill('#data-input', '64,34,25,12,22,11,90')
    
    // 開始執行
    await page.click('#start-button')
    
    // 驗證 Canvas 已渲染
    const canvas = page.locator('#webgpu-canvas')
    await expect(canvas).toBeVisible()
    
    // 驗證控制按鈕功能
    await page.click('#pause-button')
    await expect(page.locator('#play-button')).toBeVisible()
  })
})
```

---

## **6. 效能優化策略**

### **6.1 Vue 3 效能優化**
```typescript
// 使用 defineAsyncComponent 延遲載入
import { defineAsyncComponent } from 'vue'

const AlgorithmVisualizer = defineAsyncComponent(() =>
  import('@/components/algorithm/AlgorithmVisualizer.vue')
)

// 使用 markRaw 避免不必要的響應式
import { markRaw } from 'vue'

const webgpuDevice = markRaw(await adapter.requestDevice())
```

### **6.2 WebGPU 資源管理**
```typescript
// 資源池化管理
class WebGPUResourcePool {
  private bufferPool = new Map<string, GPUBuffer[]>()
  
  getBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
    const key = `${size}_${usage}`
    const pool = this.bufferPool.get(key) || []
    
    if (pool.length > 0) {
      return pool.pop()!
    }
    
    return this.device.createBuffer({ size, usage })
  }
  
  returnBuffer(buffer: GPUBuffer, size: number, usage: GPUBufferUsageFlags) {
    const key = `${size}_${usage}`
    const pool = this.bufferPool.get(key) || []
    pool.push(buffer)
    this.bufferPool.set(key, pool)
  }
}
```

---

## **7. 開發時程與里程碑**

### **7.1 Phase 1: 基礎架構 (週 1-2)**
- Vue 3 + Vite 專案初始化
- TypeScript 配置與型別定義
- 基礎 Composables 實作
- WASM 整合驗證

### **7.2 Phase 2: 核心功能 (週 3-4)**
- WebGPU 渲染引擎開發
- 排序演算法 WASM 實作
- 基礎視覺化元件
- Pinia 狀態管理

### **7.3 Phase 3: 整合測試 (週 5-6)**
- 單元測試與 E2E 測試
- 效能優化與除錯
- 跨瀏覽器相容性測試
- 部署準備

**輸出產物**:
- 完整的 Vue.js 應用程式
- Rust WASM 演算法引擎
- WebGPU 渲染系統
- 自動化測試套件
- 部署腳本與文件

**下一步行動**:
1. 前端工程師 Jerry 開始 Vue 3 專案初始化
2. 建立 Rust WASM 開發環境
3. 設計 WebGPU 著色器程式
4. 與後端 Gary 協調 API 介面規格

這份規格書為 Vue.js 架構的演算法視覺化系統提供了完整的技術指引，確保團隊能夠高效協作開發出高品質的產品。