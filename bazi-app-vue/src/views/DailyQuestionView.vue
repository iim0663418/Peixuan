<template>
  <div class="daily-question-fullscreen">
    <!-- 有命盤：顯示 DailyQuestionPanel -->
    <DailyQuestionPanel
      v-if="currentChartId"
      :chart-id="currentChartId"
      class="fullscreen-panel"
      @question-asked="handleQuestionAsked"
    />

    <!-- 無命盤：Glassmorphism 引導 -->
    <div v-else class="no-chart-container">
      <div class="welcome-card">
        <!-- 匿名狀態徽章 -->
        <div class="anonymous-badge">
          <Icon icon="lucide:shield" width="14" class="shield-icon" />
          <span>{{ $t('status.anonymous') }}</span>
        </div>

        <!-- 獨角獸圖標 + 閃光效果 -->
        <div class="icon-visual">
          <div class="glass-icon-container">
            <Icon
              icon="fluent-emoji-flat:unicorn"
              width="120"
              class="animate-float"
              role="img"
              :aria-label="$t('dailyQuestion.noChart.title')"
            />
          </div>
          <Icon
            icon="lucide:sparkles"
            class="sparkle sparkle-1 animate-twinkle"
            width="40"
            role="presentation"
          />
          <Icon
            icon="lucide:sparkles"
            class="sparkle sparkle-2 animate-twinkle"
            width="28"
            role="presentation"
          />
        </div>

        <!-- 文案 -->
        <h2 class="welcome-title">
          {{ $t('dailyQuestion.noChart.title') }}
        </h2>
        <p class="welcome-subtitle">
          {{ $t('dailyQuestion.noChart.subtitle') }}
        </p>
        <p class="welcome-description">
          {{ $t('dailyQuestion.noChart.description') }}
        </p>

        <!-- Premium 按鈕 -->
        <el-button
          type="primary"
          size="large"
          class="quick-setup-btn"
          @click="showQuickSetupModal = true"
        >
          {{ $t('dailyQuestion.noChart.quickSetupButton') }}
        </el-button>

        <!-- 背景裝飾獨角獸 -->
        <Icon
          icon="fluent-emoji-flat:unicorn"
          width="260"
          class="decoration-unicorn"
          role="presentation"
        />
      </div>

      <!-- Quick Setup Modal -->
      <el-dialog
        v-model="showQuickSetupModal"
        :title="$t('dailyQuestion.noChart.quickSetupTitle')"
        width="90%"
        :style="{ maxWidth: '600px' }"
        center
        append-to-body
        class="custom-dialog"
      >
        <QuickSetupForm @chart-created="handleChartCreated" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useChartStore } from '@/stores/chartStore';
import { Icon } from '@iconify/vue';
import DailyQuestionPanel from '@/components/DailyQuestionPanel.vue';
import QuickSetupForm from '@/components/QuickSetupForm.vue';

const chartStore = useChartStore();
const showQuickSetupModal = ref(false);

const currentChartId = computed(() => chartStore.currentChart?.chartId);

onMounted(() => {
  chartStore.loadFromLocalStorage();
});

const handleQuestionAsked = () => {
  // 問題已提問
};

const handleChartCreated = () => {
  showQuickSetupModal.value = false;
  chartStore.loadFromLocalStorage();
};
</script>

<style scoped>
/* ========== 全屏容器 ========== */
.daily-question-fullscreen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-panel {
  width: 100%;
  min-height: 100vh;
}

/* ========== 無命盤容器 ========== */
.no-chart-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);

  /* 增強版背景漸層 (from prototype) */
  background:
    radial-gradient(
      circle at top right,
      rgba(147, 112, 219, 0.3),
      transparent 45%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(210, 105, 30, 0.2),
      transparent 45%
    ),
    linear-gradient(135deg, #6d28d9 0%, var(--primary-color) 70%, #4a250a 100%);
}

/* ========== Glassmorphism 卡片 ========== */
.welcome-card {
  position: relative;
  max-width: 600px;
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-enhanced))
    saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur-enhanced))
    saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4xl);
  box-shadow:
    var(--shadow-glass-deep),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  text-align: center;
  overflow: hidden;
}

