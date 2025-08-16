/**
 * WebGPU 型別定義補充
 * 用於測試環境中的型別支援
 */

// 補充全域 Navigator 介面
declare global {
  interface Navigator {
    gpu: GPU
  }

  // WebGPU 常數定義
  const GPUBufferUsage: {
    readonly MAP_READ: 0x0001
    readonly MAP_WRITE: 0x0002
    readonly COPY_SRC: 0x0004
    readonly COPY_DST: 0x0008
    readonly INDEX: 0x0010
    readonly VERTEX: 0x0020
    readonly UNIFORM: 0x0040
    readonly STORAGE: 0x0080
    readonly INDIRECT: 0x0100
    readonly QUERY_RESOLVE: 0x0200
  }

  const GPUTextureUsage: {
    readonly COPY_SRC: 0x01
    readonly COPY_DST: 0x02
    readonly TEXTURE_BINDING: 0x04
    readonly STORAGE_BINDING: 0x08
    readonly RENDER_ATTACHMENT: 0x10
  }

  const GPUMapMode: {
    readonly READ: 0x0001
    readonly WRITE: 0x0002
  }

  const GPUShaderStage: {
    readonly VERTEX: 0x1
    readonly FRAGMENT: 0x2
    readonly COMPUTE: 0x4
  }
}

export {}
