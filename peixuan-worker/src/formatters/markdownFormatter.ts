/**
 * Markdown Formatter for Calculation Results
 * Converts CalculationResult to AI-friendly Markdown format
 */

import type { CalculationResult } from '../calculation/types';

/**
 * Formatting options
 */
export interface MarkdownOptions {
  /** Exclude calculation steps and metadata (for AI analysis) */
  excludeSteps?: boolean;
}

/**
 * Format Date to ISO string (YYYY-MM-DD HH:mm:ss)
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Format calculation result as Markdown
 * 
 * @param result - Complete calculation result
 * @param options - Formatting options
 * @returns Markdown formatted string
 */
export function formatToMarkdown(result: CalculationResult, options: MarkdownOptions = {}): string {
  const sections: string[] = [];

  // Header
  sections.push('# 命理分析結果\n');

  // 1. Basic Information
  sections.push(formatBasicInfo(result));

  // 2. BaZi Four Pillars
  sections.push(formatBaZi(result));

  // 3. Fortune Cycles
  if (result.bazi.fortuneCycles) {
    sections.push(formatFortuneCycles(result));
  }

  // 4. ZiWei Purple Star
  sections.push(formatZiWei(result));

  // 5. SiHua Flying Stars (if available)
  if (result.ziwei.siHuaAggregation) {
    sections.push(formatSiHua(result));
  }

  // 6. Annual Fortune (if available)
  if (result.annualFortune) {
    sections.push(formatAnnualFortune(result));
  }

  // 7. Calculation Steps (optional, exclude for AI)
  if (!options.excludeSteps) {
    sections.push(formatCalculationSteps(result));
  }

  // 8. Metadata (optional, exclude for AI)
  if (!options.excludeSteps) {
    sections.push(formatMetadata(result));
  }

  return sections.join('\n---\n\n');
}

/**
 * Format basic information section
 */
function formatBasicInfo(result: CalculationResult): string {
  const { input, bazi } = result;
  const lines: string[] = [
    '## 📋 基本資訊\n',
    `- **出生日期**：${formatDate(input.solarDate)}`,
    `- **性別**：${input.gender === 'male' ? '男' : '女'}`,
    `- **經度**：${input.longitude}°E`,
    `- **真太陽時**：${formatDate(bazi.trueSolarTime)}`,
    `- **儒略日**：${bazi.julianDay}`,
  ];

  if (input.isLeapMonth) {
    lines.push('- **閏月**：是');
  }

  return lines.join('\n');
}

/**
 * Format BaZi four pillars section
 */
function formatBaZi(result: CalculationResult): string {
  const { bazi } = result;
  const sections: string[] = ['## 🎋 八字四柱\n'];

  // Four Pillars Table
  sections.push('### 四柱');
  sections.push('| 柱位 | 天干 | 地支 |');
  sections.push('|------|------|------|');
  sections.push(`| 年柱 | ${bazi.fourPillars.year.stem} | ${bazi.fourPillars.year.branch} |`);
  sections.push(`| 月柱 | ${bazi.fourPillars.month.stem} | ${bazi.fourPillars.month.branch} |`);
  sections.push(`| 日柱 | ${bazi.fourPillars.day.stem} | ${bazi.fourPillars.day.branch} |`);
  sections.push(`| 時柱 | ${bazi.fourPillars.hour.stem} | ${bazi.fourPillars.hour.branch} |`);

  // Hidden Stems
  sections.push('\n### 藏干');
  sections.push(formatHiddenStems('年柱', bazi.hiddenStems.year));
  sections.push(formatHiddenStems('月柱', bazi.hiddenStems.month));
  sections.push(formatHiddenStems('日柱', bazi.hiddenStems.day));
  sections.push(formatHiddenStems('時柱', bazi.hiddenStems.hour));

  // Ten Gods
  sections.push('\n### 十神關係');
  sections.push(`- 年干（${bazi.fourPillars.year.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.year}**`);
  sections.push(`- 月干（${bazi.fourPillars.month.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.month}**`);
  sections.push(`- 時干（${bazi.fourPillars.hour.stem}）→ 日主（${bazi.fourPillars.day.stem}）：**${bazi.tenGods.hour}**`);

  // WuXing Distribution (if available)
  if (bazi.wuxingDistribution) {
    sections.push('\n### 五行分布');
    sections.push(formatWuXingDistribution(bazi.wuxingDistribution));
  }

  return sections.join('\n');
}

