# Gemini Function Calling 企業級架構優化規格

## 背景
參考 Gemini API 官方文檔 (2026-03-06) + 企業級架構最佳實踐，從「快速修復」升級到「可擴展、可觀測、可治理」的架構。

## 架構願景

### 當前問題 (Technical Debt)
1. **單體服務**: AgenticGeminiService 承擔所有職責
2. **硬編碼邏輯**: 工具定義、錯誤處理、參數設定分散各處
3. **缺乏可觀測性**: 無法追蹤工具調用成功率、延遲、失敗原因
4. **粗糙錯誤處理**: 字串比對錯誤訊息，無分類機制
5. **全域參數**: Temperature 等參數無法根據任務調整

### 目標架構 (Enterprise-Grade)
```
┌─────────────────────────────────────────────────────────┐
│                  Observability Layer                     │
│  (Metrics, Tracing, Logging, Analytics)                 │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
┌─────────────────────────────────────────────────────────┐
│              Orchestration Layer                         │
│  - Intent Classifier (AUTO vs ANY)                      │
│  - Tool Selection Strategy                              │
│  - Retry & Fallback Logic                               │
│  - Circuit Breaker                                       │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
┌─────────────────────────────────────────────────────────┐
│               Tool Registry Layer                        │
│  - Schema Versioning (get_annual_context@v2)           │
│  - Description Templates                                 │
│  - Enabled/Disabled Flags                               │
│  - A/B Testing Groups                                    │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
┌─────────────────────────────────────────────────────────┐
│               Execution Layer                            │
│  - Gemini API Client (with timeout/retry)              │
│  - Azure API Client (fallback)                          │
│  - Error Classifier                                      │
│  - Idempotency Handler                                   │
└─────────────────────────────────────────────────────────┘
```

## 分階段實施計畫

### Phase 1: Quick Wins (1-2 天) - P0
**目標**: 立即解決 503 錯誤問題，最小化代碼變動

1. ✅ Temperature 調整為任務型 Preset
2. ✅ 錯誤分類器 (替代字串比對)
3. ✅ 工具描述優化 (添加 when_to_use)

**預期效果**: 
- 錯誤恢復率 +30%
- 用戶可見錯誤 -40%

### Phase 2: 架構重構 (1 週) - P1
**目標**: 建立分層架構基礎

1. 創建 Tool Registry Layer
2. 實施 Intent Classifier (輕量規則)
3. 抽取 Orchestration Layer
4. 添加基礎 Observability

**預期效果**:
- 代碼可維護性 +50%
- 工具調用準確率 +15%

### Phase 3: 完整治理 (2-3 週) - P2
**目標**: 企業級可觀測性與治理

1. Schema Versioning 機制
2. CI Schema Linter
3. Feature Flag + Canary 部署
4. 完整 SLO 監控

**預期效果**:
- 發版風險 -70%
- 問題定位時間 -80%


## Phase 1 詳細規格 (Quick Wins)

### 1. 任務型 Temperature Preset

**Given**: 當前硬編碼 `temperature: 0.7`  
**When**: 根據任務類型動態選擇參數  
**Then**: 不同場景使用不同的生成參數

**實作方案**:
```typescript
// 新增 GenerationPreset 枚舉
enum GenerationPreset {
  TOOL_PLANNING = 'tool_planning',      // 工具選擇階段
  CREATIVE_EXPLANATION = 'creative',     // 創意解釋階段
  FACTUAL_SUMMARY = 'factual'           // 事實總結階段
}

// Preset 配置
const GENERATION_PRESETS = {
  tool_planning: {
    temperature: 1.0,    // Gemini 3 官方建議
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048
  },
  creative: {
    temperature: 1.2,    // 更高創意
    topK: 50,
    topP: 0.98,
    maxOutputTokens: 2048
  },
  factual: {
    temperature: 0.3,    // 更穩定
    topK: 20,
    topP: 0.85,
    maxOutputTokens: 2048
  }
};

// 使用方式
private getGenerationConfig(preset: GenerationPreset) {
  return GENERATION_PRESETS[preset];
}
```

**驗收標準**:
- ✅ 工具選擇階段使用 `temperature: 1.0`
- ✅ 最終回答階段可根據需求調整
- ✅ 配置集中管理，易於 A/B 測試

