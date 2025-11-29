<template>
  <div
    class="summary-reading-view"
    :class="{ mobile: isMobile, compact: isCompact }"
  >
    <!-- 頂部概要卡片 -->
    <div class="overview-card">
      <div class="card-header">
        <div class="level-indicator">
          <span class="level-icon">👁️</span>
          <div class="level-info">
            <h3>簡要預覽</h3>
            <p>1分鐘快速了解核心特質</p>
          </div>
        </div>
        <div class="completeness-badge">
          <el-tag :type="getCompletenessType(dataCompleteness)" size="small">
            {{ dataCompleteness }}% 完整
          </el-tag>
        </div>
      </div>

      <!-- 核心特質展示 -->
      <div class="core-traits-section">
        <h4 class="section-title">
          <el-icon><Star /></el-icon>
          核心特質
        </h4>
        <div class="traits-grid">
          <div
            v-for="(trait, index) in displayedCoreTraits"
            :key="index"
            class="trait-item"
            :class="{ primary: index === 0, secondary: index > 0 }"
          >
            <div class="trait-content">
              <span class="trait-icon">{{ getTraitIcon(index) }}</span>
              <span class="trait-text">{{ trait }}</span>
            </div>
          </div>

          <!-- 展開更多按鈕 -->
          <div
            v-if="coreTraits.length > maxDisplayedTraits"
            class="expand-button"
            @click="toggleExpanded"
          >
            <el-button
              :icon="expanded ? ArrowUp : ArrowDown"
              size="small"
              type="primary"
              text
            >
              {{
                expanded
                  ? '收起'
                  : `還有 ${coreTraits.length - maxDisplayedTraits} 項`
              }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 當前運勢簡述 -->
      <div class="fortune-section">
        <h4 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          近期運勢
        </h4>
        <div class="fortune-content">
          <div class="fortune-main">
            <div class="fortune-text">
              {{ currentFortune }}
            </div>
            <div class="fortune-score">
              <el-rate
                v-model="fortuneScore"
                :max="5"
                disabled
                show-score
                score-template="運勢指數"
              />
            </div>
          </div>

          <!-- 運勢趨勢指示器 -->
          <div class="trend-indicator">
            <div class="trend-arrow" :class="getTrendClass()">
              <el-icon :size="20">
                <component :is="getTrendIcon()" />
              </el-icon>
            </div>
            <span class="trend-text">{{ getTrendText() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速行動建議 -->
    <div v-if="quickActions.length > 0" class="quick-actions-card">
      <h4 class="section-title">
        <el-icon><Lightning /></el-icon>
        即時建議
      </h4>
      <div class="actions-list">
        <div
          v-for="(action, index) in quickActions.slice(0, 3)"
          :key="index"
          class="action-item"
        >
          <div class="action-icon">{{ getActionIcon(index) }}</div>
          <div class="action-content">
            <span class="action-text">{{ action }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 升級提示 -->
    <div v-if="canUpgrade" class="upgrade-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <el-icon :size="24" color="#409EFF"><ArrowRight /></el-icon>
        </div>
        <div class="prompt-text">
          <h5>想了解更多？</h5>
          <p>升級到「精簡檢視」或「標準解讀」獲得更詳細的分析</p>
        </div>
        <div class="prompt-actions">
          <el-button
            type="primary"
            size="small"
            @click="$emit('upgradeRequested')"
          >
            查看更多
          </el-button>
        </div>
      </div>
    </div>

    <!-- 資料來源標示 -->
    <div class="data-source">
      <el-icon><InfoFilled /></el-icon>
      <span>基於八字與紫微斗數的綜合分析</span>
      <span class="timestamp">{{ formattedTimestamp }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Star,
  TrendCharts,
  Lightning,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  InfoFilled,
  TopRight,
  Top,
  Bottom,
} from '@element-plus/icons-vue';

// Props
interface Props {
  coreTraits: string[];
  currentFortune: string;
  quickActions?: string[];
  dataCompleteness: number;
  canUpgrade?: boolean;
  isMobile?: boolean;
  isCompact?: boolean;
  timestamp?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  quickActions: () => [],
  canUpgrade: true,
  isMobile: false,
  isCompact: false,
  timestamp: () => new Date(),
});

// Emits
// eslint-disable-next-line no-unused-vars
const _emit = defineEmits<{
  upgradeRequested: [];
  traitSelected: [trait: string, index: number];
  actionSelected: [action: string, index: number];
}>();

// 響應式狀態
const expanded = ref(false);
const fortuneScore = ref(4); // 模擬運勢評分

// 計算屬性
const maxDisplayedTraits = computed(() => {
  if (props.isMobile) {
    return 2;
  }
  if (props.isCompact) {
    return 3;
  }
  return expanded.value ? props.coreTraits.length : 4;
});

const displayedCoreTraits = computed(() => {
  return props.coreTraits.slice(0, maxDisplayedTraits.value);
});

const formattedTimestamp = computed(() => {
  return props.timestamp.toLocaleString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// 方法
const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const getCompletenessType = (completeness: number) => {
  if (completeness >= 80) {
    return 'success';
  }
  if (completeness >= 60) {
    return 'warning';
  }
  return 'info';
};

const getTraitIcon = (index: number) => {
  const icons = ['🌟', '✨', '💫', '⭐', '🔥', '💎'];
  return icons[index] || '⚡';
};

const getActionIcon = (index: number) => {
  const icons = ['🎯', '💡', '🚀'];
  return icons[index] || '📌';
};

const getTrendClass = () => {
  const score = fortuneScore.value;
  if (score >= 4) {
    return 'trend-up';
  }
  if (score >= 3) {
    return 'trend-stable';
  }
  return 'trend-down';
};

const getTrendIcon = () => {
  const score = fortuneScore.value;
  if (score >= 4) {
    return TopRight;
  }
  if (score >= 3) {
    return Top;
  }
  return Bottom;
};

const getTrendText = () => {
  const score = fortuneScore.value;
  if (score >= 4) {
    return '上升趨勢';
  }
  if (score >= 3) {
    return '平穩發展';
  }
  return '需要注意';
};

// 監聽資料變化，自動調整展示
watch(
  () => props.coreTraits.length,
  (newLength) => {
    if (newLength <= maxDisplayedTraits.value) {
      expanded.value = false;
    }
  },
);
</script>

<style scoped>
.summary-reading-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.summary-reading-view.mobile {
  padding: 12px;
  gap: 12px;
}

.summary-reading-view.compact {
  gap: 8px;
}

.overview-card,
.quick-actions-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.mobile .overview-card,
.mobile .quick-actions-card {
  padding: 16px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-icon {
  font-size: 28px;
}

.level-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.level-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.completeness-badge {
  font-size: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.core-traits-section {
  margin-bottom: 24px;
}

.traits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: start;
}

.mobile .traits-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

.trait-item {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e3f2fd;
  transition: all 0.3s ease;
  cursor: pointer;
}

.trait-item.primary {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
  transform: scale(1.02);
}

.trait-item.secondary {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: #9c27b0;
}

.trait-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.trait-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trait-icon {
  font-size: 18px;
}

.trait-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.expand-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.expand-button:hover {
  border-color: #409eff;
  background: #f0f8ff;
}

.fortune-section {
  margin-bottom: 20px;
}

.fortune-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fortune-main {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.mobile .fortune-main {
  flex-direction: column;
  gap: 12px;
}

.fortune-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.fortune-score {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
}

.trend-arrow {
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 50%;
}

.trend-arrow.trend-up {
  background: #e8f5e8;
  color: #52c41a;
}

.trend-arrow.trend-stable {
  background: #fff7e6;
  color: #faad14;
}

.trend-arrow.trend-down {
  background: #fff2f0;
  color: #ff4d4f;
}

.trend-text {
  font-weight: 500;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-item:hover {
  background: #f0f8ff;
  border-color: #409eff;
  transform: translateX(4px);
}

.action-icon {
  font-size: 20px;
  min-width: 24px;
}

.action-content {
  flex: 1;
}

.action-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.upgrade-prompt {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile .prompt-content {
  flex-direction: column;
  text-align: center;
  gap: 8px;
}

.prompt-icon {
  color: #409eff;
}

.prompt-text {
  flex: 1;
}

.prompt-text h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.prompt-text p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.data-source {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.timestamp {
  margin-left: auto;
  font-weight: 500;
}

/* 動畫效果 */
.trait-item,
.action-item {
  animation: fadeInUp 0.3s ease;
}

.trait-item:nth-child(1) {
  animation-delay: 0.1s;
}
.trait-item:nth-child(2) {
  animation-delay: 0.2s;
}
.trait-item:nth-child(3) {
  animation-delay: 0.3s;
}
.trait-item:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式調整 */
@media (max-width: 480px) {
  .level-icon {
    font-size: 24px;
  }

  .level-info h3 {
    font-size: 16px;
  }

  .section-title {
    font-size: 14px;
  }

  .trait-text {
    font-size: 13px;
  }

  .fortune-text {
    font-size: 14px;
    padding: 12px;
  }
}

/* 暗色主題支持 */
@media (prefers-color-scheme: dark) {
  .overview-card,
  .quick-actions-card {
    background: #1a1a1a;
    border-color: #333;
    color: #fff;
  }

  .trait-item {
    background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
    border-color: #444;
  }

  .fortune-text {
    background: #2a2a2a;
    color: #fff;
  }

  .upgrade-prompt {
    background: linear-gradient(135deg, #1a2f3a 0%, #2a3f4a 100%);
    border-color: #3a5f6a;
  }
}
</style>
