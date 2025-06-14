/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
const props = defineProps();
const getBrightnessDescription = (brightness) => {
    const descriptions = {
        '廟': '星曜最強勢，能量發揮到極致',
        '旺': '星曜強勢，表現優異',
        '得地': '星曜穩定，表現良好',
        '利益': '星曜平穩，有一定助益',
        '平和': '星曜中性，影響適中',
        '不得地': '星曜較弱，影響有限',
        '落陷': '星曜最弱，需要調和'
    };
    return descriptions[brightness || ''] || '亮度未知';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brightness-badge']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "star-brightness-indicator" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (['brightness-badge', `brightness-${__VLS_ctx.brightness}`]) },
    title: (__VLS_ctx.getBrightnessDescription(__VLS_ctx.brightness)),
});
(__VLS_ctx.brightness);
/** @type {__VLS_StyleScopedClasses['star-brightness-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['brightness-badge']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getBrightnessDescription: getBrightnessDescription,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=StarBrightnessIndicator.vue.js.map