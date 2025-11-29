/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import ElementsChart from '../ElementsChart.vue';
import type { ElementsDistribution } from '../../utils/baziCalc';
/// <reference types="vitest/globals" />
// Import Chart and registerables. Chart will be mocked.
import { Chart, registerables as actualRegisterables } from 'chart.js/auto';

vi.mock('chart.js/auto', async () => {
  const actual =
    await vi.importActual<typeof import('chart.js/auto')>('chart.js/auto');

  // Define all mock functions *inside* the factory
  // These will be fresh for each test run due to how vi.mock works with factories.
  const instanceUpdateMockFn = vi.fn();
  const instanceDestroyMockFn = vi.fn();
  const staticRegisterMockFn = vi.fn();

  const MockedChartConstructor = vi
    .fn()
    .mockImplementation((canvas, config) => {
      return {
        data: config.data,
        config,
        update: instanceUpdateMockFn,
        destroy: instanceDestroyMockFn,
        canvas,
      };
    });
  (MockedChartConstructor as any).register = staticRegisterMockFn;

  return {
    ...actual,
    Chart: MockedChartConstructor,
    registerables: actual.registerables,
  };
});

describe('ElementsChart.vue', () => {
  let wrapper: VueWrapper<any>;

  const mockDistribution: ElementsDistribution = {
    木: 2,
    火: 3,
    土: 1,
    金: 4,
    水: 0,
  };

  const mountComponent = (propsData: any) => {
    return mount(ElementsChart, {
      props: propsData,
      attachTo: document.body,
    });
  };

  beforeEach(() => {
    // Clears all mocks (call history, implementations)
    // This will affect the mocks defined inside the vi.mock factory for each test run.
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders the chart title', () => {
    wrapper = mountComponent({ distribution: mockDistribution });
    expect(wrapper.find('h4').exists()).toBe(true);
    expect(wrapper.find('h4').text()).toBe('五行能量分佈圖');
  });

  it('does not call Chart constructor if distribution is null', async () => {
    wrapper = mountComponent({ distribution: null });
    await wrapper.vm.$nextTick();
    // The imported Chart is the mocked constructor
    expect(Chart).not.toHaveBeenCalled();
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('creates a chart instance when distribution data is provided', async () => {
    wrapper = mountComponent({ distribution: mockDistribution });
    await wrapper.vm.$nextTick();
    expect(Chart).toHaveBeenCalledTimes(1);
    const chartInstance = (Chart as vi.Mock).mock.results[0].value;
    expect(chartInstance).toBeDefined();
    expect(chartInstance.data.labels).toEqual(Object.keys(mockDistribution));
    expect(chartInstance.data.datasets[0].data).toEqual(
      Object.values(mockDistribution),
    );
    // Check if the static Chart.register (which is mocked) was called
    expect((Chart as any).register).toHaveBeenCalled();
  });

  it('updates chart when distribution prop changes', async () => {
    wrapper = mountComponent({ distribution: mockDistribution });
    await wrapper.vm.$nextTick();
    expect(Chart).toHaveBeenCalledTimes(1);
    const chartInstance = (Chart as vi.Mock).mock.results[0].value;

    // Clear calls from mount before testing update
    (Chart as vi.Mock).mockClear();
    if ((Chart as any).register && (Chart as any).register.mockClear) {
      ((Chart as any).register as vi.Mock).mockClear();
    }
    // Instance methods are part of the instance, clear them via the instance or re-mock.
    // Since our factory reuses the same vi.fn() for update/destroy across instances,
    // we need to clear them directly if they were exposed, or rely on vi.clearAllMocks()
    // For this structure, vi.clearAllMocks() in beforeEach handles it.
    // Or, if we had access to instanceUpdateMockFn from the factory:
    // instanceUpdateMockFn.mockClear();

    const newDistribution: ElementsDistribution = {
      木: 5,
      火: 1,
      土: 2,
      金: 3,
      水: 4,
    };
    await wrapper.setProps({ distribution: newDistribution });
    await wrapper.vm.$nextTick();

    expect(chartInstance.update).toHaveBeenCalledTimes(1);
    expect(chartInstance.data.labels).toEqual(Object.keys(newDistribution));
    expect(chartInstance.data.datasets[0].data).toEqual(
      Object.values(newDistribution),
    );
  });

  it('updates chart type when chartType prop changes', async () => {
    wrapper = mountComponent({
      distribution: mockDistribution,
      chartType: 'radar',
    });
    await wrapper.vm.$nextTick();
    expect(Chart).toHaveBeenCalledTimes(1);
    const chartInstance = (Chart as vi.Mock).mock.results[0].value;
    expect(chartInstance.config.type).toBe('radar');

    // chartInstance.update refers to instanceUpdateMockFn from the factory scope
    chartInstance.update.mockClear(); // Clear calls from mount

    await wrapper.setProps({ chartType: 'bar' });
    await wrapper.vm.$nextTick();

    expect(chartInstance.update).toHaveBeenCalledTimes(1);
    expect(chartInstance.config.type).toBe('bar');
  });

  it('should not call destroy on chart instance when component is unmounted (as not implemented yet)', async () => {
    wrapper = mountComponent({ distribution: mockDistribution });
    await wrapper.vm.$nextTick();
    const chartInstance = (Chart as vi.Mock).mock.results[0].value;

    wrapper.unmount();
    // chartInstance.destroy refers to instanceDestroyMockFn from the factory scope
    // Now that onUnmounted calls destroy, we expect it to be called.
    expect(chartInstance.destroy).toHaveBeenCalledTimes(1);
  });
});
