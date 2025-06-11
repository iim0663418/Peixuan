<template>
  <div class="purple-star-chart-container">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('purpleStarChart.loading') }}</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ $t('purpleStarChart.loadError') }}</h3>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">
        {{ $t('purpleStarChart.retry') }}
      </button>
    </div>

    <!-- 命盤內容 -->
    <div v-else-if="chartData" class="chart-content">
      <!-- 調試資訊 -->
      <div v-if="false" class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
        <p><strong>調試資訊:</strong></p>
        <p>宮位數量: {{ chartData?.palaces?.length || 0 }}</p>
        <p>大限數量: {{ chartData?.daXian?.length || 0 }}</p>
        <p>小限數量: {{ chartData?.xiaoXian?.length || 0 }}</p>
        <p>流年太歲數量: {{ chartData?.liuNianTaiSui?.length || 0 }}</p>
        <p>五行局: {{ chartData?.fiveElementsBureau || '未知' }}</p>
      </div>

      <!-- 命盤資訊標題 -->
      <div class="chart-header">
        <h2>{{ $t('purpleStarChart.title') }}</h2>
        <div class="chart-info">
          <div class="birth-info">
            <p v-if="calculationInfo"><strong>{{ $t('purpleStarChart.birthDate') }}:</strong> {{ formatBirthDate() }}</p>
            <p v-if="calculationInfo"><strong>{{ $t('purpleStarChart.gender') }}:</strong> {{ formatGender() }}</p>
            <p v-if="chartData.fiveElementsBureau">
              <strong>{{ $t('purpleStarChart.fiveElementsBureau') }}:</strong> {{ chartData.fiveElementsBureau }}
            </p>
            <p><strong>數據概況:</strong> 
              {{ chartData.palaces?.length || 0 }}宮位, 
              {{ chartData.daXian?.length || 0 }}個大限, 
              {{ chartData.xiaoXian?.length || 0 }}個小限,
              {{ chartData.liuNianTaiSui?.length || 0 }}個流年
            </p>
          </div>
          <div class="chart-controls">
            <div class="display-depth-container">
              <div class="mode-help-text">{{ $t('purpleStarChart.modeHelp') }}</div>
              <div class="display-depth-tabs">
                <button 
                  v-for="depth in availableDisplayDepths" 
                  :key="depth"
                  @click="setDisplayDepth(depth)"
                  class="depth-tab-button"
                  :class="{ active: displayDepth === depth }"
                  :title="$t(`purpleStarChart.displayDepthDesc.${depth}`)"
                >
                  {{ $t(`purpleStarChart.displayDepth.${depth}`) }}
                </button>
              </div>
              <div v-if="displayDepth" class="depth-description">
                {{ $t(`purpleStarChart.displayDepthDesc.${displayDepth}`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 簡要解讀區域 -->
      <div v-if="showSummary && chartSummary" class="chart-summary">
        <div class="summary-header">
          <h3>{{ $t('purpleStarChart.chartSummary') }}</h3>
          <button @click="showSummary = !showSummary" class="toggle-summary-button">
            {{ $t('purpleStarChart.hideSummary') }}
          </button>
        </div>
        <div class="summary-content">
          <div class="summary-features">
            <div v-for="(feature, idx) in chartSummary.features" :key="`feature-${idx}`" class="feature-item">
              <span class="feature-icon">✧</span>
              <span class="feature-text">{{ feature }}</span>
            </div>
          </div>
          <div class="summary-detailed">
            <p>{{ chartSummary.detailedSummary }}</p>
          </div>
          <div class="interaction-hint" v-if="showInteractionTips">
          <div class="hint-content">
            <span class="hint-icon">💡</span>
            <div class="hint-text-container">
              <span class="hint-text">{{ $t(`purpleStarChart.interactionTips.${displayDepth}`) }}</span>
              <span class="swipe-hint">{{ $t('purpleStarChart.interactionTipDesc') }} <span class="swipe-arrow">↔️</span></span>
            </div>
            <button @click="showInteractionTips = false" class="close-hint">×</button>
          </div>
          </div>
        </div>
      </div>
      
      <!-- 當解讀區域被隱藏時顯示的重新展開按鈕 -->
      <div v-else-if="chartSummary" class="show-summary-button-container">
        <button @click="showSummary = true" class="show-summary-button">
          {{ $t('purpleStarChart.showSummary') }}
        </button>
      </div>

      <!-- 主命盤網格 -->
      <div class="chart-grid" :class="viewMode">
        <div 
          v-for="(position, index) in gridLayout" 
          :key="`position-${index}`"
          :class="['palace-cell', getPositionClass(position, index)]"
          @click="handlePalaceClick(position)"
        >
          <!-- 中央太極 -->
          <div v-if="position === 'center'" class="palace-center">
            <h4>{{ $t('purpleStarChart.centerPalace') }}</h4>
            <div class="center-info">
              <p v-if="chartData.fiveElementsBureau">{{ chartData.fiveElementsBureau }}</p>
              <p>{{ $t('purpleStarChart.mingPalace') }}: {{ getMingPalaceName() }}</p>
              <p>{{ $t('purpleStarChart.shenPalace') }}: {{ getShenPalaceName() }}</p>
            </div>
          </div>

          <!-- 宮位內容 -->
          <div v-else-if="getPalaceByZhi(position)" 
               class="palace-content" 
               :class="getPalaceFortuneClass(getPalaceByZhi(position))">
            <div class="palace-header">
              <span class="palace-name">{{ getPalaceByZhi(position)?.name }}</span>
              <span class="palace-zhi">{{ position }}</span>
              <span v-if="isMingPalace(position)" class="ming-indicator">命</span>
              <span v-if="isShenPalace(position)" class="shen-indicator">身</span>
              <span v-if="getPalaceByZhi(position)?.fortuneType" 
                    :class="['fortune-indicator', `fortune-${getPalaceByZhi(position)?.fortuneType}`]">
                {{ getPalaceByZhi(position)?.fortuneType }}
              </span>
            </div>

            <div class="stars-container">
              <div 
                v-for="star in getPalaceByZhi(position)?.stars" 
                :key="star.name"
                :class="getStarClasses(star)"
                @click.stop="handleStarClick(star)"
                :title="getStarTooltip(star)"
              >
                <span class="star-name">{{ star.name }}</span>
                <span v-if="star.transformations && star.transformations.length > 0" class="transformations">
                  {{ star.transformations.join('') }}
                </span>
                <span v-if="star.attribute" 
                      :class="['star-attribute', `attribute-${star.attribute}`]">
                  {{ star.attribute }}
                </span>
              </div>
            </div>

            <!-- 大限小限資訊 (詳細模式) -->
            <div v-if="viewMode === 'detailed'" class="cycles-info">
              <div v-if="getDaXianInfo(position)" class="da-xian-info">
                <small>{{ formatDaXianInfo(getDaXianInfo(position)!) }}</small>
              </div>
              <div v-if="getXiaoXianInfo(position)" class="xiao-xian-info">
                <small>{{ formatXiaoXianInfo(getXiaoXianInfo(position)!) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 命盤解讀區域 -->
      <div v-if="chartData.comprehensiveInterpretation || chartData.domainAnalyses" class="interpretation-section">
        <div class="interpretation-header">
          <h3>{{ $t('purpleStarChart.interpretation') || '命盤解讀' }}</h3>
          <div class="interpretation-tabs">
            <button 
              @click="setInterpretationMode('comprehensive')" 
              :class="{ active: interpretationMode === 'comprehensive' }"
              class="tab-button"
            >
              綜合解讀
            </button>
            <button 
              @click="setInterpretationMode('domain')" 
              :class="{ active: interpretationMode === 'domain' }"
              class="tab-button"
            >
              領域分析
            </button>
            <button 
              @click="setInterpretationMode('palace')" 
              :class="{ active: interpretationMode === 'palace' }"
              class="tab-button"
            >
              宮位解讀
            </button>
          </div>
        </div>

        <!-- 綜合解讀 -->
        <div v-if="interpretationMode === 'comprehensive' && chartData.comprehensiveInterpretation" class="comprehensive-interpretation">
          <div class="interpretation-card">
            <h4>整體生命模式</h4>
            <p>{{ chartData.comprehensiveInterpretation.overallLifePattern }}</p>
          </div>

          <div class="interpretation-card">
            <h4>生命目的</h4>
            <p>{{ chartData.comprehensiveInterpretation.lifePurpose }}</p>
          </div>

          <div class="interpretation-card">
            <h4>靈性成長路徑</h4>
            <p>{{ chartData.comprehensiveInterpretation.spiritualGrowthPath }}</p>
          </div>

          <div class="interpretation-card">
            <h4>獨特優勢</h4>
            <ul>
              <li v-for="(strength, idx) in chartData.comprehensiveInterpretation.uniqueStrengths" 
                  :key="`strength-${idx}`">{{ strength }}</li>
            </ul>
          </div>

          <div class="interpretation-card">
            <h4>潛在挑戰</h4>
            <ul>
              <li v-for="(challenge, idx) in chartData.comprehensiveInterpretation.potentialChallenges" 
                  :key="`challenge-${idx}`">{{ challenge }}</li>
            </ul>
          </div>

          <div class="interpretation-card">
            <h4>主要生命週期</h4>
            <div class="lifecycle-grid">
              <div v-for="(cycle, idx) in chartData.comprehensiveInterpretation.majorLifeCycles" 
                   :key="`cycle-${idx}`" class="lifecycle-item">
                <div class="lifecycle-period">{{ cycle.period }}</div>
                <div class="lifecycle-content">
                  <div class="lifecycle-theme">{{ cycle.theme }}</div>
                  <div class="lifecycle-focus">主題：{{ cycle.focus }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="interpretation-card">
            <h4>關鍵命盤模式</h4>
            <ul>
              <li v-for="(pattern, idx) in chartData.comprehensiveInterpretation.keyCrossPalacePatterns" 
                  :key="`pattern-${idx}`">{{ pattern }}</li>
            </ul>
          </div>
        </div>

        <!-- 領域分析 -->
        <div v-if="interpretationMode === 'domain' && chartData.domainAnalyses" class="domain-analysis">
          <div class="domain-tabs">
            <button 
              v-for="domain in chartData.domainAnalyses" 
              :key="domain.domain"
              @click="setActiveDomain(domain.domain)"
              :class="{ active: activeDomain === domain.domain }"
              class="domain-tab-button"
            >
              {{ getDomainDisplayName(domain.domain) }}
            </button>
          </div>

          <div v-if="activeDomainAnalysis" class="domain-content">
            <div class="domain-header">
              <h4>{{ getDomainDisplayName(activeDomainAnalysis.domain) }}</h4>
              <div :class="`fortune-badge fortune-${activeDomainAnalysis.overallFortune}`">
                {{ getFortuneDisplayName(activeDomainAnalysis.overallFortune) }}
              </div>
            </div>

            <div class="domain-insights">
              <h5>關鍵洞見</h5>
              <ul>
                <li v-for="(insight, idx) in activeDomainAnalysis.keyInsights" 
                    :key="`insight-${idx}`">{{ insight }}</li>
              </ul>
            </div>

            <div class="domain-influences">
              <h5>星曜影響</h5>
              <ul>
                <li v-for="(influence, idx) in activeDomainAnalysis.starInfluences" 
                    :key="`influence-${idx}`">{{ influence }}</li>
              </ul>
            </div>

            <div class="domain-actions">
              <h5>建議行動</h5>
              <ul>
                <li v-for="(action, idx) in activeDomainAnalysis.recommendedActions" 
                    :key="`action-${idx}`">{{ action }}</li>
              </ul>
            </div>

            <div class="domain-periods">
              <div class="periods-column">
                <h5>有利時期</h5>
                <ul>
                  <li v-for="(period, idx) in activeDomainAnalysis.periods.favorable" 
                      :key="`favorable-${idx}`">{{ period }}</li>
                </ul>
              </div>
              <div class="periods-column">
                <h5>挑戰時期</h5>
                <ul>
                  <li v-for="(period, idx) in activeDomainAnalysis.periods.challenging" 
                      :key="`challenging-${idx}`">{{ period }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 宮位解讀 -->
        <div v-if="interpretationMode === 'palace' && chartData.palaceInterpretations" class="palace-interpretation">
          <div class="palace-tabs">
            <button 
              v-for="interp in chartData.palaceInterpretations" 
              :key="interp.palaceName"
              @click="setActivePalace(interp.palaceName)"
              :class="{ active: activePalaceName === interp.palaceName }"
              class="palace-tab-button"
            >
              {{ interp.palaceName }}
            </button>
          </div>

          <div v-if="activePalaceInterpretation" class="palace-content">
            <h4>{{ activePalaceInterpretation.palaceName }}解讀</h4>
            
            <div class="palace-section">
              <h5>個性特質</h5>
              <div class="trait-tags">
                <span v-for="(trait, idx) in activePalaceInterpretation.personalityTraits" 
                      :key="`trait-${idx}`" class="trait-tag">{{ trait }}</span>
              </div>
            </div>

            <div class="palace-section">
              <h5>優勢領域</h5>
              <ul>
                <li v-for="(strength, idx) in activePalaceInterpretation.strengthAreas" 
                    :key="`strength-${idx}`">{{ strength }}</li>
              </ul>
            </div>

            <div class="palace-section">
              <h5>挑戰領域</h5>
              <ul>
                <li v-for="(challenge, idx) in activePalaceInterpretation.challengeAreas" 
                    :key="`challenge-${idx}`">{{ challenge }}</li>
              </ul>
            </div>

            <div class="palace-section">
              <h5>人生主題</h5>
              <ul>
                <li v-for="(theme, idx) in activePalaceInterpretation.lifeThemes" 
                    :key="`theme-${idx}`">{{ theme }}</li>
              </ul>
            </div>

            <div class="palace-section">
              <h5>星曜影響</h5>
              <ul>
                <li v-for="(influence, idx) in activePalaceInterpretation.keyStarInfluences" 
                    :key="`influence-${idx}`">{{ influence }}</li>
              </ul>
            </div>

            <div class="palace-section">
              <h5>建議</h5>
              <ul>
                <li v-for="(advice, idx) in activePalaceInterpretation.advice" 
                    :key="`advice-${idx}`">{{ advice }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 大限小限詳細資訊 (可選顯示) -->
      <div v-if="showCyclesDetail && chartData.daXian" class="cycles-detail">
        <div class="cycles-detail-header">
          <h3>{{ $t('purpleStarChart.majorCycles') }}</h3>
          <div class="cycles-explanation">
            <div class="info-icon">ℹ️</div>
            <div class="info-text">
              大限是紫微斗數命盤中表示人生階段的重要概念，每個大限代表約10年的時間。大限與本命盤星曜互動，
              揭示該階段的主要能量流動和關鍵課題。每個大限的宮位和星曜組合，預示著該時期的主要生活主題和機遇挑戰。
            </div>
          </div>
        </div>
        <div class="cycles-grid">
          <div 
            v-for="cycle in chartData.daXian" 
            :key="`daxian-${cycle.startAge}`"
            class="cycle-item"
            :class="{ current: isCurrentCycle(cycle) }"
          >
            <div class="cycle-header">
              <span class="cycle-age">{{ cycle.startAge }}-{{ cycle.endAge }}{{ $t('purpleStarChart.years') }}</span>
              <span class="cycle-palace">{{ cycle.palaceName }}</span>
            </div>
            <div class="cycle-zhi">{{ cycle.palaceZhi }}</div>
            <div class="cycle-description">
              大限落在{{ cycle.palaceName }}宮，著重於{{ getCycleTheme(cycle.palaceName) }}主題。
            </div>
          </div>
        </div>
      </div>

      <!-- 星曜詳細資訊彈窗 -->
      <div v-if="selectedStar" class="star-detail-modal" @click="closeStarDetail">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedStar.name }}</h3>
            <button @click="closeStarDetail" class="close-button">×</button>
          </div>
          <div class="modal-body">
            <p><strong>{{ $t('purpleStarChart.starType') }}:</strong> {{ $t(`purpleStarChart.starTypes.${selectedStar.type}`) }}</p>
            <p><strong>{{ $t('purpleStarChart.palace') }}:</strong> {{ getStarPalaceName(selectedStar) }}</p>
            
            <!-- 星曜屬性信息 -->
            <div class="star-attributes-section">
              <div v-if="selectedStar.attribute" class="attribute-item">
                <strong>吉凶屬性：</strong>
                <span :class="`attribute-tag attribute-${selectedStar.attribute}`">{{ selectedStar.attribute }}</span>
              </div>
              <div v-if="selectedStar.propertyType" class="attribute-item">
                <strong>陰陽屬性：</strong>
                <span class="attribute-tag">{{ selectedStar.propertyType }}</span>
              </div>
              <div v-if="selectedStar.element" class="attribute-item">
                <strong>五行屬性：</strong>
                <span class="attribute-tag">{{ selectedStar.element }}</span>
              </div>
              <div v-if="selectedStar.strength !== undefined" class="attribute-item">
                <strong>星曜強度：</strong>
                <span class="attribute-tag">{{ selectedStar.strength }}/10</span>
              </div>
            </div>
            
            <!-- 星曜描述 -->
            <div v-if="selectedStar.description" class="star-description">
              <strong>星曜特點：</strong>
              <p>{{ selectedStar.description }}</p>
            </div>
            
            <!-- 四化信息 -->
            <div v-if="selectedStar.transformations && selectedStar.transformations.length > 0">
              <strong>{{ $t('purpleStarChart.transformations') }}:</strong>
              <ul>
                <li v-for="trans in selectedStar.transformations" :key="trans">
                  {{ $t(`purpleStarChart.transformationTypes.${trans}`) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { 
  PurpleStarChart, 
  Palace, 
  Star, 
  DaXianInfo, 
  XiaoXianInfo,
  LiuNianTaiSuiInfo,
  PalaceInterpretation,
  DomainSpecificAnalysis,
  ComprehensiveChartInterpretation
} from '@/types/astrologyTypes';

// 計算資訊介面定義
interface CalculationInfo {
  birthInfo: {
    solarDate: string;
    gender: string;
  };
}

const { t } = useI18n();

// Props
interface Props {
  chartData?: PurpleStarChart | null;
  calculationInfo?: CalculationInfo | null;
  isLoading?: boolean;
  error?: string | null;
  showCyclesDetail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  chartData: null,
  calculationInfo: null,
  isLoading: false,
  error: null,
  showCyclesDetail: false
});

// Emits
const emit = defineEmits<{
  retry: [];
  palaceClick: [palace: Palace];
  starClick: [star: Star];
  export: [format: string];
}>();

// 響應式資料
const viewMode = ref<'simple' | 'detailed'>('simple');
const displayMode = ref<'compact' | 'expanded'>('compact'); // 保留舊的控制變數，保持向後兼容
const selectedStar = ref<Star | null>(null);
const selectedPalace = ref<Palace | null>(null); // 選中的宮位
const showInteractionTips = ref<boolean>(true); // 顯示互動提示
const showSummary = ref<boolean>(true); // 顯示簡要解讀
const interpretationMode = ref<'comprehensive' | 'domain' | 'palace'>('comprehensive');
const activeDomain = ref<'career' | 'wealth' | 'marriage' | 'health' | 'education' | 'social'>('career');
const activePalaceName = ref<string>('');

// 顯示深度相關變數
type DisplayDepth = 'minimal' | 'compact' | 'standard' | 'comprehensive';
const displayDepth = ref<DisplayDepth>('standard'); // 預設為標準深度
const availableDisplayDepths: DisplayDepth[] = ['minimal', 'compact', 'standard', 'comprehensive'];

// 設定顯示深度的方法
const setDisplayDepth = (depth: DisplayDepth) => {
  displayDepth.value = depth;
  
  // 保存顯示深度設定到 localStorage
  try {
    localStorage.setItem('purple-star-display-depth', depth);
  } catch (error) {
    console.warn('無法保存顯示深度設定:', error);
  }
  
  // 根據深度應用不同的顯示效果
  setTimeout(() => {
    const chartGrid = document.querySelector('.chart-grid');
    
    // 清除所有深度相關的類
    document.querySelectorAll('.palace-cell').forEach((el) => {
      (el as HTMLElement).classList.remove('depth-minimal', 'depth-compact', 'depth-standard', 'depth-comprehensive');
      (el as HTMLElement).classList.add(`depth-${depth}`);
    });
    
    if (chartGrid) {
      (chartGrid as HTMLElement).classList.remove('detailed', 'simple');
    }
    
    switch (depth) {
      case 'minimal':
        // 最簡潔預覽模式
        if (chartGrid) (chartGrid as HTMLElement).classList.add('simple');
        document.querySelectorAll('.cycles-info').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
        document.querySelectorAll('.star-item:not(.star-main)').forEach((el) => {
          (el as HTMLElement).style.opacity = '0.4';
        });
        document.querySelectorAll('.palace-cell').forEach((el) => {
          (el as HTMLElement).style.pointerEvents = 'none';
        });
        viewMode.value = 'simple';
        displayMode.value = 'compact';
        break;
        
      case 'compact':
        // 精簡檢視模式
        if (chartGrid) (chartGrid as HTMLElement).classList.add('simple');
        document.querySelectorAll('.cycles-info').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
        document.querySelectorAll('.star-item:not(.star-main)').forEach((el) => {
          (el as HTMLElement).style.opacity = '0.7';
        });
        document.querySelectorAll('.palace-cell').forEach((el) => {
          (el as HTMLElement).style.pointerEvents = 'auto';
        });
        viewMode.value = 'simple';
        displayMode.value = 'compact';
        break;
        
      case 'standard':
        // 標準解讀模式
        if (chartGrid) (chartGrid as HTMLElement).classList.add('detailed');
        document.querySelectorAll('.cycles-info').forEach((el) => {
          (el as HTMLElement).style.display = 'block';
        });
        document.querySelectorAll('.star-item').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        document.querySelectorAll('.palace-cell').forEach((el) => {
          (el as HTMLElement).style.pointerEvents = 'auto';
        });
        viewMode.value = 'detailed';
        displayMode.value = 'expanded';
        break;
        
      case 'comprehensive':
        // 深度分析模式
        if (chartGrid) (chartGrid as HTMLElement).classList.add('detailed');
        document.querySelectorAll('.cycles-info').forEach((el) => {
          (el as HTMLElement).style.display = 'block';
        });
        document.querySelectorAll('.star-item').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        document.querySelectorAll('.palace-cell').forEach((el) => {
          (el as HTMLElement).style.pointerEvents = 'auto';
        });
        // 這裡可以增加額外深度分析效果
        viewMode.value = 'detailed';
        displayMode.value = 'expanded';
        break;
    }
  }, 50);
};

// 計算屬性
// 命盤概要解讀
const chartSummary = computed(() => {
  if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces)) return null;
  
  // 從命盤數據中提取重要信息生成簡要解讀
  const mainStars = props.chartData.palaces.flatMap(p => 
    p.stars && Array.isArray(p.stars) 
      ? p.stars.filter(s => s.type === 'main' || (s.transformations && s.transformations.length)) 
      : []
  );
  
  const mainStarCounts = {
    '吉': mainStars.filter(s => s.attribute === '吉').length,
    '凶': mainStars.filter(s => s.attribute === '凶').length,
    '中性': mainStars.filter(s => s.attribute === '中性').length
  };
  
  const hasMingPalaceGoodStars = props.chartData.palaces[props.chartData.mingPalaceIndex]?.stars
    .some(s => s.type === 'main' && s.attribute === '吉');
  
  const transformationCount = mainStars.filter(s => s.transformations?.length).length;
  
  // 命盤特徵摘要
  const features = [];
  
  if (mainStarCounts['吉'] > mainStarCounts['凶']) {
    features.push('吉星較多，整體運勢偏向正面');
  } else if (mainStarCounts['凶'] > mainStarCounts['吉']) {
    features.push('凶星較多，人生挑戰較大');
  } else {
    features.push('吉凶星均衡，順逆交替');
  }
  
  if (hasMingPalaceGoodStars) {
    features.push('命宮有吉星入駐，基礎運勢良好');
  }
  
  if (transformationCount > 3) {
    features.push('四化星豐富，命盤變化較大');
  }
  
  // 從命宮情況添加特徵
  const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
  if (mingPalace) {
    const mingStars = mingPalace.stars.filter(s => s.type === 'main');
    if (mingStars.length > 2) {
      features.push('命宮聚集多顆主星，命運變化豐富');
    }
    
    // 檢查命宮是否有特定星曜
    const hasPurpleStar = mingStars.some(s => s.name.includes('紫微'));
    if (hasPurpleStar) {
      features.push('紫微星入命，具有領導才能與權威性');
    }
  }
  
  // 自動生成命盤摘要
  let generatedSummary = '';
  if (props.chartData.comprehensiveInterpretation?.overallLifePattern) {
    generatedSummary = props.chartData.comprehensiveInterpretation.overallLifePattern;
  } else {
    // 當後端未提供解讀時自動生成
    const mingPalaceName = mingPalace?.name || '命宮';
    const fortuneType = mainStarCounts['吉'] > mainStarCounts['凶'] ? '較為順遂' : 
                        mainStarCounts['凶'] > mainStarCounts['吉'] ? '較多挑戰' : '順逆參半';
    
    generatedSummary = `此命盤以${mingPalaceName}為中心，整體運勢${fortuneType}。` + 
                       `命盤中共有${mainStars.length}顆主要星曜，其中吉星${mainStarCounts['吉']}顆，` +
                       `凶星${mainStarCounts['凶']}顆。在紫微斗數的十二宮位結構中，` + 
                       `每個宮位代表人生不同領域，宮位中的星曜組合則揭示了各領域的特質與發展。` +
                       `透過分析命宮、財帛宮、官祿宮等關鍵宮位的星曜組合，可進一步了解命主的潛能與挑戰。`;
  }
  
  return {
    features,
    detailedSummary: generatedSummary
  };
});

const activeDomainAnalysis = computed(() => {
  if (!props.chartData?.domainAnalyses) return null;
  return props.chartData.domainAnalyses.find(d => d.domain === activeDomain.value) || null;
});

const activePalaceInterpretation = computed(() => {
  if (!props.chartData?.palaceInterpretations || !activePalaceName.value) return null;
  return props.chartData.palaceInterpretations.find(p => p.palaceName === activePalaceName.value) || null;
});

// 十二地支命盤網格佈局 (傳統佈局：逆時針)
const gridLayout = [
  '巳', '午', '未', '申',
  '辰', 'center', 'center', '酉', 
  '卯', 'center', 'center', '戌',
  '寅', '丑', '子', '亥'
];

// 地支到索引的映射
const zhiToIndex: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};

// 方法
const getPalaceByZhi = (zhiName: string): Palace | undefined => {
  if (!props.chartData || zhiName === 'center') return undefined;
  return props.chartData.palaces.find(palace => palace.zhi === zhiName);
};

const getPositionClass = (position: string, index: number): string => {
  const classes = [`grid-position-${index}`];
  
  if (position === 'center') {
    classes.push('center-position');
  } else {
    classes.push(`zhi-${position}`);
    
    if (isMingPalace(position)) classes.push('ming-palace');
    if (isShenPalace(position)) classes.push('shen-palace');
  }
  
  return classes.join(' ');
};

const getStarClasses = (star: Star): string[] => {
  const classes = ['star-item', `star-${star.type}`];
  
  if (star.transformations) {
    star.transformations.forEach(trans => {
      classes.push(`transform-${trans}`);
    });
  }
  
  return classes;
};

const getStarTooltip = (star: Star): string => {
  let tooltip = `${star.name} (${t(`purpleStarChart.starTypes.${star.type}`)})`;
  if (star.transformations && star.transformations.length > 0) {
    tooltip += ` - ${star.transformations.map(t => t).join(', ')}`;
  }
  return tooltip;
};

const isMingPalace = (zhiName: string): boolean => {
  if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces)) return false;
  
  // 確保 mingPalaceIndex 存在且有效
  if (typeof props.chartData.mingPalaceIndex !== 'number' || 
      props.chartData.mingPalaceIndex < 0 || 
      props.chartData.mingPalaceIndex >= props.chartData.palaces.length) {
    return false;
  }
  
  const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
  return mingPalace && mingPalace.zhi === zhiName;
};

const isShenPalace = (zhiName: string): boolean => {
  if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces)) return false;
  
  // 確保 shenPalaceIndex 存在且有效
  if (typeof props.chartData.shenPalaceIndex !== 'number' || 
      props.chartData.shenPalaceIndex < 0 || 
      props.chartData.shenPalaceIndex >= props.chartData.palaces.length) {
    return false;
  }
  
  const shenPalace = props.chartData.palaces[props.chartData.shenPalaceIndex];
  return shenPalace && shenPalace.zhi === zhiName;
};

