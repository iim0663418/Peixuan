/**
 * Manual verification script for yearly forecast
 * Run this to verify the implementation works correctly
 */

import { calculateYearlyForecast } from '../calculateYearlyForecast';
import { getLichunDatesBetween } from '../getLichunDatesBetween';
import { getLichunTime } from '../../../calculation/core/time/solarTerms';
import { createPalaceArray } from '../../../calculation/annual/palace';
import type { FourPillars } from '../../../calculation/bazi/fourPillars';

const mockFourPillars: FourPillars = {
  year: { stem: '甲', branch: '子' },
  month: { stem: '丙', branch: '寅' },
  day: { stem: '戊', branch: '辰' },
  hour: { stem: '庚', branch: '午' }
};

const birthDate = new Date('1990-05-15T08:30:00Z');
const palaces = createPalaceArray('子');

console.log('=== Test Case 1: 2025-12-06 (Lichun before query) ===');
const queryDate1 = new Date('2025-12-06T00:00:00Z');
const forecast1 = calculateYearlyForecast(birthDate, queryDate1, palaces, mockFourPillars);
console.log('Periods:', forecast1.periods.length);
console.log('Period 1:', {
  start: forecast1.periods[0].startDate.toISOString(),
  end: forecast1.periods[0].endDate.toISOString(),
  pillar: `${forecast1.periods[0].annualPillar.stem}${forecast1.periods[0].annualPillar.branch}`,
  duration: forecast1.periods[0].durationDays,
  weight: forecast1.periods[0].weight
});
if (forecast1.periods[1]) {
  console.log('Period 2:', {
    start: forecast1.periods[1].startDate.toISOString(),
    end: forecast1.periods[1].endDate.toISOString(),
    pillar: `${forecast1.periods[1].annualPillar.stem}${forecast1.periods[1].annualPillar.branch}`,
    duration: forecast1.periods[1].durationDays,
    weight: forecast1.periods[1].weight
  });
}

console.log('\n=== Test Case 2: 2026-03-01 (Lichun after query) ===');
const queryDate2 = new Date('2026-03-01T00:00:00Z');
const forecast2 = calculateYearlyForecast(birthDate, queryDate2, palaces, mockFourPillars);
console.log('Periods:', forecast2.periods.length);
console.log('Period 1:', {
  start: forecast2.periods[0].startDate.toISOString(),
  end: forecast2.periods[0].endDate.toISOString(),
  pillar: `${forecast2.periods[0].annualPillar.stem}${forecast2.periods[0].annualPillar.branch}`,
  duration: forecast2.periods[0].durationDays,
  weight: forecast2.periods[0].weight
});

console.log('\n=== Test Case 3: getLichunDatesBetween ===');
const lichuns1 = getLichunDatesBetween(new Date('2025-01-01'), new Date('2026-12-31'));
console.log('Lichun dates (2025-2026):', lichuns1.map(d => d.toISOString()));

console.log('\n=== Lichun Times Reference ===');
console.log('Lichun 2025:', getLichunTime(2025).toISOString());
console.log('Lichun 2026:', getLichunTime(2026).toISOString());
console.log('Lichun 2027:', getLichunTime(2027).toISOString());
