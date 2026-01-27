# 佩璇前端重構 PRD (Product Requirements Document)

**版本**: v2.0.0-alpha  
**日期**: 2026-01-27  
**負責人**: Commander (Centralized Architect)  
**狀態**: Draft - Awaiting User Approval

---

## 📋 執行摘要 (Executive Summary)

### 重構目標
將佩璇從「功能導向的工具平台」升級為「情感連結的 AI 夥伴體驗」，透過首頁重新設計建立品牌認同與用戶信任。

### 核心問題 (Current Pain Points)
1. **品牌識別薄弱**: 首頁缺乏佩璇人物形象，用戶無法感知「與誰對話」
2. **資訊架構混亂**: 4 個服務卡片 + 3 個特色說明 + 快速入口，層級不清晰
3. **情感連結缺失**: 冷冰冰的功能列表，未傳達「夥伴」定位
4. **轉化路徑不明**: 新用戶不知道第一步該做什麼
5. **移動端體驗差**: 4 欄網格在手機上變 1 欄，視覺疲勞

### 成功指標 (Success Metrics)
- **品牌認知**: 用戶能在 5 秒內識別「佩璇」角色定位
- **轉化率**: 首次訪問到完成命盤計算的轉化率提升 30%
- **停留時間**: 首頁平均停留時間從 8 秒提升至 25 秒
- **移動端體驗**: 移動端跳出率降低 20%

---

## 🎯 產品定位 (Product Positioning)

### 從工具到夥伴的轉型
```
Before (v1.2.2):
「佩璇命理智慧分析平台」
→ 強調技術能力，但缺乏人格化

After (v2.0.0):
「佩璇 - 你的 AI 命理夥伴」
→ 強調關係與陪伴，建立情感連結
```

### 品牌人物設定 (Persona)
- **名字**: 佩璇 (Peixuan)
- **年齡**: 20 歲
- **性格**: 神秘可愛、專業但不嚴肅、溫暖陪伴
- **視覺符號**: 
  - 主圖標: 獨角獸輪廓 (SVG 線條圖標，非 emoji)
  - 輔助圖標: 星星、月亮、太極等命理元素
- **語氣**: 口語化、有溫度、偶爾俏皮

### 圖標系統設計
```typescript
// 推薦使用 Iconify Vue
// npm install @iconify/vue

// 圖標映射表
const iconMap = {
  // 品牌圖標
  peixuan: 'fluent-emoji-flat:unicorn',  // 獨角獸
  sparkle: 'lucide:sparkles',            // 閃光
  
  // 功能圖標
  calculate: 'lucide:calculator',        // 計算
  analysis: 'lucide:brain',              // 分析
  question: 'lucide:message-circle',     // 提問
  
  // 命理圖標
  bazi: 'mdi:yin-yang',                  // 八字
  ziwei: 'mdi:star-circle',              // 紫微
  fortune: 'lucide:crystal-ball',        // 運勢
  
  // 信任圖標
  traditional: 'lucide:scroll-text',     // 傳統
  ai: 'lucide:cpu',                      // AI
  privacy: 'lucide:shield-check',        // 隱私
}
```

---

## 🏗️ 資訊架構重構 (Information Architecture)

### 當前架構問題
```
HomeView.vue (當前)
├── Hero Section (主視覺)
├── Services Section (4 個服務卡片)
├── Daily Reminder Section (條件顯示)
├── Quick Access Section (快速入口)
└── Features Section (3 個特色說明)

問題:
1. 服務卡片與快速入口功能重疊
2. Features Section 位置太後面，用戶看不到
3. Daily Reminder 條件顯示邏輯不清晰
4. 缺乏明確的 CTA (Call-to-Action) 層級
```

### 新架構設計
```
HomeView.vue (v2.0.0)
├── Hero Section (品牌故事 + 主 CTA)
│   ├── 佩璇人物介紹 (視覺 + 文案)
│   ├── 核心價值主張 (一句話說明)
│   └── 主要 CTA (開始體驗)
│
├── Trust Section (信任建立)
│   ├── 社會證明 (用戶數/分析次數)
│   ├── 技術亮點 (AI + 傳統命理)
│   └── 安全承諾 (隱私保護)
│
├── Journey Section (用戶旅程)
│   ├── Step 1: 輸入生日 → 計算命盤
│   ├── Step 2: AI 分析 → 性格/運勢
│   └── Step 3: 每日一問 → 持續陪伴
│
├── Services Section (核心服務)
│   ├── 命盤計算 (基礎服務)
│   ├── AI 分析 (進階服務)
│   └── 每日一問 (持續服務)
│
└── CTA Section (行動呼籲)
    ├── 新用戶: 立即開始
    └── 回訪用戶: 繼續探索
```

