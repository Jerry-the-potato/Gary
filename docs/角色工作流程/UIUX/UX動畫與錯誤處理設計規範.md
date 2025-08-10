# role: UX - 互動動畫與錯誤處理的完整設計規範

## 核心建議

### 1. **按鈕點擊動畫詳細參數**
**🎯 微交互設計的精確規範**

```typescript
// 按鈴互動動畫完整規範
interface ButtonAnimationSpecs {
  // 點擊回饋動畫
  tapFeedback: {
    // 縮放動畫
    scale: {
      from: 1.0,
      to: 0.95,
      duration: 100, // ms
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)', // ease-out
      return: {
        duration: 150,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // ease-out-back
      }
    },

    // 波紋擴散效果
    ripple: {
      initialRadius: 0,
      finalRadius: 48, // 按鈕最大尺寸
      duration: 300,
      opacity: {
        from: 0.3,
        to: 0,
        timing: 'ease-out'
      },
      color: 'rgba(255, 255, 255, 0.3)',
      blendMode: 'overlay'
    },

    // 顏色變化
    colorTransition: {
      duration: 120,
      easing: 'ease-out',
      states: {
        default: '#3B82F6',
        pressed: '#1D4ED8',
        success: '#10B981' // 操作成功後的短暫顏色
      }
    }
  },

  // 懸停動畫
  hoverAnimation: {
    scale: {
      from: 1.0,
      to: 1.02,
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },

    elevation: {
      shadowFrom: '0 2px 8px rgba(0, 0, 0, 0.15)',
      shadowTo: '0 4px 12px rgba(0, 0, 0, 0.2)',
      duration: 200,
      easing: 'ease-out'
    },

    glow: {
      from: '0 0 0 rgba(59, 130, 246, 0)',
      to: '0 0 16px rgba(59, 130, 246, 0.3)',
      duration: 250,
      easing: 'ease-out'
    }
  }
}
```

### 2. **狀態切換動畫規範**
**⚡ 播放/暫停狀態的流暢轉場**

```typescript
// 狀態切換動畫設計
interface StateTransitionAnimations {
  // 播放 ↔ 暫停按鈕
  playPauseToggle: {
    // 圖示變形動畫
    iconMorph: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

      // 播放三角形 → 暫停方塊
      playToPause: {
        pathTransition: {
          from: 'M8 5v14l11-7z', // 播放三角形 SVG path
          to: 'M6 4h4v16H6zM14 4h4v16h-4z', // 暫停方塊 SVG path
          morphSteps: 20, // 過渡步驟數
          timing: 'ease-in-out'
        }
      },

      // 旋轉動畫加強視覺效果
      rotation: {
        from: 0,
        to: 180,
        duration: 250,
        easing: 'ease-in-out'
      }
    },

    // 背景顏色切換
    backgroundTransition: {
      duration: 200,
      colors: {
        play: '#3B82F6',    // 藍色 - 播放
        pause: '#F59E0B',   // 橙色 - 暫停
        processing: '#8B5CF6' // 紫色 - 處理中
      }
    }
  },

  // 重置按鈕動畫
  resetAnimation: {
    // 旋轉重置圖示
    iconRotation: {
      from: 0,
      to: 360,
      duration: 500,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
      trigger: 'onClick'
    },

    // 確認動畫（防止誤觸）
    confirmationPulse: {
      scale: [1, 1.1, 1],
      duration: 600,
      repeat: 2,
      color: '#EF4444', // 紅色警示
      delay: 200 // 點擊後延遲
    }
  },

  // 進度條更新動畫
  progressUpdate: {
    // 數值變化動畫
    valueAnimation: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      interpolation: 'linear'
    },

    // 進度條填充動畫
    fillAnimation: {
      duration: 250,
      easing: 'ease-out',

      // 完成時的慶祝動畫
      completionCelebration: {
        scale: [1, 1.05, 1],
        glow: '0 0 20px rgba(16, 185, 129, 0.6)',
        duration: 800,
        color: '#10B981'
      }
    }
  }
}
```

