/**
 * Tests for Annual Pillar with LiChun Boundary Calculation
 *
 * Test coverage:
 * 1. LiChun boundary tests (before/after LiChun)
 * 2. Year transition tests (Dec 31 vs Jan 1)
 * 3. Edge cases (leap years, different timezones)
 */

import { describe, it, expect } from 'vitest';
import { getAnnualPillar, hasPassedLiChun } from '../liuchun';
import { getLichunTime } from '../../core/time/solarTerms';

describe('Annual Pillar with LiChun Boundary', () => {
  describe('getAnnualPillar', () => {
    describe('LiChun boundary tests', () => {
      it('should return previous year GanZhi before LiChun', () => {
        // 2024-02-03 is before LiChun 2024 (~Feb 4, 2024)
        const result = getAnnualPillar(new Date('2024-02-03T10:00:00Z'));

        // Should use 2023's pillar: 癸卯
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
      });

      it('should return current year GanZhi after LiChun', () => {
        // 2024-02-05 is after LiChun 2024
        const result = getAnnualPillar(new Date('2024-02-05T10:00:00Z'));

        // Should use 2024's pillar: 甲辰
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('辰');
      });

      it('should handle date exactly at LiChun time', () => {
        const year = 2024;
        const lichunTime = getLichunTime(year);
        const result = getAnnualPillar(lichunTime);

        // At LiChun, should use current year's pillar
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('辰');
      });

      it('should handle one second before LiChun', () => {
        const year = 2024;
        const lichunTime = getLichunTime(year);
        const oneSecondBefore = new Date(lichunTime.getTime() - 1000);
        const result = getAnnualPillar(oneSecondBefore);

        // One second before LiChun, should use previous year
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
      });
    });

    describe('Year transition tests', () => {
      it('should use previous year GanZhi on Dec 31 before next LiChun', () => {
        // Dec 31, 2023 is before LiChun 2024
        const result = getAnnualPillar(new Date('2023-12-31T23:59:59Z'));

        // Should use 2023's pillar: 癸卯
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
      });

      it('should use previous year GanZhi on Jan 1 before LiChun', () => {
        // Jan 1, 2024 is before LiChun 2024 (~Feb 4)
        const result = getAnnualPillar(new Date('2024-01-01T00:00:00Z'));

        // Should still use 2023's pillar: 癸卯
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
      });

      it('should handle Chinese New Year vs LiChun difference', () => {
        // Chinese New Year 2024 is Feb 10, but LiChun is ~Feb 4
        // Date between LiChun and CNY
        const result = getAnnualPillar(new Date('2024-02-08T10:00:00Z'));

        // Should use 2024's pillar (after LiChun): 甲辰
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('辰');
      });
    });

    describe('Edge cases', () => {
      it('should handle leap year correctly (2024)', () => {
        // 2024 is a leap year
        const resultBefore = getAnnualPillar(new Date('2024-02-29T10:00:00Z'));

        // Feb 29 is after LiChun, should be 2024: 甲辰
        expect(resultBefore.stem).toBe('甲');
        expect(resultBefore.branch).toBe('辰');
      });

      it('should calculate correct GanZhi for year 2000', () => {
        // 2000-05-01 is after LiChun 2000
        const result = getAnnualPillar(new Date('2000-05-01T10:00:00Z'));

        // 2000: (2000 - 4) % 60 = 1996 % 60 = 16 → 庚辰
        expect(result.stem).toBe('庚');
        expect(result.branch).toBe('辰');
      });

      it('should handle year 1984 (start of 60-year cycle)', () => {
        // 1984 is 甲子 year: (1984 - 4) % 60 = 1980 % 60 = 0
        const result = getAnnualPillar(new Date('1984-05-01T10:00:00Z'));

        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('子');
      });

      it('should handle year 1924 (previous 60-year cycle)', () => {
        // 1924 is also 甲子 year: (1924 - 4) % 60 = 1920 % 60 = 0
        const result = getAnnualPillar(new Date('1924-05-01T10:00:00Z'));

        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('子');
      });

      it('should handle different timezones (UTC vs local)', () => {
        // Create date in different timezone representations
        const utcDate = new Date('2024-02-04T08:00:00Z');
        const localDate = new Date('2024-02-04T16:00:00+08:00');

        const utcResult = getAnnualPillar(utcDate);
        const localResult = getAnnualPillar(localDate);

        // Both should represent same moment, so same result
        expect(utcResult).toEqual(localResult);
      });
    });

    describe('Historical dates', () => {
      it('should handle early 20th century date', () => {
        // 1950-06-01
        const result = getAnnualPillar(new Date('1950-06-01T10:00:00Z'));

        // 1950: (1950 - 4) % 60 = 1946 % 60 = 26 → 庚寅
        expect(result.stem).toBe('庚');
        expect(result.branch).toBe('寅');
      });

      it('should handle date in 1970s', () => {
        // 1975-08-15
        const result = getAnnualPillar(new Date('1975-08-15T10:00:00Z'));

        // 1975: (1975 - 4) % 60 = 1971 % 60 = 51 → 乙卯
        expect(result.stem).toBe('乙');
        expect(result.branch).toBe('卯');
      });
    });
  });

  describe('hasPassedLiChun', () => {
    it('should return false before LiChun', () => {
      const result = hasPassedLiChun(new Date('2024-02-03T10:00:00Z'));
      expect(result).toBe(false);
    });

    it('should return true after LiChun', () => {
      const result = hasPassedLiChun(new Date('2024-02-05T10:00:00Z'));
      expect(result).toBe(true);
    });

    it('should return true exactly at LiChun', () => {
      const lichunTime = getLichunTime(2024);
      const result = hasPassedLiChun(lichunTime);
      expect(result).toBe(true);
    });

    it('should return false one millisecond before LiChun', () => {
      const lichunTime = getLichunTime(2024);
      const oneMsBefore = new Date(lichunTime.getTime() - 1);
      const result = hasPassedLiChun(oneMsBefore);
      expect(result).toBe(false);
    });

    it('should handle Jan 1 correctly (before LiChun)', () => {
      const result = hasPassedLiChun(new Date('2024-01-01T00:00:00Z'));
      expect(result).toBe(false);
    });

    it('should handle Dec 31 correctly (before next year LiChun)', () => {
      const result = hasPassedLiChun(new Date('2023-12-31T23:59:59Z'));
      expect(result).toBe(true); // Already passed 2023's LiChun
    });
  });
});
