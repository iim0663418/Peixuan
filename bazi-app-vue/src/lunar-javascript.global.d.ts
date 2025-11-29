// lunar-javascript.global.d.ts
// Based on observed API and expected structure for versions like 1.2.30

interface JieQiInfo {
  name: string;
  solar: Solar; // Solar date of the JieQi
  isJie: boolean;
  isQi: boolean;
  toString(): string;
}

interface SolarTerm {
  getName(): string;
  getSolar(): Solar;
  isJie(): boolean;
  isQi(): boolean;
  toString(): string;
}

interface YunInstance {
  getStartYear(): number;
  getStartSolar(): Solar;
  // Potentially other methods like getDaYun() which returns DaYun[]
  getDaYun(count?: number): DaYun[];
}

interface DaYun {
  getStartYear(): number;
  getEndYear(): number;
  getStartAge(): number;
  getEndAge(): number;
  getIndex(): number; // 1-based index of the DaYun period
  getLunar(): Lunar; // The Lunar date context for this DaYun
  getGanZhi(): string; // GanZhi of the DaYun
  getXun(): string;
  getXunKong(): string;
  // Potentially getLiuNian() and getXiaoYun()
}

declare class Lunar {
  constructor(); // Or appropriate constructor signature if known

  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;

  getYearInGanZhi(): string;
  getYearInGanZhiByLiChun(): string;
  getYearInGanZhiExact(): string;
  getMonthInGanZhi(): string;
  getMonthInGanZhiExact(): string;
  getDayInGanZhi(): string;
  getDayInGanZhiExact(): string;
  getDayInGanZhiExact2(): string; // For sect 2
  getTimeInGanZhi(): string;

  getYearGan(): string;
  getYearGanExact(): string;
  getYearZhi(): string;
  getYearZhiExact(): string;
  getMonthGan(): string;
  getMonthGanExact(): string;
  getMonthZhi(): string;
  getMonthZhiExact(): string;
  getDayGan(): string;
  getDayGanExact(): string;
  getDayGanExact2(): string;
  getDayZhi(): string;
  getDayZhiExact(): string;
  getDayZhiExact2(): string;
  getTimeGan(): string;
  getTimeZhi(): string;

  getSolar(): Solar;
  getJieQiTable(): Record<string, Solar>; // e.g. {"立春": Solar, ...}
  getJieQiList(): string[];
  getJie(): string; // Current Jie (if any)
  getQi(): string; // Current Qi (if any)
  getJieQi(): string; // Current JieQi (if any)
  getPrevJie(accurate?: boolean): SolarTerm | null;
  getNextJie(accurate?: boolean): SolarTerm | null;

  getEightChar(): EightChar; // Added

  // getYun is now on EightChar, removing from Lunar instance directly
  // getYun(gender: 0 | 1, sect?: 1 | 2): YunInstance;

  toString(includeTime?: boolean): string;
  toFullString(): string;

  // Static-like factory methods (if Lunar is an object/namespace)
  static fromYmdHms(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ): Lunar;
  static fromDate(date: Date): Lunar;
}

declare class Solar {
  constructor(
    year: number,
    month: number,
    day: number,
    hour?: number,
    minute?: number,
    second?: number,
  );

  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;
  getLunar(): Lunar;
  getJieQiJulianDays(): number[]; // Array of Julian days for solar terms

  toString(): string;
  toYmd(): string;
  toYmdHms(): string;

  // Static-like factory methods
  static fromYmdHms(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ): Solar;
  static fromYmd(year: number, month: number, day: number): Solar;
  static fromDate(date: Date): Solar;
  static fromJulianDay(julianDay: number): Solar;
}

// Global Yun class/object, if it exists (seems not to in v1.2.30 and v1.6.3 based on logs)
// declare class Yun {
//   constructor(lunarDate: Lunar, gender: 0 | 1, sect?: 1 | 2);
//   getStartYear(): number;
//   getStartSolar(): Solar;
//   getDaYun(count?: number): DaYun[];
// }
// For now, we assume Yun is NOT a global class but rather obtained via lunar.getYun()

declare class LunarMonth {
  getYear(): number;
  getMonth(): number; // Negative for leap month
  getDayCount(): number;
  getFirstJulianDay(): number;
  isLeap(): boolean;

  static fromYm(lunarYear: number, lunarMonth: number): LunarMonth | null;
}

// For calendar.js fallback
interface CalendarLunarDetail {
  lYear: number;
  lMonth: number;
  lDay: number;
  IMonthCn: string;
  IDayCn: string;
  isLeap: boolean;
  lDays: number; // Days in this lunar month
  // other properties might exist
}
interface CalendarSolarDetail {
  cYear: number;
  cMonth: number;
  cDay: number;
  // other properties might exist
}
declare const calendar: {
  solar2lunar(year: number, month: number, day: number): CalendarLunarDetail;
  lunar2solar(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isLeapMonth?: boolean,
  ): CalendarSolarDetail;
  toChinaMonth(month: number, isLeap?: boolean): string;
  toChinaDay(day: number): string;
};

// Make Lunar, Solar, LunarMonth, (and potentially Yun if it were global) available globally
declare global {
  // Lunar might be an object with static methods, or a class.
  // Based on usage `Lunar.fromYmdHms` and `solar.getLunar()`, it seems `Lunar` is a namespace/object
  // and `solar.getLunar()` returns an instance-like object that has `getYun`.
  const Lunar: typeof Lunar;
  const Solar: typeof Solar;
  const LunarMonth: typeof LunarMonth;
  // const Yun: typeof Yun; // Commented out as logs show it's undefined

  // Declare EightChar class/interface based on new information
  interface EightChar {
    // Basic getters for the four pillars
    getYear(): string; // e.g., "甲子"
    getMonth(): string;
    getDay(): string;
    getTime(): string;

    // Other potential methods based on the library's capabilities
    getXunKong(): string; // 空亡
    getTenGods(): string[]; // 十神 (this might return an array or a more complex object)

    // The crucial getYun method
    // gender: 0 for female (逆行 if yang year, 順行 if yin year by some conventions, or just female)
    // gender: 1 for male (順行 if yang year, 逆行 if yin year by some conventions, or just male)
    // The library documentation states: 0 for female (逆行), 1 for male (順行) for getYun on EightChar.
    // However, the example shows getYun(0) and getYun(1) for 順行 and 逆行 respectively.
    // We will assume the example's interpretation: 0 might mean 順行, 1 逆行, or it depends on internal logic.
    // For now, let's stick to the parameter being gender, and the library handles direction.
    // The example `eightChar.getYun(0).getStartYear()` and `eightChar.getYun(1).getStartYear()` suggests
    // the parameter to getYun might directly control forward/backward or is a direct gender indicator.
    // Let's assume it's gender as per common bazi library conventions.
    // The library's own example: `eightChar.getYun(0)` (順行) and `eightChar.getYun(1)` (逆行)
    // This is confusing. Let's assume the parameter is a number (0 or 1) and its meaning (gender or direction)
    // will be handled by the calling code in baziCalc.ts based on actual library behavior.
    // For typing, we'll allow 0 or 1.
    getYun(genderOrDirection: 0 | 1, sect?: number): YunInstance;
  }
  const EightChar: {
    // If EightChar can be instantiated or has static methods, declare here
    // For now, assume it's returned by lunar.getEightChar()
  };
}
