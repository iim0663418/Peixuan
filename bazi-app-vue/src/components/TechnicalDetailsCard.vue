<template>
  <div class="technical-details-card">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="技術細節" name="technical">
        <div class="detail-section">
          <h5>時間計算</h5>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="真太陽時">
              {{ formatDateTime(result.bazi.trueSolarTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="儒略日">
              {{ result.bazi.julianDay }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="result.bazi.calculationSteps" class="detail-section">
          <h5>計算步驟</h5>
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in result.bazi.calculationSteps"
              :key="index"
              :timestamp="step.step"
              placement="top"
            >
              <el-card>
                <p class="step-description">{{ step.description }}</p>
                <el-descriptions :column="1" size="small" class="step-details">
                  <el-descriptions-item label="輸入">
                    <pre>{{ formatJSON(step.input) }}</pre>
                  </el-descriptions-item>
                  <el-descriptions-item label="輸出">
                    <pre>{{ formatJSON(step.output) }}</pre>
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="result.bazi.metadata" class="detail-section">
          <h5>算法參考</h5>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="算法">
              <el-tag
                v-for="algo in result.bazi.metadata.algorithms"
                :key="algo"
                size="small"
                style="margin-right: 4px"
              >
                {{ algo }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="參考文獻">
              <el-tag
                v-for="ref in result.bazi.metadata.references"
                :key="ref"
                type="info"
                size="small"
                style="margin-right: 4px"
              >
                {{ ref }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="計算方法">
              <el-tag
                v-for="method in result.bazi.metadata.methods"
                :key="method"
                type="success"
                size="small"
                style="margin-right: 4px"
              >
                {{ method }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  result: any;
}

const props = defineProps<Props>();
const activeNames = ref<string[]>([]);

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const formatJSON = (obj: any) => {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();
  return JSON.stringify(obj, null, 2);
};
</script>

<style scoped>
.technical-details-card {
  margin-top: 16px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

/* Design tokens applied - 2025-11-30 */
h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.step-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text-primary);
}

.step-details {
  margin-top: 8px;
}

pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: var(--info);
}

:deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: var(--text-tertiary);
}
</style>
