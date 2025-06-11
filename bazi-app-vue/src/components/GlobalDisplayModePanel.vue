<template>
  <Transition name="slide-fade">
    <div class="global-display-panel" :class="{ 'collapsed': isCollapsed }" 
      :aria-label="isCollapsed ? $t('display.tooltips.panelCollapsed') || '點擊展開全域顯示設定' : $t('display.tooltips.panelExpanded') || '全域顯示設定面板'"
      :title="isCollapsed ? $t('display.tooltips.collapsedHint') || '點擊展開全域顯示設定\n快速調整命理模組顯示深度' : ''">
      <div class="panel-content" :style="{ background: moduleColors[activeModule] }">
        <div class="panel-header">
          <h3 v-if="!isCollapsed">{{ $t('display.globalSettings') || '顯示設定' }}</h3>
          <button @click="toggleCollapse" class="collapse-button" 
            :title="isCollapsed ? $t('display.tooltips.expand') || '展開設定面板' : $t('display.tooltips.collapse') || '收起設定面板'"
            :aria-label="isCollapsed ? $t('display.tooltips.expand') || '展開設定面板' : $t('display.tooltips.collapse') || '收起設定面板'">
            <i class="icon" :class="isCollapsed ? 'icon-settings' : 'icon-collapse'">
              {{ isCollapsed ? '⚙️' : '←' }}
            </i>
          </button>
        </div>
        
        <div v-if="!isCollapsed" class="panel-body">
          <div class="module-selector">
            <button 
              v-for="(color, module) in moduleColors" 
              :key="module"
              @click="setActiveModule(module)"
              class="module-button"
              :class="{ active: activeModule === module }"
              :style="{ backgroundColor: activeModule === module ? color : 'transparent', borderColor: color }"
              :title="$t('display.tooltips.selectModule') || '選擇模組：切換命理分析類型'"
              :aria-label="`${$t('display.tooltips.selectModule') || '選擇模組'}: ${getModuleLabel(module)}`"
            >
              {{ getModuleLabel(module) }}
            </button>
          </div>
          
          <div class="depth-selector">
            <h4>{{ $t('display.depthSelector') || '顯示深度' }}</h4>
            <div class="depth-buttons">
              <button 
                v-for="depth in availableDepths" 
                :key="depth"
                @click="setDisplayDepth(depth)"
                class="depth-button"
                :class="{ 
                  active: getModuleDepth(activeModule) === depth,
                  'depth-minimal': depth === 'minimal',
                  'depth-compact': depth === 'compact',
                  'depth-standard': depth === 'standard',
                  'depth-comprehensive': depth === 'comprehensive'
                }"
                :title="$t('display.tooltips.adjustDepth') || '調整深度：控制資訊詳細程度'"
                :aria-label="`${$t('display.tooltips.adjustDepth') || '調整深度'}: ${$t(`display.displayDepth.${depth}`) || getDefaultLabel(depth)}`"
              >
                {{ $t(`display.displayDepth.${depth}`) || getDefaultLabel(depth) }}
              </button>
            </div>
          </div>
          
          <div class="depth-description">
            {{ $t(`display.displayDepthDesc.${getModuleDepth(activeModule)}`) || getDefaultDescription(getModuleDepth(activeModule)) }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { DisplayMode } from '@/types/displayModes';

// 模組類型定義
type ModuleType = 'purpleStar' | 'bazi' | 'transformationStars' | 'integrated';

// 預設深度設定
const defaultDepth: DisplayMode = 'standard';

// 模組顏色映射 (無障礙色彩方案)
const moduleColors = {
  purpleStar: 'linear-gradient(135deg, #8E4585 0%, #6A0DAD 100%)',
  bazi: 'linear-gradient(135deg, #D2691E 0%, #8B4513 100%)',
  transformationStars: 'linear-gradient(135deg, #4169E1 0%, #1E4D8C 100%)',
  integrated: 'linear-gradient(135deg, #3CB371 0%, #2E8B57 100%)'
};

// 模組對比顏色 (用於邊框和高亮)
const moduleContrastColors = {
  purpleStar: '#D8BFD8',  // 淺紫色
  bazi: '#DEB887',        // 淺駝色
  transformationStars: '#87CEEB',  // 淺藍色
  integrated: '#90EE90'   // 淺綠色
};

// 模組文字顏色
const moduleTextColors = {
  purpleStar: '#FFFFFF',  // 白色
  bazi: '#FFFFFF',        // 白色
  transformationStars: '#FFFFFF',  // 白色
  integrated: '#FFFFFF'   // 白色
};

// 響應式狀態
const isCollapsed = ref(true);
const activeModule = ref<ModuleType>('purpleStar');
const moduleDepths = ref<Record<ModuleType, DisplayMode>>({
  purpleStar: defaultDepth,
  bazi: defaultDepth,
  transformationStars: defaultDepth,
  integrated: defaultDepth
});

// 可用的顯示深度選項
const availableDepths: DisplayMode[] = ['minimal', 'compact', 'standard', 'comprehensive'];

// 計算當前模組的顯示深度
const getModuleDepth = (module: ModuleType): DisplayMode => {
  return moduleDepths.value[module] || defaultDepth;
};

// 提供給外部的顯示深度
const displayDepth = computed(() => getModuleDepth(activeModule.value));

// 方法: 切換收起/展開
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  
  // 播放彈性動畫
  if (!isCollapsed.value) {
    const panel = document.querySelector('.global-display-panel');
    if (panel) {
      panel.classList.add('bounce-animation');
      setTimeout(() => {
        panel?.classList.remove('bounce-animation');
      }, 500);
    }
  }
};

