/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch } from 'vue';
import { Star, TrendCharts, Lightning, ArrowRight, ArrowUp, ArrowDown, InfoFilled, TopRight, Top, Bottom } from '@element-plus/icons-vue';
const props = withDefaults(defineProps(), {
    quickActions: () => [],
    canUpgrade: true,
    isMobile: false,
    isCompact: false,
    timestamp: () => new Date()
});
const emit = defineEmits();
// 響應式狀態
const expanded = ref(false);
const fortuneScore = ref(4); // 模擬運勢評分
// 計算屬性
const maxDisplayedTraits = computed(() => {
    if (props.isMobile)
        return 2;
    if (props.isCompact)
        return 3;
    return expanded.value ? props.coreTraits.length : 4;
});
const displayedCoreTraits = computed(() => {
    return props.coreTraits.slice(0, maxDisplayedTraits.value);
});
const formattedTimestamp = computed(() => {
    return props.timestamp.toLocaleString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});
// 方法
const toggleExpanded = () => {
    expanded.value = !expanded.value;
};
const getCompletenessType = (completeness) => {
    if (completeness >= 80)
        return 'success';
    if (completeness >= 60)
        return 'warning';
    return 'info';
};
const getTraitIcon = (index) => {
    const icons = ['🌟', '✨', '💫', '⭐', '🔥', '💎'];
    return icons[index] || '⚡';
};
const getActionIcon = (index) => {
    const icons = ['🎯', '💡', '🚀'];
    return icons[index] || '📌';
};
const getTrendClass = () => {
    const score = fortuneScore.value;
    if (score >= 4)
        return 'trend-up';
    if (score >= 3)
        return 'trend-stable';
    return 'trend-down';
};
const getTrendIcon = () => {
    const score = fortuneScore.value;
    if (score >= 4)
        return TopRight;
    if (score >= 3)
        return Top;
    return Bottom;
};
const getTrendText = () => {
    const score = fortuneScore.value;
    if (score >= 4)
        return '上升趨勢';
    if (score >= 3)
        return '平穩發展';
    return '需要注意';
};
// 監聽數據變化，自動調整展示
watch(() => props.coreTraits.length, (newLength) => {
    if (newLength <= maxDisplayedTraits.value) {
        expanded.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    quickActions: () => [],
    canUpgrade: true,
    isMobile: false,
    isCompact: false,
    timestamp: () => new Date()
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-reading-view']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-reading-view']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions-card']} */ ;
/** @type {__VLS_StyleScopedClasses['level-info']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['traits-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-main']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-content']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-text']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-text']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['level-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['level-info']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-text']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-text']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions-card']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upgrade-prompt']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-reading-view" },
    ...{ class: ({ 'mobile': __VLS_ctx.isMobile, 'compact': __VLS_ctx.isCompact }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "level-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "level-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "level-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completeness-badge" },
});
const __VLS_0 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    type: (__VLS_ctx.getCompletenessType(__VLS_ctx.dataCompleteness)),
    size: "small",
}));
const __VLS_2 = __VLS_1({
    type: (__VLS_ctx.getCompletenessType(__VLS_ctx.dataCompleteness)),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.dataCompleteness);
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "core-traits-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
const __VLS_4 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.Star;
/** @type {[typeof __VLS_components.Star, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "traits-grid" },
});
for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.displayedCoreTraits))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "trait-item" },
        ...{ class: ({ 'primary': index === 0, 'secondary': index > 0 }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "trait-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "trait-icon" },
    });
    (__VLS_ctx.getTraitIcon(index));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "trait-text" },
    });
    (trait);
}
if (__VLS_ctx.coreTraits.length > __VLS_ctx.maxDisplayedTraits) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.toggleExpanded) },
        ...{ class: "expand-button" },
    });
    const __VLS_12 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        icon: (__VLS_ctx.expanded ? __VLS_ctx.ArrowUp : __VLS_ctx.ArrowDown),
        size: "small",
        type: "primary",
        text: true,
    }));
    const __VLS_14 = __VLS_13({
        icon: (__VLS_ctx.expanded ? __VLS_ctx.ArrowUp : __VLS_ctx.ArrowDown),
        size: "small",
        type: "primary",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.expanded ? '收起' : `還有 ${__VLS_ctx.coreTraits.length - __VLS_ctx.maxDisplayedTraits} 項`);
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
const __VLS_16 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.TrendCharts;
/** @type {[typeof __VLS_components.TrendCharts, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-text" },
});
(__VLS_ctx.currentFortune);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fortune-score" },
});
const __VLS_24 = {}.ElRate;
/** @type {[typeof __VLS_components.ElRate, typeof __VLS_components.elRate, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.fortuneScore),
    max: (5),
    disabled: true,
    showScore: true,
    scoreTemplate: "運勢指數",
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.fortuneScore),
    max: (5),
    disabled: true,
    showScore: true,
    scoreTemplate: "運勢指數",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trend-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trend-arrow" },
    ...{ class: (__VLS_ctx.getTrendClass()) },
});
const __VLS_28 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    size: (20),
}));
const __VLS_30 = __VLS_29({
    size: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = ((__VLS_ctx.getTrendIcon()));
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "trend-text" },
});
(__VLS_ctx.getTrendText());
if (__VLS_ctx.quickActions.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-actions-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "section-title" },
    });
    const __VLS_36 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.Lightning;
    /** @type {[typeof __VLS_components.Lightning, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-list" },
    });
    for (const [action, index] of __VLS_getVForSourceType((__VLS_ctx.quickActions.slice(0, 3)))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "action-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-icon" },
        });
        (__VLS_ctx.getActionIcon(index));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "action-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "action-text" },
        });
        (action);
    }
}
if (__VLS_ctx.canUpgrade) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upgrade-prompt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prompt-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prompt-icon" },
    });
    const __VLS_44 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        size: (24),
        color: "#409EFF",
    }));
    const __VLS_46 = __VLS_45({
        size: (24),
        color: "#409EFF",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    const __VLS_48 = {}.ArrowRight;
    /** @type {[typeof __VLS_components.ArrowRight, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_47;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prompt-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prompt-actions" },
    });
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canUpgrade))
                return;
            __VLS_ctx.$emit('upgradeRequested');
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-source" },
});
const __VLS_60 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.InfoFilled;
/** @type {[typeof __VLS_components.InfoFilled, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "timestamp" },
});
(__VLS_ctx.formattedTimestamp);
/** @type {__VLS_StyleScopedClasses['summary-reading-view']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['level-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['level-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['level-info']} */ ;
/** @type {__VLS_StyleScopedClasses['completeness-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['core-traits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['traits-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-content']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-text']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-content']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-main']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-text']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-score']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-text']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-list']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-content']} */ ;
/** @type {__VLS_StyleScopedClasses['action-text']} */ ;
/** @type {__VLS_StyleScopedClasses['upgrade-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-content']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-text']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['data-source']} */ ;
/** @type {__VLS_StyleScopedClasses['timestamp']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Star: Star,
            TrendCharts: TrendCharts,
            Lightning: Lightning,
            ArrowRight: ArrowRight,
            ArrowUp: ArrowUp,
            ArrowDown: ArrowDown,
            InfoFilled: InfoFilled,
            expanded: expanded,
            fortuneScore: fortuneScore,
            maxDisplayedTraits: maxDisplayedTraits,
            displayedCoreTraits: displayedCoreTraits,
            formattedTimestamp: formattedTimestamp,
            toggleExpanded: toggleExpanded,
            getCompletenessType: getCompletenessType,
            getTraitIcon: getTraitIcon,
            getActionIcon: getActionIcon,
            getTrendClass: getTrendClass,
            getTrendIcon: getTrendIcon,
            getTrendText: getTrendText,
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
//# sourceMappingURL=SummaryReadingView.vue.js.map