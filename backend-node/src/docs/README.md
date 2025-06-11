# 紫微斗數計算 API 文檔

## 概述

本目錄包含紫微斗數計算 API 的完整文檔和規格定義。

## 文檔文件

### `purpleStarApi.yaml`
完整的 OpenAPI 3.0.3 規格文檔，包含：

- **API 端點定義**：所有可用的 API 端點及其參數
- **請求/回應格式**：詳細的數據結構定義
- **錯誤處理**：完整的錯誤場景和錯誤代碼
- **示例**：實際的請求和回應示例
- **驗證規則**：所有輸入參數的驗證約束

## 主要 API 端點

### 1. 計算紫微斗數命盤
```
POST /api/v1/purple-star/calculate
```

**功能**：根據出生信息計算完整的紫微斗數命盤

**必需參數**：
- `birthDate`：出生日期 (YYYY-MM-DD 格式)
- `birthTime`：出生時間 (HH:MM 或 HH:MM:SS 格式)
- `gender`：性別 ("male" 或 "female")

**可選參數**：
- `location`：出生地點信息（緯度、經度、時區）
- `options`：計算選項配置

### 2. 服務健康檢查
```
GET /api/v1/purple-star/health
```

**功能**：檢查服務運行狀態

## 回應格式

### 成功回應
```json
{
  "success": true,
  "data": {
    "chart": { /* 命盤數據 */ },
    "calculationInfo": { /* 計算信息 */ }
  },
  "timestamp": "2023-11-22T10:30:00.000Z"
}
```

### 錯誤回應
```json
{
  "success": false,
  "error": "錯誤描述",
  "details": "詳細錯誤信息",
  "validationErrors": [ /* 驗證錯誤列表 */ ],
  "timestamp": "2023-11-22T10:30:00.000Z"
}
```

## 數據結構

### 命盤結構 (PurpleStarChart)
- `palaces`：十二宮位信息數組
- `mingPalaceIndex`：命宮地支索引 (0-11)
- `shenPalaceIndex`：身宮地支索引 (0-11)
- `fiveElementsBureau`：五行局信息
- `daXian`：大限信息（可選）
- `xiaoXian`：小限信息（可選）

### 宮位結構 (Palace)
- `name`：宮位名稱（如"命宮"、"兄弟宮"等）
- `index`：地支索引 (0-11，子=0)
- `zhi`：地支名稱
- `gan`：天干名稱（可選）
- `stars`：宮位內的星曜數組

### 星曜結構 (Star)
- `name`：星曜名稱
- `type`：星曜類型 ("main"、"auxiliary"、"minor")
- `palaceIndex`：所在宮位索引
- `transformations`：四化狀態數組 (["祿", "權", "科", "忌"])

## 計算選項

### 詳細程度 (detailLevel)
- `basic`：基礎信息（默認）
- `advanced`：進階分析
- `expert`：專家級詳細信息

### 週期計算選項
- `includeMajorCycles`：是否包含大限計算（默認：true）
- `includeMinorCycles`：是否包含小限計算（默認：true）
- `includeAnnualCycles`：是否包含流年計算（默認：false）
- `maxAge`：計算到多少歲（默認：100）

## 錯誤代碼

### 驗證錯誤代碼
- `REQUIRED`：必需字段缺失
- `INVALID_TYPE`：字段類型錯誤
- `INVALID_FORMAT`：格式錯誤
- `INVALID_VALUE`：值不在允許範圍內
- `OUT_OF_RANGE`：數值超出範圍
- `INVALID_DATE`：無效日期

## 使用工具查看文檔

### 1. Swagger UI
你可以使用任何 Swagger UI 工具來查看和測試 API：

```bash
# 使用 swagger-ui-serve 工具
npm install -g swagger-ui-serve
swagger-ui-serve purpleStarApi.yaml
```

### 2. 在線工具
將 `purpleStarApi.yaml` 的內容複製到以下在線工具：
- [Swagger Editor](https://editor.swagger.io/)
- [ReDoc](https://redocly.github.io/redoc/)

### 3. VS Code 擴展
推薦安裝以下 VS Code 擴展來查看和編輯 OpenAPI 文檔：
- **OpenAPI (Swagger) Editor**
- **Swagger Viewer**

## 開發指南

### 添加新端點
1. 在 `purpleStarApi.yaml` 中添加新的路徑定義
2. 在 `components/schemas` 中定義新的數據結構
3. 添加適當的示例和錯誤場景
4. 更新相關的 TypeScript 類型定義

### 修改現有端點
1. 更新 `purpleStarApi.yaml` 中的相應定義
2. 確保向後兼容性或適當的版本控制
3. 更新示例和測試用例
4. 同步更新 TypeScript 類型定義

## 版本控制

API 文檔遵循語義化版本控制：
- **主版本號**：破壞性變更
- **次版本號**：新功能添加
- **修訂版本號**：錯誤修復和文檔更新

當前版本：1.0.0
