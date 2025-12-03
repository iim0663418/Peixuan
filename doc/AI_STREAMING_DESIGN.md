# AI Streaming 深度規劃文檔

**日期**: 2025-12-03
**版本**: v1.0
**狀態**: 規劃中

---

## 📋 目錄

1. [需求分析](#需求分析)
2. [架構設計](#架構設計)
3. [數據流程](#數據流程)
4. [技術方案](#技術方案)
5. [實作步驟](#實作步驟)
6. [測試計劃](#測試計劃)
7. [時間估算](#時間估算)

---

## 🎯 需求分析

### 核心需求
1. **Navbar 入口**: 在導航欄添加「AI 分析」按鈕
2. **無需重複輸入**: 使用已有的計算結果，不要求用戶重新輸入生辰八字
3. **Streaming 輸出**: 支援串流輸出，改善用戶體驗（23-25s → 2-3s 首字節）
4. **D1 快取**: 結合 D1 實現數據共享和快取

### 用戶故事
```
作為用戶，
當我在「統一分析」頁面完成計算後，
我希望能直接點擊 Navbar 的「AI 分析」按鈕，
看到基於我剛才計算結果的 AI 分析，
並且能即時看到分析內容逐字顯示（Streaming），
而不需要等待 20+ 秒才看到結果。
```

### 非功能需求
- **性能**: 首字節時間 < 5 秒
- **可用性**: 支援匿名用戶
- **可靠性**: 支援中斷重連
- **可維護性**: 清晰的代碼結構

---

## 🏗 架構設計

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         前端 (Vue 3)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   App.vue    │───▶│  chartStore  │◀───│ UnifiedView  │  │
│  │   (Navbar)   │    │   (Pinia)    │    │              │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                                │
│         │                   │                                │
│         ▼                   ▼                                │
│  ┌──────────────────────────────────────┐                   │
│  │       AIAnalysisView.vue             │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │   EventSource (SSE Client)     │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTP/SSE
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  後端 (Cloudflare Workers)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              analyzeRoutes.ts                        │   │
│  │  POST /api/v1/analyze/stream                         │   │
│  │  GET  /api/v1/charts/:chartId                        │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           AnalyzeController.ts                       │   │
│  │  - analyzeStream(chartId)                            │   │
│  │  - getChartById(chartId)                             │   │
│  └────────┬──────────────────────┬──────────────────────┘   │
│           │                      │                          │
│           ▼                      ▼                          │
│  ┌────────────────┐    ┌────────────────────┐              │
│  │ GeminiService  │    │  ChartCacheService │              │
│  │ - analyzeChart │    │  - getChart()      │              │
│  │   Stream()     │    │  - saveChart()     │              │
│  └────────────────┘    └──────────┬─────────┘              │
│                                   │                          │
│                                   ▼                          │
│                          ┌────────────────┐                 │
│                          │   D1 Database  │                 │
│                          │ - chart_records│                 │
│                          │ - analysis_    │                 │
│                          │   records      │                 │
│                          └────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 數據模型

#### chartStore (Pinia)
```typescript
interface ChartState {
  currentChart: {
    chartId: string;
    calculation: CalculationResult;
    metadata: {
      birthDate: string;
      birthTime: string;
      gender: string;
      longitude: number;
    };
    createdAt: Date;
  } | null;
  
  history: Array<{
    chartId: string;
    metadata: ChartMetadata;
    createdAt: Date;
  }>;
}
```

#### D1 Tables (已存在)
```sql
-- chart_records
CREATE TABLE chart_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  chart_data TEXT NOT NULL,  -- JSON: CalculationResult
  metadata TEXT NOT NULL,     -- JSON: { birthDate, birthTime, ... }
  created_at TEXT NOT NULL
);

-- analysis_records
CREATE TABLE analysis_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  chart_id TEXT NOT NULL,
  analysis_type TEXT NOT NULL,  -- 'ai-streaming'
  result TEXT NOT NULL,          -- JSON: { text, usage, ... }
  created_at TEXT NOT NULL
);
```

---

## 🔄 數據流程

### Flow 1: 用戶計算命盤
```
1. 用戶在 UnifiedView 輸入生辰八字
2. 調用 /api/v1/calculate
3. 後端計算 CalculationResult
4. 後端保存到 D1 (chart_records)
5. 返回 { chartId, calculation }
6. 前端保存到 chartStore
7. 前端保存 chartId 到 localStorage (匿名用戶)
```

### Flow 2: 用戶點擊「AI 分析」
```
1. 用戶點擊 Navbar「AI 分析」按鈕
2. 檢查 chartStore.currentChart
   - 如果有 → 跳轉到 /ai-analysis
   - 如果無 → 檢查 localStorage.chartId
     - 如果有 → 從 D1 載入 → 跳轉
     - 如果無 → 提示「請先進行命盤計算」
3. AIAnalysisView 顯示載入動畫
4. 建立 EventSource 連接 /api/v1/analyze/stream?chartId=xxx
5. 後端從 D1 讀取 chart_data
6. 後端調用 Gemini streamGenerateContent
7. 後端逐塊返回 SSE 事件
8. 前端逐字顯示分析內容
9. 完成後保存到 D1 (analysis_records)
```

### Flow 3: 快取命中
```
1. 用戶再次點擊「AI 分析」
2. 檢查 D1 analysis_records (chartId + analysis_type)
3. 如果有且未過期 (< 24h) → 直接返回快取
4. 如果無或過期 → 重新調用 Gemini
```

---

## 🛠 技術方案

### Phase 2A: 後端 Streaming API

#### 1. GeminiService - analyzeChartStream
```typescript
// peixuan-worker/src/services/geminiService.ts

async analyzeChartStream(markdown: string): Promise<ReadableStream> {
  const url = `${this.baseUrl}/${this.model}:streamGenerateContent`;
  const prompt = this.buildAnalysisPrompt(markdown);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': this.apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  return response.body!;
}
```

#### 2. AnalyzeController - analyzeStream
```typescript
// peixuan-worker/src/controllers/analyzeController.ts

async analyzeStream(chartId: string, env: Env): Promise<ReadableStream> {
  // 1. 從 D1 讀取 chart_data
  const chart = await this.chartCacheService.getChart(chartId, env);
  if (!chart) {
    throw new Error('Chart not found');
  }

  // 2. 轉換為 Markdown
  const calculation = JSON.parse(chart.chart_data);
  const markdown = formatToMarkdown(calculation, { excludeSteps: true });

  // 3. 調用 Gemini Stream
  const geminiStream = await this.geminiService.analyzeChartStream(markdown);

  // 4. 轉換為 SSE 格式
  return this.transformToSSE(geminiStream, chartId, env);
}

private transformToSSE(
  geminiStream: ReadableStream,
  chartId: string,
  env: Env
): ReadableStream {
  const reader = geminiStream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (text) {
                fullText += text;
                controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
          }
        }

        // 完成後保存到 D1
        await saveAnalysisToD1(chartId, fullText, env);
        controller.enqueue('data: [DONE]\n\n');
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
```

#### 3. analyzeRoutes - /analyze/stream
```typescript
// peixuan-worker/src/routes/analyzeRoutes.ts

router.get('/analyze/stream', async (request, env) => {
  const url = new URL(request.url);
  const chartId = url.searchParams.get('chartId');

  if (!chartId) {
    return new Response('Missing chartId', { status: 400 });
  }

  const controller = new AnalyzeController(env.GEMINI_API_KEY);
  const stream = await controller.analyzeStream(chartId, env);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

---

## 📦 Phase 2B: D1 快取層

### ChartCacheService
```typescript
// peixuan-worker/src/services/chartCacheService.ts

export class ChartCacheService {
  async getChart(chartId: string, env: Env): Promise<ChartRecord | null> {
    const result = await env.DB
      .prepare('SELECT * FROM chart_records WHERE id = ?')
      .bind(chartId)
      .first();
    
    return result as ChartRecord | null;
  }

  async saveChart(
    chartId: string,
    calculation: CalculationResult,
    metadata: ChartMetadata,
    env: Env
  ): Promise<void> {
    await env.DB
      .prepare(`
        INSERT INTO chart_records (id, user_id, type, chart_data, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        chartId,
        null, // 匿名用戶
        'unified',
        JSON.stringify(calculation),
        JSON.stringify(metadata),
        new Date().toISOString()
      )
      .run();
  }

  async getRecentCharts(limit: number, env: Env): Promise<ChartRecord[]> {
    const results = await env.DB
      .prepare('SELECT * FROM chart_records ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all();
    
    return results.results as ChartRecord[];
  }
}
```

### AnalysisCacheService
```typescript
// peixuan-worker/src/services/analysisCacheService.ts

export class AnalysisCacheService {
  async getAnalysis(
    chartId: string,
    analysisType: string,
    env: Env
  ): Promise<AnalysisRecord | null> {
    const result = await env.DB
      .prepare(`
        SELECT * FROM analysis_records 
        WHERE chart_id = ? AND analysis_type = ?
        ORDER BY created_at DESC
        LIMIT 1
      `)
      .bind(chartId, analysisType)
      .first();
    
    // 檢查是否過期 (24小時)
    if (result) {
      const createdAt = new Date(result.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return result as AnalysisRecord;
      }
    }
    
    return null;
  }

  async saveAnalysis(
    chartId: string,
    analysisType: string,
    result: any,
    env: Env
  ): Promise<void> {
    const analysisId = crypto.randomUUID();
    
    await env.DB
      .prepare(`
        INSERT INTO analysis_records (id, user_id, chart_id, analysis_type, result, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        analysisId,
        null, // 匿名用戶
        chartId,
        analysisType,
        JSON.stringify(result),
        new Date().toISOString()
      )
      .run();
  }
}
```

---

