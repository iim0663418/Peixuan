/**
 * 強化版存儲服務 - 提供更完整的資料存儲、驗證與管理功能
 * 擴展基本的 storageService 功能，添加資料一致性檢查和統一資料模型
 */
import storageService, { STORAGE_KEYS, getFromStorage, saveToStorage } from './storageService';
// 統一資料的存儲鍵
const UNIFIED_DATA_KEY = 'peixuan_unified_session_data';
// 存儲警告的存儲鍵
const STORAGE_WARNINGS_KEY = 'peixuan_storage_warnings';
/**
 * 檢查存儲是否可用
 */
export const isStorageAvailable = () => {
    try {
        const test = 'test';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
    }
    catch (e) {
        return false;
    }
};
/**
 * 獲取存儲使用統計資訊
 */
export const getStorageUsage = () => {
    const stats = {
        totalSize: 0,
        usagePercentage: 0,
        itemCount: 0,
        lastUpdated: Date.now()
    };
    try {
        let totalSize = 0;
        let itemCount = 0;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                const value = sessionStorage.getItem(key);
                if (value) {
                    totalSize += value.length * 2; // 每個字符約 2 字節
                    itemCount++;
                }
            }
        }
        stats.totalSize = totalSize;
        stats.itemCount = itemCount;
        // sessionStorage 上限通常為 5MB
        const maxSize = 5 * 1024 * 1024;
        stats.usagePercentage = (totalSize / maxSize) * 100;
    }
    catch (error) {
        console.error('獲取存儲使用統計資訊時出錯:', error);
    }
    return stats;
};
/**
 * 初始化存儲系統
 * 確保必要的資料結構已創建
 */
