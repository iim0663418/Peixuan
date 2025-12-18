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
  neutral: { text: '平', class: 'brightness-neutral' },
  trapped: { text: '陷', class: 'brightness-trapped' },
  // Chinese keys (fallback)
  廟: { text: '廟', class: 'brightness-temple' },
  旺: { text: '旺', class: 'brightness-prosperous' },
  得: { text: '得', class: 'brightness-advantageous' },
  利: { text: '利', class: 'brightness-neutral' },
  平: { text: '平', class: 'brightness-neutral' },
  不: { text: '不', class: 'brightness-neutral' },
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

/* Semantic Colors */
.brightness-temple {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d32f2f; /* Red-700 */
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.brightness-prosperous {
  background-color: rgba(255, 87, 34, 0.1);
  color: #e64a19; /* Orange-700 */
  border: 1px solid rgba(255, 87, 34, 0.2);
}

.brightness-advantageous {
  background-color: rgba(76, 175, 80, 0.1);
  color: #388e3c; /* Green-700 */
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.brightness-neutral {
  background-color: rgba(33, 150, 243, 0.1);
  color: #1976d2; /* Blue-700 */
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.brightness-trapped {
  background-color: rgba(158, 158, 158, 0.1);
  color: #616161; /* Grey-700 */
  border: 1px solid rgba(158, 158, 158, 0.2);
}

/* Dark mode adjustments (using CSS variables if available, otherwise explicit) */
@media (prefers-color-scheme: dark) {
  .brightness-temple {
    background-color: rgba(255, 0, 0, 0.2);
    color: #ff8a80;
  }
  .brightness-prosperous {
    background-color: rgba(255, 87, 34, 0.2);
    color: #ff9e80;
  }
  .brightness-advantageous {
    background-color: rgba(76, 175, 80, 0.2);
    color: #b9f6ca;
  }
  .brightness-neutral {
    background-color: rgba(33, 150, 243, 0.2);
    color: #82b1ff;
  }
  .brightness-trapped {
    background-color: rgba(158, 158, 158, 0.2);
    color: #eeeeee;
  }
}
</style>
