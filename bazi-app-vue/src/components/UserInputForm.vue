<template>
  <div class="user-input-form">
    <h2>輸入您的生辰資訊</h2>
    <div v-if="activeCalendarLib === null" class="form-group error-banner">
      <p>警告：核心日曆庫加載失敗。{{ calendarLibLoadErrorText }}</p>
    </div>
    <div
      v-else-if="
        !isCalendarLibFullyAvailable &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      class="form-group error-banner"
      style="
        background-color: #fffbe6;
        color: #8a6d3b;
        border-left-color: #ffe58f;
      "
    >
      <p>提示：{{ calendarLibLoadErrorText }}</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>日期類型: </label>
        <select
          v-model="formState.calendarType"
          :disabled="activeCalendarLib === null"
        >
          <option value="solar">國曆</option>
          <option value="lunar" :disabled="activeCalendarLib === null">
            農曆
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="year">出生年份:</label>
        <input id="year" v-model.number="formState.year" type="number" />
      </div>
      <div class="form-group">
        <label for="month">出生月份:</label>
        <input
          id="month"
          v-model.number="formState.month"
          type="number"
          min="1"
          max="12"
        />
      </div>
      <div
        v-if="formState.calendarType === 'lunar' && activeCalendarLib !== null"
        class="form-group"
      >
        <label for="isLeapMonth">是否閏月:</label>
        <input
          id="isLeapMonth"
          v-model="formState.isLeapMonth"
          type="checkbox"
        />
      </div>
      <div class="form-group">
        <label for="day">出生日期:</label>
        <input
          id="day"
          v-model.number="formState.day"
          type="number"
          min="1"
          :max="maxDay"
        />
      </div>
      <div class="form-group">
        <label for="hour">出生小時 (0-23):</label>
        <input
          id="hour"
          v-model.number="formState.hour"
          type="number"
          min="0"
          max="23"
        />
      </div>
      <div class="form-group">
        <label for="minute">出生分鐘 (0-59):</label>
        <input
          id="minute"
          v-model.number="formState.minute"
          type="number"
          min="0"
          max="59"
        />
      </div>
      <div
        v-if="chineseHourDisplay && isCalendarLibFullyAvailable"
        class="form-group"
      >
        <label>對應時辰:</label>
        <p>{{ chineseHourDisplay }}</p>
      </div>
      <div class="form-group">
        <label>性別: </label>
        <select v-model="formState.gender">
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </div>
      <div class="form-group">
        <label for="timezone">時區:</label>
        <select id="timezone" v-model="formState.timezone">
          <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
            {{ tz.label }}
          </option>
        </select>
        <small>預設為您的本地時區。</small>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '計算中...' : '提交排盤' }}
        </button>
        <button
          type="button"
          class="button-secondary"
          :disabled="isLoading"
          @click="resetForm"
        >
          重置表單
        </button>
      </div>
      <div v-if="isLoading" class="loading-indicator">
        <p>正在為您排盤，請稍候...</p>
      </div>
    </form>

    <div class="section-card">
      <h4>流年分析</h4>
      <div class="form-group">
        <label for="yearlyFate">輸入或選擇流年 (西元年份):</label>
        <input
          id="yearlyFate"
          v-model.number="yearlyFateInput"
          type="number"
          placeholder="例如 2024"
          :disabled="!parsedBaziResult || isLoading"
        />
      </div>
      <YearlyFateTimeline
        v-if="formState.year && parsedBaziResult"
        :birth-year="formState.year"
        @year-selected="handleYearSelectedFromTimeline"
      />
    </div>

    <div
      v-if="parsedYearlyInteractionResult && yearlyFateInput"
      class="yearly-interaction-result section-card"
    >
      <h4>流年互動分析 ({{ yearlyFateInput }}年)</h4>
      <div v-if="parsedYearlyInteractionResult.yearStemInteractions.length > 0">
        <h5>天干互動:</h5>
        <ul>
          <li
            v-for="(
              interaction, index
            ) in parsedYearlyInteractionResult.yearStemInteractions"
            :key="'stem-' + index"
          >
            {{ interaction.description }}
          </li>
        </ul>
      </div>
      <div
        v-if="parsedYearlyInteractionResult.yearBranchInteractions.length > 0"
      >
        <h5>地支互動:</h5>
        <ul>
          <li
            v-for="(
              interaction, index
            ) in parsedYearlyInteractionResult.yearBranchInteractions"
            :key="'branch-' + index"
          >
            流年地支與{{ interaction.pillarName }}地支{{
              interaction.pillarBranch
            }}: {{ interaction.relations.relationDescription || '無特殊關係' }}
          </li>
        </ul>
      </div>
      <div
        v-if="parsedYearlyInteractionResult.significantInteractions.length > 0"
      >
        <h5>重要提示:</h5>
        <ul>
          <li
            v-for="(
              highlight, index
            ) in parsedYearlyInteractionResult.significantInteractions"
            :key="'highlight-' + index"
          >
            {{ highlight }}
          </li>
        </ul>
      </div>
      <p
        v-if="
          !parsedYearlyInteractionResult.yearStemInteractions.length &&
          !parsedYearlyInteractionResult.yearBranchInteractions.length &&
          !parsedYearlyInteractionResult.significantInteractions.length
        "
      >
        此流年與命盤無顯著天干或地支刑沖合害關係。
      </p>
    </div>

    <div v-if="conversionDisplayResult" class="conversion-result section-card">
      <h4>轉換結果</h4>
      <p>{{ conversionDisplayResult }}</p>
    </div>
    <div
      v-if="
        parsedBaziResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      class="bazi-result section-card"
    >
      <h4>八字排盤結果 (文字版)</h4>
      <div class="pillars-grid">
        <div class="pillar-card">
          <h5>年柱</h5>
          <p>
            {{ parsedBaziResult.yearPillar.stem }} ({{
              parsedBaziResult.yearPillar.stemElement
            }})
          </p>
          <p>
            {{ parsedBaziResult.yearPillar.branch }} ({{
              parsedBaziResult.yearPillar.branchElement
            }})
          </p>
        </div>
        <div class="pillar-card">
          <h5>月柱</h5>
          <p>
            {{ parsedBaziResult.monthPillar.stem }} ({{
              parsedBaziResult.monthPillar.stemElement
            }})
          </p>
          <p>
            {{ parsedBaziResult.monthPillar.branch }} ({{
              parsedBaziResult.monthPillar.branchElement
            }})
          </p>
        </div>
        <div class="pillar-card">
          <h5>日柱</h5>
          <p>
            {{ parsedBaziResult.dayPillar.stem }} ({{
              parsedBaziResult.dayPillar.stemElement
            }})
          </p>
          <p>
            {{ parsedBaziResult.dayPillar.branch }} ({{
              parsedBaziResult.dayPillar.branchElement
            }})
          </p>
        </div>
        <div class="pillar-card">
          <h5>時柱</h5>
          <p>
            {{ parsedBaziResult.hourPillar.stem }} ({{
              parsedBaziResult.hourPillar.stemElement
            }})
          </p>
          <p>
            {{ parsedBaziResult.hourPillar.branch }} ({{
              parsedBaziResult.hourPillar.branchElement
            }})
          </p>
        </div>
      </div>
    </div>
    <BaziChart
      v-if="
        parsedBaziResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      :bazi="parsedBaziResult"
      :ten-gods="parsedTenGodsResult"
    />
    <div
      v-if="
        parsedTenGodsResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      class="ten-gods-result section-card"
    >
      <h4>主要十神分析</h4>
      <div class="ten-gods-grid">
        <div class="god-item">
          <strong>年柱天干:</strong> {{ parsedTenGodsResult.yearStemGod }}
        </div>
        <div class="god-item">
          <strong>月柱天干:</strong> {{ parsedTenGodsResult.monthStemGod }}
        </div>
        <div class="god-item">
          <strong>日柱天干:</strong> {{ parsedTenGodsResult.dayStemGod }}
        </div>
        <div class="god-item">
          <strong>時柱天干:</strong> {{ parsedTenGodsResult.hourStemGod }}
        </div>
      </div>
    </div>
    <div
      v-if="
        parsedElementsDistributionResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      class="elements-distribution-result section-card"
    >
      <h4>五行能量分佈 (文字版)</h4>
      <ul>
        <li
          v-for="(count, element) in parsedElementsDistributionResult"
          :key="element"
        >
          {{ element }}: {{ count }}
        </li>
      </ul>
    </div>
    <ElementsChart
      v-if="
        parsedElementsDistributionResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      :distribution="parsedElementsDistributionResult"
    />
    <div
      v-if="
        parsedStartLuckResult &&
        activeCalendarLib &&
        activeCalendarLib.startsWith('lunarJS')
      "
      class="start-luck-result section-card"
    >
      <h4>起運資訊</h4>
      <p v-if="'error' in parsedStartLuckResult">
        {{ parsedStartLuckResult.error }}
      </p>
      <div v-else>
        <p>年齡: {{ parsedStartLuckResult.age }}</p>
        <p>年份: {{ parsedStartLuckResult.year }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, ref, watch, computed } from 'vue';
