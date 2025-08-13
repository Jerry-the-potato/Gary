/**
 * Issue #8: 控制面板與鍵盤可達性實作
 * 提供完整的無障礙功能支援
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface AccessibilityConfig {
  announceChanges: boolean
  keyboardShortcuts: boolean
  focusManagement: boolean
  screenReader: boolean
  highContrast: boolean
  reducedMotion: boolean
}

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
}

interface FocusableElement {
  element: HTMLElement
  priority: number
  group: string
}

export function useAccessibility() {
  // 狀態管理
  const config = ref<AccessibilityConfig>({
    announceChanges: true,
    keyboardShortcuts: true,
    focusManagement: true,
    screenReader: true,
    highContrast: false,
    reducedMotion: false
  })

  const keyboardShortcuts = ref<KeyboardShortcut[]>([])
  const focusableElements = ref<FocusableElement[]>([])
  const currentFocusGroup = ref<string>('main')

  // 檢測使用者偏好
  const prefersReducedMotion = computed(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const prefersHighContrast = computed(() => {
    return window.matchMedia('(prefers-contrast: high)').matches
  })

  const prefersColorScheme = computed(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // 螢幕閱讀器支援
  function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!config.value.announceChanges || !config.value.screenReader) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // 清理舊的公告
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 1000)
  }

  // 焦點管理
  function registerFocusableElement(element: HTMLElement, priority: number = 0, group: string = 'main') {
    focusableElements.value.push({ element, priority, group })
    // 按優先級排序
    focusableElements.value.sort((a, b) => a.priority - b.priority)
  }

  function unregisterFocusableElement(element: HTMLElement) {
    const index = focusableElements.value.findIndex(item => item.element === element)
    if (index !== -1) {
      focusableElements.value.splice(index, 1)
    }
  }

  function focusFirstElement(group?: string) {
    const targetGroup = group || currentFocusGroup.value
    const elements = focusableElements.value.filter(item => item.group === targetGroup)
    const firstElement = elements[0]?.element

    if (firstElement) {
      firstElement.focus()
      return true
    }
    return false
  }

  function focusLastElement(group?: string) {
    const targetGroup = group || currentFocusGroup.value
    const elements = focusableElements.value.filter(item => item.group === targetGroup)
    const lastElement = elements[elements.length - 1]?.element

    if (lastElement) {
      lastElement.focus()
      return true
    }
    return false
  }

  function moveFocusToNextElement(currentElement: HTMLElement) {
    const currentIndex = focusableElements.value.findIndex(item => item.element === currentElement)
    if (currentIndex !== -1 && currentIndex < focusableElements.value.length - 1) {
      const nextItem = focusableElements.value[currentIndex + 1]
      if (nextItem) {
        nextItem.element.focus()
        return true
      }
    }
    return false
  }

  function moveFocusToPreviousElement(currentElement: HTMLElement) {
    const currentIndex = focusableElements.value.findIndex(item => item.element === currentElement)
    if (currentIndex > 0) {
      const prevItem = focusableElements.value[currentIndex - 1]
      if (prevItem) {
        prevItem.element.focus()
        return true
      }
    }
    return false
  }

  // 鍵盤快捷鍵管理
  function registerKeyboardShortcut(shortcut: KeyboardShortcut) {
    keyboardShortcuts.value.push(shortcut)
  }

  function unregisterKeyboardShortcut(key: string, ctrlKey = false, altKey = false, metaKey = false) {
    const index = keyboardShortcuts.value.findIndex(shortcut =>
      shortcut.key === key &&
      (shortcut.ctrlKey || false) === ctrlKey &&
      (shortcut.altKey || false) === altKey &&
      (shortcut.metaKey || false) === metaKey
    )
    if (index !== -1) {
      keyboardShortcuts.value.splice(index, 1)
    }
  }

  function handleKeyboardEvent(event: KeyboardEvent) {
    if (!config.value.keyboardShortcuts) return

    // 不在輸入元素內處理快捷鍵
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return
    }

    const matchedShortcut = keyboardShortcuts.value.find(shortcut =>
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      (shortcut.ctrlKey || false) === event.ctrlKey &&
      (shortcut.altKey || false) === event.altKey &&
      (shortcut.metaKey || false) === event.metaKey
    )

    if (matchedShortcut) {
      event.preventDefault()
      matchedShortcut.action()

      // 向螢幕閱讀器公告執行的操作
      announceToScreenReader(`已執行: ${matchedShortcut.description}`)
    }
  }

  // ARIA 標籤輔助函數
  function createUniqueId(prefix: string = 'a11y'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  function setAriaLabel(element: HTMLElement, label: string) {
    element.setAttribute('aria-label', label)
  }

  function setAriaDescribedBy(element: HTMLElement, descriptionId: string) {
    element.setAttribute('aria-describedby', descriptionId)
  }

  function setAriaLive(element: HTMLElement, setting: 'off' | 'polite' | 'assertive') {
    element.setAttribute('aria-live', setting)
  }

  function setAriaExpanded(element: HTMLElement, expanded: boolean) {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  // 高對比模式處理
  function enableHighContrastMode() {
    document.documentElement.classList.add('high-contrast')
    config.value.highContrast = true
    announceToScreenReader('已啟用高對比模式')
  }

  function disableHighContrastMode() {
    document.documentElement.classList.remove('high-contrast')
    config.value.highContrast = false
    announceToScreenReader('已關閉高對比模式')
  }

  function toggleHighContrastMode() {
    if (config.value.highContrast) {
      disableHighContrastMode()
    } else {
      enableHighContrastMode()
    }
  }

  // 動畫減少模式處理
  function enableReducedMotion() {
    document.documentElement.classList.add('reduce-motion')
    config.value.reducedMotion = true
    announceToScreenReader('已啟用減少動畫模式')
  }

  function disableReducedMotion() {
    document.documentElement.classList.remove('reduce-motion')
    config.value.reducedMotion = false
    announceToScreenReader('已關閉減少動畫模式')
  }

  function toggleReducedMotion() {
    if (config.value.reducedMotion) {
      disableReducedMotion()
    } else {
      enableReducedMotion()
    }
  }

  // 取得所有鍵盤快捷鍵列表（用於幫助說明）
  function getKeyboardShortcutsList(): string[] {
    return keyboardShortcuts.value.map(shortcut => {
      let keyCombo = shortcut.key
      if (shortcut.ctrlKey) keyCombo = `Ctrl + ${keyCombo}`
      if (shortcut.altKey) keyCombo = `Alt + ${keyCombo}`
      if (shortcut.metaKey) keyCombo = `Cmd + ${keyCombo}`
      return `${keyCombo}: ${shortcut.description}`
    })
  }

  // 初始化和清理
  function initialize() {
    // 監聽媒體查詢變化
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        enableReducedMotion()
      } else {
        disableReducedMotion()
      }
    }

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        enableHighContrastMode()
      } else {
        disableHighContrastMode()
      }
    }

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    highContrastQuery.addEventListener('change', handleHighContrastChange)

    // 初始設定
    if (reducedMotionQuery.matches) {
      enableReducedMotion()
    }
    if (highContrastQuery.matches) {
      enableHighContrastMode()
    }

    // 鍵盤事件監聽
    document.addEventListener('keydown', handleKeyboardEvent)

    // 返回清理函數
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
      document.removeEventListener('keydown', handleKeyboardEvent)
    }
  }

  return {
    // 狀態
    config,
    prefersReducedMotion,
    prefersHighContrast,
    prefersColorScheme,
    currentFocusGroup,

    // 螢幕閱讀器
    announceToScreenReader,

    // 焦點管理
    registerFocusableElement,
    unregisterFocusableElement,
    focusFirstElement,
    focusLastElement,
    moveFocusToNextElement,
    moveFocusToPreviousElement,

    // 鍵盤快捷鍵
    registerKeyboardShortcut,
    unregisterKeyboardShortcut,
    getKeyboardShortcutsList,

    // ARIA 輔助
    createUniqueId,
    setAriaLabel,
    setAriaDescribedBy,
    setAriaLive,
    setAriaExpanded,

    // 高對比模式
    enableHighContrastMode,
    disableHighContrastMode,
    toggleHighContrastMode,

    // 動畫減少模式
    enableReducedMotion,
    disableReducedMotion,
    toggleReducedMotion,

    // 初始化
    initialize
  }
}
