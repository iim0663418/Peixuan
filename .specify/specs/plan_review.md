Now let me create the comprehensive impact analysis document:

# 運勢預測系統重構實施路線圖 - 影響分析與風險評估報告

## 📋 執行摘要 (Executive Summary)

基於對 `.specify/specs/implementation_roadmap.md` 與現有程式碼庫的深度分析,本報告識別出 **3 個高風險區域**、**2 個中等風險區域** 與 **4 個關鍵相依性衝突點**。建議採用 **漸進式重構策略** 並遵循嚴格的向後兼容性原則。

---

## 🔍 1. 影響範圍分析 (Impact Scope Analysis)

### 1.1 直接受影響的檔案 (Direct Impact)

| 檔案路徑 | 變更類型 | 影響程度 | 風險等級 |
|---------|---------|---------|---------|
| `peixuan-worker/package.json` | 新增依賴 | 低 | 🟢 LOW |
| `peixuan-worker/src/services/annualFortune/calculateYearlyForecast.ts` | 函數簽名變更 | **高** | 🔴 **HIGH** |
| `peixuan-worker/src/calculation/annual/nextYearCalculator.ts` | 可能被廢棄 | 中 | 🟡 MEDIUM |
| `peixuan-worker/src/formatters/advancedMarkdownFormatter.ts` | 邏輯修改 | 中 | 🟡 MEDIUM |

### 1.2 間接受影響的調用點 (Indirect Impact)

#### 後端調用鏈 (Backend Call Chain)
```
calculator.ts:52 (calculateYearlyForecast)
  ↓ 被調用於
advancedMarkdownFormatter.ts:14,201 (calculateNextYear)
  ↓ 影響
API Response Format (JSON/Markdown)
  ↓ 傳遞至
Frontend Components
```

**關鍵調用點:**
1. **`src/calculation/integration/calculator.ts:52`**
   - 導入: `import { calculateYearlyForecast } from '../../services/annualFortune';`
   - 用途: 統一計算器的核心流年預測邏輯
   - **風險**: 若 `calculateYearlyForecast` 簽名變更且未提供預設值,將導致此處編譯錯誤

2. **`src/formatters/advancedMarkdownFormatter.ts:14,201`**
   - 導入: `import { calculateNextYear } from '../calculation/annual/nextYearCalculator';`
   - 用途: 生成 Markdown 格式的「下一年預測」區塊
   - **風險**: 若 `calculateNextYear` 被廢棄,需重構為調用新的 `calculateSixMonthForecast`

#### 前端依賴 (Frontend Dependencies)
- **`bazi-app-vue/src/components/AnnualFortuneCard.vue`**
  - 依賴後端 API 返回的 `yearlyForecast` 物件結構
  - **當前假設**: `yearlyForecast.periods` 為 1-2 個元素的陣列
  - **潛在問題**: 若未來支援「任意月份區間」,periods 可能超過 2 個,需調整 UI 邏輯

- **國際化檔案 (i18n)**
  - `bazi-app-vue/src/i18n/locales/zh_TW.json`
  - `bazi-app-vue/src/i18n/locales/en.json`
  - **需更新**: "流年" 字眼需改為動態描述 (如「區間運勢」)

---

## ⚠️ 2. 風險評估 (Risk Assessment)

### 🔴 高風險 (HIGH RISK) - 需強制控制措施

#### 風險 2.1: 函數簽名變更導致破壞性更新 (Breaking Change)
**位置:** `calculateYearlyForecast.ts:148-155`

**現有簽名:**
```typescript
export function calculateYearlyForecast(
  birthDate: Date,
  queryDate: Date,
  palaces: Palace[],
  fourPillars: FourPillars,
  currentDayun?: GanZhi
): YearlyForecast
```

**計劃變更 (Roadmap):**
```typescript
// 新增 durationMonths 參數
export function calculateYearlyForecast(
  birthDate: Date,
  queryDate: Date,
  palaces: Palace[],
  fourPillars: FourPillars,
  currentDayun?: GanZhi,
  durationMonths: number = 12  // ⚠️ 新參數
): YearlyForecast
```

**影響分析:**
- ✅ **向後兼容性**: 有預設值 `= 12`,現有調用點無需修改
- ❌ **潛在問題**: TypeScript 編譯器會通過,但若有單元測試直接驗證參數數量,會失敗
- ⚠️ **隱藏風險**: 若團隊成員未閱讀文件,可能不知道新參數存在,繼續使用舊邏輯

