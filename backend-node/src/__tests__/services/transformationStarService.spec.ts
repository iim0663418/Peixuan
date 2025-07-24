import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TransformationStarService } from '../../services/transformationStarService';
import { Palace, Star } from '../../types/purpleStarTypes';

describe('TransformationStarService', () => {
  let service: TransformationStarService;
  let mockPalaces: Palace[];
  
  beforeEach(() => {
    service = new TransformationStarService();
    
    // 創建模擬宮位資料
    mockPalaces = Array.from({ length: 12 }, (_, i) => ({
      name: ['命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
             '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮'][i],
      index: i,
      zhi: '子丑寅卯辰巳午未申酉戌亥'[i],
      stars: [
        {
          name: i === 0 ? '紫微' : i === 6 ? '天府' : `星曜${i}`,
          type: 'main',
          palaceIndex: i,
          transformations: []
        },
        {
          name: `輔星${i}`,
          type: 'auxiliary',
          palaceIndex: i,
          transformations: []
        }
      ]
    }));
  });

  // 測試獲取命宮天干
  it('gets ming palace gan correctly', () => {
    const yearGan = '庚';
    const mingPalaceIndex = 0;
    
    const mingGan = service.getMingPalaceGan(yearGan, mingPalaceIndex);
    
    // 驗證命宮天干
    expect(mingGan).toBeDefined();
    expect(typeof mingGan).toBe('string');
    expect(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']).toContain(mingGan);
  });

  // 測試應用四化飛星
  it('applies four transformations correctly', () => {
    const mingGan = '甲';
    
    const transformedStars = service.applyFourTransformations(mockPalaces, mingGan);
    
    // 驗證轉化星數量
    expect(transformedStars.length).toBeGreaterThan(0);
    
    // 驗證轉化星結構
    transformedStars.forEach(star => {
      expect(star).toHaveProperty('name');
      expect(star).toHaveProperty('transformations');
      expect(Array.isArray(star.transformations)).toBe(true);
      expect(star.transformations.length).toBeGreaterThan(0);
    });
  });

  // 測試計算四化流動
  it('calculates transformation flows correctly', () => {
    // 創建帶有四化的星曜
    const transformedStars: Star[] = [
      {
        name: '紫微',
        type: 'main',
        palaceIndex: 0,
        transformations: ['祿']
      },
      {
        name: '天府',
        type: 'main',
        palaceIndex: 6,
        transformations: ['權']
      }
    ];
    
    const flows = service.calculateTransformationFlows(mockPalaces, transformedStars);
    
    // 驗證流動結果
    expect(Object.keys(flows).length).toBeGreaterThan(0);
    
    // 驗證流動結構
    Object.values(flows).forEach(flow => {
      expect(flow).toHaveProperty('inflows');
      expect(flow).toHaveProperty('outflows');
      expect(Array.isArray(flow.inflows)).toBe(true);
      expect(Array.isArray(flow.outflows)).toBe(true);
    });
  });

  // 測試分析四化組合
  it('analyzes transformation combinations correctly', () => {
    // 修改模擬宮位，添加四化
    mockPalaces[0].stars[0].transformations = ['祿'];
    mockPalaces[1].stars[0].transformations = ['權'];
    mockPalaces[2].stars[0].transformations = ['科'];
    mockPalaces[3].stars[0].transformations = ['忌'];
    
    const combinations = service.analyzeTransformationCombinations(mockPalaces);
    
    // 驗證組合結果
    expect(Array.isArray(combinations)).toBe(true);
  });

  // 測試計算多層次能量
  it('calculates multi-layer energies correctly', () => {
    const daXianPalaceIndex = 2;
    const liuNianPalaceIndex = 8;
    
    const energies = service.calculateMultiLayerEnergies(
      mockPalaces,
      daXianPalaceIndex,
      liuNianPalaceIndex
    );
    
    // 驗證能量結果
    expect(Object.keys(energies).length).toBeGreaterThan(0);
    
    // 驗證能量結構
    Object.values(energies).forEach(energy => {
      expect(energy).toHaveProperty('baseEnergy');
      expect(energy).toHaveProperty('daXianEnergy');
      expect(energy).toHaveProperty('liuNianEnergy');
      expect(energy).toHaveProperty('totalEnergy');
      expect(typeof energy.totalEnergy).toBe('number');
    });
  });
});
