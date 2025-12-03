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
    history: [] as Array<{
      chartId: string;
      metadata: ChartMetadata;
      createdAt: Date;
    }>,
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

      // 添加到歷史記錄
      this.addToHistory(chartData);
    },

    addToHistory(chartData: ChartData) {
      const historyItem = {
        chartId: chartData.chartId,
        metadata: chartData.metadata,
        createdAt: chartData.createdAt,
      };

      // 避免重複
      const index = this.history.findIndex(
        (h) => h.chartId === chartData.chartId,
      );
      if (index >= 0) {
        this.history.splice(index, 1);
      }

      // 添加到開頭
      this.history.unshift(historyItem);

      // 限制歷史記錄數量
      if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
      }

      // 保存到 localStorage
      localStorage.setItem('chartHistory', JSON.stringify(this.history));
    },

    loadFromLocalStorage() {
      const chartId = localStorage.getItem('currentChartId');
      const history = localStorage.getItem('chartHistory');

      if (history) {
        this.history = JSON.parse(history);
      }

      return chartId;
    },

    clearCurrentChart() {
      this.currentChart = null;
      localStorage.removeItem('currentChartId');
    },
  },
});
