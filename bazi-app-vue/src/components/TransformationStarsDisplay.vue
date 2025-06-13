<template>
  <div class="transformation-stars-display" :class="{ 'animation-active': isAnimationActive }">
    <div class="display-header">
      <h3>四化飛星</h3>
      
      <!-- 同步狀態顯示 -->
      <div class="sync-status" v-if="enableSharedReading">
        <el-tag 
          type="success" 
          size="small"
          effect="plain"
        >
          <el-icon><Connection /></el-icon>
          同步中
        </el-tag>
        <span class="sync-description">
          跟隨紫微斗數層級: {{ currentSyncLevel }}
        </span>
      </div>
      
      <!-- 四化飛星分層控制器（如果未啟用同步） -->
      <UnifiedLayeredController
        v-if="!enableSharedReading"
        :module-type="'transformationStars'"
        :layered-data="layeredData"
        :data-completeness="dataCompleteness"
        :enable-sync="false"
        :is-mobile="isMobile"
        :is-compact="true"
        :show-toolbar="false"
        v-model="displayMode"
        @level-changed="handleLevelChanged"
        @toggle-animation="toggleAnimation"
        class="transformation-controller"
      />
    </div>

    <div class="explanation-panel" v-if="isDetailView">
      <div class="explanation-header">
        <span class="info-icon">ℹ️</span>
        <h4>四化飛星解釋</h4>
      </div>
      <div class="explanation-content">
        <p>四化飛星是紫微斗數中重要的變化星曜，包括<span class="t-lu">化祿</span>、<span class="t-quan">化權</span>、<span class="t-ke">化科</span>和<span class="t-ji">化忌</span>，每顆主星會依照命宮天干而有不同的四化狀態。四化飛星對命盤產生的影響如下：</p>
        <ul>
          <li><span class="t-lu">化祿</span>：代表財帛、福分、名利、物質收穫，對宮位增添吉相</li>
          <li><span class="t-quan">化權</span>：代表權力、地位、決策能力，增強宮位力量感</li>
          <li><span class="t-ke">化科</span>：代表學業、文憑、榮譽、才華，添加智慧和貴人相助</li>
          <li><span class="t-ji">化忌</span>：代表阻礙、病痛、衝突、災厄，使宮位能量受損</li>
        </ul>
      </div>
    </div>

    <!-- 四化飛星圖表 -->
    <div class="transformation-chart">
      <div class="chart-header">
        <span>基於命宮天干「{{ mingGan }}」的四化飛星</span>
      </div>
      <div class="stars-table">
        <div class="table-header">
          <div class="cell">星曜</div>
          <div class="cell">四化</div>
          <div class="cell">所在宮位</div>
          <div class="cell">影響</div>
        </div>
        <div v-for="star in transformedStars" :key="star.name" class="table-row">
          <div class="cell star-name">{{ star.name }}</div>
          <div class="cell transformations">
            <span 
              v-for="trans in star.transformations" 
              :key="trans" 
              :class="`transformation transformation-${trans}`"
            >{{ trans }}</span>
          </div>
          <div class="cell palace-name">{{ getPalaceNameByIndex(star.palaceIndex) }}</div>
          <div class="cell effect">{{ getTransformationEffect(star) }}</div>
        </div>
      </div>
    </div>

    <!-- 四化流轉動態圖 -->
    <div class="transformation-flows" v-if="isDetailView">
      <h4>四化能量流動</h4>
      <div class="flows-container">
        <div 
          v-for="(palace, index) in chartData.palaces" 
          :key="`flow-${index}`"
          class="flow-item"
          :class="getEnergyClass(palace.index)"
        >
          <div class="flow-palace">
            <span class="palace-name">{{ palace.name }}</span>
            <span class="palace-zhi">({{ palace.zhi }})</span>
          </div>
          <div class="flow-energy">
            <div class="energy-bar" :style="getEnergyBarStyle(palace.index)"></div>
            <span class="energy-value">{{ getEnergyValue(palace.index) }}</span>
          </div>
          <div class="flow-stars">
            <div 
              v-for="star in getTransformedStarsInPalace(palace)" 
              :key="`flow-star-${star.name}`"
              class="flow-star"
            >
              <span class="star-name">{{ star.name }}</span>
              <span 
                v-for="trans in star.transformations" 
                :key="`flow-trans-${trans}`" 
                :class="`trans-indicator trans-${trans}`"
              >{{ trans }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 四化特殊組合 -->
    <div class="transformation-combinations">
      <h4>四化特殊組合</h4>
      <div class="combinations-list" v-if="combinations.length > 0">
        <div 
          v-for="(combo, index) in combinations" 
          :key="`combo-${index}`"
          class="combination-item"
          :class="`significance-${combo.significance}`"
        >
          <div class="combo-header">
            <span class="combo-name">{{ combo.combination }}</span>
            <span class="combo-location">{{ combo.palaceName }}</span>
          </div>
          <div class="combo-effect">{{ combo.effect }}</div>
        </div>
      </div>
      <div class="no-combinations-message" v-else>
        <div class="message-container">
          <i class="info-icon">ℹ️</i>
          <div class="message-content">
            <p>未發現四化組合</p>
            <p class="message-detail">當前命盤中的四化飛星分布較為分散，未形成特殊組合。這意味著各宮位的能量可能更均衡，不會因特定組合而產生極端吉凶。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 多層次疊加 (僅在詳細視圖中顯示) -->
    <div class="layered-effects" v-if="isDetailView && hasMultiLayerData">
      <h4>大限與流年疊加 <span class="energy-tooltip">
        <i class="info-tooltip">ℹ️</i>
        <span class="tooltip-content">多層次能量疊加分析結合原命盤、大限與流年的四化能量，呈現宮位能量在不同時間維度的變化。</span>
      </span></h4>
      <div class="energy-summary" v-if="selectedLayer === 'total'">
        <div class="energy-highlight">
          <div class="highlight-title">當前最強能量宮位</div>
          <div class="highlight-value">{{ getMaxEnergyPalace() }}</div>
        </div>
        <div class="energy-description">
          <p>{{ getEnergySummary() }}</p>
        </div>
      </div>
      <div class="layer-selector">
        <button 
          @click="selectedLayer = 'base'"
          :class="{ active: selectedLayer === 'base' }"
        >本命</button>
        <button 
          @click="selectedLayer = 'daXian'"
          :class="{ active: selectedLayer === 'daXian' }"
        >大限</button>
        <button 
          @click="selectedLayer = 'liuNian'"
          :class="{ active: selectedLayer === 'liuNian' }"
        >流年</button>
        <button 
          @click="selectedLayer = 'total'"
          :class="{ active: selectedLayer === 'total' }"
        >綜合</button>
      </div>
      <div class="layer-content">
        <div v-if="selectedLayer === 'base'" class="layer-palaces">
          <div 
            v-for="(palace, index) in chartData.palaces" 
            :key="`base-${index}`"
            class="layer-palace"
            :class="getEnergyClass(palace.index, 'base')"
          >
            <div class="palace-header">{{ palace.name }}</div>
            <div class="palace-energy">{{ getLayerEnergy(palace.index, 'baseEnergy') }}</div>
          </div>
        </div>
        
        <div v-else-if="selectedLayer === 'daXian'" class="layer-palaces">
          <div 
            v-for="(palace, index) in chartData.palaces" 
            :key="`daxian-${index}`"
            class="layer-palace"
            :class="getEnergyClass(palace.index, 'daXian')"
          >
            <div class="palace-header">{{ palace.name }}</div>
            <div class="palace-energy">{{ getLayerEnergy(palace.index, 'daXianEnergy') }}</div>
          </div>
        </div>
        
        <div v-else-if="selectedLayer === 'liuNian'" class="layer-palaces">
          <div 
            v-for="(palace, index) in chartData.palaces" 
            :key="`liunian-${index}`"
            class="layer-palace"
            :class="getEnergyClass(palace.index, 'liuNian')"
          >
            <div class="palace-header">{{ palace.name }}</div>
            <div class="palace-energy">{{ getLayerEnergy(palace.index, 'liuNianEnergy') }}</div>
          </div>
        </div>
        
        <div v-else-if="selectedLayer === 'total'" class="layer-palaces">
          <div 
            v-for="(palace, index) in chartData.palaces" 
            :key="`total-${index}`"
            class="layer-palace"
            :class="getEnergyClass(palace.index, 'total')"
          >
            <div class="palace-header">{{ palace.name }}</div>
            <div class="palace-energy">{{ getLayerEnergy(palace.index, 'totalEnergy') }}</div>
            <div class="palace-interp">{{ getLayerInterpretation(palace.index) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Connection } from '@element-plus/icons-vue';
import type { PurpleStarChart, Palace, Star } from '@/types/astrologyTypes';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { useSharedLayeredReading } from '@/composables/useSharedLayeredReading';
import type { DisplayMode, DisplayModeProps, DisplayModeEmits } from '@/types/displayModes';
import type { ReadingLevel } from '@/types/layeredReading';
import UnifiedLayeredController from '@/components/UnifiedLayeredController.vue';

// 是否啟用共享分層閱讀
const enableSharedReading = ref(true);

// 使用共享分層閱讀系統（如果啟用）
const sharedLayeredReading = enableSharedReading.value 
  ? useSharedLayeredReading('transformationStars')
  : null;

// 使用傳統顯示模式 composable（作為後備）
const { displayMode: localDisplayMode, mapDepthToMode } = useDisplayMode('transformationStars');

// Vue 3 宏不需要顯式導入，但在這裡需要定義
const emit = defineEmits<DisplayModeEmits>();

// Props
interface Props extends DisplayModeProps {
  chartData: PurpleStarChart;
  mingGan?: string;
  transformationFlows?: Record<number, {
    palaceIndex: number;
    palaceName: string;
    energyScore: number;
    majorInfluences: string[];
  }>;
  transformationCombinations?: Array<{
    palaceIndex: number;
    palaceName: string;
    combination: string;
    effect: string;
    significance: 'high' | 'medium' | 'low';
  }>;
  multiLayerEnergies?: Record<number, {
    palaceIndex: number;
    palaceName: string;
    baseEnergy: number;
    daXianEnergy: number;
    liuNianEnergy: number;
    liuYueEnergy: number;
    totalEnergy: number;
    interpretation: string;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  mingGan: '',
  displayMode: 'standard',
  transformationFlows: () => ({}),
  transformationCombinations: () => [],
  multiLayerEnergies: () => ({})
});

// 響應式狀態
const isAnimationActive = ref(false);
const isDetailView = ref(true);
const selectedLayer = ref<'base' | 'daXian' | 'liuNian' | 'total'>('total');
const animationInterval = ref<number | null>(null);

// 新增移動端檢測和數據相關屬性
const isMobile = ref(window.innerWidth <= 768);
const layeredData = computed(() => null); // 待實現分層數據
const dataCompleteness = computed(() => {
  let score = 0;
  if (!props.chartData) return 0;

  // 核心數據：命宮天干是計算四化的基礎
  if (props.mingGan && props.mingGan.length > 0) {
    score += 40;
  }

  // 核心數據：命盤宮位和星曜資訊
  const hasTransformedStars = props.chartData.palaces?.some(p => p.stars.some(s => s.transformations && s.transformations.length > 0));
  if (hasTransformedStars) {
    score += 30;
  }

  // 輔助數據：特殊組合，用於深度分析
  if (props.transformationCombinations && props.transformationCombinations.length > 0) {
    score += 15;
  }

  // 輔助數據：多層次能量，用於深度分析
  if (props.multiLayerEnergies && Object.keys(props.multiLayerEnergies).length > 0) {
    score += 15;
  }
  
  return Math.min(score, 100); // 確保最高為 100
}); // 四化飛星數據完整度

// 處理層級變化
const handleLevelChanged = (level: any) => {
  console.log('四化飛星層級變化:', level);
  // TODO: 實現層級變化邏輯
};

// 計算當前層級標籤
const currentSyncLevel = computed(() => {
  if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
    const levelLabels: Record<ReadingLevel, string> = {
      'summary': '簡要',
      'compact': '精簡',
      'standard': '標準',
      'deep': '深度'
    };
    return levelLabels[sharedLayeredReading.effectiveReadingLevel.value] || '標準';
  }
  return '標準';
});

// 映射表定義（在外部定義以供重複使用）
const levelToModeMap: Record<ReadingLevel, DisplayMode> = {
  'summary': 'minimal',
  'compact': 'compact', 
  'standard': 'standard',
  'deep': 'comprehensive'
};

// 計算顯示模式
const displayMode = computed({
  get: () => {
    if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
      // 將 ReadingLevel 映射到 DisplayMode
      return levelToModeMap[sharedLayeredReading.effectiveReadingLevel.value] || 'standard';
    }
    
    // 後備方案：使用 props 或本地狀態
    return props.displayMode || localDisplayMode.value;
  },
  set: (newMode: DisplayMode) => {
    if (!enableSharedReading.value) {
      localDisplayMode.value = newMode;
      emit('update:displayMode', newMode);
    }
    // 如果啟用同步，則忽略設置（由紫微斗數控制）
  }
});