/**
 * Format hidden stems for a pillar
 */
function formatHiddenStems(pillar: string, stems: any): string {
  const lines: string[] = [`\n**${pillar}藏干**`];
  lines.push(`- 主氣：${stems.primary}`);
  if (stems.middle) {lines.push(`- 中氣：${stems.middle}`);}
  if (stems.residual) {lines.push(`- 餘氣：${stems.residual}`);}
  return lines.join('\n');
}

/**
 * Format WuXing distribution
 */
function formatWuXingDistribution(dist: any): string {
  const lines: string[] = [];
  
  lines.push('**原始分布**');
  lines.push(`- 木：${dist.raw.Wood || 0}`);
  lines.push(`- 火：${dist.raw.Fire || 0}`);
  lines.push(`- 土：${dist.raw.Earth || 0}`);
  lines.push(`- 金：${dist.raw.Metal || 0}`);
  lines.push(`- 水：${dist.raw.Water || 0}`);

  lines.push('\n**調整後分布**');
  lines.push(`- 木：${dist.adjusted.Wood || 0}`);
  lines.push(`- 火：${dist.adjusted.Fire || 0}`);
  lines.push(`- 土：${dist.adjusted.Earth || 0}`);
  lines.push(`- 金：${dist.adjusted.Metal || 0}`);
  lines.push(`- 水：${dist.adjusted.Water || 0}`);

  if (dist.dominant && Array.isArray(dist.dominant) && dist.dominant.length > 0) {
    lines.push(`\n**優勢五行**：${dist.dominant.join('、')}`);
  }
  if (dist.deficient && Array.isArray(dist.deficient) && dist.deficient.length > 0) {
    lines.push(`**缺失五行**：${dist.deficient.join('、')}`);
  }
  lines.push(`**平衡度**：${(dist.balance * 100).toFixed(1)}%`);

  return lines.join('\n');
}

/**
 * Format fortune cycles section
 */
function formatFortuneCycles(result: CalculationResult): string {
  const { fortuneCycles } = result.bazi;
  if (!fortuneCycles) {return '';}

  const sections: string[] = ['## 🔄 大運流年\n'];

  // QiYun Info
  sections.push('### 起運資訊');
  sections.push(`- **起運日期**：${formatDate(fortuneCycles.qiyunDate)}`);
  sections.push(`- **運行方向**：${fortuneCycles.direction === 'forward' ? '順行' : '逆行'}`);

  // DaYun List
  sections.push('\n### 大運列表\n');
  sections.push('| 大運 | 干支 | 年齡範圍 | 時間範圍 |');
  sections.push('|------|------|----------|----------|');
  
  fortuneCycles.dayunList.forEach((dayun, index) => {
    const startYear = new Date(dayun.startDate).getFullYear();
    const endYear = new Date(dayun.endDate).getFullYear();
    sections.push(`| 第${index + 1}運 | ${dayun.stem}${dayun.branch} | ${dayun.startAge}-${dayun.endAge}歲 | ${startYear}-${endYear} |`);
  });

  // Current DaYun
  if (fortuneCycles.currentDayun) {
    const current = fortuneCycles.currentDayun;
    sections.push(`\n**當前大運**：${current.stem}${current.branch}（${current.startAge}-${current.endAge}歲）`);
  }

  return sections.join('\n');
}

/**
 * Format ZiWei purple star section
 */
