<template>
  <div class="layered-reading-controller">
    <!-- 層級選擇器 -->
    <div
      class="level-selector"
      :class="{ mobile: isMobile, compact: isCompact }"
    >
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
        <div class="data-completeness">
          <el-tooltip
            :content="`資料完整度: ${dataCompleteness}%`"
            placement="top"
          >
            <el-progress
              type="circle"
              :percentage="dataCompleteness"
              :width="40"
              :show-text="false"
              :status="getCompletenessStatus(dataCompleteness)"
            />
          </el-tooltip>
        </div>
      </div>

      <!-- 層級切換按鈕組 -->
      <div v-if="!isMobile" class="level-buttons">
        <el-button-group>
          <el-button
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
          </el-button>
        </el-button-group>
      </div>

      <!-- 移動端下拉選擇器 -->
      <div v-else class="mobile-selector">
        <el-select
          v-model="currentLevel"
          placeholder="選擇閱覽層級"
          :disabled="isTransitioning"
          class="level-select"
          @change="handleLevelChange"
        >
          <el-option
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
          </el-option>
        </el-select>
      </div>

      <!-- 快速操作按鈕 -->
      <div class="quick-actions">
        <el-tooltip content="降低層級" placement="top">
          <el-button
            :icon="ArrowLeft"
            :disabled="!canDowngrade || isTransitioning"
            size="small"
            circle
            @click="downgradeLevel"
          />
        </el-tooltip>

        <el-tooltip content="提升層級" placement="top">
          <el-button
            :icon="ArrowRight"
            :disabled="!canUpgrade || isTransitioning"
            size="small"
            circle
            @click="upgradeLevel"
          />
        </el-tooltip>

        <el-tooltip content="自動選擇最佳層級" placement="top">
          <el-button
            :icon="MagicStick"
            :disabled="isTransitioning"
            size="small"
            circle
            type="success"
            @click="autoSelectOptimalLevel"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 層級資訊展示 -->
    <div v-if="showInfoPanel" class="level-info-panel">
      <div class="info-header">
        <h5>{{ currentLevelConfig.label }}解讀內容</h5>
        <el-button
          :icon="Close"
          size="small"
          text
          @click="showInfoPanel = false"
        />
      </div>

      <div class="info-content">
        <div class="info-item">
          <span class="info-label">預估閱讀時間:</span>
          <span class="info-value">{{
            currentLevelConfig.estimatedReadTime
          }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">資料要求:</span>
          <span class="info-value"
            >{{ currentLevelConfig.minDataRequirement }}% 以上</span
          >
        </div>

        <div class="info-item">
          <span class="info-label">內容特色:</span>
          <span class="info-value">{{ getLevelFeatures(currentLevel) }}</span>
        </div>
      </div>
    </div>

    <!-- 用戶偏好設置 -->
    <div v-if="showPreferences" class="preferences-panel">
      <div class="preferences-header">
        <h5>閱覽偏好設置</h5>
        <el-button
          :icon="Close"
          size="small"
          text
          @click="showPreferences = false"
        />
      </div>

      <div class="preferences-content">
        <el-form label-position="top" size="small">
          <el-form-item label="自動升級層級">
            <el-switch
              v-model="userPreferences.autoUpgrade"
              @change="saveUserPreferences"
            />
          </el-form-item>

          <el-form-item label="啟用動畫效果">
            <el-switch
              v-model="userPreferences.animationsEnabled"
              @change="saveUserPreferences"
            />
          </el-form-item>

          <el-form-item label="緊湊模式">
            <el-switch
              v-model="userPreferences.compactMode"
              @change="saveUserPreferences"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 操作工具欄 -->
    <div class="toolbar">
      <el-tooltip content="顯示層級資訊" placement="top">
        <el-button
          :icon="InfoFilled"
          size="small"
          :type="showInfoPanel ? 'primary' : 'default'"
          @click="showInfoPanel = !showInfoPanel"
        />
      </el-tooltip>

      <el-tooltip content="偏好設置" placement="top">
        <el-button
          :icon="Setting"
          size="small"
          :type="showPreferences ? 'primary' : 'default'"
          @click="showPreferences = !showPreferences"
        />
      </el-tooltip>

      <el-tooltip content="重置為默認" placement="top">
        <el-button
          :icon="RefreshLeft"
          size="small"
          type="warning"
          @click="handleReset"
        />
      </el-tooltip>
    </div>

    <!-- 載入狀態覆蓋 -->
    <div v-if="isTransitioning" class="loading-overlay">
      <el-icon class="loading-icon" :size="24">
        <Loading />
      </el-icon>
      <span class="loading-text">正在切換層級...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  ArrowRight,
  MagicStick,
  Close,
  InfoFilled,
  Setting,
  RefreshLeft,
  Loading,
} from '@element-plus/icons-vue';
import { useLayeredReading } from '@/composables/useLayeredReading';
import { READING_LEVEL_CONFIGS, ReadingLevel } from '@/types/layeredReading';
import type { ReadingLevel as ReadingLevelType } from '@/types/layeredReading';

// Props
interface Props {
  showControls?: boolean;
  compactMode?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showControls: true,
  compactMode: false,
  disabled: false,
});

