# UnifiedView 重構 PRD

**版本**: v2.2.0  
**日期**: 2026-01-27  
**優先級**: P2 (中等風險)  
**預估工時**: 4-6 小時

---

## 📋 執行摘要

### 為什麼選擇 UnifiedView？

**風險評估** (中等風險 ⭐⭐⭐):
1. ✅ **代碼適中**: 581 行，可控範圍
2. ✅ **邏輯清晰**: 表單提交 → API 請求 → 結果顯示
3. ⚠️ **依賴複雜**: UnifiedInputForm (484行) + UnifiedResultView (637行)
4. ⚠️ **後端依賴**: 命盤計算 API
5. ✅ **已有重構**: UnifiedInputForm 已使用 composables

### 當前問題
1. ❌ 使用 emoji 🌟 而非 Iconify 圖標
2. ❌ 未使用新的設計系統變數
3. ❌ el-card 樣式與新設計不一致
4. ❌ 缺少 Glassmorphism 效果
5. ❌ 對話框樣式過時

---

## 🎯 重構目標

### 視覺目標
- 與首頁、每日一問風格一致
- 使用 Glassmorphism 設計
- Iconify 圖標替代 emoji
- 統一圓角、陰影、動畫系統
- 優化表單視覺層次

### 技術目標
- 使用新的 design-tokens.css 變數
- 保持功能完全不變
- 代碼行數控制在 650 行內
- 無 ESLint 錯誤
- 不修改 UnifiedInputForm/UnifiedResultView 組件

---

## 🎨 設計規格

### 當前結構
```
UnifiedView
├─ form-card (el-card)
│  └─ UnifiedInputForm
├─ result-card (el-card)
│  ├─ loading: el-skeleton
│  ├─ error: el-alert
│  └─ result: UnifiedResultView
└─ showAnalysisDialog (el-dialog)
   ├─ 性格分析選項 🌟
   └─ 運勢分析選項 🔮
```

### 新設計 (Glassmorphism)

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  [Glassmorphism 容器]                    │
│                                         │
│  [表單卡片]                              │
│  ├─ 標題 (Iconify 圖標)                 │
│  └─ UnifiedInputForm                    │
│                                         │
│  [結果卡片] (條件顯示)                   │
│  ├─ 載入中: 骨架屏                       │
│  ├─ 錯誤: 錯誤提示                       │
│  └─ 成功: UnifiedResultView             │
│                                         │
└─────────────────────────────────────────┘

[分析選擇對話框]
├─ [性格分析卡片] (Iconify 圖標)
└─ [運勢分析卡片] (Iconify 圖標)
```

#### 設計元素

**1. 背景**
```css
background: 
  radial-gradient(circle at top right, rgba(147, 112, 219, 0.15), transparent 50%),
  radial-gradient(circle at bottom left, rgba(210, 105, 30, 0.1), transparent 50%),
  linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
```

**2. Glassmorphism 卡片**
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-enhanced)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  box-shadow: var(--shadow-glass-deep);
}
```

**3. 卡片標題**
```vue
<div class="card-header">
  <Icon icon="mdi:chart-timeline-variant" width="32" class="header-icon" />
  <h2 class="header-title">{{ $t('unifiedView.title') }}</h2>
</div>
```

**4. 分析選擇卡片**
```vue
<div class="choice-card">
  <div class="choice-icon-container">
    <Icon icon="mdi:account-star" width="48" class="choice-icon" />
  </div>
  <div class="choice-info">
    <h4 class="choice-title">{{ $t('unifiedView.personality_title') }}</h4>
    <p class="choice-description">{{ $t('unifiedView.personality_desc') }}</p>
  </div>
  <Icon icon="mdi:chevron-right" width="24" class="choice-arrow" />
</div>
```

---

## 📝 i18n 文案更新

### zh_TW.json
```json
{
  "unifiedView": {
    "title": "命盤計算",
    "subtitle": "輸入出生資訊，開始探索命運軌跡",
    "result_title": "您的命盤",
    "dialog_title": "選擇分析類型",
    "dialog_subtitle": "深入了解您的命運特質",
    "personality_title": "性格分析",
    "personality_desc": "探索您的天賦與性格特質",
    "fortune_title": "運勢分析",
    "fortune_desc": "洞察流年運勢與機遇"
  }
}
```

### en.json
```json
{
  "unifiedView": {
    "title": "Chart Calculation",
    "subtitle": "Enter your birth info to explore your destiny",
    "result_title": "Your Chart",
    "dialog_title": "Choose Analysis Type",
    "dialog_subtitle": "Dive deeper into your destiny",
    "personality_title": "Personality Analysis",
    "personality_desc": "Explore your talents and traits",
    "fortune_title": "Fortune Analysis",
    "fortune_desc": "Insights into annual fortune and opportunities"
  }
}
```

