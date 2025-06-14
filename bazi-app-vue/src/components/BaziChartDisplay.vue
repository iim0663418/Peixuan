<template>
  <div class="bazi-chart-display">
    <div v-if="isLoading" class="loading-state">
      <SkeletonLoader variant="chart" />
    </div>

    <div v-else-if="error" class="error-state">
      <h3>{{ $t('baziChart.loadError') }}</h3>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">
        {{ $t('baziChart.retry') }}
      </button>
    </div>

    <div v-else-if="baziResult" class="chart-content">
      <!-- 八字排盤顯示 -->
      <div class="chart-header">
        <h3>{{ $t('baziChart.title') }}</h3>
        
        <!-- 八字不使用分層顯示，保持固定模式 -->
        <div class="fixed-mode-indicator">
          <el-tag type="info" size="small" effect="plain">
            <el-icon><Lock /></el-icon>
            固定模式
          </el-tag>
          <span class="mode-description">八字命盤保持完整顯示</span>
        </div>
      </div>
      <div class="bazi-pillars">
        <!-- 桌面版網格布局 -->
        <div class="pillars-grid desktop-layout">
          <div 
            v-for="(pillar, index) in pillarsDisplay" 
            :key="pillar.name"
            class="pillar-column"
            @click="handlePillarClick(pillar.name)"
          >
            <div class="pillar-header">{{ pillar.name }}</div>
            <div class="pillar-stem">{{ pillar.stem }}</div>
            <div class="pillar-branch">{{ pillar.branch }}</div>
            <div v-if="tenGods" class="pillar-god">{{ getTenGod(index) }}</div>
            <div class="pillar-elements">
              <span class="stem-element" :class="`element-${getElementClass(pillar.stemElement)}`">
                {{ pillar.stemElement }}
              </span>
              <span class="branch-element" :class="`element-${getElementClass(pillar.branchElement)}`">
                {{ pillar.branchElement }}
              </span>
            </div>
          </div>
        </div>

        <!-- 手機版卡片布局 -->
        <div class="pillars-mobile mobile-layout">
          <div 
            v-for="(pillar, index) in pillarsDisplay" 
            :key="pillar.name"
            class="pillar-card"
            @click="handlePillarClick(pillar.name)"
          >
            <div class="pillar-card-header">
              <h4 class="pillar-name">{{ pillar.name }}</h4>
              <div class="pillar-main">
                <span class="pillar-stem">{{ pillar.stem }}</span>
                <span class="pillar-branch">{{ pillar.branch }}</span>
              </div>
            </div>
            <div class="pillar-card-content">
              <div v-if="tenGods" class="pillar-god-mobile">
                <span class="god-label">十神：</span>
                <span class="god-value">{{ getTenGod(index) }}</span>
              </div>
              <div class="pillar-elements-mobile">
                <div class="element-row">
                  <span class="element-label">天干五行：</span>
                  <span class="stem-element" :class="`element-${getElementClass(pillar.stemElement)}`">
                    {{ pillar.stemElement }}
                  </span>
                </div>
                <div class="element-row">
                  <span class="element-label">地支五行：</span>
                  <span class="branch-element" :class="`element-${getElementClass(pillar.branchElement)}`">
                    {{ pillar.branchElement }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 五行分布 -->
      <div v-if="elementsDistribution" class="elements-section">
        <h4>{{ $t('baziChart.elementsDistribution') }}</h4>
        <div class="elements-chart">
          <div 
            v-for="(count, element) in elementsDistribution" 
            :key="element"
            class="element-item"
          >
            <span class="element-name">{{ element }}</span>
            <div class="element-bar">
              <div 
                class="element-fill" 
                :style="{ width: `${getElementPercentage(count)}%` }"
                :class="`element-${getElementClass(element)}`"
              ></div>
              <span class="element-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 十神分析 -->
      <div v-if="tenGods" class="ten-gods-section">
        <h4>{{ $t('baziChart.tenGodsAnalysis') }}</h4>
        <div class="ten-gods-grid">
          <div 
            v-for="(god, pillar) in tenGods" 
            :key="pillar"
            class="ten-god-item"
          >
            <span class="pillar-name">{{ getPillarName(pillar) }}</span>
            <span class="god-name" :class="`god-${god}`">{{ god }}</span>
          </div>
        </div>
      </div>

      <!-- 起運資訊 -->
      <div v-if="startLuckInfo" class="luck-section">
        <h4>{{ $t('baziChart.luckInfo') }}</h4>
        <div class="luck-details">
          <div class="luck-item">
            <span class="luck-label">{{ $t('baziChart.startAge') }}</span>
            <span class="luck-value">{{ startLuckInfo.age }}{{ $t('baziChart.years') }}</span>
          </div>
          <div class="luck-item">
            <span class="luck-label">{{ $t('baziChart.startYear') }}</span>
            <span class="luck-value">{{ startLuckInfo.year }}{{ $t('baziChart.yearUnit') }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 
      <div class="chart-actions">
        <button @click="$emit('save-record')" class="action-button save-button">
          {{ $t('baziChart.saveRecord') }}
        </button>
        <button @click="exportChart" class="action-button export-button">
          {{ $t('baziChart.exportChart') }}
        </button>
      </div>
       -->
    </div>
   
    <div v-else class="empty-state">
      <p>{{ $t('baziChart.noData') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import SkeletonLoader from './SkeletonLoader.vue';
import { useI18n } from 'vue-i18n';
import { Lock } from '@element-plus/icons-vue';
import type { DisplayMode } from '@/types/displayModes';
import type {
  BaziResult,
  TenGodsPillars,
  ElementsDistribution,
  StartLuckInfo,
  Pillar
} from '../utils/baziCalc';

const { t } = useI18n();

// 確保所有響應式初始化在掛載前完成
onBeforeMount(() => {
  console.log('BaziChartDisplay component initializing');
});

// Props
interface Props {
  baziResult?: BaziResult | null;
  tenGods?: TenGodsPillars | null;
  elementsDistribution?: ElementsDistribution | null;
  startLuckInfo?: StartLuckInfo | null;
  isLoading?: boolean;
  error?: string | null;
  displayMode?: DisplayMode;
}

const props = withDefaults(defineProps<Props>(), {
  baziResult: null,
  tenGods: null,
  elementsDistribution: null,
  startLuckInfo: null,
  isLoading: false,
  error: null
});

// Emits
const emit = defineEmits<{
  retry: [];
  'pillar-click': [pillarName: string];
  'save-record': [];
  'update:displayMode': [mode: DisplayMode];
}>();

// 八字命盤固定使用 'standard' 模式，不提供分層控制
const displayMode = ref<DisplayMode>('standard');

console.log('八字命盤初始化：使用固定模式（standard）');

// 向上通知父組件當前使用固定模式
watch(displayMode, (newMode: DisplayMode) => {
  emit('update:displayMode', newMode);
}, { immediate: true });

// 計算屬性
const pillarsDisplay = computed(() => {
  // 完全沒有資料的情況
  if (!props.baziResult) return [];
  
  // 檢查是否有正確的資料結構
  const hasValidYearPillar = props.baziResult.yearPillar && props.baziResult.yearPillar.stem && props.baziResult.yearPillar.branch;
  const hasValidMonthPillar = props.baziResult.monthPillar && props.baziResult.monthPillar.stem && props.baziResult.monthPillar.branch;
  const hasValidDayPillar = props.baziResult.dayPillar && props.baziResult.dayPillar.stem && props.baziResult.dayPillar.branch;
  const hasValidHourPillar = props.baziResult.hourPillar && props.baziResult.hourPillar.stem && props.baziResult.hourPillar.branch;
  
  // 如果資料不完整，返回空數組
  if (!hasValidYearPillar || !hasValidMonthPillar || !hasValidDayPillar || !hasValidHourPillar) {
    console.warn('BaziChartDisplay: 不完整的命盤資料', props.baziResult);
    return [];
  }
  
  // 所有資料都存在，安全構建柱子顯示
  return [
    {
      name: t('baziChart.yearPillar'),
      stem: props.baziResult.yearPillar.stem,
      branch: props.baziResult.yearPillar.branch,
      stemElement: props.baziResult.yearPillar.stemElement || '',
      branchElement: props.baziResult.yearPillar.branchElement || ''
    },
    {
      name: t('baziChart.monthPillar'),
      stem: props.baziResult.monthPillar.stem,
      branch: props.baziResult.monthPillar.branch,
      stemElement: props.baziResult.monthPillar.stemElement || '',
      branchElement: props.baziResult.monthPillar.branchElement || ''
    },
    {
      name: t('baziChart.dayPillar'),
      stem: props.baziResult.dayPillar.stem,
      branch: props.baziResult.dayPillar.branch,
      stemElement: props.baziResult.dayPillar.stemElement || '',
      branchElement: props.baziResult.dayPillar.branchElement || ''
    },
    {
      name: t('baziChart.hourPillar'),
      stem: props.baziResult.hourPillar.stem,
      branch: props.baziResult.hourPillar.branch,
      stemElement: props.baziResult.hourPillar.stemElement || '',
      branchElement: props.baziResult.hourPillar.branchElement || ''
    }
  ];
});

const totalElements = computed(() => {
  if (!props.elementsDistribution) return 0;
  return Object.values(props.elementsDistribution).reduce((sum, count) => sum + count, 0);
});

// 方法
const getElementClass = (element: string): string => {
  const mapping: Record<string, string> = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };
  return mapping[element] || 'default';
};

const getElementPercentage = (count: number): number => {
  return totalElements.value > 0 ? (count / totalElements.value) * 100 : 0;
};

const getTenGod = (pillarIndex: number): string => {
  if (!props.tenGods) return '';
  
  const godKeys = ['yearStemGod', 'monthStemGod', 'dayStemGod', 'hourStemGod'];
  const key = godKeys[pillarIndex] as keyof TenGodsPillars;
  return props.tenGods[key] || '';
};

const getPillarName = (pillar: string): string => {
  const mapping: Record<string, string> = {
    'yearStemGod': t('baziChart.yearPillar'),
    'monthStemGod': t('baziChart.monthPillar'),
    'dayStemGod': t('baziChart.dayPillar'),
    'hourStemGod': t('baziChart.hourPillar')
  };
  return mapping[pillar] || pillar;
};

const handlePillarClick = (pillarName: string) => {
  emit('pillar-click', pillarName);
};

const exportChart = () => {
  // 實現導出功能
  console.log('Export chart functionality would be implemented here');
};
</script>

<style scoped>
.bazi-chart-display {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.loading-state, .error-state, .empty-state {
  padding: 60px 30px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  color: #dc3545;
}

.retry-button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-button:hover {
  background: #c82333;
}

.chart-content {
  padding: 30px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 20px;
  flex-wrap: wrap;
}

/* 固定模式指示器 */
.fixed-mode-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-description {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.chart-header h3 {
  margin: 0;
  color: #8b4513;
  font-size: 1.4rem;
  flex: 1;
}

/* 響應式布局控制 */
.desktop-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.mobile-layout {
  display: none;
}

.pillar-column {
  background: linear-gradient(135deg, #faf5f0 0%, #f0e68c 100%);
  border: 2px solid #d2691e;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.pillar-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(210, 105, 30, 0.2);
}

.pillar-header {
  font-weight: 600;
  color: #8b4513;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.pillar-stem, .pillar-branch {
  font-size: 2rem;
  font-weight: 700;
  color: #8b4513;
  margin: 5px 0;
}

.pillar-god {
  font-weight: 600;
  color: #d2691e;
  margin: 10px 0;
  font-size: 0.9rem;
}

.pillar-elements {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.stem-element, .branch-element {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
  color: white;
}

.element-wood { background: #228b22; }
.element-fire { background: #dc143c; }
.element-earth { background: #daa520; }
.element-metal { background: #c0c0c0; color: #333; }
.element-water { background: #4682b4; }

.elements-section, .ten-gods-section, .luck-section {
  margin: 30px 0;
  padding: 25px;
  background: #faf9f7;
  border-radius: 12px;
  border: 1px solid #e9dcc9;
}

.elements-section h4, .ten-gods-section h4, .luck-section h4 {
  margin: 0 0 20px 0;
  color: #8b4513;
  font-size: 1.2rem;
}

.elements-chart {
  display: grid;
  gap: 15px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.element-name {
  min-width: 60px;
  font-weight: 600;
  color: #8b4513;
}

.element-bar {
  flex: 1;
  height: 25px;
  background: #f0f0f0;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.element-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

.element-count {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: white;
  font-size: 0.8rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.ten-gods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.ten-god-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #d2691e;
}

.pillar-name {
  font-weight: 600;
  color: #8b4513;
}

.god-name {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e6f3ff;
  color: #2e8b57;
}

.luck-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.luck-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #d2691e;
}

.luck-label {
  font-weight: 600;
  color: #8b4513;
}

.luck-value {
  font-weight: 600;
  color: #d2691e;
  font-size: 1.1rem;
}

.chart-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e9dcc9;
}

.action-button {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid;
}

.save-button {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.save-button:hover {
  background: #218838;
  border-color: #218838;
}

.export-button {
  background: white;
  color: #6c757d;
  border-color: #6c757d;
}

.export-button:hover {
  background: #6c757d;
  color: white;
}

/* 手機版卡片樣式 */
.pillars-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: 40px;
}

.pillar-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  overflow: hidden;
}

.pillar-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.pillar-card-header {
  background: linear-gradient(135deg, var(--primary-lightest), var(--bazi-orange-lightest));
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.pillar-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-color);
  margin: 0 0 var(--space-md) 0;
}

.pillar-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
}

.pillar-card .pillar-stem,
.pillar-card .pillar-branch {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-sm);
  min-width: 60px;
  text-align: center;
}

.pillar-card .pillar-stem {
  background: var(--primary-color);
  color: var(--text-inverse);
}

.pillar-card .pillar-branch {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--primary-color);
}

.pillar-card-content {
  padding: var(--space-lg);
}

.pillar-god-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.god-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.god-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.pillar-elements-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.element-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.element-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.pillar-elements-mobile .stem-element,
.pillar-elements-mobile .branch-element {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-xs);
  min-width: 40px;
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  /* 隱藏桌面布局，顯示手機布局 */
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: flex;
  }
  
  .chart-content {
    padding: var(--space-lg);
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .fixed-mode-indicator {
    justify-content: center;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 12px;
  }
  
  .chart-header h3 {
    font-size: 1.2rem;
  }
  
  .elements-section, .ten-gods-section, .luck-section {
    padding: var(--space-lg);
  }
  
  .ten-gods-grid, .luck-details {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .chart-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .export-button,
  .chart-actions button {
    min-height: 48px;
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .chart-content {
    padding: var(--space-md);
  }
  
  .pillar-card-header {
    padding: var(--space-md);
  }
  
  .pillar-card-content {
    padding: var(--space-md);
  }
  
  .pillar-main {
    gap: var(--space-md);
  }
  
  .pillar-card .pillar-stem,
  .pillar-card .pillar-branch {
    font-size: 1.5rem;
    min-width: 50px;
    padding: var(--space-sm) var(--space-md);
  }
  
  .pillar-name {
    font-size: var(--font-size-base);
  }
}
</style>
