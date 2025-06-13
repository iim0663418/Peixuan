/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const errorMessage = ref('');
const router = useRouter();
const handleOAuthLogin = async (provider) => {
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['google']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['instagram']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['x']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "oauth-buttons" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.handleOAuthLogin('google');
        } },
    ...{ class: "oauth-button google" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.handleOAuthLogin('instagram');
        } },
    ...{ class: "oauth-button instagram" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.handleOAuthLogin('x');
        } },
    ...{ class: "oauth-button x" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.handleOAuthLogin('facebook');
        } },
    ...{ class: "oauth-button facebook" },
});
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errorMessage);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/register",
}));
const __VLS_2 = __VLS_1({
    to: "/register",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['login-view']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['google']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['instagram']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['x']} */ ;
/** @type {__VLS_StyleScopedClasses['oauth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['facebook']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            errorMessage: errorMessage,
            handleOAuthLogin: handleOAuthLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=LoginView.vue.js.map