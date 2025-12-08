<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChartStore } from '@/stores/chartStore';

// 動態導入組件以提升效能
const LanguageSelector = defineAsyncComponent(
  () => import('@/components/LanguageSelector.vue'),
);

const route = useRoute();
const router = useRouter();
const chartStore = useChartStore();
const showMobileMenu = ref(false);

// 檢查是否有可用的命盤數據
const hasChartData = computed(() => chartStore.hasChart);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  // 防止背景滾動
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
  router.push('/personality');
  closeMobileMenu();
};

const handleAdvancedAnalysis = () => {
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

  // 跳轉到進階分析頁面
  router.push('/fortune');
  closeMobileMenu();
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

          <!-- 性格分析按鈕 -->
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

          <!-- 移動版菜單按鈕 -->
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

        <!-- 移動版性格分析 -->
        <button
          class="mobile-nav-link mobile-ai-btn"
          :class="{
            active: route?.path === '/personality',
          }"
          @click="handleAIAnalysis"
        >
          <span>{{ $t('navigation.personality') }}</span>
        </button>
        <button
          class="mobile-nav-link advanced-analysis-btn"
          :class="{
            active: route?.path === '/fortune',
          }"
          @click="handleAdvancedAnalysis"
        >
          <span>{{ $t('navigation.fortune') }}</span>
        </button>
      </div>
    </header>

    <main>
      <router-view />
      <!-- 已簡化：使用各模組獨立的分層控制器 -->
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>{{ $t('common.app_name') }}</h4>
          <p>{{ $t('footer.tagline') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.services') }}</h4>
          <div class="footer-links">
            <router-link to="/">{{ $t('navigation.home') }}</router-link>
            <router-link to="/unified">{{
              $t('astrology.unified')
            }}</router-link>
            <router-link to="/personality">{{ $t('navigation.personality') }}</router-link>
            <router-link to="/fortune">{{ $t('navigation.fortune') }}</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.contact') }}</h4>
          <p>{{ $t('footer.copyright', { appName: $t('common.app_name') }) }}</p>
          <p>{{ $t('footer.rights') }}</p>
          <p class="footer-licenses">
            Built with
            <a
              href="https://vuejs.org"
              target="_blank"
              rel="noopener noreferrer"
              >Vue.js</a
            >
            (MIT),
            <a
              href="https://element-plus.org"
              target="_blank"
              rel="noopener noreferrer"
              >Element Plus</a
            >
            (MIT),
            <a
              href="https://workers.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              >Cloudflare Workers</a
            >
            (Apache-2.0),
            <a
              href="https://github.com/6tail/lunar-typescript"
              target="_blank"
              rel="noopener noreferrer"
              >lunar-typescript</a
            >
            (MIT)
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app-container {
  font-family:
    'Microsoft JhengHei', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei',
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

/* 頁眉樣式 */
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

/* 品牌區域 */
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

/* 桌面版導航菜單 */
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

/* AI 分析按鈕 */
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
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-analysis-btn:not(.disabled):hover {
  transform: translateY(-1px);
}

/* 進階分析按鈕 */
.advanced-analysis-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.advanced-analysis-btn .icon {
  font-size: 1.2rem;
}

.advanced-analysis-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.advanced-analysis-btn:not(.disabled):hover {
  transform: translateY(-1px);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 移動版菜單按鈕 - 符合最小觸控尺寸 44x44px */
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

/* 移動版導航菜單 - 全螢幕覆蓋設計 */
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
  /* Initial state: hidden with slide-in animation */
  opacity: 0;
  visibility: hidden;
  transform: translateX(-100%);
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out,
    visibility 0.3s;
}

/* Active state: slide in from left with full opacity */
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

/* 移動版 AI 按鈕 */
.mobile-ai-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  justify-content: flex-start;
}

.mobile-ai-btn .icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease-in-out;
}

.mobile-ai-btn:not(.disabled):hover .icon {
  transform: scale(1.15);
}

.mobile-ai-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 移動版進階分析按鈕 */
.mobile-menu .advanced-analysis-btn {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu .advanced-analysis-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-menu .advanced-analysis-btn:not(.disabled):hover {
  transform: translateX(8px);
}

/* 主要內容區域 */
main {
  padding: 0;
  max-width: 100%;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 頁腳樣式 */
.app-footer {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 3rem 2rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  color: #f0e68c;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-section p {
  margin: 0.5rem 0;
  color: #e6ddd4;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #e6ddd4;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #f0e68c;
}

.footer-licenses {
  font-size: 12px;
  color: rgba(230, 221, 212, 0.7);
  margin-top: 8px;
}

.footer-licenses a {
  color: #e6ddd4;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-licenses a:hover {
  color: #f0e68c;
}

/* 響應式設計 - Mobile First */
/* 小螢幕手機 (< 480px) - 基礎樣式已在上方定義 */

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

  /* Hide mobile menu on desktop - animation only for mobile */
  .mobile-menu {
    display: none;
  }

  .app-footer {
    padding: 3rem 2rem 2rem;
  }

  .footer-content {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    text-align: left;
  }
}

/* 桌面 (1024px+) - 優化導航間距 */
@media (min-width: 1024px) {
  .desktop-menu {
    gap: 2.5rem;
  }
}

/* 確保小解析度下隱藏桌面選單 */
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

  .app-footer {
    padding: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2vw, 1.5rem);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
}

/* 手機版 Footer 簡化 (<768px) */
@media (max-width: 767px) {
  .app-footer {
    padding: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2vw, 1.5rem);
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  #app-container {
    color: #f9fafb;
    background-color: #111827;
  }

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
