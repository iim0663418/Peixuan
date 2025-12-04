/**
 * Advanced Markdown Formatter for Progressive Analysis
 * Converts CalculationResult to AI-friendly Markdown format for advanced analysis
 *
 * Target: ~400 tokens for 4 categories:
 * 1. Fortune Cycles (bazi.fortuneCycles) - current life phase
 * 2. SiHua aggregation (ziwei.sihuaAggregation) - energy flow
 * 3. Star symmetry (ziwei.starSymmetry) - energy balance
 * 4. Next year prediction (using NextYearCalculator) - future forecast
 */

import type { CalculationResult, BirthInfo, StarSymmetry } from '../calculation/types';
import type { SiHuaCycle } from '../calculation/ziwei/sihua/types';
import { calculateNextYear } from '../calculation/annual/nextYearCalculator';

/**
 * Format calculation result as Markdown for advanced analysis
 *
 * @param result - Complete calculation result
 * @returns Markdown formatted string (~200 tokens)
 */
export function formatAdvancedMarkdown(result: CalculationResult): string {
  const sections: string[] = [];

  // Header
  sections.push('# 進階分析數據\n');

  // 1. Fortune Cycles (current life phase)
  sections.push(formatFortuneCyclesAdvanced(result));

  // 2. SiHua Aggregation
  sections.push(formatSihuaAggregation(result));

  // 3. Star Symmetry
  sections.push(formatStarSymmetry(result));

  // 4. Next Year Prediction
  sections.push(formatNextYearBasic(result));

  return sections.join('\n---\n\n');
}

/**
 * Format Fortune Cycles for life phase context (simplified for advanced analysis)
 */
function formatFortuneCyclesAdvanced(result: CalculationResult): string {
  const { fortuneCycles } = result.bazi;
  const lines: string[] = ['## 🔄 大運流年（人生階段）\n'];

  if (!fortuneCycles) {
    lines.push('無大運數據');
    return lines.join('\n');
  }

  // Current DaYun (most important for predictions)
  if (fortuneCycles.currentDayun) {
    const current = fortuneCycles.currentDayun;
    lines.push('### 當前大運');
    lines.push(`- **干支**：${current.stem}${current.branch}`);
    lines.push(`- **年齡**：${current.startAge}-${current.endAge}歲`);
    lines.push(`- **方向**：${fortuneCycles.direction === 'forward' ? '順行' : '逆行'}`);
  }

  return lines.join('\n');
}

/**
 * Format SiHua aggregation for energy flow analysis
 */
