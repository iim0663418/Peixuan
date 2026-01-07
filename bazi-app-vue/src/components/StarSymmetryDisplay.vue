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
/* Design tokens applied - 2025-11-30 */
/* Phase 3 visual enhancements - 2025-12-19 */

.star-symmetry-display {
  padding: 16px;
}

h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  /* Phase 3: Enhanced text shadow for better readability */
  text-shadow: var(--text-shadow-sm);
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
  /* Phase 3: Multi-layer shadows */
  box-shadow: var(--shadow-layered-sm);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

.symmetry-item:hover {
  /* Phase 3: Enhanced hover with multi-layer shadows */
  box-shadow: var(--shadow-layered-xl);
  transform: translateY(-3px) scale(1.02) translateZ(0);
}

/* Disable hover effects on touch devices */
@media (hover: none) {
  .symmetry-item:hover {
    box-shadow: var(--shadow-layered-sm);
    transform: none;
  }
}

/* Phase 3: Gradient borders for symmetry types */
.symmetry-opposite {
  position: relative;
  border-left: none;
  padding-left: 16px;
}

.symmetry-opposite::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    var(--info) 0%,
    var(--info-lightest) 100%
  );
  border-radius: var(--radius-xs);
  box-shadow: 0 0 8px rgba(53, 126, 221, 0.3);
}

.symmetry-pair {
  position: relative;
  border-left: none;
  padding-left: 16px;
}

.symmetry-pair::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    180deg,
    var(--success) 0%,
    var(--success-lightest) 100%
  );
  border-radius: var(--radius-xs);
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.3);
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

/* Phase 3: Accessibility - Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .symmetry-item {
    transition: none;
  }

  .symmetry-item:hover {
    transform: none;
  }
}
</style>