// 監聽紫微斗數層級變化（如果啟用同步）
if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
  watch(sharedLayeredReading.effectiveReadingLevel, (newLevel) => {
    if (newLevel) {
      console.log(`四化飛星同步新層級: ${newLevel}`);
      // 強制更新詳細視圖狀態
      const newMode = levelToModeMap[newLevel] || 'standard';
      isDetailView.value = newMode === 'standard' || newMode === 'comprehensive';
    }
  }, { immediate: true });
}

// 傳統同步方式（為了向下相容）
watch(() => props.displayMode, (newMode) => {
  if (newMode && !enableSharedReading.value) {
    localDisplayMode.value = newMode;
    console.log('TransformationStarsDisplay: props displayMode 已同步', newMode);
  }
}, { immediate: true });

// 根據顯示模式設置詳細程度
watch(displayMode, (newMode) => {
  if (newMode === 'minimal' || newMode === 'compact') {
    isDetailView.value = false;
  } else if (newMode === 'standard' || newMode === 'comprehensive') {
    isDetailView.value = true;
  }
  
  // 將顯示模式變更記錄到控制台並向上傳遞更新
  console.log('四化飛星顯示模式已更新:', newMode, '詳細視圖:', isDetailView.value);
  
  // 只有在未啟用共享分層時才發送更新事件
  if (!enableSharedReading.value) {
    emit('update:displayMode', newMode);
  }
}, { immediate: true });

