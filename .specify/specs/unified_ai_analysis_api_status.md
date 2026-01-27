# UnifiedAIAnalysisView 後端 API 狀況分析

**分析日期**: 2026-01-27  
**問題**: 雛形設計的後端 API 支援狀況

---

## 🔍 當前 API 狀況

### ✅ 已存在的 API

#### 1. 性格分析 (Personality)
```
GET  /api/v1/analyze/check?chartId={id}&locale={locale}
GET  /api/v1/analyze/stream?chartId={id}&locale={locale}
```

**狀態**: ✅ **完全支援**

#### 2. 運勢分析 (Fortune)
```
GET  /api/v1/analyze/advanced/check?chartId={id}&locale={locale}
GET  /api/v1/analyze/advanced/stream?chartId={id}&locale={locale}
```

**狀態**: ✅ **完全支援**

---

## 📊 雛形設計 vs 實際 API 對照

### 雛形設計需求

| 功能 | 雛形設計 | 實際 API | 狀態 |
|------|---------|---------|------|
| 性格分析串流 | ✅ 需要 | ✅ 存在 | ✅ 支援 |
| 運勢分析串流 | ✅ 需要 | ✅ 存在 | ✅ 支援 |
| 快取檢查 | ✅ 需要 | ✅ 存在 | ✅ 支援 |
| 錯誤處理 | ✅ 需要 | ✅ 存在 | ✅ 支援 |
| 重新分析 | ✅ 需要 | ✅ 存在 | ✅ 支援 |

---

## ❌ 雛形設計中「不存在」的 API

### 1. 下載 PDF 報告
```javascript
const downloadPDF = () => { 
  ElementPlus.ElNotification({ 
    title: '報告生成中', 
    message: '佩璇正在整理您的命運藍圖...', 
    type: 'info' 
  }); 
};
```

**狀態**: ❌ **後端無對應 API**

**需要的 API**:
```
POST /api/v1/analyze/export/pdf
Body: { chartId, analysisType, locale }
Response: PDF file download
```

---

### 2. 分享功能
```html
<el-button>
  <iconify-icon icon="lucide:share-2"></iconify-icon> 分享我的命運
</el-button>
```

**狀態**: ❌ **後端無對應 API**

**需要的 API**:
```
POST /api/v1/analyze/share
Body: { chartId, analysisType }
Response: { shareUrl, shareToken }
```

---

### 3. 後續提問 (Follow-up Question)
```html
<el-input 
  v-model="followUpQuestion" 
  placeholder="針對結果進一步提問..."
>
  <template #suffix>
    <iconify-icon icon="lucide:send"></iconify-icon>
  </template>
</el-input>
```

**狀態**: ❌ **後端無對應 API**

**需要的 API**:
```
POST /api/v1/analyze/followup
Body: { chartId, analysisType, question }
Response: SSE stream
```

---

### 4. 分段解析卡片數據
```html
<div class="glass-card">
  <h3>靈魂建議</h3>
  <p>{{ t('suggestion') }}</p>
</div>
<div class="glass-card">
  <h3>能量轉折</h3>
  <p>{{ t('energy') }}</p>
</div>
```

**狀態**: ⚠️ **數據來源不明確**

**選項 1**: 從 Markdown 內容中提取
**選項 2**: 後端返回結構化數據
```
GET /api/v1/analyze/insights?chartId={id}
Response: {
  suggestion: "...",
  energy: "...",
  tags: ["外柔內剛", "直覺敏銳"]
}
```

---

### 5. 核心標籤系統
```html
<span class="tag-item"># 外柔內剛</span>
<span class="tag-item"># 直覺敏銳</span>
```

**狀態**: ⚠️ **數據來源不明確**

**選項 1**: 前端從 Markdown 提取關鍵字
**選項 2**: 後端返回標籤數組
```
Response: {
  tags: ["外柔內剛", "直覺敏銳", "開創性格", "木火相生"]
}
```

---

## 🎯 實施建議

### 方案 A: 最小化實施 (推薦) ⭐⭐⭐⭐⭐

**保留核心功能，移除無 API 支援的功能**

#### 保留
- ✅ 雙欄佈局
- ✅ 串流文字效果
- ✅ Markdown 渲染
- ✅ 快取系統
- ✅ 錯誤處理
- ✅ 佩璇互動區 (僅視覺)

#### 移除/簡化
- ❌ 下載 PDF 按鈕 (暫時移除)
- ❌ 分享按鈕 (暫時移除)
- ❌ 後續提問輸入框 (暫時移除)
- ⚠️ 分段解析卡片 (改為從 Markdown 提取)
- ⚠️ 核心標籤 (改為前端關鍵字提取)

**優點**:
- 立即可實施
- 無需後端開發
- 保留核心價值

---

