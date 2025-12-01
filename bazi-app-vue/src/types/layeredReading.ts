/**
 * 分層閱覽系統類型定義
 * 支持命運洞悉功能的多層級展示
 */

// 閱覽層級枚舉
export enum ReadingLevel {
  // eslint-disable-next-line no-unused-vars
  SUMMARY = 'summary', // 簡要預覽
  // eslint-disable-next-line no-unused-vars
  COMPACT = 'compact', // 精簡檢視
  // eslint-disable-next-line no-unused-vars
  STANDARD = 'standard', // 標準解讀
  // eslint-disable-next-line no-unused-vars
  DEEP_ANALYSIS = 'deep', // 深度分析
}

// 層級配置
export interface ReadingLevelConfig {
  level: ReadingLevel;
  label: string;
  description: string;
  icon: string;
  minDataRequirement: number; // 最低資料完整度要求 (0-100)
  estimatedReadTime: string; // 預估閱讀時間
}

// 分層閱覽配置
export const READING_LEVEL_CONFIGS: Record<ReadingLevel, ReadingLevelConfig> = {
  [ReadingLevel.SUMMARY]: {
    level: ReadingLevel.SUMMARY,
    label: '簡要預覽',
    description: '快速了解核心特質，1分鐘速覽',
    icon: '👁️',
    minDataRequirement: 30,
    estimatedReadTime: '1分鐘',
  },
  [ReadingLevel.COMPACT]: {
    level: ReadingLevel.COMPACT,
    label: '精簡檢視',
    description: '重點特質與運勢要點，3分鐘掌握',
    icon: '📝',
    minDataRequirement: 50,
    estimatedReadTime: '3分鐘',
  },
  [ReadingLevel.STANDARD]: {
    level: ReadingLevel.STANDARD,
    label: '標準解讀',
    description: '完整人生解讀與建議，10分鐘深度了解',
    icon: '📊',
    minDataRequirement: 70,
    estimatedReadTime: '10分鐘',
  },
  [ReadingLevel.DEEP_ANALYSIS]: {
    level: ReadingLevel.DEEP_ANALYSIS,
    label: '深度分析',
    description: '全方位詳盡分析，20分鐘完整解讀',
    icon: '🔍',
    minDataRequirement: 85,
    estimatedReadTime: '20分鐘',
  },
};

// 分層內容資料結構
export interface LayeredContent {
  level: ReadingLevel;
  visible: boolean;
  priority: number; // 顯示優先級
  content: {
    title?: string;
    items: string[];
    details?: Record<string, any>;
  };
}

// 分層閱覽狀態
export interface LayeredReadingState {
  currentLevel: ReadingLevel;
  availableLevels: ReadingLevel[];
  dataCompleteness: number; // 資料完整度 (0-100)
  isTransitioning: boolean; // 是否正在切換層級
  lastUpdated: Date;
}

// 綜合解讀的分層資料
export interface LayeredIntegratedAnalysis {
  // 基本資訊
  metadata: {
    analysisId: string;
    timestamp: Date;
    dataCompleteness: number;
    availableLevels: ReadingLevel[];
  };

  // 分層內容
  layers: {
    // 簡要預覽層
    summary: {
      coreTraits: LayeredContent; // 核心特質 (3-5個關鍵詞)
      currentFortune: LayeredContent; // 近期運勢 (1句話總結)
    };

    // 精簡檢視層
    compact: {
      personalityHighlights: LayeredContent; // 性格亮點 (5-8個要點)
      fortuneTrends: LayeredContent; // 運勢趨勢 (3個主要週期)
      quickAdvice: LayeredContent; // 快速建議 (3-5條)
    };

    // 標準解讀層
    standard: {
      personalityAnalysis: LayeredContent; // 完整性格分析
      lifeStages: LayeredContent; // 人生階段解讀
      relationships: LayeredContent; // 人際關係分析
      careerGuidance: LayeredContent; // 事業指導
      healthWellness: LayeredContent; // 健康養生
      recommendations: LayeredContent; // 綜合建議
    };

    // 深度分析層
    deep: {
      elementalAnalysis: LayeredContent; // 五行深度分析
      cosmicInfluences: LayeredContent; // 星曜影響解讀
      transformationCycles: LayeredContent; // 四化週期分析
      detailedForecasts: LayeredContent; // 詳細預測
      spiritualGuidance: LayeredContent; // 心靈指導
      actionPlans: LayeredContent; // 具體行動計劃
    };
  };
}

