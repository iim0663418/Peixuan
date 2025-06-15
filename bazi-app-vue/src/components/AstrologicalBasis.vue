<template>
  <div class="astrological-basis">
    <!-- 命盤五行結構 -->
    <div class="five-elements-section">
      <h4 class="section-title">
        <span class="section-icon">🌟</span>
        命盤五行結構
      </h4>
      <div class="elements-container">
        <div class="elements-chart">
          <div class="element-bars">
            <div 
              v-for="element in fiveElementsWithReactivity" 
              :key="element.name"
              class="element-bar"
            >
              <div class="element-label">{{ element.name }}</div>
              <div class="element-progress">
                <div 
                  class="element-fill" 
                  :style="{ 
                    width: `${element.percentage}%`,
                    backgroundColor: element.color 
                  }"
                ></div>
              </div>
              <div class="element-value">{{ element.count }}</div>
            </div>
          </div>
        </div>
        
        <div class="elements-analysis">
          <div class="elements-summary">
            <h5>五行分析</h5>
            <div class="summary-content">
              <div class="dominant-element">
                <span class="label">主導五行：</span>
                <span class="value">{{ dominantElement.name }}</span>
              </div>
              <div class="element-balance">
                <span class="label">平衡度：</span>
                <span class="value">{{ elementBalance }}</span>
              </div>
              <div class="five-elements-bureau">
                <span class="label">五行局：</span>
                <span class="value">{{ chartData.fiveElementsBureau || '未知' }}</span>
              </div>
            </div>
          </div>
          
          <div class="elements-interpretation">
            <h5>五行特質解析</h5>
            <ul class="interpretation-list">
              <li v-for="(interpretation, index) in fiveElementsInterpretation" :key="index">
                {{ interpretation }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 關鍵格局詳解 -->
    <div class="key-patterns-section">
      <h4 class="section-title">
        <span class="section-icon">🔮</span>
        關鍵格局詳解
      </h4>
      <div class="patterns-container">
        <div v-if="keyPatternsWithReactivity.length > 0" class="patterns-grid">
          <div 
            v-for="(pattern, index) in keyPatternsWithReactivity" 
            :key="`pattern-${index}`"
            class="pattern-card"
            :class="getPatternClass(pattern)"
          >
            <div class="pattern-header">
              <div class="pattern-icon">{{ getPatternIcon(pattern) }}</div>
              <div class="pattern-name">{{ pattern.name }}</div>
              <div class="pattern-type">{{ getPatternType(pattern) }}</div>
            </div>
            
            <div class="pattern-content">
              <div class="pattern-description">{{ pattern.description }}</div>
              <div class="pattern-effects">
                <h6>主要影響</h6>
                <ul>
                  <li v-for="(effect, idx) in pattern.effects" :key="idx">{{ effect }}</li>
                </ul>
              </div>
              <div class="pattern-palaces">
                <h6>涉及宮位</h6>
                <div class="palace-tags">
                  <span 
                    v-for="palace in pattern.involvedPalaces" 
                    :key="palace"
                    class="palace-tag"
                  >
                    {{ palace }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="pattern-strength">
              <span class="strength-label">格局強度：</span>
              <div class="strength-bars">
                <div 
                  v-for="i in 5" 
                  :key="i"
                  :class="['strength-bar', { active: i <= pattern.strength }]"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-patterns">
          <div class="no-patterns-icon">🌸</div>
          <p>命盤中未發現特殊格局，屬於一般格局。</p>
          <p>這意味著您的命運主要靠後天努力來創造，有更大的自主性。</p>
        </div>
      </div>
    </div>

    <!-- 分析方法說明 -->
    <div class="methodology-section">
      <h4 class="section-title">
        <span class="section-icon">📚</span>
        分析方法說明
      </h4>
      <div class="methodology-container">
        <div class="methodology-content">
          <div class="methodology-card">
            <h5>使用的命理系統</h5>
            <div class="systems-list">
              <div class="system-item">
                <span class="system-icon">🔴</span>
                <div class="system-info">
                  <div class="system-name">紫微斗數</div>
                  <div class="system-desc">分析十二宮位、星曜分佈與四化飛星</div>
                </div>
              </div>
              <div class="system-item">
                <span class="system-icon">🟡</span>
                <div class="system-info">
                  <div class="system-name">八字命理</div>
                  <div class="system-desc">分析天干地支、五行生剋與十神關係</div>
                </div>
              </div>
              <div class="system-item">
                <span class="system-icon">🔵</span>
                <div class="system-info">
                  <div class="system-name">現代心理學</div>
                  <div class="system-desc">結合性格分析與心理發展理論</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="methodology-card">
            <h5>計算參數</h5>
            <div class="parameters-grid">
              <div class="parameter-item">
                <span class="param-label">生辰資料</span>
                <span class="param-value">{{ birthInfo }}</span>
              </div>
              <div class="parameter-item">
                <span class="param-label">起盤方式</span>
                <span class="param-value">真太陽時</span>
              </div>
              <div class="parameter-item">
                <span class="param-label">星曜系統</span>
                <span class="param-value">三合派</span>
              </div>
              <div class="parameter-item">
                <span class="param-label">四化飛星</span>
                <span class="param-value">生年四化</span>
              </div>
            </div>
          </div>
          
          <div class="methodology-card">
            <h5>分析流程</h5>
            <div class="process-steps">
              <div v-for="(step, index) in analysisSteps" :key="index" class="process-step">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-description">{{ step.description }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="methodology-card">
            <h5>重要提醒</h5>
            <div class="disclaimers">
              <div class="disclaimer-item">
                <span class="disclaimer-icon">⚠️</span>
                <div class="disclaimer-text">
                  本分析僅供參考，不應作為人生決策的唯一依據。
                </div>
              </div>
              <div class="disclaimer-item">
                <span class="disclaimer-icon">🔄</span>
                <div class="disclaimer-text">
                  命理分析描述的是趨勢和潛能，實際發展仍需個人努力。
                </div>
              </div>
              <div class="disclaimer-item">
                <span class="disclaimer-icon">🎯</span>
                <div class="disclaimer-text">
                  建議將分析結果作為自我了解和成長的參考工具。
                </div>
              </div>
            </div>
          </div>
          
          <div class="methodology-card">
            <h5>報告生成資訊</h5>
            <div class="generation-info">
              <div class="info-item">
                <span class="info-label">生成時間：</span>
                <span class="info-value">{{ generationTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">系統版本：</span>
                <span class="info-value">佩璇命理系統 v2.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">分析深度：</span>
                <span class="info-value">綜合全面分析</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { PurpleStarChart, Palace, Star } from '@/types/astrologyTypes'

// Props
interface Props {
  chartData: PurpleStarChart
}

const props = defineProps<Props>()

// 響應式資料更新標記
const updateKey = ref(0)

// 五行對應顏色
const elementColors = {
  '金': '#FFD700',
  '木': '#32CD32',
  '水': '#4169E1',
  '火': '#FF4500',
  '土': '#8B4513'
}

// 五行分析
const fiveElements = computed(() => {
  const elements = {
    '金': 0,
    '木': 0,
    '水': 0,
    '火': 0,
    '土': 0
  }
  
  // 統計各宮位星曜的五行屬性
  if (props.chartData?.palaces) {
    console.log('AstrologicalBasis: 五行分析 - 宮位數量:', props.chartData.palaces.length);
    props.chartData.palaces.forEach(palace => {
      palace.stars?.forEach(star => {
        if (star.element && elements.hasOwnProperty(star.element)) {
          elements[star.element as keyof typeof elements]++
        }
      })
    })
    console.log('AstrologicalBasis: 五行統計結果:', elements);
  } else {
    console.log('AstrologicalBasis: 五行分析 - 沒有命盤宮位資料');
  }
  
  const total = Object.values(elements).reduce((sum, count) => sum + count, 0)
  
  return Object.entries(elements).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: elementColors[name as keyof typeof elementColors]
  }))
})

// 主導五行
const dominantElement = computed(() => {
  return fiveElements.value.reduce((max, current) => 
    current.count > max.count ? current : max
  )
})

// 五行平衡度
const elementBalance = computed(() => {
  const counts = fiveElements.value.map(e => e.count)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const variance = max - min
  
  if (variance <= 1) return '極佳'
  if (variance <= 2) return '良好'
  if (variance <= 3) return '一般'
  if (variance <= 4) return '偏差'
  return '失衡'
})

// 五行特質解析
const fiveElementsInterpretation = computed(() => {
  const interpretations: string[] = []
  const dominant = dominantElement.value
  
  if (dominant.count > 0) {
    switch (dominant.name) {
      case '金':
        interpretations.push('金行主導：性格堅毅，做事有原則，重視規則和秩序')
        break
      case '木':
        interpretations.push('木行主導：富有生命力，善於成長和創新，適應力強')
        break
      case '水':
        interpretations.push('水行主導：思維靈活，直覺敏銳，善於變通和適應')
        break
      case '火':
        interpretations.push('火行主導：熱情積極，行動力強，具有領導魅力')
        break
      case '土':
        interpretations.push('土行主導：穩重踏實，重視安全感，具有包容性')
        break
    }
  }
  
  // 分析五行平衡狀況
  const balance = elementBalance.value
  switch (balance) {
    case '極佳':
      interpretations.push('五行分佈均衡，個性發展全面，適應力強')
      break
    case '良好':
      interpretations.push('五行分佈相對均衡，個性穩定，發展潛力大')
      break
    case '一般':
      interpretations.push('五行分佈基本平衡，需要注意弱勢五行的補強')
      break
    case '偏差':
      interpretations.push('五行分佈不均，建議透過後天努力來平衡發展')
      break
    case '失衡':
      interpretations.push('五行分佈失衡，需要特別注意個性的調整和發展')
      break
  }
  
  return interpretations
})

// 關鍵格局分析
const keyPatterns = computed(() => {
  const patterns: Array<{
    name: string
    description: string
    effects: string[]
    involvedPalaces: string[]
    strength: number
    type: 'auspicious' | 'inauspicious' | 'special'
  }> = []
  
  if (!props.chartData?.palaces) {
    console.log('AstrologicalBasis: 格局分析 - 沒有命盤宮位資料');
    return patterns;
  }
  
  console.log('AstrologicalBasis: 格局分析 - 宮位數量:', props.chartData.palaces.length);
  
  // 分析格局
  const palaces = props.chartData.palaces
  
  // 檢查紫府夾命格
  const mingPalace = palaces.find(p => p.name === '命宮')
  if (mingPalace) {
    const hasZiwei = mingPalace.stars?.some(s => s.name === '紫微')
    const hasTianfu = mingPalace.stars?.some(s => s.name === '天府')
    
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
      })
    }
  }
  
  // 檢查左右夾命格
  const leftRight = palaces.some(p => 
    p.stars?.some(s => s.name === '左輔') && 
    p.stars?.some(s => s.name === '右弼')
  )
  
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
    })
  }
  
  // 檢查文昌文曲格
  const wenchangWenqu = palaces.some(p => 
    p.stars?.some(s => s.name === '文昌') && 
    p.stars?.some(s => s.name === '文曲')
  )
  
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
    })
  }
  
  // 檢查火鈴夾命格（不吉格局）
  const fireRing = palaces.some(p => 
    p.stars?.some(s => s.name === '火星') && 
    p.stars?.some(s => s.name === '鈴星')
  )
  
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
    })
  }
  
  return patterns
})

