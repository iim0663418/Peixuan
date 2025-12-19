/**
 * Form data management composable
 */
import { ref, reactive } from 'vue';
import { Solar } from 'lunar-typescript';

export interface CityOption {
  label: string;
  value: string;
  longitude: number;
  latitude: number;
  timezone: string;
}

export interface TimezoneOption {
  label: string;
  value: string;
}

export interface BirthFormData {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  longitude: number | null;
  latitude: number | null;
  timezone: string;
  isLeapMonth: boolean;
}

export function useFormData() {
  // 時區選項
  const timezones = ref<TimezoneOption[]>([
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

  // 主要城市座標資料
  const majorCities = ref<CityOption[]>([
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

  const formData = reactive<BirthFormData>({
    birthDate: '',
    birthTime: '',
    gender: 'male',
    longitude: null,
    latitude: null,
    timezone: 'Asia/Taipei',
    isLeapMonth: false,
  });

  const selectedCity = ref('');
  const leapMonthInfo = ref('');

  // 填入城市座標
  const fillCityCoordinates = (cityValue: string) => {
    const city = majorCities.value.find((c) => c.value === cityValue);
    if (city) {
      formData.longitude = city.longitude;
      formData.latitude = city.latitude;
      formData.timezone = city.timezone;
    }
  };

  // 自動判斷閏月
  const detectLeapMonth = () => {
    if (!formData.birthDate) {
      formData.isLeapMonth = false;
      leapMonthInfo.value = '';
      return;
    }

    try {
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lunarMonth = lunar.getMonth();

      formData.isLeapMonth = lunarMonth < 0;
      leapMonthInfo.value = lunarMonth < 0 ? `閏${Math.abs(lunarMonth)}月` : '';
    } catch (error) {
      console.error('閏月判斷失敗:', error);
      formData.isLeapMonth = false;
      leapMonthInfo.value = '';
    }
  };

  return {
    formData,
    timezones,
    majorCities,
    selectedCity,
    leapMonthInfo,
    fillCityCoordinates,
    detectLeapMonth,
  };
}
