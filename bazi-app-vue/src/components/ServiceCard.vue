<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

interface ServiceCardProps {
  service: {
    id: string;
    icon: string;
    title: string;
    desc: string;
    route: string;
    color: string;
    badge: string;
  };
}

const props = defineProps<ServiceCardProps>();
const router = useRouter();

const handleClick = () => {
  router.push(props.service.route);
};
</script>

<template>
  <div
    class="service-card shadow-hover"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 頂部區域 -->
    <div class="card-header">
      <span
        class="service-badge"
        :style="{
          background: service.color + '15',
          color: service.color,
        }"
      >
        {{ service.badge }}
      </span>

      <div class="arrow-indicator">
        <Icon icon="lucide:arrow-right" width="16" />
      </div>
    </div>

    <!-- 圖標 -->
    <div class="icon-container" :style="{ background: service.color + '08' }">
      <Icon
        :icon="service.icon"
        class="service-icon"
        :style="{ color: service.color }"
        width="56"
      />
    </div>

    <!-- 內容 -->
    <h3 class="service-title">{{ service.title }}</h3>
    <p class="service-desc">{{ service.desc }}</p>

    <!-- 底部提示 -->
    <div class="explore-hint" :style="{ color: service.color }">
      Explore Now
    </div>
  </div>
</template>

<style scoped>
.service-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all var(--transition-slow) var(--ease-spring);
}

.service-card:hover {
  border-color: transparent;
}

/* 頂部區域 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.service-badge {
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  padding: 0.375rem 1rem;
  border-radius: var(--radius-xl);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.arrow-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal) var(--ease-spring);
}

.service-card:hover .arrow-indicator {
  background: var(--peixuan-purple);
  color: var(--text-inverse);
  transform: translateX(4px);
}

/* 圖標容器 */
.icon-container {
  width: 6rem;
  height: 6rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-xl);
  transition: transform var(--transition-slow) var(--ease-spring);
}

.service-card:hover .icon-container {
  transform: rotate(6deg) scale(1.05);
}

/* 文字 */
.service-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.service-desc {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  text-align: center;
  margin-bottom: var(--space-xl);
  flex-grow: 1;
}

/* 底部提示 */
.explore-hint {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-align: center;
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.service-card:hover .explore-hint {
  opacity: 1;
}

/* 響應式 */
@media (max-width: 767px) {
  .service-card {
    padding: var(--space-2xl);
  }

  .icon-container {
    width: 5rem;
    height: 5rem;
  }

  .service-title {
    font-size: var(--font-size-2xl);
  }

  .service-desc {
    font-size: var(--font-size-base);
  }
}

/* 無障礙 */
.service-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 4px;
}
</style>
