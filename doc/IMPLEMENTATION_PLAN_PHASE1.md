# Phase 1 實作計畫：數學化核心重構

**基於文件**:
- `命理計算邏輯數學化研究.md` (數學模型)
- `REFACTOR_SPEC_MATHEMATICAL_CORE.md` (技術規格)
- `尋找開源命理專案.md` (開源資源)

**時程**: Week 2-3 (2025-12-02 ~ 2025-12-15)  
**版本**: v1.0  
**日期**: 2025-11-29

---

## 1. 開源資源整合策略

### 1.1 核心依賴選擇

基於開源專案研究，選擇以下核心依賴：

| 模組 | 開源專案 | 版本 | 用途 | 理由 |
|------|---------|------|------|------|
| **曆法基礎** | `lunar-typescript` | 1.8.6 | 農曆轉換、節氣計算 | ✅ 已使用，多語言一致性 |
| **紫微斗數** | `iztro` | 2.x | 參考實現、JSON 格式 | ✅ 輕量級、TypeScript、標準化 |
| **八字計算** | 自行實現 | - | 基於數學模型 | ⚠️ 現有開源不符合數學化要求 |

### 1.2 不採用的專案與原因

| 專案 | 原因 |
|------|------|
| `bazi-calculator-by-alvamind` | 缺乏真太陽時校正，算法不透明 |
| `fortel-ziweidoushu` | 輸出格式不標準，文檔不足 |
| `bazi-mcp` | 僅為 AI 介面層，無核心計算 |

---

## 2. 架構設計

### 2.1 模組劃分

```
peixuan-worker/src/calculation/
├── core/                    # 核心數學模組
│   ├── time/               # 時間校正
│   │   ├── trueSolarTime.ts
│   │   ├── julianDay.ts
│   │   └── solarTerms.ts
│   ├── ganZhi/             # 干支運算
│   │   ├── modulo.ts
│   │   └── conversion.ts
│   └── wuXing/             # 五行運算
│       └── relations.ts
│
├── bazi/                    # 八字模組
│   ├── fourPillars.ts      # 四柱排盤
│   ├── hiddenStems.ts      # 藏干
│   ├── tenGods.ts          # 十神
│   └── strength.ts         # 強弱分析
│
├── ziwei/                   # 紫微斗數模組
│   ├── palaces.ts          # 宮位定位
│   ├── bureau.ts           # 五行局
│   ├── stars/              # 星曜系統
│   │   ├── ziwei.ts        # 紫微星
│   │   ├── tianfu.ts       # 天府星系
│   │   └── auxiliary.ts    # 輔星
│   └── transformations.ts  # 四化
│
├── integration/             # 整合層
│   ├── calculator.ts       # 統一計算器
│   └── validator.ts        # 輸入驗證
│
└── types/                   # 類型定義
    ├── input.ts
    ├── output.ts
    └── internal.ts
```

### 2.2 依賴關係圖

```
┌─────────────────────────────────────────┐
│         Integration Layer               │
│  (calculator.ts, validator.ts)          │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐         ┌───▼────┐
│  BaZi  │         │ ZiWei  │
│ Module │         │ Module │
└───┬────┘         └───┬────┘
    │                  │
    └────────┬─────────┘
             │
      ┌──────▼──────┐
      │ Core Module │
      │ (time, gan  │
      │  zhi, wu    │
      │  xing)      │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │lunar-       │
      │typescript   │
      └─────────────┘
```

---

## 3. Phase 1 詳細任務拆解

### 3.1 Sprint 1: 核心基礎 (Week 2, Day 1-3)

#### Task 1.1: 時間校正模組
**優先級**: P0  
**預計時間**: 8 小時

**子任務**:
1. 實現真太陽時計算
   ```typescript
   // src/calculation/core/time/trueSolarTime.ts
   export function calculateTrueSolarTime(
     clockTime: Date,
     longitude: number
   ): TrueSolarTimeResult
   ```

2. 實現儒略日轉換
   ```typescript
   // src/calculation/core/time/julianDay.ts
   export function dateToJulianDay(date: Date): number
   export function julianDayToDate(jd: number): Date
   ```

