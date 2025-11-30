/**
 * TianFu Star Positioning Module
 * Implements symmetry logic opposite to ZiWei star
 * Based on research doc §3.3
 */

/**
 * Find TianFu (天府) star position in the 12 palaces
 * Uses symmetry logic: TianFu position is opposite to ZiWei position
 *
 * Algorithm:
 * - TianFu is positioned symmetrically to ZiWei around the 寅-申 axis
 * - Formula: P_tianfu = (4 - P_ziwei) mod 12
 *   where 4 represents 寅宮 (index 2) + 申宮 (index 8) center point
 * - This creates a mirror relationship across the 寅-申 axis
 *
 * @param ziWeiPosition - ZiWei star position (0-11, where 0=子, 1=丑, 2=寅, etc.)
 * @returns TianFu palace position (0-11)
 * @throws Error if ziWeiPosition is invalid
 */
export function findTianFuPosition(ziWeiPosition: number): number {
  // Validate input
  if (ziWeiPosition < 0 || ziWeiPosition >= 12) {
    throw new Error(`Invalid ZiWei position: ${ziWeiPosition}. Must be 0-11.`);
  }

  // Symmetry formula: opposite position around 寅-申 axis
  // The axis center is at (2 + 8) / 2 = 5, so we use (4 - pos) mod 12
  let tianfuPos = (4 - ziWeiPosition) % 12;

  // Handle negative modulo result
  if (tianfuPos < 0) {
    tianfuPos += 12;
  }

  return tianfuPos;
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
 * TianFu star position result
 */
export interface TianFuPosition {
  /** Palace position (0-11) */
  position: number;
  /** Earthly branch name */
  branch: string;
}

/**
 * Calculate TianFu star position with branch name
 *
 * @param ziWeiPosition - ZiWei star position (0-11)
 * @returns TianFu position with branch name
 */
export function calculateTianFuPosition(ziWeiPosition: number): TianFuPosition {
  const position = findTianFuPosition(ziWeiPosition);
  return {
    position,
    branch: getEarthlyBranch(position)
  };
}