---

### 2. 錯誤分類器 (Error Classifier)

**Given**: 當前使用字串比對錯誤訊息  
**When**: 實施結構化錯誤分類  
**Then**: 精確識別錯誤類型並採取對應策略

**實作方案**:
```typescript
// 錯誤類型枚舉
enum ErrorCategory {
  RATE_LIMIT = 'rate_limit',           // 429, quota
  TRANSIENT_5XX = 'transient_5xx',     // 500, 503
  RESOURCE_EXHAUSTED = 'resource_exhausted',
  INVALID_REQUEST = 'invalid_request',  // 400, schema error
  AUTHENTICATION = 'authentication',    // 401, 403
  UNKNOWN = 'unknown'
}

// 錯誤分類器
class GeminiErrorClassifier {
  static classify(error: Error): {
    category: ErrorCategory;
    shouldFallback: boolean;
    shouldRetry: boolean;
    retryAfterMs?: number;
  } {
    const message = error.message.toLowerCase();
    
    // Rate Limit (429)
    if (message.includes('429') || message.includes('quota')) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        shouldFallback: true,
        shouldRetry: false,
        retryAfterMs: 60000  // 1 分鐘後重試
      };
    }
    
    // Transient 5xx (500, 503)
    if (message.includes('500') || message.includes('503') || 
        message.includes('unavailable')) {
      return {
        category: ErrorCategory.TRANSIENT_5XX,
        shouldFallback: true,
        shouldRetry: true,
        retryAfterMs: 2000  // 2 秒後重試
      };
    }
    
    // Resource Exhausted
    if (message.includes('resource has been exhausted') ||
        message.includes('resource_exhausted')) {
      return {
        category: ErrorCategory.RESOURCE_EXHAUSTED,
        shouldFallback: true,
        shouldRetry: false
      };
    }
    
    // Invalid Request (不可恢復)
    if (message.includes('400') || message.includes('invalid')) {
      return {
        category: ErrorCategory.INVALID_REQUEST,
        shouldFallback: false,
        shouldRetry: false
      };
    }
    
    // Unknown (保守策略：不 fallback)
    return {
      category: ErrorCategory.UNKNOWN,
      shouldFallback: false,
      shouldRetry: false
    };
  }
}

// 使用方式
try {
  response = await this.callGeminiWithFunctions(...);
} catch (error) {
  const classification = GeminiErrorClassifier.classify(error);
  
  console.log(`[AgenticGemini] Error classified as: ${classification.category}`);
  
  if (classification.shouldFallback && this.fallbackService) {
    // 觸發 Azure 備援
    usedFallback = true;
    fallbackReason = `${classification.category}: ${error.message}`;
    // ... fallback logic
  } else if (!classification.shouldRetry) {
    // 不可恢復錯誤，直接返回友好訊息
    throw new Error(`無法完成分析：${this.getFriendlyErrorMessage(classification.category, locale)}`);
  }
}
```

**驗收標準**:
- ✅ 所有錯誤都經過分類器
- ✅ 只有可恢復錯誤觸發 fallback
- ✅ 不可恢復錯誤返回友好訊息
- ✅ 記錄錯誤類別到 Analytics

---

### 3. 工具描述結構化模板

**Given**: 當前描述為單一長文  
**When**: 採用結構化模板  
**Then**: 提升模型理解準確率

**實作方案**:
```typescript
// 工具描述模板
interface ToolDescriptionTemplate {
  purpose: string;           // 工具用途
  when_to_use: string;       // 使用時機
  input_example?: string;    // 輸入範例
  output_shape: string;      // 輸出結構
}

// 範例：get_annual_context
const TOOL_DESCRIPTIONS = {
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
  }
  // ... 其他工具
};

// 生成最終描述
function buildToolDescription(toolName: string, locale: string): string {
  const template = TOOL_DESCRIPTIONS[toolName][locale];
  return `
【用途】${template.purpose}

【使用時機】${template.when_to_use}

【輸入範例】${template.input_example}

【輸出結構】${template.output_shape}
  `.trim();
}
```

