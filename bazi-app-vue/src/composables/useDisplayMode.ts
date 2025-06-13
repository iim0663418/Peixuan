import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { DisplayMode } from '@/types/displayModes';

// 全局狀態，保存在 module 作用域，使其在不同元件間共享
const globalModes = ref<Record<string, DisplayMode>>({
  transformationStars: 'standard',
  purpleStar: 'standard',
  baziChart: 'standard',
  integrated: 'standard'
});

/**
 * 顯示模式管理 Composable
 * 提供對元件顯示模式的存取和管理
 * 
 * @param componentName 元件標識符
 * @returns 顯示模式相關的狀態和方法
 */
export function useDisplayMode(componentName: string) {
  // 內部更新標誌，防止循環觸發
  let isUpdatingFromEvent = false;

  // 計算屬性，獲取和設置特定元件的顯示模式
  const displayMode = computed({
    get: () => globalModes.value[componentName] || 'standard',
    set: (newMode: DisplayMode) => {
      // 如果正在從事件更新，避免再次觸發事件
      if (isUpdatingFromEvent) {
        globalModes.value[componentName] = newMode;
        return;
      }
      
      globalModes.value[componentName] = newMode;
      
      // 持久化存儲邏輯，保存到 sessionStorage
      try {
        sessionStorage.setItem(`${componentName}-display-depth`, newMode);
        console.log(`${componentName} 顯示深度已更新為: ${newMode}`);
      } catch (e) {
        console.error('無法保存顯示深度設定到 sessionStorage:', e);
      }
      
      // 觸發自定義事件，通知全域控制面板顯示深度已更改
      window.dispatchEvent(new CustomEvent('module-changed', { 
        detail: { module: componentName, depth: newMode } 
      }));
    }
  });

  /**
   * 將深度/模式字符串映射到標準顯示模式枚舉
   * @param depth 深度字符串
   * @returns 顯示模式
   */
  const mapDepthToMode = (depth: string): DisplayMode => {
    const modeMap: Record<string, DisplayMode> = {
      'minimal': 'minimal',
      'compact': 'compact',
      'standard': 'standard',
      'comprehensive': 'comprehensive'
    };
    return modeMap[depth] || 'standard';
  };

  /**
   * 重置特定元件的顯示模式為預設值
   */
  const resetDisplayMode = () => {
    displayMode.value = 'standard';
  };

  /**
   * 重置所有元件的顯示模式為預設值
   */
  const resetAllModes = () => {
    Object.keys(globalModes.value).forEach(key => {
      globalModes.value[key] = 'standard';
    });
    
    try {
      // 清除所有與顯示深度相關的 sessionStorage
      Object.keys(globalModes.value).forEach(key => {
        sessionStorage.removeItem(`${key}-display-depth`);
      });
    } catch (e) {
      console.error('無法清除 sessionStorage 中的顯示深度設定:', e);
    }
  };

  /**
   * 從 sessionStorage 中載入存儲的顯示模式設置
   */
  const loadSavedMode = () => {
    try {
      const savedMode = sessionStorage.getItem(`${componentName}-display-depth`);
      if (savedMode && ['minimal', 'compact', 'standard', 'comprehensive'].includes(savedMode)) {
        globalModes.value[componentName] = savedMode as DisplayMode;
      }
    } catch (e) {
      console.error(`無法從 sessionStorage 載入 ${componentName} 的顯示深度設定:`, e);
    }
  };

  // 初始化時嘗試從 sessionStorage 加載保存的設置
  loadSavedMode();
  
  // 監聽顯示深度變更事件
  const handleDisplayDepthChanged = (event: CustomEvent) => {
    if (event.detail && event.detail.module === componentName && event.detail.depth !== globalModes.value[componentName]) {
      isUpdatingFromEvent = true;
      globalModes.value[componentName] = event.detail.depth;
      // 同步保存到 sessionStorage
      try {
        sessionStorage.setItem(`${componentName}-display-depth`, event.detail.depth);
      } catch (e) {
        console.error('無法保存顯示深度設定到 sessionStorage:', e);
      }
      isUpdatingFromEvent = false;
    }
  };
  
  // 監聽 module-changed 事件（來自 GlobalDisplayModePanel）
  const handleModuleChanged = (event: CustomEvent) => {
    if (event.detail && event.detail.module === componentName && event.detail.depth !== globalModes.value[componentName]) {
      isUpdatingFromEvent = true;
      globalModes.value[componentName] = event.detail.depth;
      // 同步保存到 sessionStorage
      try {
        sessionStorage.setItem(`${componentName}-display-depth`, event.detail.depth);
      } catch (e) {
        console.error('無法保存顯示深度設定到 sessionStorage:', e);
      }
      isUpdatingFromEvent = false;
    }
  };

  onMounted(() => {
    window.addEventListener('display-depth-changed', handleDisplayDepthChanged as EventListener);
    window.addEventListener('module-changed', handleModuleChanged as EventListener);
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('display-depth-changed', handleDisplayDepthChanged as EventListener);
    window.removeEventListener('module-changed', handleModuleChanged as EventListener);
  });

  return {
    displayMode,
    mapDepthToMode,
    resetDisplayMode,
    resetAllModes
  };
}
