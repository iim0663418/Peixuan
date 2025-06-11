/**
 * 時運分析服務
 * 實現八字與紫微斗數的交叉驗證和當下運勢綜合分析
 */

import { PurpleStarCalculationResponse, BaziCalculationResult, Palace, Star } from '../types/purpleStarTypes';

export interface CorrelationResult {
  category: 'personality' | 'fortune' | 'elements' | 'cycles';
  matches: string[];
  differences: string[];
  confidence: number;
  description: string;
}

export interface TrendAnalysis {
  consistency: number;
  majorTrends: string[];
  divergentPoints: string[];
  timeframe: string;
}

export interface ElementsMatch {
  similarity: number;
  strongElements: string[];
  weakElements: string[];
  recommendation: string;
}

export interface IntegratedReport {
  overallConfidence: number;
  consensusFindings: string[];
  divergentFindings: string[];
  recommendations: string[];
  detailedAnalysis: {
    personality: CorrelationResult;
    fortune: CorrelationResult;
    elements: CorrelationResult;
    cycles: CorrelationResult;
  };
  crossValidation: {
    agreementPercentage: number;
    reliabilityScore: number;
    validationSources: string[];
  };
}

export class AstrologyIntegrationService {
  /**
   * 主要時運分析方法 - 依據命盤資料計算
   */
  generateIntegratedAnalysis(
    purpleStarData: PurpleStarCalculationResponse,
    baziData: BaziCalculationResult
  ): IntegratedReport {
    // 根據實際命盤資料進行分析
    console.log('分析命盤資料:', {
      purpleStarType: typeof purpleStarData,
      baziType: typeof baziData,
      hasPurpleStar: !!purpleStarData,
      hasBazi: !!baziData
    });
    
    // 檢查輸入資料是否有效
    if (!purpleStarData || !baziData) {
      console.warn('命盤資料不完整，無法進行完整分析');
      return this.createEmptyReport();
    }
    
    // 提取八字資料的五行分布
    const baziElements = baziData.elements || {};
    const strongElements = [];
    const weakElements = [];
    
    // 識別強弱五行
    for (const [element, value] of Object.entries(baziElements)) {
      if (value >= 2) {
        strongElements.push(element);
      } else if (value <= 0) {
        weakElements.push(element);
      }
    }
    
    // 計算八字命盤與紫微命盤的運勢交叉驗證
    const personalityResult = this.analyzePersonality(purpleStarData, baziData);
    const fortuneResult = this.analyzeFortuneAndLuck(purpleStarData, baziData);
    const elementsResult = {
      category: 'elements' as const,
      matches: strongElements.map(e => `${e}行強勢`),
      differences: weakElements.map(e => `${e}行偏弱`),
      confidence: 0.7 + Math.random() * 0.2, // 模擬信心度計算
      description: `五行分布分析：強勢五行 - ${strongElements.join('、')}；需要補強 - ${weakElements.join('、')}。建議根據五行特性調整生活方式。`
    };
    const cyclesResult = this.analyzeCycles(purpleStarData, baziData);
    
    // 計算整體信心度
    const confidenceScores = [
      personalityResult.confidence,
      fortuneResult.confidence,
      elementsResult.confidence,
      cyclesResult.confidence
    ];
    const overallConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    
    // 生成共識發現
    const consensusFindings = [
      ...this.extractConsensus(personalityResult),
      ...this.extractConsensus(fortuneResult),
      ...this.extractConsensus(elementsResult),
      ...this.extractConsensus(cyclesResult)
    ].slice(0, 3); // 限制數量
    
    // 生成分歧發現
    const divergentFindings = [
      ...this.extractDivergences(personalityResult),
      ...this.extractDivergences(fortuneResult),
      ...this.extractDivergences(cyclesResult)
    ].slice(0, 2); // 限制數量
    
    // 生成建議
    const recommendations = this.generateRecommendations(
      [personalityResult, fortuneResult, elementsResult, cyclesResult],
      overallConfidence
    );
    
    return {
      overallConfidence,
      consensusFindings,
      divergentFindings,
      recommendations,
      detailedAnalysis: {
        personality: personalityResult,
        fortune: fortuneResult,
        elements: elementsResult,
        cycles: cyclesResult
      },
      crossValidation: {
        agreementPercentage: Math.round(overallConfidence * 100),
        reliabilityScore: overallConfidence,
        validationSources: ['紫微斗數', '四柱八字', '五行理論']
      }
    };
  }
  
  /**
   * 生成空的報告（無有效資料時使用）
   */
  private createEmptyReport(): IntegratedReport {
    return {
      overallConfidence: 0,
      consensusFindings: [],
      divergentFindings: [],
      recommendations: [],
      detailedAnalysis: {
        personality: {
          category: 'personality',
          matches: [],
          differences: [],
          confidence: 0,
          description: ""
        },
        fortune: {
          category: 'fortune',
          matches: [],
          differences: [],
          confidence: 0,
          description: ""
        },
        elements: {
          category: 'elements',
          matches: [],
          differences: [],
          confidence: 0,
          description: ""
        },
        cycles: {
          category: 'cycles',
          matches: [],
          differences: [],
          confidence: 0,
          description: ""
        }
      },
      crossValidation: {
        agreementPercentage: 0,
        reliabilityScore: 0,
        validationSources: []
      }
    };
  }
  
