<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';
import GlobalDisplayModePanel from '@/components/GlobalDisplayModePanel.vue';

const { t } = useI18n();
const route = useRoute();
const showMobileMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};
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
            to="/" 
            class="nav-link"
            :class="{ active: route.name === 'home' }"
          >
            {{ $t('common.home') }}
          </router-link>
          <router-link 
            to="/purple-star" 
            class="nav-link"
            :class="{ active: route.name === 'purple-star' }"
          >
            {{ $t('astrology.purple_star') }}
          </router-link>
          <router-link 
            to="/bazi" 
            class="nav-link"
            :class="{ active: route.name === 'bazi' }"
          >
            {{ $t('astrology.bazi') }}
          </router-link>
        </div>

        <div class="nav-controls">
          <LanguageSelector />
          
          <!-- 移動版菜單按鈕 -->
          <button 
            class="mobile-menu-button"
            @click="toggleMobileMenu"
            :class="{ active: showMobileMenu }"
          >
            <span></span>
            <span></span>
            <span></span>
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
          to="/purple-star" 
          class="mobile-nav-link"
          :class="{ active: route.name === 'purple-star' }"
          @click="showMobileMenu = false"
        >
          {{ $t('astrology.purple_star') }}
        </router-link>
        <router-link 
          to="/bazi" 
          class="mobile-nav-link"
          :class="{ active: route.name === 'bazi' }"
          @click="showMobileMenu = false"
        >
          {{ $t('astrology.bazi') }}
        </router-link>
      </div>
    </header>
    
    <main>
      <router-view />
      <!-- 全域顯示深度控制面板 -->
      <GlobalDisplayModePanel />
    </main>
    
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>{{ $t('common.app_name') }}</h4>
          <p>傳統命理智慧，現代科技精算</p>
        </div>
        <div class="footer-section">
          <h4>服務項目</h4>
          <div class="footer-links">
            <router-link to="/purple-star">{{ $t('astrology.purple_star') }}</router-link>
            <router-link to="/bazi">{{ $t('astrology.bazi') }}</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>聯絡資訊</h4>
          <p>© 2025 佩璇命理服務平台</p>
          <p>版權所有，保留一切權利</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app-container {
  font-family: 'Microsoft JhengHei', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  transition: all 0.3s;
  position: relative;
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

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 移動版菜單按鈕 */
.mobile-menu-button {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  width: 30px;
  height: 30px;
  justify-content: space-around;
}

.mobile-menu-button span {
  width: 100%;
  height: 3px;
  background: #8b4513;
  transition: all 0.3s;
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

/* 移動版導航菜單 */
.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #e9dcc9;
  padding: 1rem 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.mobile-menu.show {
  display: block;
}

.mobile-nav-link {
  display: block;
  text-decoration: none;
  color: #8b4513;
  font-weight: 600;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.3s;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: #d2691e;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* 主要內容區域 */
main {
  flex: 1;
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
  margin-top: auto;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }
  
  .nav-brand h1 {
    font-size: 1.5rem;
  }
  
  .brand-subtitle {
    font-size: 0.75rem;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu-button {
    display: flex;
  }
  
  .app-footer {
    padding: 2rem 1rem 1.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem;
  }
  
  .nav-brand h1 {
    font-size: 1.3rem;
  }
  
  .mobile-menu {
    padding: 1rem;
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
    background: #1f2937;
    border-top-color: #374151;
  }
  
  .mobile-nav-link {
    color: #e5e7eb;
    border-bottom-color: #374151;
  }
  
  .mobile-nav-link:hover,
  .mobile-nav-link.active {
    color: #f0e68c;
  }
  
  .mobile-menu-button span {
    background: #e5e7eb;
  }
}
</style>
