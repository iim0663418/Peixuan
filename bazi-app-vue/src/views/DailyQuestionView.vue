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
/* ===== Cosmic Night Background ===== */
.daily-question-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #2d1b4e 0%, #1a0e2e 50%, #0d0614 100%);
  padding: var(--space-lg) 0;
  position: relative;
  overflow: hidden;
}

/* Starfield Effect */
.daily-question-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.9), transparent),
    radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 50px 50px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(2px 2px at 90px 10px, rgba(255, 255, 255, 0.8), transparent);
  background-size: 200px 200px;
  background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 150px 50px;
  animation: twinkle 6s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* Additional star layers for depth */
.daily-question-view::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 100px 150px, rgba(186, 85, 211, 0.4), transparent),
    radial-gradient(1px 1px at 180px 80px, rgba(186, 85, 211, 0.3), transparent),
    radial-gradient(1px 1px at 250px 200px, rgba(186, 85, 211, 0.35), transparent);
  background-size: 300px 300px;
  animation: twinkle 8s ease-in-out infinite reverse;
  pointer-events: none;
  z-index: 0;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  position: relative;
  z-index: 1;
}

/* ===== Mystical Typography ===== */
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
  background: linear-gradient(135deg, #ffffff 0%, #e0c3fc 50%, #ba55d3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(186, 85, 211, 0.5);
  filter: drop-shadow(0 0 10px rgba(186, 85, 211, 0.3));
}

.title-icon {
  font-size: var(--font-size-2xl);
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.9));
  }
}

.page-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* ===== Glassmorphic Welcome Card ===== */
.no-chart-notice {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(186, 85, 211, 0.2);
  box-shadow:
    0 8px 32px rgba(153, 50, 204, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 60px rgba(186, 85, 211, 0.15);
  overflow: hidden;
  position: relative;
}

/* Purple backlight glow */
.no-chart-notice::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(186, 85, 211, 0.15) 0%,
    transparent 70%
  );
  animation: rotate-glow 10s linear infinite;
  pointer-events: none;
}

@keyframes rotate-glow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.welcome-card {
  text-align: center;
  padding: var(--space-2xl);
  position: relative;
  z-index: 1;
}

.peixuan-avatar-large {
  font-size: 64px;
  margin-bottom: var(--space-lg);
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(186, 85, 211, 0.6));
}

.welcome-card h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md) 0;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.welcome-card p {
  font-size: var(--font-size-md);
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 var(--space-xl) 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  line-height: var(--line-height-relaxed);
}

/* ===== Enchanted Button ===== */
.quick-setup-btn {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  background: linear-gradient(135deg, #9932cc 0%, #ba55d3 50%, #da70d6 100%);
  border: 1px solid rgba(186, 85, 211, 0.4);
  border-radius: var(--radius-md);
  box-shadow:
    0 4px 15px rgba(153, 50, 204, 0.4),
    0 0 30px rgba(186, 85, 211, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  color: var(--text-inverse);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* Button glow effect */
.quick-setup-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.quick-setup-btn:hover::before {
  left: 100%;
}

.quick-setup-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 25px rgba(153, 50, 204, 0.5),
    0 0 40px rgba(186, 85, 211, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(218, 112, 214, 0.6);
}

.quick-setup-btn:active {
  transform: translateY(0);
  box-shadow:
    0 2px 10px rgba(153, 50, 204, 0.4),
    0 0 20px rgba(186, 85, 211, 0.3);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ===== Responsive Design ===== */
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

  .welcome-card {
    padding: var(--space-xl);
  }

  .peixuan-avatar-large {
    font-size: 48px;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .daily-question-view::before,
  .daily-question-view::after,
  .no-chart-notice::before {
    animation: none;
  }

  .peixuan-avatar-large,
  .title-icon {
    animation: none;
  }

  .quick-setup-btn:hover {
    transform: none;
  }
}
</style>
