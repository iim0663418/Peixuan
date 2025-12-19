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
                v-for="reference in result.bazi.metadata.references"
                :key="reference"
                type="info"
                size="small"
                style="margin-right: 4px"
              >
                {{ reference }}
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

defineProps<Props>();
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
  if (typeof obj === 'string') {
    return obj;
  }
  if (typeof obj === 'number') {
    return obj.toString();
  }
  return JSON.stringify(obj, null, 2);
};
</script>

<style scoped>
/* Design tokens applied - 2025-11-30 */
/* Phase 3 visual enhancements - 2025-12-19 */

.technical-details-card {
  margin-top: 16px;
}

.detail-section {
  margin-bottom: 24px;
  /* Phase 3: Smooth transitions */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

.detail-section:hover {
  transform: translateY(-1px) translateZ(0);
}

.detail-section:last-child {
  margin-bottom: 0;
}

h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  /* Phase 3: Enhanced text shadow for better readability */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Phase 3: Gradient border */
  position: relative;
  padding-bottom: 8px;
}

h5::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--info) 0%, transparent 100%);
  border-radius: var(--radius-xs);
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
  /* Phase 3: Smooth transitions */
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

:deep(.el-collapse-item__header):hover {
  background-color: rgba(53, 126, 221, 0.05);
}

/* Phase 3: Glow effect on focus */
:deep(.el-collapse-item__header):focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(53, 126, 221, 0.3),
    0 0 12px rgba(53, 126, 221, 0.4);
  border-radius: var(--radius-sm);
}

:deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: var(--text-tertiary);
  /* Phase 3: Enhanced text shadow */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* Phase 3: Card transitions */
:deep(.el-card) {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

:deep(.el-card):hover {
  transform: translateY(-2px) translateZ(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Phase 3: Accessibility - Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .detail-section,
  :deep(.el-card),
  :deep(.el-collapse-item__header) {
    transition: none;
  }

  .detail-section:hover,
  :deep(.el-card):hover {
    transform: none;
  }

  :deep(.el-collapse-item__header):hover {
    background-color: transparent;
  }
}
</style>
