/**
 * SiHua (四化) Flying Stars Type Definitions
 *
 * Defines core data structures for graph-based SiHua analysis.
 * Reference: doc/SIHUA_IMPLEMENTATION_PLAN.md §2
 */

/**
 * Flying Star Edge
 *
 * Represents a directed edge in the SiHua palace graph.
 * Edge flows from source palace to target palace through a transformation.
 */
export interface FlyingStarEdge {
  /** Source palace index (0-11) */
  source: number;

  /** Target palace index (0-11) */
  target: number;

  /** Transformation type */
  sihuaType: '祿' | '權' | '科' | '忌';

  /** Star name that triggers the transformation */
  starName: string;

  /** Transformation layer (natal/decade/annual) */
  layer: 'natal' | 'decade' | 'annual';

  /** Edge weight based on layer importance */
  weight: number;

  /** Source heavenly stem that triggers transformation */
  sourceStem: string;
}

/**
 * Palace Graph
 *
 * Graph structure representing palace connections through SiHua transformations.
 */
export interface PalaceGraph {
  /** Palace node indices (0-11) */
  nodes: number[];

  /** All flying star edges */
  edges: FlyingStarEdge[];

  /** Adjacency list for efficient graph traversal */
  adjacencyList: Map<number, FlyingStarEdge[]>;
}

/**
 * SiHua Cycle
 *
 * Represents a detected cycle in the SiHua graph (karmic loop).
 */
export interface SiHuaCycle {
  /** Palace indices forming the cycle */
  palaces: number[];

  /** Transformation type of the cycle */
  type: '祿' | '權' | '科' | '忌';

  /** Cycle severity level */
  severity: 'low' | 'medium' | 'high';

  /** Human-readable cycle description */
  description: string;
}

/**
 * Centrality Node
 *
 * Represents a palace's centrality in the SiHua graph.
 */
export interface CentralityNode {
  /** Palace index (0-11) */
  palace: number;

  /** Palace name (e.g., "命宮", "財帛宮") */
  palaceName: string;

  /** In-degree (number of incoming edges) */
  inDegree: number;

  /** Out-degree (number of outgoing edges) */
  outDegree: number;

  /** Associated transformation type */
  sihuaType: '祿' | '權' | '科' | '忌';

  /** Centrality severity/importance */
  severity: 'low' | 'medium' | 'high';
}

/**
 * SiHua Aggregation Result
 *
 * Top-level aggregated analysis of SiHua flying stars.
 */
export interface SiHuaAggregation {
  // Raw Data
  /** All flying star edges (natal + decade + annual) */
  edges: FlyingStarEdge[];

  // Cycle Detection
  /** Ji (忌) cycles - karmic loops */
  jiCycles: SiHuaCycle[];

  /** Lu (祿) cycles - resource loops */
  luCycles: SiHuaCycle[];

  /** Quan (權) cycles - power loops */
  quanCycles: SiHuaCycle[];

  /** Ke (科) cycles - fame loops */
  keCycles: SiHuaCycle[];

  // Centrality Analysis
  /** Stress convergence nodes (high in-degree Ji) */
  stressNodes: CentralityNode[];

  /** Resource source nodes (high out-degree Lu) */
  resourceNodes: CentralityNode[];

  /** Power center nodes (high out-degree Quan) */
  powerNodes: CentralityNode[];

  /** Fame center nodes (high out-degree Ke) */
  fameNodes: CentralityNode[];

  // Graph Statistics
  /** Total number of edges */
  totalEdges: number;

  /** Edge count by transformation type */
  edgesByType: Record<string, number>;

  /** Edge count by layer */
  edgesByLayer: Record<string, number>;

  // Structural Features
  /** Whether Ji cycles exist */
  hasJiCycle: boolean;

  /** Whether Lu cycles exist */
  hasLuCycle: boolean;

  /** Palace with maximum stress (highest Ji in-degree) */
  maxStressPalace: number;

  /** Palace with maximum resources (highest Lu out-degree) */
  maxResourcePalace: number;
}
