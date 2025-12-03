/**
 * 五行關係模組 (WuXing Relations Module)
 *
 * 實現五行生剋關係與干支五行映射
 * 基於: 命理計算邏輯數學化研究.md §1.2
 */

/** 五行類型 */
export type WuXing = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

/** 五行關係類型 */
export type WuXingRelation =
  | 'produce'    // 我生
  | 'overcome'   // 我克
  | 'same'       // 同類
  | 'produced'   // 生我
  | 'overcomed'; // 克我

/**
 * 五行生剋關係矩陣
 * 順序: Wood(0), Fire(1), Earth(2), Metal(3), Water(4)
 *
 * 規則:
 * - 我生 (produce): (index + 1) % 5
 * - 我克 (overcome): (index + 2) % 5
 * - 生我 (produced): (index + 4) % 5
 * - 克我 (overcomed): (index + 3) % 5
 */
const WUXING_ORDER: WuXing[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

/**
 * 計算兩個五行之間的關係
 *
 * @param from - 源五行
 * @param to - 目標五行
 * @returns 五行關係類型
 *
 * @example
 * getWuXingRelation('Wood', 'Fire')  // 'produce' (木生火)
 * getWuXingRelation('Wood', 'Earth') // 'overcome' (木克土)
 * getWuXingRelation('Wood', 'Wood')  // 'same' (同類)
 */
export function getWuXingRelation(from: WuXing, to: WuXing): WuXingRelation {
  const fromIndex = WUXING_ORDER.indexOf(from);
  const toIndex = WUXING_ORDER.indexOf(to);

  if (fromIndex === toIndex) {return 'same';}
  if (toIndex === (fromIndex + 1) % 5) {return 'produce';}
  if (toIndex === (fromIndex + 2) % 5) {return 'overcome';}
  if (toIndex === (fromIndex + 4) % 5) {return 'produced';}
  if (toIndex === (fromIndex + 3) % 5) {return 'overcomed';}

  throw new Error(`Invalid WuXing relation: ${from} -> ${to}`);
}

/**
 * 天干五行映射表
 * 甲乙木, 丙丁火, 戊己土, 庚辛金, 壬癸水
 */
const STEM_WUXING_MAP: Record<string, WuXing> = {
  '甲': 'Wood', '乙': 'Wood',
  '丙': 'Fire', '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

/**
 * 地支五行映射表
 * 寅卯木, 巳午火, 辰戌丑未土, 申酉金, 亥子水
 */
const BRANCH_WUXING_MAP: Record<string, WuXing> = {
  '寅': 'Wood', '卯': 'Wood',
  '巳': 'Fire', '午': 'Fire',
  '辰': 'Earth', '戌': 'Earth', '丑': 'Earth', '未': 'Earth',
  '申': 'Metal', '酉': 'Metal',
  '亥': 'Water', '子': 'Water',
};

/**
 * 天干轉五行
 *
 * @param stem - 天干 (甲~癸)
 * @returns 五行
 *
 * @example
 * stemToWuXing('甲') // 'Wood'
 * stemToWuXing('丙') // 'Fire'
 */
export function stemToWuXing(stem: string): WuXing {
  const wuXing = STEM_WUXING_MAP[stem];
  if (!wuXing) {
    throw new Error(`Invalid stem: ${stem}`);
  }
  return wuXing;
}

/**
 * 地支轉五行
 *
 * @param branch - 地支 (子~亥)
 * @returns 五行
 *
 * @example
 * branchToWuXing('寅') // 'Wood'
 * branchToWuXing('午') // 'Fire'
 */
export function branchToWuXing(branch: string): WuXing {
  const wuXing = BRANCH_WUXING_MAP[branch];
  if (!wuXing) {
    throw new Error(`Invalid branch: ${branch}`);
  }
  return wuXing;
}
