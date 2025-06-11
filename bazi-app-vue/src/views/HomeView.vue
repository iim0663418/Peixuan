<template>
  <div class="home">
    <!-- 頁面標題與介紹 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="site-title">{{ $t('common.app_name') }}</h1>
        <p class="site-subtitle">傳統命理智慧，現代科技精算</p>
        <p class="site-description">
          透過古法精準計算，為您解析人生命盤，洞察性格特質與運勢走向
        </p>
      </div>
    </div>

    <!-- 主要服務區塊 -->
    <div class="services-section">
      <div class="container">
        <h2 class="section-title">命理服務</h2>
        <div class="services-grid">
          
          <!-- 紫微斗數服務 -->
          <div class="service-card purple-star">
            <div class="service-icon">
              <div class="icon-circle purple">
                <span class="icon-text">紫</span>
              </div>
            </div>
            <div class="service-content">
              <h3>{{ $t('astrology.purple_star') }}</h3>
              <p class="service-description">
                古代帝王之學，透過紫微斗數十二宮位排盤，深入分析您的性格特質、事業財運、感情婚姻與健康狀況
              </p>
              <div class="service-features">
                <span class="feature-tag">命宮分析</span>
                <span class="feature-tag">十二宮位</span>
                <span class="feature-tag">大小限運</span>
                <span class="feature-tag">流年運勢</span>
              </div>
              <div class="service-actions">
                <router-link to="/purple-star" class="btn btn-primary">
                  開始計算紫微命盤
                </router-link>
                <button class="btn btn-secondary" @click="showPurpleStarInfo = true">
                  了解更多
                </button>
              </div>
            </div>
          </div>

          <!-- 八字命理服務 -->
          <div class="service-card bazi">
            <div class="service-icon">
              <div class="icon-circle orange">
                <span class="icon-text">八</span>
              </div>
            </div>
            <div class="service-content">
              <h3>{{ $t('astrology.bazi') }}</h3>
              <p class="service-description">
                四柱八字排盤，分析年月日時天干地支，揭示五行配置、十神關係與人生運勢軌跡
              </p>
              <div class="service-features">
                <span class="feature-tag">四柱排盤</span>
                <span class="feature-tag">五行分析</span>
                <span class="feature-tag">十神配置</span>
                <span class="feature-tag">起運計算</span>
              </div>
              <div class="service-actions">
                <router-link to="/bazi" class="btn btn-primary">
                  開始計算八字排盤
                </router-link>
                <button class="btn btn-secondary" @click="showBaziInfo = true">
                  了解更多
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 使用指南 -->
    <div class="guide-section">
      <div class="container">
        <h2 class="section-title">使用指南</h2>
        <div class="guide-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>選擇服務</h4>
              <p>根據您的需求選擇紫微斗數或八字命理服務</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>輸入資料</h4>
              <p>準確填入您的出生日期、時間和性別資訊</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>開始計算</h4>
              <p>系統將運用古法精準計算您的個人命盤</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>查看結果</h4>
              <p>獲得詳細的命理分析報告和人生指引</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色功能 -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title">平台特色</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <h4>精準計算</h4>
            <p>運用傳統古法結合現代演算法，確保計算結果的準確性</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h4>跨平台支援</h4>
            <p>支援電腦、平板、手機等各種裝置，隨時隨地使用</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <h4>隱私保護</h4>
            <p>您的個人資料完全保密，本地儲存，不會外洩</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <h4>詳細報告</h4>
            <p>提供全面的分析報告，包含圖表和詳細解讀</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 服務詳情彈窗 - 紫微斗數 -->
    <div v-if="showPurpleStarInfo" class="modal-overlay" @click="showPurpleStarInfo = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>紫微斗數詳細介紹</h3>
          <button @click="showPurpleStarInfo = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <h4>什麼是紫微斗數？</h4>
          <p>紫微斗數是中國傳統命理學中最重要的預測方法之一，號稱「帝王之學」。它以出生年月日時為基礎，建立十二宮位命盤，分析個人的性格特質、事業發展、財運狀況、感情婚姻等人生各個層面。</p>
          
          <h4>我們提供的服務包含：</h4>
          <ul>
            <li><strong>基礎命盤：</strong>十二宮位星曜分布</li>
            <li><strong>大限分析：</strong>十年大運走勢</li>
            <li><strong>小限分析：</strong>年度運勢變化</li>
            <li><strong>流年分析：</strong>特定年份詳細運勢</li>
            <li><strong>四化飛星：</strong>動態運勢分析</li>
          </ul>
          
          <h4>適合什麼時候使用？</h4>
          <p>人生重大決策時、事業轉換期、感情困惑時、想了解自己性格特質時，紫微斗數都能提供深入的洞察和指引。</p>
        </div>
        <div class="modal-footer">
          <router-link to="/purple-star" class="btn btn-primary" @click="showPurpleStarInfo = false">
            立即開始計算
          </router-link>
        </div>
      </div>
    </div>

    <!-- 服務詳情彈窗 - 八字命理 -->
    <div v-if="showBaziInfo" class="modal-overlay" @click="showBaziInfo = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>八字命理詳細介紹</h3>
          <button @click="showBaziInfo = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <h4>什麼是八字命理？</h4>
          <p>八字命理以個人出生的年、月、日、時四柱八字為基礎，分析天干地支的五行生剋關係，揭示個人的性格特質、運勢走向和人生軌跡。是中國傳統命理學的核心內容。</p>
          
          <h4>我們提供的分析包含：</h4>
          <ul>
            <li><strong>四柱排盤：</strong>年柱、月柱、日柱、時柱完整排列</li>
            <li><strong>五行分析：</strong>木火土金水的分布與平衡</li>
            <li><strong>十神配置：</strong>比肩、劫財、食神、傷官等關係</li>
            <li><strong>起運計算：</strong>大運起始時間和週期</li>
            <li><strong>流年互動：</strong>特定年份的運勢變化</li>
          </ul>
          
          <h4>八字分析的優勢：</h4>
          <p>八字分析注重五行平衡和天干地支的生剋關係，能夠精確反映個人的先天稟賦、性格特徵，以及後天運勢的起伏變化，對於人生規劃具有重要的參考價值。</p>
        </div>
        <div class="modal-footer">
          <router-link to="/bazi" class="btn btn-primary" @click="showBaziInfo = false">
            立即開始計算
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 響應式數據
const showPurpleStarInfo = ref(false);
const showBaziInfo = ref(false);

