/**
 * SiHua Graph Analysis Module
 *
 * Implements graph algorithms for cycle detection and centrality analysis.
 * Reference: doc/SIHUA_IMPLEMENTATION_PLAN.md §3 Task 3
 */

import { PalaceGraph, SiHuaCycle, CentralityNode } from './types';

/**
 * Palace names array (0-11 indices)
 */
const PALACE_NAMES = [
  '命宮',
  '兄弟宮',
  '夫妻宮',
  '子女宮',
  '財帛宮',
  '疾厄宮',
  '遷移宮',
  '奴僕宮',
  '官祿宮',
  '田宅宮',
  '福德宮',
  '父母宮',
];

/**
 * Calculate cycle severity based on palace count and type
 *
 * @param palaces - Palace indices in cycle
 * @param sihuaType - Transformation type
 * @returns Severity level
 */
function calculateCycleSeverity(
  palaces: number[],
  sihuaType: string
): 'low' | 'medium' | 'high' {
  const cycleLength = palaces.length;

  // Ji (忌) cycles are most severe
  if (sihuaType === '忌') {
    if (cycleLength >= 4) return 'high';
    if (cycleLength === 3) return 'medium';
    return 'low';
  }

  // Other types
  if (cycleLength >= 5) return 'high';
  if (cycleLength >= 3) return 'medium';
  return 'low';
}

/**
 * Generate cycle description
 *
 * @param palaces - Palace indices in cycle
 * @param sihuaType - Transformation type
 * @returns Human-readable description
 */
function generateCycleDescription(
  palaces: number[],
  sihuaType: string
): string {
  const palaceNames = palaces.map((p) => PALACE_NAMES[p] || `宮${p}`);
  const typeDesc = {
    '祿': '資源循環',
    '權': '權力循環',
    '科': '名聲循環',
    '忌': '業力循環',
  }[sihuaType] || '循環';

  return `${typeDesc}: ${palaceNames.join(' → ')} → ${palaceNames[0]}`;
}

/**
 * Detect cycles in the graph using DFS
 *
 * Uses depth-first search with recursion stack to detect cycles
 * for a specific transformation type.
 *
 * @param graph - Palace graph
 * @param sihuaType - Transformation type to analyze
 * @returns Array of detected cycles
 */
export function detectCycles(
  graph: PalaceGraph,
  sihuaType: string
): SiHuaCycle[] {
  const cycles: SiHuaCycle[] = [];
  const visited = new Set<number>();
  const recStack = new Set<number>();
  const path: number[] = [];

  /**
   * DFS helper function
   */
  function dfs(node: number): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    // Get edges for this node
    const edges = graph.adjacencyList.get(node) || [];

    // Filter edges by sihuaType
    const filteredEdges = edges.filter((e) => e.sihuaType === sihuaType);

    for (const edge of filteredEdges) {
      const target = edge.target;

      if (!visited.has(target)) {
        // Continue DFS
        dfs(target);
      } else if (recStack.has(target)) {
        // Found a cycle
        const cycleStart = path.indexOf(target);
        if (cycleStart !== -1) {
          const cyclePalaces = path.slice(cycleStart);

          // Add cycle if not duplicate
          const cycleKey = cyclePalaces.sort().join(',');
          const isDuplicate = cycles.some(
            (c) => c.palaces.sort().join(',') === cycleKey
          );

          if (!isDuplicate) {
            cycles.push({
              palaces: [...cyclePalaces],
              type: sihuaType as '祿' | '權' | '科' | '忌',
              severity: calculateCycleSeverity(cyclePalaces, sihuaType),
              description: generateCycleDescription(cyclePalaces, sihuaType),
            });
          }
        }
      }
    }

    path.pop();
    recStack.delete(node);
  }

  // Run DFS from each unvisited node
  for (let i = 0; i < 12; i++) {
    if (!visited.has(i)) {
      dfs(i);
    }
  }

  return cycles;
}

/**
 * Calculate in-degree for each palace
 *
 * Counts incoming edges of a specific transformation type.
 *
 * @param graph - Palace graph
 * @param sihuaType - Transformation type to analyze
 * @returns Map of palace index to in-degree count
 */
export function calculateInDegree(
  graph: PalaceGraph,
  sihuaType: string
): Map<number, number> {
  const inDegree = new Map<number, number>();

  // Initialize all palaces with 0 in-degree
  for (let i = 0; i < 12; i++) {
    inDegree.set(i, 0);
  }

  // Count incoming edges
  graph.edges.forEach((edge) => {
    if (edge.sihuaType === sihuaType) {
      const current = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, current + 1);
    }
  });

  return inDegree;
}

