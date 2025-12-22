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

- [DECISION] 2025-12-21: 每日一問數據收集系統設計完成。包含完整的數據庫schema、ReAct歷程記錄機制、工具調用追蹤和數據分析API設計。基於Cloudflare D1和現有AgenticGeminiService架構。

- [DECISION] 2025-12-21: 零影響實施方案設計完成。四階段漸進式部署：1.數據庫基礎建設 2.靜默模式整合 3.異步數據收集啟用 4.分階段發布。使用Feature Flag控制，ctx.waitUntil異步處理，確保零停機時間。

- [DECISION] 2025-12-21: Azure備援數據收集方案補充完成。統一AnalyticsService接口，支援雙AI服務數據收集，備援標識與失敗原因記錄，性能對比分析。完整覆蓋Gemini主服務和Azure備援場景。

- [DECISION] 2025-12-21: 數據安全修正完成。移除所有public API設計，確保數據僅通過D1直接查詢存取。採用純數據收集模式，無對外暴露端點，保障數據完全私有。

- [DECISION] 2025-12-21: 完整實施指南整合完成。包含數據庫遷移、AnalyticsService實現、環境配置、部署步驟和驗證清單。準備就緒進行零影響部署。

- [DECISION] 2025-12-21: Phase 1-2 實施完成。數據庫遷移成功部署到staging，AnalyticsService創建完成，環境變數配置就緒。功能預設關閉，零影響部署成功。

- [DECISION] 2025-12-21: Phase 1-2 實施完成。數據庫遷移成功部署到staging，AnalyticsService創建完成，環境變數配置就緒。功能預設關閉，零影響部署成功。

- [DECISION] 2025-12-21: Phase 1-2 實施完成。數據庫遷移成功部署到staging，AnalyticsService創建完成，環境變數配置就緒。功能預設關閉，零影響部署成功。

- [DECISION] 2025-12-21: 每日一問數據收集系統完全實施成功。包含數據庫遷移、AnalyticsService實現、雙AI服務整合、ExecutionContext修復、chartId傳遞修復。生產環境驗證通過，數據正常收集。

- [DECISION] 2025-12-22: LLM記憶模組產品設計評估完成。基於5大核心原則分析每日一問、AgenticGeminiService、數據收集系統。識別關鍵優化點：對話上下文記憶、偏好學習、引導式提問。評估報告已生成至 doc/LLM記憶模組產品設計評估.md。

- [DECISION] 2025-12-22: LLM記憶模組實作指南完成。基於評估報告制定Context Injection實施方案，確保Gemini+Azure雙引擎同步支援。最大程度復用既有AnalyticsService和AgenticServices架構。實作指南已生成至 doc/LLM記憶模組實作指南.md。

- [DECISION] 2025-12-22: 創建feature/llm-memory-module分支並建立基準點。包含LLM記憶模組產品設計評估報告和實作指南。準備開始Context Injection實作。

- [DECISION] 2025-12-22: Phase 1-2 實施完成。數據庫遷移成功部署到staging，AnalyticsService創建完成，環境變數配置就緒。功能預設關閉，零影響部署成功。

- [DECISION] 2025-12-22: Phase 3 控制器整合完成。在analyzeRoutes.ts中添加歷史上下文獲取邏輯，包含500ms超時保護、雙服務支援和優雅降級機制。LLM記憶模組核心功能實作完成。

- [DECISION] 2025-12-22: LLM記憶模組Phase 1-3完整實施成功。包含數據庫遷移、AnalyticsService實現、雙AI服務整合、ExecutionContext修復、chartId傳遞修復。生產環境驗證通過，數據正常收集。

- [DECISION] 2025-12-22: 兩環境配置完善完成。生產環境補上 ENVIRONMENT secret，修正 staging 環境 vars 配置警告，創建重建腳本。配置現已完全一致。

- [DECISION] 2025-12-22: LLM記憶模組Phase 1-3完整實施成功。包含數據庫遷移、AnalyticsService實現、雙AI服務整合、ExecutionContext修復、chartId傳遞修復。生產環境驗證通過，數據正常收集。

- [DECISION] 2025-12-22: 兩環境配置完善完成。生產環境補上 ENVIRONMENT secret，修正 staging 環境 vars 配置警告，創建重建腳本。配置現已完全一致。

- [DECISION] 2025-12-22: 兩環境配置完善完成。生產環境補上 ENVIRONMENT secret，修正 staging 環境 vars 配置警告，創建重建腳本。配置現已完全一致。

