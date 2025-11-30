/**
 * Unified Calculator
 *
 * Integrates all Sprint 1-3 modules (BaZi, ZiWei) into a single unified interface.
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Task 4.1
 */

import { Solar, Lunar, ShouXingUtil } from 'lunar-typescript';
import {
  BirthInfo,
  CalculationResult,
  BaZiResult,
  ZiWeiResult,
  CalculationStep,
  CalculationMetadata,
  HiddenStems,
  TenGod,
  StarSymmetry
} from '../types';
import { validateBirthInfo } from './validator';
import { calculateTrueSolarTime, dateToJulianDay, getLichunTime } from '../core/time';
import { ganZhiToIndex } from '../core/ganZhi';
import {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar
} from '../bazi/fourPillars';
import { calculateLifePalace, calculateBodyPalace } from '../ziwei/palaces';
import { calculateBureau } from '../ziwei/bureau';
import { findZiWeiPosition } from '../ziwei/stars/ziwei';
import { findTianFuPosition } from '../ziwei/stars/tianfu';
import { findTimeStars, findMonthStars } from '../ziwei/stars/auxiliary';
import { calculateWuXingDistribution } from '../wuXing/distribution';
import { determineFortuneDirection, calculateQiYunDate } from '../fortune/qiyun';
import { generateDaYunList, getCurrentDaYun } from '../fortune/dayun';
import { getAnnualPillar } from '../annual/liuchun';
import { locateAnnualLifePalace } from '../annual/palace';
import {
  detectStemCombinations,
  detectBranchClashes,
  detectHarmoniousCombinations,
} from '../annual/interaction';

/**
 * Hidden stems mapping for earthly branches
 * Reference: Traditional BaZi藏干表
 */
const HIDDEN_STEMS_MAP: Record<string, HiddenStems> = {
  '子': { primary: '癸' },
  '丑': { primary: '己', middle: '癸', residual: '辛' },
  '寅': { primary: '甲', middle: '丙', residual: '戊' },
  '卯': { primary: '乙' },
  '辰': { primary: '戊', middle: '乙', residual: '癸' },
  '巳': { primary: '丙', middle: '庚', residual: '戊' },
  '午': { primary: '丁', middle: '己' },
  '未': { primary: '己', middle: '丁', residual: '乙' },
  '申': { primary: '庚', middle: '壬', residual: '戊' },
  '酉': { primary: '辛' },
  '戌': { primary: '戊', middle: '辛', residual: '丁' },
  '亥': { primary: '壬', middle: '甲' }
};

/**
 * Calculate hidden stems for a given earthly branch
 */
function getHiddenStems(branch: string): HiddenStems {
  return HIDDEN_STEMS_MAP[branch] || { primary: branch };
}

/**
 * Calculate Ten God relationship between two heavenly stems
 * Reference: Traditional 十神推算法
 */
function calculateTenGod(dayStem: string, targetStem: string): TenGod {
  const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const targetIndex = HEAVENLY_STEMS.indexOf(targetStem);

  if (dayIndex === -1 || targetIndex === -1) {
    return '比肩'; // Default fallback
  }

  const dayYinYang = dayIndex % 2; // 0=yang, 1=yin
  const targetYinYang = targetIndex % 2;
  const diff = (targetIndex - dayIndex + 10) % 10;

  // Ten Gods calculation based on difference and yin-yang
  if (diff === 0) return '比肩';
  if (diff === 1) return dayYinYang === targetYinYang ? '劫财' : '比肩';
  if (diff === 2) return dayYinYang === targetYinYang ? '食神' : '伤官';
  if (diff === 3) return dayYinYang === targetYinYang ? '伤官' : '食神';
  if (diff === 4) return dayYinYang === targetYinYang ? '偏财' : '正财';
  if (diff === 5) return dayYinYang === targetYinYang ? '正财' : '偏财';
  if (diff === 6) return dayYinYang === targetYinYang ? '七杀' : '正官';
  if (diff === 7) return dayYinYang === targetYinYang ? '正官' : '七杀';
  if (diff === 8) return dayYinYang === targetYinYang ? '偏印' : '正印';
  if (diff === 9) return dayYinYang === targetYinYang ? '正印' : '偏印';

  return '比肩'; // Fallback
}

/**
 * Calculate star symmetry information
 */
