# 佩璇專案 API 參考手冊

## 📚 API 概覽

佩璇平台提供 RESTful API，支援紫微斗數計算、八字分析和多術數整合服務。所有 API 均使用 JSON 格式進行數據交換。

**Base URL**: `http://localhost:3000/api/v1`  
**Content-Type**: `application/json`  
**Rate Limiting**: 
- 一般 API: 100 請求/15分鐘
- 計算 API: 20 請求/5分鐘

---

## 🔐 認證與授權

目前版本為開發階段，暫無需認證。未來版本將實現 JWT Token 認證。

```bash
# 未來的認證頭格式
Authorization: Bearer <jwt_token>
```

---

## 🟣 紫微斗數 API

### POST /api/v1/purple-star/calculate

計算完整的紫微斗數命盤，包含星曜配置、宮位分析和四化飛星。

#### 請求參數

```json
{
  "birthDate": "1990-05-15",        // 出生日期 (YYYY-MM-DD)
  "birthTime": "14:30",             // 出生時間 (HH:MM)
  "gender": "male",                 // 性別 ("male" | "female")
  "location": "台北市",              // 出生地點
  "lunarInfo": {                    // 農曆資訊 (必需)
    "year": 1990,
    "month": 4,
    "day": 21,
    "isLeapMonth": false,
    "hour": 14
  },
  "options": {                      // 計算選項
    "includeFourTransformations": true,  // 包含四化飛星
    "includeMinorStars": true,          // 包含輔星
    "analysisDepth": "comprehensive"     // 分析深度
  }
}
```

#### 成功響應 (200)

```json
{
  "success": true,
  "data": {
    "chart": {
      "palaces": [                   // 十二宮資料
        {
          "name": "命宮",
          "index": 2,
          "zhi": "寅",
          "gan": "甲",
          "stars": [
            {
              "name": "紫微",
              "type": "main",
              "brightness": "旺",
              "transformations": ["化權"]
            }
          ]
        }
      ],
      "mingPalaceIndex": 2,          // 命宮索引
      "shenPalaceIndex": 8,          // 身宮索引
      "fiveElementsBureau": "水二局"  // 五行局
    },
    "interpretation": {              // 命盤解釋
      "overallAnalysis": "整體分析文字...",
      "personalityTraits": ["領導能力強", "具有創新精神"],
      "careerFortune": "事業運勢分析...",
      "wealthFortune": "財富運勢分析..."
    },
    "metadata": {
      "calculationTime": "2025-01-24T10:30:00Z",
      "version": "1.0.0",
      "analysisDepth": "comprehensive"
    }
  },
  "transformations": {               // 四化飛星資料
    "flows": {
      "命宮": {
        "lu": "太陽",
        "quan": "武曲", 
        "ke": "天機",
        "ji": "天同"
      }
    },
    "combinations": [
      {
        "starName": "紫微",
        "transformation": "化權",
        "palaceName": "命宮",
        "effect": "增強領導能力"
      }
    ],
    "layeredEnergies": {
      "personality": {
        "primary": "權威型領導",
        "secondary": "創新思維"
      }
    }
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

#### 錯誤響應

```json
// 400 - 請求參數錯誤
{
  "success": false,
  "error": "缺少農曆資訊",
  "details": "請確保前端已正確轉換農曆資訊",
  "validationErrors": [
    {
      "field": "lunarInfo",
      "message": "農曆資訊為必填項目"
    }
  ],
  "timestamp": "2025-01-24T10:30:00Z"
}

