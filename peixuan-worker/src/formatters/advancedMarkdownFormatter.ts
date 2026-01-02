/**
 * Advanced Markdown Formatter for Progressive Analysis
 * Converts CalculationResult to AI-friendly Markdown format for advanced analysis
 *
 * Target: ~400 tokens for 4 categories:
 * 1. Fortune Cycles (bazi.fortuneCycles) - current life phase
 * 2. SiHua aggregation (ziwei.sihuaAggregation) - energy flow
 * 3. Star symmetry (ziwei.starSymmetry) - energy balance
 * 4. Six-month forecast (using calculateSixMonthForecast) - future forecast with Lichun awareness
 */

import type { CalculationResult, BirthInfo, StarSymmetry } from '../calculation/types';
import type { SiHuaCycle } from '../calculation/ziwei/sihua/types';
import { calculateSixMonthForecast } from '../services/annualFortune';
import type { YearlyForecast } from '../services/annualFortune';

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

  // 4. Six-Month Forecast
  sections.push(formatSixMonthForecast(result));

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

  // Centrality Analysis
  lines.push('\n### 中心性分析');

  // Stress Nodes (high Ji in-degree)
  if (agg.stressNodes.length > 0) {
    lines.push('**壓力匯聚點**：');
    agg.stressNodes.forEach(node => {
      lines.push(`- ${node.palaceName}（入度 ${node.inDegree}）：能量壓力集中`);
    });
  }

  // Resource Nodes (high Lu out-degree)
  if (agg.resourceNodes.length > 0) {
    lines.push('\n**資源源頭**：');
    agg.resourceNodes.forEach(node => {
      lines.push(`- ${node.palaceName}（出度 ${node.outDegree}）：能量輸出中心`);
    });
  }

  // Graph Statistics
  lines.push('\n### 能量統計');
  lines.push(`- 總飛化邊：${agg.totalEdges} 條`);

  // Edge counts by type
  const jiCount = agg.edgesByType['忌'] || 0;
  const luCount = agg.edgesByType['祿'] || 0;
  const quanCount = agg.edgesByType['權'] || 0;
  const keCount = agg.edgesByType['科'] || 0;
  lines.push(`- 化忌：${jiCount} 條 | 化祿：${luCount} 條 | 化權：${quanCount} 條 | 化科：${keCount} 條`);

  // Max stress and resource palaces
  const maxStressPalaceName = result.ziwei.palaces[agg.maxStressPalace]?.name || '未知';
  const maxResourcePalaceName = result.ziwei.palaces[agg.maxResourcePalace]?.name || '未知';
  lines.push(`- 最大壓力宮：${maxStressPalaceName} | 最大資源宮：${maxResourcePalaceName}`);

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
 * Format six-month forecast using calculateSixMonthForecast
 * Provides dual-period model with Lichun boundary awareness
 */
function formatSixMonthForecast(result: CalculationResult): string {
  const { input, bazi, ziwei } = result;
  const lines: string[] = [];

  try {
    // Convert input dates from string to Date if needed
    const birthDate = typeof input.solarDate === 'string' ? new Date(input.solarDate) : input.solarDate;
    const queryDate = new Date(); // Use current date as query date

    // Get current Dayun for interaction analysis
    const currentDayun = bazi.fortuneCycles?.currentDayun
      ? { stem: bazi.fortuneCycles.currentDayun.stem, branch: bazi.fortuneCycles.currentDayun.branch }
      : undefined;

    // Calculate 6-month forecast
    const forecast: YearlyForecast = calculateSixMonthForecast({
      birthDate,
      queryDate,
      palaces: ziwei.palaces || [],
      fourPillars: bazi.fourPillars,
      currentDayun,
    });

    // Dynamic title based on period dates
    const startMonth = forecast.queryDate.toISOString().slice(0, 7); // YYYY-MM
    const endMonth = forecast.endDate.toISOString().slice(0, 7); // YYYY-MM
    lines.push(`## 🔮 未來半年運勢（${startMonth} - ${endMonth}）\n`);

    // Iterate through periods (1 or 2 periods)
    forecast.periods.forEach((period, index) => {
      const periodNum = index + 1;
      const periodStart = period.startDate.toISOString().split('T')[0];
      const periodEnd = period.endDate.toISOString().split('T')[0];
      const weightPercent = (period.weight * 100).toFixed(1);

      lines.push(`### 時段 ${periodNum}：${period.annualPillar.stem}${period.annualPillar.branch} 年`);
      lines.push(`- **日期範圍**：${periodStart} 至 ${periodEnd}`);
      lines.push(`- **時長**：${period.durationDays.toFixed(0)} 天（權重 ${weightPercent}%）`);
      lines.push(`- **流年干支**：${period.annualPillar.stem}${period.annualPillar.branch}`);

      // Tai Sui analysis
      const taiSui = period.taiSuiAnalysis;
      if (taiSui && taiSui.severity !== 'NONE') {
        const taiSuiList: string[] = [];
        if (taiSui.types.zhi) {taiSuiList.push('值太歲');}
        if (taiSui.types.chong) {taiSuiList.push('沖太歲');}
        if (taiSui.types.xing) {taiSuiList.push('刑太歲');}
        if (taiSui.types.po) {taiSuiList.push('破太歲');}
        if (taiSui.types.hai) {taiSuiList.push('害太歲');}
        lines.push(`- **犯太歲**：${taiSuiList.join('、')}`);
      } else {
        lines.push('- **犯太歲**：無');
      }

      // Add blank line between periods
      if (index < forecast.periods.length - 1) {
        lines.push('');
      }
    });

    // Add cross-year notice if there are 2 periods
    if (forecast.periods.length === 2) {
      lines.push('\n**📌 跨流年說明**');
      const lichunDate = forecast.periods[1].startDate.toISOString().split('T')[0];
      lines.push(`立春日（${lichunDate}）是能量轉換的關鍵分界點，前後運勢特性可能截然不同。`);
    }

  } catch (error) {
    // Fallback if calculation fails
    lines.push('## 🔮 未來半年運勢\n');
    lines.push('### 計算錯誤');
    lines.push(`無法計算運勢：${error instanceof Error ? error.message : '未知錯誤'}`);
  }

  return lines.join('\n');
}
