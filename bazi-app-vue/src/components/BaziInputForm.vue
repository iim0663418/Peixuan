<template>
  <el-form
    ref="baziForm"
    :model="birthInfo"
    :rules="formRules"
    @submit.prevent="submitForm"
  >
    <el-form-item :label="$t('astrology.bazi_detail.form.title')" />

    <el-form-item
      :label="$t('astrology.bazi_detail.form.birth_date')"
      prop="birthDate"
    >
      <el-date-picker
        v-model="birthInfo.birthDate"
        type="date"
        :placeholder="$t('astrology.bazi_detail.form.birth_date')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item
      :label="$t('astrology.bazi_detail.form.birth_time')"
      prop="birthTime"
    >
      <el-time-picker
        v-model="birthInfo.birthTime"
        :placeholder="$t('astrology.bazi_detail.form.birth_time')"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-form-item
      :label="$t('astrology.bazi_detail.form.gender')"
      prop="gender"
    >
      <el-radio-group v-model="birthInfo.gender">
        <el-radio :value="'male'">{{ $t('form.genderOptions.male') }}</el-radio>
        <el-radio :value="'female'">{{
          $t('form.genderOptions.female')
        }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item
      :label="$t('astrology.bazi_detail.form.location')"
      prop="location"
    >
      <el-input
        v-model="birthInfo.location"
        placeholder="出生地點（選填，影響真太陽時計算）"
      />
      <el-text type="info" size="small" style="margin-top: 5px; display: block">
        註：八字計算主要依賴時間，地點為選填項目
      </el-text>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">
        {{ $t('form.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { BirthInfo } from '@/services/astrologyIntegrationService';
import {
  FrontendValidator,
  type ValidationResult,
} from '@/utils/frontendValidation';

const emit = defineEmits(['submit']);

const birthInfo = reactive<BirthInfo>({
  birthDate: '',
  birthTime: '',
  gender: 'male', // 設置預設值為 'male'，避免類型錯誤
  location: '',
});

const formRules = {
  birthDate: [{ required: true, message: '請選擇出生日期', trigger: 'change' }],
  birthTime: [{ required: true, message: '請選擇出生時間', trigger: 'change' }],
  gender: [{ required: true, message: '請選擇性別', trigger: 'change' }],
};

const submitForm = () => {
  // 使用前端驗證工具進行表單驗證
  const validationResult: ValidationResult = FrontendValidator.validateBaziForm(
    {
      birthDate: birthInfo.birthDate,
      birthTime: birthInfo.birthTime,
      gender: birthInfo.gender,
      location: { timezone: 'Asia/Taipei' }, // 八字計算時區影響較小，使用預設值
    },
  );

  if (!validationResult.isValid) {
    ElMessage.error(validationResult.errors.join('、'));
    return;
  }

  // 檢查 lunar-javascript 是否可用
  const libraryCheck = FrontendValidator.checkLunarLibrary();
  if (!libraryCheck.isValid) {
    ElMessage.error(libraryCheck.errors.join('、'));
    return;
  }

  emit('submit', birthInfo);
};
</script>

<style scoped>
/* 響應式表單優化 */
.el-form {
  width: 100%;
}

/* 確保表單項目在小螢幕上正確顯示 */
:deep(.el-form-item__label) {
  font-size: 14px;
  line-height: 1.4;
}

:deep(.el-form-item__content) {
  flex: 1;
}

/* 日期和時間選擇器優化 */
:deep(.el-date-editor),
:deep(.el-time-picker) {
  width: 100%;
}

/* 單選按鈕組優化 */
:deep(.el-radio-group) {
  display: flex;
  gap: 15px;
}

:deep(.el-radio) {
  margin-right: 0;
  white-space: nowrap;
}

/* 提交按鈕優化 */
:deep(.el-button) {
  min-height: 44px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
}

/* 移動端優化 */
@media (max-width: 768px) {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-size: 15px;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  /* 單選按鈕在小螢幕上垂直排列 */
  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 12px;
  }

  :deep(.el-radio) {
    align-items: center;
  }

  :deep(.el-radio__label) {
    font-size: 16px;
    padding-left: 8px;
  }

  /* 按鈕在小螢幕上全寬 */
  :deep(.el-button) {
    width: 100%;
    min-height: 48px;
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
  }

  :deep(.el-input__inner) {
    font-size: 16px;
    padding: 12px 15px;
  }

  /* 防止iOS縮放 */
  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    font-size: 16px !important;
  }
}
</style>
