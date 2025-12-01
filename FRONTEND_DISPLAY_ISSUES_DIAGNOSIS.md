# 前端顯示問題診斷報告

**診斷時間**: 2025-12-01 11:03  
**問題來源**: 使用者回報

---

## 🔍 問題清單

### 1. 八字命盤與四柱重疊 ❌

**位置**: `UnifiedResultView.vue` Line 5-23

**問題描述**:
- BaziChart 組件 (Line 6-10) 已顯示完整八字命盤
- 四柱區塊 (Line 12-23) 再次顯示相同資料
- 造成視覺重複與混淆

**根本原因**:
BaziChart 組件內部已包含四柱顯示，UnifiedResultView 又額外渲染一次四柱。

**影響**: 使用者體驗差，資訊重複

---

### 2. 五行分布屬性沒有正常顯示 ❌

**位置**: `WuXingChart.vue` + `unifiedApiService.ts`

**問題描述**:
- 五行分布圖表無法正常顯示各屬性數值
- 可能顯示 undefined 或空白

**根本原因**:
**資料格式不一致**

**後端格式** (`peixuan-worker/src/calculation/wuXing/distribution.ts`):
```typescript
interface WuXingDistribution {
  raw: {
    tiangan: Record<WuXing, number>;      // ❌ 嵌套結構
    hiddenStems: Record<WuXing, number>;  // ❌ 嵌套結構
  };
  adjusted: Record<WuXing, number>;       // ✅ 正確
  dominant: WuXing;                       // ✅ 正確
  deficient: WuXing;                      // ✅ 正確
  balance: number;                        // ✅ 正確
}
```

**前端期望** (`WuXingChart.vue` Line 60-64):
```typescript
interface WuXingDistribution {
  raw: { 木: number; 火: number; 土: number; 金: number; 水: number };  // ❌ 扁平結構
  adjusted: { 木: number; 火: number; 土: number; 金: number; 水: number };
  dominant: string | null;
  deficient: string | null;
  balance: number;
}
```

**差異**:
- 後端 `raw` 是嵌套物件 `{ tiangan: {...}, hiddenStems: {...} }`
- 前端期望 `raw` 是扁平物件 `{ 木, 火, 土, 金, 水 }`

**影響**: 無法讀取 `raw.木`，顯示 undefined

---

### 3. 大運各歲沒有顯示 ❌

**位置**: `FortuneTimeline.vue` + `unifiedApiService.ts`

**問題描述**:
- 大運時間軸無法顯示年齡範圍
- 顯示 `undefined-undefined歲`

**根本原因**:
**欄位名稱不一致**

**後端格式** (`peixuan-worker/src/calculation/fortune/dayun.ts`):
```typescript
interface DaYun {
  stem: string;
  branch: string;
  startDate: Date;
  endDate: Date;
  age: number;  // ❌ 僅有單一 age
}
```

**前端期望** (`FortuneTimeline.vue` Line 62-67):
```typescript
interface DaYun {
  stem: string;
  branch: string;
  startAge: number;  // ❌ 期望 startAge
  endAge: number;    // ❌ 期望 endAge
  startDate: Date | string;
  endDate: Date | string;
}
```

**差異**:
- 後端僅提供 `age` (起始年齡)
- 前端期望 `startAge` 和 `endAge`

**影響**: 無法讀取 `startAge`/`endAge`，顯示 undefined

---

## 🔧 修復方案

### 方案 1: 移除重複的四柱區塊 (立即修復)

**檔案**: `bazi-app-vue/src/components/UnifiedResultView.vue`

**修改**: 刪除 Line 12-23 的四柱區塊

**原因**: BaziChart 已包含四柱顯示，無需重複

**風險**: 低

---

### 方案 2: 修復 WuXingDistribution 資料適配 (高優先級)

**檔案**: `bazi-app-vue/src/services/unifiedApiService.ts`

**修改位置**: Line 231 (wuxingDistribution 適配)

**當前程式碼**:
```typescript
wuxingDistribution: backendResult.bazi.wuxingDistribution,
```

