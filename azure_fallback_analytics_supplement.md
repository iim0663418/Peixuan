# Azure 備援分析數據收集方案 (Azure Fallback Analytics Supplement)

本文件為 `zero_impact_implementation_plan.md` 的補充方案，專注於 **Azure OpenAI 備援機制** 啟動時的數據收集策略，確保我們能有效監控備援觸發原因、比較雙模型性能，並維持零影響原則。

## 1. 統一數據收集接口 (Unified Analytics Interface)

為了讓 Gemini 主服務與 Azure 備援服務能共享相同的分析架構，我們定義一個統一的 `AnalyticsService` 介面。

### 1.1 核心介面定義

```typescript
// src/services/analyticsService.ts

export interface AnalyticsPayload {
  // 基礎資訊
  userId?: string;     // 若有身份驗證
  question: string;    // 用戶問題
  
  // 執行結果
  answer: string;      // 最終回答內容
  language: string;    // 回答語言 (zh-TW/en)
  
  // 執行情境
  provider: 'gemini' | 'azure';
  model: string;       // e.g., 'gemini-1.5-pro', 'gpt-4o'
  
  // 備援資訊
  isFallback: boolean;
  fallbackReason?: string; // e.g., "Gemini API Timeout", "Safety Filter"
  
  // 性能指標
  durationMs: number;  // 總耗時
  tokenUsage?: {       // 若 API 有回傳
    prompt: number;
    completion: number;
    total: number;
  };
  
  // 上下文快照 (存入 Cloudflare R2 或 D1 JSON 欄位)
  chartSummary?: any;  // 命盤摘要
  toolCalls?: any[];   // 工具調用紀錄
}

export class AnalyticsService {
  constructor(private db: DrizzleDB, private env: Env) {}

  /**
   * 異步記錄互動數據 (Fire-and-Forget)
   * 必須包裝在 ctx.waitUntil 中執行
   */
  async logInteraction(payload: AnalyticsPayload): Promise<void> {
    // 實作寫入 D1 或發送至分析隊列的邏輯
  }
}
```

## 2. 資料庫 Schema 擴充 (Database Schema Extensions)

在 `daily_question_logs` 表中增加欄位以支援多模型與備援追蹤。

```typescript
// drizzle/schema.ts

export const dailyQuestionLogs = sqliteTable('daily_question_logs', {
  id: text('id').primaryKey(),
  // ... 原有欄位 ...
  
  // 新增模型追蹤欄位
  provider: text('provider').notNull().default('gemini'), // 'gemini' | 'azure'
  model: text('model'),
  
  // 新增備援追蹤欄位
  is_fallback: integer('is_fallback', { mode: 'boolean' }).default(false),
  fallback_reason: text('fallback_reason'), // 記錄切換到 Azure 的原因
  
  // 新增性能欄位
  duration_ms: integer('duration_ms'),
  
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
```

## 3. Azure Service 整合策略 (Streaming Integration)

由於 `AgenticAzureService` 使用 Server-Sent Events (SSE) 串流回應，我們無法像 Promise 那樣簡單地在函式結束後記錄。我們需要將 `ExecutionContext` 傳入，並在串流結束時觸發記錄。

### 3.1 修改 generateDailyInsight 簽章

```typescript
// src/services/agenticAzureService.ts

async generateDailyInsight(
  question: string,
  calculationResult: CalculationResult,
  locale: string = 'zh-TW',
  // 新增選填參數
  options?: {
    context?: ExecutionContext; // Cloudflare Worker Context
    env?: Env;                  // 環境變數
    fallbackReason?: string;    // 觸發備援的原因
  }
): Promise<ReadableStream> {
  // ...
}
```

### 3.2 在串流生命週期中植入記錄點

```typescript
// src/services/agenticAzureService.ts 內部邏輯

return new ReadableStream({
  async start(controller) {
    const startTime = Date.now();
    let fullResponseText = '';
    let toolCallLogs = [];

    try {
      // ... 原有 Agent 邏輯 ...
      
      // 在累積回應片段時同步更新 fullResponseText
      // ...
      
      // 串流結束前 (DONE)
      if (options?.context && options?.env) {
        const analytics = new AnalyticsService(options.env.DB, options.env);
        
        // 建構 Payload
        const payload: AnalyticsPayload = {
          question,
          answer: fullResponseText,
          language: locale,
          provider: 'azure',
          model: this.deployment, // e.g., gpt-4o
          isFallback: true,
          fallbackReason: options.fallbackReason || 'Unknown',
          durationMs: Date.now() - startTime,
          toolCalls: toolCallLogs,
          // ...
        };

        // 關鍵：使用 waitUntil 確保串流關閉後仍能完成寫入
        options.context.waitUntil(
          analytics.logInteraction(payload).catch(err => 
            console.error('[Analytics] Azure log failed:', err)
          )
        );
      }
      
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();

    } catch (error) {
      // 記錄錯誤情況
      if (options?.context && options?.env) {
         // Log error event...
      }
      // ... 原有錯誤處理 ...
    }
  }
});
```

## 4. 雙 AI 服務性能對比 (A/B Comparison Metrics)

透過統一的數據結構，我們可以在後台 (如 Metabase 或自建 Dashboard) 進行以下維度對比：

| 指標 (Metric) | Gemini (Primary) | Azure (Fallback) | 關注點 |
| :--- | :--- | :--- | :--- |
| **P95 Latency** | `duration_ms` | `duration_ms` | 備援是否導致顯著延遲？ |
| **Token Efficiency** | Token/Response Ratio | Token/Response Ratio | 哪種模型的回答更精簡或更囉嗦？ |
| **Tool Usage Rate** | `toolCalls.length` | `toolCalls.length` | 兩者在調用算命工具的頻率與準確度差異 |
| **Error Rate** | Exception Count | Exception Count | Azure 作為備援的穩定性 |
| **Cost Per Request** | (需結合計費公式) | (需結合計費公式) | 評估備援成本效益 |

## 5. 實施步驟 (Implementation Steps)

1.  **Schema Migration**:
    *   更新 `drizzle/schema.ts`。
    *   生成並執行 Migration。
2.  **建立 AnalyticsService**:
    *   在 `src/services/analyticsService.ts` 實作共用邏輯。
3.  **改造 Azure Service**:
    *   更新 `generateDailyInsight` 接受 `ExecutionContext`。
    *   在 Stream `start()` 內部實作數據收集與 `waitUntil` 呼叫。
4.  **更新調用端 (Controller/Route)**:
    *   在 `analyzeRoutes.ts` 或 `unifiedApiService.ts` 中，當捕獲 Gemini 錯誤並切換至 Azure 時，傳遞 `fallbackReason` 與 `ctx`。

```typescript
// 偽代碼：Route Handler
try {
  return await geminiService.generateResponse(...);
} catch (error) {
  console.warn('Gemini failed, switching to Azure:', error);
  
  // 啟動 Azure 備援，並傳遞上下文以供記錄
  return await azureService.generateDailyInsight(question, data, locale, {
    context: ctx,
    env: env,
    fallbackReason: error.message
  });
}
```
