<template>
  <div class="fortune-overview">
    <!-- 運勢總覽容器 -->
    <div class="overview-container">
      <h3 class="overview-title">
        <span class="title-icon">✨</span>
        運勢總覽與核心洞察
      </h3>

      <!-- 個人天賦與特質分析 -->
      <div class="talents-traits-section">
        <h4 class="section-title">
          <span class="section-icon">🌟</span>
          個人天賦與特質
        </h4>
        <div class="cards-grid">
          <div
            v-for="(talent, index) in personalTalents"
            :key="`talent-${index}`"
            class="insight-card talent-card"
            @click="onTalentClick(talent)"
          >
            <div class="card-header">
              <span class="palace-name">{{ talent.palaceName }}</span>
              <span class="palace-zhi">({{ talent.palaceZhi }})</span>
            </div>
            <div class="card-content">
              <div class="core-talent">{{ talent.coreTalent }}</div>
              <div class="description">{{ talent.description }}</div>
              <div v-if="talent.keyStars.length > 0" class="star-config">
                <span class="star-label">關鍵星曜：</span>
                <span class="stars">{{ talent.keyStars.join('、') }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="talent-level">
                <span class="level-label">天賦等級：</span>
                <div class="level-stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="['star', { active: i <= talent.level }]"
                    >★</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 無明顯天賦時的提示 -->
        <div v-if="personalTalents.length === 0" class="no-insights">
          <div class="no-insights-icon">💫</div>
          <p>
            命盤呈現均衡發展的特質，各方面都有發展潛力，建議多元嘗試發掘個人興趣。
          </p>
        </div>
      </div>

      <!-- 潛能發掘與建議 -->
      <div class="potential-development-section">
        <h4 class="section-title">
          <span class="section-icon">🚀</span>
          潛能發掘與發展建議
        </h4>
        <div class="cards-grid">
          <div
            v-for="(potential, index) in potentialDevelopment"
            :key="`potential-${index}`"
            class="insight-card potential-card"
            @click="onPotentialClick(potential)"
          >
            <div class="card-header">
              <span class="palace-name">{{ potential.palaceName }}</span>
              <span class="palace-zhi">({{ potential.palaceZhi }})</span>
            </div>
            <div class="card-content">
              <div class="core-potential">{{ potential.corePotential }}</div>
              <div class="description">{{ potential.description }}</div>
              <div
                v-if="potential.developmentMethod"
                class="development-method"
              >
                <span class="method-label">發展方式：</span>
                <span class="method">{{ potential.developmentMethod }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="potential-level">
                <span class="level-label">發展潛力：</span>
                <div class="level-indicators">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'indicator',
                      'potential-indicator',
                      { active: i <= potential.level },
                    ]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 無特殊潛能時的提示 -->
        <div v-if="potentialDevelopment.length === 0" class="no-insights">
          <div class="no-insights-icon">🌱</div>
          <p>您的潛能發展空間廣闊，建議從自己感興趣的領域開始深入探索。</p>
        </div>
      </div>

      <!-- 命盤核心洞察 -->
      <div class="key-focus-section">
        <h4 class="section-title">
          <span class="section-icon">🎯</span>
          命盤核心洞察
        </h4>
        <div class="focus-content">
          <div class="focus-summary">
            {{ keyFocus.summary }}
          </div>
          <div class="energy-analysis">
            <div class="energy-distribution">
              <h5>能量分佈</h5>
              <div class="energy-bars">
                <div
                  v-for="(energy, palaceName) in keyFocus.energyDistribution"
                  :key="palaceName"
                  class="energy-bar-item"
                >
                  <span class="palace-label">{{ palaceName }}</span>
                  <div class="energy-bar">
                    <div
                      class="energy-fill"
                      :style="{
                        width: `${Math.abs(energy)}%`,
                        backgroundColor: energy > 0 ? '#28a745' : '#dc3545',
                      }"
                    />
                  </div>
                  <span class="energy-value"
                    >{{ energy > 0 ? '+' : '' }}{{ energy }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 行動建議 -->
      <div class="action-advice-section">
        <h4 class="section-title">
          <span class="section-icon">💡</span>
          行動建議
        </h4>
        <div class="advice-list">
          <div
            v-for="(advice, index) in actionAdvice"
            :key="`advice-${index}`"
            class="advice-item"
            :class="`advice-${advice.type}`"
          >
            <div class="advice-icon">{{ getAdviceIcon(advice.type) }}</div>
            <div class="advice-content">
              <div class="advice-title">{{ advice.title }}</div>
              <div class="advice-description">{{ advice.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 五行結構分析 -->
      <div class="five-elements-section">
        <h4 class="section-title">
          <span class="section-icon">🌟</span>
          五行結構分析
        </h4>
        <div class="elements-container">
          <div class="elements-chart">
            <div class="element-bars">
              <div
                v-for="element in fiveElements"
                :key="element.name"
                class="element-bar"
              >
                <div class="element-label">{{ element.name }}</div>
                <div class="element-progress">
                  <div
                    class="element-fill"
                    :style="{
                      width: `${element.percentage}%`,
                      backgroundColor: element.color,
                    }"
                  />
                </div>
                <div class="element-value">{{ element.count }}</div>
              </div>
            </div>
          </div>

          <div class="elements-analysis">
            <div class="elements-summary">
              <h5>五行特質</h5>
              <div class="summary-content">
                <div class="dominant-element">
                  <span class="label">主導五行：</span>
                  <span class="value">{{ dominantElement.name }}</span>
                </div>
                <div class="element-balance">
                  <span class="label">平衡度：</span>
                  <span class="value">{{ elementBalance }}</span>
                </div>
              </div>
            </div>

            <div class="elements-interpretation">
              <h5>五行解析</h5>
              <ul class="interpretation-list">
                <li
                  v-for="(interpretation, index) in fiveElementsInterpretation"
                  :key="index"
                >
                  {{ interpretation }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 關鍵格局 -->
      <div v-if="keyPatterns.length > 0" class="key-patterns-section">
        <h4 class="section-title">
          <span class="section-icon">🔮</span>
          關鍵格局分析
        </h4>
        <div class="patterns-container">
          <div class="patterns-grid">
            <div
              v-for="(pattern, index) in keyPatterns"
              :key="`pattern-${index}`"
              class="pattern-card"
              :class="getPatternClass(pattern)"
            >
              <div class="pattern-header">
                <div class="pattern-icon">{{ getPatternIcon(pattern) }}</div>
                <div class="pattern-name">{{ pattern.name }}</div>
                <div class="pattern-type">{{ getPatternType(pattern) }}</div>
              </div>

              <div class="pattern-content">
                <div class="pattern-description">{{ pattern.description }}</div>
                <div class="pattern-effects">
                  <h6>主要影響</h6>
                  <ul>
                    <li v-for="(effect, idx) in pattern.effects" :key="idx">
                      {{ effect }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="pattern-strength">
                <span class="strength-label">格局強度：</span>
                <div class="strength-bars">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="['strength-bar', { active: i <= pattern.strength }]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { PurpleStarChart, Palace, Star } from '@/types/astrologyTypes';

// Props
interface Props {
  chartData: PurpleStarChart;
  transformationFlows?: Record<
    number,
    {
      palaceIndex: number;
      palaceName: string;
      energyScore: number;
      majorInfluences: string[];
    }
  >;
  multiLayerEnergies?: Record<
    number,
    {
      palaceIndex: number;
      palaceName: string;
      baseEnergy: number;
      daXianEnergy: number;
      liuNianEnergy: number;
      totalEnergy: number;
      interpretation: string;
    }
  >;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  palaceClick: [palaceIndex: number];
  talentClick: [talent: any];
  potentialClick: [potential: any];
}>();

// 星曜亮度等級映射
const brightnessLevels: Record<string, number> = {
  廟: 5,
  旺: 4,
  得地: 3,
  利益: 2,
  平和: 1,
  不得地: 0,
  落陷: -1,
};

// 格局類型映射
const patternTypes = {
  auspicious: [
    '紫府夾命格',
    '左右夾命格',
    '文昌文曲格',
    '財蔭夾印格',
    '殺破狼格',
    '機月同梁格',
  ],
  inauspicious: ['日月反背格', '火鈴夾命格', '羊陀夾命格', '空劫夾命格'],
};

// 分析個人天賦與特質
const personalTalents = computed(() => {
  const talents: Array<{
    palaceName: string;
    palaceZhi: string;
    palaceIndex: number;
    coreTalent: string;
    description: string;
    keyStars: string[];
    level: number;
  }> = [];

  if (!props.chartData?.palaces) {
    return talents;
  }

  // 遍歷所有宮位，識別天賦特質
  props.chartData.palaces.forEach((palace) => {
    let score = 0;
    const keyStars: string[] = [];
    const talentType = '';

    // 檢查主星配置
    const mainStars = palace.stars.filter((star) => star.type === 'main');
    const brightStars = mainStars.filter(
      (star) => star.brightness && brightnessLevels[star.brightness] >= 4,
    );

    // 紫微斗數14主星天賦分析
    const leadershipStars = ['紫微', '天府']; // 領導型
    const intellectualStars = ['天機', '天梁']; // 智謀型
    const executiveStars = ['武曲', '破軍', '七殺']; // 執行型
    const creativityStars = ['貪狼', '廉貞']; // 創新型
    const communicationStars = ['太陽', '巨門']; // 溝通型
    const harmonyStars = ['太陰', '天同', '天相']; // 和諧型

    const foundSpecialStars = mainStars.filter((star) =>
      [
        leadershipStars,
        intellectualStars,
        executiveStars,
        creativityStars,
        communicationStars,
        harmonyStars,
      ]
        .flat()
        .includes(star.name),
    );

    if (foundSpecialStars.length > 0) {
      // 根據星曜類型和亮度調整分數
      foundSpecialStars.forEach((star) => {
        let starScore = 3;
        if (star.brightness && brightnessLevels[star.brightness] >= 4) {
          starScore = 5; // 廟旺星增加分數
        } else if (star.brightness && brightnessLevels[star.brightness] <= 1) {
          starScore = 1; // 失陷星減少分數
        }
        score += starScore;
      });
      keyStars.push(...foundSpecialStars.map((star) => star.name));
    }

    // 檢查吉星輔助
    const auspiciousStars = palace.stars.filter(
      (star) => star.attribute === '吉',
    );
    if (auspiciousStars.length > 0) {
      score += auspiciousStars.length;
      keyStars.push(...auspiciousStars.map((star) => star.name));
    }

    // 檢查四化祿權
    const transformedStars = palace.stars.filter((star) =>
      star.transformations?.some((t) => ['祿', '權'].includes(t)),
    );
    if (transformedStars.length > 0) {
      score += transformedStars.length * 2;
    }

    // 檢查能量流動
    const energyFlow = props.transformationFlows?.[palace.index];
    if (energyFlow && energyFlow.energyScore > 2) {
      score += Math.floor(energyFlow.energyScore / 2);
    }

    // 如果分數足夠高，加入天賦列表
    if (score >= 4 && keyStars.length > 0) {
      const level = Math.min(5, Math.ceil(score / 3));
      talents.push({
        palaceName: palace.name,
        palaceZhi: palace.zhi,
        palaceIndex: palace.index,
        coreTalent: getCoreTalent(palace.name, keyStars),
        description: getTalentDescription(palace.name, keyStars),
        keyStars: keyStars.slice(0, 3), // 限制顯示3個關鍵星曜
        level,
      });
    }
  });

  // 按等級排序，取前3個
  return talents.sort((a, b) => b.level - a.level).slice(0, 3);
});

// 分析潛能發掘與發展建議
const potentialDevelopment = computed(() => {
  const potentials: Array<{
    palaceName: string;
    palaceZhi: string;
    palaceIndex: number;
    corePotential: string;
    description: string;
    developmentMethod: string;
    level: number;
  }> = [];

  if (!props.chartData?.palaces) {
    return potentials;
  }

  // 遍歷所有宮位，識別潛能發展空間
  props.chartData.palaces.forEach((palace) => {
    let score = 0;
    const potentialTypes: string[] = [];

    const mainStars = palace.stars.filter((star) => star.type === 'main');
    const auxiliaryStars = palace.stars.filter(
      (star) => star.type === 'auxiliary',
    );

    // 檢查空宮發展潛力 - 根據宮位重要性調整
    if (mainStars.length === 0) {
      const importantPalaces = ['命宮', '財帛宮', '官祿宮', '夫妻宮'];
      const palaceScore = importantPalaces.includes(palace.name) ? 4 : 3;
      score += palaceScore;
      potentialTypes.push('空宮發展');
    }

    // 檢查可改善的星曜配置
    const improvableStars = mainStars.filter(
      (star) =>
        star.brightness &&
        brightnessLevels[star.brightness] <= 2 &&
        brightnessLevels[star.brightness] >= 0,
    );
    if (improvableStars.length > 0) {
      // 根據星曜等級給予不同分數
      improvableStars.forEach((star) => {
        if (['紫微', '天府', '太陽', '武曲'].includes(star.name)) {
          score += 3; // 重要主星
        } else {
          score += 2; // 一般主星
        }
      });
      potentialTypes.push('星曜提升');
    }

    // 檢查吉星輔助潛力
    const beneficStars = [...auxiliaryStars, ...palace.stars].filter((star) =>
      [
        '左輔',
        '右弼',
        '文昌',
        '文曲',
        '天魁',
        '天鉞',
        '祿存',
        '化祿',
        '化權',
        '化科',
      ].includes(star.name),
    );
    if (beneficStars.length >= 2) {
      score += Math.min(beneficStars.length, 4); // 最多4分
      potentialTypes.push('吉星輔助');
    }

    // 檢查格局形成潛力
    const formatPatternPotential = checkPatternPotential(
      palace,
      props.chartData.palaces,
    );
    if (formatPatternPotential.score > 0) {
      score += formatPatternPotential.score;
      potentialTypes.push(formatPatternPotential.type);
    }

    // 檢查四化發展機會
    const transformationOpportunity = palace.stars.some((star) =>
      star.transformations?.some((t) => ['祿', '權', '科'].includes(t)),
    );
    if (transformationOpportunity) {
      score += 3; // 四化是重要的發展機會
      potentialTypes.push('四化機會');
    }

    // 檢查三方四正能量協調
    const energyFlow = props.transformationFlows?.[palace.index];
    const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
    if (energyFlow || multiLayerEnergy) {
      const energyScore = energyFlow?.energyScore || 0;
      const totalEnergy = multiLayerEnergy?.totalEnergy || 0;

      // 能量適中時表示有發展空間
      if (Math.abs(energyScore) <= 3 && Math.abs(totalEnergy) <= 5) {
        score += 2;
        potentialTypes.push('能量協調');
      }
    }

    // 如果有發展潛力，加入潛能列表
    if (score >= 2 && potentialTypes.length > 0) {
      const level = Math.min(5, Math.ceil(score / 2));
      potentials.push({
        palaceName: palace.name,
        palaceZhi: palace.zhi,
        palaceIndex: palace.index,
        corePotential: getCorePotential(palace.name, potentialTypes),
        description: getPotentialDescription(palace.name, potentialTypes),
        developmentMethod: getDevelopmentMethod(palace.name, potentialTypes),
        level,
      });
    }
  });

  // 按等級排序，取前3個
  return potentials.sort((a, b) => b.level - a.level).slice(0, 3);
});

// 檢查格局形成潛力的輔助函數
const checkPatternPotential = (palace: Palace, allPalaces: Palace[]) => {
  let score = 0;
  let type = '';

  const mainStarNames = palace.stars
    .filter((star) => star.type === 'main')
    .map((star) => star.name);

  // 檢查是否有形成吉格的潛力
  if (mainStarNames.includes('紫微') || mainStarNames.includes('天府')) {
    // 紫府夾命格潛力
    score += 2;
    type = '格局形成';
  }

  if (mainStarNames.includes('武曲') && mainStarNames.includes('破軍')) {
    // 武破格潛力
    score += 2;
    type = '格局形成';
  }

  if (mainStarNames.includes('天機') && mainStarNames.includes('天梁')) {
    // 機梁格潛力
    score += 2;
    type = '格局形成';
  }

  // 檢查殺破狼格潛力
  const kbwStars = ['七殺', '破軍', '貪狼'];
  if (kbwStars.some((star) => mainStarNames.includes(star))) {
    score += 1;
    type = '變動格局';
  }

  return { score, type };
};

// 命盤核心洞察分析
const keyFocus = computed(() => {
  const focus = {
    summary: '',
    energyDistribution: {} as Record<string, number>,
  };

  if (!props.chartData?.palaces) {
    return focus;
  }

  // 分析命盤結構特徵
  const analysisResults = analyzeChartStructure();

  // 計算能量分佈（包含基礎星曜能量和四化能量）
  props.chartData.palaces.forEach((palace) => {
    let totalEnergy = 0;

    // 基礎星曜能量
    const mainStars = palace.stars.filter((star) => star.type === 'main');
    mainStars.forEach((star) => {
      if (star.brightness && brightnessLevels[star.brightness] >= 4) {
        totalEnergy += 3; // 廟旺星
      } else if (star.brightness && brightnessLevels[star.brightness] <= 1) {
        totalEnergy -= 2; // 失陷星
      } else {
        totalEnergy += 1; // 一般星
      }
    });

    // 四化能量
    const energyFlow = props.transformationFlows?.[palace.index];
    if (energyFlow) {
      totalEnergy += energyFlow.energyScore;
    }

    // 多層次能量
    const multiLayerEnergy = props.multiLayerEnergies?.[palace.index];
    if (multiLayerEnergy) {
      totalEnergy += Math.floor(multiLayerEnergy.totalEnergy / 2);
    }

    focus.energyDistribution[palace.name] = totalEnergy;
  });

  // 生成核心洞察摘要
  const coreInsights = generateCoreInsights(
    analysisResults,
    focus.energyDistribution,
  );
  focus.summary = coreInsights;

  return focus;
});

// 分析命盤結構特徵
const analyzeChartStructure = () => {
  if (!props.chartData?.palaces) {
    return { patterns: [], starTypes: [], energyBalance: 'unknown' };
  }

  const results = {
    patterns: [] as string[],
    starTypes: [] as string[],
    energyBalance: 'balanced' as 'high' | 'low' | 'balanced' | 'mixed',
  };

  // 檢查命盤格局
  const allMainStars = props.chartData.palaces
    .flatMap((palace) => palace.stars.filter((star) => star.type === 'main'))
    .map((star) => star.name);

  // 檢查殺破狼格局
  if (['七殺', '破軍', '貪狼'].every((star) => allMainStars.includes(star))) {
    results.patterns.push('殺破狼格局');
  }

  // 檢查機月同梁格局
  if (
    ['天機', '太陰', '天同', '天梁'].some((star) => allMainStars.includes(star))
  ) {
    results.patterns.push('機月同梁格局');
  }

  // 檢查紫微格局
  if (allMainStars.includes('紫微')) {
    results.patterns.push('紫微格局');
  }

  // 分析星曜類型傾向
  const leadershipCount = allMainStars.filter((star) =>
    ['紫微', '天府'].includes(star),
  ).length;
  const intellectualCount = allMainStars.filter((star) =>
    ['天機', '天梁'].includes(star),
  ).length;
  const executiveCount = allMainStars.filter((star) =>
    ['武曲', '破軍', '七殺'].includes(star),
  ).length;

  if (leadershipCount >= 1) {
    results.starTypes.push('領導型');
  }
  if (intellectualCount >= 1) {
    results.starTypes.push('智謀型');
  }
  if (executiveCount >= 1) {
    results.starTypes.push('執行型');
  }

  return results;
};

// 生成核心洞察
const generateCoreInsights = (
  analysis: any,
  energyDist: Record<string, number>,
) => {
  const insights: string[] = [];

  // 格局洞察
  if (analysis.patterns.length > 0) {
    const primaryPattern = analysis.patterns[0];
    if (primaryPattern === '殺破狼格局') {
      insights.push(
        '您的命盤呈現殺破狼格局，具有強烈的開創和變革特質，適合在變動中求發展。',
      );
    } else if (primaryPattern === '機月同梁格局') {
      insights.push(
        '您的命盤偏向機月同梁格局，具備穩健的智慧和服務特質，適合從事教育或輔導工作。',
      );
    } else if (primaryPattern === '紫微格局') {
      insights.push(
        '您的命盤以紫微為核心，具有天生的領導特質和貴氣，適合擔任管理或指導角色。',
      );
    }
  }

  // 星曜類型洞察
  if (analysis.starTypes.length > 0) {
    const typeDesc = analysis.starTypes.join('和');
    insights.push(`您的個性特質偏向${typeDesc}，建議發揮這些天賦優勢。`);
  }

  // 能量分佈洞察
  const strongPalaces = Object.entries(energyDist)
    .filter(([_, energy]) => energy > 4)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name);

  if (strongPalaces.length > 0) {
    insights.push(
      `目前${strongPalaces.join('、')}能量充沛，是重點發展的優勢領域。`,
    );
  }

  // 如果沒有特殊洞察，提供一般性分析
  if (insights.length === 0) {
    insights.push(
      '您的命盤結構均衡，各方面都有發展潛力，建議多元化發展並保持學習心態。',
    );
  }

  return insights.join(' ');
};

// 行動建議
const actionAdvice = computed(() => {
  const advice: Array<{
    type: 'leverage' | 'develop' | 'general';
    title: string;
    description: string;
  }> = [];

  // 基於天賦的發揮建議
  if (personalTalents.value.length > 0) {
    const topTalent = personalTalents.value[0];
    advice.push({
      type: 'leverage',
      title: `發揮${topTalent.palaceName}天賦`,
      description: `善用您在${topTalent.coreTalent}方面的天賦，${getLeverageAdvice(topTalent.palaceName)}`,
    });
  }

  // 基於潛能的發展建議
  if (potentialDevelopment.value.length > 0) {
    const topPotential = potentialDevelopment.value[0];
    advice.push({
      type: 'develop',
      title: `開發${topPotential.palaceName}潛能`,
      description: `透過${topPotential.developmentMethod}，${getDevelopAdvice(topPotential.palaceName)}`,
    });
  }

  // 基於命盤結構的整體建議
  const structureAdvice = getStructuralAdvice();
  if (structureAdvice) {
    advice.push({
      type: 'general',
      title: '命盤結構建議',
      description: structureAdvice,
    });
  }

  // 通用人生智慧
  advice.push({
    type: 'general',
    title: '紫微智慧提醒',
    description:
      '命盤顯示先天特質與潛能，後天的修為和努力同樣重要。建議以命盤為指引，結合實際行動，創造屬於自己的精彩人生。',
  });

  return advice.slice(0, 3); // 限制最多3個建議
});

// 輔助函數
const getCoreTalent = (palaceName: string, keyStars: string[]): string => {
  // 星曜組合天賦分析
  const starTalentMap: Record<string, string> = {
    紫微: '領導統御天賦',
    天府: '管理經營天賦',
    太陽: '光明磊落天賦',
    太陰: '溫柔包容天賦',
    天機: '智慧策劃天賦',
    天同: '和諧協調天賦',
    武曲: '務實執行天賦',
    天相: '輔助服務天賦',
    廉貞: '變革創新天賦',
    天梁: '保護指導天賦',
    破軍: '突破開創天賦',
    七殺: '競爭進取天賦',
    貪狼: '多元發展天賦',
    巨門: '溝通表達天賦',
  };

  // 宮位特色天賦
  const palaceTalentMap: Record<string, string> = {
    命宮: '個人魅力與領導力',
    財帛宮: '財富創造與理財',
    官祿宮: '專業能力與事業',
    夫妻宮: '情感經營與合作',
    子女宮: '創意發想與教育',
    田宅宮: '環境營造與投資',
    交友宮: '人際建立與社交',
    遷移宮: '環境適應與發展',
    疾厄宮: '身心健康與調理',
    福德宮: '精神修養與智慧',
    父母宮: '學習傳承與成長',
    兄弟宮: '平等合作與支援',
  };

  // 優先使用最強的主星天賦
  for (const star of keyStars) {
    if (starTalentMap[star]) {
      return starTalentMap[star];
    }
  }

  return palaceTalentMap[palaceName] || '多元潛質發展';
};

const getTalentDescription = (
  palaceName: string,
  keyStars: string[],
): string => {
  const starDescriptions: Record<string, string> = {
    紫微: '具備天生的領導魅力和統御能力',
    天府: '擁有穩重的管理才能和財富直覺',
    太陽: '散發正面能量，具有感化他人的力量',
    太陰: '敏感細膩，富有藝術和審美天賦',
    武曲: '實事求是，具備優秀的執行和理財能力',
    天機: '頭腦靈活，善於策劃和創新思考',
    天同: '性格溫和，具有協調和化解衝突的才能',
    廉貞: '意志堅定，富有開創和變革的勇氣',
    天相: '善於輔助他人，具備優秀的人際協調能力',
    巨門: '口才好，適合從事傳播或教育相關工作',
    貪狼: '多才多藝，具有強烈的求知慾和適應力',
    破軍: '勇於突破，具備改革創新的膽識',
    七殺: '意志力強，適合在競爭激烈的環境中發展',
    天梁: '具備保護他人的特質，適合服務社會',
  };

  const primaryStarDesc = keyStars
    .map((star) => starDescriptions[star])
    .filter(Boolean)[0];
  const baseDesc = primaryStarDesc || `在${palaceName}展現出獨特的天賦特質`;

  return `${baseDesc}，這是您與生俱來的優勢能力。`;
};

const getCorePotential = (
  palaceName: string,
  potentialTypes: string[],
): string => {
  const potentialMap: Record<string, string> = {
    命宮: '個人品牌塑造',
    財帛宮: '財富管理優化',
    官祿宮: '專業技能提升',
    夫妻宮: '情感智慧深化',
    子女宮: '創意才能開發',
    田宅宮: '生活品質改善',
    交友宮: '人脈網絡擴展',
    遷移宮: '國際視野培養',
    疾厄宮: '身心靈調和',
    福德宮: '精神層次提升',
    父母宮: '知識學習深化',
    兄弟宮: '合作關係強化',
  };

  // 根據潛能類型調整描述
  if (potentialTypes.includes('空宮發展')) {
    return potentialMap[palaceName] || '全新領域探索';
  }
  if (potentialTypes.includes('星曜提升')) {
    return potentialMap[palaceName] || '既有能力強化';
  }

  return potentialMap[palaceName] || '多維度發展';
};

const getPotentialDescription = (
  palaceName: string,
  potentialTypes: string[],
): string => {
  const typeDescriptions: Record<string, string> = {
    空宮發展: '此領域具有無限可能性，可以從零開始建立',
    星曜提升: '現有基礎良好，透過後天努力可以大幅提升',
    吉星輔助: '具備良好的支援系統，貴人運強，發展條件佳',
    格局形成: '具備形成特殊格局的潛力，發展前景可期',
    變動格局: '適合在變動中求發展，勇於創新突破',
    四化機會: '時機成熟，天時地利具備，適合積極發展',
    能量協調: '各方面能量均衡，是穩健紮實發展的好時機',
  };

  // 優先選擇最重要的潛能類型
  const priorityOrder = [
    '格局形成',
    '四化機會',
    '吉星輔助',
    '變動格局',
    '星曜提升',
    '空宮發展',
    '能量協調',
  ];
  let primaryTypeDesc = '';

  for (const priority of priorityOrder) {
    if (potentialTypes.includes(priority)) {
      primaryTypeDesc = typeDescriptions[priority];
      break;
    }
  }

  const baseDesc = primaryTypeDesc || `${palaceName}具有良好的發展潛力`;

  return `${baseDesc}，建議制定具體的發展計劃並持續努力。`;
};

const getDevelopmentMethod = (
  palaceName: string,
  potentialTypes: string[],
): string => {
  const methodMap: Record<string, string> = {
    命宮: '自我提升、形象管理、領導力培養',
    財帛宮: '理財規劃、投資學習、收入多元化',
    官祿宮: '專業進修、技能認證、職涯規劃',
    夫妻宮: '情感溝通、關係經營、心理成長',
    子女宮: '創意開發、藝術學習、興趣培養',
    田宅宮: '居住環境優化、不動產投資',
    交友宮: '社交技巧、人脈經營、團隊合作',
    遷移宮: '旅行體驗、文化交流、環境適應',
    疾厄宮: '健康管理、運動養生、壓力調節',
    福德宮: '精神修養、哲學思考、心靈成長',
    父母宮: '終身學習、知識積累、師長請益',
    兄弟宮: '同儕合作、資源共享、互助成長',
  };

  return methodMap[palaceName] || '多方面均衡發展';
};

const getLeverageAdvice = (palaceName: string): string => {
  const adviceMap: Record<string, string> = {
    命宮: '可主動爭取領導機會，展現個人能力。',
    財帛宮: '適合進行投資理財，累積財富。',
    官祿宮: '積極爭取升遷機會，發展事業。',
    夫妻宮: '是談婚論嫁的好時機。',
    交友宮: '多參與社交活動，擴展人脈。',
  };
  return adviceMap[palaceName] || '積極發揮這方面的潛能。';
};

const getDevelopAdvice = (palaceName: string): string => {
  const adviceMap: Record<string, string> = {
    命宮: '建議積極提升個人能力，樹立正面形象。',
    財帛宮: '規劃財務目標，學習投資理財知識。',
    官祿宮: '持續精進專業技能，建立職場競爭力。',
    夫妻宮: '培養情感智慧，學習經營關係的藝術。',
    子女宮: '開發創意潛能，培養藝術或教育才華。',
    田宅宮: '改善居住環境，考慮不動產投資機會。',
    交友宮: '擴展社交圈，建立互利的人際網絡。',
    遷移宮: '增加國際視野，培養適應變化的能力。',
    疾厄宮: '注重身心健康，建立良好的生活習慣。',
    福德宮: '提升精神層次，培養正面的人生觀。',
    父母宮: '加強學習能力，與長輩保持良好關係。',
    兄弟宮: '強化團隊合作，發展平等互助的關係。',
  };
  return adviceMap[palaceName] || '建議制定具體的發展計劃並持續努力。';
};

const getStructuralAdvice = (): string => {
  if (!props.chartData?.palaces) {
    return '';
  }

  const allMainStars = props.chartData.palaces
    .flatMap((palace) => palace.stars.filter((star) => star.type === 'main'))
    .map((star) => star.name);

  // 殺破狼格局建議
  if (['七殺', '破軍', '貪狼'].every((star) => allMainStars.includes(star))) {
    return '您的命盤呈現殺破狼格局，建議在穩定中求變化，避免過度冒進，同時把握變革機會。';
  }

  // 機月同梁格局建議
  if (
    ['天機', '太陰', '天同', '天梁'].some((star) => allMainStars.includes(star))
  ) {
    return '您的命盤偏向機月同梁格局，建議發揮智慧和服務精神，在穩健中求發展。';
  }

  // 紫微格局建議
  if (allMainStars.includes('紫微')) {
    return '您具有紫微帝星特質，建議培養領導能力，承擔責任，發揮正面影響力。';
  }

  return '建議根據個人特質，均衡發展各方面能力，保持積極正面的心態。';
};

const getAdviceIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    leverage: '🚀',
    develop: '🌱',
    general: '💫',
  };
  return iconMap[type] || '💡';
};

// 星曜屬性映射（用於核心能力分析）
const starAttributes = {
  leadership: ['紫微', '天府', '武曲', '貪狼', '七殺', '破軍'],
  creativity: ['貪狼', '廉貞', '巨門', '文昌', '文曲', '左輔', '右弼'],
  communication: ['太陽', '巨門', '天梁', '文昌', '文曲'],
  learning: ['文昌', '文曲', '天機', '太陰', '天梁'],
  financial: ['武曲', '天府', '太陰', '祿存', '化祿'],
  social: ['太陽', '天同', '天梁', '左輔', '右弼', '天魁', '天鉞'],
};

// 核心能力分析
const coreAbilities = computed(() => {
  const abilities = [
    { name: '領導力', value: 0, color: '#ff6b6b', key: 'leadership' },
    { name: '創造力', value: 0, color: '#4ecdc4', key: 'creativity' },
    { name: '溝通力', value: 0, color: '#45b7d1', key: 'communication' },
    { name: '學習能力', value: 0, color: '#96ceb4', key: 'learning' },
    { name: '理財能力', value: 0, color: '#feca57', key: 'financial' },
    { name: '人際關係', value: 0, color: '#ff9ff3', key: 'social' },
  ];

  if (!props.chartData?.palaces) {
    abilities.forEach((ability) => {
      ability.value = 4 + Math.floor(Math.random() * 3);
    });
    return abilities;
  }

  // 計算各項能力值
  abilities.forEach((ability) => {
    const relatedStars =
      starAttributes[ability.key as keyof typeof starAttributes] || [];
    let score = 0;
    let starCount = 0;

    props.chartData.palaces.forEach((palace) => {
      palace.stars?.forEach((star) => {
        if (relatedStars.includes(star.name)) {
          starCount++;
          score += 2;

          // 亮度加成
          if (star.brightness) {
            const brightnessBonus =
              {
                廟: 4,
                旺: 3,
                得地: 2,
                利益: 1,
                平和: 0,
                不得地: -1,
                落陷: -2,
              }[star.brightness] || 0;
            score += brightnessBonus;
          }

          // 四化加成
          if (star.transformations?.includes('祿')) {
            score += 2;
          }
          if (star.transformations?.includes('權')) {
            score += 2;
          }
          if (star.transformations?.includes('科')) {
            score += 1;
          }
          if (star.transformations?.includes('忌')) {
            score -= 2;
          }

          // 特殊宮位加成
          if (palace.name === '命宮') {
            score += 1;
          }
          if (palace.name === '官祿宮' && ability.key === 'leadership') {
            score += 1;
          }
          if (palace.name === '財帛宮' && ability.key === 'financial') {
            score += 1;
          }
        }
      });
    });

    let baseScore = 4;
    if (starCount > 0) {
      baseScore = Math.max(4, score);
    } else {
      baseScore = 4 + Math.floor(Math.random() * 3);
    }

    ability.value = Math.max(4, Math.min(10, Math.round(baseScore)));
  });

  return abilities;
});

// 分析外在特質（基於命宮）
const externalTraits = computed(() => {
  const traits: string[] = [];

  if (!props.chartData?.palaces) {
    return [
      '外表沉穩內斂，給人可靠的印象',
      '在社交場合中表現得體，善於察言觀色',
    ];
  }

  const mingPalace = props.chartData.palaces.find((p) => p.name === '命宮');
  if (mingPalace?.stars) {
    const mainStars = mingPalace.stars.filter((star) => star.type === 'main');

    mainStars.forEach((star) => {
      switch (star.name) {
        case '紫微':
          traits.push('天生具有領導風範，舉止優雅高貴');
          break;
        case '天機':
          traits.push('思維敏捷，喜歡動腦思考問題');
          break;
        case '太陽':
          traits.push('性格開朗，樂於助人，具有正義感');
          break;
        case '武曲':
          traits.push('做事果斷，執行力強，重視效率');
          break;
        case '天同':
          traits.push('溫和友善，容易親近，處事圓融');
          break;
        case '廉貞':
          traits.push('個性鮮明，敢愛敢恨，有正義感');
          break;
        default:
          traits.push('外在表現穩重，為人處事有條理');
      }
    });
  }

  if (traits.length === 0) {
    traits.push('外表沉穩內斂，給人可靠的印象');
    traits.push('在社交場合中表現得體，善於察言觀色');
  }

  return traits.slice(0, 4);
});

// 分析內在特質（基於福德宮）
const internalTraits = computed(() => {
  const traits: string[] = [];

  if (!props.chartData?.palaces) {
    return ['內心渴望安全感，重視情感的穩定', '具有同理心，能夠理解他人的感受'];
  }

  const fudePalace = props.chartData.palaces.find((p) => p.name === '福德宮');
  if (fudePalace?.stars) {
    const mainStars = fudePalace.stars.filter((star) => star.type === 'main');

    mainStars.forEach((star) => {
      switch (star.name) {
        case '紫微':
          traits.push('內心高傲，對自己要求嚴格');
          break;
        case '天機':
          traits.push('內心細膩敏感，善於洞察人心');
          break;
        case '太陽':
          traits.push('內心熱忱，有強烈的使命感');
          break;
        case '武曲':
          traits.push('內心堅毅，不輕易向困難低頭');
          break;
        case '天同':
          traits.push('內心純真，渴望和諧美好的生活');
          break;
        case '廉貞':
          traits.push('內心複雜多變，情感豐富細膩');
          break;
        default:
          traits.push('內心世界豐富，有深層的思考能力');
      }
    });
  }

  // 分析疾厄宮了解內在壓力模式
  const jiePalace = props.chartData.palaces.find((p) => p.name === '疾厄宮');
  if (jiePalace?.stars) {
    const hasInauspiciousStars = jiePalace.stars.some(
      (star) => star.attribute === '凶',
    );
    if (hasInauspiciousStars) {
      traits.push('內心容易感到壓力，需要學會放鬆');
    }
  }

  if (traits.length === 0) {
    traits.push('內心渴望安全感，重視情感的穩定');
    traits.push('具有同理心，能夠理解他人的感受');
  }

  return traits.slice(0, 4);
});

// 特質綜合說明
const traitSynthesis = computed(() => {
  const external = externalTraits.value.length > 0 ? '外在表現' : '表面特質';
  const internal = internalTraits.value.length > 0 ? '內在本質' : '深層個性';

  return `您的${external}與${internal}形成了獨特的個性組合。在不同的環境和情境下，這兩種特質會交替顯現或相互影響。理解這種雙重性格有助於您更好地發揮優勢，並在人際交往中找到最適合的表達方式。建議在重要場合時發揮外在優勢，在私人時光中照顧內在需求。`;
});

// 輔助函數
const getAbilityIcon = (abilityName: string) => {
  const iconMap: Record<string, string> = {
    領導力: '👑',
    創造力: '🎨',
    溝通力: '💬',
    學習能力: '📚',
    理財能力: '💰',
    人際關係: '🤝',
  };
  return iconMap[abilityName] || '⭐';
};

const getAbilityLevel = (value: number) => {
  if (value >= 8) {
    return '優秀';
  }
  if (value >= 6) {
    return '良好';
  }
  if (value >= 4) {
    return '普通';
  }
  return '待提升';
};

const lightenColor = (color: string) => {
  const colorMap: Record<string, string> = {
    '#ff6b6b': '#ff9999',
    '#4ecdc4': '#7ee8e0',
    '#45b7d1': '#78c7e4',
    '#96ceb4': '#b8dcc6',
    '#feca57': '#fed887',
    '#ff9ff3': '#ffb8f7',
  };
  return colorMap[color] || color;
};

// 五行分析
const elementColors = {
  金: '#FFD700',
  木: '#32CD32',
  水: '#4169E1',
  火: '#FF4500',
  土: '#8B4513',
};

const fiveElements = computed(() => {
  const elements = {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  };

  if (props.chartData?.palaces) {
    props.chartData.palaces.forEach((palace) => {
      palace.stars?.forEach((star) => {
        if (star.element && elements.hasOwnProperty(star.element)) {
          elements[star.element as keyof typeof elements]++;
        }
      });
    });
  }

  const total = Object.values(elements).reduce((sum, count) => sum + count, 0);

  return Object.entries(elements).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: elementColors[name as keyof typeof elementColors],
  }));
});

