/**
 * Form validation composable for UnifiedInputForm
 */
import type { FormValidationRule, FormRules } from '../types/formValidation';

export function useFormValidation() {
  const createFormRules = (
    formData: {
      addressInput: string;
      longitude: number | null;
      latitude: number | null;
    },
    // eslint-disable-next-line no-unused-vars
    t: (key: string) => string,
  ): FormRules => ({
    birthDate: [
      {
        required: true,
        message: t('unifiedForm.birth_date_required'),
        trigger: 'change',
      },
      {
        validator: (
          _rule: FormValidationRule,
          value: unknown,
          callback: (error?: Error) => void,
        ) => {
          if (!value) {
            callback();
            return;
          }
          const selectedDate = new Date(value as string);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) {
            callback(new Error(t('unifiedForm.birth_date_future')));
            return;
          }
          callback();
        },
        trigger: ['change', 'blur'],
      },
    ],

    birthTime: [
      {
        required: true,
        message: t('unifiedForm.birth_time_required'),
        trigger: 'change',
      },
      {
        validator: (
          _rule: FormValidationRule,
          value: unknown,
          callback: (error?: Error) => void,
        ) => {
          if (!value) {
            callback();
            return;
          }
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!timeRegex.test(value as string)) {
            callback(new Error(t('unifiedForm.birth_time_invalid')));
            return;
          }
          callback();
        },
        trigger: ['change', 'blur'],
      },
    ],

    gender: [
      {
        required: true,
        message: t('unifiedForm.gender_required'),
        trigger: ['change', 'blur'],
      },
    ],

    // 地址驗證：地址與經緯度至少填寫之一
    addressInput: [
      {
        validator: (
          _rule: FormValidationRule,
          _value: unknown,
          callback: (error?: Error) => void,
        ) => {
          const hasAddress =
            formData.addressInput && formData.addressInput.trim().length > 0;
          const hasCoordinates =
            formData.longitude !== null && 
            formData.latitude !== null &&
            formData.longitude !== 0 &&
            formData.latitude !== 0;

          // 優先檢查經緯度：如果有經緯度，就不需要地址
          if (hasCoordinates) {
            callback();
            return;
          }

          // 如果沒有經緯度，則必須有地址
          if (!hasAddress) {
            callback(
              new Error(t('unifiedForm.address_or_coordinates_required')),
            );
            return;
          }
          
          callback();
        },
        trigger: 'blur',
      },
    ],

    // 經度：可選，但若填寫則驗證範圍
    longitude: [
      {
        validator: (
          _rule: FormValidationRule,
          value: unknown,
          callback: (error?: Error) => void,
        ) => {
          if (value === null || value === undefined || value === '') {
            callback();
            return;
          }
          const numValue = Number(value);
          if (isNaN(numValue)) {
            callback(new Error(t('unifiedForm.longitude_invalid')));
            return;
          }
          if (numValue < -180 || numValue > 180) {
            callback(new Error(t('unifiedForm.longitude_range')));
            return;
          }
          callback();
        },
        trigger: ['change', 'blur'],
      },
    ],

    // 緯度：可選，但若填寫則驗證範圍
    latitude: [
      {
        validator: (
          _rule: FormValidationRule,
          value: unknown,
          callback: (error?: Error) => void,
        ) => {
          if (value === null || value === undefined || value === '') {
            callback();
            return;
          }
          const numValue = Number(value);
          if (isNaN(numValue)) {
            callback(new Error(t('unifiedForm.latitude_invalid')));
            return;
          }
          if (numValue < -90 || numValue > 90) {
            callback(new Error(t('unifiedForm.latitude_range')));
            return;
          }
          callback();
        },
        trigger: ['change', 'blur'],
      },
    ],
  });

  return {
    createFormRules,
  };
}
