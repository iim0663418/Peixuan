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

const router = Router();

const calculatePurpleStarHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    // 驗證請求數據
    const validator = new RequestValidator();
    const validation = validator.validatePurpleStarRequest(req.body);

    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      const errorResponse = createErrorResponse(
        '請求數據驗證失敗',
        '請檢查輸入的出生信息是否正確',
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

    // 解析輸入數據
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

    // 使用真實的計算邏輯，傳入農曆資訊
    console.log('Creating PurpleStarCalculationService with:', {
      birthInfo,
      lunarInfo: request.lunarInfo
    });
    
    const calculator = new PurpleStarCalculationService(birthInfo, request.lunarInfo);
    console.log('Calculator created successfully');
    
    console.log('Starting chart calculation with options:', options);
    const chart = await calculator.calculateChart(options);
    console.log('Chart calculation completed:', chart);

    // 構建回應數據
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
      }
    };

    const response = createSuccessResponse(responseData);
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

// 生成模擬紫微斗數命盤數據（臨時使用，之後會被真實計算邏輯替換）
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

  // 模擬大限和小限數據
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

// API 端點路由
router.post('/calculate', calculatePurpleStarHandler);

// 健康檢查端點
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Purple Star service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
