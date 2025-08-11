# 🤖 AI Assistant Development Guide

## 📁 專案結構說明

此專案為多層次結構，**前端開發請在 `clientapp` 子目錄中進行**：

```
Gary/ (根目錄)
├── clientapp/          # 🎯 前端專案主目錄 (Vue3 + Vite)
│   ├── package.json    # 前端依賴與腳本
│   ├── src/           # 前端源碼
│   └── ...
├── docs/              # 📚 專案文件
└── package.json       # 根目錄配置 (非前端)
```

## 🚨 重要提醒：開發伺服器管理

### ⚡ 解決AI指令卡死問題

**問題**: `npm run dev` 會佔用終端，導致AI後續指令無法執行

**解決方案**: 使用背景運行或新視窗啟動

#### 🎯 推薦的啟動方式：

1. **背景啟動** (推薦給AI使用)：
   ```powershell
   # 根目錄執行
   npm run dev:detached
   # 或
   .\dev-server.ps1 start-bg
   ```

2. **新視窗啟動**：
   ```powershell
   npm run dev:new-window
   # 或
   .\dev-server.ps1 start-new
   ```

3. **PowerShell腳本管理**：
   ```powershell
   .\dev-server.ps1 start      # 當前視窗啟動
   .\dev-server.ps1 start-bg   # 背景啟動
   .\dev-server.ps1 stop       # 停止伺服器
   .\dev-server.ps1 status     # 檢查狀態
   .\dev-server.ps1 restart    # 重啟伺服器
   ```

#### 🛑 停止開發伺服器：
```powershell
npm run stop:dev
# 或
.\dev-server.ps1 stop
```

### 對於AI助手的指令執行：

1. **前端相關指令**請在 `clientapp` 目錄中執行：
   ```powershell
   cd clientapp
   npm run dev:detached  # ✅ 正確 - 背景啟動，不佔用終端
   npm install          # ✅ 正確
   npm run test         # ✅ 正確
   ```

2. **錯誤示例** - 會卡死AI的指令：
   ```powershell
   npm run dev          # ❌ 會佔用終端，阻塞後續指令
   ```

## 🛠️ VS Code 任務配置

已配置以下任務（會自動在 `clientapp` 目錄執行）：

- `Frontend: Start Dev Server` - 啟動開發伺服器 (會佔用終端)
- `Frontend: Start Dev Server (Background)` - 背景啟動 (AI推薦)
- `Frontend: Start Dev Server (New Window)` - 新視窗啟動
- `Frontend: Stop Dev Server` - 停止開發伺服器
- `Frontend: Install Dependencies` - 安裝依賴
- `Frontend: Build` - 建置專案
- `Frontend: Test` - 執行測試

### 使用任務的方式：
```
Ctrl+Shift+P -> Tasks: Run Task -> 選擇對應任務
```

### 🤖 AI助手推薦使用：
- 使用 `Frontend: Start Dev Server (Background)` 避免終端阻塞
- 使用 `Frontend: Stop Dev Server` 來停止伺服器

## 🤖 AI 助手使用指南

### 推薦的工作流程：

1. **啟動開發環境** (背景模式)：
   ```powershell
   # 方法1: 使用便捷腳本 (推薦)
   npm run dev:detached

   # 方法2: 使用PowerShell腳本
   .\dev-server.ps1 start-bg

   # 方法3: 手動背景啟動
   cd clientapp
   npm run dev:detached
   ```

2. **檢查伺服器狀態**：
   ```powershell
   .\dev-server.ps1 status
   ```

3. **前端代碼修改**：
   - 所有前端檔案都在 `clientapp/src/` 中
   - 使用 `replace_string_in_file` 工具編輯 Vue/TS 檔案

4. **測試執行**：
   ```powershell
   cd clientapp
   npm run test
   ```

5. **停止開發伺服器**：
   ```powershell
   npm run stop:dev
   # 或
   .\dev-server.ps1 stop
   ```

## 🎯 當前開發焦點

根據 `/docs/角色工作流程/UIUX/夜間模式建議.md`：

- **主要任務**：夜間模式 UI/UX 優化
- **關鍵組件**：
  - `SortingVisualization.vue` - 排序視覺化
  - `TimeTravelPanel.vue` - 時間旅行面板
  - `ThemeToggle.vue` - 主題切換
- **樣式檔案**：`src/styles/theme.css`

## 📋 開發檢查清單

- [ ] 確認終端工作目錄為 `clientapp`
- [ ] 使用 VS Code 任務而非直接終端指令
- [ ] 修改前端檔案時使用正確的檔案路徑
- [ ] 測試時確認在正確目錄執行
