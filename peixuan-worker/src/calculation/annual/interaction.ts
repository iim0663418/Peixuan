/**
 * Annual Interaction Module (流年交互分析)
 *
 * Implements detection of stem combinations, branch clashes, and harmonious combinations
 * between annual fortune and natal chart pillars.
 * Reference: 八字命理後端模組研究.md §4.3
 */

import { HeavenlyStem, EarthlyBranch } from '../core/ganZhi';
import { WuXing } from '../core/wuXing/relations';

/**
 * Four Pillars structure (simplified for interaction analysis)
 */
export interface FourPillars {
  year: { stem: HeavenlyStem; branch: EarthlyBranch };
  month: { stem: HeavenlyStem; branch: EarthlyBranch };
  day: { stem: HeavenlyStem; branch: EarthlyBranch };
  hour: { stem: HeavenlyStem; branch: EarthlyBranch };
}

/**
 * Pillar type identifier
 */
export type PillarType = 'year' | 'month' | 'day' | 'hour';

/**
 * Stem combination result (天干五合)
 */
export interface StemCombination {
  /** Which pillar forms the combination */
  pillar: PillarType;
  /** The combined element */
  element: WuXing;
}

/**
 * Branch clash result (地支六沖)
 */
export interface BranchClash {
  /** Which pillar is clashed */
  pillar: PillarType;
  /** Clash severity based on pillar importance */
  severity: 'high' | 'medium' | 'low';
}

/**
 * Harmonious combination types
 */
export type CombinationType =
  | 'sanhe'  // 三合 (Triple Harmony)
  | 'sanhui'; // 三會 (Triple Assembly)

/**
 * Harmonious combination result
 */
export interface HarmoniousCombination {
  /** Type of combination */
  type: CombinationType;
  /** The branches involved */
  branches: EarthlyBranch[];
  /** The resulting element */
  element: WuXing;
}

/**
 * Stem combination map (天干五合)
 * Reference: §4.3.1
 *
 * Combinations:
 * - 甲己合土 (Jia-Ji combine to Earth)
 * - 乙庚合金 (Yi-Geng combine to Metal)
 * - 丙辛合水 (Bing-Xin combine to Water)
 * - 丁壬合木 (Ding-Ren combine to Wood)
 * - 戊癸合火 (Wu-Gui combine to Fire)
 */
const STEM_COMBINATIONS: Record<string, { partner: HeavenlyStem; element: WuXing }> = {
  '甲': { partner: '己', element: 'Earth' },
  '己': { partner: '甲', element: 'Earth' },
  '乙': { partner: '庚', element: 'Metal' },
  '庚': { partner: '乙', element: 'Metal' },
  '丙': { partner: '辛', element: 'Water' },
  '辛': { partner: '丙', element: 'Water' },
  '丁': { partner: '壬', element: 'Wood' },
  '壬': { partner: '丁', element: 'Wood' },
  '戊': { partner: '癸', element: 'Fire' },
  '癸': { partner: '戊', element: 'Fire' },
};

/**
 * Branch clash pairs (地支六沖)
 * Reference: §4.3.1
 *
 * Clash pairs:
 * - 子午 (Zi-Wu)
 * - 丑未 (Chou-Wei)
 * - 寅申 (Yin-Shen)
 * - 卯酉 (Mao-You)
 * - 辰戌 (Chen-Xu)
 * - 巳亥 (Si-Hai)
 */
const BRANCH_CLASHES: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '午',
  '午': '子',
  '丑': '未',
  '未': '丑',
  '寅': '申',
  '申': '寅',
  '卯': '酉',
  '酉': '卯',
  '辰': '戌',
  '戌': '辰',
  '巳': '亥',
  '亥': '巳',
};

/**
 * Triple Harmony sets (三合局)
 * Reference: §4.3.1
 *
 * Sets:
 * - 申子辰 → Water (Shen-Zi-Chen)
 * - 亥卯未 → Wood (Hai-Mao-Wei)
 * - 寅午戌 → Fire (Yin-Wu-Xu)
 * - 巳酉丑 → Metal (Si-You-Chou)
 */
const TRIPLE_HARMONY: Array<{ branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch]; element: WuXing }> = [
  { branches: ['申', '子', '辰'], element: 'Water' },
  { branches: ['亥', '卯', '未'], element: 'Wood' },
  { branches: ['寅', '午', '戌'], element: 'Fire' },
  { branches: ['巳', '酉', '丑'], element: 'Metal' },
];

/**
 * Triple Assembly sets (三會局)
 * Reference: §4.3.1
 *
 * Sets:
 * - 寅卯辰 → Wood (Yin-Mao-Chen) - Spring
 * - 巳午未 → Fire (Si-Wu-Wei) - Summer
 * - 申酉戌 → Metal (Shen-You-Xu) - Autumn
 * - 亥子丑 → Water (Hai-Zi-Chou) - Winter
 */
