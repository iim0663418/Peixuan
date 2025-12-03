<template>
  <el-form
    ref="unifiedForm"
    :model="formData"
    :rules="formRules"
    @submit.prevent="submitForm"
  >
    <el-form-item label="出生資訊" />

    <el-form-item label="出生日期" prop="birthDate">
      <el-date-picker
        id="birth-date"
        v-model="formData.birthDate"
        type="date"
        placeholder="請選擇出生日期"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item label="出生時間" prop="birthTime">
      <el-time-picker
        v-model="formData.birthTime"
        placeholder="請選擇出生時間"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item label="性別" prop="gender">
      <el-radio-group v-model="formData.gender">
        <el-radio value="male">男</el-radio>
        <el-radio value="female">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 中文地址輸入 -->
    <el-form-item label="出生地址（自動轉換座標）">
      <el-input
        v-model="addressInput"
        placeholder="請輸入中文地址，例如：雲林縣虎尾鎮新生路74號"
        :loading="geocoding"
        clearable
        @input="handleAddressInput"
      >
        <template #append>
          <el-button
            :loading="geocoding"
            :disabled="!addressInput"
            type="primary"
            @click="geocodeCurrentAddress"
          >
            查詢座標
          </el-button>
        </template>
      </el-input>

      <!-- 地址解析狀態顯示 -->
      <div v-if="geocodeStatus.message" class="geocode-status">
        <el-text :type="geocodeStatus.type" size="small">
          {{ geocodeStatus.message }}
        </el-text>
      </div>

      <!-- 多候選地址選擇 -->
      <el-select
        v-if="candidateAddresses.length > 1"
        v-model="selectedCandidateIndex"
        placeholder="發現多個匹配地址，請選擇最準確的"
        class="candidate-select"
        @change="selectCandidate"
      >
        <el-option
          v-for="(candidate, index) in candidateAddresses"
          :key="index"
          :label="formatCandidateDisplay(candidate)"
          :value="index"
        />
      </el-select>
    </el-form-item>

    <!-- 精確地理位置輸入 -->
    <el-form-item
      label="出生地點座標（必填）"
      prop="location"
      class="location-form-item"
    >
      <div class="coordinate-inputs">
        <div class="coordinate-field">
          <el-input
            v-model.number="formData.longitude"
            placeholder="經度（必填）"
            type="number"
            :min="-180"
            :max="180"
            :step="0.000001"
            class="coordinate-input"
          >
            <template #prepend>經度</template>
          </el-input>
        </div>
        <div class="coordinate-field">
          <el-input
            v-model.number="formData.latitude"
            placeholder="緯度"
            type="number"
            :min="-90"
            :max="90"
            :step="0.000001"
            class="coordinate-input"
          >
            <template #prepend>緯度</template>
          </el-input>
        </div>
        <div class="coordinate-field timezone-field">
          <el-select
            v-model="formData.timezone"
            filterable
            placeholder="時區"
            class="timezone-select"
          >
            <el-option
              v-for="tz in timezones"
              :key="tz.value"
              :label="tz.label"
              :value="tz.value"
            />
          </el-select>
        </div>
      </div>
      <el-text type="warning" size="small" class="coordinate-warning">
        ⚠️ 經度為必填項目，用於精確計算
      </el-text>
    </el-form-item>

    <!-- 快速城市選擇（可選） -->
    <el-form-item label="或選擇常用城市（自動填入座標）">
      <el-select
        v-model="selectedCity"
        filterable
        placeholder="選擇城市快速填入座標"
        class="city-select"
        clearable
        @change="fillCityCoordinates"
      >
        <el-option
          v-for="city in majorCities"
          :key="city.value"
          :label="city.label"
          :value="city.value"
        />
      </el-select>
    </el-form-item>

    <!-- 閏月標記（可選） -->
    <el-form-item label="是否閏月">
      <el-checkbox v-model="formData.isLeapMonth">此月為閏月</el-checkbox>
    </el-form-item>

    <el-form-item>
      <div class="button-group">
        <el-button
          type="primary"
          :disabled="hasCache"
          :icon="hasCache ? Lock : Check"
          class="submit-btn"
          @click="submitForm"
        >
          {{ hasCache ? '已有快取命盤' : '開始計算' }}
        </el-button>
        <el-tooltip
          v-if="hasCache"
          content="清除快取後可重新計算"
          placement="top"
        >
          <el-button
            type="warning"
            :icon="Delete"
            class="clear-btn"
            @click="clearCache"
          >
            清除快取
          </el-button>
        </el-tooltip>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Lock, Check, Delete } from '@element-plus/icons-vue';
