<!--
  時間旅行除錯面板組件
  實作 Issue #7: Pinia 狀態切分與時間旅行除錯
-->

<template>
  <div class="time-travel-panel" :class="{ open: isOpen }">
    <!-- 面板切換按鈕 -->
    <button 
      class="panel-toggle"
      @click="togglePanel"
      :title="isOpen ? '關閉時間旅行面板' : '開啟時間旅行面板'"
    >
      <span class="icon">{{ isOpen ? '🔍' : '⏱️' }}</span>
      <span class="label">時間旅行</span>
    </button>

    <!-- 主面板內容 -->
    <div class="panel-content" v-if="isOpen">
      <!-- 面板標題 -->
      <div class="panel-header">
        <h3>🕰️ 時間旅行除錯</h3>
        <div class="panel-stats">
          <span class="snapshot-count">{{ timelineSummary.length }} 個快照</span>
          <span class="current-indicator" v-if="currentSnapshotIndex >= 0">
            當前: {{ currentSnapshotIndex + 1 }}
          </span>
        </div>
      </div>

      <!-- 時間軸控制 -->
      <div class="timeline-controls">
        <button 
          @click="clearTimeline" 
          :disabled="timelineSummary.length === 0"
          class="clear-btn"
          title="清除所有快照"
        >
          🗑️ 清除
        </button>
        <button 
          @click="exportTimeline" 
          :disabled="timelineSummary.length === 0"
          class="export-btn"
          title="導出時間軸"
        >
          📤 導出
        </button>
        <input 
          ref="importInput"
          type="file" 
          accept=".json"
          @change="handleImport"
          style="display: none"
        />
        <button 
          @click="triggerImport"
          class="import-btn"
          title="導入時間軸"
        >
          📥 導入
        </button>
      </div>

      <!-- 時間軸視覺化 -->
      <div class="timeline-visualization" v-if="timelineSummary.length > 0">
        <div class="timeline-track">
          <div 
            v-for="(snapshot, index) in timelineSummary"
            :key="snapshot.id"
            class="timeline-point"
            :class="{ 
              active: index === currentSnapshotIndex,
              clickable: !isTimeTravel 
            }"
            @click="restoreToSnapshot(snapshot.id)"
            :title="`${snapshot.description} (步驟 ${snapshot.step + 1})`"
          >
            <div class="point-indicator"></div>
            <div class="point-label">{{ index + 1 }}</div>
          </div>
        </div>
      </div>

      <!-- 快照列表 -->
      <div class="snapshot-list" v-if="timelineSummary.length > 0">
        <div class="list-header">
          <h4>📋 快照列表</h4>
          <span class="list-count">({{ timelineSummary.length }} 項)</span>
        </div>
        
        <div class="list-container">
          <div 
            v-for="(snapshot, index) in timelineSummary"
            :key="snapshot.id"
            class="snapshot-item"
            :class="{ 
              active: index === currentSnapshotIndex,
              clickable: !isTimeTravel 
            }"
            @click="restoreToSnapshot(snapshot.id)"
          >
            <div class="snapshot-info">
              <div class="snapshot-title">
                <span class="snapshot-number">#{{ index + 1 }}</span>
                <span class="snapshot-description">{{ snapshot.description }}</span>
              </div>
              <div class="snapshot-details">
                <span class="snapshot-algorithm">{{ getAlgorithmName(snapshot.algorithm) }}</span>
                <span class="snapshot-step">步驟 {{ snapshot.step + 1 }}</span>
                <span class="snapshot-time">{{ formatTime(snapshot.timestamp) }}</span>
              </div>
            </div>
            <div class="snapshot-actions">
              <button 
                @click.stop="restoreToSnapshot(snapshot.id)"
                :disabled="isTimeTravel || index === currentSnapshotIndex"
                class="restore-btn"
                title="恢復到此狀態"
              >
                ↩️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div class="empty-state" v-else>
        <div class="empty-icon">📝</div>
        <div class="empty-message">
          <p>尚無快照記錄</p>
          <p class="empty-hint">開始使用排序視覺化來自動創建快照</p>
        </div>
      </div>

      <!-- 時間旅行狀態指示器 -->
      <div class="time-travel-indicator" v-if="isTimeTravel">
        <div class="indicator-content">
          <span class="indicator-icon">⏳</span>
          <span class="indicator-text">正在進行時間旅行...</span>
        </div>
      </div>

      <!-- 除錯信息面板 -->
      <div class="debug-panel" v-if="showDebugInfo">
        <h4>🔧 除錯信息</h4>
        <div class="debug-content">
          <div class="debug-item">
            <strong>當前快照索引:</strong> {{ currentSnapshotIndex }}
          </div>
          <div class="debug-item">
            <strong>時間旅行模式:</strong> {{ isTimeTravel ? '是' : '否' }}
          </div>
          <div class="debug-item">
            <strong>快照總數:</strong> {{ timelineSummary.length }}
          </div>
          <div class="debug-item">
            <strong>最大快照數:</strong> 100
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSortingVisualizationStore } from '../stores/sortingVisualization'
import { useAppStore } from '../stores/app'

