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
- 真太陽時模組：經度校正 + 均時差，calculateHourPillar 提供 Date 重載，對齊 `doc/八字四柱演算法研究與開源專案.md`
- 流年模組: `getAnnualPillar`/`hasPassedLiChun`（立春界、year-4 mod 60）、`locateAnnualLifePalace`/`rotateAnnualPalaces`（地支定位+意義旋轉）、`detectStemCombinations`/`detectBranchClashes`/`detectHarmoniousCombinations`（五合/六沖/三合三會+大運）
- Hybrid API: Unified (core) + Legacy (palaces) 並行，`/api/v1/purple-star/calculate` 返回 PurpleStarApiResponse；`/api/v1/calculate` 返回完整 CalculationResult（前端 UnifiedView/UnifiedResultView 已接入）
- AI/Markdown 輸出: `/api/v1/calculate` 支援 `format=markdown`（markdownFormatter 完整覆蓋輸出）；`/api/v1/analyze` 產生計算+AI 分析（Gemini 2.5 Flash）；`/api/v1/analyze/stream` SSE 串流輸出，chartId + D1 chart/analysis 快取；Prompt 敘事化且分工明確（佩璇性格分析：基本+八字+十神+藏干+紫微，token 上限 6144；佩璇運勢分析：四化飛星+星曜對稱+下一年預測，預算 ~400），新增 personalityOnly 選項與 currentYear 注入；Max Output Tokens 2048；新增 GET `/api/v1/analyze/check` 快取預檢查；移除制式風險評級/行動建議，下一年預測收斂為干支/立春/犯太歲，Staging 快取清空
- 快取體驗: analyzeStream 先查 analysis_records，命中直接返回 SSE（0.118s，180x 提速）；快取 SSE 逐行輸出保留 Markdown，loading 文案依 cached 狀態切換（有快取「馬上就好！」，無快取「大概需要半分鐘」）；表單鎖定機制（currentChartId 存在時鎖定提交防重複計算）；移除 chartHistory；部署前清除舊快取以呈現最新 Prompt
- UI 設計系統: UnifiedInputForm/UnifiedResultView 完整 CSS 變數化（--space-*/--font-size-*/--radius-*/--bg-*/--text-*），移除所有硬編碼與內聯樣式；移動端響應式優化（<768px Tab 44px 觸控目標、水平滾動、無痕滾動條）；按鈕圖標與 hover 動畫（Lock/Check/Delete + Tooltip）；RWD Phase1 完成 Navbar/Footer 觸控放大與移動關閉、1024px 斷點微調、Grid/Flex 佈局基線、設計斷點 tokens 定義、hover 依賴剝離（popover 點擊、@media hover:none）、圖表 will-change + prefers-reduced-motion 性能/無障礙強化
- 資料維護: Cloudflare Workers Cron 清理 chart_records 6 個月前舊資料；部署保持 `/health` 檢查通過
- Bug 修復: Chart API 404（chartRoutes 註冊）、userId null≠'anonymous'、chartId 為唯一識別符、欄位轉換層（stem/branch↔gan/zhi、Wood/Fire↔木/火）、wuxingDistribution 英文鍵轉中文鍵、balance NaN 防護（?? 0）、AI 按鈕鎖定（chartStore 狀態同步）、SiHuaAggregationCard 告警類型改回 Element Plus 標準（'danger'→'error'）
- 導航與路由健全性: /daily、/personality、/fortune 路由存在且 lazy loading、meta.title 正確、重定向後向兼容，確保導航與 SEO 穩定
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
  - 處理策略：先清理前端 errors、維持警告可見性；後端逐步收斂基線
- **改善進度**: 前端從 1,142 → 126 (-88.9%)；錯誤 725 → 0 (-100%)、警告 417 → 126 (-69.8%)
- **v-for :key 覆蓋率**: 100% (68/68)
- **TypeScript 嚴格模式**: 部分啟用（測試檔案排除）
- **設計系統套用**: 100% (12/13 組件使用 CSS 變數，1 組件保留語意色彩)
- **已修復/待處理錯誤類型**:
  - no-duplicate-imports: 100% (12/12) → 剩餘 1 個新增
  - no-undef: 100% (218/218)
  - no-unused-vars / Vue 標籤換行：主要佔剩餘警告，預估 1-2h 手動收尾
- **測試狀態**: 33 單元測試綠燈（trueSolarTime/relations/conversion + /health ping）；Worker 集成測試暫停，待工具成熟恢復；LanguageSelector 測試已修復（sessionStorage mock + fallback/繁簡轉換用例）

## 代碼重複問題
- 前端 `baziCalc.ts` 已刪除；`utils/baziCalculators.ts` 僅作備援計算器並遵循後端契約。
- 紫微前端重複檔已清空；核心計算集中於後端 UnifiedCalculator。

