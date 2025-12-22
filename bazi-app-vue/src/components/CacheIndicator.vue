<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  timestamp: string;
  analysisType: 'personality' | 'fortune';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  refresh: [];
}>();

const { t } = useI18n();

const formattedDate = computed(() => {
  const date = new Date(props.timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  // If less than 24 hours ago, show relative time
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) {
      return t(`${props.analysisType}.cache_just_now`);
    }
    return t(`${props.analysisType}.cache_minutes_ago`, { minutes: diffInMinutes });
  } else if (diffInHours < 24) {
    return t(`${props.analysisType}.cache_hours_ago`, { hours: diffInHours });
  }

  // Otherwise show formatted date
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const handleRefresh = () => {
  emit('refresh');
};
</script>

<template>
  <div class="cache-indicator">
    <div class="cache-info">
      <svg
        class="cache-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span class="cache-text">
        {{ $t(`${analysisType}.cache_generated`) }}
        <span class="cache-timestamp">{{ formattedDate }}</span>
      </span>
    </div>
    <button
      class="refresh-btn"
      :title="$t(`${analysisType}.cache_refresh_tooltip`)"
      @click="handleRefresh"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
      <span class="refresh-text">{{ $t(`${analysisType}.cache_refresh`) }}</span>
    </button>
  </div>
</template>

<style scoped>
.cache-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(
    135deg,
    rgba(153, 50, 204, 0.08) 0%,
    rgba(153, 50, 204, 0.04) 100%
  );
  border: 1px solid rgba(153, 50, 204, 0.15);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
  transition: all var(--transition-normal);
}

.cache-indicator:hover {
  background: linear-gradient(
    135deg,
    rgba(153, 50, 204, 0.12) 0%,
    rgba(153, 50, 204, 0.06) 100%
  );
  border-color: rgba(153, 50, 204, 0.25);
}

.cache-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
}

.cache-icon {
  color: var(--purple-star);
  flex-shrink: 0;
}

.cache-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.cache-timestamp {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-left: var(--space-xs);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--purple-star);
  color: var(--purple-star);
  transform: translateY(-1px);
}

.refresh-btn:active {
  transform: translateY(0);
}

.refresh-btn svg {
  transition: transform var(--transition-normal);
}

.refresh-btn:hover svg {
  transform: rotate(180deg);
}

.refresh-text {
  white-space: nowrap;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .cache-indicator {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .cache-info {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .refresh-text {
    display: inline;
  }
}

/* Dark Mode Enhancements */
@media (prefers-color-scheme: dark) {
  .cache-indicator {
    background: linear-gradient(
      135deg,
      rgba(153, 50, 204, 0.12) 0%,
      rgba(153, 50, 204, 0.06) 100%
    );
    border-color: rgba(153, 50, 204, 0.2);
  }

  .cache-indicator:hover {
    background: linear-gradient(
      135deg,
      rgba(153, 50, 204, 0.18) 0%,
      rgba(153, 50, 204, 0.1) 100%
    );
    border-color: rgba(153, 50, 204, 0.35);
  }

  .refresh-btn:hover {
    background: rgba(153, 50, 204, 0.15);
  }
}

/* Accessibility: Focus States */
.refresh-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(153, 50, 204, 0.2);
  border-color: var(--purple-star);
}

/* Accessibility: Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .cache-indicator,
  .refresh-btn,
  .refresh-btn svg {
    transition: none;
  }

  .refresh-btn:hover svg {
    transform: none;
  }
}
</style>
