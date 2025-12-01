# 五行分布顯示問題診斷指引

**問題**: 五行分布的原始得分和月令調整後的值沒有顯示

**診斷時間**: 2025-12-01 11:14

---

## 🔍 診斷步驟

### 步驟 1: 開啟瀏覽器開發者工具

1. 開啟前端應用
2. 按 `F12` 或 `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
3. 切換到 **Console** 標籤

### 步驟 2: 執行八字計算

1. 輸入出生資訊
2. 點擊「計算」按鈕
3. 切換到「八字」標籤
4. 滾動到「五行分布」區塊

### 步驟 3: 檢查 Console 輸出

查找以下兩行 log：

```
Backend wuxingDistribution: { ... }
Adapted wuxingDistribution: { ... }
```

---

## 📊 預期輸出格式

### Backend wuxingDistribution (後端格式)

```javascript
{
  raw: {
    tiangan: { 木: 1, 火: 0, 土: 2, 金: 1, 水: 0 },
    hiddenStems: { 木: 2, 火: 1, 土: 1, 金: 0, 水: 2 }
  },
  adjusted: { 木: 3.5, 火: 1.2, 土: 4.0, 金: 1.0, 水: 2.5 },
  dominant: '土',
  deficient: '火',
  balance: 0.65
}
```

### Adapted wuxingDistribution (前端格式)

```javascript
{
  raw: { 木: 3, 火: 1, 土: 3, 金: 1, 水: 2 },  // tiangan + hiddenStems
  adjusted: { 木: 3.5, 火: 1.2, 土: 4.0, 金: 1.0, 水: 2.5 }
}
```

---

## ❌ 常見問題

### 問題 1: Backend wuxingDistribution 為 undefined

**原因**: 後端未返回 wuxingDistribution 資料

**解決方案**:
1. 檢查後端 API 是否正常運行
2. 檢查後端計算邏輯是否包含 wuxingDistribution
3. 檢查 API 回應格式

### 問題 2: raw.tiangan 或 raw.hiddenStems 為 undefined

**原因**: 後端資料結構與預期不符

**解決方案**:
1. 檢查後端 WuXingDistribution 介面定義
2. 確認後端實際輸出格式
3. 調整前端適配邏輯

### 問題 3: Adapted wuxingDistribution 的 raw 值全為 0

**原因**: 
- 後端 tiangan/hiddenStems 使用不同的鍵名 (例如: 'Wood' 而非 '木')
- 資料為 null 或 undefined

**解決方案**:
1. 檢查後端使用的元素名稱 (中文 vs 英文)
2. 添加 null 檢查
3. 調整鍵名映射

### 問題 4: adjusted 值正確但 raw 值為 0

**原因**: tiangan 和 hiddenStems 的鍵名不符

**可能的鍵名**:
- 中文: '木', '火', '土', '金', '水'
- 英文: 'Wood', 'Fire', 'Earth', 'Metal', 'Water'
- 拼音: 'Mu', 'Huo', 'Tu', 'Jin', 'Shui'

---

## 🔧 快速修復方案

### 方案 A: 後端使用英文鍵名

如果 Console 顯示:
```javascript
Backend: {
  raw: {
    tiangan: { Wood: 1, Fire: 0, ... },
    hiddenStems: { Wood: 2, Fire: 1, ... }
  }
}
```

**修復**: 更新 `unifiedApiService.ts` 的鍵名映射

```typescript
const ELEMENT_MAP: Record<string, string> = {
  '木': 'Wood',
  '火': 'Fire',
  '土': 'Earth',
  '金': 'Metal',
  '水': 'Water',
};

wuxingDistribution: {
  raw: {
    木: (raw.tiangan[ELEMENT_MAP['木']] || 0) + (raw.hiddenStems[ELEMENT_MAP['木']] || 0),
    // ... 其他元素
  }
}
```

### 方案 B: 後端資料結構不同

如果 Console 顯示完全不同的結構，請提供實際輸出以便進一步診斷。

---

## 📋 回報格式

如果問題仍未解決，請提供以下資訊：

1. **Backend wuxingDistribution 完整輸出**
2. **Adapted wuxingDistribution 完整輸出**
3. **瀏覽器 Console 的錯誤訊息** (如果有)
4. **五行分布區塊的實際顯示** (截圖)

---

## 🎯 驗收標準

修復成功後，應該看到：

1. **原始得分**: 顯示各元素的數字 (例: 木: 3, 火: 1, 土: 3, 金: 1, 水: 2)
2. **月令調整後**: 顯示調整後的數字 (例: 木: 3.5, 火: 1.2, 土: 4.0, 金: 1.0, 水: 2.5)
3. **圖表**: 兩條橫條 (淺色=原始, 深色=調整後)
4. **摘要**: 優勢元素、缺失元素、平衡度百分比

---

**診斷人**: Amazon Q Developer CLI  
**下一步**: 請執行診斷步驟並回報 Console 輸出
