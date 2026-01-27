# 前端重構技術實施方案 v2.0

**版本**: v2.0.0  
**日期**: 2026-01-27  
**技術棧**: Vue 3 + Element Plus + 純 CSS 變數 + Iconify

---

## 📦 依賴安裝

```bash
cd bazi-app-vue

# 僅安裝必要套件
npm install @iconify/vue @vueuse/core
```

---

## 🎨 Step 1: 更新設計系統變數

### 文件: `src/assets/styles/design-tokens.css`

```css
/* ============================================
   佩璇 v2.0 設計系統變數
   基於雛形視覺設計 + 純 CSS 實現
   ============================================ */

:root {
  /* ========== 色彩系統 ========== */
  
  /* 主色調 (保持現有) */
  --primary-color: #8B4513;
  --primary-light: #D2691E;
  --primary-dark: #654321;
  --primary-lightest: #F5E6D3;
  
  /* 佩璇專屬色 (新增) */
  --peixuan-purple: #9370DB;
  --peixuan-pink: #FFB6C1;
  --peixuan-gold: #FFD700;
  
  /* 背景色系 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F8FA;
  --bg-soft: #FCF9F7;
  
  /* 文字色系 */
  --text-primary: #2D2D2D;
  --text-secondary: #606266;
  --text-tertiary: #909399;
  --text-inverse: #FFFFFF;
  
  /* ========== 圓角系統 (升級) ========== */
  --radius-xs: 0.5rem;   /* 8px */
  --radius-sm: 1rem;     /* 16px */
  --radius-md: 1.5rem;   /* 24px */
  --radius-lg: 2.5rem;   /* 40px */
  --radius-xl: 4rem;     /* 64px */
  
  /* ========== 陰影系統 (精緻化) ========== */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);
  
  /* 細膩陰影 (新增) */
  --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 20px 40px -10px rgba(139, 69, 19, 0.12);
  --shadow-premium: 0 10px 25px -5px rgba(255, 215, 0, 0.4);
  --shadow-premium-hover: 0 15px 35px -5px rgba(255, 215, 0, 0.5);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  /* ========== 間距系統 (保持) ========== */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
  --space-5xl: 8rem;     /* 128px */
  
  /* ========== 緩動函數 (新增) ========== */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* ========== 過渡時間 ========== */
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
  --transition-slow: 0.4s;
  
  /* ========== Glassmorphism ========== */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: 20px;
  
  /* ========== 字體系統 ========== */
  --font-family: 'Inter', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 字體大小 (響應式) */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  --font-size-4xl: 2.5rem;    /* 40px */
  --font-size-5xl: 3rem;      /* 48px */
  --font-size-6xl: 4rem;      /* 64px */
  
  /* 行高 */
  --line-height-tight: 1.1;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}

/* ========== 深色模式 ========== */
html.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2D2D2D;
  --bg-soft: #252525;
  
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-tertiary: #808080;
  
  --glass-bg: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
}

/* ========== 全局動畫 ========== */

/* 浮動動畫 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(1deg); 
  }
}

/* 閃爍動畫 */
@keyframes twinkle {
  0%, 100% { 
    opacity: 0.4; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.15); 
  }
}

/* 漸入上升 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 脈衝動畫 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* ========== 工具類別 ========== */

/* 動畫類別 */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-twinkle {
  animation: twinkle 4s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s var(--ease-spring) forwards;
}

/* 陰影類別 */
.shadow-soft {
  box-shadow: var(--shadow-soft);
}

.shadow-hover {
  transition: all var(--transition-slow) var(--ease-spring);
}

.shadow-hover:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
}

/* Glassmorphism */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
}

/* ========== 無障礙 ========== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .animate-float,
  .animate-twinkle {
    animation: none !important;
  }
}
```

---

## 🎨 Step 2: 創建全局樣式

### 文件: `src/assets/styles/global.css`

```css
/* ============================================
   全局樣式
   ============================================ */

@import './design-tokens.css';

/* 字體導入 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* 重置與基礎樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-soft);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

/* 響應式字體 */
@media (max-width: 767px) {
  html {
    font-size: 14px;
  }
}

/* 滾動條樣式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 選取文字樣式 */
::selection {
  background: var(--peixuan-purple);
  color: var(--text-inverse);
}

/* 焦點樣式 */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 連結樣式 */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color var(--transition-normal);
}

a:hover {
  color: var(--primary-light);
}

/* 圖片響應式 */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 按鈕重置 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

/* 輸入框重置 */
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}
```

