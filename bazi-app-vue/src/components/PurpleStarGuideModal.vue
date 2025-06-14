<template>
  <div v-if="visible" class="guide-modal-overlay" @click="closeModal">
    <div class="guide-modal" @click.stop>
      <div class="guide-header">
        <h2>🔮 紫微斗數進階功能指南</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>
      
      <div class="guide-content">
        <!-- 桌面和平板版本的 tabs -->
        <div class="guide-tabs desktop-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-title full-title">{{ tab.title }}</span>
            <span class="tab-title short-title">{{ getShortTitle(tab.title) }}</span>
          </button>
        </div>

        <!-- 手機版本的下拉選單 -->
        <div class="mobile-tab-selector">
          <select 
            v-model="activeTab" 
            class="mobile-select"
          >
            <option 
              v-for="tab in tabs" 
              :key="tab.id"
              :value="tab.id"
            >
              {{ tab.icon }} {{ tab.title }}
            </option>
          </select>
          
          <!-- 當前選中的標籤顯示 -->
          <div class="current-tab-display">
            <span class="current-icon">{{ getCurrentTab().icon }}</span>
            <span class="current-title">{{ getCurrentTab().title }}</span>
          </div>
        </div>

        <div class="tab-content">
          <!-- 星曜亮度指南 -->
          <div v-if="activeTab === 'brightness'" class="guide-section">
            <h3>✨ 星曜亮度（廟旺陷落）</h3>
            <div class="guide-intro">
              <p>星曜亮度是紫微斗數中評估星曜力量強弱的重要指標，就像星星在不同位置有不同的亮度一樣。</p>
            </div>
            
            <div class="brightness-levels">
              <div v-for="level in brightnessLevels" :key="level.name" class="level-item">
                <span :class="['level-badge', `brightness-${level.name}`]">{{ level.name }}</span>
                <div class="level-info">
                  <h4>{{ level.title }}</h4>
                  <p>{{ level.description }}</p>
                  <div class="level-example">
                    <strong>實際意義：</strong>{{ level.meaning }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="guide-tips">
              <h4>💡 如何運用亮度資訊：</h4>
              <ul>
                <li><strong>廟、旺</strong>的星曜：發揮這些星曜的正面特質，是您的天賦優勢</li>
                <li><strong>得地、利益</strong>：穩定發展的領域，適合長期投入</li>
                <li><strong>平和</strong>：需要外力協助或後天努力來加強</li>
                <li><strong>不得地、落陷</strong>：需要特別注意，透過學習和修養來改善</li>
              </ul>
            </div>
          </div>

          <!-- 格局分析指南 -->
          <div v-if="activeTab === 'patterns'" class="guide-section">
            <h3>🔮 格局分析</h3>
            <div class="guide-intro">
              <p>格局是指命盤中星曜的特殊組合，就像音樂中的和弦一樣，不同的組合會產生不同的效果。</p>
            </div>
            
            <div class="pattern-types">
              <div class="pattern-type">
                <span class="pattern-badge auspicious">吉格</span>
                <div class="pattern-info">
                  <h4>吉利格局</h4>
                  <p>這些格局帶來正面的能量和機會，是您人生中的幸運模式。</p>
                  <div class="pattern-examples">
                    <strong>常見吉格：</strong>紫府夾命格、左右夾命格、文昌文曲格等
                  </div>
                </div>
              </div>
              
              <div class="pattern-type">
                <span class="pattern-badge inauspicious">凶格</span>
                <div class="pattern-info">
                  <h4>挑戰格局</h4>
                  <p>這些格局提醒您注意潛在的挑戰，透過智慧和努力可以化解。</p>
                  <div class="pattern-examples">
                    <strong>常見凶格：</strong>火鈴夾命格、羊陀夾命格、日月反背格等
                  </div>
                </div>
              </div>
              
              <div class="pattern-type">
                <span class="pattern-badge neutral">中性格局</span>
                <div class="pattern-info">
                  <h4>平衡格局</h4>
                  <p>這些格局較為中性，影響取決於其他因素和個人的運用方式。</p>
                </div>
              </div>
            </div>
            
            <div class="guide-tips">
              <h4>💡 格局解讀要點：</h4>
              <ul>
                <li>格局是命盤的「主旋律」，影響人生的大方向</li>
                <li>吉格要善用，凶格要化解，中性格局要用智慧引導</li>
                <li>多個格局並存時，要綜合分析其相互影響</li>
                <li>格局提供方向，但最終成就仍需要個人努力</li>
              </ul>
            </div>
          </div>

          <!-- 空宮指南 -->
          <div v-if="activeTab === 'empty'" class="guide-section">
            <h3>○ 空宮與借星</h3>
            <div class="guide-intro">
              <p>空宮是指某個宮位沒有主星駐守，就像一間空房子。但在紫微斗數中，空宮可以「借用」對面宮位的星曜。</p>
            </div>
            
            <div class="empty-palace-concept">
              <div class="concept-item">
                <h4>🏠 什麼是空宮？</h4>
                <p>當某個宮位沒有主星（紫微、天機、太陽等14顆主星）時，就稱為空宮。</p>
              </div>
              
              <div class="concept-item">
                <h4>⭐ 借星機制</h4>
                <p>空宮可以借用正對面宮位的主星來進行分析，但影響力約為原本的七成。</p>
                <div class="borrowing-example">
                  <div class="example-palace">命宮（空宮）</div>
                  <div class="arrow">←借星←</div>
                  <div class="example-palace">遷移宮（有主星）</div>
                </div>
              </div>
              
              <div class="concept-item">
                <h4>💪 空宮的意義</h4>
                <p>空宮並非不好，而是代表這個領域需要：</p>
                <ul>
                  <li><strong>主動學習</strong> - 沒有天生的優勢，需要後天努力</li>
                  <li><strong>創造機會</strong> - 要主動爭取，不能被動等待</li>
                  <li><strong>借助外力</strong> - 可以從對宮或他人身上學習</li>
                  <li><strong>彈性發展</strong> - 有更多可能性和變化空間</li>
                </ul>
              </div>
            </div>
            
            <div class="guide-tips">
              <h4>💡 空宮應對策略：</h4>
              <ul>
                <li>不要害怕空宮，它代表更大的發展潛力</li>
                <li>多學習對宮星曜的正面特質</li>
                <li>主動出擊，不要等待機會自己來</li>
                <li>借助他人的力量和經驗來成長</li>
              </ul>
            </div>
          </div>

          <!-- 雜曜指南 -->
          <div v-if="activeTab === 'minor'" class="guide-section">
            <h3>⭐ 雜曜分析</h3>
            <div class="guide-intro">
              <p>雜曜是輔助性的星曜，雖然力量不如主星強大，但能為命盤增添特殊的色彩和細節。</p>
            </div>
            
            <div class="minor-star-categories">
              <div class="category-item">
                <span class="category-badge peach">桃花類</span>
                <div class="category-info">
                  <h4>桃花雜曜</h4>
                  <p>影響人際關係、魅力、感情運勢</p>
                  <div class="star-examples">如：天姚、紅鸞、天喜、咸池</div>
                </div>
              </div>
              
              <div class="category-item">
                <span class="category-badge art">文藝類</span>
                <div class="category-info">
                  <h4>文藝雜曜</h4>
                  <p>增強藝術天分、品味、創造力</p>
                  <div class="star-examples">如：龍池、鳳閣、天才、天壽</div>
                </div>
              </div>
              
              <div class="category-item">
                <span class="category-badge virtue">德星類</span>
                <div class="category-info">
                  <h4>德星雜曜</h4>
                  <p>帶來貴人運、化解災難、道德品格</p>
                  <div class="star-examples">如：天德、月德、解神</div>
                </div>
              </div>
              
              <div class="category-item">
                <span class="category-badge malefic">煞星類</span>
                <div class="category-info">
                  <h4>煞星雜曜</h4>
                  <p>提醒注意的挑戰和障礙</p>
                  <div class="star-examples">如：擎羊、陀羅、火星、鈴星</div>
                </div>
              </div>
            </div>
            
            <div class="guide-tips">
              <h4>💡 雜曜運用原則：</h4>
              <ul>
                <li><strong>輔助參考</strong> - 雜曜是主星的補充，不是主要依據</li>
                <li><strong>特殊才能</strong> - 關注文藝、桃花類雜曜帶來的特殊天賦</li>
                <li><strong>趨吉避凶</strong> - 善用德星化解煞星的負面影響</li>
                <li><strong>平衡發展</strong> - 不要因雜曜而忽視主星的重要性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="guide-footer">
        <div class="footer-note">
          <p>💡 提示：這些進階功能幫助您更深入理解命盤，但請記住，命運掌握在自己手中！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('brightness')

const tabs = [
  { id: 'brightness', title: '星曜亮度', icon: '✨' },
  { id: 'patterns', title: '格局分析', icon: '🔮' },
  { id: 'empty', title: '空宮借星', icon: '○' },
  { id: 'minor', title: '雜曜分析', icon: '⭐' }
]

const brightnessLevels = [
  {
    name: '廟',
    title: '廟 - 最強勢',
    description: '星曜在此位置能量發揮到極致，如神明在廟中受到最高敬仰',
    meaning: '天賦異稟，在此領域有卓越表現，容易成為佼佼者'
  },
  {
    name: '旺',
    title: '旺 - 強勢',
    description: '星曜力量強大，表現優異，如春天萬物旺盛生長',
    meaning: '在此領域有優勢，努力就能獲得很好的成果'
  },
  {
    name: '得地',
    title: '得地 - 穩定',
    description: '星曜在適合的位置，表現穩定良好',
    meaning: '適合穩定發展，按部就班能有不錯的成就'
  },
  {
    name: '利益',
    title: '利益 - 平穩',
    description: '星曜表現平穩，有一定的助益',
    meaning: '需要努力才能見到成效，但付出會有回報'
  },
  {
    name: '平和',
    title: '平和 - 中性',
    description: '星曜影響適中，不特別強也不特別弱',
    meaning: '需要借助其他力量來加強，或通過學習來提升'
  },
  {
    name: '不得地',
    title: '不得地 - 較弱',
    description: '星曜在此位置較難發揮，影響有限',
    meaning: '需要加倍努力，或尋求他人協助來改善'
  },
  {
    name: '落陷',
    title: '落陷 - 最弱',
    description: '星曜力量最弱，需要調和與化解',
    meaning: '此領域是挑戰所在，需要特別的智慧和修養來轉化'
  }
]

const closeModal = () => {
  emit('close')
}

const getCurrentTab = () => {
  return tabs.find(tab => tab.id === activeTab.value) || tabs[0]
}

const getShortTitle = (title: string): string => {
  const shortTitles: Record<string, string> = {
    '星曜亮度': '亮度',
    '格局分析': '格局', 
    '空宮借星': '空宮',
    '雜曜分析': '雜曜'
  }
  return shortTitles[title] || title
}
</script>

<style scoped>
.guide-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  box-sizing: border-box;
}