function formatZiWei(result: CalculationResult): string {
  const { ziwei } = result;
  const sections: string[] = ['## 🌟 紫微斗數\n'];

  // Basic Info
  sections.push('### 命盤基本資訊');
  sections.push(`- **命宮**：${ziwei.lifePalace.branch}宮（第${ziwei.lifePalace.position}宮）`);
  sections.push(`- **身宮**：${ziwei.bodyPalace.branch}宮（第${ziwei.bodyPalace.position}宮）`);
  sections.push(`- **五行局**：${getBureauName(ziwei.bureau)}`);

  // Main Stars
  sections.push('\n### 主星分布');
  sections.push(`- **紫微星**：第${ziwei.ziWeiPosition}宮`);
  sections.push(`- **天府星**：第${ziwei.tianFuPosition}宮`);

  // Auxiliary Stars
  sections.push('\n### 輔星分布');
  sections.push(`- **文昌**：第${ziwei.auxiliaryStars.wenChang}宮`);
  sections.push(`- **文曲**：第${ziwei.auxiliaryStars.wenQu}宮`);
  sections.push(`- **左輔**：第${ziwei.auxiliaryStars.zuoFu}宮`);
  sections.push(`- **右弼**：第${ziwei.auxiliaryStars.youBi}宮`);

  // Star Symmetry (if available)
  if (ziwei.starSymmetry && ziwei.starSymmetry.length > 0) {
    sections.push('\n### 星曜對稱性');
    ziwei.starSymmetry.forEach(sym => {
      if (sym.symmetryPair) {
        sections.push(`- ${sym.star}（第${sym.position}宮）↔ ${sym.symmetryPair}（第${sym.symmetryPosition}宮）：${sym.symmetryType}`);
      }
    });
  }

  // Palaces (if available)
  if (ziwei.palaces && ziwei.palaces.length > 0) {
    sections.push('\n### 十二宮位\n');
    sections.push('| 宮位 | 地支 | 主星 |');
    sections.push('|------|------|------|');
    ziwei.palaces.forEach(palace => {
      const stars = palace.stars?.map(s => s.name).join('、') || '無';
      sections.push(`| ${palace.meaning} | ${palace.branch} | ${stars} |`);
    });
  }

  return sections.join('\n');
}

/**
 * Get bureau name in Chinese
 */
function getBureauName(bureau: number): string {
  const names: Record<number, string> = {
    2: '水二局',
    3: '木三局',
    4: '金四局',
    5: '土五局',
    6: '火六局',
  };
  return names[bureau] || `${bureau}局`;
}

/**
 * Format SiHua flying stars section
 */
function formatSiHua(result: CalculationResult): string {
  const { siHuaAggregation } = result.ziwei;
  if (!siHuaAggregation) {return '';}

  const sections: string[] = ['## ✨ 四化飛星\n'];

  // Statistics
  sections.push('### 統計資訊');
  sections.push(`- **總飛化邊數**：${siHuaAggregation.totalEdges}`);
  sections.push(`- **生年四化**：${siHuaAggregation.birthYearEdges} 條`);
  sections.push(`- **大限四化**：${siHuaAggregation.decadeEdges} 條`);
  sections.push(`- **流年四化**：${siHuaAggregation.annualEdges} 條`);

  // Cycles
  if (siHuaAggregation.cycles && siHuaAggregation.cycles.length > 0) {
    sections.push('\n### 循環檢測');
    siHuaAggregation.cycles.forEach((cycle, index) => {
      sections.push(`\n**循環 ${index + 1}**（${cycle.type}）`);
      sections.push(`- 路徑：${cycle.path.join(' → ')}`);
      sections.push(`- 長度：${cycle.length}`);
      sections.push(`- 強度：${cycle.strength.toFixed(2)}`);
    });
  }

  // Centrality
  if (siHuaAggregation.centrality) {
    sections.push('\n### 中心性分析');
    
    if (siHuaAggregation.centrality.highInDegree.length > 0) {
      sections.push('\n**壓力匯聚點**（高入度）');
      siHuaAggregation.centrality.highInDegree.forEach(node => {
        sections.push(`- ${node.palace}：入度 ${node.inDegree}`);
      });
    }

    if (siHuaAggregation.centrality.highOutDegree.length > 0) {
      sections.push('\n**資源源頭**（高出度）');
      siHuaAggregation.centrality.highOutDegree.forEach(node => {
        sections.push(`- ${node.palace}：出度 ${node.outDegree}`);
      });
    }
  }

  return sections.join('\n');
}

/**
 * Format annual fortune section
 */
