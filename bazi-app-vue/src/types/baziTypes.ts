// baziTypes.ts
// Type definitions for BaZi calculations
// Extracted from legacy baziCalc.ts (2025-11-30)

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
  dayPillar: Pillar;
  hourPillar: Pillar;
}

// 十神
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

// 十神排盤結果
export interface TenGodsPillars {
  yearPillar: TenGod;
  monthPillar: TenGod;
  dayPillar: TenGod;
  hourPillar: TenGod;
}

// 五行分布
export interface ElementsDistribution {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

// 起運資訊
export interface StartLuckInfo {
  age: number;
  year: number;
}
