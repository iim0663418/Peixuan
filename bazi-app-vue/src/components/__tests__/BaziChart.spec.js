import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BaziChart from '../BaziChart.vue';
describe('BaziChart.vue', () => {
    let wrapper;
    const mockBaziResult = {
        yearPillar: { stem: '甲', branch: '子', stemElement: '木', branchElement: '水' },
        monthPillar: { stem: '丙', branch: '寅', stemElement: '火', branchElement: '木' },
        dayPillar: { stem: '戊', branch: '辰', stemElement: '土', branchElement: '土' }, // Day Master is 戊
        hourPillar: { stem: '庚', branch: '午', stemElement: '金', branchElement: '火' },
    };
    // Corrected TenGods based on Day Master 戊
    const correctedMockTenGodsResult = {
        yearStemGod: '七殺', // 甲 (wood) vs 戊 (earth) -> Wood controls Earth (Yang vs Yang) -> 七殺
        monthStemGod: '偏印', // 丙 (fire) vs 戊 (earth) -> Fire produces Earth (Yang vs Yang) -> 偏印
        dayStemGod: '比肩', // 戊 (earth) vs 戊 (earth) -> Same element, same polarity -> 比肩
        hourStemGod: '食神', // 庚 (metal) vs 戊 (earth) -> Earth produces Metal (Yang vs Yang) -> 食神
    };
    const mountComponent = (propsData) => {
        return mount(BaziChart, {
            props: propsData,
        });
    };
    beforeEach(() => {
        // Clear any mocks if necessary, though none are used directly in this suite yet
        vi.clearAllMocks();
    });
    it('renders the chart title', () => {
        wrapper = mountComponent({ bazi: mockBaziResult });
        expect(wrapper.find('h4').exists()).toBe(true);
        expect(wrapper.find('h4').text()).toBe('八字命盤');
    });
    it('renders all four pillars in correct order (Time, Day, Month, Year)', () => {
        wrapper = mountComponent({ bazi: mockBaziResult });
        const pillars = wrapper.findAll('.pillar-card-display');
        expect(pillars.length).toBe(4);
        expect(pillars[0].find('h5').text()).toBe('時柱');
        expect(pillars[1].find('h5').text()).toBe('日柱');
        expect(pillars[2].find('h5').text()).toBe('月柱');
        expect(pillars[3].find('h5').text()).toBe('年柱');
    });
    it('displays correct stem, branch, and elements for each pillar', () => {
        wrapper = mountComponent({ bazi: mockBaziResult });
        const pillarData = [
            { key: 'hourPillar', name: '時柱', data: mockBaziResult.hourPillar },
            { key: 'dayPillar', name: '日柱', data: mockBaziResult.dayPillar },
            { key: 'monthPillar', name: '月柱', data: mockBaziResult.monthPillar },
            { key: 'yearPillar', name: '年柱', data: mockBaziResult.yearPillar },
        ];
        const pillarElements = wrapper.findAll('.pillar-card-display');
        pillarData.forEach((pData, index) => {
            const pillarWrapper = pillarElements[index];
            expect(pillarWrapper.find('h5').text()).toBe(pData.name);
            const stemBranchElements = pillarWrapper.findAll('.stem-branch');
            expect(stemBranchElements[0].find('.char').text()).toBe(pData.data.stem);
            expect(stemBranchElements[0].find('.label').text()).toBe(`(${pData.data.stemElement})`);
            expect(stemBranchElements[1].find('.char').text()).toBe(pData.data.branch);
            expect(stemBranchElements[1].find('.label').text()).toBe(`(${pData.data.branchElement})`);
        });
    });
    it('displays Ten Gods information if provided', () => {
        wrapper = mountComponent({ bazi: mockBaziResult, tenGods: correctedMockTenGodsResult });
        const pillarElements = wrapper.findAll('.pillar-card-display');
        expect(pillarElements[0].find('.ten-god').text()).toBe(correctedMockTenGodsResult.hourStemGod);
        expect(pillarElements[1].find('.ten-god').text()).toBe(correctedMockTenGodsResult.dayStemGod);
        expect(pillarElements[2].find('.ten-god').text()).toBe(correctedMockTenGodsResult.monthStemGod);
        expect(pillarElements[3].find('.ten-god').text()).toBe(correctedMockTenGodsResult.yearStemGod);
    });
    it('does not display Ten Gods if not provided or null', () => {
        wrapper = mountComponent({ bazi: mockBaziResult, tenGods: null });
        const tenGodElements = wrapper.findAll('.ten-god');
        tenGodElements.forEach(el => {
            expect(el.text().trim()).toBe('');
        });
    });
    it('highlights specified pillars', async () => {
        wrapper = mountComponent({
            bazi: mockBaziResult,
            highlightedPillars: ['monthPillar', 'dayPillar']
        });
        await wrapper.vm.$nextTick();
        const pillars = wrapper.findAll('.pillar-card-display');
        expect(pillars[0].classes().includes('highlighted')).toBe(false); // Hour
        expect(pillars[1].classes().includes('highlighted')).toBe(true); // Day
        expect(pillars[2].classes().includes('highlighted')).toBe(true); // Month
        expect(pillars[3].classes().includes('highlighted')).toBe(false); // Year
    });
    it('does not render if bazi prop is not provided (or null)', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        // @ts-ignore to test missing required prop, as bazi is required
        wrapper = mount(BaziChart, { props: { tenGods: null } });
        expect(wrapper.find('.bazi-chart').exists()).toBe(false);
        consoleWarnSpy.mockRestore();
    });
});
//# sourceMappingURL=BaziChart.spec.js.map