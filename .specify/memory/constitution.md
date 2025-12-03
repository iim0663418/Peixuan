# 專案特性記錄

## 專案概述
- **名稱**: 佩璇 (Peixuan)
- **類型**: 智能命理分析平台
- **架構**: Cloudflare Workers + D1 + Vue 3

## 技術棧
- **運算**: Cloudflare Workers, TypeScript, itty-router
- **資料**: D1 (SQLite), Drizzle ORM
- **前端**: Vue 3, Vite, PWA

## 核心功能
- 八字計算：後端 UnifiedCalculator API；前端備援 `utils/baziCalculators.ts`（型別由 `types/baziTypes.ts` 定義，僅於 Worker 故障時啟用以維持單一真相來源）
- 紫微斗數計算 (Worker 實現 - purpleStarCalculation.ts 681 lines)
- 命盤記錄管理 (CRUD)
- 分析記錄管理 (CRUD)
- 匿名用戶支援
- 前端靜態資源服務
- UnifiedCalculator: 八字+紫微統一計算，CalculationResult 包含 hiddenStems、tenGods、starSymmetry、steps、metadata
- FortuneCycles: 起運/大運計算（determineFortuneDirection、calculateQiYunDate、generateDaYunList、自動當前大運偵測）整合於 BaZiResult.fortuneCycles
- 大運計歲：使用真實歲數（startAge/endAge），從出生日期開始計算
- 流年模組: `getAnnualPillar`/`hasPassedLiChun`（立春界、year-4 mod 60）、`locateAnnualLifePalace`/`rotateAnnualPalaces`（地支定位+意義旋轉）、`detectStemCombinations`/`detectBranchClashes`/`detectHarmoniousCombinations`（五合/六沖/三合三會+大運）
- Hybrid API: Unified (core) + Legacy (palaces) 並行，`/api/v1/purple-star/calculate` 返回 PurpleStarApiResponse；`/api/v1/calculate` 返回完整 CalculationResult（前端 UnifiedView/UnifiedResultView 已接入）
- AI/Markdown 輸出: `/api/v1/calculate` 支援 `format=markdown`（markdownFormatter 完整覆蓋輸出）；`/api/v1/analyze` 產生計算+AI 分析（Gemini 2.5 Flash）；`/api/v1/analyze/stream` SSE 串流輸出，chartId + D1 chart/analysis 快取；Prompt 口語化佩璇風格，Max Output Tokens 2048，加入 currentYear 防止年份誤判；新增 GET `/api/v1/analyze/check` 快取預檢查
- 快取體驗: analyzeStream 先查 analysis_records，命中直接返回 SSE（0.118s）；快取 SSE 逐行輸出保留 Markdown，loading 文案依 cached 狀態切換；UnifiedView 自動載入 savedMetadata，移除 chartHistory
- Worker 測試：對齊 `/health` 端點並啟用 `nodejs_compat`；保留單元測試 33 項，暫停 workerd 集成測試

## 架構決策
- 最小化實作原則
- 類型安全優先 (TypeScript + Drizzle)
- Edge-first 架構
- 自動化部署 (GitHub Actions)
- 前端八字計算 + 後端紫微計算

## 程式碼品質基線
- **ESLint 當前狀態**: 前端 6 errors / 120 warnings；後端 3597 issues（新建配置）
  - 前端：233 → 126 總問題（12 errors → 6 errors）；剩餘多為 @typescript-eslint/no-explicit-any/風格類
  - 後端：新增 ESLint 配置，初始基線 3597 issues，後續批次清理
  - 處理策略：先封頂同步功能與測試，分批處理前端 6 errors → 0；後端逐步收斂
