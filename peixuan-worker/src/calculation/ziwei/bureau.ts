/**
 * ZiWei Bureau Calculation Module
 * Implements Five Elements Bureau (五行局) based on 60 Jiazi NaYin system
 */

/** Bureau type: Water(2), Wood(3), Metal(4), Earth(5), Fire(6) */
export type Bureau = 2 | 3 | 4 | 5 | 6;

/** Heavenly stems */
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** Earthly branches */
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 60 Jiazi NaYin to Bureau mapping table
 * Key: stem-branch pair, Value: Bureau number
 * Based on traditional NaYin Five Elements system
 */
const NAYIN_BUREAU_MAP: Record<string, Bureau> = {
  // 甲子、乙丑 海中金 (Metal) -> 4
  '甲子': 4, '乙丑': 4,
  // 丙寅、丁卯 爐中火 (Fire) -> 6
  '丙寅': 6, '丁卯': 6,
  // 戊辰、己巳 大林木 (Wood) -> 3
  '戊辰': 3, '己巳': 3,
  // 庚午、辛未 路旁土 (Earth) -> 5
  '庚午': 5, '辛未': 5,
  // 壬申、癸酉 劍鋒金 (Metal) -> 4
  '壬申': 4, '癸酉': 4,

  // 甲戌、乙亥 山頭火 (Fire) -> 6
  '甲戌': 6, '乙亥': 6,
  // 丙子、丁丑 澗下水 (Water) -> 2
  '丙子': 2, '丁丑': 2,
  // 戊寅、己卯 城頭土 (Earth) -> 5
  '戊寅': 5, '己卯': 5,
  // 庚辰、辛巳 白蠟金 (Metal) -> 4
  '庚辰': 4, '辛巳': 4,
  // 壬午、癸未 楊柳木 (Wood) -> 3
  '壬午': 3, '癸未': 3,

  // 甲申、乙酉 泉中水 (Water) -> 2
  '甲申': 2, '乙酉': 2,
  // 丙戌、丁亥 屋上土 (Earth) -> 5
  '丙戌': 5, '丁亥': 5,
  // 戊子、己丑 霹靂火 (Fire) -> 6
  '戊子': 6, '己丑': 6,
  // 庚寅、辛卯 松柏木 (Wood) -> 3
  '庚寅': 3, '辛卯': 3,
  // 壬辰、癸巳 長流水 (Water) -> 2
  '壬辰': 2, '癸巳': 2,

  // 甲午、乙未 砂中金 (Metal) -> 4
  '甲午': 4, '乙未': 4,
  // 丙申、丁酉 山下火 (Fire) -> 6
  '丙申': 6, '丁酉': 6,
  // 戊戌、己亥 平地木 (Wood) -> 3
  '戊戌': 3, '己亥': 3,
  // 庚子、辛丑 壁上土 (Earth) -> 5
  '庚子': 5, '辛丑': 5,
  // 壬寅、癸卯 金箔金 (Metal) -> 4
  '壬寅': 4, '癸卯': 4,

  // 甲辰、乙巳 覆燈火 (Fire) -> 6
  '甲辰': 6, '乙巳': 6,
  // 丙午、丁未 天河水 (Water) -> 2
  '丙午': 2, '丁未': 2,
  // 戊申、己酉 大驛土 (Earth) -> 5
  '戊申': 5, '己酉': 5,
  // 庚戌、辛亥 釵釧金 (Metal) -> 4
  '庚戌': 4, '辛亥': 4,
  // 壬子、癸丑 桑柘木 (Wood) -> 3
  '壬子': 3, '癸丑': 3,

  // 甲寅、乙卯 大溪水 (Water) -> 2
  '甲寅': 2, '乙卯': 2,
  // 丙辰、丁巳 砂中土 (Earth) -> 5
  '丙辰': 5, '丁巳': 5,
  // 戊午、己未 天上火 (Fire) -> 6
  '戊午': 6, '己未': 6,
  // 庚申、辛酉 石榴木 (Wood) -> 3
  '庚申': 3, '辛酉': 3,
  // 壬戌、癸亥 大海水 (Water) -> 2
  '壬戌': 2, '癸亥': 2,
};

/**
 * Calculate Bureau (五行局) from Life Palace stem and branch
 * Uses 60 Jiazi NaYin system to determine the Five Elements Bureau
 *
 * @param lifePalaceStem - Life Palace heavenly stem (天干)
 * @param lifePalaceBranch - Life Palace earthly branch (地支)
 * @returns Bureau number (2=Water, 3=Wood, 4=Metal, 5=Earth, 6=Fire)
 * @throws Error if invalid stem-branch combination
 */
export function calculateBureau(
  lifePalaceStem: string,
  lifePalaceBranch: string
): Bureau {
  // Validate inputs
  if (!HEAVENLY_STEMS.includes(lifePalaceStem)) {
    throw new Error(`Invalid heavenly stem: ${lifePalaceStem}`);
  }
  if (!EARTHLY_BRANCHES.includes(lifePalaceBranch)) {
    throw new Error(`Invalid earthly branch: ${lifePalaceBranch}`);
  }

  const key = `${lifePalaceStem}${lifePalaceBranch}`;
  const bureau = NAYIN_BUREAU_MAP[key];

  if (!bureau) {
    throw new Error(`Invalid Jiazi combination: ${key}`);
  }

  return bureau;
}

/**
 * Get stem-branch pair from indices
 *
 * @param stemIndex - Heavenly stem index (0-9)
 * @param branchIndex - Earthly branch index (0-11)
 * @returns Stem-branch pair
 */
export function getStemBranchPair(stemIndex: number, branchIndex: number): { stem: string; branch: string } {
  if (stemIndex < 0 || stemIndex >= 10) {
    throw new Error(`Invalid stem index: ${stemIndex}`);
  }
  if (branchIndex < 0 || branchIndex >= 12) {
    throw new Error(`Invalid branch index: ${branchIndex}`);
  }

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex]
  };
}
