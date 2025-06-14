/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref, onMounted, onUnmounted } from 'vue';
const props = defineProps();
// Tooltip state
const showTooltip = ref(false);
const tooltipData = ref({
    title: '',
    description: '',
    influence: '',
    advice: ''
});
const tooltipPosition = ref('top');
// 星曜亮度提示
const brightnessHints = computed(() => {
    if (!props.palace)
        return [];
    const hints = [];
    props.palace.stars.forEach(star => {
        if (star.brightness && ['廟', '旺', '落陷'].includes(star.brightness)) {
            hints.push({
                star: star.name,
                level: star.brightness
            });
        }
    });
    return hints.slice(0, 2); // 最多顯示2個
});
// 格局提示
const patternHints = computed(() => {
    if (!props.palace)
        return [];
    const hints = [];
    const stars = props.palace.stars.map(s => s.name);
    // 檢查常見格局
    if (stars.includes('紫微') && stars.includes('天府')) {
        hints.push({ type: 'auspicious', description: '紫府同宮' });
    }
    if (stars.includes('左輔') && stars.includes('右弼')) {
        hints.push({ type: 'auspicious', description: '左右同宮' });
    }
    if (stars.includes('文昌') && stars.includes('文曲')) {
        hints.push({ type: 'auspicious', description: '昌曲同宮' });
    }
    return hints.slice(0, 1); // 最多顯示1個
});
// 雜曜提示
const minorStarHints = computed(() => {
    if (!props.palace)
        return [];
    const hints = [];
    const minorStars = props.palace.stars.filter(s => s.type === 'minor');
    const categories = {
        桃花: ['天姚', '紅鸞', '天喜', '咸池'],
        文藝: ['龍池', '鳳閣', '天才', '天壽'],
        德星: ['天德', '月德', '解神'],
        煞星: ['擎羊', '陀羅', '火星', '鈴星']
    };
    for (const [category, starNames] of Object.entries(categories)) {
        const hasCategory = minorStars.some(star => starNames.includes(star.name));
        if (hasCategory) {
            hints.push({ category: category.toLowerCase(), description: `${category}雜曜` });
        }
    }
    return hints.slice(0, 1); // 最多顯示1個
});
// Tooltip functions
const showHintDetail = (type, hint) => {
    switch (type) {
        case 'brightness':
            tooltipData.value = {
                title: `${hint.star} - ${hint.level}`,
                description: getBrightnessDescription(hint.level),
                influence: getBrightnessInfluence(hint.level),
                advice: getBrightnessAdvice(hint.level)
            };
            break;
        case 'pattern':
            tooltipData.value = {
                title: hint.description,
                description: getPatternDescription(hint.description),
                influence: getPatternInfluence(hint.description),
                advice: getPatternAdvice(hint.description)
            };
            break;
        case 'empty':
            tooltipData.value = {
                title: '空宮',
                description: '本宮沒有主星，需要借對宮的星曜來論命。',
                influence: '空宮代表該領域需要更多主動創造和努力。',
                advice: hint.borrowedInfo ? `可借用${hint.borrowedInfo.name}的星曜特質。` : '需要主動開創該領域的運勢。'
            };
            break;
        case 'minor':
            tooltipData.value = {
                title: hint.description,
                description: getMinorStarDescription(hint.category),
                influence: getMinorStarInfluence(hint.category),
                advice: getMinorStarAdvice(hint.category)
            };
            break;
    }
    // 根據位置調整tooltip顯示方向
    tooltipPosition.value = determineTooltipPosition();
    showTooltip.value = true;
};
const closeTooltip = () => {
    showTooltip.value = false;
};
const determineTooltipPosition = () => {
    // 所有解析度都使用中央懸浮視窗模式，提供更好的閱讀體驗
    return 'center';
};
// Tooltip content functions
const getBrightnessTooltip = (hint) => {
    return `點擊查看 ${hint.star}${hint.level} 的詳細說明`;
};
const getPatternTooltip = (hint) => {
    return `點擊查看 ${hint.description} 格局的詳細說明`;
};
const getEmptyPalaceTooltip = () => {
    return '點擊查看空宮的詳細說明';
};
const getMinorStarTooltip = (hint) => {
    return `點擊查看 ${hint.description} 的詳細說明`;
};
// Description functions
const getBrightnessDescription = (level) => {
    const descriptions = {
        '廟': '星曜在此位置力量最強，發揮最佳效果。',
        '旺': '星曜在此位置力量強盛，運作良好。',
        '落陷': '星曜在此位置力量較弱，需要其他因素輔助。'
    };
    return descriptions[level] || '';
};
const getBrightnessInfluence = (level) => {
    const influences = {
        '廟': '正面影響力最大，吉星更吉，凶星減凶。',
        '旺': '正面影響力強，整體運勢提升。',
        '落陷': '影響力減弱，需要配合其他星曜發揮作用。'
    };
    return influences[level] || '';
};
const getBrightnessAdvice = (level) => {
    const advice = {
        '廟': '可充分發揮該星曜的特質，積極行動。',
        '旺': '善用星曜優勢，把握機會。',
        '落陷': '需要更多努力和配合，不宜過度依賴。'
    };
    return advice[level] || '';
};
const getPatternDescription = (pattern) => {
    const descriptions = {
        '紫府同宮': '紫微星與天府星同在一宮，為帝王格局之一。',
        '左右同宮': '左輔右弼同宮，增強輔助力量。',
        '昌曲同宮': '文昌文曲同宮，利於學習和文藝發展。'
    };
    return descriptions[pattern] || '特殊星曜組合，具有獨特影響力。';
};
const getPatternInfluence = (pattern) => {
    const influences = {
        '紫府同宮': '具有領導能力和權威性，適合管理職位。',
        '左右同宮': '人際關係良好，容易得到他人幫助。',
        '昌曲同宮': '學習能力強，文藝天分高。'
    };
    return influences[pattern] || '帶來正面的綜合影響。';
};
const getPatternAdvice = (pattern) => {
    const advice = {
        '紫府同宮': '可朝向領導管理方向發展，培養領袖氣質。',
        '左右同宮': '多與人合作，善用人際網絡。',
        '昌曲同宮': '加強學習和創作，發展文藝才能。'
    };
    return advice[pattern] || '善用格局優勢，積極發展。';
};
const getMinorStarDescription = (category) => {
    const descriptions = {
        '桃花': '與感情、人緣、異性緣相關的雜曜。',
        '文藝': '與才華、藝術、創作能力相關的雜曜。',
        '德星': '與道德、品格、貴人相關的雜曜。',
        '煞星': '帶有阻礙、挑戰意義的雜曜。'
    };
    return descriptions[category] || '特殊類型的雜曜。';
};
const getMinorStarInfluence = (category) => {
    const influences = {
        '桃花': '增強人際魅力，但需注意感情問題。',
        '文藝': '提升創作才能和藝術天分。',
        '德星': '帶來貴人運和正面品格。',
        '煞星': '可能帶來挑戰，但也是成長機會。'
    };
    return influences[category] || '帶來特殊的影響力。';
};
const getMinorStarAdvice = (category) => {
    const advice = {
        '桃花': '保持適度社交，理性處理感情。',
        '文藝': '多培養藝術興趣，發展創作能力。',
        '德星': '保持正面品格，善待他人。',
        '煞星': '化挑戰為動力，提升抗壓能力。'
    };
    return advice[category] || '善用特質，平衡發展。';
};
// Handle escape key
const handleEscape = (event) => {
    if (event.key === 'Escape') {
        closeTooltip();
    }
};
onMounted(() => {
    document.addEventListener('keydown', handleEscape);
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brightness-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['brightness-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['close-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-influence']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-advice']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-hints-display']} */ ;
/** @type {__VLS_StyleScopedClasses['brightness-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-influence']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-advice']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "feature-hints-display" },
});
if (__VLS_ctx.brightnessHints.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brightness-hints" },
    });
    for (const [hint] of __VLS_getVForSourceType((__VLS_ctx.brightnessHints))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.brightnessHints.length > 0))
                        return;
                    __VLS_ctx.showHintDetail('brightness', hint);
                } },
            key: (hint.star),
            ...{ class: "brightness-hint" },
            ...{ class: (`brightness-${hint.level}`) },
            title: (__VLS_ctx.getBrightnessTooltip(hint)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-text" },
        });
        (hint.star);
        (hint.level);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-indicator" },
        });
    }
}
if (__VLS_ctx.patternHints.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pattern-hints" },
    });
    for (const [hint] of __VLS_getVForSourceType((__VLS_ctx.patternHints))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.patternHints.length > 0))
                        return;
                    __VLS_ctx.showHintDetail('pattern', hint);
                } },
            key: (hint.type),
            ...{ class: "pattern-hint" },
            ...{ class: (`pattern-${hint.type}`) },
            title: (__VLS_ctx.getPatternTooltip(hint)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-text" },
        });
        (hint.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-indicator" },
        });
    }
}
if (__VLS_ctx.isEmpty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isEmpty))
                    return;
                __VLS_ctx.showHintDetail('empty', { name: '空宮', borrowedInfo: __VLS_ctx.borrowedInfo });
            } },
        ...{ class: "empty-palace-hint" },
        title: (__VLS_ctx.getEmptyPalaceTooltip()),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hint-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hint-text" },
    });
    if (__VLS_ctx.borrowedInfo) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "borrowed-hint" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "borrowed-text" },
        });
        (__VLS_ctx.borrowedInfo.name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-indicator" },
    });
}
if (__VLS_ctx.minorStarHints.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-star-hints" },
    });
    for (const [hint] of __VLS_getVForSourceType((__VLS_ctx.minorStarHints))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.minorStarHints.length > 0))
                        return;
                    __VLS_ctx.showHintDetail('minor', hint);
                } },
            key: (hint.category),
            ...{ class: "minor-star-hint" },
            ...{ class: (`minor-${hint.category}`) },
            title: (__VLS_ctx.getMinorStarTooltip(hint)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hint-text" },
        });
        (hint.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-indicator" },
        });
    }
}
if (__VLS_ctx.showTooltip) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "feature-tooltip" },
        ...{ class: (__VLS_ctx.tooltipPosition) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.tooltipData.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeTooltip) },
        ...{ class: "close-tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tooltip-description" },
    });
    (__VLS_ctx.tooltipData.description);
    if (__VLS_ctx.tooltipData.influence) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tooltip-influence" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.tooltipData.influence);
    }
    if (__VLS_ctx.tooltipData.advice) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tooltip-advice" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.tooltipData.advice);
    }
}
if (__VLS_ctx.showTooltip) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeTooltip) },
        ...{ class: "tooltip-backdrop" },
    });
}
/** @type {__VLS_StyleScopedClasses['feature-hints-display']} */ ;
/** @type {__VLS_StyleScopedClasses['brightness-hints']} */ ;
/** @type {__VLS_StyleScopedClasses['brightness-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-hints']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['borrowed-text']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-hints']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['info-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-influence']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-advice']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-backdrop']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            showTooltip: showTooltip,
            tooltipData: tooltipData,
            tooltipPosition: tooltipPosition,
            brightnessHints: brightnessHints,
            patternHints: patternHints,
            minorStarHints: minorStarHints,
            showHintDetail: showHintDetail,
            closeTooltip: closeTooltip,
            getBrightnessTooltip: getBrightnessTooltip,
            getPatternTooltip: getPatternTooltip,
            getEmptyPalaceTooltip: getEmptyPalaceTooltip,
            getMinorStarTooltip: getMinorStarTooltip,
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
//# sourceMappingURL=FeatureHintsDisplay.vue.js.map