- **改善進度**: 前端從 1,142 → 126 (-88.9%)；錯誤 725 → 6 (-99.2%)、警告 417 → 120 (-71.2%)
- **v-for :key 覆蓋率**: 100% (68/68)
- **TypeScript 嚴格模式**: 部分啟用（測試檔案排除）
- **設計系統套用**: 100% (12/13 組件使用 CSS 變數，1 組件保留語意色彩)
- **已修復/待處理錯誤類型**:
  - no-duplicate-imports: 100% (12/12) → 剩餘 1 個新增
  - no-undef: 100% (218/218)
  - no-unused-vars / Vue 標籤換行：主要佔剩餘 26 errors，預估 1-2h 手動收尾
- **測試狀態**: 33 單元測試綠燈（trueSolarTime/relations/conversion + /health ping）；Worker 集成測試暫停，待工具成熟恢復；前端 LanguageSelector 測試尚 6 失敗（localStorage mock 未觸發）

## 代碼重複問題
- 前端 `baziCalc.ts` 已刪除；`utils/baziCalculators.ts` 僅作備援計算器並遵循後端契約。
- 紫微前端重複檔已清空；核心計算集中於後端 UnifiedCalculator。

## 當前狀態
- **版本**: v1.0
- **狀態**: 生產運行中；Phase 1-4 + Task A1/A2 完成；Sprint R5 前端統一遷移完成；設計系統套用完成；四化飛星頂層彙總完成；lunar-typescript 整合完成；Phase A 藏干/十神替換完成；大運計歲修正完成
- **優化階段**: Week 2 技術債務清理 + 開源整合評估 + Bug 修復 + AI Streaming/監控完成
 - **最後更新**: 2025-12-03 17:28（cache/UX/AI streaming 核心同步：快取預檢查 + 命中 0.118s + SSE 逐行保留 Markdown + metadata 自動回填/移除 chartHistory）
- **最新成果**:
  - **AI 整合/Streaming** ✓：`/api/v1/analyze` + `/api/v1/analyze/stream`（Gemini 2.5 Flash），Markdown Formatter + AI 分析輸出，SSE 27 chunks/19s，chartId + D1 快取，前端 AIAnalysisView/路由/ChartStore + EventSource 串流
  - **Prompt 精簡 + 年份保護** ✓：佩璇 Prompt -57% tokens，範例 2 個，Max Output Tokens 2048，注入 currentYear，語氣/比喻/粗體保留，AI 年份誤判修正
  - **性能監控** ✓：geminiService 日誌 tokens/cost/latency/errors；成本計算 (prompt/completion rates) 即時可視；Response time 18-25s
  - **測試/品質** ✓：markdownFormatter.test.ts 14/14 通過；大運/日柱測試 20/20；AI Streaming 實測 20+ chunks；npm 漏洞 7→0；後端 ESLint 配置新增
  - **Lint/債務狀態**：前端 ESLint 6 errors/120 warnings（233→126）；後端 ESLint 3597 issues 基線；前端 EventSource 錯誤修復
  - **既有成果延續**：開源整合策略確立（Phase A 完成，Phase B/C 保留 2042 行核心）、大運計歲真實歲數、四化飛星頂層彙總、Unified API/設計系統/部署穩定
  - **快取/UX 提速** ✓：新增 `/api/v1/analyze/check` 預檢查；analysis_records 命中直接回傳 SSE，快取命中 0.118s；SSE 逐行輸出保留 Markdown；UnifiedView 自動回填 savedMetadata，移除 chartHistory，Navbar 去除 🤖 emoji，App.vue DOM 操作封裝 closeMobileMenu() 解 TS

## 已知缺口
- 日柱測試更新（匹配新 JDN API）(1h) — 已更新，但可再補充覆蓋率
- 補齊測試覆蓋 (3-4h)
- 依賴升級與警告清理 (2-3h)
- API/Streaming 文件更新 (1-2h)
- 前端 ESLint 剩餘 6 errors/120 warnings；後端 ESLint 3597 issues 需分批清理
- npm 依賴警告：目前 0（持續監控）
- 前端測試缺口：LanguageSelector 6 失敗（localStorage mock 未觸發）；需修復
