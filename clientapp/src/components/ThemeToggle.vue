<script setup lang="ts">
import { ref, computed } from 'vue'
import { themeManager } from '../composables/themeManager'

const currentTheme = ref(themeManager.getTheme())
const isDarkMode = computed(() => currentTheme.value === 'dark')

const toggleTheme = () => {
  const newTheme = isDarkMode.value ? 'light' : 'dark'
  themeManager.setTheme(newTheme)
  currentTheme.value = newTheme
}

// Listen for theme changes
themeManager.onThemeChange((theme) => {
  currentTheme.value = theme
})
</script>

<template>
  <div class="theme-toggle">
    <button @click="toggleTheme" class="theme-btn" :title="isDarkMode ? '切換到淺色模式' : '切換到深色模式'">
      {{ isDarkMode ? '☀️' : '🌙' }}
    </button>
  </div>
</template>

<style scoped>
/* Styles are in theme.css */
</style>
