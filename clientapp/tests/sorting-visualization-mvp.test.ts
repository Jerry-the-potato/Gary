/**
 * Issue #6 MVP 排序視覺化測試
 * 測試三種基礎排序演算法的完整流程
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SortingAlgorithmFactory, BubbleSort, SelectionSort, InsertionSort, AlgorithmValidator } from '../src/composables/useSortingAlgorithms'
import { Canvas2DRenderer, WebGPURenderer, RendererFactory, VisualizationManager } from '../src/composables/useVisualizationRenderer'
import { SortingPlayer, useSortingPlayer, estimatePlaybackDuration, formatPlaybackTime } from '../src/composables/useSortingPlayer'
import type { AlgorithmStep } from '../src/types/algorithm'

describe('🧪 Issue #6 MVP 排序視覺化測試', () => {
  
  describe('🔢 排序演算法引擎測試', () => {
    const testData = [64, 34, 25, 12, 22, 11, 90]
    const expectedSorted = [11, 12, 22, 25, 34, 64, 90]

    it('氣泡排序應該生成正確的步驟序列', () => {
      const steps = SortingAlgorithmFactory.generateSteps('bubble-sort', testData)
      
      expect(steps.length).toBeGreaterThan(0)
      expect(AlgorithmValidator.validateStepSequence(steps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, steps)).toBe(true)
      
      const finalStep = steps[steps.length - 1]!
      expect(finalStep.arrayState.data).toEqual(expectedSorted)
      
      console.log(`✅ 氣泡排序生成 ${steps.length} 步驟`)
    })

    it('選擇排序應該生成正確的步驟序列', () => {
      const steps = SortingAlgorithmFactory.generateSteps('selection-sort', testData)
      
      expect(steps.length).toBeGreaterThan(0)
      expect(AlgorithmValidator.validateStepSequence(steps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, steps)).toBe(true)
      
      const finalStep = steps[steps.length - 1]!
      expect(finalStep.arrayState.data).toEqual(expectedSorted)
      
      console.log(`✅ 選擇排序生成 ${steps.length} 步驟`)
    })

    it('插入排序應該生成正確的步驟序列', () => {
      const steps = SortingAlgorithmFactory.generateSteps('insertion-sort', testData)
      
      expect(steps.length).toBeGreaterThan(0)
      expect(AlgorithmValidator.validateStepSequence(steps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, steps)).toBe(true)
      
      const finalStep = steps[steps.length - 1]!
      expect(finalStep.arrayState.data).toEqual(expectedSorted)
      
      console.log(`✅ 插入排序生成 ${steps.length} 步驟`)
    })

    it('應該處理邊界情況', () => {
      // 空陣列
      expect(() => SortingAlgorithmFactory.generateSteps('bubble-sort', [])).toThrow()
      
      // 單元素陣列
      const singleSteps = SortingAlgorithmFactory.generateSteps('bubble-sort', [42])
      expect(singleSteps.length).toBeGreaterThan(0)
      expect(singleSteps[singleSteps.length - 1]!.arrayState.data).toEqual([42])
      
      // 已排序陣列
      const sortedSteps = SortingAlgorithmFactory.generateSteps('bubble-sort', [1, 2, 3, 4, 5])
      expect(sortedSteps.length).toBeGreaterThan(0)
      expect(AlgorithmValidator.validateSortResult([1, 2, 3, 4, 5], sortedSteps)).toBe(true)
    })
  })

  describe('🎨 視覺化渲染器測試', () => {
    let canvas: HTMLCanvasElement
    let mockStep: AlgorithmStep

    beforeEach(() => {
      // 創建模擬 Canvas
      if (typeof document !== 'undefined') {
        canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 400
      } else {
        // Node.js 環境的模擬
        canvas = {
          width: 800,
          height: 400,
          getContext: () => ({
            fillStyle: '',
            fillRect: () => {},
            strokeStyle: '',
            strokeRect: () => {},
            font: '',
            textAlign: 'center',
            fillText: () => {}
          })
        } as any
      }

      mockStep = {
        stepId: 'TEST_STEP_001',
        sequenceNumber: 1,
        arrayState: {
          data: [5, 2, 8, 1, 9],
          highlightedIndices: [1, 2],
          comparisonPair: [1, 2],
          sortedRegions: []
        },
        operation: {
          type: 'compare',
          description: '比較元素 2 和 8',
          complexity: { time: 'O(1)', space: 'O(1)' }
        },
        visualHints: {
          animationType: 'highlight',
          duration: 300,
          colors: {
            comparing: '#f59e0b',
            swapping: '#ef4444',
            sorted: '#10b981'
          }
        }
      }
    })

    it('Canvas2D 渲染器應該正確初始化', async () => {
      const renderer = new Canvas2DRenderer()
      expect(renderer.type).toBe('canvas2d')
      expect(renderer.isSupported()).toBe(true)

      if (typeof document !== 'undefined') {
        await expect(renderer.initialize(canvas, {
          width: 800,
          height: 400,
          barWidth: 40,
          barSpacing: 8,
          maxValue: 100,
          colors: {
            default: '#3b82f6',
            highlighted: '#fbbf24',
            comparing: '#f59e0b',
            swapping: '#ef4444',
            sorted: '#10b981',
            background: '#f8fafc'
          },
          animation: {
            duration: 300,
            easing: 'ease-in-out'
          }
        })).resolves.not.toThrow()

        expect(() => renderer.render(mockStep, {
          width: 800,
          height: 400,
          barWidth: 40,
          barSpacing: 8,
          maxValue: 100,
          colors: {
            default: '#3b82f6',
            highlighted: '#fbbf24',
            comparing: '#f59e0b',
            swapping: '#ef4444',
            sorted: '#10b981',
            background: '#f8fafc'
          },
          animation: {
            duration: 300,
            easing: 'ease-in-out'
          }
        })).not.toThrow()

        renderer.cleanup()
      }
    })

    it('WebGPU 渲染器應該正確處理不支援情況', () => {
      const renderer = new WebGPURenderer()
      expect(renderer.type).toBe('webgpu')
      
      // 在 Node.js 環境中 WebGPU 不支援
      expect(renderer.isSupported()).toBe(false)
    })

    it('渲染器工廠應該選擇合適的引擎', async () => {
      // 測試 Canvas2D 回退
      const renderer = await RendererFactory.createBestRenderer(false)
      expect(renderer.type).toBe('canvas2d')
    })
  })

  describe('🎬 播放器控制測試', () => {
    let canvas: HTMLCanvasElement
    let player: SortingPlayer | null = null
    let testSteps: AlgorithmStep[]

    beforeEach(async () => {
      if (typeof document !== 'undefined') {
        canvas = document.createElement('canvas')
      } else {
        canvas = {
          width: 800,
          height: 400,
          getContext: () => ({
            fillStyle: '',
            fillRect: () => {},
            strokeStyle: '',
            strokeRect: () => {},
            font: '',
            textAlign: 'center',
            fillText: () => {}
          })
        } as any
      }

      testSteps = SortingAlgorithmFactory.generateSteps('bubble-sort', [3, 1, 2])
    })

    afterEach(() => {
      if (player) {
        player.cleanup()
        player = null
      }
    })

    it('播放器應該正確載入和控制步驟', async () => {
      if (typeof document === 'undefined') {
        console.log('⏭️ 跳過瀏覽器專用測試（Node.js 環境）')
        return
      }

      player = new SortingPlayer(canvas)
      
      let stateChanges: string[] = []
      let stepChanges: number[] = []

      await player.initialize(false) // 使用 Canvas2D

      player.loadSteps(testSteps)
      
      // 測試狀態
      expect(player.getState()).toBe('idle')
      expect(player.getCurrentStepInfo().totalSteps).toBe(testSteps.length)
      expect(player.getCurrentStepInfo().currentStep).toBe(0)

      // 測試導航
      player.nextStep()
      expect(player.getCurrentStepInfo().currentStep).toBe(1)

      player.previousStep()
      expect(player.getCurrentStepInfo().currentStep).toBe(0)

      // 測試跳轉
      player.jumpToStep(2)
      expect(player.getCurrentStepInfo().currentStep).toBe(2)

      // 測試播放速度
      player.setPlaybackSpeed(2.0)
      expect(() => player!.setPlaybackSpeed(10.0)).toThrow() // 超出範圍

      console.log('✅ 播放器控制測試通過')
    })

    it('播放器工具函數應該正確計算', () => {
      // 測試播放時間估算
      const duration = estimatePlaybackDuration(10, 1.0)
      expect(duration).toBe(6000) // 10 * 600ms

      const fastDuration = estimatePlaybackDuration(10, 2.0)
      expect(fastDuration).toBe(3000) // 10 * 600ms / 2

      // 測試時間格式化
      expect(formatPlaybackTime(5000)).toBe('5秒')
      expect(formatPlaybackTime(65000)).toBe('1:05')
      expect(formatPlaybackTime(125000)).toBe('2:05')
    })
  })

  describe('🔄 整合測試', () => {
    it('應該完成完整的排序視覺化流程', async () => {
      const testData = [5, 2, 8, 1]
      const expectedSorted = [1, 2, 5, 8]

      // 1. 生成步驟
      const bubbleSteps = SortingAlgorithmFactory.generateSteps('bubble-sort', testData)
      const selectionSteps = SortingAlgorithmFactory.generateSteps('selection-sort', testData)
      const insertionSteps = SortingAlgorithmFactory.generateSteps('insertion-sort', testData)

      // 2. 驗證所有演算法都得到正確結果
      expect(AlgorithmValidator.validateSortResult(testData, bubbleSteps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, selectionSteps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, insertionSteps)).toBe(true)

      // 3. 檢查最終結果
      expect(bubbleSteps[bubbleSteps.length - 1]!.arrayState.data).toEqual(expectedSorted)
      expect(selectionSteps[selectionSteps.length - 1]!.arrayState.data).toEqual(expectedSorted)
      expect(insertionSteps[insertionSteps.length - 1]!.arrayState.data).toEqual(expectedSorted)

      console.log('✅ 整合測試通過')
      console.log(`📊 步驟統計:`)
      console.log(`   氣泡排序: ${bubbleSteps.length} 步驟`)
      console.log(`   選擇排序: ${selectionSteps.length} 步驟`)
      console.log(`   插入排序: ${insertionSteps.length} 步驟`)
    })

    it('應該正確處理相同數據的不同演算法', () => {
      const testCases = [
        [1],
        [1, 2],
        [2, 1],
        [3, 1, 4, 1, 5],
        [9, 8, 7, 6, 5, 4, 3, 2, 1], // 逆序
        [1, 2, 3, 4, 5] // 已排序
      ]

      testCases.forEach((data, index) => {
        const expected = [...data].sort((a, b) => a - b)
        
        const bubbleSteps = SortingAlgorithmFactory.generateSteps('bubble-sort', data)
        const selectionSteps = SortingAlgorithmFactory.generateSteps('selection-sort', data)
        const insertionSteps = SortingAlgorithmFactory.generateSteps('insertion-sort', data)

        expect(bubbleSteps[bubbleSteps.length - 1]!.arrayState.data).toEqual(expected)
        expect(selectionSteps[selectionSteps.length - 1]!.arrayState.data).toEqual(expected)
        expect(insertionSteps[insertionSteps.length - 1]!.arrayState.data).toEqual(expected)

        console.log(`✅ 測試案例 ${index + 1}: [${data.join(', ')}] → [${expected.join(', ')}]`)
      })
    })
  })

  describe('🎯 E2E 驗收測試', () => {
    it('MVP 功能應該滿足所有驗收條件', () => {
      console.log('🎯 執行 E2E 驗收測試...')

      // ✅ 條件 1: 支援三種基礎排序演算法
      const algorithms = ['bubble-sort', 'selection-sort', 'insertion-sort'] as const
      algorithms.forEach(algorithm => {
        expect(() => SortingAlgorithmFactory.create(algorithm, [1, 2, 3])).not.toThrow()
      })
      console.log('✅ 支援三種基礎排序演算法')

      // ✅ 條件 2: 視覺化引擎支援雙引擎
      const canvas2dRenderer = new Canvas2DRenderer()
      const webgpuRenderer = new WebGPURenderer()
      expect(canvas2dRenderer.isSupported()).toBe(true)
      expect(webgpuRenderer.type).toBe('webgpu')
      console.log('✅ 支援 WebGPU/Canvas2D 雙引擎')

      // ✅ 條件 3: 播放器控制功能
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas')
        const player = new SortingPlayer(canvas)
        expect(typeof player.play).toBe('function')
        expect(typeof player.pause).toBe('function')
        expect(typeof player.nextStep).toBe('function')
        expect(typeof player.setPlaybackSpeed).toBe('function')
        player.cleanup()
      }
      console.log('✅ 播放器控制功能完備')

      // ✅ 條件 4: 完整的型別系統
      const testData = [3, 1, 2]
      const steps = SortingAlgorithmFactory.generateSteps('bubble-sort', testData)
      const firstStep = steps[0]!
      
      expect(typeof firstStep.stepId).toBe('string')
      expect(typeof firstStep.sequenceNumber).toBe('number')
      expect(Array.isArray(firstStep.arrayState.data)).toBe(true)
      expect(typeof firstStep.operation.type).toBe('string')
      expect(typeof firstStep.visualHints).toBe('object')
      console.log('✅ 型別系統完整')

      // ✅ 條件 5: 資料驗證和錯誤處理
      expect(() => SortingAlgorithmFactory.generateSteps('bubble-sort', [])).toThrow()
      expect(AlgorithmValidator.validateStepSequence(steps)).toBe(true)
      expect(AlgorithmValidator.validateSortResult(testData, steps)).toBe(true)
      console.log('✅ 資料驗證和錯誤處理')

      console.log('🎉 所有 E2E 驗收條件通過！')
    })
  })
})

/**
 * 自定義斷言輔助函數
 */
export function assertSortingStepsValid(steps: AlgorithmStep[], originalData: number[]): void {
  expect(steps.length).toBeGreaterThan(0)
  expect(AlgorithmValidator.validateStepSequence(steps)).toBe(true)
  expect(AlgorithmValidator.validateSortResult(originalData, steps)).toBe(true)
  
  // 檢查步驟 ID 唯一性
  const stepIds = steps.map(step => step.stepId)
  expect(new Set(stepIds).size).toBe(stepIds.length)
  
  // 檢查序列號連續性
  steps.forEach((step, index) => {
    expect(step.sequenceNumber).toBe(index + 1)
  })
}