const TRIPLE_ASSEMBLY: Array<{ branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch]; element: WuXing }> = [
  { branches: ['寅', '卯', '辰'], element: 'Wood' },
  { branches: ['巳', '午', '未'], element: 'Fire' },
  { branches: ['申', '酉', '戌'], element: 'Metal' },
  { branches: ['亥', '子', '丑'], element: 'Water' },
];

/**
 * Detect stem combinations between annual stem and four pillars
 * Reference: §4.3.1
 *
 * @param annualStem - Annual fortune stem
 * @param fourPillars - Natal chart four pillars
 * @returns Array of stem combinations found
 *
 * @example
 * detectStemCombinations('甲', fourPillars)
 * // Returns: [{ pillar: 'month', element: 'Earth' }] if month stem is 己
 */
export function detectStemCombinations(
  annualStem: HeavenlyStem,
  fourPillars: FourPillars
): StemCombination[] {
  const combinations: StemCombination[] = [];
  const combination = STEM_COMBINATIONS[annualStem];

  if (!combination) {
    return combinations;
  }

  const pillars: Array<{ type: PillarType; stem: HeavenlyStem }> = [
    { type: 'year', stem: fourPillars.year.stem },
    { type: 'month', stem: fourPillars.month.stem },
    { type: 'day', stem: fourPillars.day.stem },
    { type: 'hour', stem: fourPillars.hour.stem },
  ];

  for (const pillar of pillars) {
    if (pillar.stem === combination.partner) {
      combinations.push({
        pillar: pillar.type,
        element: combination.element,
      });
    }
  }

  return combinations;
}

/**
 * Detect branch clashes between annual branch and four pillars
 * Reference: §4.3.1
 *
 * Weight/Severity:
 * - Day pillar: HIGH (affects spouse/health)
 * - Month pillar: MEDIUM (affects parents/career)
 * - Year/Hour pillar: LOW (general tai sui clash)
 *
 * @param annualBranch - Annual fortune branch
 * @param fourPillars - Natal chart four pillars
 * @returns Array of branch clashes found
 *
 * @example
 * detectBranchClashes('子', fourPillars)
 * // Returns: [{ pillar: 'day', severity: 'high' }] if day branch is 午
 */
export function detectBranchClashes(
  annualBranch: EarthlyBranch,
  fourPillars: FourPillars
): BranchClash[] {
  const clashes: BranchClash[] = [];
  const clashBranch = BRANCH_CLASHES[annualBranch];

  if (!clashBranch) {
    return clashes;
  }

  // Define severity based on pillar importance
  const pillars: Array<{ type: PillarType; branch: EarthlyBranch; severity: 'high' | 'medium' | 'low' }> = [
    { type: 'year', branch: fourPillars.year.branch, severity: 'low' },
    { type: 'month', branch: fourPillars.month.branch, severity: 'medium' },
    { type: 'day', branch: fourPillars.day.branch, severity: 'high' },
    { type: 'hour', branch: fourPillars.hour.branch, severity: 'low' },
  ];

  for (const pillar of pillars) {
    if (pillar.branch === clashBranch) {
      clashes.push({
        pillar: pillar.type,
        severity: pillar.severity,
      });
    }
  }

  return clashes;
}

/**
 * Detect harmonious combinations (三合/三會) among annual, dayun, and four pillars branches
 * Reference: §4.3.1
 *
 * This uses set theory to check if any triple harmony or triple assembly pattern
 * exists within the combined branches from annual fortune, optional dayun, and natal chart.
 *
 * @param annualBranch - Annual fortune branch
 * @param fourPillars - Natal chart four pillars
 * @param dayunBranch - Optional dayun (10-year cycle) branch
 * @returns Array of harmonious combinations found
 *
 * @example
 * detectHarmoniousCombinations('子', fourPillars, '申')
 * // Returns: [{ type: 'sanhe', branches: ['申', '子', '辰'], element: 'Water' }]
 * // if fourPillars contains '辰'
 */
export function detectHarmoniousCombinations(
  annualBranch: EarthlyBranch,
  fourPillars: FourPillars,
  dayunBranch?: EarthlyBranch
): HarmoniousCombination[] {
  const combinations: HarmoniousCombination[] = [];

  // Collect all branches
  const branchSet = new Set<EarthlyBranch>([
    annualBranch,
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ]);

  if (dayunBranch) {
    branchSet.add(dayunBranch);
  }

  // Check for Triple Harmony (三合)
  for (const harmony of TRIPLE_HARMONY) {
    const hasAll = harmony.branches.every(branch => branchSet.has(branch));
    if (hasAll) {
      combinations.push({
        type: 'sanhe',
        branches: [...harmony.branches],
        element: harmony.element,
      });
    }
  }

  // Check for Triple Assembly (三會)
  for (const assembly of TRIPLE_ASSEMBLY) {
    const hasAll = assembly.branches.every(branch => branchSet.has(branch));
    if (hasAll) {
      combinations.push({
        type: 'sanhui',
        branches: [...assembly.branches],
        element: assembly.element,
      });
    }
  }

  return combinations;
}
