import { Router, Request, Response, RequestHandler } from 'express';
import { 
  PurpleStarCalculationRequest, 
  PurpleStarCalculationResponse,
  ApiError,
  BirthInfo,
  PurpleStarChart
} from '../types/purpleStarTypes';
import { RequestValidator, createErrorResponse, createSuccessResponse } from '../utils/validation';
import { PurpleStarCalculationService } from '../services/purpleStarCalculationService';
import { EnhancedPurpleStarCalculationService } from '../services/enhancedPurpleStarCalculationService';
import { TransformationStarService } from '../services/transformationStarService';
import { cacheService } from '../services/cacheService';
import { calculationCacheMiddleware } from '../middleware/cache';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PurpleStarRequest:
 *       type: object
 *       required:
 *         - birthDate
 *         - birthTime
 *         - gender
 *         - lunarInfo
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
 *           $ref: '#/components/schemas/Location'
 *         lunarInfo:
 *           type: object
 *           description: 農曆資訊
 *         options:
 *           type: object
 *           properties:
 *             includeMajorCycles:
 *               type: boolean
 *               default: true
 *             includeMinorCycles:
 *               type: boolean
 *               default: true
 *             includeFourTransformations:
 *               type: boolean
 *               default: false
 *             detailLevel:
 *               type: string
 *               enum: [basic, detailed, expert]
 *               default: basic
 *     PurpleStarChart:
 *       type: object
 *       properties:
 *         palaces:
 *           type: array
 *           description: 十二宮位資料
 *         mingPalaceIndex:
 *           type: integer
 *           description: 命宮位置
 *         calculationInfo:
 *           type: object
 *           description: 計算資訊
 */

const calculatePurpleStarHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    // 驗證請求資料
    const validator = new RequestValidator();
    const validation = validator.validatePurpleStarRequest(req.body);

    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      const errorResponse = createErrorResponse(
        '請求資料驗證失敗',
        '請檢查輸入的出生資訊是否正確',
        validation.errors
      );
      res.status(400).json(errorResponse);
      return;
    }

    const request: PurpleStarCalculationRequest = req.body;

    // 檢查是否有農曆資訊
    if (!request.lunarInfo) {
      const errorResponse = createErrorResponse(
        '缺少農曆資訊',
        '請確保前端已正確轉換農曆資訊'
      );
      res.status(400).json(errorResponse);
      return;
    }
    
    // 生成快取鍵
    const cacheKey = `purple-star-${JSON.stringify({
      birthDate: request.birthDate,
      birthTime: request.birthTime,
      gender: request.gender,
      location: request.location,
      lunarInfo: request.lunarInfo,
      options: request.options
    })}`;
    
    // 檢查快取
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('命盤計算結果從快取中獲取');
      return res.json(cachedResult);
    }
    
    console.log('未找到快取，開始計算命盤...');

    // 解析輸入資料
    const birthDateTime = parseDateTime(request.birthDate, request.birthTime);
    const birthInfo: BirthInfo = {
      solarDate: birthDateTime,
      gender: request.gender
    };

    // 設置默認選項
    const options = {
      includeMajorCycles: request.options?.includeMajorCycles ?? true,
      includeMinorCycles: request.options?.includeMinorCycles ?? true,
      includeAnnualCycles: request.options?.includeAnnualCycles ?? true,
      detailLevel: request.options?.detailLevel ?? 'basic',
      maxAge: request.options?.maxAge ?? 100
    };

    // 使用增強版紫微斗數計算服務，傳入農曆資訊
    console.log('Creating EnhancedPurpleStarCalculationService with:', {
      birthInfo,
      lunarInfo: request.lunarInfo
    });
    
    // 如果提供位置資訊，轉換為字符串格式添加到birthInfo
    if (request.location) {
      // 轉換位置對象為字符串 "longitude,latitude,timezone"
      const locationParts = [
        request.location.longitude.toString(),
        request.location.latitude.toString()
      ];
      if (request.location.timezone) {
        locationParts.push(request.location.timezone);
      }
      birthInfo.location = locationParts.join(',');
    }
    
    const calculator = new EnhancedPurpleStarCalculationService(birthInfo, request.lunarInfo);
    console.log('Enhanced calculator created successfully');
    
    console.log('Starting chart calculation with options:', options);
    const chart = await calculator.calculateChart(options);
    console.log('Chart calculation completed:', chart);

    // 構建四化飛星資料
    let transformationData;
    
    // 檢查是否包含四化飛星資料請求
    if (request.options?.includeFourTransformations) {
      console.log('計算四化飛星資料...');
      
      try {
        // 確保命盤中有命宮天干資訊
        if (!chart.mingGan) {
          console.warn('命盤中缺少命宮天干資訊，嘗試獲取命宮天干...');
          
          // 從 transformationStarService 獲取命宮天干
          const transformationService = new TransformationStarService();
          chart.mingGan = transformationService.getMingPalaceGan(
            request.lunarInfo.yearGan,
            chart.mingPalaceIndex
          );
          
          console.log('已添加命宮天干:', chart.mingGan);
        }
        
        // 計算四化飛星
        const transformationService = new TransformationStarService();
        const transformedStars = transformationService.applyFourTransformations(
          chart.palaces, 
          chart.mingGan
        );
        
        console.log('四化飛星計算完成，共影響', transformedStars.length, '顆星曜');
        
        // 計算四化流動能量
        const flows = transformationService.calculateTransformationFlows(chart.palaces, transformedStars);
        console.log('四化流動計算完成，', Object.keys(flows).length, '個宮位');
        
        // 分析四化組合
        const combinations = transformationService.analyzeTransformationCombinations(chart.palaces);
        console.log('四化組合分析完成，找到', combinations.length, '個組合');
        
        // 計算多層次能量疊加
        let layeredEnergies = {};
        
        if (chart.daXian && chart.daXian.length > 0 && chart.liuNianTaiSui && chart.liuNianTaiSui.length > 0) {
          // 選擇大限和流年指標（這裡選當前年齡相關的）
          const age = 25; // 示例年齡，可以根據需求調整
          
          const daXianInfo = chart.daXian.find(dx => dx.startAge <= age && dx.endAge >= age);
          const liuNianInfo = chart.liuNianTaiSui.find(ln => ln.year === (request.lunarInfo.year + age));
          
          if (daXianInfo && liuNianInfo) {
            layeredEnergies = transformationService.calculateMultiLayerEnergies(
              chart.palaces,
              daXianInfo.palaceIndex,
              liuNianInfo.palaceIndex
            );
            
            console.log('多層次能量疊加計算完成');
          }
        }
        
        // 封裝四化資料
        transformationData = {
          flows,
          combinations,
          layeredEnergies
        };
        
        console.log('四化飛星資料處理完成');
      } catch (error) {
        console.error('四化飛星計算錯誤:', error);
        console.error('繼續處理，但不包含四化飛星資料');
      }
    } else {
      console.log('未請求四化飛星資料，跳過計算');
    }
    
    // 構建回應資料
    const responseData = {
      chart,
      calculationInfo: {
        birthInfo: {
          solarDate: birthInfo.solarDate.toISOString(),
          lunarDate: '農曆計算已整合到服務中', // 農曆日期已在服務中計算
          gender: birthInfo.gender,
          location: request.location
        },
        options
      },
      // 添加四化飛星資料（如果有）
      transformations: transformationData
    };

    const response = createSuccessResponse(responseData);
    
    // 將結果存入快取，有效期1小時
    cacheService.set(cacheKey, response, 3600);
    
    res.json(response);

  } catch (error) {
    console.error('Error calculating Purple Star chart:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorResponse = createErrorResponse(
      '計算紫微斗數命盤時發生錯誤',
      errorMessage
    );
    res.status(500).json(errorResponse);
  }
};

