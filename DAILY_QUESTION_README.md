# Daily Question Feature

## Overview

The Daily Question feature adds intelligent, context-aware daily insights to the Peixuan platform using Google Gemini's Function Calling API with a ReAct (Reasoning-Action-Observation) pattern.

## Architecture

### Backend (Phase 1 - ✅ Complete)

```
User Question
    ↓
/api/v1/daily-insight/stream (SSE endpoint)
    ↓
AgenticGeminiService (ReAct Agent)
    ↓
Function Calling Loop:
  1. Agent thinks → decides which tools to call
  2. Execute tools (get_bazi_profile, get_ziwei_chart, get_daily_transit)
  3. Agent receives observations
  4. Repeat until final answer
    ↓
Stream answer via SSE
```

### Frontend (Phase 2 - ⏳ To Be Implemented)

```vue
<DailyQuestionPanel>
  <input v-model="question" placeholder="今天適合做什麼?" />
  <div class="agent-status">{{ agentStatus }}</div>
  <div class="answer" v-html="renderedAnswer"></div>
</DailyQuestionPanel>
```

## API Reference

### Endpoint

```
POST /api/v1/daily-insight/stream
```

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chartId` | string | ✅ Yes | User's chart ID from D1 database |
| `question` | string | ✅ Yes | User's daily question (kept private, not logged in URLs) |
| `locale` | string | ❌ No | Language (zh-TW or en, default: zh-TW) |

**Privacy Note**: This endpoint uses POST method to protect user privacy. Sensitive questions are sent in the request body and will not appear in server logs, browser history, or proxy logs.

### Response Format (SSE)

```
# Agent status updates
data: {"state": "[思考中] 第 1 輪推理..."}
data: {"state": "[執行中] 正在查詢：get_bazi_profile"}

# Answer chunks
data: {"text": "根據你的八字命盤..."}
data: {"text": "今天是個適合..."}

# Completion
data: [DONE]
```

### Error Response

```
data: {"error": "佩璇找不到你的命盤資料耶...要不要重新算一次呢？🔮"}
```

## Tools Available

### 1. get_bazi_profile
Retrieves user's BaZi four pillars and WuXing analysis.

**Use Case**: When question relates to:
- Personality traits
- Element balance
- Innate strengths/weaknesses

**Example Output**:
```
【八字命盤資料】
四柱：甲子 丙寅 戊午 壬子
日主：戊
五行：木1 火2 土2 金0 水3
用神：木、火
```

### 2. get_ziwei_chart
Retrieves ZiWei Dou Shu palace distribution and major stars.

**Use Case**: When question relates to:
- Life domains (career, wealth, relationships)
- Star influences
- Palace interactions

**Example Output**:
```
【紫微斗數命盤】
命宮：紫微、天府 (甲子)
財帛宮：武曲、天相
四化：紫微化祿、天機化權
```

### 3. get_daily_transit
Retrieves current annual and decade transit information.

**Use Case**: When question relates to:
- Today's fortune
- Timing decisions
- Current life phase

**Example Output**:
```
【今日流運資訊】
查詢日期：2025-12-19
流年干支：乙巳
太歲：太歲巳 (東南)
當前大運：丁卯 (25-34歲)
```

## Usage Examples

### Example 1: Basic Question

**Request**:
```bash
curl -N -X POST "https://peixuan-worker-staging.workers.dev/api/v1/daily-insight/stream" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"abc123","question":"今天適合做什麼","locale":"zh-TW"}'
```

**Expected Flow**:
1. Agent thinks: "用戶問今日運勢,需要查詢流運資訊"
2. Calls: `get_daily_transit`
3. Agent thinks: "需要結合命盤看今日特點"
4. Calls: `get_bazi_profile`
5. Final answer: "今天乙巳日,與您的戊午日主相配,適合..."

### Example 2: Personality Question

**Request**:
```bash
curl -N -X POST "https://peixuan-worker-staging.workers.dev/api/v1/daily-insight/stream" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"abc123","question":"我的個性優缺點是什麼","locale":"zh-TW"}'
```

**Expected Flow**:
1. Agent thinks: "用戶問個性,需要八字和紫微資料"
2. Calls: `get_bazi_profile`, `get_ziwei_chart`
3. Final answer: "您的日主戊土,五行偏水,顯示..."

### Example 3: Career Question

**Request**:
```bash
curl -N -X POST "https://peixuan-worker-staging.workers.dev/api/v1/daily-insight/stream" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"abc123","question":"What career suits me","locale":"en"}'
```

**Expected Flow**:
1. Agent thinks: "Career question, need palace and element info"
2. Calls: `get_ziwei_chart`, `get_bazi_profile`
3. Final answer: "Based on your Career Palace with..."

## Frontend Integration Guide

### Step 1: Fetch with SSE Streaming

Since we're using POST for privacy, we can't use EventSource (which only supports GET). Instead, use the Fetch API with streaming:

```typescript
const chartId = useChartStore().currentChartId;
const question = ref('今天適合做什麼?');
const agentStatus = ref('');
const answer = ref('');

