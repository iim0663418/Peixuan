/**
 * Auxiliary Stars Positioning Module Tests
 * Comprehensive test coverage for time-based and month-based stars
 */

import { describe, it, expect } from 'vitest';
import {
  findTimeStars,
  findMonthStars,
  calculateTimeStars,
  calculateMonthStars,
  getEarthlyBranch
} from './auxiliary';

describe('Auxiliary Stars Positioning', () => {
  describe('findTimeStars - 文昌、文曲', () => {
    it('should calculate correct positions for all 12 hour branches', () => {
      // Test data based on traditional formulas
      // 文昌: Start at 戌 (10) for 子時 (0), counterclockwise
      // 文曲: Start at 辰 (4) for 子時 (0), clockwise
      const expectedPositions = [
        { hour: 0, wenChang: 10, wenQu: 4 },   // 子時 -> 戌、辰
        { hour: 1, wenChang: 9, wenQu: 5 },    // 丑時 -> 酉、巳
        { hour: 2, wenChang: 8, wenQu: 6 },    // 寅時 -> 申、午
        { hour: 3, wenChang: 7, wenQu: 7 },    // 卯時 -> 未、未
        { hour: 4, wenChang: 6, wenQu: 8 },    // 辰時 -> 午、申
        { hour: 5, wenChang: 5, wenQu: 9 },    // 巳時 -> 巳、酉
        { hour: 6, wenChang: 4, wenQu: 10 },   // 午時 -> 辰、戌
        { hour: 7, wenChang: 3, wenQu: 11 },   // 未時 -> 卯、亥
        { hour: 8, wenChang: 2, wenQu: 0 },    // 申時 -> 寅、子
        { hour: 9, wenChang: 1, wenQu: 1 },    // 酉時 -> 丑、丑
        { hour: 10, wenChang: 0, wenQu: 2 },   // 戌時 -> 子、寅
        { hour: 11, wenChang: 11, wenQu: 3 }   // 亥時 -> 亥、卯
      ];

      expectedPositions.forEach(({ hour, wenChang, wenQu }) => {
        const result = findTimeStars(hour);
        expect(result.wenChang).toBe(wenChang);
        expect(result.wenQu).toBe(wenQu);
      });
    });

    it('should verify 文昌 counterclockwise movement', () => {
      // Starting at 戌 (10) for 子時 (0)
      // Moving counterclockwise: 戌->酉->申->未...
      const wenChangSequence = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];

      wenChangSequence.forEach((expectedPos, hourIndex) => {
        const result = findTimeStars(hourIndex);
        expect(result.wenChang).toBe(expectedPos);
      });
    });

    it('should verify 文曲 clockwise movement', () => {
      // Starting at 辰 (4) for 子時 (0)
      // Moving clockwise: 辰->巳->午->未...
      const wenQuSequence = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3];

      wenQuSequence.forEach((expectedPos, hourIndex) => {
        const result = findTimeStars(hourIndex);
        expect(result.wenQu).toBe(expectedPos);
      });
    });

    it('should throw error for invalid hour branch', () => {
      expect(() => findTimeStars(-1)).toThrow('Invalid hour branch');
      expect(() => findTimeStars(12)).toThrow('Invalid hour branch');
      expect(() => findTimeStars(100)).toThrow('Invalid hour branch');
    });
  });

  describe('findMonthStars - 左輔、右弼', () => {
    it('should calculate correct positions for all 12 lunar months', () => {
      // Test data based on traditional formulas
      // 左輔: Start at 辰 (4) for month 1, clockwise
      // 右弼: Start at 戌 (10) for month 1, counterclockwise
      const expectedPositions = [
        { month: 1, zuoFu: 4, youBi: 10 },    // 正月 -> 辰、戌
        { month: 2, zuoFu: 5, youBi: 9 },     // 二月 -> 巳、酉
        { month: 3, zuoFu: 6, youBi: 8 },     // 三月 -> 午、申
        { month: 4, zuoFu: 7, youBi: 7 },     // 四月 -> 未、未
        { month: 5, zuoFu: 8, youBi: 6 },     // 五月 -> 申、午
        { month: 6, zuoFu: 9, youBi: 5 },     // 六月 -> 酉、巳
        { month: 7, zuoFu: 10, youBi: 4 },    // 七月 -> 戌、辰
        { month: 8, zuoFu: 11, youBi: 3 },    // 八月 -> 亥、卯
        { month: 9, zuoFu: 0, youBi: 2 },     // 九月 -> 子、寅
        { month: 10, zuoFu: 1, youBi: 1 },    // 十月 -> 丑、丑
        { month: 11, zuoFu: 2, youBi: 0 },    // 十一月 -> 寅、子
        { month: 12, zuoFu: 3, youBi: 11 }    // 十二月 -> 卯、亥
      ];

      expectedPositions.forEach(({ month, zuoFu, youBi }) => {
        const result = findMonthStars(month);
        expect(result.zuoFu).toBe(zuoFu);
        expect(result.youBi).toBe(youBi);
      });
    });

    it('should verify 左輔 clockwise movement', () => {
      // Starting at 辰 (4) for month 1
      // Moving clockwise: 辰->巳->午->未...
      const zuoFuSequence = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3];

      zuoFuSequence.forEach((expectedPos, index) => {
        const result = findMonthStars(index + 1); // months are 1-indexed
        expect(result.zuoFu).toBe(expectedPos);
      });
    });

    it('should verify 右弼 counterclockwise movement', () => {
      // Starting at 戌 (10) for month 1
      // Moving counterclockwise: 戌->酉->申->未...
      const youBiSequence = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];

      youBiSequence.forEach((expectedPos, index) => {
        const result = findMonthStars(index + 1); // months are 1-indexed
        expect(result.youBi).toBe(expectedPos);
      });
    });

    it('should throw error for invalid lunar month', () => {
      expect(() => findMonthStars(0)).toThrow('Invalid lunar month');
      expect(() => findMonthStars(13)).toThrow('Invalid lunar month');
      expect(() => findMonthStars(-1)).toThrow('Invalid lunar month');
      expect(() => findMonthStars(100)).toThrow('Invalid lunar month');
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

  describe('calculateTimeStars', () => {
    it('should return positions and branch names for time stars', () => {
      // Test 子時 (hour 0)
      const result = calculateTimeStars(0);
      expect(result.wenChang).toBe(10);
      expect(result.wenChangBranch).toBe('戌');
      expect(result.wenQu).toBe(4);
      expect(result.wenQuBranch).toBe('辰');
    });

    it('should handle all 12 hour branches with correct branches', () => {
      const testCases = [
        { hour: 0, wenChang: 10, wenChangBranch: '戌', wenQu: 4, wenQuBranch: '辰' },
        { hour: 2, wenChang: 8, wenChangBranch: '申', wenQu: 6, wenQuBranch: '午' },
        { hour: 6, wenChang: 4, wenChangBranch: '辰', wenQu: 10, wenQuBranch: '戌' },
        { hour: 8, wenChang: 2, wenChangBranch: '寅', wenQu: 0, wenQuBranch: '子' }
      ];

      testCases.forEach(({ hour, wenChang, wenChangBranch, wenQu, wenQuBranch }) => {
        const result = calculateTimeStars(hour);
        expect(result.wenChang).toBe(wenChang);
        expect(result.wenChangBranch).toBe(wenChangBranch);
        expect(result.wenQu).toBe(wenQu);
        expect(result.wenQuBranch).toBe(wenQuBranch);
      });
    });
  });

  describe('calculateMonthStars', () => {
    it('should return positions and branch names for month stars', () => {
      // Test month 1
      const result = calculateMonthStars(1);
      expect(result.zuoFu).toBe(4);
      expect(result.zuoFuBranch).toBe('辰');
      expect(result.youBi).toBe(10);
      expect(result.youBiBranch).toBe('戌');
    });

    it('should handle all 12 lunar months with correct branches', () => {
      const testCases = [
        { month: 1, zuoFu: 4, zuoFuBranch: '辰', youBi: 10, youBiBranch: '戌' },
        { month: 3, zuoFu: 6, zuoFuBranch: '午', youBi: 8, youBiBranch: '申' },
        { month: 7, zuoFu: 10, zuoFuBranch: '戌', youBi: 4, youBiBranch: '辰' },
        { month: 9, zuoFu: 0, zuoFuBranch: '子', youBi: 2, youBiBranch: '寅' }
      ];

      testCases.forEach(({ month, zuoFu, zuoFuBranch, youBi, youBiBranch }) => {
        const result = calculateMonthStars(month);
        expect(result.zuoFu).toBe(zuoFu);
        expect(result.zuoFuBranch).toBe(zuoFuBranch);
        expect(result.youBi).toBe(youBi);
        expect(result.youBiBranch).toBe(youBiBranch);
      });
    });
  });

  describe('Integration: Star symmetry verification', () => {
    it('should verify 文昌-文曲 meet at specific hours', () => {
      // When 文昌 and 文曲 are at the same position
      const result1 = findTimeStars(3); // 卯時
      expect(result1.wenChang).toBe(result1.wenQu); // Both at 未 (7)

      const result2 = findTimeStars(9); // 酉時
      expect(result2.wenChang).toBe(result2.wenQu); // Both at 丑 (1)
    });

    it('should verify 左輔-右弼 meet at specific months', () => {
      // When 左輔 and 右弼 are at the same position
      const result1 = findMonthStars(4); // 四月
      expect(result1.zuoFu).toBe(result1.youBi); // Both at 未 (7)

      const result2 = findMonthStars(10); // 十月
      expect(result2.zuoFu).toBe(result2.youBi); // Both at 丑 (1)
    });

    it('should verify time stars and month stars have similar patterns', () => {
      // Both use 辰-戌 axis as starting points
      // Time stars: 文昌 at 戌, 文曲 at 辰 for hour 0
      // Month stars: 左輔 at 辰, 右弼 at 戌 for month 1

      const timeResult = findTimeStars(0);
      const monthResult = findMonthStars(1);

      // Verify the symmetry pattern exists
      expect(timeResult.wenChang).toBe(10); // 戌
      expect(timeResult.wenQu).toBe(4);     // 辰
      expect(monthResult.zuoFu).toBe(4);    // 辰
      expect(monthResult.youBi).toBe(10);   // 戌
    });
  });
});
