<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import ServiceCard from '@/components/ServiceCard.vue';

const router = useRouter();
const chartStore = useChartStore();

// 檢測是否有保存的命盤
const hasChart = computed(() => !!chartStore.currentChart?.chartId);

// 服務列表配置
const services = [
  {
    id: 'calculate',
    icon: '📊',
    title: '整合命盤計算',
    desc: '八字與紫微斗數雙重分析,提供完整命盤資訊',
    route: '/unified',
    color: 'primary' as const,
  },
  {
    id: 'personality',
    icon: '💬',
    title: '佩璇性格分析',
    desc: 'AI 驅動的深度性格解讀,了解真實的自己',
    route: '/personality',
    color: 'success' as const,
  },
  {
    id: 'fortune',
    icon: '🔮',
    title: '佩璇運勢分析',
    desc: '幫你看流年運勢、四化能量,還有明年會怎樣喔 💫',
    route: '/fortune',
    color: 'warning' as const,
  },
  {
    id: 'daily',
    icon: '📅',
    title: '每日運勢提醒',
    desc: '輕量化每日吉凶提示,快速掌握今日運勢',
    route: '/daily',
    color: 'info' as const,
    badge: 'NEW',
  },
];

// 特色說明列表
const features = [
  {
    icon: '💯',
    title: '分析更準確',
    desc: '八字與紫微斗數雙重驗證,結果更可靠',
  },
  {
    icon: '💬',
    title: '解讀更易懂',
    desc: 'AI 幫你把複雜的命理轉成白話文',
  },
  {
    icon: '⚡',
    title: '隨時能查看',
    desc: '保存你的命盤,隨時回來看都很快',
  },
];

// 快速入口導航
const quickStart = () => {
  router.push('/unified');
};
</script>

<template>
  <div class="home-view">
    <!-- Hero Section (主視覺區域) -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">佩璇命理智能分析平台</h1>
        <p class="hero-subtitle">傳統命理智慧,現代科技精算</p>
        <p class="hero-description">
          結合八字與紫微斗數的專業分析,運用 AI 技術提供易懂的命理解讀
        </p>
      </div>
    </section>

    <!-- Services Section (服務卡片區域) -->
    <section class="services-section">
      <div class="section-container">
        <h2 class="section-title">服務項目</h2>
        <div class="service-grid">
          <ServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
          />
        </div>
      </div>
    </section>

    <!-- Quick Access Section (快速入口區域) -->
    <section class="quick-access-section">
      <div class="section-container">
        <div class="quick-access-card">
          <div v-if="hasChart" class="quick-access-content">
            <h3 class="quick-access-title">歡迎回來!</h3>
            <p class="quick-access-desc">您有已保存的命盤</p>
            <button class="quick-access-btn" @click="quickStart">
              繼續查看命盤
            </button>
          </div>
          <div v-else class="quick-access-content">
            <h3 class="quick-access-title">開始探索</h3>
            <p class="quick-access-desc">立即開始您的命理分析之旅</p>
            <button class="quick-access-btn" @click="quickStart">
              開始計算命盤
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section (特色說明區域) -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">平台特色</h2>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--bg-primary, #f7f8fa);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(
    135deg,
    var(--primary-lightest) 0%,
    var(--bg-secondary) 50%,
    var(--primary-lightest) 100%
  );
  padding: var(--space-5xl, 3rem) var(--space-lg, 1.5rem);
  text-align: center;
  border-bottom: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

/* 增加漸層裝飾效果 */
.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(210, 105, 30, 0.05) 0%,
    transparent 70%
  );
  animation: subtle-pulse 8s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: var(--font-size-4xl, 2.25rem);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin: 0 0 var(--space-lg, 1.5rem) 0;
  line-height: var(--line-height-tight);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-xl, 1.25rem);
  color: var(--primary-dark);
  margin: 0 0 var(--space-xl, 2rem) 0;
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
}

.hero-description {
  font-size: var(--font-size-base, 1rem);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Section Container */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl, 3rem) var(--space-lg, 1.5rem);
}

.section-title {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 600;
  color: var(--text-primary, #303133);
  text-align: center;
  margin: 0 0 var(--space-2xl, 3rem) 0;
}

/* Services Section */
.services-section {
  background: var(--bg-secondary, #ffffff);
  padding: var(--space-2xl, 3rem) 0;
}

.service-grid {
  display: grid;
  gap: var(--space-xl, 2rem);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Quick Access Section */
.quick-access-section {
  background: var(--bg-primary, #f7f8fa);
  padding: var(--space-2xl, 3rem) 0;
}

.quick-access-card {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-light) 100%
  );
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  color: var(--text-inverse);
  box-shadow: var(--shadow-orange);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.quick-access-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: rotate-gradient 10s linear infinite;
}

@keyframes rotate-gradient {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.quick-access-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(210, 105, 30, 0.25);
}

.quick-access-content {
  position: relative;
  z-index: 1;
}

.quick-access-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-md) 0;
  color: var(--text-inverse);
}

.quick-access-desc {
  font-size: var(--font-size-base);
  margin: 0 0 var(--space-2xl) 0;
  opacity: 0.95;
  line-height: var(--line-height-normal);
  color: var(--text-inverse);
}

.quick-access-btn {
  background: var(--bg-secondary);
  color: var(--primary-color);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-lg) var(--space-2xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 44px;
  min-width: 160px;
  box-shadow: var(--shadow-sm);
}

.quick-access-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-md);
  background: var(--text-inverse);
}

/* Features Section */
.features-section {
  background: var(--bg-secondary, #ffffff);
  padding: var(--space-2xl, 3rem) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl, 2rem);
}

.feature-card {
  text-align: center;
  padding: var(--space-lg, 1.5rem);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md, 1rem);
}

.feature-title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 var(--space-sm, 0.5rem) 0;
}

.feature-desc {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-secondary, #606266);
  line-height: 1.6;
  margin: 0;
}

/* 響應式設計 */
/* 移動版 (1 欄) */
@media (max-width: 767px) {
  .hero-section {
    padding: var(--space-3xl) var(--space-lg);
  }

  .hero-title {
    font-size: var(--font-size-2xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  .hero-description {
    font-size: var(--font-size-sm);
  }

  .section-container {
    padding: var(--space-2xl) var(--space-lg);
  }

  .section-title {
    font-size: var(--font-size-xl);
    margin-bottom: var(--space-xl);
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .quick-access-card {
    padding: var(--space-2xl) var(--space-lg);
  }

  .quick-access-title {
    font-size: var(--font-size-xl);
  }

  .quick-access-btn {
    width: 100%;
    min-width: auto;
  }
}

/* 平板版 (2 欄) */
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-section {
    padding: var(--space-4xl) var(--space-xl);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .service-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面版 (4 欄) */
@media (min-width: 1024px) {
  .service-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 無障礙增強 - 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .hero-section::before,
  .quick-access-card::before,
  .service-grid {
    animation: none;
  }

  * {
    transition: none !important;
  }
}
</style>
