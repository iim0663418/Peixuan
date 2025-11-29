<template>
  <div class="purple-star-container">
    <!-- 主要內容區域 -->
    <div
      class="main-content"
      :class="{ 'with-sidebar': showIntegratedAnalysis }"
    >
      <el-row :gutter="20">
        <el-col :span="24" class="mb-4">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>{{ $t('astrology.purple_star_detail.title') }}</span>
                <div class="header-actions">
                  <el-button
                    v-if="purpleStarChart && birthInfoForIntegration"
                    type="success"
                    :icon="Connection"
                    :loading="integratedAnalysisLoading"
                    @click="toggleIntegratedAnalysis"
                  >
                    {{ showIntegratedAnalysis ? '隱藏' : '綜合解讀' }}
                  </el-button>
                  <el-button
                    v-if="purpleStarChart"
                    type="danger"
                    :icon="Delete"
                    size="small"
                    @click="clearData"
                  >
                    清除資料
                  </el-button>
                </div>
              </div>
            </template>

            <div class="view-description">
              <p>{{ $t('astrology.purple_star_detail.description') }}</p>
              <el-alert
                v-if="purpleStarChart && !showIntegratedAnalysis"
                title="💡 提示"
                description="您可以點擊右上角「綜合解讀」來獲得八字與紫微斗數的全面人生解讀"
                type="info"
                :closable="false"
                show-icon
                class="mt-3 text-center-alert"
                style="
                  text-align: center;
                  display: flex;
                  justify-content: center;
                "
              />

              <!-- 添加儲存狀態指示器 -->
              <StorageStatusIndicator class="mt-3" />
            </div>
          </el-card>
        </el-col>

        <el-col
:xs="24"
:sm="24" :md="12" :lg="12"
:xl="12"
>
          <el-card shadow="hover">
            <template #header>
              <span>{{ $t('astrology.purple_star_detail.inputSection') }}</span>
            </template>

            <PurpleStarInputForm @submit="handleSubmit" />
          </el-card>
        </el-col>

        <el-col
:xs="24"
:sm="24" :md="12" :lg="12"
:xl="12"
>
          <el-card v-if="purpleStarChart" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>分析結果</span>
              </div>
            </template>

            <PurpleStarChartDisplay
              ref="purpleStarChartRef"
              :chart-data="purpleStarChart"
              :is-loading="false"
              :show-cycles-detail="true"
              :display-depth="displayMode"
              @update:display-depth="changeDisplayMode"
            />

            <!-- 四化飛星顯示組件 -->
            <TransformationStarsDisplay
              v-if="Object.keys(transformationFlows).length > 0"
              :chart-data="purpleStarChart"
              :ming-gan="purpleStarChart.mingGan || ''"
              :display-mode="displayMode"
              :transformation-flows="transformationFlows"
              :transformation-combinations="transformationCombinations || []"
              :multi-layer-energies="multiLayerEnergies"
              class="mt-4"
              @update:display-mode="changeDisplayMode"
            />

            <!-- 四化飛星資料缺失提示 -->
            <el-alert
              v-else-if="
                displayMode !== 'minimal' &&
                Object.keys(transformationFlows).length === 0 &&
                purpleStarChart
              "
              title="四化飛星資料缺失"
              :description="`當前命盤缺少四化飛星資料。命宮天干：${purpleStarChart.mingGan || '未知'}，請檢查API響應是否包含四化資料。`"
              type="warning"
              :closable="false"
              class="mt-4"
            />
          </el-card>

          <el-card v-else shadow="hover">
            <div class="placeholder">
              <el-icon :size="64" color="#c0c4cc">
                <StarFilled />
              </el-icon>
              <p>請填寫左側表單開始分析</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 三段式智慧解讀儀表板側邊欄 -->
    <el-drawer
      v-model="showIntegratedAnalysis"
      title="綜合人生解讀儀表板"
      direction="rtl"
      size="50%"
      :before-close="handleSidebarClose"
      class="intelligent-dashboard-drawer"
    >
      <div class="dashboard-sidebar-container">
        <!-- 載入狀態 -->
        <div v-if="integratedAnalysisLoading" class="analysis-loading">
          <el-icon :size="60" class="is-loading"><Loading /></el-icon>
          <h3>正在準備智慧解讀...</h3>
          <p>系統正在整合命盤資料，為您準備全面的人生解讀</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ currentLoadingStep }}</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="integratedAnalysisError" class="analysis-error">
          <el-alert
            :title="integratedAnalysisError"
            type="error"
            :closable="false"
            show-icon
          />
          <el-button
            type="primary"
            class="retry-btn"
            @click="performIntegratedAnalysis"
          >
            重試分析
          </el-button>
        </div>

        <!-- 主要儀表板內容 -->
        <div v-else class="dashboard-main-content">
          <!-- 如果沒有命盤資料，顯示提示 -->
          <div v-if="!purpleStarChart" class="no-chart-notice">
            <el-icon :size="48" color="#c0c4cc"><StarFilled /></el-icon>
            <h3>請先計算命盤</h3>
            <p>
              請先在左側輸入出生資訊並計算紫微斗數命盤，然後即可使用智慧解讀功能。
            </p>
          </div>

          <!-- 三段式智慧解讀儀表板 -->
          <div v-else class="intelligent-dashboard-content">
            <div class="dashboard-header">
              <!-- 手動更新控制區 -->
              <div class="dashboard-controls">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Refresh"
                  title="強制更新所有儀表板組件"
                  class="refresh-dashboard-btn"
                  @click="forceRefreshDashboard"
                >
                  更新儀表板
                </el-button>
                <el-tag v-if="lastDashboardUpdate" size="small" type="info">
                  更新: {{ lastDashboardUpdate }}
                </el-tag>
              </div>

              <div class="dashboard-tabs">
                <button
                  :class="{ active: interpretationMode === 'fortune' }"
                  class="dashboard-tab-button"
                  @click="setInterpretationMode('fortune')"
                >
                  <span class="tab-icon">📊</span>
                  綜合人生解讀
                </button>
                <button
                  :class="{ active: interpretationMode === 'currentYear' }"
                  class="dashboard-tab-button"
                  @click="setInterpretationMode('currentYear')"
                >
                  <span class="tab-icon">🎯</span>
                  今年運勢分析
                </button>
              </div>
            </div>

            <div class="dashboard-content">
              <!-- 綜合人生解讀 -->
              <div
                v-if="interpretationMode === 'fortune'"
                class="dashboard-panel"
              >
                <FortuneOverview
                  :chart-data="purpleStarChart"
                  :transformation-flows="transformationFlows"
                  :multi-layer-energies="multiLayerEnergies"
                  @palace-click="handleFortuneOverviewPalaceClick"
                  @talent-click="handleTalentClick"
                  @potential-click="handlePotentialClick"
                />
              </div>

              <!-- 今年運勢分析 -->
              <div
                v-if="interpretationMode === 'currentYear'"
                class="dashboard-panel"
              >
                <CurrentYearFortune
                  :chart-data="purpleStarChart"
                  :transformation-flows="transformationFlows"
                  :multi-layer-energies="multiLayerEnergies"
                  @palace-click="handleFortuneOverviewPalaceClick"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  inject,
  nextTick,
  defineAsyncComponent,
} from 'vue';
import { useBreakpoints } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  StarFilled,
  Connection,
  Loading,
  Delete,
  Refresh,
} from '@element-plus/icons-vue';

