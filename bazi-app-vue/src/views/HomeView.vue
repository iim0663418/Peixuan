<template>
  <div class="home">
    <h1>首頁</h1>
    <p>歡迎來到佩璇的智慧結晶網！</p>
    <UserInputForm />
  </div>
</template>

<script setup lang="ts">
import UserInputForm from '@/components/UserInputForm.vue'; // 導入組件
// 之後可以在這裡添加邏輯
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}
</style>
