<template>
  <div class="daily-question-view">
    <div class="container">
      <div class="header-section">
        <h1 class="page-title">
          <span class="title-icon">💫</span>
          {{ $t('dailyQuestion.title') }}
        </h1>
        <p class="page-subtitle">{{ $t('dailyQuestion.subtitle') }}</p>
      </div>

      <DailyQuestionPanel 
        v-if="currentChartId"
        :chart-id="currentChartId"
        @question-asked="handleQuestionAsked"
      />
      
      <div v-else class="no-chart-notice">
        <el-alert
          :title="$t('dailyQuestion.noChart.title')"
          :description="$t('dailyQuestion.noChart.description')"
          type="info"
          show-icon
          :closable="false"
        />
        <el-button 
          type="primary" 
          size="large"
          @click="$router.push('/unified')"
          class="create-chart-btn"
        >
          {{ $t('dailyQuestion.noChart.calculateChart') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useChartStore } from '@/stores/chartStore'
import DailyQuestionPanel from '@/components/DailyQuestionPanel.vue'

const chartStore = useChartStore()

const currentChartId = computed(() => chartStore.currentChart?.chartId)

const handleQuestionAsked = () => {
  // Handle post-question actions if needed
  console.log('Question asked successfully')
}

// Load chart from localStorage on mount
onMounted(() => {
  chartStore.loadFromLocalStorage()
})
</script>

<style scoped>
.daily-question-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--purple-star) 100%);
  padding: var(--space-lg) 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.header-section {
  text-align: center;
  margin-bottom: var(--space-xl);
  color: var(--text-inverse);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.title-icon {
  font-size: var(--font-size-2xl);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin: 0;
}

.no-chart-notice {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.create-chart-btn {
  margin-top: var(--space-lg);
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-sm);
  }
  
  .page-title {
    font-size: var(--font-size-2xl);
  }
  
  .page-subtitle {
    font-size: var(--font-size-md);
  }
}
</style>
