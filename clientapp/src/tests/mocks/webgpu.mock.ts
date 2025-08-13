/**
 * WebGPU Mock 基礎設施
 * 用於測試環境中模擬 WebGPU API
 *
 * 使用部分實作和型別斷言來避免 TypeScript 嚴格型別檢查問題
 */

// 工具型別，用於創建 Mock 物件
type MockedObject<T> = T & { __mock: true }

// 輔助函式：處理 GPUExtent3D 類型
function parseGPUExtent3D(size: GPUExtent3DStrict): { width: number; height: number; depthOrArrayLayers: number } {
  if (Array.isArray(size)) {
    return {
      width: size[0] || 1,
      height: size[1] || 1,
      depthOrArrayLayers: size[2] || 1
    }
  } else {
    return {
      width: (size as any).width || 1,
      height: (size as any).height || 1,
      depthOrArrayLayers: (size as any).depthOrArrayLayers || 1
    }
  }
}

/**
 * Mock GPU Buffer
 */
export class MockGPUBuffer {
  readonly label: string = ''
  readonly size: number
  readonly usage: GPUBufferUsageFlags
  readonly mapState: GPUBufferMapState = 'unmapped'
  readonly __mock = true

  private _destroyed = false
  private _mappedRange: ArrayBuffer | null = null

  constructor(descriptor: GPUBufferDescriptor) {
    this.label = descriptor.label || ''
    this.size = descriptor.size
    this.usage = descriptor.usage
  }

  destroy(): undefined {
    this._destroyed = true
    return undefined
  }

  getMappedRange(offset?: number, size?: number): ArrayBuffer {
    if (this.mapState !== 'mapped') {
      throw new Error('Buffer must be mapped before getting mapped range')
    }
    const actualOffset = offset || 0
    const actualSize = size || (this.size - actualOffset)

    if (!this._mappedRange) {
      this._mappedRange = new ArrayBuffer(actualSize)
    }
    return this._mappedRange
  }

  async mapAsync(mode: GPUMapModeFlags, offset?: number, size?: number): Promise<undefined> {
    if (this._destroyed) {
      throw new Error('Buffer has been destroyed')
    }
    // 模擬非同步映射
    await new Promise(resolve => setTimeout(resolve, 1))
    Object.defineProperty(this, 'mapState', { value: 'mapped' })
    return undefined
  }

  unmap(): undefined {
    Object.defineProperty(this, 'mapState', { value: 'unmapped' })
    this._mappedRange = null
    return undefined
  }
}

/**
 * Mock GPU Texture
 */
export class MockGPUTexture implements GPUTexture {
  readonly label: string | undefined
  readonly width: number
  readonly height: number
  readonly depthOrArrayLayers: number
  readonly mipLevelCount: number
  readonly sampleCount: number
  readonly dimension: GPUTextureDimension
  readonly format: GPUTextureFormat
  readonly usage: GPUTextureUsageFlags
  readonly __mock = true

  private _destroyed = false

  constructor(descriptor: GPUTextureDescriptor) {
    this.label = descriptor.label
    this.width = descriptor.size.width
    this.height = descriptor.size.height || 1
    this.depthOrArrayLayers = descriptor.size.depthOrArrayLayers || 1
    this.mipLevelCount = descriptor.mipLevelCount || 1
    this.sampleCount = descriptor.sampleCount || 1
    this.dimension = descriptor.dimension || '2d'
    this.format = descriptor.format
    this.usage = descriptor.usage
  }

  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView {
    if (this._destroyed) {
      throw new Error('Texture has been destroyed')
    }
    return new MockGPUTextureView(this, descriptor)
  }

  destroy(): void {
    this._destroyed = true
  }
}

/**
 * Mock GPU Texture View
 */
export class MockGPUTextureView implements GPUTextureView {
  readonly label: string | undefined
  readonly __mock = true

  constructor(texture: MockGPUTexture, descriptor?: GPUTextureViewDescriptor) {
    this.label = descriptor?.label
  }
}

/**
 * Mock GPU Shader Module
 */
export class MockGPUShaderModule implements GPUShaderModule {
  readonly label: string | undefined
  readonly __mock = true
  readonly __code: string

  constructor(descriptor: GPUShaderModuleDescriptor) {
    this.label = descriptor.label
    this.__code = descriptor.code
  }

  async getCompilationInfo(): Promise<GPUCompilationInfo> {
    return {
      messages: []
    }
  }
}

/**
 * Mock GPU Render Pipeline
 */
export class MockGPURenderPipeline implements GPURenderPipeline {
  readonly label: string | undefined
  readonly __mock = true
  readonly __descriptor: GPURenderPipelineDescriptor

  constructor(descriptor: GPURenderPipelineDescriptor) {
    this.label = descriptor.label
    this.__descriptor = descriptor
  }

