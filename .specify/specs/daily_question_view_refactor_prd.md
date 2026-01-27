# DailyQuestionView 重構 PRD

**版本**: v2.1.0  
**日期**: 2026-01-27  
**優先級**: P1 (風險最低)  
**預估工時**: 2-3 小時

---

## 📋 執行摘要

### 為什麼選擇 DailyQuestionView？

**風險評估** (最低風險 ⭐⭐⭐⭐⭐):
1. ✅ **代碼最少**: 僅 170 行，最簡單
2. ✅ **邏輯簡單**: 只有條件顯示 (有/無命盤)
3. ✅ **依賴單純**: 主要依賴 DailyQuestionPanel 組件
4. ✅ **無複雜計算**: 不涉及命理計算邏輯
5. ✅ **已有設計**: DailyQuestionPanel 已使用新設計系統

### 當前問題
1. ❌ 使用 emoji 🔮 而非 Iconify 圖標
2. ❌ 未使用新的設計系統變數
3. ❌ 樣式與首頁不一致
4. ❌ 缺少 Glassmorphism 效果

---

## 🎯 重構目標

### 視覺目標
- 與首頁 Hero Section 風格一致
- 使用 Glassmorphism 設計
- Iconify 圖標替代 emoji
- 統一圓角、陰影、動畫系統

### 技術目標
- 使用新的 design-tokens.css 變數
- 保持功能完全不變
- 代碼行數控制在 200 行內
- 無 ESLint 錯誤

---

## 🎨 設計規格

### 當前結構
```
DailyQuestionView
├─ 有命盤: DailyQuestionPanel (全屏)
└─ 無命盤: no-chart-notice
   ├─ welcome-card
   │  ├─ 🔮 emoji
   │  ├─ 標題
   │  ├─ 描述
   │  └─ 快速設定按鈕
   └─ QuickSetupForm Modal
```

### 新設計 (無命盤狀態)

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  [Glassmorphism 容器]                    │
│                                         │
│  [獨角獸圖標 - Iconify]                  │
│  (浮動動畫 + 閃光效果)                   │
│                                         │
│  需要先建立命盤                          │
│  才能向佩璇提問喔                        │
│                                         │
│  只需填寫基本出生資料                    │
│  就能開始與佩璇對話                      │
│                                         │
│  [快速設定] (Premium 金色按鈕)           │
│                                         │
└─────────────────────────────────────────┘
```

#### 設計元素

**1. 背景**
```css
background: radial-gradient(
  circle at top right, 
  rgba(147, 112, 219, 0.2), 
  transparent 40%
),
radial-gradient(
  circle at bottom left, 
  rgba(210, 105, 30, 0.1), 
  transparent 40%
),
linear-gradient(
  135deg, 
  #7c3aed 0%, 
  var(--primary-color) 70%, 
  #4a250a 100%
);
```

**2. Glassmorphism 卡片**
```css
.welcome-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4xl);
  box-shadow: var(--shadow-glass);
}
```

**3. 獨角獸圖標**
```vue
<div class="icon-visual">
  <div class="glass-icon-container">
    <Icon 
      icon="fluent-emoji-flat:unicorn" 
      width="120"
      class="animate-float"
    />
  </div>
  
  <!-- 閃光效果 -->
  <Icon 
    icon="lucide:sparkles" 
    class="sparkle sparkle-1 animate-twinkle"
    width="40"
  />
  <Icon 
    icon="lucide:sparkles" 
    class="sparkle sparkle-2 animate-twinkle"
    width="28"
  />
</div>
```

**4. Premium 按鈕**
```css
.quick-setup-btn {
  --el-button-bg-color: var(--peixuan-gold);
  --el-button-text-color: var(--primary-color);
  font-weight: var(--font-weight-bold);
  padding: 1.25rem 3.5rem !important;
  border-radius: 2rem !important;
  font-size: var(--font-size-xl) !important;
  box-shadow: var(--shadow-premium);
  transition: all var(--transition-slow) var(--ease-spring);
}

