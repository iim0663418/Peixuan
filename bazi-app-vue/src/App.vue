<script setup lang="ts">
import { onMounted, defineAsyncComponent } from 'vue';
import { useChartStore } from '@/stores/chartStore';
import { useTheme } from '@/composables/useTheme';

// 動態導入組件以提升效能
const AppHeader = defineAsyncComponent(
  () => import('@/components/AppHeader.vue'),
);
const AppFooter = defineAsyncComponent(
  () => import('@/components/AppFooter.vue'),
);

const chartStore = useChartStore();
useTheme(); // 初始化主題系統 Initialize Theme System

onMounted(() => {
  // 嘗試從 localStorage 載入歷史記錄
  chartStore.loadFromLocalStorage();
});
</script>

<template>
  <div id="app-container">
    <AppHeader />

    <main>
      <router-view />
      <!-- 已簡化：使用各模組獨立的分層控制器 -->
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
#app-container {
  font-family:
    'Microsoft JhengHei', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei',
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

main {
  padding: 0;
  max-width: 100%;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>
