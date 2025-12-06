<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { DailyReminder } from '@/services/unifiedApiService';
import { getDailyReminder } from '@/services/unifiedApiService';

/**
 * DailyReminderCard Component
 *
 * 每日運勢提醒卡片組件
 * - 日期選擇器（預設今天）
 * - API 調用 getDailyReminder()
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
const selectedDate = ref<Date>(new Date());
const reminderText = ref<string>('');
const tags = ref<Array<{ label: string; type: 'success' | 'warning' | 'info' }>>([]);
const loading = ref<boolean>(false);
const cached = ref<boolean>(false);
const error = ref<boolean>(false);

/**
 * 載入每日提醒
 */
const loadReminder = async () => {
  loading.value = true;
  error.value = false;

  try {
    const result: DailyReminder = await getDailyReminder(props.chartId, selectedDate.value);
    reminderText.value = result.text;
    tags.value = result.tags;
    cached.value = result.cached;
  } catch (err) {
    console.error('Failed to load daily reminder:', err);
    error.value = true;
    // Fallback: 顯示通用吉祥話
    reminderText.value = '今日平安順遂,保持平常心 ✨';
    tags.value = [{ label: '平安', type: 'info' }];
    cached.value = false;
  } finally {
    loading.value = false;
  }
};

// 監聽日期變化，自動載入提醒
watch(selectedDate, () => {
  loadReminder();
});

// 組件掛載時載入今日提醒
onMounted(() => {
  loadReminder();
});
</script>

<template>
  <div class="daily-reminder-card">
    <!-- 日期選擇器區域 -->
    <div class="date-selector-section">
      <div class="date-label">
        <span class="label-icon">📅</span>
        <span class="label-text">選擇日期</span>
      </div>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="請選擇日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="date-picker"
        :clearable="false"
        :disabled="loading"
      />
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading" class="reminder-content">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 提醒內容區域 -->
    <div v-else class="reminder-content">
      <!-- 快取狀態提示 -->
      <div v-if="cached" class="cache-badge">
        <span class="cache-icon">⚡</span>
        <span class="cache-text">快取命中</span>
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
        <span class="error-text">暫時無法取得運勢資料,顯示通用提醒</span>
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

/* ===== 日期選擇器區域 ===== */
.date-selector-section {
  margin-bottom: var(--space-xl, 20px);
  padding-bottom: var(--space-lg, 16px);
  border-bottom: 1px solid var(--border-light, #e9ecef);
}

.date-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  margin-bottom: var(--space-md, 12px);
}

.label-icon {
  font-size: var(--font-size-xl, 1.25rem);
}

.label-text {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #2c3e50);
}

.date-picker {
  width: 100%;
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

  .label-text {
    font-size: var(--font-size-base, 1rem);
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
