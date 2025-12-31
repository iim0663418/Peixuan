import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WuXingRadar from '../WuXingRadar.vue';
import type { WuXingDistribution } from '../constants';

describe('WuXingRadar', () => {
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
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    expect(wrapper.find('.wuxing-radar').exists()).toBe(true);
    expect(wrapper.find('.radar-svg').exists()).toBe(true);
  });

  it('renders all 5 element labels', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const labels = wrapper.findAll('.element-label');
    expect(labels).toHaveLength(5);

    const labelTexts = labels.map((label) => label.text());
    expect(labelTexts).toContain('木');
    expect(labelTexts).toContain('火');
    expect(labelTexts).toContain('土');
    expect(labelTexts).toContain('金');
    expect(labelTexts).toContain('水');
  });

  it('renders grid circles', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const gridCircles = wrapper.findAll('.grid-circles circle');
    expect(gridCircles).toHaveLength(5);
  });

  it('renders grid lines', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const gridLines = wrapper.findAll('.grid-line');
    expect(gridLines).toHaveLength(5);
  });

  it('renders both raw and adjusted polygons when showRaw is true', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showRaw: true,
      },
    });

    expect(wrapper.find('.polygon-raw').exists()).toBe(true);
    expect(wrapper.find('.polygon-adjusted').exists()).toBe(true);
  });

  it('renders only adjusted polygon when showRaw is false', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showRaw: false,
      },
    });

    expect(wrapper.find('.polygon-raw').exists()).toBe(false);
    expect(wrapper.find('.polygon-adjusted').exists()).toBe(true);
  });

  it('renders legend when showRaw is true', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showRaw: true,
      },
    });

    expect(wrapper.find('.legend').exists()).toBe(true);
    expect(wrapper.findAll('.legend-item')).toHaveLength(2);
  });

  it('does not render legend when showRaw is false', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showRaw: false,
      },
    });

    expect(wrapper.find('.legend').exists()).toBe(false);
  });

  it('renders score labels when showScoreLabels is true', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showScoreLabels: true,
      },
    });

    const scoreLabels = wrapper.findAll('.score-label');
    expect(scoreLabels).toHaveLength(5);

    // Check that score labels contain the adjusted values
    const scoreLabelTexts = scoreLabels.map((label) => label.text());
    expect(scoreLabelTexts).toContain('35'); // 木 adjusted
    expect(scoreLabelTexts).toContain('45'); // 火 adjusted
    expect(scoreLabelTexts).toContain('55'); // 土 adjusted
    expect(scoreLabelTexts).toContain('40'); // 金 adjusted
    expect(scoreLabelTexts).toContain('50'); // 水 adjusted
  });

  it('does not render score labels when showScoreLabels is false', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
        showScoreLabels: false,
      },
    });

    expect(wrapper.find('.score-labels').exists()).toBe(false);
  });

  it('renders 5 data points for adjusted scores', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const dataPoints = wrapper.findAll('.data-point');
    expect(dataPoints).toHaveLength(5);
  });

  it('has correct viewBox dimensions', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const svg = wrapper.find('.radar-svg');
    expect(svg.attributes('viewBox')).toBe('0 0 300 300');
  });

  it('has accessibility label', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const svg = wrapper.find('.radar-svg');
    expect(svg.attributes('role')).toBe('img');
    expect(svg.attributes('aria-label')).toContain('五行雷達圖');
  });

  it('polygon points are valid SVG point strings', () => {
    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: mockDistribution,
      },
    });

    const adjustedPolygon = wrapper.find('.polygon-adjusted');
    const points = adjustedPolygon.attributes('points');

    expect(points).toBeDefined();
    expect(points).toMatch(/^(\d+\.?\d*,\d+\.?\d*\s*)+$/); // Match SVG points format
  });

  it('handles zero scores correctly', () => {
    const zeroDistribution: WuXingDistribution = {
      raw: {
        木: 0,
        火: 0,
        土: 0,
        金: 0,
        水: 0,
      },
      adjusted: {
        木: 0,
        火: 0,
        土: 0,
        金: 0,
        水: 0,
      },
      dominant: null,
      deficient: null,
      balance: 0,
    };

    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: zeroDistribution,
      },
    });

    expect(wrapper.find('.polygon-adjusted').exists()).toBe(true);
    expect(wrapper.findAll('.data-point')).toHaveLength(5);
  });

  it('handles very high scores correctly', () => {
    const highDistribution: WuXingDistribution = {
      raw: {
        木: 100,
        火: 100,
        土: 100,
        金: 100,
        水: 100,
      },
      adjusted: {
        木: 120,
        火: 130,
        土: 140,
        金: 110,
        水: 125,
      },
      dominant: '土',
      deficient: null,
      balance: 0.95,
    };

    const wrapper = mount(WuXingRadar, {
      props: {
        distribution: highDistribution,
      },
    });

    expect(wrapper.find('.polygon-adjusted').exists()).toBe(true);
    expect(wrapper.findAll('.data-point')).toHaveLength(5);
  });
});
