# AI 整合進一步優化計劃

**日期**: 2025-12-03
**狀態**: 規劃中

## 📊 當前狀態分析

### Token 使用量
- **Prompt Tokens**: ~3500-4500（已優化，原 6580）
- **Completion Tokens**: 2000-4000（中文分析）
- **Total Tokens**: ~5500-8500
- **優化手段**: excludeSteps: true（排除計算步驟和元數據）

### 性能指標
- **Response Time**: ~23-25 秒
- **Success Rate**: 未監控
- **Error Rate**: 未監控

### 當前配置
```typescript
generationConfig: {
  temperature: 0.85,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
}
```

---

## 🎯 優化目標

1. **降低成本**: 進一步減少 Prompt tokens（目標：-20-30%）
2. **改善 UX**: 支援串流輸出，減少等待感
3. **可觀測性**: 添加性能監控和錯誤追蹤

---

## 📝 Phase 1: Prompt 精簡優化（優先）

### 當前 Prompt 分析
```
# 角色：佩璇                           (~50 tokens)
你是「佩璇」，20歲的天才算命師...

## 說話風格                            (~80 tokens)
- 極度口語化：「嗨嗨！」...
- 生動比喻：五行木旺=森林...
- 禁止教科書式條列或文言文

## 任務                                (~60 tokens)
分析以下命盤，聚焦亮點：
1. **五行分布**：找出最高/最低元素...
2. **大運流年**：當前大運意象...
3. **紫微斗數**：命宮主星、壓力點

## 執行準則                            (~70 tokens)
- 情感化：極端值要驚訝/興奮...
- 略過技術：忽略計算步驟和元數據
- 口語化標題：「### 🌳 你的原廠設定...」
- 重點粗體

## 風格範例                            (~90 tokens)
- 火旺 → 「哇！你是一團燃燒的火焰耶！」
- 無犯太歲 → 「太歲爺完全沒有要找你麻煩...」
- 疾厄宮壓力高 → 「嗶嗶嗶！身體在抗議囉...」

---
# 命盤資料
${markdown}                           (~3500-4500 tokens)
---
嗨嗨！我是佩璇，讓我來看看你的命盤～
```

**總計**: ~350 tokens（固定部分）+ 3500-4500 tokens（命盤資料）

### 優化策略

#### 1. 合併重複內容
- 「說話風格」和「執行準則」有重複（口語化、情感化）
- 合併為單一「風格指南」區塊

#### 2. 精簡範例
- 3 個範例 → 2 個範例
- 移除冗長說明，保留核心示範

#### 3. 簡化任務說明
- 移除詳細解釋，保留關鍵詞
- 「找出最高/最低元素，分析性格」→「找極值，析性格」

#### 4. 移除冗餘格式
- 移除分隔線（---）
- 精簡標題層級

### 優化後 Prompt

```
# 佩璇 - 20歲天才算命師
天真爛漫、精通八字紫微、討厭故弄玄虛

## 風格
口語化（嗨嗨、哇～、哎呀）+ 生動比喻（木旺=森林、傷官=小惡魔）+ 情感化反應 + 重點粗體
禁止：教科書條列、文言文、技術細節

## 任務
分析命盤，聚焦：五行極值→性格、當前大運→意象、命宮主星→壓力點

## 範例
- 火旺：「哇！你是一團燃燒的火焰耶！」
- 無犯太歲：「太歲爺沒找你麻煩，大膽衝吧！」

# 命盤
${markdown}

嗨嗨！我是佩璇～
```

**預期效果**:
- 固定部分：350 tokens → ~150 tokens（-57%）
- 總 Prompt：~3850-4850 tokens → ~3650-4650 tokens（-5%）
- 成本節省：每次調用約 200 tokens

---

## 🚀 Phase 2: Streaming 支援（可選）

### 技術方案
使用 Gemini `streamGenerateContent` API，返回 Server-Sent Events (SSE)

### 實作步驟

