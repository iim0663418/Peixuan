<template>
  <div class="unified-view">
    <el-card class="form-card">
      <template #header>
        <h2>整合命盤計算</h2>
      </template>

      <UnifiedInputForm @submit="handleSubmit" />
    </el-card>

    <el-card v-if="loading" class="result-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-else-if="error" class="result-card error">
      <el-alert type="error" :title="error" show-icon
:closable="false" />
    </el-card>

    <el-card v-else-if="result" class="result-card">
      <template #header>
        <h3>計算結果</h3>
      </template>

      <UnifiedResultView :result="result" />
    </el-card>

    <el-dialog
      v-model="showAnalysisDialog"
      title="選擇分析類型"
      width="90%"
      :style="{ maxWidth: '500px' }"
    >
      <div class="analysis-choices">
        <el-button
          type="primary"
          class="choice-btn"
          @click="handleAnalysisChoice('/ai-analysis')"
        >
          <div class="choice-content">
            <span class="choice-title">佩璇性格分析</span>
            <span class="choice-desc">深入了解性格特質</span>
          </div>
        </el-button>
        <el-button
          type="success"
          class="choice-btn"
          @click="handleAnalysisChoice('/advanced-analysis')"
        >
          <div class="choice-content">
            <span class="choice-title">佩璇運勢分析</span>
            <span class="choice-desc">查看流年運勢</span>
          </div>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import unifiedApiService, {
  type CalculationResult,
} from '../services/unifiedApiService';
import { useChartStore } from '../stores/chartStore';

const chartStore = useChartStore();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const result = ref<CalculationResult | null>(null);
const showAnalysisDialog = ref(false);

