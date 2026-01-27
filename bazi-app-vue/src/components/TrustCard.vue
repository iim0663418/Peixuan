<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface TrustCardProps {
  icon: string;
  title: string;
  desc: string;
}

defineProps<TrustCardProps>();
</script>

<template>
  <div class="trust-card shadow-hover">
    <div class="icon-container">
      <Icon :icon="icon" class="trust-icon" width="36" />
    </div>
    <h3 class="trust-title">{{ title }}</h3>
    <p class="trust-desc">{{ desc }}</p>
  </div>
</template>

<style scoped>
.trust-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 圖標容器 */
.icon-container {
  width: 5rem;
  height: 5rem;
  background: var(--primary-lightest);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-lg);
  transition: all var(--transition-slow) var(--ease-spring);
}

.trust-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
  background: var(--primary-light);
}

.trust-icon {
  color: var(--primary-color);
  transition: color var(--transition-normal);
}

.trust-card:hover .trust-icon {
  color: var(--text-inverse);
}

/* 文字樣式 */
.trust-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.trust-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* 響應式 */
@media (max-width: 767px) {
  .trust-card {
    padding: var(--space-2xl);
  }

  .icon-container {
    width: 4rem;
    height: 4rem;
  }

  .trust-title {
    font-size: var(--font-size-xl);
  }

  .trust-desc {
    font-size: var(--font-size-base);
  }
}
</style>