const dominantElement = computed(() => {
  return fiveElements.value.reduce((max, current) =>
    current.count > max.count ? current : max,
  );
});

const elementBalance = computed(() => {
  const counts = fiveElements.value.map((e) => e.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const variance = max - min;

  if (variance <= 1) {
    return '極佳';
  }
  if (variance <= 2) {
    return '良好';
  }
  if (variance <= 3) {
    return '一般';
  }
  if (variance <= 4) {
    return '偏差';
  }
  return '失衡';
});

const fiveElementsInterpretation = computed(() => {
  const interpretations: string[] = [];
  const dominant = dominantElement.value;

  if (dominant.count > 0) {
    switch (dominant.name) {
      case '金':
        interpretations.push('金行主導：性格堅毅，做事有原則，重視規則和秩序');
        break;
      case '木':
        interpretations.push('木行主導：富有生命力，善於成長和創新，適應力強');
        break;
      case '水':
        interpretations.push('水行主導：思維靈活，直覺敏銳，善於變通和適應');
        break;
      case '火':
        interpretations.push('火行主導：熱情積極，行動力強，具有領導魅力');
        break;
      case '土':
        interpretations.push('土行主導：穩重踏實，重視安全感，具有包容性');
        break;
    }
  }

  const balance = elementBalance.value;
  switch (balance) {
    case '極佳':
      interpretations.push('五行分佈均衡，個性發展全面，適應力強');
      break;
    case '良好':
      interpretations.push('五行分佈相對均衡，個性穩定，發展潛力大');
      break;
    case '一般':
      interpretations.push('五行分佈基本平衡，需要注意弱勢五行的補強');
      break;
    case '偏差':
      interpretations.push('五行分佈不均，建議透過後天努力來平衡發展');
      break;
    case '失衡':
      interpretations.push('五行分佈失衡，需要特別注意個性的調整和發展');
      break;
  }

  return interpretations;
});

// 關鍵格局分析
const keyPatterns = computed(() => {
  const patterns: Array<{
    name: string;
    description: string;
    effects: string[];
    strength: number;
    type: 'auspicious' | 'inauspicious' | 'special';
  }> = [];

  if (!props.chartData?.palaces) {
    return patterns;
  }

  const { palaces } = props.chartData;

  // 檢查紫府夾命格
  const mingPalace = palaces.find((p) => p.name === '命宮');
  if (mingPalace) {
    const hasZiwei = mingPalace.stars?.some((s) => s.name === '紫微');
    const hasTianfu = mingPalace.stars?.some((s) => s.name === '天府');

    if (hasZiwei && hasTianfu) {
      patterns.push({
        name: '紫府夾命格',
        description: '紫微天府同宮於命宮，為帝王格局，主貴氣天成。',
        effects: [
          '具有天生的領導氣質和權威感',
          '容易得到他人的尊重和信任',
          '事業發展潛力大，適合管理職位',
        ],
        strength: 5,
        type: 'auspicious',
      });
    }
  }

  // 檢查左右夾命格
  const leftRight = palaces.some(
    (p) =>
      p.stars?.some((s) => s.name === '左輔') &&
      p.stars?.some((s) => s.name === '右弼'),
  );

  if (leftRight) {
    patterns.push({
      name: '左右夾命格',
      description: '左輔右弼拱照命宮，主得貴人相助。',
      effects: [
        '一生貴人運佳，容易得到幫助',
        '人際關係良好，善於合作',
        '事業上容易得到支持和提攜',
      ],
      strength: 4,
      type: 'auspicious',
    });
  }

  // 檢查文昌文曲格
  const wenchangWenqu = palaces.some(
    (p) =>
      p.stars?.some((s) => s.name === '文昌') &&
      p.stars?.some((s) => s.name === '文曲'),
  );

  if (wenchangWenqu) {
    patterns.push({
      name: '文昌文曲格',
      description: '文昌文曲同宮或拱照，主文才出眾。',
      effects: [
        '學習能力強，文筆佳',
        '適合從事文化、教育、傳媒工作',
        '考試運佳，學業成就突出',
      ],
      strength: 4,
      type: 'auspicious',
    });
  }

  // 檢查火鈴夾命格（不吉格局）
  const fireRing = palaces.some(
    (p) =>
      p.stars?.some((s) => s.name === '火星') &&
      p.stars?.some((s) => s.name === '鈴星'),
  );

  if (fireRing) {
    patterns.push({
      name: '火鈴夾命格',
      description: '火星鈴星夾命，主性格急躁，容易衝動。',
      effects: [
        '性格較為急躁，容易發脾氣',
        '做事衝動，需要學會控制情緒',
        '適合從事需要行動力的工作',
      ],
      strength: 3,
      type: 'inauspicious',
    });
  }

  return patterns;
});

const getPatternClass = (pattern: any) => {
  return `pattern-${pattern.type}`;
};

const getPatternIcon = (pattern: any) => {
  const icons = {
    auspicious: '🌟',
    inauspicious: '⚠️',
    special: '🔮',
  };
  return icons[pattern.type as keyof typeof icons] || '🔸';
};

const getPatternType = (pattern: any) => {
  const types = {
    auspicious: '吉格',
    inauspicious: '凶格',
    special: '特殊格局',
  };
  return types[pattern.type as keyof typeof types] || '一般格局';
};

// 事件處理
const onTalentClick = (talent: any) => {
  emit('talentClick', talent);
  emit('palaceClick', talent.palaceIndex);
};

const onPotentialClick = (potential: any) => {
  emit('potentialClick', potential);
  emit('palaceClick', potential.palaceIndex);
};
</script>

<style scoped>
.fortune-overview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
}

