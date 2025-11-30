<template>
  <div class="star-symmetry-display">
    <h4>星曜對稱關係</h4>
    <div class="symmetry-grid">
      <div
        v-for="sym in symmetries"
        :key="sym.star"
        class="symmetry-item"
        :class="`symmetry-${sym.symmetryType}`"
      >
        <div class="star-pair">
          <span class="star-name primary">{{ sym.star }}</span>
          <span class="symmetry-arrow">
            {{ sym.symmetryType === 'opposite' ? '←→' : '↔' }}
          </span>
          <span class="star-name secondary">{{ sym.symmetryPair }}</span>
        </div>
        <div class="position-info">
          <span class="position">{{ sym.position }}宮</span>
          <span class="separator">-</span>
          <span class="position">{{ sym.symmetryPosition }}宮</span>
        </div>
        <div class="symmetry-type">
          {{ sym.symmetryType === 'opposite' ? '對宮' : '配對' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface StarSymmetry {
  star: string;
  position: number;
  symmetryPair: string;
  symmetryPosition: number;
  symmetryType: 'opposite' | 'pair';
}

interface Props {
  starSymmetry: StarSymmetry[];
}

const props = defineProps<Props>();

// Group by symmetry type for better organization
const symmetries = computed(() => {
  // Remove duplicates (each pair appears twice in backend data)
  const seen = new Set<string>();
  return props.starSymmetry.filter((sym) => {
    const key = [sym.star, sym.symmetryPair].sort().join('-');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
});
</script>

<style scoped>
.star-symmetry-display {
  padding: 16px;
}

/* Design tokens applied - 2025-11-30 */
h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.symmetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.symmetry-item {
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  transition: all 0.3s;
}

.symmetry-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.symmetry-opposite {
  border-left: 3px solid var(--info);
}

.symmetry-pair {
  border-left: 3px solid var(--success);
}

.star-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.star-name {
  font-size: 16px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.star-name.primary {
  background: var(--info-lightest);
  color: var(--info);
}

.star-name.secondary {
  background: var(--success-lightest);
  color: var(--success);
}

.symmetry-arrow {
  font-size: 18px;
  color: var(--text-tertiary);
  font-weight: bold;
}

.position-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.position {
  font-weight: 500;
}

.separator {
  color: var(--border-light);
}

.symmetry-type {
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .symmetry-grid {
    grid-template-columns: 1fr;
  }
}
</style>