**驗收標準**:
- ✅ 所有 5 個工具採用結構化模板
- ✅ 中英文雙語支援
- ✅ 包含 purpose / when_to_use / input_example / output_shape
- ✅ 描述長度控制在 200-300 字元

---

## Phase 2 詳細規格 (架構重構)

### 1. Tool Registry Layer

**目標**: 集中管理工具定義，支援版本控制和動態啟用/禁用

**實作方案**:
```typescript
// peixuan-worker/src/services/toolRegistry.ts

interface ToolMetadata {
  name: string;
  version: string;              // 如 'v2'
  enabled: boolean;             // 動態啟用/禁用
  abTestGroup?: string;         // A/B 測試分組
  schema: FunctionTool;         // OpenAPI schema
  descriptionTemplate: ToolDescriptionTemplate;
}

class ToolRegistry {
  private tools: Map<string, ToolMetadata> = new Map();
  
  register(metadata: ToolMetadata) {
    const key = `${metadata.name}@${metadata.version}`;
    this.tools.set(key, metadata);
  }
  
  getEnabled(locale: string): FunctionTool[] {
    return Array.from(this.tools.values())
      .filter(t => t.enabled)
      .map(t => this.buildToolSchema(t, locale));
  }
  
  getByName(name: string, version = 'latest'): ToolMetadata | undefined {
    if (version === 'latest') {
      // 找最新版本
      const versions = Array.from(this.tools.keys())
        .filter(k => k.startsWith(`${name}@`))
        .sort()
        .reverse();
      return versions.length > 0 ? this.tools.get(versions[0]) : undefined;
    }
    return this.tools.get(`${name}@${version}`);
  }
  
  private buildToolSchema(metadata: ToolMetadata, locale: string): FunctionTool {
    const template = metadata.descriptionTemplate[locale];
    return {
      ...metadata.schema,
      description: buildToolDescription(metadata.name, locale)
    };
  }
}

// 全域單例
export const toolRegistry = new ToolRegistry();

// 註冊工具
toolRegistry.register({
  name: 'get_annual_context',
  version: 'v2',
  enabled: true,
  schema: { /* ... */ },
  descriptionTemplate: TOOL_DESCRIPTIONS.get_annual_context
});
```


---

### 4. Observability Layer (基礎版)

**目標**: 記錄關鍵指標，支援問題定位

**實作方案**:
```typescript
// peixuan-worker/src/services/observabilityService.ts

interface ToolCallMetrics {
  toolName: string;
  success: boolean;
  latencyMs: number;
  errorCategory?: ErrorCategory;
  timestamp: number;
}

interface SessionMetrics {
  sessionId: string;
  totalToolCalls: number;
  successfulCalls: number;
  failedCalls: number;
  fallbackUsed: boolean;
  totalLatencyMs: number;
  intentCategory: IntentCategory;
  functionCallingMode: 'AUTO' | 'ANY';
}

class ObservabilityService {
  // 記錄工具調用
  recordToolCall(metrics: ToolCallMetrics) {
    console.log('[Observability] Tool call:', JSON.stringify(metrics));
    
    // 寫入 D1 (異步，不阻塞主流程)
    // ctx.waitUntil(this.persistMetrics(metrics));
  }
  
  // 記錄會話指標
  recordSession(metrics: SessionMetrics) {
    console.log('[Observability] Session metrics:', JSON.stringify(metrics));
    
    // 計算衍生指標
    const toolCallRate = metrics.totalToolCalls / 1;  // 每次對話的工具調用次數
    const toolSuccessRate = metrics.successfulCalls / metrics.totalToolCalls;
    const avgLatency = metrics.totalLatencyMs / metrics.totalToolCalls;
    
    console.log('[Observability] Derived metrics:', {
      toolCallRate,
      toolSuccessRate,
      avgLatency
    });
  }
  
  // 生成指標摘要 (用於監控面板)
  async getMetricsSummary(timeRangeMs: number): Promise<{
    tool_call_rate: number;
    tool_success_rate: number;
    fallback_rate: number;
    p95_latency: number;
    user_visible_error_rate: number;
  }> {
    // 從 D1 查詢聚合數據
    // ... 實作略
    return {
      tool_call_rate: 0,
      tool_success_rate: 0,
      fallback_rate: 0,
      p95_latency: 0,
      user_visible_error_rate: 0
    };
  }
}
```

