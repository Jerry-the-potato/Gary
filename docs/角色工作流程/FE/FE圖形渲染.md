# role: FE - WebGPU 演算法視覺化系統技術評估與建議

## 角色識別：AI 前端工程師 Jerry-the-potato
感謝技術主管的協調支援！基於目前的系統基礎和文件資料，我將從前端技術實作的角度提供全面的建議和需求分析。

## 核心建議

### 1. **WebGPU 渲染管線優化建議**
**🚀 基於現有架構的效能提升策略**

根據 SA 規格書中的 Vue.js 架構，我建議優化 WebGPU 渲染管線：

```typescript
// 優化的 WebGPU 渲染架構
class OptimizedWebGPURenderer {
  private device: GPUDevice;
  private renderPipeline: GPURenderPipeline;
  private computePipeline: GPUComputePipeline;

  // 雙緩衝機制，避免渲染阻塞
  private frontBuffer: GPUBuffer;
  private backBuffer: GPUBuffer;

  // 實例化渲染，提升大量元素效能
  private instanceBuffer: GPUBuffer;
  private uniformBuffer: GPUBuffer;

  async initializeOptimizedPipeline() {
    // 使用計算著色器預處理排序狀態
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: this.device.createShaderModule({
          code: this.getComputeShaderCode()
        }),
        entryPoint: 'main'
      }
    });

    // 實例化渲染管線，單次繪製所有柱狀圖
    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({
          code: this.getInstancedVertexShader()
        }),
        entryPoint: 'vs_main',
        buffers: [
          this.getVertexBufferLayout(),
          this.getInstanceBufferLayout() // 實例化資料
        ]
      },
      fragment: {
        module: this.device.createShaderModule({
          code: this.getFragmentShader()
        }),
        entryPoint: 'fs_main',
        targets: [{ format: 'bgra8unorm' }]
      }
    });
  }
}
```

### 2. **Vue 3 Composition API 深度整合**
**🔄 響應式狀態與 WebGPU 同步機制**

```typescript
// 高效能 Vue-WebGPU 整合
import { ref, reactive, computed, watch, onMounted } from 'vue'

export function useOptimizedAlgorithmVisualization() {
  const algorithmState = reactive({
    data: [] as number[],
    currentStep: 0,
    highlightedIndices: [] as number[],
    isPlaying: false,
    speed: 1000
  });

  const webgpuRenderer = ref<OptimizedWebGPURenderer | null>(null);

  // 智能批次更新，避免過度渲染
  const pendingUpdates = ref(new Set<string>());
  const isUpdateScheduled = ref(false);

  const scheduleUpdate = (updateType: string) => {
    pendingUpdates.value.add(updateType);

    if (!isUpdateScheduled.value) {
      isUpdateScheduled.value = true;
      requestAnimationFrame(() => {
        flushUpdates();
        isUpdateScheduled.value = false;
      });
    }
  };

  const flushUpdates = () => {
    if (webgpuRenderer.value) {
      // 批次更新 GPU 緩衝區
      webgpuRenderer.value.updateBatch({
        data: pendingUpdates.value.has('data') ? algorithmState.data : null,
        highlights: pendingUpdates.value.has('highlights') ? algorithmState.highlightedIndices : null,
        step: pendingUpdates.value.has('step') ? algorithmState.currentStep : null
      });
    }
    pendingUpdates.value.clear();
  };

  // 監聽狀態變化，智能觸發更新
  watch(() => algorithmState.data, () => scheduleUpdate('data'));
  watch(() => algorithmState.highlightedIndices, () => scheduleUpdate('highlights'));

  return {
    algorithmState,
    webgpuRenderer,
    scheduleUpdate
  };
}
```

### 3. **UI 控制系統最佳實作策略**
**🎨 基於 UX 設計規範的混合式控制系統**

根據 UX 設計規範，我建議採用**混合式控制系統**：

