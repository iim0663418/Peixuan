# Phase 1 實施指令 - Gemini Function Calling Quick Wins

## 目標
修改 `peixuan-worker/src/services/AgenticGeminiService.ts`，實施 3 個 P0 優化項目。

## Task 1: 任務型 Temperature Preset

### BDD 規格
**Given**: 當前硬編碼 `temperature: 0.7`  
**When**: 實施任務型 preset 系統  
**Then**: 工具選擇階段使用 `temperature: 1.0`

### 實作要求
1. 在文件頂部添加 `GenerationPreset` 枚舉和配置常量：
```typescript
enum GenerationPreset {
  TOOL_PLANNING = 'tool_planning',
  CREATIVE_EXPLANATION = 'creative',
  FACTUAL_SUMMARY = 'factual'
}

const GENERATION_PRESETS = {
  tool_planning: {
    temperature: 1.0,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048
  },
  creative: {
    temperature: 1.2,
    topK: 50,
    topP: 0.98,
    maxOutputTokens: 2048
  },
  factual: {
    temperature: 0.3,
    topK: 20,
    topP: 0.85,
    maxOutputTokens: 2048
  }
};
```

2. 修改 `callGeminiWithFunctions` 方法中的 `generationConfig`：
```typescript
// 原代碼 (約在 1095 行)
generationConfig: {
  temperature: 0.7,  // 改為 1.0
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048
}

// 修改為
generationConfig: GENERATION_PRESETS.tool_planning
```

### 驗收標準
- ✅ 添加 `GenerationPreset` 枚舉
- ✅ 添加 `GENERATION_PRESETS` 常量
- ✅ `callGeminiWithFunctions` 使用 `tool_planning` preset
- ✅ Temperature 從 0.7 改為 1.0

---

## Task 2: 錯誤分類器

### BDD 規格
**Given**: 當前使用字串比對錯誤訊息  
**When**: 實施結構化錯誤分類器  
**Then**: 精確識別錯誤類型並採取對應策略

### 實作要求
1. 在文件頂部添加錯誤分類相關定義：
```typescript
enum ErrorCategory {
  RATE_LIMIT = 'rate_limit',
  TRANSIENT_5XX = 'transient_5xx',
  RESOURCE_EXHAUSTED = 'resource_exhausted',
  INVALID_REQUEST = 'invalid_request',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

interface ErrorClassification {
  category: ErrorCategory;
  shouldFallback: boolean;
  shouldRetry: boolean;
  retryAfterMs?: number;
}

class GeminiErrorClassifier {
  static classify(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();
    
    if (message.includes('429') || message.includes('quota')) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        shouldFallback: true,
        shouldRetry: false,
        retryAfterMs: 60000
      };
    }
    
    if (message.includes('500') || message.includes('503') || 
        message.includes('unavailable')) {
      return {
        category: ErrorCategory.TRANSIENT_5XX,
        shouldFallback: true,
        shouldRetry: true,
        retryAfterMs: 2000
      };
    }
    
    if (message.includes('resource has been exhausted') ||
        message.includes('resource_exhausted')) {
      return {
        category: ErrorCategory.RESOURCE_EXHAUSTED,
        shouldFallback: true,
        shouldRetry: false
      };
    }
    
    if (message.includes('400') || message.includes('invalid')) {
      return {
        category: ErrorCategory.INVALID_REQUEST,
        shouldFallback: false,
        shouldRetry: false
      };
    }
    
    return {
      category: ErrorCategory.UNKNOWN,
      shouldFallback: false,
      shouldRetry: false
    };
  }
}
```

2. 修改 `generateDailyInsight` 方法中的錯誤處理邏輯 (約在 763-800 行)：
```typescript
// 原代碼
} catch (error) {
  const shouldFallback = error instanceof Error &&
    (error.message.includes('429') ||
     error.message.includes('503') ||
     error.message.includes('500') ||
     error.message.toLowerCase().includes('quota') ||
     error.message.toLowerCase().includes('resource has been exhausted') ||
     error.message.toLowerCase().includes('unavailable'));

  if (shouldFallback && self.fallbackService) {
    // ... fallback logic
  }
}

// 修改為
} catch (error) {
  const classification = GeminiErrorClassifier.classify(error as Error);
  
  console.log(`[AgenticGemini] Error classified as: ${classification.category}`);
  
  if (classification.shouldFallback && self.fallbackService) {
    usedFallback = true;
    fallbackReason = `${classification.category}: ${error instanceof Error ? error.message : String(error)}`;
    // ... 保持原有 fallback logic
  } else {
    console.error('[AgenticGemini] Non-fallback error or no fallback service available:', error);
    throw error;
  }
}
```

