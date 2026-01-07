<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DailyReminder } from '@/services/unifiedApiService';
import { getDailyReminder } from '@/services/unifiedApiService';

const { t, locale } = useI18n();

/**
 * DailyReminderCard Component
 *
 * 每日運勢提醒卡片組件
 * - API 調用 getDailyReminder()（固定今天，支援多語系）
 * - 顯示提醒文字（1-2 句）
 * - 顯示吉凶標籤
 * - 快取狀態提示
 * - Loading 狀態（el-skeleton）
 * - 錯誤處理（Fallback 文案）
 */

interface Props {
  chartId: string;
}

const props = defineProps<Props>();

// 狀態管理
const reminderText = ref<string>('');
const tags = ref<
  Array<{ label: string; type: 'success' | 'warning' | 'info' }>
>([]);
const loading = ref<boolean>(false);
const cached = ref<boolean>(false);
const error = ref<boolean>(false);

/**
 * 載入每日提醒（固定今天）
 */
const loadReminder = async () => {
  loading.value = true;
  error.value = false;

  try {
    const result: DailyReminder = await getDailyReminder(
      props.chartId,
      new Date(),
      locale.value,
    );
    reminderText.value = result.text;
    tags.value = result.tags;
    cached.value = result.cached;
  } catch (err) {
    console.error('Failed to load daily reminder:', err);
    error.value = true;
    // Fallback: 顯示通用吉祥話
    reminderText.value = t('dailyReminder.fallback_text');
    tags.value = [{ label: t('dailyReminder.fallback_tag'), type: 'info' }];
    cached.value = false;
  } finally {
    loading.value = false;
  }
};

// 組件掛載時載入今日提醒
onMounted(() => {
  loadReminder();
});
</script>

<template>
  <div class="daily-reminder-card">
    <!-- Loading 狀態 -->
    <div v-if="loading" class="reminder-content">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 提醒內容區域 -->
    <div v-else class="reminder-content">
      <!-- 快取狀態提示 -->
      <div v-if="cached" class="cache-badge">
        <span class="cache-icon">⚡</span>
        <span class="cache-text">{{ $t('dailyReminder.cache_hit') }}</span>
      </div>

      <!-- 提醒文字 -->
      <div class="reminder-text-section">
        <p class="reminder-text">{{ reminderText }}</p>
      </div>

      <!-- 吉凶標籤 -->
      <div v-if="tags.length > 0" class="tags-section">
        <el-tag
          v-for="(tag, index) in tags"
          :key="index"
          :type="tag.type"
          effect="light"
          size="large"
          round
          class="reminder-tag"
        >
          {{ tag.label }}
        </el-tag>
      </div>

      <!-- 錯誤提示（僅當發生錯誤時顯示） -->
      <div v-if="error" class="error-notice">
        <span class="error-icon">ℹ️</span>
        <span class="error-text">{{ $t('dailyReminder.error_notice') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 主容器 ===== */
.daily-reminder-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.daily-reminder-card:hover {
  box-shadow: var(--shadow-md);
}

/* ===== 提醒內容區域 ===== */
.reminder-content {
  position: relative;
}

/* 快取狀態提示 */
.cache-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: var(--success-lightest);
  border: 1px solid var(--success-lighter);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-md);
  font-size: var(--font-size-xs);
}

.cache-icon {
  font-size: var(--font-size-sm);
}

.cache-text {
  color: var(--success);
  font-weight: var(--font-weight-medium);
}

/* 提醒文字 */
.reminder-text-section {
  margin-bottom: var(--space-lg);
}

.reminder-text {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin: 0;
  padding: var(--space-lg);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

/* 標籤區域 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.reminder-tag {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--space-xs) var(--space-md);
}

/* 錯誤提示 */
.error-notice {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--info-lightest);
  border: 1px solid var(--info-lighter);
  border-radius: var(--radius-sm);
  margin-top: var(--space-md);
}

.error-icon {
  font-size: var(--font-size-lg);
}

.error-text {
  font-size: var(--font-size-sm);
  color: var(--info);
  font-weight: var(--font-weight-medium);
}

/* ===== 響應式設計 ===== */
@media (max-width: 767px) {
  .daily-reminder-card {
    padding: var(--space-lg);
  }

  .reminder-text {
    font-size: var(--font-size-base);
    padding: var(--space-md);
  }

  .tags-section {
    flex-direction: column;
  }

  .reminder-tag {
    width: fit-content;
  }
}

/* 無障礙: 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .daily-reminder-card * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
