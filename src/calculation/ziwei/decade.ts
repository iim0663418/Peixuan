/**
 * Decade (大限) Calculation Module
 *
 * Implements decade fortune palace and stem calculation based on:
 * - Bureau (五行局) determines starting age
 * - Gender and year stem yin/yang determine direction
 * - Current age determines which decade palace
 */

import type { Bureau } from './bureau';

/** Heavenly stems */
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * Determine if a stem is yang (陽) or yin (陰)
 *
 * @param stem - Heavenly stem
 * @returns true if yang, false if yin
 */
function isYangStem(stem: string): boolean {
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  return yangStems.includes(stem);
}

/**
 * Get starting age from bureau
 *
 * @param bureau - Five elements bureau (2-6)
 * @returns Starting age
 */
function getStartingAge(bureau: Bureau): number {
  // 水2局=2歲, 木3局=3歲, 金4局=4歲, 土5局=5歲, 火6局=6歲
  return bureau;
}

/**
 * Determine decade direction based on gender and year stem
 *
 * @param yearStem - Year pillar's heavenly stem
 * @param gender - Gender ('male' or 'female')
 * @returns 'forward' for clockwise, 'backward' for counterclockwise
 */
function determineDecadeDirection(yearStem: string, gender: 'male' | 'female'): 'forward' | 'backward' {
  const isYang = isYangStem(yearStem);

  // 陽男陰女順行 (yang male, yin female: forward/clockwise)
  // 陰男陽女逆行 (yin male, yang female: backward/counterclockwise)
  if ((isYang && gender === 'male') || (!isYang && gender === 'female')) {
    return 'forward';
  } 
    return 'backward';
  
}

/**
 * Calculate current decade palace and stem
 *
 * @param birthDate - Birth date
 * @param bureau - Five elements bureau
 * @param yearStem - Year pillar's heavenly stem
 * @param gender - Gender
 * @param palaces - Array of 12 palaces with branches
 * @returns Current decade stem or undefined if not in decade yet
 */
export function calculateCurrentDecade(
  birthDate: Date,
  bureau: Bureau,
  yearStem: string,
  gender: 'male' | 'female',
  palaces: Array<{ position: number; branch: string }>
): string | undefined {
  // Calculate current age (虛歲 - Chinese age, add 1 to Western age)
  const now = new Date();
  const currentAge = now.getFullYear() - birthDate.getFullYear() + 1;

  // Get starting age from bureau
  const startingAge = getStartingAge(bureau);

  // If current age is less than starting age, not in decade yet
  if (currentAge < startingAge) {
    return undefined;
  }

  // Determine direction
  const direction = determineDecadeDirection(yearStem, gender);

  // Calculate which decade (0-indexed, each decade is 10 years)
  const ageIntoDecades = currentAge - startingAge;
  const decadeIndex = Math.floor(ageIntoDecades / 10);

  // Life palace is always at position 0
  const lifePalacePosition = 0;

  // Calculate current decade palace position
  let decadePalacePosition: number;
  if (direction === 'forward') {
    // Clockwise: increase position
    decadePalacePosition = (lifePalacePosition + decadeIndex) % 12;
  } else {
    // Counterclockwise: decrease position
    decadePalacePosition = (lifePalacePosition - decadeIndex + 120) % 12;
  }

  // Get the branch of decade palace
  const decadePalace = palaces.find(p => p.position === decadePalacePosition);
  if (!decadePalace) {
    return undefined;
  }

  // Calculate decade palace stem using year stem
  // Use the same logic as life palace stem calculation: 五虎遁年法
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  if (yearStemIndex === -1) {
    return undefined;
  }

  // Calculate decade palace stem index
  const decadePalaceStemIndex = (2 * yearStemIndex + 2 + decadePalacePosition) % 10;
  const decadePalaceStem = HEAVENLY_STEMS[decadePalaceStemIndex];

  return decadePalaceStem;
}
