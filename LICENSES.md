# 第三方授權聲明

本專案使用以下開源軟體與函式庫，特此致謝。

## 前端依賴 (bazi-app-vue)

### 核心框架
- **Vue.js** v3.5.13 - MIT License
  - Copyright (c) 2013-present, Yuxi (Evan) You
  - https://github.com/vuejs/core

- **Vue Router** v4.5.1 - MIT License
  - Copyright (c) 2019-present, Yuxi (Evan) You
  - https://github.com/vuejs/router

- **Pinia** v3.0.4 - MIT License
  - Copyright (c) 2019-present, Eduardo San Martin Morote
  - https://github.com/vuejs/pinia

### UI 框架
- **Element Plus** v2.10.1 - MIT License
  - Copyright (c) 2020-present, Element Plus Team
  - https://github.com/element-plus/element-plus

- **@element-plus/icons-vue** v2.3.1 - MIT License
  - https://github.com/element-plus/element-plus-icons

### 工具庫
- **axios** v1.9.0 - MIT License
  - Copyright (c) 2014-present, Matt Zabriskie
  - https://github.com/axios/axios

- **Chart.js** v4.4.9 - MIT License
  - Copyright (c) 2014-present, Chart.js Contributors
  - https://github.com/chartjs/Chart.js

- **vue-i18n** v9.14.4 - MIT License
  - Copyright (c) 2016-present, kazuya kawaguchi
  - https://github.com/intlify/vue-i18n-next

- **vue-lazyload** v3.0.0 - MIT License
  - https://github.com/hilongjw/vue-lazyload

### 構建工具
- **Vite** - MIT License
  - Copyright (c) 2019-present, Yuxi (Evan) You
  - https://github.com/vitejs/vite

- **vite-plugin-pwa** v1.0.0 - MIT License
  - https://github.com/vite-pwa/vite-plugin-pwa

## 後端依賴 (peixuan-worker)

### 運行環境
- **Cloudflare Workers** - Apache License 2.0
  - https://workers.cloudflare.com/

### 核心框架
- **itty-router** v5.0.22 - MIT License
  - Copyright (c) 2020-present, Kevin R. Whitley
  - https://github.com/kwhitley/itty-router

### 資料庫
- **Drizzle ORM** v0.44.7 - Apache License 2.0
  - Copyright (c) 2022-present, Drizzle Team
  - https://github.com/drizzle-team/drizzle-orm

- **drizzle-kit** v0.31.7 - Apache License 2.0
  - https://github.com/drizzle-team/drizzle-kit-mirror

- **drizzle-zod** v0.8.3 - MIT License
  - https://github.com/drizzle-team/drizzle-orm

### 驗證與工具
- **Zod** v4.1.13 - MIT License
  - Copyright (c) 2020-present, Colin McDonnell
  - https://github.com/colinhacks/zod

- **uuid** v13.0.0 - MIT License
  - https://github.com/uuidjs/uuid

### 命理計算
- **lunar-typescript** v1.8.6 - MIT License
  - Copyright (c) 2015-present, 6tail
  - https://github.com/6tail/lunar-typescript

### 資產處理
- **@cloudflare/kv-asset-handler** v0.4.1 - MIT/Apache-2.0
  - https://github.com/cloudflare/kv-asset-handler

## 第三方服務

### 地理編碼服務
- **Esri ArcGIS Geocoding API**
  - 服務提供商: Esri
  - 用途: 地址解析與地理座標查詢
  - 服務條款: https://www.esri.com/en-us/legal/terms/full-master-agreement
  - 隱私政策: https://www.esri.com/en-us/privacy/overview
  - 歸屬聲明: "Powered by Esri"

**使用說明**:
本專案使用 Esri 的 ArcGIS Geocoding API 服務，透過 `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates` 端點提供地址解析功能。該服務將使用者輸入的地址轉換為地理座標（經緯度），用於計算真太陽時校正。

**歸屬要求**:
根據 Esri 的服務條款，使用 ArcGIS Geocoding API 的應用程式必須：
1. 在使用地理編碼功能的介面中顯示適當的歸屬聲明
2. 不得移除或隱藏 Esri 的歸屬資訊
3. 遵守 Esri 的使用配額和限制

本專案已在 `UnifiedInputForm.vue` 組件中添加 "Powered by Esri" 歸屬聲明，符合 Esri 服務條款要求。

**免責聲明**:
地理編碼服務由 Esri 提供，本專案不對地理編碼結果的準確性、可用性或適用性做出任何保證。使用者應自行評估地理編碼結果的準確性。

### AI 分析服務
- **Google Gemini API**
  - 服務提供商: Google LLC
  - 用途: AI 性格與運勢分析
  - 服務條款: https://ai.google.dev/terms
  - API 文檔: https://ai.google.dev/

## 授權相容性

本專案採用 **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**，與所有第三方依賴的授權相容：

### 專案授權限制
- **CC BY-NC-SA 4.0**: 允許非商業性的使用、修改、分發，但需保持相同授權條款
- **非商業性質**: 本專案禁止商業使用，但所有依賴函式庫均為允許商業使用的開源授權
- **姓名標示**: 必須給予適當表彰並提供授權條款連結
- **相同方式分享**: 衍生作品必須採用相同或相容的授權條款

### 依賴授權相容性說明
- **MIT License**: 允許商業使用、修改、分發、私人使用（與 CC BY-NC-SA 4.0 相容）
- **Apache License 2.0**: 允許商業使用、修改、分發、專利授權（與 CC BY-NC-SA 4.0 相容）

所有第三方依賴均採用較為寬鬆的 MIT 或 Apache 2.0 授權，允許本專案在 CC BY-NC-SA 4.0 授權下整合使用。本專案的非商業性限制僅適用於本專案的原創程式碼與內容，不影響第三方函式庫的原有授權條款。

## 歸屬聲明

本專案遵守所有第三方軟體的授權條款，保留原作者的版權聲明與授權資訊。

如有任何授權相關問題，請聯繫專案維護者。

---

**最後更新**: 2025-12-19
