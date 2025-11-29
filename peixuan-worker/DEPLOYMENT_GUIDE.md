# Cloudflare Workers 部署指南

## 前置準備

### 1. Cloudflare 帳號設定

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 取得 Account ID：
   - 進入 Workers & Pages
   - 右側可看到 Account ID
3. 建立 API Token：
   - 進入 My Profile > API Tokens
   - 點擊 "Create Token"
   - 使用 "Edit Cloudflare Workers" 模板
   - 權限需包含：
     - Account > Workers Scripts > Edit
     - Account > D1 > Edit

### 2. GitHub Secrets 設定

在 GitHub Repository 設定以下 Secrets：

```
Settings > Secrets and variables > Actions > New repository secret
```

需要設定的 Secrets：
- `CLOUDFLARE_API_TOKEN`: 從上述步驟取得的 API Token
- `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare Account ID

## 自動部署

推送到 `main` 分支時會自動觸發部署：

```bash
git add .
git commit -m "feat: update worker"
git push origin main
```

GitHub Actions 會自動執行：
1. 建置前端 (bazi-app-vue)
2. 複製資源到 worker
3. 套用 D1 遷移
4. 部署 Worker

## 手動部署

### 本地部署

```bash
# 1. 建置前端
cd bazi-app-vue
npm run build

# 2. 複製資源
cd ..
cp -r bazi-app-vue/dist/* peixuan-worker/public/

# 3. 部署 Worker
cd peixuan-worker
npm run deploy
```

### 開發環境測試

```bash
cd peixuan-worker
npm run dev
```

訪問 http://localhost:8787

## D1 資料庫管理

### 套用遷移

```bash
cd peixuan-worker
npm run db:push
```

### 查詢資料庫

```bash
npx wrangler d1 execute peixuan-db --remote --command "SELECT * FROM users LIMIT 10"
```

## 監控與除錯

### 查看日誌

```bash
npx wrangler tail
```

### 查看部署狀態

訪問 [Cloudflare Dashboard](https://dash.cloudflare.com/) > Workers & Pages

## 常見問題

### 1. 部署失敗：權限不足

確認 API Token 權限包含 Workers Scripts 和 D1 的編輯權限。

### 2. D1 遷移失敗

檢查 `wrangler.jsonc` 中的 `database_id` 是否正確。

### 3. 前端資源 404

確認 `public/` 目錄包含所有前端建置產物。

## 回滾

如需回滾到先前版本：

```bash
npx wrangler rollback
```
