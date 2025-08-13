/**
 * WebGPU Mock 基礎設施
 * 簡化版本，使用型別斷言來避免 TypeScript 複雜性問題
 */

// Mock 統計和追蹤介面
export interface WebGPUMockStats {
  adaptersRequested: number
  devicesCreated: number
  buffersCreated: number
  texturesCreated: number
  commandsExecuted: number
  renderPasses: number
}

// 全域統計物件
const mockStats: WebGPUMockStats = {
  adaptersRequested: 0,
  devicesCreated: 0,
  buffersCreated: 0,
  texturesCreated: 0,
  commandsExecuted: 0,
  renderPasses: 0
}

/**
 * 基礎 Mock 類別，提供共用功能
 */
abstract class BaseMockObject {
  readonly __mock = true
  readonly label: string

  constructor(label?: string) {
    this.label = label || ''
  }
}

/**
 * Mock GPU Buffer
 */
class MockGPUBufferImpl extends BaseMockObject {
  readonly size: number
  readonly usage: GPUBufferUsageFlags
  mapState: GPUBufferMapState = 'unmapped'

  private _destroyed = false
  private _mappedRange: ArrayBuffer | null = null

  constructor(descriptor: GPUBufferDescriptor) {
    super(descriptor.label)
    this.size = descriptor.size
    this.usage = descriptor.usage
    Object.defineProperty(mockStats, 'buffersCreated', {
      value: mockStats.buffersCreated + 1,
      writable: true,
      configurable: true
    })
  }

  destroy(): undefined {
    this._destroyed = true
    return undefined
  }

  getMappedRange(offset = 0, size?: number): ArrayBuffer {
    if (this.mapState !== 'mapped') {
      throw new Error('Buffer must be mapped before getting mapped range')
    }
    const actualSize = size || (this.size - offset)

    if (!this._mappedRange) {
      this._mappedRange = new ArrayBuffer(actualSize)
    }
    return this._mappedRange
  }

  async mapAsync(_mode: GPUMapModeFlags, _offset?: number, _size?: number): Promise<undefined> {
    if (this._destroyed) {
      throw new Error('Buffer has been destroyed')
    }
    // 模擬非同步映射
    await new Promise(resolve => setTimeout(resolve, 1))
    this.mapState = 'mapped'
    return undefined
  }

  unmap(): undefined {
    this.mapState = 'unmapped'
    this._mappedRange = null
    return undefined
  }
}

/**
 * Mock GPU Texture
 */
class MockGPUTextureImpl extends BaseMockObject {
  readonly width: number
  readonly height: number
  readonly depthOrArrayLayers: number
  readonly mipLevelCount: number
  readonly sampleCount: number
  readonly dimension: GPUTextureDimension
  readonly format: GPUTextureFormat
  readonly usage: GPUTextureUsageFlags

  private _destroyed = false

  constructor(descriptor: GPUTextureDescriptor) {
    super(descriptor.label)

    // 處理 GPUExtent3D 類型
    const size = this.parseSize(descriptor.size)
    this.width = size.width
    this.height = size.height
    this.depthOrArrayLayers = size.depthOrArrayLayers

    this.mipLevelCount = descriptor.mipLevelCount || 1
    this.sampleCount = descriptor.sampleCount || 1
    this.dimension = descriptor.dimension || '2d'
    this.format = descriptor.format
    this.usage = descriptor.usage

    Object.defineProperty(mockStats, 'texturesCreated', {
      value: mockStats.texturesCreated + 1,
      writable: true,
      configurable: true
    })
  }

