<template>
  <div class="elements-chart-container section-card">
    <h4>五行能量分佈圖</h4>
    <div style="width: 100%; max-width: 400px; margin: auto">
      <canvas ref="chartCanvasRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type PropType, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js/auto';
import type { ElementsDistribution } from '../utils/baziCalc';

Chart.register(...registerables);

const props = defineProps({
  distribution: {
    type: Object as PropType<ElementsDistribution>,
    required: false,
    default: null,
  },
  chartType: {
    type: String as PropType<'radar' | 'bar' | 'pie'>,
    default: 'radar',
  },
});

const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const elementColors: Record<string, string> = {
  木: 'rgba(75, 192, 192, 0.6)', // 青色
  火: 'rgba(255, 99, 132, 0.6)', // 紅色
  土: 'rgba(255, 206, 86, 0.6)', // 黃色
  金: 'rgba(201, 203, 207, 0.6)', // 白色/灰色
  水: 'rgba(54, 162, 235, 0.6)', // 藍色/黑色
};

const elementBorderColors: Record<string, string> = {
  木: 'rgba(75, 192, 192, 1)',
  火: 'rgba(255, 99, 132, 1)',
  土: 'rgba(255, 206, 86, 1)',
  金: 'rgba(201, 203, 207, 1)',
  水: 'rgba(54, 162, 235, 1)',
};

const createOrUpdateChart = () => {
  if (!chartCanvasRef.value || !props.distribution) {
    return;
  }

  const labels = Object.keys(
    props.distribution,
  ) as (keyof ElementsDistribution)[];
  const dataValues = labels.map((label) => props.distribution![label]);

  const datasets = [
    {
      label: '五行能量',
      data: dataValues,
      backgroundColor: labels.map(
        (label) => elementColors[label] || 'rgba(0,0,0,0.1)',
      ),
      borderColor: labels.map(
        (label) => elementBorderColors[label] || 'rgba(0,0,0,1)',
      ),
      borderWidth: 1,
      pointBackgroundColor: labels.map(
        (label) => elementBorderColors[label] || 'rgba(0,0,0,1)',
      ),
    },
  ];

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets = datasets;
    // 使用類型斷言來更新圖表類型
    (chartInstance.config as any).type = props.chartType;
    chartInstance.update();
  } else {
    chartInstance = new Chart(chartCanvasRef.value, {
      type: props.chartType, // radar, bar, pie
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true, // 保持畫布的寬高比
        scales:
          props.chartType === 'radar'
            ? {
                r: {
                  angleLines: {
                    display: true,
                  },
                  suggestedMin: 0,
                  suggestedMax: Math.max(...dataValues, 0) + 1, // 確保最大值可見
                  pointLabels: {
                    font: {
                      size: 14,
                    },
                  },
                  ticks: {
                    stepSize: 1, // 刻度步長為1
                  },
                },
              }
            : props.chartType === 'bar'
              ? {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                }
              : {},
        plugins: {
          legend: {
            position: props.chartType === 'pie' ? 'top' : 'bottom',
          },
          tooltip: {
            callbacks: {
              label(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null && props.chartType !== 'radar') {
                  label += context.parsed.y;
                } else if (
                  context.parsed.r !== null &&
                  props.chartType === 'radar'
                ) {
                  label += context.parsed.r;
                }
                return label;
              },
            },
          },
        },
      },
    });
  }
};

onMounted(() => {
  createOrUpdateChart();
});

watch(
  () => [props.distribution, props.chartType],
  () => {
    createOrUpdateChart();
  },
  { deep: true },
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.elements-chart-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.elements-chart-container h4 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}
</style>
