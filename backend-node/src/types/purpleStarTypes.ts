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
export interface Star {
  name: string;
  type: 'main' | 'auxiliary' | 'minor';
  palaceIndex: number;
  transformations?: ('祿' | '權' | '科' | '忌')[];
}

export interface Palace {
  name: string;
  index: number;
  stars: Star[];
  gan?: string;
  zhi?: string;
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

export interface PurpleStarChart {
  palaces: Palace[];
  mingPalaceIndex: number;
  shenPalaceIndex: number;
  fiveElementsBureau?: string;
  daXian?: DaXianInfo[];
  xiaoXian?: XiaoXianInfo[];
  liuNianTaiSui?: LiuNianTaiSuiInfo[];
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
