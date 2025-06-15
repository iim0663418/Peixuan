/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();
const currentLocale = ref(locale.value);
// 從 sessionStorage 讀取保存的語言設定
function loadLanguagePreference() {
    try {
        const savedLocale = sessionStorage.getItem('preferred-language') || localStorage.getItem('preferred-language');
        // 移除對簡體中文的支持
        if (savedLocale && ['en', 'zh_TW'].includes(savedLocale)) {
            return savedLocale;
        }
        // 如果保存的是簡體中文，預設切換到繁體中文
        if (savedLocale === 'zh') {
            return 'zh_TW';
        }
    }
    catch (error) {
        console.warn('Failed to load language preference from sessionStorage:', error);
    }
    // 如果沒有保存的設定，預設使用繁體中文
    return 'zh_TW';
}
// 將語言設定保存到 sessionStorage
function saveLanguagePreference(language) {
    try {
        sessionStorage.setItem('preferred-language', language);
    }
    catch (error) {
        console.warn('Failed to save language preference to sessionStorage:', error);
    }
}
// 切換語言並保存偏好設定
function changeLanguage() {
    try {
        locale.value = currentLocale.value;
        saveLanguagePreference(currentLocale.value);
    }
    catch (error) {
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "language-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "language-select",
    ...{ class: "sr-only" },
});
(__VLS_ctx.$t('common.language'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.changeLanguage) },
    id: "language-select",
    value: (__VLS_ctx.currentLocale),
    ...{ class: "language-select" },
    'aria-label': (__VLS_ctx.$t('common.language')),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "zh_TW",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "en",
});
/** @type {__VLS_StyleScopedClasses['language-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
/** @type {__VLS_StyleScopedClasses['language-select']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            currentLocale: currentLocale,
            changeLanguage: changeLanguage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=LanguageSelector.vue.js.map