// 處理事件監聽
// 移除重複的事件處理，useDisplayMode 已經處理了這些邏輯

// 計算屬性
const transformedStars = computed(() => {
  const result: Star[] = [];
  
  // 遍歷所有宮位尋找帶有四化的星曜
  if (props.chartData && props.chartData.palaces) {
    for (const palace of props.chartData.palaces) {
      for (const star of palace.stars) {
        if (star.transformations && star.transformations.length > 0) {
          result.push(star);
        }
      }
    }
  }
  
  return result;
});

const combinations = computed(() => {
  return props.transformationCombinations || [];
});

const hasMultiLayerData = computed(() => {
  return Object.keys(props.multiLayerEnergies || {}).length > 0;
});

// 顯示深度相關方法（保留供將來使用）
// const setDisplayDepth = (depth: string) => {
//   const newMode = mapDepthToMode(depth);
//   displayMode.value = newMode;
//   console.log('四化飛星設置顯示深度:', newMode);
// };

// 動畫控制方法
const toggleAnimation = () => {
  isAnimationActive.value = !isAnimationActive.value;
  
  // 如果開啟動畫，設置定時器
  if (isAnimationActive.value) {
    if (animationInterval.value) {
      clearInterval(animationInterval.value);
    }
    
    // 每5秒切換顯示層次
    animationInterval.value = window.setInterval(() => {
      const layers: ('base' | 'daXian' | 'liuNian' | 'total')[] = ['base', 'daXian', 'liuNian', 'total'];
      const currentIndex = layers.indexOf(selectedLayer.value);
      const nextIndex = (currentIndex + 1) % layers.length;
      selectedLayer.value = layers[nextIndex];
    }, 5000);
  } else {
    // 停止動畫
    if (animationInterval.value) {
      clearInterval(animationInterval.value);
      animationInterval.value = null;
    }
  }
};