### 驗收標準
- ✅ 添加 `ErrorCategory` 枚舉
- ✅ 添加 `ErrorClassification` 介面
- ✅ 添加 `GeminiErrorClassifier` 類別
- ✅ 替換字串比對邏輯為 `classify()` 調用
- ✅ 記錄錯誤類別到日誌

---

## Task 3: 工具描述結構化模板

### BDD 規格
**Given**: 當前工具描述為單一長文  
**When**: 採用結構化模板  
**Then**: 提升模型理解準確率

### 實作要求
1. 在文件頂部添加描述模板定義：
```typescript
interface ToolDescriptionTemplate {
  purpose: string;
  when_to_use: string;
  input_example?: string;
  output_shape: string;
}

const TOOL_DESCRIPTION_TEMPLATES: Record<string, { zh_TW: ToolDescriptionTemplate; en: ToolDescriptionTemplate }> = {
  get_bazi_profile: {
    zh_TW: {
      purpose: '獲取用戶的八字命盤基本資料，包含四柱、十神、五行分布等核心信息',
      when_to_use: '當需要了解命主基本格局、分析性格特質、或作為其他分析的基礎資料時使用',
      input_example: '「我的命格如何？」、「分析我的八字」、「我的五行缺什麼？」',
      output_shape: '包含四柱干支、十神配置、五行能量分布、納音等結構化資料'
    },
    en: {
      purpose: 'Get user\'s BaZi chart basic data, including Four Pillars, Ten Gods, Five Elements distribution',
      when_to_use: 'Use when understanding basic chart structure, analyzing personality traits, or as foundation for other analyses',
      input_example: '"What is my destiny?", "Analyze my BaZi", "What elements am I missing?"',
      output_shape: 'Structured data including Four Pillars stems/branches, Ten Gods configuration, Five Elements energy distribution, NaYin'
    }
  },
  get_ziwei_chart: {
    zh_TW: {
      purpose: '獲取用戶的紫微斗數命盤，包含十二宮位、主星分布、四化情況等',
      when_to_use: '當需要分析宮位關係、星曜配置、或進行紫微斗數專業分析時使用',
      input_example: '「我的命宮有什麼星？」、「紫微命盤分析」、「我的夫妻宮如何？」',
      output_shape: '包含十二宮位配置、108顆星曜位置、四化飛星、宮位主星等結構化資料'
    },
    en: {
      purpose: 'Get user\'s Zi Wei Dou Shu chart, including twelve palaces, major stars, SiHua transformations',
      when_to_use: 'Use for palace relationships analysis, star configurations, or professional Zi Wei Dou Shu analysis',
      input_example: '"What stars are in my Life Palace?", "Analyze my Zi Wei chart", "How is my Marriage Palace?"',
      output_shape: 'Structured data including twelve palace configurations, 108 stars positions, SiHua flying stars, palace major stars'
    }
  },
  get_daily_transit: {
    zh_TW: {
      purpose: '獲取今日的天象流運資訊，包含流年、流月干支、太歲方位等時空因素',
      when_to_use: '當需要分析當日運勢、時間選擇、或了解當前時空能量時使用',
      input_example: '「今天運勢如何？」、「今天適合做什麼？」、「今日吉凶？」',
      output_shape: '包含今日干支、流年流月資訊、太歲方位、時辰吉凶等結構化資料'
    },
    en: {
      purpose: 'Get today\'s transit information, including annual fortune, monthly stems/branches, Tai Sui direction',
      when_to_use: 'Use for daily fortune analysis, timing selection, or understanding current temporal energy',
      input_example: '"How is my fortune today?", "What should I do today?", "Is today auspicious?"',
      output_shape: 'Structured data including today\'s stems/branches, annual/monthly info, Tai Sui direction, hourly fortune'
    }
  },
  get_annual_context: {
    zh_TW: {
      purpose: '獲取流年大環境背景資訊，包含太歲互動、年度流年盤、全年運勢預測等宏觀時空因素',
      when_to_use: '當用戶詢問年度規劃、重大決策、或需要了解全年運勢格局時使用。提供「全年天氣預報」般的整體運勢走向',
      input_example: '「今年適合創業嗎？」、「2026年整體運勢如何？」、「今年財運如何？」',
      output_shape: '包含太歲關係、流年四化、年度運勢預測、關鍵時間點等結構化資料'
    },
    en: {
      purpose: 'Get annual macro context including Tai Sui interactions, yearly chart, annual fortune forecast',
      when_to_use: 'Use for annual planning, major decisions, or understanding yearly fortune patterns. Provides "yearly weather report" for overall fortune trends',
      input_example: '"Is this year good for starting a business?", "How is my overall fortune in 2026?", "What about my wealth luck this year?"',
      output_shape: 'Structured data including Tai Sui relationship, annual SiHua, fortune forecast, key time points'
    }
  },
  get_life_forces: {
    zh_TW: {
      purpose: '獲取命盤能量流動與五行結構資訊，包含四化能量聚散點、壓力/資源分布、五行平衡狀態等深層格局分析',
      when_to_use: '當需要分析性格特質、能量模式、或了解命主本質優勢與挑戰時使用。揭示命盤內部的能量流向與結構特徵',
      input_example: '「我的優勢在哪裡？」、「我的性格特質？」、「我的能量模式？」',
      output_shape: '包含四化能量聚散、中心性分析、五行平衡、壓力/資源節點等結構化資料'
    },
    en: {
      purpose: 'Get life force energy flow and Five Elements structure, including SiHua energy aggregation, pressure/resource distribution, elemental balance',
      when_to_use: 'Use for personality analysis, energy patterns, or understanding innate strengths and challenges. Reveals internal energy flow and structural characteristics',
      input_example: '"What are my strengths?", "What is my personality?", "What is my energy pattern?"',
      output_shape: 'Structured data including SiHua energy aggregation, centrality analysis, Five Elements balance, pressure/resource nodes'
    }
  }
};

function buildToolDescription(toolName: string, locale: string): string {
  const template = TOOL_DESCRIPTION_TEMPLATES[toolName]?.[locale === 'en' ? 'en' : 'zh_TW'];
  if (!template) {
    return '';
  }
  
  return `
