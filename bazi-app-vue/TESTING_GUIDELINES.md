# 佩璇的智慧結晶v1 - 測試指引

本文件提供「佩璇的智慧結晶v1」專案的測試相關指引。

## 測試目標

*   **正確性**: 確保所有命理相關的計算（如八字排盤、十神、五行分析、流年互動）結果準確無誤。
*   **穩定性**: 驗證本地資料儲存（查詢紀錄、用戶設定）與快取機制的穩定性與可靠性。
*   **使用者體驗**: 確認各 Vue 元件的渲染、互動行為符合預期，並在不同裝置上有一致的體驗。

## 測試工具

*   **[Vitest](https://vitest.dev/)**: 主要的測試框架，用於執行單元測試和元件測試。
*   **[Happy DOM](https://github.com/capricorn86/happy-dom)**: 用於在 Node.js 環境中模擬瀏覽器 DOM，以便進行元件測試。
*   **[@vue/test-utils](https://test-utils.vuejs.org/)**: Vue 官方提供的元件測試工具庫。

## 如何運行測試

1.  **運行所有測試**:
    ```bash
    npm test
    ```
    或者
    ```bash
    npx vitest
    ```
2.  **運行測試並開啟 UI 介面**:
    ```bash
    npm run test:ui
    ```
    或者
    ```bash
    npx vitest --ui
    ```
    這將在瀏覽器中開啟一個互動式介面，方便查看測試結果與調試。

## 測試範圍

*   **核心工具函式 (Unit Tests)**:
    *   路徑: `bazi-app-vue/src/utils/`
    *   重點測試檔案:
        *   `baziCalc.ts`: 八字排盤、大運計算等核心邏輯。
        *   `yearlyInteractionUtils.ts`: 流年與命盤干支互動（刑沖合害）的判斷邏輯。
        *   `storageService.ts`: 本地儲存服務的讀寫、更新、刪除操作。
*   **Vue 元件 (Component Tests)**:
    *   路徑: `bazi-app-vue/src/components/`
    *   重點測試檔案 (及其 `__tests__` 子目錄下的 `.spec.ts` 檔案):
        *   `UserInputForm.vue`: 使用者輸入表單的驗證、資料提交。
        *   `BaziChart.vue`: 八字命盤圖的正確渲染。
        *   `ElementsChart.vue`: 五行能量圖表的資料綁定與顯示。
        *   `YearlyFateTimeline.vue`: 流年時間軸的互動與資料更新。
*   **PWA 功能**:
    *   手動測試 Service Worker 的快取機制。
    *   驗證應用程式在離線狀態下的基本可用性。

## 測試案例範例

專案中已包含部分測試案例，可作為參考：

*   `bazi-app-vue/src/components/__tests__/BaziChart.spec.ts`
*   `bazi-app-vue/src/components/__tests__/ElementsChart.spec.ts`
*   `bazi-app-vue/src/components/__tests__/YearlyFateTimeline.spec.ts`

## 測試策略

*   **計算邏輯**:
    *   使用已知的命例資料作為輸入，驗證輸出結果是否與預期一致。
    *   涵蓋各種邊界條件，例如：
        *   不同時區的轉換。
        *   閏月的處理。
        *   特殊八字組合。
*   **元件渲染與互動**:
    *   使用 `@vue/test-utils` 掛載元件。
    *   模擬用戶輸入和操作（如點擊、滑動）。
    *   斷言元件的 props、data、computed properties 是否符合預期。
    *   檢查渲染出的 DOM 結構和內容是否正確。
    *   驗證事件是否按預期觸發。
*   **資料儲存**:
    *   測試資料的增、刪、改、查操作。
    *   驗證資料在不同會話間的持久性。
    *   測試儲存空間滿或讀寫錯誤時的處理。
*   **PWA 與離線功能**:
    *   透過瀏覽器開發者工具模擬離線狀態。
    *   檢查 Service Worker 是否正確快取靜態資源與 API 回應。
    *   確認應用程式在離線時仍能提供核心功能（如查閱已儲存的命盤）。

## 編寫新測試

*   **命名規範**: 測試檔案應以 `.spec.ts` 或 `.test.ts` 結尾，並放置於對應模組的 `__tests__` 目錄下，或與被測試檔案同級。
*   **結構**: 遵循 Vitest 的 `describe`, `it`, `expect` 結構。
*   **可讀性**: 測試描述應清晰明瞭，讓人一眼就能看出測試的目的。
*   **獨立性**: 每個測試案例應相互獨立，不應依賴其他測試的狀態。
*   **覆蓋率**: 盡可能提高測試覆蓋率，特別是核心邏輯和關鍵元件。

## 持續整合 (CI)

(待規劃) 建議未來整合 GitHub Actions 或類似 CI/CD 工具，在每次提交或合併請求時自動運行測試，確保程式碼品質。
