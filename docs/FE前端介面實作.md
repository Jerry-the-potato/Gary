# role: FE - UI 手冊技術實作規劃

## 角色識別：AI 前端工程師 Jerry-the-potato
看完這份 UI 設計手冊，我將從前端實作的角度分析技術可行性與開發任務規劃。

## 核心建議

### 1. **技術方案選擇分析**
**✅ 推薦方案 2：Canvas 內嵌控制系統**

從實作複雜度與效能表現來看：

```typescript
// 技術可行性評估
interface TechnicalFeasibility {
  方案1_輕量級覆蓋層: {
    開發難度: 'Low',
    效能影響: 'Medium', // 仍有 DOM 重繪風險
    維護性: 'High',
    跨瀏覽器相容性: 'High'
  },
  
  方案2_Canvas內嵌控制: {
    開發難度: 'High',
    效能影響: 'Low', // 完全在 GPU 渲染
    維護性: 'Medium',
    跨瀏覽器相容性: 'Medium' // 依賴 WebGPU
  },
  
  方案3_事件驅動更新: {
    開發難度: 'Medium',
    效能影響: 'Medium',
    維護性: 'Medium',
    跨瀏覽器相容性: 'High'
  }
}
```

### 2. **Canvas 內嵌 UI 系統實作架構**
**🚀 基於 WebGPU 的完整 UI 渲染管線**

```typescript
// 實作架構設計
class WebGPUUISystem {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private uiRenderPipeline: GPURenderPipeline;
  private uiTexture: GPUTexture; // UI 元件紋理圖集
  
  // UI 元件狀態管理
  private uiElements: Map<string, UIElement> = new Map();
  private hitboxes: UIHitbox[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.initializeWebGPU(canvas);
    this.createUIAssets();
    this.setupEventHandlers(canvas);
  }
  
  // 建立 UI 紋理圖集
  private async createUIAssets() {
    // 使用 Canvas2D 預先繪製 UI 元件到紋理
    const uiCanvas = document.createElement('canvas');
    uiCanvas.width = 512;
    uiCanvas.height = 512;
    const ctx = uiCanvas.getContext('2d')!;
    
    // 繪製各種 UI 元件到不同區域
    this.drawPlayButton(ctx, 0, 0, 64, 32);
    this.drawPauseButton(ctx, 64, 0, 64, 32);
    this.drawResetButton(ctx, 128, 0, 64, 32);
    this.drawSlider(ctx, 0, 32, 256, 32);
    
    // 上傳到 GPU 紋理
    this.uiTexture = this.createTextureFromCanvas(uiCanvas);
  }
  
  // UI 元件繪製方法
  private drawPlayButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // 使用 Path2D 繪製播放按鈕
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, y, w, h);
    
    // 播放三角形
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y + h * 0.2);
    ctx.lineTo(x + w * 0.3, y + h * 0.8);
    ctx.lineTo(x + w * 0.7, y + h * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  
  // 事件處理系統
  private setupEventHandlers(canvas: HTMLCanvasElement) {
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.handleUIClick(x, y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.updateHoverState(x, y);
    });
  }
}
```

### 3. **UI 元件座標系統設計**
**📐 適應性佈局與響應式設計**

```typescript
// 響應式 UI 佈局管理
class ResponsiveUILayout {
  private canvasWidth: number;
  private canvasHeight: number;
  
  updateLayout(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    
    // 重新計算所有 UI 元件位置
    this.recalculateUIPositions();
  }
  
  private recalculateUIPositions() {
    const isMobile = this.canvasWidth < 768;
    const isTablet = this.canvasWidth >= 768 && this.canvasWidth < 1024;
    
    if (isMobile) {
      // 手機佈局：底部控制列
      this.layoutMobileControls();
    } else if (isTablet) {
      // 平板佈局：右側控制面板
      this.layoutTabletControls();
    } else {
      // 桌面佈局：頂部控制列
      this.layoutDesktopControls();
    }
  }
  
  private layoutMobileControls() {
    const controlHeight = 60;
    const y = this.canvasHeight - controlHeight - 20;
    
    // 播放/暫停按鈕居中
    const playButtonX = this.canvasWidth / 2 - 30;
    this.uiElements.set('playButton', {
      x: playButtonX,
      y: y,
      width: 60,
      height: 40,
      textureRegion: { x: 0, y: 0, width: 64, height: 32 }
    });
    
    // 重置按鈕在左側
    this.uiElements.set('resetButton', {
      x: 20,
      y: y,
      width: 50,
      height: 40,
      textureRegion: { x: 128, y: 0, width: 64, height: 32 }
    });
  }
}
```

