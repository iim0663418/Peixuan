// backend-node/src/services/starPlacementService.ts
// 紫微斗數星體定位演算法

import { Palace, Star, LunarInfo } from '../types/purpleStarTypes';

/**
 * 星體定位服務
 * 負責處理紫微斗數命盤中星體的定位計算
 */
export class StarPlacementService {
  // 地支名稱常量
  private readonly ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 宮位名稱順序常量
  private readonly PALACE_NAMES_ORDERED = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
    '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
  ];
  
  // 紫微星系常量
  private readonly ZIWEI_STAR_SYSTEM = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
  
  // 天府星系常量
  private readonly TIANFU_STAR_SYSTEM = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
  
  // 輔星系統常量
  private readonly AUXILIARY_STARS = {
    // 六吉星
    AUSPICIOUS: ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞'],
    
    // 六煞星
    INAUSPICIOUS: ['擎羊', '陀羅', '地空', '地劫', '火星', '鈴星'],
    
    // 其他輔星
    OTHERS: ['祿存', '天馬', '化祿', '化權', '化科', '化忌', '天空', '台輔']
  };
  
  /**
   * 計算宮位
   * @param mingPalaceStdIndex 命宮標準索引
   * @returns 宮位數組
   */
  public calculatePalaces(mingPalaceStdIndex: number): Palace[] {
    const palaces: Palace[] = [];
    
    for (let i = 0; i < 12; i++) {
      const currentPalaceStdZhiIndex = (mingPalaceStdIndex - i + 12) % 12;
      palaces.push({
        name: this.PALACE_NAMES_ORDERED[i],
        index: currentPalaceStdZhiIndex,
        stars: [],
        zhi: this.ZHI_NAMES[currentPalaceStdZhiIndex]
      });
    }
    
    return palaces;
  }
  
  /**
   * 定位紫微星系
   * @param palaces 宮位數組
   * @param ziweiPalaceStdIndex 紫微星所在宮位的標準索引
   * @returns 所有主星數組
   */
  public locateZiweiStarSystem(palaces: Palace[], ziweiPalaceStdIndex: number): Star[] {
    const ziweiSystemStars: Star[] = [];
    
    // 紫微星系偏移量
    const ziweiSystemOffsets = [0, -1, -3, -4, -5, -8];
    
    // 逐一放置紫微星系中的星體
    for (let i = 0; i < this.ZIWEI_STAR_SYSTEM.length; i++) {
      const starName = this.ZIWEI_STAR_SYSTEM[i];
      const palaceIndex = (ziweiPalaceStdIndex + ziweiSystemOffsets[i] + 12) % 12;
      ziweiSystemStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    return ziweiSystemStars;
  }
  
  /**
   * 定位天府星系
   * @param palaces 宮位數組
   * @param ziweiPalaceStdIndex 紫微星所在宮位的標準索引
   * @returns 所有天府星系星體數組
   */
  public locateTianfuStarSystem(palaces: Palace[], ziweiPalaceStdIndex: number): Star[] {
    const tianfuSystemStars: Star[] = [];
    
    // 天府位置映射表
    const tianfuLocationMap: Record<number, number> = {
      [2]: 2, [8]: 8, [1]: 3, [3]: 1, [0]: 4, [4]: 0,
      [11]: 5, [5]: 11, [10]: 6, [6]: 10, [9]: 7, [7]: 9
    };
    
    // 確定天府星的位置
    const tianfuPalaceStdIndex = tianfuLocationMap[ziweiPalaceStdIndex];
    if (tianfuPalaceStdIndex === undefined) {
      throw new Error("無法定位天府星");
    }
    
    // 天府星系偏移量
    const tianfuSystemOffsets = [0, 1, 2, 3, 4, 5, 6, 10];
    
    // 逐一放置天府星系中的星體
    for (let i = 0; i < this.TIANFU_STAR_SYSTEM.length; i++) {
      const starName = this.TIANFU_STAR_SYSTEM[i];
      const palaceIndex = (tianfuPalaceStdIndex + tianfuSystemOffsets[i]) % 12;
      tianfuSystemStars.push(this.placeStar(palaces, starName, 'main', palaceIndex));
    }
    
    return tianfuSystemStars;
  }
  
  /**
   * 計算輔星位置
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @returns 所有輔星數組
   */
  public calculateAuxiliaryStars(palaces: Palace[], lunarInfo: LunarInfo): Star[] {
    const auxiliaryStars: Star[] = [];
    const lunarMonth = lunarInfo.month;
    const chineseHourZhiIndex = this.ZHI_NAMES.indexOf(lunarInfo.timeZhi);
    
    if (chineseHourZhiIndex === -1) {
      throw new Error(`無法識別的時辰支: ${lunarInfo.timeZhi}`);
    }
    
    // 定位左輔：正月起辰宮，順行數至生月安左輔
    const CHEN_PALACE_STD_INDEX = 4; // 辰宮索引
    const zuoFuPalaceIndex = (CHEN_PALACE_STD_INDEX + (lunarMonth - 1)) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '左輔', 'auxiliary', zuoFuPalaceIndex));
    
    // 定位右弼：正月起戌宮，逆行數至生月安右弼
    const XU_PALACE_STD_INDEX = 10; // 戌宮索引
    const youBiPalaceIndex = (XU_PALACE_STD_INDEX - (lunarMonth - 1) + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '右弼', 'auxiliary', youBiPalaceIndex));
    
    // 定位文昌：子時戌上起文昌，逆行至生時安
    // 將時辰轉換為從子時開始的相對索引
    const ZI_TIME_INDEX = 0; // 子時索引
    const timeIndexFromZi = (chineseHourZhiIndex - ZI_TIME_INDEX + 12) % 12;
    const wenChangPalaceIndex = (XU_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文昌', 'auxiliary', wenChangPalaceIndex));
    
    // 定位文曲：辰上起，順行至生時安
    const wenQuPalaceIndex = (CHEN_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '文曲', 'auxiliary', wenQuPalaceIndex));
    
    // 定位天空：亥宮起子時安天空，逆行排時
    const HAI_PALACE_STD_INDEX = 11; // 亥宮索引
    const tianKongPalaceIndex = (HAI_PALACE_STD_INDEX - timeIndexFromZi + 12) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '天空', 'auxiliary', tianKongPalaceIndex));
    
    // 定位地劫：亥宮起子時安地劫，順行排時
    const diJiePalaceIndex = (HAI_PALACE_STD_INDEX + timeIndexFromZi) % 12;
    auxiliaryStars.push(this.placeStar(palaces, '地劫', 'auxiliary', diJiePalaceIndex));
    
    // 計算其他輔星（可擴展）
    this.calculateAdditionalAuxiliaryStars(palaces, lunarInfo, auxiliaryStars);
    
    return auxiliaryStars;
  }
  
  /**
   * 計算其他輔星位置
   * 可以擴展更多輔星的計算
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @param auxiliaryStars 現有輔星數組
   */
  private calculateAdditionalAuxiliaryStars(
    palaces: Palace[],
    lunarInfo: LunarInfo,
    auxiliaryStars: Star[]
  ): void {
    // 天魁、天鉞計算
    this.calculateTianKuiTianYue(palaces, lunarInfo, auxiliaryStars);
    
    // 祿存計算
    this.calculateLuCun(palaces, lunarInfo, auxiliaryStars);
    
    // 火星、鈴星計算
    this.calculateHuoXingLingXing(palaces, lunarInfo, auxiliaryStars);
    
    // 擎羊、陀羅計算
    this.calculateQingYangTuoLuo(palaces, lunarInfo, auxiliaryStars);
  }
  
  /**
   * 計算天魁、天鉞位置
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @param auxiliaryStars 輔星數組
   */
  private calculateTianKuiTianYue(
    palaces: Palace[],
    lunarInfo: LunarInfo,
    auxiliaryStars: Star[]
  ): void {
    const yearGan = lunarInfo.yearGan;
    let tianKuiPalaceIndex: number;
    let tianYuePalaceIndex: number;
    
    // 天魁天鉞安星口訣：甲戊庚牛羊，乙己鼠猴鄉，丙丁豬雞位，壬癸兔蛇藏，六辛逢虎馬
    switch (yearGan) {
      case '甲':
      case '戊':
      case '庚':
        tianKuiPalaceIndex = this.ZHI_NAMES.indexOf('丑'); // 牛
        tianYuePalaceIndex = this.ZHI_NAMES.indexOf('未'); // 羊
        break;
      case '乙':
      case '己':
        tianKuiPalaceIndex = this.ZHI_NAMES.indexOf('子'); // 鼠
        tianYuePalaceIndex = this.ZHI_NAMES.indexOf('申'); // 猴
        break;
      case '丙':
      case '丁':
        tianKuiPalaceIndex = this.ZHI_NAMES.indexOf('亥'); // 豬
        tianYuePalaceIndex = this.ZHI_NAMES.indexOf('酉'); // 雞
        break;
      case '壬':
      case '癸':
        tianKuiPalaceIndex = this.ZHI_NAMES.indexOf('卯'); // 兔
        tianYuePalaceIndex = this.ZHI_NAMES.indexOf('巳'); // 蛇
        break;
      case '辛':
        tianKuiPalaceIndex = this.ZHI_NAMES.indexOf('寅'); // 虎
        tianYuePalaceIndex = this.ZHI_NAMES.indexOf('午'); // 馬
        break;
      default:
        throw new Error(`無法識別的年干: ${yearGan}`);
    }
    
    auxiliaryStars.push(this.placeStar(palaces, '天魁', 'auxiliary', tianKuiPalaceIndex));
    auxiliaryStars.push(this.placeStar(palaces, '天鉞', 'auxiliary', tianYuePalaceIndex));
  }
  
  /**
   * 計算祿存位置
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @param auxiliaryStars 輔星數組
   */
  private calculateLuCun(
    palaces: Palace[],
    lunarInfo: LunarInfo,
    auxiliaryStars: Star[]
  ): void {
    const yearGan = lunarInfo.yearGan;
    let luCunPalaceIndex: number;
    
    // 祿存安星口訣：甲寅戊午丙戌，乙卯已未丁亥，庚申壬子辛酉，癸亥
    switch (yearGan) {
      case '甲': luCunPalaceIndex = this.ZHI_NAMES.indexOf('寅'); break;
      case '戊': luCunPalaceIndex = this.ZHI_NAMES.indexOf('午'); break;
      case '丙': luCunPalaceIndex = this.ZHI_NAMES.indexOf('戌'); break;
      case '乙': luCunPalaceIndex = this.ZHI_NAMES.indexOf('卯'); break;
      case '己': luCunPalaceIndex = this.ZHI_NAMES.indexOf('未'); break;
      case '丁': luCunPalaceIndex = this.ZHI_NAMES.indexOf('亥'); break;
      case '庚': luCunPalaceIndex = this.ZHI_NAMES.indexOf('申'); break;
      case '壬': luCunPalaceIndex = this.ZHI_NAMES.indexOf('子'); break;
      case '辛': luCunPalaceIndex = this.ZHI_NAMES.indexOf('酉'); break;
      case '癸': luCunPalaceIndex = this.ZHI_NAMES.indexOf('亥'); break;
      default:
        throw new Error(`無法識別的年干: ${yearGan}`);
    }
    
    auxiliaryStars.push(this.placeStar(palaces, '祿存', 'auxiliary', luCunPalaceIndex));
  }
  
  /**
   * 計算火星、鈴星位置
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @param auxiliaryStars 輔星數組
   */
  private calculateHuoXingLingXing(
    palaces: Palace[],
    lunarInfo: LunarInfo,
    auxiliaryStars: Star[]
  ): void {
    const timeZhi = lunarInfo.timeZhi;
    let huoXingPalaceIndex: number;
    let lingXingPalaceIndex: number;
    
    // 火星安星口訣：寅午戌三合火星見，申子辰只午未，亥卯未是寅申，巳酉丑是亥子
    switch (timeZhi) {
      case '寅':
      case '午':
      case '戌':
        huoXingPalaceIndex = this.ZHI_NAMES.indexOf('寅');
        break;
      case '申':
      case '子':
      case '辰':
        huoXingPalaceIndex = this.ZHI_NAMES.indexOf('午');
        break;
      case '亥':
      case '卯':
      case '未':
        huoXingPalaceIndex = this.ZHI_NAMES.indexOf('申');
        break;
      case '巳':
      case '酉':
      case '丑':
        huoXingPalaceIndex = this.ZHI_NAMES.indexOf('子');
        break;
      default:
        throw new Error(`無法識別的時支: ${timeZhi}`);
    }
    
    // 鈴星安星口訣：寅午戌三合鈴星酉，申子辰見卯，亥卯未見巳，巳酉丑見午
    switch (timeZhi) {
      case '寅':
      case '午':
      case '戌':
        lingXingPalaceIndex = this.ZHI_NAMES.indexOf('酉');
        break;
      case '申':
      case '子':
      case '辰':
        lingXingPalaceIndex = this.ZHI_NAMES.indexOf('卯');
        break;
      case '亥':
      case '卯':
      case '未':
        lingXingPalaceIndex = this.ZHI_NAMES.indexOf('巳');
        break;
      case '巳':
      case '酉':
      case '丑':
        lingXingPalaceIndex = this.ZHI_NAMES.indexOf('午');
        break;
      default:
        throw new Error(`無法識別的時支: ${timeZhi}`);
    }
    
    auxiliaryStars.push(this.placeStar(palaces, '火星', 'auxiliary', huoXingPalaceIndex));
    auxiliaryStars.push(this.placeStar(palaces, '鈴星', 'auxiliary', lingXingPalaceIndex));
  }
  
  /**
   * 計算擎羊、陀羅位置
   * @param palaces 宮位數組
   * @param lunarInfo 農曆資訊
   * @param auxiliaryStars 輔星數組
   */
  private calculateQingYangTuoLuo(
    palaces: Palace[],
    lunarInfo: LunarInfo,
    auxiliaryStars: Star[]
  ): void {
    const yearGan = lunarInfo.yearGan;
    let qingYangPalaceIndex: number;
    let tuoLuoPalaceIndex: number;
    
    // 擎羊陀羅安星口訣：甲羊乙陀順布三，丙羊丁陀戌上攢，戊羊己陀辰上親，庚羊辛陀寅上辨，壬羊癸陀申上觀
    switch (yearGan) {
      case '甲':
        qingYangPalaceIndex = this.ZHI_NAMES.indexOf('未');
        tuoLuoPalaceIndex = (qingYangPalaceIndex + 1) % 12;
        break;
      case '乙':
        tuoLuoPalaceIndex = this.ZHI_NAMES.indexOf('未');
        qingYangPalaceIndex = (tuoLuoPalaceIndex + 1) % 12;
        break;
      case '丙':
        qingYangPalaceIndex = this.ZHI_NAMES.indexOf('戌');
        tuoLuoPalaceIndex = (qingYangPalaceIndex + 1) % 12;
        break;
      case '丁':
        tuoLuoPalaceIndex = this.ZHI_NAMES.indexOf('戌');
        qingYangPalaceIndex = (tuoLuoPalaceIndex + 1) % 12;
        break;
      case '戊':
        qingYangPalaceIndex = this.ZHI_NAMES.indexOf('辰');
        tuoLuoPalaceIndex = (qingYangPalaceIndex + 1) % 12;
        break;
      case '己':
        tuoLuoPalaceIndex = this.ZHI_NAMES.indexOf('辰');
        qingYangPalaceIndex = (tuoLuoPalaceIndex + 1) % 12;
        break;
      case '庚':
        qingYangPalaceIndex = this.ZHI_NAMES.indexOf('寅');
        tuoLuoPalaceIndex = (qingYangPalaceIndex + 1) % 12;
        break;
      case '辛':
        tuoLuoPalaceIndex = this.ZHI_NAMES.indexOf('寅');
        qingYangPalaceIndex = (tuoLuoPalaceIndex + 1) % 12;
        break;
      case '壬':
        qingYangPalaceIndex = this.ZHI_NAMES.indexOf('申');
        tuoLuoPalaceIndex = (qingYangPalaceIndex + 1) % 12;
        break;
      case '癸':
        tuoLuoPalaceIndex = this.ZHI_NAMES.indexOf('申');
        qingYangPalaceIndex = (tuoLuoPalaceIndex + 1) % 12;
        break;
      default:
        throw new Error(`無法識別的年干: ${yearGan}`);
    }
    
    auxiliaryStars.push(this.placeStar(palaces, '擎羊', 'auxiliary', qingYangPalaceIndex));
    auxiliaryStars.push(this.placeStar(palaces, '陀羅', 'auxiliary', tuoLuoPalaceIndex));
  }
  
  /**
   * 安置星曜於宮位
   * @param palaces 宮位數組
   * @param starName 星曜名稱
   * @param starType 星曜類型
   * @param palaceIndex 宮位索引
   * @returns 星曜物件
   */
  private placeStar(palaces: Palace[], starName: string, starType: 'main' | 'auxiliary' | 'minor', palaceIndex: number): Star {
    const star: Star = {
      name: starName,
      type: starType,
      palaceIndex,
      transformations: []
    };
    
    const palace = palaces.find(p => p.index === palaceIndex);
    if (palace) {
      palace.stars.push(star);
    } else {
      console.error(`無法找到地支索引為 ${palaceIndex} 的宮位來安放 ${starName} 星`);
    }
    
    return star;
  }
  
  /**
   * 計算星體之間的相互關係
   * @param palaces 宮位數組
   * @returns 星體關係數組
   */
  public calculateStarRelationships(palaces: Palace[]): Array<{
    starName1: string;
    starName2: string;
    relationship: '合' | '沖' | '剋' | '生';
    strength: number;
  }> {
    const relationships: Array<{
      starName1: string;
      starName2: string;
      relationship: '合' | '沖' | '剋' | '生';
      strength: number;
    }> = [];
    
    // 遍歷所有宮位
    for (let i = 0; i < palaces.length; i++) {
      const palace1 = palaces[i];
      
      // 對宮（相對180度）的關係
      const oppositePalaceIndex = (palace1.index + 6) % 12;
      const oppositePalace = palaces.find(p => p.index === oppositePalaceIndex);
      
      if (oppositePalace) {
        // 檢查兩個宮位中的星體相互關係
        for (const star1 of palace1.stars) {
          for (const star2 of oppositePalace.stars) {
            // 主星之間的關係
            if (star1.type === 'main' && star2.type === 'main') {
              relationships.push({
                starName1: star1.name,
                starName2: star2.name,
                relationship: '沖',
                strength: 5 // 星曜相沖的強度
              });
            }
          }
        }
      }
      
      // 三合（相隔120度）的關係
      const threeHarmonyIndexes = [
        (palace1.index + 4) % 12,
        (palace1.index + 8) % 12
      ];
      
      for (const harmonyIndex of threeHarmonyIndexes) {
        const harmonyPalace = palaces.find(p => p.index === harmonyIndex);
        
        if (harmonyPalace) {
          // 檢查兩個宮位中的星體相互關係
          for (const star1 of palace1.stars) {
            for (const star2 of harmonyPalace.stars) {
              // 主星之間的關係
              if (star1.type === 'main' && star2.type === 'main') {
                relationships.push({
                  starName1: star1.name,
                  starName2: star2.name,
                  relationship: '合',
                  strength: 3 // 星曜相合的強度
                });
              }
            }
          }
        }
      }
    }
    
    return relationships;
  }
}
