import type { CalculationResult } from '../services/unifiedApiService';

/**
 * Backend chart response structure from /api/charts/:id endpoint
 */
export interface BackendChartResponse {
  id: string;
  chartData: CalculationResult;
  metadata: {
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
    longitude: number;
  };
  createdAt: string;
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
      return data.chartData;
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