const handleSubmit = async (birthInfo: any) => {
  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    result.value = await unifiedApiService.calculate(birthInfo);

    // Save to chartStore - use chartId from backend
    const chartId = (result.value as any).chartId || `chart_${Date.now()}`;
    chartStore.setCurrentChart({
      chartId,
      calculation: result.value,
      metadata: {
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        gender: birthInfo.gender,
        longitude: birthInfo.longitude,
      },
      createdAt: new Date(),
    });

    ElMessage.success('計算完成');
    showAnalysisDialog.value = true;
  } catch (err: any) {
    error.value = err.message || '計算失敗，請稍後再試';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleAnalysisChoice = (route: string) => {
  showAnalysisDialog.value = false;
  router.push(route);
};

onMounted(async () => {
  const chartId = chartStore.loadFromLocalStorage();

  // Try to load cached chart result
  if (chartId) {
    try {
      loading.value = true;

      const url = `/api/charts/${chartId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        // 轉換後端格式為前端格式
        const { chartData } = data;
        const backendWuxing = chartData.bazi.wuxingDistribution;

        result.value = {
          input: chartData.input,
          bazi: {
            ...chartData.bazi,
            fourPillars: {
              year: {
                gan: chartData.bazi.fourPillars.year.stem,
                zhi: chartData.bazi.fourPillars.year.branch,
              },
              month: {
                gan: chartData.bazi.fourPillars.month.stem,
                zhi: chartData.bazi.fourPillars.month.branch,
              },
              day: {
                gan: chartData.bazi.fourPillars.day.stem,
                zhi: chartData.bazi.fourPillars.day.branch,
              },
              hour: {
                gan: chartData.bazi.fourPillars.hour.stem,
                zhi: chartData.bazi.fourPillars.hour.branch,
              },
            },
            // 轉換 wuxingDistribution: 英文鍵 → 中文鍵
            wuxingDistribution: {
              raw: {
                木:
                  (backendWuxing.raw.tiangan?.Wood || 0) +
                  (backendWuxing.raw.hiddenStems?.Wood || 0),
                火:
                  (backendWuxing.raw.tiangan?.Fire || 0) +
                  (backendWuxing.raw.hiddenStems?.Fire || 0),
                土:
                  (backendWuxing.raw.tiangan?.Earth || 0) +
                  (backendWuxing.raw.hiddenStems?.Earth || 0),
                金:
                  (backendWuxing.raw.tiangan?.Metal || 0) +
                  (backendWuxing.raw.hiddenStems?.Metal || 0),
                水:
                  (backendWuxing.raw.tiangan?.Water || 0) +
                  (backendWuxing.raw.hiddenStems?.Water || 0),
              },
              adjusted: {
                木: backendWuxing.adjusted?.Wood || 0,
                火: backendWuxing.adjusted?.Fire || 0,
                土: backendWuxing.adjusted?.Earth || 0,
                金: backendWuxing.adjusted?.Metal || 0,
                水: backendWuxing.adjusted?.Water || 0,
              },
            },
          },
          ziwei: chartData.ziwei,
          annualFortune: chartData.annualFortune,
          timestamp: chartData.timestamp,
        } as any;

        console.log('[UnifiedView] Set result.value:', result.value);

        // 更新 chartStore 以啟用 AI 分析按鈕
        if (result.value) {
          chartStore.setCurrentChart({
            chartId: data.id,
            calculation: result.value,
            metadata: data.metadata,
            createdAt: new Date(data.createdAt),
          });
        }

        ElMessage.success('已載入上次的命盤結果');
      } else {
        console.warn(
          '[UnifiedView] Response not OK:',
          response.status,
          response.statusText,
        );
      }
    } catch (err) {
      console.error('[UnifiedView] Failed to load cached chart:', err);
      // Silently fail, user can recalculate
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
/* ==========================================
   Mobile-First Responsive View Styles
   ========================================== */

/* Base styles (Mobile < 480px) */
.unified-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(0.75rem, 3vw, 1.5rem);
}

.form-card,
.result-card {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  border-radius: clamp(8px, 2vw, 12px);
}

/* Error state styling */
.result-card.error {
  background-color: #fef0f0;
}

/* Result sections */
.result-section {
  padding: clamp(1rem, 3vw, 1.5rem) 0;
}

/* Pillar display */
.pillar {
  text-align: center;
  padding: clamp(0.875rem, 2.5vw, 1.25rem);
  background: #f5f7fa;
  border-radius: 8px;
}

.pillar-label {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #909399;
  margin-bottom: clamp(0.5rem, 1.5vw, 0.75rem);
  line-height: 1.4;
}

.pillar-value {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: bold;
  color: #303133;
  line-height: 1.3;
}

/* Typography - fluid sizing */
h2 {
  margin: 0;
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: #303133;
  line-height: 1.3;
}

h3 {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: #303133;
  line-height: 1.4;
}

h4 {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #606266;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  line-height: 1.4;
}

/* Card header styling */
:deep(.el-card__header) {
  padding: clamp(1rem, 3vw, 1.25rem);
}

:deep(.el-card__body) {
  padding: clamp(1rem, 3vw, 1.5rem);
}

/* Alert styling for better mobile readability */
:deep(.el-alert) {
  padding: clamp(0.75rem, 2.5vw, 1rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

:deep(.el-alert__title) {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

/* Skeleton loading optimization */
:deep(.el-skeleton) {
  padding: clamp(1rem, 3vw, 1.5rem);
}

/* ==========================================
   Tablet and above (≥ 480px)
   ========================================== */
@media (min-width: 480px) {
  .unified-view {
    padding: 1.25rem;
  }

  .form-card,
  .result-card {
    margin-bottom: 1.25rem;
  }
}

/* ==========================================
   Tablet (≥ 768px)
   ========================================== */
@media (min-width: 768px) {
  .unified-view {
    padding: 1.5rem;
  }

  .form-card,
  .result-card {
    margin-bottom: 1.5rem;
  }

  :deep(.el-card__header) {
    padding: 1.25rem 1.5rem;
  }

  :deep(.el-card__body) {
    padding: 1.5rem;
  }
}

/* ==========================================
   Desktop (≥ 1024px)
   ========================================== */
@media (min-width: 1024px) {
  .unified-view {
    padding: 2rem;
  }

  .form-card,
  .result-card {
    margin-bottom: 2rem;
  }
}

/* ==========================================
   Analysis Choice Dialog
   ========================================== */
.analysis-choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md);
}

.choice-btn {
  min-height: 80px;
  height: auto;
  width: 100%;
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.choice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.choice-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
}

.choice-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.choice-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}

/* Mobile optimization for choice buttons */
@media (max-width: 767px) {
  .choice-btn {
    min-height: 60px;
    padding: var(--space-md);
  }

  .choice-title {
    font-size: var(--font-size-base);
  }

  .choice-desc {
    font-size: var(--font-size-xs);
  }
}

/* Disable hover effects on touch devices */
@media (hover: none) {
  .choice-btn:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>