import unifiedApiService, {
  type CalculationResult,
  type BaZiResult as ApiBaZiResult,
} from '../services/unifiedApiService';
import {
  type BaziResult,
  type TenGodsPillars,
  type ElementsDistribution,
  type StartLuckInfo,
  type HeavenlyStem,
  type EarthlyBranch,
} from '../types/baziTypes';
import {
  TenGodsCalculator,
  FiveElementsAnalyzer,
  FortuneCycleCalculator,
} from '../utils/baziCalculators';
import {
  YearlyInteractionAnalyzer,
  type YearlyInteractionResult,
} from '../utils/yearlyInteractionUtils';
import { FrontendValidator } from '../utils/frontendValidation';
import BaziChart from './BaziChart.vue';
import ElementsChart from './ElementsChart.vue';
import YearlyFateTimeline, {
  type YearlyFateInfo,
} from './YearlyFateTimeline.vue';

// Adapter function: Convert new API response to old BaziResult format
const adaptApiBaZiToLegacyFormat = (apiBazi: ApiBaZiResult): BaziResult => {
  return {
    yearPillar: {
      stem: apiBazi.fourPillars.year.gan,
      branch: apiBazi.fourPillars.year.zhi,
      stemElement: '', // Will be calculated if needed
      branchElement: '',
    },
    monthPillar: {
      stem: apiBazi.fourPillars.month.gan,
      branch: apiBazi.fourPillars.month.zhi,
      stemElement: '',
      branchElement: '',
    },
    dayPillar: {
      stem: apiBazi.fourPillars.day.gan,
      branch: apiBazi.fourPillars.day.zhi,
      stemElement: '',
      branchElement: '',
    },
    hourPillar: {
      stem: apiBazi.fourPillars.hour.gan,
      branch: apiBazi.fourPillars.hour.zhi,
      stemElement: '',
      branchElement: '',
    },
  };
};

