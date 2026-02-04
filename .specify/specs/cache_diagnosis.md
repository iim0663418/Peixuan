# 性格/運勢分析快取問題診斷報告

**日期**: 2026-02-04  
**問題**: 性格/運勢分析沒有 24 小時快取機制  
**影響**: 每次請求都重新生成分析，浪費 AI API 配額

---

## 問題分析

### 1. 快取機制現狀

#### ✅ 快取服務已實作
**AnalysisCacheService** (analysisCacheService.ts):
```typescript
async getAnalysis(chartId: string, analysisType: string, env): Promise<AnalysisRecord | null> {
  // ... 查詢邏輯
  
  // ✅ 檢查 24 小時過期
  if (result[0]) {
    const createdAt = new Date(result[0].createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return result[0]; // ✅ 返回快取
    }
  }

  return null;
}

async saveAnalysis(chartId, analysisType, result, env): Promise<void> {
  // ✅ 儲存分析結果到 D1
  await db.insert(analysisRecords).values(newAnalysis);
}
```

**結論**: 快取服務本身功能正常，有 24 小時 TTL 檢查。

---

### 2. 核心問題：每日一致性策略覆蓋快取邏輯

#### ❌ 問題代碼 (analyzeController.ts L186-195)

```typescript
async analyzeStream(chartId: string, env, locale = 'zh-TW', force = false): Promise<ReadableStream> {
  // ...
  
  // Step 0: Check analysis cache first (Daily Consistency Policy - always check cache)
  const cachedAnalysis = await analysisCacheService.getAnalysis(chartId, analysisType, env);

  if (cachedAnalysis) {
    if (force) {
      console.log('[analyzeStream] Force refresh requested but ignored due to Daily Consistency Policy');
      // ❌ 即使 force=true 也忽略，強制使用快取
    } else {
      console.log('[analyzeStream] Cache hit! Returning cached analysis');
    }
    await sendCachedAnalysis(cachedAnalysis, controller, encoder, force);
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
    return; // ✅ 返回快取
  }

  // 如果沒有快取，才生成新分析
  // ...
}
```

**問題**:
1. ✅ **快取邏輯正常運作**: 如果有快取且未過期（< 24 小時），會返回快取
2. ✅ **每日一致性策略**: 忽略 `force` 參數，確保同一天內分析結果一致
3. ❌ **誤解**: 用戶認為「沒有快取」，但實際上**快取機制正常運作**

---

### 3. 驗證快取是否真的存在

#### 檢查點 1: 資料庫 Schema

**analysis_records 表** (db/schema.ts):
```typescript
export const analysisRecords = sqliteTable('analysis_records', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  chartId: text('chart_id').notNull(),
  analysisType: text('analysis_type').notNull(), // 'ai-streaming-zh-TW-personality'
  result: text('result', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
});
```

**快取鍵值格式**:
- 性格分析: `ai-streaming-${locale}-personality`
- 運勢分析: `ai-advanced-${locale}-fortune`

#### 檢查點 2: 快取儲存邏輯

**analyzeController.ts L233-240**:
```typescript
// Step 4: Process AI stream
const fullText = await self.processAIStream(aiStream, metadata.provider, controller, '[analyzeStream]');

// ✅ 儲存到快取
if (fullText) {
  await analysisCacheService.saveAnalysis(
    chartId,
    analysisType, // 'ai-streaming-zh-TW-personality'
    { text: fullText },
    env
  );
}
```

**結論**: 快取儲存邏輯正常。

---

## 可能的原因

### 原因 1: 快取未正確儲存 ❓

**檢查方法**:
```sql
-- 在 Staging D1 資料庫執行
SELECT 
  id,
  chartId,
  analysisType,
  createdAt,
  LENGTH(result) as result_length
FROM analysis_records
WHERE analysisType LIKE 'ai-streaming%'
ORDER BY createdAt DESC
LIMIT 10;
```

**預期結果**:
- 如果有記錄 → 快取正常儲存
- 如果沒有記錄 → 快取儲存失敗

### 原因 2: chartId 不一致 ❓

**問題**: 前端每次生成新的 chartId，導致快取無法命中

**檢查方法**:
```typescript
// 前端 chartStore.ts
const chartId = computed(() => {
  // 檢查是否每次都生成新的 UUID
  // 應該基於出生資訊生成穩定的 chartId
});
```

### 原因 3: analysisType 不匹配 ❓

**問題**: 快取鍵值格式變更，導致舊快取無法命中

**檢查方法**:
```typescript
// 確認 analysisType 格式
const analysisType = `ai-streaming-${locale}-personality`;
// 應為: 'ai-streaming-zh-TW-personality' 或 'ai-streaming-en-personality'
```

