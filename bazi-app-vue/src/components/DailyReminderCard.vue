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
const tags = ref<Array<{ label: string; type: 'success' | 'warning' | 'info' }>>([]);
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
    const result: DailyReminder = await getDailyReminder(props.chartId, new Date(), locale.value);
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
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-light, #e9ecef);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-2xl, 24px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.08));
  transition: var(--transition-normal, 0.25s ease-out);
}

.daily-reminder-card:hover {
  box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.12));
}

/* ===== 提醒內容區域 ===== */
.reminder-content {
  position: relative;
}

/* 快取狀態提示 */
.cache-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs, 4px);
  padding: var(--space-xs, 4px) var(--space-md, 12px);
  background: var(--success-lightest, #f1f8e9);
  border: 1px solid var(--success-lighter, #c8e6c9);
  border-radius: var(--radius-full, 9999px);
  margin-bottom: var(--space-md, 12px);
  font-size: var(--font-size-xs, 0.75rem);
}

.cache-icon {
  font-size: var(--font-size-sm, 0.875rem);
}

.cache-text {
  color: var(--success, #28a745);
  font-weight: var(--font-weight-medium, 500);
}

/* 提醒文字 */
.reminder-text-section {
  margin-bottom: var(--space-lg, 16px);
}

.reminder-text {
  font-size: var(--font-size-lg, 1.125rem);
  line-height: var(--line-height-relaxed, 1.75);
  color: var(--text-primary, #2c3e50);
  margin: 0;
  padding: var(--space-lg, 16px);
  background: var(--bg-primary, #f7f8fa);
  border-radius: var(--radius-md, 12px);
  border-left: 4px solid var(--primary-color, #d2691e);
}

/* 標籤區域 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-md, 12px);
}

.reminder-tag {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  padding: var(--space-xs, 4px) var(--space-md, 12px);
}

/* 錯誤提示 */
.error-notice {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 12px);
  background: var(--info-lightest, #e0f2f1);
  border: 1px solid var(--info-lighter, #b2ebf2);
  border-radius: var(--radius-sm, 8px);
  margin-top: var(--space-md, 12px);
}

.error-icon {
  font-size: var(--font-size-lg, 1.125rem);
}

.error-text {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--info, #17a2b8);
  font-weight: var(--font-weight-medium, 500);
}

/* ===== 響應式設計 ===== */
@media (max-width: 767px) {
  .daily-reminder-card {
    padding: var(--space-lg, 16px);
  }

  .reminder-text {
    font-size: var(--font-size-base, 1rem);
    padding: var(--space-md, 12px);
  }

  .tags-section {
    flex-direction: column;
  }

  .reminder-tag {
    width: fit-content;
  }
}
</style>