// 動態導入組件以提升效能
const PurpleStarInputForm = defineAsyncComponent(
  () => import('@/components/PurpleStarInputForm.vue'),
);
const PurpleStarChartDisplay = defineAsyncComponent(
  () => import('@/components/PurpleStarChartDisplay.vue'),
);
const TransformationStarsDisplay = defineAsyncComponent(
  () => import('@/components/TransformationStarsDisplay.vue'),
);
const StorageStatusIndicator = defineAsyncComponent(
  () => import('@/components/StorageStatusIndicator.vue'),
);
const FortuneOverview = defineAsyncComponent(
  () => import('@/components/FortuneOverview.vue'),
);
const CurrentYearFortune = defineAsyncComponent(
  () => import('@/components/CurrentYearFortune.vue'),
);
import apiService from '@/services/apiService';
import astrologyIntegrationService from '@/services/astrologyIntegrationService';
import storageService from '@/utils/storageService';
import enhancedStorageService from '@/utils/enhancedStorageService';
import { useDisplayMode } from '@/composables/useDisplayMode';
import type { DisplayMode } from '@/types/displayModes';
import type {
  PurpleStarChart,
  IntegratedAnalysisResponse,
  PurpleStarAPIResponse,
} from '@/types/astrologyTypes';

// 確保 session ID 存在
const _sessionId = storageService.getOrCreateSessionId();

// 注入全域顯示狀態
const globalDisplayState = inject('globalDisplayState') as {
  activeModule: { value: string };
  setActiveModule: (_module: string) => void;
} | null;

// 主要狀態
const purpleStarChart = ref<PurpleStarChart | null>(null);
const purpleStarChartRef = ref<any>(null);
const birthInfoForIntegration = ref<any>(null);
const transformationFlows = ref<Record<number, any>>({});
const transformationCombinations = ref<Array<any>>([]);
const multiLayerEnergies = ref<Record<number, any>>({});

// 儀表板手動更新相關
const lastDashboardUpdate = ref<string>('');
const dashboardUpdateKey = ref(0);

// 使用顯示模式 composable（作為後備）
const { displayMode: localDisplayMode, mapDepthToMode: _mapDepthToMode } =
  useDisplayMode('purpleStar');

// 監聽本地顯示模式的變化
watch(
  () => localDisplayMode.value,
  (newMode) => {
    console.log(`PurpleStarView: localDisplayMode 變化為 ${newMode}`);
  },
  { immediate: true },
);

// 計算顯示模式 - 只使用本地顯示模式，避免多重系統衝突
const displayMode = computed(() => {
  console.log(`PurpleStarView: 使用本地顯示模式=${localDisplayMode.value}`);
  return localDisplayMode.value;
});

// 監聽全域狀態變化，同步到本地 composable
// 注意：簡化版的 globalDisplayState 不再包含 moduleDepths，所以這個監聽器暫時禁用
// watch(() => globalDisplayState?.moduleDepths?.value?.purpleStar, (newDepth) => {
//   if (newDepth && newDepth !== localDisplayMode.value) {
//     localDisplayMode.value = newDepth;
//     console.log(`PurpleStarView: 同步全域狀態到本地 composable: ${newDepth}`);
//   }
// }, { immediate: true });