function calculateStarSymmetry(
  ziWeiPos: number,
  tianFuPos: number,
  auxiliaryStars: { wenChang: number; wenQu: number; zuoFu: number; youBi: number }
): StarSymmetry[] {
  const symmetry: StarSymmetry[] = [];

  // ZiWei-TianFu opposition symmetry
  symmetry.push({
    star: '紫微',
    position: ziWeiPos,
    symmetryPair: '天府',
    symmetryPosition: tianFuPos,
    symmetryType: 'opposite'
  });

  symmetry.push({
    star: '天府',
    position: tianFuPos,
    symmetryPair: '紫微',
    symmetryPosition: ziWeiPos,
    symmetryType: 'opposite'
  });

  // Auxiliary star pairs
  symmetry.push({
    star: '文昌',
    position: auxiliaryStars.wenChang,
    symmetryPair: '文曲',
    symmetryPosition: auxiliaryStars.wenQu,
    symmetryType: 'pair'
  });

  symmetry.push({
    star: '文曲',
    position: auxiliaryStars.wenQu,
    symmetryPair: '文昌',
    symmetryPosition: auxiliaryStars.wenChang,
    symmetryType: 'pair'
  });

  symmetry.push({
    star: '左辅',
    position: auxiliaryStars.zuoFu,
    symmetryPair: '右弼',
    symmetryPosition: auxiliaryStars.youBi,
    symmetryType: 'pair'
  });

  symmetry.push({
    star: '右弼',
    position: auxiliaryStars.youBi,
    symmetryPair: '左辅',
    symmetryPosition: auxiliaryStars.zuoFu,
    symmetryType: 'pair'
  });

  return symmetry;
}

/**
 * Unified Calculator Class
 *
 * Provides a single entry point for all astrological calculations.
 *
 * @example
 * const calculator = new UnifiedCalculator();
 * const result = calculator.calculate({
 *   solarDate: new Date(2024, 0, 1, 12, 0),
 *   longitude: 121.5,
 *   gender: 'male'
 * });
 */
export class UnifiedCalculator {
  /**
   * Calculate complete BaZi and ZiWei chart
   *
   * @param input - Birth information
   * @returns Complete calculation result
   * @throws Error if validation fails or calculation error occurs
   */
  calculate(input: BirthInfo): CalculationResult {
    console.log('[UnifiedCalculator] Starting calculation...');
    
    // Step 1: Validate input
    console.log('[UnifiedCalculator] Step 1: Validating input...');
    const validation = validateBirthInfo(input);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Step 2: Calculate BaZi
    console.log('[UnifiedCalculator] Step 2: Calculating BaZi...');
    const bazi = this.calculateBaZi(input);
    console.log('[UnifiedCalculator] BaZi calculation complete');

    // Step 3: Calculate ZiWei
    console.log('[UnifiedCalculator] Step 3: Calculating ZiWei...');
    const ziwei = this.calculateZiWei(input, bazi);
    console.log('[UnifiedCalculator] ZiWei calculation complete');

    // Step 4: Calculate Annual Fortune (using current date as query date)
    const queryDate = new Date();
    const annualPillar = getAnnualPillar(queryDate);
    const annualLifePalaceIndex = locateAnnualLifePalace(
      annualPillar.branch,
      ziwei.palaces || []
    );

    // Detect interactions
    const stemCombinations = detectStemCombinations(annualPillar.stem, bazi.fourPillars);
    const branchClashes = detectBranchClashes(annualPillar.branch, bazi.fourPillars);
    const harmoniousCombinations = detectHarmoniousCombinations(
      annualPillar.branch,
      bazi.fourPillars,
      bazi.fortuneCycles.currentDayun?.branch
    );

    // Step 5: Return unified result
    return {
      input,
      bazi,
      ziwei,
      annualFortune: {
        annualPillar,
        annualLifePalaceIndex,
        interactions: {
          stemCombinations,
          branchClashes,
          harmoniousCombinations,
        },
      },
      timestamp: new Date()
    };
  }

