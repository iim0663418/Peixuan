# 核心邏輯重構規格文件

**基於**: `命理計算邏輯數學化研究.md`  
**目標**: 將數學化研究轉換為可實作的技術規格  
**日期**: 2025-11-29  
**版本**: v1.0

---

## 1. 重構目標與範圍

### 1.1 核心目標
將傳統命理計算邏輯重構為：
1. **數學化**: 基於嚴謹的數學公式與演算法
2. **模組化**: 清晰的職責劃分與介面定義
3. **可驗證**: 每個計算步驟可獨立測試
4. **可擴展**: 支援不同流派與參數調整

### 1.2 重構範圍

| 模組 | 當前狀態 | 目標狀態 | 優先級 |
|------|----------|----------|--------|
| 時間校正 | ❌ 缺失 | ✅ 實現真太陽時 | 🔴 P0 |
| 八字計算 | ⚠️ 部分實現 | ✅ 數學化重構 | 🔴 P0 |
| 紫微斗數 | ⚠️ 部分實現 | ✅ 數學化重構 | 🔴 P0 |
| 四化飛星 | ⚠️ 基礎實現 | ✅ 圖論模型 | 🟡 P1 |
| 大限流年 | ✅ 已實現 | ✅ 優化 | 🟢 P2 |
| 喜用神 | ❌ 缺失 | ✅ 最佳化模型 | 🟢 P2 |

---

## 2. 時間校正模組 (P0)

### 2.1 真太陽時計算

**數學模型** (來源: 研究文件 §1.1.1):

```typescript
/**
 * 計算真太陽時
 * @param clockTime 鐘錶時間 (UTC)
 * @param longitude 出生地經度 (東經為正)
 * @param date 日期 (用於計算均時差)
 * @returns 真太陽時 (分鐘偏移)
 */
function calculateTrueSolarTime(
  clockTime: Date,
  longitude: number,
  date: Date
): Date {
  // 1. 經度校正: ΔT_long = (L_local - L_std) × 4 分鐘
  const stdLongitude = getStandardLongitude(clockTime.getTimezoneOffset());
  const longitudeCorrection = (longitude - stdLongitude) * 4; // 分鐘
  
  // 2. 均時差: EoT
  const dayOfYear = getDayOfYear(date);
  const B = (360 / 365) * (dayOfYear - 81); // 度
  const EoT = 9.87 * Math.sin(2 * B * Math.PI / 180)
            - 7.53 * Math.cos(B * Math.PI / 180)
            - 1.5 * Math.sin(B * Math.PI / 180);
  
  // 3. T_input = T_clock + ΔT_long + EoT
  const totalCorrection = longitudeCorrection + EoT;
  return new Date(clockTime.getTime() + totalCorrection * 60 * 1000);
}
```

**介面定義**:
```typescript
interface TimeCorrection {
  clockTime: Date;
  trueSolarTime: Date;
  longitudeCorrection: number; // 分鐘
  equationOfTime: number; // 分鐘
  totalCorrection: number; // 分鐘
}
```

**測試案例**:
```typescript
// 案例 1: 北京時間 2024-01-01 12:00, 經度 116.4°E
// 預期: 真太陽時約 12:14 (經度校正 +14分鐘)

// 案例 2: 台北時間 2024-06-21 12:00, 經度 121.5°E
// 預期: 真太陽時約 12:06 + EoT
```

---

## 3. 八字計算模組重構 (P0)

### 3.1 干支週期模運算

**數學模型** (來源: 研究文件 §2.1):

```typescript
// 天干集合 (0-9)
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支集合 (0-11)
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 干支索引轉換
 * @param index 整數索引 (0-59 為一個完整週期)
 * @returns 干支對
 */
function indexToGanZhi(index: number): { stem: string; branch: string } {
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}

/**
 * 干支對轉索引
 */
function ganZhiToIndex(stem: string, branch: string): number {
  const stemIdx = HEAVENLY_STEMS.indexOf(stem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  
  // 使用中國剩餘定理求解
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return i;
    }
  }
  throw new Error('Invalid GanZhi combination');
}
```

### 3.2 四柱排盤演算法

**年柱計算** (來源: 研究文件 §2.2.1):

```typescript
/**
 * 計算年柱
 * @param solarDate 真太陽時日期
 * @param lichunTime 當年立春時刻
 * @returns 年柱干支索引
 */
function calculateYearPillar(
  solarDate: Date,
  lichunTime: Date
): number {
  let year = solarDate.getFullYear();
  
  // 若在立春前，年份減 1
  if (solarDate < lichunTime) {
    year -= 1;
  }
  
  // I_year = (Y - 3) mod 60
  return (year - 3) % 60;
}
```

