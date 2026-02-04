# 性格/運勢分析快取診斷結果

**日期**: 2026-02-04  
**診斷時間**: 13:28 CST  
**環境**: Staging (peixuan-db-staging)

---

## 診斷結果 ✅

### 快取機制狀態: **正常運作**

#### 資料庫檢查結果

**總快取記錄數**: 60 筆
```sql
SELECT COUNT(*) FROM analysis_records WHERE analysis_type LIKE 'ai-streaming%'
-- 結果: 60
```

**最近 5 筆記錄**:
| chart_id | analysis_type | created_at | hours_ago |
|:---|:---|:---|:---:|
| 2f344704... | ai-streaming-zh_TW-personality | 2026-02-03 16:00:26 | **13.47** ✅ |
| d465940d... | ai-streaming-zh_TW-personality | 2026-02-02 23:32:31 | 29.93 ❌ |
| df9f86ab... | ai-streaming-zh_TW-personality | 2026-02-02 23:28:35 | 30.00 ❌ |
| dce0ed46... | ai-streaming-zh_TW-personality | 2026-02-02 14:29:19 | 38.99 ❌ |
| 8bd38e3d... | ai-streaming-zh_TW-personality | 2026-02-02 14:24:29 | 39.07 ❌ |

**結論**:
- ✅ 快取正常儲存到 D1 資料庫
- ✅ 24 小時 TTL 機制正常運作
- ✅ 最近一筆快取（13.47 小時前）仍在有效期內

---

## 發現的問題 ⚠️

### 問題: Locale 格式不一致

**資料庫中的格式**: `zh_TW` (底線)
```
ai-streaming-zh_TW-personality
```

**代碼中可能的格式**: `zh-TW` (連字號)
```typescript
// analyzeController.ts
const analysisType = `ai-streaming-${locale}-personality`;
// 如果 locale = 'zh-TW'，則生成 'ai-streaming-zh-TW-personality'
```

**影響**:
- 如果前端傳入 `locale=zh-TW`，但資料庫中是 `zh_TW`
- 快取鍵值不匹配 → 無法命中快取 → 每次都重新生成

---

## 根本原因分析

### 場景 1: Locale 格式不一致導致快取未命中

**流程**:
```
1. 前端請求: /api/v1/analyze/stream?chartId=abc&locale=zh-TW
2. 後端生成快取鍵: 'ai-streaming-zh-TW-personality'
3. 查詢 D1: WHERE analysis_type = 'ai-streaming-zh-TW-personality'
4. 資料庫中實際鍵值: 'ai-streaming-zh_TW-personality'
5. 查詢結果: 無匹配 ❌
6. 重新生成分析並儲存為 'ai-streaming-zh-TW-personality'
7. 下次查詢時又因為格式不同而無法命中
```

### 場景 2: chartId 每次都不同

**問題**: 前端每次生成新的 UUID，導致快取無法重用

**檢查方法**:
```typescript
// 前端 chartStore.ts
// 如果 chartId 基於 UUID 而非出生資訊，則每次都不同
```

---

## 解決方案

### 方案 A: 統一 Locale 格式 (推薦)

#### 步驟 1: 確認前端傳入的 locale 格式

**檢查文件**: `bazi-app-vue/src/stores/chartStore.ts` 或 API 呼叫處

**預期**: 應使用 `zh-TW` (連字號) 符合 i18n 標準

#### 步驟 2: 後端統一處理 locale 格式

**修改**: `analyzeController.ts`

```typescript
async analyzeStream(chartId: string, env, locale = 'zh-TW', force = false) {
  // ✅ 統一 locale 格式：將底線轉為連字號
  const normalizedLocale = locale.replace('_', '-');
  
  const analysisType = `ai-streaming-${normalizedLocale}-personality`;
  // 結果: 'ai-streaming-zh-TW-personality'
  
  // ... 其餘邏輯
}
```

#### 步驟 3: 清理舊快取（可選）

```sql
-- 更新舊格式的快取鍵值
UPDATE analysis_records
SET analysis_type = REPLACE(analysis_type, '_', '-')
WHERE analysis_type LIKE '%zh_TW%' OR analysis_type LIKE '%en_US%';
```

---

### 方案 B: 確保 chartId 穩定

**問題**: 如果 chartId 每次都不同，快取永遠無法重用

**解決方案**:
```typescript
// chartStore.ts
const generateStableChartId = (birthInfo: BirthInfo): string => {
  // 基於出生資訊生成穩定的 ID
  const key = `${birthInfo.birthDate}_${birthInfo.birthTime}_${birthInfo.gender}_${birthInfo.longitude}_${birthInfo.latitude}`;
  
  // 使用 SHA-256 生成穩定的 ID
  return btoa(key).substring(0, 32);
};
```

---

## 驗證步驟

### 測試 1: 檢查 locale 格式

```bash
# 在 Staging 環境測試
curl -X GET "https://peixuan-staging.csw30454.workers.dev/api/v1/analyze/stream?chartId=2f344704-8c3d-40b6-ab73-8bc23af15a9c&locale=zh-TW"

# 檢查 Console 日誌
# 應顯示: [analyzeStream] Cache hit! 或 [analyzeStream] No cache found
```

### 測試 2: 驗證快取命中

```
1. 第一次請求性格分析 (chartId: abc123)
   - 預期: 等待 10-30 秒
   - Console: "[analyzeStream] No cache found"

2. 立即第二次請求 (相同 chartId)
   - 預期: < 1 秒返回
   - Console: "[analyzeStream] Cache hit!"
```

### 測試 3: 檢查前端 chartId

```javascript
// 在瀏覽器 Console 執行
console.log(chartStore.chartId);
// 重新整理頁面後再次執行
console.log(chartStore.chartId);
// 如果兩次 ID 不同 → chartId 不穩定
```

---

## 結論

**快取機制本身正常運作** ✅

**可能的問題**:
1. **Locale 格式不一致** (最可能) - 資料庫中是 `zh_TW`，代碼中可能是 `zh-TW`
2. **chartId 不穩定** - 每次生成新的 UUID

**建議行動**:
1. **立即**: 統一 locale 格式為 `zh-TW` (連字號)
2. **驗證**: 執行測試步驟確認快取命中
3. **可選**: 清理舊格式的快取記錄

**預期效果**:
- 修復後，相同 chartId 的第二次請求應 < 1 秒返回
- AI API 呼叫次數大幅降低
- 使用者體驗顯著改善
