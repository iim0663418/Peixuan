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
          <el-tag
size="small" effect="dark" type="success" class="version-tag"
            >2025版</el-tag
          >
        </h3>
      </div>

      <!-- 關鍵發現 -->
      <div class="key-findings-section">
        <h3>人生關鍵特質</h3>
        <div class="finding-cards">
          <el-card
            v-for="(finding, index) in getConsensusFindings()"
            :key="`consensus-${index}`"
            class="finding-card consensus"
          >
            <template #header>
              <div class="card-header">
                <el-icon
class="finding-icon" color="#67C23A"
                  ><Check
                /></el-icon>
                <span>{{ finding }}</span>
              </div>
            </template>
          </el-card>
        </div>
      </div>

      <!-- 五行分析 -->
      <div v-if="getElementsAnalysis.length > 0" class="elements-section">
        <h3>
          <el-icon><Connection /></el-icon>
          本命五行配置
          <el-button
            type="text"
            :icon="Refresh"
            size="small"
            title="重新計算五行分析"
            class="refresh-btn"
            @click="refreshElementsAnalysis"
          />
        </h3>
        <div :key="elementsUpdateKey" class="elements-distribution">
          <div
            v-for="element in getElementsAnalysis"
            :key="`${element.name}-${elementsUpdateKey}`"
            class="element-item"
            :class="element.status"
          >
            <div class="element-icon">{{ getElementIcon(element.name) }}</div>
            <div class="element-name" :class="element.status">
              {{ element.name }}
            </div>
            <div class="element-status">
              {{ getElementStatusText(element.status) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 運勢期程 -->
      <div v-if="getCyclesAnalysis.length > 0" class="cycles-section">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          運勢週期與人生階段
        </h3>
        <el-timeline>
          <el-timeline-item
            v-for="(cycle, index) in getCyclesAnalysis"
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
      <div v-if="getDivergentFindings.length > 0" class="divergent-section">
        <h3>
          <el-icon><Warning /></el-icon>
          深層特質解析
          <el-tooltip
            content="以下為不同角度的深層解讀，幫助您全面了解自己"
            placement="top"
          >
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
          <el-button
            type="text"
            :icon="Refresh"
            size="small"
            title="重新計算分歧分析"
            class="refresh-btn"
            @click="refreshDualityAnalysis"
          />
        </h3>

        <div :key="dualityUpdateKey" class="finding-cards">
          <el-card
            v-for="(finding, index) in getDivergentFindings"
            :key="`divergent-${index}-${dualityUpdateKey}`"
            class="finding-card divergent"
          >
            <template #header>
              <div class="card-header">
                <el-icon
class="finding-icon" color="#E6A23C"
                  ><Warning
                /></el-icon>
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
      <div
        v-if="getRecommendations().length > 0"
        class="recommendations-section"
      >
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
          <el-button
            v-if="isDev"
            type="text"
            :icon="Refresh"
            size="small"
            title="重新計算所有分析內容"
            class="refresh-btn"
            @click="refreshAllAnalysis"
          />
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
import { ref, onMounted, watch, computed, defineAsyncComponent } from 'vue';
import {
  Loading,
  Warning,
  Check,
  InfoFilled,
  DataAnalysis,
  Connection,
  TrendCharts,
  Bell,
  Document,
  Refresh,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { IntegratedAnalysisResponse } from '@/types/astrologyTypes';

interface Props {
  integratedAnalysis?: IntegratedAnalysisResponse | null;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  integratedAnalysis: null,
  loading: false,
  error: null,
});

// 響應式資料
const isMobile = ref(window.innerWidth <= 768);
const confidenceScore = computed(() => getConfidenceValue());
const elementsUpdateKey = ref(0);
const dualityUpdateKey = ref(0);
const isDev = ref(import.meta.env.DEV);

// 監視分析結果變化，用於調試和自動更新
watch(
  () => props.integratedAnalysis,
  (newVal, oldVal) => {
    if (newVal) {
      console.log('IntegratedAnalysisDisplay 收到的分析結果:', newVal);
      // 檢查資料結構是否符合預期
      if (!newVal.data?.integratedAnalysis) {
        console.warn(
          '分析結果缺少 data.integratedAnalysis 屬性，這可能是正常的初始狀態:',
          newVal,
        );
      }

      // 檢查是否有實質性的資料變化
      const hasDataChanged =
        !oldVal ||
        JSON.stringify(newVal.data) !== JSON.stringify(oldVal.data) ||
        newVal.timestamp !== oldVal.timestamp;

      if (hasDataChanged) {
        console.log('檢測到分析結果實質變化，自動更新顯示內容');
        // 使用 nextTick 確保資料已經更新後再觸發重新渲染
        setTimeout(() => {
          elementsUpdateKey.value++;
          dualityUpdateKey.value++;
          console.log('已觸發五行和分歧分析的重新計算');
        }, 100);

        // 只在有舊資料時顯示更新訊息
        if (oldVal) {
          ElMessage.success('分析內容已自動更新');
        }
      }
    }
  },
  { immediate: true, deep: true },
);

// 額外監視特定的資料路徑變化
watch(
  () => [
    props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings,
    props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings,
    props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis,
  ],
  (newVals, oldVals) => {
    if (
      oldVals &&
      newVals &&
      JSON.stringify(newVals) !== JSON.stringify(oldVals)
    ) {
      console.log('檢測到特定資料路徑變化，強制更新');
      elementsUpdateKey.value++;
      dualityUpdateKey.value++;
    }
  },
  { deep: true },
);

// 當組件掛載時進行檢查
onMounted(() => {
  console.log(
    'IntegratedAnalysisDisplay 組件掛載，當前分析結果:',
    props.integratedAnalysis,
  );
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
    if (
      !props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings
    ) {
      return [];
    }
    return props.integratedAnalysis.data.integratedAnalysis.consensusFindings;
  } catch (error) {
    console.warn('獲取一致性發現時發生錯誤:', error);
    return [];
  }
};

// 獲取分歧發現 - 使用 computed 讓它具有響應性
const getDivergentFindings = computed((): string[] => {
  try {
    console.log(
      '重新計算分歧分析資料, 完整資料結構:',
      props.integratedAnalysis,
    );

    // 強制更新響應性
    const _ = dualityUpdateKey.value;

    // 檢查多個可能的資料路徑
    let divergentFindings: string[] = [];

    // 路徑1: 直接的 divergentFindings
    if (props.integratedAnalysis?.data?.integratedAnalysis?.divergentFindings) {
      divergentFindings =
        props.integratedAnalysis.data.integratedAnalysis.divergentFindings;
    }

    // 路徑2: 檢查是否有其他分歧相關的屬性
    if (
      divergentFindings.length === 0 &&
      props.integratedAnalysis?.data?.integratedAnalysis
    ) {
      const analysis = props.integratedAnalysis.data.integratedAnalysis as any;
      Object.keys(analysis).forEach((key) => {
        if (
          key.includes('divergent') ||
          key.includes('difference') ||
          key.includes('分歧') ||
          key.includes('差異')
        ) {
          console.log(`找到可能的分歧資料路徑: ${key}`, analysis[key]);
          if (Array.isArray(analysis[key])) {
            divergentFindings = analysis[key] as string[];
          } else if (analysis[key]?.findings || analysis[key]?.differences) {
            divergentFindings = (analysis[key].findings ||
              analysis[key].differences ||
              []) as string[];
          }
        }
      });
    }

    // 路徑3: 從詳細分析中尋找分歧資料
    if (
      divergentFindings.length === 0 &&
      props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis
    ) {
      const detailedAnalysis = props.integratedAnalysis.data.integratedAnalysis
        .detailedAnalysis as any;
      Object.keys(detailedAnalysis).forEach((key) => {
        if (detailedAnalysis[key]?.differences) {
          divergentFindings = [
            ...divergentFindings,
            ...detailedAnalysis[key].differences,
          ];
        }
      });
    }

    // 路徑4: 如果還是沒有找到，嘗試從 consensusFindings 中區分出可能的分歧內容
    if (divergentFindings.length === 0) {
      const consensusFindings =
        props.integratedAnalysis?.data?.integratedAnalysis?.consensusFindings ||
        [];
      // 查找可能表示衝突或分歧的內容
      divergentFindings = consensusFindings.filter((finding) => {
        const findingStr = String(finding).toLowerCase();
        return (
          findingStr.includes('但是') ||
          findingStr.includes('然而') ||
          findingStr.includes('不過') ||
          findingStr.includes('矛盾') ||
          findingStr.includes('差異') ||
          findingStr.includes('分歧')
        );
      });
    }

    console.log('找到的分歧分析資料:', divergentFindings);

    // 確保返回的是字符串數組
    return divergentFindings.filter(
      (finding) => finding && typeof finding === 'string',
    );
  } catch (error) {
    console.warn('獲取分歧發現時發生錯誤:', error);
    return [];
  }
});

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

// 定義五行分析結果的類型
interface ElementAnalysis {
  name: string;
  status: 'normal' | 'strong' | 'weak';
}

// 獲取五行分析 - 使用 computed 讓它具有響應性
const getElementsAnalysis = computed((): ElementAnalysis[] => {
  try {
    console.log(
      '重新計算五行分析資料, 完整資料結構:',
      props.integratedAnalysis,
    );

    // 強制更新響應性
    const _ = elementsUpdateKey.value;

    // 檢查多個可能的資料路徑
    let elementsData: any = null;
    let matches: string[] = [];
    let differences: string[] = [];

    // 路徑1: 詳細分析結構
    if (
      props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis
        ?.elements
    ) {
      elementsData =
        props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis
          .elements;
      matches = elementsData.matches || [];
      differences = elementsData.differences || [];
    }

    // 路徑2: 直接在 integratedAnalysis 下檢查是否有 elements 屬性
    if (!elementsData && props.integratedAnalysis?.data?.integratedAnalysis) {
      const analysis = props.integratedAnalysis.data.integratedAnalysis as any;
      if (analysis.elements) {
        elementsData = analysis.elements;
        matches = elementsData.matches || [];
        differences = elementsData.differences || [];
      }
    }

    // 路徑3: 檢查是否有其他資料結構
    if (!elementsData && props.integratedAnalysis?.data?.integratedAnalysis) {
      const analysis = props.integratedAnalysis.data.integratedAnalysis as any;
      // 檢查是否有任何包含五行相關資訊的屬性
      Object.keys(analysis).forEach((key) => {
        if (key.includes('elements') || key.includes('五行')) {
          console.log(`找到可能的五行資料路徑: ${key}`, analysis[key]);
          if (analysis[key]?.matches) {
            matches = analysis[key].matches || [];
            differences = analysis[key].differences || [];
            elementsData = analysis[key];
          }
        }
      });
    }

    // 如果沒有找到五行資料，嘗試從其他分析內容中提取
    if (matches.length === 0) {
      // 檢查 consensusFindings 或 divergentFindings 中是否有五行資訊
      const allFindings = [
        ...(props.integratedAnalysis?.data?.integratedAnalysis
          ?.consensusFindings || []),
        ...(props.integratedAnalysis?.data?.integratedAnalysis
          ?.divergentFindings || []),
      ];

      allFindings.forEach((finding) => {
        if (typeof finding === 'string') {
          matches.push(finding);
        }
      });
    }

    if (matches.length === 0) {
      console.log('沒有找到五行分析資料');
      return [];
    }

    console.log('找到的五行相關資料:', { matches, differences });

    // 從匹配和差異中提取五行狀態
    const elements: ElementAnalysis[] = [
      { name: '木', status: 'normal' },
      { name: '火', status: 'normal' },
      { name: '土', status: 'normal' },
      { name: '金', status: 'normal' },
      { name: '水', status: 'normal' },
    ];

    // 處理強勢五行 - 更靈活的匹配模式
    matches.forEach((match: any) => {
      const matchStr = String(match).toLowerCase();
      if (
        matchStr.includes('木') &&
        (matchStr.includes('強') ||
          matchStr.includes('旺') ||
          matchStr.includes('盛'))
      ) {
        elements[0].status = 'strong';
      } else if (
        matchStr.includes('火') &&
        (matchStr.includes('強') ||
          matchStr.includes('旺') ||
          matchStr.includes('盛'))
      ) {
        elements[1].status = 'strong';
      } else if (
        matchStr.includes('土') &&
        (matchStr.includes('強') ||
          matchStr.includes('旺') ||
          matchStr.includes('盛'))
      ) {
        elements[2].status = 'strong';
      } else if (
        matchStr.includes('金') &&
        (matchStr.includes('強') ||
          matchStr.includes('旺') ||
          matchStr.includes('盛'))
      ) {
        elements[3].status = 'strong';
      } else if (
        matchStr.includes('水') &&
        (matchStr.includes('強') ||
          matchStr.includes('旺') ||
          matchStr.includes('盛'))
      ) {
        elements[4].status = 'strong';
      }
    });

    // 處理偏弱五行 - 更靈活的匹配模式
    [...matches, ...differences].forEach((item: any) => {
      const itemStr = String(item).toLowerCase();
      if (
        itemStr.includes('木') &&
        (itemStr.includes('弱') ||
          itemStr.includes('缺') ||
          itemStr.includes('少'))
      ) {
        elements[0].status = 'weak';
      } else if (
        itemStr.includes('火') &&
        (itemStr.includes('弱') ||
          itemStr.includes('缺') ||
          itemStr.includes('少'))
      ) {
        elements[1].status = 'weak';
      } else if (
        itemStr.includes('土') &&
        (itemStr.includes('弱') ||
          itemStr.includes('缺') ||
          itemStr.includes('少'))
      ) {
        elements[2].status = 'weak';
      } else if (
        itemStr.includes('金') &&
        (itemStr.includes('弱') ||
          itemStr.includes('缺') ||
          itemStr.includes('少'))
      ) {
        elements[3].status = 'weak';
      } else if (
        itemStr.includes('水') &&
        (itemStr.includes('弱') ||
          itemStr.includes('缺') ||
          itemStr.includes('少'))
      ) {
        elements[4].status = 'weak';
      }
    });

    console.log('計算出的五行分析結果:', elements);
    return elements;
  } catch (error) {
    console.warn('獲取五行分析時發生錯誤:', error);
    return [];
  }
});

// 獲取週期分析 - 使用 computed 讓它具有響應性
const getCyclesAnalysis = computed(() => {
  try {
    console.log(
      '重新計算週期分析資料, cycles:',
      props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis
        ?.cycles,
    );
    if (
      !props.integratedAnalysis?.data?.integratedAnalysis?.detailedAnalysis
        ?.cycles?.matches
    ) {
      console.log('週期分析資料不存在，返回空數組');
      return [];
    }
    console.log(
      '計算出的週期分析結果:',
      props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis.cycles
        .matches,
    );
    return props.integratedAnalysis.data.integratedAnalysis.detailedAnalysis
      .cycles.matches;
  } catch (error) {
    console.warn('獲取週期分析時發生錯誤:', error);
    return [];
  }
});

// 獲取信心度狀態
const getConfidenceStatus = (confidence: number) => {
  if (confidence > 0.7) {
    return 'success';
  }
  if (confidence > 0.4) {
    return 'warning';
  }
  return 'exception';
};

// 獲取信心度描述
const getConfidenceDescription = (confidence: number) => {
  if (confidence > 0.7) {
    return '資料完整，解讀內容詳實全面';
  }
  if (confidence > 0.4) {
    return '基本資料充足，解讀內容具參考價值';
  }
  return '資料不完整，建議進一步詢問專業師傅';
};

// 獲取五行對應的圖標
const getElementIcon = (element: string) => {
  const iconMap: Record<string, string> = {
    木: '🌳',
    火: '🔥',
    土: '⛰️',
    金: '🏆',
    水: '💧',
  };
  return iconMap[element] || '🔮';
};

// 獲取五行狀態文字
const getElementStatusText = (status: string) => {
  if (status === 'strong') {
    return '強勢';
  }
  if (status === 'weak') {
    return '偏弱';
  }
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
    minute: '2-digit',
  });
};