---

## 🎨 視覺設計原則 (Visual Design Principles)

### 1. 品牌色彩系統
```css
/* design-tokens.css 更新 */

/* 主色調 - 保持現有 */
--primary-color: #8B4513;
--primary-light: #D2691E;
--primary-dark: #654321;

/* 新增 - 佩璇專屬色 */
--peixuan-purple: #9370DB;
--peixuan-pink: #FFB6C1;
--peixuan-gold: #FFD700;

/* 背景色系 */
--bg-soft: #FCF9F7;  /* 柔和背景 */

/* Glassmorphism 系統 */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: 20px;
```

### 2. 圓角系統 (採用雛形)
```css
/* 從 8px-16px 升級為 16px-64px */
--radius-xs: 0.5rem;   /* 8px */
--radius-sm: 1rem;     /* 16px */
--radius-md: 1.5rem;   /* 24px */
--radius-lg: 2.5rem;   /* 40px */
--radius-xl: 4rem;     /* 64px */
```

### 3. 陰影系統 (採用雛形)
```css
/* 細膩多層陰影 */
--shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
--shadow-hover: 0 20px 40px -10px rgba(139, 69, 19, 0.12);
--shadow-premium: 0 10px 25px -5px rgba(255, 215, 0, 0.4);
--shadow-premium-hover: 0 15px 35px -5px rgba(255, 215, 0, 0.5);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### 4. 緩動函數 (採用雛形)
```css
/* iOS 原生緩動曲線 */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 5. 動畫系統
```css
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

/* 漸入動畫 */
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
```

---

## 📱 響應式設計策略 (Responsive Design)

### 斷點定義
```css
/* Mobile First */
@media (min-width: 0px)    { /* 移動端 (320px-767px) */ }
@media (min-width: 768px)  { /* 平板 (768px-1023px) */ }
@media (min-width: 1024px) { /* 桌面 (1024px+) */ }
```

### 佈局策略
| Section | 移動端 | 平板 | 桌面 |
|---------|--------|------|------|
| Hero | 1 欄 | 1 欄 | 1 欄 (居中) |
| Trust | 1 欄 | 2 欄 | 3 欄 |
| Journey | 1 欄 (垂直) | 1 欄 (垂直) | 3 欄 (水平) |
| Services | 1 欄 | 2 欄 | 3 欄 |

---

## 🔧 技術實作約束 (Technical Constraints)

### 必須保持
1. **Vue 3 Composition API** + `<script setup>` 語法
2. **TypeScript 嚴格模式** (型別安全)
3. **Element Plus** 組件庫 (按鈕/卡片/對話框)
4. **Vue I18n** 雙語支援 (zh_TW / en)
5. **Pinia chartStore** 狀態管理
6. **CSS 變數系統** (design-tokens.css)

### 允許使用的套件
1. ✅ **圖標庫**: `@iconify/vue` (按需載入，150k+ 圖標)
2. ✅ **工具庫**: `@vueuse/core` (Composition API 工具集)

### 禁止使用
1. ❌ CSS 框架 (Tailwind/UnoCSS/Bootstrap - 與 Element Plus 衝突)
2. ❌ 重型動畫庫 (GSAP - 包大小 > 50KB)
3. ❌ jQuery 或其他過時庫
4. ❌ 內聯樣式 (必須使用 scoped CSS)

### 技術策略
- **CSS 方案**: 純 CSS 變數 + scoped CSS (無額外框架)
- **動畫方案**: 原生 CSS `@keyframes` + `transition`
- **響應式**: 原生 CSS `@media` queries
- **主題切換**: CSS 變數動態切換 (已實現)

### 性能要求
- **首屏載入**: < 2s (3G 網路)
- **Lighthouse 分數**: Performance > 90
- **包大小**: 新增代碼 < 50KB (gzipped)

---

## 📐 詳細設計規格 (Detailed Design Specifications)

### Section 1: Hero Section (品牌故事區)

