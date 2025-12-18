<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { marked } from 'marked';

const router = useRouter();
const chartStore = useChartStore();
const { t, locale } = useI18n();

const analysisText = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const progress = ref(0);
const loadingMessage = ref(t('personality.loading_message'));
const loadingHint = ref(t('personality.loading_hint'));

let eventSource: EventSource | null = null;

const renderMarkdown = (text: string): string => {
  return marked(text) as string;
};

const checkCache = async (chartId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/v1/analyze/check?chartId=${chartId}&locale=${locale.value}`,
    );
    const data = await response.json();
    return data.cached || false;
  } catch (err) {
    console.error('[checkCache] Error:', err);
    return false;
  }
};

const startStreaming = async () => {
  const { chartId } = chartStore;

  if (!chartId) {
    error.value = t('personality.error_no_chart');
    isLoading.value = false;
    return;
  }

  // Check cache first
  const hasCached = await checkCache(chartId);
  loadingMessage.value = hasCached
    ? t('personality.loading_cached')
    : t('personality.loading_message');
  loadingHint.value = hasCached
    ? t('personality.loading_hint_cached')
    : t('personality.loading_hint');

  // Use absolute URL for EventSource (relative URLs may not work in all browsers)
  const baseUrl = window.location.origin;
  const apiUrl = `${baseUrl}/api/v1/analyze/stream?chartId=${chartId}&locale=${locale.value}`;

  eventSource = new EventSource(apiUrl);

  eventSource.onopen = () => {
    console.log('[SSE] Connection opened');
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.error) {
        console.error('[SSE] Backend error:', data.error);
        error.value = data.error;
        isLoading.value = false;
        eventSource?.close();
        return;
      }

      if (data.text) {
        analysisText.value += data.text;
        progress.value = Math.min(progress.value + 2, 95);
      }
    } catch (err) {
      console.error('[SSE] Parse error:', err);
      error.value = t('personality.error_parse');
      isLoading.value = false;
      eventSource?.close();
    }
  };

  eventSource.onerror = (event) => {
    console.error('[SSE] Connection error:', event);
    error.value = t('personality.error_connection');
    isLoading.value = false;
    eventSource?.close();
  };

  // Handle stream completion
  eventSource.addEventListener('message', (event) => {
    if (event.data === '[DONE]') {
      console.log('[SSE] Stream completed');
      progress.value = 100;
      isLoading.value = false;
      eventSource?.close();
    }
  });
};

const goBack = () => {
  router.push('/unified');
};

onMounted(() => {
  startStreaming();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<template>
  <div class="ai-analysis-view">
    <div class="container">
      <!-- 標題區域 -->
      <div class="header">
        <button class="back-btn" @click="goBack">
          ← {{ $t('common.back') }}
        </button>
        <h1 class="title">{{ $t('navigation.personality') }}</h1>
        <p class="subtitle">{{ $t('personality.subtitle') }}</p>
      </div>

      <!-- 重新計算提醒橫幅 -->
      <div class="recalc-notice">
        {{ $t('personality.recalc_notice') }}
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading">
        <div class="spinner" />
        <p class="loading-text">{{ loadingMessage }}</p>
        <p class="loading-hint">{{ loadingHint }}</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error">
        <div class="error-icon">💫</div>
        <h3>{{ $t('personality.error_no_chart_title') }}</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="goBack">
          {{ $t('personality.btn_go_calculate') }}
        </button>
      </div>

      <!-- 分析內容 -->
      <div v-else class="analysis-content">
        <!-- 進度條 -->
        <div v-if="progress < 100" class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>

        <!-- Markdown 渲染 -->
        <div class="markdown-body" v-html="renderMarkdown(analysisText)" />

        <!-- 打字機效果游標 -->
        <span v-if="progress < 100" class="cursor">▋</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Legacy styles preserved */
</style>