### 方案 B: 分階段實施 ⭐⭐⭐⭐

**Phase 1: 核心功能 (立即實施)**
- 雙欄佈局
- 串流文字效果
- Markdown 渲染
- 快取系統
- 錯誤處理

**Phase 2: 增強功能 (後端開發後)**
- 下載 PDF
- 分享功能
- 後續提問

**Phase 3: 智能功能 (AI 增強後)**
- 分段解析
- 核心標籤
- 個性化建議

---

### 方案 C: 前端模擬 (過渡方案) ⭐⭐⭐

**暫時使用前端邏輯模擬**

#### 1. 核心標籤提取
```typescript
const extractTags = (markdown: string): string[] => {
  const keywords = ['外柔內剛', '直覺敏銳', '開創性格', '木火相生'];
  return keywords.filter(k => markdown.includes(k)).slice(0, 4);
};
```

#### 2. 分段解析提取
```typescript
const extractInsights = (markdown: string) => {
  // 從 Markdown 中提取「建議」和「能量」相關段落
  const suggestionMatch = markdown.match(/建議.*?[。！]/);
  const energyMatch = markdown.match(/能量.*?[。！]/);
  
  return {
    suggestion: suggestionMatch?.[0] || '',
    energy: energyMatch?.[0] || ''
  };
};
```

#### 3. 按鈕暫時禁用
```html
<el-button disabled>
  <iconify-icon icon="lucide:download"></iconify-icon> 下載 PDF (即將推出)
</el-button>
```

---

## 📝 修正後的雛形設計

### 簡化版側邊欄

```html
<aside class="sidebar">
  <div class="sidebar-sticky">
    <div class="peixuan-whisper">
      <iconify-icon icon="fluent-emoji-flat:unicorn" width="64"></iconify-icon>
      <h4>佩璇的悄悄話</h4>
      <div class="whisper-text">
        {{ whisperText }}
      </div>
    </div>

    <!-- 移除：下載 PDF、分享按鈕 -->
    <!-- 移除：後續提問輸入框 -->
    
    <!-- 保留：返回按鈕 -->
    <el-button class="w-full" @click="goBack">
      <iconify-icon icon="lucide:arrow-left"></iconify-icon> 返回命盤
    </el-button>
  </div>
</aside>
```

### 簡化版分段解析

```html
<!-- 選項 1: 完全移除 -->
<!-- 選項 2: 改為純視覺裝飾 -->
<div class="glass-card">
  <h3>
    <iconify-icon icon="mdi:lightbulb"></iconify-icon> 深入洞察
  </h3>
  <p class="text-sm opacity-80">
    完整的分析內容已在上方呈現，請仔細閱讀佩璇為您準備的命運解讀。
  </p>
</div>
```

---

## 🎯 最終建議

### 推薦：方案 A (最小化實施)

**理由**:
1. ✅ 立即可實施，無需等待後端開發
2. ✅ 保留核心價值（串流分析、Markdown 渲染）
3. ✅ 視覺設計完整（雙欄佈局、佩璇互動區）
4. ✅ 用戶體驗流暢（無「即將推出」的尷尬）

**實施步驟**:
1. 移除無 API 支援的功能
2. 簡化側邊欄為純視覺元素
3. 保留核心串流分析功能
4. 未來後端 API 完成後再添加增強功能

---

## 📊 功能優先級

| 功能 | API 支援 | 用戶價值 | 實施優先級 |
|------|---------|---------|-----------|
| 串流分析 | ✅ | ⭐⭐⭐⭐⭐ | P0 (立即) |
| Markdown 渲染 | ✅ | ⭐⭐⭐⭐⭐ | P0 (立即) |
| 快取系統 | ✅ | ⭐⭐⭐⭐ | P0 (立即) |
| 錯誤處理 | ✅ | ⭐⭐⭐⭐ | P0 (立即) |
| 佩璇互動區 | ✅ | ⭐⭐⭐⭐ | P0 (立即) |
| 下載 PDF | ❌ | ⭐⭐⭐ | P2 (未來) |
| 分享功能 | ❌ | ⭐⭐⭐ | P2 (未來) |
| 後續提問 | ❌ | ⭐⭐ | P3 (未來) |
| 分段解析 | ⚠️ | ⭐⭐ | P3 (未來) |
| 核心標籤 | ⚠️ | ⭐⭐ | P3 (未來) |

---

## 🚀 下一步

**你想要哪個方案？**

### 選項 1: 方案 A - 最小化實施 (推薦)
立即實施核心功能，移除無 API 支援的功能。

### 選項 2: 方案 B - 分階段實施
先實施核心，標記「即將推出」，等待後端開發。

### 選項 3: 方案 C - 前端模擬
使用前端邏輯暫時模擬部分功能。

---

**你的選擇？** 🎯