import { saveTimeZoneInfo, getTimeZoneInfo } from '../utils/storageService';
import {
  GeocodeService,
  type GeocodeCandidate,
} from '../services/geocodeService';
import { useChartStore } from '../stores/chartStore';

const chartStore = useChartStore();

// 檢查是否有快取（鎖定表單）
const hasCache = computed(() => !!chartStore.chartId);

// 清除快取
const clearCache = () => {
  chartStore.clearCurrentChart();
  ElMessage.success('已清除快取，可以重新計算');
};

const props = defineProps<{
  initialData?: {
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
    longitude: number;
  } | null;
}>();

const emit = defineEmits(['submit']);

// 時區選項
const timezones = ref<Array<{ label: string; value: string }>>([
  { label: '亞洲/台北 (GMT+8)', value: 'Asia/Taipei' },
  { label: '亞洲/上海 (GMT+8)', value: 'Asia/Shanghai' },
  { label: '亞洲/香港 (GMT+8)', value: 'Asia/Hong_Kong' },
  { label: '亞洲/東京 (GMT+9)', value: 'Asia/Tokyo' },
  { label: '亞洲/首爾 (GMT+9)', value: 'Asia/Seoul' },
  { label: '亞洲/新加坡 (GMT+8)', value: 'Asia/Singapore' },
  { label: '澳洲/悉尼 (GMT+10)', value: 'Australia/Sydney' },
  { label: '歐洲/倫敦 (GMT+0)', value: 'Europe/London' },
  { label: '歐洲/巴黎 (GMT+1)', value: 'Europe/Paris' },
  { label: '美洲/紐約 (GMT-5)', value: 'America/New_York' },
  { label: '美洲/洛杉磯 (GMT-8)', value: 'America/Los_Angeles' },
  { label: '美洲/溫哥華 (GMT-8)', value: 'America/Vancouver' },
]);

const formData = reactive({
  birthDate: '',
  birthTime: '',
  gender: 'male' as 'male' | 'female',
  longitude: null as number | null,
  latitude: null as number | null,
  timezone: 'Asia/Taipei',
  isLeapMonth: false,
});

const selectedCity = ref('');

// 地址輸入和地理編碼相關
const addressInput = ref('');
const geocoding = ref(false);
const candidateAddresses = ref<GeocodeCandidate[]>([]);
const selectedCandidateIndex = ref<number | null>(null);
const geocodeStatus = reactive<{
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}>({
  message: '',
  type: 'info',
});

let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;

// 主要城市座標資料
const majorCities = ref([
  {
    label: '台北, 台灣',
    value: 'taipei',
    longitude: 121.5654,
    latitude: 25.033,
    timezone: 'Asia/Taipei',
  },
  {
    label: '高雄, 台灣',
    value: 'kaohsiung',
    longitude: 120.3014,
    latitude: 22.6273,
    timezone: 'Asia/Taipei',
  },
  {
    label: '台中, 台灣',
    value: 'taichung',
    longitude: 120.6736,
    latitude: 24.1477,
    timezone: 'Asia/Taipei',
  },
  {
    label: '上海, 中國',
    value: 'shanghai',
    longitude: 121.4737,
    latitude: 31.2304,
    timezone: 'Asia/Shanghai',
  },
  {
    label: '北京, 中國',
    value: 'beijing',
    longitude: 116.4074,
    latitude: 39.9042,
    timezone: 'Asia/Shanghai',
  },
  {
    label: '香港',
    value: 'hongkong',
    longitude: 114.1694,
    latitude: 22.3193,
    timezone: 'Asia/Hong_Kong',
  },
  {
    label: '東京, 日本',
    value: 'tokyo',
    longitude: 139.6917,
    latitude: 35.6895,
    timezone: 'Asia/Tokyo',
  },
  {
    label: '首爾, 韓國',
    value: 'seoul',
    longitude: 126.978,
    latitude: 37.5665,
    timezone: 'Asia/Seoul',
  },
  {
    label: '新加坡',
    value: 'singapore',
    longitude: 103.8198,
    latitude: 1.3521,
    timezone: 'Asia/Singapore',
  },
  {
    label: '倫敦, 英國',
    value: 'london',
    longitude: -0.1276,
    latitude: 51.5074,
    timezone: 'Europe/London',
  },
  {
    label: '紐約, 美國',
    value: 'newyork',
    longitude: -74.006,
    latitude: 40.7128,
    timezone: 'America/New_York',
  },
  {
    label: '洛杉磯, 美國',
    value: 'losangeles',
    longitude: -118.2437,
    latitude: 34.0522,
    timezone: 'America/Los_Angeles',
  },
]);

