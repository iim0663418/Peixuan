<template>
  <div class="unified-view">
    <!-- 表單卡片 -->
    <div class="glass-card form-card">
      <div class="card-header">
        <Icon
          icon="mdi:chart-timeline-variant"
          width="36"
          class="header-icon"
          role="img"
          :aria-label="$t('unifiedView.title')"
        />
        <div class="header-text">
          <h2 class="header-title">{{ $t('unifiedView.title') }}</h2>
          <p class="header-subtitle">{{ $t('unifiedView.subtitle') }}</p>
        </div>
      </div>

      <UnifiedInputForm @submit="handleSubmit" />
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="glass-card result-card">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="glass-card error-card">
      <div class="error-content">
        <Icon
          icon="mdi:alert-circle"
          width="64"
          class="error-icon"
          role="img"
          aria-label="錯誤圖標"
        />
        <h3 class="error-title">{{ $t('unifiedView.error_title') }}</h3>
        <p class="error-message">{{ error }}</p>
        <el-button type="primary" size="large" @click="resetForm">
          {{ $t('unifiedView.error_retry') }}
        </el-button>
      </div>
    </div>

    <!-- 結果 -->
    <div v-else-if="result" class="glass-card result-card">
      <div class="card-header">
        <Icon
          icon="mdi:star-circle"
          width="36"
          class="header-icon result-icon"
          role="img"
          :aria-label="$t('unifiedView.result_title')"
        />
        <h3 class="header-title">{{ $t('unifiedView.result_title') }}</h3>
      </div>

      <UnifiedResultView :result="result" />
    </div>

    <!-- 分析選擇對話框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      width="90%"
      :style="{ maxWidth: '550px' }"
      center
      :close-on-click-modal="false"
      class="analysis-dialog"
    >
      <template #header>
        <div class="dialog-hero">
          <Icon
            icon="fluent-emoji-flat:unicorn"
            width="80"
            class="hero-icon"
            role="img"
            aria-label="佩璇獨角獸"
          />
          <h3 class="dialog-title">{{ $t('unifiedView.dialog_title') }}</h3>
          <p class="dialog-subtitle">{{ $t('unifiedView.dialog_subtitle') }}</p>
        </div>
      </template>

      <div class="dialog-content">
        <div class="analysis-choices">
          <!-- 性格分析 -->
          <div
            class="choice-card"
            @click="handleAnalysisChoice('/personality')"
          >
            <div class="choice-icon-container personality">
              <Icon icon="mdi:account-star" width="40" role="presentation" />
            </div>
            <div class="choice-info">
              <h4 class="choice-title">
                {{ $t('unifiedView.personality_title') }}
              </h4>
              <p class="choice-desc">
                {{ $t('unifiedView.personality_desc') }}
              </p>
            </div>
            <Icon
              icon="mdi:chevron-right"
              width="24"
              class="choice-arrow"
              role="presentation"
            />
          </div>

          <!-- 運勢分析 -->
          <div class="choice-card" @click="handleAnalysisChoice('/fortune')">
            <div class="choice-icon-container fortune">
              <Icon icon="mdi:crystal-ball" width="40" role="presentation" />
            </div>
            <div class="choice-info">
              <h4 class="choice-title">
                {{ $t('unifiedView.fortune_title') }}
              </h4>
              <p class="choice-desc">{{ $t('unifiedView.fortune_desc') }}</p>
            </div>
            <Icon
              icon="mdi:chevron-right"
              width="24"
              class="choice-arrow"
              role="presentation"
            />
          </div>
        </div>

        <div class="dialog-footer">
          <el-button link @click="showAnalysisDialog = false">
            {{ $t('common.cancel') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import unifiedApiService, {
  type CalculationResult,
  type UnifiedCalculateRequest,
} from '../services/unifiedApiService';
import { useChartStore } from '../stores/chartStore';
import { loadCachedChart as loadChart } from '../utils/chartCache';

const chartStore = useChartStore();
const router = useRouter();
const { t } = useI18n();

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

const resetForm = () => {
  error.value = '';
  result.value = null;
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

      ElMessage.success(t('unifiedView.messages.chartLoaded'));
    }

    loading.value = false;
  }
});
</script>

