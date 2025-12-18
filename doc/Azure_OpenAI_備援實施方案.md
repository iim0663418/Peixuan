# Azure OpenAI 備援實施方案

## 🎯 專案目標

為佩璇命理分析平台建立 Azure OpenAI 作為 Gemini 2.5 Flash 的可靠備援系統，確保服務連續性和用戶體驗。

## 🏗 架構設計

### 1. 適配器模式架構

```typescript
// 統一 AI 服務介面
interface AIService {
  analyzeChart(markdown: string, locale?: string): Promise<AIResponse>
  analyzeChartStream(markdown: string, locale?: string): Promise<ReadableStream>
  analyzeAdvancedStream(markdown: string, locale?: string): Promise<ReadableStream>
}

// Azure OpenAI 適配器
class AzureOpenAIService implements AIService {
  // 實現統一介面
}

// AI 服務管理器（主要邏輯）
class AIServiceManager {
  private primaryService: GeminiService
  private backupService: AzureOpenAIService
  
  async analyzeWithFallback(markdown: string, locale?: string): Promise<AIResponse> {
    try {
      return await this.primaryService.analyzeChart(markdown, locale)
    } catch (error) {
      console.log('[AI Fallback] Switching to Azure OpenAI...')
      return await this.backupService.analyzeChart(markdown, locale)
    }
  }
}
```

### 2. Fallback 邏輯設計

**觸發條件**：
- Gemini API 503/429 錯誤
- 網路超時（45秒+）
- 配額耗盡
- 手動切換（維護模式）

**切換策略**：
- 自動 fallback：透明切換，用戶無感知
- 熔斷機制：連續失敗 3 次後暫時切換到備援
- 健康檢查：定期檢測主服務恢復狀態

## 🔐 金鑰安全管理

### 1. Secrets 安全配置

使用 Cloudflare Workers secrets 安全存儲敏感資料：

```bash
# 使用 wrangler secret 命令設定敏感金鑰
npx wrangler secret put AZURE_OPENAI_API_KEY --env staging
# 提示輸入: XmCvSPs7eFdUzERPu5dPoEoYsuAYPC95gQcoktemvru9QjtGENKtJQQJ99BDACHYHv6XJ3w3AAAAACOGMia9

npx wrangler secret put AZURE_OPENAI_API_KEY --env production
# 提示輸入: [生產環境金鑰]

# 列出已配置的 secrets
npx wrangler secret list --env staging
```

在 `wrangler.toml` 中配置非敏感變數：

```toml
[env.staging.vars]
AZURE_OPENAI_ENDPOINT = "https://iim20-m9w1b4wx-eastus2.cognitiveservices.azure.com/"
AZURE_OPENAI_DEPLOYMENT = "gpt-4.1-mini"
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
ENABLE_AZURE_FALLBACK = "true"
AI_SERVICE_MODE = "auto"  # auto | gemini-only | azure-only

[env.production.vars]
AZURE_OPENAI_ENDPOINT = "https://iim20-m9w1b4wx-eastus2.cognitiveservices.azure.com/"
AZURE_OPENAI_DEPLOYMENT = "gpt-4.1-mini"
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
ENABLE_AZURE_FALLBACK = "true"
AI_SERVICE_MODE = "auto"
```

### 2. Secrets 安全優勢

- ✅ **加密存儲**：secrets 在 Cloudflare 平台上加密存儲，不會出現在代碼庫或配置檔案中
- ✅ **運行時注入**：僅在 Worker 執行時注入到 `env` 對象，不會洩露到日誌或錯誤訊息
- ✅ **環境隔離**：staging 和 production 使用完全獨立的 secrets，互不干擾
- ✅ **版本控制安全**：secrets 永不進入 git 歷史記錄
- ✅ **細粒度權限**：可通過 Cloudflare API tokens 控制誰能讀取/更新 secrets

### 3. 程式碼中讀取 Secrets

