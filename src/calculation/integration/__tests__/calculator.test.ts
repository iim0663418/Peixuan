/**
 * Unified Calculator Test Suite
 * Tests end-to-end integration of BaZi and ZiWei calculations
 */

import { describe, it, expect } from 'vitest';
import { UnifiedCalculator } from '../calculator';
import type { BirthInfo } from '../../types';

describe('UnifiedCalculator', () => {
  const calculator = new UnifiedCalculator();

  describe('Input validation', () => {
    it('should throw error for invalid input', () => {
      const invalidInput = {
        solarDate: new Date('invalid'),
        longitude: 121.5,
        gender: 'male' as const
      };

      expect(() => calculator.calculate(invalidInput)).toThrow('Validation failed');
    });

    it('should throw error for missing required fields', () => {
      const invalidInput = {
        solarDate: new Date(2024, 0, 1),
        longitude: 121.5
        // missing gender
      } as BirthInfo;

      expect(() => calculator.calculate(invalidInput)).toThrow('Validation failed');
    });
  });

  describe('End-to-end calculation', () => {
    it('should calculate complete result for valid input', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0), // Jan 1, 2024, 12:00 PM
        longitude: 121.5, // Taipei
        gender: 'male'
      };

      const result = calculator.calculate(input);

      // Verify structure
      expect(result).toHaveProperty('input');
      expect(result).toHaveProperty('bazi');
      expect(result).toHaveProperty('ziwei');
      expect(result).toHaveProperty('timestamp');

      // Verify input is preserved
      expect(result.input).toEqual(input);

      // Verify BaZi result
      expect(result.bazi).toHaveProperty('fourPillars');
      expect(result.bazi.fourPillars).toHaveProperty('year');
      expect(result.bazi.fourPillars).toHaveProperty('month');
      expect(result.bazi.fourPillars).toHaveProperty('day');
      expect(result.bazi.fourPillars).toHaveProperty('hour');
      expect(result.bazi).toHaveProperty('trueSolarTime');
      expect(result.bazi).toHaveProperty('julianDay');

      // Verify ZiWei result
      expect(result.ziwei).toHaveProperty('lifePalace');
      expect(result.ziwei).toHaveProperty('bodyPalace');
      expect(result.ziwei).toHaveProperty('bureau');
      expect(result.ziwei).toHaveProperty('ziWeiPosition');
      expect(result.ziwei).toHaveProperty('tianFuPosition');
      expect(result.ziwei).toHaveProperty('auxiliaryStars');

      // Verify auxiliary stars
      expect(result.ziwei.auxiliaryStars).toHaveProperty('wenChang');
      expect(result.ziwei.auxiliaryStars).toHaveProperty('wenQu');
      expect(result.ziwei.auxiliaryStars).toHaveProperty('zuoFu');
      expect(result.ziwei.auxiliaryStars).toHaveProperty('youBi');
    });

    it('should calculate BaZi four pillars correctly', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0),
        longitude: 121.5,
        gender: 'male'
      };

      const result = calculator.calculate(input);
      const { year, month, day, hour } = result.bazi.fourPillars;

      // Each pillar should have stem and branch
      expect(year.stem).toBeTruthy();
      expect(year.branch).toBeTruthy();
      expect(month.stem).toBeTruthy();
      expect(month.branch).toBeTruthy();
      expect(day.stem).toBeTruthy();
      expect(day.branch).toBeTruthy();
      expect(hour.stem).toBeTruthy();
      expect(hour.branch).toBeTruthy();

      // Verify expected result for Jan 1, 2024 (before 立春 2024)
      expect(year.stem).toBe('癸'); // Year 2023 (before 立春)
      expect(year.branch).toBe('卯');
    });

    it('should calculate ZiWei positions correctly', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 15, 14, 30, 0), // Jan 15, 2024, 14:30
        longitude: 121.5,
        gender: 'female'
      };

      const result = calculator.calculate(input);

      // Bureau should be 2-6
      expect(result.ziwei.bureau).toBeGreaterThanOrEqual(2);
      expect(result.ziwei.bureau).toBeLessThanOrEqual(6);

      // Positions should be 0-11
      expect(result.ziwei.lifePalace.position).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.lifePalace.position).toBeLessThan(12);
      expect(result.ziwei.bodyPalace.position).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.bodyPalace.position).toBeLessThan(12);
      expect(result.ziwei.ziWeiPosition).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.ziWeiPosition).toBeLessThan(12);
      expect(result.ziwei.tianFuPosition).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.tianFuPosition).toBeLessThan(12);

      // Auxiliary star positions should be 0-11
      expect(result.ziwei.auxiliaryStars.wenChang).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.auxiliaryStars.wenChang).toBeLessThan(12);
      expect(result.ziwei.auxiliaryStars.wenQu).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.auxiliaryStars.wenQu).toBeLessThan(12);
      expect(result.ziwei.auxiliaryStars.zuoFu).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.auxiliaryStars.zuoFu).toBeLessThan(12);
      expect(result.ziwei.auxiliaryStars.youBi).toBeGreaterThanOrEqual(0);
      expect(result.ziwei.auxiliaryStars.youBi).toBeLessThan(12);
    });

    it('should populate palaces with stars', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 15, 14, 30, 0),
        longitude: 121.5,
        gender: 'female'
      };

      const result = calculator.calculate(input);

      // Verify palaces array exists and has 12 palaces
      expect(result.ziwei.palaces).toBeDefined();
      expect(result.ziwei.palaces).toHaveLength(12);

      // Count total stars across all palaces
      let totalStars = 0;
      const foundStars = new Set<string>();

      result.ziwei.palaces.forEach((palace) => {
        expect(palace).toHaveProperty('position');
        expect(palace).toHaveProperty('branch');
        expect(palace).toHaveProperty('stars');

        if (palace.stars) {
          totalStars += palace.stars.length;
          palace.stars.forEach((star) => {
            expect(star).toHaveProperty('name');
            expect(star).toHaveProperty('brightness');
            foundStars.add(star.name);
          });
        }
      });

      // Should have at least main stars (14) + auxiliary stars (4) = 18 stars
      expect(totalStars).toBeGreaterThanOrEqual(18);

      // Verify main ZiWei system stars are present
      expect(foundStars.has('紫微')).toBe(true);
      expect(foundStars.has('天機')).toBe(true);
      expect(foundStars.has('太陽')).toBe(true);
      expect(foundStars.has('武曲')).toBe(true);
      expect(foundStars.has('天同')).toBe(true);
      expect(foundStars.has('廉貞')).toBe(true);

      // Verify main TianFu system stars are present
      expect(foundStars.has('天府')).toBe(true);
      expect(foundStars.has('太陰')).toBe(true);
      expect(foundStars.has('貪狼')).toBe(true);
      expect(foundStars.has('巨門')).toBe(true);
      expect(foundStars.has('天相')).toBe(true);
      expect(foundStars.has('天梁')).toBe(true);
      expect(foundStars.has('七殺')).toBe(true);
      expect(foundStars.has('破軍')).toBe(true);

      // Verify auxiliary stars are present
      expect(foundStars.has('文昌')).toBe(true);
      expect(foundStars.has('文曲')).toBe(true);
      expect(foundStars.has('左輔')).toBe(true);
      expect(foundStars.has('右弼')).toBe(true);
    });

    it.skip('should handle leap month input', () => { // TODO: 修復閏月處理邏輯
      const input: BirthInfo = {
        solarDate: new Date(2023, 2, 22, 10, 0, 0), // Leap month scenario
        longitude: 116.4, // Beijing
        gender: 'male',
        isLeapMonth: true
      };

      const result = calculator.calculate(input);

      expect(result).toBeDefined();
      expect(result.input.isLeapMonth).toBe(true);
    });

    it('should handle different genders', () => {
      const inputMale: BirthInfo = {
        solarDate: new Date(2024, 5, 15, 12, 0, 0),
        longitude: 121.5,
        gender: 'male'
      };

      const inputFemale: BirthInfo = {
        ...inputMale,
        gender: 'female'
      };

      const resultMale = calculator.calculate(inputMale);
      const resultFemale = calculator.calculate(inputFemale);

      expect(resultMale).toBeDefined();
      expect(resultFemale).toBeDefined();
      expect(resultMale.input.gender).toBe('male');
      expect(resultFemale.input.gender).toBe('female');
    });

    it('should handle different timezones (longitude)', () => {
      const inputBeijing: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0),
        longitude: 116.4, // Beijing (East)
        gender: 'male'
      };

      const inputNewYork: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0),
        longitude: -74.0, // New York (West)
        gender: 'male'
      };

      const resultBeijing = calculator.calculate(inputBeijing);
      const resultNewYork = calculator.calculate(inputNewYork);

      // True solar time should be different
      expect(resultBeijing.bazi.trueSolarTime.getTime())
        .not.toBe(resultNewYork.bazi.trueSolarTime.getTime());
    });
  });

  describe('Integration consistency', () => {
    it('should produce consistent results for same input', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 15, 14, 30, 0),
        longitude: 121.5,
        gender: 'male'
      };

      const result1 = calculator.calculate(input);
      const result2 = calculator.calculate(input);

      // Four pillars should be identical
      expect(result1.bazi.fourPillars).toEqual(result2.bazi.fourPillars);

      // ZiWei positions should be identical
      expect(result1.ziwei.lifePalace).toEqual(result2.ziwei.lifePalace);
      expect(result1.ziwei.bodyPalace).toEqual(result2.ziwei.bodyPalace);
      expect(result1.ziwei.bureau).toEqual(result2.ziwei.bureau);
      expect(result1.ziwei.ziWeiPosition).toEqual(result2.ziwei.ziWeiPosition);
      expect(result1.ziwei.tianFuPosition).toEqual(result2.ziwei.tianFuPosition);
      expect(result1.ziwei.auxiliaryStars).toEqual(result2.ziwei.auxiliaryStars);
    });
  });

  describe('Edge cases', () => {
    it('should handle midnight hour', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 0, 0, 0), // Midnight
        longitude: 121.5,
        gender: 'male'
      };

      const result = calculator.calculate(input);
      expect(result).toBeDefined();
      expect(result.bazi.fourPillars.hour.branch).toBe('子'); // 子時
    });

    it('should handle date near solar term boundary', () => {
      const input: BirthInfo = {
        solarDate: new Date(2024, 1, 4, 12, 0, 0), // Near 立春
        longitude: 121.5,
        gender: 'male'
      };

      const result = calculator.calculate(input);
      expect(result).toBeDefined();
    });

    it('should handle extreme longitude values', () => {
      const inputWest: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0),
        longitude: -180,
        gender: 'male'
      };

      const inputEast: BirthInfo = {
        solarDate: new Date(2024, 0, 1, 12, 0, 0),
        longitude: 180,
        gender: 'male'
      };

      expect(() => calculator.calculate(inputWest)).not.toThrow();
      expect(() => calculator.calculate(inputEast)).not.toThrow();
    });
  });
});