const getMingPalaceName = (): string => {
  if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces)) return '';
  
  // 確保 mingPalaceIndex 存在且有效
  if (typeof props.chartData.mingPalaceIndex !== 'number' || 
      props.chartData.mingPalaceIndex < 0 || 
      props.chartData.mingPalaceIndex >= props.chartData.palaces.length) {
    return '';
  }
  
  const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
  return mingPalace?.zhi || '';
};

const getShenPalaceName = (): string => {
  if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces)) return '';
  
  // 確保 shenPalaceIndex 存在且有效
  if (typeof props.chartData.shenPalaceIndex !== 'number' || 
      props.chartData.shenPalaceIndex < 0 || 
      props.chartData.shenPalaceIndex >= props.chartData.palaces.length) {
    return '';
  }
  
  const shenPalace = props.chartData.palaces[props.chartData.shenPalaceIndex];
  return shenPalace?.zhi || '';
};

const getDaXianInfo = (zhiName: string): DaXianInfo | undefined => {
  if (!props.chartData?.daXian) return undefined;
  return props.chartData.daXian.find(cycle => cycle.palaceZhi === zhiName);
};

const getXiaoXianInfo = (zhiName: string): XiaoXianInfo | undefined => {
  if (!props.chartData?.xiaoXian) return undefined;
  // 這裡可能需要根據當前年齡或指定年齡來查找小限
  return props.chartData.xiaoXian.find(cycle => cycle.palaceZhi === zhiName);
};

