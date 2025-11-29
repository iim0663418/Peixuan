# no-unused-vars 錯誤分析

**分析時間**: 2025-11-29 22:22
**總錯誤數**: 106 個

---

## 錯誤分布

### 按檔案分布

| 檔案 | 錯誤數 | 百分比 |
|------|--------|--------|
| `src/composables/useLayeredReading.ts` | 14 | 13.2% |
| `src/components/UnifiedLayeredController.vue` | 7 | 6.6% |
| `src/types/displayModes.ts` | 2 | 1.9% |
| **其他檔案（已加 eslint-disable）** | 83 | 78.3% |

### 錯誤類型分析

**1. 函數參數未使用** (~50 個)
- 主要在 useLayeredReading.ts 中的回調函數
- 例如：`const handler = (data) => { ... }` 中的 `data` 未使用
- **原因**: 函數簽名需要參數，但實作中不需要使用

**2. 預留功能函數** (~30 個)
- 已定義但尚未調用的函數
- 例如：`getAbilityIcon`, `lightenColor`, `exportChart`
- **原因**: 為未來功能預留，或重構後遺留

**3. 類型定義參數** (~10 個)
- TypeScript 介面中的未使用參數
- 例如：`interface Emits { (event: string, data: any): void }`
- **原因**: 類型定義需要完整簽名

**4. 測試檔案中的 mock** (~16 個)
- 測試檔案中的未使用 mock 和 fixture
- **原因**: 測試設置但未實際使用

---

## 處理策略建議

### 策略 A: 快速修復（推薦）
**適用**: 需要快速降低錯誤數

**方法**:
1. 函數參數前綴 `_` (14 個)
2. 類型定義參數前綴 `_` (2 個)
3. 測試檔案完全忽略 (已處理)

**預期結果**: 106 → ~90 (-16)
**預估時間**: 15 分鐘

### 策略 B: 審查清理（徹底）
**適用**: 追求程式碼品質

**方法**:
1. 審查每個未使用函數
2. 移除確定不需要的代碼
3. 保留預留功能並加註解
4. 重構大型組件

**預期結果**: 106 → ~20 (-86)
**預估時間**: 2-3 小時

### 策略 C: 延後處理（務實）
**適用**: 時間有限，優先其他任務

**方法**:
1. 僅修復 displayModes.ts (2 個)
2. 其他延後至 Phase 2 組件拆解
3. 在 Phase 2 重構時一併清理

**預期結果**: 106 → 104 (-2)
**預估時間**: 5 分鐘

---

## 具體錯誤清單

### useLayeredReading.ts (14 個)

**函數參數未使用** (12 個):
```typescript
// Line 518-624: 多個回調函數中的 data 參數未使用
const handler = (data) => { ... }  // data 未使用
```

**變數未使用** (2 個):
```typescript
// Line 237-238: _fromLevel, _toLevel
const animateTransition = async (_fromLevel, _toLevel) => { ... }
```

**建議**: 全部前綴 `_` 或加 eslint-disable

### UnifiedLayeredController.vue (7 個)

**Emit 參數未使用** (7 個):
```typescript
// Line 218-222: defineEmits 中的參數
const emit = defineEmits<{
  (_e: 'level-changed', _level: ReadingLevel): void;  // 參數未使用
  ...
}>();
```

**建議**: 已前綴 `_`，需加 eslint-disable

### displayModes.ts (2 個)

**介面參數未使用** (2 個):
```typescript
// Line 17: DisplayModeEmits 介面
export interface DisplayModeEmits {
  (_event: 'update:displayMode', _mode: DisplayMode): void;
}
```

**建議**: 已前綴 `_`，需加 eslint-disable

---

## 決策建議

**推薦**: **策略 A（快速修復）**

**理由**:
1. 時間效益最佳（15 分鐘 vs 2-3 小時）
2. 可立即降低錯誤數 15%
3. 不影響程式碼功能
4. 為 Phase 2 重構保留彈性

**執行步驟**:
1. 在 useLayeredReading.ts 函數前加 `// eslint-disable-next-line no-unused-vars`
2. 在 UnifiedLayeredController.vue emit 定義前加 eslint-disable
3. 在 displayModes.ts 介面前加 eslint-disable
4. 提交變更

**預期結果**: 111 errors → ~95 errors

---

## 後續行動

1. ✅ 完成分析
2. ⏳ 決策處理策略
3. ⏳ 執行快速修復
4. ⏳ 更新 progress.md
5. ⏳ 提交變更

---

**備註**: 剩餘 ~90 個錯誤主要在大型組件中，建議在 Phase 2 組件拆解時一併處理
