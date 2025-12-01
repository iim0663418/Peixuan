# 流年顯示問題診斷報告

**診斷時間**: 2025-12-01 11:22  
**問題來源**: 使用者回報  
**更新時間**: 2025-12-01 11:26 (添加根本原因分析)

---

## 🔍 根本原因分析 (更新)

### 後端已實作但未正確呼叫

**已實作的函數**:
- ✅ `locateAnnualLifePalace` (peixuan-worker/src/calculation/annual/palace.ts)
- ✅ UnifiedCalculator 已呼叫此函數 (Line 204-207)

**問題所在**:
```typescript
const annualLifePalaceIndex = locateAnnualLifePalace(
  annualPillar.branch,
  ziwei.palaces || []  // ❌ ziwei.palaces 為 undefined
);
```

**根本原因**:
- `ZiWeiResult` 介面**沒有 `palaces` 欄位**
- `calculateZiWei` 方法**沒有返回 `palaces`**
- 導致 `ziwei.palaces` 為 undefined
- `locateAnnualLifePalace` 收到空陣列，返回 -1

**參考文件**: doc/八字命理後端模組研究.md §4.2
> 流年地支決定了流年命宮在紫微盤上的位置。
> 系統在紫微盤的 12 宮位陣列中，找到地支為「寅」的宮位索引。

---

## 🔍 問題清單

### 1. 流年命宮顯示 "-1宮" ❌

**位置**: `UnifiedResultView.vue` Line 123

**問題描述**:
```
流年命宮: -1宮
```

**根本原因**:
- `annualLifePalaceIndex` 為 -1
- 可能是後端未實作流年命宮計算
- 或計算邏輯返回錯誤值

**預期值**: 0-11 之間的數字 (對應 12 宮位)

---

### 2. 三合顯示 "(sanhe)" ❌

**位置**: `AnnualInteraction.vue` Line 48

**問題描述**:
```
巳 + 酉 + 丑 → (sanhe)
```

**根本原因**:
**欄位名稱不一致**

**後端格式** (`peixuan-worker/src/calculation/annual/interaction.ts`):
```typescript
interface HarmoniousCombination {
  type: CombinationType;      // 'sanhe' | 'sanhui'
  branches: EarthlyBranch[];
  element: WuXing;             // ❌ 使用 element
}
```

**前端期望** (`AnnualInteraction.vue` Line 48):
```typescript
interface HarmoniousCombination {
  branches: string[];
  result: string;              // ❌ 期望 result
  type: string;
}
```

**差異**:
- 後端使用 `element` (例: 'Metal', 'Water')
- 前端期望 `result` (應該是中文元素名稱)

**影響**: 顯示 `(sanhe)` 而非 `金局` 或 `水局`

---

## 🔧 修復方案

### 方案 1: 修復流年命宮顯示 (需要後端支援)

**問題**: 後端可能未實作 `annualLifePalaceIndex` 計算

**檢查**: 
1. 確認後端是否有 `locateAnnualLifePalace` 函數
2. 確認 UnifiedCalculator 是否呼叫此函數
3. 確認 API 回應是否包含此欄位

**臨時方案**: 前端添加條件顯示
```vue
<el-descriptions-item label="流年命宮" v-if="result.annualFortune.annualLifePalaceIndex >= 0">
  {{ result.annualFortune.annualLifePalaceIndex }}宮
</el-descriptions-item>
<el-descriptions-item label="流年命宮" v-else>
  <el-tag type="info">未計算</el-tag>
</el-descriptions-item>
```

---

### 方案 2: 修復三合顯示 (高優先級)

**檔案**: `bazi-app-vue/src/services/unifiedApiService.ts`

**修改位置**: annualFortune 適配區塊

**當前程式碼**:
```typescript
annualFortune: backendResult.annualFortune,
```

**修復後**:
```typescript
annualFortune: backendResult.annualFortune ? {
  ...backendResult.annualFortune,
  interactions: {
    ...backendResult.annualFortune.interactions,
    harmoniousCombinations: backendResult.annualFortune.interactions.harmoniousCombinations.map((combo: any) => ({
      ...combo,
      result: ELEMENT_TO_CHINESE[combo.element] || combo.element,
    })),
  },
} : undefined,
```

**元素映射表**:
```typescript
const ELEMENT_TO_CHINESE: Record<string, string> = {
  'Wood': '木局',
  'Fire': '火局',
  'Earth': '土局',
  'Metal': '金局',
  'Water': '水局',
};
```

**說明**: 將後端的英文 `element` 轉換為前端的中文 `result`

**風險**: 低（僅資料轉換）

---

## 📊 修復優先級

| 問題 | 優先級 | 預估時間 | 風險 |
|------|--------|----------|------|
| 1. 流年命宮 -1 | MEDIUM | 需後端支援 | 中 |
| 2. 三合顯示 | HIGH | 10 分鐘 | 低 |

---

## 🎯 驗收標準

### 問題 1: 流年命宮
- ✅ 顯示 0-11 之間的數字
- ✅ 或顯示「未計算」標籤（臨時方案）

### 問題 2: 三合顯示
- ✅ 顯示完整資訊：`巳 + 酉 + 丑 → 金局 (sanhe)`
- ✅ 或：`巳 + 酉 + 丑 → 金局 (三合)`
- ✅ 元素名稱為中文

---

## 🔍 後端檢查清單

### 流年命宮計算

**需要確認的檔案**:
- `peixuan-worker/src/calculation/annual/palace.ts` (是否存在)
- `peixuan-worker/src/calculation/integration/calculator.ts` (是否呼叫)

**預期函數**:
```typescript
export function locateAnnualLifePalace(
  annualBranch: EarthlyBranch,
  lifePalacePosition: number
): number {
  // 計算流年命宮位置
  // 返回 0-11 之間的數字
}
```

**如果未實作**: 
- 優先級: MEDIUM
- 預估時間: 1-2 小時
- 需要參考紫微斗數流年命宮定位規則

---

## 📋 測試建議

1. **單元測試**: 驗證元素映射邏輯
2. **視覺測試**: 檢查前端顯示效果
3. **邊界測試**: 測試無三合/三會的情況

---

**診斷人**: Amazon Q Developer CLI  
**診斷方法**: 靜態程式碼分析 + 類型定義比對  
**置信度**: HIGH (基於實際程式碼檢查)