const formatDaXianInfo = (cycle: DaXianInfo): string => {
  return `${cycle.startAge}-${cycle.endAge}${t('purpleStarChart.years')}`;
};

const formatXiaoXianInfo = (cycle: XiaoXianInfo): string => {
  return `${cycle.age}${t('purpleStarChart.years')}`;
};

const isCurrentCycle = (cycle: DaXianInfo): boolean => {
  // TODO: 根據目前年齡判斷是否為當前大限
  // 這裡需要計算當前年齡
  return false;
};

const formatBirthDate = (): string => {
  if (!props.calculationInfo) return '';
  return new Date(props.calculationInfo.birthInfo.solarDate).toLocaleDateString();
};

const formatGender = (): string => {
  if (!props.calculationInfo) return '';
  return t(`purpleStarChart.genders.${props.calculationInfo.birthInfo.gender}`);
};

const getStarPalaceName = (star: Star): string => {
  if (!props.chartData) return '';
  const palace = props.chartData.palaces.find(p => p.index === star.palaceIndex);
  return palace?.name || '';
};

const getPalaceFortuneClass = (palace?: Palace): string => {
  if (!palace || !palace.fortuneType) return '';
  
  return `palace-fortune-${palace.fortuneType}`;
};

// 根據宮位名稱返回對應的生命主題說明
const getCycleTheme = (palaceName: string): string => {
  const themes: Record<string, string> = {
    '命宮': '個人特質與基本運勢',
    '兄弟宮': '手足關係與朋友圈',
    '夫妻宮': '婚姻與伴侶關係',
    '子女宮': '後代與創造力',
    '財帛宮': '財富與物質生活',
    '疾厄宮': '健康與困境',
    '遷移宮': '居所變動與旅行',
    '交友宮': '人際關係與合作',
    '官祿宮': '事業成就與社會地位',
    '田宅宮': '不動產與居家環境',
    '福德宮': '內在幸福與精神追求',
    '父母宮': '長輩關係與根源'
  };
  
  return themes[palaceName] || '人生特定領域';
};

