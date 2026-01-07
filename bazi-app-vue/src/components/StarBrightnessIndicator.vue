<template>
  <span
    v-if="brightness"
    class="star-brightness"
    :class="brightnessClass"
    :title="brightnessText"
  >
    {{ brightnessText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  brightness: string;
}

const props = defineProps<Props>();

const brightnessMap: Record<string, { text: string; class: string }> = {
  // English keys (from backend)
  temple: { text: '廟', class: 'brightness-temple' },
  prosperous: { text: '旺', class: 'brightness-prosperous' },
  advantageous: { text: '得', class: 'brightness-advantageous' },
  neutral: { text: '平', class: 'brightness-ping' },
  trapped: { text: '陷', class: 'brightness-trapped' },
  // Chinese keys (fallback)
  廟: { text: '廟', class: 'brightness-temple' },
  旺: { text: '旺', class: 'brightness-prosperous' },
  得: { text: '得', class: 'brightness-advantageous' },
  利: { text: '利', class: 'brightness-li' },
  平: { text: '平', class: 'brightness-ping' },
  不: { text: '不', class: 'brightness-bu' },
  陷: { text: '陷', class: 'brightness-trapped' },
};

const normalizedBrightness = computed(() => {
  if (!props.brightness) {
    return null;
  }
  return (
    brightnessMap[props.brightness] || {
      text: props.brightness,
      class: 'brightness-neutral',
    }
  );
});

const brightnessText = computed(() => normalizedBrightness.value?.text || '');
const brightnessClass = computed(() => normalizedBrightness.value?.class || '');
</script>

<style scoped>
.star-brightness {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: bold;
  margin-left: 4px;
  line-height: 1.2;
}

/* Using Design Tokens - Brightness Levels */
.brightness-temple {
  background-color: var(--star-brightness-庙-bg);
  color: var(--star-brightness-庙);
  border: 1px solid var(--star-brightness-庙-border);
}

.brightness-prosperous {
  background-color: var(--star-brightness-旺-bg);
  color: var(--star-brightness-旺);
  border: 1px solid var(--star-brightness-旺-border);
}

.brightness-advantageous {
  background-color: var(--star-brightness-得-bg);
  color: var(--star-brightness-得);
  border: 1px solid var(--star-brightness-得-border);
}

.brightness-li {
  background-color: var(--star-brightness-利-bg);
  color: var(--star-brightness-利);
  border: 1px solid var(--star-brightness-利-border);
}

.brightness-ping {
  background-color: var(--star-brightness-平-bg);
  color: var(--star-brightness-平);
  border: 1px solid var(--star-brightness-平-border);
}

.brightness-bu {
  background-color: var(--star-brightness-不-bg);
  color: var(--star-brightness-不);
  border: 1px solid var(--star-brightness-不-border);
}

.brightness-trapped {
  background-color: var(--star-brightness-陷-bg);
  color: var(--star-brightness-陷);
  border: 1px solid var(--star-brightness-陷-border);
}
</style>
