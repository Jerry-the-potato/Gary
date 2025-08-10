# role: UX - 效能優化 UI 控制系統的深色模式設計策略

**角色識別：** AI 使用者體驗設計師 - 專注於深色模式的介面設計與使用者體驗優化

## 核心建議

### 1. **適應性色彩系統設計**
**🌙 建立完整的深色模式色彩變數系統**

```scss
// 色彩系統變數定義
:root {
  // 淺色模式 (預設)
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-overlay: rgba(255, 255, 255, 0.95);
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent-primary: #3b82f6;
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  
  // Canvas 相關色彩
  --canvas-bg: #ffffff;
  --ui-button-bg: rgba(59, 130, 246, 0.9);
  --ui-button-text: #ffffff;
  --status-text: #374151;
}

// 深色模式色彩
[data-theme="dark"], 
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-overlay: rgba(15, 23, 42, 0.95);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent-primary: #60a5fa;
    --border-color: #334155;
    --shadow-color: rgba(0, 0, 0, 0.3);
    
    // Canvas 深色模式適配
    --canvas-bg: #020617;
    --ui-button-bg: rgba(96, 165, 250, 0.9);
    --ui-button-text: #0f172a;
    --status-text: #e2e8f0;
  }
}
```

### 2. **Canvas 內嵌 UI 的深色模式渲染**
**🎨 在 WebGPU Shader 中實作深色模式支援**

```typescript
// WebGPU 深色模式 UI 渲染
interface DarkModeUIRenderer {
  themeUniforms: {
    isDarkMode: boolean;
    backgroundColors: [number, number, number, number];
    buttonColors: [number, number, number, number];
    textColors: [number, number, number, number];
  };
}

// 深色模式感知的 Fragment Shader
const adaptiveUIFragmentShader = `
struct ThemeUniforms {
    is_dark_mode: f32,
    bg_color: vec4<f32>,
    button_color: vec4<f32>,
    text_color: vec4<f32>,
    accent_color: vec4<f32>
}

@group(0) @binding(0) var<uniform> theme: ThemeUniforms;

@fragment
fn fs_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    let pos = coord.xy;
    
    // 動態按鈕區域檢測
    let play_button = rect(10.0, 10.0, 40.0, 30.0);
    let reset_button = rect(60.0, 10.0, 40.0, 30.0);
    
    // 根據主題模式選擇顏色
    if (in_rect(pos, play_button)) {
        // 深色模式下使用不同的按鈕顏色
        return mix(
            vec4<f32>(0.23, 0.51, 0.96, 0.9), // 淺色模式按鈕
            vec4<f32>(0.37, 0.65, 0.98, 0.9), // 深色模式按鈕
            theme.is_dark_mode
        );
    }
    
    if (in_rect(pos, reset_button)) {
        return mix(
            vec4<f32>(0.6, 0.6, 0.6, 0.9),   // 淺色模式
            vec4<f32>(0.4, 0.4, 0.4, 0.9),   // 深色模式
            theme.is_dark_mode
        );
    }
    
    return vec4<f32>(0.0, 0.0, 0.0, 0.0); // 透明背景
}
`;
```

### 3. **DOM 覆蓋層的深色模式適配**
**🔄 響應式深色模式切換機制**

