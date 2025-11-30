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
- 八字計算 (前端本地實現 - baziCalc.ts 1,146 lines)
- 紫微斗數計算 (Worker 實現 - purpleStarCalculation.ts 681 lines)
- 命盤記錄管理 (CRUD)
- 分析記錄管理 (CRUD)
- 匿名用戶支援
- 前端靜態資源服務
- UnifiedCalculator: 八字+紫微統一計算，CalculationResult 包含 hiddenStems、tenGods、starSymmetry、steps、metadata
- FortuneCycles: 起運/大運計算（determineFortuneDirection、calculateQiYunDate、generateDaYunList、自動當前大運偵測）整合於 BaZiResult.fortuneCycles
- 流年模組: `getAnnualPillar`/`hasPassedLiChun`（立春界、year-4 mod 60）、`locateAnnualLifePalace`/`rotateAnnualPalaces`（地支定位+意義旋轉）、`detectStemCombinations`/`detectBranchClashes`/`detectHarmoniousCombinations`（五合/六沖/三合三會+大運）
- Hybrid API: Unified (core) + Legacy (palaces) 並行，`/api/v1/purple-star/calculate` 返回 PurpleStarApiResponse；`/api/v1/calculate` 返回完整 CalculationResult

## 架構決策
- 最小化實作原則
- 類型安全優先 (TypeScript + Drizzle)
- Edge-first 架構
- 自動化部署 (GitHub Actions)
- 前端八字計算 + 後端紫微計算

## 程式碼品質基線
- **ESLint 當前狀態**: 467 issues (更新於 2025-11-29 22:29)
  - 錯誤: 93
  - 警告: 374
  - 可自動修復: 95
- **改善進度**: 從 840 → 467 (-44.4%)
- **v-for :key 覆蓋率**: 100% (68/68)
- **TypeScript 嚴格模式**: 部分啟用（測試檔案排除）
- **已修復錯誤類型**:
  - no-duplicate-imports: 100% (12/12) → 剩餘 1 個新增
  - no-undef: 100% (67/67)
  - no-unused-vars: 59% (132/222)

## 代碼重複問題
- **紫微斗數計算**: 前端 ziweiCalc.ts (683 lines) 未使用
- **建議**: Week 2 移除前端重複代碼（選項 A）
- **依賴**: baziCalc.ts (1,146 lines) 仍支撐 7 個組件，Task B3（移除舊計算邏輯）暫停，需先完成 Task B2 並行路由

## 當前狀態
- **版本**: v1.0
- **狀態**: 生產運行中；Phase 1-4 + Task A1/A2 完成；專案審計完成
- **優化階段**: Week 1 完成，Week 2 規劃中
- **最後更新**: 2025-11-30
- **最新成果**: FortuneCycles（起運/大運）整合 UnifiedCalculator；新增流年模組（年柱立春界、流年命宮旋轉、五合/六沖/三合三會分析）並具 40+/100+/150+ 測試覆蓋；Hybrid API 持續運行

## 已知缺口
- 四化飛星頂層彙總尚未實作
- 流年太歲計算缺失
- 前端需適配新的 PurpleStarApiResponse / CalculationResult 欄位
- Task B3（移除舊計算器）被 Task B2（UnifiedInputForm 路由整合）阻塞
