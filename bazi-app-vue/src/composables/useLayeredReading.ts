/**
 * 分層閱覽響應式狀態管理
 * 使用 Vue 3 Composition API 實現綜合解讀的多層級展示
 */

import { ref, computed, reactive, watch, nextTick } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { 
  ReadingLevel,
  READING_LEVEL_CONFIGS, 
  RESPONSIVE_CONFIGS, 
  DEFAULT_USER_PREFERENCES,
  DEFAULT_TRANSITION_CONFIG,
  ResponsiveBreakpoint
} from '@/types/layeredReading';
import type { 
  LayeredReadingState, 
  LayeredIntegratedAnalysis,
  UserReadingPreferences,
  TransitionConfig,
  LayeredContent
} from '@/types/layeredReading';

// 響應式斷點檢測
const isMobile = useMediaQuery('(max-width: 767px)');
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');

// 全局狀態
const globalReadingState = reactive<LayeredReadingState>({
  currentLevel: ReadingLevel.STANDARD,
  availableLevels: [ReadingLevel.SUMMARY, ReadingLevel.COMPACT, ReadingLevel.STANDARD],
  dataCompleteness: 0,
  isTransitioning: false,
  lastUpdated: new Date()
});

const userPreferences = ref<UserReadingPreferences>({ ...DEFAULT_USER_PREFERENCES });
const layeredData = ref<LayeredIntegratedAnalysis | null>(null);

/**
 * 主要的分層閱覽 Composable
 */
