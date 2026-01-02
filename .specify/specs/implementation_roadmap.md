# 運勢預測系統重構實施路線圖 (Roadmap)

基於推薦技術棧 (date-fns, lunar-typescript) 的 6 個月運勢預測功能實作規劃。

## 1. 詳細實施步驟 (Implementation Steps)

### 階段一：環境準備與依賴管理 (Phase 1: Setup)
- [ ] **檢查現有環境**：確認 `peixuan-worker` 目錄下的 `package.json`。
- [ ] **安裝新依賴**：在 `peixuan-worker` 中安裝 `date-fns`。
  ```bash
  npm install date-fns
  ```
- [ ] **鎖定版本**：確保 `lunar-typescript` 版本符合需求 (1.8+)。

### 階段二：核心邏輯重構 (Phase 2: Core Logic)
- [ ] **重構 `calculateYearlyForecast`**：
  - 修改函數簽名，新增 `durationMonths` 參數（預設值 12 以保持向後兼容）。
  - 將 `endDate` 的計算邏輯從 `currentDate.setFullYear(year + 1)` 改為使用 `date-fns` 的 `addMonths(startDate, durationMonths)`。
  - 優化迴圈邏輯，確保能處理非整年的時間跨度。
- [ ] **實作 `calculateSixMonthForecast`**：
  - 建立新的包裝函數，固定傳遞 `durationMonths = 6`。
- [ ] **優化節氣計算 (Optional)**：
  - 評估是否在本次迭代中引入 `lunar-typescript` 的進階節氣查詢，或暫時維持現有 `getLichunDatesBetween` 但適配新的日期範圍。

### 階段三：調用點與格式化更新 (Phase 3: Integration)
- [ ] **更新 `calculator.ts` (或相關 Controller)**：
  - 根據業務邏輯（如用戶意圖或預設配置）決定調用 12 個月還是 6 個月預測。
  - 針對 "近期運勢" 查詢，切換至 `calculateSixMonthForecast`。
- [ ] **更新 `advancedMarkdownFormatter.ts`**：
  - 調整輸出的標題與時間範圍描述，避免寫死 "流年" 字眼，改用 "區間運勢" 或動態顯示日期範圍。
  - 確保 Markdown 輸出能正確反映跨越立春的兩個年份（如乙巳尾 + 丙午頭）。

## 2. 代碼修改清單 (Code Modification List)

| 文件路徑 (peixuan-worker) | 修改性質 | 詳細內容 |
|-------------------------|---------|---------|
| `package.json` | 配置 | 新增 `"date-fns": "^3.6.0"` |
| `src/calculation/calculateYearlyForecast.ts` | 修改 | 1. 引入 `addMonths`, `format` from `date-fns`<br>2. 參數列表加入 `durationMonths: number = 12`<br>3. 計算 `endDate` 邏輯替換<br>4. 修改主迴圈終止條件 |
| `src/calculation/index.ts` (或 export 檔) | 新增 | 導出 `calculateSixMonthForecast` 函數 |
| `src/formatters/advancedMarkdownFormatter.ts` | 修改 | 支援動態時間範圍的標題顯示 (e.g., "2026/01 - 2026/06 運勢分析") |
| `src/controllers/fortuneController.ts` | 修改 | (若有) 根據請求參數決定預測時長 |

## 3. 測試策略 (Testing Strategy)

### 單元測試 (Unit Tests)
建立/更新 `test/calculation/forecast.test.ts`：

1.  **向後兼容測試**：
    - 調用 `calculateYearlyForecast` 不帶新參數，驗證輸出是否仍為 1 年且結果與重構前一致。
2.  **6個月預測測試**：
    - 輸入：`2026-01-02`
    - 預期輸出：
      - `startDate`: `2026-01-02`
      - `endDate`: `2026-07-02`
      - 包含兩個流年段落：乙巳 (2025) 與 丙午 (2026)。
3.  **邊界測試 (立春)**：
    - 驗證立春日 (2026-02-04) 當天的切換邏輯是否準確。

### 集成測試 (Integration Tests)
- 使用 `wrangler dev` 本地模擬請求，驗證 API 返回的 JSON 結構及 Markdown 內容是否正確反映 6 個月區間。

## 4. 部署計劃 (Deployment Plan)

1.  **Staging 部署**：
    - 執行 `npm run deploy:staging`。
    - 手動驗證：使用測試帳號查詢 2026-01-02 的運勢，檢查輸出的時間範圍。
2.  **Production 部署**：
    - 確認 Staging 無誤後，執行 `npm run deploy`。
3.  **監控**：
    - 觀察 Worker Logs 是否有異常的日期計算錯誤或超時（死迴圈）。

## 5. 風險控制措施 (Risk Mitigation)

-   **風險 1：依賴衝突**
    -   *措施*：在安裝 `date-fns` 後運行完整的測試套件 (`npm test`) 確保無副作用。
-   **風險 2：日期計算錯誤導致死迴圈**
    -   *措施*：在 `while` 迴圈中加入安全計數器 (Safety Counter)，超過一定月數（如 24 個月）強制跳出並報錯。
-   **風險 3：用戶對"跨年"的困惑**
    -   *措施*：在 UI 或 Markdown 輸出中明確標示「農曆乙巳年尾」與「農曆丙午年頭」，強調立春作為分界點。
