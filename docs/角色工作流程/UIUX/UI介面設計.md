# role: UX - 效能優化的 UI 控制系統設計策略

## 核心建議

### 1. **輕量級覆蓋層控制系統**
**🎯 將控制與渲染完全分離**

```typescript
// 效能優化的控制架構
interface LightweightControlSystem {
  // 控制層：純 DOM，最小化元件
  controlLayer: {
    position: 'absolute';
    zIndex: 10;
    pointerEvents: 'auto';
    background: 'transparent';
  };
  
  // 渲染層：純 WebGPU Canvas
  renderLayer: {
    position: 'absolute';
    zIndex: 1;
    pointerEvents: 'none'; // 避免干擾渲染
  };
}
```

#### 分層設計架構
```vue
<!-- PerformanceOptimizedVisualizer.vue -->
<template>
  <div class="visualizer-container">
    <!-- 純 WebGPU 渲染層 -->
    <canvas 
      ref="webgpuCanvas"
      class="render-layer"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasInteraction"
    />
    
    <!-- 最小化控制覆蓋層 -->
    <div class="control-overlay">
      <!-- 只有核心控制按鈕 -->
      <div class="minimal-controls">
        <button @click="togglePlay" class="control-btn">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="reset" class="control-btn">↻</button>
        <input 
          type="range" 
          v-model="speed" 
          class="speed-slider"
          @input="updateSpeed"
        >
      </div>
      
      <!-- 狀態指示器（純文字，最小 DOM） -->
      <div class="status-indicator">
        <span>{{ currentOperation }}</span>
        <span>{{ currentStep }}/{{ totalSteps }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visualizer-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.render-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; /* 讓 Canvas 專注渲染 */
}

.control-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(4px);
  
  /* 最小化重繪影響 */
  will-change: transform;
  contain: layout style paint;
}

.minimal-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  
  /* 避免重排 */
  contain: layout;
}
</style>
```

### 2. **Canvas 內嵌控制系統**
**🚀 將控制元素直接渲染到 WebGPU Canvas 中**

```typescript
// WebGPU 內建 UI 系統
interface CanvasEmbeddedControls {
  // 在 WebGPU 中渲染 UI 元件
  uiElements: {
    playButton: GPUBuffer;
    progressBar: GPUBuffer;
    speedSlider: GPUBuffer;
  };
  
  // 純 GPU 計算的互動檢測
  hitTesting: {
    mousePosition: [number, number];
    clickableRegions: UIRegion[];
  };
}

// 在 WebGPU Shader 中渲染 UI
const uiVertexShader = `
@vertex
fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
}
`;

const uiFragmentShader = `
@fragment
fn fs_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    // 根據座標渲染 UI 元件
    let button_region = rect(10.0, 10.0, 50.0, 30.0);
    if (in_rect(coord.xy, button_region)) {
        return vec4<f32>(0.2, 0.4, 0.8, 0.9); // 按鈕顏色
    }
    return vec4<f32>(0.0, 0.0, 0.0, 0.0); // 透明
}
`;
```

### 3. **事件驅動的最小狀態更新**
**⚡ 只在必要時更新 DOM，避免持續重繪**

```typescript
// 高效能狀態管理
class PerformanceOptimizedControls {
  private lastUpdateTime = 0;
  private updateThrottle = 16; // 60fps 限制
  
  // 批次更新機制
  private pendingUpdates = new Set<string>();
  
  updateControl(controlId: string, value: any) {
    this.pendingUpdates.add(controlId);
    
    // 使用 requestAnimationFrame 批次更新
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => this.flushUpdates());
    }
  }
  
  private flushUpdates() {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateThrottle) {
      // 跳過這次更新，避免過度重繪
      requestAnimationFrame(() => this.flushUpdates());
      return;
    }
    
    // 批次執行所有待更新項目
    this.pendingUpdates.forEach(controlId => {
      this.executeUpdate(controlId);
    });
    
    this.pendingUpdates.clear();
    this.lastUpdateTime = now;
    this.updateScheduled = false;
  }
}
```

### 4. **外部控制面板策略**
**📱 將複雜控制移到側邊面板**

```typescript
// 分離式設計：主視覺區 + 獨立控制區
interface SeparatedControlDesign {
  // 主視覺化區域：100% WebGPU
  mainVisualization: {
    element: HTMLCanvasElement;
    controls: 'none'; // 無任何 DOM 覆蓋
    interaction: 'canvas-only'; // 僅 Canvas 事件
  };
  
  // 側邊控制面板：獨立 DOM 區域
  sidePanel: {
    position: 'fixed' | 'relative';
    updateStrategy: 'event-driven'; // 事件驅動更新
    virtualScrolling: boolean; // 大量數據虛擬化
  };
}
```

