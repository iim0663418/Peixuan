/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref } from 'vue';
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';
const props = defineProps();
const isExpanded = ref(false);
const selectedCategory = ref('all');
const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
};
// 雜曜分類映射
const getStarCategory = (starName) => {
    const categories = {
        '桃花': ['天姚', '紅鸞', '天喜', '咸池'],
        '文藝': ['龍池', '鳳閣', '天才', '天壽'],
        '德星': ['天德', '月德', '解神'],
        '煞星': ['擎羊', '陀羅', '火星', '鈴星', '天刑', '孤辰', '寡宿', '天月', '陰煞'],
        '其他': ['天馬', '天巫', '台輔', '封誥']
    };
    for (const [category, stars] of Object.entries(categories)) {
        if (stars.includes(starName))
            return category;
    }
    return '其他';
};
// 獲取分類名稱
const getCategoryName = (category) => {
    const names = {
        'all': '全部',
        '桃花': '桃花',
        '文藝': '文藝',
        '德星': '德星',
        '煞星': '煞星',
        '其他': '其他'
    };
    return names[category] || category;
};
// 提取所有雜曜
const allMinorStars = computed(() => {
    const stars = [];
    props.palaces.forEach(palace => {
        palace.stars.forEach(star => {
            if (star.type === 'minor') {
                stars.push({ star, palace });
            }
        });
    });
    return stars;
});
// 過濾的雜曜
const filteredMinorStars = computed(() => {
    if (selectedCategory.value === 'all') {
        return allMinorStars.value;
    }
    return allMinorStars.value.filter(item => getStarCategory(item.star.name) === selectedCategory.value);
});
// 可用分類
const availableCategories = computed(() => {
    const categories = new Set(['all']);
    allMinorStars.value.forEach(item => {
        categories.add(getStarCategory(item.star.name));
    });
    return Array.from(categories);
});
// 獲取分類數量
const getCategoryCount = (category) => {
    if (category === 'all')
        return allMinorStars.value.length;
    return allMinorStars.value.filter(item => getStarCategory(item.star.name) === category).length;
};
// 分類統計
const categoryStats = computed(() => {
    const stats = { beneficial: 0, malefic: 0, neutral: 0 };
    filteredMinorStars.value.forEach(item => {
        switch (item.star.attribute) {
            case '吉':
                stats.beneficial++;
                break;
            case '凶':
                stats.malefic++;
                break;
            default:
                stats.neutral++;
        }
    });
    return stats;
});
// 獲取星曜特殊影響
const getStarInfluence = (starInfo) => {
    const { star, palace } = starInfo;
    const influences = {
        '天馬': {
            '遷移宮': '增強外出運勢，利於旅行發展',
            '官祿宮': '事業有變動機會，宜主動出擊'
        },
        '天姚': {
            '夫妻宮': '感情豐富，桃花運旺，需注意感情處理',
            '命宮': '人緣佳，具有魅力，易得異性緣'
        },
        '紅鸞': {
            '夫妻宮': '婚姻運佳，感情順利，有喜慶之事',
            '子女宮': '子女緣分深厚，家庭和樂'
        },
        '天喜': {
            '命宮': '人生多喜事，個性樂觀開朗',
            '福德宮': '精神愉悦，享受生活樂趣'
        },
        '龍池': {
            '命宮': '具有藝術天賦，品味高雅',
            '官祿宮': '工作與文藝創作相關，才華出眾'
        },
        '鳳閣': {
            '命宮': '具有美感，追求精緻生活',
            '夫妻宮': '配偶有藝術氣質，夫妻生活優雅'
        },
        '天德': {
            '命宮': '有貴人相助，能逢凶化吉',
            '疾厄宮': '身體健康，疾病易癒'
        },
        '月德': {
            '命宮': '心地善良，常得人助',
            '父母宮': '與長輩關係良好，得到庇佑'
        }
    };
    return influences[star.name]?.[palace.name] || '';
};
// 正面影響
const positiveInfluences = computed(() => {
    const influences = [];
    filteredMinorStars.value.forEach(item => {
        if (item.star.attribute === '吉') {
            const category = getStarCategory(item.star.name);
            switch (category) {
                case '桃花':
                    influences.push('人際關係和諧，感情運勢良好');
                    break;
                case '文藝':
                    influences.push('具有藝術天賦，品味高雅');
                    break;
                case '德星':
                    influences.push('道德品格高尚，能獲得庇佑');
                    break;
            }
        }
    });
    return [...new Set(influences)];
});
// 負面影響
const negativeInfluences = computed(() => {
    const influences = [];
    filteredMinorStars.value.forEach(item => {
        if (item.star.attribute === '凶') {
            const category = getStarCategory(item.star.name);
            switch (category) {
                case '煞星':
                    influences.push('需要注意人際關係，避免衝突');
                    break;
            }
            // 特定星曜的影響
            switch (item.star.name) {
                case '孤辰':
                case '寡宿':
                    influences.push('容易感到孤獨，需主動建立社交圈');
                    break;
                case '擎羊':
                case '陀羅':
                    influences.push('行事需謹慎，避免急躁冒進');
                    break;
                case '火星':
                case '鈴星':
                    influences.push('情緒容易激動，需要冷靜處理問題');
                    break;
            }
        }
    });
    return [...new Set(influences)];
});
// 綜合建議
const getOverallSuggestion = () => {
    const beneficialCount = categoryStats.value.beneficial;
    const maleficCount = categoryStats.value.malefic;
    if (beneficialCount > maleficCount) {
        return '雜曜整體影響偏向正面，建議善用這些星曜帶來的特殊才能和機會。';
    }
    else if (maleficCount > beneficialCount) {
        return '需要特別注意雜曜帶來的挑戰，透過修養和智慧來化解不利影響。';
    }
    else {
        return '雜曜影響平衡，關鍵在於如何運用智慧來趨吉避凶。';
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['category-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-stars-impact']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-positive']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-negative']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-content']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-stars-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['no-stars-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['no-stars-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['star-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "minor-stars-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.selectedCategory),
    ...{ class: "category-selector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "all",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "桃花",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "文藝",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "德星",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "煞星",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "其他",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleExpanded) },
    ...{ class: "expand-button" },
    ...{ class: ({ expanded: __VLS_ctx.isExpanded }) },
});
(__VLS_ctx.isExpanded ? '收起' : '展開');
if (__VLS_ctx.isExpanded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-stars-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.filteredMinorStars.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.categoryStats.beneficial);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.categoryStats.malefic);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.categoryStats.neutral);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "category-tabs" },
    });
    for (const [category] of __VLS_getVForSourceType((__VLS_ctx.availableCategories))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isExpanded))
                        return;
                    __VLS_ctx.selectedCategory = category;
                } },
            key: (category),
            ...{ class: (['category-tab', { active: __VLS_ctx.selectedCategory === category }]) },
        });
        (__VLS_ctx.getCategoryName(category));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tab-count" },
        });
        (__VLS_ctx.getCategoryCount(category));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-stars-list" },
    });
    for (const [starInfo] of __VLS_getVForSourceType((__VLS_ctx.filteredMinorStars))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${starInfo.star.name}-${starInfo.palace.name}`),
            ...{ class: "minor-star-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['star-name', `star-${starInfo.star.attribute}`]) },
        });
        (starInfo.star.name);
        if (starInfo.star.brightness) {
            /** @type {[typeof StarBrightnessIndicator, ]} */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(StarBrightnessIndicator, new StarBrightnessIndicator({
                brightness: (starInfo.star.brightness),
            }));
            const __VLS_1 = __VLS_0({
                brightness: (starInfo.star.brightness),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['star-category-badge', `category-${__VLS_ctx.getStarCategory(starInfo.star.name)}`]) },
        });
        (__VLS_ctx.getCategoryName(__VLS_ctx.getStarCategory(starInfo.star.name)));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-location" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "location-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "palace-name" },
        });
        (starInfo.palace.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "palace-zhi" },
        });
        (starInfo.palace.zhi);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-description" },
        });
        (starInfo.star.description);
        if (__VLS_ctx.getStarInfluence(starInfo)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "star-influence" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "influence-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "influence-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "influence-title" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "influence-content" },
            });
            (__VLS_ctx.getStarInfluence(starInfo));
        }
        if (starInfo.star.transformations && starInfo.star.transformations.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "star-transformations" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "transformations-label" },
            });
            for (const [transformation] of __VLS_getVForSourceType((starInfo.star.transformations))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    key: (transformation),
                    ...{ class: (['transformation-badge', `transformation-${transformation}`]) },
                });
                (transformation);
            }
        }
    }
    if (__VLS_ctx.filteredMinorStars.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "minor-stars-impact" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "impact-content" },
        });
        if (__VLS_ctx.positiveInfluences.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "impact-positive" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [influence] of __VLS_getVForSourceType((__VLS_ctx.positiveInfluences))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (influence),
                });
                (influence);
            }
        }
        if (__VLS_ctx.negativeInfluences.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "impact-negative" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [influence] of __VLS_getVForSourceType((__VLS_ctx.negativeInfluences))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (influence),
                });
                (influence);
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "impact-suggestions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.getOverallSuggestion());
    }
    if (__VLS_ctx.filteredMinorStars.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-minor-stars" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-stars-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.selectedCategory === 'all' ?
            '此命盤中未發現雜曜，這是正常情況。' :
            `此命盤中未發現${__VLS_ctx.getCategoryName(__VLS_ctx.selectedCategory)}雜曜。`);
        if (__VLS_ctx.selectedCategory === 'all') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "no-stars-explanation" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
        }
    }
}
/** @type {__VLS_StyleScopedClasses['minor-stars-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['category-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-button']} */ ;
/** @type {__VLS_StyleScopedClasses['expanded']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-content']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-stars-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['category-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-stars-list']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['star-info']} */ ;
/** @type {__VLS_StyleScopedClasses['star-header']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['star-category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['star-location']} */ ;
/** @type {__VLS_StyleScopedClasses['location-label']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['star-description']} */ ;
/** @type {__VLS_StyleScopedClasses['star-influence']} */ ;
/** @type {__VLS_StyleScopedClasses['influence-header']} */ ;
/** @type {__VLS_StyleScopedClasses['influence-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['influence-title']} */ ;
/** @type {__VLS_StyleScopedClasses['influence-content']} */ ;
/** @type {__VLS_StyleScopedClasses['star-transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations-label']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-stars-impact']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-content']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-positive']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-negative']} */ ;
/** @type {__VLS_StyleScopedClasses['impact-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-minor-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['no-stars-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['no-stars-explanation']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StarBrightnessIndicator: StarBrightnessIndicator,
            isExpanded: isExpanded,
            selectedCategory: selectedCategory,
            toggleExpanded: toggleExpanded,
            getStarCategory: getStarCategory,
            getCategoryName: getCategoryName,
            filteredMinorStars: filteredMinorStars,
            availableCategories: availableCategories,
            getCategoryCount: getCategoryCount,
            categoryStats: categoryStats,
            getStarInfluence: getStarInfluence,
            positiveInfluences: positiveInfluences,
            negativeInfluences: negativeInfluences,
            getOverallSuggestion: getOverallSuggestion,
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
//# sourceMappingURL=MinorStarsPanel.vue.js.map