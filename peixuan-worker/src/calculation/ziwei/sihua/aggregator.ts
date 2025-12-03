/**
 * SiHua Aggregation Module
 *
 * Top-level aggregator that combines edge generation, graph construction,
 * cycle detection, and centrality analysis.
 * Reference: doc/SIHUA_IMPLEMENTATION_PLAN.md §3 Task 4
 */

import type { Palace } from '../../annual/palace';
import type { SiHuaAggregation } from './types';
import {
  generateNatalEdges,
  generateDecadeEdges,
  generateAnnualEdges,
  buildPalaceGraph,
} from './edgeGenerator';
import {
  detectCycles,
  identifyStressNodes,
  identifyResourceNodes,
  identifyPowerNodes,
  identifyFameNodes,
} from './graphAnalysis';

/**
 * Count edges by transformation type
 *
 * @param edges - Array of flying star edges
 * @returns Record mapping sihuaType to count
 */
function countEdgesByType(edges: any[]): Record<string, number> {
  const counts: Record<string, number> = {
    '祿': 0,
    '權': 0,
    '科': 0,
    '忌': 0,
  };

  edges.forEach((edge) => {
    if (edge.sihuaType && counts[edge.sihuaType] !== undefined) {
      counts[edge.sihuaType]++;
    }
  });

  return counts;
}

/**
 * Count edges by layer
 *
 * @param edges - Array of flying star edges
 * @returns Record mapping layer to count
 */
function countEdgesByLayer(edges: any[]): Record<string, number> {
  const counts: Record<string, number> = {
    natal: 0,
    decade: 0,
    annual: 0,
  };

  edges.forEach((edge) => {
    if (edge.layer && counts[edge.layer] !== undefined) {
      counts[edge.layer]++;
    }
  });

  return counts;
}

/**
 * Aggregate SiHua Flying Stars Analysis
 *
 * Main aggregation function that performs complete SiHua graph analysis:
 * 1. Generates flying star edges for all layers
 * 2. Builds palace graph structure
 * 3. Detects cycles for each transformation type
 * 4. Analyzes centrality (stress/resource/power/fame nodes)
 * 5. Computes statistics and structural features
 *
 * @param palaces - Array of 12 palaces with stars
 * @param lifePalaceStem - Life palace's heavenly stem
 * @param decadeStem - Optional decade fortune's heavenly stem
 * @param annualStem - Optional annual fortune's heavenly stem
 * @returns Complete SiHua aggregation result
 *
 * @example
 * ```typescript
 * const result = aggregateSiHua(palaces, '甲', '乙', '丙');
 * console.log(result.hasJiCycle); // Check for Ji cycles
 * console.log(result.stressNodes); // View stress convergence points
 * ```
 */
export function aggregateSiHua(
  palaces: Palace[],
  lifePalaceStem: string,
  decadeStem?: string,
  annualStem?: string
): SiHuaAggregation {
  // Step 1: Generate flying star edges
  const natalEdges = generateNatalEdges(palaces, lifePalaceStem);
  const decadeEdges = decadeStem ? generateDecadeEdges(palaces, decadeStem) : [];
  const annualEdges = annualStem ? generateAnnualEdges(palaces, annualStem) : [];
  const allEdges = [...natalEdges, ...decadeEdges, ...annualEdges];

  // Step 2: Build graph structure
  const graph = buildPalaceGraph(allEdges);

  // Step 3: Cycle detection for each transformation type
  const jiCycles = detectCycles(graph, '忌');
  const luCycles = detectCycles(graph, '祿');
  const quanCycles = detectCycles(graph, '權');
  const keCycles = detectCycles(graph, '科');

  // Step 4: Centrality analysis
  const stressNodes = identifyStressNodes(graph);
  const resourceNodes = identifyResourceNodes(graph);
  const powerNodes = identifyPowerNodes(graph);
  const fameNodes = identifyFameNodes(graph);

  // Step 5: Statistics and features
  const totalEdges = allEdges.length;
  const edgesByType = countEdgesByType(allEdges);
  const edgesByLayer = countEdgesByLayer(allEdges);

  const hasJiCycle = jiCycles.length > 0;
  const hasLuCycle = luCycles.length > 0;
  const maxStressPalace = stressNodes[0]?.palace ?? -1;
  const maxResourcePalace = resourceNodes[0]?.palace ?? -1;

  return {
    // Cycle Detection
    jiCycles,
    luCycles,
    quanCycles,
    keCycles,

    // Centrality Analysis
    stressNodes,
    resourceNodes,
    powerNodes,
    fameNodes,

    // Graph Statistics
    totalEdges,
    edgesByType,
    edgesByLayer,

    // Structural Features
    hasJiCycle,
    hasLuCycle,
    maxStressPalace,
    maxResourcePalace,
  };
}
