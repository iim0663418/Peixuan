<template>
  <div class="purple-star-container">
    <!-- 主要內容區域 -->
    <div class="main-content" :class="{ 'with-sidebar': showIntegratedAnalysis }">
      <el-row :gutter="20">
        <el-col :span="24" class="mb-4">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>{{ $t('astrology.purple_star_detail.title') }}</span>
                <div class="header-actions">
                  <el-button 
                    v-if="purpleStarChart && birthInfoForIntegration"
                    type="success" 
                    :icon="Connection"
                    @click="toggleIntegratedAnalysis"
                    :loading="integratedAnalysisLoading"
                  >
                    {{ showIntegratedAnalysis ? '隱藏' : '智能交叉驗證' }}
                  </el-button>
                  <el-button
                    v-if="purpleStarChart"
                    type="danger"
                    :icon="Delete"
                    @click="clearData"
                    size="small"
                  >
                    清除數據
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="view-description">
              <p>{{ $t('astrology.purple_star_detail.description') }}</p>
              <el-alert 
                v-if="purpleStarChart && !showIntegratedAnalysis"
                title="💡 提示"
                description="您可以點擊右上角「智能交叉驗證」來獲得八字與紫微斗數的多維度洞察分析"
                type="info"
                :closable="false"
                show-icon
                class="mt-3 text-center-alert"
                style="text-align: center; display: flex; justify-content: center;"
              />
              
              <!-- 添加儲存狀態指示器 -->
              <StorageStatusIndicator class="mt-3" />
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>{{ $t('astrology.purple_star_detail.inputSection') }}</span>
            </template>
            
            <PurpleStarInputForm @submit="handleSubmit" />
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="hover" v-if="purpleStarChart">
            <template #header>
              <span>分析結果</span>
            </template>
            
            <PurpleStarChartDisplay 
              :chartData="purpleStarChart" 
              :isLoading="false"
              :showCyclesDetail="true"
            />
          </el-card>
          
          <el-card shadow="hover" v-else>
            <div class="placeholder">
              <el-icon :size="64" color="#c0c4cc">
                <StarFilled />
              </el-icon>
              <p>請填寫左側表單開始分析</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 智能交叉驗證側邊欄 -->
    <el-drawer
      v-model="showIntegratedAnalysis"
      :title="integratedAnalysisTitle"
      direction="rtl"
      size="45%"
      :before-close="handleSidebarClose"
    >
      <div class="integrated-analysis-sidebar">
        <div v-if="!integratedAnalysisResult && !integratedAnalysisLoading" class="analysis-intro">
          <div class="intro-header">
            <el-icon :size="48" color="#409EFF"><TrendCharts /></el-icon>
            <h3>多維度命運洞察</h3>
          </div>
          
          <div class="intro-content">
            <p>結合八字與紫微斗數的雙重驗證，為您提供更加準確和全面的命理分析。</p>
            
            <div class="features-grid">
              <div class="feature-item">
                <el-icon color="#67C23A"><Check /></el-icon>
                <span>交叉驗證準確性</span>
              </div>
              <div class="feature-item">
                <el-icon color="#E6A23C"><Warning /></el-icon>
                <span>矛盾點分析</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409EFF"><DataAnalysis /></el-icon>
                <span>信心度評分</span>
              </div>
              <div class="feature-item">
                <el-icon color="#F56C6C"><Bell /></el-icon>
                <span>個性化建議</span>
              </div>
            </div>

            <el-button 
              type="primary" 
              size="large" 
              @click="performIntegratedAnalysis"
              :loading="integratedAnalysisLoading"
              class="start-analysis-btn"
            >
              開始智能分析
            </el-button>
          </div>
        </div>

        <div v-else-if="integratedAnalysisLoading" class="analysis-loading">
          <el-icon :size="60" class="is-loading"><Loading /></el-icon>
          <h3>正在進行多術數交叉驗證...</h3>
          <p>系統正在同時計算八字與紫微斗數，並進行智能比對分析</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ currentLoadingStep }}</p>
        </div>

        <div v-else-if="integratedAnalysisResult" class="analysis-results">
          <IntegratedAnalysisDisplay 
            :integratedAnalysis="integratedAnalysisResult"
            :loading="false"
            :error="integratedAnalysisError"
          />
          
          <!-- 額外的操作按鈕 -->
          <div class="result-actions">
            <el-button @click="performIntegratedAnalysis" :loading="integratedAnalysisLoading">
              重新分析
            </el-button>
            <el-button type="success" @click="exportAnalysisResult">
              匯出報告
            </el-button>
          </div>
        </div>

        <div v-if="integratedAnalysisError" class="analysis-error">
          <el-alert
            :title="integratedAnalysisError"
            type="error"
            :closable="false"
            show-icon
          />
          <el-button 
            type="primary" 
            @click="performIntegratedAnalysis" 
            class="retry-btn"
          >
            重試
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  StarFilled, 
  Connection, 
  TrendCharts, 
  Check, 
  Warning, 
  DataAnalysis, 
  Bell, 
  Loading,
  Delete
} from '@element-plus/icons-vue';
import PurpleStarInputForm from '@/components/PurpleStarInputForm.vue';
import PurpleStarChartDisplay from '@/components/PurpleStarChartDisplay.vue';
import IntegratedAnalysisDisplay from '@/components/IntegratedAnalysisDisplay.vue';
import StorageStatusIndicator from '@/components/StorageStatusIndicator.vue';
import apiService from '@/services/apiService';
import astrologyIntegrationService from '@/services/astrologyIntegrationService';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
import type { PurpleStarChart, IntegratedAnalysisResponse } from '@/types/astrologyTypes';

// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();

// 主要狀態
const purpleStarChart = ref<PurpleStarChart | null>(null);
const birthInfoForIntegration = ref<any>(null);

// 整合分析狀態
const showIntegratedAnalysis = ref(false);
const integratedAnalysisLoading = ref(false);
const integratedAnalysisResult = ref<IntegratedAnalysisResponse | null>(null);
const integratedAnalysisError = ref<string | null>(null);
const loadingProgress = ref(0);
const currentLoadingStep = ref('正在準備分析...');

// 計算屬性
const integratedAnalysisTitle = computed(() => {
  return integratedAnalysisResult.value ? '智能交叉驗證結果' : '多術數交叉驗證';
});

// 數據清除函數
const clearData = () => {
  ElMessageBox.confirm('確定要清除當前的紫微斗數計算結果嗎？', '清除數據', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    storageService.clearAnalysisData('purpleStar');
    purpleStarChart.value = null;
    birthInfoForIntegration.value = null;
    ElMessage.success('紫微斗數數據已清除');
  }).catch(() => {
    // 用戶取消操作
  });
};

// 主要提交處理
const handleSubmit = async (birthInfo: any) => {
  try {
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
        maxAge: 100
      }
    };
    
    console.log('發送請求數據:', requestData);
    
    // 使用後端 API 進行紫微斗數計算
    const response = await apiService.calculatePurpleStar(requestData);
    
    console.log('API 響應:', response);
    console.log('命盤數據:', response.data?.chart);
    console.log('大限資訊:', response.data?.chart?.daXian);
    console.log('小限資訊:', response.data?.chart?.xiaoXian);
    console.log('流年太歲資訊:', response.data?.chart?.liuNianTaiSui);
    
    // 正確提取命盤數據
    purpleStarChart.value = response.data?.chart;
    
    // 保存命盤數據到 sessionStorage
    storageService.saveToStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART, response.data?.chart);
    
    ElMessage.success('紫微斗數計算完成');
  } catch (error) {
    console.error('紫微斗數計算錯誤:', error);
    ElMessage.error(
      error instanceof Error 
        ? error.message 
        : '紫微斗數計算失敗，請稍後再試'
    );
  }
};

// 整合分析相關功能
const toggleIntegratedAnalysis = () => {
  if (showIntegratedAnalysis.value) {
    showIntegratedAnalysis.value = false;
  } else {
    showIntegratedAnalysis.value = true;
  }
};

