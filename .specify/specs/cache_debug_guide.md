# 快取問題除錯指南

**版本**: ba6f05f0-324f-4bc8-ab3d-bbabc7e5a3c1  
**環境**: Staging  
**日期**: 2026-02-04

---

## 測試步驟

### 步驟 1: 清除瀏覽器快取

1. 打開 Chrome DevTools (F12)
2. 右鍵點擊重新整理按鈕
3. 選擇「清除快取並強制重新整理」

### 步驟 2: 第一次請求（生成新分析）

1. 進入性格分析頁面
2. 打開 DevTools Console
3. 點擊「開始分析」
4. **記錄 chartId**: 在 Console 中應該看到類似：
   ```
   [analyzeStream] Entry, chartId: abc123..., locale: zh-TW
   ```
5. **預期行為**: 等待 10-30 秒，看到分析結果

### 步驟 3: 立即第二次請求（應命中快取）

1. **不要重新整理頁面**
2. 點擊「重新分析」或返回首頁重新提交
3. **使用相同的出生資訊**
4. **預期行為**: < 1 秒返回結果

### 步驟 4: 檢查 Console 日誌

**第一次請求應顯示**:
```
[analyzeStream] Entry, chartId: abc123, locale: zh-TW
[analyzeStream] No cache found
[analyzeStream] fullText length: 1234
[analyzeStream] Saving to cache, chartId: abc123, analysisType: ai-streaming-zh-TW-personality
[analyzeStream] Cache saved successfully
```

**第二次請求應顯示**:
```
[analyzeStream] Entry, chartId: abc123, locale: zh-TW
[analyzeStream] Cache hit! Returning cached analysis
```

---

## 可能的問題

### 問題 1: chartId 每次都不同

**症狀**: Console 顯示不同的 chartId

**原因**: 前端每次生成新的 UUID

**檢查方法**:
```javascript
// 在瀏覽器 Console 執行
console.log('chartId:', chartStore.chartId);
// 重新提交後再次執行
console.log('chartId:', chartStore.chartId);
// 如果兩次不同 → chartId 不穩定
```

### 問題 2: fullText 為空

**症狀**: Console 顯示 `fullText is empty, cache not saved`

**原因**: AI 串流處理失敗

**檢查方法**: 查看是否有錯誤日誌

### 問題 3: 快取儲存失敗

**症狀**: Console 顯示 `Saving to cache` 但沒有 `Cache saved successfully`

**原因**: D1 寫入失敗

**檢查方法**: 查看是否有 D1 錯誤日誌

---

## 檢查 D1 資料庫

```bash
# 檢查最近 10 分鐘的快取記錄
wrangler d1 execute peixuan-db-staging --env staging --remote --command "
SELECT 
  chart_id, 
  analysis_type, 
  created_at,
  LENGTH(result) as result_length
FROM analysis_records 
WHERE created_at > datetime('now', '-10 minutes')
ORDER BY created_at DESC
"
```

---

## 回報資訊

請提供以下資訊：

1. **chartId**: 從 Console 複製
2. **Console 日誌**: 完整的 `[analyzeStream]` 日誌
3. **是否看到快取訊息**: `Cache hit!` 或 `No cache found`
4. **第二次請求時間**: 是否 < 1 秒
5. **D1 查詢結果**: 是否有新記錄

---

## 預期結果

**正常情況**:
- 第一次: 10-30 秒，Console 顯示 `Cache saved successfully`
- 第二次: < 1 秒，Console 顯示 `Cache hit!`
- D1: 有新記錄，`analysis_type = 'ai-streaming-zh-TW-personality'`

**異常情況**:
- 第二次仍需 10-30 秒 → 快取未命中
- Console 無 `Cache saved successfully` → 儲存失敗
- D1 無新記錄 → 寫入失敗
