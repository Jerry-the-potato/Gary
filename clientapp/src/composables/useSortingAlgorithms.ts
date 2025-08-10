/**
 * 排序演算法實作引擎
 * 實作 Issue #6: MVP 三排序視覺化 (Bubble/Selection/Insertion)
 * 
 * 提供步驟化的演算法執行，生成 AlgorithmStep 序列
 */

import type { 
  AlgorithmStep, 
  SupportedAlgorithms,
  ArrayState,
  OperationInfo
} from '../types/algorithm'

import { 
  getVisualHints, 
  createStepIdGenerator 
} from './useAlgorithmMapping'

/**
 * 演算法實作基礎類別
 */
abstract class SortingAlgorithm {
  protected stepIdGenerator: ReturnType<typeof createStepIdGenerator>
  protected sequenceNumber = 0
  protected steps: AlgorithmStep[] = []

  constructor(
    protected algorithmType: SupportedAlgorithms,
    protected inputData: number[]
  ) {
    this.stepIdGenerator = createStepIdGenerator(algorithmType)
  }

  /**
   * 創建演算法步驟
   */
  protected createStep(
    arrayState: ArrayState,
    operation: OperationInfo
  ): AlgorithmStep {
    return {
      stepId: this.stepIdGenerator(),
      sequenceNumber: ++this.sequenceNumber,
      arrayState: {
        ...arrayState,
        data: [...arrayState.data] // 深度複製陣列
      },
      operation,
      visualHints: getVisualHints(operation.type)
    }
  }

  /**
   * 抽象方法：實作具體的排序演算法
   */
  abstract sort(): AlgorithmStep[]

  /**
   * 取得所有步驟
   */
  getSteps(): AlgorithmStep[] {
    return this.steps
  }

  /**
   * 重置演算法狀態
   */
  reset(): void {
    this.sequenceNumber = 0
    this.steps = []
    this.stepIdGenerator = createStepIdGenerator(this.algorithmType)
  }
}

/**
 * 氣泡排序實作
 */
export class BubbleSort extends SortingAlgorithm {
  sort(): AlgorithmStep[] {
    const data = [...this.inputData]
    const n = data.length
    
    if (n === 0) {
      throw new Error('無法對空陣列進行排序')
    }
    
    console.log(`🫧 開始氣泡排序，輸入: [${data.join(', ')}]`)
    
    for (let i = 0; i < n - 1; i++) {
      let hasSwapped = false
      
      for (let j = 0; j < n - i - 1; j++) {
        // 比較步驟
        this.steps.push(this.createStep(
          {
            data: [...data],
            highlightedIndices: [j, j + 1],
            comparisonPair: [j, j + 1],
            sortedRegions: i > 0 ? [{ start: n - i, end: n - 1 }] : []
          },
          {
            type: 'compare',
            description: `比較元素 ${data[j]} 和 ${data[j + 1]}`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          }
        ))

        // 如果需要交換
        if (data[j]! > data[j + 1]!) {
          // 交換步驟
          this.steps.push(this.createStep(
            {
              data: [...data],
              highlightedIndices: [j, j + 1],
              swapPair: [j, j + 1],
              sortedRegions: i > 0 ? [{ start: n - i, end: n - 1 }] : []
            },
            {
              type: 'swap',
              description: `交換元素 ${data[j]} 和 ${data[j + 1]}`,
              complexity: { time: 'O(1)', space: 'O(1)' }
            }
          ))

          // 實際交換
          const temp = data[j]!
          data[j] = data[j + 1]!
          data[j + 1] = temp
          hasSwapped = true
        }
      }

      // 一輪結束，標記已排序區域
      this.steps.push(this.createStep(
        {
          data: [...data],
          highlightedIndices: [n - i - 1],
          sortedRegions: [{ start: n - i - 1, end: n - 1 }]
        },
        {
          type: 'compare',
          description: `第 ${i + 1} 輪完成，元素 ${data[n - i - 1]} 已到達正確位置`,
          complexity: { time: 'O(n)', space: 'O(1)' }
        }
      ))

      // 早期終止優化
      if (!hasSwapped) {
        console.log(`✨ 第 ${i + 1} 輪無交換，排序提前完成`)
        break
      }
    }

    // 最終完成步驟
    this.steps.push(this.createStep(
      {
        data: [...data],
        highlightedIndices: [],
        sortedRegions: [{ start: 0, end: n - 1 }]
      },
      {
        type: 'compare',
        description: '氣泡排序完成',
        complexity: { time: 'O(n²)', space: 'O(1)' }
      }
    ))

    console.log(`✅ 氣泡排序完成，共 ${this.steps.length} 步驟`)
    console.log(`📊 結果: [${data.join(', ')}]`)
    
    return this.steps
  }
}

