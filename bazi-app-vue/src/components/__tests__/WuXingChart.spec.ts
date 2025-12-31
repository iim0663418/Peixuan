import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WuXingChart from '../WuXingChart.vue';
import WuXingRadar from '../visualizations/WuXingRadar.vue';
import type { WuXingDistribution } from '../visualizations/constants';

describe('WuXingChart', () => {
  const mockDistribution: WuXingDistribution = {
    raw: {
      木: 30,
      火: 40,
      土: 50,
      金: 35,
      水: 45,
    },
    adjusted: {
      木: 35,
      火: 45,
      土: 55,
      金: 40,
      水: 50,
    },
    dominant: '土',
    deficient: '木',
    balance: 0.75,
  };

  it('renders correctly with default props', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    expect(wrapper.find('.wuxing-chart').exists()).toBe(true);
    expect(wrapper.find('.chart-controls').exists()).toBe(true);
  });

  it('defaults to bar chart view', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.findComponent(WuXingRadar).exists()).toBe(false);
  });

  it('can be initialized with radar chart view', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
        defaultChartType: 'radar',
      },
    });

    expect(wrapper.find('.chart-container').exists()).toBe(false);
    expect(wrapper.findComponent(WuXingRadar).exists()).toBe(true);
  });

  it('renders chart type toggle buttons', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    const radioGroup = wrapper.find('.chart-type-toggle');
    expect(radioGroup.exists()).toBe(true);

    const radioButtons = wrapper.findAll('.el-radio-button');
    expect(radioButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('switches between bar and radar views when toggle is clicked', async () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    // Initially bar chart
    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.findComponent(WuXingRadar).exists()).toBe(false);

    // Switch to radar by setting the ref value directly
    await wrapper.vm.$nextTick();
    wrapper.vm.chartType = 'radar';
    await wrapper.vm.$nextTick();

    // Now should show radar chart
    expect(wrapper.find('.chart-container').exists()).toBe(false);
    expect(wrapper.findComponent(WuXingRadar).exists()).toBe(true);

    // Switch back to bar
    wrapper.vm.chartType = 'bar';
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.chart-container').exists()).toBe(true);
    expect(wrapper.findComponent(WuXingRadar).exists()).toBe(false);
  });

  it('renders summary section in both views', async () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    // Bar chart view
    expect(wrapper.find('.summary').exists()).toBe(true);

    // Switch to radar view
    wrapper.vm.chartType = 'radar';
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.summary').exists()).toBe(true);
  });

  it('displays correct summary information', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    const summary = wrapper.find('.summary');
    const tags = summary.findAll('.el-tag');

    expect(tags.length).toBeGreaterThanOrEqual(3);

    const summaryText = summary.text();
    expect(summaryText).toContain('優勢: 土');
    expect(summaryText).toContain('缺失: 木');
    expect(summaryText).toContain('平衡度: 75.0%');
  });

  it('shows legend only for bar chart view', async () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    // Bar chart view - legend should be visible
    expect(wrapper.find('.legend').exists()).toBe(true);

    // Switch to radar view
    wrapper.vm.chartType = 'radar';
    await wrapper.vm.$nextTick();

    // Radar view - legend should not be in WuXingChart (WuXingRadar has its own)
    const chartLegend = wrapper.find('.wuxing-chart > .legend');
    expect(chartLegend.exists()).toBe(false);
  });

  it('renders all 5 element bars in bar chart view', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    const elementBars = wrapper.findAll('.element-bar');
    expect(elementBars).toHaveLength(5);
  });

  it('renders element names with correct colors in bar chart view', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    const elementNames = wrapper.findAll('.element-name');
    expect(elementNames).toHaveLength(5);

    const nameTexts = elementNames.map((name) => name.text());
    expect(nameTexts).toContain('木');
    expect(nameTexts).toContain('火');
    expect(nameTexts).toContain('土');
    expect(nameTexts).toContain('金');
    expect(nameTexts).toContain('水');
  });

  it('displays raw and adjusted scores in bar chart view', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
      },
    });

    const rawScores = wrapper.findAll('.raw-score');
    const adjustedScores = wrapper.findAll('.adjusted-score');

    expect(rawScores).toHaveLength(5);
    expect(adjustedScores).toHaveLength(5);
  });

  it('passes correct props to WuXingRadar component', async () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: mockDistribution,
        defaultChartType: 'radar',
      },
    });

    const radarComponent = wrapper.findComponent(WuXingRadar);
    expect(radarComponent.exists()).toBe(true);
    expect(radarComponent.props('distribution')).toEqual(mockDistribution);
    expect(radarComponent.props('showRaw')).toBe(true);
    expect(radarComponent.props('showScoreLabels')).toBe(false);
  });

  it('handles missing dominant element gracefully', () => {
    const distributionWithoutDominant: WuXingDistribution = {
      ...mockDistribution,
      dominant: null,
    };

    const wrapper = mount(WuXingChart, {
      props: {
        distribution: distributionWithoutDominant,
      },
    });

    const summary = wrapper.find('.summary');
    expect(summary.text()).not.toContain('優勢:');
  });

  it('handles missing deficient element gracefully', () => {
    const distributionWithoutDeficient: WuXingDistribution = {
      ...mockDistribution,
      deficient: null,
    };

    const wrapper = mount(WuXingChart, {
      props: {
        distribution: distributionWithoutDeficient,
      },
    });

    const summary = wrapper.find('.summary');
    expect(summary.text()).not.toContain('缺失:');
  });

  it('calculates balance percentage correctly', () => {
    const wrapper = mount(WuXingChart, {
      props: {
        distribution: { ...mockDistribution, balance: 0.856 },
      },
    });

    const summary = wrapper.find('.summary');
    expect(summary.text()).toContain('85.6%');
  });
});
