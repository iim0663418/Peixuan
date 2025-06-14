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
                    {{ showIntegratedAnalysis ? '隱藏' : '綜合解讀' }}
                  </el-button>
                  <el-button
                    v-if="purpleStarChart"
                    type="danger"
                    :icon="Delete"
                    @click="clearData"
                    size="small"
                  >
                    清除資料
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="view-description">
              <p>{{ $t('astrology.purple_star_detail.description') }}</p>
              <el-alert 
                v-if="purpleStarChart && !showIntegratedAnalysis"
                title="💡 提示"
                description="您可以點擊右上角「綜合解讀」來獲得八字與紫微斗數的全面人生解讀"
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

        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover">
            <template #header>
              <span>{{ $t('astrology.purple_star_detail.inputSection') }}</span>
            </template>
            
            <PurpleStarInputForm @submit="handleSubmit" />
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card shadow="hover" v-if="purpleStarChart">
            <template #header>
              <div class="card-header">
                <span>分析結果</span>
                
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
              v-if="Object.keys(transformationFlows).length > 0"
              :chartData="purpleStarChart"
              :mingGan="purpleStarChart.mingGan || ''"
              :displayMode="displayMode"
              :transformationFlows="transformationFlows"
              :transformationCombinations="transformationCombinations || []"
              :multiLayerEnergies="multiLayerEnergies"
              @update:displayMode="changeDisplayMode"
              class="mt-4"
            />
            
            <!-- 四化飛星資料缺失提示 -->
            <el-alert
              v-else-if="displayMode !== 'minimal' && Object.keys(transformationFlows).length === 0 && purpleStarChart"
              title="四化飛星資料缺失"
              :description="`當前命盤缺少四化飛星資料。命宮天干：${purpleStarChart.mingGan || '未知'}，請檢查API響應是否包含四化資料。`"
              type="warning"
              :closable="false"
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

    <!-- 綜合人生解讀側邊欄 -->
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
            <h3>綜合人生解讀</h3>
          </div>
          
          <div class="intro-content">
            <p>整合八字與紫微斗數的傳統智慧，為您提供更加全面和深入的人生解讀。</p>
            
            <div class="features-grid">
              <div class="feature-item">
                <el-icon color="#67C23A"><Check /></el-icon>
                <span>多角度全面分析</span>
              </div>
              <div class="feature-item">
                <el-icon color="#E6A23C"><Warning /></el-icon>
                <span>深層特質解析</span>
              </div>
              <div class="feature-item">
                <el-icon color="#409EFF"><DataAnalysis /></el-icon>
                <span>解讀完整度</span>
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
              開始綜合解讀
            </el-button>
          </div>
        </div>

        <div v-else-if="integratedAnalysisLoading" class="analysis-loading">
          <el-icon :size="60" class="is-loading"><Loading /></el-icon>
          <h3>正在進行綜合人生解讀...</h3>
          <p>系統正在整合八字與紫微斗數，為您準備全面的人生解讀</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ currentLoadingStep }}</p>
        </div>

        <div v-else-if="integratedAnalysisResult" class="analysis-results">
          <!-- 綜合分析顯示 -->
          <IntegratedAnalysisDisplay 
            :integratedAnalysis="integratedAnalysisResult"
            :loading="false"
            :error="integratedAnalysisError"
          />
          
          <!-- 操作按鈕 -->
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useBreakpoints } from '@vueuse/core';
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

// 注入全域顯示狀態
const globalDisplayState = inject('globalDisplayState') as {
  activeModule: { value: string };
  setActiveModule: (module: string) => void;
} | null;

// 主要狀態
const purpleStarChart = ref<PurpleStarChart | null>(null);
const birthInfoForIntegration = ref<any>(null);
const transformationFlows = ref<Record<number, any>>({});
const transformationCombinations = ref<Array<any>>([]);
const multiLayerEnergies = ref<Record<number, any>>({});


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
  { value: 'standard', label: '標準解讀', tooltip: '完整展示星曜資訊和四化效應，深入解析命盤結構' },
  { value: 'comprehensive', label: '深度分析', tooltip: '全面詳盡的命盤分析，包含所有星曜、四化組合和多層次能量疊加' }
];

