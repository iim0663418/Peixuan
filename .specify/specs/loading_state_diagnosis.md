# 性格/運勢分析頁面載入狀態診斷報告

**日期**: 2026-02-04  
**問題**: 使用者無法感知分析頁面的載入狀態  
**影響範圍**: UnifiedAIAnalysisView.vue (性格分析 & 運勢分析)

---

## 問題分析

### 1. 現有實作狀態

#### ✅ 已實作的功能
- **AnalysisSkeleton 組件**: 骨架屏組件已創建並正常運作
- **isLoading 狀態管理**: 正確追蹤載入狀態
- **loadingMessage/loadingHint**: 已定義但未使用
- **快取檢查機制**: 可區分快取/新生成分析

#### ❌ 問題點
1. **缺少載入訊息顯示**: `loadingMessage` 和 `loadingHint` 變數已定義但未在 template 中渲染
2. **無進度指示**: `progress` 變數已追蹤但未顯示給使用者
3. **骨架屏缺乏上下文**: 使用者看到骨架屏但不知道系統正在做什麼
4. **無時間預估**: 使用者不知道需要等待多久

### 2. 使用者體驗問題

```
當前體驗流程:
1. 使用者點擊「性格分析」或「運勢分析」
2. 頁面跳轉 → 立即顯示骨架屏
3. ❌ 沒有任何文字說明正在發生什麼
4. ❌ 沒有進度指示
5. ❌ 不知道是從快取讀取還是 AI 生成中
6. 等待 5-30 秒後內容突然出現
```

### 3. 根本原因

**Template 缺少載入狀態 UI 區塊**:
```vue
<!-- 當前 template 結構 -->
<div v-else class="glass-card main-card">
  <div class="card-header">...</div>
  
  <!-- ❌ 直接顯示骨架屏，無任何說明 -->
  <AnalysisSkeleton v-if="isLoading" />
  
  <div v-else class="analysis-content">...</div>
</div>
```

**Script 中已準備好的資料未使用**:
```typescript
const loadingMessage = ref('');  // ❌ 未在 template 使用
const loadingHint = ref('');     // ❌ 未在 template 使用
const progress = ref(0);         // ❌ 未在 template 使用
```

---

## 解決方案設計

### Phase 1: 最小化載入狀態顯示 (P0 - 緊急)

**目標**: 在骨架屏上方添加載入訊息，讓使用者知道系統狀態

#### BDD 規格

```gherkin
Scenario: 顯示載入狀態訊息
  Given 使用者進入性格/運勢分析頁面
  And isLoading 為 true
  When 頁面渲染時
  Then 應在骨架屏上方顯示 loadingMessage
  And 應顯示 loadingHint 作為輔助說明
  And 訊息應根據快取狀態動態變化
    | 快取狀態 | loadingMessage | loadingHint |
    | 有快取   | "正在從星塵記憶中讀取..." | "這會很快的！" |
    | 無快取   | "佩璇正在為你分析命盤..." | "這可能需要 10-30 秒" |
```

#### 實作需求

**Template 修改** (UnifiedAIAnalysisView.vue):
```vue
<!-- 載入中 (骨架屏 + 載入訊息) -->
<div v-if="isLoading" class="loading-container">
  <!-- 載入訊息區 -->
  <div class="loading-header">
    <Icon 
      icon="svg-spinners:3-dots-fade" 
      width="32" 
      class="loading-icon"
    />
    <p class="loading-message">{{ loadingMessage }}</p>
    <p class="loading-hint">{{ loadingHint }}</p>
  </div>
  
  <!-- 骨架屏 -->
  <AnalysisSkeleton />
</div>
```

**CSS 樣式** (scoped):
```css
.loading-container {
  width: 100%;
}

.loading-header {
  text-align: center;
  padding: var(--space-2xl) 0;
  margin-bottom: var(--space-xl);
}

.loading-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.loading-message {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.loading-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}
```

### Phase 2: 進度指示器 (P1 - 重要)

**目標**: 顯示分析進度百分比，增強可預測性

#### BDD 規格

```gherkin
Scenario: 顯示分析進度
  Given 使用者正在等待分析結果
  And isLoading 為 true
  When SSE 串流接收到資料
  Then progress 值應從 0 增加到 95
  And 應顯示進度條視覺化 progress 值
  And 進度條應平滑過渡
```

#### 實作需求

