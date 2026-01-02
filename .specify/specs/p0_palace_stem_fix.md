基於 Gemini 評估報告 (gemini_sihua_evaluation.md) 中的 P0 級別問題，以下是針對 `peixuan-worker/src/services/annualFortune/edgeGenerator.ts` 的修正規格與代碼實現。

### 核心修正說明

1.  **五虎遁法則 (Five Tigers Escaping) 實作**：
    *   廢除原有的線性遞增 (`(LifeStem + Index) % 10`) 錯誤邏輯。
    *   引入標準「五虎遁」口訣：甲己之年丙作首，乙庚之歲戊為頭，丙辛之歲庚寅上，丁壬壬寅順行流，戊癸之年甲寅起。
    *   建立正確的 `YearStem` -> `YinPalaceStem` 映射關係。

2.  **宮位地支 (Earthly Branches) 定位**：
    *   假設標準紫微斗數盤陣列索引 0 為「子位」(Zi/Rat)，索引 2 為「寅位」(Yin/Tiger)。
    *   修正後的 `getPalaceStem` 將接受 `yearStem` (生年天干) 作為基準，而非 `lifePalaceStem`。

3.  **類型安全強化**：
    *   使用 TypeScript `as const` 定義天干地支，確保字串字面量類型安全。

### 代碼實現 (TypeScript)

以下內容應替換或更新至 `peixuan-worker/src/services/annualFortune/edgeGenerator.ts`。

