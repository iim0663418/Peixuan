/**
 * Test Fixtures for Integration Tests
 *
 * Provides mock data structures for testing the agentic service.
 */

import type { CalculationResult, BirthInfo } from '../../../src/calculation/types';

/**
 * Minimal mock CalculationResult for testing
 * Contains only the essential fields needed for tool execution
 */
export const createMockCalculationResult = (): CalculationResult => {
  const mockBirthInfo: BirthInfo = {
    name: '測試用戶',
    gender: 'male',
    birthDateTime: new Date('1990-01-15T08:30:00+08:00'),
    timezone: 8,
    location: '台北市'
  };

  return {
    input: mockBirthInfo,
    bazi: {
      fourPillars: {
        year: { stem: '己', branch: '巳' },
        month: { stem: '丁', branch: '丑' },
        day: { stem: '甲', branch: '子' },
        hour: { stem: '戊', branch: '辰' }
      },
      dayMaster: '甲',
      dayMasterElement: '木',
      monthlyOrder: {
        branch: '丑',
        season: '冬',
        hiddenStems: [
          { stem: '己', percentage: 9, element: '土' },
          { stem: '癸', percentage: 21, element: '水' },
          { stem: '辛', percentage: 3, element: '金' }
        ]
      },
      tenGodsMatrix: {
        year: { stem: '偏財', branch: '正印' },
        month: { stem: '傷官', branch: '偏印' },
        day: { stem: '日主', branch: '正印' },
        hour: { stem: '食神', branch: '偏財' }
      },
      strength: {
        score: 45,
        level: '中和',
        supportive: ['子', '丑'],
        restrictive: ['巳', '辰']
      },
      favorableElements: ['水', '木'],
      unfavorableElements: ['火', '土'],
      fortuneCycles: [
        {
          startAge: 8,
          endAge: 17,
          pillar: { stem: '丙', branch: '子' },
          phase: '早運'
        },
        {
          startAge: 18,
          endAge: 27,
          pillar: { stem: '乙', branch: '亥' },
          phase: '青年'
        },
        {
          startAge: 28,
          endAge: 37,
          pillar: { stem: '甲', branch: '戌' },
          phase: '壯年',
          isCurrent: true
        }
      ]
    },
    ziwei: {
      lifePalaceIndex: 2,
      bodyPalaceIndex: 8,
      命主星: '貪狼',
      身主星: '天相',
      fiveElements: {
        局: '水二局',
        納音: '大林木'
      },
      starSymmetry: [
        {
          pattern: '日月同宮',
          palaceIndex: 2,
          stars: ['太陽', '太陰'],
          significance: '陰陽調和'
        }
      ],
      palaces: Array(12).fill(null).map((_, idx) => ({
        index: idx,
        name: ['命宮', '父母', '福德', '田宅', '官祿', '僕役', '遷移', '疾厄', '財帛', '子女', '夫妻', '兄弟'][idx],
        earthlyBranch: ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][idx],
        heavenlyStem: '甲',
        majorStars: idx === 2 ? ['太陽', '太陰'] : [],
        minorStars: [],
        supportStars: [],
        siHua: {
          lu: [],
          quan: [],
          ke: [],
          ji: []
        }
      })),
      sihuaAggregation: {
        natal: {
          lu: {
            selfPalaces: [],
            oppositePalaces: [],
            cycles: []
          },
          quan: {
            selfPalaces: [],
            oppositePalaces: [],
            cycles: []
          },
          ke: {
            selfPalaces: [],
            oppositePalaces: [],
            cycles: []
          },
          ji: {
            selfPalaces: [],
            oppositePalaces: [],
            cycles: []
          }
        },
        decadal: null,
        annual: null,
        patterns: []
      },
      calculationSteps: [],
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        calculationTimeMs: 10
      }
    }
  } as CalculationResult;
};

/**
 * Mock tool observation results
 */
export const mockToolObservations = {
  get_bazi_profile: `## 八字命盤

**四柱**: 己巳年 丁丑月 甲子日 戊辰時
**日主**: 甲木
**日主五行**: 木
**喜用神**: 水、木`,

  get_ziwei_chart: `## 紫微斗數命盤

**命宮**: 寅宮（太陽、太陰）
**身宮**: 申宮
**命主星**: 貪狼
**身主星**: 天相`,

  get_daily_transit: `## 每日運勢

**今日干支**: 甲子
**太歲**: 甲午
**流年運勢**: 中平`,

  get_annual_context: `## 流年分析

**流年**: 2024年 甲辰
**流年命宮**: 辰宮
**太歲**: 甲辰
**天干合化**: 無
**地支沖合**: 子辰半合水局`,

  get_life_forces: `## 生命力分析

**精神力**: 75/100
**體力**: 60/100
**情緒穩定度**: 80/100`
};
