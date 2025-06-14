<template>
  <div class="feature-hints-display">
    <!-- 星曜亮度提示 -->
    <div v-if="brightnessHints.length > 0" class="brightness-hints">
      <div 
        v-for="hint in brightnessHints" 
        :key="hint.star"
        class="brightness-hint"
        :class="`brightness-${hint.level}`"
        @click="showHintDetail('brightness', hint)"
        :title="getBrightnessTooltip(hint)"
      >
        <span class="hint-icon">✨</span>
        <span class="hint-text">{{ hint.star }}{{ hint.level }}</span>
        <span class="info-indicator">ⓘ</span>
      </div>
    </div>

    <!-- 格局提示 -->
    <div v-if="patternHints.length > 0" class="pattern-hints">
      <div 
        v-for="hint in patternHints" 
        :key="hint.type"
        class="pattern-hint"
        :class="`pattern-${hint.type}`"
        @click="showHintDetail('pattern', hint)"
        :title="getPatternTooltip(hint)"
      >
        <span class="hint-icon">🔮</span>
        <span class="hint-text">{{ hint.description }}</span>
        <span class="info-indicator">ⓘ</span>
      </div>
    </div>

    <!-- 空宮提示 -->
    <div v-if="isEmpty" 
         class="empty-palace-hint"
         @click="showHintDetail('empty', { name: '空宮', borrowedInfo })"
         :title="getEmptyPalaceTooltip()"
    >
      <span class="hint-icon">○</span>
      <span class="hint-text">空宮</span>
      <div v-if="borrowedInfo" class="borrowed-hint">
        <span class="borrowed-text">借{{ borrowedInfo.name }}</span>
      </div>
      <span class="info-indicator">ⓘ</span>
    </div>

    <!-- 雜曜提示 -->
    <div v-if="minorStarHints.length > 0" class="minor-star-hints">
      <div 
        v-for="hint in minorStarHints" 
        :key="hint.category"
        class="minor-star-hint"
        :class="`minor-${hint.category}`"
        @click="showHintDetail('minor', hint)"
        :title="getMinorStarTooltip(hint)"
      >
        <span class="hint-icon">⭐</span>
        <span class="hint-text">{{ hint.description }}</span>
        <span class="info-indicator">ⓘ</span>
      </div>
    </div>

    <!-- Tooltip Popover -->
    <div v-if="showTooltip" 
         class="feature-tooltip" 
         :class="tooltipPosition"
         @click.stop
    >
      <div class="tooltip-header">
        <h4>{{ tooltipData.title }}</h4>
        <button @click="closeTooltip" class="close-tooltip">×</button>
      </div>
      <div class="tooltip-content">
        <p class="tooltip-description">{{ tooltipData.description }}</p>
        <div v-if="tooltipData.influence" class="tooltip-influence">
          <strong>影響：</strong>{{ tooltipData.influence }}
        </div>
        <div v-if="tooltipData.advice" class="tooltip-advice">
          <strong>建議：</strong>{{ tooltipData.advice }}
        </div>
      </div>
    </div>

    <!-- Backdrop for mobile -->
    <div v-if="showTooltip" class="tooltip-backdrop" @click="closeTooltip"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Star {
  name: string
  type: string
  brightness?: string
  attribute?: string
}

interface Palace {
  name: string
  stars: Star[]
}

interface BorrowedInfo {
  name: string
  mainStars: Star[]
}

interface Props {
  palace?: Palace | null
  position: string
  isEmpty: boolean
  borrowedInfo?: BorrowedInfo
}

const props = defineProps<Props>()

// Tooltip state
const showTooltip = ref(false)
const tooltipData = ref({
  title: '',
  description: '',
  influence: '',
  advice: ''
})
const tooltipPosition = ref('top')