  /**
   * Calculate BaZi (八字) components
   *
   * @param input - Birth information
   * @returns BaZi calculation result
   */
  private calculateBaZi(input: BirthInfo): BaZiResult {
    const { solarDate, longitude } = input;
    const calculationSteps: CalculationStep[] = [];

    // Calculate true solar time
    const trueSolarTimeResult = calculateTrueSolarTime(solarDate, longitude);
    const trueSolarTime = trueSolarTimeResult.trueSolarTime;
    calculationSteps.push({
      step: 'trueSolarTime',
      input: { solarDate: solarDate.toISOString(), longitude },
      output: trueSolarTime.toISOString(),
      description: 'Calculate true solar time based on longitude'
    });

    // Get Julian day for day pillar
    const julianDay = dateToJulianDay(solarDate);
    calculationSteps.push({
      step: 'julianDay',
      input: { solarDate: solarDate.toISOString() },
      output: julianDay,
      description: 'Convert solar date to Julian day number'
    });

    // Get solar info for month pillar
    const solar = Solar.fromDate(solarDate);
    
    // Calculate solar longitude using ShouXingUtil
    const julianDayForSolar = solar.getJulianDay();
    const solarLongitude = ShouXingUtil.gxcSunLon(julianDayForSolar);

    // Calculate four pillars
    const lichunTime = getLichunTime(solarDate.getFullYear());
    const year = calculateYearPillar(solarDate, lichunTime);
    const yearStemIndex = ganZhiToIndex(year) % 10;
    calculationSteps.push({
      step: 'yearPillar',
      input: { solarDate: solarDate.toISOString(), lichunTime: lichunTime.toISOString() },
      output: year,
      description: 'Calculate year pillar using Lichun boundary'
    });

    const month = calculateMonthPillar(solarLongitude, yearStemIndex);
    calculationSteps.push({
      step: 'monthPillar',
      input: { solarLongitude, yearStemIndex },
      output: month,
      description: 'Calculate month pillar using solar longitude'
    });

    const day = calculateDayPillar(solarDate);
    const dayStemIndex = ganZhiToIndex(day) % 10;
    calculationSteps.push({
      step: 'dayPillar',
      input: { solarDate: solarDate.toISOString() },
      output: day,
      description: 'Calculate day pillar using Julian day method'
    });

    const hour = calculateHourPillar(trueSolarTime, dayStemIndex);
    calculationSteps.push({
      step: 'hourPillar',
      input: { trueSolarTime: trueSolarTime.toISOString(), dayStemIndex },
      output: hour,
      description: 'Calculate hour pillar using true solar time'
    });

    // Extract stems and branches
    const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const yearBranch = EARTHLY_BRANCHES[ganZhiToIndex(year) % 12];
    const monthBranch = EARTHLY_BRANCHES[ganZhiToIndex(month) % 12];
    const dayBranch = EARTHLY_BRANCHES[ganZhiToIndex(day) % 12];
    const hourBranch = EARTHLY_BRANCHES[ganZhiToIndex(hour) % 12];
    const dayStem = HEAVENLY_STEMS[dayStemIndex];

    // Calculate hidden stems
    const hiddenStems = {
      year: getHiddenStems(yearBranch),
      month: getHiddenStems(monthBranch),
      day: getHiddenStems(dayBranch),
      hour: getHiddenStems(hourBranch)
    };

    // Calculate ten gods (relationships to day stem)
    const yearStem = HEAVENLY_STEMS[yearStemIndex];
    const monthStem = HEAVENLY_STEMS[ganZhiToIndex(month) % 10];
    const hourStem = HEAVENLY_STEMS[ganZhiToIndex(hour) % 10];

    const tenGods = {
      year: calculateTenGod(dayStem, yearStem),
      month: calculateTenGod(dayStem, monthStem),
      hour: calculateTenGod(dayStem, hourStem)
    };

    // Calculate WuXing distribution
    const wuxingDistribution = calculateWuXingDistribution({
      year: { stem: yearStem, branch: yearBranch },
      month: { stem: monthStem, branch: monthBranch },
      day: { stem: dayStem, branch: dayBranch },
      hour: { stem: hourStem, branch: hourBranch }
    });
    calculationSteps.push({
      step: 'wuxingDistribution',
      input: { fourPillars: { year, month, day, hour } },
      output: wuxingDistribution,
      description: 'Calculate WuXing distribution with seasonality adjustment'
    });

    // Calculate fortune cycles (起運 & 大運)
    const direction = determineFortuneDirection(yearStem, input.gender);
    const qiyunDate = calculateQiYunDate(solarDate, yearStem, input.gender, trueSolarTime);
    calculationSteps.push({
      step: 'qiyunCalculation',
      input: { birthDate: solarDate.toISOString(), yearStem, gender: input.gender, trueSolarTime: trueSolarTime.toISOString() },
      output: { qiyunDate: qiyunDate.toISOString(), direction },
      description: 'Calculate QiYun date and fortune direction'
    });

    const dayunList = generateDaYunList(
      { stem: monthStem, branch: monthBranch },
      qiyunDate,
      direction,
      10
    );
    const currentDayun = getCurrentDaYun(dayunList, new Date());
    calculationSteps.push({
      step: 'dayunGeneration',
      input: { monthPillar: month, qiyunDate: qiyunDate.toISOString(), direction, count: 10 },
      output: { dayunList: dayunList.map(d => ({ stem: d.stem, branch: d.branch, age: d.age })), currentDayun },
      description: 'Generate 10-year fortune cycles and identify current cycle'
    });

    const fortuneCycles = {
      qiyunDate,
      direction,
      dayunList,
      currentDayun
    };

    // Metadata
    const metadata: CalculationMetadata = {
      algorithms: ['JulianDayMethod', 'TrueSolarTimeCorrection', 'LichunBoundary'],
      references: ['渊海子平', '三命通会', '滴天髓'],
      methods: ['FourPillarsCalculation', 'HiddenStemsExtraction', 'TenGodsMatrix', 'SeasonalityAdjustment', 'MetabolicConversion', 'FortuneDirection']
    };

    return {
      fourPillars: {
        year,
        month,
        day,
        hour
      },
      trueSolarTime,
      julianDay,
      hiddenStems,
      tenGods,
      wuxingDistribution,
      fortuneCycles,
      calculationSteps,
      metadata
    };
  }

