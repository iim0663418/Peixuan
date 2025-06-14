<template>
  <div class="integrated-analysis-container">
    <el-row :gutter="20">
      <el-col :span="24" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>時運分析</span>
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
            <p>{{ $t('astrology.integrated_analysis.description') }}</p>
            
            <h3>{{ $t('astrology.integrated_analysis.howItWorks.title') }}</h3>
            <ol class="steps-list">
              <li v-for="(step, index) in $t('astrology.integrated_analysis.howItWorks.steps')" :key="index">
                {{ step }}
              </li>
            </ol>
            
            <div class="benefits-section">
              <h4>系統優勢：</h4>
              <ul>
                <li v-for="(benefit, index) in $t('features.integrated_analysis.benefits')" :key="index">
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>{{ $t('astrology.integrated_analysis.inputSection') }}</span>
          </template>
          
          <el-form 
            ref="analysisForm"
            :model="birthInfo" 
            :rules="formRules"
            @submit.prevent="submitAnalysis"
          >
            <el-form-item :label="$t('form.birth_date')" prop="birthDate">
              <el-date-picker
                v-model="birthInfo.birthDate"
                type="date"
                :placeholder="$t('form.birth_date')"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item :label="$t('form.birth_time')" prop="birthTime">
              <el-time-picker
                v-model="birthInfo.birthTime"
                :placeholder="$t('form.birth_time')"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item :label="$t('form.gender')" prop="gender">
              <el-radio-group v-model="birthInfo.gender">
                <el-radio :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio>
                <el-radio :value="'female'">{{ $t('form.genderOptions.female') }}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item :label="$t('form.location')" prop="location">
              <el-input 
                v-model="locationInputValue"
                @input="handleLocationInput"
              />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="submitAnalysis()"
                :loading="analysisState.loading.value"
                size="large"
                style="width: 100%"
              >
                {{ $t('form.submit') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" v-if="analysisState.integratedAnalysis.value || analysisState.loading.value">
          <template #header>
            <span>分析結果</span>
          </template>
          
          <IntegratedAnalysisDisplay 
            :integratedAnalysis="analysisState.integratedAnalysis.value"
            :loading="analysisState.loading.value"
            :error="analysisState.error.value"
          />
        </el-card>
        
        <el-card shadow="hover" v-else>
          <div class="placeholder">
            <el-icon :size="64" color="#c0c4cc">
              <Connection />
            </el-icon>
            <p>請填寫左側表單開始時運分析</p>
            <p class="sub-text">系統將同時計算紫微斗數與八字，並進行交叉分析</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection, Delete } from '@element-plus/icons-vue';
import IntegratedAnalysisDisplay from '@/components/IntegratedAnalysisDisplay.vue';
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

// 處理位置輸入變更
const handleLocationInput = (value: string) => {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.analysis-description {
  margin-bottom: 20px;
}

.steps-list {
  list-style-type: decimal;
  padding-left: 20px;
  margin: 16px 0;
}

.steps-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.benefits-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.benefits-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.benefits-section ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.benefits-section li {
  margin-bottom: 6px;
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

.sub-text {
  font-size: 12px !important;
  color: #c0c4cc !important;
}

.mb-4 {
  margin-bottom: 20px;
}
</style>