.quick-setup-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: var(--shadow-premium-hover) !important;
}
```

---

## 📝 i18n 文案更新

### zh_TW.json
```json
{
  "dailyQuestion": {
    "noChart": {
      "title": "需要先建立命盤",
      "subtitle": "才能向佩璇提問喔",
      "description": "只需填寫基本出生資料，就能開始與佩璇對話",
      "quickSetupButton": "快速設定"
    }
  }
}
```

### en.json
```json
{
  "dailyQuestion": {
    "noChart": {
      "title": "Chart Required",
      "subtitle": "Before asking Peixuan",
      "description": "Just fill in your birth info to start chatting with Peixuan",
      "quickSetupButton": "Quick Setup"
    }
  }
}
```

---

## 🔧 技術實施

### 檔案清單
- ✅ `src/views/DailyQuestionView.vue` (主要修改)
- ✅ `src/i18n/locales/zh_TW.json` (文案更新)
- ✅ `src/i18n/locales/en.json` (文案更新)

### 實施步驟

#### Step 1: 更新 Template
```vue
<template>
  <div class="daily-question-fullscreen">
    <!-- 有命盤：顯示 DailyQuestionPanel -->
    <DailyQuestionPanel
      v-if="currentChartId"
      :chart-id="currentChartId"
      class="fullscreen-panel"
      @question-asked="handleQuestionAsked"
    />

    <!-- 無命盤：顯示 Glassmorphism 引導 -->
    <div v-else class="no-chart-container">
      <div class="welcome-card">
        <!-- 獨角獸圖標 + 閃光效果 -->
        <div class="icon-visual">
          <div class="glass-icon-container">
            <Icon 
              icon="fluent-emoji-flat:unicorn" 
              width="120"
              class="animate-float"
            />
          </div>
          <Icon 
            icon="lucide:sparkles" 
            class="sparkle sparkle-1 animate-twinkle"
            width="40"
          />
          <Icon 
            icon="lucide:sparkles" 
            class="sparkle sparkle-2 animate-twinkle"
            width="28"
          />
        </div>

        <!-- 文案 -->
        <h2 class="welcome-title">
          {{ $t('dailyQuestion.noChart.title') }}
        </h2>
        <p class="welcome-subtitle">
          {{ $t('dailyQuestion.noChart.subtitle') }}
        </p>
        <p class="welcome-description">
          {{ $t('dailyQuestion.noChart.description') }}
        </p>

        <!-- Premium 按鈕 -->
        <el-button
          type="primary"
          size="large"
          class="quick-setup-btn"
          @click="showQuickSetupModal = true"
        >
          {{ $t('dailyQuestion.noChart.quickSetupButton') }}
        </el-button>
      </div>

      <!-- Quick Setup Modal -->
      <el-dialog
        v-model="showQuickSetupModal"
        :title="$t('dailyQuestion.noChart.quickSetupTitle')"
        width="90%"
        :style="{ maxWidth: '600px' }"
        center
        append-to-body
      >
        <QuickSetupForm @chart-created="handleChartCreated" />
      </el-dialog>
    </div>
  </div>
</template>
```

#### Step 2: 更新 Script
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import { Icon } from '@iconify/vue';
import DailyQuestionPanel from '@/components/DailyQuestionPanel.vue';
import QuickSetupForm from '@/components/QuickSetupForm.vue';

const router = useRouter();
const chartStore = useChartStore();
const showQuickSetupModal = ref(false);

const currentChartId = computed(() => chartStore.currentChart?.chartId);

onMounted(() => {
  chartStore.loadFromLocalStorage();
});

const handleQuestionAsked = () => {
  // 問題已提問，可以添加追蹤邏輯
};

const handleChartCreated = (chartId: string) => {
  showQuickSetupModal.value = false;
  // 命盤創建後自動刷新
  chartStore.loadFromLocalStorage();
};
</script>
```