  getBindGroupLayout(index: number): GPUBindGroupLayout {
    return new MockGPUBindGroupLayout(`auto-${index}`)
  }
}

/**
 * Mock GPU Bind Group Layout
 */
export class MockGPUBindGroupLayout implements GPUBindGroupLayout {
  readonly label: string | undefined
  readonly __mock = true

  constructor(label?: string) {
    this.label = label
  }
}

/**
 * Mock GPU Bind Group
 */
export class MockGPUBindGroup implements GPUBindGroup {
  readonly label: string | undefined
  readonly __mock = true

  constructor(descriptor: GPUBindGroupDescriptor) {
    this.label = descriptor.label
  }
}

/**
 * Mock GPU Command Encoder
 */
export class MockGPUCommandEncoder implements GPUCommandEncoder {
  readonly label: string | undefined
  readonly __mock = true
  private _commands: string[] = []

  constructor(descriptor?: GPUCommandEncoderDescriptor) {
    this.label = descriptor?.label
  }

  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder {
    this._commands.push('beginRenderPass')
    return new MockGPURenderPassEncoder(this)
  }

  copyBufferToBuffer(
    source: GPUBuffer,
    sourceOffset: number,
    destination: GPUBuffer,
    destinationOffset: number,
    size: number
  ): void {
    this._commands.push('copyBufferToBuffer')
  }

  copyBufferToTexture(
    source: GPUImageCopyBuffer,
    destination: GPUImageCopyTexture,
    copySize: GPUExtent3D
  ): void {
    this._commands.push('copyBufferToTexture')
  }

  copyTextureToBuffer(
    source: GPUImageCopyTexture,
    destination: GPUImageCopyBuffer,
    copySize: GPUExtent3D
  ): void {
    this._commands.push('copyTextureToBuffer')
  }

  copyTextureToTexture(
    source: GPUImageCopyTexture,
    destination: GPUImageCopyTexture,
    copySize: GPUExtent3D
  ): void {
    this._commands.push('copyTextureToTexture')
  }

  finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer {
    return new MockGPUCommandBuffer(this._commands, descriptor?.label)
  }

  insertDebugMarker(markerLabel: string): void {
    this._commands.push(`debugMarker: ${markerLabel}`)
  }

  popDebugGroup(): void {
    this._commands.push('popDebugGroup')
  }

  pushDebugGroup(groupLabel: string): void {
    this._commands.push(`pushDebugGroup: ${groupLabel}`)
  }
}

/**
 * Mock GPU Render Pass Encoder
 */
export class MockGPURenderPassEncoder implements GPURenderPassEncoder {
  readonly label: string | undefined
  readonly __mock = true
  private _commands: string[] = []

  constructor(commandEncoder: MockGPUCommandEncoder) {
    this.label = commandEncoder.label
  }

  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void {
    this._commands.push(`draw(${vertexCount}, ${instanceCount || 1})`)
  }

  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void {
    this._commands.push(`drawIndexed(${indexCount}, ${instanceCount || 1})`)
  }

  end(): void {
    this._commands.push('end')
  }

  setBindGroup(index: number, bindGroup: GPUBindGroup, dynamicOffsets?: number[]): void {
    this._commands.push(`setBindGroup(${index})`)
  }

  setIndexBuffer(buffer: GPUBuffer, format: GPUIndexFormat, offset?: number, size?: number): void {
    this._commands.push('setIndexBuffer')
  }

  setPipeline(pipeline: GPURenderPipeline): void {
    this._commands.push('setPipeline')
  }

  setVertexBuffer(slot: number, buffer: GPUBuffer, offset?: number, size?: number): void {
    this._commands.push(`setVertexBuffer(${slot})`)
  }

  insertDebugMarker(markerLabel: string): void {
    this._commands.push(`debugMarker: ${markerLabel}`)
  }

  popDebugGroup(): void {
    this._commands.push('popDebugGroup')
  }

  pushDebugGroup(groupLabel: string): void {
    this._commands.push(`pushDebugGroup: ${groupLabel}`)
  }
}

/**
 * Mock GPU Command Buffer
 */
export class MockGPUCommandBuffer implements GPUCommandBuffer {
  readonly label: string | undefined
  readonly __mock = true
  readonly __commands: string[]

  constructor(commands: string[], label?: string) {
    this.__commands = [...commands]
    this.label = label
  }
}

/**
 * Mock GPU Queue
 */
export class MockGPUQueue implements GPUQueue {
  readonly label: string | undefined
  readonly __mock = true
  readonly __submittedCommands: GPUCommandBuffer[] = []
  readonly __writtenBuffers: Array<{ buffer: GPUBuffer; offset: number; data: BufferSource }> = []

