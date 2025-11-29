<template>
  <div class="star-brightness-indicator">
    <span
      :class="['brightness-badge', `brightness-${brightness}`]"
      :title="getBrightnessDescription(brightness)"
    >
      {{ brightness }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  brightness?: string;
}

const props = defineProps<Props>();

const getBrightnessDescription = (brightness?: string): string => {
  const descriptions: Record<string, string> = {
    廟: '星曜最強勢，能量發揮到極致',
    旺: '星曜強勢，表現優異',
    得地: '星曜穩定，表現良好',
    利益: '星曜平穩，有一定助益',
    平和: '星曜中性，影響適中',
    不得地: '星曜較弱，影響有限',
    落陷: '星曜最弱，需要調和',
  };
  return descriptions[brightness || ''] || '亮度未知';
};
</script>

<style scoped>
.star-brightness-indicator {
  display: inline-block;
  margin-left: 2px;
}

.brightness-badge {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1.2;
  min-width: 16px;
  text-align: center;
  color: white;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

/* 亮度顏色配置 */
.brightness-廟 {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  box-shadow: 0 0 4px rgba(255, 82, 82, 0.5);
}

.brightness-旺 {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  box-shadow: 0 0 3px rgba(245, 124, 0, 0.4);
}

.brightness-得地 {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  box-shadow: 0 0 3px rgba(56, 142, 60, 0.4);
}

.brightness-利益 {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  box-shadow: 0 0 3px rgba(25, 118, 210, 0.4);
}

.brightness-平和 {
  background: linear-gradient(135deg, #9e9e9e, #757575);
  box-shadow: 0 0 2px rgba(117, 117, 117, 0.3);
}

.brightness-不得地 {
  background: linear-gradient(135deg, #795548, #5d4037);
  box-shadow: 0 0 2px rgba(93, 64, 55, 0.3);
}

.brightness-落陷 {
  background: linear-gradient(135deg, #607d8b, #455a64);
  box-shadow: 0 0 2px rgba(69, 90, 100, 0.3);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .brightness-badge {
    font-size: 9px;
    padding: 1px 3px;
    min-width: 14px;
  }
}
</style>
