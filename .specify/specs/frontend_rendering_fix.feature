# Frontend Rendering & State Management Fix Specification

## Problem Analysis

### Issue 1: 粗體星曜漸層效果未正確渲染
- **Root Cause**: Markdown 渲染器 (marked) 將 `**星曜名稱(亮度)**` 轉為 HTML `<strong>`，但前端沒有解析括號內的亮度資訊
- **Current State**: CSS 僅有 `.markdown-body :deep(strong)` 基本樣式，無星曜亮度語意色彩
- **Expected**: 粗體星曜應顯示對應的亮度漸層色彩（廟=紅色、旺=橙色、得=綠色等）

### Issue 2: 分析類型切換時內容未清除
- **Root Cause**: UnifiedAIAnalysisView.vue 缺少路由變更監聽，`analysisText` ref 在 personality/fortune 間切換時未重置
- **Current State**: 從個性分析切換到運勢分析時，顯示舊的個性分析內容
- **Expected**: 切換分析類型時應清除舊內容並重新載入

## Fix Strategy

### 1. 星曜亮度渲染修復
- 創建自定義 Markdown 渲染器，解析 `**星曜名稱(亮度)**` 格式
- 將解析出的星曜名稱包裝為 StarBrightnessIndicator 組件
- 保持現有 marked 渲染器的其他功能

### 2. 狀態清除修復
- 添加 `watch(analysisType)` 監聽路由變更
- 在分析類型變更時重置 `analysisText`、`error`、`progress` 等狀態
- 確保 EventSource 正確關閉並重新建立

## Implementation Plan

1. 修改 `renderMarkdown` 函數，添加星曜亮度解析邏輯
2. 添加 `watch` 監聽器處理路由變更
3. 確保向後相容性，不影響其他 Markdown 內容

## Safety Measures
- 最小化變更，僅修改必要邏輯
- 保留現有 CSS 樣式作為 fallback
- 測試兩種分析類型的切換功能
