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
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  transform: scale(1.05);
  box-shadow: 0 2px 8px var(--shadow-hover);
}

.theme-toggle:active {
  background: var(--bg-active);
  transform: scale(0.95);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--shadow-focus);
}
</style>
