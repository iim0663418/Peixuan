# 前後端資料契約審計報告

**日期**: 2025-11-30  
**目的**: 識別前端組件與後端 API 輸出的不匹配，清理無資料支援的組件

---

## 後端 API 輸出結構

### 1. `/api/v1/calculate` (UnifiedCalculator)

**輸出**: `CalculationResult`

```typescript
{
  input: BirthInfo,
  bazi: {
    fourPillars: { year, month, day, hour },
    trueSolarTime: Date,
    hiddenStems: { year, month, day, hour },
    tenGods: { year, month, hour },
    wuxingDistribution: WuXingDistribution,
    fortuneCycles: {
      qiyunDate, direction, dayunList, currentDayun
    },
    calculationSteps, metadata
  },
  ziwei: {
    lifePalace, bodyPalace, bureau,
    ziWeiPosition, tianFuPosition,
    auxiliaryStars: { wenChang, wenQu, zuoFu, youBi },
    starSymmetry: StarSymmetry[],
    calculationSteps, metadata
  },
  annualFortune?: {
    annualPillar, annualLifePalaceIndex,
    interactions: { stemCombinations, branchClashes, harmoniousCombinations },
    taiSuiAnalysis: { zhi, chong, xing, po, hai, severity, types, recommendations }
  }
}
```

### 2. `/api/v1/purple-star/calculate` (Hybrid API)

**輸出**: `PurpleStarApiResponse`

```typescript
{
  data: {
    chart: {
      core: { lifePalace, bodyPalace, bureau, ziWeiPosition, tianFuPosition },
      palaces: Palace[],  // Legacy 完整星系
      mingPalaceIndex, shenPalaceIndex, mingGan, fiveElementsBureau
    }
  }
}
```

---

## 前端組件審計

### ✅ 有完整資料支援的組件

| 組件 | 使用資料 | API 來源 | 狀態 |
|------|---------|---------|------|
| `UnifiedInputForm.vue` | 輸入表單 | N/A | ✅ 正常 |
| `UnifiedResultView.vue` | `CalculationResult` 全部 | `/api/v1/calculate` | ✅ 正常 |
| `BaziChart.vue` | `bazi.fourPillars` | `/api/v1/calculate` | ✅ 正常 |
| `WuXingChart.vue` | `bazi.wuxingDistribution` | `/api/v1/calculate` | ✅ 正常 |
| `FortuneTimeline.vue` | `bazi.fortuneCycles` | `/api/v1/calculate` | ✅ 正常 |
| `StarSymmetryDisplay.vue` | `ziwei.starSymmetry` | `/api/v1/calculate` | ✅ 正常 |
| `TaiSuiCard.vue` | `annualFortune.taiSuiAnalysis` | `/api/v1/calculate` | ✅ 正常 |
| `AnnualInteraction.vue` | `annualFortune.interactions` | `/api/v1/calculate` | ✅ 正常 |
| `TechnicalDetailsCard.vue` | `calculationSteps`, `metadata` | `/api/v1/calculate` | ✅ 正常 |
| `DeveloperCard.vue` | 完整 `result` | `/api/v1/calculate` | ✅ 正常 |
| `LanguageSelector.vue` | UI 控制 | N/A | ✅ 正常 |

### ⚠️ 資料部分缺失的組件

| 組件 | 期望資料 | 實際狀態 | 建議 |
|------|---------|---------|------|
| `CompactReadingView.vue` | 完整命盤解讀 | ❌ 後端無解讀文字 | **移除或標記為未來功能** |
| `SummaryReadingView.vue` | 摘要解讀 | ❌ 後端無解讀文字 | **移除或標記為未來功能** |

### ❌ 完全無資料支援的組件（已編譯但未使用）

以下組件存在 `.js` 編譯產物，但**未在路由或主要視圖中使用**：