**驗收標準**:
- ✅ 記錄每次工具調用的成功/失敗/延遲
- ✅ 記錄會話級別的聚合指標
- ✅ 支援查詢指標摘要
- ✅ 異步寫入，不阻塞主流程

---

## Phase 3 詳細規格 (完整治理)

### 1. Schema Versioning 機制

**目標**: 支援工具 schema 演進，避免破壞性變更

**實作方案**:
```typescript
// 工具版本管理
toolRegistry.register({
  name: 'get_annual_context',
  version: 'v1',
  enabled: false,  // 舊版本禁用
  schema: { /* v1 schema */ }
});

toolRegistry.register({
  name: 'get_annual_context',
  version: 'v2',
  enabled: true,   // 新版本啟用
  schema: { /* v2 schema with new fields */ }
});

// 漸進式遷移
toolRegistry.register({
  name: 'get_annual_context',
  version: 'v2',
  enabled: true,
  abTestGroup: 'control',  // 50% 用戶
  schema: { /* v2 schema */ }
});

toolRegistry.register({
  name: 'get_annual_context',
  version: 'v3',
  enabled: true,
  abTestGroup: 'experiment',  // 50% 用戶
  schema: { /* v3 schema with improvements */ }
});
```

**驗收標準**:
- ✅ 支援多版本並存
- ✅ 支援 A/B 測試
- ✅ 支援漸進式遷移

---

### 2. CI Schema Linter

**目標**: 自動檢查 schema 品質

**實作方案**:
```typescript
// peixuan-worker/scripts/lint-tool-schemas.ts

interface SchemaLintRule {
  name: string;
  check: (tool: ToolMetadata) => boolean;
  message: string;
}

const SCHEMA_LINT_RULES: SchemaLintRule[] = [
  {
    name: 'has-description',
    check: (tool) => !!tool.schema.description && tool.schema.description.length > 50,
    message: 'Tool description must be at least 50 characters'
  },
  {
    name: 'has-when-to-use',
    check: (tool) => tool.descriptionTemplate.zh_TW.when_to_use.length > 0,
    message: 'Tool must have when_to_use guidance'
  },
  {
    name: 'has-input-example',
    check: (tool) => !!tool.descriptionTemplate.zh_TW.input_example,
    message: 'Tool should have input examples'
  },
  {
    name: 'has-output-shape',
    check: (tool) => !!tool.descriptionTemplate.zh_TW.output_shape,
    message: 'Tool must describe output structure'
  },
  {
    name: 'enum-for-fixed-values',
    check: (tool) => {
      // 檢查是否有應該用 enum 但沒用的參數
      // ... 實作略
      return true;
    },
    message: 'Use enum for parameters with fixed values'
  }
];

function lintToolSchemas(): boolean {
  let hasErrors = false;
  
  for (const [key, tool] of toolRegistry.tools) {
    console.log(`Linting ${key}...`);
    
    for (const rule of SCHEMA_LINT_RULES) {
      if (!rule.check(tool)) {
        console.error(`❌ ${key}: ${rule.message}`);
        hasErrors = true;
      }
    }
  }
  
  return !hasErrors;
}

// 在 CI 中執行
if (!lintToolSchemas()) {
  process.exit(1);
}
```

**驗收標準**:
- ✅ CI 自動執行 schema linter
- ✅ 檢查 description、enum、required、example
- ✅ Lint 失敗阻止合併

---

### 3. Feature Flag + Canary 部署

**目標**: 安全發版，快速回滾

**實作方案**:
```typescript
// peixuan-worker/src/services/featureFlagService.ts

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;  // 0-100
  allowedUsers?: string[];    // 白名單
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  
  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;
    
    // 白名單優先
    if (flag.allowedUsers && userId && flag.allowedUsers.includes(userId)) {
      return true;
    }
    
    // 百分比灰度
    if (!flag.enabled) return false;
    
    const hash = this.hashUserId(userId || 'anonymous');
    return (hash % 100) < flag.rolloutPercentage;
  }
  
  private hashUserId(userId: string): number {
    // 簡單 hash 函數
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// 使用方式
const featureFlags = new FeatureFlagService();

featureFlags.register({
  name: 'new-tool-descriptions',
  enabled: true,
  rolloutPercentage: 5  // 5% 灰度
});

// 在代碼中使用
if (featureFlags.isEnabled('new-tool-descriptions', chartId)) {
  // 使用新的工具描述
} else {
  // 使用舊的工具描述
}
```