// Window 介面已在 global.d.ts 中定義，這裡不需要重複聲明

const userId = ref<string | null>(null);
const conversionDisplayResult = ref<string>('');
const parsedBaziResult = ref<BaziResult | null>(null);
const parsedTenGodsResult = ref<TenGodsPillars | null>(null);
const parsedElementsDistributionResult = ref<ElementsDistribution | null>(null);
const parsedStartLuckResult = ref<StartLuckInfo | { error: string } | null>(
  null,
);
const yearlyFateInput = ref<number | null>(null);
const parsedYearlyInteractionResult = ref<YearlyInteractionResult | null>(null);
const selectedYearFromTimeline = ref<YearlyFateInfo | null>(null);
const baziDisplayResult = ref<string>('');
const tenGodsDisplayResult = ref<string>('');
const elementsDistributionDisplayResult = ref<string>('');
const startLuckDisplayResult = ref<string>('');
const activeCalendarLib = ref<string | null>(null);
const isCalendarLibFullyAvailable = ref(false);
const calendarLibLoadErrorText = ref('核心日曆庫正在加載或加載失敗，請稍候...');
const calendarCheckInterval = ref<number | null>(null);
const calendarCheckTimeout = ref<number | null>(null);
const MAX_CHECK_DURATION = 10000;
const CHECK_INTERVAL = 500;
const emit = defineEmits(['submitBaziData']);
const isLoading = ref(false);

