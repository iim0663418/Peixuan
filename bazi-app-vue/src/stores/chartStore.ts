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
    },

    loadFromLocalStorage(): string | null {
      return localStorage.getItem('currentChartId');
    },

    clearCurrentChart() {
      this.currentChart = null;
      localStorage.removeItem('currentChartId');
    },
  },
});
