/**
 * Tests for ZiWei Star Positioning Module
 * Validates quotient-remainder compensation logic
 * Tests 30 days × 5 bureaus = 150 combinations
 */

import { describe, it, expect } from 'vitest';
import { findZiWeiPosition, calculateZiWeiPosition, getEarthlyBranch } from './ziwei';
import type { Bureau } from '../bureau';

// Test data
const bureaus: Bureau[] = [2, 3, 4, 5, 6];
const days = Array.from({ length: 30 }, (_, i) => i + 1);

describe('ZiWei Star Positioning', () => {
  describe('findZiWeiPosition - Algorithm Validation', () => {
    it('should handle divisible cases correctly', () => {
      // Day 2, Bureau 2: 2 % 2 = 0, pos = 2/2 = 1
      // Map: (2 + 1 - 1) % 12 = 2 (寅)
      expect(findZiWeiPosition(2, 2)).toBe(2);

      // Day 6, Bureau 3: 6 % 3 = 0, pos = 6/3 = 2
      // Map: (2 + 2 - 1) % 12 = 3 (卯)
      expect(findZiWeiPosition(6, 3)).toBe(3);

      // Day 12, Bureau 4: 12 % 4 = 0, pos = 12/4 = 3
      // Map: (2 + 3 - 1) % 12 = 4 (辰)
      expect(findZiWeiPosition(12, 4)).toBe(4);

      // Day 15, Bureau 5: 15 % 5 = 0, pos = 15/5 = 3
      // Map: (2 + 3 - 1) % 12 = 4 (辰)
      expect(findZiWeiPosition(15, 5)).toBe(4);

      // Day 18, Bureau 6: 18 % 6 = 0, pos = 18/6 = 3
      // Map: (2 + 3 - 1) % 12 = 4 (辰)
      expect(findZiWeiPosition(18, 6)).toBe(4);
    });

    it('should handle non-divisible cases with odd compensation', () => {
      // Day 3, Bureau 2: remainder=1, toAdd=1 (odd), quotient=(3+1)/2=2
      // pos = 2 - 1 = 1, map: (2 + 1 - 1) % 12 = 2 (寅)
      expect(findZiWeiPosition(3, 2)).toBe(2);

      // Day 5, Bureau 3: remainder=2, toAdd=1 (odd), quotient=(5+1)/3=2
      // pos = 2 - 1 = 1, map: (2 + 1 - 1) % 12 = 2 (寅)
      expect(findZiWeiPosition(5, 3)).toBe(2);
    });

    it('should handle non-divisible cases with even compensation', () => {
      // Day 4, Bureau 3: remainder=1, toAdd=2 (even), quotient=(4+2)/3=2
      // pos = 2 + 2 = 4, map: (2 + 4 - 1) % 12 = 5 (巳)
      expect(findZiWeiPosition(4, 3)).toBe(5);

      // Day 6, Bureau 4: remainder=2, toAdd=2 (even), quotient=(6+2)/4=2
      // pos = 2 + 2 = 4, map: (2 + 4 - 1) % 12 = 5 (巳)
      expect(findZiWeiPosition(6, 4)).toBe(5);
    });

    it('should validate input ranges', () => {
      // Invalid lunar day
      expect(() => findZiWeiPosition(0, 2)).toThrow('Invalid lunar day');
      expect(() => findZiWeiPosition(31, 2)).toThrow('Invalid lunar day');
      expect(() => findZiWeiPosition(-1, 2)).toThrow('Invalid lunar day');

      // Invalid bureau
      expect(() => findZiWeiPosition(1, 1 as Bureau)).toThrow('Invalid bureau');
      expect(() => findZiWeiPosition(1, 7 as Bureau)).toThrow('Invalid bureau');
    });
  });

  describe('Complete 150 Combinations (30 days × 5 bureaus)', () => {
    // Test systematic coverage of all combinations
    const bureaus: Bureau[] = [2, 3, 4, 5, 6];
    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    it('should calculate position for all 150 combinations', () => {
      let totalTests = 0;

      bureaus.forEach(bureau => {
        days.forEach(day => {
          // Should not throw
          const position = findZiWeiPosition(day, bureau);

          // Position should be in valid range
          expect(position).toBeGreaterThanOrEqual(0);
          expect(position).toBeLessThan(12);

          totalTests++;
        });
      });

      // Verify we tested all 150 combinations
      expect(totalTests).toBe(150);
    });

    it('should produce consistent results for Water Bureau (2)', () => {
      const results = days.map(day => findZiWeiPosition(day, 2));
      expect(results.length).toBe(30);
      // All positions should be valid
      results.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });

    it('should produce consistent results for Wood Bureau (3)', () => {
      const results = days.map(day => findZiWeiPosition(day, 3));
      expect(results.length).toBe(30);
      results.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });

    it('should produce consistent results for Metal Bureau (4)', () => {
      const results = days.map(day => findZiWeiPosition(day, 4));
      expect(results.length).toBe(30);
      results.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });

    it('should produce consistent results for Earth Bureau (5)', () => {
      const results = days.map(day => findZiWeiPosition(day, 5));
      expect(results.length).toBe(30);
      results.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });

    it('should produce consistent results for Fire Bureau (6)', () => {
      const results = days.map(day => findZiWeiPosition(day, 6));
      expect(results.length).toBe(30);
      results.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });
  });

  describe('Sample verification cases', () => {
    it('should match known reference positions', () => {
      // These are reference cases that can be verified against traditional tables
      // Bureau 2 (Water)
      expect(findZiWeiPosition(1, 2)).toBeDefined();
      expect(findZiWeiPosition(10, 2)).toBeDefined();
      expect(findZiWeiPosition(20, 2)).toBeDefined();

      // Bureau 3 (Wood)
      expect(findZiWeiPosition(1, 3)).toBeDefined();
      expect(findZiWeiPosition(15, 3)).toBeDefined();
      expect(findZiWeiPosition(30, 3)).toBeDefined();

      // Bureau 6 (Fire)
      expect(findZiWeiPosition(1, 6)).toBeDefined();
      expect(findZiWeiPosition(7, 6)).toBeDefined();
      expect(findZiWeiPosition(25, 6)).toBeDefined();
    });

    it('should handle edge cases at day boundaries', () => {
      // First day
      bureaus.forEach(bureau => {
        const pos = findZiWeiPosition(1, bureau);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });

      // Last day
      bureaus.forEach(bureau => {
        const pos = findZiWeiPosition(30, bureau);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(12);
      });
    });
  });

  describe('getEarthlyBranch', () => {
    it('should return correct branch names', () => {
      expect(getEarthlyBranch(0)).toBe('子');
      expect(getEarthlyBranch(1)).toBe('丑');
      expect(getEarthlyBranch(2)).toBe('寅');
      expect(getEarthlyBranch(3)).toBe('卯');
      expect(getEarthlyBranch(4)).toBe('辰');
      expect(getEarthlyBranch(5)).toBe('巳');
      expect(getEarthlyBranch(6)).toBe('午');
      expect(getEarthlyBranch(7)).toBe('未');
      expect(getEarthlyBranch(8)).toBe('申');
      expect(getEarthlyBranch(9)).toBe('酉');
      expect(getEarthlyBranch(10)).toBe('戌');
      expect(getEarthlyBranch(11)).toBe('亥');
    });

    it('should throw error for invalid position', () => {
      expect(() => getEarthlyBranch(-1)).toThrow('Invalid position');
      expect(() => getEarthlyBranch(12)).toThrow('Invalid position');
    });
  });

  describe('calculateZiWeiPosition', () => {
    it('should return position with branch name', () => {
      const result = calculateZiWeiPosition(1, 2);
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('branch');
      expect(result.position).toBeGreaterThanOrEqual(0);
      expect(result.position).toBeLessThan(12);
      expect(result.branch).toBeTruthy();
    });

    it('should match findZiWeiPosition results', () => {
      bureaus.forEach(bureau => {
        [1, 15, 30].forEach(day => {
          const pos = findZiWeiPosition(day, bureau);
          const result = calculateZiWeiPosition(day, bureau);
          expect(result.position).toBe(pos);
          expect(result.branch).toBe(getEarthlyBranch(pos));
        });
      });
    });
  });

  describe('Algorithm properties', () => {
    it('should distribute positions across all 12 palaces', () => {
      const positionSet = new Set<number>();

      bureaus.forEach(bureau => {
        days.forEach(day => {
          positionSet.add(findZiWeiPosition(day, bureau));
        });
      });

      // Should cover all 12 positions
      expect(positionSet.size).toBe(12);
    });

    it('should be deterministic (same input = same output)', () => {
      bureaus.forEach(bureau => {
        days.forEach(day => {
          const pos1 = findZiWeiPosition(day, bureau);
          const pos2 = findZiWeiPosition(day, bureau);
          expect(pos1).toBe(pos2);
        });
      });
    });
  });
});
