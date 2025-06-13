import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Connection } from '@element-plus/icons-vue';
import { useDisplayMode } from '@/composables/useDisplayMode';
import { useSharedLayeredReading } from '@/composables/useSharedLayeredReading';
import UnifiedLayeredController from '@/components/UnifiedLayeredController.vue';
// 是否啟用共享分層閱讀
const enableSharedReading = ref(true);
// 使用共享分層閱讀系統（如果啟用）
const sharedLayeredReading = enableSharedReading.value
    ? useSharedLayeredReading('transformationStars')
    : null;
// 使用傳統顯示模式 composable（作為後備）
const { displayMode: localDisplayMode, mapDepthToMode } = useDisplayMode('transformationStars');
const emit = defineEmits();
const props = withDefaults(defineProps(), {
    mingGan: '',
    displayMode: 'standard',
    transformationFlows: () => ({}),
    transformationCombinations: () => [],
    multiLayerEnergies: () => ({})
});
// 響應式狀態
const isAnimationActive = ref(false);
const isDetailView = ref(true);
const selectedLayer = ref('total');
const animationInterval = ref(null);
// 新增移動端檢測和數據相關屬性
const isMobile = ref(window.innerWidth <= 768);
const layeredData = computed(() => null); // 待實現分層數據
const dataCompleteness = computed(() => {
    let score = 0;
    if (!props.chartData)
        return 0;
    // 核心數據：命宮天干是計算四化的基礎
    if (props.mingGan && props.mingGan.length > 0) {
        score += 40;
    }
    // 核心數據：命盤宮位和星曜資訊
    const hasTransformedStars = props.chartData.palaces?.some(p => p.stars.some(s => s.transformations && s.transformations.length > 0));
    if (hasTransformedStars) {
        score += 30;
    }
    // 輔助數據：特殊組合，用於深度分析
    if (props.transformationCombinations && props.transformationCombinations.length > 0) {
        score += 15;
    }
    // 輔助數據：多層次能量，用於深度分析
    if (props.multiLayerEnergies && Object.keys(props.multiLayerEnergies).length > 0) {
        score += 15;
    }
    return Math.min(score, 100); // 確保最高為 100
}); // 四化飛星數據完整度
// 處理層級變化
const handleLevelChanged = (level) => {
    console.log('四化飛星層級變化:', level);
    // TODO: 實現層級變化邏輯
};
// 計算當前層級標籤
const currentSyncLevel = computed(() => {
    if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
        const levelLabels = {
            'summary': '簡要',
            'compact': '精簡',
            'standard': '標準',
            'deep': '深度'
        };
        return levelLabels[sharedLayeredReading.effectiveReadingLevel.value] || '標準';
    }
    return '標準';
});
// 映射表定義（在外部定義以供重複使用）
const levelToModeMap = {
    'summary': 'minimal',
    'compact': 'compact',
    'standard': 'standard',
    'deep': 'comprehensive'
};
// 計算顯示模式
const displayMode = computed({
    get: () => {
        if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
            // 將 ReadingLevel 映射到 DisplayMode
            return levelToModeMap[sharedLayeredReading.effectiveReadingLevel.value] || 'standard';
        }
        // 後備方案：使用 props 或本地狀態
        return props.displayMode || localDisplayMode.value;
    },
    set: (newMode) => {
        if (!enableSharedReading.value) {
            localDisplayMode.value = newMode;
            emit('update:displayMode', newMode);
        }
        // 如果啟用同步，則忽略設置（由紫微斗數控制）
    }
});
// 監聽紫微斗數層級變化（如果啟用同步）
if (enableSharedReading.value && sharedLayeredReading?.effectiveReadingLevel) {
    watch(sharedLayeredReading.effectiveReadingLevel, (newLevel) => {
        if (newLevel) {
            console.log(`四化飛星同步新層級: ${newLevel}`);
            // 強制更新詳細視圖狀態
            const newMode = levelToModeMap[newLevel] || 'standard';
            isDetailView.value = newMode === 'standard' || newMode === 'comprehensive';
        }
    }, { immediate: true });
}
// 傳統同步方式（為了向下相容）
watch(() => props.displayMode, (newMode) => {
    if (newMode && !enableSharedReading.value) {
        localDisplayMode.value = newMode;
        console.log('TransformationStarsDisplay: props displayMode 已同步', newMode);
    }
}, { immediate: true });
// 根據顯示模式設置詳細程度
watch(displayMode, (newMode) => {
    if (newMode === 'minimal' || newMode === 'compact') {
        isDetailView.value = false;
    }
    else if (newMode === 'standard' || newMode === 'comprehensive') {
        isDetailView.value = true;
    }
    // 將顯示模式變更記錄到控制台並向上傳遞更新
    console.log('四化飛星顯示模式已更新:', newMode, '詳細視圖:', isDetailView.value);
    // 只有在未啟用共享分層時才發送更新事件
    if (!enableSharedReading.value) {
        emit('update:displayMode', newMode);
    }
}, { immediate: true });
// 處理事件監聽
// 移除重複的事件處理，useDisplayMode 已經處理了這些邏輯
// 計算屬性
const transformedStars = computed(() => {
    const result = [];
    // 遍歷所有宮位尋找帶有四化的星曜
    if (props.chartData && props.chartData.palaces) {
        for (const palace of props.chartData.palaces) {
            for (const star of palace.stars) {
                if (star.transformations && star.transformations.length > 0) {
                    result.push(star);
                }
            }
        }
    }
    return result;
});
const combinations = computed(() => {
    return props.transformationCombinations || [];
});
const hasMultiLayerData = computed(() => {
    return Object.keys(props.multiLayerEnergies || {}).length > 0;
});
// 顯示深度相關方法（保留供將來使用）
// const setDisplayDepth = (depth: string) => {
//   const newMode = mapDepthToMode(depth);
//   displayMode.value = newMode;
//   console.log('四化飛星設置顯示深度:', newMode);
// };
// 動畫控制方法
const toggleAnimation = () => {
    isAnimationActive.value = !isAnimationActive.value;
    // 如果開啟動畫，設置定時器
    if (isAnimationActive.value) {
        if (animationInterval.value) {
            clearInterval(animationInterval.value);
        }
        // 每5秒切換顯示層次
        animationInterval.value = window.setInterval(() => {
            const layers = ['base', 'daXian', 'liuNian', 'total'];
            const currentIndex = layers.indexOf(selectedLayer.value);
            const nextIndex = (currentIndex + 1) % layers.length;
            selectedLayer.value = layers[nextIndex];
        }, 5000);
    }
    else {
        // 停止動畫
        if (animationInterval.value) {
            clearInterval(animationInterval.value);
            animationInterval.value = null;
        }
    }
};
// const toggleView = () => {
//   isDetailView.value = !isDetailView.value;
// };
const getPalaceNameByIndex = (index) => {
    const palace = props.chartData.palaces.find(p => p.index === index);
    return palace ? `${palace.name}(${palace.zhi})` : '未知宮位';
};
const getTransformationEffect = (star) => {
    if (!star.transformations || star.transformations.length === 0) {
        return '';
    }
    // 四化效應說明
    const effects = {
        '祿': '增加財帛和福分',
        '權': '增加權威和地位',
        '科': '增加學業和榮譽',
        '忌': '帶來阻礙和衝突'
    };
    return star.transformations.map(t => effects[t] || t).join('，');
};
const getEnergyValue = (palaceIndex) => {
    const flow = props.transformationFlows[palaceIndex];
    if (!flow)
        return '0';
    return flow.energyScore.toString();
};
const getEnergyBarStyle = (palaceIndex) => {
    const flow = props.transformationFlows[palaceIndex];
    if (!flow)
        return { width: '0%', backgroundColor: '#e9ecef' };
    // 能量分數範圍通常是 -10 到 +10
    const baseWidth = 50; // 基礎寬度為50%
    const score = flow.energyScore;
    const width = baseWidth + score * 5; // 每點能量增加或減少5%寬度
    // 確保寬度在合理範圍內
    const clampedWidth = Math.max(5, Math.min(100, width));
    // 根據能量值設置顏色
    let color = '#e9ecef'; // 默認灰色
    if (score > 0) {
        color = score >= 5 ? '#28a745' : '#5cb85c'; // 強正面為深綠，輕正面為淺綠
    }
    else if (score < 0) {
        color = score <= -5 ? '#dc3545' : '#f5c6cb'; // 強負面為紅色，輕負面為粉紅
    }
    return {
        width: `${clampedWidth}%`,
        backgroundColor: color
    };
};
const getEnergyClass = (palaceIndex, layer = '') => {
    if (layer) {
        let energy = 0;
        switch (layer) {
            case 'base':
                energy = getLayerEnergy(palaceIndex, 'baseEnergy');
                break;
            case 'daXian':
                energy = getLayerEnergy(palaceIndex, 'daXianEnergy');
                break;
            case 'liuNian':
                energy = getLayerEnergy(palaceIndex, 'liuNianEnergy');
                break;
            case 'total':
                energy = getLayerEnergy(palaceIndex, 'totalEnergy');
                break;
            default:
                energy = 0;
        }
        if (energy > 0)
            return 'positive-energy';
        if (energy < 0)
            return 'negative-energy';
        return 'neutral-energy';
    }
    else {
        const flow = props.transformationFlows[palaceIndex];
        if (!flow)
            return 'neutral-energy';
        const score = flow.energyScore;
        if (score > 0)
            return 'positive-energy';
        if (score < 0)
            return 'negative-energy';
        return 'neutral-energy';
    }
};
const getTransformedStarsInPalace = (palace) => {
    return palace.stars.filter(star => star.transformations && star.transformations.length > 0);
};
const getLayerEnergy = (palaceIndex, energyType) => {
    const energy = props.multiLayerEnergies[palaceIndex];
    if (!energy)
        return 0;
    return energy[energyType] || 0;
};
const getLayerInterpretation = (palaceIndex) => {
    const energy = props.multiLayerEnergies[palaceIndex];
    if (!energy)
        return '';
    return energy.interpretation || '';
};
// 獲取能量最大的宮位
const getMaxEnergyPalace = () => {
    let maxEnergy = -Infinity;
    let maxEnergyPalace = '';
    // 遍歷所有宮位，找出能量最大的
    for (const palaceIndex in props.multiLayerEnergies) {
        const energy = props.multiLayerEnergies[palaceIndex];
        if (energy && typeof energy.totalEnergy === 'number' && energy.totalEnergy > maxEnergy) {
            maxEnergy = energy.totalEnergy;
            maxEnergyPalace = `${energy.palaceName} (${maxEnergy > 0 ? '+' : ''}${maxEnergy})`;
        }
    }
    return maxEnergyPalace || '無顯著能量宮位';
};
// 獲取能量綜合摘要
const getEnergySummary = () => {
    let positiveCount = 0;
    let negativeCount = 0;
    let totalCount = 0;
    let totalEnergy = 0;
    // 計算各類能量宮位數量
    for (const palaceIndex in props.multiLayerEnergies) {
        const energy = props.multiLayerEnergies[palaceIndex];
        if (energy && typeof energy.totalEnergy === 'number') {
            totalCount++;
            totalEnergy += energy.totalEnergy;
            if (energy.totalEnergy > 0) {
                positiveCount++;
            }
            else if (energy.totalEnergy < 0) {
                negativeCount++;
            }
        }
    }
    // 根據能量分佈生成摘要
    if (totalCount === 0) {
        return '無法分析能量分佈';
    }
    const energyBalance = positiveCount > negativeCount
        ? '整體能量偏正向，有利於發展'
        : (positiveCount < negativeCount
            ? '整體能量偏負向，需注意化解阻礙'
            : '正負能量平衡');
    const averageEnergy = totalCount > 0 ? (totalEnergy / totalCount).toFixed(1) : '0';
    const averageEnergyNumber = parseFloat(averageEnergy);
    return `命盤中有 ${positiveCount} 個正向能量宮位，${negativeCount} 個負向能量宮位。${energyBalance}。平均能量值: ${averageEnergyNumber > 0 ? '+' : ''}${averageEnergy}。`;
};
// 生命週期鉤子
onMounted(() => {
    console.log('TransformationStarsDisplay: 組件已掛載');
    console.log('TransformationStarsDisplay: Props數據檢查', {
        chartData: !!props.chartData,
        mingGan: props.mingGan,
        transformationFlows: Object.keys(props.transformationFlows || {}).length,
        transformationCombinations: (props.transformationCombinations || []).length,
        multiLayerEnergies: Object.keys(props.multiLayerEnergies || {}).length,
        displayMode: displayMode.value,
        enableSharedReading: enableSharedReading.value
    });
    // 檢查分層系統狀態
    if (enableSharedReading.value && sharedLayeredReading) {
        console.log('TransformationStarsDisplay: 共享分層閱讀狀態', {
            effectiveReadingLevel: sharedLayeredReading.effectiveReadingLevel?.value,
            isPrimaryModule: sharedLayeredReading.isPrimaryModule?.value,
            syncStatusDescription: sharedLayeredReading.syncStatusDescription?.value
        });
    }
});
// 組件卸載時清理
onUnmounted(() => {
    // 確保清除定時器
    if (animationInterval.value) {
        clearInterval(animationInterval.value);
        animationInterval.value = null;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    mingGan: '',
    displayMode: 'standard',
    transformationFlows: () => ({}),
    transformationCombinations: () => [],
    multiLayerEnergies: () => ({})
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-button']} */ ;
/** @type {__VLS_StyleScopedClasses['view-button']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-header']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-flows']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-combinations']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['layered-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-description']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-active']} */ ;
/** @type {__VLS_StyleScopedClasses['negative-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-active']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-active']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-active']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-row']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['table-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['table-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['flows-container']} */ ;
/** @type {__VLS_StyleScopedClasses['combinations-list']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['control-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "transformation-stars-display" },
    ...{ class: ({ 'animation-active': __VLS_ctx.isAnimationActive }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "display-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
if (__VLS_ctx.enableSharedReading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sync-status" },
    });
    const __VLS_0 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        type: "success",
        size: "small",
        effect: "plain",
    }));
    const __VLS_2 = __VLS_1({
        type: "success",
        size: "small",
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.Connection;
    /** @type {[typeof __VLS_components.Connection, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    var __VLS_3;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "sync-description" },
    });
    (__VLS_ctx.currentSyncLevel);
}
if (!__VLS_ctx.enableSharedReading) {
    /** @type {[typeof UnifiedLayeredController, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(UnifiedLayeredController, new UnifiedLayeredController({
        ...{ 'onLevelChanged': {} },
        ...{ 'onToggleAnimation': {} },
        moduleType: ('transformationStars'),
        layeredData: (__VLS_ctx.layeredData),
        dataCompleteness: (__VLS_ctx.dataCompleteness),
        enableSync: (false),
        isMobile: (__VLS_ctx.isMobile),
        isCompact: (true),
        showToolbar: (false),
        modelValue: (__VLS_ctx.displayMode),
        ...{ class: "transformation-controller" },
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onLevelChanged': {} },
        ...{ 'onToggleAnimation': {} },
        moduleType: ('transformationStars'),
        layeredData: (__VLS_ctx.layeredData),
        dataCompleteness: (__VLS_ctx.dataCompleteness),
        enableSync: (false),
        isMobile: (__VLS_ctx.isMobile),
        isCompact: (true),
        showToolbar: (false),
        modelValue: (__VLS_ctx.displayMode),
        ...{ class: "transformation-controller" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_15;
    let __VLS_16;
    let __VLS_17;
    const __VLS_18 = {
        onLevelChanged: (__VLS_ctx.handleLevelChanged)
    };
    const __VLS_19 = {
        onToggleAnimation: (__VLS_ctx.toggleAnimation)
    };
    var __VLS_14;
}
if (__VLS_ctx.isDetailView) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explanation-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explanation-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explanation-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-lu" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-quan" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-ke" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-ji" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-lu" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-quan" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-ke" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "t-ji" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "transformation-chart" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.mingGan);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stars-table" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
for (const [star] of __VLS_getVForSourceType((__VLS_ctx.transformedStars))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (star.name),
        ...{ class: "table-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell star-name" },
    });
    (star.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell transformations" },
    });
    for (const [trans] of __VLS_getVForSourceType((star.transformations))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (trans),
            ...{ class: (`transformation transformation-${trans}`) },
        });
        (trans);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell palace-name" },
    });
    (__VLS_ctx.getPalaceNameByIndex(star.palaceIndex));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell effect" },
    });
    (__VLS_ctx.getTransformationEffect(star));
}
if (__VLS_ctx.isDetailView) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "transformation-flows" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flows-container" },
    });
    for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaces))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`flow-${index}`),
            ...{ class: "flow-item" },
            ...{ class: (__VLS_ctx.getEnergyClass(palace.index)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-palace" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "palace-name" },
        });
        (palace.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "palace-zhi" },
        });
        (palace.zhi);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-energy" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "energy-bar" },
            ...{ style: (__VLS_ctx.getEnergyBarStyle(palace.index)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "energy-value" },
        });
        (__VLS_ctx.getEnergyValue(palace.index));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flow-stars" },
        });
        for (const [star] of __VLS_getVForSourceType((__VLS_ctx.getTransformedStarsInPalace(palace)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`flow-star-${star.name}`),
                ...{ class: "flow-star" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "star-name" },
            });
            (star.name);
            for (const [trans] of __VLS_getVForSourceType((star.transformations))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    key: (`flow-trans-${trans}`),
                    ...{ class: (`trans-indicator trans-${trans}`) },
                });
                (trans);
            }
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "transformation-combinations" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
if (__VLS_ctx.combinations.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "combinations-list" },
    });
    for (const [combo, index] of __VLS_getVForSourceType((__VLS_ctx.combinations))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`combo-${index}`),
            ...{ class: "combination-item" },
            ...{ class: (`significance-${combo.significance}`) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "combo-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "combo-name" },
        });
        (combo.combination);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "combo-location" },
        });
        (combo.palaceName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "combo-effect" },
        });
        (combo.effect);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "no-combinations-message" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "info-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "message-detail" },
    });
}
if (__VLS_ctx.isDetailView && __VLS_ctx.hasMultiLayerData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "layered-effects" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "energy-tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "info-tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tooltip-content" },
    });
    if (__VLS_ctx.selectedLayer === 'total') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "energy-summary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "energy-highlight" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "highlight-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "highlight-value" },
        });
        (__VLS_ctx.getMaxEnergyPalace());
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "energy-description" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.getEnergySummary());
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "layer-selector" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDetailView && __VLS_ctx.hasMultiLayerData))
                    return;
                __VLS_ctx.selectedLayer = 'base';
            } },
        ...{ class: ({ active: __VLS_ctx.selectedLayer === 'base' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDetailView && __VLS_ctx.hasMultiLayerData))
                    return;
                __VLS_ctx.selectedLayer = 'daXian';
            } },
        ...{ class: ({ active: __VLS_ctx.selectedLayer === 'daXian' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDetailView && __VLS_ctx.hasMultiLayerData))
                    return;
                __VLS_ctx.selectedLayer = 'liuNian';
            } },
        ...{ class: ({ active: __VLS_ctx.selectedLayer === 'liuNian' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isDetailView && __VLS_ctx.hasMultiLayerData))
                    return;
                __VLS_ctx.selectedLayer = 'total';
            } },
        ...{ class: ({ active: __VLS_ctx.selectedLayer === 'total' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "layer-content" },
    });
    if (__VLS_ctx.selectedLayer === 'base') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "layer-palaces" },
        });
        for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaces))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`base-${index}`),
                ...{ class: "layer-palace" },
                ...{ class: (__VLS_ctx.getEnergyClass(palace.index, 'base')) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-header" },
            });
            (palace.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-energy" },
            });
            (__VLS_ctx.getLayerEnergy(palace.index, 'baseEnergy'));
        }
    }
    else if (__VLS_ctx.selectedLayer === 'daXian') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "layer-palaces" },
        });
        for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaces))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`daxian-${index}`),
                ...{ class: "layer-palace" },
                ...{ class: (__VLS_ctx.getEnergyClass(palace.index, 'daXian')) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-header" },
            });
            (palace.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-energy" },
            });
            (__VLS_ctx.getLayerEnergy(palace.index, 'daXianEnergy'));
        }
    }
    else if (__VLS_ctx.selectedLayer === 'liuNian') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "layer-palaces" },
        });
        for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaces))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`liunian-${index}`),
                ...{ class: "layer-palace" },
                ...{ class: (__VLS_ctx.getEnergyClass(palace.index, 'liuNian')) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-header" },
            });
            (palace.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-energy" },
            });
            (__VLS_ctx.getLayerEnergy(palace.index, 'liuNianEnergy'));
        }
    }
    else if (__VLS_ctx.selectedLayer === 'total') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "layer-palaces" },
        });
        for (const [palace, index] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaces))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`total-${index}`),
                ...{ class: "layer-palace" },
                ...{ class: (__VLS_ctx.getEnergyClass(palace.index, 'total')) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-header" },
            });
            (palace.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-energy" },
            });
            (__VLS_ctx.getLayerEnergy(palace.index, 'totalEnergy'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-interp" },
            });
            (__VLS_ctx.getLayerInterpretation(palace.index));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['transformation-stars-display']} */ ;
/** @type {__VLS_StyleScopedClasses['animation-active']} */ ;
/** @type {__VLS_StyleScopedClasses['display-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-status']} */ ;
/** @type {__VLS_StyleScopedClasses['sync-description']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-controller']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['t-lu']} */ ;
/** @type {__VLS_StyleScopedClasses['t-quan']} */ ;
/** @type {__VLS_StyleScopedClasses['t-ke']} */ ;
/** @type {__VLS_StyleScopedClasses['t-ji']} */ ;
/** @type {__VLS_StyleScopedClasses['t-lu']} */ ;
/** @type {__VLS_StyleScopedClasses['t-quan']} */ ;
/** @type {__VLS_StyleScopedClasses['t-ke']} */ ;
/** @type {__VLS_StyleScopedClasses['t-ji']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['table-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['effect']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-flows']} */ ;
/** @type {__VLS_StyleScopedClasses['flows-container']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-item']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-value']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-star']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['transformation-combinations']} */ ;
/** @type {__VLS_StyleScopedClasses['combinations-list']} */ ;
/** @type {__VLS_StyleScopedClasses['combination-item']} */ ;
/** @type {__VLS_StyleScopedClasses['combo-header']} */ ;
/** @type {__VLS_StyleScopedClasses['combo-name']} */ ;
/** @type {__VLS_StyleScopedClasses['combo-location']} */ ;
/** @type {__VLS_StyleScopedClasses['combo-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['no-combinations-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-container']} */ ;
/** @type {__VLS_StyleScopedClasses['info-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['layered-effects']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['info-tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip-content']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-value']} */ ;
/** @type {__VLS_StyleScopedClasses['energy-description']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palaces']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-energy']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-interp']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Connection: Connection,
            UnifiedLayeredController: UnifiedLayeredController,
            enableSharedReading: enableSharedReading,
            isAnimationActive: isAnimationActive,
            isDetailView: isDetailView,
            selectedLayer: selectedLayer,
            isMobile: isMobile,
            layeredData: layeredData,
            dataCompleteness: dataCompleteness,
            handleLevelChanged: handleLevelChanged,
            currentSyncLevel: currentSyncLevel,
            displayMode: displayMode,
            transformedStars: transformedStars,
            combinations: combinations,
            hasMultiLayerData: hasMultiLayerData,
            toggleAnimation: toggleAnimation,
            getPalaceNameByIndex: getPalaceNameByIndex,
            getTransformationEffect: getTransformationEffect,
            getEnergyValue: getEnergyValue,
            getEnergyBarStyle: getEnergyBarStyle,
            getEnergyClass: getEnergyClass,
            getTransformedStarsInPalace: getTransformedStarsInPalace,
            getLayerEnergy: getLayerEnergy,
            getLayerInterpretation: getLayerInterpretation,
            getMaxEnergyPalace: getMaxEnergyPalace,
            getEnergySummary: getEnergySummary,
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
//# sourceMappingURL=TransformationStarsDisplay.vue.js.map