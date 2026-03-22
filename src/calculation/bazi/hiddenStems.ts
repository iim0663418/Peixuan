/**
 * BaZi Hidden Stems (地支藏干) Module
 *
 * NOTE: Stem lists validated against lunar-typescript library.
 * Weight and days metadata maintained for compatibility.
 */

export type HiddenStemWeight = 'primary' | 'middle' | 'residual';

export interface HiddenStem {
  stem: string;
  weight: HiddenStemWeight;
  days: number;
}

const HIDDEN_STEMS_MAP: Record<string, HiddenStem[]> = {
  子: [{ stem: '癸', weight: 'primary', days: 30 }],
  丑: [
    { stem: '己', weight: 'primary', days: 9 },
    { stem: '癸', weight: 'middle', days: 9 },
    { stem: '辛', weight: 'residual', days: 12 }
  ],
  寅: [
    { stem: '甲', weight: 'primary', days: 7 },
    { stem: '丙', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],
  卯: [{ stem: '乙', weight: 'primary', days: 30 }],
  辰: [
    { stem: '戊', weight: 'primary', days: 9 },
    { stem: '乙', weight: 'middle', days: 9 },
    { stem: '癸', weight: 'residual', days: 12 }
  ],
  巳: [
    { stem: '丙', weight: 'primary', days: 7 },
    { stem: '庚', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],
  午: [
    { stem: '丁', weight: 'primary', days: 10 },
    { stem: '己', weight: 'residual', days: 20 }
  ],
  未: [
    { stem: '己', weight: 'primary', days: 9 },
    { stem: '丁', weight: 'middle', days: 9 },
    { stem: '乙', weight: 'residual', days: 12 }
  ],
  申: [
    { stem: '庚', weight: 'primary', days: 7 },
    { stem: '壬', weight: 'middle', days: 7 },
    { stem: '戊', weight: 'residual', days: 16 }
  ],
  酉: [{ stem: '辛', weight: 'primary', days: 30 }],
  戌: [
    { stem: '戊', weight: 'primary', days: 9 },
    { stem: '辛', weight: 'middle', days: 9 },
    { stem: '丁', weight: 'residual', days: 12 }
  ],
  亥: [
    { stem: '壬', weight: 'primary', days: 7 },
    { stem: '甲', weight: 'residual', days: 23 }
  ]
};

export function getHiddenStems(branch: string): HiddenStem[] {
  const hiddenStems = HIDDEN_STEMS_MAP[branch];
  if (!hiddenStems) {
    throw new Error(`Invalid earthly branch: ${branch}`);
  }
  return hiddenStems;
}

export function getPrimaryHiddenStem(branch: string): string {
  const hiddenStems = getHiddenStems(branch);
  return hiddenStems.find(hs => hs.weight === 'primary')!.stem;
}

export function branchContainsStem(branch: string, stem: string): boolean {
  const hiddenStems = getHiddenStems(branch);
  return hiddenStems.some(hs => hs.stem === stem);
}