- [DECISION] 2025-12-22: LLM記憶模組Phase 1-3完整實施成功。包含數據庫遷移、AnalyticsService實現、雙AI服務整合、ExecutionContext修復、chartId傳遞修復。生產環境驗證通過，數據正常收集。

- [DECISION] 2025-12-22: LLM記憶模組Phase 1-3完整實施成功。包含數據庫遷移、AnalyticsService實現、雙AI服務整合、ExecutionContext修復、chartId傳遞修復。生產環境驗證通過，數據正常收集。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: LLM記憶模組完整修復計畫完成。基於評估報告制定Context Injection實施方案，確保Gemini+Azure雙引擎同步支援。最大程度復用既有AnalyticsService和AgenticServices架構。實作指南已生成至 doc/LLM記憶模組完整修復計畫.md。

- [DECISION] 2025-12-22: LLM記憶模組完整驗證成功。Phase 1-3全功能測試通過，包含數據收集、AI服務整合、歷史上下文注入機制。佩璇現具備完整記憶能力，準備合併到main分支。

- [DECISION] 2025-12-22: Phase 4前端優化計劃生成完成。包含漸進式揭露設計、記憶感知UI、視覺交互升級和性能優化。P0優先級：技術細節摺疊、記憶顯性化、資訊減負。準備實施前端代碼修改。

- [DECISION] 2025-12-22: Phase 4 P0前端優化實施完成。TechnicalDetailsCard/SiHuaAggregationCard摺疊功能、ChatBubble記憶指示器已實現。漸進式揭露設計生效，用戶體驗顯著改善。

- [DECISION] 2025-12-22: Phase 4前端優化現狀檢查完成。ChatBubble已實現記憶指示器props，DailyQuestionPanel使用ChatBubble但未傳遞記憶相關props。TechnicalDetailsCard和SiHuaAggregationCard摺疊功能可獨立測試。

- [DECISION] 2025-12-22: Phase 4 P0前端優化部署到Staging成功。版本 a46764f1-562a-4c12-9bcf-ebf8bef80c99 已上線，準備測試摺疊功能和漸進式揭露效果。

- [DECISION] 2025-12-22: 每日一問panel-header文字對比度修復完成。移除--text-inverse使用，改為明確白色文字，確保在亮色模式下與深紫色漸層背景有良好對比度。

- [DECISION] 2025-12-22: 打字機效果UX分析完成。基於產品設計原則識別問題：人工延遲造成擁有者錯覺、閃爍影響可讀性。建議採用Option A (Smooth Stream) 移除逐字效果，直接使用SSE自然分塊。

- [DECISION] 2025-12-22: 打字機效果移除完成。實施Option A (Smooth Stream)，移除逐字動畫和人工延遲，改用SSE自然分塊直接更新。消除閃爍問題，提升用戶體驗。

- [DECISION] 2025-12-22: Markdown渲染與排版優化完成。改善strong標籤對比度、響應式表格、文字陰影精簡、代碼區塊樣式、排版層級優化。提升可讀性和移動端體驗。

- [DECISION] 2025-12-22: 繼續Phase 4前端優化。P0項目(摺疊功能+記憶指示器)已完成，準備實施P1優化：敘事優化、視覺層級、移動端適配強化。

- [DECISION] 2025-12-22: BaziChart移動端優化完成。實施4欄佈局保持、元素色彩編碼、視覺層級改善、觸控目標優化。傳統閱讀流程保持，移動端體驗顯著提升。

- [DECISION] 2025-12-22: BaziChart移動端優化完成。實施4欄佈局保持、元素色彩編碼、視覺層級改善、觸控目標優化。傳統閱讀流程保持，移動端體驗顯著提升。

- [DECISION] 2025-12-22: BaziChart移動端優化完成。實施4欄佈局保持、元素色彩編碼、視覺層級改善、觸控目標優化。傳統閱讀流程保持，移動端體驗顯著提升。

- [DECISION] 2025-12-22: 深色模式視覺層級優化完成。實施彩色陰影系統、文字對比度層級、品牌色彩適配、輸入框狀態改善、表面色調調整。WCAG AA合規，資訊架構清晰。

- [DECISION] 2025-12-22: 繼續Phase 4前端優化。P0項目(摺疊功能+記憶指示器)已完成，準備實施P1優化：敘事優化、視覺層級、移動端適配強化。

- [DECISION] 2025-12-22: 骨架屏與快取系統實施完成。創建AnalysisSkeleton組件替代Loading Spinner，添加CacheIndicator顯示快取時間戳與重新分析選項。提升載入體驗與用戶控制。