3. 整合 lunar-typescript 節氣計算
   ```typescript
   // src/calculation/core/time/solarTerms.ts
   import { Solar } from 'lunar-typescript';
   export function getSolarTermTime(year: number, term: string): Date
   ```

**測試案例**:
- 北京時間 2024-01-01 12:00, 經度 116.4°E
- 台北時間 2024-06-21 12:00, 經度 121.5°E
- 極端經度: 東經 180°, 西經 180°

**驗收標準**:
- 單元測試覆蓋率 > 90%
- 與 NOAA 太陽計算器誤差 < 1 分鐘

---

#### Task 1.2: 干支模運算模組
**優先級**: P0  
**預計時間**: 4 小時

**子任務**:
1. 實現干支索引轉換
   ```typescript
   // src/calculation/core/ganZhi/conversion.ts
   export function indexToGanZhi(index: number): GanZhiPair
   export function ganZhiToIndex(stem: string, branch: string): number
   ```

2. 實現模運算工具
   ```typescript
   // src/calculation/core/ganZhi/modulo.ts
   export function stemModulo(index: number): number  // mod 10
   export function branchModulo(index: number): number // mod 12
   ```

**測試案例**:
- 60 甲子完整循環驗證
- 邊界條件: index = 0, 59, 60, -1

**驗收標準**:
- 所有 60 甲子組合正確
- 雙向轉換一致性

---

#### Task 1.3: 五行關係模組
**優先級**: P0  
**預計時間**: 4 小時

**子任務**:
1. 實現五行生剋關係
   ```typescript
   // src/calculation/core/wuXing/relations.ts
   export function getWuXingRelation(
     from: WuXing,
     to: WuXing
   ): 'produce' | 'overcome' | 'same' | 'produced' | 'overcomed'
   ```

2. 實現天干五行映射
   ```typescript
   export function stemToWuXing(stem: string): WuXing
   export function branchToWuXing(branch: string): WuXing
   ```

**測試案例**:
- 五行生剋完整矩陣 (5x5)
- 天干地支五行映射

---

### 3.2 Sprint 2: 八字計算 (Week 2, Day 4-5)

#### Task 2.1: 四柱排盤
**優先級**: P0  
**預計時間**: 12 小時

**子任務**:
1. 年柱計算
   ```typescript
   // src/calculation/bazi/fourPillars.ts
   export function calculateYearPillar(
     solarDate: Date,
     lichunTime: Date
   ): number
   ```

2. 月柱計算 (五虎遁年法)
   ```typescript
   export function calculateMonthPillar(
     solarLongitude: number,
     yearStemIndex: number
   ): number
   ```

3. 日柱計算 (儒略日法)
   ```typescript
   export function calculateDayPillar(date: Date): number
   ```

4. 時柱計算 (五鼠遁日法)
   ```typescript
   export function calculateHourPillar(
     trueSolarTime: Date,
     dayStemIndex: number
   ): number
   ```

**參考實現**:
- lunar-typescript 的 `getBaZi()` 方法
- 數學模型: 研究文件 §2.2

**測試案例**:
- 已知名人命盤 (至少 10 個)
- 邊界條件: 立春前後、子時、閏年

**驗收標準**:
- 與 lunar-typescript 結果一致
- 與傳統萬年曆一致

---

#### Task 2.2: 藏干與十神
**優先級**: P0  
**預計時間**: 8 小時

**子任務**:
1. 地支藏干權重模型
   ```typescript
   // src/calculation/bazi/hiddenStems.ts
   export function getHiddenStems(branch: string): HiddenStem[]
   ```

2. 十神關係計算
   ```typescript
   // src/calculation/bazi/tenGods.ts
   export function calculateTenGod(
     dayStem: string,
     targetStem: string
   ): TenGod
   ```

**參考實現**:
- 數學模型: 研究文件 §2.3

**測試案例**:
- 12 地支藏干完整表
- 10x10 十神關係矩陣

---

### 3.3 Sprint 3: 紫微斗數 (Week 3, Day 1-3)

#### Task 3.1: 宮位定位
**優先級**: P0  
**預計時間**: 6 小時

**子任務**:
1. 命宮計算
   ```typescript
   // src/calculation/ziwei/palaces.ts
   export function calculateLifePalace(
     lunarMonth: number,
     hourBranch: number,
     options?: { leapMonthAdjustment: boolean }
   ): number
   ```

