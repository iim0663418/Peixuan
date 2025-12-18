# Staging 環境設定指引

## 📋 概述

本專案採用 **雲端優先開發模式 (Cloud-First Development)**，所有開發和測試都在雲端 Staging 環境進行。

### 為什麼不使用本地開發伺服器？

**安全考量**:
- esbuild <=0.24.2 存在 CSRF 漏洞 (GHSA-67mh-4wv8-2f99)
- 本地開發伺服器可能被惡意網站攻擊並讀取響應
- 透過完全移除本地開發環境，消除此攻擊面

**其他優勢**:
- 開發環境與生產環境完全一致
- 避免「在我機器上可以運行」的問題
- 簡化開發流程，減少本地環境配置

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

## 🔄 雲端優先開發工作流程

### 步驟 1: 本地開發（僅編碼和單元測試）

```bash
# 在本地編輯程式碼
# 運行單元測試（不啟動伺服器）
cd peixuan-worker
npm run test

cd ../bazi-app-vue
npm run test
```

**注意**: 不要嘗試運行 `npm run dev` 或 `wrangler dev`，這些指令已被移除。

### 步驟 2: 部署到 Staging 進行整合測試

#### 後端部署
```bash
cd peixuan-worker
npm run deploy:staging
```

#### 前端部署（如有變更）
```bash
cd bazi-app-vue
npm run build
cp -r dist/* ../peixuan-worker/public/
cd ../peixuan-worker
npm run deploy:staging
```

### 步驟 3: 在 Staging 環境測試

1. 開啟瀏覽器訪問 Staging URL
2. 執行完整的使用者流程測試
3. 使用開發者工具檢查網絡請求和錯誤

### 步驟 4: 確認無誤後部署到 Production

```bash
cd peixuan-worker
npm run deploy:production
```

### 自動部署（GitHub Actions）

推送到對應分支會自動觸發部署：
- `staging` 分支 → Staging 環境
- `main` 分支 → Production 環境

```bash
# 推送到 Staging
git checkout staging
git merge feature/your-feature
git push origin staging

# 推送到 Production
git checkout main
git merge staging
git push origin main
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

## ⚠️ 重要注意事項

### 開發限制
1. **禁止本地開發伺服器**: `npm run dev` 和 `wrangler dev` 已被移除
2. **僅本地單元測試**: 只能運行 `npm run test`（不啟動伺服器）
3. **必須雲端測試**: 整合測試必須在 Staging 環境進行

### 環境管理
1. **資料隔離**: Staging 與 Production 使用獨立的 D1 資料庫
2. **測試優先**: 所有新功能必須先在 Staging 測試通過
3. **定期清理**: Staging 資料可定期清空，不影響 Production
4. **環境變數**: GEMINI_API_KEY 等敏感資訊需在 Cloudflare Workers 分別設定

### 安全最佳實踐
1. **永不跳過 Staging**: 即使是小改動也要先部署到 Staging 測試
2. **檢查依賴更新**: 運行 `npm audit` 檢查安全漏洞
3. **審查部署日誌**: 透過 Cloudflare Dashboard 監控 Worker 日誌

## 🔧 故障排除

### 問題: 嘗試運行 `npm run dev` 但指令不存在

**原因**: 為了安全考量，本專案已移除所有本地開發伺服器指令

**解決方案**:
1. 本地只運行單元測試: `npm run test`
2. 整合測試使用 Staging 環境: `npm run deploy:staging`

### 問題: D1 資料庫未找到

**解決方案**: 確認 `database_id` 已正確更新到 `wrangler.jsonc`

### 問題: 部署失敗

**解決方案**:
1. 檢查 GitHub Secrets 是否設定 (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
2. 確認 D1 遷移已執行: `npm run db:migrate:staging`
3. 查看 Wrangler 部署日誌: `wrangler tail --env staging`

### 問題: 前端 404

**解決方案**: 確認前端已構建並複製到 `peixuan-worker/public/`
```bash
cd bazi-app-vue
npm run build
cp -r dist/* ../peixuan-worker/public/
```

### 問題: Staging 環境行為異常

**解決方案**:
1. 查看 Cloudflare Dashboard 的 Worker 日誌
2. 回滾至已知良好的版本: `wrangler rollback --env staging`
3. 檢查 D1 資料庫內容: `wrangler d1 execute peixuan-db-staging --command "SELECT * FROM ..."`

## 📚 相關文件

- [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/)
- [Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 資料庫](https://developers.cloudflare.com/d1/)
- [專案 README](../README.md)
- [安全風險評估](SECURITY_RISK_ASSESSMENT.md)

---

## 📝 總結

### 雲端優先開發的優勢

1. **安全性**: 完全消除 esbuild CSRF 漏洞風險
2. **一致性**: 開發環境與生產環境完全相同
3. **簡單性**: 無需配置複雜的本地環境
4. **可靠性**: 避免「在我機器上可以運行」的問題

### 開發流程回顧

```
本地編碼 → 單元測試 → 部署 Staging → 整合測試 → 部署 Production
   ↓           ↓            ↓              ↓              ↓
 IDE        npm test    wrangler       瀏覽器測試    wrangler
                       deploy:staging                deploy:production
```

### 快速參考指令

```bash
# 本地測試
npm run test

# 部署到 Staging
npm run deploy:staging

# 部署到 Production
npm run deploy:production

# 資料庫遷移
npm run db:migrate:staging
npm run db:migrate:production

# 查看日誌
wrangler tail --env staging
```

---

**建立時間**: 2025-12-04
**最後更新**: 2025-12-18 (改為雲端優先開發模式)
**維護者**: Peixuan Team
