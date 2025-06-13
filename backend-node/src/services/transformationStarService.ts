// backend-node/src/services/transformationStarService.ts
// 紫微斗數四化飛星動態計算引擎

import { Palace, Star, LunarInfo } from '../types/purpleStarTypes';

type TransformationType = '祿' | '權' | '科' | '忌';

interface FourTransformations {
  lu: string; // 化祿的星曜名稱
  quan: string; // 化權的星曜名稱
  ke: string; // 化科的星曜名稱
  ji: string; // 化忌的星曜名稱
}

/**
 * 四化飛星計算服務
 * 負責計算紫微斗數中的四化飛星（化祿、化權、化科、化忌）及其影響
 */
export class TransformationStarService {
  // 地支名稱常量
  private readonly ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 天干名稱常量
  private readonly GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  // 四化表：不同天干的四化對應關係
  private readonly FOUR_TRANSFORMATIONS_MAP: Record<string, FourTransformations> = {
    '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
    '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
    '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
    '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
    '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
    '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
    '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
    '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
    '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
    '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
  };
  
  // 四化效應強度（用於計算吉凶程度）
  private readonly TRANSFORMATION_STRENGTHS: Record<TransformationType, number> = {
    '祿': 4, // 化祿增加吉度
    '權': 3, // 化權增加吉度
    '科': 3, // 化科增加吉度
    '忌': 4  // 化忌增加凶度
  };
  
  /**
   * 計算四化飛星
   * @param palaces 宮位數組
   * @param gan 用於四化的天干（通常是命宮干）
   * @returns 被套用四化的星曜數組
   */
  public applyFourTransformations(palaces: Palace[], gan: string): Star[] {
    const transformedStars: Star[] = [];
    
    // 獲取四化規則
    const transformations = this.FOUR_TRANSFORMATIONS_MAP[gan];
    if (!transformations) {
      throw new Error(`找不到天干 "${gan}" 的四化表，請檢查天干是否正確。有效的天干：甲乙丙丁戊己庚辛壬癸`);
    }
    
    // 應用四化
    transformedStars.push(...this.applyTransformation(palaces, transformations.lu, '祿'));
    transformedStars.push(...this.applyTransformation(palaces, transformations.quan, '權'));
    transformedStars.push(...this.applyTransformation(palaces, transformations.ke, '科'));
    transformedStars.push(...this.applyTransformation(palaces, transformations.ji, '忌'));
    
    return transformedStars;
  }
  
  /**
   * 應用特定四化到星曜
   * @param palaces 宮位數組
   * @param starName 星曜名稱
   * @param transformType 四化類型
   * @returns 被套用四化的星曜數組
   */
  private applyTransformation(
    palaces: Palace[], 
    starName: string, 
    transformType: TransformationType
  ): Star[] {
    const transformedStars: Star[] = [];
    
    // 遍歷所有宮位
    for (const palace of palaces) {
      // 尋找匹配的星曜
      for (const star of palace.stars) {
        if (star.name === starName) {
          // 將四化加入到星曜的transformations屬性中
          if (!star.transformations) {
            star.transformations = [];
          }
          star.transformations.push(transformType);
          
          transformedStars.push(star);
        }
      }
    }
    
    return transformedStars;
  }
  
  /**
   * 計算四化能量流動
   * 分析四化飛星的能量流動和影響
   * @param palaces 宮位數組
   * @param transformedStars 四化星曜數組
   * @returns 各宮位的四化能量評估
   */
  public calculateTransformationFlows(
    palaces: Palace[],
    transformedStars: Star[]
  ): Record<number, {
    palaceIndex: number;
    palaceName: string;
    energyScore: number;
    majorInfluences: string[];
  }> {
    const flows: Record<number, {
      palaceIndex: number;
      palaceName: string;
      energyScore: number;
      majorInfluences: string[];
    }> = {};
    
    // 初始化每個宮位的四化能量
    for (const palace of palaces) {
      flows[palace.index] = {
        palaceIndex: palace.index,
        palaceName: palace.name,
        energyScore: 0,
        majorInfluences: []
      };
    }
    
    // 計算每個宮位的四化能量
    for (const palace of palaces) {
      let palaceEnergyScore = 0;
      const majorInfluences: string[] = [];
      
      // 檢查宮位中的星曜
      for (const star of palace.stars) {
        // 如果星曜有四化
        if (star.transformations && star.transformations.length > 0) {
          for (const transformation of star.transformations) {
            // 根據四化類型加減能量
            const transformationStrength = this.TRANSFORMATION_STRENGTHS[transformation];
            
            if (transformation === '忌') {
              // 化忌是負面的，減少能量
              palaceEnergyScore -= transformationStrength;
              majorInfluences.push(`${star.name}化${transformation}(-${transformationStrength})`);
            } else {
              // 其他四化是正面的，增加能量
              palaceEnergyScore += transformationStrength;
              majorInfluences.push(`${star.name}化${transformation}(+${transformationStrength})`);
            }
          }
        }
      }
      
      // 更新宮位的四化能量評估
      flows[palace.index].energyScore = palaceEnergyScore;
      flows[palace.index].majorInfluences = majorInfluences;
    }
    
    return flows;
  }
  