  private parseSize(size: GPUExtent3DStrict): { width: number; height: number; depthOrArrayLayers: number } {
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

  createView(_descriptor?: GPUTextureViewDescriptor): GPUTextureView {
    if (this._destroyed) {
      throw new Error('Texture has been destroyed')
    }
    return new MockGPUTextureViewImpl() as any
  }

  destroy(): undefined {
    this._destroyed = true
    return undefined
  }
}

/**
 * Mock GPU Texture View
 */
class MockGPUTextureViewImpl extends BaseMockObject {
  constructor(label?: string) {
    super(label)
  }
}

/**
 * Mock GPU Shader Module
 */
class MockGPUShaderModuleImpl extends BaseMockObject {
  readonly code: string

  constructor(descriptor: GPUShaderModuleDescriptor) {
    super(descriptor.label)
    this.code = descriptor.code
  }

  async getCompilationInfo(): Promise<GPUCompilationInfo> {
    return { messages: [] } as any
  }
}

/**
 * Mock GPU Render Pipeline
 */
class MockGPURenderPipelineImpl extends BaseMockObject {
  readonly descriptor: GPURenderPipelineDescriptor

  constructor(descriptor: GPURenderPipelineDescriptor) {
    super(descriptor.label)
    this.descriptor = descriptor
  }

  getBindGroupLayout(_index: number): GPUBindGroupLayout {
    return new MockGPUBindGroupLayoutImpl() as any
  }
}

/**
 * Mock GPU Bind Group Layout
 */
class MockGPUBindGroupLayoutImpl extends BaseMockObject {
  constructor(label?: string) {
    super(label)
  }
}

/**
 * Mock GPU Bind Group
 */
class MockGPUBindGroupImpl extends BaseMockObject {
  constructor(descriptor: GPUBindGroupDescriptor) {
    super(descriptor.label)
  }
}

/**
 * Mock GPU Command Buffer
 */
class MockGPUCommandBufferImpl extends BaseMockObject {
  readonly commands: string[]

  constructor(commands: string[], label?: string) {
    super(label)
    this.commands = [...commands]
    Object.defineProperty(mockStats, 'commandsExecuted', {
      value: mockStats.commandsExecuted + 1,
      writable: true,
      configurable: true
    })
  }
}

/**
 * Mock GPU Render Pass Encoder
 */
class MockGPURenderPassEncoderImpl extends BaseMockObject {
  private _commands: string[] = []
  private _ended = false

  constructor(label?: string) {
    super(label)
    Object.defineProperty(mockStats, 'renderPasses', {
      value: mockStats.renderPasses + 1,
      writable: true,
      configurable: true
    })
  }

  draw(vertexCount: number, instanceCount = 1, _firstVertex = 0, _firstInstance = 0): undefined {
    this._commands.push(`draw(${vertexCount}, ${instanceCount})`)
    return undefined
  }

  drawIndexed(indexCount: number, instanceCount = 1, _firstIndex = 0, _baseVertex = 0, _firstInstance = 0): undefined {
    this._commands.push(`drawIndexed(${indexCount}, ${instanceCount})`)
    return undefined
  }

  end(): undefined {
    this._ended = true
    return undefined
  }

  setBindGroup(_index: number, _bindGroup: GPUBindGroup, _dynamicOffsets?: number[]): undefined {
    this._commands.push('setBindGroup')
    return undefined
  }

  setIndexBuffer(_buffer: GPUBuffer, _format: GPUIndexFormat, _offset?: number, _size?: number): undefined {
    this._commands.push('setIndexBuffer')
    return undefined
  }

  setPipeline(_pipeline: GPURenderPipeline): undefined {
    this._commands.push('setPipeline')
    return undefined
  }

  setVertexBuffer(_slot: number, _buffer: GPUBuffer, _offset?: number, _size?: number): undefined {
    this._commands.push('setVertexBuffer')
    return undefined
  }

  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }

