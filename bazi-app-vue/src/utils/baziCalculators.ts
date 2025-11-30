// baziCalculators.ts
// BaZi calculator utilities extracted from legacy baziCalc.ts (2025-11-30)
// These calculators are still used by UserInputForm for local fallback calculations

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  BRANCH_TO_ELEMENT,
  STEMS_BRANCHES,
  type HeavenlyStem,
  type EarthlyBranch,
  type FiveElement,
  type BaziResult,
  type TenGodsPillars,
  type TenGod,
  type ElementsDistribution,
  type StartLuckInfo,
} from '../types/baziTypes';

// 天干陰陽
const STEM_YIN_YANG: Record<HeavenlyStem, boolean> = {
  甲: true,
  乙: false,
  丙: true,
  丁: false,
  戊: true,
  己: false,
  庚: true,
  辛: false,
  壬: true,
  癸: false,
};

// 五行生剋關係
const FIVE_ELEMENT_RELATIONS: Record<
  FiveElement,
  Record<FiveElement, number>
> = {
  木: { 木: 0, 火: 1, 土: 2, 金: 3, 水: 4 },
  火: { 火: 0, 土: 1, 金: 2, 水: 3, 木: 4 },
  土: { 土: 0, 金: 1, 水: 2, 木: 3, 火: 4 },
  金: { 金: 0, 水: 1, 木: 2, 火: 3, 土: 4 },
  水: { 水: 0, 木: 1, 火: 2, 土: 3, 金: 4 },
};

// 大運資料結構
export interface DecennialCycle {
  index: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: FiveElement;
  branchElement: FiveElement;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
}

// 流年資料結構
export interface AnnualLuck {
  year: number;
  age: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: FiveElement;
  branchElement: FiveElement;
}

/**
 * 十神計算器
 */
export class TenGodsCalculator {
  public static getTenGodRelation(
    dayMaster: HeavenlyStem,
    otherStem: HeavenlyStem,
  ): TenGod {
    const dmElement = STEM_TO_ELEMENT[dayMaster];
    const osElement = STEM_TO_ELEMENT[otherStem];
    const dmYinYang = STEM_YIN_YANG[dayMaster];
    const osYinYang = STEM_YIN_YANG[otherStem];
    const relationType = FIVE_ELEMENT_RELATIONS[dmElement][osElement];
    const isSameYinYang = dmYinYang === osYinYang;

    if (relationType === 0) {
      return isSameYinYang ? '比肩' : '劫財';
    }
    if (relationType === 1) {
      return isSameYinYang ? '食神' : '傷官';
    }
    if (relationType === 2) {
      return isSameYinYang ? '偏財' : '正財';
    }
    if (relationType === 3) {
      return isSameYinYang ? '七殺' : '正官';
    }
    return isSameYinYang ? '偏印' : '正印';
  }

  public static getMainStemTenGods(baziResult: BaziResult): TenGodsPillars {
    const dayMaster = baziResult.dayPillar.stem;
    return {
      yearPillar: this.getTenGodRelation(
        dayMaster,
        baziResult.yearPillar.stem,
      ),
      monthPillar: this.getTenGodRelation(
        dayMaster,
        baziResult.monthPillar.stem,
      ),
      dayPillar: this.getTenGodRelation(dayMaster, baziResult.dayPillar.stem),
      hourPillar: this.getTenGodRelation(
        dayMaster,
        baziResult.hourPillar.stem,
      ),
    };
  }
}

/**
 * 五行分析器
 */
export class FiveElementsAnalyzer {
  public static calculateElementsDistribution(
    baziResult: BaziResult,
  ): ElementsDistribution {
    const distribution: ElementsDistribution = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0,
    };
    const pillars = [
      baziResult.yearPillar,
      baziResult.monthPillar,
      baziResult.dayPillar,
      baziResult.hourPillar,
    ];
    for (const pillar of pillars) {
      distribution[pillar.stemElement]++;
      distribution[pillar.branchElement]++;
    }
    return distribution;
  }
}

/**
 * 大運流年計算器
 */
