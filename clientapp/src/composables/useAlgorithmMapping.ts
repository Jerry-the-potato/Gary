/**
 * 演算法視覺化映射工具
 * 提供操作到視覺效果的映射邏輯
 */

import type { 
  OperationType, 
  VisualizationMapping, 
  VisualHints, 
  ComplexityInfo,
  AlgorithmMetadata,
  SupportedAlgorithms 
} from '../types/algorithm'

// 預設視覺化映射配置
export const defaultVisualizationMapping: VisualizationMapping = {
  compare: {
    color: '#3B82F6', // 藍色 - 比較操作
    animation: 'highlight',
    duration: 300
  },
  swap: {
    color: '#EF4444', // 紅色 - 交換操作
    animation: 'slide',
    duration: 500
  },
  insert: {
    color: '#10B981', // 綠色 - 插入操作
    animation: 'fade',
    duration: 400
  },
  merge: {
    color: '#F59E0B', // 黃色 - 合併操作
    animation: 'slide',
    duration: 450
  },
  sorted: {
    color: '#8B5CF6', // 紫色 - 已排序
    animation: 'fade',
    duration: 200
  }
}

/**
 * 根據操作類型獲取視覺化提示
 */
export function getVisualHints(
  operationType: OperationType,
  mapping: VisualizationMapping = defaultVisualizationMapping
): VisualHints {
  const config = mapping[operationType]
  
  return {
    animationType: config.animation,
    duration: config.duration,
    colors: {
      comparing: mapping.compare.color,
      swapping: mapping.swap.color,
      sorted: mapping.sorted.color
    }
  }
}

/**
 * 演算法複雜度資訊庫
 */
export const algorithmComplexityInfo: Record<SupportedAlgorithms, ComplexityInfo> = {
  'bubble-sort': {
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    isStable: true,
    isInPlace: true
  },
  'selection-sort': {
    bestCase: 'O(n²)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    isStable: false,
    isInPlace: true
  },
  'insertion-sort': {
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    isStable: true,
    isInPlace: true
  },
  'quick-sort': {
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(log n)',
    isStable: false,
    isInPlace: true
  },
  'merge-sort': {
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    isStable: true,
    isInPlace: false
  },
  'heap-sort': {
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(1)',
    isStable: false,
    isInPlace: true
  },
  'counting-sort': {
    bestCase: 'O(n + k)',
    averageCase: 'O(n + k)',
    worstCase: 'O(n + k)',
    spaceComplexity: 'O(k)',
    isStable: true,
    isInPlace: false
  },
  'radix-sort': {
    bestCase: 'O(d × n)',
    averageCase: 'O(d × n)',
    worstCase: 'O(d × n)',
    spaceComplexity: 'O(n + k)',
    isStable: true,
    isInPlace: false
  }
}

/**
 * 演算法元資訊庫
 */
