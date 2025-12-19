<template>
  <div class="unified-result">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="八字" name="bazi">
        <!-- 傳統八字排盤 -->
        <BaziChart
          v-if="baziChartData"
          :bazi="baziChartData"
          :ten-gods="result.bazi.tenGods"
        />

        <div class="section">
          <h4>十神</h4>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="年干">{{
              result.bazi.tenGods.year
            }}</el-descriptions-item>
            <el-descriptions-item label="月干">{{
              result.bazi.tenGods.month
            }}</el-descriptions-item>
            <el-descriptions-item label="時干">{{
              result.bazi.tenGods.hour
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <h4>藏干</h4>
          <el-row :gutter="16">
            <el-col
              v-for="(stems, key) in result.bazi.hiddenStems"
              :key="key"
              :xs="24"
              :sm="12"
              :md="6"
            >
              <div class="hidden-stems">
                <div class="branch-label">
                  {{ pillars[key as unknown as keyof typeof pillars].label }}
                </div>
                <div class="stem-list">
                  <span class="stem-primary">{{ stems.primary }}</span>
                  <span v-if="stems.middle" class="stem-middle">{{
                    stems.middle
                  }}</span>
                  <span v-if="stems.residual" class="stem-residual">{{
                    stems.residual
                  }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="section">
          <h4>五行分布</h4>
          <WuXingChart :distribution="result.bazi.wuxingDistribution" />
        </div>

        <div class="section">
          <h4>大運</h4>
          <FortuneTimeline
            :fortune-cycles="result.bazi.fortuneCycles"
            :birth-date="result.input.solarDate"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="紫微斗數" name="ziwei">
        <div class="section">
          <h4>基本資訊</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="命宮">
              {{ result.ziwei.lifePalace.name }} ({{
                result.ziwei.lifePalace.position
              }}宮)
            </el-descriptions-item>
            <el-descriptions-item label="身宮">
              {{ result.ziwei.bodyPalace.name }} ({{
                result.ziwei.bodyPalace.position
              }}宮)
            </el-descriptions-item>
            <el-descriptions-item label="五行局">{{ result.ziwei.bureau }}局</el-descriptions-item>
            <el-descriptions-item label="紫微星">{{ result.ziwei.ziWeiPosition }}宮</el-descriptions-item>
            <el-descriptions-item label="天府星">{{ result.ziwei.tianFuPosition }}宮</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <h4>輔星位置</h4>
          <el-row :gutter="16">
            <el-col
              v-for="(pos, star) in result.ziwei.auxiliaryStars"
              :key="star"
              :xs="12"
              :sm="8"
              :md="6"
            >
              <div class="star-card">
                <div class="star-name">
                  {{ formatStarName(String(star)) }}
                  <StarBrightnessIndicator
                    :brightness="getStarBrightness(String(star), pos) || ''"
                  />
                </div>
                <div class="star-position">{{ pos }}宮</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="result.ziwei.starSymmetry" class="section">
          <StarSymmetryDisplay :star-symmetry="result.ziwei.starSymmetry" />
        </div>

        <div v-if="result.ziwei.sihuaAggregation" class="section">
          <SiHuaAggregationCard
            :sihua-aggregation="result.ziwei.sihuaAggregation"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="result.annualFortune" label="流年" name="annual">
        <!-- 年度運勢卡片 -->
        <AnnualFortuneCard
          v-if="result.annualFortune?.yearlyForecast"
          :yearly-forecast="result.annualFortune.yearlyForecast"
        />

        <!-- 太歲分析卡片 -->
        <TaiSuiCard
          v-if="result.annualFortune.taiSuiAnalysis"
          :tai-sui-analysis="result.annualFortune.taiSuiAnalysis"
        />

        <div class="section">
          <h4>流年資訊</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="流年干支">
              {{ result.annualFortune.annualPillar.stem
              }}{{ result.annualFortune.annualPillar.branch }}
            </el-descriptions-item>
            <el-descriptions-item label="流年命宮">
              {{ result.annualFortune.annualLifePalaceIndex }}宮
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <h4>干支交互</h4>
          <AnnualInteraction
            :interactions="result.annualFortune.interactions"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="技術細節" name="technical">
        <TechnicalDetailsCard :result="result" />
      </el-tab-pane>

      <el-tab-pane label="開發者" name="developer">
        <DeveloperCard :result="result" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaziChart from './BaziChart.vue';
import WuXingChart from './WuXingChart.vue';
import FortuneTimeline from './FortuneTimeline.vue';
import AnnualInteraction from './AnnualInteraction.vue';
import StarSymmetryDisplay from './StarSymmetryDisplay.vue';
import SiHuaAggregationCard from './SiHuaAggregationCard.vue';
import TechnicalDetailsCard from './TechnicalDetailsCard.vue';
import DeveloperCard from './DeveloperCard.vue';
import TaiSuiCard from './TaiSuiCard.vue';
import AnnualFortuneCard from './AnnualFortuneCard.vue';
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';
import {
  STEM_TO_ELEMENT,
  BRANCH_TO_ELEMENT,
  type HeavenlyStem,
  type EarthlyBranch,
} from '../types/baziTypes';

interface Props {
  result: any;
}

const props = defineProps<Props>();
const activeTab = ref('bazi');

const pillars = computed(() => ({
  year: {
    label: '年柱',
    gan: props.result.bazi.fourPillars.year.gan,
    zhi: props.result.bazi.fourPillars.year.zhi,
  },
  month: {
    label: '月柱',
    gan: props.result.bazi.fourPillars.month.gan,
    zhi: props.result.bazi.fourPillars.month.zhi,
  },
  day: {
    label: '日柱',
    gan: props.result.bazi.fourPillars.day.gan,
    zhi: props.result.bazi.fourPillars.day.zhi,
  },
  hour: {
    label: '時柱',
    gan: props.result.bazi.fourPillars.hour.gan,
    zhi: props.result.bazi.fourPillars.hour.zhi,
  },
}));

// BaziChart 需要的資料格式
const baziChartData = computed(() => {
  const fp = props.result.bazi.fourPillars;
  return {
    yearPillar: {
      stem: fp.year.gan as HeavenlyStem,
      branch: fp.year.zhi as EarthlyBranch,
      stemElement: STEM_TO_ELEMENT[fp.year.gan as HeavenlyStem],
      branchElement: BRANCH_TO_ELEMENT[fp.year.zhi as EarthlyBranch],
    },
    monthPillar: {
      stem: fp.month.gan as HeavenlyStem,
      branch: fp.month.zhi as EarthlyBranch,
      stemElement: STEM_TO_ELEMENT[fp.month.gan as HeavenlyStem],
      branchElement: BRANCH_TO_ELEMENT[fp.month.zhi as EarthlyBranch],
    },
    dayPillar: {
      stem: fp.day.gan as HeavenlyStem,
      branch: fp.day.zhi as EarthlyBranch,
      stemElement: STEM_TO_ELEMENT[fp.day.gan as HeavenlyStem],
      branchElement: BRANCH_TO_ELEMENT[fp.day.zhi as EarthlyBranch],
    },
    hourPillar: {
      stem: fp.hour.gan as HeavenlyStem,
      branch: fp.hour.zhi as EarthlyBranch,
      stemElement: STEM_TO_ELEMENT[fp.hour.gan as HeavenlyStem],
      branchElement: BRANCH_TO_ELEMENT[fp.hour.zhi as EarthlyBranch],
    },
  };
});

const formatStarName = (key: string): string => {
  const nameMap: Record<string, string> = {
    wenChang: '文昌',
    wenQu: '文曲',
    zuoFu: '左輔',
    youBi: '右弼',
  };
  return nameMap[key] || key;
};

const getStarBrightness = (
  starKey: string,
  position: number,
): string | undefined => {
  const starName = formatStarName(starKey);
  const { palaces } = props.result.ziwei;
  if (!palaces || !Array.isArray(palaces)) {
    return undefined;
  }

  // 找到對應宮位
  const palace = palaces.find((p: any) => p.position === position);
  if (!palace || !palace.stars) {
    return undefined;
  }

  // 找到對應星曜
  const star = palace.stars.find((s: any) => s.name === starName);
  return star ? star.brightness : undefined;
};
</script>

<style scoped>
/* Design tokens applied - 2025-11-30 */
/* RWD optimization - 2025-12-03 */
/* Phase 3 visual enhancements - 2025-12-19 */

.unified-result {
  width: 100%;
}

/* Phase 3: Multi-layer shadows for depth */
:deep(.el-descriptions),
:deep(.el-card) {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Mobile-first: Tab navigation optimization */
:deep(.el-tabs__header) {
  margin-bottom: var(--space-lg);
}

:deep(.el-tabs__nav-wrap) {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

:deep(.el-tabs__nav-wrap)::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Scroll hint shadow for mobile */
@media (max-width: 767px) {
  :deep(.el-tabs__nav-wrap)::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 30px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.8), transparent);
    pointer-events: none;
  }
}

:deep(.el-tabs__item) {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile: Increase spacing between tabs */
@media (max-width: 767px) {
  :deep(.el-tabs__item) {
    margin: 0 var(--space-xs);
    padding: var(--space-md) var(--space-xl);
  }

  :deep(.el-tabs__item):first-child {
    margin-left: 0;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  /* Phase 3: Multi-layer shadows */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

/* Phase 3: Card flip effect on hover */
.section:hover {
  transform: translateY(-2px) translateZ(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 12px 24px rgba(0, 0, 0, 0.15);
}

h4 {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin: 0 0 var(--space-md) 0;
  font-weight: var(--font-weight-semibold);
  /* Phase 3: Enhanced text shadow for better readability */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Phase 3: Gradient border bottom */
  position: relative;
  padding-bottom: var(--space-sm);
}

h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--info) 0%, var(--success) 100%);
  border-radius: var(--radius-xs);
  box-shadow: 0 1px 4px rgba(53, 126, 221, 0.3);
}

/* Mobile: Stack hidden stems vertically with Flexbox */
.hidden-stems {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
  margin-bottom: var(--space-md);
}

@media (min-width: 768px) {
  .hidden-stems {
    margin-bottom: 0;
  }
}

.pillar-card {
  text-align: center;
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--text-inverse);
}

.pillar-label {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  margin-bottom: var(--space-sm);
}

.pillar-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: 2px;
}

.branch-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--space-xs);
}

