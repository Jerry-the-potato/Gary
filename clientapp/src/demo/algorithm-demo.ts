/**
 * AlgorithmStep 型別定義演示
 * 展示如何使用我們定義的型別系統
 */

import type { AlgorithmStep, SupportedAlgorithms } from '../types/algorithm'
import { 
  getVisualHints, 
  getComplexityInfo, 
  getAlgorithmMetadata,
  createStepIdGenerator,
  validateAlgorithmStep
} from '../composables/useAlgorithmMapping'

/**
 * 演示 AlgorithmStep 型別的使用
 */
export function demonstrateAlgorithmTypes() {
  console.log('🎯 演示 AlgorithmStep 型別系統')
  
  // 1. 創建步驟 ID 生成器
  const stepIdGenerator = createStepIdGenerator('bubble-sort')
  
  // 2. 創建示例演算法步驟
  const exampleStep: AlgorithmStep = {
    stepId: stepIdGenerator(),
    sequenceNumber: 1,
    arrayState: {
      data: [64, 34, 25, 12, 22, 11, 90],
      highlightedIndices: [0, 1],
      comparisonPair: [0, 1],
      sortedRegions: []
    },
    operation: {
      type: 'compare',
      description: '比較元素 64 和 34',
      complexity: {
        time: 'O(1)',
        space: 'O(1)'
      }
    },
    visualHints: getVisualHints('compare')
  }
  
  // 3. 驗證步驟
  const isValid = validateAlgorithmStep(exampleStep)
  console.log(`✅ 步驟驗證結果: ${isValid}`)
  
  // 4. 獲取複雜度資訊
  const complexity = getComplexityInfo('bubble-sort')
  console.log(`📊 氣泡排序複雜度:`, {
    bestCase: complexity.bestCase,
    worstCase: complexity.worstCase,
    isStable: complexity.isStable
  })
  
  // 5. 獲取演算法元資訊
  const metadata = getAlgorithmMetadata('bubble-sort')
  console.log(`📚 演算法資訊: ${metadata.name}`)
  console.log(`📝 描述: ${metadata.description}`)
  console.log(`💡 適用場景:`, metadata.useCases)
  
  // 6. 演示不同操作類型的視覺效果
  const operations = ['compare', 'swap', 'insert', 'merge'] as const
  console.log('🎨 操作視覺效果:')
  operations.forEach(op => {
    const hints = getVisualHints(op)
    console.log(`  ${op}: ${hints.animationType} (${hints.duration}ms)`)
  })
  
  return {
    step: exampleStep,
    isValid,
    complexity,
    metadata
  }
}

/**
 * 演示完整的演算法步驟序列
 */
export function createBubbleSortSteps(inputArray: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const stepIdGenerator = createStepIdGenerator('bubble-sort')
  const data = [...inputArray] // 複製陣列避免修改原始數據
  let sequenceNumber = 0
  
  console.log('🫧 生成氣泡排序步驟序列...')
  
  // 氣泡排序演算法
  for (let i = 0; i < data.length - 1; i++) {
    for (let j = 0; j < data.length - i - 1; j++) {
      // 比較步驟
      steps.push({
        stepId: stepIdGenerator(),
        sequenceNumber: ++sequenceNumber,
        arrayState: {
          data: [...data],
          highlightedIndices: [j, j + 1],
          comparisonPair: [j, j + 1],
          sortedRegions: data.length - i > 1 ? [] : [{ start: data.length - i, end: data.length - 1 }]
        },
        operation: {
          type: 'compare',
          description: `比較元素 ${data[j]} 和 ${data[j + 1]}`,
          complexity: { time: 'O(1)', space: 'O(1)' }
        },
        visualHints: getVisualHints('compare')
      })
      
      // 如果需要交換
      if (data[j] > data[j + 1]) {
        // 交換步驟
        steps.push({
          stepId: stepIdGenerator(),
          sequenceNumber: ++sequenceNumber,
          arrayState: {
            data: [...data],
            highlightedIndices: [j, j + 1],
            swapPair: [j, j + 1],
            sortedRegions: data.length - i > 1 ? [] : [{ start: data.length - i, end: data.length - 1 }]
          },
          operation: {
            type: 'swap',
            description: `交換元素 ${data[j]} 和 ${data[j + 1]}`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          },
          visualHints: getVisualHints('swap')
        })
        
        // 實際交換數據
        [data[j], data[j + 1]] = [data[j + 1], data[j]]
      }
    }
  }
  
  // 最終完成步驟
  steps.push({
    stepId: stepIdGenerator(),
    sequenceNumber: ++sequenceNumber,
    arrayState: {
      data: [...data],
      highlightedIndices: [],
      sortedRegions: [{ start: 0, end: data.length - 1 }]
    },
    operation: {
      type: 'compare',
      description: '排序完成',
      complexity: { time: 'O(n²)', space: 'O(1)' }
    },
    visualHints: {
      animationType: 'fade',
      duration: 200,
      colors: {
        comparing: '#3B82F6',
        swapping: '#EF4444',
        sorted: '#8B5CF6'
      }
    }
  })
  
  console.log(`✅ 生成了 ${steps.length} 個步驟`)
  return steps
}

/**
 * 驗證所有步驟的正確性
 */
export function validateSteps(steps: AlgorithmStep[]): boolean {
  console.log('🔍 驗證步驟序列...')
  
  let isValid = true
  for (let i = 0; i < steps.length; i++) {
    if (!validateAlgorithmStep(steps[i])) {
      console.error(`❌ 步驟 ${i} 驗證失敗:`, steps[i])
      isValid = false
    }
  }
  
  if (isValid) {
    console.log('✅ 所有步驟驗證通過')
  }
  
  return isValid
}

// 演示用法
if (typeof window !== 'undefined') {
  // 瀏覽器環境
  console.log('在瀏覽器中運行 AlgorithmStep 演示...')
  
  // 基本型別演示
  const demo = demonstrateAlgorithmTypes()
  
  // 生成完整步驟序列
  const inputArray = [64, 34, 25, 12, 22]
  const steps = createBubbleSortSteps(inputArray)
  
  // 驗證步驟
  const allValid = validateSteps(steps)
  
  console.log(`🎉 演示完成! 生成 ${steps.length} 個步驟，驗證結果: ${allValid}`)
  
  // 將結果暴露到全域變數供檢查
  ;(window as any).algorithmDemo = {
    demo,
    steps,
    allValid
  }
}
