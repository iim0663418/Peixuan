# 進階分析修復計劃

## 問題 1：星曜對稱數據不正確

### 現象
```
紫微（第9宮）↔ 天府（第9宮）：opposite
```
兩顆星在同一宮位卻標記為 "opposite"（對宮）

### 根本原因
`calculator.ts` 中的 `calculateStarSymmetry` 函數生成的數據有誤。

### 修復方案
檢查並修正 `calculateStarSymmetry` 函數：
- 紫微和天府應該是對宮關係（相差 6 個宮位）
- 文昌和文曲應該是配對關係
- 確保 position 和 symmetryPosition 計算正確

### 文件位置
`peixuan-worker/src/calculation/integration/calculator.ts`

---

## 問題 2：缺少下一年預測部分

### 現象
Gemini 輸出中沒有「🔮 下一年預測」section

### 可能原因
1. Markdown 輸入太長，Gemini 輸出被截斷
2. `formatNextYearBasic` 函數拋出錯誤
3. Gemini prompt 沒有要求生成這部分

### 修復方案

#### 方案 A：檢查 Markdown 長度
- 檢查 `formatAdvancedMarkdown` 生成的 Markdown 長度
- 如果超過 ~1000 tokens，需要精簡內容

#### 方案 B：檢查錯誤處理
- 在 `formatNextYearBasic` 中添加更詳細的錯誤日誌
- 確保 `calculateNextYear` 函數正常工作

#### 方案 C：更新 Gemini Prompt
- 在 `buildAdvancedAnalysisPrompt` 中明確要求生成下一年預測
- 確保 prompt 包含所有 5 個 section

### 文件位置
- `peixuan-worker/src/formatters/advancedMarkdownFormatter.ts`
- `peixuan-worker/src/services/geminiService.ts`
- `peixuan-worker/src/calculation/annual/nextYearCalculator.ts`

---

## 優先級
1. **HIGH**: 修復星曜對稱數據（影響準確性）
2. **HIGH**: 確保下一年預測部分生成（核心功能缺失）

## 下一步
1. 檢查 `calculateStarSymmetry` 函數邏輯
2. 添加日誌查看 Markdown 生成內容
3. 測試 `calculateNextYear` 函數是否正常
4. 更新 Gemini prompt 確保完整輸出