const timezones = ref([
  {
    label: '自動偵測 (預設)',
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  { label: 'Asia/Taipei (台北)', value: 'Asia/Taipei' },
  { label: 'Asia/Shanghai (上海)', value: 'Asia/Shanghai' },
  { label: 'Asia/Hong_Kong (香港)', value: 'Asia/Hong_Kong' },
  { label: 'Asia/Singapore (新加坡)', value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo (東京)', value: 'Asia/Tokyo' },
  { label: 'America/New_York (紐約)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (洛杉磯)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (倫敦)', value: 'Europe/London' },
  { label: 'Europe/Paris (巴黎)', value: 'Europe/Paris' },
  { label: 'Australia/Sydney (雪梨)', value: 'Australia/Sydney' },
  { label: 'UTC±00:00 (格林威治標準時間)', value: 'UTC' },
]);

const USER_ID_KEY = 'baziAppUserId';
const FORM_STATE_KEY = 'baziAppFormState';

interface FormState {
  calendarType: 'solar' | 'lunar';
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  gender: 'male' | 'female';
  timezone: string;
  isLeapMonth: boolean;
}

const formState = reactive<FormState>({
  calendarType: 'solar',
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  gender: 'male',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isLeapMonth: false,
});

function checkCalendarLibrary() {
  if (
    typeof window.Lunar === 'function' ||
    (typeof window.Lunar === 'object' &&
      window.Lunar !== null &&
      typeof window.Lunar.fromDate === 'function')
  ) {
    activeCalendarLib.value = 'lunarJS_latest_core_only';
    isCalendarLibFullyAvailable.value = false;
    try {
      const lunarDate = window.Lunar.fromDate(new Date());
      if (lunarDate && typeof lunarDate.getEightChar === 'function') {
        const eightChar = lunarDate.getEightChar();
        if (eightChar && typeof eightChar.getYun === 'function') {
          activeCalendarLib.value = 'lunarJS_latest_full';
          isCalendarLibFullyAvailable.value = true;
          calendarLibLoadErrorText.value = '';
        } else {
          calendarLibLoadErrorText.value =
            '日曆庫核心功能可用，但起運等高級功能受限 (getYun方法缺失或EightChar結構不符)。';
        }
      } else {
        calendarLibLoadErrorText.value =
          '日曆庫核心功能可用，但八字結構 (getEightChar) 缺失，導致起運等高級功能受限。';
      }
    } catch (e) {
      console.error('Error during API check for lunar-javascript@latest:', e);
      calendarLibLoadErrorText.value = '檢查日曆庫高級功能時出錯。';
      isCalendarLibFullyAvailable.value = false;
    }
    clearTimers();
    updateResultsDisplayBasedOnLibStatus();
  }
}

function handleCalendarCheckTimeout() {
  clearTimers();
  if (
    typeof window.Lunar === 'object' &&
    typeof window.Solar === 'object' &&
    typeof window.LunarMonth === 'object'
  ) {
    checkCalendarLibrary();
  } else {
    activeCalendarLib.value = null;
    isCalendarLibFullyAvailable.value = false;
    calendarLibLoadErrorText.value =
      '核心日曆庫 (lunar-javascript) 加載超時或失敗，大部分功能將無法使用。';
    updateResultsDisplayBasedOnLibStatus();
  }
}

function updateResultsDisplayBasedOnLibStatus() {
  if (activeCalendarLib.value === null) {
    conversionDisplayResult.value = calendarLibLoadErrorText.value;
    parsedBaziResult.value = null;
    parsedTenGodsResult.value = null;
    parsedElementsDistributionResult.value = null;
    parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
  } else if (
    activeCalendarLib.value &&
    activeCalendarLib.value.startsWith('lunarJS') &&
    !isCalendarLibFullyAvailable.value
  ) {
    parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
  } else if (
    activeCalendarLib.value &&
    activeCalendarLib.value.startsWith('lunarJS') &&
    isCalendarLibFullyAvailable.value
  ) {
    if (
      parsedStartLuckResult.value &&
      'error' in parsedStartLuckResult.value &&
      parsedStartLuckResult.value.error === calendarLibLoadErrorText.value
    ) {
      parsedStartLuckResult.value = null;
    }
  }
}

onMounted(() => {
  let storedUserId = sessionStorage.getItem(USER_ID_KEY);
  if (!storedUserId) {
    storedUserId = crypto.randomUUID();
    sessionStorage.setItem(USER_ID_KEY, storedUserId);
  }
  userId.value = storedUserId;
  if (typeof window.Lunar === 'object' && typeof window.Solar === 'object') {
    checkCalendarLibrary();
  } else {
    calendarCheckInterval.value = setInterval(
      checkCalendarLibrary,
      CHECK_INTERVAL,
    ) as any as number;
    calendarCheckTimeout.value = setTimeout(
      handleCalendarCheckTimeout,
      MAX_CHECK_DURATION,
    ) as any as number;
    setTimeout(checkCalendarLibrary, 50);
  }
  loadFormState();
});

const clearTimers = () => {
  if (calendarCheckInterval.value !== null) {
    clearInterval(calendarCheckInterval.value);
  }
  if (calendarCheckTimeout.value !== null) {
    clearTimeout(calendarCheckTimeout.value);
  }
  calendarCheckInterval.value = null;
  calendarCheckTimeout.value = null;
};
onUnmounted(() => clearTimers());

const saveFormState = () => {
  try {
    sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
  } catch (error) {
    console.error('保存表單狀態失敗:', error);
  }
};
const loadFormState = () => {
  try {
    const savedData = sessionStorage.getItem(FORM_STATE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        if (key in formState) {
          (formState as any)[key] = parsedData[key];
        }
      });
    }
  } catch (error) {
    console.error('恢復表單狀態失敗:', error);
    sessionStorage.removeItem(FORM_STATE_KEY);
  }
};
watch(formState, saveFormState, { deep: true });

