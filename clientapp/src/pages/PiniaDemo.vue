<!--
  Pinia 狀態管理示範頁面
  實作 Issue #7: Pinia 狀態切分與時間旅行除錯
-->

<template>
  <div class="pinia-demo-page">
    <div class="page-header">
      <h1>🏪 Pinia 狀態管理示範</h1>
      <p class="page-description">
        展示 Pinia 狀態切分、時間旅行除錯和狀態持久化功能
      </p>
    </div>

    <!-- Pinia 驅動的排序視覺化 -->
    <section class="demo-section">
      <h2>🎯 Pinia 驅動的排序視覺化</h2>
      <p class="section-description">
        完全由 Pinia stores 管理的排序視覺化，具備時間旅行除錯功能
      </p>
      <SortingVisualizationPinia />
    </section>

    <!-- 狀態檢查面板 -->
    <section class="demo-section">
      <h2>🔍 Store 狀態檢查器</h2>
      <div class="state-inspector">
        <div class="inspector-tabs">
          <button
            v-for="tab in inspectorTabs"
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="inspector-content">
          <!-- 排序視覺化 Store -->
          <div v-if="activeTab === 'sorting'" class="store-panel">
            <h3>📊 排序視覺化 Store</h3>
            <div class="state-grid">
              <div class="state-item">
                <strong>選中演算法:</strong> {{ sortingStore.selectedAlgorithm }}
              </div>
              <div class="state-item">
                <strong>播放器狀態:</strong> {{ sortingStore.playerState }}
              </div>
              <div class="state-item">
                <strong>當前步驟:</strong> {{ sortingStore.currentStep + 1 }} / {{ sortingStore.totalSteps }}
              </div>
              <div class="state-item">
                <strong>播放速度:</strong> {{ sortingStore.playbackSpeed.toFixed(1) }}x
              </div>
              <div class="state-item">
                <strong>進度:</strong> {{ Math.round(sortingStore.progress * 100) }}%
              </div>
              <div class="state-item">
                <strong>時間旅行:</strong> {{ sortingStore.isTimeTravel ? '進行中' : '關閉' }}
              </div>
              <div class="state-item">
                <strong>快照數量:</strong> {{ sortingStore.timeline.length }}
              </div>
              <div class="state-item">
                <strong>當前數據:</strong> [{{ sortingStore.currentData.join(', ') }}]
              </div>
            </div>
          </div>

          <!-- 渲染器 Store -->
          <div v-if="activeTab === 'renderer'" class="store-panel">
            <h3>🎨 渲染器 Store</h3>
            <div class="state-grid">
              <div class="state-item">
                <strong>活躍渲染器:</strong> {{ rendererStore.activeRenderer || '未初始化' }}
              </div>
              <div class="state-item">
                <strong>首選渲染器:</strong> {{ rendererStore.preferredRenderer }}
              </div>
              <div class="state-item">
                <strong>WebGPU 支援:</strong> {{ rendererStore.isWebGPUAvailable ? '是' : '否' }}
              </div>
              <div class="state-item">
                <strong>Canvas2D 支援:</strong> {{ rendererStore.isCanvas2DAvailable ? '是' : '否' }}
              </div>
              <div class="state-item">
                <strong>可以渲染:</strong> {{ rendererStore.canRender ? '是' : '否' }}
              </div>
              <div class="state-item">
                <strong>正在渲染:</strong> {{ rendererStore.isRendering ? '是' : '否' }}
              </div>
              <div class="state-item">
                <strong>FPS:</strong> {{ rendererStore.performanceSummary.fps }}
              </div>
              <div class="state-item">
                <strong>畫布尺寸:</strong> {{ rendererStore.config.width }}x{{ rendererStore.config.height }}
              </div>
            </div>
          </div>

          <!-- 應用程式 Store -->
          <div v-if="activeTab === 'app'" class="store-panel">
            <h3>⚙️ 應用程式 Store</h3>
            <div class="state-grid">
              <div class="state-item">
                <strong>當前主題:</strong> {{ appStore.currentTheme }}
              </div>
              <div class="state-item">
                <strong>語言:</strong> {{ appStore.preferences.language }}
              </div>
              <div class="state-item">
                <strong>動畫:</strong> {{ appStore.preferences.animations ? '開啟' : '關閉' }}
              </div>
              <div class="state-item">
                <strong>除錯模式:</strong> {{ appStore.isDebugMode ? '是' : '否' }}
              </div>
              <div class="state-item">
                <strong>總會話數:</strong> {{ appStore.stats.totalSessions }}
              </div>
              <div class="state-item">
                <strong>排序運行次數:</strong> {{ appStore.stats.totalSortingRuns }}
              </div>
              <div class="state-item">
                <strong>喜愛演算法:</strong> {{ appStore.stats.favoriteAlgorithm }}
              </div>
              <div class="state-item">
                <strong>會話時長:</strong> {{ formatDuration(appStore.sessionDuration) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 狀態操作面板 -->
    <section class="demo-section">
      <h2>🛠️ 狀態操作面板</h2>
      <div class="action-panels">
        <div class="action-panel">
          <h3>🎛️ 渲染器控制</h3>
          <div class="action-buttons">
            <button
              @click="switchToWebGPU"
              :disabled="!rendererStore.isWebGPUAvailable"
              class="action-button"
            >
              切換到 WebGPU
            </button>
            <button
              @click="switchToCanvas2D"
              :disabled="!rendererStore.isCanvas2DAvailable"
              class="action-button"
            >
              切換到 Canvas2D
            </button>
            <button @click="resetRenderer" class="action-button danger">
              重置渲染器
            </button>
          </div>
        </div>

        <div class="action-panel">
          <h3>🎨 主題控制</h3>
          <div class="action-buttons">
            <button @click="setTheme('light')" class="action-button">
              亮色主題
            </button>
            <button @click="setTheme('dark')" class="action-button">
              深色主題
            </button>
            <button @click="appStore.toggleTheme()" class="action-button">
              切換主題
            </button>
          </div>
        </div>

        <div class="action-panel">
          <h3>🗑️ 資料管理</h3>
          <div class="action-buttons">
            <button @click="clearAllData" class="action-button danger">
              清除所有數據
            </button>
            <button @click="exportAllStates" class="action-button">
              導出狀態
            </button>
            <button @click="triggerFileImport" class="action-button">
              導入狀態
            </button>
          </div>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileImport"
        style="display: none"
      />
    </section>

    <!-- 性能監控 -->
    <section class="demo-section" v-if="appStore.isDebugMode">
      <h2>📈 性能監控</h2>
      <div class="performance-grid">
        <div class="performance-card">
          <h4>渲染性能</h4>
          <div class="metric-value">{{ rendererStore.performanceSummary.fps }} FPS</div>
          <div class="metric-label">當前幀率</div>
        </div>
        <div class="performance-card">
          <h4>幀時間</h4>
          <div class="metric-value">{{ rendererStore.performanceSummary.frameTime }}ms</div>
          <div class="metric-label">每幀耗時</div>
        </div>
        <div class="performance-card">
          <h4>效率</h4>
          <div class="metric-value">{{ Math.round(rendererStore.performanceSummary.efficiency * 100) }}%</div>
          <div class="metric-label">渲染效率</div>
        </div>
        <div class="performance-card">
          <h4>快照</h4>
          <div class="metric-value">{{ sortingStore.timeline.length }}</div>
          <div class="metric-label">時間旅行快照</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSortingVisualizationStore } from '../stores/sortingVisualization'
import { useRendererStore } from '../stores/renderer'
import { useAppStore } from '../stores/app'
import SortingVisualizationPinia from '../components/SortingVisualizationPinia.vue'

// Stores
const sortingStore = useSortingVisualizationStore()
const rendererStore = useRendererStore()
const appStore = useAppStore()

// 組件狀態
const activeTab = ref('sorting')
const fileInput = ref<HTMLInputElement | null>(null)

// 檢查器標籤
const inspectorTabs = [
  { id: 'sorting', label: '排序視覺化' },
  { id: 'renderer', label: '渲染器' },
  { id: 'app', label: '應用程式' }
]

// 方法
async function switchToWebGPU() {
  try {
    await rendererStore.switchRenderer('webgpu')
    appStore.addNotification({
      type: 'success',
      title: '渲染器切換成功',
      message: '已切換到 WebGPU 渲染器',
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '渲染器切換失敗',
      message: error instanceof Error ? error.message : '無法切換到 WebGPU',
      autoClose: true
    })
  }
}

async function switchToCanvas2D() {
  try {
    await rendererStore.switchRenderer('canvas2d')
    appStore.addNotification({
      type: 'success',
      title: '渲染器切換成功',
      message: '已切換到 Canvas2D 渲染器',
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '渲染器切換失敗',
      message: error instanceof Error ? error.message : '無法切換到 Canvas2D',
      autoClose: true
    })
  }
}

function resetRenderer() {
  rendererStore.resetRenderer()
  appStore.addNotification({
    type: 'info',
    title: '渲染器已重置',
    message: '渲染器狀態已重置為初始值',
    autoClose: true
  })
}

function setTheme(theme: 'light' | 'dark') {
  appStore.updatePreferences({ theme })
  appStore.addNotification({
    type: 'info',
    title: '主題已更新',
    message: `已切換到${theme === 'light' ? '亮色' : '深色'}主題`,
    autoClose: true
  })
}

function clearAllData() {
  if (confirm('確定要清除所有數據嗎？此操作將重置所有 Store 狀態且無法復原。')) {
    sortingStore.clearTimeline()
    rendererStore.resetRenderer()
    appStore.resetApp()

    appStore.addNotification({
      type: 'warning',
      title: '數據已清除',
      message: '所有 Store 狀態已重置',
      autoClose: true
    })
  }
}

function exportAllStates() {
  try {
    const exportData = {
      sorting: sortingStore.exportTimeline(),
      app: appStore.exportAppState(),
      renderer: rendererStore.getDiagnostics(),
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pinia-stores-export-${new Date().toISOString().slice(0, 19)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    appStore.addNotification({
      type: 'success',
      title: '狀態已導出',
      message: '所有 Store 狀態已保存到文件',
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '導出失敗',
      message: error instanceof Error ? error.message : '無法導出狀態',
      autoClose: true
    })
  }
}

function triggerFileImport() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)

      if (data.sorting) {
        sortingStore.importTimeline(data.sorting)
      }

      if (data.app) {
        appStore.importAppState(data.app)
      }

      appStore.addNotification({
        type: 'success',
        title: '狀態已導入',
        message: '成功導入 Store 狀態',
        autoClose: true
      })
    } catch (error) {
      appStore.addNotification({
        type: 'error',
        title: '導入失敗',
        message: '文件格式不正確或已損壞',
        autoClose: true
      })
    }
  }
  reader.readAsText(file)
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>

<style scoped>
.pinia-demo-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.demo-section {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  color: #333;
}

.section-description {
  color: #6b7280;
  margin-bottom: 24px;
}

.state-inspector {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.inspector-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #f3f4f6;
}

.tab-button.active {
  background: white;
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

.inspector-content {
  padding: 20px;
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.state-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.action-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.action-panel h3 {
  margin: 0 0 12px 0;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.action-button.danger:hover:not(:disabled) {
  background: #fee2e2;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.performance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.performance-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  opacity: 0.9;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 深色主題支援 */
[data-theme="dark"] .demo-section {
  background: #1f2937;
  color: #f9fafb;
}

[data-theme="dark"] .tab-button.active {
  background: #374151;
}

[data-theme="dark"] .action-panel {
  border-color: #4b5563;
}

[data-theme="dark"] .action-button {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
</style>
