/**
 * API Response Types for Hybrid Architecture
 *
 * Combines UnifiedCalculator core data with Legacy PurpleStarCalculator palace system.
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 4.2-D1
 */

import type { Palace } from '../services/purpleStarCalculation';
import type { PalacePosition } from '../calculation/ziwei/palaces';
import type { Bureau } from '../calculation/ziwei/bureau';

/**
 * Hybrid API response format
 *
 * Structure:
 * - core: from UnifiedCalculator (validated, mathematical)
 * - palaces: from Legacy PurpleStarCalculator (complete star system)
 */
export interface PurpleStarApiResponse {
  data: {
    chart: {
      /** Core calculation results from UnifiedCalculator */
      core: {
        lifePalace: PalacePosition;
        bodyPalace: PalacePosition;
        bureau: Bureau;
        ziWeiPosition: number;
        tianFuPosition: number;
      };

      /** Palace system from Legacy PurpleStarCalculator */
      palaces: Palace[];

      /** Legacy compatibility fields */
      mingPalaceIndex: number; // Maps to core.lifePalace.position
      shenPalaceIndex: number; // Maps to core.bodyPalace.position
      mingGan?: string; // Life palace stem
      fiveElementsBureau?: string; // Maps to core.bureau
    };
  };
}
