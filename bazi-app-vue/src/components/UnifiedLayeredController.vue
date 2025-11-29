<template>
  <div
    class="unified-layered-controller"
    :class="{ mobile: isMobile, compact: isCompact }"
  >
    <!-- 層級選擇器 -->
    <div class="level-selector">
      <div class="selector-header">
        <div class="current-level-info">
          <span class="level-icon">{{ currentLevelConfig.icon }}</span>
          <div class="level-details">
            <h4 class="level-name">{{ currentLevelConfig.label }}</h4>
            <p class="level-description">
              {{ currentLevelConfig.description }}
            </p>
          </div>
        </div>

        <!-- 資料完整度指示器 -->
        <div
          v-if="showDataStatus && !ignoreDataCompleteness"
          class="data-completeness"
        >
          <ElTooltip
            :content="`資料完整度: ${dataCompleteness}%`"
            placement="top"
          >
            <ElProgress
              type="circle"
              :percentage="dataCompleteness"
              :width="40"
              :show-text="false"
              :status="getCompletenessStatus(dataCompleteness)"
            />
          </ElTooltip>
        </div>
      </div>

      <!-- 層級切換按鈕組 (桌面版) -->
      <div v-if="!isMobile" class="level-buttons">
        <ElButtonGroup>
          <ElButton
            v-for="level in availableLevels"
            :key="level"
            :type="level === currentLevel ? 'primary' : 'default'"
            :size="isCompact ? 'small' : 'default'"
            :disabled="isTransitioning"
            class="level-button"
            @click="switchToLevel(level)"
          >
            <span class="button-icon">{{
              READING_LEVEL_CONFIGS[level].icon
            }}</span>
            <span class="button-text">{{
              READING_LEVEL_CONFIGS[level].label
            }}</span>
          </ElButton>
        </ElButtonGroup>
      </div>

      <!-- 移動端下拉選擇器 -->
      <div v-else class="mobile-selector">
        <ElSelect
          v-model="currentLevel"
          placeholder="選擇閱覽層級"
          :disabled="isTransitioning"
          class="level-select"
          @change="handleLevelChange"
        >
          <ElOption
            v-for="level in availableLevels"
            :key="level"
            :label="READING_LEVEL_CONFIGS[level].label"
            :value="level"
            :disabled="isTransitioning"
          >
            <div class="option-content">
              <span class="option-icon">{{
                READING_LEVEL_CONFIGS[level].icon
              }}</span>
              <div class="option-text">
                <span class="option-label">{{
                  READING_LEVEL_CONFIGS[level].label
                }}</span>
                <span class="option-time">{{
                  READING_LEVEL_CONFIGS[level].estimatedReadTime
                }}</span>
              </div>
            </div>
          </ElOption>
        </ElSelect>
      </div>

      <!-- 快速操作按鈕 -->
      <div v-if="showToolbar" class="quick-actions">
        <ElTooltip content="降低層級" placement="top">
          <ElButton
            :icon="ArrowLeft"
            :disabled="!canDowngrade || isTransitioning"
            size="small"
            circle
            @click="downgradeLevel"
          />
        </ElTooltip>

        <ElTooltip content="提升層級" placement="top">
          <ElButton
            :icon="ArrowRight"
            :disabled="!canUpgrade || isTransitioning"
            size="small"
            circle
            @click="upgradeLevel"
          />
        </ElTooltip>

        <ElTooltip content="自動選擇最佳層級" placement="top">
          <ElButton
            :icon="MagicStick"
            :disabled="isTransitioning"
            size="small"
            circle
            @click="autoSelectOptimalLevel"
          />
        </ElTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElProgress,
  ElButton,
  ElButtonGroup,
  ElSelect,
  ElOption,
  ElTooltip,
} from 'element-plus';
import { ArrowLeft, ArrowRight, MagicStick } from '@element-plus/icons-vue';
import type { PropType } from 'vue';
import type { LayeredIntegratedAnalysis } from '@/types/layeredReading';
import { ReadingLevel } from '@/types/layeredReading';
import type { DisplayMode } from '@/types/displayModes';

// 層級配置
const READING_LEVEL_CONFIGS = {
  [ReadingLevel.SUMMARY]: {
    icon: '📋',
    label: '簡要預覽',
    description: '快速瀏覽核心要點',
    estimatedReadTime: '2-3分鐘',
    minDataRequirement: 30,
  },
  [ReadingLevel.COMPACT]: {
    icon: '📊',
    label: '精簡檢視',
    description: '重點資訊精煉呈現',
    estimatedReadTime: '5-8分鐘',
    minDataRequirement: 50,
  },
  [ReadingLevel.STANDARD]: {
    icon: '📖',
    label: '標準解讀',
    description: '全面分析與深入解釋',
    estimatedReadTime: '10-15分鐘',
    minDataRequirement: 70,
  },
  [ReadingLevel.DEEP_ANALYSIS]: {
    icon: '🔬',
    label: '深度分析',
    description: '詳盡解析與專業洞察',
    estimatedReadTime: '20-30分鐘',
    minDataRequirement: 85,
  },
} as const;

const props = defineProps({
  moduleType: {
    type: String as PropType<
      'purpleStar' | 'integrated' | 'transformationStars'
    >,
    required: true,
  },
  layeredData: {
    type: Object as PropType<LayeredIntegratedAnalysis | null>,
    default: null,
  },
  dataCompleteness: {
    type: Number,
    default: 0,
  },
  enableSync: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isCompact: {
    type: Boolean,
    default: false,
  },
  showToolbar: {
    type: Boolean,
    default: false,
  },
  ignoreDataCompleteness: {
    type: Boolean,
    default: false,
  },
  showDataStatus: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String as PropType<DisplayMode>,
    default: 'standard',
  },
});

