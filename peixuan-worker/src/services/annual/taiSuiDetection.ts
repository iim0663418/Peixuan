/**
 * 流年太歲檢測模組
 * Tai Sui Detection Module
 * 
 * 實現五種犯太歲檢測：值、沖、刑、破、害
 */

import type { EarthlyBranch } from '../types';

/**
 * 值太歲檢測 (Zhi Tai Sui)
 * 流年地支與本命地支重疊（本命年）
 * 
 * @param annualBranch - 流年地支
 * @param natalBranch - 本命地支（通常為年支）
 * @returns 是否值太歲
 * 
 * @example
 * detectZhiTaiSui('巳', '巳') // true - 2025年乙巳年，屬蛇者值太歲
 * detectZhiTaiSui('巳', '亥') // false
 */
export function detectZhiTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return annualBranch === natalBranch;
}

/**
 * 沖太歲檢測 (Chong Tai Sui)
 * 地支六沖關係（相差 180 度）
 * 
 * 六沖對應表：
 * - 子午沖、丑未沖、寅申沖
 * - 卯酉沖、辰戌沖、巳亥沖
 */
const CHONG_RELATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

/**
 * 沖太歲檢測
 * 
 * @param annualBranch - 流年地支
 * @param natalBranch - 本命地支
 * @returns 是否沖太歲
 * 
 * @example
 * detectChongTaiSui('巳', '亥') // true - 巳亥沖
 * detectChongTaiSui('子', '午') // true - 子午沖
 */
export function detectChongTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return CHONG_RELATIONS[annualBranch] === natalBranch;
}

/**
 * 刑太歲類型
 */
export type XingType = 'san_xing' | 'zi_xing' | 'wu_en_xing';

/**
 * 刑太歲結果
 */
export interface XingTaiSuiResult {
  hasXing: boolean;
  xingType?: XingType;
  description?: string;
}

/**
 * 三刑關係
 * - 寅巳申三刑（無恩之刑）
 * - 丑戌未三刑（持勢之刑）
 */
const SAN_XING_GROUPS = [
  ['寅', '巳', '申'],
  ['丑', '戌', '未'],
] as const;

/**
 * 自刑地支
 */
const ZI_XING_BRANCHES: EarthlyBranch[] = ['辰', '午', '酉', '亥'];

/**
 * 無恩之刑（子卯相刑）
 */
const WU_EN_XING: [EarthlyBranch, EarthlyBranch] = ['子', '卯'];

/**
 * 刑太歲檢測 (Xing Tai Sui)
 * 檢測三刑、自刑、無恩之刑
 * 
 * @param annualBranch - 流年地支
 * @param natalBranches - 本命四柱地支（年月日時）
 * @returns 刑太歲結果
 * 
 * @example
 * detectXingTaiSui('寅', ['巳', '申', '子', '午']) // { hasXing: true, xingType: 'san_xing' }
 * detectXingTaiSui('辰', ['辰', '子', '午', '寅']) // { hasXing: true, xingType: 'zi_xing' }
 */
export function detectXingTaiSui(
  annualBranch: EarthlyBranch,
  natalBranches: EarthlyBranch[]
): XingTaiSuiResult {
  // 檢測三刑
  for (const group of SAN_XING_GROUPS) {
    if (group.includes(annualBranch as any)) {
      // 檢查本命盤是否有該組的其他地支
      const hasOtherInGroup = natalBranches.some(
        b => group.includes(b as any) && b !== annualBranch
      );
      if (hasOtherInGroup) {
        return {
          hasXing: true,
          xingType: 'san_xing',
          description: `三刑：${group.join('、')}`,
        };
      }
    }
  }

  // 檢測自刑
  if (ZI_XING_BRANCHES.includes(annualBranch)) {
    if (natalBranches.includes(annualBranch)) {
      return {
        hasXing: true,
        xingType: 'zi_xing',
        description: `自刑：${annualBranch}`,
      };
    }
  }

  // 檢測無恩之刑（子卯）
  if (annualBranch === WU_EN_XING[0] && natalBranches.includes(WU_EN_XING[1])) {
    return {
      hasXing: true,
      xingType: 'wu_en_xing',
      description: '無恩之刑：子卯',
    };
  }
  if (annualBranch === WU_EN_XING[1] && natalBranches.includes(WU_EN_XING[0])) {
    return {
      hasXing: true,
      xingType: 'wu_en_xing',
      description: '無恩之刑：子卯',
    };
  }

  return { hasXing: false };
}

/**
 * 破太歲檢測 (Po Tai Sui)
 * 地支六破關係
 * 
 * 六破對應表：
 * - 子酉破、丑辰破、寅亥破
 * - 卯午破、巳申破、未戌破
 */
const PO_RELATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '酉', '酉': '子',
  '丑': '辰', '辰': '丑',
  '寅': '亥', '亥': '寅',
  '卯': '午', '午': '卯',
  '巳': '申', '申': '巳',
  '未': '戌', '戌': '未',
};

/**
 * 破太歲檢測
 * 
 * @param annualBranch - 流年地支
 * @param natalBranch - 本命地支
 * @returns 是否破太歲
 * 
 * @example
 * detectPoTaiSui('子', '酉') // true - 子酉破
 * detectPoTaiSui('丑', '辰') // true - 丑辰破
 */
export function detectPoTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return PO_RELATIONS[annualBranch] === natalBranch;
}

/**
 * 害太歲檢測 (Hai Tai Sui)
 * 地支六害關係（又稱穿害）
 * 
 * 六害對應表：
 * - 子未害（羊鼠相逢）、丑午害
 * - 寅巳害（蛇虎害）、卯辰害
 * - 申亥害、酉戌害
 */
const HAI_RELATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '未', '未': '子',
  '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅',
  '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申',
  '酉': '戌', '戌': '酉',
};

/**
 * 害太歲檢測
 * 
 * @param annualBranch - 流年地支
 * @param natalBranch - 本命地支
 * @returns 是否害太歲
 * 
 * @example
 * detectHaiTaiSui('子', '未') // true - 羊鼠相逢（子未害）
 * detectHaiTaiSui('寅', '巳') // true - 蛇虎害（寅巳害）
 */
export function detectHaiTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return HAI_RELATIONS[annualBranch] === natalBranch;
}
