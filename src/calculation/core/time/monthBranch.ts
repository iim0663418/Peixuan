/**
 * Month Branch Calculation Module
 * 
 * Determines the month branch (地支) based on solar terms (節氣)
 */

import { Solar } from 'lunar-typescript';

/**
 * Mapping from solar terms to month branches
 * Each month starts at a specific solar term (節)
 */
const MONTH_BRANCH_MAPPING: Record<string, number> = {
  '立春': 2,  // 寅
  '驚蟄': 3,  // 卯 (simplified: 惊蛰)
  '清明': 4,  // 辰
  '立夏': 5,  // 巳
  '芒種': 6,  // 午 (simplified: 芒种)
  '小暑': 7,  // 未
  '立秋': 8,  // 申
  '白露': 9,  // 酉
  '寒露': 10, // 戌
  '立冬': 11, // 亥
  '大雪': 0,  // 子
  '小寒': 1   // 丑
};

// Simplified Chinese variants
const SIMPLIFIED_MAPPING: Record<string, number> = {
  '惊蛰': 3,
  '芒种': 6
};

/**
 * Get month branch index for a given date
 * 
 * @param date - The date to query
 * @returns Month branch index (0-11, where 0=子, 1=丑, 2=寅, ...)
 * 
 * @example
 * const branchIndex = getMonthBranchIndex(new Date(1992, 8, 10));
 * // Returns: 9 (酉月, because date is after 白露)
 */
export function getMonthBranchIndex(date: Date): number {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const jieQiTable = lunar.getJieQiTable();

  // Convert jieQiTable to sorted array
  const jieQiList = Object.entries(jieQiTable)
    .map(([name, solarTerm]) => ({
      name,
      date: new Date(
        solarTerm.getYear(),
        solarTerm.getMonth() - 1,
        solarTerm.getDay(),
        solarTerm.getHour(),
        solarTerm.getMinute(),
        solarTerm.getSecond()
      ),
      branchIndex: MONTH_BRANCH_MAPPING[name] ?? SIMPLIFIED_MAPPING[name]
    }))
    .filter(item => item.branchIndex !== undefined)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find the current month by checking which solar term interval the date falls into
  for (let i = 0; i < jieQiList.length; i++) {
    const current = jieQiList[i];
    const next = jieQiList[i + 1];

    if (date >= current.date && (!next || date < next.date)) {
      return current.branchIndex;
    }
  }

  // Fallback: if date is before first solar term of the year, use previous year's last month
  // This handles edge case of dates in early January before 小寒
  return 1; // 丑月 (小寒 to 立春)
}
