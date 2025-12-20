<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { marked } from 'marked';
import { setupKeywordHighlighting } from '@/utils/keywordHighlighting';
import QuickSetupForm from '@/components/QuickSetupForm.vue';
import './UnifiedAIAnalysisView.css';

// Configure marked renderer once for the application when the module is loaded
setupKeywordHighlighting();

// Phase 3: Intersection Observer for scroll-triggered animations
// eslint-disable-next-line no-undef
let intersectionObserver: IntersectionObserver | null = null;

const router = useRouter();
const route = useRoute();
const chartStore = useChartStore();
const { t, locale } = useI18n();

// 分析類型：personality 或 fortune
const analysisType = computed(() => route.name as 'personality' | 'fortune');

// 動態國際化鍵前綴
const i18nPrefix = computed(() => analysisType.value);

const analysisText = ref('');
const displayedText = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const progress = ref(0);
const loadingMessage = ref('');
const loadingHint = ref('');

let eventSource: EventSource | null = null;
let typewriterQueue: string[] = [];
let isTyping = false;

// Typewriter effect with punctuation-aware pacing
const typewriterEffect = async () => {
  if (isTyping || typewriterQueue.length === 0) {
    return;
  }

  isTyping = true;

  while (typewriterQueue.length > 0) {
    const char = typewriterQueue.shift();
    if (!char) {
      break;
    }
    displayedText.value += char;

    // Dynamic delay based on punctuation
    let delay = 30; // Base typing speed (30ms per character)

    if (char === '，' || char === ',') {
      delay = 200; // Short pause for commas
    } else if (char === '。' || char === '.') {
      delay = 400; // Medium pause for periods
    } else if (char === '\n') {
      delay = 800; // Significant pause for paragraph breaks
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  isTyping = false;
};

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
  displayedText.value = ''; // Clear displayed text
  typewriterQueue = []; // Clear typewriter queue
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
        // Add new characters to typewriter queue
        const chars = data.text.split('');
        typewriterQueue.push(...chars);
        // Start typewriter effect if not already running
        if (!isTyping) {
          typewriterEffect();
        }
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

const showQuickSetupModal = ref(false);

const goBack = () => {
  router.push({ name: 'unified' });
};

const openQuickSetup = () => {
  showQuickSetupModal.value = true;
};

const handleChartCreated = () => {
  showQuickSetupModal.value = false;
  chartStore.loadFromLocalStorage();
  // Restart streaming with new chart
  if (chartStore.chartId) {
    startStreaming();
  }
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

// Phase 3: Setup Intersection Observer for scroll-triggered animations
const setupScrollAnimations = () => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (prefersReducedMotion) {
    return; // Skip animations if user prefers reduced motion
  }

  // Create Intersection Observer
  // eslint-disable-next-line no-undef
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
    },
  );

  // Observe all elements that should animate on scroll
  const observeElements = () => {
    const markdownBody = document.querySelector('.markdown-body');
    if (!markdownBody) {
      return;
    }

    // Add scroll-reveal class to elements
    const revealElements = markdownBody.querySelectorAll(
      'h2, h3, table, blockquote, pre',
    );
    revealElements.forEach((el) => {
      el.classList.add('scroll-reveal');
      intersectionObserver?.observe(el);
    });
  };

  // Wait for content to be rendered, then observe
  nextTick(() => {
    observeElements();
  });
};

// Watch for displayedText changes to setup animations for new content
watch(displayedText, () => {
  if (displayedText.value) {
    nextTick(() => {
      setupScrollAnimations();
    });
  }
});

onMounted(() => {
  // startStreaming is now handled by the immediate watcher, so this can be empty
  // or used for other non-streaming related on-mount setup.
  setupScrollAnimations();
});

onUnmounted(() => {
  stopStreaming(); // Ensure stream is closed when component is unmounted

  // Phase 3: Cleanup Intersection Observer
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
});
</script>

<template>
  <div class="ai-analysis-view">
    <!-- Phase 2: Atmospheric Background Effects -->
    <div class="atmospheric-bg" aria-hidden="true">
      <div class="floating-orb orb-1" />
      <div class="floating-orb orb-2" />
      <div class="floating-orb orb-3" />
    </div>
    <div class="container">
      <!-- 標題區域 -->
      <div class="header">
        <button class="back-btn" @click="goBack">
          {{ $t(`${i18nPrefix}.btn_back`) }}
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
        <div class="error-actions">
          <button class="quick-setup-btn" @click="openQuickSetup">
            {{ $t('dailyQuestion.noChart.quickSetupButton') }}
          </button>
          <button class="retry-btn secondary" @click="goBack">
            {{ $t(`${i18nPrefix}.btn_go_calculate`) }}
          </button>
        </div>
      </div>

      <!-- 分析內容 -->
      <div v-else class="analysis-content">
        <!-- 進度條 -->
        <div v-if="progress < 100" class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>

        <!-- Markdown 渲染 -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="markdown-body" v-html="renderMarkdown(displayedText)" />

        <!-- 打字機效果游標 -->
        <span v-if="progress < 100" class="cursor">▋</span>
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

<style src="./UnifiedAIAnalysisView.css" scoped></style>
