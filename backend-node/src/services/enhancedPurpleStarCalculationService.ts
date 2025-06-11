// backend-node/src/services/enhancedPurpleStarCalculationService.ts
// 增強版紫微斗數計算服務

import { 
  BirthInfo, 
  PurpleStarChart, 
  Palace, 
  Star, 
  DaXianInfo, 
  XiaoXianInfo,
  LiuNianTaiSuiInfo,
  LunarInfo 
} from '../types/purpleStarTypes';

import { AstronomicalTimeService } from './astronomicalTimeService';
import { StarPlacementService } from './starPlacementService';
import { TransformationStarService } from './transformationStarService';

/**
 * 增強版紫微斗數計算服務
 * 整合高精度天文時間、星體定位和四化動態計算
 */
export class EnhancedPurpleStarCalculationService {
  // 核心服務實例
  private readonly astronomicalTimeService: AstronomicalTimeService;
  private readonly starPlacementService: StarPlacementService;
  private readonly transformationStarService: TransformationStarService;
  
  // 基本數據
  private birthInfo: BirthInfo;
  private lunarInfo: LunarInfo;
  private solarDate: Date;
  private locationLongitude?: number;
  private locationLatitude?: number;
  private locationTimezone?: string;
  
  // 計算參數
  private mingPalaceStdIndex: number = 0;
  private shenPalaceStdIndex: number = 0;
  private fiveElementsBureau: string | undefined;
  private fiveElementsBureauNumber: number | undefined;
  private mingPalaceGan: string = '';
  
  /**
   * 構造函數
   * @param birthInfo 出生信息
   * @param lunarInfo 農曆信息
   */
  constructor(birthInfo: BirthInfo, lunarInfo: LunarInfo) {
    this.birthInfo = birthInfo;
    this.lunarInfo = lunarInfo;
    this.solarDate = this.birthInfo.solarDate;
    
    // 初始化核心服務
    this.astronomicalTimeService = new AstronomicalTimeService();
    this.starPlacementService = new StarPlacementService();
    this.transformationStarService = new TransformationStarService();
    
    // 初始化計算
    this.initializeCalculation();
  }
  
  /**
   * 初始化紫微斗數計算
   * 設置基本屬性和參數
   */
  private initializeCalculation(): void {
    try {
      console.log('開始初始化紫微斗數計算...', { lunarInfo: this.lunarInfo });
      
      // 解析地理位置信息（如果有提供）
      if (this.birthInfo.location) {
        try {
          const locationParts = this.birthInfo.location.split(',');
          if (locationParts.length >= 2) {
            this.locationLongitude = parseFloat(locationParts[0].trim());
            this.locationLatitude = parseFloat(locationParts[1].trim());
          }
          if (locationParts.length >= 3) {
            this.locationTimezone = locationParts[2].trim();
          }
        } catch (error) {
          console.warn('Failed to parse location info:', error);
        }
      }
      
      const longitude = this.locationLongitude;
      const latitude = this.locationLatitude;
      const timezone = this.locationTimezone;
      
      // 計算命宮身宮位置
      console.log('Step 1: 計算命宮身宮位置...');
      
      // 如果有提供經度和時區，則使用精確時間計算
      if (longitude !== undefined && timezone) {
        this.mingPalaceStdIndex = this.astronomicalTimeService.calculatePreciseMingPalaceIndex(
          this.lunarInfo,
          longitude,
          timezone,
          this.solarDate
        );
        
        // 計算身宮
        const YIN_PALACE_STD_INDEX = 2;
        const lunarMonth = this.lunarInfo.month;
        const chineseHourZhiIndex = this.ZHI_NAMES.indexOf(this.lunarInfo.timeZhi);
        this.shenPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) + chineseHourZhiIndex) % 12;
      } else {
        // 使用傳統方法計算
        const palacesInfo = this.calculateMingAndShenPalaceIndices();
        this.mingPalaceStdIndex = palacesInfo.mingPalaceStdIndex;
        this.shenPalaceStdIndex = palacesInfo.shenPalaceStdIndex;
      }
      