// 事件處理
// 切換視圖模式：簡潔/詳細
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'simple' ? 'detailed' : 'simple';
  
  // 立即應用視圖模式變化
  setTimeout(() => {
    if (viewMode.value === 'detailed') {
      // 詳細模式：顯示所有大限小限資訊
      document.querySelectorAll('.cycles-info').forEach((el) => {
        (el as HTMLElement).style.display = 'block';
      });
      // 調整網格高度以適應額外內容
      const chartGrid = document.querySelector('.chart-grid');
      if (chartGrid) {
        (chartGrid as HTMLElement).classList.add('detailed');
      }
    } else {
      // 簡潔模式：隱藏大限小限資訊
      document.querySelectorAll('.cycles-info').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      // 還原網格高度
      const chartGrid = document.querySelector('.chart-grid');
      if (chartGrid) {
        (chartGrid as HTMLElement).classList.remove('detailed');
      }
    }
  }, 50);
};

// 切換顯示模式：精簡/展開
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'compact' ? 'expanded' : 'compact';
  
  // 立即應用顯示模式變化
  setTimeout(() => {
    if (displayMode.value === 'compact') {
      // 精簡檢視：禁用互動，縮減顯示
      document.querySelectorAll('.palace-cell').forEach((el) => {
        (el as HTMLElement).style.pointerEvents = 'none';
        (el as HTMLElement).classList.add('compact-mode');
      });
      
      // 隱藏非必要元素
      document.querySelectorAll('.star-item:not(.star-main)').forEach((el) => {
        (el as HTMLElement).style.opacity = '0.5';
      });
    } else {
      // 展開檢視：啟用互動，完整顯示
      document.querySelectorAll('.palace-cell').forEach((el) => {
        (el as HTMLElement).style.pointerEvents = 'auto';
        (el as HTMLElement).classList.remove('compact-mode');
      });
      
      // 恢復所有星曜顯示
      document.querySelectorAll('.star-item').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
    }
  }, 50);
};