  /**
   * 分析四化組合
   * 分析特殊的四化組合及其強化或弱化效果
   * @param palaces 宮位數組
   * @returns 特殊四化組合分析
   */
  public analyzeTransformationCombinations(palaces: Palace[]): Array<{
    palaceIndex: number;
    palaceName: string;
    combination: string;
    effect: string;
    significance: 'high' | 'medium' | 'low';
  }> {
    console.group('四化組合分析');
    console.log(`分析宮位數量: ${palaces.length}`);

    const combinations: Array<{
      palaceIndex: number;
      palaceName: string;
      combination: string;
      effect: string;
      significance: 'high' | 'medium' | 'low';
    }> = [];
    
    // 詳細記錄每個宮位的星曜和四化情況
    palaces.forEach(palace => {
      console.log(`宮位: ${palace.name}, 索引: ${palace.index}`);
      
      const starsWithTransformations = palace.stars.filter(star => 
        star.transformations && star.transformations.length > 0
      );
      
      if (starsWithTransformations.length > 0) {
        console.log(`  找到 ${starsWithTransformations.length} 顆帶有四化的星曜`);
        starsWithTransformations.forEach(star => {
          console.log(`  星曜: ${star.name}, 四化: ${star.transformations?.join(',')}`);
        });
      } else {
        console.log('  此宮無四化星曜');
      }
    });
    
    // 遍歷所有宮位
    for (const palace of palaces) {
      // 檢查宮位中的四化組合
      console.log(`檢查宮位 ${palace.name} 的四化組合...`);
      
      // 詳細記錄該宮位的星曜
      const starsWithTransformations = palace.stars.filter(star => 
        star.transformations && star.transformations.length > 0
      );
      
      console.log(`  該宮位有 ${starsWithTransformations.length} 顆帶四化的星曜`);
      starsWithTransformations.forEach(star => {
        console.log(`  星曜: ${star.name}, 四化: ${star.transformations?.join(', ')}`);
      });
      
      // 1. 檢查是否有化祿與化忌同宮
      const hasLu = palace.stars.some(star => 
        star.transformations && star.transformations.includes('祿')
      );
      
      const hasJi = palace.stars.some(star => 
        star.transformations && star.transformations.includes('忌')
      );
      
      console.log(`  化祿存在: ${hasLu}, 化忌存在: ${hasJi}`);
      
      if (hasLu && hasJi) {
        console.log('  發現組合: 化祿化忌同宮');
        combinations.push({
          palaceIndex: palace.index,
          palaceName: palace.name,
          combination: '化祿化忌同宮',
          effect: '財帛易得而難守，或大起大落',
          significance: 'high'
        });
      } else if (hasLu && !hasJi) {
        console.log('  此宮有化祿但無化忌，不構成"化祿化忌同宮"組合');
      } else if (!hasLu && hasJi) {
        console.log('  此宮有化忌但無化祿，不構成"化祿化忌同宮"組合');
      } else {
        console.log('  此宮無化祿也無化忌，不構成任何四化組合');
      }
      
      // 2. 檢查是否有化權與化科同宮
      const hasQuan = palace.stars.some(star => 
        star.transformations && star.transformations.includes('權')
      );
      
      const hasKe = palace.stars.some(star => 
        star.transformations && star.transformations.includes('科')
      );
      
      console.log(`  化權存在: ${hasQuan}, 化科存在: ${hasKe}`);
      
      if (hasQuan && hasKe) {
        console.log('  發現組合: 化權化科同宮');
        combinations.push({
          palaceIndex: palace.index,
          palaceName: palace.name,
          combination: '化權化科同宮',
          effect: '權威與名譽雙收，利於事業發展',
          significance: 'high'
        });
      } else if (hasQuan && !hasKe) {
        console.log('  此宮有化權但無化科，不構成"化權化科同宮"組合');
      } else if (!hasQuan && hasKe) {
        console.log('  此宮有化科但無化權，不構成"化權化科同宮"組合');
      }
      
      // 3. 檢查命宮是否有化祿
      if (palace.name === '命宮') {
        console.log(`  檢查命宮是否有化祿: ${hasLu}`);
        if (hasLu) {
          console.log('  發現組合: 命宮化祿');
          combinations.push({
            palaceIndex: palace.index,
            palaceName: palace.name,
            combination: '命宮化祿',
            effect: '一生財運亨通，易得財富',
            significance: 'high'
          });
        } else {
          console.log('  命宮無化祿，不構成"命宮化祿"組合');
        }
      }
      
      // 4. 檢查官祿宮是否有化權
      if (palace.name === '官祿宮') {
        console.log(`  檢查官祿宮是否有化權: ${hasQuan}`);
        if (hasQuan) {
          console.log('  發現組合: 官祿宮化權');
          combinations.push({
            palaceIndex: palace.index,
            palaceName: palace.name,
            combination: '官祿宮化權',
            effect: '事業有成，有權威地位',
            significance: 'high'
          });
        } else {
          console.log('  官祿宮無化權，不構成"官祿宮化權"組合');
        }
      }
    }
    
    // 5. 檢查化忌是否在疾厄宮
    const diseaseHouse = palaces.find(palace => palace.name === '疾厄宮');
    console.log(`檢查疾厄宮是否有化忌...`);
    
    if (diseaseHouse) {
      console.log(`  找到疾厄宮，宮位索引: ${diseaseHouse.index}`);
      const hasJiInDisease = diseaseHouse.stars.some(star => 
        star.transformations && star.transformations.includes('忌')
      );
      
      console.log(`  疾厄宮化忌存在: ${hasJiInDisease}`);
      
      if (hasJiInDisease) {
        console.log('  發現組合: 疾厄宮化忌');
        combinations.push({
          palaceIndex: diseaseHouse.index,
          palaceName: diseaseHouse.name,
          combination: '疾厄宮化忌',
          effect: '健康運勢較差，需注意保健',
          significance: 'medium'
        });
      } else {
        console.log('  疾厄宮無化忌，不構成"疾厄宮化忌"組合');
      }
    } else {
      console.log('  未找到疾厄宮，無法檢查"疾厄宮化忌"組合');
    }
    
    // 總結
    if (combinations.length > 0) {
      console.log(`找到 ${combinations.length} 個四化組合`);
      combinations.forEach((combo, idx) => {
        console.log(`  ${idx+1}. ${combo.combination} 在 ${combo.palaceName}宮`);
      });
    } else {
      console.log('沒有找到任何四化組合，這可能是因為：');
      console.log('1. 該命盤的星曜四化分佈較分散，未形成組合');
      console.log('2. 四化在宮位中的分佈未滿足組合條件');
      console.log('3. 可能需要擴展組合判斷邏輯以包含更多情況');
    }
    
    console.groupEnd();
    return combinations;
  }
  
