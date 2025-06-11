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
                  清除數據
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="view-description">
            <p>{{ $t('astrology.bazi_detail.description') }}</p>
            <el-alert 
              v-if="baziChart"
              title="💡 提示"
              description="您可以使用「智能交叉驗證」功能來獲得八字與紫微斗數的多維度洞察分析"
              type="info"
              :closable="false"
              show-icon
              class="mt-3 text-center-alert"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>{{ $t('astrology.bazi_detail.inputSection') }}</span>
          </template>
          
          <BaziInputForm @submit="handleSubmit" />
        </el-card>
      </el-col>

      <el-col :span="12">
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
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElTabs, ElTabPane } from 'element-plus';
import { Coordinate, Delete } from '@element-plus/icons-vue';
import BaziInputForm from '@/components/BaziInputForm.vue';
import BaziChartDisplay from '@/components/BaziChartDisplay.vue';
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

// 數據清除函數
const clearData = () => {
  ElMessageBox.confirm('確定要清除當前的八字計算結果嗎？', '清除數據', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    storageService.clearAnalysisData('bazi');
    baziChart.value = null;
    birthInfoRef.value = null;
    ElMessage.success('八字數據已清除');
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
      
      // 保存命盤數據到 sessionStorage
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
    
    // 顯示更詳細的錯誤信息
    ElMessage({
      message: error instanceof Error ? error.message : '八字計算失敗，請稍後再試',
      type: 'error',
      duration: 5000,
      showClose: true
    });
  }
};

// 從 sessionStorage 加載數據
const loadFromSessionStorage = () => {
  try {
    // 檢查出生信息
    const savedBirthInfo = storageService.getFromStorage<BirthInfo>(storageService.STORAGE_KEYS.BAZI_BIRTH_INFO);
    if (savedBirthInfo) {
      birthInfoRef.value = savedBirthInfo as BirthInfo;
    }

    // 檢查八字命盤
    const savedBaziChart = storageService.getFromStorage<FullBaziAnalysis>(storageService.STORAGE_KEYS.BAZI_CHART);
    if (savedBaziChart) {
      baziChart.value = savedBaziChart as FullBaziAnalysis;
    }
    
    console.log('從 sessionStorage 載入的八字數據:', {
      birthInfo: !!birthInfoRef.value,
      baziChart: !!baziChart.value
    });
  } catch (error) {
    console.error('從 sessionStorage 載入數據時出錯:', error);
  }
};

// 生命週期鉤子 - 組件掛載時載入數據
onMounted(() => {
  loadFromSessionStorage();
});
</script>

<style scoped>
.bazi-container {
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