  /**
   * Calculate ZiWei (紫微斗數) components
   *
   * @param input - Birth information
   * @param bazi - BaZi calculation result (for hour branch)
   * @returns ZiWei calculation result
   */
  private calculateZiWei(input: BirthInfo, bazi: BaZiResult): ZiWeiResult {
    const { solarDate, isLeapMonth } = input;
    const calculationSteps: CalculationStep[] = [];

    // Convert to lunar calendar
    const solar = Solar.fromDate(solarDate);
    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();
    calculationSteps.push({
      step: 'lunarConversion',
      input: { solarDate: solarDate.toISOString() },
      output: { lunarMonth, lunarDay },
      description: 'Convert solar date to lunar calendar'
    });

    // Get hour branch index from BaZi hour pillar
    const hourBranch = ganZhiToIndex(bazi.fourPillars.hour) % 12;

    // Calculate palaces
    const lifePalace = calculateLifePalace(
      lunarMonth,
      hourBranch,
      { leapMonthAdjustment: isLeapMonth ? 1 : 0 }
    );
    calculationSteps.push({
      step: 'lifePalace',
      input: { lunarMonth, hourBranch, isLeapMonth },
      output: lifePalace,
      description: 'Calculate life palace (命宫) position'
    });

    const bodyPalace = calculateBodyPalace(lunarMonth, hourBranch);
    calculationSteps.push({
      step: 'bodyPalace',
      input: { lunarMonth, hourBranch },
      output: bodyPalace,
      description: 'Calculate body palace (身宫) position'
    });

    // Calculate bureau (五行局)
    // Life palace needs stem-branch pair
    const lifePalaceIndex = lifePalace.position;
    // We need to calculate life palace stem using year stem
    const yearStemIndex = ganZhiToIndex(bazi.fourPillars.year) % 10;
    // Calculate life palace stem using 五虎遁年法 (same as month pillar logic)
    const lifePalaceStemIndex = (2 * yearStemIndex + 2 + lifePalaceIndex) % 10;

    // Get stem and branch for bureau calculation
    const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const lifePalaceStem = HEAVENLY_STEMS[lifePalaceStemIndex];
    const bureau = calculateBureau(lifePalaceStem, lifePalace.branch);
    calculationSteps.push({
      step: 'bureau',
      input: { lifePalaceStem, lifePalaceBranch: lifePalace.branch },
      output: bureau,
      description: 'Calculate five elements bureau (五行局)'
    });

    // Calculate star positions
    const ziWeiPosition = findZiWeiPosition(lunarDay, bureau);
    calculationSteps.push({
      step: 'ziWeiPosition',
      input: { lunarDay, bureau },
      output: ziWeiPosition,
      description: 'Calculate ZiWei star (紫微星) position'
    });

    const tianFuPosition = findTianFuPosition(ziWeiPosition);
    calculationSteps.push({
      step: 'tianFuPosition',
      input: { ziWeiPosition },
      output: tianFuPosition,
      description: 'Calculate TianFu star (天府星) position based on ZiWei'
    });

    const { wenChang, wenQu } = findTimeStars(hourBranch);
    calculationSteps.push({
      step: 'timeStars',
      input: { hourBranch },
      output: { wenChang, wenQu },
      description: 'Calculate time-based auxiliary stars (文昌/文曲)'
    });

    const { zuoFu, youBi } = findMonthStars(lunarMonth);
    calculationSteps.push({
      step: 'monthStars',
      input: { lunarMonth },
      output: { zuoFu, youBi },
      description: 'Calculate month-based auxiliary stars (左辅/右弼)'
    });

    // Calculate star symmetry
    const auxiliaryStars = { wenChang, wenQu, zuoFu, youBi };
    const starSymmetry = calculateStarSymmetry(ziWeiPosition, tianFuPosition, auxiliaryStars);

    // Metadata
    const metadata: CalculationMetadata = {
      algorithms: ['ZiWeiPositioning', 'BureauCalculation', 'PalacePositioning'],
      references: ['紫微斗数全书', '紫微斗数讲义', '骨髓赋'],
      methods: ['LunarCalendar', 'StarSymmetry', 'AuxiliaryStarPlacement']
    };

    return {
      lifePalace,
      bodyPalace,
      bureau,
      ziWeiPosition,
      tianFuPosition,
      auxiliaryStars,
      starSymmetry,
      calculationSteps,
      metadata
    };
  }
}
