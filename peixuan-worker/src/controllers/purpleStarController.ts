import PurpleStarCalculator from '../services/purpleStarCalculation';
import { UnifiedCalculator } from '../calculation/integration/calculator';
import type { BirthInfo } from '../calculation/types';
import type { PurpleStarApiResponse } from '../types/apiResponse';

export class PurpleStarController {
  /**
   * Calculate purple star chart using hybrid architecture
   *
   * Architecture (Task 4.2-D1):
   * - UnifiedCalculator: Core calculations (lifePalace, bodyPalace, bureau, star positions)
   * - Legacy PurpleStarCalculator: Complete palace system with all stars
   *
   * This approach ensures mathematical correctness while maintaining comprehensive star data.
   */
  async calculate(requestData: any): Promise<PurpleStarApiResponse> {
    try {
      // Step 1: Validate and parse input
      const birthDateTime = `${requestData.birthDate} ${requestData.birthTime}`;
      const solarDate = new Date(birthDateTime);

      if (isNaN(solarDate.getTime())) {
        throw new Error('Invalid birth date or time format');
      }

      if (!requestData.gender || !['male', 'female'].includes(requestData.gender)) {
        throw new Error('Invalid gender: must be "male" or "female"');
      }

      // Step 2: Prepare birth info
      const birthInfo: BirthInfo = {
        solarDate,
        longitude: requestData.longitude || 121.5,
        gender: requestData.gender,
        isLeapMonth: requestData.isLeapMonth || false
      };

      // Step 3: Use UnifiedCalculator for core calculations
      const unifiedCalculator = new UnifiedCalculator();
      const coreResult = unifiedCalculator.calculate(birthInfo);

      // Step 4: Use Legacy PurpleStarCalculator for palace system
      const legacyCalculator = new PurpleStarCalculator({
        solarDate: birthInfo.solarDate,
        gender: birthInfo.gender
      });
      const legacyChart = legacyCalculator.generateChart();

      // Step 5: Merge into hybrid response format
      return {
        data: {
          chart: {
            // Core data from UnifiedCalculator (validated)
            core: {
              lifePalace: coreResult.ziwei.lifePalace,
              bodyPalace: coreResult.ziwei.bodyPalace,
              bureau: coreResult.ziwei.bureau,
              ziWeiPosition: coreResult.ziwei.ziWeiPosition,
              tianFuPosition: coreResult.ziwei.tianFuPosition
            },

            // Palace system from Legacy calculator
            palaces: legacyChart.palaces,

            // Legacy compatibility fields
            mingPalaceIndex: coreResult.ziwei.lifePalace.position,
            shenPalaceIndex: coreResult.ziwei.bodyPalace.position,
            mingGan: legacyChart.mingGan,
            fiveElementsBureau: legacyChart.fiveElementsBureau
          }
        }
      };
    } catch (error) {
      // Enhanced error handling
      if (error instanceof Error) {
        // Handle validation errors from UnifiedCalculator
        if (error.message.startsWith('Validation failed:')) {
          throw new Error(`Input validation error: ${error.message.replace('Validation failed: ', '')}`);
        }
        // Re-throw with original message
        throw error;
      }
      throw new Error('Unknown error during purple star calculation');
    }
  }
}
