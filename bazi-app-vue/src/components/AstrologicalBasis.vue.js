/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
const props = defineProps();
// 響應式資料更新標記
const updateKey = ref(0);
// 五行對應顏色
const elementColors = {
    '金': '#FFD700',
    '木': '#32CD32',
    '水': '#4169E1',
    '火': '#FF4500',
    '土': '#8B4513'
};
// 五行分析
const fiveElements = computed(() => {
    const elements = {
        '金': 0,
        '木': 0,
        '水': 0,
        '火': 0,
        '土': 0
    };
    // 統計各宮位星曜的五行屬性
    if (props.chartData?.palaces) {
        console.log('AstrologicalBasis: 五行分析 - 宮位數量:', props.chartData.palaces.length);
        props.chartData.palaces.forEach(palace => {
            palace.stars?.forEach(star => {
                if (star.element && elements.hasOwnProperty(star.element)) {
                    elements[star.element]++;
                }
            });
        });
        console.log('AstrologicalBasis: 五行統計結果:', elements);
    }
    else {
        console.log('AstrologicalBasis: 五行分析 - 沒有命盤宮位資料');
    }
    const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
    return Object.entries(elements).map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: elementColors[name]
    }));
});
// 主導五行
const dominantElement = computed(() => {
    return fiveElements.value.reduce((max, current) => current.count > max.count ? current : max);
});
// 五行平衡度
const elementBalance = computed(() => {
    const counts = fiveElements.value.map(e => e.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const variance = max - min;
    if (variance <= 1)
        return '極佳';
    if (variance <= 2)
        return '良好';
    if (variance <= 3)
        return '一般';
    if (variance <= 4)
        return '偏差';
    return '失衡';
});
// 五行特質解析
const fiveElementsInterpretation = computed(() => {
    const interpretations = [];
    const dominant = dominantElement.value;
    if (dominant.count > 0) {
        switch (dominant.name) {
            case '金':
                interpretations.push('金行主導：性格堅毅，做事有原則，重視規則和秩序');
                break;
            case '木':
                interpretations.push('木行主導：富有生命力，善於成長和創新，適應力強');
                break;
            case '水':
                interpretations.push('水行主導：思維靈活，直覺敏銳，善於變通和適應');
                break;
            case '火':
                interpretations.push('火行主導：熱情積極，行動力強，具有領導魅力');
                break;
            case '土':
                interpretations.push('土行主導：穩重踏實，重視安全感，具有包容性');
                break;
        }
    }
    // 分析五行平衡狀況
    const balance = elementBalance.value;
    switch (balance) {
        case '極佳':
            interpretations.push('五行分佈均衡，個性發展全面，適應力強');
            break;
        case '良好':
            interpretations.push('五行分佈相對均衡，個性穩定，發展潛力大');
            break;
        case '一般':
            interpretations.push('五行分佈基本平衡，需要注意弱勢五行的補強');
            break;
        case '偏差':
            interpretations.push('五行分佈不均，建議透過後天努力來平衡發展');
            break;
        case '失衡':
            interpretations.push('五行分佈失衡，需要特別注意個性的調整和發展');
            break;
    }
    return interpretations;
});
// 關鍵格局分析
const keyPatterns = computed(() => {
    const patterns = [];
    if (!props.chartData?.palaces) {
        console.log('AstrologicalBasis: 格局分析 - 沒有命盤宮位資料');
        return patterns;
    }
    console.log('AstrologicalBasis: 格局分析 - 宮位數量:', props.chartData.palaces.length);
    // 分析格局
    const palaces = props.chartData.palaces;
    // 檢查紫府夾命格
    const mingPalace = palaces.find(p => p.name === '命宮');
    if (mingPalace) {
        const hasZiwei = mingPalace.stars?.some(s => s.name === '紫微');
        const hasTianfu = mingPalace.stars?.some(s => s.name === '天府');
        if (hasZiwei && hasTianfu) {
            patterns.push({
                name: '紫府夾命格',
                description: '紫微天府同宮於命宮，為帝王格局，主貴氣天成。',
                effects: [
                    '具有天生的領導氣質和權威感',
                    '容易得到他人的尊重和信任',
                    '事業發展潛力大，適合管理職位'
                ],
                involvedPalaces: ['命宮'],
                strength: 5,
                type: 'auspicious'
            });
        }
    }
    // 檢查左右夾命格
    const leftRight = palaces.some(p => p.stars?.some(s => s.name === '左輔') &&
        p.stars?.some(s => s.name === '右弼'));
    if (leftRight) {
        patterns.push({
            name: '左右夹命格',
            description: '左輔右弼拱照命宮，主得貴人相助。',
            effects: [
                '一生貴人運佳，容易得到幫助',
                '人際關係良好，善於合作',
                '事業上容易得到支持和提攜'
            ],
            involvedPalaces: ['命宮'],
            strength: 4,
            type: 'auspicious'
        });
    }
    // 檢查文昌文曲格
    const wenchangWenqu = palaces.some(p => p.stars?.some(s => s.name === '文昌') &&
        p.stars?.some(s => s.name === '文曲'));
    if (wenchangWenqu) {
        patterns.push({
            name: '文昌文曲格',
            description: '文昌文曲同宮或拱照，主文才出眾。',
            effects: [
                '學習能力強，文筆佳',
                '適合從事文化、教育、傳媒工作',
                '考試運佳，學業成就突出'
            ],
            involvedPalaces: ['命宮'],
            strength: 4,
            type: 'auspicious'
        });
    }
    // 檢查火鈴夾命格（不吉格局）
    const fireRing = palaces.some(p => p.stars?.some(s => s.name === '火星') &&
        p.stars?.some(s => s.name === '鈴星'));
    if (fireRing) {
        patterns.push({
            name: '火鈴夾命格',
            description: '火星鈴星夾命，主性格急躁，容易衝動。',
            effects: [
                '性格較為急躁，容易發脾氣',
                '做事衝動，需要學會控制情緒',
                '適合從事需要行動力的工作'
            ],
            involvedPalaces: ['命宮'],
            strength: 3,
            type: 'inauspicious'
        });
    }
    return patterns;
});
// 獲取格局樣式類別
const getPatternClass = (pattern) => {
    return `pattern-${pattern.type}`;
};
// 獲取格局圖示
const getPatternIcon = (pattern) => {
    const icons = {
        'auspicious': '🌟',
        'inauspicious': '⚠️',
        'special': '🔮'
    };
    return icons[pattern.type] || '🔸';
};
// 獲取格局類型文字
const getPatternType = (pattern) => {
    const types = {
        'auspicious': '吉格',
        'inauspicious': '凶格',
        'special': '特殊格局'
    };
    return types[pattern.type] || '一般格局';
};
// 生辰資訊
const birthInfo = computed(() => {
    // 這裡應該從 props 中獲取生辰資料
    // 暫時使用假資料
    return '1990年1月1日 12:00 (示例)';
});
// 分析步驟
const analysisSteps = [
    {
        title: '基礎資料處理',
        description: '根據生辰八字和出生地點計算真太陽時，確定準確的起盤時間'
    },
    {
        title: '星盤建構',
        description: '排列十二宮位，安星定位，計算各星曜的位置和亮度'
    },
    {
        title: '格局識別',
        description: '分析星曜組合，識別特殊格局和重要配置'
    },
    {
        title: '四化飛星',
        description: '計算生年四化，分析能量流動和轉化關係'
    },
    {
        title: '綜合判斷',
        description: '結合各項因素，生成個人化的命理分析報告'
    }
];
// 報告生成時間
const generationTime = computed(() => {
    return new Date().toLocaleString('zh-TW');
});
// 監聽命盤資料變化
watch(() => props.chartData, (newChartData, oldChartData) => {
    console.log('AstrologicalBasis: 監聽到 chartData 變化');
    console.log('新資料存在:', !!newChartData);
    console.log('新資料宮位數:', newChartData?.palaces?.length || 0);
    console.log('舊資料存在:', !!oldChartData);
    console.log('舊資料宮位數:', oldChartData?.palaces?.length || 0);
    // 更寬鬆的更新條件
    if (newChartData && newChartData.palaces && newChartData.palaces.length > 0) {
        console.log('AstrologicalBasis: 資料有效，開始更新');
        updateKey.value++;
        console.log('AstrologicalBasis: updateKey 已更新為', updateKey.value);
    }
    else {
        console.log('AstrologicalBasis: 資料無效，跳過更新');
    }
}, { deep: true, immediate: true });
// 監聽全域命盤更新事件
const handleGlobalChartUpdate = (event) => {
    console.log('AstrologicalBasis: 收到全域命盤更新事件', event.detail);
    updateKey.value++; // 強制更新所有計算屬性
};
// 添加全域事件監聽器
if (typeof window !== 'undefined') {
    window.addEventListener('purple-star-chart-updated', handleGlobalChartUpdate);
    window.addEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate);
}
// 在五行分析中使用更新標記以確保響應性
const fiveElementsWithReactivity = computed(() => {
    // 強制響應更新標記變化
    const _ = updateKey.value;
    return fiveElements.value;
});
const keyPatternsWithReactivity = computed(() => {
    // 強制響應更新標記變化  
    const _ = updateKey.value;
    return keyPatterns.value;
});
// 生命週期鉤子
onMounted(() => {
    console.log('AstrologicalBasis: 組件掛載，初始化完成');
    console.log('掛載時 chartData:', props.chartData);
    console.log('掛載時 palaces 數量:', props.chartData?.palaces?.length || 0);
    // 檢查資料內容
    if (props.chartData?.palaces) {
        console.log('宮位列表:', props.chartData.palaces.map(p => p.name));
        // 檢查星曜的五行屬性
        const starsWithElements = props.chartData.palaces.flatMap(palace => palace.stars?.filter(star => star.element) || []);
        console.log('有五行屬性的星曜:', starsWithElements.length);
    }
});
// 組件卸載時清除事件監聽器
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('purple-star-chart-updated', handleGlobalChartUpdate);
        window.removeEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate);
        console.log('AstrologicalBasis: 已清除全域事件監聽器');
    }
});
// 手動刷新分析
const refreshAnalysis = () => {
    console.log('AstrologicalBasis: 手動刷新分析');
    updateKey.value++;
    // 通知其他組件手動刷新事件
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('basis-analysis-refreshed', {
            detail: {
                component: 'AstrologicalBasis',
                timestamp: Date.now(),
                source: 'manual-refresh'
            }
        }));
    }
};
// 調試函數：輸出當前資料結構
const logCurrentDataStructure = () => {
    console.log('=== AstrologicalBasis 當前資料結構 ===');
    console.log('命盤資料:', props.chartData);
    console.log('五行分析:', fiveElementsWithReactivity.value);
    console.log('主導五行:', dominantElement.value);
    console.log('五行平衡度:', elementBalance.value);
    console.log('關鍵格局:', keyPatternsWithReactivity.value);
    console.log('=====================================');
};
// 在全域暴露調試函數（開發環境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.debugAstrologicalBasis = logCurrentDataStructure;
    window.refreshAstrologicalBasis = refreshAnalysis;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['astrological-basis']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['parameters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-container']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