---

## 🔧 技術實施

### 檔案清單
- ✅ `src/views/UnifiedView.vue` (主要修改)
- ✅ `src/i18n/locales/zh_TW.json` (文案更新)
- ✅ `src/i18n/locales/en.json` (文案更新)
- ❌ `src/components/UnifiedInputForm.vue` (不修改)
- ❌ `src/components/UnifiedResultView.vue` (不修改)

### 實施步驟

#### Step 1: 更新 Template

**移除 el-card，改用自訂 Glassmorphism 卡片**:

```vue
<template>
  <div class="unified-view">
    <!-- 表單卡片 -->
    <div class="glass-card form-card">
      <div class="card-header">
        <Icon icon="mdi:chart-timeline-variant" width="32" class="header-icon" />
        <div class="header-text">
          <h2 class="header-title">{{ $t('unifiedView.title') }}</h2>
          <p class="header-subtitle">{{ $t('unifiedView.subtitle') }}</p>
        </div>
      </div>

      <UnifiedInputForm @submit="handleSubmit" />
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="glass-card result-card">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 錯誤 -->
    <div v-else-if="error" class="glass-card result-card error-card">
      <div class="error-content">
        <Icon icon="mdi:alert-circle" width="48" class="error-icon" />
        <p class="error-message">{{ error }}</p>
      </div>
    </div>

    <!-- 結果 -->
    <div v-else-if="result" class="glass-card result-card">
      <div class="card-header">
        <Icon icon="mdi:star-circle" width="32" class="header-icon" />
        <h3 class="header-title">{{ $t('unifiedView.result_title') }}</h3>
      </div>

      <UnifiedResultView :result="result" />
    </div>

    <!-- 分析選擇對話框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      :title="$t('unifiedView.dialog_title')"
      width="90%"
      :style="{ maxWidth: '600px' }"
      center
      :close-on-click-modal="false"
      class="analysis-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ $t('unifiedView.dialog_title') }}</h3>
          <p class="dialog-subtitle">{{ $t('unifiedView.dialog_subtitle') }}</p>
        </div>
      </template>

      <div class="analysis-choices">
        <!-- 性格分析 -->
        <div class="choice-card" @click="handleAnalysisChoice('/personality')">
          <div class="choice-icon-container">
            <Icon icon="mdi:account-star" width="48" class="choice-icon" />
          </div>
          <div class="choice-info">
            <h4 class="choice-title">{{ $t('unifiedView.personality_title') }}</h4>
            <p class="choice-description">{{ $t('unifiedView.personality_desc') }}</p>
          </div>
          <Icon icon="mdi:chevron-right" width="24" class="choice-arrow" />
        </div>

        <!-- 運勢分析 -->
        <div class="choice-card" @click="handleAnalysisChoice('/fortune')">
          <div class="choice-icon-container">
            <Icon icon="mdi:crystal-ball" width="48" class="choice-icon" />
          </div>
          <div class="choice-info">
            <h4 class="choice-title">{{ $t('unifiedView.fortune_title') }}</h4>
            <p class="choice-description">{{ $t('unifiedView.fortune_desc') }}</p>
          </div>
          <Icon icon="mdi:chevron-right" width="24" class="choice-arrow" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>
```

#### Step 2: 更新 Script

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import UnifiedResultView from '../components/UnifiedResultView.vue';
import type { UnifiedChartResult } from '@/types/chart';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const result = ref<UnifiedChartResult | null>(null);
const showAnalysisDialog = ref(false);

const handleSubmit = async (data: UnifiedChartResult) => {
  loading.value = true;
  error.value = '';
  
  try {
    result.value = data;
    showAnalysisDialog.value = true;
  } catch (err: any) {
    error.value = err.message || '計算失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

const handleAnalysisChoice = (path: string) => {
  showAnalysisDialog.value = false;
  router.push(path);
};
</script>
```

#### Step 3: 更新 Style

```vue
<style scoped>
/* ========== 容器 ========== */
.unified-view {
  min-height: 100vh;
  padding: var(--space-2xl);
  
  /* 淺色漸層背景 */
  background: 
    radial-gradient(circle at top right, rgba(147, 112, 219, 0.15), transparent 50%),
    radial-gradient(circle at bottom left, rgba(210, 105, 30, 0.1), transparent 50%),
    linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

/* ========== Glassmorphism 卡片 ========== */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-enhanced)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur-enhanced)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  box-shadow: var(--shadow-glass-deep);
  margin-bottom: var(--space-2xl);
}

