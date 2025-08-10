/**
 * AlgorithmStep 型別與視覺化映射測試
 * 簡化版本，使用基本斷言來驗證型別和函數功能
 */

import type { 
  AlgorithmStep, 
  OperationType,
  SupportedAlgorithms 
} from '../src/types/algorithm'
import {
  defaultVisualizationMapping,
  getVisualHints,
  getComplexityInfo,
  getAlgorithmMetadata,
  createStepIdGenerator,
  validateAlgorithmStep
} from '../src/composables/useAlgorithmMapping'

// 簡單的測試框架
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`)
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Test failed: ${message}. Expected: ${expected}, Actual: ${actual}`)
  }
}

// 測試 AlgorithmStep 型別定義
function testAlgorithmStepInterface() {
  console.log('🧪 測試 AlgorithmStep 型別定義...')
  
  const mockStep: AlgorithmStep = {
    stepId: 'test-step-1',
    sequenceNumber: 1,
    arrayState: {
      data: [3, 1, 4, 1, 5],
      highlightedIndices: [0, 1],
      comparisonPair: [0, 1],
      sortedRegions: []
    },
    operation: {
      type: 'compare',
      description: '比較元素 3 和 1',
      complexity: {
        time: 'O(1)',
        space: 'O(1)'
      }
    },
    visualHints: {
      animationType: 'highlight',
      duration: 300,
      colors: {
        comparing: '#3B82F6',
        swapping: '#EF4444',
        sorted: '#8B5CF6'
      }
    }
  }

  assertEquals(mockStep.stepId, 'test-step-1', 'stepId should match')
  assert(Array.isArray(mockStep.arrayState.data), 'arrayState.data should be array')
  assertEquals(mockStep.operation.type, 'compare', 'operation type should be compare')
  assertEquals(mockStep.visualHints.animationType, 'highlight', 'animation type should be highlight')
  
  console.log('✅ AlgorithmStep 型別定義測試通過')
}

// 測試視覺化映射
function testVisualizationMapping() {
  console.log('🧪 測試視覺化映射...')
  
  // 測試預設映射
  assertEquals(defaultVisualizationMapping.compare.color, '#3B82F6', 'compare color should be blue')
  assertEquals(defaultVisualizationMapping.swap.color, '#EF4444', 'swap color should be red')
  
  // 測試視覺提示生成
  const compareHints = getVisualHints('compare')
  assertEquals(compareHints.animationType, 'highlight', 'compare animation should be highlight')
  assertEquals(compareHints.duration, 300, 'compare duration should be 300ms')
  
  const swapHints = getVisualHints('swap')
  assertEquals(swapHints.animationType, 'slide', 'swap animation should be slide')
  assertEquals(swapHints.duration, 500, 'swap duration should be 500ms')
  
  console.log('✅ 視覺化映射測試通過')
}

// 測試複雜度資訊
function testComplexityInfo() {
  console.log('🧪 測試複雜度資訊...')
  
  const bubbleSortInfo = getComplexityInfo('bubble-sort')
  assertEquals(bubbleSortInfo.bestCase, 'O(n)', 'bubble sort best case should be O(n)')
  assertEquals(bubbleSortInfo.worstCase, 'O(n²)', 'bubble sort worst case should be O(n²)')
  assert(bubbleSortInfo.isStable, 'bubble sort should be stable')
  assert(bubbleSortInfo.isInPlace, 'bubble sort should be in-place')
  
  const quickSortInfo = getComplexityInfo('quick-sort')
  assertEquals(quickSortInfo.averageCase, 'O(n log n)', 'quick sort average should be O(n log n)')
  assert(!quickSortInfo.isStable, 'quick sort should not be stable')
  
  console.log('✅ 複雜度資訊測試通過')
}

// 測試演算法元資訊
function testAlgorithmMetadata() {
  console.log('🧪 測試演算法元資訊...')
  
  const bubbleSortMeta = getAlgorithmMetadata('bubble-sort')
  assertEquals(bubbleSortMeta.name, '氣泡排序', 'bubble sort name should be 氣泡排序')
  assert(bubbleSortMeta.description.includes('冒泡'), 'description should contain 冒泡')
  assert(bubbleSortMeta.useCases.includes('教學演示'), 'use cases should include 教學演示')
  
  const mergeSortMeta = getAlgorithmMetadata('merge-sort')
  assertEquals(mergeSortMeta.name, '合併排序', 'merge sort name should be 合併排序')
  assert(mergeSortMeta.prosAndCons.cons.includes('額外記憶體需求'), 'cons should include memory requirement')
  
  console.log('✅ 演算法元資訊測試通過')
}

// 測試工具函數
function testUtilityFunctions() {
  console.log('🧪 測試工具函數...')
  
  // 測試步驟 ID 生成器
  const generator = createStepIdGenerator('bubble-sort')
  
  const id1 = generator()
  const id2 = generator()
  const id3 = generator()

  assertEquals(id1, 'bubble-sort-step-1', 'first ID should be bubble-sort-step-1')
  assertEquals(id2, 'bubble-sort-step-2', 'second ID should be bubble-sort-step-2')
  assertEquals(id3, 'bubble-sort-step-3', 'third ID should be bubble-sort-step-3')
  
  // 測試驗證函數
  const validStep = {
    stepId: 'test-1',
    sequenceNumber: 1,
    arrayState: {
      data: [1, 2, 3],
      highlightedIndices: [0],
      sortedRegions: []
    },
    operation: {
      type: 'compare',
      description: 'test',
      complexity: { time: 'O(1)', space: 'O(1)' }
    },
    visualHints: {
      animationType: 'highlight',
      duration: 300,
      colors: { comparing: '#000', swapping: '#000', sorted: '#000' }
    }
  }

  const invalidStep = {
    stepId: 123,
    sequenceNumber: 'invalid'
  }

  assert(validateAlgorithmStep(validStep), 'valid step should pass validation')
  assert(!validateAlgorithmStep(invalidStep), 'invalid step should fail validation')
  assert(!validateAlgorithmStep(null), 'null should fail validation')
  
  console.log('✅ 工具函數測試通過')
}

// 執行所有測試
function runAllTests() {
  console.log('🚀 開始執行 AlgorithmStep 型別與映射測試\n')
  
  try {
    testAlgorithmStepInterface()
    testVisualizationMapping()
    testComplexityInfo()
    testAlgorithmMetadata()
    testUtilityFunctions()
    
    console.log('\n🎉 所有測試通過！AlgorithmStep 型別定義與視覺化映射功能正常')
  } catch (error) {
    console.error('\n❌ 測試失敗:', error)
    throw error
  }
}

// 導出測試函數供外部調用
export { runAllTests }

// 如果直接執行此文件，則運行測試
if (typeof window === 'undefined') {
  // Node.js 環境
  runAllTests()
}
