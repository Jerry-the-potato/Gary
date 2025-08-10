/// <reference types="vite/client" />
/// <reference types="@webgpu/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// WebGPU global declarations
declare global {
  interface Navigator {
    gpu?: GPU
  }
  
  interface Window {
    webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number
    mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number
  }
}

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Asset imports
declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

// WebGPU UI specific types
declare namespace WebGPUUI {
  interface UIState {
    isPlaying: boolean
    speed: number
  }
  
  interface UIElement {
    x: number
    y: number
    width: number
    height: number
    textureRegion: {
      x: number
      y: number
      width: number
      height: number
    }
  }
  
  interface UIHitbox {
    x: number
    y: number
    width: number
    height: number
    id: string
  }
}

export {}
