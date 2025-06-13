/**
 * 分層閱覽系統類型定義
 * 支持命運洞悉功能的多層級展示
 */
// 閱覽層級枚舉
export var ReadingLevel;
(function (ReadingLevel) {
    ReadingLevel["SUMMARY"] = "summary";
    ReadingLevel["COMPACT"] = "compact";
    ReadingLevel["STANDARD"] = "standard";
    ReadingLevel["DEEP_ANALYSIS"] = "deep"; // 深度分析
})(ReadingLevel || (ReadingLevel = {}));
// 分層閱覽配置
export const READING_LEVEL_CONFIGS = {
    [ReadingLevel.SUMMARY]: {
        level: ReadingLevel.SUMMARY,
        label: '簡要預覽',
        description: '快速了解核心特質，1分鐘速覽',
        icon: '👁️',
        minDataRequirement: 30,
        estimatedReadTime: '1分鐘'
    },
    [ReadingLevel.COMPACT]: {
        level: ReadingLevel.COMPACT,
        label: '精簡檢視',
        description: '重點特質與運勢要點，3分鐘掌握',
        icon: '📝',
        minDataRequirement: 50,
        estimatedReadTime: '3分鐘'
    },
    [ReadingLevel.STANDARD]: {
        level: ReadingLevel.STANDARD,
        label: '標準解讀',
        description: '完整人生解讀與建議，10分鐘深度了解',
        icon: '📊',
        minDataRequirement: 70,
        estimatedReadTime: '10分鐘'
    },
    [ReadingLevel.DEEP_ANALYSIS]: {
        level: ReadingLevel.DEEP_ANALYSIS,
        label: '深度分析',
        description: '全方位詳盡分析，20分鐘完整解讀',
        icon: '🔍',
        minDataRequirement: 85,
        estimatedReadTime: '20分鐘'
    }
};
export const DEFAULT_TRANSITION_CONFIG = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 50
};
// 響應式斷點配置
export var ResponsiveBreakpoint;
(function (ResponsiveBreakpoint) {
    ResponsiveBreakpoint["MOBILE"] = "mobile";
    ResponsiveBreakpoint["TABLET"] = "tablet";
    ResponsiveBreakpoint["DESKTOP"] = "desktop"; // > 1024px
})(ResponsiveBreakpoint || (ResponsiveBreakpoint = {}));
export const RESPONSIVE_CONFIGS = {
    [ResponsiveBreakpoint.MOBILE]: {
        breakpoint: ResponsiveBreakpoint.MOBILE,
        defaultLevel: ReadingLevel.SUMMARY,
        maxVisibleItems: {
            [ReadingLevel.SUMMARY]: 3,
            [ReadingLevel.COMPACT]: 5,
            [ReadingLevel.STANDARD]: 8,
            [ReadingLevel.DEEP_ANALYSIS]: 10
        },
        layoutType: 'accordion'
    },
    [ResponsiveBreakpoint.TABLET]: {
        breakpoint: ResponsiveBreakpoint.TABLET,
        defaultLevel: ReadingLevel.COMPACT,
        maxVisibleItems: {
            [ReadingLevel.SUMMARY]: 5,
            [ReadingLevel.COMPACT]: 8,
            [ReadingLevel.STANDARD]: 12,
            [ReadingLevel.DEEP_ANALYSIS]: 15
        },
        layoutType: 'grid'
    },
    [ResponsiveBreakpoint.DESKTOP]: {
        breakpoint: ResponsiveBreakpoint.DESKTOP,
        defaultLevel: ReadingLevel.STANDARD,
        maxVisibleItems: {
            [ReadingLevel.SUMMARY]: 6,
            [ReadingLevel.COMPACT]: 10,
            [ReadingLevel.STANDARD]: 15,
            [ReadingLevel.DEEP_ANALYSIS]: 20
        },
        layoutType: 'grid'
    }
};
// 導出預設配置
export const DEFAULT_USER_PREFERENCES = {
    preferredLevel: ReadingLevel.STANDARD,
    autoUpgrade: true,
    animationsEnabled: true,
    compactMode: false,
    customizations: {
        hiddenSections: [],
        pinnedSections: [],
        sectionOrder: []
    }
};
//# sourceMappingURL=layeredReading.js.map