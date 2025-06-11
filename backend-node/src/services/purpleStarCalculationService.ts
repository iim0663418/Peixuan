// backend-node/src/services/purpleStarCalculationService.ts
// 紫微斗數計算服務

import { 
  BirthInfo, 
  PurpleStarChart, 
  Palace, 
  Star, 
  DaXianInfo, 
  XiaoXianInfo,
  LiuNianTaiSuiInfo,
  LunarInfo 
} from '../types/purpleStarTypes';

type TransformationType = '祿' | '權' | '科' | '忌';

interface FourTransformations {
  lu: string; // 化祿的星曜名稱
  quan: string; // 化權的星曜名稱
  ke: string; // 化科的星曜名稱
  ji: string; // 化忌的星曜名稱
}

export class PurpleStarCalculationService {
  private readonly ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  private readonly GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  private readonly PALACE_NAMES_ORDERED = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
    '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
  ];
  private readonly ZIWEI_STAR_SYSTEM = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
  private readonly TIANFU_STAR_SYSTEM = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
  private readonly FOUR_TRANSFORMATIONS_MAP: Record<string, FourTransformations> = {
    '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
    '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
    '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
    '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
    '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
    '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
    '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
    '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
    '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
    '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
  };

  private birthInfo: BirthInfo;
  private lunarInfo: LunarInfo;
  private solarDate: Date;
  private mingPalaceStdIndex: number = 0;
  private shenPalaceStdIndex: number = 0;
  private fiveElementsBureau: string | undefined;
  private fiveElementsBureauNumber: number | undefined;
  private mingPalaceGan: string = '';

  constructor(birthInfo: BirthInfo, lunarInfo: LunarInfo) {
    this.birthInfo = birthInfo;
    this.lunarInfo = lunarInfo;
    this.solarDate = this.birthInfo.solarDate;
    
    // 使用前端傳來的農曆資訊進行初始化
    this.initializeCalculation();
  }

  private initializeCalculation(): void {
    try {
      console.log('開始初始化紫微斗數計算...', { lunarInfo: this.lunarInfo });
      
      // 計算基本屬性
      console.log('Step 1: 計算命宮身宮位置...');
      const palacesInfo = this.calculateMingAndShenPalaceIndices();
      this.mingPalaceStdIndex = palacesInfo.mingPalaceStdIndex;
      this.shenPalaceStdIndex = palacesInfo.shenPalaceStdIndex;
      console.log('命宮身宮計算完成:', palacesInfo);
      
      console.log('Step 2: 計算命宮天干...');
      this.mingPalaceGan = this.getMingPalaceGan();
      console.log('命宮天干計算完成:', this.mingPalaceGan);
      
      console.log('Step 3: 計算五行局...');
      this.fiveElementsBureau = this.calculateFiveElementsBureau();
      console.log('五行局計算完成:', this.fiveElementsBureau);
      
      console.log('Step 4: 提取五行局數字...');
      this.fiveElementsBureauNumber = this.extractBureauNumber(this.fiveElementsBureau);
      console.log('五行局數字提取完成:', this.fiveElementsBureauNumber);
      
      console.log('紫微斗數計算初始化完成:', {
        mingPalaceStdIndex: this.mingPalaceStdIndex,
        shenPalaceStdIndex: this.shenPalaceStdIndex,
        mingPalaceGan: this.mingPalaceGan,
        fiveElementsBureau: this.fiveElementsBureau,
        fiveElementsBureauNumber: this.fiveElementsBureauNumber,
        lunarInfo: this.lunarInfo
      });
      
    } catch (error) {
      console.error('Error initializing purple star calculation:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`無法初始化紫微斗數計算: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async calculateChart(options: {
    includeMajorCycles?: boolean;
    includeMinorCycles?: boolean;
    includeAnnualCycles?: boolean;
    maxAge?: number;
  } = {}): Promise<PurpleStarChart> {
    try {
      const palaces = this.calculatePalaces(this.mingPalaceStdIndex);
      const ziweiLocationIndex = this.locateZiWeiStar();
      
      // 計算主星和輔星
      this.calculateMainStars(palaces, ziweiLocationIndex);
      this.calculateAuxiliaryStars(palaces);
      
      // 應用四化
      this.applyFourTransformations(palaces, this.mingPalaceGan);
      
      // 計算生命週期（如果需要）
      const daXian = options.includeMajorCycles ? 
        this.calculateDaXian(palaces, options.maxAge || 100) : undefined;
      const xiaoXian = options.includeMinorCycles ? 
        this.calculateXiaoXian(palaces, options.maxAge || 100) : undefined;
      const liuNianTaiSui = options.includeAnnualCycles ?
        this.calculateLiuNianTaiSui(palaces, options.maxAge || 100) : undefined;

      return {
        palaces,
        mingPalaceIndex: this.mingPalaceStdIndex,
        shenPalaceIndex: this.shenPalaceStdIndex,
        fiveElementsBureau: this.fiveElementsBureau,
        daXian,
        xiaoXian,
        liuNianTaiSui
      };
    } catch (error) {
      console.error('Error calculating Purple Star chart:', error);
      throw new Error('計算紫微斗數命盤時發生錯誤');
    }
  }

  private getChineseHourZhiIndex(): number {
    return this.ZHI_NAMES.indexOf(this.lunarInfo.timeZhi);
  }

  private calculateMingAndShenPalaceIndices(): { mingPalaceStdIndex: number; shenPalaceStdIndex: number } {
    const YIN_PALACE_STD_INDEX = 2;
    const lunarMonth = this.lunarInfo.month;
    const chineseHourZhiIndex = this.getChineseHourZhiIndex();
    
    let mingPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) - chineseHourZhiIndex);
    mingPalaceStdIndex = (mingPalaceStdIndex % 12 + 12) % 12;
    
    let shenPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) + chineseHourZhiIndex) % 12;
    
    return { mingPalaceStdIndex, shenPalaceStdIndex };
  }

  private getMingPalaceGan(): string {
    const yearGan = this.lunarInfo.yearGan;
    let yinPalaceGan: string;
    
    if (['甲', '己'].includes(yearGan)) yinPalaceGan = '丙';
    else if (['乙', '庚'].includes(yearGan)) yinPalaceGan = '戊';
    else if (['丙', '辛'].includes(yearGan)) yinPalaceGan = '庚';
    else if (['丁', '壬'].includes(yearGan)) yinPalaceGan = '壬';
    else if (['戊', '癸'].includes(yearGan)) yinPalaceGan = '甲';
    else throw new Error('Invalid year Gan');
    
    const ganIndex = (gan: string) => this.GAN_NAMES.indexOf(gan);
    const yinPalaceGanIndex = ganIndex(yinPalaceGan);
    const mingPalaceZhiIndex = this.mingPalaceStdIndex;
    const yinPalaceStdIndex = 2;
    
    let diff = (mingPalaceZhiIndex - yinPalaceStdIndex + 12) % 12;
    const mingPalaceGanIndex = (yinPalaceGanIndex + diff) % 10;
    
    return this.GAN_NAMES[mingPalaceGanIndex];
  }

  private calculateFiveElementsBureau(): string {
    const mingPalaceGan = this.mingPalaceGan;
    const mingPalaceZhi = this.ZHI_NAMES[this.mingPalaceStdIndex];
    const mingGanZhi = mingPalaceGan + mingPalaceZhi;
    
    if (["甲子", "乙丑", "壬申", "癸酉", "庚辰", "辛巳", "甲午", "乙未", "庚戌", "辛亥", "壬寅", "癸卯"].includes(mingGanZhi)) return "金四局";
    if (["丙寅", "丁卯", "甲戌", "乙亥", "戊子", "己丑", "丙申", "丁酉", "甲辰", "乙巳"].includes(mingGanZhi)) return "火六局";
    if (["戊辰", "己巳", "壬午", "癸未", "戊戌", "己亥", "壬子", "癸丑"].includes(mingGanZhi)) return "木三局";
    if (["庚午", "辛未", "戊寅", "己卯", "丙戌", "丁亥", "戊申", "己酉", "庚子", "辛丑"].includes(mingGanZhi)) return "土五局";
    if (["丙子", "丁丑", "甲申", "乙酉", "壬辰", "癸巳", "丙午", "丁未"].includes(mingGanZhi)) return "水二局";
    
    console.warn(`未找到命宮干支 ${mingGanZhi} 的五行局，使用默認水二局`);
    return "水二局"; // 提供默認值而不是"未知局"
  }

  private extractBureauNumber(bureau: string | undefined): number | undefined {
    if (!bureau) {
      console.log('extractBureauNumber: bureau is undefined or null');
      return undefined;
    }
    
    console.log('extractBureauNumber: 輸入五行局:', bureau);
    
    // 中文數字對應表
    const chineseNumberMap: Record<string, number> = {
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6
    };
    
    // 先嘗試匹配阿拉伯數字
    const arabicMatch = bureau.match(/\d+/);
    if (arabicMatch) {
      const number = parseInt(arabicMatch[0], 10);
      console.log('extractBureauNumber: 找到阿拉伯數字:', number);
      return number;
    }
    
    // 嘗試匹配中文數字
    for (const [chinese, arabic] of Object.entries(chineseNumberMap)) {
      if (bureau.includes(chinese)) {
        console.log('extractBureauNumber: 找到中文數字:', chinese, '對應:', arabic);
        return arabic;
      }
    }
    
    console.log('extractBureauNumber: 未找到任何數字');
    return undefined;
  }

  private locateZiWeiStar(): number {
    const lunarDay = this.lunarInfo.day;
    const bureauNum = this.fiveElementsBureauNumber;
    
    if (bureauNum === undefined) throw new Error("五行局數字未定義");
    
    let quotient = Math.floor(lunarDay / bureauNum);
    let remainder = lunarDay % bureauNum;
    let n = 0;
    
    if (remainder !== 0) {
      n = bureauNum - remainder;
      quotient = Math.floor((lunarDay + n) / bureauNum);
    }
    
    const YIN_PALACE_STD_INDEX = 2;
    let ziweiPalaceStdIndex = (YIN_PALACE_STD_INDEX + quotient - 1 + 12) % 12;
    
    if (n !== 0) {
      if (n % 2 === 1) ziweiPalaceStdIndex = (ziweiPalaceStdIndex - 1 + 12) % 12;
      else ziweiPalaceStdIndex = (ziweiPalaceStdIndex + 1) % 12;
    }
    
    return ziweiPalaceStdIndex;
  }

  private calculatePalaces(mingPalaceStdIndex: number): Palace[] {
    const palaces: Palace[] = [];
    
    for (let i = 0; i < 12; i++) {
      const currentPalaceStdZhiIndex = (mingPalaceStdIndex - i + 12) % 12;
      palaces.push({
        name: this.PALACE_NAMES_ORDERED[i],
        index: currentPalaceStdZhiIndex,
        zhi: this.ZHI_NAMES[currentPalaceStdZhiIndex],
        stars: []
      });
    }
    
    return palaces;
  }

  private placeStar(palaces: Palace[], starName: string, starType: 'main' | 'auxiliary' | 'minor', palaceIndex: number): Star {
    const star: Star = {
      name: starName,
      type: starType,
      palaceIndex,
      transformations: []
    };
    
    const palace = palaces.find(p => p.index === palaceIndex);
    if (palace) {
      palace.stars.push(star);
    } else {
      console.error(`無法找到地支索引為 ${palaceIndex} 的宮位來安放 ${starName} 星`);
    }
    
    return star;
  }

  private calculateMainStars(palaces: Palace[], ziweiPalaceStdIndex: number): Star[] {
    const allMainStars: Star[] = [];
    
    // 紫微星系
    const ziweiSystemOffsets = [0, -1, -3, -4, -5, -8];
    for (let i = 0; i < this.ZIWEI_STAR_SYSTEM.length; i++) {
      const starName = this.ZIWEI_STAR_SYSTEM[i];
      const palaceIndex = (ziweiPalaceStdIndex + ziweiSystemOffsets[i] + 12) % 12;
      allMainStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    // 天府星系
    const tianfuLocationMap: Record<number, number> = {
      [2]: 2, [8]: 8, [1]: 3, [3]: 1, [0]: 4, [4]: 0,
      [11]: 5, [5]: 11, [10]: 6, [6]: 10, [9]: 7, [7]: 9
    };
    
    const tianfuPalaceStdIndex = tianfuLocationMap[ziweiPalaceStdIndex];
    if (tianfuPalaceStdIndex === undefined) throw new Error("無法定位天府星");
    
    const tianfuSystemOffsets = [0, 1, 2, 3, 4, 5, 6, 10];
    for (let i = 0; i < this.TIANFU_STAR_SYSTEM.length; i++) {
      const starName = this.TIANFU_STAR_SYSTEM[i];
      const palaceIndex = (tianfuPalaceStdIndex + tianfuSystemOffsets[i]) % 12;
      allMainStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    return allMainStars;
  }

  private calculateAuxiliaryStars(palaces: Palace[]): Star[] {
    const auxiliaryStars: Star[] = [];
    const lunarMonth = this.lunarInfo.month;
    const chineseHourZhiIndex = this.getChineseHourZhiIndex();
    
    // 左輔：正月起辰宮，順行數至生月安左輔
    const CHEN_PALACE_STD_INDEX = 4; // 辰宮索引
    const zuoFuPalaceIndex = (CHEN_PALACE_STD_INDEX + (lunarMonth - 1)) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '左輔', 'auxiliary', zuoFuPalaceIndex));
    
    // 右弼：正月起戌宮，逆行數至生月安右弼
    const XU_PALACE_STD_INDEX = 10; // 戌宮索引
    const youBiPalaceIndex = (XU_PALACE_STD_INDEX - (lunarMonth - 1) + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '右弼', 'auxiliary', youBiPalaceIndex));
    
    // 文昌：子時戌上起文昌，逆行至生時安
    // 將時辰轉換為從子時開始的相對索引
    const ZI_TIME_INDEX = 0; // 子時索引
    const timeIndexFromZi = (chineseHourZhiIndex - ZI_TIME_INDEX + 12) % 12;
    const wenChangPalaceIndex = (XU_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文昌', 'auxiliary', wenChangPalaceIndex));
    
    // 文曲：辰上起，順行至生時安
    const wenQuPalaceIndex = (CHEN_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文曲', 'auxiliary', wenQuPalaceIndex));
    
    // 天空（地空）：亥宮起子時安天空，逆行排時
    const HAI_PALACE_STD_INDEX = 11; // 亥宮索引
    const tianKongPalaceIndex = (HAI_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '天空', 'auxiliary', tianKongPalaceIndex));
    
    // 地劫：亥宮起子時安地劫，順行排時
    const diJiePalaceIndex = (HAI_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '地劫', 'auxiliary', diJiePalaceIndex));
    
    return auxiliaryStars;
  }

  private applyFourTransformations(palaces: Palace[], targetGan: string): void {
    const transformations = this.FOUR_TRANSFORMATIONS_MAP[targetGan];
    if (!transformations) {
      console.warn(`找不到天干 ${targetGan} 的四化表`);
      return;
    }
    
    const applyTransform = (starName: string, transformType: TransformationType) => {
      palaces.forEach(palace => {
        palace.stars.forEach(star => {
          if (star.name === starName) {
            if (!star.transformations) star.transformations = [];
            star.transformations.push(transformType);
          }
        });
      });
    };
    
    applyTransform(transformations.lu, '祿');
    applyTransform(transformations.quan, '權');
    applyTransform(transformations.ke, '科');
    applyTransform(transformations.ji, '忌');
  }

  private isGanYang(gan: string): boolean {
    const yangGans = ['甲', '丙', '戊', '庚', '壬'];
    return yangGans.includes(gan);
  }

  private calculateDaXian(palaces: Palace[], maxAge: number = 120): DaXianInfo[] {
    const daXianList: DaXianInfo[] = [];
    
    if (this.fiveElementsBureauNumber === undefined) {
      throw new Error("五行局數字未定義，無法計算大限");
    }
    
    const startAge = this.fiveElementsBureauNumber;
    const yearGan = this.lunarInfo.yearGan;
    const isYearGanYang = this.isGanYang(yearGan);
    const isMale = this.birthInfo.gender === 'male';
    const isForward = (isYearGanYang && isMale) || (!isYearGanYang && !isMale);
    
    let currentAge = startAge;
    let palaceOrderOffset = 0;
    
    while (currentAge <= maxAge) {
      let currentMingPalaceRelativeIndex = 0;
      let daXianPalaceOrderIndex = 0;
      
      if (isForward) {
        daXianPalaceOrderIndex = (currentMingPalaceRelativeIndex + palaceOrderOffset + 12) % 12;
      } else {
        daXianPalaceOrderIndex = (currentMingPalaceRelativeIndex - palaceOrderOffset + 12) % 12;
      }
      
      const daXianPalace = palaces.find(p => p.name === this.PALACE_NAMES_ORDERED[daXianPalaceOrderIndex]);
      if (!daXianPalace) {
        console.error(`無法找到大限宮位: order index ${daXianPalaceOrderIndex}`);
        break;
      }
      
      daXianList.push({
        startAge: currentAge,
        endAge: currentAge + 9,
        palaceName: daXianPalace.name,
        palaceZhi: this.ZHI_NAMES[daXianPalace.index],
        palaceIndex: daXianPalace.index,
      });
      
      currentAge += 10;
      palaceOrderOffset++;
    }
    
    return daXianList;
  }

  private calculateXiaoXian(palaces: Palace[], maxAge: number = 100): XiaoXianInfo[] {
    const xiaoXianList: XiaoXianInfo[] = [];
    const yearZhi = this.lunarInfo.yearZhi;
    const isMale = this.birthInfo.gender === 'male';
    
    let startPalaceZhiIndex: number;
    
    // 口訣：寅午戌局從辰起；申子辰局從戌起；巳酉丑局從未起；亥卯未局從丑起。
    if (['寅', '午', '戌'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('辰');
    else if (['申', '子', '辰'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('戌');
    else if (['巳', '酉', '丑'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('未');
    else if (['亥', '卯', '未'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('丑');
    else throw new Error(`無法識別的年支用於小限起點: ${yearZhi}`);
    
    for (let age = 1; age <= maxAge; age++) {
      let currentPalaceZhiIndex: number;
      
      if (isMale) {
        currentPalaceZhiIndex = (startPalaceZhiIndex + (age - 1) + 12) % 12;
      } else {
        currentPalaceZhiIndex = (startPalaceZhiIndex - (age - 1) + 12) % 12;
      }
      
      const xiaoXianPalace = palaces.find(p => p.index === currentPalaceZhiIndex);
      if (!xiaoXianPalace) {
        console.error(`無法找到小限宮位: age ${age}, zhi index ${currentPalaceZhiIndex}`);
        continue;
      }
      
      xiaoXianList.push({
        age: age,
        palaceName: xiaoXianPalace.name,
        palaceZhi: this.ZHI_NAMES[currentPalaceZhiIndex],
        palaceIndex: currentPalaceZhiIndex,
      });
    }
    
    return xiaoXianList;
  }

  private calculateLiuNianTaiSui(palaces: Palace[], maxAge: number = 100): LiuNianTaiSuiInfo[] {
    const liuNianTaiSuiList: LiuNianTaiSuiInfo[] = [];
    const birthYear = this.lunarInfo.year;
    const birthYearZhi = this.lunarInfo.yearZhi;
    
    // 太歲的起始位置就是出生年的地支位置
    const startZhiIndex = this.ZHI_NAMES.indexOf(birthYearZhi);
    if (startZhiIndex === -1) {
      throw new Error(`無法找到出生年地支: ${birthYearZhi}`);
    }
    
    for (let age = 1; age <= maxAge; age++) {
      const currentYear = birthYear + age - 1;
      
      // 流年太歲每年順行一位
      const currentTaiSuiZhiIndex = (startZhiIndex + age - 1) % 12;
      const currentTaiSuiZhi = this.ZHI_NAMES[currentTaiSuiZhiIndex];
      
      // 計算該年的天干
      const yearGanIndex = this.GAN_NAMES.indexOf(this.lunarInfo.yearGan);
      const currentYearGanIndex = (yearGanIndex + age - 1) % 10;
      const currentYearGan = this.GAN_NAMES[currentYearGanIndex];
      
      // 組合干支
      const ganZhi = currentYearGan + currentTaiSuiZhi;
      
      // 找到對應的宮位
      const taiSuiPalace = palaces.find(p => p.index === currentTaiSuiZhiIndex);
      if (!taiSuiPalace) {
        console.error(`無法找到流年太歲宮位: age ${age}, zhi index ${currentTaiSuiZhiIndex}`);
        continue;
      }
      
      liuNianTaiSuiList.push({
        year: currentYear,
        ganZhi: ganZhi,
        palaceName: taiSuiPalace.name,
        palaceZhi: currentTaiSuiZhi,
        palaceIndex: currentTaiSuiZhiIndex,
      });
    }
    
    return liuNianTaiSuiList;
  }
}
