<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { marked } from 'marked';

// Configure marked renderer once for the application when the module is loaded
marked.use({
  renderer: {
    strong({ text }: { text: string }) {
      // Regex to match "星曜名稱(brightness)" and capture the name and brightness
      // Comprehensive list of brightness values for Ziwei Dou Shu
      const match = text.match(
        /(.*)\((廟|旺|得地|利|平|不得地|陷|衰|病|死|墓|絕|胎|養)\)/,
      );
      if (match && match.length === 3) {
        const starName = match[1];
        const brightness = match[2];
        // Return custom HTML with data-brightness attribute
        return `<strong class="star-brightness" data-brightness="${brightness}">${starName}</strong>`;
      }
      // If it doesn't match the pattern, render as a normal strong tag
      return `<strong>${text}</strong>`;
    },
  },
});

const router = useRouter();
const route = useRoute();
const chartStore = useChartStore();
const { t, locale } = useI18n();

// 分析類型：personality 或 fortune
const analysisType = computed(() => route.name as 'personality' | 'fortune');

// 動態國際化鍵前綴
const i18nPrefix = computed(() => analysisType.value);

const analysisText = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const progress = ref(0);
const loadingMessage = ref('');
const loadingHint = ref('');

let eventSource: EventSource | null = null;

// Function to stop the current streaming connection
const stopStreaming = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('[SSE] Stream closed manually');
  }
};

// 動態 API 端點
const getApiEndpoints = () => {
  const base =
    analysisType.value === 'personality' ? 'analyze' : 'analyze/advanced';
  return {
    stream: `/api/v1/${base}/stream`,
    check: `/api/v1/${base}/check`,
  };
};

const renderMarkdown = (text: string): string => {
  return marked(text) as string;
};

const checkCache = async (chartId: string): Promise<boolean> => {
  try {
    const endpoints = getApiEndpoints();
    const { check } = endpoints;
    const response = await fetch(
      `${check}?chartId=${chartId}&locale=${locale.value}`,
    );
    const data = await response.json();
    const { cached } = data;
    return cached || false;
  } catch (err) {
    console.error('[checkCache] Error:', err);
    return false;
  }
};

const startStreaming = async () => {
  stopStreaming(); // Ensure any previous stream is closed

  analysisText.value = ''; // Clear previous content
  error.value = null; // Clear previous errors
  isLoading.value = true; // Set loading state
  progress.value = 0; // Reset progress

  const { chartId } = chartStore;

  if (!chartId) {
    error.value = t(`${i18nPrefix.value}.error_no_chart`);
    isLoading.value = false;
    return;
  }

  // Check cache first
  const hasCached = await checkCache(chartId);
  loadingMessage.value = hasCached
    ? t(`${i18nPrefix.value}.loading_cached`)
    : t(`${i18nPrefix.value}.loading_message`);
  loadingHint.value = hasCached
    ? t(`${i18nPrefix.value}.loading_hint_cached`)
    : t(`${i18nPrefix.value}.loading_hint`);

  // Use absolute URL for EventSource
  const { origin } = window.location;
  const endpoints = getApiEndpoints();
  const { stream } = endpoints;
  const apiUrl = `${origin}${stream}?chartId=${chartId}&locale=${locale.value}`;

  eventSource = new EventSource(apiUrl);

  eventSource.onopen = () => {
    console.log('[SSE] Connection opened');
  };

  eventSource.onmessage = (event) => {
    try {
      const { data: eventData } = event;
      // Check for [DONE] signal first
      if (eventData === '[DONE]') {
        console.log('[SSE] Stream completed');
        progress.value = 100;
        isLoading.value = false;
        eventSource?.close();
        return;
      }

      const data = JSON.parse(eventData);

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
      error.value = t(`${i18nPrefix.value}.error_parse`);
      isLoading.value = false;
      eventSource?.close();
    }
  };

  eventSource.onerror = (event) => {
    console.error('[SSE] Connection error:', event);
    error.value = t(`${i18nPrefix.value}.error_connection`);
    isLoading.value = false;
    eventSource?.close();
  };
};

const goBack = () => {
  router.push('/unified');
};

// Watch for analysisType changes to restart the stream
watch(
  analysisType,
  async (newType, oldType) => {
    if (newType && newType !== oldType) {
      console.log(
        `[AnalysisView] Analysis type changed from "${oldType}" to "${newType}". Restarting stream.`,
      );
      await startStreaming();
    }
  },
  { immediate: true },
); // immediate: true to run on initial component mount

onMounted(() => {
  // startStreaming is now handled by the immediate watcher, so this can be empty
  // or used for other non-streaming related on-mount setup.
});

