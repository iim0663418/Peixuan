# 專案遷移計畫：從 Docker 到 Cloudflare Workers & D1

**文件版本**: 3.1  
**日期**: 2025-11-29  
**狀態**: Drizzle Schema 已完成並產出遷移檔，準備套用到遠端 D1；Workers PoC 已跑通。

## 1. 執行摘要

- 目標將現有 `docker-compose` 架構（PostgreSQL、Redis、Express、Vue）收斂為單一 **Cloudflare Worker**，以 **D1 + KV** 取代資料庫與快取，搭配 **Drizzle ORM** 管理 Schema 與查詢。
- `peixuan-worker` 已建立並完成 D1 + Drizzle CRUD PoC；核心資料表（users、chart_records、analysis_records）已轉為 Drizzle Schema 並生成遷移 SQL。
- 遷移策略：先鎖定資料層與部署管線，之後逐步搬移 API、快取與前端靜態資源，最終以 GitHub Actions + `wrangler deploy` 做一鍵發佈。

## 2. 範疇與約束

- 必須落在 Cloudflare Workers 生態系（Workers + D1 + KV），並保持資料庫非公網暴露、完全託管。
- 功能範疇涵蓋既有後端 API、資料庫、快取與前端靜態資源；資料一次性從 PostgreSQL 匯出並匯入 D1。
- 併發寫入與 SQL 方言差異需在切換前驗證；部署需由 CI/CD 管控（不可手動散落腳本）。

## 3. 目標架構概覽

- **Compute**: 單一 `peixuan-worker`，以 `@cloudflare/kv-asset-handler` 提供前端靜態資源並處理 API 路由。
- **Data**: D1（Drizzle 管理 Schema + 查詢），KV 作為快取層；後續可視需要接入 Queues / R2。
- **Delivery**: GitHub Actions 使用 `cloudflare/wrangler-action`；Secrets 管理 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

## 4. 工作分解與狀態

### A. 基礎與 PoC（已完成）
- [x] 建立 `peixuan-worker` 專案並配置 `wrangler.jsonc` 的 `[site]` 與 `d1_databases`。
- [x] 建立 `public/` 以提供靜態檔；完成 D1 + Drizzle CRUD PoC。
- [x] 以 Drizzle 定義 `users`、`chart_records`、`analysis_records`，生成遷移檔 `drizzle/0000_*`、`0001_*`。

### B. D1 Schema 與資料遷移
- [ ] 執行 `npm run db:push`，將最新 Schema 套用到遠端 D1，確認 `chart_records`、`analysis_records` 已建置。
- [ ] 撰寫 PostgreSQL 匯出腳本（含 JSON/UUID 轉換），並定義資料檢查點。
- [ ] 撰寫 D1 匯入腳本（批次處理、重試與資料驗證）。
- [ ] 整理 cut-over / rollback 計畫（停機窗口、行數比對、抽樣校驗）。

### C. 後端 API 與快取遷移
- [ ] 將 `backend-node` 中與 `ChartRecord`、`AnalysisRecord` 相關的 API 轉寫至 `peixuan-worker/src`，改用 Drizzle 查詢。
- [ ] 將 Redis / in-memory 快取重構為 KV，重新定義快取 key 與 TTL。
- [ ] 移除不再需要的 Express 套件（`express-rate-limit`、`swagger-ui-express` 等），改以 Cloudflare 平台功能或靜態文件提供。

### D. 前端整合與驗證
- [ ] 在根 `package.json` 加入建置指令：建置 `bazi-app-vue` 並將 `dist` 複製到 `peixuan-worker/public`。
- [ ] 使用 `npx wrangler dev --remote` 進行端到端驗證（API + 靜態資源 + D1）。

### E. CI/CD 與部署
- [ ] 建立 GitHub Actions Workflow（`cloudflare/wrangler-action`），串起前端建置、資源複製與 `wrangler deploy`。
- [ ] 設定 Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`，並驗證最小權限。

## 5. 主要風險與緩解

1. **SQL 方言差異（PostgreSQL → SQLite/D1）**  
   - 逐一審查原生查詢；為複雜查詢補端到端測試與資料比對。
2. **D1 單寫入者性能瓶頸**  
   - 上線前壓測寫入熱點，必要時以 Queues 解耦，或調整寫入批次。
3. **快取一致性與失效策略**  
   - 明確定義 KV key/TTL；對重要路由加快取命中率監控與 fallback。

## 6. 立即下一步

- 在遠端 D1 執行 `npm run db:push`，落地 `chart_records`、`analysis_records` 表。
- 規劃 PostgreSQL 匯出與 D1 匯入腳本（含轉換與驗證流程），確認 cut-over 時序。
- 列出需優先遷移的 API 端點清單，並對應 Drizzle 查詢與 KV 快取策略。
