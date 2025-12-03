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
          class="dayun-segment"
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

.fortune-timeline {
  padding: clamp(12px, 3vw, 16px);
  background: var(--bg-primary);
  border-radius: 8px;
}

.qiyun-info {
  display: flex;
  gap: clamp(10px, 2.5vw, 12px);
  margin-bottom: clamp(16px, 4vw, 20px);
  flex-wrap: wrap;
}

/* Mobile: Add scroll hint */
.timeline-container {
  overflow-x: auto;
  margin-bottom: clamp(16px, 4vw, 20px);
  position: relative;
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
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

.timeline-track {
  display: flex;
  gap: clamp(6px, 1.5vw, 8px);
  min-width: max-content;
  padding: clamp(6px, 1.5vw, 8px) 0;
}

.dayun-segment {
  flex: 1;
  min-width: 100px; /* 移動端減小寬度 */
  padding: clamp(10px, 2.5vw, 12px);
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 44px; /* 觸控目標 */
}

.dayun-segment:hover {
  background: var(--info-lightest);
  border-color: var(--info-lighter);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dayun-segment.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
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
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.current-fortune h5 {
  margin: 0 0 clamp(10px, 2.5vw, 12px) 0;
  font-size: clamp(13px, 3.2vw, 14px);
  color: #1e40af;
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
</style>