function formatSihuaAggregation(result: CalculationResult): string {
  const lines: string[] = ['## 🔄 四化飛星（能量流動）\n'];

  if (!result.ziwei?.sihuaAggregation) {
    lines.push('無四化數據');
    return lines.join('\n');
  }

  const agg = result.ziwei.sihuaAggregation;

  // Count total cycles
  const totalCycles = agg.jiCycles.length + agg.luCycles.length + agg.quanCycles.length + agg.keCycles.length;

  if (totalCycles === 0) {
    lines.push('無循環檢測');
    return lines.join('\n');
  }

  // Ji Cycles (most important)
  if (agg.jiCycles.length > 0) {
    lines.push(`### 化忌循環（${agg.jiCycles.length} 個）`);
    agg.jiCycles.forEach((cycle: SiHuaCycle, idx: number) => {
      lines.push(`- 循環 ${idx + 1}：${cycle.description || cycle.palaces.join(' → ')}`);
    });
  }

  // Lu Cycles
  if (agg.luCycles.length > 0) {
    lines.push(`\n### 化祿循環（${agg.luCycles.length} 個）`);
    agg.luCycles.forEach((cycle: SiHuaCycle, idx: number) => {
      lines.push(`- 循環 ${idx + 1}：${cycle.description || cycle.palaces.join(' → ')}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format star symmetry for energy balance analysis
 * Optimized: Only show main stars to reduce token usage and focus on fortune prediction
 */
function formatStarSymmetry(result: CalculationResult): string {
  const lines: string[] = ['## ⚖️ 星曜對稱（能量平衡）\n'];

  if (!result.ziwei?.starSymmetry || !Array.isArray(result.ziwei.starSymmetry)) {
    lines.push('無對稱數據');
    return lines.join('\n');
  }

  const symmetricPairs = result.ziwei.starSymmetry;

  if (symmetricPairs.length === 0) {
    lines.push('無對稱星系');
    return lines.join('\n');
  }

  // Filter to main stars only to reduce token usage
  const mainStars = ['紫微', '天府', '太陽', '太陰', '天機', '天梁'];
  const mainSymmetry = symmetricPairs.filter((pair: StarSymmetry) => 
    mainStars.includes(pair.star)
  ).slice(0, 3); // Limit to top 3 main star pairs

  if (mainSymmetry.length === 0) {
    lines.push('主星對稱：紫微、天府等主星形成能量平衡結構');
    return lines.join('\n');
  }

  lines.push('### 主星對稱');
  mainSymmetry.forEach((pair: StarSymmetry) => {
    lines.push(`- ${pair.star}（第${pair.position + 1}宮）↔ ${pair.symmetryPair}（第${(pair.symmetryPosition ?? 0) + 1}宮）：${pair.symmetryType}`);
  });

  return lines.join('\n');
}

/**
 * Format next year prediction using NextYearCalculator module
 * Simplified to provide only basic facts, letting AI interpret freely
 */
function formatNextYearBasic(result: CalculationResult): string {
  const { input, annualFortune } = result;
  const lines: string[] = ['## 🔮 下一年預測\n'];

  // Calculate current year for context
  const currentYear = new Date().getFullYear();
  const currentStem = annualFortune?.annualPillar.stem || '';
  const currentBranch = annualFortune?.annualPillar.branch || '';

  try {
    // Convert input dates from string to Date if needed
    const birthInfo: BirthInfo = {
      ...input,
      solarDate: typeof input.solarDate === 'string' ? new Date(input.solarDate) : input.solarDate,
    };

    // Use NextYearCalculator to get full prediction
    const nextYearFortune = calculateNextYear(birthInfo, currentYear);

    // Next year overview
    lines.push(`### ${nextYearFortune.year} 年干支`);
    lines.push(`- **當前年份**：${currentYear}（${currentStem}${currentBranch}）`);
    lines.push(`- **下一年**：${nextYearFortune.year}（${nextYearFortune.stemBranch.stem}${nextYearFortune.stemBranch.branch}）`);
    lines.push(`- **立春時間**：${nextYearFortune.lichunDate.toISOString().split('T')[0]}`);

    // Tai Sui analysis (facts only, no severity rating)
    const { taiSuiTypes } = nextYearFortune;
    if (taiSuiTypes.severity !== 'NONE') {
      lines.push('\n### 犯太歲');
      const taiSuiList: string[] = [];
      if (taiSuiTypes.zhi) {
        taiSuiList.push('值太歲');
      }
      if (taiSuiTypes.chong) {
        taiSuiList.push('沖太歲');
      }
      if (taiSuiTypes.xing) {
        taiSuiList.push('刑太歲');
      }
      if (taiSuiTypes.po) {
        taiSuiList.push('破太歲');
      }
      if (taiSuiTypes.hai) {
        taiSuiList.push('害太歲');
      }
      lines.push(`- **類型**：${taiSuiList.join('、')}`);
    } else {
      lines.push('\n### 犯太歲');
      lines.push('- **無犯太歲**');
    }

  } catch (error) {
    // Fallback if calculation fails
    lines.push('\n### 計算錯誤');
    lines.push(`無法計算下一年運勢：${error instanceof Error ? error.message : '未知錯誤'}`);
  }

  return lines.join('\n');
}
