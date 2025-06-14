/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { reactive, onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { BaziCalculator, TenGodsCalculator, FiveElementsAnalyzer, FortuneCycleCalculator } from '../utils/baziCalc';
import { YearlyInteractionAnalyzer } from '../utils/yearlyInteractionUtils';
import { FrontendValidator } from '../utils/frontendValidation';
import BaziChart from './BaziChart.vue';
import ElementsChart from './ElementsChart.vue';
import YearlyFateTimeline from './YearlyFateTimeline.vue';
const userId = ref(null);
const conversionDisplayResult = ref('');
const parsedBaziResult = ref(null);
const parsedTenGodsResult = ref(null);
const parsedElementsDistributionResult = ref(null);
const parsedStartLuckResult = ref(null);
const yearlyFateInput = ref(null);
const parsedYearlyInteractionResult = ref(null);
const selectedYearFromTimeline = ref(null);
const baziDisplayResult = ref('');
const tenGodsDisplayResult = ref('');
const elementsDistributionDisplayResult = ref('');
const startLuckDisplayResult = ref('');
const activeCalendarLib = ref(null);
const isCalendarLibFullyAvailable = ref(false);
const calendarLibLoadErrorText = ref('核心日曆庫正在加載或加載失敗，請稍候...');
const calendarCheckInterval = ref(null);
const calendarCheckTimeout = ref(null);
const MAX_CHECK_DURATION = 10000;
const CHECK_INTERVAL = 500;
const emit = defineEmits(['submitBaziData']);
const isLoading = ref(false);
const timezones = ref([
    { label: '自動偵測 (預設)', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { label: 'Asia/Taipei (台北)', value: 'Asia/Taipei' }, { label: 'Asia/Shanghai (上海)', value: 'Asia/Shanghai' },
    { label: 'Asia/Hong_Kong (香港)', value: 'Asia/Hong_Kong' }, { label: 'Asia/Singapore (新加坡)', value: 'Asia/Singapore' },
    { label: 'Asia/Tokyo (東京)', value: 'Asia/Tokyo' }, { label: 'America/New_York (紐約)', value: 'America/New_York' },
    { label: 'America/Los_Angeles (洛杉磯)', value: 'America/Los_Angeles' }, { label: 'Europe/London (倫敦)', value: 'Europe/London' },
    { label: 'Europe/Paris (巴黎)', value: 'Europe/Paris' }, { label: 'Australia/Sydney (雪梨)', value: 'Australia/Sydney' },
    { label: 'UTC±00:00 (格林威治標準時間)', value: 'UTC' },
]);
const USER_ID_KEY = 'baziAppUserId';
const FORM_STATE_KEY = 'baziAppFormState';
const formState = reactive({
    calendarType: 'solar', year: null, month: null, day: null, hour: null, minute: null,
    gender: 'male', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, isLeapMonth: false
});
function checkCalendarLibrary() {
    if (typeof window.Lunar === 'function' || (typeof window.Lunar === 'object' && window.Lunar !== null && typeof window.Lunar.fromDate === 'function')) {
        activeCalendarLib.value = 'lunarJS_latest_core_only';
        isCalendarLibFullyAvailable.value = false;
        try {
            const lunarDate = window.Lunar.fromDate(new Date());
            if (lunarDate && typeof lunarDate.getEightChar === 'function') {
                const eightChar = lunarDate.getEightChar();
                if (eightChar && typeof eightChar.getYun === 'function') {
                    activeCalendarLib.value = 'lunarJS_latest_full';
                    isCalendarLibFullyAvailable.value = true;
                    calendarLibLoadErrorText.value = '';
                }
                else {
                    calendarLibLoadErrorText.value = '日曆庫核心功能可用，但起運等高級功能受限 (getYun方法缺失或EightChar結構不符)。';
                }
            }
            else {
                calendarLibLoadErrorText.value = '日曆庫核心功能可用，但八字結構 (getEightChar) 缺失，導致起運等高級功能受限。';
            }
        }
        catch (e) {
            console.error('Error during API check for lunar-javascript@latest:', e);
            calendarLibLoadErrorText.value = '檢查日曆庫高級功能時出錯。';
            isCalendarLibFullyAvailable.value = false;
        }
        clearTimers();
        updateResultsDisplayBasedOnLibStatus();
    }
}
function handleCalendarCheckTimeout() {
    clearTimers();
    if (typeof window.Lunar === 'object' && typeof window.Solar === 'object' && typeof window.LunarMonth === 'object') {
        checkCalendarLibrary();
    }
    else {
        activeCalendarLib.value = null;
        isCalendarLibFullyAvailable.value = false;
        calendarLibLoadErrorText.value = '核心日曆庫 (lunar-javascript) 加載超時或失敗，大部分功能將無法使用。';
        updateResultsDisplayBasedOnLibStatus();
    }
}
function updateResultsDisplayBasedOnLibStatus() {
    if (activeCalendarLib.value === null) {
        conversionDisplayResult.value = calendarLibLoadErrorText.value;
        parsedBaziResult.value = null;
        parsedTenGodsResult.value = null;
        parsedElementsDistributionResult.value = null;
        parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
    }
    else if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS') && !isCalendarLibFullyAvailable.value) {
        parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
    }
    else if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS') && isCalendarLibFullyAvailable.value) {
        if (parsedStartLuckResult.value && 'error' in parsedStartLuckResult.value && parsedStartLuckResult.value.error === calendarLibLoadErrorText.value) {
            parsedStartLuckResult.value = null;
        }
    }
}
onMounted(() => {
    let storedUserId = sessionStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
        storedUserId = crypto.randomUUID();
        sessionStorage.setItem(USER_ID_KEY, storedUserId);
    }
    userId.value = storedUserId;
    if (typeof window.Lunar === 'object' && typeof window.Solar === 'object') {
        checkCalendarLibrary();
    }
    else {
        calendarCheckInterval.value = setInterval(checkCalendarLibrary, CHECK_INTERVAL);
        calendarCheckTimeout.value = setTimeout(handleCalendarCheckTimeout, MAX_CHECK_DURATION);
        setTimeout(checkCalendarLibrary, 50);
    }
    loadFormState();
});
const clearTimers = () => {
    if (calendarCheckInterval.value !== null)
        clearInterval(calendarCheckInterval.value);
    if (calendarCheckTimeout.value !== null)
        clearTimeout(calendarCheckTimeout.value);
    calendarCheckInterval.value = null;
    calendarCheckTimeout.value = null;
};
onUnmounted(() => clearTimers());
const saveFormState = () => { try {
    sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
}
catch (error) {
    console.error('保存表單狀態失敗:', error);
} };
const loadFormState = () => {
    try {
        const savedData = sessionStorage.getItem(FORM_STATE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach(key => { if (key in formState) {
                formState[key] = parsedData[key];
            } });
        }
    }
    catch (error) {
        console.error('恢復表單狀態失敗:', error);
        sessionStorage.removeItem(FORM_STATE_KEY);
    }
};
watch(formState, saveFormState, { deep: true });
const maxDay = computed(() => {
    if (!activeCalendarLib.value || !formState.year || !formState.month)
        return 31;
    if (formState.calendarType === 'solar') {
        return new Date(formState.year, formState.month, 0).getDate();
    }
    else {
        if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS')) {
            try {
                if (typeof window.LunarMonth !== 'undefined' && window.LunarMonth.fromYm) {
                    const monthForLunarLib = formState.isLeapMonth ? -formState.month : formState.month;
                    const lunarMonth = window.LunarMonth.fromYm(formState.year, monthForLunarLib);
                    return lunarMonth ? lunarMonth.getDayCount() : 30;
                }
                return 30;
            }
            catch (e) {
                return 30;
            }
        }
    }
    return 31;
});
watch(() => formState.calendarType, () => { formState.day = null; if (formState.calendarType === 'solar')
    formState.isLeapMonth = false; });
