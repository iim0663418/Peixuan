// baziCalc.ts

// 天干
export const HEAVENLY_STEMS = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
] as const;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

// 地支
export const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

// 六十干支
export const STEMS_BRANCHES = [
  '甲子',
  '乙丑',
  '丙寅',
  '丁卯',
  '戊辰',
  '己巳',
  '庚午',
  '辛未',
  '壬申',
  '癸酉',
  '甲戌',
  '乙亥',
  '丙子',
  '丁丑',
  '戊寅',
  '己卯',
  '庚辰',
  '辛巳',
  '壬午',
  '癸未',
  '甲申',
  '乙酉',
  '丙戌',
  '丁亥',
  '戊子',
  '己丑',
  '庚寅',
  '辛卯',
  '壬辰',
  '癸巳',
  '甲午',
  '乙未',
  '丙申',
  '丁酉',
  '戊戌',
  '己亥',
  '庚子',
  '辛丑',
  '壬寅',
  '癸卯',
  '甲辰',
  '乙巳',
  '丙午',
  '丁未',
  '戊申',
  '己酉',
  '庚戌',
  '辛亥',
  '壬子',
  '癸丑',
  '甲寅',
  '乙卯',
  '丙辰',
  '丁巳',
  '戊午',
  '己未',
  '庚申',
  '辛酉',
  '壬戌',
  '癸亥',
] as const;
export type StemBranch = (typeof STEMS_BRANCHES)[number];

// 五行
export const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'] as const;
export type FiveElement = (typeof FIVE_ELEMENTS)[number];

// 天干對應五行
export const STEM_TO_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

// 地支對應五行
export const BRANCH_TO_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
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
    try {
      if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
        console.error(
          'lunar-javascript 庫或其核心組件 (Solar, Lunar) 未正確加載。',
        );
        return null;
      }

      const jsDate = input.solarDate;

      // 檢查日期對象是否有效
      if (!jsDate || isNaN(jsDate.getTime())) {
        console.error('無效的日期對象:', jsDate);
        throw new Error('輸入的日期無效，請確保格式正確');
      }

      const year = jsDate.getFullYear();
      const month = jsDate.getMonth() + 1;
      const day = jsDate.getDate();
      const hour = jsDate.getHours();
      const minute = jsDate.getMinutes();
      const second = jsDate.getSeconds();

      // 輸出中間計算結果以便調試
      console.log('轉換日期:', { year, month, day, hour, minute, second });

      // 確保所有值都是有效的數值
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('日期轉換時出現NaN值:', { year, month, day });
        throw new Error(
          `農曆轉換失敗: 無效的年(${year})、月(${month})或日(${day})`,
        );
      }

      const solarDate = Solar.fromYmdHms(
        year,
        month,
        day,
        hour,
        minute,
        second,
      );
      if (!solarDate) {
        throw new Error('無法創建Solar對象，請檢查日期是否有效');
      }

      const lunarDate = solarDate.getLunar();
      if (!lunarDate) {
        throw new Error(
          '無法獲取農曆日期，請檢查lunar-javascript庫是否正確工作',
        );
      }

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
        yearPillar: {
          stem: yearStem,
          branch: yearBranch,
          stemElement: STEM_TO_ELEMENT[yearStem],
          branchElement: BRANCH_TO_ELEMENT[yearBranch],
        },
        monthPillar: {
          stem: monthStem,
          branch: monthBranch,
          stemElement: STEM_TO_ELEMENT[monthStem],
          branchElement: BRANCH_TO_ELEMENT[monthBranch],
        },
        dayPillar: {
          stem: dayStem,
          branch: dayBranch,
          stemElement: STEM_TO_ELEMENT[dayStem],
          branchElement: BRANCH_TO_ELEMENT[dayBranch],
        },
        hourPillar: {
          stem: hourStem,
          branch: hourBranch,
          stemElement: STEM_TO_ELEMENT[hourStem],
          branchElement: BRANCH_TO_ELEMENT[hourBranch],
        },
      };
    } catch (error) {
      console.error('八字計算錯誤：', error);
      throw error; // 重新拋出錯誤以便上層處理
    }
  }
}

export const TEN_GODS = [
  '比肩',
  '劫財',
  '食神',
  '傷官',
  '偏財',
  '正財',
  '七殺',
  '正官',
  '偏印',
  '正印',
] as const;
export type TenGod = (typeof TEN_GODS)[number];

