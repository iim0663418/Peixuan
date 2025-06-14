import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import apiService from '../services/apiService';
const { t } = useI18n();
// 地支名稱
const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 響應式資料
const isLoading = ref(false);
const errorMessage = ref('');
const chartResult = ref(null);
const selectedPalace = ref(null);
// 表單資料
const formData = reactive({
    year: new Date().getFullYear() - 25,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: 'male'
});
// 計算屬性
const isFormValid = computed(() => {
    return formData.year >= 1900 &&
        formData.year <= 2100 &&
        formData.month >= 1 &&
        formData.month <= 12 &&
        formData.day >= 1 &&
        formData.day <= 31 &&
        formData.hour >= 0 &&
        formData.hour <= 23 &&
        formData.minute >= 0 &&
        formData.minute <= 59 &&
        formData.gender;
});
// 輔助方法
const getZhiName = (index) => {
    return ZHI_NAMES[index] || '未知';
};
const getRelativeShenIndex = () => {
    if (!chartResult.value)
        return -1;
    const mingIndex = chartResult.value.mingPalaceIndex;
    const shenIndex = chartResult.value.shenPalaceIndex;
    // 計算身宮相對於命宮的相對位置
    return (shenIndex - mingIndex + 12) % 12;
};
// 從 lunar-javascript 全局對象獲取農曆轉換功能
const convertToLunar = (solarDate) => {
    try {
        // 使用全局的 Lunar 對象
        const solar = window.Lunar.Solar.fromYmdHms(solarDate.getFullYear(), solarDate.getMonth() + 1, solarDate.getDate(), solarDate.getHours(), solarDate.getMinutes(), solarDate.getSeconds());
        const lunar = solar.getLunar();
        return {
            year: lunar.getYear(),
            month: lunar.getMonth(),
            day: lunar.getDay(),
            hour: solarDate.getHours(),
            yearGan: lunar.getYearGan(),
            yearZhi: lunar.getYearZhi(),
            monthGan: lunar.getMonthGan(),
            monthZhi: lunar.getMonthZhi(),
            dayGan: lunar.getDayGan(),
            dayZhi: lunar.getDayZhi(),
            timeGan: lunar.getTimeGan(),
            timeZhi: lunar.getTimeZhi(),
            yearInGanZhi: lunar.getYearInGanZhi(),
            monthInGanZhi: lunar.getMonthInGanZhi(),
            dayInGanZhi: lunar.getDayInGanZhi(),
            timeInGanZhi: lunar.getTimeInGanZhi()
        };
    }
    catch (error) {
        console.error('農曆轉換失敗:', error);
        throw new Error('農曆轉換失敗，請檢查輸入日期');
    }
};
// 方法
const calculateChart = async () => {
    if (!isFormValid.value) {
        errorMessage.value = t('chart.invalid_input');
        return;
    }
    isLoading.value = true;
    errorMessage.value = '';
    chartResult.value = null;
    selectedPalace.value = null;
    try {
        // 組裝生辰資料
        const birthDate = new Date(formData.year, formData.month - 1, formData.day, formData.hour, formData.minute);
        // 轉換為農曆
        const lunarInfo = convertToLunar(birthDate);
        // 組裝請求資料
        const requestData = {
            birthDate: birthDate.toISOString().split('T')[0], // YYYY-MM-DD 格式
            birthTime: `${formData.hour.toString().padStart(2, '0')}:${formData.minute.toString().padStart(2, '0')}:00`, // HH:MM:SS 格式
            gender: formData.gender,
            lunarInfo: lunarInfo,
            options: {
                includeMajorCycles: true,
                includeMinorCycles: true,
                includeAnnualCycles: false,
                detailLevel: 'basic',
                maxAge: 100
            }
        };
        console.log('發送計算請求:', requestData);
        // 調用 API
        const response = await apiService.calculatePurpleStar(requestData);
        if (response.success && response.data) {
            chartResult.value = response.data.chart;
            console.log('計算結果:', response.data);
        }
        else {
            errorMessage.value = response.error || t('chart.calculation_failed');
        }
    }
    catch (error) {
        console.error('計算紫微斗數命盤失敗:', error);
        if (error?.response?.data?.error) {
            errorMessage.value = error.response.data.error;
        }
        else {
            errorMessage.value = error.message || t('chart.calculation_failed');
        }
    }
    finally {
        isLoading.value = false;
    }
};
const resetForm = () => {
    formData.year = new Date().getFullYear() - 25;
    formData.month = 1;
    formData.day = 1;
    formData.hour = 12;
    formData.minute = 0;
    formData.gender = 'male';
    chartResult.value = null;
    selectedPalace.value = null;
    errorMessage.value = '';
};
const selectPalace = (palace) => {
    selectedPalace.value = palace;
};
const exportChart = () => {
    if (!chartResult.value)
        return;
    const dataStr = JSON.stringify(chartResult.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `紫微斗數命盤_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-card']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-card']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-card']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ziwei-calculator']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['palaces-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ziwei-calculator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.$t('astrology.purple_star'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "description" },
});
(__VLS_ctx.$t('chart.description'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.calculateChart) },
    ...{ class: "calculator-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.$t('chart.birth_info'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "birth-year",
});
(__VLS_ctx.$t('chart.birth_year'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "birth-year",
    type: "number",
    min: (1900),
    max: (2100),
    required: true,
    ...{ class: "form-control" },
});
(__VLS_ctx.formData.year);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "birth-month",
});
(__VLS_ctx.$t('chart.birth_month'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "birth-month",
    type: "number",
    min: (1),
    max: (12),
    required: true,
    ...{ class: "form-control" },
});
(__VLS_ctx.formData.month);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "birth-day",
});
(__VLS_ctx.$t('chart.birth_day'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "birth-day",
    type: "number",
    min: (1),
    max: (31),
    required: true,
    ...{ class: "form-control" },
});
(__VLS_ctx.formData.day);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "birth-hour",
});
(__VLS_ctx.$t('chart.birth_hour'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "birth-hour",
    type: "number",
    min: (0),
    max: (23),
    required: true,
    ...{ class: "form-control" },
});
(__VLS_ctx.formData.hour);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "birth-minute",
});
(__VLS_ctx.$t('chart.birth_minute'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "birth-minute",
    type: "number",
    min: (0),
    max: (59),
    ...{ class: "form-control" },
});
(__VLS_ctx.formData.minute);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
(__VLS_ctx.$t('chart.gender'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "radio-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "radio",
    value: "male",
});
(__VLS_ctx.formData.gender);
(__VLS_ctx.$t('chart.male'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "radio-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "radio",
    value: "female",
});
(__VLS_ctx.formData.gender);
(__VLS_ctx.$t('chart.female'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    disabled: (__VLS_ctx.isLoading || !__VLS_ctx.isFormValid),
    ...{ class: "btn btn-primary" },
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "loading-spinner" },
    });
}
(__VLS_ctx.isLoading ? __VLS_ctx.$t('common.loading') : __VLS_ctx.$t('chart.generate'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetForm) },
    type: "button",
    ...{ class: "btn btn-secondary" },
});
(__VLS_ctx.$t('common.reset'));
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.$t('common.error'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.errorMessage);
}
if (__VLS_ctx.chartResult && !__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('chart.result_title'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.chartResult.fiveElementsBureau);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getZhiName(__VLS_ctx.chartResult.mingPalaceIndex));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.getZhiName(__VLS_ctx.chartResult.shenPalaceIndex));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "palaces-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.$t('chart.twelve_palaces'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "palaces-container" },
    });
    for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartResult.palaces))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.chartResult && !__VLS_ctx.isLoading))
                        return;
                    __VLS_ctx.selectPalace(palace);
                } },
            key: (index),
            ...{ class: "palace-card" },
            ...{ class: ({
                    active: __VLS_ctx.selectedPalace?.name === palace.name,
                    ming: index === 0,
                    shen: index === __VLS_ctx.getRelativeShenIndex()
                }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "palace-name" },
        });
        (palace.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "palace-zhi" },
        });
        (palace.zhi);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "palace-stars" },
        });
        for (const [star] of __VLS_getVForSourceType((palace.stars))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (star.name),
                ...{ class: (['star', `star-${star.type}`]) },
            });
            (star.name);
            if (star.transformations && star.transformations.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "transformations" },
                });
                (star.transformations.join(''));
            }
        }
    }
    if (__VLS_ctx.selectedPalace) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "palace-details" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (__VLS_ctx.selectedPalace.name);
        (__VLS_ctx.$t('chart.details'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.selectedPalace.zhi);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stars-list" },
        });
        for (const [star] of __VLS_getVForSourceType((__VLS_ctx.selectedPalace.stars))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (star.name),
                ...{ class: "star-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (['star-name', `star-${star.type}`]) },
            });
            (star.name);
            if (star.transformations && star.transformations.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "transformations" },
                });
                (star.transformations.join('、'));
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.exportChart) },
        ...{ class: "btn btn-info" },
    });
    (__VLS_ctx.$t('chart.export_chart'));
}
/** @type {__VLS_StyleScopedClasses['ziwei-calculator']} */ ;
/** @type {__VLS_StyleScopedClasses['description']} */ ;
/** @type {__VLS_StyleScopedClasses['calculator-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-label']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['palaces-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['palaces-container']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['ming']} */ ;
/** @type {__VLS_StyleScopedClasses['shen']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-list']} */ ;
/** @type {__VLS_StyleScopedClasses['star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isLoading: isLoading,
            errorMessage: errorMessage,
            chartResult: chartResult,
            selectedPalace: selectedPalace,
            formData: formData,
            isFormValid: isFormValid,
            getZhiName: getZhiName,
            getRelativeShenIndex: getRelativeShenIndex,
            calculateChart: calculateChart,
            resetForm: resetForm,
            selectPalace: selectPalace,
            exportChart: exportChart,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ZiweiCalculator.vue.js.map