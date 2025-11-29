<template>
  <div class="trait-deconstruction">
    <!-- 內外特質分析 -->
    <div class="duality-analysis-section">
      <h4 class="section-title">
        <span class="section-icon">🎭</span>
        內外特質分析
        <button
          v-if="isDev"
          class="refresh-btn"
          title="重新計算特質分析"
          @click="refreshTraitAnalysis"
        >
          🔄
        </button>
      </h4>
      <div class="duality-container">
        <div class="trait-side external-traits">
          <div class="trait-header">
            <h5>顯性特質</h5>
            <span class="trait-subtitle">外在表現</span>
          </div>
          <div class="trait-content">
            <div class="trait-source">基於八字分析</div>
            <ul class="trait-list">
              <li
                v-for="(trait, index) in externalTraits"
                :key="`external-${index}`"
              >
                {{ trait }}
              </li>
            </ul>
          </div>
        </div>

        <div class="trait-divider">
          <div class="divider-line" />
          <div class="divider-icon">⚖️</div>
          <div class="divider-line" />
        </div>

        <div class="trait-side internal-traits">
          <div class="trait-header">
            <h5>隱性特質</h5>
            <span class="trait-subtitle">內在本質</span>
          </div>
          <div class="trait-content">
            <div class="trait-source">基於紫微斗數分析</div>
            <ul class="trait-list">
              <li
                v-for="(trait, index) in internalTraits"
                :key="`internal-${index}`"
              >
                {{ trait }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="synthesis-explanation">
        <div class="synthesis-icon">🔄</div>
        <div class="synthesis-text">
          <h6>特質綜合說明</h6>
          <p>{{ traitSynthesis }}</p>
        </div>
      </div>
    </div>

    <!-- 人生課題 -->
    <div class="life-lessons-section">
      <h4 class="section-title">
        <span class="section-icon">🌱</span>
        人生課題
      </h4>
      <div class="lessons-container">
        <div class="lessons-introduction">
          <p>
            以下是您一生中需要關注和修練的重要領域，這些並非缺陷，而是成長的機會：
          </p>
        </div>

        <div class="lessons-grid">
          <div
            v-for="(lesson, index) in lifeLessons"
            :key="`lesson-${index}`"
            class="lesson-card"
            :class="`lesson-priority-${lesson.priority}`"
          >
            <div class="lesson-header">
              <div class="lesson-icon">{{ lesson.icon }}</div>
              <div class="lesson-title">{{ lesson.title }}</div>
              <div class="lesson-priority">
                <span class="priority-label">重要度</span>
                <div class="priority-indicators">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="['priority-dot', { active: i <= lesson.priority }]"
                  />
                </div>
              </div>
            </div>

            <div class="lesson-content">
              <div class="lesson-description">{{ lesson.description }}</div>
              <div class="lesson-guidance">
                <strong>修練方向：</strong>{{ lesson.guidance }}
              </div>
            </div>

            <div class="lesson-source">
              <span class="source-label">來源：</span>
              <span class="source-detail">{{ lesson.source }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { PurpleStarChart } from '@/types/astrologyTypes';

// Props
interface Props {
  chartData: PurpleStarChart;
}

const props = defineProps<Props>();

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
  social: ['太陽', '天同', '天梁', '左輔', '右弼', '天魁', '天鉞'],
};

// 分析外在特質（基於八字概念的推導）
const externalTraits = computed(() => {
  // 強制更新響應性
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const _unused = updateKey.value;

  const traits: string[] = [];

  if (!props.chartData?.palaces) {
    console.log('TraitDeconstruction: 外在特質分析 - 沒有命盤宮位資料');
    return traits;
  }

  console.log(
    'TraitDeconstruction: 外在特質分析 - 宮位數量:',
    props.chartData.palaces.length,
  );

  // 基於命宮主星分析外在表現
  const mingPalace = props.chartData.palaces.find((p) => p.name === '命宮');
  if (mingPalace?.stars) {
    const mainStars = mingPalace.stars.filter((star) => star.type === 'main');

    mainStars.forEach((star) => {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const _unused = updateKey.value;

  const traits: string[] = [];

  if (!props.chartData?.palaces) {
    console.log('TraitDeconstruction: 內在特質分析 - 沒有命盤宮位資料');
    return traits;
  }

  console.log(
    'TraitDeconstruction: 內在特質分析 - 宮位數量:',
    props.chartData.palaces.length,
  );

  // 基於福德宮分析內在精神世界
  const fudePalace = props.chartData.palaces.find((p) => p.name === '福德宮');
  if (fudePalace?.stars) {
    const mainStars = fudePalace.stars.filter((star) => star.type === 'main');

    mainStars.forEach((star) => {
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
  const jiePalace = props.chartData.palaces.find((p) => p.name === '疾厄宮');
  if (jiePalace?.stars) {
    const hasInauspiciousStars = jiePalace.stars.some(
      (star) => star.attribute === '凶',
    );
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const _unused = updateKey.value;

  const abilities = [
    { name: '領導力', value: 0, color: '#ff6b6b', key: 'leadership' },
    { name: '創造力', value: 0, color: '#4ecdc4', key: 'creativity' },
    { name: '溝通力', value: 0, color: '#45b7d1', key: 'communication' },
    { name: '學習能力', value: 0, color: '#96ceb4', key: 'learning' },
    { name: '理財能力', value: 0, color: '#feca57', key: 'financial' },
    { name: '人際關係', value: 0, color: '#ff9ff3', key: 'social' },
  ];

  if (!props.chartData?.palaces) {
    // 沒有數據時給予基準分數
    abilities.forEach((ability) => {
      ability.value = 4 + Math.floor(Math.random() * 3); // 4-6分基準
    });
    return abilities;
  }

  // 計算各項能力值
  abilities.forEach((ability) => {
    const relatedStars =
      starAttributes[ability.key as keyof typeof starAttributes] || [];
    let score = 0;
    let starCount = 0;

    props.chartData.palaces.forEach((palace) => {
      palace.stars?.forEach((star) => {
        if (relatedStars.includes(star.name)) {
          starCount++;
          // 基礎分數：每顆相關星曜給2分
          score += 2;

          // 亮度加成（更顯著的影響）
          if (star.brightness) {
            const brightnessBonus =
              {
                廟: 4,
                旺: 3,
                得地: 2,
                利益: 1,
                平和: 0,
                不得地: -1,
                落陷: -2,
              }[star.brightness] || 0;
            score += brightnessBonus;
          }

          // 四化加成（加強效果）
          if (star.transformations?.includes('祿')) {
            score += 2;
          }
          if (star.transformations?.includes('權')) {
            score += 2;
          }
          if (star.transformations?.includes('科')) {
            score += 1;
          }
          if (star.transformations?.includes('忌')) {
            score -= 2;
          }

          // 特殊宮位加成
          if (palace.name === '命宮') {
            score += 1;
          } // 命宮星曜影響較大
          if (palace.name === '官祿宮' && ability.key === 'leadership') {
            score += 1;
          }
          if (palace.name === '財帛宮' && ability.key === 'financial') {
            score += 1;
          }
        }
      });
    });

    // 基準分數：即使沒有相關星曜也給予4分基準
    let baseScore = 4;

    // 根據星曜數量調整基準
    if (starCount > 0) {
      baseScore = Math.max(4, score);
    } else {
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
    .map((ability) => ({
      name: ability.name,
      value: ability.value,
      level:
        ability.value >= 8 ? 'high' : ability.value >= 6 ? 'medium' : 'low',
    }));
});

// 潛能開發建議
const _potentialSuggestions = computed(() => {
  const suggestions: string[] = [];
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const _unused = updateKey.value;

  const lessons: Array<{
    title: string;
    description: string;
    guidance: string;
    source: string;
    priority: number;
    icon: string;
  }> = [];

  if (!props.chartData?.palaces) {
    return lessons;
  }

  // 分析各宮位的挑戰
  props.chartData.palaces.forEach((palace) => {
    const hasInauspiciousStars = palace.stars?.some(
      (star) => star.attribute === '凶',
    );
    const hasTransformToJi = palace.stars?.some((star) =>
      star.transformations?.includes('忌'),
    );
    const isEmptyPalace = !palace.stars?.some((star) => star.type === 'main');

    if (hasInauspiciousStars || hasTransformToJi || isEmptyPalace) {
      let lesson: any = {};

      switch (palace.name) {
        case '命宮':
          lesson = {
            title: '自我認知與定位',
            description: '需要更深入地了解自己的本質和人生方向',
            guidance: '通過冥想、自省或心理諮商來加深自我認識',
            source: `${palace.name}星曜配置`,
            priority: 5,
            icon: '🔍',
          };
          break;
        case '財帛宮':
          lesson = {
            title: '金錢觀念與理財',
            description: '需要建立正確的金錢觀念和理財習慣',
            guidance: '學習投資理財知識，培養延遲滿足的能力',
            source: `${palace.name}星曜配置`,
            priority: 4,
            icon: '💰',
          };
          break;
        case '夫妻宮':
          lesson = {
            title: '情感關係與溝通',
            description: '需要學習如何建立和維持健康的親密關係',
            guidance: '培養同理心，學習有效溝通技巧',
            source: `${palace.name}星曜配置`,
            priority: 4,
            icon: '💝',
          };
          break;
        case '官祿宮':
          lesson = {
            title: '事業發展與成就',
            description: '需要找到適合的職業方向和發展策略',
            guidance: '明確職業目標，持續提升專業能力',
            source: `${palace.name}星曜配置`,
            priority: 4,
            icon: '🎯',
          };
          break;
        case '交友宮':
          lesson = {
            title: '人際關係與社交',
            description: '需要改善人際交往技巧和朋友選擇',
            guidance: '學習主動關懷他人，建立互惠的友誼',
            source: `${palace.name}星曜配置`,
            priority: 3,
            icon: '🤝',
          };
          break;
        default:
          lesson = {
            title: `${palace.name}領域修練`,
            description: `在${palace.name}相關領域需要特別注意和學習`,
            guidance: '保持謙虛學習的態度，尋求專業指導',
            source: `${palace.name}星曜配置`,
            priority: 2,
            icon: '📚',
          };
      }

      lessons.push(lesson);
    }
  });

  // 按優先度排序，限制數量
  return lessons.sort((a, b) => b.priority - a.priority).slice(0, 4);
});

// 獲取能力圖標
const _getAbilityIcon = (_abilityName: string) => {
  const iconMap: Record<string, string> = {
    領導力: '👑',
    創造力: '🎨',
    溝通力: '💬',
    學習能力: '📚',
    理財能力: '💰',
    人際關係: '🤝',
  };
  return iconMap[_abilityName] || '⭐';
};

// 獲取能力等級描述
const _getAbilityLevel = (_value: number) => {
  if (_value >= 8) {
    return '優秀';
  }
  if (_value >= 6) {
    return '良好';
  }
  if (_value >= 4) {
    return '普通';
  }
  return '待提升';
};

// 顏色亮化函數
const _lightenColor = (color: string, _amount: number) => {
  // 簡化的顏色亮化處理
  const colorMap: Record<string, string> = {
    '#ff6b6b': '#ff9999',
    '#4ecdc4': '#7ee8e0',
    '#45b7d1': '#78c7e4',
    '#96ceb4': '#b8dcc6',
    '#feca57': '#fed887',
    '#ff9ff3': '#ffb8f7',
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
watch(
  () => props.chartData,
  (newChartData, oldChartData) => {
    console.log('TraitDeconstruction: 監聽到 chartData 變化');
    console.log('新資料存在:', !!newChartData);
    console.log('新資料宮位數:', newChartData?.palaces?.length || 0);
    console.log('舊資料存在:', !!oldChartData);
    console.log('舊資料宮位數:', oldChartData?.palaces?.length || 0);

    // 更寬鬆的更新條件
    if (
      newChartData &&
      newChartData.palaces &&
      newChartData.palaces.length > 0
    ) {
      console.log('TraitDeconstruction: 資料有效，開始更新');
      updateKey.value++;
      nextTick(() => {
        updateAbilitiesDisplay();
        console.log('TraitDeconstruction: 雷達圖已重繪');
      });
    } else {
      console.log('TraitDeconstruction: 資料無效，跳過更新');
    }
  },
  { deep: true, immediate: true },
);

// 監聽全域命盤更新事件
const handleGlobalChartUpdate = (event: CustomEvent) => {
  console.log('TraitDeconstruction: 收到全域命盤更新事件', event.detail);
  updateKey.value++; // 強制更新所有計算屬性
  nextTick(() => {
    updateAbilitiesDisplay();
  });
};

// 添加全域事件監聽器
if (typeof window !== 'undefined') {
  window.addEventListener(
    'purple-star-chart-updated',
    handleGlobalChartUpdate as EventListener,
  );
  window.addEventListener(
    'purple-star-chart-force-updated',
    handleGlobalChartUpdate as EventListener,
  );
}

// 監聽核心能力分析變化
watch(
  () => coreAbilities.value,
  (newAbilities, oldAbilities) => {
    if (JSON.stringify(newAbilities) !== JSON.stringify(oldAbilities)) {
      console.log('TraitDeconstruction: 核心能力分析變化，重新繪製雷達圖');
      nextTick(() => {
        updateAbilitiesDisplay();
      });
    }
  },
  { deep: true },
);

// 手動刷新特質分析
const refreshTraitAnalysis = () => {
  console.log('TraitDeconstruction: 手動刷新特質分析');
  updateKey.value++;
  nextTick(() => {
    updateAbilitiesDisplay();
  });

  // 通知其他組件手動刷新事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('trait-analysis-refreshed', {
        detail: {
          component: 'TraitDeconstruction',
          timestamp: Date.now(),
          source: 'manual-refresh',
        },
      }),
    );
  }
};

// 手動刷新天賦分析
const _refreshTalentAnalysis = () => {
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
  (window as any).debugTraitDeconstruction = logCurrentDataStructure;
  (window as any).refreshTraitDeconstruction = refreshTraitAnalysis;
}

// 生命週期
onMounted(() => {
  console.log('TraitDeconstruction: 組件掛載，初始化雷達圖');
  console.log('掛載時 chartData:', props.chartData);
  console.log('掛載時 palaces 數量:', props.chartData?.palaces?.length || 0);

  // 檢查資料內容
  if (props.chartData?.palaces) {
    const mingPalace = props.chartData.palaces.find((p) => p.name === '命宮');
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
    window.removeEventListener(
      'purple-star-chart-updated',
      handleGlobalChartUpdate as EventListener,
    );
    window.removeEventListener(
      'purple-star-chart-force-updated',
      handleGlobalChartUpdate as EventListener,
    );
    window.removeEventListener('resize', handleResize);
    console.log('TraitDeconstruction: 已清除全域事件監聽器');
  }
});
</script>

<style scoped>
.trait-deconstruction {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafe 100%);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
}

.trait-deconstruction::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 20px 20px 0 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 24px 24px 16px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(248, 250, 254, 0.8) 100%
  );
  backdrop-filter: blur(10px);
  position: relative;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 1.5px;
}

.section-icon {
  font-size: 1.4rem;
}

/* 內外特質分析 */
.duality-analysis-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
}

.duality-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: start;
  padding: 0 24px;
}

.trait-side {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 254, 0.9) 100%
  );
  border-radius: 16px;
  padding: 24px;
  min-height: 220px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
}

.trait-side:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.external-traits {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.05) 0%,
    rgba(156, 39, 176, 0.05) 100%
  );
  border-left: 4px solid #2196f3;
}

