/**
 * Auxiliary Stars Positioning Module
 * Implements time-based and month-based star positioning
 * Based on research doc §3.3
 */

/**
 * Time-based stars result (文昌、文曲)
 */
export interface TimeStars {
  /** 文昌 (Wen Chang) position (0-11) */
  wenChang: number;
  /** 文曲 (Wen Qu) position (0-11) */
  wenQu: number;
}

/**
 * Month-based stars result (左輔、右弼)
 */
export interface MonthStars {
  /** 左輔 (Zuo Fu) position (0-11) */
  zuoFu: number;
  /** 右弼 (You Bi) position (0-11) */
  youBi: number;
}

/**
 * Find time-based stars (文昌、文曲) positions
 * Based on hour branch (時支)
 *
 * Traditional formula:
 * - 文昌: Starting from 戌宮 (index 10) for 子時 (index 0), counterclockwise
 * - 文曲: Starting from 辰宮 (index 4) for 子時 (index 0), clockwise
 *
 * @param hourBranch - Hour earthly branch index (0-11, where 0=子, 1=丑, etc.)
 * @returns TimeStars with 文昌 and 文曲 positions
 * @throws Error if hourBranch is invalid
 */
export function findTimeStars(hourBranch: number): TimeStars {
  // Validate input
  if (hourBranch < 0 || hourBranch >= 12) {
    throw new Error(`Invalid hour branch: ${hourBranch}. Must be 0-11.`);
  }

  // 文昌: Start at 戌 (index 10) for 子時, move counterclockwise
  // Formula: (10 - hourBranch) mod 12
  let wenChang = (10 - hourBranch) % 12;
  if (wenChang < 0) wenChang += 12;

  // 文曲: Start at 辰 (index 4) for 子時, move clockwise
  // Formula: (4 + hourBranch) mod 12
  const wenQu = (4 + hourBranch) % 12;

  return { wenChang, wenQu };
}

/**
 * Find month-based stars (左輔、右弼) positions
 * Based on lunar month (農曆月)
 *
 * Traditional formula:
 * - 左輔: Starting from 辰宮 (index 4) for first month, clockwise
 * - 右弼: Starting from 戌宮 (index 10) for first month, counterclockwise
 *
 * @param lunarMonth - Lunar month (1-12)
 * @returns MonthStars with 左輔 and 右弼 positions
 * @throws Error if lunarMonth is invalid
 */
export function findMonthStars(lunarMonth: number): MonthStars {
  // Validate input
  if (lunarMonth < 1 || lunarMonth > 12) {
    throw new Error(`Invalid lunar month: ${lunarMonth}. Must be 1-12.`);
  }

  // Convert to 0-indexed
  const monthIndex = lunarMonth - 1;

  // 左輔: Start at 辰 (index 4) for month 1, move clockwise
  // Formula: (4 + monthIndex) mod 12
  const zuoFu = (4 + monthIndex) % 12;

  // 右弼: Start at 戌 (index 10) for month 1, move counterclockwise
  // Formula: (10 - monthIndex) mod 12
  let youBi = (10 - monthIndex) % 12;
  if (youBi < 0) youBi += 12;

  return { zuoFu, youBi };
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
 * Time stars with branch names
 */
export interface TimeStarsWithBranches extends TimeStars {
  /** 文昌 branch name */
  wenChangBranch: string;
  /** 文曲 branch name */
  wenQuBranch: string;
}

/**
 * Month stars with branch names
 */
export interface MonthStarsWithBranches extends MonthStars {
  /** 左輔 branch name */
  zuoFuBranch: string;
  /** 右弼 branch name */
  youBiBranch: string;
}

/**
 * Calculate time stars with branch names
 *
 * @param hourBranch - Hour earthly branch index (0-11)
 * @returns Time stars with positions and branch names
 */
export function calculateTimeStars(hourBranch: number): TimeStarsWithBranches {
  const { wenChang, wenQu } = findTimeStars(hourBranch);
  return {
    wenChang,
    wenQu,
    wenChangBranch: getEarthlyBranch(wenChang),
    wenQuBranch: getEarthlyBranch(wenQu)
  };
}

/**
 * Calculate month stars with branch names
 *
 * @param lunarMonth - Lunar month (1-12)
 * @returns Month stars with positions and branch names
 */
export function calculateMonthStars(lunarMonth: number): MonthStarsWithBranches {
  const { zuoFu, youBi } = findMonthStars(lunarMonth);
  return {
    zuoFu,
    youBi,
    zuoFuBranch: getEarthlyBranch(zuoFu),
    youBiBranch: getEarthlyBranch(youBi)
  };
}