2. 身宮計算
   ```typescript
   export function calculateBodyPalace(
     lunarMonth: number,
     hourBranch: number
   ): number
   ```

**參考實現**:
- iztro 的 `astrolabe()` 方法
- 數學模型: 研究文件 §3.1

**測試案例**:
- 12 月 x 12 時辰 = 144 組合
- 閏月情況

---

#### Task 3.2: 五行局與紫微星
**優先級**: P0  
**預計時間**: 10 小時

**子任務**:
1. 納音五行映射
   ```typescript
   // src/calculation/ziwei/bureau.ts
   export function calculateBureau(
     lifePalaceStem: string,
     lifePalaceBranch: string
   ): Bureau
   ```

2. 紫微星定位算法
   ```typescript
   // src/calculation/ziwei/stars/ziwei.ts
   export function findZiWeiPosition(
     lunarDay: number,
     bureau: Bureau
   ): number
   ```

**參考實現**:
- iztro 的星曜定位邏輯
- 數學模型: 研究文件 §3.2-3.3

**測試案例**:
- 60 甲子納音表驗證
- 30 日 x 5 局 = 150 組合

---

#### Task 3.3: 星曜分佈
**優先級**: P0  
**預計時間**: 12 小時

**子任務**:
1. 天府星系 (對稱邏輯)
   ```typescript
   // src/calculation/ziwei/stars/tianfu.ts
   export function findTianFuPosition(ziWeiPosition: number): number
   ```

2. 時系星 (文昌、文曲)
   ```typescript
   // src/calculation/ziwei/stars/auxiliary.ts
   export function findTimeStars(hourBranch: number): TimeStars
   ```

3. 月系星 (左輔、右弼)
   ```typescript
   export function findMonthStars(lunarMonth: number): MonthStars
   ```

**參考實現**:
- iztro 的完整星曜表
- 開源研究: §3.2 安星訣

**測試案例**:
- 與 iztro 輸出比對
- 傳統口訣驗證

---

### 3.4 Sprint 4: 整合與測試 (Week 3, Day 4-5)

#### Task 4.1: 統一計算器
**優先級**: P0  
**預計時間**: 8 小時

**子任務**:
1. 實現統一介面
   ```typescript
   // src/calculation/integration/calculator.ts
   export class UnifiedCalculator {
     calculate(input: BirthInfo): CalculationResult
   }
   ```

2. 錯誤處理與驗證
   ```typescript
   // src/calculation/integration/validator.ts
   export function validateBirthInfo(input: BirthInfo): ValidationResult
   ```

**測試案例**:
- 端到端完整流程
- 異常輸入處理

---

#### Task 4.2: 與現有系統整合
**優先級**: P0  
**預計時間**: 6 小時

**子任務**:
1. 更新 PurpleStarController
   ```typescript
   // peixuan-worker/src/controllers/purpleStarController.ts
   import { UnifiedCalculator } from '../calculation/integration/calculator';
   ```

2. 更新 API 回應格式
3. 向後兼容性處理

---

#### Task 4.3: 測試與文檔
**優先級**: P0  
**預計時間**: 8 小時

**子任務**:
1. 單元測試補完 (目標 > 85%)
2. 整合測試
3. API 文檔更新
4. 使用範例

---

## 4. 開源資源使用指南

### 4.1 lunar-typescript 使用

**已使用功能**:
```typescript
import { Solar, Lunar } from 'lunar-typescript';

// 公曆轉農曆
const solar = Solar.fromYmdHms(2024, 1, 1, 12, 0, 0);
const lunar = solar.getLunar();

// 獲取節氣
const jieQi = lunar.getJieQi();
```

**新增使用**:
```typescript
// 獲取立春時刻
const lichun = solar.getJieQiTable()['立春'];

// 獲取太陽黃經
const solarLongitude = solar.getSolarLongitude();
```

**注意事項**:
- 中文數字格式 (火六局) 已處理
- 時區處理需額外校正

---

### 4.2 iztro 參考使用

**僅作參考，不直接依賴**:

```typescript
// 參考其 JSON 輸出格式
import { astrolabe } from 'iztro';

const chart = astrolabe({
  solarDate: '2024-01-01',
  timeIndex: 0,
  gender: 'male',
  fixLeap: true
});

// 參考其資料結構設計
interface Palace {
  name: string;
  position: number;
  majorStars: Star[];
  // ...
}
```

**為何不直接依賴**:
1. 需要自行實現數學化邏輯
2. 需要完全控制計算流程
3. 需要支援不同流派參數

---

## 5. 測試策略

### 5.1 單元測試

**框架**: Vitest  
**目標覆蓋率**: > 85%

**測試結構**:
```
peixuan-worker/src/calculation/
├── core/
│   ├── time/
│   │   ├── trueSolarTime.test.ts
│   │   ├── julianDay.test.ts
│   │   └── solarTerms.test.ts
│   └── ...
├── bazi/
│   └── fourPillars.test.ts
└── ziwei/
    └── palaces.test.ts
```

**測試案例來源**:
1. 數學模型中的範例
2. lunar-typescript 的測試案例
3. iztro 的測試案例
4. 傳統萬年曆數據

---

### 5.2 整合測試

**測試場景**:
1. 完整八字計算流程
2. 完整紫微斗數計算流程
3. 邊界條件 (閏年、閏月、極端經度)
4. 性能測試 (1000 次計算 < 1 秒)

---

### 5.3 驗證數據集

**收集來源**:
1. 歷史名人命盤 (公開資料)
2. 傳統命理書籍案例
3. 現有軟體輸出比對

**驗證標準**:
- 與 lunar-typescript 一致性 > 99%
- 與 iztro 一致性 > 95% (允許流派差異)
- 與傳統萬年曆一致性 > 99%

---

## 6. 風險管理

### 6.1 技術風險

| 風險 | 影響 | 機率 | 緩解措施 |
|------|------|------|----------|
| lunar-typescript API 變更 | 高 | 低 | 鎖定版本 1.8.6 |
| 真太陽時計算誤差 | 中 | 中 | 多重驗證源 |
| 流派差異爭議 | 低 | 高 | 參數化設計 |
| 性能問題 | 中 | 低 | 提前性能測試 |

---

### 6.2 時程風險

**緩衝策略**:
- 每個 Sprint 預留 20% 緩衝時間
- 優先完成 P0 任務
- P1/P2 任務可延後至 Phase 2

---

## 7. 交付物清單

### 7.1 代碼交付

- [ ] 時間校正模組 (3 檔案)
- [ ] 干支運算模組 (2 檔案)
- [ ] 五行關係模組 (1 檔案)
- [ ] 八字計算模組 (4 檔案)
- [ ] 紫微斗數模組 (6 檔案)
- [ ] 整合層 (2 檔案)
- [ ] 類型定義 (3 檔案)
- [ ] 單元測試 (20+ 檔案)

**總計**: ~40 檔案, ~3000 lines

---

### 7.2 文檔交付

- [ ] API 文檔更新
- [ ] 使用範例
- [ ] 測試報告
- [ ] 性能基準報告
- [ ] 遷移指南 (從舊實現)

---

### 7.3 部署交付

- [ ] 更新 Worker 代碼
- [ ] CI/CD 測試通過
- [ ] 生產環境部署
- [ ] 回歸測試

---

## 8. 成功標準

### 8.1 功能標準
- ✅ 所有 P0 任務完成
- ✅ 單元測試覆蓋率 > 85%
- ✅ 整合測試通過
- ✅ API 向後兼容

### 8.2 品質標準
- ✅ 與 lunar-typescript 一致性 > 99%
- ✅ 與 iztro 一致性 > 95%
- ✅ 性能: 1000 次計算 < 1 秒
- ✅ 無 P0/P1 Bug

### 8.3 文檔標準
- ✅ API 文檔完整
- ✅ 使用範例清晰
- ✅ 測試報告詳盡

---

## 9. 下一步 (Phase 2)

Phase 1 完成後，進入 Phase 2:
- 四化飛星圖論模型
- 大限流年優化
- 前端整合與可視化
- 喜用神最佳化模型

---

**計畫結束**

準備開始實作？或需要調整計畫細節？