### 3. **錯誤狀態設計系統**
**🚨 WebGPU 初始化失敗的優雅降級**

```typescript
// 錯誤狀態設計規範
interface ErrorStateDesign {
  // WebGPU 初始化失敗
  webgpuInitError: {
    // 視覺設計
    visual: {
      backgroundColor: '#FEF2F2', // 淺紅色背景
      borderColor: '#FECACA',
      iconColor: '#EF4444',
      textColor: '#7F1D1D'
    },

    // 錯誤訊息階層
    messaging: {
      title: 'WebGPU 初始化失敗',
      description: '您的瀏覽器可能不支援 WebGPU，我們將使用備用渲染模式',
      technicalDetails: '錯誤代碼: WEBGPU_NOT_SUPPORTED',

      // 解決方案建議
      solutions: [
        '使用 Chrome 113+ 或 Edge 113+ 瀏覽器',
        '確保 GPU 驅動程式為最新版本',
        '在瀏覽器設定中啟用硬體加速',
        '繼續使用 Canvas 2D 模式（效能較低）'
      ]
    },

    // 互動元素
    actions: {
      primary: {
        text: '使用備用模式',
        style: 'filled',
        color: '#DC2626',
        action: 'fallbackToCanvas2D'
      },

      secondary: {
        text: '重新嘗試',
        style: 'outlined',
        color: '#DC2626',
        action: 'retryWebGPUInit'
      },

      tertiary: {
        text: '技術說明',
        style: 'text',
        color: '#7F1D1D',
        action: 'showTechnicalDetails'
      }
    }
  },

  // WASM 載入失敗
  wasmLoadError: {
    visual: {
      backgroundColor: '#FFFBEB',
      borderColor: '#FED7AA',
      iconColor: '#F59E0B',
      textColor: '#92400E'
    },

    messaging: {
      title: 'WebAssembly 模組載入失敗',
      description: '演算法引擎無法載入，將使用 JavaScript 版本',
      impact: '部分功能可能執行較慢'
    },

    actions: {
      primary: {
        text: '繼續使用',
        action: 'fallbackToJavaScript'
      },

      secondary: {
        text: '重新載入',
        action: 'retryWasmLoad'
      }
    }
  }
}

// 錯誤狀態元件設計
interface ErrorComponentLayout {
  container: {
    maxWidth: 480,
    padding: 24,
    borderRadius: 12,
    position: 'center', // Canvas 中央
    backdrop: 'blur(8px)',
    animation: {
      entrance: {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        easing: 'ease-out'
      }
    }
  },

  icon: {
    size: 48,
    marginBottom: 16,
    animation: {
      attention: {
        scale: [1, 1.1, 1],
        duration: 1000,
        repeat: 'infinite',
        easing: 'ease-in-out'
      }
    }
  },

  content: {
    textAlign: 'center',
    lineHeight: 1.5,
    spacing: {
      title: 8,
      description: 12,
      actions: 20
    }
  }
}
```

### 4. **載入狀態設計系統**
**⏳ WASM 模組載入的使用者體驗**

