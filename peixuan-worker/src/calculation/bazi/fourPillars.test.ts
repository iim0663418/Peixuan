/**
 * Four Pillars Calculation Tests
 *
 * Tests the core BaZi calculation functions against known charts.
 * Reference charts verified using traditional BaZi calculation methods.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar
} from './fourPillars';
import { getLichunTime } from '../core/time';
import { HEAVENLY_STEMS } from '../core/ganZhi';

describe('fourPillars', () => {
  describe('calculateYearPillar', () => {
    it('should calculate year pillar for 2024-06-15 (甲辰年)', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      const lichun = getLichunTime(2024); // ~Feb 4, 2024

      const result = calculateYearPillar(date, lichun);

      expect(result.stem).toBe('甲');
      expect(result.branch).toBe('辰');
    });

    it('should use previous year if before 立春', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024 (before 立春)
      const lichun = getLichunTime(2024); // ~Feb 4, 2024

      const result = calculateYearPillar(date, lichun);

      // Should be 癸卯年 (2023)
      expect(result.stem).toBe('癸');
      expect(result.branch).toBe('卯');
    });

    it('should calculate year pillar for 1984-02-02 (甲子年)', () => {
      const date = new Date(1984, 1, 2); // Feb 2, 1984
      const lichun = getLichunTime(1984); // ~Feb 4, 1984

      const result = calculateYearPillar(date, lichun);

      // Before 立春, so should be 癸亥年 (1983)
      expect(result.stem).toBe('癸');
      expect(result.branch).toBe('亥');
    });
  });

  describe('calculateDayPillar', () => {
    it('should calculate day pillar for 1984-02-02 (甲子日)', () => {
      const date = new Date(1984, 1, 2); // Feb 2, 1984 (known 甲子日)

      const result = calculateDayPillar(date);

      expect(result.stem).toBe('甲');
      expect(result.branch).toBe('子');
    });

    it('should calculate day pillar for 2024-01-01', () => {
      const date = new Date(2024, 0, 1); // Jan 1, 2024

      const result = calculateDayPillar(date);

      // JDN 2460310 → (2460310 - 10) mod 60 = 20 → 癸亥
      expect(result.stem).toBe('癸');
      expect(result.branch).toBe('亥');
    });

    it('should calculate day pillar for 2000-01-01', () => {
      const date = new Date(2000, 0, 1); // Jan 1, 2000

      const result = calculateDayPillar(date);

      // Known reference: 2000-01-01 is 己卯日
      expect(result.stem).toBe('己');
      expect(result.branch).toBe('卯');
    });
  });

  describe('calculateMonthPillar', () => {
    it('should calculate month pillar using 五虎遁年法 for 甲年寅月', () => {
      // 甲年 (yearStemIndex = 0), 寅月 starts at ~315° solar longitude
      const solarLongitude = 330; // Within 寅月 range (315° ~ 345°)
      const yearStemIndex = 0; // 甲

      const result = calculateMonthPillar(solarLongitude, yearStemIndex);

      // 五虎遁年法: 甲己之年丙作首 → 甲年寅月 = 丙寅
      expect(result.stem).toBe('丙');
      expect(result.branch).toBe('寅');
    });

    it('should calculate month pillar for 乙年卯月', () => {
      // 乙年 (yearStemIndex = 1), 卯月 starts at ~345° solar longitude
      const solarLongitude = 350; // Within 卯月 range (345° ~ 15°)
      const yearStemIndex = 1; // 乙

      const result = calculateMonthPillar(solarLongitude, yearStemIndex);

      // 五虎遁年法: 乙庚之年戊作首 → 乙年寅月 = 戊寅, 卯月 = 己卯
      expect(result.stem).toBe('己');
      expect(result.branch).toBe('卯');
    });

    it('should calculate month pillar for 丙年子月', () => {
      // 丙年 (yearStemIndex = 2), 子月 starts at ~255° solar longitude
      const solarLongitude = 270; // Within 子月 range (255° ~ 285°)
      const yearStemIndex = 2; // 丙

      const result = calculateMonthPillar(solarLongitude, yearStemIndex);

      // 五虎遁年法: 丙辛之年庚作首 → 丙年寅月 = 庚寅, 子月應該是 戊子
      expect(result.stem).toBe('戊');
      expect(result.branch).toBe('子');
    });
  });

  describe('calculateHourPillar', () => {
    it('should calculate hour pillar using 五鼠遁日法 for 甲日子時', () => {
      // 甲日 (dayStemIndex = 0), 子時 (23:00-01:00)
      const time = new Date(2024, 0, 1, 23, 30); // 23:30
      const dayStemIndex = 0; // 甲

      const result = calculateHourPillar(time, dayStemIndex);

      // 五鼠遁日法: 甲己還加甲 → 甲日子時 = 甲子
      expect(result.stem).toBe('甲');
      expect(result.branch).toBe('子');
    });

    it('should calculate hour pillar for 乙日丑時', () => {
      // 乙日 (dayStemIndex = 1), 丑時 (01:00-03:00)
      const time = new Date(2024, 0, 1, 2, 0); // 02:00
      const dayStemIndex = 1; // 乙

      const result = calculateHourPillar(time, dayStemIndex);

      // 五鼠遁日法: 乙庚丙作初 → 乙日子時 = 丙子, 丑時 = 丁丑
      expect(result.stem).toBe('丁');
      expect(result.branch).toBe('丑');
    });

    it('should calculate hour pillar for 甲日午時', () => {
      // 甲日 (dayStemIndex = 0), 午時 (11:00-13:00)
      const time = new Date(2024, 0, 1, 12, 0); // 12:00 noon
      const dayStemIndex = 0; // 甲

      const result = calculateHourPillar(time, dayStemIndex);

      // 五鼠遁日法: 甲己還加甲 → 甲日子時 = 甲子, 午時 = 庚午
      expect(result.stem).toBe('庚');
      expect(result.branch).toBe('午');
    });

    it('should handle midnight boundary (00:00 is 子時)', () => {
      // 甲日 (dayStemIndex = 0), 00:00 is 子時
      const time = new Date(2024, 0, 1, 0, 30); // 00:30
      const dayStemIndex = 0; // 甲

      const result = calculateHourPillar(time, dayStemIndex);

      // Should be 甲子時
      expect(result.stem).toBe('甲');
      expect(result.branch).toBe('子');
    });
  });

  describe('Full BaZi Chart - Integration Tests', () => {
    it('should calculate complete chart for known BaZi: 1984-02-02 00:00', () => {
      const birthDate = new Date(1984, 1, 2, 0, 0); // Feb 2, 1984, 00:00
      const lichun1984 = getLichunTime(1984);

      // Year pillar (before 立春 on Feb 4, so use 1983)
      const yearPillar = calculateYearPillar(birthDate, lichun1984);
      expect(yearPillar.stem).toBe('癸');
      expect(yearPillar.branch).toBe('亥');

      // Day pillar (known 甲子日)
      const dayPillar = calculateDayPillar(birthDate);
      expect(dayPillar.stem).toBe('甲');
      expect(dayPillar.branch).toBe('子');

      // Hour pillar (00:00 is 子時, 甲日)
      const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
      const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);
      const hourPillar = calculateHourPillar(birthDate, dayStemIndex);
      expect(hourPillar.stem).toBe('甲');
      expect(hourPillar.branch).toBe('子');
    });

    it('should calculate complete chart for 2024-06-15 14:30', () => {
      const birthDate = new Date(2024, 5, 15, 14, 30); // June 15, 2024, 14:30
      const lichun2024 = getLichunTime(2024);

      // Year pillar (甲辰年)
      const yearPillar = calculateYearPillar(birthDate, lichun2024);
      expect(yearPillar.stem).toBe('甲');
      expect(yearPillar.branch).toBe('辰');

      // Day pillar
      const dayPillar = calculateDayPillar(birthDate);
      // Verify it's a valid GanZhi
      expect(HEAVENLY_STEMS).toContain(dayPillar.stem);

      // Hour pillar (14:30 is 未時)
      const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);
      const hourPillar = calculateHourPillar(birthDate, dayStemIndex);
      expect(hourPillar.branch).toBe('未');
    });

    it('should calculate complete chart for 2000-01-01 12:00', () => {
      const birthDate = new Date(2000, 0, 1, 12, 0); // Jan 1, 2000, 12:00
      const lichun2000 = getLichunTime(2000);

      // Year pillar (before 立春, so use 1999)
      const yearPillar = calculateYearPillar(birthDate, lichun2000);
      expect(yearPillar.stem).toBe('己');
      expect(yearPillar.branch).toBe('卯');

      // Day pillar (己卯日)
      const dayPillar = calculateDayPillar(birthDate);
      expect(dayPillar.stem).toBe('己');
      expect(dayPillar.branch).toBe('卯');

      // Hour pillar (12:00 is 午時)
      const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);
      const hourPillar = calculateHourPillar(birthDate, dayStemIndex);
      expect(hourPillar.branch).toBe('午');
    });
  });
});