// 獲取格局樣式類別
const getPatternClass = (pattern: any) => {
  return `pattern-${pattern.type}`
}

// 獲取格局圖示
const getPatternIcon = (pattern: any) => {
  const icons = {
    'auspicious': '🌟',
    'inauspicious': '⚠️',
    'special': '🔮'
  }
  return icons[pattern.type as keyof typeof icons] || '🔸'
}

// 獲取格局類型文字
const getPatternType = (pattern: any) => {
  const types = {
    'auspicious': '吉格',
    'inauspicious': '凶格',
    'special': '特殊格局'
  }
  return types[pattern.type as keyof typeof types] || '一般格局'
}

// 生辰資訊
const birthInfo = computed(() => {
  // 這裡應該從 props 中獲取生辰資料
  // 暫時使用假資料
  return '1990年1月1日 12:00 (示例)'
})

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
]

// 報告生成時間
const generationTime = computed(() => {
  return new Date().toLocaleString('zh-TW')
})

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
  } else {
    console.log('AstrologicalBasis: 資料無效，跳過更新');
  }
}, { deep: true, immediate: true })

// 監聽全域命盤更新事件
const handleGlobalChartUpdate = (event: CustomEvent) => {
  console.log('AstrologicalBasis: 收到全域命盤更新事件', event.detail);
  updateKey.value++ // 強制更新所有計算屬性
}

