<template>
  <div v-if="sihuaAggregation" class="sihua-aggregation">
    <h4>四化飛星分析</h4>

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
      <div v-if="sihuaAggregation.jiCycles.length > 0" class="cycle-section">
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
      <div v-if="sihuaAggregation.luCycles.length > 0" class="cycle-section">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  sihuaAggregation: any;
}

const props = defineProps<Props>();

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
.sihua-aggregation {
  margin-top: 20px;
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
  background: var(--bg-secondary);
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
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 14px;
}

.no-data {
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
  padding: 12px;
}
</style>
