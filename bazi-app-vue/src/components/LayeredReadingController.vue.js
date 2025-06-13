import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, MagicStick, Close, InfoFilled, Setting, RefreshLeft, Loading } from '@element-plus/icons-vue';
import { useLayeredReading } from '@/composables/useLayeredReading';
import { READING_LEVEL_CONFIGS, ReadingLevel } from '@/types/layeredReading';
const props = withDefaults(defineProps(), {
    showControls: true,
    compactMode: false,
    disabled: false
});
const emit = defineEmits();
// 使用分層閱覽狀態管理
const { readingState, userPreferences, currentBreakpoint, availableLevels, currentLevelConfig, canUpgrade, canDowngrade, getLayoutConfig, switchToLevel, upgradeLevel, downgradeLevel, autoSelectOptimalLevel, saveUserPreferences, resetToDefaults } = useLayeredReading();
// 本地狀態
const showInfoPanel = ref(false);
const showPreferences = ref(false);
// 計算屬性
const currentLevel = computed({
    get: () => readingState.currentLevel,
    set: (value) => {
        switchToLevel(value);
    }
});
const isTransitioning = computed(() => readingState.isTransitioning);
const dataCompleteness = computed(() => readingState.dataCompleteness);
const isMobile = computed(() => currentBreakpoint.value === 'mobile');
const isCompact = computed(() => props.compactMode || userPreferences.value.compactMode);
// 方法
const handleLevelChange = (newLevel) => {
    if (newLevel !== currentLevel.value) {
        switchToLevel(newLevel).then(success => {
            if (success) {
                emit('levelChanged', newLevel);
                ElMessage.success(`已切換到${READING_LEVEL_CONFIGS[newLevel].label}`);
            }
        });
    }
};
const handleUpgrade = () => {
    upgradeLevel().then(success => {
        if (success) {
            emit('upgradeRequested');
            ElMessage.success('已升級到更詳細的解讀層級');
        }
    });
};
const handleDowngrade = () => {
    downgradeLevel().then(success => {
        if (success) {
            emit('downgradeRequested');
            ElMessage.success('已降級到更簡潔的解讀層級');
        }
    });
};
const handleAutoSelect = () => {
    autoSelectOptimalLevel().then(() => {
        ElMessage.success('已自動選擇最佳閱覽層級');
    });
};
const handleReset = () => {
    ElMessageBox.confirm('確定要重置所有閱覽偏好設置嗎？', '重置確認', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        resetToDefaults();
        emit('resetRequested');
        ElMessage.success('已重置為默認設置');
    }).catch(() => {
        // 用戶取消
    });
};
const getCompletenessStatus = (completeness) => {
    if (completeness >= 80)
        return 'success';
    if (completeness >= 60)
        return 'warning';
    return 'exception';
};
const getLevelFeatures = (level) => {
    const features = {
        [ReadingLevel.SUMMARY]: '核心特質、快速預覽',
        [ReadingLevel.COMPACT]: '重點分析、運勢要點',
        [ReadingLevel.STANDARD]: '完整解讀、人生建議',
        [ReadingLevel.DEEP_ANALYSIS]: '深度分析、詳盡指導'
    };
    return features[level];
};
// 監聽可用層級變化，自動調整當前層級
watch(availableLevels, (newLevels) => {
    if (newLevels.length > 0 && !newLevels.includes(currentLevel.value)) {
        // 如果當前層級不可用，自動選擇最佳層級
        autoSelectOptimalLevel();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    showControls: true,
    compactMode: false,
    disabled: false
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['level-details']} */ ;
/** @type {__VLS_StyleScopedClasses['info-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-header']} */ ;
/** @type {__VLS_StyleScopedClasses['layered-reading-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['level-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['level-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['layered-reading-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['level-info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['level-button']} */ ;
/** @type {__VLS_StyleScopedClasses['level-button']} */ ;
/** @type {__VLS_StyleScopedClasses['level-info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "layered-reading-controller" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "level-selector" },
    ...{ class: ({ 'mobile': __VLS_ctx.isMobile, 'compact': __VLS_ctx.isCompact }) },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-completeness" },
});
const __VLS_0 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    content: (`數據完整度: ${__VLS_ctx.dataCompleteness}%`),
    placement: "top",
}));
const __VLS_2 = __VLS_1({
    content: (`數據完整度: ${__VLS_ctx.dataCompleteness}%`),
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
    type: "success",
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.MagicStick),
    disabled: (__VLS_ctx.isTransitioning),
    size: "small",
    circle: true,
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.autoSelectOptimalLevel)
};
var __VLS_63;
var __VLS_59;
if (__VLS_ctx.showInfoPanel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "level-info-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    (__VLS_ctx.currentLevelConfig.label);
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Close),
        size: "small",
        text: true,
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Close),
        size: "small",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showInfoPanel))
                return;
            __VLS_ctx.showInfoPanel = false;
        }
    };
    var __VLS_71;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (__VLS_ctx.currentLevelConfig.estimatedReadTime);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (__VLS_ctx.currentLevelConfig.minDataRequirement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (__VLS_ctx.getLevelFeatures(__VLS_ctx.currentLevel));
}
if (__VLS_ctx.showPreferences) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preferences-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preferences-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Close),
        size: "small",
        text: true,
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Close),
        size: "small",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showPreferences))
                return;
            __VLS_ctx.showPreferences = false;
        }
    };
    var __VLS_79;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preferences-content" },
    });
    const __VLS_84 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        labelPosition: "top",
        size: "small",
    }));
    const __VLS_86 = __VLS_85({
        labelPosition: "top",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        label: "自動升級層級",
    }));
    const __VLS_90 = __VLS_89({
        label: "自動升級層級",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    const __VLS_92 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.autoUpgrade),
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.autoUpgrade),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onChange: (__VLS_ctx.saveUserPreferences)
    };
    var __VLS_95;
    var __VLS_91;
    const __VLS_100 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        label: "啟用動畫效果",
    }));
    const __VLS_102 = __VLS_101({
        label: "啟用動畫效果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    const __VLS_104 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.animationsEnabled),
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.animationsEnabled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onChange: (__VLS_ctx.saveUserPreferences)
    };
    var __VLS_107;
    var __VLS_103;
    const __VLS_112 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        label: "緊湊模式",
    }));
    const __VLS_114 = __VLS_113({
        label: "緊湊模式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_115.slots.default;
    const __VLS_116 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.compactMode),
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.userPreferences.compactMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_120;
    let __VLS_121;
    let __VLS_122;
    const __VLS_123 = {
        onChange: (__VLS_ctx.saveUserPreferences)
    };
    var __VLS_119;
    var __VLS_115;
    var __VLS_87;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
const __VLS_124 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    content: "顯示層級信息",
    placement: "top",
}));
const __VLS_126 = __VLS_125({
    content: "顯示層級信息",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.InfoFilled),
    size: "small",
    type: (__VLS_ctx.showInfoPanel ? 'primary' : 'default'),
}));
const __VLS_130 = __VLS_129({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.InfoFilled),
    size: "small",
    type: (__VLS_ctx.showInfoPanel ? 'primary' : 'default'),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_132;
let __VLS_133;
let __VLS_134;
const __VLS_135 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showInfoPanel = !__VLS_ctx.showInfoPanel;
    }
};
var __VLS_131;
var __VLS_127;
const __VLS_136 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    content: "偏好設置",
    placement: "top",
}));
const __VLS_138 = __VLS_137({
    content: "偏好設置",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Setting),
    size: "small",
    type: (__VLS_ctx.showPreferences ? 'primary' : 'default'),
}));
const __VLS_142 = __VLS_141({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.Setting),
    size: "small",
    type: (__VLS_ctx.showPreferences ? 'primary' : 'default'),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
let __VLS_144;
let __VLS_145;
let __VLS_146;
const __VLS_147 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showPreferences = !__VLS_ctx.showPreferences;
    }
};
var __VLS_143;
var __VLS_139;
const __VLS_148 = {}.ElTooltip;
/** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    content: "重置為默認",
    placement: "top",
}));
const __VLS_150 = __VLS_149({
    content: "重置為默認",
    placement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.RefreshLeft),
    size: "small",
    type: "warning",
}));
const __VLS_154 = __VLS_153({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.RefreshLeft),
    size: "small",
    type: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_156;
let __VLS_157;
let __VLS_158;
const __VLS_159 = {
    onClick: (__VLS_ctx.handleReset)
};
var __VLS_155;
var __VLS_151;
if (__VLS_ctx.isTransitioning) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-overlay" },
    });
    const __VLS_160 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ class: "loading-icon" },
        size: (24),
    }));
    const __VLS_162 = __VLS_161({
        ...{ class: "loading-icon" },
        size: (24),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    const __VLS_164 = {}.Loading;
    /** @type {[typeof __VLS_components.Loading, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
    var __VLS_163;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "loading-text" },
    });
}
/** @type {__VLS_StyleScopedClasses['layered-reading-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['level-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
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
/** @type {__VLS_StyleScopedClasses['level-info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['info-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preferences-content']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowLeft: ArrowLeft,
            ArrowRight: ArrowRight,
            MagicStick: MagicStick,
            Close: Close,
            InfoFilled: InfoFilled,
            Setting: Setting,
            RefreshLeft: RefreshLeft,
            Loading: Loading,
            READING_LEVEL_CONFIGS: READING_LEVEL_CONFIGS,
            userPreferences: userPreferences,
            availableLevels: availableLevels,
            currentLevelConfig: currentLevelConfig,
            canUpgrade: canUpgrade,
            canDowngrade: canDowngrade,
            switchToLevel: switchToLevel,
            upgradeLevel: upgradeLevel,
            downgradeLevel: downgradeLevel,
            autoSelectOptimalLevel: autoSelectOptimalLevel,
            saveUserPreferences: saveUserPreferences,
            showInfoPanel: showInfoPanel,
            showPreferences: showPreferences,
            currentLevel: currentLevel,
            isTransitioning: isTransitioning,
            dataCompleteness: dataCompleteness,
            isMobile: isMobile,
            isCompact: isCompact,
            handleLevelChange: handleLevelChange,
            handleReset: handleReset,
            getCompletenessStatus: getCompletenessStatus,
            getLevelFeatures: getLevelFeatures,
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
//# sourceMappingURL=LayeredReadingController.vue.js.map