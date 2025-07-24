# 佩璇專案架構圖 & API 結構梳理

## 📋 專案概覽

佩璇是一個智能命理分析平台，結合傳統八字與紫微斗數，提供多維度的個人命運洞察。

**架構類型**：前後端分離的全棧應用  
**前端技術**：Vue 3 + TypeScript + Vite  
**後端技術**：Node.js + Express + TypeScript  
**部署方式**：Docker Compose + PostgreSQL + Redis

---

## 🏗️ 系統架構總覽

```
┌─────────────────────────────────────────────────────────────────┐
│                         佩璇智能命理分析平台                      │
├─────────────────────────────────────────────────────────────────┤
│  前端 (Vue 3)          │  後端 (Node.js)      │  基礎設施        │
│  ┌─────────────────┐   │  ┌─────────────────┐  │  ┌─────────────┐ │
│  │ 用戶界面層        │   │  │ API路由層        │  │  │ PostgreSQL  │ │
│  │ - Views (4)     │   │  │ - 3個路由模組     │  │  │ 數據庫      │ │
│  │ - Components(31)│◄──┤  │ - 中介軟體       │  │  └─────────────┘ │
│  │                 │   │  └─────────────────┘  │                  │
│  ├─────────────────┤   │  ┌─────────────────┐  │  ┌─────────────┐ │
│  │ 業務邏輯層        │   │  │ 服務層           │  │  │ Redis       │ │
│  │ - Services (3)  │   │  │ - 7個專業服務     │  │  │ 快取系統    │ │
│  │ - Utils (6)     │   │  │ - 計算引擎       │  │  └─────────────┘ │
│  │ - Composables   │   │  └─────────────────┘  │                  │
│  └─────────────────┘   │                      │  ┌─────────────┐ │
│                         │  ┌─────────────────┐  │  │ Docker      │ │
│                         │  │ 工具層           │  │  │ 容器化部署  │ │
│                         │  │ - 驗證          │  │  └─────────────┘ │
│                         │  │ - 日誌          │  │                  │
│                         │  │ - 監控          │  │                  │
│                         │  └─────────────────┘  │                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 前端架構 (bazi-app-vue)

### 🏛️ 目錄結構
```
src/
├── 📁 views/              # 頁面視圖 (4個)
│   ├── HomeView.vue           # 首頁
│   ├── BaziView.vue          # 八字分析頁面
│   ├── PurpleStarView.vue    # 紫微斗數頁面
│   └── IntegratedAnalysisView.vue # 整合分析頁面
│
├── 📁 components/         # UI組件 (31個)
│   ├── 🔴 表單組件
│   │   ├── BaziInputForm.vue       # 八字輸入表單
│   │   ├── PurpleStarInputForm.vue # 紫微斗數輸入表單
│   │   └── UserInputForm.vue       # 通用用戶輸入
│   │
│   ├── 🟡 顯示組件
│   │   ├── BaziChart.vue           # 八字命盤顯示
│   │   ├── BaziChartDisplay.vue    # 八字圖表展示
│   │   ├── PurpleStarChartDisplay.vue # 紫微斗數命盤
│   │   ├── ElementsChart.vue       # 五行圖表
│   │   └── TransformationStarsDisplay.vue # 四化飛星顯示
│   │
│   ├── 🟢 分析組件
│   │   ├── CurrentYearFortune.vue  # 今年運勢
│   │   ├── YearlyFateTimeline.vue  # 流年運勢時線
│   │   ├── IntegratedAnalysisDisplay.vue # 整合分析顯示
│   │   ├── TraitDeconstruction.vue # 性格特質解構
│   │   └── FortuneOverview.vue     # 運勢總覽
│   │
│   ├── 🔵 控制組件
│   │   ├── LayeredReadingController.vue # 分層閱讀控制器
│   │   ├── UnifiedLayeredController.vue # 統一分層控制器
│   │   ├── DisplayDepthContainer.vue # 顯示深度容器
│   │   └── GlobalDisplayModePanel.vue # 全局顯示模式面板
│   │
│   ├── 🟣 功能組件
│   │   ├── LanguageSelector.vue    # 語言選擇器
│   │   ├── StorageStatusIndicator.vue # 存儲狀態指示器  
│   │   ├── SkeletonLoader.vue      # 骨架加載器
│   │   └── PurpleStarGuideModal.vue # 紫微斗數指南彈窗
│   │
│   └── 📁 reading-levels/     # 閱讀層級組件
│       ├── CompactReadingView.vue  # 精簡閱讀視圖
│       └── SummaryReadingView.vue  # 摘要閱讀視圖
│
├── 📁 services/           # 前端服務層 (3個)
│   ├── apiService.ts           # HTTP API服務
│   ├── astrologyIntegrationService.ts # 命理整合服務
│   └── geocodeService.ts       # 地理編碼服務
│
├── 📁 utils/              # 工具函數 (6個)
│   ├── baziCalc.ts            # 八字計算核心
│   ├── ziweiCalc.ts           # 紫微斗數計算
│   ├── enhancedStorageService.ts # 增強存儲服務
│   ├── storageService.ts      # 基礎存儲服務
│   ├── yearlyInteractionUtils.ts # 流年互動工具
│   └── frontendValidation.ts  # 前端驗證
│
├── 📁 composables/        # Vue組合式API
│   ├── useDisplayMode.ts      # 顯示模式管理
│   ├── useLayeredReading.ts   # 分層閱讀邏輯
│   └── useSharedLayeredReading.ts # 共享分層閱讀
│
├── 📁 stores/             # 狀態管理
│   └── displayModeStore.ts    # 顯示模式狀態
│
├── 📁 types/              # TypeScript類型定義
│   ├── astrologyTypes.ts      # 命理相關類型
│   ├── displayModes.ts        # 顯示模式類型
│   └── layeredReading.ts      # 分層閱讀類型
│
├── 📁 i18n/               # 國際化
│   ├── index.ts               # 國際化配置
│   └── locales/               # 語言包 (3種語言)
│       ├── zh_TW.json             # 繁體中文
│       ├── zh.json                # 簡體中文
│       └── en.json                # 英文
│
├── 📁 router/             # 路由配置
│   └── index.ts               # Vue Router配置
│
└── 📁 plugins/            # Vue插件
    └── errorHandler.ts        # 全局錯誤處理器
