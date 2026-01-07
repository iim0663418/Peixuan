<template>
  <el-form
    ref="unifiedForm"
    :model="formData"
    :rules="formRules"
    :validate-on-rule-change="false"
    label-position="top"
    @submit.prevent="submitForm"
  >
    <el-form-item :label="$t('unifiedForm.birth_info')" />

    <el-form-item :label="$t('unifiedForm.birth_date')" prop="birthDate">
      <el-date-picker
        id="birth-date"
        v-model="formData.birthDate"
        type="date"
        :placeholder="$t('unifiedForm.birth_date_placeholder')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item :label="$t('unifiedForm.birth_time')" prop="birthTime">
      <el-time-picker
        v-model="formData.birthTime"
        :placeholder="$t('unifiedForm.birth_time_placeholder')"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item :label="$t('unifiedForm.gender')" prop="gender">
      <el-radio-group v-model="formData.gender">
        <el-radio value="male">{{ $t('unifiedForm.gender_male') }}</el-radio>
        <el-radio value="female">{{
          $t('unifiedForm.gender_female')
        }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 地點輸入 (Autocomplete with Progressive Disclosure) -->
    <el-form-item :label="$t('unifiedForm.location_input_label')">
      <el-autocomplete
        v-model="addressInput"
        :fetch-suggestions="querySearch"
        :placeholder="$t('unifiedForm.location_input_placeholder')"
        :loading="geocoding"
        clearable
        value-key="value"
        @select="handleLocationSelect"
      >
        <template #default="{ item }">
          <div class="autocomplete-item">
            <span class="autocomplete-label">{{ item.label }}</span>
          </div>
        </template>
      </el-autocomplete>

      <!-- 說明文字與 Esri 歸屬聲明 -->
      <div class="field-hint">
        <el-text type="info" size="small">
          {{ $t('unifiedForm.location_input_hint') }}
        </el-text>
        <el-text class="esri-attribution" type="info" size="small">
          Powered by Esri
        </el-text>
      </div>

      <!-- 地址解析狀態顯示 -->
      <div v-if="geocodeStatus.message" class="geocode-status">
        <el-text :type="geocodeStatus.type" size="small">
          {{ geocodeStatus.message }}
        </el-text>
      </div>
    </el-form-item>

    <!-- Advanced Options Toggle -->
    <el-form-item>
      <el-button
        text
        class="advanced-options-toggle"
        @click="showAdvancedOptions = !showAdvancedOptions"
      >
        {{
          showAdvancedOptions
            ? $t('unifiedForm.hide_advanced')
            : $t('unifiedForm.show_advanced')
        }}
        <el-icon :class="{ 'rotate-icon': showAdvancedOptions }">
          <ArrowDown />
        </el-icon>
      </el-button>
    </el-form-item>

    <!-- 精確地理位置輸入 (Hidden in Advanced Options) -->
    <el-collapse-transition>
      <div v-show="showAdvancedOptions">
        <el-form-item
          :label="$t('unifiedForm.manual_coordinates_label')"
          prop="location"
          class="location-form-item"
        >
          <div class="coordinate-inputs">
            <div class="coordinate-field">
              <el-form-item prop="longitude">
                <el-input
                  v-model.number="formData.longitude"
                  :placeholder="$t('unifiedForm.longitude_placeholder')"
                  type="number"
                  :min="-180"
                  :max="180"
                  :step="0.000001"
                  class="coordinate-input"
                >
                  <template #prepend>{{
                    $t('unifiedForm.longitude')
                  }}</template>
                </el-input>
              </el-form-item>
            </div>
            <div class="coordinate-field">
              <el-form-item prop="latitude">
                <el-input
                  v-model.number="formData.latitude"
                  :placeholder="$t('unifiedForm.latitude_placeholder')"
                  type="number"
                  :min="-90"
                  :max="90"
                  :step="0.000001"
                  class="coordinate-input"
                >
                  <template #prepend>{{ $t('unifiedForm.latitude') }}</template>
                </el-input>
              </el-form-item>
            </div>
            <div class="coordinate-field timezone-field">
              <el-select
                v-model="formData.timezone"
                filterable
                :placeholder="$t('unifiedForm.timezone_placeholder')"
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
            {{ $t('unifiedForm.manual_coordinates_hint') }}
          </el-text>
        </el-form-item>
      </div>
    </el-collapse-transition>

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
          {{
            hasCache
              ? $t('unifiedForm.submit_button_cached')
              : $t('unifiedForm.submit_button')
          }}
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
              :aria-label="$t('unifiedForm.clear_cache')"
              :aria-describedby="
                showClearCachePopover ? 'clear-cache-popover' : undefined
              "
              @click="toggleClearCachePopover"
            >
              {{ $t('unifiedForm.clear_cache') }}
            </el-button>
          </template>
          <div id="clear-cache-popover" role="tooltip">
            {{ $t('unifiedForm.clear_cache_confirm') }}
          </div>
        </el-popover>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Lock, Check, Delete, ArrowDown } from '@element-plus/icons-vue';