**月柱計算** (來源: 研究文件 §2.2.2):

```typescript
/**
 * 計算月柱
 * @param solarLongitude 太陽黃經 (度)
 * @param yearStemIndex 年干索引 (0-9)
 * @returns 月柱干支索引
 */
function calculateMonthPillar(
  solarLongitude: number,
  yearStemIndex: number
): number {
  // 1. 根據黃經確定月支
  const monthBranchIndex = Math.floor((solarLongitude + 45) / 30) % 12;
  
  // 2. 五虎遁年法: 首月天干 = (2 × 年干 + 2) mod 10
  const firstMonthStemIndex = (2 * yearStemIndex + 2) % 10;
  
  // 3. 月干 = 首月天干 + 月支偏移
  const monthStemIndex = (firstMonthStemIndex + monthBranchIndex) % 10;
  
  // 4. 組合為 60 甲子索引
  return ganZhiToIndex(
    HEAVENLY_STEMS[monthStemIndex],
    EARTHLY_BRANCHES[monthBranchIndex]
  );
}
```

**日柱計算** (來源: 研究文件 §2.2.3):

```typescript
/**
 * 計算日柱 (使用儒略日)
 * @param date 日期
 * @returns 日柱干支索引
 */
function calculateDayPillar(date: Date): number {
  const jdn = dateToJulianDayNumber(date);
  // I_day = (JDN - 10) mod 60
  return (jdn - 10) % 60;
}

/**
 * 公曆轉儒略日數
 */
function dateToJulianDayNumber(date: Date): number {
  const a = Math.floor((14 - date.getMonth()) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 12 * a - 3;
  
  return date.getDate() 
       + Math.floor((153 * m + 2) / 5) 
       + 365 * y 
       + Math.floor(y / 4) 
       - Math.floor(y / 100) 
       + Math.floor(y / 400) 
       - 32045;
}
```

**時柱計算** (來源: 研究文件 §2.2.4):

```typescript
/**
 * 計算時柱
 * @param trueSolarTime 真太陽時
 * @param dayStemIndex 日干索引 (0-9)
 * @returns 時柱干支索引
 */
function calculateHourPillar(
  trueSolarTime: Date,
  dayStemIndex: number
): number {
  const hour = trueSolarTime.getHours();
  
  // 1. 時支: I_hour_branch = floor((hour + 1) mod 24 / 2)
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);
  
  // 2. 五鼠遁日法: I_hour_stem = (2 × 日干 + 時支) mod 10
  const hourStemIndex = (2 * dayStemIndex + hourBranchIndex) % 10;
  
  return ganZhiToIndex(
    HEAVENLY_STEMS[hourStemIndex],
    EARTHLY_BRANCHES[hourBranchIndex]
  );
}
```

### 3.3 藏干與十神矩陣

**地支藏干權重模型** (來源: 研究文件 §2.3.1):

```typescript
interface HiddenStem {
  stem: string;
  weight: number; // 0.0 - 1.0
  type: 'primary' | 'middle' | 'residual'; // 本氣/中氣/餘氣
}

const HIDDEN_STEMS_MAP: Record<string, HiddenStem[]> = {
  '子': [{ stem: '癸', weight: 1.0, type: 'primary' }],
  '丑': [
    { stem: '己', weight: 0.6, type: 'primary' },
    { stem: '癸', weight: 0.3, type: 'middle' },
    { stem: '辛', weight: 0.1, type: 'residual' }
  ],
  // ... 其他地支
};
```

**十神關係函數** (來源: 研究文件 §2.3.2):

```typescript
type TenGod = '比肩' | '劫財' | '食神' | '傷官' | '偏財' | '正財' | 
              '七殺' | '正官' | '偏印' | '正印';

/**
 * 計算十神關係
 * @param dayStem 日主天干
 * @param targetStem 目標天干
 * @returns 十神類型
 */
function calculateTenGod(dayStem: string, targetStem: string): TenGod {
  const dayIdx = HEAVENLY_STEMS.indexOf(dayStem);
  const targetIdx = HEAVENLY_STEMS.indexOf(targetStem);
  
  // 陰陽判定
  const dayStemYang = dayIdx % 2 === 0;
  const targetStemYang = targetIdx % 2 === 0;
  const sameYinYang = dayStemYang === targetStemYang;
  
  // 五行關係
  const relation = calculateWuXingRelation(dayIdx, targetIdx);
  
  // 十神映射表
  const tenGodMap: Record<string, TenGod> = {
    'same_yang': '比肩',
    'same_yin': '劫財',
    'produce_yang': '食神',
    'produce_yin': '傷官',
    // ... 完整映射
  };
  
  const key = `${relation}_${sameYinYang ? 'yang' : 'yin'}`;
  return tenGodMap[key];
}
```