const handleSidebarClose = (done: () => void) => {
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
  } else {
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
    currentLoadingStep.value = '正在準備分析...';

    // 進度更新函數
    const updateProgress = (step: string, progress: number) => {
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

    console.log('發送整合分析請求:', analysisRequest);
    
    updateProgress('正在進行紫微斗數與八字交叉對比...', 50);
    
    try {
      // 調用整合分析服務
      const result = await astrologyIntegrationService.performIntegratedAnalysis(analysisRequest);
      
      updateProgress('正在分析一致性與矛盾點...', 80);
      
      // 獲取額外的信心度評估 (使用 try/catch 避免此步驟失敗影響整體流程)
      try {
        const confidenceResult = await astrologyIntegrationService.getConfidenceAssessment(analysisRequest);
        console.log('信心度評估結果:', confidenceResult);
      } catch (confidenceError) {
        console.warn('信心度評估獲取失敗，但不影響主要分析:', confidenceError);
      }
      
      updateProgress('正在生成智能建議...', 95);
      
      // 整合最終結果
      integratedAnalysisResult.value = result;
      
      // 保存整合分析結果到 sessionStorage
      storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, result);
      
      loadingProgress.value = 100;
      currentLoadingStep.value = '分析完成!';
      
      ElMessage.success('雙軸交互驗證分析完成');
    } catch (apiError: any) {
      console.error('API 請求失敗:', apiError);
      const errorMessage = apiError.response?.data?.error || apiError.message;
      integratedAnalysisError.value = '整合分析API錯誤: ' + errorMessage;
      ElMessage.error('整合分析API錯誤: ' + errorMessage);
    }
    
  } catch (error: any) {
    console.error('整合分析失敗:', error);
    const errorMessage = error.response?.data?.error || error.message || '整合分析失敗';
    integratedAnalysisError.value = errorMessage;
    ElMessage.error(errorMessage);
  } finally {
    integratedAnalysisLoading.value = false;
  }
};

