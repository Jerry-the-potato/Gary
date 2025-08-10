export type Theme = 'light' | 'dark'

export interface ThemeColors {
  background: [number, number, number, number]
  primary: [number, number, number, number]
  text: [number, number, number, number]
  algorithmColors: {
    array: [number, number, number, number]
    compare: [number, number, number, number]
    sorted: [number, number, number, number]
    pivot: [number, number, number, number]
  }
}

export class ThemeManager {
  private currentTheme: Theme = 'light'
  private callbacks: Array<(theme: Theme) => void> = []

  constructor() {
    this.initializeTheme()
  }

  private initializeTheme() {
    // Check user preference
    const saved = localStorage.getItem('theme-preference') as Theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    this.currentTheme = saved || (systemPrefersDark ? 'dark' : 'light')
    this.applyTheme()
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', this.handleSystemThemeChange.bind(this))
  }

  private handleSystemThemeChange(e: MediaQueryListEvent) {
    const saved = localStorage.getItem('theme-preference')
    if (!saved) {
      this.currentTheme = e.matches ? 'dark' : 'light'
      this.applyTheme()
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme
    localStorage.setItem('theme-preference', theme)
    this.applyTheme()
  }

  getTheme(): Theme {
    return this.currentTheme
  }

  private applyTheme() {
    // Update DOM
    document.documentElement.setAttribute('data-theme', this.currentTheme)
    
    // Execute callbacks
    this.callbacks.forEach(callback => callback(this.currentTheme))
  }

  onThemeChange(callback: (theme: Theme) => void) {
    this.callbacks.push(callback)
  }

  getThemeColors(): ThemeColors {
    const isDark = this.currentTheme === 'dark'
    return {
      background: isDark ? [0.008, 0.024, 0.094, 1.0] : [1.0, 1.0, 1.0, 1.0],
      primary: isDark ? [0.376, 0.647, 0.984, 1.0] : [0.235, 0.510, 0.961, 1.0],
      text: isDark ? [0.945, 0.961, 0.976, 1.0] : [0.118, 0.161, 0.233, 1.0],
      algorithmColors: {
        array: isDark ? [0.376, 0.647, 0.984, 1.0] : [0.235, 0.510, 0.961, 1.0],
        compare: isDark ? [0.973, 0.444, 0.444, 1.0] : [0.937, 0.267, 0.267, 1.0],
        sorted: isDark ? [0.204, 0.827, 0.600, 1.0] : [0.063, 0.725, 0.506, 1.0],
        pivot: isDark ? [0.984, 0.749, 0.141, 1.0] : [0.964, 0.616, 0.043, 1.0]
      }
    }
  }
}

// Global theme manager instance
export const themeManager = new ThemeManager()
