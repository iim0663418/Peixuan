/**
 * Advanced Markdown Formatter for Progressive Analysis
 * Converts CalculationResult to AI-friendly Markdown format for advanced analysis
 *
 * Target: ~200 tokens for 5 categories:
 * 1. TenGods matrix (bazi.tenGods)
 * 2. HiddenStems (bazi.hiddenStems)
 * 3. SiHua aggregation (ziwei.sihuaAggregation)
 * 4. Star symmetry (ziwei.starSymmetry)
 * 5. Next year prediction (using NextYearCalculator)
 */

import type { CalculationResult, BirthInfo } from '../calculation/types';
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

  // 1. TenGods Matrix
  sections.push(formatTenGodsMatrix(result));

  // 2. Hidden Stems
  sections.push(formatHiddenStemsAdvanced(result));

  // 3. SiHua Aggregation
  sections.push(formatSihuaAggregation(result));

  // 4. Star Symmetry
  sections.push(formatStarSymmetry(result));

  // 5. Next Year Prediction
  sections.push(formatNextYearBasic(result));

  return sections.join('\n---\n\n');
}

/**
 * Format TenGods matrix for deep personality analysis
 */
function formatTenGodsMatrix(result: CalculationResult): string {
  const { bazi } = result;
  const lines: string[] = ['## 🧠 十神矩陣（深層性格）\n'];

  // TenGods for each pillar
  lines.push('### 十神分布');
  lines.push(`- **年干**（${bazi.fourPillars.year.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.year}**`);
  lines.push(`- **月干**（${bazi.fourPillars.month.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.month}**`);
  lines.push(`- **時干**（${bazi.fourPillars.hour.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.hour}**`);

  // Dominant TenGod identification (simple count)
  const tenGodCounts: Record<string, number> = {};
  [bazi.tenGods.year, bazi.tenGods.month, bazi.tenGods.hour].forEach(god => {
    tenGodCounts[god] = (tenGodCounts[god] || 0) + 1;
  });

  const dominant = Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] > 1) {
    lines.push(`\n**主導十神**：${dominant[0]}（出現 ${dominant[1]} 次）`);
  }

  return lines.join('\n');
}

/**
 * Format HiddenStems for multi-layer personality analysis
 */
function formatHiddenStemsAdvanced(result: CalculationResult): string {
  const { bazi } = result;
  const lines: string[] = ['## 🌊 藏干系統（多層特質）\n'];

  // Year pillar hidden stems
  lines.push('### 年柱藏干');
  lines.push(`- 主氣：${bazi.hiddenStems.year.primary}`);
  if (bazi.hiddenStems.year.middle) {
    lines.push(`- 中氣：${bazi.hiddenStems.year.middle}`);
  }
  if (bazi.hiddenStems.year.residual) {
    lines.push(`- 餘氣：${bazi.hiddenStems.year.residual}`);
  }

  // Month pillar hidden stems
  lines.push('\n### 月柱藏干');
  lines.push(`- 主氣：${bazi.hiddenStems.month.primary}`);
  if (bazi.hiddenStems.month.middle) {
    lines.push(`- 中氣：${bazi.hiddenStems.month.middle}`);
  }
  if (bazi.hiddenStems.month.residual) {
    lines.push(`- 餘氣：${bazi.hiddenStems.month.residual}`);
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

  const { statistics, cycles } = result.ziwei.sihuaAggregation;

  // Statistics
  lines.push(`### 統計`);
  lines.push(`- 化祿：${statistics.lu} 條`);
  lines.push(`- 化權：${statistics.quan} 條`);
  lines.push(`- 化科：${statistics.ke} 條`);
  lines.push(`- 化忌：${statistics.ji} 條`);

  // Cycles (if any)
  if (cycles.jiCycles.length > 0) {
    lines.push(`\n### 化忌循環`);
    cycles.jiCycles.forEach((cycle, idx) => {
      lines.push(`- 循環 ${idx + 1}：${cycle.path.join(' → ')}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format star symmetry for energy balance analysis
 */
function formatStarSymmetry(result: CalculationResult): string {
  const lines: string[] = ['## ⚖️ 星曜對稱（能量平衡）\n'];

  if (!result.ziwei?.starSymmetry?.symmetricPairs) {
    lines.push('無對稱數據');
    return lines.join('\n');
  }

  const { symmetricPairs } = result.ziwei.starSymmetry;

  if (symmetricPairs.length === 0) {
    lines.push('無對稱星系');
    return lines.join('\n');
  }

  lines.push('### 對稱星系');
  symmetricPairs.slice(0, 5).forEach(pair => {
    lines.push(`- ${pair.star1}（第${pair.palace1 + 1}宮）↔ ${pair.star2}（第${pair.palace2 + 1}宮）：${pair.type}`);
  });

  return lines.join('\n');
}

/**
 * Format next year prediction using NextYearCalculator module
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

    // Tai Sui analysis
    const { taiSuiTypes } = nextYearFortune;
    if (taiSuiTypes.severity !== 'NONE') {
      lines.push('\n### 犯太歲預測');
      const taiSuiList: string[] = [];
      if (taiSuiTypes.zhi) taiSuiList.push('值太歲');
      if (taiSuiTypes.chong) taiSuiList.push('沖太歲');
      if (taiSuiTypes.xing) taiSuiList.push('刑太歲');
      if (taiSuiTypes.po) taiSuiList.push('破太歲');
      if (taiSuiTypes.hai) taiSuiList.push('害太歲');
      lines.push(`- **類型**：${taiSuiList.join('、')}`);
      lines.push(`- **嚴重度**：${taiSuiTypes.severity}`);
    } else {
      lines.push('\n### 犯太歲預測');
      lines.push('- **無犯太歲**：流年順遂');
    }

    // Risk assessment
    const { risks } = nextYearFortune;
    lines.push('\n### 風險評估');
    lines.push(`- **健康**：${risks.health}`);
    lines.push(`- **財富**：${risks.wealth}`);
    lines.push(`- **事業**：${risks.career}`);
    lines.push(`- **關係**：${risks.relationship}`);

    // Action recommendations (quarterly)
    const { actionPlan } = nextYearFortune;
    lines.push('\n### 行動建議');

    lines.push('\n**Q1（立春～清明）**');
    lines.push(`- 宜：${actionPlan.q1.suitable.join('、')}`);
    lines.push(`- 忌：${actionPlan.q1.avoid.join('、')}`);

    lines.push('\n**Q2（立夏～小暑）**');
    lines.push(`- 宜：${actionPlan.q2.suitable.join('、')}`);
    lines.push(`- 忌：${actionPlan.q2.avoid.join('、')}`);

    lines.push('\n**Q3（立秋～寒露）**');
    lines.push(`- 宜：${actionPlan.q3.suitable.join('、')}`);
    lines.push(`- 忌：${actionPlan.q3.avoid.join('、')}`);

    lines.push('\n**Q4（立冬～小寒）**');
    lines.push(`- 宜：${actionPlan.q4.suitable.join('、')}`);
    lines.push(`- 忌：${actionPlan.q4.avoid.join('、')}`);

  } catch (error) {
    // Fallback if calculation fails
    lines.push('\n### 計算錯誤');
    lines.push(`無法計算下一年運勢：${error instanceof Error ? error.message : '未知錯誤'}`);
  }

  return lines.join('\n');
}
