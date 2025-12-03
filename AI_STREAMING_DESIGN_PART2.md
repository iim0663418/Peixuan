# AI Streaming 深度規劃文檔 - Part 2

## 📱 Phase 2C: 前端狀態管理

### chartStore (Pinia)
```typescript
// bazi-app-vue/src/stores/chartStore.ts

import { defineStore } from 'pinia';
import type { CalculationResult } from '@/types/calculation';

export interface ChartMetadata {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  longitude: number;
}

export interface ChartData {
  chartId: string;
  calculation: CalculationResult;
  metadata: ChartMetadata;
  createdAt: Date;
}

export const useChartStore = defineStore('chart', {
  state: () => ({
    currentChart: null as ChartData | null,
    history: [] as Array<{
      chartId: string;
      metadata: ChartMetadata;
      createdAt: Date;
    }>,
  }),

  getters: {
    hasChart: (state) => state.currentChart !== null,
    chartId: (state) => state.currentChart?.chartId,
  },

  actions: {
    setCurrentChart(chartData: ChartData) {
      this.currentChart = chartData;
      
      // 保存到 localStorage (匿名用戶)
      localStorage.setItem('currentChartId', chartData.chartId);
      
      // 添加到歷史記錄
      this.addToHistory(chartData);
    },

    addToHistory(chartData: ChartData) {
      const historyItem = {
        chartId: chartData.chartId,
        metadata: chartData.metadata,
        createdAt: chartData.createdAt,
      };
      
      // 避免重複
      const index = this.history.findIndex(h => h.chartId === chartData.chartId);
      if (index >= 0) {
        this.history.splice(index, 1);
      }
      
      // 添加到開頭
      this.history.unshift(historyItem);
      
      // 限制歷史記錄數量
      if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
      }
      
      // 保存到 localStorage
      localStorage.setItem('chartHistory', JSON.stringify(this.history));
    },

    loadFromLocalStorage() {
      const chartId = localStorage.getItem('currentChartId');
      const history = localStorage.getItem('chartHistory');
      
      if (history) {
        this.history = JSON.parse(history);
      }
      
      return chartId;
    },

    clearCurrentChart() {
      this.currentChart = null;
      localStorage.removeItem('currentChartId');
    },
  },
});
```

---

## 🎨 Phase 2D: 前端 UI

### 1. 更新 App.vue Navbar
```vue
<!-- bazi-app-vue/src/App.vue -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';

const route = useRoute();
const router = useRouter();
const chartStore = useChartStore();
const showMobileMenu = ref(false);

// 檢查是否有可用的命盤數據
const hasChartData = computed(() => chartStore.hasChart);

const handleAIAnalysis = () => {
  if (!hasChartData.value) {
    // 嘗試從 localStorage 載入
    const chartId = chartStore.loadFromLocalStorage();
    
    if (!chartId) {
      // 提示用戶先進行計算
      alert('請先進行命盤計算');
      router.push('/unified');
      return;
    }
  }
  
  // 跳轉到 AI 分析頁面
  router.push('/ai-analysis');
  showMobileMenu.value = false;
};

onMounted(() => {
  // 嘗試從 localStorage 載入歷史記錄
  chartStore.loadFromLocalStorage();
});
</script>

<template>
  <div id="app-container">
    <header class="app-header">
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <h1>{{ $t('common.app_name') }}</h1>
            <span class="brand-subtitle">佩璇命理智能分析平台</span>
          </router-link>
        </div>

        <!-- 桌面版導航菜單 -->
        <div class="nav-menu desktop-menu">
          <router-link
            to="/unified"
            class="nav-link"
            :class="{ active: route.path.startsWith('/unified') }"
          >
            {{ $t('astrology.unified') }}
          </router-link>
          
          <!-- 新增：AI 分析按鈕 -->
          <button
            class="nav-link ai-analysis-btn"
            :class="{ 
              active: route.path === '/ai-analysis',
              disabled: !hasChartData 
            }"
            @click="handleAIAnalysis"
          >
            <span class="icon">🤖</span>
            <span>AI 分析</span>
            <span v-if="!hasChartData" class="badge">需先計算</span>
          </button>
        </div>

        <div class="nav-controls">
          <LanguageSelector />
          <button
            class="mobile-menu-button"
            :class="{ active: showMobileMenu }"
            @click="toggleMobileMenu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <!-- 移動版導航菜單 -->
      <div class="mobile-menu" :class="{ show: showMobileMenu }">
        <router-link
          to="/"
          class="mobile-nav-link"
          :class="{ active: route.name === 'home' }"
          @click="showMobileMenu = false"
        >
          {{ $t('common.home') }}
        </router-link>
        <router-link
          to="/unified"
          class="mobile-nav-link"
          :class="{ active: route.path.startsWith('/unified') }"
          @click="showMobileMenu = false"
        >
          {{ $t('astrology.unified') }}
        </router-link>
        
        <!-- 移動版 AI 分析 -->
        <button
          class="mobile-nav-link"
          :class="{ 
            active: route.path === '/ai-analysis',
            disabled: !hasChartData 
          }"
          @click="handleAIAnalysis"
        >
          <span class="icon">🤖</span>
          <span>AI 分析</span>
          <span v-if="!hasChartData" class="badge">需先計算</span>
        </button>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="app-footer">
      <!-- 保持原有 footer -->
    </footer>
  </div>
</template>

<style scoped>
.ai-analysis-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-analysis-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ai-analysis-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-analysis-btn .icon {
  font-size: 1.2rem;
}

.ai-analysis-btn .badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
</style>
```