const maxDay = computed(() => {
  if (!activeCalendarLib.value || !formState.year || !formState.month) {
    return 31;
  }
  if (formState.calendarType === 'solar') {
    return new Date(formState.year, formState.month, 0).getDate();
  }

  if (
    activeCalendarLib.value &&
    activeCalendarLib.value.startsWith('lunarJS')
  ) {
    try {
      if (
        typeof window.LunarMonth !== 'undefined' &&
        window.LunarMonth.fromYm
      ) {
        const monthForLunarLib = formState.isLeapMonth
          ? -formState.month
          : formState.month;
        const lunarMonth = window.LunarMonth.fromYm(
          formState.year,
          monthForLunarLib,
        );
        return lunarMonth ? lunarMonth.getDayCount() : 30;
      }
      return 30;
    } catch (e) {
      return 30;
    }
  }
  return 31;
});

watch(
  () => formState.calendarType,
  () => {
    formState.day = null;
    if (formState.calendarType === 'solar') {
      formState.isLeapMonth = false;
    }
  },
);
watch(
  () => [formState.year, formState.month, formState.isLeapMonth],
  () => {
    formState.day = null;
  },
);

watch(
  [parsedBaziResult, yearlyFateInput],
  ([bazi, yearInput]) => {
    if (bazi && yearInput && yearInput >= 1900 && yearInput <= 2200) {
      if (
        typeof window.Solar !== 'undefined' &&
        typeof window.Lunar !== 'undefined'
      ) {
        try {
          const solarOfYear = window.Solar.fromYmd(yearInput, 1, 1);
          const lunarOfYear = solarOfYear.getLunar();
          const yearStem = lunarOfYear.getYearGan() as HeavenlyStem;
          const yearBranch = lunarOfYear.getYearZhi() as EarthlyBranch;
          if (yearStem && yearBranch) {
            parsedYearlyInteractionResult.value =
              YearlyInteractionAnalyzer.analyzeYearlyInteraction(bazi, {
                stem: yearStem,
                branch: yearBranch,
              });
          } else {
            parsedYearlyInteractionResult.value = null;
          }
        } catch (e) {
          parsedYearlyInteractionResult.value = null;
        }
      } else {
        parsedYearlyInteractionResult.value = null;
      }
    } else {
      parsedYearlyInteractionResult.value = null;
    }
  },
  { deep: true },
);

