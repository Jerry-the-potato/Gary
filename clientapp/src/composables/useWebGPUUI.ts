import { onMounted, onBeforeUnmount, ref } from 'vue'
import { themeManager, type ThemeColors } from './themeManager'

export interface UIState {
  isPlaying: boolean
  speed: number
}

export function useWebGPUUI(canvasRef: { value: HTMLCanvasElement | null }) {
  const error = ref<string>('')
  const state = ref<UIState>({ isPlaying: false, speed: 1 })

  let device: GPUDevice | null = null
  let context: GPUCanvasContext | null = null
  let themeUniformBuffer: GPUBuffer | null = null

  const updateTheme = (themeColors: ThemeColors) => {
    if (!device || !themeUniformBuffer) return
    
    // Update theme data for WebGPU
    const themeData = new Float32Array([
      // is_dark_mode (float)
      themeManager.getTheme() === 'dark' ? 1.0 : 0.0, 0, 0, 0,
      // background_color (vec4)
      ...themeColors.background,
      // primary_color (vec4)  
      ...themeColors.primary,
      // text_color (vec4)
      ...themeColors.text
    ])
    
    // Write to GPU buffer
    device.queue.writeBuffer(themeUniformBuffer, 0, themeData)
  }

  const init = async () => {
    const canvas = canvasRef.value
    if (!canvas) return
    if (!('gpu' in navigator)) {
      error.value = '此瀏覽器不支援 WebGPU'
      return
    }
    const adapter = await (navigator as any).gpu.requestAdapter()
    if (!adapter) {
      error.value = '無法取得 GPU Adapter'
      return
    }
    device = await adapter.requestDevice()
    context = (canvas as any).getContext('webgpu')
    if (!context) {
      error.value = '無法取得 WebGPU Canvas Context'
      return
    }
    context.configure({ device: device!, format: 'bgra8unorm', alphaMode: 'opaque' })
    
    // Create theme uniform buffer
    themeUniformBuffer = device!.createBuffer({
      size: 64, // 16 floats (4 vec4s)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    
    // Set up theme change listener
    themeManager.onThemeChange(() => {
      updateTheme(themeManager.getThemeColors())
    })
    
    // Apply initial theme
    updateTheme(themeManager.getThemeColors())
    
    // Initial clear
    const encoder = device!.createCommandEncoder()
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        { view: context.getCurrentTexture().createView(), clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 }, loadOp: 'clear', storeOp: 'store' },
      ],
    })
    pass.end()
    device!.queue.submit([encoder.finish()])
  }

  const update = (partial: Partial<UIState>) => {
    state.value = { ...state.value, ...partial }
  }

  onMounted(init)
  onBeforeUnmount(() => {
    device?.destroy?.()
  })

  return { error, state, update }
}
