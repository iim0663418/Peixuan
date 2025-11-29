/**
 * BaZi Hidden Stems (地支藏干) Module
 * Calculates the hidden heavenly stems within earthly branches
 */

export type HiddenStemWeight = 'primary' | 'middle' | 'residual';

export interface HiddenStem {
  stem: string;
  weight: HiddenStemWeight;
  days: number;
}

/**
 * Complete mapping of 12 earthly branches to their hidden stems
 * Structure: { branch: [{ stem, weight, days }] }
 */
const HIDDEN_STEMS_MAP: Record<string, HiddenStem[]> = {
  // 子 (Rat) - 癸 (Water)
  子: [
    { stem: '癸', weight: 'primary', days: 30 }
  ],

  // 丑 (Ox) - 己癸辛
  丑: [
    { stem: '己', weight: 'primary', days: 9 },
    { stem: '癸', weight: 'middle', days: 9 },
    { stem: '辛', weight: 'residual', days: 12 }
  ],

  // 寅 (Tiger) - 甲丙戊
  寅: [
    { stem: '甲', weight: 'primary', days: 7 },
    { stem: '丙', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],

  // 卯 (Rabbit) - 乙 (Wood)
  卯: [
    { stem: '乙', weight: 'primary', days: 30 }
  ],

  // 辰 (Dragon) - 戊乙癸
  辰: [
    { stem: '戊', weight: 'primary', days: 9 },
    { stem: '乙', weight: 'middle', days: 9 },
    { stem: '癸', weight: 'residual', days: 12 }
  ],

  // 巳 (Snake) - 丙庚戊
  巳: [
    { stem: '丙', weight: 'primary', days: 7 },
    { stem: '庚', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],

  // 午 (Horse) - 丁己 (Fire)
  午: [
    { stem: '丁', weight: 'primary', days: 10 },
    { stem: '己', weight: 'residual', days: 20 }
  ],

  // 未 (Goat) - 己丁乙
  未: [
    { stem: '己', weight: 'primary', days: 9 },
    { stem: '丁', weight: 'middle', days: 9 },
    { stem: '乙', weight: 'residual', days: 12 }
  ],

  // 申 (Monkey) - 庚壬戊
  申: [
    { stem: '庚', weight: 'primary', days: 7 },
    { stem: '壬', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],

  // 酉 (Rooster) - 辛 (Metal)
  酉: [
    { stem: '辛', weight: 'primary', days: 30 }
  ],

  // 戌 (Dog) - 戊辛丁
  戌: [
    { stem: '戊', weight: 'primary', days: 9 },
    { stem: '辛', weight: 'middle', days: 9 },
    { stem: '丁', weight: 'residual', days: 12 }
  ],

  // 亥 (Pig) - 壬甲
  亥: [
    { stem: '壬', weight: 'primary', days: 7 },
    { stem: '甲', weight: 'residual', days: 23 }
  ]
};

/**
 * Get hidden stems for a given earthly branch
 * @param branch - Earthly branch (地支)
 * @returns Array of hidden stems with weight and duration
 */
export function getHiddenStems(branch: string): HiddenStem[] {
  const hiddenStems = HIDDEN_STEMS_MAP[branch];

  if (!hiddenStems) {
    throw new Error(`Invalid earthly branch: ${branch}`);
  }

  return hiddenStems;
}

/**
 * Get primary (main) hidden stem for a branch
 * @param branch - Earthly branch
 * @returns Primary hidden stem
 */
export function getPrimaryHiddenStem(branch: string): string {
  const hiddenStems = getHiddenStems(branch);
  return hiddenStems.find(hs => hs.weight === 'primary')!.stem;
}

/**
 * Check if a branch contains a specific stem
 * @param branch - Earthly branch
 * @param stem - Heavenly stem to check
 * @returns true if branch contains the stem
 */
export function branchContainsStem(branch: string, stem: string): boolean {
  const hiddenStems = getHiddenStems(branch);
  return hiddenStems.some(hs => hs.stem === stem);
}
