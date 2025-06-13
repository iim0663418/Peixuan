import axios from 'axios';
import { ref } from 'vue';
class AstrologyIntegrationService {
    baseUrl = '/api/v1/astrology';
    /**
     * 執行時運分析（整合八字與紫微斗數）
     */
    async performIntegratedAnalysis(birthInfo, useSessionCharts = false) {
        try {
            // 確保請求數據格式正確
            const requestData = {
                birthDate: birthInfo.birthDate,
                birthTime: birthInfo.birthTime,
                gender: birthInfo.gender,
                location: typeof birthInfo.location === 'string' ? birthInfo.location : birthInfo.location?.name || '台北市',
                options: birthInfo.options || {
                    useAdvancedAlgorithm: true,
                    includeCrossVerification: true,
                    includeRealTimeData: true,
                    confidenceScoring: true
                },
                useSessionCharts: useSessionCharts // 標記是否使用 sessionStorage 中的命盤資料
            };
            // 如果啟用使用 session 中的命盤資料，則添加這些資料到請求中
            if (useSessionCharts) {
                const storageService = await import('@/utils/storageService').then(m => m.default);
                // 獲取並添加八字命盤數據
                const baziChart = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_CHART);
                if (baziChart) {
                    requestData.baziChart = baziChart;
                    console.log('從 sessionStorage 獲取並添加八字命盤數據');
                }
                // 獲取並添加紫微斗數命盤數據
                const purpleStarChart = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART);
                if (purpleStarChart) {
                    requestData.purpleStarChart = purpleStarChart;
                    console.log('從 sessionStorage 獲取並添加紫微斗數命盤數據');
                }
            }
            console.log('發送整合分析請求:', requestData);
            // 發送API請求
            const response = await axios.post(`${this.baseUrl}/integrated-analysis`, requestData);
            return response.data;
        }
        catch (error) {
            console.error('多術數交互驗證分析失敗', error);
            throw error;
        }
    }
    /**
     * 獲取信心度評估
     */
    async getConfidenceAssessment(birthInfo) {
        try {
            // 發送API請求
            const response = await axios.post(`${this.baseUrl}/confidence-assessment`, birthInfo);
            return response.data;
        }
        catch (error) {
            console.error('信心度評估失敗', error);
            throw error;
        }
    }
    /**
     * 創建響應式的分析結果
     */
    createReactiveAnalysis() {
        return {
            integratedAnalysis: ref(null),
            confidenceAssessment: ref(null),
            loading: ref(false),
            error: ref(null),
            async analyze(birthInfo, useSessionCharts = false) {
                this.loading.value = true;
                this.error.value = null;
                try {
                    const integrationService = new AstrologyIntegrationService();
                    const analysisResult = await integrationService.performIntegratedAnalysis(birthInfo, useSessionCharts);
                    // 只有當 useSessionCharts 為 false 時才呼叫信心度評估
                    const confidenceResult = useSessionCharts ? null :
                        await integrationService.getConfidenceAssessment(birthInfo);
                    this.integratedAnalysis.value = analysisResult;
                    this.confidenceAssessment.value = confidenceResult;
                }
                catch (error) {
                    this.error.value = error instanceof Error ? error.message : '未知錯誤';
                    this.integratedAnalysis.value = null;
                    this.confidenceAssessment.value = null;
                }
                finally {
                    this.loading.value = false;
                }
            }
        };
    }
}
export default new AstrologyIntegrationService();
//# sourceMappingURL=astrologyIntegrationService.js.map