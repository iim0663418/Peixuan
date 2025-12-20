<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const LanguageSelector = defineAsyncComponent(
  () => import('@/components/LanguageSelector.vue'),
);

const route = useRoute();
const router = useRouter();
const chartStore = useChartStore();
const { t } = useI18n();
const showMobileMenu = ref(false);

const hasChartData = computed(() => chartStore.hasChart);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    window.document.body.style.overflow = 'hidden';
  } else {
    window.document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  window.document.body.style.overflow = '';
};

const handleAIAnalysis = () => {
  if (!hasChartData.value) {
    const chartId = chartStore.loadFromLocalStorage();
    if (!chartId) {
      ElMessage({
        message: t('navigation.messages.needChartForPersonality'),
        type: 'info',
        duration: 2000,
      });
      router.push('/unified');
      closeMobileMenu();
      return;
    }
  }
  router.push('/personality');
  closeMobileMenu();
};

const handleAdvancedAnalysis = () => {
  if (!hasChartData.value) {
    const chartId = chartStore.loadFromLocalStorage();
    if (!chartId) {
      ElMessage({
        message: t('navigation.messages.needChartForFortune'),
        type: 'info',
        duration: 2000,
      });
      router.push('/unified');
      closeMobileMenu();
      return;
    }
  }
  router.push('/fortune');
  closeMobileMenu();
};
</script>

<template>
  <header class="app-header">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <h1>{{ $t('common.app_name') }}</h1>
        </router-link>
        <span class="brand-subtitle">{{ $t('common.brand_subtitle') }}</span>
      </div>

      <!-- 桌面版導航菜單 -->
      <div class="nav-menu desktop-menu">
        <router-link
          to="/"
          class="nav-link"
          :class="{ active: route?.path === '/' }"
        >
          {{ $t('navigation.home') }}
        </router-link>

        <router-link
          to="/unified"
          class="nav-link"
          :class="{ active: route?.path?.startsWith('/unified') }"
        >
          {{ $t('astrology.unified') }}
        </router-link>

        <router-link
          to="/daily-question"
          class="nav-link"
          :class="{ active: route?.path === '/daily-question' }"
        >
          {{ $t('navigation.dailyQuestion') }}
        </router-link>

        <button
          class="nav-link ai-analysis-btn"
          :class="{
            active: route?.path === '/personality',
          }"
          @click="handleAIAnalysis"
        >
          <span>{{ $t('navigation.personality') }}</span>
        </button>
        <button
          class="nav-link advanced-analysis-btn"
          :class="{
            active: route?.path === '/fortune',
          }"
          @click="handleAdvancedAnalysis"
        >
          <span>{{ $t('navigation.fortune') }}</span>
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
        :class="{ active: route?.path === '/' }"
        @click="closeMobileMenu"
      >
        {{ $t('navigation.home') }}
      </router-link>

      <router-link
        to="/unified"
        class="mobile-nav-link"
        :class="{ active: route?.path?.startsWith('/unified') }"
        @click="closeMobileMenu"
      >
        {{ $t('astrology.unified') }}
      </router-link>

      <router-link
        to="/daily-question"
        class="mobile-nav-link"
        :class="{ active: route?.path === '/daily-question' }"
        @click="closeMobileMenu"
      >
        {{ $t('navigation.dailyQuestion') }}
      </router-link>

      <a
        href="/personality"
        class="mobile-nav-link"
        :class="{
          active: route?.path === '/personality',
        }"
        @click.prevent="handleAIAnalysis"
      >
        {{ $t('navigation.personality') }}
      </a>
      <a
        href="/fortune"
        class="mobile-nav-link"
        :class="{
          active: route?.path === '/fortune',
        }"
        @click.prevent="handleAdvancedAnalysis"
      >
        {{ $t('navigation.fortune') }}
      </a>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #ffffff 0%, #fdf7f0 100%);
  border-bottom: 1px solid #e9dcc9;
  box-shadow: 0 2px 10px rgba(139, 69, 19, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-brand .brand-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #8b4513;
  transition: color 0.3s;
}

.brand-subtitle {
  font-size: 0.8rem;
  color: #d2691e;
  font-weight: 500;
  margin-top: 2px;
}

.nav-brand .brand-link:hover h1 {
  color: #d2691e;
}

.desktop-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #8b4513;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease-in-out;
  position: relative;
  min-height: 44px;
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.nav-link:hover {
  color: #d2691e;
  background: rgba(210, 105, 30, 0.1);
}