/* ========== 卡片標題 ========== */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.header-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.header-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 錯誤卡片 ========== */
.error-card {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-3xl);
  text-align: center;
}

.error-icon {
  color: var(--color-error);
}

.error-message {
  font-size: var(--font-size-lg);
  color: var(--color-error);
  margin: 0;
}

/* ========== 分析選擇對話框 ========== */
:deep(.analysis-dialog .el-dialog) {
  border-radius: 2.5rem !important;
  background: rgba(255, 255, 255, 0.98) !important;
}

.dialog-header {
  text-align: center;
  padding: var(--space-lg) 0;
}

.dialog-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.dialog-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 分析選擇卡片 ========== */
.analysis-choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg) 0;
}

.choice-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base) var(--ease-spring);
}

.choice-card:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.choice-icon-container {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--radius-md);
  color: white;
}

.choice-info {
  flex: 1;
}

.choice-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.choice-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.choice-arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform var(--transition-base) var(--ease-spring);
}

.choice-card:hover .choice-arrow {
  transform: translateX(4px);
}

/* ========== 響應式 ========== */
@media (max-width: 767px) {
  .unified-view {
    padding: var(--space-lg);
  }
  
  .glass-card {
    padding: var(--space-xl);
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .choice-card {
    flex-direction: column;
    text-align: center;
  }
  
  .choice-arrow {
    transform: rotate(90deg);
  }
  
  .choice-card:hover .choice-arrow {
    transform: rotate(90deg) translateX(4px);
  }
}

/* ========== 深色模式 ========== */
html.dark .unified-view {
  background: 
    radial-gradient(circle at top right, rgba(147, 112, 219, 0.2), transparent 50%),
    radial-gradient(circle at bottom left, rgba(210, 105, 30, 0.15), transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

html.dark .glass-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .choice-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .choice-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ========== 無障礙 ========== */
@media (prefers-reduced-motion: reduce) {
  .choice-card,
  .choice-arrow {
    transition: none;
  }
  
  .choice-card:hover {
    transform: none;
  }
}
</style>
```

---

## ✅ 驗收標準

### 功能驗收
- [ ] 表單提交正常
- [ ] 載入狀態顯示骨架屏
- [ ] 錯誤狀態顯示錯誤卡片
- [ ] 結果顯示 UnifiedResultView
- [ ] 分析選擇對話框正常開啟
- [ ] 性格/運勢分析導航正常

### 視覺驗收
- [ ] Glassmorphism 效果正常
- [ ] 背景漸層與首頁一致
- [ ] 圓角、陰影使用新設計系統
- [ ] Iconify 圖標替代 emoji
- [ ] 中英文切換正常
- [ ] 深色模式正常

### 響應式驗收
- [ ] 桌面版 (1920px, 1440px, 1024px)
- [ ] 平板版 (768px)
- [ ] 移動版 (375px, 320px)

### 代碼品質
- [ ] TypeScript 編譯通過
- [ ] ESLint 無錯誤
- [ ] 代碼行數 < 650 行
- [ ] 無 console 錯誤

---

## 📊 風險評估

| 風險項目 | 風險等級 | 緩解措施 |
|---------|---------|---------|
| 功能破壞 | 中 ⭐⭐⭐ | 保持組件不變，只改容器 |
| 依賴衝突 | 低 ⭐⭐ | 已使用 Iconify |
| 視覺不一致 | 低 ⭐⭐ | 複用 DailyQuestionView 設計 |
| 性能影響 | 極低 ⭐ | Glassmorphism 已優化 |

---

## 🚀 實施計畫

### Phase 1: 準備 (15 分鐘)
- [ ] 備份當前 UnifiedView.vue
- [ ] 更新 i18n 文案

### Phase 2: 實施 (3 小時)
- [ ] 更新 Template (移除 el-card)
- [ ] 更新 Script (添加 Icon import)
- [ ] 更新 Style (Glassmorphism)

### Phase 3: 測試 (1 小時)
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
- 基礎 el-card 樣式
- Emoji 圖標
- 白色背景
- 與首頁風格不一致

### 優化後
- ✅ Glassmorphism 高級感
- ✅ 專業 Iconify 圖標
- ✅ 漸層背景
- ✅ 與首頁風格完全一致
- ✅ 流暢的動畫效果

---

## 📝 備註

- 此頁面是中等風險的重構目標
- 不修改 UnifiedInputForm/UnifiedResultView 組件
- 建議先在 Staging 環境完整測試
- 成功後可推廣到 UnifiedAIAnalysisView

---

**準備好開始實施了嗎？** 🚀