const emit = defineEmits<{
  (e: 'level-changed', level: ReadingLevel): void;
  (e: 'update:modelValue', mode: DisplayMode): void;
  (e: 'upgrade-requested'): void;
  (e: 'downgrade-requested'): void;
  (e: 'reset-requested'): void;
}>();

// 狀態管理
const isTransitioning = ref(false);
const currentLevel = ref<ReadingLevel>(ReadingLevel.STANDARD);

// 映射 DisplayMode 到 ReadingLevel
const displayModeToLevel: Record<DisplayMode, ReadingLevel> = {
  minimal: ReadingLevel.SUMMARY,
  compact: ReadingLevel.COMPACT,
  standard: ReadingLevel.STANDARD,
  comprehensive: ReadingLevel.DEEP_ANALYSIS,
};

const levelToDisplayMode: Record<ReadingLevel, DisplayMode> = {
  [ReadingLevel.SUMMARY]: 'minimal',
  [ReadingLevel.COMPACT]: 'compact',
  [ReadingLevel.STANDARD]: 'standard',
  [ReadingLevel.DEEP_ANALYSIS]: 'comprehensive',
};

// 初始化當前層級
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && displayModeToLevel[newValue]) {
      const newLevel = displayModeToLevel[newValue];
      console.log(
        `UnifiedLayeredController: modelValue=${newValue} → level=${newLevel}`,
      );
      currentLevel.value = newLevel;
    }
  },
  { immediate: true },
);

// 可用層級計算
const availableLevels = computed<ReadingLevel[]>(() => {
  const allLevels: ReadingLevel[] = [
    ReadingLevel.SUMMARY,
    ReadingLevel.COMPACT,
    ReadingLevel.STANDARD,
    ReadingLevel.DEEP_ANALYSIS,
  ];

  if (props.ignoreDataCompleteness) {
    return allLevels;
  }

  const completeness = props.dataCompleteness;
  const levels = allLevels.filter((level) => {
    const config = READING_LEVEL_CONFIGS[level];
    return config && completeness >= config.minDataRequirement;
  });

  return levels.length > 0 ? levels : [ReadingLevel.SUMMARY];
});

// 當前層級配置
const currentLevelConfig = computed(() => {
  return READING_LEVEL_CONFIGS[currentLevel.value];
});

// 層級切換能力
const canUpgrade = computed(() => {
  const currentIndex = availableLevels.value.indexOf(currentLevel.value);
  return currentIndex < availableLevels.value.length - 1;
});

const canDowngrade = computed(() => {
  const currentIndex = availableLevels.value.indexOf(currentLevel.value);
  return currentIndex > 0;
});

// 資料完整度狀態
const getCompletenessStatus = (percentage: number) => {
  if (percentage >= 80) {
    return 'success';
  }
  if (percentage >= 60) {
    return 'warning';
  }
  return 'exception';
};

// 層級切換方法
const switchToLevel = async (level: ReadingLevel) => {
  if (level === currentLevel.value || isTransitioning.value) {
    return;
  }

  console.log(
    `UnifiedLayeredController: switchToLevel ${currentLevel.value} → ${level}`,
  );

  isTransitioning.value = true;
  try {
    currentLevel.value = level;
    const displayMode = levelToDisplayMode[level];
    console.log(
      `UnifiedLayeredController: 發送事件 level-changed=${level}, update:modelValue=${displayMode}`,
    );
    emit('level-changed', level);
    emit('update:modelValue', displayMode);
  } finally {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 300);
  }
};

const handleLevelChange = (level: ReadingLevel) => {
  switchToLevel(level);
};

const upgradeLevel = () => {
  if (canUpgrade.value) {
    const currentIndex = availableLevels.value.indexOf(currentLevel.value);
    const nextLevel = availableLevels.value[currentIndex + 1];
    switchToLevel(nextLevel);
    emit('upgrade-requested');
  }
};

const downgradeLevel = () => {
  if (canDowngrade.value) {
    const currentIndex = availableLevels.value.indexOf(currentLevel.value);
    const prevLevel = availableLevels.value[currentIndex - 1];
    switchToLevel(prevLevel);
    emit('downgrade-requested');
  }
};

const autoSelectOptimalLevel = () => {
  const completeness = props.dataCompleteness;
  let optimalLevel: ReadingLevel = ReadingLevel.SUMMARY;

  if (completeness >= 85) {
    optimalLevel = ReadingLevel.DEEP_ANALYSIS;
  } else if (completeness >= 70) {
    optimalLevel = ReadingLevel.STANDARD;
  } else if (completeness >= 50) {
    optimalLevel = ReadingLevel.COMPACT;
  }

  if (availableLevels.value.includes(optimalLevel)) {
    switchToLevel(optimalLevel);
    emit('reset-requested');
  }
};
</script>

<style scoped>
.unified-layered-controller {
  margin-bottom: 16px;
}

.level-selector {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.current-level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-icon {
  font-size: 24px;
}

.level-details h4 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.level-details p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.level-buttons {
  margin-bottom: 12px;
}

.level-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.button-icon {
  font-size: 14px;
}

.mobile-selector {
  margin-bottom: 12px;
}

.level-select {
  width: 100%;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: 14px;
}

.option-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.quick-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.unified-layered-controller.mobile {
  padding: 8px;
}

.unified-layered-controller.compact .level-selector {
  padding: 12px;
}

.unified-layered-controller.compact .selector-header {
  margin-bottom: 12px;
}
</style>