  constructor(label?: string) {
    this.label = label
  }

  submit(commandBuffers: GPUCommandBuffer[]): void {
    this.__submittedCommands.push(...commandBuffers)
  }

  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource, dataOffset?: number, size?: number): void {
    this.__writtenBuffers.push({
      buffer,
      offset: bufferOffset,
      data
    })
  }

  writeTexture(
    destination: GPUImageCopyTexture,
    data: BufferSource,
    dataLayout: GPUImageDataLayout,
    size: GPUExtent3D
  ): void {
    // 記錄紋理寫入操作
  }

  copyExternalImageToTexture(
    source: GPUImageCopyExternalImage,
    destination: GPUImageCopyTexture,
    copySize: GPUExtent3D
  ): void {
    // 記錄外部圖像複製操作
  }

  onSubmittedWorkDone(): Promise<void> {
    return Promise.resolve()
  }
}

/**
 * Mock GPU Canvas Context
 */
export class MockGPUCanvasContext implements GPUCanvasContext {
  readonly canvas: HTMLCanvasElement | OffscreenCanvas
  readonly __mock = true

  private _currentTexture: GPUTexture | null = null
  private _configuration: GPUCanvasConfiguration | null = null

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas
  }

  configure(configuration: GPUCanvasConfiguration): void {
    this._configuration = { ...configuration }
    console.log('🔧 Mock WebGPU Canvas Context 已配置')
  }

  unconfigure(): void {
    this._configuration = null
    this._currentTexture = null
  }

  getCurrentTexture(): GPUTexture {
    if (!this._configuration) {
      throw new Error('Canvas context must be configured before getting current texture')
    }

    if (!this._currentTexture) {
      this._currentTexture = new MockGPUTexture({
        size: { width: this.canvas.width, height: this.canvas.height },
        format: this._configuration.format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      })
    }

    return this._currentTexture
  }
}

/**
 * Mock GPU Device
 */
export class MockGPUDevice implements MockGPUDevice {
  readonly features: GPUSupportedFeatures = new Set()
  readonly limits: GPUSupportedLimits = {
    maxTextureDimension1D: 8192,
    maxTextureDimension2D: 8192,
    maxTextureDimension3D: 2048,
    maxTextureArrayLayers: 256,
    maxBindGroups: 4,
    maxDynamicUniformBuffersPerPipelineLayout: 8,
    maxDynamicStorageBuffersPerPipelineLayout: 4,
    maxSampledTexturesPerShaderStage: 16,
    maxSamplersPerShaderStage: 16,
    maxStorageBuffersPerShaderStage: 8,
    maxStorageTexturesPerShaderStage: 4,
    maxUniformBuffersPerShaderStage: 12,
    maxUniformBufferBindingSize: 65536,
    maxStorageBufferBindingSize: 134217728,
    minUniformBufferOffsetAlignment: 256,
    minStorageBufferOffsetAlignment: 256,
    maxVertexBuffers: 8,
    maxVertexAttributes: 16,
    maxVertexBufferArrayStride: 2048,
    maxInterStageShaderComponents: 60,
    maxComputeWorkgroupStorageSize: 16384,
    maxComputeInvocationsPerWorkgroup: 256,
    maxComputeWorkgroupSizeX: 256,
    maxComputeWorkgroupSizeY: 256,
    maxComputeWorkgroupSizeZ: 64,
    maxComputeWorkgroupsPerDimension: 65535
  }
  readonly queue: MockGPUQueue
  readonly label: string | undefined
  readonly lost: Promise<GPUDeviceLostInfo>
  readonly __mock = true
  readonly __commandsExecuted: GPUCommandBuffer[] = []
  readonly __buffersCreated: GPUBuffer[] = []
  readonly __texturesCreated: GPUTexture[] = []
  readonly __bindGroupsCreated: GPUBindGroup[] = []

  constructor(descriptor?: GPUDeviceDescriptor) {
    this.label = descriptor?.label
    this.queue = new MockGPUQueue('default-queue')
    this.lost = new Promise((resolve) => {
      // 模擬設備永不丟失
    })
  }

  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer {
    const buffer = new MockGPUBuffer(descriptor)
    this.__buffersCreated.push(buffer)
    return buffer
  }

  createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
    const texture = new MockGPUTexture(descriptor)
    this.__texturesCreated.push(texture)
    return texture
  }

  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule {
    return new MockGPUShaderModule(descriptor)
  }

  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
    return new MockGPURenderPipeline(descriptor)
  }

  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout {
    return new MockGPUBindGroupLayout(descriptor.label)
  }

  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup {
    const bindGroup = new MockGPUBindGroup(descriptor)
    this.__bindGroupsCreated.push(bindGroup)
    return bindGroup
  }

  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder {
    return new MockGPUCommandEncoder(descriptor)
  }

  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline {
    throw new Error('Compute pipelines not implemented in mock')
  }

  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout {
    throw new Error('Pipeline layouts not implemented in mock')
  }

  createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet {
    throw new Error('Query sets not implemented in mock')
  }

  createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder {
    throw new Error('Render bundle encoders not implemented in mock')
  }

  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler {
    throw new Error('Samplers not implemented in mock')
  }

  async createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline> {
    return this.createRenderPipeline(descriptor)
  }

  async createComputePipelineAsync(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline> {
    return this.createComputePipeline(descriptor)
  }

  destroy(): void {
    console.log('🧹 Mock GPU Device 已銷毀')
  }

  pushErrorScope(filter: GPUErrorFilter): void {
    // Mock implementation
  }

  async popErrorScope(): Promise<GPUError | null> {
    return null
  }

  addEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true
  }
}

/**
 * Mock GPU Adapter
 */
export class MockGPUAdapter implements MockGPUAdapter {
  readonly features: GPUSupportedFeatures = new Set(['depth-clip-control'])
  readonly limits: GPUSupportedLimits
  readonly isFallbackAdapter: boolean = false
  readonly __mock = true
  readonly __deviceRequestCount = 0

  constructor() {
    this.limits = new MockGPUDevice().limits
  }

  async requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice> {
    Object.defineProperty(this, '__deviceRequestCount', {
      value: this.__deviceRequestCount + 1
    })
    return new MockGPUDevice(descriptor)
  }

  async requestAdapterInfo(): Promise<GPUAdapterInfo> {
    return {
      vendor: 'Mock',
      architecture: 'mock-arch',
      device: 'Mock GPU Device',
      description: 'Mock WebGPU Adapter for Testing'
    }
  }
}

/**
 * Mock GPU
 */
export class MockGPU implements MockGPU {
  readonly __mock = true
  readonly __adapterRequestCount = 0

  async requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null> {
    Object.defineProperty(this, '__adapterRequestCount', {
      value: this.__adapterRequestCount + 1
    })
    return new MockGPUAdapter()
  }

  getPreferredCanvasFormat(): GPUTextureFormat {
    return 'bgra8unorm'
  }

  wgslLanguageFeatures?: WGSLLanguageFeatures | undefined
}

/**
 * WebGPU Mock 工廠
 */
export class WebGPUMockFactory {
  /**
   * 安裝 WebGPU Mock 到全域
   */
  static install(): void {
    if (typeof global !== 'undefined') {
      // Node.js 環境
      global.navigator = global.navigator || {} as any
      Object.defineProperty(global.navigator, 'gpu', {
        value: new MockGPU(),
        writable: true,
        configurable: true
      })

      // Mock Canvas getContext
      if (global.HTMLCanvasElement) {
        const originalGetContext = global.HTMLCanvasElement.prototype.getContext
        global.HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, contextType: string, ...args: any[]) {
          if (contextType === 'webgpu') {
            return new MockGPUCanvasContext(this)
          }
          return originalGetContext.call(this, contextType, ...args)
        }
      }
    }

    if (typeof window !== 'undefined') {
      // 瀏覽器環境
      Object.defineProperty(window.navigator, 'gpu', {
        value: new MockGPU(),
        writable: true,
        configurable: true
      })

      // Mock Canvas getContext
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, contextType: string, ...args: any[]) {
        if (contextType === 'webgpu') {
          return new MockGPUCanvasContext(this)
        }
        return originalGetContext.call(this, contextType, ...args)
      }
    }

    console.log('🔧 WebGPU Mock 系統已安裝')
  }

  /**
   * 卸載 WebGPU Mock
   */
  static uninstall(): void {
    if (typeof global !== 'undefined' && global.navigator) {
      delete (global.navigator as any).gpu
    }

    if (typeof window !== 'undefined' && window.navigator) {
      delete (window.navigator as any).gpu
    }

    console.log('🧹 WebGPU Mock 系統已卸載')
  }

  /**
   * 重置所有 Mock 統計
   */
  static reset(): void {
    // 重置全域 Mock 統計
    if (typeof navigator !== 'undefined' && (navigator as any).gpu?.__mock) {
      Object.defineProperty(navigator.gpu, '__adapterRequestCount', { value: 0 })
    }
  }

  /**
   * 創建獨立的 Mock GPU 實例
   */
  static createMockGPU(): MockGPU {
    return new MockGPU()
  }

  /**
   * 創建 Mock Canvas Context
   */
  static createMockCanvasContext(canvas: HTMLCanvasElement): MockGPUCanvasContext {
    return new MockGPUCanvasContext(canvas)
  }
}

export default WebGPUMockFactory