.external-traits::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196f3, #3f51b5);
  border-radius: 16px 16px 0 0;
}

.internal-traits {
  background: linear-gradient(
    135deg,
    rgba(156, 39, 176, 0.05) 0%,
    rgba(76, 175, 80, 0.05) 100%
  );
  border-left: 4px solid #9c27b0;
}

.internal-traits::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #9c27b0, #673ab7);
  border-radius: 16px 16px 0 0;
}

.trait-header {
  margin-bottom: 16px;
  text-align: center;
}

.trait-header h5 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.trait-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.trait-source {
  color: #6c757d;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 12px;
  font-style: italic;
}

.trait-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trait-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  line-height: 1.5;
}

.trait-list li:last-child {
  border-bottom: none;
}

.trait-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.divider-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 1px;
}

.divider-icon {
  font-size: 1.5rem;
  margin: 8px 0;
  background: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.synthesis-explanation {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding: 20px 24px 0;
  background: linear-gradient(135deg, #fff9c4 0%, #f0f8ff 100%);
  border-radius: 12px;
  margin-left: 24px;
  margin-right: 24px;
}

.synthesis-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.synthesis-text h6 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.synthesis-text p {
  margin: 0;
  line-height: 1.6;
  color: #495057;
  font-size: 0.95rem;
}

/* 天賦與潛能 */
.talents-potential-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
}

.talents-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 0 24px;
}

