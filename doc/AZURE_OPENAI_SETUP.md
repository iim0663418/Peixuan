# Azure OpenAI Fallback Setup Guide

This guide explains how to configure and use the Azure OpenAI fallback system in Peixuan Worker.

## Overview

The Peixuan Worker now supports automatic fallback from Gemini 2.5 Flash to Azure OpenAI (GPT-4o-mini) when:
- Gemini service is unavailable (503 errors)
- Rate limits are exceeded (429 errors)
- Request timeouts occur

## Architecture

The system uses an adapter pattern with three core components:

1. **AIProvider Interface** (`src/types/aiTypes.ts`)
   - Unified interface for all AI providers
   - Type-safe error handling with AIProviderError
   - Support for both streaming and non-streaming responses

2. **Azure OpenAI Adapter** (`src/services/azureOpenAIService.ts`)
   - Implements AIProvider interface
   - Handles Azure OpenAI API communication
   - Transforms Azure SSE format to plain text streams
   - Automatic retry logic with exponential backoff

3. **AI Service Manager** (`src/services/aiServiceManager.ts`)
   - Manages primary and fallback providers
   - Automatic fallback on retryable errors
   - Performance monitoring and logging

## Configuration

### 1. Environment Variables

The configuration is split between `wrangler.jsonc` (non-sensitive) and Wrangler Secrets (sensitive).

#### wrangler.jsonc (Non-sensitive)

```jsonc
{
  "vars": {
    "AZURE_OPENAI_ENDPOINT": "https://your-resource.openai.azure.com",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-4o-mini",
    "AZURE_OPENAI_API_VERSION": "2024-08-01-preview",
    "AI_PROVIDER_TIMEOUT_MS": 45000,
    "ENABLE_AI_FALLBACK": true
  }
}
```

#### Wrangler Secrets (Sensitive)

Set these using the Wrangler CLI:

```bash
# For production
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put AZURE_OPENAI_API_KEY

# For staging environment
npx wrangler secret put GEMINI_API_KEY --env staging
npx wrangler secret put AZURE_OPENAI_API_KEY --env staging
```

### 2. Local Development

Copy `.dev.vars.example` to `.dev.vars` and fill in your API keys:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
```

**Important:** Never commit `.dev.vars` to version control. It's already in `.gitignore`.

### 3. Azure OpenAI Resource Setup

1. **Create Azure OpenAI Resource**
   - Go to Azure Portal (https://portal.azure.com)
   - Create a new Azure OpenAI resource
   - Note the endpoint URL (e.g., `https://your-resource.openai.azure.com`)

2. **Deploy GPT-4o-mini Model**
   - In your Azure OpenAI resource, go to "Model deployments"
   - Deploy the `gpt-4o-mini` model
   - Note the deployment name (use this in `AZURE_OPENAI_DEPLOYMENT`)

3. **Get API Key**
   - Go to "Keys and Endpoint" in your Azure OpenAI resource
   - Copy one of the API keys
   - Set it using `wrangler secret put AZURE_OPENAI_API_KEY`

4. **Update wrangler.jsonc**
   - Set `AZURE_OPENAI_ENDPOINT` to your resource endpoint
   - Set `AZURE_OPENAI_DEPLOYMENT` to your deployment name

## Usage Example

```typescript
import { AIServiceManager } from './services/aiServiceManager';
import { GeminiService } from './services/geminiService';
import { AzureOpenAIService } from './services/azureOpenAIService';

// Create providers
const geminiProvider = new GeminiService({
  apiKey: env.GEMINI_API_KEY,
  model: 'gemini-3-flash-preview',
  maxRetries: 3,
});

const azureProvider = new AzureOpenAIService({
  endpoint: env.AZURE_OPENAI_ENDPOINT,
  apiKey: env.AZURE_OPENAI_API_KEY,
  deployment: env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: env.AZURE_OPENAI_API_VERSION,
  timeout: env.AI_PROVIDER_TIMEOUT_MS,
  maxRetries: 3,
});

// Create AI manager with fallback
const aiManager = new AIServiceManager({
  primaryProvider: geminiProvider,
  fallbackProvider: azureProvider,
  enableFallback: env.ENABLE_AI_FALLBACK,
  timeout: env.AI_PROVIDER_TIMEOUT_MS,
});

// Use streaming
const { stream, metadata } = await aiManager.generateStream(prompt, {
  locale: 'zh-TW',
  temperature: 0.85,
});

console.log(`Provider used: ${metadata.provider}`);
console.log(`Fallback triggered: ${metadata.fallbackTriggered}`);
console.log(`Latency: ${metadata.latencyMs}ms`);

// Return stream to client
return new Response(stream, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-AI-Provider': metadata.provider,
    'X-Fallback-Triggered': String(metadata.fallbackTriggered),
  },
});
```

