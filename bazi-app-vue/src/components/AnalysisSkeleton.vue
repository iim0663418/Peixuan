<template>
  <div class="analysis-skeleton" aria-hidden="true">
    <!-- Intro Section -->
    <div class="skeleton-header" />
    <div class="skeleton-text" />
    <div class="skeleton-text short" />
    <div class="skeleton-text medium" />

    <!-- Section 1: Key Traits -->
    <div class="skeleton-subheader" />
    <div class="skeleton-list">
      <div v-for="n in 3" :key="`s1-${n}`" class="skeleton-list-item" />
    </div>

    <!-- Section 2: Detailed Analysis -->
    <div class="skeleton-subheader" />
    <div class="skeleton-text" />
    <div class="skeleton-text" />
    <div class="skeleton-text short" />

    <!-- Section 3: Summary -->
    <div class="skeleton-subheader" />
    <div class="skeleton-text medium" />
    <div class="skeleton-text" />
  </div>
</template>

<style scoped>
.analysis-skeleton {
  width: 100%;
  padding: var(--space-2xl) 0;
  min-height: 400px;
}

.skeleton-header,
.skeleton-subheader,
.skeleton-text,
.skeleton-list-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-lg);
  overflow: hidden;
  position: relative;
}

/* Header Sizing */
.skeleton-header {
  height: 32px;
  width: 60%;
  margin-bottom: calc(var(--space-2xl) * 1.2);
}

/* Subheader Sizing */
.skeleton-subheader {
  height: 24px;
  width: 40%;
  margin-top: calc(var(--space-2xl) * 1.5);
  margin-bottom: var(--space-xl);
}

/* Text Line Sizing */
.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: var(--space-md);
}

.skeleton-text.short {
  width: 70%;
}

.skeleton-text.medium {
  width: 85%;
}

/* List Item Sizing */
.skeleton-list {
  margin-left: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.skeleton-list-item {
  height: 20px;
  width: 90%;
  margin-bottom: var(--space-sm);
  position: relative;
}

.skeleton-list-item::before {
  content: '';
  position: absolute;
  left: calc(var(--space-md) * -1);
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Shimmer Effect */
.skeleton-header::after,
.skeleton-subheader::after,
.skeleton-text::after,
.skeleton-list-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Dark Mode Enhancements */
@media (prefers-color-scheme: dark) {
  .skeleton-header,
  .skeleton-subheader,
  .skeleton-text,
  .skeleton-list-item {
    background: rgba(255, 255, 255, 0.08);
  }

  .skeleton-header::after,
  .skeleton-subheader::after,
  .skeleton-text::after,
  .skeleton-list-item::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(153, 50, 204, 0.15) 50%,
      transparent 100%
    );
  }
}

/* Accessibility: 減慢動畫而非完全禁用 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-header::after,
  .skeleton-subheader::after,
  .skeleton-text::after,
  .skeleton-list-item::after {
    animation: shimmer 3s infinite; /* 減慢到 3 秒 */
  }
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .skeleton-header {
    width: 80%;
  }

  .skeleton-subheader {
    width: 60%;
  }

  .skeleton-text.short {
    width: 80%;
  }

  .skeleton-text.medium {
    width: 90%;
  }
}
</style>
