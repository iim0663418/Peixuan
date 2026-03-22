/**
 * Next Year Fortune Calculator
 * 
 * Calculates next year's fortune including:
 * - Stem-Branch for next year
 * - Tai Sui types (值/沖/刑/破/害)
 * - Risk assessment (health/wealth/career/relationship)
 * - Quarterly action plan (Q1-Q4)
 */

import type { BirthInfo } from '../types';
import { getLichunTime } from '../core/time/solarTerms';
import { getAnnualPillar } from './liuchun';

/**
 * Tai Sui types and severity
 */
export interface TaiSuiTypes {
  zhi: boolean;      // 值太歲
  chong: boolean;    // 沖太歲
  xing: boolean;     // 刑太歲
  po: boolean;       // 破太歲
  hai: boolean;      // 害太歲
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Risk levels for different life aspects
 */
export interface RiskAssessment {
  health: 'LOW' | 'MEDIUM' | 'HIGH';
  wealth: 'LOW' | 'MEDIUM' | 'HIGH';
  career: 'LOW' | 'MEDIUM' | 'HIGH';
  relationship: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Quarterly action plan
 */
export interface QuarterlyPlan {
  suitable: string[];  // 宜
  avoid: string[];     // 忌
}

/**
 * Action plan for the year
 */
export interface ActionPlan {
  q1: QuarterlyPlan;  // 立春～清明
  q2: QuarterlyPlan;  // 立夏～小暑
  q3: QuarterlyPlan;  // 立秋～寒露
  q4: QuarterlyPlan;  // 立冬～小寒
}

/**
 * Next year fortune result
 */
export interface NextYearFortune {
  year: number;
  stemBranch: { stem: string; branch: string };
  lichunDate: Date;
  taiSuiTypes: TaiSuiTypes;
  risks: RiskAssessment;
  actionPlan: ActionPlan;
}

/**
 * Detect Tai Sui types based on birth year branch and next year branch
 */
function detectTaiSuiTypes(birthBranch: string, nextYearBranch: string): TaiSuiTypes {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const birthIdx = branches.indexOf(birthBranch);
  const nextIdx = branches.indexOf(nextYearBranch);

  const types: TaiSuiTypes = {
    zhi: false,
    chong: false,
    xing: false,
    po: false,
    hai: false,
    severity: 'NONE',
  };

  // 值太歲: same branch
  if (birthIdx === nextIdx) {
    types.zhi = true;
  }

  // 沖太歲: opposite (6 positions apart)
  if ((birthIdx + 6) % 12 === nextIdx) {
    types.chong = true;
  }

  // 刑太歲: 3 positions apart
  if ((birthIdx + 3) % 12 === nextIdx || (birthIdx + 9) % 12 === nextIdx) {
    types.xing = true;
  }

  // 破太歲: 9 positions apart
  if ((birthIdx + 9) % 12 === nextIdx) {
    types.po = true;
  }

  // 害太歲: specific combinations
  const haiPairs = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  for (const [a, b] of haiPairs) {
    if ((birthIdx === a && nextIdx === b) || (birthIdx === b && nextIdx === a)) {
      types.hai = true;
      break;
    }
  }

  // Calculate severity
  const count = [types.zhi, types.chong, types.xing, types.po, types.hai].filter(Boolean).length;
  if (count === 0) {types.severity = 'NONE';}
  else if (count === 1) {types.severity = 'LOW';}
  else if (count === 2) {types.severity = 'MEDIUM';}
  else {types.severity = 'HIGH';}

  return types;
}

/**
 * Assess risks based on Tai Sui types
 */
function assessRisks(taiSuiTypes: TaiSuiTypes): RiskAssessment {
  const { severity } = taiSuiTypes;

  if (severity === 'NONE') {
    return {
      health: 'LOW',
      wealth: 'LOW',
      career: 'LOW',
      relationship: 'LOW',
    };
  }

  if (severity === 'LOW') {
    return {
      health: 'LOW',
      wealth: 'LOW',
      career: 'MEDIUM',
      relationship: 'LOW',
    };
  }

  if (severity === 'MEDIUM') {
    return {
      health: 'MEDIUM',
      wealth: 'MEDIUM',
      career: 'MEDIUM',
      relationship: 'MEDIUM',
    };
  }

  // HIGH severity
  return {
    health: 'HIGH',
    wealth: 'MEDIUM',
    career: 'HIGH',
    relationship: 'HIGH',
  };
}

/**
 * Generate action plan based on Tai Sui types
 */
function generateActionPlan(taiSuiTypes: TaiSuiTypes): ActionPlan {
  const { severity } = taiSuiTypes;

  if (severity === 'NONE') {
    return {
      q1: {
        suitable: ['事業擴展', '投資理財', '學習新技能', '拓展人脈'],
        avoid: ['過度保守', '錯失機會'],
      },
      q2: {
        suitable: ['創新專案', '升遷爭取', '創業規劃', '社交活動'],
        avoid: ['固步自封', '猶豫不決'],
      },
      q3: {
        suitable: ['收穫成果', '擴大影響力', '投資增值', '旅遊進修'],
        avoid: ['驕傲自滿', '忽視風險'],
      },
      q4: {
        suitable: ['總結規劃', '準備衝刺', '資源整合', '關係深化'],
        avoid: ['鬆懈懈怠', '過度樂觀'],
      },
    };
  }

  // With Tai Sui - more cautious approach
  return {
    q1: {
      suitable: ['穩健發展', '健康檢查', '關係維護', '學習充電'],
      avoid: ['冒險投資', '重大決策', '衝動行事'],
    },
    q2: {
      suitable: ['謹慎理財', '團隊合作', '溝通協調', '內部優化'],
      avoid: ['擴張過快', '獨斷專行', '忽視細節'],
    },
    q3: {
      suitable: ['風險管理', '資源整合', '關係修復', '心靈成長'],
      avoid: ['激進變革', '過度消費', '情緒化決策'],
    },
    q4: {
      suitable: ['總結反思', '穩定為主', '儲備能量', '感恩惜福'],
      avoid: ['急於求成', '過度焦慮', '放棄堅持'],
    },
  };
}

/**
 * Calculate next year fortune
 * 
 * @param birthInfo - Birth information
 * @param currentYear - Current year (optional, defaults to current year)
 * @returns Next year fortune prediction
 */
export function calculateNextYear(
  birthInfo: BirthInfo,
  currentYear?: number
): NextYearFortune {
  // Determine next year
  const year = currentYear || new Date().getFullYear();
  const nextYear = year + 1;

  // Get LiChun time and stem-branch for next year
  const lichunDate = getLichunTime(nextYear);
  const stemBranch = getAnnualPillar(lichunDate);

  // Extract birth year branch from birthInfo
  const birthDate = typeof birthInfo.solarDate === 'string' 
    ? new Date(birthInfo.solarDate) 
    : birthInfo.solarDate;
  const birthYearPillar = getAnnualPillar(birthDate);
  const birthYearBranch = birthYearPillar.branch;

  // Detect Tai Sui types
  const taiSuiTypes = detectTaiSuiTypes(birthYearBranch, stemBranch.branch);

  // Assess risks
  const risks = assessRisks(taiSuiTypes);

  // Generate action plan
  const actionPlan = generateActionPlan(taiSuiTypes);

  return {
    year: nextYear,
    stemBranch,
    lichunDate,
    taiSuiTypes,
    risks,
    actionPlan,
  };
}
