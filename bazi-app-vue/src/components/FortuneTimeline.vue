<template>
  <div class="fortune-timeline">
    <div class="qiyun-info">
      <el-tag type="info"
        >起運日期: {{ formatDate(fortuneCycles.qiyunDate) }}</el-tag
      >
      <el-tag
        :type="fortuneCycles.direction === 'forward' ? 'success' : 'warning'"
      >
        {{ fortuneCycles.direction === 'forward' ? '順行' : '逆行' }}
      </el-tag>
    </div>

    <div class="timeline-container">
      <div class="timeline-track">
        <div
          v-for="(dayun, index) in fortuneCycles.dayunList"
          :key="index"
          class="dayun-segment will-change-transform"
          :class="{ current: isCurrentDayun(dayun) }"
        >
          <div class="dayun-header">
            <span class="dayun-age"
              >{{ dayun.startAge }}-{{ dayun.endAge }}歲</span
            >
            <span class="dayun-ganzhi">{{ dayun.stem }}{{ dayun.branch }}</span>
          </div>
          <div class="dayun-period">
            {{ formatYear(dayun.startDate) }} - {{ formatYear(dayun.endDate) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="fortuneCycles.currentDayun" class="current-fortune">
      <h5>當前大運</h5>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="干支">
          {{ fortuneCycles.currentDayun.stem
          }}{{ fortuneCycles.currentDayun.branch }}
        </el-descriptions-item>
        <el-descriptions-item label="年齡">
          {{ fortuneCycles.currentDayun.startAge }}-{{
            fortuneCycles.currentDayun.endAge
          }}歲
        </el-descriptions-item>
        <el-descriptions-item label="起始">
          {{ formatDate(fortuneCycles.currentDayun.startDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="結束">
          {{ formatDate(fortuneCycles.currentDayun.endDate) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DaYun {
  stem: string;
  branch: string;
  startAge: number;
  endAge: number;
  startDate: Date | string;
  endDate: Date | string;
}

interface FortuneCycles {
  qiyunDate: Date | string;
  direction: 'forward' | 'backward';
  dayunList: DaYun[];
  currentDayun: DaYun | null;
}

interface Props {
  fortuneCycles: FortuneCycles;
  birthDate: Date | string;
}

const props = defineProps<Props>();

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatYear = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getFullYear().toString();
};

const isCurrentDayun = (dayun: DaYun): boolean => {
  return (
    props.fortuneCycles.currentDayun !== null &&
    dayun.stem === props.fortuneCycles.currentDayun.stem &&
    dayun.branch === props.fortuneCycles.currentDayun.branch &&
    dayun.startAge === props.fortuneCycles.currentDayun.startAge
  );
};
</script>

<style scoped>
/* Design tokens applied - 2025-11-30 */
/* RWD optimization - 2025-12-03 */
/* Task 3.3: Responsive chart sizing - 2025-12-04 */
/* Task 3.4: Mobile performance optimization - 2025-12-04 */
/* Task: Fix mobile card overflow issues - 2025-12-05 */

*,
*::before,
*::after {
  box-sizing: border-box;
}

.fortune-timeline {
  padding: clamp(12px, 3vw, 16px);
  background: var(--bg-primary);
  border-radius: 8px;
  max-width: 100%; /* Ensure container responsiveness */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.qiyun-info {
  display: flex;
  gap: clamp(10px, 2.5vw, 12px);
  margin-bottom: clamp(16px, 4vw, 20px);
  flex-wrap: wrap;
}

/* Mobile: Add scroll hint */
/* Responsive sizing with horizontal scroll optimization */
.timeline-container {
  overflow-x: auto;
  margin-bottom: clamp(16px, 4vw, 20px);
  position: relative;
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
  width: 100%; /* Auto-resize with container */
  max-width: 100%;
}

/* Scroll hint for mobile */
.timeline-container::after {
  content: '← 滑動查看更多 →';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--text-tertiary);
  opacity: 0.6;
  pointer-events: none;
}

@media (min-width: 768px) {
  .timeline-container::after {
    display: none;
  }
}

/* Custom scrollbar for better UX */
.timeline-container::-webkit-scrollbar {
  height: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* Disable scrollbar hover on touch devices */
@media (hover: none) {
  .timeline-container::-webkit-scrollbar-thumb:hover {
    background: var(--border-medium);
  }
}

.timeline-track {
  display: inline-flex;
  gap: clamp(6px, 1.5vw, 8px);
  padding: clamp(6px, 1.5vw, 8px) 0;
  width: auto; /* Allow track to expand beyond container */
  box-sizing: border-box;
}

.dayun-segment {
  flex: 0 0 auto; /* Prevent flex shrinking, maintain fixed width */
  min-width: 90px; /* Reduced from 100px */
  max-width: 140px;
  padding: clamp(10px, 2.5vw, 12px);
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 44px; /* 觸控目標 */
  aspect-ratio: 1.2 / 1; /* Maintain consistent aspect ratio */
  box-sizing: border-box;
}

/* Reduce animations on mobile if user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dayun-segment {
    transition: none;
  }

  .dayun-segment:hover {
    transform: none;
  }
}

.dayun-segment:hover {
  background: var(--info-lightest);
  border-color: var(--info-lighter);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Disable segment hover effects on touch devices */
@media (hover: none) {
  .dayun-segment:hover {
    background: var(--bg-secondary);
    border-color: var(--border-light);
    transform: none;
    box-shadow: none;
  }
}

.dayun-segment.current {
  background: var(--gradient-primary);
  border-color: var(--primary-color);
  color: white;
}

.dayun-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(6px, 1.5vw, 8px);
}

.dayun-age {
  font-size: clamp(11px, 2.8vw, 12px);
  opacity: 0.8;
}

.dayun-ganzhi {
  font-size: clamp(16px, 4vw, 18px);
  font-weight: bold;
  letter-spacing: 1px;
}

.dayun-period {
  font-size: clamp(10px, 2.5vw, 11px);
  opacity: 0.7;
  text-align: center;
}

.current-fortune {
  padding: clamp(12px, 3vw, 16px);
  background: var(--info-lightest);
  border-radius: 8px;
  border: 1px solid var(--info-lighter);
}

.current-fortune h5 {
  margin: 0 0 clamp(10px, 2.5vw, 12px) 0;
  font-size: clamp(13px, 3.2vw, 14px);
  color: var(--info);
  font-weight: 600;
}

/* Tablet: Larger segments */
@media (min-width: 768px) {
  .dayun-segment {
    min-width: 120px;
  }
}

/* Desktop: Even larger */
@media (min-width: 1024px) {
  .dayun-segment {
    min-width: 140px;
  }
}

/* Mobile-specific data refinement (< 768px) */
@media (max-width: 767px) {
  /* P2.3 Task 1: Mobile card layout */

  /* 1) Change timeline-container to vertical card layout */
  .timeline-container {
    overflow-x: visible; /* Remove horizontal scrolling on mobile */
    overflow-y: visible;
  }

  .timeline-container::after {
    display: none; /* Remove scroll hint */
  }

  .timeline-track {
    flex-direction: column; /* Vertical card layout */
    gap: 1rem;
    width: 100%;
    padding: 0;
  }

  /* 2) Transform dayun-segment to card style */
  .dayun-segment {
    flex: 1 1 auto;
    min-width: 80px; /* Reduced from 90px for mobile */
    max-width: 100%;
    width: 100%;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-light);
    aspect-ratio: auto; /* Remove aspect ratio for card layout */
    min-height: auto;
    box-sizing: border-box;
  }

  /* 3) Hide non-current dayun segments on mobile (already filtered in P2.2) */
  .dayun-segment:not(.current) {
    opacity: 0.3;
    filter: blur(1px);
    pointer-events: none;
  }

  /* Show only current dayun prominently */
  .dayun-segment.current {
    opacity: 1;
    filter: none;
    transform: none;
    box-shadow: 0 4px 12px var(--primary-alpha-30);
    background: var(--gradient-primary);
    border-color: var(--primary-color);
    color: white;
  }

  /* 5) Simplify dayun-header to vertical stack */
  .dayun-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .dayun-age {
    font-size: 0.875rem;
    order: 2;
  }

  .dayun-ganzhi {
    font-size: 1.5rem;
    order: 1;
  }

  .dayun-period {
    text-align: left;
    font-size: 0.75rem;
  }

  /* Simplify current fortune display on mobile */
  .current-fortune :deep(.el-descriptions) {
    font-size: 0.875rem;
  }

  .current-fortune :deep(.el-descriptions-item__label) {
    width: 60px;
  }
}
</style>
