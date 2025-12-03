/**
 * SiHua Aggregator Unit Tests
 *
 * Tests the complete SiHua aggregation functionality.
 */

import { aggregateSiHua } from '../aggregator';
import type { Palace } from '../../../annual/palace';

describe('SiHua Aggregator', () => {
  // Mock palace data for testing
  const mockPalaces: Palace[] = Array.from({ length: 12 }, (_, i) => ({
    position: i,
    branch: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i],
  }));

  describe('aggregateSiHua', () => {
    it('should return valid aggregation structure', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('jiCycles');
      expect(result).toHaveProperty('luCycles');
      expect(result).toHaveProperty('quanCycles');
      expect(result).toHaveProperty('keCycles');
      expect(result).toHaveProperty('stressNodes');
      expect(result).toHaveProperty('resourceNodes');
      expect(result).toHaveProperty('powerNodes');
      expect(result).toHaveProperty('fameNodes');
      expect(result).toHaveProperty('totalEdges');
      expect(result).toHaveProperty('edgesByType');
      expect(result).toHaveProperty('edgesByLayer');
      expect(result).toHaveProperty('hasJiCycle');
      expect(result).toHaveProperty('hasLuCycle');
      expect(result).toHaveProperty('maxStressPalace');
      expect(result).toHaveProperty('maxResourcePalace');
    });

    it('should generate correct edge statistics', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(result.totalEdges).toBeGreaterThanOrEqual(0);
      expect(result.edgesByType).toHaveProperty('祿');
      expect(result.edgesByType).toHaveProperty('權');
      expect(result.edgesByType).toHaveProperty('科');
      expect(result.edgesByType).toHaveProperty('忌');
      expect(result.edgesByLayer).toHaveProperty('natal');
      expect(result.edgesByLayer).toHaveProperty('decade');
      expect(result.edgesByLayer).toHaveProperty('annual');
    });

    it('should handle natal only (no decade/annual)', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(result.edgesByLayer.natal).toBeGreaterThanOrEqual(0);
      expect(result.edgesByLayer.decade).toBe(0);
      expect(result.edgesByLayer.annual).toBe(0);
    });

    it('should handle natal + decade', () => {
      const result = aggregateSiHua(mockPalaces, '甲', '乙');

      expect(result.edgesByLayer.natal).toBeGreaterThanOrEqual(0);
      expect(result.edgesByLayer.decade).toBeGreaterThanOrEqual(0);
      expect(result.edgesByLayer.annual).toBe(0);
    });

    it('should handle all layers (natal + decade + annual)', () => {
      const result = aggregateSiHua(mockPalaces, '甲', '乙', '丙');

      expect(result.edgesByLayer.natal).toBeGreaterThanOrEqual(0);
      expect(result.edgesByLayer.decade).toBeGreaterThanOrEqual(0);
      expect(result.edgesByLayer.annual).toBeGreaterThanOrEqual(0);
    });

    it('should return boolean cycle indicators', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(typeof result.hasJiCycle).toBe('boolean');
      expect(typeof result.hasLuCycle).toBe('boolean');
    });

    it('should return valid palace indices for max stress/resource', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      // maxStressPalace and maxResourcePalace should be -1 or 0-11
      expect(result.maxStressPalace).toBeGreaterThanOrEqual(-1);
      expect(result.maxStressPalace).toBeLessThan(12);
      expect(result.maxResourcePalace).toBeGreaterThanOrEqual(-1);
      expect(result.maxResourcePalace).toBeLessThan(12);
    });

    it('should return arrays for cycle results', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(Array.isArray(result.jiCycles)).toBe(true);
      expect(Array.isArray(result.luCycles)).toBe(true);
      expect(Array.isArray(result.quanCycles)).toBe(true);
      expect(Array.isArray(result.keCycles)).toBe(true);
    });

    it('should return arrays for centrality nodes', () => {
      const result = aggregateSiHua(mockPalaces, '甲');

      expect(Array.isArray(result.stressNodes)).toBe(true);
      expect(Array.isArray(result.resourceNodes)).toBe(true);
      expect(Array.isArray(result.powerNodes)).toBe(true);
      expect(Array.isArray(result.fameNodes)).toBe(true);
    });

    it('should handle different heavenly stems', () => {
      const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

      stems.forEach((stem) => {
        const result = aggregateSiHua(mockPalaces, stem);
        expect(result).toBeDefined();
        expect(result.totalEdges).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
