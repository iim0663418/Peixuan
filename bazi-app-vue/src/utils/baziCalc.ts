// baziCalc.ts

// 天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

// 地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

// 五行
export const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export type FiveElement = typeof FIVE_ELEMENTS[number];

// 天干對應五行
export const STEM_TO_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支對應五行
export const BRANCH_TO_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 四柱中的一柱
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: FiveElement;
  branchElement: FiveElement;
}

// 八字排盤結果
export interface BaziResult {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar; // 日柱，日干即為日主
  hourPillar: Pillar;
}

export interface UserInputData {
  solarDate: Date; 
}

export class BaziCalculator {
  public static calculateBazi(input: UserInputData): BaziResult | null {
    if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
      console.error('lunar-javascript 庫或其核心組件 (Solar, Lunar) 未正確加載。');
      return null;
    }
    const jsDate = input.solarDate;
    const year = jsDate.getFullYear();
    const month = jsDate.getMonth() + 1; 
    const day = jsDate.getDate();
    const hour = jsDate.getHours();
    const minute = jsDate.getMinutes();
    const second = jsDate.getSeconds();

    const solarDate = Solar.fromYmdHms(year, month, day, hour, minute, second);
    const lunarDate = solarDate.getLunar(); 

    const yearStem = lunarDate.getYearGan() as HeavenlyStem;
    const yearBranch = lunarDate.getYearZhi() as EarthlyBranch;
    const monthStem = lunarDate.getMonthGan() as HeavenlyStem;
    const monthBranch = lunarDate.getMonthZhi() as EarthlyBranch;
    const dayStem = lunarDate.getDayGan() as HeavenlyStem;
    const dayBranch = lunarDate.getDayZhi() as EarthlyBranch;
    const timeGanZhi = lunarDate.getTimeInGanZhi(); 
    const hourStem = timeGanZhi.substring(0, 1) as HeavenlyStem;
    const hourBranch = timeGanZhi.substring(1, 2) as EarthlyBranch;

    return {
      yearPillar: { stem: yearStem, branch: yearBranch, stemElement: STEM_TO_ELEMENT[yearStem], branchElement: BRANCH_TO_ELEMENT[yearBranch] },
      monthPillar: { stem: monthStem, branch: monthBranch, stemElement: STEM_TO_ELEMENT[monthStem], branchElement: BRANCH_TO_ELEMENT[monthBranch] },
      dayPillar: { stem: dayStem, branch: dayBranch, stemElement: STEM_TO_ELEMENT[dayStem], branchElement: BRANCH_TO_ELEMENT[dayBranch] },
      hourPillar: { stem: hourStem, branch: hourBranch, stemElement: STEM_TO_ELEMENT[hourStem], branchElement: BRANCH_TO_ELEMENT[hourBranch] },
    };
  }
}

export const TEN_GODS = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '七殺', '正官', '偏印', '正印'] as const;
export type TenGod = typeof TEN_GODS[number];

export const STEM_YIN_YANG: Record<HeavenlyStem, boolean> = {
  '甲': true, '乙': false, '丙': true, '丁': false, '戊': true, 
  '己': false, '庚': true, '辛': false, '壬': true, '癸': false,
};

const FIVE_ELEMENT_RELATIONS: Record<FiveElement, Record<FiveElement, number>> = {
  '木': { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 },
  '火': { '火': 0, '土': 1, '金': 2, '水': 3, '木': 4 },
  '土': { '土': 0, '金': 1, '水': 2, '木': 3, '火': 4 },
  '金': { '金': 0, '水': 1, '木': 2, '火': 3, '土': 4 },
  '水': { '水': 0, '木': 1, '火': 2, '土': 3, '金': 4 },
};

export interface TenGodsPillars {
  yearStemGod: TenGod | null; 
  monthStemGod: TenGod | null; 
  dayStemGod: TenGod | null; 
  hourStemGod: TenGod | null; 
}

export class TenGodsCalculator {
  public static getTenGodRelation(dayMaster: HeavenlyStem, otherStem: HeavenlyStem): TenGod {
    const dmElement = STEM_TO_ELEMENT[dayMaster];
    const osElement = STEM_TO_ELEMENT[otherStem];
    const dmYinYang = STEM_YIN_YANG[dayMaster];
    const osYinYang = STEM_YIN_YANG[otherStem];
    const relationType = FIVE_ELEMENT_RELATIONS[dmElement][osElement];
    const isSameYinYang = dmYinYang === osYinYang;

    if (relationType === 0) return isSameYinYang ? '比肩' : '劫財';
    if (relationType === 1) return isSameYinYang ? '食神' : '傷官';
    if (relationType === 2) return isSameYinYang ? '偏財' : '正財';
    if (relationType === 3) return isSameYinYang ? '七殺' : '正官';
    return isSameYinYang ? '偏印' : '正印';
  }