```vue
<!-- HybridControlSystem.vue -->
<template>
  <div class="algorithm-visualizer" :data-theme="currentTheme">
    <!-- 純 WebGPU 渲染層 -->
    <canvas
      ref="webgpuCanvas"
      class="render-layer"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
      @mousemove="handleCanvasMouseMove"
    />

    <!-- 最小化 DOM 控制覆蓋層 -->
    <div class="control-overlay" v-show="showControls">
      <div class="primary-controls">
        <!-- 核心控制按鈕 -->
        <button
          @click="togglePlayback"
          class="control-btn primary"
          :class="{ active: isPlaying }"
        >
          {{ isPlaying ? '⏸' : '▶' }}
        </button>

        <button
          @click="resetAlgorithm"
          class="control-btn secondary"
        >
          ↻
        </button>

        <!-- 速度控制 -->
        <div class="speed-control">
          <input
            type="range"
            v-model="playbackSpeed"
            min="100"
            max="2000"
            step="100"
            class="speed-slider"
            @input="updateSpeed"
          >
          <span class="speed-label">{{ speedLabel }}</span>
        </div>
      </div>

      <!-- 狀態指示器 -->
      <div class="status-display">
        <span class="step-counter">{{ currentStep }}/{{ totalSteps }}</span>
        <span class="operation-display">{{ currentOperation }}</span>
      </div>
    </div>

    <!-- 深色模式切換 -->
    <button
      @click="toggleTheme"
      class="theme-toggle"
      :class="{ dark: isDarkMode }"
    >
      {{ isDarkMode ? '☀' : '🌙' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOptimizedAlgorithmVisualization } from '@/composables/useOptimizedAlgorithmVisualization'
import { useThemeManager } from '@/composables/useThemeManager'

const {
  algorithmState,
  webgpuRenderer,
  scheduleUpdate
} = useOptimizedAlgorithmVisualization();

const {
  currentTheme,
  isDarkMode,
  toggleTheme
} = useThemeManager();

// 控制狀態
const showControls = ref(true);
const canvasWidth = ref(1200);
const canvasHeight = ref(800);

// 計算屬性
const speedLabel = computed(() => {
  return `${(2100 - algorithmState.speed) / 100}x`;
});

// Canvas 互動處理
const handleCanvasClick = (event: MouseEvent) => {
  const rect = webgpuCanvas.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 檢查是否點擊到演算法元素
  const elementIndex = calculateElementIndex(x, y);
  if (elementIndex !== -1) {
    // 觸發元素選中效果
    highlightElement(elementIndex);
  }
};

const handleCanvasMouseMove = (event: MouseEvent) => {
  // 節流處理滑鼠移動事件
  throttledMouseMove(event);
};

// 效能優化的滑鼠事件處理
const throttledMouseMove = throttle((event: MouseEvent) => {
  const rect = webgpuCanvas.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 更新懸停狀態
  updateHoverState(x, y);
}, 16); // 60fps 限制
</script>

<style scoped>
/* 基於 UX 設計規範的樣式 */
.algorithm-visualizer {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--canvas-bg);
  overflow: hidden;
}

.render-layer {
  display: block;
  width: 100%;
  height: 100%;
}

.control-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-overlay);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-panel);

  /* 效能優化 */
  will-change: transform;
  contain: layout style paint;
}

.control-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: var(--accent-primary);
  color: var(--ui-button-text);
  cursor: pointer;

  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  contain: layout;
}

.control-btn:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-button-hover);
}

.control-btn:active {
  transform: scale(0.98);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .control-overlay {
    top: auto;
    bottom: 20px;
    right: 20px;
    left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .control-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
```

### 4. **WASM 整合與效能監控**
**⚡ Rust WASM 與 Vue 的高效整合**

