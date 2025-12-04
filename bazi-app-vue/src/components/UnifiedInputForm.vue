<template>
  <el-form
    ref="unifiedForm"
    :model="formData"
    :rules="formRules"
    :validate-on-rule-change="true"
    label-position="top"
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
    <el-form-item label="出生地址或地標">
      <el-input
        v-model="addressInput"
        placeholder="請輸入地址或地標，例如：台北101、台中火車站、高雄85大樓"
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

      <!-- 說明文字 -->
      <div class="field-hint">
        <el-text type="info" size="small">
          💡 支援地標、完整地址或郵遞區號，系統會自動查詢座標
        </el-text>
      </div>

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
          <el-form-item prop="longitude">
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
          </el-form-item>
        </div>
        <div class="coordinate-field">
          <el-form-item prop="latitude">
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
          </el-form-item>
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
    <el-form-item label="快速選擇：常用城市">
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

      <!-- 說明文字 -->
      <div class="field-hint">
        <el-text type="info" size="small">
          💡 不確定地址？可以先選擇最接近的城市
        </el-text>
      </div>
    </el-form-item>

    <!-- 閏月提示（自動判斷） -->
    <el-form-item v-if="formData.isLeapMonth">
      <el-alert
        :title="`此日期為農曆 ${leapMonthInfo}`"
        type="info"
        :closable="false"
        show-icon
      />
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
        <el-popover
          v-if="hasCache"
          :visible="showClearCachePopover"
          placement="top"
          :width="200"
          trigger="manual"
        >
          <template #reference>
            <el-button
              type="warning"
              :icon="Delete"
              class="clear-btn"
              aria-label="清除快取"
              :aria-describedby="
                showClearCachePopover ? 'clear-cache-popover' : undefined
              "
              @click="toggleClearCachePopover"
            >
              清除快取
            </el-button>
          </template>
          <div id="clear-cache-popover" role="tooltip">
            清除快取後可重新計算
          </div>
        </el-popover>
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
import { Solar } from 'lunar-typescript';

const chartStore = useChartStore();

// 閏月資訊
const leapMonthInfo = ref('');

// 檢查是否有快取(鎖定表單)
const hasCache = computed(() => !!chartStore.chartId);

// 清除快取 Popover 狀態
const showClearCachePopover = ref(false);

// 切換清除快取 Popover
const toggleClearCachePopover = (event?: MouseEvent) => {
  // 防止事件冒泡導致立即關閉
  if (event) {
    event.stopPropagation();
  }

  // 如果顯示 popover,則執行清除並隱藏;否則顯示 popover
  if (showClearCachePopover.value) {
    clearCache();
  } else {
    showClearCachePopover.value = true;

    // 點擊外部關閉 popover
    const closePopover = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.clear-btn') && !target.closest('.el-popover')) {
        showClearCachePopover.value = false;
        document.removeEventListener('click', closePopover);
      }
    };

    // 延遲添加事件監聽器,避免立即觸發
    setTimeout(() => {
      document.addEventListener('click', closePopover);
    }, 0);
  }
};

