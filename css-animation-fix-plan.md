# CSS 動畫全面修復計劃

## 修復概覽
**目標**: 一次性解決所有 CSS 動畫問題，提升移動端體驗
**預估時間**: 45-60 分鐘
**影響範圍**: 16 個組件 + 1 個核心樣式文件

## 🎯 修復目標

### P0 緊急修復
1. **移動端動畫失效** - 修復 `animation: none !important` 過度限制
2. **will-change 統一管理** - 移除組件內分散設定，統一管理
3. **移除激進 !important** - 改用溫和的動畫調整策略

### P1 品質提升
4. **prefers-reduced-motion 完整支援** - 確保所有動畫組件支援
5. **強制 GPU 加速** - 為關鍵動畫添加 transform3d
6. **iOS Safari 兼容性** - 添加 -webkit- 前綴支援

## 📋 修復清單

### Phase 1: 核心樣式修復 (animations.css)
- [ ] 移除過度激進的 `animation: none !important`
- [ ] 改善移動端動畫時長調整策略
- [ ] 統一 will-change 管理類別
- [ ] 添加 -webkit- 前綴支援
- [ ] 強化 GPU 加速類別

### Phase 2: 組件 will-change 清理 (5 個組件)
- [ ] BaziChart.vue - 移除 `will-change: auto`
- [ ] FortuneTimeline.vue - 移除 `will-change: transform`
- [ ] WuXingChart.vue - 移除 `will-change: transform`
- [ ] DailyQuestionPanel.vue - 移除 `will-change: transform`
- [ ] ChatBubble.vue - 移除 `will-change: opacity, transform`

### Phase 3: prefers-reduced-motion 補齊 (11 個組件)
- [ ] AppHeader.vue
- [ ] AppFooter.vue
- [ ] AnnualFortuneCard.vue
- [ ] DailyReminderCard.vue
- [ ] UnifiedView.vue
- [ ] BaziChart.vue
- [ ] TechnicalDetailsCard.vue (已有)
- [ ] StarSymmetryDisplay.vue (已有)
- [ ] ServiceCard.vue (已有)
- [ ] NarrativeSummary.vue (已有)
- [ ] HomeView.vue (已有)

### Phase 4: 測試驗證
- [ ] 本地測試 (Chrome DevTools 移動端模擬)
- [ ] Staging 部署測試
- [ ] 跨瀏覽器驗證 (iOS Safari, Android Chrome)

## 🔧 具體修復策略

### 1. animations.css 核心修復
```css
/* 修復前 (問題代碼) */
@media (max-width: 767px) {
  .hero-section::before,
  .quick-access-card::before,
  .floating-decoration {
    animation: none !important; /* 過度限制 */
  }
  * {
    animation-duration: calc(var(--anim-duration-normal) * 0.8) !important; /* 激進 */
  }
}

/* 修復後 (溫和策略) */
@media (max-width: 767px) {
  /* 選擇性禁用連續動畫，保留入場動畫 */
  .continuous-animation,
  .infinite-animation {
    animation-iteration-count: 1;
    animation-duration: var(--anim-duration-fast);
  }
  
  /* 溫和的時長調整，不使用 !important */
  .fade-in-up,
  .scale-in,
  .slide-in-right {
    animation-duration: var(--anim-duration-fast);
  }
}
```

### 2. 統一 will-change 管理
```css
/* 新增統一管理類別 */
.will-change-transform {
  will-change: transform;
}

.will-change-opacity {
  will-change: opacity;
}

.will-change-auto {
  will-change: auto;
}

/* 動畫完成後自動清理 */
.animation-complete {
  will-change: auto;
}
```

### 3. iOS Safari 兼容性
```css
/* 添加 -webkit- 前綴 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, 20px, 0);
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.fade-in-up {
  -webkit-animation: fadeInUp var(--anim-duration-slow) var(--anim-ease-out) backwards;
  animation: fadeInUp var(--anim-duration-slow) var(--anim-ease-out) backwards;
}
```

### 4. prefers-reduced-motion 標準模板
```css
/* 標準模板 - 應用到所有組件 */
@media (prefers-reduced-motion: reduce) {
  .component-name * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🧪 測試計劃

### 本地測試
1. Chrome DevTools 移動端模擬 (iPhone, Android)
2. 動畫流暢度檢查
3. prefers-reduced-motion 功能測試

### Staging 測試
1. 實際移動設備測試
2. 不同網路條件下的性能
3. 跨瀏覽器兼容性

### 驗收標準
- [ ] 所有入場動畫在移動端正常顯示
- [ ] 連續動畫在移動端適度優化
- [ ] prefers-reduced-motion 完全支援
- [ ] 無 will-change 記憶體洩漏
- [ ] iOS Safari 完全兼容

## 📦 部署策略

### 1. 備份當前版本
```bash
git checkout -b hotfix/css-animation-mobile-fix
cp bazi-app-vue/src/styles/animations.css animations.css.backup
```

### 2. 分階段提交
- Commit 1: 核心 animations.css 修復
- Commit 2: 組件 will-change 清理
- Commit 3: prefers-reduced-motion 補齊
- Commit 4: 測試驗證完成

### 3. Staging 驗證
```bash
cd bazi-app-vue && npm run build
cd ../peixuan-worker && wrangler deploy --env staging
```

## ⏱️ 執行時間表

| Phase | 預估時間 | 說明 |
|-------|----------|------|
| Phase 1 | 15 分鐘 | 核心樣式修復 |
| Phase 2 | 10 分鐘 | will-change 清理 |
| Phase 3 | 15 分鐘 | prefers-reduced-motion 補齊 |
| Phase 4 | 15 分鐘 | 測試驗證 |
| **總計** | **55 分鐘** | 包含部署時間 |

## 🚀 開始執行

準備好開始修復了嗎？我將按照以上計劃逐步執行：

1. **立即開始** - 按計劃執行所有修復
2. **分階段確認** - 每個 Phase 完成後確認
3. **調整計劃** - 如需修改策略

請確認是否開始執行修復計劃！
