# 無障礙性改進項目

**創建日期**: 2025-12-03  
**優先級**: 低  
**狀態**: 待處理

## 問題描述

### Label For 屬性警告

**警告訊息**:
```
Incorrect use of <label for=FORM_ELEMENT>
The label's for attribute doesn't match any element id.
```

**影響**:
- 瀏覽器自動填充可能受影響
- 無障礙工具可能無法正確工作
- 不影響核心功能

**位置**: `UnifiedInputForm.vue`

## 解決方案

### 需要添加的 ID

為所有表單輸入元素添加明確的 `id` 屬性：

```vue
<!-- 出生日期 -->
<el-date-picker
  id="birth-date"
  v-model="formData.birthDate"
  ...
/>

<!-- 出生時間 -->
<el-time-picker
  id="birth-time"
  v-model="formData.birthTime"
  ...
/>

<!-- 性別 -->
<el-radio-group
  id="gender"
  v-model="formData.gender"
>
  ...
</el-radio-group>

<!-- 地址輸入 -->
<el-input
  id="address-input"
  v-model="addressInput"
  ...
/>

<!-- 經度 -->
<el-input
  id="longitude"
  v-model.number="formData.longitude"
  ...
/>

<!-- 緯度 -->
<el-input
  id="latitude"
  v-model.number="formData.latitude"
  ...
/>

<!-- 時區 -->
<el-select
  id="timezone"
  v-model="formData.timezone"
  ...
/>
```

## 其他無障礙性改進

### 1. ARIA 標籤

為互動元素添加 ARIA 標籤：

```vue
<el-button
  aria-label="查詢座標"
  @click="geocodeCurrentAddress"
>
  查詢座標
</el-button>

<el-button
  aria-label="計算命盤"
  type="primary"
  @click="handleSubmit"
>
  計算
</el-button>
```

### 2. 鍵盤導航

確保所有互動元素可通過鍵盤訪問：
- Tab 鍵順序合理
- Enter 鍵可提交表單
- Escape 鍵可關閉對話框

### 3. 焦點管理

- 表單錯誤時自動聚焦到第一個錯誤欄位
- 對話框打開時聚焦到第一個可互動元素
- 對話框關閉時恢復焦點到觸發元素

### 4. 顏色對比度

確保所有文字與背景的對比度符合 WCAG AA 標準：
- 正常文字: 4.5:1
- 大文字: 3:1
- 互動元素: 3:1

### 5. 錯誤訊息

- 使用 `role="alert"` 標記錯誤訊息
- 提供清晰的錯誤描述
- 錯誤訊息與對應欄位關聯

## 實施計劃

### Phase 1: 基礎修復 (1-2h)
- [ ] 添加所有表單元素 ID
- [ ] 驗證 label for 屬性匹配
- [ ] 測試瀏覽器自動填充

### Phase 2: ARIA 增強 (2-3h)
- [ ] 添加 ARIA 標籤
- [ ] 添加 ARIA 描述
- [ ] 測試螢幕閱讀器

### Phase 3: 鍵盤導航 (1-2h)
- [ ] 驗證 Tab 順序
- [ ] 添加鍵盤快捷鍵
- [ ] 測試鍵盤操作

### Phase 4: 視覺優化 (2-3h)
- [ ] 檢查顏色對比度
- [ ] 優化焦點指示器
- [ ] 測試高對比度模式

### Phase 5: 測試與驗證 (2-3h)
- [ ] 使用 axe DevTools 掃描
- [ ] 使用 NVDA/JAWS 測試
- [ ] 使用 Lighthouse 評分

## 參考資料

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Element Plus Accessibility](https://element-plus.org/en-US/guide/a11y.html)
- [Vue.js Accessibility](https://vuejs.org/guide/best-practices/accessibility.html)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## 測試工具

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA](https://www.nvaccess.org/) (螢幕閱讀器)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (螢幕閱讀器)

---

**備註**: 這些改進不影響當前功能，可以在後續迭代中逐步實施。優先級低於核心功能開發和 P1/P2 RWD 優化。