export const initializeStorage = () => {
    try {
        // 確保 session ID 存在
        const sessionId = storageService.getOrCreateSessionId();
        // 檢查並初始化統一資料結構，使用更安全的初始化邏輯
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 創建新的統一資料結構，確保所有必要的子對象都被初始化
            unifiedData = {
                sessionId,
                lastUpdated: Date.now(),
                charts: {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                },
                birthInfo: {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                },
                status: {
                    bazi: false,
                    purpleStar: false,
                    integrated: false,
                    transformationStars: false
                },
                validationStatus: 'valid'
            };
            saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        }
        else {
            // 確保所有必要的對象結構存在
            if (!unifiedData.charts) {
                unifiedData.charts = {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                };
            }
            if (!unifiedData.birthInfo) {
                unifiedData.birthInfo = {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                };
            }
            if (!unifiedData.status) {
                unifiedData.status = {
                    bazi: false,
                    purpleStar: false,
                    integrated: false,
                    transformationStars: false
                };
            }
            // 如果 session ID 不匹配，更新它
            if (unifiedData.sessionId !== sessionId) {
                unifiedData.sessionId = sessionId;
            }
            unifiedData.lastUpdated = Date.now();
            saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        }
        // 嘗試初始化命盤資料，但處理可能的錯誤
        try {
            initializeChartData();
        }
        catch (chartError) {
            console.error('初始化命盤資料時出錯:', chartError);
            // 記錄錯誤但不中斷初始化流程
            saveToStorage(STORAGE_WARNINGS_KEY, {
                timestamp: Date.now(),
                message: '命盤資料初始化失敗',
                level: 'warning',
                details: chartError instanceof Error ? chartError.message : '未知錯誤'
            });
        }
        return true;
    }
    catch (error) {
        console.error('初始化存儲系統時出錯:', error);
        // 記錄詳細的錯誤資訊
        saveToStorage(STORAGE_WARNINGS_KEY, {
            timestamp: Date.now(),
            message: '存儲初始化失敗',
            level: 'critical',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
        return false;
    }
};
/**
 * 初始化命盤資料
 * 確保所有現有的命盤資料都被納入統一資料結構
 */
export const initializeChartData = () => {
    try {
        // 獲取統一資料
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 如果統一資料不存在，創建一個完整的初始結構而不是遞歸調用
            unifiedData = {
                sessionId: storageService.getOrCreateSessionId(),
                lastUpdated: Date.now(),
                charts: {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                },
                birthInfo: {
                    bazi: null,
                    purpleStar: null,
                    integrated: null
                },
                status: {
                    bazi: false,
                    purpleStar: false,
                    integrated: false,
                    transformationStars: false
                },
                validationStatus: 'valid'
            };
            saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        }
        // 確保必要的對象結構都已初始化
        if (!unifiedData.charts) {
            unifiedData.charts = {
                bazi: null,
                purpleStar: null,
                integrated: null
            };
        }
        if (!unifiedData.birthInfo) {
            unifiedData.birthInfo = {
                bazi: null,
                purpleStar: null,
                integrated: null
            };
        }
        if (!unifiedData.status) {
            unifiedData.status = {
                bazi: false,
                purpleStar: false,
                integrated: false,
                transformationStars: false
            };
        }
        // 獲取各種命盤資料
        const baziChart = getFromStorage(STORAGE_KEYS.BAZI_CHART);
        const purpleStarChart = getFromStorage(STORAGE_KEYS.PURPLE_STAR_CHART);
        const integratedAnalysis = getFromStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS);
        // 獲取各種出生資訊
        const baziBirthInfo = getFromStorage(STORAGE_KEYS.BAZI_BIRTH_INFO);
        const purpleStarBirthInfo = getFromStorage(STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
        const integratedBirthInfo = getFromStorage(STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
        // 檢查並添加命盤資料
        let isUpdated = false;
        // 使用更安全的賦值方式
        if (baziChart) {
            unifiedData.charts.bazi = baziChart;
            unifiedData.status.bazi = true;
            isUpdated = true;
        }
        if (purpleStarChart) {
            unifiedData.charts.purpleStar = purpleStarChart;
            unifiedData.status.purpleStar = true;
            isUpdated = true;
        }
        if (integratedAnalysis) {
            unifiedData.charts.integrated = integratedAnalysis;
            unifiedData.status.integrated = true;
            isUpdated = true;
        }
        // 檢查並添加出生資訊
        if (baziBirthInfo) {
            unifiedData.birthInfo.bazi = baziBirthInfo;
            isUpdated = true;
        }
        if (purpleStarBirthInfo) {
            unifiedData.birthInfo.purpleStar = purpleStarBirthInfo;
            isUpdated = true;
        }
        if (integratedBirthInfo) {
            unifiedData.birthInfo.integrated = integratedBirthInfo;
            isUpdated = true;
        }
        // 更新並保存統一資料
        unifiedData.lastUpdated = Date.now();
        saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        return true;
    }
    catch (error) {
        console.error('初始化命盤資料時出錯:', error);
        // 記錄詳細的錯誤資訊
        saveToStorage(STORAGE_WARNINGS_KEY, {
            timestamp: Date.now(),
            message: '命盤資料初始化失敗',
            level: 'error',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
        return false;
    }
};
/**
 * 同步各個命盤資料到統一資料
 */
export const syncChartsToUnifiedData = () => {
    try {
        // 獲取各個獨立的命盤和出生資訊
        const baziChart = getFromStorage(STORAGE_KEYS.BAZI_CHART);
        const baziInfo = getFromStorage(STORAGE_KEYS.BAZI_BIRTH_INFO);
        const purpleStarChart = getFromStorage(STORAGE_KEYS.PURPLE_STAR_CHART);
        const purpleStarInfo = getFromStorage(STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
        const integratedChart = getFromStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS);
        const integratedInfo = getFromStorage(STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
        // 獲取統一資料
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 如果統一資料不存在，初始化它
            initializeStorage();
            unifiedData = getFromStorage(UNIFIED_DATA_KEY);
            if (!unifiedData)
                return false;
        }
        // 確保必要的物件結構存在
        if (!unifiedData.charts) {
            unifiedData.charts = {};
        }
        if (!unifiedData.birthInfo) {
            unifiedData.birthInfo = {};
        }
        if (!unifiedData.status) {
            unifiedData.status = {
                bazi: false,
                purpleStar: false,
                integrated: false,
                transformationStars: false
            };
        }
        // 更新統一資料中的命盤和資訊
        if (baziChart) {
            unifiedData.charts.bazi = baziChart;
            unifiedData.status.bazi = true;
        }
        if (baziInfo) {
            unifiedData.birthInfo.bazi = baziInfo;
        }
        if (purpleStarChart) {
            unifiedData.charts.purpleStar = purpleStarChart;
            unifiedData.status.purpleStar = true;
        }
        if (purpleStarInfo) {
            unifiedData.birthInfo.purpleStar = purpleStarInfo;
        }
        if (integratedChart) {
            unifiedData.charts.integrated = integratedChart;
            unifiedData.status.integrated = true;
        }
        if (integratedInfo) {
            unifiedData.birthInfo.integrated = integratedInfo;
        }
        // 更新時間戳並保存
        unifiedData.lastUpdated = Date.now();
        unifiedData.validationStatus = 'valid';
        saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        // 檢查資料一致性
        try {
            validateStorageData();
        }
        catch (validateError) {
            console.error('同步後驗證資料時出錯:', validateError);
        }
        return true;
    }
    catch (error) {
        console.error('同步命盤資料到統一資料時出錯:', error);
        return false;
    }
};
/**
 * 驗證存儲資料的一致性
 */
export const validateStorageData = () => {
    try {
        // 獲取統一資料
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 如果統一資料不存在，初始化它
            console.warn('未找到統一資料，重新初始化');
            initializeStorage();
            // 重新獲取，而不是遞歸調用（避免潛在的無限遞歸）
            unifiedData = getFromStorage(UNIFIED_DATA_KEY);
            // 如果初始化後仍然沒有資料，則退出
            if (!unifiedData) {
                console.error('即使在初始化後仍未能獲取統一資料');
                return false;
            }
        }
        // 確保必要的對象結構已初始化
        if (!unifiedData.charts) {
            unifiedData.charts = {
                bazi: null,
                purpleStar: null,
                integrated: null
            };
        }
        if (!unifiedData.birthInfo) {
            unifiedData.birthInfo = {
                bazi: null,
                purpleStar: null,
                integrated: null
            };
        }
        if (!unifiedData.status) {
            unifiedData.status = {
                bazi: false,
                purpleStar: false,
                integrated: false,
                transformationStars: false
            };
        }
        // 檢查與獨立存儲的資料是否一致
        const baziChart = getFromStorage(STORAGE_KEYS.BAZI_CHART);
        const purpleStarChart = getFromStorage(STORAGE_KEYS.PURPLE_STAR_CHART);
        const integratedChart = getFromStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS);
        // 標記是否有不一致
        let hasInconsistency = false;
        let missingFields = {};
        // 更寬鬆的驗證邏輯
        const validateChart = (chart) => {
            return chart !== null && chart !== undefined && typeof chart === 'object' && Object.keys(chart).length > 0;
        };
        // 檢查八字命盤，加強防禦性編程
        if (baziChart && unifiedData.charts && unifiedData.charts.bazi !== undefined) {
            try {
                const baziConsistency = crossValidateChartData(baziChart, unifiedData.charts.bazi, 'bazi');
                if (!baziConsistency.isConsistent) {
                    hasInconsistency = true;
                    missingFields['bazi'] = baziConsistency.missingFields;
                }
            }
            catch (error) {
                console.error('驗證八字命盤時出錯:', error);
                hasInconsistency = true;
                missingFields['bazi'] = ['validation_error'];
            }
        }
        else if (baziChart && (!unifiedData.charts || unifiedData.charts.bazi === undefined)) {
            // 統一資料中缺少八字命盤
            hasInconsistency = true;
            missingFields['bazi'] = ['entire chart'];
            // 修復：添加到統一資料
            if (unifiedData.charts) {
                unifiedData.charts.bazi = baziChart;
                if (unifiedData.status) {
                    unifiedData.status.bazi = true;
                }
            }
        }
        else if (!baziChart && unifiedData.charts && validateChart(unifiedData.charts.bazi)) {
            // 獨立存儲中缺少八字命盤
            hasInconsistency = true;
            missingFields['bazi_independent'] = ['entire chart'];
            // 修復：添加到獨立存儲
            saveToStorage(STORAGE_KEYS.BAZI_CHART, unifiedData.charts.bazi);
        }
        // 檢查紫微斗數命盤，加強防禦性編程
        if (purpleStarChart && unifiedData.charts && unifiedData.charts.purpleStar !== undefined) {
            try {
                const purpleStarConsistency = crossValidateChartData(purpleStarChart, unifiedData.charts.purpleStar, 'purpleStar');
                if (!purpleStarConsistency.isConsistent) {
                    hasInconsistency = true;
                    missingFields['purpleStar'] = purpleStarConsistency.missingFields;
                }
            }
            catch (error) {
                console.error('驗證紫微斗數命盤時出錯:', error);
                hasInconsistency = true;
                missingFields['purpleStar'] = ['validation_error'];
            }
        }
        else if (purpleStarChart && (!unifiedData.charts || unifiedData.charts.purpleStar === undefined)) {
            // 統一資料中缺少紫微斗數命盤
            hasInconsistency = true;
            missingFields['purpleStar'] = ['entire chart'];
            // 修復：添加到統一資料
            if (unifiedData.charts) {
                unifiedData.charts.purpleStar = purpleStarChart;
                if (unifiedData.status) {
                    unifiedData.status.purpleStar = true;
                }
            }
        }
        else if (!purpleStarChart && unifiedData.charts && validateChart(unifiedData.charts.purpleStar)) {
            // 獨立存儲中缺少紫微斗數命盤
            hasInconsistency = true;
            missingFields['purpleStar_independent'] = ['entire chart'];
            // 修復：添加到獨立存儲
            saveToStorage(STORAGE_KEYS.PURPLE_STAR_CHART, unifiedData.charts.purpleStar);
        }
        // 檢查整合分析，加強防禦性編程
        if (integratedChart && unifiedData.charts && unifiedData.charts.integrated !== undefined) {
            try {
                const integratedConsistency = crossValidateChartData(integratedChart, unifiedData.charts.integrated, 'integrated');
                if (!integratedConsistency.isConsistent) {
                    hasInconsistency = true;
                    missingFields['integrated'] = integratedConsistency.missingFields;
                }
            }
            catch (error) {
                console.error('驗證整合分析時出錯:', error);
                hasInconsistency = true;
                missingFields['integrated'] = ['validation_error'];
            }
        }
        else if (integratedChart && (!unifiedData.charts || unifiedData.charts.integrated === undefined)) {
            // 統一資料中缺少整合分析
            hasInconsistency = true;
            missingFields['integrated'] = ['entire analysis'];
            // 修復：添加到統一資料
            if (unifiedData.charts) {
                unifiedData.charts.integrated = integratedChart;
                if (unifiedData.status) {
                    unifiedData.status.integrated = true;
                }
            }
        }
        else if (!integratedChart && unifiedData.charts && validateChart(unifiedData.charts.integrated)) {
            // 獨立存儲中缺少整合分析
            hasInconsistency = true;
            missingFields['integrated_independent'] = ['entire analysis'];
            // 修復：添加到獨立存儲
            saveToStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS, unifiedData.charts.integrated);
        }
        // 更新狀態標誌
        if (unifiedData.charts && unifiedData.status) {
            if (validateChart(unifiedData.charts.bazi)) {
                unifiedData.status.bazi = true;
            }
            if (validateChart(unifiedData.charts.purpleStar)) {
                unifiedData.status.purpleStar = true;
            }
            if (validateChart(unifiedData.charts.integrated)) {
                unifiedData.status.integrated = true;
            }
        }
        // 嘗試自動修復不一致
        if (hasInconsistency) {
            unifiedData.validationStatus = 'warning';
            saveToStorage(UNIFIED_DATA_KEY, unifiedData);
            // 記錄警告
            saveToStorage(STORAGE_WARNINGS_KEY, {
                timestamp: Date.now(),
                message: '存儲資料存在不一致',
                level: 'warning',
                details: missingFields
            });
            // 嘗試修復，但不依賴它的成功
            try {
                repairDataConsistency();
            }
            catch (repairError) {
                console.error('修復資料一致性時出錯:', repairError);
            }
            return false;
        }
        else {
            // 清除警告
            sessionStorage.removeItem(STORAGE_WARNINGS_KEY);
            unifiedData.validationStatus = 'valid';
            saveToStorage(UNIFIED_DATA_KEY, unifiedData);
            return true;
        }
    }
    catch (error) {
        console.error('驗證存儲資料一致性時出錯:', error);
        // 記錄錯誤
        saveToStorage(STORAGE_WARNINGS_KEY, {
            timestamp: Date.now(),
            message: '驗證資料時發生錯誤',
            level: 'error',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
        return false;
    }
};
/**
 * 交叉驗證命盤資料
 */
export const crossValidateChartData = (chart1, chart2, chartType) => {
    const result = {
        isConsistent: true,
        missingFields: []
    };
    try {
        // 處理 null 或 undefined 的情況
        if (chart1 === null || chart1 === undefined || chart2 === null || chart2 === undefined) {
            // 如果兩者都是 null 或 undefined，則視為一致
            if ((chart1 === null || chart1 === undefined) && (chart2 === null || chart2 === undefined)) {
                return result;
            }
            // 只有一個是 null 或 undefined，則不一致
            result.isConsistent = false;
            result.missingFields.push(chart1 === null || chart1 === undefined ? 'chart1_is_null' : 'chart2_is_null');
            return result;
        }
        // 如果是基本資料類型，直接比較
        if (typeof chart1 !== 'object' || typeof chart2 !== 'object') {
            result.isConsistent = chart1 === chart2;
            if (!result.isConsistent) {
                result.missingFields.push('primitive_value_mismatch');
            }
            return result;
        }
        // 檢查關鍵欄位是否存在，根據命盤類型
        const keyFields = {
            bazi: ['yearPillar', 'monthPillar', 'dayPillar', 'hourPillar'],
            purpleStar: ['palaces', 'mingPalaceIndex', 'shenPalaceIndex'],
            integrated: ['data', 'meta', 'success']
        };
        // 使用更寬鬆的比較：只檢查關鍵欄位（如果該命盤類型有指定）
        if (chartType in keyFields) {
            for (const field of keyFields[chartType]) {
                // 使用 in 操作符而不是直接訪問以避免可能的 undefined 問題
                const chart1HasField = chart1 && typeof chart1 === 'object' && field in chart1;
                const chart2HasField = chart2 && typeof chart2 === 'object' && field in chart2;
                if (!chart1HasField && chart2HasField) {
                    result.isConsistent = false;
                    result.missingFields.push(`chart1.${field}`);
                }
                else if (chart1HasField && !chart2HasField) {
                    result.isConsistent = false;
                    result.missingFields.push(`chart2.${field}`);
                }
            }
        }
        // 簡化欄位比較，只檢查關鍵欄位即可，避免非關鍵欄位的差異導致過多的不一致
        // 不再檢查所有欄位，只檢查關鍵欄位
        // 如果未指定關鍵欄位或不屬於已知命盤類型，則使用基本一致性檢查
        if (!(chartType in keyFields)) {
            // 基本一致性檢查：確保兩個對象的所有鍵相同
            const keys1 = Object.keys(chart1);
            const keys2 = Object.keys(chart2);
            // 檢查 chart1 有但 chart2 沒有的欄位
            for (const key of keys1) {
                if (!(key in chart2)) {
                    result.isConsistent = false;
                    result.missingFields.push(`chart2.${key}`);
                }
            }
            // 檢查 chart2 有但 chart1 沒有的欄位
            for (const key of keys2) {
                if (!(key in chart1)) {
                    result.isConsistent = false;
                    result.missingFields.push(`chart1.${key}`);
                }
            }
        }
    }
    catch (error) {
        console.error('交叉驗證命盤資料時出錯:', error);
        result.isConsistent = false;
        result.missingFields.push('validation_error');
    }
    return result;
};
/**
 * 修復資料一致性
 */
export const repairDataConsistency = () => {
    try {
        // 獲取警告詳情
        const warnings = getFromStorage(STORAGE_WARNINGS_KEY);
        if (!warnings || !warnings.details) {
            // 沒有詳細資訊，無法修復
            return false;
        }
        // 獲取統一資料
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 如果統一資料不存在，初始化它
            initializeStorage();
            unifiedData = getFromStorage(UNIFIED_DATA_KEY);
            if (!unifiedData)
                return false;
        }
        // 修復八字命盤
        if ('bazi' in warnings.details) {
            const baziChart = getFromStorage(STORAGE_KEYS.BAZI_CHART);
            if (baziChart) {
                unifiedData.charts.bazi = baziChart;
                unifiedData.status.bazi = true;
            }
        }
        else if ('bazi_independent' in warnings.details) {
            if (unifiedData.charts.bazi) {
                saveToStorage(STORAGE_KEYS.BAZI_CHART, unifiedData.charts.bazi);
            }
        }
        // 修復紫微斗數命盤
        if ('purpleStar' in warnings.details) {
            const purpleStarChart = getFromStorage(STORAGE_KEYS.PURPLE_STAR_CHART);
            if (purpleStarChart) {
                unifiedData.charts.purpleStar = purpleStarChart;
                unifiedData.status.purpleStar = true;
            }
        }
        else if ('purpleStar_independent' in warnings.details) {
            if (unifiedData.charts.purpleStar) {
                saveToStorage(STORAGE_KEYS.PURPLE_STAR_CHART, unifiedData.charts.purpleStar);
            }
        }
        // 修復整合分析
        if ('integrated' in warnings.details) {
            const integratedChart = getFromStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS);
            if (integratedChart) {
                unifiedData.charts.integrated = integratedChart;
                unifiedData.status.integrated = true;
            }
        }
        else if ('integrated_independent' in warnings.details) {
            if (unifiedData.charts.integrated) {
                saveToStorage(STORAGE_KEYS.INTEGRATED_ANALYSIS, unifiedData.charts.integrated);
            }
        }
        // 更新統一資料
        unifiedData.lastUpdated = Date.now();
        saveToStorage(UNIFIED_DATA_KEY, unifiedData);
        // 清除警告
        sessionStorage.removeItem(STORAGE_WARNINGS_KEY);
        return true;
    }
    catch (error) {
        console.error('修復資料一致性時出錯:', error);
        return false;
    }
};
/**
 * 獲取統一會話資料
 */