**緩解措施:**
1. **強制 Code Review**: 所有對此函數的調用都需經過審查
2. **新增 JSDoc 警告**:
   ```typescript
   /**
    * @param durationMonths - Duration in months (default: 12 for full year, use 6 for half-year)
    * @since v2.0.0 - Added support for custom duration
    */
   ```
3. **更新所有測試案例**: 明確測試 `durationMonths = 6` 的場景

---

#### 風險 2.2: 日期計算邏輯錯誤導致死迴圈 (Infinite Loop)
**位置:** `calculateYearlyForecast.ts:156-158`

**現有邏輯:**
```typescript
const endDate = new Date(queryDate);
endDate.setDate(endDate.getDate() + 365);
```

**計劃變更:**
```typescript
import { addMonths } from 'date-fns';
const endDate = addMonths(queryDate, durationMonths);
```

**風險點:**
1. **`date-fns` 行為差異**: 
   - 原生 `setDate` 會自動處理月末溢出 (如 1/31 + 1月 = 2/28)
   - `addMonths` 同樣處理溢出,但實作細節不同,需驗證邊界情況

2. **Lichun 迴圈終止條件** (`calculateYearlyForecast.ts:161`):
   ```typescript
   const lichunDates = getLichunDatesBetween(queryDate, endDate);
   ```
   - 若 `endDate` 計算錯誤 (如 `endDate < queryDate`),`getLichunDatesBetween` 返回空陣列
   - 當前邏輯無死迴圈風險,但需確保 `date-fns` 計算正確

**測試案例 (必須通過):**
```typescript
// 閏年測試
calculateYearlyForecast(birth, new Date('2024-02-29'), palaces, fourPillars, undefined, 6)
// 預期: endDate = 2024-08-29 (非 2024-08-28)

// 月末測試
calculateYearlyForecast(birth, new Date('2026-01-31'), palaces, fourPillars, undefined, 6)
// 預期: endDate = 2026-07-31 (非 2026-08-01)
```

**緩解措施:**
1. **安全計數器** (Roadmap 已提及):
   ```typescript
   let safetyCounter = 0;
   while (currentDate < endDate && safetyCounter < 24) {
     // 邏輯
     safetyCounter++;
   }
   if (safetyCounter >= 24) throw new Error('Forecast calculation exceeded safety limit');
   ```
2. **邊界值測試**: 閏年、月末、跨年必須全部涵蓋

---

#### 風險 2.3: 前端 UI 展示邏輯崩潰 (UI Layout Breakdown)
**位置:** `bazi-app-vue/src/components/AnnualFortuneCard.vue:36-42`

**現有假設:**
```vue
<div class="period-cards">
  <div v-for="(period, index) in yearlyForecast.periods" :key="index"
       :class="index === 0 ? 'current-year-card' : 'next-year-card'">
```

**問題:**
- CSS 僅設計 `.current-year-card` 與 `.next-year-card` 兩種樣式
- 若未來支援「12 個月區間跨越 3 個立春」(極少見但理論可能),`periods` 長度會 > 2
- 當前 CSS 會將第三個 period 套用錯誤的樣式

**緩解措施:**
1. **動態 Class 生成**:
   ```vue
   :class="`period-${index}`"
   ```
2. **限制最大 periods 數量**: 在後端驗證,若超過 2 個 period 則報錯或合併

---

### 🟡 中等風險 (MEDIUM RISK)

#### 風險 2.4: `calculateNextYear` 功能重疊與維護混亂
**位置:** `src/calculation/annual/nextYearCalculator.ts`

**問題分析:**
- `calculateNextYear` (Lines 220-256) 功能: 計算「下一個完整年份」(如 2026→2027)
- `calculateYearlyForecast` 功能: 計算「任意起始日期的 N 個月區間」
- **重疊**: 若 `durationMonths = 12` 且 `queryDate` 為立春日,兩者輸出幾乎相同

**建議方案:**
1. **保留 `calculateNextYear` 作為便利函數** (Wrapper):
   ```typescript
   export function calculateNextYear(birthInfo: BirthInfo, currentYear?: number): NextYearFortune {
     const year = currentYear || new Date().getFullYear();
     const lichunDate = getLichunTime(year + 1);
     return calculateYearlyForecast(birthDate, lichunDate, palaces, fourPillars, undefined, 12);
   }
   ```