// 添加全域事件監聽器
if (typeof window !== 'undefined') {
  window.addEventListener('purple-star-chart-updated', handleGlobalChartUpdate as EventListener);
  window.addEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate as EventListener);
}

// 在五行分析中使用更新標記以確保響應性
const fiveElementsWithReactivity = computed(() => {
  // 強制響應更新標記變化
  const _ = updateKey.value
  return fiveElements.value
})

const keyPatternsWithReactivity = computed(() => {
  // 強制響應更新標記變化  
  const _ = updateKey.value
  return keyPatterns.value
})

// 生命週期鉤子
onMounted(() => {
  console.log('AstrologicalBasis: 組件掛載，初始化完成');
  console.log('掛載時 chartData:', props.chartData);
  console.log('掛載時 palaces 數量:', props.chartData?.palaces?.length || 0);
  
  // 檢查資料內容
  if (props.chartData?.palaces) {
    console.log('宮位列表:', props.chartData.palaces.map(p => p.name));
    
    // 檢查星曜的五行屬性
    const starsWithElements = props.chartData.palaces.flatMap(palace => 
      palace.stars?.filter(star => star.element) || []
    );
    console.log('有五行屬性的星曜:', starsWithElements.length);
  }
})

// 組件卸載時清除事件監聽器
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('purple-star-chart-updated', handleGlobalChartUpdate as EventListener);
    window.removeEventListener('purple-star-chart-force-updated', handleGlobalChartUpdate as EventListener);
    console.log('AstrologicalBasis: 已清除全域事件監聽器');
  }
})