【用途】${template.purpose}

【使用時機】${template.when_to_use}

【輸入範例】${template.input_example || '無'}

【輸出結構】${template.output_shape}
  `.trim();
}
```

2. 修改 `getLocalizedTools` 方法 (約在 1220 行)：
```typescript
// 原代碼
private getLocalizedTools(locale = 'zh-TW'): FunctionTool[] {
  return this.tools.map(tool => ({
    ...tool,
    description: locale === 'zh-TW' ? tool.description : (tool.descriptionEn || tool.description)
  }));
}

// 修改為
private getLocalizedTools(locale = 'zh-TW'): FunctionTool[] {
  return this.tools.map(tool => {
    const enhancedDescription = buildToolDescription(tool.name, locale);
    return {
      ...tool,
      description: enhancedDescription || (locale === 'zh-TW' ? tool.description : (tool.descriptionEn || tool.description))
    };
  });
}
```

### 驗收標準
- ✅ 添加 `ToolDescriptionTemplate` 介面
- ✅ 添加 `TOOL_DESCRIPTION_TEMPLATES` 常量 (5 個工具)
- ✅ 添加 `buildToolDescription` 函數
- ✅ 修改 `getLocalizedTools` 使用新模板
- ✅ 保持向後相容 (如果模板不存在，使用原描述)

---

## 實施注意事項

1. **最小化變動**: 僅修改必要的代碼，不重構其他部分
2. **保持向後相容**: 確保現有功能不受影響
3. **類型安全**: 所有新增代碼必須有完整的 TypeScript 類型
4. **日誌記錄**: 添加適當的 console.log 以便追蹤
5. **不修改測試**: 本次不修改測試文件，僅修改主代碼

## 修改文件清單
- ✅ `peixuan-worker/src/services/AgenticGeminiService.ts` (唯一修改文件)

## 驗證方式
修改完成後，執行以下檢查：
1. TypeScript 編譯無錯誤: `npm run build`
2. 代碼格式正確: `npm run lint`
3. 手動檢查修改點是否符合規格
