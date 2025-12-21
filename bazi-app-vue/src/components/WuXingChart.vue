<template>
  <div class="wuxing-chart">
    <div class="chart-container">
      <div v-for="element in elements" :key="element.name" class="element-bar">
        <div class="element-info">
          <span class="element-name" :style="{ color: element.color }">{{
            element.name
          }}</span>
          <span class="element-scores">
            <span class="raw-score">{{ element.raw }}</span>
            <span class="separator">/</span>
            <span class="adjusted-score">{{ element.adjusted }}</span>
          </span>
        </div>
        <div class="bar-track">
          <div
            class="bar-fill raw will-change-transform"
            :style="{
              width: getBarWidth(element.raw),
              backgroundColor: element.color,
              opacity: 0.3,
            }"
          />
          <div
            class="bar-fill adjusted will-change-transform"
            :style="{
              width: getBarWidth(element.adjusted),
              backgroundColor: element.color,
            }"
          />
        </div>
      </div>
    </div>

    <div class="summary">
      <el-tag v-if="distribution.dominant" type="success" size="large">
        優勢: {{ distribution.dominant }}
      </el-tag>
      <el-tag v-if="distribution.deficient" type="warning" size="large">
        缺失: {{ distribution.deficient }}
      </el-tag>
      <el-tag type="info" size="large">
        平衡度: {{ ((distribution.balance ?? 0) * 100).toFixed(1) }}%
      </el-tag>
    </div>

    <div class="legend">
      <span class="legend-item">
        <span class="legend-dot raw" />
        原始得分
      </span>
      <span class="legend-item">
        <span class="legend-dot adjusted" />
        月令調整後
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface WuXingDistribution {
  raw: { 木: number; 火: number; 土: number; 金: number; 水: number };
  adjusted: { 木: number; 火: number; 土: number; 金: number; 水: number };
  dominant: string | null;
  deficient: string | null;
  balance: number;
}

interface Props {
  distribution: WuXingDistribution;
}

const props = defineProps<Props>();

const ELEMENT_COLORS: Record<string, string> = {
  木: '#10b981',
  火: '#ef4444',
  土: '#f59e0b',
  金: '#fbbf24',
  水: '#3b82f6',
};

const elements = computed(() => {
  const elementNames = ['木', '火', '土', '金', '水'];
  return elementNames.map((name) => ({
    name,
    raw: props.distribution.raw[name as keyof typeof props.distribution.raw],
    adjusted:
      props.distribution.adjusted[
        name as keyof typeof props.distribution.adjusted
      ],
    color: ELEMENT_COLORS[name],
  }));
});

const maxScore = computed(() => {
  const allScores = [
    ...Object.values(props.distribution.raw),
    ...Object.values(props.distribution.adjusted),
  ];
  return Math.max(...allScores, 10);
});

const getBarWidth = (score: number): string => {
  return `${(score / maxScore.value) * 100}%`;
};
</script>

<style scoped>
/* Design tokens applied - 2025-11-30 */
/* RWD optimization - 2025-12-03 */
/* Task 3.3: Responsive chart sizing - 2025-12-04 */
/* Task 3.4: Mobile performance optimization - 2025-12-04 */
/* Task: Fix mobile card overflow issues - 2025-12-05 */

*,
*::before,
*::after {
  box-sizing: border-box;
}

.wuxing-chart {
  padding: clamp(12px, 3vw, 16px);
  background: var(--bg-primary);
  border-radius: 8px;
  max-width: 100%; /* Ensure container responsiveness */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 16px);
  margin-bottom: clamp(16px, 4vw, 20px);
  width: 100%; /* Full width within parent */
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box;
  overflow: hidden;
}

.element-bar {
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 1.2vw, 6px);
  box-sizing: border-box;
}

.element-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(13px, 3.2vw, 14px);
  box-sizing: border-box;
}

.element-name {
  font-weight: 600;
  font-size: clamp(15px, 3.8vw, 16px);
}

.element-scores {
  color: var(--text-secondary);
  font-size: clamp(12px, 3vw, 13px);
}

.raw-score {
  color: var(--text-tertiary);
}

.separator {
  margin: 0 4px;
  color: var(--border-light);
}

.adjusted-score {
  color: var(--text-primary);
  font-weight: 600;
}

/* Mobile: Taller bars for better visibility */
/* Responsive sizing with aspect ratio optimization */
.bar-track {
  position: relative;
  height: clamp(28px, 7vw, 32px); /* 移動端增加高度 */
  background: var(--bg-secondary);
  border-radius: 6px;
  overflow: hidden;
  min-height: 28px; /* 確保最小高度 */
  width: 100%; /* Auto-resize with container */
  max-width: 100%;
  box-sizing: border-box;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 6px;
  box-sizing: border-box;
}

/* Reduce animations on mobile if user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .bar-fill {
    transition: none;
  }
}

.bar-fill.raw {
  z-index: 1;
}

.bar-fill.adjusted {
  z-index: 2;
}

.summary {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 12px);
  margin-bottom: clamp(12px, 3vw, 16px);
  flex-wrap: wrap;
  box-sizing: border-box;
}

.legend {
  display: flex;
  justify-content: center;
  gap: clamp(12px, 3vw, 16px);
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--text-tertiary);
  box-sizing: border-box;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: clamp(5px, 1.2vw, 6px);
}

.legend-dot {
  width: clamp(10px, 2.5vw, 12px);
  height: clamp(10px, 2.5vw, 12px);
  border-radius: 2px;
  flex-shrink: 0; /* 防止縮小 */
}

.legend-dot.raw {
  background: var(--border-dark);
  opacity: 0.5;
}

.legend-dot.adjusted {
  background: var(--text-secondary);
}

/* Tablet: Standard sizes */
@media (min-width: 768px) {
  .bar-track {
    height: 32px;
  }
}

/* Mobile-specific data refinement (< 768px) */
@media (max-width: 767px) {
  /* Hide raw scores on mobile - show only adjusted */
  .raw-score,
  .separator {
    display: none;
  }

  /* Hide legend on mobile - focus on core KPIs */
  .legend {
    display: none;
  }

  /* Hide raw bar on mobile - show only adjusted */
  .bar-fill.raw {
    display: none;
  }

  /* Emphasize summary tags on mobile */
  .summary {
    margin-bottom: var(--space-lg);
  }

  .summary .el-tag {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
}

/* Desktop: Larger display */
@media (min-width: 1024px) {
  .bar-track {
    height: 36px;
  }
}
</style>
