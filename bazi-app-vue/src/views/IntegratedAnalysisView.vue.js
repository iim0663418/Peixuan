/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection, Delete, Loading, Star, Document, TrendCharts } from '@element-plus/icons-vue';
import IntegratedAnalysisDisplay from '@/components/IntegratedAnalysisDisplay.vue';
import AstrologyIntegrationService from '@/services/astrologyIntegrationService';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();
// 創建分析狀態
const analysisState = AstrologyIntegrationService.createReactiveAnalysis();
// 監視分析結果變化，用於調試
watch(() => analysisState.integratedAnalysis.value, (newVal) => {
    if (newVal) {
        console.log('IntegratedAnalysisView - 分析結果更新:', newVal);
    }
});
// 生成或獲取表單資料
const birthInfo = reactive({
    birthDate: '',
    birthTime: '',
    gender: 'male',
    location: '台北市'
});
// 創建位置輸入值響應式變數
const locationInputValue = ref(typeof birthInfo.location === 'string'
    ? birthInfo.location
    : (birthInfo.location?.name || '台北市'));
// 折疊面板狀態
const activeCollapse = ref('');
// 計算表單完成進度
const formProgress = computed(() => {
    let progress = 0;
    if (birthInfo.birthDate)
        progress += 25;
    if (birthInfo.birthTime)
        progress += 25;
    if (birthInfo.gender)
        progress += 25;
    if (locationInputValue.value && locationInputValue.value.trim())
        progress += 25;
    return progress;
});
// 檢查是否有已保存的八字資料
const hasSavedBaziData = computed(() => {
    const savedBaziChart = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_CHART);
    const savedBaziInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
    return !!(savedBaziChart || savedBaziInfo);
});
// 檢查各種命盤資料的存在狀態
const chartDataStatus = computed(() => {
    const bazi = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_CHART);
    const purpleStar = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART);
    const integrated = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
    const transformationStars = storageService.getTransformationStarsData();
    return {
        bazi: !!bazi,
        purpleStar: !!purpleStar,
        integrated: !!integrated,
        transformationStars: transformationStars.stars || Object.keys(transformationStars.flows).length > 0,
        total: [bazi, purpleStar, integrated, transformationStars.stars].filter(Boolean).length
    };
});
// 獲取統一會話資料摘要
const sessionDataSummary = computed(() => {
    try {
        const unifiedData = enhancedStorageService.getUnifiedSessionData();
        if (unifiedData) {
            return {
                sessionId: unifiedData.sessionId,
                lastUpdated: new Date(unifiedData.lastUpdated).toLocaleString('zh-TW'),
                chartsAvailable: Object.values(unifiedData.status).filter(Boolean).length,
                validationStatus: unifiedData.validationStatus
            };
        }
    }
    catch (error) {
        console.error('獲取會話資料摘要時出錯:', error);
    }
    return null;
});
// 處理位置輸入變更
const handleLocationInput = (value) => {
    birthInfo.location = value;
};
// 使用已有的八字資料
const useBaziData = () => {
    const savedBaziInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
    if (savedBaziInfo) {
        birthInfo.birthDate = savedBaziInfo.birthDate || '';
        birthInfo.birthTime = savedBaziInfo.birthTime || '';
        birthInfo.gender = savedBaziInfo.gender || 'male';
        birthInfo.location = savedBaziInfo.location || '台北市';
        locationInputValue.value = typeof savedBaziInfo.location === 'string'
            ? savedBaziInfo.location
            : (savedBaziInfo.location?.name || '台北市');
        ElMessage.success('已載入現有八字資料');
        // 同步到整合分析的出生資訊存儲
        storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO, savedBaziInfo);
        // 使用增強存儲服務同步資料
        try {
            enhancedStorageService.syncChartsToUnifiedData();
        }
        catch (syncError) {
            console.error('同步資料時出錯:', syncError);
        }
        // 自動提交分析
        setTimeout(() => {
            submitAnalysis();
        }, 500);
    }
};
const formRules = {
    birthDate: [
        { required: true, message: '請選擇出生日期', trigger: 'change' }
    ],
    birthTime: [
        { required: true, message: '請選擇出生時間', trigger: 'change' }
    ],
    gender: [
        { required: true, message: '請選擇性別', trigger: 'change' }
    ]
};
// 資料清除函數
const clearData = () => {
    ElMessageBox.confirm('確定要清除當前的時運分析結果嗎？', '清除資料', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        storageService.clearAnalysisData('integrated');
        analysisState.integratedAnalysis.value = null;
        analysisState.confidenceAssessment.value = null;
        analysisState.error.value = null;
        ElMessage.success('時運分析資料已清除');
    }).catch(() => {
        // 用戶取消操作
    });
};
const submitAnalysis = async (useSessionData = false) => {
    try {
        console.log('提交分析請求，出生資訊:', birthInfo);
        if (!useSessionData) {
            // 保存出生資訊到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO, birthInfo);
            // 同步資料到增強存儲服務
            try {
                enhancedStorageService.syncChartsToUnifiedData();
            }
            catch (syncError) {
                console.error('同步到增強存儲服務時出錯:', syncError);
            }
        }
        // 執行分析，傳入是否使用 sessionStorage 中的資料標識
        await analysisState.analyze(birthInfo, useSessionData);
        // 檢查分析結果
        if (analysisState.integratedAnalysis.value) {
            console.log('分析完成，結果:', analysisState.integratedAnalysis.value);
            // 保存分析結果到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, analysisState.integratedAnalysis.value);
            // 再次同步資料到增強存儲服務
            try {
                enhancedStorageService.syncChartsToUnifiedData();
                enhancedStorageService.validateStorageData();
            }
            catch (syncError) {
                console.error('最終同步時出錯:', syncError);
            }
            ElMessage.success('時運分析完成');
        }
        else {
            console.error('分析完成但沒有結果');
            ElMessage.warning('分析完成但無結果返回');
        }
    }
    catch (error) {
        console.error('分析過程發生錯誤:', error);
        ElMessage.error(error instanceof Error
            ? error.message
            : '分析失敗，請稍後再試');
    }
};
// 從 sessionStorage 加載資料
const loadFromSessionStorage = () => {
    try {
        console.log('開始從 sessionStorage 載入資料');
        // 記錄當前 sessionStorage 狀態
        const keysInStorage = Object.keys(sessionStorage).filter(key => key.startsWith('peixuan_'));
        console.log('sessionStorage 中的相關鍵:', keysInStorage);
        // 檢查出生資訊
        const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
        if (savedBirthInfo) {
            console.log('找到保存的出生資訊');
            // 安全地更新各個字段，添加默認值
            birthInfo.birthDate = savedBirthInfo.birthDate || '';
            birthInfo.birthTime = savedBirthInfo.birthTime || '';
            // 確保性別是正確的類型
            if (savedBirthInfo.gender === 'male' || savedBirthInfo.gender === 'female') {
                birthInfo.gender = savedBirthInfo.gender;
            }
            else {
                birthInfo.gender = 'male'; // 預設值
            }
            // 處理地點資訊
            if (savedBirthInfo.location) {
                if (typeof savedBirthInfo.location === 'string') {
                    birthInfo.location = savedBirthInfo.location;
                    locationInputValue.value = savedBirthInfo.location;
                }
                else if (typeof savedBirthInfo.location === 'object') {
                    const locationName = savedBirthInfo.location.name || '台北市';
                    birthInfo.location = locationName;
                    locationInputValue.value = locationName;
                }
            }
            else {
                birthInfo.location = '台北市'; // 預設值
                locationInputValue.value = '台北市';
            }
        }
        else {
            console.log('未找到保存的出生資訊');
        }
        // 檢查整合分析結果
        const savedAnalysis = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
        console.log('保存的分析結果:', savedAnalysis ? '已找到' : '未找到');
        if (savedAnalysis && analysisState.integratedAnalysis) {
            try {
                // 驗證資料完整性
                if (!savedAnalysis.data || typeof savedAnalysis.data !== 'object') {
                    console.warn('保存的分析結果資料格式不正確，將清除');
                    storageService.clearAnalysisData('integrated');
                    return;
                }
                // 安全地構建符合 IntegratedAnalysisResponse 格式的物件
                const formattedResult = {
                    ...savedAnalysis,
                    // 確保關鍵字段存在
                    success: savedAnalysis.success !== false,
                    data: {
                        ...savedAnalysis.data,
                        // 確保必要的資料結構存在
                        integratedAnalysis: savedAnalysis.data.integratedAnalysis || {},
                        analysisInfo: savedAnalysis.data.analysisInfo || {
                            calculationTime: new Date().toISOString(),
                            methodsUsed: ['紫微斗數', '四柱八字'],
                            confidence: 0.5
                        }
                    },
                    meta: savedAnalysis.meta || {
                        userRole: 'user',
                        features: ['sessionStorage'],
                        sources: ['cache']
                    },
                    timestamp: savedAnalysis.timestamp || new Date().toISOString()
                };
                // 設置分析狀態
                analysisState.integratedAnalysis.value = formattedResult;
                console.log('已從 sessionStorage 載入並格式化分析結果');
                // 如果有已保存的分析結果但缺少完整資料，重新分析
                if (savedBirthInfo && formattedResult.data.integratedAnalysis &&
                    Object.keys(formattedResult.data.integratedAnalysis).length === 0) {
                    console.log('檢測到不完整的分析結果，準備重新分析');
                    submitAnalysis(true);
                }
            }
            catch (parseError) {
                console.error('解析儲存的分析結果時出錯:', parseError);
                // 在出現錯誤時清除可能損壞的資料
                storageService.clearAnalysisData('integrated');
            }
        }
        // 使用增強版存儲服務驗證資料
        try {
            console.log('使用增強版存儲服務驗證資料');
            enhancedStorageService.validateStorageData();
        }
        catch (validateError) {
            console.error('驗證資料時出錯:', validateError);
        }
        console.log('從 sessionStorage 載入的整合分析資料總結:', {
            birthInfo: !!savedBirthInfo,
            analysis: !!savedAnalysis
        });
    }
    catch (error) {
        console.error('從 sessionStorage 載入資料時出錯:', error);
        // 出現嚴重錯誤時，清除可能損壞的資料
        storageService.clearAllAstrologyData();
    }
};
// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
    console.log('IntegratedAnalysisView 組件初始化');
    loadFromSessionStorage();
    // 初始化增強存儲服務
    try {
        enhancedStorageService.initializeStorage();
        enhancedStorageService.syncChartsToUnifiedData();
    }
    catch (storageError) {
        console.error('初始化增強存儲服務時出錯:', storageError);
    }
};
// 生命週期鉤子 - 組件掛載時載入資料
onMounted(() => {
    console.log('IntegratedAnalysisView 組件已掛載');
    try {
        setupComponentData();
    }
    catch (error) {
        console.error('組件初始化過程中發生錯誤:', error);
        // 在初始化失敗時嘗試回退到安全狀態
        storageService.clearAnalysisData('integrated');
        ElMessage.warning('資料載入時發生錯誤，已重置分析狀態');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-list']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-status']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-header']} */ ;
/** @type {__VLS_StyleScopedClasses['result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-collapse-item__header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['el-form-item__label']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "integrated-analysis-container" },
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
    xs: (24),
    sm: (24),
    md: (24),
    lg: (24),
    xl: (24),
    ...{ class: "mb-4" },
}));
const __VLS_6 = __VLS_5({
    xs: (24),
    sm: (24),
    md: (24),
    lg: (24),
    xl: (24),
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    shadow: "hover",
    ...{ class: "description-card" },
}));
const __VLS_10 = __VLS_9({
    shadow: "hover",
    ...{ class: "description-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-title" },
    });
    if (__VLS_ctx.analysisState.integratedAnalysis.value) {
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
    ...{ class: "analysis-description" },
});
const __VLS_20 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.activeCollapse),
    accordion: true,
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.activeCollapse),
    accordion: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "系統介紹",
    name: "description",
}));
const __VLS_26 = __VLS_25({
    title: "系統介紹",
    name: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('astrology.integrated_analysis.description'));
var __VLS_27;
const __VLS_28 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    title: "運作原理",
    name: "howItWorks",
}));
const __VLS_30 = __VLS_29({
    title: "運作原理",
    name: "howItWorks",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
(__VLS_ctx.$t('astrology.integrated_analysis.howItWorks.title'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.ol, __VLS_intrinsicElements.ol)({
    ...{ class: "steps-list" },
});
for (const [step, index] of __VLS_getVForSourceType((__VLS_ctx.$t('astrology.integrated_analysis.howItWorks.steps')))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
    });
    (step);
}
var __VLS_31;
const __VLS_32 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    title: "系統優勢",
    name: "benefits",
}));
const __VLS_34 = __VLS_33({
    title: "系統優勢",
    name: "benefits",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "benefits-list" },
});
for (const [benefit, index] of __VLS_getVForSourceType((__VLS_ctx.$t('features.integrated_analysis.benefits')))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
    });
    (benefit);
}
var __VLS_35;
var __VLS_23;
if (__VLS_ctx.hasSavedBaziData || __VLS_ctx.chartDataStatus.total > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-actions" },
    });
    const __VLS_36 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        title: "💡 提示",
        description: (`檢測到 ${__VLS_ctx.chartDataStatus.total} 項命盤資料，您可以快速使用現有資料進行分析`),
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mb-3" },
    }));
    const __VLS_38 = __VLS_37({
        title: "💡 提示",
        description: (`檢測到 ${__VLS_ctx.chartDataStatus.total} 項命盤資料，您可以快速使用現有資料進行分析`),
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mb-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-status mb-3" },
    });
    const __VLS_40 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        gutter: (8),
    }));
    const __VLS_42 = __VLS_41({
        gutter: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    if (__VLS_ctx.chartDataStatus.bazi) {
        const __VLS_44 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            span: (6),
        }));
        const __VLS_46 = __VLS_45({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        const __VLS_48 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            type: "success",
            effect: "light",
            size: "small",
        }));
        const __VLS_50 = __VLS_49({
            type: "success",
            effect: "light",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        var __VLS_51;
        var __VLS_47;
    }
    if (__VLS_ctx.chartDataStatus.purpleStar) {
        const __VLS_52 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            span: (6),
        }));
        const __VLS_54 = __VLS_53({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        const __VLS_56 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            type: "primary",
            effect: "light",
            size: "small",
        }));
        const __VLS_58 = __VLS_57({
            type: "primary",
            effect: "light",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        var __VLS_59;
        var __VLS_55;
    }
    if (__VLS_ctx.chartDataStatus.transformationStars) {
        const __VLS_60 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            span: (6),
        }));
        const __VLS_62 = __VLS_61({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            type: "warning",
            effect: "light",
            size: "small",
        }));
        const __VLS_66 = __VLS_65({
            type: "warning",
            effect: "light",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        var __VLS_67;
        var __VLS_63;
    }
    if (__VLS_ctx.chartDataStatus.integrated) {
        const __VLS_68 = {}.ElCol;
        /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            span: (6),
        }));
        const __VLS_70 = __VLS_69({
            span: (6),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        const __VLS_72 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            type: "danger",
            effect: "light",
            size: "small",
        }));
        const __VLS_74 = __VLS_73({
            type: "danger",
            effect: "light",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        var __VLS_75;
        var __VLS_71;
    }
    var __VLS_43;
    if (__VLS_ctx.sessionDataSummary) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "session-summary mb-3" },
        });
        const __VLS_76 = {}.ElDescriptions;
        /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            column: (2),
            size: "small",
            border: true,
        }));
        const __VLS_78 = __VLS_77({
            column: (2),
            size: "small",
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        const __VLS_80 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            label: "會話ID",
        }));
        const __VLS_82 = __VLS_81({
            label: "會話ID",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        (__VLS_ctx.sessionDataSummary.sessionId.slice(-8));
        var __VLS_83;
        const __VLS_84 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            label: "最後更新",
        }));
        const __VLS_86 = __VLS_85({
            label: "最後更新",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        (__VLS_ctx.sessionDataSummary.lastUpdated);
        var __VLS_87;
        const __VLS_88 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            label: "可用命盤",
        }));
        const __VLS_90 = __VLS_89({
            label: "可用命盤",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        (__VLS_ctx.sessionDataSummary.chartsAvailable);
        var __VLS_91;
        const __VLS_92 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            label: "資料狀態",
        }));
        const __VLS_94 = __VLS_93({
            label: "資料狀態",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        const __VLS_96 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            type: (__VLS_ctx.sessionDataSummary.validationStatus === 'valid' ? 'success' : 'warning'),
            size: "small",
        }));
        const __VLS_98 = __VLS_97({
            type: (__VLS_ctx.sessionDataSummary.validationStatus === 'valid' ? 'success' : 'warning'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_99.slots.default;
        (__VLS_ctx.sessionDataSummary.validationStatus === 'valid' ? '正常' : '警告');
        var __VLS_99;
        var __VLS_95;
        var __VLS_79;
    }
    if (__VLS_ctx.hasSavedBaziData) {
        const __VLS_100 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onClick': {} },
            type: "success",
            disabled: (__VLS_ctx.analysisState.loading.value),
            size: "small",
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            type: "success",
            disabled: (__VLS_ctx.analysisState.loading.value),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onClick: (__VLS_ctx.useBaziData)
        };
        __VLS_103.slots.default;
        var __VLS_103;
    }
}
var __VLS_11;
var __VLS_7;
var __VLS_3;
const __VLS_108 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    gutter: (20),
    ...{ class: "main-content" },
}));
const __VLS_110 = __VLS_109({
    gutter: (20),
    ...{ class: "main-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (10),
    xl: (8),
}));
const __VLS_114 = __VLS_113({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (10),
    xl: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    shadow: "hover",
    ...{ class: "input-card" },
}));
const __VLS_118 = __VLS_117({
    shadow: "hover",
    ...{ class: "input-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_119.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('astrology.integrated_analysis.inputSection'));
    const __VLS_120 = {}.ElBadge;
    /** @type {[typeof __VLS_components.ElBadge, typeof __VLS_components.elBadge, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        value: (__VLS_ctx.formProgress + '%'),
        type: (__VLS_ctx.formProgress === 100 ? 'success' : 'primary'),
        ...{ class: "progress-badge" },
    }));
    const __VLS_122 = __VLS_121({
        value: (__VLS_ctx.formProgress + '%'),
        type: (__VLS_ctx.formProgress === 100 ? 'success' : 'primary'),
        ...{ class: "progress-badge" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
}
const __VLS_124 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onSubmit': {} },
    ref: "analysisForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
    labelPosition: "top",
}));
const __VLS_126 = __VLS_125({
    ...{ 'onSubmit': {} },
    ref: "analysisForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onSubmit: (__VLS_ctx.submitAnalysis)
};
/** @type {typeof __VLS_ctx.analysisForm} */ ;
var __VLS_132 = {};
__VLS_127.slots.default;
const __VLS_134 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    label: (__VLS_ctx.$t('form.birth_date')),
    prop: "birthDate",
}));
const __VLS_136 = __VLS_135({
    label: (__VLS_ctx.$t('form.birth_date')),
    prop: "birthDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
__VLS_137.slots.default;
const __VLS_138 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('form.birth_date')),
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
    size: "large",
}));
const __VLS_140 = __VLS_139({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('form.birth_date')),
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
var __VLS_137;
const __VLS_142 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    label: (__VLS_ctx.$t('form.birth_time')),
    prop: "birthTime",
}));
const __VLS_144 = __VLS_143({
    label: (__VLS_ctx.$t('form.birth_time')),
    prop: "birthTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
const __VLS_146 = {}.ElTimePicker;
/** @type {[typeof __VLS_components.ElTimePicker, typeof __VLS_components.elTimePicker, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
    ...{ style: {} },
    size: "large",
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
    ...{ style: {} },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
var __VLS_145;
const __VLS_150 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    label: (__VLS_ctx.$t('form.gender')),
    prop: "gender",
}));
const __VLS_152 = __VLS_151({
    label: (__VLS_ctx.$t('form.gender')),
    prop: "gender",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    modelValue: (__VLS_ctx.birthInfo.gender),
    size: "large",
}));
const __VLS_156 = __VLS_155({
    modelValue: (__VLS_ctx.birthInfo.gender),
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    value: ('male'),
}));
const __VLS_160 = __VLS_159({
    value: ('male'),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
(__VLS_ctx.$t('form.genderOptions.male'));
var __VLS_161;
const __VLS_162 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    value: ('female'),
}));
const __VLS_164 = __VLS_163({
    value: ('female'),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
(__VLS_ctx.$t('form.genderOptions.female'));
var __VLS_165;
var __VLS_157;
var __VLS_153;
const __VLS_166 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    label: (__VLS_ctx.$t('form.location')),
    prop: "location",
}));
const __VLS_168 = __VLS_167({
    label: (__VLS_ctx.$t('form.location')),
    prop: "location",
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
const __VLS_170 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.locationInputValue),
    placeholder: ('例如：台北市'),
    size: "large",
    clearable: true,
}));
const __VLS_172 = __VLS_171({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.locationInputValue),
    placeholder: ('例如：台北市'),
    size: "large",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
let __VLS_174;
let __VLS_175;
let __VLS_176;
const __VLS_177 = {
    onInput: (__VLS_ctx.handleLocationInput)
};
var __VLS_173;
var __VLS_169;
const __VLS_178 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    ...{ class: "submit-section" },
}));
const __VLS_180 = __VLS_179({
    ...{ class: "submit-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
__VLS_181.slots.default;
const __VLS_182 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.analysisState.loading.value),
    size: "large",
    ...{ class: "submit-button" },
}));
const __VLS_184 = __VLS_183({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.analysisState.loading.value),
    size: "large",
    ...{ class: "submit-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
let __VLS_186;
let __VLS_187;
let __VLS_188;
const __VLS_189 = {
    onClick: (...[$event]) => {
        __VLS_ctx.submitAnalysis();
    }
};
__VLS_185.slots.default;
if (__VLS_ctx.analysisState.loading.value) {
    const __VLS_190 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        ...{ class: "is-loading mr-2" },
    }));
    const __VLS_192 = __VLS_191({
        ...{ class: "is-loading mr-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_193.slots.default;
    const __VLS_194 = {}.Loading;
    /** @type {[typeof __VLS_components.Loading, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({}));
    const __VLS_196 = __VLS_195({}, ...__VLS_functionalComponentArgsRest(__VLS_195));
    var __VLS_193;
}
else {
    (__VLS_ctx.$t('form.submit'));
}
var __VLS_185;
var __VLS_181;
var __VLS_127;
var __VLS_119;
var __VLS_115;
const __VLS_198 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (14),
    xl: (16),
}));
const __VLS_200 = __VLS_199({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (14),
    xl: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
__VLS_201.slots.default;
if (__VLS_ctx.analysisState.integratedAnalysis.value || __VLS_ctx.analysisState.loading.value) {
    const __VLS_202 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        shadow: "hover",
        ...{ class: "result-card" },
    }));
    const __VLS_204 = __VLS_203({
        shadow: "hover",
        ...{ class: "result-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    __VLS_205.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_205.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        if (__VLS_ctx.analysisState.integratedAnalysis.value) {
            const __VLS_206 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
                type: "success",
                effect: "light",
                size: "small",
            }));
            const __VLS_208 = __VLS_207({
                type: "success",
                effect: "light",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_207));
            __VLS_209.slots.default;
            var __VLS_209;
        }
    }
    /** @type {[typeof IntegratedAnalysisDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(IntegratedAnalysisDisplay, new IntegratedAnalysisDisplay({
        integratedAnalysis: (__VLS_ctx.analysisState.integratedAnalysis.value),
        loading: (__VLS_ctx.analysisState.loading.value),
        error: (__VLS_ctx.analysisState.error.value),
    }));
    const __VLS_211 = __VLS_210({
        integratedAnalysis: (__VLS_ctx.analysisState.integratedAnalysis.value),
        loading: (__VLS_ctx.analysisState.loading.value),
        error: (__VLS_ctx.analysisState.error.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    var __VLS_205;
}
else {
    const __VLS_213 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        shadow: "hover",
        ...{ class: "placeholder-card" },
    }));
    const __VLS_215 = __VLS_214({
        shadow: "hover",
        ...{ class: "placeholder-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    __VLS_216.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "placeholder" },
    });
    const __VLS_217 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        size: (64),
        color: "#c0c4cc",
    }));
    const __VLS_219 = __VLS_218({
        size: (64),
        color: "#c0c4cc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    __VLS_220.slots.default;
    const __VLS_221 = {}.Connection;
    /** @type {[typeof __VLS_components.Connection, ]} */ ;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({}));
    const __VLS_223 = __VLS_222({}, ...__VLS_functionalComponentArgsRest(__VLS_222));
    var __VLS_220;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "sub-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-preview" },
    });
    const __VLS_225 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
        gutter: (12),
    }));
    const __VLS_227 = __VLS_226({
        gutter: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    const __VLS_229 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
        span: (8),
    }));
    const __VLS_231 = __VLS_230({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    __VLS_232.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-item" },
    });
    const __VLS_233 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        color: "#409EFF",
    }));
    const __VLS_235 = __VLS_234({
        color: "#409EFF",
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    __VLS_236.slots.default;
    const __VLS_237 = {}.Star;
    /** @type {[typeof __VLS_components.Star, ]} */ ;
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({}));
    const __VLS_239 = __VLS_238({}, ...__VLS_functionalComponentArgsRest(__VLS_238));
    var __VLS_236;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_232;
    const __VLS_241 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        span: (8),
    }));
    const __VLS_243 = __VLS_242({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    __VLS_244.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-item" },
    });
    const __VLS_245 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
        color: "#67C23A",
    }));
    const __VLS_247 = __VLS_246({
        color: "#67C23A",
    }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    __VLS_248.slots.default;
    const __VLS_249 = {}.Document;
    /** @type {[typeof __VLS_components.Document, ]} */ ;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({}));
    const __VLS_251 = __VLS_250({}, ...__VLS_functionalComponentArgsRest(__VLS_250));
    var __VLS_248;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_244;
    const __VLS_253 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        span: (8),
    }));
    const __VLS_255 = __VLS_254({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    __VLS_256.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-item" },
    });
    const __VLS_257 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
        color: "#E6A23C",
    }));
    const __VLS_259 = __VLS_258({
        color: "#E6A23C",
    }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    __VLS_260.slots.default;
    const __VLS_261 = {}.TrendCharts;
    /** @type {[typeof __VLS_components.TrendCharts, ]} */ ;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({}));
    const __VLS_263 = __VLS_262({}, ...__VLS_functionalComponentArgsRest(__VLS_262));
    var __VLS_260;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_256;
    var __VLS_228;
    var __VLS_216;
}
var __VLS_201;
var __VLS_111;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['description-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-description']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-status']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['session-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['input-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-header']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-section']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-header']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-card']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-text']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
// @ts-ignore
var __VLS_133 = __VLS_132;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Connection: Connection,
            Delete: Delete,
            Loading: Loading,
            Star: Star,
            Document: Document,
            TrendCharts: TrendCharts,
            IntegratedAnalysisDisplay: IntegratedAnalysisDisplay,
            analysisState: analysisState,
            birthInfo: birthInfo,
            locationInputValue: locationInputValue,
            activeCollapse: activeCollapse,
            formProgress: formProgress,
            hasSavedBaziData: hasSavedBaziData,
            chartDataStatus: chartDataStatus,
            sessionDataSummary: sessionDataSummary,
            handleLocationInput: handleLocationInput,
            useBaziData: useBaziData,
            formRules: formRules,
            clearData: clearData,
            submitAnalysis: submitAnalysis,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=IntegratedAnalysisView.vue.js.map