# 決策記錄 (壓縮版)

## 2025-12-21: Daily Question 功能增強與 UI/UX 全面優化
- **Emoji 個性化**: 🦄 獨角獸 + 😵‍💫 頭昏眼花，符合佩璇人物設定
- **確認對話框美化**: 品牌一致漸層設計 + 深色模式支援
- **首頁整合**: 每日一問服務卡片 + 雙語支援
- **ElMessage 國際化**: 全組件提示訊息中英文支援
- **獨角獸圖標**: 品牌色 SVG favicon/app icon，emoji 風格設計
- **Mobile Navbar 統一**: 一致 `<a>` 標籤結構，簡化 CSS
- **狀態**: ✓ 全功能部署 staging 驗證完成

## 2025-12-20: 網站 UX 重新設計與每日一問完整實現
- **UX 重新設計**: 從「工具」轉「夥伴」，漸進式揭露 + 敘事優先
- **每日一問 Agentic AI**: ReAct 模式 + Function Calling (5工具) + 雙 AI 引擎備援
- **聊天式 UI**: ChatBubble 組件 + 打字機效果 + 思考過程展示
- **視覺增強**: 深度互動效果 + 大氣背景 + 多層陰影漸層
- **RWD 優化**: 移動端優先 + 觸控優化 + 動畫性能修復
- **狀態**: ✓ 主要重新設計完成

## 2025-12-19: 視覺增強與組件品質提升
- **視覺增強 Phase 1-3**: 標點感知打字機 + 漸層渲染 + 懸停動效 + 滾動視差
- **組件清理**: 刪除未使用組件 20→18，修復 ESLint 錯誤
- **ArcGIS 合規**: Esri 歸屬聲明 + CC BY-NC-SA 4.0 授權
- **UnifiedInputForm 重構**: 1093→484 行，提取 4 composables
- **狀態**: ✓

## 2025-12-18: 字型渲染與安全審計
- **字型渲染**: 星曜亮度漸層 + 自定義 marked 渲染器
- **快取隔離**: locale 分離 `ai-streaming-${locale}-personality`
- **安全審計**: 無 API Keys 洩漏 + .gitignore 更新
- **GitHub Footer**: 開源專案連結 + i18n 支援
- **狀態**: ✓

## 2025-12-17: Gemini API 重試機制
- **503 重試**: 指數退避 3 次 + 45s 超時
- **代碼重構**: 複雜度 19→3-5，嵌套 5-7→3-4 層
- **TypeScript 修復**: @cloudflare/workers-types + globalThis
- **CI/CD 調整**: ESLint 失敗不阻塞構建
- **狀態**: ✓

## 2025-12-08: 年運雙流年與品牌更新
- **雙流年**: YearlyPeriod/YearlyForecast + taiSuiAnalysis + interactions
- **測試**: yearlyForecast 20/20 + SSE 26 chunks/~30s
- **品牌更新**: 深紫+金色星盤 favicon/apple-touch-icon
- **狀態**: ✓

## 2025-12-06-07: 多語言 AI 與每日提醒整合
- **多語言緩存**: DB migration 0003 + `ai-advanced-${locale}` 獨立快取
- **英文 SSE 修復**: 移除重複 languageInstruction + 完整 prompt
- **超時處理**: AbortController 30-45s + 佩璇風格錯誤處理
- **每日提醒整合**: DailyReminderCard → HomeView
- **狀態**: ✓

## 2025-12-04: 產品定位與 RWD Phase1
- **運勢分析增強**: 四化頂層能量匯總 + 中心性分析
- **算法驗證**: 441 測試 426 通過 (96.6%) + 八字算法 35/36 (97%)
- **AI 分析分工**: 性格分析 vs 運勢分析，敘事化輸出
- **RWD Phase1**: Navbar/Footer 觸控 + 1024px 斷點 + hover 依賴剝離
- **生產治理**: 強制 Staging 先行 + CI/CD 部署
- **狀態**: ✓

## 2025-12-03: AI Streaming 與快取體驗
- **Gemini Streaming**: SSE + D1 快取 + 0.118s 命中 (180x 提速)
- **前端 AI**: chartStore + EventSource + marked 渲染
- **Prompt 精簡**: -57% tokens + Max Output 2048
- **UI 設計系統**: CSS 變數化 + 觸控目標 44px
- **狀態**: ✓

## 2025-12-02: 開源整合與大運修正
- **開源評估**: Phase A 完成，Phase B/C 保留 (2042 行)
- **驗算測試**: lunar-typescript + iztro 驗證 10/10 通過
- **大運計歲**: 真實歲數 startAge+endAge，22 測試通過
- **狀態**: ✓

## 2025-12-01: 藏干/十神替換與 ESLint 清理
- **Phase A 替換**: lunar-typescript 替換 274 行，API 完全相容
- **Hybrid 整合**: 年柱社群算法 + 月/日/時 Legacy 公式
- **ESLint 修復**: 錯誤 26→0，總問題 152→107
- **前端統一**: unifiedApiService 唯一資料源
- **狀態**: ✓

## 2025-11-30: 流年計算與統一架構
- **流年計算**: 立春界 + 地支定位+意義旋轉 + 五合六沖三合三會
- **FortuneCycles**: 起運方向 XOR + 60 甲子模運算
- **UnifiedCalculator**: 單一真相來源 + Hybrid 架構
- **Worker 測試**: 33 單元測試綠燈 + 設計系統 CSS 變數化
- **狀態**: ✓

## 2025-11-29: Cloudflare Workers 遷移與紫微斗數
- **Workers 部署**: 環境隔離 + Node.js v20 + esbuild 預編譯
- **紫微斗數**: 複用前端 683 lines + lunar-typescript 替代
- **ESLint 基線**: 699 issues (錯誤 307/警告 392)
- **技術選型**: itty-router + Drizzle ORM
- **狀態**: ✓

## 核心成就總結
- **AI 系統**: Gemini 3.0 + Azure 備援 + Function Calling + ReAct 模式
- **架構**: Cloudflare Workers + D1 + 全球邊緣部署
- **算法**: 八字四柱 + 紫微斗數 + 真太陽時 + 流年分析
- **UX**: 工具→夥伴轉型 + 響應式設計 + 深色模式
- **品質**: ESLint 合規 + 測試覆蓋 + 安全審計
- **國際化**: 中英雙語 + 完整 i18n 支援

## 2025-12-21: CSS 動畫移動端修復完成
- **移動端動畫失效修復**: 移除激進的 animation: none !important，改用溫和策略
- **will-change 統一管理**: 清理 5 個組件分散設定，統一 CSS 類別系統
- **無障礙功能補齊**: 為 6 個組件添加 prefers-reduced-motion 支援
- **iOS Safari 兼容性**: 全面添加 -webkit- 前綴支援
- **性能優化**: 連續動畫改用 iteration-count: 1，保留入場動畫
- **狀態**: ✓ 全面修復完成，生產環境部署中

- [DECISION] 2025-12-21: CSS 動畫移動端修復完成。移除激進 !important，統一 will-change 管理，補齊無障礙支援，全面 iOS Safari 兼容。用戶體驗問題已解決。

- [DECISION] 2025-12-21: 兩環境配置完善完成。生產環境補上 ENVIRONMENT secret，修正 staging 環境 vars 配置警告，創建重建腳本。配置現已完全一致。