const exportAnalysisResult = () => {
  if (!integratedAnalysisResult.value) {
    ElMessage.warning('沒有可匯出的分析結果');
    return;
  }

  try {
    // 構建匯出數據
    const exportData = {
      analysisDate: new Date().toLocaleDateString('zh-TW'),
      confidence: integratedAnalysisResult.value.data.analysisInfo.confidence,
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
    link.download = `命理分析報告_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success('分析報告已匯出');
  } catch (error) {
    console.error('匯出失敗:', error);
    ElMessage.error('匯出失敗，請稍後再試');
  }
};

// 從 sessionStorage 加載數據
const loadFromSessionStorage = () => {
  try {
    console.log('開始從 sessionStorage 載入紫微斗數數據');
    
    // 記錄當前 sessionStorage 狀態
    const keysInStorage = Object.keys(sessionStorage).filter(key => 
      key.startsWith('peixuan_')
    );
    
    console.log('sessionStorage 中的相關鍵:', keysInStorage);
    
    // 檢查出生信息
    const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
    if (savedBirthInfo) {
      console.log('找到保存的紫微斗數出生信息');
      birthInfoForIntegration.value = savedBirthInfo;
    } else {
      console.log('未找到保存的紫微斗數出生信息');
    }

    // 檢查紫微斗數命盤
    const savedPurpleStarChart = storageService.getFromStorage<PurpleStarChart>(storageService.STORAGE_KEYS.PURPLE_STAR_CHART);
    if (savedPurpleStarChart) {
      console.log('找到保存的紫微斗數命盤數據');
      try {
        // 進行基本的數據驗證，確保數據完整性
        if (!savedPurpleStarChart.palaces || !Array.isArray(savedPurpleStarChart.palaces) || 
            savedPurpleStarChart.palaces.length === 0) {
          console.warn('保存的紫微斗數命盤數據缺少宮位信息');
          throw new Error('命盤數據不完整');
        }
        
        purpleStarChart.value = savedPurpleStarChart as PurpleStarChart;
      } catch (parseError) {
        console.error('解析保存的紫微斗數命盤數據時出錯:', parseError);
        // 不設置命盤數據，確保數據完整性
      }
    } else {
      console.log('未找到保存的紫微斗數命盤數據');
    }

    // 檢查整合分析結果
    const savedIntegratedAnalysis = storageService.getFromStorage<IntegratedAnalysisResponse>(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
    if (savedIntegratedAnalysis) {
      console.log('找到保存的整合分析結果');
      try {
        // 驗證整合分析數據
        if (!savedIntegratedAnalysis.data || !savedIntegratedAnalysis.data.integratedAnalysis) {
          console.warn('保存的整合分析結果缺少必要的分析數據');
          throw new Error('整合分析數據不完整');
        }
        
        integratedAnalysisResult.value = savedIntegratedAnalysis as IntegratedAnalysisResponse;
      } catch (parseError) {
        console.error('解析保存的整合分析結果時出錯:', parseError);
        // 清除可能損壞的數據
        storageService.clearAnalysisData('integrated');
      }
    } else {
      console.log('未找到保存的整合分析結果');
    }
    
    // 驗證數據一致性
    try {
      console.log('使用增強版存儲服務驗證紫微斗數數據');
      enhancedStorageService.validateStorageData();
    } catch (validateError) {
      console.error('驗證紫微斗數數據時出錯:', validateError);
    }
    
    console.log('從 sessionStorage 載入的紫微斗數數據總結:', {
      birthInfo: !!birthInfoForIntegration.value,
      purpleStarChart: !!purpleStarChart.value,
      integratedAnalysis: !!integratedAnalysisResult.value
    });
  } catch (error) {
    console.error('從 sessionStorage 載入紫微斗數數據時出錯:', error);
    // 出現嚴重錯誤時，清除可能損壞的數據
    storageService.clearAnalysisData('purpleStar');
  }
};

// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
  loadFromSessionStorage();
};

// 生命週期鉤子 - 組件掛載時載入數據
onMounted(() => {
  console.log('PurpleStarView 組件已掛載');
  try {
    setupComponentData();
  } catch (error) {
    console.error('紫微斗數組件初始化過程中發生錯誤:', error);
    // 在初始化失敗時嘗試回退到安全狀態
    storageService.clearAnalysisData('purpleStar');
    ElMessage.warning('紫微斗數數據載入時發生錯誤，已重置分析狀態');
  }
});
</script>

<style scoped>
.purple-star-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  transition: all 0.3s ease;
}

.main-content.with-sidebar {
  margin-right: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.view-description {
  margin-bottom: 20px;
}

.placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

.mb-4 {
  margin-bottom: 20px;
}

.mt-3 {
  margin-top: 15px;
}

/* 側邊欄樣式 */
.integrated-analysis-sidebar {
  padding: 0;
  height: 100%;
}

/* 介紹頁面樣式 */
.analysis-intro {
  padding: 30px;
  text-align: center;
}

.intro-header {
  margin-bottom: 30px;
}

.intro-header h3 {
  margin: 15px 0 0 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.intro-content p {
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.start-analysis-btn {
  margin-top: 30px;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 載入狀態樣式 */
.analysis-loading {
  padding: 40px 30px;
  text-align: center;
}

.analysis-loading h3 {
  margin: 20px 0 10px 0;
  color: #303133;
  font-size: 20px;
}

.analysis-loading p {
  color: #606266;
  margin: 10px 0;
  line-height: 1.6;
}

.analysis-loading .el-progress {
  margin: 25px 0 15px 0;
}

.loading-step {
  color: #409EFF !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

/* 結果頁面樣式 */
.analysis-results {
  padding: 0;
}

.result-actions {
  padding: 20px 30px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 錯誤狀態樣式 */
.analysis-error {
  padding: 30px;
  text-align: center;
}

.analysis-error .el-alert {
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 15px;
  width: 100%;
}

/* 抽屜覆蓋樣式 */
:deep(.el-drawer__header) {
  padding: 20px 30px 15px 30px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
}

:deep(.el-drawer__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 響應式設計 */
@media (max-width: 1400px) {
  :deep(.el-drawer) {
    width: 50% !important;
  }
}

@media (max-width: 1024px) {
  :deep(.el-drawer) {
    width: 60% !important;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  :deep(.el-drawer) {
    width: 85% !important;
  }
  
  .main-content.with-sidebar {
    margin-right: 0;
  }
  
  .analysis-intro,
  .analysis-loading,
  .analysis-error {
    padding: 20px;
  }
  
  .intro-header h3 {
    font-size: 20px;
  }
  
  .intro-content p {
    font-size: 14px;
  }
  
  .feature-item {
    padding: 12px;
    font-size: 13px;
  }
}

/* 動畫效果 */
.el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 進度條自定義樣式 */
:deep(.el-progress-bar__outer) {
  background-color: #f0f2f5;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
}

/* 置中提示樣式 */
.text-center-alert {
  display: flex;
  justify-content: center;
}

.text-center-alert :deep(.el-alert__content) {
  text-align: center;
}

.text-center-alert :deep(.el-alert__description) {
  text-align: center;
  font-weight: bold;
}
</style>
