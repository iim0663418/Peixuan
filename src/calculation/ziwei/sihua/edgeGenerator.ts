/**
 * SiHua Flying Star Edge Generator
 *
 * Generates directed edges in the palace graph based on SiHua transformations.
 * Reference: doc/SIHUA_IMPLEMENTATION_PLAN.md §3 Task 2
 */

import type { Palace } from '../../annual/palace';
import type { FlyingStarEdge, PalaceGraph } from './types';

/**
 * Four Transformations Mapping Table
 * Maps each heavenly stem to its four transformation stars
 */
const FOUR_TRANSFORMATIONS_MAP: Record<
  string,
  { lu: string; quan: string; ke: string; ji: string }
> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
};

/**
 * Type mapping from English keys to Chinese characters
 */
const TYPE_MAP: Record<string, '祿' | '權' | '科' | '忌'> = {
  lu: '祿',
  quan: '權',
  ke: '科',
  ji: '忌',
};

/**
 * Find the palace index where a star is located
 *
 * @param palaces - Array of 12 palaces
 * @param starName - Star name to search for
 * @returns Palace index (0-11) or -1 if not found
 */
function findStarPalace(palaces: Palace[], starName: string): number {
  for (let i = 0; i < palaces.length; i++) {
    const palace = palaces[i];
    // Check if palace has stars array and contains the target star
    if (palace && Array.isArray((palace as unknown as { stars: unknown[] }).stars)) {
      const { stars } = palace as unknown as { stars: Array<{ name?: string } | string> };
      if (stars.some((star) => (typeof star === 'string' ? star === starName : star.name === starName))) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Heavenly stems array for palace stem calculation
 */
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * HeavenlyStem type definition
 */
type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/**
 * Type guard to check if a string is a valid HeavenlyStem
 *
 * @param stem - String to check
 * @returns True if the string is a valid heavenly stem
 */
function isHeavenlyStem(stem: string): stem is HeavenlyStem {
  return HEAVENLY_STEMS.includes(stem);
}

/**
 * 計算宮位天干 - 使用五虎遁法則
 *
 * 五虎遁口訣：
 * 甲己之年丙作首 (甲/己年 -> 寅宮起丙)
 * 乙庚之歲戊為頭 (乙/庚年 -> 寅宮起戊)
 * 丙辛之歲庚寅上 (丙/辛年 -> 寅宮起庚)
 * 丁壬壬寅順行流 (丁/壬年 -> 寅宮起壬)
 * 戊癸之年甲寅起 (戊/癸年 -> 寅宮起甲)
 *
 * @param baseStem - 基準天干 (本命用生年天干，大限用大限天干，流年用流年天干)
 * @param palaceIndex - 宮位索引 (0=子, 1=丑, 2=寅, ..., 11=亥)
 * @returns 該宮位的天干
 */
export function getPalaceStem(baseStem: string, palaceIndex: number): HeavenlyStem | '' {
  if (!isHeavenlyStem(baseStem)) {
    return '';
  }

  const baseStemIdx = HEAVENLY_STEMS.indexOf(baseStem);

  // 五虎遁對照表：直接映射每個天干對應的寅宮天干
  const yinStemMap: Record<number, number> = {
    0: 2, // 甲 -> 丙 (index 2)
    1: 4, // 乙 -> 戊 (index 4) 
    2: 6, // 丙 -> 庚 (index 6)
    3: 8, // 丁 -> 壬 (index 8)
    4: 0, // 戊 -> 甲 (index 0)
    5: 2, // 己 -> 丙 (index 2)
    6: 4, // 庚 -> 戊 (index 4)
    7: 6, // 辛 -> 庚 (index 6)
    8: 8, // 壬 -> 壬 (index 8)
    9: 0, // 癸 -> 甲 (index 0)
  };

  const yinPalaceStemIdx = yinStemMap[baseStemIdx];

  // 計算目標宮位相對於寅宮(索引2)的偏移
  const steps = (palaceIndex - 2 + 12) % 12;

  // 計算最終天干索引
  const finalStemIdx = (yinPalaceStemIdx + steps) % 10;

  return HEAVENLY_STEMS[finalStemIdx] as HeavenlyStem;
}

/**
 * 生成本命四化邊 (使用生年天干)
 *
 * Creates flying star edges based on the natal chart's transformations.
 * Iterates through all 12 palaces, calculating each palace's stem using Wu-Hu-Dun
 * method based on the birth year stem, and generates 4 transformation edges per palace.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param lifePalaceStem - 生年天干 (Birth year's heavenly stem, NOT life palace stem)
 * @returns Array of flying star edges (natal layer, weight 1.0), max 48 edges
 */
export function generateNatalEdges(
  palaces: Palace[],
  lifePalaceStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12) {
    return edges;
  }

  // 遍歷12宮，每宮用生年天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(lifePalaceStem, sourceIdx);

    // Skip if no stem found or no transformation mapping
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // 生成四化邊
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);

      // Only create edge if target palace found
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'natal',
          weight: 1.0,
          sourceStem,
        });
      }
    });
  }

  return edges;
}

