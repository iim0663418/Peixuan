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
    if (palace && Array.isArray((palace as any).stars)) {
      const {stars} = (palace as any);
      if (stars.some((star: any) => star.name === starName || star === starName)) {
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
 * Get the heavenly stem of a palace
 *
 * @param lifePalaceStem - Life palace's heavenly stem
 * @param palaceIndex - Palace index (0-11)
 * @returns Heavenly stem string for the given palace
 */
function getPalaceStem(lifePalaceStem: string, palaceIndex: number): string {
  const lifePalaceStemIndex = HEAVENLY_STEMS.indexOf(lifePalaceStem);
  if (lifePalaceStemIndex === -1) {
    return '';
  }

  return HEAVENLY_STEMS[(lifePalaceStemIndex + palaceIndex) % 10];
}

/**
 * Generate natal (birth chart) SiHua edges
 *
 * Creates flying star edges based on the natal chart's transformations.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param lifePalaceStem - Life palace's heavenly stem
 * @returns Array of flying star edges (natal layer, weight 1.0)
 */
export function generateNatalEdges(
  palaces: Palace[],
  lifePalaceStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12) {
    return edges;
  }

  // Get transformations for each palace stem
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(lifePalaceStem, sourceIdx);

    // Skip if no stem found
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // Generate edges for all four transformation types
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
 * Generate decade (大限) SiHua edges
 *
 * Creates flying star edges based on decade fortune transformations.
 * Iterates through all 12 palaces, calculating each palace's stem relative
 * to the decade stem, and generates 4 transformation edges per palace.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param decadeStem - Decade fortune's heavenly stem (acts as base stem)
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

  // Iterate through all 12 palaces
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    // Calculate palace stem relative to decade stem
    const sourceStem = getPalaceStem(decadeStem, sourceIdx);

    // Skip if no stem found or no transformation mapping
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // Generate edges for all four transformation types
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);

      // Only create edge if target palace found
      if (targetIdx !== -1) {
        // Decade edges have lower weight (0.7)
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
 * Generate annual (流年) SiHua edges
 *
 * Creates flying star edges based on annual fortune transformations.
 * Iterates through all 12 palaces, calculating each palace's stem relative
 * to the annual stem, and generates 4 transformation edges per palace.
 *
 * @param palaces - Array of 12 palaces with stars
 * @param annualStem - Annual fortune's heavenly stem (acts as base stem)
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

  // Iterate through all 12 palaces
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    // Calculate palace stem relative to annual stem
    const sourceStem = getPalaceStem(annualStem, sourceIdx);

    // Skip if no stem found or no transformation mapping
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // Generate edges for all four transformation types
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);

      // Only create edge if target palace found
      if (targetIdx !== -1) {
        // Annual edges have lowest weight (0.5)
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