## 輸出產物

### 1. **WebGPU UI 渲染系統**
```typescript
// 完整的 WebGPU UI 渲染管線
export class WebGPUUIRenderer {
  private shaderModule: GPUShaderModule;
  private uniformBuffer: GPUBuffer;
  private bindGroup: GPUBindGroup;
  
  async initialize(device: GPUDevice) {
    // UI 專用 Shader
    const uiShaderCode = `
      struct UIUniforms {
        screenSize: vec2<f32>,
        time: f32,
        padding: f32,
      }
      
      @group(0) @binding(0) var<uniform> uniforms: UIUniforms;
      @group(0) @binding(1) var uiTexture: texture_2d<f32>;
      @group(0) @binding(2) var uiSampler: sampler;
      
      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) uv: vec2<f32>,
        @location(1) color: vec4<f32>,
      }
      
      @vertex
      fn vs_main(
        @location(0) position: vec2<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) color: vec4<f32>
      ) -> VertexOutput {
        var output: VertexOutput;
        
        // 轉換到 NDC 座標系
        let normalizedPos = position / uniforms.screenSize * 2.0 - 1.0;
        output.position = vec4<f32>(normalizedPos.x, -normalizedPos.y, 0.0, 1.0);
        output.uv = uv;
        output.color = color;
        
        return output;
      }
      
      @fragment
      fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
        let texColor = textureSample(uiTexture, uiSampler, input.uv);
        return texColor * input.color;
      }
    `;
    
    this.shaderModule = device.createShaderModule({ code: uiShaderCode });
    
    // 建立渲染管線
    this.renderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.shaderModule,
        entryPoint: 'vs_main',
        buffers: [this.getUIVertexBufferLayout()]
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: 'fs_main',
        targets: [{ 
          format: 'bgra8unorm',
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha'
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha'
            }
          }
        }]
      }
    });
  }
}
```

### 2. **Vue Composable 整合**
```typescript
// useWebGPUUI.ts - 與 Vue 3 整合
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

export function useWebGPUUI(canvas: Ref<HTMLCanvasElement>) {
  const uiSystem = ref<WebGPUUISystem | null>(null);
  const uiState = reactive({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1.0,
    hoveredElement: null as string | null
  });
  
  const initializeUI = async () => {
    if (!canvas.value) return;
    
    uiSystem.value = new WebGPUUISystem(canvas.value);
    
    // 綁定 UI 事件到 Vue 狀態
    uiSystem.value.on('playClicked', () => {
      uiState.isPlaying = !uiState.isPlaying;
    });
    
    uiSystem.value.on('resetClicked', () => {
      uiState.currentStep = 0;
      uiState.isPlaying = false;
    });
    
    uiSystem.value.on('speedChanged', (newSpeed: number) => {
      uiState.speed = newSpeed;
    });
  };
  
  const updateUIState = (newState: Partial<typeof uiState>) => {
    Object.assign(uiState, newState);
    uiSystem.value?.updateState(uiState);
  };
  
  onMounted(initializeUI);
  onBeforeUnmount(() => {
    uiSystem.value?.destroy();
  });
  
  return {
    uiState: readonly(uiState),
    updateUIState,
    isUIReady: computed(() => uiSystem.value !== null)
  };
}
```

### 3. **效能監控與優化**
```typescript
// 效能監控系統
class UIPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  
  private uiRenderTime = 0;
  private algorithmRenderTime = 0;
  
  measureFrame(callback: () => void) {
    const startTime = performance.now();
    
    callback();
    
    const endTime = performance.now();
    this.updateMetrics(endTime - startTime);
  }
  
  private updateMetrics(frameTime: number) {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
      
      // 效能警告
      if (this.fps < 50) {
        console.warn('UI rendering performance below 50fps');
        this.optimizeRenderingStrategy();
      }
    }
  }
  
  private optimizeRenderingStrategy() {
    // 動態降級策略
    if (this.fps < 30) {
      // 降級到方案 1：DOM 覆蓋層
      this.fallbackToDOMOverlay();
    }
  }
}
```