```typescript
// azureOpenAIService.ts
export class AzureOpenAIService implements AIService {
  private apiKey: string
  private endpoint: string
  private deployment: string

  constructor(env: Env) {
    // 從 secrets 中讀取加密的 API 金鑰
    this.apiKey = env.AZURE_OPENAI_API_KEY

    // 從環境變數中讀取非敏感配置
    this.endpoint = env.AZURE_OPENAI_ENDPOINT
    this.deployment = env.AZURE_OPENAI_DEPLOYMENT
  }

  async analyzeChart(markdown: string, locale?: string): Promise<AIResponse> {
    const response = await fetch(`${this.endpoint}/openai/deployments/${this.deployment}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey  // 使用 secret 中的金鑰
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: markdown }]
      })
    })

    return response.json()
  }
}
```

### 4. 金鑰輪換策略

- **定期輪換**：每 90 天更新 API 金鑰
  ```bash
  # 輪換 staging 環境金鑰
  npx wrangler secret put AZURE_OPENAI_API_KEY --env staging

  # 輪換 production 環境金鑰
  npx wrangler secret put AZURE_OPENAI_API_KEY --env production
  ```
- **多金鑰支援**：配置主備金鑰（`AZURE_OPENAI_API_KEY_PRIMARY` / `AZURE_OPENAI_API_KEY_BACKUP`），無縫切換
- **監控告警**：金鑰即將過期時提前通知（Azure Portal 設定）
- **權限最小化**：僅授予必要的 API 權限（Azure RBAC 配置）

## 🛠 實施步驟

### Phase 1: 基礎架構（1-2 天）

1. **創建 Azure OpenAI 適配器**
   ```bash
   # 新增檔案
   peixuan-worker/src/services/azureOpenAIService.ts
   peixuan-worker/src/services/aiServiceManager.ts
   peixuan-worker/src/types/aiTypes.ts
   ```

2. **Secrets 與環境變數配置**
   ```bash
   # 步驟 1: 更新 wrangler.toml（非敏感配置）
   [env.staging.vars]
   AZURE_OPENAI_ENDPOINT = "https://iim20-m9w1b4wx-eastus2.cognitiveservices.azure.com/"
   AZURE_OPENAI_DEPLOYMENT = "gpt-4.1-mini"
   AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
   ENABLE_AZURE_FALLBACK = "true"
   AI_SERVICE_MODE = "auto"

   # 步驟 2: 使用 wrangler secret 設定敏感金鑰
   npx wrangler secret put AZURE_OPENAI_API_KEY --env staging
   # 當提示時，貼上 API 金鑰

   # 步驟 3: 驗證 secrets 配置
   npx wrangler secret list --env staging
   ```

### Phase 2: 核心實現（2-3 天）

1. **Azure OpenAI 適配器實現**
   - 實現 `analyzeChart()` 方法
   - 實現 `analyzeChartStream()` 方法  
   - 實現 `analyzeAdvancedStream()` 方法
   - Prompt 格式轉換（Gemini → Azure OpenAI）

2. **AI 服務管理器**
   - Fallback 邏輯實現
   - 錯誤處理與重試
   - 性能監控與日誌

3. **控制器層整合**
   ```typescript
   // 修改 analyzeController.ts
   const aiManager = new AIServiceManager(geminiService, azureService)
   const result = await aiManager.analyzeWithFallback(markdown, locale)
   ```

### Phase 3: 測試與驗證（1-2 天）

1. **單元測試**
   ```bash
   # 新增測試檔案
   peixuan-worker/src/__tests__/azureOpenAIService.test.ts
   peixuan-worker/src/__tests__/aiServiceManager.test.ts
   ```

2. **整合測試**
   - Gemini 正常 → Azure 待機
   - Gemini 失敗 → Azure 接管
   - 雙服務對比測試

3. **性能測試**
   - 響應時間對比
   - Token 使用量分析
   - 成本效益評估

### Phase 4: 部署與監控（1 天）

1. **Staging 部署**
   ```bash
   npx wrangler deploy --env staging
   ```

2. **生產部署**
   ```bash
   # 透過 GitHub Actions
   git push origin main
   ```

3. **監控配置**
   - Cloudflare Analytics
   - 自定義指標追蹤
   - 告警規則設定

## 📊 監控與切換策略

### 1. 健康檢查機制

```typescript
class HealthChecker {
  async checkGeminiHealth(): Promise<boolean> {
    try {
      const response = await geminiService.analyzeChart("測試", "zh-TW")
      return response.text.length > 0
    } catch {
      return false
    }
  }
  