// 方法: 設置當前模組
const setActiveModule = (module: ModuleType) => {
  activeModule.value = module;
  
  // 從 sessionStorage 讀取深度設定
  const savedDepth = sessionStorage.getItem(`${module}-display-depth`);
  if (savedDepth && availableDepths.includes(savedDepth as DisplayMode)) {
    moduleDepths.value[module] = savedDepth as DisplayMode;
  }
  
  // 觸發動畫效果
  const buttons = document.querySelectorAll('.module-button');
  buttons.forEach(button => {
    button.classList.remove('rotate-animation');
  });
  
  const activeButton = document.querySelector(`.module-button.active`);
  if (activeButton) {
    activeButton.classList.add('rotate-animation');
  }
  
  // 無障礙宣告 - 通知螢幕閱讀器
  const announcement = document.getElementById('a11y-announcement');
  if (announcement) {
    announcement.textContent = `已選擇${getModuleLabel(module)}模組`;
  }
};

// 方法: 設置顯示深度
const setDisplayDepth = (depth: DisplayMode) => {
  moduleDepths.value[activeModule.value] = depth;
  
  // 保存到 sessionStorage
  try {
    sessionStorage.setItem(`${activeModule.value}-display-depth`, depth);
    
    // 觸發自定義事件，通知其他組件顯示深度已更改
    const event = new CustomEvent('display-depth-changed', { 
      detail: { module: activeModule.value, depth } 
    });
    window.dispatchEvent(event);
    
    // 額外發送 module-changed 事件以確保兼容性和同步
    const compatEvent = new CustomEvent('module-changed', { 
      detail: { module: activeModule.value, depth } 
    });
    window.dispatchEvent(compatEvent);
    
    console.log(`更新${getModuleLabel(activeModule.value)}的顯示深度為: ${depth}`);
  } catch (error) {
    console.warn('無法保存顯示深度設定:', error);
  }
  
  // 播放按鈕動畫
  const depthButton = document.querySelector(`.depth-button.active`);
  if (depthButton) {
    depthButton.classList.add('pulse-animation');
    setTimeout(() => {
      depthButton.classList.remove('pulse-animation');
    }, 500);
  }
};

// 獲取模組顯示名稱
const getModuleLabel = (module: ModuleType): string => {
  const labels: Record<ModuleType, string> = {
    purpleStar: '紫微斗數',
    bazi: '八字命盤',
    transformationStars: '四化飛星',
    integrated: '整合分析'
  };
  
  return labels[module] || '未知模組';
};

