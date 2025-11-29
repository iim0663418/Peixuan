<template>
  <div class="current-year-fortune">
    <!-- 今年運勢分析容器 -->
    <div class="fortune-container">
      <h3 class="fortune-title">
        <span class="title-icon">🎯</span>
        {{ currentYear }}年運勢分析
      </h3>

      <!-- 整體運勢評分 -->
      <div class="overall-fortune-section">
        <div class="score-display">
          <div class="score-circle" :class="[`score-${overallFortune.grade}`]">
            <div class="score-value">{{ overallFortune.score }}</div>
            <div class="score-label">分</div>
          </div>
          <div class="score-info">
            <div class="grade-title">
              {{ getGradeTitle(overallFortune.grade) }}
            </div>
            <div class="fortune-summary">{{ overallFortune.summary }}</div>
          </div>
        </div>
      </div>

      <!-- 各宮位流年吉凶狀態 -->
      <div class="palace-fortune-section">
        <h4 class="section-title">
          <span class="section-icon">🏰</span>
          各宮位流年運勢
        </h4>
        <div class="palace-grid">
          <div
            v-for="palace in palaceFortuneStatuses"
            :key="palace.palaceIndex"
            class="palace-item"
            :class="[`fortune-${palace.status}`]"
            @click="onPalaceClick(palace)"
          >
            <div class="palace-name">
              {{ palace.palaceName.replace('宮', '') }}
            </div>
            <div
              class="fortune-indicator"
              :class="[`indicator-${palace.status}`]"
            >
              {{ getStatusText(palace.status) }}
            </div>
            <div class="palace-score">{{ palace.score }}分</div>
          </div>
        </div>
      </div>

      <!-- 重要星曜提示 -->
      <div class="important-stars-section">
        <h4 class="section-title">
          <span class="section-icon">⭐</span>
          重要星曜提示
        </h4>
        <div class="star-tips-list">
          <div
            v-for="(tip, index) in importantStarTips"
            :key="`tip-${index}`"
            class="star-tip"
            :class="[`tip-${tip.type}`]"
          >
            <div class="tip-header">
              <span class="tip-icon">{{ getTipIcon(tip.type) }}</span>
              <span class="tip-stars">{{ tip.stars.join('、') }}</span>
            </div>
            <div class="tip-description">{{ tip.description }}</div>
          </div>
        </div>
      </div>

      <!-- 流年重點提醒 -->
      <div class="year-highlights-section">
        <h4 class="section-title">
          <span class="section-icon">📅</span>
          流年重點提醒
        </h4>
        <div class="highlights-timeline">
          <div
            v-for="(highlight, index) in yearHighlights"
            :key="`highlight-${index}`"
            class="highlight-item"
            :class="[`highlight-${highlight.type}`]"
          >
            <div class="highlight-period">{{ highlight.period }}</div>
            <div class="highlight-content">
              <div class="highlight-title">{{ highlight.title }}</div>
              <div class="highlight-description">
                {{ highlight.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 今年行動建議 -->
      <div class="action-advice-section">
        <h4 class="section-title">
          <span class="section-icon">💡</span>
          今年行動建議
        </h4>
        <div class="advice-cards">
          <div
            v-for="(advice, index) in actionAdvice"
            :key="`advice-${index}`"
            class="advice-card"
            :class="[`priority-${advice.priority}`]"
          >
            <div class="advice-header">
              <span class="priority-badge">{{
                getPriorityText(advice.priority)
              }}</span>
              <span class="advice-category">{{ advice.category }}</span>
            </div>
            <div class="advice-content">{{ advice.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getUnifiedSessionData } from '@/utils/enhancedStorageService';
import type { PurpleStarChart, Palace, Star } from '@/types/astrologyTypes';

// Props
interface Props {
  chartData?: PurpleStarChart;
  transformationFlows?: Record<
    number,
    {
      palaceIndex: number;
      palaceName: string;
      energyScore: number;
      majorInfluences: string[];
    }
  >;
  multiLayerEnergies?: Record<
    number,
    {
      palaceIndex: number;
      palaceName: string;
      baseEnergy: number;
      daXianEnergy: number;
      liuNianEnergy: number;
      totalEnergy: number;
      interpretation: string;
    }
  >;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  palaceClick: [palaceIndex: number];
}>();

// 獲取當前年份
const currentYear = new Date().getFullYear();

// 星曜吉凶評分映射
const starFortuneScores: Record<string, number> = {
  // 主星
  紫微: 8,
  天機: 6,
  太陽: 7,
  武曲: 7,
  天同: 6,
  廉貞: 5,
  天府: 8,
  太陰: 6,
  貪狼: 5,
  巨門: 4,
  天相: 7,
  天梁: 7,
  七殺: 4,
  破軍: 3,

  // 吉星
  文昌: 3,
  文曲: 3,
  左輔: 4,
  右弼: 4,
  天魁: 3,
  天鉞: 3,
  祿存: 5,
  天馬: 2,
  紅鸞: 2,
  天喜: 2,
  化祿: 5,
  化權: 4,
  化科: 3,

  // 凶星
  擎羊: -3,
  陀羅: -3,
  火星: -2,
  鈴星: -2,
  天空: -2,
  地劫: -2,
  化忌: -4,
};

// 宮位重要性權重
const palaceWeights: Record<string, number> = {
  命宮: 1.0,
  財帛宮: 0.9,
  官祿宮: 0.9,
  夫妻宮: 0.8,
  遷移宮: 0.7,
  疾厄宮: 0.7,
  田宅宮: 0.6,
  福德宮: 0.6,
  父母宮: 0.5,
  子女宮: 0.5,
  兄弟宮: 0.4,
  奴僕宮: 0.4,
};

// 計算整體運勢評分
const overallFortune = computed(() => {
  if (!props.chartData?.palaces) {
    return { score: 60, grade: 'average', summary: '命盤資料載入中...' };
  }

  let totalScore = 0;
  let weightSum = 0;

  props.chartData.palaces.forEach((palace) => {
    const weight = palaceWeights[palace.name] || 0.3;
    let palaceScore = 50; // 基礎分數

    // 計算星曜影響
    palace.stars.forEach((star) => {
      const starScore = starFortuneScores[star.name] || 0;

      // 考慮星曜亮度
      let brightnessMultiplier = 1;
      if (star.brightness) {
        const brightnessScores: Record<string, number> = {
          廟: 1.3,
          旺: 1.2,
          得地: 1.1,
          利益: 1.0,
          平和: 0.9,
          不得地: 0.8,
          落陷: 0.7,
        };
        brightnessMultiplier = brightnessScores[star.brightness] || 1;
      }

      palaceScore += starScore * brightnessMultiplier;
    });

    // 加入流年能量影響
    const energyFlow = props.transformationFlows?.[palace.index];
    if (energyFlow) {
      palaceScore += energyFlow.energyScore * 2;
    }

    const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
    if (multiLayerEnergy) {
      palaceScore += multiLayerEnergy.liuNianEnergy * 1.5;
    }

    totalScore += palaceScore * weight;
    weightSum += weight;
  });

  const finalScore = Math.round(totalScore / weightSum);
  const cappedScore = Math.max(0, Math.min(100, finalScore));

  let grade: string;
  let summary: string;

  if (cappedScore >= 85) {
    grade = 'excellent';
    summary = '今年運勢極佳，各方面都有很好的發展機會，把握時機積極進取。';
  } else if (cappedScore >= 70) {
    grade = 'good';
    summary = '今年運勢良好，整體發展順利，在關鍵領域會有不錯的表現。';
  } else if (cappedScore >= 55) {
    grade = 'average';
    summary = '今年運勢平穩，保持現狀為宜，避免過度冒險，穩中求進。';
  } else if (cappedScore >= 40) {
    grade = 'challenging';
    summary = '今年需要謹慎行事，可能會遇到一些挑戰，建議多做準備。';
  } else {
    grade = 'difficult';
    summary = '今年挑戰較多，需要格外小心，重點在於化解不利因素。';
  }

  return { score: cappedScore, grade, summary };
});

// 計算各宮位流年運勢狀態
const palaceFortuneStatuses = computed(() => {
  if (!props.chartData?.palaces) {
    return [];
  }

  return props.chartData.palaces.map((palace) => {
    let score = 50;

    // 計算宮位星曜影響
    palace.stars.forEach((star) => {
      const starScore = starFortuneScores[star.name] || 0;
      let multiplier = 1;
      if (star.brightness) {
        const multipliers: Record<string, number> = {
          廟: 1.3,
          旺: 1.2,
          得地: 1.1,
          平和: 0.9,
          不得地: 0.8,
          落陷: 0.7,
        };
        multiplier = multipliers[star.brightness] || 1;
      }
      score += starScore * multiplier;
    });

    // 加入流年影響
    const energyFlow = props.transformationFlows?.[palace.index];
    if (energyFlow) {
      score += energyFlow.energyScore * 2;
    }

    const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
    if (multiLayerEnergy) {
      score += multiLayerEnergy.liuNianEnergy * 1.5;
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    let status: string;
    if (finalScore >= 80) {
      status = 'excellent';
    } else if (finalScore >= 65) {
      status = 'good';
    } else if (finalScore >= 45) {
      status = 'average';
    } else if (finalScore >= 30) {
      status = 'challenging';
    } else {
      status = 'difficult';
    }

    return {
      palaceIndex: palace.index,
      palaceName: palace.name,
      score: finalScore,
      status,
    };
  });
});

// 重要星曜提示
const importantStarTips = computed(() => {
  const tips: Array<{
    type: 'auspicious' | 'warning' | 'neutral';
    stars: string[];
    description: string;
  }> = [];

  if (!props.chartData?.palaces) {
    return tips;
  }

  // 尋找化祿、化權、化科、化忌
  props.chartData.palaces.forEach((palace) => {
    const transformedStars = palace.stars.filter(
      (star) => star.transformations && star.transformations.length > 0,
    );

    transformedStars.forEach((star) => {
      star.transformations?.forEach((transformation) => {
        if (['祿', '權', '科'].includes(transformation)) {
          tips.push({
            type: 'auspicious',
            stars: [star.name],
            description: `${palace.name}有${star.name}化${transformation}，${getTransformationDescription(transformation, palace.name)}`,
          });
        } else if (transformation === '忌') {
          tips.push({
            type: 'warning',
            stars: [star.name],
            description: `${palace.name}有${star.name}化忌，需要注意${palace.name}相關事務，避免沖動決定。`,
          });
        }
      });
    });
  });

  return tips.slice(0, 6); // 限制顯示數量
});

// 流年重點提醒
const yearHighlights = computed(() => {
  return [
    {
      period: '春季 (1-3月)',
      type: 'opportunity',
      title: '新計劃啟動期',
      description: '適合開始新的計劃和投資，把握春季的生機勃勃。',
    },
    {
      period: '夏季 (4-6月)',
      type: 'caution',
      title: '謹慎推進期',
      description: '需要更加謹慎處理人際關係，避免不必要的爭執。',
    },
    {
      period: '秋季 (7-9月)',
      type: 'harvest',
      title: '收穫成果期',
      description: '前期努力開始見到成效，適合整合資源和擴大成果。',
    },
    {
      period: '冬季 (10-12月)',
      type: 'preparation',
      title: '準備調整期',
      description: '為明年做準備，適合學習充電和調整方向。',
    },
  ];
});

// 行動建議
const actionAdvice = computed(() => {
  const advice: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    content: string;
  }> = [];

  const { score } = overallFortune.value;

  if (score >= 70) {
    advice.push({
      priority: 'high',
      category: '事業發展',
      content: '今年運勢良好，可以積極擴展事業版圖，把握發展機會。',
    });
  } else if (score < 50) {
    advice.push({
      priority: 'high',
      category: '風險控制',
      content: '今年需要謹慎理財，避免大額投資，以穩健為主。',
    });
  }

  advice.push({
    priority: 'medium',
    category: '人際關係',
    content: '多維護重要的人際關係，適時尋求貴人相助。',
  });

  advice.push({
    priority: 'low',
    category: '健康養生',
    content: '注意身體健康，定期運動和體檢，保持良好作息。',
  });

  return advice;
});

// 輔助方法
const getGradeTitle = (grade: string): string => {
  const titles: Record<string, string> = {
    excellent: '運勢極佳',
    good: '運勢良好',
    average: '運勢平穩',
    challenging: '需要謹慎',
    difficult: '挑戰較多',
  };
  return titles[grade] || '運勢平穩';
};

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    excellent: '大吉',
    good: '吉',
    average: '平',
    challenging: '忌',
    difficult: '凶',
  };
  return texts[status] || '平';
};

const getTipIcon = (type: string): string => {
  const icons: Record<string, string> = {
    auspicious: '✨',
    warning: '⚠️',
    neutral: '📌',
  };
  return icons[type] || '📌';
};

const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    high: '重要',
    medium: '建議',
    low: '參考',
  };
  return texts[priority] || '建議';
};

