/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
const props = withDefaults(defineProps(), {
    modelValue: 'standard',
    availableDepths: () => ['minimal', 'compact', 'standard', 'comprehensive'],
    showAnimation: false,
    isAnimationActive: false,
    moduleType: 'purpleStar'
});
const emit = defineEmits();
// 設置顯示深度
const setDisplayDepth = (depth) => {
    emit('update:modelValue', depth);
    try {
        // 保存設置到 sessionStorage，為每個模塊單獨存儲設置
        sessionStorage.setItem(`${props.moduleType}-display-depth`, depth);
        // 觸發自定義事件，通知全域控制面板顯示深度已更改
        window.dispatchEvent(new CustomEvent('module-changed', {
            detail: { module: props.moduleType, depth }
        }));
        // 額外發送 display-depth-changed 事件以確保雙向同步
        window.dispatchEvent(new CustomEvent('display-depth-changed', {
            detail: { module: props.moduleType, depth }
        }));
    }
    catch (error) {
        console.warn('無法保存顯示深度設定:', error);
    }
};
// 預設標籤文字
const getDefaultLabel = (depth) => {
    const labels = {
        'minimal': '簡要預覽',
        'compact': '精簡檢視',
        'standard': '標準解讀',
        'comprehensive': '深度分析'
    };
    return labels[depth] || depth;
};
// 預設描述文字
const getDefaultDescription = (depth) => {
    const descriptions = {
        'minimal': '最簡潔的命盤展示，僅呈現基本框架',
        'compact': '顯示主要星曜和基本效應，快速了解命盤特點',
        'standard': '完整展示星曜資訊和效應，深入解析命盤結構',
        'comprehensive': '全面詳盡的命盤分析'
    };
    return descriptions[depth] || '';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    modelValue: 'standard',
    availableDepths: () => ['minimal', 'compact', 'standard', 'comprehensive'],
    showAnimation: false,
    isAnimationActive: false,
    moduleType: 'purpleStar'
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-button']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-toggle-group']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "display-depth-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "display-options-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mode-help-text" },
});
(__VLS_ctx.$t('display.modeHelp') || '選擇顯示模式');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "display-mode-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mode-toggle-group" },
});
for (const [depth] of __VLS_getVForSourceType((__VLS_ctx.availableDepths))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setDisplayDepth(depth);
            } },
        key: (depth),
        ...{ class: "depth-tab-button" },
        ...{ class: ({ active: __VLS_ctx.modelValue === depth }) },
        title: (__VLS_ctx.$t(`display.displayDepthDesc.${depth}`) || __VLS_ctx.getDefaultDescription(depth)),
    });
    (__VLS_ctx.$t(`display.displayDepth.${depth}`) || __VLS_ctx.getDefaultLabel(depth));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "depth-description" },
});
(__VLS_ctx.$t(`display.displayDepthDesc.${__VLS_ctx.modelValue}`) || __VLS_ctx.getDefaultDescription(__VLS_ctx.modelValue));
if (__VLS_ctx.showAnimation) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "animation-control" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAnimation))
                    return;
                __VLS_ctx.$emit('toggle-animation');
            } },
        ...{ class: "toggle-button" },
    });
    (__VLS_ctx.isAnimationActive ? '停止動畫' : '啟動動畫');
}
/** @type {__VLS_StyleScopedClasses['display-depth-container']} */ ;
/** @type {__VLS_StyleScopedClasses['display-options-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-help-text']} */ ;
/** @type {__VLS_StyleScopedClasses['display-mode-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-toggle-group']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-description']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-control']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-button']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            setDisplayDepth: setDisplayDepth,
            getDefaultLabel: getDefaultLabel,
            getDefaultDescription: getDefaultDescription,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=DisplayDepthContainer.vue.js.map