// 預設標籤文字
const getDefaultLabel = (depth: string): string => {
  const labels: Record<string, string> = {
    'minimal': '簡要預覽',
    'compact': '精簡檢視',
    'standard': '標準解讀',
    'comprehensive': '深度分析'
  };
  
  return labels[depth] || depth;
};

// 預設描述文字
const getDefaultDescription = (depth: string): string => {
  const descriptions: Record<string, string> = {
    'minimal': '最簡潔的命盤展示，僅呈現基本框架',
    'compact': '顯示主要星曜和基本效應，快速了解命盤特點',
    'standard': '完整展示星曜信息和效應，深入解析命盤結構',
    'comprehensive': '全面詳盡的命盤分析，包含所有星曜、組合和多層次能量疊加'
  };
  
  return descriptions[depth] || '';
};

// 監聽路由變化
onMounted(() => {
  // 初始化: 從 sessionStorage 讀取各模組的顯示深度設定
  Object.keys(moduleDepths.value).forEach(module => {
    const moduleType = module as ModuleType;
    const savedDepth = sessionStorage.getItem(`${moduleType}-display-depth`);
    if (savedDepth && availableDepths.includes(savedDepth as DisplayMode)) {
      moduleDepths.value[moduleType] = savedDepth as DisplayMode;
    }
  });
  
  // 監聽自定義事件，接收組件發出的顯示模式變更通知
  window.addEventListener('module-changed', ((event: CustomEvent) => {
    if (event.detail && event.detail.module) {
      setActiveModule(event.detail.module);
    }
  }) as EventListener);
  
  // 添加無障礙宣告區域
  const announcement = document.createElement('div');
  announcement.id = 'a11y-announcement';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  document.body.appendChild(announcement);
  
  // 添加鍵盤事件處理
  document.addEventListener('keydown', handleKeyboardNavigation);
});

// 鍵盤無障礙導航
const handleKeyboardNavigation = (event: KeyboardEvent) => {
  // 僅當面板展開時處理
  if (isCollapsed.value) return;
  
  // 確認焦點元素
  const focusedElement = document.activeElement;
  
  // 處理 Escape 鍵收起面板
  if (event.key === 'Escape') {
    toggleCollapse();
    event.preventDefault();
    return;
  }
  
  // 處理模組按鈕導航
  if (focusedElement?.classList.contains('module-button')) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const buttons = Array.from(document.querySelectorAll('.module-button'));
      const currentIndex = buttons.indexOf(focusedElement as HTMLElement);
      
      if (currentIndex !== -1) {
        const newIndex = event.key === 'ArrowLeft'
          ? (currentIndex - 1 + buttons.length) % buttons.length
          : (currentIndex + 1) % buttons.length;
        
        (buttons[newIndex] as HTMLElement).focus();
        event.preventDefault();
      }
    }
  }
  
  // 處理深度按鈕導航
  if (focusedElement?.classList.contains('depth-button')) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const buttons = Array.from(document.querySelectorAll('.depth-button'));
      const currentIndex = buttons.indexOf(focusedElement as HTMLElement);
      
      if (currentIndex !== -1) {
        const newIndex = event.key === 'ArrowUp'
          ? (currentIndex - 1 + buttons.length) % buttons.length
          : (currentIndex + 1) % buttons.length;
        
        (buttons[newIndex] as HTMLElement).focus();
        event.preventDefault();
      }
    }
  }
};

// 導出組件方法供父組件使用
defineExpose({
  setActiveModule,
  displayDepth
});
</script>

