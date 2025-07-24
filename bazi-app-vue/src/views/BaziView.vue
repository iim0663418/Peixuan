
<template>
  <div class="bazi-container">
    <el-row :gutter="20">
      <el-col :span="24" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ $t('astrology.bazi_detail.title') }}</span>
              <div class="header-actions" v-if="baziChart">
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
          
          <div class="view-description">
            <p>{{ $t('astrology.bazi_detail.description') }}</p>
            <el-alert 
              v-if="baziChart"
              title="💡 提示"
              description="您可以點擊右上角「綜合解讀」來獲得八字與紫微斗數的全面人生解讀"
              type="info"
              :closable="false"
              show-icon
              class="mt-3 text-center-alert"
            />
          </div>
          
          <!-- 添加儲存狀態指示器 -->
          <StorageStatusIndicator class="mt-3" />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover">
          <template #header>
            <span>{{ $t('astrology.bazi_detail.inputSection') }}</span>
          </template>
          
          <BaziInputForm @submit="handleSubmit" />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" v-if="baziChart">
          <template #header>
            <span>分析結果</span>
          </template>
          
          <el-tabs>
            <el-tab-pane label="八字命盤">
              <BaziChartDisplay 
                :baziResult="baziChart"
                :tenGods="baziChart.mainTenGods"
                :elementsDistribution="baziChart.elementsDistribution"
                :startLuckInfo="baziChart.startLuckInfo"
              />
            </el-tab-pane>
            
            <el-tab-pane label="命盤解讀" v-if="baziChart.interpretation">
              <div class="interpretation-section">
                <h3>命盤總論</h3>
                <p>{{ baziChart.interpretation.general }}</p>
                
                <h3>性格特質</h3>
                <ul>
                  <li v-for="(trait, index) in baziChart.interpretation.personalityTraits" :key="index">
                    {{ trait }}
                  </li>
                </ul>
                
                <h3>事業方向</h3>
                <p>{{ baziChart.interpretation.career }}</p>
                
                <h3>人際關係</h3>
                <p>{{ baziChart.interpretation.relationships }}</p>
                
                <h3>健康建議</h3>
                <p>{{ baziChart.interpretation.health }}</p>
                
                <h3>重要年齡</h3>
                <div class="key-ages">
                  <el-tag 
                    v-for="age in baziChart.interpretation.keyAges" 
                    :key="age"
                    type="success"
                    effect="plain"
                    class="mr-2 mb-2"
                  >
                    {{ age }} 歲
                  </el-tag>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="大運" v-if="baziChart.decennialCycles && baziChart.decennialCycles.length > 0">
              <div v-for="cycle in baziChart.decennialCycles" :key="cycle.index" class="decennial-cycle">
                <el-divider>第 {{ cycle.index }} 大運</el-divider>
                <h4>{{ cycle.stem }}{{ cycle.branch }} ({{ cycle.startYear }}年-{{ cycle.endYear }}年，{{ cycle.startAge }}-{{ cycle.endAge }}歲)</h4>
                <p v-if="cycle.analysis">{{ cycle.analysis.overview }}</p>
                
                <div class="cycle-details" v-if="cycle.analysis">
                  <div class="detail-item">
                    <h5>事業</h5>
                    <p>{{ cycle.analysis.career }}</p>
                  </div>
                  <div class="detail-item">
                    <h5>財富</h5>
                    <p>{{ cycle.analysis.wealth }}</p>
                  </div>
                  <div class="detail-item">
                    <h5>人際關係</h5>
                    <p>{{ cycle.analysis.relationships }}</p>
                  </div>
                  <div class="detail-item">
                    <h5>健康</h5>
                    <p>{{ cycle.analysis.health }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="流年" v-if="baziChart.annualLuck && baziChart.annualLuck.length > 0">
              <div class="annual-filter">
                <el-input v-model="yearFilter" placeholder="搜尋年份..." clearable />
              </div>
              
              <div v-for="year in filteredAnnualLuck" :key="year.year" class="annual-luck">
                <el-divider>{{ year.year }}年</el-divider>
                <h4>{{ year.stem }}{{ year.branch }} ({{ year.age }}歲)</h4>
                <p v-if="year.analysis">{{ year.analysis.overview }}</p>
                
                <div class="annual-details" v-if="year.analysis">
                  <div class="detail-item">
                    <h5>年度重點</h5>
                    <p>{{ year.analysis.focus }}</p>
                  </div>
                  <div class="detail-item">
                    <h5>挑戰</h5>
                    <p>{{ year.analysis.challenges }}</p>
                  </div>
                  <div class="detail-item">
                    <h5>機遇</h5>
                    <p>{{ year.analysis.opportunities }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        
        <el-card shadow="hover" v-else>
          <div class="placeholder">
            <el-icon :size="64" color="#c0c4cc">
              <Coordinate />
            </el-icon>
            <p>請填寫左側表單開始分析</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox, ElTabs, ElTabPane } from 'element-plus';
import { Coordinate, Delete } from '@element-plus/icons-vue';

// 動態導入組件以提升效能
const BaziInputForm = defineAsyncComponent(() => import('@/components/BaziInputForm.vue'));
const BaziChartDisplay = defineAsyncComponent(() => import('@/components/BaziChartDisplay.vue'));
const StorageStatusIndicator = defineAsyncComponent(() => import('@/components/StorageStatusIndicator.vue'));
import { BirthInfo } from '@/services/astrologyIntegrationService';
import { 
  BaziCalculator, 
  TenGodsCalculator, 
  FiveElementsAnalyzer,
  FortuneCycleCalculator,
  BaziInterpreter,
  InterpretationLevel,
  type FullBaziAnalysis,
  type DecennialCycle,
  type AnnualLuck
} from '@/utils/baziCalc';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';

// 確保 session ID 存在
const sessionId = storageService.getOrCreateSessionId();

const baziChart = ref<FullBaziAnalysis | null>(null);
const birthInfoRef = ref<BirthInfo | null>(null);
const yearFilter = ref(''); // 用於流年過濾

// 過濾流年的計算屬性
const filteredAnnualLuck = computed(() => {
  if (!baziChart.value?.annualLuck) return [];
  
  if (!yearFilter.value.trim()) {
    return baziChart.value.annualLuck;
  }
  
  const searchTerm = yearFilter.value.trim();
  return baziChart.value.annualLuck.filter(year => 
    year.year.toString().includes(searchTerm)
  );
});

// 資料清除函數
const clearData = () => {
  ElMessageBox.confirm('確定要清除當前的八字計算結果嗎？', '清除資料', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    storageService.clearAnalysisData('bazi');
    baziChart.value = null;
    birthInfoRef.value = null;
    ElMessage.success('八字資料已清除');
  }).catch(() => {
    // 用戶取消操作
  });
};