**驗收標準**:
- ✅ 支援百分比灰度
- ✅ 支援白名單
- ✅ 支援快速回滾 (設定 enabled: false)

---

### 4. SLO 監控與自動守門

**目標**: 自動化發版決策

**實作方案**:
```typescript
// peixuan-worker/src/services/sloGateService.ts

interface SLO {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=';
}

const RELEASE_SLOS: SLO[] = [
  { metric: 'tool_success_rate', threshold: 0.95, operator: '>=' },
  { metric: 'fallback_rate', threshold: 0.1, operator: '<=' },
  { metric: 'p95_latency', threshold: 30000, operator: '<=' },
  { metric: 'user_visible_error_rate', threshold: 0.05, operator: '<=' }
];

class SLOGateService {
  async checkSLOs(timeRangeMs: number): Promise<{
    passed: boolean;
    violations: string[];
  }> {
    const metrics = await observabilityService.getMetricsSummary(timeRangeMs);
    const violations: string[] = [];
    
    for (const slo of RELEASE_SLOS) {
      const value = metrics[slo.metric];
      const passed = this.evaluateSLO(value, slo.threshold, slo.operator);
      
      if (!passed) {
        violations.push(`${slo.metric}: ${value} ${slo.operator} ${slo.threshold} (FAILED)`);
      }
    }
    
    return {
      passed: violations.length === 0,
      violations
    };
  }
  
  private evaluateSLO(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      default: return false;
    }
  }
}

// Canary 部署流程
async function canaryDeploy() {
  // Stage 1: 5% 灰度
  featureFlags.update('new-optimization', { rolloutPercentage: 5 });
  await sleep(3600000);  // 1 小時
  
  const stage1Check = await sloGateService.checkSLOs(3600000);
  if (!stage1Check.passed) {
    console.error('Stage 1 SLO check failed:', stage1Check.violations);
    featureFlags.update('new-optimization', { enabled: false });  // 回滾
    return;
  }
  
  // Stage 2: 25% 灰度
  featureFlags.update('new-optimization', { rolloutPercentage: 25 });
  await sleep(3600000);
  
  const stage2Check = await sloGateService.checkSLOs(3600000);
  if (!stage2Check.passed) {
    console.error('Stage 2 SLO check failed:', stage2Check.violations);
    featureFlags.update('new-optimization', { enabled: false });
    return;
  }
  
  // Stage 3: 100% 全量
  featureFlags.update('new-optimization', { rolloutPercentage: 100 });
  console.log('Canary deploy completed successfully');
}
```

**驗收標準**:
- ✅ 定義 4 個核心 SLO
- ✅ 自動檢查 SLO 合規性
- ✅ SLO 失敗自動回滾
- ✅ 支援 5% → 25% → 100% 灰度流程

---

## 實施時間表

| 階段 | 時間 | 工作量 | 風險 |
|------|------|--------|------|
| Phase 1 (Quick Wins) | 1-2 天 | 8-16 小時 | 低 |
| Phase 2 (架構重構) | 1 週 | 40 小時 | 中 |
| Phase 3 (完整治理) | 2-3 週 | 80-120 小時 | 中 |

## 關鍵指標定義

| 指標 | 定義 | 目標值 | 當前值 |
|------|------|--------|--------|
| tool_call_rate | 每次對話的平均工具調用次數 | 2-3 | 未知 |
| tool_success_rate | 工具調用成功率 | ≥ 95% | 未知 |
| fallback_rate | Azure 備援觸發率 | ≤ 10% | 未知 |
| p95_latency | 95 百分位延遲 | ≤ 30s | ~29s |
| user_visible_error_rate | 用戶可見錯誤率 | ≤ 5% | 未知 |

## 風險與緩解

### Phase 1 風險
- **Temperature 調整影響**: 使用 A/B 測試驗證
- **錯誤分類器誤判**: 保守策略，記錄所有決策

