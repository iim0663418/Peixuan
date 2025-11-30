/**
 * 五行時令模組 (WuXing Seasonality Module)
 *
 * 實現五行時令旺衰計算
 * 基於: 八字命理後端模組研究.md §2.3.1
 */

import { WuXing } from '../core/wuXing/relations';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Transitional';

const BRANCH_SEASON_MAP: Record<string, Season> = {
  '寅': 'Spring', '卯': 'Spring',
  '巳': 'Summer', '午': 'Summer',
  '申': 'Autumn', '酉': 'Autumn',
  '亥': 'Winter', '子': 'Winter',
  '辰': 'Transitional', '戌': 'Transitional', '丑': 'Transitional', '未': 'Transitional',
};

const SEASONALITY_COEFFICIENT: Record<Season, Record<WuXing, number>> = {
  Spring: { Wood: 1.5, Fire: 1.3, Water: 1.0, Earth: 0.7, Metal: 0.5 },
  Summer: { Fire: 1.5, Earth: 1.3, Wood: 1.0, Metal: 0.7, Water: 0.5 },
  Autumn: { Metal: 1.5, Water: 1.3, Earth: 1.0, Wood: 0.7, Fire: 0.5 },
  Winter: { Water: 1.5, Wood: 1.3, Metal: 1.0, Fire: 0.7, Earth: 0.5 },
  Transitional: { Earth: 1.5, Metal: 1.3, Fire: 1.0, Water: 0.7, Wood: 0.5 },
};

/**
 * 從月支取得季節
 */
export function getSeasonFromBranch(monthBranch: string): Season {
  const season = BRANCH_SEASON_MAP[monthBranch];
  if (!season) {
    throw new Error(`Invalid month branch: ${monthBranch}`);
  }
  return season;
}

/**
 * 取得時令係數
 */
export function getSeasonalityCoefficient(element: WuXing, season: Season): number {
  return SEASONALITY_COEFFICIENT[season][element];
}

/**
 * 應用時令調整
 */
export function applySeasonalityAdjustment(
  wuxingScores: Record<WuXing, number>,
  monthBranch: string
): Record<WuXing, number> {
  const season = getSeasonFromBranch(monthBranch);

  return {
    Wood: wuxingScores.Wood * getSeasonalityCoefficient('Wood', season),
    Fire: wuxingScores.Fire * getSeasonalityCoefficient('Fire', season),
    Earth: wuxingScores.Earth * getSeasonalityCoefficient('Earth', season),
    Metal: wuxingScores.Metal * getSeasonalityCoefficient('Metal', season),
    Water: wuxingScores.Water * getSeasonalityCoefficient('Water', season),
  };
}