2. **逐步廢棄**: 在 v3.0 移除,當前版本標記 `@deprecated`

---

#### 風險 2.5: Markdown 輸出格式與 AI Prompt 不匹配
**位置:** `advancedMarkdownFormatter.ts:184-242`

**問題:**
- 現有標題: `## 🔮 下一年預測` (Line 186)
- 若改為 6 個月預測,標題應為 `## 🔮 未來半年預測` 或 `## 🔮 區間運勢 (2026/01 - 2026/06)`
- **影響**: AI 模型的 Prompt 可能假設「下一年」是完整 12 個月,若輸入半年數據,解讀可能錯誤

**緩解措施:**
1. **動態標題生成**:
   ```typescript
   const monthsLabel = durationMonths === 12 ? '下一年' : `未來${durationMonths}個月`;
   lines.push(`## 🔮 ${monthsLabel}預測`);
   ```
2. **在 Prompt 中明確時間範圍**:
   ```markdown
   ## 🔮 區間運勢預測
   - **時間範圍**: 2026-01-02 至 2026-07-02 (共 6 個月)
   ```

---

## 🔗 3. 相依性衝突分析 (Dependency Conflict Analysis)

### 3.1 新依賴引入: `date-fns`

**計劃操作 (Roadmap Phase 1):**
```bash
npm install date-fns
```

**當前依賴 (package.json:29-38):**
```json
{
  "dependencies": {
    "lunar-typescript": "^1.8.6",
    // ...其他依賴
  }
}
```

**衝突檢查:**
1. **直接衝突**: ❌ 無 (date-fns 與現有依賴無衝突)
2. **Bundle Size 影響**:
   - `date-fns` 全包: ~70KB (gzipped)
   - **建議**: 使用 Tree-shaking,僅導入 `addMonths`:
     ```typescript
     import { addMonths } from 'date-fns/addMonths';
     ```
   - 預估增量: ~5KB gzipped

3. **lunar-typescript 版本鎖定**:
   - Roadmap 要求: `1.8+`
   - 當前版本: `^1.8.6` ✅ 符合
   - **注意**: `^` 表示自動升級到 `<2.0.0`,需鎖定為 `~1.8.6` 避免意外破壞

**推薦 `package.json` 變更:**
```json
{
  "dependencies": {
    "date-fns": "^4.1.0",  // 最新穩定版
    "lunar-typescript": "~1.8.6"  // 鎖定小版本
  }
}
```

---

### 3.2 TypeScript 編譯選項衝突

**現有配置 (tsconfig.json:2-13):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "WebWorker", "DOM"]
  }
}
```

**`date-fns` 要求:**
- 最低 TypeScript: `4.7+` (當前專案未明確指定,但 `typescript: ^5.5.2` 符合)
- Module 解析: 支援 `ESNext` ✅

**衝突**: ❌ 無

---

## 📋 4. 向後兼容性檢查清單 (Backward Compatibility Checklist)

### ✅ 已保證的兼容性 (Guaranteed)

| 項目 | 現狀 | 兼容性措施 |
|-----|------|----------|
| `calculateYearlyForecast` 函數簽名 | 新增參數有預設值 | ✅ 所有現有調用無需修改 |
| API Response 結構 | `YearlyForecast` 介面未變更 | ✅ 前端無需改動 |
| 單元測試 | 現有測試不帶新參數 | ✅ 預設值確保測試通過 |

### ⚠️ 需驗證的兼容性 (Requires Validation)

1. **`getLichunDatesBetween` 行為一致性**
   - **測試**: 驗證使用 `date-fns` 計算的 `endDate` 與原生 `setDate` 結果是否完全一致
   - **案例**:
     ```typescript
     // 原生
     const date1 = new Date('2026-01-31');
     date1.setDate(date1.getDate() + 365);
     
     // date-fns
     const date2 = addMonths(new Date('2026-01-31'), 12);
     
     // 必須相等
     assert(date1.getTime() === date2.getTime());
     ```

2. **流年分段邏輯 (calculateYearlyForecast.ts:165-267)**
   - **驗證點**: 
     - 單 period 場景 (無 Lichun)
     - 雙 period 場景 (1 個 Lichun)
     - 權重計算 (`weight` 總和必須為 1.0)