export function useLayeredReading() {
  
  // 計算當前響應式斷點
  const currentBreakpoint = computed<ResponsiveBreakpoint>(() => {
    if (isMobile.value) return ResponsiveBreakpoint.MOBILE;
    if (isTablet.value) return ResponsiveBreakpoint.TABLET;
    return ResponsiveBreakpoint.DESKTOP;
  });

  // 計算當前響應式配置
  const responsiveConfig = computed(() => RESPONSIVE_CONFIGS[currentBreakpoint.value]);

  // 計算可用的閱覽層級
  const availableLevels = computed<ReadingLevel[]>(() => {
    if (!layeredData.value) return [ReadingLevel.SUMMARY];
    
    const completeness = globalReadingState.dataCompleteness;
    const levels = Object.values(ReadingLevel).filter(level => {
      const config = READING_LEVEL_CONFIGS[level];
      return completeness >= config.minDataRequirement;
    });
    
    return levels.length > 0 ? levels : [ReadingLevel.SUMMARY];
  });

  // 計算當前層級配置
  const currentLevelConfig = computed(() => 
    READING_LEVEL_CONFIGS[globalReadingState.currentLevel]
  );

  // 計算是否可以升級到更高層級
  const canUpgrade = computed(() => {
    const currentIndex = availableLevels.value.indexOf(globalReadingState.currentLevel);
    return currentIndex < availableLevels.value.length - 1;
  });

  // 計算是否可以降級到更低層級
  const canDowngrade = computed(() => {
    const currentIndex = availableLevels.value.indexOf(globalReadingState.currentLevel);
    return currentIndex > 0;
  });

  /**
   * 切換閱覽層級
   */
  const switchToLevel = async (targetLevel: ReadingLevel, animated = true) => {
    if (globalReadingState.isTransitioning) return false;
    if (!availableLevels.value.includes(targetLevel)) return false;

    try {
      globalReadingState.isTransitioning = true;

      // 動畫處理
      if (animated) {
        await animateTransition(globalReadingState.currentLevel, targetLevel);
      }

      // 更新狀態
      globalReadingState.currentLevel = targetLevel;
      globalReadingState.lastUpdated = new Date();

      // 保存用戶偏好
      userPreferences.value.preferredLevel = targetLevel;
      saveUserPreferences();

      return true;
    } catch (error) {
      console.error('切換閱覽層級失敗:', error);
      return false;
    } finally {
      globalReadingState.isTransitioning = false;
    }
  };

  /**
   * 自動選擇最佳層級
   */
  const autoSelectOptimalLevel = () => {
    const breakpointConfig = responsiveConfig.value;
    const userPreferred = userPreferences.value.preferredLevel;
    
    // 優先使用用戶偏好，如果可用的話
    if (availableLevels.value.includes(userPreferred)) {
      return switchToLevel(userPreferred);
    }
    
    // 否則使用響應式配置的默認層級
    const defaultLevel = breakpointConfig.defaultLevel;
    const fallbackLevel = availableLevels.value.find(level => 
      availableLevels.value.indexOf(level) >= availableLevels.value.indexOf(defaultLevel)
    ) || availableLevels.value[0];
    
    return switchToLevel(fallbackLevel);
  };

  /**
   * 升級到下一個層級
   */
  const upgradeLevel = () => {
    if (!canUpgrade.value) return false;
    const currentIndex = availableLevels.value.indexOf(globalReadingState.currentLevel);
    const nextLevel = availableLevels.value[currentIndex + 1];
    return switchToLevel(nextLevel);
  };

  /**
   * 降級到上一個層級
   */
  const downgradeLevel = () => {
    if (!canDowngrade.value) return false;
    const currentIndex = availableLevels.value.indexOf(globalReadingState.currentLevel);
    const prevLevel = availableLevels.value[currentIndex - 1];
    return switchToLevel(prevLevel);
  };

  /**
   * 更新分層數據
   */
  const updateLayeredData = (newData: LayeredIntegratedAnalysis) => {
    layeredData.value = newData;
    globalReadingState.dataCompleteness = newData.metadata.dataCompleteness;
    globalReadingState.availableLevels = availableLevels.value;
    globalReadingState.lastUpdated = new Date();

    // 如果啟用自動升級且數據完整度提高
    if (userPreferences.value.autoUpgrade) {
      autoSelectOptimalLevel();
    }
  };

  /**
   * 獲取當前層級的內容
   */
  const getCurrentLevelContent = computed(() => {
    if (!layeredData.value) return null;

    const level = globalReadingState.currentLevel;
    const layers = layeredData.value.layers;
    
    switch (level) {
      case ReadingLevel.SUMMARY:
        return layers.summary;
      case ReadingLevel.COMPACT:
        return layers.compact;
      case ReadingLevel.STANDARD:
        return layers.standard;
      case ReadingLevel.DEEP_ANALYSIS:
        return layers.deep;
      default:
        return layers.summary;
    }
  });

  /**
   * 動畫處理
   */
  const animateTransition = async (fromLevel: ReadingLevel, toLevel: ReadingLevel) => {
    if (!userPreferences.value.animationsEnabled) return;
    
    const config = DEFAULT_TRANSITION_CONFIG;
    
    // 實現漸進式動畫
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, config.duration);
    });
  };

  /**
   * 響應式佈局調整
   */
  const getLayoutConfig = computed(() => {
    const config = responsiveConfig.value;
    const level = globalReadingState.currentLevel;
    
    return {
      maxVisibleItems: config.maxVisibleItems[level],
      layoutType: config.layoutType,
      isCompact: userPreferences.value.compactMode || isMobile.value
    };
  });

  /**
   * 保存用戶偏好到 localStorage
   */
  const saveUserPreferences = () => {
    try {
      sessionStorage.setItem('layered-reading-preferences', JSON.stringify(userPreferences.value));
    } catch (error) {
      console.warn('無法保存用戶偏好設置:', error);
    }
  };

  /**
   * 從 localStorage 載入用戶偏好
   */
  const loadUserPreferences = () => {
    try {
      const saved = sessionStorage.getItem('layered-reading-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        userPreferences.value = { ...DEFAULT_USER_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('無法載入用戶偏好設置:', error);
      userPreferences.value = { ...DEFAULT_USER_PREFERENCES };
    }
  };

  /**
   * 重置到默認狀態
   */
  const resetToDefaults = () => {
    globalReadingState.currentLevel = responsiveConfig.value.defaultLevel;
    globalReadingState.isTransitioning = false;
    userPreferences.value = { ...DEFAULT_USER_PREFERENCES };
    saveUserPreferences();
  };

  // 監聽響應式斷點變化，自動調整層級
  watch(currentBreakpoint, (newBreakpoint) => {
    const config = RESPONSIVE_CONFIGS[newBreakpoint];
    if (availableLevels.value.includes(config.defaultLevel)) {
      switchToLevel(config.defaultLevel, userPreferences.value.animationsEnabled);
    }
  });

  // 初始化時載入用戶偏好
  loadUserPreferences();

  return {
    // 狀態
    readingState: globalReadingState,
    userPreferences,
    layeredData,
    
    // 計算屬性
    currentBreakpoint,
    responsiveConfig,
    availableLevels,
    currentLevelConfig,
    canUpgrade,
    canDowngrade,
    getCurrentLevelContent,
    getLayoutConfig,
    
    // 方法
    switchToLevel,
    upgradeLevel,
    downgradeLevel,
    autoSelectOptimalLevel,
    updateLayeredData,
    saveUserPreferences,
    loadUserPreferences,
    resetToDefaults
  };
}