// const toggleView = () => {
//   isDetailView.value = !isDetailView.value;
// };

const getPalaceNameByIndex = (index: number): string => {
  const palace = props.chartData.palaces.find(p => p.index === index);
  return palace ? `${palace.name}(${palace.zhi})` : '未知宮位';
};

const getTransformationEffect = (star: Star): string => {
  if (!star.transformations || star.transformations.length === 0) {
    return '';
  }
  
  // 四化效應說明
  const effects: Record<string, string> = {
    '祿': '增加財帛和福分',
    '權': '增加權威和地位',
    '科': '增加學業和榮譽',
    '忌': '帶來阻礙和衝突'
  };
  
  return star.transformations.map(t => effects[t] || t).join('，');
};

const getEnergyValue = (palaceIndex: number): string => {
  const flow = props.transformationFlows[palaceIndex];
  if (!flow) return '0';
  return flow.energyScore.toString();
};

const getEnergyBarStyle = (palaceIndex: number): { width: string, backgroundColor: string } => {
  const flow = props.transformationFlows[palaceIndex];
  if (!flow) return { width: '0%', backgroundColor: '#e9ecef' };
  
  // 能量分數範圍通常是 -10 到 +10
  const baseWidth = 50; // 基礎寬度為50%
  const score = flow.energyScore;
  const width = baseWidth + score * 5; // 每點能量增加或減少5%寬度
  
  // 確保寬度在合理範圍內
  const clampedWidth = Math.max(5, Math.min(100, width));
  
  // 根據能量值設置顏色
  let color = '#e9ecef'; // 默認灰色
  if (score > 0) {
    color = score >= 5 ? '#28a745' : '#5cb85c'; // 強正面為深綠，輕正面為淺綠
  } else if (score < 0) {
    color = score <= -5 ? '#dc3545' : '#f5c6cb'; // 強負面為紅色，輕負面為粉紅
  }
  
  return {
    width: `${clampedWidth}%`,
    backgroundColor: color
  };
};

