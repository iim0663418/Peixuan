# KV 快取使用指南

## 概述

專案已整合快取層，支援兩種模式：
1. **記憶體快取**（預設）- 無需配置，Worker 重啟後清空
2. **KV 快取**（可選）- 持久化快取，跨 Worker 實例共享

## 快取策略

### 快取的內容
- ✅ 命盤列表查詢（GET /api/charts）
- ✅ 單一命盤查詢（GET /api/charts/:id）
- ✅ 分析列表查詢（GET /api/analyses）

### 快取 TTL
- 命盤列表：5 分鐘
- 單一命盤：10 分鐘
- 分析列表：5 分鐘

### 快取失效
- 新增命盤/分析時，自動清除相關用戶的列表快取
- 刪除命盤時，清除該命盤快取及列表快取

## 啟用 KV 快取

### 1. 建立 KV Namespace

```bash
cd peixuan-worker
npx wrangler kv:namespace create CACHE
```

輸出範例：
```
🌀 Creating namespace with title "peixuan-worker-CACHE"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "CACHE", id = "abc123..." }
```

### 2. 更新 wrangler.jsonc

取消註解並更新 KV namespace ID：

```jsonc
"kv_namespaces": [
  {
    "binding": "CACHE",
    "id": "your-kv-namespace-id-from-step-1"
  }
]
```

### 3. 部署

```bash
npm run deploy
```

## 監控快取效能

### 查看 KV 使用情況

在 Cloudflare Dashboard：
1. 進入 Workers & Pages
2. 選擇 KV
3. 查看 CACHE namespace 的讀寫統計

### 快取命中率

可以在 Worker 日誌中觀察：
- 快取命中：直接返回，無資料庫查詢
- 快取未命中：查詢資料庫並寫入快取

## 效能提升

### 預期改善
- **命盤列表查詢**：~50-80% 減少資料庫查詢
- **單一命盤查詢**：~70-90% 減少資料庫查詢
- **回應時間**：平均減少 20-50ms

### 成本考量
- 記憶體快取：免費，但不持久
- KV 快取：
  - 讀取：前 1000 萬次/月免費
  - 寫入：前 100 萬次/月免費
  - 儲存：前 1GB 免費

## 故障排除

### 快取未生效

1. 檢查 wrangler.jsonc 配置
2. 確認 KV namespace 已建立
3. 查看 Worker 日誌是否有錯誤

### 快取資料過期

手動清除 KV namespace：
```bash
npx wrangler kv:key delete --binding CACHE "key-name"
```

或清空整個 namespace（謹慎使用）：
```bash
# 列出所有 key
npx wrangler kv:key list --binding CACHE

# 逐一刪除
```

## 最佳實踐

1. **開發環境**：使用記憶體快取（預設）
2. **生產環境**：啟用 KV 快取
3. **監控**：定期檢查快取命中率
4. **調整 TTL**：根據實際使用情況調整 `CacheTTL` 值

## 進階配置

### 自訂 TTL

編輯 `src/services/cacheService.ts`：

```typescript
export const CacheTTL = {
  chartList: 600,      // 改為 10 分鐘
  chart: 1800,         // 改為 30 分鐘
  analysisList: 300,   // 保持 5 分鐘
};
```

### 禁用快取

如需暫時禁用快取，在 `wrangler.jsonc` 中註解掉 `kv_namespaces` 即可。
Worker 會自動 fallback 到記憶體快取。
