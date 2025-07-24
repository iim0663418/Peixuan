import express, { Request, Response, Router, RequestHandler } from 'express';
import { RequestValidator } from '../utils/validation'; 
import logger from '../utils/logger';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BaziRequest:
 *       type: object
 *       required:
 *         - birthDate
 *         - birthTime
 *         - gender
 *         - location
 *       properties:
 *         birthDate:
 *           type: string
 *           format: date
 *           example: '1990-01-01'
 *         birthTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: '12:30'
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         location:
 *           type: string
 *           example: '台北市'
 *     BaziChart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fourPillars:
 *           type: object
 *           properties:
 *             year:
 *               $ref: '#/components/schemas/Pillar'
 *             month:
 *               $ref: '#/components/schemas/Pillar'
 *             day:
 *               $ref: '#/components/schemas/Pillar'
 *             hour:
 *               $ref: '#/components/schemas/Pillar'
 *         elements:
 *           $ref: '#/components/schemas/ElementCount'
 *         dayMaster:
 *           $ref: '#/components/schemas/DayMaster'
 *         analysis:
 *           $ref: '#/components/schemas/BaziAnalysis'
 *     Pillar:
 *       type: object
 *       properties:
 *         heavenlyStem:
 *           type: string
 *         earthlyBranch:
 *           type: string
 *         element:
 *           type: string
 *         yinYang:
 *           type: string
 *     ElementCount:
 *       type: object
 *       properties:
 *         wood:
 *           type: integer
 *         fire:
 *           type: integer
 *         earth:
 *           type: integer
 *         metal:
 *           type: integer
 *         water:
 *           type: integer
 *     DayMaster:
 *       type: object
 *       properties:
 *         element:
 *           type: string
 *         strength:
 *           type: string
 *           enum: [strong, weak, balanced]
 *         characteristics:
 *           type: array
 *           items:
 *             type: string
 *     BaziAnalysis:
 *       type: object
 *       properties:
 *         personality:
 *           type: string
 *         career:
 *           type: string
 *         health:
 *           type: string
 *         relationships:
 *           type: string
 */

// 八字計算的處理函式
const calculateBaziHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    logger.info('Bazi calculation request received', { 
      body: req.body,
      ip: req.ip 
    });

    // 驗證輸入資料
    const validator = new RequestValidator();
    // **修正：此處應使用專門的八字請求驗證函式，而不是紫微斗數的**
    const validationResult = validator.validateBaziRequest(req.body); 
    if (!validationResult.isValid) {
      logger.warn('Invalid birth info for Bazi calculation', { 
        errors: validationResult.errors,
        body: req.body 
      });
      res.status(400).json({
        error: 'Invalid birth information',
        details: validationResult.errors
      });
      return;
    }

    const { birthDate, birthTime, gender, location } = req.body;

    // 簡單的八字計算邏輯（這裡可以替換為實際的計算邏輯）
    const baziChart = {
      id: `bazi_${Date.now()}`,
      birthInfo: {
        date: birthDate,
        time: birthTime,
        gender,
        location
      },
      fourPillars: {
        year: { 
          heavenlyStem: '甲', 
          earthlyBranch: '子',
          element: '木',
          yinYang: '陽'
        },
        month: { 
          heavenlyStem: '乙', 
          earthlyBranch: '丑',
          element: '木',
          yinYang: '陰'
        },
        day: { 
          heavenlyStem: '丙', 
          earthlyBranch: '寅',
          element: '火',
          yinYang: '陽'
        },
        hour: { 
          heavenlyStem: '丁', 
          earthlyBranch: '卯',
          element: '火',
          yinYang: '陰'
        }
      },
      elements: {
        wood: 2,
        fire: 2,
        earth: 0,
        metal: 0,
        water: 1
      },
      dayMaster: {
        element: '火',
        strength: 'strong',
        characteristics: ['積極', '熱情', '創造力']
      },
      luckyElements: ['木', '火'],
      analysis: {
        personality: '此人性格開朗積極，具有領導才能',
        career: '適合從事創意、領導相關工作',
        health: '注意心血管系統健康',
        relationships: '人際關係良好，易得貴人相助'
      },
      calculatedAt: new Date().toISOString()
    };

    logger.info('Bazi calculation completed successfully', { 
      chartId: baziChart.id,
      ip: req.ip 
    });

    res.json({
      success: true,
      data: baziChart,
      message: '八字計算完成'
    });

  } catch (error) {
    logger.error('Error in Bazi calculation', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
      ip: req.ip 
    });

    res.status(500).json({
      error: 'Internal server error during Bazi calculation',
      message: '八字計算過程中發生錯誤'
    });
  }
};

// 取得八字分析歷史的處理函式
const getBaziHistoryHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Bazi history request received', { ip: req.ip });

    // 這裡可以實作從資料庫取得歷史記錄的邏輯
    const history = [
      {
        id: 'bazi_001',
        date: '2025-01-01',
        summary: '甲子年八字分析'
      }
    ];

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Error fetching Bazi history', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip 
    });

    res.status(500).json({
      error: 'Failed to fetch Bazi history'
    });
  }
};


/**
 * @swagger
 * /api/v1/bazi/calculate:
 *   post:
 *     summary: 八字命盤計算
 *     tags: [BaZi]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BaziRequest'
 *     responses:
 *       200:
 *         description: 計算成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BaziChart'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/calculate', calculateBaziHandler);

/**
 * @swagger
 * /api/v1/bazi/history:
 *   get:
 *     summary: 獲取八字計算歷史
 *     tags: [BaZi]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功獲取歷史記錄
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/history', getBaziHistoryHandler);

export default router;