// 顯示模式選項
const _displayModeOptions = [
  {
    value: 'minimal',
    label: '簡要預覽',
    tooltip: '最簡潔的命盤展示，僅呈現基本框架',
  },
  {
    value: 'compact',
    label: '精簡檢視',
    tooltip: '顯示主要星曜和基本四化效應，快速了解命盤特點',
  },
  {
    value: 'standard',
    label: '標準解讀',
    tooltip: '完整展示星曜資訊和四化效應，深入解析命盤結構',
  },
  {
    value: 'comprehensive',
    label: '深度分析',
    tooltip: '全面詳盡的命盤分析，包含所有星曜、四化組合和多層次能量疊加',
  },
];

const _dataCompleteness = computed(() => {
  if (!purpleStarChart.value) {
    return 0;
  }

  let completeness = 0;

  // 基礎命盤数据 (40%)
  if (
    purpleStarChart.value.palaces &&
    purpleStarChart.value.palaces.length > 0
  ) {
    completeness += 40;
  }

  // 四化飞星数据 (30%)
  if (Object.keys(transformationFlows.value).length > 0) {
    completeness += 30;
  }

  // 多层次能量数据 (20%)
  if (Object.keys(multiLayerEnergies.value).length > 0) {
    completeness += 20;
  }

  // 特殊组合数据 (10%)
  if (
    transformationCombinations.value &&
    transformationCombinations.value.length > 0
  ) {
    completeness += 10;
  }

  return Math.min(completeness, 100);
});

// 切換顯示模式
const changeDisplayMode = (mode: DisplayMode) => {
  console.log(`PurpleStarView: changeDisplayMode 被調用，mode=${mode}`);
  localDisplayMode.value = mode;
};

// 處理顯示模式更新

// 整合分析狀態
const showIntegratedAnalysis = ref(false);
const integratedAnalysisLoading = ref(false);
const integratedAnalysisResult = ref<IntegratedAnalysisResponse | null>(null);
const integratedAnalysisError = ref<string | null>(null);
const loadingProgress = ref(0);
const currentLoadingStep = ref('正在準備分析...');

// 綜合人生解讀儀表板狀態
const interpretationMode = ref<'fortune' | 'currentYear'>('fortune');

// 響應式斷點檢測
const responsiveBreakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
});

const _isMobile = responsiveBreakpoints.smaller('mobile');

// 計算屬性
const _integratedAnalysisTitle = computed(() => {
  return integratedAnalysisResult.value ? '綜合解讀結果' : '綜合人生解讀';
});

// 分析完整度計算
const _analysisCompleteness = computed(() => {
  if (!integratedAnalysisResult.value) {
    return 0;
  }

  try {
    const confidence =
      integratedAnalysisResult.value.data?.analysisInfo?.confidence || 0;
    return Math.round(confidence * 100);
  } catch (error) {
    console.error('計算分析完整度時出錯:', error);
    return 0;
  }
});

// 綜合人生解讀儀表板相關函數
const setInterpretationMode = (mode: 'fortune' | 'currentYear') => {
  interpretationMode.value = mode;
};

// 強制更新儀表板
const forceRefreshDashboard = () => {
  console.log('=== 手動強制更新儀表板 ===');
  console.log('當前 purpleStarChart:', purpleStarChart.value);
  console.log('宮位數量:', purpleStarChart.value?.palaces?.length || 0);
  console.log('當前解讀模式:', interpretationMode.value);

  // 更新時間戳記
  lastDashboardUpdate.value = new Date().toLocaleTimeString('zh-TW');

  // 增加更新鍵值強制組件重新渲染
  dashboardUpdateKey.value++;
  console.log('新的更新鍵值:', dashboardUpdateKey.value);

  // 觸發全域事件通知所有組件更新
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('purpleStarChartUpdated', {
        detail: {
          chart: purpleStarChart.value,
          updateKey: dashboardUpdateKey.value,
          timestamp: new Date().toISOString(),
          source: 'manualRefresh',
        },
      }),
    );
    console.log('已發送 purpleStarChartUpdated 全域事件');
  }

  // 強制更新當前命盤資料
  if (purpleStarChart.value) {
    const currentChart = { ...purpleStarChart.value };
    purpleStarChart.value = null;

    nextTick(() => {
      purpleStarChart.value = currentChart;
      console.log('儀表板已強制更新，當前模式:', interpretationMode.value);
      console.log('更新後命盤資料:', purpleStarChart.value);
      ElMessage.success(`儀表板已更新 (${lastDashboardUpdate.value})`);
    });
  } else {
    console.log('沒有命盤資料可供更新');
    ElMessage.warning('沒有可用的命盤資料');
  }
};

