<template>
  <el-card
    v-if="taiSuiAnalysis"
    class="taisui-card"
    :class="`severity-${taiSuiAnalysis.severity}`"
  >
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
      <el-result
        icon="success"
        title="本年度無犯太歲"
        sub-title="運勢平穩，諸事順遂"
      />
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
            {{
              taiSuiAnalysis.xing.hasXing
                ? `✓ ${taiSuiAnalysis.xing.description}`
                : '✗ 否'
            }}
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

const getSeverityType = (
  severity: string,
): 'success' | 'info' | 'warning' | 'danger' => {
  if (severity === 'none') {
    return 'success';
  }
  if (severity === 'low') {
    return 'info';
  }
  if (severity === 'critical') {
    return 'danger';
  }
  return 'warning';
};

const getTypeTagType = (type: string): 'danger' | 'warning' | 'info' => {
  if (type.includes('值') || type.includes('沖')) {
    return 'danger';
  }
  if (type.includes('刑')) {
    return 'warning';
  }
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

/* Responsive */
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
</style>