// 星曜亮度提示
const brightnessHints = computed(() => {
  if (!props.palace) return []
  
  const hints: Array<{star: string, level: string}> = []
  props.palace.stars.forEach(star => {
    if (star.brightness && ['廟', '旺', '落陷'].includes(star.brightness)) {
      hints.push({
        star: star.name,
        level: star.brightness
      })
    }
  })
  return hints.slice(0, 2) // 最多顯示2個
})

// 格局提示
const patternHints = computed(() => {
  if (!props.palace) return []
  
  const hints: Array<{type: string, description: string}> = []
  const stars = props.palace.stars.map(s => s.name)
  
  // 檢查常見格局
  if (stars.includes('紫微') && stars.includes('天府')) {
    hints.push({ type: 'auspicious', description: '紫府同宮' })
  }
  if (stars.includes('左輔') && stars.includes('右弼')) {
    hints.push({ type: 'auspicious', description: '左右同宮' })
  }
  if (stars.includes('文昌') && stars.includes('文曲')) {
    hints.push({ type: 'auspicious', description: '昌曲同宮' })
  }
  
  return hints.slice(0, 1) // 最多顯示1個
})

// 雜曜提示
const minorStarHints = computed(() => {
  if (!props.palace) return []
  
  const hints: Array<{category: string, description: string}> = []
  const minorStars = props.palace.stars.filter(s => s.type === 'minor')
  
  const categories = {
    桃花: ['天姚', '紅鸞', '天喜', '咸池'],
    文藝: ['龍池', '鳳閣', '天才', '天壽'],
    德星: ['天德', '月德', '解神'],
    煞星: ['擎羊', '陀羅', '火星', '鈴星']
  }
  
  for (const [category, starNames] of Object.entries(categories)) {
    const hasCategory = minorStars.some(star => starNames.includes(star.name))
    if (hasCategory) {
      hints.push({ category: category.toLowerCase(), description: `${category}雜曜` })
    }
  }
  
  return hints.slice(0, 1) // 最多顯示1個
})

// Tooltip functions
const showHintDetail = (type: string, hint: any) => {
  switch (type) {
    case 'brightness':
      tooltipData.value = {
        title: `${hint.star} - ${hint.level}`,
        description: getBrightnessDescription(hint.level),
        influence: getBrightnessInfluence(hint.level),
        advice: getBrightnessAdvice(hint.level)
      }
      break
    case 'pattern':
      tooltipData.value = {
        title: hint.description,
        description: getPatternDescription(hint.description),
        influence: getPatternInfluence(hint.description),
        advice: getPatternAdvice(hint.description)
      }
      break
    case 'empty':
      tooltipData.value = {
        title: '空宮',
        description: '本宮沒有主星，需要借對宮的星曜來論命。',
        influence: '空宮代表該領域需要更多主動創造和努力。',
        advice: hint.borrowedInfo ? `可借用${hint.borrowedInfo.name}的星曜特質。` : '需要主動開創該領域的運勢。'
      }
      break
    case 'minor':
      tooltipData.value = {
        title: hint.description,
        description: getMinorStarDescription(hint.category),
        influence: getMinorStarInfluence(hint.category),
        advice: getMinorStarAdvice(hint.category)
      }
      break
  }
  
  // 根據位置調整tooltip顯示方向
  tooltipPosition.value = determineTooltipPosition()
  showTooltip.value = true
}

const closeTooltip = () => {
  showTooltip.value = false
}

const determineTooltipPosition = () => {
  // 所有解析度都使用中央懸浮視窗模式，提供更好的閱讀體驗
  return 'center'
}

// Tooltip content functions
const getBrightnessTooltip = (hint: any) => {
  return `點擊查看 ${hint.star}${hint.level} 的詳細說明`
}

const getPatternTooltip = (hint: any) => {
  return `點擊查看 ${hint.description} 格局的詳細說明`
}

const getEmptyPalaceTooltip = () => {
  return '點擊查看空宮的詳細說明'
}

