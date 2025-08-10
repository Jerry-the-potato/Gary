# role: UX - 詳細設計規範補充

## 角色識別：AI 使用者體驗設計師
感謝 FE Jerry 的詳細需求整理！我將提供完整的視覺設計規範，確保 Canvas 內嵌 UI 系統有明確的實作標準。

## 核心建議

### 1. **UI 元件視覺規格**
**🎨 完整的設計系統規範**

#### 按鈕設計規格
```typescript
// 按鈕尺寸規範
interface ButtonSpecs {
  // 主要操作按鈕（播放/暫停）
  primary: {
    width: 48,
    height: 48,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    iconSize: 20
  },
  
  // 次要操作按鈕（重置、設定）
  secondary: {
    width: 40,
    height: 40,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    iconSize: 16
  },
  
  // 小型按鈕（手機模式）
  small: {
    width: 36,
    height: 36,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    iconSize: 14
  }
}

// 色彩規範
interface ColorPalette {
  // 主要色彩
  primary: '#3B82F6',      // 藍色 - 主要操作
  primaryHover: '#2563EB', // 藍色 - 懸停狀態
  primaryActive: '#1D4ED8', // 藍色 - 點擊狀態
  
  // 次要色彩
  secondary: '#6B7280',    // 灰色 - 次要操作
  secondaryHover: '#4B5563',
  secondaryActive: '#374151',
  
  // 狀態色彩
  success: '#10B981',      // 綠色 - 成功/完成
  warning: '#F59E0B',      // 橙色 - 警告/處理中
  danger: '#EF4444',       // 紅色 - 錯誤/重置
  
  // 中性色彩
  background: 'rgba(0, 0, 0, 0.8)',  // 控制面板背景
  surface: 'rgba(255, 255, 255, 0.1)', // 元件表面
  text: '#FFFFFF',         // 主要文字
  textSecondary: '#D1D5DB', // 次要文字
  border: 'rgba(255, 255, 255, 0.2)'  // 邊框
}

// 陰影效果
interface ShadowSpecs {
  button: '0 2px 8px rgba(0, 0, 0, 0.15)',
  buttonHover: '0 4px 12px rgba(0, 0, 0, 0.2)',
  panel: '0 8px 32px rgba(0, 0, 0, 0.3)',
  glow: '0 0 16px rgba(59, 130, 246, 0.3)' // 焦點發光
}
```

### 2. **互動狀態設計**
**🎯 完整的狀態變化規範**

#### 按鈕狀態設計
```typescript
// 完整的互動狀態設計
interface InteractionStates {
  // 一般狀態
  default: {
    backgroundColor: '#3B82F6',
    transform: 'scale(1)',
    opacity: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  
  // 懸停狀態
  hover: {
    backgroundColor: '#2563EB',
    transform: 'scale(1.02)', // 微小放大
    opacity: 1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 點擊狀態
  active: {
    backgroundColor: '#1D4ED8',
    transform: 'scale(0.98)', // 按下效果
    opacity: 1,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
    transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 禁用狀態
  disabled: {
    backgroundColor: '#6B7280',
    transform: 'scale(1)',
    opacity: 0.5,
    boxShadow: 'none',
    cursor: 'not-allowed'
  },
  
  // 載入狀態
  loading: {
    backgroundColor: '#3B82F6',
    transform: 'scale(1)',
    opacity: 0.8,
    animation: 'pulse 1.5s infinite',
    cursor: 'wait'
  }
}

// 焦點狀態（鍵盤導航）
interface FocusState {
  outline: 'none',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  borderRadius: 8
}
```

#### 滑桿控制項設計
```typescript
// 速度控制滑桿
interface SliderSpecs {
  track: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2
  },
  
  fill: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    transition: 'width 200ms ease-out'
  },
  
  thumb: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    
    // 懸停狀態
    hover: {
      transform: 'scale(1.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    
    // 拖拽狀態
    dragging: {
      transform: 'scale(1.3)',
      boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
    }
  }
}
```

### 3. **響應式斷點設計**
**📱 跨裝置適配規範**