#### 設計目標
- 3 秒內建立「佩璇是誰」的認知
- 傳達核心價值主張
- 引導用戶進入主要轉化路徑

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  [佩璇插圖 - SVG 獨角獸圖標]             │
│                                         │
│  嗨，我是佩璇                            │
│  你的 AI 命理夥伴                        │
│                                         │
│  結合傳統八字紫微與現代 AI 智慧          │
│  為你解讀命運密碼，陪伴人生每個轉折      │
│                                         │
│  [開始體驗] (主 CTA 按鈕)                │
│  已有 X,XXX 人與佩璇一起探索命運         │
└─────────────────────────────────────────┘
```

#### 技術規格
```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';

const userCount = ref(0);

onMounted(async () => {
  // 從 API 獲取用戶數量
  userCount.value = 1234; // 示例
});

const handleStartJourney = () => {
  router.push('/unified');
};
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      <!-- 佩璇視覺元素 -->
      <div class="hero-visual">
        <Icon 
          icon="fluent-emoji-flat:unicorn" 
          class="peixuan-avatar"
          width="120"
          height="120"
        />
        <Icon 
          icon="lucide:sparkles" 
          class="sparkle-effect sparkle-1"
          width="24"
        />
        <Icon 
          icon="lucide:sparkles" 
          class="sparkle-effect sparkle-2"
          width="20"
        />
      </div>

      <!-- 文案區域 -->
      <div class="hero-content">
        <h1 class="hero-greeting">
          {{ $t('home.hero.greeting') }}
        </h1>
        <p class="hero-tagline">
          {{ $t('home.hero.tagline') }}
        </p>
        <p class="hero-description">
          {{ $t('home.hero.description') }}
        </p>

        <!-- 主 CTA -->
        <el-button
          type="primary"
          size="large"
          class="hero-cta"
          @click="handleStartJourney"
        >
          {{ $t('home.hero.cta') }}
        </el-button>

        <!-- 社會證明 -->
        <p class="hero-social-proof">
          {{ $t('home.hero.socialProof', { count: userCount }) }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--peixuan-purple) 0%,
    var(--primary-color) 50%,
    var(--peixuan-pink) 100%
  );
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  padding: var(--space-3xl) var(--space-lg);
  text-align: center;
}

.hero-visual {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-2xl);
}