const getTransformationDescription = (
  transformation: string,
  palaceName: string,
): string => {
  const descriptions: Record<string, string> = {
    祿: `有利於${palaceName}相關的財務收入和資源累積。`,
    權: `在${palaceName}領域能夠掌握主導權和話語權。`,
    科: `有助於提升${palaceName}相關的名聲和學識。`,
  };
  return descriptions[transformation] || '帶來正面影響。';
};

// 事件處理
const onPalaceClick = (palace: any) => {
  emit('palaceClick', palace.palaceIndex);
};
</script>

<style scoped>
.current-year-fortune {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.fortune-container {
  max-width: 1200px;
  margin: 0 auto;
}

.fortune-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 30px;
}

.title-icon {
  margin-right: 10px;
  font-size: 32px;
}

/* 整體運勢評分樣式 */
.overall-fortune-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.score-display {
  display: flex;
  align-items: center;
  gap: 30px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 4px solid;
}

.score-excellent {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}
.score-good {
  border-color: #17a2b8;
  background: rgba(23, 162, 184, 0.1);
}
.score-average {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}
.score-challenging {
  border-color: #fd7e14;
  background: rgba(253, 126, 20, 0.1);
}
.score-difficult {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
}

.score-label {
  font-size: 14px;
  color: #6c757d;
  margin-top: -5px;
}

