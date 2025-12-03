# UI 優化計畫

**目標**：優化 UnifiedInputForm 和 UnifiedResultView 的視覺一致性、響應式設計和用戶體驗

**預估時間**：65 分鐘

---

## Phase 1: UnifiedInputForm 設計系統整合 (30min)

### Task 1.1: 替換硬編碼顏色為 CSS 變數
**檔案**：`bazi-app-vue/src/components/UnifiedInputForm.vue`

**需要替換的顏色**：
- 背景色：`#f5f5f5`, `#fff` → `var(--bg-secondary)`, `var(--bg-primary)`
- 邊框色：`#dcdfe6`, `#e4e7ed` → `var(--border-light)`
- 文字色：`#606266`, `#909399` → `var(--text-primary)`, `var(--text-secondary)`
- 主題色：`#409eff` → `var(--primary-color)`

**範例**：
```css
/* 修改前 */
.coordinate-inputs {
  background: #f5f5f5;
  border: 1px solid #dcdfe6;
}

/* 修改後 */
.coordinate-inputs {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
}
```

### Task 1.2: 移除內聯樣式
**目標**：將按鈕區的內聯 `style` 移到 `<style scoped>` 區塊

**修改前**：
```vue
<div style="display: flex; gap: 12px; width: 100%;">
  <el-button style="flex: 1;">...</el-button>
</div>
```

**修改後**：
```vue
<div class="button-group">
  <el-button class="submit-btn">...</el-button>
</div>

<style scoped>
.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
}
.submit-btn {
  flex: 1;
}
</style>
```

### Task 1.3: 統一間距和字體
**目標**：使用 Design Tokens 的間距和字體變數

**需要統一的樣式**：
- `padding`: 使用 `var(--spacing-md)`, `var(--spacing-lg)`
- `margin`: 使用 `var(--spacing-sm)`, `var(--spacing-md)`
- `font-size`: 使用 `var(--font-size-base)`, `var(--font-size-sm)`
- `border-radius`: 使用 `var(--radius-md)`

---

## Phase 2: 按鈕區優化 (15min)

### Task 2.1: 改善「清除快取」按鈕樣式
**目標**：添加圖標、改善視覺效果、優化鎖定狀態

**優化內容**：
1. 添加圖標（Element Plus Icons）
2. 改善按鈕顏色和懸停效果
3. 添加提示文字（tooltip）
4. 優化鎖定狀態的視覺反饋

**範例**：
```vue
<el-button 
  type="primary" 
  :disabled="hasCache"
  :icon="hasCache ? Lock : Check"
  @click="submitForm"
>
  {{ hasCache ? '已有快取命盤' : '開始計算' }}
</el-button>

<el-tooltip content="清除快取後可重新計算" placement="top">
  <el-button 
    v-if="hasCache"
    type="warning"
    :icon="Delete"
    @click="clearCache"
  >
    清除快取
  </el-button>
</el-tooltip>
```

### Task 2.2: 優化按鈕響應式
**目標**：改善移動端按鈕體驗

**優化內容**：
1. 移動端按鈕堆疊（垂直排列）
2. 觸控目標最小 44px
3. 間距調整

**範例**：
```css
.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  .button-group .el-button {
    min-height: 44px;
  }
}
```

---

## Phase 3: UnifiedResultView 設計系統完善 (20min)

### Task 3.1: 替換剩餘硬編碼顏色
**檔案**：`bazi-app-vue/src/components/UnifiedResultView.vue`

**需要檢查的區域**：
- 卡片背景和邊框
- 標題顏色
- 分隔線顏色
- 懸停效果

### Task 3.2: 統一卡片樣式
**目標**：所有卡片使用一致的間距、圓角、陰影

**範例**：
```css
.section {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.section h4 {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}
```

### Task 3.3: 優化 Tab 導航
**目標**：改善移動端 Tab 體驗

**優化內容**：
1. Tab 標籤最小觸控目標 44px
2. 添加滑動提示（移動端）
3. 優化 Tab 間距

---

## 驗收標準

### ✅ 設計系統一致性
- [ ] 所有顏色使用 CSS 變數
- [ ] 所有間距使用 Design Tokens
- [ ] 無內聯樣式

### ✅ 響應式設計
- [ ] 移動端體驗良好（< 768px）
- [ ] 觸控目標 ≥ 44px
- [ ] 按鈕適當堆疊

### ✅ 視覺效果
- [ ] 統一卡片樣式
- [ ] 清晰的視覺層次
- [ ] 流暢的動畫過渡

### ✅ 用戶體驗
- [ ] 清晰的鎖定狀態提示
- [ ] 明確的操作反饋
- [ ] 友善的錯誤提示

---

## 實作順序

1. **Phase 1**: UnifiedInputForm 設計系統整合
2. **Phase 2**: 按鈕區優化
3. **Phase 3**: UnifiedResultView 設計系統完善

**總預估時間**：65 分鐘