const handleSubmit = async (birthInfo: BirthInfo) => {
  try {
    ElMessage.info('正在計算八字...');
    
    // 保存出生資訊
    birthInfoRef.value = birthInfo;
    
    // 保存出生資訊到 sessionStorage
    storageService.saveToStorage(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO, birthInfo);
    
    // 驗證日期格式
    if (!birthInfo.birthDate || !birthInfo.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('出生日期格式無效，請使用YYYY-MM-DD格式');
    }
    
    // 驗證時間格式
    if (birthInfo.birthTime && !birthInfo.birthTime.match(/^\d{2}:\d{2}$/)) {
      throw new Error('出生時間格式無效，請使用HH:MM格式');
    }
    
    // 轉換性別為數字 (0: 男, 1: 女)
    const genderValue = birthInfo.gender === 'male' ? 0 : 1;
    
    // 轉換 BirthInfo 為 Date 對象
    const solarDate = new Date(birthInfo.birthDate);
    
    // 檢查日期是否有效
    if (isNaN(solarDate.getTime())) {
      throw new Error('無效的日期：' + birthInfo.birthDate + '，請確保格式為YYYY-MM-DD');
    }
    
    // 添加時間部分
    if (birthInfo.birthTime) {
      const [hours, minutes] = birthInfo.birthTime.split(':');
      solarDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      // 檢查時間是否有效
      if (isNaN(solarDate.getTime())) {
        throw new Error('無效的時間：' + birthInfo.birthTime + '，請確保格式為HH:MM');
      }
    }
    
    console.log('用於八字計算的日期物件:', solarDate.toString());
    
    try {
      // 使用前端八字計算引擎
      const baziResult = BaziCalculator.calculateBazi({ solarDate });
      
      if (!baziResult) {
        throw new Error('八字計算失敗，請檢查 lunar-javascript 庫是否正確載入');
      }
      
      // 計算十神和五行分佈
      const mainTenGods = TenGodsCalculator.getMainStemTenGods(baziResult);
      const elementsDistribution = FiveElementsAnalyzer.calculateElementsDistribution(baziResult);
      
      // 計算起運時間
      const solarObj = Solar.fromDate(solarDate);
      const lunarDate = solarObj.getLunar();
      const startLuckInfo = FortuneCycleCalculator.calculateStartLuck(lunarDate, genderValue);
      
      // 計算大運
      const decennialCycles = FortuneCycleCalculator.calculateDecennialCycles(
        baziResult, 
        solarDate, 
        genderValue, 
        8 // 計算8個大運
      );
      
      // 為每個大運生成解讀
      decennialCycles.forEach(cycle => {
        cycle.analysis = BaziInterpreter.generateDecennialAnalysis(
          baziResult, 
          cycle, 
          InterpretationLevel.BASIC
        );
      });
      
      // 計算流年（從當前年份開始，30年）
      const currentYear = new Date().getFullYear();
      const annualLuck = FortuneCycleCalculator.calculateAnnualLuck(
        solarDate, 
        currentYear, 
        30 // 計算30年的流年
      );
      
      // 為每個流年生成解讀
      annualLuck.forEach(annual => {
        annual.analysis = BaziInterpreter.generateAnnualAnalysis(
          baziResult, 
          annual, 
          InterpretationLevel.BASIC
        );
      });
      
      // 生成命盤解讀
      const interpretation = BaziInterpreter.generateBasicInterpretation(baziResult);
      
      // 組裝完整的分析結果
      const fullAnalysis: FullBaziAnalysis = {
        ...baziResult,
        mainTenGods,
        elementsDistribution,
        startLuckInfo,
        decennialCycles,
        annualLuck,
        interpretation
      };
      
      baziChart.value = fullAnalysis;
      
      // 保存命盤資料到 sessionStorage
      storageService.saveToStorage(storageService.STORAGE_KEYS.BAZI_CHART, fullAnalysis);
      
      ElMessage.success('八字計算完成');
    } catch (calcError) {
      console.error('八字計算過程中錯誤:', calcError);
      // 捕獲計算過程中的特定錯誤
      throw new Error(
        calcError instanceof Error 
          ? `八字計算失敗: ${calcError.message}` 
          : '八字計算過程中發生未知錯誤，請稍後再試'
      );
    }
  } catch (error) {
    console.error('八字表單處理錯誤:', error);
    
    // 顯示更詳細的錯誤資訊
    ElMessage({
      message: error instanceof Error ? error.message : '八字計算失敗，請稍後再試',
      type: 'error',
      duration: 5000,
      showClose: true
    });
  }
};