// 地址輸入處理（防抖）
const handleAddressInput = () => {
  if (geocodeTimeout) {
    clearTimeout(geocodeTimeout);
  }

  // 清除之前的狀態
  clearGeocodeStatus();
  candidateAddresses.value = [];
  selectedCandidateIndex.value = null;

  if (!addressInput.value || addressInput.value.trim().length < 3) {
    return;
  }

  // 防抖處理，避免頻繁請求API
  geocodeTimeout = setTimeout(() => {
    geocodeCurrentAddress();
  }, 800);
};

// 執行地址解析
const geocodeCurrentAddress = async () => {
  if (!addressInput.value || geocoding.value) {
    return;
  }

  geocoding.value = true;
  clearGeocodeStatus();

  try {
    const result = await GeocodeService.geocodeAddress(addressInput.value);

    if (result.success && result.candidates.length > 0) {
      candidateAddresses.value = result.candidates;

      if (result.candidates.length === 1) {
        // 單一結果直接填入
        fillCoordinatesFromCandidate(result.candidates[0]);
        setGeocodeStatus('地址解析成功！座標已自動填入', 'success');
      } else {
        // 多個結果讓用戶選擇
        setGeocodeStatus(
          `找到 ${result.candidates.length} 個匹配地址，請選擇最準確的`,
          'warning',
        );
      }
    } else {
      setGeocodeStatus(
        result.error || '找不到匹配的地址，請檢查地址格式',
        'danger',
      );
      candidateAddresses.value = [];
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    setGeocodeStatus('地址解析失敗，請稍後再試', 'danger');
  } finally {
    geocoding.value = false;
  }
};

// 從候選地址填入座標
const fillCoordinatesFromCandidate = (candidate: GeocodeCandidate) => {
  const coords = GeocodeService.formatCoordinates(
    candidate.location.x,
    candidate.location.y,
  );

  formData.longitude = coords.longitude;
  formData.latitude = coords.latitude;

  // 根據地址嘗試設置時區（台灣地區）
  if (
    candidate.attributes.Match_addr?.includes('台灣') ||
    candidate.attributes.City?.includes('台') ||
    (candidate.location.x > 119 &&
      candidate.location.x < 122 &&
      candidate.location.y > 21 &&
      candidate.location.y < 26)
  ) {
    formData.timezone = 'Asia/Taipei';
  }
};

// 選擇候選地址
const selectCandidate = (index: number) => {
  if (candidateAddresses.value[index]) {
    fillCoordinatesFromCandidate(candidateAddresses.value[index]);
    setGeocodeStatus('座標已填入，請確認是否正確', 'success');

    // 隱藏候選列表
    setTimeout(() => {
      candidateAddresses.value = [candidateAddresses.value[index]];
    }, 1000);
  }
};

// 格式化候選地址顯示
const formatCandidateDisplay = (candidate: GeocodeCandidate): string => {
  return GeocodeService.formatCandidateForDisplay(candidate);
};

// 設置地理編碼狀態
const setGeocodeStatus = (
  message: string,
  type: 'success' | 'warning' | 'danger' | 'info',
) => {
  geocodeStatus.message = message;
  geocodeStatus.type = type;
};

// 清除地理編碼狀態
const clearGeocodeStatus = () => {
  geocodeStatus.message = '';
  geocodeStatus.type = 'info';
};

// 填入城市座標
const fillCityCoordinates = (cityValue: string) => {
  const city = majorCities.value.find((c) => c.value === cityValue);
  if (city) {
    formData.longitude = city.longitude;
    formData.latitude = city.latitude;
    formData.timezone = city.timezone;
    clearGeocodeStatus();
  }
};

// 從 sessionStorage 加載保存的時區資訊
onMounted(() => {
  const savedTimezone = getTimeZoneInfo();
  if (savedTimezone && savedTimezone.timeZone) {
    formData.timezone = savedTimezone.timeZone;
  }
});

const formRules = {
  birthDate: [{ required: true, message: '請選擇出生日期', trigger: 'change' }],
  birthTime: [{ required: true, message: '請選擇出生時間', trigger: 'change' }],
  gender: [{ required: true, message: '請選擇性別', trigger: 'change' }],
  location: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        // 驗證經度（必填）
        if (formData.longitude === null || formData.longitude === undefined) {
          callback(
            new Error('請輸入出生地經度（可選擇城市或輸入地址自動填入）'),
          );
          return;
        }
        if (formData.longitude < -180 || formData.longitude > 180) {
          callback(new Error('經度必須在 -180 到 180 之間'));
          return;
        }

        // 驗證緯度（可選，但若提供則需檢查範圍）
        if (formData.latitude !== null && formData.latitude !== undefined) {
          if (formData.latitude < -90 || formData.latitude > 90) {
            callback(new Error('緯度必須在 -90 到 90 之間'));
            return;
          }
        }

        // 驗證時區
        if (!formData.timezone) {
          callback(new Error('請選擇時區'));
          return;
        }

        callback();
      },
      trigger: 'blur',
    },
  ],
};

