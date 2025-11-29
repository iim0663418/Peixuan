<template>
  <div
    class="compact-reading-view"
    :class="{ mobile: isMobile, tablet: isTablet }"
  >
    <!-- 頂部導航 -->
    <div class="reading-nav">
      <div class="nav-header">
        <span class="level-icon">📝</span>
        <div class="nav-info">
          <h3>精簡檢視</h3>
          <p>3分鐘掌握重點特質與運勢要點</p>
        </div>
      </div>
      <div class="nav-tabs">
        <el-tabs v-model="activeTab" type="card" class="reading-tabs">
          <el-tab-pane label="性格亮點" name="personality">
            <template #label>
              <div class="tab-label">
                <el-icon><User /></el-icon>
                <span>性格亮點</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane label="運勢趨勢" name="fortune">
            <template #label>
              <div class="tab-label">
                <el-icon><TrendCharts /></el-icon>
                <span>運勢趨勢</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane label="快速建議" name="advice">
            <template #label>
              <div class="tab-label">
                <el-icon><Lightning /></el-icon>
                <span>快速建議</span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 內容區域 -->
    <div class="content-area">
      <!-- 性格亮點標籤 -->
      <div v-show="activeTab === 'personality'" class="personality-section">
        <div class="section-header">
          <h4>個性特質分析</h4>
          <el-tag type="info" size="small"
            >{{ personalityHighlights.length }} 項特質</el-tag
          >
        </div>

        <div class="highlights-grid">
          <div
            v-for="(highlight, index) in personalityHighlights"
            :key="index"
            class="highlight-card"
            :class="getHighlightType(index)"
            @click="selectHighlight(highlight, index)"
          >
            <div class="card-icon">{{ getPersonalityIcon(index) }}</div>
            <div class="card-content">
              <h5 class="highlight-title">{{ extractTitle(highlight) }}</h5>
              <p class="highlight-desc">{{ extractDescription(highlight) }}</p>
            </div>
            <div class="card-score">
              <el-rate
                :model-value="getTraitScore(index)"
                :max="5"
                disabled
                size="small"
                :show-text="false"
              />
            </div>
          </div>
        </div>

        <!-- 性格雷達圖 -->
        <div v-if="!isMobile" class="personality-radar">
          <h5>性格維度分析</h5>
          <div class="radar-container">
            <div class="radar-chart">
              <!-- 簡化的雷達圖展示 -->
              <div
                v-for="(dimension, index) in personalityDimensions"
                :key="index"
                class="radar-item"
              >
                <span class="dimension-label">{{ dimension.name }}</span>
                <div class="dimension-bar">
                  <div
                    class="bar-fill"
                    :style="{ width: `${dimension.score}%` }"
                    :class="getBarClass(dimension.score)"
                  />
                </div>
                <span class="dimension-score">{{ dimension.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 運勢趨勢標籤 -->
      <div v-show="activeTab === 'fortune'" class="fortune-section">
        <div class="section-header">
          <h4>運勢發展趨勢</h4>
          <el-tag type="success" size="small">3個主要週期</el-tag>
        </div>

        <div class="trends-timeline">
          <div
            v-for="(trend, index) in fortuneTrends"
            :key="index"
            class="timeline-item"
            :class="{ active: index === 0 }"
          >
            <div class="timeline-marker">
              <div class="marker-dot" :class="getTrendClass(index)" />
              <div
                v-if="index < fortuneTrends.length - 1"
                class="marker-line"
              />
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h5 class="timeline-title">{{ getTrendPeriod(index) }}</h5>
                <el-tag :type="getTrendTagType(index)" size="small">
                  {{ getTrendStatus(index) }}
                </el-tag>
              </div>
              <p class="timeline-desc">{{ trend }}</p>
              <div class="timeline-score">
                <span class="score-label">運勢指數:</span>
                <el-progress
                  :percentage="getTrendScore(index)"
                  :status="getTrendProgressStatus(index)"
                  :show-text="false"
                  :stroke-width="6"
                />
                <span class="score-value">{{ getTrendScore(index) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 重要時間節點提醒 -->
        <div v-if="keyDates.length > 0" class="key-dates">
          <h5>重要時間節點</h5>
          <div class="dates-list">
            <div
              v-for="(date, index) in keyDates"
              :key="index"
              class="date-item"
            >
              <div class="date-icon">📅</div>
              <div class="date-content">
                <span class="date-time">{{ date.time }}</span>
                <span class="date-event">{{ date.event }}</span>
              </div>
              <el-tag :type="date.type" size="small">{{
                date.importance
              }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速建議標籤 -->
      <div v-show="activeTab === 'advice'" class="advice-section">
        <div class="section-header">
          <h4>個性化建議</h4>
          <el-tag type="warning" size="small"
            >{{ quickAdvice.length }} 條建議</el-tag
          >
        </div>

        <div class="advice-categories">
          <div
            v-for="(category, index) in adviceCategories"
            :key="index"
            class="category-section"
          >
            <div class="category-header">
              <div class="category-icon">{{ category.icon }}</div>
              <h5 class="category-title">{{ category.title }}</h5>
              <el-tag :type="category.priority" size="small">
                {{ category.label }}
              </el-tag>
            </div>

            <div class="advice-list">
              <div
                v-for="(advice, adviceIndex) in category.items"
                :key="adviceIndex"
                class="advice-item"
                @click="selectAdvice(advice, index, adviceIndex)"
              >
                <div class="advice-priority">
                  <span
                    class="priority-badge"
                    :class="getAdvicePriority(index, adviceIndex)"
                  >
                    {{ getAdviceLevel(index, adviceIndex) }}
                  </span>
                </div>
                <div class="advice-content">
                  <p class="advice-text">{{ advice }}</p>
                </div>
                <div class="advice-action">
                  <el-button size="small" type="primary" text> 詳細 </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 行動清單 -->
        <div class="action-checklist">
          <h5>本週行動清單</h5>
          <div class="checklist-items">
            <el-checkbox-group v-model="completedActions">
              <div
                v-for="(action, index) in weeklyActions"
                :key="index"
                class="checklist-item"
              >
                <el-checkbox :label="index" class="action-checkbox">
                  {{ action }}
                </el-checkbox>
                <span class="action-date">{{ getActionDate(index) }}</span>
              </div>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部導航/操作區 -->
    <div class="bottom-actions">
      <div class="progress-indicator">
        <span class="progress-text">閱讀進度:</span>
        <el-progress
          :percentage="readingProgress"
          :show-text="false"
          :stroke-width="4"
        />
        <span class="progress-value">{{ readingProgress }}%</span>
      </div>

      <div class="action-buttons">
        <el-button
          v-if="canDowngrade"
          :icon="ArrowLeft"
          size="small"
          @click="$emit('downgradeRequested')"
        >
          簡要預覽
        </el-button>

        <el-button
          v-if="canUpgrade"
          type="primary"
          :icon="ArrowRight"
          size="small"
          @click="$emit('upgradeRequested')"
        >
          標準解讀
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  User,
  TrendCharts,
  Lightning,
  ArrowLeft,
  ArrowRight,
} from '@element-plus/icons-vue';

// Props
interface Props {
  personalityHighlights: string[];
  fortuneTrends: string[];
  quickAdvice: string[];
  dataCompleteness: number;
  canUpgrade?: boolean;
  canDowngrade?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  timestamp?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  canUpgrade: true,
  canDowngrade: true,
  isMobile: false,
  isTablet: false,
  timestamp: () => new Date(),
});

// Emits
const emit = defineEmits<{
  upgradeRequested: [];
  downgradeRequested: [];
  highlightSelected: [highlight: string, index: number];
  adviceSelected: [advice: string, categoryIndex: number, adviceIndex: number];
  tabChanged: [tab: string];
}>();

// 響應式狀態
const activeTab = ref('personality');
const completedActions = ref<number[]>([]);
const readingProgress = ref(0);

// 計算屬性
const personalityDimensions = computed(() => [
  { name: '外向性', score: 75 },
  { name: '穩定性', score: 85 },
  { name: '責任感', score: 90 },
  { name: '親和力', score: 80 },
  { name: '創新性', score: 70 },
]);

const adviceCategories = computed(() => [
  {
    title: '人際關係',
    icon: '👥',
    priority: 'warning',
    label: '重要',
    items: props.quickAdvice.filter((_, i) => i % 3 === 0),
  },
  {
    title: '事業發展',
    icon: '💼',
    priority: 'success',
    label: '機會',
    items: props.quickAdvice.filter((_, i) => i % 3 === 1),
  },
  {
    title: '健康養生',
    icon: '🏃‍♂️',
    priority: 'info',
    label: '提醒',
    items: props.quickAdvice.filter((_, i) => i % 3 === 2),
  },
]);

const keyDates = computed(() => [
  {
    time: '本週三',
    event: '重要決策最佳時機',
    type: 'success',
    importance: '佳時',
  },
  {
    time: '下週一',
    event: '避免重大變動',
    type: 'warning',
    importance: '注意',
  },
  { time: '月底', event: '財運轉機期', type: 'success', importance: '機會' },
]);

const weeklyActions = computed(() => [
  '與重要人士深入溝通',
  '制定下月工作計劃',
  '安排健康檢查',
  '整理重要文件',
  '學習新技能或知識',
]);

// 方法
const selectHighlight = (highlight: string, index: number) => {
  emit('highlightSelected', highlight, index);
};

const selectAdvice = (
  advice: string,
  categoryIndex: number,
  adviceIndex: number,
) => {
  emit('adviceSelected', advice, categoryIndex, adviceIndex);
};

const getHighlightType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info'];
  return types[index % types.length];
};

const getPersonalityIcon = (index: number) => {
  const icons = ['🌟', '💎', '🎯', '🔥', '⚡', '💫', '🚀', '💡'];
  return icons[index % icons.length];
};

const getTraitScore = (index: number) => {
  return Math.max(3, 5 - (index % 3));
};

const extractTitle = (highlight: string) => {
  return highlight.substring(0, Math.min(8, highlight.length));
};

const extractDescription = (highlight: string) => {
  return highlight.length > 8 ? highlight.substring(8) : highlight;
};

const getTrendPeriod = (index: number) => {
  const periods = ['近期運勢', '中期展望', '長遠趨勢'];
  return periods[index] || '未來發展';
};

const getTrendClass = (index: number) => {
  const classes = ['trend-good', 'trend-normal', 'trend-excellent'];
  return classes[index % classes.length];
};

const getTrendTagType = (index: number) => {
  const types = ['success', 'info', 'warning'];
  return types[index % types.length];
};

const getTrendStatus = (index: number) => {
  const statuses = ['上升', '平穩', '優秀'];
  return statuses[index % statuses.length];
};

const getTrendScore = (index: number) => {
  const scores = [75, 60, 85];
  return scores[index % scores.length];
};

const getTrendProgressStatus = (index: number) => {
  const scores = getTrendScore(index);
  if (scores >= 80) {
    return 'success';
  }
  if (scores >= 60) {
    return 'warning';
  }
  return 'exception';
};

const getBarClass = (score: number) => {
  if (score >= 80) {
    return 'bar-excellent';
  }
  if (score >= 60) {
    return 'bar-good';
  }
  return 'bar-normal';
};

const getAdvicePriority = (categoryIndex: number, adviceIndex: number) => {
  const priorities = ['priority-high', 'priority-medium', 'priority-low'];
  return priorities[(categoryIndex + adviceIndex) % priorities.length];
};

const getAdviceLevel = (categoryIndex: number, adviceIndex: number) => {
  const levels = ['高', '中', '低'];
  return levels[(categoryIndex + adviceIndex) % levels.length];
};

const getActionDate = (index: number) => {
  const dates = ['今天', '明天', '週三', '週四', '週五'];
  return dates[index % dates.length];
};

const updateReadingProgress = () => {
  const tabProgresses = {
    personality: 33,
    fortune: 66,
    advice: 100,
  };
  readingProgress.value =
    tabProgresses[activeTab.value as keyof typeof tabProgresses] || 0;
};

// 監聽器
watch(activeTab, (newTab) => {
  emit('tabChanged', newTab);
  updateReadingProgress();
});

watch(
  () => completedActions.value.length,
  (newLength) => {
    // 根據完成的行動數量調整進度
    if (activeTab.value === 'advice') {
      const baseProgress = 80;
      const actionProgress = (newLength / weeklyActions.value.length) * 20;
      readingProgress.value = Math.min(100, baseProgress + actionProgress);
    }
  },
);

// 生命週期
onMounted(() => {
  updateReadingProgress();
});
</script>

<style scoped>
.compact-reading-view {
  display: flex;
  flex-direction: column;
  min-height: 600px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.reading-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.level-icon {
  font-size: 28px;
}

.nav-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.nav-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.reading-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.reading-tabs :deep(.el-tabs__nav) {
  border: none;
}

.reading-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.reading-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  background: white;
  border-color: white;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f5f5f5;
}

.section-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.mobile .highlights-grid {
  grid-template-columns: 1fr;
}

.highlight-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #f0f0f0;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.highlight-card.primary {
  border-color: #409eff;
  background: #e6f4ff;
}

.highlight-card.success {
  border-color: #67c23a;
  background: #f0f9ff;
}

.highlight-card.warning {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.highlight-card.info {
  border-color: #909399;
  background: #f4f4f5;
}

.card-icon {
  font-size: 24px;
  min-width: 32px;
}

.card-content {
  flex: 1;
}

.highlight-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.highlight-desc {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.personality-radar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.personality-radar h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.radar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dimension-label {
  min-width: 60px;
  font-size: 13px;
  color: #666;
}

.dimension-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.bar-fill.bar-excellent {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
}

.bar-fill.bar-good {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
}

.bar-fill.bar-normal {
  background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
}

.dimension-score {
  min-width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.trends-timeline {
  position: relative;
  padding-left: 24px;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -24px;
  top: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #ddd;
}

.marker-dot.trend-good {
  background: #52c41a;
  box-shadow: 0 0 0 2px #52c41a;
}

.marker-dot.trend-normal {
  background: #1890ff;
  box-shadow: 0 0 0 2px #1890ff;
}

.marker-dot.trend-excellent {
  background: #722ed1;
  box-shadow: 0 0 0 2px #722ed1;
}

.marker-line {
  position: absolute;
  left: 5px;
  top: 16px;
  width: 2px;
  height: 40px;
  background: #ddd;
}

.timeline-content {
  padding-left: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.timeline-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.timeline-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 12px;
  color: #666;
}

.score-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.advice-categories {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.category-icon {
  font-size: 20px;
}

.category-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.advice-list {
  padding: 12px;
}

.advice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.advice-item:hover {
  background: #f5f5f5;
}

.advice-priority {
  min-width: 40px;
}

.priority-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.priority-badge.priority-high {
  background: #ff4d4f;
}

.priority-badge.priority-medium {
  background: #faad14;
}

.priority-badge.priority-low {
  background: #52c41a;
}

.advice-content {
  flex: 1;
}

.advice-text {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.action-checklist {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.action-checklist h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.action-checkbox {
  flex: 1;
}

.action-date {
  font-size: 12px;
  color: #666;
  margin-left: 12px;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text,
.progress-value {
  font-size: 12px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 響應式設計 */
.mobile .content-area {
  padding: 16px;
}

.mobile .highlights-grid {
  gap: 12px;
}

.mobile .timeline-score {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.mobile .bottom-actions {
  flex-direction: column;
  gap: 12px;
}

/* 動畫效果 */
.highlight-card {
  animation: slideInLeft 0.4s ease;
}

.timeline-item {
  animation: slideInRight 0.4s ease;
}

.advice-item {
  animation: fadeInUp 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
</style>