export const STEM_YIN_YANG: Record<HeavenlyStem, boolean> = {
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

export interface TenGodsPillars {
  yearStemGod: TenGod | null;
  monthStemGod: TenGod | null;
  dayStemGod: TenGod | null;
  hourStemGod: TenGod | null;
}

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
      yearStemGod: this.getTenGodRelation(
        dayMaster,
        baziResult.yearPillar.stem,
      ),
      monthStemGod: this.getTenGodRelation(
        dayMaster,
        baziResult.monthPillar.stem,
      ),
      dayStemGod: this.getTenGodRelation(dayMaster, baziResult.dayPillar.stem),
      hourStemGod: this.getTenGodRelation(
        dayMaster,
        baziResult.hourPillar.stem,
      ),
    };
  }
}

export interface ElementsDistribution {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

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

export interface StartLuckInfo {
  age: number;
  year: number;
}

export class FortuneCycleCalculator {
  /**
   * 計算起運時間點
   * @param lunarDate 農曆日期對象
   * @param gender 性別 (0: 男, 1: 女)
   * @returns 起運年齡和年份
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

      // 判斷大運是順行還是逆行
      // 天干陰陽: 陽干 = 甲丙戊庚壬, 陰干 = 乙丁己辛癸
      const yearStem = lunarDate.getYearGanExact() as HeavenlyStem;
      const isYangYear = STEM_YIN_YANG[yearStem];

      let directionParam: 0 | 1;
      // 陽男 (gender 0, isYangYear true) -> 順行 (param 0)
      // 陰女 (gender 1, isYangYear false) -> 順行 (param 0)
      if ((gender === 0 && isYangYear) || (gender === 1 && !isYangYear)) {
        directionParam = 0; // 順行
        console.log(
          `FortuneCycleCalculator: Yang Year (${yearStem}) + Male OR Yin Year (${yearStem}) + Female. Forward (順行). Param for getYun: 0`,
        );
      } else {
        // 陰男 (gender 0, isYangYear false) -> 逆行 (param 1)
        // 陽女 (gender 1, isYangYear true) -> 逆行 (param 1)
        directionParam = 1; // 逆行
        console.log(
          `FortuneCycleCalculator: Yin Year (${yearStem}) + Male OR Yang Year (${yearStem}) + Female. Backward (逆行). Param for getYun: 1`,
        );
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
   * @param birthData 生辰資料
   * @param gender 性別 (0: 男, 1: 女)
   * @param count 需要計算的大運數量 (預設 8個大運)
   * @returns 大運資料陣列
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
   * @param birthDate 出生日期
   * @param startYear 開始年份
   * @param years 計算年數
   * @returns 流年資料陣列
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

// 大運資料結構
export interface DecennialCycle {
  index: number; // 大運序號
  stem: HeavenlyStem; // 天干
  branch: EarthlyBranch; // 地支
  stemElement: FiveElement; // 天干五行
  branchElement: FiveElement; // 地支五行
  startAge: number; // 開始年齡
  endAge: number; // 結束年齡
  startYear: number; // 開始年份
  endYear: number; // 結束年份
  analysis?: DecennialAnalysis; // 大運解讀
}

// 流年資料結構
export interface AnnualLuck {
  year: number; // 西元年
  age: number; // 年齡
  stem: HeavenlyStem; // 天干
  branch: EarthlyBranch; // 地支
  stemElement: FiveElement; // 天干五行
  branchElement: FiveElement; // 地支五行
  analysis?: AnnualAnalysis; // 流年解讀
}

// 命盤解讀層次
export enum InterpretationLevel {
  BASIC = 'basic', // 基礎解讀
  INTERMEDIATE = 'intermediate', // 進階解讀
  EXPERT = 'expert', // 專家解讀
}

// 大運解讀
export interface DecennialAnalysis {
  overview: string; // 大運概述
  career: string; // 事業分析
  health: string; // 健康狀況
  relationships: string; // 人際關係
  wealth: string; // 財富運勢
  level: InterpretationLevel; // 解讀層次
}

// 流年解讀
export interface AnnualAnalysis {
  overview: string; // 年度概述
  focus: string; // 年度重點
  challenges: string; // 年度挑戰
  opportunities: string; // 年度機會
  level: InterpretationLevel; // 解讀層次
}

// 命盤整體解讀
export interface ChartInterpretation {
  general: string; // 命盤總論
  personalityTraits: string[]; // 性格特質
  favorableElements: FiveElement[]; // 有利五行
  unfavorableElements: FiveElement[]; // 不利五行
  lifePatterns: string[]; // 人生模式
  keyAges: number[]; // 重要年齡
  career: string; // 事業適應性
  relationships: string; // 人際關係
  health: string; // 健康狀況
  level: InterpretationLevel; // 解讀層次
}

// 解讀生成器類
export class BaziInterpreter {
  /**
   * 生成命盤基礎解讀
   * @param baziResult 八字計算結果
   * @returns 基礎命盤解讀
   */
  public static generateBasicInterpretation(
    baziResult: BaziResult,
  ): ChartInterpretation {
    const dayMaster = baziResult.dayPillar.stem;
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];