```typescript
// 高效能 WASM 整合管理
export class WasmAlgorithmEngine {
  private wasmModule: any;
  private workerPool: Worker[];
  private currentWorker = 0;

  async initialize() {
    try {
      // 動態載入 WASM 模組
      this.wasmModule = await import('@/wasm/algorithm_engine');
      await this.wasmModule.default();

      // 建立 Worker 池化處理複雜運算
      this.workerPool = Array.from({ length: navigator.hardwareConcurrency || 4 },
        () => new Worker(new URL('@/workers/algorithm-worker.ts', import.meta.url))
      );

    } catch (error) {
      console.error('WASM 初始化失敗:', error);
      // 降級到 JavaScript 實作
      await this.fallbackToJavaScript();
    }
  }

  async executeAlgorithmStep(
    algorithmType: string,
    data: number[],
    step: number
  ): Promise<AlgorithmStepResult> {

    // 大數據集使用 Worker 處理
    if (data.length > 1000) {
      return this.executeInWorker(algorithmType, data, step);
    }

    // 小數據集直接在主線程處理
    try {
      const engine = new this.wasmModule.AlgorithmEngine(data, algorithmType);
      const result = engine.execute_step();
      return JSON.parse(result);
    } catch (error) {
      console.error('WASM 執行錯誤:', error);
      throw error;
    }
  }

  private executeInWorker(
    algorithmType: string,
    data: number[],
    step: number
  ): Promise<AlgorithmStepResult> {

    return new Promise((resolve, reject) => {
      const worker = this.workerPool[this.currentWorker];
      this.currentWorker = (this.currentWorker + 1) % this.workerPool.length;

      const timeout = setTimeout(() => {
        reject(new Error('Worker 執行超時'));
      }, 5000);

      worker.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };

      worker.postMessage({
        type: 'EXECUTE_ALGORITHM',
        payload: { algorithmType, data, step }
      });
    });
  }
}
```

## 輸出產物

### 1. **完整的 Vue 3 專案結構**
```
algorithm-visualization-vue/
├── src/
│   ├── components/
│   │   ├── AlgorithmVisualizer.vue      # 主視覺化組件
│   │   ├── ControlPanel.vue             # 控制面板
│   │   ├── ThemeToggle.vue              # 主題切換
│   │   └── StatusDisplay.vue            # 狀態顯示
│   ├── composables/
│   │   ├── useOptimizedWebGPU.ts        # 優化的 WebGPU 管理
│   │   ├── useAlgorithmEngine.ts        # 演算法引擎整合
│   │   ├── useThemeManager.ts           # 主題管理
│   │   └── usePerformanceMonitor.ts     # 效能監控
│   ├── stores/
│   │   ├── algorithm.ts                 # 演算法狀態
│   │   ├── visualization.ts             # 視覺化狀態
│   │   └── performance.ts               # 效能監控狀態
│   ├── workers/
│   │   └── algorithm-worker.ts          # WASM Worker
│   ├── shaders/
│   │   ├── algorithm-vertex.wgsl        # 頂點著色器
│   │   ├── algorithm-fragment.wgsl      # 片段著色器
│   │   └── compute-sort.wgsl            # 計算著色器
│   └── styles/
│       ├── design-tokens.scss           # 設計系統
│       └── themes.scss                  # 主題樣式
```

### 2. **效能監控儀表板**
```typescript
// PerformanceMonitor.vue
<template>
  <div class="performance-monitor" v-if="showMonitor">
    <div class="metric">
      <span>FPS:</span>
      <span :class="{ warning: fps < 50, error: fps < 30 }">
        {{ fps.toFixed(1) }}
      </span>
    </div>

    <div class="metric">
      <span>GPU 記憶體:</span>
      <span>{{ (gpuMemoryUsage / 1024 / 1024).toFixed(1) }}MB</span>
    </div>

    <div class="metric">
      <span>渲染時間:</span>
      <span>{{ renderTime.toFixed(2) }}ms</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const fps = ref(60);
const gpuMemoryUsage = ref(0);
const renderTime = ref(0);
const showMonitor = ref(process.env.NODE_ENV === 'development');

let performanceObserver: PerformanceObserver;

onMounted(() => {
  startPerformanceMonitoring();
});

const startPerformanceMonitoring = () => {
  let frameCount = 0;
  let lastTime = performance.now();

  const updateFPS = () => {
    frameCount++;
    const now = performance.now();

    if (now - lastTime >= 1000) {
      fps.value = frameCount;
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(updateFPS);
  };

  requestAnimationFrame(updateFPS);

  // 監控渲染效能
  performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'webgpu-render') {
        renderTime.value = entry.duration;
      }
    }
  });

  performanceObserver.observe({ entryTypes: ['measure'] });
};
</script>
```

