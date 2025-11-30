<template>
  <div v-if="props.bazi" class="bazi-chart section-card">
    <h4>八字命盤</h4>
    <div class="pillars-container">
      <div
        v-for="pillarKey in pillarOrder"
        :key="pillarKey"
        class="pillar-card-display"
        :class="{ highlighted: props.highlightedPillars?.includes(pillarKey) }"
      >
        <h5>{{ getPillarName(pillarKey) }}</h5>
        <div class="stem-branch">
          <span class="char">{{ props.bazi[pillarKey].stem }}</span>
          <span class="label"> ({{ props.bazi[pillarKey].stemElement }})</span>
          <span
            v-if="props.tenGods && tenGodsForPillars[pillarKey]"
            class="ten-god"
          >
            {{ tenGodsForPillars[pillarKey] }}
          </span>
        </div>
        <div class="stem-branch">
          <span class="char">{{ props.bazi[pillarKey].branch }}</span>
          <span class="label">
            ({{ props.bazi[pillarKey].branchElement }})</span
          >
          <!-- 地支藏干及其十神可以後續添加 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { BaziResult, TenGodsPillars } from '../types/baziTypes';

type PillarKey = 'hourPillar' | 'dayPillar' | 'monthPillar' | 'yearPillar';

const props = defineProps({
  bazi: {
    type: Object as PropType<BaziResult>,
    required: true,
  },
  tenGods: {
    type: Object as PropType<TenGodsPillars | null>,
    default: null,
  },
  highlightedPillars: {
    type: Array as PropType<PillarKey[]>,
    default: () => [],
  },
});

// 確保柱子從右到左顯示 (時日月年) - 傳統排盤習慣
const pillarOrder: PillarKey[] = [
  'hourPillar',
  'dayPillar',
  'monthPillar',
  'yearPillar',
];

const getPillarName = (key: PillarKey): string => {
  switch (key) {
    case 'yearPillar':
      return '年柱';
    case 'monthPillar':
      return '月柱';
    case 'dayPillar':
      return '日柱';
    case 'hourPillar':
      return '時柱';
    default:
      return '';
  }
};

const tenGodsForPillars = computed(() => {
  if (!props.tenGods || !props.bazi) {
    return {
      yearPillar: '',
      monthPillar: '',
      dayPillar: '', // 日主通常不顯示自身十神，或標為日主
      hourPillar: '',
    };
  }
  return {
    yearPillar: props.tenGods.yearPillar,
    monthPillar: props.tenGods.monthPillar,
    dayPillar: props.tenGods.dayPillar, // 這裡顯示的是日干對日干的十神，即比肩/劫財
    hourPillar: props.tenGods.hourPillar,
  };
});
</script>

<style scoped>
.bazi-chart {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.bazi-chart h4 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.pillars-container {
  display: flex;
  justify-content: space-around; /* 從右到左排列，所以用 row-reverse */
  flex-direction: row-reverse; /* 傳統排盤：時日月年 */
  flex-wrap: wrap-reverse; /* 允許換行，並保持反向順序 */
  gap: 10px;
  text-align: center;
}

.pillar-card-display {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  min-width: 70px; /* 確保每個柱子有足夠寬度 */
}

.pillar-card-display.highlighted {
  border-color: #42b983;
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.5);
}

.pillar-card-display h5 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1em;
  color: #555;
}

.stem-branch {
  margin-bottom: 5px;
}

.char {
  font-size: 1.4em; /* 放大干支字體 */
  font-weight: bold;
  color: #333;
}

.label {
  font-size: 0.8em;
  color: #666;
}

.ten-god {
  display: block;
  font-size: 0.85em;
  color: #42b983; /* 十神用主題色 */
  margin-top: 2px;
}
</style>
