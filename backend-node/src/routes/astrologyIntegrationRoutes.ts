/**
 * 時運分析API路由
 * 整合八字與紫微斗數的分析功能
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PurpleStarCalculationService } from '../services/purpleStarCalculationService';
import { AstrologyIntegrationService } from '../services/astrologyIntegrationService';
import LayeredResponseBuilder from '../services/layeredResponseService';
import { validateToken, TokenPayload } from '../middleware/auth';
import logger from '../utils/logger';
import { BaziCalculationResult, BirthInfo } from '../types/purpleStarTypes';

// 擴展 Request 接口以包含 user 屬性
interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const router = Router();
const integrationService = new AstrologyIntegrationService();

/**
 * 多術數綜合分析端點
 * POST /api/v1/astrology/integrated-analysis
 */
router.post('/integrated-analysis', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. 暫時跳過認證檢查 (開發階段)
    // 設置預設用戶資訊用於開發測試
    req.user = {
      userId: 'dev-user-001',
      role: 'member', // 給予會員權限以便測試整合分析功能
      features: ['integrated-analysis', 'cross-validation', 'confidence-scoring'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1小時後過期
    };

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

    // 舊的認證邏輯（暫時註釋）
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET ?? 'development_secret';
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      req.user = decoded;
    } catch (error: any) {
      res.status(401).json({ error: 'Invalid or expired token', details: error.message });
      return;
    }
    */

      // 2. 簡化的請求驗證
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
        logger.info('使用前端提供的八字命盤數據');
      } else {
        // 如果沒有提供，生成模擬數據
        logger.info('前端未提供八字命盤，使用模擬數據');
        baziResult = generateMockBaziData(birthInfo);
      }
      
      if (purpleStarChartFromSession) {
        logger.info('使用前端提供的紫微斗數命盤數據');
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
        // 如果沒有提供，生成模擬數據
        logger.info('前端未提供紫微斗數命盤，使用模擬數據');
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

    // 5. 執行交互驗證分析
    logger.info('開始多術數交互驗證分析');
    const integratedAnalysis = integrationService.generateIntegratedAnalysis(
      purpleStarResult,
      baziResult
    );

    // 6. 應用分層響應
    const userRole = req.user?.role || 'anonymous';
    const requestedLayer = (req.query.layer as string) || 'basic';
    
    // 根據用戶角色檢查功能權限
    const hasIntegratedAccess = await checkIntegratedAnalysisAccess(userRole);
    if (!hasIntegratedAccess) {
      res.status(403).json({
        success: false,
        error: '綜合分析功能需要會員權限',
        availableFeatures: ['基礎紫微斗數分析', '基礎八字分析'],
        upgradeInfo: {
          message: '升級至會員即可享受多術數交互驗證功能',
          benefits: ['八字與紫微斗數交叉驗證', '信心度評分', '綜合建議']
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 7. 構建最終響應
    const response = {
      success: true,
      data: {
        integratedAnalysis,
        purpleStarChart: purpleStarResult.data.chart,
        baziChart: baziResult,
        analysisInfo: {
          calculationTime: new Date().toISOString(),
          methodsUsed: ['紫微斗數', '四柱八字', '交互驗證'],
          confidence: integratedAnalysis.overallConfidence,
          layer: requestedLayer
        }
      },
      meta: {
        layer: requestedLayer,
        userRole,
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

  } catch (error: any) {
    logger.error('多術數綜合分析失敗', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: '綜合分析服務暫時不可用',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 信心度評估端點
 * POST /api/v1/astrology/confidence-assessment
 */
router.post('/confidence-assessment', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. 暫時跳過認證檢查 (開發階段)
    // 設置預設用戶資訊用於開發測試
    req.user = {
      userId: 'dev-user-001',
      role: 'member', // 給予會員權限以便測試信心度評估功能
      features: ['integrated-analysis', 'cross-validation', 'confidence-scoring'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1小時後過期
    };

    // 舊的認證邏輯（暫時註釋）
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET ?? 'development_secret';
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      req.user = decoded;
    } catch (error: any) {
      res.status(401).json({ error: 'Invalid or expired token', details: error.message });
      return;
    }
    */

    // 需要會員權限
    if (req.user?.role === 'anonymous') {
      res.status(403).json({
        success: false,
        error: '信心度評估需要會員權限',
        timestamp: new Date().toISOString()
      });
      return;
    }

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

    // 計算兩套系統的結果（暫時使用模擬數據，因為需要農曆資訊）
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

  } catch (error: any) {
    logger.error('信心度評估失敗', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: '信心度評估服務暫時不可用',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 健康檢查端點
 */
router.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'astrology-integration',
    timestamp: new Date().toISOString(),
    features: ['integrated-analysis', 'layered-response', 'confidence-assessment']
  });
});

// ===== 輔助函數 =====

/**
 * 生成模擬八字數據
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
 * 檢查綜合分析功能權限
 */
async function checkIntegratedAnalysisAccess(userRole: string): Promise<boolean> {
  // 匿名用戶無法使用綜合分析功能
  if (userRole === 'anonymous') {
    return false;
  }
  
  // 會員及以上可以使用
  return ['member', 'vip', 'admin'].includes(userRole);
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