/* 新的能力顯示設計 */
.abilities-display {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 254, 0.9) 100%
  );
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.abilities-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.abilities-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ability-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 254, 0.95) 100%
  );
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--ability-color), 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.ability-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--ability-color);
  opacity: 0.8;
}

.ability-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--ability-color);
}

.ability-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.ability-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ability-info {
  flex: 1;
}

.ability-name {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.ability-score {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.ability-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease-out;
  position: relative;
}

.ability-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.ability-level {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  min-width: 48px;
  text-align: right;
}

.talents-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-talents h5,
.potential-areas h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.talent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.talent-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.talent-level-high {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #2c3e50;
}

.talent-level-medium {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: #2c3e50;
}

.talent-level-low {
  background: linear-gradient(135deg, #48cae4, #96ceb4);
  color: #2c3e50;
}

.talent-score {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
}

.potential-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.potential-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.suggestion-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

/* 人生課題 */
.life-lessons-section {
  padding-bottom: 24px;
}

.lessons-introduction {
  padding: 0 24px;
  margin-bottom: 20px;
}

.lessons-introduction p {
  color: #6c757d;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

.lessons-container {
  padding: 0 24px;
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.lesson-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #6c757d;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.lesson-priority-5 {
  border-left-color: #dc3545;
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
}

.lesson-priority-4 {
  border-left-color: #ff6b00;
  background: linear-gradient(135deg, #fff3e0 0%, #ffeaa7 100%);
}

.lesson-priority-3 {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fffbf0 0%, #fff9c4 100%);
}

.lesson-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.lesson-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.lesson-title {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.lesson-priority {
  display: flex;
  align-items: center;
  gap: 6px;
}

.priority-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.priority-indicators {
  display: flex;
  gap: 2px;
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e9ecef;
}

.priority-dot.active {
  background: #dc3545;
}

.lesson-content {
  margin-bottom: 12px;
}

.lesson-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #495057;
  margin-bottom: 8px;
}

.lesson-guidance {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #6c757d;
}

.lesson-source {
  font-size: 0.8rem;
  color: #6c757d;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
}

.source-label {
  font-weight: 500;
}

/* 刷新按鈕樣式 */
.refresh-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.refresh-btn:hover {
  opacity: 1;
  background-color: rgba(0, 123, 255, 0.1);
  transform: rotate(180deg);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .talents-container {
    gap: 20px;
  }

  .radar-chart canvas {
    width: 250px !important;
    height: 250px !important;
  }

  .chart-legend {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .legend-item {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .duality-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .trait-divider {
    flex-direction: row;
    padding: 16px 0;
  }

  .divider-line {
    width: 60px;
    height: 2px;
  }

  .talents-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .radar-chart-container {
    order: 1;
  }

  .talents-details {
    order: 2;
  }

  .radar-chart {
    margin-bottom: 16px;
  }

  .chart-legend {
    margin-bottom: 16px;
  }

  .lessons-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.2rem;
    padding: 16px 16px 0 16px;
  }

  .duality-container,
  .talents-container,
  .lessons-container {
    padding: 0 16px;
  }

  .synthesis-explanation {
    margin-left: 16px;
    margin-right: 16px;
    padding: 16px;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .lesson-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .radar-chart canvas {
    width: 200px !important;
    height: 200px !important;
  }

  .chart-legend {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .legend-item {
    font-size: 0.8rem;
    justify-content: space-between;
  }

  .talent-tags {
    justify-content: center;
  }

  .talent-tag {
    font-size: 0.8rem;
    padding: 4px 10px;
  }

  .talents-details {
    gap: 16px;
  }

  .potential-list {
    padding-left: 16px;
  }

  .potential-list li {
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
</style>