.overview-container {
  padding: 24px;
}

.overview-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 32px 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.title-icon {
  font-size: 1.8rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.2rem;
  font-weight: 500;
}

.section-icon {
  font-size: 1.3rem;
}

/* 卡片網格佈局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 洞察卡片樣式 */
.insight-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.insight-card:hover::before {
  opacity: 1;
}

.talent-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
}

.potential-card {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1f5fe 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.palace-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.palace-zhi {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-content {
  margin-bottom: 16px;
}

.core-talent,
.core-potential {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #495057;
}

.star-config,
.development-method {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.star-label,
.method-label {
  font-weight: 500;
  color: #495057;
}

.stars,
.method {
  color: #667eea;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.talent-level,
.potential-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.level-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.star.active {
  color: #ffc107;
}

.level-indicators {
  display: flex;
  gap: 3px;
}

.indicator {
  width: 12px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.indicator.active {
  background: #ff6b6b;
}

.potential-indicator.active {
  background: #667eea;
}

/* 無洞察提示 */
.no-insights {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 32px;
}

.no-insights-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

/* 焦點分析區域 */
.key-focus-section {
  margin-bottom: 32px;
}

.focus-content {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.focus-summary {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #2c3e50;
  margin-bottom: 24px;
}

.energy-analysis h5 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1rem;
}

.energy-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.energy-bar-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 12px;
}

.palace-label {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.energy-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.energy-value {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: right;
  color: #495057;
}

/* 行動建議區域 */
.action-advice-section {
  margin-bottom: 0;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.advice-item:hover {
  transform: translateY(-2px);
}

.advice-leverage {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
  border-left: 4px solid #28a745;
}

.advice-develop {
  background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e8 100%);
  border-left: 4px solid #4caf50;
}

.advice-general {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-left: 4px solid #2196f3;
}

.advice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.advice-content {
  flex: 1;
}

.advice-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.advice-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
}

.abilities-container {
  padding: 0 24px;
}

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.ability-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 254, 0.95) 100%
  );
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.ability-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--ability-color);
  opacity: 0.8;
}

