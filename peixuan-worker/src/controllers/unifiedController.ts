import { UnifiedCalculator } from '../calculation/integration/calculator';
import type { BirthInfo, CalculationResult } from '../calculation/types';

/**
 * Unified Controller
 *
 * Provides unified API endpoint that returns complete CalculationResult
 * including BaZi (fourPillars, hiddenStems, tenGods) and ZiWei (palaces, bureau, stars, symmetry).
 *
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Sprint A Task A2
 */
export class UnifiedController {
  /**
   * Calculate complete astrological chart
   *
   * @param requestData - Request payload with birth information
   * @returns Complete calculation result with all BaZi and ZiWei data
   * @throws Error if validation fails or calculation error occurs
   */
  async calculate(requestData: any): Promise<CalculationResult> {
    console.log('[UnifiedController] Received request:', JSON.stringify(requestData));
    
    try {
      console.log('[UnifiedController] Step 1: Validating input...');
      // Step 1: Validate and parse input
      const birthDateTime = `${requestData.birthDate} ${requestData.birthTime}`;
      const solarDate = new Date(birthDateTime);
      console.log('[UnifiedController] Parsed date:', solarDate.toISOString());

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

      // Step 3: Calculate using UnifiedCalculator
      const calculator = new UnifiedCalculator();
      const result = calculator.calculate(birthInfo);

      // Step 4: Return complete result
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith('Validation failed:')) {
          throw new Error(`Input validation error: ${error.message.replace('Validation failed: ', '')}`);
        }
        throw error;
      }
      throw new Error('Unknown error during unified calculation');
    }
  }
}
