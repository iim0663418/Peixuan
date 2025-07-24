/**
 * 時運分析API路由
 * 整合八字與紫微斗數的分析功能
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { AstrologyIntegrationService } from '../services/astrologyIntegrationService';
import logger from '../utils/logger';
import { BaziCalculationResult, BirthInfo } from '../types/purpleStarTypes';

const router = Router();
const integrationService = new AstrologyIntegrationService();

/**
 * @swagger
 * components:
 *   schemas:
 *     IntegratedAnalysisRequest:
 *       type: object
 *       required:
 *         - birthDate
 *         - birthTime
 *         - gender
 *       properties:
 *         birthDate:
 *           type: string
 *           format: date
 *           example: '1990-01-01'
 *         birthTime:
 *           type: string
 *           example: '12:30'
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         location:
 *           type: string
 *           example: '台北市'
 *         useSessionCharts:
 *           type: boolean
 *           default: false
 *           description: 是否使用前端 Session 中的命盤資料
 *         baziChart:
 *           type: object
 *           description: 八字命盤資料 (當 useSessionCharts 為 true 時)
 *         purpleStarChart:
 *           type: object
 *           description: 紫微斗數命盤資料 (當 useSessionCharts 為 true 時)
 *         options:
 *           type: object
 *           properties:
 *             useAdvancedAlgorithm:
 *               type: boolean
 *               default: true
 *             includeCrossVerification:
 *               type: boolean
 *               default: true
 *             includeRealTimeData:
 *               type: boolean
 *               default: true
 *             confidenceScoring:
 *               type: boolean
 *               default: true
 *     IntegratedAnalysisResponse:
 *       type: object
 *       properties:
 *         integratedAnalysis:
 *           type: object
 *           properties:
 *             overallConfidence:
 *               type: number
 *               minimum: 0
 *               maximum: 1
 *             consensusFindings:
 *               type: array
 *               items:
 *                 type: string
 *             divergentFindings:
 *               type: array
 *               items:
 *                 type: string
 *             crossValidation:
 *               type: object
 *               properties:
 *                 agreementPercentage:
 *                   type: number
 *                 reliabilityScore:
 *                   type: number
 *         purpleStarChart:
 *           type: object
 *         baziChart:
 *           type: object
 *         analysisInfo:
 *           type: object
 *           properties:
 *             calculationTime:
 *               type: string
 *               format: date-time
 *             methodsUsed:
 *               type: array
 *               items:
 *                 type: string
 *             confidence:
 *               type: number
 *     ConfidenceAssessment:
 *       type: object
 *       properties:
 *         overallConfidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         detailedConfidence:
 *           type: object
 *           properties:
 *             personality:
 *               type: number
 *             fortune:
 *               type: number
 *             elements:
 *               type: number
 *             cycles:
 *               type: number
 *         agreementPercentage:
 *           type: number
 *         reliabilityScore:
 *           type: number
 *         interpretation:
 *           type: string
 */

/**
 * 多術數綜合分析端點
 * POST /api/v1/astrology/integrated-analysis
 */
const integratedAnalysisHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // 檢查是否有請求中包含使用 sessionStorage 中的命盤資料的標識
    const useSessionCharts = req.body.useSessionCharts === true;
    
    // 檢查是否包含前端 session 中的命盤資料
    const baziChartFromSession = req.body.baziChart || null;
    const purpleStarChartFromSession = req.body.purpleStarChart || null;
    
    logger.info('請求使用 session 命盤資料:', { 
      useSessionCharts, 
      hasBaziChart: !!baziChartFromSession, 
      hasPurpleStarChart: !!purpleStarChartFromSession 
    });

    // 簡化的請求驗證
    const { birthDate, birthTime, gender, location, options } = req.body;
    
    if (!birthDate || !birthTime || !gender) {
      res.status(400).json({
        success: false,
        error: '缺少必要的出生資訊',
        required: ['birthDate', 'birthTime', 'gender'],
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 構建 BirthInfo 對象
    const birthInfo: BirthInfo = {
      solarDate: new Date(birthDate + 'T' + birthTime),
      gender: gender as 'male' | 'female',
      location: location || '台北市'
    };
    
    // 使用前端傳遞的 session 資料
    let baziResult = null;
    let purpleStarResult = null;
    
    // 處理分析選項
    const analysisOptions = options || {
      useAdvancedAlgorithm: true,
      includeCrossVerification: true,
      includeRealTimeData: true,
      confidenceScoring: true
    };
    
    logger.info('分析選項:', analysisOptions);
    
    if (useSessionCharts) {
      // 使用前端 session 存儲的命盤資料
      logger.info('使用前端 session 中的命盤資料進行分析');
      
      if (baziChartFromSession) {
        baziResult = baziChartFromSession;
        logger.info('使用前端提供的八字命盤資料');
      } else {
        // 如果沒有提供，生成模擬資料
        logger.info('前端未提供八字命盤，使用模擬資料');
        baziResult = generateMockBaziData(birthInfo);
      }
      
      if (purpleStarChartFromSession) {
        logger.info('使用前端提供的紫微斗數命盤資料');
        // 假設 purpleStarChartFromSession 包含標準格式或可轉換為標準格式
        purpleStarResult = {
          success: true as const,
          data: {
            chart: purpleStarChartFromSession,
            calculationInfo: {
              birthInfo: {
                solarDate: birthDate,
                lunarDate: birthDate, // 簡化處理
                gender: gender,
                location: location
              },
              options: {
                includeMajorCycles: true,
                includeMinorCycles: true,
                includeAnnualCycles: true,
                detailLevel: 'basic' as const,
                maxAge: 100
              }
            }
          },
          timestamp: new Date().toISOString()
        };
      } else {
        // 如果沒有提供，生成模擬資料
        logger.info('前端未提供紫微斗數命盤，使用模擬資料');
        const purpleStarChart = {
          palaces: [],
          mingPalaceIndex: 0,
          shenPalaceIndex: 6,
          fiveElementsBureau: '未知局'
        };
        
        purpleStarResult = {
          success: true as const,
          data: {
            chart: purpleStarChart,
            calculationInfo: {
              birthInfo: {
                solarDate: birthDate,
                lunarDate: birthDate, // 簡化處理
                gender: gender,
                location: location
              },
              options: {
                includeMajorCycles: true,
                includeMinorCycles: true,
                includeAnnualCycles: true,
                detailLevel: 'basic' as const,
                maxAge: 100
              }
            }
          },
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // 常規計算流程，不使用 session 中的命盤資料
      logger.info('進行新的命盤計算');
      
      // 計算紫微斗數（暫時禁用，需要農曆資訊）
      logger.info('暫時跳過紫微斗數計算，因為需要農曆資訊');
      const purpleStarChart = {
        palaces: [],
        mingPalaceIndex: 0,
        shenPalaceIndex: 6,
        fiveElementsBureau: '未知局'
      };

      // 計算八字（簡化版本）
      logger.info('開始八字計算', { birthInfo });
      baziResult = generateMockBaziData(birthInfo);

      // 包裝紫微斗數結果為標準格式
      purpleStarResult = {
        success: true as const,
        data: {
          chart: purpleStarChart,
          calculationInfo: {
            birthInfo: {
              solarDate: birthDate,
              lunarDate: birthDate, // 簡化處理
              gender: gender,
              location: location
            },
            options: {
              includeMajorCycles: true,
              includeMinorCycles: true,
              includeAnnualCycles: true,
              detailLevel: 'basic' as const,
              maxAge: 100
            }
          }
        },
        timestamp: new Date().toISOString()
      };
    }

    // 執行交互驗證分析
    logger.info('開始多術數交互驗證分析');
    const integratedAnalysis = integrationService.generateIntegratedAnalysis(
      purpleStarResult,
      baziResult
    );

    // 構建最終響應
    const response = {
      success: true,
      data: {
        integratedAnalysis,
        purpleStarChart: purpleStarResult.data.chart,
        baziChart: baziResult,
        analysisInfo: {
          calculationTime: new Date().toISOString(),
          methodsUsed: ['紫微斗數', '四柱八字', '交互驗證'],
          confidence: integratedAnalysis.overallConfidence
        }
      },
      meta: {
        features: ['integrated-analysis', 'cross-validation', 'confidence-scoring'],
        sources: integratedAnalysis.crossValidation.validationSources
      },
      timestamp: new Date().toISOString()
    };

    logger.info('多術數綜合分析完成', { 
      confidence: integratedAnalysis.overallConfidence,
      agreementPercentage: integratedAnalysis.crossValidation.agreementPercentage
    });

    res.json(response);
    return;

  } catch (error: any) {
    logger.error('多術數綜合分析失敗', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: '綜合分析服務暫時不可用',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
    return;
  }
};

/**
 * @swagger
 * /api/v1/astrology/integrated-analysis:
 *   post:
 *     summary: 多術數綜合分析
 *     description: 整合八字與紫微斗數進行交叉驗證分析
 *     tags: [Astrology Integration]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IntegratedAnalysisRequest'
 *     responses:
 *       200:
 *         description: 綜合分析成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/IntegratedAnalysisResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         description: 綜合分析服務不可用
 */
router.post('/integrated-analysis', integratedAnalysisHandler);

/**
 * 信心度評估端點
 * POST /api/v1/astrology/confidence-assessment
 */
const confidenceAssessmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { birthDate, birthTime, gender, location } = req.body;
    
    if (!birthDate || !birthTime || !gender) {
      res.status(400).json({
        success: false,
        error: '缺少必要的出生資訊',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 構建 BirthInfo 對象
    const birthInfo: BirthInfo = {
      solarDate: new Date(birthDate + 'T' + birthTime),
      gender: gender as 'male' | 'female',
      location: location || '台北市'
    };

    // 計算兩套系統的結果（暫時使用模擬資料，因為需要農曆資訊）
    const purpleStarChart = {
      palaces: [],
      mingPalaceIndex: 0,
      shenPalaceIndex: 6,
      fiveElementsBureau: '未知局'
    };
    const baziResult = generateMockBaziData(birthInfo);
    
    // 包裝結果
    const purpleStarResult = {
      success: true as const,
      data: {
        chart: purpleStarChart,
        calculationInfo: {
          birthInfo: {
            solarDate: birthDate,
            lunarDate: birthDate,
            gender: gender,
            location: location
          },
          options: {
            includeMajorCycles: true,
            includeMinorCycles: true,
            includeAnnualCycles: true,
            detailLevel: 'basic' as const,
            maxAge: 100
          }
        }
      },
      timestamp: new Date().toISOString()
    };

    // 生成信心度評估
    const integratedAnalysis = integrationService.generateIntegratedAnalysis(
      purpleStarResult,
      baziResult
    );

    const confidenceAssessment = {
      overallConfidence: integratedAnalysis.overallConfidence,
      detailedConfidence: {
        personality: integratedAnalysis.detailedAnalysis.personality.confidence,
        fortune: integratedAnalysis.detailedAnalysis.fortune.confidence,
        elements: integratedAnalysis.detailedAnalysis.elements.confidence,
        cycles: integratedAnalysis.detailedAnalysis.cycles.confidence
      },
      agreementPercentage: integratedAnalysis.crossValidation.agreementPercentage,
      reliabilityScore: integratedAnalysis.crossValidation.reliabilityScore,
      consensusFindings: integratedAnalysis.consensusFindings,
      divergentFindings: integratedAnalysis.divergentFindings,
      interpretation: generateConfidenceInterpretation(integratedAnalysis.overallConfidence)
    };

    res.json({
      success: true,
      data: confidenceAssessment,
      timestamp: new Date().toISOString()
    });
    return;

  } catch (error: any) {
    logger.error('信心度評估失敗', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: '信心度評估服務暫時不可用',
      timestamp: new Date().toISOString()
    });
    return;
  }
};

/**
 * @swagger
 * /api/v1/astrology/confidence-assessment:
 *   post:
 *     summary: 分析結果信心度評估
 *     description: 評估多術數分析結果的一致性和可信度
 *     tags: [Astrology Integration]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BirthInfo'
 *     responses:
 *       200:
 *         description: 信心度評估成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfidenceAssessment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: 信心度評估服務不可用
 */
router.post('/confidence-assessment', confidenceAssessmentHandler);

/**
 * @swagger
 * /api/v1/astrology/health:
 *   get:
 *     summary: 命理整合服務健康檢查
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: 服務正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 service:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'astrology-integration',
    timestamp: new Date().toISOString(),
    features: ['integrated-analysis', 'confidence-assessment']
  });
  return;
});

// ===== 輔助函數 =====

/**
 * 生成模擬八字資料
 */
function generateMockBaziData(birthInfo: BirthInfo): BaziCalculationResult {
  const birthDate = birthInfo.solarDate;
  const year = birthDate.getFullYear();
  
  return {
    pillars: {
      year: { gan: '甲', zhi: '子' },
      month: { gan: '乙', zhi: '丑' },
      day: { gan: '丙', zhi: '寅' },
      hour: { gan: '丁', zhi: '卯' }
    },
    elements: {
      木: 2,
      火: 1,
      土: 2,
      金: 1,
      水: 1
    },
    tenGods: [
      { pillar: 'year' as const, position: 'gan' as const, god: '正官', element: '木' },
      { pillar: 'month' as const, position: 'gan' as const, god: '偏財', element: '木' },
      { pillar: 'day' as const, position: 'gan' as const, god: '比肩', element: '火' },
      { pillar: 'hour' as const, position: 'gan' as const, god: '食神', element: '火' }
    ],
    luck: {
      startAge: 8,
      startYear: year + 8,
      direction: birthInfo.gender === 'male' ? 'forward' : 'backward'
    }
  };
}

/**
 * 生成信心度解釋
 */
function generateConfidenceInterpretation(confidence: number): string {
  if (confidence >= 0.8) {
    return '兩套系統分析結果高度一致，分析結果具有很高的可信度。建議重點參考一致性結論。';
  } else if (confidence >= 0.6) {
    return '兩套系統分析結果有良好的一致性，分析結果具有較高的可信度。建議綜合考慮兩套系統的建議。';
  } else if (confidence >= 0.4) {
    return '兩套系統分析結果存在一定差異，建議謹慎參考並結合個人實際情況判斷。';
  } else {
    return '兩套系統分析結果差異較大，建議尋求專業命理師的詳細解讀。';
  }
}

export default router;