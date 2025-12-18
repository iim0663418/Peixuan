# 安全審計報告 (Security Audit Report)

**生成日期**: 2025-12-18
**專案**: Peixuan (佩璇智能命理分析平台)
**審計範圍**: 金鑰洩漏風險分析與版本控制安全

---

## 🚨 高危風險發現 (Critical Findings)

### 1. **Gemini API 金鑰暴露** ⚠️ CRITICAL

**風險等級**: 🔴 嚴重 (Critical)

**發現位置**:
- `peixuan-worker/.dev.vars` - 包含明文 Gemini API Key

**暴露內容**:
```
GEMINI_API_KEY=AIzaSyBoBbIURiJ0oMMC9yGbKLwQkVKwEkdqTPQ
```

**風險描述**:
- 本地開發文件包含真實的 Gemini API 金鑰
- 雖然目前未追蹤到 Git，但容易意外提交
- API 金鑰可能被用於未授權的 API 調用，產生費用或超額使用

**建議處置**:
1. ✅ **立即撤銷 (REVOKE)** 該 API 金鑰
   - 登入 Google Cloud Console
   - 前往 API & Services > Credentials
   - 刪除或重新生成金鑰
2. ✅ 生成新的 API 金鑰並安全存儲
3. ✅ 使用 Cloudflare Workers Secrets 管理生產環境金鑰
4. ✅ 本地開發使用 `.dev.vars` (已加入 .gitignore)

---

### 2. **環境配置文件追蹤到版本控制** ⚠️ HIGH

**風險等級**: 🟠 高 (High)

**發現位置**:
- `bazi-app-vue/.env.staging` - 已被 Git 追蹤

**暴露內容**:
```bash
VITE_API_BASE_URL=https://peixuan-worker-staging.csw30454.workers.dev/api/v1
```

**風險描述**:
- 雖然目前僅包含公開信息（Staging 環境 URL）
- 未來可能意外添加敏感信息到此文件
- 違反最佳實踐：環境文件不應提交到版本控制

**建議處置**:
1. ✅ 從 Git 歷史移除該文件
   ```bash
   git rm --cached bazi-app-vue/.env.staging
   git commit -m "security: Remove .env.staging from version control"
   ```
2. ✅ 添加到 `.gitignore` (已完成)
3. ✅ 使用 `.env.staging.example` 作為範本
4. ⚠️ 檢查 Git 歷史，確認是否曾包含敏感信息

---

## ✅ 已修復問題 (Resolved Issues)

### 1. **更新 .gitignore 文件**

已對根目錄 `.gitignore` 進行全面更新，新增以下保護規則：

#### 🔒 環境變數與金鑰保護
```gitignore
# All environment files (except examples)
.env
.env.*
!.env.example
.env.local
.env.development
.env.staging
.env.production
.env.test

# Cloudflare Workers secrets
.dev.vars
.dev.vars.*
!.dev.vars.example

# API Keys and Tokens
*.key
*.pem
*.cer
*.crt
*.p12
*.pfx
secrets.json
credentials.json
service-account.json
firebase-adminsdk*.json
```

#### 🗄️ 數據庫與敏感數據
```gitignore
# SQLite databases
*.sqlite
*.sqlite3
*.db

# Database dumps
*.sql
*.dump
*.backup
backup/
backups/
```

#### 💻 IDE 與編輯器
```gitignore
# VS Code (保留配置範本)
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# JetBrains IDEs
.idea/
*.iml
*.iws

# AI Coding Assistants
.cursor/
.claude/
.amazonq/
```

#### 🖥️ 作業系統特定文件
```gitignore
# macOS
.DS_Store
._*
.Spotlight-V100

# Windows
Thumbs.db
Desktop.ini
$RECYCLE.BIN/

# Linux
.directory
.Trash-*
```

#### 📦 建置產物與依賴
```gitignore
# Node.js
node_modules/
dist/
dist-ssr/
*.tsbuildinfo

# Cloudflare Workers
.wrangler/
worker-configuration.d.ts
public/dist/
```

---

## 🔍 安全檢查清單 (Security Checklist)

### 立即處理 (Immediate Actions)

- [ ] **撤銷暴露的 Gemini API Key**
  ```bash
  # 1. 登入 Google Cloud Console
  # 2. 前往 API & Services > Credentials
  # 3. 刪除金鑰: AIzaSyBoBbIURiJ0oMMC9yGbKLwQkVKwEkdqTPQ
  # 4. 生成新金鑰並存儲於安全位置
  ```

- [ ] **從 Git 移除 .env.staging**
  ```bash
  cd /Users/shengfanwu/GitHub/佩璇專案/Peixuan
  git rm --cached bazi-app-vue/.env.staging
  git commit -m "security: Remove .env.staging from version control"
  ```

- [ ] **配置 Cloudflare Workers Secrets**
  ```bash
  cd peixuan-worker
  # Staging 環境
  npx wrangler secret put GEMINI_API_KEY --env staging

  # Production 環境
  npx wrangler secret put GEMINI_API_KEY --env production
  ```

- [ ] **檢查 Git 歷史中的敏感信息**
  ```bash
  # 搜尋可能的 API 金鑰模式
  git log -p | grep -i "api.*key\|secret\|password\|token" | head -20
  ```

### 短期改善 (Short-term Improvements)

- [ ] **實施 Pre-commit Hook 防止金鑰提交**
  ```bash
  # 安裝 detect-secrets
  npm install --save-dev detect-secrets-launcher

  # 配置 husky pre-commit hook
  npx husky add .husky/pre-commit "npx detect-secrets-launcher --baseline .secrets.baseline"
  ```