const unifiedForm = ref();

// Watch for initialData changes and populate form
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.birthDate = newData.birthDate;
      formData.birthTime = newData.birthTime;
      formData.gender = newData.gender;
      formData.longitude = newData.longitude;
      console.log(
        '[UnifiedInputForm] Populated form with saved data:',
        newData,
      );
    }
  },
  { immediate: true },
);

const submitForm = async () => {
  if (!unifiedForm.value) {
    return;
  }

  try {
    const isValid = await unifiedForm.value.validate();
    if (isValid) {
      // 驗證通過，檢查必填欄位
      if (!formData.birthDate || !formData.birthTime || !formData.gender) {
        ElMessage.error('請填寫完整的出生資訊');
        return;
      }

      // 驗證經度必填
      if (formData.longitude === null || formData.longitude === undefined) {
        ElMessage.error('請提供出生地經度資訊');
        return;
      }

      // 保存時區資訊到 sessionStorage
      const [year] = formData.birthDate.split('-').map(Number);
      saveTimeZoneInfo(formData.timezone, year);

      // 構建統一的 birthInfo 格式：{birthDate, birthTime, gender, longitude, isLeapMonth?}
      const birthInfo: {
        birthDate: string;
        birthTime: string;
        gender: 'male' | 'female';
        longitude: number;
        latitude?: number;
        timezone?: string;
        isLeapMonth?: boolean;
      } = {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        gender: formData.gender,
        longitude: formData.longitude,
      };

      // 添加可選欄位
      if (formData.latitude !== null && formData.latitude !== undefined) {
        birthInfo.latitude = formData.latitude;
      }
      if (formData.timezone) {
        birthInfo.timezone = formData.timezone;
      }
      if (formData.isLeapMonth) {
        birthInfo.isLeapMonth = formData.isLeapMonth;
      }

      emit('submit', birthInfo);
    }
  } catch (error) {
    console.error('表單驗證失敗:', error);
    ElMessage.error('表單驗證失敗，請檢查輸入資料');
  }
};
</script>

<style scoped>
/* ==========================================
   Mobile-First Responsive Form Styles
   ========================================== */

/* Base styles (Mobile < 480px) */
.el-form {
  width: 100%;
}

/* Form items - fluid spacing with clamp() */
:deep(.el-form-item) {
  margin-bottom: clamp(var(--space-lg), 2vw, var(--space-2xl));
}

:deep(.el-form-item__label) {
  font-size: clamp(var(--font-size-sm), 2.5vw, var(--font-size-base));
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-sm);
}

:deep(.el-form-item__content) {
  flex: 1;
}

/* Input fields - minimum 44px touch targets */
:deep(.el-input__inner) {
  min-height: 44px;
  font-size: 16px !important; /* Prevent iOS zoom */
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-sm);
}

:deep(.el-textarea__inner) {
  font-size: 16px !important; /* Prevent iOS zoom */
  padding: var(--space-md) var(--space-lg);
}

/* Date and time pickers - full width on mobile */
:deep(.el-date-editor),
:deep(.el-time-picker) {
  width: 100%;
  min-height: 44px;
}