---

## 🏗️ Step 3: Hero Section 完整實現

### 文件: `src/views/HomeView.vue`

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { Icon } from '@iconify/vue';

const router = useRouter();
const chartStore = useChartStore();
const { t } = useI18n();

const userCount = ref(0);
const hasChart = computed(() => !!chartStore.currentChart?.chartId);

onMounted(() => {
  chartStore.loadFromLocalStorage();
  // 模擬用戶數量（實際應從 API 獲取）
  userCount.value = 15248;
});

const handleStart = () => {
  router.push('/unified');
};
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <!-- Glassmorphism 視覺元素 -->
        <div class="hero-visual">
          <div class="glass-container">
            <Icon 
              icon="fluent-emoji-flat:unicorn" 
              width="180"
              class="peixuan-avatar animate-float"
            />
          </div>
          
          <!-- 閃光效果 -->
          <Icon 
            icon="lucide:sparkles" 
            class="sparkle sparkle-1 animate-twinkle"
            width="56"
          />
          <Icon 
            icon="lucide:sparkles" 
            class="sparkle sparkle-2 animate-twinkle"
            width="36"
          />
        </div>

        <!-- 文案區域 -->
        <div class="hero-content">
          <h1 class="hero-title">
            {{ $t('home.hero.greeting') }}<br>
            <span class="hero-subtitle">{{ $t('home.hero.tagline') }}</span>
          </h1>
          
          <p class="hero-description">
            {{ $t('home.hero.description') }}
          </p>

          <!-- Premium 按鈕 -->
          <el-button
            type="primary"
            size="large"
            class="btn-premium"
            @click="handleStart"
          >
            {{ $t('home.hero.cta') }}
          </el-button>

          <!-- 隱私聲明 -->
          <div class="privacy-badge">
            <Icon icon="lucide:shield-check" width="16" />
            <span>{{ $t('home.hero.privacy') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 其他 Sections... -->
  </div>
</template>

<style scoped>
/* ========== Hero Section ========== */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-lg);
  position: relative;
  overflow: hidden;
  
  /* 漸層背景 (採用雛形) */
  background: 
    radial-gradient(circle at top right, rgba(147, 112, 219, 0.2), transparent 40%),
    radial-gradient(circle at bottom left, rgba(210, 105, 30, 0.1), transparent 40%),
    linear-gradient(135deg, #7c3aed 0%, var(--primary-color) 70%, #4a250a 100%);
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* ========== Glassmorphism 容器 ========== */
.hero-visual {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-3xl);
}

.glass-container {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-glass);
  display: inline-block;
}

.peixuan-avatar {
  display: block;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

/* ========== 閃光效果 ========== */
.sparkle {
  position: absolute;
  pointer-events: none;
}

.sparkle-1 {
  top: -2rem;
  right: -2rem;
  color: var(--peixuan-gold);
}

.sparkle-2 {
  bottom: 1rem;
  left: -2.5rem;
  color: var(--peixuan-pink);
  animation-delay: 2s;
}

/* ========== 文案樣式 ========== */
.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-lg);
}

.hero-subtitle {
  display: block;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: var(--font-weight-semibold);
  opacity: 0.8;
  margin-top: var(--space-md);
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-3xl);
  font-weight: var(--font-weight-medium);
}

/* ========== Premium 按鈕 ========== */
.btn-premium {
  /* 覆蓋 Element Plus 預設樣式 */
  --el-button-bg-color: var(--peixuan-gold);
  --el-button-border-color: var(--peixuan-gold);
  --el-button-text-color: var(--primary-color);
  --el-button-hover-bg-color: var(--peixuan-gold);
  --el-button-hover-border-color: var(--peixuan-gold);
  --el-button-hover-text-color: var(--primary-color);
  
  font-weight: var(--font-weight-bold);
  padding: 1.25rem 3.5rem !important;
  border-radius: 2rem !important;
  font-size: var(--font-size-xl) !important;
  box-shadow: var(--shadow-premium);
  transition: all var(--transition-slow) var(--ease-spring);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 56px;
}

.btn-premium:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: var(--shadow-premium-hover) !important;
}

.btn-premium:active {
  transform: scale(0.98);
}

/* ========== 隱私聲明 ========== */
.privacy-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
  color: rgba(255, 255, 255, 0.5);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* ========== 響應式 ========== */