export const getUnifiedSessionData = () => {
    try {
        // 獲取統一資料
        let unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        if (!unifiedData) {
            // 如果統一資料不存在，初始化它
            initializeStorage();
            unifiedData = getFromStorage(UNIFIED_DATA_KEY);
        }
        return unifiedData;
    }
    catch (error) {
        console.error('獲取統一會話資料時出錯:', error);
        return null;
    }
};
/**
 * 清除所有命盤資料
 */
export const clearChartData = () => {
    try {
        // 清除獨立存儲的資料
        storageService.clearAllAstrologyData();
        // 清除統一資料
        sessionStorage.removeItem(UNIFIED_DATA_KEY);
        sessionStorage.removeItem(STORAGE_WARNINGS_KEY);
        // 重新初始化存儲
        initializeStorage();
        return true;
    }
    catch (error) {
        console.error('清除命盤資料時出錯:', error);
        return false;
    }
};
export const enhancedStorageService = {
    isStorageAvailable,
    getStorageUsage,
    initializeStorage,
    initializeChartData,
    syncChartsToUnifiedData,
    validateStorageData,
    crossValidateChartData,
    repairDataConsistency,
    getUnifiedSessionData,
    clearChartData
};
export default enhancedStorageService;
//# sourceMappingURL=enhancedStorageService.js.map