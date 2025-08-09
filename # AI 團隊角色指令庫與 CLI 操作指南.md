# AI 團隊角色指令庫與 CLI 操作指南

本文件協助所有 AI 代理（Copilot Agents）在使用 CLI 工具時，能準確將內容導向專案的指定目標分支 `Gary`。請參考以下說明，確保團隊協作流程順利並符合最佳實踐。

---

## 1️⃣ 目標分支說明

- **主要開發分支名稱**：`Gary`
- 所有自動化操作、Pull Request（PR）、文件同步，預設皆應以 `Gary` 為目標分支。
- 若遇特殊需求（如熱修復、臨時實驗），請標註明確分支名稱，否則一律以 `Gary` 為主。

---

## 2️⃣ CLI 工具操作指引

### ⏩ 產生 Pull Request (PR)

當 AI 角色需要將變更同步至 repository 時，請遵循以下標準流程：

1. **建立新分支**  
   建議以 `feature/`、`fix/` 或 `docs/` 開頭，例如：  
   ```
   feature/algorithm-visualization
   ```
2. **提交變更並推送**
   ```
   git add .
   git commit -m "新增演算法視覺化文件"
   git push origin feature/algorithm-visualization
   ```
3. **建立 Pull Request**
   - **來源分支**：feature/algorithm-visualization（或其他）
   - **目標分支**：`Gary`
   - 輸入清楚的 PR 標題與描述，說明本次內容與動機。

### ⏩ 自動化代理指令範例

- 產生技術文件並自動送出 PR 至 `Gary`：
  ```
  role:SA @sync target:Gary
  ```
- 實作新功能並自動 PR：
  ```
  role:FE @sync target:Gary
  ```
- 維護文件、同步至指定分支：
  ```
  @update-docs target:Gary
  ```

---

## 3️⃣ PR 審核與合併流程

1. **所有 PR 預設導向 `Gary` 分支。**
2. 團隊成員或 PM 應審核每一筆 PR，確認內容正確、無誤導分支情形。
3. 合併後務必同步 pull 最新 `Gary` 分支內容至本地、其他 feature 分支。

---

## 4️⃣ 常見問題解答

- **Q：忘記設定目標分支怎麼辦？**  
  A：請於建立 PR 時選擇 `Gary` 為目標分支，或於 GitHub 上直接修改。

- **Q：CLI 工具未指定分支會怎樣？**  
  A：預設將導向 `Gary`，請善用 `target:Gary` 明確標註。

---

## 5️⃣ 角色與責任（快速參考）

| 角色   | 主要任務           | CLI 標準行為                  |
|--------|--------------------|-------------------------------|
| AI     | 協作、整合         | PR 或文件預設導向 `Gary`      |
| PM     | 專案規劃、分工     | PR/Issue 指向 `Gary`          |
| SA     | 技術架構、分析     | 文件與程式 PR 指向 `Gary`     |
| UX     | 介面設計、流程優化 | 設計稿與建議 PR 指向 `Gary`   |
| FE     | 前端實作           | 前端開發 PR 指向 `Gary`       |
| BE     | 後端開發           | 後端開發 PR 指向 `Gary`       |

---

## 6️⃣ 附錄

- **CLI 指令庫**：請參閱本目錄下的 `prompt-design-guide.md` 取得更多自動化與同步指令範例。
- **工作流程說明**：請參閱 `auto-documentation-workflow.md` 了解自動化代理如何串接並同步文件。

---

**備註**：此文件會隨專案需求自動更新，所有 AI 代理請務必依此標準作業流程執行！
