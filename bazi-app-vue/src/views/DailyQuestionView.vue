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
        <div class="welcome-card">
          <div class="peixuan-avatar-large">🔮</div>
          <h3>{{ $t('dailyQuestion.noChart.quickSetupTitle') }}</h3>
          <p>{{ $t('dailyQuestion.noChart.quickSetupDescription') }}</p>
          <el-button
            type="primary"
            size="large"
            @click="showQuickSetupModal = true"
            class="quick-setup-btn"
          >
            {{ $t('dailyQuestion.noChart.quickSetupButton') }}
          </el-button>
        </div>
      </div>

      <!-- Quick Setup Modal -->
      <el-dialog
        v-model="showQuickSetupModal"
        :title="$t('dailyQuestion.noChart.quickSetupTitle')"
        width="90%"
        :style="{ maxWidth: '600px' }"
        center
      >
        <QuickSetupForm @chart-created="handleChartCreated" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChartStore } from '@/stores/chartStore'
import DailyQuestionPanel from '@/components/DailyQuestionPanel.vue'
import QuickSetupForm from '@/components/QuickSetupForm.vue'

const chartStore = useChartStore()
const showQuickSetupModal = ref(false)

const currentChartId = computed(() => chartStore.currentChart?.chartId)

const handleQuestionAsked = () => {
  // Handle post-question actions if needed
  console.log('Question asked successfully')
}

const handleChartCreated = () => {
  // Close modal and reload chart data
  showQuickSetupModal.value = false
  chartStore.loadFromLocalStorage()
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
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.welcome-card {
  text-align: center;
  padding: var(--space-2xl);
}

.peixuan-avatar-large {
  font-size: 64px;
  margin-bottom: var(--space-lg);
  animation: float 3s ease-in-out infinite;
}

.welcome-card h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
}

.welcome-card p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--space-xl) 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.quick-setup-btn {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--font-size-lg);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
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
