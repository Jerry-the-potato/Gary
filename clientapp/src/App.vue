<script setup lang="ts">
import ThemeToggle from './components/ThemeToggle.vue'
</script>

<template>
  <div>
    <ThemeToggle />
    <header class="topbar">
      <nav class="nav">
        <router-link to="/" class="link">首頁</router-link>
        <router-link to="/webgpu" class="link">WebGPU</router-link>
      </nav>
    </header>
    <router-view />
  </div>
  
</template>

<style scoped>
.topbar { border-bottom: 1px solid var(--border-color); padding: 10px 16px; background: var(--bg-primary); }
.nav { display: flex; gap: 12px; }
.link { text-decoration: none; color: var(--text-primary); }
.link.router-link-active { font-weight: 600; color: var(--accent-primary); }
</style>