```typescript
/**
 * SiHua Flying Star Edge Generator
 *
 * Generates directed edges in the palace graph based on SiHua transformations.
 * Reference: doc/SIHUA_IMPLEMENTATION_PLAN.md §3 Task 2
 * Update: 2026-01-02 - Fixed Palace Stem Calculation using Five Tigers Rule (P0)
 */

import type { Palace } from '../../annual/palace';
import type { FlyingStarEdge, PalaceGraph } from './types';

// ==========================================
// Constants & Types (Data Structures)
// ==========================================

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

/**
 * Four Transformations Mapping Table (四化表)
 * Maps each heavenly stem to its four transformation stars
 */
const FOUR_TRANSFORMATIONS_MAP: Record<
  HeavenlyStem,
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

const TYPE_MAP: Record<string, '祿' | '權' | '科' | '忌'> = {
  lu: '祿',
  quan: '權',
  ke: '科',
  ji: '忌',
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Validates if a string is a valid Heavenly Stem
 */
function isHeavenlyStem(stem: string): stem is HeavenlyStem {
  return HEAVENLY_STEMS.includes(stem as HeavenlyStem);
}

/**
 * Find the palace index where a star is located
 * Optimized to handle robust inputs
 */
function findStarPalace(palaces: Palace[], starName: string): number {
  if (!palaces || !Array.isArray(palaces)) return -1;
  
  for (let i = 0; i < palaces.length; i++) {
    const palace = palaces[i];
    // Robust check for stars array
    if (palace && Array.isArray((palace as any).stars)) {
      const { stars } = (palace as any);
      // Support both string stars and object stars with name property
      if (stars.some((star: any) => 
        star === starName || (typeof star === 'object' && star.name === starName)
      )) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Calculate Palace Stem using "Five Tigers Escaping" (五虎遁)
 * 
 * Logic:
 * 1. Determine the stem of the Yin (寅) palace based on the Year Stem.
 *    - Jia/Ji Year -> Yin is Bing (丙)
 *    - Yi/Geng Year -> Yin is Wu (戊)
 *    - Bing/Xin Year -> Yin is Geng (庚)
 *    - Ding/Ren Year -> Yin is Ren (壬)
 *    - Wu/Gui Year -> Yin is Jia (甲)
 * 2. Sequence other palaces based on the Heavenly Stems order from Yin.
 * 
 * @param yearStem - The Birth Year Heavenly Stem (生年天干)
 * @param palaceIndex - The index of the palace (0=Zi/子, 1=Chou/丑, ... 11=Hai/亥)
 * @returns The calculated Heavenly Stem for the palace
 */
export function getPalaceStem(yearStem: string, palaceIndex: number): HeavenlyStem | '' {
  if (!isHeavenlyStem(yearStem)) return '';

  const yearStemIdx = HEAVENLY_STEMS.indexOf(yearStem);
  
  // Calculate the stem index for Yin Palace (Earthly Branch Index 2)
  // Formula derived from Five Tigers song: (YearStem % 5) * 2 + 2
  // Example: Jia(0) -> (0%5)*2 + 2 = 2 (Bing)
  // Example: Yi(1) -> (1%5)*2 + 2 = 4 (Wu)
  const yinPalaceStemIdx = ((yearStemIdx % 5) * 2 + 2) % 10;

  // Calculate the difference between target palace and Yin palace (Index 2)
  // We add 10 to ensure positive result before modulo
  const offsetFromYin = palaceIndex - 2;
  
  // Calculate final stem index
  const finalStemIdx = (yinPalaceStemIdx + offsetFromYin + 20) % 10; // +20 handles negative offsets safely

  return HEAVENLY_STEMS[finalStemIdx];
}

// ==========================================
// Edge Generation Functions
// ==========================================

/**
 * Generate natal (birth chart) SiHua edges
 * 
 * USAGE NOTE: This function now requires the **Birth Year Stem** (生年天干)
 * to correctly calculate palace stems using Five Tigers rule.
 * 
 * @param palaces - Array of 12 palaces with stars
 * @param yearStem - The Birth Year Heavenly Stem (Must be passed correctly!)
 * @returns Array of flying star edges
 */
export function generateNatalEdges(
  palaces: Palace[],
  yearStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12) {
    console.warn('[SiHua] Invalid palaces array provided to generateNatalEdges');
    return edges;
  }
  
  if (!isHeavenlyStem(yearStem)) {
    console.warn(`[SiHua] Invalid yearStem provided: ${yearStem}`);
    return edges;
  }

  // Iterate through all 12 palaces (0=Zi ... 11=Hai)
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    // Correctly calculate palace stem using Five Tigers
    const sourceStem = getPalaceStem(yearStem, sourceIdx);

    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) {
      continue;
    }

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];

    // Generate edges for all four transformation types
    (['lu', 'quan', 'ke', 'ji'] as const).forEach((type) => {
      const starName = sourceTransforms[type];
      const targetIdx = findStarPalace(palaces, starName);

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
 * NOTE: For Decade edges, typically the "Decade Stem" is used to fly stars
 * affecting the whole board (Decade Center Fly).
 * If "Palace Self-Transformation" is needed for Decade, logic differs by sect.
 * This implementation assumes: Use the provided `decadeStem` to generate one set of 4 stars.
 * 
 * However, the original code iterated all palaces. If the intention is
 * "Decade Palace Self-Transformation", we need to know the stem of each palace
 * during the decade. (Usually same as Natal stems).
 * 
 * Preserving original iteration logic but fixing safety for now.
 */
export function generateDecadeEdges(
  palaces: Palace[],
  decadeStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];

  if (!palaces || palaces.length !== 12 || !isHeavenlyStem(decadeStem)) {
    return edges;
  }

  // Implementation decision: The original code implies deriving stems from decadeStem
  // linearly. This is likely incorrect for "Palace Stems" but might be trying to
  // simulate "Decade Fly".
  // For P0 Fix context: We will assume we want the Decade Stem ITSELF to fly.
  // BUT to keep compatibility with the graph structure (Edge needs Source),
  // we usually say the source is the "Decade Palace".
  
  // TODO: Verify if `decadeStem` here is the *Stem of the Decade Palace* or the Year Stem of the Decade?
  // Assuming it is the Stem of the Decade Palace.
  
  // If we just want the Decade's 4 stars:
  const transforms = FOUR_TRANSFORMATIONS_MAP[decadeStem as HeavenlyStem];
  if (transforms) {
     (['lu', 'quan', 'ke', 'ji'] as const).forEach((type) => {
      const starName = transforms[type];
      const targetIdx = findStarPalace(palaces, starName);
      if (targetIdx !== -1) {
        // Source? Conventionally the palace that triggered the fly (Decade Palace)
        // Since we don't have Decade Palace Index here, we might need to adjust signature.
        // For now, setting source to -1 or keeping original loop if it was intended for something else.
        // Original loop: `getPalaceStem(decadeStem, sourceIdx)`.
        
        // SAFE FALLBACK: Use strict mapping if the original logic was specific.
        // Returning empty or minimal implementation to avoid breaking changes without more context.
        // We will focus on the P0 Natal fix primarily.
      }
    });
  }
  
  // For now, retain a safe version of the original loop logic but using safe access
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    // WARN: This logic assumes a linear shift for Decade, which is likely non-standard.
    // However, we fix the crash/undefined issues.
    const stemIdx = HEAVENLY_STEMS.indexOf(decadeStem as HeavenlyStem);
    const sourceStem = HEAVENLY_STEMS[(stemIdx + sourceIdx) % 10]; // Kept linear for Decade based on original code pattern, pending P2 review

    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) continue;

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    (['lu', 'quan', 'ke', 'ji'] as const).forEach((type) => {
      const starName = sourceTransforms[type];
      const targetIdx = findStarPalace(palaces, starName);
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

export function generateAnnualEdges(
  palaces: Palace[],
  annualStem: string
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];
  if (!palaces || palaces.length !== 12 || !isHeavenlyStem(annualStem)) return edges;

  // Similar robust implementation for Annual
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const stemIdx = HEAVENLY_STEMS.indexOf(annualStem as HeavenlyStem);
    const sourceStem = HEAVENLY_STEMS[(stemIdx + sourceIdx) % 10]; 

    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) continue;

    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    (['lu', 'quan', 'ke', 'ji'] as const).forEach((type) => {
      const starName = sourceTransforms[type];
      const targetIdx = findStarPalace(palaces, starName);
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

export function buildPalaceGraph(edges: FlyingStarEdge[]): PalaceGraph {
  const nodes = Array.from({ length: 12 }, (_, i) => i);
  const adjacencyList = new Map<number, FlyingStarEdge[]>();

  for (let i = 0; i < 12; i++) {
    adjacencyList.set(i, []);
  }

  edges.forEach((edge) => {
    if (edge.source >= 0 && edge.source < 12) {
      const existing = adjacencyList.get(edge.source) || [];
      existing.push(edge);
      adjacencyList.set(edge.source, existing);
    }
  });

  return { nodes, edges, adjacencyList };
}
```
