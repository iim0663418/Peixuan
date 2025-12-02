/**
 * DaYun (大運) Fortune Cycle Calculation Module
 * Implements 10-year fortune cycle generation and current cycle detection
 */

import { GanZhi, indexToGanZhi, ganZhiToIndex } from '../core/ganZhi/conversion';

/**
 * DaYun (大運) - 10-year fortune cycle
 */
export interface DaYun {
  /** Heavenly stem and earthly branch pair */
  stem: string;
  branch: string;
  /** Start date of this fortune cycle */
  startDate: Date;
  /** End date of this fortune cycle (exclusive) */
  endDate: Date;
  /** Age when this cycle begins (real age from birth) */
  startAge: number;
  /** Age when this cycle ends (real age from birth) */
  endAge: number;
}

/**
 * Direction of fortune cycle progression
 */
export type DaYunDirection = 'forward' | 'backward';

/**
 * Generate DaYun (大運) fortune cycles list
 *
 * @param monthPillar - Month pillar GanZhi as baseline
 * @param birthDate - Birth date for calculating real age
 * @param qiyunDate - Starting date of fortune cycle (起運日期)
 * @param direction - Forward (順行) or backward (逆行) progression
 * @param count - Number of cycles to generate (default: 10)
 * @returns Array of DaYun fortune cycles, each lasting 10 years
 *
 * @example
 * // Forward progression from month pillar 甲子
 * const cycles = generateDaYunList(
 *   { stem: '甲', branch: '子' },
 *   new Date('1990-01-01'),
 *   new Date('1993-01-01'),
 *   'forward',
 *   10
 * );
 * // Result: 乙丑(3-13歲), 丙寅(13-23歲), 丁卯(23-33歲), ...
 */
export function generateDaYunList(
  monthPillar: GanZhi,
  birthDate: Date,
  qiyunDate: Date,
  direction: DaYunDirection,
  count: number = 10
): DaYun[] {
  const cycles: DaYun[] = [];

  // Calculate starting age (age at qiyunDate) using full years
  const birthYear = birthDate.getFullYear();
  const qiyunYear = qiyunDate.getFullYear();
  let qiyunAge = qiyunYear - birthYear;
  
  // Adjust if qiyunDate hasn't reached birth month/day yet
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  const qiyunMonth = qiyunDate.getMonth();
  const qiyunDay = qiyunDate.getDate();
  
  if (qiyunMonth < birthMonth || (qiyunMonth === birthMonth && qiyunDay < birthDay)) {
    qiyunAge--;
  }

  // Get base index from month pillar
  let currentIndex = ganZhiToIndex(monthPillar);

  for (let i = 0; i < count; i++) {
    // Move to next cycle based on direction
    // First cycle starts from next position after month pillar
    if (direction === 'forward') {
      currentIndex = (currentIndex + 1) % 60;
    } else {
      currentIndex = (currentIndex - 1 + 60) % 60;
    }

    // Get GanZhi for current cycle
    const ganZhi = indexToGanZhi(currentIndex);

    // Calculate start date (add i * 10 years to qiyunDate)
    const startDate = new Date(qiyunDate);
    startDate.setFullYear(startDate.getFullYear() + (i * 10));

    // Calculate end date (start date + 10 years)
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 10);

    // Calculate real age from birth
    const startAge = qiyunAge + (i * 10);
    const endAge = startAge + 10;

    cycles.push({
      stem: ganZhi.stem,
      branch: ganZhi.branch,
      startDate,
      endDate,
      startAge,
      endAge
    });
  }

  return cycles;
}

/**
 * Find current DaYun cycle for a given query date
 *
 * @param dayunList - Array of DaYun fortune cycles
 * @param queryDate - Date to query (typically current date)
 * @returns Current DaYun cycle or null if query date is outside all cycles
 *
 * @example
 * const current = getCurrentDaYun(cycles, new Date('2015-06-15'));
 * // Returns cycle where startDate <= 2015-06-15 < endDate
 */
export function getCurrentDaYun(
  dayunList: DaYun[],
  queryDate: Date
): DaYun | null {
  const queryTime = queryDate.getTime();

  for (const dayun of dayunList) {
    const startTime = dayun.startDate.getTime();
    const endTime = dayun.endDate.getTime();

    // Check if queryDate falls within [startDate, endDate)
    if (queryTime >= startTime && queryTime < endTime) {
      return dayun;
    }
  }

  // Query date is outside all cycles
  return null;
}
