/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
const props = defineProps();
// Refs
// Canvas 已替換為現代化能力條設計
const updateKey = ref(0);
const isDev = ref(import.meta.env.DEV);
// 星曜屬性映射
const starAttributes = {
    // 領導力相關星曜
    leadership: ['紫微', '天府', '武曲', '貪狼', '七殺', '破軍'],
    // 創造力相關星曜
    creativity: ['貪狼', '廉貞', '巨門', '文昌', '文曲', '左輔', '右弼'],
    // 溝通力相關星曜
    communication: ['太陽', '巨門', '天梁', '文昌', '文曲'],
    // 學習能力相關星曜
    learning: ['文昌', '文曲', '天機', '太陰', '天梁'],
    // 理財能力相關星曜
    financial: ['武曲', '天府', '太陰', '祿存', '化祿'],
    // 人際關係相關星曜
    social: ['太陽', '天同', '天梁', '左輔', '右弼', '天魁', '天鉞']
};
// 分析外在特質（基於八字概念的推導）
const externalTraits = computed(() => {
    // 強制更新響應性
    const _ = updateKey.value;
    const traits = [];
    if (!props.chartData?.palaces) {
        console.log('TraitDeconstruction: 外在特質分析 - 沒有命盤宮位資料');
        return traits;
    }
    console.log('TraitDeconstruction: 外在特質分析 - 宮位數量:', props.chartData.palaces.length);
    // 基於命宮主星分析外在表現
    const mingPalace = props.chartData.palaces.find(p => p.name === '命宮');
    if (mingPalace?.stars) {
        const mainStars = mingPalace.stars.filter(star => star.type === 'main');
        mainStars.forEach(star => {
            switch (star.name) {
                case '紫微':
                    traits.push('天生具有領導風範，舉止優雅高貴');
                    break;
                case '天機':
                    traits.push('思維敏捷，喜歡動腦思考問題');
                    break;
                case '太陽':
                    traits.push('性格開朗，樂於助人，具有正義感');
                    break;
                case '武曲':
                    traits.push('做事果斷，執行力強，重視效率');
                    break;
                case '天同':
                    traits.push('溫和友善，容易親近，處事圓融');
                    break;
                case '廉貞':
                    traits.push('個性鮮明，敢愛敢恨，有正義感');
                    break;
                default:
                    traits.push('外在表現穩重，為人處事有條理');
            }
        });
    }
    // 確保至少有一些特質
    if (traits.length === 0) {
        traits.push('外表沉穩內斂，給人可靠的印象');
        traits.push('在社交場合中表現得體，善於察言觀色');
    }
    return traits.slice(0, 4); // 限制最多4個特質
});
// 分析內在特質（基於紫微斗數）
const internalTraits = computed(() => {
    // 強制更新響應性
    const _ = updateKey.value;
    const traits = [];
    if (!props.chartData?.palaces) {
        console.log('TraitDeconstruction: 內在特質分析 - 沒有命盤宮位資料');
        return traits;
    }
    console.log('TraitDeconstruction: 內在特質分析 - 宮位數量:', props.chartData.palaces.length);
    // 基於福德宮分析內在精神世界
    const fudePalace = props.chartData.palaces.find(p => p.name === '福德宮');
    if (fudePalace?.stars) {
        const mainStars = fudePalace.stars.filter(star => star.type === 'main');
        mainStars.forEach(star => {
            switch (star.name) {
                case '紫微':
                    traits.push('內心高傲，對自己要求嚴格');
                    break;
                case '天機':
                    traits.push('內心細膩敏感，善於洞察人心');
                    break;
                case '太陽':
                    traits.push('內心熱忱，有強烈的使命感');
                    break;
                case '武曲':
                    traits.push('內心堅毅，不輕易向困難低頭');
                    break;
                case '天同':
                    traits.push('內心純真，渴望和諧美好的生活');
                    break;
                case '廉貞':
                    traits.push('內心複雜多變，情感豐富細膩');
                    break;
                default:
                    traits.push('內心世界豐富，有深層的思考能力');
            }
        });
    }
    // 分析疾厄宮了解內在壓力模式
    const jiePalace = props.chartData.palaces.find(p => p.name === '疾厄宮');
    if (jiePalace?.stars) {
        const hasInauspiciousStars = jiePalace.stars.some(star => star.attribute === '凶');
        if (hasInauspiciousStars) {
            traits.push('內心容易感到壓力，需要學會放鬆');
        }
    }
    // 確保至少有一些特質
    if (traits.length === 0) {
        traits.push('內心渴望安全感，重視情感的穩定');
        traits.push('具有同理心，能夠理解他人的感受');
    }
    return traits.slice(0, 4); // 限制最多4個特質
});
// 特質綜合說明
const traitSynthesis = computed(() => {
    const external = externalTraits.value.length > 0 ? '外在表現' : '表面特質';
    const internal = internalTraits.value.length > 0 ? '內在本質' : '深層個性';
    return `您的${external}與${internal}形成了獨特的個性組合。在不同的環境和情境下，這兩種特質會交替顯現或相互影響。理解這種雙重性格有助於您更好地發揮優勢，並在人際交往中找到最適合的表達方式。建議在重要場合時發揮外在優勢，在私人時光中照顧內在需求。`;
});
// 核心能力分析
const coreAbilities = computed(() => {
    // 強制更新響應性
    const _ = updateKey.value;
    const abilities = [
        { name: '領導力', value: 0, color: '#ff6b6b', key: 'leadership' },
        { name: '創造力', value: 0, color: '#4ecdc4', key: 'creativity' },
        { name: '溝通力', value: 0, color: '#45b7d1', key: 'communication' },
        { name: '學習能力', value: 0, color: '#96ceb4', key: 'learning' },
        { name: '理財能力', value: 0, color: '#feca57', key: 'financial' },
        { name: '人際關係', value: 0, color: '#ff9ff3', key: 'social' }
    ];
    if (!props.chartData?.palaces) {
        // 沒有數據時給予基準分數
        abilities.forEach(ability => {
            ability.value = 4 + Math.floor(Math.random() * 3); // 4-6分基準
        });
        return abilities;
    }
    // 計算各項能力值
    abilities.forEach(ability => {
        const relatedStars = starAttributes[ability.key] || [];
        let score = 0;
        let starCount = 0;
        props.chartData.palaces.forEach(palace => {
            palace.stars?.forEach(star => {
                if (relatedStars.includes(star.name)) {
                    starCount++;
                    // 基礎分數：每顆相關星曜給2分
                    score += 2;
                    // 亮度加成（更顯著的影響）
                    if (star.brightness) {
                        const brightnessBonus = {
                            '廟': 4,
                            '旺': 3,
                            '得地': 2,
                            '利益': 1,
                            '平和': 0,
                            '不得地': -1,
                            '落陷': -2
                        }[star.brightness] || 0;
                        score += brightnessBonus;
                    }
                    // 四化加成（加強效果）
                    if (star.transformations?.includes('祿'))
                        score += 2;
                    if (star.transformations?.includes('權'))
                        score += 2;
                    if (star.transformations?.includes('科'))
                        score += 1;
                    if (star.transformations?.includes('忌'))
                        score -= 2;
                    // 特殊宮位加成
                    if (palace.name === '命宮')
                        score += 1; // 命宮星曜影響較大
                    if (palace.name === '官祿宮' && ability.key === 'leadership')
                        score += 1;
                    if (palace.name === '財帛宮' && ability.key === 'financial')
                        score += 1;
                }
            });
        });
        // 基準分數：即使沒有相關星曜也給予4分基準
        let baseScore = 4;
        // 根據星曜數量調整基準
        if (starCount > 0) {
            baseScore = Math.max(4, score);
        }
        else {
            // 沒有直接相關星曜時，根據整體命盤給予差異化分數
            baseScore = 4 + Math.floor(Math.random() * 3); // 4-6分隨機基準
        }
        // 轉換為4-10分制（避免過低分數）
        ability.value = Math.max(4, Math.min(10, Math.round(baseScore)));
    });
    return abilities;
});
// 頂級天賦（取前三名）
const topTalents = computed(() => {
    return [...coreAbilities.value]
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(ability => ({
        name: ability.name,
        value: ability.value,
        level: ability.value >= 8 ? 'high' : ability.value >= 6 ? 'medium' : 'low'
    }));
});
// 潛能開發建議
const potentialSuggestions = computed(() => {
    const suggestions = [];
    const topAbility = topTalents.value[0];
    if (topAbility) {
        switch (topAbility.name) {
            case '領導力':
                suggestions.push('可考慮擔任團隊領導角色，培養管理技能');
                suggestions.push('參與公共事務或社區服務，發揮影響力');
                break;
            case '創造力':
                suggestions.push('從事藝術創作或設計相關工作');
                suggestions.push('培養多元興趣，刺激創意發想');
                break;
            case '溝通力':
                suggestions.push('發展演講、寫作或媒體相關技能');
                suggestions.push('建立個人品牌，分享專業知識');
                break;
            case '學習能力':
                suggestions.push('終身學習，持續更新知識結構');
                suggestions.push('考慮從事教育或研究相關工作');
                break;
            case '理財能力':
                suggestions.push('深入學習投資理財知識');
                suggestions.push('考慮財務規劃或金融相關職業');
                break;
            case '人際關係':
                suggestions.push('發展人脈網絡，建立良好關係');
                suggestions.push('從事需要團隊合作的工作');
                break;
        }
    }
    // 通用建議
    suggestions.push('定期自我反思，了解個人成長需求');
    suggestions.push('尋找能夠發揮天賦的發展機會');
    return suggestions;
});
// 人生課題分析
const lifeLessons = computed(() => {
    // 強制更新響應性
    const _ = updateKey.value;
    const lessons = [];
    if (!props.chartData?.palaces)
        return lessons;
    // 分析各宮位的挑戰
    props.chartData.palaces.forEach(palace => {
        const hasInauspiciousStars = palace.stars?.some(star => star.attribute === '凶');
        const hasTransformToJi = palace.stars?.some(star => star.transformations?.includes('忌'));
        const isEmptyPalace = !palace.stars?.some(star => star.type === 'main');
        if (hasInauspiciousStars || hasTransformToJi || isEmptyPalace) {
            let lesson = {};
            switch (palace.name) {
                case '命宮':
                    lesson = {
                        title: '自我認知與定位',
                        description: '需要更深入地了解自己的本質和人生方向',
                        guidance: '通過冥想、自省或心理諮商來加深自我認識',
                        source: `${palace.name}星曜配置`,
                        priority: 5,
                        icon: '🔍'
                    };
                    break;
                case '財帛宮':
                    lesson = {
                        title: '金錢觀念與理財',
                        description: '需要建立正確的金錢觀念和理財習慣',
                        guidance: '學習投資理財知識，培養延遲滿足的能力',
                        source: `${palace.name}星曜配置`,
                        priority: 4,
                        icon: '💰'
                    };
                    break;
                case '夫妻宮':
                    lesson = {
                        title: '情感關係與溝通',
                        description: '需要學習如何建立和維持健康的親密關係',
                        guidance: '培養同理心，學習有效溝通技巧',
                        source: `${palace.name}星曜配置`,
                        priority: 4,
                        icon: '💝'
                    };
                    break;
                case '官祿宮':
                    lesson = {
                        title: '事業發展與成就',
                        description: '需要找到適合的職業方向和發展策略',
                        guidance: '明確職業目標，持續提升專業能力',
                        source: `${palace.name}星曜配置`,
                        priority: 4,
                        icon: '🎯'
                    };
                    break;
                case '交友宮':
                    lesson = {
                        title: '人際關係與社交',
                        description: '需要改善人際交往技巧和朋友選擇',
                        guidance: '學習主動關懷他人，建立互惠的友誼',
                        source: `${palace.name}星曜配置`,
                        priority: 3,
                        icon: '🤝'
                    };
                    break;
                default:
                    lesson = {
                        title: `${palace.name}領域修練`,
                        description: `在${palace.name}相關領域需要特別注意和學習`,
                        guidance: '保持謙虛學習的態度，尋求專業指導',
                        source: `${palace.name}星曜配置`,
                        priority: 2,
                        icon: '📚'
                    };
            }
            lessons.push(lesson);
        }
    });
    // 按優先度排序，限制數量
    return lessons.sort((a, b) => b.priority - a.priority).slice(0, 4);
});
// 獲取能力圖標
const getAbilityIcon = (abilityName) => {
    const iconMap = {
        '領導力': '👑',
        '創造力': '🎨',
        '溝通力': '💬',
        '學習能力': '📚',
        '理財能力': '💰',
        '人際關係': '🤝'
    };
    return iconMap[abilityName] || '⭐';
};
// 獲取能力等級描述
const getAbilityLevel = (value) => {
    if (value >= 8)
        return '優秀';
    if (value >= 6)
        return '良好';
    if (value >= 4)
        return '普通';
    return '待提升';
};
// 顏色亮化函數
const lightenColor = (color, amount) => {
    // 簡化的顏色亮化處理
    const colorMap = {
        '#ff6b6b': '#ff9999',
        '#4ecdc4': '#7ee8e0',
        '#45b7d1': '#78c7e4',
        '#96ceb4': '#b8dcc6',
        '#feca57': '#fed887',
        '#ff9ff3': '#ffb8f7'
    };
    return colorMap[color] || color;
};
// 更新能力顯示（替換原雷達圖功能）
const updateAbilitiesDisplay = () => {
    // 觸發響應式更新
    updateKey.value++;
    console.log('能力顯示已更新');
};
// 監聽命盤資料變化
watch(() => props.chartData, (newChartData, oldChartData) => {
    console.log('TraitDeconstruction: 監聽到 chartData 變化');
    console.log('新資料存在:', !!newChartData);
    console.log('新資料宮位數:', newChartData?.palaces?.length || 0);
    console.log('舊資料存在:', !!oldChartData);
    console.log('舊資料宮位數:', oldChartData?.palaces?.length || 0);
    // 更寬鬆的更新條件
    if (newChartData && newChartData.palaces && newChartData.palaces.length > 0) {
        console.log('TraitDeconstruction: 資料有效，開始更新');
        updateKey.value++;
        nextTick(() => {
            updateAbilitiesDisplay();
            console.log('TraitDeconstruction: 雷達圖已重繪');
        });
    }
    else {
        console.log('TraitDeconstruction: 資料無效，跳過更新');
    }
}, { deep: true, immediate: true });
// 監聽全域命盤更新事件
const handleGlobalChartUpdate = (event) => {
    console.log('TraitDeconstruction: 收到全域命盤更新事件', event.detail);
    updateKey.value++; // 強制更新所有計算屬性
    nextTick(() => {
        updateAbilitiesDisplay();
    });
};
// 添加全域事件監聽器
if (typeof window !== 'undefined') {
    window.addEventListener('purple-star-chart-updated', handleGlobalChartUpdate);
    window.addEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate);
}
// 監聽核心能力分析變化
watch(() => coreAbilities.value, (newAbilities, oldAbilities) => {
    if (JSON.stringify(newAbilities) !== JSON.stringify(oldAbilities)) {
        console.log('TraitDeconstruction: 核心能力分析變化，重新繪製雷達圖');
        nextTick(() => {
            updateAbilitiesDisplay();
        });
    }
}, { deep: true });
// 手動刷新特質分析
const refreshTraitAnalysis = () => {
    console.log('TraitDeconstruction: 手動刷新特質分析');
    updateKey.value++;
    nextTick(() => {
        updateAbilitiesDisplay();
    });
    // 通知其他組件手動刷新事件
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trait-analysis-refreshed', {
            detail: {
                component: 'TraitDeconstruction',
                timestamp: Date.now(),
                source: 'manual-refresh'
            }
        }));
    }
};
// 手動刷新天賦分析
const refreshTalentAnalysis = () => {
    console.log('TraitDeconstruction: 手動刷新天賦分析');
    updateKey.value++;
    nextTick(() => {
        updateAbilitiesDisplay();
    });
};
// 監聽窗口大小變化，重新繪製雷達圖
const handleResize = () => {
    nextTick(() => {
        updateAbilitiesDisplay();
    });
};
// 添加窗口大小變化監聽器
if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
}
// 調試函數：輸出當前資料結構
const logCurrentDataStructure = () => {
    console.log('=== TraitDeconstruction 當前資料結構 ===');
    console.log('命盤資料:', props.chartData);
    console.log('外在特質:', externalTraits.value);
    console.log('內在特質:', internalTraits.value);
    console.log('核心能力:', coreAbilities.value);
    console.log('頂級天賦:', topTalents.value);
    console.log('人生課題:', lifeLessons.value);
    console.log('=====================================');
};
// 在全局暴露調試函數（開發環境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.debugTraitDeconstruction = logCurrentDataStructure;
    window.refreshTraitDeconstruction = refreshTraitAnalysis;
}
// 生命週期
onMounted(() => {
    console.log('TraitDeconstruction: 組件掛載，初始化雷達圖');
    console.log('掛載時 chartData:', props.chartData);
    console.log('掛載時 palaces 數量:', props.chartData?.palaces?.length || 0);
    // 檢查資料內容
    if (props.chartData?.palaces) {
        const mingPalace = props.chartData.palaces.find(p => p.name === '命宮');
        console.log('命宮資料:', mingPalace);
        console.log('命宮星曜:', mingPalace?.stars);
    }
    nextTick(() => {
        updateAbilitiesDisplay();
    });
});
// 組件卸載時清除事件監聽器
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('purple-star-chart-updated', handleGlobalChartUpdate);
        window.removeEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate);
        window.removeEventListener('resize', handleResize);
        console.log('TraitDeconstruction: 已清除全域事件監聽器');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['trait-deconstruction']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['external-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['internal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-text']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-list']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-card']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-container']} */ ;
