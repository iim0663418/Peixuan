/**
 * TianFu Star Positioning Module Tests
 * Comprehensive test coverage for symmetry logic
 */

import { describe, it, expect } from 'vitest';
import {
  findTianFuPosition,
  calculateTianFuPosition,
  getEarthlyBranch
} from './tianfu';

describe('TianFu Star Positioning', () => {
  describe('findTianFuPosition', () => {
    it('should calculate TianFu position opposite to ZiWei', () => {
      // Test symmetry relationship
      // ZiWei at 寅 (2) -> TianFu at 申 (8)
      expect(findTianFuPosition(2)).toBe(8);

      // ZiWei at 申 (8) -> TianFu at 寅 (2)
      expect(findTianFuPosition(8)).toBe(2);

      // ZiWei at 子 (0) -> TianFu at 辰 (4)
      expect(findTianFuPosition(0)).toBe(4);

      // ZiWei at 午 (6) -> TianFu at 戌 (10)
      expect(findTianFuPosition(6)).toBe(10);
    });

    it('should handle all 12 palace positions correctly', () => {
      const expectedPositions = [
        { ziwei: 0, tianfu: 4 },   // 子 -> 辰
        { ziwei: 1, tianfu: 3 },   // 丑 -> 卯
        { ziwei: 2, tianfu: 2 },   // 寅 -> 寅 (same)
        { ziwei: 3, tianfu: 1 },   // 卯 -> 丑
        { ziwei: 4, tianfu: 0 },   // 辰 -> 子
        { ziwei: 5, tianfu: 11 },  // 巳 -> 亥
        { ziwei: 6, tianfu: 10 },  // 午 -> 戌
        { ziwei: 7, tianfu: 9 },   // 未 -> 酉
        { ziwei: 8, tianfu: 8 },   // 申 -> 申 (same)
        { ziwei: 9, tianfu: 7 },   // 酉 -> 未
        { ziwei: 10, tianfu: 6 },  // 戌 -> 午
        { ziwei: 11, tianfu: 5 }   // 亥 -> 巳
      ];

      expectedPositions.forEach(({ ziwei, tianfu }) => {
        expect(findTianFuPosition(ziwei)).toBe(tianfu);
      });
    });

    it('should maintain symmetry property (double application returns original)', () => {
      // Applying TianFu calculation twice should return to original position
      for (let i = 0; i < 12; i++) {
        const tianfu = findTianFuPosition(i);
        const backToOriginal = findTianFuPosition(tianfu);
        // Due to symmetry, this should equal original position
        // Note: The symmetry axis means (4 - (4 - x)) mod 12 = x
        expect(backToOriginal).toBe(i);
      }
    });

    it('should throw error for invalid ZiWei position', () => {
      expect(() => findTianFuPosition(-1)).toThrow('Invalid ZiWei position');
      expect(() => findTianFuPosition(12)).toThrow('Invalid ZiWei position');
      expect(() => findTianFuPosition(100)).toThrow('Invalid ZiWei position');
    });
  });

  describe('getEarthlyBranch', () => {
    it('should return correct branch names for all positions', () => {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      branches.forEach((branch, index) => {
        expect(getEarthlyBranch(index)).toBe(branch);
      });
    });

    it('should throw error for invalid position', () => {
      expect(() => getEarthlyBranch(-1)).toThrow('Invalid position');
      expect(() => getEarthlyBranch(12)).toThrow('Invalid position');
    });
  });

  describe('calculateTianFuPosition', () => {
    it('should return position and branch for TianFu', () => {
      // ZiWei at 寅 (2) -> TianFu at 申 (8)
      const result = calculateTianFuPosition(2);
      expect(result.position).toBe(8);
      expect(result.branch).toBe('申');
    });

    it('should handle all 12 positions with correct branches', () => {
      const testCases = [
        { ziwei: 0, position: 4, branch: '辰' },
        { ziwei: 1, position: 3, branch: '卯' },
        { ziwei: 2, position: 2, branch: '寅' },
        { ziwei: 3, position: 1, branch: '丑' },
        { ziwei: 4, position: 0, branch: '子' },
        { ziwei: 5, position: 11, branch: '亥' },
        { ziwei: 6, position: 10, branch: '戌' },
        { ziwei: 7, position: 9, branch: '酉' },
        { ziwei: 8, position: 8, branch: '申' },
        { ziwei: 9, position: 7, branch: '未' },
        { ziwei: 10, position: 6, branch: '午' },
        { ziwei: 11, position: 5, branch: '巳' }
      ];

      testCases.forEach(({ ziwei, position, branch }) => {
        const result = calculateTianFuPosition(ziwei);
        expect(result.position).toBe(position);
        expect(result.branch).toBe(branch);
      });
    });
  });

  describe('Integration: TianFu-ZiWei symmetry verification', () => {
    it('should verify symmetry around 寅-申 axis', () => {
      // The 寅-申 axis is the vertical line through positions 2 and 8
      // Positions equidistant from this axis should be symmetric

      // Test pairs that are symmetric around the axis
      const symmetricPairs = [
        [0, 4],   // 子-辰 (both 2 steps from axis)
        [1, 3],   // 丑-卯 (both 1 step from axis)
        [5, 11],  // 巳-亥 (both adjacent to axis)
        [6, 10],  // 午-戌 (both 2 steps from axis on other side)
        [7, 9]    // 未-酉 (both 1 step from axis on other side)
      ];

      symmetricPairs.forEach(([pos1, pos2]) => {
        const tianfu1 = findTianFuPosition(pos1);
        const tianfu2 = findTianFuPosition(pos2);

        // If ZiWei at pos1 gives TianFu at tianfu1,
        // and ZiWei at pos2 gives TianFu at tianfu2,
        // then tianfu1 and tianfu2 should also be symmetric
        expect(findTianFuPosition(tianfu1)).toBe(pos1);
        expect(findTianFuPosition(tianfu2)).toBe(pos2);
      });
    });

    it('should have axis positions map to themselves', () => {
      // Positions on the 寅-申 axis (2 and 8) should map to themselves
      // due to the symmetry property
      expect(findTianFuPosition(2)).toBe(2);
      expect(findTianFuPosition(8)).toBe(8);
    });
  });
});