// 手動刷新五行分析
const refreshElementsAnalysis = () => {
  console.log('手動刷新五行分析，當前資料:', props.integratedAnalysis);
  elementsUpdateKey.value++;
  ElMessage.success('五行分析已重新計算');
};

// 手動刷新分歧分析
const refreshDualityAnalysis = () => {
  console.log('手動刷新分歧分析，當前資料:', props.integratedAnalysis);
  dualityUpdateKey.value++;
  ElMessage.success('深層特質解析已重新計算');
};

// 調試函數：輸出當前資料結構
const logCurrentDataStructure = () => {
  console.log('=== IntegratedAnalysisDisplay 當前資料結構 ===');
  console.log('完整資料:', props.integratedAnalysis);
  if (props.integratedAnalysis?.data?.integratedAnalysis) {
    const analysis = props.integratedAnalysis.data.integratedAnalysis;
    console.log('可用的分析屬性:', Object.keys(analysis));
    console.log('consensusFindings:', analysis.consensusFindings);
    console.log('divergentFindings:', analysis.divergentFindings);
    console.log('detailedAnalysis:', analysis.detailedAnalysis);
  }
  console.log('五行分析結果:', getElementsAnalysis.value);
  console.log('分歧分析結果:', getDivergentFindings.value);
  console.log('=====================================');
};

// 刷新所有分析內容
const refreshAllAnalysis = () => {
  console.log('手動刷新所有分析內容');
  logCurrentDataStructure();
  elementsUpdateKey.value++;
  dualityUpdateKey.value++;
  ElMessage.success('所有分析內容已重新計算');
};

// 在全局暴露調試函數（開發環境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugIntegratedAnalysis = logCurrentDataStructure;
  (window as any).refreshAllAnalysis = refreshAllAnalysis;
}
</script>

<style scoped>
.integrated-analysis-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

.loading,
.error {
  text-align: center;
  padding: 50px;
}

.analysis-result h3 {
  color: #409eff;
  margin: 24px 0 16px 0;
  font-size: 18px;
  border-bottom: 1px solid #ebeef5;
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
  color: #67c23a;
}

.element-name.weak {
  color: #f56c6c;
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
  color: #e6a23c;
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

/* 刷新按鈕樣式 */
.refresh-btn {
  margin-left: 8px;
  font-size: 12px;
  padding: 4px 8px;
  color: #909399;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.refresh-btn .el-icon {
  font-size: 14px;
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
