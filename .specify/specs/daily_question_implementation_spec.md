# DailyQuestionView 重構實施規格

## BDD Specification

### Scenario 1: 更新設計系統變數
**Given**: design-tokens.css 包含基礎 Glassmorphism 變數  
**When**: 添加雛形中的增強版變數  
**Then**: 
- 新增 `--glass-blur-enhanced: 24px`
- 新增 `--glass-saturate: 160%`
- 新增 `--shadow-glass-deep`
- 新增 `--ease-bounce`
- 保持向後相容

### Scenario 2: 更新 i18n 文案
**Given**: 現有 dailyQuestion.noChart 文案  
**When**: 優化為更口語化版本  
**Then**:
- zh_TW: 「還沒有命盤呢」「建立後就能向佩璇提問囉」
- en: 保持專業但友善的語氣
- 新增 modal.title 獨立標題

### Scenario 3: 重構 DailyQuestionView.vue
**Given**: 當前 170 行舊設計  
**When**: 應用雛形設計 + 修正建議  
**Then**:
- 移除 emoji，使用 `@iconify/vue`
- 使用增強版 Glassmorphism
- 添加深色模式支援 (`html.dark`)
- 統一圓角為 `--radius-xl` (4rem)
- 添加無障礙屬性 (aria-label, role)
- 功能完全不變
- 代碼行數 < 300 行
- 無 ESLint 錯誤

### Scenario 4: 驗證
**Given**: 重構完成  
**When**: 執行測試  
**Then**:
- TypeScript 編譯通過
- 無 console 錯誤
- 響應式正常 (375px, 768px, 1440px)
- 深色模式切換正常

## 目標文件
1. `/Users/shengfanwu/GitHub/佩璇專案/Peixuan/bazi-app-vue/src/styles/design-tokens.css`
2. `/Users/shengfanwu/GitHub/佩璇專案/Peixuan/bazi-app-vue/src/i18n/locales/zh_TW.json`
3. `/Users/shengfanwu/GitHub/佩璇專案/Peixuan/bazi-app-vue/src/i18n/locales/en.json`
4. `/Users/shengfanwu/GitHub/佩璇專案/Peixuan/bazi-app-vue/src/views/DailyQuestionView.vue`

## 實施順序
1. design-tokens.css (新增變數)
2. i18n 文案 (zh_TW + en)
3. DailyQuestionView.vue (完整重構)
4. 建置測試