watch(
  () => [
    formState.calendarType,
    formState.year,
    formState.month,
    formState.day,
    formState.hour,
    formState.minute,
    formState.isLeapMonth,
    formState.gender,
  ],
  async ([calType, year, month, day, hour, minute, isLeap, gender]) => {
    if (!(year && month && day && hour !== null && minute !== null)) {
      conversionDisplayResult.value = '請完整輸入年月日時分。';
      parsedBaziResult.value = null;
      parsedTenGodsResult.value = null;
      parsedElementsDistributionResult.value = null;
      parsedStartLuckResult.value = null;
      return;
    }
    if (!activeCalendarLib.value) {
      conversionDisplayResult.value = calendarLibLoadErrorText.value;
      parsedBaziResult.value = null;
      parsedTenGodsResult.value = null;
      parsedElementsDistributionResult.value = null;
      parsedStartLuckResult.value = { error: calendarLibLoadErrorText.value };
      return;
    }
    isLoading.value = true;
    conversionDisplayResult.value = '';
    parsedBaziResult.value = null;
    parsedTenGodsResult.value = null;
    parsedElementsDistributionResult.value = null;
    parsedStartLuckResult.value = null;
    baziDisplayResult.value = '';
    tenGodsDisplayResult.value = '';
    elementsDistributionDisplayResult.value = '';
    startLuckDisplayResult.value = '';

    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      let resultText = '';
      let solarForBazi: Date | null = null;
      let currentLunarDateForLuck: any = null;
      if (
        activeCalendarLib.value &&
        activeCalendarLib.value.startsWith('lunarJS')
      ) {
        if (
          typeof window.Lunar === 'undefined' ||
          typeof window.Solar === 'undefined'
        ) {
          conversionDisplayResult.value = 'lunar-javascript 核心組件未定義。';
          isLoading.value = false;
          return;
        }
        if (calType === 'solar') {
          const solar = window.Solar.fromYmdHms(
            year as number,
            month as number,
            day as number,
            hour as number,
            minute as number,
            0,
          );
          currentLunarDateForLuck = solar.getLunar();
          resultText = `國曆 ${solar.toString()} 轉換為 農曆: ${currentLunarDateForLuck.toString()} (${currentLunarDateForLuck.getYearInGanZhi()}年 ${currentLunarDateForLuck.getMonthInChinese()}月${currentLunarDateForLuck.getDayInChinese()}日 ${currentLunarDateForLuck.getTimeInGanZhi()}時)`;
          solarForBazi = new Date(
            year as number,
            (month as number) - 1,
            day as number,
            hour as number,
            minute as number,
            0,
          );
        } else {
          const currentMonthForLunar = isLeap
            ? -(month as number)
            : (month as number);
          currentLunarDateForLuck = window.Lunar.fromYmdHms(
            year as number,
            currentMonthForLunar,
            day as number,
            hour as number,
            minute as number,
            0,
          );
          const solar = currentLunarDateForLuck.getSolar();
          resultText = `農曆 ${currentLunarDateForLuck.toString(true)} (閏月: ${isLeap}) 轉換為 國曆: ${solar.toString()} (${currentLunarDateForLuck.getTimeInGanZhi()}時)`;
          solarForBazi = new Date(
            solar.getYear(),
            solar.getMonth() - 1,
            solar.getDay(),
            solar.getHour(),
            solar.getMinute(),
            0,
          );
        }
      }
      conversionDisplayResult.value = resultText;
      if (
        activeCalendarLib.value &&
        activeCalendarLib.value.startsWith('lunarJS') &&
        solarForBazi
      ) {
        // 使用統一後端 API 進行計算
        try {
          const apiRequest = {
            birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            birthTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            gender: gender as 'male' | 'female',
            longitude: 121.5, // Default Taiwan longitude
            isLeapMonth: isLeap || false,
          };

          const apiResponse = await unifiedApiService.calculate(apiRequest);

          if (!apiResponse || !apiResponse.bazi) {
            throw new Error('統一計算 API 回應格式錯誤');
          }

          const calculatedBazi = adaptApiBaZiToLegacyFormat(apiResponse.bazi);

          if (calculatedBazi && currentLunarDateForLuck) {
            // 驗證農曆轉換結果的完整性
            const lunarValidation = FrontendValidator.validateLunarConversion({
              year: currentLunarDateForLuck.getYear(),
              month: currentLunarDateForLuck.getMonth(),
              day: currentLunarDateForLuck.getDay(),
              yearGan: currentLunarDateForLuck.getYearGan(),
              yearZhi: currentLunarDateForLuck.getYearZhi(),
              monthGan: currentLunarDateForLuck.getMonthGan(),
              monthZhi: currentLunarDateForLuck.getMonthZhi(),
              dayGan: currentLunarDateForLuck.getDayGan(),
              dayZhi: currentLunarDateForLuck.getDayZhi(),
              timeGan: currentLunarDateForLuck.getTimeGan(),
              timeZhi: currentLunarDateForLuck.getTimeZhi(),
            });

            if (!lunarValidation.isValid) {
              conversionDisplayResult.value = `農曆轉換驗證失敗：${lunarValidation.errors.join('、')}`;
              parsedBaziResult.value = null;
              return;
            }

            parsedBaziResult.value = calculatedBazi;
            baziDisplayResult.value = JSON.stringify(calculatedBazi, null, 2);
            const calculatedTenGods =
              TenGodsCalculator.getMainStemTenGods(calculatedBazi);
            parsedTenGodsResult.value = calculatedTenGods;
            tenGodsDisplayResult.value = JSON.stringify(
              calculatedTenGods,
              null,
              2,
            );
            const calculatedElements =
              FiveElementsAnalyzer.calculateElementsDistribution(
                calculatedBazi,
              );
            parsedElementsDistributionResult.value = calculatedElements;
            elementsDistributionDisplayResult.value = JSON.stringify(
              calculatedElements,
              null,
              2,
            );
            if (isCalendarLibFullyAvailable.value) {
              const genderForCalc = gender === 'male' ? 0 : 1;
              const calculatedStartLuck =
                FortuneCycleCalculator.calculateStartLuck(
                  currentLunarDateForLuck,
                  genderForCalc,
                );
              if (calculatedStartLuck) {
                parsedStartLuckResult.value = calculatedStartLuck;
                startLuckDisplayResult.value = JSON.stringify(
                  calculatedStartLuck,
                  null,
                  2,
                );
              } else {
                parsedStartLuckResult.value = { error: '起運資訊計算失敗。' };
                startLuckDisplayResult.value = JSON.stringify(
                  { error: '起運資訊計算失敗。' },
                  null,
                  2,
                );
              }
            } else {
              parsedStartLuckResult.value = {
                error: calendarLibLoadErrorText.value,
              };
            }
          } else {
            parsedBaziResult.value = null;
            baziDisplayResult.value = '八字計算失敗 (API)。';
            parsedStartLuckResult.value = null;
            startLuckDisplayResult.value = '';
          }
        } catch (apiError) {
          console.error('統一計算 API 錯誤:', apiError);
          conversionDisplayResult.value = `計算失敗: ${apiError instanceof Error ? apiError.message : '未知錯誤'}`;
          parsedBaziResult.value = null;
        }
      }
    } catch (e) {
      console.error('Error during calculations in watch:', e);
      conversionDisplayResult.value = '輸入的日期無效或計算出錯。';
    } finally {
      isLoading.value = false;
    }
  },
  { deep: true, immediate: false },
);

