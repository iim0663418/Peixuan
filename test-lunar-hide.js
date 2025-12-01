const { Solar } = require('lunar-typescript');

const date = new Date('1990-01-01 10:00:00');
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();
const bazi = lunar.getEightChar();

console.log('Year hide gan:', bazi.getYearHideGan());
console.log('Month hide gan:', bazi.getMonthHideGan());
console.log('Day hide gan:', bazi.getDayHideGan());
console.log('Year ShiShenGan:', bazi.getYearShiShenGan());
console.log('Month ShiShenGan:', bazi.getMonthShiShenGan());