// 層級切換動畫配置
export interface TransitionConfig {
  duration: number; // 動畫持續時間 (ms)
  easing: string; // 緩動函數
  staggerDelay: number; // 交錯延遲 (ms)
}

export const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  staggerDelay: 50,
};

// 響應式斷點配置
export enum ResponsiveBreakpoint {
  // eslint-disable-next-line no-unused-vars
  MOBILE = 'mobile', // < 768px
  // eslint-disable-next-line no-unused-vars
  TABLET = 'tablet', // 768px - 1024px
  // eslint-disable-next-line no-unused-vars
  DESKTOP = 'desktop', // > 1024px
}

export interface ResponsiveConfig {
  breakpoint: ResponsiveBreakpoint;
  defaultLevel: ReadingLevel;
  maxVisibleItems: Record<ReadingLevel, number>;
  layoutType: 'stack' | 'grid' | 'accordion';
}

export const RESPONSIVE_CONFIGS: Record<
  ResponsiveBreakpoint,
  ResponsiveConfig
> = {
  [ResponsiveBreakpoint.MOBILE]: {
    breakpoint: ResponsiveBreakpoint.MOBILE,
    defaultLevel: ReadingLevel.SUMMARY,
    maxVisibleItems: {
      [ReadingLevel.SUMMARY]: 3,
      [ReadingLevel.COMPACT]: 5,
      [ReadingLevel.STANDARD]: 8,
      [ReadingLevel.DEEP_ANALYSIS]: 10,
    },
    layoutType: 'accordion',
  },
  [ResponsiveBreakpoint.TABLET]: {
    breakpoint: ResponsiveBreakpoint.TABLET,
    defaultLevel: ReadingLevel.COMPACT,
    maxVisibleItems: {
      [ReadingLevel.SUMMARY]: 5,
      [ReadingLevel.COMPACT]: 8,
      [ReadingLevel.STANDARD]: 12,
      [ReadingLevel.DEEP_ANALYSIS]: 15,
    },
    layoutType: 'grid',
  },
  [ResponsiveBreakpoint.DESKTOP]: {
    breakpoint: ResponsiveBreakpoint.DESKTOP,
    defaultLevel: ReadingLevel.STANDARD,
    maxVisibleItems: {
      [ReadingLevel.SUMMARY]: 6,
      [ReadingLevel.COMPACT]: 10,
      [ReadingLevel.STANDARD]: 15,
      [ReadingLevel.DEEP_ANALYSIS]: 20,
    },
    layoutType: 'grid',
  },
};

// 資料轉換器類型
/* eslint-disable no-unused-vars */
export interface DataAdapter<T> {
  adaptToLevel(data: T, level: ReadingLevel): LayeredContent[];
  getDataCompleteness(data: T): number;
  getAvailableLevels(data: T): ReadingLevel[];
}
/* eslint-enable no-unused-vars */

// 用戶偏好設置
export interface UserReadingPreferences {
  preferredLevel: ReadingLevel;
  autoUpgrade: boolean; // 資料完整時自動升級層級
  animationsEnabled: boolean;
  compactMode: boolean; // 緊湊模式
  customizations: {
    hiddenSections: string[];
    pinnedSections: string[];
    sectionOrder: string[];
  };
}

// 導出預設配置
export const DEFAULT_USER_PREFERENCES: UserReadingPreferences = {
  preferredLevel: ReadingLevel.STANDARD,
  autoUpgrade: true,
  animationsEnabled: true,
  compactMode: false,
  customizations: {
    hiddenSections: [],
    pinnedSections: [],
    sectionOrder: [],
  },
};
