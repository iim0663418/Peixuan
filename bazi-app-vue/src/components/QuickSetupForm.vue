<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item :label="$t('unifiedForm.birth_date')" prop="birthDate">
      <el-date-picker
        v-model="formData.birthDate"
        type="date"
        :placeholder="$t('unifiedForm.birth_date_placeholder')"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item :label="$t('unifiedForm.birth_time')" prop="birthTime">
      <el-time-picker
        v-model="formData.birthTime"
        :placeholder="$t('unifiedForm.birth_time_placeholder')"
        format="HH:mm"
        value-format="HH:mm"
        style="width: 100%"
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

    <el-form-item :label="$t('unifiedForm.city_label')" prop="city">
      <el-select
        v-model="formData.city"
        filterable
        :placeholder="$t('unifiedForm.city_placeholder')"
        style="width: 100%"
        @change="fillCityCoordinates"
      >
        <el-option
          v-for="city in majorCities"
          :key="city.value"
          :label="city.label"
          :value="city.value"
        />
      </el-select>
      <div class="field-hint">
        <el-text type="info" size="small">
          {{ $t('unifiedForm.city_hint') }}
        </el-text>
      </div>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        style="width: 100%"
        size="large"
        @click="handleSubmit"
      >
        {{ $t('unifiedForm.submit_button') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useChartStore } from '@/stores/chartStore';
import { useFormData } from '@/composables/useFormData';

const emit = defineEmits<{
  (e: 'chart-created'): void;
}>();

const { t } = useI18n();
const chartStore = useChartStore();
const { majorCities } = useFormData();
const formRef = ref<FormInstance>();
const isSubmitting = ref(false);

const formData = reactive({
  birthDate: '',
  birthTime: '',
  gender: 'male' as 'male' | 'female',
  city: '',
  longitude: 0,
  latitude: 0,
  timezone: 'Asia/Taipei',
});

const formRules: FormRules = {
  birthDate: [
    {
      required: true,
      message: t('unifiedForm.birth_date_required'),
      trigger: 'blur',
    },
  ],
  birthTime: [
    {
      required: true,
      message: t('unifiedForm.birth_time_required'),
      trigger: 'blur',
    },
  ],
  gender: [
    {
      required: true,
      message: t('unifiedForm.gender_required'),
      trigger: 'change',
    },
  ],
  city: [
    {
      required: true,
      message: t('unifiedForm.city_required'),
      trigger: 'change',
    },
  ],
};

const fillCityCoordinates = () => {
  const selectedCity = majorCities.value.find(
    (city) => city.value === formData.city,
  );
  if (selectedCity) {
    formData.longitude = selectedCity.longitude;
    formData.latitude = selectedCity.latitude;
    formData.timezone = selectedCity.timezone || 'Asia/Taipei';
  }
};

const handleSubmit = async () => {
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();

    isSubmitting.value = true;

    // Call the chart calculation API
    const response = await fetch('/api/v1/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        gender: formData.gender,
        longitude: formData.longitude,
        latitude: formData.latitude,
        timezone: formData.timezone,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // Save to store and localStorage
    chartStore.setCurrentChart(result);

    ElMessage.success(t('unifiedForm.submit_success'));

    // Emit success event
    emit('chart-created');
  } catch (error: any) {
    console.error('Failed to create chart:', error);
    if (error.errors) {
      // Validation errors
      return;
    }
    ElMessage.error(t('unifiedForm.submit_error'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.field-hint {
  margin-top: 4px;
  font-size: 12px;
}
</style>