const chineseHourDisplay = computed(() => {
  if (!isCalendarLibFullyAvailable.value || formState.hour === null) {
    return '';
  }
  const chineseHours = [
    '子時 (23:00-00:59)',
    '丑時 (01:00-02:59)',
    '寅時 (03:00-04:59)',
    '卯時 (05:00-06:59)',
    '辰時 (07:00-08:59)',
    '巳時 (09:00-10:59)',
    '午時 (11:00-12:59)',
    '未時 (13:00-14:59)',
    '申時 (15:00-16:59)',
    '酉時 (17:00-18:59)',
    '戌時 (19:00-20:59)',
    '亥時 (21:00-22:59)',
  ];
  let index = Math.floor((formState.hour + 1) / 2);
  if (formState.hour === 0 || formState.hour === 23) {
    index = 0;
  } else {
    index = Math.floor((formState.hour + 1) / 2);
  }
  return chineseHours[index % 12];
});

const handleYearSelectedFromTimeline = (yearInfo: YearlyFateInfo) => {
  selectedYearFromTimeline.value = yearInfo;
  yearlyFateInput.value = yearInfo.year;
};

watch(selectedYearFromTimeline, (newVal) => {
  if (newVal) {
    console.log('Year selected from timeline:', newVal);
  }
});

const handleSubmit = async () => {
  // 使用統一的前端驗證工具
  const birthDateString =
    formState.year && formState.month && formState.day
      ? `${formState.year}-${String(formState.month).padStart(2, '0')}-${String(formState.day).padStart(2, '0')}`
      : '';
  const birthTimeString =
    formState.hour !== null && formState.minute !== null
      ? `${String(formState.hour).padStart(2, '0')}:${String(formState.minute).padStart(2, '0')}`
      : '';

  // 驗證基本輸入資料
  const dateValidation = FrontendValidator.validateBirthDate(birthDateString);
  if (!dateValidation.isValid) {
    alert(dateValidation.errors.join('、'));
    return;
  }

  const timeValidation = FrontendValidator.validateBirthTime(birthTimeString);
  if (!timeValidation.isValid) {
    alert(timeValidation.errors.join('、'));
    return;
  }

  const genderValidation = FrontendValidator.validateGender(formState.gender);
  if (!genderValidation.isValid) {
    alert(genderValidation.errors.join('、'));
    return;
  }

  // 檢查農曆庫是否可用
  const libraryCheck = FrontendValidator.checkLunarLibrary();
  if (!libraryCheck.isValid) {
    alert(libraryCheck.errors.join('、'));
    return;
  }

  if (!activeCalendarLib.value) {
    alert('核心日曆庫未加載，無法提交。');
    return;
  }
  if (!userId.value) {
    let storedUserId = sessionStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      sessionStorage.setItem(USER_ID_KEY, storedUserId);
    }
    userId.value = storedUserId;
    if (!userId.value) {
      alert('無法獲取 UserID，請稍後再試。');
      return;
    }
  }

  isLoading.value = true;
  const tempGender = formState.gender;
  formState.gender = tempGender === 'male' ? 'female' : 'male';
  await new Promise((resolve) => setTimeout(resolve, 0));
  formState.gender = tempGender;
  await new Promise((resolve) => setTimeout(resolve, 0));

  if (
    !conversionDisplayResult.value ||
    conversionDisplayResult.value.includes('失敗') ||
    conversionDisplayResult.value.includes('無效')
  ) {
    alert('請檢查輸入的日期資訊是否正確並已成功轉換。');
    isLoading.value = false;
    return;
  }
  if (
    activeCalendarLib.value &&
    activeCalendarLib.value.startsWith('lunarJS')
  ) {
    if (!baziDisplayResult.value || baziDisplayResult.value.includes('失敗')) {
      alert('八字排盤失敗，請檢查輸入。');
      isLoading.value = false;
      return;
    }
    if (
      !tenGodsDisplayResult.value ||
      tenGodsDisplayResult.value.includes('失敗')
    ) {
      alert('十神分析失敗，請檢查輸入。');
      isLoading.value = false;
      return;
    }
    if (
      !elementsDistributionDisplayResult.value ||
      elementsDistributionDisplayResult.value.includes('失敗')
    ) {
      alert('五行分佈分析失敗，請檢查輸入。');
      isLoading.value = false;
      return;
    }
    if (
      isCalendarLibFullyAvailable.value &&
      (!startLuckDisplayResult.value ||
        startLuckDisplayResult.value.includes('失敗'))
    ) {
      alert('起運資訊計算失敗，請檢查輸入或日曆庫。');
      isLoading.value = false;
      return;
    }
  }

  try {
    const dataToEmit: any = { formData: { ...formState } };
    if (
      activeCalendarLib.value &&
      activeCalendarLib.value.startsWith('lunarJS')
    ) {
      dataToEmit.baziResult = JSON.parse(baziDisplayResult.value);
      dataToEmit.tenGods = JSON.parse(tenGodsDisplayResult.value);
      dataToEmit.elements = JSON.parse(elementsDistributionDisplayResult.value);
      if (
        isCalendarLibFullyAvailable.value &&
        startLuckDisplayResult.value &&
        !startLuckDisplayResult.value.includes('失敗') &&
        !startLuckDisplayResult.value.includes('受限')
      ) {
        dataToEmit.startLuck = JSON.parse(startLuckDisplayResult.value);
      } else {
        dataToEmit.startLuck = {
          error: startLuckDisplayResult.value || '起運功能受限或計算失敗',
        };
      }
    }
    emit('submitBaziData', dataToEmit);
  } catch (e) {
    console.error('解析結果失敗:', e);
    alert('處理結果時發生錯誤。');
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formState.calendarType = 'solar';
  formState.year = null;
  formState.month = null;
  formState.day = null;
  formState.hour = null;
  formState.minute = null;
  formState.gender = 'male';
  formState.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  formState.isLeapMonth = false;
  conversionDisplayResult.value = '';
  parsedBaziResult.value = null;
  parsedTenGodsResult.value = null;
  parsedElementsDistributionResult.value = null;
  parsedStartLuckResult.value = null;
  yearlyFateInput.value = null;
  parsedYearlyInteractionResult.value = null;
  selectedYearFromTimeline.value = null;
  baziDisplayResult.value = '';
  tenGodsDisplayResult.value = '';
  elementsDistributionDisplayResult.value = '';
  startLuckDisplayResult.value = '';
  try {
    sessionStorage.removeItem(FORM_STATE_KEY);
  } catch (error) {
    console.error('清除表單狀態失敗:', error);
  }
};
</script>

