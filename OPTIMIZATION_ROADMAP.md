# 完整優化計畫路線圖

**專案**: 佩璇 - 智能命理分析平台  
**分支**: refactor/code-quality-optimization  
**開始日期**: 2025-11-29  
**預計完成**: 2026-01-15（6 週）

---

## 🎯 總體目標

### 量化指標
| 指標 | 現狀 | 目標 | 改善 |
|------|------|------|------|
| 程式碼品質 | 6/10 | 9/10 | +50% |
| 元件平均行數 | 913 | <500 | -45% |
| v-for key 覆蓋率 | 27% | 100% | +270% |
| 國際化覆蓋率 | 0.67% | 85% | +12,600% |
| 無障礙性評分 | 3/10 | 8/10 | +167% |
| 測試覆蓋率 | 0% | 70% | +∞ |
| 效能分數 | 5/10 | 8/10 | +60% |

---

## 📅 時間規劃

### Phase 1: 緊急修復（Week 1）
**目標**: 修復關鍵問題，提升基礎品質  
**時間**: 2025-11-29 ~ 2025-12-05

### Phase 2: 架構重構（Week 2-3）
**目標**: 拆分大型元件，優化架構  
**時間**: 2025-12-06 ~ 2025-12-19

### Phase 3: 品質提升（Week 4-5）
**目標**: 國際化、無障礙性、測試  
**時間**: 2025-12-20 ~ 2026-01-02

### Phase 4: 效能優化（Week 6）
**目標**: 效能調優、文檔完善  
**時間**: 2026-01-03 ~ 2026-01-09

### Phase 5: 驗收發布（Week 6+）
**目標**: 測試、驗收、部署  
**時間**: 2026-01-10 ~ 2026-01-15

---

## 🔴 Phase 1: 緊急修復（Week 1）

### Day 1: v-for Key 修復
**優先級**: 🔴 P0  
**預計時間**: 4 小時

#### 任務清單
- [ ] 掃描所有缺少 key 的 v-for（67 處）
- [ ] 為每個 v-for 添加唯一 key
- [ ] 驗證 key 的唯一性
- [ ] 測試列表渲染效能

#### 執行步驟
```bash
# 1. 搜尋所有缺少 key 的 v-for
grep -rn "v-for" src/components/*.vue | grep -v ":key"

# 2. 逐一修復
# 原則：使用唯一 ID，避免使用 index

# 3. 驗證
npm run build
npm run test
```

#### 驗收標準
- ✅ 所有 v-for 都有 :key
- ✅ key 值唯一且穩定
- ✅ 無 Vue 警告
- ✅ 列表渲染正常

---

### Day 2: ESLint 配置強化
**優先級**: 🔴 P0  
**預計時間**: 3 小時

#### 任務清單
- [ ] 更新 ESLint 規則
- [ ] 啟用 TypeScript 嚴格檢查
- [ ] 配置 Vue 3 最佳實踐
- [ ] 自動修復可修復的問題

#### ESLint 規則配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    // Vue 規則
    'vue/multi-word-component-names': 'error',
    'vue/no-v-html': 'warn',
    'vue/require-v-for-key': 'error',
    'vue/no-unused-components': 'warn',
    
    // TypeScript 規則
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // 通用規則
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error'
  }
}
```

#### 驗收標準
- ✅ ESLint 配置完成
- ✅ 自動修復執行成功
- ✅ 剩餘錯誤 <50 個
- ✅ CI/CD 整合

---

### Day 3: 程式碼清理
**優先級**: ⚠️ P1  
**預計時間**: 4 小時

#### 任務清單
- [ ] 移除所有 console.log
- [ ] 移除未使用的 import
- [ ] 移除註解掉的程式碼
- [ ] 統一命名規範

#### 清理腳本
```bash
# 1. 移除 console.log
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' '/console\.log/d'

# 2. 檢查未使用的 import
npx eslint src --fix