/**
 * 生成大限四化邊 (使用大限天干)
 *
 * Creates flying star edges based on decade fortune transformations.
 * Iterates through all 12 palaces, calculating each palace's stem using Wu-Hu-Dun
 * method based on the decade stem, and generates 4 transformation edges per palace.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param decadeStem - 大限天干 (Decade fortune's heavenly stem)
 * @returns Array of flying star edges (decade layer, weight 0.7), max 48 edges
 */
export function generateDecadeEdges(
  palaces: Palace[],
  decadeStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12 || !decadeStem) {
    return edges;
  }

  // 遍歷12宮，每宮用大限天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(decadeStem, sourceIdx);

    // Skip if no stem found or no transformation mapping
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // 生成四化邊 (權重0.7)
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);

      // Only create edge if target palace found
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'decade',
          weight: 0.7,
          sourceStem,
        });
      }
    });
  }

  return edges;
}

/**
 * 生成流年四化邊 (使用流年天干)
 *
 * Creates flying star edges based on annual fortune transformations.
 * Iterates through all 12 palaces, calculating each palace's stem using Wu-Hu-Dun
 * method based on the annual stem, and generates 4 transformation edges per palace.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param annualStem - 流年天干 (Annual fortune's heavenly stem)
 * @returns Array of flying star edges (annual layer, weight 0.5), max 48 edges
 */
export function generateAnnualEdges(
  palaces: Palace[],
  annualStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12 || !annualStem) {
    return edges;
  }

  // 遍歷12宮，每宮用流年天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(annualStem, sourceIdx);

    // Skip if no stem found or no transformation mapping
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // 生成四化邊 (權重0.5)
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);

      // Only create edge if target palace found
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'annual',
          weight: 0.5,
          sourceStem,
        });
      }
    });
  }

  return edges;
}

/**
 * Build palace graph from flying star edges
 *
 * Constructs a graph structure with adjacency list for efficient traversal.
 *
 * @param edges - Array of all flying star edges
 * @returns PalaceGraph with nodes, edges, and adjacency list
 */
export function buildPalaceGraph(edges: FlyingStarEdge[]): PalaceGraph {
  // Initialize nodes (12 palaces)
  const nodes = Array.from({ length: 12 }, (_, i) => i);

  // Build adjacency list
  const adjacencyList = new Map<number, FlyingStarEdge[]>();

  // Initialize adjacency list for all nodes
  for (let i = 0; i < 12; i++) {
    adjacencyList.set(i, []);
  }

  // Populate adjacency list
  edges.forEach((edge) => {
    // Skip edges with invalid source (should always be 0-11)
    if (edge.source >= 0 && edge.source < 12) {
      const existing = adjacencyList.get(edge.source) || [];
      existing.push(edge);
      adjacencyList.set(edge.source, existing);
    }
  });

  return {
    nodes,
    edges,
    adjacencyList,
  };
}