// 清除快取
const clearCache = () => {
  showClearCachePopover.value = false;
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
  birthDate: [
    { required: true, message: '請選擇出生日期', trigger: 'change' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback();
          return;
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          callback(new Error('出生日期不能是未來日期'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  birthTime: [
    { required: true, message: '請選擇出生時間', trigger: 'change' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback();
          return;
        }
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(value)) {
          callback(new Error('時間格式錯誤，請使用 HH:mm 格式（例如：14:30）'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  gender: [{ required: true, message: '請選擇性別', trigger: ['change', 'blur'] }],
  longitude: [
    { required: true, message: '請輸入經度', trigger: ['change', 'blur'] },
    { type: 'number', message: '經度必須是數字', trigger: ['change', 'blur'] },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === null || value === undefined) {
          callback();
          return;
        }
        if (value < -180 || value > 180) {
          callback(new Error('經度必須在 -180 到 180 之間'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  latitude: [
    { required: true, message: '請輸入緯度', trigger: ['change', 'blur'] },
    { type: 'number', message: '緯度必須是數字', trigger: ['change', 'blur'] },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === null || value === undefined) {
          callback();
          return;
        }
        if (value < -90 || value > 90) {
          callback(new Error('緯度必須在 -90 到 90 之間'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
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
        if (isNaN(formData.longitude)) {
          callback(new Error('經度必須是有效的數字'));
          return;
        }
        if (formData.longitude < -180 || formData.longitude > 180) {
          callback(new Error('經度必須在 -180 到 180 之間'));
          return;
        }

        // 驗證緯度（可選，但若提供則需檢查範圍）
        if (formData.latitude !== null && formData.latitude !== undefined) {
          if (isNaN(formData.latitude)) {
            callback(new Error('緯度必須是有效的數字'));
            return;
          }
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
      trigger: ['change', 'blur'],
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

// Real-time validation for form fields
watch(
  () => formData.birthDate,
  () => {
    if (unifiedForm.value) {
      unifiedForm.value.validateField('birthDate');
    }
  },
);

watch(
  () => formData.birthTime,
  () => {
    if (unifiedForm.value) {
      unifiedForm.value.validateField('birthTime');
    }
  },
);

watch(
  () => formData.gender,
  () => {
    if (unifiedForm.value) {
      unifiedForm.value.validateField('gender');
    }
  },
);

watch(
  () => [formData.longitude, formData.latitude, formData.timezone],
  () => {
    if (unifiedForm.value) {
      unifiedForm.value.validateField('location');
    }
  },
);

// 自動判斷閏月
const detectLeapMonth = () => {
  if (!formData.birthDate) {
    formData.isLeapMonth = false;
    leapMonthInfo.value = '';
    return;
  }

  try {
    const solar = Solar.fromYmd(
      parseInt(formData.birthDate.split('-')[0]),
      parseInt(formData.birthDate.split('-')[1]),
      parseInt(formData.birthDate.split('-')[2])
    );
    const lunar = solar.getLunar();
    const month = lunar.getMonth();

    formData.isLeapMonth = month < 0;
    leapMonthInfo.value = month < 0 ? `閏${Math.abs(month)}月` : '';
  } catch (error) {
    console.error('閏月判斷失敗:', error);
    formData.isLeapMonth = false;
    leapMonthInfo.value = '';
  }
};

// 監聽出生日期變化，自動判斷閏月
watch(() => formData.birthDate, detectLeapMonth);

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
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: stretch;
}

/* Input fields - WCAG AA compliant 44px touch targets */
:deep(.el-input__inner) {
  min-height: 44px;
}

/* Field hint text */
.field-hint {
  margin-top: var(--space-xs);
  padding: var(--space-xs) 0;
}

.field-hint :deep(.el-text) {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--text-tertiary);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  min-width: 44px;
  min-height: 44px;
  font-size: 16px !important; /* Prevent iOS zoom */
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-sm);
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

/* Radio buttons - WCAG AA compliant touch targets with padding */
:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: clamp(var(--space-md), 2vw, var(--space-lg));
}

:deep(.el-radio) {
  margin-right: 0;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
}

:deep(.el-radio__input) {
  line-height: 44px;
}

:deep(.el-radio__label) {
  font-size: var(--font-size-base);
  padding: var(--space-sm);
  line-height: var(--line-height-normal);
  cursor: pointer;
}

/* Select dropdowns - full width with touch targets */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  min-height: 44px;
}

/* Address input with append button - WCAG AA compliant */
:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  min-height: 44px;
  min-width: 44px;
  padding: 0 var(--space-lg);
}

/* Coordinate inputs - mobile-first stacked layout with Flexbox */
.coordinate-inputs {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: clamp(var(--space-md), 2vw, var(--space-lg));
  width: 100%;
}

.coordinate-field {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
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

/* Checkbox - WCAG AA compliant touch targets */
:deep(.el-checkbox) {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
}

:deep(.el-checkbox__label) {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  padding: var(--space-sm);
  cursor: pointer;
}

/* Button group - flexible layout with Flexbox */
.button-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
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

/* Disable hover effects on touch devices */
@media (hover: none) {
  .submit-btn:not(:disabled):hover {
    transform: none;
    box-shadow: none;
  }

  .clear-btn:hover {
    transform: none;
    box-shadow: none;
  }
}

/* Mobile responsive button layout (< 768px) */
@media (max-width: 767px) {
  /* Force vertical layout for form items */
  :deep(.el-form-item) {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--space-lg);
  }

  :deep(.el-form-item__label) {
    display: block;
    width: 100%;
    text-align: left;
    margin-bottom: var(--space-sm);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    padding: 0;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }

  /* Ensure inputs take full width */
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-picker) {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    width: 100%;
  }

  /* Button group vertical layout */
  .button-group {
    flex-direction: column;
  }

  .button-group :deep(.el-button) {
    min-height: 44px;
  }
}

/* Submit button - WCAG AA compliant touch targets */
:deep(.el-button) {
  width: 100%;
  min-height: 48px;
  min-width: 44px;
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

/* Success state for validated fields */
:deep(.el-form-item.is-success .el-input__wrapper) {
  border-color: var(--el-color-success);
}

:deep(.el-form-item.is-success .el-input__wrapper:hover) {
  border-color: var(--el-color-success);
}

/* Error state enhancement */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: var(--el-color-danger);
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

/* Mobile-specific validation styles */
@media (max-width: 767px) {
  :deep(.el-form-item__error) {
    font-size: var(--font-size-sm);
    padding: var(--space-sm);
    margin-top: var(--space-xs);
    margin-bottom: var(--space-sm);
    position: relative;
    background: rgba(245, 108, 108, 0.1);
    border-radius: var(--radius-sm);
    color: var(--error-color, var(--el-color-danger));
    line-height: var(--line-height-normal);
  }

  /* Ensure error messages don't overlap with inputs */
  :deep(.el-form-item) {
    margin-bottom: 1.5rem;
  }

  /* Larger touch targets for validation feedback */
  :deep(.el-input__wrapper) {
    min-height: 48px;
  }

  :deep(.el-select .el-input__wrapper) {
    min-height: 48px;
  }
}

/* ==========================================
   Tablet and above (≥ 768px)
   ========================================== */
@media (min-width: 768px) {
  /* Coordinate inputs - 2 column layout (Grid for page-level) */
  .coordinate-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .timezone-field {
    grid-column: 1 / -1;
  }

  /* Radio buttons - horizontal on larger screens with Flexbox */
  :deep(.el-radio-group) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: clamp(var(--space-lg), 2vw, var(--space-2xl));
  }
}

/* ==========================================
   Desktop (≥ 1024px)
   ========================================== */
@media (min-width: 1024px) {
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
   Large Desktop (≥ 1440px)
   ========================================== */
@media (min-width: 1440px) {
  :deep(.el-form-item__label) {
    font-size: var(--font-size-base);
  }

  :deep(.el-button) {
    font-size: var(--font-size-base);
  }
}
</style>