/**
 * 選擇排序實作
 */
export class SelectionSort extends SortingAlgorithm {
  sort(): AlgorithmStep[] {
    const data = [...this.inputData]
    const n = data.length

    if (n === 0) {
      throw new Error('無法對空陣列進行排序')
    }
    
    console.log(`🎯 開始選擇排序，輸入: [${data.join(', ')}]`)

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i

      // 尋找最小值的過程
      for (let j = i + 1; j < n; j++) {
        // 比較步驟
        this.steps.push(this.createStep(
          {
            data: [...data],
            highlightedIndices: [minIndex, j],
            comparisonPair: [minIndex, j],
            sortedRegions: i > 0 ? [{ start: 0, end: i - 1 }] : []
          },
          {
            type: 'compare',
            description: `比較最小值候選 ${data[minIndex]} 與 ${data[j]}`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          }
        ))

        // 更新最小值索引
        if (data[j]! < data[minIndex]!) {
          minIndex = j
          
          this.steps.push(this.createStep(
            {
              data: [...data],
              highlightedIndices: [minIndex],
              sortedRegions: i > 0 ? [{ start: 0, end: i - 1 }] : []
            },
            {
              type: 'compare',
              description: `找到新的最小值: ${data[minIndex]}`,
              complexity: { time: 'O(1)', space: 'O(1)' }
            }
          ))
        }
      }

      // 如果需要交換
      if (minIndex !== i) {
        this.steps.push(this.createStep(
          {
            data: [...data],
            highlightedIndices: [i, minIndex],
            swapPair: [i, minIndex],
            sortedRegions: i > 0 ? [{ start: 0, end: i - 1 }] : []
          },
          {
            type: 'swap',
            description: `將最小值 ${data[minIndex]} 交換到位置 ${i}`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          }
        ))

        // 實際交換
        const temp = data[i]!
        data[i] = data[minIndex]!
        data[minIndex] = temp
      }

      // 標記新的已排序區域
      this.steps.push(this.createStep(
        {
          data: [...data],
          highlightedIndices: [i],
          sortedRegions: [{ start: 0, end: i }]
        },
        {
          type: 'compare',
          description: `位置 ${i} 的元素 ${data[i]} 已確定`,
          complexity: { time: 'O(n)', space: 'O(1)' }
        }
      ))
    }

    // 最終完成步驟
    this.steps.push(this.createStep(
      {
        data: [...data],
        highlightedIndices: [],
        sortedRegions: [{ start: 0, end: n - 1 }]
      },
      {
        type: 'compare',
        description: '選擇排序完成',
        complexity: { time: 'O(n²)', space: 'O(1)' }
      }
    ))

    console.log(`✅ 選擇排序完成，共 ${this.steps.length} 步驟`)
    console.log(`📊 結果: [${data.join(', ')}]`)
    
    return this.steps
  }
}

/**
 * 插入排序實作
 */
