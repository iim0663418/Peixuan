/**
 * Temporary test to verify lunar-typescript output for test expectations
 */
import { describe, it } from 'vitest';
import { Solar } from 'lunar-typescript';

describe('Verify lunar-typescript output', () => {
  it('should show GanZhi for test dates', () => {
    const testDates = [
      { date: new Date(1984, 1, 2), label: '1984-02-02 (Day pillar test)' },
      { date: new Date(2024, 0, 1), label: '2024-01-01 (Day pillar test)' },
      { date: new Date(2000, 0, 1), label: '2000-01-01 (Day pillar test)' },
      { date: new Date(1984, 1, 2, 0, 0), label: '1984-02-02 00:00 (Integration test)' },
      { date: new Date(2024, 5, 15, 14, 30), label: '2024-06-15 14:30 (Integration test)' },
      { date: new Date(2000, 0, 1, 12, 0), label: '2000-01-01 12:00 (Integration test)' }
    ];

    console.log('\n=== lunar-typescript GanZhi Output ===\n');

    testDates.forEach(({ date, label }) => {
      const solar = Solar.fromDate(date);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      console.log(`${label}:`);
      console.log(`  Year:  ${eightChar.getYearGan()}${eightChar.getYearZhi()}`);
      console.log(`  Month: ${eightChar.getMonthGan()}${eightChar.getMonthZhi()}`);
      console.log(`  Day:   ${eightChar.getDayGan()}${eightChar.getDayZhi()}`);
      console.log(`  Hour:  ${eightChar.getTimeGan()}${eightChar.getTimeZhi()}`);
      console.log('');
    });
  });
});