/**
 * 數據適配器 Composable
 * 將現有的綜合分析數據轉換為分層結構
 */
export function useDataAdapter() {
  
  /**
   * 將現有的 IntegratedAnalysisResponse 轉換為 LayeredIntegratedAnalysis
   */
  const adaptIntegratedAnalysis = (originalData: any): LayeredIntegratedAnalysis => {
    const now = new Date();
    const analysisData = originalData.data?.integratedAnalysis || {};
    const analysisInfo = originalData.data?.analysisInfo || {};
    
    // 計算數據完整度
    const completeness = calculateDataCompleteness(originalData);
    
    return {
      metadata: {
        analysisId: `analysis_${now.getTime()}`,
        timestamp: now,
        dataCompleteness: completeness,
        availableLevels: getAvailableLevelsForCompleteness(completeness)
      },
      layers: {
        summary: {
          coreTraits: createLayeredContent(
            extractCoreTraits(analysisData),
            ReadingLevel.SUMMARY,
            '核心特質'
          ),
          currentFortune: createLayeredContent(
            extractCurrentFortune(analysisData),
            ReadingLevel.SUMMARY,
            '近期運勢'
          )
        },
        compact: {
          personalityHighlights: createLayeredContent(
            extractPersonalityHighlights(analysisData),
            ReadingLevel.COMPACT,
            '性格亮點'
          ),
          fortuneTrends: createLayeredContent(
            extractFortuneTrends(analysisData),
            ReadingLevel.COMPACT,
            '運勢趨勢'
          ),
          quickAdvice: createLayeredContent(
            extractQuickAdvice(analysisData),
            ReadingLevel.COMPACT,
            '快速建議'
          )
        },
        standard: {
          personalityAnalysis: createLayeredContent(
            analysisData.consensusFindings || [],
            ReadingLevel.STANDARD,
            '性格分析'
          ),
          lifeStages: createLayeredContent(
            extractLifeStages(analysisData),
            ReadingLevel.STANDARD,
            '人生階段'
          ),
          relationships: createLayeredContent(
            extractRelationships(analysisData),
            ReadingLevel.STANDARD,
            '人際關係'
          ),
          careerGuidance: createLayeredContent(
            extractCareerGuidance(analysisData),
            ReadingLevel.STANDARD,
            '事業指導'
          ),
          healthWellness: createLayeredContent(
            extractHealthWellness(analysisData),
            ReadingLevel.STANDARD,
            '健康養生'
          ),
          recommendations: createLayeredContent(
            analysisData.recommendations || [],
            ReadingLevel.STANDARD,
            '綜合建議'
          )
        },
        deep: {
          elementalAnalysis: createLayeredContent(
            extractElementalAnalysis(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '五行深度分析'
          ),
          cosmicInfluences: createLayeredContent(
            extractCosmicInfluences(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '星曜影響'
          ),
          transformationCycles: createLayeredContent(
            extractTransformationCycles(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '四化週期'
          ),
          detailedForecasts: createLayeredContent(
            extractDetailedForecasts(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '詳細預測'
          ),
          spiritualGuidance: createLayeredContent(
            extractSpiritualGuidance(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '心靈指導'
          ),
          actionPlans: createLayeredContent(
            extractActionPlans(analysisData),
            ReadingLevel.DEEP_ANALYSIS,
            '行動計劃'
          )
        }
      }
    };
  };

  // 輔助函數
  const createLayeredContent = (items: string[], level: ReadingLevel, title: string): LayeredContent => ({
    level,
    visible: true,
    priority: Object.values(ReadingLevel).indexOf(level),
    content: {
      title,
      items: Array.isArray(items) ? items : [items].filter(Boolean),
      details: {}
    }
  });

  const calculateDataCompleteness = (data: any): number => {
    let score = 0;
    const checks = [
      data?.data?.integratedAnalysis?.consensusFindings?.length > 0,
      data?.data?.integratedAnalysis?.recommendations?.length > 0,
      data?.data?.integratedAnalysis?.divergentFindings?.length > 0,
      data?.data?.analysisInfo?.confidence > 0.5,
      data?.data?.analysisInfo?.methodsUsed?.length > 0
    ];
    
    score = (checks.filter(Boolean).length / checks.length) * 100;
    return Math.round(score);
  };

  const getAvailableLevelsForCompleteness = (completeness: number): ReadingLevel[] => {
    return Object.values(ReadingLevel).filter(level => 
      completeness >= READING_LEVEL_CONFIGS[level].minDataRequirement
    );
  };

  // 數據提取函數
  const extractCoreTraits = (data: any): string[] => {
    const traits = data?.consensusFindings?.slice(0, 3) || [];
    return traits.length > 0 ? traits : ['穩重務實', '思維敏捷', '待人和善'];
  };

  const extractCurrentFortune = (data: any): string[] => {
    return ['整體運勢平穩向上，適合穩紮穩打'];
  };

  const extractPersonalityHighlights = (data: any): string[] => {
    return data?.consensusFindings?.slice(0, 5) || [
      '個性溫和，易與人相處',
      '做事謹慎，注重細節',
      '思考周密，決策理性',
      '責任心強，值得信賴',
      '學習能力佳，適應性強'
    ];
  };

  const extractFortuneTrends = (data: any): string[] => {
    return [
      '近期運勢：穩中有升，宜把握機會',
      '中期展望：事業發展順遂，財運漸佳',
      '長遠趨勢：人生漸入佳境，前景光明'
    ];
  };

  const extractQuickAdvice = (data: any): string[] => {
    return data?.recommendations?.slice(0, 3) || [
      '保持積極心態，多與正能量的人接觸',
      '注重健康養生，規律作息很重要',
      '學習新技能，提升自我競爭力'
    ];
  };

  const extractLifeStages = (data: any): string[] => {
    return [
      '青年期：奠定基礎，累積實力',
      '中年期：事業高峰，責任重大',
      '熟年期：收穫豐盛，智慧圓融'
    ];
  };

  const extractRelationships = (data: any): string[] => {
    return [
      '家庭關係和睦，親情深厚',
      '朋友圈廣泛，貴人運佳',
      '感情生活穩定，伴侶支持'
    ];
  };

  const extractCareerGuidance = (data: any): string[] => {
    return [
      '適合穩定發展的行業',
      '重視團隊合作與人際關係',
      '可考慮管理或顧問類職位'
    ];
  };

  const extractHealthWellness = (data: any): string[] => {
    return [
      '注意腸胃保養，飲食清淡',
      '多運動強身，增強體質',
      '保持心情愉快，避免過度焦慮'
    ];
  };

  const extractElementalAnalysis = (data: any): string[] => {
    return [
      '五行中土元素較旺，性格穩重',
      '金元素適中，理性務實',
      '水元素偏弱，需增強靈活性'
    ];
  };

  const extractCosmicInfluences = (data: any): string[] => {
    return [
      '命宮主星影響性格基調',
      '財帛宮配置影響財運走向',
      '遷移宮顯示外出發展機會'
    ];
  };

  const extractTransformationCycles = (data: any): string[] => {
    return [
      '當前大運利於事業發展',
      '流年四化帶來新機遇',
      '十年一輪，把握轉運時機'
    ];
  };

  const extractDetailedForecasts = (data: any): string[] => {
    return [
      '未來三個月事業運勢上升',
      '半年內財運有所改善',
      '一年後可能有重要轉變'
    ];
  };

  const extractSpiritualGuidance = (data: any): string[] => {
    return [
      '保持內心平靜，多行善事',
      '培養感恩的心，珍惜當下',
      '持續學習成長，完善自我'
    ];
  };

  const extractActionPlans = (data: any): string[] => {
    return [
      '制定明確的短期和長期目標',
      '建立良好的人際關係網絡',
      '持續投資自我教育和技能提升'
    ];
  };

  return {
    adaptIntegratedAnalysis,
    calculateDataCompleteness,
    getAvailableLevelsForCompleteness
  };
}

// 直接導出適配器函數供外部使用
export const adaptIntegratedAnalysisToLayered = (originalData: any): LayeredIntegratedAnalysis => {
  const { adaptIntegratedAnalysis } = useDataAdapter();
  return adaptIntegratedAnalysis(originalData);
};