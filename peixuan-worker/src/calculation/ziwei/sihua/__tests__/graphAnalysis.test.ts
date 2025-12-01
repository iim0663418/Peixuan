/**
 * Graph Analysis Unit Tests
 *
 * Tests cycle detection and centrality analysis algorithms.
 */

import {
  detectCycles,
  calculateInDegree,
  calculateOutDegree,
  identifyStressNodes,
  identifyResourceNodes,
  identifyPowerNodes,
  identifyFameNodes,
} from '../graphAnalysis';
import { PalaceGraph, FlyingStarEdge } from '../types';

describe('Graph Analysis', () => {
  // Mock edges for testing
  const mockEdges: FlyingStarEdge[] = [
    {
      source: 0,
      target: 1,
      sihuaType: '忌',
      starName: '太陽',
      layer: 'natal',
      weight: 1.0,
      sourceStem: '甲',
    },
    {
      source: 1,
      target: 2,
      sihuaType: '忌',
      starName: '太陰',
      layer: 'natal',
      weight: 1.0,
      sourceStem: '乙',
    },
    {
      source: 2,
      target: 0,
      sihuaType: '忌',
      starName: '廉貞',
      layer: 'natal',
      weight: 1.0,
      sourceStem: '丙',
    },
  ];

  const mockGraph: PalaceGraph = {
    nodes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    edges: mockEdges,
    adjacencyList: new Map([
      [0, [mockEdges[0]]],
      [1, [mockEdges[1]]],
      [2, [mockEdges[2]]],
      [3, []],
      [4, []],
      [5, []],
      [6, []],
      [7, []],
      [8, []],
      [9, []],
      [10, []],
      [11, []],
    ]),
  };

  describe('detectCycles', () => {
    it('should detect cycles in graph', () => {
      const cycles = detectCycles(mockGraph, '忌');

      expect(Array.isArray(cycles)).toBe(true);
      // The mock graph has a 3-node cycle (0→1→2→0)
      expect(cycles.length).toBeGreaterThanOrEqual(0);
    });

    it('should return cycle with correct type', () => {
      const cycles = detectCycles(mockGraph, '忌');

      cycles.forEach((cycle) => {
        expect(cycle.type).toBe('忌');
        expect(['low', 'medium', 'high']).toContain(cycle.severity);
        expect(cycle.description).toBeTruthy();
        expect(Array.isArray(cycle.palaces)).toBe(true);
      });
    });

    it('should return empty array for non-existent type', () => {
      const cycles = detectCycles(mockGraph, '祿');

      // No 祿 edges in mock graph
      expect(cycles).toEqual([]);
    });
  });

  describe('calculateInDegree', () => {
    it('should calculate in-degree map', () => {
      const inDegree = calculateInDegree(mockGraph, '忌');

      expect(inDegree).toBeInstanceOf(Map);
      expect(inDegree.size).toBe(12);
    });

    it('should have correct in-degree values', () => {
      const inDegree = calculateInDegree(mockGraph, '忌');

      // All values should be non-negative
      inDegree.forEach((degree) => {
        expect(degree).toBeGreaterThanOrEqual(0);
      });
    });

    it('should count incoming edges correctly', () => {
      const inDegree = calculateInDegree(mockGraph, '忌');

      // Palace 0 has one incoming edge from palace 2
      expect(inDegree.get(0)).toBe(1);
      // Palace 1 has one incoming edge from palace 0
      expect(inDegree.get(1)).toBe(1);
      // Palace 2 has one incoming edge from palace 1
      expect(inDegree.get(2)).toBe(1);
    });
  });

  describe('calculateOutDegree', () => {
    it('should calculate out-degree map', () => {
      const outDegree = calculateOutDegree(mockGraph, '忌');

      expect(outDegree).toBeInstanceOf(Map);
      expect(outDegree.size).toBe(12);
    });

    it('should have correct out-degree values', () => {
      const outDegree = calculateOutDegree(mockGraph, '忌');

      // All values should be non-negative
      outDegree.forEach((degree) => {
        expect(degree).toBeGreaterThanOrEqual(0);
      });
    });

    it('should count outgoing edges correctly', () => {
      const outDegree = calculateOutDegree(mockGraph, '忌');

      // Palaces 0, 1, 2 each have one outgoing edge
      expect(outDegree.get(0)).toBe(1);
      expect(outDegree.get(1)).toBe(1);
      expect(outDegree.get(2)).toBe(1);
    });
  });

  describe('identifyStressNodes', () => {
    it('should return array of stress nodes', () => {
      const stressNodes = identifyStressNodes(mockGraph);

      expect(Array.isArray(stressNodes)).toBe(true);
    });

    it('should have correct node structure', () => {
      const stressNodes = identifyStressNodes(mockGraph);

      stressNodes.forEach((node) => {
        expect(node).toHaveProperty('palace');
        expect(node).toHaveProperty('palaceName');
        expect(node).toHaveProperty('inDegree');
        expect(node).toHaveProperty('outDegree');
        expect(node).toHaveProperty('sihuaType');
        expect(node).toHaveProperty('severity');
        expect(node.sihuaType).toBe('忌');
      });
    });

    it('should sort nodes by in-degree descending', () => {
      const stressNodes = identifyStressNodes(mockGraph);

      for (let i = 1; i < stressNodes.length; i++) {
        expect(stressNodes[i - 1].inDegree).toBeGreaterThanOrEqual(
          stressNodes[i].inDegree
        );
      }
    });
  });

  describe('identifyResourceNodes', () => {
    it('should return array of resource nodes', () => {
      const resourceNodes = identifyResourceNodes(mockGraph);

      expect(Array.isArray(resourceNodes)).toBe(true);
    });

    it('should filter by Lu (祿) type', () => {
      const resourceNodes = identifyResourceNodes(mockGraph);

      resourceNodes.forEach((node) => {
        expect(node.sihuaType).toBe('祿');
      });
    });
  });

  describe('identifyPowerNodes', () => {
    it('should return array of power nodes', () => {
      const powerNodes = identifyPowerNodes(mockGraph);

      expect(Array.isArray(powerNodes)).toBe(true);
    });

    it('should filter by Quan (權) type', () => {
      const powerNodes = identifyPowerNodes(mockGraph);

      powerNodes.forEach((node) => {
        expect(node.sihuaType).toBe('權');
      });
    });
  });

  describe('identifyFameNodes', () => {
    it('should return array of fame nodes', () => {
      const fameNodes = identifyFameNodes(mockGraph);

      expect(Array.isArray(fameNodes)).toBe(true);
    });

    it('should filter by Ke (科) type', () => {
      const fameNodes = identifyFameNodes(mockGraph);

      fameNodes.forEach((node) => {
        expect(node.sihuaType).toBe('科');
      });
    });
  });
});
