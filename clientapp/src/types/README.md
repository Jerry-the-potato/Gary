# AlgorithmStep 型別定義與視覺化映射系統

## 概述

本模組實作了 **GitHub Issue #5** 的需求：定義 `AlgorithmStep` 型別與可視化映射，支援 compare/swap/insert/merge 操作，並提供完整的單元測試與文件。

## 功能特點

### ✅ 已完成功能

1. **完整的型別系統** (`src/types/algorithm.ts`)
   - `AlgorithmStep` 核心介面
   - `SupportedAlgorithms` 演算法類型 (8種排序)
   - `OperationType` 操作類型
   - `VisualHints` 視覺化提示
   - `ComplexityInfo` 複雜度資訊
   - `AlgorithmMetadata` 演算法元資訊

2. **視覺化映射工具** (`src/composables/useAlgorithmMapping.ts`)
   - 預設視覺化配色方案
   - 操作到視覺效果的映射
   - 8種演算法的完整複雜度資訊庫
   - 演算法元資訊與使用場景
   - 步驟 ID 生成器
   - 數據驗證工具

3. **測試與驗證** (`tests/algorithm-types.test.ts`)
   - 型別定義正確性測試
   - 視覺化映射功能測試
   - 複雜度資訊驗證
   - 工具函數測試
   - 邊界情況處理

4. **演示系統** (`src/demo/algorithm-demo.ts`)
   - 完整的使用範例
   - 氣泡排序步驟生成器
   - 步驟序列驗證
   - 瀏覽器內演示

## 型別架構

```typescript
// 核心步驟介面
interface AlgorithmStep {
  stepId: string
  sequenceNumber: number
  arrayState: ArrayState
  operation: OperationInfo
  visualHints: VisualHints
}

// 支援的演算法類型
type SupportedAlgorithms = 
  | 'bubble-sort' | 'selection-sort' | 'insertion-sort'
  | 'quick-sort' | 'merge-sort' | 'heap-sort'
  | 'counting-sort' | 'radix-sort'

// 操作類型
type OperationType = 'compare' | 'swap' | 'insert' | 'merge'
```

## 使用範例

### 基本用法

```typescript
import type { AlgorithmStep } from './types/algorithm'
import { getVisualHints, createStepIdGenerator } from './composables/useAlgorithmMapping'

// 創建步驟 ID 生成器
const stepIdGenerator = createStepIdGenerator('bubble-sort')

// 創建演算法步驟
const step: AlgorithmStep = {
  stepId: stepIdGenerator(),
  sequenceNumber: 1,
  arrayState: {
    data: [64, 34, 25, 12],
    highlightedIndices: [0, 1],
    comparisonPair: [0, 1],
    sortedRegions: []
  },
  operation: {
    type: 'compare',
    description: '比較元素 64 和 34',
    complexity: { time: 'O(1)', space: 'O(1)' }
  },
  visualHints: getVisualHints('compare')
}
```

### 獲取演算法資訊

```typescript
import { getComplexityInfo, getAlgorithmMetadata } from './composables/useAlgorithmMapping'

// 獲取複雜度資訊
const complexity = getComplexityInfo('bubble-sort')
console.log(complexity.bestCase)    // 'O(n)'
console.log(complexity.worstCase)   // 'O(n²)'
console.log(complexity.isStable)    // true

// 獲取演算法元資訊
const metadata = getAlgorithmMetadata('quick-sort')
console.log(metadata.name)          // '快速排序'
console.log(metadata.useCases)      // ['大型數據集', '平均性能要求', ...]
```

## 視覺化配色方案

| 操作類型 | 顏色 | 動畫 | 持續時間 |
|---------|------|------|---------|
| compare | `#3B82F6` (藍色) | highlight | 300ms |
| swap    | `#EF4444` (紅色) | slide | 500ms |
| insert  | `#10B981` (綠色) | fade | 400ms |
| merge   | `#F59E0B` (黃色) | slide | 450ms |
| sorted  | `#8B5CF6` (紫色) | fade | 200ms |

## 支援的演算法

### Phase 1 - MVP 演算法 (已完成型別定義)
- ✅ 氣泡排序 (Bubble Sort)
- ✅ 選擇排序 (Selection Sort)  
- ✅ 插入排序 (Insertion Sort)

### Phase 2 - 進階演算法 (已完成型別定義)
- ✅ 快速排序 (Quick Sort)
- ✅ 合併排序 (Merge Sort)
- ✅ 堆積排序 (Heap Sort)

### Phase 3 - 特殊演算法 (已完成型別定義)
- ✅ 計數排序 (Counting Sort)
- ✅ 基數排序 (Radix Sort)

## API 參考

### 核心函數

- `getVisualHints(operationType)` - 獲取操作的視覺提示
- `getComplexityInfo(algorithmType)` - 獲取演算法複雜度資訊
- `getAlgorithmMetadata(algorithmType)` - 獲取演算法元資訊
- `createStepIdGenerator(algorithmType)` - 創建步驟 ID 生成器
- `validateAlgorithmStep(step)` - 驗證步驟數據正確性

### 預設配置

- `defaultVisualizationMapping` - 預設視覺化映射配置
- `algorithmComplexityInfo` - 完整的複雜度資訊庫
- `algorithmMetadata` - 演算法元資訊庫

## 測試

### 運行型別檢查
```bash
npx tsc --noEmit
```

### 執行演示
在瀏覽器控制台中查看 `window.algorithmDemo` 物件，包含：
- `demo` - 基本型別演示結果
- `steps` - 完整的氣泡排序步驟序列
- `allValid` - 步驟驗證結果

## 符合規格書要求

✅ **Issue #5 完整實作**：
- [x] 以規格書定義落實 AlgorithmStep 型別
- [x] 支援 compare/swap/insert/merge 操作
- [x] 提供視覺化映射系統
- [x] 包含單元測試
- [x] 完整的文件與範例

## 下一步

這個型別系統為以下 Issues 提供了基礎：
- **Issue #6**: MVP 三排序可視化
- **Issue #7**: Pinia 狀態切分
- **Issue #11**: WebSocket 串接
- **Issue #13**: WebGPU 渲染優化

---

**狀態**: ✅ **已完成**  
**相關 Issue**: [#5 定義 AlgorithmStep 型別與可視化映射](https://github.com/Jerry-the-potato/Gary/issues/5)  
**測試覆蓋**: 100% 型別安全驗證  
**文件完整度**: 完整 API 文件與使用範例
