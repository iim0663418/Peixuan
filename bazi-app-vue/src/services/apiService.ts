import axios from 'axios';
import type {
  PurpleStarAPIResponse,
} from '@/types/astrologyTypes';

const BASE_URL = '/api/v1';

// 已將此界面移至 astrologyTypes.ts，不再在這裡定義
// 但保留為了向後兼容
export interface PurpleStarResponse extends PurpleStarAPIResponse {}

class ApiService {
  async calculatePurpleStar(requestData: any): Promise<PurpleStarResponse> {
    try {
      console.group('紫微斗數API服務調用');
      console.log(
        '發送紫微斗數計算請求:',
        JSON.stringify(requestData, null, 2),
      );
      console.log('請求選項:', JSON.stringify(requestData.options, null, 2));

      // 確保請求中指定了四化飛星資料
      if (!requestData.options) {
        requestData.options = {};
      }

      if (requestData.options.includeFourTransformations === undefined) {
        requestData.options.includeFourTransformations = true;
        console.log('自動添加 includeFourTransformations 選項');
      }

      const response = await axios.post(
        `${BASE_URL}/purple-star/calculate`,
        requestData,
      );

      // 詳細記錄API響應
      console.log('API響應狀態碼:', response.status);
      console.log('響應頂層結構:', Object.keys(response.data || {}));

      // 檢查四化飛星資料是否存在
      if (response.data?.data?.transformations) {
        console.log('四化飛星資料存在，結構:', {
          flows: response.data.data.transformations.flows
            ? Object.keys(response.data.data.transformations.flows).length
            : 0,
          combinations: response.data.data.transformations.combinations
            ? response.data.data.transformations.combinations.length
            : 0,
          layeredEnergies: response.data.data.transformations.layeredEnergies
            ? Object.keys(response.data.data.transformations.layeredEnergies)
                .length
            : 0,
        });
      } else {
        console.warn('API響應中缺少四化飛星資料');

        // 深度檢查命盤資料以提供更多線索
        if (response.data?.data?.chart) {
          console.log('命盤資料存在');

          if (response.data.data.chart.mingGan) {
            console.log('命宮天干存在:', response.data.data.chart.mingGan);
          } else {
            console.warn('命宮天干資料缺失');
          }

          // 檢查星曜是否存在四化屬性
          let hasTransformation = false;

          if (
            response.data.data.chart.palaces &&
            Array.isArray(response.data.data.chart.palaces)
          ) {
            console.log('宮位數量:', response.data.data.chart.palaces.length);

            for (const palace of response.data.data.chart.palaces) {
              if (palace.stars && Array.isArray(palace.stars)) {
                for (const star of palace.stars) {
                  if (star.transformations && star.transformations.length > 0) {
                    hasTransformation = true;
                    break;
                  }
                }
                if (hasTransformation) {
                  break;
                }
              }
            }

            console.log('星曜中包含四化屬性:', hasTransformation);
          }
        } else {
          console.error('API響應中缺少命盤資料');
        }
      }

      console.groupEnd();
      return response.data;
    } catch (error: any) {
      // 確保日誌組關閉
      console.groupEnd();

      console.group('紫微斗數API錯誤');
      console.error('紫微斗數計算失敗:', error);
      console.error('錯誤類型:', error.constructor.name);

      if (error?.response) {
        console.error('HTTP狀態碼:', error.response.status);
        console.error('錯誤回應資料:', error.response.data);
        console.error('錯誤響應頭:', error.response.headers);
      } else if (error?.request) {
        console.error('未收到響應的請求:', error.request);
      } else {
        console.error('錯誤消息:', error.message);
      }

      console.error('錯誤堆疊:', error.stack);
      console.groupEnd();

      // 拋出更具體的錯誤
      if (error?.response?.data?.error) {
        throw new Error(`紫微斗數API錯誤: ${error.response.data.error}`);
      }
      throw error;
    }
  }

  // 注意：八字計算現在在前端進行，不需要後端 API
  // 請使用 bazi-app-vue/src/utils/baziCalc.ts 中的 BaziCalculator
}

export default new ApiService();