## 下一步行動

### 立即執行（本週）：
1. **技術原型開發**：建立 WebGPU UI 渲染的基礎原型
2. **效能基準測試**：測試不同裝置上的渲染效能
3. **事件系統設計**：完成 Canvas 座標到 UI 元件的映射邏輯

### 短期規劃（2 週內）：
1. **完整 UI 系統實作**：包含所有控制元件與響應式佈局
2. **Vue 3 整合測試**：確保與現有 Composition API 無縫整合
3. **跨瀏覽器測試**：驗證 WebGPU 支援度與降級機制

## 欠缺的關鍵資訊

### 🚨 需要 UX 補充的設計細節：

1. **UI 元件視覺規格**
   - 按鈕的具體尺寸（px）
   - 色彩值（Hex/RGB）
   - 字體大小與字重
   - 圓角半徑、陰影效果

2. **互動狀態設計**
   - Hover 狀態的視覺變化
   - Active 狀態的回饋效果
   - Disabled 狀態的樣式
   - Loading 狀態的動畫

3. **響應式斷點**
   - 具體的螢幕尺寸斷點
   - 各斷點下的元件大小變化
   - 觸控設備的最小觸控目標尺寸

4. **動畫規格**
   - 按鈕點擊的動畫時間
   - 狀態切換的過渡效果
   - 進度條的更新動畫

### 🤝 SA 額外提供的技術規格：


#### **核心建議**

##### **1. 分層渲染架構**
- WebGPU 負責高效能的圖形渲染（柱狀圖、動畫）
- Canvas 2D 覆蓋層處理文字與 UI 元素
- Vue 元件層處理業務邏輯與狀態管理

##### **2. 記憶體優化策略**
- 實作紋理池化管理，避免重複分配
- 根據資料集大小動態調整紋理解析度
- 設定記憶體使用上限並實作清理機制

##### **3. 事件處理優化**
- 高頻事件採用節流機制（60fps）
- 事件處理與渲染迴圈同步
- 建立座標轉換系統，精確定位使用者互動

#### **1. WebGPU Shader 複雜度架構設計**

#### **混合模式策略**
```glsl
// 演算法視覺化專用的混合著色器
// fragment_shader.wgsl
@group(0) @binding(0) var<uniform> uTime: f32;
@group(0) @binding(1) var<uniform> uElementStates: array<u32, 1000>;

@fragment
fn main(@location(0) position: vec2<f32>, 
        @location(1) elementIndex: u32) -> @location(0) vec4<f32> {
    
    let state = uElementStates[elementIndex];
    var baseColor = vec4<f32>(0.6, 0.6, 0.6, 1.0); // 預設灰色
    
    // 狀態驅動的顏色混合
    switch (state) {
        case 0u: { // 正常狀態
            baseColor = vec4<f32>(0.3, 0.6, 0.9, 1.0);
        }
        case 1u: { // 比較中
            // 脈衝效果
            let pulse = sin(uTime * 10.0) * 0.3 + 0.7;
            baseColor = vec4<f32>(1.0, 0.8, 0.0, pulse);
        }
        case 2u: { // 交換中
            baseColor = vec4<f32>(1.0, 0.2, 0.2, 1.0);
        }
        case 3u: { // 已排序
            baseColor = vec4<f32>(0.2, 0.8, 0.2, 1.0);
        }
        default: {
            baseColor = vec4<f32>(0.5, 0.5, 0.5, 1.0);
        }
    }
    
    // UI 元素需要 Alpha 混合
    return baseColor;
}
```