// 500 - 服務器錯誤
{
  "success": false,
  "error": "計算紫微斗數命盤時發生錯誤",
  "details": "星曜計算異常",
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### GET /api/v1/purple-star/health

檢查紫微斗數服務健康狀態。

#### 響應 (200)

```json
{
  "status": "healthy",
  "service": "purple-star-calculation",
  "timestamp": "2025-01-24T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 🟡 命理整合 API

### POST /api/v1/astrology/integrated-analysis

整合八字與紫微斗數進行交叉驗證分析，提供多維度的命理解讀。

#### 請求參數

```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30", 
  "gender": "male",
  "location": "台北市",
  "useSessionCharts": true,          // 是否使用前端 session 資料
  "baziChart": {                     // 八字命盤資料 (可選)
    "fourPillars": {
      "year": {"stem": "庚", "branch": "午"},
      "month": {"stem": "辛", "branch": "巳"},
      "day": {"stem": "癸", "branch": "未"},
      "hour": {"stem": "己", "branch": "未"}
    },
    "elements": {
      "wood": 1, "fire": 3, "earth": 3, "metal": 2, "water": 1
    }
  },
  "purpleStarChart": {               // 紫微命盤資料 (可選)
    "mingPalaceIndex": 2,
    "mainStars": ["紫微", "天機"],
    "fiveElementsBureau": "水二局"
  },
  "options": {
    "analysisDepth": "comprehensive",
    "includePersonality": true,
    "includeFortune": true,
    "includeCompatibility": false
  }
}
```

#### 成功響應 (200)

```json
{
  "success": true,
  "data": {
    "overallConfidence": 85.6,       // 整體信心度 (0-100)
    "consensusFindings": [           // 共識發現
      "性格特質：領導能力突出",
      "事業運勢：中年後運勢上升",
      "財富特質：偏財運較正財運佳"
    ],
    "divergentFindings": [           // 分歧發現  
      "八字顯示感情運勢較平穩，紫微顯示感情多變化"
    ],
    "recommendations": [             // 綜合建議
      "適合從事管理或創業相關工作",
      "注意健康管理，特別是心血管方面",
      "投資理財宜謹慎，避免投機性投資"
    ],
    "detailedAnalysis": {
      "personality": {
        "category": "personality",
        "matches": ["領導特質", "創新能力"],
        "differences": ["溝通方式差異"],
        "confidence": 88.2,
        "description": "兩種術數在性格分析上高度一致"
      },
      "fortune": {
        "category": "fortune", 
        "matches": ["事業運勢向上", "財運中等"],
        "differences": ["感情運勢評估有差異"],
        "confidence": 82.7,
        "description": "運勢趨勢基本一致，細節略有差異"
      }
    },
    "comprehensiveReading": {
      "completenessPercentage": 92.3,
      "readingDepth": 4,
      "sourceMethods": ["八字", "紫微斗數"]
    },
    "crossValidation": {
      "agreementPercentage": 85.6,
      "reliabilityScore": 8.7,
      "validationSources": ["traditional", "modern_interpretation"]
    }
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### POST /api/v1/astrology/confidence-assessment

對分析結果進行信心度評估，量化分析的可靠性。

#### 請求參數

```json
{
  "analysisResults": {
    "baziAnalysis": {
      "personalityTraits": ["領導能力", "創新思維"],
      "fortuneTrends": ["事業上升", "財運平穩"]
    },
    "purpleStarAnalysis": {
      "personalityTraits": ["權威性格", "創意天賦"],
      "fortuneTrends": ["官祿宮旺", "財帛宮中等"]
    }
  },
  "options": {
    "includeDetailed": true,
    "confidenceThreshold": 70
  }
}
```

#### 成功響應 (200)

```json
{
  "success": true,
  "data": {
    "overallConfidence": 87.4,
    "confidenceBreakdown": {
      "personalityMatch": 91.2,
      "fortuneMatch": 83.6,
      "elementMatch": 88.9
    },
    "reliabilityFactors": [
      {
        "factor": "術數一致性",
        "score": 85.0,
        "weight": 0.4
      },
      {
        "factor": "傳統理論支撐",
        "score": 90.0,
        "weight": 0.3
      }
    ],
    "confidenceLevel": "高信心度",    // 高/中/低
    "recommendations": [
      "分析結果具有高可信度",
      "建議參考進行人生規劃"
    ]
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### GET /api/v1/astrology/health

檢查命理整合服務健康狀態。

#### 響應 (200)

```json
{
  "status": "healthy",
  "service": "astrology-integration",
  "dependencies": {
    "purpleStarService": "healthy",
    "baziService": "healthy"
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

---

## 🔵 八字 API

### POST /api/v1/bazi/calculate

計算八字命盤。注意：主要計算在前端執行，此 API 作為備用。

#### 請求參數

```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "gender": "male",
  "location": "台北市",
  "options": {
    "includeLuckyElements": true,
    "includeFortuneAnalysis": true
  }
}
```

#### 成功響應 (200)

```json
{
  "success": true,
  "data": {
    "fourPillars": {
      "year": {"stem": "庚", "branch": "午", "element": "金"},
      "month": {"stem": "辛", "branch": "巳", "element": "金"},
      "day": {"stem": "癸", "branch": "未", "element": "水"},
      "hour": {"stem": "己", "branch": "未", "element": "土"}
    },
    "elements": {
      "wood": 1,
      "fire": 3, 
      "earth": 3,
      "metal": 2,
      "water": 1
    },
    "dayMaster": {
      "stem": "癸",
      "element": "水",
      "strength": "weak"
    },
    "luckyElements": ["金", "水"],
    "unluckyElements": ["火", "土"],
    "personality": "水日主，性格溫和，具有包容性...",
    "fortune": {
      "career": "適合從事流動性工作...",
      "wealth": "財運平穩，不宜投機...",
      "health": "注意腎臟和循環系統..."
    }
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### GET /api/v1/bazi/history

獲取八字計算歷史記錄。

#### 請求參數

```
GET /api/v1/bazi/history?limit=10&offset=0
```

#### 響應 (200)

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_001",
        "birthDate": "1990-05-15",
        "calculatedAt": "2025-01-24T10:30:00Z",
        "summary": "庚午年 辛巳月 癸未日 己未時"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

---

## 🔧 系統 API

### GET /health

全系統健康檢查端點。

#### 響應 (200)

```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": "connected",
    "cache": "operational", 
    "purpleStarService": "healthy",
    "astrologyIntegration": "healthy"
  }
}
```

### GET /metrics

獲取系統運行指標。

#### 響應 (200)

```json
{
  "metrics": {
    "requestCount": 1250,
    "averageResponseTime": 245,
    "errorRate": 0.02,
    "cacheHitRate": 0.78,
    "activeConnections": 12
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

---

## ⚠️ 錯誤處理

### 標準錯誤格式

所有 API 錯誤都遵循統一格式：

```json
{
  "success": false,
  "error": "錯誤概述",
  "details": "詳細錯誤信息",
  "code": "ERROR_CODE",
  "validationErrors": [
    {
      "field": "fieldName",
      "message": "驗證錯誤信息"
    }
  ],
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### HTTP 狀態碼

| 狀態碼 | 說明 | 常見原因 |
|--------|------|----------|
| 200 | 成功 | 請求處理成功 |
| 400 | 請求錯誤 | 參數格式錯誤、必填項缺失 |
| 401 | 未授權 | Token 無效或過期 |
| 429 | 請求過多 | 超出頻率限制 |
| 500 | 服務器錯誤 | 內部計算錯誤 |
| 503 | 服務不可用 | 服務維護中 |

### 常見錯誤碼

| 錯誤碼 | 說明 | 解決方案 |
|--------|------|----------|
| `INVALID_BIRTH_DATE` | 出生日期格式錯誤 | 使用 YYYY-MM-DD 格式 |
| `MISSING_LUNAR_INFO` | 缺少農曆資訊 | 前端先轉換農曆資訊 |
| `CALCULATION_ERROR` | 計算過程錯誤 | 檢查輸入參數完整性 |
| `CACHE_ERROR` | 快取服務錯誤 | 稍後重試 |
| `RATE_LIMIT_EXCEEDED` | 超出頻率限制 | 降低請求頻率 |

---

## 🔍 使用範例

### JavaScript/TypeScript 客戶端

```typescript
// 紫微斗數計算範例
const calculatePurpleStar = async (birthData: BirthData) => {
  try {
    const response = await fetch('/api/v1/purple-star/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate: birthData.date,
        birthTime: birthData.time,
        gender: birthData.gender,
        location: birthData.location,
        lunarInfo: birthData.lunar,
        options: {
          includeFourTransformations: true,
          includeMinorStars: true,
          analysisDepth: 'comprehensive'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('計算紫微斗數命盤失敗:', error);
    throw error;
  }
};

// 整合分析範例
const integratedAnalysis = async (birthData: BirthData, charts: Charts) => {
  const response = await fetch('/api/v1/astrology/integrated-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...birthData,
      useSessionCharts: true,
      baziChart: charts.bazi,
      purpleStarChart: charts.purpleStar,
      options: {
        analysisDepth: 'comprehensive',
        includePersonality: true,
        includeFortune: true
      }
    })
  });
  
  return response.json();
};
```

### cURL 範例

```bash
# 紫微斗數計算
curl -X POST http://localhost:3000/api/v1/purple-star/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "gender": "male",
    "location": "台北市",
    "lunarInfo": {
      "year": 1990,
      "month": 4,
      "day": 21,
      "isLeapMonth": false,
      "hour": 14
    },
    "options": {
      "includeFourTransformations": true,
      "includeMinorStars": true,
      "analysisDepth": "comprehensive"
    }
  }'

# 健康檢查
curl -X GET http://localhost:3000/health

# 整合分析
curl -X POST http://localhost:3000/api/v1/astrology/integrated-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "gender": "male",
    "useSessionCharts": false,
    "options": {
      "analysisDepth": "comprehensive"
    }
  }'
```

---

## 📊 API 使用統計

### 效能基準

| API 端點 | 平均響應時間 | 95th 百分位 | QPS 限制 |
|----------|-------------|-------------|----------|
| `/purple-star/calculate` | 180ms | 350ms | 4 req/min |
| `/astrology/integrated-analysis` | 220ms | 450ms | 4 req/min |
| `/bazi/calculate` | 80ms | 150ms | 4 req/min |
| `/health` | 5ms | 10ms | 無限制 |

### 快取策略

| 數據類型 | 快取時間 | 快取鍵格式 |
|----------|----------|------------|
| 紫微命盤 | 1小時 | `purple-star-${birthData_hash}` |
| 整合分析 | 30分鐘 | `integrated-${birthData_hash}` |
| 健康檢查 | 1分鐘 | `health-status` |

---

## 🛠️ 開發工具

### API 測試工具

推薦使用以下工具測試 API：

1. **Postman**: 提供完整的 Postman Collection
2. **Insomnia**: REST 客戶端
3. **curl**: 命令行工具
4. **HTTPie**: 現代命令行 HTTP 客戶端

### API 文檔

- **OpenAPI 規範**: `/docs/purpleStarApi.yaml`
- **在線文檔**: `http://localhost:3000/api-docs` (開發中)
- **測試環境**: `http://localhost:3000/api/v1`

---

*文檔版本：v1.0*  
*最後更新：2025年1月24日*  
*維護者：API開發團隊*