.nav-link.active {
  color: white;
  background: linear-gradient(135deg, #d2691e, #ff8c00);
  box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
}

.ai-analysis-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.ai-analysis-btn .icon {
  font-size: 1.2rem;
}

.ai-analysis-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
  pointer-events: none;
}

.ai-analysis-btn:not(.disabled):hover {
  transform: translateY(-1px);
}

.advanced-analysis-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.advanced-analysis-btn:hover {
  transform: translateY(-1px);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-button {
  display: flex;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
  justify-content: space-around;
  align-items: center;
  position: relative;
  z-index: 1000;
}

.mobile-menu-button span {
  width: 24px;
  height: 3px;
  background: #8b4513;
  transition: all 0.3s ease-in-out;
  border-radius: 2px;
}

.mobile-menu-button.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-button.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-button.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #fdf7f0 100%);
  padding: clamp(5rem, 15vh, 8rem) clamp(1.5rem, 5vw, 2rem) 2rem;
  box-shadow: 0 4px 30px rgba(139, 69, 19, 0.2);
  z-index: 999;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-100%);
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out,
    visibility 0.3s;
}

.mobile-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #8b4513;
  font-weight: 600;
  padding: 1rem;
  min-height: 60px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease-in-out;
  font-size: 1.1rem;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
}

.mobile-nav-link:hover {
  color: #d2691e;
  background: rgba(210, 105, 30, 0.1);
  transform: translateX(8px);
}

.mobile-nav-link.active {
  color: #d2691e;
  background: linear-gradient(90deg, rgba(210, 105, 30, 0.15), transparent);
  border-left: 4px solid #d2691e;
  padding-left: calc(1rem - 4px);
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* 中型手機和平板 (480px+) */
@media (min-width: 480px) {
  .navbar {
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .nav-brand h1 {
    font-size: clamp(1.3rem, 3vw, 1.5rem);
  }

  .brand-subtitle {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  }

  .mobile-menu {
    padding: clamp(1rem, 2vw, 1.5rem);
  }
}

/* 中型手機和平板 (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .desktop-menu {
    gap: 1.5rem;
  }
}

/* 平板 (768px+) */
@media (min-width: 768px) {
  .navbar {
    padding: 1rem 2rem;
  }

  .nav-brand h1 {
    font-size: 1.8rem;
  }

  .brand-subtitle {
    font-size: 0.8rem;
  }

  .desktop-menu {
    display: flex;
  }

  .mobile-menu-button {
    display: none;
  }

  .mobile-menu {
    display: none;
  }
}

/* 桌面 (1024px+) */
@media (min-width: 1024px) {
  .desktop-menu {
    gap: 2.5rem;
  }
}

/* 小螢幕 */
@media (max-width: 767px) {
  .desktop-menu {
    display: none !important;
  }

  .mobile-menu-button {
    display: flex !important;
  }
}

/* 中型解析度優化 (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .navbar {
    padding: 0.875rem 1.25rem;
  }

  .nav-brand h1 {
    font-size: 1.2rem;
  }
}

/* 小螢幕手機特定樣式 */
@media (max-width: 479px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .nav-brand h1 {
    font-size: 1rem;
  }

  .brand-subtitle {
    font-size: 0.6rem;
  }

  .mobile-menu {
    padding: clamp(0.75rem, 2vw, 1rem);
  }
}

/* 深色模式下的 mobile button 樣式 */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-bottom-color: #374151;
  }

  .nav-brand h1 {
    color: #f0e68c;
  }

  .brand-subtitle {
    color: #d97706;
  }

  .nav-link {
    color: #e5e7eb;
  }

  .nav-link:hover {
    color: #f0e68c;
    background: rgba(240, 230, 140, 0.1);
  }

  .mobile-menu {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-top-color: #374151;
  }

  .mobile-nav-link {
    color: #e5e7eb;
    border-bottom-color: #374151;
  }

  .mobile-nav-link:hover {
    color: #f0e68c;
    background: rgba(240, 230, 140, 0.1);
  }

  .mobile-nav-link.active {
    color: #f0e68c;
    background: linear-gradient(90deg, rgba(240, 230, 140, 0.15), transparent);
    border-left-color: #f0e68c;
  }

  .mobile-menu-button span {
    background: #e5e7eb;
  }
}
</style>