    // 計算五行分佈
    const elementsDist =
      FiveElementsAnalyzer.calculateElementsDistribution(baziResult);

    // 確定旺弱
    const strongElements: FiveElement[] = [];
    const weakElements: FiveElement[] = [];

    // 簡單實現：根據數量判斷五行旺弱
    const elements = Object.entries(elementsDist) as [FiveElement, number][];
    elements.sort((a, b) => b[1] - a[1]);

    // 最多的兩個五行視為旺
    strongElements.push(elements[0][0], elements[1][0]);

    // 最少的兩個五行視為弱
    weakElements.push(
      elements[elements.length - 1][0],
      elements[elements.length - 2][0],
    );

    // 判斷日主喜忌
    const favorableElements: FiveElement[] = [];
    const unfavorableElements: FiveElement[] = [];

    // 日主過旺時喜歡克泄，過弱時喜歡生扶
    if (strongElements.includes(dayMasterElement)) {
      // 日主旺，喜被克、被泄
      const relationIndices = [2, 3]; // 偏財、正財（被克）、七殺、正官（被克）
      for (const element of FIVE_ELEMENTS) {
        const relation = FIVE_ELEMENT_RELATIONS[dayMasterElement][element];
        if (relationIndices.includes(relation)) {
          favorableElements.push(element);
        }
      }

      // 不喜生、不喜同類
      const unfavorRelations = [0, 4]; // 比肩、劫財（同類）、偏印、正印（生）
      for (const element of FIVE_ELEMENTS) {
        const relation = FIVE_ELEMENT_RELATIONS[dayMasterElement][element];
        if (unfavorRelations.includes(relation)) {
          unfavorableElements.push(element);
        }
      }
    } else {
      // 日主弱，喜生、喜同類
      const relationIndices = [0, 4]; // 比肩、劫財（同類）、偏印、正印（生）
      for (const element of FIVE_ELEMENTS) {
        const relation = FIVE_ELEMENT_RELATIONS[dayMasterElement][element];
        if (relationIndices.includes(relation)) {
          favorableElements.push(element);
        }
      }

      // 不喜被克、不喜泄
      const unfavorRelations = [2, 3]; // 偏財、正財（泄）、七殺、正官（克）
      for (const element of FIVE_ELEMENTS) {
        const relation = FIVE_ELEMENT_RELATIONS[dayMasterElement][element];
        if (unfavorRelations.includes(relation)) {
          unfavorableElements.push(element);
        }
      }
    }

    // 產生性格特質
    const personalityTraits = this.generatePersonalityTraits(
      baziResult,
      dayMasterElement,
    );

    // 產生重要年齡
    const keyAges = this.generateKeyAges(baziResult);

    return {
      general: `您的八字命盤中，日主為${dayMaster}，五行屬${dayMasterElement}。從整體來看，命盤中${strongElements.join('、')}較為旺盛，而${weakElements.join('、')}相對較弱。`,
      personalityTraits,
      favorableElements,
      unfavorableElements,
      lifePatterns: [
        `您的命盤顯示，人生發展會經歷${this.generateLifePatternDescription(baziResult)}`,
        `您適合發展的方向與${favorableElements.join('、')}相關的領域。`,
      ],
      keyAges,
      career: this.generateCareerAdvice(baziResult, favorableElements),
      relationships: this.generateRelationshipAdvice(baziResult),
      health: this.generateHealthAdvice(baziResult, dayMasterElement),
      level: InterpretationLevel.BASIC,
    };
  }

