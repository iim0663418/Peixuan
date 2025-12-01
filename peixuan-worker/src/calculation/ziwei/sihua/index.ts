/**
 * SiHua Flying Stars Module
 *
 * Main entry point for SiHua (四化) flying stars graph analysis.
 * Exports all public APIs for integration.
 */

// Types
export type {
  FlyingStarEdge,
  PalaceGraph,
  SiHuaCycle,
  CentralityNode,
  SiHuaAggregation,
} from './types';

// Edge Generation
export {
  generateNatalEdges,
  generateDecadeEdges,
  generateAnnualEdges,
  buildPalaceGraph,
} from './edgeGenerator';

// Graph Analysis
export {
  detectCycles,
  calculateInDegree,
  calculateOutDegree,
  identifyStressNodes,
  identifyResourceNodes,
  identifyPowerNodes,
  identifyFameNodes,
} from './graphAnalysis';

// Main Aggregator
export { aggregateSiHua } from './aggregator';
