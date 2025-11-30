/**
 * ZiWei Star Positioning Module
 * Implements quotient-remainder compensation logic for ZiWei star position
 * Based on research doc §3.3
 */

import type { Bureau } from '../bureau';

/**
 * Find ZiWei star position in the 12 palaces
 * Implements quotient-remainder compensation algorithm with odd/even borrow logic
 *
 * Algorithm:
 * 1. If lunar_day % bureau == 0: position = lunar_day / bureau
 * 2. Else:
 *    - Calculate remainder and compensation (to_add = bureau - remainder)
 *    - Calculate quotient with compensation
 *    - Apply odd/even borrow logic:
 *      * If to_add is odd: position = quotient - to_add
 *      * If to_add is even: position = quotient + to_add
 * 3. Map to 寅宮 (index 2) as starting point
 *
 * @param lunarDay - Lunar day (1-30)
 * @param bureau - Bureau number (2=Water, 3=Wood, 4=Metal, 5=Earth, 6=Fire)
 * @returns Palace position (0-11, where 0=子, 1=丑, 2=寅, etc.)
 * @throws Error if inputs are invalid
 */
export function findZiWeiPosition(lunarDay: number, bureau: Bureau): number {
  // Validate inputs
  if (lunarDay < 1 || lunarDay > 30) {
    throw new Error(`Invalid lunar day: ${lunarDay}. Must be 1-30.`);
  }
  if (![2, 3, 4, 5, 6].includes(bureau)) {
    throw new Error(`Invalid bureau: ${bureau}. Must be 2, 3, 4, 5, or 6.`);
  }

  let pos: number;

  // Case 1: Divisible case
  if (lunarDay % bureau === 0) {
    pos = lunarDay / bureau;
  }
  // Case 2: Non-divisible case with quotient-remainder compensation
  else {
    const remainder = lunarDay % bureau;
    const toAdd = bureau - remainder;
    const quotient = Math.floor((lunarDay + toAdd) / bureau);

    // Odd/even borrow logic
    if (toAdd % 2 === 1) {
      // Odd: subtract (borrow backward)
      pos = quotient - toAdd;
    } else {
      // Even: add (borrow forward)
      pos = quotient + toAdd;
    }
  }

  // Map to 寅宮 (index 2) as starting point
  // Formula: (2 + pos - 1) mod 12
  let finalPos = (2 + pos - 1) % 12;

  // Handle zero case (should be 12 in 1-indexed, or 11 in 0-indexed)
  if (finalPos < 0) {
    finalPos = finalPos + 12;
  }

  return finalPos;
}

/**
 * Get earthly branch name from position
 *
 * @param position - Palace position (0-11)
 * @returns Earthly branch name
 */
export function getEarthlyBranch(position: number): string {
  const EARTHLY_BRANCHES = [
    '子', '丑', '寅', '卯', '辰', '巳',
    '午', '未', '申', '酉', '戌', '亥'
  ];

  if (position < 0 || position >= 12) {
    throw new Error(`Invalid position: ${position}`);
  }

  return EARTHLY_BRANCHES[position];
}

/**
 * ZiWei star position result
 */
export interface ZiWeiPosition {
  /** Palace position (0-11) */
  position: number;
  /** Earthly branch name */
  branch: string;
}

/**
 * Calculate ZiWei star position with branch name
 *
 * @param lunarDay - Lunar day (1-30)
 * @param bureau - Bureau number (2-6)
 * @returns ZiWei position with branch name
 */
export function calculateZiWeiPosition(lunarDay: number, bureau: Bureau): ZiWeiPosition {
  const position = findZiWeiPosition(lunarDay, bureau);
  return {
    position,
    branch: getEarthlyBranch(position)
  };
}
