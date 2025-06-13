import { ref, computed, watch, onMounted } from 'vue';
import { User, TrendCharts, Lightning, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
const props = withDefaults(defineProps(), {
    canUpgrade: true,
    canDowngrade: true,
    isMobile: false,
    isTablet: false,
    timestamp: () => new Date()
});
const emit = defineEmits();
// 響應式狀態
const activeTab = ref('personality');
const completedActions = ref([]);
const readingProgress = ref(0);
// 計算屬性
const personalityDimensions = computed(() => [
    { name: '外向性', score: 75 },
    { name: '穩定性', score: 85 },
    { name: '責任感', score: 90 },
    { name: '親和力', score: 80 },
    { name: '創新性', score: 70 }
]);
const adviceCategories = computed(() => [
    {
        title: '人際關係',
        icon: '👥',
        priority: 'warning',
        label: '重要',
        items: props.quickAdvice.filter((_, i) => i % 3 === 0)
    },
    {
        title: '事業發展',
        icon: '💼',
        priority: 'success',
        label: '機會',
        items: props.quickAdvice.filter((_, i) => i % 3 === 1)
    },
    {
        title: '健康養生',
        icon: '🏃‍♂️',
        priority: 'info',
        label: '提醒',
        items: props.quickAdvice.filter((_, i) => i % 3 === 2)
    }
]);
const keyDates = computed(() => [
    { time: '本週三', event: '重要決策最佳時機', type: 'success', importance: '佳時' },
    { time: '下週一', event: '避免重大變動', type: 'warning', importance: '注意' },
    { time: '月底', event: '財運轉機期', type: 'success', importance: '機會' }
]);
const weeklyActions = computed(() => [
    '與重要人士深入溝通',
    '制定下月工作計劃',
    '安排健康檢查',
    '整理重要文件',
    '學習新技能或知識'
]);
// 方法
const selectHighlight = (highlight, index) => {
    emit('highlightSelected', highlight, index);
};
const selectAdvice = (advice, categoryIndex, adviceIndex) => {
    emit('adviceSelected', advice, categoryIndex, adviceIndex);
};
const getHighlightType = (index) => {
    const types = ['primary', 'success', 'warning', 'info'];
    return types[index % types.length];
};
const getPersonalityIcon = (index) => {
    const icons = ['🌟', '💎', '🎯', '🔥', '⚡', '💫', '🚀', '💡'];
    return icons[index % icons.length];
};
const getTraitScore = (index) => {
    return Math.max(3, 5 - (index % 3));
};
const extractTitle = (highlight) => {
    return highlight.substring(0, Math.min(8, highlight.length));
};
const extractDescription = (highlight) => {
    return highlight.length > 8 ? highlight.substring(8) : highlight;
};
const getTrendPeriod = (index) => {
    const periods = ['近期運勢', '中期展望', '長遠趨勢'];
    return periods[index] || '未來發展';
};
const getTrendClass = (index) => {
    const classes = ['trend-good', 'trend-normal', 'trend-excellent'];
    return classes[index % classes.length];
};
const getTrendTagType = (index) => {
    const types = ['success', 'info', 'warning'];
    return types[index % types.length];
};
const getTrendStatus = (index) => {
    const statuses = ['上升', '平穩', '優秀'];
    return statuses[index % statuses.length];
};
const getTrendScore = (index) => {
    const scores = [75, 60, 85];
    return scores[index % scores.length];
};
const getTrendProgressStatus = (index) => {
    const scores = getTrendScore(index);
    if (scores >= 80)
        return 'success';
    if (scores >= 60)
        return 'warning';
    return 'exception';
};
const getBarClass = (score) => {
    if (score >= 80)
        return 'bar-excellent';
    if (score >= 60)
        return 'bar-good';
    return 'bar-normal';
};
const getAdvicePriority = (categoryIndex, adviceIndex) => {
    const priorities = ['priority-high', 'priority-medium', 'priority-low'];
    return priorities[(categoryIndex + adviceIndex) % priorities.length];
};
const getAdviceLevel = (categoryIndex, adviceIndex) => {
    const levels = ['高', '中', '低'];
    return levels[(categoryIndex + adviceIndex) % levels.length];
};
const getActionDate = (index) => {
    const dates = ['今天', '明天', '週三', '週四', '週五'];
    return dates[index % dates.length];
};
const updateReadingProgress = () => {
    const tabProgresses = {
        personality: 33,
        fortune: 66,
        advice: 100
    };
    readingProgress.value = tabProgresses[activeTab.value] || 0;
};
// 監聽器
watch(activeTab, (newTab) => {
    emit('tabChanged', newTab);
    updateReadingProgress();
});
watch(() => completedActions.value.length, (newLength) => {
    // 根據完成的行動數量調整進度
    if (activeTab.value === 'advice') {
        const baseProgress = 80;
        const actionProgress = (newLength / weeklyActions.value.length) * 20;
        readingProgress.value = Math.min(100, baseProgress + actionProgress);
    }
});
// 生命週期
onMounted(() => {
    updateReadingProgress();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    canUpgrade: true,
    canDowngrade: true,
    isMobile: false,
    isTablet: false,
    timestamp: () => new Date()
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-info']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['highlights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['personality-radar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['marker-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['marker-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['marker-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['action-checklist']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['highlights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-score']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "compact-reading-view" },
    ...{ class: ({ 'mobile': __VLS_ctx.isMobile, 'tablet': __VLS_ctx.isTablet }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "reading-nav" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "level-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-tabs" },
});
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    type: "card",
    ...{ class: "reading-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    type: "card",
    ...{ class: "reading-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "性格亮點",
    name: "personality",
}));
const __VLS_6 = __VLS_5({
    label: "性格亮點",
    name: "personality",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_7.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-label" },
    });
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.User;
    /** @type {[typeof __VLS_components.User, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_7;
const __VLS_16 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "運勢趨勢",
    name: "fortune",
}));
const __VLS_18 = __VLS_17({
    label: "運勢趨勢",
    name: "fortune",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_19.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-label" },
    });
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.TrendCharts;
    /** @type {[typeof __VLS_components.TrendCharts, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_23;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_19;
const __VLS_28 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "快速建議",
    name: "advice",
}));
const __VLS_30 = __VLS_29({
    label: "快速建議",
    name: "advice",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { label: __VLS_thisSlot } = __VLS_31.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tab-label" },
    });
    const __VLS_32 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.Lightning;
    /** @type {[typeof __VLS_components.Lightning, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_31;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "personality-section" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'personality') }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_40 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    type: "info",
    size: "small",
}));
const __VLS_42 = __VLS_41({
    type: "info",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
(__VLS_ctx.personalityHighlights.length);
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlights-grid" },
});
for (const [highlight, index] of __VLS_getVForSourceType((__VLS_ctx.personalityHighlights))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectHighlight(highlight, index);
            } },
        key: (index),
        ...{ class: "highlight-card" },
        ...{ class: (__VLS_ctx.getHighlightType(index)) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-icon" },
    });
    (__VLS_ctx.getPersonalityIcon(index));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
        ...{ class: "highlight-title" },
    });
    (__VLS_ctx.extractTitle(highlight));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "highlight-desc" },
    });
    (__VLS_ctx.extractDescription(highlight));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-score" },
    });
    const __VLS_44 = {}.ElRate;
    /** @type {[typeof __VLS_components.ElRate, typeof __VLS_components.elRate, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        modelValue: (__VLS_ctx.getTraitScore(index)),
        max: (5),
        disabled: true,
        size: "small",
        showText: (false),
    }));
    const __VLS_46 = __VLS_45({
        modelValue: (__VLS_ctx.getTraitScore(index)),
        max: (5),
        disabled: true,
        size: "small",
        showText: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
if (!__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "personality-radar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "radar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "radar-chart" },
    });
    for (const [dimension, index] of __VLS_getVForSourceType((__VLS_ctx.personalityDimensions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "radar-item" },
            key: (index),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "dimension-label" },
        });
        (dimension.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dimension-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill" },
            ...{ style: ({ width: `${dimension.score}%` }) },
            ...{ class: (__VLS_ctx.getBarClass(dimension.score)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "dimension-score" },
        });
        (dimension.score);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-section" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'fortune') }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_48 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    type: "success",
    size: "small",
}));
const __VLS_50 = __VLS_49({
    type: "success",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trends-timeline" },
});
for (const [trend, index] of __VLS_getVForSourceType((__VLS_ctx.fortuneTrends))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "timeline-item" },
        ...{ class: ({ 'active': index === 0 }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-marker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "marker-dot" },
        ...{ class: (__VLS_ctx.getTrendClass(index)) },
    });
    if (index < __VLS_ctx.fortuneTrends.length - 1) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "marker-line" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
        ...{ class: "timeline-title" },
    });
    (__VLS_ctx.getTrendPeriod(index));
    const __VLS_52 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        type: (__VLS_ctx.getTrendTagType(index)),
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        type: (__VLS_ctx.getTrendTagType(index)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (__VLS_ctx.getTrendStatus(index));
    var __VLS_55;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "timeline-desc" },
    });
    (trend);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-score" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "score-label" },
    });
    const __VLS_56 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        percentage: (__VLS_ctx.getTrendScore(index)),
        status: (__VLS_ctx.getTrendProgressStatus(index)),
        showText: (false),
        strokeWidth: (6),
    }));
    const __VLS_58 = __VLS_57({
        percentage: (__VLS_ctx.getTrendScore(index)),
        status: (__VLS_ctx.getTrendProgressStatus(index)),
        showText: (false),
        strokeWidth: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "score-value" },
    });
    (__VLS_ctx.getTrendScore(index));
}
if (__VLS_ctx.keyDates.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "key-dates" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dates-list" },
    });
    for (const [date, index] of __VLS_getVForSourceType((__VLS_ctx.keyDates))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "date-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "date-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "date-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "date-time" },
        });
        (date.time);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "date-event" },
        });
        (date.event);
        const __VLS_60 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            type: (date.type),
            size: "small",
        }));
        const __VLS_62 = __VLS_61({
            type: (date.type),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        (date.importance);
        var __VLS_63;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "advice-section" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTab === 'advice') }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
const __VLS_64 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    type: "warning",
    size: "small",
}));
const __VLS_66 = __VLS_65({
    type: "warning",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
(__VLS_ctx.quickAdvice.length);
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "advice-categories" },
});
for (const [category, index] of __VLS_getVForSourceType((__VLS_ctx.adviceCategories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "category-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "category-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "category-icon" },
    });
    (category.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
        ...{ class: "category-title" },
    });
    (category.title);
    const __VLS_68 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        type: (category.priority),
        size: "small",
    }));
    const __VLS_70 = __VLS_69({
        type: (category.priority),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    (category.label);
    var __VLS_71;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-list" },
    });
    for (const [advice, adviceIndex] of __VLS_getVForSourceType((category.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.selectAdvice(advice, index, adviceIndex);
                } },
            key: (adviceIndex),
            ...{ class: "advice-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-priority" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "priority-badge" },
            ...{ class: (__VLS_ctx.getAdvicePriority(index, adviceIndex)) },
        });
        (__VLS_ctx.getAdviceLevel(index, adviceIndex));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "advice-text" },
        });
        (advice);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-action" },
        });
        const __VLS_72 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            size: "small",
            type: "primary",
            text: true,
        }));
        const __VLS_74 = __VLS_73({
            size: "small",
            type: "primary",
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        var __VLS_75;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-checklist" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checklist-items" },
});
const __VLS_76 = {}.ElCheckboxGroup;
/** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.completedActions),
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.completedActions),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
for (const [action, index] of __VLS_getVForSourceType((__VLS_ctx.weeklyActions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "checklist-item" },
    });
    const __VLS_80 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        label: (index),
        ...{ class: "action-checkbox" },
    }));
    const __VLS_82 = __VLS_81({
        label: (index),
        ...{ class: "action-checkbox" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    (action);
    var __VLS_83;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-date" },
    });
    (__VLS_ctx.getActionDate(index));
}
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bottom-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "progress-text" },
});
const __VLS_84 = {}.ElProgress;
/** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    percentage: (__VLS_ctx.readingProgress),
    showText: (false),
    strokeWidth: (4),
}));
const __VLS_86 = __VLS_85({
    percentage: (__VLS_ctx.readingProgress),
    showText: (false),
    strokeWidth: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "progress-value" },
});
(__VLS_ctx.readingProgress);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
if (__VLS_ctx.canDowngrade) {
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowLeft),
        size: "small",
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowLeft),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canDowngrade))
                return;
            __VLS_ctx.$emit('downgrade-requested');
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
}
if (__VLS_ctx.canUpgrade) {
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.ArrowRight),
        size: "small",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        type: "primary",
        icon: (__VLS_ctx.ArrowRight),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canUpgrade))
                return;
            __VLS_ctx.$emit('upgrade-requested');
        }
    };
    __VLS_99.slots.default;
    var __VLS_99;
}
/** @type {__VLS_StyleScopedClasses['compact-reading-view']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['tablet']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-header']} */ ;
/** @type {__VLS_StyleScopedClasses['level-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-info']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['reading-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-label']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-label']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-label']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['personality-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['highlights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['card-score']} */ ;
/** @type {__VLS_StyleScopedClasses['personality-radar']} */ ;
/** @type {__VLS_StyleScopedClasses['radar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['radar-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['radar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-label']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-score']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trends-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-marker']} */ ;
/** @type {__VLS_StyleScopedClasses['marker-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['marker-line']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-title']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-score']} */ ;
/** @type {__VLS_StyleScopedClasses['score-label']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['key-dates']} */ ;
/** @type {__VLS_StyleScopedClasses['dates-list']} */ ;
/** @type {__VLS_StyleScopedClasses['date-item']} */ ;
/** @type {__VLS_StyleScopedClasses['date-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['date-content']} */ ;
/** @type {__VLS_StyleScopedClasses['date-time']} */ ;
/** @type {__VLS_StyleScopedClasses['date-event']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-categories']} */ ;
/** @type {__VLS_StyleScopedClasses['category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['category-header']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-title']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-list']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-content']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-text']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-action']} */ ;
/** @type {__VLS_StyleScopedClasses['action-checklist']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-items']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['action-date']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-value']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            User: User,
            TrendCharts: TrendCharts,
            Lightning: Lightning,
            ArrowLeft: ArrowLeft,
            ArrowRight: ArrowRight,
            activeTab: activeTab,
            completedActions: completedActions,
            readingProgress: readingProgress,
            personalityDimensions: personalityDimensions,
            adviceCategories: adviceCategories,
            keyDates: keyDates,
            weeklyActions: weeklyActions,
            selectHighlight: selectHighlight,
            selectAdvice: selectAdvice,
            getHighlightType: getHighlightType,
            getPersonalityIcon: getPersonalityIcon,
            getTraitScore: getTraitScore,
            extractTitle: extractTitle,
            extractDescription: extractDescription,
            getTrendPeriod: getTrendPeriod,
            getTrendClass: getTrendClass,
            getTrendTagType: getTrendTagType,
            getTrendStatus: getTrendStatus,
            getTrendScore: getTrendScore,
            getTrendProgressStatus: getTrendProgressStatus,
            getBarClass: getBarClass,
            getAdvicePriority: getAdvicePriority,
            getAdviceLevel: getAdviceLevel,
            getActionDate: getActionDate,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=CompactReadingView.vue.js.map