  popDebugGroup(): undefined {
    return undefined
  }

  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }

  setViewport(_x: number, _y: number, _width: number, _height: number, _minDepth: number, _maxDepth: number): undefined {
    return undefined
  }

  setScissorRect(_x: number, _y: number, _width: number, _height: number): undefined {
    return undefined
  }

  setBlendConstant(_color: GPUColor): undefined {
    return undefined
  }

  writeOcclusionQuery(_queryIndex: number): undefined {
    return undefined
  }

  beginDebugGroup(_groupLabel: string): undefined {
    return undefined
  }

  endDebugGroup(): undefined {
    return undefined
  }

  executeBundles(_bundles: GPURenderBundle[]): undefined {
    return undefined
  }
}

/**
 * Mock GPU Command Encoder
 */
class MockGPUCommandEncoderImpl extends BaseMockObject {
  private _commands: string[] = []

  constructor(descriptor?: GPUCommandEncoderDescriptor) {
    super(descriptor?.label)
  }

  beginRenderPass(_descriptor: GPURenderPassDescriptor): GPURenderPassEncoder {
    this._commands.push('beginRenderPass')
    return new MockGPURenderPassEncoderImpl() as any
  }

  copyBufferToBuffer(): undefined {
    this._commands.push('copyBufferToBuffer')
    return undefined
  }

  copyBufferToTexture(): undefined {
    this._commands.push('copyBufferToTexture')
    return undefined
  }

  copyTextureToBuffer(): undefined {
    this._commands.push('copyTextureToBuffer')
    return undefined
  }

  copyTextureToTexture(): undefined {
    this._commands.push('copyTextureToTexture')
    return undefined
  }

  finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer {
    return new MockGPUCommandBufferImpl(this._commands, descriptor?.label) as any
  }

  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }

  popDebugGroup(): undefined {
    return undefined
  }

  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }
}

/**
 * Mock GPU Queue
 */
class MockGPUQueueImpl extends BaseMockObject {
  readonly submittedCommands: GPUCommandBuffer[] = []

  constructor(label?: string) {
    super(label)
  }

  submit(commandBuffers: GPUCommandBuffer[]): undefined {
    this.submittedCommands.push(...commandBuffers)
    return undefined
  }

  writeBuffer(): undefined {
    return undefined
  }

  writeTexture(): undefined {
    return undefined
  }

  copyExternalImageToTexture(): undefined {
    return undefined
  }

  onSubmittedWorkDone(): Promise<undefined> {
    return Promise.resolve(undefined)
  }
}

/**
 * Mock GPU Canvas Context
 */
class MockGPUCanvasContextImpl {
  readonly canvas: HTMLCanvasElement | OffscreenCanvas
  readonly __mock = true

  private _configuration: GPUCanvasConfiguration | null = null
  private _currentTexture: GPUTexture | null = null

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas
  }

  configure(configuration: GPUCanvasConfiguration): undefined {
    this._configuration = { ...configuration }
    console.log('🔧 Mock WebGPU Canvas Context 已配置')
    return undefined
  }

  unconfigure(): undefined {
    this._configuration = null
    this._currentTexture = null
    return undefined
  }

  getCurrentTexture(): GPUTexture {
    if (!this._configuration) {
      throw new Error('Canvas context must be configured before getting current texture')
    }

    if (!this._currentTexture) {
      this._currentTexture = new MockGPUTextureImpl({
        size: { width: this.canvas.width, height: this.canvas.height },
        format: this._configuration.format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      }) as any
    }

    return this._currentTexture!
  }
}

/**
 * Mock GPU Device
 */
class MockGPUDeviceImpl extends BaseMockObject {
  readonly features: GPUSupportedFeatures = new Set()
  readonly limits: GPUSupportedLimits
  readonly queue: GPUQueue
  readonly lost: Promise<GPUDeviceLostInfo>

