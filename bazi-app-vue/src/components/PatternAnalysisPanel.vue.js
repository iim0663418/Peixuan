/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref } from 'vue';
const props = defineProps();
const isExpanded = ref(true);
const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
};
// 解析格局名稱
const getPatternName = (pattern) => {
    return pattern.split('：')[0] || pattern;
};
// 解析格局描述
const getPatternDescription = (pattern) => {
    const parts = pattern.split('：');
    return parts.length > 1 ? parts[1] : '格局描述未提供';
};
// 判斷格局類型
const getPatternType = (pattern) => {
    const name = getPatternName(pattern);
    // 吉格
    const auspiciousPatterns = [
        '紫府夾命格', '左右夾命格', '文昌文曲格', '財蔭夾印格',
        '殺破狼格', '機月同梁格'
    ];
    // 凶格
    const inauspiciousPatterns = [
        '日月反背格', '火鈴夾命格', '羊陀夾命格', '空劫夾命格'
    ];
    if (auspiciousPatterns.some(p => name.includes(p)))
        return 'auspicious';
    if (inauspiciousPatterns.some(p => name.includes(p)))
        return 'inauspicious';
    return 'neutral';
};
// 格局類型名稱
const getPatternTypeName = (type) => {
    const names = {
        'auspicious': '吉格',
        'inauspicious': '凶格',
        'neutral': '中性格局'
    };
    return names[type] || '未知';
};
// 計算格局影響程度 (1-5)
const getPatternImpact = (pattern) => {
    const name = getPatternName(pattern);
    // 高影響格局
    if (['殺破狼格', '機月同梁格', '日月反背格'].some(p => name.includes(p))) {
        return 5;
    }
    // 中高影響格局
    if (['紫府夾命格', '左右夾命格', '火鈴夾命格', '羊陀夾命格'].some(p => name.includes(p))) {
        return 4;
    }
    // 中等影響格局
    if (['文昌文曲格', '空劫夾命格'].some(p => name.includes(p))) {
        return 3;
    }
    return 2;
};
// 格局類型統計
const patternTypes = computed(() => {
    if (!props.patterns)
        return [];
    const types = {
        auspicious: { name: '吉格', count: 0, type: 'auspicious' },
        inauspicious: { name: '凶格', count: 0, type: 'inauspicious' },
        neutral: { name: '中性', count: 0, type: 'neutral' }
    };
    props.patterns.forEach(pattern => {
        const type = getPatternType(pattern);
        if (types[type]) {
            types[type].count++;
        }
    });
    return Object.values(types).filter(type => type.count > 0);
});
// 是否有吉格
const hasAuspiciousPatterns = computed(() => {
    return props.patterns?.some(pattern => getPatternType(pattern) === 'auspicious') || false;
});
// 是否有凶格
const hasInauspiciousPatterns = computed(() => {
    return props.patterns?.some(pattern => getPatternType(pattern) === 'inauspicious') || false;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-item']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-advice']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-types']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pattern-analysis-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleExpanded) },
    ...{ class: "expand-button" },
    ...{ class: ({ expanded: __VLS_ctx.isExpanded }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.isExpanded ? '收起' : '展開');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "arrow" },
});
(__VLS_ctx.isExpanded ? '▲' : '▼');
if (__VLS_ctx.isExpanded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-content" },
    });
    if (__VLS_ctx.patterns && __VLS_ctx.patterns.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "patterns-overview" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "patterns-count" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "count-badge" },
        });
        (__VLS_ctx.patterns.length);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "count-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "patterns-types" },
        });
        for (const [patternType] of __VLS_getVForSourceType((__VLS_ctx.patternTypes))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (patternType.type),
                ...{ class: "pattern-type-summary" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (['type-indicator', `type-${patternType.type}`]) },
            });
            (patternType.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "type-count" },
            });
            (patternType.count);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "patterns-list" },
    });
    for (const [pattern, index] of __VLS_getVForSourceType((__VLS_ctx.patterns))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`pattern-${index}`),
            ...{ class: "pattern-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['pattern-name', `pattern-${__VLS_ctx.getPatternType(pattern)}`]) },
        });
        (__VLS_ctx.getPatternName(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['pattern-badge', `badge-${__VLS_ctx.getPatternType(pattern)}`]) },
        });
        (__VLS_ctx.getPatternTypeName(__VLS_ctx.getPatternType(pattern)));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-description" },
        });
        (__VLS_ctx.getPatternDescription(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-impact" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "impact-level" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "impact-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "impact-bars" },
        });
        for (const [i] of __VLS_getVForSourceType((5))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (i),
                ...{ class: (['impact-bar', { active: i <= __VLS_ctx.getPatternImpact(pattern) }]) },
            });
        }
    }
    if (!__VLS_ctx.patterns || __VLS_ctx.patterns.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-patterns" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-patterns-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "no-patterns-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-patterns-explanation" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    }
    if (__VLS_ctx.patterns && __VLS_ctx.patterns.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-advice" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-content" },
        });
        if (__VLS_ctx.hasAuspiciousPatterns) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "advice-section positive" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "advice-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        if (__VLS_ctx.hasInauspiciousPatterns) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "advice-section cautionary" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "advice-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-section general" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "advice-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
}
/** @type {__VLS_StyleScopedClasses['pattern-analysis-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-content']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-count']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['count-text']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-types']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-type-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['type-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['type-count']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-item']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-description']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-impact']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-level']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-label']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-text']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-advice']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-content']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['positive']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['cautionary']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-section']} */ ;
/** @type {__VLS_StyleScopedClasses['general']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isExpanded: isExpanded,
            toggleExpanded: toggleExpanded,
            getPatternName: getPatternName,
            getPatternDescription: getPatternDescription,
            getPatternType: getPatternType,
            getPatternTypeName: getPatternTypeName,
            getPatternImpact: getPatternImpact,
            patternTypes: patternTypes,
            hasAuspiciousPatterns: hasAuspiciousPatterns,
            hasInauspiciousPatterns: hasInauspiciousPatterns,
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
//# sourceMappingURL=PatternAnalysisPanel.vue.js.map