// Emits
const emit = defineEmits<{
  levelChanged: [level: ReadingLevelType];
  upgradeRequested: [];
  downgradeRequested: [];
  resetRequested: [];
}>();

// 使用分層閱覽狀態管理
const {
  readingState,
  userPreferences,
  currentBreakpoint,
  availableLevels,
  currentLevelConfig,
  canUpgrade,
  canDowngrade,
  getLayoutConfig,
  switchToLevel,
  upgradeLevel,
  downgradeLevel,
  autoSelectOptimalLevel,
  saveUserPreferences,
  resetToDefaults,
} = useLayeredReading();

// 本地狀態
const showInfoPanel = ref(false);
const showPreferences = ref(false);

// 計算屬性
const currentLevel = computed({
  get: () => readingState.currentLevel,
  set: (value: ReadingLevelType) => {
    switchToLevel(value);
  },
});

const isTransitioning = computed(() => readingState.isTransitioning);
const dataCompleteness = computed(() => readingState.dataCompleteness);
const isMobile = computed(() => currentBreakpoint.value === 'mobile');
const isCompact = computed(
  () => props.compactMode || userPreferences.value.compactMode,
);

// 方法
const handleLevelChange = (newLevel: ReadingLevelType) => {
  if (newLevel !== currentLevel.value) {
    switchToLevel(newLevel).then((success: boolean) => {
      if (success) {
        emit('levelChanged', newLevel);
        ElMessage.success(`已切換到${READING_LEVEL_CONFIGS[newLevel].label}`);
      }
    });
  }
};

const _handleUpgrade = async () => {
  const result = upgradeLevel();
  if (result !== false) {
    const success = await result;
    if (success) {
      emit('upgradeRequested');
      ElMessage.success('已升級到更詳細的解讀層級');
    }
  }
};

const _handleDowngrade = async () => {
  const result = downgradeLevel();
  if (result !== false) {
    const success = await result;
    if (success) {
      emit('downgradeRequested');
      ElMessage.success('已降級到更簡潔的解讀層級');
    }
  }
};

const _handleAutoSelect = () => {
  autoSelectOptimalLevel().then(() => {
    ElMessage.success('已自動選擇最佳閱覽層級');
  });
};

const handleReset = () => {
  ElMessageBox.confirm('確定要重置所有閱覽偏好設置嗎？', '重置確認', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      resetToDefaults();
      emit('resetRequested');
      ElMessage.success('已重置為默認設置');
    })
    .catch(() => {
      // 用戶取消
    });
};

const getCompletenessStatus = (completeness: number) => {
  if (completeness >= 80) {
    return 'success';
  }
  if (completeness >= 60) {
    return 'warning';
  }
  return 'exception';
};

const getLevelFeatures = (level: ReadingLevelType): string => {
  const features = {
    [ReadingLevel.SUMMARY]: '核心特質、快速預覽',
    [ReadingLevel.COMPACT]: '重點分析、運勢要點',
    [ReadingLevel.STANDARD]: '完整解讀、人生建議',
    [ReadingLevel.DEEP_ANALYSIS]: '深度分析、詳盡指導',
  };
  return features[level];
};

// 監聽可用層級變化，自動調整當前層級
watch(availableLevels, (newLevels) => {
  if (newLevels.length > 0 && !newLevels.includes(currentLevel.value)) {
    // 如果當前層級不可用，自動選擇最佳層級
    autoSelectOptimalLevel();
  }
});
</script>

<style scoped>
.layered-reading-controller {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

.level-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-selector.mobile {
  gap: 8px;
}

.level-selector.compact {
  padding: 8px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
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
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.level-details p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.data-completeness {
  display: flex;
  align-items: center;
}

.level-buttons {
  display: flex;
  justify-content: center;
}

.level-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  min-height: 60px;
}

.button-icon {
  font-size: 18px;
}

.button-text {
  font-size: 12px;
  white-space: nowrap;
}

.mobile-selector {
  width: 100%;
}

.level-select {
  width: 100%;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
}

.option-time {
  font-size: 12px;
  color: #666;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.level-info-panel,
.preferences-panel {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  border: 1px solid #e9ecef;
}

.info-header,
.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-header h5,
.preferences-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.info-label {
  color: #666;
}

.info-value {
  font-weight: 500;
}

.preferences-content {
  margin-top: 8px;
}

.toolbar {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  z-index: 10;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #666;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 響應式設計 */
@media (max-width: 767px) {
  .layered-reading-controller {
    padding: 12px;
  }

  .level-buttons {
    overflow-x: auto;
    padding: 4px 0;
  }

  .quick-actions {
    justify-content: space-around;
  }

  .toolbar {
    justify-content: space-around;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .level-button {
    padding: 8px 12px;
    min-height: 50px;
  }

  .button-text {
    font-size: 11px;
  }
}

/* 暗色主題支持 */
@media (prefers-color-scheme: dark) {
  .layered-reading-controller {
    background: #1a1a1a;
    color: #fff;
  }

  .level-info-panel,
  .preferences-panel {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .loading-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
}

/* 動畫效果 */
.level-selector {
  transition: all 0.3s ease;
}

.level-button {
  transition: all 0.2s ease;
}

.level-button:hover {
  transform: translateY(-2px);
}

.level-info-panel,
.preferences-panel {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
