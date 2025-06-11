import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 導入 router
import i18n from './i18n' // 導入 i18n

// 導入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router) // 使用 router
app.use(i18n) // 使用 i18n
app.use(ElementPlus) // 使用 Element Plus

app.mount('#app')
