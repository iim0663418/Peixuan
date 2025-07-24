<template>
  <div class="integrated-analysis-container">
    <!-- 主描述卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-4">
        <el-card shadow="hover" class="description-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">時運分析</span>
              <div class="header-actions" v-if="analysisState.integratedAnalysis.value">
                <el-button
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
          
          <div class="analysis-description">
            <el-collapse v-model="activeCollapse" accordion>
              <el-collapse-item title="系統介紹" name="description">
                <p>{{ $t('astrology.integrated_analysis.description') }}</p>
              </el-collapse-item>
              
              <el-collapse-item title="運作原理" name="howItWorks">
                <h4>{{ $t('astrology.integrated_analysis.howItWorks.title') }}</h4>
                <ol class="steps-list">
                  <li v-for="(step, index) in $t('astrology.integrated_analysis.howItWorks.steps')" :key="index">
                    {{ step }}
                  </li>
                </ol>
              </el-collapse-item>
              
              <el-collapse-item title="系統優勢" name="benefits">
                <ul class="benefits-list">
                  <li v-for="(benefit, index) in $t('features.integrated_analysis.benefits')" :key="index">
                    {{ benefit }}
                  </li>
                </ul>
              </el-collapse-item>
            </el-collapse>
            
            <!-- 快速操作區 -->
            <div class="quick-actions" v-if="hasSavedBaziData || chartDataStatus.total > 0">
              <el-alert 
                title="💡 提示" 
                :description="`檢測到 ${chartDataStatus.total} 項命盤資料，您可以快速使用現有資料進行分析`"
                type="info" 
                :closable="false" 
                show-icon 
                class="mb-3"
              />
              
              <!-- 命盤狀態顯示 -->
              <div class="chart-status mb-3">
                <el-row :gutter="8">
                  <el-col :span="6" v-if="chartDataStatus.bazi">
                    <el-tag type="success" effect="light" size="small">八字命盤</el-tag>
                  </el-col>
                  <el-col :span="6" v-if="chartDataStatus.purpleStar">
                    <el-tag type="primary" effect="light" size="small">紫微斗數</el-tag>
                  </el-col>
                  <el-col :span="6" v-if="chartDataStatus.transformationStars">
                    <el-tag type="warning" effect="light" size="small">四化飛星</el-tag>
                  </el-col>
                  <el-col :span="6" v-if="chartDataStatus.integrated">
                    <el-tag type="danger" effect="light" size="small">整合分析</el-tag>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 會話資料摘要 -->
              <div class="session-summary mb-3" v-if="sessionDataSummary">
                <el-descriptions :column="2" size="small" border>
                  <el-descriptions-item label="會話ID">
                    {{ sessionDataSummary.sessionId.slice(-8) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="最後更新">
                    {{ sessionDataSummary.lastUpdated }}
                  </el-descriptions-item>
                  <el-descriptions-item label="可用命盤">
                    {{ sessionDataSummary.chartsAvailable }} 項
                  </el-descriptions-item>
                  <el-descriptions-item label="資料狀態">
                    <el-tag 
                      :type="sessionDataSummary.validationStatus === 'valid' ? 'success' : 'warning'" 
                      size="small"
                    >
                      {{ sessionDataSummary.validationStatus === 'valid' ? '正常' : '警告' }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <el-button 
                type="success" 
                @click="useBaziData" 
                :disabled="analysisState.loading.value"
                size="small"
                v-if="hasSavedBaziData"
              >
                使用現有八字資料分析
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表單與結果區域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 輸入表單 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
        <el-card shadow="hover" class="input-card">
          <template #header>
            <div class="form-header">
              <span>{{ $t('astrology.integrated_analysis.inputSection') }}</span>
              <el-badge 
                :value="formProgress + '%'" 
                :type="formProgress === 100 ? 'success' : 'primary'"
                class="progress-badge"
              />
            </div>
          </template>
          
          <el-form 
            ref="analysisForm"
            :model="birthInfo" 
            :rules="formRules"
            @submit.prevent="submitAnalysis"
            label-position="top"
          >
            <el-form-item :label="$t('form.birth_date')" prop="birthDate">
              <el-date-picker
                v-model="birthInfo.birthDate"
                type="date"
                :placeholder="$t('form.birth_date')"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                size="large"
              />
            </el-form-item>

            <el-form-item :label="$t('form.birth_time')" prop="birthTime">
              <el-time-picker
                v-model="birthInfo.birthTime"
                :placeholder="$t('form.birth_time')"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
                size="large"
              />
            </el-form-item>

            <el-form-item :label="$t('form.gender')" prop="gender">
              <el-radio-group v-model="birthInfo.gender" size="large">
                <el-radio-button :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio-button>
                <el-radio-button :value="'female'">{{ $t('form.genderOptions.female') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('form.location')" prop="location">
              <el-input 
                v-model="locationInputValue"
                @input="handleLocationInput"
                :placeholder="'例如：台北市'"
                size="large"
                clearable
              />
            </el-form-item>

            <el-form-item class="submit-section">
              <el-button 
                type="primary" 
                @click="submitAnalysis()"
                :loading="analysisState.loading.value"
                size="large"
                class="submit-button"
              >
                <template v-if="analysisState.loading.value">
                  <el-icon class="is-loading mr-2"><Loading /></el-icon>
                  分析中...
                </template>
                <template v-else>
                  {{ $t('form.submit') }}
                </template>
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 分析結果 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="16">
        <el-card shadow="hover" class="result-card" v-if="analysisState.integratedAnalysis.value || analysisState.loading.value">
          <template #header>
            <div class="result-header">
              <span>分析結果</span>
              <el-tag 
                v-if="analysisState.integratedAnalysis.value" 
                type="success" 
                effect="light"
                size="small"
              >
                已完成
              </el-tag>
            </div>
          </template>
          
          <IntegratedAnalysisDisplay 
            :integratedAnalysis="analysisState.integratedAnalysis.value"
            :loading="analysisState.loading.value"
            :error="analysisState.error.value"
          />
        </el-card>
        
        <el-card shadow="hover" class="placeholder-card" v-else>
          <div class="placeholder">
            <el-icon :size="64" color="#c0c4cc">
              <Connection />
            </el-icon>
            <h3>等待分析</h3>
            <p>請填寫左側表單開始時運分析</p>
            <p class="sub-text">系統將同時計算紫微斗數與八字，並進行交叉分析</p>
            
            <!-- 功能預覽 -->
            <div class="feature-preview">
              <el-row :gutter="12">
                <el-col :span="8">
                  <div class="preview-item">
                    <el-icon color="#409EFF"><Star /></el-icon>
                    <span>紫微斗數</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="preview-item">
                    <el-icon color="#67C23A"><Document /></el-icon>
                    <span>八字命理</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="preview-item">
                    <el-icon color="#E6A23C"><TrendCharts /></el-icon>
                    <span>整合分析</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, computed, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection, Delete, Loading, Star, Document, TrendCharts } from '@element-plus/icons-vue';

// 動態導入組件以提升效能
const IntegratedAnalysisDisplay = defineAsyncComponent(() => import('@/components/IntegratedAnalysisDisplay.vue'));
import AstrologyIntegrationService from '@/services/astrologyIntegrationService';
import { BirthInfo } from '@/services/astrologyIntegrationService';
import type { IntegratedAnalysisResponse } from '@/types/astrologyTypes';
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
const birthInfo = reactive<BirthInfo>({
  birthDate: '',
  birthTime: '',
  gender: 'male' as 'male' | 'female',
  location: '台北市'
});

// 創建位置輸入值響應式變數
const locationInputValue = ref(
  typeof birthInfo.location === 'string' 
    ? birthInfo.location 
    : (birthInfo.location?.name || '台北市')
);

// 折疊面板狀態
const activeCollapse = ref('');

// 計算表單完成進度
const formProgress = computed(() => {
  let progress = 0;
  if (birthInfo.birthDate) progress += 25;
  if (birthInfo.birthTime) progress += 25;
  if (birthInfo.gender) progress += 25;
  if (locationInputValue.value && locationInputValue.value.trim()) progress += 25;
  return progress;
});

// 檢查是否有已保存的八字資料
const hasSavedBaziData = computed(() => {
  const savedBaziChart = storageService.getFromStorage(storageService.STORAGE_KEYS.BAZI_CHART);
  const savedBaziInfo = storageService.getFromStorage<BirthInfo>(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
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
  } catch (error) {
    console.error('獲取會話資料摘要時出錯:', error);
  }
  return null;
});

// 處理位置輸入變更
const handleLocationInput = (value: string) => {
  birthInfo.location = value;
};

// 使用已有的八字資料
const useBaziData = () => {
  const savedBaziInfo = storageService.getFromStorage<BirthInfo>(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
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
    } catch (syncError) {
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
      } catch (syncError) {
        console.error('同步到增強存儲服務時出錯:', syncError);
      }
    }
    
    // 執行分析，傳入是否使用 sessionStorage 中的資料標識
    await analysisState.analyze(birthInfo, useSessionData);
    
    // 檢查分析結果
    if (analysisState.integratedAnalysis.value) {
      console.log('分析完成，結果:', analysisState.integratedAnalysis.value);
      
      // 保存分析結果到 sessionStorage
      storageService.saveToStorage(
        storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS, 
        analysisState.integratedAnalysis.value
      );
      
      // 再次同步資料到增強存儲服務
      try {
        enhancedStorageService.syncChartsToUnifiedData();
        enhancedStorageService.validateStorageData();
      } catch (syncError) {
        console.error('最終同步時出錯:', syncError);
      }
      
      ElMessage.success('時運分析完成');
    } else {
      console.error('分析完成但沒有結果');
      ElMessage.warning('分析完成但無結果返回');
    }
  } catch (error) {
    console.error('分析過程發生錯誤:', error);
    ElMessage.error(
      error instanceof Error 
        ? error.message 
        : '分析失敗，請稍後再試'
    );
  }
};

// 從 sessionStorage 加載資料
const loadFromSessionStorage = () => {
  try {
    console.log('開始從 sessionStorage 載入資料');
    
    // 記錄當前 sessionStorage 狀態
    const keysInStorage = Object.keys(sessionStorage).filter(key => 
      key.startsWith('peixuan_')
    );
    
    console.log('sessionStorage 中的相關鍵:', keysInStorage);
    
    // 檢查出生資訊
    const savedBirthInfo = storageService.getFromStorage<BirthInfo>(storageService.STORAGE_KEYS.INTEGRATED_BIRTH_INFO);
    
    if (savedBirthInfo) {
      console.log('找到保存的出生資訊');
      
      // 安全地更新各個字段，添加默認值
      birthInfo.birthDate = savedBirthInfo.birthDate || '';
      birthInfo.birthTime = savedBirthInfo.birthTime || '';
      
      // 確保性別是正確的類型
      if (savedBirthInfo.gender === 'male' || savedBirthInfo.gender === 'female') {
        birthInfo.gender = savedBirthInfo.gender;
      } else {
        birthInfo.gender = 'male'; // 預設值
      }
      
      // 處理地點資訊
      if (savedBirthInfo.location) {
        if (typeof savedBirthInfo.location === 'string') {
          birthInfo.location = savedBirthInfo.location;
          locationInputValue.value = savedBirthInfo.location;
        } else if (typeof savedBirthInfo.location === 'object') {
          const locationName = savedBirthInfo.location.name || '台北市';
          birthInfo.location = locationName;
          locationInputValue.value = locationName;
        }
      } else {
        birthInfo.location = '台北市'; // 預設值
        locationInputValue.value = '台北市';
      }
    } else {
      console.log('未找到保存的出生資訊');
    }

    // 檢查整合分析結果
    const savedAnalysis = storageService.getFromStorage<IntegratedAnalysisResponse>(
      storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS
    );
    
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
        } as IntegratedAnalysisResponse;
        
        // 設置分析狀態
        analysisState.integratedAnalysis.value = formattedResult;
        console.log('已從 sessionStorage 載入並格式化分析結果');
        
        // 如果有已保存的分析結果但缺少完整資料，重新分析
        if (savedBirthInfo && formattedResult.data.integratedAnalysis && 
            Object.keys(formattedResult.data.integratedAnalysis).length === 0) {
          console.log('檢測到不完整的分析結果，準備重新分析');
          submitAnalysis(true);
        }
      } catch (parseError) {
        console.error('解析儲存的分析結果時出錯:', parseError);
        // 在出現錯誤時清除可能損壞的資料
        storageService.clearAnalysisData('integrated');
      }
    }
    
    // 使用增強版存儲服務驗證資料
    try {
      console.log('使用增強版存儲服務驗證資料');
      enhancedStorageService.validateStorageData();
    } catch (validateError) {
      console.error('驗證資料時出錯:', validateError);
    }
    
    console.log('從 sessionStorage 載入的整合分析資料總結:', {
      birthInfo: !!savedBirthInfo,
      analysis: !!savedAnalysis
    });
  } catch (error) {
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
  } catch (storageError) {
    console.error('初始化增強存儲服務時出錯:', storageError);
  }
};