      console.log('命宮身宮計算完成:', {
        mingPalaceStdIndex: this.mingPalaceStdIndex,
        shenPalaceStdIndex: this.shenPalaceStdIndex
      });
      
      // 計算命宮天干
      console.log('Step 2: 計算命宮天干...');
      this.mingPalaceGan = this.transformationStarService.getMingPalaceGan(
        this.lunarInfo.yearGan,
        this.mingPalaceStdIndex
      );
      console.log('命宮天干計算完成:', this.mingPalaceGan);
      
      // 計算五行局
      console.log('Step 3: 計算五行局...');
      this.fiveElementsBureau = this.calculateFiveElementsBureau();
      console.log('五行局計算完成:', this.fiveElementsBureau);
      
      // 提取五行局數字
      console.log('Step 4: 提取五行局數字...');
      this.fiveElementsBureauNumber = this.extractBureauNumber(this.fiveElementsBureau);
      console.log('五行局數字提取完成:', this.fiveElementsBureauNumber);
      
      console.log('紫微斗數計算初始化完成:', {
        mingPalaceStdIndex: this.mingPalaceStdIndex,
        shenPalaceStdIndex: this.shenPalaceStdIndex,
        mingPalaceGan: this.mingPalaceGan,
        fiveElementsBureau: this.fiveElementsBureau,
        fiveElementsBureauNumber: this.fiveElementsBureauNumber,
        lunarInfo: this.lunarInfo
      });
      
    } catch (error) {
      console.error('Error initializing purple star calculation:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`無法初始化紫微斗數計算: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 計算命盤
   * @param options 選項
   * @returns 紫微斗數命盤
   */
  public async calculateChart(options: {
    includeMajorCycles?: boolean;
    includeMinorCycles?: boolean;
    includeAnnualCycles?: boolean;
    maxAge?: number;
  } = {}): Promise<PurpleStarChart> {
    try {
      // 計算宮位
      const palaces = this.starPlacementService.calculatePalaces(this.mingPalaceStdIndex);
      
      // 計算紫微星位置
      const ziweiLocationIndex = this.locateZiWeiStar();
      
      // 計算主星
      const ziweiStars = this.starPlacementService.locateZiweiStarSystem(palaces, ziweiLocationIndex);
      const tianfuStars = this.starPlacementService.locateTianfuStarSystem(palaces, ziweiLocationIndex);
      
      // 計算輔星
      const auxiliaryStars = this.starPlacementService.calculateAuxiliaryStars(palaces, this.lunarInfo);
      
      // 應用四化
      const transformedStars = this.transformationStarService.applyFourTransformations(palaces, this.mingPalaceGan);
      
      // 計算星體之間的關係
      const starRelationships = this.starPlacementService.calculateStarRelationships(palaces);
      
      // 計算四化組合分析
      const transformationCombinations = this.transformationStarService.analyzeTransformationCombinations(palaces);
      
      // 計算宮位吉凶
      for (const palace of palaces) {
        this.determinePalaceFortune(palace);
      }
      
      // 計算生命週期（如果需要）
      const daXian = options.includeMajorCycles ? 
        this.calculateDaXian(palaces, options.maxAge || 100) : undefined;
      
      const xiaoXian = options.includeMinorCycles ? 
        this.calculateXiaoXian(palaces, options.maxAge || 100) : undefined;
      
      const liuNianTaiSui = options.includeAnnualCycles ?
        this.calculateLiuNianTaiSui(palaces, options.maxAge || 100) : undefined;
      
      // 返回計算結果
      return {
        palaces,
        mingPalaceIndex: this.mingPalaceStdIndex,
        shenPalaceIndex: this.shenPalaceStdIndex,
        fiveElementsBureau: this.fiveElementsBureau,
        daXian,
        xiaoXian,
        liuNianTaiSui
      };
    } catch (error) {
      console.error('Error calculating Purple Star chart:', error);
      throw new Error('計算紫微斗數命盤時發生錯誤');
    }
  }
  
  // 地支名稱常量
  private readonly ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 宮位名稱順序常量
  private readonly PALACE_NAMES_ORDERED = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
    '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
  ];
  
  // 星曜屬性配置
  private readonly STAR_ATTRIBUTES_CONFIG: Record<string, {
    attribute: '吉' | '凶' | '中性';
    propertyType: '陽' | '陰';
    element: '水' | '木' | '火' | '土' | '金';
    strength: number;
    description: string;
  }> = {
    // 紫微星系
    '紫微': { attribute: '吉', propertyType: '陽', element: '土', strength: 10, description: '至尊星，象徵權威、領導' },
    '天機': { attribute: '吉', propertyType: '陽', element: '木', strength: 8, description: '智慧星，主思考、創意' },
    '太陽': { attribute: '吉', propertyType: '陽', element: '火', strength: 9, description: '光明之星，主榮耀、名聲' },
    '武曲': { attribute: '中性', propertyType: '陽', element: '金', strength: 7, description: '財帛星，主財富、資源' },
    '天同': { attribute: '吉', propertyType: '陰', element: '水', strength: 6, description: '福德星，主恩澤、福氣' },
    '廉貞': { attribute: '凶', propertyType: '陽', element: '火', strength: 5, description: '變革星，主挑戰、轉變' },
    
    // 天府星系
    '天府': { attribute: '吉', propertyType: '陰', element: '土', strength: 9, description: '福祿星，象徵福分、財祿' },
    '太陰': { attribute: '中性', propertyType: '陰', element: '水', strength: 8, description: '情感星，主感性、隱密' },
    '貪狼': { attribute: '凶', propertyType: '陽', element: '木', strength: 7, description: '欲望星，主慾望、進取' },
    '巨門': { attribute: '凶', propertyType: '陰', element: '水', strength: 6, description: '口舌星，主言辭、交流' },
    '天相': { attribute: '吉', propertyType: '陰', element: '木', strength: 6, description: '輔佐星，主貴人、協助' },
    '天梁': { attribute: '吉', propertyType: '陰', element: '火', strength: 7, description: '福壽星，主長壽、善良' },
    '七殺': { attribute: '凶', propertyType: '陽', element: '金', strength: 8, description: '權威星，主剛強、威嚴' },
    '破軍': { attribute: '凶', propertyType: '陽', element: '水', strength: 7, description: '變動星，主波動、奔波' },
    
    // 輔星
    '左輔': { attribute: '吉', propertyType: '陽', element: '金', strength: 5, description: '左相星，主輔佐、協助' },
    '右弼': { attribute: '吉', propertyType: '陽', element: '金', strength: 5, description: '右相星，主輔佐、協助' },
    '文昌': { attribute: '吉', propertyType: '陽', element: '金', strength: 6, description: '文學星，主學業、才華' },
    '文曲': { attribute: '吉', propertyType: '陰', element: '水', strength: 6, description: '文采星，主藝術、才情' },
    '天空': { attribute: '凶', propertyType: '陰', element: '土', strength: 4, description: '虛無星，主空虛、幻想' },
    '地劫': { attribute: '凶', propertyType: '陽', element: '土', strength: 4, description: '災厄星，主災難、煩惱' },
    '天魁': { attribute: '吉', propertyType: '陽', element: '水', strength: 5, description: '貴人星，主助力、提攜' },
    '天鉞': { attribute: '吉', propertyType: '陽', element: '水', strength: 5, description: '貴人星，主助力、提攜' },
    '祿存': { attribute: '吉', propertyType: '陽', element: '金', strength: 6, description: '財祿星，主財富、祿位' },
    '擎羊': { attribute: '凶', propertyType: '陽', element: '火', strength: 5, description: '刑星，主刑沖、變動' },
    '陀羅': { attribute: '凶', propertyType: '陰', element: '土', strength: 5, description: '障星，主阻礙、壓力' },
    '火星': { attribute: '凶', propertyType: '陽', element: '火', strength: 4, description: '災厄星，主災禍、煩惱' },
    '鈴星': { attribute: '凶', propertyType: '陽', element: '金', strength: 4, description: '憂星，主憂慮、糾紛' },
  };
  
  // 宮位屬性配置
  private readonly PALACE_ATTRIBUTES_CONFIG: Record<string, {
    significance: 'high' | 'medium' | 'low';
    element: '水' | '木' | '火' | '土' | '金';
    description: string;
  }> = {
    '命宮': { significance: 'high', element: '土', description: '代表自我、個性、人生' },
    '兄弟宮': { significance: 'medium', element: '木', description: '代表兄弟姐妹、朋友、人際關係' },
    '夫妻宮': { significance: 'high', element: '金', description: '代表配偶、伴侶、婚姻' },
    '子女宮': { significance: 'medium', element: '水', description: '代表子女、創造力、才華' },
    '財帛宮': { significance: 'high', element: '金', description: '代表財富、收入、資產' },
    '疾厄宮': { significance: 'medium', element: '火', description: '代表健康、疾病、困厄' },
    '遷移宮': { significance: 'medium', element: '水', description: '代表旅行、變動、居所' },
    '交友宮': { significance: 'medium', element: '木', description: '代表朋友、人脈、社交' },
    '官祿宮': { significance: 'high', element: '水', description: '代表事業、工作、成就' },
    '田宅宮': { significance: 'medium', element: '土', description: '代表房產、家宅、不動產' },
    '福德宮': { significance: 'high', element: '火', description: '代表福氣、心靈、休閒' },
    '父母宮': { significance: 'medium', element: '金', description: '代表父母、長輩、上司' }
  };
  
  /**
   * 計算命宮和身宮索引
   * @returns 命宮和身宮索引
   */
  private calculateMingAndShenPalaceIndices(): { mingPalaceStdIndex: number; shenPalaceStdIndex: number } {
    const YIN_PALACE_STD_INDEX = 2;
    const lunarMonth = this.lunarInfo.month;
    const chineseHourZhiIndex = this.ZHI_NAMES.indexOf(this.lunarInfo.timeZhi);
    
    if (chineseHourZhiIndex === -1) {
      throw new Error(`無法識別的時辰: ${this.lunarInfo.timeZhi}`);
    }
    
    let mingPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) - chineseHourZhiIndex);
    mingPalaceStdIndex = (mingPalaceStdIndex % 12 + 12) % 12;
    
    let shenPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) + chineseHourZhiIndex) % 12;
    
    return { mingPalaceStdIndex, shenPalaceStdIndex };
  }
  
  /**
   * 計算五行局
   * @returns 五行局
   */
  private calculateFiveElementsBureau(): string {
    const mingPalaceGan = this.mingPalaceGan;
    const mingPalaceZhi = this.ZHI_NAMES[this.mingPalaceStdIndex];
    const mingGanZhi = mingPalaceGan + mingPalaceZhi;
    
    if (["甲子", "乙丑", "壬申", "癸酉", "庚辰", "辛巳", "甲午", "乙未", "庚戌", "辛亥", "壬寅", "癸卯"].includes(mingGanZhi)) return "金四局";
    if (["丙寅", "丁卯", "甲戌", "乙亥", "戊子", "己丑", "丙申", "丁酉", "甲辰", "乙巳"].includes(mingGanZhi)) return "火六局";
    if (["戊辰", "己巳", "壬午", "癸未", "戊戌", "己亥", "壬子", "癸丑"].includes(mingGanZhi)) return "木三局";
    if (["庚午", "辛未", "戊寅", "己卯", "丙戌", "丁亥", "戊申", "己酉", "庚子", "辛丑"].includes(mingGanZhi)) return "土五局";
    if (["丙子", "丁丑", "甲申", "乙酉", "壬辰", "癸巳", "丙午", "丁未"].includes(mingGanZhi)) return "水二局";
    
    console.warn(`未找到命宮干支 ${mingGanZhi} 的五行局，使用默認水二局`);
    return "水二局"; // 提供默認值而不是"未知局"
  }
  
  /**
   * 提取五行局數字
   * @param bureau 五行局
   * @returns 五行局數字
   */
  private extractBureauNumber(bureau: string | undefined): number | undefined {
    if (!bureau) {
      console.log('extractBureauNumber: bureau is undefined or null');
      return undefined;
    }
    
    console.log('extractBureauNumber: 輸入五行局:', bureau);
    
    // 中文數字對應表
    const chineseNumberMap: Record<string, number> = {
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6
    };
    
    // 先嘗試匹配阿拉伯數字
    const arabicMatch = bureau.match(/\d+/);
    if (arabicMatch) {
      const number = parseInt(arabicMatch[0], 10);
      console.log('extractBureauNumber: 找到阿拉伯數字:', number);
      return number;
    }
    
    // 嘗試匹配中文數字
    for (const [chinese, arabic] of Object.entries(chineseNumberMap)) {
      if (bureau.includes(chinese)) {
        console.log('extractBureauNumber: 找到中文數字:', chinese, '對應:', arabic);
        return arabic;
      }
    }
    
    console.log('extractBureauNumber: 未找到任何數字');
    return undefined;
  }
  
  /**
   * 定位紫微星
   * @returns 紫微星索引
   */
  private locateZiWeiStar(): number {
    const lunarDay = this.lunarInfo.day;
    const bureauNum = this.fiveElementsBureauNumber;
    
    if (bureauNum === undefined) throw new Error("五行局數字未定義");
    
    let quotient = Math.floor(lunarDay / bureauNum);
    let remainder = lunarDay % bureauNum;
    let n = 0;
    
    if (remainder !== 0) {
      n = bureauNum - remainder;
      quotient = Math.floor((lunarDay + n) / bureauNum);
    }
    
    const YIN_PALACE_STD_INDEX = 2;
    let ziweiPalaceStdIndex = (YIN_PALACE_STD_INDEX + quotient - 1 + 12) % 12;
    
    if (n !== 0) {
      if (n % 2 === 1) ziweiPalaceStdIndex = (ziweiPalaceStdIndex - 1 + 12) % 12;
      else ziweiPalaceStdIndex = (ziweiPalaceStdIndex + 1) % 12;
    }
    
    return ziweiPalaceStdIndex;
  }
  
  /**
   * 判斷宮位吉凶
   * @param palace 宮位
   */
  private determinePalaceFortune(palace: Palace): void {
    if (!palace) return;
    
    // 獲取宮位基本屬性
    const palaceAttributes = this.PALACE_ATTRIBUTES_CONFIG[palace.name];
    if (palaceAttributes) {
      palace.significance = palaceAttributes.significance;
      palace.element = palaceAttributes.element;
    }
    
    // 吉星和凶星計數
    let auspiciousCount = 0;
    let inauspiciousCount = 0;
    let totalStrength = 0;
    let auspiciousStrength = 0;
    let inauspiciousStrength = 0;
    
    // 統計宮位中的星曜吉凶
    palace.stars.forEach(star => {
      // 為星曜添加屬性
      const starAttributes = this.STAR_ATTRIBUTES_CONFIG[star.name];
      if (starAttributes) {
        star.attribute = starAttributes.attribute;
        star.propertyType = starAttributes.propertyType;
        star.element = starAttributes.element;
        star.strength = starAttributes.strength;
        star.description = starAttributes.description;
      }
      
      if (star.attribute === '吉') {
        auspiciousCount++;
        auspiciousStrength += star.strength || 0;
      } else if (star.attribute === '凶') {
        inauspiciousCount++;
        inauspiciousStrength += star.strength || 0;
      }
      totalStrength += star.strength || 0;
    });
    
    // 判斷四化的影響
    const hasLu = palace.stars.some(s => s.transformations?.includes('祿'));
    const hasQuan = palace.stars.some(s => s.transformations?.includes('權'));
    const hasKe = palace.stars.some(s => s.transformations?.includes('科'));
    const hasJi = palace.stars.some(s => s.transformations?.includes('忌'));
    
    if (hasLu || hasQuan || hasKe) {
      auspiciousStrength += 2; // 化祿、化權、化科增加吉度
    }
    if (hasJi) {
      inauspiciousStrength += 2; // 化忌增加凶度
    }
    
    // 判斷命宮、夫妻宮、財帛宮、官祿宮的特殊處理
    if (['命宮', '夫妻宮', '財帛宮', '官祿宮'].includes(palace.name)) {
      // 這些重要宮位有主星的影響更大
      const mainStars = palace.stars.filter(s => s.type === 'main');
      
      // 特殊星曜組合的判斷
      const hasZiWei = mainStars.some(s => s.name === '紫微');
      const hasTianJi = mainStars.some(s => s.name === '天機');
      const hasTaiYang = mainStars.some(s => s.name === '太陽');
      const hasTaiYin = mainStars.some(s => s.name === '太陰');
      
      if (hasZiWei && (hasTianJi || hasTaiYang)) {
        auspiciousStrength += 3; // 紫微與天機或太陽同宮，增加吉度
      }
      
      if (mainStars.some(s => s.name === '七殺') && mainStars.some(s => s.name === '破軍')) {
        inauspiciousStrength += 3; // 七殺與破軍同宮，增加凶度
      }
    }
    
    // 計算最終吉凶分數 (1-10)
    const fortuneScore = Math.min(10, Math.max(1, 5 + 
      Math.floor((auspiciousStrength - inauspiciousStrength) / 
      Math.max(1, totalStrength) * 5)
    ));
    
    palace.fortuneScore = fortuneScore;
    
    // 根據分數判斷吉凶
    if (fortuneScore >= 7) {
      palace.fortuneType = '吉';
    } else if (fortuneScore <= 4) {
      palace.fortuneType = '凶';
    } else {
      palace.fortuneType = '中性';
    }
  }
  
  /**
   * 判斷天干是否為陽干
   * @param gan 天干
   * @returns 是否為陽干
   */
  private isGanYang(gan: string): boolean {
    const yangGans = ['甲', '丙', '戊', '庚', '壬'];
    return yangGans.includes(gan);
  }

  /**
   * 計算大限
   * @param palaces 宮位數組
   * @param maxAge 最大年齡
   * @returns 大限信息
   */
  private calculateDaXian(palaces: Palace[], maxAge: number = 120): DaXianInfo[] {
    const daXianList: DaXianInfo[] = [];
    
    if (this.fiveElementsBureauNumber === undefined) {
      throw new Error("五行局數字未定義，無法計算大限");
    }
    
    const startAge = this.fiveElementsBureauNumber;
    const yearGan = this.lunarInfo.yearGan;
    const isYearGanYang = this.isGanYang(yearGan);
    const isMale = this.birthInfo.gender === 'male';
    const isForward = (isYearGanYang && isMale) || (!isYearGanYang && !isMale);
    
    let currentAge = startAge;
    let palaceOrderOffset = 0;
    
    while (currentAge <= maxAge) {
      let currentMingPalaceRelativeIndex = 0;
      let daXianPalaceOrderIndex = 0;
      
      if (isForward) {
        daXianPalaceOrderIndex = (currentMingPalaceRelativeIndex + palaceOrderOffset + 12) % 12;
      } else {
        daXianPalaceOrderIndex = (currentMingPalaceRelativeIndex - palaceOrderOffset + 12) % 12;
      }
      
      const daXianPalace = palaces.find(p => p.name === this.PALACE_NAMES_ORDERED[daXianPalaceOrderIndex]);
      if (!daXianPalace) {
        console.error(`無法找到大限宮位: order index ${daXianPalaceOrderIndex}`);
        break;
      }
      
      daXianList.push({
        startAge: currentAge,
        endAge: currentAge + 9,
        palaceName: daXianPalace.name,
        palaceZhi: this.ZHI_NAMES[daXianPalace.index],
        palaceIndex: daXianPalace.index,
      });
      
      currentAge += 10;
      palaceOrderOffset++;
    }
    
    return daXianList;
  }

  /**
   * 計算小限
   * @param palaces 宮位數組
   * @param maxAge 最大年齡
   * @returns 小限信息
   */
  private calculateXiaoXian(palaces: Palace[], maxAge: number = 100): XiaoXianInfo[] {
    const xiaoXianList: XiaoXianInfo[] = [];
    const yearZhi = this.lunarInfo.yearZhi;
    const isMale = this.birthInfo.gender === 'male';
    
    let startPalaceZhiIndex: number;
    
    // 口訣：寅午戌局從辰起；申子辰局從戌起；巳酉丑局從未起；亥卯未局從丑起。
    if (['寅', '午', '戌'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('辰');
    else if (['申', '子', '辰'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('戌');
    else if (['巳', '酉', '丑'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('未');
    else if (['亥', '卯', '未'].includes(yearZhi)) startPalaceZhiIndex = this.ZHI_NAMES.indexOf('丑');
    else throw new Error(`無法識別的年支用於小限起點: ${yearZhi}`);
    
    for (let age = 1; age <= maxAge; age++) {
      let currentPalaceZhiIndex: number;
      
      if (isMale) {
        currentPalaceZhiIndex = (startPalaceZhiIndex + (age - 1) + 12) % 12;
      } else {
        currentPalaceZhiIndex = (startPalaceZhiIndex - (age - 1) + 12) % 12;
      }
      
      const xiaoXianPalace = palaces.find(p => p.index === currentPalaceZhiIndex);
      if (!xiaoXianPalace) {
        console.error(`無法找到小限宮位: age ${age}, zhi index ${currentPalaceZhiIndex}`);
        continue;
      }
      
      xiaoXianList.push({
        age: age,
        palaceName: xiaoXianPalace.name,
        palaceZhi: this.ZHI_NAMES[currentPalaceZhiIndex],
        palaceIndex: currentPalaceZhiIndex,
      });
    }
    
    return xiaoXianList;
  }

  /**
   * 計算流年太歲
   * @param palaces 宮位數組
   * @param maxAge 最大年齡
   * @returns 流年太歲信息
   */
  private calculateLiuNianTaiSui(palaces: Palace[], maxAge: number = 100): LiuNianTaiSuiInfo[] {
    const liuNianTaiSuiList: LiuNianTaiSuiInfo[] = [];
    const birthYear = this.lunarInfo.year;
    const birthYearZhi = this.lunarInfo.yearZhi;
    
    // 太歲的起始位置就是出生年的地支位置
    const startZhiIndex = this.ZHI_NAMES.indexOf(birthYearZhi);
    if (startZhiIndex === -1) {
      throw new Error(`無法找到出生年地支: ${birthYearZhi}`);
    }
    
    for (let age = 1; age <= maxAge; age++) {
      const currentYear = birthYear + age - 1;
      
      // 流年太歲每年順行一位
      const currentTaiSuiZhiIndex = (startZhiIndex + age - 1) % 12;
      const currentTaiSuiZhi = this.ZHI_NAMES[currentTaiSuiZhiIndex];
      
      // 計算該年的天干
      const GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const yearGanIndex = GAN_NAMES.indexOf(this.lunarInfo.yearGan);
      const currentYearGanIndex = (yearGanIndex + age - 1) % 10;
      const currentYearGan = GAN_NAMES[currentYearGanIndex];
      
      // 組合干支
      const ganZhi = currentYearGan + currentTaiSuiZhi;
      
      // 找到對應的宮位
      const taiSuiPalace = palaces.find(p => p.index === currentTaiSuiZhiIndex);
      if (!taiSuiPalace) {
        console.error(`無法找到流年太歲宮位: age ${age}, zhi index ${currentTaiSuiZhiIndex}`);
        continue;
      }
      
      liuNianTaiSuiList.push({
        year: currentYear,
        ganZhi: ganZhi,
        palaceName: taiSuiPalace.name,
        palaceZhi: currentTaiSuiZhi,
        palaceIndex: currentTaiSuiZhiIndex,
      });
    }
    
    return liuNianTaiSuiList;
  }
}