## 輸出產物

### 1. **零 DOM 干擾的視覺化組件**
```vue
<!-- PureWebGPUVisualizer.vue -->
<template>
  <div class="pure-visualizer">
    <!-- 單純的 Canvas，無任何覆蓋 -->
    <canvas 
      ref="canvas"
      @click="handleCanvasClick"
      @mousemove="handleCanvasMouseMove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWebGPU } from '@/composables/useWebGPU'

const canvas = ref<HTMLCanvasElement>()

// 所有控制邏輯都在 Canvas 事件中處理
const handleCanvasClick = (event: MouseEvent) => {
  const rect = canvas.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 直接在 WebGPU 中檢測 UI 區域點擊
  checkUIInteraction(x, y)
}

const checkUIInteraction = (x: number, y: number) => {
  // 在 GPU 端檢測是否點擊到控制按鈕
  if (isInPlayButtonRegion(x, y)) {
    togglePlayback()
  }
  // 其他 UI 互動...
}
</script>
```

### 2. **WebGPU UI 渲染管線**
```typescript
// GPU 端 UI 渲染系統
class WebGPUUIRenderer {
  private uiRenderPipeline: GPURenderPipeline;
  private uiVertexBuffer: GPUBuffer;
  
  async initializeUI(device: GPUDevice) {
    // 建立專門的 UI 渲染管線
    this.uiRenderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({ code: uiVertexShader }),
        entryPoint: 'vs_main',
        buffers: [uiVertexBufferLayout]
      },
      fragment: {
        module: device.createShaderModule({ code: uiFragmentShader }),
        entryPoint: 'fs_main',
        targets: [{ format: 'bgra8unorm' }]
      }
    });
  }
  
  renderUI(commandEncoder: GPUCommandEncoder) {
    // 在同一個 render pass 中渲染數據視覺化 + UI
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.canvasContext.getCurrentTexture().createView(),
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });
    
    // 先渲染算法視覺化
    this.renderAlgorithmVisualization(renderPass);
    
    // 再渲染 UI 覆蓋層
    renderPass.setPipeline(this.uiRenderPipeline);
    this.renderControlButtons(renderPass);
    
    renderPass.end();
  }
}
```

### 3. **事件映射系統**
```typescript
// Canvas 座標到功能的映射
interface UIRegionMap {
  playButton: { x: 10, y: 10, width: 40, height: 30 };
  speedSlider: { x: 60, y: 10, width: 100, height: 20 };
  resetButton: { x: 170, y: 10, width: 40, height: 30 };
}

class CanvasUIManager {
  private regions: UIRegionMap;
  
  handleClick(x: number, y: number) {
    // 高效率的區域檢測，避免 DOM 查詢
    for (const [action, region] of Object.entries(this.regions)) {
      if (this.isPointInRegion(x, y, region)) {
        this.executeAction(action);
        break;
      }
    }
  }
  
  private isPointInRegion(x: number, y: number, region: any): boolean {
    return x >= region.x && 
           x <= region.x + region.width &&
           y >= region.y && 
           y <= region.y + region.height;
  }
}
```

## 下一步行動

### 立即執行（本週）：
1. **選擇控制策略**：與 FE Jerry 討論哪種方案最適合當前技術架構
2. **原型驗證**：建立簡單的 Canvas 內嵌控制原型，測試效能影響
3. **基準測試**：比較 DOM 覆蓋 vs Canvas 內嵌的效能差異

### 短期規劃（2 週內）：
1. **完整實作**：根據選定方案實作完整的控制系統
2. **效能監控**：建立渲染效能監控，確保 60fps 目標
3. **使用者測試**：驗證 Canvas 控制的使用者體驗是否可接受

## 協作提醒

### 🤝 需要 FE Jerry 確認：
- **WebGPU UI 渲染複雜度**：在 GPU 中渲染 UI 元件的開發工時評估
- **Canvas 事件處理**：座標轉換和點擊檢測的精確度要求
- **記憶體使用**：UI 紋理和緩衝區對整體記憶體的影響

### 💡 推薦方案排序：
1. **首選：Canvas 內嵌控制** - 最佳效能，完全避免 DOM 重繪
2. **次選：最小化覆蓋層** - 平衡效能與開發複雜度
3. **備案：側邊面板分離** - 最安全，但犧牲一些整合體驗

### 🚨 效能考量重點：
- **避免 DOM 操作**：任何會觸發重排/重繪的操作都是效能殺手
- **GPU 記憶體管理**：UI 元素的紋理需要合理的記憶體分配
- **批次更新**：所有狀態變更都應該批次處理，避免逐一更新