/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElTabs, ElTabPane } from 'element-plus';
import { Coordinate, Delete } from '@element-plus/icons-vue';
import BaziInputForm from '@/components/BaziInputForm.vue';
import BaziChartDisplay from '@/components/BaziChartDisplay.vue';
import StorageStatusIndicator from '@/components/StorageStatusIndicator.vue';
import { BaziCalculator, TenGodsCalculator, FiveElementsAnalyzer, FortuneCycleCalculator, BaziInterpreter, InterpretationLevel } from '@/utils/baziCalc';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();
const baziChart = ref(null);
const birthInfoRef = ref(null);
const yearFilter = ref(''); // 用於流年過濾
// 過濾流年的計算屬性
const filteredAnnualLuck = computed(() => {
    if (!baziChart.value?.annualLuck)
        return [];
    if (!yearFilter.value.trim()) {
        return baziChart.value.annualLuck;
    }
    const searchTerm = yearFilter.value.trim();
    return baziChart.value.annualLuck.filter(year => year.year.toString().includes(searchTerm));
});
// 數據清除函數
const clearData = () => {
    ElMessageBox.confirm('確定要清除當前的八字計算結果嗎？', '清除數據', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        storageService.clearAnalysisData('bazi');
        baziChart.value = null;
        birthInfoRef.value = null;
        ElMessage.success('八字數據已清除');
    }).catch(() => {
        // 用戶取消操作
    });
};
const handleSubmit = async (birthInfo) => {
    try {
        ElMessage.info('正在計算八字...');
        // 保存出生資訊
        birthInfoRef.value = birthInfo;
        // 保存出生資訊到 sessionStorage
        storageService.saveToStorage(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO, birthInfo);
        // 驗證日期格式
        if (!birthInfo.birthDate || !birthInfo.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('出生日期格式無效，請使用YYYY-MM-DD格式');
        }
        // 驗證時間格式
        if (birthInfo.birthTime && !birthInfo.birthTime.match(/^\d{2}:\d{2}$/)) {
            throw new Error('出生時間格式無效，請使用HH:MM格式');
        }
        // 轉換性別為數字 (0: 男, 1: 女)
        const genderValue = birthInfo.gender === 'male' ? 0 : 1;
        // 轉換 BirthInfo 為 Date 對象
        const solarDate = new Date(birthInfo.birthDate);
        // 檢查日期是否有效
        if (isNaN(solarDate.getTime())) {
            throw new Error('無效的日期：' + birthInfo.birthDate + '，請確保格式為YYYY-MM-DD');
        }
        // 添加時間部分
        if (birthInfo.birthTime) {
            const [hours, minutes] = birthInfo.birthTime.split(':');
            solarDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            // 檢查時間是否有效
            if (isNaN(solarDate.getTime())) {
                throw new Error('無效的時間：' + birthInfo.birthTime + '，請確保格式為HH:MM');
            }
        }
        console.log('用於八字計算的日期物件:', solarDate.toString());
        try {
            // 使用前端八字計算引擎
            const baziResult = BaziCalculator.calculateBazi({ solarDate });
            if (!baziResult) {
                throw new Error('八字計算失敗，請檢查 lunar-javascript 庫是否正確載入');
            }
            // 計算十神和五行分佈
            const mainTenGods = TenGodsCalculator.getMainStemTenGods(baziResult);
            const elementsDistribution = FiveElementsAnalyzer.calculateElementsDistribution(baziResult);
            // 計算起運時間
            const solarObj = Solar.fromDate(solarDate);
            const lunarDate = solarObj.getLunar();
            const startLuckInfo = FortuneCycleCalculator.calculateStartLuck(lunarDate, genderValue);
            // 計算大運
            const decennialCycles = FortuneCycleCalculator.calculateDecennialCycles(baziResult, solarDate, genderValue, 8 // 計算8個大運
            );
            // 為每個大運生成解讀
            decennialCycles.forEach(cycle => {
                cycle.analysis = BaziInterpreter.generateDecennialAnalysis(baziResult, cycle, InterpretationLevel.BASIC);
            });
            // 計算流年（從當前年份開始，30年）
            const currentYear = new Date().getFullYear();
            const annualLuck = FortuneCycleCalculator.calculateAnnualLuck(solarDate, currentYear, 30 // 計算30年的流年
            );
            // 為每個流年生成解讀
            annualLuck.forEach(annual => {
                annual.analysis = BaziInterpreter.generateAnnualAnalysis(baziResult, annual, InterpretationLevel.BASIC);
            });
            // 生成命盤解讀
            const interpretation = BaziInterpreter.generateBasicInterpretation(baziResult);
            // 組裝完整的分析結果
            const fullAnalysis = {
                ...baziResult,
                mainTenGods,
                elementsDistribution,
                startLuckInfo,
                decennialCycles,
                annualLuck,
                interpretation
            };
            baziChart.value = fullAnalysis;
            // 保存命盤數據到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.BAZI_CHART, fullAnalysis);
            ElMessage.success('八字計算完成');
        }
        catch (calcError) {
            console.error('八字計算過程中錯誤:', calcError);
            // 捕獲計算過程中的特定錯誤
            throw new Error(calcError instanceof Error
                ? `八字計算失敗: ${calcError.message}`
                : '八字計算過程中發生未知錯誤，請稍後再試');
        }
    }
    catch (error) {
        console.error('八字表單處理錯誤:', error);
        // 顯示更詳細的錯誤信息
        ElMessage({
            message: error instanceof Error ? error.message : '八字計算失敗，請稍後再試',
            type: 'error',
            duration: 5000,
            showClose: true
        });
    }
};
// 從 sessionStorage 加載數據
const loadFromSessionStorage = () => {
    try {
        console.log('開始從 sessionStorage 載入八字數據');
        // 記錄當前 sessionStorage 狀態
        const keysInStorage = Object.keys(sessionStorage).filter(key => key.startsWith('peixuan_'));
        console.log('sessionStorage 中的相關鍵:', keysInStorage);
        // 檢查出生信息
        const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
        if (savedBirthInfo) {
            console.log('找到保存的八字出生信息');
            birthInfoRef.value = savedBirthInfo;
        }
        else {
            console.log('未找到保存的八字出生信息');
        }
        // 檢查八字命盤
        const savedBaziChart = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_CHART);
        if (savedBaziChart) {
            console.log('找到保存的八字命盤數據');
            try {
                // 進行安全檢查，確保必要屬性存在
                if (!savedBaziChart.yearPillar || !savedBaziChart.monthPillar ||
                    !savedBaziChart.dayPillar || !savedBaziChart.hourPillar) {
                    console.warn('保存的八字命盤數據缺少必要的柱位信息');
                    throw new Error('命盤數據不完整');
                }
                baziChart.value = savedBaziChart;
            }
            catch (parseError) {
                console.error('解析保存的八字命盤數據時出錯:', parseError);
                // 不要設置命盤數據，確保數據完整性
            }
        }
        else {
            console.log('未找到保存的八字命盤數據');
        }
        // 驗證數據一致性
        try {
            console.log('使用增強版存儲服務驗證八字數據');
            enhancedStorageService.validateStorageData();
        }
        catch (validateError) {
            console.error('驗證八字數據時出錯:', validateError);
        }
        console.log('從 sessionStorage 載入的八字數據總結:', {
            birthInfo: !!birthInfoRef.value,
            baziChart: !!baziChart.value
        });
    }
    catch (error) {
        console.error('從 sessionStorage 載入八字數據時出錯:', error);
        // 出現嚴重錯誤時，清除可能損壞的數據
        storageService.clearAnalysisData('bazi');
    }
};
// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
    loadFromSessionStorage();
};
// 生命週期鉤子 - 組件掛載時載入數據
onMounted(() => {
    console.log('BaziView 組件已掛載');
    try {
        setupComponentData();
    }
    catch (error) {
        console.error('八字組件初始化過程中發生錯誤:', error);
        // 在初始化失敗時嘗試回退到安全狀態
        storageService.clearAnalysisData('bazi');
        ElMessage.warning('八字數據載入時發生錯誤，已重置分析狀態');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['bazi-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card__body']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['bazi-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card__body']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['decennial-cycle']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['annual-luck']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "bazi-container" },
});
const __VLS_0 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: (20),
}));
const __VLS_2 = __VLS_1({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    span: (24),
    ...{ class: "mb-4" },
}));
const __VLS_6 = __VLS_5({
    span: (24),
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    shadow: "hover",
}));
const __VLS_10 = __VLS_9({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('astrology.bazi_detail.title'));
    if (__VLS_ctx.baziChart) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "header-actions" },
        });
        const __VLS_12 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            type: "danger",
            icon: (__VLS_ctx.Delete),
            size: "small",
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            type: "danger",
            icon: (__VLS_ctx.Delete),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (__VLS_ctx.clearData)
        };
        __VLS_15.slots.default;
        var __VLS_15;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "view-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('astrology.bazi_detail.description'));
