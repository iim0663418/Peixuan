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

      // ZiWei at 子 (0) -> TianFu at 午 (6)
      expect(findTianFuPosition(0)).toBe(6);

      // ZiWei at 午 (6) -> TianFu at 子 (0)
      expect(findTianFuPosition(6)).toBe(0);
    });

    it('should handle all 12 palace positions correctly', () => {
      const expectedPositions = [
        { ziwei: 0, tianfu: 6 },   // 子 -> 午
        { ziwei: 1, tianfu: 7 },   // 丑 -> 未
        { ziwei: 2, tianfu: 8 },   // 寅 -> 申
        { ziwei: 3, tianfu: 9 },   // 卯 -> 酉
        { ziwei: 4, tianfu: 10 },  // 辰 -> 戌
        { ziwei: 5, tianfu: 11 },  // 巳 -> 亥
        { ziwei: 6, tianfu: 0 },   // 午 -> 子
        { ziwei: 7, tianfu: 1 },   // 未 -> 丑
        { ziwei: 8, tianfu: 2 },   // 申 -> 寅
        { ziwei: 9, tianfu: 3 },   // 酉 -> 卯
        { ziwei: 10, tianfu: 4 },  // 戌 -> 辰
        { ziwei: 11, tianfu: 5 }   // 亥 -> 巳
      ];

      expectedPositions.forEach(({ ziwei, tianfu }) => {
        expect(findTianFuPosition(ziwei)).toBe(tianfu);
      });
    });

    it('should maintain inverse property (double application returns original)', () => {
      // Applying TianFu calculation twice should return to original position
      for (let i = 0; i < 12; i++) {
        const tianfu = findTianFuPosition(i);
        const backToOriginal = findTianFuPosition(tianfu);
        // Due to the +6 offset, applying twice gives (x + 6 + 6) % 12 = x
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
        { ziwei: 0, position: 6, branch: '午' },
        { ziwei: 1, position: 7, branch: '未' },
        { ziwei: 2, position: 8, branch: '申' },
        { ziwei: 3, position: 9, branch: '酉' },
        { ziwei: 4, position: 10, branch: '戌' },
        { ziwei: 5, position: 11, branch: '亥' },
        { ziwei: 6, position: 0, branch: '子' },
        { ziwei: 7, position: 1, branch: '丑' },
        { ziwei: 8, position: 2, branch: '寅' },
        { ziwei: 9, position: 3, branch: '卯' },
        { ziwei: 10, position: 4, branch: '辰' },
        { ziwei: 11, position: 5, branch: '巳' }
      ];

      testCases.forEach(({ ziwei, position, branch }) => {
        const result = calculateTianFuPosition(ziwei);
        expect(result.position).toBe(position);
        expect(result.branch).toBe(branch);
      });
    });
  });

  describe('Integration: TianFu-ZiWei opposition verification', () => {
    it('should verify opposition pairs (6 positions apart)', () => {
      // With formula (x + 6) % 12, positions are 6 positions apart (opposite)

      // Test pairs that are opposite (6 positions apart)
      const oppositionPairs = [
        [0, 6],   // 子-午
        [1, 7],   // 丑-未
        [2, 8],   // 寅-申
        [3, 9],   // 卯-酉
        [4, 10],  // 辰-戌
        [5, 11]   // 巳-亥
      ];

      oppositionPairs.forEach(([pos1, pos2]) => {
        const tianfu1 = findTianFuPosition(pos1);
        const tianfu2 = findTianFuPosition(pos2);

        // If ZiWei at pos1 gives TianFu at tianfu1,
        // then tianfu1 should equal pos2
        expect(tianfu1).toBe(pos2);
        expect(tianfu2).toBe(pos1);

        // Verify inverse property
        expect(findTianFuPosition(tianfu1)).toBe(pos1);
        expect(findTianFuPosition(tianfu2)).toBe(pos2);
      });
    });

    it('should verify all positions are exactly 6 positions apart', () => {
      // Every ZiWei position should map to a TianFu position exactly 6 steps away
      for (let i = 0; i < 12; i++) {
        const tianfu = findTianFuPosition(i);
        expect(tianfu).toBe((i + 6) % 12);
      }
    });
  });
});