@media (max-width: 767px) {
  .hero-section {
    min-height: 80vh;
    padding: var(--space-2xl) var(--space-lg);
  }
  
  .glass-container {
    padding: 2rem;
  }
  
  .peixuan-avatar {
    width: 120px;
    height: 120px;
  }
  
  .sparkle-1 {
    width: 40px;
    height: 40px;
  }
  
  .sparkle-2 {
    width: 28px;
    height: 28px;
  }
  
  .btn-premium {
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
  
  .btn-premium:hover {
    transform: none;
  }
}
</style>
```

---

## 🎨 Step 4: Trust Section 實現

### 新增組件: `src/components/TrustCard.vue`

```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface TrustCardProps {
  icon: string;
  title: string;
  desc: string;
}

defineProps<TrustCardProps>();
</script>

<template>
  <div class="trust-card shadow-hover">
    <div class="icon-container">
      <Icon 
        :icon="icon" 
        class="trust-icon"
        width="36"
      />
    </div>
    <h3 class="trust-title">{{ title }}</h3>
    <p class="trust-desc">{{ desc }}</p>
  </div>
</template>

<style scoped>
.trust-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 圖標容器 */
.icon-container {
  width: 5rem;
  height: 5rem;
  background: var(--primary-lightest);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-lg);
  transition: all var(--transition-slow) var(--ease-spring);
}

.trust-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
  background: var(--primary-light);
}

.trust-icon {
  color: var(--primary-color);
  transition: color var(--transition-normal);
}

.trust-card:hover .trust-icon {
  color: var(--text-inverse);
}

/* 文字樣式 */
.trust-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.trust-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* 響應式 */
@media (max-width: 767px) {
  .trust-card {
    padding: var(--space-2xl);
  }
  
  .icon-container {
    width: 4rem;
    height: 4rem;
  }
  
  .trust-title {
    font-size: var(--font-size-xl);
  }
  
  .trust-desc {
    font-size: var(--font-size-base);
  }
}
</style>
```

### 在 HomeView.vue 中使用

```vue
<script setup lang="ts">
import TrustCard from '@/components/TrustCard.vue';

const trustItems = computed(() => [
  {
    id: 'traditional',
    icon: 'lucide:scroll-text',
    title: t('home.trust.traditional.title'),
    desc: t('home.trust.traditional.desc'),
  },
  {
    id: 'ai',
    icon: 'lucide:cpu',
    title: t('home.trust.ai.title'),
    desc: t('home.trust.ai.desc'),
  },
  {
    id: 'privacy',
    icon: 'lucide:shield-check',
    title: t('home.trust.privacy.title'),
    desc: t('home.trust.privacy.desc'),
  },
]);
</script>

<template>
  <!-- Trust Section -->
  <section class="trust-section">
    <div class="section-container">
      <h2 class="section-title">
        {{ $t('home.trust.title') }}
      </h2>
      
      <div class="trust-grid">
        <TrustCard
          v-for="item in trustItems"
          :key="item.id"
          :icon="item.icon"
          :title="item.title"
          :desc="item.desc"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.trust-section {
  background: var(--bg-secondary);
  padding: var(--space-5xl) 0;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--font-weight-bold);
  text-align: center;
  color: var(--text-primary);
  margin-bottom: var(--space-4xl);
  letter-spacing: -0.02em;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
}

/* 響應式 */
@media (max-width: 767px) {
  .trust-section {
    padding: var(--space-3xl) 0;
  }
  
  .trust-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}
</style>
```

---

## 🎨 Step 5: Journey Section 實現

### 新增組件: `src/components/JourneyStep.vue`

```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface JourneyStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  desc: string;
  showConnector?: boolean;
}

defineProps<JourneyStepProps>();
</script>

<template>
  <div class="journey-step">
    <div class="step-number">{{ stepNumber }}</div>
    <Icon 
      :icon="icon" 
      class="step-icon"
      width="72"
    />
    <div class="step-badge">Step 0{{ stepNumber }}</div>
    <h3 class="step-title">{{ title }}</h3>
    <p class="step-desc">{{ desc }}</p>
    
    <!-- 連接箭頭 -->
    <Icon 
      v-if="showConnector"
      icon="lucide:arrow-right"
      class="step-connector"
      width="32"
    />
  </div>
</template>

<style scoped>
.journey-step {
  text-align: center;
  position: relative;
  padding: var(--space-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(147, 112, 219, 0.1);
  transition: all var(--transition-slow) var(--ease-spring);
}

.journey-step:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  border-color: var(--peixuan-purple);
}

/* 步驟編號 */
.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