.ability-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--ability-color);
}

.ability-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ability-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ability-info {
  flex: 1;
}

.ability-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.ability-score {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.ability-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease-out;
  position: relative;
}

.ability-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.ability-level {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  min-width: 48px;
  text-align: right;
}

.traits-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: start;
  padding: 0 24px;
  margin-bottom: 24px;
}

.trait-side {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 254, 0.9) 100%
  );
  border-radius: 16px;
  padding: 24px;
  min-height: 200px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
}

.trait-side:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.external-traits {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.05) 0%,
    rgba(156, 39, 176, 0.05) 100%
  );
  border-left: 4px solid #2196f3;
}

.external-traits::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196f3, #3f51b5);
  border-radius: 16px 16px 0 0;
}

.internal-traits {
  background: linear-gradient(
    135deg,
    rgba(156, 39, 176, 0.05) 0%,
    rgba(76, 175, 80, 0.05) 100%
  );
  border-left: 4px solid #9c27b0;
}

.internal-traits::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #9c27b0, #673ab7);
  border-radius: 16px 16px 0 0;
}

.trait-header {
  margin-bottom: 16px;
  text-align: center;
}

.trait-header h5 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.trait-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.trait-source {
  color: #6c757d;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 12px;
  font-style: italic;
}

.trait-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trait-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  line-height: 1.5;
}

