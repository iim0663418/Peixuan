import { Solar } from 'lunar-typescript';

export function getTenGod(
  pillar: 'year' | 'month' | 'day',
  solarDate: Date
): string {
  if (pillar === 'day') {
    return '日主';
  }

  const solar = Solar.fromDate(solarDate);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  switch (pillar) {
    case 'year':
      return bazi.getYearShiShenGan();
    case 'month':
      return bazi.getMonthShiShenGan();
    default:
      return '日主';
  }
}
