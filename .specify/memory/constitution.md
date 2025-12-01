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
- **ESLint 當前狀態**: 152 issues (更新於 2025-11-30 23:43)
  - 錯誤: 26
  - 警告: 126
  - 可自動修復: 48 已處理；剩餘警告含 prettier/any/風格類待批次
- **改善進度**: 從 1,142 → 152 (-86.7%)；錯誤 725 → 26 (-96.4%)、警告 417 → 126 (-69.8%)
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
- **狀態**: 生產運行中；Phase 1-4 + Task A1/A2 完成；Sprint R5 前端統一遷移完成；設計系統套用完成
- **優化階段**: Week 2 技術債務清理進行中（進度 53.5/62 小時，86%）
- **最後更新**: 2025-11-30 23:43（統一 API 常態運行；編譯產物清理；ESLint 自動修復後剩餘 26 errors / 126 warnings）
- **最新成果**: 前端 7 組件接軌 Unified API 並移除舊 `baziCalc.ts`/視圖/表單；清除 50 個編譯產物、保留 11 個核心 .vue；`eslint --fix` 後問題降至 152；Worker 單元測試對齊 `/health` 並啟用 `nodejs_compat`；Hybrid API 持續運行，FortuneCycles/流年模組穩定；12 組件套用設計 token，視覺優化完成。

## 已知缺口
- 四化飛星頂層彙總尚未實作
- 流年太歲計算缺失
- 前端測試尚未覆蓋 UnifiedView/UnifiedResultView；ESLint 剩餘 26 errors / 126 warnings 待清理