/**
 * Calculate out-degree for each palace
 *
 * Counts outgoing edges of a specific transformation type.
 *
 * @param graph - Palace graph
 * @param sihuaType - Transformation type to analyze
 * @returns Map of palace index to out-degree count
 */
export function calculateOutDegree(
  graph: PalaceGraph,
  sihuaType: string
): Map<number, number> {
  const outDegree = new Map<number, number>();

  // Initialize all palaces with 0 out-degree
  for (let i = 0; i < 12; i++) {
    outDegree.set(i, 0);
  }

  // Count outgoing edges
  graph.edges.forEach((edge) => {
    if (edge.sihuaType === sihuaType && edge.source >= 0) {
      const current = outDegree.get(edge.source) || 0;
      outDegree.set(edge.source, current + 1);
    }
  });

  return outDegree;
}

/**
 * Identify stress convergence nodes (high in-degree Ji)
 *
 * Palaces with high incoming Ji (忌) transformations are stress points.
 *
 * @param graph - Palace graph
 * @returns Array of stress nodes, sorted by in-degree (descending)
 */
export function identifyStressNodes(graph: PalaceGraph): CentralityNode[] {
  const inDegree = calculateInDegree(graph, '忌');
  const nodes: CentralityNode[] = [];

  inDegree.forEach((degree, palace) => {
    if (degree > 0) {
      nodes.push({
        palace,
        palaceName: PALACE_NAMES[palace] || `宮${palace}`,
        inDegree: degree,
        outDegree: 0, // Not relevant for stress nodes
        sihuaType: '忌',
        severity: degree >= 3 ? 'high' : degree >= 2 ? 'medium' : 'low',
      });
    }
  });

  // Sort by in-degree descending
  return nodes.sort((a, b) => b.inDegree - a.inDegree);
}

/**
 * Identify resource source nodes (high out-degree Lu)
 *
 * Palaces with high outgoing Lu (祿) transformations are resource sources.
 *
 * @param graph - Palace graph
 * @returns Array of resource nodes, sorted by out-degree (descending)
 */
export function identifyResourceNodes(graph: PalaceGraph): CentralityNode[] {
  const outDegree = calculateOutDegree(graph, '祿');
  const nodes: CentralityNode[] = [];

  outDegree.forEach((degree, palace) => {
    if (degree > 0) {
      nodes.push({
        palace,
        palaceName: PALACE_NAMES[palace] || `宮${palace}`,
        inDegree: 0, // Not relevant for resource nodes
        outDegree: degree,
        sihuaType: '祿',
        severity: degree >= 3 ? 'high' : degree >= 2 ? 'medium' : 'low',
      });
    }
  });

  // Sort by out-degree descending
  return nodes.sort((a, b) => b.outDegree - a.outDegree);
}

/**
 * Identify power center nodes (high out-degree Quan)
 *
 * Palaces with high outgoing Quan (權) transformations are power centers.
 *
 * @param graph - Palace graph
 * @returns Array of power nodes, sorted by out-degree (descending)
 */
export function identifyPowerNodes(graph: PalaceGraph): CentralityNode[] {
  const outDegree = calculateOutDegree(graph, '權');
  const nodes: CentralityNode[] = [];

  outDegree.forEach((degree, palace) => {
    if (degree > 0) {
      nodes.push({
        palace,
        palaceName: PALACE_NAMES[palace] || `宮${palace}`,
        inDegree: 0,
        outDegree: degree,
        sihuaType: '權',
        severity: degree >= 3 ? 'high' : degree >= 2 ? 'medium' : 'low',
      });
    }
  });

  return nodes.sort((a, b) => b.outDegree - a.outDegree);
}

/**
 * Identify fame center nodes (high out-degree Ke)
 *
 * Palaces with high outgoing Ke (科) transformations are fame centers.
 *
 * @param graph - Palace graph
 * @returns Array of fame nodes, sorted by out-degree (descending)
 */
export function identifyFameNodes(graph: PalaceGraph): CentralityNode[] {
  const outDegree = calculateOutDegree(graph, '科');
  const nodes: CentralityNode[] = [];

  outDegree.forEach((degree, palace) => {
    if (degree > 0) {
      nodes.push({
        palace,
        palaceName: PALACE_NAMES[palace] || `宮${palace}`,
        inDegree: 0,
        outDegree: degree,
        sihuaType: '科',
        severity: degree >= 3 ? 'high' : degree >= 2 ? 'medium' : 'low',
      });
    }
  });

  return nodes.sort((a, b) => b.outDegree - a.outDegree);
}
