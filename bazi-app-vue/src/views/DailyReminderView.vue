<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import DailyReminderCard from '@/components/DailyReminderCard.vue';

const router = useRouter();
const chartStore = useChartStore();

// 檢測是否有命盤
const currentChartId = computed(() => chartStore.currentChart?.chartId);

// 導航到計算命盤頁面
const goToCalculate = () => {
  router.push('/unified');
};
</script>

<template>
  <div class="daily-reminder-view">
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">每日運勢提醒</h1>
        <p class="view-subtitle">輕量化每日吉凶提示,快速掌握今日運勢</p>
      </div>

      <!-- 有命盤時顯示提醒卡片 -->
      <div v-if="currentChartId" class="reminder-container">
        <DailyReminderCard :chart-id="currentChartId" />
      </div>

      <!-- 無命盤時顯示引導 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">尚未建立命盤</h3>
        <p class="empty-desc">
          您需要先計算命盤,才能使用每日運勢提醒功能
        </p>
        <button class="empty-btn" @click="goToCalculate">
          前往計算命盤
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-reminder-view {
  min-height: calc(100vh - 200px);
  background: var(--bg-primary, #f7f8fa);
  padding: var(--space-xl, 2rem) var(--space-md, 1rem);
}

.view-container {
  max-width: 900px;
  margin: 0 auto;
}

/* View Header */
.view-header {
  text-align: center;
  margin-bottom: var(--space-2xl, 3rem);
}

.view-title {
  font-size: var(--font-size-3xl, 2rem);
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 0 0 var(--space-md, 1rem) 0;
}

.view-subtitle {
  font-size: var(--font-size-md, 1rem);
  color: var(--text-secondary, #606266);
  margin: 0;
  line-height: 1.6;
}

/* Reminder Container */
.reminder-container {
  margin-top: var(--space-xl, 2rem);
}

/* Empty State */
.empty-state {
  background: var(--bg-card, #ffffff);
  border: 1px solid #e4e7ed;
  border-radius: var(--radius-lg, 1rem);
  padding: var(--space-3xl, 4rem) var(--space-xl, 2rem);
  text-align: center;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: var(--space-lg, 1.5rem);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 var(--space-md, 1rem) 0;
}

.empty-desc {
  font-size: var(--font-size-md, 1rem);
  color: var(--text-secondary, #606266);
  margin: 0 0 var(--space-xl, 2rem) 0;
  line-height: 1.6;
}

.empty-btn {
  background: linear-gradient(135deg, #d2691e, #ff8c00);
  color: white;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  padding: var(--space-md, 1rem) var(--space-xl, 2rem);
  font-size: var(--font-size-md, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
}

.empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(210, 105, 30, 0.4);
}

/* 響應式設計 */
@media (max-width: 767px) {
  .daily-reminder-view {
    padding: var(--space-lg, 1.5rem) var(--space-md, 1rem);
  }

  .view-title {
    font-size: var(--font-size-2xl, 1.5rem);
  }

  .empty-state {
    padding: var(--space-xl, 2rem) var(--space-md, 1rem);
  }

}
</style>
