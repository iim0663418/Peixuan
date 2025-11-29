# 剩餘修復計畫

**建立時間**: 2025-11-29 21:55
**當前狀態**: 599 problems (207 errors, 392 warnings)
**剩餘檔案**: 16 個含 no-unused-vars 錯誤

---

## 剩餘檔案清單

### 組件檔案 (4)
1. `src/components/TraitDeconstruction.vue` - 1 個 _unused 變數（line 443）
2. `src/components/UnifiedLayeredController.vue`
3. `src/components/reading-levels/SummaryReadingView.vue`
4. `src/views/HomeView.vue`

### 測試檔案 (4)
5. `src/components/__tests__/ElementsChart.spec.ts`
6. `src/components/__tests__/LanguageSelector.spec.ts`
7. `src/components/__tests__/YearlyFateTimeline.spec.ts`
8. `src/utils/__tests__/enhancedStorageService.spec.ts`

### 類型定義檔案 (2)
9. `src/lunar-javascript.global.d.ts`
10. `src/types/layeredReading.ts` - 可能還有其他未使用的類型

### 工具與服務檔案 (3)
11. `src/composables/useLayeredReading.ts`
12. `src/plugins/errorHandler.ts`
13. `src/utils/yearlyInteractionUtils.ts`

---

## 已手動修復（主程序）

✅ `src/types/displayModes.ts` - 前綴 event, mode 參數
✅ `src/types/layeredReading.ts` - 新增 eslint-disable 註解（部分）
✅ `src/types/global.d.ts` - 新增 eslint-disable 註解
✅ `src/components/StarBrightnessIndicator.vue` - 前綴 props
✅ `src/components/TraitDeconstruction.vue` - 新增 eslint-disable 註解（3/4 處）

---

## 明天執行計畫

### 方法 1: Claude Code 批次處理（推薦）
```bash
claude -p --permission-mode acceptEdits "Fix remaining 16 files with no-unused-vars errors..."
```

### 方法 2: 手動逐一修復
- 預估時間：30-45 分鐘
- 適合測試檔案和簡單情況

### 方法 3: 混合策略
- Claude Code 處理複雜檔案（組件、composables）
- 手動處理簡單檔案（類型定義、測試）

---

## 預期最終結果

- 錯誤數：207 → ~50（移除所有 no-unused-vars）
- 警告數：392 → ~300（保留 any 類型警告）
- 總問題數：599 → ~350 (-41.7%)

---

## 備註

- TraitDeconstruction.vue line 443 仍需修復
- 測試檔案可能有大量 mock 相關的未使用變數
- 類型定義檔案的未使用導出可能是設計上的保留
