/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
// 預設深度設定
const defaultDepth = 'standard';
// 模組顏色映射 (無障礙色彩方案)
const moduleColors = {
    purpleStar: 'linear-gradient(135deg, #8E4585 0%, #6A0DAD 100%)',
    bazi: 'linear-gradient(135deg, #D2691E 0%, #8B4513 100%)',
    transformationStars: 'linear-gradient(135deg, #4169E1 0%, #1E4D8C 100%)',
    integrated: 'linear-gradient(135deg, #3CB371 0%, #2E8B57 100%)'
};
// 模組對比顏色 (用於邊框和高亮)
const moduleContrastColors = {
    purpleStar: '#D8BFD8', // 淺紫色
    bazi: '#DEB887', // 淺駝色
    transformationStars: '#87CEEB', // 淺藍色
    integrated: '#90EE90' // 淺綠色
};
// 模組文字顏色
const moduleTextColors = {
    purpleStar: '#FFFFFF', // 白色
    bazi: '#FFFFFF', // 白色
    transformationStars: '#FFFFFF', // 白色
    integrated: '#FFFFFF' // 白色
};
// 響應式狀態
const isCollapsed = ref(true);
const activeModule = ref('purpleStar');
const moduleDepths = ref({
    purpleStar: defaultDepth,
    bazi: defaultDepth,
    transformationStars: defaultDepth,
    integrated: defaultDepth
});
// 可用的顯示深度選項
const availableDepths = ['minimal', 'compact', 'standard', 'comprehensive'];
// 計算當前模組的顯示深度
const getModuleDepth = (module) => {
    return moduleDepths.value[module] || defaultDepth;
};
// 提供給外部的顯示深度
const displayDepth = computed(() => getModuleDepth(activeModule.value));
// 方法: 切換收起/展開
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    // 播放彈性動畫
    if (!isCollapsed.value) {
        const panel = document.querySelector('.global-display-panel');
        if (panel) {
            panel.classList.add('bounce-animation');
            setTimeout(() => {
                panel?.classList.remove('bounce-animation');
            }, 500);
        }
    }
};
// 方法: 設置當前模組
const setActiveModule = (module) => {
    activeModule.value = module;
    // 從 sessionStorage 讀取深度設定
    const savedDepth = sessionStorage.getItem(`${module}-display-depth`);
    if (savedDepth && availableDepths.includes(savedDepth)) {
        moduleDepths.value[module] = savedDepth;
    }
    // 觸發動畫效果
    const buttons = document.querySelectorAll('.module-button');
    buttons.forEach(button => {
        button.classList.remove('rotate-animation');
    });
    const activeButton = document.querySelector(`.module-button.active`);
    if (activeButton) {
        activeButton.classList.add('rotate-animation');
    }
    // 無障礙宣告 - 通知螢幕閱讀器
    const announcement = document.getElementById('a11y-announcement');
    if (announcement) {
        announcement.textContent = `已選擇${getModuleLabel(module)}模組`;
    }
};
// 方法: 設置顯示深度
const setDisplayDepth = (depth) => {
    moduleDepths.value[activeModule.value] = depth;
    // 保存到 sessionStorage
    try {
        sessionStorage.setItem(`${activeModule.value}-display-depth`, depth);
        // 觸發自定義事件，通知其他組件顯示深度已更改
        const event = new CustomEvent('display-depth-changed', {
            detail: { module: activeModule.value, depth }
        });
        window.dispatchEvent(event);
        // 額外發送 module-changed 事件以確保兼容性和同步
        const compatEvent = new CustomEvent('module-changed', {
            detail: { module: activeModule.value, depth }
        });
        window.dispatchEvent(compatEvent);
        console.log(`更新${getModuleLabel(activeModule.value)}的顯示深度為: ${depth}`);
    }
    catch (error) {
        console.warn('無法保存顯示深度設定:', error);
    }
    // 播放按鈕動畫
    const depthButton = document.querySelector(`.depth-button.active`);
    if (depthButton) {
        depthButton.classList.add('pulse-animation');
        setTimeout(() => {
            depthButton.classList.remove('pulse-animation');
        }, 500);
    }
};
// 獲取模組顯示名稱
const getModuleLabel = (module) => {
    const labels = {
        purpleStar: '紫微斗數',
        bazi: '八字命盤',
        transformationStars: '四化飛星',
        integrated: '整合分析'
    };
    return labels[module] || '未知模組';
};
// 預設標籤文字
const getDefaultLabel = (depth) => {
    const labels = {
        'minimal': '簡要預覽',
        'compact': '精簡檢視',
        'standard': '標準解讀',
        'comprehensive': '深度分析'
    };
    return labels[depth] || depth;
};
// 預設描述文字
const getDefaultDescription = (depth) => {
    const descriptions = {
        'minimal': '最簡潔的命盤展示，僅呈現基本框架',
        'compact': '顯示主要星曜和基本效應，快速了解命盤特點',
        'standard': '完整展示星曜資訊和效應，深入解析命盤結構',
        'comprehensive': '全面詳盡的命盤分析'
    };
    return descriptions[depth] || '';
};
// 監聽路由變化
onMounted(() => {
    // 初始化: 從 sessionStorage 讀取各模組的顯示深度設定
    Object.keys(moduleDepths.value).forEach(module => {
        const moduleType = module;
        const savedDepth = sessionStorage.getItem(`${moduleType}-display-depth`);
        if (savedDepth && availableDepths.includes(savedDepth)) {
            moduleDepths.value[moduleType] = savedDepth;
        }
    });
    // 監聽自定義事件，接收組件發出的顯示模式變更通知
    window.addEventListener('module-changed', ((event) => {
        if (event.detail && event.detail.module) {
            setActiveModule(event.detail.module);
        }
    }));
    // 添加無障礙宣告區域
    const announcement = document.createElement('div');
    announcement.id = 'a11y-announcement';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    // 添加鍵盤事件處理
    document.addEventListener('keydown', handleKeyboardNavigation);
});
// 鍵盤無障礙導航
const handleKeyboardNavigation = (event) => {
    // 僅當面板展開時處理
    if (isCollapsed.value)
        return;
    // 確認焦點元素
    const focusedElement = document.activeElement;
    // 處理 Escape 鍵收起面板
    if (event.key === 'Escape') {
        toggleCollapse();
        event.preventDefault();
        return;
    }
    // 處理模組按鈕導航
    if (focusedElement?.classList.contains('module-button')) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const buttons = Array.from(document.querySelectorAll('.module-button'));
            const currentIndex = buttons.indexOf(focusedElement);
            if (currentIndex !== -1) {
                const newIndex = event.key === 'ArrowLeft'
                    ? (currentIndex - 1 + buttons.length) % buttons.length
                    : (currentIndex + 1) % buttons.length;
                buttons[newIndex].focus();
                event.preventDefault();
            }
        }
    }
    // 處理深度按鈕導航
    if (focusedElement?.classList.contains('depth-button')) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            const buttons = Array.from(document.querySelectorAll('.depth-button'));
            const currentIndex = buttons.indexOf(focusedElement);
            if (currentIndex !== -1) {
                const newIndex = event.key === 'ArrowUp'
                    ? (currentIndex - 1 + buttons.length) % buttons.length
                    : (currentIndex + 1) % buttons.length;
                buttons[newIndex].focus();
                event.preventDefault();
            }
        }
    }
};
// 導出組件方法供父組件使用
const __VLS_exposed = {
    setActiveModule,
    displayDepth
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-description']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-content']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['bounce-animation']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-animation']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-animation']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "slide-fade",
}));
const __VLS_2 = __VLS_1({
    name: "slide-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "global-display-panel" },
    ...{ class: ({ 'collapsed': __VLS_ctx.isCollapsed }) },
    'aria-label': (__VLS_ctx.isCollapsed ? __VLS_ctx.$t('display.tooltips.panelCollapsed') || '點擊展開全域顯示設定' : __VLS_ctx.$t('display.tooltips.panelExpanded') || '全域顯示設定面板'),
    title: (__VLS_ctx.isCollapsed ? __VLS_ctx.$t('display.tooltips.collapsedHint') || '點擊展開全域顯示設定\n快速調整命理模組顯示深度' : ''),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-content" },
    ...{ style: ({ background: __VLS_ctx.moduleColors[__VLS_ctx.activeModule] }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-header" },
});
if (!__VLS_ctx.isCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.$t('display.globalSettings') || '顯示設定');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleCollapse) },
    ...{ class: "collapse-button" },
    title: (__VLS_ctx.isCollapsed ? __VLS_ctx.$t('display.tooltips.expand') || '展開設定面板' : __VLS_ctx.$t('display.tooltips.collapse') || '收起設定面板'),
    'aria-label': (__VLS_ctx.isCollapsed ? __VLS_ctx.$t('display.tooltips.expand') || '展開設定面板' : __VLS_ctx.$t('display.tooltips.collapse') || '收起設定面板'),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "icon" },
    ...{ class: (__VLS_ctx.isCollapsed ? 'icon-settings' : 'icon-collapse') },
});
(__VLS_ctx.isCollapsed ? '⚙️' : '←');
if (!__VLS_ctx.isCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-selector" },
    });
    for (const [color, module] of __VLS_getVForSourceType((__VLS_ctx.moduleColors))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isCollapsed))
                        return;
                    __VLS_ctx.setActiveModule(module);
                } },
            key: (module),
            ...{ class: "module-button" },
            ...{ class: ({ active: __VLS_ctx.activeModule === module }) },
            ...{ style: ({ backgroundColor: __VLS_ctx.activeModule === module ? color : 'transparent', borderColor: color }) },
            title: (__VLS_ctx.$t('display.tooltips.selectModule') || '選擇模組：切換命理分析類型'),
            'aria-label': (`${__VLS_ctx.$t('display.tooltips.selectModule') || '選擇模組'}: ${__VLS_ctx.getModuleLabel(module)}`),
        });
        (__VLS_ctx.getModuleLabel(module));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "depth-selector" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    (__VLS_ctx.$t('display.depthSelector') || '顯示深度');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "depth-buttons" },
    });
    for (const [depth] of __VLS_getVForSourceType((__VLS_ctx.availableDepths))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isCollapsed))
                        return;
                    __VLS_ctx.setDisplayDepth(depth);
                } },
            key: (depth),
            ...{ class: "depth-button" },
            ...{ class: ({
                    active: __VLS_ctx.getModuleDepth(__VLS_ctx.activeModule) === depth,
                    'depth-minimal': depth === 'minimal',
                    'depth-compact': depth === 'compact',
                    'depth-standard': depth === 'standard',
                    'depth-comprehensive': depth === 'comprehensive'
                }) },
            title: (__VLS_ctx.$t('display.tooltips.adjustDepth') || '調整深度：控制資訊詳細程度'),
            'aria-label': (`${__VLS_ctx.$t('display.tooltips.adjustDepth') || '調整深度'}: ${__VLS_ctx.$t(`display.displayDepth.${depth}`) || __VLS_ctx.getDefaultLabel(depth)}`),
        });
        (__VLS_ctx.$t(`display.displayDepth.${depth}`) || __VLS_ctx.getDefaultLabel(depth));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "depth-description" },
    });
    (__VLS_ctx.$t(`display.displayDepthDesc.${__VLS_ctx.getModuleDepth(__VLS_ctx.activeModule)}`) || __VLS_ctx.getDefaultDescription(__VLS_ctx.getModuleDepth(__VLS_ctx.activeModule)));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['global-display-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-content']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
/** @type {__VLS_StyleScopedClasses['module-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['module-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-button']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-minimal']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-standard']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-comprehensive']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            moduleColors: moduleColors,
            isCollapsed: isCollapsed,
            activeModule: activeModule,
            availableDepths: availableDepths,
            getModuleDepth: getModuleDepth,
            toggleCollapse: toggleCollapse,
            setActiveModule: setActiveModule,
            setDisplayDepth: setDisplayDepth,
            getModuleLabel: getModuleLabel,
            getDefaultLabel: getDefaultLabel,
            getDefaultDescription: getDefaultDescription,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GlobalDisplayModePanel.vue.js.map