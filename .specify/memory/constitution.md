# 專案憲法 - 佩璇 (Peixuan) 智能命理分析平台

## 專案身份
- **名稱**: 佩璇 (Peixuan)
- **版本**: v1.2.0
- **類型**: 智能命理分析平台
- **架構**: Cloudflare Workers + D1 + Vue 3
- **狀態**: 生產運行中
- **最後更新**: 2025-12-21

## 核心價值觀
- **傳統與現代融合**: 結合傳統命理智慧與現代 AI 技術
- **用戶體驗優先**: 從「工具」轉「夥伴」的設計理念
- **技術卓越**: Edge-first 架構，全球低延遲服務
- **開放透明**: 開源專案，CC BY-NC-SA 4.0 授權
- **品質至上**: 類型安全優先，測試驅動開發

## 技術棧憲章
### 後端 (Cloudflare Ecosystem)
- **Runtime**: Cloudflare Workers (Serverless 邊緣運算)
- **Language**: TypeScript 5.5+ (型別安全)
- **Router**: itty-router 5.x (輕量級)
- **Database**: Cloudflare D1 + Drizzle ORM (型別安全 SQL)
- **AI Provider**: Google Gemini 3.0 Flash Preview
- **AI Backup**: Azure OpenAI GPT-4o-mini
- **Streaming**: Server-Sent Events (SSE)

### 前端 (Modern Web Stack)
- **Framework**: Vue 3.5+ Composition API
- **Build Tool**: Vite 6.x
- **Language**: TypeScript 5.8+
- **State**: Pinia 3.x
- **UI Library**: Element Plus 2.10+
- **Router**: Vue Router 4.5+
- **i18n**: Vue I18n 9.x (中英雙語)

## 核心功能憲章
### 命理計算引擎
- **八字四柱**: UnifiedCalculator API，真太陽時校正
- **紫微斗數**: 108 顆星曜，四化飛星系統
- **流年分析**: 立春界定，太歲交互分析
- **統一架構**: 單一真相來源 (Single Source of Truth)

### AI 智能分析
- **每日一問**: Agentic AI 系統，ReAct 模式，Function Calling
- **雙引擎備援**: Gemini + Azure OpenAI 確保服務穩定
- **串流體驗**: SSE 即時回應，打字機效果
- **智能快取**: D1 多層快取，0.118s 命中率

### 用戶體驗設計
- **響應式設計**: Mobile-First，44px 觸控目標
- **深色模式**: 完整 Element Plus 組件支援
- **國際化**: 完整中英雙語支援
- **無障礙**: prefers-reduced-motion 支援

## 架構決策原則
1. **最小化實作**: 避免過度工程化
2. **類型安全優先**: TypeScript + Drizzle ORM
3. **Edge-First**: 全球邊緣部署，超低延遲
4. **漸進增強**: 核心功能優先，逐步擴展
5. **向後相容**: API 版本管理，平滑升級

## 代碼品質標準
### ESLint 合規性
- **前端**: 0 errors / 126 warnings (88.9% 改善)
- **後端**: 基線 3597 issues，逐步收斂
- **覆蓋率**: v-for :key 100% (68/68)
- **TypeScript**: 嚴格模式，測試檔案排除

### 測試策略
- **單元測試**: 33 項綠燈 (trueSolarTime/relations/conversion)
- **集成測試**: /health 端點驗證
- **算法驗證**: 八字算法 35/36 通過 (97%)

### 設計系統
- **CSS 變數化**: 100% 組件使用 design tokens
- **觸控優化**: 44px 最小觸控目標
- **動畫性能**: will-change + prefers-reduced-motion

## 部署與運維憲章
### 部署策略
- **強制 Staging 先行**: 所有變更必須先部署 staging 驗證
- **CI/CD 自動化**: GitHub Actions，生產環境僅透過 CI/CD
- **健康檢查**: /health 端點，確保服務可用性

### 數據管理
- **快取策略**: chart_records 永久，analysis_records 24h TTL
- **數據清理**: Cron 清理 6 個月前舊資料
- **隱私保護**: 匿名用戶支援，chartId 唯一識別

### 錯誤處理
- **重試機制**: Gemini API 503/429 指數退避
- **降級策略**: Azure OpenAI 備援
- **用戶友好**: 佩璇風格錯誤訊息

## 國際化憲章
- **雙語支援**: 繁體中文 (zh_TW) + 英文 (en)
- **ElMessage 國際化**: 所有用戶提示訊息雙語
- **AI 分析**: 根據 locale 生成對應語言內容
- **快取隔離**: 中英文分析獨立快取

## 品牌識別憲章
- **視覺元素**: 獨角獸 🦄 + 頭昏眼花 😵‍💫 emoji
- **色彩系統**: 品牌棕色 (#8B4513) + 橙色 (#D2691E)
- **圖標設計**: SVG 獨角獸 favicon/app icon，emoji 風格
- **人物設定**: 佩璇 - 20歲神秘可愛命理師

## 開源與授權憲章
- **授權**: Creative Commons BY-NC-SA 4.0
- **商業使用**: 需要額外授權
- **貢獻**: 歡迎社群貢獻，遵循 Conventional Commits
- **透明度**: 技術決策公開記錄

## 未來發展方向
- **RWD 深化**: Phase2-6 (佈局深化、表單驗證、圖表優化)
- **測試覆蓋**: 補齊 API/Streaming 測試
- **性能優化**: DST/歷史時區處理
- **功能擴展**: 服務介紹頁面

---

*本憲法定義了佩璇專案的核心價值、技術標準和發展方向，所有開發決策應以此為準則。*