  /**
   * 基於八字生成性格特質描述
   */
  private static generatePersonalityTraits(
    baziResult: BaziResult,
    dayMasterElement: FiveElement,
  ): string[] {
    const traits: string[] = [];

    // 基於日主五行的基本性格
    switch (dayMasterElement) {
      case '木':
        traits.push(
          '性格正直開朗，具有理想和抱負',
          '做事有計劃性，善於組織和規劃',
          '有同情心和公正感',
        );
        break;
      case '火':
        traits.push(
          '熱情洋溢，充滿活力',
          '善於表達，人緣良好',
          '直覺敏銳，創造力強',
        );
        break;
      case '土':
        traits.push(
          '踏實穩重，忠誠可靠',
          '意志堅定，做事有耐心',
          '思慮周全，處事圓融',
        );
        break;
      case '金':
        traits.push(
          '做事有條理，處事公正',
          '意志堅強，自律性高',
          '善於分析，判斷力強',
        );
        break;
      case '水':
        traits.push(
          '思維靈活，適應力強',
          '善於溝通，洞察力敏銳',
          '好奇心強，求知欲旺盛',
        );
        break;
    }

    // 基於年柱的性格影響（童年及與父母關係）
    const yearElement = baziResult.yearPillar.stemElement;
    if (yearElement !== dayMasterElement) {
      traits.push(`受${yearElement}的影響，童年時期形成了堅韌的生存能力`);
    }

    // 基於月柱的性格影響（青年及與兄弟姐妹關係）
    const monthElement = baziResult.monthPillar.stemElement;
    if (monthElement !== dayMasterElement) {
      traits.push(`在${monthElement}的薰陶下，培養了良好的社交能力`);
    }

    return traits;
  }

  /**
   * 生成人生模式描述
   */
  private static generateLifePatternDescription(
    baziResult: BaziResult,
  ): string {
    const yearBranch = baziResult.yearPillar.branch;
    const monthBranch = baziResult.monthPillar.branch;
    const dayBranch = baziResult.dayPillar.branch;

    // 基於地支組合的大致人生階段描述
    if (['寅', '卯', '辰'].includes(yearBranch)) {
      return '早年打拼，中年平穩，晚年安逸的過程。';
    } else if (['巳', '午', '未'].includes(yearBranch)) {
      return '早年波折，中年發展，晚年收穫的歷程。';
    } else if (['申', '酉', '戌'].includes(yearBranch)) {
      return '早年穩定，中年奮鬥，晚年豐盛的旅程。';
    }
    return '獨特的成長階段，需要在不同時期適應不同挑戰。';
  }

  /**
   * 生成重要年齡點
   */
  private static generateKeyAges(baziResult: BaziResult): number[] {
    // 簡單實現：根據四柱地支轉換為數字後加上基數
    const baseAge = 10;
    const keyAges: number[] = [];

    const branches = [
      baziResult.yearPillar.branch,
      baziResult.monthPillar.branch,
      baziResult.dayPillar.branch,
      baziResult.hourPillar.branch,
    ];

    branches.forEach((branch) => {
      const index = EARTHLY_BRANCHES.indexOf(branch);
      if (index >= 0) {
        keyAges.push(baseAge + index * 5);
      }
    });

    // 確保年齡唯一且排序
    return Array.from(new Set(keyAges)).sort((a, b) => a - b);
  }

  /**
   * 生成事業建議
   */
  private static generateCareerAdvice(
    baziResult: BaziResult,
    favorableElements: FiveElement[],
  ): string {
    let advice = '從職業選擇來看，';

    if (favorableElements.includes('木')) {
      advice += '您適合教育、法律、文學、植物相關、環保等領域；';
    }
    if (favorableElements.includes('火')) {
      advice += '您適合設計、演藝、餐飲、燈光、電子等行業；';
    }
    if (favorableElements.includes('土')) {
      advice += '您適合房地產、農業、建築、行政管理等工作；';
    }
    if (favorableElements.includes('金')) {
      advice += '您適合金融、珠寶、機械、IT、律師等職業；';
    }
    if (favorableElements.includes('水')) {
      advice += '您適合營銷、旅遊、運輸、哲學、水產等領域；';
    }

    return advice;
  }

