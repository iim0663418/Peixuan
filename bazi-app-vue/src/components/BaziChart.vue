<template>
  <div v-if="props.bazi" class="bazi-chart section-card">
    <h4>八字命盤</h4>
    <div class="pillars-container">
      <div
        v-for="pillarKey in pillarOrder"
        :key="pillarKey"
        class="pillar-card-display will-change-transform"
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
            ({{ props.bazi[pillarKey].branchElement }})</span>
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

.bazi-chart {
  margin-top: clamp(16px, 4vw, 20px);
  padding: clamp(12px, 3vw, 15px);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background-color: var(--bg-secondary);
  max-width: 100%; /* Ensure container responsiveness */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.bazi-chart h4 {
  text-align: center;
  margin-top: 0;
  margin-bottom: clamp(12px, 3vw, 15px);
  color: var(--text-primary);
  font-weight: 600;
  font-size: clamp(14px, 3.5vw, 16px);
}

/* Mobile-first: Normal order, stack vertically if needed */
/* Responsive sizing with flex optimization */
.pillars-container {
  display: flex;
  justify-content: space-around;
  flex-direction: row-reverse; /* 傳統排盤：時日月年 */
  flex-wrap: wrap; /* 移動端允許換行 */
  gap: clamp(8px, 2vw, 10px);
  text-align: center;
  width: 100%; /* Full width within parent */
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.pillar-card-display {
  flex: 1 1 0; /* Equal flex basis with grow/shrink */
  min-width: 0; /* Allow flex items to shrink below content size */
  padding: clamp(8px, 2vw, 10px);
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background-color: var(--bg-primary);
  min-height: 44px; /* 觸控目標 */
  aspect-ratio: 0.8 / 1; /* Maintain vertical aspect ratio */
  box-sizing: border-box;
}

.pillar-card-display.highlighted {
  border-color: var(--success);
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.5);
}

.pillar-card-display h5 {
  margin-top: 0;
  margin-bottom: clamp(6px, 1.5vw, 8px);
  font-size: clamp(0.9em, 2.2vw, 1em);
  color: var(--text-secondary);
}

.stem-branch {
  margin-bottom: clamp(4px, 1vw, 5px);
}

.char {
  font-size: clamp(1.2em, 3vw, 1.4em); /* 響應式字體 */
  font-weight: bold;
  color: var(--text-primary);
}

.label {
  font-size: clamp(0.75em, 1.8vw, 0.8em);
  color: var(--text-tertiary);
}

.ten-god {
  display: block;
  font-size: clamp(0.8em, 2vw, 0.85em);
  color: var(--success);
  margin-top: 2px;
}

/* Tablet: Ensure 4 columns */
@media (min-width: 768px) {
  .pillar-card-display {
    min-width: 90px;
  }
}

/* Desktop: Larger display */
@media (min-width: 1024px) {
  .pillar-card-display {
    min-width: 100px;
  }

  .char {
    font-size: 1.4em;
  }
}

/* Mobile-specific data refinement (< 768px) */
@media (max-width: 767px) {
  /* 2-column layout on mobile for better space utilization */
  .pillars-container {
    flex-direction: row-reverse;
    gap: 0.75rem;
  }

  .pillar-card-display {
    flex: 1 1 calc(50% - 0.375rem); /* 2 columns with gap */
    min-width: 0;
    max-width: calc(50% - 0.375rem);
    aspect-ratio: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 0.75rem;
    box-sizing: border-box;
  }

  /* Vertical layout within each pillar */
  .pillar-card-display h5 {
    margin: 0 0 0.5rem 0;
    width: 100%;
    text-align: center;
  }

  .stem-branch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    margin: 0.25rem 0;
    width: 100%;
  }

  /* Keep labels visible but smaller on mobile */
  .label {
    font-size: 0.7rem;
  }

  /* Emphasize characters */
  .char {
    font-size: 1.3rem;
  }

  .ten-god {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    text-align: center;
  }
}

/* 無障礙: 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .bazi-chart * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
