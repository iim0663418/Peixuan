# 前端整合測試指南

## 🎯 測試目標

驗證 AI Streaming 功能的完整前端整合，包括：
- chartStore 狀態管理
- AIAnalysisView 組件
- EventSource SSE 串流
- Markdown 渲染
- 錯誤處理

## 🚀 測試環境

- **後端**: http://localhost:8787 (Cloudflare Workers)
- **前端**: http://localhost:5174 (Vite Dev Server)

## 📋 測試步驟

### Step 1: 訪問首頁並計算命盤

1. 打開瀏覽器訪問 http://localhost:5174
2. 填寫測試資料：
   - 出生日期：2000-01-01
   - 出生時間：12:00
   - 性別：男
   - 經度：121.5（可選）
3. 點擊「計算」按鈕
4. **驗證點**：
   - ✅ 計算結果正常顯示
   - ✅ chartId 已生成並保存到 chartStore
   - ✅ localStorage 中有 `peixuan_current_chart` 記錄

### Step 2: 檢查 AI 分析按鈕

1. 在 Navbar 中找到 AI 分析按鈕（🤖 圖標）
2. **驗證點**：
   - ✅ 按鈕可見且可點擊
   - ✅ 按鈕未被 disabled

### Step 3: 進入 AI 分析頁面

1. 點擊 AI 分析按鈕
2. **驗證點**：
   - ✅ 跳轉到 `/ai-analysis` 路由
   - ✅ 顯示載入狀態（spinner + 進度條）
   - ✅ 顯示「佩璇正在分析你的命盤...」

### Step 4: 驗證 SSE 串流接收

1. 觀察分析文本逐步顯示
2. **驗證點**：
   - ✅ 文本逐塊出現（打字機效果）
   - ✅ 進度條從 0% 增長到 95%
   - ✅ 游標閃爍效果正常
   - ✅ 響應時間約 18-25 秒

### Step 5: 驗證 Markdown 渲染

1. 等待分析完成
2. **驗證點**：
   - ✅ Markdown 格式正確渲染
   - ✅ 標題（###）正確顯示
   - ✅ 粗體（**文字**）正確顯示
   - ✅ 列表正確顯示
   - ✅ 佩璇風格保留（口語化、emoji、比喻）

### Step 6: 驗證功能按鈕

1. 測試「複製分析」按鈕
2. 測試「返回」按鈕
3. **驗證點**：
   - ✅ 複製功能正常（顯示「已複製！」提示）
   - ✅ 返回按鈕跳轉回結果頁面

### Step 7: 錯誤處理測試

#### 測試 7.1: 無 chartId 訪問
1. 清除 localStorage：`localStorage.clear()`
2. 直接訪問 http://localhost:5174/ai-analysis
3. **驗證點**：
   - ✅ 顯示錯誤提示「請先計算命盤」
   - ✅ 自動跳轉回首頁

#### 測試 7.2: 後端錯誤處理
1. 停止後端服務器
2. 嘗試 AI 分析
3. **驗證點**：
   - ✅ 顯示錯誤訊息
   - ✅ 提供重試選項

## 🔍 開發者工具檢查

### Console 檢查
打開瀏覽器開發者工具 Console，確認：
- ✅ 無 JavaScript 錯誤
- ✅ EventSource 連接成功
- ✅ SSE 事件正常接收

### Network 檢查
打開 Network 面板，確認：
- ✅ POST /api/v1/calculate 返回 200
- ✅ GET /api/v1/analyze/stream 返回 200
- ✅ EventStream 類型正確

### Application 檢查
打開 Application 面板，確認：
- ✅ localStorage 中有 `peixuan_current_chart`
- ✅ chartId 格式正確（UUID v4）

## ✅ 測試檢查清單

- [ ] Step 1: 命盤計算正常
- [ ] Step 2: AI 按鈕可見
- [ ] Step 3: 頁面跳轉正常
- [ ] Step 4: SSE 串流接收正常
- [ ] Step 5: Markdown 渲染正確
- [ ] Step 6: 功能按鈕正常
- [ ] Step 7.1: 無 chartId 錯誤處理
- [ ] Step 7.2: 後端錯誤處理
- [ ] Console 無錯誤
- [ ] Network 請求正常
- [ ] localStorage 狀態正確

## 🐛 常見問題

### 問題 1: AI 按鈕被 disabled
**原因**: chartStore 中無 chartId
**解決**: 重新計算命盤

### 問題 2: SSE 連接失敗
**原因**: 後端未啟動或 CORS 問題
**解決**: 確認後端運行在 http://localhost:8787

### 問題 3: Markdown 未渲染
**原因**: marked 依賴未安裝
**解決**: `cd bazi-app-vue && npm install marked`

### 問題 4: EventSource 錯誤
**原因**: chartId 無效或已過期
**解決**: 重新計算命盤獲取新 chartId

## 📊 預期結果

### 成功標準
- ✅ 所有測試步驟通過
- ✅ 無 Console 錯誤
- ✅ SSE 串流順暢
- ✅ Markdown 渲染正確
- ✅ 佩璇風格完整保留

### 性能指標
- 首次渲染：< 100ms
- SSE 首字節：< 3s
- 完整分析：18-25s
- Markdown 渲染：< 50ms

## 🎉 測試完成

完成所有測試後，請記錄：
1. 測試時間
2. 發現的問題
3. 性能數據
4. 用戶體驗反饋
