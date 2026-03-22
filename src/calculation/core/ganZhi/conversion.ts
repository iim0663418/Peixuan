/**
 * GanZhi (干支) Conversion Module
 * Implements bidirectional conversion between indices and GanZhi pairs using Chinese Remainder Theorem
 */

export const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
] as const;

export const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

export interface GanZhi {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

/**
 * Convert 60 Jiazi cycle index to GanZhi pair
 * @param index - Index in 60 Jiazi cycle (0-59)
 * @returns GanZhi pair
 */
export function indexToGanZhi(index: number): GanZhi {
  const normalizedIndex = ((index % 60) + 60) % 60;
  const stemIndex = normalizedIndex % 10;
  const branchIndex = normalizedIndex % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}

/**
 * Convert GanZhi pair to 60 Jiazi cycle index using Chinese Remainder Theorem
 * @param ganZhi - GanZhi pair
 * @returns Index in 60 Jiazi cycle (0-59)
 */
export function ganZhiToIndex(ganZhi: GanZhi): number {
  const stemIndex = HEAVENLY_STEMS.indexOf(ganZhi.stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(ganZhi.branch);

  if (stemIndex === -1 || branchIndex === -1) {
    throw new Error(`Invalid GanZhi: ${ganZhi.stem}${ganZhi.branch}`);
  }

  // Chinese Remainder Theorem for 60 Jiazi cycle
  // Find n where: n ≡ stemIndex (mod 10) and n ≡ branchIndex (mod 12)
  for (let n = 0; n < 60; n++) {
    if (n % 10 === stemIndex && n % 12 === branchIndex) {
      return n;
    }
  }

  throw new Error(`No valid index for GanZhi: ${ganZhi.stem}${ganZhi.branch}`);
}
