/**
 * Annual Palace Calculation Module
 *
 * Implements annual palace positioning and rotation logic for ZiWei DouShu.
 * Based on doc/八字命理後端模組研究.md §4.2
 *
 * Key concepts:
 * - Annual Life Palace (流年命宮): Determined by the annual earthly branch
 * - Palace rotation: Once annual life palace is located, all 12 palace meanings rotate accordingly
 */

/** Star brightness levels */
export type StarBrightness = 'temple' | 'prosperous' | 'advantageous' | 'neutral' | 'trapped';

/** Star in a palace */
export interface Star {
  /** Star name (e.g., "紫微", "天機") */
  name: string;
  /** Star brightness level */
  brightness?: StarBrightness;
}

/** Palace interface with earthly branch information */
export interface Palace {
  /** Palace index (0-11) */
  position: number;
  /** Earthly branch at this palace position */
  branch: string;
  /** Palace meaning/name (e.g., "命宮", "兄弟宮") */
  meaning?: string;
  /** Stars in this palace */
  stars?: Star[];
}

/** Standard 12 earthly branches in order */
const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥'
];

/** Standard 12 palace meanings in order (starting from Life Palace) */
const PALACE_MEANINGS = [
  '命宮',     // Life Palace
  '兄弟宮',   // Siblings Palace
  '夫妻宮',   // Spouse Palace
  '子女宮',   // Children Palace
  '財帛宮',   // Wealth Palace
  '疾厄宮',   // Health Palace
  '遷移宮',   // Travel Palace
  '奴僕宮',   // Servants Palace (Friends)
  '官祿宮',   // Career Palace
  '田宅宮',   // Property Palace
  '福德宮',   // Fortune Palace
  '父母宮'    // Parents Palace
];

/**
 * Locate the annual life palace position
 *
 * The annual life palace is determined by finding which palace position
 * contains the earthly branch matching the annual branch.
 *
 * @param annualBranch - Annual earthly branch (e.g., "寅" for 壬寅 year)
 * @param ziweiPalaces - Array of 12 palace positions from ZiWei chart
 * @returns Palace index (0-11) where annual life palace is located, or -1 if not found
 *
 * @example
 * // For annual year 壬寅 (branch: 寅)
 * // If ZiWei palaces have 寅 at position 3
 * locateAnnualLifePalace('寅', ziweiPalaces) // returns 3
 */
export function locateAnnualLifePalace(
  annualBranch: string,
  ziweiPalaces: Palace[]
): number {
  // Validate input
  if (!annualBranch || annualBranch.length === 0) {
    return -1;
  }

  if (!ziweiPalaces || ziweiPalaces.length !== 12) {
    return -1;
  }

  // Validate that annualBranch is a valid earthly branch
  if (!EARTHLY_BRANCHES.includes(annualBranch)) {
    return -1;
  }

  // Find the palace position where branch matches annualBranch
  for (let i = 0; i < ziweiPalaces.length; i++) {
    if (ziweiPalaces[i].branch === annualBranch) {
      return i;
    }
  }

  // Branch not found in palaces
  return -1;
}

/**
 * Rotate palace meanings based on annual life palace position
 *
 * Once the annual life palace is located, the 12 palace meanings rotate.
 * For example, if annual life palace is at index 3:
 * - Index 3 → Annual Life Palace (流年命宮)
 * - Index 4 → Annual Siblings Palace (流年兄弟宮)
 * - Index 5 → Annual Spouse Palace (流年夫妻宮)
 * - ... and so on
 *
 * @param basePalaces - Base palace array (12 palaces from ZiWei chart)
 * @param annualLifePalaceIndex - Index (0-11) of the annual life palace
 * @returns New palace array with rotated meanings
 *
 * @example
 * // If annual life palace is at index 3
 * rotateAnnualPalaces(basePalaces, 3)
 * // Returns palaces where index 3 has meaning "命宮", index 4 has "兄弟宮", etc.
 */
export function rotateAnnualPalaces(
  basePalaces: Palace[],
  annualLifePalaceIndex: number
): Palace[] {
  // Validate input
  if (!basePalaces || basePalaces.length !== 12) {
    return [];
  }

  if (annualLifePalaceIndex < 0 || annualLifePalaceIndex > 11) {
    return [];
  }

  // Create new palace array with rotated meanings
  const rotatedPalaces: Palace[] = [];

  for (let i = 0; i < 12; i++) {
    // Calculate which palace meaning applies to this position
    // The meaning index cycles through PALACE_MEANINGS starting from annualLifePalaceIndex
    const meaningIndex = (i - annualLifePalaceIndex + 12) % 12;

    rotatedPalaces.push({
      position: basePalaces[i].position,
      branch: basePalaces[i].branch,
      meaning: PALACE_MEANINGS[meaningIndex]
    });
  }

  return rotatedPalaces;
}

/**
 * Helper function to create a standard palace array from earthly branches
 * Useful for testing and initialization
 *
 * @param startBranch - Starting earthly branch (e.g., "子")
 * @returns Array of 12 palaces starting from the given branch
 */
export function createPalaceArray(startBranch: string): Palace[] {
  const startIndex = EARTHLY_BRANCHES.indexOf(startBranch);

  if (startIndex === -1) {
    return [];
  }

  const palaces: Palace[] = [];

  for (let i = 0; i < 12; i++) {
    const branchIndex = (startIndex + i) % 12;
    palaces.push({
      position: i,
      branch: EARTHLY_BRANCHES[branchIndex]
    });
  }

  return palaces;
}
