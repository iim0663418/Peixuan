import { ref, computed, watch } from 'vue';
const props = defineProps({
    birthYear: {
        type: Number,
        required: false,
        default: null,
    },
    // 假設我們從父組件接收一個起始年份和要顯示的年數，或者一個預先計算好的列表
    // 為了簡化，我們先假設一個固定的範圍，例如從出生年開始的100年
    // 或者，父組件應該傳入一個已經計算好的 yearlyFates 列表
    // currentSelectedYear: Number, // 父組件傳入的當前選中年份
});
const emit = defineEmits(['yearSelected']);
const selectedIndex = ref(0);
// 生成從出生年開始的100個流年信息
const yearlyFatesToDisplay = computed(() => {
    if (!props.birthYear || typeof window.Solar === 'undefined' || typeof window.Lunar === 'undefined') {
        return [];
    }
    const fates = [];
    for (let i = 0; i < 100; i++) {
        const currentYear = props.birthYear + i;
        try {
            // 使用公曆年的1月1日來獲取該年的干支
            // 注意：嚴格的流年干支是以立春為界，這裡簡化處理
            const solarDate = window.Solar.fromYmd(currentYear, 1, 1);
            const lunarDate = solarDate.getLunar();
            const yearGan = lunarDate.getYearGanExact();
            const yearZhi = lunarDate.getYearZhiExact();
            fates.push({
                year: currentYear,
                age: currentYear - props.birthYear + 1, // 週歲 + 1 = 虛歲 (近似)
                ganZhi: `${yearGan}${yearZhi}`,
                stem: yearGan,
                branch: yearZhi,
            });
        }
        catch (e) {
            console.error(`Error generating fate for year ${currentYear}:`, e);
        }
    }
    return fates;
});
const selectedYearData = computed(() => {
    if (yearlyFatesToDisplay.value.length > 0 && selectedIndex.value < yearlyFatesToDisplay.value.length) {
        return yearlyFatesToDisplay.value[selectedIndex.value];
    }
    return null;
});
const handleSliderChange = (event) => {
    const target = event.target;
    selectedIndex.value = parseInt(target.value, 10);
};
watch(selectedYearData, (newValue) => {
    if (newValue) {
        emit('yearSelected', newValue);
    }
});
// 如果需要根據外部傳入的年份來初始化滑塊
// watch(() => props.currentSelectedYear, (newVal) => {
//   if (newVal !== undefined) {
//     const index = yearlyFatesToDisplay.value.findIndex(fate => fate.year === newVal);
//     if (index !== -1) {
//       selectedIndex.value = index;
//     }
//   }
// }, { immediate: true });
const __VLS_exposed = {
    yearlyFatesToDisplay,
    selectedYearData
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['yearly-fate-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-info']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "yearly-fate-timeline section-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
if (__VLS_ctx.yearlyFatesToDisplay.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.handleSliderChange) },
        type: "range",
        min: (0),
        max: (__VLS_ctx.yearlyFatesToDisplay.length - 1),
        value: (__VLS_ctx.selectedIndex),
        ...{ class: "slider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedYearData?.year);
    (__VLS_ctx.selectedYearData?.ganZhi);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedYearData?.age);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-labels" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.yearlyFatesToDisplay[0]?.year);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.yearlyFatesToDisplay[Math.floor(__VLS_ctx.yearlyFatesToDisplay.length / 2)]?.year);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.yearlyFatesToDisplay[__VLS_ctx.yearlyFatesToDisplay.length - 1]?.year);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {__VLS_StyleScopedClasses['yearly-fate-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slider']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-info']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-labels']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selectedIndex: selectedIndex,
            yearlyFatesToDisplay: yearlyFatesToDisplay,
            selectedYearData: selectedYearData,
            handleSliderChange: handleSliderChange,
        };
    },
    emits: {},
    props: {
        birthYear: {
            type: Number,
            required: false,
            default: null,
        },
        // 假設我們從父組件接收一個起始年份和要顯示的年數，或者一個預先計算好的列表
        // 為了簡化，我們先假設一個固定的範圍，例如從出生年開始的100年
        // 或者，父組件應該傳入一個已經計算好的 yearlyFates 列表
        // currentSelectedYear: Number, // 父組件傳入的當前選中年份
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    props: {
        birthYear: {
            type: Number,
            required: false,
            default: null,
        },
        // 假設我們從父組件接收一個起始年份和要顯示的年數，或者一個預先計算好的列表
        // 為了簡化，我們先假設一個固定的範圍，例如從出生年開始的100年
        // 或者，父組件應該傳入一個已經計算好的 yearlyFates 列表
        // currentSelectedYear: Number, // 父組件傳入的當前選中年份
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=YearlyFateTimeline.vue.js.map