```typescript
// 響應式斷點定義
interface ResponsiveBreakpoints {
  mobile: {
    maxWidth: 767,
    controlPanel: {
      position: 'bottom',
      height: 80,
      padding: 12,
      buttonSize: 'small', // 36x36px
      spacing: 8
    }
  },
  
  tablet: {
    minWidth: 768,
    maxWidth: 1023,
    controlPanel: {
      position: 'top-right',
      width: 200,
      padding: 16,
      buttonSize: 'secondary', // 40x40px
      spacing: 12
    }
  },
  
  desktop: {
    minWidth: 1024,
    controlPanel: {
      position: 'top-center',
      width: 'auto',
      padding: 20,
      buttonSize: 'primary', // 48x48px
      spacing: 16
    }
  }
}

// 觸控設備最小尺寸
interface TouchTargets {
  minimumSize: 44, // Apple HIG & Material Design 建議
  recommendedSize: 48,
  spacing: 8, // 最小間距避免誤觸
  
  // 手勢區域
  gestureZones: {
    tap: 44,
    drag: 32, // 滑桿拖拽區域
    swipe: 60  // 滑動手勢區域
  }
}
```

### 4. **動畫規格設計**
**✨ 流暢的互動回饋**

```typescript
// 動畫時間與緩動函數
interface AnimationSpecs {
  // 基礎動畫時間
  durations: {
    instant: 0,      // 即時回饋
    fast: 150,       // 按鈕互動
    normal: 250,     // 狀態切換
    slow: 400,       // 面板展開
    lazy: 600        // 載入動畫
  },
  
  // 緩動函數
  easings: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}

// 具體動畫實作
interface ButtonAnimations {
  // 點擊波紋效果
  ripple: {
    duration: 300,
    easing: 'easeOut',
    opacity: [0, 0.3, 0],
    scale: [0, 1],
    color: 'rgba(255, 255, 255, 0.3)'
  },
  
  // 載入脈衝
  pulse: {
    duration: 1500,
    easing: 'easeInOut',
    opacity: [0.8, 1, 0.8],
    infinite: true
  },
  
  // 成功勾選動畫
  checkmark: {
    duration: 400,
    easing: 'easeOut',
    strokeDasharray: '0, 100',
    strokeDashoffset: [100, 0]
  }
}

// 進度條動畫
interface ProgressAnimations {
  // 數值更新
  valueUpdate: {
    duration: 200,
    easing: 'easeOut',
    property: 'width'
  },
  
  // 載入指示器
  indeterminate: {
    duration: 2000,
    easing: 'linear',
    transform: 'translateX(-100%) translateX(100%)',
    infinite: true
  },
  
  // 完成動畫
  completion: {
    duration: 500,
    easing: 'bounce',
    backgroundColor: '#10B981',
    scale: [1, 1.05, 1]
  }
}
```

## 輸出產物

### 1. **完整設計 Token 系統**
```typescript
// design-tokens.ts - 設計系統核心 Token
export const designTokens = {
  // 尺寸系統
  sizes: {
    buttons: {
      small: { width: 36, height: 36 },
      medium: { width: 40, height: 40 },
      large: { width: 48, height: 48 }
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24
    },
    
    borderRadius: {
      small: 4,
      medium: 6,
      large: 8,
      round: 50
    }
  },
  
  // 色彩系統
  colors: {
    primary: {
      50: '#EBF8FF',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8'
    },
    
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4'
    },
    
    neutral: {
      900: '#111827',
      800: '#1F2937',
      700: '#374151',
      500: '#6B7280',
      300: '#D1D5DB',
      100: '#F3F4F6',
      white: '#FFFFFF'
    }
  },
  
  // 文字系統
  typography: {
    button: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.2
    },
    
    caption: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.3
    }
  }
} as const;
```

