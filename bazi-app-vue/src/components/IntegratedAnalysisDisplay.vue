<template>
  <div class="integrated-analysis-container">
    <div v-if="loading" class="loading">
      <el-icon :size="50" class="is-loading"><Loading /></el-icon>
      <p>{{ $t('analysis.loading') }}</p>
    </div>

    <div v-else-if="error" class="error">
      <el-icon color="red" :size="50"><Warning /></el-icon>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="integratedAnalysis" class="analysis-result">
      <!-- 信心度評分 -->
      <div class="analysis-header">
          <h3>
            <el-icon><DataAnalysis /></el-icon>
            《時運分析》綜合人生解讀
            <el-tag size="small" effect="dark" type="success" class="version-tag">2025版</el-tag>
          </h3>
      </div>
      
      <!-- 關鍵發現 -->
      <div class="key-findings-section">
        <h3>人生關鍵特質</h3>
        <div class="finding-cards">
          <el-card v-for="(finding, index) in getConsensusFindings()" 
                  :key="`consensus-${index}`" 
                  class="finding-card consensus">
            <template #header>
              <div class="card-header">
                <el-icon class="finding-icon" color="#67C23A"><Check /></el-icon>
                <span>{{ finding }}</span>
              </div>
            </template>
          </el-card>
        </div>
      </div>

      <!-- 五行分析 -->
      <div class="elements-section" v-if="getElementsAnalysis().length > 0">
        <h3>
          <el-icon><Connection /></el-icon>
          本命五行配置
        </h3>
        <div class="elements-distribution">
          <div v-for="element in getElementsAnalysis()" 
               :key="element.name" 
               class="element-item"
               :class="element.status">
            <div class="element-icon">{{ getElementIcon(element.name) }}</div>
            <div class="element-name" :class="element.status">{{ element.name }}</div>
            <div class="element-status">{{ getElementStatusText(element.status) }}</div>
          </div>
        </div>
      </div>

      <!-- 運勢期程 -->
      <div class="cycles-section" v-if="getCyclesAnalysis().length > 0">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          運勢週期與人生階段
        </h3>
        <el-timeline>
          <el-timeline-item
            v-for="(cycle, index) in getCyclesAnalysis()"
            :key="`cycle-${index}`"
            :type="getTimelineItemType(index)"
            :color="getTimelineItemColor(index)"
            :size="index === 0 ? 'large' : 'normal'"
          >
            <div class="timeline-content">
              {{ cycle }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 分歧分析 -->
      <div class="divergent-section" v-if="getDivergentFindings().length > 0">
        <h3>
          <el-icon><Warning /></el-icon>
          深層特質解析
          <el-tooltip content="以下為不同角度的深層解讀，幫助您全面了解自己" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </h3>
        
        <div class="finding-cards">
          <el-card v-for="(finding, index) in getDivergentFindings()" 
                  :key="`divergent-${index}`" 
                  class="finding-card divergent">
            <template #header>
              <div class="card-header">
                <el-icon class="finding-icon" color="#E6A23C"><Warning /></el-icon>
                <span>{{ finding }}</span>
              </div>
            </template>
            <div class="finding-explanation">
              <p>此為您的潛在特質，在特定情境下可能會顯現</p>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 建議 -->
      <div class="recommendations-section" v-if="getRecommendations().length > 0">
        <h3>
          <el-icon><Bell /></el-icon>
          人生指導建議
        </h3>
        <el-collapse accordion>
          <el-collapse-item 
            v-for="(recommendation, index) in getRecommendations()" 
            :key="`rec-${index}`"
            :title="`建議 ${index + 1}: ${recommendation.substring(0, 20)}...`"
            :name="index.toString()"
          >
            <div class="recommendation-detail">
              <p>{{ recommendation }}</p>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 分析方法 -->
      <div class="methods-section">
        <h3>
          <el-icon><Document /></el-icon>
          解讀方法與依據
        </h3>
        <div class="methods-info">
          <div class="methods-tags">
            <el-tag 
              v-for="(method, index) in getMethodsUsed()" 
              :key="`method-${index}`" 
              class="method-tag"
              :type="getMethodTagType(index)"
              effect="dark"
            >
              {{ method }}
            </el-tag>
          </div>
          <div class="methods-details">
            <p>本解讀整合八字與紫微斗數的傳統智慧，提供全面的人生解讀</p>
            <p class="updated-at">解讀時間: {{ getCurrentDateTime() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { 
  Loading, Warning, Check, InfoFilled, DataAnalysis, Connection, 
  TrendCharts, Bell, Document
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { IntegratedAnalysisResponse } from '@/types/astrologyTypes';

interface Props {
  integratedAnalysis?: IntegratedAnalysisResponse | null;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  integratedAnalysis: null,
  loading: false,
  error: null
});

// 響應式資料
const isMobile = ref(window.innerWidth <= 768);
const confidenceScore = computed(() => getConfidenceValue());

// 監視分析結果變化，用於調試
watch(() => props.integratedAnalysis, (newVal) => {
  if (newVal) {
    console.log('IntegratedAnalysisDisplay 收到的分析結果:', newVal);
    // 檢查資料結構是否符合預期
    if (!newVal.data?.integratedAnalysis) {
      console.warn('分析結果缺少 data.integratedAnalysis 屬性，這可能是正常的初始狀態:', newVal);
    }
  }
}, { immediate: true, deep: true });

// 當組件掛載時進行檢查
onMounted(() => {
  console.log('IntegratedAnalysisDisplay 組件掛載，當前分析結果:', props.integratedAnalysis);
});

// 獲取信心度值
const getConfidenceValue = () => {
  try {
    if (!props.integratedAnalysis?.data?.analysisInfo?.confidence) {
      return 0.5; // 默認值
    }
    return props.integratedAnalysis.data.analysisInfo.confidence;
  } catch (error) {
    console.warn('獲取信心度值時發生錯誤:', error);
    return 0.5;
  }
};

// 獲取一致性發現
const getConsensusFindings = () => {
  try {
    if (!props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings) {
      return [];
    }
    return props.integratedAnalysis.data.integratedAnalysis.consensusFindings;
  } catch (error) {
    console.warn('獲取一致性發現時發生錯誤:', error);
    return [];
  }
};

// 獲取分歧發現
const getDivergentFindings = () => {
  try {
    if (!props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings) {
      return [];
    }
    return props.integratedAnalysis.data.integratedAnalysis.divergentFindings;
  } catch (error) {
    console.warn('獲取分歧發現時發生錯誤:', error);
    return [];
  }
};

// 獲取建議
const getRecommendations = () => {
  try {
    if (!props.integratedAnalysis?.data?.integratedAnalysis?.recommendations) {
      return [];
    }
    return props.integratedAnalysis.data.integratedAnalysis.recommendations;
  } catch (error) {
    console.warn('獲取建議時發生錯誤:', error);
    return [];
  }
};

// 獲取使用的方法
const getMethodsUsed = () => {
  try {
    if (!props.integratedAnalysis?.data?.analysisInfo?.methodsUsed) {
      return ['紫微斗數', '四柱八字'];
    }
    return props.integratedAnalysis.data.analysisInfo.methodsUsed;
  } catch (error) {
    console.warn('獲取使用方法時發生錯誤:', error);
    return ['紫微斗數', '四柱八字'];
  }
};

// 獲取五行分析
const getElementsAnalysis = () => {
  try {
    if (!props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis?.elements?.matches) {
      return []; // 返回空數組，不顯示預設資料
    }
    
    // 從匹配和差異中提取五行狀態
    const elements = [
      { name: '木', status: 'normal' },
      { name: '火', status: 'normal' },
      { name: '土', status: 'normal' },
      { name: '金', status: 'normal' },
      { name: '水', status: 'normal' }
    ];
    
    const matches = props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.elements.matches;
    const differences = props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.elements.differences || [];
    
    // 處理強勢五行
    matches.forEach(match => {
      if (match.includes('木行強勢')) {
        elements[0].status = 'strong';
      } else if (match.includes('火行強勢')) {
        elements[1].status = 'strong';
      } else if (match.includes('土行強勢')) {
        elements[2].status = 'strong';
      } else if (match.includes('金行強勢')) {
        elements[3].status = 'strong';
      } else if (match.includes('水行強勢')) {
        elements[4].status = 'strong';
      }
    });
    
    // 處理偏弱五行
    differences.forEach(diff => {
      if (diff.includes('木行偏弱')) {
        elements[0].status = 'weak';
      } else if (diff.includes('火行偏弱')) {
        elements[1].status = 'weak';
      } else if (diff.includes('土行偏弱')) {
        elements[2].status = 'weak';
      } else if (diff.includes('金行偏弱')) {
        elements[3].status = 'weak';
      } else if (diff.includes('水行偏弱')) {
        elements[4].status = 'weak';
      }
    });
    
    return elements;
  } catch (error) {
    console.warn('獲取五行分析時發生錯誤:', error);
    return [];
  }
};

// 獲取週期分析
const getCyclesAnalysis = () => {
  try {
    if (!props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis?.cycles?.matches) {
      return [];
    }
    return props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.cycles.matches;
  } catch (error) {
    console.warn('獲取週期分析時發生錯誤:', error);
    return [];
  }
};

// 獲取信心度狀態
const getConfidenceStatus = (confidence: number) => {
  if (confidence > 0.7) return 'success';
  if (confidence > 0.4) return 'warning';
  return 'exception';
};

// 獲取信心度描述
const getConfidenceDescription = (confidence: number) => {
  if (confidence > 0.7) return '資料完整，解讀內容詳實全面';
  if (confidence > 0.4) return '基本資料充足，解讀內容具參考價值';
  return '資料不完整，建議進一步詢問專業師傅';
};

// 獲取五行對應的圖標
const getElementIcon = (element: string) => {
  const iconMap: Record<string, string> = {
    '木': '🌳',
    '火': '🔥',
    '土': '⛰️',
    '金': '🏆',
    '水': '💧'
  };
  return iconMap[element] || '🔮';
};

// 獲取五行狀態文字
const getElementStatusText = (status: string) => {
  if (status === 'strong') return '強勢';
  if (status === 'weak') return '偏弱';
  return '中和';
};

// 獲取時間線項目類型
const getTimelineItemType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};

// 獲取時間線項目顏色
const getTimelineItemColor = (index: number) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];
  return colors[index % colors.length];
};