:deep(.el-date-editor .el-input__inner),
:deep(.el-time-picker .el-input__inner) {
  min-height: 44px;
}

/* Radio buttons - vertical stack on mobile with touch-friendly spacing */
:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--space-md), 2vw, var(--space-lg));
}

:deep(.el-radio) {
  margin-right: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
}

:deep(.el-radio__input) {
  line-height: 44px;
}

:deep(.el-radio__label) {
  font-size: var(--font-size-base);
  padding-left: var(--space-sm);
  line-height: var(--line-height-normal);
}

/* Select dropdowns - full width with touch targets */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  min-height: 44px;
}

/* Address input with append button */
:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  min-height: 44px;
  padding: 0 var(--space-lg);
}

/* Coordinate inputs - mobile-first stacked layout */
.coordinate-inputs {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--space-md), 2vw, var(--space-lg));
  width: 100%;
}

.coordinate-field {
  width: 100%;
}

.coordinate-input,
.timezone-select {
  width: 100%;
}

.coordinate-warning {
  margin-top: clamp(var(--space-sm), 1.5vw, var(--space-md));
  display: block;
  line-height: var(--line-height-normal);
}

/* Input prepend styling */
:deep(.el-input-group__prepend) {
  padding: 0 var(--space-md);
  background-color: var(--bg-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

/* Geocode status messages - proper wrapping and spacing */
.geocode-status {
  margin-top: clamp(var(--space-sm), 1.5vw, var(--space-md));
  line-height: var(--line-height-normal);
}

/* Candidate address select */
.candidate-select {
  width: 100%;
  margin-top: var(--space-sm);
}

/* City select */
.city-select {
  width: 100%;
}

/* Checkbox - touch-friendly */
:deep(.el-checkbox) {
  min-height: 44px;
  display: flex;
  align-items: center;
}

:deep(.el-checkbox__label) {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* Button group - flexible layout */
.button-group {
  display: flex;
  gap: var(--space-md);
  width: 100%;
}

.submit-btn {
  flex: 1;
  transition: all 0.3s ease;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  transition: all 0.3s ease;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

/* Mobile responsive button layout (< 768px) */
@media (max-width: 767px) {
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.el-button) {
    min-height: 44px;
  }
}

/* Submit button - full width on mobile with proper touch targets */
:deep(.el-button) {
  width: 100%;
  min-height: 48px;
  padding: clamp(var(--space-md), 2vw, var(--space-lg))
    clamp(var(--space-2xl), 3vw, var(--space-3xl));
  font-size: clamp(var(--font-size-base), 2.5vw, var(--font-size-lg));
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

:deep(.el-button--primary) {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* Form validation messages */
:deep(.el-form-item__error) {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  padding-top: var(--space-xs);
  margin-top: var(--space-xs);
}

/* ==========================================
   Tablet and above (≥ 480px)
   ========================================== */
@media (min-width: 480px) {
  /* Coordinate inputs - 2 column layout */
  .coordinate-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .timezone-field {
    grid-column: 1 / -1;
  }

  /* Radio buttons - horizontal on larger screens */
  :deep(.el-radio-group) {
    flex-direction: row;
    gap: clamp(var(--space-lg), 2vw, var(--space-2xl));
  }
}

/* ==========================================
   Tablet (≥ 768px)
   ========================================== */
@media (min-width: 768px) {
  /* Coordinate inputs - 3 column layout */
  .coordinate-inputs {
    grid-template-columns: 2fr 2fr 1.5fr;
    gap: var(--space-lg);
  }

  .timezone-field {
    grid-column: auto;
  }

  /* Form spacing adjustments */
  :deep(.el-form-item) {
    margin-bottom: var(--space-2xl);
  }

  /* Buttons - constrained width on larger screens */
  :deep(.el-button) {
    width: auto;
    min-width: 200px;
    padding: var(--space-md) var(--space-3xl);
  }

  /* Input group append button - better sizing */
  :deep(.el-input-group__append .el-button) {
    padding: 0 var(--space-xl);
  }
}

/* ==========================================
   Desktop (≥ 1024px)
   ========================================== */
@media (min-width: 1024px) {
  :deep(.el-form-item__label) {
    font-size: var(--font-size-base);
  }

  :deep(.el-button) {
    font-size: var(--font-size-base);
  }
}
</style>