onUnmounted(() => {
  stopStreaming(); // Ensure stream is closed when component is unmounted
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
        <h1 class="title">
          {{ $t(`navigation.${analysisType}`) }}
        </h1>
        <p class="subtitle">
          {{ $t(`${i18nPrefix}.subtitle`) }}
        </p>
      </div>

      <!-- 重新計算提醒橫幅 -->
      <div class="recalc-notice">
        {{ $t(`${i18nPrefix}.recalc_notice`) }}
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading">
        <div class="spinner" />
        <p class="loading-text">
          {{ loadingMessage }}
        </p>
        <p class="loading-hint">
          {{ loadingHint }}
        </p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error">
        <div class="error-icon">💫</div>
        <h3>{{ $t(`${i18nPrefix}.error_no_chart_title`) }}</h3>
        <p class="error-message">
          {{ error }}
        </p>
        <button class="retry-btn" @click="goBack">
          {{ $t(`${i18nPrefix}.btn_go_calculate`) }}
        </button>
      </div>

      <!-- 分析內容 -->
      <div v-else class="analysis-content">
        <!-- 進度條 -->
        <div v-if="progress < 100" class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>

        <!-- Markdown 渲染 -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="markdown-body" v-html="renderMarkdown(analysisText)" />

        <!-- 打字機效果游標 -->
        <span v-if="progress < 100" class="cursor">▋</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-analysis-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--space-3xl) var(--space-lg);
}
.container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-3xl);
}
.header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}
.back-btn {
  position: absolute;
  left: var(--space-lg);
  top: var(--space-lg);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}
.subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}
.recalc-notice {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: 2px solid #f59e0b;
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-xl);
  text-align: center;
  font-weight: 500;
  color: #92400e;
}
.loading {
  text-align: center;
  padding: var(--space-3xl);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-tertiary);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-lg);
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}
.loading-hint {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}
.error {
  text-align: center;
  padding: var(--space-3xl);
}
.error-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
}
.error h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}
.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}
.retry-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}
.retry-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
.analysis-content {
  position: relative;
}
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-xl);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}
.markdown-body {
  line-height: 1.8;
  color: var(--text-primary);
}
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: var(--text-primary);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-md);
}
.markdown-body :deep(p) {
  margin-bottom: var(--space-md);
}
.markdown-body :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.markdown-body :deep(strong.star-brightness) {
  font-weight: 700;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Specific gradient styles based on data-brightness */
.markdown-body :deep(strong.star-brightness[data-brightness='廟']) {
  background-image: linear-gradient(45deg, #ffd700, #ffa500);
}
.markdown-body :deep(strong.star-brightness[data-brightness='旺']) {
  background-image: linear-gradient(45deg, #00ff00, #008000);
}
.markdown-body :deep(strong.star-brightness[data-brightness='得地']) {
  background-image: linear-gradient(45deg, #87ceeb, #4682b4);
}
.markdown-body :deep(strong.star-brightness[data-brightness='利']) {
  background-image: linear-gradient(45deg, #ff69b4, #c71585);
}
.markdown-body :deep(strong.star-brightness[data-brightness='平']) {
  background-image: linear-gradient(45deg, #d3d3d3, #a9a9a9);
}
.markdown-body :deep(strong.star-brightness[data-brightness='不得地']) {
  background-image: linear-gradient(45deg, #ff4500, #b22222);
}
.markdown-body :deep(strong.star-brightness[data-brightness='陷']) {
  background-image: linear-gradient(45deg, #800000, #400000);
}
.markdown-body :deep(strong.star-brightness[data-brightness='衰']) {
  background-image: linear-gradient(45deg, #708090, #2f4f4f);
}
.markdown-body :deep(strong.star-brightness[data-brightness='病']) {
  background-image: linear-gradient(45deg, #9932cc, #4b0082);
}
.markdown-body :deep(strong.star-brightness[data-brightness='死']) {
  background-image: linear-gradient(45deg, #000000, #36454f);
}
.markdown-body :deep(strong.star-brightness[data-brightness='墓']) {
  background-image: linear-gradient(45deg, #a52a2a, #8b0000);
}
.markdown-body :deep(strong.star-brightness[data-brightness='絕']) {
  background-image: linear-gradient(45deg, #483d8b, #191970);
}
.markdown-body :deep(strong.star-brightness[data-brightness='胎']) {
  background-image: linear-gradient(45deg, #daa520, #b8860b);
}
.markdown-body :deep(strong.star-brightness[data-brightness='養']) {
  background-image: linear-gradient(45deg, #20b2aa, #008b8b);
}

.cursor {
  color: var(--primary);
  animation: blink 1s infinite;
  font-weight: bold;
}
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
@media (max-width: 768px) {
  .ai-analysis-view {
    padding: var(--space-lg) var(--space-md);
  }
  .container {
    padding: var(--space-xl);
  }
  .back-btn {
    position: static;
    margin-bottom: var(--space-md);
  }
  .title {
    font-size: var(--font-size-2xl);
  }
}
</style>
