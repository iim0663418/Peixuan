<template>
  <div v-if="sihuaAggregation" class="sihua-aggregation">
    <!-- Collapsed Summary View (Default) -->
    <div v-if="isCollapsed" class="summary-view" @click="toggleCollapse">
      <div class="summary-content">
        <span class="summary-icon">⚡</span>
        <div class="summary-text">
          <p class="summary-title">四化飛星分析</p>
          <p class="summary-description">
            {{ getSummaryText() }}
          </p>
        </div>
      </div>
      <el-button type="primary" link class="expand-button">
        查看詳情
        <el-icon class="expand-icon"><ArrowDown /></el-icon>
      </el-button>
    </div>

    <!-- Expanded Detail View -->
    <div v-else class="expanded-view">
      <div class="collapse-header" @click="toggleCollapse">
        <span class="header-title">四化飛星分析</span>
        <el-button type="primary" link class="collapse-button">
          收起
          <el-icon class="collapse-icon"><ArrowUp /></el-icon>
        </el-button>
      </div>

      <div class="detail-content">
        <!-- 統計資訊 -->
        <el-card class="section-card">
          <template #header>
            <span>飛化統計</span>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="總飛化邊數">
              {{ sihuaAggregation.totalEdges }}
            </el-descriptions-item>
            <el-descriptions-item label="生年四化">
              {{ sihuaAggregation.edgesByLayer.natal }}
            </el-descriptions-item>
            <el-descriptions-item label="大限四化">
              {{ sihuaAggregation.edgesByLayer.decade }}
            </el-descriptions-item>
            <el-descriptions-item label="流年四化">
              {{ sihuaAggregation.edgesByLayer.annual }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions :column="4" border size="small">
            <el-descriptions-item label="化祿">
              {{ sihuaAggregation.edgesByType['祿'] || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="化權">
              {{ sihuaAggregation.edgesByType['權'] || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="化科">
              {{ sihuaAggregation.edgesByType['科'] || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="化忌">
              {{ sihuaAggregation.edgesByType['忌'] || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 循環分析 -->
        <el-card v-if="hasCycles" class="section-card">
          <template #header>
            <span>能量循環</span>
          </template>

          <!-- 化忌循環（業力迴圈） -->
          <div
            v-if="sihuaAggregation.jiCycles.length > 0"
            class="cycle-section"
          >
            <h5>
              <el-tag type="danger" size="small">化忌循環</el-tag>
              業力迴圈
            </h5>
            <el-alert
              v-for="(cycle, index) in sihuaAggregation.jiCycles"
              :key="`ji-${index}`"
              :title="cycle.description"
              :type="getSeverityType(cycle.severity)"
              :closable="false"
              class="cycle-alert"
            >
              <template #default>
                <div>宮位: {{ formatPalaces(cycle.palaces) }}</div>
                <div>嚴重度: {{ formatSeverity(cycle.severity) }}</div>
              </template>
            </el-alert>
          </div>

          <!-- 化祿循環（資源閉環） -->
          <div
            v-if="sihuaAggregation.luCycles.length > 0"
            class="cycle-section"
          >
            <h5>
              <el-tag type="success" size="small">化祿循環</el-tag>
              資源閉環
            </h5>
            <el-alert
              v-for="(cycle, index) in sihuaAggregation.luCycles.slice(0, 3)"
              :key="`lu-${index}`"
              :title="cycle.description"
              type="success"
              :closable="false"
              class="cycle-alert"
            >
              <template #default>
                <div>宮位: {{ formatPalaces(cycle.palaces) }}</div>
              </template>
            </el-alert>
          </div>
        </el-card>

        <!-- 中心性分析 -->
        <el-card class="section-card">
          <template #header>
            <span>能量中心</span>
          </template>

          <el-row :gutter="16">
            <el-col :span="12">
              <div class="centrality-box">
                <h5>
                  <el-tag type="danger" size="small">壓力匯聚點</el-tag>
                </h5>
                <div v-if="topStressNodes.length > 0">
                  <div
                    v-for="node in topStressNodes"
                    :key="`stress-${node.palace}`"
                    class="node-item"
                  >
                    {{ node.palaceName }} (入度: {{ node.inDegree }})
                  </div>
                </div>
                <div v-else class="no-data">無明顯壓力匯聚</div>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="centrality-box">
                <h5>
                  <el-tag type="success" size="small">資源源頭</el-tag>
                </h5>
                <div v-if="topResourceNodes.length > 0">
                  <div
                    v-for="node in topResourceNodes"
                    :key="`resource-${node.palace}`"
                    class="node-item"
                  >
                    {{ node.palaceName }} (出度: {{ node.outDegree }})
                  </div>
                </div>
                <div v-else class="no-data">無明顯資源源頭</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

interface Props {
  sihuaAggregation: any;
}

const props = defineProps<Props>();

// Default to collapsed state (progressive disclosure)
const isCollapsed = ref(true);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const PALACE_NAMES = [
  '命宮',
  '兄弟宮',
  '夫妻宮',
  '子女宮',
  '財帛宮',
  '疾厄宮',
  '遷移宮',
  '奴僕宮',
  '官祿宮',
  '田宅宮',
  '福德宮',
  '父母宮',
];

const hasCycles = computed(() => {
  return (
    props.sihuaAggregation.jiCycles.length > 0 ||
    props.sihuaAggregation.luCycles.length > 0
  );
});

const topStressNodes = computed(() => {
  return props.sihuaAggregation.stressNodes.slice(0, 3);
});

const topResourceNodes = computed(() => {
  return props.sihuaAggregation.resourceNodes.slice(0, 3);
});

// Generate intelligent summary based on sihua data
function getSummaryText(): string {
  const { jiCycles, luCycles, totalEdges } = props.sihuaAggregation;

  if (jiCycles.length > 0) {
    return `發現 ${jiCycles.length} 個化忌循環（業力迴圈），建議查看能量分析`;
  } else if (luCycles.length > 0) {
    return `發現 ${luCycles.length} 個化祿循環（資源閉環），共 ${totalEdges} 條飛化邊`;
  }
  return `共有 ${totalEdges} 條四化飛星，無明顯循環結構`;
}

function formatPalaces(palaces: number[]): string {
  return palaces.map((p) => PALACE_NAMES[p]).join(' → ');
}

function formatSeverity(severity: string): string {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return map[severity] || severity;
}

function getSeverityType(severity: string): 'success' | 'warning' | 'error' {
  const map: Record<string, 'success' | 'warning' | 'error'> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  };
  return map[severity] || 'warning';
}
</script>

<style scoped>
/* Phase 4 progressive disclosure - 2025-12-22 */

.sihua-aggregation {
  margin-top: 20px;
}

/* ========================================
   SUMMARY VIEW (Collapsed State - Default)
   ======================================== */
.summary-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--card-bg-collapsed);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-view:hover {
  background: var(--bg-secondary);
  border-color: var(--purple-star);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.15);
  transform: translateY(-1px);
}

.summary-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  flex: 1;
}

.summary-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.summary-text {
  flex: 1;
}

.summary-title {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.expand-button {
  flex-shrink: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.summary-view:hover .expand-icon {
  transform: translateY(2px);
}

/* ========================================
   EXPANDED VIEW
   ======================================== */
.expanded-view {
  background: var(--card-bg-expanded);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--card-header-bg);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.collapse-header:hover {
  background: var(--bg-secondary);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.collapse-button {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.collapse-header:hover .collapse-icon {
  transform: translateY(-2px);
}

.detail-content {
  padding: var(--space-md);
}

.section-card {
  margin-bottom: 16px;
}

.cycle-section {
  margin-bottom: 20px;
}

.cycle-section h5 {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cycle-alert {
  margin-bottom: 8px;
}

.centrality-box {
  padding: 12px;
  background: var(--centrality-box-bg);
  border-radius: 4px;
}

.centrality-box h5 {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-item {
  padding: 8px;
  margin-bottom: 4px;
  background: var(--node-item-bg);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
}

.no-data {
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

/* Accessibility: Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .summary-view,
  .expanded-view {
    transition: none !important;
    animation: none !important;
  }

  .summary-view:hover,
  .collapse-header:hover {
    transform: none !important;
  }

  .expand-icon,
  .collapse-icon {
    transition: none !important;
  }
}

/* 深色模式優化 - 統一選擇器，移除 !important，修復節點背景融合問題 */
.sihua-aggregation {
  /* 定義組件層級的動態 CSS 變數 - 預設(淺色) */
  --card-bg-collapsed: var(--bg-secondary);
  --card-bg-expanded: var(--bg-secondary);
  --card-header-bg: var(--bg-tertiary);
  --centrality-box-bg: var(--bg-secondary);
  --node-item-bg: var(--bg-primary);
}

/* 統一深色模式選擇器 */
:global([data-theme='dark']) .sihua-aggregation {
  --card-bg-collapsed: var(--bg-tertiary);
  --card-bg-expanded: var(--bg-secondary);
  --card-header-bg: var(--bg-tertiary);
  --centrality-box-bg: var(--bg-tertiary);
  /* 修復：使用透明度疊加創造層次，避免與父容器背景融合 */
  --node-item-bg: rgba(255, 255, 255, 0.05);
}
</style>
