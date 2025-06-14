/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';
import PatternAnalysisPanel from './PatternAnalysisPanel.vue';
import MinorStarsPanel from './MinorStarsPanel.vue';
import EmptyPalaceIndicator from './EmptyPalaceIndicator.vue';
import PurpleStarGuideModal from './PurpleStarGuideModal.vue';
import FeatureHintsDisplay from '@/components/FeatureHintsDisplay.vue';
const { t } = useI18n();
const props = withDefaults(defineProps(), {
    chartData: null,
    calculationInfo: null,
    isLoading: false,
    error: null,
    showCyclesDetail: false
});
const emit = defineEmits();
// 響應式資料
const viewMode = ref('detailed');
const displayMode = ref('expanded'); // 保留舊的控制變數，保持向後兼容
const selectedStar = ref(null);
const selectedPalace = ref(null); // 選中的宮位
const showInteractionTips = ref(true); // 顯示互動提示
const showSummary = ref(true); // 顯示簡要解讀
const showGuideModal = ref(false); // 顯示功能指南彈窗
const interpretationMode = ref('comprehensive');
const activeDomain = ref('career');
const activePalaceName = ref('');
// 計算屬性
// 命盤概要解讀
const chartSummary = computed(() => {
    if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces))
        return null;
    // 從命盤資料中提取重要資訊生成簡要解讀
    const mainStars = props.chartData.palaces.flatMap(p => p.stars && Array.isArray(p.stars)
        ? p.stars.filter(s => s.type === 'main' || (s.transformations && s.transformations.length))
        : []);
    const mainStarCounts = {
        '吉': mainStars.filter(s => s.attribute === '吉').length,
        '凶': mainStars.filter(s => s.attribute === '凶').length,
        '中性': mainStars.filter(s => s.attribute === '中性').length
    };
    const hasMingPalaceGoodStars = props.chartData.palaces[props.chartData.mingPalaceIndex]?.stars
        .some(s => s.type === 'main' && s.attribute === '吉');
    const transformationCount = mainStars.filter(s => s.transformations?.length).length;
    // 命盤特徵摘要
    const features = [];
    if (mainStarCounts['吉'] > mainStarCounts['凶']) {
        features.push('吉星較多，整體運勢偏向正面');
    }
    else if (mainStarCounts['凶'] > mainStarCounts['吉']) {
        features.push('凶星較多，人生挑戰較大');
    }
    else {
        features.push('吉凶星均衡，順逆交替');
    }
    if (hasMingPalaceGoodStars) {
        features.push('命宮有吉星入駐，基礎運勢良好');
    }
    if (transformationCount > 3) {
        features.push('四化星豐富，命盤變化較大');
    }
    // 從命宮情況添加特徵
    const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
    if (mingPalace) {
        const mingStars = mingPalace.stars.filter(s => s.type === 'main');
        if (mingStars.length > 2) {
            features.push('命宮聚集多顆主星，命運變化豐富');
        }
        // 檢查命宮是否有特定星曜
        const hasPurpleStar = mingStars.some(s => s.name.includes('紫微'));
        if (hasPurpleStar) {
            features.push('紫微星入命，具有領導才能與權威性');
        }
    }
    // 自動生成命盤摘要
    let generatedSummary = '';
    if (props.chartData.comprehensiveInterpretation?.overallLifePattern) {
        generatedSummary = props.chartData.comprehensiveInterpretation.overallLifePattern;
    }
    else {
        // 當後端未提供解讀時自動生成
        const mingPalaceName = mingPalace?.name || '命宮';
        const fortuneType = mainStarCounts['吉'] > mainStarCounts['凶'] ? '較為順遂' :
            mainStarCounts['凶'] > mainStarCounts['吉'] ? '較多挑戰' : '順逆參半';
        generatedSummary = `此命盤以${mingPalaceName}為中心，整體運勢${fortuneType}。` +
            `命盤中共有${mainStars.length}顆主要星曜，其中吉星${mainStarCounts['吉']}顆，` +
            `凶星${mainStarCounts['凶']}顆。在紫微斗數的十二宮位結構中，` +
            `每個宮位代表人生不同領域，宮位中的星曜組合則揭示了各領域的特質與發展。` +
            `透過分析命宮、財帛宮、官祿宮等關鍵宮位的星曜組合，可進一步了解命主的潛能與挑戰。`;
    }
    return {
        features,
        detailedSummary: generatedSummary
    };
});
const activeDomainAnalysis = computed(() => {
    if (!props.chartData?.domainAnalyses)
        return null;
    return props.chartData.domainAnalyses.find(d => d.domain === activeDomain.value) || null;
});
const activePalaceInterpretation = computed(() => {
    if (!props.chartData?.palaceInterpretations || !activePalaceName.value)
        return null;
    return props.chartData.palaceInterpretations.find(p => p.palaceName === activePalaceName.value) || null;
});
// 十二地支命盤網格佈局 (傳統佈局：逆時針)
const gridLayout = [
    '巳', '午', '未', '申',
    '辰', 'center', 'center', '酉',
    '卯', 'center', 'center', '戌',
    '寅', '丑', '子', '亥'
];
// 地支到索引的映射
const zhiToIndex = {
    '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
    '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};
// 方法
const getPalaceByZhi = (zhiName) => {
    if (!props.chartData || zhiName === 'center')
        return undefined;
    return props.chartData.palaces.find(palace => palace.zhi === zhiName);
};
const getPositionClass = (position, index) => {
    const classes = [`grid-position-${index}`];
    if (position === 'center') {
        classes.push('center-position');
    }
    else {
        classes.push(`zhi-${position}`);
        if (isMingPalace(position))
            classes.push('ming-palace');
        if (isShenPalace(position))
            classes.push('shen-palace');
    }
    return classes.join(' ');
};
const getStarClasses = (star) => {
    const classes = ['star-item', `star-${star.type}`];
    if (star.transformations) {
        star.transformations.forEach(trans => {
            classes.push(`transform-${trans}`);
        });
    }
    return classes;
};
const getStarTooltip = (star) => {
    let tooltip = `${star.name} (${t(`purpleStarChart.starTypes.${star.type}`)})`;
    // 添加亮度資訊
    if (star.brightness) {
        tooltip += ` - 亮度: ${star.brightness}`;
    }
    // 添加星曜屬性
    if (star.attribute) {
        tooltip += ` - 屬性: ${star.attribute}`;
    }
    // 添加四化資訊
    if (star.transformations && star.transformations.length > 0) {
        tooltip += ` - 四化: ${star.transformations.map(t => t).join(', ')}`;
    }
    // 添加描述
    if (star.description) {
        tooltip += `\n${star.description}`;
    }
    return tooltip;
};
const isMingPalace = (zhiName) => {
    if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces))
        return false;
    // 確保 mingPalaceIndex 存在且有效
    if (typeof props.chartData.mingPalaceIndex !== 'number' ||
        props.chartData.mingPalaceIndex < 0 ||
        props.chartData.mingPalaceIndex >= props.chartData.palaces.length) {
        return false;
    }
    const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
    return mingPalace && mingPalace.zhi === zhiName;
};
const isShenPalace = (zhiName) => {
    if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces))
        return false;
    // 確保 shenPalaceIndex 存在且有效
    if (typeof props.chartData.shenPalaceIndex !== 'number' ||
        props.chartData.shenPalaceIndex < 0 ||
        props.chartData.shenPalaceIndex >= props.chartData.palaces.length) {
        return false;
    }
    const shenPalace = props.chartData.palaces[props.chartData.shenPalaceIndex];
    return shenPalace && shenPalace.zhi === zhiName;
};
const getMingPalaceName = () => {
    if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces))
        return '';
    // 確保 mingPalaceIndex 存在且有效
    if (typeof props.chartData.mingPalaceIndex !== 'number' ||
        props.chartData.mingPalaceIndex < 0 ||
        props.chartData.mingPalaceIndex >= props.chartData.palaces.length) {
        return '';
    }
    const mingPalace = props.chartData.palaces[props.chartData.mingPalaceIndex];
    return mingPalace?.name || '';
};
const getShenPalaceName = () => {
    if (!props.chartData || !props.chartData.palaces || !Array.isArray(props.chartData.palaces))
        return '';
    // 確保 shenPalaceIndex 存在且有效
    if (typeof props.chartData.shenPalaceIndex !== 'number' ||
        props.chartData.shenPalaceIndex < 0 ||
        props.chartData.shenPalaceIndex >= props.chartData.palaces.length) {
        return '';
    }
    const shenPalace = props.chartData.palaces[props.chartData.shenPalaceIndex];
    return shenPalace?.name || '';
};
const getDaXianInfo = (zhiName) => {
    if (!props.chartData?.daXian)
        return undefined;
    return props.chartData.daXian.find(cycle => cycle.palaceZhi === zhiName);
};
const getXiaoXianInfo = (zhiName) => {
    if (!props.chartData?.xiaoXian)
        return undefined;
    // 這裡可能需要根據當前年齡或指定年齡來查找小限
    return props.chartData.xiaoXian.find(cycle => cycle.palaceZhi === zhiName);
};
const formatDaXianInfo = (cycle) => {
    return `${cycle.startAge}-${cycle.endAge}${t('purpleStarChart.years')}`;
};
const formatXiaoXianInfo = (cycle) => {
    return `${cycle.age}${t('purpleStarChart.years')}`;
};
const isCurrentCycle = (cycle) => {
    // TODO: 根據目前年齡判斷是否為當前大限
    // 這裡需要計算當前年齡
    return false;
};
const formatBirthDate = () => {
    if (!props.calculationInfo)
        return '';
    return new Date(props.calculationInfo.birthInfo.solarDate).toLocaleDateString();
};
const formatGender = () => {
    if (!props.calculationInfo)
        return '';
    return t(`purpleStarChart.genders.${props.calculationInfo.birthInfo.gender}`);
};
const getStarPalaceName = (star) => {
    if (!props.chartData)
        return '';
    const palace = props.chartData.palaces.find(p => p.index === star.palaceIndex);
    return palace?.name || '';
};
// 檢查是否為空宮（無主星）
const isEmptyPalace = (zhiName) => {
    const palace = getPalaceByZhi(zhiName);
    if (!palace)
        return false;
    const mainStars = palace.stars.filter(star => star.type === 'main');
    return mainStars.length === 0;
};
// 獲取借星資訊
const getBorrowedPalaceInfo = (zhiName) => {
    const palace = getPalaceByZhi(zhiName);
    if (!palace || !isEmptyPalace(zhiName))
        return undefined;
    // 計算對宮索引
    const oppositePalaceIndex = (palace.index + 6) % 12;
    const oppositePalace = props.chartData?.palaces.find(p => p.index === oppositePalaceIndex);
    if (!oppositePalace)
        return undefined;
    const mainStars = oppositePalace.stars.filter(star => star.type === 'main');
    return {
        name: oppositePalace.name,
        mainStars: mainStars
    };
};
const getPalaceFortuneClass = (palace) => {
    if (!palace || !palace.fortuneType)
        return '';
    return `palace-fortune-${palace.fortuneType}`;
};
// 根據宮位名稱返回對應的生命主題說明
const getCycleTheme = (palaceName) => {
    const themes = {
        '命宮': '個人特質與基本運勢',
        '兄弟宮': '手足關係與朋友圈',
        '夫妻宮': '婚姻與伴侶關係',
        '子女宮': '後代與創造力',
        '財帛宮': '財富與物質生活',
        '疾厄宮': '健康與困境',
        '遷移宮': '居所變動與旅行',
        '交友宮': '人際關係與合作',
        '官祿宮': '事業成就與社會地位',
        '田宅宮': '不動產與居家環境',
        '福德宮': '內在幸福與精神追求',
        '父母宮': '長輩關係與根源'
    };
    return themes[palaceName] || '人生特定領域';
};
// 事件處理
// 切換視圖模式：簡潔/詳細
const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'simple' ? 'detailed' : 'simple';
    // 立即應用視圖模式變化
    setTimeout(() => {
        if (viewMode.value === 'detailed') {
            // 詳細模式：顯示所有大限小限資訊
            document.querySelectorAll('.cycles-info').forEach((el) => {
                el.style.display = 'block';
            });
            // 調整網格高度以適應額外內容
            const chartGrid = document.querySelector('.chart-grid');
            if (chartGrid) {
                chartGrid.classList.add('detailed');
            }
        }
        else {
            // 簡潔模式：隱藏大限小限資訊
            document.querySelectorAll('.cycles-info').forEach((el) => {
                el.style.display = 'none';
            });
            // 還原網格高度
            const chartGrid = document.querySelector('.chart-grid');
            if (chartGrid) {
                chartGrid.classList.remove('detailed');
            }
        }
    }, 50);
};
// 切換顯示模式：精簡/展開
const toggleDisplayMode = () => {
    displayMode.value = displayMode.value === 'compact' ? 'expanded' : 'compact';
    // 立即應用顯示模式變化
    setTimeout(() => {
        if (displayMode.value === 'compact') {
            // 精簡檢視：禁用互動，縮減顯示
            document.querySelectorAll('.palace-cell').forEach((el) => {
                el.style.pointerEvents = 'none';
                el.classList.add('compact-mode');
            });
            // 隱藏非必要元素
            document.querySelectorAll('.star-item:not(.star-main)').forEach((el) => {
                el.style.opacity = '0.5';
            });
        }
        else {
            // 展開檢視：啟用互動，完整顯示
            document.querySelectorAll('.palace-cell').forEach((el) => {
                el.style.pointerEvents = 'auto';
                el.classList.remove('compact-mode');
            });
            // 恢復所有星曜顯示
            document.querySelectorAll('.star-item').forEach((el) => {
                el.style.opacity = '1';
            });
        }
    }, 50);
};
const handlePalaceClick = (position) => {
    if (position === 'center')
        return;
    const palace = getPalaceByZhi(position);
    if (palace) {
        selectedPalace.value = palace;
        emit('palaceClick', palace);
    }
};
const handleStarClick = (star) => {
    selectedStar.value = star;
    emit('starClick', star);
};
const closeStarDetail = () => {
    selectedStar.value = null;
};
// 移除匯出功能
// 解讀相關方法
const setInterpretationMode = (mode) => {
    interpretationMode.value = mode;
};
const setActiveDomain = (domain) => {
    activeDomain.value = domain;
};
const setActivePalace = (palaceName) => {
    activePalaceName.value = palaceName;
};
const getDomainDisplayName = (domain) => {
    const displayNames = {
        'career': '事業分析',
        'wealth': '財富分析',
        'marriage': '婚姻分析',
        'health': '健康分析',
        'education': '學業分析',
        'social': '人際分析'
    };
    return displayNames[domain] || domain;
};
const getFortuneDisplayName = (fortune) => {
    const displayNames = {
        'excellent': '極佳',
        'good': '良好',
        'neutral': '中性',
        'challenging': '挑戰',
        'difficult': '困難'
    };
    return displayNames[fortune] || fortune;
};
// 生命週期
onMounted(() => {
    // 設置為最詳細展開模式
    const chartGrid = document.querySelector('.chart-grid');
    // 清除所有深度相關的類
    document.querySelectorAll('.palace-cell').forEach((el) => {
        el.classList.remove('depth-minimal', 'depth-compact', 'depth-standard', 'depth-comprehensive');
        el.classList.add('depth-comprehensive');
    });
    if (chartGrid) {
        chartGrid.classList.remove('simple');
        chartGrid.classList.add('detailed');
    }
    // 顯示所有大限小限資訊
    document.querySelectorAll('.cycles-info').forEach((el) => {
        el.style.display = 'block';
    });
    // 顯示所有星曜
    document.querySelectorAll('.star-item').forEach((el) => {
        el.style.opacity = '1';
    });
    // 啟用宮位互動
    document.querySelectorAll('.palace-cell').forEach((el) => {
        el.style.pointerEvents = 'auto';
    });
});
// 監聽
watch(() => props.chartData, (newData) => {
    if (newData) {
        // 重置選中狀態
        selectedStar.value = null;
        // 設置默認解讀模式
        interpretationMode.value = 'comprehensive';
        // 設置默認領域和宮位
        if (newData.domainAnalyses && newData.domainAnalyses.length > 0) {
            activeDomain.value = newData.domainAnalyses[0].domain;
        }
        if (newData.palaceInterpretations && newData.palaceInterpretations.length > 0) {
            activePalaceName.value = newData.palaceInterpretations[0].palaceName;
        }
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    chartData: null,
    calculationInfo: null,
    isLoading: false,
    error: null,
    showCyclesDetail: false
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-button']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle-button']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['display-toggle-button']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['intro-card']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-content']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-header']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-detailed']} */ ;
/** @type {__VLS_StyleScopedClasses['close-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['show-summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-center']} */ ;
/** @type {__VLS_StyleScopedClasses['shen-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['detailed-transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['star-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['da-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['xiao-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-item']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['star-description']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-info']} */ ;
/** @type {__VLS_StyleScopedClasses['da-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['xiao-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['da-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-header']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-content']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-content']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-content']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-content']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['comprehensive-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-periods']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detailed']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-hints']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-info']} */ ;
/** @type {__VLS_StyleScopedClasses['da-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['xiao-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['purple-star-chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-center']} */ ;
/** @type {__VLS_StyleScopedClasses['center-info']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['star-attribute']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-header']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['star-item']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "purple-star-chart-container" },
});
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('purpleStarChart.loading'));
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('purpleStarChart.loadError'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.$emit('retry');
            } },
        ...{ class: "retry-button" },
    });
    (__VLS_ctx.$t('purpleStarChart.retry'));
}
else if (__VLS_ctx.chartData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-content" },
    });
    if (false) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "debug-info" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartData?.palaces?.length || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartData?.daXian?.length || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartData?.xiaoXian?.length || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartData?.liuNianTaiSui?.length || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartData?.fiveElementsBureau || '未知');
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.$t('purpleStarChart.title'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!!(__VLS_ctx.error))
                    return;
                if (!(__VLS_ctx.chartData))
                    return;
                __VLS_ctx.showGuideModal = true;
            } },
        ...{ class: "guide-button" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "guide-icon" },
    });
    if (__VLS_ctx.showSummary && __VLS_ctx.chartSummary) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-summary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.$t('purpleStarChart.chartSummary'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    if (!(__VLS_ctx.showSummary && __VLS_ctx.chartSummary))
                        return;
                    __VLS_ctx.showSummary = !__VLS_ctx.showSummary;
                } },
            ...{ class: "toggle-summary-button" },
        });
        (__VLS_ctx.$t('purpleStarChart.hideSummary'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-features" },
        });
        for (const [feature, idx] of __VLS_getVForSourceType((__VLS_ctx.chartSummary.features))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`feature-${idx}`),
                ...{ class: "feature-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "feature-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "feature-text" },
            });
            (feature);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-detailed" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.chartSummary.detailedSummary);
        if (__VLS_ctx.showInteractionTips) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interaction-hint" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "hint-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "hint-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "hint-text-container" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "hint-text" },
            });
            (__VLS_ctx.$t('purpleStarChart.interactionTips.comprehensive'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "swipe-hint" },
            });
            (__VLS_ctx.$t('purpleStarChart.interactionTipDesc'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "swipe-arrow" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!(__VLS_ctx.chartData))
                            return;
                        if (!(__VLS_ctx.showSummary && __VLS_ctx.chartSummary))
                            return;
                        if (!(__VLS_ctx.showInteractionTips))
                            return;
                        __VLS_ctx.showInteractionTips = false;
                    } },
                ...{ class: "close-hint" },
            });
        }
    }
    else if (__VLS_ctx.chartSummary) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "show-summary-button-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    if (!!(__VLS_ctx.showSummary && __VLS_ctx.chartSummary))
                        return;
                    if (!(__VLS_ctx.chartSummary))
                        return;
                    __VLS_ctx.showSummary = true;
                } },
            ...{ class: "show-summary-button" },
        });
        (__VLS_ctx.$t('purpleStarChart.showSummary'));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-grid" },
        ...{ class: (__VLS_ctx.viewMode) },
    });
    for (const [position, index] of __VLS_getVForSourceType((__VLS_ctx.gridLayout))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    __VLS_ctx.handlePalaceClick(position);
                } },
            key: (`position-${index}`),
            ...{ class: (['palace-cell', __VLS_ctx.getPositionClass(position, index)]) },
        });
        if (position === 'center') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-center" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            (__VLS_ctx.$t('purpleStarChart.centerPalace'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "center-info" },
            });
            if (__VLS_ctx.chartData.fiveElementsBureau) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.chartData.fiveElementsBureau);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.$t('purpleStarChart.mingPalace'));
            (__VLS_ctx.getMingPalaceName());
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.$t('purpleStarChart.shenPalace'));
            (__VLS_ctx.getShenPalaceName());
        }
        else if (__VLS_ctx.getPalaceByZhi(position)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-content" },
                ...{ class: (__VLS_ctx.getPalaceFortuneClass(__VLS_ctx.getPalaceByZhi(position))) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "palace-name" },
            });
            (__VLS_ctx.getPalaceByZhi(position)?.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "palace-zhi" },
            });
            (position);
            if (__VLS_ctx.isMingPalace(position)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "ming-indicator" },
                });
            }
            if (__VLS_ctx.isShenPalace(position)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "shen-indicator" },
                });
            }
            if (__VLS_ctx.getPalaceByZhi(position)?.fortuneType) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: (['fortune-indicator', `fortune-${__VLS_ctx.getPalaceByZhi(position)?.fortuneType}`]) },
                });
                (__VLS_ctx.getPalaceByZhi(position)?.fortuneType);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stars-container" },
            });
            if (__VLS_ctx.isEmptyPalace(position)) {
                /** @type {[typeof EmptyPalaceIndicator, ]} */ ;
                // @ts-ignore
                const __VLS_0 = __VLS_asFunctionalComponent(EmptyPalaceIndicator, new EmptyPalaceIndicator({
                    borrowedPalace: (__VLS_ctx.getBorrowedPalaceInfo(position)),
                    ...{ class: "empty-palace-indicator" },
                }));
                const __VLS_1 = __VLS_0({
                    borrowedPalace: (__VLS_ctx.getBorrowedPalaceInfo(position)),
                    ...{ class: "empty-palace-indicator" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_0));
            }
            for (const [star] of __VLS_getVForSourceType((__VLS_ctx.getPalaceByZhi(position)?.stars))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isLoading))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!(__VLS_ctx.chartData))
                                return;
                            if (!!(position === 'center'))
                                return;
                            if (!(__VLS_ctx.getPalaceByZhi(position)))
                                return;
                            __VLS_ctx.handleStarClick(star);
                        } },
                    key: (star.name),
                    ...{ class: (__VLS_ctx.getStarClasses(star)) },
                    title: (__VLS_ctx.getStarTooltip(star)),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "star-name" },
                });
                (star.name);
                if (star.brightness) {
                    /** @type {[typeof StarBrightnessIndicator, ]} */ ;
                    // @ts-ignore
                    const __VLS_3 = __VLS_asFunctionalComponent(StarBrightnessIndicator, new StarBrightnessIndicator({
                        brightness: (star.brightness),
                    }));
                    const __VLS_4 = __VLS_3({
                        brightness: (star.brightness),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
                }
                if (star.transformations && star.transformations.length > 0) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: (['transformations', { 'detailed-transformations': __VLS_ctx.viewMode === 'detailed' }]) },
                    });
                    for (const [trans] of __VLS_getVForSourceType((star.transformations))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            key: (trans),
                            ...{ class: (`transformation-${trans}`) },
                        });
                        (trans);
                    }
                }
                if (star.attribute) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: (['star-attribute', `attribute-${star.attribute}`]) },
                    });
                    (star.attribute);
                }
                if (star.type === 'minor') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "star-type-badge minor" },
                    });
                }
            }
            if (__VLS_ctx.viewMode === 'detailed') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "feature-hints" },
                });
                /** @type {[typeof FeatureHintsDisplay, ]} */ ;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent(FeatureHintsDisplay, new FeatureHintsDisplay({
                    palace: (__VLS_ctx.getPalaceByZhi(position)),
                    position: (position),
                    isEmpty: (__VLS_ctx.isEmptyPalace(position)),
                    borrowedInfo: (__VLS_ctx.getBorrowedPalaceInfo(position)),
                }));
                const __VLS_7 = __VLS_6({
                    palace: (__VLS_ctx.getPalaceByZhi(position)),
                    position: (position),
                    isEmpty: (__VLS_ctx.isEmptyPalace(position)),
                    borrowedInfo: (__VLS_ctx.getBorrowedPalaceInfo(position)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            }
            if (__VLS_ctx.viewMode === 'detailed') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "cycles-info" },
                });
                if (__VLS_ctx.getDaXianInfo(position)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "da-xian-info" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                    (__VLS_ctx.formatDaXianInfo(__VLS_ctx.getDaXianInfo(position)));
                }
                if (__VLS_ctx.getXiaoXianInfo(position)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "xiao-xian-info" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                    (__VLS_ctx.formatXiaoXianInfo(__VLS_ctx.getXiaoXianInfo(position)));
                }
            }
        }
    }
    if (__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "interpretation-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "interpretation-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.$t('purpleStarChart.interpretation') || '命盤解讀');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "interpretation-tabs" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    if (!(__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses))
                        return;
                    __VLS_ctx.setInterpretationMode('comprehensive');
                } },
            ...{ class: ({ active: __VLS_ctx.interpretationMode === 'comprehensive' }) },
            ...{ class: "tab-button" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    if (!(__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses))
                        return;
                    __VLS_ctx.setInterpretationMode('domain');
                } },
            ...{ class: ({ active: __VLS_ctx.interpretationMode === 'domain' }) },
            ...{ class: "tab-button" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.chartData))
                        return;
                    if (!(__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses))
                        return;
                    __VLS_ctx.setInterpretationMode('palace');
                } },
            ...{ class: ({ active: __VLS_ctx.interpretationMode === 'palace' }) },
            ...{ class: "tab-button" },
        });
        if (__VLS_ctx.interpretationMode === 'comprehensive') {
            /** @type {[typeof PatternAnalysisPanel, ]} */ ;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(PatternAnalysisPanel, new PatternAnalysisPanel({
                patterns: (__VLS_ctx.chartData.keyPatterns),
                ...{ class: "interpretation-panel" },
            }));
            const __VLS_10 = __VLS_9({
                patterns: (__VLS_ctx.chartData.keyPatterns),
                ...{ class: "interpretation-panel" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        }
        if (__VLS_ctx.interpretationMode === 'comprehensive') {
            /** @type {[typeof MinorStarsPanel, ]} */ ;
            // @ts-ignore
            const __VLS_12 = __VLS_asFunctionalComponent(MinorStarsPanel, new MinorStarsPanel({
                palaces: (__VLS_ctx.chartData.palaces),
                ...{ class: "interpretation-panel" },
            }));
            const __VLS_13 = __VLS_12({
                palaces: (__VLS_ctx.chartData.palaces),
                ...{ class: "interpretation-panel" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        }
        if (__VLS_ctx.interpretationMode === 'comprehensive' && __VLS_ctx.chartData.comprehensiveInterpretation) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comprehensive-interpretation" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.chartData.comprehensiveInterpretation.overallLifePattern);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.chartData.comprehensiveInterpretation.lifePurpose);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.chartData.comprehensiveInterpretation.spiritualGrowthPath);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [strength, idx] of __VLS_getVForSourceType((__VLS_ctx.chartData.comprehensiveInterpretation.uniqueStrengths))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (`strength-${idx}`),
                });
                (strength);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [challenge, idx] of __VLS_getVForSourceType((__VLS_ctx.chartData.comprehensiveInterpretation.potentialChallenges))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (`challenge-${idx}`),
                });
                (challenge);
            }
            if (__VLS_ctx.chartData.comprehensiveInterpretation.keyCrossPalacePatterns && __VLS_ctx.chartData.comprehensiveInterpretation.keyCrossPalacePatterns.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "interpretation-card" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [pattern, idx] of __VLS_getVForSourceType((__VLS_ctx.chartData.comprehensiveInterpretation.keyCrossPalacePatterns))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`pattern-${idx}`),
                    });
                    (pattern);
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "lifecycle-grid" },
            });
            for (const [cycle, idx] of __VLS_getVForSourceType((__VLS_ctx.chartData.comprehensiveInterpretation.majorLifeCycles))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (`cycle-${idx}`),
                    ...{ class: "lifecycle-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "lifecycle-period" },
                });
                (cycle.period);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "lifecycle-content" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "lifecycle-theme" },
                });
                (cycle.theme);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "lifecycle-focus" },
                });
                (cycle.focus);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "interpretation-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [pattern, idx] of __VLS_getVForSourceType((__VLS_ctx.chartData.comprehensiveInterpretation.keyCrossPalacePatterns))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (`pattern-${idx}`),
                });
                (pattern);
            }
        }
        if (__VLS_ctx.interpretationMode === 'domain' && __VLS_ctx.chartData.domainAnalyses) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "domain-analysis" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "domain-tabs" },
            });
            for (const [domain] of __VLS_getVForSourceType((__VLS_ctx.chartData.domainAnalyses))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isLoading))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!(__VLS_ctx.chartData))
                                return;
                            if (!(__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses))
                                return;
                            if (!(__VLS_ctx.interpretationMode === 'domain' && __VLS_ctx.chartData.domainAnalyses))
                                return;
                            __VLS_ctx.setActiveDomain(domain.domain);
                        } },
                    key: (domain.domain),
                    ...{ class: ({ active: __VLS_ctx.activeDomain === domain.domain }) },
                    ...{ class: "domain-tab-button" },
                });
                (__VLS_ctx.getDomainDisplayName(domain.domain));
            }
            if (__VLS_ctx.activeDomainAnalysis) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-content" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-header" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (__VLS_ctx.getDomainDisplayName(__VLS_ctx.activeDomainAnalysis.domain));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: (`fortune-badge fortune-${__VLS_ctx.activeDomainAnalysis.overallFortune}`) },
                });
                (__VLS_ctx.getFortuneDisplayName(__VLS_ctx.activeDomainAnalysis.overallFortune));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-insights" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [insight, idx] of __VLS_getVForSourceType((__VLS_ctx.activeDomainAnalysis.keyInsights))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`insight-${idx}`),
                    });
                    (insight);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-influences" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [influence, idx] of __VLS_getVForSourceType((__VLS_ctx.activeDomainAnalysis.starInfluences))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`influence-${idx}`),
                    });
                    (influence);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-actions" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [action, idx] of __VLS_getVForSourceType((__VLS_ctx.activeDomainAnalysis.recommendedActions))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`action-${idx}`),
                    });
                    (action);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "domain-periods" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "periods-column" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [period, idx] of __VLS_getVForSourceType((__VLS_ctx.activeDomainAnalysis.periods.favorable))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`favorable-${idx}`),
                    });
                    (period);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "periods-column" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [period, idx] of __VLS_getVForSourceType((__VLS_ctx.activeDomainAnalysis.periods.challenging))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`challenging-${idx}`),
                    });
                    (period);
                }
            }
        }
        if (__VLS_ctx.interpretationMode === 'palace' && __VLS_ctx.chartData.palaceInterpretations) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-interpretation" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "palace-tabs" },
            });
            for (const [interp] of __VLS_getVForSourceType((__VLS_ctx.chartData.palaceInterpretations))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isLoading))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!(__VLS_ctx.chartData))
                                return;
                            if (!(__VLS_ctx.chartData.comprehensiveInterpretation || __VLS_ctx.chartData.domainAnalyses))
                                return;
                            if (!(__VLS_ctx.interpretationMode === 'palace' && __VLS_ctx.chartData.palaceInterpretations))
                                return;
                            __VLS_ctx.setActivePalace(interp.palaceName);
                        } },
                    key: (interp.palaceName),
                    ...{ class: ({ active: __VLS_ctx.activePalaceName === interp.palaceName }) },
                    ...{ class: "palace-tab-button" },
                });
                (interp.palaceName);
            }
            if (__VLS_ctx.activePalaceInterpretation) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-content" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (__VLS_ctx.activePalaceInterpretation.palaceName);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "trait-tags" },
                });
                for (const [trait, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.personalityTraits))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        key: (`trait-${idx}`),
                        ...{ class: "trait-tag" },
                    });
                    (trait);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [strength, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.strengthAreas))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`strength-${idx}`),
                    });
                    (strength);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [challenge, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.challengeAreas))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`challenge-${idx}`),
                    });
                    (challenge);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [theme, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.lifeThemes))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`theme-${idx}`),
                    });
                    (theme);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [influence, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.keyStarInfluences))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`influence-${idx}`),
                    });
                    (influence);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "palace-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
                for (const [advice, idx] of __VLS_getVForSourceType((__VLS_ctx.activePalaceInterpretation.advice))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                        key: (`advice-${idx}`),
                    });
                    (advice);
                }
            }
        }
    }
    if (__VLS_ctx.showCyclesDetail && __VLS_ctx.chartData.daXian) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cycles-detail" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cycles-detail-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.$t('purpleStarChart.majorCycles'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cycles-explanation" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-text" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cycles-grid" },
        });
        for (const [cycle] of __VLS_getVForSourceType((__VLS_ctx.chartData.daXian))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`daxian-${cycle.startAge}`),
                ...{ class: "cycle-item" },
                ...{ class: ({ current: __VLS_ctx.isCurrentCycle(cycle) }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "cycle-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "cycle-age" },
            });
            (cycle.startAge);
            (cycle.endAge);
            (__VLS_ctx.$t('purpleStarChart.years'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "cycle-palace" },
            });
            (cycle.palaceName);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "cycle-zhi" },
            });
            (cycle.palaceZhi);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "cycle-description" },
            });
            (cycle.palaceName);
            (__VLS_ctx.getCycleTheme(cycle.palaceName));
        }
    }
    if (__VLS_ctx.selectedStar) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.closeStarDetail) },
            ...{ class: "star-detail-modal" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "modal-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.selectedStar.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeStarDetail) },
            ...{ class: "close-button" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "modal-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.$t('purpleStarChart.starType'));
        (__VLS_ctx.$t(`purpleStarChart.starTypes.${__VLS_ctx.selectedStar.type}`));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.$t('purpleStarChart.palace'));
        (__VLS_ctx.getStarPalaceName(__VLS_ctx.selectedStar));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "star-attributes-section" },
        });
        if (__VLS_ctx.selectedStar.attribute) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "attribute-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (`attribute-tag attribute-${__VLS_ctx.selectedStar.attribute}`) },
            });
            (__VLS_ctx.selectedStar.attribute);
        }
        if (__VLS_ctx.selectedStar.propertyType) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "attribute-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "attribute-tag" },
            });
            (__VLS_ctx.selectedStar.propertyType);
        }
        if (__VLS_ctx.selectedStar.element) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "attribute-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "attribute-tag" },
            });
            (__VLS_ctx.selectedStar.element);
        }
        if (__VLS_ctx.selectedStar.strength !== undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "attribute-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "attribute-tag" },
            });
            (__VLS_ctx.selectedStar.strength);
        }
        if (__VLS_ctx.selectedStar.description) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "star-description" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.selectedStar.description);
        }
        if (__VLS_ctx.selectedStar.transformations && __VLS_ctx.selectedStar.transformations.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (__VLS_ctx.$t('purpleStarChart.transformations'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
            for (const [trans] of __VLS_getVForSourceType((__VLS_ctx.selectedStar.transformations))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                    key: (trans),
                });
                (__VLS_ctx.$t(`purpleStarChart.transformationTypes.${trans}`));
            }
        }
    }
    /** @type {[typeof PurpleStarGuideModal, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(PurpleStarGuideModal, new PurpleStarGuideModal({
        ...{ 'onClose': {} },
        visible: (__VLS_ctx.showGuideModal),
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClose': {} },
        visible: (__VLS_ctx.showGuideModal),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_18;
    let __VLS_19;
    let __VLS_20;
    const __VLS_21 = {
        onClose: (...[$event]) => {
            if (!!(__VLS_ctx.isLoading))
                return;
            if (!!(__VLS_ctx.error))
                return;
            if (!(__VLS_ctx.chartData))
                return;
            __VLS_ctx.showGuideModal = false;
        }
    };
    var __VLS_17;
}
/** @type {__VLS_StyleScopedClasses['purple-star-chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['error-state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['debug-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-button']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-header']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-content']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-features']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-item']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-text']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-detailed']} */ ;
/** @type {__VLS_StyleScopedClasses['interaction-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text-container']} */ ;
/** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['swipe-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['swipe-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['close-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['show-summary-button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['show-summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-center']} */ ;
/** @type {__VLS_StyleScopedClasses['center-info']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-content']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-header']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-name']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['ming-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['shen-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['fortune-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-container']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-palace-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['star-name']} */ ;
/** @type {__VLS_StyleScopedClasses['transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['detailed-transformations']} */ ;
/** @type {__VLS_StyleScopedClasses['star-attribute']} */ ;
/** @type {__VLS_StyleScopedClasses['star-type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['minor']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-hints']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-info']} */ ;
/** @type {__VLS_StyleScopedClasses['da-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['xiao-xian-info']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-header']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['comprehensive-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-item']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-period']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-content']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-theme']} */ ;
/** @type {__VLS_StyleScopedClasses['lifecycle-focus']} */ ;
/** @type {__VLS_StyleScopedClasses['interpretation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-analysis']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-content']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-header']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-insights']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-influences']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['domain-periods']} */ ;
/** @type {__VLS_StyleScopedClasses['periods-column']} */ ;
/** @type {__VLS_StyleScopedClasses['periods-column']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-interpretation']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-tab-button']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-content']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['palace-section']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['info-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['info-text']} */ ;
/** @type {__VLS_StyleScopedClasses['cycles-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-item']} */ ;
/** @type {__VLS_StyleScopedClasses['current']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-age']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-palace']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-zhi']} */ ;
/** @type {__VLS_StyleScopedClasses['cycle-description']} */ ;
/** @type {__VLS_StyleScopedClasses['star-detail-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['star-attributes-section']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-item']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-item']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-item']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-item']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['star-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StarBrightnessIndicator: StarBrightnessIndicator,
            PatternAnalysisPanel: PatternAnalysisPanel,
            MinorStarsPanel: MinorStarsPanel,
            EmptyPalaceIndicator: EmptyPalaceIndicator,
            PurpleStarGuideModal: PurpleStarGuideModal,
            FeatureHintsDisplay: FeatureHintsDisplay,
            viewMode: viewMode,
            selectedStar: selectedStar,
            showInteractionTips: showInteractionTips,
            showSummary: showSummary,
            showGuideModal: showGuideModal,
            interpretationMode: interpretationMode,
            activeDomain: activeDomain,
            activePalaceName: activePalaceName,
            chartSummary: chartSummary,
            activeDomainAnalysis: activeDomainAnalysis,
            activePalaceInterpretation: activePalaceInterpretation,
            gridLayout: gridLayout,
            getPalaceByZhi: getPalaceByZhi,
            getPositionClass: getPositionClass,
            getStarClasses: getStarClasses,
            getStarTooltip: getStarTooltip,
            isMingPalace: isMingPalace,
            isShenPalace: isShenPalace,
            getMingPalaceName: getMingPalaceName,
            getShenPalaceName: getShenPalaceName,
            getDaXianInfo: getDaXianInfo,
            getXiaoXianInfo: getXiaoXianInfo,
            formatDaXianInfo: formatDaXianInfo,
            formatXiaoXianInfo: formatXiaoXianInfo,
            isCurrentCycle: isCurrentCycle,
            getStarPalaceName: getStarPalaceName,
            isEmptyPalace: isEmptyPalace,
            getBorrowedPalaceInfo: getBorrowedPalaceInfo,
            getPalaceFortuneClass: getPalaceFortuneClass,
            getCycleTheme: getCycleTheme,
            handlePalaceClick: handlePalaceClick,
            handleStarClick: handleStarClick,
            closeStarDetail: closeStarDetail,
            setInterpretationMode: setInterpretationMode,
            setActiveDomain: setActiveDomain,
            setActivePalace: setActivePalace,
            getDomainDisplayName: getDomainDisplayName,
            getFortuneDisplayName: getFortuneDisplayName,
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
//# sourceMappingURL=PurpleStarChartDisplay.vue.js.map