export class FortuneCycleCalculator {
  /**
   * 計算起運時間點
   */
  public static calculateStartLuck(
    lunarDate: Lunar,
    gender: 0 | 1,
  ): StartLuckInfo | null {
    try {
      if (typeof lunarDate.getEightChar !== 'function') {
        console.warn(
          'FortuneCycleCalculator: lunarDate.getEightChar is not a function.',
        );
        return null;
      }
      const eightChar = lunarDate.getEightChar();
      if (!eightChar || typeof eightChar.getYun !== 'function') {
        console.warn(
          'FortuneCycleCalculator: eightChar is invalid or eightChar.getYun is not a function.',
        );
        return null;
      }

      const yearStem = lunarDate.getYearGanExact() as HeavenlyStem;
      const isYangYear = STEM_YIN_YANG[yearStem];

      let directionParam: 0 | 1;
      if ((gender === 0 && isYangYear) || (gender === 1 && !isYangYear)) {
        directionParam = 0; // 順行
      } else {
        directionParam = 1; // 逆行
      }

      const yun = eightChar.getYun(directionParam);
      if (!yun) {
        console.error(
          'FortuneCycleCalculator: eightChar.getYun(direction) did not return a valid Yun instance.',
        );
        return null;
      }

      if (
        typeof yun.getStartYear !== 'function' ||
        typeof yun.getStartSolar !== 'function'
      ) {
        console.error(
          'FortuneCycleCalculator: The Yun instance is missing getStartYear or getStartSolar methods.',
        );
        return null;
      }

      const startAge = yun.getStartYear();
      const startSolarDate = yun.getStartSolar();

      if (!startSolarDate || typeof startSolarDate.getYear !== 'function') {
        console.error(
          'FortuneCycleCalculator: Yun instance.getStartSolar() did not return a valid Solar date object with getYear method.',
        );
        return null;
      }

      return {
        age: startAge,
        year: startSolarDate.getYear(),
      };
    } catch (e) {
      console.error(
        `Error during fortune cycle calculation: lunarDate=${lunarDate.toString()}, gender=${gender}`,
        e,
      );
      return null;
    }
  }

  /**
   * 計算大運序列
   */
  public static calculateDecennialCycles(
    baziResult: BaziResult,
    birthDate: Date,
    gender: 0 | 1,
    count = 8,
  ): DecennialCycle[] {
    try {
      // 獲取起運資訊
      const solarDate = Solar.fromDate(birthDate);
      const lunarDate = solarDate.getLunar();
      const startLuckInfo = this.calculateStartLuck(lunarDate, gender);

      if (!startLuckInfo) {
        throw new Error('無法計算起運時間');
      }

      // 獲取月柱作為大運起點
      const monthStem = baziResult.monthPillar.stem;
      const monthBranch = baziResult.monthPillar.branch;

      // 月柱索引
      const monthStemIndex = HEAVENLY_STEMS.indexOf(monthStem);
      const monthBranchIndex = EARTHLY_BRANCHES.indexOf(monthBranch);

      // 大運方向: 男陽女陰順排, 男陰女陽逆排
      const yearStem = baziResult.yearPillar.stem;
      const isYangYear = STEM_YIN_YANG[yearStem];
      const isForward =
        (gender === 0 && isYangYear) || (gender === 1 && !isYangYear);

      const decennialCycles: DecennialCycle[] = [];

      for (let i = 0; i < count; i++) {
        // 計算大運干支索引
        let stemIndex = monthStemIndex;
        let branchIndex = monthBranchIndex;

        if (isForward) {
          // 順行
          stemIndex = (monthStemIndex + i) % HEAVENLY_STEMS.length;
          branchIndex = (monthBranchIndex + i) % EARTHLY_BRANCHES.length;
        } else {
          // 逆行
          stemIndex =
            (monthStemIndex - i + HEAVENLY_STEMS.length) %
            HEAVENLY_STEMS.length;
          branchIndex =
            (monthBranchIndex - i + EARTHLY_BRANCHES.length) %
            EARTHLY_BRANCHES.length;
        }

        const stem = HEAVENLY_STEMS[stemIndex];
        const branch = EARTHLY_BRANCHES[branchIndex];

        // 計算開始和結束年齡
        const startAge = startLuckInfo.age + i * 10;
        const endAge = startAge + 9;

        // 計算開始和結束年份
        const startYear = startLuckInfo.year + i * 10;
        const endYear = startYear + 9;

        decennialCycles.push({
          index: i + 1,
          stem,
          branch,
          stemElement: STEM_TO_ELEMENT[stem],
          branchElement: BRANCH_TO_ELEMENT[branch],
          startAge,
          endAge,
          startYear,
          endYear,
        });
      }

      return decennialCycles;
    } catch (error) {
      console.error('計算大運錯誤:', error);
      return [];
    }
  }

  /**
   * 計算流年
   */
  public static calculateAnnualLuck(
    birthDate: Date,
    startYear: number,
    years = 30,
  ): AnnualLuck[] {
    try {
      const birthYear = birthDate.getFullYear();
      const annualLuck: AnnualLuck[] = [];

      for (let i = 0; i < years; i++) {
        const year = startYear + i;
        const age = year - birthYear + 1; // 虛歲年齡

        // 計算流年天干地支
        // 六十甲子循環，從1984年甲子年開始推算
        const index = (year - 1984 + 60) % 60;
        const stemBranch = STEMS_BRANCHES[index];
        const stem = stemBranch[0] as HeavenlyStem;
        const branch = stemBranch[1] as EarthlyBranch;

        annualLuck.push({
          year,
          age,
          stem,
          branch,
          stemElement: STEM_TO_ELEMENT[stem],
          branchElement: BRANCH_TO_ELEMENT[branch],
        });
      }

      return annualLuck;
    } catch (error) {
      console.error('計算流年錯誤:', error);
      return [];
    }
  }
}