| 組件 | 期望資料 | 狀態 | 建議 |
|------|---------|------|------|
| `BaziInputForm.vue.js` | 八字輸入 | ❌ 已被 `UnifiedInputForm` 取代 | **刪除** |
| `PurpleStarInputForm.vue.js` | 紫微輸入 | ❌ 已被 `UnifiedInputForm` 取代 | **刪除** |
| `UserInputForm.vue.js` | 用戶輸入 | ❌ 已被 `UnifiedInputForm` 取代 | **刪除** |
| `ZiweiCalculator.vue.js` | 紫微計算 | ❌ 已遷移至後端 | **刪除** |
| `BaziChartDisplay.vue.js` | 八字顯示 | ❌ 已被 `BaziChart` 取代 | **刪除** |
| `PurpleStarChartDisplay.vue.js` | 紫微顯示 | ❌ 功能已整合至 `UnifiedResultView` | **刪除** |
| `PurpleStarGuideModal.vue.js` | 紫微指南 | ❌ 未使用 | **刪除或移至文檔** |
| `LayeredReadingController.vue.js` | 分層解讀控制 | ❌ 後端無解讀資料 | **刪除** |
| `UnifiedLayeredController.vue.js` | 統一分層控制 | ❌ 後端無解讀資料 | **刪除** |
| `IntegratedAnalysisDisplay.vue.js` | 整合分析 | ❌ 後端無分析資料 | **刪除** |
| `AstrologicalBasis.vue.js` | 命理基礎 | ❌ 未使用 | **刪除或移至文檔** |
| `TraitDeconstruction.vue.js` | 特質解構 | ❌ 後端無解讀資料 | **刪除** |
| `PatternAnalysisPanel.vue.js` | 格局分析 | ❌ 後端無分析資料 | **刪除** |
| `FortuneOverview.vue.js` | 運勢總覽 | ❌ 後端無總覽資料 | **刪除** |
| `CurrentYearFortune.vue.js` | 當年運勢 | ❌ 已被 `annualFortune` 取代 | **刪除** |
| `TransformationStarsDisplay.vue.js` | 四化飛星 | ❌ 後端無四化資料 | **標記為未來功能** |
| `MinorStarsPanel.vue.js` | 輔星面板 | ❌ 後端僅提供 4 顆輔星 | **簡化或刪除** |
| `FeatureHintsDisplay.vue.js` | 功能提示 | ❌ 未使用 | **刪除** |
| `DisplayDepthContainer.vue.js` | 顯示深度容器 | ❌ 未使用 | **刪除** |
| `StorageStatusIndicator.vue.js` | 儲存狀態 | ❌ 未使用 | **刪除** |
| `EmptyPalaceIndicator.vue.js` | 空宮指示器 | ❌ 未使用 | **刪除** |
| `SkeletonLoader.vue.js` | 骨架載入 | ❌ 已有 `el-skeleton` | **刪除** |
| `HelloWorld.vue.js` | 範例組件 | ❌ 開發範例 | **刪除** |
| `ElementsChart.vue.js` | 元素圖表 | ❌ 已被 `WuXingChart` 取代 | **刪除** |
| `YearlyFateTimeline.vue.js` | 年度命運時間軸 | ❌ 已被 `FortuneTimeline` 取代 | **刪除** |
| `StarBrightnessIndicator.vue.js` | 星曜亮度 | ❌ 未使用 | **刪除** |

---

## 已知功能缺口（後端未實作）

根據 `.specify/memory/constitution.md`：

1. **四化飛星頂層彙總** - 後端未實作
2. **流年太歲計算** - 已實作但前端組件 `TransformationStarsDisplay.vue` 期望更多資料

---

## 清理建議

### Phase 1: 刪除已廢棄的編譯產物（低風險）

**目標**: 移除 26 個 `.js/.js.map` 編譯產物

