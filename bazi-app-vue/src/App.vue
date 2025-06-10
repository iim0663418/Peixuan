<script setup lang="ts">
// 可以保留這個 script 區塊用於未來的邏輯
</script>

<template>
  <div id="app-container">
    <!-- 之後可以在這裡添加導航欄等共享佈局 -->
    <header>
      <!-- 例如： <nav>...</nav> -->
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <!-- 例如： <p>&copy; 2025 八字排盤</p> -->
    </footer>
  </div>
</template>

<style scoped>
/* 可以為 #app-container 或其他元素添加全局樣式 */
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */ /* 根據需要調整 */
  color: #2c3e50;
  /* margin-top: 60px; */ /* 根據需要調整 */
}

main {
  padding: 1rem;
}
</style>
