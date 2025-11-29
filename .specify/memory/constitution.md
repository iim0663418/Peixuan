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

## 當前狀態
- **版本**: v1.0
- **狀態**: 生產就緒 + Phase 2 完成 + 專案審計完成
- **優化階段**: Week 1 完成，Week 2 規劃中
- **最後更新**: 2025-11-29 23:18
- **最新成果**: 紫微斗數計算完整實現 (commits: b2c7059 → c1787b5)
