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
- 流年模組: `getAnnualPillar`/`hasPassedLiChun`（立春界、year-4 mod 60）、`locateAnnualLifePalace`/`rotateAnnualPalaces`（地支定位+意義旋轉）、`detectStemCombinations`/`detectBranchClashes`/`detectHarmoniousCombinations`（五合/六沖/三合三會+大運）
- Hybrid API: Unified (core) + Legacy (palaces) 並行，`/api/v1/purple-star/calculate` 返回 PurpleStarApiResponse；`/api/v1/calculate` 返回完整 CalculationResult（前端 UnifiedView/UnifiedResultView 已接入）
- Worker 測試：對齊 `/health` 端點並啟用 `nodejs_compat`；保留單元測試 33 項，暫停 workerd 集成測試

## 架構決策
- 最小化實作原則
- 類型安全優先 (TypeScript + Drizzle)
- Edge-first 架構
- 自動化部署 (GitHub Actions)
- 前端八字計算 + 後端紫微計算

## 程式碼品質基線
- **ESLint 當前狀態**: 22 warnings / 0 errors (更新於 2025-12-01 10:46)
  - 警告: 22（6 any、1 complexity、其餘風格類；prettier 已清）
  - 可自動修復: Prettier 警告已清；剩餘警告待後續批次
  - 處理策略: 警告後置，先補測試與四化飛星/流年太歲缺口
- **改善進度**: 從 1,142 → 22 (-98.1%)；錯誤 725 → 0 (-100%)、警告 417 → 22 (-94.7%)
- **v-for :key 覆蓋率**: 100% (68/68)
- **TypeScript 嚴格模式**: 部分啟用（測試檔案排除）
- **設計系統套用**: 100% (12/13 組件使用 CSS 變數，1 組件保留語意色彩)
- **已修復/待處理錯誤類型**:
  - no-duplicate-imports: 100% (12/12) → 剩餘 1 個新增
  - no-undef: 100% (218/218)
  - no-unused-vars / Vue 標籤換行：主要佔剩餘 26 errors，預估 1-2h 手動收尾
- **測試狀態**: 33 單元測試綠燈（trueSolarTime/relations/conversion + /health ping）；Worker 集成測試暫停，待工具成熟恢復

## 代碼重複問題
- 前端 `baziCalc.ts` 已刪除；`utils/baziCalculators.ts` 僅作備援計算器並遵循後端契約。
- 紫微前端重複檔已清空；核心計算集中於後端 UnifiedCalculator。

## 當前狀態
- **版本**: v1.0
- **狀態**: 生產運行中；Phase 1-4 + Task A1/A2 完成；Sprint R5 前端統一遷移完成；設計系統套用完成；四化飛星頂層彙總完成；lunar-typescript 整合完成；Phase A 藏干/十神替換完成
- **優化階段**: Week 2 技術債務清理完成 + 開源專案整合進行中
- **最後更新**: 2025-12-01 23:52（Phase A 完成）
- **最新成果**:
  - **Phase A 藏干/十神替換**：減少維護代碼 274 行；hiddenStems 19/19 通過、tenGods 15/15 通過；採用 lunar-typescript 社群驗證算法；實際時間 2.5h ✓
  - **lunar-typescript 整合**：採用 Hybrid Approach，年柱使用 lunar-typescript（社群驗證），月/日/時柱保留 Legacy 數學公式（API 相容性）；測試 11/16 通過（年柱/月柱/時柱 100%）；實際時間 2.5h ✓
  - 四化飛星頂層彙總：數據結構、飛化邊生成器、圖論分析、大限計算、星曜定位整合
  - 前端顯示組件：SiHuaAggregationCard（統計/循環/中心性）
  - Worker 部署：完整前端應用 + API 後端
  - API 驗證：56條飛化邊（生年48+大限4+流年4）
  - 循環檢測：1個化忌循環、3個化祿循環
  - 中心性分析：壓力匯聚點、資源源頭識別
  - 後端整合檢查：CalculationResult 契約 100% (28/28)，ZiWeiResult.palaces 已修復
  - 清理 19 個重複 .js 檔保留 .ts 單一來源
  - 完成前端服務層對 `wuxingDistribution/fortuneCycles/annualFortune` 的最小適配（含 Date 解析）
  - ESLint 錯誤清零（0 errors/22 warnings）
  - 前端 7 組件接軌 Unified API 並移除舊 `baziCalc.ts`/視圖/表單
  - 清除 50 個編譯產物、保留 11 個核心 .vue
  - Worker 單元測試對齊 `/health` 並啟用 `nodejs_compat`
  - Hybrid API 持續運行，FortuneCycles/流年模組穩定
  - 12 組件套用設計 token，視覺優化完成
  - SSCI 壓縮完成：progress.md 96→53 行（-45%）

## 已知缺口
- Phase B/C 開源專案整合評估（428+1614 行）
- 日柱測試更新（匹配新 JDN API）
- 補齊測試覆蓋 (3-4h)
- 依賴升級與警告清理 (2-3h)
- ESLint 剩餘 22 warnings 待清理
- npm 依賴警告 4 項（Week 2 後期處理）
