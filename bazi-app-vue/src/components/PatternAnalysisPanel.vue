<template>
  <div class="pattern-analysis-panel">
    <div class="panel-header">
      <h3>
        <span class="icon">🔮</span>
        格局分析
      </h3>
      <button
        class="expand-button"
        :class="{ expanded: isExpanded }"
        @click="toggleExpanded"
      >
        <span>{{ isExpanded ? '收起' : '展開' }}</span>
        <span class="arrow">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>
    </div>

    <div v-if="isExpanded" class="panel-content">
      <!-- 格局概要 -->
      <div v-if="patterns && patterns.length > 0" class="patterns-overview">
        <div class="patterns-count">
          <span class="count-badge">{{ patterns.length }}</span>
          <span class="count-text">個格局特徵</span>
        </div>

        <div class="patterns-types">
          <div
            v-for="patternType in patternTypes"
            :key="patternType.type"
            class="pattern-type-summary"
          >
            <span :class="['type-indicator', `type-${patternType.type}`]">
              {{ patternType.name }}
            </span>
            <span class="type-count">{{ patternType.count }}</span>
          </div>
        </div>
      </div>

      <!-- 格局詳細列表 -->
      <div class="patterns-list">
        <div
          v-for="(pattern, index) in patterns"
          :key="`pattern-${index}`"
          class="pattern-item"
        >
          <div class="pattern-header">
            <span
              :class="['pattern-name', `pattern-${getPatternType(pattern)}`]"
            >
              {{ getPatternName(pattern) }}
            </span>
            <span
              :class="['pattern-badge', `badge-${getPatternType(pattern)}`]"
            >
              {{ getPatternTypeName(getPatternType(pattern)) }}
            </span>
          </div>

          <div class="pattern-description">
            {{ getPatternDescription(pattern) }}
          </div>

          <div class="pattern-impact">
            <div class="impact-level">
              <span class="impact-label">影響程度：</span>
              <div class="impact-bars">
                <div
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'impact-bar',
                    { active: i <= getPatternImpact(pattern) },
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 無格局時的提示 -->
      <div v-if="!patterns || patterns.length === 0" class="no-patterns">
        <div class="no-patterns-icon">📋</div>
        <p class="no-patterns-text">
          此命盤未發現明顯的特殊格局，屬於一般格局類型。
          <br />
          這代表您的人生道路相對平穩，可以透過努力學習和積累來創造成就。
          <br />
          請參考星曜亮度和雜曜分析來了解個人特質。
        </p>
        <div class="no-patterns-explanation">
          <h4>💡 一般格局的優勢：</h4>
          <ul>
            <li>人生較少極端起伏，能夠穩健發展</li>
            <li>有更大的自主空間來塑造自己的命運</li>
            <li>可以透過後天努力來彌補先天的不足</li>
            <li>較容易適應環境變化，具有彈性</li>
          </ul>
        </div>
      </div>

      <!-- 格局建議 -->
      <div v-if="patterns && patterns.length > 0" class="pattern-advice">
        <h4>格局建議</h4>
        <div class="advice-content">
          <div v-if="hasAuspiciousPatterns" class="advice-section positive">
            <span class="advice-icon">✨</span>
            <p>
              命盤中的吉格為您帶來天賦優勢，建議善用這些特質來發展事業和人際關係。
            </p>
          </div>
          <div v-if="hasInauspiciousPatterns" class="advice-section cautionary">
            <span class="advice-icon">⚠️</span>
            <p>
              注意命盤中的挑戰格局，透過自我修煉和智慧決策可以化解不利影響。
            </p>
          </div>
          <div class="advice-section general">
            <span class="advice-icon">💡</span>
            <p>
              格局分析提供人生方向的參考，最終的成就仍需要個人努力和正確的選擇。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  patterns?: string[];
}

const props = defineProps<Props>();

const isExpanded = ref(true);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 解析格局名稱
const getPatternName = (pattern: string): string => {
  return pattern.split('：')[0] || pattern;
};

// 解析格局描述
const getPatternDescription = (pattern: string): string => {
  const parts = pattern.split('：');
  return parts.length > 1 ? parts[1] : '格局描述未提供';
};

// 判斷格局類型
const getPatternType = (pattern: string): string => {
  const name = getPatternName(pattern);

  // 吉格
  const auspiciousPatterns = [
    '紫府夾命格',
    '左右夾命格',
    '文昌文曲格',
    '財蔭夾印格',
    '殺破狼格',
    '機月同梁格',
  ];

  // 凶格
  const inauspiciousPatterns = [
    '日月反背格',
    '火鈴夾命格',
    '羊陀夾命格',
    '空劫夾命格',
  ];

  if (auspiciousPatterns.some((p) => name.includes(p))) {
    return 'auspicious';
  }
  if (inauspiciousPatterns.some((p) => name.includes(p))) {
    return 'inauspicious';
  }
  return 'neutral';
};

