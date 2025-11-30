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
            class="bar-fill raw"
            :style="{
              width: getBarWidth(element.raw),
              backgroundColor: element.color,
              opacity: 0.3,
            }"
          />
          <div
            class="bar-fill adjusted"
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
        平衡度: {{ (distribution.balance * 100).toFixed(1) }}%
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
.wuxing-chart {
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.element-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.element-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.element-name {
  font-weight: 600;
  font-size: 16px;
}

.element-scores {
  color: var(--text-secondary);
  font-size: 13px;
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

.bar-track {
  position: relative;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 6px;
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
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.raw {
  background: var(--border-dark);
  opacity: 0.5;
}

.legend-dot.adjusted {
  background: var(--text-secondary);
}
</style>
