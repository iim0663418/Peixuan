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
              <div class="card-header">
                <span>分析結果</span>
                
                <!-- 保留空間用於未來元素 -->
              </div>
            </template>
            
            <PurpleStarChartDisplay 
              :chartData="purpleStarChart" 
              :isLoading="false"
              :showCyclesDetail="true"
              :displayDepth="displayMode"
              @update:displayDepth="changeDisplayMode"
            />
            
            <!-- 四化飛星顯示組件 -->
            <TransformationStarsDisplay
              v-if="displayMode !== 'minimal' && Object.keys(transformationFlows).length > 0"
              :chartData="purpleStarChart"
              :mingGan="purpleStarChart.mingGan || ''"
              :displayMode="displayMode"
              :transformationFlows="transformationFlows"
              :transformationCombinations="transformationCombinations || []"
              :multiLayerEnergies="multiLayerEnergies"
              @update:displayMode="changeDisplayMode"
              class="mt-4"
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
import { ref, computed, onMounted, watch } from 'vue';
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
import TransformationStarsDisplay from '@/components/TransformationStarsDisplay.vue';
import IntegratedAnalysisDisplay from '@/components/IntegratedAnalysisDisplay.vue';
import StorageStatusIndicator from '@/components/StorageStatusIndicator.vue';
import apiService from '@/services/apiService';
import astrologyIntegrationService from '@/services/astrologyIntegrationService';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
import { useDisplayMode } from '@/composables/useDisplayMode';
import type { DisplayMode } from '@/types/displayModes';
import type { PurpleStarChart, IntegratedAnalysisResponse, PurpleStarAPIResponse } from '@/types/astrologyTypes';

// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();

// 主要狀態
const purpleStarChart = ref<PurpleStarChart | null>(null);
const birthInfoForIntegration = ref<any>(null);
const transformationFlows = ref<Record<number, any>>({});
const transformationCombinations = ref<Array<any>>([]);
const multiLayerEnergies = ref<Record<number, any>>({});

// 使用顯示模式 composable
const { displayMode, mapDepthToMode } = useDisplayMode('purpleStar');

// 顯示模式選項
const displayModeOptions = [
  { value: 'minimal', label: '簡要預覽', tooltip: '最簡潔的命盤展示，僅呈現基本框架' },
  { value: 'compact', label: '精簡檢視', tooltip: '顯示主要星曜和基本四化效應，快速了解命盤特點' },
  { value: 'standard', label: '標準解讀', tooltip: '完整展示星曜信息和四化效應，深入解析命盤結構' },
  { value: 'comprehensive', label: '深度分析', tooltip: '全面詳盡的命盤分析，包含所有星曜、四化組合和多層次能量疊加' }
];

// 切換顯示模式
const changeDisplayMode = (mode: DisplayMode) => {
  // 直接設置 displayMode 的值，composable 內部會處理 localStorage 的保存
  displayMode.value = mode;
};

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
    const response = await apiService.calculatePurpleStar(requestData) as unknown as PurpleStarAPIResponse;
    
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
    } else {
      console.error('API 未返回四化飛星數據，無法顯示四化信息');
      
      // 不再自動添加默認值，而是清空相關引用避免錯誤
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
      
      // 提示用戶有數據缺失
      ElMessage.warning({
        message: '四化飛星數據缺失，部分分析功能將不可用',
        duration: 5000
      });
    }
    
    // 保存命盤數據到 sessionStorage
    storageService.saveToStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART, response.data.chart);
    
    console.groupEnd();
    ElMessage.success('紫微斗數計算完成');
  } catch (error: any) {
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
    // useDisplayMode composable 會自動從 localStorage 加載顯示偏好
  } catch (error) {
    console.error('紫微斗數組件初始化過程中發生錯誤:', error);
    // 在初始化失敗時嘗試回退到安全狀態
    storageService.clearAnalysisData('purpleStar');
    ElMessage.warning('紫微斗數數據載入時發生錯誤，已重置分析狀態');
  }
});
</script>

<style scoped>
/* 確保 el-card__body 是一個定位上下文 */
:deep(.el-card__body) {
  position: relative;
  overflow: visible;
}
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
  transition: margin-right 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.view-description {
  margin-bottom: 20px;
}

.view-description p {
  line-height: 1.6;
  color: #555;
}

.text-center-alert :deep(.el-alert__content) {
  margin: 0 auto;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #909399;
}

.placeholder p {
  margin-top: 20px;
}

/* 整合分析側邊欄樣式 */
.integrated-analysis-sidebar {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.analysis-intro {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.intro-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  text-align: center;
}

.intro-header h3 {
  margin-top: 15px;
  color: #409EFF;
  font-size: 1.8rem;
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.intro-content p {
  margin: 0 0 25px 0;
  line-height: 1.6;
  font-size: 1.05rem;
  text-align: center;
  color: #606266;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.start-analysis-btn {
  margin-top: auto;
  align-self: center;
  padding: 12px 24px;
  font-size: 1.1rem;
}

/* 載入分析狀態 */
.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 20px;
}

.analysis-loading h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #409EFF;
}

.analysis-loading p {
  margin-bottom: 30px;
  color: #606266;
}

.analysis-loading .el-progress {
  width: 100%;
  max-width: 400px;
  margin-bottom: 10px;
}

.loading-step {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #909399;
}

/* 分析結果 */
.result-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 15px;
}

/* 分析錯誤 */
.analysis-error {
  margin-top: 20px;
}

.retry-btn {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
}
</style>
