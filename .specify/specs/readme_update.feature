# README.md 更新規格

## 目標
基於專案現狀分析，更新 README.md 以反映最新的技術架構和功能特色。

## 需求分析
根據專案分析，當前 README.md 需要更新以反映：

### 技術架構變更
- 後端：Node.js → Cloudflare Workers + D1
- AI 整合：新增 Gemini API 支援
- 部署：傳統服務器 → Edge Computing

### 功能特色
- 八字四柱計算（真太陽時校正）
- 紫微斗數排盤
- AI 智能分析（性格分析 + 運勢分析）
- 即時串流體驗（SSE）
- 多語言支援

### 技術棧更新
**後端 (Cloudflare Ecosystem)**
- Runtime: Cloudflare Workers
- Database: D1 (SQLite)
- ORM: Drizzle
- AI: Gemini API

**前端 (Modern Web)**
- Framework: Vue 3
- Build: Vite
- State: Pinia
- UI: Element Plus

## 更新內容

### 1. 專案描述
- 強調「智能命理分析平台」定位
- 突出 AI + 傳統命理結合
- 說明 Edge-First 架構優勢

### 2. 核心特色
- 🔮 雙系統命理引擎（八字 + 紫微）
- 🤖 AI 智能分析（Gemini 整合）
- 📱 現代化使用者體驗
- ⚡ Edge-First 架構

### 3. 技術棧
- 完整更新後端技術棧
- 強調 Cloudflare 生態系統
- 說明前端現代化技術

### 4. 快速開始
- 更新環境要求
- 修正安裝步驟
- 更新部署說明

### 5. 專案結構
- 反映實際目錄結構
- 說明核心模組功能

### 6. 部署
- Cloudflare Workers 部署
- Wrangler CLI 使用
- 環境變數設定

## 輸出格式
完整的 README.md 內容，包含：
- 專案標題與徽章
- 功能特色說明
- 技術棧列表
- 安裝與部署指南
- 專案結構說明
- 貢獻指南
- 授權資訊