### 2. **WebGPU UI 組件樣式映射**
```typescript
// webgpu-ui-styles.ts - Canvas 渲染用的樣式轉換
export class WebGPUUIStyles {
  static getButtonStyle(
    state: 'default' | 'hover' | 'active' | 'disabled',
    variant: 'primary' | 'secondary' = 'primary'
  ): CanvasUIStyle {
    const baseStyle = designTokens.colors[variant];
    
    return {
      backgroundColor: this.rgbaToFloat(baseStyle['500']),
      borderRadius: designTokens.sizes.borderRadius.medium,
      padding: designTokens.sizes.spacing.md,
      
      // 狀態變化
      ...this.getStateModifiers(state),
      
      // 陰影效果（在 shader 中實作）
      shadow: this.getShadowParams(state)
    };
  }
  
  private static rgbaToFloat(hexColor: string): [number, number, number, number] {
    // 將 HEX 顏色轉換為 0-1 的浮點數陣列，供 WebGPU 使用
    const hex = hexColor.replace('#', '');
    return [
      parseInt(hex.substr(0, 2), 16) / 255,
      parseInt(hex.substr(2, 2), 16) / 255,
      parseInt(hex.substr(4, 2), 16) / 255,
      1.0
    ];
  }
}
```

### 3. **響應式佈局計算器**
```typescript
// responsive-layout.ts - 自動佈局計算
export class ResponsiveLayoutCalculator {
  static calculateLayout(screenWidth: number, screenHeight: number): UILayout {
    const breakpoint = this.getBreakpoint(screenWidth);
    
    switch (breakpoint) {
      case 'mobile':
        return this.getMobileLayout(screenWidth, screenHeight);
      case 'tablet':
        return this.getTabletLayout(screenWidth, screenHeight);
      default:
        return this.getDesktopLayout(screenWidth, screenHeight);
    }
  }
  
  private static getMobileLayout(width: number, height: number): UILayout {
    return {
      controlPanel: {
        x: 0,
        y: height - 80,
        width: width,
        height: 80,
        orientation: 'horizontal'
      },
      
      playButton: {
        x: width / 2 - 18,
        y: height - 60,
        size: designTokens.sizes.buttons.small
      },
      
      resetButton: {
        x: 20,
        y: height - 58,
        size: designTokens.sizes.buttons.small
      },
      
      speedSlider: {
        x: width - 140,
        y: height - 50,
        width: 120,
        height: 20
      }
    };
  }
}
```

## 下一步行動

### 立即執行（本週）：
1. **設計 Token 實作**：建立完整的設計系統 Token 檔案
2. **UI 樣式轉換器開發**：實作 CSS 到 WebGPU 的樣式轉換邏輯
3. **響應式計算器測試**：驗證不同螢幕尺寸下的佈局計算

### 短期規劃（2 週內）：
1. **互動原型製作**：使用 Figma 建立高保真互動原型
2. **無障礙設計驗證**：確保設計符合 WCAG 2.1 AA 標準
3. **使用者測試準備**：設計測試腳本，驗證觸控互動體驗

## 協作提醒

### 🤝 需要 FE Jerry 確認：
- **色彩格式轉換**：HEX 到 WebGPU 浮點數的轉換是否準確
- **動畫實作方式**：在 GPU 中實作 CSS 動畫的技術可行性
- **觸控事件精度**：Canvas 事件座標與 UI 元件邊界檢測的精確度要求

### 🎨 設計系統亮點：
1. **一致性**：所有尺寸、色彩、動畫都有標準化定義
2. **適應性**：響應式設計支援所有主流裝置
3. **效能導向**：設計規範考慮 WebGPU 渲染特性
4. **無障礙友善**：符合觸控與鍵盤導航需求

### 💻 技術整合考量：
- **記憶體效率**：UI 紋理使用圖集技術，減少 GPU 記憶體佔用
- **渲染效能**：所有動畫使用 GPU 加速，避免 CPU 計算
- **降級機制**：設計規範同時適用於 Canvas2D 降級版本

**總結**：提供了完整的 UI 設計規範，包含尺寸、色彩、互動狀態與動畫細節。這些規範專門針對 WebGPU Canvas 渲染優化，確保 FE Jerry 有明確的實作標準，同時保證優秀的使用者體驗。