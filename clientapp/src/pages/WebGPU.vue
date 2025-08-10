<script setup lang="ts">
import WebGPUCanvas from '../components/WebGPUCanvas.vue'
</script>

<template>
  <main class="container">
    <h1>WebGPU Demo</h1>
    <WebGPUCanvas />
  </main>
</template>

<style scoped>
.container { 
  max-width: 960px; 
  margin: 0 auto; 
  padding: 24px; 
  background: var(--bg-primary); 
  color: var(--text-primary); 
  min-height: 100vh;
}
</style>
