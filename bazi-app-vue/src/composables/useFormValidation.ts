/**
 * Form validation composable for UnifiedInputForm
 */
import type { FormValidationRule, FormRules } from '../types/formValidation';

export function useFormValidation() {
  const createBirthDateRules = (): FormValidationRule[] => [
    { required: true, message: '請選擇出生日期', trigger: 'change' },
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
          callback(new Error('出生日期不能是未來日期'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ];

  const createBirthTimeRules = (): FormValidationRule[] => [
    { required: true, message: '請選擇出生時間', trigger: 'change' },
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
          callback(new Error('時間格式錯誤，請使用 HH:mm 格式（例如：14:30）'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ];

  const createGenderRules = (): FormValidationRule[] => [
    { required: true, message: '請選擇性別', trigger: ['change', 'blur'] },
  ];

  const createLongitudeRules = (): FormValidationRule[] => [
    { required: true, message: '請輸入經度', trigger: ['change', 'blur'] },
    { type: 'number', message: '經度必須是數字', trigger: ['change', 'blur'] },
    {
      validator: (
        _rule: FormValidationRule,
        value: unknown,
        callback: (error?: Error) => void,
      ) => {
        if (value === null || value === undefined) {
          callback();
          return;
        }
        const numValue = value as number;
        if (numValue < -180 || numValue > 180) {
          callback(new Error('經度必須在 -180 到 180 之間'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ];

  const createLatitudeRules = (): FormValidationRule[] => [
    { required: true, message: '請輸入緯度', trigger: ['change', 'blur'] },
    { type: 'number', message: '緯度必須是數字', trigger: ['change', 'blur'] },
    {
      validator: (
        _rule: FormValidationRule,
        value: unknown,
        callback: (error?: Error) => void,
      ) => {
        if (value === null || value === undefined) {
          callback();
          return;
        }
        const numValue = value as number;
        if (numValue < -90 || numValue > 90) {
          callback(new Error('緯度必須在 -90 到 90 之間'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ];

  const createLocationRules = (formData: {
    longitude: number | null;
    latitude: number | null;
    timezone: string;
  }): FormValidationRule[] => [
    {
      validator: (
        _rule: FormValidationRule,
        _value: unknown,
        callback: (error?: Error) => void,
      ) => {
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
      trigger: 'blur',
    },
  ];

  const createFormRules = (formData: {
    longitude: number | null;
    latitude: number | null;
    timezone: string;
  }): FormRules => ({
    birthDate: createBirthDateRules(),
    birthTime: createBirthTimeRules(),
    gender: createGenderRules(),
    longitude: createLongitudeRules(),
    latitude: createLatitudeRules(),
    location: createLocationRules(formData),
  });

  return {
    createFormRules,
  };
}
