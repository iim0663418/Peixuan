# Gemini AI 整合計劃

## 目標
整合 Google Gemini AI，提供命理分析的 AI 解讀功能。

## API 資訊
- **Model**: gemini-2.5-flash
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash
- **API Key**: AIzaSyBJqsHMRDVul3oxgw_PuOznY9Wi3I1XFq8

## 實作方案

### Phase 1: Gemini 服務封裝 (1-2h)
1. 創建 `src/services/geminiService.ts`
2. 實作 `analyzeChart(markdown: string): Promise<string>`
3. 使用 fetch API（Cloudflare Workers 原生支援）
4. 錯誤處理與重試機制

### Phase 2: API 端點整合 (1h)
1. 新增 `/api/v1/analyze` 端點
2. 接收計算結果，轉換為 Markdown
3. 調用 Gemini 分析
4. 返回 AI 解讀結果

### Phase 3: Prompt 工程 (1-2h)
1. 設計專業命理分析 Prompt
2. 包含：
   - 角色定位（專業命理師）
   - 分析重點（性格、運勢、建議）
   - 輸出格式（結構化、易讀）
3. 測試與優化

### Phase 4: 安全性與配置 (1h)
1. API Key 存入環境變數
2. 速率限制
3. 錯誤處理
4. 日誌記錄

## API 設計

### 請求
```
POST /api/v1/analyze
{
  "birthDate": "2000-01-01",
  "birthTime": "12:00",
  "gender": "male",
  "longitude": 121.5
}
```

### 回應
```json
{
  "calculation": { ... },
  "aiAnalysis": "AI 生成的命理分析文本"
}
```

## 預估時間
- Phase 1: 1-2h
- Phase 2: 1h
- Phase 3: 1-2h
- Phase 4: 1h
- 總計: 4-6h

## 安全考量
- ⚠️ API Key 不應硬編碼
- ⚠️ 需要速率限制防止濫用
- ⚠️ 錯誤訊息不應洩露敏感資訊
