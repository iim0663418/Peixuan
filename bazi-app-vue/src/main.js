import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // 導入 router
import i18n from './i18n'; // 導入 i18n
// 導入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 導入 Element Plus 繁體中文語言包
import zhTw from 'element-plus/es/locale/lang/zh-tw';
// 導入增強版存儲服務
import enhancedStorageService from './utils/enhancedStorageService';
// 導入全局錯誤處理器
import { errorHandlerPlugin } from './plugins/errorHandler';
const app = createApp(App);
app.use(router); // 使用 router
app.use(i18n); // 使用 i18n
app.use(ElementPlus, {
    locale: zhTw, // 設定 Element Plus 為繁體中文
});
app.use(errorHandlerPlugin); // 使用全局錯誤處理器
// 註冊增強版存儲服務為全域屬性
app.config.globalProperties.$enhancedStorageService = enhancedStorageService;
// 初始化增強版存儲服務
try {
    const storageInitialized = enhancedStorageService.initializeStorage();
    if (!storageInitialized) {
        console.error('存儲服務初始化失敗，將使用默認配置');
        // 在這裡可以添加備用初始化邏輯或用戶通知
    }
}
catch (error) {
    console.error('應用啟動時存儲服務初始化出錯:', error);
    // 可以在這裡顯示一個用戶友好的錯誤消息
}
app.mount('#app');
//# sourceMappingURL=main.js.map