<template>
  <div class="unified-view">
    <el-card class="form-card">
      <template #header>
        <h2>統一命盤計算</h2>
      </template>

      <UnifiedInputForm :initial-data="savedMetadata" @submit="handleSubmit" />
    </el-card>

    <el-card v-if="loading" class="result-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-else-if="error" class="result-card error">
      <el-alert
        type="error"
        :title="error"
        show-icon
        :closable="false"
      />
    </el-card>

    <el-card v-else-if="result" class="result-card">
      <template #header>
        <h3>計算結果</h3>
      </template>

      <UnifiedResultView :result="result" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import unifiedApiService, {
  type CalculationResult,
} from '../services/unifiedApiService';
import { useChartStore } from '../stores/chartStore';

const chartStore = useChartStore();

const loading = ref(false);
const error = ref('');
const result = ref<CalculationResult | null>(null);
const savedMetadata = ref<any>(null);

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
  } catch (err: any) {
    error.value = err.message || '計算失敗，請稍後再試';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const { chartId, metadata } = chartStore.loadFromLocalStorage();
  
  console.log('[UnifiedView] onMounted - chartId:', chartId, 'metadata:', metadata);
  
  // Load saved metadata for form autofill
  if (metadata) {
    savedMetadata.value = metadata;
    console.log('[UnifiedView] Loaded saved metadata:', metadata);
  }
  
  // Try to load cached chart result
  if (chartId) {
    try {
      console.log('[UnifiedView] Found cached chartId, loading result:', chartId);
      loading.value = true;
      
      const url = `/api/v1/charts/${chartId}`;
      console.log('[UnifiedView] Fetching from:', url);
      
      const response = await fetch(url);
      console.log('[UnifiedView] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[UnifiedView] Received data:', data);
        
        result.value = {
          chartId: data.id,
          ...data.chartData,
        };
        console.log('[UnifiedView] Set result.value:', result.value);
        ElMessage.success('已載入上次的命盤結果');
      } else {
        console.warn('[UnifiedView] Response not OK:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('[UnifiedView] Failed to load cached chart:', err);
      // Silently fail, user can recalculate
    } finally {
      loading.value = false;
    }
  } else {
    console.log('[UnifiedView] No chartId found in localStorage');
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
</style>
