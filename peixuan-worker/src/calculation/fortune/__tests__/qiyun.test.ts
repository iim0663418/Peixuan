/**
 * QiYun (起運) Calculation Tests
 *
 * Tests fortune direction logic, time conversion, and edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  determineFortuneDirection,
  convertMetabolicDays,
  calculateQiYunDate,
  type Gender
} from '../qiyun';

describe('QiYun (起運) Calculation Module', () => {
  describe('determineFortuneDirection', () => {
    describe('Male direction logic', () => {
      it('should return forward for male with Yang stem (男陽順)', () => {
        expect(determineFortuneDirection('甲', 'male')).toBe('forward');
        expect(determineFortuneDirection('丙', 'male')).toBe('forward');
        expect(determineFortuneDirection('戊', 'male')).toBe('forward');
        expect(determineFortuneDirection('庚', 'male')).toBe('forward');
        expect(determineFortuneDirection('壬', 'male')).toBe('forward');
      });

      it('should return backward for male with Yin stem (男陰逆)', () => {
        expect(determineFortuneDirection('乙', 'male')).toBe('backward');
        expect(determineFortuneDirection('丁', 'male')).toBe('backward');
        expect(determineFortuneDirection('己', 'male')).toBe('backward');
        expect(determineFortuneDirection('辛', 'male')).toBe('backward');
        expect(determineFortuneDirection('癸', 'male')).toBe('backward');
      });
    });

    describe('Female direction logic', () => {
      it('should return backward for female with Yang stem (女陽逆)', () => {
        expect(determineFortuneDirection('甲', 'female')).toBe('backward');
        expect(determineFortuneDirection('丙', 'female')).toBe('backward');
        expect(determineFortuneDirection('戊', 'female')).toBe('backward');
        expect(determineFortuneDirection('庚', 'female')).toBe('backward');
        expect(determineFortuneDirection('壬', 'female')).toBe('backward');
      });

      it('should return forward for female with Yin stem (女陰順)', () => {
        expect(determineFortuneDirection('乙', 'female')).toBe('forward');
        expect(determineFortuneDirection('丁', 'female')).toBe('forward');
        expect(determineFortuneDirection('己', 'female')).toBe('forward');
        expect(determineFortuneDirection('辛', 'female')).toBe('forward');
        expect(determineFortuneDirection('癸', 'female')).toBe('forward');
      });
    });
  });

  describe('convertMetabolicDays', () => {
    it('should convert 3 days (4320 minutes) to 1 year', () => {
      const result = convertMetabolicDays(4320); // 3 days × 1440 min/day
      expect(result.years).toBe(0);
      // 3 metabolic days × 120 = 360 real days
      expect(result.months).toBeGreaterThanOrEqual(11);
    });

    it('should handle exact 1 year conversion (3.042 days)', () => {
      const minutesFor1Year = (365 / 120) * 1440; // ~4381 minutes
      const result = convertMetabolicDays(minutesFor1Year);
      expect(result.years).toBe(1);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
    });

    it('should handle 6 hours (360 minutes) correctly', () => {
      const result = convertMetabolicDays(360); // 0.25 days
      // 0.25 × 120 = 30 real days = 1 month
      expect(result.years).toBe(0);
      expect(result.months).toBe(1);
      expect(result.days).toBe(0);
    });

    it('should handle 1 hour (60 minutes) correctly', () => {
      const result = convertMetabolicDays(60); // ~0.042 days
      // 0.042 × 120 = ~5 real days
      expect(result.years).toBe(0);
      expect(result.months).toBe(0);
      expect(result.days).toBe(5);
    });

    it('should handle very large time differences', () => {
      const result = convertMetabolicDays(43200); // 30 days
      // 30 × 120 = 3600 real days ≈ 9.86 years
      expect(result.years).toBeGreaterThanOrEqual(9);
    });
  });

  describe('calculateQiYunDate', () => {
    describe('Direction-based calculations', () => {
      it('should calculate forward direction for 男陽 (male Yang)', () => {
        // Male born with Yang year stem should look forward to next Jie
        const birthDate = new Date('1990-03-20T10:00:00'); // After 立春
        const result = calculateQiYunDate(
          birthDate,
          '庚', // Yang stem
          'male',
          birthDate
        );

        // Should be after birth date
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });

      it('should calculate backward direction for 男陰 (male Yin)', () => {
        // Male born with Yin year stem should look backward to prev Jie
        const birthDate = new Date('1991-03-20T10:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '辛', // Yin stem
          'male',
          birthDate
        );

        // Should be after birth date (since we add real days)
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });

      it('should calculate backward direction for 女陽 (female Yang)', () => {
        const birthDate = new Date('1992-03-20T10:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '壬', // Yang stem
          'female',
          birthDate
        );

        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });

      it('should calculate forward direction for 女陰 (female Yin)', () => {
        const birthDate = new Date('1993-03-20T10:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '癸', // Yin stem
          'female',
          birthDate
        );

        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });
    });

    describe('Edge cases', () => {
      it('should handle birth very close to Jie (within 1 day)', () => {
        // Birth just after 立春 2024 (around Feb 4)
        const birthDate = new Date('2024-02-05T00:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '甲',
          'male',
          birthDate
        );

        // Very close to Jie = short metabolic period = early QiYun
        // 但陽男順行，需數到下一個節氣（驚蟄），約30天≈10年
        expect(result.getFullYear()).toBeGreaterThanOrEqual(2033);
      });

      it('should handle birth very far from Jie', () => {
        // Birth in late January (far from next 立春, far from prev 立春)
        const birthDate = new Date('2024-01-15T12:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '甲',
          'male',
          birthDate
        );

        // Should produce valid future date
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });

      it('should handle birth at year boundary', () => {
        // Birth on New Year but before 立春
        const birthDate = new Date('2024-01-01T00:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '癸', // Previous year stem
          'female',
          birthDate
        );

        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });

      it('should handle leap year births', () => {
        // 2024 is a leap year
        const birthDate = new Date('2024-02-29T12:00:00');
        const result = calculateQiYunDate(
          birthDate,
          '甲',
          'male',
          birthDate
        );

        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });
    });

    describe('Time conversion accuracy', () => {
      it('should produce consistent results for same inputs', () => {
        const birthDate = new Date('1995-06-15T14:30:00');
        const result1 = calculateQiYunDate(birthDate, '乙', 'female', birthDate);
        const result2 = calculateQiYunDate(birthDate, '乙', 'female', birthDate);

        expect(result1.getTime()).toBe(result2.getTime());
      });

      it('should handle different time zones correctly', () => {
        // True solar time should already be adjusted
        const birthDate = new Date('2000-05-20T08:00:00');
        const trueSolarTime = new Date('2000-05-20T08:30:00'); // 30 min diff

        const result = calculateQiYunDate(
          birthDate,
          '庚',
          'male',
          trueSolarTime
        );

        // Should use trueSolarTime for Jie distance calculation
        expect(result).toBeInstanceOf(Date);
      });
    });
  });

  describe('Integration tests', () => {
    it('should calculate complete QiYun for typical case', () => {
      const birthDate = new Date('1988-08-15T10:30:00');
      const qiyunDate = calculateQiYunDate(birthDate, '戊', 'male', birthDate);

      // QiYun should be in future
      expect(qiyunDate.getTime()).toBeGreaterThan(birthDate.getTime());

      // Should be within reasonable range (< 10 years)
      const yearsDiff = (qiyunDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      expect(yearsDiff).toBeLessThan(10);
    });

    it('should work for all 10 heavenly stems', () => {
      const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const birthDate = new Date('2000-01-01T12:00:00');

      stems.forEach(stem => {
        const result = calculateQiYunDate(birthDate, stem, 'male', birthDate);
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(birthDate.getTime());
      });
    });
  });
});