.trait-list li:last-child {
  border-bottom: none;
}

.trait-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.divider-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 1px;
}

.divider-icon {
  font-size: 1.5rem;
  margin: 8px 0;
  background: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.synthesis-explanation {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding: 20px 24px 0;
  background: linear-gradient(135deg, #fff9c4 0%, #f0f8ff 100%);
  border-radius: 12px;
  margin-left: 24px;
  margin-right: 24px;
}

.synthesis-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.synthesis-text h6 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.synthesis-text p {
  margin: 0;
  line-height: 1.6;
  color: #495057;
  font-size: 0.95rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .overview-container {
    padding: 16px;
  }

  .overview-title {
    font-size: 1.3rem;
    margin-bottom: 24px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .insight-card {
    padding: 16px;
  }

  .energy-bar-item {
    grid-template-columns: 80px 1fr 50px;
    gap: 8px;
  }

  .advice-item {
    padding: 16px;
    gap: 12px;
  }

  .focus-content {
    padding: 16px;
  }

  .abilities-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .traits-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .trait-divider {
    flex-direction: row;
    padding: 16px 0;
  }

  .divider-line {
    width: 60px;
    height: 2px;
  }

  .synthesis-explanation {
    margin-left: 16px;
    margin-right: 16px;
    padding: 16px;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .overview-title {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .energy-bar-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .palace-label,
  .energy-value {
    text-align: left;
  }
}

/* 五行結構分析樣式 */
.five-elements-section {
  margin-bottom: 32px;
}

.elements-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
  padding: 0 24px;
}

.elements-chart {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 254, 0.9) 100%
  );
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.elements-chart:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.element-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.element-bar {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 12px;
}

.element-label {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.element-progress {
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.element-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s ease-out;
  position: relative;
}

.element-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

.element-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.elements-analysis {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 254, 0.9) 100%
  );
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.elements-analysis:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.elements-summary {
  margin-bottom: 20px;
}

.elements-summary h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dominant-element,
.element-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dominant-element:last-child,
.element-balance:last-child {
  border-bottom: none;
}

.label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.elements-interpretation {
  margin-top: 20px;
}

.elements-interpretation h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.interpretation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interpretation-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
  line-height: 1.6;
  color: #495057;
  position: relative;
  padding-left: 16px;
}

.interpretation-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.interpretation-list li:last-child {
  border-bottom: none;
}

/* 關鍵格局分析樣式 */
.key-patterns-section {
  margin-bottom: 32px;
}

.patterns-container {
  padding: 0 24px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.pattern-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 254, 0.95) 100%
  );
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.pattern-auspicious {
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.05) 0%,
    rgba(139, 195, 74, 0.05) 100%
  );
  border-left: 4px solid #4caf50;
}

