<template>
  <div class="skeleton-loader" :class="variant">
    <!-- 卡片骨架 -->
    <div v-if="variant === 'card'" class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="skeleton-actions">
        <div class="skeleton-button"></div>
        <div class="skeleton-button secondary"></div>
      </div>
    </div>

    <!-- 圖表骨架 -->
    <div v-else-if="variant === 'chart'" class="skeleton-chart">
      <div class="skeleton-chart-header">
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-chart-grid">
        <div v-for="i in 12" :key="i" class="skeleton-chart-cell">
          <div class="skeleton-char"></div>
          <div class="skeleton-char"></div>
        </div>
      </div>
      <div class="skeleton-chart-legend">
        <div class="skeleton-legend-item" v-for="i in 4" :key="i"></div>
      </div>
    </div>

    <!-- 表單骨架 -->
    <div v-else-if="variant === 'form'" class="skeleton-form">
      <div class="skeleton-form-item" v-for="i in formItems" :key="i">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
      <div class="skeleton-submit-button"></div>
    </div>

    <!-- 列表骨架 -->
    <div v-else-if="variant === 'list'" class="skeleton-list">
      <div v-for="i in listItems" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-list-title"></div>
          <div class="skeleton-list-description"></div>
        </div>
      </div>
    </div>

    <!-- 文字骨架 -->
    <div v-else-if="variant === 'text'" class="skeleton-text">
      <div v-for="i in textLines" :key="i" class="skeleton-text-line" 
           :class="{ 'short': i === textLines }"></div>
    </div>

    <!-- 通用骨架 -->
    <div v-else class="skeleton-generic">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line" v-for="i in 3" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'card' | 'chart' | 'form' | 'list' | 'text' | 'generic';
  formItems?: number;
  listItems?: number;
  textLines?: number;
}

withDefaults(defineProps<Props>(), {
  variant: 'generic',
  formItems: 4,
  listItems: 3,
  textLines: 3
});
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 脈衝動畫 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 骨架基本元素 */
.skeleton-title {
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 60%;
  margin-bottom: var(--space-md);
}

.skeleton-subtitle {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 40%;
  margin-bottom: var(--space-lg);
}

.skeleton-line {
  height: 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-button {
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 120px;
  margin-right: var(--space-md);
}

.skeleton-button.secondary {
  width: 100px;
  opacity: 0.8;
}

/* 卡片骨架 */
.skeleton-card {
  padding: var(--space-xl);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.skeleton-header {
  margin-bottom: var(--space-xl);
}

.skeleton-content {
  margin-bottom: var(--space-xl);
}

.skeleton-actions {
  display: flex;
  align-items: center;
}

/* 圖表骨架 */
.skeleton-chart {
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.skeleton-chart-header {
  margin-bottom: var(--space-xl);
}

.skeleton-chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.skeleton-chart-cell {
  aspect-ratio: 1;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--space-xs);
}

.skeleton-char {
  width: 20px;
  height: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.skeleton-chart-legend {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.skeleton-legend-item {
  width: 80px;
  height: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

/* 表單骨架 */
.skeleton-form {
  padding: var(--space-lg);
}

.skeleton-form-item {
  margin-bottom: var(--space-xl);
}

.skeleton-label {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 30%;
  margin-bottom: var(--space-sm);
}

.skeleton-input {
  height: 44px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 100%;
}

.skeleton-submit-button {
  height: 48px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 150px;
  margin-top: var(--space-lg);
}

/* 列表骨架 */
.skeleton-list {
  padding: var(--space-lg);
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.skeleton-list-item:last-child {
  border-bottom: none;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  margin-right: var(--space-md);
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-list-title {
  height: 18px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 60%;
  margin-bottom: var(--space-sm);
}

.skeleton-list-description {
  height: 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  width: 80%;
}

/* 文字骨架 */
.skeleton-text {
  padding: var(--space-md);
}

.skeleton-text-line {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
}

.skeleton-text-line.short {
  width: 75%;
}

/* 通用骨架 */
.skeleton-generic {
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

/* 響應式優化 */
@media (max-width: 768px) {
  .skeleton-chart-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
  }
  
  .skeleton-chart-cell {
    padding: var(--space-xs);
  }
  
  .skeleton-char {
    width: 16px;
    height: 16px;
  }
  
  .skeleton-actions {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .skeleton-button {
    width: 100%;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .skeleton-chart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .skeleton-list-item {
    padding: var(--space-sm) 0;
  }
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-form,
  .skeleton-card,
  .skeleton-chart {
    padding: var(--space-md);
  }
}

/* 深色主題支援 */
[data-theme="dark"] .skeleton-loader {
  /* 深色主題下的骨架顏色會自動通過design-tokens調整 */
}
</style>