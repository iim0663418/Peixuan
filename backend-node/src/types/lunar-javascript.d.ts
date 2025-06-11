// backend-node/src/types/lunar-javascript.d.ts
// lunar-javascript 型別定義文件

declare module 'lunar-javascript' {
  export class Solar {
    constructor(year: number, month: number, day: number, hour?: number, minute?: number, second?: number);
    
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    
    getLunar(): Lunar;
    toString(): string;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    
    getYearGanIndex(): number;
    getYearZhiIndex(): number;
    getMonthGanIndex(): number;
    getMonthZhiIndex(): number;
    getDayGanIndex(): number;
    getDayZhiIndex(): number;
    getTimeGanIndex(): number;
    getTimeZhiIndex(): number;
    
    getSolar(): Solar;
    toString(): string;
    toFullString(): string;
  }

  export class LunarMonth {
    constructor(year: number, month: number, dayCount: number, firstJulianDay: number);
    
    getYear(): number;
    getMonth(): number;
    getDayCount(): number;
    getFirstJulianDay(): number;
    
    toString(): string;
  }

  export class LunarYear {
    constructor(year: number);
    
    getYear(): number;
    getMonths(): LunarMonth[];
    getMonth(month: number): LunarMonth | null;
    
    toString(): string;
  }
}
