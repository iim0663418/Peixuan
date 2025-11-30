<template>
  <div class="unified-view">
    <el-card class="form-card">
      <template #header>
        <h2>統一命盤計算</h2>
      </template>

      <UnifiedInputForm @submit="handleSubmit" />
    </el-card>

    <el-card v-if="loading" class="result-card">
      <el-skeleton :rows="5" animated />
    </el-card>

    <el-card v-else-if="error" class="result-card error">
      <el-alert
type="error"
:title="error" show-icon :closable="false"
/>
    </el-card>

    <el-card v-else-if="result" class="result-card">
      <template #header>
        <h3>計算結果</h3>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="八字" name="bazi">
          <div class="result-section">
            <h4>四柱</h4>
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="pillar">
                  <div class="pillar-label">年柱</div>
                  <div class="pillar-value">
                    {{ result.bazi.fourPillars.year.gan
                    }}{{ result.bazi.fourPillars.year.zhi }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="pillar">
                  <div class="pillar-label">月柱</div>
                  <div class="pillar-value">
                    {{ result.bazi.fourPillars.month.gan
                    }}{{ result.bazi.fourPillars.month.zhi }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="pillar">
                  <div class="pillar-label">日柱</div>
                  <div class="pillar-value">
                    {{ result.bazi.fourPillars.day.gan
                    }}{{ result.bazi.fourPillars.day.zhi }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="pillar">
                  <div class="pillar-label">時柱</div>
                  <div class="pillar-value">
                    {{ result.bazi.fourPillars.hour.gan
                    }}{{ result.bazi.fourPillars.hour.zhi }}
                  </div>
                </div>
              </el-col>
            </el-row>

            <h4 style="margin-top: 20px">十神</h4>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="年干">{{
                result.bazi.tenGods.year
              }}</el-descriptions-item>
              <el-descriptions-item label="月干">{{
                result.bazi.tenGods.month
              }}</el-descriptions-item>
              <el-descriptions-item label="時干">{{
                result.bazi.tenGods.hour
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <el-tab-pane label="紫微斗數" name="ziwei">
          <div class="result-section">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="命宮">{{ result.ziwei.lifePalace.name }} ({{
                  result.ziwei.lifePalace.index
                }})</el-descriptions-item>
              <el-descriptions-item label="身宮">{{ result.ziwei.bodyPalace.name }} ({{
                  result.ziwei.bodyPalace.index
                }})</el-descriptions-item>
              <el-descriptions-item label="五行局">{{ result.ziwei.bureau }}局</el-descriptions-item>
              <el-descriptions-item label="紫微位置">{{ result.ziwei.ziWeiPosition }}宮</el-descriptions-item>
              <el-descriptions-item label="天府位置">{{ result.ziwei.tianFuPosition }}宮</el-descriptions-item>
            </el-descriptions>

            <h4 style="margin-top: 20px">輔星位置</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文昌">{{
                  result.ziwei.auxiliaryStars.wenChang
                }}宮</el-descriptions-item>
              <el-descriptions-item label="文曲">{{ result.ziwei.auxiliaryStars.wenQu }}宮</el-descriptions-item>
              <el-descriptions-item label="左輔">{{ result.ziwei.auxiliaryStars.zuoFu }}宮</el-descriptions-item>
              <el-descriptions-item label="右弼">{{ result.ziwei.auxiliaryStars.youBi }}宮</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <el-tab-pane label="輸入資訊" name="input">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="陽曆日期">{{
              result.input.solarDate
            }}</el-descriptions-item>
            <el-descriptions-item label="性別">{{
              result.input.gender === 'male' ? '男' : '女'
            }}</el-descriptions-item>
            <el-descriptions-item label="經度">{{
              result.input.longitude
            }}</el-descriptions-item>
            <el-descriptions-item label="閏月">{{
              result.input.isLeapMonth ? '是' : '否'
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import UnifiedInputForm from '../components/UnifiedInputForm.vue';
import unifiedApiService, {
  type CalculationResult,
} from '../services/unifiedApiService';

const loading = ref(false);
const error = ref('');
const result = ref<CalculationResult | null>(null);
const activeTab = ref('bazi');

const handleSubmit = async (birthInfo: any) => {
  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    result.value = await unifiedApiService.calculate(birthInfo);
    ElMessage.success('計算完成');
  } catch (err: any) {
    error.value = err.message || '計算失敗，請稍後再試';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.unified-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-card,
.result-card {
  margin-bottom: 20px;
}

.result-card.error {
  background-color: #fef0f0;
}

.result-section {
  padding: 20px 0;
}

.pillar {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.pillar-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.pillar-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

h4 {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .unified-view {
    padding: 10px;
  }

  .pillar-value {
    font-size: 20px;
  }
}
</style>