/* 圖標 */
.step-icon {
  color: var(--peixuan-purple);
  margin: 0 auto var(--space-lg);
  display: block;
  transition: transform var(--transition-slow) var(--ease-bounce);
}

.journey-step:hover .step-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Badge */
.step-badge {
  display: inline-block;
  padding: 0.375rem 1.25rem;
  border-radius: var(--radius-xl);
  background: var(--text-primary);
  color: var(--text-inverse);
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: var(--space-md);
}

/* 文字 */
.step-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.step-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* 連接箭頭 */
.step-connector {
  position: absolute;
  top: 50%;
  right: -2rem;
  transform: translateY(-50%);
  color: var(--peixuan-pink);
  z-index: 1;
  opacity: 0.6;
}

/* 響應式 */
@media (max-width: 1023px) {
  .step-connector {
    display: none;
  }
}

@media (max-width: 767px) {
  .journey-step {
    padding: var(--space-lg);
  }
  
  .step-icon {
    width: 56px;
    height: 56px;
  }
  
  .step-title {
    font-size: var(--font-size-xl);
  }
  
  .step-desc {
    font-size: var(--font-size-base);
  }
}
</style>
```

### 在 HomeView.vue 中使用

```vue
<script setup lang="ts">
import JourneyStep from '@/components/JourneyStep.vue';

const journeySteps = computed(() => [
  {
    id: 'calculate',
    icon: 'lucide:edit-3',
    title: t('home.journey.step1.title'),
    desc: t('home.journey.step1.desc'),
  },
  {
    id: 'analyze',
    icon: 'lucide:cpu',
    title: t('home.journey.step2.title'),
    desc: t('home.journey.step2.desc'),
  },
  {
    id: 'companion',
    icon: 'lucide:compass',
    title: t('home.journey.step3.title'),
    desc: t('home.journey.step3.desc'),
  },
]);
</script>

<template>
  <!-- Journey Section -->
  <section class="journey-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          {{ $t('home.journey.title') }}
        </h2>
        <p class="section-subtitle">
          {{ $t('home.journey.subtitle') }}
        </p>
      </div>
      
      <div class="journey-grid">
        <!-- 連接線 (桌面版) -->
        <div class="journey-line"></div>
        
        <JourneyStep
          v-for="(step, index) in journeySteps"
          :key="step.id"
          :step-number="index + 1"
          :icon="step.icon"
          :title="step.title"
          :desc="step.desc"
          :show-connector="index < journeySteps.length - 1"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey-section {
  background: var(--bg-primary);
  padding: var(--space-5xl) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-4xl);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-tertiary);
  margin-top: var(--space-md);
}

.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-2xl);
  position: relative;
}

/* 連接線 (採用雛形設計) */
.journey-line {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    to right, 
    transparent, 
    var(--peixuan-pink), 
    transparent
  );
  z-index: 0;
  pointer-events: none;
}

/* 響應式 */
@media (max-width: 1023px) {
  .journey-line {
    display: none;
  }
  
  .journey-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
}

@media (max-width: 767px) {
  .journey-section {
    padding: var(--space-3xl) 0;
  }
}
</style>
```

---

## 🎨 Step 6: Services Section 實現

### 更新 ServiceCard.vue

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

interface ServiceCardProps {
  service: {
    id: string;
    icon: string;
    title: string;
    desc: string;
    route: string;
    color: string;
    badge: string;
  };
}

const props = defineProps<ServiceCardProps>();
const router = useRouter();

const handleClick = () => {
  router.push(props.service.route);
};
</script>

<template>
  <div
    class="service-card shadow-hover"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 頂部區域 -->
    <div class="card-header">
      <span 
        class="service-badge"
        :style="{ 
          background: service.color + '15', 
          color: service.color 
        }"
      >
        {{ service.badge }}
      </span>
      
      <div class="arrow-indicator">
        <Icon icon="lucide:arrow-right" width="16" />
      </div>
    </div>

    <!-- 圖標 -->
    <div 
      class="icon-container"
      :style="{ background: service.color + '08' }"
    >
      <Icon 
        :icon="service.icon" 
        class="service-icon"
        :style="{ color: service.color }"
        width="56"
      />
    </div>

    <!-- 內容 -->
    <h3 class="service-title">{{ service.title }}</h3>
    <p class="service-desc">{{ service.desc }}</p>

    <!-- 底部提示 -->
    <div 
      class="explore-hint"
      :style="{ color: service.color }"
    >
      Explore Now
    </div>
  </div>
</template>

<style scoped>
.service-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all var(--transition-slow) var(--ease-spring);
}

.service-card:hover {
  border-color: transparent;
}

/* 頂部區域 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.service-badge {
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  padding: 0.375rem 1rem;
  border-radius: var(--radius-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.arrow-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal) var(--ease-spring);
}

.service-card:hover .arrow-indicator {
  background: var(--peixuan-purple);
  color: var(--text-inverse);
  transform: translateX(4px);
}

/* 圖標容器 */
.icon-container {
  width: 6rem;
  height: 6rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-xl);
  transition: transform var(--transition-slow) var(--ease-spring);
}

.service-card:hover .icon-container {
  transform: rotate(6deg) scale(1.05);
}

/* 文字 */
.service-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.service-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  text-align: center;
  margin-bottom: var(--space-xl);
  flex-grow: 1;
}

/* 底部提示 */
.explore-hint {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-align: center;
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.service-card:hover .explore-hint {
  opacity: 1;
}

/* 響應式 */
@media (max-width: 767px) {
  .service-card {
    padding: var(--space-2xl);
  }
  
  .icon-container {
    width: 5rem;
    height: 5rem;
  }
  
  .service-title {
    font-size: var(--font-size-2xl);
  }
  
  .service-desc {
    font-size: var(--font-size-base);
  }
}

/* 無障礙 */
.service-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 4px;
}
</style>
```

