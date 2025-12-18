<script setup lang="ts">
import { useRouter } from 'vue-router';

/**
 * ServiceCard 組件 - 可復用的服務卡片
 * 用於首頁服務導覽區域
 */

interface ServiceCardProps {
  service: {
    id: string;
    icon: string;
    title: string;
    desc: string;
    route: string;
    color: 'primary' | 'success' | 'warning' | 'info';
    badge?: string; // 例如 'NEW'
  };
}

const props = defineProps<ServiceCardProps>();
const router = useRouter();

// 點擊卡片導航到對應路由
const handleClick = () => {
  router.push(props.service.route);
};

// 根據顏色類型獲取對應的 CSS 變數
const getColorVars = (color: string) => {
  const colorMap = {
    primary: {
      bg: 'var(--primary-lightest)',
      border: 'var(--primary-light)',
      text: 'var(--primary-color)',
    },
    success: {
      bg: 'var(--success-lightest)',
      border: 'var(--success-light)',
      text: 'var(--success)',
    },
    warning: {
      bg: 'var(--warning-lightest)',
      border: 'var(--warning-light)',
      text: 'var(--warning)',
    },
    info: {
      bg: 'var(--info-lightest)',
      border: 'var(--info-light)',
      text: 'var(--info)',
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.primary;
};
</script>

<template>
  <div
    class="service-card"
    :class="`service-card--${service.color}`"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 卡片頂部裝飾條 -->
    <div class="service-card__accent" />

    <!-- 服務圖標 -->
    <div class="service-card__icon">{{ service.icon }}</div>

    <!-- 服務標題 + 標籤 -->
    <div class="service-card__header">
      <h3 class="service-card__title">
        {{ service.title }}
      </h3>
      <span v-if="service.badge" class="service-card__badge">
        {{ service.badge }}
      </span>
    </div>

    <!-- 服務描述 -->
    <p class="service-card__desc">{{ service.desc }}</p>

    <!-- 操作提示 (hover 時顯示) -->
    <div class="service-card__action">
      <span class="service-card__action-text">立即體驗</span>
      <span class="service-card__arrow">→</span>
    </div>
  </div>
</template>

<style scoped>
.service-card {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  overflow: hidden;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

/* Hover 動畫效果 */
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-medium);
}

.service-card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 頂部裝飾條 */
.service-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--primary-light)
  );
  transition: height var(--transition-normal);
}

.service-card:hover .service-card__accent {
  height: 6px;
}

/* 顏色變體 */
.service-card--primary .service-card__accent {
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--primary-light)
  );
}

.service-card--success .service-card__accent {
  background: linear-gradient(90deg, var(--success), var(--success-light));
}

.service-card--warning .service-card__accent {
  background: linear-gradient(90deg, var(--warning), var(--warning-light));
}

.service-card--info .service-card__accent {
  background: linear-gradient(90deg, var(--info), var(--info-light));
}

/* 服務圖標 */
.service-card__icon {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: var(--space-lg);
  transition: transform var(--transition-normal);
}

.service-card:hover .service-card__icon {
  transform: scale(1.1);
}

/* 服務標題區域 */
.service-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.service-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

/* 標籤 (NEW 等) */
.service-card__badge {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: white;
  background: var(--success);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  line-height: 1.2;
  text-transform: uppercase;
}

/* 服務描述 */
.service-card__desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 auto 0;
  flex-grow: 1;
}

/* 操作提示 (Hover 時顯示) */
.service-card__action {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  opacity: 0;
  transform: translateY(8px);
  transition: all var(--transition-normal);
}

.service-card:hover .service-card__action {
  opacity: 1;
  transform: translateY(0);
}

.service-card__action-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--primary-color);
}

.service-card--primary .service-card__action-text {
  color: var(--primary-color);
}

.service-card--success .service-card__action-text {
  color: var(--success);
}

.service-card--warning .service-card__action-text {
  color: var(--warning);
}

.service-card--info .service-card__action-text {
  color: var(--info);
}

.service-card__arrow {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  transition: transform var(--transition-normal);
}

.service-card:hover .service-card__arrow {
  transform: translateX(4px);
}

.service-card--primary .service-card__arrow {
  color: var(--primary-color);
}

.service-card--success .service-card__arrow {
  color: var(--success);
}

.service-card--warning .service-card__arrow {
  color: var(--warning);
}

.service-card--info .service-card__arrow {
  color: var(--info);
}

/* 響應式設計 - 移動版 */
@media (max-width: 767px) {
  .service-card {
    padding: var(--space-xl);
    min-height: 200px;
  }

  .service-card__icon {
    font-size: 2.5rem;
    margin-bottom: var(--space-md);
  }

  .service-card__title {
    font-size: var(--font-size-base);
  }

  .service-card__desc {
    font-size: var(--font-size-xs);
  }

  /* 移動端始終顯示操作提示 */
  .service-card__action {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 - 平板版 */
@media (min-width: 768px) and (max-width: 1023px) {
  .service-card {
    padding: var(--space-xl);
    min-height: 220px;
  }

  .service-card__icon {
    font-size: 2.75rem;
  }
}

/* 無障礙增強 - 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .service-card,
  .service-card__icon,
  .service-card__action,
  .service-card__arrow {
    transition: none;
  }

  .service-card:hover {
    transform: none;
  }
}
</style>