// 手動刷新分析
const refreshAnalysis = () => {
  console.log('AstrologicalBasis: 手動刷新分析');
  updateKey.value++
  
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
}

// 調試函數：輸出當前資料結構
const logCurrentDataStructure = () => {
  console.log('=== AstrologicalBasis 當前資料結構 ===');
  console.log('命盤資料:', props.chartData);
  console.log('五行分析:', fiveElementsWithReactivity.value);
  console.log('主導五行:', dominantElement.value);
  console.log('五行平衡度:', elementBalance.value);
  console.log('關鍵格局:', keyPatternsWithReactivity.value);
  console.log('=====================================');
}

// 在全域暴露調試函數（開發環境）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugAstrologicalBasis = logCurrentDataStructure;
  (window as any).refreshAstrologicalBasis = refreshAnalysis;
}
</script>

<style scoped>
.astrological-basis {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafe 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 
              0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
}

.astrological-basis::before {
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
  font-size: 1.3rem;
  font-weight: 600;
  padding: 24px 24px 0 24px;
}

.section-icon {
  font-size: 1.4rem;
}

/* 五行結構 */
.five-elements-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
}

.elements-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 0 24px;
}

.elements-chart {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.element-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.element-bar {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 12px;
}

.element-label {
  font-weight: 500;
  color: #2c3e50;
  text-align: center;
}

.element-progress {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.element-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s ease;
  position: relative;
}

.element-value {
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.elements-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.elements-summary {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #2196f3;
}

.elements-summary h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dominant-element,
.element-balance,
.five-elements-bureau {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #6c757d;
  font-size: 0.9rem;
}

.value {
  font-weight: 600;
  color: #2c3e50;
}

.elements-interpretation {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.elements-interpretation h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.interpretation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interpretation-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
  line-height: 1.5;
  color: #495057;
}

.interpretation-list li:last-child {
  border-bottom: none;
}

/* 關鍵格局 */
.key-patterns-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
}

.patterns-container {
  padding: 0 24px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.pattern-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #6c757d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pattern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.pattern-auspicious {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
}

.pattern-inauspicious {
  border-left-color: #dc3545;
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
}

.pattern-special {
  border-left-color: #6f42c1;
  background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e8 100%);
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pattern-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.pattern-name {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.pattern-type {
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  color: #495057;
}

.pattern-content {
  margin-bottom: 16px;
}

.pattern-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #495057;
  margin-bottom: 12px;
}

.pattern-effects h6,
.pattern-palaces h6 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.pattern-effects ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}

.pattern-effects li {
  padding: 4px 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #495057;
  position: relative;
  padding-left: 16px;
}

.pattern-effects li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #6c757d;
}

.palace-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.palace-tag {
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #495057;
}

.pattern-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.strength-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.strength-bars {
  display: flex;
  gap: 3px;
}

.strength-bar {
  width: 16px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
}

.strength-bar.active {
  background: #28a745;
}

.no-patterns {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
}

.no-patterns-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

/* 分析方法說明 */
.methodology-section {
  padding-bottom: 24px;
}

.methodology-container {
  padding: 0 24px;
}

.methodology-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.methodology-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
}

.methodology-card h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.systems-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.system-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.system-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.system-desc {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.param-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.param-value {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.process-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  background: #667eea;
  color: #f8f9fa;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.step-description {
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
}

.disclaimers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.disclaimer-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.disclaimer-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.disclaimer-text {
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
}

.generation-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .elements-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .patterns-grid {
    grid-template-columns: 1fr;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.2rem;
    padding: 16px 16px 0 16px;
  }
  
  .elements-container,
  .patterns-container,
  .methodology-container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .element-bar {
    grid-template-columns: 50px 1fr 30px;
    gap: 8px;
  }
  
  .pattern-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .process-step {
    gap: 12px;
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}
</style>