function formatAnnualFortune(result: CalculationResult): string {
  const { annualFortune } = result;
  if (!annualFortune) {return '';}

  const sections: string[] = ['## 📅 流年分析\n'];

  // Annual Pillar
  sections.push('### 流年年柱');
  sections.push(`- **干支**：${annualFortune.annualPillar.stem}${annualFortune.annualPillar.branch}`);

  // Annual Life Palace
  if (annualFortune.annualLifePalace !== undefined && annualFortune.annualLifePalace >= 0) {
    sections.push(`- **流年命宮**：第${annualFortune.annualLifePalace}宮`);
  }

  // Interactions
  if (annualFortune.interactions) {
    const { interactions } = annualFortune;

    // Stem Combinations
    if (interactions.stemCombinations && interactions.stemCombinations.length > 0) {
      sections.push('\n### 天干五合');
      interactions.stemCombinations.forEach(combo => {
        sections.push(`- ${combo.stem1} + ${combo.stem2} → ${combo.result}（${combo.severity}）`);
      });
    }

    // Branch Clashes
    if (interactions.branchClashes && interactions.branchClashes.length > 0) {
      sections.push('\n### 地支六沖');
      interactions.branchClashes.forEach(clash => {
        sections.push(`- ${clash.branch1} ⚔ ${clash.branch2}（${clash.severity}）`);
      });
    }

    // Harmonious Combinations
    if (interactions.harmoniousCombinations && interactions.harmoniousCombinations.length > 0) {
      sections.push('\n### 和諧組合');
      interactions.harmoniousCombinations.forEach(combo => {
        sections.push(`- ${combo.type}：${combo.branches.join('、')} → ${combo.result}`);
      });
    }
  }

  // Tai Sui Analysis
  if (annualFortune.taiSuiAnalysis) {
    const { taiSuiAnalysis } = annualFortune;
    sections.push('\n### 太歲分析');
    
    const violations: string[] = [];
    if (taiSuiAnalysis.zhi) {violations.push('值太歲');}
    if (taiSuiAnalysis.chong) {violations.push('沖太歲');}
    if (taiSuiAnalysis.xing) {violations.push('刑太歲');}
    if (taiSuiAnalysis.po) {violations.push('破太歲');}
    if (taiSuiAnalysis.hai) {violations.push('害太歲');}

    if (violations.length > 0) {
      sections.push(`- **犯太歲類型**：${violations.join('、')}`);
      sections.push(`- **嚴重程度**：${taiSuiAnalysis.severity}`);
      sections.push(`- **總分**：${taiSuiAnalysis.score}`);
    } else {
      sections.push('- **無犯太歲**');
    }
  }

  return sections.join('\n');
}

/**
 * Format calculation steps section
 */
function formatCalculationSteps(result: CalculationResult): string {
  const sections: string[] = ['## 🔧 計算步驟\n'];

  // BaZi Steps
  if (result.bazi.calculationSteps && result.bazi.calculationSteps.length > 0) {
    sections.push('### 八字計算步驟');
    result.bazi.calculationSteps.forEach((step, index) => {
      sections.push(`\n**步驟 ${index + 1}：${step.description}**`);
      sections.push(`- 輸入：\`${JSON.stringify(step.input)}\``);
      sections.push(`- 輸出：\`${JSON.stringify(step.output)}\``);
    });
  }

  // ZiWei Steps
  if (result.ziwei.calculationSteps && result.ziwei.calculationSteps.length > 0) {
    sections.push('\n### 紫微斗數計算步驟');
    result.ziwei.calculationSteps.forEach((step, index) => {
      sections.push(`\n**步驟 ${index + 1}：${step.description}**`);
      sections.push(`- 輸入：\`${JSON.stringify(step.input)}\``);
      sections.push(`- 輸出：\`${JSON.stringify(step.output)}\``);
    });
  }

  return sections.join('\n');
}

/**
 * Format metadata section
 */
function formatMetadata(result: CalculationResult): string {
  const sections: string[] = ['## 📚 元數據\n'];

  // BaZi Metadata
  sections.push('### 八字算法');
  sections.push(`- **算法**：${result.bazi.metadata.algorithms.join('、')}`);
  sections.push(`- **方法**：${result.bazi.metadata.methods.join('、')}`);
  sections.push(`- **參考文獻**：${result.bazi.metadata.references.join('、')}`);

  // ZiWei Metadata
  sections.push('\n### 紫微斗數算法');
  sections.push(`- **算法**：${result.ziwei.metadata.algorithms.join('、')}`);
  sections.push(`- **方法**：${result.ziwei.metadata.methods.join('、')}`);
  sections.push(`- **參考文獻**：${result.ziwei.metadata.references.join('、')}`);

  // Timestamp
  sections.push(`\n**計算時間**：${formatDate(result.timestamp)}`);

  return sections.join('\n');
}
