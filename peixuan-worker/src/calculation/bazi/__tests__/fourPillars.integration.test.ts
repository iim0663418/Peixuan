/**
 * Four Pillars Integration Test
 * 
 * Tests complete four pillars calculation with known correct results
 */

import { describe, it, expect } from 'vitest';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from '../fourPillars';
import { getLichunTime } from '../../core/time/solarTerms';
import { getSolarLongitude } from '../../core/time/solarLongitude';
import { dateToJulianDay } from '../../core/time/julianDay';
import { ganZhiToIndex } from '../../core/ganZhi';

describe('Four Pillars Integration Tests', () => {
  describe('Year Pillar - LiChun Boundary', () => {
    it('1988-01-01 should be 丁卯 (before LiChun)', () => {
      const birthDate = new Date(1988, 0, 1, 12, 0, 0); // 1988-01-01 12:00
      const lichunTime = getLichunTime(1988);
      
      console.log('1988 LiChun:', lichunTime.toISOString());
      console.log('Birth Date:', birthDate.toISOString());
      console.log('Before LiChun:', birthDate < lichunTime);
      
      const yearPillar = calculateYearPillar(birthDate, lichunTime);
      const index = ganZhiToIndex(yearPillar);
      
      // 1987 = 丁卯 (index 3)
      expect(yearPillar.stem).toBe('丁');
      expect(yearPillar.branch).toBe('卯');
      expect(index).toBe(3);
    });

    it('1988-02-05 should be 戊辰 (after LiChun)', () => {
      const birthDate = new Date(1988, 1, 5, 12, 0, 0); // 1988-02-05 12:00
      const lichunTime = getLichunTime(1988);
      
      const yearPillar = calculateYearPillar(birthDate, lichunTime);
      const index = ganZhiToIndex(yearPillar);
      
      // 1988 = 戊辰 (index 4)
      expect(yearPillar.stem).toBe('戊');
      expect(yearPillar.branch).toBe('辰');
      expect(index).toBe(4);
    });

    it('1992-09-10 should be 壬申', () => {
      const birthDate = new Date(1992, 8, 10, 5, 56, 0);
      const lichunTime = getLichunTime(1992);
      
      const yearPillar = calculateYearPillar(birthDate, lichunTime);
      
      // 1992 = 壬申 (index 8)
      expect(yearPillar.stem).toBe('壬');
      expect(yearPillar.branch).toBe('申');
    });
  });

  describe('Complete Four Pillars', () => {
    it('1992-09-10 05:56 should match known result', () => {
      const birthDate = new Date(1992, 8, 10, 5, 56, 0);
      
      // Year Pillar
      const lichunTime = getLichunTime(1992);
      const yearPillar = calculateYearPillar(birthDate, lichunTime);
      expect(yearPillar.stem).toBe('壬');
      expect(yearPillar.branch).toBe('申');
      
      // Month Pillar
      const solarLongitude = getSolarLongitude(birthDate);
      const yearStemIndex = ganZhiToIndex(yearPillar) % 10;
      const monthPillar = calculateMonthPillar(solarLongitude, yearStemIndex);
      expect(monthPillar.stem).toBe('己');
      expect(monthPillar.branch).toBe('酉');
      
      // Day Pillar
      const jdn = dateToJulianDay(birthDate);
      const dayPillar = calculateDayPillar(jdn);
      expect(dayPillar.stem).toBe('癸');
      expect(dayPillar.branch).toBe('酉');
      
      // Hour Pillar
      const dayStemIndex = ganZhiToIndex(dayPillar) % 10;
      const hourPillar = calculateHourPillar(birthDate.getHours(), birthDate.getMinutes(), dayStemIndex);
      expect(hourPillar.stem).toBe('乙');
      expect(hourPillar.branch).toBe('卯');
    });
  });
});
