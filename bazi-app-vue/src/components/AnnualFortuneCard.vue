<template>
  <div class="annual-fortune-card">
    <!-- Yearly Forecast Mode (new) -->
    <template v-if="yearlyForecast">
      <div class="yearly-header">
        <h4>{{ $t('annualFortune.yearlyForecast.title') }}</h4>
        <div class="date-range">
          {{ formatDate(yearlyForecast.queryDate) }} →
          {{ formatDate(yearlyForecast.endDate) }}
        </div>
      </div>

      <!-- Timeline Visualization -->
      <div class="timeline-visualization">
        <div class="timeline-bar">
          <div
            v-for="(period, index) in yearlyForecast.periods"
            :key="index"
            class="period-segment"
            :class="index === 0 ? 'current-year' : 'next-year'"
            :style="{ width: `${period.weight * 100}%` }"
          >
            <span class="period-label">{{ period.weight * 100 }}%</span>
          </div>
        </div>
        <div class="timeline-legend">
          <span class="legend-current">{{
            $t('annualFortune.yearlyForecast.currentYear')
          }}</span>
          <span v-if="yearlyForecast.periods.length > 1" class="legend-next">
            {{ $t('annualFortune.yearlyForecast.nextYear') }}
          </span>
        </div>
      </div>

      <!-- Period Cards -->
      <div class="period-cards">
        <div
          v-for="(period, index) in yearlyForecast.periods"
          :key="index"
          class="period-card"
          :class="index === 0 ? 'current-year-card' : 'next-year-card'"
        >
          <div class="period-header">
            <h5>
              {{
                index === 0
                  ? $t('annualFortune.yearlyForecast.currentYear')
                  : $t('annualFortune.yearlyForecast.nextYear')
              }}
            </h5>
            <div class="badges">
              <el-tag type="info" size="small">
                {{
                  $t('annualFortune.yearlyForecast.durationDays', {
                    days: period.durationDays,
                  })
                }}
              </el-tag>
              <el-tag :type="index === 0 ? 'primary' : 'success'" size="small">
                {{
                  $t('annualFortune.yearlyForecast.weightPercent', {
                    percent: (period.weight * 100).toFixed(1),
                  })
                }}
              </el-tag>
            </div>
          </div>
          <div class="period-content">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item :label="$t('baziChart.yearPillar')">
                {{ period.annualPillar.stem }}{{ period.annualPillar.branch }}
              </el-descriptions-item>
              <el-descriptions-item label="流年命宮">
                {{ getPalaceName(period.annualLifePalacePosition) }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('common.period')">
                {{ formatDate(period.startDate) }} -
                {{ formatDate(period.endDate) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <!-- Lichun Transition Alert -->
      <el-alert
        v-if="yearlyForecast.periods.length > 1"
        :title="$t('annualFortune.yearlyForecast.lichunTransition')"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="transition-content">
            <p>
              {{
                $t('annualFortune.yearlyForecast.remainingDays', {
                  days: yearlyForecast.periods[0].durationDays,
                  year:
                    yearlyForecast.periods[0].annualPillar.stem +
                    yearlyForecast.periods[0].annualPillar.branch,
                })
              }}
            </p>
            <p>
              立春日期: {{ formatDate(yearlyForecast.periods[1].startDate) }}
            </p>
          </div>
        </template>
      </el-alert>
    </template>

    <!-- Legacy Mode (fallback for old data structure) -->
    <template v-else-if="annualFortune">
      <div class="legacy-annual-fortune">
        <h4>{{ $t('fortune.title') }}</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item :label="$t('baziChart.yearPillar')">
            {{ annualFortune.annualPillar.stem
            }}{{ annualFortune.annualPillar.branch }}
          </el-descriptions-item>
          <el-descriptions-item label="流年命宮">
            {{ getPalaceName(annualFortune.annualLifePalacePosition) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <!-- No Data State -->
    <div v-else class="no-data">
      <el-empty :description="$t('baziChart.noData')" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Local interface definitions
interface YearlyPeriod {
  annualPillar: { stem: string; branch: string };
  annualLifePalacePosition: number;
  startDate: Date | string;
  endDate: Date | string;
  durationDays: number;
  weight: number;
}

interface YearlyForecast {
  queryDate: Date | string;
  endDate: Date | string;
  periods: YearlyPeriod[];
}

interface AnnualFortune {
  annualPillar: { stem: string; branch: string };
  annualLifePalacePosition: number;
}

interface Props {
  yearlyForecast?: YearlyForecast;
  annualFortune?: AnnualFortune;
}

defineProps<Props>();

const PALACE_NAMES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

const getPalaceName = (position: number): string => {
  return PALACE_NAMES[position] || '未知';
};

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
</script>

<style scoped>
/* Design tokens applied */

/* Component-specific color mappings using design tokens */

.annual-fortune-card {
  padding: clamp(16px, 4vw, 20px);
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-width: 100%;
  overflow: hidden;
}

/* Yearly Header */
.yearly-header {
  margin-bottom: 20px;
}

.yearly-header h4 {
  margin: 0 0 8px 0;
  font-size: clamp(18px, 4.5vw, 20px);
  font-weight: 600;
  color: var(--text-primary);
}

.date-range {
  font-size: clamp(13px, 3.2vw, 14px);
  color: var(--text-secondary);
}

/* Timeline Visualization */
.timeline-visualization {
  margin: 20px 0;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.timeline-bar {
  display: flex;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 12px;
}

.period-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.period-segment.current-year {
  background: linear-gradient(135deg, var(--info-light) 0%, var(--info) 100%);
}

.period-segment.next-year {
  background: linear-gradient(
    135deg,
    var(--success-light) 0%,
    var(--success) 100%
  );
}

.period-label {
  color: white;
  font-size: clamp(11px, 2.8vw, 12px);
  font-weight: 600;
}

.timeline-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: clamp(12px, 3vw, 13px);
}

.legend-current::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--info);
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}

.legend-next::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--success);
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}

/* Period Cards */
.period-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.period-card {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid var(--border-light);
  background: white;
  transition: all 0.3s ease;
}

.period-card.current-year-card {
  border-color: var(--info);
  background: linear-gradient(
    135deg,
    var(--info-lightest) 0%,
    var(--info-lighter) 100%
  );
}

.period-card.next-year-card {
  border-color: var(--success);
  background: linear-gradient(
    135deg,
    var(--success-lightest) 0%,
    var(--success-lighter) 100%
  );
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.period-header h5 {
  margin: 0;
  font-size: clamp(15px, 3.7vw, 16px);
  font-weight: 600;
  color: var(--text-primary);
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.period-content {
  margin-top: 12px;
}

/* Transition Alert */
.transition-content p {
  margin: 4px 0;
  font-size: clamp(12px, 3vw, 13px);
}

/* Legacy Mode */
.legacy-annual-fortune {
  padding: 16px;
}

.legacy-annual-fortune h4 {
  margin: 0 0 16px 0;
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 600;
}

/* No Data State */
.no-data {
  padding: 40px 20px;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .timeline-bar {
    height: 32px;
  }

  .period-cards {
    gap: 12px;
  }

  .period-card {
    padding: 12px;
  }

  .period-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .period-cards {
    flex-direction: row;
    gap: 20px;
  }

  .period-card {
    flex: 1;
  }
}

/* 深色模式優化 - 統一混合策略 */
:global([data-theme='dark']) .annual-fortune-card {
  background: var(--bg-secondary);
  border-color: var(--border-light);
}

:global([data-theme='dark']) .annual-fortune-card .yearly-header h4,
:global([data-theme='dark']) .annual-fortune-card .period-header h5 {
  color: var(--text-primary);
}

:global([data-theme='dark']) .annual-fortune-card .date-range {
  color: var(--text-secondary);
}

:global([data-theme='dark']) .annual-fortune-card .period-card {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
}

:global([data-theme='dark']) .annual-fortune-card .period-label {
  color: var(--text-inverse);
}

:global([data-theme='dark']) .annual-fortune-card .legend-current,
:global([data-theme='dark']) .annual-fortune-card .legend-next {
  color: var(--text-secondary);
}

:global([data-theme='dark']) .annual-fortune-card .fortune-content {
  color: var(--text-primary);
}

/* 無障礙: 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .annual-fortune-card * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
