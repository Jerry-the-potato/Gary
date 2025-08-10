/**
 * Vitest 測試環境設定
 */

import { Canvas } from 'canvas'

// 模擬瀏覽器 API
global.ResizeObserver = global.ResizeObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 使用 node-canvas 模擬 Canvas API
global.HTMLCanvasElement = global.HTMLCanvasElement || class {
  width = 800
  height = 400

  getContext(contextType: string) {
    if (contextType === '2d') {
      const canvas = new Canvas(this.width, this.height)
      return canvas.getContext('2d')
    }
    return null
  }
} as any

// 模擬 document.createElement
global.document = global.document || {
  createElement: (tagName: string) => {
    if (tagName === 'canvas') {
      return new global.HTMLCanvasElement()
    }
    return {}
  }
} as any

// 模擬 WebGPU (不支援)
global.navigator = global.navigator || {} as any
Object.defineProperty(global.navigator, 'gpu', {
  value: undefined,
  writable: true
})

console.log('🧪 測試環境設定完成')