### Phase 2 風險
- **架構重構引入 Bug**: 完整單元測試 + Staging 驗證
- **Intent Classifier 準確率低**: 從簡單規則開始，逐步優化

### Phase 3 風險
- **Feature Flag 複雜度**: 使用成熟的 Feature Flag 服務 (如 LaunchDarkly)
- **SLO 閾值設定不當**: 基於歷史數據調整

## 成功標準

### Phase 1
- ✅ 503 錯誤恢復率 +30%
- ✅ 用戶可見錯誤 -40%
- ✅ 無性能回歸

### Phase 2
- ✅ 代碼可維護性提升 (Cyclomatic Complexity -30%)
- ✅ 工具調用準確率 +15%
- ✅ 問題定位時間 -50%

### Phase 3
- ✅ 發版風險 -70%
- ✅ 支援 A/B 測試
- ✅ 自動化 SLO 守門

---

## 附錄：參考資料

1. **Gemini API 官方文檔**: https://ai.google.dev/gemini-api/docs/function-calling
2. **OpenAPI Schema 規範**: https://spec.openapis.org/oas/v3.0.3
3. **Circuit Breaker 模式**: https://martinfowler.com/bliki/CircuitBreaker.html
4. **Feature Flag 最佳實踐**: https://launchdarkly.com/blog/feature-flag-best-practices/
5. **SLO 設計指南**: https://sre.google/workbook/implementing-slos/

---

### 2. Intent Classifier (輕量規則)

**目標**: 根據用戶問題類型決定 Function Calling Mode

**實作方案**:
```typescript
// peixuan-worker/src/services/intentClassifier.ts

enum IntentCategory {
  FACTUAL_QUERY = 'factual',      // 需要事實資料
  CREATIVE_CHAT = 'creative',     // 閒聊/創意
  SUMMARY = 'summary',            // 總結/潤飾
  UNKNOWN = 'unknown'
}

interface IntentClassificationResult {
  category: IntentCategory;
  confidence: number;
  suggestedMode: 'AUTO' | 'ANY';
  suggestedTools?: string[];      // 建議的工具列表
}

class IntentClassifier {
  // 關鍵字規則 (輕量級)
  private static FACTUAL_KEYWORDS = [
    '今年', '流年', '運勢', '適合', '財運', '事業', '感情',
    '何時', '什麼時候', '分析', '命盤', '八字', '紫微'
  ];
  
  private static CREATIVE_KEYWORDS = [
    '聊聊', '說說', '覺得', '怎麼看', '有趣', '好玩'
  ];
  
  static classify(question: string): IntentClassificationResult {
    const lowerQuestion = question.toLowerCase();
    
    // 計算關鍵字匹配度
    const factualScore = this.FACTUAL_KEYWORDS.filter(
      kw => lowerQuestion.includes(kw)
    ).length;
    
    const creativeScore = this.CREATIVE_KEYWORDS.filter(
      kw => lowerQuestion.includes(kw)
    ).length;
    
    // 決策邏輯
    if (factualScore > creativeScore && factualScore > 0) {
      return {
        category: IntentCategory.FACTUAL_QUERY,
        confidence: Math.min(factualScore / 3, 1.0),
        suggestedMode: 'ANY',  // 強制工具調用
        suggestedTools: this.inferTools(question)
      };
    }
    
    if (creativeScore > 0) {
      return {
        category: IntentCategory.CREATIVE_CHAT,
        confidence: Math.min(creativeScore / 2, 1.0),
        suggestedMode: 'AUTO'  // 讓模型決定
      };
    }
    
    // 預設：保守策略
    return {
      category: IntentCategory.UNKNOWN,
      confidence: 0.5,
      suggestedMode: 'AUTO'
    };
  }
  
  private static inferTools(question: string): string[] {
    const tools: string[] = [];
    
    if (question.includes('今年') || question.includes('流年')) {
      tools.push('get_annual_context');
    }
    if (question.includes('命盤') || question.includes('八字')) {
      tools.push('get_bazi_profile');
    }
    // ... 更多規則
    
    return tools;
  }
}
```