// 格局類型名稱
const getPatternTypeName = (type: string): string => {
  const names: Record<string, string> = {
    auspicious: '吉格',
    inauspicious: '凶格',
    neutral: '中性格局',
  };
  return names[type] || '未知';
};

// 計算格局影響程度 (1-5)
const getPatternImpact = (pattern: string): number => {
  const name = getPatternName(pattern);

  // 高影響格局
  if (['殺破狼格', '機月同梁格', '日月反背格'].some((p) => name.includes(p))) {
    return 5;
  }

  // 中高影響格局
  if (
    ['紫府夾命格', '左右夾命格', '火鈴夾命格', '羊陀夾命格'].some((p) =>
      name.includes(p),
    )
  ) {
    return 4;
  }

  // 中等影響格局
  if (['文昌文曲格', '空劫夾命格'].some((p) => name.includes(p))) {
    return 3;
  }

  return 2;
};

// 格局類型統計
const patternTypes = computed(() => {
  if (!props.patterns) {
    return [];
  }

  const types = {
    auspicious: { name: '吉格', count: 0, type: 'auspicious' },
    inauspicious: { name: '凶格', count: 0, type: 'inauspicious' },
    neutral: { name: '中性', count: 0, type: 'neutral' },
  };

  props.patterns.forEach((pattern) => {
    const type = getPatternType(pattern);
    if (types[type as keyof typeof types]) {
      types[type as keyof typeof types].count++;
    }
  });

  return Object.values(types).filter((type) => type.count > 0);
});

// 是否有吉格
const hasAuspiciousPatterns = computed(() => {
  return (
    props.patterns?.some(
      (pattern) => getPatternType(pattern) === 'auspicious',
    ) || false
  );
});

// 是否有凶格
const hasInauspiciousPatterns = computed(() => {
  return (
    props.patterns?.some(
      (pattern) => getPatternType(pattern) === 'inauspicious',
    ) || false
  );
});
</script>

<style scoped>
.pattern-analysis-panel {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.expand-button {
  display: flex;
  align-items: center;
  gap: 6px;
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

.expand-button .arrow {
  transition: transform 0.3s ease;
}

.expand-button.expanded .arrow {
  transform: rotate(180deg);
}

.panel-content {
  padding: 20px;
}

.patterns-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.patterns-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  min-width: 24px;
  text-align: center;
}

.count-text {
  font-size: 14px;
  color: #666;
}

.patterns-types {
  display: flex;
  gap: 12px;
}

.pattern-type-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.type-indicator {
  font-size: 12px;
  font-weight: 500;
}

.type-auspicious {
  color: #4caf50;
}

.type-inauspicious {
  color: #f44336;
}

.type-neutral {
  color: #ff9800;
}

.type-count {
  background: #eee;
  color: #666;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pattern-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.pattern-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pattern-name {
  font-weight: 600;
  font-size: 14px;
}

.pattern-auspicious {
  color: #4caf50;
}

.pattern-inauspicious {
  color: #f44336;
}

.pattern-neutral {
  color: #ff9800;
}

.pattern-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.badge-auspicious {
  background: #4caf50;
}

.badge-inauspicious {
  background: #f44336;
}

.badge-neutral {
  background: #ff9800;
}

.pattern-description {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.impact-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.impact-label {
  font-size: 12px;
  color: #888;
}

.impact-bars {
  display: flex;
  gap: 2px;
}

.impact-bar {
  width: 12px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.impact-bar.active {
  background: #667eea;
}

.no-patterns {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-patterns-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-patterns-text {
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 16px;
}

.no-patterns-explanation {
  background: #f0f8ff;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid #3498db;
  margin-top: 12px;
}

.no-patterns-explanation h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 13px;
}

.no-patterns-explanation ul {
  margin: 0;
  padding-left: 16px;
}

.no-patterns-explanation li {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #555;
}

.pattern-advice {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pattern-advice h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.advice-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advice-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.advice-section.positive {
  background: #e8f5e8;
  border-left: 3px solid #4caf50;
}

.advice-section.cautionary {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.advice-section.general {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.advice-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .patterns-overview {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .patterns-types {
    flex-wrap: wrap;
  }

  .pattern-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