#### **紋理記憶體管理策略**
```typescript
class WebGPUMemoryManager {
    private device: GPUDevice;
    private texturePool: Map<string, GPUTexture[]> = new Map();
    private maxTextureMemory = 512 * 1024 * 1024; // 512MB 限制
    private currentMemoryUsage = 0;
    
    // 紋理池化管理
    getTexture(width: number, height: number, format: GPUTextureFormat): GPUTexture {
        const key = `${width}x${height}_${format}`;
        const pool = this.texturePool.get(key) || [];
        
        if (pool.length > 0) {
            return pool.pop()!;
        }
        
        // 檢查記憶體限制
        const textureSize = this.calculateTextureSize(width, height, format);
        if (this.currentMemoryUsage + textureSize > this.maxTextureMemory) {
            this.cleanupOldTextures();
        }
        
        const texture = this.device.createTexture({
            size: { width, height },
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        
        this.currentMemoryUsage += textureSize;
        return texture;
    }
    
    // 演算法視覺化的最佳紋理配置
    getOptimalTextureConfig(elementCount: number): TextureConfig {
        if (elementCount <= 100) {
            return { width: 1024, height: 512, format: 'rgba8unorm' as GPUTextureFormat };
        } else if (elementCount <= 1000) {
            return { width: 2048, height: 1024, format: 'rgba8unorm' as GPUTextureFormat };
        } else {
            // 大型資料集使用壓縮格式
            return { width: 4096, height: 2048, format: 'rgba8unorm' as GPUTextureFormat };
        }
    }
}
```

#### **文字渲染整合方案**
```typescript
class HybridTextRenderer {
    private webgpuCanvas: HTMLCanvasElement;
    private textCanvas: HTMLCanvasElement;
    private textContext: CanvasRenderingContext2D;
    
    constructor(webgpuCanvas: HTMLCanvasElement) {
        this.webgpuCanvas = webgpuCanvas;
        
        // 建立 2D Canvas 覆蓋層用於文字
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.style.position = 'absolute';
        this.textCanvas.style.pointerEvents = 'none';
        this.textCanvas.style.zIndex = '10';
        
        this.textContext = this.textCanvas.getContext('2d')!;
        
        // 插入到相同的容器
        webgpuCanvas.parentElement?.appendChild(this.textCanvas);
    }
    
    // 渲染演算法狀態文字
    renderAlgorithmText(text: string, x: number, y: number, style: TextStyle) {
        this.textContext.save();
        this.textContext.font = `${style.size}px ${style.fontFamily}`;
        this.textContext.fillStyle = style.color;
        this.textContext.textAlign = style.align;
        
        // 背景框
        if (style.background) {
            const metrics = this.textContext.measureText(text);
            this.textContext.fillStyle = style.background;
            this.textContext.fillRect(
                x - metrics.width / 2 - 5, 
                y - style.size - 5, 
                metrics.width + 10, 
                style.size + 10
            );
        }
        
        this.textContext.fillStyle = style.color;
        this.textContext.fillText(text, x, y);
        this.textContext.restore();
    }
    
    // 清除文字層
    clearText() {
        this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    }
}
```

#### **2. 事件處理機制架構**

#### **Canvas 與 Vue 事件整合**
```vue
<!-- AlgorithmCanvas.vue -->
<template>
  <div class="canvas-container" ref="containerRef">
    <canvas 
      ref="webgpuCanvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @click="handleClick"
    />
    <canvas 
      ref="textCanvasRef"
      class="text-overlay"
      :width="canvasWidth"
      :height="canvasHeight"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useEventManager } from '@/composables/useEventManager'

// Props
interface Props {
  algorithmData: number[]
  currentStep: number
}

const props = defineProps<Props>()

// Refs
const containerRef = ref<HTMLDivElement>()
const webgpuCanvasRef = ref<HTMLCanvasElement>()
const textCanvasRef = ref<HTMLCanvasElement>()

// Event Manager
const {
  registerEventHandlers,
  handleCanvasEvent,
  optimizeHighFrequencyEvents
} = useEventManager()

// 滑鼠事件處理
const handleMouseMove = (event: MouseEvent) => {
  // 高頻事件優化處理
  optimizeHighFrequencyEvents('mousemove', event, (optimizedEvent) => {
    const canvasRect = webgpuCanvasRef.value!.getBoundingClientRect()
    const x = optimizedEvent.clientX - canvasRect.left
    const y = optimizedEvent.clientY - canvasRect.top
    
    // 計算滑鼠懸停的元素索引
    const elementIndex = calculateElementIndex(x, y)
    if (elementIndex !== -1) {
      // 觸發 Vue 事件
      emit('elementHover', elementIndex, props.algorithmData[elementIndex])
    }
  })
}

const handleClick = (event: MouseEvent) => {
  const canvasRect = webgpuCanvasRef.value!.getBoundingClientRect()
  const x = event.clientX - canvasRect.left
  const y = event.clientY - canvasRect.top
  
  const elementIndex = calculateElementIndex(x, y)
  if (elementIndex !== -1) {
    // 觸發元素點擊事件
    emit('elementClick', elementIndex)
  }
}

// Emits
const emit = defineEmits<{
  elementHover: [index: number, value: number]
  elementClick: [index: number]
  canvasResize: [width: number, height: number]
}>()
</script>
```