# 3. 移除註解程式碼（手動檢查）
grep -rn "// " src/ | grep -v "TODO\|FIXME"
```

#### 驗收標準
- ✅ 無 console.log
- ✅ 無未使用的 import
- ✅ 無大段註解程式碼
- ✅ 命名規範統一

---

### Day 4-5: 類型安全改善
**優先級**: ⚠️ P1  
**預計時間**: 8 小時

#### 任務清單
- [ ] 移除所有 any 類型
- [ ] 添加缺失的類型註解
- [ ] 優化介面定義
- [ ] 統一類型導出

#### 重點檔案
1. `src/types/astrologyTypes.ts` - 完善類型定義
2. `src/utils/baziCalc.ts` - 移除 any
3. `src/components/*.vue` - 添加 props 類型
4. `src/composables/*.ts` - 完善返回類型

#### 驗收標準
- ✅ any 類型 <5 個
- ✅ 所有 props 有類型
- ✅ 所有函數有返回類型
- ✅ TypeScript 嚴格模式通過

---

## ⚠️ Phase 2: 架構重構（Week 2-3）

### Week 2: 拆分超大型元件

#### Day 6-7: PurpleStarChartDisplay 重構
**優先級**: 🔴 P0  
**預計時間**: 12 小時  
**目標**: 2,531 行 → <500 行

##### 拆分策略
```
PurpleStarChartDisplay.vue (2,531 行)
├─ ChartHeader.vue (100 行)
│  ├─ 標題
│  └─ 操作按鈕
├─ ChartSummary.vue (200 行)
│  └─ 簡要解讀
├─ ChartGrid.vue (300 行)
│  ├─ 命盤網格
│  └─ 宮位佈局
├─ PalaceCard.vue (150 行)
│  ├─ 單個宮位
│  ├─ 星曜列表
│  └─ 四化標記
├─ StarList.vue (100 行)
│  └─ 星曜顯示
├─ ChartControls.vue (200 行)
│  ├─ 顯示選項
│  └─ 互動控制
└─ ChartLegend.vue (150 行)
   └─ 圖例說明

Composables:
├─ useChartData.ts (200 行)
├─ usePalaceLayout.ts (150 行)
├─ useStarPlacement.ts (200 行)
└─ useChartInteraction.ts (150 行)
```

##### 執行步驟
1. 創建子元件檔案
2. 提取邏輯到 composables
3. 遷移模板和樣式
4. 測試功能完整性
5. 刪除舊程式碼

##### 驗收標準
- ✅ 主元件 <500 行
- ✅ 子元件 <200 行
- ✅ 功能完全一致
- ✅ 效能無退化

---

#### Day 8-9: FortuneOverview 重構
**優先級**: 🔴 P0  
**預計時間**: 12 小時  
**目標**: 2,493 行 → <500 行

##### 拆分策略
```
FortuneOverview.vue (2,493 行)
├─ FortuneHeader.vue (100 行)
├─ FortuneTimeline.vue (300 行)
├─ FortuneCard.vue (150 行)
├─ FortuneDetails.vue (200 行)
├─ FortuneChart.vue (200 行)
└─ FortuneAnalysis.vue (250 行)

Composables:
├─ useFortuneData.ts (200 行)
├─ useFortuneCalculation.ts (250 行)
└─ useFortuneVisualization.ts (150 行)
```

---

#### Day 10: 其他大型元件規劃
**優先級**: ⚠️ P1  
**預計時間**: 4 小時

##### 待重構元件
1. PurpleStarView.vue (1,561 行)
2. TraitDeconstruction.vue (1,379 行)
3. TransformationStarsDisplay.vue (1,319 行)
4. AstrologicalBasis.vue (1,200 行)

##### 重構原則
- 單一元件 <500 行
- 單一職責原則
- 高內聚低耦合
- 可測試性優先

---

### Week 3: Composables 提取

#### Day 11-12: 核心 Composables
**優先級**: ⚠️ P1  
**預計時間**: 12 小時

##### 新增 Composables
```typescript
// 1. useChartData.ts - 命盤資料管理
export function useChartData() {
  const chartData = ref<ChartData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  async function loadChart(params: ChartParams) { }
  function updateChart(data: Partial<ChartData>) { }
  function clearChart() { }
  
  return { chartData, isLoading, error, loadChart, updateChart, clearChart }
}

// 2. usePalaceCalculation.ts - 宮位計算
export function usePalaceCalculation() {
  function calculatePalacePosition(index: number) { }
  function getPalaceStars(palace: Palace) { }
  function getTransformations(palace: Palace) { }
  
  return { calculatePalacePosition, getPalaceStars, getTransformations }
}

// 3. useStarPlacement.ts - 星曜排布
export function useStarPlacement() {
  function placeMainStars(chart: ChartData) { }
  function placeMinorStars(chart: ChartData) { }
  function calculateBrightness(star: Star) { }
  
  return { placeMainStars, placeMinorStars, calculateBrightness }
}

// 4. useFortuneAnalysis.ts - 運勢分析
export function useFortuneAnalysis() {
  function analyzePeriod(period: Period) { }
  function predictTrends(chart: ChartData) { }
  function generateInsights(analysis: Analysis) { }
  
  return { analyzePeriod, predictTrends, generateInsights }
}
```

---

## ✅ Phase 3: 品質提升（Week 4-5）

### Week 4: 國際化完善

#### Day 13-15: 國際化實作
**優先級**: ⚠️ P1  
**預計時間**: 18 小時  
**目標**: 0.67% → 85%

##### 執行計畫
```bash
# 1. 提取所有中文文字
grep -roh "[\u4e00-\u9fa5]+" src/components/*.vue > chinese_texts.txt

# 2. 生成 i18n key
# 使用腳本自動生成 key 和翻譯檔

# 3. 替換硬編碼文字
# 原: <h1>紫微斗數命盤</h1>
# 改: <h1>{{ $t('purpleStarChart.title') }}</h1>

# 4. 更新語言檔
# zh-TW.json, en.json
```

##### 優先級順序
1. 🔴 P0: 主要介面文字（導航、按鈕、標題）
2. ⚠️ P1: 表單標籤、錯誤訊息
3. ✅ P2: 說明文字、提示訊息
4. 📝 P3: 詳細內容、文檔

##### 驗收標準
- ✅ 主要介面 100% i18n
- ✅ 表單和錯誤 100% i18n
- ✅ 整體覆蓋率 >85%
- ✅ 英文翻譯完整

---

### Week 5: 無障礙性與測試

#### Day 16-17: 無障礙性改善
**優先級**: ⚠️ P1  
**預計時間**: 12 小時  
**目標**: 3/10 → 8/10

##### 任務清單
- [ ] 添加 ARIA 標籤（目標 100+ 個）
- [ ] 所有圖片添加 alt
- [ ] 實作鍵盤導航
- [ ] 優化焦點管理
- [ ] 測試螢幕閱讀器

##### ARIA 標籤指南
```vue
<!-- 導航 -->
<nav aria-label="主導航">
  <ul role="menubar">
    <li role="menuitem"><a href="/">首頁</a></li>
  </ul>
</nav>

<!-- 表單 -->
<form aria-labelledby="form-title">
  <label for="name">姓名</label>
  <input id="name" aria-required="true" />
</form>

<!-- 互動元素 -->
<button aria-label="關閉對話框" @click="close">
  <span aria-hidden="true">×</span>
</button>

<!-- 狀態 -->
<div role="alert" aria-live="polite">
  {{ message }}
</div>
```

##### 驗收標準
- ✅ ARIA 標籤 >100 個
- ✅ 所有圖片有 alt
- ✅ 鍵盤導航完整
- ✅ WCAG 2.1 AA 通過

---

#### Day 18-19: 單元測試
**優先級**: ✅ P2  
**預計時間**: 12 小時  
**目標**: 0% → 70%

##### 測試策略
```typescript
// 1. Composables 測試（優先）
describe('useChartData', () => {
  it('should load chart data', async () => { })
  it('should handle errors', async () => { })
  it('should update chart', () => { })
})

// 2. 工具函數測試
describe('baziCalc', () => {
  it('should calculate bazi correctly', () => { })
  it('should handle edge cases', () => { })
})

// 3. 元件測試
describe('ChartHeader', () => {
  it('should render correctly', () => { })
  it('should emit events', () => { })
})
```

##### 覆蓋率目標
- Composables: 90%
- Utils: 85%
- Components: 60%
- 整體: 70%

---

## ⚡ Phase 4: 效能優化（Week 6）

### Day 20-21: 渲染效能優化
**優先級**: ✅ P2  
**預計時間**: 12 小時

#### 任務清單
- [ ] 實作虛擬滾動
- [ ] 優化大列表渲染
- [ ] 減少不必要的重新渲染
- [ ] 使用 v-memo 優化

#### 虛擬滾動實作
```vue
<template>
  <VirtualScroller
    :items="items"
    :item-height="50"
    :buffer="5"
  >
    <template #default="{ item }">
      <ItemCard :item="item" />
    </template>
  </VirtualScroller>
</template>
```

---

### Day 22: 程式碼分割優化
**優先級**: ✅ P2  
**預計時間**: 6 小時

#### 任務清單
- [ ] 路由級別懶加載
- [ ] 元件級別懶加載
- [ ] 預載入關鍵資源
- [ ] 分析 bundle size

---

### Day 23: 文檔完善
**優先級**: ✅ P2  
**預計時間**: 6 小時

#### 文檔清單
- [ ] 元件 API 文檔
- [ ] Composables 文檔
- [ ] 開發指南
- [ ] 貢獻指南

---

## 🎯 Phase 5: 驗收發布（Week 6+）

### Day 24-25: 整合測試
**優先級**: 🔴 P0  
**預計時間**: 12 小時

#### 測試清單
- [ ] 功能回歸測試
- [ ] 效能測試
- [ ] 無障礙性測試
- [ ] 跨瀏覽器測試
- [ ] 移動端測試

---

### Day 26: 部署準備
**優先級**: 🔴 P0  
**預計時間**: 6 小時

#### 任務清單
- [ ] 更新 CHANGELOG
- [ ] 更新版本號
- [ ] 創建 Release Notes
- [ ] 準備部署腳本

---

### Day 27: 發布與監控
**優先級**: 🔴 P0  
**預計時間**: 6 小時

#### 發布流程
1. 合併到 main
2. 觸發 CI/CD
3. 部署到生產環境
4. 監控錯誤和效能
5. 收集使用者反饋

---

## 📊 進度追蹤

### 每日檢查點
- [ ] 完成當日任務
- [ ] 更新進度文檔
- [ ] 提交程式碼
- [ ] 記錄問題和決策

### 每週檢查點
- [ ] 回顧本週進度
- [ ] 調整下週計畫
- [ ] 更新 CHECKPOINTS.md
- [ ] 團隊同步會議

---

## 🎯 成功指標

### 量化指標
- ✅ 程式碼品質 9/10
- ✅ 元件平均行數 <500
- ✅ v-for key 100%
- ✅ 國際化 85%
- ✅ 無障礙性 8/10
- ✅ 測試覆蓋率 70%
- ✅ 效能分數 8/10

### 質化指標
- ✅ 程式碼可讀性顯著提升
- ✅ 維護成本降低
- ✅ 新人上手時間縮短
- ✅ 使用者體驗改善

---

## 🛠 工具和資源

### 開發工具
- ESLint + Prettier
- Vitest + Testing Library
- Lighthouse + axe DevTools
- Bundle Analyzer

### 參考資源
- Vue 3 官方文檔
- TypeScript 最佳實踐
- WCAG 2.1 指南
- Clean Code 原則

---

## 📝 風險管理

### 潛在風險
1. **時間風險**: 任務可能超時
   - 緩解: 優先級管理，可延後 P2 任務

2. **技術風險**: 重構可能引入 bug
   - 緩解: 充分測試，漸進式重構

3. **資源風險**: 人力不足
   - 緩解: 自動化工具，外部協助

---

**下一步**: 開始執行 Phase 1 Day 1 - v-for Key 修復
