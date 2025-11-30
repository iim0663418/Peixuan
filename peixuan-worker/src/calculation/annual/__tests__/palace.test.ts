/**
 * Annual Palace Calculation Tests
 *
 * Comprehensive test suite for annual palace positioning and rotation
 * Reference: doc/八字命理後端模組研究.md §4.2
 */

import { describe, it, expect } from 'vitest';
import {
  locateAnnualLifePalace,
  rotateAnnualPalaces,
  createPalaceArray,
  Palace
} from '../palace';

describe('Annual Palace Calculations', () => {
  // Helper to create test palace array
  const createTestPalaces = (startBranch: string): Palace[] => {
    return createPalaceArray(startBranch);
  };

  describe('locateAnnualLifePalace - 12 Branches Location Tests', () => {
    it('should locate 子 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('子', palaces);
      expect(result).toBe(0);
    });

    it('should locate 丑 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('丑', palaces);
      expect(result).toBe(1);
    });

    it('should locate 寅 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('寅', palaces);
      expect(result).toBe(2);
    });

    it('should locate 卯 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('卯', palaces);
      expect(result).toBe(3);
    });

    it('should locate 辰 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('辰', palaces);
      expect(result).toBe(4);
    });

    it('should locate 巳 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('巳', palaces);
      expect(result).toBe(5);
    });

    it('should locate 午 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('午', palaces);
      expect(result).toBe(6);
    });

    it('should locate 未 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('未', palaces);
      expect(result).toBe(7);
    });

    it('should locate 申 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('申', palaces);
      expect(result).toBe(8);
    });

    it('should locate 酉 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('酉', palaces);
      expect(result).toBe(9);
    });

    it('should locate 戌 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('戌', palaces);
      expect(result).toBe(10);
    });

    it('should locate 亥 branch at correct position', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('亥', palaces);
      expect(result).toBe(11);
    });

    it('should locate branch in offset palace array', () => {
      // Palace array starting from 寅
      const palaces = createTestPalaces('寅');
      // Looking for 子, which should be at position 10
      const result = locateAnnualLifePalace('子', palaces);
      expect(result).toBe(10);
    });

    it('should locate branch in another offset palace array', () => {
      // Palace array starting from 午
      const palaces = createTestPalaces('午');
      // Looking for 寅, which should be at position 8
      const result = locateAnnualLifePalace('寅', palaces);
      expect(result).toBe(8);
    });
  });

  describe('locateAnnualLifePalace - Edge Cases', () => {
    it('should return -1 for invalid branch (empty string)', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('', palaces);
      expect(result).toBe(-1);
    });

    it('should return -1 for invalid branch (unknown character)', () => {
      const palaces = createTestPalaces('子');
      const result = locateAnnualLifePalace('甲', palaces);
      expect(result).toBe(-1);
    });

    it('should return -1 for null palaces array', () => {
      const result = locateAnnualLifePalace('子', null as any);
      expect(result).toBe(-1);
    });

    it('should return -1 for undefined palaces array', () => {
      const result = locateAnnualLifePalace('子', undefined as any);
      expect(result).toBe(-1);
    });

    it('should return -1 for empty palaces array', () => {
      const result = locateAnnualLifePalace('子', []);
      expect(result).toBe(-1);
    });

    it('should return -1 for palaces array with wrong length', () => {
      const palaces = createTestPalaces('子').slice(0, 10);
      const result = locateAnnualLifePalace('子', palaces);
      expect(result).toBe(-1);
    });

    it('should return -1 when branch not found in palaces', () => {
      // Create a malformed palace array (all same branch)
      const palaces: Palace[] = Array(12).fill(null).map((_, i) => ({
        position: i,
        branch: '子'
      }));
      const result = locateAnnualLifePalace('寅', palaces);
      expect(result).toBe(-1);
    });
  });

  describe('rotateAnnualPalaces - Palace Rotation Tests', () => {
    it('should not rotate when annual life palace is at index 0', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, 0);

      expect(result).toHaveLength(12);
      expect(result[0].meaning).toBe('命宮');
      expect(result[1].meaning).toBe('兄弟宮');
      expect(result[2].meaning).toBe('夫妻宮');
      expect(result[11].meaning).toBe('父母宮');
    });

    it('should rotate correctly when annual life palace is at index 3', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, 3);

      expect(result).toHaveLength(12);
      // Index 3 should become 命宮
      expect(result[3].meaning).toBe('命宮');
      expect(result[3].branch).toBe('卯');
      // Index 4 should become 兄弟宮
      expect(result[4].meaning).toBe('兄弟宮');
      expect(result[4].branch).toBe('辰');
      // Index 2 should become 父母宮 (wraps around)
      expect(result[2].meaning).toBe('父母宮');
      expect(result[2].branch).toBe('寅');
    });

    it('should rotate correctly when annual life palace is at index 6', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, 6);

      expect(result).toHaveLength(12);
      expect(result[6].meaning).toBe('命宮');
      expect(result[6].branch).toBe('午');
      expect(result[7].meaning).toBe('兄弟宮');
      expect(result[5].meaning).toBe('父母宮');
    });

    it('should rotate correctly when annual life palace is at index 11', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, 11);

      expect(result).toHaveLength(12);
      expect(result[11].meaning).toBe('命宮');
      expect(result[11].branch).toBe('亥');
      expect(result[0].meaning).toBe('兄弟宮');
      expect(result[10].meaning).toBe('父母宮');
    });

    it('should preserve palace branches during rotation', () => {
      const palaces = createTestPalaces('寅');
      const result = rotateAnnualPalaces(palaces, 4);

      // Branches should remain unchanged
      expect(result[0].branch).toBe('寅');
      expect(result[4].branch).toBe('午');
      expect(result[11].branch).toBe('丑');

      // Only meanings should change
      expect(result[4].meaning).toBe('命宮');
    });

    it('should handle complete rotation cycle', () => {
      const palaces = createTestPalaces('子');

      // Test rotation at each position
      for (let i = 0; i < 12; i++) {
        const result = rotateAnnualPalaces(palaces, i);
        expect(result[i].meaning).toBe('命宮');
        expect(result[(i + 1) % 12].meaning).toBe('兄弟宮');
        expect(result[(i + 2) % 12].meaning).toBe('夫妻宮');
      }
    });
  });

  describe('rotateAnnualPalaces - Edge Cases', () => {
    it('should return empty array for null palaces', () => {
      const result = rotateAnnualPalaces(null as any, 0);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined palaces', () => {
      const result = rotateAnnualPalaces(undefined as any, 0);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty palaces array', () => {
      const result = rotateAnnualPalaces([], 0);
      expect(result).toEqual([]);
    });

    it('should return empty array for palaces with wrong length', () => {
      const palaces = createTestPalaces('子').slice(0, 10);
      const result = rotateAnnualPalaces(palaces, 0);
      expect(result).toEqual([]);
    });

    it('should return empty array for negative index', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, -1);
      expect(result).toEqual([]);
    });

    it('should return empty array for index > 11', () => {
      const palaces = createTestPalaces('子');
      const result = rotateAnnualPalaces(palaces, 12);
      expect(result).toEqual([]);
    });
  });

  describe('createPalaceArray - Helper Function Tests', () => {
    it('should create palace array starting from 子', () => {
      const result = createPalaceArray('子');
      expect(result).toHaveLength(12);
      expect(result[0].branch).toBe('子');
      expect(result[1].branch).toBe('丑');
      expect(result[11].branch).toBe('亥');
    });

    it('should create palace array starting from 寅', () => {
      const result = createPalaceArray('寅');
      expect(result).toHaveLength(12);
      expect(result[0].branch).toBe('寅');
      expect(result[1].branch).toBe('卯');
      expect(result[10].branch).toBe('子');
      expect(result[11].branch).toBe('丑');
    });

    it('should create palace array starting from 午', () => {
      const result = createPalaceArray('午');
      expect(result).toHaveLength(12);
      expect(result[0].branch).toBe('午');
      expect(result[6].branch).toBe('子');
    });

    it('should return empty array for invalid branch', () => {
      const result = createPalaceArray('甲');
      expect(result).toEqual([]);
    });

    it('should set correct position indices', () => {
      const result = createPalaceArray('子');
      result.forEach((palace, index) => {
        expect(palace.position).toBe(index);
      });
    });
  });

  describe('Integration Tests - Real-world Scenarios', () => {
    it('should handle 壬寅 year (2022) annual palace calculation', () => {
      // Create a ZiWei palace array where 寅 is at position 5
      const palaces = createTestPalaces('酉'); // Starting from 酉: 酉戌亥子丑寅卯...
      // 寅 should be at position 5

      // Locate annual life palace for 壬寅 year
      const annualIndex = locateAnnualLifePalace('寅', palaces);
      expect(annualIndex).toBe(5);

      // Rotate palaces
      const rotated = rotateAnnualPalaces(palaces, annualIndex);
      expect(rotated[5].meaning).toBe('命宮');
      expect(rotated[5].branch).toBe('寅');
      expect(rotated[6].meaning).toBe('兄弟宮');
    });

    it('should handle 癸卯 year (2023) annual palace calculation', () => {
      const palaces = createTestPalaces('子');
      const annualIndex = locateAnnualLifePalace('卯', palaces);
      expect(annualIndex).toBe(3);

      const rotated = rotateAnnualPalaces(palaces, annualIndex);
      expect(rotated[3].meaning).toBe('命宮');
      expect(rotated[3].branch).toBe('卯');
    });

    it('should handle complete workflow: locate then rotate', () => {
      const palaces = createTestPalaces('寅');
      const annualBranch = '子';

      // Step 1: Locate annual life palace
      const index = locateAnnualLifePalace(annualBranch, palaces);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(12);

      // Step 2: Rotate palaces
      const rotated = rotateAnnualPalaces(palaces, index);
      expect(rotated).toHaveLength(12);
      expect(rotated[index].meaning).toBe('命宮');
      expect(rotated[index].branch).toBe(annualBranch);

      // Step 3: Verify all positions have meanings
      rotated.forEach(palace => {
        expect(palace.meaning).toBeDefined();
        expect(palace.branch).toBeDefined();
        expect(palace.position).toBeGreaterThanOrEqual(0);
        expect(palace.position).toBeLessThan(12);
      });
    });
  });
});