### 2. AIAnalysisView 組件
```vue
<!-- bazi-app-vue/src/views/AIAnalysisView.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';

const router = useRouter();
const chartStore = useChartStore();

const analysisText = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const progress = ref(0);

let eventSource: EventSource | null = null;

const startStreaming = () => {
  const chartId = chartStore.chartId;
  
  if (!chartId) {
    error.value = '找不到命盤數據，請先進行計算';
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
        
        // 更新進度（估算）
        const estimatedTotal = 2000; // 預估總字數
        progress.value = Math.min(
          95,
          (analysisText.value.length / estimatedTotal) * 100
        );
      }
    } catch (err) {
      console.error('[SSE] Parse error:', err);
    }
  };
  
  eventSource.onerror = (err) => {
    console.error('[SSE] Error:', err);
    error.value = '連接中斷，請重試';
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
        <button class="back-btn" @click="goBack">
          ← 返回
        </button>
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
        <div class="spinner"></div>
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
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>

        <!-- Markdown 渲染 -->
        <div class="markdown-body" v-html="renderMarkdown(analysisText)"></div>

        <!-- 打字機效果游標 -->
        <span v-if="progress < 100" class="cursor">▋</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { marked } from 'marked';

export default {
  methods: {
    renderMarkdown(text: string): string {
      return marked(text);
    },
  },
};
</script>

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem 2rem;
  color: #e74c3c;
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

.markdown-body h2 {
  color: #667eea;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-body h3 {
  color: #764ba2;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-body strong {
  color: #667eea;
  font-weight: 600;
}

.cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
  color: #667eea;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.4rem;
  }
}
</style>
```

### 3. 更新 UnifiedView 保存邏輯
```typescript
// bazi-app-vue/src/views/UnifiedView.vue

import { useChartStore } from '@/stores/chartStore';

const chartStore = useChartStore();

const handleCalculate = async () => {
  try {
    const response = await unifiedApiService.calculate(formData);
    
    // 保存到 chartStore
    chartStore.setCurrentChart({
      chartId: response.chartId, // 假設後端返回 chartId
      calculation: response.calculation,
      metadata: {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        gender: formData.gender,
        longitude: formData.longitude,
      },
      createdAt: new Date(),
    });
    
    // 顯示結果
    calculationResult.value = response.calculation;
  } catch (error) {
    console.error('計算失敗:', error);
  }
};
```

