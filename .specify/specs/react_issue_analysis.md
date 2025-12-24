# ReAct 推理步驟顯示問題分析

## 問題描述
用戶報告每日一問顯示了 ReAct 的內部推理過程：
```json
{ "thought": "用戶目前感到工作壓力大，我需要結合他的八字命盤、紫微斗數能量分布以及流年狀況來分析。...", "action": "reply" }
```

## 問題根源分析
這不是前端解析問題，而是後端 ReAct 實現問題：

1. **ReAct 模式**: 每日一問使用 ReAct (Reasoning + Acting) 模式
2. **內部推理**: `thought` 和 `action` 是 AI 的內部推理步驟
3. **不應顯示**: 這些推理步驟不應該直接發送給前端顯示

## 當前實現檢查
- **agenticGeminiService.ts**: 實現 ReAct 模式的 AI 服務
- **前端 useDailyQuestion.ts**: 正確處理 SSE 流，但接收到了不應該顯示的內容
- **問題**: 後端可能在某個步驟將 ReAct 的推理過程作為文本發送給前端

## 需要檢查的地方
1. 後端 SSE 流處理是否正確過濾 ReAct 內部步驟
2. Gemini API 回應的處理邏輯
3. 什麼情況下會將 thought/action 發送給前端

## 解決方向
需要檢查後端 ReAct 實現，確保：
- 內部推理步驟不會作為用戶可見內容發送
- 只有最終答案才會通過 SSE 發送給前端
- 正確處理 ReAct 循環中的中間步驟
