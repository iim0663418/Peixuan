# 🚀 佩璇專案 - 下一階段優化計劃

## 📋 執行摘要

基於已完成的認證系統移除和技術債務清理，本計劃詳細說明佩璇智能命理分析平台的下一階段優化工作，主要聚焦於效能優化和測試擴展。

**計劃時間範圍**: 2-3週  
**優化重點**: 效能提升 + 測試覆蓋率增加  
**預期成果**: 頁面載入速度提升50%，測試覆蓋率達到60%+

---

## 🎯 優化目標

### 效能目標
- ⚡ 減少主套件大小至少40%（從1.0MB降至0.6MB以下）
- ⚡ 首次載入時間減少50%（從3秒降至1.5秒以下）
- ⚡ 實現關鍵路由懶加載
- ⚡ 優化API響應時間（從平均300ms降至150ms）

### 測試目標
- 🧪 提高組件測試覆蓋率至60%（從13%提升至60%）
- 🧪 修復所有失敗測試（48/86）
- 🧪 為核心計算引擎添加完整測試
- 🧪 實現關鍵路徑的整合測試

---

## 📝 優化計劃

### 1️⃣ 效能優化

#### A. 前端程式碼分割與懶加載
1. **實作Vue Router懶加載**
   ```typescript
   // 修改 router/index.ts
   const PurpleStarView = () => import('../views/PurpleStarView.vue')
   const BaziView = () => import('../views/BaziView.vue')
   const IntegratedAnalysisView = () => import('../views/IntegratedAnalysisView.vue')
   ```

2. **組件動態導入**
   ```typescript
   // 大型組件使用動態導入
   const PurpleStarChartDisplay = defineAsyncComponent(() => 
     import('./PurpleStarChartDisplay.vue')
   )
   ```

3. **分析並優化套件大小**
   ```bash
   # 安裝分析工具
   npm install --save-dev rollup-plugin-visualizer
   
   # 配置 vite.config.ts
   import { visualizer } from 'rollup-plugin-visualizer';
   
   export default defineConfig({
     plugins: [
       vue(),
       visualizer({
         open: true,
         gzipSize: true,
         brotliSize: true,
       })
     ]
   })
   ```

#### B. 後端效能優化
1. **實作記憶體快取**
   ```typescript
   // 新增 services/cacheService.ts
   import NodeCache from 'node-cache';
   
   const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
   
   export const cacheService = {
     get: <T>(key: string): T | undefined => {
       return cache.get<T>(key);
     },
     set: <T>(key: string, value: T, ttl?: number): boolean => {
       return cache.set(key, value, ttl);
     },
     del: (key: string): number => {
       return cache.del(key);
     }
   };
   ```

2. **優化API響應**
   ```typescript
   // 修改 routes/purpleStarRoutes.ts
   import { cacheService } from '../services/cacheService';
   
   router.post('/calculate', async (req, res) => {
     const cacheKey = `purple-star-${JSON.stringify(req.body)}`;
     const cachedResult = cacheService.get(cacheKey);
     
     if (cachedResult) {
       return res.json(cachedResult);
     }
     
     // 原有計算邏輯...
     
     cacheService.set(cacheKey, result, 3600); // 快取1小時
     return res.json(result);
   });
   ```

3. **新增頻率限制**
   ```typescript
   // 修改 index.ts
   import rateLimit from 'express-rate-limit';
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15分鐘
     max: 100, // 每IP限制請求數
     standardHeaders: true,
     legacyHeaders: false,
   });
   
   app.use('/api/', apiLimiter);
   ```

#### C. 資源優化
1. **圖片優化與懶加載**
   ```typescript
   // 安裝懶加載套件
   npm install --save vue-lazyload
   
   // 配置 main.ts
   import VueLazyload from 'vue-lazyload';
   
   app.use(VueLazyload, {
     preLoad: 1.3,
     error: require('@/assets/error.png'),
     loading: require('@/assets/loading.gif'),
     attempt: 1
   });
   ```

2. **CSS優化**
   ```typescript
   // 安裝PurgeCSS
   npm install --save-dev @fullhuman/postcss-purgecss
   
   // 配置 postcss.config.js
   module.exports = {
     plugins: [
       require('@fullhuman/postcss-purgecss')({
         content: ['./index.html', './src/**/*.{vue,js,ts}'],
         defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
       })
     ]
   }
   ```

