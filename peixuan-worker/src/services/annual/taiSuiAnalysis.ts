/**
 * 流年太歲綜合分析模組
 * Tai Sui Comprehensive Analysis Module
 */

import type { EarthlyBranch, Pillar } from '../types';
import {
  detectZhiTaiSui,
  detectChongTaiSui,
  detectXingTaiSui,
  detectPoTaiSui,
  detectHaiTaiSui,
  type XingTaiSuiResult,
} from './taiSuiDetection';

/**
 * 太歲分析結果
 */
export interface TaiSuiAnalysisResult {
  /** 值太歲（本命年） */
  zhi: boolean;
  /** 沖太歲（六沖） */
  chong: boolean;
  /** 刑太歲（三刑/自刑/無恩） */
  xing: XingTaiSuiResult;
  /** 破太歲（六破） */
  po: boolean;
  /** 害太歲（六害） */
  hai: boolean;
  /** 綜合嚴重度 */
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  /** 犯太歲類型列表 */
  types: string[];
  /** 建議 */
  recommendations: string[];
}

/**
 * 四柱結構（簡化版）
 */
export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

/**
 * 分析流年太歲
 * 
 * @param annualPillar - 流年干支
 * @param natalChart - 本命四柱
 * @returns 太歲分析結果
 * 
 * @example
 * const result = analyzeTaiSui(
 *   { stem: '乙', branch: '巳' },
 *   { year: {...}, month: {...}, day: {...}, hour: {...} }
 * );
 * // result.severity: 'high'
 * // result.types: ['值太歲', '刑太歲']
 */
export function analyzeTaiSui(
  annualPillar: Pillar,
  natalChart: FourPillars
): TaiSuiAnalysisResult {
  const annualBranch = annualPillar.branch;
  const natalBranches: EarthlyBranch[] = [
    natalChart.year.branch,
    natalChart.month.branch,
    natalChart.day.branch,
    natalChart.hour.branch,
  ];

  // 執行所有檢測
  const zhi = detectZhiTaiSui(annualBranch, natalChart.year.branch);
  const chong = detectChongTaiSui(annualBranch, natalChart.year.branch);
  const xing = detectXingTaiSui(annualBranch, natalBranches);
  const po = detectPoTaiSui(annualBranch, natalChart.year.branch);
  const hai = detectHaiTaiSui(annualBranch, natalChart.year.branch);

  // 收集犯太歲類型
  const types: string[] = [];
  if (zhi) {types.push('值太歲');}
  if (chong) {types.push('沖太歲');}
  if (xing.hasXing) {types.push(`刑太歲（${xing.description}）`);}
  if (po) {types.push('破太歲');}
  if (hai) {types.push('害太歲');}

  // 計算綜合嚴重度
  const severity = calculateSeverity(zhi, chong, xing.hasXing, po, hai);

  // 生成建議
  const recommendations = generateRecommendations(severity, types);

  return {
    zhi,
    chong,
    xing,
    po,
    hai,
    severity,
    types,
    recommendations,
  };
}

/**
 * 計算綜合嚴重度
 * 
 * 嚴重度評分規則：
 * - 值太歲：3 分
 * - 沖太歲：3 分
 * - 刑太歲：2 分
 * - 破太歲：1 分
 * - 害太歲：1 分
 * 
 * 總分對應嚴重度：
 * - 0: none
 * - 1-2: low
 * - 3-4: medium
 * - 5-6: high
 * - 7+: critical
 */
function calculateSeverity(
  zhi: boolean,
  chong: boolean,
  xing: boolean,
  po: boolean,
  hai: boolean
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  let score = 0;
  
  if (zhi) {score += 3;}
  if (chong) {score += 3;}
  if (xing) {score += 2;}
  if (po) {score += 1;}
  if (hai) {score += 1;}

  if (score === 0) {return 'none';}
  if (score <= 2) {return 'low';}
  if (score <= 4) {return 'medium';}
  if (score <= 6) {return 'high';}
  return 'critical';
}

/**
 * 生成建議
 */
function generateRecommendations(
  severity: string,
  types: string[]
): string[] {
  const recommendations: string[] = [];

  if (severity === 'none') {
    recommendations.push('本年度無犯太歲，運勢平穩');
    return recommendations;
  }

  // 通用建議
  recommendations.push('建議年初安太歲，祈求平安順遂');

  // 根據犯太歲類型給予具體建議
  if (types.some(t => t.includes('值太歲'))) {
    recommendations.push('本命年宜低調行事，避免重大變動');
  }

  if (types.some(t => t.includes('沖太歲'))) {
    recommendations.push('注意人際關係，避免衝突爭執');
  }

  if (types.some(t => t.includes('刑太歲'))) {
    recommendations.push('注意法律文書，謹慎處理合約事宜');
  }

  if (types.some(t => t.includes('破太歲'))) {
    recommendations.push('財務保守為宜，避免投機冒險');
  }

  if (types.some(t => t.includes('害太歲'))) {
    recommendations.push('防範小人暗害，謹言慎行');
  }

  // 根據嚴重度給予額外建議
  if (severity === 'high' || severity === 'critical') {
    recommendations.push('建議配戴護身符或吉祥物');
    recommendations.push('可考慮捐血、洗牙等「見血」化解');
  }

  return recommendations;
}
