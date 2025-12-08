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

    loadFromLocalStorage() {
      const chartId = localStorage.getItem('currentChartId');
      if (chartId && !this.currentChart) {
        // 設置一個最小的 ChartData 結構，只包含 chartId
        // 完整資料需要從 API 載入
        this.currentChart = {
          chartId,
          calculation: {} as CalculationResult,
          metadata: {} as ChartMetadata,
          createdAt: new Date(),
        };
      }
      return chartId;
    },

    clearCurrentChart() {
      this.currentChart = null;
      localStorage.removeItem('currentChartId');
    },
  },
});
