/**
 * 全域測試設定
 * 為測試環境提供必要的瀏覽器 API Mock
 */

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

console.log('🧪 測試環境設定完成')
