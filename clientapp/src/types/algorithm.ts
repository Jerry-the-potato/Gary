/**
 * 演算法視覺化型別定義
 * 基於技術規格書 AlgorithmStep 介面設計
 * 
 * @see docs/最終規格文件/001演算法視覺化工具技術規格書.md
 */

// 支援的演算法類型
export type SupportedAlgorithms =
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort'
  | 'quick-sort'
  | 'merge-sort'
  | 'heap-sort'
  | 'counting-sort'
  | 'radix-sort'

// 操作類型
export type OperationType = 'compare' | 'swap' | 'insert' | 'merge'

// 動畫類型
export type AnimationType = 'fade' | 'slide' | 'highlight'

// 陣列狀態介面
export interface ArrayState {
  /** 當前陣列數據 */
  data: number[]
  /** 被高亮顯示的索引 */
  highlightedIndices: number[]
  /** 正在比較的一對索引 */
  comparisonPair?: [number, number]
  /** 正在交換的一對索引 */
  swapPair?: [number, number]
  /** 已排序的區域 */
  sortedRegions: Array<{ start: number, end: number }>
}

// 操作描述介面
export interface OperationInfo {
  /** 操作類型 */
  type: OperationType
  /** 操作描述文字 */
  description: string
  /** 時間與空間複雜度 */
  complexity: {
    time: string
    space: string
  }
}

// 視覺化提示介面
export interface VisualHints {
  /** 動畫類型 */
  animationType: AnimationType
  /** 動畫持續時間 (毫秒) */
  duration: number
  /** 顏色配置 */
  colors: {
    comparing: string
    swapping: string
    sorted: string
  }
}

// 核心演算法步驟介面
export interface AlgorithmStep {
  /** 步驟唯一識別碼 */
  stepId: string
  /** 序列編號 */
  sequenceNumber: number
  
  /** 陣列狀態 */
  arrayState: ArrayState
  
  /** 操作描述 */
  operation: OperationInfo
  
  /** 視覺化提示 */
  visualHints: VisualHints
}

// 演算法執行配置
export interface ExecutionConfig {
  /** 演算法類型 */
  algorithmType: SupportedAlgorithms
  /** 輸入數據 */
  inputData: number[]
  /** 播放速度 (毫秒間隔) */
  speed: number
  /** 渲染提示 */
  renderingHints: {
    targetFPS: number
    maxElements: number
    visualizationLevel: 'minimal' | 'detailed' | 'debug'
  }
}

// 演算法執行狀態
export interface AlgorithmState {
  /** 當前執行狀態 */
  status: 'idle' | 'playing' | 'paused' | 'completed' | 'error'
  /** 當前步驟 */
  currentStep: number
  /** 總步驟數 */
  totalSteps: number
  /** 是否已完成 */
  isComplete: boolean
  /** 高亮顯示的索引 */
  highlightedIndices: number[]
  /** 當前操作描述 */
  currentOperation: string
  /** 錯誤訊息（如果有） */
  error?: string
}

// 複雜度資訊
export interface ComplexityInfo {
  /** 最佳情況時間複雜度 */
  bestCase: string
  /** 平均情況時間複雜度 */
  averageCase: string
  /** 最壞情況時間複雜度 */
  worstCase: string
  /** 空間複雜度 */
  spaceComplexity: string
  /** 是否為穩定排序 */
  isStable: boolean
  /** 是否為原地排序 */
  isInPlace: boolean
}

// 演算法元資訊
export interface AlgorithmMetadata {
  /** 演算法名稱 */
  name: string
  /** 演算法描述 */
  description: string
  /** 複雜度資訊 */
  complexity: ComplexityInfo
  /** 適用場景 */
  useCases: string[]
  /** 優缺點 */
  prosAndCons: {
    pros: string[]
    cons: string[]
  }
}

// 視覺化映射配置
export interface VisualizationMapping {
  /** 比較操作的視覺效果 */
  compare: {
    color: string
    animation: AnimationType
    duration: number
  }
  /** 交換操作的視覺效果 */
  swap: {
    color: string
    animation: AnimationType
    duration: number
  }
  /** 插入操作的視覺效果 */
  insert: {
    color: string
    animation: AnimationType
    duration: number
  }
  /** 合併操作的視覺效果 */
  merge: {
    color: string
    animation: AnimationType
    duration: number
  }
  /** 已排序區域的視覺效果 */
  sorted: {
    color: string
    animation: AnimationType
    duration: number
  }
}

// 所有型別已通過 export 關鍵字單獨導出