const getMinorStarTooltip = (hint: any) => {
  return `點擊查看 ${hint.description} 的詳細說明`
}

// Description functions
const getBrightnessDescription = (level: string) => {
  const descriptions = {
    '廟': '星曜在此位置力量最強，發揮最佳效果。',
    '旺': '星曜在此位置力量強盛，運作良好。',
    '落陷': '星曜在此位置力量較弱，需要其他因素輔助。'
  }
  return descriptions[level as keyof typeof descriptions] || ''
}

const getBrightnessInfluence = (level: string) => {
  const influences = {
    '廟': '正面影響力最大，吉星更吉，凶星減凶。',
    '旺': '正面影響力強，整體運勢提升。',
    '落陷': '影響力減弱，需要配合其他星曜發揮作用。'
  }
  return influences[level as keyof typeof influences] || ''
}

const getBrightnessAdvice = (level: string) => {
  const advice = {
    '廟': '可充分發揮該星曜的特質，積極行動。',
    '旺': '善用星曜優勢，把握機會。',
    '落陷': '需要更多努力和配合，不宜過度依賴。'
  }
  return advice[level as keyof typeof advice] || ''
}

const getPatternDescription = (pattern: string) => {
  const descriptions = {
    '紫府同宮': '紫微星與天府星同在一宮，為帝王格局之一。',
    '左右同宮': '左輔右弼同宮，增強輔助力量。',
    '昌曲同宮': '文昌文曲同宮，利於學習和文藝發展。'
  }
  return descriptions[pattern as keyof typeof descriptions] || '特殊星曜組合，具有獨特影響力。'
}

const getPatternInfluence = (pattern: string) => {
  const influences = {
    '紫府同宮': '具有領導能力和權威性，適合管理職位。',
    '左右同宮': '人際關係良好，容易得到他人幫助。',
    '昌曲同宮': '學習能力強，文藝天分高。'
  }
  return influences[pattern as keyof typeof influences] || '帶來正面的綜合影響。'
}

const getPatternAdvice = (pattern: string) => {
  const advice = {
    '紫府同宮': '可朝向領導管理方向發展，培養領袖氣質。',
    '左右同宮': '多與人合作，善用人際網絡。',
    '昌曲同宮': '加強學習和創作，發展文藝才能。'
  }
  return advice[pattern as keyof typeof advice] || '善用格局優勢，積極發展。'
}

const getMinorStarDescription = (category: string) => {
  const descriptions = {
    '桃花': '與感情、人緣、異性緣相關的雜曜。',
    '文藝': '與才華、藝術、創作能力相關的雜曜。',
    '德星': '與道德、品格、貴人相關的雜曜。',
    '煞星': '帶有阻礙、挑戰意義的雜曜。'
  }
  return descriptions[category as keyof typeof descriptions] || '特殊類型的雜曜。'
}

const getMinorStarInfluence = (category: string) => {
  const influences = {
    '桃花': '增強人際魅力，但需注意感情問題。',
    '文藝': '提升創作才能和藝術天分。',
    '德星': '帶來貴人運和正面品格。',
    '煞星': '可能帶來挑戰，但也是成長機會。'
  }
  return influences[category as keyof typeof influences] || '帶來特殊的影響力。'
}