const getEnergyClass = (palaceIndex: number, layer: string = ''): string => {
  if (layer) {
    let energy = 0;
    
    switch (layer) {
      case 'base':
        energy = getLayerEnergy(palaceIndex, 'baseEnergy');
        break;
      case 'daXian':
        energy = getLayerEnergy(palaceIndex, 'daXianEnergy');
        break;
      case 'liuNian':
        energy = getLayerEnergy(palaceIndex, 'liuNianEnergy');
        break;
      case 'total':
        energy = getLayerEnergy(palaceIndex, 'totalEnergy');
        break;
      default:
        energy = 0;
    }
    
    if (energy > 0) return 'positive-energy';
    if (energy < 0) return 'negative-energy';
    return 'neutral-energy';
  } else {
    const flow = props.transformationFlows[palaceIndex];
    if (!flow) return 'neutral-energy';
    
    const score = flow.energyScore;
    if (score > 0) return 'positive-energy';
    if (score < 0) return 'negative-energy';
    return 'neutral-energy';
  }
};

const getTransformedStarsInPalace = (palace: Palace): Star[] => {
  return palace.stars.filter(star => star.transformations && star.transformations.length > 0);
};

const getLayerEnergy = (palaceIndex: number, energyType: string): number => {
  const energy = props.multiLayerEnergies[palaceIndex];
  if (!energy) return 0;
  
  return energy[energyType as keyof typeof energy] as number || 0;
};