```vue
<!-- DarkModeAwareControls.vue -->
<template>
  <div class="visualizer-container" :data-theme="currentTheme">
    <!-- WebGPU Canvas -->
    <canvas 
      ref="webgpuCanvas"
      class="render-layer"
      :style="{ backgroundColor: canvasBackgroundColor }"
    />
    
    <!-- 深色模式適配的控制覆蓋層 -->
    <div class="control-overlay">
      <div class="theme-toggle">
        <button @click="toggleTheme" class="theme-btn">
          {{ isDarkMode ? '☀' : '🌙' }}
        </button>
      </div>
      
      <div class="minimal-controls">
        <button @click="togglePlay" class="control-btn play-btn">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="reset" class="control-btn reset-btn">↻</button>
        <input 
          type="range" 
          v-model="speed" 
          class="speed-slider"
          @input="updateSpeed"
        >
      </div>
      
      <div class="status-indicator">
        <span class="status-text">{{ currentOperation }}</span>
        <span class="progress-text">{{ currentStep }}/{{ totalSteps }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const currentTheme = ref<'light' | 'dark'>('light')
const isDarkMode = computed(() => currentTheme.value === 'dark')

// Canvas 背景色適配
const canvasBackgroundColor = computed(() => {
  return isDarkMode.value ? '#020617' : '#ffffff'
})

// 主題切換邏輯
const toggleTheme = () => {
  currentTheme.value = isDarkMode.value ? 'light' : 'dark'
  
  // 同步到 WebGPU 渲染器
  updateWebGPUTheme(isDarkMode.value)
  
  // 儲存使用者偏好
  localStorage.setItem('preferred-theme', currentTheme.value)
}

// 自動檢測系統主題偏好
onMounted(() => {
  const savedTheme = localStorage.getItem('preferred-theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  currentTheme.value = savedTheme as 'light' | 'dark' || 
                      (systemPrefersDark ? 'dark' : 'light')
  
  // 監聽系統主題變更
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!savedTheme) {
      currentTheme.value = e.matches ? 'dark' : 'light'
    }
  })
})

// 同步主題到 WebGPU
const updateWebGPUTheme = (darkMode: boolean) => {
  // 更新 WebGPU uniform 緩衝區
  const themeData = new Float32Array([
    darkMode ? 1.0 : 0.0, // is_dark_mode
    ...(darkMode ? [0.008, 0.024, 0.094, 1.0] : [1.0, 1.0, 1.0, 1.0]), // bg_color
    ...(darkMode ? [0.376, 0.647, 0.984, 0.9] : [0.235, 0.510, 0.961, 0.9]), // button_color
    ...(darkMode ? [0.945, 0.961, 0.976, 1.0] : [0.118, 0.161, 0.233, 1.0])  // text_color
  ])
  
  // 寫入 GPU 緩衝區
  webgpuRenderer.updateThemeUniforms(themeData)
}
</script>

<style scoped>
.visualizer-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.control-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px var(--shadow-color);
  
  transition: all 0.3s ease;
  will-change: transform;
  contain: layout style paint;
}

.theme-toggle {
  margin-bottom: 12px;
  text-align: center;
}

.theme-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--accent-primary);
  color: var(--ui-button-text);
  cursor: pointer;
  font-size: 16px;
  
  transition: all 0.2s ease;
  contain: layout;
}

.theme-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--accent-primary);
  color: var(--ui-button-text);
  cursor: pointer;
  
  transition: all 0.2s ease;
  contain: layout;
}

.speed-slider {
  width: 80px;
  accent-color: var(--accent-primary);
}

.status-indicator {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-text,
.progress-text {
  display: block;
  margin: 2px 0;
  color: var(--text-secondary);
}

/* 深色模式下的特殊樣式調整 */
[data-theme="dark"] .control-overlay {
  backdrop-filter: blur(12px) saturate(1.2);
}

[data-theme="dark"] .speed-slider::-webkit-slider-track {
  background: var(--border-color);
}

[data-theme="dark"] .speed-slider::-webkit-slider-thumb {
  background: var(--accent-primary);
  border: 2px solid var(--bg-primary);
}
</style>
```

### 4. **演算法視覺化的深色模式配色**
**🎯 確保演算法元素在深色背景下清晰可見**

```typescript
// 演算法視覺化的深色模式配色方案
interface AlgorithmColorScheme {
  light: {
    arrayElements: '#3b82f6';      // 藍色
    compareElements: '#ef4444';     // 紅色
    sortedElements: '#10b981';      // 綠色
    pivotElement: '#f59e0b';        // 橘色
    background: '#ffffff';
    gridLines: '#e5e7eb';
    text: '#374151';
  };
  
  dark: {
    arrayElements: '#60a5fa';       // 淺藍色
    compareElements: '#f87171';     // 淺紅色
    sortedElements: '#34d399';      // 淺綠色
    pivotElement: '#fbbf24';        // 淺橘色
    background: '#020617';
    gridLines: '#374151';
    text: '#e5e7eb';
  };
}

// WebGPU 中的配色系統
const algorithmVisualizationShader = `
struct ColorScheme {
    array_color: vec4<f32>,
    compare_color: vec4<f32>,
    sorted_color: vec4<f32>,
    pivot_color: vec4<f32>,
    bg_color: vec4<f32>,
    text_color: vec4<f32>
}

@group(0) @binding(1) var<uniform> colors: ColorScheme;

@fragment
fn fs_algorithm(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    // 根據元素狀態選擇對應顏色
    let element_state = getElementState(coord.xy);
    
    switch (element_state) {
        case COMPARING: {
            return colors.compare_color;
        }
        case SORTED: {
            return colors.sorted_color;
        }
        case PIVOT: {
            return colors.pivot_color;
        }
        default: {
            return colors.array_color;
        }
    }
}
`;
```

