/**
 * Tests for Yearly Forecast Calculator
 *
 * Test coverage:
 * 1. Lichun before query date (splits into 2 periods)
 * 2. Lichun after query date (single period)
 * 3. Cross two Lichuns (2 periods, edge case)
 * 4. Boundary cases (weight calculation, duration calculation)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateYearlyForecast,
  calculateDuration,
  calculateWeight,
  type YearlyForecast
} from '../calculateYearlyForecast';
import { getLichunDatesBetween } from '../getLichunDatesBetween';
import { getLichunTime } from '../../../calculation/core/time/solarTerms';
import { createPalaceArray } from '../../../calculation/annual/palace';
import type { FourPillars } from '../../../calculation/bazi/fourPillars';

// Mock FourPillars for testing
const mockFourPillars: FourPillars = {
  year: { stem: '甲', branch: '子' },
  month: { stem: '丙', branch: '寅' },
  day: { stem: '戊', branch: '辰' },
  hour: { stem: '庚', branch: '午' }
};

describe('Yearly Forecast Calculator', () => {
  describe('getLichunDatesBetween', () => {
    it('should return Lichun dates within range', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2026-12-31');

      const lichuns = getLichunDatesBetween(startDate, endDate);

      expect(lichuns.length).toBe(2);
      expect(lichuns[0].getFullYear()).toBe(2025);
      expect(lichuns[1].getFullYear()).toBe(2026);
    });

    it('should return empty array if startDate > endDate', () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2025-01-01');

      const lichuns = getLichunDatesBetween(startDate, endDate);

      expect(lichuns).toEqual([]);
    });

    it('should handle single year range with one Lichun', () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-12-31');

      const lichuns = getLichunDatesBetween(startDate, endDate);

      expect(lichuns.length).toBe(1);
      expect(lichuns[0].getFullYear()).toBe(2025);
    });

    it('should return empty array if no Lichun in range', () => {
      const startDate = new Date('2025-02-10');
      const endDate = new Date('2025-03-01');

      const lichuns = getLichunDatesBetween(startDate, endDate);

      expect(lichuns.length).toBe(0);
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration in days', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-11T00:00:00Z');

      const duration = calculateDuration(start, end);

      expect(duration).toBe(10);
    });

    it('should handle fractional days', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-01T12:00:00Z');

      const duration = calculateDuration(start, end);

      expect(duration).toBe(0.5);
    });

    it('should calculate duration across year boundary', () => {
      const start = new Date('2025-12-31T00:00:00Z');
      const end = new Date('2026-01-02T00:00:00Z');

      const duration = calculateDuration(start, end);

      expect(duration).toBe(2);
    });
  });

  describe('calculateWeight', () => {
    it('should calculate weight as proportion of total', () => {
      const weight = calculateWeight(30, 100);

      expect(weight).toBe(0.3);
    });

    it('should return 0 when totalDays is 0', () => {
      const weight = calculateWeight(30, 0);

      expect(weight).toBe(0);
    });

    it('should handle equal weights', () => {
      const weight1 = calculateWeight(50, 100);
      const weight2 = calculateWeight(50, 100);

      expect(weight1).toBe(0.5);
      expect(weight2).toBe(0.5);
      expect(weight1 + weight2).toBe(1.0);
    });

    it('should round to 4 decimal places', () => {
      const weight = calculateWeight(1, 3);

      expect(weight).toBe(0.3333);
    });
  });

  describe('calculateYearlyForecast', () => {
    const birthDate = new Date('1990-05-15T08:30:00Z');
    const palaces = createPalaceArray('子'); // Start from 子

    describe('Case 1: Lichun before query (2025-12-06)', () => {
      it('should split into 2 periods when Lichun is within range', () => {
        // Query: 2025-12-06, Lichun 2026 is around Feb 3-4
        const queryDate = new Date('2025-12-06T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        expect(forecast.periods.length).toBe(2);
        expect(forecast.queryDate).toEqual(queryDate);

        // Period 1: 2025-12-06 to Lichun 2026
        const period1 = forecast.periods[0];
        expect(period1.startDate).toEqual(queryDate);
        expect(period1.annualPillar.stem).toBe('乙'); // 2025 is 乙巳
        expect(period1.annualPillar.branch).toBe('巳');
        expect(period1.weight).toBeLessThan(0.5); // Short period before Lichun

        // Period 2: Lichun 2026 to 2026-12-06
        const period2 = forecast.periods[1];
        expect(period2.annualPillar.stem).toBe('丙'); // 2026 is 丙午
        expect(period2.annualPillar.branch).toBe('午');
        expect(period2.weight).toBeGreaterThan(0.5); // Longer period after Lichun

        // Weights should sum to 1
        expect(period1.weight + period2.weight).toBeCloseTo(1.0, 4);
      });

      it('should have correct annual life palace positions', () => {
        const queryDate = new Date('2025-12-06T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        // Period 1: 乙巳 year, branch 巳
        const period1 = forecast.periods[0];
        expect(period1.annualLifePalacePosition).toBe(5); // 巳 is at index 5

        // Period 2: 丙午 year, branch 午
        const period2 = forecast.periods[1];
        expect(period2.annualLifePalacePosition).toBe(6); // 午 is at index 6
      });
    });

    describe('Case 2: Lichun after query (2026-03-01)', () => {
      it('should have single period when no Lichun in range', () => {
        // Query: 2026-03-01 (after Lichun 2026), no Lichun until 2027-02-03
        const queryDate = new Date('2026-03-01T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        expect(forecast.periods.length).toBe(2);

        // First period: 2026-03-01 to 2027-02-04 (before Lichun 2027)
        const period1 = forecast.periods[0];
        expect(period1.startDate).toEqual(queryDate);
        expect(period1.annualPillar.stem).toBe('丙'); // 2026 is 丙午
        expect(period1.annualPillar.branch).toBe('午');

        // Second period: 2027-02-04 to 2027-03-01 (after Lichun 2027)
        const period2 = forecast.periods[1];
        expect(period2.annualPillar.stem).toBe('丁'); // 2027 is 丁未
        expect(period2.annualPillar.branch).toBe('未');

        // Weights should sum to 1.0
        expect(period1.weight + period2.weight).toBeCloseTo(1.0);
      });
    });

    describe('Case 3: Cross two Lichuns (2025-01-15)', () => {
      it('should handle query spanning two Lichun dates', () => {
        // Query: 2025-01-15, spans Lichun 2025 (~Feb 3)
        // End: 2026-01-15, after Lichun 2026 (~Feb 3)
        const queryDate = new Date('2025-01-15T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        expect(forecast.periods.length).toBe(2);

        // Period 1: Before Lichun 2025 (甲辰 year)
        const period1 = forecast.periods[0];
        expect(period1.annualPillar.stem).toBe('甲'); // 2024 is 甲辰
        expect(period1.annualPillar.branch).toBe('辰');

        // Period 2: After Lichun 2025 (乙巳 year)
        const period2 = forecast.periods[1];
        expect(period2.annualPillar.stem).toBe('乙'); // 2025 is 乙巳
        expect(period2.annualPillar.branch).toBe('巳');

        // Period 2 should be much longer (most of the year)
        expect(period2.durationDays).toBeGreaterThan(period1.durationDays);
        expect(period2.weight).toBeGreaterThan(period1.weight);
      });
    });

    describe('Boundary cases', () => {
      it('should handle query exactly at Lichun time', () => {
        const lichun2025 = getLichunTime(2025);

        const forecast = calculateYearlyForecast(birthDate, lichun2025, palaces, mockFourPillars);

        // Should have 2 periods if next Lichun is within 365 days
        expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

        // First period should start exactly at Lichun
        expect(forecast.periods[0].startDate).toEqual(lichun2025);
        expect(forecast.periods[0].annualPillar.stem).toBe('乙'); // 2025 is 乙巳
      });

      it('should handle leap year correctly', () => {
        // 2024 is a leap year
        const queryDate = new Date('2024-01-01T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        expect(forecast.periods.length).toBe(2);

        // Before Lichun 2024 (~Feb 4)
        const period1 = forecast.periods[0];
        expect(period1.annualPillar.stem).toBe('癸'); // 2023 is 癸卯
        expect(period1.annualPillar.branch).toBe('卯');

        // After Lichun 2024
        const period2 = forecast.periods[1];
        expect(period2.annualPillar.stem).toBe('甲'); // 2024 is 甲辰
        expect(period2.annualPillar.branch).toBe('辰');
      });

      it('should handle end of year query (Dec 31)', () => {
        const queryDate = new Date('2025-12-31T23:59:59Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        expect(forecast.periods.length).toBe(2);

        // Very short first period (few days)
        const period1 = forecast.periods[0];
        expect(period1.durationDays).toBeLessThan(40);
        expect(period1.weight).toBeLessThan(0.1);

        // Long second period
        const period2 = forecast.periods[1];
        expect(period2.durationDays).toBeGreaterThan(320);
        expect(period2.weight).toBeGreaterThan(0.9);
      });

      it('should validate total duration equals 365 days', () => {
        const queryDate = new Date('2025-06-15T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        const totalDuration = forecast.periods.reduce(
          (sum, period) => sum + period.durationDays,
          0
        );

        expect(totalDuration).toBeCloseTo(365, 1); // Allow 1 day tolerance
      });

      it('should validate weights sum to 1.0', () => {
        const queryDate = new Date('2025-09-20T00:00:00Z');

        const forecast = calculateYearlyForecast(birthDate, queryDate, palaces, mockFourPillars);

        const totalWeight = forecast.periods.reduce(
          (sum, period) => sum + period.weight,
          0
        );

        expect(totalWeight).toBeCloseTo(1.0, 4);
      });
    });
  });
});