/* ========== 圖標視覺 ========== */
.icon-visual {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-3xl);
}

.glass-icon-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  display: inline-block;
  box-shadow: var(--shadow-glass);
  will-change: transform;
}

.sparkle {
  position: absolute;
  color: var(--peixuan-gold);
  pointer-events: none;
  will-change: opacity, transform;
}

.sparkle-1 {
  top: -1rem;
  right: -1rem;
}

.sparkle-2 {
  bottom: 0.5rem;
  left: -1.5rem;
  animation-delay: 2s;
}

/* ========== 文案 ========== */
.welcome-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  margin-bottom: var(--space-md);
  line-height: var(--line-height-tight);
}

.welcome-subtitle {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-lg);
  font-weight: var(--font-weight-medium);
}

.welcome-description {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-3xl);
}

/* ========== Premium 按鈕 ========== */
.quick-setup-btn {
  --el-button-bg-color: var(--peixuan-gold);
  --el-button-border-color: var(--peixuan-gold);
  --el-button-text-color: var(--primary-color);
  --el-button-hover-bg-color: var(--peixuan-gold);
  --el-button-hover-border-color: var(--peixuan-gold);

  font-weight: var(--font-weight-bold);
  padding: 1.25rem 4rem !important;
  border-radius: 2rem !important;
  font-size: var(--font-size-xl) !important;
  box-shadow: var(--shadow-premium);
  transition: all var(--transition-slow) var(--ease-bounce);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 56px;
}

.quick-setup-btn:hover {
  transform: scale(1.06) translateY(-3px);
  box-shadow: var(--shadow-premium-hover) !important;
}

.quick-setup-btn:active {
  transform: scale(0.98);
}

/* ========== 深色模式 ========== */
html.dark .welcome-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

html.dark .glass-icon-container {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ========== 匿名狀態徽章 ========== */
.anonymous-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-2xl);
}

.shield-icon {
  color: #4ade80;
}

/* ========== 背景裝飾 ========== */
.decoration-unicorn {
  position: absolute;
  bottom: -2.5rem;
  right: -2.5rem;
  opacity: 0.06;
  transform: rotate(-12deg);
  pointer-events: none;
  z-index: 0;
}

/* 確保內容在裝飾之上 */
.icon-visual,
.welcome-title,
.welcome-subtitle,
.welcome-description,
.quick-setup-btn,
.anonymous-badge {
  position: relative;
  z-index: 1;
}

/* ========== Modal 圓角統一 ========== */
:deep(.custom-dialog .el-dialog) {
  border-radius: 2.5rem !important;
  background: rgba(255, 255, 255, 0.98) !important;
}

/* ========== 響應式 ========== */
/* 桌面版更大 */
@media (min-width: 768px) {
  .welcome-title {
    font-size: 3rem; /* 48px */
  }
}

@media (max-width: 767px) {
  .no-chart-container {
    padding: var(--space-lg);
  }

  .welcome-card {
    padding: var(--space-2xl);
  }

  .glass-icon-container {
    padding: var(--space-lg);
  }

  .glass-icon-container :deep(svg) {
    width: 80px;
    height: 80px;
  }

  .sparkle-1 {
    width: 32px;
    height: 32px;
  }

  .sparkle-2 {
    width: 24px;
    height: 24px;
  }

  .welcome-title {
    font-size: var(--font-size-2xl);
  }

  .welcome-subtitle {
    font-size: var(--font-size-lg);
  }

  .welcome-description {
    font-size: var(--font-size-base);
  }

  .quick-setup-btn {
    width: 100%;
    padding: 1rem 2rem !important;
  }
}

/* ========== 無障礙 ========== */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-twinkle {
    animation: none;
  }

  .quick-setup-btn:hover {
    transform: none;
  }

  .glass-icon-container {
    will-change: auto;
  }

  .sparkle {
    will-change: auto;
  }
}
</style>
