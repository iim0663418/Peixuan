<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import { marked } from 'marked';

const router = useRouter();
const chartStore = useChartStore();

const analysisText = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const progress = ref(0);

let eventSource: EventSource | null = null;

const renderMarkdown = (text: string): string => {
  return marked(text) as string;
};

const startStreaming = () => {
  const { chartId } = chartStore;

  if (!chartId) {
    error.value = '找不到命盤數據,請先進行計算';
    isLoading.value = false;
    return;
  }

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/analyze/stream?chartId=${chartId}`;

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
    error.value = '連接中斷,請重試';
    isLoading.value = false;
    eventSource?.close();
  };
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(analysisText.value);
    alert('已複製到剪貼簿');
  } catch (err) {
    console.error('複製失敗:', err);
  }
};

const goBack = () => {
  router.push('/unified');
};

onMounted(() => {
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
        <button class="back-btn" @click="goBack">← 返回</button>
        <h1>🤖 佩璇 AI 分析</h1>
        <div class="actions">
          <button
            v-if="!isLoading && !error"
            class="copy-btn"
            @click="copyToClipboard"
          >
            📋 複製
          </button>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading">
        <div class="spinner" />
        <p>佩璇正在分析你的命盤...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="goBack">返回重試</button>
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
  padding: 2rem 1rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.header h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.back-btn,
.copy-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn {
  background: #f0f0f0;
  color: #666;
}

.back-btn:hover {
  background: #e0e0e0;
}

.copy-btn {
  background: #667eea;
  color: white;
}

.copy-btn:hover {
  background: #5568d3;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
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
  padding: 4rem 2rem;
  color: #e74c3c;
}

.error button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error button:hover {
  background: #5568d3;
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
  font-size: 1rem;
}

.markdown-body :deep(h2) {
  color: #667eea;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.markdown-body :deep(h3) {
  color: #764ba2;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin-bottom: 1rem;
}

.markdown-body :deep(strong) {
  color: #667eea;
  font-weight: 600;
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