// Fortune Overview 事件處理
const handleFortuneOverviewPalaceClick = (palaceIndex: number) => {
  console.log('Fortune Overview 宮位點擊:', palaceIndex);

  // 自動收合側邊欄以提供更好的命盤查看體驗
  const shouldCloseSidebar = showIntegratedAnalysis.value;
  if (shouldCloseSidebar) {
    showIntegratedAnalysis.value = false;
    console.log('自動收合側邊欄以便查看命盤');
    ElMessage.info('正在導航到命盤宮位...');
  }

  // 如果當前在智慧解讀模式，自動收合側邊欄並導航到命盤
  if (!shouldCloseSidebar) {
    ElMessage.info('正在導航到命盤宮位...');
  }

  // 直接跳轉，但要等待側邊欄動畫完成
  const delay = shouldCloseSidebar ? 400 : 0;
  setTimeout(() => {
    if (purpleStarChartRef.value) {
      purpleStarChartRef.value.handleFortuneOverviewPalaceClick(palaceIndex);
    }
  }, delay);
};

const handleTalentClick = (talent: any) => {
  console.log('天賦點擊:', talent);
  // 添加更詳細的用戶反饋
  if (talent.palaceIndex !== undefined) {
    handleFortuneOverviewPalaceClick(talent.palaceIndex);
  } else {
    console.warn('天賦項目缺少宮位索引:', talent);
    ElMessage.warning('無法定位到對應的命盤宮位');
  }
};

const handlePotentialClick = (potential: any) => {
  console.log('潛能點擊:', potential);
  // 添加更詳細的用戶反饋
  if (potential.palaceIndex !== undefined) {
    handleFortuneOverviewPalaceClick(potential.palaceIndex);
  } else {
    console.warn('潛能項目缺少宮位索引:', potential);
    ElMessage.warning('無法定位到對應的命盤宮位');
  }
};

// 資料清除函數
const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要清除基本命盤資料嗎？（四化飛星資料將保留）',
      '清除資料',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    // 只清除基本資料，保留四化飛星
    storageService.clearAnalysisData('purpleStar');
    purpleStarChart.value = null;
    birthInfoForIntegration.value = null;
    ElMessage.success('紫微斗數基本資料已清除（四化飛星資料已保留）');
  } catch (error) {
    // 用戶取消或詢問是否全部清除
    try {
      await ElMessageBox.confirm(
        '是否要清除包括四化飛星在內的所有資料？',
        '全部清除',
        {
          confirmButtonText: '全部清除',
          cancelButtonText: '取消',
          type: 'error',
        },
      );

      storageService.clearAnalysisData('purpleStarAll');
      purpleStarChart.value = null;
      birthInfoForIntegration.value = null;
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
      ElMessage.success('所有紫微斗數資料已清除');
    } catch (finalError) {
      // 用戶最終取消
    }
  }
};

