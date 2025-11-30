<template>
  <div class="developer-card">
    <el-alert
      title="開發者模式"
      type="info"
      description="此標籤顯示 API 原始數據，供開發和調試使用"
      :closable="false"
      show-icon
    />

    <el-collapse v-model="activeNames" style="margin-top: 16px">
      <el-collapse-item title="輸入參數" name="input">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="出生日期">
            {{ result.input.solarDate }}
          </el-descriptions-item>
          <el-descriptions-item label="經度">
            {{ result.input.longitude }}°
          </el-descriptions-item>
          <el-descriptions-item label="性別">
            {{ result.input.gender === 'male' ? '男' : '女' }}
          </el-descriptions-item>
          <el-descriptions-item label="閏月">
            {{ result.input.isLeapMonth ? '是' : '否' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>

      <el-collapse-item title="紫微計算步驟" name="ziweiSteps">
        <el-timeline v-if="result.ziwei.calculationSteps">
          <el-timeline-item
            v-for="(step, index) in result.ziwei.calculationSteps"
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
      </el-collapse-item>

      <el-collapse-item title="紫微元數據" name="ziweiMetadata">
        <el-descriptions
          v-if="result.ziwei.metadata"
          :column="1"
          border
          size="small"
        >
          <el-descriptions-item label="算法">
            <el-tag
              v-for="algo in result.ziwei.metadata.algorithms"
              :key="algo"
              size="small"
              style="margin-right: 4px"
            >
              {{ algo }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="參考文獻">
            <el-tag
              v-for="ref in result.ziwei.metadata.references"
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
              v-for="method in result.ziwei.metadata.methods"
              :key="method"
              type="success"
              size="small"
              style="margin-right: 4px"
            >
              {{ method }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>

      <el-collapse-item title="系統資訊" name="system">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="計算時間">
            {{ formatDateTime(result.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="時間戳">
            {{ result.timestamp }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>

      <el-collapse-item title="完整 JSON" name="json">
        <el-button
          size="small"
          type="primary"
          @click="copyJSON"
          style="margin-bottom: 8px"
        >
          複製 JSON
        </el-button>
        <pre class="json-display">{{ formatJSON(result) }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

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

const copyJSON = async () => {
  try {
    await navigator.clipboard.writeText(formatJSON(props.result));
    ElMessage.success('JSON 已複製到剪貼簿');
  } catch (err) {
    ElMessage.error('複製失敗');
  }
};
</script>

<style scoped>
.developer-card {
  padding: 16px;
}

/* Design tokens applied - 2025-11-30 */
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

.json-display {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: var(--text-tertiary);
}

:deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: var(--text-tertiary);
}
</style>