// 獲取方法標籤類型
const getMethodTagType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};

// 獲取當前日期時間
const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.integrated-analysis-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

.loading, .error {
  text-align: center;
  padding: 50px;
}

.analysis-result h3 {
  color: #409EFF;
  margin: 24px 0 16px 0;
  font-size: 18px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 20px;
}

.confidence-section {
  margin-bottom: 25px;
}

.title-section {
  flex: 1;
}

.key-findings-section, 
.elements-section, 
.cycles-section,
.divergent-section,
.recommendations-section,
.methods-section {
  margin-bottom: 25px;
}

.finding-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.finding-card {
  height: 100%;
  margin-bottom: 10px;
}

.finding-card :deep(.el-card__header) {
  padding: 10px 15px;
  font-size: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.finding-icon {
  font-size: 16px;
}

.elements-distribution {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.element-item {
  text-align: center;
  flex-basis: 18%;
  padding: 10px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.element-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.element-name.strong {
  color: #67C23A;
}

.element-name.weak {
  color: #F56C6C;
}

.element-status {
  font-size: 12px;
}

.cycles-list {
  list-style-type: disc;
  padding-left: 20px;
}

.cycles-list li {
  margin-bottom: 8px;
}

.divergent-note {
  color: #E6A23C;
  font-size: 14px;
  margin-bottom: 10px;
}

.recommendation-item {
  margin-bottom: 8px;
  line-height: 1.5;
}

.methods-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.method-tag {
  margin-right: 5px;
}

/* 信心度儀表板樣式 */
.confidence-gauge {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.confidence-details {
  flex: 1;
}

.confidence-details h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.confidence-desc {
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

/* 版本標籤 */
.version-tag {
  margin-left: 10px;
  font-size: 10px;
  vertical-align: top;
}

/* 標題樣式增強 */
.analysis-result h3 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis-result h3 .el-icon {
  font-size: 20px;
}

/* 五行元素樣式 */
.element-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.element-item.strong {
  background-color: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.element-item.weak {
  background-color: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.2);
}

/* 方法標籤增強 */
.methods-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.methods-details {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.updated-at {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 12px;
  }
  
  .title-section h3 {
    font-size: 1.2rem;
  }
  
  .finding-cards {
    grid-template-columns: 1fr;
  }
  
  .elements-distribution {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .element-item {
    flex-basis: 45%;
  }
}
</style>
