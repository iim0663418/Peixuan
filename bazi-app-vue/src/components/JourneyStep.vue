<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface JourneyStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  desc: string;
  showConnector?: boolean;
}

defineProps<JourneyStepProps>();
</script>

<template>
  <div class="journey-step">
    <div class="step-number">{{ stepNumber }}</div>
    <Icon :icon="icon" class="step-icon" width="72" />
    <div class="step-badge">Step 0{{ stepNumber }}</div>
    <h3 class="step-title">{{ title }}</h3>
    <p class="step-desc">{{ desc }}</p>

    <!-- 連接箭頭 -->
    <Icon
      v-if="showConnector"
      icon="lucide:arrow-right"
      class="step-connector"
      width="32"
    />
  </div>
</template>

<style scoped>
.journey-step {
  text-align: center;
  position: relative;
  padding: var(--space-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(147, 112, 219, 0.1);
  transition: all var(--transition-slow) var(--ease-spring);
}

.journey-step:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  border-color: var(--peixuan-purple);
}

/* 步驟編號 */
.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-light)
  );
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

/* 圖標 */
.step-icon {
  color: var(--peixuan-purple);
  margin: 0 auto var(--space-lg);
  display: block;
  transition: transform var(--transition-slow) var(--ease-bounce);
}

.journey-step:hover .step-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Badge */
.step-badge {
  display: inline-block;
  padding: 0.375rem 1.25rem;
  border-radius: var(--radius-xl);
  background: var(--text-primary);
  color: var(--text-inverse);
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: var(--space-md);
}

/* 文字 */
.step-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.step-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* 連接箭頭 */
.step-connector {
  position: absolute;
  top: 50%;
  right: -2rem;
  transform: translateY(-50%);
  color: var(--peixuan-pink);
  z-index: 1;
  opacity: 0.6;
}

/* 響應式 */
@media (max-width: 1023px) {
  .step-connector {
    display: none;
  }
}

@media (max-width: 767px) {
  .journey-step {
    padding: var(--space-lg);
  }

  .step-icon {
    width: 56px;
    height: 56px;
  }

  .step-title {
    font-size: var(--font-size-xl);
  }

  .step-desc {
    font-size: var(--font-size-base);
  }
}
</style>
