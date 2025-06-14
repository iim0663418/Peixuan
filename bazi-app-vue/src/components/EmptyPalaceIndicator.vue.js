/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';
const props = withDefaults(defineProps(), {
    showTooltip: false
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    showTooltip: false
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-info']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "empty-palace-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "empty-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "empty-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "empty-text" },
});
if (__VLS_ctx.borrowedPalace) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "borrowed-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "borrowed-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "borrowed-palace" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "palace-name" },
    });
    (__VLS_ctx.borrowedPalace.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "borrowed-stars" },
    });
    for (const [star] of __VLS_getVForSourceType((__VLS_ctx.borrowedPalace.mainStars))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (star.name),
            ...{ class: "borrowed-star" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "star-name" },
        });
        (star.name);
        if (star.brightness) {
            /** @type {[typeof StarBrightnessIndicator, ]} */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(StarBrightnessIndicator, new StarBrightnessIndicator({
                brightness: (star.brightness),
            }));
            const __VLS_1 = __VLS_0({
                brightness: (star.brightness),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "power-reduction" },
        });
    }
}
if (__VLS_ctx.showTooltip) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    if (__VLS_ctx.borrowedPalace) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.borrowedPalace.name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "interpretation-note" },
    });
}
/** @type {__VLS_StyleScopedClasses['empty-palace-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-info']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-label']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['power-reduction']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StarBrightnessIndicator: StarBrightnessIndicator,
        };
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
//# sourceMappingURL=EmptyPalaceIndicator.vue.js.map