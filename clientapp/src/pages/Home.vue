<template>
  <main class="container">
    <header class="hero">
      <h1>入口介面</h1>
      <p class="sub">這是專案的前端入口，包含導覽與前往 WebGPU 介面。</p>
      <nav class="actions">
        <router-link to="/webgpu" class="btn">前往 WebGPU Demo</router-link>
      </nav>
    </header>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
.container { max-width: 960px; margin: 0 auto; padding: 24px; background: var(--bg-primary); color: var(--text-primary); }
.hero { padding: 32px 0; }
.sub { color: var(--text-secondary); }
.actions { margin-top: 16px; }
.btn { 
  display: inline-block; 
  padding: 8px 14px; 
  border: 1px solid var(--border-color); 
  border-radius: 6px; 
  text-decoration: none; 
  color: var(--text-primary);
  background: var(--bg-secondary);
}
.btn:hover { background: var(--accent-primary); color: var(--ui-button-text); }
</style>