### **高頻事件優化策略**
```typescript
// composables/useEventManager.ts
import { ref } from 'vue'

export function useEventManager() {
  const eventQueue = ref<Map<string, any>>(new Map())
  const lastEventTime = ref<Map<string, number>>(new Map())
  const throttleDelay = 16 // 60fps = 16ms
  
  // 高頻事件節流處理
  const optimizeHighFrequencyEvents = (
    eventType: string,
    event: Event,
    callback: (event: Event) => void
  ) => {
    const now = performance.now()
    const lastTime = lastEventTime.value.get(eventType) || 0
    
    if (now - lastTime >= throttleDelay) {
      callback(event)
      lastEventTime.value.set(eventType, now)
    } else {
      // 暫存最新事件，等待下次處理
      eventQueue.value.set(eventType, event)
    }
  }
  
  // 批次處理暫存事件
  const processPendingEvents = () => {
    eventQueue.value.forEach((event, eventType) => {
      const callback = eventCallbacks.get(eventType)
      if (callback) {
        callback(event)
        lastEventTime.value.set(eventType, performance.now())
      }
    })
    eventQueue.value.clear()
  }
  
  // 事件與 WebGPU 渲染同步
  const syncWithRenderLoop = (renderCallback: () => void) => {
    const render = () => {
      processPendingEvents() // 處理暫存事件
      renderCallback()       // 執行 WebGPU 渲染
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
  }
  
  return {
    optimizeHighFrequencyEvents,
    syncWithRenderLoop,
    processPendingEvents
  }
}
```

#### **事件座標轉換系統**
```typescript
class CanvasCoordinateSystem {
  constructor(
    private canvas: HTMLCanvasElement,
    private algorithmData: number[]
  ) {}
  
  // 螢幕座標轉換為元素索引
  screenToElementIndex(screenX: number, screenY: number): number {
    const canvasRect = this.canvas.getBoundingClientRect()
    const canvasX = screenX - canvasRect.left
    const canvasY = screenY - canvasRect.top
    
    // 轉換為標準化座標 (0-1)
    const normalizedX = canvasX / this.canvas.width
    const normalizedY = canvasY / this.canvas.height
    
    // 計算元素索引
    const elementWidth = 1.0 / this.algorithmData.length
    const elementIndex = Math.floor(normalizedX / elementWidth)
    
    // 檢查 Y 座標是否在柱狀圖範圍內
    const elementValue = this.algorithmData[elementIndex]
    const maxValue = Math.max(...this.algorithmData)
    const elementHeight = elementValue / maxValue
    
    if (normalizedY > (1.0 - elementHeight)) {
      return elementIndex
    }
    
    return -1 // 未點擊到任何元素
  }
  
  // 元素索引轉換為螢幕座標
  elementIndexToScreen(index: number): { x: number, y: number } {
    const elementWidth = this.canvas.width / this.algorithmData.length
    const elementValue = this.algorithmData[index]
    const maxValue = Math.max(...this.algorithmData)
    
    const x = (index + 0.5) * elementWidth
    const y = this.canvas.height * (1.0 - elementValue / maxValue)
    
    return { x, y }
  }
}
```

### 💡 建議優先級：

**P0（必須）：** 基礎 Canvas UI 渲染 + 核心控制功能
**P1（重要）：** 響應式佈局 + 觸控支援
**P2（加分）：** 動畫效果 + 效能監控

**總結**：Canvas 內嵌 UI 系統技術可行，但需要 UX 提供更詳細的視覺規格，以及與 SA 確認一些技術細節。建議先實作基礎版本，再逐步添加進階功能。