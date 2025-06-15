/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, watch, computed } from 'vue';
import { Loading, Warning, Check, InfoFilled, DataAnalysis, Connection, TrendCharts, Bell, Document, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
const props = withDefaults(defineProps(), {
    integratedAnalysis: null,
    loading: false,
    error: null
});
// 響應式資料
const isMobile = ref(window.innerWidth <= 768);
const confidenceScore = computed(() => getConfidenceValue());
const elementsUpdateKey = ref(0);
const dualityUpdateKey = ref(0);
const isDev = ref(import.meta.env.DEV);
// 監視分析結果變化，用於調試和自動更新
watch(() => props.integratedAnalysis, (newVal, oldVal) => {
    if (newVal) {
        console.log('IntegratedAnalysisDisplay 收到的分析結果:', newVal);
        // 檢查資料結構是否符合預期
        if (!newVal.data?.integratedAnalysis) {
            console.warn('分析結果缺少 data.integratedAnalysis 屬性，這可能是正常的初始狀態:', newVal);
        }
        // 檢查是否有實質性的資料變化
        const hasDataChanged = !oldVal ||
            JSON.stringify(newVal.data) !== JSON.stringify(oldVal.data) ||
            newVal.timestamp !== oldVal.timestamp;
        if (hasDataChanged) {
            console.log('檢測到分析結果實質變化，自動更新顯示內容');
            // 使用 nextTick 確保資料已經更新後再觸發重新渲染
            setTimeout(() => {
                elementsUpdateKey.value++;
                dualityUpdateKey.value++;
                console.log('已觸發五行和分歧分析的重新計算');
            }, 100);
            // 只在有舊資料時顯示更新訊息
            if (oldVal) {
                ElMessage.success('分析內容已自動更新');
            }
        }
    }
}, { immediate: true, deep: true });
// 額外監視特定的資料路徑變化
watch(() => [
    props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings,
    props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings,
    props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis
], (newVals, oldVals) => {
    if (oldVals && newVals && JSON.stringify(newVals) !== JSON.stringify(oldVals)) {
        console.log('檢測到特定資料路徑變化，強制更新');
        elementsUpdateKey.value++;
        dualityUpdateKey.value++;
    }
}, { deep: true });
// 當組件掛載時進行檢查
onMounted(() => {
    console.log('IntegratedAnalysisDisplay 組件掛載，當前分析結果:', props.integratedAnalysis);
});
// 獲取信心度值
const getConfidenceValue = () => {
    try {
        if (!props.integratedAnalysis?.data?.analysisInfo?.confidence) {
            return 0.5; // 默認值
        }
        return props.integratedAnalysis.data.analysisInfo.confidence;
    }
    catch (error) {
        console.warn('獲取信心度值時發生錯誤:', error);
        return 0.5;
    }
};
// 獲取一致性發現
const getConsensusFindings = () => {
    try {
        if (!props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings) {
            return [];
        }
        return props.integratedAnalysis.data.integratedAnalysis.consensusFindings;
    }
    catch (error) {
        console.warn('獲取一致性發現時發生錯誤:', error);
        return [];
    }
};
// 獲取分歧發現 - 使用 computed 讓它具有響應性
const getDivergentFindings = computed(() => {
    try {
        console.log('重新計算分歧分析資料, 完整資料結構:', props.integratedAnalysis);
        // 強制更新響應性
        const _ = dualityUpdateKey.value;
        // 檢查多個可能的資料路徑
        let divergentFindings = [];
        // 路徑1: 直接的 divergentFindings
        if (props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings) {
            divergentFindings = props.integratedAnalysis.data.integratedAnalysis.divergentFindings;
        }
        // 路徑2: 檢查是否有其他分歧相關的屬性
        if (divergentFindings.length === 0 && props.integratedAnalysis?.data?.integratedAnalysis) {
            const analysis = props.integratedAnalysis.data.integratedAnalysis;
            Object.keys(analysis).forEach(key => {
                if (key.includes('divergent') || key.includes('difference') || key.includes('分歧') || key.includes('差異')) {
                    console.log(`找到可能的分歧資料路徑: ${key}`, analysis[key]);
                    if (Array.isArray(analysis[key])) {
                        divergentFindings = analysis[key];
                    }
                    else if (analysis[key]?.findings || analysis[key]?.differences) {
                        divergentFindings = (analysis[key].findings || analysis[key].differences || []);
                    }
                }
            });
        }
        // 路徑3: 從詳細分析中尋找分歧資料
        if (divergentFindings.length === 0 && props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis) {
            const detailedAnalysis = props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis;
            Object.keys(detailedAnalysis).forEach(key => {
                if (detailedAnalysis[key]?.differences) {
                    divergentFindings = [...divergentFindings, ...detailedAnalysis[key].differences];
                }
            });
        }
        // 路徑4: 如果還是沒有找到，嘗試從 consensusFindings 中區分出可能的分歧內容
        if (divergentFindings.length === 0) {
            const consensusFindings = props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings || [];
            // 查找可能表示衝突或分歧的內容
            divergentFindings = consensusFindings.filter(finding => {
                const findingStr = String(finding).toLowerCase();
                return findingStr.includes('但是') || findingStr.includes('然而') ||
                    findingStr.includes('不過') || findingStr.includes('矛盾') ||
                    findingStr.includes('差異') || findingStr.includes('分歧');
            });
        }
        console.log('找到的分歧分析資料:', divergentFindings);
        // 確保返回的是字符串數組
        return divergentFindings.filter(finding => finding && typeof finding === 'string');
    }
    catch (error) {
        console.warn('獲取分歧發現時發生錯誤:', error);
        return [];
    }
});
// 獲取建議
const getRecommendations = () => {
    try {
        if (!props.integratedAnalysis?.data?.integratedAnalysis?.recommendations) {
            return [];
        }
        return props.integratedAnalysis.data.integratedAnalysis.recommendations;
    }
    catch (error) {
        console.warn('獲取建議時發生錯誤:', error);
        return [];
    }
};
// 獲取使用的方法
const getMethodsUsed = () => {
    try {
        if (!props.integratedAnalysis?.data?.analysisInfo?.methodsUsed) {
            return ['紫微斗數', '四柱八字'];
        }
        return props.integratedAnalysis.data.analysisInfo.methodsUsed;
    }
    catch (error) {
        console.warn('獲取使用方法時發生錯誤:', error);
        return ['紫微斗數', '四柱八字'];
    }
};
// 獲取五行分析 - 使用 computed 讓它具有響應性
const getElementsAnalysis = computed(() => {
    try {
        console.log('重新計算五行分析資料, 完整資料結構:', props.integratedAnalysis);
        // 強制更新響應性
        const _ = elementsUpdateKey.value;
        // 檢查多個可能的資料路徑
        let elementsData = null;
        let matches = [];
        let differences = [];
        // 路徑1: 詳細分析結構
        if (props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis?.elements) {
            elementsData = props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.elements;
            matches = elementsData.matches || [];
            differences = elementsData.differences || [];
        }
        // 路徑2: 直接在 integratedAnalysis 下檢查是否有 elements 屬性
        if (!elementsData && props.integratedAnalysis?.data?.integratedAnalysis) {
            const analysis = props.integratedAnalysis.data.integratedAnalysis;
            if (analysis.elements) {
                elementsData = analysis.elements;
                matches = elementsData.matches || [];
                differences = elementsData.differences || [];
            }
        }
        // 路徑3: 檢查是否有其他資料結構
        if (!elementsData && props.integratedAnalysis?.data?.integratedAnalysis) {
            const analysis = props.integratedAnalysis.data.integratedAnalysis;
            // 檢查是否有任何包含五行相關資訊的屬性
            Object.keys(analysis).forEach(key => {
                if (key.includes('elements') || key.includes('五行')) {
                    console.log(`找到可能的五行資料路徑: ${key}`, analysis[key]);
                    if (analysis[key]?.matches) {
                        matches = analysis[key].matches || [];
                        differences = analysis[key].differences || [];
                        elementsData = analysis[key];
                    }
                }
            });
        }
        // 如果沒有找到五行資料，嘗試從其他分析內容中提取
        if (matches.length === 0) {
            // 檢查 consensusFindings 或 divergentFindings 中是否有五行資訊
            const allFindings = [
                ...(props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings || []),
                ...(props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings || [])
            ];
            allFindings.forEach(finding => {
                if (typeof finding === 'string') {
                    matches.push(finding);
                }
            });
        }
        if (matches.length === 0) {
            console.log('沒有找到五行分析資料');
            return [];
        }
        console.log('找到的五行相關資料:', { matches, differences });
        // 從匹配和差異中提取五行狀態
        const elements = [
            { name: '木', status: 'normal' },
            { name: '火', status: 'normal' },
            { name: '土', status: 'normal' },
            { name: '金', status: 'normal' },
            { name: '水', status: 'normal' }
        ];
        // 處理強勢五行 - 更靈活的匹配模式
        matches.forEach((match) => {
            const matchStr = String(match).toLowerCase();
            if (matchStr.includes('木') && (matchStr.includes('強') || matchStr.includes('旺') || matchStr.includes('盛'))) {
                elements[0].status = 'strong';
            }
            else if (matchStr.includes('火') && (matchStr.includes('強') || matchStr.includes('旺') || matchStr.includes('盛'))) {
                elements[1].status = 'strong';
            }
            else if (matchStr.includes('土') && (matchStr.includes('強') || matchStr.includes('旺') || matchStr.includes('盛'))) {
                elements[2].status = 'strong';
            }
            else if (matchStr.includes('金') && (matchStr.includes('強') || matchStr.includes('旺') || matchStr.includes('盛'))) {
                elements[3].status = 'strong';
            }
            else if (matchStr.includes('水') && (matchStr.includes('強') || matchStr.includes('旺') || matchStr.includes('盛'))) {
                elements[4].status = 'strong';
            }
        });
        // 處理偏弱五行 - 更靈活的匹配模式
        [...matches, ...differences].forEach((item) => {
            const itemStr = String(item).toLowerCase();
            if (itemStr.includes('木') && (itemStr.includes('弱') || itemStr.includes('缺') || itemStr.includes('少'))) {
                elements[0].status = 'weak';
            }
            else if (itemStr.includes('火') && (itemStr.includes('弱') || itemStr.includes('缺') || itemStr.includes('少'))) {
                elements[1].status = 'weak';
            }
            else if (itemStr.includes('土') && (itemStr.includes('弱') || itemStr.includes('缺') || itemStr.includes('少'))) {
                elements[2].status = 'weak';
            }
            else if (itemStr.includes('金') && (itemStr.includes('弱') || itemStr.includes('缺') || itemStr.includes('少'))) {
                elements[3].status = 'weak';
            }
            else if (itemStr.includes('水') && (itemStr.includes('弱') || itemStr.includes('缺') || itemStr.includes('少'))) {
                elements[4].status = 'weak';
            }
        });
        console.log('計算出的五行分析結果:', elements);
        return elements;
    }
    catch (error) {
        console.warn('獲取五行分析時發生錯誤:', error);
        return [];
    }
});
// 獲取週期分析 - 使用 computed 讓它具有響應性
const getCyclesAnalysis = computed(() => {
    try {
        console.log('重新計算週期分析資料, cycles:', props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis?.cycles);
        if (!props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis?.cycles?.matches) {
            console.log('週期分析資料不存在，返回空數組');
            return [];
        }
        console.log('計算出的週期分析結果:', props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.cycles.matches);
        return props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.cycles.matches;
    }
    catch (error) {
        console.warn('獲取週期分析時發生錯誤:', error);
        return [];
    }
});
// 獲取信心度狀態
const getConfidenceStatus = (confidence) => {
    if (confidence > 0.7)
        return 'success';
    if (confidence > 0.4)
        return 'warning';
    return 'exception';
};
// 獲取信心度描述
const getConfidenceDescription = (confidence) => {
    if (confidence > 0.7)
        return '資料完整，解讀內容詳實全面';
    if (confidence > 0.4)
        return '基本資料充足，解讀內容具參考價值';
    return '資料不完整，建議進一步詢問專業師傅';
};
// 獲取五行對應的圖標
const getElementIcon = (element) => {
    const iconMap = {
        '木': '🌳',
        '火': '🔥',
        '土': '⛰️',
        '金': '🏆',
        '水': '💧'
    };
    return iconMap[element] || '🔮';
};
// 獲取五行狀態文字
const getElementStatusText = (status) => {
    if (status === 'strong')
        return '強勢';
    if (status === 'weak')
        return '偏弱';
    return '中和';
};
// 獲取時間線項目類型
const getTimelineItemType = (index) => {
    const types = ['primary', 'success', 'warning', 'danger', 'info'];
    return types[index % types.length];
};
// 獲取時間線項目顏色
const getTimelineItemColor = (index) => {
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];
    return colors[index % colors.length];
};
// 獲取方法標籤類型
const getMethodTagType = (index) => {
    const types = ['primary', 'success', 'warning', 'danger', 'info'];
    return types[index % types.length];
};
// 獲取當前日期時間
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
// 手動刷新五行分析
const refreshElementsAnalysis = () => {
    console.log('手動刷新五行分析，當前資料:', props.integratedAnalysis);
    elementsUpdateKey.value++;
    ElMessage.success('五行分析已重新計算');
};
// 手動刷新分歧分析
const refreshDualityAnalysis = () => {
    console.log('手動刷新分歧分析，當前資料:', props.integratedAnalysis);
    dualityUpdateKey.value++;
    ElMessage.success('深層特質解析已重新計算');
};
// 調試函數：輸出當前資料結構
const logCurrentDataStructure = () => {
    console.log('=== IntegratedAnalysisDisplay 當前資料結構 ===');
    console.log('完整資料:', props.integratedAnalysis);
    if (props.integratedAnalysis?.data?.integratedAnalysis) {
        const analysis = props.integratedAnalysis.data.integratedAnalysis;
        console.log('可用的分析屬性:', Object.keys(analysis));
        console.log('consensusFindings:', analysis.consensusFindings);
        console.log('divergentFindings:', analysis.divergentFindings);
        console.log('detailedAnalysis:', analysis.detailedAnalysis);
    }
    console.log('五行分析結果:', getElementsAnalysis.value);
    console.log('分歧分析結果:', getDivergentFindings.value);
    console.log('=====================================');
};
// 刷新所有分析內容
const refreshAllAnalysis = () => {
    console.log('手動刷新所有分析內容');
    logCurrentDataStructure();
    elementsUpdateKey.value++;
    dualityUpdateKey.value++;
    ElMessage.success('所有分析內容已重新計算');
};
// 在全局暴露調試函數（開發環境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.debugIntegratedAnalysis = logCurrentDataStructure;
    window.refreshAllAnalysis = refreshAllAnalysis;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    integratedAnalysis: null,
    loading: false,
    error: null
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['finding-card']} */ ;
/** @type {__VLS_StyleScopedClasses['element-name']} */ ;
/** @type {__VLS_StyleScopedClasses['element-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-list']} */ ;
/** @type {__VLS_StyleScopedClasses['confidence-details']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['element-item']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['element-item']} */ ;
/** @type {__VLS_StyleScopedClasses['weak']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-section']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-distribution']} */ ;
/** @type {__VLS_StyleScopedClasses['element-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "integrated-analysis-container" },
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading" },
    });
    const __VLS_0 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        size: (50),
        ...{ class: "is-loading" },
    }));
    const __VLS_2 = __VLS_1({
        size: (50),
        ...{ class: "is-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.Loading;
    /** @type {[typeof __VLS_components.Loading, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    var __VLS_3;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('analysis.loading'));
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error" },
    });
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        color: "red",
        size: (50),
    }));
    const __VLS_10 = __VLS_9({
        color: "red",
        size: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.Warning;
    /** @type {[typeof __VLS_components.Warning, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.error);
}
else if (__VLS_ctx.integratedAnalysis) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-result" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_16 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.DataAnalysis;
    /** @type {[typeof __VLS_components.DataAnalysis, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    var __VLS_19;
    const __VLS_24 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        size: "small",
        effect: "dark",
        type: "success",
        ...{ class: "version-tag" },
    }));
    const __VLS_26 = __VLS_25({
        size: "small",
        effect: "dark",
        type: "success",
        ...{ class: "version-tag" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "key-findings-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "finding-cards" },
    });
    for (const [finding, index] of __VLS_getVForSourceType((__VLS_ctx.getConsensusFindings()))) {
        const __VLS_28 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            key: (`consensus-${index}`),
            ...{ class: "finding-card consensus" },
        }));
        const __VLS_30 = __VLS_29({
            key: (`consensus-${index}`),
            ...{ class: "finding-card consensus" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        {
            const { header: __VLS_thisSlot } = __VLS_31.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-header" },
            });
            const __VLS_32 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                ...{ class: "finding-icon" },
                color: "#67C23A",
            }));
            const __VLS_34 = __VLS_33({
                ...{ class: "finding-icon" },
                color: "#67C23A",
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            __VLS_35.slots.default;
            const __VLS_36 = {}.Check;
            /** @type {[typeof __VLS_components.Check, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
            const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
            var __VLS_35;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (finding);
        }
        var __VLS_31;
    }
    if (__VLS_ctx.getElementsAnalysis.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "elements-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_40 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        const __VLS_44 = {}.Connection;
        /** @type {[typeof __VLS_components.Connection, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        var __VLS_43;
        const __VLS_48 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算五行分析",
            ...{ class: "refresh-btn" },
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算五行分析",
            ...{ class: "refresh-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.refreshElementsAnalysis)
        };
        var __VLS_51;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "elements-distribution" },
            key: (__VLS_ctx.elementsUpdateKey),
        });
        for (const [element] of __VLS_getVForSourceType((__VLS_ctx.getElementsAnalysis))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`${element.name}-${__VLS_ctx.elementsUpdateKey}`),
                ...{ class: "element-item" },
                ...{ class: (element.status) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "element-icon" },
            });
            (__VLS_ctx.getElementIcon(element.name));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "element-name" },
                ...{ class: (element.status) },
            });
            (element.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "element-status" },
            });
            (__VLS_ctx.getElementStatusText(element.status));
        }
    }
    if (__VLS_ctx.getCyclesAnalysis.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cycles-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_56 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        const __VLS_60 = {}.TrendCharts;
        /** @type {[typeof __VLS_components.TrendCharts, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
        const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
        var __VLS_59;
        const __VLS_64 = {}.ElTimeline;
        /** @type {[typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
        const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        for (const [cycle, index] of __VLS_getVForSourceType((__VLS_ctx.getCyclesAnalysis))) {
            const __VLS_68 = {}.ElTimelineItem;
            /** @type {[typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                key: (`cycle-${index}`),
                type: (__VLS_ctx.getTimelineItemType(index)),
                color: (__VLS_ctx.getTimelineItemColor(index)),
                size: (index === 0 ? 'large' : 'normal'),
            }));
            const __VLS_70 = __VLS_69({
                key: (`cycle-${index}`),
                type: (__VLS_ctx.getTimelineItemType(index)),
                color: (__VLS_ctx.getTimelineItemColor(index)),
                size: (index === 0 ? 'large' : 'normal'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            __VLS_71.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "timeline-content" },
            });
            (cycle);
            var __VLS_71;
        }
        var __VLS_67;
    }
    if (__VLS_ctx.getDivergentFindings.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "divergent-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_72 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        const __VLS_76 = {}.Warning;
        /** @type {[typeof __VLS_components.Warning, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
        const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
        var __VLS_75;
        const __VLS_80 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            content: "以下為不同角度的深層解讀，幫助您全面了解自己",
            placement: "top",
        }));
        const __VLS_82 = __VLS_81({
            content: "以下為不同角度的深層解讀，幫助您全面了解自己",
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        const __VLS_84 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
        const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        const __VLS_88 = {}.InfoFilled;
        /** @type {[typeof __VLS_components.InfoFilled, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
        const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
        var __VLS_87;
        var __VLS_83;
        const __VLS_92 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算分歧分析",
            ...{ class: "refresh-btn" },
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算分歧分析",
            ...{ class: "refresh-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (__VLS_ctx.refreshDualityAnalysis)
        };
        var __VLS_95;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "finding-cards" },
            key: (__VLS_ctx.dualityUpdateKey),
        });
        for (const [finding, index] of __VLS_getVForSourceType((__VLS_ctx.getDivergentFindings))) {
            const __VLS_100 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                key: (`divergent-${index}-${__VLS_ctx.dualityUpdateKey}`),
                ...{ class: "finding-card divergent" },
            }));
            const __VLS_102 = __VLS_101({
                key: (`divergent-${index}-${__VLS_ctx.dualityUpdateKey}`),
                ...{ class: "finding-card divergent" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            __VLS_103.slots.default;
            {
                const { header: __VLS_thisSlot } = __VLS_103.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "card-header" },
                });
                const __VLS_104 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                    ...{ class: "finding-icon" },
                    color: "#E6A23C",
                }));
                const __VLS_106 = __VLS_105({
                    ...{ class: "finding-icon" },
                    color: "#E6A23C",
                }, ...__VLS_functionalComponentArgsRest(__VLS_105));
                __VLS_107.slots.default;
                const __VLS_108 = {}.Warning;
                /** @type {[typeof __VLS_components.Warning, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
                const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
                var __VLS_107;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (finding);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "finding-explanation" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            var __VLS_103;
        }
    }
    if (__VLS_ctx.getRecommendations().length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "recommendations-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_112 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
        const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        const __VLS_116 = {}.Bell;
        /** @type {[typeof __VLS_components.Bell, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
        const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
        var __VLS_115;
        const __VLS_120 = {}.ElCollapse;
        /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            accordion: true,
        }));
        const __VLS_122 = __VLS_121({
            accordion: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_123.slots.default;
        for (const [recommendation, index] of __VLS_getVForSourceType((__VLS_ctx.getRecommendations()))) {
            const __VLS_124 = {}.ElCollapseItem;
            /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                key: (`rec-${index}`),
                title: (`建議 ${index + 1}: ${recommendation.substring(0, 20)}...`),
                name: (index.toString()),
            }));
            const __VLS_126 = __VLS_125({
                key: (`rec-${index}`),
                title: (`建議 ${index + 1}: ${recommendation.substring(0, 20)}...`),
                name: (index.toString()),
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            __VLS_127.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "recommendation-detail" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (recommendation);
            var __VLS_127;
        }
        var __VLS_123;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "methods-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_128 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    const __VLS_132 = {}.Document;
    /** @type {[typeof __VLS_components.Document, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
    var __VLS_131;
    if (__VLS_ctx.isDev) {
        const __VLS_136 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算所有分析內容",
            ...{ class: "refresh-btn" },
        }));
        const __VLS_138 = __VLS_137({
            ...{ 'onClick': {} },
            type: "text",
            icon: (__VLS_ctx.Refresh),
            size: "small",
            title: "重新計算所有分析內容",
            ...{ class: "refresh-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        let __VLS_140;
        let __VLS_141;
        let __VLS_142;
        const __VLS_143 = {
            onClick: (__VLS_ctx.refreshAllAnalysis)
        };
        var __VLS_139;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "methods-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "methods-tags" },
    });
    for (const [method, index] of __VLS_getVForSourceType((__VLS_ctx.getMethodsUsed()))) {
        const __VLS_144 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            key: (`method-${index}`),
            ...{ class: "method-tag" },
            type: (__VLS_ctx.getMethodTagType(index)),
            effect: "dark",
        }));
        const __VLS_146 = __VLS_145({
            key: (`method-${index}`),
            ...{ class: "method-tag" },
            type: (__VLS_ctx.getMethodTagType(index)),
            effect: "dark",
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_147.slots.default;
        (method);
        var __VLS_147;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "methods-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "updated-at" },
    });
    (__VLS_ctx.getCurrentDateTime());
}
/** @type {__VLS_StyleScopedClasses['integrated-analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-header']} */ ;
/** @type {__VLS_StyleScopedClasses['version-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['key-findings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-card']} */ ;
/** @type {__VLS_StyleScopedClasses['consensus']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-distribution']} */ ;
/** @type {__VLS_StyleScopedClasses['element-item']} */ ;
/** @type {__VLS_StyleScopedClasses['element-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['element-name']} */ ;
/** @type {__VLS_StyleScopedClasses['element-status']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-content']} */ ;
/** @type {__VLS_StyleScopedClasses['divergent-section']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-card']} */ ;
/** @type {__VLS_StyleScopedClasses['divergent']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['finding-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendations-section']} */ ;
/** @type {__VLS_StyleScopedClasses['recommendation-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['methods-section']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['methods-info']} */ ;
/** @type {__VLS_StyleScopedClasses['methods-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['method-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['methods-details']} */ ;
/** @type {__VLS_StyleScopedClasses['updated-at']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Loading: Loading,
            Warning: Warning,
            Check: Check,
            InfoFilled: InfoFilled,
            DataAnalysis: DataAnalysis,
            Connection: Connection,
            TrendCharts: TrendCharts,
            Bell: Bell,
            Document: Document,
            Refresh: Refresh,
            elementsUpdateKey: elementsUpdateKey,
            dualityUpdateKey: dualityUpdateKey,
            isDev: isDev,
            getConsensusFindings: getConsensusFindings,
            getDivergentFindings: getDivergentFindings,
            getRecommendations: getRecommendations,
            getMethodsUsed: getMethodsUsed,
            getElementsAnalysis: getElementsAnalysis,
            getCyclesAnalysis: getCyclesAnalysis,
            getElementIcon: getElementIcon,
            getElementStatusText: getElementStatusText,
            getTimelineItemType: getTimelineItemType,
            getTimelineItemColor: getTimelineItemColor,
            getMethodTagType: getMethodTagType,
            getCurrentDateTime: getCurrentDateTime,
            refreshElementsAnalysis: refreshElementsAnalysis,
            refreshDualityAnalysis: refreshDualityAnalysis,
            refreshAllAnalysis: refreshAllAnalysis,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=IntegratedAnalysisDisplay.vue.js.map