watch(() => [formState.year, formState.month, formState.isLeapMonth], () => { formState.day = null; });
watch([parsedBaziResult, yearlyFateInput], ([bazi, yearInput]) => {
    if (bazi && yearInput && yearInput >= 1900 && yearInput <= 2200) {
        if (typeof window.Solar !== 'undefined' && typeof window.Lunar !== 'undefined') {
            try {
                const solarOfYear = window.Solar.fromYmd(yearInput, 1, 1);
                const lunarOfYear = solarOfYear.getLunar();
                const yearStem = lunarOfYear.getYearGan();
                const yearBranch = lunarOfYear.getYearZhi();
                if (yearStem && yearBranch) {
                    parsedYearlyInteractionResult.value = YearlyInteractionAnalyzer.analyzeYearlyInteraction(bazi, { stem: yearStem, branch: yearBranch });
                }
                else {
                    parsedYearlyInteractionResult.value = null;
                }
            }
            catch (e) {
                parsedYearlyInteractionResult.value = null;
            }
        }
        else {
            parsedYearlyInteractionResult.value = null;
        }
    }
    else {
        parsedYearlyInteractionResult.value = null;
    }
}, { deep: true });
watch(() => [formState.calendarType, formState.year, formState.month, formState.day, formState.hour, formState.minute, formState.isLeapMonth, formState.gender], async ([calType, year, month, day, hour, minute, isLeap, gender]) => {
    if (!(year && month && day && hour !== null && minute !== null)) {
        conversionDisplayResult.value = '請完整輸入年月日時分。';
        parsedBaziResult.value = null;
        parsedTenGodsResult.value = null;
        parsedElementsDistributionResult.value = null;
        parsedStartLuckResult.value = null;
        return;
    }
    if (!activeCalendarLib.value) {
        conversionDisplayResult.value = calendarLibLoadErrorText.value;
        parsedBaziResult.value = null;
        parsedTenGodsResult.value = null;
        parsedElementsDistributionResult.value = null;
        parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
        return;
    }
    isLoading.value = true;
    conversionDisplayResult.value = '';
    parsedBaziResult.value = null;
    parsedTenGodsResult.value = null;
    parsedElementsDistributionResult.value = null;
    parsedStartLuckResult.value = null;
    baziDisplayResult.value = '';
    tenGodsDisplayResult.value = '';
    elementsDistributionDisplayResult.value = '';
    startLuckDisplayResult.value = '';
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
        let resultText = '';
        let solarForBazi = null;
        let currentLunarDateForLuck = null;
        if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS')) {
            if (typeof window.Lunar === 'undefined' || typeof window.Solar === 'undefined') {
                conversionDisplayResult.value = "lunar-javascript 核心組件未定義。";
                isLoading.value = false;
                return;
            }
            if (calType === 'solar') {
                const solar = window.Solar.fromYmdHms(year, month, day, hour, minute, 0);
                currentLunarDateForLuck = solar.getLunar();
                resultText = `國曆 ${solar.toString()} 轉換為 農曆: ${currentLunarDateForLuck.toString()} (${currentLunarDateForLuck.getYearInGanZhi()}年 ${currentLunarDateForLuck.getMonthInChinese()}月${currentLunarDateForLuck.getDayInChinese()}日 ${currentLunarDateForLuck.getTimeInGanZhi()}時)`;
                solarForBazi = new Date(year, month - 1, day, hour, minute, 0);
            }
            else {
                const currentMonthForLunar = isLeap ? -month : month;
                currentLunarDateForLuck = window.Lunar.fromYmdHms(year, currentMonthForLunar, day, hour, minute, 0);
                const solar = currentLunarDateForLuck.getSolar();
                resultText = `農曆 ${currentLunarDateForLuck.toString(true)} (閏月: ${isLeap}) 轉換為 國曆: ${solar.toString()} (${currentLunarDateForLuck.getTimeInGanZhi()}時)`;
                solarForBazi = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), 0);
            }
        }
        conversionDisplayResult.value = resultText;
        if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS') && solarForBazi) {
            const baziInput = { solarDate: solarForBazi };
            const calculatedBazi = BaziCalculator.calculateBazi(baziInput);
            if (calculatedBazi && currentLunarDateForLuck) {
                // 驗證農曆轉換結果的完整性
                const lunarValidation = FrontendValidator.validateLunarConversion({
                    year: currentLunarDateForLuck.getYear(),
                    month: currentLunarDateForLuck.getMonth(),
                    day: currentLunarDateForLuck.getDay(),
                    yearGan: currentLunarDateForLuck.getYearGan(),
                    yearZhi: currentLunarDateForLuck.getYearZhi(),
                    monthGan: currentLunarDateForLuck.getMonthGan(),
                    monthZhi: currentLunarDateForLuck.getMonthZhi(),
                    dayGan: currentLunarDateForLuck.getDayGan(),
                    dayZhi: currentLunarDateForLuck.getDayZhi(),
                    timeGan: currentLunarDateForLuck.getTimeGan(),
                    timeZhi: currentLunarDateForLuck.getTimeZhi()
                });
                if (!lunarValidation.isValid) {
                    conversionDisplayResult.value = `農曆轉換驗證失敗：${lunarValidation.errors.join('、')}`;
                    parsedBaziResult.value = null;
                    return;
                }
                parsedBaziResult.value = calculatedBazi;
                baziDisplayResult.value = JSON.stringify(calculatedBazi, null, 2);
                const calculatedTenGods = TenGodsCalculator.getMainStemTenGods(calculatedBazi);
                parsedTenGodsResult.value = calculatedTenGods;
                tenGodsDisplayResult.value = JSON.stringify(calculatedTenGods, null, 2);
                const calculatedElements = FiveElementsAnalyzer.calculateElementsDistribution(calculatedBazi);
                parsedElementsDistributionResult.value = calculatedElements;
                elementsDistributionDisplayResult.value = JSON.stringify(calculatedElements, null, 2);
                if (isCalendarLibFullyAvailable.value) {
                    const genderForCalc = gender === 'male' ? 0 : 1;
                    const calculatedStartLuck = FortuneCycleCalculator.calculateStartLuck(currentLunarDateForLuck, genderForCalc);
                    if (calculatedStartLuck) {
                        parsedStartLuckResult.value = calculatedStartLuck;
                        startLuckDisplayResult.value = JSON.stringify(calculatedStartLuck, null, 2);
                    }
                    else {
                        parsedStartLuckResult.value = { error: '起運資訊計算失敗。' };
                        startLuckDisplayResult.value = JSON.stringify({ error: '起運資訊計算失敗。' }, null, 2);
                    }
                }
                else {
                    parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
                }
            }
            else {
                parsedBaziResult.value = null;
                baziDisplayResult.value = '八字排盤失敗 (lunarJS)。';
                parsedStartLuckResult.value = null;
                startLuckDisplayResult.value = '';
            }
        }
    }
    catch (e) {
        console.error("Error during calculations in watch:", e);
        conversionDisplayResult.value = '輸入的日期無效或計算出錯。';
    }
    finally {
        isLoading.value = false;
    }
}, { deep: true, immediate: false });
const chineseHourDisplay = computed(() => {
    if (!isCalendarLibFullyAvailable.value || formState.hour === null)
        return '';
    const chineseHours = ['子時 (23:00-00:59)', '丑時 (01:00-02:59)', '寅時 (03:00-04:59)', '卯時 (05:00-06:59)', '辰時 (07:00-08:59)', '巳時 (09:00-10:59)', '午時 (11:00-12:59)', '未時 (13:00-14:59)', '申時 (15:00-16:59)', '酉時 (17:00-18:59)', '戌時 (19:00-20:59)', '亥時 (21:00-22:59)'];
    let index = Math.floor((formState.hour + 1) / 2);
    if (formState.hour === 0 || formState.hour === 23)
        index = 0;
    else
        index = Math.floor((formState.hour + 1) / 2);
    return chineseHours[index % 12];
});
const handleYearSelectedFromTimeline = (yearInfo) => {
    selectedYearFromTimeline.value = yearInfo;
    yearlyFateInput.value = yearInfo.year;
};
watch(selectedYearFromTimeline, (newVal) => { if (newVal) {
    console.log('Year selected from timeline:', newVal);
} });
const handleSubmit = async () => {
    // 使用統一的前端驗證工具
    const birthDateString = formState.year && formState.month && formState.day
        ? `${formState.year}-${String(formState.month).padStart(2, '0')}-${String(formState.day).padStart(2, '0')}`
        : '';
    const birthTimeString = formState.hour !== null && formState.minute !== null
        ? `${String(formState.hour).padStart(2, '0')}:${String(formState.minute).padStart(2, '0')}`
        : '';
    // 驗證基本輸入資料
    const dateValidation = FrontendValidator.validateBirthDate(birthDateString);
    if (!dateValidation.isValid) {
        alert(dateValidation.errors.join('、'));
        return;
    }
    const timeValidation = FrontendValidator.validateBirthTime(birthTimeString);
    if (!timeValidation.isValid) {
        alert(timeValidation.errors.join('、'));
        return;
    }
    const genderValidation = FrontendValidator.validateGender(formState.gender);
    if (!genderValidation.isValid) {
        alert(genderValidation.errors.join('、'));
        return;
    }
    // 檢查農曆庫是否可用
    const libraryCheck = FrontendValidator.checkLunarLibrary();
    if (!libraryCheck.isValid) {
        alert(libraryCheck.errors.join('、'));
        return;
    }
    if (!activeCalendarLib.value) {
        alert('核心日曆庫未加載，無法提交。');
        return;
    }
    if (!userId.value) {
        let storedUserId = sessionStorage.getItem(USER_ID_KEY);
        if (!storedUserId) {
            storedUserId = crypto.randomUUID();
            sessionStorage.setItem(USER_ID_KEY, storedUserId);
        }
        userId.value = storedUserId;
        if (!userId.value) {
            alert('無法獲取 UserID，請稍後再試。');
            return;
        }
    }
    isLoading.value = true;
    const tempGender = formState.gender;
    formState.gender = tempGender === 'male' ? 'female' : 'male';
    await new Promise(resolve => setTimeout(resolve, 0));
    formState.gender = tempGender;
    await new Promise(resolve => setTimeout(resolve, 0));
    if (!conversionDisplayResult.value || conversionDisplayResult.value.includes('失敗') || conversionDisplayResult.value.includes('無效')) {
        alert('請檢查輸入的日期資訊是否正確並已成功轉換。');
        isLoading.value = false;
        return;
    }
    if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS')) {
        if (!baziDisplayResult.value || baziDisplayResult.value.includes('失敗')) {
            alert('八字排盤失敗，請檢查輸入。');
            isLoading.value = false;
            return;
        }
        if (!tenGodsDisplayResult.value || tenGodsDisplayResult.value.includes('失敗')) {
            alert('十神分析失敗，請檢查輸入。');
            isLoading.value = false;
            return;
        }
        if (!elementsDistributionDisplayResult.value || elementsDistributionDisplayResult.value.includes('失敗')) {
            alert('五行分佈分析失敗，請檢查輸入。');
            isLoading.value = false;
            return;
        }
        if (isCalendarLibFullyAvailable.value && (!startLuckDisplayResult.value || startLuckDisplayResult.value.includes('失敗'))) {
            alert('起運資訊計算失敗，請檢查輸入或日曆庫。');
            isLoading.value = false;
            return;
        }
    }
    try {
        const dataToEmit = { formData: { ...formState } };
        if (activeCalendarLib.value && activeCalendarLib.value.startsWith('lunarJS')) {
            dataToEmit.baziResult = JSON.parse(baziDisplayResult.value);
            dataToEmit.tenGods = JSON.parse(tenGodsDisplayResult.value);
            dataToEmit.elements = JSON.parse(elementsDistributionDisplayResult.value);
            if (isCalendarLibFullyAvailable.value && startLuckDisplayResult.value && !startLuckDisplayResult.value.includes('失敗') && !startLuckDisplayResult.value.includes('受限')) {
                dataToEmit.startLuck = JSON.parse(startLuckDisplayResult.value);
            }
            else {
                dataToEmit.startLuck = { error: startLuckDisplayResult.value || '起運功能受限或計算失敗' };
            }
        }
        emit('submitBaziData', dataToEmit);
    }
    catch (e) {
        console.error("解析結果失敗:", e);
        alert("處理結果時發生錯誤。");
    }
    finally {
        isLoading.value = false;
    }
};
const resetForm = () => {
    formState.calendarType = 'solar';
    formState.year = null;
    formState.month = null;
    formState.day = null;
    formState.hour = null;
    formState.minute = null;
    formState.gender = 'male';
    formState.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formState.isLeapMonth = false;
    conversionDisplayResult.value = '';
    parsedBaziResult.value = null;
    parsedTenGodsResult.value = null;
    parsedElementsDistributionResult.value = null;
    parsedStartLuckResult.value = null;
    yearlyFateInput.value = null;
    parsedYearlyInteractionResult.value = null;
    selectedYearFromTimeline.value = null;
    baziDisplayResult.value = '';
    tenGodsDisplayResult.value = '';
    elementsDistributionDisplayResult.value = '';
    startLuckDisplayResult.value = '';
    try {
        sessionStorage.removeItem(FORM_STATE_KEY);
    }
    catch (error) {
        console.error('清除表單狀態失敗:', error);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['button-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['button-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['conversion-result']} */ ;
/** @type {__VLS_StyleScopedClasses['conversion-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user-input-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-input-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.activeCalendarLib === null) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group error-banner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.calendarLibLoadErrorText);
}
else if (!__VLS_ctx.isCalendarLibFullyAvailable && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group error-banner" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.calendarLibLoadErrorText);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.formState.calendarType),
    disabled: (__VLS_ctx.activeCalendarLib === null),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "solar",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "lunar",
    disabled: (__VLS_ctx.activeCalendarLib === null),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "year",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "year",
});
(__VLS_ctx.formState.year);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "month",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "month",
    min: "1",
    max: "12",
});
(__VLS_ctx.formState.month);
if (__VLS_ctx.formState.calendarType === 'lunar' && __VLS_ctx.activeCalendarLib !== null) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "isLeapMonth",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
        id: "isLeapMonth",
    });
    (__VLS_ctx.formState.isLeapMonth);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "day",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "day",
    min: "1",
    max: (__VLS_ctx.maxDay),
});
(__VLS_ctx.formState.day);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "hour",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "hour",
    min: "0",
    max: "23",
});
(__VLS_ctx.formState.hour);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "minute",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "minute",
    min: "0",
    max: "59",
});
(__VLS_ctx.formState.minute);
if (__VLS_ctx.chineseHourDisplay && __VLS_ctx.isCalendarLibFullyAvailable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.chineseHourDisplay);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.formState.gender),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "male",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "female",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "timezone",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "timezone",
    value: (__VLS_ctx.formState.timezone),
});
for (const [tz] of __VLS_getVForSourceType((__VLS_ctx.timezones))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (tz.value),
        value: (tz.value),
    });
    (tz.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    disabled: (__VLS_ctx.isLoading),
});
(__VLS_ctx.isLoading ? '計算中...' : '提交排盤');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetForm) },
    type: "button",
    ...{ class: "button-secondary" },
    disabled: (__VLS_ctx.isLoading),
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "yearlyFate",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    id: "yearlyFate",
    placeholder: "例如 2024",
    disabled: (!__VLS_ctx.parsedBaziResult || __VLS_ctx.isLoading),
});
(__VLS_ctx.yearlyFateInput);
if (__VLS_ctx.formState.year && __VLS_ctx.parsedBaziResult) {
    /** @type {[typeof YearlyFateTimeline, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(YearlyFateTimeline, new YearlyFateTimeline({
        ...{ 'onYearSelected': {} },
        birthYear: (__VLS_ctx.formState.year),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onYearSelected': {} },
        birthYear: (__VLS_ctx.formState.year),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onYearSelected: (__VLS_ctx.handleYearSelectedFromTimeline)
    };
    var __VLS_2;
}
if (__VLS_ctx.parsedYearlyInteractionResult && __VLS_ctx.yearlyFateInput) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yearly-interaction-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.yearlyFateInput);
    if (__VLS_ctx.parsedYearlyInteractionResult.yearStemInteractions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [interaction, index] of __VLS_getVForSourceType((__VLS_ctx.parsedYearlyInteractionResult.yearStemInteractions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: ('stem-' + index),
            });
            (interaction.description);
        }
    }
    if (__VLS_ctx.parsedYearlyInteractionResult.yearBranchInteractions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [interaction, index] of __VLS_getVForSourceType((__VLS_ctx.parsedYearlyInteractionResult.yearBranchInteractions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: ('branch-' + index),
            });
            (interaction.pillarName);
            (interaction.pillarBranch);
            (interaction.relations.relationDescription || '無特殊關係');
        }
    }
    if (__VLS_ctx.parsedYearlyInteractionResult.significantInteractions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [highlight, index] of __VLS_getVForSourceType((__VLS_ctx.parsedYearlyInteractionResult.significantInteractions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: ('highlight-' + index),
            });
            (highlight);
        }
    }
    if (!__VLS_ctx.parsedYearlyInteractionResult.yearStemInteractions.length && !__VLS_ctx.parsedYearlyInteractionResult.yearBranchInteractions.length && !__VLS_ctx.parsedYearlyInteractionResult.significantInteractions.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
}
if (__VLS_ctx.conversionDisplayResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "conversion-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.conversionDisplayResult);
}
if (__VLS_ctx.parsedBaziResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bazi-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillars-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillar-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.yearPillar.stem);
    (__VLS_ctx.parsedBaziResult.yearPillar.stemElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.yearPillar.branch);
    (__VLS_ctx.parsedBaziResult.yearPillar.branchElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillar-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.monthPillar.stem);
    (__VLS_ctx.parsedBaziResult.monthPillar.stemElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.monthPillar.branch);
    (__VLS_ctx.parsedBaziResult.monthPillar.branchElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillar-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.dayPillar.stem);
    (__VLS_ctx.parsedBaziResult.dayPillar.stemElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.dayPillar.branch);
    (__VLS_ctx.parsedBaziResult.dayPillar.branchElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pillar-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.hourPillar.stem);
    (__VLS_ctx.parsedBaziResult.hourPillar.stemElement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.parsedBaziResult.hourPillar.branch);
    (__VLS_ctx.parsedBaziResult.hourPillar.branchElement);
}
if (__VLS_ctx.parsedBaziResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    /** @type {[typeof BaziChart, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(BaziChart, new BaziChart({
        bazi: (__VLS_ctx.parsedBaziResult),
        tenGods: (__VLS_ctx.parsedTenGodsResult),
    }));
    const __VLS_8 = __VLS_7({
        bazi: (__VLS_ctx.parsedBaziResult),
        tenGods: (__VLS_ctx.parsedTenGodsResult),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
}
if (__VLS_ctx.parsedTenGodsResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ten-gods-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ten-gods-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "god-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.parsedTenGodsResult.yearStemGod);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "god-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.parsedTenGodsResult.monthStemGod);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "god-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.parsedTenGodsResult.dayStemGod);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "god-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.parsedTenGodsResult.hourStemGod);
}
if (__VLS_ctx.parsedElementsDistributionResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "elements-distribution-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    for (const [count, element] of __VLS_getVForSourceType((__VLS_ctx.parsedElementsDistributionResult))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (element),
        });
        (element);
        (count);
    }
}
if (__VLS_ctx.parsedElementsDistributionResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    /** @type {[typeof ElementsChart, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(ElementsChart, new ElementsChart({
        distribution: (__VLS_ctx.parsedElementsDistributionResult),
    }));
    const __VLS_11 = __VLS_10({
        distribution: (__VLS_ctx.parsedElementsDistributionResult),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
}
if (__VLS_ctx.parsedStartLuckResult && __VLS_ctx.activeCalendarLib && __VLS_ctx.activeCalendarLib.startsWith('lunarJS')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "start-luck-result section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    if ('error' in __VLS_ctx.parsedStartLuckResult) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.parsedStartLuckResult.error);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.parsedStartLuckResult.age);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.parsedStartLuckResult.year);
    }
}
/** @type {__VLS_StyleScopedClasses['user-input-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['button-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['yearly-interaction-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['conversion-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['bazi-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillars-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pillar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ten-gods-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['god-item']} */ ;
/** @type {__VLS_StyleScopedClasses['god-item']} */ ;
/** @type {__VLS_StyleScopedClasses['god-item']} */ ;
/** @type {__VLS_StyleScopedClasses['god-item']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-distribution-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['start-luck-result']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaziChart: BaziChart,
            ElementsChart: ElementsChart,
            YearlyFateTimeline: YearlyFateTimeline,
            conversionDisplayResult: conversionDisplayResult,
            parsedBaziResult: parsedBaziResult,
            parsedTenGodsResult: parsedTenGodsResult,
            parsedElementsDistributionResult: parsedElementsDistributionResult,
            parsedStartLuckResult: parsedStartLuckResult,
            yearlyFateInput: yearlyFateInput,
            parsedYearlyInteractionResult: parsedYearlyInteractionResult,
            activeCalendarLib: activeCalendarLib,
            isCalendarLibFullyAvailable: isCalendarLibFullyAvailable,
            calendarLibLoadErrorText: calendarLibLoadErrorText,
            isLoading: isLoading,
            timezones: timezones,
            formState: formState,
            maxDay: maxDay,
            chineseHourDisplay: chineseHourDisplay,
            handleYearSelectedFromTimeline: handleYearSelectedFromTimeline,
            handleSubmit: handleSubmit,
            resetForm: resetForm,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=UserInputForm.vue.js.map