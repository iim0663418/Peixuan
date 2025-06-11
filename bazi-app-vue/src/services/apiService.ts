import axios from 'axios';
import { BirthInfo } from './astrologyIntegrationService';

const BASE_URL = '/api/v1';

export interface PurpleStarResponse {
  success: boolean;
  data: {
    chart: {
      palaces: Array<{
        name: string;
        index: number;
        zhi: string;
        stars: Array<{
          name: string;
          type: 'main' | 'auxiliary' | 'minor';
          palaceIndex: number;
          transformations?: Array<'祿' | '權' | '科' | '忌'>;
        }>;
      }>;
      mingPalaceIndex: number;
      shenPalaceIndex: number;
      fiveElementsBureau: string;
      daXian?: Array<any>;
      xiaoXian?: Array<any>;
      liuNianTaiSui?: Array<{
        year: number;
        ganZhi: string;
        palaceName: string;
        palaceZhi: string;
        palaceIndex: number;
      }>;
    };
    calculationInfo: {
      birthInfo: any;
      options: any;
    };
  };
  error?: string;
  timestamp: string;
}


class ApiService {
  async calculatePurpleStar(requestData: any): Promise<PurpleStarResponse> {
    try {
      console.log('發送紫微斗數計算請求:', requestData);
      
      const response = await axios.post(`${BASE_URL}/purple-star/calculate`, requestData);
      console.log('紫微斗數計算回應:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('紫微斗數計算失敗', error);
      if (error?.response) {
        console.error('錯誤回應:', error.response.data);
        console.error('錯誤狀態:', error.response.status);
      }
      throw error;
    }
  }

  // 注意：八字計算現在在前端進行，不需要後端 API
  // 請使用 bazi-app-vue/src/utils/baziCalc.ts 中的 BaziCalculator
}

export default new ApiService();
