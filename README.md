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
- Node.js
- TypeScript
- Express.js
- JWT 驗證
- 日誌與監控系統

### 前端
- Vue 3
- TypeScript
- Vite
- Vue Router
- i18n 國際化

### 數據處理
- 紫微斗數計算引擎 (後端實現)
- 八字排盤演算法 (前端實現，使用 lunar.min.js)
- 多維度交叉驗證模型

## 🚀 快速開始

### 環境要求
- Node.js 16+
- npm 8+
- Docker (可選)

### 安裝步驟
```bash
# 克隆倉庫
git clone https://github.com/your-username/peixuan.git

# 進入專案目錄
cd peixuan

# 安裝後端依賴
cd backend-node
npm install

# 安裝前端依賴
cd ../bazi-app-vue
npm install

# 啟動開發伺服器
npm run dev
```

### 使用 Docker 啟動
```bash
# 使用 Docker Compose 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

## 🔒 安全性

- JWT 身份驗證
- 基於角色的存取控制
- 敏感資料加密
- 多層安全驗證機制

## 📊 API 端點

### 多術數交互驗證
- `POST /api/v1/astrology/integrated-analysis`
- `POST /api/v1/astrology/confidence-assessment`

### 紫微斗數
- `POST /api/v1/purple-star/calculate`
- `GET /api/v1/purple-star/chart`

### 用戶認證
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

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

## 📝 專案狀態

### 已完成功能
- ✅ 基礎架構設置
- ✅ 八字計算系統 (前端純本地計算)
- ✅ 紫微斗數基本計算
- ✅ 國際化支持 (中文、繁體中文、英文)
- ✅ 用戶界面基本組件

### 進行中功能
- 🔄 紫微斗數表單與API整合
- 🔄 多術數交互驗證系統
- 🔄 用戶數據管理
- 🔄 系統性能優化

### 待開發功能
- ⏳ 高級用戶權限管理
- ⏳ 命盤比較功能
- ⏳ 命盤解讀自動生成
- ⏳ 社區功能

## 🌈 未來藍圖

- [ ] 機器學習增強預測
- [ ] 更多命理系統整合
- [ ] 個性化推薦引擎
- [ ] 跨平台移動應用

## 🤝 貢獻指南

請閱讀 [PROJECT_VALIDATION.md](PROJECT_VALIDATION.md) 了解詳細的專案驗證標準。

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 聯繫我們

- 電子郵件：support@peixuan.com
- 社群論壇：[討論區連結]
- 技術支持：[支持連結]

---

**免責聲明**：本平台提供的分析僅供參考，不應作為重大決策的唯一依據。
