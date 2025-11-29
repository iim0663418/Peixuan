/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import YearlyFateTimeline, {
  type YearlyFateInfo,
} from '../YearlyFateTimeline.vue';

// Mock global window.Solar and window.Lunar for testing environment
// Vitest runs in Node.js by default, where 'window' is not available unless using 'happy-dom' or 'jsdom'
// We've configured 'happy-dom' in vite.config.ts, so window should be available.
// However, the Solar/Lunar objects themselves need to be mocked if they perform complex calculations
// or are not easily set up in a test environment.

// Simplified mock for Solar and Lunar
const mockSolar = {
  fromYmd: (year: number, month: number, day: number) => ({
    getLunar: () => ({
      getYearGanExact: () => `干${year % 10}`,
      getYearZhiExact: () => `支${year % 12}`,
      // Add other methods if needed by the component during test
    }),
  }),
};

// Assign to window for the component to pick up
// @ts-ignore
global.window.Solar = mockSolar;
// @ts-ignore
global.window.Lunar = {
  fromYmdHms: vi.fn(),
  fromDate: vi
    .fn()
    .mockImplementation(() => mockSolar.fromYmd(2000, 1, 1).getLunar()),
}; // Basic mock for Lunar
// @ts-ignore
global.window.LunarMonth = { fromYm: vi.fn() };

describe('YearlyFateTimeline.vue', () => {
  let wrapper: VueWrapper<any>;

  const defaultBirthYear = 2000;

  beforeEach(() => {
    wrapper = mount(YearlyFateTimeline, {
      props: {
        birthYear: defaultBirthYear,
      },
    });
  });

  it('renders the timeline title', () => {
    expect(wrapper.find('h4').exists()).toBe(true);
    expect(wrapper.find('h4').text()).toBe('流年時間軸');
  });

  it('renders the slider when yearlyFatesToDisplay has items', async () => {
    // Props are set in beforeEach, component should compute yearlyFatesToDisplay
    await wrapper.vm.$nextTick(); // Wait for computed properties to update

    // Check if yearlyFatesToDisplay is populated (it should generate 100 years)
    expect(wrapper.vm.yearlyFatesToDisplay.length).toBe(100);

    const slider = wrapper.find('input[type="range"]');
    expect(slider.exists()).toBe(true);
    expect(slider.attributes('min')).toBe('0');
    expect(slider.attributes('max')).toBe('99'); // 100 items, so max index is 99
  });

  it('displays initial year information correctly', async () => {
    await wrapper.vm.$nextTick();
    const initialYearInfo = wrapper.vm.selectedYearData;
    expect(initialYearInfo).not.toBeNull();
    if (initialYearInfo) {
      expect(wrapper.text()).toContain(
        `年份: ${initialYearInfo.year} (${initialYearInfo.ganZhi})`,
      );
      expect(wrapper.text()).toContain(`歲數: ${initialYearInfo.age}`);
    }
  });

  it('updates selected year and emits event on slider change', async () => {
    await wrapper.vm.$nextTick();
    const slider = wrapper.find('input[type="range"]');

    // Simulate changing the slider value to the 11th item (index 10)
    // The year should be birthYear + 10 = 2000 + 10 = 2010
    // Age should be 11
    await slider.setValue('10'); // Set value to index 10

    await wrapper.vm.$nextTick(); // Allow computed properties and watchers to react

    const emittedEvent = wrapper.emitted('yearSelected');
    expect(emittedEvent).toBeTruthy();
    expect(emittedEvent![0]).toEqual([wrapper.vm.selectedYearData]);

    const selectedData = wrapper.vm.selectedYearData as YearlyFateInfo;
    expect(selectedData).not.toBeNull();
    expect(selectedData.year).toBe(defaultBirthYear + 10);
    expect(selectedData.age).toBe(11); // Age is index + 1 (since age starts from 1)

    expect(wrapper.text()).toContain(
      `年份: ${selectedData.year} (${selectedData.ganZhi})`,
    );
    expect(wrapper.text()).toContain(`歲數: ${selectedData.age}`);
  });

  it('shows a message if birthYear is not provided or invalid, leading to empty yearlyFatesToDisplay', async () => {
    const emptyWrapper = mount(YearlyFateTimeline, {
      props: {
        // @ts-ignore - testing invalid prop
        birthYear: null,
      },
    });
    await emptyWrapper.vm.$nextTick();
    expect(emptyWrapper.vm.yearlyFatesToDisplay.length).toBe(0);
    expect(emptyWrapper.find('input[type="range"]').exists()).toBe(false);
    expect(emptyWrapper.text()).toContain(
      '無法生成流年時間軸，請先完成八字排盤。',
    );
  });
});