if (__VLS_ctx.baziChart) {
    const __VLS_20 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "💡 提示",
        description: "您可以使用「命運洞悉」功能來獲得八字與紫微斗數的多維度洞察分析",
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mt-3 text-center-alert" },
    }));
    const __VLS_22 = __VLS_21({
        title: "💡 提示",
        description: "您可以使用「命運洞悉」功能來獲得八字與紫微斗數的多維度洞察分析",
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mt-3 text-center-alert" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
/** @type {[typeof StorageStatusIndicator, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(StorageStatusIndicator, new StorageStatusIndicator({
    ...{ class: "mt-3" },
}));
const __VLS_25 = __VLS_24({
    ...{ class: "mt-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_11;
var __VLS_7;
const __VLS_27 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}));
const __VLS_29 = __VLS_28({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
const __VLS_31 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    shadow: "hover",
}));
const __VLS_33 = __VLS_32({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_34.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('astrology.bazi_detail.inputSection'));
}
/** @type {[typeof BaziInputForm, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(BaziInputForm, new BaziInputForm({
    ...{ 'onSubmit': {} },
}));
const __VLS_36 = __VLS_35({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_38;
let __VLS_39;
let __VLS_40;
const __VLS_41 = {
    onSubmit: (__VLS_ctx.handleSubmit)
};
var __VLS_37;
var __VLS_34;
var __VLS_30;
const __VLS_42 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}));
const __VLS_44 = __VLS_43({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
if (__VLS_ctx.baziChart) {
    const __VLS_46 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
        shadow: "hover",
    }));
    const __VLS_48 = __VLS_47({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_49.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_49.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    const __VLS_50 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
    const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_53.slots.default;
    const __VLS_54 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        label: "八字命盤",
    }));
    const __VLS_56 = __VLS_55({
        label: "八字命盤",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    /** @type {[typeof BaziChartDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(BaziChartDisplay, new BaziChartDisplay({
        baziResult: (__VLS_ctx.baziChart),
        tenGods: (__VLS_ctx.baziChart.mainTenGods),
        elementsDistribution: (__VLS_ctx.baziChart.elementsDistribution),
        startLuckInfo: (__VLS_ctx.baziChart.startLuckInfo),
    }));
    const __VLS_59 = __VLS_58({
        baziResult: (__VLS_ctx.baziChart),
        tenGods: (__VLS_ctx.baziChart.mainTenGods),
        elementsDistribution: (__VLS_ctx.baziChart.elementsDistribution),
        startLuckInfo: (__VLS_ctx.baziChart.startLuckInfo),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    var __VLS_57;
    if (__VLS_ctx.baziChart.interpretation) {
        const __VLS_61 = {}.ElTabPane;
        /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            label: "命盤解讀",
        }));
        const __VLS_63 = __VLS_62({
            label: "命盤解讀",
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "interpretation-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.baziChart.interpretation.general);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.baziChart.interpretation.personalityTraits))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (index),
            });
            (trait);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.baziChart.interpretation.career);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.baziChart.interpretation.relationships);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.baziChart.interpretation.health);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "key-ages" },
        });
        for (const [age] of __VLS_getVForSourceType((__VLS_ctx.baziChart.interpretation.keyAges))) {
            const __VLS_65 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                key: (age),
                type: "success",
                effect: "plain",
                ...{ class: "mr-2 mb-2" },
            }));
            const __VLS_67 = __VLS_66({
                key: (age),
                type: "success",
                effect: "plain",
                ...{ class: "mr-2 mb-2" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            __VLS_68.slots.default;
            (age);
            var __VLS_68;
        }
        var __VLS_64;
    }
    if (__VLS_ctx.baziChart.decennialCycles && __VLS_ctx.baziChart.decennialCycles.length > 0) {
        const __VLS_69 = {}.ElTabPane;
        /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            label: "大運",
        }));
        const __VLS_71 = __VLS_70({
            label: "大運",
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        for (const [cycle] of __VLS_getVForSourceType((__VLS_ctx.baziChart.decennialCycles))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (cycle.index),
                ...{ class: "decennial-cycle" },
            });
            const __VLS_73 = {}.ElDivider;
            /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
            // @ts-ignore
            const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({}));
            const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
            __VLS_76.slots.default;
            (cycle.index);
            var __VLS_76;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            (cycle.stem);
            (cycle.branch);
            (cycle.startYear);
            (cycle.endYear);
            (cycle.startAge);
            (cycle.endAge);
            if (cycle.analysis) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (cycle.analysis.overview);
            }
            if (cycle.analysis) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "cycle-details" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (cycle.analysis.career);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (cycle.analysis.wealth);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (cycle.analysis.relationships);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (cycle.analysis.health);
            }
        }
        var __VLS_72;
    }
    if (__VLS_ctx.baziChart.annualLuck && __VLS_ctx.baziChart.annualLuck.length > 0) {
        const __VLS_77 = {}.ElTabPane;
        /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            label: "流年",
        }));
        const __VLS_79 = __VLS_78({
            label: "流年",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_80.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "annual-filter" },
        });
        const __VLS_81 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            modelValue: (__VLS_ctx.yearFilter),
            placeholder: "搜尋年份...",
            clearable: true,
        }));
        const __VLS_83 = __VLS_82({
            modelValue: (__VLS_ctx.yearFilter),
            placeholder: "搜尋年份...",
            clearable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        for (const [year] of __VLS_getVForSourceType((__VLS_ctx.filteredAnnualLuck))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (year.year),
                ...{ class: "annual-luck" },
            });
            const __VLS_85 = {}.ElDivider;
            /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
            const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
            __VLS_88.slots.default;
            (year.year);
            var __VLS_88;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            (year.stem);
            (year.branch);
            (year.age);
            if (year.analysis) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (year.analysis.overview);
            }
            if (year.analysis) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "annual-details" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (year.analysis.focus);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (year.analysis.challenges);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "detail-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (year.analysis.opportunities);
            }
        }
        var __VLS_80;
    }
    var __VLS_53;
    var __VLS_49;
}
else {
    const __VLS_89 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        shadow: "hover",
    }));
    const __VLS_91 = __VLS_90({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "placeholder" },
    });
    const __VLS_93 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        size: (64),
        color: "#c0c4cc",
    }));
    const __VLS_95 = __VLS_94({
        size: (64),
        color: "#c0c4cc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    __VLS_96.slots.default;
    const __VLS_97 = {}.Coordinate;
    /** @type {[typeof __VLS_components.Coordinate, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
    const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
    var __VLS_96;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    var __VLS_92;
}
var __VLS_45;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['bazi-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['view-description']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['key-ages']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['decennial-cycle']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['annual-filter']} */ ;
/** @type {__VLS_StyleScopedClasses['annual-luck']} */ ;
/** @type {__VLS_StyleScopedClasses['annual-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElTabs: ElTabs,
            ElTabPane: ElTabPane,
            Coordinate: Coordinate,
            Delete: Delete,
            BaziInputForm: BaziInputForm,
            BaziChartDisplay: BaziChartDisplay,
            StorageStatusIndicator: StorageStatusIndicator,
            baziChart: baziChart,
            yearFilter: yearFilter,
            filteredAnnualLuck: filteredAnnualLuck,
            clearData: clearData,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=BaziView.vue.js.map