## Error Handling

The system automatically handles the following error scenarios:

### Retryable Errors (Trigger Fallback)
- `SERVICE_UNAVAILABLE` (503) - Gemini service down
- `RATE_LIMIT_EXCEEDED` (429) - Rate limit hit
- `TIMEOUT` - Request timeout

### Non-Retryable Errors (No Fallback)
- `AUTH_ERROR` (401, 403) - Invalid API key
- `INVALID_REQUEST` (400) - Malformed request

## Monitoring

The system logs detailed information about provider usage:

```
[AI Manager] Attempting primary provider: gemini
[Gemini] Token usage | Prompt: 1234 | Completion: 567 | Total: 1801 | Cost: $0.000135
[AI Manager] Primary provider succeeded in 2345ms: gemini
```

If fallback is triggered:

```
[AI Manager] Primary provider failed: gemini
[AI Manager] Switching to fallback provider: azure
[Azure OpenAI] Token usage | Prompt: 1234 | Completion: 567 | Total: 1801 | Est. Cost: $0.000525
[AI Manager] Fallback provider succeeded in 3456ms (total: 5801ms): azure
```

## Cost Monitoring

### Gemini 2.5 Flash
- Free tier available
- Extremely low cost when paid

### Azure OpenAI GPT-4o-mini
- Input: ~$0.15 / 1M tokens
- Output: ~$0.60 / 1M tokens
- Only used as fallback, cost is controlled

**Recommendation:** Set up Azure cost alerts to monitor fallback usage.

## Testing

### Unit Tests

Test the individual components:

```bash
npm test -- src/services/azureOpenAIService.test.ts
npm test -- src/services/aiServiceManager.test.ts
```

### Integration Tests

Test the fallback mechanism:

1. **Simulate Gemini Failure**
   - Use invalid Gemini API key
   - Verify automatic fallback to Azure

2. **Verify Stream Format**
   - Ensure both providers return compatible streams
   - Check frontend receives consistent format

### Manual Testing

```bash
# Start local development
npm run dev

# Make API request
curl -X POST http://localhost:8787/api/analyze/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt", "locale": "zh-TW"}'
```

## Troubleshooting

### Issue: "Azure OpenAI API error (401)"
**Solution:** Check that `AZURE_OPENAI_API_KEY` is set correctly using `wrangler secret list`

### Issue: "No response body from Azure OpenAI streaming API"
**Solution:** Verify deployment name matches your Azure OpenAI deployment

### Issue: Fallback not triggering
**Solution:**
- Check `ENABLE_AI_FALLBACK` is set to `true`
- Verify Azure provider is properly configured
- Check logs for specific error messages

### Issue: High latency with fallback
**Solution:**
- Azure OpenAI typically has higher latency than Gemini
- Consider increasing `AI_PROVIDER_TIMEOUT_MS`
- Monitor `X-Fallback-Triggered` header to track fallback frequency

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use Wrangler Secrets** for sensitive data in production
3. **Rotate API keys regularly**
4. **Monitor API usage** to detect unauthorized access
5. **Set up cost alerts** in Azure Portal

## Next Steps

1. ✅ Phase 1: Basic infrastructure (COMPLETED)
   - AIProvider interface
   - Azure OpenAI adapter
   - AI Service Manager

2. ⏭️ Phase 2: Gemini refactoring
   - Refactor GeminiService to implement AIProvider interface
   - Maintain backward compatibility

3. ⏭️ Phase 3: Integration
   - Update controllers to use AIServiceManager
   - Add monitoring and metrics

4. ⏭️ Phase 4: Testing
   - Write comprehensive tests
   - Perform failover drills
   - Validate cost tracking

## References

- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