// 生命週期鉤子 - 組件掛載時載入資料
onMounted(() => {
  console.log('IntegratedAnalysisView 組件已掛載');
  try {
    setupComponentData();
  } catch (error) {
    console.error('組件初始化過程中發生錯誤:', error);
    // 在初始化失敗時嘗試回退到安全狀態
    storageService.clearAnalysisData('integrated');
    ElMessage.warning('資料載入時發生錯誤，已重置分析狀態');
  }
});
</script>

<style scoped>
.integrated-analysis-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 響應式調整 */
@media (max-width: 1200px) {
  .integrated-analysis-container {
    max-width: 100%;
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .integrated-analysis-container {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .integrated-analysis-container {
    padding: 8px;
  }
}

/* 卡片樣式 */
.description-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.input-card {
  border-radius: 12px;
  min-height: 500px;
  transition: all 0.3s ease;
}

.result-card {
  border-radius: 12px;
  min-height: 500px;
  transition: all 0.3s ease;
}

.placeholder-card {
  border-radius: 12px;
  min-height: 500px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 標題樣式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.progress-badge {
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 內容區域 */
.main-content {
  margin-top: 0;
}

.analysis-description {
  padding: 0;
}

/* 折疊面板樣式 */
:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  font-weight: 600;
  border: none;
}

:deep(.el-collapse-item__content) {
  padding: 16px 0;
}

.steps-list {
  list-style-type: decimal;
  padding-left: 24px;
  margin: 16px 0;
}

.steps-list li {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #606266;
}

.benefits-list {
  list-style-type: disc;
  padding-left: 24px;
  margin: 0;
}

.benefits-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
}

/* 快速操作區 */
.quick-actions {
  margin-top: 20px;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

/* 命盤狀態顯示 */
.chart-status {
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.chart-status .el-tag {
  margin-bottom: 4px;
  font-weight: 500;
}

/* 會話摘要 */
.session-summary {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  padding: 8px;
}

:deep(.el-descriptions) {
  background: transparent;
}

:deep(.el-descriptions__body) {
  background: transparent;
}

:deep(.el-descriptions-item__cell) {
  padding: 4px 8px;
  background: transparent;
}

:deep(.el-descriptions-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
}

:deep(.el-descriptions-item__content) {
  color: #6b7280;
  font-size: 12px;
}

/* 表單樣式 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

.submit-section {
  margin-top: 24px;
}

.submit-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 佔位符樣式 */
.placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.placeholder h3 {
  margin: 16px 0 8px 0;
  font-size: 20px;
  color: #606266;
}

.placeholder p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.sub-text {
  font-size: 12px !important;
  color: #c0c4cc !important;
}

/* 功能預覽 */
.feature-preview {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.preview-item:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.preview-item span {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

/* 工具類 */
.mb-3 {
  margin-bottom: 15px;
}

.mb-4 {
  margin-bottom: 20px;
}

.mr-2 {
  margin-right: 8px;
}

/* 響應式表單調整 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-header,
  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .submit-button {
    height: 44px;
  }
  
  .placeholder {
    padding: 30px 15px;
  }
  
  .feature-preview {
    margin-top: 20px;
    padding: 15px;
  }
  
  .preview-item {
    padding: 8px;
  }
  
  :deep(.el-collapse-item__header) {
    padding: 10px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 16px;
  }
  
  .placeholder h3 {
    font-size: 18px;
  }
  
  .submit-button {
    height: 42px;
    font-size: 14px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
}
</style>