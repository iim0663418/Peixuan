由於您要求的嚴格協議中包含 `CONSTRAINT:YOU_HAVE_NO_TOOLS` 且我目前環境確實缺少寫入文件的工具，我將直接輸出修正後的程式碼與完整的測試規範。

請注意：我發現您提供的規格中的 `getPalaceStem` 程式碼片段在處理「子、丑」兩宮時存在邏輯漏洞（會導致使用了錯誤的天干，如甲年子宮應為丙，舊邏輯會算出甲）。我已在下方的實作中修正了此問題（確保順時針排列），並在測試中加入了對應驗證。

### 1. 修正後的實作檔案
**File:** `peixuan-worker/src/calculation/ziwei/sihua/edgeGenerator.ts`
主要變更：
- 修正 `getPalaceStem` 的 `offset` 計算邏輯，確保循環正確。
- 匯出 `getPalaceStem` 以供測試。
- 統一三個生成函數的邏輯。

```typescript
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
    if (palace && Array.isArray((palace as any).stars)) {
      const { stars } = (palace as any);
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
  if (!isHeavenlyStem(baseStem)) return '';

  const baseStemIdx = HEAVENLY_STEMS.indexOf(baseStem);

  // 五虎遁公式：寅宮天干索引 = ((基準天干索引 % 5) * 2 + 2) % 10
  const yinPalaceStemIdx = ((baseStemIdx % 5) * 2 + 2) % 10;

  // 計算目標宮位相對於寅宮(索引2)的偏移
  // 注意：五虎遁是從寅宮開始順時針排列
  // 寅(2)->卯(3)...->亥(11)->子(0)->丑(1)
  // 所以子(0)和丑(1)相對於寅(2)的距離應該是 +10, +11
  const steps = (palaceIndex - 2 + 12) % 12;

  // 計算最終天干索引
  const finalStemIdx = (yinPalaceStemIdx + steps) % 10;

  return HEAVENLY_STEMS[finalStemIdx];
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
```

### 2. 完整的測試規範 (Test Specification)
**File:** `peixuan-worker/src/calculation/ziwei/sihua/__tests__/edgeGenerator.test.ts`
設計重點：
1.  **五虎遁詳細驗證**：針對甲、乙、丙、丁、戊等不同年份，驗證寅宮起首及子/丑宮的循環是否正確。
2.  **四化邏輯驗證**：驗證特定天干（如甲干廉貞化祿）是否正確生成邊。
3.  **三層分離驗證**：確保本命、大限、流年的權重和層級標記正確。