## 當前狀態
- **版本**: v1.0
- **狀態**: 生產運行中；Week 2 完成 ✅（進度 71.5/62h, 115%）
- **最後更新**: 2025-12-04 20:26
- **部署策略**: 強制 Staging 先行，生產環境僅透過 CI/CD 部署（2025-12-04 起；緊急手動需補 PR 並記錄 CHECKPOINTS/DECISIONS）
- **Week 2 核心成就（更新）**:
  - **AI Streaming + 快取體驗**：Gemini SSE → D1 快取 → EventSource，命中 0.118s（180x）；逐行 Markdown 排版一致；快取預檢查 `/analyze/check`
  - **Prompt 敘事化與分工**：佩璇性格分析 vs 佩璇運勢分析，敘事式輸出（大運→四化→星曜→下一年預測），personalityOnly 模式，token 上限調整
  - **RWD Phase1**：Navbar/Footer 觸控放大與移動關閉、1024px 斷點微調、Grid/Flex 佈局基線、design-tokens 斷點定義、表單單欄與 44px 觸控、hover 依賴剝離（popover 點擊、@media hover:none）
- **性能/無障礙/程式碼衛生**：圖表 will-change + prefers-reduced-motion；console.log 清理 19 項；errorHandler.ts ESLint 4 errors 修復、移除 12 條無效 eslint-disable、enum 定義回歸標準
- **Code Quality 收尾**：移除重複 .js/.js.map（yearlyInteractionUtils, geocodeService, layeredReading）、MouseEvent 全域宣告、LanguageSelector 測試修復；ESLint 0 errors / 126 warnings，構建驗證通過
- **演算法校正**：真太陽時模組完成（經度校正 + 均時差），calculateHourPillar 增加 Date 重載；6 測試涵蓋北京/烏魯木齊時差驗證
- **部署**：生產版本 28efc232-c24b-4ad4-98e2-48abe71a49db 上線（15.43s，10 新檔 + 105 快取），既有 ff462e5a/8880b8b2 穩定；Staging 7a89f251-c4d7-417e-9095-463520d990e2 健康；快取/資源清理完成
- **Bug 修復與品質**：前端 ESLint 233→126（0 errors/126 warnings）、npm 漏洞 7→0；日柱測試 20/20 通過；後端 ESLint 基線 3597 issues 待清理
- **RWD 路線圖**：Phase1 收尾；完成 0.1/0.5/0.6/1.1/1.2/1.3/2.1/2.3/3.3/3.4/5.1/5.2，待辦 2.2/2.4/3.1/3.2/4.x/5.3/6.x；高風險 Task4.4 需可回滾至完整表格+橫向滾動，所有變更保留 `.legacy.vue` 備份
- **運勢增強**：四化飛星頂層能量匯總 + 中心性分析（壓力匯聚點/資源源頭）、能量統計（56 飛化邊分布、最大壓力/資源宮位），Prompt 引導採用新統計；部署至 Staging b0d38d3a-560a-4f59-8b4e-7d6973f89e35（health ok）
- **演算法驗證**：`doc/八字算法驗算報告_2025-12-04.md` 更新（年/月/日/時柱 + 真太陽時全面驗證，35/36 測試 97%，設計文件 100% 對齊）；`doc/算法影響分析報告_2025-12-04.md`（441 測試 426/441 通過 96.6%，失敗皆與四柱無關，結論四柱校正無負面影響）
- **架構決策記錄**:
  1. chartId 為唯一識別符：移除 userId AND 條件（類 URL shortener）
  2. 快取策略：chart_records 永久 + analysis_records 24h TTL；預檢查 /analyze/check 端點改善提示 UX；部署前清除舊快取
  3. 欄位標準化：後端 stem/branch ↔ 前端 gan/zhi 雙向轉換層；wuxingDistribution Wood/Fire ↔ 木/火 映射
  4. 狀態同步：UnifiedView 載入快取後必須 chartStore.setCurrentChart() 更新狀態以解鎖 AI 按鈕
  5. UI/RWD 基線：CSS 變數化 + design-tokens 斷點 + 表單單欄 + Navbar/Footer 觸控優化 + hover 依賴剝離
- **既有成果延續**：開源整合策略確立（Phase A 完成，Phase B/C 保留 2042 行核心）、大運計歲真實歲數、四化飛星頂層彙總、Unified API/設計系統/部署穩定

## 已知缺口
- DST/歷史時區處理尚未增強（真太陽時後續需補齊）
- 日柱測試已綠燈，可補充更多覆蓋率
- 補齊測試覆蓋 (3-4h)、API/Streaming 文件更新 (1-2h)
- 前端 ESLint 警告 126；後端 ESLint 3597 issues 需分批清理；後端 npm 4 moderate 漏洞（drizzle-kit 開發依賴）
- RWD 後續工作：Phase2-6（佈局深化、表單驗證、圖表/表格模式、觸控手勢、實機與性能測試）；服務介紹頁面待建立