---

## 4. 紫微斗數模組重構 (P0)

### 4.1 命宮與身宮定位

**數學模型** (來源: 研究文件 §3.1.1):

```typescript
/**
 * 計算命宮位置
 * @param lunarMonth 農曆月份 (1-12)
 * @param hourBranch 時辰地支序數 (0-11, 子=0)
 * @param leapMonthAdjustment 是否計入閏月
 * @returns 命宮地支索引 (0-11)
 */
function calculateLifePalace(
  lunarMonth: number,
  hourBranch: number,
  leapMonthAdjustment: boolean = false
): number {
  // P_life = (M - H + 1 + 12) mod 12
  let M = lunarMonth;
  if (leapMonthAdjustment) {
    // 閏月調整邏輯（不同流派）
  }
  
  const position = (M - hourBranch + 1 + 12) % 12;
  return position === 0 ? 11 : position - 1; // 轉為 0-based
}

/**
 * 計算身宮位置
 */
function calculateBodyPalace(
  lunarMonth: number,
  hourBranch: number
): number {
  // P_body = (M + H - 1) mod 12
  const position = (lunarMonth + hourBranch - 1) % 12;
  return position === 0 ? 11 : position - 1;
}
```

### 4.2 五行局判定

**納音五行映射** (來源: 研究文件 §3.2):

```typescript
type Bureau = 2 | 3 | 4 | 5 | 6; // 水二局/木三局/金四局/土五局/火六局

/**
 * 計算五行局
 * @param lifePalaceStem 命宮天干
 * @param lifePalaceBranch 命宮地支
 * @returns 局數 (2-6)
 */
function calculateBureau(
  lifePalaceStem: string,
  lifePalaceBranch: string
): Bureau {
  // 納音五行查表
  const naYinMap: Record<string, Bureau> = {
    '甲子': 2, '乙丑': 2, // 海中金 → 水二局
    '丙寅': 6, '丁卯': 6, // 爐中火 → 火六局
    // ... 完整 60 甲子納音表
  };
  
  const ganZhi = lifePalaceStem + lifePalaceBranch;
  return naYinMap[ganZhi];
}
```

### 4.3 紫微星定位演算法

**數學模型** (來源: 研究文件 §3.3):

```typescript
/**
 * 計算紫微星位置
 * @param lunarDay 農曆日數 (1-30)
 * @param bureau 五行局數 (2-6)
 * @returns 紫微星地支索引 (0-11, 寅=2)
 */
function findZiWeiPosition(lunarDay: number, bureau: Bureau): number {
  const quotient = Math.floor(lunarDay / bureau);
  const remainder = lunarDay % bureau;
  
  let position: number;
  
  if (remainder === 0) {
    // 整除情況
    position = quotient - 1;
  } else {
    // 需要借數
    const borrow = bureau - remainder;
    const adjustedQuotient = Math.floor((lunarDay + borrow) / bureau);
    
    // 奇數逆行，偶數順行
    if (borrow % 2 === 1) {
      position = adjustedQuotient - borrow;
    } else {
      position = adjustedQuotient + borrow;
    }
  }
  
  // 映射至寅宮起算 (寅=2)
  const finalPosition = (2 + position - 1) % 12;
  return finalPosition < 0 ? finalPosition + 12 : finalPosition;
}
```

### 4.4 星曜分佈向量邏輯

**天府星系對稱** (來源: 研究文件 §3.4):

```typescript
/**
 * 計算天府星位置 (與紫微對稱)
 * @param ziWeiPosition 紫微星位置
 * @returns 天府星位置
 */
function findTianFuPosition(ziWeiPosition: number): number {
  // P_TF = (12 - P_ZW) mod 12
  const position = (12 - ziWeiPosition) % 12;
  return position === 0 ? 11 : position - 1;
}

/**
 * 計算時系星 (文昌、文曲)
 */
function findTimeStars(hourBranch: number): {
  wenChang: number;
  wenQu: number;
} {
  // 文昌順行，文曲逆行
  return {
    wenChang: (hourBranch + 10) % 12, // 從戌宮起
    wenQu: (12 - hourBranch + 4) % 12 // 從辰宮起逆行
  };
}
```