// 主要提交處理
const handleSubmit = async (birthInfo: any) => {
  try {
    // 使用 console.group 組織日誌輸出
    console.group('紫微斗數API調用');
    ElMessage.info('正在計算紫微斗數命盤...');

    // 保存出生資訊用於整合分析
    birthInfoForIntegration.value = birthInfo;

    // 保存出生資訊到 sessionStorage
    storageService.saveToStorage(
      storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO,
      birthInfo,
    );

    // 構建包含完整選項的請求資料
    const requestData = {
      ...birthInfo,
      options: {
        includeMajorCycles: true,
        includeMinorCycles: true,
        includeAnnualCycles: true, // 確保流年太歲計算被啟用
        detailLevel: 'advanced',
        includeFourTransformations: true, // 明確請求四化飛星資料
        maxAge: 100,
      },
    };

    console.log('發送請求資料:', requestData);
    console.log('請求選項配置:', requestData.options);

    // 使用後端 API 進行紫微斗數計算
    const response = (await apiService.calculatePurpleStar(
      requestData,
    )) as unknown as PurpleStarAPIResponse;

    // 詳細記錄 API 響應結構
    console.log('API 響應狀態:', response ? '成功' : '空響應');
    console.log('API 響應頂層鍵:', Object.keys(response || {}));
    console.log('API data 存在:', !!response?.data);
    console.log('API data 鍵:', Object.keys(response?.data || {}));

    // 檢查命盤資料完整性
    if (!response?.data?.chart) {
      console.error('API 未返回紫微斗數命盤資料');
      throw new Error('紫微斗數命盤資料缺失');
    }

    // 記錄命盤基本資訊
    console.log('命盤資料:', response.data.chart);
    console.log('命宮天干:', response.data.chart.mingGan || '未返回命宮天干');
    console.log('大限資訊:', response.data.chart.daXian || '無大限資訊');
    console.log('小限資訊:', response.data.chart.xiaoXian || '無小限資訊');
    console.log(
      '流年太歲資訊:',
      response.data.chart.liuNianTaiSui || '無流年太歲資訊',
    );

    // 正確提取命盤資料
    purpleStarChart.value = response.data.chart;

    // 自動觸發儀表板更新
    dashboardUpdateKey.value++;
    lastDashboardUpdate.value = new Date().toLocaleTimeString('zh-TW');

    // 發送全域事件通知所有組件更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('purpleStarChartUpdated', {
          detail: {
            chart: purpleStarChart.value,
            updateKey: dashboardUpdateKey.value,
            timestamp: new Date().toISOString(),
            source: 'apiResponse',
          },
        }),
      );
    }

    console.log('紫微斗數資料已更新，儀表板同步更新');

    // 檢查四化飛星資料
    console.log('四化飛星資料存在:', !!response.data.transformations);

    // 提取四化飛星資料
    if (response.data.transformations) {
      transformationFlows.value = response.data.transformations.flows || {};
      transformationCombinations.value =
        response.data.transformations.combinations || [];
      multiLayerEnergies.value =
        response.data.transformations.layeredEnergies || {};

      // 詳細記錄四化飛星資料結構
      console.log('四化飛星資料載入成功:', {
        flows: Object.keys(transformationFlows.value).length,
        combinations: transformationCombinations.value.length,
        layeredEnergies: Object.keys(multiLayerEnergies.value).length,
      });

      // 檢查資料的具體內容
      if (Object.keys(transformationFlows.value).length === 0) {
        console.warn('四化飛星flows資料為空，可能影響顯示');
      } else {
        console.log(
          '四化飛星flows資料樣本:',
          Object.keys(transformationFlows.value).slice(0, 3),
        );
      }
    } else {
      console.error('API 未返回四化飛星資料，詳細檢查API響應結構');
      console.log('API響應的完整data結構鍵:', Object.keys(response.data));

      // 檢查是否有其他可能的四化資料字段
      const possibleKeys = [
        'fourTransformations',
        'sihua',
        'transformedStars',
        'starTransformations',
      ];
      const responseData = response.data as any; // 臨時類型轉換以處理動態屬性訪問
      const foundAlternative = possibleKeys.find((key) => responseData[key]);

      if (foundAlternative) {
        console.log(
          `發現替代四化資料字段: ${foundAlternative}`,
          responseData[foundAlternative],
        );
      }

      // 清空相關引用避免錯誤
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};

      // 提示用戶有資料缺失
      ElMessage.warning({
        message: '四化飛星資料缺失，部分分析功能將不可用。請檢查後端API配置。',
        duration: 5000,
      });
    }

    // 保存命盤資料到 sessionStorage
    storageService.saveToStorage(
      storageService.STORAGE_KEYS.PURPLE_STAR_CHART,
      response.data.chart,
    );

    // 保存四化飛星資料到 sessionStorage
    if (response.data.transformations) {
      console.log('保存四化飛星資料到 sessionStorage');
      const transformations = response.data.transformations as any; // 臨時類型轉換
      storageService.saveTransformationStarsData(
        transformations.stars || null,
        transformations.flows || {},
        transformations.combinations || [],
        transformations.layeredEnergies || {},
      );
    } else {
      console.warn('API 響應中沒有四化飛星資料，無法保存');
    }

    console.groupEnd();
    ElMessage.success('紫微斗數計算完成');
  } catch (error: any) {
    // 確保關閉日誌組
    console.groupEnd();

    // 詳細記錄錯誤資訊
    console.error('紫微斗數計算錯誤:', error);
    console.error('錯誤類型:', error.constructor.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤堆疊:', error.stack);

    // 提供用戶友好的錯誤訊息
    const errorMessage = error.message || '未知錯誤';
    ElMessage.error({
      message: `紫微斗數計算失敗: ${errorMessage}`,
      duration: 6000,
    });
  }
};

// 整合分析相關功能
const toggleIntegratedAnalysis = () => {
  const wasOpen = showIntegratedAnalysis.value;
  showIntegratedAnalysis.value = !wasOpen;

  console.log(`PurpleStarView: 整合分析切換為 ${showIntegratedAnalysis.value}`);

  // 立即切換全域模組
  if (globalDisplayState) {
    const targetModule = showIntegratedAnalysis.value
      ? 'integrated'
      : 'purpleStar';
    globalDisplayState.setActiveModule(targetModule);
    console.log(`PurpleStarView: 立即切換全域模組到 ${targetModule}`);
  }
};

const handleSidebarClose = (done: () => void) => {
  if (integratedAnalysisLoading.value) {
    ElMessageBox.confirm('分析正在進行中，確定要關閉嗎？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        done();
      })
      .catch(() => {
        // 用戶取消關閉
      });
  } else {
    done();
  }
};