### 原因 4: 24 小時已過期 ⏰

**問題**: 快取已超過 24 小時，自動失效

**檢查方法**:
```sql
SELECT 
  chartId,
  analysisType,
  createdAt,
  ROUND((JULIANDAY('now') - JULIANDAY(createdAt)) * 24, 2) as hours_ago
FROM analysis_records
WHERE analysisType LIKE 'ai-streaming%'
ORDER BY createdAt DESC
LIMIT 10;
```

---

## 診斷步驟

### Step 1: 檢查 D1 資料庫

```bash
# 連接到 Staging D1
wrangler d1 execute peixuan-db-staging --command "SELECT COUNT(*) as total FROM analysis_records WHERE analysisType LIKE 'ai-streaming%'"

# 查看最近的快取記錄
wrangler d1 execute peixuan-db-staging --command "SELECT chartId, analysisType, createdAt FROM analysis_records WHERE analysisType LIKE 'ai-streaming%' ORDER BY createdAt DESC LIMIT 5"
```

### Step 2: 檢查前端 chartId 生成邏輯

```typescript
// bazi-app-vue/src/stores/chartStore.ts
// 確認 chartId 是否穩定
```

### Step 3: 測試快取命中

1. 第一次請求性格分析 → 應生成新分析
2. 立即第二次請求 → 應返回快取（< 1 秒）
3. 檢查 Network 面板 → 第二次請求應顯示 "Cache hit!"

---

## 預期行為 vs 實際行為

### 預期行為 ✅

```
第一次請求 (chartId: abc123, locale: zh-TW):
1. 檢查快取 → 無快取
2. 生成新分析 (耗時 10-30 秒)
3. 儲存到 D1: analysis_records
   - chartId: abc123
   - analysisType: 'ai-streaming-zh-TW-personality'
   - result: { text: "..." }
   - createdAt: 2026-02-04T13:00:00Z

第二次請求 (相同 chartId, 24 小時內):
1. 檢查快取 → 命中！
2. 返回快取結果 (< 1 秒)
3. 不呼叫 AI API
```

### 實際行為 ❓

**需要用戶確認**:
- 每次請求都需要等待 10-30 秒？
- 還是第二次請求很快返回？

---

## 解決方案

### 方案 A: 如果快取正常運作（最可能）

**結論**: 快取機制已正常運作，用戶可能誤解了行為。

**驗證方法**:
1. 第一次請求性格分析 → 等待 10-30 秒
2. 立即第二次請求 → 應 < 1 秒返回
3. 如果第二次很快 → 快取正常

### 方案 B: 如果 chartId 不穩定

**問題**: 前端每次生成新的 chartId

**解決方案**:
```typescript
// chartStore.ts
const generateStableChartId = (birthInfo: BirthInfo): string => {
  // 基於出生資訊生成穩定的 ID
  const key = `${birthInfo.birthDate}_${birthInfo.birthTime}_${birthInfo.gender}_${birthInfo.longitude}`;
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
    .then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32)
    );
};
```

### 方案 C: 如果快取儲存失敗

**問題**: D1 寫入失敗

**解決方案**:
```typescript
// analyzeController.ts
if (fullText) {
  try {
    await analysisCacheService.saveAnalysis(chartId, analysisType, { text: fullText }, env);
    console.log('[analyzeStream] Cache saved successfully');
  } catch (error) {
    console.error('[analyzeStream] Failed to save cache:', error);
    // 不阻塞回應，僅記錄錯誤
  }
}
```

---

## 建議行動

### 立即執行

1. **檢查 D1 資料庫**:
   ```bash
   wrangler d1 execute peixuan-db-staging --command "SELECT COUNT(*) FROM analysis_records WHERE analysisType LIKE 'ai-streaming%'"
   ```

2. **測試快取命中**:
   - 在 Staging 環境進行兩次相同的性格分析請求
   - 觀察第二次請求是否 < 1 秒返回

3. **檢查前端 chartId**:
   - 打開瀏覽器 DevTools Console
   - 查看 `chartStore.chartId` 是否每次都不同

### 如果快取正常

- 向用戶說明快取機制已正常運作
- 第二次請求應該很快返回

### 如果快取失效

- 根據診斷結果實施對應的解決方案

---

## 結論

**核心發現**: 
- ✅ 快取服務代碼正常
- ✅ 24 小時 TTL 邏輯正確
- ✅ 每日一致性策略正常運作
- ❓ 需要驗證實際運行狀態

**下一步**: 執行診斷步驟，確認快取是否真的失效。
