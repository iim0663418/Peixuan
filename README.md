# 佩璇 - 智能命理分析平台

## 🌟 專案概述

佩璇是一個創新的命理分析平台，結合傳統八字與紫微斗數，提供多維度、高精度的個人命運洞察。

## ✨ 核心特色

### 🔄 多術數交互驗證系統
- **創新技術**: 首創八字與紫微斗數交叉驗證
- **信心度評分**: 量化分析結果的可靠性
- **智能一致性分析**: 自動識別分析共同點與差異

### 🔐 分層響應設計
- **匿名用戶**: 基礎分析
- **會員用戶**: 進階分析
- **VIP用戶**: 專家級分析

### 🧠 智能分析模組
- 性格特質比對
- 運勢趨勢分析
- 五行能量分布比較
- 生命週期驗證

## 🛠 技術棧

### 後端
- Node.js 18+
- TypeScript
- Express.js
- JWT 驗證
- PostgreSQL 15
- Redis 7
- 日誌與監控系統

### 前端
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia 狀態管理
- Element Plus UI
- i18n 國際化

### 資料處理
- 紫微斗數計算引擎 (後端實現)
- 八字排盤演算法 (前端實現，使用 lunar.min.js)
- 多維度交叉驗證模型

## 🚀 快速開始

### 環境要求
- Node.js 18+
- npm 8+
- Docker 20.10+ 與 Docker Compose 2.0+ (推薦)
- Git 2.30+

### 環境變數設定

專案使用環境變數來配置不同環境的設定。請按照以下步驟設定：

#### 1. 後端環境變數
複製環境變數範本並根據需要修改：

```bash
# 複製環境變數模板
cp backend-node/.env.example backend-node/.env.dev

# 編輯開發環境變數
nano backend-node/.env.dev
```

**主要環境變數說明**：

```
# 基本配置
NODE_ENV=development    # 環境類型 (development/test/production)
PORT=3000               # API 服務埠

# 資料庫配置
DB_HOST=postgres        # PostgreSQL 主機名
DB_PORT=5432            # PostgreSQL 埠
DB_USERNAME=postgres    # 資料庫用戶名
DB_PASSWORD=devpassword # 資料庫密碼
DB_NAME=peixuan_dev     # 資料庫名稱

# Redis 配置
REDIS_HOST=redis        # Redis 主機名
REDIS_PORT=6379         # Redis 埠

# JWT 配置
JWT_SECRET=your-secret-key    # JWT 密鑰 (生產環境請使用強密碼)
JWT_EXPIRES_IN=24h            # Token 有效期

# API 配置
API_RATE_LIMIT=1000           # API 請求限制
CALCULATION_RATE_LIMIT=100    # 計算服務請求限制

# 其他配置
ENABLE_API_DOCS=true          # 是否啟用 API 文檔
```

#### 2. 前端環境變數
在 `bazi-app-vue` 目錄中創建 `.env.local` 文件：

```bash
# 複製環境變數模板
cp bazi-app-vue/.env.example bazi-app-vue/.env.local

# 編輯環境變數
nano bazi-app-vue/.env.local
```

**主要環境變數說明**：

```
# API 基礎 URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 功能開關
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PREMIUM_FEATURES=false

# 其他配置
VITE_DEFAULT_LOCALE=zh-TW
```

### 安裝步驟

#### 方法一：使用 Docker (推薦)

```bash
# 克隆倉庫
git clone https://github.com/your-username/peixuan.git

# 進入專案目錄
cd peixuan

# 複製環境變數模板
cp .env.example .env
cp backend-node/.env.example backend-node/.env.dev

# 啟動開發環境
docker-compose -f docker-compose.dev.yml up -d

# 查看日誌
docker-compose -f docker-compose.dev.yml logs -f
```

#### 方法二：本地開發

```bash
# 克隆倉庫
git clone https://github.com/your-username/peixuan.git

# 進入專案目錄
cd peixuan

# 安裝後端依賴
cd backend-node
npm install

# 複製並設定環境變數
cp .env.example .env.dev
nano .env.dev

# 啟動後端開發伺服器
npm run dev

# 安裝前端依賴
cd ../bazi-app-vue
npm install

# 複製並設定環境變數
cp .env.example .env.local
nano .env.local

# 啟動前端開發伺服器
npm run dev
```

## 🔒 安全性

- JWT 身份驗證
- 基於角色的存取控制
- 敏感資料加密
- 多層安全驗證機制
- API 頻率限制
- 輸入驗證與消毒
- CORS 安全配置

## 📊 API 端點

### 命運洞悉
- `POST /api/v1/astrology/integrated-analysis`
- `POST /api/v1/astrology/confidence-assessment`

### 紫微斗數
- `POST /api/v1/purple-star/calculate`
- `GET /api/v1/purple-star/chart`
- `GET /api/v1/purple-star/health`

### 八字
- `POST /api/v1/bazi/calculate`
- `GET /api/v1/bazi/chart`