const getMinorStarAdvice = (category: string) => {
  const advice = {
    '桃花': '保持適度社交，理性處理感情。',
    '文藝': '多培養藝術興趣，發展創作能力。',
    '德星': '保持正面品格，善待他人。',
    '煞星': '化挑戰為動力，提升抗壓能力。'
  }
  return advice[category as keyof typeof advice] || '善用特質，平衡發展。'
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeTooltip()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.feature-hints-display {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brightness-hints,
.pattern-hints,
.minor-star-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.brightness-hint,
.pattern-hint,
.empty-palace-hint,
.minor-star-hint {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 10px;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 20px;
  margin: 2px 0;
}

.brightness-hint:hover,
.pattern-hint:hover,
.empty-palace-hint:hover,
.minor-star-hint:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.hint-icon {
  font-size: 9px;
}

.info-indicator {
  font-size: 8px;
  opacity: 0.7;
  margin-left: auto;
  transition: opacity 0.3s ease;
}

.brightness-hint:hover .info-indicator,
.pattern-hint:hover .info-indicator,
.empty-palace-hint:hover .info-indicator,
.minor-star-hint:hover .info-indicator {
  opacity: 1;
}

.hint-text {
  font-weight: 500;
}

/* 星曜亮度樣式 */
.brightness-廟 {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.brightness-旺 {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.brightness-落陷 {
  background: rgba(149, 165, 166, 0.1);
  color: #95a5a6;
  border: 1px solid rgba(149, 165, 166, 0.2);
}

/* 格局樣式 */
.pattern-auspicious {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.pattern-inauspicious {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

/* 空宮樣式 */
.empty-palace-hint {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  border: 1px solid rgba(158, 158, 158, 0.2);
  flex-direction: column;
  align-items: flex-start;
}

.borrowed-hint {
  margin-top: 1px;
}

.borrowed-text {
  font-size: 8px;
  color: #666;
}

/* 雜曜樣式 */
.minor-桃花 {
  background: rgba(233, 30, 99, 0.1);
  color: #e91e63;
  border: 1px solid rgba(233, 30, 99, 0.2);
}

.minor-文藝 {
  background: rgba(103, 58, 183, 0.1);
  color: #673ab7;
  border: 1px solid rgba(103, 58, 183, 0.2);
}

.minor-德星 {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.minor-煞星 {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

/* Tooltip 樣式 */
.feature-tooltip {
  position: fixed;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  max-width: 320px;
  min-width: 280px;
  z-index: 1000;
  animation: tooltipFadeIn 0.3s ease;
  backdrop-filter: blur(8px);
}

.feature-tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.feature-tooltip.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 450px;
  min-width: 360px;
  animation: tooltipFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
}

.tooltip-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #3498db, #2980b9);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-tooltip {
  background: rgba(0, 0, 0, 0.04);
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  font-weight: 300;
}

.close-tooltip:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  transform: scale(1.1);
}

.close-tooltip:active {
  transform: scale(0.95);
}

.tooltip-content {
  padding: 16px 20px 20px;
}

.tooltip-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4a5568;
  font-weight: 400;
}

.tooltip-influence,
.tooltip-advice {
  margin: 12px 0;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px 16px;
  border-radius: 8px;
}

.tooltip-influence {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(52, 152, 219, 0.12) 100%);
  border-left: 4px solid #3498db;
  color: #2c3e50;
  border-radius: 8px 8px 8px 4px;
}

.tooltip-advice {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.08) 0%, rgba(39, 174, 96, 0.12) 100%);
  border-left: 4px solid #27ae60;
  color: #2c3e50;
  border-radius: 8px 8px 8px 4px;
}

.tooltip-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: block;
  opacity: 0;
  animation: backdropFadeIn 0.3s ease forwards;
  backdrop-filter: blur(4px);
}

@keyframes tooltipFadeIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8) translateY(20px);
  }
  60% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.02) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(0px);
  }
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .feature-hints-display {
    gap: 1px;
  }
  
  .brightness-hint,
  .pattern-hint,
  .empty-palace-hint,
  .minor-star-hint {
    font-size: 9px;
    padding: 2px 4px;
  }
  
  .hint-icon {
    font-size: 8px;
  }

  .info-indicator {
    font-size: 7px;
  }
  
  .feature-tooltip.center {
    max-width: 95vw;
    min-width: 260px;
  }
  
  .tooltip-header h4 {
    font-size: 13px;
  }
  
  .tooltip-description {
    font-size: 12px;
  }
  
  .tooltip-influence,
  .tooltip-advice {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>