<style scoped>
.user-input-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}
h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-weight: 600;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #454545;
}
.form-group input[type='number'],
.form-group input[type='text'],
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-group input[type='checkbox'] {
  width: auto;
  margin-right: 8px;
  vertical-align: middle;
}
.form-group input[type='number']:focus,
.form-group input[type='text']:focus,
.form-group select:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}
.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 25px;
}
button {
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}
button:active {
  transform: translateY(1px);
}
button[type='submit'] {
  background-color: #42b983;
  color: white;
}
button[type='submit']:hover {
  background-color: #36a374;
}
button[type='submit']:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
.button-secondary {
  background-color: #6c757d;
  color: white;
}
.button-secondary:hover {
  background-color: #5a6268;
}
.button-secondary:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}
small {
  display: block;
  margin-top: 5px;
  font-size: 0.875em;
  color: #666;
}
.error-banner {
  background-color: #fdecea;
  color: #c0392b;
  padding: 12px 18px;
  border-left: 5px solid #e74c3c;
  border-radius: 4px;
  margin-bottom: 20px;
}
.error-banner p {
  margin: 0;
  font-weight: 500;
}
.loading-indicator {
  text-align: center;
  margin-top: 15px;
  color: #42b983;
  font-weight: 500;
}
.conversion-result {
  margin-top: 25px;
  padding: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.conversion-result h4,
.section-card h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
.conversion-result p,
.section-card p,
.section-card li {
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #555;
  line-height: 1.6;
}
.section-card ul {
  list-style-type: none;
  padding-left: 0;
}
.section-card li {
  padding: 4px 0;
}
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 10px;
}
.pillar-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.pillar-card h5 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
  color: #42b983;
}
.pillar-card p {
  margin: 5px 0;
  font-size: 0.95em;
}
.ten-gods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.god-item {
  padding: 8px 0;
  font-size: 0.95em;
}
.section-card {
  margin-top: 25px;
  padding: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}
@media (max-width: 768px) {
  .user-input-form {
    margin: 15px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .form-actions {
    flex-direction: column;
  }
  button {
    width: 100%;
  }
  button:not(:last-child) {
    margin-bottom: 10px;
  }
}
</style>