  constructor(descriptor?: GPUDeviceDescriptor) {
    super(descriptor?.label)

    this.limits = {
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
      maxComputeWorkgroupStorageSize: 16384,
      maxComputeInvocationsPerWorkgroup: 256,
      maxComputeWorkgroupSizeX: 256,
      maxComputeWorkgroupSizeY: 256,
      maxComputeWorkgroupSizeZ: 64,
      maxComputeWorkgroupsPerDimension: 65535,
      maxBindGroupsPlusVertexBuffers: 24,
      maxBindingsPerBindGroup: 1000,
      maxBufferSize: 1073741824,
      maxColorAttachments: 8,
      maxColorAttachmentBytesPerSample: 32,
      maxInterStageShaderVariables: 16
    } as any

    this.queue = new MockGPUQueueImpl('default-queue') as any
    this.lost = new Promise(() => {}) // 永不解析

    Object.defineProperty(mockStats, 'devicesCreated', {
      value: mockStats.devicesCreated + 1,
      writable: true,
      configurable: true
    })
  }

  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer {
    return new MockGPUBufferImpl(descriptor) as any
  }

  createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
    return new MockGPUTextureImpl(descriptor) as any
  }

  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule {
    return new MockGPUShaderModuleImpl(descriptor) as any
  }

  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
    return new MockGPURenderPipelineImpl(descriptor) as any
  }

  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout {
    return new MockGPUBindGroupLayoutImpl(descriptor.label) as any
  }

  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup {
    return new MockGPUBindGroupImpl(descriptor) as any
  }

  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder {
    return new MockGPUCommandEncoderImpl(descriptor) as any
  }

  destroy(): undefined {
    console.log('🧹 Mock GPU Device 已銷毀')
    return undefined
  }

  // 簡化其他方法實作
  createComputePipeline(): any { throw new Error('Not implemented') }
  createPipelineLayout(): any { throw new Error('Not implemented') }
  createQuerySet(): any { throw new Error('Not implemented') }
  createRenderBundleEncoder(): any { throw new Error('Not implemented') }
  createSampler(): any { throw new Error('Not implemented') }
  async createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline> {
    return this.createRenderPipeline(descriptor)
  }
  async createComputePipelineAsync(): Promise<any> { throw new Error('Not implemented') }
  pushErrorScope(): undefined { return undefined }
  async popErrorScope(): Promise<GPUError | null> { return null }
  addEventListener(): undefined { return undefined }
  removeEventListener(): undefined { return undefined }
  dispatchEvent(): boolean { return true }
}

/**
 * Mock GPU Adapter
 */
class MockGPUAdapterImpl {
  readonly features: GPUSupportedFeatures = new Set(['depth-clip-control'])
  readonly limits: GPUSupportedLimits
  readonly isFallbackAdapter = false
  readonly __mock = true

  constructor() {
    // 創建模擬 limits 物件，而不使用 MockGPUDeviceImpl
    this.limits = {
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
      maxComputeWorkgroupStorageSize: 16384,
      maxComputeInvocationsPerWorkgroup: 256,
      maxComputeWorkgroupSizeX: 256,
      maxComputeWorkgroupSizeY: 256,
      maxComputeWorkgroupSizeZ: 64,
      maxComputeWorkgroupsPerDimension: 65535,
      maxBindGroupsPlusVertexBuffers: 24,
      maxBindingsPerBindGroup: 1000,
      maxBufferSize: 1073741824,
      maxColorAttachments: 8,
      maxColorAttachmentBytesPerSample: 32,
      maxInterStageShaderVariables: 16
    } as any

    Object.defineProperty(mockStats, 'adaptersRequested', {
      value: mockStats.adaptersRequested + 1,
      writable: true,
      configurable: true
    })
  }

  async requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice> {
    return new MockGPUDeviceImpl(descriptor) as any
  }

  async requestAdapterInfo(): Promise<GPUAdapterInfo> {
    return {
      vendor: 'Mock',
      architecture: 'mock-arch',
      device: 'Mock GPU Device',
      description: 'Mock WebGPU Adapter for Testing'
    } as any
  }
}

/**
 * Mock GPU
 */
