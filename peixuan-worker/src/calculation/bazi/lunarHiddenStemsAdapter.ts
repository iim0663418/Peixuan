import { Solar } from 'lunar-typescript';

export function getHiddenStems(
  pillar: 'year' | 'month' | 'day',
  solarDate: Date
): string[] {
  const solar = Solar.fromDate(solarDate);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  switch (pillar) {
    case 'year':
      return bazi.getYearHideGan();
    case 'month':
      return bazi.getMonthHideGan();
    case 'day':
      return bazi.getDayHideGan();
  }
}