.stem-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.stem-primary {
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.stem-middle {
  color: var(--text-secondary);
}

.stem-residual {
  color: var(--text-tertiary);
}

/* Mobile: Larger star cards with Flexbox alignment */
.star-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  /* Phase 3: Multi-layer shadows */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: var(--space-md);
  min-height: 44px;
  /* Phase 3: Interactive effects */
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

/* Phase 3: Card hover effect */
.star-card:hover {
  transform: translateY(-2px) scale(1.02) translateZ(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 8px 20px rgba(53, 126, 221, 0.15);
}

@media (min-width: 768px) {
  .star-card {
    margin-bottom: 0;
  }
}

.star-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.star-position {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--info);
}

/* Tablet optimization */
@media (min-width: 768px) {
  :deep(.el-tabs__item) {
    font-size: var(--font-size-sm);
  }

  h4 {
    font-size: var(--font-size-sm);
  }
}

/* Desktop optimization */
@media (min-width: 1024px) {
  :deep(.el-tabs__item) {
    font-size: var(--font-size-base);
  }

  h4 {
    font-size: var(--font-size-base);
  }

  .section {
    margin-bottom: var(--space-2xl);
  }
}

/* Phase 3: Glow effects on focus for accessibility */
:deep(.el-tabs__item):focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(53, 126, 221, 0.3),
    0 0 12px rgba(53, 126, 221, 0.4);
  border-radius: var(--radius-sm);
}

:deep(.el-button):focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(53, 126, 221, 0.1),
    0 0 0 5px rgba(53, 126, 221, 0.2),
    0 0 20px rgba(53, 126, 221, 0.3);
}

/* Phase 3: Enhanced table row hover effects */
:deep(.el-descriptions__body tr) {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.2s ease;
  transform: translateZ(0);
}

:deep(.el-descriptions__body tr:hover) {
  transform: scale(1.01) translateZ(0);
  background: linear-gradient(
    90deg,
    rgba(53, 126, 221, 0.03) 0%,
    rgba(53, 126, 221, 0.01) 100%
  );
}

/* Phase 3: Accessibility - Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .section,
  .star-card,
  :deep(.el-descriptions__body tr) {
    transition: none;
  }

  .section:hover,
  .star-card:hover,
  :deep(.el-descriptions__body tr:hover) {
    transform: none;
  }

  :deep(.el-tabs__item):focus-visible,
  :deep(.el-button):focus-visible {
    animation: none;
  }
}
</style>