const dataCompleteness = computed(() => {
  if (!purpleStarChart.value) return 0;
  
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
const changeDisplayMode = (mode: DisplayMode) => {
  console.log(`PurpleStarView: changeDisplayMode 被調用，mode=${mode}`);
  localDisplayMode.value = mode;
};

// 處理顯示模式更新

// 整合分析狀態
const showIntegratedAnalysis = ref(false);
const integratedAnalysisLoading = ref(false);
const integratedAnalysisResult = ref<IntegratedAnalysisResponse | null>(null);
const integratedAnalysisError = ref<string | null>(null);
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
  if (!integratedAnalysisResult.value) return 0;
  
  try {
    const confidence = integratedAnalysisResult.value.data?.analysisInfo?.confidence || 0;
    return Math.round(confidence * 100);
  } catch (error) {
    console.error('計算分析完整度時出錯:', error);
    return 0;
  }
});

// 資料清除函數
const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要清除基本命盤資料嗎？（四化飛星資料將保留）',
      '清除資料',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 只清除基本資料，保留四化飛星
    storageService.clearAnalysisData('purpleStar');
    purpleStarChart.value = null;
    birthInfoForIntegration.value = null;
    ElMessage.success('紫微斗數基本資料已清除（四化飛星資料已保留）');
    
  } catch (error) {
    // 用戶取消或詢問是否全部清除
    try {
      await ElMessageBox.confirm(
        '是否要清除包括四化飛星在內的所有資料？',
        '全部清除',
        {
          confirmButtonText: '全部清除',
          cancelButtonText: '取消',
          type: 'error'
        }
      );
      
      storageService.clearAnalysisData('purpleStarAll');
      purpleStarChart.value = null;
      birthInfoForIntegration.value = null;
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
      ElMessage.success('所有紫微斗數資料已清除');
      
    } catch (finalError) {
      // 用戶最終取消
    }
  }
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
    
    // 構建包含完整選項的請求資料
    const requestData = {
      ...birthInfo,
      options: {
        includeMajorCycles: true,
        includeMinorCycles: true,
        includeAnnualCycles: true, // 確保流年太歲計算被啟用
        detailLevel: 'advanced',
        includeFourTransformations: true, // 明確請求四化飛星資料
        maxAge: 100
      }
    };
    
    console.log('發送請求資料:', requestData);
    console.log('請求選項配置:', requestData.options);
    
    // 使用後端 API 進行紫微斗數計算
    const response = await apiService.calculatePurpleStar(requestData) as unknown as PurpleStarAPIResponse;
    
    // 詳細記錄 API 響應結構
    console.log('API 響應狀態:', response ? '成功' : '空響應');
    console.log('API 響應頂層鍵:', Object.keys(response || {}));
    console.log('API data 存在:', !!response?.data);
    console.log('API data 鍵:', Object.keys(response?.data || {}));
    
    // 檢查命盤資料完整性
    if (!response?.data?.chart) {
      console.error('API 未返回紫微斗數命盤資料');
      throw new Error('紫微斗數命盤資料缺失');
    }
    
    // 記錄命盤基本資訊
    console.log('命盤資料:', response.data.chart);
    console.log('命宮天干:', response.data.chart.mingGan || '未返回命宮天干');
    console.log('大限資訊:', response.data.chart.daXian || '無大限資訊');
    console.log('小限資訊:', response.data.chart.xiaoXian || '無小限資訊');
    console.log('流年太歲資訊:', response.data.chart.liuNianTaiSui || '無流年太歲資訊');
    
    // 正確提取命盤資料
    purpleStarChart.value = response.data.chart;
    
    // 檢查四化飛星資料
    console.log('四化飛星資料存在:', !!response.data.transformations);
    
    // 提取四化飛星資料
    if (response.data.transformations) {
      transformationFlows.value = response.data.transformations.flows || {};
      transformationCombinations.value = response.data.transformations.combinations || [];
      multiLayerEnergies.value = response.data.transformations.layeredEnergies || {};
      
      // 詳細記錄四化飛星資料結構
      console.log('四化飛星資料載入成功:', {
        flows: Object.keys(transformationFlows.value).length,
        combinations: transformationCombinations.value.length,
        layeredEnergies: Object.keys(multiLayerEnergies.value).length
      });
      
      // 檢查資料的具體內容
      if (Object.keys(transformationFlows.value).length === 0) {
        console.warn('四化飛星flows資料為空，可能影響顯示');
      } else {
        console.log('四化飛星flows資料樣本:', Object.keys(transformationFlows.value).slice(0, 3));
      }
    } else {
      console.error('API 未返回四化飛星資料，詳細檢查API響應結構');
      console.log('API響應的完整data結構鍵:', Object.keys(response.data));
      
      // 檢查是否有其他可能的四化資料字段
      const possibleKeys = ['fourTransformations', 'sihua', 'transformedStars', 'starTransformations'];
      const responseData = response.data as any; // 臨時類型轉換以處理動態屬性訪問
      const foundAlternative = possibleKeys.find(key => responseData[key]);
      
      if (foundAlternative) {
        console.log(`發現替代四化資料字段: ${foundAlternative}`, responseData[foundAlternative]);
      }
      
      // 清空相關引用避免錯誤
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
      
      // 提示用戶有資料缺失
      ElMessage.warning({
        message: '四化飛星資料缺失，部分分析功能將不可用。請檢查後端API配置。',
        duration: 5000
      });
    }
    
    // 保存命盤資料到 sessionStorage
    storageService.saveToStorage(storageService.STORAGE_KEYS.PURPLE_STAR_CHART, response.data.chart);
    
    // 保存四化飛星資料到 sessionStorage
    if (response.data.transformations) {
      console.log('保存四化飛星資料到 sessionStorage');
      const transformations = response.data.transformations as any; // 臨時類型轉換
      storageService.saveTransformationStarsData(
        transformations.stars || null,
        transformations.flows || {},
        transformations.combinations || [],
        transformations.layeredEnergies || {}
      );
    } else {
      console.warn('API 響應中沒有四化飛星資料，無法保存');
    }
    
    console.groupEnd();
    ElMessage.success('紫微斗數計算完成');
  } catch (error: any) {
    // 確保關閉日誌組
    console.groupEnd();
    
    // 詳細記錄錯誤資訊
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
    currentLoadingStep.value = '正在準備解讀...';

    // 進度更新函數
    const updateProgress = (step: string, progress: number) => {
      currentLoadingStep.value = step;
      loadingProgress.value = progress;
    };

    updateProgress('正在計算八字命盤...', 20);
    
    // 確保位置資料格式正確
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
      } catch (confidenceError) {
        console.warn('解讀完整度評估獲取失敗，但不影響主要解讀:', confidenceError);
      }
      
      updateProgress('正在生成人生指導建議...', 95);
      
      // 整合最終結果
      integratedAnalysisResult.value = result;
      
      
      // 保存整合分析結果到 sessionStorage
      storageService.saveToStorage(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, result);
      
      loadingProgress.value = 100;
      currentLoadingStep.value = '解讀完成!';
      
      ElMessage.success('綜合人生解讀完成');
    } catch (apiError: any) {
      console.error('API 請求失敗:', apiError);
      const errorMessage = apiError.response?.data?.error || apiError.message;
      integratedAnalysisError.value = '綜合解讀API錯誤: ' + errorMessage;
      ElMessage.error('綜合解讀API錯誤: ' + errorMessage);
    }
    
  } catch (error: any) {
    console.error('綜合解讀失敗:', error);
    const errorMessage = error.response?.data?.error || error.message || '綜合解讀失敗';
    integratedAnalysisError.value = errorMessage;
    ElMessage.error(errorMessage);
  } finally {
    integratedAnalysisLoading.value = false;
  }
};


