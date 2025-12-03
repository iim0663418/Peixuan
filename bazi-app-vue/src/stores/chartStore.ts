import { defineStore } from 'pinia';
import type { CalculationResult } from '@/services/unifiedApiService';

export interface ChartMetadata {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  longitude: number;
}

export interface ChartData {
  chartId: string;
  calculation: CalculationResult;
  metadata: ChartMetadata;
  createdAt: Date;
}

export const useChartStore = defineStore('chart', {
  state: () => ({
    currentChart: null as ChartData | null,
  }),

  getters: {
    hasChart: (state) => state.currentChart !== null,
    chartId: (state) => state.currentChart?.chartId,
  },

  actions: {
    setCurrentChart(chartData: ChartData) {
      this.currentChart = chartData;

      // 保存到 localStorage (匿名用戶)
      localStorage.setItem('currentChartId', chartData.chartId);
      localStorage.setItem(
        'currentChartMetadata',
        JSON.stringify(chartData.metadata),
      );
    },

    loadFromLocalStorage(): {
      chartId: string | null;
      metadata: ChartMetadata | null;
    } {
      const chartId = localStorage.getItem('currentChartId');
      const metadataStr = localStorage.getItem('currentChartMetadata');

      let metadata: ChartMetadata | null = null;
      if (metadataStr) {
        try {
          metadata = JSON.parse(metadataStr);
        } catch (e) {
          console.error('Failed to parse metadata:', e);
        }
      }

      return { chartId, metadata };
    },

    clearCurrentChart() {
      this.currentChart = null;
      localStorage.removeItem('currentChartId');
      localStorage.removeItem('currentChartMetadata');
    },
  },
});
