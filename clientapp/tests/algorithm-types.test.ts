/**
 * AlgorithmStep 型別與視覺化映射測試
 * 使用 vitest 測試框架
 */

import { describe, it, expect } from 'vitest'
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

describe('🧪 AlgorithmStep 型別與視覺化映射測試', () => {
  
  it('應該正確取得視覺化提示', () => {
    const compareHints = getVisualHints('compare')
    expect(compareHints).toBeDefined()
    expect(compareHints.animationType).toBe('highlight')
    expect(typeof compareHints.duration).toBe('number')
    expect(typeof compareHints.colors.comparing).toBe('string')
    
    const swapHints = getVisualHints('swap')
    expect(swapHints.animationType).toBe('slide')
    expect(typeof swapHints.colors.swapping).toBe('string')
  })

  it('應該正確取得複雜度資訊', () => {
    const bubbleComplexity = getComplexityInfo('bubble-sort')
    expect(bubbleComplexity).toBeDefined()
    expect(bubbleComplexity.bestCase).toBe('O(n)')
    expect(bubbleComplexity.averageCase).toBe('O(n²)')
    expect(bubbleComplexity.worstCase).toBe('O(n²)')
    expect(bubbleComplexity.spaceComplexity).toBe('O(1)')
    expect(bubbleComplexity.isStable).toBe(true)
    expect(bubbleComplexity.isInPlace).toBe(true)
  })

  it('應該正確取得演算法元資訊', () => {
    const bubbleMetadata = getAlgorithmMetadata('bubble-sort')
    expect(bubbleMetadata).toBeDefined()
    expect(bubbleMetadata.name).toBe('氣泡排序')
    expect(typeof bubbleMetadata.description).toBe('string')
    expect(Array.isArray(bubbleMetadata.useCases)).toBe(true)
    expect(Array.isArray(bubbleMetadata.prosAndCons.pros)).toBe(true)
    expect(Array.isArray(bubbleMetadata.prosAndCons.cons)).toBe(true)
  })

  it('應該正確生成步驟 ID', () => {
    const generator = createStepIdGenerator('bubble-sort')
    expect(typeof generator).toBe('function')
    
    const id1 = generator()
    const id2 = generator()
    
    expect(typeof id1).toBe('string')
    expect(typeof id2).toBe('string')
    expect(id1).not.toBe(id2) // 確保 ID 唯一性
    expect(id1).toContain('BUBBLE_SORT')
    expect(id2).toContain('BUBBLE_SORT')
  })

  it('應該正確驗證演算法步驟', () => {
    const validStep: AlgorithmStep = {
      stepId: 'BUBBLE_SORT_TEST_001',
      sequenceNumber: 1,
      arrayState: {
        data: [3, 1, 2],
        highlightedIndices: [0, 1],
        sortedRegions: []
      },
      operation: {
        type: 'compare',
        description: '比較元素 3 和 1',
        complexity: { time: 'O(1)', space: 'O(1)' }
      },
      visualHints: getVisualHints('compare')
    }

    expect(validateAlgorithmStep(validStep)).toBe(true)

    // 測試無效步驟
    const invalidStep = {
      stepId: '',
      sequenceNumber: -1,
      // 缺少必要字段
    }

    expect(validateAlgorithmStep(invalidStep)).toBe(false)
  })

  it('應該支援所有演算法類型', () => {
    const algorithms: SupportedAlgorithms[] = [
      'bubble-sort',
      'selection-sort', 
      'insertion-sort'
    ]

    algorithms.forEach(algorithm => {
      expect(() => getComplexityInfo(algorithm)).not.toThrow()
      expect(() => getAlgorithmMetadata(algorithm)).not.toThrow()
      expect(() => createStepIdGenerator(algorithm)).not.toThrow()
    })
  })

  it('應該支援所有操作類型', () => {
    const operations: OperationType[] = [
      'compare',
      'swap',
      'insert',
      'merge'
    ]

    operations.forEach(operation => {
      expect(() => getVisualHints(operation)).not.toThrow()
      const hints = getVisualHints(operation)
      expect(hints).toBeDefined()
      expect(typeof hints.animationType).toBe('string')
      expect(typeof hints.duration).toBe('number')
      expect(typeof hints.colors).toBe('object')
    })
  })

  it('應該提供正確的預設視覺化映射', () => {
    expect(defaultVisualizationMapping).toBeDefined()
    expect(typeof defaultVisualizationMapping.compare).toBe('object')
    expect(typeof defaultVisualizationMapping.swap).toBe('object')
    expect(typeof defaultVisualizationMapping.insert).toBe('object')
    expect(typeof defaultVisualizationMapping.merge).toBe('object')
  })
})
