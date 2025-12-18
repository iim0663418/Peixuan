# Azure OpenAI Fallback - Quick Start Guide

## 1. Setup (One-Time)

### Get Azure OpenAI Credentials

1. Create Azure OpenAI resource at https://portal.azure.com
2. Deploy `gpt-4o-mini` model
3. Copy endpoint URL and API key

### Configure Local Development

```bash
# Copy example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your keys
GEMINI_API_KEY=your-gemini-key
AZURE_OPENAI_API_KEY=your-azure-key
```

### Update wrangler.jsonc

```jsonc
{
  "vars": {
    "AZURE_OPENAI_ENDPOINT": "https://your-resource.openai.azure.com",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-4o-mini",
    "ENABLE_AI_FALLBACK": true
  }
}
```

### Deploy Secrets (Production)

```bash
# Set secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put AZURE_OPENAI_API_KEY
```

## 2. Usage

### Basic Example

```typescript
import { AIServiceManager } from './services/aiServiceManager';
import { GeminiService } from './services/geminiService';
import { AzureOpenAIService } from './services/azureOpenAIService';

// Create providers
const gemini = new GeminiService({ apiKey: env.GEMINI_API_KEY });
const azure = new AzureOpenAIService({
  endpoint: env.AZURE_OPENAI_ENDPOINT,
  apiKey: env.AZURE_OPENAI_API_KEY,
  deployment: env.AZURE_OPENAI_DEPLOYMENT,
});

// Create manager
const ai = new AIServiceManager({
  primaryProvider: gemini,
  fallbackProvider: azure,
  enableFallback: env.ENABLE_AI_FALLBACK,
});

// Use it!
const { stream, metadata } = await ai.generateStream(prompt);

console.log(`Provider: ${metadata.provider}`); // "gemini" or "azure"
console.log(`Fallback: ${metadata.fallbackTriggered}`); // true/false
```

### Streaming Response

```typescript
const { stream, metadata } = await ai.generateStream(prompt, {
  locale: 'zh-TW',
  temperature: 0.85,
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-AI-Provider': metadata.provider,
    'X-Fallback-Triggered': String(metadata.fallbackTriggered),
  },
});
```

### Non-Streaming Response

```typescript
const response = await ai.generate(prompt, {
  locale: 'zh-TW',
  maxTokens: 6144,
});

console.log(response.text);
console.log(response.metadata.provider);
console.log(response.metadata.usage); // Token statistics
```

## 3. Testing

### Run Tests

```bash
npm test
```

### Test Specific Files

```bash
npm test -- azureOpenAIService.test.ts
npm test -- aiServiceManager.test.ts
```

### Manual Testing

```bash
# Start dev server
npm run dev

# Test endpoint
curl -X POST http://localhost:8787/api/analyze/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test", "locale": "zh-TW"}'
```

## 4. Monitoring

### Check Logs

```bash
# Local
npm run dev
# Watch console for logs like:
# [AI Manager] Attempting primary provider: gemini
# [Gemini] Token usage | Prompt: 1234 | ...
# [AI Manager] Primary provider succeeded in 2345ms: gemini
```

### Production Logs

```bash
npx wrangler tail
```

### Key Metrics

- `X-AI-Provider` header → Which provider was used
- `X-Fallback-Triggered` header → Was fallback activated
- Console logs → Token usage and costs

## 5. Troubleshooting

### Problem: "Azure OpenAI API error (401)"

**Solution:**
```bash
# Check secret is set
npx wrangler secret list

# Re-set if needed
npx wrangler secret put AZURE_OPENAI_API_KEY
```

### Problem: Fallback not working

**Check:**
1. `ENABLE_AI_FALLBACK = true` in wrangler.jsonc
2. Azure provider is configured (endpoint, key, deployment)
3. Error is retryable (503, 429, timeout)

### Problem: High latency

**Expected:**
- Gemini: ~2-3s
- Azure: ~3-5s (fallback adds overhead)

**Solution:**
- Increase `AI_PROVIDER_TIMEOUT_MS` if needed
- Monitor fallback frequency
- Check Azure region (use closest to users)

## 6. Cost Monitoring

### Gemini Costs
- Free tier: 15 RPM, 1M TPM, 1500 RPD
- Paid: Very low cost

### Azure Costs
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- **Only charged when used as fallback**

### Set Azure Alerts
1. Go to Azure Portal → Your Resource
2. Cost Management → Budgets
3. Set alert at $10/month (adjust as needed)

## 7. Common Patterns

### Disable Fallback Temporarily

```typescript
ai.setFallbackEnabled(false); // Disable
// ... do something ...
ai.setFallbackEnabled(true);  // Re-enable
```

### Check Provider Availability

```typescript
if (azure.isAvailable()) {
  console.log('Azure is ready');
}
```

### Custom Timeout

```typescript
const { stream } = await ai.generateStream(prompt, {
  timeout: 60000, // 60 seconds
});
```

## 8. Migration Checklist

When integrating into existing code:

- [ ] Replace direct `geminiService` calls with `aiManager`
- [ ] Add metadata logging
- [ ] Update response headers
- [ ] Test fallback scenario
- [ ] Monitor costs for first week
- [ ] Set up Azure cost alerts

## 9. Support

- **Documentation:** See `AZURE_OPENAI_SETUP.md` for detailed guide
- **Architecture:** See `doc/AZURE_OPENAI_FALLBACK_PLAN.md`
- **Implementation:** See `doc/Phase1_Implementation_Summary.md`

## 10. Quick Commands

```bash
# Development
npm run dev                          # Start local server
npm test                             # Run tests
npm run lint                         # Check code quality

# Deployment
npm run build                        # Build project
npx wrangler secret put KEY_NAME     # Set secret
npx wrangler deploy                  # Deploy to production
npx wrangler tail                    # View live logs

# Secrets Management
npx wrangler secret list             # List secrets
npx wrangler secret put KEY          # Add/update secret
npx wrangler secret delete KEY       # Remove secret
```

---

**Remember:** Always test in staging before production deployment!
