import { ref, onMounted, watch, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js/auto';
Chart.register(...registerables);
const props = defineProps({
    distribution: {
        type: Object,
        required: false,
        default: null,
    },
    chartType: {
        type: String,
        default: 'radar',
    },
});
const chartCanvasRef = ref(null);
let chartInstance = null;
const elementColors = {
    '木': 'rgba(75, 192, 192, 0.6)', // 青色
    '火': 'rgba(255, 99, 132, 0.6)', // 紅色
    '土': 'rgba(255, 206, 86, 0.6)', // 黃色
    '金': 'rgba(201, 203, 207, 0.6)', // 白色/灰色
    '水': 'rgba(54, 162, 235, 0.6)', // 藍色/黑色
};
const elementBorderColors = {
    '木': 'rgba(75, 192, 192, 1)',
    '火': 'rgba(255, 99, 132, 1)',
    '土': 'rgba(255, 206, 86, 1)',
    '金': 'rgba(201, 203, 207, 1)',
    '水': 'rgba(54, 162, 235, 1)',
};
const createOrUpdateChart = () => {
    if (!chartCanvasRef.value || !props.distribution) {
        return;
    }
    const labels = Object.keys(props.distribution);
    const dataValues = labels.map(label => props.distribution[label]);
    const datasets = [{
            label: '五行能量',
            data: dataValues,
            backgroundColor: labels.map(label => elementColors[label] || 'rgba(0,0,0,0.1)'),
            borderColor: labels.map(label => elementBorderColors[label] || 'rgba(0,0,0,1)'),
            borderWidth: 1,
            pointBackgroundColor: labels.map(label => elementBorderColors[label] || 'rgba(0,0,0,1)'),
        }];
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets = datasets;
        chartInstance.config.type = props.chartType; // 允許圖表類型動態更改
        chartInstance.update();
    }
    else {
        chartInstance = new Chart(chartCanvasRef.value, {
            type: props.chartType, // radar, bar, pie
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // 保持畫布的寬高比
                scales: props.chartType === 'radar' ? {
                    r: {
                        angleLines: {
                            display: true,
                        },
                        suggestedMin: 0,
                        suggestedMax: Math.max(...dataValues, 0) + 1, // 確保最大值可見
                        pointLabels: {
                            font: {
                                size: 14,
                            }
                        },
                        ticks: {
                            stepSize: 1 // 刻度步長為1
                        }
                    }
                } : (props.chartType === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                } : {}),
                plugins: {
                    legend: {
                        position: props.chartType === 'pie' ? 'top' : 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null && props.chartType !== 'radar') {
                                    label += context.parsed.y;
                                }
                                else if (context.parsed.r !== null && props.chartType === 'radar') {
                                    label += context.parsed.r;
                                }
                                return label;
                            }
                        }
                    }
                }
            },
        });
    }
};
onMounted(() => {
    createOrUpdateChart();
});
watch(() => [props.distribution, props.chartType], () => {
    createOrUpdateChart();
}, { deep: true });
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['elements-chart-container']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-chart-container section-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "chartCanvasRef",
});
/** @type {typeof __VLS_ctx.chartCanvasRef} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chartCanvasRef: chartCanvasRef,
        };
    },
    props: {
        distribution: {
            type: Object,
            required: false,
            default: null,
        },
        chartType: {
            type: String,
            default: 'radar',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        distribution: {
            type: Object,
            required: false,
            default: null,
        },
        chartType: {
            type: String,
            default: 'radar',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ElementsChart.vue.js.map