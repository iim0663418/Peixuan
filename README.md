# 佩璇 (Peixuan) - 智慧命理分析平台

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue.js-3.5-4FC08D.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)
![Gemini](https://img.shields.io/badge/Gemini-3.0%20Flash-4285F4.svg)

> **結合傳統智慧與現代 AI 科技的命理分析平台**

佩璇 (Peixuan) 是一個現代化的智慧命理分析平台，融合傳統中國命理學（八字四柱、紫微斗數）與先進的生成式 AI 技術 (Google Gemini)，透過 Cloudflare Workers 邊緣運算架構，為用戶提供快速、精準且富有洞察力的命運分析。

## 🆕 最新更新 (v1.3.0 - 2026年1月)

### 🎨 前端 Glassmorphism 2.0 完整重構
- **4 大頁面全面升級**: HomeView, DailyQuestionView, UnifiedView, UnifiedAIAnalysisView
- **設計系統統一**: 使用 design-tokens.css 變數，確保視覺一致性
- **Glassmorphism 效果**: blur 24px, saturate 180%, 深度陰影系統
- **響應式設計**: 完整適配桌面 (1200px+)、平板 (768-1024px)、手機 (<768px)
- **深色模式完善**: 所有組件完整適配，WCAG AA 對比度合規

### 📝 Markdown 排版系統 (2026 最佳實踐)
- **基礎排版**: 18px 字體, 1.8 行高, 65ch 最佳閱讀寬度
- **段落系統**: 1.5em 間距, WCAG 合規
- **標題層級**: H1-H3 紫色主題, 清晰視覺層級
- **列表樣式**: 紫色標記, 2em 縮排, 0.5em 項目間距
- **引用區塊**: 左邊框 + 半透明背景 + 圓角設計
- **代碼區塊**: 行內/區塊樣式, 語法高亮支援
- **連結樣式**: hover 光暈效果, 0.2s 過渡動畫
- **粗體文字特效**: 3 層 text-shadow 光暈, 紫色主題, 1.05em 放大

### 🌙 深色模式系統完整修復 (v1.2.2 延續)
- **CSS 變數語法修復**: 修正 `design-tokens.css` 中的 CSS 選擇器語法錯誤
- **選擇器統一**: 18個文件統一使用 `html.dark` 選擇器，確保一致性
- **Element Plus 整合**: 完全相容 Element Plus 官方深色模式標準
- **測試驗證**: 623個測試全部通過，無回歸風險

### 🎨 主題切換系統優化
- **雙重觸發機制**: 保持 `html.dark` 類別 + `data-theme` 屬性向後相容
- **視覺一致性**: 所有組件在深色/淺色模式下表現統一
- **性能優化**: 移除冗餘選擇器，提升主題切換效率
- **生產就緒**: 系統穩定，準備部署

### 🔧 代碼品質提升 (v1.2.1 延續)
- **AppFooter & AppHeader 重構**: 100% CSS 變數整合，統一品牌色彩系統
- **Markdown 渲染統一**: 創建統一工具，消除重複配置
- **響應式佈局**: 修復桌面版語言選擇器邊界問題
- **無障礙改善**: SVG 圖標添加適當的 aria 屬性

---

## 📋 v1.2.0 核心功能 (已實現)

### 🧠 LLM 記憶模組 (LLM Memory Module)
- **上下文感知**: 透過 Context Injection 技術記憶用戶之前的對話與分析歷史，提供連貫的諮詢體驗
- **跨引擎同步**: 確保 Gemini 與 Azure OpenAI 雙引擎共享相同的歷史上下文，切換無感
- **記憶指示器**: 在聊天介面即時顯示「記憶已載入」狀態，增加 AI 互動的透明度
- **偏好學習**: 自動記錄用戶的命理關注點，讓 AI 分析隨對話深度不斷進化

### 🎯 每日一問 AI 助手 (Agentic AI)
- **智慧對話系統**: 基於 ReAct 模式的 Agentic AI，支援自然語言命理諮詢
- **Function Calling**: 整合 5 個專業工具（命盤查詢、流年分析、能量解讀等）
- **雙 AI 引擎備援**: Gemini + Azure OpenAI 備援機制，確保服務高可用性
- **Smooth Streaming**: 移除人工打字機延遲，採用 SSE 自然分塊技術提升文字輸出流暢度

### 📝 Markdown 渲染系統統一
- **一致性視覺**: 建立統一的 `markdown.ts` 工具，確保分析報告與聊天內容渲染風格完全一致
- **增強排版樣式**: 優化 **粗體文字** 對比度，完整支援響應式表格與精美代碼區塊
- **關鍵字高亮**: 自動識別命理關鍵術語（如十神、主星、化星等）並進行視覺增強
- **性能優化**: 集中化 `marked` 配置，大幅提升前端渲染效率與安全性

### 🎨 前端增強與 UX 優化
- **漸進式揭露**: 智慧摺疊技術細節（如四化匯總、技術參數），優先展示敘事化分析內容
- **骨架屏 (Skeleton Screens)**: 使用 `AnalysisSkeleton` 替代傳統載入動畫，提升體感載入速度
- **快取指示器**: 顯示分析結果產生時間，並支援一鍵重新分析，增強用戶控制感
- **BaziChart 移動端優化**: 在行動裝置仍能保持專業的四柱佈局，並優化觸控互動

### 📱 全面響應式設計 (RWD 1.2)
- **行動裝置優先**: 完整的 RWD 適配，支援從 320px 到 4K 的所有設備尺寸
- **觸控體驗優化**: 確保所有點擊目標不小於 44px，提升行動端操作精確度
- **動畫性能修復**: 解決 iOS Safari 硬體加速問題，完整支援 `prefers-reduced-motion`

### 🏗️ 基礎設施與品質提升
- **AppFooter & AppHeader 優化**: 全面整合 CSS 變數，統一品牌色彩一致性與無障礙標準
- **API 韌性增強**: 完善的 503/429 指數退避重試機制與 45s 超時保護
- **代碼品質優化**: 大幅清理 ESLint 錯誤 (下降 88.9%)，完成安全性審計與 Secret 洩漏掃描

## 🌟 核心特色

### 🔮 雙系統命理引擎
- **八字四柱 (BaZi/四柱八字)**:
  - 精準計算四柱八字、藏干、十神、納音、五行能量分佈
  - 支援真太陽時校正（經度補償 + 均時差調整）
  - 符合傳統命理學計算標準

- **紫微斗數 (ZiWei DouShu/紫微斗數)**:
  - 完整十二宮位排盤系統
  - 108 顆星曜安星邏輯（主星、輔星、煞星、化星）
  - 四化飛星系統（生年四化 + 大限四化 + 流年四化）
  - 大限、流年運程分析

- **統一計算核心**:
  - 後端 `UnifiedCalculator` 提供單一真值來源 (Single Source of Truth)
  - 確保前後端數據一致性，避免計算偏差

### 🤖 AI 智慧分析 (Powered by Google Gemini)
- **Gemini 3.0 Flash Preview 整合**:
  - 使用最新 Gemini 3.0 Flash Preview 模型
  - 專為命理分析優化的系統提示詞 (System Prompt)
  - 支援繁體中文深度語義理解

- **雙模式 AI 分析**:
  - **性格分析 (佩璇模式)**: 結合八字十神與紫微主星，提供溫暖、口語化的個性深層解讀
  - **運勢分析 (佩璇模式)**: 專注流年運勢、四化能量流向與星曜對稱性，預測關鍵機遇與挑戰

- **即時串流體驗**:
  - Server-Sent Events (SSE) 技術實現打字機效果
  - 無需等待完整回應，即時顯示分析內容

- **智慧快取機制**:
  - 基於 Cloudflare D1 的多層快取策略
  - 相同命盤直接讀取快取，大幅降低 API 呼叫成本
  - 降低 AI 分析延遲，提升使用者體驗

### 🎯 每日一問智慧助手
- **Agentic AI 系統**:
  - 基於 ReAct 模式的智慧代理，支援自然語言命理諮詢
  - Function Calling 整合 5 個專業工具（命盤查詢、流年分析、能量解讀等）
  - 雙 AI 引擎備援（Gemini + Azure OpenAI）確保服務穩定性

- **智慧對話體驗**:
  - 漸進式聊天介面，支援打字機效果和思考過程展示
  - 每日限制保護機制，防止過度使用
  - 智慧時間估算和進度指示器

### ⚡ Edge-First 現代化架構
- **全球邊緣網絡部署**:
  - Cloudflare Workers 在全球 300+ 數據中心運行
  - 超低延遲 (< 50ms)，無論用戶身處何地

- **Serverless 架構**:
  - 按需計費，無需維護伺服器
  - 自動擴展，應對流量高峰

- **響應式前端設計**:
  - Vue 3 Composition API + TypeScript 開發
  - Mobile-First 設計理念，完美適配各種螢幕尺寸
  - Element Plus UI 組件庫，現代化視覺體驗
  - 完整深色模式支援與無障礙設計

- **多語言支援**:
  - Vue I18n 實現國際化 (i18n)
  - 支援繁體中文、英文

## 🛠 技術棧

### 後端 (Cloudflare Ecosystem)
| 技術 | 版本/說明 | 用途 |
|------|-----------|------|
| **Runtime** | Cloudflare Workers | Serverless 邊緣運算環境 |
| **Language** | TypeScript 5.5+ | 型別安全的 JavaScript 超集 |
| **Router** | itty-router 5.x | 輕量級路由框架 (< 1KB) |
| **Database** | Cloudflare D1 | 基於 SQLite 的分散式資料庫 |
| **ORM** | Drizzle ORM 0.44+ | 型別安全的 SQL ORM |
| **AI Provider** | Google Gemini API | Gemini 3.0 Flash Preview 模型 |
| **Calendar** | lunar-typescript 1.8+ | 農曆/陽曆轉換與天文計算 |
| **Validation** | Zod 4.x | Schema 驗證與型別推斷 |

### 前端 (Modern Web Stack)
| 技術 | 版本/說明 | 用途 |
|------|-----------|------|
| **Framework** | Vue 3.5+ | Composition API + `<script setup>` |
| **Build Tool** | Vite 6.x | 次世代前端建置工具 |
| **Language** | TypeScript 5.8+ | 型別安全開發 |
| **State** | Pinia 3.x | Vue 官方推薦的狀態管理庫 |
| **UI Library** | Element Plus 2.10+ | Vue 3 UI 組件庫 |
| **Router** | Vue Router 4.5+ | 官方路由解決方案 |
| **i18n** | Vue I18n 9.x | 多語言國際化支援 |
| **HTTP Client** | Axios 1.9+ | Promise-based HTTP 客戶端 |
| **Calendar** | lunar-typescript 1.8+ | 與後端共用的曆法計算庫 |
| **Markdown** | marked 17.x | AI 分析結果渲染 |
| **Geocoding** | ArcGIS Geocoding API | 地址解析與經緯度查詢 (Esri 服務) |

### 開發工具
- **Package Manager**: npm / pnpm
- **Linter**: ESLint 9.x (TypeScript 規則)
- **Formatter**: Prettier 3.x
- **Test Framework**: Vitest 3.x (前端) + Cloudflare Vitest Pool (後端)
- **Deployment**: Wrangler CLI 4.x (Cloudflare 官方部署工具)

## 🚀 快速開始

### 環境要求
- **Node.js**: 20.x 或更高版本
- **Package Manager**: npm 8+ 或 pnpm 8+
- **Cloudflare Wrangler CLI**: `npm install -g wrangler@latest`
- **Cloudflare 帳號**: 用於部署 Workers 和 D1 資料庫
- **Git**: 用於版本控制

### ⚠️ 重要：雲端優先開發模式

本專案採用 **雲端 Staging 環境進行開發和測試**，不再支援地端開發環境運行。此策略旨在：
- 避免本地 `esbuild` 開發伺服器的 CSRF 安全風險
- 確保開發環境與生產環境的一致性
- 簡化開發流程，減少本地環境配置問題

### 1. 克隆專案

```bash
git clone https://github.com/iim0663418/Peixuan.git
cd peixuan
```

### 2. Cloudflare 帳號設定

#### 2.1 登入 Cloudflare
```bash
wrangler login
```

#### 2.2 取得帳號 ID
```bash
wrangler whoami
# 記下輸出的 Account ID
```

### 3. 設定 Staging 環境

#### 3.1 建立 Staging D1 資料庫
```bash
cd peixuan-worker
wrangler d1 create peixuan-db-staging
```

記下輸出的 `database_id`，並更新 `wrangler.jsonc` 中的 `env.staging.d1_databases[0].database_id`。

#### 3.2 執行資料庫遷移
```bash
wrangler d1 migrations apply peixuan-db-staging --env staging
```

#### 3.3 設定環境變數 (Secrets)

**取得 Gemini API Key**:
1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 建立新的 API Key

**設定到 Cloudflare Workers**:
```bash
# 設定 Staging 環境的 Gemini API Key
wrangler secret put GEMINI_API_KEY --env staging
# 輸入您的 API Key

# 設定環境標識
wrangler secret put ENVIRONMENT --env staging
# 輸入 "staging"
```

### 4. 部署到 Staging 環境

#### 4.1 後端部署
```bash
cd peixuan-worker
npm install
npm run build
wrangler deploy --env staging
```

部署成功後，記下 Worker URL (例如: `https://peixuan-worker-staging.your-subdomain.workers.dev`)

#### 4.2 前端建置與部署
```bash
cd ../bazi-app-vue
npm install

# 設定 Staging API URL
echo "VITE_API_BASE_URL=https://peixuan-worker-staging.your-subdomain.workers.dev/api/v1" > .env.staging

# 建置前端
npm run build

# 複製前端檔案到 Worker 的 public 目錄
cp -r dist/* ../peixuan-worker/public/

# 重新部署 Worker (包含前端)
cd ../peixuan-worker
wrangler deploy --env staging
```

### 5. 驗證部署

開啟瀏覽器前往您的 Staging Worker URL，您應該看到佩璇命理分析平台的首頁。

**測試流程**:
1. 輸入生日資訊（支援農曆/陽曆）
2. 點擊「開始分析」
3. 查看八字排盤與紫微斗數盤
4. 點擊「AI 分析」獲取性格或運勢分析

**健康檢查**:
```bash
curl https://peixuan-worker-staging.your-subdomain.workers.dev/health
# 應返回: {"status":"ok"}
```

## 📂 專案結構

```
Peixuan/
│
├── peixuan-worker/                 # 後端 Cloudflare Workers 服務
│   ├── src/
│   │   ├── index.ts               # Worker 入口點與路由配置
│   │   ├── calculation/           # 命理計算核心
│   │   │   ├── UnifiedCalculator.ts    # 統一計算器 (八字 + 紫微)
│   │   │   ├── BaziCalculator.ts       # 八字四柱計算
│   │   │   └── ZiweiCalculator.ts      # 紫微斗數計算
│   │   ├── routes/                # API 路由
│   │   │   ├── calculateRoutes.ts      # 排盤計算路由
│   │   │   └── analyzeRoutes.ts        # AI 分析路由 (SSE)
│   │   ├── services/              # 業務邏輯服務
│   │   │   ├── geminiService.ts        # Gemini API 整合
│   │   │   └── cacheService.ts         # D1 快取服務
│   │   ├── db/                    # 資料庫層
│   │   │   ├── schema.ts              # Drizzle ORM Schema
│   │   │   └── connection.ts          # D1 連接管理
│   │   └── types/                 # TypeScript 型別定義
│   ├── drizzle/                   # 資料庫遷移檔案
│   ├── wrangler.toml              # Cloudflare Workers 配置
│   └── package.json
│
├── bazi-app-vue/                  # 前端 Vue 3 應用
│   ├── src/
│   │   ├── App.vue                # 根組件
│   │   ├── main.ts                # 應用入口
│   │   ├── components/            # UI 組件
│   │   │   ├── UnifiedInputForm.vue    # 統一輸入表單
│   │   │   ├── UnifiedResultView.vue   # 統一結果顯示
│   │   │   ├── BaziChart.vue           # 八字排盤顯示
│   │   │   ├── ZiweiChart.vue          # 紫微斗數盤顯示
│   │   │   └── AIAnalysisPanel.vue     # AI 分析面板 (SSE)
│   │   ├── views/                 # 頁面視圖
│   │   │   ├── HomeView.vue            # 首頁
│   │   │   └── AnalysisView.vue        # 分析頁面
│   │   ├── stores/                # Pinia 狀態管理
│   │   │   ├── chartStore.ts           # 命盤狀態
│   │   │   └── analysisStore.ts        # 分析狀態
│   │   ├── services/              # API 客戶端
│   │   │   └── apiService.ts           # Axios HTTP 客戶端
│   │   ├── router/                # Vue Router 配置
│   │   ├── i18n/                  # 國際化語言檔案
│   │   │   └── locales/               # zh_TW, en
│   │   └── assets/                # 靜態資源 (CSS, 圖片)
│   ├── public/                    # 公開靜態檔案
│   ├── vite.config.ts             # Vite 建置配置
│   └── package.json
│
├── doc/                           # 專案文檔
│   ├── STAGING_SETUP.md           # Staging 環境設定
│   ├── api/                       # API 文檔
│   └── decisions/                 # 架構決策記錄 (ADR)
│
├── .specify/                      # Specify AI 規格檔案
│   └── specs/                     # Feature 規格
│
├── CLAUDE.md                      # Claude Code 專案指引
├── README.md                      # 本檔案
└── LICENSE                        # MIT 授權

## 🧪 測試

### 本地測試 (不運行開發伺服器)

#### 後端測試 (peixuan-worker/)
```bash
cd peixuan-worker

# 運行所有單元測試
npm run test
```

**測試範圍**:
- 八字計算邏輯單元測試
- 紫微斗數計算邏輯單元測試
- 工具函數單元測試
- Mock API 測試

**注意**: 不使用 `test:watch` 模式以避免啟動本地開發伺服器。

#### 前端測試 (bazi-app-vue/)
```bash
cd bazi-app-vue

# 運行所有單元測試
npm run test

# UI 模式 (視覺化測試介面)
npm run test:ui
```

**測試範圍**:
- Vue 組件單元測試 (Vue Test Utils)
- Pinia Store 測試
- API Service Mock 測試
- 工具函數單元測試

### Staging 環境整合測試

完整的整合測試應在 Staging 環境進行：

```bash
# 部署到 Staging 後進行手動測試
curl https://peixuan-worker-staging.your-subdomain.workers.dev/api/v1/calculate
```

使用瀏覽器或 API 測試工具 (Postman、Insomnia) 測試完整的使用者流程。

## 📦 部署

### 1. 後端部署到 Cloudflare Workers

#### 1.1 準備工作
```bash
cd peixuan-worker

# 確保已登入 Cloudflare 帳號
wrangler login

# 建立 D1 資料庫 (首次部署)
wrangler d1 create peixuan-db

# 記下 database_id，更新 wrangler.toml 中的 database_id
```

#### 1.2 部署 Production 環境
```bash
# 執行資料庫遷移 (首次或 schema 變更時)
wrangler d1 migrations apply peixuan-db --remote

# 建置並部署
npm run build
npm run deploy

# 或直接部署 (不建置)
npm run deploy:direct
```

#### 1.3 設定環境變數 (Secrets)
```bash
# 設定 Gemini API Key
wrangler secret put GEMINI_API_KEY
# 輸入您的 API Key

# 設定環境標識
wrangler secret put ENVIRONMENT
# 輸入 "production"
```

#### 1.4 驗證部署
```bash
# 訪問您的 Worker URL
https://peixuan-worker.<your-subdomain>.workers.dev/health

# 應該回應 HTTP 200 與健康狀態 JSON
```

### 2. 前端部署到 Cloudflare Pages

#### 2.1 建置前端
```bash
cd bazi-app-vue

# 設定生產環境變數
echo "VITE_API_BASE_URL=https://peixuan-worker.<your-subdomain>.workers.dev/api/v1" > .env.production

# 執行建置
npm run build

# 產出位於 dist/ 目錄
```

#### 2.2 使用 Wrangler 部署到 Pages
```bash
# 首次部署，建立新的 Pages 專案
wrangler pages deploy dist --project-name=peixuan-frontend

# 後續部署
wrangler pages deploy dist
```

#### 2.3 或使用 Git 整合自動部署
1. 前往 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. 點擊「Create a project」
3. 連接您的 Git Repository (GitHub/GitLab)
4. 設定建置命令:
   - **Build command**: `cd bazi-app-vue && npm install && npm run build`
   - **Build output directory**: `bazi-app-vue/dist`
   - **Root directory**: `/`
5. 設定環境變數:
   - `VITE_API_BASE_URL`: `https://peixuan-worker.<your-subdomain>.workers.dev/api/v1`
6. 儲存並部署

#### 2.4 設定自訂網域 (可選)
- 在 Cloudflare Pages 設定中新增自訂網域
- 更新 DNS 記錄指向 Cloudflare Pages
- 自動啟用 HTTPS

### 3. 部署驗證清單

- [ ] 後端 `/health` 端點正常回應
- [ ] D1 資料庫遷移成功
- [ ] Gemini API Key 正確設定
- [ ] 前端可正常訪問
- [ ] 前端可成功呼叫後端 API
- [ ] AI 分析功能正常運作
- [ ] SSE 串流分析正常顯示

## 🔧 開發指南

### ⚡ 雲端優先開發工作流程

#### 1. 本地開發 (僅限程式碼編輯和單元測試)
```bash
# 編輯程式碼
# 運行單元測試 (不啟動開發伺服器)
cd peixuan-worker
npm run test

cd ../bazi-app-vue
npm run test
```

#### 2. 部署到 Staging 進行整合測試
```bash
# 建置並部署後端
cd peixuan-worker
npm run build
wrangler deploy --env staging

# 建置前端
cd ../bazi-app-vue
npm run build

# 複製到 Worker public 目錄
cp -r dist/* ../peixuan-worker/public/

# 重新部署 (包含前端)
cd ../peixuan-worker
wrangler deploy --env staging
```

#### 3. 在 Staging 環境測試
- 瀏覽器開啟 Staging URL
- 執行完整的使用者流程測試
- 驗證 AI 分析、排盤計算等功能

#### 4. 確認無誤後合併到 main 並部署到 Production
```bash
git checkout main
git merge feature/your-feature
git push origin main

# 部署到 Production
cd peixuan-worker
wrangler deploy --env production
```

### 程式碼風格
專案使用 ESLint + Prettier 確保程式碼品質與一致性。

```bash
# 前端 Linting
cd bazi-app-vue
npm run lint        # 自動修復
npm run format      # Prettier 格式化

# 後端 Linting
cd peixuan-worker
npm run lint        # 自動修復
```

### Git Workflow
1. 從 `main` 分支建立功能分支
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. 本地開發並運行單元測試
   ```bash
   npm run test
   ```
3. 部署到 Staging 並進行整合測試
   ```bash
   wrangler deploy --env staging
   ```
4. 測試通過後，提交變更並建立 Pull Request
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### Commit 訊息規範
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

- `feat:` 新功能
- `fix:` 修復 Bug
- `docs:` 文檔變更
- `style:` 程式碼格式調整（不影響功能）
- `refactor:` 重構（不新增功能或修復 Bug）
- `test:` 新增或修改測試
- `chore:` 建置流程或工具變更

### 新增功能流程
1. 查看 `.specify/specs/` 中的現有規格
2. 如需新增規格，使用 Specify AI 建立 `.feature` 檔案
3. 實作功能前先撰寫單元測試 (TDD)
4. 本地運行測試確保通過
5. 部署到 Staging 進行整合測試
6. 更新相關文檔
7. 提交 Pull Request

## 🤝 貢獻指南

我們歡迎各種形式的貢獻！

### 如何貢獻
1. **回報 Bug**: 在 [Issues](https://github.com/iim0663418/Peixuan/issues) 建立詳細的 Bug 報告
2. **建議功能**: 提出新功能想法與使用場景
3. **提交程式碼**: Fork 專案後提交 Pull Request
4. **改善文檔**: 修正文檔錯誤或新增說明

### Pull Request 檢查清單
- [ ] 所有測試通過 (`npm run test`)
- [ ] ESLint 無錯誤 (`npm run lint`)
- [ ] 程式碼已格式化 (`npm run format`)
- [ ] 新功能已新增測試
- [ ] 相關文檔已更新
- [ ] Commit 訊息符合規範

### 開發環境建議
- **IDE**: VS Code (推薦擴充功能: Vue Language Features, ESLint, Prettier)
- **Node Version Manager**: nvm 或 fnm
- **Git Client**: 命令列或 GitHub Desktop

## 📖 相關資源

- **官方文檔**: [docs/](./doc/)
- **API 文檔**: [doc/api/](./doc/api/)
- **架構決策**: [doc/decisions/](./doc/decisions/)
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Vue 3**: https://vuejs.org/
- **Gemini API**: https://ai.google.dev/

## 🙏 致謝

- [lunar-typescript](https://github.com/6tail/lunar-typescript) - 農曆計算庫
- [Cloudflare](https://cloudflare.com/) - Edge Computing 平台
- [Google Gemini](https://ai.google.dev/) - AI 分析引擎
- [Vue.js](https://vuejs.org/) - 前端框架
- [Element Plus](https://element-plus.org/) - UI 組件庫
- [Esri ArcGIS](https://www.esri.com/) - 地址解析與地理編碼服務

### 地理編碼服務聲明

本應用使用 Esri 的 ArcGIS Geocoding API 提供地址解析功能，將使用者輸入的地址轉換為地理座標（經緯度），以計算真太陽時校正。地址解析功能遵循 [Esri 服務條款](https://www.esri.com/en-us/legal/terms/full-master-agreement)。

所有地理編碼結果均由 Esri 提供，本平台已在相關功能中添加適當的歸屬聲明。

## 📄 授權 (License)

本專案採用 **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** (CC BY-NC-SA 4.0) 授權。

[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### 授權摘要 (License Summary)

**您可以自由地：**
- ✅ **分享** — 以任何媒介或格式重製及散布本素材
- ✅ **修改** — 重混、轉換本素材、及依本素材建立新素材

**惟須遵守下列條件：**
- 📝 **姓名標示** — 您必須給予適當表彰並提供授權條款連結
- 🚫 **非商業性** — 您不得將本素材進行商業目的之使用
- ♻️ **相同方式分享** — 若您重混、轉換本素材，須依相同授權條款散布

### 使用限制 (Usage Restrictions)

#### ✅ 允許的使用方式
- 個人學習與研究
- 教育用途（非營利教學）
- 開源專案整合（需遵守相同授權）
- 非營利組織使用

#### ❌ 禁止的使用方式
- 任何形式的商業販售或收費服務
- 將本軟體作為付費產品的一部分
- 在商業環境中使用以獲取經濟利益
- 移除或修改授權聲明與版權資訊

#### 📧 商業授權洽詢
如需商業使用授權，請聯繫專案維護者討論授權條款。

詳細授權條款請參閱 [LICENSE](LICENSE) 檔案。

---

<div align="center">

**佩璇 (Peixuan)** - 結合傳統智慧與現代科技的命理分析平台

Made with ❤️ by Peixuan Team

[![Star on GitHub](https://img.shields.io/github/stars/iim0663418/Peixuan?style=social)](https://github.com/iim0663418/Peixuan)

</div>
