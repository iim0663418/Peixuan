# Privacy Improvement: Daily Insight Endpoint

## Summary

Changed the `/api/v1/daily-insight/stream` endpoint from GET to POST method to protect user privacy. Sensitive personal questions are now sent in the request body instead of URL parameters.

## Changes Made

### 1. Backend Route Change (analyzeRoutes.ts:469)

**Before:**
```typescript
router.get('/api/v1/daily-insight/stream', async (req: IRequest) => {
  const url = new URL(req.url);
  const chartId = url.searchParams.get('chartId');
  const question = url.searchParams.get('question');
  const locale = url.searchParams.get('locale') || 'zh-TW';

  console.log('[daily-insight/stream] Parameters:', { chartId, question, locale });
  // ...
});
```

**After:**
```typescript
router.post('/api/v1/daily-insight/stream', async (req: IRequest) => {
  const body = await req.json() as { chartId?: string; question?: string; locale?: string };
  const chartId = body.chartId;
  const question = body.question;
  const locale = body.locale || 'zh-TW';

  // Log only metadata, not the sensitive question content
  console.log('[daily-insight/stream] Request received:', {
    chartId,
    hasQuestion: !!question,
    questionLength: question?.length || 0,
    locale
  });
  // ...
});
```

### 2. CORS Headers Update (analyzeRoutes.ts:594)

**Before:**
```typescript
'Access-Control-Allow-Methods': 'GET, OPTIONS',
```

**After:**
```typescript
'Access-Control-Allow-Methods': 'POST, OPTIONS',
```

### 3. Documentation Updates (DAILY_QUESTION_README.md)

- Updated API reference to show POST method with request body
- Added privacy note explaining the change
- Updated all curl examples to use POST with JSON body
- Updated frontend integration guide to use Fetch API instead of EventSource
- Updated integration testing instructions

## Privacy Benefits

### Before (GET with URL Parameters)
```
https://api.example.com/daily-insight/stream?chartId=123&question=我老公會不會出軌
```

**Privacy Issues:**
- ❌ Question appears in server access logs
- ❌ Question appears in browser history
- ❌ Question appears in proxy/CDN logs
- ❌ Question visible in browser network tab
- ❌ Question may be cached by intermediaries

### After (POST with Request Body)
```
POST /api/v1/daily-insight/stream
Content-Type: application/json

{"chartId":"123","question":"我老公會不會出軌","locale":"zh-TW"}
```

**Privacy Improvements:**
- ✅ Question NOT in access logs (only metadata logged)
- ✅ Question NOT in browser history
- ✅ Question NOT in proxy/CDN logs
- ✅ Question NOT visible in URL
- ✅ Reduced risk of accidental disclosure

### Enhanced Logging Privacy

The server now logs only metadata about questions, not the content:

```typescript
console.log('[daily-insight/stream] Request received:', {
  chartId,
  hasQuestion: !!question,
  questionLength: question?.length || 0,
  locale
});
```

**Example Log Output:**
```
[daily-insight/stream] Request received: {
  chartId: 'abc123',
  hasQuestion: true,
  questionLength: 18,
  locale: 'zh-TW'
}
```

This protects user privacy even in server logs while still providing debugging information.

## Frontend Integration Changes

Since EventSource only supports GET requests, frontend code needs to use the Fetch API with streaming:

**Before (EventSource):**
```typescript
const url = `/api/v1/daily-insight/stream?chartId=${chartId}&question=${question}`;
const eventSource = new EventSource(url);
```

**After (Fetch API):**
```typescript
const response = await fetch('/api/v1/daily-insight/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chartId, question, locale })
});

const reader = response.body?.getReader();
// ... streaming logic
```

## Testing

### Test with curl
```bash
curl -N -X POST "https://peixuan-worker-staging.workers.dev/api/v1/daily-insight/stream" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"test-id","question":"今天適合做什麼","locale":"zh-TW"}'
```

### Expected Response
Same SSE streaming format:
```
data: {"state":"[思考中] 第 1 輪推理..."}
data: {"text":"根據你的八字命盤..."}
data: [DONE]
```

## Migration Notes

### Breaking Change
This is a **breaking change** for any existing frontend code using the daily-insight endpoint.

### Migration Required
- Update API calls from GET to POST
- Change from EventSource to Fetch API with streaming
- Update request format from URL parameters to JSON body

### Backward Compatibility
No backward compatibility provided due to privacy concerns. The old GET endpoint has been completely replaced.

## Files Modified

1. `peixuan-worker/src/routes/analyzeRoutes.ts` (lines 451-643)
   - Changed route method from GET to POST
   - Changed parameter parsing from URL to request body
   - Updated logging to exclude sensitive content
   - Updated CORS headers

2. `DAILY_QUESTION_README.md`
   - Updated API reference
   - Updated all usage examples
   - Updated frontend integration guide
   - Added privacy notes

## Security Considerations

### What This Protects Against
- ✅ Accidental disclosure in server logs
- ✅ Exposure in browser history
- ✅ Leakage through proxy/CDN logs
- ✅ Shoulder surfing (URL visible in address bar)
- ✅ Log aggregation exposing sensitive data

### What This Does NOT Protect Against
- ❌ Man-in-the-middle attacks (use HTTPS for that)
- ❌ Server-side data breaches (encrypt at rest)
- ❌ Client-side XSS attacks (use CSP headers)
- ❌ Memory dumps on client or server

### Additional Security Recommendations
1. **HTTPS Only**: Ensure all API calls use HTTPS
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Authentication**: Consider adding user authentication
4. **Encryption**: Encrypt sensitive data in D1 database
5. **Audit Logs**: Maintain audit logs with user consent

## Compliance

This change helps with compliance for:
- **GDPR**: Reduces unnecessary processing of personal data in logs
- **CCPA**: Minimizes data exposure in system logs
- **SOC 2**: Demonstrates privacy-by-design practices
- **ISO 27001**: Reduces attack surface for sensitive data

## Performance Impact

- ✅ **No negative performance impact**
- ✅ **Slightly smaller URLs** (no long query strings)
- ✅ **Better caching behavior** (POST requests not cached by default)
- ✅ **Same SSE streaming performance**

## Rollout Plan

1. ✅ **Phase 1**: Update backend endpoint (Complete)
2. ⏳ **Phase 2**: Update frontend to use POST (Pending)
3. ⏳ **Phase 3**: Deploy to staging for testing
4. ⏳ **Phase 4**: Monitor logs to ensure privacy protection
5. ⏳ **Phase 5**: Deploy to production

---

**Priority**: 🔴 **CRITICAL** (Privacy/Security)
**Status**: ✅ Backend Complete, ⏳ Frontend Pending
**Impact**: Breaking Change (Migration Required)
**Date**: 2025-12-19
