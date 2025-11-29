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

function getUserPreferredLanguage(): string {
  // 檢查是否有儲存的語言偏好
  const savedLang =
    localStorage.getItem('preferred-language') ||
    sessionStorage.getItem('preferred-language');
  if (savedLang && ['zh_TW', 'zh', 'en'].includes(savedLang)) {
    return savedLang;
  }

  // 瀏覽器語言偵測，預設為繁體中文
  const lang = navigator.language || 'zh_TW';
  if (lang.startsWith('zh-TW') || lang.startsWith('zh-Hant')) {
    return 'zh_TW';
  }
  if (lang.startsWith('zh-CN') || lang.startsWith('zh-Hans')) {
    return 'zh';
  }
  if (lang.startsWith('en')) {
    return 'en';
  }

  // 預設使用繁體中文
  return 'zh_TW';
}

const i18n = createI18n({
  locale: getUserPreferredLanguage(),
  fallbackLocale: 'zh_TW', // 改為繁體中文作為備用語言
  messages,
  legacy: false,
  globalInjection: true,
});

// 添加缺失的翻譯鍵
const additionalMessages: Record<string, any> = {
  en: {
    common: {
      language: 'Language',
    },
  },
  zh: {
    common: {
      language: '語言',
    },
  },
  zh_TW: {
    common: {
      language: '語言',
    },
  },
};

// 合併額外的翻譯，但不覆蓋現有的完整配置
Object.keys(additionalMessages).forEach((locale) => {
  i18n.global.mergeLocaleMessage(locale, additionalMessages[locale]);
});

export default i18n;
