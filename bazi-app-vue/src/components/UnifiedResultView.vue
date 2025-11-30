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
          <h4>四柱</h4>
          <el-row :gutter="16">
            <el-col v-for="(pillar, key) in pillars" :key="key" :span="6">
              <div class="pillar-card">
                <div class="pillar-label">{{ pillar.label }}</div>
                <div class="pillar-value">{{ pillar.gan }}{{ pillar.zhi }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

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
              :span="6"
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
              :span="6"
            >
              <div class="star-card">
                <div class="star-name">{{ formatStarName(String(star)) }}</div>
                <div class="star-position">{{ pos }}宮</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="result.ziwei.starSymmetry" class="section">
          <StarSymmetryDisplay :star-symmetry="result.ziwei.starSymmetry" />
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="result.annualFortune" label="流年" name="annual">
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
import TechnicalDetailsCard from './TechnicalDetailsCard.vue';
import DeveloperCard from './DeveloperCard.vue';
import TaiSuiCard from './TaiSuiCard.vue';
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
</script>

<style scoped>
/* Design tokens applied - 2025-11-30 */
.unified-result {
  width: 100%;
}

.section {
  margin-bottom: 24px;
}

h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-weight: 600;
}

.pillar-card {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.pillar-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.pillar-value {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
}

.hidden-stems {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  text-align: center;
}

.branch-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.stem-list {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.stem-primary {
  color: var(--text-primary);
  font-weight: bold;
}

.stem-middle {
  color: var(--text-secondary);
}

.stem-residual {
  color: var(--text-tertiary);
}

.star-card {
  text-align: center;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.star-name {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.star-position {
  font-size: 18px;
  font-weight: bold;
  color: var(--info);
}
</style>