### 5. **無障礙設計考量**
**♿ 確保深色模式下的可讀性與對比度**

```scss
// 高對比度設計
@media (prefers-contrast: high) {
  :root {
    --accent-primary: #0066cc;     // 更高對比的藍色
    --text-primary: #000000;       // 純黑文字
    --border-color: #333333;       // 更明顯的邊框
  }
  
  [data-theme="dark"] {
    --accent-primary: #4da6ff;     // 深色模式高對比藍
    --text-primary: #ffffff;       // 純白文字
    --border-color: #cccccc;       // 明亮邊框
  }
}

// 減少動態效果 (適用於前庭障礙使用者)
@media (prefers-reduced-motion: reduce) {
  .control-overlay,
  .theme-btn,
  .control-btn {
    transition: none;
  }
  
  .theme-btn:hover {
    transform: none;
  }
}
```

## 輸出產物

### 1. **完整的深色模式主題系統**
```typescript
// ThemeManager.ts - 主題管理系統
export class ThemeManager {
  private currentTheme: 'light' | 'dark' = 'light';
  private webgpuRenderer: WebGPURenderer;
  private callbacks: Array<(theme: string) => void> = [];
  
  constructor(renderer: WebGPURenderer) {
    this.webgpuRenderer = renderer;
    this.initializeTheme();
  }
  
  private initializeTheme() {
    // 檢查用戶偏好
    const saved = localStorage.getItem('theme-preference');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = (saved as any) || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme();
    
    // 監聽系統主題變更
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', this.handleSystemThemeChange.bind(this));
  }
  
  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    localStorage.setItem('theme-preference', theme);
    this.applyTheme();
  }
  
  private applyTheme() {
    // 更新 DOM
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // 更新 WebGPU 渲染器
    this.webgpuRenderer.updateTheme(this.getThemeColors());
    
    // 執行回調
    this.callbacks.forEach(callback => callback(this.currentTheme));
  }
  
  private getThemeColors() {
    const isDark = this.currentTheme === 'dark';
    return {
      background: isDark ? [0.008, 0.024, 0.094, 1.0] : [1.0, 1.0, 1.0, 1.0],
      primary: isDark ? [0.376, 0.647, 0.984, 1.0] : [0.235, 0.510, 0.961, 1.0],
      text: isDark ? [0.945, 0.961, 0.976, 1.0] : [0.118, 0.161, 0.233, 1.0],
      // 演算法視覺化色彩
      algorithmColors: {
        array: isDark ? [0.376, 0.647, 0.984, 1.0] : [0.235, 0.510, 0.961, 1.0],
        compare: isDark ? [0.973, 0.444, 0.444, 1.0] : [0.937, 0.267, 0.267, 1.0],
        sorted: isDark ? [0.204, 0.827, 0.600, 1.0] : [0.063, 0.725, 0.506, 1.0],
        pivot: isDark ? [0.984, 0.749, 0.141, 1.0] : [0.964, 0.616, 0.043, 1.0]
      }
    };
  }
}
```

### 2. **深色模式設計系統文件**
````markdown name=dark-mode-design-system.md
# 深色模式設計系統規範

## 色彩變數系統

### 主要色彩
- **背景色**
  - 淺色：`#ffffff` / 深色：`#0f172a`
  - 次要背景：`#f8fafc` / `#1e293b`

### 強調色
- **主要強調色**
  - 淺色：`#3b82f6` / 深色：`#60a5fa`
  - 確保 WCAG AA 等級對比度 (4.5:1)

### 演算法視覺化配色
- **陣列元素**：藍色系 `#3b82f6` / `#60a5fa`
- **比較中元素**：紅色系 `#ef4444` / `#f87171`
- **已排序元素**：綠色系 `#10b981` / `#34d399`
- **基準元素**：橘色系 `#f59e0b` / `#fbbf24`

## 設計原則

### 1. 自動適應
- 偵測系統主題偏好
- 記住使用者選擇
- 平滑過渡效果

### 2. 可讀性優先
- 確保對比度符合無障礙標準
- 支援高對比模式
- 考慮色彩視覺障礙使用者

### 3. 效能考量
- CSS 變數系統減少重複計算
- GPU 端主題切換避免重新編譯
- 批次更新減少重繪
````