### 3. **自動化測試套件**
```typescript
// tests/webgpu-algorithm.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AlgorithmVisualizer from '@/components/AlgorithmVisualizer.vue'

describe('WebGPU 演算法視覺化', () => {
  let wrapper: any;

  beforeEach(async () => {
    // 模擬 WebGPU 環境
    global.navigator.gpu = {
      requestAdapter: vi.fn().mockResolvedValue({
        requestDevice: vi.fn().mockResolvedValue({
          createShaderModule: vi.fn(),
          createRenderPipeline: vi.fn(),
          createBuffer: vi.fn()
        })
      })
    };

    wrapper = mount(AlgorithmVisualizer, {
      props: {
        algorithmType: 'bubble-sort',
        initialData: [64, 34, 25, 12, 22, 11, 90]
      }
    });
  });

  it('應該正確初始化 WebGPU 渲染器', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.webgpuRenderer).toBeDefined();
  });

  it('應該正確響應播放/暫停控制', async () => {
    const playButton = wrapper.find('.control-btn.primary');
    await playButton.trigger('click');

    expect(wrapper.vm.isPlaying).toBe(true);
  });

  it('應該正確處理主題切換', async () => {
    const themeButton = wrapper.find('.theme-toggle');
    await themeButton.trigger('click');

    expect(wrapper.vm.isDarkMode).toBe(true);
  });
});
```

## 下一步行動

### 立即執行（本週）：
1. **建立專案基礎架構**：按照 SA 規格書建立完整的 Vue 3 + TypeScript 專案結構
2. **實作 WebGPU 渲染器原型**：建立基礎的演算法視覺化渲染功能
3. **整合 WASM 模組**：建立 Rust WASM 與 Vue 的整合橋接層

### 短期規劃（2 週內）：
1. **完善 UI 控制系統**：實作基於 UX 規範的混合式控制面板
2. **建立效能監控系統**：確保渲染效能達到 60fps 目標
3. **實作響應式設計**：支援桌面、平板、手機等不同裝置

### 中期目標（1 個月內）：
1. **深色模式支援**：完整實作主題切換功能
2. **進階演算法支援**：擴展到更多排序與搜尋演算法
3. **使用者體驗優化**：基於測試回饋持續改善

## 協作提醒

### 🤝 需要其他角色協助：

**需要 SA 確認：**
- **API 介面規格**：演算法數據交換的具體格式定義
- **WebGPU 降級策略**：不支援 WebGPU 的瀏覽器替代方案
- **記憶體管理策略**：大型數據集的處理與優化方案

**需要 UX 補充：**
- **互動動畫細節**：按鈕點擊、狀態切換的具體動畫參數
- **錯誤狀態設計**：WebGPU 初始化失敗時的使用者提示設計
- **載入狀態設計**：WASM 模組載入過程的使用者體驗

**需要 BE Gary 提供：**
- **演算法數據格式**：後端 API 返回的數據結構規範
- **使用者偏好儲存**：主題選擇、控制偏好的後端儲存方案
- **效能數據收集**：前端效能指標的後端分析與儲存

### 💡 技術風險評估：

**高風險項目：**
- **WebGPU 瀏覽器相容性**：需要完善的降級機制
- **WASM 載入時間**：大型 WASM 模組可能影響首次載入體驗
- **記憶體管理**：大數據集可能造成記憶體不足

**建議優先處理：**
1. 建立 WebGPU 降級到 Canvas2D 的備案方案
2. 實作 WASM 模組的懶加載與快取機制
3. 建立記憶體使用監控與自動清理機制

**總結**：基於現有的 Vue.js + WebGPU 架構，我建議採用混合式 UI 控制系統，結合效能優化的渲染管線和完善的降級機制，確保在各種環境下都能提供優秀的使用者體驗。期待與團隊其他角色密切協作，共同打造高品質的演算法視覺化工具！