  /**
   * 根據天干獲取命宮天干
   * @param yearGan 年干
   * @param mingPalaceStdIndex 命宮標準索引
   * @returns 命宮天干
   */
  public getMingPalaceGan(yearGan: string, mingPalaceStdIndex: number): string {
    // 寅宮的天干
    let yinPalaceGan: string;
    
    // 由年干推導寅宮天干
    if (['甲', '己'].includes(yearGan)) yinPalaceGan = '丙';
    else if (['乙', '庚'].includes(yearGan)) yinPalaceGan = '戊';
    else if (['丙', '辛'].includes(yearGan)) yinPalaceGan = '庚';
    else if (['丁', '壬'].includes(yearGan)) yinPalaceGan = '壬';
    else if (['戊', '癸'].includes(yearGan)) yinPalaceGan = '甲';
    else throw new Error('Invalid year Gan');
    
    // 寅宮標準索引
    const yinPalaceStdIndex = 2;
    
    // 計算命宮天干
    const ganIndex = this.GAN_NAMES.indexOf(yinPalaceGan);
    if (ganIndex === -1) {
      throw new Error(`無法識別的天干: ${yinPalaceGan}`);
    }
    
    // 從寅宮順數到命宮的步數
    let steps = (mingPalaceStdIndex - yinPalaceStdIndex + 12) % 12;
    
    // 計算命宮天干索引
    const mingPalaceGanIndex = (ganIndex + steps) % 10;
    
    return this.GAN_NAMES[mingPalaceGanIndex];
  }
  