**驗收標準**:
- ✅ 實施輕量級關鍵字規則
- ✅ 事實查詢使用 ANY 模式
- ✅ 閒聊使用 AUTO 模式
- ✅ 記錄分類結果到 Analytics

---

### 3. Orchestration Layer

**目標**: 統一管理重試、fallback、circuit breaker 邏輯

**實作方案**:
```typescript
// peixuan-worker/src/services/orchestrationService.ts

interface OrchestrationConfig {
  maxRetries: number;
  retryDelayMs: number;
  circuitBreakerThreshold: number;
  fallbackEnabled: boolean;
}

class OrchestrationService {
  private circuitBreakerState: Map<string, {
    failures: number;
    lastFailureTime: number;
    isOpen: boolean;
  }> = new Map();
  
  async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    config: OrchestrationConfig
  ): Promise<T> {
    // Circuit Breaker 檢查
    if (this.isCircuitOpen('gemini')) {
      console.log('[Orchestration] Circuit breaker open, using fallback');
      return fallbackFn();
    }
    
    // 重試邏輯
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await primaryFn();
        this.recordSuccess('gemini');
        return result;
      } catch (error) {
        const classification = GeminiErrorClassifier.classify(error);
        
        console.log(`[Orchestration] Attempt ${attempt}/${config.maxRetries} failed: ${classification.category}`);
        
        if (!classification.shouldRetry || attempt === config.maxRetries) {
          // 記錄失敗
          this.recordFailure('gemini');
          
          // 決定是否 fallback
          if (classification.shouldFallback && config.fallbackEnabled) {
            console.log('[Orchestration] Falling back to Azure');
            return fallbackFn();
          }
          
          throw error;
        }
        
        // 等待後重試
        await this.sleep(config.retryDelayMs * Math.pow(2, attempt - 1));
      }
    }
    
    throw new Error('Unexpected orchestration error');
  }
  
  private recordFailure(service: string) {
    const state = this.circuitBreakerState.get(service) || {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false
    };
    
    state.failures++;
    state.lastFailureTime = Date.now();
    
    // 達到閾值，打開斷路器
    if (state.failures >= 5) {
      state.isOpen = true;
      console.log(`[Orchestration] Circuit breaker opened for ${service}`);
    }
    
    this.circuitBreakerState.set(service, state);
  }
  
  private recordSuccess(service: string) {
    // 重置失敗計數
    this.circuitBreakerState.delete(service);
  }
  
  private isCircuitOpen(service: string): boolean {
    const state = this.circuitBreakerState.get(service);
    if (!state || !state.isOpen) return false;
    
    // 30 秒後自動半開
    if (Date.now() - state.lastFailureTime > 30000) {
      state.isOpen = false;
      state.failures = 0;
      this.circuitBreakerState.set(service, state);
      return false;
    }
    
    return true;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**驗收標準**:
- ✅ 統一的重試邏輯
- ✅ Circuit Breaker 機制
- ✅ 自動 fallback 決策
- ✅ 記錄所有決策到日誌
**Given**: 當前工具定義缺少詳細參數和約束  
**When**: 重構工具定義，添加完整的 OpenAPI schema  
**Then**: 
- 每個工具包含詳細的 `description` (中英文)
- 添加使用場景說明 ("適用於...")
- 如有固定值參數，使用 `enum` 約束
- 添加參數格式範例

**驗收標準**:
```typescript
{
  name: 'get_bazi_profile',
  description: '獲取用戶的八字命盤基本資料，包含四柱、十神、五行分布等核心信息。適用於需要了解命主基本格局、分析性格特質、或作為其他分析的基礎資料時使用。',
  descriptionEn: 'Get user\'s BaZi chart basic data, including Four Pillars, Ten Gods, Five Elements distribution. Use when understanding basic chart structure, analyzing personality traits, or as foundation for other analyses.',
  parameters: {
    type: 'object',
    properties: {
      // 如有參數，添加詳細定義
    },
    required: []
  }
}
```

### Scenario 2: 優化 Function Calling Mode
**Given**: 當前使用 `AUTO` 模式，模型可能選擇不調用工具  
**When**: 針對每日一問場景，切換到 `ANY` 模式  
**Then**:
- 強制模型必須調用工具
- 確保每次對話都有工具執行
- 提升分析深度

**驗收標準**:
```typescript
tool_config: {
  function_calling_config: {
    mode: 'ANY'  // 強制工具調用
  }
}
```

### Scenario 3: 增強錯誤處理
**Given**: 當前僅處理 503/429 錯誤  
**When**: 擴展錯誤處理邏輯  
**Then**:
- 處理 500 (Internal Server Error)
- 處理 `RESOURCE_EXHAUSTED` 狀態
- 處理 `UNAVAILABLE` 狀態
- 所有錯誤都觸發 Azure 備援

**驗收標準**:
```typescript
const shouldFallback = error instanceof Error &&
  (error.message.includes('429') ||
   error.message.includes('503') ||
   error.message.includes('500') ||
   error.message.toLowerCase().includes('quota') ||
   error.message.toLowerCase().includes('resource has been exhausted') ||
   error.message.toLowerCase().includes('unavailable'));
