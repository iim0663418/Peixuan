import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DisplayMode } from '@/types/displayModes';

/**
 * 顯示模式狀態管理 Store
 * 負責管理所有元件的顯示模式狀態
 */
export const useDisplayModeStore = defineStore('displayMode', () => {
  // 各元件的顯示模式狀態
  const modes = ref<Record<string, DisplayMode>>({
    transformationStars: 'standard',
    purpleStar: 'standard',
    baziChart: 'standard',
    integratedAnalysis: 'standard'
  });

  /**
   * 設置特定元件的顯示模式
   * @param component 元件標識符
   * @param mode 顯示模式
   */
  const setDisplayMode = (component: string, mode: DisplayMode) => {
    modes.value[component] = mode;
    // 可以在這裡添加持久化存儲邏輯，例如保存到 localStorage
  };

  /**
   * 獲取特定元件的顯示模式
   * @param component 元件標識符
   * @returns 顯示模式，如果不存在則返回 'standard'
   */
  const getDisplayMode = (component: string): DisplayMode => {
    return modes.value[component] || 'standard';
  };

  /**
   * 重置所有元件到預設模式
   */
  const resetAllModes = () => {
    Object.keys(modes.value).forEach(key => {
      modes.value[key] = 'standard';
    });
  };

  return {
    modes,
    setDisplayMode,
    getDisplayMode,
    resetAllModes
  };
});