```typescript
// 載入狀態設計規範
interface LoadingStateDesign {
  // WASM 模組載入
  wasmLoading: {
    // 載入指示器
    spinner: {
      type: 'custom', // 自定義演算法主題圖示
      size: 40,
      strokeWidth: 3,
      color: '#3B82F6',

      // 旋轉動畫
      rotation: {
        duration: 1200,
        easing: 'linear',
        infinite: true
      },

      // 脈衝效果
      pulse: {
        opacity: [0.4, 1, 0.4],
        duration: 2000,
        easing: 'ease-in-out',
        infinite: true
      }
    },

    // 進度條設計
    progressBar: {
      width: 200,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',

      // 填充動畫
      fill: {
        backgroundColor: '#3B82F6',
        animation: {
          type: 'shimmer', // 流光效果
          duration: 1500,
          gradient: [
            'transparent',
            'rgba(255, 255, 255, 0.4)',
            'transparent'
          ]
        }
      }
    },

    // 載入階段訊息
    stageMessages: {
      downloading: '正在下載演算法引擎...',
      initializing: '正在初始化 WebAssembly...',
      compiling: '正在編譯演算法模組...',
      ready: '準備就緒！'
    },

    // 載入動畫順序
    animationSequence: [
      {
        stage: 'downloading',
        duration: 2000,
        progress: 30,
        effect: 'slideInFromLeft'
      },
      {
        stage: 'initializing',
        duration: 1000,
        progress: 60,
        effect: 'fadeIn'
      },
      {
        stage: 'compiling',
        duration: 1500,
        progress: 90,
        effect: 'slideInFromRight'
      },
      {
        stage: 'ready',
        duration: 500,
        progress: 100,
        effect: 'celebration'
      }
    ]
  },

  // 慶祝動畫（載入完成）
  completionCelebration: {
    confetti: {
      particles: 20,
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      duration: 1500,
      physics: {
        gravity: 0.8,
        wind: 0.1,
        friction: 0.95
      }
    },

    successIcon: {
      scale: [0, 1.2, 1],
      rotation: [0, 15, 0],
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}

// 骨架屏設計（載入期間顯示）
interface SkeletonDesign {
  algorithmCanvas: {
    bars: {
      count: 8,
      animatedGradient: {
        from: 'rgba(203, 213, 225, 0.3)',
        to: 'rgba(203, 213, 225, 0.7)',
        duration: 1500,
        direction: 'left-to-right'
      }
    }
  },

  controlPanel: {
    buttons: {
      count: 3,
      borderRadius: 6,
      shimmerEffect: true
    },

    slider: {
      width: 120,
      height: 4,
      animatedWidth: {
        from: 0,
        to: '100%',
        duration: 2000,
        repeat: 'infinite'
      }
    }
  }
}
```

## 輸出產物

### 1. **動畫參數配置檔**
```typescript
// animation-config.ts - 統一的動畫參數管理
export const animationConfig = {
  // 基礎動畫時間
  timing: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    lazy: 800
  },

  // 緩動函數庫
  easings: {
    // 標準緩動
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // 特殊效果
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    anticipate: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },

  // 狀態變化動畫
  stateTransitions: {
    buttonPress: {
      scale: { from: 1, to: 0.95, duration: 100 },
      color: { duration: 120 },
      ripple: { duration: 300, radius: 48 }
    },

    iconMorph: {
      playToPause: { duration: 300, steps: 20 },
      resetRotation: { duration: 500, rotation: 360 }
    }
  }
} as const;
```

### 2. **錯誤處理 UI 組件**
```vue
<!-- ErrorFallback.vue -->
<template>
  <div class="error-container" :class="errorType">
    <!-- 錯誤圖示 -->
    <div class="error-icon">
      <svg :class="{ 'animate-attention': showAttention }">
        <!-- 動態 SVG 圖示 -->
      </svg>
    </div>

    <!-- 錯誤訊息 -->
    <div class="error-content">
      <h3 class="error-title">{{ errorConfig.title }}</h3>
      <p class="error-description">{{ errorConfig.description }}</p>

      <!-- 技術細節（可展開） -->
      <details v-if="errorConfig.technicalDetails" class="error-details">
        <summary>技術詳情</summary>
        <code>{{ errorConfig.technicalDetails }}</code>
      </details>
    </div>

    <!-- 行動按鈕 -->
    <div class="error-actions">
      <button
        v-for="action in errorConfig.actions"
        :key="action.text"
        :class="['action-btn', action.style]"
        @click="handleAction(action)"
      >
        {{ action.text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  errorType: 'webgpu-init' | 'wasm-load' | 'general'
  onRetry?: () => void
  onFallback?: () => void
}

const props = defineProps<Props>()
const showAttention = ref(true)

// 根據錯誤類型獲取配置
const errorConfig = computed(() => {
  return getErrorConfig(props.errorType)
})

// 錯誤入場動畫
onMounted(() => {
  // 觸發入場動畫
  animateEntrance()
})
</script>

<style scoped>
.error-container {
  @apply max-w-md mx-auto p-6 rounded-xl text-center;
  backdrop-filter: blur(8px);
  animation: errorEntrance 300ms ease-out;
}

.webgpu-init {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.wasm-load {
  @apply bg-amber-50 border border-amber-200 text-amber-800;
}

.error-icon {
  @apply mb-4;
}

.animate-attention {
  animation: attention 1s ease-in-out infinite;
}

@keyframes errorEntrance {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes attention {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
```