**修復後**:
```typescript
wuxingDistribution: backendResult.bazi.wuxingDistribution ? {
  raw: {
    木: (backendResult.bazi.wuxingDistribution.raw.tiangan['木'] || 0) +
        (backendResult.bazi.wuxingDistribution.raw.hiddenStems['木'] || 0),
    火: (backendResult.bazi.wuxingDistribution.raw.tiangan['火'] || 0) +
        (backendResult.bazi.wuxingDistribution.raw.hiddenStems['火'] || 0),
    土: (backendResult.bazi.wuxingDistribution.raw.tiangan['土'] || 0) +
        (backendResult.bazi.wuxingDistribution.raw.hiddenStems['土'] || 0),
    金: (backendResult.bazi.wuxingDistribution.raw.tiangan['金'] || 0) +
        (backendResult.bazi.wuxingDistribution.raw.hiddenStems['金'] || 0),
    水: (backendResult.bazi.wuxingDistribution.raw.tiangan['水'] || 0) +
        (backendResult.bazi.wuxingDistribution.raw.hiddenStems['水'] || 0),
  },
  adjusted: backendResult.bazi.wuxingDistribution.adjusted,
  dominant: backendResult.bazi.wuxingDistribution.dominant,
  deficient: backendResult.bazi.wuxingDistribution.deficient,
  balance: backendResult.bazi.wuxingDistribution.balance,
} : undefined,
```

**說明**: 合併 tiangan 與 hiddenStems 為扁平結構

**風險**: 低（僅資料轉換）

---

### 方案 3: 修復 FortuneCycles 資料適配 (高優先級)

**檔案**: `bazi-app-vue/src/services/unifiedApiService.ts`

**修改位置**: Line 236-240 (dayunList 映射)

**當前程式碼**:
```typescript
dayunList: backendResult.bazi.fortuneCycles.dayunList.map((dayun: any) => ({
  ...dayun,
  startDate: new Date(dayun.startDate),
  endDate: new Date(dayun.endDate),
})),
```

**修復後**:
```typescript
dayunList: backendResult.bazi.fortuneCycles.dayunList.map((dayun: any, index: number) => ({
  ...dayun,
  startAge: dayun.age,
  endAge: dayun.age + 10,
  startDate: new Date(dayun.startDate),
  endDate: new Date(dayun.endDate),
})),
```

**同時修復 currentDayun** (Line 241-247):
```typescript
currentDayun: backendResult.bazi.fortuneCycles.currentDayun ? {
  ...backendResult.bazi.fortuneCycles.currentDayun,
  startAge: backendResult.bazi.fortuneCycles.currentDayun.age,
  endAge: backendResult.bazi.fortuneCycles.currentDayun.age + 10,
  startDate: new Date(backendResult.bazi.fortuneCycles.currentDayun.startDate),
  endDate: new Date(backendResult.bazi.fortuneCycles.currentDayun.endDate),
} : null,
```

**說明**: 
- 添加 `startAge = age`
- 添加 `endAge = age + 10` (每個大運 10 年)

**風險**: 低（僅欄位映射）

---

## 📊 修復優先級

| 問題 | 優先級 | 預估時間 | 風險 |
|------|--------|----------|------|
| 1. 四柱重疊 | HIGH | 5 分鐘 | 低 |
| 2. 五行分布 | HIGH | 15 分鐘 | 低 |
| 3. 大運年齡 | HIGH | 10 分鐘 | 低 |

**總預估時間**: 30 分鐘

---

## 🎯 驗收標準

### 問題 1: 四柱重疊
- ✅ 八字區塊僅顯示一次四柱資訊
- ✅ BaziChart 正常顯示
- ✅ 無視覺重複

### 問題 2: 五行分布
- ✅ 顯示各元素的原始得分
- ✅ 顯示各元素的調整後得分
- ✅ 顯示優勢/缺失元素
- ✅ 顯示平衡度百分比

### 問題 3: 大運年齡
- ✅ 顯示每個大運的年齡範圍 (例: 3-13歲)
- ✅ 顯示當前大運的年齡範圍
- ✅ 時間軸正常渲染

---

## 🔍 測試建議

1. **單元測試**: 驗證資料轉換邏輯
2. **視覺測試**: 檢查前端顯示效果
3. **邊界測試**: 測試空值/undefined 處理

---

**診斷人**: Amazon Q Developer CLI  
**診斷方法**: 靜態程式碼分析 + 類型定義比對  
**置信度**: HIGH (基於實際程式碼檢查)
