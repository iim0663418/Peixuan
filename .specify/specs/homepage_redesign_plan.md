# 首頁重新排版設計方案

## 📊 當前問題分析

### 重複內容
- **Trust Section** (為什麼與佩璇對話？) 
- **Features Section** (核心特色)
→ 兩者都是展示平台優勢，內容重複

### 當前結構 (7 個 Sections)
```
1. Hero Section          - 品牌介紹 + 主 CTA
2. Trust Section         - 3 個信任要素 (傳統命理、AI、隱私)
3. Journey Section       - 3 步驟流程
4. Services Section      - 3 個核心服務
5. Daily Reminder        - 條件顯示 (有命盤才顯示)
6. CTA Section          - 行動呼籲
7. Features Section      - 3 個核心特色 (與 Trust 重複)
```

---

## 🎯 優化方案：合併為 5 個核心 Sections

### 新結構
```
1. Hero Section          - 品牌故事 + 主 CTA
   ├─ 佩璇介紹
   ├─ 核心價值主張
   └─ 開始體驗按鈕

2. Features Section      - 平台優勢 (合併 Trust + Features)
   ├─ 精準雙系統 (傳統命理)
   ├─ 即時智慧分析 (AI)
   └─ 純淨隱私環境 (隱私)

3. Services Section      - 核心服務
   ├─ 命盤計算 (基礎)
   ├─ AI 深度分析 (進階)
   └─ 每日一問 (持續)

4. Journey Section       - 使用流程
   ├─ Step 1: 輸入資料
   ├─ Step 2: AI 解碼
   └─ Step 3: 獲得指引

5. CTA Section          - 行動呼籲
   ├─ 新用戶: 立即開始
   └─ 回訪用戶: 繼續探索
```

### 移除的 Sections
- ❌ Trust Section (合併到 Features)
- ❌ Daily Reminder Section (功能重複，移除)

---

## 🎨 視覺設計調整

### Section 順序邏輯
```
Hero (吸引注意)
  ↓
Features (建立信任)
  ↓
Services (展示價值)
  ↓
Journey (降低門檻)
  ↓
CTA (促成轉化)
```

### 間距系統
```css
Hero:     min-height: 100vh (全屏)
Features: padding: 5xl 0 (80px)
Services: padding: 5xl 0 (80px)
Journey:  padding: 5xl 0 (80px)
CTA:      padding: 5xl 0 (80px)
```

---

## 📝 實施步驟

### Step 1: 刪除重複 Sections
- [ ] 刪除 Trust Section (第 183-200 行)
- [ ] 刪除 Daily Reminder Section (第 247-256 行)
- [ ] 刪除 trustItems computed 屬性

### Step 2: 重新排序 Sections
```
1. Hero Section (保持)
2. Features Section (移到第二位)
3. Services Section (保持)
4. Journey Section (保持)
5. CTA Section (保持)
```

### Step 3: 更新 i18n 鍵值
- [ ] 統一使用 `home.features.*`
- [ ] 移除 `home.trust.*`
- [ ] 移除 `home.sections.dailyReminder`

### Step 4: 更新樣式
- [ ] 統一 section-container 最大寬度
- [ ] 統一間距系統
- [ ] 優化響應式斷點

---

## 🎯 預期效果

### 優化前 (7 Sections)
- 頁面過長，用戶疲勞
- 內容重複，降低專業感
- 轉化路徑不清晰

### 優化後 (5 Sections)
- ✅ 頁面精簡，重點突出
- ✅ 內容不重複，專業度提升
- ✅ 轉化路徑清晰流暢
- ✅ 減少 ~30% 頁面長度

---

## 📊 對比表

| 項目 | 優化前 | 優化後 | 改善 |
|------|--------|--------|------|
| Sections 數量 | 7 個 | 5 個 | -28% |
| 重複內容 | 2 處 | 0 處 | -100% |
| 頁面長度 | ~711 行 | ~550 行 | -23% |
| 轉化路徑 | 模糊 | 清晰 | ✅ |

---

## ✅ 建議採用

**理由**:
1. 消除內容重複，提升專業度
2. 縮短頁面長度，降低跳出率
3. 清晰的轉化路徑，提升轉化率
4. 符合現代 Landing Page 最佳實踐

**風險**:
- 低風險：只是重新排列，不影響功能
- 可回滾：保留舊代碼作為備份