// 從 sessionStorage 加載資料
const loadFromSessionStorage = () => {
  try {
    console.log('開始從 sessionStorage 載入八字資料');
    
    // 記錄當前 sessionStorage 狀態
    const keysInStorage = Object.keys(sessionStorage).filter(key => 
      key.startsWith('peixuan_')
    );
    
    console.log('sessionStorage 中的相關鍵:', keysInStorage);
    
    // 檢查出生資訊
    const savedBirthInfo = storageService.getFromStorage<BirthInfo>(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
    
    if (savedBirthInfo) {
      console.log('找到保存的八字出生資訊');
      birthInfoRef.value = savedBirthInfo as BirthInfo;
    } else {
      console.log('未找到保存的八字出生資訊');
    }

    // 檢查八字命盤
    const savedBaziChart = storageService.getFromStorage<FullBaziAnalysis>(storageService.STORAGE_KEYS.BAZI_CHART);
    
    if (savedBaziChart) {
      console.log('找到保存的八字命盤資料');
      try {
        // 進行安全檢查，確保必要屬性存在
        if (!savedBaziChart.yearPillar || !savedBaziChart.monthPillar || 
            !savedBaziChart.dayPillar || !savedBaziChart.hourPillar) {
          console.warn('保存的八字命盤資料缺少必要的柱位資訊');
          throw new Error('命盤資料不完整');
        }
        
        baziChart.value = savedBaziChart;
      } catch (parseError) {
        console.error('解析保存的八字命盤資料時出錯:', parseError);
        // 不要設置命盤資料，確保資料完整性
      }
    } else {
      console.log('未找到保存的八字命盤資料');
    }
    
    // 驗證資料一致性
    try {
      console.log('使用增強版存儲服務驗證八字資料');
      enhancedStorageService.validateStorageData();
    } catch (validateError) {
      console.error('驗證八字資料時出錯:', validateError);
    }
    
    console.log('從 sessionStorage 載入的八字資料總結:', {
      birthInfo: !!birthInfoRef.value,
      baziChart: !!baziChart.value
    });
  } catch (error) {
    console.error('從 sessionStorage 載入八字資料時出錯:', error);
    // 出現嚴重錯誤時，清除可能損壞的資料
    storageService.clearAnalysisData('bazi');
  }
};

// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
  loadFromSessionStorage();
};

