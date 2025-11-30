<template>
  <div class="annual-interaction">
    <div v-if="interactions.stemCombinations.length > 0" class="interaction-section">
      <h5>天干五合</h5>
      <div class="interaction-list">
        <el-tag
          v-for="(combo, index) in interactions.stemCombinations"
          :key="`stem-${index}`"
          type="success"
          effect="plain"
          size="large"
        >
          {{ combo.stem1 }} + {{ combo.stem2 }} → {{ combo.result }}
        </el-tag>
      </div>
    </div>

    <div v-if="interactions.branchClashes.length > 0" class="interaction-section">
      <h5>地支六沖</h5>
      <div class="interaction-list">
        <el-tag
          v-for="(clash, index) in interactions.branchClashes"
          :key="`clash-${index}`"
          type="danger"
          effect="plain"
          size="large"
        >
          {{ clash.branch1 }} 沖 {{ clash.branch2 }}
        </el-tag>
      </div>
    </div>

    <div v-if="interactions.harmoniousCombinations.length > 0" class="interaction-section">
      <h5>三合 / 三會</h5>
      <div class="interaction-list">
        <el-tag
          v-for="(harmony, index) in interactions.harmoniousCombinations"
          :key="`harmony-${index}`"
          type="primary"
          effect="plain"
          size="large"
        >
          {{ harmony.branches.join(' + ') }} → {{ harmony.result }} ({{ harmony.type }})
        </el-tag>
      </div>
    </div>

    <div v-if="hasNoInteractions" class="no-interaction">
      <el-empty description="本年無明顯干支交互" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface StemCombination {
  stem1: string;
  stem2: string;
  result: string;
}

interface BranchClash {
  branch1: string;
  branch2: string;
}

interface HarmoniousCombination {
  branches: string[];
  result: string;
  type: string;
}

interface Interactions {
  stemCombinations: StemCombination[];
  branchClashes: BranchClash[];
  harmoniousCombinations: HarmoniousCombination[];
}

interface Props {
  interactions: Interactions;
}

const props = defineProps<Props>();

const hasNoInteractions = computed(() => {
  return (
    props.interactions.stemCombinations.length === 0 &&
    props.interactions.branchClashes.length === 0 &&
    props.interactions.harmoniousCombinations.length === 0
  );
});
</script>

<style scoped>
.annual-interaction {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.interaction-section {
  margin-bottom: 20px;
}

.interaction-section:last-child {
  margin-bottom: 0;
}

.interaction-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.interaction-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.no-interaction {
  padding: 20px;
  text-align: center;
}
</style>
