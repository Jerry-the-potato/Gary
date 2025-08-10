<!--
  簡潔的深色模式切換按鈕
-->

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDarkMode ? '切換到淺色模式' : '切換到深色模式'"
  >
    {{ isDarkMode ? '🌞' : '🌙' }}
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>
.theme-toggle {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>