// 生命週期鉤子 - 組件掛載時載入資料
onMounted(() => {
  console.log('BaziView 組件已掛載');
  try {
    setupComponentData();
  } catch (error) {
    console.error('八字組件初始化過程中發生錯誤:', error);
    // 在初始化失敗時嘗試回退到安全狀態
    storageService.clearAnalysisData('bazi');
    ElMessage.warning('八字資料載入時發生錯誤，已重置分析狀態');
  }
});
</script>

<style scoped>
/* 確保 el-card__body 是一個定位上下文 */
:deep(.el-card__body) {
  position: relative;
  overflow: visible;
}
.bazi-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 響應式優化 */
@media (max-width: 768px) {
  .bazi-container {
    padding: 10px;
  }
  
  /* 卡片內邊距調整 */
  :deep(.el-card__body) {
    padding: 15px;
  }
  
  /* 標題字體調整 */
  :deep(.el-card__header) {
    padding: 15px;
    font-size: 16px;
  }
  
  /* 按鈕組優化 */
  .header-actions {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }
  
  .header-actions .el-button {
    min-height: 44px;
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .bazi-container {
    padding: 5px;
  }
  
  /* 更小螢幕的調整 */
  :deep(.el-card__body) {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
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

/* 解讀部分樣式 */
.interpretation-section {
  padding: 15px 0;
}

.interpretation-section h3 {
  color: #8b4513;
  margin: 20px 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9dcc9;
}

.interpretation-section ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.interpretation-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.key-ages {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

/* 大運樣式 */
.decennial-cycle {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #faf9f7;
  border-radius: 10px;
  border: 1px solid #e9dcc9;
}

.decennial-cycle h4 {
  color: #8b4513;
  margin: 15px 0;
}

.cycle-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.detail-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-item h5 {
  color: #d2691e;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e9dcc9;
}

/* 流年樣式 */
.annual-filter {
  margin-bottom: 20px;
}

.annual-luck {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e1e5eb;
}

.annual-luck h4 {
  color: #2c3e50;
  margin: 15px 0;
}

.annual-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
</style>
