<template>
  <div class="yearly-fate-timeline section-card">
    <h4>流年時間軸</h4>
    <div v-if="yearlyFatesToDisplay.length > 0" class="timeline-container">
      <input
        type="range"
        :min="0"
        :max="yearlyFatesToDisplay.length - 1"
        :value="selectedIndex"
        class="slider"
        @input="handleSliderChange"
      />
      <div class="timeline-info">
        <p>
          <strong>年份:</strong> {{ selectedYearData?.year }} ({{
            selectedYearData?.ganZhi
          }})
        </p>
        <p><strong>歲數:</strong> {{ selectedYearData?.age }}</p>
      </div>
      <div class="timeline-labels">
        <span>{{ yearlyFatesToDisplay[0]?.year }}</span>
        <span>{{
          yearlyFatesToDisplay[Math.floor(yearlyFatesToDisplay.length / 2)]
            ?.year
        }}</span>
        <span>{{
          yearlyFatesToDisplay[yearlyFatesToDisplay.length - 1]?.year
        }}</span>
      </div>
    </div>
    <p v-else>無法生成流年時間軸，請先完成八字排盤。</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import { type HeavenlyStem, type EarthlyBranch } from '../types/baziTypes';

// Solar 來自全局 window 物件（lunar.min.js）

export interface YearlyFateInfo {
  year: number;
  age: number;
  ganZhi: string; // 例如 "甲子"
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

const props = defineProps({
  birthYear: {
    type: Number as PropType<number | null>,
    required: false,
    default: null,
  },
  // 假設我們從父組件接收一個起始年份和要顯示的年數，或者一個預先計算好的列表
  // 為了簡化，我們先假設一個固定的範圍，例如從出生年開始的100年
  // 或者，父組件應該傳入一個已經計算好的 yearlyFates 列表
  // currentSelectedYear: Number, // 父組件傳入的當前選中年份
});

const emit = defineEmits(['yearSelected']);

const selectedIndex = ref(0);

// 生成從出生年開始的100個流年資訊
const yearlyFatesToDisplay = computed((): YearlyFateInfo[] => {
  if (
    !props.birthYear ||
    typeof window.Solar === 'undefined' ||
    typeof window.Lunar === 'undefined'
  ) {
    return [];
  }
  const fates: YearlyFateInfo[] = [];
  for (let i = 0; i < 100; i++) {
    const currentYear = props.birthYear + i;
    try {
      // 使用公曆年的1月1日來獲取該年的干支
      // 注意：嚴格的流年干支是以立春為界，這裡簡化處理
      const solarDate = window.Solar.fromYmd(currentYear, 1, 1);
      const lunarDate = solarDate.getLunar();
      const yearGan = lunarDate.getYearGanExact() as HeavenlyStem;
      const yearZhi = lunarDate.getYearZhiExact() as EarthlyBranch;

      fates.push({
        year: currentYear,
        age: currentYear - props.birthYear + 1, // 週歲 + 1 = 虛歲 (近似)
        ganZhi: `${yearGan}${yearZhi}`,
        stem: yearGan,
        branch: yearZhi,
      });
    } catch (e) {
      console.error(`Error generating fate for year ${currentYear}:`, e);
    }
  }
  return fates;
});

const selectedYearData = computed((): YearlyFateInfo | null => {
  if (
    yearlyFatesToDisplay.value.length > 0 &&
    selectedIndex.value < yearlyFatesToDisplay.value.length
  ) {
    return yearlyFatesToDisplay.value[selectedIndex.value];
  }
  return null;
});

const handleSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedIndex.value = parseInt(target.value, 10);
};

watch(selectedYearData, (newValue) => {
  if (newValue) {
    emit('yearSelected', newValue);
  }
});

// 如果需要根據外部傳入的年份來初始化滑塊
// watch(() => props.currentSelectedYear, (newVal) => {
//   if (newVal !== undefined) {
//     const index = yearlyFatesToDisplay.value.findIndex(fate => fate.year === newVal);
//     if (index !== -1) {
//       selectedIndex.value = index;
//     }
//   }
// }, { immediate: true });

defineExpose({
  yearlyFatesToDisplay,
  selectedYearData,
});
</script>

<style scoped>
.yearly-fate-timeline {
  margin-top: 20px;
  padding: 15px;
}

/* Design tokens applied - 2025-11-30 */
.yearly-fate-timeline h4 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  font-weight: 600;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider {
  width: 80%;
  margin-bottom: 15px;
  cursor: pointer;
}

.timeline-info {
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.timeline-info p {
  margin: 5px 0;
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  width: 80%;
  font-size: 0.9em;
  color: var(--text-tertiary);
}
</style>