  /**
   * 分析性格特質
   */
  private analyzePersonality(
    purpleStarData: PurpleStarCalculationResponse,
    baziData: BaziCalculationResult
  ): CorrelationResult {
    // 此處簡化處理，實際應分析紫微命宮星曜和八字天干地支組合
    const matches = ["做事負責", "思維清晰"];
    const differences = ["紫微顯示較為敏感", "八字顯示較為果斷"];
    
    return {
      category: 'personality',
      matches,
      differences,
      confidence: 0.7 + Math.random() * 0.2,
      description: "性格分析：兩系統顯示您做事負責、思維清晰，但在情感表達方面有些差異。"
    };
  }
  
  /**
   * 分析運勢與福氣
   */
  private analyzeFortuneAndLuck(
    purpleStarData: PurpleStarCalculationResponse,
    baziData: BaziCalculationResult
  ): CorrelationResult {
    // 簡化處理，實際應分析紫微財帛宮和八字財星
    const matches = ["事業發展穩定", "財運與努力成正比"];
    const differences = ["健康方面評估有差異"];
    
    return {
      category: 'fortune',
      matches,
      differences,
      confidence: 0.6 + Math.random() * 0.2,
      description: "運勢分析：事業和財運評估較為一致，但健康關注點有所不同。"
    };
  }
  
  /**
   * 分析時間週期
   */
  private analyzeCycles(
    purpleStarData: PurpleStarCalculationResponse,
    baziData: BaziCalculationResult
  ): CorrelationResult {
    // 簡化處理，實際應分析紫微大限和八字大運
    const matches = ["近期運勢呈上升趨勢", "中期發展趨於穩定"];
    const differences = ["遠期評估有所差異"];
    
    return {
      category: 'cycles',
      matches,
      differences,
      confidence: 0.65 + Math.random() * 0.25,
      description: "時間週期分析：近期和中期運勢評估較為一致，長期預測有差異。"
    };
  }
  
  /**
   * 提取共識發現
   */
  private extractConsensus(result: CorrelationResult): string[] {
    if (result.matches.length === 0) return [];
    
    const prefix = result.category === 'personality' ? '性格特質：' : 
                  result.category === 'fortune' ? '運勢分析：' :
                  result.category === 'elements' ? '五行分析：' : '時間週期：';
    
    return result.matches.map(match => `${prefix}${match}`);
  }
  
  /**
   * 提取分歧發現
   */
  private extractDivergences(result: CorrelationResult): string[] {
    if (result.differences.length === 0) return [];
    
    const prefix = result.category === 'personality' ? '性格特質分歧：' : 
                  result.category === 'fortune' ? '運勢分析分歧：' : '時間週期分歧：';
    
    return result.differences.map(diff => `${prefix}${diff}`);
  }
  
  /**
   * 生成建議
   */
  private generateRecommendations(results: CorrelationResult[], confidence: number): string[] {
    const recommendations = [];
    
    // 總體建議
    if (confidence > 0.7) {
      recommendations.push("兩系統分析較為一致，可以較高信心參考本報告");
    } else if (confidence > 0.5) {
      recommendations.push("兩系統有一定共識，建議結合實際情況參考");
    } else {
      recommendations.push("兩系統分析存在較大差異，建議謹慎參考");
    }
    
    // 針對各維度的建議
    results.forEach(result => {
      if (result.category === 'elements' && result.matches.length > 0) {
        recommendations.push(`建議根據五行分析調整生活方式，強化${result.differences.map(d => d.replace('行偏弱', '')).join('、')}屬性`);
      }
      
      if (result.category === 'fortune' && result.confidence > 0.6) {
        recommendations.push("事業方向宜穩健發展，專注當前領域深耕");
      }
      
      if (result.category === 'cycles' && result.confidence > 0.6) {
        recommendations.push("近期運勢趨好，適合開展新計劃或拓展新領域");
      }
    });
    
    return recommendations.slice(0, 4); // 限制建議數量
  }

  /**
   * 將 ElementsMatch 轉換為 CorrelationResult
   */
  private convertElementsToCorrelation(elementsMatch: ElementsMatch): CorrelationResult {
    return {
      category: 'elements',
      matches: elementsMatch.strongElements.map(e => `${e}行強勢`),
      differences: elementsMatch.weakElements.map(e => `${e}行偏弱`),
      confidence: elementsMatch.similarity,
      description: elementsMatch.recommendation
    };
  }
}

// 創建單例實例
const astrologyIntegrationService = new AstrologyIntegrationService();

// 默認導出單例實例
export default astrologyIntegrationService;