---

## 🧪 測試計劃

### 單元測試
1. **GeminiService.analyzeChartStream**
   - 測試 SSE 格式轉換
   - 測試錯誤處理
   - 測試中斷重連

2. **ChartCacheService**
   - 測試 CRUD 操作
   - 測試快取過期邏輯

3. **chartStore**
   - 測試狀態更新
   - 測試 localStorage 同步

### 集成測試
1. **完整流程測試**
   - 計算 → 保存 → AI 分析 → 顯示
   - 快取命中測試
   - 匿名用戶測試

2. **Streaming 測試**
   - 首字節時間 < 5s
   - 逐字顯示流暢
   - 中斷重連正常

### 用戶測試
1. **桌面版**
   - Navbar 按鈕狀態正確
   - Streaming 顯示流暢
   - 複製功能正常

2. **移動版**
   - 響應式布局正常
   - 觸控操作流暢

---

## ⏱ 時間估算

| Phase | 任務 | 預估時間 |
|-------|------|----------|
| 2A | 後端 Streaming API | 3-4h |
| 2B | D1 快取層 | 2-3h |
| 2C | 前端狀態管理 | 1-2h |
| 2D | 前端 UI | 3-4h |
| 2E | 整合測試 | 2-3h |
| **總計** | | **11-16h** |

### 分階段交付
- **MVP (6-8h)**: Phase 2A + 2C + 基礎 UI
- **完整版 (11-16h)**: 所有 Phase + 測試

---

## 🚀 實作步驟

### Step 1: 後端 Streaming (3-4h)
1. 修改 geminiService.ts 添加 analyzeChartStream
2. 修改 analyzeController.ts 添加 analyzeStream
3. 修改 analyzeRoutes.ts 添加 /analyze/stream
4. 本地測試 SSE 輸出

### Step 2: D1 快取 (2-3h)
1. 創建 chartCacheService.ts
2. 創建 analysisCacheService.ts
3. 整合到 UnifiedController
4. 測試 CRUD 操作

### Step 3: 前端狀態 (1-2h)
1. 創建 chartStore.ts
2. 整合到 UnifiedView
3. 測試 localStorage 同步

### Step 4: 前端 UI (3-4h)
1. 更新 App.vue navbar
2. 創建 AIAnalysisView.vue
3. 添加路由
4. 測試 SSE 接收

### Step 5: 整合測試 (2-3h)
1. 端到端測試
2. 性能測試
3. 用戶測試
4. Bug 修復

---

## 📋 檢查清單

### 後端
- [ ] GeminiService.analyzeChartStream 實作
- [ ] AnalyzeController.analyzeStream 實作
- [ ] /analyze/stream 端點
- [ ] ChartCacheService 實作
- [ ] AnalysisCacheService 實作
- [ ] D1 查詢優化
- [ ] 錯誤處理完善
- [ ] 日誌監控

### 前端
- [ ] chartStore 實作
- [ ] App.vue navbar 更新
- [ ] AIAnalysisView 組件
- [ ] 路由配置
- [ ] SSE 接收邏輯
- [ ] 載入動畫
- [ ] 錯誤處理
- [ ] 響應式設計

### 測試
- [ ] 單元測試
- [ ] 集成測試
- [ ] 性能測試
- [ ] 用戶測試

### 文檔
- [ ] API 文檔更新
- [ ] 用戶指南
- [ ] 開發文檔

---

## 🎯 成功指標

1. **性能**
   - 首字節時間 < 5 秒 ✓
   - 完整輸出時間 < 30 秒 ✓
   - 快取命中率 > 50% ✓

2. **可用性**
   - 匿名用戶支援 ✓
   - 跨會話數據保留 ✓
   - 錯誤提示清晰 ✓

3. **用戶體驗**
   - Streaming 流暢 ✓
   - UI 響應快速 ✓
   - 操作直觀 ✓

---

**準備開始實作？請確認是否同意此規劃。**
