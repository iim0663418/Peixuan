<template>
  <el-form 
    ref="baziForm"
    :model="birthInfo" 
    :rules="formRules"
    @submit.prevent="submitForm"
  >
    <el-form-item :label="$t('astrology.bazi_detail.form.title')" />
    
    <el-form-item :label="$t('astrology.bazi_detail.form.birth_date')" prop="birthDate">
      <el-date-picker
        v-model="birthInfo.birthDate"
        type="date"
        :placeholder="$t('astrology.bazi_detail.form.birth_date')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item :label="$t('astrology.bazi_detail.form.birth_time')" prop="birthTime">
      <el-time-picker
        v-model="birthInfo.birthTime"
        :placeholder="$t('astrology.bazi_detail.form.birth_time')"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item :label="$t('astrology.bazi_detail.form.gender')" prop="gender">
      <el-radio-group v-model="birthInfo.gender">
        <el-radio :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio>
        <el-radio :value="'female'">{{ $t('form.genderOptions.female') }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item :label="$t('astrology.bazi_detail.form.location')" prop="location">
      <el-input v-model="birthInfo.location" />
    </el-form-item>

    <el-form-item>
      <el-button 
        type="primary" 
        @click="submitForm"
      >
        {{ $t('form.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { BirthInfo } from '@/services/astrologyIntegrationService';

const emit = defineEmits(['submit']);

const birthInfo = reactive<BirthInfo>({
  birthDate: '',
  birthTime: '',
  gender: 'male', // 設置預設值為 'male'，避免類型錯誤
  location: ''
});

const formRules = {
  birthDate: [
    { required: true, message: '請選擇出生日期', trigger: 'change' }
  ],
  birthTime: [
    { required: true, message: '請選擇出生時間', trigger: 'change' }
  ],
  gender: [
    { required: true, message: '請選擇性別', trigger: 'change' }
  ]
};

const submitForm = () => {
  emit('submit', birthInfo);
};
</script>
