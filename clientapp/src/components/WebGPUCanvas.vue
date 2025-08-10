<script setup lang="ts">
import { ref } from 'vue'
import { useWebGPUUI } from '../composables/useWebGPUUI'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { error } = useWebGPUUI(canvasRef)
</script>

<template>
  <div class="canvas-container">
    <h2>WebGPU UI Demo</h2>
    <canvas 
      ref="canvasRef" 
      width="800" 
      height="400" 
      class="webgpu-canvas"
    />
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.canvas-container {
  display: flex; 
  flex-direction: column; 
  align-items: center;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.webgpu-canvas {
  background: var(--canvas-bg);
  border: 1px solid var(--border-color); 
  margin-top: 16px;
  border-radius: 8px;
}

.error-message { 
  color: var(--algo-compare); 
  margin-top: 12px; 
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}
</style>