.guide-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.guide-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.guide-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 確保 flex 子元素能正確計算高度 */
}

/* guide-tabs 樣式優化 - 增強滾動體驗和響應式設計 */
.guide-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  overflow-x: auto;
  position: relative;
  /* 確保 tabs 不會被擠壓 */
  flex-shrink: 0;
  min-height: 56px;
  /* 改善滾動條樣式 */
  scrollbar-width: thin;
  scrollbar-color: #667eea transparent;
  /* 添加 snap 效果，讓滾動更順暢 */
  scroll-snap-type: x mandatory;
  /* 添加陰影提示有更多內容 */
  box-shadow: inset -10px 0 10px -10px rgba(0,0,0,0.1);
}

.guide-tabs::-webkit-scrollbar {
  height: 6px;
}

.guide-tabs::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}

.guide-tabs::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
  transition: background 0.2s;
}

.guide-tabs::-webkit-scrollbar-thumb:hover {
  background: #5a67d8;
}

/* 滾動提示效果 */
.guide-tabs::after {
  content: '›';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  font-size: 18px;
  font-weight: bold;
  pointer-events: none;
  z-index: 2;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.guide-tabs:hover::after {
  opacity: 1;
}

/* 當滾動到底時隱藏提示 */
.guide-tabs.scrolled-to-end::after {
  display: none;
}

.tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 56px;
  padding: 0 16px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  min-width: 100px;
  flex-shrink: 0;
  position: relative;
  /* 添加 snap 點 */
  scroll-snap-align: start;
}

