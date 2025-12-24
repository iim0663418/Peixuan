# SSE JSON Display Issue - Staging Test Results

## Problem
After deploying the SSE buffer fix, the Daily Question now displays raw JSON instead of content:

```json
{ "thought": "用戶目前感到工作壓力大，我需要結合他的八字命盤、紫微斗數能量分布以及流年狀況來分析。 他的八字中『木』與『火』能量極強，但完全缺失『水』，這代表他容易像是一座燃燒過旺的森林，雖然有衝勁但極易乾枯、焦慮。

加上今年是他的『值太歲』年份，能量波動本就較大。 能量流動顯示他在『官祿宮』有化忌能量匯聚，這確實說明了工作上的壓力和卡頓感。

我會建議他找回『水』的能量來平衡，並在今年保持低調。" , "action": "reply" }
```

## Root Cause Analysis
1. **Backend SSE Format**: Backend sends `data: {"text": "content"}` format
2. **Frontend Parsing**: Our fix filters `{}` but doesn't handle valid JSON that fails parsing
3. **Fallback Logic**: When JSON.parse() fails, entire JSON string is treated as plain text

## Current Code Issue
In `useDailyQuestion.ts`, the catch block now shows the full JSON string:

```typescript
} catch {
  const textContent = line.slice(6);
  if (textContent !== '{}' && textContent !== '' && textContent !== '[DONE]') {
    response.value += textContent; // ❌ Shows full JSON string
  }
}
```

## Required Fix
Need to add intelligent JSON detection and content extraction in the fallback:

1. Check if textContent looks like JSON
2. If it's valid JSON, extract meaningful content (thought, text, content fields)
3. If it's not JSON, treat as plain text
4. Continue filtering empty objects and control messages

## Backend SSE Output Format
From streamProcessor.ts:
- `data: {"text": "content"}\n\n` - Standard text chunks
- `data: {"state": "status"}\n\n` - Status updates  
- `data: {"type": "meta", "data": {...}}\n\n` - Metadata

The issue occurs when complex JSON objects are sent that don't match the expected structure.