const getLayerInterpretation = (palaceIndex: number): string => {
  const energy = props.multiLayerEnergies[palaceIndex];
  if (!energy) return '';
  
  return energy.interpretation || '';
};

// 獲取能量最大的宮位
const getMaxEnergyPalace = (): string => {
  let maxEnergy = -Infinity;
  let maxEnergyPalace = '';
  
  // 遍歷所有宮位，找出能量最大的
  for (const palaceIndex in props.multiLayerEnergies) {
    const energy = props.multiLayerEnergies[palaceIndex];
    if (energy && typeof energy.totalEnergy === 'number' && energy.totalEnergy > maxEnergy) {
      maxEnergy = energy.totalEnergy;
      maxEnergyPalace = `${energy.palaceName} (${maxEnergy > 0 ? '+' : ''}${maxEnergy})`;
    }
  }
  
  return maxEnergyPalace || '無顯著能量宮位';
};

// 獲取能量綜合摘要
const getEnergySummary = (): string => {
  let positiveCount = 0;
  let negativeCount = 0;
  let totalCount = 0;
  let totalEnergy = 0;
  
  // 計算各類能量宮位數量
  for (const palaceIndex in props.multiLayerEnergies) {
    const energy = props.multiLayerEnergies[palaceIndex];
    if (energy && typeof energy.totalEnergy === 'number') {
      totalCount++;
      totalEnergy += energy.totalEnergy;
      
      if (energy.totalEnergy > 0) {
        positiveCount++;
      } else if (energy.totalEnergy < 0) {
        negativeCount++;
      }
    }
  }
  
  // 根據能量分佈生成摘要
  if (totalCount === 0) {
    return '無法分析能量分佈';
  }
  
  const energyBalance = positiveCount > negativeCount 
    ? '整體能量偏正向，有利於發展'
    : (positiveCount < negativeCount 
      ? '整體能量偏負向，需注意化解阻礙' 
      : '正負能量平衡');
  
  const averageEnergy = totalCount > 0 ? (totalEnergy / totalCount).toFixed(1) : '0';
  const averageEnergyNumber = parseFloat(averageEnergy);
  
  return `命盤中有 ${positiveCount} 個正向能量宮位，${negativeCount} 個負向能量宮位。${energyBalance}。平均能量值: ${averageEnergyNumber > 0 ? '+' : ''}${averageEnergy}。`;
};

// 生命週期鉤子
onMounted(() => {
  console.log('TransformationStarsDisplay: 組件已掛載');
  console.log('TransformationStarsDisplay: Props數據檢查', {
    chartData: !!props.chartData,
    mingGan: props.mingGan,
    transformationFlows: Object.keys(props.transformationFlows || {}).length,
    transformationCombinations: (props.transformationCombinations || []).length,
    multiLayerEnergies: Object.keys(props.multiLayerEnergies || {}).length,
    displayMode: displayMode.value,
    enableSharedReading: enableSharedReading.value
  });
  
  // 檢查分層系統狀態
  if (enableSharedReading.value && sharedLayeredReading) {
    console.log('TransformationStarsDisplay: 共享分層閱讀狀態', {
      effectiveReadingLevel: sharedLayeredReading.effectiveReadingLevel?.value,
      isPrimaryModule: sharedLayeredReading.isPrimaryModule?.value,
      syncStatusDescription: sharedLayeredReading.syncStatusDescription?.value
    });
  }
});