  /**
   * 計算多層次運勢疊加
   * 結合原命盤、大限和流年的四化影響
   * @param originalPalaces 原命盤宮位
   * @param daXianPalaceIndex 大限宮位索引
   * @param liuNianPalaceIndex 流年宮位索引
   * @param liuYuePalaceIndex 流月宮位索引（可選）
   * @returns 綜合能量評估
   */
  public calculateMultiLayerEnergies(
    originalPalaces: Palace[],
    daXianPalaceIndex: number,
    liuNianPalaceIndex: number,
    liuYuePalaceIndex?: number
  ): Record<number, {
    palaceIndex: number;
    palaceName: string;
    baseEnergy: number;
    daXianEnergy: number;
    liuNianEnergy: number;
    liuYueEnergy: number;
    totalEnergy: number;
    interpretation: string;
  }> {
    const multiLayerEnergies: Record<number, {
      palaceIndex: number;
      palaceName: string;
      baseEnergy: number;
      daXianEnergy: number;
      liuNianEnergy: number;
      liuYueEnergy: number;
      totalEnergy: number;
      interpretation: string;
    }> = {};
    
    // 計算原命盤的四化能量
    const baseFlows = this.calculateTransformationFlows(originalPalaces, []);
    
    // 初始化每個宮位的多層次能量
    for (const palace of originalPalaces) {
      const baseEnergy = baseFlows[palace.index]?.energyScore || 0;
      
      // 大限能量加成（與大限宮位相關的宮位獲得額外能量）
      let daXianEnergy = 0;
      if (palace.index === daXianPalaceIndex) {
        daXianEnergy = 3; // 直接影響
      } else if ((palace.index + 6) % 12 === daXianPalaceIndex) {
        daXianEnergy = -2; // 對宮，抵消部分能量
      } else if ((palace.index + 4) % 12 === daXianPalaceIndex || 
                 (palace.index + 8) % 12 === daXianPalaceIndex) {
        daXianEnergy = 1; // 三合，輕微增強
      }
      
      // 流年能量加成
      let liuNianEnergy = 0;
      if (palace.index === liuNianPalaceIndex) {
        liuNianEnergy = 2; // 直接影響
      } else if ((palace.index + 6) % 12 === liuNianPalaceIndex) {
        liuNianEnergy = -1; // 對宮，輕微抵消
      }
      
      // 流月能量加成（如果提供）
      let liuYueEnergy = 0;
      if (liuYuePalaceIndex !== undefined) {
        if (palace.index === liuYuePalaceIndex) {
          liuYueEnergy = 1; // 直接影響，但較弱
        }
      }
      
      // 計算總能量
      const totalEnergy = baseEnergy + daXianEnergy + liuNianEnergy + liuYueEnergy;
      
      // 生成解釋
      let interpretation = '';
      if (totalEnergy >= 5) {
        interpretation = '極度吉利，有重大發展機遇';
      } else if (totalEnergy >= 3) {
        interpretation = '運勢順遂，可有所收穫';
      } else if (totalEnergy >= 0) {
        interpretation = '運勢平穩，維持現狀';
      } else if (totalEnergy >= -3) {
        interpretation = '運勢受阻，需謹慎行事';
      } else {
        interpretation = '運勢低迷，避免重大決策';
      }
      
      // 保存多層次能量評估
      multiLayerEnergies[palace.index] = {
        palaceIndex: palace.index,
        palaceName: palace.name,
        baseEnergy,
        daXianEnergy,
        liuNianEnergy,
        liuYueEnergy,
        totalEnergy,
        interpretation
      };
    }
    
    return multiLayerEnergies;
  }
}
