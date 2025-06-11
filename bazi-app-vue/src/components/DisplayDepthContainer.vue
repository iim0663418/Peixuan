<template>
  <div class="display-depth-container">
    <div class="display-options-section">
      <div class="mode-help-text">{{ $t('display.modeHelp') || '選擇顯示模式' }}</div>
      <div class="display-mode-selector">
        <div class="mode-toggle-group">
          <button 
            v-for="depth in availableDepths" 
            :key="depth"
            @click="setDisplayDepth(depth)" 
            class="depth-tab-button"
            :class="{ active: modelValue === depth }"
            :title="$t(`display.displayDepthDesc.${depth}`) || getDefaultDescription(depth)"
          >
            {{ $t(`display.displayDepth.${depth}`) || getDefaultLabel(depth) }}
          </button>
        </div>
      </div>
    </div>
    <div class="depth-description">
      {{ $t(`display.displayDepthDesc.${modelValue}`) || getDefaultDescription(modelValue) }}
    </div>
    <div v-if="showAnimation" class="animation-control">
      <button @click="$emit('toggle-animation')" class="toggle-button">
        {{ isAnimationActive ? '停止動畫' : '啟動動畫' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, withDefaults, onMounted, onBeforeUnmount } from 'vue';
import type { DisplayMode } from '@/types/displayModes';

// Props
interface Props {
  modelValue: DisplayMode;
  availableDepths?: DisplayMode[];
  showAnimation?: boolean;
  isAnimationActive?: boolean;
  moduleType?: 'purpleStar' | 'bazi' | 'transformationStars' | 'integrated';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'standard',
  availableDepths: () => ['minimal', 'compact', 'standard', 'comprehensive'],
  showAnimation: false,
  isAnimationActive: false,
  moduleType: 'purpleStar'
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: DisplayMode];
  'toggle-animation': [];
}>();

// 設置顯示深度
const setDisplayDepth = (depth: DisplayMode) => {
  emit('update:modelValue', depth);
  
  try {
    // 保存設置到 sessionStorage，為每個模塊單獨存儲設置
    sessionStorage.setItem(`${props.moduleType}-display-depth`, depth);
    
    // 觸發自定義事件，通知全域控制面板顯示深度已更改
    window.dispatchEvent(new CustomEvent('module-changed', { 
      detail: { module: props.moduleType, depth } 
    }));
  } catch (error) {
    console.warn('無法保存顯示深度設定:', error);
  }
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
</script>

<style scoped>
.display-depth-container {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
}

.mode-help-text {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.display-mode-selector {
  margin-top: 8px;
}

.mode-toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.depth-tab-button {
  padding: 8px 12px;
  border: 1px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.depth-tab-button:hover {
  background-color: #e9ecef;
}

.depth-tab-button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.depth-description {
  margin-top: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 5px;
  color: #495057;
  font-size: 0.85rem;
  border-left: 3px solid #3498db;
  animation: fadeIn 0.3s ease-in-out;
}

.animation-control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
}

.toggle-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-button:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .mode-toggle-group {
    flex-direction: column;
    width: 100%;
  }
  
  .depth-tab-button {
    width: 100%;
    text-align: center;
  }
}
.display-depth-container-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 16px 0;
}
</style>
