import { createI18n } from 'vue-i18n';
// 使用 import 引入 JSON 檔案
import en from './locales/en.json';
import zh from './locales/zh.json';
import zh_TW from './locales/zh_TW.json';
const messages = {
    en,
    zh,
    zh_TW,
};
function getUserPreferredLanguage() {
    // 這裡可以根據用戶設定或瀏覽器語言自動偵測
    const lang = navigator.language || 'en';
    if (lang.startsWith('zh-TW'))
        return 'zh_TW';
    if (lang.startsWith('zh'))
        return 'zh';
    return 'en';
}
const i18n = createI18n({
    locale: getUserPreferredLanguage(),
    fallbackLocale: 'en',
    messages,
    legacy: false,
    globalInjection: true,
});
// 添加缺失的翻譯鍵
const additionalMessages = {
    en: {
        common: {
            language: 'Language'
        }
    },
    zh: {
        common: {
            language: '語言'
        }
    },
    zh_TW: {
        common: {
            language: '語言'
        }
    }
};
// 合併額外的翻譯，但不覆蓋現有的完整配置
Object.keys(additionalMessages).forEach(locale => {
    i18n.global.mergeLocaleMessage(locale, additionalMessages[locale]);
});
export default i18n;
//# sourceMappingURL=index.js.map