  public static getMainStemTenGods(baziResult: BaziResult): TenGodsPillars {
    const dayMaster = baziResult.dayPillar.stem;
    return {
      yearStemGod: this.getTenGodRelation(dayMaster, baziResult.yearPillar.stem),
      monthStemGod: this.getTenGodRelation(dayMaster, baziResult.monthPillar.stem),
      dayStemGod: this.getTenGodRelation(dayMaster, baziResult.dayPillar.stem),
      hourStemGod: this.getTenGodRelation(dayMaster, baziResult.hourPillar.stem),
    };
  }
}

export interface ElementsDistribution {
  木: number; 火: number; 土: number; 金: number; 水: number;
}

export class FiveElementsAnalyzer {
  public static calculateElementsDistribution(baziResult: BaziResult): ElementsDistribution {
    const distribution: ElementsDistribution = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const pillars = [baziResult.yearPillar, baziResult.monthPillar, baziResult.dayPillar, baziResult.hourPillar];
    for (const pillar of pillars) {
      distribution[pillar.stemElement]++;
      distribution[pillar.branchElement]++;
    }
    return distribution;
  }
}

export interface StartLuckInfo {
  age: number; 
  year: number; 
}

export class FortuneCycleCalculator {
  public static calculateStartLuck(lunarDate: Lunar, gender: 0 | 1): StartLuckInfo | null { 
    // gender: 0 for male, 1 for female (as passed from UserInputForm)
    try {
      if (typeof lunarDate.getEightChar !== 'function') {
        console.warn('FortuneCycleCalculator: lunarDate.getEightChar is not a function.');
        return null;
      }
      const eightChar = lunarDate.getEightChar();
      if (!eightChar || typeof eightChar.getYun !== 'function') {
        console.warn('FortuneCycleCalculator: eightChar is invalid or eightChar.getYun is not a function.');
        return null;
      }

      // Determine direction for getYun parameter (0 for forward, 1 for backward)
      // Heavenly stems: 甲 乙 丙 丁 戊 己 庚 辛 壬 癸
      // Yang stems (true in STEM_YIN_YANG): 甲, 丙, 戊, 庚, 壬 (indices 0, 2, 4, 6, 8)
      // Yin stems (false in STEM_YIN_YANG): 乙, 丁, 己, 辛, 癸 (indices 1, 3, 5, 7, 9)
      const yearStem = lunarDate.getYearGanExact() as HeavenlyStem; // Or eightChar.getYear().substring(0,1)
      const isYangYear = STEM_YIN_YANG[yearStem];

      let directionParam: 0 | 1;
      // 陽男 (gender 0, isYangYear true) -> 順行 (param 0)
      // 陰女 (gender 1, isYangYear false) -> 順行 (param 0)
      if ((gender === 0 && isYangYear) || (gender === 1 && !isYangYear)) {
        directionParam = 0; // 順行
        console.log(`FortuneCycleCalculator: Yang Year (${yearStem}) + Male OR Yin Year (${yearStem}) + Female. Forward (順行). Param for getYun: 0`);
      } else {
        // 陰男 (gender 0, isYangYear false) -> 逆行 (param 1)
        // 陽女 (gender 1, isYangYear true) -> 逆行 (param 1)
        directionParam = 1; // 逆行
        console.log(`FortuneCycleCalculator: Yin Year (${yearStem}) + Male OR Yang Year (${yearStem}) + Female. Backward (逆行). Param for getYun: 1`);
      }
      
      const yun = eightChar.getYun(directionParam); 
      if (!yun) { 
        console.error('FortuneCycleCalculator: eightChar.getYun(direction) did not return a valid Yun instance.');
        return null;
      }
      
      if (typeof yun.getStartYear !== 'function' || typeof yun.getStartSolar !== 'function') {
        console.error('FortuneCycleCalculator: The Yun instance is missing getStartYear or getStartSolar methods.');
        return null;
      }
      
      const startAge = yun.getStartYear(); 
      const startSolarDate = yun.getStartSolar(); 
      
      if (!startSolarDate || typeof startSolarDate.getYear !== 'function') { 
        console.error('FortuneCycleCalculator: Yun instance.getStartSolar() did not return a valid Solar date object with getYear method.');
        return null;
      }

      return {
        age: startAge,
        year: startSolarDate.getYear(),
      };
    } catch (e) {
      console.error(`Error during fortune cycle calculation: lunarDate=${lunarDate.toString()}, gender=${gender}`, e);
      return null;
    }
  }
}

export interface FullBaziAnalysis extends BaziResult {
  mainTenGods?: TenGodsPillars;
  elementsDistribution?: ElementsDistribution;
  startLuckInfo?: StartLuckInfo | null; 
}