.tab-button:hover {
  background: #e9ecef;
  color: #495057;
  /* 添加hover時的底部強調線 */
  border-bottom-color: #adb5bd;
}

.tab-button.active {
  background: white;
  color: #667eea;
  /* 強調當前分頁的底部線 */
  border-bottom-color: #667eea;
  font-weight: 600;
  /* 避免與其他分頁視覺重疊 */
  z-index: 1;
}

.tab-icon {
  font-size: 16px;
}

/* 標題顯示控制 */
.tab-title.short-title {
  display: none;
}

.tab-title.full-title {
  display: inline;
}

/* 內容區塊留白優化 - 依據8px grid系統 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  /* 增加頂部留白，標題與內容間明顯間距 */
  padding: 32px 32px 24px;
  /* 確保內容區域能正確計算可用空間 */
  min-height: 0;
}

/* 文字層次清晰化 */
.guide-section h3 {
  /* 主標題間距調整 */
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  /* 主標題底部分隔線 */
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;
}

.guide-intro {
  /* 內容區塊與標題間明顯間距 */
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9ff;
  border-left: 4px solid #667eea;
  border-radius: 6px;
  /* 添加微妙陰影提升層次感 */
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
}

.guide-intro p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 15px;
}

/* 星曜亮度樣式 - 各說明卡片上下留白一致 */
.brightness-levels {
  display: flex;
  flex-direction: column;
  /* 卡片間一致的間距 */
  gap: 20px;
  margin-bottom: 32px;
}

