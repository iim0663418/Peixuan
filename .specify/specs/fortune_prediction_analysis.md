# 運勢預測系統架構與問題深度分析報告

## 1. 問題根因分析 (Root Cause Analysis)

經過對關鍵程式碼的審查，確認當前系統的運作邏輯與用戶期望存在結構性落差：

### 1.1 時間範圍預測過遠 (Time Range Issue)
*   **硬編碼邏輯 (Hardcoding):** 在 `nextYearCalculator.ts` 中，`calculateNextYear` 函數採取了簡單粗暴的 `year + 1` 策略。
    ```typescript
    const year = currentYear || new Date().getFullYear(); // 取得 2026
    const nextYear = year + 1; // 強制鎖定 2027
    ```
*   **設計假設失效:** 原設計假設用戶通常在年底或年初想要看「下一整年」的運勢。但在 2026/01/02 這個時間點，用戶更關心的是「2026 本命年」或「當下開始的運勢」，而非遙遠的 2027。
*   **缺乏彈性:** `calculateYearlyForecast` 雖然支持起始日期，但內部邏輯將結束日期鎖死為 `queryDate + 365`，無法適應「半年」或「自定義區間」的需求。

### 1.2 干支年份判定疑慮 (GanZhi Calculation Ambiguity)
*   **學理 vs. 直覺的衝突:** 2026年1月2日尚未過「立春」(約2月4日)。
    *   **程式邏輯:** `liuchun.ts` 正確判定 1月2日 仍屬 **乙巳年 (2025太陽年)** 的尾聲。
    *   **用戶預期:** 用戶看到「2026」直覺對應 **丙午年**。若系統顯示「2026運勢：乙巳年」，用戶會認為是 Bug。
*   **預測區間錯位:** 如果系統預測的是「2027 (丁未)」，那就不存在乙巳/丙午的爭議。用戶提到的誤判極可能發生在系統試圖解釋「當前時間點」的歸屬時，或者是系統在計算 2026 整體運勢時，錯誤地以 1/1 為基準點取了立春前的干支。

## 2. 架構影響評估 (Architectural Impact)

要滿足「未來半年預測」與「手動指定年份」需求，需對現有架構進行中度重構：

1.  **API 簽名變更:**
    *   單純的 `calculateNextYear` 已不足以描述功能。需要轉型為 `calculatePeriodForecast` (區間運勢)。
    *   需引入 `Duration` 或 `EndDate` 概念至核心計算層。

2.  **流年交接處理複雜化:**
    *   「未來半年」(2026/01 - 2026/06) 將橫跨 **乙巳年尾** 與 **丙午年頭**。
    *   現有架構傾向於「一年一運」。新架構必須能優雅地處理 **「混合流年」** (Mixed Annual Pillars) 的情況，即一份報告中包含兩段流年分析的過渡。

3.  **前端展示層:**
    *   原本的「2027 運勢卡片」UI 結構可能無法容納跨流年的資訊展示，需要調整為以「時間軸」或「區段」為主的顯示方式。

## 3. 最佳解決方案建議 (Proposed Solution)

### 3.1 核心邏輯重構 (Core Logic Refactoring)

建議廢棄 `calculateNextYear`，新建通用函數 `calculateForecastByDuration`：

```typescript
interface ForecastOptions {
  startDate: Date;
  durationMonths: number; // default 6
  forceYear?: number;     // Manual override
}

// 邏輯流程：
// 1. 確定起始與結束時間 (e.g., 2026-01-02 to 2026-07-02)
// 2. 識別區間內包含的所有立春節點 (Lichun)
// 3. 分段計算：
//    - Segment A: 2026-01-02 ~ 2026-02-04 (屬 乙巳年)
//    - Segment B: 2026-02-04 ~ 2026-07-02 (屬 丙午年)
// 4. 聚合分析結果
```

### 3.2 修正年份顯示邏輯 (Year Display Logic)

針對 1月/2月立春前的尷尬期，實施「雙軌顯示策略」：
*   **曆法年 (Calendar Year):** 2026
*   **命理年 (Solar Year):** 乙巳 (至2/4換運) → 丙午
*   **UI 提示:** 明確標示「您目前處於乙巳年尾，2月4日後進入丙午年運勢」。

### 3.3 新增配置參數 (Configuration)

在 `BirthInfo` 或請求參數中新增 `forecastPreferences`:
```typescript
type ForecastType = 'NEXT_6_MONTHS' | 'NEXT_12_MONTHS' | 'SPECIFIC_YEAR';

interface ForecastConfig {
  type: ForecastType;
  targetYear?: number; // 當 type 為 SPECIFIC_YEAR 時生效
}
```

## 4. 實施風險 (Risks)

*   **回歸錯誤 (Regression):** 現有依賴 `calculateNextYear` 的單元測試與組件可能會崩潰。需確保向後兼容或同步更新所有調用點。
*   **性能開銷:** 若區間跨度大（如跨3年），計算立春與流月流日的開銷會成倍增加。
*   **文本生成混亂:** LLM 或規則生成的解讀文本可能無法流暢地敘述「前一個月運氣不好(上一年)，後五個月運氣好(下一年)」的轉折，需要強化 prompt 或模板邏輯。

## 5. 測試策略 (Testing Strategy)

1.  **邊界值測試 (Boundary Testing):**
    *   測試日期：2026-02-03 (立春前一天) 預測 6 個月。驗證是否正確切換干支 (乙巳 -> 丙午)。
    *   測試日期：2026-02-05 (立春後一天) 預測 6 個月。驗證是否全為 丙午。
2.  **跨年測試:**
    *   由 2026-11-01 預測 6 個月 (跨至 2027)。
3.  **對比測試:**
    *   確保手動指定 2026 年的結果，與自動計算區間包含 2026 年的結果一致。
4.  **驗收標準:**
    *   1/2 請求預測，必須包含 2026 丙午年的主要內容，而非直接跳到 2027。
