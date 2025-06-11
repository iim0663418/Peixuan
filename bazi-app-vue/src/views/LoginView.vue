<template>
  <div class="login-view">
    <h1>使用 OAuth 登入</h1>
    <div class="oauth-buttons">
      <button @click="handleOAuthLogin('google')" class="oauth-button google">使用 Google 登入</button>
      <button @click="handleOAuthLogin('instagram')" class="oauth-button instagram">使用 Instagram 登入</button>
      <button @click="handleOAuthLogin('x')" class="oauth-button x">使用 X (Twitter) 登入</button>
      {/* 可以添加更多 OAuth子供應商按鈕, 例如 Facebook */}
      {/* <button @click="handleOAuthLogin('facebook')" class="oauth-button facebook">使用 Facebook 登入</button> */}
    </div>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    {/* 由於只使用 OAuth，註冊連結可能不再直接需要，或者註冊流程會整合到 OAuth 中 */}
    {/* <p>還沒有帳號？ <router-link to="/register">立即註冊</router-link></p> */}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const errorMessage = ref('');
const router = useRouter();

const handleOAuthLogin = async (provider: string) => {
  errorMessage.value = '';
  // TODO: 實際的 OAuth 登入邏輯
  // 通常會重定向到 OAuth子供應商的認證頁面
  // 後端需要處理 OAuth 回調並生成 JWT
  console.log(`OAuth login attempt with ${provider}`);
  
  // 暫時的模擬
  errorMessage.value = `使用 ${provider} 登入功能尚未實作。`;
  // 假設登入成功後跳轉
  // router.push('/profile'); 
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
}
.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 按鈕之間的間距 */
  margin-top: 20px;
  margin-bottom: 20px;
}
.oauth-button {
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.oauth-button.google {
  background-color: #DB4437;
  color: white;
}
.oauth-button.google:hover {
  background-color: #C33D2E;
}
.oauth-button.instagram {
  background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80);
  color: white;
}
.oauth-button.instagram:hover {
  opacity: 0.9;
}
.oauth-button.x {
  background-color: #000000; /* X (Twitter) 黑色 */
  color: white;
}
.oauth-button.x:hover {
  background-color: #222222;
}
.error-message {
  color: red;
  margin-top: 15px;
}
</style>