// 生命週期
onMounted(() => {
  document.title = `${t('common.app_name')} - 專業命理服務平台`;
});
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* 英雄區塊 */
.hero-section {
  background: linear-gradient(135deg, #fdf7f0 0%, #f4e4bc 100%);
  padding: 80px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.site-title {
  font-size: 3.5rem;
  color: #8b4513;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.1);
}

.site-subtitle {
  font-size: 1.3rem;
  color: #d2691e;
  margin-bottom: 20px;
  font-weight: 600;
}

.site-description {
  font-size: 1.1rem;
  color: #a0522d;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 服務區塊 */
.services-section {
  padding: 80px 0;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #8b4513;
  margin-bottom: 50px;
  font-weight: 600;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.service-card.purple-star:hover {
  border-color: #9932cc;
}

.service-card.bazi:hover {
  border-color: #d2691e;
}

.service-icon {
  text-align: center;
  margin-bottom: 25px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle.purple {
  background: linear-gradient(135deg, #9932cc, #ba55d3);
}

.icon-circle.orange {
  background: linear-gradient(135deg, #d2691e, #ff8c00);
}

.icon-text {
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.service-content h3 {
  font-size: 1.8rem;
  color: #8b4513;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

.service-description {
  color: #666;
  line-height: 1.8;
  margin-bottom: 25px;
  font-size: 1rem;
}

.service-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.feature-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

.service-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #d2691e, #ff8c00);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #b8621b, #e07b00);
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #bbb;
}

/* 指南區塊 */
.guide-section {
  padding: 80px 0;
  background: #faf9f7;
}

.guide-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.step-item {
  text-align: center;
  padding: 30px 20px;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #d2691e, #ff8c00);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.step-content h4 {
  color: #8b4513;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
}

/* 特色功能區塊 */
.features-section {
  padding: 80px 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-item h4 {
  color: #8b4513;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

/* 彈窗樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #8b4513;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 30px;
  line-height: 1.8;
}

.modal-body h4 {
  color: #8b4513;
  margin: 20px 0 10px 0;
  font-size: 1.2rem;
}

.modal-body p {
  color: #666;
  margin-bottom: 15px;
}

.modal-body ul {
  color: #666;
  padding-left: 20px;
}

.modal-body li {
  margin-bottom: 8px;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  text-align: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .site-title {
    font-size: 2.5rem;
  }
  
  .site-subtitle {
    font-size: 1.1rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .service-card {
    padding: 30px 25px;
  }
  
  .service-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .guide-steps {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }
  
  .modal-content {
    margin: 20px;
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 15px;
  }
  
  .site-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .services-section, .guide-section, .features-section {
    padding: 60px 0;
  }
}
</style>