### 3. **載入狀態管理器**
```typescript
// LoadingStateManager.ts
export class LoadingStateManager {
  private currentStage = 0;
  private stages = [
    { name: 'downloading', duration: 2000, progress: 30 },
    { name: 'initializing', duration: 1000, progress: 60 },
    { name: 'compiling', duration: 1500, progress: 90 },
    { name: 'ready', duration: 500, progress: 100 }
  ];

  private callbacks: Array<(stage: string, progress: number) => void> = [];

  startLoading() {
    this.currentStage = 0;
    this.executeStage();
  }

  private executeStage() {
    const stage = this.stages[this.currentStage];
    if (!stage) return;

    // 通知 UI 更新
    this.notifyProgress(stage.name, stage.progress);

    // 模擬載入時間
    setTimeout(() => {
      this.currentStage++;
      if (this.currentStage < this.stages.length) {
        this.executeStage();
      } else {
        this.notifyCompletion();
      }
    }, stage.duration);
  }

  private notifyProgress(stage: string, progress: number) {
    this.callbacks.forEach(callback => callback(stage, progress));
  }

  private notifyCompletion() {
    // 觸發慶祝動畫
    this.triggerCelebrationAnimation();
  }

  onProgress(callback: (stage: string, progress: number) => void) {
    this.callbacks.push(callback);
  }
}
```

## 下一步行動

### 立即執行（本週）：
1. **動畫參數實作**：建立統一的動畫配置系統，確保所有互動都有一致的時間與緩動
2. **錯誤狀態組件開發**：優先實作 WebGPU 初始化失敗的降級機制
3. **載入動畫原型**：建立 WASM 載入期間的使用者回饋機制

### 短期規劃（2 週內）：
1. **微交互完善**：實作所有按鈕的點擊回饋與狀態切換動畫
2. **錯誤處理測試**：模擬各種錯誤情境，驗證使用者體驗流暢度
3. **效能優化**：確保動畫不影響 WebGPU 渲染的 60fps 目標

### 中期目標（1 個月內）：
1. **使用者測試**：收集真實使用者對動畫與錯誤處理的回饋
2. **A/B 測試**：比較不同動畫時間與風格的使用者偏好
3. **無障礙優化**：支援動畫減少偏好與高對比模式

## 協作提醒

### 🤝 需要 FE Jerry 確認：
- **動畫實作方式**：CSS 動畫 vs WebGPU Shader 動畫的效能權衡
- **錯誤處理優先級**：WebGPU 降級到 Canvas2D 的技術實作細節
- **載入狀態同步**：WASM 模組載入進度如何準確回報給 UI

### 🎨 設計重點特色：
1. **情感化設計**：每個互動都有細緻的動畫回饋，提升使用愉悅感
2. **降級優雅**：技術失敗時提供清晰指引，不讓使用者感到困惑
3. **進度透明**：載入過程清楚顯示進度，減少等待焦慮
4. **效能考量**：所有動畫設計都考慮 WebGPU 高效能渲染需求

### 💻 技術整合要點：
- **CSS 變數驅動**：動畫參數使用 CSS 變數，便於統一調整
- **狀態機管理**：錯誤與載入狀態使用狀態機模式，確保流程清晰
- **記憶體友善**：動畫元素在不使用時及時釋放，避免記憶體洩漏

**總結**：提供了完整的互動動畫與錯誤處理設計規範，特別針對 WebGPU 與 WASM 技術的使用者體驗挑戰，確保即使在技術限制下也能提供優秀的使用者體驗。