// 組件卸載時清理
onUnmounted(() => {
  // 確保清除定時器
  if (animationInterval.value) {
    clearInterval(animationInterval.value);
    animationInterval.value = null;
  }
});
</script>

<style scoped>
.transformation-stars-display {
  width: 100%;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 20px;
}

.display-header h3 {
  margin: 0;
  color: #333;
  flex: 1;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.toggle-button, .view-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-button:hover, .view-button:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.explanation-panel {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  /* 確保在 el-card__body 內部 */
  margin-left: 0;
  margin-right: 0;
  /* 防止溢出父容器 */
  box-sizing: border-box;
  /* 確保沒有絕對定位溢出 */
  inset: auto;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.info-icon {
  font-size: 1.2rem;
}

.explanation-header h4 {
  margin: 0;
  color: #333;
}

.explanation-content p {
  margin-top: 0;
  line-height: 1.5;
}

.explanation-content ul {
  padding-left: 20px;
}

.explanation-content li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.transformation-chart {
  margin-bottom: 20px;
}

.chart-header {
  text-align: center;
  margin-bottom: 15px;
  font-weight: 500;
  color: #495057;
}

.stars-table {
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  background-color: #f8f9fa;
  font-weight: bold;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  border-top: 1px solid #dee2e6;
}

.cell {
  padding: 10px;
  display: flex;
  align-items: center;
  border-right: 1px solid #dee2e6;
}

.cell:last-child {
  border-right: none;
}

.star-name {
  font-weight: 500;
}

.transformations {
  display: flex;
  gap: 5px;
}

.transformation {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: bold;
}

.transformation-祿 {
  background-color: #ffc107;
  color: #212529;
}

.transformation-權 {
  background-color: #17a2b8;
  color: white;
}

.transformation-科 {
  background-color: #28a745;
  color: white;
}

.transformation-忌 {
  background-color: #dc3545;
  color: white;
}

.transformation-flows {
  margin-bottom: 20px;
}

.transformation-flows h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.flows-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.flow-item {
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.flow-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.positive-energy {
  background-color: rgba(40, 167, 69, 0.1);
  border-left: 3px solid #28a745;
}

.negative-energy {
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid #dc3545;
}

.neutral-energy {
  background-color: #f8f9fa;
  border-left: 3px solid #6c757d;
}

.flow-palace {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
}

.palace-name {
  color: #212529;
}

.palace-zhi {
  color: #6c757d;
  font-size: 0.9rem;
}

.flow-energy {
  margin-bottom: 10px;
}

.energy-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin-bottom: 5px;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.energy-value {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.flow-stars {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.flow-star {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.85rem;
  padding: 3px 6px;
  background-color: #f8f9fa;
  border-radius: 3px;
}

.trans-indicator {
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 0.75rem;
}

.trans-祿 {
  background-color: #ffc107;
  color: #212529;
}

.trans-權 {
  background-color: #17a2b8;
  color: white;
}

.trans-科 {
  background-color: #28a745;
  color: white;
}

.trans-忌 {
  background-color: #dc3545;
  color: white;
}

.transformation-combinations {
  margin-bottom: 20px;
}

.transformation-combinations h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.combinations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.combination-item {
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.significance-high {
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid #dc3545;
}

.significance-medium {
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
}

.significance-low {
  background-color: rgba(23, 162, 184, 0.1);
  border-left: 3px solid #17a2b8;
}

.combo-header {
  display: flex;
}

.combo-name {
  font-weight: bold;
  color: #212529;
}

.combo-location {
  color: #6c757d;
  font-size: 0.9rem;
}

.combo-effect {
  line-height: 1.5;
  color: #495057;
}

/* 無四化組合提示樣式 */
.no-combinations-message {
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  padding: 15px;
  border-left: 3px solid #007bff;
}

.message-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message-content p {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: #333;
}

.message-content .message-detail {
  margin: 0;
  font-weight: normal;
  color: #555;
  line-height: 1.5;
  font-size: 0.95rem;
}

.layered-effects {
  margin-top: 30px;
}

.layered-effects h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.layer-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.layer-selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.layer-selector button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.layer-selector button:hover:not(.active) {
  background-color: #e9ecef;
  border-color: #ccc;
}

.layer-content {
  margin-top: 15px;
}

.layer-palaces {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.layer-palace {
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.layer-palace:hover {
  transform: translateY(-2px);
}

.palace-header {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #dee2e6;
}

.palace-energy {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #495057;
}

.palace-interp {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
}

/* 能量摘要樣式 */
.energy-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.energy-highlight {
  flex: 0 0 200px;
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.highlight-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 10px;
}

.highlight-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #212529;
}

.energy-description {
  flex: 1;
  min-width: 200px;
}

.energy-description p {
  margin: 0;
  line-height: 1.6;
  color: #495057;
}

.energy-tooltip {
  position: relative;
  display: inline-block;
  margin-left: 5px;
}

.info-tooltip {
  font-size: 0.9rem;
  color: #6c757d;
  cursor: help;
}

.tooltip-content {
  visibility: hidden;
  width: 250px;
  background-color: #343a40;
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -125px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.85rem;
  line-height: 1.5;
  font-weight: normal;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #343a40 transparent transparent transparent;
}

.energy-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}

/* 動畫控制樣式 */
.animation-control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 顯示深度容器樣式 
.display-depth-container {
  background: #f0f8ff;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
}
*/
/* 顯示選項區域 */
.display-options-section {
  margin-bottom: 12px;
}

.display-mode-selector {
  margin-top: 8px;
}

.mode-toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.depth-tab-button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.depth-tab-button:hover {
  background-color: #e9ecef;
}

.depth-tab-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.mode-help-text {
  font-weight: 500;
  color: #495057;
  margin-bottom: 5px;
}


/* 文字樣式 */
.t-lu {
  color: #ffc107;
  font-weight: bold;
}

.t-quan {
  color: #17a2b8;
  font-weight: bold;
}

.t-ke {
  color: #28a745;
  font-weight: bold;
}

.t-ji {
  color: #dc3545;
  font-weight: bold;
}

/* 動畫效果 */
.animation-active .energy-bar {
  animation: pulse 2s infinite, flowAnimation 3s ease-in-out infinite;
  background-image: linear-gradient(
    90deg, 
    rgba(40, 167, 69, 0.7) 0%, 
    rgba(23, 162, 184, 0.8) 50%, 
    rgba(40, 167, 69, 0.7) 100%
  );
  background-size: 200% 100%;
}

.animation-active .negative-energy .energy-bar {
  animation: pulse 2s infinite, flowAnimation 3s ease-in-out infinite;
  background-image: linear-gradient(
    90deg, 
    rgba(220, 53, 69, 0.7) 0%, 
    rgba(255, 128, 128, 0.8) 50%, 
    rgba(220, 53, 69, 0.7) 100%
  );
  background-size: 200% 100%;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

@keyframes flowAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animation-active .layer-palace {
  animation: elevate 3s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@keyframes elevate {
  0% {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}

.animation-active .flow-item {
  position: relative;
  overflow: hidden;
}

.animation-active .flow-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

  /* 響應式設計 */
@media (max-width: 768px) {
  .display-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 12px;
  }
  
  .display-header h3 {
    font-size: 1.2rem;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .table-header .cell:nth-child(3),
  .table-header .cell:nth-child(4),
  .table-row .cell:nth-child(3),
  .table-row .cell:nth-child(4) {
    display: none;
  }
  
  .flows-container, .combinations-list, .layer-palaces {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
  }
}

/* 同步狀態顯示 */
.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.sync-description {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .display-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sync-status {
    margin-left: 0;
    justify-content: center;
  }
}
</style>