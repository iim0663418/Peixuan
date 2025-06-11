export interface PurpleStarChart {
  palaces: Palace[];
  mingPalaceIndex: number;
  shenPalaceIndex: number;
  mingGan?: string; // 命宮天干
  fiveElementsBureau?: string;
  daXian?: DaXianInfo[];
  xiaoXian?: XiaoXianInfo[];
  liuNianTaiSui?: LiuNianTaiSuiInfo[];
  // 命盤解讀相關
  palaceInterpretations?: PalaceInterpretation[];
  domainAnalyses?: DomainSpecificAnalysis[];
  comprehensiveInterpretation?: ComprehensiveChartInterpretation;
}

// 宮位詳細解讀
export interface PalaceInterpretation {
  palaceName: string;
  personalityTraits: string[];
  strengthAreas: string[];
  challengeAreas: string[];
  lifeThemes: string[];
  keyStarInfluences: string[];
  advice: string[];
}

// 特定領域分析
export interface DomainSpecificAnalysis {
  domain: 'career' | 'wealth' | 'marriage' | 'health' | 'education' | 'social';
  overallFortune: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  keyInsights: string[];
  starInfluences: string[];
  recommendedActions: string[];
  periods: {
    favorable: string[];
    challenging: string[];
  };
}

// 生命週期類型
export interface LifeCycle {
  period: string;
  theme: string;
  focus: string;
}

// 綜合命盤解讀
export interface ComprehensiveChartInterpretation {
  overallLifePattern: string;
  majorLifeCycles: LifeCycle[];
  potentialChallenges: string[];
  uniqueStrengths: string[];
  spiritualGrowthPath: string;
  lifePurpose: string;
  keyCrossPalacePatterns: string[];
}

export interface Palace {
  name: string;
  index: number;
  zhi: string;
  stars: Star[];
  fortuneType?: '吉' | '凶' | '中性';
  fortuneScore?: number;
  element?: '水' | '木' | '火' | '土' | '金';
  significance?: 'high' | 'medium' | 'low';
}

export interface Star {
  name: string;
  type: 'main' | 'auxiliary' | 'minor';
  palaceIndex: number;
  transformations?: ('祿' | '權' | '科' | '忌')[];
  attribute?: '吉' | '凶' | '中性';
  propertyType?: '陽' | '陰';
  element?: '水' | '木' | '火' | '土' | '金';
  strength?: number;
  description?: string;
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

export interface BaziChart {
  pillars: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  };
  elements: Record<string, number>;
  tenGods: TenGod[];
}

export interface TenGod {
  pillar: 'year' | 'month' | 'day' | 'hour';
  position: 'gan' | 'zhi';
  god: string;
  element: string;
}

// 四化飛星相關類型
export interface TransformationFlow {
  palaceIndex: number;
  palaceName: string;
  energyScore: number;
  majorInfluences: string[];
}

export interface TransformationCombination {
  palaceIndex: number;
  palaceName: string;
  combination: string;
  effect: string;
  significance: 'high' | 'medium' | 'low';
}

export interface LayeredEnergy {
  palaceIndex: number;
  palaceName: string;
  baseEnergy: number;
  daXianEnergy: number;
  liuNianEnergy: number;
  liuYueEnergy: number;
  totalEnergy: number;
  interpretation: string;
}

export interface PurpleStarAPIResponse {
  success: boolean;
  data: {
    chart: PurpleStarChart;
    calculationInfo: {
      calculationTime: string;
      method: string;
      version: string;
    };
    transformations?: {
      flows: Record<number, TransformationFlow>;
      combinations: TransformationCombination[];
      layeredEnergies: Record<number, LayeredEnergy>;
    };
  };
  timestamp: string;
}

export interface IntegratedAnalysisResponse {
  success: boolean;
  data: {
    integratedAnalysis: {
      overallConfidence: number;
      consensusFindings: string[];
      divergentFindings: string[];
      recommendations: string[];
      detailedAnalysis: {
        personality: CorrelationResult;
        fortune: CorrelationResult;
        elements: CorrelationResult;
        cycles: CorrelationResult;
      };
      crossValidation?: {
        agreementPercentage: number;
        reliabilityScore: number;
        validationSources: string[];
      };
    };
    purpleStarChart: PurpleStarChart;
    baziChart: BaziChart;
    analysisInfo: {
      calculationTime: string;
      methodsUsed: string[];
      confidence: number;
      layer: string;
    };
  };
  meta: {
    layer: string;
    userRole: string;
    features: string[];
    sources: string[];
  };
  timestamp: string;
}

export interface ConfidenceAssessmentResponse {
  success: boolean;
  data: {
    overallConfidence: number;
    detailedConfidence: {
      personality: number;
      fortune: number;
      elements: number;
      cycles: number;
    };
    agreementPercentage: number;
    reliabilityScore: number;
    consensusFindings: string[];
    divergentFindings: string[];
    interpretation: string;
  };
  timestamp: string;
}

export interface CorrelationResult {
  category: 'personality' | 'fortune' | 'elements' | 'cycles';
  matches: string[];
  differences: string[];
  confidence: number;
  description: string;
}