#### 1. 修改 geminiService.ts
```typescript
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
      generationConfig: { /* same as before */ },
    }),
  });

  return response.body!;
}
```

#### 2. 修改 analyzeController.ts
```typescript
async analyzeStream(requestData: AnalyzeRequest): Promise<ReadableStream> {
  const calculation = calculator.calculate(birthInfo);
  const markdown = formatToMarkdown(calculation, { excludeSteps: true });
  
  return this.geminiService.analyzeChartStream(markdown);
}
```

#### 3. 修改 analyzeRoutes.ts
```typescript
router.post('/analyze/stream', async (request, env) => {
  const stream = await controller.analyzeStream(requestData);
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});
```

### 前端整合（需配合）
```typescript
const eventSource = new EventSource('/api/v1/analyze/stream');
eventSource.onmessage = (event) => {
  const chunk = JSON.parse(event.data);
  appendToAnalysis(chunk.text);
};
```

**預期效果**:
- 首字節時間：~2-3 秒（vs 23-25 秒）
- 用戶體驗：即時反饋，減少等待焦慮
- 成本：相同（token 使用量不變）

---

## 📈 Phase 3: 性能監控（可選）

### 監控指標

#### 1. Token 使用量
```typescript
console.log('[Gemini] Token usage:', {
  prompt: usage.promptTokens,
  completion: usage.completionTokens,
  total: usage.totalTokens,
  cost: calculateCost(usage.totalTokens),
});
```

#### 2. 響應時間
```typescript
const startTime = Date.now();
const response = await this.callGemini(prompt);
const duration = Date.now() - startTime;

console.log('[Gemini] Response time:', duration, 'ms');
```

#### 3. 錯誤率
```typescript
try {
  return await this.callGemini(prompt);
} catch (error) {
  console.error('[Gemini] Error:', {
    attempt,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
  throw error;
}
```

### 實作方式
- 添加日誌到 geminiService.ts
- 可選：整合 Cloudflare Analytics
- 可選：導出到外部監控系統（Datadog, Sentry）

**預期效果**:
- 可觀測性提升
- 問題快速定位
- 成本追蹤

---

## 📋 實作優先級

| Phase | 優先級 | 預估時間 | 依賴 | 風險 |
|-------|--------|----------|------|------|
| Phase 1: Prompt 精簡 | 🔴 HIGH | 15-20 分鐘 | 無 | 極低 |
| Phase 2: Streaming | 🟡 MEDIUM | 15-20 分鐘 | 前端配合 | 低 |
| Phase 3: 監控 | 🟢 LOW | 5-10 分鐘 | 無 | 極低 |

---

## ✅ 驗收標準

### Phase 1
- [ ] Prompt tokens 減少 20-30%
- [ ] 輸出品質不降低（人工評估）
- [ ] 本地 API 測試通過

### Phase 2
- [ ] SSE 端點正常運作
- [ ] 首字節時間 < 5 秒
- [ ] 前端可正常接收串流

### Phase 3
- [ ] 日誌正常輸出
- [ ] 監控指標準確
- [ ] 無性能影響

---

## 🔄 Rollback 計劃

### Phase 1
```bash
git revert <commit-hash>
# 或手動還原 geminiService.ts 的 buildAnalysisPrompt 方法
```

### Phase 2
```bash
# 移除 /analyze/stream 端點
# 前端回退到 /analyze
```

### Phase 3
```bash
# 移除日誌代碼
# 或設置環境變數 ENABLE_MONITORING=false
```

---

## 📊 預期成果

### 成本節省
- 每次調用節省：~200 tokens
- 月調用量（假設 10,000 次）：節省 2M tokens
- 成本節省（Gemini Flash）：~$0.15/月

### 用戶體驗
- 等待時間感知：23-25 秒 → 2-3 秒（首字節）
- 互動性：無 → 即時反饋

### 可觀測性
- 問題定位時間：未知 → < 5 分鐘
- 成本追蹤：無 → 精確到每次調用