const handlePalaceClick = (position: string) => {
  if (position === 'center') return;
  const palace = getPalaceByZhi(position);
  if (palace) {
    selectedPalace.value = palace;
    emit('palaceClick', palace);
  }
};

const handleStarClick = (star: Star) => {
  selectedStar.value = star;
  emit('starClick', star);
};

const closeStarDetail = () => {
  selectedStar.value = null;
};

// 移除匯出功能

// 解讀相關方法
const setInterpretationMode = (mode: 'comprehensive' | 'domain' | 'palace') => {
  interpretationMode.value = mode;
};

const setActiveDomain = (domain: 'career' | 'wealth' | 'marriage' | 'health' | 'education' | 'social') => {
  activeDomain.value = domain;
};

const setActivePalace = (palaceName: string) => {
  activePalaceName.value = palaceName;
};

const getDomainDisplayName = (domain: string): string => {
  const displayNames: Record<string, string> = {
    'career': '事業分析',
    'wealth': '財富分析',
    'marriage': '婚姻分析',
    'health': '健康分析',
    'education': '學業分析',
    'social': '人際分析'
  };
  return displayNames[domain] || domain;
};

const getFortuneDisplayName = (fortune: string): string => {
  const displayNames: Record<string, string> = {
    'excellent': '極佳',
    'good': '良好',
    'neutral': '中性',
    'challenging': '挑戰',
    'difficult': '困難'
  };
  return displayNames[fortune] || fortune;
};