#### Step 3: 更新 Style
```vue
<style scoped>
/* ========== 全屏容器 ========== */
.daily-question-fullscreen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-panel {
  width: 100%;
  min-height: 100vh;
}

/* ========== 無命盤容器 ========== */
.no-chart-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  
  /* 漸層背景 (與 Hero 一致) */
  background: 
    radial-gradient(circle at top right, rgba(147, 112, 219, 0.2), transparent 40%),
    radial-gradient(circle at bottom left, rgba(210, 105, 30, 0.1), transparent 40%),
    linear-gradient(135deg, #7c3aed 0%, var(--primary-color) 70%, #4a250a 100%);
}

/* ========== Glassmorphism 卡片 ========== */
.welcome-card {
  max-width: 600px;
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4xl);
  box-shadow: var(--shadow-glass);
  text-align: center;
}

/* ========== 圖標視覺 ========== */
.icon-visual {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-3xl);
}

.glass-icon-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  display: inline-block;
  box-shadow: var(--shadow-glass);
}

.sparkle {
  position: absolute;
  color: var(--peixuan-gold);
  pointer-events: none;
}

.sparkle-1 {
  top: -1rem;
  right: -1rem;
}

.sparkle-2 {
  bottom: 0.5rem;
  left: -1.5rem;
  animation-delay: 2s;
}

/* ========== 文案 ========== */
.welcome-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  margin-bottom: var(--space-md);
  line-height: var(--line-height-tight);
}

.welcome-subtitle {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-lg);
  font-weight: var(--font-weight-medium);
}

.welcome-description {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-3xl);
}

/* ========== Premium 按鈕 ========== */
.quick-setup-btn {
  --el-button-bg-color: var(--peixuan-gold);
  --el-button-border-color: var(--peixuan-gold);
  --el-button-text-color: var(--primary-color);
  --el-button-hover-bg-color: var(--peixuan-gold);
  --el-button-hover-border-color: var(--peixuan-gold);
  
  font-weight: var(--font-weight-bold);
  padding: 1.25rem 3.5rem !important;
  border-radius: 2rem !important;
  font-size: var(--font-size-xl) !important;
  box-shadow: var(--shadow-premium);
  transition: all var(--transition-slow) var(--ease-spring);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 56px;
}

.quick-setup-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: var(--shadow-premium-hover) !important;
}

.quick-setup-btn:active {
  transform: scale(0.98);
}

/* ========== 響應式 ========== */
@media (max-width: 767px) {
  .no-chart-container {
    padding: var(--space-lg);
  }
  
  .welcome-card {
    padding: var(--space-2xl);
  }
  
  .glass-icon-container {
    padding: var(--space-lg);
  }
  
  .glass-icon-container :deep(svg) {
    width: 80px;
    height: 80px;
  }
  
  .sparkle-1 {
    width: 32px;
    height: 32px;
  }
  
  .sparkle-2 {
    width: 24px;
    height: 24px;
  }
  
  .welcome-title {
    font-size: var(--font-size-2xl);
  }
  
  .welcome-subtitle {
    font-size: var(--font-size-lg);
  }
  
  .welcome-description {
    font-size: var(--font-size-base);
  }
  
  .quick-setup-btn {
    width: 100%;
    padding: 1rem 2rem !important;
  }
}

/* ========== 無障礙 ========== */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-twinkle {
    animation: none;
  }
  
  .quick-setup-btn:hover {
    transform: none;
  }
}
</style>
```

---

## ✅ 驗收標準

### 功能驗收
- [ ] 有命盤時正常顯示 DailyQuestionPanel
- [ ] 無命盤時顯示 Glassmorphism 引導卡片
- [ ] 獨角獸圖標浮動動畫流暢
- [ ] 閃光效果正常顯示
- [ ] Premium 按鈕懸停效果正常
- [ ] 快速設定 Modal 正常開啟
- [ ] 命盤創建後自動刷新

### 視覺驗收
- [ ] 背景漸層與首頁一致
- [ ] Glassmorphism 效果正常
- [ ] 圓角、陰影使用新設計系統
- [ ] 中英文切換正常
- [ ] 深色模式（如適用）

### 響應式驗收
- [ ] 桌面版 (1920px, 1440px, 1024px)
- [ ] 平板版 (768px)
- [ ] 移動版 (375px, 320px)

### 代碼品質
- [ ] TypeScript 編譯通過
- [ ] ESLint 無錯誤
- [ ] 代碼行數 < 250 行
- [ ] 無 console 錯誤

---

## 📊 風險評估

| 風險項目 | 風險等級 | 緩解措施 |
|---------|---------|---------|
| 功能破壞 | 極低 ⭐ | 只改樣式，邏輯不變 |
| 依賴衝突 | 極低 ⭐ | 已使用 Iconify |
| 視覺不一致 | 低 ⭐⭐ | 複用 Hero Section 設計 |
| 性能影響 | 極低 ⭐ | 動畫已優化 |

---

## 🚀 實施計畫

### Phase 1: 準備 (15 分鐘)
- [ ] 備份當前 DailyQuestionView.vue
- [ ] 更新 i18n 文案

### Phase 2: 實施 (1.5 小時)
- [ ] 更新 Template
- [ ] 更新 Script
- [ ] 更新 Style

### Phase 3: 測試 (30 分鐘)
- [ ] 本地測試
- [ ] 響應式測試
- [ ] 功能測試

### Phase 4: 部署 (15 分鐘)
- [ ] 建置
- [ ] 部署到 Staging
- [ ] 驗證

---

## 🎯 預期效果

### 優化前
- 簡單的白色卡片
- Emoji 圖標
- 基礎按鈕樣式
- 與首頁風格不一致

### 優化後
- ✅ Glassmorphism 高級感
- ✅ 專業 Iconify 圖標
- ✅ Premium 金色按鈕
- ✅ 與首頁風格完全一致
- ✅ 流暢的動畫效果

---

## 📝 備註

- 此頁面是風險最低的重構目標
- 可作為其他頁面重構的範本
- 建議先在 Staging 環境完整測試
- 成功後可推廣到其他頁面

---

**準備好開始實施了嗎？** 🚀