### 在 HomeView.vue 中使用

```vue
<script setup lang="ts">
import ServiceCard from '@/components/ServiceCard.vue';

const services = computed(() => [
  {
    id: 'calculate',
    icon: 'lucide:calculator',
    title: t('home.services.calculate.title'),
    desc: t('home.services.calculate.desc'),
    route: '/unified',
    color: '#8B4513',
    badge: t('home.services.calculate.badge'),
  },
  {
    id: 'ai-analysis',
    icon: 'lucide:search',
    title: t('home.services.aiAnalysis.title'),
    desc: t('home.services.aiAnalysis.desc'),
    route: '/analysis',
    color: '#9370DB',
    badge: t('home.services.aiAnalysis.badge'),
  },
  {
    id: 'daily-question',
    icon: 'lucide:message-circle',
    title: t('home.services.dailyQuestion.title'),
    desc: t('home.services.dailyQuestion.desc'),
    route: '/daily-question',
    color: '#D2691E',
    badge: t('home.services.dailyQuestion.badge'),
  },
]);
</script>

<template>
  <!-- Services Section -->
  <section class="services-section">
    <div class="section-container">
      <h2 class="section-title">
        {{ $t('home.services.title') }}
      </h2>
      
      <div class="services-grid">
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.services-section {
  background: var(--bg-soft);
  padding: var(--space-5xl) 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-xl);
}

/* 響應式 */
@media (max-width: 767px) {
  .services-section {
    padding: var(--space-3xl) 0;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}
</style>
```

---

## 🎨 Step 7: CTA Section 實現

```vue
<template>
  <!-- CTA Section -->
  <section class="cta-section">
    <div class="section-container">
      <div class="cta-card">
        <!-- 背景裝飾 -->
        <div class="cta-bg-decoration"></div>
        <Icon 
          icon="fluent-emoji-flat:unicorn" 
          class="cta-bg-icon"
          width="300"
        />
        
        <!-- 內容 -->
        <div class="cta-content">
          <h2 class="cta-title">
            {{ hasChart ? $t('home.cta.returning.subtitle') : $t('home.cta.new.subtitle') }}
          </h2>
          <p class="cta-desc">
            {{ hasChart ? $t('home.cta.returning.desc') : $t('home.cta.new.desc') }}
          </p>
          
          <el-button
            type="primary"
            size="large"
            class="btn-premium"
            @click="handleStart"
          >
            {{ hasChart ? $t('home.cta.returning.button') : $t('home.cta.new.button') }}
          </el-button>
          
          <div class="cta-footer">
            {{ $t('home.cta.footer') }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  padding: var(--space-5xl) 0;
}

.cta-card {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--text-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-5xl) var(--space-3xl);
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

/* 背景裝飾 */
.cta-bg-decoration {
  position: absolute;
  top: -5rem;
  left: -5rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, rgba(147, 112, 219, 0.1), transparent);
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.cta-bg-icon {
  position: absolute;
  bottom: -5rem;
  right: -5rem;
  opacity: 0.05;
  transform: rotate(-12deg);
  pointer-events: none;
}

/* 內容 */
.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  margin-bottom: var(--space-lg);
  letter-spacing: -0.02em;
  line-height: var(--line-height-tight);
}

.cta-desc {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: var(--space-3xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

.cta-footer {
  margin-top: var(--space-xl);
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

/* 響應式 */
@media (max-width: 767px) {
  .cta-section {
    padding: var(--space-3xl) 0;
  }
  
  .cta-card {
    padding: var(--space-3xl) var(--space-lg);
  }
  
  .btn-premium {
    width: 100%;
  }
}
</style>
```

