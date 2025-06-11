// backend-node/src/services/purpleStarCalculationService.ts
// 紫微斗數計算服務

import { 
  BirthInfo, 
  PurpleStarChart, 
  Palace, 
  Star, 
  DaXianInfo, 
  XiaoXianInfo,
  LiuNianTaiSuiInfo,
  LunarInfo,
  PalaceInterpretation,
  DomainSpecificAnalysis,
  ComprehensiveChartInterpretation
} from '../types/purpleStarTypes';

type TransformationType = '祿' | '權' | '科' | '忌';

interface FourTransformations {
  lu: string; // 化祿的星曜名稱
  quan: string; // 化權的星曜名稱
  ke: string; // 化科的星曜名稱
  ji: string; // 化忌的星曜名稱
}

export class PurpleStarCalculationService {
  private readonly ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  private readonly GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  private readonly PALACE_NAMES_ORDERED = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
    '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
  ];
  private readonly ZIWEI_STAR_SYSTEM = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
  private readonly TIANFU_STAR_SYSTEM = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
  
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
    '地劫': { attribute: '凶', propertyType: '陽', element: '土', strength: 4, description: '災厄星，主災難、煩惱' }
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

  private birthInfo: BirthInfo;
  private lunarInfo: LunarInfo;
  private solarDate: Date;
  private mingPalaceStdIndex: number = 0;
  private shenPalaceStdIndex: number = 0;
  private fiveElementsBureau: string | undefined;
  private fiveElementsBureauNumber: number | undefined;
  private mingPalaceGan: string = '';

  constructor(birthInfo: BirthInfo, lunarInfo: LunarInfo) {
    this.birthInfo = birthInfo;
    this.lunarInfo = lunarInfo;
    this.solarDate = this.birthInfo.solarDate;
    
    // 使用前端傳來的農曆資訊進行初始化
    this.initializeCalculation();
  }

  private initializeCalculation(): void {
    try {
      console.log('開始初始化紫微斗數計算...', { lunarInfo: this.lunarInfo });
      
      // 計算基本屬性
      console.log('Step 1: 計算命宮身宮位置...');
      const palacesInfo = this.calculateMingAndShenPalaceIndices();
      this.mingPalaceStdIndex = palacesInfo.mingPalaceStdIndex;
      this.shenPalaceStdIndex = palacesInfo.shenPalaceStdIndex;
      console.log('命宮身宮計算完成:', palacesInfo);
      
      console.log('Step 2: 計算命宮天干...');
      this.mingPalaceGan = this.getMingPalaceGan();
      console.log('命宮天干計算完成:', this.mingPalaceGan);
      
      console.log('Step 3: 計算五行局...');
      this.fiveElementsBureau = this.calculateFiveElementsBureau();
      console.log('五行局計算完成:', this.fiveElementsBureau);
      
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

  public async calculateChart(options: {
    includeMajorCycles?: boolean;
    includeMinorCycles?: boolean;
    includeAnnualCycles?: boolean;
    includeInterpretation?: boolean; // 新增選項：是否包含解讀
    maxAge?: number;
  } = {}): Promise<PurpleStarChart> {
    try {
      const palaces = this.calculatePalaces(this.mingPalaceStdIndex);
      const ziweiLocationIndex = this.locateZiWeiStar();
      
      // 計算主星和輔星
      this.calculateMainStars(palaces, ziweiLocationIndex);
      this.calculateAuxiliaryStars(palaces);
      
      // 應用四化
      this.applyFourTransformations(palaces, this.mingPalaceGan);
      
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
      
      // 初始化命盤
      const chart: PurpleStarChart = {
        palaces,
        mingPalaceIndex: this.mingPalaceStdIndex,
        shenPalaceIndex: this.shenPalaceStdIndex,
        fiveElementsBureau: this.fiveElementsBureau,
        daXian,
        xiaoXian,
        liuNianTaiSui
      };
      
      // 如果需要解讀，生成各種解讀
      if (options.includeInterpretation !== false) { // 預設為包含解讀
        console.log('正在生成紫微斗數命盤解讀...');
        
        // 生成宮位詳細解讀
        chart.palaceInterpretations = palaces.map(palace => 
          this.generatePalaceDetailedInterpretation(palace)
        );
        
        // 生成特定領域分析
        chart.domainAnalyses = [
          this.generateSpecificDomainAnalysis(palaces, 'career'),
          this.generateSpecificDomainAnalysis(palaces, 'wealth'),
          this.generateSpecificDomainAnalysis(palaces, 'marriage'),
          this.generateSpecificDomainAnalysis(palaces, 'health'),
          this.generateSpecificDomainAnalysis(palaces, 'education'),
          this.generateSpecificDomainAnalysis(palaces, 'social')
        ];
        
        // 生成綜合命盤解讀
        chart.comprehensiveInterpretation = this.generateComprehensiveInterpretation(chart);
        
        console.log('紫微斗數命盤解讀生成完成');
      }
      
      return chart;
    } catch (error) {
      console.error('Error calculating Purple Star chart:', error);
      throw new Error('計算紫微斗數命盤時發生錯誤');
    }
  }

  private getChineseHourZhiIndex(): number {
    return this.ZHI_NAMES.indexOf(this.lunarInfo.timeZhi);
  }

  private calculateMingAndShenPalaceIndices(): { mingPalaceStdIndex: number; shenPalaceStdIndex: number } {
    const YIN_PALACE_STD_INDEX = 2;
    const lunarMonth = this.lunarInfo.month;
    const chineseHourZhiIndex = this.getChineseHourZhiIndex();
    
    let mingPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) - chineseHourZhiIndex);
    mingPalaceStdIndex = (mingPalaceStdIndex % 12 + 12) % 12;
    
    let shenPalaceStdIndex = (YIN_PALACE_STD_INDEX + (lunarMonth - 1) + chineseHourZhiIndex) % 12;
    
    return { mingPalaceStdIndex, shenPalaceStdIndex };
  }

  private getMingPalaceGan(): string {
    const yearGan = this.lunarInfo.yearGan;
    let yinPalaceGan: string;
    
    if (['甲', '己'].includes(yearGan)) yinPalaceGan = '丙';
    else if (['乙', '庚'].includes(yearGan)) yinPalaceGan = '戊';
    else if (['丙', '辛'].includes(yearGan)) yinPalaceGan = '庚';
    else if (['丁', '壬'].includes(yearGan)) yinPalaceGan = '壬';
    else if (['戊', '癸'].includes(yearGan)) yinPalaceGan = '甲';
    else throw new Error('Invalid year Gan');
    
    const ganIndex = (gan: string) => this.GAN_NAMES.indexOf(gan);
    const yinPalaceGanIndex = ganIndex(yinPalaceGan);
    const mingPalaceZhiIndex = this.mingPalaceStdIndex;
    const yinPalaceStdIndex = 2;
    
    let diff = (mingPalaceZhiIndex - yinPalaceStdIndex + 12) % 12;
    const mingPalaceGanIndex = (yinPalaceGanIndex + diff) % 10;
    
    return this.GAN_NAMES[mingPalaceGanIndex];
  }

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

  private calculatePalaces(mingPalaceStdIndex: number): Palace[] {
    const palaces: Palace[] = [];
    
    for (let i = 0; i < 12; i++) {
      const currentPalaceStdZhiIndex = (mingPalaceStdIndex - i + 12) % 12;
      palaces.push({
        name: this.PALACE_NAMES_ORDERED[i],
        index: currentPalaceStdZhiIndex,
        zhi: this.ZHI_NAMES[currentPalaceStdZhiIndex],
        stars: []
      });
    }
    
    return palaces;
  }

  private placeStar(palaces: Palace[], starName: string, starType: 'main' | 'auxiliary' | 'minor', palaceIndex: number): Star {
    // 獲取星曜屬性
    const starAttributes = this.STAR_ATTRIBUTES_CONFIG[starName];
    
    const star: Star = {
      name: starName,
      type: starType,
      palaceIndex,
      transformations: []
    };
    
    // 添加星曜屬性
    if (starAttributes) {
      star.attribute = starAttributes.attribute;
      star.propertyType = starAttributes.propertyType;
      star.element = starAttributes.element;
      star.strength = starAttributes.strength;
      star.description = starAttributes.description;
    }
    
    const palace = palaces.find(p => p.index === palaceIndex);
    if (palace) {
      palace.stars.push(star);
    } else {
      console.error(`無法找到地支索引為 ${palaceIndex} 的宮位來安放 ${starName} 星`);
    }
    
    return star;
  }
  
  /**
   * 判斷宮位吉凶
   * 根據宮位的星曜組合判斷吉凶
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

  private calculateMainStars(palaces: Palace[], ziweiPalaceStdIndex: number): Star[] {
    const allMainStars: Star[] = [];
    
    // 紫微星系
    const ziweiSystemOffsets = [0, -1, -3, -4, -5, -8];
    for (let i = 0; i < this.ZIWEI_STAR_SYSTEM.length; i++) {
      const starName = this.ZIWEI_STAR_SYSTEM[i];
      const palaceIndex = (ziweiPalaceStdIndex + ziweiSystemOffsets[i] + 12) % 12;
      allMainStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    // 天府星系
    const tianfuLocationMap: Record<number, number> = {
      [2]: 2, [8]: 8, [1]: 3, [3]: 1, [0]: 4, [4]: 0,
      [11]: 5, [5]: 11, [10]: 6, [6]: 10, [9]: 7, [7]: 9
    };
    
    const tianfuPalaceStdIndex = tianfuLocationMap[ziweiPalaceStdIndex];
    if (tianfuPalaceStdIndex === undefined) throw new Error("無法定位天府星");
    
    const tianfuSystemOffsets = [0, 1, 2, 3, 4, 5, 6, 10];
    for (let i = 0; i < this.TIANFU_STAR_SYSTEM.length; i++) {
      const starName = this.TIANFU_STAR_SYSTEM[i];
      const palaceIndex = (tianfuPalaceStdIndex + tianfuSystemOffsets[i]) % 12;
      allMainStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    return allMainStars;
  }

  private calculateAuxiliaryStars(palaces: Palace[]): Star[] {
    const auxiliaryStars: Star[] = [];
    const lunarMonth = this.lunarInfo.month;
    const chineseHourZhiIndex = this.getChineseHourZhiIndex();
    
    // 左輔：正月起辰宮，順行數至生月安左輔
    const CHEN_PALACE_STD_INDEX = 4; // 辰宮索引
    const zuoFuPalaceIndex = (CHEN_PALACE_STD_INDEX + (lunarMonth - 1)) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '左輔', 'auxiliary', zuoFuPalaceIndex));
    
    // 右弼：正月起戌宮，逆行數至生月安右弼
    const XU_PALACE_STD_INDEX = 10; // 戌宮索引
    const youBiPalaceIndex = (XU_PALACE_STD_INDEX - (lunarMonth - 1) + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '右弼', 'auxiliary', youBiPalaceIndex));
    
    // 文昌：子時戌上起文昌，逆行至生時安
    // 將時辰轉換為從子時開始的相對索引
    const ZI_TIME_INDEX = 0; // 子時索引
    const timeIndexFromZi = (chineseHourZhiIndex - ZI_TIME_INDEX + 12) % 12;
    const wenChangPalaceIndex = (XU_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文昌', 'auxiliary', wenChangPalaceIndex));
    
    // 文曲：辰上起，順行至生時安
    const wenQuPalaceIndex = (CHEN_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文曲', 'auxiliary', wenQuPalaceIndex));
    
    // 天空（地空）：亥宮起子時安天空，逆行排時
    const HAI_PALACE_STD_INDEX = 11; // 亥宮索引
    const tianKongPalaceIndex = (HAI_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '天空', 'auxiliary', tianKongPalaceIndex));
    
    // 地劫：亥宮起子時安地劫，順行排時
    const diJiePalaceIndex = (HAI_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '地劫', 'auxiliary', diJiePalaceIndex));
    
    return auxiliaryStars;
  }

  private applyFourTransformations(palaces: Palace[], targetGan: string): void {
    const transformations = this.FOUR_TRANSFORMATIONS_MAP[targetGan];
    if (!transformations) {
      console.warn(`找不到天干 ${targetGan} 的四化表`);
      return;
    }
    
    const applyTransform = (starName: string, transformType: TransformationType) => {
      palaces.forEach(palace => {
        palace.stars.forEach(star => {
          if (star.name === starName) {
            if (!star.transformations) star.transformations = [];
            star.transformations.push(transformType);
          }
        });
      });
    };
    
    applyTransform(transformations.lu, '祿');
    applyTransform(transformations.quan, '權');
    applyTransform(transformations.ke, '科');
    applyTransform(transformations.ji, '忌');
  }

  private isGanYang(gan: string): boolean {
    const yangGans = ['甲', '丙', '戊', '庚', '壬'];
    return yangGans.includes(gan);
  }

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
      const yearGanIndex = this.GAN_NAMES.indexOf(this.lunarInfo.yearGan);
      const currentYearGanIndex = (yearGanIndex + age - 1) % 10;
      const currentYearGan = this.GAN_NAMES[currentYearGanIndex];
      
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

  /**
   * 生成特定領域分析
   * 根據特定領域相關的宮位和星曜組合，提供專項分析
   */
  private generateSpecificDomainAnalysis(palaces: Palace[], domain: 'career' | 'wealth' | 'marriage' | 'health' | 'education' | 'social'): DomainSpecificAnalysis {
    // 領域對應的宮位映射
    const domainToPalaces: Record<string, string[]> = {
      'career': ['官祿宮', '財帛宮', '遷移宮'],
      'wealth': ['財帛宮', '田宅宮', '福德宮'],
      'marriage': ['夫妻宮', '子女宮', '福德宮'],
      'health': ['疾厄宮', '命宮', '福德宮'],
      'education': ['官祿宮', '命宮', '父母宮'],
      'social': ['兄弟宮', '交友宮', '遷移宮']
    };
    
    // 獲取相關宮位
    const relevantPalaceNames = domainToPalaces[domain] || [];
    const relevantPalaces = palaces.filter(p => relevantPalaceNames.includes(p.name));
    
    // 初始化領域分析
    const analysis: DomainSpecificAnalysis = {
      domain,
      overallFortune: 'neutral',
      keyInsights: [],
      starInfluences: [],
      recommendedActions: [],
      periods: {
        favorable: [],
        challenging: []
      }
    };
    
    // 計算整體運勢
    let totalFortuneScore = 0;
    relevantPalaces.forEach(palace => {
      totalFortuneScore += palace.fortuneScore || 5;
    });
    const averageScore = totalFortuneScore / (relevantPalaces.length || 1);
    
    // 根據平均分數判斷整體運勢
    if (averageScore >= 8) analysis.overallFortune = 'excellent';
    else if (averageScore >= 6) analysis.overallFortune = 'good';
    else if (averageScore >= 4) analysis.overallFortune = 'neutral';
    else if (averageScore >= 2) analysis.overallFortune = 'challenging';
    else analysis.overallFortune = 'difficult';
    
    // 根據領域提供特定解讀
    if (domain === 'career') {
      analysis.keyInsights.push('職業發展方向與成就潛力');
      analysis.recommendedActions.push('發展專業技能', '建立人脈網絡');
      
      // 官祿宮特別分析
      const officePalace = palaces.find(p => p.name === '官祿宮');
      if (officePalace) {
        // 檢查主星組合
        const hasZiWei = officePalace.stars.some(s => s.name === '紫微');
        const hasTianJi = officePalace.stars.some(s => s.name === '天機');
        const hasTaiYang = officePalace.stars.some(s => s.name === '太陽');
        
        if (hasZiWei) {
          analysis.keyInsights.push('具有領導才能，適合管理職位');
          analysis.starInfluences.push('紫微星入官祿：有權威與管理能力，適合擔任領導角色');
        }
        if (hasTianJi) {
          analysis.keyInsights.push('思維靈活，適合策略規劃或顧問角色');
          analysis.starInfluences.push('天機星入官祿：有策略思維，適合規劃和顧問工作');
        }
        if (hasTaiYang) {
          analysis.keyInsights.push('有社交魅力，適合需要公眾互動的職位');
          analysis.starInfluences.push('太陽星入官祿：有光彩照人的特質，適合公眾場合展現');
        }
      }
    } 
    else if (domain === 'wealth') {
      analysis.keyInsights.push('財富累積模式與投資機會');
      analysis.recommendedActions.push('建立多元收入來源', '謹慎規劃長期投資');
      
      // 財帛宮特別分析
      const wealthPalace = palaces.find(p => p.name === '財帛宮');
      if (wealthPalace) {
        // 檢查主星組合
        const hasWuQu = wealthPalace.stars.some(s => s.name === '武曲');
        const hasTianFu = wealthPalace.stars.some(s => s.name === '天府');
        
        if (hasWuQu) {
          analysis.keyInsights.push('善於財務管理，適合計劃性投資');
          analysis.starInfluences.push('武曲星入財帛：有財務規劃能力，適合系統性理財');
        }
        if (hasTianFu) {
          analysis.keyInsights.push('穩健累積財富，長期投資有利');
          analysis.starInfluences.push('天府星入財帛：有穩定財源，適合長期積累');
        }
      }
    }
    else if (domain === 'marriage') {
      analysis.keyInsights.push('婚姻關係發展與伴侶特質');
      analysis.recommendedActions.push('培養溝通技巧', '建立情感連結');
      
      // 夫妻宮特別分析
      const marriagePalace = palaces.find(p => p.name === '夫妻宮');
      if (marriagePalace) {
        // 檢查主星組合
        const hasTaiYang = marriagePalace.stars.some(s => s.name === '太陽');
        const hasTaiYin = marriagePalace.stars.some(s => s.name === '太陰');
        
        if (hasTaiYang) {
          analysis.keyInsights.push('伴侶可能外向活潑，關係陽光正向');
          analysis.starInfluences.push('太陽星入夫妻：伴侶個性外向，具社交魅力');
        }
        if (hasTaiYin) {
          analysis.keyInsights.push('伴侶可能內斂感性，情感連結深厚');
          analysis.starInfluences.push('太陰星入夫妻：伴侶個性內斂，情感豐富');
        }
      }
    }
    else if (domain === 'health') {
      analysis.keyInsights.push('身心健康狀況與養生重點');
      analysis.recommendedActions.push('建立規律生活習慣', '注意壓力管理');
      
      // 疾厄宮特別分析
      const healthPalace = palaces.find(p => p.name === '疾厄宮');
      if (healthPalace) {
        // 檢查主星組合
        const hasTianTong = healthPalace.stars.some(s => s.name === '天同');
        const hasPoJun = healthPalace.stars.some(s => s.name === '破軍');
        
        if (hasTianTong) {
          analysis.keyInsights.push('整體健康狀況良好，注意情緒管理');
          analysis.starInfluences.push('天同星入疾厄：身體狀況穩定，需注意情緒平衡');
        }
        if (hasPoJun) {
          analysis.keyInsights.push('可能有突發性健康問題，需保持警覺');
          analysis.starInfluences.push('破軍星入疾厄：健康有變數，需特別關注');
        }
      }
    }
    else if (domain === 'education') {
      analysis.keyInsights.push('學習能力與知識發展方向');
      analysis.recommendedActions.push('發揮個人學習優勢', '建立有效學習策略');
      
      // 檢查文昌文曲星
      const hasWenChang = palaces.some(p => p.stars.some(s => s.name === '文昌'));
      const hasWenQu = palaces.some(p => p.stars.some(s => s.name === '文曲'));
      
      if (hasWenChang) {
        analysis.keyInsights.push('學術表現優秀，適合持續深造');
        analysis.starInfluences.push('文昌星：增強學習能力，利於考試與學術發展');
      }
      if (hasWenQu) {
        analysis.keyInsights.push('文藝才華出眾，創作潛力佳');
        analysis.starInfluences.push('文曲星：提升藝術天賦，有創作才華');
      }
    }
    else if (domain === 'social') {
      analysis.keyInsights.push('人際關係模式與社交網絡');
      analysis.recommendedActions.push('拓展有益人脈', '深化重要關係');
      
      // 檢查輔弼星
      const hasZuoFu = palaces.some(p => p.stars.some(s => s.name === '左輔'));
      const hasYouBi = palaces.some(p => p.stars.some(s => s.name === '右弼'));
      
      if (hasZuoFu || hasYouBi) {
        analysis.keyInsights.push('貴人運佳，社交支持網絡強');
        analysis.starInfluences.push('左輔右弼星：增加人際支持，獲得貴人相助');
      }
    }
    
    // 添加有利與挑戰時期
    if (this.birthInfo) {
      const currentYear = new Date().getFullYear();
      // 簡易預測未來5年
      for (let i = 0; i < 5; i++) {
        const year = currentYear + i;
        const yearMod12 = (year - 4) % 12; // 簡化的流年計算
        
        // 根據流年地支與領域相關宮位的關係判斷
        if ([0, 4, 8].includes(yearMod12)) { // 子、辰、申年
          analysis.periods.favorable.push(`${year}年：利於開展新計劃`);
        }
        if ([2, 6, 10].includes(yearMod12)) { // 寅、午、戌年
          analysis.periods.favorable.push(`${year}年：有突破性發展機會`);
        }
        if ([3, 7, 11].includes(yearMod12)) { // 卯、未、亥年
          analysis.periods.challenging.push(`${year}年：可能面臨轉變與調整`);
        }
        if ([1, 5, 9].includes(yearMod12)) { // 丑、巳、酉年
          analysis.periods.challenging.push(`${year}年：需謹慎決策，避免衝動`);
        }
      }
    }
    
    return analysis;
  }
  
  /**
   * 生成宮位詳細解讀
   * 根據宮位的星曜組合和屬性，提供詳細的解讀
   */
  /**
   * 生成綜合命盤解讀
   * 提供整體命盤的全面解讀
   */
  private generateComprehensiveInterpretation(chart: PurpleStarChart): ComprehensiveChartInterpretation {
    const palaces = chart.palaces;
    const mingPalace = palaces.find(p => p.name === '命宮');
    
    // 初始化綜合解讀
    const interpretation: ComprehensiveChartInterpretation = {
      overallLifePattern: '',
      majorLifeCycles: [],
      potentialChallenges: [],
      uniqueStrengths: [],
      spiritualGrowthPath: '',
      lifePurpose: '',
      keyCrossPalacePatterns: []
    };
    
    // 命盤核心特質解讀
    if (mingPalace) {
      const hasZiWei = mingPalace.stars.some(s => s.name === '紫微');
      const hasTianJi = mingPalace.stars.some(s => s.name === '天機');
      const hasTaiYang = mingPalace.stars.some(s => s.name === '太陽');
      const hasTianFu = mingPalace.stars.some(s => s.name === '天府');
      const hasTaiYin = mingPalace.stars.some(s => s.name === '太陰');
      
      // 根據命宮星曜組合決定整體生命模式
      if (hasZiWei) {
        interpretation.overallLifePattern = '貴人型：天生具有領導特質，一生中常有貴人相助，適合擔任組織核心角色';
        interpretation.uniqueStrengths.push('領導才能', '組織規劃能力', '權威感與影響力');
      } else if (hasTianJi) {
        interpretation.overallLifePattern = '智慧型：具有敏銳思維與分析能力，適合從事需要策略規劃的工作';
        interpretation.uniqueStrengths.push('分析能力', '策略思維', '洞察力');
      } else if (hasTaiYang) {
        interpretation.overallLifePattern = '光輝型：具有社交魅力與積極特質，容易獲得他人認同與支持';
        interpretation.uniqueStrengths.push('社交魅力', '樂觀精神', '自信表達');
      } else if (hasTianFu) {
        interpretation.overallLifePattern = '穩健型：腳踏實地，循序漸進，財富與成就隨時間累積';
        interpretation.uniqueStrengths.push('耐心毅力', '穩定性', '資源管理能力');
      } else if (hasTaiYin) {
        interpretation.overallLifePattern = '感性型：具有豐富情感與直覺，重視人際關係與心靈滿足';
        interpretation.uniqueStrengths.push('情感豐富', '藝術感受力', '直覺敏銳');
      } else {
        interpretation.overallLifePattern = '多元型：具有適應多變環境的能力，生命發展較為多元';
        interpretation.uniqueStrengths.push('適應力', '多元興趣', '彈性思維');
      }
    }
    
    // 分析命盤中的吉凶星配置
    const auspiciousPalaces = palaces.filter(p => p.fortuneType === '吉');
    const inauspiciousPalaces = palaces.filter(p => p.fortuneType === '凶');
    
    // 獨特優勢分析
    if (auspiciousPalaces.length >= 6) {
      interpretation.uniqueStrengths.push('整體運勢良好，多數人生領域順遂');
    }
    
    // 獲取吉星多的宮位
    const significantAuspiciousPalaces = auspiciousPalaces
      .filter(p => p.stars.filter(s => s.attribute === '吉').length >= 2)
      .map(p => p.name);
    
    if (significantAuspiciousPalaces.length > 0) {
      interpretation.uniqueStrengths.push(`在${significantAuspiciousPalaces.join('、')}等領域具有突出優勢`);
    }
    
    // 潛在挑戰分析
    if (inauspiciousPalaces.length >= 4) {
      interpretation.potentialChallenges.push('需面對多個人生領域的挑戰，鍛鍊逆境智慧');
    }
    
    // 獲取凶星多的宮位
    const significantInauspiciousPalaces = inauspiciousPalaces
      .filter(p => p.stars.filter(s => s.attribute === '凶').length >= 2)
      .map(p => p.name);
    
    if (significantInauspiciousPalaces.length > 0) {
      interpretation.potentialChallenges.push(`在${significantInauspiciousPalaces.join('、')}等領域可能面臨較大挑戰`);
    }
    
    // 主要生命週期分析
    if (chart.daXian && chart.daXian.length > 0) {
      // 分析大限代表的生命週期
      const significantDaXians = chart.daXian.slice(0, 4); // 取前四個大限
      
      significantDaXians.forEach(daXian => {
        const daXianPalace = palaces.find(p => p.index === daXian.palaceIndex);
        if (daXianPalace) {
          const palaceStars = daXianPalace.stars.filter(s => s.type === 'main');
          const palaceFortuneType = daXianPalace.fortuneType || '中性';
          
          let theme = '穩定發展期';
          if (palaceFortuneType === '吉') theme = '順遂成長期';
          else if (palaceFortuneType === '凶') theme = '挑戰轉型期';
          
          let focus = daXianPalace.name.replace('宮', '領域');
          if (daXianPalace.name === '命宮') focus = '個人發展';
          else if (daXianPalace.name === '財帛宮') focus = '財富積累';
          else if (daXianPalace.name === '官祿宮') focus = '事業發展';
          else if (daXianPalace.name === '夫妻宮') focus = '婚姻關係';
          
          interpretation.majorLifeCycles.push({
            period: `${daXian.startAge}-${daXian.endAge}歲`,
            theme: theme,
            focus: focus
          });
        }
      });
    }
    
    // 靈性成長路徑分析
    const fuDePalace = palaces.find(p => p.name === '福德宮');
    if (fuDePalace) {
      const hasTianTong = fuDePalace.stars.some(s => s.name === '天同');
      const hasTianLiang = fuDePalace.stars.some(s => s.name === '天梁');
      const hasTaiYin = fuDePalace.stars.some(s => s.name === '太陰');
      
      if (hasTianTong || hasTianLiang) {
        interpretation.spiritualGrowthPath = '慈悲共濟型：透過關懷他人、參與公益活動獲得心靈成長';
      } else if (hasTaiYin) {
        interpretation.spiritualGrowthPath = '內省修行型：透過冥想、藝術、獨處等內在探索獲得靈性提升';
      } else {
        interpretation.spiritualGrowthPath = '實踐體悟型：在日常生活與工作中尋找意義，從經驗中獲得智慧';
      }
    }
    
    // 生命目的分析
    const mingShenRelation = this.analyzeMingShenRelation(palaces, chart.mingPalaceIndex, chart.shenPalaceIndex);
    interpretation.lifePurpose = mingShenRelation;
    
    // 分析關鍵跨宮位模式
    const hasWenChangWenQu = palaces.some(p => p.stars.some(s => s.name === '文昌')) && 
                           palaces.some(p => p.stars.some(s => s.name === '文曲'));
    
    const hasZuoFuYouBi = palaces.some(p => p.stars.some(s => s.name === '左輔')) && 
                         palaces.some(p => p.stars.some(s => s.name === '右弼'));
    
    if (hasWenChangWenQu) {
      interpretation.keyCrossPalacePatterns.push('文昌文曲格：學術與藝術方面有特殊才華，適合從事創意或研究工作');
    }
    
    if (hasZuoFuYouBi) {
      interpretation.keyCrossPalacePatterns.push('左輔右弼格：人際關係良好，易得貴人相助，適合團隊合作與協調工作');
    }
    
    // 添加更多跨宮位模式...
    
    return interpretation;
  }
  
  /**
   * 分析命宮與身宮的關係，推導生命目的
   */
  private analyzeMingShenRelation(palaces: Palace[], mingPalaceIndex: number, shenPalaceIndex: number): string {
    const distance = (shenPalaceIndex - mingPalaceIndex + 12) % 12;
    
    // 根據命身宮的距離判斷生命目的
    switch (distance) {
      case 0: 
        return '自我實現型：人生目的在於發掘與實現自我潛能，建立獨特的人生道路';
      case 1: case 11:
        return '助人利他型：透過服務他人、改善社會找到人生意義，具有奉獻精神';
      case 2: case 10:
        return '創新開拓型：致力於突破既有框架，開創新領域，追求創新與變革';
      case 3: case 9:
        return '智慧探索型：追求知識與智慧，理解世界的真相，傳遞有價值的洞見';
      case 4: case 8:
        return '和諧平衡型：創造和諧的人際關係與環境，追求各方面的平衡與統整';
      case 5: case 7:
        return '成就累積型：專注於建立有形的成就與貢獻，留下具體的人生成果';
      case 6:
        return '精神傳承型：傳承重要的價值觀與精神內涵，連結過去與未來';
      default:
        return '多元發展型：人生目的隨著不同階段而演化，具有多元發展的可能性';
    }
  }
  
  private generatePalaceDetailedInterpretation(palace: Palace): PalaceInterpretation {
    // 基礎宮位解讀資料
    const palaceInterpretationBase: Record<string, Partial<PalaceInterpretation>> = {
      '命宮': {
        personalityTraits: ['自我意識強', '主動積極', '追求自我實現'],
        strengthAreas: ['領導能力', '個人決策', '自我表達'],
        challengeAreas: ['可能過於自我中心', '需要學習傾聽他人'],
        lifeThemes: ['自我成長', '生命方向', '個人特質'],
        advice: ['發揮個人特長', '平衡自我與他人需求']
      },
      '兄弟宮': {
        personalityTraits: ['社交導向', '友善親和', '重視人際連結'],
        strengthAreas: ['建立人脈', '團隊合作', '社交技巧'],
        challengeAreas: ['可能缺乏獨立性', '容易受他人影響'],
        lifeThemes: ['人際關係', '團隊協作', '家族連結'],
        advice: ['培養健康人際關係', '維持適當的人際界限']
      },
      '夫妻宮': {
        personalityTraits: ['重視親密關係', '情感豐富', '追求穩定伴侶'],
        strengthAreas: ['感情表達', '建立親密關係', '維持長久連結'],
        challengeAreas: ['可能過度依賴伴侶', '需要學習獨立'],
        lifeThemes: ['婚姻運勢', '伴侶選擇', '關係品質'],
        advice: ['建立健康的伴侶關係', '保持個人獨立性']
      },
      '子女宮': {
        personalityTraits: ['創意豐富', '喜愛表達', '重視創造力'],
        strengthAreas: ['創新思維', '藝術天賦', '育兒能力'],
        challengeAreas: ['可能過度理想化', '需要更務實'],
        lifeThemes: ['子女緣分', '創造力展現', '個人才華'],
        advice: ['培養創意與實用並重的思維', '關注後代教育']
      },
      '財帛宮': {
        personalityTraits: ['重視物質基礎', '財務意識強', '追求經濟安全'],
        strengthAreas: ['財務規劃', '資源管理', '創造財富'],
        challengeAreas: ['可能過度重視金錢', '需要平衡物質與精神價值'],
        lifeThemes: ['財富累積', '經濟狀況', '理財能力'],
        advice: ['制定合理的財務計劃', '建立多元收入來源']
      },
      '疾厄宮': {
        personalityTraits: ['關注健康', '警覺性高', '追求身心平衡'],
        strengthAreas: ['自我照顧', '壓力管理', '身體覺察'],
        challengeAreas: ['可能過度憂慮健康', '需要保持心理平衡'],
        lifeThemes: ['健康狀況', '疾病預防', '心理韌性'],
        advice: ['建立健康的生活習慣', '定期健康檢查']
      },
      '遷移宮': {
        personalityTraits: ['喜愛變化', '探索精神強', '適應力佳'],
        strengthAreas: ['環境適應', '旅行規劃', '拓展視野'],
        challengeAreas: ['可能缺乏穩定性', '需要建立根基'],
        lifeThemes: ['居住變動', '旅行機會', '環境適應'],
        advice: ['善用變動帶來的機會', '建立穩定的精神家園']
      },
      '交友宮': {
        personalityTraits: ['廣交朋友', '社交活躍', '人脈豐富'],
        strengthAreas: ['建立社交網絡', '友誼維持', '社群參與'],
        challengeAreas: ['可能人際關係過於表面', '需要發展深度連結'],
        lifeThemes: ['朋友緣分', '社交活動', '團體歸屬'],
        advice: ['培養真誠長久的友誼', '參與有意義的社群活動']
      },
      '官祿宮': {
        personalityTraits: ['事業心強', '追求成就', '組織能力佳'],
        strengthAreas: ['職業發展', '目標設定', '專業能力'],
        challengeAreas: ['可能工作過度', '需要平衡事業與生活'],
        lifeThemes: ['職業選擇', '事業發展', '工作成就'],
        advice: ['發展專業技能', '建立職業規劃', '追求工作與生活平衡']
      },
      '田宅宮': {
        personalityTraits: ['安全感需求高', '重視根基', '追求穩定'],
        strengthAreas: ['資產管理', '不動產規劃', '建立家園'],
        challengeAreas: ['可能過度保守', '需要適度冒險'],
        lifeThemes: ['居住環境', '不動產投資', '家庭基礎'],
        advice: ['謹慎規劃不動產投資', '創造舒適安全的居住環境']
      },
      '福德宮': {
        personalityTraits: ['內心豐富', '靈性敏感', '追求幸福'],
        strengthAreas: ['心靈成長', '內在平和', '精神滿足'],
        challengeAreas: ['可能過度理想化', '需要務實面對現實'],
        lifeThemes: ['內在福報', '精神滿足', '晚年生活'],
        advice: ['培養靈性成長', '建立內在平和', '準備豐富的退休生活']
      },
      '父母宮': {
        personalityTraits: ['尊重傳統', '重視長輩', '有責任感'],
        strengthAreas: ['承先啟後', '家族連結', '長幼有序'],
        challengeAreas: ['可能過度傳統', '需要發展獨立思考'],
        lifeThemes: ['父母關係', '上級互動', '傳承責任'],
        advice: ['平衡尊重傳統與創新', '建立健康的親子關係']
      }
    };
    
    // 獲取基礎解讀
    const baseInterpretation = palaceInterpretationBase[palace.name] || {};
    
    // 初始化宮位解讀
    const interpretation: PalaceInterpretation = {
      palaceName: palace.name,
      personalityTraits: [...(baseInterpretation.personalityTraits || [])],
      strengthAreas: [...(baseInterpretation.strengthAreas || [])],
      challengeAreas: [...(baseInterpretation.challengeAreas || [])],
      lifeThemes: [...(baseInterpretation.lifeThemes || [])],
      keyStarInfluences: [],
      advice: [...(baseInterpretation.advice || [])]
    };
    
    // 分析主星影響
    const mainStars = palace.stars.filter(s => s.type === 'main');
    for (const star of mainStars) {
      // 添加星曜影響
      interpretation.keyStarInfluences.push(`${star.name}星：${star.description || '影響此宮位'}`);
      
      // 根據星曜特性調整解讀
      if (star.name === '紫微') {
        interpretation.personalityTraits.push('有領導才能', '重視尊嚴與地位');
        interpretation.strengthAreas.push('組織管理', '權威建立');
      } else if (star.name === '天機') {
        interpretation.personalityTraits.push('思維敏捷', '觀察力強');
        interpretation.strengthAreas.push('分析能力', '策略規劃');
      } else if (star.name === '太陽') {
        interpretation.personalityTraits.push('光明磊落', '樂觀開朗');
        interpretation.strengthAreas.push('人際魅力', '獲得支持');
      } else if (star.name === '武曲') {
        interpretation.personalityTraits.push('意志堅定', '執行力強');
        interpretation.strengthAreas.push('財務管理', '資源調配');
      } else if (star.name === '天同') {
        interpretation.personalityTraits.push('溫和善良', '富有同情心');
        interpretation.strengthAreas.push('人際協調', '獲得援助');
      } else if (star.name === '廉貞') {
        interpretation.personalityTraits.push('正直清廉', '標準要求高');
        interpretation.challengeAreas.push('可能過於理想主義', '與現實有落差');
      }
      // 天府星系解讀
      else if (star.name === '天府') {
        interpretation.personalityTraits.push('穩重踏實', '福氣深厚');
        interpretation.strengthAreas.push('累積資源', '獲得福報');
      } else if (star.name === '太陰') {
        interpretation.personalityTraits.push('情感豐富', '直覺敏銳');
        interpretation.strengthAreas.push('感性思考', '藝術鑑賞');
      } else if (star.name === '貪狼') {
        interpretation.personalityTraits.push('積極進取', '慾望強烈');
        interpretation.challengeAreas.push('需控制慾望', '避免過度追求');
      } else if (star.name === '巨門') {
        interpretation.personalityTraits.push('口才流利', '思維細膩');
        interpretation.challengeAreas.push('可能言過其實', '需注意言語');
      } else if (star.name === '天相') {
        interpretation.personalityTraits.push('善良正直', '樂於助人');
        interpretation.strengthAreas.push('人際和諧', '獲得支持');
      } else if (star.name === '天梁') {
        interpretation.personalityTraits.push('慈悲為懷', '重視和平');
        interpretation.strengthAreas.push('道德操守', '長者風範');
      } else if (star.name === '七殺') {
        interpretation.personalityTraits.push('果斷剛強', '決策力強');
        interpretation.challengeAreas.push('可能過於剛烈', '需學習柔和');
      } else if (star.name === '破軍') {
        interpretation.personalityTraits.push('開創精神強', '不拘一格');
        interpretation.challengeAreas.push('可能缺乏耐心', '需培養穩定性');
      }
    }
    
    // 分析輔星影響
    const auxiliaryStars = palace.stars.filter(s => s.type === 'auxiliary');
    for (const star of auxiliaryStars) {
      // 根據輔星特性調整解讀
      if (star.name === '左輔' || star.name === '右弼') {
        interpretation.keyStarInfluences.push(`${star.name}星：增加支持力量，提供協助`);
        interpretation.strengthAreas.push('獲得貴人相助', '團隊合作');
      } else if (star.name === '文昌' || star.name === '文曲') {
        interpretation.keyStarInfluences.push(`${star.name}星：增加文化藝術才華，提升學習能力`);
        interpretation.strengthAreas.push('學術表現', '文化藝術');
        interpretation.personalityTraits.push('才華洋溢', '追求知識');
      } else if (star.name === '天空' || star.name === '地劫') {
        interpretation.keyStarInfluences.push(`${star.name}星：帶來變數與挑戰，需要更多耐心`);
        interpretation.challengeAreas.push('面對突發狀況', '處理意外變化');
      }
    }
    
    // 分析四化的影響
    const transformationStars = palace.stars.filter(s => s.transformations && s.transformations.length > 0);
    for (const star of transformationStars) {
      if (star.transformations?.includes('祿')) {
        interpretation.keyStarInfluences.push(`${star.name}化祿：提升財富與資源獲取能力`);
        interpretation.strengthAreas.push('財富積累', '資源獲取');
      }
      if (star.transformations?.includes('權')) {
        interpretation.keyStarInfluences.push(`${star.name}化權：增強權力與影響力`);
        interpretation.strengthAreas.push('領導能力', '決策權力');
      }
      if (star.transformations?.includes('科')) {
        interpretation.keyStarInfluences.push(`${star.name}化科：提升學術與考試運`);
        interpretation.strengthAreas.push('學術成就', '考試表現');
      }
      if (star.transformations?.includes('忌')) {
        interpretation.keyStarInfluences.push(`${star.name}化忌：帶來挑戰與阻礙，需謹慎處理`);
        interpretation.challengeAreas.push('克服障礙', '轉化困難');
      }
    }
    
    // 根據宮位吉凶添加特定建議
    if (palace.fortuneType === '吉') {
      interpretation.advice.push('充分發揮此宮位優勢', '把握此領域的發展機會');
    } else if (palace.fortuneType === '凶') {
      interpretation.advice.push('正視此宮位的挑戰', '轉化困難為成長機會', '尋求專業建議');
    } else {
      interpretation.advice.push('平衡發展此領域', '注意調和相關因素');
    }
    
    return interpretation;
  }
}