const performIntegratedAnalysis = async () => {
  if (!birthInfoForIntegration.value) {
    ElMessage.warning('請先完成紫微斗數計算');
    return;
  }

  try {
    integratedAnalysisLoading.value = true;
    integratedAnalysisError.value = null;
    loadingProgress.value = 0;
    currentLoadingStep.value = '正在準備解讀...';

    // 進度更新函數
    const updateProgress = (step: string, progress: number) => {
      currentLoadingStep.value = step;
      loadingProgress.value = progress;
    };

    updateProgress('正在計算八字命盤...', 20);

    // 確保位置資料格式正確
    const locationValue =
      typeof birthInfoForIntegration.value.location === 'string'
        ? birthInfoForIntegration.value.location
        : birthInfoForIntegration.value.location?.name || '台北市';

    // 構建整合分析請求
    const analysisRequest = {
      birthDate: birthInfoForIntegration.value.birthDate,
      birthTime: birthInfoForIntegration.value.birthTime,
      gender: birthInfoForIntegration.value.gender,
      location: locationValue,
      // 使用新版API的分析選項
      options: {
        useAdvancedAlgorithm: true,
        includeCrossVerification: true,
        includeRealTimeData: true,
        confidenceScoring: true,
      },
    };

    console.log('發送綜合解讀請求:', analysisRequest);

    updateProgress('正在整合紫微斗數與八字的傳統智慧...', 50);

    try {
      // 調用整合分析服務，啟用使用 session 中的命盤資料
      const result =
        await astrologyIntegrationService.performIntegratedAnalysis(
          analysisRequest,
          true,
        );

      updateProgress('正在分析人生特質與運勢走向...', 80);

      // 獲取額外的解讀完整度評估 (使用 try/catch 避免此步驟失敗影響整體流程)
      try {
        const confidenceResult =
          await astrologyIntegrationService.getConfidenceAssessment(
            analysisRequest,
          );
        console.log('解讀完整度評估結果:', confidenceResult);
      } catch (confidenceError) {
        console.warn(
          '解讀完整度評估獲取失敗，但不影響主要解讀:',
          confidenceError,
        );
      }

      updateProgress('正在生成人生指導建議...', 95);

      // 整合最終結果
      integratedAnalysisResult.value = result;

      // 保存整合分析結果到 sessionStorage
      storageService.saveToStorage(
        storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS,
        result,
      );

      loadingProgress.value = 100;
      currentLoadingStep.value = '解讀完成!';

      ElMessage.success('綜合人生解讀完成');
    } catch (apiError: any) {
      console.error('API 請求失敗:', apiError);
      const errorMessage = apiError.response?.data?.error || apiError.message;
      integratedAnalysisError.value = `綜合解讀API錯誤: ${errorMessage}`;
      ElMessage.error(`綜合解讀API錯誤: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('綜合解讀失敗:', error);
    const errorMessage =
      error.response?.data?.error || error.message || '綜合解讀失敗';
    integratedAnalysisError.value = errorMessage;
    ElMessage.error(errorMessage);
  } finally {
    integratedAnalysisLoading.value = false;
  }
};

const exportAnalysisResult = () => {
  if (!integratedAnalysisResult.value) {
    ElMessage.warning('沒有可匯出的解讀結果');
    return;
  }

  try {
    // 構建匯出資料
    const exportData = {
      readingDate: new Date().toLocaleDateString('zh-TW'),
      completeness: integratedAnalysisResult.value.data.analysisInfo.confidence,
      consensusFindings:
        integratedAnalysisResult.value.data.integratedAnalysis
          .consensusFindings,
      divergentFindings:
        integratedAnalysisResult.value.data.integratedAnalysis
          .divergentFindings,
      recommendations:
        integratedAnalysisResult.value.data.integratedAnalysis.recommendations,
      methodsUsed: integratedAnalysisResult.value.data.analysisInfo.methodsUsed,
    };

    // 創建下載鏈接
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `綜合人生解讀報告_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ElMessage.success('解讀報告已匯出');
  } catch (error) {
    console.error('匯出失敗:', error);
    ElMessage.error('匯出失敗，請稍後再試');
  }
};

// 從 sessionStorage 加載資料
const loadFromSessionStorage = () => {
  try {
    console.log('開始從 sessionStorage 載入紫微斗數資料');

    // 記錄當前 sessionStorage 狀態
    const keysInStorage = Object.keys(sessionStorage).filter((key) =>
      key.startsWith('peixuan_'),
    );

    console.log('sessionStorage 中的相關鍵:', keysInStorage);

    // 檢查出生資訊
    const savedBirthInfo = storageService.getFromStorage(
      storageService.STORAGE_KEYS.PURPLE_STAR_BIRTH_INFO,
    );
    if (savedBirthInfo) {
      console.log('找到保存的紫微斗數出生資訊');
      birthInfoForIntegration.value = savedBirthInfo;
    } else {
      console.log('未找到保存的紫微斗數出生資訊');
    }

    // 檢查紫微斗數命盤
    const savedPurpleStarChart = storageService.getFromStorage<PurpleStarChart>(
      storageService.STORAGE_KEYS.PURPLE_STAR_CHART,
    );
    if (savedPurpleStarChart) {
      console.log('找到保存的紫微斗數命盤資料');
      try {
        // 進行基本的資料驗證，確保資料完整性
        if (
          !savedPurpleStarChart.palaces ||
          !Array.isArray(savedPurpleStarChart.palaces) ||
          savedPurpleStarChart.palaces.length === 0
        ) {
          console.warn('保存的紫微斗數命盤資料缺少宮位資訊');
          throw new Error('命盤資料不完整');
        }

        purpleStarChart.value = savedPurpleStarChart as PurpleStarChart;

        // 發送全域事件通知組件資料已從 sessionStorage 載入
        window.dispatchEvent(
          new CustomEvent('purple-star-chart-updated', {
            detail: {
              chartData: savedPurpleStarChart,
              timestamp: Date.now(),
              source: 'session-storage',
            },
          }),
        );
      } catch (parseError) {
        console.error('解析保存的紫微斗數命盤資料時出錯:', parseError);
        // 不設置命盤資料，確保資料完整性
      }
    } else {
      console.log('未找到保存的紫微斗數命盤資料');
    }

    // 檢查整合分析結果
    const savedIntegratedAnalysis =
      storageService.getFromStorage<IntegratedAnalysisResponse>(
        storageService.STORAGE_KEYS.INTEGRATED_ANALYSIS,
      );
    if (savedIntegratedAnalysis) {
      console.log('找到保存的整合分析結果');
      try {
        // 驗證整合分析資料
        if (
          !savedIntegratedAnalysis.data ||
          !savedIntegratedAnalysis.data.integratedAnalysis
        ) {
          console.warn('保存的整合分析結果缺少必要的分析資料');
          throw new Error('整合分析資料不完整');
        }

        integratedAnalysisResult.value =
          savedIntegratedAnalysis as IntegratedAnalysisResponse;
      } catch (parseError) {
        console.error('解析保存的整合分析結果時出錯:', parseError);
        // 清除可能損壞的資料
        storageService.clearAnalysisData('integrated');
      }
    } else {
      console.log('未找到保存的整合分析結果');
    }

    // 檢查並載入四化飛星資料
    console.log('檢查四化飛星資料...');
    const transformationData = storageService.getTransformationStarsData();

    if (
      transformationData.flows &&
      Object.keys(transformationData.flows).length > 0
    ) {
      console.log('找到保存的四化飛星資料:', {
        flows: Object.keys(transformationData.flows).length,
        combinations: transformationData.combinations.length,
        multiLayerEnergies: Object.keys(transformationData.multiLayerEnergies)
          .length,
        stars: !!transformationData.stars,
      });

      transformationFlows.value = transformationData.flows;
      transformationCombinations.value = transformationData.combinations;
      multiLayerEnergies.value = transformationData.multiLayerEnergies;

      if (transformationData.stars) {
        // 如果有四化星曜資料，也可以載入
        console.log('載入四化星曜資料');
      }
    } else {
      console.log('未找到保存的四化飛星資料');
      transformationFlows.value = {};
      transformationCombinations.value = [];
      multiLayerEnergies.value = {};
    }

    // 驗證資料一致性
    try {
      console.log('使用增強版存儲服務驗證紫微斗數資料');
      enhancedStorageService.validateStorageData();
    } catch (validateError) {
      console.error('驗證紫微斗數資料時出錯:', validateError);
    }

    console.log('從 sessionStorage 載入的紫微斗數資料總結:', {
      birthInfo: !!birthInfoForIntegration.value,
      purpleStarChart: !!purpleStarChart.value,
      integratedAnalysis: !!integratedAnalysisResult.value,
    });
  } catch (error: unknown) {
    console.error('從 sessionStorage 載入紫微斗數資料時出錯:', error);
    // 只在確實有資料損壞時才清除，避免誤刪有效資料
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes('Unexpected token')
    ) {
      console.warn('檢測到 JSON 解析錯誤，清除可能損壞的資料');
      storageService.clearAnalysisData('purpleStar');
    } else {
      console.warn('載入錯誤可能是暫時性的，保留現有資料');
    }
  }
};

// 確保在組件掛載前設置好所有生命週期鉤子，避免異步問題
const setupComponentData = () => {
  loadFromSessionStorage();
};

// 監聽全域顯示狀態變化
watch(
  () => showIntegratedAnalysis.value,
  (newValue) => {
    if (globalDisplayState) {
      // 當進入/離開整合分析時，切換對應的全域模組
      const targetModule = newValue ? 'integrated' : 'purpleStar';
      globalDisplayState.setActiveModule(targetModule);
      console.log(`PurpleStarView: 切換到全域模組 ${targetModule}`);
    }
  },
  { immediate: false },
);

// 監聽全域狀態變化，同步到本地狀態
watch(
  () => globalDisplayState?.activeModule.value,
  (newModule) => {
    console.log(`PurpleStarView: 全域模組變更為 ${newModule}`);
  },
  { immediate: true },
);

// 監聽全域狀態變化事件
onMounted(() => {
  // 監聽全域狀態變化
  const handleGlobalStateChange = (event: CustomEvent) => {
    console.log('PurpleStarView: 收到全域狀態變化事件', event.detail);
  };

  window.addEventListener(
    'global-display-state-changed',
    handleGlobalStateChange as EventListener,
  );

  // 清理事件監聽器
  watch(
    () => null,
    () => {
      window.removeEventListener(
        'global-display-state-changed',
        handleGlobalStateChange as EventListener,
      );
    },
  );
});

// 生命週期鉤子 - 組件掛載時載入資料
onMounted(() => {
  console.log('PurpleStarView 組件已掛載');
  try {
    setupComponentData();
    // useDisplayMode composable 會自動從 localStorage 加載顯示偏好

    // 初始化全域狀態同步
    if (globalDisplayState) {
      console.log('PurpleStarView: 全域顯示狀態可用，初始化同步');
      // 設置當前模組為 purpleStar
      globalDisplayState.setActiveModule('purpleStar');

      // 將本地狀態同步到全域狀態（簡化版不再需要此步驟）
      const currentLocalDepth = localDisplayMode.value;
      // globalDisplayState.setDisplayDepth('purpleStar', currentLocalDepth); // 簡化版不再支援此方法
      console.log(
        `PurpleStarView: 使用本地深度 ${currentLocalDepth}，無需同步到全域狀態`,
      );
    } else {
      console.warn('PurpleStarView: 全域顯示狀態不可用，使用本地狀態');
    }
  } catch (error: unknown) {
    console.error('紫微斗數組件初始化過程中發生錯誤:', error);
    // 只在確實無法恢復時才清除資料
    if (
      error instanceof Error &&
      (error.name === 'SecurityError' || error.message.includes('quota'))
    ) {
      console.warn('儲存空間問題，清除資料以釋放空間');
      storageService.clearAnalysisData('purpleStar');
      ElMessage.warning('因儲存空間問題，已重置分析狀態');
    } else {
      console.warn('初始化錯誤可能是暫時性的，保留現有資料');
      ElMessage.info('載入時發生暫時性錯誤，請稍後再試');
    }
  }
});
</script>

<style scoped>
/* 確保 el-card__body 是一個定位上下文 */
:deep(.el-card__body) {
  position: relative;
  overflow: visible;
}
.purple-star-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  transition: all 0.3s ease;
}

