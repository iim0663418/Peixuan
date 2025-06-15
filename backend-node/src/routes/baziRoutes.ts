import express, { Request, Response, Router, RequestHandler } from 'express';
// 假設您的 validation 檔案中有一個 RequestValidator 類別
import { RequestValidator } from '../utils/validation'; 
import logger from '../utils/logger';

const router: Router = express.Router();

// 八字計算的處理函式
const calculateBaziHandler: RequestHandler = async (req, res) => {
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
      return res.status(400).json({
        error: 'Invalid birth information',
        details: validationResult.errors
      });
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
const getBaziHistoryHandler: RequestHandler = async (req: Request, res: Response) => {
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


// --- 路由定義 ---
// 八字計算端點
router.post('/calculate', calculateBaziHandler);

// 取得八字分析歷史
router.get('/history', getBaziHistoryHandler);

export default router;