<style scoped>
/* ========== 容器 ========== */
.unified-view {
  min-height: 100vh;
  padding: var(--space-2xl);

  /* 淺色漸層背景 */
  background:
    radial-gradient(
      circle at top right,
      rgba(147, 112, 219, 0.15),
      transparent 50%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(210, 105, 30, 0.1),
      transparent 50%
    ),
    linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

/* ========== Glassmorphism 卡片 ========== */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur))
    saturate(var(--glass-saturate-enhanced));
  -webkit-backdrop-filter: blur(var(--glass-blur))
    saturate(var(--glass-saturate-enhanced));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  box-shadow:
    var(--shadow-glass-deeper),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
  margin: 0 auto var(--space-2xl);
  max-width: 900px;
}

/* ========== 卡片標題 ========== */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.header-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.result-icon {
  color: var(--peixuan-purple);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.header-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 錯誤卡片 ========== */
.error-card {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-3xl);
  text-align: center;
}

.error-icon {
  color: var(--error);
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--error);
  margin: 0;
}

.error-message {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 分析選擇對話框 ========== */
:deep(.analysis-dialog .el-dialog) {
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
  padding: 0 !important;
}

:deep(.analysis-dialog .el-dialog__header) {
  display: none;
}

.dialog-hero {
  background: linear-gradient(135deg, var(--peixuan-purple), #7c3aed);
  padding: var(--space-3xl) var(--space-2xl);
  text-align: center;
  color: white;
}

.hero-icon {
  margin-bottom: var(--space-lg);
}

.dialog-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.dialog-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.9;
  margin: 0;
}

.dialog-content {
  padding: var(--space-2xl);
}

/* ========== 分析選擇卡片 ========== */
.analysis-choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.choice-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-spring);
}

.choice-card:hover {
  background: white;
  border-color: var(--peixuan-purple);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(147, 112, 219, 0.15);
}

.choice-icon-container {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
  box-shadow: 0 8px 16px -4px rgba(124, 58, 237, 0.3);
}

.choice-icon-container.personality {
  background: linear-gradient(135deg, var(--peixuan-purple), #7c3aed);
}

.choice-icon-container.fortune {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-light)
  );
}

.choice-info {
  flex: 1;
}

.choice-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.choice-desc {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.choice-arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform var(--transition-normal) var(--ease-spring);
}

.choice-card:hover .choice-arrow {
  transform: translateX(4px);
}

.dialog-footer {
  text-align: center;
  margin-top: var(--space-xl);
}

/* ========== 響應式 ========== */
@media (max-width: 767px) {
  .unified-view {
    padding: var(--space-lg);
  }

  .glass-card {
    padding: var(--space-xl);
    border-radius: var(--radius-lg);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .choice-card {
    flex-direction: column;
    text-align: center;
    padding: var(--space-lg);
  }

  .choice-icon-container {
    width: 48px;
    height: 48px;
  }

  .choice-icon-container :deep(svg) {
    width: 32px;
    height: 32px;
  }

  .choice-arrow {
    transform: rotate(90deg);
  }

  .choice-card:hover .choice-arrow {
    transform: rotate(90deg) translateX(4px);
  }
}

/* ========== 深色模式 ========== */
html.dark .unified-view {
  background:
    radial-gradient(
      circle at top right,
      rgba(147, 112, 219, 0.2),
      transparent 50%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(210, 105, 30, 0.15),
      transparent 50%
    ),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

html.dark .glass-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .header-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

html.dark .choice-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

html.dark .choice-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

html.dark .choice-desc {
  color: rgba(255, 255, 255, 0.6);
}

/* ========== 無障礙 ========== */
@media (prefers-reduced-motion: reduce) {
  .choice-card,
  .choice-arrow {
    transition: none;
  }

  .choice-card:hover {
    transform: none;
  }
}
</style>
