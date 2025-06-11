// backend-node/src/utils/validation.ts
// 請求驗證工具

import { PurpleStarCalculationRequest, ValidationError } from '../types/purpleStarTypes';

export class RequestValidator {
  private errors: ValidationError[] = [];

  public validatePurpleStarRequest(request: any): { isValid: boolean; errors: ValidationError[] } {
    this.errors = [];

    // 驗證必需字段
    this.validateBirthDate(request.birthDate);
    this.validateBirthTime(request.birthTime);
    this.validateGender(request.gender);
    this.validateLunarInfo(request.lunarInfo);

    // 驗證可選字段
    if (request.location) {
      this.validateLocation(request.location);
    }

    if (request.options) {
      this.validateOptions(request.options);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    };
  }

  private validateBirthDate(birthDate: any): void {
    if (!birthDate) {
      this.addError('birthDate', '出生日期為必需字段', 'REQUIRED');
      return;
    }

    if (typeof birthDate !== 'string') {
      this.addError('birthDate', '出生日期必須為字符串格式', 'INVALID_TYPE');
      return;
    }

    // 驗證日期格式 YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      this.addError('birthDate', '出生日期格式必須為 YYYY-MM-DD', 'INVALID_FORMAT');
      return;
    }

    // 驗證日期有效性
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      this.addError('birthDate', '無效的出生日期', 'INVALID_DATE');
      return;
    }

    // 驗證日期範圍（1900-2100）
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      this.addError('birthDate', '出生年份必須在 1900-2100 之間', 'OUT_OF_RANGE');
    }
  }

  private validateBirthTime(birthTime: any): void {
    if (!birthTime) {
      this.addError('birthTime', '出生時間為必需字段', 'REQUIRED');
      return;
    }

    if (typeof birthTime !== 'string') {
      this.addError('birthTime', '出生時間必須為字符串格式', 'INVALID_TYPE');
      return;
    }

    // 驗證時間格式 HH:MM 或 HH:MM:SS
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(birthTime)) {
      this.addError('birthTime', '出生時間格式必須為 HH:MM 或 HH:MM:SS', 'INVALID_FORMAT');
    }
  }

  private validateGender(gender: any): void {
    if (!gender) {
      this.addError('gender', '性別為必需字段', 'REQUIRED');
      return;
    }

    if (typeof gender !== 'string') {
      this.addError('gender', '性別必須為字符串格式', 'INVALID_TYPE');
      return;
    }

    if (!['male', 'female'].includes(gender)) {
      this.addError('gender', '性別必須為 "male" 或 "female"', 'INVALID_VALUE');
    }
  }

  private validateLunarInfo(lunarInfo: any): void {
    if (!lunarInfo) {
      this.addError('lunarInfo', '農曆資訊為必需字段', 'REQUIRED');
      return;
    }

    if (typeof lunarInfo !== 'object' || lunarInfo === null) {
      this.addError('lunarInfo', '農曆資訊必須為對象', 'INVALID_TYPE');
      return;
    }

    // 驗證數字字段
    const numberFields = ['year', 'month', 'day', 'hour'];
    numberFields.forEach(field => {
      if (lunarInfo[field] === undefined || lunarInfo[field] === null) {
        this.addError(`lunarInfo.${field}`, `農曆${field}為必需字段`, 'REQUIRED');
      } else if (typeof lunarInfo[field] !== 'number') {
        this.addError(`lunarInfo.${field}`, `農曆${field}必須為數字`, 'INVALID_TYPE');
      }
    });

    // 驗證天干地支字段
    const ganZhiFields = [
      'yearGan', 'yearZhi', 'monthGan', 'monthZhi', 
      'dayGan', 'dayZhi', 'timeGan', 'timeZhi',
      'yearInGanZhi', 'monthInGanZhi', 'dayInGanZhi', 'timeInGanZhi'
    ];
    ganZhiFields.forEach(field => {
      if (lunarInfo[field] === undefined || lunarInfo[field] === null) {
        this.addError(`lunarInfo.${field}`, `農曆${field}為必需字段`, 'REQUIRED');
      } else if (typeof lunarInfo[field] !== 'string') {
        this.addError(`lunarInfo.${field}`, `農曆${field}必須為字符串`, 'INVALID_TYPE');
      } else if (lunarInfo[field].trim().length === 0) {
        this.addError(`lunarInfo.${field}`, `農曆${field}不能為空字符串`, 'INVALID_VALUE');
      }
    });

    // 驗證數值範圍
    if (typeof lunarInfo.year === 'number' && (lunarInfo.year < 1900 || lunarInfo.year > 2100)) {
      this.addError('lunarInfo.year', '農曆年份必須在 1900-2100 之間', 'OUT_OF_RANGE');
    }
    if (typeof lunarInfo.month === 'number' && (lunarInfo.month < 1 || lunarInfo.month > 12)) {
      this.addError('lunarInfo.month', '農曆月份必須在 1-12 之間', 'OUT_OF_RANGE');
    }
    if (typeof lunarInfo.day === 'number' && (lunarInfo.day < 1 || lunarInfo.day > 30)) {
      this.addError('lunarInfo.day', '農曆日期必須在 1-30 之間', 'OUT_OF_RANGE');
    }
    if (typeof lunarInfo.hour === 'number' && (lunarInfo.hour < 0 || lunarInfo.hour > 23)) {
      this.addError('lunarInfo.hour', '農曆時辰必須在 0-23 之間', 'OUT_OF_RANGE');
    }
  }

  private validateLocation(location: any): void {
    // 支援字符串格式的位置信息（地名）或對象格式（經緯度）
    if (typeof location === 'string') {
      // 字符串格式：地名，如 "台北市"
      if (location.trim().length === 0) {
        this.addError('location', '位置信息不能為空字符串', 'INVALID_VALUE');
      }
      return;
    }

    if (typeof location !== 'object' || location === null) {
      this.addError('location', '位置信息必須為字符串或對象', 'INVALID_TYPE');
      return;
    }

    // 驗證緯度
    if (location.latitude !== undefined) {
      if (typeof location.latitude !== 'number') {
        this.addError('location.latitude', '緯度必須為數字', 'INVALID_TYPE');
      } else if (location.latitude < -90 || location.latitude > 90) {
        this.addError('location.latitude', '緯度必須在 -90 到 90 之間', 'OUT_OF_RANGE');
      }
    }

    // 驗證經度
    if (location.longitude !== undefined) {
      if (typeof location.longitude !== 'number') {
        this.addError('location.longitude', '經度必須為數字', 'INVALID_TYPE');
      } else if (location.longitude < -180 || location.longitude > 180) {
        this.addError('location.longitude', '經度必須在 -180 到 180 之間', 'OUT_OF_RANGE');
      }
    }

    // 驗證時區
    if (location.timezone !== undefined) {
      if (typeof location.timezone !== 'string') {
        this.addError('location.timezone', '時區必須為字符串', 'INVALID_TYPE');
      }
    }
  }

  private validateOptions(options: any): void {
    if (typeof options !== 'object' || options === null) {
      this.addError('options', '選項必須為對象', 'INVALID_TYPE');
      return;
    }

    // 驗證布爾值選項
    const booleanOptions = ['includeMajorCycles', 'includeMinorCycles', 'includeAnnualCycles'];
    booleanOptions.forEach(option => {
      if (options[option] !== undefined && typeof options[option] !== 'boolean') {
        this.addError(`options.${option}`, `${option} 必須為布爾值`, 'INVALID_TYPE');
      }
    });

    // 驗證詳細程度
    if (options.detailLevel !== undefined) {
      if (typeof options.detailLevel !== 'string') {
        this.addError('options.detailLevel', '詳細程度必須為字符串', 'INVALID_TYPE');
      } else if (!['basic', 'advanced', 'expert'].includes(options.detailLevel)) {
        this.addError('options.detailLevel', '詳細程度必須為 "basic"、"advanced" 或 "expert"', 'INVALID_VALUE');
      }
    }

    // 驗證最大年齡
    if (options.maxAge !== undefined) {
      if (typeof options.maxAge !== 'number') {
        this.addError('options.maxAge', '最大年齡必須為數字', 'INVALID_TYPE');
      } else if (options.maxAge < 1 || options.maxAge > 150) {
        this.addError('options.maxAge', '最大年齡必須在 1 到 150 之間', 'OUT_OF_RANGE');
      }
    }
  }

  private addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }
}

// 輔助函數：創建統一的錯誤回應
export function createErrorResponse(error: string, details?: string, validationErrors?: ValidationError[]) {
  return {
    success: false,
    error,
    details,
    validationErrors,
    timestamp: new Date().toISOString()
  };
}

// 輔助函數：創建統一的成功回應
export function createSuccessResponse(data: any) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}
