export interface PurpleStarChart {
  palaces: Palace[];
  mingPalaceIndex: number;
  shenPalaceIndex: number;
  fiveElementsBureau?: string;
  daXian?: DaXianInfo[];
  xiaoXian?: XiaoXianInfo[];
  liuNianTaiSui?: LiuNianTaiSuiInfo[];
}

export interface Palace {
  name: string;
  index: number;
  zhi: string;
  stars: Star[];
}

export interface Star {
  name: string;
  type: 'main' | 'auxiliary' | 'minor';
  palaceIndex: number;
  transformations?: ('祿' | '權' | '科' | '忌')[];
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
