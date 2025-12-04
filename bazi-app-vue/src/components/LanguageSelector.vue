<template>
  <div class="language-selector">
    <label for="language-select" class="sr-only">{{
      $t('common.language')
    }}</label>
    <select
      id="language-select"
      v-model="currentLocale"
      class="language-select"
      :aria-label="$t('common.language')"
      @change="changeLanguage"
    >
      <option value="zh_TW">繁體中文</option>
      <option value="en">English</option>
      <!-- 暫時隱藏簡體中文選項 -->
      <!-- <option value="zh">简体中文</option> -->
    </select>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLocale = ref(locale.value);

// 從 sessionStorage 讀取保存的語言設定
function loadLanguagePreference(): string {
  try {
    const savedLocale =
      sessionStorage.getItem('preferred-language') ||
      localStorage.getItem('preferred-language');
    // 移除對簡體中文的支持
    if (savedLocale && ['en', 'zh_TW'].includes(savedLocale)) {
      return savedLocale;
    }
    // 如果保存的是簡體中文，預設切換到繁體中文
    if (savedLocale === 'zh') {
      return 'zh_TW';
    }
  } catch (error) {
    console.warn(
      'Failed to load language preference from sessionStorage:',
      error,
    );
  }

  // 如果沒有保存的設定，預設使用繁體中文
  return 'zh_TW';
}

// 將語言設定保存到 sessionStorage
function saveLanguagePreference(language: string): void {
  try {
    sessionStorage.setItem('preferred-language', language);
  } catch (error) {
    console.warn(
      'Failed to save language preference to sessionStorage:',
      error,
    );
  }
}

// 切換語言並保存偏好設定
function changeLanguage(): void {
  try {
    locale.value = currentLocale.value;
    saveLanguagePreference(currentLocale.value);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
}

// 組件掛載時載入保存的語言設定
onMounted(() => {
  const preferredLanguage = loadLanguagePreference();
  if (preferredLanguage !== currentLocale.value) {
    currentLocale.value = preferredLanguage;
    locale.value = preferredLanguage;
  }
});

// 監聽 locale 變化，同步更新 currentLocale
watch(locale, (newLocale) => {
  if (newLocale !== currentLocale.value) {
    currentLocale.value = newLocale;
  }
});
</script>

<style scoped>
.language-selector {
  display: inline-block;
}

/* Design tokens applied - 2025-11-30 */
.language-select {
  padding: 8px 12px;
  font-size: 0.9rem;
  border: 1px solid var(--border-medium);
  border-radius: 6px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  min-width: 120px;
}

.language-select:hover {
  border-color: var(--border-dark);
}

.language-select:focus {
  outline: none;
  border-color: var(--info);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Disable hover effects on touch devices */
@media (hover: none) {
  .language-select:hover {
    border-color: var(--border-medium);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 深色模式已由 design-tokens.css 處理 */
</style>