export class InsertionSort extends SortingAlgorithm {
  sort(): AlgorithmStep[] {
    const data = [...this.inputData]
    const n = data.length
    
    if (n === 0) {
      throw new Error('無法對空陣列進行排序')
    }
    
    console.log(`📍 開始插入排序，輸入: [${data.join(', ')}]`)

    for (let i = 1; i < n; i++) {
      const key = data[i]!
      let j = i - 1

      // 顯示取出當前元素
      this.steps.push(this.createStep(
        {
          data: [...data],
          highlightedIndices: [i],
          sortedRegions: [{ start: 0, end: i - 1 }]
        },
        {
          type: 'compare',
          description: `取出元素 ${key}，準備插入到已排序區域`,
          complexity: { time: 'O(1)', space: 'O(1)' }
        }
      ))

      // 向左搜尋插入位置
      while (j >= 0 && data[j]! > key) {
        // 比較步驟
        this.steps.push(this.createStep(
          {
            data: [...data],
            highlightedIndices: [j, j + 1],
            comparisonPair: [j, j + 1],
            sortedRegions: [{ start: 0, end: i }]
          },
          {
            type: 'compare',
            description: `比較 ${data[j]} 與 ${key}，需要右移`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          }
        ))

        // 移動元素
        data[j + 1] = data[j]!
        
        this.steps.push(this.createStep(
          {
            data: [...data],
            highlightedIndices: [j + 1],
            sortedRegions: [{ start: 0, end: i }]
          },
          {
            type: 'insert',
            description: `將 ${data[j + 1]} 右移一位`,
            complexity: { time: 'O(1)', space: 'O(1)' }
          }
        ))

        j--
      }

      // 插入元素到正確位置
      data[j + 1] = key

      this.steps.push(this.createStep(
        {
          data: [...data],
          highlightedIndices: [j + 1],
          sortedRegions: [{ start: 0, end: i }]
        },
        {
          type: 'insert',
          description: `將 ${key} 插入到位置 ${j + 1}`,
          complexity: { time: 'O(1)', space: 'O(1)' }
        }
      ))

      // 顯示這一輪的結果
      this.steps.push(this.createStep(
        {
          data: [...data],
          highlightedIndices: [],
          sortedRegions: [{ start: 0, end: i }]
        },
        {
          type: 'compare',
          description: `第 ${i} 輪完成，前 ${i + 1} 個元素已排序`,
          complexity: { time: 'O(i)', space: 'O(1)' }
        }
      ))
    }

    // 最終完成步驟
    this.steps.push(this.createStep(
      {
        data: [...data],
        highlightedIndices: [],
        sortedRegions: [{ start: 0, end: n - 1 }]
      },
      {
        type: 'compare',
        description: '插入排序完成',
        complexity: { time: 'O(n²)', space: 'O(1)' }
      }
    ))

    console.log(`✅ 插入排序完成，共 ${this.steps.length} 步驟`)
    console.log(`📊 結果: [${data.join(', ')}]`)
    
    return this.steps
  }
}

/**
 * 演算法工廠
 */
export class SortingAlgorithmFactory {
  static create(
    algorithmType: 'bubble-sort' | 'selection-sort' | 'insertion-sort',
    inputData: number[]
  ): SortingAlgorithm {
    switch (algorithmType) {
      case 'bubble-sort':
        return new BubbleSort(algorithmType, inputData)
      case 'selection-sort':
        return new SelectionSort(algorithmType, inputData)
      case 'insertion-sort':
        return new InsertionSort(algorithmType, inputData)
      default:
        throw new Error(`不支援的演算法類型: ${algorithmType}`)
    }
  }

  /**
   * 快速生成步驟序列
   */
  static generateSteps(
    algorithmType: 'bubble-sort' | 'selection-sort' | 'insertion-sort',
    inputData: number[]
  ): AlgorithmStep[] {
    const algorithm = this.create(algorithmType, inputData)
    return algorithm.sort()
  }
}

/**
 * 演算法驗證工具
 */
export class AlgorithmValidator {
  /**
   * 驗證排序結果是否正確
   */
  static validateSortResult(original: number[], steps: AlgorithmStep[]): boolean {
    if (steps.length === 0) return false
    
    const finalStep = steps[steps.length - 1]!
    const sortedData = finalStep.arrayState.data
    const expectedSorted = [...original].sort((a, b) => a - b)
    
    return JSON.stringify(sortedData) === JSON.stringify(expectedSorted)
  }

  /**
   * 驗證步驟序列的完整性
   */
  static validateStepSequence(steps: AlgorithmStep[]): boolean {
    if (steps.length === 0) return false
    
    // 檢查序列號連續性
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!
      if (step.sequenceNumber !== i + 1) {
        console.error(`序列號不連續: 期望 ${i + 1}，實際 ${step.sequenceNumber}`)
        return false
      }
    }
    
    // 檢查步驟 ID 唯一性
    const stepIds = new Set(steps.map(step => step.stepId))
    if (stepIds.size !== steps.length) {
      console.error('步驟 ID 不唯一')
      return false
    }
    
    return true
  }
}
