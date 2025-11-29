<template>
  <div class="minor-stars-panel">
    <div class="panel-header">
      <h3>
        <span class="icon">⭐</span>
        雜曜分析
      </h3>
      <div class="panel-controls">
        <select v-model="selectedCategory" class="category-selector">
          <option value="all">全部雜曜</option>
          <option value="桃花">桃花類</option>
          <option value="文藝">文藝類</option>
          <option value="德星">德星類</option>
          <option value="煞星">煞星類</option>
          <option value="其他">其他類</option>
        </select>
        <button
          class="expand-button"
          :class="{ expanded: isExpanded }"
          @click="toggleExpanded"
        >
          {{ isExpanded ? '收起' : '展開' }}
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="panel-content">
      <!-- 雜曜統計 -->
      <div class="minor-stars-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-number">{{ filteredMinorStars.length }}</span>
            <span class="stat-label">顆雜曜</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ categoryStats.beneficial }}</span>
            <span class="stat-label">吉星</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ categoryStats.malefic }}</span>
            <span class="stat-label">凶星</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ categoryStats.neutral }}</span>
            <span class="stat-label">中性</span>
          </div>
        </div>
      </div>

      <!-- 雜曜分類標籤 -->
      <div class="category-tabs">
        <button
          v-for="category in availableCategories"
          :key="category"
          :class="['category-tab', { active: selectedCategory === category }]"
          @click="selectedCategory = category"
        >
          {{ getCategoryName(category) }}
          <span class="tab-count">{{ getCategoryCount(category) }}</span>
        </button>
      </div>

      <!-- 雜曜列表 -->
      <div class="minor-stars-list">
        <div
          v-for="starInfo in filteredMinorStars"
          :key="`${starInfo.star.name}-${starInfo.palace.name}`"
          class="minor-star-item"
        >
          <div class="star-info">
            <div class="star-header">
              <span :class="['star-name', `star-${starInfo.star.attribute}`]">
                {{ starInfo.star.name }}
              </span>
              <StarBrightnessIndicator
                v-if="starInfo.star.brightness"
                :brightness="starInfo.star.brightness"
              />
              <span
                :class="[
                  'star-category-badge',
                  `category-${getStarCategory(starInfo.star.name)}`,
                ]"
              >
                {{ getCategoryName(getStarCategory(starInfo.star.name)) }}
              </span>
            </div>

            <div class="star-location">
              <span class="location-label">位於</span>
              <span class="palace-name">{{ starInfo.palace.name }}</span>
              <span class="palace-zhi">{{ starInfo.palace.zhi }}宮</span>
            </div>

            <div class="star-description">
              {{ starInfo.star.description }}
            </div>

            <div v-if="getStarInfluence(starInfo)" class="star-influence">
              <div class="influence-header">
                <span class="influence-icon">💫</span>
                <span class="influence-title">特殊影響</span>
              </div>
              <div class="influence-content">
                {{ getStarInfluence(starInfo) }}
              </div>
            </div>

            <!-- 雜曜四化 -->
            <div
              v-if="
                starInfo.star.transformations &&
                starInfo.star.transformations.length > 0
              "
              class="star-transformations"
            >
              <span class="transformations-label">四化：</span>
              <span
                v-for="transformation in starInfo.star.transformations"
                :key="transformation"
                :class="[
                  'transformation-badge',
                  `transformation-${transformation}`,
                ]"
              >
                {{ transformation }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 雜曜綜合影響 -->
      <div v-if="filteredMinorStars.length > 0" class="minor-stars-impact">
        <h4>雜曜綜合影響</h4>
        <div class="impact-content">
          <div v-if="positiveInfluences.length > 0" class="impact-positive">
            <h5>正面影響</h5>
            <ul>
              <li v-for="influence in positiveInfluences" :key="influence">
                {{ influence }}
              </li>
            </ul>
          </div>

          <div v-if="negativeInfluences.length > 0" class="impact-negative">
            <h5>需要注意</h5>
            <ul>
              <li v-for="influence in negativeInfluences" :key="influence">
                {{ influence }}
              </li>
            </ul>
          </div>

          <div class="impact-suggestions">
            <h5>建議</h5>
            <p>{{ getOverallSuggestion() }}</p>
          </div>
        </div>
      </div>

      <!-- 無雜曜提示 -->
      <div v-if="filteredMinorStars.length === 0" class="no-minor-stars">
        <div class="no-stars-icon">🌟</div>
        <p>
          {{
            selectedCategory === 'all'
              ? '此命盤中未發現雜曜，這是正常情況。'
              : `此命盤中未發現${getCategoryName(selectedCategory)}雜曜。`
          }}
        </p>
        <div v-if="selectedCategory === 'all'" class="no-stars-explanation">
          <h4>💡 沒有雜曜的意義：</h4>
          <ul>
            <li>生活相對簡單純粹，較少複雜的干擾因素</li>
            <li>人生發展主要依靠主星的力量和個人努力</li>
            <li>避免了某些雜曜可能帶來的負面影響</li>
            <li>有更大的空間來發展自己的潛能</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';

interface Star {
  name: string;
  type: string;
  attribute?: string;
  brightness?: string;
  description?: string;
  transformations?: string[];
}

interface Palace {
  name: string;
  zhi: string;
  stars: Star[];
}

interface Props {
  palaces: Palace[];
}

const props = defineProps<Props>();

const isExpanded = ref(false);
const selectedCategory = ref<string>('all');

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 雜曜分類映射
const getStarCategory = (starName: string): string => {
  const categories: Record<string, string[]> = {
    桃花: ['天姚', '紅鸞', '天喜', '咸池'],
    文藝: ['龍池', '鳳閣', '天才', '天壽'],
    德星: ['天德', '月德', '解神'],
    煞星: [
      '擎羊',
      '陀羅',
      '火星',
      '鈴星',
      '天刑',
      '孤辰',
      '寡宿',
      '天月',
      '陰煞',
    ],
    其他: ['天馬', '天巫', '台輔', '封誥'],
  };

  for (const [category, stars] of Object.entries(categories)) {
    if (stars.includes(starName)) {
      return category;
    }
  }
  return '其他';
};

// 獲取分類名稱
const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    all: '全部',
    桃花: '桃花',
    文藝: '文藝',
    德星: '德星',
    煞星: '煞星',
    其他: '其他',
  };
  return names[category] || category;
};