// 生命週期
onMounted(() => {
  // 設置初始顯示深度
  try {
    const savedDepth = localStorage.getItem('purple-star-display-depth');
    if (savedDepth && availableDisplayDepths.includes(savedDepth as DisplayDepth)) {
      displayDepth.value = savedDepth as DisplayDepth;
      // 應用顯示深度效果
      setTimeout(() => setDisplayDepth(displayDepth.value), 100);
    } else {
      // 預設為標準解讀
      setDisplayDepth('standard');
    }
  } catch (error) {
    console.warn('無法讀取顯示深度設定:', error);
    // 預設為標準解讀
    setDisplayDepth('standard');
  }
});

// 監聽
watch(() => props.chartData, (newData) => {
  if (newData) {
    // 重置選中狀態
    selectedStar.value = null;
    
    // 設置默認解讀模式
    interpretationMode.value = 'comprehensive';
    
    // 設置默認領域和宮位
    if (newData.domainAnalyses && newData.domainAnalyses.length > 0) {
      activeDomain.value = newData.domainAnalyses[0].domain;
    }
    
    if (newData.palaceInterpretations && newData.palaceInterpretations.length > 0) {
      activePalaceName.value = newData.palaceInterpretations[0].palaceName;
    }
  }
});
</script>

<style scoped>
.purple-star-chart-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
}

