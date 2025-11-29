import { ref, computed, watch } from 'vue';
import { useLayeredReading } from '@/composables/useLayeredReading';
import { ReadingLevel } from '@/types/layeredReading';
import type { ReadingLevel as ReadingLevelType } from '@/types/layeredReading';

// 全域共享狀態
const purpleStarReadingLevel = ref<ReadingLevel>(ReadingLevel.STANDARD);
const isInitialized = ref(false);

/**
 * 紫微斗數和四化飛星共享的分層閱讀管理
 * 紫微斗數為主控，四化飛星自動同步
 */
export function useSharedLayeredReading(
  moduleType: 'purpleStar' | 'transformationStars',
) {
  const {
    readingState,
    userPreferences,
    currentBreakpoint,
    availableLevels,
    currentLevelConfig,
    canUpgrade,
    canDowngrade,
    switchToLevel,
    upgradeLevel,
    downgradeLevel,
    autoSelectOptimalLevel,
    updateLayeredData,
    saveUserPreferences,
    resetToDefaults,
  } = useLayeredReading();

  // 初始化共享狀態
  if (!isInitialized.value) {
    // 從 sessionStorage 初始化或使用預設值
    const savedLevel = sessionStorage.getItem(
      'purple-star-reading-level',
    ) as ReadingLevel;
    if (savedLevel && Object.values(ReadingLevel).includes(savedLevel)) {
      purpleStarReadingLevel.value = savedLevel;
    } else {
      purpleStarReadingLevel.value = ReadingLevel.STANDARD;
    }
    isInitialized.value = true;
  }

  // 計算當前有效的閱讀層級
  const effectiveReadingLevel = computed({
    get: () => {
      // 四化飛星始終跟隨紫微斗數的設定
      if (moduleType === 'transformationStars') {
        return purpleStarReadingLevel.value;
      }
      // 紫微斗數使用自己的設定
      return readingState.currentLevel;
    },
    set: (newLevel: ReadingLevel) => {
      console.log(
        `useSharedLayeredReading[${moduleType}]: effectiveReadingLevel.set 被調用，newLevel=${newLevel}`,
      );

      if (moduleType === 'purpleStar') {
        // 紫微斗數更新時，同時更新共享狀態
        console.log(
          `useSharedLayeredReading: 紫微斗數更新共享狀態: ${purpleStarReadingLevel.value} → ${newLevel}`,
        );
        purpleStarReadingLevel.value = newLevel;
        // 保存到 sessionStorage
        sessionStorage.setItem('purple-star-reading-level', newLevel);
        // 觸發自定義事件通知四化飛星更新
        window.dispatchEvent(
          new CustomEvent('purple-star-level-changed', {
            detail: { level: newLevel },
          }),
        );
        console.log(
          `useSharedLayeredReading: 已發送 purple-star-level-changed 事件: ${newLevel}`,
        );
      }
      // 更新本地狀態
      switchToLevel(newLevel);
    },
  });

  // 監聽紫微斗數層級變化（僅四化飛星需要）
  if (moduleType === 'transformationStars') {
    const handlePurpleStarLevelChange = (event: CustomEvent) => {
      console.log(
        `useSharedLayeredReading[transformationStars]: 收到 purple-star-level-changed 事件`,
        event.detail,
      );
      if (
        event.detail?.level &&
        event.detail.level !== readingState.currentLevel
      ) {
        console.log(
          `useSharedLayeredReading[transformationStars]: 切換層級 ${readingState.currentLevel} → ${event.detail.level}`,
        );
        switchToLevel(event.detail.level);
      } else {
        console.log(
          `useSharedLayeredReading[transformationStars]: 層級相同，無需切換: ${event.detail?.level}`,
        );
      }
    };

    window.addEventListener(
      'purple-star-level-changed',
      handlePurpleStarLevelChange as EventListener,
    );
    console.log(
      `useSharedLayeredReading[transformationStars]: 已註冊 purple-star-level-changed 監聽器`,
    );

    // 同步初始狀態
    if (purpleStarReadingLevel.value !== readingState.currentLevel) {
      console.log(
        `useSharedLayeredReading[transformationStars]: 同步初始狀態 ${readingState.currentLevel} → ${purpleStarReadingLevel.value}`,
      );
      switchToLevel(purpleStarReadingLevel.value);
    }
  }

  // 同步方法包裝
  const syncedSwitchToLevel = async (level: ReadingLevel) => {
    const result = await switchToLevel(level);
    if (result && moduleType === 'purpleStar') {
      effectiveReadingLevel.value = level;
    }
    return result;
  };

  const syncedUpgradeLevel = async () => {
    const result = await upgradeLevel();
    if (result && moduleType === 'purpleStar') {
      effectiveReadingLevel.value = readingState.currentLevel;
    }
    return result;
  };

  const syncedDowngradeLevel = async () => {
    const result = await downgradeLevel();
    if (result && moduleType === 'purpleStar') {
      effectiveReadingLevel.value = readingState.currentLevel;
    }
    return result;
  };

  const syncedAutoSelectOptimalLevel = async () => {
    await autoSelectOptimalLevel();
    if (moduleType === 'purpleStar') {
      effectiveReadingLevel.value = readingState.currentLevel;
    }
  };

  // 取得模組顯示名稱
  const getModuleDisplayName = () => {
    return moduleType === 'purpleStar' ? '紫微斗數' : '四化飛星';
  };

  // 是否為主控模組
  const isPrimaryModule = computed(() => moduleType === 'purpleStar');

  // 同步狀態描述
  const syncStatusDescription = computed(() => {
    if (moduleType === 'purpleStar') {
      return '主控模組 - 變更將同步至四化飛星';
    }
    return '同步模組 - 自動跟隨紫微斗數設定';
  });

  return {
    // 基礎分層閱讀功能
    readingState,
    userPreferences,
    currentBreakpoint,
    availableLevels,
    currentLevelConfig,
    canUpgrade,
    canDowngrade,
    updateLayeredData,
    saveUserPreferences,
    resetToDefaults,

    // 同步功能
    effectiveReadingLevel,
    switchToLevel: syncedSwitchToLevel,
    upgradeLevel: syncedUpgradeLevel,
    downgradeLevel: syncedDowngradeLevel,
    autoSelectOptimalLevel: syncedAutoSelectOptimalLevel,

    // 模組資訊
    moduleType,
    isPrimaryModule,
    getModuleDisplayName,
    syncStatusDescription,

    // 共享狀態
    purpleStarReadingLevel: computed(() => purpleStarReadingLevel.value),
  };
}

/**
 * 取得當前紫微斗數的閱讀層級（供外部查詢）
 */
export function getPurpleStarReadingLevel(): ReadingLevel {
  return purpleStarReadingLevel.value;
}

/**
 * 重置所有共享狀態
 */
export function resetSharedLayeredReading() {
  purpleStarReadingLevel.value = ReadingLevel.STANDARD;
  sessionStorage.removeItem('purple-star-reading-level');
  window.dispatchEvent(
    new CustomEvent('purple-star-level-changed', {
      detail: { level: ReadingLevel.STANDARD },
    }),
  );
}