// Stores
const sortingStore = useSortingVisualizationStore()
const appStore = useAppStore()

// 組件狀態
const isOpen = ref(false)
const importInput = ref<HTMLInputElement | null>(null)

// 計算屬性
const timelineSummary = computed(() => sortingStore.timelineSummary)
const currentSnapshotIndex = computed(() => sortingStore.currentSnapshotIndex)
const isTimeTravel = computed(() => sortingStore.isTimeTravel)
const showDebugInfo = computed(() => appStore.isDebugMode)

// 方法
function togglePanel() {
  isOpen.value = !isOpen.value
}

function clearTimeline() {
  if (confirm('確定要清除所有快照嗎？此操作無法復原。')) {
    sortingStore.clearTimeline()
    appStore.addNotification({
      type: 'info',
      title: '時間軸已清除',
      message: '所有快照已被移除',
      autoClose: true
    })
  }
}

function exportTimeline() {
  try {
    const data = sortingStore.exportTimeline()
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeline-export-${new Date().toISOString().slice(0, 19)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    appStore.addNotification({
      type: 'success',
      title: '時間軸已導出',
      message: '快照數據已保存到文件',
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '導出失敗',
      message: error instanceof Error ? error.message : '導出時間軸失敗',
      autoClose: true
    })
  }
}

function triggerImport() {
  importInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      sortingStore.importTimeline(data)
      
      appStore.addNotification({
        type: 'success',
        title: '時間軸已導入',
        message: `成功導入 ${data.snapshots?.length || 0} 個快照`,
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

function restoreToSnapshot(snapshotId: string) {
  if (isTimeTravel.value) return
  
  try {
    sortingStore.restoreSnapshot(snapshotId)
    
    appStore.addNotification({
      type: 'info',
      title: '已恢復快照',
      message: '狀態已恢復到指定時間點',
      autoClose: true
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      title: '恢復失敗',
      message: error instanceof Error ? error.message : '無法恢復到指定快照',
      autoClose: true
    })
  }
}

function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    'bubble-sort': '氣泡排序',
    'selection-sort': '選擇排序',
    'insertion-sort': '插入排序'
  }
  return names[algorithm] || algorithm
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}
</script>

<style scoped>
.time-travel-panel {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.panel-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.panel-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.panel-toggle .icon {
  font-size: 16px;
}

.panel-content {
  position: absolute;
  top: 60px;
  right: 0;
  width: 350px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.panel-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.9;
}

.timeline-controls {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-controls button {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-controls button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.timeline-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline-visualization {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-track {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
}

.timeline-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
  cursor: pointer;
}

.timeline-point.clickable:hover .point-indicator {
  background: #3b82f6;
  transform: scale(1.2);
}

.timeline-point.active .point-indicator {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.point-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.2s ease;
}

.point-label {
  font-size: 10px;
  margin-top: 4px;
  color: #6b7280;
}

.snapshot-list {
  max-height: 300px;
  overflow-y: auto;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.list-count {
  font-size: 12px;
  color: #6b7280;
}

.snapshot-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.snapshot-item.clickable:hover {
  background: #f9fafb;
}

.snapshot-item.active {
  background: #ecfdf5;
  border-left: 3px solid #10b981;
}

.snapshot-info {
  flex: 1;
}

.snapshot-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.snapshot-number {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.snapshot-description {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

.snapshot-details {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
}

.snapshot-actions {
  display: flex;
  gap: 4px;
}

.restore-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restore-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.restore-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-message p {
  margin: 8px 0;
  color: #6b7280;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.8;
}

.time-travel-indicator {
  padding: 12px 20px;
  background: #fef3c7;
  border-top: 1px solid #f59e0b;
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
}

.debug-panel {
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.debug-panel h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.debug-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.debug-item {
  font-size: 12px;
  color: #6b7280;
}

.debug-item strong {
  color: #374151;
}

/* 深色主題支援 */
[data-theme="dark"] .panel-content {
  background: #1f2937;
  color: #f9fafb;
}

[data-theme="dark"] .timeline-controls button {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

[data-theme="dark"] .snapshot-item {
  border-bottom-color: #374151;
}

[data-theme="dark"] .snapshot-item:hover {
  background: #374151;
}
</style>