```bash
# 刪除已廢棄的輸入表單
rm bazi-app-vue/src/components/BaziInputForm.vue.js*
rm bazi-app-vue/src/components/PurpleStarInputForm.vue.js*
rm bazi-app-vue/src/components/UserInputForm.vue.js*

# 刪除已廢棄的計算器
rm bazi-app-vue/src/components/ZiweiCalculator.vue.js*

# 刪除已廢棄的顯示組件
rm bazi-app-vue/src/components/BaziChartDisplay.vue.js*
rm bazi-app-vue/src/components/PurpleStarChartDisplay.vue.js*
rm bazi-app-vue/src/components/ElementsChart.vue.js*
rm bazi-app-vue/src/components/YearlyFateTimeline.vue.js*

# 刪除無資料支援的解讀組件
rm bazi-app-vue/src/components/LayeredReadingController.vue.js*
rm bazi-app-vue/src/components/UnifiedLayeredController.vue.js*
rm bazi-app-vue/src/components/IntegratedAnalysisDisplay.vue.js*
rm bazi-app-vue/src/components/TraitDeconstruction.vue.js*
rm bazi-app-vue/src/components/PatternAnalysisPanel.vue.js*
rm bazi-app-vue/src/components/FortuneOverview.vue.js*
rm bazi-app-vue/src/components/CurrentYearFortune.vue.js*

# 刪除未使用的 UI 組件
rm bazi-app-vue/src/components/PurpleStarGuideModal.vue.js*
rm bazi-app-vue/src/components/AstrologicalBasis.vue.js*
rm bazi-app-vue/src/components/MinorStarsPanel.vue.js*
rm bazi-app-vue/src/components/FeatureHintsDisplay.vue.js*
rm bazi-app-vue/src/components/DisplayDepthContainer.vue.js*
rm bazi-app-vue/src/components/StorageStatusIndicator.vue.js*
rm bazi-app-vue/src/components/EmptyPalaceIndicator.vue.js*
rm bazi-app-vue/src/components/SkeletonLoader.vue.js*
rm bazi-app-vue/src/components/StarBrightnessIndicator.vue.js*
rm bazi-app-vue/src/components/HelloWorld.vue.js*
```

**預期效果**: 減少 ~50 個檔案，降低 ESLint 掃描範圍

### Phase 2: 標記未來功能組件（中風險）

**目標**: 將無後端支援的組件標記為「開發中」

```vue
<!-- TransformationStarsDisplay.vue -->
<template>
  <el-alert type="info" :closable="false">
    <template #title>四化飛星功能開發中</template>
    此功能需要後端 API 支援，預計於下一版本提供。
  </el-alert>
</template>

<!-- CompactReadingView.vue / SummaryReadingView.vue -->
<template>
  <el-alert type="info" :closable="false">
    <template #title>命盤解讀功能開發中</template>
    AI 解讀功能需要後端 API 支援，預計於下一版本提供。
  </el-alert>
</template>
```

### Phase 3: 更新路由與視圖（高風險）

**目標**: 移除對已刪除組件的引用

1. 檢查 `src/router/index.ts` 是否引用已刪除組件
2. 檢查 `src/views/` 是否引用已刪除組件
3. 更新 `package.json` 移除未使用的依賴

---

## 執行計畫

### 建議執行順序

1. **先執行 Phase 1**（刪除編譯產物）- 低風險，立即減少 ESLint 掃描範圍
2. **驗證前端功能** - 確認 UnifiedView/UnifiedResultView 正常運作
3. **執行 Phase 2**（標記未來功能）- 中風險，改善用戶體驗
4. **執行 Phase 3**（清理引用）- 高風險，需要完整測試

### 預期收益

- **減少 ESLint 錯誤**: 移除 ~26 個編譯產物，預估減少 50-100 個 lint 錯誤
- **改善維護性**: 清理無用組件，降低技術債務
- **改善用戶體驗**: 標記未來功能，避免顯示空白或故障版面
- **加速構建**: 減少編譯檔案數量

---

## 風險評估

| 階段 | 風險等級 | 回滾策略 |
|------|---------|---------|
| Phase 1 | 🟢 低 | Git revert |
| Phase 2 | 🟡 中 | Git revert + 前端測試 |
| Phase 3 | 🔴 高 | Git revert + 完整回歸測試 |

---

## 下一步

是否執行 **Phase 1: 刪除已廢棄的編譯產物**？

預估時間：5-10 分鐘  
預估收益：減少 50-100 個 ESLint 錯誤
