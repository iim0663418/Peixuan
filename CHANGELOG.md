# 更新日誌 (Changelog)

## [未發布] - 2026-02-04

### 新增 (Added)
- **載入狀態優化**: 進度條 (0-95%)、動態鼓勵訊息、時間估算
- **表單驗證優化**: 地址優先策略、即時內聯驗證、自動清除錯誤
- **建置優化**: 代碼分割 (7 個 vendor chunks)、chunk 大小優化

### 修復 (Fixed)
- **快取機制**: 修復 locale 格式不匹配問題 (zh_TW → zh-TW)
- **運勢分析 API**: 修復 locale 作用域錯誤
- **類型錯誤**: 修復 BranchClash 介面屬性錯誤

### 優化 (Optimized)
- **運勢分析提示詞**: 基於 2026 AI 最佳實踐，聚焦未來半年
- **每日一問提示詞**: 減少 70% token 消耗 (2000 → 600 tokens)

### 技術債務 (Technical Debt)
- VS Code TypeScript 類型警告 (不影響建置和運行)

---

## [1.2.2] - 2025-12-22

### 新增
- **LLM 記憶模組**: Context Injection 技術，記憶用戶對話歷史
- **每日一問 AI 助手**: Agentic AI 系統，ReAct 模式，Function Calling
- **Markdown 渲染系統統一**: 統一 markdown.ts 工具

### 修復
- **深色模式系統**: 修正 CSS 變數語法錯誤，統一選擇器
- **AppFooter & AppHeader**: 100% CSS 變數整合

### 優化
- **骨架屏**: 替代傳統載入動畫
- **快取指示器**: 顯示分析結果產生時間
- **BaziChart 移動端**: 優化觸控互動

---

## [1.2.0] - 2025-12-21

### 新增
- **每日一問數據收集系統**: ReAct 歷程記錄、工具調用追蹤
- **CSS 動畫移動端修復**: 統一 will-change 管理，iOS Safari 兼容

### 修復
- **兩環境配置**: 生產環境補上 ENVIRONMENT secret

---

## [1.1.0] - 2025-12-20

### 新增
- **UX 重新設計**: 從「工具」轉「夥伴」
- **視覺增強**: 深度互動效果、大氣背景、多層陰影漸層
- **RWD 優化**: 移動端優先、觸控優化、動畫性能修復

---

## [1.0.0] - 2025-11-29

### 新增
- **Cloudflare Workers 遷移**: 環境隔離、Node.js v20、esbuild 預編譯
- **紫微斗數**: 複用前端 683 lines、lunar-typescript 替代
- **技術選型**: itty-router + Drizzle ORM

---

更多歷史版本請參考 Git 提交記錄。
