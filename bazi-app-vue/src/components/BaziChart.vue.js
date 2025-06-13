/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed } from 'vue';
const props = defineProps({
    bazi: {
        type: Object,
        required: true,
    },
    tenGods: {
        type: Object,
        default: null,
    },
    highlightedPillars: {
        type: Array,
        default: () => [],
    },
});
// 確保柱子從右到左顯示 (時日月年) - 傳統排盤習慣
const pillarOrder = ['hourPillar', 'dayPillar', 'monthPillar', 'yearPillar'];
const getPillarName = (key) => {
    switch (key) {
        case 'yearPillar': return '年柱';
        case 'monthPillar': return '月柱';
        case 'dayPillar': return '日柱';
        case 'hourPillar': return '時柱';
        default: return '';
    }
};
const tenGodsForPillars = computed(() => {
    if (!props.tenGods || !props.bazi) {
        return {
            yearPillar: '',
            monthPillar: '',
            dayPillar: '', // 日主通常不顯示自身十神，或標為日主
            hourPillar: '',
        };
    }
    return {
        yearPillar: props.tenGods.yearStemGod,
        monthPillar: props.tenGods.monthStemGod,
        dayPillar: props.tenGods.dayStemGod, // 這裡顯示的是日干對日干的十神，即比肩/劫財
        hourPillar: props.tenGods.hourStemGod,
    };
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['bazi-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-display']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-display']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (props.bazi) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bazi-chart section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillars-container" },
    });
    for (const [pillarKey] of __VLS_getVForSourceType((__VLS_ctx.pillarOrder))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (pillarKey),
            ...{ class: "pillar-card-display" },
            ...{ class: ({ highlighted: props.highlightedPillars?.includes(pillarKey) }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
        (__VLS_ctx.getPillarName(pillarKey));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stem-branch" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "char" },
        });
        (props.bazi[pillarKey].stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        (props.bazi[pillarKey].stemElement);
        if (props.tenGods && __VLS_ctx.tenGodsForPillars[pillarKey]) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "ten-god" },
            });
            (__VLS_ctx.tenGodsForPillars[pillarKey]);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stem-branch" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "char" },
        });
        (props.bazi[pillarKey].branch);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        (props.bazi[pillarKey].branchElement);
    }
}
/** @type {__VLS_StyleScopedClasses['bazi-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillars-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card-display']} */ ;
/** @type {__VLS_StyleScopedClasses['highlighted']} */ ;
/** @type {__VLS_StyleScopedClasses['stem-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['char']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-god']} */ ;
/** @type {__VLS_StyleScopedClasses['stem-branch']} */ ;
/** @type {__VLS_StyleScopedClasses['char']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            pillarOrder: pillarOrder,
            getPillarName: getPillarName,
            tenGodsForPillars: tenGodsForPillars,
        };
    },
    props: {
        bazi: {
            type: Object,
            required: true,
        },
        tenGods: {
            type: Object,
            default: null,
        },
        highlightedPillars: {
            type: Array,
            default: () => [],
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        bazi: {
            type: Object,
            required: true,
        },
        tenGods: {
            type: Object,
            default: null,
        },
        highlightedPillars: {
            type: Array,
            default: () => [],
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=BaziChart.vue.js.map