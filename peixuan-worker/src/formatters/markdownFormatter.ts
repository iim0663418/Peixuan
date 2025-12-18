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
  /** Personality analysis only (exclude fortune/sihua/annual for focused personality insights) */
  personalityOnly?: boolean;
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

  // 3. Ten Gods Matrix
  sections.push(formatTenGodsMatrix(result));

  // 4. Hidden Stems Advanced
  sections.push(formatHiddenStemsAdvanced(result));

  // 5. Fortune Cycles (exclude in personality-only mode)
  if (result.bazi.fortuneCycles && !options.personalityOnly) {
    sections.push(formatFortuneCycles(result));
  }

  // 6. ZiWei Purple Star
  sections.push(formatZiWei(result, options));

  // 7. SiHua Flying Stars (exclude in personality-only mode)
  if (result.ziwei.siHuaAggregation && !options.personalityOnly) {
    sections.push(formatSiHua(result));
  }

  // 8. Annual Fortune (exclude in personality-only mode)
  if (result.annualFortune && !options.personalityOnly) {
    sections.push(formatAnnualFortune(result));
  }

  // 9. Calculation Steps (optional, exclude for AI)
  if (!options.excludeSteps) {
    sections.push(formatCalculationSteps(result));
  }

  // 10. Metadata (optional, exclude for AI)
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
function formatZiWei(result: CalculationResult, options: MarkdownOptions): string {
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

  // Auxiliary Stars with brightness information
  // HOTFIX: Preserve star brightness for frontend CSS rendering
  sections.push('\n### 輔星分布');
  const auxiliaryStarsInfo = [
    { name: '文昌', key: 'wenChang' as const },
    { name: '文曲', key: 'wenQu' as const },
    { name: '左輔', key: 'zuoFu' as const },
    { name: '右弼', key: 'youBi' as const }
  ];

  auxiliaryStarsInfo.forEach(({ name, key }) => {
    const position = ziwei.auxiliaryStars[key];
    // Find brightness from palaces data
    const palace = ziwei.palaces?.find(p => p.position === position);
    const star = palace?.stars?.find(s => s.name === name);
    const brightness = star?.brightness;

    if (brightness) {
      sections.push(`- **${name}**：第${position}宮 (${brightness})`);
    } else {
      sections.push(`- **${name}**：第${position}宮`);
    }
  });

  // Star Symmetry (if available) - Skip in personality-only mode
  // Star symmetry is dynamic data, better suited for fortune analysis
  if (ziwei.starSymmetry && ziwei.starSymmetry.length > 0 && !options.personalityOnly) {
    sections.push('\n### 星曜對稱性');
    ziwei.starSymmetry.forEach(sym => {
      if (sym.symmetryPair) {
        sections.push(`- ${sym.star}（第${sym.position}宮）↔ ${sym.symmetryPair}（第${sym.symmetryPosition}宮）：${sym.symmetryType}`);
      }
    });
  }

  // Palaces (if available)
  // HOTFIX: Preserve star brightness information for frontend CSS rendering
  if (ziwei.palaces && ziwei.palaces.length > 0) {
    sections.push('\n### 十二宮位\n');
    sections.push('| 宮位 | 地支 | 主星 |');
    sections.push('|------|------|------|');
    ziwei.palaces.forEach(palace => {
      // Include brightness metadata in markdown format: StarName(brightness)
      const stars = palace.stars?.map(s => {
        if (s.brightness) {
          return `${s.name}(${s.brightness})`;
        }
        return s.name;
      }).join('、') || '無';
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

  const sections: string[] = [];

  // Use yearlyForecast if available (new format)
  if (annualFortune.yearlyForecast) {
    const { yearlyForecast } = annualFortune;
    const { queryDate, endDate, periods } = yearlyForecast;

    // Format header with date range
    const startDateStr = formatDate(queryDate).split(' ')[0]; // YYYY-MM-DD
    const endDateStr = formatDate(endDate).split(' ')[0]; // YYYY-MM-DD
    sections.push(`## 📅 未來一年運勢（${startDateStr} → ${endDateStr}）\n`);

    // Check if there are two periods (Lichun exists)
    if (periods.length === 2) {
      const currentPeriod = periods[0];
      const nextPeriod = periods[1];

      // Current year period
      sections.push('### 當前年運（立春前）');
      const currentStart = formatDate(currentPeriod.startDate).split(' ')[0];
      const currentEnd = formatDate(currentPeriod.endDate).split(' ')[0];
      const currentPercent = (currentPeriod.weight * 100).toFixed(1);
      sections.push(`- **時段**：${currentStart} → ${currentEnd}（剩餘 ${currentPeriod.durationDays} 天，佔比 ${currentPercent}%）`);
      sections.push(`- **干支**：${currentPeriod.annualPillar.stem}${currentPeriod.annualPillar.branch}`);
      sections.push(`- **流年命宮**：第${currentPeriod.annualLifePalacePosition}宮`);

      // Tai Sui analysis for current period
      if (currentPeriod.taiSuiAnalysis) {
        sections.push('\n**太歲分析**：');
        const { taiSuiAnalysis } = currentPeriod;
        const isFanTaiSui = taiSuiAnalysis.types.length > 0;
        sections.push(`- 犯太歲：${isFanTaiSui ? '是' : '否'}`);
        sections.push(`- 沖太歲：${taiSuiAnalysis.chong ? '是' : '否'}${taiSuiAnalysis.chong && taiSuiAnalysis.severity !== 'none' ? `（${taiSuiAnalysis.severity.toUpperCase()}）` : ''}`);
        if (isFanTaiSui) {
          sections.push(`- 類型：${taiSuiAnalysis.types.join('、')}`);
          sections.push(`- 嚴重度：${taiSuiAnalysis.severity.toUpperCase()}`);
        }
      }

      // Interactions for current period
      if (currentPeriod.interactions) {
        sections.push('\n**干支交互**：');
        const { interactions } = currentPeriod;

        if (interactions.stemCombinations.length > 0) {
          const combos = interactions.stemCombinations.map(c => `${c.pillar}柱（${c.element}）`).join('、');
          sections.push(`- 天干五合：${combos}`);
        }

        if (interactions.branchClashes.length > 0) {
          const clashes = interactions.branchClashes.map(c => `${c.pillar}柱（${c.severity.toUpperCase()}）`).join('、');
          sections.push(`- 地支六沖：${clashes}`);
        }

        if (interactions.harmoniousCombinations.length > 0) {
          const harmonies = interactions.harmoniousCombinations.map(h => `${h.type === 'sanhe' ? '三合' : '三會'}（${h.branches.join('')}→${h.element}）`).join('、');
          sections.push(`- 和諧組合：${harmonies}`);
        }

        if (interactions.stemCombinations.length === 0 && interactions.branchClashes.length === 0 && interactions.harmoniousCombinations.length === 0) {
          sections.push('- 無明顯交互');
        }
      }

      // Next year period
      sections.push('\n### 下一年運（立春後）');
      const nextStart = formatDate(nextPeriod.startDate).split(' ')[0];
      const nextEnd = formatDate(nextPeriod.endDate).split(' ')[0];
      const nextPercent = (nextPeriod.weight * 100).toFixed(1);
      sections.push(`- **時段**：${nextStart} → ${nextEnd}（${nextPeriod.durationDays} 天，佔比 ${nextPercent}%）`);
      sections.push(`- **干支**：${nextPeriod.annualPillar.stem}${nextPeriod.annualPillar.branch}`);
      sections.push(`- **流年命宮**：第${nextPeriod.annualLifePalacePosition}宮`);

      // Tai Sui analysis for next period
      if (nextPeriod.taiSuiAnalysis) {
        sections.push('\n**太歲分析**：');
        const { taiSuiAnalysis } = nextPeriod;
        const isFanTaiSui = taiSuiAnalysis.types.length > 0;
        sections.push(`- 犯太歲：${isFanTaiSui ? '是' : '否'}`);
        sections.push(`- 沖太歲：${taiSuiAnalysis.chong ? '是' : '否'}${taiSuiAnalysis.chong && taiSuiAnalysis.severity !== 'none' ? `（${taiSuiAnalysis.severity.toUpperCase()}）` : ''}`);
        if (isFanTaiSui) {
          sections.push(`- 類型：${taiSuiAnalysis.types.join('、')}`);
          sections.push(`- 嚴重度：${taiSuiAnalysis.severity.toUpperCase()}`);
        }
      }

      // Interactions for next period
      if (nextPeriod.interactions) {
        sections.push('\n**干支交互**：');
        const { interactions } = nextPeriod;

        if (interactions.stemCombinations.length > 0) {
          const combos = interactions.stemCombinations.map(c => `${c.pillar}柱（${c.element}）`).join('、');
          sections.push(`- 天干五合：${combos}`);
        }

        if (interactions.branchClashes.length > 0) {
          const clashes = interactions.branchClashes.map(c => `${c.pillar}柱（${c.severity.toUpperCase()}）`).join('、');
          sections.push(`- 地支六沖：${clashes}`);
        }

        if (interactions.harmoniousCombinations.length > 0) {
          const harmonies = interactions.harmoniousCombinations.map(h => `${h.type === 'sanhe' ? '三合' : '三會'}（${h.branches.join('')}→${h.element}）`).join('、');
          sections.push(`- 和諧組合：${harmonies}`);
        }

        if (interactions.stemCombinations.length === 0 && interactions.branchClashes.length === 0 && interactions.harmoniousCombinations.length === 0) {
          sections.push('- 無明顯交互');
        }
      }

      // Lichun transition reminder
      const lichunDate = formatDate(nextPeriod.startDate).split(' ')[0];
      sections.push(`\n**⚠️ 立春轉換提醒**：${lichunDate} 立春，能量將從 ${currentPeriod.annualPillar.stem}${currentPeriod.annualPillar.branch} 年切換至 ${nextPeriod.annualPillar.stem}${nextPeriod.annualPillar.branch} 年，請注意運勢轉折。`);
    } else {
      // Single period (no Lichun in forecast range)
      const period = periods[0];
      sections.push('### 當前年運');
      const startStr = formatDate(period.startDate).split(' ')[0];
      const endStr = formatDate(period.endDate).split(' ')[0];
      sections.push(`- **時段**：${startStr} → ${endStr}（${period.durationDays} 天）`);
      sections.push(`- **干支**：${period.annualPillar.stem}${period.annualPillar.branch}`);
      sections.push(`- **流年命宮**：第${period.annualLifePalacePosition}宮`);

      // Tai Sui analysis for single period
      if (period.taiSuiAnalysis) {
        sections.push('\n**太歲分析**：');
        const { taiSuiAnalysis } = period;
        const isFanTaiSui = taiSuiAnalysis.types.length > 0;
        sections.push(`- 犯太歲：${isFanTaiSui ? '是' : '否'}`);
        sections.push(`- 沖太歲：${taiSuiAnalysis.chong ? '是' : '否'}${taiSuiAnalysis.chong && taiSuiAnalysis.severity !== 'none' ? `（${taiSuiAnalysis.severity.toUpperCase()}）` : ''}`);
        if (isFanTaiSui) {
          sections.push(`- 類型：${taiSuiAnalysis.types.join('、')}`);
          sections.push(`- 嚴重度：${taiSuiAnalysis.severity.toUpperCase()}`);
        }
      }

      // Interactions for single period
      if (period.interactions) {
        sections.push('\n**干支交互**：');
        const { interactions } = period;

        if (interactions.stemCombinations.length > 0) {
          const combos = interactions.stemCombinations.map(c => `${c.pillar}柱（${c.element}）`).join('、');
          sections.push(`- 天干五合：${combos}`);
        }

        if (interactions.branchClashes.length > 0) {
          const clashes = interactions.branchClashes.map(c => `${c.pillar}柱（${c.severity.toUpperCase()}）`).join('、');
          sections.push(`- 地支六沖：${clashes}`);
        }

        if (interactions.harmoniousCombinations.length > 0) {
          const harmonies = interactions.harmoniousCombinations.map(h => `${h.type === 'sanhe' ? '三合' : '三會'}（${h.branches.join('')}→${h.element}）`).join('、');
          sections.push(`- 和諧組合：${harmonies}`);
        }

        if (interactions.stemCombinations.length === 0 && interactions.branchClashes.length === 0 && interactions.harmoniousCombinations.length === 0) {
          sections.push('- 無明顯交互');
        }
      }
    }
  } else {
    // Fallback to old format for backward compatibility
    sections.push('## 📅 流年分析\n');

    // Annual Pillar
    sections.push('### 流年年柱');
    sections.push(`- **干支**：${annualFortune.annualPillar.stem}${annualFortune.annualPillar.branch}`);

    // Annual Life Palace
    if (annualFortune.annualLifePalace !== undefined && annualFortune.annualLifePalace >= 0) {
      sections.push(`- **流年命宮**：第${annualFortune.annualLifePalace}宮`);
    }
  }

  // Interactions (common to both formats)
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

  // Tai Sui Analysis (common to both formats)
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
