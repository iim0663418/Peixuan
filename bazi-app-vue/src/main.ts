import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import 'element-plus/theme-chalk/dark/css-vars.css'; // 導入 Element Plus 官方深色模式 CSS 變數
import './styles/element-plus-dark.css'; // 導入 Element Plus 深色模式樣式
import App from './App.vue';
import router from './router'; // 導入 router
import i18n from './i18n'; // 導入 i18n

// 導入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 導入 Element Plus 繁體中文語言包
import zhTw from 'element-plus/es/locale/lang/zh-tw';

// 導入 Vue Lazyload
import VueLazyload from 'vue-lazyload';

// 導入全局錯誤處理器
import { errorHandlerPlugin } from './plugins/errorHandler';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // 使用 Pinia (必須在 router 之前)
app.use(router); // 使用 router
app.use(i18n); // 使用 i18n
app.use(ElementPlus, {
  locale: zhTw, // 設定 Element Plus 為繁體中文
});
app.use(errorHandlerPlugin); // 使用全局錯誤處理器

// 配置並使用 Vue Lazyload
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/src/assets/error-placeholder.png',
  loading: '/src/assets/loading-placeholder.gif',
  attempt: 1,
  lazyComponent: true,
});

app.mount('#app');
