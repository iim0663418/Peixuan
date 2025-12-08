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
const loadingMessage = ref(t('fortune.loading_message'));
const loadingHint = ref(t('fortune.loading_hint'));

let eventSource: EventSource | null = null;

const renderMarkdown = (text: string): string => {
  return marked(text) as string;
};

const checkCache = async (chartId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/v1/analyze/advanced/check?chartId=${chartId}&locale=${locale.value}`,
    );
    const data = await response.json();
    return data.cached || false;
  } catch (err) {
    console.error('[checkCache] Error:', err);
    return false;
  }
};

const startStreaming = async () => {
  const chartId = chartStore.chartId;

  if (!chartId) {
    error.value = t('fortune.error_no_chart');
    isLoading.value = false;
    return;
  }

  // Check cache first
  const hasCached = await checkCache(chartId);
  loadingMessage.value = hasCached
    ? t('fortune.loading_cached')
    : t('fortune.loading_message');
  loadingHint.value = hasCached
    ? t('fortune.loading_hint_cached')
    : t('fortune.loading_hint');

  // Use absolute URL for EventSource (relative URLs may not work in all browsers)
  const baseUrl = window.location.origin;
  const apiUrl = `${baseUrl}/api/v1/analyze/advanced/stream?chartId=${chartId}&locale=${locale.value}`;

  eventSource = new EventSource(apiUrl);

  eventSource.onopen = () => {
    console.log('[SSE] Connection opened');
    isLoading.value = false;
  };

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource?.close();
      progress.value = 100;
      return;
    }

    try {
      const data = JSON.parse(event.data);
      
      // Handle error from backend
      if (data.error) {
        console.error('[SSE] Backend error:', data.error);
        error.value = data.error;
        isLoading.value = false;
        eventSource?.close();
        return;
      }
      
      if (data.text) {
        analysisText.value += data.text;

        // 更新進度(估算)
        const estimatedTotal = 2000; // 預估總字數
        progress.value = Math.min(
          95,
          (analysisText.value.length / estimatedTotal) * 100,
        );
      }
    } catch (err) {
      console.error('[SSE] Parse error:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.error('[SSE] Error:', err);
    error.value = t('fortune.error_connection');
    isLoading.value = false;
    eventSource?.close();
  };
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(analysisText.value);
    alert(t('fortune.copy_success'));
  } catch (err) {
    console.error(t('fortune.copy_failed'), err);
  }
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Restore chartId from localStorage if currentChart is null
  chartStore.loadFromLocalStorage();
  startStreaming();
});

onUnmounted(() => {
  eventSource?.close();
});
</script>

<template>
  <div class="ai-analysis-view">
    <div class="container">
      <div class="header">
        <button class="back-btn" @click="goBack">{{ $t('fortune.btn_back') }}</button>
        <h1>{{ $t('fortune.title') }}</h1>
        <p class="subtitle">{{ $t('fortune.subtitle') }}</p>
        <div class="actions">
          <button
            v-if="!isLoading && !error"
            class="copy-btn"
            @click="copyToClipboard"
          >
            {{ $t('fortune.btn_copy') }}
          </button>
        </div>
      </div>

      <!-- 重新計算提醒橫幅 -->
      <div class="recalc-notice">
        {{ $t('fortune.recalc_notice') }}
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
        <h3>{{ $t('fortune.error_no_chart_title') }}</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="goBack">{{ $t('fortune.btn_go_calculate') }}</button>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3xl);
  padding-bottom: var(--space-lg);
  border-bottom: 2px solid var(--bg-tertiary);
}

.header h1 {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin: 0;
  font-weight: var(--font-weight-bold);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: var(--space-xs) 0 0 0;
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.recalc-notice {
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border: 1px solid #ffd700;
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-2xl);
  text-align: center;
  color: #8b7500;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.15);
}

.back-btn,
.copy-btn {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: var(--font-weight-medium);
}

.back-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.back-btn:hover {
  background: var(--border-medium);
  transform: translateY(-1px);
}

.copy-btn {
  background: #667eea;
  color: var(--text-inverse);
}

.copy-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: var(--space-5xl) var(--space-3xl);
}

.loading-text {
  font-size: var(--font-size-xl);
  color: #667eea;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
}

.loading-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-tertiary);
  border-top: 4px solid #667eea;
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

.error {
  text-align: center;
  padding: var(--space-5xl) var(--space-3xl);
}

.error-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-lg);
}

.error h3 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-lg);
  font-weight: var(--font-weight-semibold);
}

.error-message {
  color: var(--error);
  font-size: var(--font-size-base);
  margin-bottom: var(--space-3xl);
}

.retry-btn {
  margin-top: var(--space-lg);
  padding: var(--space-md) var(--space-2xl);
  background: #667eea;
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.retry-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: var(--shadow-purple);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.analysis-content {
  position: relative;
  line-height: 1.8;
  color: #333;
}

.markdown-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  padding: var(--space-2xl);
  background: var(--gradient-bg-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Emoji 優化 */
.markdown-body :deep(p),
.markdown-body :deep(li) {
  font-size: var(--font-size-lg);
}

.markdown-body :deep(p:has(img[alt*='emoji'])),
.markdown-body :deep(span:has(img[alt*='emoji'])) {
  font-size: 1.2em;
}

/* 通用 emoji 字符優化 */
.markdown-body :deep(*) {
  font-variant-emoji: emoji;
}

.markdown-body :deep(h2) {
  color: #667eea;
  margin-top: var(--space-3xl);
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  text-shadow: var(--text-shadow-sm);
}

.markdown-body :deep(h3) {
  color: #764ba2;
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  text-shadow: var(--text-shadow-sm);
}

.markdown-body :deep(p) {
  margin-bottom: var(--space-lg);
  line-height: var(--line-height-loose);
}

.markdown-body :deep(strong) {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: var(--font-weight-bold);
  text-shadow: var(--text-shadow-md);
  padding: 0 0.1em;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-body :deep(code) {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
  color: #667eea;
  font-weight: bold;
  margin-left: 2px;
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
    padding: 1rem 0.5rem;
  }

  .container {
    padding: 1rem;
  }

  .header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header h1 {
    font-size: 1.4rem;
    flex: 1 1 100%;
    text-align: center;
  }

  .back-btn,
  .copy-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .markdown-body :deep(h2) {
    font-size: 1.3rem;
  }

  .markdown-body :deep(h3) {
    font-size: 1.1rem;
  }
}
</style>