```typescript
/**
 * Edge Generator Unit Tests
 *
 * Tests the flying star edge generation functions including Wu-Hu-Dun logic
 * and multi-layer edge generation.
 */

import {
  generateNatalEdges,
  generateDecadeEdges,
  generateAnnualEdges,
  buildPalaceGraph,
  getPalaceStem,
} from '../edgeGenerator';
import type { Palace } from '../../../annual/palace';

describe('Edge Generator', () => {
  // Mock palace data with some stars to test edge targeting
  const mockPalaces: Palace[] = Array.from({ length: 12 }, (_, i) => ({
    position: i,
    branch: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i],
    stars: [], // Will populate specific stars in tests
  }));

  // Helper to add a star to a palace for testing
  const addStar = (palaceIdx: number, starName: string) => {
    if (!mockPalaces[palaceIdx].stars) mockPalaces[palaceIdx].stars = [];
    (mockPalaces[palaceIdx] as any).stars.push({ name: starName });
  };

  // Reset stars before tests
  beforeEach(() => {
    mockPalaces.forEach(p => (p as any).stars = []);
  });

  describe('getPalaceStem (五虎遁)', () => {
    // 驗證口訣：甲己之年丙作首 (寅宮為丙)
    it('should calculate correct stems for Jia (甲) year', () => {
      // 寅(2)=丙, 卯(3)=丁 ... 亥(11)=乙, 子(0)=丙, 丑(1)=丁
      expect(getPalaceStem('甲', 2)).toBe('丙'); // 寅
      expect(getPalaceStem('甲', 3)).toBe('丁'); // 卯
      expect(getPalaceStem('甲', 11)).toBe('乙'); // 亥
      expect(getPalaceStem('甲', 0)).toBe('丙'); // 子 (循環後)
      expect(getPalaceStem('甲', 1)).toBe('丁'); // 丑 (循環後)
    });

    // 驗證口訣：乙庚之歲戊為頭 (寅宮為戊)
    it('should calculate correct stems for Yi (乙) year', () => {
      expect(getPalaceStem('乙', 2)).toBe('戊'); // 寅
      expect(getPalaceStem('乙', 3)).toBe('己'); // 卯
      expect(getPalaceStem('乙', 0)).toBe('戊'); // 子
    });

    // 驗證口訣：丙辛之歲庚寅上 (寅宮為庚)
    it('should calculate correct stems for Bing (丙) year', () => {
      expect(getPalaceStem('丙', 2)).toBe('庚');
    });

    // 驗證口訣：丁壬壬寅順行流 (寅宮為壬)
    it('should calculate correct stems for Ding (丁) year', () => {
      expect(getPalaceStem('丁', 2)).toBe('壬');
    });

    // 驗證口訣：戊癸之年甲寅起 (寅宮為甲)
    it('should calculate correct stems for Wu (戊) year', () => {
      expect(getPalaceStem('戊', 2)).toBe('甲');
    });

    it('should return empty string for invalid stem', () => {
      expect(getPalaceStem('Invalid', 2)).toBe('');
    });
  });

  describe('generateNatalEdges', () => {
    it('should generate correct natal edges for Jia (甲) year stem', () => {
      // Setup: Jia year -> Yin(2) is Bing. Bing transforms:
      // Lu: Tian Tong (天同), Quan: Tian Ji (天機), Ke: Wen Chang (文昌), Ji: Lian Zhen (廉貞)
      
      // Place stars in specific palaces
      addStar(5, '天同');
      addStar(6, '天機');
      addStar(7, '文昌');
      addStar(8, '廉貞');

      // Generate edges using Birth Year Stem '甲'
      // Note: This calculates stems for ALL palaces.
      // Let's focus on checking if the Yin palace (Stem Bing) generates edges correctly.
      const edges = generateNatalEdges(mockPalaces, '甲');

      // Find edges originating from Yin (2)
      const yinEdges = edges.filter(e => e.source === 2);
      
      expect(yinEdges).toHaveLength(4);
      
      // Verify Lu (Bing -> Tian Tong)
      const luEdge = yinEdges.find(e => e.sihuaType === '祿');
      expect(luEdge).toBeDefined();
      expect(luEdge?.target).toBe(5); // Tian Tong is at 5
      expect(luEdge?.starName).toBe('天同');
      expect(luEdge?.sourceStem).toBe('丙'); // Generated stem for Yin

      // Verify general properties
      expect(luEdge?.layer).toBe('natal');
      expect(luEdge?.weight).toBe(1.0);
    });

    it('should handle all 12 palaces', () => {
      // Just check we get output for valid setup
      addStar(0, '廉貞'); // Place a star
      const edges = generateNatalEdges(mockPalaces, '甲');
      expect(edges.length).toBeGreaterThan(0);
    });
  });

  describe('generateDecadeEdges', () => {
    it('should use decade stem and correct weights', () => {
      // Decade Stem '乙' -> Yin(2) is Wu (戊)
      // Wu transforms: Lu: Tan Lang, Quan: Tai Yin, Ke: You Bi, Ji: Tian Ji
      addStar(4, '貪狼');
      
      const edges = generateDecadeEdges(mockPalaces, '乙');
      const yinEdges = edges.filter(e => e.source === 2);
      const luEdge = yinEdges.find(e => e.sihuaType === '祿');

      expect(luEdge).toBeDefined();
      expect(luEdge?.target).toBe(4);
      expect(luEdge?.starName).toBe('貪狼');
      expect(luEdge?.sourceStem).toBe('戊'); // Calculated from Decade Stem 'Yi'
      expect(luEdge?.layer).toBe('decade');
      expect(luEdge?.weight).toBe(0.7);
    });
  });

  describe('generateAnnualEdges', () => {
    it('should use annual stem and correct weights', () => {
      // Annual Stem '丙' -> Yin(2) is Geng (庚)
      // Geng transforms: Lu: Tai Yang, Quan: Wu Qu, Ke: Tai Yin, Ji: Tian Tong
      addStar(9, '太陽');
      
      const edges = generateAnnualEdges(mockPalaces, '丙');
      const yinEdges = edges.filter(e => e.source === 2);
      const luEdge = yinEdges.find(e => e.sihuaType === '祿');

      expect(luEdge).toBeDefined();
      expect(luEdge?.target).toBe(9);
      expect(luEdge?.starName).toBe('太陽');
      expect(luEdge?.sourceStem).toBe('庚'); // Calculated from Annual Stem 'Bing'
      expect(luEdge?.layer).toBe('annual');
      expect(luEdge?.weight).toBe(0.5);
    });
  });

  describe('buildPalaceGraph', () => {
    it('should construct adjacency list correctly', () => {
      // Create some dummy edges
      const edges = [
        { source: 0, target: 1, sihuaType: '祿', starName: 'A', layer: 'natal', weight: 1.0, sourceStem: '甲' },
        { source: 0, target: 2, sihuaType: '忌', starName: 'B', layer: 'natal', weight: 1.0, sourceStem: '甲' },
        { source: 5, target: 0, sihuaType: '權', starName: 'C', layer: 'natal', weight: 1.0, sourceStem: '戊' },
      ];

      // Cast to FlyingStarEdge for test (ignoring strict type check for mock)
      const graph = buildPalaceGraph(edges as any);

      expect(graph.nodes).toHaveLength(12);
      expect(graph.adjacencyList.get(0)).toHaveLength(2);
      expect(graph.adjacencyList.get(5)).toHaveLength(1);
      expect(graph.adjacencyList.get(1)).toHaveLength(0);
      
      const source0 = graph.adjacencyList.get(0);
      expect(source0?.map(e => e.target)).toContain(1);
      expect(source0?.map(e => e.target)).toContain(2);
    });
  });
});
```
