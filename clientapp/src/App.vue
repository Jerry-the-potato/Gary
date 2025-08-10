<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import ThemeToggle from './components/ThemeToggle.vue'

// 初始化應用程式 Store
const appStore = useAppStore()

onMounted(async () => {
  try {
    await appStore.initializeApp()
  } catch (error) {
    console.error('應用程式初始化失敗:', error)
  }
})
</script>

<template>
  <div>
    <ThemeToggle />
    
    <!-- 全域通知容器 -->
    <div class="notifications-container">
      <div 
        v-for="notification in appStore.recentNotifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
        @click="appStore.removeNotification(notification.id)"
      >
        <div class="notification-header">
          <strong>{{ notification.title }}</strong>
          <button class="notification-close" @click.stop="appStore.removeNotification(notification.id)">
            ×
          </button>
        </div>
        <div class="notification-message">
          {{ notification.message }}
        </div>
      </div>
    </div>
    
    <header class="topbar">
      <nav class="nav">
        <router-link to="/" class="link">首頁</router-link>
        <router-link to="/webgpu" class="link">WebGPU</router-link>
        <router-link to="/pinia-demo" class="link">Pinia 示範</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<style scoped>
.topbar { 
  border-bottom: 1px solid var(--border-color); 
  padding: 10px 16px; 
  background: var(--bg-primary); 
}

.nav { 
  display: flex; 
  gap: 12px; 
}

.link { 
  text-decoration: none; 
  color: var(--text-primary); 
}

.link.router-link-active { 
  font-weight: 600; 
  color: var(--accent-primary); 
}

/* 通知系統樣式 */
.notifications-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  animation: slideIn 0.3s ease;
  backdrop-filter: blur(10px);
}

.notification-info {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.notification-success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.notification-warning {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.notification-error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-message {
  font-size: 14px;
  opacity: 0.9;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
