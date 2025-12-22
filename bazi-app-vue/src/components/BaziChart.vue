<template>
  <div v-if="props.bazi" class="bazi-chart section-card">
    <h4>八字命盤</h4>
    <div class="pillars-container">
      <div
        v-for="pillarKey in pillarOrder"
        :key="pillarKey"
        class="pillar-card-display will-change-transform"
        :class="{
          highlighted: props.highlightedPillars?.includes(pillarKey),
          'day-master': pillarKey === 'dayPillar'
        }"
      >
        <h5>{{ getPillarName(pillarKey) }}</h5>
        <div class="stem-group">
          <span
            v-if="props.tenGods && tenGodsForPillars[pillarKey]"
            class="ten-god-pill"
          >
            {{ tenGodsForPillars[pillarKey] }}
          </span>
          <span
            class="char"
            :class="getElementClass(props.bazi[pillarKey].stemElement)"
          >
            {{ props.bazi[pillarKey].stem }}
          </span>
        </div>
        <div class="branch-group">
          <span
            class="char"
            :class="getElementClass(props.bazi[pillarKey].branchElement)"
          >
            {{ props.bazi[pillarKey].branch }}
          </span>
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

// Element color mapping for visual coding system
const getElementClass = (element: string): string => {
  const elementMap: Record<string, string> = {
    '木': 'element-wood',
    'Wood': 'element-wood',
    '火': 'element-fire',
    'Fire': 'element-fire',
    '土': 'element-earth',
    'Earth': 'element-earth',
    '金': 'element-metal',
    'Metal': 'element-metal',
    '水': 'element-water',
    'Water': 'element-water',
  };
  return elementMap[element] || '';
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
/* Mobile UX Optimization - 2025-12-22 */
/* Implements 4-column mobile layout with element color coding */
/* Based on: doc/BaziChart移動端優化分析.md */

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
  max-width: 100%;
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

/* Container: 4-column layout across all breakpoints */
.pillars-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(4px, 1.5vw, 10px);
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  direction: rtl; /* RTL for traditional reading order: 時日月年 */
}

/* Individual pillar card */
.pillar-card-display {
  direction: ltr; /* Reset direction for content */
  padding: clamp(8px, 2vw, 10px);
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background-color: var(--bg-primary);
  min-height: 44px; /* Minimum touch target */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.2s ease;
}

/* Day Master (日主) emphasis */
.pillar-card-display.day-master {
  border-width: 2px;
  border-color: var(--success);
  background-color: rgba(66, 185, 131, 0.05);
}

.pillar-card-display.day-master h5 {
  font-weight: 700;
  color: var(--success);
}

.pillar-card-display.highlighted {
  border-color: var(--success);
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.5);
}

/* Pillar header */
.pillar-card-display h5 {
  margin: 0 0 clamp(6px, 1.5vw, 8px) 0;
  font-size: clamp(0.75rem, 2.2vw, 0.9rem);
  color: var(--text-secondary);
  font-weight: 500;
}

/* Stem and Branch groups */
.stem-group,
.branch-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2px, 0.5vw, 4px);
  margin: clamp(4px, 1vw, 6px) 0;
  width: 100%;
}

/* Ten God pill style */
.ten-god-pill {
  display: inline-block;
  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
  padding: 2px 6px;
  border-radius: 10px;
  background-color: rgba(66, 185, 131, 0.15);
  color: var(--success);
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
}

/* Chinese characters (Stems and Branches) */
.char {
  font-size: clamp(1.1rem, 3.5vw, 1.4rem);
  font-weight: 700;
  line-height: 1.2;
}

/* Element color coding system */
.element-wood {
  color: #4caf50; /* Green */
}

.element-fire {
  color: #f44336; /* Red */
}

.element-earth {
  color: #795548; /* Brown */
}

.element-metal {
  color: #9e9e9e; /* Gray/Silver */
}

.element-water {
  color: #2196f3; /* Blue */
}

/* Mobile optimization (< 768px) */
@media (max-width: 767px) {
  .pillars-container {
    gap: 4px; /* Tighter spacing for mobile */
  }

  .pillar-card-display {
    padding: 6px 2px; /* Reduce horizontal padding significantly */
    min-height: 44px;
  }

  .pillar-card-display h5 {
    font-size: 0.7rem;
    margin-bottom: 4px;
  }

  .ten-god-pill {
    font-size: 0.6rem;
    padding: 1px 4px;
  }

  .char {
    font-size: 1.1rem;
  }

  .stem-group,
  .branch-group {
    margin: 3px 0;
    gap: 2px;
  }
}

/* Tablet optimization (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .pillars-container {
    gap: 8px;
  }

  .pillar-card-display {
    padding: 10px 6px;
  }

  .char {
    font-size: 1.3rem;
  }
}

/* Desktop optimization (>= 1024px) */
@media (min-width: 1024px) {
  .pillars-container {
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
  }

  .pillar-card-display {
    padding: 12px 10px;
  }

  .char {
    font-size: 1.5rem;
  }

  .ten-god-pill {
    font-size: 0.8rem;
    padding: 3px 8px;
  }
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .pillar-card-display {
    transition: none;
  }
}

/* High contrast support */
@media (prefers-contrast: high) {
  .pillar-card-display {
    border-width: 2px;
  }

  .element-wood,
  .element-fire,
  .element-earth,
  .element-metal,
  .element-water {
    font-weight: 900;
  }
}
</style>
