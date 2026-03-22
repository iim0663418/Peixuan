/**
 * DaYun (大運) Fortune Cycle Tests
 * Comprehensive test suite for fortune cycle generation and detection
 */

import { describe, it, expect } from 'vitest';
import { generateDaYunList, getCurrentDaYun } from '../dayun';
import type { GanZhi } from '../../core/ganZhi/conversion';

describe('DaYun Fortune Cycle Calculations', () => {
  describe('generateDaYunList - Forward Direction', () => {
    it('should generate forward cycles starting from month pillar 甲子', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 5);

      expect(cycles).toHaveLength(5);

      // First cycle should be 乙丑 (next after 甲子)
      expect(cycles[0].stem).toBe('乙');
      expect(cycles[0].branch).toBe('丑');
      expect(cycles[0].startAge).toBe(10);
      expect(cycles[0].endAge).toBe(20);

      // Second cycle should be 丙寅
      expect(cycles[1].stem).toBe('丙');
      expect(cycles[1].branch).toBe('寅');
      expect(cycles[1].startAge).toBe(20);
      expect(cycles[1].endAge).toBe(30);

      // Third cycle should be 丁卯
      expect(cycles[2].stem).toBe('丁');
      expect(cycles[2].branch).toBe('卯');
      expect(cycles[2].startAge).toBe(30);
      expect(cycles[2].endAge).toBe(40);
    });

    it('should wrap around 60 Jiazi cycle correctly in forward direction', () => {
      const monthPillar: GanZhi = { stem: '癸', branch: '亥' }; // Last in cycle (index 59)
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 3);

      // After 癸亥 (59) should wrap to 甲子 (0)
      expect(cycles[0].stem).toBe('甲');
      expect(cycles[0].branch).toBe('子');

      // Then 乙丑 (1)
      expect(cycles[1].stem).toBe('乙');
      expect(cycles[1].branch).toBe('丑');
    });
  });

  describe('generateDaYunList - Backward Direction', () => {
    it('should generate backward cycles starting from month pillar 甲子', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'backward', 5);

      expect(cycles).toHaveLength(5);

      // First cycle should be 癸亥 (previous before 甲子)
      expect(cycles[0].stem).toBe('癸');
      expect(cycles[0].branch).toBe('亥');
      expect(cycles[0].startAge).toBe(10);
      expect(cycles[0].endAge).toBe(20);

      // Second cycle should be 壬戌
      expect(cycles[1].stem).toBe('壬');
      expect(cycles[1].branch).toBe('戌');
      expect(cycles[1].startAge).toBe(20);
      expect(cycles[1].endAge).toBe(30);

      // Third cycle should be 辛酉
      expect(cycles[2].stem).toBe('辛');
      expect(cycles[2].branch).toBe('酉');
      expect(cycles[2].startAge).toBe(30);
      expect(cycles[2].endAge).toBe(40);
    });

    it('should wrap around 60 Jiazi cycle correctly in backward direction', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' }; // First in cycle (index 0)
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'backward', 3);

      // Before 甲子 (0) should wrap to 癸亥 (59)
      expect(cycles[0].stem).toBe('癸');
      expect(cycles[0].branch).toBe('亥');

      // Then 壬戌 (58)
      expect(cycles[1].stem).toBe('壬');
      expect(cycles[1].branch).toBe('戌');
    });
  });

  describe('10-Year Interval Validation', () => {
    it('should create cycles with exactly 10-year intervals', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-03-15T10:30:00');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 5);

      cycles.forEach((cycle, index) => {
        // Check start date is qiyunDate + (index * 10 years)
        const expectedStart = new Date(qiyunDate);
        expectedStart.setFullYear(expectedStart.getFullYear() + (index * 10));
        expect(cycle.startDate.getTime()).toBe(expectedStart.getTime());

        // Check end date is start date + 10 years
        const expectedEnd = new Date(cycle.startDate);
        expectedEnd.setFullYear(expectedEnd.getFullYear() + 10);
        expect(cycle.endDate.getTime()).toBe(expectedEnd.getTime());

        // Check startAge and endAge (qiyunAge is 10, so first cycle is 10-20, second is 20-30, etc.)
        expect(cycle.startAge).toBe(10 + (index * 10));
        expect(cycle.endAge).toBe(20 + (index * 10));
      });
    });

    it('should maintain 10-year duration for each cycle', () => {
      const monthPillar: GanZhi = { stem: '丙', branch: '寅' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('1985-06-20');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'backward', 8);

      cycles.forEach(cycle => {
        const durationYears =
          (cycle.endDate.getFullYear() - cycle.startDate.getFullYear());
        expect(durationYears).toBe(10);
      });
    });

    it('should preserve time component across cycles', () => {
      const monthPillar: GanZhi = { stem: '戊', branch: '辰' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01T14:23:45.678');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 3);

      cycles.forEach(cycle => {
        // Time component should be preserved
        expect(cycle.startDate.getHours()).toBe(14);
        expect(cycle.startDate.getMinutes()).toBe(23);
        expect(cycle.startDate.getSeconds()).toBe(45);
        expect(cycle.startDate.getMilliseconds()).toBe(678);
      });
    });
  });

  describe('getCurrentDaYun - Current Cycle Detection', () => {
    const monthPillar: GanZhi = { stem: '甲', branch: '子' };
    const birthDate = new Date('1990-01-01');
    const qiyunDate = new Date('2000-01-01');
    const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 10);

    it('should find current cycle for date within first cycle', () => {
      const queryDate = new Date('2005-06-15');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).not.toBeNull();
      expect(current?.stem).toBe('乙');
      expect(current?.branch).toBe('丑');
      expect(current?.startAge).toBe(10);
      expect(current?.endAge).toBe(20);
    });

    it('should find current cycle for date within middle cycle', () => {
      const queryDate = new Date('2025-03-10');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).not.toBeNull();
      expect(current?.startAge).toBe(30);
      expect(current?.endAge).toBe(40);
      expect(current?.stem).toBe('丁');
      expect(current?.branch).toBe('卯');
    });

    it('should find current cycle for date at cycle boundary (inclusive start)', () => {
      const queryDate = new Date('2020-01-01');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).not.toBeNull();
      expect(current?.startAge).toBe(30);
      expect(current?.endAge).toBe(40);
    });

    it('should not include end date in cycle (exclusive end)', () => {
      const queryDate = new Date('2030-01-01'); // Exactly at end of third cycle
      const current = getCurrentDaYun(cycles, queryDate);

      // Should return fourth cycle, not third
      expect(current).not.toBeNull();
      expect(current?.startAge).toBe(40);
      expect(current?.endAge).toBe(50);
    });

    it('should return null for query date before first cycle', () => {
      const queryDate = new Date('1999-12-31');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).toBeNull();
    });

    it('should return null for query date after last cycle', () => {
      const queryDate = new Date('2100-01-01');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).toBeNull();
    });

    it('should handle query at exact millisecond of start date', () => {
      const cycles = generateDaYunList(
        { stem: '甲', branch: '子' },
        new Date('1990-01-01'),
        new Date('2000-01-01T12:34:56.789'),
        'forward',
        5
      );
      const queryDate = new Date('2010-01-01T12:34:56.789');
      const current = getCurrentDaYun(cycles, queryDate);

      expect(current).not.toBeNull();
      expect(current?.startAge).toBe(20);
      expect(current?.endAge).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cycle list', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 0);

      expect(cycles).toHaveLength(0);

      const current = getCurrentDaYun(cycles, new Date('2010-01-01'));
      expect(current).toBeNull();
    });

    it('should handle single cycle', () => {
      const monthPillar: GanZhi = { stem: '丙', branch: '寅' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 1);

      expect(cycles).toHaveLength(1);

      const current = getCurrentDaYun(cycles, new Date('2005-01-01'));
      expect(current).not.toBeNull();
      expect(current?.stem).toBe('丁');
      expect(current?.branch).toBe('卯');
    });

    it('should handle leap year boundaries correctly', () => {
      // Start on leap day
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-02-29');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 3);

      // First cycle end: 2000-02-29 + 10 years = 2010-03-01 (JavaScript Date auto-adjusts)
      const firstEnd = cycles[0].endDate;
      expect(firstEnd.getMonth()).toBe(2); // March (0-indexed) - auto-adjusted from Feb 29
      expect(firstEnd.getDate()).toBe(1); // March 1st
    });

    it('should handle maximum count (default 10 cycles)', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward');

      expect(cycles).toHaveLength(10);
      expect(cycles[9].startAge).toBe(100);
      expect(cycles[9].endAge).toBe(110);
    });

    it('should handle different GanZhi starting points', () => {
      // Test with middle of Jiazi cycle
      const monthPillar: GanZhi = { stem: '庚', branch: '午' }; // Index 30
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 3);

      expect(cycles[0].stem).toBe('辛');
      expect(cycles[0].branch).toBe('未');
      expect(cycles[1].stem).toBe('壬');
      expect(cycles[1].branch).toBe('申');
    });
  });

  describe('Consistency Tests', () => {
    it('should maintain continuous GanZhi sequence in forward direction', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 60);

      // After 60 cycles, should complete full Jiazi cycle
      // The 60th cycle should be back to original position
      expect(cycles[59].stem).toBe('甲');
      expect(cycles[59].branch).toBe('子');
    });

    it('should maintain continuous GanZhi sequence in backward direction', () => {
      const monthPillar: GanZhi = { stem: '甲', branch: '子' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');
      const cycles = generateDaYunList(monthPillar, birthDate, qiyunDate, 'backward', 60);

      // After 60 cycles backward, should complete full Jiazi cycle
      expect(cycles[59].stem).toBe('甲');
      expect(cycles[59].branch).toBe('子');
    });

    it('should produce different results for forward vs backward', () => {
      const monthPillar: GanZhi = { stem: '戊', branch: '辰' };
      const birthDate = new Date('1990-01-01');
      const qiyunDate = new Date('2000-01-01');

      const forward = generateDaYunList(monthPillar, birthDate, qiyunDate, 'forward', 5);
      const backward = generateDaYunList(monthPillar, birthDate, qiyunDate, 'backward', 5);

      // First cycles should be different
      expect(forward[0].stem).not.toBe(backward[0].stem);
      expect(forward[0].branch).not.toBe(backward[0].branch);

      // But dates should be the same
      expect(forward[0].startDate.getTime()).toBe(backward[0].startDate.getTime());
    });
  });
});
