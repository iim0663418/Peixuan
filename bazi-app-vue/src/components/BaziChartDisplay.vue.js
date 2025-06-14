/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onBeforeMount, ref, watch } from 'vue';
import SkeletonLoader from './SkeletonLoader.vue';
import { useI18n } from 'vue-i18n';
import { Lock } from '@element-plus/icons-vue';
const { t } = useI18n();
// 確保所有響應式初始化在掛載前完成
onBeforeMount(() => {
    console.log('BaziChartDisplay component initializing');
});
const props = withDefaults(defineProps(), {
    baziResult: null,
    tenGods: null,
    elementsDistribution: null,
    startLuckInfo: null,
    isLoading: false,
    error: null
});
const emit = defineEmits();
// 八字命盤固定使用 'standard' 模式，不提供分層控制
const displayMode = ref('standard');
console.log('八字命盤初始化：使用固定模式（standard）');
// 向上通知父組件當前使用固定模式
watch(displayMode, (newMode) => {
    emit('update:displayMode', newMode);
}, { immediate: true });
// 計算屬性
const pillarsDisplay = computed(() => {
    // 完全沒有資料的情況
    if (!props.baziResult)
        return [];
    // 檢查是否有正確的資料結構
    const hasValidYearPillar = props.baziResult.yearPillar && props.baziResult.yearPillar.stem && props.baziResult.yearPillar.branch;
    const hasValidMonthPillar = props.baziResult.monthPillar && props.baziResult.monthPillar.stem && props.baziResult.monthPillar.branch;
    const hasValidDayPillar = props.baziResult.dayPillar && props.baziResult.dayPillar.stem && props.baziResult.dayPillar.branch;
    const hasValidHourPillar = props.baziResult.hourPillar && props.baziResult.hourPillar.stem && props.baziResult.hourPillar.branch;
    // 如果資料不完整，返回空數組
    if (!hasValidYearPillar || !hasValidMonthPillar || !hasValidDayPillar || !hasValidHourPillar) {
        console.warn('BaziChartDisplay: 不完整的命盤資料', props.baziResult);
        return [];
    }
    // 所有資料都存在，安全構建柱子顯示
    return [
        {
            name: t('baziChart.yearPillar'),
            stem: props.baziResult.yearPillar.stem,
            branch: props.baziResult.yearPillar.branch,
            stemElement: props.baziResult.yearPillar.stemElement || '',
            branchElement: props.baziResult.yearPillar.branchElement || ''
        },
        {
            name: t('baziChart.monthPillar'),
            stem: props.baziResult.monthPillar.stem,
            branch: props.baziResult.monthPillar.branch,
            stemElement: props.baziResult.monthPillar.stemElement || '',
            branchElement: props.baziResult.monthPillar.branchElement || ''
        },
        {
            name: t('baziChart.dayPillar'),
            stem: props.baziResult.dayPillar.stem,
            branch: props.baziResult.dayPillar.branch,
            stemElement: props.baziResult.dayPillar.stemElement || '',
            branchElement: props.baziResult.dayPillar.branchElement || ''
        },
        {
            name: t('baziChart.hourPillar'),
            stem: props.baziResult.hourPillar.stem,
            branch: props.baziResult.hourPillar.branch,
            stemElement: props.baziResult.hourPillar.stemElement || '',
            branchElement: props.baziResult.hourPillar.branchElement || ''
        }
    ];
});
const totalElements = computed(() => {
    if (!props.elementsDistribution)
        return 0;
    return Object.values(props.elementsDistribution).reduce((sum, count) => sum + count, 0);
});
// 方法
const getElementClass = (element) => {
    const mapping = {
        '木': 'wood',
        '火': 'fire',
        '土': 'earth',
        '金': 'metal',
        '水': 'water'
    };
    return mapping[element] || 'default';
};
const getElementPercentage = (count) => {
    return totalElements.value > 0 ? (count / totalElements.value) * 100 : 0;
};
const getTenGod = (pillarIndex) => {
    if (!props.tenGods)
        return '';
    const godKeys = ['yearStemGod', 'monthStemGod', 'dayStemGod', 'hourStemGod'];
    const key = godKeys[pillarIndex];
    return props.tenGods[key] || '';
};
const getPillarName = (pillar) => {
    const mapping = {
        'yearStemGod': t('baziChart.yearPillar'),
        'monthStemGod': t('baziChart.monthPillar'),
        'dayStemGod': t('baziChart.dayPillar'),
        'hourStemGod': t('baziChart.hourPillar')
    };
    return mapping[pillar] || pillar;
};
const handlePillarClick = (pillarName) => {
    emit('pillar-click', pillarName);
};
const exportChart = () => {
    // 實現導出功能
    console.log('Export chart functionality would be implemented here');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    baziResult: null,
    tenGods: null,
    elementsDistribution: null,
    startLuckInfo: null,
    isLoading: false,
    error: null
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-column']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-section']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-section']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-elements-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['stem-element']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-elements-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['branch-element']} */ ;
/** @type {__VLS_StyleScopedClasses['desktop-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed-mode-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-section']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-details']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bazi-chart-display" },
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
    /** @type {[typeof SkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SkeletonLoader, new SkeletonLoader({
        variant: "chart",
    }));
    const __VLS_1 = __VLS_0({
        variant: "chart",
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('baziChart.loadError'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.$emit('retry');
            } },
        ...{ class: "retry-button" },
    });
    (__VLS_ctx.$t('baziChart.retry'));
}
else if (__VLS_ctx.baziResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('baziChart.title'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fixed-mode-indicator" },
    });
    const __VLS_3 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
        type: "info",
        size: "small",
        effect: "plain",
    }));
    const __VLS_5 = __VLS_4({
        type: "info",
        size: "small",
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
    __VLS_6.slots.default;
    const __VLS_7 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_10.slots.default;
    const __VLS_11 = {}.Lock;
    /** @type {[typeof __VLS_components.Lock, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({}));
    const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
    var __VLS_10;
    var __VLS_6;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "mode-description" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bazi-pillars" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillars-grid desktop-layout" },
    });
    for (const [pillar, index] of __VLS_getVForSourceType((__VLS_ctx.pillarsDisplay))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.baziResult))
                        return;
                    __VLS_ctx.handlePillarClick(pillar.name);
                } },
            key: (pillar.name),
            ...{ class: "pillar-column" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-header" },
        });
        (pillar.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-stem" },
        });
        (pillar.stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-branch" },
        });
        (pillar.branch);
        if (__VLS_ctx.tenGods) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pillar-god" },
            });
            (__VLS_ctx.getTenGod(index));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-elements" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stem-element" },
            ...{ class: (`element-${__VLS_ctx.getElementClass(pillar.stemElement)}`) },
        });
        (pillar.stemElement);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "branch-element" },
            ...{ class: (`element-${__VLS_ctx.getElementClass(pillar.branchElement)}`) },
        });
        (pillar.branchElement);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillars-mobile mobile-layout" },
    });
    for (const [pillar, index] of __VLS_getVForSourceType((__VLS_ctx.pillarsDisplay))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.baziResult))
                        return;
                    __VLS_ctx.handlePillarClick(pillar.name);
                } },
            key: (pillar.name),
            ...{ class: "pillar-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
            ...{ class: "pillar-name" },
        });
        (pillar.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "pillar-stem" },
        });
        (pillar.stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "pillar-branch" },
        });
        (pillar.branch);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-card-content" },
        });
        if (__VLS_ctx.tenGods) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pillar-god-mobile" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "god-label" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "god-value" },
            });
            (__VLS_ctx.getTenGod(index));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pillar-elements-mobile" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "element-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "element-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stem-element" },
            ...{ class: (`element-${__VLS_ctx.getElementClass(pillar.stemElement)}`) },
        });
        (pillar.stemElement);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "element-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "element-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "branch-element" },
            ...{ class: (`element-${__VLS_ctx.getElementClass(pillar.branchElement)}`) },
        });
        (pillar.branchElement);
    }
    if (__VLS_ctx.elementsDistribution) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "elements-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (__VLS_ctx.$t('baziChart.elementsDistribution'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "elements-chart" },
        });
        for (const [count, element] of __VLS_getVForSourceType((__VLS_ctx.elementsDistribution))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (element),
                ...{ class: "element-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "element-name" },
            });
            (element);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "element-bar" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "element-fill" },
                ...{ style: ({ width: `${__VLS_ctx.getElementPercentage(count)}%` }) },
                ...{ class: (`element-${__VLS_ctx.getElementClass(element)}`) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "element-count" },
            });
            (count);
        }
    }
    if (__VLS_ctx.tenGods) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ten-gods-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (__VLS_ctx.$t('baziChart.tenGodsAnalysis'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ten-gods-grid" },
        });
        for (const [god, pillar] of __VLS_getVForSourceType((__VLS_ctx.tenGods))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (pillar),
                ...{ class: "ten-god-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "pillar-name" },
            });
            (__VLS_ctx.getPillarName(pillar));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "god-name" },
                ...{ class: (`god-${god}`) },
            });
            (god);
        }
    }
    if (__VLS_ctx.startLuckInfo) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "luck-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (__VLS_ctx.$t('baziChart.luckInfo'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "luck-details" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "luck-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "luck-label" },
        });
        (__VLS_ctx.$t('baziChart.startAge'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "luck-value" },
        });
        (__VLS_ctx.startLuckInfo.age);
        (__VLS_ctx.$t('baziChart.years'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "luck-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "luck-label" },
        });
        (__VLS_ctx.$t('baziChart.startYear'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "luck-value" },
        });
        (__VLS_ctx.startLuckInfo.year);
        (__VLS_ctx.$t('baziChart.yearUnit'));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('baziChart.noData'));
}
/** @type {__VLS_StyleScopedClasses['bazi-chart-display']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed-mode-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-description']} */ ;
/** @type {__VLS_StyleScopedClasses['bazi-pillars']} */ ;
/** @type {__VLS_StyleScopedClasses['pillars-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['desktop-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-column']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-god']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-elements']} */ ;
/** @type {__VLS_StyleScopedClasses['stem-element']} */ ;
/** @type {__VLS_StyleScopedClasses['branch-element']} */ ;
/** @type {__VLS_StyleScopedClasses['pillars-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-god-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['god-label']} */ ;
/** @type {__VLS_StyleScopedClasses['god-value']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-elements-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['element-row']} */ ;
/** @type {__VLS_StyleScopedClasses['element-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stem-element']} */ ;
/** @type {__VLS_StyleScopedClasses['element-row']} */ ;
/** @type {__VLS_StyleScopedClasses['element-label']} */ ;
/** @type {__VLS_StyleScopedClasses['branch-element']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['element-item']} */ ;
/** @type {__VLS_StyleScopedClasses['element-name']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['element-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['element-count']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-god-item']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-name']} */ ;
/** @type {__VLS_StyleScopedClasses['god-name']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-section']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-details']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-item']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-label']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-value']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-item']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-label']} */ ;
/** @type {__VLS_StyleScopedClasses['luck-value']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SkeletonLoader: SkeletonLoader,
            Lock: Lock,
            pillarsDisplay: pillarsDisplay,
            getElementClass: getElementClass,
            getElementPercentage: getElementPercentage,
            getTenGod: getTenGod,
            getPillarName: getPillarName,
            handlePillarClick: handlePillarClick,
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
//# sourceMappingURL=BaziChartDisplay.vue.js.map