.score-info {
  flex: 1;
}

.grade-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.fortune-summary {
  font-size: 16px;
  color: #495057;
  line-height: 1.5;
}

/* 宮位運勢樣式 */
.palace-fortune-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 10px;
  font-size: 24px;
}

.palace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.palace-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.palace-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.fortune-excellent {
  border-color: #28a745;
}
.fortune-good {
  border-color: #17a2b8;
}
.fortune-average {
  border-color: #ffc107;
}
.fortune-challenging {
  border-color: #fd7e14;
}
.fortune-difficult {
  border-color: #dc3545;
}

.palace-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.fortune-indicator {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  display: inline-block;
}

.indicator-excellent {
  background: #28a745;
  color: white;
}
.indicator-good {
  background: #17a2b8;
  color: white;
}
.indicator-average {
  background: #ffc107;
  color: #212529;
}
.indicator-challenging {
  background: #fd7e14;
  color: white;
}
.indicator-difficult {
  background: #dc3545;
  color: white;
}

.palace-score {
  font-size: 14px;
  color: #6c757d;
}

/* 星曜提示樣式 */
.important-stars-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.star-tips-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.star-tip {
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid;
}

.tip-auspicious {
  background: rgba(40, 167, 69, 0.05);
  border-left-color: #28a745;
}

