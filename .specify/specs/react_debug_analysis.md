# ReAct 推理步驟顯示問題根源分析

## 問題確認
用戶看到的 JSON 包含 `thought` 和 `action` 字段，這是 Gemini ReAct 模式的內部推理過程，不應該顯示給用戶。

## 關鍵發現
從 agenticGeminiService.ts:785 的註釋可以看出：
```typescript
// CRITICAL FIX: Preserve the ENTIRE parts array from Gemini's response
// This includes thought parts with thought_signature that Gemini needs
const modelParts = response?.candidates?.[0]?.content?.parts || [];
```

## 問題根源分析
1. **Gemini ReAct 回應結構**: Gemini 在 ReAct 模式下會返回包含 `thought` 和 `action` 的 parts
2. **完整保留策略**: 代碼保留了整個 parts 陣列，包括 thought 部分
3. **SSE 流處理**: 這些 thought 部分可能被錯誤地作為文本內容發送給前端

## 需要檢查的地方
1. `extractText()` 方法是否會提取 thought 部分
2. SSE 流中是否有過濾 thought 內容的邏輯
3. 前端是否正確處理 ReAct 的中間步驟

## 解決方向
需要在後端過濾掉 ReAct 的內部推理步驟，只將最終答案發送給前端。