---

## 🛠️ 5. 建議修改順序 (Recommended Implementation Order)

### Phase 1: 基礎設施準備 (1-2 天)
**優先級**: 🔴 CRITICAL

1. **安裝 `date-fns` 依賴**
   ```bash
   cd peixuan-worker
   npm install date-fns@^4.1.0
   npm install --save-exact lunar-typescript@1.8.6
   ```

2. **新增邊界測試案例** (src/services/annualFortune/__tests__/yearlyForecast.test.ts)
   - 測試 `durationMonths = 6` 場景
   - 測試閏年、月末邊界
   - 測試 Lichun 切換點 (2026-02-04)

3. **執行現有測試套件確保無迴歸**
   ```bash
   npm run test:unit
   ```

---

### Phase 2: 核心邏輯重構 (3-5 天)
**優先級**: 🔴 CRITICAL

1. **修改 `calculateYearlyForecast.ts`** (按 Roadmap 規格)
   - 引入 `date-fns`
   - 新增 `durationMonths` 參數 (預設 12)
   - 替換 `endDate` 計算邏輯
   - **新增安全計數器防止死迴圈**

2. **新增 `calculateSixMonthForecast` 包裝函數**
   ```typescript
   // src/services/annualFortune/calculateSixMonthForecast.ts
   export function calculateSixMonthForecast(
     birthDate: Date,
     queryDate: Date,
     palaces: Palace[],
     fourPillars: FourPillars,
     currentDayun?: GanZhi
   ): YearlyForecast {
     return calculateYearlyForecast(birthDate, queryDate, palaces, fourPillars, currentDayun, 6);
   }
   ```

3. **更新導出** (src/services/annualFortune/index.ts)
   ```typescript
   export { calculateSixMonthForecast } from './calculateSixMonthForecast';
   ```

---

### Phase 3: Formatter 與 UI 適配 (2-3 天)
**優先級**: 🟡 HIGH

1. **更新 `advancedMarkdownFormatter.ts`**
   - 動態標題生成 (根據時間範圍)
   - 支援跨流年描述 (如「乙巳尾 + 丙午頭」)

2. **前端組件適配** (bazi-app-vue/)
   - `AnnualFortuneCard.vue`: 無需修改 (已支援多 period)
   - i18n: 新增「區間運勢」翻譯

---

### Phase 4: 整合測試與部署 (2-3 天)
**優先級**: 🟢 MEDIUM

1. **Staging 部署驗證**
   ```bash
   npm run deploy:staging
   ```

2. **手動測試案例**
   - 輸入: 2026-01-02 查詢運勢
   - 預期輸出:
     - Period 1: 2026-01-02 至 2026-02-04 (乙巳)
     - Period 2: 2026-02-04 至 2026-07-02 (丙午)

3. **監控 Worker Logs** (觀察 1 週)

---

## 📊 6. 測試策略優先級 (Test Strategy Priority)

### 🔴 P0 (必須通過才能部署)

```typescript
// Test: 向後兼容性 - 不帶新參數仍返回 12 個月
it('should default to 12 months when durationMonths not provided', () => {
  const result = calculateYearlyForecast(birthDate, queryDate, palaces, fourPillars);
  const totalDays = result.periods.reduce((sum, p) => sum + p.durationDays, 0);
  expect(totalDays).toBeCloseTo(365, 1);
});

// Test: 6 個月跨立春
it('should split 6-month period across Lichun boundary', () => {
  const result = calculateYearlyForecast(
    birthDate, 
    new Date('2026-01-02'), 
    palaces, 
    fourPillars, 
    undefined, 
    6
  );
  expect(result.periods).toHaveLength(2);
  expect(result.periods[0].annualPillar).toEqual({ stem: '乙', branch: '巳' }); // 2025
  expect(result.periods[1].annualPillar).toEqual({ stem: '丙', branch: '午' }); // 2026
});

// Test: 安全計數器防死迴圈
it('should throw error if calculation exceeds safety limit', () => {
  const corruptedQueryDate = new Date('Invalid');
  expect(() => {
    calculateYearlyForecast(birthDate, corruptedQueryDate, palaces, fourPillars, undefined, 6);
  }).toThrow('Forecast calculation exceeded safety limit');
});
```

