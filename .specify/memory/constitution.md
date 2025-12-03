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
- 快取體驗: analyzeStream 先查 analysis_records，命中直接返回 SSE（0.118s，180x 提速）；快取 SSE 逐行輸出保留 Markdown，loading 文案依 cached 狀態切換；表單鎖定機制（currentChartId 存在時鎖定提交防重複計算）；移除 chartHistory
- UI 設計系統: UnifiedInputForm/UnifiedResultView 完整 CSS 變數化（--space-*/--font-size-*/--radius-*/--bg-*/--text-*），移除所有硬編碼與內聯樣式；移動端響應式優化（<768px Tab 44px 觸控目標、水平滾動、無痕滾動條）；按鈕圖標與 hover 動畫（Lock/Check/Delete + Tooltip）
- Bug 修復: Chart API 404（chartRoutes 註冊）、userId null≠'anonymous'、chartId 為唯一識別符、欄位轉換層（stem/branch↔gan/zhi、Wood/Fire↔木/火）、wuxingDistribution 英文鍵轉中文鍵、balance NaN 防護（?? 0）、AI 按鈕鎖定（chartStore 狀態同步）
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
- **狀態**: 生產運行中；Week 2 完成 ✅（進度 70/62h, 113%）
- **最後更新**: 2025-12-03 17:32
- **Week 2 核心成就**:
  - **AI Streaming 完整鏈路** ✓：Gemini SSE → D1 快取 → EventSource → Markdown 渲染；佩璇風格保留（口語化、生動比喻、情感化反應）
  - **快取性能提升** ✓：命中時 0.118s vs 初次 18-21s（180x 提速）；analysis_records 24h TTL 策略
  - **快取預檢查** ✓：GET `/api/v1/analyze/check` 端點 + checkCache()，loading 文案依 cached 狀態切換
  - **SSE 排版一致化** ✓：逐行輸出保留換行，延遲 10ms/行，快取/非快取格式一致
  - **UI 設計系統整合** ✓：完整 CSS 變數化（padding/margin/font-size/color 全部 token 化）；移動端響應式（<768px Tab 44px 觸控、水平滾動、無痕滾動條）
  - **表單鎖定與清除** ✓：有 chartId 時鎖定提交防重複計算；清除按鈕（Delete 圖標 + Tooltip）；按鈕圖標與 hover 動畫
  - **Bug 修復系列** ✓：Chart API 404（chartRoutes 未註冊）、userId null≠'anonymous'、chartId 唯一識別符、stem/branch→gan/zhi 轉換層缺失、wuxingDistribution 英文鍵→中文鍵、balance NaN nullish coalescing、AI 按鈕鎖定（chartStore 狀態同步）
  - **技術債償還** ✓：前端 ESLint 233→126（-46%）；npm 漏洞 7→0；日柱測試 3 失敗→20 通過（JDN API 對齊）；後端 ESLint 配置建立
  - **Prompt 精簡** ✓：350 → 150 tokens（-57%），範例 2 個，Max Output Tokens 2048，注入 currentYear
  - **性能監控** ✓：geminiService 日誌 tokens/cost/latency/errors；成本計算即時可視
- **架構決策記錄**:
  1. chartId 為唯一識別符：移除 userId AND 條件（類 URL shortener）
  2. 快取策略：chart_records 永久 + analysis_records 24h TTL；預檢查 /analyze/check 端點改善提示 UX
  3. 欄位標準化：後端 stem/branch ↔ 前端 gan/zhi 雙向轉換層；wuxingDistribution Wood/Fire ↔ 木/火 映射
  4. 狀態同步：UnifiedView 載入快取後必須 chartStore.setCurrentChart() 更新狀態以解鎖 AI 按鈕
  5. UI Token 化：完整採用 CSS 變數（--space-*/--font-size-*/--radius-*/--bg-*/--text-*），移除所有硬編碼數值與內聯樣式
- **既有成果延續**：開源整合策略確立（Phase A 完成，Phase B/C 保留 2042 行核心）、大運計歲真實歲數、四化飛星頂層彙總、Unified API/設計系統/部署穩定

## 已知缺口
- 日柱測試更新（匹配新 JDN API）(1h) — 已更新，但可再補充覆蓋率
- 補齊測試覆蓋 (3-4h)
- 依賴升級與警告清理 (2-3h)
- API/Streaming 文件更新 (1-2h)
- 前端 ESLint 剩餘 6 errors/120 warnings；後端 ESLint 3597 issues 需分批清理
- npm 依賴警告：目前 0（持續監控）
- 前端測試缺口：LanguageSelector 6 失敗（localStorage mock 未觸發）；需修復
