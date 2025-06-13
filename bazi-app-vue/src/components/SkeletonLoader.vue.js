/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
const __VLS_props = withDefaults(defineProps(), {
    variant: 'generic',
    formItems: 4,
    listItems: 3,
    textLines: 3
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    variant: 'generic',
    formItems: 4,
    listItems: 3,
    textLines: 3
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['skeleton-line']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-text-line']} */ ;
/** @type {__VLS_StyleScopedClasses['short']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-char']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-form']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-card']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-loader']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skeleton-loader" },
    ...{ class: (__VLS_ctx.variant) },
});
if (__VLS_ctx.variant === 'card') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-line" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-line short" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-button" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-button secondary" },
    });
}
else if (__VLS_ctx.variant === 'chart') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-chart" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-chart-grid" },
    });
    for (const [i] of __VLS_getVForSourceType((12))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: "skeleton-chart-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-char" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-char" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-chart-legend" },
    });
    for (const [i] of __VLS_getVForSourceType((4))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-legend-item" },
            key: (i),
        });
    }
}
else if (__VLS_ctx.variant === 'form') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-form" },
    });
    for (const [i] of __VLS_getVForSourceType((__VLS_ctx.formItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-form-item" },
            key: (i),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-input" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-submit-button" },
    });
}
else if (__VLS_ctx.variant === 'list') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-list" },
    });
    for (const [i] of __VLS_getVForSourceType((__VLS_ctx.listItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: "skeleton-list-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-avatar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-list-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-list-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-list-description" },
        });
    }
}
else if (__VLS_ctx.variant === 'text') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-text" },
    });
    for (const [i] of __VLS_getVForSourceType((__VLS_ctx.textLines))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: "skeleton-text-line" },
            ...{ class: ({ 'short': i === __VLS_ctx.textLines }) },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-generic" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skeleton-content" },
    });
    for (const [i] of __VLS_getVForSourceType((3))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skeleton-line" },
            key: (i),
        });
    }
}
/** @type {__VLS_StyleScopedClasses['skeleton-loader']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-card']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-title']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-content']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-line']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-line']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-line']} */ ;
/** @type {__VLS_StyleScopedClasses['short']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-button']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-title']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-char']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-char']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-chart-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-form']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-form-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-label']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-input']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-title']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list-description']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-text']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-text-line']} */ ;
/** @type {__VLS_StyleScopedClasses['short']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-generic']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-content']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-line']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SkeletonLoader.vue.js.map