<template>
  <div class="profile-view">
    <h1>個人資料</h1>
    <div v-if="user">
      <p><strong>名稱：</strong> {{ user.name }}</p>
      <p><strong>電子郵件：</strong> {{ user.email }}</p>
      {/* TODO: 顯示更多使用者資訊和設定 */}
      <button @click="handleLogout">登出</button>
    </div>
    <div v-else>
      <p>正在載入使用者資訊...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 假設的使用者資訊結構
interface User {
  id: string;
  name: string;
  email: string;
}

const user = ref<User | null>(null);
const router = useRouter();

onMounted(async () => {
  // TODO: 實際的獲取使用者資訊邏輯 (從 store 或 API)
  // 模擬獲取使用者
  // user.value = await store.getters.currentUser;
  // if (!user.value) {
  //   router.push('/login'); // 如果未登入，跳轉到登入頁
  // }
  
  // 暫時的模擬使用者
  user.value = { id: '123', name: '測試使用者', email: 'test@example.com' };
});

const handleLogout = async () => {
  // TODO: 實際的登出邏輯
  // await store.dispatch('logout');
  // router.push('/login');
  console.log('Logout action');
  alert('登出功能尚未實作');
};
</script>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
button {
  margin-top: 20px;
  padding: 10px 15px;
}
</style>