.tip-warning {
  background: rgba(220, 53, 69, 0.05);
  border-left-color: #dc3545;
}

.tip-neutral {
  background: rgba(108, 117, 125, 0.05);
  border-left-color: #6c757d;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tip-icon {
  font-size: 18px;
}

.tip-stars {
  font-weight: 600;
  color: #2c3e50;
}

.tip-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.4;
}

/* 流年重點樣式 */
.year-highlights-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.highlights-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.highlight-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid;
}

.highlight-opportunity {
  border-left-color: #28a745;
}
.highlight-caution {
  border-left-color: #ffc107;
}
.highlight-harvest {
  border-left-color: #fd7e14;
}
.highlight-preparation {
  border-left-color: #6f42c1;
}

.highlight-period {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.highlight-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.highlight-description {
  font-size: 14px;
  color: #495057;
  line-height: 1.4;
}

/* 行動建議樣式 */
.action-advice-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.advice-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.advice-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid;
}

.priority-high {
  border-left-color: #dc3545;
}
.priority-medium {
  border-left-color: #ffc107;
}
.priority-low {
  border-left-color: #6c757d;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.priority-badge {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.advice-category {
  font-weight: 600;
  color: #2c3e50;
}

.advice-content {
  color: #495057;
  line-height: 1.5;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .current-year-fortune {
    padding: 15px;
  }

  .fortune-title {
    font-size: 24px;
  }

  .score-display {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .palace-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .highlights-timeline {
    grid-template-columns: 1fr;
  }
}
</style>