```

### Scenario 4: 調整 Temperature 設定
**Given**: 當前 `temperature: 0.7` 可能導致性能問題  
**When**: 調整為 Gemini 3 推薦值  
**Then**:
- 設定 `temperature: 1.0`
- 避免循環和性能下降
- 保持推理品質

**驗收標準**:
```typescript
generationConfig: {
  temperature: 1.0,  // Gemini 3 官方建議
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048
}
```

### Scenario 5: 優化工具描述
**Given**: 當前描述過於簡短  
**When**: 擴展每個工具的描述  
**Then**:
- 添加詳細的功能說明
- 添加使用場景 ("適用於...")
- 添加參數格式範例
- 中英文雙語支援

**驗收標準**:
```typescript
{
  name: 'get_annual_context',
  description: '獲取流年大環境背景資訊，包含太歲互動、年度流年盤、全年運勢預測等宏觀時空因素。提供「全年天氣預報」般的整體運勢走向，適用於分析年度規劃、重大決策、或需要了解全年運勢格局時使用。範例：「今年適合創業嗎？」、「2026年整體運勢如何？」',
  descriptionEn: 'Get annual macro context including Tai Sui interactions, yearly chart, annual fortune forecast. Provides "yearly weather report" for overall fortune trends. Use for annual planning, major decisions, or understanding yearly fortune patterns. Examples: "Is this year good for starting a business?", "How is my overall fortune in 2026?"'
}
```

## 實施優先級

### P0 (立即實施)
1. ✅ 調整 Temperature 為 1.0
2. ✅ 增強錯誤處理 (500/RESOURCE_EXHAUSTED)
3. ✅ 優化工具描述 (添加使用場景和範例)

### P1 (短期實施)
4. 評估 Function Calling Mode 切換到 `ANY` 的影響
5. 添加工具調用成功率監控

### P2 (長期優化)
6. 實施動態工具選擇 (根據對話上下文)
7. 添加工具調用性能分析

## 測試計畫

### 單元測試
- ✅ 驗證 Temperature 設定為 1.0
- ✅ 驗證錯誤處理涵蓋 500/503/429
- ✅ 驗證工具描述包含使用場景

### 整合測試
- 在 Staging 環境測試完整的 ReAct 流程
- 驗證 Azure 備援在各種錯誤下正常觸發
- 測試工具調用成功率

### 性能測試
- 對比優化前後的平均響應時間
- 監控工具調用準確率
- 追蹤 Azure 備援觸發頻率

## 預期效果

1. **工具調用準確率提升**: 更詳細的描述 → 模型更準確選擇工具
2. **錯誤恢復能力增強**: 更完整的錯誤處理 → 更少的用戶可見錯誤
3. **推理品質提升**: Temperature 1.0 → 避免循環和性能問題
4. **用戶體驗改善**: 更快的備援切換 → 更少的等待時間

## 風險評估

### 低風險
- Temperature 調整 (官方推薦)
- 錯誤處理擴展 (向後相容)

### 中風險
- Function Calling Mode 切換 (需要測試)
  - 可能影響對話流暢度
  - 需要驗證是否過度調用工具

### 緩解策略
- 在 Staging 環境充分測試
- 使用 Feature Flag 控制新功能
- 監控關鍵指標 (響應時間、成功率)
