/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref, watch } from 'vue';
import { ElProgress, ElButton, ElButtonGroup, ElSelect, ElOption, ElTooltip } from 'element-plus';
import { ArrowLeft, ArrowRight, MagicStick } from '@element-plus/icons-vue';
import { ReadingLevel } from '@/types/layeredReading';
// 層級配置
const READING_LEVEL_CONFIGS = {
    [ReadingLevel.SUMMARY]: {
        icon: '📋',
        label: '簡要預覽',
        description: '快速瀏覽核心要點',
        estimatedReadTime: '2-3分鐘',
        minDataRequirement: 30
    },
    [ReadingLevel.COMPACT]: {
        icon: '📊',
        label: '精簡檢視',
        description: '重點資訊精煉呈現',
        estimatedReadTime: '5-8分鐘',
        minDataRequirement: 50
    },
    [ReadingLevel.STANDARD]: {
        icon: '📖',
        label: '標準解讀',
        description: '全面分析與深入解釋',
        estimatedReadTime: '10-15分鐘',
        minDataRequirement: 70
    },
    [ReadingLevel.DEEP_ANALYSIS]: {
        icon: '🔬',
        label: '深度分析',
        description: '詳盡解析與專業洞察',
        estimatedReadTime: '20-30分鐘',
        minDataRequirement: 85
    }
};
const props = defineProps({
    moduleType: {
        type: String,
        required: true
    },
    layeredData: {
        type: Object,
        default: null
    },
    dataCompleteness: {
        type: Number,
        default: 0
    },
    enableSync: {
        type: Boolean,
        default: false
    },
    isMobile: {
        type: Boolean,
        default: false
    },
    isCompact: {
        type: Boolean,
        default: false
    },
    showToolbar: {
        type: Boolean,
        default: false
    },
    ignoreDataCompleteness: {
        type: Boolean,
        default: false
    },
    showDataStatus: {
        type: Boolean,
        default: false
    },
    modelValue: {
        type: String,
        default: 'standard'
    }
});
const emit = defineEmits();
// 狀態管理
const isTransitioning = ref(false);
const currentLevel = ref(ReadingLevel.STANDARD);
// 映射 DisplayMode 到 ReadingLevel
const displayModeToLevel = {
    'minimal': ReadingLevel.SUMMARY,
    'compact': ReadingLevel.COMPACT,
    'standard': ReadingLevel.STANDARD,
    'comprehensive': ReadingLevel.DEEP_ANALYSIS
};
const levelToDisplayMode = {
    [ReadingLevel.SUMMARY]: 'minimal',
    [ReadingLevel.COMPACT]: 'compact',
    [ReadingLevel.STANDARD]: 'standard',
    [ReadingLevel.DEEP_ANALYSIS]: 'comprehensive'
};
// 初始化當前層級
watch(() => props.modelValue, (newValue) => {
    if (newValue && displayModeToLevel[newValue]) {
        const newLevel = displayModeToLevel[newValue];
        console.log(`UnifiedLayeredController: modelValue=${newValue} → level=${newLevel}`);
        currentLevel.value = newLevel;
    }
}, { immediate: true });
// 可用層級計算
const availableLevels = computed(() => {
    const allLevels = [
        ReadingLevel.SUMMARY,
        ReadingLevel.COMPACT,
        ReadingLevel.STANDARD,
        ReadingLevel.DEEP_ANALYSIS
    ];
    if (props.ignoreDataCompleteness) {
        return allLevels;
    }
    const completeness = props.dataCompleteness;
    const levels = allLevels.filter(level => {
        const config = READING_LEVEL_CONFIGS[level];
        return config && completeness >= config.minDataRequirement;
    });
    return levels.length > 0 ? levels : [ReadingLevel.SUMMARY];
});
// 當前層級配置
const currentLevelConfig = computed(() => {
    return READING_LEVEL_CONFIGS[currentLevel.value];
});
// 層級切換能力
const canUpgrade = computed(() => {
    const currentIndex = availableLevels.value.indexOf(currentLevel.value);
    return currentIndex < availableLevels.value.length - 1;
});
const canDowngrade = computed(() => {
    const currentIndex = availableLevels.value.indexOf(currentLevel.value);
    return currentIndex > 0;
});
// 資料完整度狀態
const getCompletenessStatus = (percentage) => {
    if (percentage >= 80)
        return 'success';
    if (percentage >= 60)
        return 'warning';
    return 'exception';
};
// 層級切換方法
const switchToLevel = async (level) => {
    if (level === currentLevel.value || isTransitioning.value)
        return;
    console.log(`UnifiedLayeredController: switchToLevel ${currentLevel.value} → ${level}`);
    isTransitioning.value = true;
    try {
        currentLevel.value = level;
        const displayMode = levelToDisplayMode[level];
        console.log(`UnifiedLayeredController: 發送事件 level-changed=${level}, update:modelValue=${displayMode}`);
        emit('level-changed', level);
        emit('update:modelValue', displayMode);
    }
    finally {
        setTimeout(() => {
            isTransitioning.value = false;
        }, 300);
    }
};
const handleLevelChange = (level) => {
    switchToLevel(level);
};
const upgradeLevel = () => {
    if (canUpgrade.value) {
        const currentIndex = availableLevels.value.indexOf(currentLevel.value);
        const nextLevel = availableLevels.value[currentIndex + 1];
        switchToLevel(nextLevel);
        emit('upgrade-requested');
    }
};
const downgradeLevel = () => {
    if (canDowngrade.value) {
        const currentIndex = availableLevels.value.indexOf(currentLevel.value);
        const prevLevel = availableLevels.value[currentIndex - 1];
        switchToLevel(prevLevel);
        emit('downgrade-requested');
    }
};
const autoSelectOptimalLevel = () => {
    const completeness = props.dataCompleteness;
    let optimalLevel = ReadingLevel.SUMMARY;
    if (completeness >= 85)
        optimalLevel = ReadingLevel.DEEP_ANALYSIS;
    else if (completeness >= 70)
        optimalLevel = ReadingLevel.STANDARD;
    else if (completeness >= 50)
        optimalLevel = ReadingLevel.COMPACT;
    if (availableLevels.value.includes(optimalLevel)) {
        switchToLevel(optimalLevel);
        emit('reset-requested');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['level-details']} */ ;
/** @type {__VLS_StyleScopedClasses['unified-layered-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['unified-layered-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['unified-layered-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['selector-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "unified-layered-controller" },
    ...{ class: ({ 'mobile': __VLS_ctx.isMobile, 'compact': __VLS_ctx.isCompact }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "level-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "selector-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "current-level-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "level-icon" },
});
(__VLS_ctx.currentLevelConfig.icon);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "level-details" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "level-name" },
});
(__VLS_ctx.currentLevelConfig.label);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "level-description" },
});
(__VLS_ctx.currentLevelConfig.description);
if (__VLS_ctx.showDataStatus && !__VLS_ctx.ignoreDataCompleteness) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "data-completeness" },
    });
    const __VLS_0 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        content: (`資料完整度: ${__VLS_ctx.dataCompleteness}%`),
        placement: "top",
    }));
    const __VLS_2 = __VLS_1({
        content: (`資料完整度: ${__VLS_ctx.dataCompleteness}%`),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "circle",
        percentage: (__VLS_ctx.dataCompleteness),
        width: (40),
        showText: (false),
        status: (__VLS_ctx.getCompletenessStatus(__VLS_ctx.dataCompleteness)),
    }));
    const __VLS_6 = __VLS_5({
        type: "circle",
        percentage: (__VLS_ctx.dataCompleteness),
        width: (40),
        showText: (false),
        status: (__VLS_ctx.getCompletenessStatus(__VLS_ctx.dataCompleteness)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    var __VLS_3;
}
if (!__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "level-buttons" },
    });
    const __VLS_8 = {}.ElButtonGroup;
    /** @type {[typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, typeof __VLS_components.ElButtonGroup, typeof __VLS_components.elButtonGroup, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    for (const [level] of __VLS_getVForSourceType((__VLS_ctx.availableLevels))) {
        const __VLS_12 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            key: (level),
            type: (level === __VLS_ctx.currentLevel ? 'primary' : 'default'),
            size: (__VLS_ctx.isCompact ? 'small' : 'default'),
            disabled: (__VLS_ctx.isTransitioning),
            ...{ class: "level-button" },
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            key: (level),
            type: (level === __VLS_ctx.currentLevel ? 'primary' : 'default'),
            size: (__VLS_ctx.isCompact ? 'small' : 'default'),
            disabled: (__VLS_ctx.isTransitioning),
            ...{ class: "level-button" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.switchToLevel(level);
            }
        };
        __VLS_15.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "button-icon" },
        });
        (__VLS_ctx.READING_LEVEL_CONFIGS[level].icon);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "button-text" },
        });
        (__VLS_ctx.READING_LEVEL_CONFIGS[level].label);
        var __VLS_15;
    }
    var __VLS_11;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mobile-selector" },
    });
    const __VLS_20 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.currentLevel),
        placeholder: "選擇閱覽層級",
        disabled: (__VLS_ctx.isTransitioning),
        ...{ class: "level-select" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.currentLevel),
        placeholder: "選擇閱覽層級",
        disabled: (__VLS_ctx.isTransitioning),
        ...{ class: "level-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onChange: (__VLS_ctx.handleLevelChange)
    };
    __VLS_23.slots.default;
    for (const [level] of __VLS_getVForSourceType((__VLS_ctx.availableLevels))) {
        const __VLS_28 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            key: (level),
            label: (__VLS_ctx.READING_LEVEL_CONFIGS[level].label),
            value: (level),
            disabled: (__VLS_ctx.isTransitioning),
        }));
        const __VLS_30 = __VLS_29({
            key: (level),
            label: (__VLS_ctx.READING_LEVEL_CONFIGS[level].label),
            value: (level),
            disabled: (__VLS_ctx.isTransitioning),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "option-icon" },
        });
        (__VLS_ctx.READING_LEVEL_CONFIGS[level].icon);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "option-label" },
        });
        (__VLS_ctx.READING_LEVEL_CONFIGS[level].label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "option-time" },
        });
        (__VLS_ctx.READING_LEVEL_CONFIGS[level].estimatedReadTime);
        var __VLS_31;
    }
    var __VLS_23;
}
if (__VLS_ctx.showToolbar) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-actions" },
    });
    const __VLS_32 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        content: "降低層級",
        placement: "top",
    }));
    const __VLS_34 = __VLS_33({
        content: "降低層級",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    const __VLS_36 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowLeft),
        disabled: (!__VLS_ctx.canDowngrade || __VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowLeft),
        disabled: (!__VLS_ctx.canDowngrade || __VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (__VLS_ctx.downgradeLevel)
    };
    var __VLS_39;
    var __VLS_35;
    const __VLS_44 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        content: "提升層級",
        placement: "top",
    }));
    const __VLS_46 = __VLS_45({
        content: "提升層級",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    const __VLS_48 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowRight),
        disabled: (!__VLS_ctx.canUpgrade || __VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.ArrowRight),
        disabled: (!__VLS_ctx.canUpgrade || __VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (__VLS_ctx.upgradeLevel)
    };
    var __VLS_51;
    var __VLS_47;
    const __VLS_56 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        content: "自動選擇最佳層級",
        placement: "top",
    }));
    const __VLS_58 = __VLS_57({
        content: "自動選擇最佳層級",
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.MagicStick),
        disabled: (__VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.MagicStick),
        disabled: (__VLS_ctx.isTransitioning),
        size: "small",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.autoSelectOptimalLevel)
    };
    var __VLS_63;
    var __VLS_59;
}
/** @type {__VLS_StyleScopedClasses['unified-layered-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['selector-header']} */ ;
/** @type {__VLS_StyleScopedClasses['current-level-info']} */ ;
/** @type {__VLS_StyleScopedClasses['level-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['level-details']} */ ;
/** @type {__VLS_StyleScopedClasses['level-name']} */ ;
/** @type {__VLS_StyleScopedClasses['level-description']} */ ;
/** @type {__VLS_StyleScopedClasses['data-completeness']} */ ;
/** @type {__VLS_StyleScopedClasses['level-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['level-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['level-select']} */ ;
/** @type {__VLS_StyleScopedClasses['option-content']} */ ;
/** @type {__VLS_StyleScopedClasses['option-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['option-text']} */ ;
/** @type {__VLS_StyleScopedClasses['option-label']} */ ;
/** @type {__VLS_StyleScopedClasses['option-time']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElProgress: ElProgress,
            ElButton: ElButton,
            ElButtonGroup: ElButtonGroup,
            ElSelect: ElSelect,
            ElOption: ElOption,
            ElTooltip: ElTooltip,
            ArrowLeft: ArrowLeft,
            ArrowRight: ArrowRight,
            MagicStick: MagicStick,
            READING_LEVEL_CONFIGS: READING_LEVEL_CONFIGS,
            isTransitioning: isTransitioning,
            currentLevel: currentLevel,
            availableLevels: availableLevels,
            currentLevelConfig: currentLevelConfig,
            canUpgrade: canUpgrade,
            canDowngrade: canDowngrade,
            getCompletenessStatus: getCompletenessStatus,
            switchToLevel: switchToLevel,
            handleLevelChange: handleLevelChange,
            upgradeLevel: upgradeLevel,
            downgradeLevel: downgradeLevel,
            autoSelectOptimalLevel: autoSelectOptimalLevel,
        };
    },
    __typeEmits: {},
    props: {
        moduleType: {
            type: String,
            required: true
        },
        layeredData: {
            type: Object,
            default: null
        },
        dataCompleteness: {
            type: Number,
            default: 0
        },
        enableSync: {
            type: Boolean,
            default: false
        },
        isMobile: {
            type: Boolean,
            default: false
        },
        isCompact: {
            type: Boolean,
            default: false
        },
        showToolbar: {
            type: Boolean,
            default: false
        },
        ignoreDataCompleteness: {
            type: Boolean,
            default: false
        },
        showDataStatus: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: String,
            default: 'standard'
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    props: {
        moduleType: {
            type: String,
            required: true
        },
        layeredData: {
            type: Object,
            default: null
        },
        dataCompleteness: {
            type: Number,
            default: 0
        },
        enableSync: {
            type: Boolean,
            default: false
        },
        isMobile: {
            type: Boolean,
            default: false
        },
        isCompact: {
            type: Boolean,
            default: false
        },
        showToolbar: {
            type: Boolean,
            default: false
        },
        ignoreDataCompleteness: {
            type: Boolean,
            default: false
        },
        showDataStatus: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: String,
            default: 'standard'
        }
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=UnifiedLayeredController.vue.js.map