.level-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  /* 統一的內邊距 */
  padding: 20px;
  background: white;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  transition: all 0.25s ease;
  /* 提升層次感的陰影 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.level-item:hover {
  /* hover效果增強 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* 色彩標籤優化 - 確保與內容區分明顯 */
.level-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  min-width: 48px;
  text-align: center;
  flex-shrink: 0;
  /* 添加白色文字陰影增強可讀性 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  /* 確保色塊與背景對比度 */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 色彩規範 - 避免色差過大影響閱讀 */
.brightness-廟 { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.brightness-旺 { background: linear-gradient(135deg, #f39c12, #e67e22); }
.brightness-得地 { background: linear-gradient(135deg, #27ae60, #229954); }
.brightness-利益 { background: linear-gradient(135deg, #3498db, #2980b9); }
.brightness-平和 { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }
.brightness-不得地 { background: linear-gradient(135deg, #8d6e63, #6d4c41); }
.brightness-落陷 { background: linear-gradient(135deg, #607d8b, #546e7a); }

/* 文字層次清晰化 */
.level-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  /* 副標題層次 */
  line-height: 1.3;
}

.level-info p {
  margin: 0 0 12px 0;
  color: #5a6c7d;
  line-height: 1.5;
  font-size: 14px;
}

/* 輔助說明統一樣式 */
.level-example {
  background: #f1f3f4;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  color: #5f6368;
  /* 統一小字型 */
  line-height: 1.4;
  border-left: 3px solid #e8eaed;
}

/* 格局分析樣式 */
.pattern-types {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.pattern-type {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.pattern-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  flex-shrink: 0;
}

.pattern-badge.auspicious { background: #4caf50; }
.pattern-badge.inauspicious { background: #f44336; }
.pattern-badge.neutral { background: #ff9800; }

.pattern-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.pattern-info p {
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.5;
}

.pattern-examples {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
}

/* 空宮樣式 */
.empty-palace-concept {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.concept-item {
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.concept-item h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.concept-item p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.borrowing-example {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.example-palace {
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.arrow {
  color: #667eea;
  font-weight: bold;
}

/* 雜曜樣式 */
.minor-star-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.category-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  flex-shrink: 0;
}

.category-badge.peach { background: #e91e63; }
.category-badge.art { background: #673ab7; }
.category-badge.virtue { background: #4caf50; }
.category-badge.malefic { background: #f44336; }

.category-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
}

.category-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.star-examples {
  background: #f8f9fa;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
}

/* 通用樣式 - 輔助說明統一規範 */
.guide-tips {
  background: #fffbf0;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #f39c12;
  margin-top: 24px;
  /* 統一底色與區塊對齊 */
  box-shadow: 0 2px 6px rgba(243, 156, 18, 0.08);
}

.guide-tips h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.guide-tips ul {
  margin: 0;
  padding-left: 20px;
}

.guide-tips li {
  margin-bottom: 8px;
  color: #5a6c7d;
  line-height: 1.5;
  /* 統一小字型 */
  font-size: 13px;
}

.guide-footer {
  padding: 20px 32px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.footer-note p {
  margin: 0;
  color: #666;
  text-align: center;
  font-style: italic;
}

/* 手機版下拉選單樣式 */
.mobile-tab-selector {
  display: none;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 12px 16px;
  /* 確保手機版選單也不會被擠壓 */
  flex-shrink: 0;
}

.mobile-select {
  display: none;
}

.current-tab-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.current-icon {
  font-size: 18px;
}

.current-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 響應式設計 - 支援桌機與平板閱讀 */
@media (max-width: 1024px) {
  .guide-modal {
    max-width: 720px;
  }
  
  .tab-content {
    padding: 24px 20px;
  }
  
  .brightness-levels .level-item {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .guide-modal-overlay {
    padding: 10px;
  }
  
  .guide-header {
    padding: 16px 20px;
  }
  
  .guide-header h2 {
    font-size: 20px;
  }
  
  /* 在平板上使用簡短標題 */
  .tab-title.full-title {
    display: none;
  }
  
  .tab-title.short-title {
    display: inline;
  }
  
  /* tab按鈕響應式調整 */
  .tab-button {
    height: 52px;
    min-width: 70px;
    padding: 0 12px;
    font-size: 13px;
  }
  
  .tab-icon {
    font-size: 14px;
  }
  
  .tab-content {
    padding: 20px 16px;
  }
  
  /* 標題層次響應式 */
  .guide-section h3 {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .guide-intro {
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .guide-intro p {
    font-size: 14px;
  }
  
  /* 卡片響應式調整 */
  .brightness-levels {
    gap: 16px;
  }
  
  .brightness-levels .level-item,
  .pattern-types .pattern-type {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .level-badge {
    align-self: flex-start;
    margin-bottom: 8px;
  }
  
  .level-info h4 {
    font-size: 15px;
  }
  
  .level-info p {
    font-size: 13px;
  }
  
  .level-example {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .minor-star-categories {
    grid-template-columns: 1fr;
  }
  
  .borrowing-example {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .example-palace {
    font-size: 11px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .guide-modal {
    margin: 5px;
    max-height: 95vh;
  }
  
  .guide-header {
    padding: 12px 16px;
  }
  
  .guide-header h2 {
    font-size: 18px;
  }
  
  /* 在手機上隱藏桌面版 tabs，顯示手機版選單 */
  .desktop-tabs {
    display: none;
  }
  
  .mobile-tab-selector {
    display: block;
  }
  
  .tab-content {
    padding: 16px 12px;
  }
  
  .brightness-levels .level-item {
    padding: 12px;
  }
  
  .level-badge {
    min-width: 40px;
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>