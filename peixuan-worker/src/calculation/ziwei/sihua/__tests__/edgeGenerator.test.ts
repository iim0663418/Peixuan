/**
 * Edge Generator Unit Tests
 *
 * Tests the flying star edge generation functions.
 */

import {
  generateNatalEdges,
  generateDecadeEdges,
  generateAnnualEdges,
  buildPalaceGraph,
} from '../edgeGenerator';
import { Palace } from '../../../annual/palace';

describe('Edge Generator', () => {
  // Mock palace data
  const mockPalaces: Palace[] = Array.from({ length: 12 }, (_, i) => ({
    position: i,
    branch: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i],
  }));

  describe('generateNatalEdges', () => {
    it('should generate edges array', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');

      expect(Array.isArray(edges)).toBe(true);
    });

    it('should return empty array for invalid input', () => {
      const edges = generateNatalEdges([], '甲');
      expect(edges).toEqual([]);
    });

    it('should create edges with correct layer and weight', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');

      edges.forEach((edge) => {
        expect(edge.layer).toBe('natal');
        expect(edge.weight).toBe(1.0);
      });
    });

    it('should create edges with valid sihuaType', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');

      edges.forEach((edge) => {
        expect(['祿', '權', '科', '忌']).toContain(edge.sihuaType);
      });
    });

    it('should create edges with valid palace indices', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');

      edges.forEach((edge) => {
        expect(edge.source).toBeGreaterThanOrEqual(0);
        expect(edge.source).toBeLessThan(12);
        expect(edge.target).toBeGreaterThanOrEqual(0);
        expect(edge.target).toBeLessThan(12);
      });
    });
  });

  describe('generateDecadeEdges', () => {
    it('should generate edges array', () => {
      const edges = generateDecadeEdges(mockPalaces, '乙');

      expect(Array.isArray(edges)).toBe(true);
    });

    it('should create edges with decade layer and weight 0.7', () => {
      const edges = generateDecadeEdges(mockPalaces, '乙');

      edges.forEach((edge) => {
        expect(edge.layer).toBe('decade');
        expect(edge.weight).toBe(0.7);
      });
    });

    it('should return empty array for undefined stem', () => {
      const edges = generateDecadeEdges(mockPalaces, '');
      expect(edges).toEqual([]);
    });
  });

  describe('generateAnnualEdges', () => {
    it('should generate edges array', () => {
      const edges = generateAnnualEdges(mockPalaces, '丙');

      expect(Array.isArray(edges)).toBe(true);
    });

    it('should create edges with annual layer and weight 0.5', () => {
      const edges = generateAnnualEdges(mockPalaces, '丙');

      edges.forEach((edge) => {
        expect(edge.layer).toBe('annual');
        expect(edge.weight).toBe(0.5);
      });
    });

    it('should return empty array for invalid palaces', () => {
      const edges = generateAnnualEdges([], '丙');
      expect(edges).toEqual([]);
    });
  });

  describe('buildPalaceGraph', () => {
    it('should build graph with 12 nodes', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');
      const graph = buildPalaceGraph(edges);

      expect(graph.nodes).toHaveLength(12);
      expect(graph.nodes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should preserve all edges', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');
      const graph = buildPalaceGraph(edges);

      expect(graph.edges).toEqual(edges);
    });

    it('should create adjacency list map', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');
      const graph = buildPalaceGraph(edges);

      expect(graph.adjacencyList).toBeInstanceOf(Map);
      expect(graph.adjacencyList.size).toBe(12);
    });

    it('should handle empty edges array', () => {
      const graph = buildPalaceGraph([]);

      expect(graph.nodes).toHaveLength(12);
      expect(graph.edges).toEqual([]);
      expect(graph.adjacencyList.size).toBe(12);
    });

    it('should correctly populate adjacency list', () => {
      const edges = generateNatalEdges(mockPalaces, '甲');
      const graph = buildPalaceGraph(edges);

      // Each valid source should have edges in adjacency list
      graph.adjacencyList.forEach((edgeList, palace) => {
        expect(palace).toBeGreaterThanOrEqual(0);
        expect(palace).toBeLessThan(12);
        expect(Array.isArray(edgeList)).toBe(true);
      });
    });
  });
});
