# Markdown Formatter Implementation Plan

## 目標
將 CalculationResult 完整轉換為 Markdown 格式，涵蓋後端 API 所有可輸出資訊。

## 輸出結構

### 1. 基本資訊
- 出生日期時間
- 性別
- 經度
- 真太陽時
- 儒略日

### 2. 八字四柱
- 四柱表格（年月日時 + 天干地支）
- 藏干詳細（主氣/中氣/餘氣）
- 十神關係
- 五行分布（原始/調整後）
- 五行平衡分析

### 3. 大運流年
- 起運資訊（日期/方向）
- 大運列表（干支/年齡/時間）
- 當前大運
- 流年資訊（如有）

### 4. 紫微斗數
- 命宮/身宮
- 五行局
- 主星位置（紫微/天府）
- 輔星位置（文昌/文曲/左輔/右弼）
- 十二宮位詳細
- 星曜對稱性分析

### 5. 四化飛星（如有）
- 生年四化
- 大限四化
- 流年四化
- 飛化邊統計
- 循環檢測結果
- 中心性分析

### 6. 流年分析（如有）
- 流年年柱
- 流年命宮
- 干支交互（五合/六沖/三合/三會）
- 太歲分析

### 7. 計算步驟（可選）
- 各步驟輸入輸出
- 使用的算法
- 參考文獻

## 實作檔案

1. `src/formatters/markdownFormatter.ts` - 主格式化器
2. `src/formatters/__tests__/markdownFormatter.test.ts` - 單元測試
3. `src/controllers/unifiedController.ts` - API 整合

## API 介面

```
GET /api/v1/calculate?format=markdown
POST /api/v1/calculate (with format: 'markdown' in body)
```

## 預估時間
- Phase 1: 格式化器實作 (3-4h)
- Phase 2: API 整合 (1h)
- Phase 3: 測試 (1h)
- 總計: 5-6h