.peixuan-avatar {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

.sparkle-effect {
  position: absolute;
  color: var(--peixuan-gold);
  animation: twinkle 2s ease-in-out infinite;
}

.sparkle-1 {
  top: 10%;
  right: -10%;
  animation-delay: 0s;
}

.sparkle-2 {
  bottom: 15%;
  left: -5%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.hero-greeting {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  margin-bottom: var(--space-md);
}

.hero-cta {
  min-width: 200px;
  min-height: 56px;
  font-size: var(--font-size-lg);
  margin-top: var(--space-xl);
}

/* 移動端優化 */
@media (max-width: 767px) {
  .hero-section {
    min-height: 60vh;
  }
  
  .peixuan-avatar {
    width: 80px;
    height: 80px;
  }
  
  .hero-greeting {
    font-size: var(--font-size-2xl);
  }
}

/* 無障礙：減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .peixuan-avatar,
  .sparkle-effect {
    animation: none;
  }
}
</style>
```

#### i18n 文案
```json
{
  "home": {
    "hero": {
      "greeting": "嗨，我是佩璇",
      "tagline": "你的 AI 命理夥伴",
      "description": "結合傳統八字紫微與現代 AI 智慧，為你解讀命運密碼，陪伴人生每個轉折",
      "cta": "開始體驗",
      "socialProof": "已有 {count} 人與佩璇一起探索命運"
    }
  }
}
```

---

### Section 2: Trust Section (信任建立區)

#### 設計目標
- 建立專業可信度
- 突出技術優勢
- 消除用戶疑慮

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  為什麼選擇佩璇？                        │
│                                         │
│  [圖標] 傳統命理    [圖標] AI 智慧      │
│  八字 + 紫微       Gemini 3.0          │
│  雙系統驗證        即時分析             │
│                                         │
│  [圖標] 隱私保護                        │
│  匿名使用，資料加密                      │
└─────────────────────────────────────────┘
```

#### 技術規格
```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

const { t } = useI18n();

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
  <section class="trust-section">
    <div class="section-container">
      <h2 class="section-title">
        {{ $t('home.trust.title') }}
      </h2>
      
      <div class="trust-grid">
        <div
          v-for="item in trustItems"
          :key="item.id"
          class="trust-card"
        >
          <Icon 
            :icon="item.icon" 
            class="trust-icon"
            width="48"
            height="48"
          />
          <h3 class="trust-title">{{ item.title }}</h3>
          <p class="trust-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trust-section {
  background: var(--bg-secondary);
  padding: var(--space-3xl) 0;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
}

.trust-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
  transition: transform var(--transition-normal);
}

.trust-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.trust-icon {
  color: var(--primary-color);
  margin-bottom: var(--space-lg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}
</style>
```

---

### Section 3: Journey Section (用戶旅程區)

#### 設計目標
- 清晰展示使用流程
- 降低認知負擔
- 引導用戶完成第一步

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  開始你的命理探索之旅                    │
│                                         │
│  Step 1          Step 2          Step 3│
│  [圖標]          [圖標]          [圖標]│
│  輸入生日        AI 分析         每日陪伴│
│  計算命盤        性格/運勢       持續諮詢│
│                                         │
│  → → → → → → → → → → → → → → → → → → →│
└─────────────────────────────────────────┘
```

#### 技術規格
```vue
<template>
  <section class="journey-section">
    <div class="section-container">
      <h2 class="section-title">
        {{ $t('home.journey.title') }}
      </h2>
      
      <div class="journey-steps">
        <div
          v-for="(step, index) in journeySteps"
          :key="step.id"
          class="journey-step"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-icon">{{ step.icon }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-desc">{{ step.desc }}</p>
          
          <!-- 連接線 (最後一步不顯示) -->
          <div
            v-if="index < journeySteps.length - 1"
            class="step-connector"
          >
            →
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const journeySteps = computed(() => [
  {
    id: 'calculate',
    icon: 'lucide:calculator',
    title: t('home.journey.step1.title'),
    desc: t('home.journey.step1.desc'),
  },
  {
    id: 'analyze',
    icon: 'lucide:brain',
    title: t('home.journey.step2.title'),
    desc: t('home.journey.step2.desc'),
  },
  {
    id: 'companion',
    icon: 'lucide:message-circle',
    title: t('home.journey.step3.title'),
    desc: t('home.journey.step3.desc'),
  },
]);
</script>

<style scoped>
.journey-section {
  background: var(--bg-primary);
  padding: var(--space-3xl) 0;
}

.journey-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-2xl);
  position: relative;
}

.journey-step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-weight: var(--font-weight-bold);
}

.step-icon {
  font-size: 64px;
  margin-bottom: var(--space-lg);
}

.step-connector {
  position: absolute;
  top: 20px;
  right: -50%;
  font-size: 32px;
  color: var(--primary-light);
}

/* 移動端：垂直佈局，隱藏連接線 */
@media (max-width: 767px) {
  .journey-steps {
    grid-template-columns: 1fr;
  }
  
  .step-connector {
    display: none;
  }
}
</style>
```

---

### Section 4: Services Section (核心服務區)

#### 設計目標
- 簡化服務選項 (4 → 3)
- 突出核心價值
- 清晰的行動按鈕

#### 重構策略
```
Before (v1.2.2):
- 計算命盤
- 每日一問
- 性格分析
- 運勢分析

After (v2.0.0):
- 命盤計算 (基礎服務)
- AI 深度分析 (性格 + 運勢合併)
- 每日一問 (持續服務)
```

#### 技術規格
```vue
<template>
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
          @click="handleServiceClick(service)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ServiceCard from '@/components/ServiceCard.vue';

const router = useRouter();
const { t } = useI18n();

const services = computed(() => [
  {
    id: 'calculate',
    icon: 'lucide:calculator',
    title: t('home.services.calculate.title'),
    desc: t('home.services.calculate.desc'),
    route: '/unified',
    color: 'primary' as const,
    badge: t('home.services.calculate.badge'), // "基礎"
  },
  {
    id: 'ai-analysis',
    icon: 'lucide:brain',
    title: t('home.services.aiAnalysis.title'),
    desc: t('home.services.aiAnalysis.desc'),
    route: '/analysis',
    color: 'success' as const,
    badge: t('home.services.aiAnalysis.badge'), // "進階"
  },
  {
    id: 'daily-question',
    icon: 'lucide:message-circle',
    title: t('home.services.dailyQuestion.title'),
    desc: t('home.services.dailyQuestion.desc'),
    route: '/daily-question',
    color: 'info' as const,
    badge: t('home.services.dailyQuestion.badge'), // "持續"
  },
]);

const handleServiceClick = (service: typeof services.value[0]) => {
  router.push(service.route);
};
</script>

<style scoped>
.services-section {
  background: var(--bg-secondary);
  padding: var(--space-3xl) 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

/* 移動端：1 欄 */
@media (max-width: 767px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}

/* 平板：2 欄 */
@media (min-width: 768px) and (max-width: 1023px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面：3 欄 */
@media (min-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
```

---

### Section 5: CTA Section (行動呼籲區)

#### 設計目標
- 強化轉化路徑
- 區分新用戶/回訪用戶
- 提供明確的下一步

#### 視覺結構
```
┌─────────────────────────────────────────┐
│  準備好開始了嗎？                        │
│                                         │
│  [新用戶]                               │
│  立即開始你的命理探索之旅                │
│  [開始體驗] (主按鈕)                     │
│                                         │
│  [回訪用戶]                             │
│  歡迎回來！繼續你的探索                  │
│  [查看我的命盤] (次要按鈕)               │
└─────────────────────────────────────────┘
```

#### 技術規格
```vue
<template>
  <section class="cta-section">
    <div class="section-container">
      <h2 class="cta-title">
        {{ $t('home.cta.title') }}
      </h2>
      
      <!-- 新用戶 CTA -->
      <div v-if="!hasChart" class="cta-card cta-card--primary">
        <h3 class="cta-subtitle">
          {{ $t('home.cta.new.subtitle') }}
        </h3>
        <p class="cta-desc">
          {{ $t('home.cta.new.desc') }}
        </p>
        <el-button
          type="primary"
          size="large"
          class="cta-button"
          @click="handleStartJourney"
        >
          {{ $t('home.cta.new.button') }}
        </el-button>
      </div>
      
      <!-- 回訪用戶 CTA -->
      <div v-else class="cta-card cta-card--secondary">
        <h3 class="cta-subtitle">
          {{ $t('home.cta.returning.subtitle') }}
        </h3>
        <p class="cta-desc">
          {{ $t('home.cta.returning.desc') }}
        </p>
        <el-button
          type="primary"
          size="large"
          class="cta-button"
          @click="handleViewChart"
        >
          {{ $t('home.cta.returning.button') }}
        </el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const chartStore = useChartStore();
const { t } = useI18n();

const hasChart = computed(() => !!chartStore.currentChart?.chartId);

const handleStartJourney = () => {
  router.push('/unified');
};

const handleViewChart = () => {
  router.push('/analysis');
};
</script>

<style scoped>
.cta-section {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-light) 100%
  );
  padding: var(--space-3xl) 0;
}

.cta-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.cta-card {
  max-width: 600px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.cta-button {
  min-width: 200px;
  min-height: 56px;
  font-size: var(--font-size-lg);
  margin-top: var(--space-xl);
}
</style>
```

---

## 🗂️ 組件重構計畫 (Component Refactoring Plan)

### 需要重構的組件

#### 1. ServiceCard.vue (保留但優化)
**當前問題**:
- 顏色映射邏輯複雜
- 缺少 badge 樣式
- 懸停效果不夠明顯

**優化方向**:
```vue
<!-- 新增 badge 支援 -->
<span v-if="service.badge" class="service-card__badge">
  {{ service.badge }}
</span>

<!-- 優化懸停效果 -->
.service-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-xl);
}
```

#### 2. DailyReminderCard.vue (移除)
**原因**:
- 功能與 Daily Question 重疊
- 條件顯示邏輯複雜
- 用戶價值不明確

**替代方案**:
- 將提醒功能整合到 Daily Question 頁面
- 首頁僅保留服務入口

#### 3. 新增組件需求

##### TrustCard.vue (新增)
```vue
<script setup lang="ts">
interface TrustCardProps {
  icon: string;
  title: string;
  desc: string;
}

defineProps<TrustCardProps>();
</script>

<template>
  <div class="trust-card">
    <div class="trust-icon">{{ icon }}</div>
    <h3 class="trust-title">{{ title }}</h3>
    <p class="trust-desc">{{ desc }}</p>
  </div>
</template>

<style scoped>
.trust-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

.trust-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.trust-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.trust-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.trust-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>
```

##### JourneyStep.vue (新增)
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
      height="72"
    />
    <h3 class="step-title">{{ title }}</h3>
    <p class="step-desc">{{ desc }}</p>
    
    <Icon 
      v-if="showConnector"
      icon="lucide:arrow-right"
      class="step-connector"
      width="32"
      height="32"
    />
  </div>
</template>

<style scoped>
.journey-step {
  text-align: center;
  position: relative;
  padding: var(--space-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.journey-step:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  box-shadow: var(--shadow-orange);
}

.step-icon {
  color: var(--primary-color);
  margin-bottom: var(--space-lg);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.step-connector {
  position: absolute;
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  color: var(--primary-light);
  z-index: 1;
}

/* 移動端隱藏連接線 */
@media (max-width: 767px) {
  .step-connector {
    display: none;
  }
}

/* 無障礙：減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .step-icon {
    animation: none;
  }
}
</style>
```

---

## 🌐 國際化文案 (i18n Content)

### zh_TW.json (繁體中文)
```json
{
  "home": {
    "hero": {
      "greeting": "嗨，我是佩璇",
      "tagline": "你的 AI 命理夥伴",
      "description": "結合傳統八字紫微與現代 AI 智慧，為你解讀命運密碼，陪伴人生每個轉折",
      "cta": "開始體驗",
      "socialProof": "已有 {count} 人與佩璇一起探索命運"
    },
    "trust": {
      "title": "為什麼選擇佩璇？",
      "traditional": {
        "title": "傳統命理",
        "desc": "八字四柱 + 紫微斗數雙系統驗證，確保分析精準度"
      },
      "ai": {
        "title": "AI 智慧",
        "desc": "Google Gemini 3.0 即時分析，提供深度個性化解讀"
      },
      "privacy": {
        "title": "隱私保護",
        "desc": "匿名使用，資料加密，你的命盤只有你知道"
      }
    },
    "journey": {
      "title": "開始你的命理探索之旅",
      "step1": {
        "title": "輸入生日",
        "desc": "提供出生年月日時，系統自動計算八字與紫微命盤"
      },
      "step2": {
        "title": "AI 分析",
        "desc": "佩璇深度解讀你的性格特質與運勢走向"
      },
      "step3": {
        "title": "每日陪伴",
        "desc": "隨時向佩璇提問，獲得專屬的命理指導"
      }
    },
    "services": {
      "title": "核心服務",
      "calculate": {
        "title": "命盤計算",
        "desc": "精準計算八字四柱與紫微斗數命盤",
        "badge": "基礎"
      },
      "aiAnalysis": {
        "title": "AI 深度分析",
        "desc": "性格解讀 + 運勢預測，全方位了解自己",
        "badge": "進階"
      },
      "dailyQuestion": {
        "title": "每日一問",
        "desc": "向佩璇提問，獲得即時的命理諮詢",
        "badge": "持續"
      }
    },
    "cta": {
      "title": "準備好開始了嗎？",
      "new": {
        "subtitle": "立即開始你的命理探索之旅",
        "desc": "只需 3 分鐘，就能獲得專屬的命盤分析",
        "button": "開始體驗"
      },
      "returning": {
        "subtitle": "歡迎回來！",
        "desc": "繼續你的命理探索，佩璇隨時為你服務",
        "button": "查看我的命盤"
      }
    }
  }
}
```

### en.json (英文)
```json
{
  "home": {
    "hero": {
      "greeting": "Hi, I'm Peixuan",
      "tagline": "Your AI Astrology Companion",
      "description": "Combining traditional BaZi & ZiWei with modern AI to decode your destiny and accompany you through life's journey",
      "cta": "Get Started",
      "socialProof": "{count} people have explored their destiny with Peixuan"
    },
    "trust": {
      "title": "Why Choose Peixuan?",
      "traditional": {
        "title": "Traditional Wisdom",
        "desc": "BaZi + ZiWei dual-system verification for accurate analysis"
      },
      "ai": {
        "title": "AI Intelligence",
        "desc": "Google Gemini 3.0 real-time analysis for deep personalized insights"
      },
      "privacy": {
        "title": "Privacy Protected",
        "desc": "Anonymous usage, encrypted data - your chart is yours alone"
      }
    },
    "journey": {
      "title": "Start Your Astrology Journey",
      "step1": {
        "title": "Enter Birth Info",
        "desc": "Provide your birth date & time, system auto-calculates BaZi & ZiWei charts"
      },
      "step2": {
        "title": "AI Analysis",
        "desc": "Peixuan deeply interprets your personality traits and fortune trends"
      },
      "step3": {
        "title": "Daily Companion",
        "desc": "Ask Peixuan anytime for personalized astrology guidance"
      }
    },
    "services": {
      "title": "Core Services",
      "calculate": {
        "title": "Chart Calculation",
        "desc": "Accurate BaZi & ZiWei chart calculation",
        "badge": "Basic"
      },
      "aiAnalysis": {
        "title": "AI Deep Analysis",
        "desc": "Personality + Fortune prediction for comprehensive self-understanding",
        "badge": "Advanced"
      },
      "dailyQuestion": {
        "title": "Daily Question",
        "desc": "Ask Peixuan for instant astrology consultation",
        "badge": "Ongoing"
      }
    },
    "cta": {
      "title": "Ready to Begin?",
      "new": {
        "subtitle": "Start Your Astrology Journey Now",
        "desc": "Get your personalized chart analysis in just 3 minutes",
        "button": "Get Started"
      },
      "returning": {
        "subtitle": "Welcome Back!",
        "desc": "Continue your astrology exploration, Peixuan is here for you",
        "button": "View My Chart"
      }
    }
  }
}
```

---

## 📊 實施計畫 (Implementation Plan)

### Phase 1: 基礎架構 (Week 1)
**目標**: 建立新組件與資訊架構

#### 任務清單
- [ ] 安裝 `@iconify/vue` 套件
- [ ] 創建 `TrustCard.vue` 組件 (使用 Iconify)
- [ ] 創建 `JourneyStep.vue` 組件 (使用 Iconify)
- [ ] 更新 `ServiceCard.vue` (新增 badge 支援 + Iconify 整合)
- [ ] 新增 CSS 變數 (peixuan-purple, peixuan-pink, peixuan-gold)
- [ ] 更新 i18n 文案 (zh_TW.json, en.json - 移除所有 emoji)

#### 驗收標準
- [ ] 所有新組件通過 TypeScript 編譯
- [ ] Iconify 圖標正常顯示
- [ ] i18n 文案無遺漏鍵值
- [ ] 無 console 錯誤或警告

---

### Phase 2: Hero Section 重構 (Week 1-2)
**目標**: 完成品牌故事區域

#### 任務清單
- [ ] 重構 `HomeView.vue` Hero Section
- [ ] 實作佩璇頭像動畫 (float effect)
- [ ] 實作社會證明數據 (userCount)
- [ ] 響應式測試 (320px - 1920px)
- [ ] 無障礙測試 (鍵盤導航 + 螢幕閱讀器)

#### 驗收標準
- [ ] Hero Section 在 3 秒內建立品牌認知
- [ ] 移動端動畫效果流暢 (60fps)
- [ ] 通過 Lighthouse Accessibility 測試 (>90)

---

### Phase 3: Trust + Journey Section (Week 2)
**目標**: 完成信任建立與用戶旅程區域

#### 任務清單
- [ ] 實作 Trust Section (3 個 TrustCard)
- [ ] 實作 Journey Section (3 個 JourneyStep)
- [ ] 實作步驟連接線動畫
- [ ] 響應式佈局測試

#### 驗收標準
- [ ] Trust Section 卡片懸停效果流暢
- [ ] Journey Section 在桌面版顯示水平佈局
- [ ] 移動端自動切換為垂直佈局

---

### Phase 4: Services + CTA Section (Week 3)
**目標**: 完成服務展示與行動呼籲區域

#### 任務清單
- [ ] 重構 Services Section (4 → 3 服務)
- [ ] 實作 CTA Section (新用戶/回訪用戶邏輯)
- [ ] 整合 chartStore 狀態判斷
- [ ] 路由導航測試

#### 驗收標準
- [ ] Services Section 正確顯示 3 個服務
- [ ] CTA Section 根據用戶狀態動態切換
- [ ] 所有按鈕導航正確

---

### Phase 5: 整合測試與優化 (Week 3-4)
**目標**: 完整測試與性能優化

#### 任務清單
- [ ] 端到端測試 (E2E)
- [ ] 性能優化 (Lighthouse Performance > 90)
- [ ] 包大小檢查 (< 50KB gzipped)
- [ ] 跨瀏覽器測試 (Chrome, Safari, Firefox)
- [ ] 移動端真機測試 (iOS, Android)

#### 驗收標準
- [ ] 首屏載入時間 < 2s (3G 網路)
- [ ] 無 console 錯誤或警告
- [ ] 所有動畫支援 `prefers-reduced-motion`
- [ ] 通過 WCAG 2.1 AA 標準

---

### Phase 6: 部署與監控 (Week 4)
**目標**: 上線並監控用戶反饋

#### 任務清單
- [ ] 部署到 Staging 環境
- [ ] A/B 測試設定 (舊版 vs 新版)
- [ ] 用戶行為追蹤 (Google Analytics)
- [ ] 收集用戶反饋

#### 驗收標準
- [ ] Staging 環境無錯誤
- [ ] 轉化率提升 > 20%
- [ ] 用戶停留時間提升 > 15 秒

---

## 🚨 風險評估 (Risk Assessment)

### 高風險項目
1. **品牌認知變化**
   - **風險**: 用戶可能不適應新的品牌形象
   - **緩解**: A/B 測試，逐步推出

2. **性能回退**
   - **風險**: 新動畫可能影響移動端性能
   - **緩解**: 嚴格的性能預算，移動端禁用複雜動畫

3. **i18n 文案遺漏**
   - **風險**: 英文翻譯可能不準確
   - **緩解**: 專業翻譯審核

### 中風險項目
1. **響應式佈局問題**
   - **風險**: 某些設備尺寸可能顯示異常
   - **緩解**: 完整的設備測試矩陣

2. **無障礙合規性**
   - **風險**: 新動畫可能影響無障礙體驗
   - **緩解**: 完整支援 `prefers-reduced-motion`

---

## 📈 成功指標追蹤 (Success Metrics Tracking)

### 量化指標
| 指標 | 當前值 (v1.2.2) | 目標值 (v2.0.0) | 測量方式 |
|------|----------------|----------------|----------|
| 首頁停留時間 | 8 秒 | 25 秒 | Google Analytics |
| 首次訪問轉化率 | 12% | 18% | 完成命盤計算比例 |
| 移動端跳出率 | 45% | 30% | Google Analytics |
| Lighthouse Performance | 85 | 90+ | Chrome DevTools |
| Lighthouse Accessibility | 88 | 95+ | Chrome DevTools |

### 質化指標
- **品牌認知**: 用戶訪談，5 秒測試
- **情感連結**: NPS (Net Promoter Score)
- **易用性**: SUS (System Usability Scale)

---

## 🔄 迭代計畫 (Iteration Plan)

### v2.0.1 (Post-Launch)
- 根據用戶反饋微調文案
- 優化動畫效果
- 修復 Bug

### v2.1.0 (Future)
- 新增用戶評價區域
- 新增常見問題 FAQ
- 新增教學引導 (Onboarding)

---

## 📝 附錄 (Appendix)

### A. 設計參考
- **色彩靈感**: Dribbble - Astrology App Designs
- **動畫參考**: CodePen - CSS Animations
- **佈局參考**: Awwwards - Landing Pages

### B. 技術文檔
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Element Plus Dark Mode](https://element-plus.org/en-US/guide/dark-mode.html)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### C. 相關決策記錄
- [DECISIONS.md](/.specify/memory/DECISIONS.md)
- [knowledge_graph.mem](/.specify/memory/knowledge_graph.mem)

---

## ✅ 審批流程 (Approval Process)

### 需要審批的項目
- [ ] **產品經理**: 確認產品定位與功能範圍
- [ ] **設計師**: 確認視覺設計與品牌一致性
- [ ] **前端工程師**: 確認技術可行性與工作量
- [ ] **用戶研究**: 確認用戶需求與痛點

### 審批狀態
- **狀態**: Draft - Awaiting User Approval
- **創建日期**: 2026-01-27
- **預計審批日期**: 2026-01-28

---

**文檔結束**

*本 PRD 由 Commander (Centralized Architect) 撰寫，基於佩璇 v1.2.2 現狀分析與產品定位重新設計。*