.main-content.with-sidebar {
  margin-right: 20px;
}

/* 紫微斗數分層控制器樣式 */
.purple-star-controller {
  margin-left: 16px;
  min-width: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .purple-star-controller {
    margin-left: 0;
    margin-top: 8px;
    order: 1;
    width: 100%;
    min-width: unset;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    transition: margin-right 0.3s ease;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
}

.view-description {
  margin-bottom: 20px;
}

.view-description p {
  line-height: 1.6;
  color: #555;
}

.text-center-alert :deep(.el-alert__content) {
  margin: 0 auto;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #909399;
}

.placeholder p {
  margin-top: 20px;
}

/* 整合分析側邊欄樣式 */
.integrated-analysis-sidebar {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.analysis-intro {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.intro-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  text-align: center;
}

.intro-header h3 {
  margin-top: 15px;
  color: #409eff;
  font-size: 1.8rem;
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.intro-content p {
  margin: 0 0 25px 0;
  line-height: 1.6;
  font-size: 1.05rem;
  text-align: center;
  color: #606266;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.start-analysis-btn {
  margin-top: auto;
  align-self: center;
  padding: 12px 24px;
  font-size: 1.1rem;
}

/* 載入分析狀態 */
.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 20px;
}

.analysis-loading h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #409eff;
}

.analysis-loading p {
  margin-bottom: 30px;
  color: #606266;
}

.analysis-loading .el-progress {
  width: 100%;
  max-width: 400px;
  margin-bottom: 10px;
}

.loading-step {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #909399;
}

/* 分析結果 */
.result-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 15px;
}

