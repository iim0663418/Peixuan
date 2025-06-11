<template>
  <div class="register-view">
    <h1>註冊</h1>
    <p>本應用程式使用 OAuth 供應商帳號進行登入和註冊。</p>
    <p>請返回<router-link to="/login">登入頁面</router-link>並選擇一個 OAuth子供應商進行登入或註冊。</p>
  </div>
</template>

<script setup lang="ts">
// 由於註冊流程已整合到 OAuth 中，此頁面可能僅作為提示
// 或者在未來用於補充 OAuth 未提供的用戶資訊（如果需要）
</script>

<style scoped>
.register-view {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}
form div {
  margin-bottom: 10px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
}
</style>
