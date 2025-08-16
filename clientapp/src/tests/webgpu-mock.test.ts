import { describe, it, expect, beforeEach } from 'vitest'
import { WebGPUMockFactory } from './webgpu-test-setup'
import './webgpu-types.d.ts'

// WebGPU 常數定義 (測試環境)
const mockGPUBufferUsage = {
  MAP_READ: 0x0001,
  MAP_WRITE: 0x0002,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  INDEX: 0x0010,
  VERTEX: 0x0020,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
  INDIRECT: 0x0100,
  QUERY_RESOLVE: 0x0200
}

const mockGPUTextureUsage = {
  COPY_SRC: 0x01,
  COPY_DST: 0x02,
  TEXTURE_BINDING: 0x04,
  STORAGE_BINDING: 0x08,
  RENDER_ATTACHMENT: 0x10
}

const mockGPUMapMode = {
  READ: 0x0001,
  WRITE: 0x0002
}

// 設置全域常數
Object.assign(globalThis, {
  GPUBufferUsage: mockGPUBufferUsage,
  GPUTextureUsage: mockGPUTextureUsage,
  GPUMapMode: mockGPUMapMode
})

describe('WebGPU Mock 基礎設施', () => {
  beforeEach(() => {
    WebGPUMockFactory.resetStats()
  })

  describe('Mock 安裝和配置', () => {
    it('應該正確安裝 WebGPU Mock', () => {
      expect(WebGPUMockFactory.isInstalled()).toBe(true)
      expect((navigator as any).gpu).toBeDefined()
      expect((navigator as any).gpu.__mock).toBe(true)
    })

    it('應該提供基本的 WebGPU API', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      expect(adapter).toBeTruthy()
      expect((adapter as any).__mock).toBe(true)
    })

    it('應該能夠創建 GPU 設備', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      expect(device).toBeTruthy()
      expect((device as any).__mock).toBe(true)
      expect(device.features).toBeDefined()
      expect(device.limits).toBeDefined()
      expect(device.queue).toBeDefined()
    })
  })

  describe('統計和追蹤', () => {
    it('應該正確追蹤 Adapter 請求', async () => {
      const initialStats = WebGPUMockFactory.getStats()
      expect(initialStats.adaptersRequested).toBe(0)

      await (navigator as any).gpu.requestAdapter()
      await (navigator as any).gpu.requestAdapter()

      const stats = WebGPUMockFactory.getStats()
      expect(stats.adaptersRequested).toBe(2)
    })

    it('應該正確追蹤 Device 創建', async () => {
      WebGPUMockFactory.resetStats() // 確保重置統計

      const adapter = await (navigator as any).gpu.requestAdapter()

      const initialStats = WebGPUMockFactory.getStats()
      expect(initialStats.devicesCreated).toBe(0)

      await adapter!.requestDevice()
      await adapter!.requestDevice()

      const stats = WebGPUMockFactory.getStats()
      expect(stats.devicesCreated).toBe(2)
    })

    it('應該能夠重置統計資料', async () => {
      await (navigator as any).gpu.requestAdapter()

      let stats = WebGPUMockFactory.getStats()
      expect(stats.adaptersRequested).toBeGreaterThan(0)

      WebGPUMockFactory.resetStats()

      stats = WebGPUMockFactory.getStats()
      expect(stats.adaptersRequested).toBe(0)
    })
  })

  describe('Buffer 操作', () => {
    it('應該能夠創建和操作 Buffer', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const buffer = device.createBuffer({
        size: 1024,
        usage: mockGPUBufferUsage.VERTEX | mockGPUBufferUsage.COPY_DST
      })

      expect(buffer).toBeTruthy()
      expect((buffer as any).__mock).toBe(true)
      expect(buffer.size).toBe(1024)
      expect(buffer.mapState).toBe('unmapped')

      const stats = WebGPUMockFactory.getStats()
      expect(stats.buffersCreated).toBe(1)
    })

    it('應該支援 Buffer 映射操作', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const buffer = device.createBuffer({
        size: 256,
        usage: mockGPUBufferUsage.MAP_READ | mockGPUBufferUsage.COPY_DST
      })

      await buffer.mapAsync(mockGPUMapMode.READ)
      expect(buffer.mapState).toBe('mapped')

      const mappedRange = buffer.getMappedRange()
      expect(mappedRange).toBeInstanceOf(ArrayBuffer)
      expect(mappedRange.byteLength).toBe(256)

      buffer.unmap()
      expect(buffer.mapState).toBe('unmapped')
    })
  })

  describe('Texture 操作', () => {
    it('應該能夠創建 Texture', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const texture = device.createTexture({
        size: { width: 512, height: 512 },
        format: 'rgba8unorm',
        usage: mockGPUTextureUsage.TEXTURE_BINDING | mockGPUTextureUsage.COPY_DST
      })

      expect(texture).toBeTruthy()
      expect((texture as any).__mock).toBe(true)
      expect(texture.width).toBe(512)
      expect(texture.height).toBe(512)
      expect(texture.format).toBe('rgba8unorm')

      const stats = WebGPUMockFactory.getStats()
      expect(stats.texturesCreated).toBe(1)
    })

    it('應該能夠創建 Texture View', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const texture = device.createTexture({
        size: { width: 256, height: 256 },
        format: 'rgba8unorm',
        usage: mockGPUTextureUsage.TEXTURE_BINDING
      })

      const view = texture.createView()
      expect(view).toBeTruthy()
      expect((view as any).__mock).toBe(true)
    })
  })

  describe('Render Pipeline 和渲染', () => {
    it('應該能夠創建 Shader Module', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const shaderCode = `
        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
          return vec4f(0.0, 0.0, 0.0, 1.0);
        }

        @fragment
        fn fs_main() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0);
        }
      `

      const shaderModule = device.createShaderModule({ code: shaderCode })
      expect(shaderModule).toBeTruthy()
      expect((shaderModule as any).__mock).toBe(true)
      expect((shaderModule as any).code).toBe(shaderCode)
    })

    it('應該能夠創建 Render Pipeline', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const shaderModule = device.createShaderModule({
        code: `
          @vertex
          fn vs_main() -> @builtin(position) vec4f {
            return vec4f(0.0);
          }
          @fragment
          fn fs_main() -> @location(0) vec4f {
            return vec4f(1.0);
          }
        `
      })

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main'
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{ format: 'bgra8unorm' }]
        }
      })

      expect(pipeline).toBeTruthy()
      expect((pipeline as any).__mock).toBe(true)
    })

    it('應該能夠執行渲染命令', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const commandEncoder = device.createCommandEncoder()
      expect(commandEncoder).toBeTruthy()
      expect((commandEncoder as any).__mock).toBe(true)

      // 創建簡單的渲染目標
      const texture = device.createTexture({
        size: { width: 256, height: 256 },
        format: 'rgba8unorm',
        usage: mockGPUTextureUsage.RENDER_ATTACHMENT
      })

      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: texture.createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }]
      })

      expect(renderPass).toBeTruthy()
      expect((renderPass as any).__mock).toBe(true)

      renderPass.end()
      const commandBuffer = commandEncoder.finish()

      expect(commandBuffer).toBeTruthy()
      expect((commandBuffer as any).__mock).toBe(true)

      device.queue.submit([commandBuffer])

      const stats = WebGPUMockFactory.getStats()
      expect(stats.renderPasses).toBe(1)
      expect(stats.commandsExecuted).toBe(1)
    })
  })

  describe('Canvas Context', () => {
    it('應該能夠獲取 WebGPU Canvas Context', () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgpu')

      expect(context).toBeTruthy()
      expect((context as any).__mock).toBe(true)
    })

    it('應該能夠配置 Canvas Context', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600

      const context = canvas.getContext('webgpu') as any

      context.configure({
        device,
        format: 'bgra8unorm'
      })

      const currentTexture = context.getCurrentTexture()
      expect(currentTexture).toBeTruthy()
      expect(currentTexture.width).toBe(800)
      expect(currentTexture.height).toBe(600)
    })
  })

  describe('錯誤處理', () => {
    it('應該正確處理 Buffer 映射錯誤', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const buffer = device.createBuffer({
        size: 256,
        usage: mockGPUBufferUsage.VERTEX
      })

      // 嘗試在未映射時獲取映射範圍
      expect(() => {
        buffer.getMappedRange()
      }).toThrow('Buffer must be mapped before getting mapped range')
    })

    it('應該正確處理已銷毀的 Buffer', async () => {
      const adapter = await (navigator as any).gpu.requestAdapter()
      const device = await adapter!.requestDevice()

      const buffer = device.createBuffer({
        size: 256,
        usage: mockGPUBufferUsage.MAP_READ
      })

      buffer.destroy()

      // 嘗試映射已銷毀的 Buffer
      await expect(buffer.mapAsync(mockGPUMapMode.READ)).rejects.toThrow('Buffer has been destroyed')
    })

    it('應該正確處理未配置的 Canvas Context', () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgpu') as any

      expect(() => {
        context.getCurrentTexture()
      }).toThrow('Canvas context must be configured before getting current texture')
    })
  })
})
