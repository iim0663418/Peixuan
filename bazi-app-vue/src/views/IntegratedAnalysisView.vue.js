/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { reactive, ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection, Delete } from '@element-plus/icons-vue';
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
// 生成或獲取表單數據
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
// 處理位置輸入變更
const handleLocationInput = (value) => {
    birthInfo.location = value;
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
// 數據清除函數
const clearData = () => {
    ElMessageBox.confirm('確定要清除當前的時運分析結果嗎？', '清除數據', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        storageService.clearAnalysisData('integrated');
        analysisState.integratedAnalysis.value = null;
        analysisState.confidenceAssessment.value = null;
        analysisState.error.value = null;
        ElMessage.success('時運分析數據已清除');
    }).catch(() => {
        // 用戶取消操作
    });
};
const submitAnalysis = async (useSessionData = false) => {
    try {
        console.log('提交分析請求，出生信息:', birthInfo);
        if (!useSessionData) {
            // 保存出生資訊到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO, birthInfo);
        }
        // 執行分析，傳入是否使用 sessionStorage 中的數據標識
        await analysisState.analyze(birthInfo, useSessionData);
        // 檢查分析結果
        if (analysisState.integratedAnalysis.value) {
            console.log('分析完成，結果:', analysisState.integratedAnalysis.value);
            // 保存分析結果到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, analysisState.integratedAnalysis.value);
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
// 從 sessionStorage 加載數據
const loadFromSessionStorage = () => {
    try {
        console.log('開始從 sessionStorage 載入數據');
        // 記錄當前 sessionStorage 狀態
        const keysInStorage = Object.keys(sessionStorage).filter(key => key.startsWith('peixuan_'));
        console.log('sessionStorage 中的相關鍵:', keysInStorage);
        // 檢查出生信息
        const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
        if (savedBirthInfo) {
            console.log('找到保存的出生信息');
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
            console.log('未找到保存的出生信息');
        }
        // 檢查整合分析結果
        const savedAnalysis = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
        console.log('保存的分析結果:', savedAnalysis ? '已找到' : '未找到');
        if (savedAnalysis && analysisState.integratedAnalysis) {
            try {
                // 驗證數據完整性
                if (!savedAnalysis.data || typeof savedAnalysis.data !== 'object') {
                    console.warn('保存的分析結果數據格式不正確，將清除');
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
                        // 確保必要的數據結構存在
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
                // 如果有已保存的分析結果但缺少完整數據，重新分析
                if (savedBirthInfo && formattedResult.data.integratedAnalysis &&
                    Object.keys(formattedResult.data.integratedAnalysis).length === 0) {
                    console.log('檢測到不完整的分析結果，準備重新分析');
                    submitAnalysis(true);
                }
            }
            catch (parseError) {
                console.error('解析儲存的分析結果時出錯:', parseError);
                // 在出現錯誤時清除可能損壞的數據
                storageService.clearAnalysisData('integrated');
            }
        }
        // 使用增強版存儲服務驗證數據
        try {
            console.log('使用增強版存儲服務驗證數據');
            enhancedStorageService.validateStorageData();
        }
        catch (validateError) {
            console.error('驗證數據時出錯:', validateError);
        }
        console.log('從 sessionStorage 載入的整合分析數據總結:', {
            birthInfo: !!savedBirthInfo,
            analysis: !!savedAnalysis
        });
    }
    catch (error) {
        console.error('從 sessionStorage 載入數據時出錯:', error);
        // 出現嚴重錯誤時，清除可能損壞的數據
        storageService.clearAllAstrologyData();
    }
};
// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
    console.log('IntegratedAnalysisView 組件初始化');
    loadFromSessionStorage();
};
// 生命週期鉤子 - 組件掛載時載入數據
onMounted(() => {
    console.log('IntegratedAnalysisView 組件已掛載');
    try {
        setupComponentData();
    }
    catch (error) {
        console.error('組件初始化過程中發生錯誤:', error);
        // 在初始化失敗時嘗試回退到安全狀態
        storageService.clearAnalysisData('integrated');
        ElMessage.warning('數據載入時發生錯誤，已重置分析狀態');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['steps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('astrology.integrated_analysis.description'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "benefits-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
for (const [benefit, index] of __VLS_getVForSourceType((__VLS_ctx.$t('features.integrated_analysis.benefits')))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
    });
    (benefit);
}
var __VLS_11;
var __VLS_7;
const __VLS_20 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (12),
}));
const __VLS_22 = __VLS_21({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    shadow: "hover",
}));
const __VLS_26 = __VLS_25({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_27.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('astrology.integrated_analysis.inputSection'));
}
const __VLS_28 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onSubmit': {} },
    ref: "analysisForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onSubmit': {} },
    ref: "analysisForm",
    model: (__VLS_ctx.birthInfo),
    rules: (__VLS_ctx.formRules),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onSubmit: (__VLS_ctx.submitAnalysis)
};
/** @type {typeof __VLS_ctx.analysisForm} */ ;
var __VLS_36 = {};
__VLS_31.slots.default;
const __VLS_38 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    label: (__VLS_ctx.$t('form.birth_date')),
    prop: "birthDate",
}));
const __VLS_40 = __VLS_39({
    label: (__VLS_ctx.$t('form.birth_date')),
    prop: "birthDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('form.birth_date')),
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.birthInfo.birthDate),
    type: "date",
    placeholder: (__VLS_ctx.$t('form.birth_date')),
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_41;
const __VLS_46 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: (__VLS_ctx.$t('form.birth_time')),
    prop: "birthTime",
}));
const __VLS_48 = __VLS_47({
    label: (__VLS_ctx.$t('form.birth_time')),
    prop: "birthTime",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElTimePicker;
/** @type {[typeof __VLS_components.ElTimePicker, typeof __VLS_components.elTimePicker, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
    ...{ style: {} },
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.birthInfo.birthTime),
    placeholder: (__VLS_ctx.$t('form.birth_time')),
    format: "HH:mm",
    valueFormat: "HH:mm",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
var __VLS_49;
const __VLS_54 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    label: (__VLS_ctx.$t('form.gender')),
    prop: "gender",
}));
const __VLS_56 = __VLS_55({
    label: (__VLS_ctx.$t('form.gender')),
    prop: "gender",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
const __VLS_58 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    modelValue: (__VLS_ctx.birthInfo.gender),
}));
const __VLS_60 = __VLS_59({
    modelValue: (__VLS_ctx.birthInfo.gender),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
const __VLS_62 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    value: ('male'),
}));
const __VLS_64 = __VLS_63({
    value: ('male'),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
(__VLS_ctx.$t('form.genderOptions.male'));
var __VLS_65;
const __VLS_66 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    value: ('female'),
}));
const __VLS_68 = __VLS_67({
    value: ('female'),
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
(__VLS_ctx.$t('form.genderOptions.female'));
var __VLS_69;
var __VLS_61;
var __VLS_57;
const __VLS_70 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    label: (__VLS_ctx.$t('form.location')),
    prop: "location",
}));
const __VLS_72 = __VLS_71({
    label: (__VLS_ctx.$t('form.location')),
    prop: "location",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
const __VLS_74 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.locationInputValue),
}));
const __VLS_76 = __VLS_75({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.locationInputValue),
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_78;
let __VLS_79;
let __VLS_80;
const __VLS_81 = {
    onInput: (__VLS_ctx.handleLocationInput)
};
var __VLS_77;
var __VLS_73;
const __VLS_82 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({}));
const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_85.slots.default;
const __VLS_86 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.analysisState.loading.value),
    size: "large",
    ...{ style: {} },
}));
const __VLS_88 = __VLS_87({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.analysisState.loading.value),
    size: "large",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_90;
let __VLS_91;
let __VLS_92;
const __VLS_93 = {
    onClick: (...[$event]) => {
        __VLS_ctx.submitAnalysis();
    }
};
__VLS_89.slots.default;
(__VLS_ctx.$t('form.submit'));
var __VLS_89;
var __VLS_85;
var __VLS_31;
var __VLS_27;
var __VLS_23;
const __VLS_94 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    span: (12),
}));
const __VLS_96 = __VLS_95({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
if (__VLS_ctx.analysisState.integratedAnalysis.value || __VLS_ctx.analysisState.loading.value) {
    const __VLS_98 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        shadow: "hover",
    }));
    const __VLS_100 = __VLS_99({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    __VLS_101.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_101.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    /** @type {[typeof IntegratedAnalysisDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(IntegratedAnalysisDisplay, new IntegratedAnalysisDisplay({
        integratedAnalysis: (__VLS_ctx.analysisState.integratedAnalysis.value),
        loading: (__VLS_ctx.analysisState.loading.value),
        error: (__VLS_ctx.analysisState.error.value),
    }));
    const __VLS_103 = __VLS_102({
        integratedAnalysis: (__VLS_ctx.analysisState.integratedAnalysis.value),
        loading: (__VLS_ctx.analysisState.loading.value),
        error: (__VLS_ctx.analysisState.error.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    var __VLS_101;
}
else {
    const __VLS_105 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        shadow: "hover",
    }));
    const __VLS_107 = __VLS_106({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    __VLS_108.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "placeholder" },
    });
    const __VLS_109 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        size: (64),
        color: "#c0c4cc",
    }));
    const __VLS_111 = __VLS_110({
        size: (64),
        color: "#c0c4cc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_112.slots.default;
    const __VLS_113 = {}.Connection;
    /** @type {[typeof __VLS_components.Connection, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({}));
    const __VLS_115 = __VLS_114({}, ...__VLS_functionalComponentArgsRest(__VLS_114));
    var __VLS_112;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "sub-text" },
    });
    var __VLS_108;
}
var __VLS_97;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-description']} */ ;
/** @type {__VLS_StyleScopedClasses['steps-list']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-text']} */ ;
// @ts-ignore
var __VLS_37 = __VLS_36;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Connection: Connection,
            Delete: Delete,
            IntegratedAnalysisDisplay: IntegratedAnalysisDisplay,
            analysisState: analysisState,
            birthInfo: birthInfo,
            locationInputValue: locationInputValue,
            handleLocationInput: handleLocationInput,
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