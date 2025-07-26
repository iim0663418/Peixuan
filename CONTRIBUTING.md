# 佩璇智能命理分析平台 - 貢獻指南

感謝您對佩璇智能命理分析平台的關注！本文檔將指導您如何為專案做出貢獻。

## 🌟 貢獻流程

### 1. 分支管理

我們使用以下分支策略：

- `main`: 穩定版本分支，只接受經過測試的合併請求
- `develop`: 開發分支，新功能開發完成後合併到此分支
- `feature/*`: 功能分支，用於開發新功能
- `bugfix/*`: 錯誤修復分支
- `release/*`: 發布準備分支

### 2. 開發流程

1. 從最新的 `develop` 分支創建功能分支
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. 開發並提交您的更改
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

3. 推送到遠端倉庫
   ```bash
   git push origin feature/your-feature-name
   ```

4. 創建合併請求到 `develop` 分支

### 3. 提交規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更新
- `style`: 代碼風格更改（不影響代碼運行）
- `refactor`: 代碼重構
- `perf`: 性能優化
- `test`: 添加或修改測試
- `build`: 影響構建系統或外部依賴的更改
- `ci`: 持續集成配置或腳本的更改
- `chore`: 其他不修改源代碼或測試的更改

範例：`feat: 添加紫微斗數計算功能`

## 🧪 測試指南

### 單元測試

所有新功能和錯誤修復都應包含單元測試：

```bash
# 運行前端測試
cd bazi-app-vue
npm run test

# 運行後端測試
cd backend-node
npm run test
```

### 代碼風格

我們使用 ESLint 和 Prettier 來保持代碼風格一致：

```bash
# 檢查代碼風格
npm run lint

# 自動修復代碼風格問題
npm run lint:fix
```

## 📝 文檔指南

- 所有新功能都應該有相應的文檔
- 更新 README.md 以反映重要更改
- 使用清晰的註釋說明複雜的邏輯

## 🔒 安全指南

- 不要提交敏感信息（密碼、API 密鑰等）
- 使用環境變數存儲敏感配置
- 遵循最小權限原則
- 驗證所有用戶輸入

## 🚀 發布流程

1. 從 `develop` 分支創建 `release` 分支
2. 進行最終測試和錯誤修復
3. 更新版本號和更新日誌
4. 合併到 `main` 分支並標記版本
5. 合併回 `develop` 分支

## 📋 問題報告

報告問題時，請包含：

- 問題的詳細描述
- 重現步驟
- 預期行為與實際行為
- 環境信息（瀏覽器、操作系統等）
- 相關日誌或截圖

## 🤝 行為準則

- 尊重所有貢獻者
- 接受建設性批評
- 專注於專案目標
- 保持專業態度

感謝您的貢獻！