---

## 5. 四化飛星圖論模型 (P1)

### 5.1 狀態機模型

**數學模型** (來源: 研究文件 §4.1):

```typescript
type Transformation = '祿' | '權' | '科' | '忌';

interface TransformationRule {
  stem: string; // 觸發天干
  lu: string;   // 化祿星
  quan: string; // 化權星
  ke: string;   // 化科星
  ji: string;   // 化忌星
}

const TRANSFORMATION_MAP: TransformationRule[] = [
  { stem: '甲', lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  { stem: '乙', lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  // ... 完整十天干映射
];

/**
 * 應用四化遮罩
 * @param chart 命盤
 * @param triggerStem 觸發天干 (年/月/日/時)
 * @returns 帶四化標記的命盤
 */
function applyTransformations(
  chart: PurpleStarChart,
  triggerStem: string
): PurpleStarChart {
  const rule = TRANSFORMATION_MAP.find(r => r.stem === triggerStem);
  if (!rule) return chart;
  
  // 動態遮罩：不修改原始星盤，僅添加標記
  return {
    ...chart,
    transformations: {
      trigger: triggerStem,
      lu: rule.lu,
      quan: rule.quan,
      ke: rule.ke,
      ji: rule.ji
    }
  };
}
```

---

## 6. 資料結構設計

### 6.1 統一輸入介面

```typescript
interface BirthInfo {
  // 時間資訊
  clockTime: Date;           // 鐘錶時間 (UTC)
  timezone: string;          // 時區 (IANA format)
  
  // 地理資訊
  location: {
    latitude: number;        // 緯度
    longitude: number;       // 經度
    name?: string;           // 地名
  };
  
  // 個人資訊
  gender: 'male' | 'female';
  name?: string;
  
  // 計算選項
  options?: {
    useTrueSolarTime: boolean;      // 是否使用真太陽時
    leapMonthAdjustment: boolean;   // 閏月調整
    purpleStarSchool: 'zhongzhou' | 'qintian'; // 紫微流派
  };
}
```

### 6.2 統一輸出介面

```typescript
interface CalculationResult {
  // 時間校正資訊
  timeCorrection: TimeCorrection;
  
  // 八字資訊
  bazi: {
    year: GanZhiPair;
    month: GanZhiPair;
    day: GanZhiPair;
    hour: GanZhiPair;
    hiddenStems: HiddenStem[][];
    tenGods: TenGod[][];
    strength: {
      score: number;
      category: 'strong' | 'weak';
      favorableElements: string[];
    };
  };
  
  // 紫微斗數資訊
  purpleStar: {
    lifePalace: number;
    bodyPalace: number;
    bureau: Bureau;
    palaces: Palace[];
    stars: StarPosition[];
    transformations?: TransformationState;
  };
  
  // 元數據
  metadata: {
    calculatedAt: Date;
    version: string;
    algorithms: {
      timeCorrection: string;
      bazi: string;
      purpleStar: string;
    };
  };
}
```

---

## 7. 實作優先級與時程

### Phase 1: 基礎重構 (Week 2-3)
- [ ] 時間校正模組
- [ ] 八字計算核心重構
- [ ] 紫微斗數核心重構
- [ ] 單元測試覆蓋率 > 80%

### Phase 2: 進階功能 (Week 4-5)
- [ ] 四化飛星圖論模型
- [ ] 大限流年優化
- [ ] 前端整合與顯示

### Phase 3: 優化與驗證 (Week 6+)
- [ ] 喜用神最佳化模型
- [ ] 性能優化
- [ ] 大數據驗證

---

## 8. 測試策略

### 8.1 單元測試
- 每個數學函數獨立測試
- 邊界條件測試 (閏年、閏月、極端經度)
- 已知案例驗證 (歷史名人命盤)

### 8.2 整合測試
- 端到端計算流程
- 不同流派參數切換
- 性能基準測試

### 8.3 驗證數據集
- 收集 100+ 已知命盤
- 與傳統軟體結果比對
- 誤差容忍度: ±1 時辰

---

## 9. 前端整合方案

### 9.1 計算結果可視化
- 八字命盤表格顯示
- 紫微斗數圓盤圖
- 五行能量雷達圖
- 大限流年時間軸

### 9.2 互動功能
- 參數調整 (真太陽時開關、流派切換)
- 計算步驟展示 (教學模式)
- 結果匯出 (JSON/PDF)

---

**文件結束**

下一步: 基於此規格開始實作 Phase 1
