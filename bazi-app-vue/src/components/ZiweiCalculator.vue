<template>
  <div class="ziwei-calculator">
    <h2>{{ $t('astrology.purple_star') }}</h2>
    <p class="description">{{ $t('chart.description') }}</p>

    <!-- 輸入表單 -->
    <form class="calculator-form" @submit.prevent="calculateChart">
      <div class="form-section">
        <h3>{{ $t('chart.birth_info') }}</h3>

        <!-- 出生年份 -->
        <div class="form-group">
          <label for="birth-year">{{ $t('chart.birth_year') }}:</label>
          <input
            id="birth-year"
            v-model.number="formData.year"
            type="number"
            :min="1900"
            :max="2100"
            required
            class="form-control"
          />
        </div>

        <!-- 出生月份 -->
        <div class="form-group">
          <label for="birth-month">{{ $t('chart.birth_month') }}:</label>
          <input
            id="birth-month"
            v-model.number="formData.month"
            type="number"
            :min="1"
            :max="12"
            required
            class="form-control"
          />
        </div>

        <!-- 出生日期 -->
        <div class="form-group">
          <label for="birth-day">{{ $t('chart.birth_day') }}:</label>
          <input
            id="birth-day"
            v-model.number="formData.day"
            type="number"
            :min="1"
            :max="31"
            required
            class="form-control"
          />
        </div>

        <!-- 出生時辰 -->
        <div class="form-group">
          <label for="birth-hour">{{ $t('chart.birth_hour') }} (0-23):</label>
          <input
            id="birth-hour"
            v-model.number="formData.hour"
            type="number"
            :min="0"
            :max="23"
            required
            class="form-control"
          />
        </div>

        <!-- 出生分鐘 -->
        <div class="form-group">
          <label for="birth-minute"
            >{{ $t('chart.birth_minute') }} (0-59):</label
          >
          <input
            id="birth-minute"
            v-model.number="formData.minute"
            type="number"
            :min="0"
            :max="59"
            class="form-control"
          />
        </div>

        <!-- 性別 -->
        <div class="form-group">
          <label>{{ $t('chart.gender') }}:</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="formData.gender" type="radio" value="male" />
              {{ $t('chart.male') }}
            </label>
            <label class="radio-label">
              <input v-model="formData.gender" type="radio" value="female" />
              {{ $t('chart.female') }}
            </label>
          </div>
        </div>
      </div>

      <!-- 提交按鈕 -->
      <div class="form-actions">
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="btn btn-primary"
        >
          <span v-if="isLoading" class="loading-spinner" />
          {{ isLoading ? $t('common.loading') : $t('chart.generate') }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm">
          {{ $t('common.reset') }}
        </button>
      </div>
    </form>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message">
      <h4>{{ $t('common.error') }}</h4>
      <p>{{ errorMessage }}</p>
    </div>

    <!-- 計算結果 -->
    <div v-if="chartResult && !isLoading" class="chart-result">
      <h3>{{ $t('chart.result_title') }}</h3>

      <!-- 基本資訊 -->
      <div class="result-summary">
        <div class="summary-item">
          <strong>五行局:</strong>
          <span>{{ chartResult.fiveElementsBureau }}</span>
        </div>
        <div class="summary-item">
          <strong>命宮位置:</strong>
          <span>{{ getZhiName(chartResult.mingPalaceIndex) }}宮</span>
        </div>
        <div class="summary-item">
          <strong>身宮位置:</strong>
          <span>{{ getZhiName(chartResult.shenPalaceIndex) }}宮</span>
        </div>
      </div>

      <!-- 十二宮位 -->
      <div class="palaces-grid">
        <h4>{{ $t('chart.twelve_palaces') }}</h4>
        <div class="palaces-container">
          <div
            v-for="(palace, index) in chartResult.palaces"
            :key="index"
            class="palace-card"
            :class="{
              active: selectedPalace?.name === palace.name,
              ming: index === 0,
              shen: index === getRelativeShenIndex(),
            }"
            @click="selectPalace(palace)"
          >
            <div class="palace-name">
              {{ palace.name }}
              <span class="palace-zhi">({{ palace.zhi }})</span>
            </div>
            <div class="palace-stars">
              <div
                v-for="star in palace.stars"
                :key="star.name"
                :class="['star', `star-${star.type}`]"
              >
                {{ star.name }}
                <span
                  v-if="star.transformations && star.transformations.length > 0"
                  class="transformations"
                >
                  {{ star.transformations.join('') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 宮位詳細資訊 -->
      <div v-if="selectedPalace" class="palace-details">
        <h4>{{ selectedPalace.name }} - {{ $t('chart.details') }}</h4>
        <div class="detail-content">
          <div class="detail-section">
            <strong>地支:</strong>
            <span>{{ selectedPalace.zhi }}</span>
          </div>
          <div class="detail-section">
            <strong>星曜:</strong>
            <div class="stars-list">
              <div
                v-for="star in selectedPalace.stars"
                :key="star.name"
                class="star-item"
              >
                <span :class="['star-name', `star-${star.type}`]">{{
                  star.name
                }}</span>
                <span
                  v-if="star.transformations && star.transformations.length > 0"
                  class="transformations"
                >
                  ({{ star.transformations.join('、') }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="result-actions">
        <button class="btn btn-info" @click="exportChart">
          {{ $t('chart.export_chart') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import apiService from '../services/apiService';

const { t } = useI18n();

// 地支名稱
const ZHI_NAMES = [
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

// 響應式資料
const isLoading = ref(false);
const errorMessage = ref('');
const chartResult = ref<any>(null);
const selectedPalace = ref<any>(null);

// 表單資料
const formData = reactive({
  year: new Date().getFullYear() - 25,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  gender: 'male' as 'male' | 'female',
});

// 計算屬性
const isFormValid = computed(() => {
  return (
    formData.year >= 1900 &&
    formData.year <= 2100 &&
    formData.month >= 1 &&
    formData.month <= 12 &&
    formData.day >= 1 &&
    formData.day <= 31 &&
    formData.hour >= 0 &&
    formData.hour <= 23 &&
    formData.minute >= 0 &&
    formData.minute <= 59 &&
    formData.gender
  );
});

// 輔助方法
const getZhiName = (index: number): string => {
  return ZHI_NAMES[index] || '未知';
};

const getRelativeShenIndex = (): number => {
  if (!chartResult.value) {
    return -1;
  }
  const mingIndex = chartResult.value.mingPalaceIndex;
  const shenIndex = chartResult.value.shenPalaceIndex;
  // 計算身宮相對於命宮的相對位置
  return (shenIndex - mingIndex + 12) % 12;
};

// 從 lunar-javascript 全局對象獲取農曆轉換功能
const convertToLunar = (solarDate: Date) => {
  try {
    // 使用全局的 Lunar 對象
    const solar = (window as any).Lunar.Solar.fromYmdHms(
      solarDate.getFullYear(),
      solarDate.getMonth() + 1,
      solarDate.getDate(),
      solarDate.getHours(),
      solarDate.getMinutes(),
      solarDate.getSeconds(),
    );
    const lunar = solar.getLunar();

    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      hour: solarDate.getHours(),
      yearGan: lunar.getYearGan(),
      yearZhi: lunar.getYearZhi(),
      monthGan: lunar.getMonthGan(),
      monthZhi: lunar.getMonthZhi(),
      dayGan: lunar.getDayGan(),
      dayZhi: lunar.getDayZhi(),
      timeGan: lunar.getTimeGan(),
      timeZhi: lunar.getTimeZhi(),
      yearInGanZhi: lunar.getYearInGanZhi(),
      monthInGanZhi: lunar.getMonthInGanZhi(),
      dayInGanZhi: lunar.getDayInGanZhi(),
      timeInGanZhi: lunar.getTimeInGanZhi(),
    };
  } catch (error) {
    console.error('農曆轉換失敗:', error);
    throw new Error('農曆轉換失敗，請檢查輸入日期');
  }
};

// 方法
const calculateChart = async (): Promise<void> => {
  if (!isFormValid.value) {
    errorMessage.value = t('chart.invalid_input');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  chartResult.value = null;
  selectedPalace.value = null;

  try {
    // 組裝生辰資料
    const birthDate = new Date(
      formData.year,
      formData.month - 1,
      formData.day,
      formData.hour,
      formData.minute,
    );

    // 轉換為農曆
    const lunarInfo = convertToLunar(birthDate);

    // 組裝請求資料
    const requestData = {
      birthDate: birthDate.toISOString().split('T')[0], // YYYY-MM-DD 格式
      birthTime: `${formData.hour.toString().padStart(2, '0')}:${formData.minute.toString().padStart(2, '0')}:00`, // HH:MM:SS 格式
      gender: formData.gender,
      lunarInfo,
      options: {
        includeMajorCycles: true,
        includeMinorCycles: true,
        includeAnnualCycles: false,
        detailLevel: 'basic',
        maxAge: 100,
      },
    };

    console.log('發送計算請求:', requestData);

    // 調用 API
    const response = await apiService.calculatePurpleStar(requestData);

    if (response.success && response.data) {
      chartResult.value = response.data.chart;
      console.log('計算結果:', response.data);
    } else {
      errorMessage.value = response.error || t('chart.calculation_failed');
    }
  } catch (error: any) {
    console.error('計算紫微斗數命盤失敗:', error);
    if (error?.response?.data?.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = error.message || t('chart.calculation_failed');
    }
  } finally {
    isLoading.value = false;
  }
};

const resetForm = (): void => {
  formData.year = new Date().getFullYear() - 25;
  formData.month = 1;
  formData.day = 1;
  formData.hour = 12;
  formData.minute = 0;
  formData.gender = 'male';
  chartResult.value = null;
  selectedPalace.value = null;
  errorMessage.value = '';
};

const selectPalace = (palace: any): void => {
  selectedPalace.value = palace;
};

const exportChart = (): void => {
  if (!chartResult.value) {
    return;
  }

  const dataStr = JSON.stringify(chartResult.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `紫微斗數命盤_${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.ziwei-calculator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.description {
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
}

.calculator-form {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.chart-result {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.summary-item {
  margin-bottom: 0.5rem;
}

.summary-item strong {
  display: inline-block;
  width: 120px;
  color: #495057;
}

.palaces-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  aspect-ratio: 4/3;
}

.palace-card {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.palace-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.palace-card.active {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.palace-card.ming {
  border-color: #dc3545;
  border-width: 3px;
}

.palace-card.shen {
  border-color: #28a745;
  border-style: dashed;
}

.palace-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.palace-zhi {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: normal;
}

.palace-stars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.star {
  padding: 0.15rem 0.3rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-align: center;
  position: relative;
}

.star-main {
  background-color: #ffc107;
  color: #212529;
  font-weight: bold;
}

.star-auxiliary {
  background-color: #17a2b8;
  color: white;
}

.star-minor {
  background-color: #6c757d;
  color: white;
}

.transformations {
  color: #dc3545;
  font-weight: bold;
  margin-left: 0.2rem;
}

.palace-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.detail-section {
  margin-bottom: 1rem;
}

.stars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.star-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-name {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .ziwei-calculator {
    padding: 1rem;
  }

  .form-actions,
  .result-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .palaces-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }
}
</style>