export const algorithmMetadata: Record<SupportedAlgorithms, AlgorithmMetadata> = {
  'bubble-sort': {
    name: '氣泡排序',
    description: '重複遍歷陣列，比較相鄰元素並交換，使最大元素「冒泡」到正確位置',
    complexity: algorithmComplexityInfo['bubble-sort'],
    useCases: ['教學演示', '小型數據集', '近似排序數據'],
    prosAndCons: {
      pros: ['實作簡單', '穩定排序', '原地排序', '適應性強'],
      cons: ['效率低下', '時間複雜度高', '不適合大數據']
    }
  },
  'selection-sort': {
    name: '選擇排序',
    description: '每次選擇剩餘元素中的最小值，放到已排序區域的末尾',
    complexity: algorithmComplexityInfo['selection-sort'],
    useCases: ['記憶體受限環境', '小型數據集', '簡單實作需求'],
    prosAndCons: {
      pros: ['實作簡單', '原地排序', '交換次數少'],
      cons: ['不穩定', '效率低', '無適應性']
    }
  },
  'insertion-sort': {
    name: '插入排序',
    description: '逐一取出元素，插入到已排序區域的正確位置',
    complexity: algorithmComplexityInfo['insertion-sort'],
    useCases: ['小型數據集', '近似排序數據', '線上演算法'],
    prosAndCons: {
      pros: ['穩定排序', '原地排序', '適應性強', '簡單實作'],
      cons: ['大數據效率低', '平均性能差']
    }
  },
  'quick-sort': {
    name: '快速排序',
    description: '選擇基準點分割陣列，遞迴排序左右子陣列',
    complexity: algorithmComplexityInfo['quick-sort'],
    useCases: ['大型數據集', '平均性能要求', '記憶體效率'],
    prosAndCons: {
      pros: ['平均性能優異', '原地排序', '實際應用廣泛'],
      cons: ['不穩定', '最壞情況差', '遞迴深度問題']
    }
  },
  'merge-sort': {
    name: '合併排序',
    description: '將陣列分割成小段，逐步合併排序',
    complexity: algorithmComplexityInfo['merge-sort'],
    useCases: ['大型數據集', '穩定排序需求', '外部排序'],
    prosAndCons: {
      pros: ['穩定排序', '最佳時間複雜度', '預測性能'],
      cons: ['額外記憶體需求', '非原地排序']
    }
  },
  'heap-sort': {
    name: '堆積排序',
    description: '建立最大堆積，重複取出最大值並重建堆積',
    complexity: algorithmComplexityInfo['heap-sort'],
    useCases: ['記憶體受限', '最壞情況保證', '優先佇列'],
    prosAndCons: {
      pros: ['原地排序', '最佳最壞時間複雜度', '記憶體效率'],
      cons: ['不穩定', '實際性能較慢', '複雜實作']
    }
  },
  'counting-sort': {
    name: '計數排序',
    description: '統計每個值的出現次數，直接計算排序位置',
    complexity: algorithmComplexityInfo['counting-sort'],
    useCases: ['整數排序', '有限範圍值', '穩定排序需求'],
    prosAndCons: {
      pros: ['線性時間', '穩定排序', '簡單實作'],
      cons: ['範圍限制', '額外記憶體', '非比較排序']
    }
  },
  'radix-sort': {
    name: '基數排序',
    description: '按位數排序，從最低位到最高位逐步排序',
    complexity: algorithmComplexityInfo['radix-sort'],
    useCases: ['大量整數', '固定位數', '穩定排序需求'],
    prosAndCons: {
      pros: ['線性時間', '穩定排序', '大數據效率'],
      cons: ['位數限制', '額外記憶體', '非比較排序']
    }
  }
}

/**
 * 獲取演算法複雜度資訊
 */
export function getComplexityInfo(algorithmType: SupportedAlgorithms): ComplexityInfo {
  return algorithmComplexityInfo[algorithmType]
}

/**
 * 獲取演算法元資訊
 */
export function getAlgorithmMetadata(algorithmType: SupportedAlgorithms): AlgorithmMetadata {
  return algorithmMetadata[algorithmType]
}

/**
 * 創建步驟 ID 生成器
 */
export function createStepIdGenerator(algorithmType: SupportedAlgorithms): () => string {
  let counter = 0
  const prefix = algorithmType.replace('-', '_').toUpperCase()
  
  return () => {
    counter++
    const timestamp = Date.now().toString(36)
    return `${prefix}_${timestamp}_${counter.toString(16).padStart(4, '0')}`
  }
}

/**
 * 驗證演算法步驟數據
 */
export function validateAlgorithmStep(step: any): step is import('../types/algorithm').AlgorithmStep {
  return (
    typeof step === 'object' &&
    typeof step.stepId === 'string' &&
    typeof step.sequenceNumber === 'number' &&
    typeof step.arrayState === 'object' &&
    Array.isArray(step.arrayState.data) &&
    Array.isArray(step.arrayState.highlightedIndices) &&
    typeof step.operation === 'object' &&
    typeof step.operation.type === 'string' &&
    typeof step.operation.description === 'string' &&
    typeof step.visualHints === 'object'
  )
}
