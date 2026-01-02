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
  calculateSixMonthForecast,
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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate: lichun2025, palaces, fourPillars: mockFourPillars });

        // Should have 2 periods if next Lichun is within 365 days
        expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

        // First period should start exactly at Lichun
        expect(forecast.periods[0].startDate).toEqual(lichun2025);
        expect(forecast.periods[0].annualPillar.stem).toBe('乙'); // 2025 is 乙巳
      });

      it('should handle leap year correctly', () => {
        // 2024 is a leap year
        const queryDate = new Date('2024-01-01T00:00:00Z');

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

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

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

        const totalDuration = forecast.periods.reduce(
          (sum, period) => sum + period.durationDays,
          0
        );

        expect(totalDuration).toBeCloseTo(365, 1); // Allow 1 day tolerance
      });

      it('should validate weights sum to 1.0', () => {
        const queryDate = new Date('2025-09-20T00:00:00Z');

        const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

        const totalWeight = forecast.periods.reduce(
          (sum, period) => sum + period.weight,
          0
        );

        expect(totalWeight).toBeCloseTo(1.0, 4);
      });
    });

    describe('Phase 1 - Boundary Test Cases (準備 6 個月預測功能)', () => {
      // NOTE: 以下測試案例準備未來支援 6 個月預測功能
      // 當前 calculateYearlyForecast 尚未支援 durationMonths 參數
      // 這些測試確保邊界條件（閏年、月末、立春）的計算正確性

      describe('Leap year boundary tests (閏年邊界測試)', () => {
        it('should handle leap year Feb 29 correctly', () => {
          // 2024-02-29 (閏年 2 月 29 日)
          const queryDate = new Date('2024-02-29T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 驗證開始日期正確
          expect(forecast.periods[0].startDate).toEqual(queryDate);

          // 驗證總時長接近 365/366 天
          const totalDuration = forecast.periods.reduce(
            (sum, period) => sum + period.durationDays,
            0
          );
          expect(totalDuration).toBeGreaterThan(364);
          expect(totalDuration).toBeLessThan(367);
        });

        it('should handle Feb 28 in non-leap year', () => {
          // 2025-02-28 (非閏年 2 月 28 日)
          const queryDate = new Date('2025-02-28T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 驗證權重總和為 1.0
          const totalWeight = forecast.periods.reduce(
            (sum, period) => sum + period.weight,
            0
          );
          expect(totalWeight).toBeCloseTo(1.0, 4);
        });
      });

      describe('Month-end boundary tests (月末邊界測試)', () => {
        it('should handle Jan 31 correctly', () => {
          // 2026-01-31 (1 月 31 日)
          const queryDate = new Date('2026-01-31T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 驗證結束日期計算正確（應該是 2027-01-31 左右）
          const totalDuration = forecast.periods.reduce(
            (sum, period) => sum + period.durationDays,
            0
          );
          expect(totalDuration).toBeCloseTo(365, 1);
        });

        it('should handle May 31 correctly', () => {
          // 2026-05-31 (5 月 31 日)
          const queryDate = new Date('2026-05-31T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 驗證權重總和
          const totalWeight = forecast.periods.reduce(
            (sum, period) => sum + period.weight,
            0
          );
          expect(totalWeight).toBeCloseTo(1.0, 4);
        });
      });

      describe('Lichun boundary tests (立春邊界測試)', () => {
        it('should handle query on Lichun 2026 (Feb 4) correctly', () => {
          // 2026 年立春約在 2 月 4 日
          const lichun2026 = getLichunTime(2026);

          const forecast = calculateYearlyForecast({ birthDate, queryDate: lichun2026, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 第一個 period 應該從立春開始，且為丙午年
          expect(forecast.periods[0].startDate).toEqual(lichun2026);
          expect(forecast.periods[0].annualPillar.stem).toBe('丙');
          expect(forecast.periods[0].annualPillar.branch).toBe('午');
        });

        it('should handle query one day before Lichun 2026', () => {
          // 2026-02-03 (立春前一天)
          const lichun2026 = getLichunTime(2026);
          const oneDayBefore = new Date(lichun2026);
          oneDayBefore.setDate(oneDayBefore.getDate() - 1);

          const forecast = calculateYearlyForecast({ birthDate, queryDate: oneDayBefore, palaces, fourPillars: mockFourPillars });

          expect(forecast.periods.length).toBe(2);

          // 第一個 period 應該非常短（約 1 天），且為乙巳年
          expect(forecast.periods[0].durationDays).toBeLessThan(2);
          expect(forecast.periods[0].annualPillar.stem).toBe('乙');
          expect(forecast.periods[0].annualPillar.branch).toBe('巳');

          // 第二個 period 為丙午年
          expect(forecast.periods[1].annualPillar.stem).toBe('丙');
          expect(forecast.periods[1].annualPillar.branch).toBe('午');
        });

        it('should handle query one day after Lichun 2026', () => {
          // 2026-02-05 (立春後一天)
          const lichun2026 = getLichunTime(2026);
          const oneDayAfter = new Date(lichun2026);
          oneDayAfter.setDate(oneDayAfter.getDate() + 1);

          const forecast = calculateYearlyForecast({ birthDate, queryDate: oneDayAfter, palaces, fourPillars: mockFourPillars });

          // 應該至少有 1 個 period（可能有 2 個，取決於下一個立春）
          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);

          // 第一個 period 應該為丙午年
          expect(forecast.periods[0].annualPillar.stem).toBe('丙');
          expect(forecast.periods[0].annualPillar.branch).toBe('午');
        });
      });

      describe('6-month forecast preparation tests (6 個月預測準備測試)', () => {
        // 這些測試驗證當前邏輯對「半年區間」的處理能力
        // 為未來 durationMonths 參數的引入做準備

        it('should verify calculation correctness for 2026-01-02 to 2026-07-02', () => {
          // 2026-01-02 查詢，預期未來會支援指定結束日期為 2026-07-02
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          // 當前仍為 365 天，但驗證前 6 個月的計算正確性
          expect(forecast.periods.length).toBe(2);

          // Period 1: 2026-01-02 至 2026-02-04 (乙巳年)
          expect(forecast.periods[0].annualPillar.stem).toBe('乙');
          expect(forecast.periods[0].annualPillar.branch).toBe('巳');

          // Period 2: 2026-02-04 至結束 (丙午年)
          expect(forecast.periods[1].annualPillar.stem).toBe('丙');
          expect(forecast.periods[1].annualPillar.branch).toBe('午');

          // 驗證權重總和
          const totalWeight = forecast.periods.reduce(
            (sum, period) => sum + period.weight,
            0
          );
          expect(totalWeight).toBeCloseTo(1.0, 4);
        });

        it('should verify no infinite loop risk with valid dates', () => {
          // 驗證日期計算不會導致死迴圈
          const queryDate = new Date('2026-01-15T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          // 應該正常返回結果
          expect(forecast.periods.length).toBeGreaterThanOrEqual(1);
          expect(forecast.periods.length).toBeLessThanOrEqual(2);

          // 所有 period 的時長都應該是正數
          forecast.periods.forEach((period) => {
            expect(period.durationDays).toBeGreaterThan(0);
          });
        });

        it('should verify Lichun boundary detection across 6-month span', () => {
          // 驗證 6 個月跨度內的立春邊界檢測
          // 2026-01-02 至 2026-07-02 應該包含 1 個立春（2026-02-04）
          const startDate = new Date('2026-01-02T00:00:00Z');
          const endDate = new Date('2026-07-02T00:00:00Z');

          const lichuns = getLichunDatesBetween(startDate, endDate);

          // 應該找到 1 個立春
          expect(lichuns.length).toBe(1);
          expect(lichuns[0].getMonth()).toBe(1); // February (0-indexed)
          expect(lichuns[0].getDate()).toBeGreaterThanOrEqual(3);
          expect(lichuns[0].getDate()).toBeLessThanOrEqual(5);
        });
      });
    });

    describe('Phase 2: durationMonths parameter tests (durationMonths 參數測試)', () => {
      // Phase 2 功能：支援 durationMonths 參數，允許 6/12 個月預測

      describe('Backward compatibility (向後兼容性)', () => {
        it('should default to 12 months when durationMonths not specified', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          // 預設應該是 12 個月
          expect(forecast.durationMonths).toBe(12);

          // 結束日期應該是開始日期 + 12 個月
          const expectedEndDate = new Date('2027-01-02T00:00:00Z');
          expect(forecast.endDate).toEqual(expectedEndDate);
        });

        it('should maintain backward compatibility with existing calls', () => {
          const queryDate = new Date('2025-12-06T00:00:00Z');

          // 舊調用方式（不傳 durationMonths）
          const forecast = calculateYearlyForecast({ birthDate, queryDate, palaces, fourPillars: mockFourPillars });

          // 應該仍然正常工作，且為 12 個月
          expect(forecast.periods.length).toBe(2);
          expect(forecast.durationMonths).toBe(12);

          // 驗證總時長接近 365 天
          const totalDuration = forecast.periods.reduce(
            (sum, period) => sum + period.durationDays,
            0
          );
          expect(totalDuration).toBeCloseTo(365, 1);
        });
      });

      describe('6-month forecast (6 個月預測)', () => {
        it('should calculate 6-month forecast with durationMonths=6', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          // 明確指定 6 個月
          const forecast = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 6
          });

          expect(forecast.durationMonths).toBe(6);

          // 結束日期應該是 2026-07-02
          const expectedEndDate = new Date('2026-07-02T00:00:00Z');
          expect(forecast.endDate).toEqual(expectedEndDate);

          // 應該有 2 個 period（跨立春 2026-02-04）
          expect(forecast.periods.length).toBe(2);

          // Period 1: 2026-01-02 至 2026-02-04 (乙巳年)
          expect(forecast.periods[0].annualPillar.stem).toBe('乙');
          expect(forecast.periods[0].annualPillar.branch).toBe('巳');

          // Period 2: 2026-02-04 至 2026-07-02 (丙午年)
          expect(forecast.periods[1].annualPillar.stem).toBe('丙');
          expect(forecast.periods[1].annualPillar.branch).toBe('午');
        });

        it('should calculate total duration approximately 180 days for 6 months', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 6
          });

          // 6 個月約 180 天（允許誤差 ±5 天，因為月份天數不同）
          const totalDuration = forecast.periods.reduce(
            (sum, period) => sum + period.durationDays,
            0
          );
          expect(totalDuration).toBeGreaterThan(175);
          expect(totalDuration).toBeLessThan(185);
        });

        it('should sum weights to 1.0 for 6-month forecast', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 6
          });

          const totalWeight = forecast.periods.reduce(
            (sum, period) => sum + period.weight,
            0
          );
          expect(totalWeight).toBeCloseTo(1.0, 4);
        });
      });

      describe('calculateSixMonthForecast wrapper (6 個月包裝函數)', () => {
        it('should call calculateYearlyForecast with durationMonths=6', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateSixMonthForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars
          });

          expect(forecast.durationMonths).toBe(6);

          // 結束日期應該是 2026-07-02
          const expectedEndDate = new Date('2026-07-02T00:00:00Z');
          expect(forecast.endDate).toEqual(expectedEndDate);
        });

        it('should produce same result as calculateYearlyForecast with durationMonths=6', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast1 = calculateSixMonthForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars
          });

          const forecast2 = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 6
          });

          // 兩種調用方式應該產生相同結果
          expect(forecast1.durationMonths).toBe(forecast2.durationMonths);
          expect(forecast1.endDate).toEqual(forecast2.endDate);
          expect(forecast1.periods.length).toBe(forecast2.periods.length);
        });
      });

      describe('Safety validation (安全驗證)', () => {
        it('should reject durationMonths < 1', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          expect(() => {
            calculateYearlyForecast({
              birthDate,
              queryDate,
              palaces,
              fourPillars: mockFourPillars,
              currentDayun: undefined,
              durationMonths: 0
            });
          }).toThrow(/durationMonths must be between/);
        });

        it('should reject durationMonths > 24', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          expect(() => {
            calculateYearlyForecast({
              birthDate,
              queryDate,
              palaces,
              fourPillars: mockFourPillars,
              currentDayun: undefined,
              durationMonths: 25
            });
          }).toThrow(/durationMonths must be between/);
        });

        it('should accept durationMonths at boundary (1 and 24)', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          // 1 個月應該通過
          const forecast1 = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 1
          });
          expect(forecast1.durationMonths).toBe(1);

          // 24 個月應該通過
          const forecast24 = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 24
          });
          expect(forecast24.durationMonths).toBe(24);
        });
      });

      describe('Edge cases with different durations (不同時長的邊界案例)', () => {
        it('should handle 3-month forecast', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 3
          });

          expect(forecast.durationMonths).toBe(3);

          // 結束日期應該是 2026-04-02
          const expectedEndDate = new Date('2026-04-02T00:00:00Z');
          expect(forecast.endDate).toEqual(expectedEndDate);

          // 應該有 2 個 period（跨立春 2026-02-04）
          expect(forecast.periods.length).toBe(2);
        });

        it('should handle 18-month forecast', () => {
          const queryDate = new Date('2026-01-02T00:00:00Z');

          const forecast = calculateYearlyForecast({
            birthDate,
            queryDate,
            palaces,
            fourPillars: mockFourPillars,
            currentDayun: undefined,
            durationMonths: 18
          });

          expect(forecast.durationMonths).toBe(18);

          // 結束日期應該是 2027-07-02
          const expectedEndDate = new Date('2027-07-02T00:00:00Z');
          expect(forecast.endDate).toEqual(expectedEndDate);

          // 總時長約 540 天（18 個月）
          const totalDuration = forecast.periods.reduce(
            (sum, period) => sum + period.durationDays,
            0
          );
          expect(totalDuration).toBeGreaterThan(535);
          expect(totalDuration).toBeLessThan(555);
        });
      });
    });
  });
});