### 2️⃣ 測試擴展

#### A. 修復失敗測試
1. **分析失敗原因**
   ```bash
   # 運行測試並輸出詳細日誌
   npm run test -- --verbose
   ```

2. **優先修復高頻失敗模式**
   - 識別常見失敗模式
   - 建立修復模板
   - 批量應用修復

#### B. 擴展組件測試
1. **核心組件測試**
   ```typescript
   // 新增 components/__tests__/PurpleStarChartDisplay.spec.ts
   import { mount } from '@vue/test-utils';
   import PurpleStarChartDisplay from '../PurpleStarChartDisplay.vue';
   
   describe('PurpleStarChartDisplay', () => {
     it('renders correctly with props', async () => {
       const wrapper = mount(PurpleStarChartDisplay, {
         props: {
           chartData: {/* 測試數據 */}
         }
       });
       
       expect(wrapper.find('.chart-container').exists()).toBe(true);
       // 更多斷言...
     });
     
     it('displays stars in correct positions', async () => {
       // 測試星曜位置邏輯
     });
   });
   ```

2. **UserInputForm測試**
   ```typescript
   // 新增 components/__tests__/UserInputForm.spec.ts
   import { mount } from '@vue/test-utils';
   import UserInputForm from '../UserInputForm.vue';
   
   describe('UserInputForm', () => {
     it('validates input correctly', async () => {
       const wrapper = mount(UserInputForm);
       
       // 測試表單驗證邏輯
       await wrapper.find('input[name="birthYear"]').setValue('invalid');
       await wrapper.find('form').trigger('submit.prevent');
       
       expect(wrapper.find('.error-message').text()).toContain('年份無效');
     });
     
     it('emits form-submit event with valid data', async () => {
       // 測試表單提交事件
     });
   });
   ```

#### C. 核心算法測試
1. **八字計算引擎測試**
   ```typescript
   // 新增 utils/__tests__/baziCalc.spec.ts
   import { calculateBazi, determineElement } from '../baziCalc';
   
   describe('Bazi Calculation', () => {
     it('calculates correct pillars for known birth date', () => {
       const result = calculateBazi({
         year: 1990,
         month: 5,
         day: 15,
         hour: 14,
         minute: 30
       });
       
       expect(result.yearPillar).toBe('庚午');
       expect(result.monthPillar).toBe('丙午');
       expect(result.dayPillar).toBe('壬戌');
       expect(result.hourPillar).toBe('己未');
     });
     
     it('determines correct elements for stems and branches', () => {
       expect(determineElement('甲')).toBe('木');
       expect(determineElement('寅')).toBe('木');
       // 更多元素測試...
     });
   });
   ```

2. **紫微斗數計算測試**
   ```typescript
   // 新增 utils/__tests__/ziweiCalc.spec.ts
   import { calculateZiwei, determineMainStar } from '../ziweiCalc';
   
   describe('Ziwei Calculation', () => {
     it('places main stars in correct palaces', () => {
       const result = calculateZiwei({
         year: 1990,
         month: 5,
         day: 15,
         hour: 14,
         gender: 'male'
       });
       
       expect(result.ziwei).toBe(3); // 紫微在第3宮
       expect(result.tianfu).toBe(9); // 天府在第9宮
     });
     
     it('calculates correct transformation stars', () => {
       // 測試四化星計算
     });
   });
   ```

#### D. 整合測試
1. **前端整合測試**
   ```typescript
   // 新增 __tests__/integration/chartGeneration.spec.ts
   import { mount } from '@vue/test-utils';
   import { createRouter, createWebHistory } from 'vue-router';
   import App from '../../App.vue';
   import { routes } from '../../router';
   
   describe('Chart Generation Flow', () => {
     it('completes full chart generation flow', async () => {
       const router = createRouter({
         history: createWebHistory(),
         routes
       });
       
       const wrapper = mount(App, {
         global: {
           plugins: [router]
         }
       });
       
       // 導航到紫微斗數頁面
       await router.push('/purple-star');
       await router.isReady();
       
       // 填寫表單
       // 提交表單
       // 驗證結果顯示
     });
   });
   ```