// 輔助函數：解析日期和時間
function parseDateTime(dateStr: string, timeStr: string): Date {
  // 處理時間格式，如果沒有秒數則添加
  const timeWithSeconds = timeStr.includes(':') && timeStr.split(':').length === 2 ? 
    `${timeStr}:00` : timeStr;
  
  const dateTimeStr = `${dateStr}T${timeWithSeconds}`;
  const date = new Date(dateTimeStr);
  
  if (isNaN(date.getTime())) {
    throw new Error(`無效的日期時間格式: ${dateTimeStr}`);
  }
  
  return date;
}

// 生成模擬紫微斗數命盤資料（臨時使用，之後會被真實計算邏輯替換）
function generateMockPurpleStarChart(birthInfo: BirthInfo, options: any): PurpleStarChart {
  const palaceNames = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
    '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮'
  ];

  const mainStars = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
  const auxiliaryStars = ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '天馬', '擎羊', '陀羅', '火星', '鈴星'];

  const year = birthInfo.solarDate.getFullYear();
  const month = birthInfo.solarDate.getMonth() + 1;
  const day = birthInfo.solarDate.getDate();
  const hour = birthInfo.solarDate.getHours();

  // 根據出生時間簡單分配主星
  const selectedMainStars = mainStars.slice(0, Math.floor(year % 5) + 3);
  
  // 生成十二宮位
  const palaces = palaceNames.map((name, index) => ({
    name,
    index,
    zhi: '子丑寅卯辰巳午未申酉戌亥'[index], // 簡化的地支
    stars: [
      ...(index === 0 ? selectedMainStars.slice(0, 2).map(star => ({
        name: star,
        type: 'main' as const,
        palaceIndex: index,
        transformations: [] as ('祿' | '權' | '科' | '忌')[]
      })) : []),
      ...(index % 3 === 0 && index > 0 ? [{
        name: selectedMainStars[index % selectedMainStars.length],
        type: 'main' as const,
        palaceIndex: index,
        transformations: [] as ('祿' | '權' | '科' | '忌')[]
      }] : []),
      ...(index % 2 === 0 ? [{
        name: auxiliaryStars[index % auxiliaryStars.length],
        type: 'auxiliary' as const,
        palaceIndex: index,
        transformations: [] as ('祿' | '權' | '科' | '忌')[]
      }] : [])
    ]
  }));

  // 模擬大限和小限資料
  const daXian = options.includeMajorCycles ? Array.from({ length: 12 }, (_, i) => ({
    startAge: 6 + i * 10,
    endAge: 15 + i * 10,
    palaceName: palaceNames[i],
    palaceZhi: '子丑寅卯辰巳午未申酉戌亥'[i],
    palaceIndex: i
  })) : undefined;

  const xiaoXian = options.includeMinorCycles ? Array.from({ length: options.maxAge }, (_, i) => ({
    age: i + 1,
    palaceName: palaceNames[(i + year) % 12],
    palaceZhi: '子丑寅卯辰巳午未申酉戌亥'[(i + year) % 12],
    palaceIndex: (i + year) % 12
  })) : undefined;

  return {
    palaces,
    mingPalaceIndex: 0, // 模擬命宮在子位
    shenPalaceIndex: 6, // 模擬身宮在午位
    fiveElementsBureau: '水二局', // 模擬五行局
    daXian,
    xiaoXian
  };
}

/**
 * @swagger
 * /api/v1/purple-star/calculate:
 *   post:
 *     summary: 計算紫微斗數命盤
 *     tags: [Purple Star]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurpleStarRequest'
 *     responses:
 *       200:
 *         description: 計算成功
 *         headers:
 *           X-Cache:
 *             description: 快取狀態 (HIT/MISS)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         chart:
 *                           $ref: '#/components/schemas/PurpleStarChart'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         description: 計算錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/calculate', calculationCacheMiddleware, calculatePurpleStarHandler);

/**
 * @swagger
 * /api/v1/purple-star/health:
 *   get:
 *     summary: 紫微斗數服務健康檢查
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
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Purple Star service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
