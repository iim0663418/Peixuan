import type { CalculationResult } from '../services/unifiedApiService';

/**
 * Backend chart response structure from /api/charts/:id endpoint
 */
export interface BackendChartResponse {
  id: string;
  chartData: any; // Backend raw format (not yet transformed)
  metadata: {
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
    longitude: number;
  };
  createdAt: string;
}

/**
 * Transform backend chart data format to frontend format
 * Converts stem/branch to gan/zhi and English element keys to Chinese
 */
function transformBackendChartData(backendResult: any): CalculationResult {
  return {
    chartId: backendResult.chartId,
    ...backendResult,
    bazi: {
      ...backendResult.bazi,
      fourPillars: {
        year: {
          gan: backendResult.bazi.fourPillars.year.stem,
          zhi: backendResult.bazi.fourPillars.year.branch,
        },
        month: {
          gan: backendResult.bazi.fourPillars.month.stem,
          zhi: backendResult.bazi.fourPillars.month.branch,
        },
        day: {
          gan: backendResult.bazi.fourPillars.day.stem,
          zhi: backendResult.bazi.fourPillars.day.branch,
        },
        hour: {
          gan: backendResult.bazi.fourPillars.hour.stem,
          zhi: backendResult.bazi.fourPillars.hour.branch,
        },
      },
      // Transform wuxingDistribution: merge tiangan + hiddenStems and convert English to Chinese
      wuxingDistribution: backendResult.bazi.wuxingDistribution
        ? {
            raw: {
              木:
                (backendResult.bazi.wuxingDistribution.raw.tiangan['Wood'] ||
                  0) +
                (backendResult.bazi.wuxingDistribution.raw.hiddenStems[
                  'Wood'
                ] || 0),
              火:
                (backendResult.bazi.wuxingDistribution.raw.tiangan['Fire'] ||
                  0) +
                (backendResult.bazi.wuxingDistribution.raw.hiddenStems[
                  'Fire'
                ] || 0),
              土:
                (backendResult.bazi.wuxingDistribution.raw.tiangan['Earth'] ||
                  0) +
                (backendResult.bazi.wuxingDistribution.raw.hiddenStems[
                  'Earth'
                ] || 0),
              金:
                (backendResult.bazi.wuxingDistribution.raw.tiangan['Metal'] ||
                  0) +
                (backendResult.bazi.wuxingDistribution.raw.hiddenStems[
                  'Metal'
                ] || 0),
              水:
                (backendResult.bazi.wuxingDistribution.raw.tiangan['Water'] ||
                  0) +
                (backendResult.bazi.wuxingDistribution.raw.hiddenStems[
                  'Water'
                ] || 0),
            },
            adjusted: {
              木: backendResult.bazi.wuxingDistribution.adjusted['Wood'] || 0,
              火: backendResult.bazi.wuxingDistribution.adjusted['Fire'] || 0,
              土:
                backendResult.bazi.wuxingDistribution.adjusted['Earth'] || 0,
              金:
                backendResult.bazi.wuxingDistribution.adjusted['Metal'] || 0,
              水:
                backendResult.bazi.wuxingDistribution.adjusted['Water'] || 0,
            },
            dominant: backendResult.bazi.wuxingDistribution.dominant,
            deficient: backendResult.bazi.wuxingDistribution.deficient,
            balance: backendResult.bazi.wuxingDistribution.balance,
          }
        : undefined,
      // Parse Date strings in fortuneCycles
      fortuneCycles: backendResult.bazi.fortuneCycles
        ? {
            ...backendResult.bazi.fortuneCycles,
            qiyunDate: new Date(backendResult.bazi.fortuneCycles.qiyunDate),
            dayunList: backendResult.bazi.fortuneCycles.dayunList.map(
              (dayun: any) => ({
                ...dayun,
                startDate: new Date(dayun.startDate),
                endDate: new Date(dayun.endDate),
              }),
            ),
            currentDayun: backendResult.bazi.fortuneCycles.currentDayun
              ? {
                  ...backendResult.bazi.fortuneCycles.currentDayun,
                  startDate: new Date(
                    backendResult.bazi.fortuneCycles.currentDayun.startDate,
                  ),
                  endDate: new Date(
                    backendResult.bazi.fortuneCycles.currentDayun.endDate,
                  ),
                }
              : null,
          }
        : undefined,
    },
    ziwei: {
      ...backendResult.ziwei,
      lifePalace: {
        name: backendResult.ziwei.lifePalace.branch,
        position: backendResult.ziwei.lifePalace.position,
        index: backendResult.ziwei.lifePalace.position,
      },
      bodyPalace: {
        name: backendResult.ziwei.bodyPalace.branch,
        position: backendResult.ziwei.bodyPalace.position,
        index: backendResult.ziwei.bodyPalace.position,
      },
    },
    // Transform annualFortune element names to Chinese
    annualFortune: backendResult.annualFortune
      ? {
          ...backendResult.annualFortune,
          interactions: {
            ...backendResult.annualFortune.interactions,
            harmoniousCombinations:
              backendResult.annualFortune.interactions.harmoniousCombinations.map(
                (combo: any) => ({
                  ...combo,
                  result: elementToChinese(combo.element),
                }),
              ),
          },
        }
      : undefined,
  };
}

/**
 * Convert English element name to Chinese
 */
function elementToChinese(element: string): string {
  const map: Record<string, string> = {
    Wood: '木局',
    Fire: '火局',
    Earth: '土局',
    Metal: '金局',
    Water: '水局',
  };
  return map[element] || element;
}

/**
 * Load cached chart from backend
 * @param chartId - Chart ID to load
 * @returns Promise resolving to CalculationResult or null if not found
 */
export async function loadCachedChart(
  chartId: string,
): Promise<CalculationResult | null> {
  try {
    const url = `/api/charts/${chartId}`;
    const response = await fetch(url);

    if (response.ok) {
      const data: BackendChartResponse = await response.json();
      // Transform backend format to frontend format
      return transformBackendChartData(data.chartData);
    }
    console.warn(
      '[chartCache] Response not OK:',
      response.status,
      response.statusText,
    );
    return null;
  } catch (err) {
    console.error('[chartCache] Failed to load cached chart:', err);
    return null;
  }
}
