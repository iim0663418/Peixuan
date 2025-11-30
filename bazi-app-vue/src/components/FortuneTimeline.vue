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
.fortune-timeline {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.qiyun-info {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.timeline-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.timeline-track {
  display: flex;
  gap: 8px;
  min-width: max-content;
  padding: 8px 0;
}

.dayun-segment {
  flex: 1;
  min-width: 120px;
  padding: 12px;
  background: #f5f7fa;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dayun-segment:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
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
  margin-bottom: 8px;
}

.dayun-age {
  font-size: 12px;
  opacity: 0.8;
}

.dayun-ganzhi {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.dayun-period {
  font-size: 11px;
  opacity: 0.7;
  text-align: center;
}

.current-fortune {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.current-fortune h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1e40af;
  font-weight: 600;
}

@media (max-width: 768px) {
  .dayun-segment {
    min-width: 100px;
  }

  .dayun-ganzhi {
    font-size: 16px;
  }
}
</style>
