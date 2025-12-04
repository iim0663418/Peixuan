# Staging 環境設定指引

## 📋 概述

Staging 環境用於預發布測試，避免直接在生產環境測試新功能。

## 🚀 初次設定

### 1. 建立 Staging D1 資料庫

```bash
cd peixuan-worker
npx wrangler d1 create peixuan-db-staging
```

**輸出範例**:
```
✅ Successfully created DB 'peixuan-db-staging'!

[[d1_databases]]
binding = "DB"
database_name = "peixuan-db-staging"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. 更新 wrangler.jsonc

複製輸出的 `database_id`，更新 `peixuan-worker/wrangler.jsonc`:

```jsonc
"env": {
  "staging": {
    "d1_databases": [
      {
        "database_id": "貼上你的 database_id"  // ← 更新這裡
      }
    ]
  }
}
```

### 3. 執行資料庫遷移

```bash
cd peixuan-worker
npx wrangler d1 migrations apply peixuan-db-staging --env staging
```

### 4. 設定 GitHub Secrets

確保以下 Secrets 已設定（與 production 共用）:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 🔄 部署流程

### 自動部署（推薦）

1. 建立 `staging` 分支:
```bash
git checkout -b staging
```

2. 推送到 GitHub:
```bash
git push origin staging
```

3. GitHub Actions 自動觸發部署

### 手動部署

```bash
cd peixuan-worker
npm run build
npx wrangler deploy --env staging
```

## 🧪 測試

### 健康檢查

```bash
curl https://peixuan-worker-staging.csw30454.workers.dev/health
```

**預期輸出**:
```json
{"status":"ok"}
```

### 前端訪問

```
https://peixuan-worker-staging.csw30454.workers.dev/
```

## 📊 環境對比

| 項目 | Production | Staging |
|------|-----------|---------|
| Worker 名稱 | peixuan-worker | peixuan-worker-staging |
| D1 資料庫 | peixuan-db | peixuan-db-staging |
| 分支 | main | staging |
| URL | peixuan-worker.csw30454.workers.dev | peixuan-worker-staging.csw30454.workers.dev |

## ⚠️ 注意事項

1. **資料隔離**: Staging 與 Production 使用獨立資料庫
2. **測試優先**: 所有新功能先在 Staging 測試
3. **定期清理**: Staging 資料可定期清空
4. **環境變數**: GEMINI_API_KEY 等敏感資訊需分別設定

## 🔧 故障排除

### 問題: D1 資料庫未找到

**解決方案**: 確認 `database_id` 已正確更新到 wrangler.jsonc

### 問題: 部署失敗

**解決方案**: 
1. 檢查 GitHub Secrets 是否設定
2. 確認 D1 遷移已執行
3. 查看 GitHub Actions 日誌

### 問題: 前端 404

**解決方案**: 確認前端已構建並複製到 `peixuan-worker/public/`

## 📚 相關文件

- [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/)
- [Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 資料庫](https://developers.cloudflare.com/d1/)

---

**建立時間**: 2025-12-04  
**維護者**: Peixuan Team
