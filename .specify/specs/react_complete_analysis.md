# ReAct 完整問題分析

## 問題現象
1. **用戶看到**: `{ "thought": "推理過程...", "action": "reply" }`
2. **之前也可能看到**: `{}`

## 根本原因
ReAct 循環中的 `extractText()` 方法無法正確區分：

### 1. Gemini ReAct 回應的三種情況
- **工具調用階段**: 包含 functionCall，不應提取文本
- **推理階段**: 包含 thought/action JSON，不應顯示給用戶  
- **最終回答階段**: 包含實際回應，應該顯示給用戶

### 2. 當前 extractText() 的問題
```typescript
private extractText(response: any): string | null {
  const text = response?.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.text
  )?.text;
  return text || null;
}
```
- 提取**任何**包含 `text` 的 part
- 無法區分推理步驟和最終答案
- 導致 ReAct 內部推理被顯示給用戶

### 3. 對比 Azure 實現
Azure 的 `extractContent()` 只提取 `message.content`，天然過濾了推理步驟。

## 解決方案
需要修復 `extractText()` 方法：
1. 過濾掉包含 JSON 格式的推理步驟
2. 只提取最終的自然語言回應
3. 正確處理空回應情況

## 修復策略
- 檢查 text 內容是否為 JSON 格式
- 如果是 JSON 且包含 thought/action，則跳過
- 只返回自然語言格式的文本內容