2. **API整合測試**
   ```typescript
   // 新增 backend-node/src/__tests__/integration/api.spec.ts
   import request from 'supertest';
   import app from '../../app';
   
   describe('API Integration Tests', () => {
     it('calculates purple star chart correctly', async () => {
       const response = await request(app)
         .post('/api/v1/purple-star/calculate')
         .send({
           year: 1990,
           month: 5,
           day: 15,
           hour: 14,
           gender: 'male'
         });
       
       expect(response.status).toBe(200);
       expect(response.body).toHaveProperty('mainStars');
       expect(response.body.mainStars).toHaveProperty('ziwei');
     });
     
     it('returns correct integrated analysis', async () => {
       // 測試綜合分析API
     });
   });
   ```

#### E. 測試覆蓋率工具
1. **安裝覆蓋率工具**
   ```bash
   # 前端
   cd bazi-app-vue
   npm install --save-dev @vitest/coverage-v8
   
   # 後端
   cd backend-node
   npm install --save-dev jest-coverage-badges
   ```

2. **配置覆蓋率報告**
   ```typescript
   // 修改 vite.config.ts
   test: {
     coverage: {
       provider: 'v8',
       reporter: ['text', 'json', 'html'],
       reportsDirectory: './coverage'
     }
   }
   ```

3. **添加覆蓋率腳本**
   ```json
   // 修改 package.json
   "scripts": {
     "test:coverage": "vitest run --coverage"
   }
   ```

---

## 📊 優化指標與監控

### 效能指標
- **首次載入時間**: < 1.5秒
- **主套件大小**: < 600KB
- **API響應時間**: < 150ms (P95)
- **互動延遲**: < 100ms

### 測試指標
- **組件測試覆蓋率**: > 60%
- **工具函數覆蓋率**: > 80%
- **測試通過率**: > 95%
- **關鍵路徑覆蓋**: 100%

### 監控實施
1. **前端效能監控**
   ```typescript
   // 新增 services/performanceMonitoring.ts
   export const trackPageLoad = () => {
     if (window.performance) {
       const perfData = window.performance.timing;
       const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
       
       // 記錄或發送到分析服務
       console.log(`Page load time: ${pageLoadTime}ms`);
     }
   };
   ```

2. **API效能監控**
   ```typescript
   // 新增 middleware/performanceMonitoring.ts
   export const apiPerformanceMonitor = (req, res, next) => {
     const start = Date.now();
     
     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
       
       // 可選：將數據發送到監控服務
     });
     
     next();
   };
   ```

---

## 🛠️ 實施時間表

### 第1週
- ✅ 實作Vue Router懶加載
- ✅ 安裝並配置套件分析工具
- ✅ 修復失敗測試（優先處理高頻失敗模式）
- ✅ 實作記憶體快取服務

### 第2週
- ✅ 組件動態導入實作
- ✅ 新增頻率限制
- ✅ 擴展核心組件測試
- ✅ 實作八字計算引擎測試

### 第3週
- ✅ 圖片優化與懶加載
- ✅ CSS優化
- ✅ 紫微斗數計算測試
- ✅ 前端整合測試
- ✅ 配置測試覆蓋率報告

---

## 🔄 驗證與回歸測試計劃

### 效能驗證
1. **前後對比測試**
   - 使用Lighthouse進行優化前後對比
   - 記錄關鍵指標變化

2. **負載測試**
   - 模擬50並發用戶
   - 測量系統穩定性和響應時間

### 功能驗證
1. **回歸測試清單**
   - 八字計算功能
   - 紫微斗數排盤
   - 綜合分析生成
   - 多語言切換
   - 響應式佈局

2. **跨瀏覽器測試**
   - Chrome, Firefox, Safari
   - 移動裝置兼容性

---

## 📝 結論

本優化計劃將顯著提升佩璇智能命理分析平台的效能和穩定性，同時大幅增加測試覆蓋率，確保系統質量。通過實施程式碼分割、懶加載、快取策略和全面的測試，我們預計能達成以下成果：

- 🚀 頁面載入速度提升50%
- 📦 套件大小減少40%
- 🧪 測試覆蓋率提升至60%+
- 💪 系統穩定性顯著增強

這些優化將為用戶提供更流暢的體驗，同時為開發團隊建立更可靠的程式碼基礎，有利於未來功能的擴展和維護。

---

*計劃制定日期: 2025年1月*  
*預計完成日期: 2025年2月*  
*優先級: 高*