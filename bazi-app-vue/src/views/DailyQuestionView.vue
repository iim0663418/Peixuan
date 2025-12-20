<template>
  <div class="daily-question-fullscreen">
    <DailyQuestionPanel
      v-if="currentChartId"
      :chart-id="currentChartId"
      @question-asked="handleQuestionAsked"
      class="fullscreen-panel"
    />

    <div v-else class="no-chart-notice">
      <div class="container">
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
        append-to-body
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
  // Handle question asked event
}

const handleChartCreated = () => {
  showQuickSetupModal.value = false
  // Chart will be automatically loaded by the store
}

// Load chart from localStorage on mount
onMounted(() => {
  chartStore.loadFromLocalStorage()
})
</script>

<style scoped>
/* Fullscreen chat interface */
.daily-question-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.fullscreen-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* No chart notice styling */
.no-chart-notice {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-2xl);
}

.welcome-card {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-purple);
  text-align: center;
  padding: var(--space-2xl);
}

.peixuan-avatar-large {
  font-size: 64px;
  margin-bottom: var(--space-lg);
  filter: drop-shadow(0 0 20px var(--purple-star));
}

.welcome-card h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
}

.welcome-card p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--space-xl) 0;
  line-height: var(--line-height-relaxed);
}

.quick-setup-btn {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  background: var(--gradient-purple);
  border: 1px solid var(--purple-star-lighter);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-purple);
  color: var(--text-inverse);
  transition: all var(--transition-normal);
}

.quick-setup-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .container {
    padding: var(--space-lg);
  }
  
  .welcome-card {
    padding: var(--space-xl);
  }
  
  .peixuan-avatar-large {
    font-size: 48px;
  }
}

/* 深色模式優化 */
@media (prefers-color-scheme: dark) {
  .welcome-card h3 {
    color: #ffffff !important;
  }
  
  .welcome-card p {
    color: #e5e7eb !important;
  }
  
  /* Element Plus Dialog 深色模式 */
  :deep(.el-dialog) {
    background: var(--bg-secondary) !important;
    border: 1px solid var(--border-light) !important;
  }
  
  :deep(.el-dialog__header) {
    background: var(--bg-tertiary) !important;
    border-bottom: 1px solid var(--border-light) !important;
  }
  
  :deep(.el-dialog__title) {
    color: var(--text-primary) !important;
  }
  
  :deep(.el-dialog__body) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
  }
  
  :deep(.el-dialog__footer) {
    background: var(--bg-tertiary) !important;
    border-top: 1px solid var(--border-light) !important;
  }
  
  :deep(.el-overlay) {
    background: rgba(0, 0, 0, 0.7) !important;
  }
}
</style>
