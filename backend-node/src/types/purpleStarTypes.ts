// backend-node/src/types/purpleStarTypes.ts
// 紫微斗數 API 的類型定義

export interface LunarInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
  timeGan: string;
  timeZhi: string;
  yearInGanZhi: string;
  monthInGanZhi: string;
  dayInGanZhi: string;
  timeInGanZhi: string;
}

export interface PurpleStarCalculationRequest {
  // 必需字段
  birthDate: string;           // ISO 8601 格式，例如 "1990-02-20"
  birthTime: string;           // 24小時格式，例如 "14:30"
  gender: 'male' | 'female';   // 性別

  // 前端計算的農曆資訊
  lunarInfo: LunarInfo;

  // 可選字段
  location?: {
    latitude: number;          // 緯度，範圍 -90 到 90
    longitude: number;         // 經度，範圍 -180 到 180
    timezone?: string;         // 時區，例如 "Asia/Taipei"
  };

  options?: {
    includeMajorCycles?: boolean;     // 是否包含大限計算
    includeMinorCycles?: boolean;     // 是否包含小限計算
    includeAnnualCycles?: boolean;    // 是否包含流年計算
    includeFourTransformations?: boolean; // 是否包含四化飛星資料計算
    detailLevel?: 'basic' | 'advanced' | 'expert';  // 詳細程度
    maxAge?: number;                  // 計算到多少歲，預設 100
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string;
  validationErrors?: ValidationError[];
  timestamp: string;
}

export interface PurpleStarCalculationResponse {
  success: true;
  data: {
    chart: PurpleStarChart;
    calculationInfo: {
      birthInfo: {
        solarDate: string;
        lunarDate: string;
        gender: 'male' | 'female';
        location?: {
          latitude: number;
          longitude: number;
          timezone?: string;
        };
      };
      options: {
        includeMajorCycles: boolean;
        includeMinorCycles: boolean;
        includeAnnualCycles: boolean;
        detailLevel: 'basic' | 'advanced' | 'expert';
        maxAge: number;
      };
    };
  };
  timestamp: string;
}

// 從前端 ziweiCalc.ts 導入的接口定義
// 定義亮度等級
export type StarBrightness = '廟' | '旺' | '得地' | '利益' | '平和' | '不得地' | '落陷';

export interface Star {
  name: string;
  type: 'main' | 'auxiliary' | 'minor';
  palaceIndex: number;
  transformations?: ('祿' | '權' | '科' | '忌')[];
  // 新增星曜屬性
  attribute?: '吉' | '凶' | '中性';  // 星曜吉凶屬性
  propertyType?: '陽' | '陰';        // 星曜陰陽屬性
  element?: '水' | '木' | '火' | '土' | '金'; // 五行屬性
  strength?: number;                // 星曜強度 (1-10)
  description?: string;            // 星曜描述
  brightness?: StarBrightness;     // 新增亮度屬性
}

export interface Palace {
  name: string;
  index: number;
  stars: Star[];
  gan?: string;
  zhi?: string;
  // 新增宮位吉凶
  fortuneType?: '吉' | '凶' | '中性';  // 宮位吉凶
  fortuneScore?: number;             // 吉凶評分 (1-10)
  element?: '水' | '木' | '火' | '土' | '金'; // 宮位五行
  significance?: 'high' | 'medium' | 'low'; // 宮位重要性
}

// 星曜屬性配置類型
export interface StarAttributeConfig {
  name: string;
  attribute: '吉' | '凶' | '中性';
  propertyType: '陽' | '陰';
  element: '水' | '木' | '火' | '土' | '金';
  strength: number;
  description: string;
}

export interface DaXianInfo {
  startAge: number;
  endAge: number;
  palaceName: string;
  palaceZhi: string;
  palaceIndex: number;
}

export interface XiaoXianInfo {
  age: number;
  palaceName: string;
  palaceZhi: string;
  palaceIndex: number;
}

export interface LiuNianTaiSuiInfo {
  year: number;
  ganZhi: string;
  palaceName: string;
  palaceZhi: string;
  palaceIndex: number;
}

// 宮位解讀類型定義
export interface PalaceInterpretation {
  palaceName: string;
  personalityTraits: string[];       // 性格特質
  strengthAreas: string[];           // 強項領域
  challengeAreas: string[];          // 挑戰領域
  lifeThemes: string[];              // 生命主題
  keyStarInfluences: string[];       // 主要星曜影響
  advice: string[];                  // 建議
}

// 特定領域分析類型定義
export interface DomainSpecificAnalysis {
  domain: 'career' | 'wealth' | 'marriage' | 'health' | 'education' | 'social';
  overallFortune: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  keyInsights: string[];            // 關鍵洞察
  starInfluences: string[];         // 星曜影響
  recommendedActions: string[];     // 建議行動
  periods: {                        // 特定時期變化
    favorable: string[];            // 有利時期
    challenging: string[];          // 挑戰時期
  };
}

// 綜合命盤解讀類型定義
export interface ComprehensiveChartInterpretation {
  overallLifePattern: string;       // 整體生命模式
  majorLifeCycles: {                // 主要生命週期
    period: string;
    theme: string;
    focus: string;
  }[];
  potentialChallenges: string[];    // 潛在挑戰
  uniqueStrengths: string[];        // 獨特優勢
  spiritualGrowthPath: string;      // 靈性成長路徑
  lifePurpose: string;              // 生命目的
  keyCrossPalacePatterns: string[]; // 關鍵跨宮位模式
}

export interface PurpleStarChart {
  palaces: Palace[];
  mingPalaceIndex: number;
  shenPalaceIndex: number;
  mingGan?: string;            // 命宮天干，用於四化飛星計算
  fiveElementsBureau?: string;
  daXian?: DaXianInfo[];
  xiaoXian?: XiaoXianInfo[];
  liuNianTaiSui?: LiuNianTaiSuiInfo[];
  
  // 新增命盤解讀相關欄位
  palaceInterpretations?: PalaceInterpretation[];
  domainAnalyses?: DomainSpecificAnalysis[];
  comprehensiveInterpretation?: ComprehensiveChartInterpretation;
  keyPatterns?: string[];      // 新增格局列表
}

export interface BirthInfo {
  solarDate: Date;
  gender: 'male' | 'female';
  location?: string;
}

// 八字計算結果類型定義
export interface BaziCalculationResult {
  pillars: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  };
  elements?: Record<string, number>;
  tenGods?: Array<{
    pillar: 'year' | 'month' | 'day' | 'hour';
    position: 'gan' | 'zhi';
    god: string;
    element: string;
  }>;
  luck?: {
    startAge: number;
    startYear: number;
    direction: 'forward' | 'backward';
  };
  yearlyInteractions?: Array<{
    year: number;
    interactions: Array<{
      type: string;
      description: string;
      significance: 'high' | 'medium' | 'low';
    }>;
  }>;
}