/* 載入和錯誤狀態 */
.loading-state, .error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

.retry-button:hover {
  background: #2980b9;
}

/* 圖表標題區域 */
.chart-header {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-header h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.birth-info p {
  margin: 5px 0;
  color: #555;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.view-toggle-button, .export-button {
  padding: 8px 16px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-toggle-button.active,
.view-toggle-button:hover,
.display-toggle-button.active,
.display-toggle-button:hover,
.export-button:hover,
.depth-tab-button.active,
.depth-tab-button:hover {
  background: #3498db;
  color: white;
}

/* 顯示深度容器與標籤 */
.display-depth-container {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.mode-help-text {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.display-depth-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.depth-tab-button {
  padding: 8px 16px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.depth-description {
  margin-top: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 5px;
  color: #495057;
  font-size: 0.85rem;
  border-left: 3px solid #3498db;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 深度相關樣式 */
.palace-cell.depth-minimal {
  padding: 4px;
}

.palace-cell.depth-comprehensive {
  padding: 10px;
}

@media (max-width: 768px) {
  .display-depth-tabs {
    flex-direction: column;
    width: 100%;
  }
  
  .depth-tab-button {
    width: 100%;
    text-align: center;
  }
}

/* 簡要解讀區域 */
.chart-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: #f0f8ff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.summary-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.toggle-summary-button {
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.toggle-summary-button:hover {
  background: #3498db;
  color: white;
}

.summary-content {
  position: relative;
}

.summary-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.feature-icon {
  color: #3498db;
  font-size: 1.1rem;
}

.feature-text {
  color: #333;
  line-height: 1.5;
}

.summary-detailed {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  margin-bottom: 10px;
}

.summary-detailed p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.interaction-hint {
  margin-top: 15px;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(52, 152, 219, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px dashed #3498db;
}

.hint-icon {
  font-size: 1.2rem;
  color: #3498db;
}

.hint-text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hint-text {
  color: #555;
  font-weight: 500;
}

.swipe-hint {
  color: #666;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.swipe-arrow {
  animation: swipeAnimation 2s infinite ease-in-out;
  display: inline-block;
  margin-left: 4px;
}

@keyframes swipeAnimation {
  0% { transform: translate(-3px, -3px); }
  25% { transform: translate(3px, -3px); }
  50% { transform: translate(3px, 3px); }
  75% { transform: translate(-3px, 3px); }
  100% { transform: translate(-3px, -3px); }
}

.close-hint {
  background: none;
  border: none;
  color: #999;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-hint:hover {
  color: #333;
}

/* 重新展開按鈕樣式 */
.show-summary-button-container {
  margin-bottom: 20px;
  text-align: center;
}

.show-summary-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.show-summary-button:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* 命盤網格 */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, minmax(120px, auto));
  gap: 2px;
  border: 2px solid #2c3e50;
  background: #2c3e50;
  border-radius: 8px;
  overflow: auto;
  max-width: 100%;
  max-height: 80vh;
}

.chart-grid.detailed {
  grid-template-rows: repeat(4, minmax(150px, auto));
}

.palace-cell {
  background: white;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.palace-cell:hover:not(.center-position) {
  background: #f8f9fa;
}

/* 中央太極 */
.palace-center {
  grid-column: 2 / span 2;
  grid-row: 2 / span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  cursor: default;
}

.palace-center h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.center-info p {
  margin: 3px 0;
  font-size: 0.9rem;
  color: #555;
}

/* 宮位內容 */
.palace-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.palace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.palace-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
}

.palace-zhi {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #495057;
}

.ming-indicator, .shen-indicator {
  background: #dc3545;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: bold;
}

.shen-indicator {
  background: #28a745;
}

/* 星曜容器 */
.stars-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-content: flex-start;
}

.star-item {
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.star-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.star-name {
  margin-right: 3px;
}

.transformations {
  font-size: 0.75rem;
  font-weight: bold;
}

/* 星曜類型樣式 */
.star-main {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
  font-weight: bold;
}

.star-auxiliary {
  background: #d1ecf1;
  color: #0c5460;
  border-color: #bee5eb;
}

.star-minor {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

/* 四化樣式 */
.transform-祿 {
  background: #fff3cd !important;
  color: #856404 !important;
  border-color: #ffeaa7 !important;
}

.transform-權 {
  background: #d4edda !important;
  color: #155724 !important;
  border-color: #c3e6cb !important;
}

.transform-科 {
  background: #d1ecf1 !important;
  color: #0c5460 !important;
  border-color: #bee5eb !important;
}

.transform-忌 {
  background: #f8d7da !important;
  color: #721c24 !important;
  border-color: #f5c6cb !important;
}

/* 星曜屬性樣式 */
.star-attribute {
  font-size: 0.7rem;
  margin-left: 3px;
  padding: 1px 3px;
  border-radius: 2px;
}

.attribute-吉 {
  background: #d4edda;
  color: #155724;
}

.attribute-凶 {
  background: #f8d7da;
  color: #721c24;
}

.attribute-中性 {
  background: #e2e3e5;
  color: #383d41;
}

/* 宮位吉凶樣式 */
.fortune-indicator {
  font-size: 0.7rem;
  padding: 1px 3px;
  border-radius: 2px;
  margin-left: 3px;
}

.fortune-吉 {
  background: #d4edda;
  color: #155724;
}

.fortune-凶 {
  background: #f8d7da;
  color: #721c24;
}

.fortune-中性 {
  background: #e2e3e5;
  color: #383d41;
}

/* 宮位吉凶背景色 */
.palace-fortune-吉 {
  background-color: rgba(212, 237, 218, 0.1);
}

.palace-fortune-凶 {
  background-color: rgba(248, 215, 218, 0.1);
}

.palace-fortune-中性 {
  background-color: rgba(226, 227, 229, 0.1);
}

/* 大小限資訊 */
.cycles-info {
  margin-top: 8px;
  padding-top: 5px;
  border-top: 1px solid #eee;
}

.da-xian-info, .xiao-xian-info {
  margin: 2px 0;
}

.da-xian-info small {
  color: #dc3545;
  font-weight: 500;
}

.xiao-xian-info small {
  color: #28a745;
  font-weight: 500;
}

/* 大限詳細資訊 */
.cycles-detail {
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.cycles-detail-header {
  margin-bottom: 20px;
}

.cycles-detail-header h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.cycles-explanation {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(52, 152, 219, 0.1);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.info-icon {
  font-size: 1.2rem;
  color: #3498db;
  flex-shrink: 0;
}

.info-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
}

.cycles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.cycle-item {
  padding: 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  text-align: center;
}

.cycle-item.current {
  border-color: #3498db;
  background: #e3f2fd;
}

.cycle-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cycle-age {
  font-weight: bold;
  color: #2c3e50;
}

.cycle-palace {
  color: #555;
  font-size: 0.9rem;
}

.cycle-zhi {
  margin-top: 5px;
  padding: 3px 6px;
  background: #e9ecef;
  border-radius: 3px;
  font-size: 0.8rem;
}

.cycle-description {
  margin-top: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #555;
  text-align: left;
  padding: 5px;
  border-top: 1px solid #eee;
}

.palace-cell.compact-mode {
  padding: 4px;
  transition: all 0.3s;
}

.compact-mode .palace-header {
  margin-bottom: 4px;
  padding-bottom: 3px;
}

.compact-mode .palace-name {
  font-size: 0.8rem;
}

.compact-mode .palace-zhi {
  font-size: 0.7rem;
  padding: 1px 4px;
}

/* 星曜詳細資訊彈窗 */
.star-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 10px 0;
}

.modal-body ul {
  margin: 10px 0;
  padding-left: 20px;
}

/* 星曜屬性標籤 */
.star-attributes-section {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.attribute-item {
  margin: 8px 0;
}

.attribute-tag {
  display: inline-block;
  padding: 3px 8px;
  margin-left: 5px;
  border-radius: 3px;
  background-color: #e9ecef;
  color: #212529;
  font-size: 0.9rem;
}

.attribute-tag.attribute-吉 {
  background-color: #d4edda;
  color: #155724;
}

.attribute-tag.attribute-凶 {
  background-color: #f8d7da;
  color: #721c24;
}

.attribute-tag.attribute-中性 {
  background-color: #e2e3e5;
  color: #383d41;
}

.star-description {
  margin: 15px 0;
  padding: 10px;
  border-left: 3px solid #ddd;
  background-color: #f9f9f9;
}

.star-description p {
  margin: 5px 0 0 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
}

/* 命盤解讀區域樣式 */
.interpretation-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.interpretation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.interpretation-header h3 {
  margin: 0;
  color: #2c3e50;
}

.interpretation-tabs {
  display: flex;
  gap: 10px;
}

.tab-button {
  padding: 8px 16px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button.active,
.tab-button:hover {
  background: #3498db;
  color: white;
}

/* 綜合解讀樣式 */
.comprehensive-interpretation {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.interpretation-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.interpretation-card h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.interpretation-card p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.interpretation-card ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.lifecycle-item {
  background: #f9f9f9;
  border-radius: 5px;
  padding: 10px;
  border-left: 3px solid #3498db;
}

.lifecycle-period {
  font-weight: bold;
  color: #2c3e50;
}

.lifecycle-content {
  margin-top: 5px;
}

.lifecycle-theme {
  color: #e74c3c;
  font-weight: 500;
}

.lifecycle-focus {
  color: #555;
  font-size: 0.9em;
  margin-top: 3px;
}

/* 領域分析樣式 */
.domain-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.domain-tab-button {
  padding: 8px 16px;
  border: none;
  background: #e9ecef;
  color: #495057;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.domain-tab-button.active,
.domain-tab-button:hover {
  background: #3498db;
  color: white;
}

.domain-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.domain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.domain-header h4 {
  margin: 0;
  color: #2c3e50;
}

.fortune-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.fortune-excellent {
  background: #d4edda;
  color: #155724;
}

.fortune-good {
  background: #cce5ff;
  color: #004085;
}

.fortune-neutral {
  background: #e2e3e5;
  color: #383d41;
}

.fortune-challenging {
  background: #fff3cd;
  color: #856404;
}

.fortune-difficult {
  background: #f8d7da;
  color: #721c24;
}

.domain-content h5 {
  margin: 15px 0 10px 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.domain-content ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.domain-periods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 15px;
}

.periods-column h5 {
  margin-top: 0;
}

/* 宮位解讀樣式 */
.palace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.palace-tab-button {
  padding: 8px 16px;
  border: none;
  background: #e9ecef;
  color: #495057;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.palace-tab-button.active,
.palace-tab-button:hover {
  background: #3498db;
  color: white;
}

.palace-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.palace-content h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.palace-section {
  margin-bottom: 20px;
}

.palace-section h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.trait-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trait-tag {
  background: #e9ecef;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
}

.palace-section ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .chart-grid {
    grid-template-rows: repeat(4, minmax(100px, auto));
  }
  
  .chart-grid.detailed {
    grid-template-rows: repeat(4, minmax(120px, auto));
  }
  
  .chart-info {
    flex-direction: column;
    gap: 15px;
  }
  
  .chart-controls {
    flex-direction: column;
  }
  
  .palace-cell {
    padding: 6px;
  }
  
  .star-item {
    font-size: 0.8rem;
    padding: 2px 4px;
  }
  
  .cycles-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .chart-grid {
    grid-template-rows: repeat(4, minmax(80px, auto));
  }
  
  .palace-cell {
    padding: 4px;
  }
  
  .palace-name, .palace-zhi {
    font-size: 0.8rem;
  }
  
  .star-item {
    font-size: 0.75rem;
    padding: 1px 3px;
  }
}
</style>
