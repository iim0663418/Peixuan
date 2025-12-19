# 每日一問深度規劃：最大化重用與開源整合策略

## 1. 現有實作重用分析

### 1.1 核心組件重用 (100% 重用)
- **UnifiedCalculator**: 直接作為 Function Calling 工具的數據源
- **Gemini Service**: 擴展現有 `geminiService.ts` 支援 Function Calling
- **SSE 基礎設施**: 重用 `/api/v1/analyze/stream` 的 SSE 實作
- **D1 快取系統**: 擴展現有 `cacheService.ts` 支援對話狀態
- **前端 EventSource**: 重用 `AIAnalysisPanel.vue` 的 SSE 解析邏輯

### 1.2 API 路由重用 (80% 重用)
- **基礎路由**: 擴展 `analyzeRoutes.ts` 新增 `/daily-insight/stream`
- **錯誤處理**: 重用現有 Gemini 重試機制與超時處理
- **CORS 設定**: 重用現有跨域配置

## 2. 開源框架評估與選擇

### 2.1 Cloudflare 官方 agents-sdk (推薦 ⭐⭐⭐⭐⭐)
**優勢**:
- 原生 Cloudflare Workers 支援，零配置
- 內建 Durable Objects 狀態管理
- 原生 SSE 與 WebSocket 支援
- 與現有架構完美整合

**實作策略**:
```bash
npm install agents-sdk
```

**重用現有組件**:
- 繼承 `AIChatAgent` 類別
- 工具定義直接調用 `UnifiedCalculator`
- 前端使用 `useAgent` hook 替代手動 EventSource

### 2.2 LangChain.js (備選方案 ⭐⭐⭐)
**限制**:
- Cloudflare Workers 相容性問題 (需額外配置)
- 包體積較大，影響 Workers 冷啟動
- 需要額外的狀態管理層

**僅在以下情況考慮**:
- 需要複雜的 Chain 組合
- 未來計劃支援多種 LLM Provider

### 2.3 自建 ReAct 實作 (不推薦 ⭐⭐)
**原因**: 重複造輪子，agents-sdk 已提供完整解決方案

## 3. 最小實作策略

### 3.1 後端實作 (預估 4-6 小時)

#### Phase 1: 擴展 Gemini Service (2 小時)
```typescript
// 擴展現有 geminiService.ts
export class AgenticGeminiService extends GeminiService {
  private tools = [
    {
      name: "get_bazi_profile",
      description: "調閱八字原局資料",
      parameters: { type: "object", properties: {} }
    },
    // ... 其他工具
  ];

  async chatWithAgent(query: string, userData: any): Promise<ReadableStream> {
    // 重用現有 SSE 基礎設施
    return this.createSSEStream(async (writer) => {
      // ReAct 循環邏輯
    });
  }
}
```

#### Phase 2: 工具執行器 (1 小時)
```typescript
// 重用 UnifiedCalculator
private async executeTool(name: string, userData: any): Promise<string> {
  const calculator = new UnifiedCalculator(userData);
  switch (name) {
    case "get_bazi_profile":
      return calculator.getBaziSummary(); // 新增摘要方法
    // ...
  }
}
```

#### Phase 3: 路由整合 (1 小時)
```typescript
// 擴展 analyzeRoutes.ts
router.post('/daily-insight/stream', async (request, env) => {
  // 重用現有驗證與錯誤處理
  const service = new AgenticGeminiService(env);
  return service.chatWithAgent(query, userData);
});
```

### 3.2 前端實作 (預估 3-4 小時)

#### Phase 1: 組件重構 (2 小時)
```vue
<!-- 基於 AIAnalysisPanel.vue 重構 -->
<template>
  <div class="daily-question-chat">
    <!-- 重用現有 SSE 解析邏輯 -->
    <!-- 重用現有 Markdown 渲染 -->
    <!-- 重用現有錯誤處理 -->
  </div>
</template>

<script setup>
// 重用現有 EventSource 邏輯
// 重用現有狀態管理 (Pinia)
// 重用現有 i18n 配置
</script>
```

#### Phase 2: 狀態前綴解析 (1 小時)
```typescript
// 擴展現有 SSE 解析器
const parseSSEChunk = (chunk: string) => {
  if (chunk.startsWith('[STATE]:')) {
    currentStatus.value = chunk.replace('[STATE]:', '');
  } else if (chunk.startsWith('[DATA]:')) {
    // 重用現有 Markdown 渲染邏輯
  }
};
```

## 4. 開源專案整合清單

### 4.1 必要依賴
```json
{
  "agents-sdk": "^0.1.0",           // Cloudflare 官方 Agent 框架
  "marked": "^17.x",                // 已有，Markdown 渲染
  "lunar-typescript": "^1.8+",      // 已有，命理計算
}
```

### 4.2 可選依賴 (按需添加)
```json
{
  "@langchain/cloudflare": "^0.3.0", // 如需複雜 Chain 組合
  "zod": "^4.x",                      // 已有，Schema 驗證
}
```

## 5. 實作時程規劃

### Week 1: 核心功能 (總計 8-10 小時)
- **Day 1-2**: 後端 Agent 服務實作 (4-6h)
- **Day 3-4**: 前端組件重構 (3-4h)
- **Day 5**: 整合測試與調優 (1-2h)

### Week 2: 優化與擴展 (總計 4-6 小時)
- **Day 1**: 快取策略優化 (2h)
- **Day 2**: 錯誤處理增強 (1h)
- **Day 3**: UI/UX 細節調整 (2-3h)

## 6. 風險評估與緩解

### 6.1 技術風險
- **agents-sdk 穩定性**: 新框架，可能有未知 Bug
  - **緩解**: 保留 LangChain.js 作為備選方案
- **Function Calling 準確性**: AI 可能選錯工具
  - **緩解**: 詳細的工具描述與範例

### 6.2 性能風險
- **多輪對話延遲**: ReAct 循環可能增加響應時間
  - **緩解**: 設定最大循環次數 (3-5 次)
- **Token 消耗**: 工具調用增加 Token 使用
  - **緩解**: 精簡工具回傳數據，使用摘要格式

## 7. 成功指標

### 7.1 技術指標
- **代碼重用率**: > 80%
- **新增代碼量**: < 500 行 (後端 + 前端)
- **響應時間**: < 10 秒 (包含工具調用)
- **準確率**: > 90% (工具選擇正確性)

### 7.2 用戶體驗指標
- **對話流暢度**: 無明顯卡頓
- **狀態反饋**: 清晰的處理進度提示
- **錯誤恢復**: 優雅的錯誤處理與重試

## 8. 下一步行動

1. **立即執行**: 安裝 `agents-sdk` 並建立基礎 Agent 類別
2. **並行開發**: 後端工具執行器 + 前端組件重構
3. **快速驗證**: 建立最小可行版本 (MVP) 進行測試
4. **迭代優化**: 基於測試結果調整實作策略

這個規劃最大化了現有代碼的重用，選擇了最適合的開源框架，並提供了清晰的實作路徑。預計總開發時間 12-16 小時，其中 80% 以上的基礎設施可以直接重用。