---

## 📝 Step 8: i18n 文案更新

### 文件: `src/i18n/locales/zh_TW.json`

```json
{
  "home": {
    "hero": {
      "greeting": "嗨，我是佩璇",
      "tagline": "你的 AI 命理夥伴",
      "description": "融合傳統命理精粹與現代 AI 技術，為你揭開人生的藍圖，陪伴你度過每個重要的選擇時刻。",
      "cta": "立即啟程",
      "privacy": "100% 匿名使用 • 不蒐集個人資料"
    },
    "trust": {
      "title": "為什麼與佩璇對話？",
      "traditional": {
        "title": "精準雙系統",
        "desc": "整合八字四柱與紫微斗數，從多個維度交叉驗證，確保解讀的廣度與深度。"
      },
      "ai": {
        "title": "即時智慧分析",
        "desc": "採用頂尖 AI 模型，能在秒級時間內提供具備同理心與洞察力的文字回饋。"
      },
      "privacy": {
        "title": "純淨隱私環境",
        "desc": "我們不索取手機或信箱，您的資料僅供本次對話使用，離線即消失。"
      }
    },
    "journey": {
      "title": "輕鬆展開你的探索",
      "subtitle": "三個步驟，獲取專屬的人生指引",
      "step1": {
        "title": "靜心輸入資料",
        "desc": "提供出生日期與時間，這是我們建立連結的第一步。"
      },
      "step2": {
        "title": "AI 深度解碼",
        "desc": "佩璇將為你轉化繁複的星盤資訊，提煉出核心的人生建議。"
      },
      "step3": {
        "title": "獲得生命指引",
        "desc": "與佩璇進行深度的對話，解決當下的迷惘，看見未來的光。"
      }
    },
    "services": {
      "title": "專屬服務內容",
      "calculate": {
        "title": "核心命盤",
        "desc": "基礎能量場分析，了解你的五行性格與生命格局。",
        "badge": "Essential"
      },
      "aiAnalysis": {
        "title": "深度洞察",
        "desc": "針對事業、財運與感情提供十年大運與年度細節預測。",
        "badge": "Advanced"
      },
      "dailyQuestion": {
        "title": "隨身諮詢",
        "desc": "生活中遇到的疑難雜症，隨時透過 AI 獲取命理視角的建議。",
        "badge": "Interactive"
      }
    },
    "cta": {
      "new": {
        "subtitle": "準備好遇見更好的自己嗎？",
        "desc": "只需幾分鐘的靜心填寫，佩璇將為你開啟一段深入內心的旅程。",
        "button": "立即開始免費探索"
      },
      "returning": {
        "subtitle": "歡迎回來，探索者",
        "desc": "佩璇已經整合了最新的星象脈動，為你解讀今日的能量走向。",
        "button": "進入分析面板"
      },
      "footer": "匿名使用 • 不留個資 • 專業命理 AI"
    }
  }
}
```

---

## ✅ 實施檢查清單

### Phase 1: 基礎設施
- [ ] 安裝 `@iconify/vue` 和 `@vueuse/core`
- [ ] 更新 `design-tokens.css`
- [ ] 創建 `global.css`
- [ ] 在 `main.ts` 中導入全局樣式

### Phase 2: 組件開發
- [ ] 更新 `HomeView.vue` Hero Section
- [ ] 創建 `TrustCard.vue`
- [ ] 創建 `JourneyStep.vue`
- [ ] 更新 `ServiceCard.vue`

### Phase 3: 內容更新
- [ ] 更新 `zh_TW.json` i18n 文案
- [ ] 更新 `en.json` i18n 文案

### Phase 4: 測試驗證
- [ ] 桌面版視覺測試 (1920px, 1440px, 1024px)
- [ ] 移動版視覺測試 (768px, 375px, 320px)
- [ ] 深色模式測試
- [ ] 動畫性能測試
- [ ] 無障礙測試 (鍵盤導航 + 螢幕閱讀器)

---

**技術實施方案完成！準備開始實作。**
