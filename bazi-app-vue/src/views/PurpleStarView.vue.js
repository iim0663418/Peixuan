/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useBreakpoints } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import { StarFilled, Connection, TrendCharts, Check, Warning, DataAnalysis, Bell, Loading, Delete } from '@element-plus/icons-vue';
import PurpleStarInputForm from '@/components/PurpleStarInputForm.vue';
import PurpleStarChartDisplay from '@/components/PurpleStarChartDisplay.vue';
import TransformationStarsDisplay from '@/components/TransformationStarsDisplay.vue';
import IntegratedAnalysisDisplay from '@/components/IntegratedAnalysisDisplay.vue';
import UnifiedLayeredController from '@/components/UnifiedLayeredController.vue';
import StorageStatusIndicator from '@/components/StorageStatusIndicator.vue';
import apiService from '@/services/apiService';
import astrologyIntegrationService from '@/services/astrologyIntegrationService';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { useSharedLayeredReading } from '@/composables/useSharedLayeredReading';
import { ReadingLevel } from '@/types/layeredReading';
import { adaptIntegratedAnalysisToLayered } from '@/composables/useLayeredReading';
// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();
// 注入全域顯示狀態
const globalDisplayState = inject('globalDisplayState');
// 主要狀態
const purpleStarChart = ref(null);
const birthInfoForIntegration = ref(null);
const transformationFlows = ref({});
const transformationCombinations = ref([]);
const multiLayerEnergies = ref({});
// 使用共享分層閱覽系統
const { readingState, effectiveReadingLevel, availableLevels, currentLevelConfig, canUpgrade, canDowngrade, switchToLevel, updateLayeredData, isPrimaryModule, syncStatusDescription } = useSharedLayeredReading('purpleStar');
// 使用顯示模式 composable（作為後備）
const { displayMode: localDisplayMode, mapDepthToMode } = useDisplayMode('purpleStar');
// 監聽本地顯示模式的變化
watch(() => localDisplayMode.value, (newMode) => {
    console.log(`PurpleStarView: localDisplayMode 變化為 ${newMode}`);
}, { immediate: true });
// 計算顯示模式 - 只使用本地顯示模式，避免多重系統衝突
const displayMode = computed(() => {
    console.log(`PurpleStarView: 使用本地顯示模式=${localDisplayMode.value}`);
    return localDisplayMode.value;
});
// 監聽全域狀態變化，同步到本地 composable
// 注意：簡化版的 globalDisplayState 不再包含 moduleDepths，所以這個監聽器暫時禁用
// watch(() => globalDisplayState?.moduleDepths?.value?.purpleStar, (newDepth) => {
//   if (newDepth && newDepth !== localDisplayMode.value) {
//     localDisplayMode.value = newDepth;
//     console.log(`PurpleStarView: 同步全域狀態到本地 composable: ${newDepth}`);
//   }
// }, { immediate: true });
// 顯示模式選項
const displayModeOptions = [
    { value: 'minimal', label: '簡要預覽', tooltip: '最簡潔的命盤展示，僅呈現基本框架' },
    { value: 'compact', label: '精簡檢視', tooltip: '顯示主要星曜和基本四化效應，快速了解命盤特點' },
    { value: 'standard', label: '標準解讀', tooltip: '完整展示星曜信息和四化效應，深入解析命盤結構' },
    { value: 'comprehensive', label: '深度分析', tooltip: '全面詳盡的命盤分析，包含所有星曜、四化組合和多層次能量疊加' }
];
// 分層相關狀態
const layeredData = ref(null);
const dataCompleteness = computed(() => {
    if (!purpleStarChart.value)
        return 0;
    let completeness = 0;
    // 基礎命盤数据 (40%)
    if (purpleStarChart.value.palaces && purpleStarChart.value.palaces.length > 0) {
        completeness += 40;
    }
    // 四化飞星数据 (30%)
    if (Object.keys(transformationFlows.value).length > 0) {
        completeness += 30;
    }
    // 多层次能量数据 (20%)
    if (Object.keys(multiLayerEnergies.value).length > 0) {
        completeness += 20;
    }
    // 特殊组合数据 (10%)
    if (transformationCombinations.value && transformationCombinations.value.length > 0) {
        completeness += 10;
    }
    return Math.min(completeness, 100);
});
// 切換顯示模式
const changeDisplayMode = (mode) => {
    console.log(`PurpleStarView: changeDisplayMode 被調用，mode=${mode}`);
    localDisplayMode.value = mode;
};
// 處理顯示模式更新
const handleDisplayModeUpdate = (mode) => {
    console.log(`PurpleStarView: handleDisplayModeUpdate 被調用，mode=${mode}`);
    localDisplayMode.value = mode;
};
// 處理層級變化
const handleLevelChanged = (level) => {
    console.log(`PurpleStarView: handleLevelChanged 被調用，level=${level}`);
    // 將 ReadingLevel 映射到 DisplayMode
    const levelToModeMap = {
        [ReadingLevel.SUMMARY]: 'minimal',
        [ReadingLevel.COMPACT]: 'compact',
        [ReadingLevel.STANDARD]: 'standard',
        [ReadingLevel.DEEP_ANALYSIS]: 'comprehensive'
    };
    const newDisplayMode = levelToModeMap[level] || 'standard';
    console.log(`PurpleStarView: 層級 ${level} 映射到顯示模式 ${newDisplayMode}`);
    // 更新本地顯示模式
    localDisplayMode.value = newDisplayMode;
    // 通過 useSharedLayeredReading 系統更新層級以同步四化飛星
    if (effectiveReadingLevel) {
        effectiveReadingLevel.value = level;
        console.log(`PurpleStarView: 已同步層級到共享系統: ${level}`);
    }
};
// 整合分析狀態
const showIntegratedAnalysis = ref(false);
const integratedAnalysisLoading = ref(false);
const integratedAnalysisResult = ref(null);
const integratedAnalysisError = ref(null);
const loadingProgress = ref(0);
const currentLoadingStep = ref('正在準備分析...');
// 響應式斷點檢測  
const responsiveBreakpoints = useBreakpoints({
    mobile: 768,
    tablet: 1024
});
const isMobile = responsiveBreakpoints.smaller('mobile');
// 計算屬性
const integratedAnalysisTitle = computed(() => {
    return integratedAnalysisResult.value ? '綜合解讀結果' : '綜合人生解讀';
});
// 分析完整度計算
const analysisCompleteness = computed(() => {
    if (!integratedAnalysisResult.value)
        return 0;
    try {
        const confidence = integratedAnalysisResult.value.data?.analysisInfo?.confidence || 0;
        return Math.round(confidence * 100);
    }
    catch (error) {
        console.error('計算分析完整度時出錯:', error);
        return 0;
    }
});
// 數據清除函數
const clearData = async () => {
    try {
        await ElMessageBox.confirm('確定要清除基本命盤資料嗎？（四化飛星資料將保留）', '清除數據', {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        // 只清除基本資料，保留四化飛星
        storageService.clearAnalysisData('purpleStar');
        purpleStarChart.value = null;
        birthInfoForIntegration.value = null;
        ElMessage.success('紫微斗數基本資料已清除（四化飛星資料已保留）');
    }
    catch (error) {
        // 用戶取消或詢問是否全部清除
        try {
            await ElMessageBox.confirm('是否要清除包括四化飛星在內的所有資料？', '全部清除', {
                confirmButtonText: '全部清除',
                cancelButtonText: '取消',
                type: 'error'
            });
            storageService.clearAnalysisData('purpleStarAll');
            purpleStarChart.value = null;
            birthInfoForIntegration.value = null;
            transformationFlows.value = {};
            transformationCombinations.value = [];
            multiLayerEnergies.value = {};
            ElMessage.success('所有紫微斗數資料已清除');
        }
        catch (finalError) {
            // 用戶最終取消
        }
    }
};
// 主要提交處理
const handleSubmit = async (birthInfo) => {
    try {
        // 使用 console.group 組織日誌輸出
        console.group('紫微斗數API調用');
        ElMessage.info('正在計算紫微斗數命盤...');
        // 保存出生資訊用於整合分析
        birthInfoForIntegration.value = birthInfo;
        // 保存出生資訊到 sessionStorage
        storageService.saveToStorage(storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO, birthInfo);
        // 構建包含完整選項的請求數據
        const requestData = {
            ...birthInfo,
            options: {
                includeMajorCycles: true,
                includeMinorCycles: true,
                includeAnnualCycles: true, // 確保流年太歲計算被啟用
                detailLevel: 'advanced',
                includeFourTransformations: true, // 明確請求四化飛星數據
                maxAge: 100
            }
        };
        console.log('發送請求數據:', requestData);
        console.log('請求選項配置:', requestData.options);
        // 使用後端 API 進行紫微斗數計算
        const response = await apiService.calculatePurpleStar(requestData);
        // 詳細記錄 API 響應結構
        console.log('API 響應狀態:', response ? '成功' : '空響應');
        console.log('API 響應頂層鍵:', Object.keys(response || {}));
        console.log('API data 存在:', !!response?.data);
        console.log('API data 鍵:', Object.keys(response?.data || {}));
        // 檢查命盤數據完整性
        if (!response?.data?.chart) {
            console.error('API 未返回紫微斗數命盤數據');
            throw new Error('紫微斗數命盤數據缺失');
        }
        // 記錄命盤基本信息
        console.log('命盤數據:', response.data.chart);
        console.log('命宮天干:', response.data.chart.mingGan || '未返回命宮天干');
        console.log('大限資訊:', response.data.chart.daXian || '無大限資訊');
        console.log('小限資訊:', response.data.chart.xiaoXian || '無小限資訊');
        console.log('流年太歲資訊:', response.data.chart.liuNianTaiSui || '無流年太歲資訊');
        // 正確提取命盤數據
        purpleStarChart.value = response.data.chart;
        // 檢查四化飛星數據
        console.log('四化飛星數據存在:', !!response.data.transformations);
        // 提取四化飛星數據
        if (response.data.transformations) {
            transformationFlows.value = response.data.transformations.flows || {};
            transformationCombinations.value = response.data.transformations.combinations || [];
            multiLayerEnergies.value = response.data.transformations.layeredEnergies || {};
            // 詳細記錄四化飛星數據結構
            console.log('四化飛星數據載入成功:', {
                flows: Object.keys(transformationFlows.value).length,
                combinations: transformationCombinations.value.length,
                layeredEnergies: Object.keys(multiLayerEnergies.value).length
            });
            // 檢查數據的具體內容
            if (Object.keys(transformationFlows.value).length === 0) {
                console.warn('四化飛星flows數據為空，可能影響顯示');
            }
            else {
                console.log('四化飛星flows數據樣本:', Object.keys(transformationFlows.value).slice(0, 3));
            }
        }
        else {
            console.error('API 未返回四化飛星數據，詳細檢查API響應結構');
            console.log('API響應的完整data結構鍵:', Object.keys(response.data));
            // 檢查是否有其他可能的四化數據字段
            const possibleKeys = ['fourTransformations', 'sihua', 'transformedStars', 'starTransformations'];
            const responseData = response.data; // 臨時類型轉換以處理動態屬性訪問
            const foundAlternative = possibleKeys.find(key => responseData[key]);
            if (foundAlternative) {
                console.log(`發現替代四化數據字段: ${foundAlternative}`, responseData[foundAlternative]);
            }
            // 清空相關引用避免錯誤
            transformationFlows.value = {};
            transformationCombinations.value = [];
            multiLayerEnergies.value = {};
            // 提示用戶有數據缺失
            ElMessage.warning({
                message: '四化飛星數據缺失，部分分析功能將不可用。請檢查後端API配置。',
                duration: 5000
            });
        }
        // 保存命盤數據到 sessionStorage
        storageService.saveToStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART, response.data.chart);
        // 保存四化飛星數據到 sessionStorage
        if (response.data.transformations) {
            console.log('保存四化飛星數據到 sessionStorage');
            const transformations = response.data.transformations; // 臨時類型轉換
            storageService.saveTransformationStarsData(transformations.stars || null, transformations.flows || {}, transformations.combinations || []);
        }
        else {
            console.warn('API 響應中沒有四化飛星數據，無法保存');
        }
        console.groupEnd();
        ElMessage.success('紫微斗數計算完成');
    }
    catch (error) {
        // 確保關閉日誌組
        console.groupEnd();
        // 詳細記錄錯誤信息
        console.error('紫微斗數計算錯誤:', error);
        console.error('錯誤類型:', error.constructor.name);
        console.error('錯誤訊息:', error.message);
        console.error('錯誤堆疊:', error.stack);
        // 提供用戶友好的錯誤訊息
        const errorMessage = error.message || '未知錯誤';
        ElMessage.error({
            message: `紫微斗數計算失敗: ${errorMessage}`,
            duration: 6000
        });
    }
};
// 整合分析相關功能
const toggleIntegratedAnalysis = () => {
    const wasOpen = showIntegratedAnalysis.value;
    showIntegratedAnalysis.value = !wasOpen;
    console.log(`PurpleStarView: 整合分析切換為 ${showIntegratedAnalysis.value}`);
    // 立即切換全域模組
    if (globalDisplayState) {
        const targetModule = showIntegratedAnalysis.value ? 'integrated' : 'purpleStar';
        globalDisplayState.setActiveModule(targetModule);
        console.log(`PurpleStarView: 立即切換全域模組到 ${targetModule}`);
    }
};
const handleSidebarClose = (done) => {
    if (integratedAnalysisLoading.value) {
        ElMessageBox.confirm('分析正在進行中，確定要關閉嗎？', '提示', {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            done();
        }).catch(() => {
            // 用戶取消關閉
        });
    }
    else {
        done();
    }
};
const performIntegratedAnalysis = async () => {
    if (!birthInfoForIntegration.value) {
        ElMessage.warning('請先完成紫微斗數計算');
        return;
    }
    try {
        integratedAnalysisLoading.value = true;
        integratedAnalysisError.value = null;
        loadingProgress.value = 0;
        currentLoadingStep.value = '正在準備解讀...';
        // 進度更新函數
        const updateProgress = (step, progress) => {
            currentLoadingStep.value = step;
            loadingProgress.value = progress;
        };
        updateProgress('正在計算八字命盤...', 20);
        // 確保位置數據格式正確
        const locationValue = typeof birthInfoForIntegration.value.location === 'string'
            ? birthInfoForIntegration.value.location
            : (birthInfoForIntegration.value.location?.name || '台北市');
        // 構建整合分析請求
        const analysisRequest = {
            birthDate: birthInfoForIntegration.value.birthDate,
            birthTime: birthInfoForIntegration.value.birthTime,
            gender: birthInfoForIntegration.value.gender,
            location: locationValue,
            // 使用新版API的分析選項
            options: {
                useAdvancedAlgorithm: true,
                includeCrossVerification: true,
                includeRealTimeData: true,
                confidenceScoring: true
            }
        };
        console.log('發送綜合解讀請求:', analysisRequest);
        updateProgress('正在整合紫微斗數與八字的傳統智慧...', 50);
        try {
            // 調用整合分析服務，啟用使用 session 中的命盤資料
            const result = await astrologyIntegrationService.performIntegratedAnalysis(analysisRequest, true);
            updateProgress('正在分析人生特質與運勢走向...', 80);
            // 獲取額外的解讀完整度評估 (使用 try/catch 避免此步驟失敗影響整體流程)
            try {
                const confidenceResult = await astrologyIntegrationService.getConfidenceAssessment(analysisRequest);
                console.log('解讀完整度評估結果:', confidenceResult);
            }
            catch (confidenceError) {
                console.warn('解讀完整度評估獲取失敗，但不影響主要解讀:', confidenceError);
            }
            updateProgress('正在生成人生指導建議...', 95);
            // 整合最終結果
            integratedAnalysisResult.value = result;
            // 轉換為分層數據以供 UnifiedLayeredController 使用
            try {
                layeredData.value = adaptIntegratedAnalysisToLayered(result);
                console.log('已轉換綜合分析為分層數據:', layeredData.value);
            }
            catch (adaptError) {
                console.warn('轉換分層數據時發生錯誤:', adaptError);
                layeredData.value = null;
            }
            // 保存整合分析結果到 sessionStorage
            storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, result);
            loadingProgress.value = 100;
            currentLoadingStep.value = '解讀完成!';
            ElMessage.success('綜合人生解讀完成');
        }
        catch (apiError) {
            console.error('API 請求失敗:', apiError);
            const errorMessage = apiError.response?.data?.error || apiError.message;
            integratedAnalysisError.value = '綜合解讀API錯誤: ' + errorMessage;
            ElMessage.error('綜合解讀API錯誤: ' + errorMessage);
        }
    }
    catch (error) {
        console.error('綜合解讀失敗:', error);
        const errorMessage = error.response?.data?.error || error.message || '綜合解讀失敗';
        integratedAnalysisError.value = errorMessage;
        ElMessage.error(errorMessage);
    }
    finally {
        integratedAnalysisLoading.value = false;
    }
};
const exportAnalysisResult = () => {
    if (!integratedAnalysisResult.value) {
        ElMessage.warning('沒有可匯出的解讀結果');
        return;
    }
    try {
        // 構建匯出數據
        const exportData = {
            readingDate: new Date().toLocaleDateString('zh-TW'),
            completeness: integratedAnalysisResult.value.data.analysisInfo.confidence,
            consensusFindings: integratedAnalysisResult.value.data.integratedAnalysis.consensusFindings,
            divergentFindings: integratedAnalysisResult.value.data.integratedAnalysis.divergentFindings,
            recommendations: integratedAnalysisResult.value.data.integratedAnalysis.recommendations,
            methodsUsed: integratedAnalysisResult.value.data.analysisInfo.methodsUsed
        };
        // 創建下載鏈接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `綜合人生解讀報告_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        ElMessage.success('解讀報告已匯出');
    }
    catch (error) {
        console.error('匯出失敗:', error);
        ElMessage.error('匯出失敗，請稍後再試');
    }
};
// 從 sessionStorage 加載數據
const loadFromSessionStorage = () => {
    try {
        console.log('開始從 sessionStorage 載入紫微斗數數據');
        // 記錄當前 sessionStorage 狀態
        const keysInStorage = Object.keys(sessionStorage).filter(key => key.startsWith('peixuan_'));
        console.log('sessionStorage 中的相關鍵:', keysInStorage);
        // 檢查出生信息
        const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
        if (savedBirthInfo) {
            console.log('找到保存的紫微斗數出生信息');
            birthInfoForIntegration.value = savedBirthInfo;
        }
        else {
            console.log('未找到保存的紫微斗數出生信息');
        }
        // 檢查紫微斗數命盤
        const savedPurpleStarChart = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART);
        if (savedPurpleStarChart) {
            console.log('找到保存的紫微斗數命盤數據');
            try {
                // 進行基本的數據驗證，確保數據完整性
                if (!savedPurpleStarChart.palaces || !Array.isArray(savedPurpleStarChart.palaces) ||
                    savedPurpleStarChart.palaces.length === 0) {
                    console.warn('保存的紫微斗數命盤數據缺少宮位信息');
                    throw new Error('命盤數據不完整');
                }
                purpleStarChart.value = savedPurpleStarChart;
            }
            catch (parseError) {
                console.error('解析保存的紫微斗數命盤數據時出錯:', parseError);
                // 不設置命盤數據，確保數據完整性
            }
        }
        else {
            console.log('未找到保存的紫微斗數命盤數據');
        }
        // 檢查整合分析結果
        const savedIntegratedAnalysis = storageService.getFromStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
        if (savedIntegratedAnalysis) {
            console.log('找到保存的整合分析結果');
            try {
                // 驗證整合分析數據
                if (!savedIntegratedAnalysis.data || !savedIntegratedAnalysis.data.integratedAnalysis) {
                    console.warn('保存的整合分析結果缺少必要的分析數據');
                    throw new Error('整合分析數據不完整');
                }
                integratedAnalysisResult.value = savedIntegratedAnalysis;
            }
            catch (parseError) {
                console.error('解析保存的整合分析結果時出錯:', parseError);
                // 清除可能損壞的數據
                storageService.clearAnalysisData('integrated');
            }
        }
        else {
            console.log('未找到保存的整合分析結果');
        }
        // 檢查並載入四化飛星資料
        console.log('檢查四化飛星資料...');
        const transformationData = storageService.getTransformationStarsData();
        if (transformationData.flows && Object.keys(transformationData.flows).length > 0) {
            console.log('找到保存的四化飛星資料:', {
                flows: Object.keys(transformationData.flows).length,
                combinations: transformationData.combinations.length,
                stars: !!transformationData.stars
            });
            transformationFlows.value = transformationData.flows;
            transformationCombinations.value = transformationData.combinations;
            if (transformationData.stars) {
                // 如果有四化星曜數據，也可以載入
                console.log('載入四化星曜數據');
            }
        }
        else {
            console.log('未找到保存的四化飛星資料');
            transformationFlows.value = {};
            transformationCombinations.value = [];
            multiLayerEnergies.value = {};
        }
        // 驗證數據一致性
        try {
            console.log('使用增強版存儲服務驗證紫微斗數數據');
            enhancedStorageService.validateStorageData();
        }
        catch (validateError) {
            console.error('驗證紫微斗數數據時出錯:', validateError);
        }
        console.log('從 sessionStorage 載入的紫微斗數數據總結:', {
            birthInfo: !!birthInfoForIntegration.value,
            purpleStarChart: !!purpleStarChart.value,
            integratedAnalysis: !!integratedAnalysisResult.value
        });
    }
    catch (error) {
        console.error('從 sessionStorage 載入紫微斗數數據時出錯:', error);
        // 只在確實有資料損壞時才清除，避免誤刪有效資料
        if (error instanceof Error && error.message && error.message.includes('Unexpected token')) {
            console.warn('檢測到 JSON 解析錯誤，清除可能損壞的資料');
            storageService.clearAnalysisData('purpleStar');
        }
        else {
            console.warn('載入錯誤可能是暫時性的，保留現有資料');
        }
    }
};
// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
    loadFromSessionStorage();
};
// 監聽全域顯示狀態變化
watch(() => showIntegratedAnalysis.value, (newValue) => {
    if (globalDisplayState) {
        // 當進入/離開整合分析時，切換對應的全域模組
        const targetModule = newValue ? 'integrated' : 'purpleStar';
        globalDisplayState.setActiveModule(targetModule);
        console.log(`PurpleStarView: 切換到全域模組 ${targetModule}`);
    }
}, { immediate: false });
// 監聽全域狀態變化，同步到本地狀態
watch(() => globalDisplayState?.activeModule.value, (newModule) => {
    console.log(`PurpleStarView: 全域模組變更為 ${newModule}`);
}, { immediate: true });
// 監聽全域狀態變化事件
onMounted(() => {
    // 監聽全域狀態變化
    const handleGlobalStateChange = (event) => {
        console.log('PurpleStarView: 收到全域狀態變化事件', event.detail);
    };
    window.addEventListener('global-display-state-changed', handleGlobalStateChange);
    // 清理事件監聽器
    watch(() => null, () => {
        window.removeEventListener('global-display-state-changed', handleGlobalStateChange);
    });
});
// 生命週期鉤子 - 組件掛載時載入數據
onMounted(() => {
    console.log('PurpleStarView 組件已掛載');
    try {
        setupComponentData();
        // useDisplayMode composable 會自動從 localStorage 加載顯示偏好
        // 初始化全域狀態同步
        if (globalDisplayState) {
            console.log('PurpleStarView: 全域顯示狀態可用，初始化同步');
            // 設置當前模組為 purpleStar
            globalDisplayState.setActiveModule('purpleStar');
            // 將本地狀態同步到全域狀態（簡化版不再需要此步驟）
            const currentLocalDepth = localDisplayMode.value;
            // globalDisplayState.setDisplayDepth('purpleStar', currentLocalDepth); // 簡化版不再支援此方法
            console.log(`PurpleStarView: 使用本地深度 ${currentLocalDepth}，無需同步到全域狀態`);
        }
        else {
            console.warn('PurpleStarView: 全域顯示狀態不可用，使用本地狀態');
        }
    }
    catch (error) {
        console.error('紫微斗數組件初始化過程中發生錯誤:', error);
        // 只在確實無法恢復時才清除資料
        if (error instanceof Error && (error.name === 'SecurityError' || error.message.includes('quota'))) {
            console.warn('儲存空間問題，清除資料以釋放空間');
            storageService.clearAnalysisData('purpleStar');
            ElMessage.warning('因儲存空間問題，已重置分析狀態');
        }
        else {
            console.warn('初始化錯誤可能是暫時性的，保留現有資料');
            ElMessage.info('載入時發生暫時性錯誤，請稍後再試');
        }
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['purple-star-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['view-description']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-header']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-content']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['features-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "purple-star-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-content" },
    ...{ class: ({ 'with-sidebar': __VLS_ctx.showIntegratedAnalysis }) },
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
    (__VLS_ctx.$t('astrology.purple_star_detail.title'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    if (__VLS_ctx.purpleStarChart && __VLS_ctx.birthInfoForIntegration) {
        const __VLS_12 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ 'onClick': {} },
            type: "success",
            icon: (__VLS_ctx.Connection),
            loading: (__VLS_ctx.integratedAnalysisLoading),
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClick': {} },
            type: "success",
            icon: (__VLS_ctx.Connection),
            loading: (__VLS_ctx.integratedAnalysisLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_16;
        let __VLS_17;
        let __VLS_18;
        const __VLS_19 = {
            onClick: (__VLS_ctx.toggleIntegratedAnalysis)
        };
        __VLS_15.slots.default;
        (__VLS_ctx.showIntegratedAnalysis ? '隱藏' : '綜合解讀');
        var __VLS_15;
    }
    if (__VLS_ctx.purpleStarChart) {
        const __VLS_20 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            type: "danger",
            icon: (__VLS_ctx.Delete),
            size: "small",
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            type: "danger",
            icon: (__VLS_ctx.Delete),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onClick: (__VLS_ctx.clearData)
        };
        __VLS_23.slots.default;
        var __VLS_23;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "view-description" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.$t('astrology.purple_star_detail.description'));
if (__VLS_ctx.purpleStarChart && !__VLS_ctx.showIntegratedAnalysis) {
    const __VLS_28 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        title: "💡 提示",
        description: "您可以點擊右上角「綜合解讀」來獲得八字與紫微斗數的全面人生解讀",
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mt-3 text-center-alert" },
        ...{ style: {} },
    }));
    const __VLS_30 = __VLS_29({
        title: "💡 提示",
        description: "您可以點擊右上角「綜合解讀」來獲得八字與紫微斗數的全面人生解讀",
        type: "info",
        closable: (false),
        showIcon: true,
        ...{ class: "mt-3 text-center-alert" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
/** @type {[typeof StorageStatusIndicator, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(StorageStatusIndicator, new StorageStatusIndicator({
    ...{ class: "mt-3" },
}));
const __VLS_33 = __VLS_32({
    ...{ class: "mt-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
var __VLS_11;
var __VLS_7;
const __VLS_35 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}));
const __VLS_37 = __VLS_36({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
const __VLS_39 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    shadow: "hover",
}));
const __VLS_41 = __VLS_40({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_42.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_42.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t('astrology.purple_star_detail.inputSection'));
}
/** @type {[typeof PurpleStarInputForm, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(PurpleStarInputForm, new PurpleStarInputForm({
    ...{ 'onSubmit': {} },
}));
const __VLS_44 = __VLS_43({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_46;
let __VLS_47;
let __VLS_48;
const __VLS_49 = {
    onSubmit: (__VLS_ctx.handleSubmit)
};
var __VLS_45;
var __VLS_42;
var __VLS_38;
const __VLS_50 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}));
const __VLS_52 = __VLS_51({
    xs: (24),
    sm: (24),
    md: (12),
    lg: (12),
    xl: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
if (__VLS_ctx.purpleStarChart) {
    const __VLS_54 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        shadow: "hover",
    }));
    const __VLS_56 = __VLS_55({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_57.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        /** @type {[typeof UnifiedLayeredController, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(UnifiedLayeredController, new UnifiedLayeredController({
            ...{ 'onLevelChanged': {} },
            ...{ 'onUpdate:modelValue': {} },
            moduleType: ('purpleStar'),
            layeredData: (__VLS_ctx.layeredData),
            dataCompleteness: (__VLS_ctx.dataCompleteness),
            enableSync: (true),
            isMobile: (__VLS_ctx.isMobile),
            isCompact: (true),
            showToolbar: (false),
            modelValue: (__VLS_ctx.displayMode),
            ...{ class: "purple-star-controller" },
            ignoreDataCompleteness: (true),
        }));
        const __VLS_59 = __VLS_58({
            ...{ 'onLevelChanged': {} },
            ...{ 'onUpdate:modelValue': {} },
            moduleType: ('purpleStar'),
            layeredData: (__VLS_ctx.layeredData),
            dataCompleteness: (__VLS_ctx.dataCompleteness),
            enableSync: (true),
            isMobile: (__VLS_ctx.isMobile),
            isCompact: (true),
            showToolbar: (false),
            modelValue: (__VLS_ctx.displayMode),
            ...{ class: "purple-star-controller" },
            ignoreDataCompleteness: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        let __VLS_61;
        let __VLS_62;
        let __VLS_63;
        const __VLS_64 = {
            onLevelChanged: (__VLS_ctx.handleLevelChanged)
        };
        const __VLS_65 = {
            'onUpdate:modelValue': (__VLS_ctx.handleDisplayModeUpdate)
        };
        var __VLS_60;
    }
    /** @type {[typeof PurpleStarChartDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(PurpleStarChartDisplay, new PurpleStarChartDisplay({
        ...{ 'onUpdate:displayDepth': {} },
        chartData: (__VLS_ctx.purpleStarChart),
        isLoading: (false),
        showCyclesDetail: (true),
        displayDepth: (__VLS_ctx.displayMode),
    }));
    const __VLS_67 = __VLS_66({
        ...{ 'onUpdate:displayDepth': {} },
        chartData: (__VLS_ctx.purpleStarChart),
        isLoading: (false),
        showCyclesDetail: (true),
        displayDepth: (__VLS_ctx.displayMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    let __VLS_69;
    let __VLS_70;
    let __VLS_71;
    const __VLS_72 = {
        'onUpdate:displayDepth': (__VLS_ctx.changeDisplayMode)
    };
    var __VLS_68;
    if (Object.keys(__VLS_ctx.transformationFlows).length > 0) {
        /** @type {[typeof TransformationStarsDisplay, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(TransformationStarsDisplay, new TransformationStarsDisplay({
            ...{ 'onUpdate:displayMode': {} },
            chartData: (__VLS_ctx.purpleStarChart),
            mingGan: (__VLS_ctx.purpleStarChart.mingGan || ''),
            displayMode: (__VLS_ctx.displayMode),
            transformationFlows: (__VLS_ctx.transformationFlows),
            transformationCombinations: (__VLS_ctx.transformationCombinations || []),
            multiLayerEnergies: (__VLS_ctx.multiLayerEnergies),
            ...{ class: "mt-4" },
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onUpdate:displayMode': {} },
            chartData: (__VLS_ctx.purpleStarChart),
            mingGan: (__VLS_ctx.purpleStarChart.mingGan || ''),
            displayMode: (__VLS_ctx.displayMode),
            transformationFlows: (__VLS_ctx.transformationFlows),
            transformationCombinations: (__VLS_ctx.transformationCombinations || []),
            multiLayerEnergies: (__VLS_ctx.multiLayerEnergies),
            ...{ class: "mt-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_76;
        let __VLS_77;
        let __VLS_78;
        const __VLS_79 = {
            'onUpdate:displayMode': (__VLS_ctx.changeDisplayMode)
        };
        var __VLS_75;
    }
    else if (__VLS_ctx.displayMode !== 'minimal' && Object.keys(__VLS_ctx.transformationFlows).length === 0 && __VLS_ctx.purpleStarChart) {
        const __VLS_80 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            title: "四化飛星數據缺失",
            description: (`當前命盤缺少四化飛星數據。命宮天干：${__VLS_ctx.purpleStarChart.mingGan || '未知'}，請檢查API響應是否包含四化數據。`),
            type: "warning",
            closable: (false),
            ...{ class: "mt-4" },
        }));
        const __VLS_82 = __VLS_81({
            title: "四化飛星數據缺失",
            description: (`當前命盤缺少四化飛星數據。命宮天干：${__VLS_ctx.purpleStarChart.mingGan || '未知'}，請檢查API響應是否包含四化數據。`),
            type: "warning",
            closable: (false),
            ...{ class: "mt-4" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    }
    var __VLS_57;
}
else {
    const __VLS_84 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        shadow: "hover",
    }));
    const __VLS_86 = __VLS_85({
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "placeholder" },
    });
    const __VLS_88 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        size: (64),
        color: "#c0c4cc",
    }));
    const __VLS_90 = __VLS_89({
        size: (64),
        color: "#c0c4cc",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    const __VLS_92 = {}.StarFilled;
    /** @type {[typeof __VLS_components.StarFilled, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
    const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
    var __VLS_91;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    var __VLS_87;
}
var __VLS_53;
var __VLS_3;
const __VLS_96 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.showIntegratedAnalysis),
    title: (__VLS_ctx.integratedAnalysisTitle),
    direction: "rtl",
    size: "45%",
    beforeClose: (__VLS_ctx.handleSidebarClose),
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.showIntegratedAnalysis),
    title: (__VLS_ctx.integratedAnalysisTitle),
    direction: "rtl",
    size: "45%",
    beforeClose: (__VLS_ctx.handleSidebarClose),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "integrated-analysis-sidebar" },
});
if (!__VLS_ctx.integratedAnalysisResult && !__VLS_ctx.integratedAnalysisLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-intro" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intro-header" },
    });
    const __VLS_100 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        size: (48),
        color: "#409EFF",
    }));
    const __VLS_102 = __VLS_101({
        size: (48),
        color: "#409EFF",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    const __VLS_104 = {}.TrendCharts;
    /** @type {[typeof __VLS_components.TrendCharts, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
    const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
    var __VLS_103;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intro-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "features-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-item" },
    });
    const __VLS_108 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        color: "#67C23A",
    }));
    const __VLS_110 = __VLS_109({
        color: "#67C23A",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    const __VLS_112 = {}.Check;
    /** @type {[typeof __VLS_components.Check, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
    const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
    var __VLS_111;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-item" },
    });
    const __VLS_116 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        color: "#E6A23C",
    }));
    const __VLS_118 = __VLS_117({
        color: "#E6A23C",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    const __VLS_120 = {}.Warning;
    /** @type {[typeof __VLS_components.Warning, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
    var __VLS_119;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-item" },
    });
    const __VLS_124 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        color: "#409EFF",
    }));
    const __VLS_126 = __VLS_125({
        color: "#409EFF",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.DataAnalysis;
    /** @type {[typeof __VLS_components.DataAnalysis, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
    var __VLS_127;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-item" },
    });
    const __VLS_132 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        color: "#F56C6C",
    }));
    const __VLS_134 = __VLS_133({
        color: "#F56C6C",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    const __VLS_136 = {}.Bell;
    /** @type {[typeof __VLS_components.Bell, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
    const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
    var __VLS_135;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_140 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.integratedAnalysisLoading),
        ...{ class: "start-analysis-btn" },
    }));
    const __VLS_142 = __VLS_141({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.integratedAnalysisLoading),
        ...{ class: "start-analysis-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    let __VLS_144;
    let __VLS_145;
    let __VLS_146;
    const __VLS_147 = {
        onClick: (__VLS_ctx.performIntegratedAnalysis)
    };
    __VLS_143.slots.default;
    var __VLS_143;
}
else if (__VLS_ctx.integratedAnalysisLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-loading" },
    });
    const __VLS_148 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        size: (60),
        ...{ class: "is-loading" },
    }));
    const __VLS_150 = __VLS_149({
        size: (60),
        ...{ class: "is-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    const __VLS_152 = {}.Loading;
    /** @type {[typeof __VLS_components.Loading, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
    const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
    var __VLS_151;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    const __VLS_156 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        percentage: (__VLS_ctx.loadingProgress),
        showText: (false),
    }));
    const __VLS_158 = __VLS_157({
        percentage: (__VLS_ctx.loadingProgress),
        showText: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "loading-step" },
    });
    (__VLS_ctx.currentLoadingStep);
}
else if (__VLS_ctx.integratedAnalysisResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-results" },
    });
    /** @type {[typeof IntegratedAnalysisDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent(IntegratedAnalysisDisplay, new IntegratedAnalysisDisplay({
        integratedAnalysis: (__VLS_ctx.integratedAnalysisResult),
        loading: (false),
        error: (__VLS_ctx.integratedAnalysisError),
    }));
    const __VLS_161 = __VLS_160({
        integratedAnalysis: (__VLS_ctx.integratedAnalysisResult),
        loading: (false),
        error: (__VLS_ctx.integratedAnalysisError),
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-actions" },
    });
    const __VLS_163 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.integratedAnalysisLoading),
    }));
    const __VLS_165 = __VLS_164({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.integratedAnalysisLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    let __VLS_167;
    let __VLS_168;
    let __VLS_169;
    const __VLS_170 = {
        onClick: (__VLS_ctx.performIntegratedAnalysis)
    };
    __VLS_166.slots.default;
    var __VLS_166;
    const __VLS_171 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_173 = __VLS_172({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    let __VLS_175;
    let __VLS_176;
    let __VLS_177;
    const __VLS_178 = {
        onClick: (__VLS_ctx.exportAnalysisResult)
    };
    __VLS_174.slots.default;
    var __VLS_174;
}
if (__VLS_ctx.integratedAnalysisError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-error" },
    });
    const __VLS_179 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        title: (__VLS_ctx.integratedAnalysisError),
        type: "error",
        closable: (false),
        showIcon: true,
    }));
    const __VLS_181 = __VLS_180({
        title: (__VLS_ctx.integratedAnalysisError),
        type: "error",
        closable: (false),
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    const __VLS_183 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "retry-btn" },
    }));
    const __VLS_185 = __VLS_184({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "retry-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    let __VLS_187;
    let __VLS_188;
    let __VLS_189;
    const __VLS_190 = {
        onClick: (__VLS_ctx.performIntegratedAnalysis)
    };
    __VLS_186.slots.default;
    var __VLS_186;
}
var __VLS_99;
/** @type {__VLS_StyleScopedClasses['purple-star-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['with-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['view-description']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['purple-star-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['integrated-analysis-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-intro']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-header']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-content']} */ ;
/** @type {__VLS_StyleScopedClasses['features-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['start-analysis-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-step']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-results']} */ ;
/** @type {__VLS_StyleScopedClasses['result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-error']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StarFilled: StarFilled,
            Connection: Connection,
            TrendCharts: TrendCharts,
            Check: Check,
            Warning: Warning,
            DataAnalysis: DataAnalysis,
            Bell: Bell,
            Loading: Loading,
            Delete: Delete,
            PurpleStarInputForm: PurpleStarInputForm,
            PurpleStarChartDisplay: PurpleStarChartDisplay,
            TransformationStarsDisplay: TransformationStarsDisplay,
            IntegratedAnalysisDisplay: IntegratedAnalysisDisplay,
            UnifiedLayeredController: UnifiedLayeredController,
            StorageStatusIndicator: StorageStatusIndicator,
            purpleStarChart: purpleStarChart,
            birthInfoForIntegration: birthInfoForIntegration,
            transformationFlows: transformationFlows,
            transformationCombinations: transformationCombinations,
            multiLayerEnergies: multiLayerEnergies,
            displayMode: displayMode,
            layeredData: layeredData,
            dataCompleteness: dataCompleteness,
            changeDisplayMode: changeDisplayMode,
            handleDisplayModeUpdate: handleDisplayModeUpdate,
            handleLevelChanged: handleLevelChanged,
            showIntegratedAnalysis: showIntegratedAnalysis,
            integratedAnalysisLoading: integratedAnalysisLoading,
            integratedAnalysisResult: integratedAnalysisResult,
            integratedAnalysisError: integratedAnalysisError,
            loadingProgress: loadingProgress,
            currentLoadingStep: currentLoadingStep,
            isMobile: isMobile,
            integratedAnalysisTitle: integratedAnalysisTitle,
            clearData: clearData,
            handleSubmit: handleSubmit,
            toggleIntegratedAnalysis: toggleIntegratedAnalysis,
            handleSidebarClose: handleSidebarClose,
            performIntegratedAnalysis: performIntegratedAnalysis,
            exportAnalysisResult: exportAnalysisResult,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PurpleStarView.vue.js.map