### 🟡 P1 (Staging 驗證)
- UI 渲染正確 (Chrome/Safari/Firefox)
- Markdown 格式符合 AI Prompt 預期
- 國際化文字顯示正確

---

## 🚨 7. 回滾計劃 (Rollback Plan)

若部署後發現嚴重問題 (如死迴圈、數據錯誤),執行以下步驟:

### 緊急回滾 (< 15 分鐘)
```bash
# 1. 切換到上一個穩定 Git Commit
git revert HEAD
git push origin main

# 2. 立即重新部署 Production
npm run deploy:production

# 3. 發送告警通知
echo "ROLLBACK: Reverted to previous stable version" | mail -s "ALERT" team@example.com
```

### 根因分析 (< 24 小時)
1. 檢查 Worker Logs 中的錯誤堆疊
2. 在本地復現問題 (使用 Staging 環境數據)
3. 修復後重新走 Phase 1-4 流程

---

## ✅ 8. 最終檢查清單 (Final Checklist Before Deployment)

- [ ] `date-fns` 依賴已安裝且版本正確 (`^4.1.0`)
- [ ] `lunar-typescript` 版本鎖定為 `~1.8.6`
- [ ] 所有單元測試通過 (包含新增的 6 個月測試)
- [ ] TypeScript 編譯無錯誤 (`npm run build`)
- [ ] ESLint 無警告 (`npm run lint`)
- [ ] Staging 環境手動驗證通過 (2026-01-02 測試案例)
- [ ] 前端 UI 顯示正常 (無 CSS 崩潰)
- [ ] Markdown 輸出格式檢查 (標題正確、時間範圍明確)
- [ ] 監控告警已設置 (Worker 錯誤率 > 1% 觸發)
- [ ] 文件更新完成 (API 文件、CHANGELOG)
- [ ] 團隊成員 Code Review 通過 (至少 2 人)

---

## 📌 9. 關鍵結論與建議 (Conclusions & Recommendations)

### ✅ 可行性評估: **通過**
- 技術方案合理,無致命性架構衝突
- 向後兼容性可透過預設參數保證
- 風險可透過測試與監控控制

### 🔴 必須執行的風險控制措施
1. **安全計數器** (防死迴圈)
2. **邊界測試** (閏年、月末、Lichun 切換點)
3. **Staging 環境驗證** (至少 3 天觀察期)

### 🟢 建議優化 (非必須但推薦)
1. **引入 Feature Flag**: 透過環境變數控制「6 個月預測」功能開關
   ```typescript
   const DEFAULT_DURATION = env.ENABLE_SIX_MONTH_FORECAST ? 6 : 12;
   ```
2. **性能監控**: 記錄 `calculateYearlyForecast` 的執行時間,若超過 500ms 則告警
3. **A/B 測試**: 同時生成 12 個月與 6 個月預測,比較用戶滿意度

---

## 📄 附錄 A: 文件路徑索引 (File Path Index)

**後端核心檔案:**
- `peixuan-worker/src/services/annualFortune/calculateYearlyForecast.ts:148-274`
- `peixuan-worker/src/calculation/annual/nextYearCalculator.ts:220-256`
- `peixuan-worker/src/formatters/advancedMarkdownFormatter.ts:184-242`
- `peixuan-worker/src/calculation/integration/calculator.ts:52`

**測試檔案:**
- `peixuan-worker/src/services/annualFortune/__tests__/yearlyForecast.test.ts`

**前端檔案:**
- `bazi-app-vue/src/components/AnnualFortuneCard.vue:36-80`
- `bazi-app-vue/src/i18n/locales/zh_TW.json`

**配置檔案:**
- `peixuan-worker/package.json`
- `peixuan-worker/tsconfig.json`

---

**報告生成日期:** 2026-01-02  
**分析範圍:** `.specify/specs/implementation_roadmap.md` vs `peixuan-worker/src/*`, `bazi-app-vue/src/*`  
**分析方法:** 靜態程式碼分析 + 依賴樹掃描 + 向後兼容性驗證  
**風險等級定義:**  
- 🔴 HIGH: 可能導致生產環境故障  
- 🟡 MEDIUM: 影響功能正確性但不致命  
- 🟢 LOW: 僅影響性能或開發體驗