  /**
   * 生成人際關係建議
   */
  private static generateRelationshipAdvice(baziResult: BaziResult): string {
    const dayStem = baziResult.dayPillar.stem;
    const dayBranch = baziResult.dayPillar.branch;

    // 基於日干支的簡單人際關係建議
    switch (dayStem) {
      case '甲':
      case '乙':
        return '您性格開朗，待人真誠，易結交朋友，但有時固執己見。在人際關係中，建議多聽取他人意見，培養包容心。';
      case '丙':
      case '丁':
        return '您熱情活潑，人緣良好，善於表達，但有時過於直率。在人際關係中，建議控制情緒波動，增加耐心和穩定性。';
      case '戊':
      case '己':
        return '您為人厚道，重視情誼，處事圓融，但有時優柔寡斷。在人際關係中，建議增強決斷力，明確表達自己的意願。';
      case '庚':
      case '辛':
        return '您處事公正，重視原則，責任感強，但有時過於嚴肅。在人際關係中，建議增加靈活性和幽默感。';
      case '壬':
      case '癸':
        return '您思維活躍，善於溝通，適應能力強，但有時顯得深不可測。在人際關係中，建議增加真誠度和穩定性。';
      default:
        return '您在人際關係中展現出獨特的特質，善於理解他人並建立有意義的連結。';
    }
  }

  /**
   * 生成健康建議
   */
  private static generateHealthAdvice(
    baziResult: BaziResult,
    dayMasterElement: FiveElement,
  ): string {
    // 基於日主五行的健康建議
    switch (dayMasterElement) {
      case '木':
        return '健康方面需注意肝膽系統、眼睛、肌腱等。建議保持情緒平和，規律作息，適當運動。';
      case '火':
        return '健康方面需注意心臟、血液循環、眼睛等。建議避免過度勞累，保持充足睡眠，注意血壓管理。';
      case '土':
        return '健康方面需注意脾胃、消化系統、肌肉等。建議飲食規律，避免過食，適當增加戶外活動。';
      case '金':
        return '健康方面需注意肺部、呼吸系統、皮膚等。建議保持呼吸順暢，避免灰塵環境，注意皮膚保養。';
      case '水':
        return '健康方面需注意腎臟、泌尿系統、耳朵等。建議注意保暖，避免過度勞累，保持充足水分。';
      default:
        return '健康方面建議定期體檢，保持均衡飲食和規律作息，適當參加體育活動。';
    }
  }

  /**
   * 生成流年解讀
   * @param baziResult 八字結果
   * @param annualLuck 流年資料
   * @param level 解讀層次
   * @returns 流年解讀
   */
  public static generateAnnualAnalysis(
    baziResult: BaziResult,
    annualLuck: AnnualLuck,
    level: InterpretationLevel = InterpretationLevel.BASIC,
  ): AnnualAnalysis {
    const dayMaster = baziResult.dayPillar.stem;
    const annualStem = annualLuck.stem;
    const annualBranch = annualLuck.branch;

    // 取得天干關係
    const tenGod = TenGodsCalculator.getTenGodRelation(dayMaster, annualStem);

    // 基於十神關係生成解讀
    let overview = '';
    let focus = '';
    let challenges = '';
    let opportunities = '';

    // 流年概述
    overview = `${annualLuck.year}年（${annualStem}${annualBranch}年），您${annualLuck.age}歲。此年流年天干為${annualStem}，地支為${annualBranch}，與您的日主${dayMaster}形成「${tenGod}」的關係。`;

    // 根據十神關係生成年度重點
    switch (tenGod) {
      case '比肩':
        focus = '與志同道合者合作，共同發展';
        challenges = '可能面臨競爭，需要與人協調合作';
        opportunities = '事業發展，團隊合作，人脈擴展';
        break;
      case '劫財':
        focus = '獨立自主，提升個人能力';
        challenges = '人際關係可能緊張，需控制情緒';
        opportunities = '自我提升，能力展現，個人突破';
        break;
      case '食神':
        focus = '創意發揮，享受生活';
        challenges = '可能過於享樂，需要平衡工作與休閒';
        opportunities = '藝術創作，教育培訓，健康改善';
        break;
      case '傷官':
        focus = '學習新知，擴展視野';
        challenges = '可能過於衝動，需控制言行';
        opportunities = '學術研究，技能提升，創新發明';
        break;
      case '偏財':
        focus = '尋找額外收入，投資理財';
        challenges = '財務上可能有波動，需謹慎決策';
        opportunities = '投資理財，副業發展，偶然之財';
        break;
      case '正財':
        focus = '穩定收入，積累財富';
        challenges = '工作壓力可能增加，需要平衡付出與回報';
        opportunities = '職位晉升，收入增加，財務改善';
        break;
      case '七殺':
        focus = '競爭突破，迎接挑戰';
        challenges = '可能面臨權力衝突，需要適當妥協';
        opportunities = '領導角色，競爭優勢，權威建立';
        break;
      case '正官':
        focus = '規範行為，遵守紀律';
        challenges = '可能受到約束，需要遵守規則';
        opportunities = '官方認可，名譽提升，正式身份';
        break;
      case '偏印':
        focus = '學習成長，內在提升';
        challenges = '可能思慮過多，需要實際行動';
        opportunities = '學術進步，智慧增長，靈性提升';
        break;
      case '正印':
        focus = '穩定發展，沉澱積累';
        challenges = '可能過於保守，需要適度創新';
        opportunities = '文憑證書，知識積累，內在成長';
        break;
    }

    return {
      overview,
      focus,
      challenges,
      opportunities,
      level,
    };
  }