<style scoped>
/* 全域面板基本樣式 */
.global-display-panel {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  width: 300px;
  background-color: white;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

/* 收起狀態 */
.global-display-panel.collapsed {
  width: 40px;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 面板內容容器 */
.panel-content {
  padding: 15px;
  height: 100%;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  transition: background-color 0.5s ease;
}

/* 面板標題 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

/* 收起/展開按鈕 */
.collapse-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.collapse-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon {
  font-size: 1.2rem;
}

/* 模組選擇器 */
.module-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.module-button {
  padding: 6px 12px;
  border-radius: 20px;
  background: transparent;
  border: 2px solid; /* 增加邊框寬度，提高辨識度 */
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.module-button:focus {
  outline: 3px solid #fff;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
}

.module-button.active {
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.module-button:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.module-button:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.module-button:hover:after {
  opacity: 1;
}

/* 深度選擇器 */
.depth-selector {
  margin-bottom: 15px;
}

.depth-selector h4 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #333;
}

.depth-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.depth-button {
  padding: 8px 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.3s;
}

.depth-button:hover:not(.active) {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.depth-button.active {
  border-left-width: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

/* 深度按鈕顏色 - 無障礙設計配色 */
.depth-minimal.active {
  border-left-color: #5c636a; /* 深灰色，提高對比度 */
  color: #212529;
  background-color: #e9ecef;
}

.depth-compact.active {
  border-left-color: #0e6e8c; /* 深藍色，提高對比度 */
  color: #0a3d4d;
  background-color: #d1ecf1;
}

.depth-standard.active {
  border-left-color: #146c2e; /* 深綠色，提高對比度 */
  color: #155724;
  background-color: #d4edda;
}

.depth-comprehensive.active {
  border-left-color: #b02a37; /* 深紅色，提高對比度 */
  color: #721c24;
  background-color: #f8d7da;
}

/* 聚焦樣式 */
.depth-button:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  z-index: 2;
}

/* 深度描述 */
.depth-description {
  padding: 10px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  color: #495057;
  line-height: 1.5;
}

/* 過渡動畫 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-50%) translateX(-100%);
  opacity: 0;
}

/* 彈性動畫 */
@keyframes bounce {
  0% { transform: translateY(-50%) scale(0.9); }
  50% { transform: translateY(-50%) scale(1.05) rotate(2deg); }
  70% { transform: translateY(-50%) scale(0.95) rotate(-2deg); }
  100% { transform: translateY(-50%) scale(1); }
}

.bounce-animation {
  animation: bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 旋轉動畫 */
@keyframes rotate {
  0% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
  100% { transform: rotate(0); }
}

.rotate-animation {
  animation: rotate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 脈動動畫 */
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
  50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(0,0,0,0.2); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
}

.pulse-animation {
  animation: pulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .global-display-panel {
    background-color: #1f2937;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
  }
  
  .global-display-panel.collapsed {
    background-color: rgba(31, 41, 55, 0.9);
  }
  
  .panel-header h3 {
    color: #e5e7eb;
  }
  
  .collapse-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .depth-button {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }
  
  .depth-button:hover:not(.active) {
    background-color: #4b5563;
  }
  
  .depth-description {
    background-color: rgba(31, 41, 55, 0.7);
    color: #d1d5db;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .global-display-panel {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .global-display-panel {
    width: 230px;
    font-size: 0.9rem;
  }
  
  .depth-button {
    padding: 6px 10px;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  .global-display-panel,
  .panel-content,
  .collapse-button,
  .module-button,
  .depth-button {
    transition: none !important;
  }
  
  .bounce-animation,
  .rotate-animation,
  .pulse-animation {
    animation: none !important;
  }
}

/* 鍵盤導航與無障礙增強 */
.module-button:focus-visible,
.depth-button:focus-visible,
.collapse-button:focus-visible {
  outline: 3px solid #4D90FE;
  outline-offset: 2px;
  position: relative;
  z-index: 3;
}

/* 高對比度模式 */
@media (forced-colors: active) {
  .global-display-panel {
    border: 2px solid CanvasText;
  }
  
  .module-button, 
  .depth-button,
  .collapse-button {
    border: 1px solid CanvasText;
  }
  
  .module-button.active,
  .depth-button.active {
    border-width: 2px;
    border-style: solid;
    border-color: CanvasText;
  }
}

/* 螢幕閱讀器專用元素 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