const askQuestion = async () => {
  try {
    const response = await fetch('/api/v1/daily-insight/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chartId: chartId.value,
        question: question.value,
        locale: 'zh-TW'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        agentStatus.value = '完成';
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === '[DONE]') {
            agentStatus.value = '完成';
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.state) {
              agentStatus.value = parsed.state;
            } else if (parsed.text) {
              answer.value += parsed.text;
            } else if (parsed.error) {
              console.error('Error:', parsed.error);
              agentStatus.value = parsed.error;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Request failed:', error);
    agentStatus.value = '連線錯誤';
  }
};
```

### Step 2: Render Answer with Markdown

```vue
<template>
  <div class="daily-question-panel">
    <input
      v-model="question"
      placeholder="問問佩璇今天的運勢..."
      @keyup.enter="askQuestion"
    />

    <div v-if="agentStatus" class="agent-status">
      {{ agentStatus }}
    </div>

    <div v-if="answer" class="answer" v-html="renderMarkdown(answer)"></div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';

const renderMarkdown = (text: string) => {
  return marked.parse(text);
};
</script>
```

### Step 3: Style with Peixuan Theme

```css
.daily-question-panel {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
}

.agent-status {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.answer {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  line-height: 1.8;
}
```

## Testing

### Unit Tests

```bash
cd peixuan-worker
npm run test
```

**Test Coverage**:
- ✅ Service instantiation
- ✅ Tool definitions and execution
- ✅ System prompt generation
- ✅ Response parsing (function calls and text)
- ✅ Error handling

### Integration Testing (Staging)

```bash
# Deploy to staging
npm run deploy:staging

# Test with curl (POST method for privacy)
curl -N -X POST "https://peixuan-worker-staging.workers.dev/api/v1/daily-insight/stream" \
  -H "Content-Type: application/json" \
  -d '{"chartId":"test-id","question":"今天適合做什麼","locale":"zh-TW"}'

# Expected: SSE stream with state updates and final answer
```

### Manual Testing Checklist

- [ ] Agent selects correct tools based on question type
- [ ] Tool responses contain accurate chart data
- [ ] Final answer is coherent and helpful
- [ ] SSE stream format is correct
- [ ] Error handling for missing chartId
- [ ] Error handling for API quota exceeded
- [ ] Bilingual support works (zh-TW and en)
- [ ] Max iterations limit prevents infinite loops

## Performance

### Latency Expectations
- Single tool call: ~2-4 seconds
- Multi-tool call: ~5-8 seconds
- Max timeout: 45 seconds

### Token Usage
- Average: 1,000-2,000 tokens per question
- Cost: ~$0.0003-0.0006 USD per question

### Optimization Tips
1. Keep questions concise (fewer tokens)
2. Avoid overly complex multi-step reasoning
3. Cache common questions (future enhancement)

## Troubleshooting

### Issue: "Chart not found"
**Cause**: chartId doesn't exist in D1 database
**Solution**: Ensure user has calculated their chart first

### Issue: "Gemini API key not configured"
**Cause**: Missing GEMINI_API_KEY in environment
**Solution**: Add key to wrangler.jsonc

### Issue: Agent returns after 1 iteration
**Cause**: Agent found answer immediately
**Solution**: This is normal behavior - not all questions need tool calls

### Issue: Stream stops mid-answer
**Cause**: Network timeout or API error
**Solution**: Check logs for specific error, retry request

## Future Enhancements

### Phase 2: Frontend (3-4 hours)
- [ ] DailyQuestionPanel.vue component
- [ ] SSE client with status display
- [ ] Markdown rendering integration
- [ ] Question history

### Phase 3: Advanced Features (4-6 hours)
- [ ] Conversation history (multi-turn)
- [ ] Question caching (D1-based)
- [ ] More tools (yearly forecast, compatibility)
- [ ] Personalized suggestions

### Phase 4: Optimization (2-3 hours)
- [ ] Token usage optimization
- [ ] Response time improvements
- [ ] Rate limiting per user
- [ ] Analytics tracking

## References

- Implementation Summary: `PHASE1_IMPLEMENTATION_SUMMARY.md`
- Planning Document: `.specify/specs/daily_question_deep_planning.md`
- Source Code: `peixuan-worker/src/services/agenticGeminiService.ts`
- API Route: `peixuan-worker/src/routes/analyzeRoutes.ts` (line 443+)
- Unit Tests: `peixuan-worker/src/services/__tests__/agenticGeminiService.test.ts`

---

**Status**: Phase 1 Complete ✅
**Next**: Frontend Integration (Phase 2)
**Updated**: 2025-12-19