### 用戶認證
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

### 系統監控
- `GET /health`
- `GET /metrics`

## 🧪 測試

```bash
# 運行前端單元測試
cd bazi-app-vue
npm run test

# 運行後端單元測試
cd backend-node
npm run test
```

詳細的測試指南請參考 [TESTING_GUIDE.md](TESTING_GUIDE.md)。
詳細的部署指南請參考 [DEPLOYMENT_MANUAL.md](DEPLOYMENT_MANUAL.md)。

## 📝 專案狀態

### 已完成功能
- ✅ 設置專案基礎架構
- ✅ 實現紫微斗數命盤自動排盤
- ✅ 開發星曜屬性和宮位吉凶高亮功能
- ✅ 開發流年和大運計算功能
- ✅ 實現四化飛星功能
- ✅ 開發全程異動記錄和還原功能
- ✅ 優化命盤演算法效能
- ✅ 實現國際化（i18n）支持
- ✅ 開發命盤資料可視化功能
- ✅ 緊急修復：八字 API 404 錯誤和前端翻譯問題
- ✅ 紫微斗數計算核心模組開發
- ✅ 實現紫微斗數精細化計算服務
- ✅ 整合時區選擇功能於紫微斗數排盤表單
- ✅ 增強紫微斗數命盤解說功能
- ✅ 實現多層次命盤解讀功能
- ✅ 優化會話存儲實現

### 進行中功能
- 🔄 修復紫微斗數表單資料傳遞問題
- 🔄 實現用戶認證系統
- 🔄 開發匿名轉會員合併機制

### 待開發功能
- ⏳ 設計和實現完整 RESTful API
- ⏳ 開發命運洞悉功能
- ⏳ 實現第三方 API 接入
- ⏳ 開發用戶資料和歷史查詢功能
- ⏳ 實現多設備同步功能
- ⏳ 開發分層 API 結果功能
- ⏳ 實現高級用戶權限管理
- ⏳ 開發分階段 Token 驗證系統
- ⏳ 實現高級資料合併與衝突處理
- ⏳ 命運洞悉與命運分析容錯機制
- ⏳ 紫微斗數計算精化與時間精準度優化
- ⏳ Redis 分佈式緩存系統配置與部署
- ⏳ 增強英文本地化界面
- ⏳ 增強紫微斗數命盤響應式設計
- ⏳ 增強存儲服務安全性
- ⏳ 開發命盤比較功能
- ⏳ 實現命盤解讀自動生成
- ⏳ 開發命盤互動教學功能
- ⏳ 實現社區功能
- ⏳ 實現系統監控和分析

## 🌈 未來藍圖

- [ ] 機器學習增強預測
- [ ] 更多命理系統整合
- [ ] 個性化推薦引擎
- [ ] 跨平台移動應用

## 🏗 專案架構

本專案主要分為前端與後端兩大部分：

- **前端 (bazi-app-vue)**
  - 使用 Vue 3 框架與 TypeScript
  - 組件化設計，包含命盤輸入、顯示、分析等多個 Vue 組件
  - 狀態管理使用 Pinia，路由管理使用 Vue Router
  - 支援多語系 (i18n)
  - 主要目錄：
    - `src/components/`：UI 組件
    - `src/views/`：頁面視圖
    - `src/services/`：前端服務與 API 呼叫
    - `src/stores/`：狀態管理
    - `src/i18n/`：國際化資源
    - `src/router/`：路由設定
    - `src/utils/`：工具函數
    - `src/types/`：TypeScript 類型定義

- **後端 (backend-node)**
  - 使用 Node.js 與 Express 框架，採用 TypeScript 開發
  - 提供 RESTful API 端點，處理命理計算與用戶認證
  - 中介軟體負責身份驗證、權限控制、日誌與監控
  - 主要目錄：
    - `src/routes/`：API 路由定義
    - `src/controllers/`：請求處理控制器
    - `src/services/`：業務邏輯與命理計算服務
    - `src/middleware/`：Express 中介軟體
    - `src/models/`：資料模型
    - `src/utils/`：工具函式
    - `src/types/`：型別定義
    - `src/config/`：配置文件
    - `src/__tests__/`：單元測試

- **其他**
  - `docker-compose.yml` 與 Dockerfile 用於容器化部署
  - `docker-compose.dev.yml` 用於開發環境部署
  - `docker-compose.test.yml` 用於測試環境部署
  - `TESTING_GUIDE.md` 提供測試相關說明
  - `DEPLOYMENT_MANUAL.md` 提供部署相關說明
  - `.env` 用於環境變數設定
  - `scripts/` 目錄包含各種自動化腳本

## 🤝 貢獻指南

請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何貢獻代碼。

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 聯繫我們

- 電子郵件：support@peixuan.com
- 社群論壇：[討論區連結]
- 技術支持：[支持連結]

---

**免責聲明**：本平台提供的分析僅供參考，不應作為重大決策的唯一依據。