// 提取所有雜曜
const allMinorStars = computed(() => {
  const stars: Array<{ star: Star; palace: Palace }> = [];

  props.palaces.forEach((palace) => {
    palace.stars.forEach((star) => {
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

  return allMinorStars.value.filter(
    (item) => getStarCategory(item.star.name) === selectedCategory.value,
  );
});

// 可用分類
const availableCategories = computed(() => {
  const categories = new Set(['all']);
  allMinorStars.value.forEach((item) => {
    categories.add(getStarCategory(item.star.name));
  });
  return Array.from(categories);
});

// 獲取分類數量
const getCategoryCount = (category: string): number => {
  if (category === 'all') {
    return allMinorStars.value.length;
  }
  return allMinorStars.value.filter(
    (item) => getStarCategory(item.star.name) === category,
  ).length;
};

// 分類統計
const categoryStats = computed(() => {
  const stats = { beneficial: 0, malefic: 0, neutral: 0 };

  filteredMinorStars.value.forEach((item) => {
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
const getStarInfluence = (starInfo: { star: Star; palace: Palace }): string => {
  const { star, palace } = starInfo;

  const influences: Record<string, Record<string, string>> = {
    天馬: {
      遷移宮: '增強外出運勢，利於旅行發展',
      官祿宮: '事業有變動機會，宜主動出擊',
    },
    天姚: {
      夫妻宮: '感情豐富，桃花運旺，需注意感情處理',
      命宮: '人緣佳，具有魅力，易得異性緣',
    },
    紅鸞: {
      夫妻宮: '婚姻運佳，感情順利，有喜慶之事',
      子女宮: '子女緣分深厚，家庭和樂',
    },
    天喜: {
      命宮: '人生多喜事，個性樂觀開朗',
      福德宮: '精神愉悦，享受生活樂趣',
    },
    龍池: {
      命宮: '具有藝術天賦，品味高雅',
      官祿宮: '工作與文藝創作相關，才華出眾',
    },
    鳳閣: {
      命宮: '具有美感，追求精緻生活',
      夫妻宮: '配偶有藝術氣質，夫妻生活優雅',
    },
    天德: {
      命宮: '有貴人相助，能逢凶化吉',
      疾厄宮: '身體健康，疾病易癒',
    },
    月德: {
      命宮: '心地善良，常得人助',
      父母宮: '與長輩關係良好，得到庇佑',
    },
  };

  return influences[star.name]?.[palace.name] || '';
};

// 正面影響
const positiveInfluences = computed(() => {
  const influences: string[] = [];

  filteredMinorStars.value.forEach((item) => {
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
  const influences: string[] = [];

  filteredMinorStars.value.forEach((item) => {
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
const getOverallSuggestion = (): string => {
  const beneficialCount = categoryStats.value.beneficial;
  const maleficCount = categoryStats.value.malefic;

  if (beneficialCount > maleficCount) {
    return '雜曜整體影響偏向正面，建議善用這些星曜帶來的特殊才能和機會。';
  } else if (maleficCount > beneficialCount) {
    return '需要特別注意雜曜帶來的挑戰，透過修養和智慧來化解不利影響。';
  }
  return '雜曜影響平衡，關鍵在於如何運用智慧來趨吉避凶。';
};
</script>

<style scoped>
.minor-stars-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
  color: white;
}

.panel-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.panel-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-selector {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.category-selector option {
  background: #9c27b0;
  color: white;
}

.expand-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.expand-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-content {
  padding: 20px;
}

.minor-stars-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #9c27b0;
}

.summary-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #9c27b0;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.category-tab:hover {
  background: #e8eaf6;
  border-color: #9c27b0;
}

.category-tab.active {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0;
}

.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.category-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.minor-stars-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.minor-star-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.minor-star-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #9c27b0;
}

.star-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.star-name {
  font-weight: 600;
  font-size: 14px;
}

.star-吉 {
  color: #4caf50;
}

.star-凶 {
  color: #f44336;
}

.star-中性 {
  color: #ff9800;
}

.star-category-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: white;
}

.category-桃花 {
  background: #e91e63;
}

.category-文藝 {
  background: #673ab7;
}

.category-德星 {
  background: #4caf50;
}

.category-煞星 {
  background: #f44336;
}

.category-其他 {
  background: #607d8b;
}

.star-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.location-label {
  color: #999;
}

.palace-name {
  font-weight: 500;
  color: #333;
}

.palace-zhi {
  color: #666;
}

.star-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.star-influence {
  margin-top: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #9c27b0;
}

.influence-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.influence-icon {
  font-size: 14px;
}

.influence-title {
  font-weight: 500;
  font-size: 12px;
  color: #9c27b0;
}

.influence-content {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.star-transformations {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.transformations-label {
  font-size: 11px;
  color: #999;
}

.transformation-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

.transformation-祿 {
  background: #4caf50;
}

.transformation-權 {
  background: #ff9800;
}

.transformation-科 {
  background: #2196f3;
}

.transformation-忌 {
  background: #f44336;
}

.minor-stars-impact {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.minor-stars-impact h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.impact-positive,
.impact-negative,
.impact-suggestions {
  margin-bottom: 16px;
}

.impact-positive h5 {
  color: #4caf50;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.impact-negative h5 {
  color: #f44336;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.impact-suggestions h5 {
  color: #2196f3;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.impact-content ul {
  margin: 0;
  padding-left: 20px;
}

.impact-content li {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.4;
}

.impact-suggestions p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #666;
}

.no-minor-stars {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-stars-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-stars-explanation {
  background: #f0f8ff;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid #9c27b0;
  margin-top: 12px;
  text-align: left;
}

.no-stars-explanation h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 13px;
}

.no-stars-explanation ul {
  margin: 0;
  padding-left: 16px;
}

.no-stars-explanation li {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #555;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .panel-controls {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .summary-stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .category-tabs {
    justify-content: center;
  }

  .star-header {
    flex-wrap: wrap;
  }
}
</style>