import { saveTimeZoneInfo, getTimeZoneInfo } from '../utils/storageService';
import { useChartStore } from '../stores/chartStore';
import { useFormData } from '../composables/useFormData';
import { useFormValidation } from '../composables/useFormValidation';
import {
  useGeocoding,
  type AutocompleteOption,
} from '../composables/useGeocoding';

const chartStore = useChartStore();

// Advanced options toggle state
const showAdvancedOptions = ref(false);

// 使用表單資料管理 composable
const { formData, timezones, majorCities, leapMonthInfo, detectLeapMonth } =
  useFormData();

// 使用表單驗證 composable
const { createFormRules } = useFormValidation();

// 使用地理編碼 composable
const {
  addressInput,
  geocoding,
  geocodeStatus,
  queryAutocompleteSearch,
  handleAutocompleteSelect,
} = useGeocoding();

// 檢查是否有快取(鎖定表單)
const hasCache = computed(() => !!chartStore.chartId);

// 清除快取 Popover 狀態
const showClearCachePopover = ref(false);

// 切換清除快取 Popover
const toggleClearCachePopover = (event?: MouseEvent) => {
  if (event) {
    event.stopPropagation();
  }

  if (showClearCachePopover.value) {
    clearCache();
  } else {
    showClearCachePopover.value = true;

    const closePopover = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.clear-btn') && !target.closest('.el-popover')) {
        showClearCachePopover.value = false;
        document.removeEventListener('click', closePopover);
      }
    };

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

const unifiedForm = ref();

// 創建表單驗證規則
const formRules = createFormRules(formData);

// Autocomplete query search handler
const querySearch = (
  queryString: string,
  cb: (results: AutocompleteOption[]) => void,
) => {
  queryAutocompleteSearch(queryString, cb, majorCities.value);
};

// Handle location selection from autocomplete
const handleLocationSelect = (item: AutocompleteOption) => {
  const coords = handleAutocompleteSelect(item);
  if (coords) {
    formData.longitude = coords.longitude;
    formData.latitude = coords.latitude;
    if (coords.timezone) {
      formData.timezone = coords.timezone;
    }
  }
};

// Track if user has interacted with the form to prevent premature validation
const hasUserInteracted = ref(false);

// 從 sessionStorage 加載保存的時區資訊
onMounted(() => {
  const savedTimezone = getTimeZoneInfo();
  if (savedTimezone && savedTimezone.timeZone) {
    formData.timezone = savedTimezone.timeZone;
  }

  // Mark as interacted after initial mount to allow validation on subsequent changes
  setTimeout(() => {
    hasUserInteracted.value = true;
  }, 100);
});

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

// Real-time validation for form fields (only after user interaction)
watch(
  () => formData.birthDate,
  () => {
    if (unifiedForm.value && hasUserInteracted.value) {
      unifiedForm.value.validateField('birthDate');
    }
    detectLeapMonth();
  },
);

watch(
  () => formData.birthTime,
  () => {
    if (unifiedForm.value && hasUserInteracted.value) {
      unifiedForm.value.validateField('birthTime');
    }
  },
);

watch(
  () => formData.gender,
  () => {
    if (unifiedForm.value && hasUserInteracted.value) {
      unifiedForm.value.validateField('gender');
    }
  },
);

watch(
  () => [formData.longitude, formData.latitude, formData.timezone],
  () => {
    if (unifiedForm.value && hasUserInteracted.value) {
      unifiedForm.value.validateField('location');
    }
  },
);

const submitForm = async () => {
  if (!unifiedForm.value) {
    return;
  }

  try {
    const isValid = await unifiedForm.value.validate();
    if (isValid) {
      if (!formData.birthDate || !formData.birthTime || !formData.gender) {
        ElMessage.error('請填寫完整的出生資訊');
        return;
      }

      if (formData.longitude === null || formData.longitude === undefined) {
        ElMessage.error('請提供出生地經度資訊');
        return;
      }

      const [year] = formData.birthDate.split('-').map(Number);
      saveTimeZoneInfo(formData.timezone, year);

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

<style scoped src="../styles/UnifiedInputForm.css"></style>