const exportAnalysisResult = () => {
  if (!integratedAnalysisResult.value) {
    ElMessage.warning('沒有可匯出的解讀結果');
    return;
  }

  try {
    // 構建匯出資料
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
  } catch (error) {
    console.error('匯出失敗:', error);
    ElMessage.error('匯出失敗，請稍後再試');
  }
};

// 從 sessionStorage 加載資料
const loadFromSessionStorage = () => {
  try {
    console.log('開始從 sessionStorage 載入紫微斗數資料');
    
    // 記錄當前 sessionStorage 狀態
    const keysInStorage = Object.keys(sessionStorage).filter(key => 
      key.startsWith('peixuan_')
    );
    
    console.log('sessionStorage 中的相關鍵:', keysInStorage);
    
    // 檢查出生資訊
    const savedBirthInfo = storageService.getFromStorage(storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO);
    if (savedBirthInfo) {
      console.log('找到保存的紫微斗數出生資訊');
      birthInfoForIntegration.value = savedBirthInfo;
    } else {
      console.log('未找到保存的紫微斗數出生資訊');
    }

    // 檢查紫微斗數命盤
    const savedPurpleStarChart = storageService.getFromStorage<PurpleStarChart>(storageService.STORAGE_KEYS.PURPLE_STAR_CHART);
    if (savedPurpleStarChart) {
      console.log('找到保存的紫微斗數命盤資料');
      try {
        // 進行基本的資料驗證，確保資料完整性
        if (!savedPurpleStarChart.palaces || !Array.isArray(savedPurpleStarChart.palaces) || 
            savedPurpleStarChart.palaces.length === 0) {
          console.warn('保存的紫微斗數命盤資料缺少宮位資訊');
          throw new Error('命盤資料不完整');
        }
        
        purpleStarChart.value = savedPurpleStarChart as PurpleStarChart;
      } catch (parseError) {
        console.error('解析保存的紫微斗數命盤資料時出錯:', parseError);
        // 不設置命盤資料，確保資料完整性
      }
    } else {
      console.log('未找到保存的紫微斗數命盤資料');
    }

    // 檢查整合分析結果
    const savedIntegratedAnalysis = storageService.getFromStorage<IntegratedAnalysisResponse>(storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS);
    if (savedIntegratedAnalysis) {
      console.log('找到保存的整合分析結果');
      try {
        // 驗證整合分析資料
        if (!savedIntegratedAnalysis.data || !savedIntegratedAnalysis.data.integratedAnalysis) {
          console.warn('保存的整合分析結果缺少必要的分析資料');
          throw new Error('整合分析資料不完整');
        }
        
        integratedAnalysisResult.value = savedIntegratedAnalysis as IntegratedAnalysisResponse;
      } catch (parseError) {
        console.error('解析保存的整合分析結果時出錯:', parseError);
        // 清除可能損壞的資料
        storageService.clearAnalysisData('integrated');
      }
    } else {
      console.log('未找到保存的整合分析結果');
    }

    // 檢查並載入四化飛星資料
    console.log('檢查四化飛星資料...');
    const transformationData = storageService.getTransformationStarsData();
    
    if (transformationData.flows && Object.keys(transformationData.flows).length > 0) {
      console.log('找到保存的四化飛星資料:', {
        flows: Object.keys(transformationData.flows).length,
        combinations: transformationData.combinations.length,
        multiLayerEnergies: Object.keys(transformationData.multiLayerEnergies).length,
        stars: !!transformationData.stars
      });
      
      transformationFlows.value = transformationData.flows;
      transformationCombinations.value = transformationData.combinations;
      multiLayerEnergies.value = transformationData.multiLayerEnergies;
      
      if (transformationData.stars) {
        // 如果有四化星曜資料，也可以載入
        console.log('載入四化星曜資料');
      }
    } else {
      console.log('未找到保存的四化飛星資料');
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
    }
    
    // 驗證資料一致性
    try {
      console.log('使用增強版存儲服務驗證紫微斗數資料');
      enhancedStorageService.validateStorageData();
    } catch (validateError) {
      console.error('驗證紫微斗數資料時出錯:', validateError);
    }
    
    console.log('從 sessionStorage 載入的紫微斗數資料總結:', {
      birthInfo: !!birthInfoForIntegration.value,
      purpleStarChart: !!purpleStarChart.value,
      integratedAnalysis: !!integratedAnalysisResult.value
    });
  } catch (error: unknown) {
    console.error('從 sessionStorage 載入紫微斗數資料時出錯:', error);
    // 只在確實有資料損壞時才清除，避免誤刪有效資料
    if (error instanceof Error && error.message && error.message.includes('Unexpected token')) {
      console.warn('檢測到 JSON 解析錯誤，清除可能損壞的資料');
      storageService.clearAnalysisData('purpleStar');
    } else {
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
  const handleGlobalStateChange = (event: CustomEvent) => {
    console.log('PurpleStarView: 收到全域狀態變化事件', event.detail);
  };
  
  window.addEventListener('global-display-state-changed', handleGlobalStateChange as EventListener);
  
  // 清理事件監聽器
  watch(() => null, () => {
    window.removeEventListener('global-display-state-changed', handleGlobalStateChange as EventListener);
  });
});

// 生命週期鉤子 - 組件掛載時載入資料
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
    } else {
      console.warn('PurpleStarView: 全域顯示狀態不可用，使用本地狀態');
    }
  } catch (error: unknown) {
    console.error('紫微斗數組件初始化過程中發生錯誤:', error);
    // 只在確實無法恢復時才清除資料
    if (error instanceof Error && (error.name === 'SecurityError' || error.message.includes('quota'))) {
      console.warn('儲存空間問題，清除資料以釋放空間');
      storageService.clearAnalysisData('purpleStar');
      ElMessage.warning('因儲存空間問題，已重置分析狀態');
    } else {
      console.warn('初始化錯誤可能是暫時性的，保留現有資料');
      ElMessage.info('載入時發生暫時性錯誤，請稍後再試');
    }
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
}

/* 紫微斗數分層控制器樣式 */
.purple-star-controller {
  margin-left: 16px;
  min-width: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .purple-star-controller {
    margin-left: 0;
    margin-top: 8px;
    order: 1;
    width: 100%;
    min-width: unset;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    transition: margin-right 0.3s ease;
  }
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