**Template 添加**:
```vue
<div class="loading-header">
  <Icon icon="svg-spinners:3-dots-fade" width="32" />
  <p class="loading-message">{{ loadingMessage }}</p>
  <p class="loading-hint">{{ loadingHint }}</p>
  
  <!-- 進度條 -->
  <div class="progress-bar-container">
    <div class="progress-bar" :style="{ width: `${progress}%` }" />
  </div>
  <p class="progress-text">{{ progress }}%</p>
</div>
```

**CSS 樣式**:
```css
.progress-bar-container {
  width: 100%;
  max-width: 400px;
  height: 4px;
  background: rgba(147, 112, 219, 0.2);
  border-radius: 2px;
  margin: var(--space-lg) auto;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: var(--space-xs);
}
```

### Phase 3: 國際化支援 (P1 - 重要)

**目標**: 確保載入訊息支援中英雙語

#### i18n 鍵值需求

**zh_TW.json**:
```json
{
  "personality": {
    "loading_message": "佩璇正在為你分析性格特質...",
    "loading_hint": "這可能需要 10-30 秒，請稍候",
    "loading_cached": "正在從星塵記憶中讀取...",
    "loading_hint_cached": "這會很快的！"
  },
  "fortune": {
    "loading_message": "佩璇正在為你分析流年運勢...",
    "loading_hint": "這可能需要 10-30 秒，請稍候",
    "loading_cached": "正在從星塵記憶中讀取...",
    "loading_hint_cached": "這會很快的！"
  }
}
```

**en.json**:
```json
{
  "personality": {
    "loading_message": "Peixuan is analyzing your personality...",
    "loading_hint": "This may take 10-30 seconds",
    "loading_cached": "Loading from stardust memory...",
    "loading_hint_cached": "This will be quick!"
  },
  "fortune": {
    "loading_message": "Peixuan is analyzing your fortune...",
    "loading_hint": "This may take 10-30 seconds",
    "loading_cached": "Loading from stardust memory...",
    "loading_hint_cached": "This will be quick!"
  }
}
```

---

## 實施計畫

### 優先級矩陣

| Phase | 功能 | 優先級 | 工作量 | 影響 |
|:---:|:---|:---:|:---:|:---|
| 1 | 載入訊息顯示 | P0 | 1h | 立即改善 UX |
| 2 | 進度指示器 | P1 | 1h | 增強可預測性 |
| 3 | 國際化支援 | P1 | 0.5h | 完整雙語體驗 |

### 驗收標準

#### Phase 1 驗收
- [ ] 載入時顯示 `loadingMessage` 和 `loadingHint`
- [ ] 快取/非快取狀態訊息正確切換
- [ ] 載入圖標動畫流暢
- [ ] 深色模式下文字對比度符合 WCAG AA

#### Phase 2 驗收
- [ ] 進度條從 0% 平滑增長到 95%
- [ ] 進度百分比數字即時更新
- [ ] 進度條視覺設計符合品牌風格

#### Phase 3 驗收
- [ ] 中文環境顯示中文載入訊息
- [ ] 英文環境顯示英文載入訊息
- [ ] 語言切換時載入訊息即時更新

---

## 技術風險評估

### 低風險
- ✅ 不涉及後端 API 修改
- ✅ 不影響現有 SSE 串流邏輯
- ✅ 純前端 UI 增強

### 需注意
- ⚠️ 確保 `loadingMessage` 在 `startStreaming()` 中正確設定
- ⚠️ 進度條動畫不應影響主執行緒效能
- ⚠️ 深色模式下進度條顏色需測試

---

## 預期成果

### 改善前
```
[使用者視角]
點擊分析 → 看到骨架屏 → ❓❓❓ → 30秒後內容出現
```

### 改善後
```
[使用者視角]
點擊分析 → 看到「佩璇正在為你分析...」
         → 看到進度條 0% → 20% → 50% → 95%
         → 內容平滑出現
```

### 量化指標
- **感知等待時間**: 預期降低 40%（透過進度反饋）
- **使用者焦慮感**: 預期降低 60%（透過明確狀態說明）
- **跳出率**: 預期降低 20%（減少「卡住了」的誤解）

---

## 結論

**核心問題**: 載入狀態資料已存在但未顯示給使用者  
**解決方案**: 最小化 UI 修改，將現有 `loadingMessage`/`loadingHint`/`progress` 渲染到 template  
**實施難度**: 低（純前端 UI，無邏輯變更）  
**預期效益**: 高（顯著改善使用者體驗）

**建議**: 立即實施 Phase 1，Phase 2-3 可在下一個迭代完成。