- [ ] **設定環境變數管理流程**
  - 建立 `.env.example` 文件（不含真實金鑰）
  - 更新開發文檔說明如何配置本地環境
  - 團隊成員各自管理本地 `.env` 文件

- [ ] **啟用 GitHub Secret Scanning**
  - 前往 Repository Settings > Security > Secret scanning
  - 啟用 Secret scanning alerts
  - 配置通知接收者

### 長期策略 (Long-term Strategy)

- [ ] **採用金鑰管理服務**
  - 考慮使用 Cloudflare Workers Secrets（推薦）
  - 或使用 HashiCorp Vault / AWS Secrets Manager

- [ ] **實施金鑰輪換政策**
  - 每 90 天輪換 API 金鑰
  - 記錄金鑰使用和輪換歷史

- [ ] **定期安全掃描**
  - 每週運行 `npm audit`
  - 每月進行依賴更新審查
  - 季度性進行完整安全審計

---

## 📋 現有保護機制 (Existing Protections)

### ✅ 良好實踐

1. **Cloudflare Workers 架構**
   - 使用 Wrangler Secrets 管理生產環境金鑰
   - 金鑰不存儲在代碼中

2. **環境變數範本**
   - 提供 `.env.example` 文件作為參考
   - 不包含真實的敏感信息

3. **前後端分離**
   - API 金鑰僅存在於 Worker 端
   - 前端不直接暴露敏感金鑰

### ⚠️ 需要改進

1. **Git 歷史清理**
   - 檢查並清理歷史提交中的敏感信息
   - 考慮使用 BFG Repo-Cleaner

2. **自動化安全檢查**
   - 缺少 pre-commit hooks
   - 未配置 CI/CD 安全掃描

3. **文檔完善**
   - 需要添加金鑰管理指南
   - 安全最佳實踐文檔

---

## 🔐 金鑰管理最佳實踐 (Best Practices)

### 開發環境
```bash
# peixuan-worker/.dev.vars (本地開發，不提交)
GEMINI_API_KEY=your_development_key_here
```

### Staging 環境
```bash
# 使用 Wrangler CLI 配置
npx wrangler secret put GEMINI_API_KEY --env staging
# 輸入 Staging 環境專用金鑰
```

### Production 環境
```bash
# 使用 Wrangler CLI 配置
npx wrangler secret put GEMINI_API_KEY --env production
# 輸入 Production 環境專用金鑰
```

### 環境分離策略
| 環境 | 金鑰存儲位置 | 權限範圍 | 輪換頻率 |
|------|------------|---------|---------|
| Development | `.dev.vars` (本地) | 低配額 | 無需輪換 |
| Staging | Cloudflare Secrets | 中配額 | 每 90 天 |
| Production | Cloudflare Secrets | 高配額 | 每 60 天 |

---

## 📊 風險評估總結 (Risk Assessment Summary)

| 風險類型 | 嚴重程度 | 狀態 | 處置優先級 |
|---------|---------|------|----------|
| API 金鑰暴露 | 🔴 嚴重 | 🟡 待處理 | P0 (立即) |
| 環境文件追蹤 | 🟠 高 | 🟡 待處理 | P0 (立即) |
| .gitignore 不完整 | 🟡 中 | ✅ 已修復 | - |
| 缺少 pre-commit hook | 🟡 中 | 🔴 未處理 | P1 (本週) |
| 未啟用 Secret Scanning | 🟡 中 | 🔴 未處理 | P2 (本月) |

---

## 🛠️ 快速修復指令 (Quick Fix Commands)

```bash
# 1. 移除已追蹤的敏感文件
cd /Users/shengfanwu/GitHub/佩璇專案/Peixuan
git rm --cached bazi-app-vue/.env.staging
git add .gitignore
git commit -m "security: Remove .env.staging and update .gitignore"

# 2. 配置 Cloudflare Workers Secrets (需先撤銷舊金鑰並生成新金鑰)
cd peixuan-worker
npx wrangler secret put GEMINI_API_KEY --env staging
npx wrangler secret put GEMINI_API_KEY --env production

# 3. 檢查 Git 歷史中的敏感信息
git log --all --full-history -- "*.env*" --pretty=format:"%H %s"

# 4. 掃描依賴漏洞
npm audit --workspace=peixuan-worker
npm audit --workspace=bazi-app-vue
```

---

## 📚 參考資源 (References)

- [OWASP Top 10 - A07:2021 Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [Cloudflare Workers Secrets Management](https://developers.cloudflare.com/workers/configuration/secrets/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Git Tools - BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## 📝 審計結論 (Audit Conclusion)

此次安全審計發現 **2 個高危風險** 和 **1 個已修復的中危風險**。主要問題集中在金鑰管理和版本控制安全方面。

**立即需要處理**：
1. 撤銷暴露的 Gemini API 金鑰
2. 從 Git 移除 `.env.staging` 文件
3. 配置 Cloudflare Workers Secrets

**已完成改善**：
- ✅ 全面更新 `.gitignore` 規則
- ✅ 添加環境變數、金鑰、數據庫等保護
- ✅ 覆蓋現代開發環境常見敏感文件類型

建議在 **24 小時內** 完成高危風險修復，並在 **本週內** 實施短期改善措施。

---

**審計人員**: Claude (AI Security Auditor)
**報告版本**: 1.0
**下次審計日期**: 2025-01-18
