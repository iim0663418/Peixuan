/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { enhancedStorageService } from '../utils/enhancedStorageService';
import { getFromStorage } from '../utils/storageService';
export default defineComponent({
    name: 'StorageStatusIndicator',
    setup() {
        const { t } = useI18n();
        const storageStats = ref(null);
        const storageAvailable = ref(true);
        const showDetails = ref(false);
        const validationStatus = ref(null);
        const unifiedData = ref(null);
        // 格式化檔案大小
        const formatSize = (bytes) => {
            if (bytes === 0)
                return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        // 格式化百分比
        const formatPercentage = (percentage) => {
            return percentage.toFixed(2) + '%';
        };
        // 格式化時間
        const formatTime = (timestamp) => {
            if (!timestamp)
                return t('storage.never');
            return new Date(timestamp).toLocaleString();
        };
        // 狀態計算屬性
        const statusClass = computed(() => {
            if (!storageAvailable.value)
                return 'status-error';
            if (validationStatus.value === 'error')
                return 'status-error';
            if (validationStatus.value === 'warning')
                return 'status-warning';
            if (storageStats.value && storageStats.value.usagePercentage > 80)
                return 'status-warning';
            return 'status-ok';
        });
        const statusIcon = computed(() => {
            if (!storageAvailable.value)
                return '❌';
            if (validationStatus.value === 'error')
                return '⚠️';
            if (validationStatus.value === 'warning')
                return '⚠️';
            if (storageStats.value && storageStats.value.usagePercentage > 80)
                return '⚠️';
            return '✅';
        });
        const statusText = computed(() => {
            if (!storageAvailable.value)
                return t('storage.unavailable');
            if (validationStatus.value === 'error')
                return t('storage.dataInconsistent');
            if (validationStatus.value === 'warning')
                return t('storage.dataWarning');
            if (storageStats.value && storageStats.value.usagePercentage > 80)
                return t('storage.almostFull');
            return t('storage.healthy');
        });
        // 更新存儲統計數據
        const updateStats = () => {
            storageAvailable.value = enhancedStorageService.isStorageAvailable();
            if (storageAvailable.value) {
                storageStats.value = enhancedStorageService.getStorageUsage();
            }
        };
        // 切換詳細信息顯示
        const toggleDetails = () => {
            showDetails.value = !showDetails.value;
            if (showDetails.value) {
                updateStats();
            }
        };
        // 清除所有數據
        const clearAllData = async () => {
            try {
                enhancedStorageService.clearChartData();
                ElMessage.success(t('storage.dataCleared'));
                updateStats();
            }
            catch (error) {
                console.error('清除數據時發生錯誤:', error);
                ElMessage.error(t('storage.clearError'));
            }
        };
        // 驗證數據
        const validateData = () => {
            try {
                // 初始化數據（如果需要）
                enhancedStorageService.initializeStorage();
                const isValid = enhancedStorageService.validateStorageData();
                // 檢查是否有存儲警告
                const storageWarnings = getFromStorage('peixuan_storage_warnings');
                // 更新統一數據引用
                unifiedData.value = enhancedStorageService.getUnifiedSessionData();
                if (isValid && !storageWarnings) {
                    validationStatus.value = 'success';
                    ElMessage.success(t('storage.validationSuccess'));
                }
                else if (isValid && storageWarnings) {
                    // 有警告但不影響系統運行
                    validationStatus.value = 'warning';
                    // 如果有詳細的欄位缺失信息，顯示更具體的警告
                    let warningMessage = storageWarnings?.message || t('storage.validationWarning');
                    if (storageWarnings?.details) {
                        const details = Object.entries(storageWarnings.details)
                            .map(([type, fields]) => `${type}: ${fields.join(', ')}`)
                            .join('; ');
                        warningMessage += `\n${t('storage.missingFields')}: ${details}`;
                    }
                    ElMessage({
                        message: warningMessage,
                        type: 'warning',
                        duration: 5000
                    });
                    // 自動嘗試修復數據
                    if (storageWarnings.details) {
                        const success = enhancedStorageService.syncChartsToUnifiedData();
                        if (success) {
                            console.log('自動嘗試修復數據不一致');
                        }
                    }
                }
                else {
                    validationStatus.value = 'error';
                    ElMessage.error(t('storage.validationError'));
                }
            }
            catch (error) {
                console.error('驗證數據時發生錯誤:', error);
                validationStatus.value = 'error';
                ElMessage.error(t('storage.validationError'));
            }
            updateStats();
        };
        // 同步所有圖表數據到統一存儲
        const syncAllCharts = () => {
            try {
                const success = enhancedStorageService.syncChartsToUnifiedData();
                if (success) {
                    unifiedData.value = enhancedStorageService.getUnifiedSessionData();
                    ElMessage.success(t('storage.syncSuccess'));
                    validateData(); // 重新驗證以更新狀態
                }
                else {
                    ElMessage.error(t('storage.syncError'));
                }
            }
            catch (error) {
                console.error('同步圖表數據時發生錯誤:', error);
                ElMessage.error(t('storage.syncError'));
            }
        };
        // 組件掛載時初始化
        onMounted(() => {
            updateStats();
            unifiedData.value = enhancedStorageService.getUnifiedSessionData();
        });
        return {
            storageStats,
            storageAvailable,
            showDetails,
            validationStatus,
            unifiedData,
            statusClass,
            statusIcon,
            statusText,
            formatSize,
            formatPercentage,
            formatTime,
            toggleDetails,
            clearAllData,
            validateData,
            syncAllCharts
        };
    }
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "storage-status" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-badge" },
    ...{ class: (__VLS_ctx.statusClass) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-icon" },
});
(__VLS_ctx.statusIcon);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-text" },
});
(__VLS_ctx.statusText);
if (__VLS_ctx.unifiedData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "unified-data-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('storage.unifiedData'));
}
if (__VLS_ctx.showDetails) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "storage-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('storage.totalSize'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.formatSize(__VLS_ctx.storageStats?.totalSize || 0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('storage.usage'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.formatPercentage(__VLS_ctx.storageStats?.usagePercentage || 0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('storage.itemCount'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.storageStats?.itemCount || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    (__VLS_ctx.$t('storage.lastUpdated'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value" },
    });
    (__VLS_ctx.formatTime(__VLS_ctx.storageStats?.lastUpdated));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "storage-actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    size: "small",
    type: "info",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    size: "small",
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.toggleDetails)
};
__VLS_3.slots.default;
(__VLS_ctx.showDetails ? __VLS_ctx.$t('storage.hideDetails') : __VLS_ctx.$t('storage.showDetails'));
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    size: "small",
    type: "danger",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    size: "small",
    type: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.clearAllData)
};
__VLS_11.slots.default;
(__VLS_ctx.$t('storage.clearAll'));
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    size: "small",
    type: "success",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    size: "small",
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.validateData)
};
__VLS_19.slots.default;
(__VLS_ctx.$t('storage.validate'));
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    size: "small",
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.syncAllCharts)
};
__VLS_27.slots.default;
(__VLS_ctx.$t('storage.sync'));
var __VLS_27;
/** @type {__VLS_StyleScopedClasses['storage-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['status-text']} */ ;
/** @type {__VLS_StyleScopedClasses['unified-data-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['storage-actions']} */ ;
var __VLS_dollars;
let __VLS_self;
//# sourceMappingURL=StorageStatusIndicator.vue.js.map