class MockGPUImpl {
  readonly __mock = true
  readonly wgslLanguageFeatures: WGSLLanguageFeatures = new Set() as any

  async requestAdapter(_options?: GPURequestAdapterOptions): Promise<GPUAdapter | null> {
    return new MockGPUAdapterImpl() as any
  }

  getPreferredCanvasFormat(): GPUTextureFormat {
    return 'bgra8unorm'
  }
}

/**
 * WebGPU Mock 工廠和管理器
 */
export class WebGPUMockFactory {
  private static _installed = false
  private static _originalGetContext: any = null

  /**
   * 獲取 Mock 統計資料
   */
  static getStats(): WebGPUMockStats {
    return { ...mockStats }
  }

  /**
   * 重置統計資料
   */
  static resetStats(): void {
    Object.assign(mockStats, {
      adaptersRequested: 0,
      devicesCreated: 0,
      buffersCreated: 0,
      texturesCreated: 0,
      commandsExecuted: 0,
      renderPasses: 0
    })
  }

  /**
   * 安裝 WebGPU Mock 到全域環境
   */
  static install(): void {
    if (this._installed) {
      console.warn('WebGPU Mock 已經安裝')
      return
    }

    const mockGPU = new MockGPUImpl()

    // 安裝到 Navigator
    if (typeof navigator !== 'undefined') {
      try {
        Object.defineProperty(navigator, 'gpu', {
          value: mockGPU,
          writable: true,
          configurable: true
        })
      } catch (error) {
        // 如果屬性已存在，嘗試直接賦值
        (navigator as any).gpu = mockGPU
      }
    }

    // 模擬全域變數（Node.js 環境）
    if (typeof global !== 'undefined') {
      global.navigator = global.navigator || {} as any
      try {
        Object.defineProperty(global.navigator, 'gpu', {
          value: mockGPU,
          writable: true,
          configurable: true
        })
      } catch (error) {
        // 如果屬性已存在，嘗試直接賦值
        (global.navigator as any).gpu = mockGPU
      }
    }

    // Mock Canvas getContext
    if (typeof HTMLCanvasElement !== 'undefined') {
      this._originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function(contextType: string, ...args: any[]) {
        if (contextType === 'webgpu') {
          return new MockGPUCanvasContextImpl(this)
        }
        return WebGPUMockFactory._originalGetContext.call(this, contextType, ...args)
      }
    }

    this._installed = true
    console.log('🔧 WebGPU Mock 系統已安裝')
  }

  /**
   * 卸載 WebGPU Mock
   */
  static uninstall(): void {
    if (!this._installed) {
      return
    }

    // 移除 Navigator GPU
    if (typeof navigator !== 'undefined') {
      try {
        delete (navigator as any).gpu
      } catch (error) {
        // 如果無法刪除，設為 undefined
        (navigator as any).gpu = undefined
      }
    }

    if (typeof global !== 'undefined' && global.navigator) {
      try {
        delete (global.navigator as any).gpu
      } catch (error) {
        // 如果無法刪除，設為 undefined
        (global.navigator as any).gpu = undefined
      }
    }

    // 恢復原始 getContext
    if (typeof HTMLCanvasElement !== 'undefined' && this._originalGetContext) {
      HTMLCanvasElement.prototype.getContext = this._originalGetContext
      this._originalGetContext = null
    }

    this._installed = false
    console.log('🧹 WebGPU Mock 系統已卸載')
  }

  /**
   * 檢查是否已安裝
   */
  static isInstalled(): boolean {
    return this._installed
  }

  /**
   * 創建獨立的 Mock GPU 實例
   */
  static createMockGPU(): GPU {
    return new MockGPUImpl() as any
  }

  /**
   * 創建 Mock Canvas Context
   */
  static createMockCanvasContext(canvas: HTMLCanvasElement): GPUCanvasContext {
    return new MockGPUCanvasContextImpl(canvas) as any
  }
}

export default WebGPUMockFactory
