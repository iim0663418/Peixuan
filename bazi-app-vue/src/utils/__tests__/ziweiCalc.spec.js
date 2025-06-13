import { describe, it, expect, beforeEach } from 'vitest';
import PurpleStarCalculator from '../ziweiCalc';
// Mock a simplified global Lunar and Solar object for testing,
// as the actual lunar.min.js might not be available in the test environment
// or we want to control its behavior for predictable tests.
// @ts-ignore
global.Solar = class {
    year;
    month;
    day;
    hour;
    minute;
    second;
    constructor(year, month, day, hour = 0, minute = 0, second = 0) {
        this.year = year;
        this.month = month; // 1-12
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }
    getLunar() {
        // This is a mock. For real tests, you'd want this to return a mock Lunar object
        // that behaves predictably based on the Solar input.
        // For now, let's return a fixed Lunar date for a specific Solar date.
        if (this.year === 1990 && this.month === 2 && this.day === 20 && this.hour === 10) {
            // Example: 1990-02-20 10:30:00 Solar -> 1990 (庚午) 正月 (戊寅) 廿五 (壬辰) 巳時 (乙巳)
            return new global.Lunar(1990, 1, 25, 10, 30, 0, false, '庚午', '戊寅', '壬辰', '乙巳');
        }
        // Default mock for other dates
        return new global.Lunar(this.year, this.month, this.day, this.hour, this.minute, this.second, false, '甲子', '丙寅', '戊辰', '庚午');
    }
};
// @ts-ignore
global.Lunar = class {
    _year;
    _month;
    _day;
    _hour;
    _yearGanzhi;
    _monthGanzhi;
    _dayGanzhi;
    _timeGanzhi;
    _isLeap;
    constructor(year, month, day, hour, minute, second, isLeap, yg, mg, dg, tg) {
        this._year = year;
        this._month = month;
        this._day = day;
        this._hour = hour; // Assuming Lunar object stores hour from Solar
        this._isLeap = isLeap;
        this._yearGanzhi = yg;
        this._monthGanzhi = mg;
        this._dayGanzhi = dg;
        this._timeGanzhi = tg;
    }
    getYear() { return this._year; }
    getMonth() { return this._month; }
    getDay() { return this._day; }
    getHour() { return this._hour; } // Provided by Solar conversion
    getYearInGanZhi() { return this._yearGanzhi; }
    getMonthInGanZhi() { return this._monthGanzhi; }
    getDayInGanZhi() { return this._dayGanzhi; }
    getTimeInGanZhi() { return this._timeGanzhi; } // Assumes it's pre-calculated
    getYearGan() { return this._yearGanzhi.charAt(0); }
    getTimeZhi() { return this._timeGanzhi.charAt(1); }
};
// @ts-ignore
global.LunarMonth = {
    fromYm: (year, month) => {
        // Mock implementation
        return {
            getYear: () => year,
            getMonth: () => month,
            isLeap: () => {
                // Example: Assume 1990's lunar April is leap for testing
                return year === 1990 && month === 4;
            }
        };
    }
};
describe('PurpleStarCalculator', () => {
    let calculator;
    const birthInfoMale = {
        solarDate: new Date('1990-02-20 10:30:00'), // 公曆 庚午年 正月 廿五日 巳時
        gender: 'male',
    };
    beforeEach(() => {
        calculator = new PurpleStarCalculator(birthInfoMale);
    });
    it('should correctly convert solar to lunar date in constructor', () => {
        // Based on the mock, for 1990-02-20 10:30:00
        // Lunar: 1990 (庚午) 正月 (戊寅) 廿五 (壬辰) 巳時 (乙巳)
        // @ts-ignore
        const lunarDate = calculator.lunarDate;
        expect(lunarDate.getYear()).toBe(1990);
        expect(lunarDate.getMonth()).toBe(1); // 正月
        expect(lunarDate.getDay()).toBe(25); // 廿五
        // Hour might be tricky depending on how lunar-javascript handles it.
        // Our mock Lunar directly stores the solar hour.
        expect(lunarDate.getHour()).toBe(10);
        expect(lunarDate.getYearInGanZhi()).toBe('庚午');
        expect(lunarDate.getMonthInGanZhi()).toBe('戊寅');
        expect(lunarDate.getDayInGanZhi()).toBe('壬辰');
        expect(lunarDate.getTimeInGanZhi()).toBe('乙巳'); // 巳時
    });
    it('should correctly calculate Ming and Shen palace indices', () => {
        // For 1990-02-20 10:30:00 (庚午年 正月 廿五日 巳時)
        // LunarMonth = 1 (正月), ChineseHourZhiIndex for 巳時 (9-11am) is 5 (辰=4, 巳=5)
        // ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']; (巳 is index 5)
        // YIN_PALACE_STD_INDEX = 2 (寅)
        // Ming: (2 + (1-1) - 5 + 12) % 12 = (2 - 5 + 12) % 12 = 9 (酉)
        // Shen: (2 + (1-1) + 5) % 12 = (2 + 5) % 12 = 7 (未)
        // @ts-ignore
        expect(calculator.mingPalaceStdIndex).toBe(9); // 酉宮
        // @ts-ignore
        expect(calculator.shenPalaceStdIndex).toBe(7); // 未宮
    });
    it('should correctly calculate Ming Palace Gan', () => {
        // 1990 is 庚午年. Year Gan is 庚.
        // Ming Palace is 酉 (index 9).
        // 庚年 -> 寅宮起戊寅 (戊 is GAN_NAMES[4])
        // 寅宮 (index 2) -> 酉宮 (index 9). Diff = 9 - 2 = 7.
        // Ming Palace Gan Index = (4 + 7) % 10 = 11 % 10 = 1 (乙)
        // @ts-ignore
        expect(calculator.mingPalaceGan).toBe('乙');
    });
    it('should correctly calculate Five Elements Bureau', () => {
        // Ming Palace GanZhi: 乙酉
        // 乙酉 is 泉中水 -> 水二局
        // @ts-ignore
        expect(calculator.fiveElementsBureau).toBe('水二局');
        // @ts-ignore
        expect(calculator.fiveElementsBureauNumber).toBe(2);
    });
    it('should correctly locate ZiWei Star', () => {
        // LunarDay = 25, BureauNum = 2 (水二局)
        // quotient = floor(25/2) = 12. remainder = 1.
        // n = 2 - 1 = 1.
        // new quotient = floor((25+1)/2) = 13.
        // YIN_PALACE_STD_INDEX = 2.
        // ziweiPalaceStdIndex = (2 + 13 - 1 + 12) % 12 = (14+12)%12 = 26%12 = 2 (寅)
        // n=1 (奇), so 逆退1宮: (2 - 1 + 12) % 12 = 1 (丑)
        // @ts-ignore
        const ziweiLocation = calculator.locateZiWeiStar();
        expect(ziweiLocation).toBe(1); // 丑宮
    });
    it('should generate a chart with 12 palaces', () => {
        const chart = calculator.generateChart();
        expect(chart.palaces.length).toBe(12);
        // Check if palace names are correctly ordered from Ming palace
        // Ming palace is 酉 (index 9)
        // Palaces should be: 命(酉), 兄(申), 夫(未), 子(午), 財(巳), 疾(辰), 遷(卯), 僕(寅), 官(丑), 田(子), 福(亥), 父(戌)
        const expectedPalaceOrder = [
            { name: '命宮', zhi: '酉' }, { name: '兄弟宮', zhi: '申' },
            { name: '夫妻宮', zhi: '未' }, { name: '子女宮', zhi: '午' },
            { name: '財帛宮', zhi: '巳' }, { name: '疾厄宮', zhi: '辰' },
            { name: '遷移宮', zhi: '卯' }, { name: '交友宮', zhi: '寅' },
            { name: '官祿宮', zhi: '丑' }, { name: '田宅宮', zhi: '子' },
            { name: '福德宮', zhi: '亥' }, { name: '父母宮', zhi: '戌' },
        ];
        chart.palaces.forEach((palace, i) => {
            expect(palace.name).toBe(expectedPalaceOrder[i].name);
            // @ts-ignore
            expect(palace.zhi).toBe(expectedPalaceOrder[i].zhi);
        });
    });
    // Add more tests for main stars, auxiliary stars, four transformations, and life cycles
    // as their implementation becomes more complete.
});
//# sourceMappingURL=ziweiCalc.spec.js.map