/* 分析錯誤 */
.analysis-error {
  margin-top: 20px;
}

.retry-btn {
  margin-top: 15px;
}

/* 三段式智慧解讀儀表板側邊欄樣式 */
.intelligent-dashboard-drawer {
  --el-drawer-bg-color: #f8f9fa;
}

.dashboard-sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.dashboard-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-chart-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  flex: 1;
}

.no-chart-notice h3 {
  margin: 16px 0 8px 0;
  color: #606266;
  font-size: 1.2rem;
}

.no-chart-notice p {
  margin: 0;
  line-height: 1.6;
  font-size: 0.9rem;
}

.intelligent-dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafe 100%);
  border-radius: 20px;
  margin: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header {
  padding: 24px 24px 0 24px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 254, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  position: relative;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 20px 20px 0 0;
}

.dashboard-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.08) 0%,
    rgba(118, 75, 162, 0.08) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.dashboard-controls::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  pointer-events: none;
}

.refresh-dashboard-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.refresh-dashboard-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.refresh-dashboard-btn:hover::before {
  left: 100%;
}

.refresh-dashboard-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.dashboard-tabs {
  display: flex;
  gap: 6px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(248, 249, 250, 0.8) 100%
  );
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dashboard-tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.dashboard-tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0;
  transition: all 0.4s ease;
  z-index: -1;
  border-radius: 12px;
}

.dashboard-tab-button .tab-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.dashboard-tab-button.active {
  color: #ffffff;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dashboard-tab-button.active::before {
  opacity: 1;
}

.dashboard-tab-button.active .tab-icon {
  transform: scale(1.1);
}

.dashboard-tab-button:hover:not(.active) {
  color: #495057;
  background: #e9ecef;
  transform: translateY(-1px);
}

.tab-icon {
  font-size: 1rem;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 254, 0.95) 100%
  );
  position: relative;
}

.dashboard-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(102, 126, 234, 0.2),
    transparent
  );
}

.dashboard-panel {
  animation: fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: 100%;
  padding: 24px;
  position: relative;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 載入和錯誤狀態樣式調整 */
.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  flex: 1;
}

.analysis-error {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 無命盤資料狀態 */
.no-chart-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px;
}

.no-chart-data p {
  margin: 8px 0;
  line-height: 1.6;
}

.no-chart-data p:first-child {
  font-weight: 500;
  color: #495057;
  font-size: 1.1rem;
}

.no-chart-data p:last-child {
  font-size: 0.9rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .el-col {
    margin-bottom: 20px;
  }

  /* 側邊欄響應式調整 */
  .intelligent-dashboard-content {
    margin: 8px;
  }

  .dashboard-header {
    padding: 16px 16px 0 16px;
  }

  .dashboard-tabs {
    flex-direction: column;
    gap: 8px;
  }

  .dashboard-tab-button {
    padding: 8px 12px;
    justify-content: flex-start;
    font-size: 0.85rem;
  }
}
</style>
