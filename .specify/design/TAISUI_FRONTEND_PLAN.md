# 流年太歲前端顯示規劃

**基於**: 後端 Tai Sui Analysis 實現  
**預估時間**: 1-2 小時  
**優先級**: 高（配合後端新功能）

---

## 📊 後端資料結構

### API Response (annualFortune.taiSuiAnalysis)

```typescript
{
  zhi: boolean;              // 值太歲
  chong: boolean;            // 沖太歲
  xing: {                    // 刑太歲
    hasXing: boolean;
    xingType?: 'san_xing' | 'zi_xing' | 'wu_en_xing';
    description?: string;
  };
  po: boolean;               // 破太歲
  hai: boolean;              // 害太歲
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  types: string[];           // ['值太歲', '刑太歲（三刑：寅巳申）']
  recommendations: string[]; // 建議列表
}
```

---

## 🎨 UI 設計方案

### 方案 A: 警示卡片（推薦）

**位置**: UnifiedResultView → 流年分頁頂部

**設計**:
```
┌─────────────────────────────────────────┐
│ ⚠️ 流年太歲分析                          │
├─────────────────────────────────────────┤
│ 嚴重度: 🔴 高 (High)                     │
│                                         │
│ 犯太歲類型:                              │
│ • 值太歲 (本命年)                        │
│ • 刑太歲 (三刑：寅巳申)                  │
│                                         │
│ 建議:                                    │
│ 1. 建議年初安太歲，祈求平安順遂          │
│ 2. 本命年宜低調行事，避免重大變動        │
│ 3. 注意法律文書，謹慎處理合約事宜        │
│ 4. 建議配戴護身符或吉祥物                │
└─────────────────────────────────────────┘
```

**顏色方案**:
- `none`: 綠色 (success)
- `low`: 藍色 (info)
- `medium`: 黃色 (warning)
- `high`: 橙色 (warning)
- `critical`: 紅色 (error)

---

## 📋 實施步驟

### Task 1: 創建 TaiSuiCard 組件 (30 min)

**檔案**: `bazi-app-vue/src/components/TaiSuiCard.vue`

```vue
<template>
  <el-card v-if="taiSuiAnalysis" class="taisui-card" :class="`severity-${taiSuiAnalysis.severity}`">
    <template #header>
      <div class="card-header">
        <span class="icon">{{ getSeverityIcon(taiSuiAnalysis.severity) }}</span>
        <span class="title">流年太歲分析</span>
        <el-tag :type="getSeverityType(taiSuiAnalysis.severity)" size="large">
          {{ getSeverityLabel(taiSuiAnalysis.severity) }}
        </el-tag>
      </div>
    </template>

    <!-- 無犯太歲 -->
    <div v-if="taiSuiAnalysis.severity === 'none'" class="no-violation">
      <el-result icon="success" title="本年度無犯太歲" sub-title="運勢平穩，諸事順遂">
        <template #extra>
          <el-button type="primary">查看流年運勢</el-button>
        </template>
      </el-result>
    </div>

    <!-- 有犯太歲 -->
    <div v-else class="violation-details">
      <!-- 犯太歲類型 -->
      <div class="section">
        <h4>犯太歲類型</h4>
        <el-space wrap>
          <el-tag
            v-for="type in taiSuiAnalysis.types"
            :key="type"
            :type="getTypeTagType(type)"
            size="large"
            effect="dark"
          >
            {{ type }}
          </el-tag>
        </el-space>
      </div>

      <!-- 詳細說明 -->
      <div class="section">
        <h4>詳細說明</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="值太歲">
            {{ taiSuiAnalysis.zhi ? '✓ 是' : '✗ 否' }}
          </el-descriptions-item>
          <el-descriptions-item label="沖太歲">
            {{ taiSuiAnalysis.chong ? '✓ 是' : '✗ 否' }}
          </el-descriptions-item>
          <el-descriptions-item label="刑太歲">
            {{ taiSuiAnalysis.xing.hasXing ? `✓ ${taiSuiAnalysis.xing.description}` : '✗ 否' }}
          </el-descriptions-item>
          <el-descriptions-item label="破太歲">
            {{ taiSuiAnalysis.po ? '✓ 是' : '✗ 否' }}
          </el-descriptions-item>
          <el-descriptions-item label="害太歲" :span="2">
            {{ taiSuiAnalysis.hai ? '✓ 是' : '✗ 否' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 建議 -->
      <div class="section">
        <h4>化解建議</h4>
        <el-alert
          v-for="(rec, index) in taiSuiAnalysis.recommendations"
          :key="index"
          :title="rec"
          :type="index === 0 ? 'warning' : 'info'"
          :closable="false"
          show-icon
          class="recommendation"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface TaiSuiAnalysis {
  zhi: boolean;
  chong: boolean;
  xing: {
    hasXing: boolean;
    xingType?: string;
    description?: string;
  };
  po: boolean;
  hai: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  types: string[];
  recommendations: string[];
}

interface Props {
  taiSuiAnalysis?: TaiSuiAnalysis;
}

defineProps<Props>();

const getSeverityIcon = (severity: string): string => {
  const icons = {
    none: '✅',
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔶',
    critical: '🔴',
  };
  return icons[severity as keyof typeof icons] || '❓';
};

const getSeverityLabel = (severity: string): string => {
  const labels = {
    none: '無犯太歲',
    low: '輕微',
    medium: '中等',
    high: '嚴重',
    critical: '極嚴重',
  };
  return labels[severity as keyof typeof labels] || severity;
};

const getSeverityType = (severity: string): 'success' | 'info' | 'warning' | 'danger' => {
  if (severity === 'none') return 'success';
  if (severity === 'low') return 'info';
  if (severity === 'critical') return 'danger';
  return 'warning';
};

const getTypeTagType = (type: string): 'danger' | 'warning' | 'info' => {
  if (type.includes('值') || type.includes('沖')) return 'danger';
  if (type.includes('刑')) return 'warning';
  return 'info';
};
</script>

<style scoped>
.taisui-card {
  margin-bottom: var(--space-lg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.icon {
  font-size: 24px;
}

.title {
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.section {
  margin-bottom: var(--space-xl);
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 var(--space-md) 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.recommendation {
  margin-bottom: var(--space-sm);
}

.recommendation:last-child {
  margin-bottom: 0;
}

/* Severity-based styling */
.severity-critical {
  border-left: 4px solid var(--error);
}

.severity-high {
  border-left: 4px solid var(--warning);
}

.severity-medium {
  border-left: 4px solid var(--warning-light);
}

.severity-low {
  border-left: 4px solid var(--info);
}

.severity-none {
  border-left: 4px solid var(--success);
}
</style>
```

