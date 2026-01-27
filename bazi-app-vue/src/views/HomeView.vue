<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { Icon } from '@iconify/vue';
import ServiceCard from '@/components/ServiceCard.vue';
import JourneyStep from '@/components/JourneyStep.vue';

const router = useRouter();
const chartStore = useChartStore();
const { t } = useI18n();

// 檢測是否有保存的命盤
const hasChart = computed(() => !!chartStore.currentChart?.chartId);

onMounted(() => {
  // 嘗試從 localStorage 載入歷史記錄
  chartStore.loadFromLocalStorage();
});

// 服務列表配置
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
    route: '/personality',
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

// 特色說明列表
const features = computed(() => [
  {
    icon: 'lucide:target',
    title: t('home.features.accurate_title'),
    desc: t('home.features.accurate_desc'),
  },
  {
    icon: 'lucide:book-open',
    title: t('home.features.readable_title'),
    desc: t('home.features.readable_desc'),
  },
  {
    icon: 'lucide:zap',
    title: t('home.features.accessible_title'),
    desc: t('home.features.accessible_desc'),
  },
]);

// Journey Section 配置
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

// Hero Section & CTA 處理
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
            {{ $t('home.hero.greeting') }}<br />
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

    <!-- Features Section (特色說明區域) -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">
          {{ $t('home.features.title') }}
        </h2>
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >
            <div class="icon-container">
              <Icon :icon="feature.icon" width="32" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section (服務卡片區域) -->
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
          <div class="journey-line" />

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

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <!-- 背景裝飾 -->
          <div class="cta-bg-decoration" />
          <Icon
            icon="fluent-emoji-flat:unicorn"
            class="cta-bg-icon"
            width="300"
          />

          <!-- 內容 -->
          <div class="cta-content">
            <h2 class="cta-title">
              {{
                hasChart
                  ? $t('home.cta.returning.subtitle')
                  : $t('home.cta.new.subtitle')
              }}
            </h2>
            <p class="cta-desc">
              {{
                hasChart
                  ? $t('home.cta.returning.desc')
                  : $t('home.cta.new.desc')
              }}
            </p>

            <el-button
              type="primary"
              size="large"
              class="btn-premium"
              @click="handleStart"
            >
              {{
                hasChart
                  ? $t('home.cta.returning.button')
                  : $t('home.cta.new.button')
              }}
            </el-button>

            <div class="cta-footer">
              {{ $t('home.cta.footer') }}
            </div>
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
    radial-gradient(
      circle at top right,
      rgba(147, 112, 219, 0.2),
      transparent 40%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(210, 105, 30, 0.1),
      transparent 40%
    ),
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

/* ========== Journey Section ========== */
.journey-section {
  background: var(--bg-primary);
  padding: var(--space-5xl, 8rem) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-4xl, 6rem);
}

.section-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-tertiary);
  margin-top: var(--space-md);
}

.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-2xl, 3rem);
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

/* Services Section */
.services-section {
  background: var(--bg-soft);
  padding: var(--space-5xl) 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-xl);
}

/* CTA Section */
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
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-hover);
}

.feature-card .icon-container {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.feature-card:hover .icon-container {
  box-shadow: var(--shadow-hover);
  transform: scale(1.1);
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

  .section-container {
    padding: var(--space-2xl) var(--space-lg);
  }

  .section-title {
    font-size: var(--font-size-xl);
    margin-bottom: var(--space-xl);
  }

  .journey-section {
    padding: var(--space-3xl, 4rem) 0;
  }

  .journey-line {
    display: none;
  }

  .journey-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl, 2rem);
  }

  .services-section {
    padding: var(--space-3xl) 0;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

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

/* 平板版 (2 欄) */
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-section {
    padding: var(--space-4xl) var(--space-xl);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .journey-line {
    display: none;
  }

  .journey-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }

  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面版 (3 欄) */
@media (min-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(3, 1fr);
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