/** @type {__VLS_StyleScopedClasses['process-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "astrological-basis" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "five-elements-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-chart" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "element-bars" },
});
for (const [element] of __VLS_getVForSourceType((__VLS_ctx.fiveElementsWithReactivity))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (element.name),
        ...{ class: "element-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-label" },
    });
    (element.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-fill" },
        ...{ style: ({
                width: `${element.percentage}%`,
                backgroundColor: element.color
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "element-value" },
    });
    (element.count);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-analysis" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dominant-element" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.dominantElement.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "element-balance" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.elementBalance);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "five-elements-bureau" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.chartData.fiveElementsBureau || '未知');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "elements-interpretation" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "interpretation-list" },
});
for (const [interpretation, index] of __VLS_getVForSourceType((__VLS_ctx.fiveElementsInterpretation))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (index),
    });
    (interpretation);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "key-patterns-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "patterns-container" },
});
if (__VLS_ctx.keyPatternsWithReactivity.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "patterns-grid" },
    });
    for (const [pattern, index] of __VLS_getVForSourceType((__VLS_ctx.keyPatternsWithReactivity))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`pattern-${index}`),
            ...{ class: "pattern-card" },
            ...{ class: (__VLS_ctx.getPatternClass(pattern)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-icon" },
        });
        (__VLS_ctx.getPatternIcon(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-name" },
        });
        (pattern.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-type" },
        });
        (__VLS_ctx.getPatternType(pattern));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-description" },
        });
        (pattern.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-effects" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [effect, idx] of __VLS_getVForSourceType((pattern.effects))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (idx),
            });
            (effect);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-palaces" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "palace-tags" },
        });
        for (const [palace] of __VLS_getVForSourceType((pattern.involvedPalaces))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (palace),
                ...{ class: "palace-tag" },
            });
            (palace);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pattern-strength" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "strength-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "strength-bars" },
        });
        for (const [i] of __VLS_getVForSourceType((5))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (i),
                ...{ class: (['strength-bar', { active: i <= pattern.strength }]) },
            });
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-patterns" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-patterns-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "systems-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "system-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "system-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "system-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameters-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameter-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-value" },
});
(__VLS_ctx.birthInfo);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameter-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameter-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "parameter-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "param-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "process-steps" },
});
for (const [step, index] of __VLS_getVForSourceType((__VLS_ctx.analysisSteps))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "process-step" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-number" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-title" },
    });
    (step.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-description" },
    });
    (step.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimers" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "disclaimer-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "disclaimer-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "disclaimer-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "disclaimer-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "methodology-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generation-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-value" },
});
(__VLS_ctx.generationTime);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-value" },
});
/** @type {__VLS_StyleScopedClasses['astrological-basis']} */ ;
/** @type {__VLS_StyleScopedClasses['five-elements-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-container']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['element-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['element-label']} */ ;
/** @type {__VLS_StyleScopedClasses['element-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['element-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['element-value']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dominant-element']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['element-balance']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['five-elements-bureau']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['elements-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-list']} */ ;
/** @type {__VLS_StyleScopedClasses['key-patterns-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-container']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-type']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-description']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-strength']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-label']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['strength-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns']} */ ;
/** @type {__VLS_StyleScopedClasses['no-patterns-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-container']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-content']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['systems-list']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['system-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['system-info']} */ ;
/** @type {__VLS_StyleScopedClasses['system-name']} */ ;
/** @type {__VLS_StyleScopedClasses['system-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['system-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['system-info']} */ ;
/** @type {__VLS_StyleScopedClasses['system-name']} */ ;
/** @type {__VLS_StyleScopedClasses['system-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['system-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['system-info']} */ ;
/** @type {__VLS_StyleScopedClasses['system-name']} */ ;
/** @type {__VLS_StyleScopedClasses['system-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parameters-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['parameter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-label']} */ ;
/** @type {__VLS_StyleScopedClasses['param-value']} */ ;
/** @type {__VLS_StyleScopedClasses['parameter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-label']} */ ;
/** @type {__VLS_StyleScopedClasses['param-value']} */ ;
/** @type {__VLS_StyleScopedClasses['parameter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-label']} */ ;
/** @type {__VLS_StyleScopedClasses['param-value']} */ ;
/** @type {__VLS_StyleScopedClasses['parameter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['param-label']} */ ;
/** @type {__VLS_StyleScopedClasses['param-value']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['process-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['process-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-description']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimers']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['disclaimer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['methodology-card']} */ ;
/** @type {__VLS_StyleScopedClasses['generation-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            dominantElement: dominantElement,
            elementBalance: elementBalance,
            fiveElementsInterpretation: fiveElementsInterpretation,
            getPatternClass: getPatternClass,
            getPatternIcon: getPatternIcon,
            getPatternType: getPatternType,
            birthInfo: birthInfo,
            analysisSteps: analysisSteps,
            generationTime: generationTime,
            fiveElementsWithReactivity: fiveElementsWithReactivity,
            keyPatternsWithReactivity: keyPatternsWithReactivity,
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
//# sourceMappingURL=AstrologicalBasis.vue.js.map