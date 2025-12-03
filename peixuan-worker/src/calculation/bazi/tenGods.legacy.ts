/**
 * BaZi Ten Gods (十神) Module
 * Calculates the relationship between day stem and other stems
 */

export type TenGod =
  | '比肩' // Companion (same element, same polarity)
  | '劫財' // Rob Wealth (same element, opposite polarity)
  | '食神' // Eating God (I produce, same polarity)
  | '傷官' // Hurting Officer (I produce, opposite polarity)
  | '偏財' // Indirect Wealth (I control, same polarity)
  | '正財' // Direct Wealth (I control, opposite polarity)
  | '七殺' // Seven Killings (controls me, same polarity)
  | '正官' // Direct Officer (controls me, opposite polarity)
  | '偏印' // Indirect Resource (produces me, same polarity)
  | '正印'; // Direct Resource (produces me, opposite polarity)

type WuXing = '木' | '火' | '土' | '金' | '水';
type Polarity = 'yang' | 'yin';

interface StemProperties {
  element: WuXing;
  polarity: Polarity;
}

/**
 * Ten Heavenly Stems properties
 */
const STEM_PROPERTIES: Record<string, StemProperties> = {
  甲: { element: '木', polarity: 'yang' },
  乙: { element: '木', polarity: 'yin' },
  丙: { element: '火', polarity: 'yang' },
  丁: { element: '火', polarity: 'yin' },
  戊: { element: '土', polarity: 'yang' },
  己: { element: '土', polarity: 'yin' },
  庚: { element: '金', polarity: 'yang' },
  辛: { element: '金', polarity: 'yin' },
  壬: { element: '水', polarity: 'yang' },
  癸: { element: '水', polarity: 'yin' }
};

/**
 * Wu Xing production cycle (相生)
 * Wood -> Fire -> Earth -> Metal -> Water -> Wood
 */
const PRODUCES_MAP: Record<WuXing, WuXing> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木'
};

/**
 * Wu Xing control cycle (相剋)
 * Wood -> Earth -> Water -> Fire -> Metal -> Wood
 */
const CONTROLS_MAP: Record<WuXing, WuXing> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木'
};

/**
 * Determine relationship between two Wu Xing elements
 */
function getElementRelation(
  dayElement: WuXing,
  targetElement: WuXing
): 'same' | 'produces' | 'produced-by' | 'controls' | 'controlled-by' {
  if (dayElement === targetElement) {return 'same';}
  if (PRODUCES_MAP[dayElement] === targetElement) {return 'produces';}
  if (PRODUCES_MAP[targetElement] === dayElement) {return 'produced-by';}
  if (CONTROLS_MAP[dayElement] === targetElement) {return 'controls';}
  return 'controlled-by';
}

/**
 * Check if two stems have same polarity
 */
function samePolarityAs(dayStem: string, targetStem: string): boolean {
  return (
    STEM_PROPERTIES[dayStem].polarity === STEM_PROPERTIES[targetStem].polarity
  );
}

/**
 * Calculate Ten God relationship between day stem and target stem
 * @param dayStem - Day stem (日干) as reference point
 * @param targetStem - Target stem to analyze
 * @returns Ten God type
 */
export function calculateTenGod(dayStem: string, targetStem: string): TenGod {
  const dayProps = STEM_PROPERTIES[dayStem];
  const targetProps = STEM_PROPERTIES[targetStem];

  if (!dayProps || !targetProps) {
    throw new Error(`Invalid stem: ${dayStem} or ${targetStem}`);
  }

  const relation = getElementRelation(dayProps.element, targetProps.element);
  const samePol = samePolarityAs(dayStem, targetStem);

  // Same element
  if (relation === 'same') {
    return samePol ? '比肩' : '劫財';
  }

  // I produce (Output)
  if (relation === 'produces') {
    return samePol ? '食神' : '傷官';
  }

  // I control (Wealth)
  if (relation === 'controls') {
    return samePol ? '偏財' : '正財';
  }

  // Controls me (Authority)
  if (relation === 'controlled-by') {
    return samePol ? '七殺' : '正官';
  }

  // Produces me (Resource)
  return samePol ? '偏印' : '正印';
}

/**
 * Get all ten gods for the ten stems from a day stem perspective
 * @param dayStem - Day stem as reference
 * @returns Map of stem to ten god
 */
export function getAllTenGods(dayStem: string): Record<string, TenGod> {
  const result: Record<string, TenGod> = {};
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  for (const stem of stems) {
    result[stem] = calculateTenGod(dayStem, stem);
  }

  return result;
}
