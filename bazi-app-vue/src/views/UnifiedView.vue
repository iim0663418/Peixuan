<template>
  <div class="unified-view">
    <el-card class="form-card">
      <template #header>
        <h2>統一命盤計算</h2>
      </template>

      <UnifiedInputForm @submit="handleSubmit" />
    </el-card>

    <el-card v-if="loading" class="result-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-else-if="error" class="result-card error">
      <el-alert
type="error"
:title="error" show-icon :closable="false"
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import unifiedApiService, {
  type CalculationResult,
} from '../services/unifiedApiService';

const loading = ref(false);
const error = ref('');
const result = ref<CalculationResult | null>(null);

const handleSubmit = async (birthInfo: any) => {
  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    result.value = await unifiedApiService.calculate(birthInfo);
    ElMessage.success('計算完成');
  } catch (err: any) {
    error.value = err.message || '計算失敗，請稍後再試';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.unified-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-card,
.result-card {
  margin-bottom: 20px;
}

.result-card.error {
  background-color: #fef0f0;
}

.result-section {
  padding: 20px 0;
}

.pillar {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.pillar-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.pillar-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

h4 {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .unified-view {
    padding: 10px;
  }

  .pillar-value {
    font-size: 20px;
  }
}
</style>
