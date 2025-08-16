import { beforeAll, beforeEach } from 'vitest'
import { WebGPUMockFactory } from './mocks/webgpu-simple.mock'

/**
 * WebGPU 測試設定
 * 在測試執行前自動安裝 WebGPU Mock
 */

// 全域測試設定：安裝 Mock
beforeAll(() => {
  console.log('🔧 設定 WebGPU 測試環境')

  // Mock matchMedia for theme manager
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
    writable: true,
  })

  WebGPUMockFactory.install()
})

// 每個測試重置統計
beforeEach(() => {
  WebGPUMockFactory.resetStats()
})

// 匯出工廠以供測試使用
export { WebGPUMockFactory }
export type { WebGPUMockStats } from './mocks/webgpu-simple.mock'