### 3. **WebGPU 主題適配組件**
```typescript
// WebGPUThemeAdapter.ts
export class WebGPUThemeAdapter {
  private device: GPUDevice;
  private themeUniformBuffer: GPUBuffer;
  private currentThemeData: Float32Array;
  
  constructor(device: GPUDevice) {
    this.device = device;
    this.initializeThemeBuffer();
  }
  
  private initializeThemeBuffer() {
    // 建立主題 uniform 緩衝區
    this.themeUniformBuffer = this.device.createBuffer({
      size: 64, // 16個float (4個vec4)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    this.currentThemeData = new Float32Array(16);
  }
  
  updateTheme(themeColors: any) {
    // 更新主題數據
    this.currentThemeData.set([
      // is_dark_mode (float)
      themeColors.isDark ? 1.0 : 0.0, 0, 0, 0,
      // background_color (vec4)
      ...themeColors.background,
      // primary_color (vec4)  
      ...themeColors.primary,
      // text_color (vec4)
      ...themeColors.text
    ]);
    
    // 寫入 GPU 緩衝區
    this.device.queue.writeBuffer(
      this.themeUniformBuffer,
      0,
      this.currentThemeData
    );
  }
  
  getBindGroupEntry(): GPUBindGroupEntry {
    return {
      binding: 0,
      resource: {
        buffer: this.themeUniformBuffer
      }
    };
  }
}
```

## 下一步行動

### 立即執行（本週）：
1. **實作色彩變數系統**：建立完整的 CSS 變數體系，確保所有組件都能響應主題變更
2. **WebGPU 主題支援**：在現有的 WebGPU 渲染管線中加入主題 uniform 緩衝區
3. **對比度測試**：使用工具驗證所有色彩組合都符合 WCAG AA 標準

### 短期規劃（2 週內）：
1. **主題切換動畫**：實作平滑的主題過渡效果，避免突兀的色彩跳躍
2. **使用者偏好記憶**：建立本地儲存系統，記住使用者的主題選擇
3. **無障礙測試**：進行螢幕閱讀器與高對比模式的相容性測試

### 中期目標（1 個月內）：
1. **自動化主題測試**：建立自動化測試確保新功能不會破壞深色模式
2. **效能優化**：確保主題切換不會影響演算法視覺化的 60fps 目標
3. **使用者回饋收集**：收集深色模式使用體驗回饋並持續改善

## 協作提醒

### 🤝 需要 FE Jerry 確認：
- **WebGPU Uniform 整合**：主題資料如何整合到現有的渲染管線中
- **CSS 變數覆蓋範圍**：確認所有 UI 組件都使用 CSS 變數而非硬編碼顏色
- **效能影響評估**：主題切換對整體渲染效能的影響程度

### 💡 推薦實作順序：
1. **首先：CSS 變數系統** - 建立基礎的主題切換能力
2. **其次：WebGPU 主題適配** - 讓 Canvas 內容也能響應主題
3. **最後：進階功能** - 自動偵測、動畫效果、無障礙優化

### 🚨 關鍵注意事項：
- **對比度標準**：所有文字與背景組合必須達到 4.5:1 對比度
- **系統整合**：確保與作業系統主題偏好設定同步
- **記憶體管理**：主題切換不應造成記憶體洩漏或額外的 GPU 記憶體佔用

這個深色模式設計策略確保了演算法視覺化工具在任何光線環境下都能提供優秀的使用體驗，同時維持高效能的 WebGPU 渲染效果。# role: UX - 深色模式支援問題已識別並建立 Issue

## 核心建議

### 1. **漸進式深色模式實作策略**
根據您的 UI 介面設計文件，我建議採用漸進式方法：
- **第一階段**：實作 DOM 控制元件的深色模式
- **第二階段**：擴展到 WebGPU Canvas 內嵌 UI
- **第三階段**：優化演算法視覺化元素的深色適配

### 2. **效能考量的主題系統**
確保深色模式切換不會影響您已優化的 60fps 渲染目標：
- 使用 CSS 變數而非 JavaScript 動態樣式更新
- 在 WebGPU Shader 中使用 uniform 緩衝區傳遞主題資料
- 避免主題切換時重新編譯渲染管線

### 3. **無障礙優先設計**
特別針對演算法視覺化的需求：
- 提供高對比模式選項
- 確保色彩編碼的演算法步驟在深色模式下清晰可辨
- 支援動畫減少偏好設定