  async checkAzureHealth(): Promise<boolean> {
    // 類似實現
  }
}
```

### 2. 自動切換邏輯

```typescript
class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private readonly threshold = 3
  private readonly timeout = 300000 // 5 分鐘
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open')
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
}
```

### 3. 監控指標

- **可用性**：成功率、響應時間、錯誤率
- **性能**：Token 使用量、成本、延遲
- **業務**：分析品質、用戶滿意度

## 💰 成本控制與性能考量

### 1. 成本分析

| 服務 | 模型 | 輸入成本 | 輸出成本 | 預估月費用 |
|------|------|----------|----------|------------|
| Gemini | 2.5 Flash | $0.075/1M | $0.30/1M | $50-100 |
| Azure | GPT-4.1-mini | $0.15/1M | $0.60/1M | $100-200 |

### 2. 成本優化策略

- **智能路由**：根據查詢複雜度選擇模型
- **快取機制**：避免重複分析相同命盤
- **Token 限制**：設定合理的輸出長度上限
- **使用監控**：實時追蹤成本並設定告警

### 3. 性能優化

```typescript
// Token 使用優化
const optimizePrompt = (markdown: string, service: 'gemini' | 'azure'): string => {
  if (service === 'azure') {
    // Azure 版本可能需要更簡潔的 prompt
    return markdown.replace(/詳細說明/g, '簡述')
  }
  return markdown
}

// 響應時間監控
const withTiming = async <T>(operation: () => Promise<T>): Promise<T> => {
  const start = Date.now()
  try {
    const result = await operation()
    console.log(`Operation completed in ${Date.now() - start}ms`)
    return result
  } catch (error) {
    console.log(`Operation failed after ${Date.now() - start}ms`)
    throw error
  }
}
```

## 🚀 部署檢查清單

### 準備階段
- [ ] Azure OpenAI 服務已部署 GPT-4.1-mini
- [ ] API 金鑰已獲取並測試
- [ ] Secrets 已通過 wrangler secret 配置
- [ ] wrangler.toml 中的非敏感變數已配置
- [ ] 代碼已完成並通過測試

### 部署階段
- [ ] Staging 環境部署成功
- [ ] 功能測試通過
- [ ] 性能測試達標
- [ ] 監控指標正常

### 上線階段
- [ ] 生產環境部署
- [ ] 健康檢查通過
- [ ] 備援機制驗證
- [ ] 用戶體驗測試

### 後續維護
- [ ] 監控告警配置
- [ ] 成本追蹤設定
- [ ] 定期健康檢查
- [ ] 金鑰輪換計劃

## 🔄 回滾計劃

如果 Azure OpenAI 整合出現問題：

1. **立即回滾**：停用 `ENABLE_AZURE_FALLBACK`
2. **代碼回滾**：恢復到純 Gemini 版本
3. **監控確認**：確保服務恢復正常
4. **問題分析**：調查失敗原因並修復

## 📋 總結

此方案提供了完整的 Azure OpenAI 備援實施路徑，包括：

- ✅ **架構設計**：適配器模式 + 服務管理器
- ✅ **安全管理**：Cloudflare Workers Secrets + 金鑰輪換
- ✅ **實施步驟**：4 個階段，總計 6-8 天
- ✅ **監控策略**：健康檢查 + 熔斷機制
- ✅ **成本控制**：智能路由 + 使用監控

預期效果：
- 服務可用性提升至 99.9%+
- 用戶體驗無感知切換
- 成本增加控制在 20% 以內
- 為未來多模型支援奠定基礎