```

### 🎯 組件依賴關係圖

```
App.vue
├── LanguageSelector.vue (懶載入)
└── Router Outlet
    ├── HomeView.vue
    │   └── (首頁展示組件)
    │
    ├── BaziView.vue
    │   ├── BaziInputForm.vue
    │   ├── BaziChartDisplay.vue
    │   │   └── BaziChart.vue
    │   ├── ElementsChart.vue
    │   ├── YearlyFateTimeline.vue
    │   └── LayeredReadingController.vue
    │
    ├── PurpleStarView.vue
    │   ├── PurpleStarInputForm.vue
    │   ├── PurpleStarChartDisplay.vue
    │   ├── TransformationStarsDisplay.vue
    │   ├── MinorStarsPanel.vue
    │   ├── PatternAnalysisPanel.vue
    │   └── UnifiedLayeredController.vue
    │
    └── IntegratedAnalysisView.vue
        ├── IntegratedAnalysisDisplay.vue
        ├── TraitDeconstruction.vue
        ├── FortuneOverview.vue
        ├── CurrentYearFortune.vue
        └── DisplayDepthContainer.vue
```

---

## ⚙️ 後端架構 (backend-node)

### 🏗️ 目錄結構
```
src/
├── 📁 routes/             # API路由層 (3個模組)
│   ├── purpleStarRoutes.ts    # 紫微斗數API路由
│   ├── astrologyIntegrationRoutes.ts # 命理整合API路由  
│   └── baziRoutes.ts          # 八字API路由
│
├── 📁 services/           # 業務邏輯服務層 (8個服務)
│   ├── 🔴 核心計算服務
│   │   ├── purpleStarCalculationService.ts # 紫微斗數計算核心
│   │   ├── enhancedPurpleStarCalculationService.ts # 增強紫微計算
│   │   ├── transformationStarService.ts # 四化飛星服務
│   │   └── starPlacementService.ts # 星曜安置服務
│   │
│   ├── 🟡 整合服務
│   │   ├── astrologyIntegrationService.ts # 命理整合服務
│   │   └── layeredResponseService.ts # 分層響應服務
│   │
│   ├── 🟢 支撑服務
│   │   ├── astronomicalTimeService.ts # 天文時間服務
│   │   └── cacheService.ts # 快取服務
│
├── 📁 middleware/         # Express中介軟體
│   └── monitoring.ts          # 監控與日誌中介軟體
│
├── 📁 utils/              # 工具層
│   ├── validation.ts          # 請求驗證工具
│   └── logger.ts              # 日誌工具
│
├── 📁 types/              # TypeScript類型定義
│   ├── purpleStarTypes.ts     # 紫微斗數類型
│   └── lunar-javascript.d.ts  # 農曆庫類型聲明
│
├── 📁 __tests__/          # 測試文件
│   ├── routes/                # 路由測試
│   └── services/              # 服務測試
│
├── 📁 docs/               # API文檔
│   ├── README.md              # API使用說明
│   └── purpleStarApi.yaml     # OpenAPI規範
│
├── 📁 config/             # 配置文件 (空目錄)
├── 📁 controllers/        # 控制器 (空目錄)
├── 📁 models/             # 數據模型 (空目錄)
└── index.ts               # 應用入口點
```

### 🔗 服務依賴關係圖

```
Express App (index.ts)
├── 中介軟體層
│   ├── CORS設定 (生產環境限制來源)
│   ├── 請求頻率限制 (Rate Limiting)
│   │   ├── 一般API: 100 req/15min
│   │   └── 計算API: 20 req/5min
│   ├── 請求日誌記錄
│   ├── 效能監控
│   └── 錯誤處理
│
├── 路由層
│   ├── /api/v1/purple-star/* → purpleStarRoutes
│   ├── /api/v1/astrology/* → astrologyIntegrationRoutes  
│   └── /api/v1/bazi/* → baziRoutes
│
└── 服務層
    ├── PurpleStarCalculationService
    │   ├── 依賴: StarPlacementService
    │   ├── 依賴: TransformationStarService
    │   └── 依賴: AstronomicalTimeService
    │
    ├── EnhancedPurpleStarCalculationService
    │   └── 依賴: PurpleStarCalculationService
    │
    ├── AstrologyIntegrationService
    │   ├── 依賴: LayeredResponseService
    │   ├── 依賴: PurpleStarCalculationService
    │   └── 依賴: (前端BaZi計算結果)
    │
    └── CacheService (記憶體快取)
        ├── TTL: 10分鐘
        └── 檢查間隔: 2分鐘
```

---

## 🔌 API 端點詳細梳理

### 🟣 紫微斗數 API (`/api/v1/purple-star`)

| 方法 | 端點 | 功能 | 輸入參數 | 輸出格式 |
|------|------|------|----------|----------|
| POST | `/calculate` | 計算紫微斗數命盤 | `birthDate`, `birthTime`, `gender`, `location`, `lunarInfo`, `options` | 完整命盤數據 + 四化飛星 |
| GET | `/health` | 健康檢查 | 無 | 服務狀態 |

**重要功能**：
- ✅ 支援快取 (1小時TTL)
- ✅ 包含四化飛星計算
- ✅ 分層響應 (基於用戶等級)
- ✅ 詳細錯誤處理

### 🟡 命理整合 API (`/api/v1/astrology`)

| 方法 | 端點 | 功能 | 輸入參數 | 輸出格式 |
|------|------|------|----------|----------|
| POST | `/integrated-analysis` | 八字與紫微斗數交叉驗證分析 | `birthDate`, `birthTime`, `gender`, `useSessionCharts`, `baziChart`, `purpleStarChart` | 整合分析報告 |
| POST | `/confidence-assessment` | 分析結果信心度評估 | 分析結果數據 | 信心度評分 |
| GET | `/health` | 健康檢查 | 無 | 服務狀態 |

**特色功能**：
- ✅ 支援前端Session數據整合
- ✅ 多術數交叉驗證
- ✅ 信心度量化評估
- ✅ 性格特質比對

### 🔵 八字 API (`/api/v1/bazi`) 

| 方法 | 端點 | 功能 | 輸入參數 | 輸出格式 |
|------|------|------|----------|----------|
| POST | `/calculate` | 計算八字命盤 | `birthDate`, `birthTime`, `gender`, `location` | 八字排盤結果 |
| GET | `/history` | 獲取八字計算歷史 | 用戶身份 | 歷史記錄列表 |

> ⚠️ **注意**：八字計算主要在前端執行 (`baziCalc.ts`)，後端API作為備用。

---

## 📊 數據流分析

### 🔄 前端到後端數據流

```
用戶輸入
    ↓
前端表單組件 (PurpleStarInputForm.vue)
    ↓
前端驗證 (frontendValidation.ts)
    ↓
API服務調用 (apiService.ts)
    ↓
axios HTTP請求
    ↓
後端路由層 (purpleStarRoutes.ts)
    ↓
請求驗證 (validation.ts)
    ↓
業務服務層 (PurpleStarCalculationService)
    ↓
快取檢查 (cacheService.ts)
    ↓
計算處理 (農曆轉換 + 命盤計算)
    ↓
結果快取存儲
    ↓
響應數據包裝
    ↓
HTTP響應返回
    ↓
前端結果處理 (PurpleStarChartDisplay.vue)
    ↓
用戶界面更新
```

### 🗄️ 存儲策略

**前端存儲**：
- **sessionStorage**: 命盤計算結果臨時存儲
- **localStorage**: 用戶偏好設置和歷史記錄
- **增強存儲服務**: 版本控制和數據遷移

**後端存儲**：
- **記憶體快取**: 計算結果快取 (NodeCache)
- **PostgreSQL**: 用戶數據和歷史記錄 (待實現)
- **Redis**: 分布式快取 (配置中，未啟用)

### 🔀 組件通信模式

**父子組件通信**：
```
Props Down ↓ / Events Up ↑
- 數據通過props向下傳遞
- 事件通過emit向上傳遞
```

**兄弟組件通信**：
```
Pinia Store / Provide-Inject
- 全局狀態管理
- 顯示模式控制
```

**跨模組通信**：
```
Custom Events / Window Events
- 模組間狀態同步
- 深度模式切換廣播
```

---

## 🔧 技術特點總結

### ✅ 架構優勢

1. **模組化設計**：清晰的前後端職責分離
2. **類型安全**：全面的TypeScript類型定義
3. **效能優化**：
   - 組件懶載入
   - API請求快取
   - 前端計算分擔
4. **多語言支援**：完整的i18n實現
5. **響應式設計**：適配多種設備
6. **PWA支援**：漸進式Web應用特性

### ⚡ 效能特性

1. **前端效能**：
   - Vue 3 Composition API
   - 動態組件載入
   - Vite快速建置

2. **後端效能**：
   - 記憶體快取系統
   - 請求頻率限制
   - 非同步處理

3. **網路效能**：
   - HTTP請求快取
   - 資料壓縮
   - CDN就緒

### 🛡️ 安全特性

1. **CORS保護**：生產環境域名限制
2. **頻率限制**：防止API濫用
3. **輸入驗證**：前後端雙重驗證
4. **錯誤處理**：防止資訊洩露
5. **日誌監控**：完整的訪問記錄

---

## 📈 未來架構演進建議

### 短期改進 (1-3個月)
1. **完善MVC結構**：添加Controllers層
2. **資料庫整合**：實現PostgreSQL數據持久化
3. **Redis快取**：啟用分布式快取
4. **API版本控制**：實現v2 API

### 中期規劃 (3-6個月)
1. **微服務化**：拆分計算引擎為獨立服務
2. **消息隊列**：異步計算處理
3. **監控系統**：APM性能監控
4. **CDN整合**：靜態資源加速

### 長期願景 (6-12個月)
1. **容器編排**：Kubernetes部署
2. **API網關**：統一入口和認證
3. **機器學習**：智能命理分析
4. **移動應用**：React Native App

---

*本文檔更新時間：2025年1月*  
*版本：v1.0*  
*維護者：專案架構團隊*