  /**
   * 生成大運解讀
   * @param baziResult 八字結果
   * @param decennialCycle 大運資料
   * @param level 解讀層次
   * @returns 大運解讀
   */
  public static generateDecennialAnalysis(
    baziResult: BaziResult,
    decennialCycle: DecennialCycle,
    level: InterpretationLevel = InterpretationLevel.BASIC,
  ): DecennialAnalysis {
    const dayMaster = baziResult.dayPillar.stem;
    const decennialStem = decennialCycle.stem;
    const decennialBranch = decennialCycle.branch;

    // 取得天干關係
    const tenGod = TenGodsCalculator.getTenGodRelation(
      dayMaster,
      decennialStem,
    );

    // 大運概述
    const overview = `第${decennialCycle.index}大運（${decennialStem}${decennialBranch}），從${decennialCycle.startAge}歲到${decennialCycle.endAge}歲（${decennialCycle.startYear}年-${decennialCycle.endYear}年）。此大運天干為${decennialStem}，地支為${decennialBranch}，與您的日主${dayMaster}形成「${tenGod}」的關係。`;

    // 根據十神關係生成不同領域解讀
    let career = '';
    let health = '';
    let relationships = '';
    let wealth = '';

    // 根據十神關係生成事業分析
    switch (tenGod) {
      case '比肩':
      case '劫財':
        career = '事業上可能需要與人合作或競爭，適合發展團隊協作或獨立創業。';
        health = '身體健康狀況良好，但需注意情緒管理，避免過度勞累。';
        relationships =
          '人際關係活躍，可能結交志同道合的朋友，但需處理好競爭關係。';
        wealth = '財運波動，收入主要來自個人努力和團隊合作。';
        break;
      case '食神':
      case '傷官':
        career = '適合發展創意、教育、藝術或技術類工作，有機會展現個人才華。';
        health = '需注意消化系統和情緒穩定，保持樂觀心態有利健康。';
        relationships = '人緣良好，容易吸引追隨者，但需警惕過於自我表現。';
        wealth = '財運不穩定但有亮點，可能通過才藝或創意獲得收入。';
        break;
      case '偏財':
      case '正財':
        career = '事業發展順利，有機會獲得晉升或加薪，財務方面有所改善。';
        health = '需注意壓力管理，工作與休息平衡，避免過度勞累。';
        relationships = '人際關係以實用為主，可能結識有價值的商業夥伴。';
        wealth = '財運良好，可能有意外收入或投資機會，但需謹慎理財。';
        break;
      case '七殺':
      case '正官':
        career =
          '事業上可能面臨挑戰但也有突破，適合從事管理、法律或權威性工作。';
        health = '需注意壓力和情緒管理，避免過度緊張和焦慮。';
        relationships = '人際關係可能較為緊張，需要處理好權力和競爭關係。';
        wealth = '財運穩定，收入主要來自正職和專業能力。';
        break;
      case '偏印':
      case '正印':
        career =
          '適合學術研究、教育或需要專業知識的工作，有機會深造或考取證書。';
        health = '需注意腎臟和神經系統，保持充足休息和心態平和。';
        relationships = '人際關係較為內斂，可能結識有學識的人或導師。';
        wealth = '財運緩慢但穩定，收入可能來自知識和專業領域。';
        break;
    }

    return {
      overview,
      career,
      health,
      relationships,
      wealth,
      level,
    };
  }
}

export interface FullBaziAnalysis extends BaziResult {
  mainTenGods?: TenGodsPillars;
  elementsDistribution?: ElementsDistribution;
  startLuckInfo?: StartLuckInfo | null;
  decennialCycles?: DecennialCycle[]; // 大運
  annualLuck?: AnnualLuck[]; // 流年
  interpretation?: ChartInterpretation; // 命盤解讀
}