### Task 2: 整合到 UnifiedResultView (15 min)

**修改**: `bazi-app-vue/src/components/UnifiedResultView.vue`

```vue
<script setup lang="ts">
// ... existing imports
import TaiSuiCard from './TaiSuiCard.vue';
</script>

<template>
  <div class="unified-result">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ... existing tabs -->

      <el-tab-pane v-if="result.annualFortune" label="流年" name="annual">
        <!-- 太歲分析卡片 - 置頂 -->
        <TaiSuiCard
          v-if="result.annualFortune.taiSuiAnalysis"
          :tai-sui-analysis="result.annualFortune.taiSuiAnalysis"
        />

        <!-- 原有流年資訊 -->
        <div class="section">
          <h4>流年資訊</h4>
          <!-- ... existing content -->
        </div>

        <!-- 原有干支交互 -->
        <div class="section">
          <h4>干支交互</h4>
          <AnnualInteraction :interactions="result.annualFortune.interactions" />
        </div>
      </el-tab-pane>

      <!-- ... other tabs -->
    </el-tabs>
  </div>
</template>
```

### Task 3: 類型定義更新 (10 min)

**修改**: `bazi-app-vue/src/services/unifiedApiService.ts`

確保 TypeScript 類型包含 `taiSuiAnalysis` 欄位（已在後端類型中定義）。

### Task 4: 測試與調整 (15 min)

1. 本地測試不同嚴重度的顯示效果
2. 調整顏色與間距
3. 確保響應式設計

---

## 🎯 驗收標準

- [ ] TaiSuiCard 組件創建完成
- [ ] 整合到 UnifiedResultView 流年分頁
- [ ] 5 種嚴重度顯示正確（顏色、圖標）
- [ ] 犯太歲類型標籤顯示
- [ ] 建議列表顯示
- [ ] 無犯太歲時顯示成功狀態
- [ ] 響應式設計適配手機

---

## 📱 響應式設計

```css
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section h4 {
    font-size: var(--font-size-sm);
  }

  :deep(.el-descriptions) {
    font-size: var(--font-size-xs);
  }
}
```

---

## 🔄 未來增強

1. **動畫效果**: 嚴重度變化時的過渡動畫
2. **詳細解釋**: 點擊犯太歲類型顯示詳細說明
3. **歷史對比**: 顯示過去幾年的犯太歲情況
4. **化解方法**: 更詳細的化解建議與儀式說明
5. **吉日推薦**: 根據犯太歲情況推薦安太歲吉日

---

## 📊 預期效果

**無犯太歲**:
- 綠色卡片
- 成功圖標
- 簡潔提示

**輕微犯太歲**:
- 藍色卡片
- 1-2 個類型標籤
- 基本建議

**嚴重犯太歲**:
- 紅色/橙色卡片
- 多個類型標籤
- 詳細建議與化解方法
