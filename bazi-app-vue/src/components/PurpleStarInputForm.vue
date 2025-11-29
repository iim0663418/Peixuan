<template>
  <el-form
    ref="purpleStarForm"
    :model="formData"
    :rules="formRules"
    @submit.prevent="submitForm"
  >
    <el-form-item :label="$t('astrology.purple_star_detail.form.title')" />

    <el-form-item
      :label="$t('astrology.purple_star_detail.form.birth_date')"
      prop="birthDate"
    >
      <el-date-picker
        v-model="formData.birthDate"
        type="date"
        :placeholder="$t('astrology.purple_star_detail.form.birth_date')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item
      :label="$t('astrology.purple_star_detail.form.birth_time')"
      prop="birthTime"
    >
      <el-time-picker
        v-model="formData.birthTime"
        :placeholder="$t('astrology.purple_star_detail.form.birth_time')"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item
      :label="$t('astrology.purple_star_detail.form.gender')"
      prop="gender"
    >
      <el-radio-group v-model="formData.gender">
        <el-radio :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio>
        <el-radio :value="'female'">{{
          $t('form.genderOptions.female')
        }}</el-radio>
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
      <div
        v-if="geocodeStatus.message"
        class="geocode-status"
        style="margin-top: 5px"
      >
        <el-text :type="geocodeStatus.type" size="small">
          {{ geocodeStatus.message }}
        </el-text>
      </div>

      <!-- 多候選地址選擇 -->
      <el-select
        v-if="candidateAddresses.length > 1"
        v-model="selectedCandidateIndex"
        placeholder="發現多個匹配地址，請選擇最準確的"
        style="width: 100%; margin-top: 8px"
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
    <el-form-item label="出生地點座標（精確計算必需）" prop="location">
      <el-row :gutter="12">
        <el-col :span="10">
          <el-input
            v-model.number="formData.longitude"
            placeholder="經度"
            type="number"
            :min="-180"
            :max="180"
            :step="0.000001"
          >
            <template #prepend>經度</template>
          </el-input>
        </el-col>
        <el-col :span="10">
          <el-input
            v-model.number="formData.latitude"
            placeholder="緯度"
            type="number"
            :min="-90"
            :max="90"
            :step="0.000001"
          >
            <template #prepend>緯度</template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="formData.timezone"
            filterable
            placeholder="時區"
            style="width: 100%"
          >
            <el-option
              v-for="tz in timezones"
              :key="tz.value"
              :label="tz.label"
              :value="tz.value"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-text
        type="warning"
        size="small"
        style="margin-top: 5px; display: block"
      >
        ⚠️ 精確的經緯度和時區資訊對紫微斗數計算準確性至關重要
        <el-tooltip content="可輸入中文地址自動轉換，或手動輸入經緯度座標">
          <el-icon><QuestionFilled /></el-icon>
        </el-tooltip>
      </el-text>
    </el-form-item>

    <!-- 快速城市選擇（可選） -->
    <el-form-item label="或選擇常用城市（自動填入座標）">
      <el-select
        v-model="selectedCity"
        filterable
        placeholder="選擇城市快速填入座標"
        style="width: 100%"
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

    <el-form-item>
      <el-button type="primary" @click="submitForm">
        {{ $t('form.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import { saveTimeZoneInfo, getTimeZoneInfo } from '../utils/storageService';
import {
  GeocodeService,
  type GeocodeCandidate,
} from '../services/geocodeService';

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
    // 只有在沒有通過地址解析填入座標時才覆蓋
    if (!addressInput.value || candidateAddresses.value.length === 0) {
      formData.longitude = city.longitude;
      formData.latitude = city.latitude;
      formData.timezone = city.timezone;
      clearGeocodeStatus();
    }
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
        // 驗證經度
        if (formData.longitude === null || formData.longitude === undefined) {
          callback(new Error('請輸入出生地經度（可選擇城市自動填入）'));
          return;
        }
        if (formData.longitude < -180 || formData.longitude > 180) {
          callback(new Error('經度必須在 -180 到 180 之間'));
          return;
        }

        // 驗證緯度
        if (formData.latitude === null || formData.latitude === undefined) {
          callback(new Error('請輸入出生地緯度（可選擇城市自動填入）'));
          return;
        }
        if (formData.latitude < -90 || formData.latitude > 90) {
          callback(new Error('緯度必須在 -90 到 90 之間'));
          return;
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

const purpleStarForm = ref();

const submitForm = async () => {
  if (!purpleStarForm.value) {
    return;
  }

  try {
    const isValid = await purpleStarForm.value.validate();
    if (isValid) {
      // 驗證通過，檢查必填欄位
      if (!formData.birthDate || !formData.birthTime || !formData.gender) {
        ElMessage.error('請填寫完整的出生資訊');
        return;
      }

      // 解析日期和時間
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hour, minute] = formData.birthTime.split(':').map(Number);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hour) ||
        isNaN(minute)
      ) {
        ElMessage.error('日期時間格式錯誤');
        return;
      }

      // 檢查 lunar-javascript 是否可用
      if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
        ElMessage.error('lunar-javascript 庫未正確載入，請重新整理頁面');
        return;
      }

      console.log('農曆轉換輸入:', { year, month, day, hour, minute });

      // 直接使用解析出的數值創建 Solar 實例，避免 Date 對象的潛在問題
      const solarInstance = Solar.fromYmdHms(year, month, day, hour, minute, 0);
      const lunarDate = solarInstance.getLunar();

      // 保存時區資訊到 sessionStorage
      saveTimeZoneInfo(formData.timezone, year);

      // 驗證位置資訊
      if (formData.longitude === null || formData.latitude === null) {
        ElMessage.error('請提供完整的出生地理位置資訊（經度和緯度）');
        return;
      }

      // 構建發送給後端的資料格式
      const birthInfo = {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        gender: formData.gender,
        location: {
          longitude: formData.longitude,
          latitude: formData.latitude,
          timezone: formData.timezone,
        },
        lunarInfo: {
          year: lunarDate.getYear(),
          month: lunarDate.getMonth(),
          day: lunarDate.getDay(),
          hour: lunarDate.getHour(),
          yearGan: lunarDate.getYearGan(),
          yearZhi: lunarDate.getYearZhi(),
          monthGan: lunarDate.getMonthGan(),
          monthZhi: lunarDate.getMonthZhi(),
          dayGan: lunarDate.getDayGan(),
          dayZhi: lunarDate.getDayZhi(),
          timeGan: lunarDate.getTimeGan(),
          timeZhi: lunarDate.getTimeZhi(),
          yearInGanZhi: lunarDate.getYearInGanZhi(),
          monthInGanZhi: lunarDate.getMonthInGanZhi(),
          dayInGanZhi: lunarDate.getDayInGanZhi(),
          timeInGanZhi: lunarDate.getTimeInGanZhi(),
        },
      };

      console.log('前端農曆轉換結果:', birthInfo.lunarInfo);

      // 額外檢查農曆轉換結果是否有效
      if (
        birthInfo.lunarInfo.year &&
        !isNaN(birthInfo.lunarInfo.year) &&
        birthInfo.lunarInfo.month &&
        birthInfo.lunarInfo.day
      ) {
        emit('submit', birthInfo);
      } else {
        console.error('農曆轉換結果無效:', birthInfo.lunarInfo);
        ElMessage.error('農曆轉換失敗，請確認日期時間輸入正確');
      }
    }
  } catch (error) {
    console.error('表單驗證或農曆轉換失敗:', error);
    ElMessage.error('農曆轉換或表單驗證失敗，請檢查輸入資料');
  }
};
</script>