/** @type {__VLS_StyleScopedClasses['duality-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-container']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-details']} */ ;
/** @type {__VLS_StyleScopedClasses['radar-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['duality-container']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-container']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-header']} */ ;
/** @type {__VLS_StyleScopedClasses['radar-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-legend']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-details']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-list']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-list']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-deconstruction" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duality-analysis-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
if (__VLS_ctx.isDev) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.refreshTraitAnalysis) },
        ...{ class: "refresh-btn" },
        title: "重新計算特質分析",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duality-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-side external-traits" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "trait-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-source" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "trait-list" },
});
for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.externalTraits))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (`external-${index}`),
    });
    (trait);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-side internal-traits" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "trait-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trait-source" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "trait-list" },
});
for (const [trait, index] of __VLS_getVForSourceType((__VLS_ctx.internalTraits))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (`internal-${index}`),
    });
    (trait);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-explanation" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "synthesis-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.traitSynthesis);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "talents-potential-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
if (__VLS_ctx.isDev) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.refreshTalentAnalysis) },
        ...{ class: "refresh-btn" },
        title: "重新計算天賦分析",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "talents-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "abilities-display" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "abilities-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "abilities-grid" },
});
for (const [ability, index] of __VLS_getVForSourceType((__VLS_ctx.coreAbilities))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`ability-${index}-${__VLS_ctx.updateKey}`),
        ...{ class: "ability-card" },
        ...{ style: ({ '--ability-color': ability.color }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-icon" },
        ...{ style: ({ backgroundColor: ability.color }) },
    });
    (__VLS_ctx.getAbilityIcon(ability.name));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({
        ...{ class: "ability-name" },
    });
    (ability.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-score" },
    });
    (ability.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-fill" },
        ...{ style: ({
                width: `${ability.value * 10}%`,
                background: `linear-gradient(90deg, ${ability.color}, ${__VLS_ctx.lightenColor(ability.color, 0.3)})`
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ability-level" },
    });
    (__VLS_ctx.getAbilityLevel(ability.value));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "talents-details" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-talents" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "talent-tags" },
});
for (const [talent] of __VLS_getVForSourceType((__VLS_ctx.topTalents))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (talent.name),
        ...{ class: "talent-tag" },
        ...{ class: (`talent-level-${talent.level}`) },
    });
    (talent.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "talent-score" },
    });
    (talent.value);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "potential-areas" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "potential-list" },
});
for (const [suggestion, index] of __VLS_getVForSourceType((__VLS_ctx.potentialSuggestions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (`potential-${index}`),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "suggestion-icon" },
    });
    (suggestion);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "life-lessons-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lessons-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lessons-introduction" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lessons-grid" },
});
for (const [lesson, index] of __VLS_getVForSourceType((__VLS_ctx.lifeLessons))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`lesson-${index}`),
        ...{ class: "lesson-card" },
        ...{ class: (`lesson-priority-${lesson.priority}`) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-icon" },
    });
    (lesson.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-title" },
    });
    (lesson.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-priority" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "priority-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "priority-indicators" },
    });
    for (const [i] of __VLS_getVForSourceType((5))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (i),
            ...{ class: (['priority-dot', { active: i <= lesson.priority }]) },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-description" },
    });
    (lesson.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-guidance" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (lesson.guidance);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "lesson-source" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "source-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "source-detail" },
    });
    (lesson.source);
}
/** @type {__VLS_StyleScopedClasses['trait-deconstruction']} */ ;
/** @type {__VLS_StyleScopedClasses['duality-analysis-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['duality-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['external-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-content']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-source']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-side']} */ ;
/** @type {__VLS_StyleScopedClasses['internal-traits']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-header']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-content']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-source']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['synthesis-text']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-potential-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-container']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-display']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-title']} */ ;
/** @type {__VLS_StyleScopedClasses['abilities-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-info']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-score']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['ability-level']} */ ;
/** @type {__VLS_StyleScopedClasses['talents-details']} */ ;
/** @type {__VLS_StyleScopedClasses['top-talents']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['talent-score']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-areas']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-list']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['life-lessons-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-container']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-introduction']} */ ;
/** @type {__VLS_StyleScopedClasses['lessons-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-card']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-header']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-title']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-label']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-indicators']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-content']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-description']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-guidance']} */ ;
/** @type {__VLS_StyleScopedClasses['lesson-source']} */ ;
/** @type {__VLS_StyleScopedClasses['source-label']} */ ;
/** @type {__VLS_StyleScopedClasses['source-detail']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            updateKey: updateKey,
            isDev: isDev,
            externalTraits: externalTraits,
            internalTraits: internalTraits,
            traitSynthesis: traitSynthesis,
            coreAbilities: coreAbilities,
            topTalents: topTalents,
            potentialSuggestions: potentialSuggestions,
            lifeLessons: lifeLessons,
            getAbilityIcon: getAbilityIcon,
            getAbilityLevel: getAbilityLevel,
            lightenColor: lightenColor,
            refreshTraitAnalysis: refreshTraitAnalysis,
            refreshTalentAnalysis: refreshTalentAnalysis,
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
//# sourceMappingURL=TraitDeconstruction.vue.js.map