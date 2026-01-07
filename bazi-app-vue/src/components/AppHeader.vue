<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useTheme, type Theme } from '@/composables/useTheme';
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue';

const LanguageSelector = defineAsyncComponent(
  () => import('@/components/LanguageSelector.vue'),
);

const route = useRoute();
const router = useRouter();
const chartStore = useChartStore();
const { t } = useI18n();
const { theme, setTheme } = useTheme();
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

const themeOptions = computed(() => [
  { value: 'light' as Theme, icon: Sunny, label: t('theme.light') },
  { value: 'dark' as Theme, icon: Moon, label: t('theme.dark') },
  { value: 'auto' as Theme, icon: Monitor, label: t('theme.auto') },
]);

const currentThemeIcon = computed(() => {
  const option = themeOptions.value.find((opt) => opt.value === theme.value);
  return option?.icon || Monitor;
});

const cycleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'auto'];
  const currentIndex = themes.indexOf(theme.value);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
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
        <button
          class="theme-toggle"
          :aria-label="t('theme.toggle')"
          :title="themeOptions.find((opt) => opt.value === theme)?.label"
          @click="cycleTheme"
        >
          <el-icon :size="20">
            <component :is="currentThemeIcon" />
          </el-icon>
        </button>

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
  background: var(--gradient-bg-subtle);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: minmax(auto, 1fr) auto auto;
  grid-template-areas: "brand controls menu";
  align-items: center;
  gap: 1rem;
  position: relative;
  min-height: 80px;
}

.nav-brand {
  grid-area: brand;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.nav-brand .brand-link {
  text-decoration: none;
  display: block;
  min-width: 0;
  overflow: hidden;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--brand-brown);
  transition: color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-controls {
  grid-area: controls;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.mobile-menu-button {
  grid-area: menu;
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

.brand-subtitle {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  margin-top: 2px;
}

.nav-brand .brand-link:hover h1 {
  color: var(--primary-color);
}

.desktop-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--brand-brown);
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
  color: var(--primary-color);
  background: var(--primary-alpha-10);
}

.nav-link.active {
  color: white;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-light)
  );
  box-shadow: var(--shadow-sm);
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



.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--brand-brown);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.theme-toggle:hover {
  background: var(--primary-alpha-10);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.theme-toggle:active {
  transform: translateY(0);
}



.mobile-menu-button span {
  width: 24px;
  height: 3px;
  background: var(--brand-brown);
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
  background: var(--gradient-bg-subtle);
  padding: clamp(5rem, 15vh, 8rem) clamp(1.5rem, 5vw, 2rem) 2rem;
  box-shadow: var(--shadow-md);
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
  color: var(--brand-brown);
  font-weight: 600;
  padding: 1rem;
  min-height: 60px;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease-in-out;
  font-size: 1.1rem;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
}

.mobile-nav-link:hover {
  color: var(--primary-color);
  background: var(--primary-alpha-10);
  transform: translateX(8px);
}

.mobile-nav-link.active {
  color: var(--primary-color);
  background: linear-gradient(90deg, var(--primary-alpha-15), transparent);
  border-left: 4px solid var(--primary-color);
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
    grid-template-columns: minmax(auto, 30%) 1fr auto;
    grid-template-areas: "brand navigation controls";
    gap: 2rem;
  }

  .nav-brand h1 {
    font-size: 1.8rem;
  }

  .brand-subtitle {
    font-size: 0.8rem;
  }

  .desktop-menu {
    grid-area: navigation;
    display: flex;
    justify-self: center;
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

  .navbar {
    padding: 1rem 2rem;
    max-width: 1200px;
  }

  .nav-controls {
    min-width: 140px; /* 確保語言選擇器有足夠空間 */
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
    min-height: 60px; /* 減少最小高度 */
  }

  .nav-brand h1 {
    font-size: 1rem;
  }

  .brand-subtitle {
    font-size: 0.6rem;
    display: none; /* 隱藏副標題節省空間 */
  }

  .mobile-menu {
    padding: clamp(0.75rem, 2vw, 1rem);
  }
}

/* 深色模式下的 mobile button 樣式 */
[data-theme='dark'] {
  .app-header {
    background: linear-gradient(
      135deg,
      var(--bg-secondary) 0%,
      var(--bg-primary) 100%
    );
    border-bottom-color: var(--border-light);
  }

  .nav-brand h1 {
    color: var(--brand-text-primary);
  }

  .brand-subtitle {
    color: var(--brand-text-secondary);
  }

  .nav-link {
    color: var(--text-secondary);
  }

  .nav-link:hover {
    color: var(--brand-text-primary);
    background: rgba(240, 230, 140, 0.1);
  }

  .mobile-menu {
    background: linear-gradient(
      135deg,
      var(--bg-secondary) 0%,
      var(--bg-primary) 100%
    );
    border-top-color: var(--border-light);
  }

  .mobile-nav-link {
    color: var(--text-secondary);
    border-bottom-color: var(--border-light);
  }

  .mobile-nav-link:hover {
    color: var(--brand-text-primary);
    background: rgba(240, 230, 140, 0.1);
  }

  .mobile-nav-link.active {
    color: var(--brand-text-primary);
    background: linear-gradient(90deg, rgba(240, 230, 140, 0.15), transparent);
    border-left-color: var(--brand-text-primary);
  }

  .mobile-menu-button span {
    background: var(--text-secondary);
  }

  .theme-toggle {
    color: var(--text-secondary);
    border-color: var(--border-light);
  }

  .theme-toggle:hover {
    color: var(--brand-text-primary);
    border-color: var(--brand-text-primary);
    background: rgba(240, 230, 140, 0.1);
  }
}

/* 無障礙: 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .app-header * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