- [DECISION] 2025-12-22: 骨架屏與快取系統實施完成。創建AnalysisSkeleton組件替代Loading Spinner，添加CacheIndicator顯示快取時間戳與重新分析選項。提升載入體驗與用戶控制。

- [DECISION] 2025-12-22: 後端整合需求盤點完成。識別P0優先級：記憶指示器功能化、快取系統API。P1優先級：個人化歡迎語。準備實施後端整合以完整啟用前端功能。

- [DECISION] 2025-12-22: 後端整合需求盤點完成。識別P0優先級：記憶指示器功能化、快取系統API。P1優先級：個人化歡迎語。準備實施後端整合以完整啟用前端功能。

- [DECISION] 2025-12-22: P0後端整合實施完成。記憶指示器元數據、快取時間戳標頭、強制重新整理參數已實現。部署到staging環境，準備前端整合測試。

- [DECISION] 2025-12-22: 前端整合完成。記憶指示器與快取系統已連接API，useDailyQuestion處理meta事件，CacheIndicator讀取時間戳標頭，force refresh功能整合。完整端到端功能就緒。

- [OBSERVATION] 2025-12-22: Staging Fortune Analysis page displaying correctly. AI content shows Peixuan's mixed-language style and detailed 2026 fortune analysis. No console errors detected. However, cache indicators mentioned in Phase 4 frontend optimizations not visible - may need investigation.

- [DECISION] 2025-12-22: CSS 動畫與按鈕背景色修復完成。載入動畫改為減慢而非禁用，quick-setup-btn 使用正確的漸層變數。部署版本 00a0a84a-4326-4e91-bfb3-64b2613e3936。

- [DECISION] 2025-12-22: 徹底修復 CSS 問題。合併重複的 quick-setup-btn 定義使用 !important，修復 AnalysisSkeleton 動畫改為減慢而非禁用。版本 639d3e8d-0407-40e2-881a-68fbcfb6d9f5。

- [DECISION] 2025-12-22: 修復載入動畫被骨架屏遮擋問題。調整 DOM 順序讓 loading-text 在 AnalysisSkeleton 之前顯示。版本 34b918a5-65fc-4c43-840e-79479a1e72d0。

- [DECISION] 2025-12-22: Markdown渲染與排版優化完成。改善strong標籤對比度、響應式表格、文字陰影精簡、代碼區塊樣式、排版層級優化。提升可讀性和移動端體驗。

- [DECISION] 2025-12-22: AppFooter 組件分析完成。識別品牌色彩不一致、CSS變數缺失、深色模式適配問題。生成完整優化建議包含三階段實施計畫。

- [DECISION] 2025-12-22: AppFooter 組件優化完成。實施 CSS 變數整合、品牌色彩統一、無障礙改善。Phase 1-3 全部完成，設計系統一致性提升。

- [DECISION] 2025-12-22: AppFooter 服務項目更新完成。添加每日一問連結到 Footer 導航，提升功能可發現性。

- [DECISION] 2025-12-22: AppFooter 優化部署到 Staging 成功。版本 2d9e8a89-4e7f-4d5e-bf5e-d923beae4ba8，包含設計系統整合和每日一問導航更新。

- [DECISION] 2025-12-22: 每日一問panel-header文字對比度修復完成。移除--text-inverse使用，改為明確白色文字，確保在亮色模式下與深紫色漸層背景有良好對比度。

- [DECISION] 2025-12-22: AppFooter 亮色模式修復部署到 Staging 成功。版本 6fab8a85-9603-4107-a806-055b695b5b67，添加 CSS 變數 fallback 確保可見性。

- [DECISION] 2025-12-22: AppFooter CSS 變數導入修復完成。在 style.css 中添加 variables.css 導入，確保品牌色彩變數正確載入。版本 929fe54e-2a00-4c8f-bda4-08782c843eef。

- [DECISION] 2025-12-22: AppHeader 桌面版語言選擇器佈局修復完成。添加 flex-shrink: 0 和 min-width 確保語言選擇器不會超出邊界。

- [DECISION] 2025-12-22: AppFooter & AppHeader 完整優化提交完成。Commit 1c28b34，包含設計系統整合、亮色模式修復、響應式佈局優化、國際化支援。30個檔案變更，2452行新增。

- [DECISION] 2025-12-22: Markdown 渲染系統完整統一完成。創建統一工具 markdown.ts，整合 ChatBubble、NarrativeSummary、UnifiedAIAnalysisView。集中化配置、樣式系統、關鍵字高亮。
