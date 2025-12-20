<template>
  <div class="unified-view">
    <el-card class="form-card">
      <template #header>
        <h2>{{ $t('unifiedView.title') }}</h2>
      </template>

      <UnifiedInputForm @submit="handleSubmit" />
    </el-card>

    <el-card v-if="loading" class="result-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-else-if="error" class="result-card error">
      <el-alert type="error" :title="error" show-icon :closable="false" />
    </el-card>

    <el-card v-else-if="result" class="result-card">
      <template #header>
        <h3>{{ $t('unifiedView.result_title') }}</h3>
      </template>

      <UnifiedResultView :result="result" />
      
      <!-- Daily Question Panel -->
      <div v-if="result.chartId" class="daily-question-section">
        <DailyQuestionPanel :chart-id="result.chartId" />
      </div>
    </el-card>

    <el-dialog
      v-model="showAnalysisDialog"
      :title="$t('unifiedView.dialog_title')"
      width="90%"
      :style="{ maxWidth: '600px' }"
      center
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ $t('unifiedView.dialog_title') }}</h3>
          <p class="dialog-subtitle">{{ $t('unifiedView.dialog_subtitle') }}</p>
        </div>
      </template>

      <div class="analysis-choices">
        <div class="choice-card" @click="handleAnalysisChoice('/ai-analysis')">
          <div class="choice-icon">🌟</div>
          <div class="choice-info">
            <h4 class="choice-title">
              {{ $t('unifiedView.personality_title') }}
            </h4>
            <p class="choice-desc">{{ $t('unifiedView.personality_desc') }}</p>
          </div>
          <div class="choice-arrow">→</div>
        </div>

        <div
          class="choice-card"
          @click="handleAnalysisChoice('/advanced-analysis')"
        >
          <div class="choice-icon">🔮</div>
          <div class="choice-info">
            <h4 class="choice-title">{{ $t('unifiedView.fortune_title') }}</h4>
            <p class="choice-desc">{{ $t('unifiedView.fortune_desc') }}</p>
          </div>
          <div class="choice-arrow">→</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showAnalysisDialog = false">{{
          $t('unifiedView.later_button')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import DailyQuestionPanel from '../components/DailyQuestionPanel.vue';
import unifiedApiService, {
  type CalculationResult,
  type UnifiedCalculateRequest,
} from '../services/unifiedApiService';
import { useChartStore } from '../stores/chartStore';
import {
  loadCachedChart as loadChart,
  // type BackendChartResponse,
} from '../utils/chartCache';

const chartStore = useChartStore();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const result = ref<CalculationResult | null>(null);
const showAnalysisDialog = ref(false);

const handleSubmit = async (birthInfo: UnifiedCalculateRequest) => {
  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    result.value = await unifiedApiService.calculate(birthInfo);

    // Save to chartStore - use chartId from backend
    const chartId = result.value.chartId || `chart_${Date.now()}`;
    chartStore.setCurrentChart({
      chartId,
      calculation: result.value,
      metadata: {
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        gender: birthInfo.gender,
        longitude: birthInfo.longitude ?? 121.5,
      },
      createdAt: new Date(),
    });

    ElMessage.success('計算完成');
    showAnalysisDialog.value = true;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : '計算失敗，請稍後再試';
    error.value = errorMessage;
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
    loading.value = true;
    const cachedResult = await loadChart(chartId);

    if (cachedResult) {
      result.value = cachedResult;

      // Update chartStore to enable AI analysis buttons
      chartStore.setCurrentChart({
        chartId,
        calculation: cachedResult,
        metadata: {
          birthDate: cachedResult.input.solarDate,
          birthTime:
            cachedResult.input.solarDate.split('T')[1]?.slice(0, 5) || '00:00',
          gender: cachedResult.input.gender,
          longitude: cachedResult.input.longitude ?? 0,
        },
        createdAt: new Date(cachedResult.timestamp),
      });

      ElMessage.success('已載入上次的命盤結果');
    }

    loading.value = false;
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

/* ==========================================
   Dialog Styles
   ========================================== */

/* Dialog header */
.dialog-header {
  text-align: center;
  padding: var(--space-md) 0;
}

.dialog-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-sm) 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

/* Analysis choices */
.analysis-choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
}

.choice-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.choice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.choice-card:active {
  transform: translateY(-2px);
}

.choice-icon {
  font-size: 3rem;
  line-height: 1;
  flex-shrink: 0;
}

.choice-info {
  flex: 1;
  min-width: 0;
}

.choice-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.choice-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.choice-arrow {
  font-size: var(--font-size-2xl);
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.choice-card:hover .choice-arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

/* Mobile optimization */
@media (max-width: 767px) {
  .dialog-title {
    font-size: var(--font-size-xl);
  }

  .choice-card {
    padding: var(--space-lg);
    gap: var(--space-md);
  }

  .choice-icon {
    font-size: 2.5rem;
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

  .choice-card:hover {
    transform: none;
  }

  .choice-card:active {
    transform: scale(0.98);
  }
}

.daily-question-section {
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--border-color);
}
</style>