.pattern-auspicious::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
}

.pattern-auspicious:hover {
  border-color: #4caf50;
  box-shadow: 0 12px 32px rgba(76, 175, 80, 0.2);
}

.pattern-inauspicious {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.05) 0%,
    rgba(255, 193, 7, 0.05) 100%
  );
  border-left: 4px solid #ff9800;
}

.pattern-inauspicious::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff9800, #ffc107);
}

.pattern-inauspicious:hover {
  border-color: #ff9800;
  box-shadow: 0 12px 32px rgba(255, 152, 0, 0.2);
}

.pattern-special {
  background: linear-gradient(
    135deg,
    rgba(156, 39, 176, 0.05) 0%,
    rgba(103, 58, 183, 0.05) 100%
  );
  border-left: 4px solid #9c27b0;
}

.pattern-special::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #9c27b0, #673ab7);
}

.pattern-special:hover {
  border-color: #9c27b0;
  box-shadow: 0 12px 32px rgba(156, 39, 176, 0.2);
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.pattern-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.pattern-name {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.pattern-type {
  font-size: 0.85rem;
  color: #6c757d;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.pattern-content {
  margin-bottom: 16px;
}

.pattern-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 16px;
}

.pattern-effects h6 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.pattern-effects ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pattern-effects li {
  padding: 4px 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #495057;
  position: relative;
  padding-left: 16px;
}

.pattern-effects li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.pattern-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.strength-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bar {
  width: 16px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.strength-bar.active {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 響應式設計 - 五行和格局 */
@media (max-width: 1024px) {
  .elements-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .patterns-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .elements-container,
  .patterns-container {
    padding: 0 16px;
  }

  .elements-chart,
  .elements-analysis,
  .pattern-card {
    padding: 16px;
  }

  .element-bar {
    grid-template-columns: 50px 1fr 30px;
    gap: 8px;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pattern-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .element-bar {
    grid-template-columns: 1fr;
    gap: 4px;
    text-align: center;
  }

  .element-label,
  .element-value {
    text-align: center;
  }

  .pattern-effects li {
    padding-left: 12px;
    font-size: 0.8rem;
  }
}
</style>
