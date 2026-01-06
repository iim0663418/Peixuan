<template>
  <div class="technical-details-card">
    <!-- Collapsed Summary View (Default) -->
    <div v-if="isCollapsed" class="summary-view" @click="toggleCollapse">
      <div class="summary-content">
        <span class="summary-icon">🔬</span>
        <div class="summary-text">
          <p class="summary-title">技術細節</p>
          <p class="summary-description">
            採用真太陽時計算，基於傳統八字算法與儒略日轉換，確保精準度
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
        <span class="header-title">技術細節</span>
        <el-button type="primary" link class="collapse-button">
          收起
          <el-icon class="collapse-icon"><ArrowUp /></el-icon>
        </el-button>
      </div>

      <div class="detail-content">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

interface Props {
  result: any;
}

defineProps<Props>();

// Default to collapsed state (progressive disclosure)
const isCollapsed = ref(true);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

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
/* Phase 4 progressive disclosure - 2025-12-22 */

.technical-details-card {
  margin-top: 16px;
}

/* ========================================
   SUMMARY VIEW (Collapsed State - Default)
   ======================================== */
.summary-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-view:hover {
  background: var(--bg-tertiary);
  border-color: var(--info);
  box-shadow: 0 2px 8px rgba(53, 126, 221, 0.15);
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
  background: var(--bg-secondary);
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
  background: var(--bg-tertiary);
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

/* Component-specific: Collapse header color */
:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: var(--info);
}

/* Component-specific: Timeline styling */
:deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: var(--text-tertiary);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* Accessibility - Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .detail-section {
    transition: none;
  }

  .detail-section:hover {
    transform: none;
  }
}

/* 深色模式優化 */
@media (prefers-color-scheme: dark) {
  .summary-view {
    background: var(--bg-tertiary);
    border-color: var(--border-light);
  }

  .summary-view:hover {
    background: var(--bg-secondary);
    box-shadow: 0 2px 8px rgba(53, 126, 221, 0.25);
  }

  .summary-title {
    color: var(--text-primary) !important;
  }

  .summary-description {
    color: var(--text-secondary) !important;
  }

  .expanded-view {
    background: var(--bg-secondary);
    border-color: var(--border-light);
  }

  .collapse-header {
    background: var(--bg-tertiary);
    border-color: var(--border-light);
  }

  .collapse-header:hover {
    background: var(--bg-secondary);
  }

  .header-title {
    color: var(--text-primary) !important;
  }

  .detail-section {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-light) !important;
  }

  .detail-section h3,
  .detail-section h4,
  .detail-section h5 {
    color: var(--text-primary) !important;
  }

  /* Component-specific dark mode overrides handled by element-plus.css */
}
</style>
