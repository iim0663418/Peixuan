// frontend validation utility
// 前端表單驗證工具

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LocationData {
  longitude?: number | null;
  latitude?: number | null;
  timezone?: string;
}

export interface BirthData {
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  location?: LocationData;
}

/**
 * 前端表單驗證類
 */
export class FrontendValidator {
  /**
   * 驗證出生日期
   */
  static validateBirthDate(birthDate: string): ValidationResult {
    const errors: string[] = [];

    if (!birthDate) {
      errors.push('請選擇出生日期');
      return { isValid: false, errors };
    }

    // 驗證日期格式 YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(birthDate)) {
      errors.push('日期格式錯誤，請使用 YYYY-MM-DD 格式');
      return { isValid: false, errors };
    }

    // 驗證是否為有效日期
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      errors.push('無效的日期');
      return { isValid: false, errors };
    }

    // 驗證日期範圍（1900-2050）
    const year = date.getFullYear();
    if (year < 1900 || year > 2050) {
      errors.push('出生年份應在 1900-2050 之間');
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * 驗證出生時間
   */
  static validateBirthTime(birthTime: string): ValidationResult {
    const errors: string[] = [];

    if (!birthTime) {
      errors.push('請選擇出生時間');
      return { isValid: false, errors };
    }

    // 驗證時間格式 HH:mm
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(birthTime)) {
      errors.push('時間格式錯誤，請使用 HH:mm 格式（24小時制）');
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * 驗證性別
   */
  static validateGender(gender: string): ValidationResult {
    const errors: string[] = [];

    if (!gender) {
      errors.push('請選擇性別');
      return { isValid: false, errors };
    }

    if (!['male', 'female'].includes(gender)) {
      errors.push('性別必須為 male 或 female');
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * 驗證地理位置（紫微斗數專用）
   */
  static validateLocationForPurpleStar(
    location: LocationData,
  ): ValidationResult {
    const errors: string[] = [];

    if (!location) {
      errors.push('精確的紫微斗數計算需要地理位置資訊');
      return { isValid: false, errors };
    }

    // 驗證經度
    if (location.longitude === null || location.longitude === undefined) {
      errors.push('請輸入出生地經度（可選擇城市自動填入）');
    } else if (typeof location.longitude !== 'number') {
      errors.push('經度必須為數字');
    } else if (location.longitude < -180 || location.longitude > 180) {
      errors.push('經度必須在 -180 到 180 之間');
    }

    // 驗證緯度
    if (location.latitude === null || location.latitude === undefined) {
      errors.push('請輸入出生地緯度（可選擇城市自動填入）');
    } else if (typeof location.latitude !== 'number') {
      errors.push('緯度必須為數字');
    } else if (location.latitude < -90 || location.latitude > 90) {
      errors.push('緯度必須在 -90 到 90 之間');
    }

    // 驗證時區
    if (!location.timezone) {
      errors.push('請選擇時區');
    } else {
      const timezonePattern = /^(UTC[+-]\d{2}:\d{2}|[A-Za-z/]+)$/;
      if (!timezonePattern.test(location.timezone)) {
        errors.push('時區格式無效，請選擇有效的時區');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 驗證八字表單
   */
  static validateBaziForm(data: BirthData): ValidationResult {
    const allErrors: string[] = [];

    // 驗證基本資料
    const dateResult = this.validateBirthDate(data.birthDate || '');
    const timeResult = this.validateBirthTime(data.birthTime || '');
    const genderResult = this.validateGender(data.gender || '');

    allErrors.push(...dateResult.errors);
    allErrors.push(...timeResult.errors);
    allErrors.push(...genderResult.errors);

    return { isValid: allErrors.length === 0, errors: allErrors };
  }

  /**
   * 驗證紫微斗數表單
   */
  static validatePurpleStarForm(data: BirthData): ValidationResult {
    const allErrors: string[] = [];

    // 驗證基本資料
    const dateResult = this.validateBirthDate(data.birthDate || '');
    const timeResult = this.validateBirthTime(data.birthTime || '');
    const genderResult = this.validateGender(data.gender || '');

    allErrors.push(...dateResult.errors);
    allErrors.push(...timeResult.errors);
    allErrors.push(...genderResult.errors);

    // 驗證地理位置（紫微斗數必需）
    const locationResult = this.validateLocationForPurpleStar(
      data.location || {},
    );
    allErrors.push(...locationResult.errors);

    return { isValid: allErrors.length === 0, errors: allErrors };
  }

  /**
   * 驗證農曆轉換是否成功
   */
  static validateLunarConversion(lunarInfo: any): ValidationResult {
    const errors: string[] = [];

    if (!lunarInfo) {
      errors.push('農曆轉換失敗');
      return { isValid: false, errors };
    }

    // 檢查必要的農曆資料
    const requiredFields = [
      'year',
      'month',
      'day',
      'yearGan',
      'yearZhi',
      'monthGan',
      'monthZhi',
      'dayGan',
      'dayZhi',
      'timeGan',
      'timeZhi',
    ];

    for (const field of requiredFields) {
      if (!lunarInfo[field] && lunarInfo[field] !== 0) {
        errors.push(`農曆轉換缺少 ${field} 資料`);
      }
    }

    // 驗證年份範圍
    if (lunarInfo.year && (lunarInfo.year < 1900 || lunarInfo.year > 2050)) {
      errors.push('農曆年份超出支援範圍（1900-2050）');
    }

    // 驗證月份範圍
    if (lunarInfo.month && (lunarInfo.month < 1 || lunarInfo.month > 12)) {
      errors.push('農曆月份無效');
    }

    // 驗證日期範圍
    if (lunarInfo.day && (lunarInfo.day < 1 || lunarInfo.day > 30)) {
      errors.push('農曆日期無效');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 檢查 lunar-javascript 庫是否可用
   */
  static checkLunarLibrary(): ValidationResult {
    const errors: string[] = [];

    if (typeof window === 'undefined') {
      return { isValid: true, errors: [] }; // 服務器端環境
    }

    // @ts-ignore
    if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
      errors.push('lunar-javascript 庫未正確載入，請重新整理頁面');
    }

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * 預設座標資料
 */
export const DEFAULT_CITY_COORDINATES = {
  taipei: {
    longitude: 121.5654,
    latitude: 25.033,
    timezone: 'Asia/Taipei',
    name: '台北',
  },
  kaohsiung: {
    longitude: 120.3014,
    latitude: 22.6273,
    timezone: 'Asia/Taipei',
    name: '高雄',
  },
  taichung: {
    longitude: 120.6736,
    latitude: 24.1477,
    timezone: 'Asia/Taipei',
    name: '台中',
  },
  shanghai: {
    longitude: 121.4737,
    latitude: 31.2304,
    timezone: 'Asia/Shanghai',
    name: '上海',
  },
  beijing: {
    longitude: 116.4074,
    latitude: 39.9042,
    timezone: 'Asia/Shanghai',
    name: '北京',
  },
  hongkong: {
    longitude: 114.1694,
    latitude: 22.3193,
    timezone: 'Asia/Hong_Kong',
    name: '香港',
  },
  tokyo: {
    longitude: 139.6917,
    latitude: 35.6895,
    timezone: 'Asia/Tokyo',
    name: '東京',
  },
  seoul: {
    longitude: 126.978,
    latitude: 37.5665,
    timezone: 'Asia/Seoul',
    name: '首爾',
  },
  singapore: {
    longitude: 103.8198,
    latitude: 1.3521,
    timezone: 'Asia/Singapore',
    name: '新加坡',
  },
  london: {
    longitude: -0.1276,
    latitude: 51.5074,
    timezone: 'Europe/London',
    name: '倫敦',
  },
  newyork: {
    longitude: -74.006,
    latitude: 40.7128,
    timezone: 'America/New_York',
    name: '紐約',
  },
  losangeles: {
    longitude: -118.2437,
    latitude: 34.0522,
    timezone: 'America/Los_Angeles',
    name: '洛杉磯',
  },
};

/**
 * 格式化錯誤訊息
 */
export function formatErrorMessages(errors: string[]): string {
  if (errors.length === 0) {
    return '';
  }

  if (errors.length === 1) {
    return errors[0];
  }

  return `發現 ${errors.length} 個問題：\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
}
