# 🚀 佩璇專案 - 下一階段優化計劃 V2

## 📋 執行摘要

基於已完成的前端效能優化和測試擴展，本計劃詳細說明佩璇智能命理分析平台的下一階段優化工作，主要聚焦於分佈式快取、E2E 測試和 CI/CD 流程。

**計劃時間範圍**: 3-4週  
**優化重點**: 分佈式快取 + E2E 測試 + CI/CD 流程  
**預期成果**: API 響應時間提升 90%，測試覆蓋率達到 80%+，自動化部署流程

---

## 🎯 優化目標

### 分佈式快取目標
- ⚡ 實作 Redis 快取層，替換記憶體快取
- ⚡ 支援多實例部署，提供分佈式快取
- ⚡ 優化快取策略，提高命中率
- ⚡ 實作快取預熱機制，減少冷啟動時間

### 測試目標
- 🧪 實作 E2E 測試，覆蓋關鍵用戶流程
- 🧪 提高測試覆蓋率至 80%+
- 🧪 實作視覺回歸測試，確保 UI 一致性
- 🧪 實作效能測試，監控系統效能變化

### CI/CD 目標
- 🚀 設置 GitHub Actions 自動化測試和部署
- 🚀 實作分階段部署策略
- 🚀 設置質量門檻，確保代碼質量
- 🚀 實作自動化版本管理和發布流程

---

## 📝 優化計劃

### 1️⃣ 分佈式快取實作

#### A. Redis 快取層設置
1. **安裝 Redis 依賴**
   ```bash
   # 安裝 Redis 客戶端
   npm install redis ioredis
   
   # 安裝類型定義
   npm install --save-dev @types/redis
   ```

2. **創建 Redis 快取服務**
   ```typescript
   // 新增 services/redisService.ts
   import Redis from 'ioredis';
   
   const redisClient = new Redis({
     host: process.env.REDIS_HOST || 'localhost',
     port: parseInt(process.env.REDIS_PORT || '6379'),
     password: process.env.REDIS_PASSWORD,
     db: parseInt(process.env.REDIS_DB || '0'),
     retryStrategy: (times) => Math.min(times * 50, 2000)
   });
   
   export const redisService = {
     get: async <T>(key: string): Promise<T | null> => {
       const data = await redisClient.get(key);
       if (!data) return null;
       return JSON.parse(data) as T;
     },
     
     set: async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
       const serialized = JSON.stringify(value);
       if (ttl) {
         return await redisClient.set(key, serialized, 'EX', ttl) === 'OK';
       }
       return await redisClient.set(key, serialized) === 'OK';
     },
     
     del: async (key: string): Promise<number> => {
       return await redisClient.del(key);
     },
     
     flush: async (): Promise<void> => {
       await redisClient.flushdb();
     },
     
     getClient: () => redisClient
   };
   ```

3. **更新環境變數配置**
   ```bash
   # 添加到 .env 文件
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   CACHE_STRATEGY=redis # 或 memory
   ```

#### B. 快取策略優化
1. **創建統一快取介面**
   ```typescript
   // 新增 services/cacheManager.ts
   import { cacheService } from './cacheService';
   import { redisService } from './redisService';
   import logger from '../utils/logger';
   
   const cacheStrategy = process.env.CACHE_STRATEGY || 'memory';
   
   export const cacheManager = {
     get: async <T>(key: string): Promise<T | undefined | null> => {
       try {
         if (cacheStrategy === 'redis') {
           return await redisService.get<T>(key);
         } else {
           return cacheService.get<T>(key);
         }
       } catch (error) {
         logger.error('Cache get error:', error);
         return undefined;
       }
     },
     
     set: async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
       try {
         if (cacheStrategy === 'redis') {
           return await redisService.set<T>(key, value, ttl);
         } else {
           return cacheService.set<T>(key, value, ttl);
         }
       } catch (error) {
         logger.error('Cache set error:', error);
         return false;
       }
     },
     
     del: async (key: string): Promise<number> => {
       try {
         if (cacheStrategy === 'redis') {
           return await redisService.del(key);
         } else {
           return cacheService.del(key);
         }
       } catch (error) {
         logger.error('Cache delete error:', error);
         return 0;
       }
     },
     
     getOrSet: async <T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> => {
       try {
         const cachedData = await cacheManager.get<T>(key);
         if (cachedData !== undefined && cachedData !== null) {
           return cachedData;
         }
         
         const data = await fn();
         await cacheManager.set<T>(key, data, ttl);
         return data;
       } catch (error) {
         logger.error('Cache getOrSet error:', error);
         return await fn();
       }
     }
   };
   ```

2. **更新 API 路由使用新的快取管理器**
   ```typescript
   // 修改 routes/purpleStarRoutes.ts
   import { cacheManager } from '../services/cacheManager';
   
   // 使用 cacheManager 替換 cacheService
   const cachedResult = await cacheManager.get(cacheKey);
   // ...
   await cacheManager.set(cacheKey, response, 3600);
   ```

#### C. 快取預熱機制
1. **創建快取預熱服務**
   ```typescript
   // 新增 services/cacheWarmupService.ts
   import { redisService } from './redisService';
   import { PurpleStarCalculationService } from './purpleStarCalculationService';
   import logger from '../utils/logger';
   
   export const cacheWarmupService = {
     async warmupCommonCharts(): Promise<void> {
       logger.info('Starting cache warmup for common charts...');
       
       try {
         // 預熱常見出生年份的命盤
         const commonYears = [1980, 1985, 1990, 1995, 2000];
         const commonMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
         const commonDays = [1, 15];
         const genders = ['male', 'female'];
         
         let warmedUp = 0;
         
         for (const year of commonYears) {
           for (const month of commonMonths) {
             for (const day of commonDays) {
               for (const gender of genders) {
                 // 構建出生資訊
                 const birthInfo = {
                   solarDate: new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`),
                   gender
                 };
                 
                 // 計算命盤
                 const calculator = new PurpleStarCalculationService(birthInfo);
                 const chart = await calculator.calculateChart({
                   includeMajorCycles: true,
                   includeMinorCycles: true,
                   includeAnnualCycles: true,
                   detailLevel: 'basic',
                   maxAge: 100
                 });
                 
                 // 生成快取鍵
                 const cacheKey = `purple-star-${JSON.stringify({
                   birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                   birthTime: '12:00',
                   gender
                 })}`;
                 
                 // 存入快取
                 await redisService.set(cacheKey, { success: true, data: { chart } }, 86400); // 24小時有效期
                 
                 warmedUp++;
               }
             }
           }
         }
         
         logger.info(`Cache warmup completed. Warmed up ${warmedUp} charts.`);
       } catch (error) {
         logger.error('Cache warmup failed:', error);
       }
     }
   };
   ```

2. **在應用啟動時執行預熱**
   ```typescript
   // 修改 index.ts
   import { cacheWarmupService } from './services/cacheWarmupService';
   
   // 在應用啟動後執行預熱
   app.listen(PORT, '0.0.0.0', () => {
     logger.info(`Server started successfully`, {
       port: PORT,
       environment: process.env.NODE_ENV || 'development',
       timestamp: new Date().toISOString()
     });
     
     // 在生產環境中執行快取預熱
     if (process.env.NODE_ENV === 'production') {
       setTimeout(() => {
         cacheWarmupService.warmupCommonCharts()
           .catch(err => logger.error('Failed to warmup cache:', err));
       }, 5000); // 延遲 5 秒執行，確保應用完全啟動
     }
   });
   ```

### 2️⃣ E2E 測試實作

#### A. 設置 Playwright
1. **安裝 Playwright**
   ```bash
   # 安裝 Playwright
   npm install --save-dev @playwright/test
   
   # 安裝瀏覽器
   npx playwright install
   ```

2. **創建 Playwright 配置**
   ```typescript
   // 新增 playwright.config.ts
   import { PlaywrightTestConfig } from '@playwright/test';
   
   const config: PlaywrightTestConfig = {
     testDir: './e2e',
     timeout: 30000,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [
       ['html', { outputFolder: 'playwright-report' }],
       ['json', { outputFile: 'playwright-report/test-results.json' }]
     ],
     use: {
       baseURL: 'http://localhost:5173',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
       video: 'on-first-retry'
     },
     projects: [
       {
         name: 'chromium',
         use: { browserName: 'chromium' }
       },
       {
         name: 'firefox',
         use: { browserName: 'firefox' }
       },
       {
         name: 'webkit',
         use: { browserName: 'webkit' }
       }
     ]
   };
   
   export default config;
   ```

3. **添加 E2E 測試腳本**
   ```typescript
   // 新增 package.json 腳本
   "scripts": {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui"
   }
   ```

#### B. 創建 E2E 測試
1. **測試首頁**
   ```typescript
   // 新增 e2e/home.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Home Page', () => {
     test('should load home page correctly', async ({ page }) => {
       await page.goto('/');
       
       // 檢查標題
       await expect(page).toHaveTitle(/佩璇/);
       
       // 檢查導航菜單
       await expect(page.locator('.nav-link').first()).toBeVisible();
       
       // 檢查服務卡片
       await expect(page.locator('.service-card')).toHaveCount(2);
     });
     
     test('should navigate to purple star page', async ({ page }) => {
       await page.goto('/');
       
       // 點擊紫微斗數服務卡片
       await page.locator('.service-card.purple-star .btn-primary').click();
       
       // 檢查 URL
       await expect(page).toHaveURL(/purple-star/);
       
       // 檢查頁面標題
       await expect(page.locator('h3:has-text("紫微斗數")')).toBeVisible();
     });
   });
   ```

2. **測試紫微斗數功能**
   ```typescript
   // 新增 e2e/purple-star.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Purple Star Feature', () => {
     test('should calculate purple star chart', async ({ page }) => {
       // 導航到紫微斗數頁面
       await page.goto('/purple-star');
       
       // 填寫表單
       await page.locator('input[placeholder*="出生日期"]').fill('1990-05-15');
       await page.locator('input[placeholder*="出生時間"]').fill('14:30');
       await page.locator('label:has-text("男")').click();
       await page.locator('input[placeholder*="出生地點"]').fill('台北市');
       
       // 提交表單
       await page.locator('button:has-text("計算命盤")').click();
       
       // 等待結果載入
       await expect(page.locator('.purple-star-chart-display')).toBeVisible({ timeout: 10000 });
       
       // 檢查命盤是否顯示
       await expect(page.locator('text=命宮')).toBeVisible();
       await expect(page.locator('text=紫微')).toBeVisible();
     });
   });
   ```

3. **測試八字功能**
   ```typescript
   // 新增 e2e/bazi.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Bazi Feature', () => {
     test('should calculate bazi chart', async ({ page }) => {
       // 導航到八字頁面
       await page.goto('/bazi');
       
       // 填寫表單
       await page.locator('input[placeholder*="出生日期"]').fill('1990-05-15');
       await page.locator('input[placeholder*="出生時間"]').fill('14:30');
       await page.locator('label:has-text("男")').click();
       await page.locator('input[placeholder*="出生地點"]').fill('台北市');
       
       // 提交表單
       await page.locator('button:has-text("計算八字")').click();
       
       // 等待結果載入
       await expect(page.locator('.bazi-chart-display')).toBeVisible({ timeout: 10000 });
       
       // 檢查八字是否顯示
       await expect(page.locator('text=日主')).toBeVisible();
       await expect(page.locator('text=年柱')).toBeVisible();
     });
   });
   ```

#### C. 視覺回歸測試
1. **設置視覺比較**
   ```typescript
   // 修改 playwright.config.ts
   import { PlaywrightTestConfig, devices } from '@playwright/test';
   
   const config: PlaywrightTestConfig = {
     // ... 其他配置
     
     expect: {
       toHaveScreenshot: {
         maxDiffPixels: 100,
       },
     },
     
     // ... 其他配置
   };
   ```

2. **創建視覺回歸測試**
   ```typescript
   // 新增 e2e/visual.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Visual Regression Tests', () => {
     test('home page visual test', async ({ page }) => {
       await page.goto('/');
       await page.waitForLoadState('networkidle');
       
       // 截圖並比較
       await expect(page).toHaveScreenshot('home-page.png');
     });
     
     test('purple star form visual test', async ({ page }) => {
       await page.goto('/purple-star');
       await page.waitForLoadState('networkidle');
       
       // 截圖並比較
       await expect(page.locator('form')).toHaveScreenshot('purple-star-form.png');
     });
     
     test('bazi form visual test', async ({ page }) => {
       await page.goto('/bazi');
       await page.waitForLoadState('networkidle');
       
       // 截圖並比較
       await expect(page.locator('form')).toHaveScreenshot('bazi-form.png');
     });
   });
   ```

### 3️⃣ CI/CD 流程實作

#### A. GitHub Actions 設置
1. **創建 CI 工作流**
   ```yaml
   # 新增 .github/workflows/ci.yml
   name: CI
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       services:
         redis:
           image: redis
           ports:
             - 6379:6379
           options: >-
             --health-cmd "redis-cli ping"
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: |
             cd backend-node
             npm ci
             cd ../bazi-app-vue
             npm ci
         
         - name: Run backend tests
           run: |
             cd backend-node
             npm run test:coverage
         
         - name: Run frontend tests
           run: |
             cd bazi-app-vue
             npm run test:coverage
         
         - name: Upload coverage reports
           uses: codecov/codecov-action@v3
           with:
             token: ${{ secrets.CODECOV_TOKEN }}
             directory: ./backend-node/coverage,./bazi-app-vue/coverage
         
         - name: Build backend
           run: |
             cd backend-node
             npm run build
         
         - name: Build frontend
           run: |
             cd bazi-app-vue
             npm run build
   ```

2. **創建 E2E 測試工作流**
   ```yaml
   # 新增 .github/workflows/e2e.yml
   name: E2E Tests
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     e2e:
       runs-on: ubuntu-latest
       
       services:
         redis:
           image: redis
           ports:
             - 6379:6379
           options: >-
             --health-cmd "redis-cli ping"
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: |
             cd backend-node
             npm ci
             cd ../bazi-app-vue
             npm ci
         
         - name: Install Playwright browsers
           run: |
             cd bazi-app-vue
             npx playwright install --with-deps
         
         - name: Start backend server
           run: |
             cd backend-node
             npm run build
             npm run start &
             sleep 5
         
         - name: Start frontend server
           run: |
             cd bazi-app-vue
             npm run build
             npm run preview &
             sleep 5
         
         - name: Run E2E tests
           run: |
             cd bazi-app-vue
             npm run test:e2e
         
         - name: Upload test results
           if: always()
           uses: actions/upload-artifact@v3
           with:
             name: playwright-report
             path: bazi-app-vue/playwright-report/
             retention-days: 30
   ```

3. **創建部署工作流**
   ```yaml
   # 新增 .github/workflows/deploy.yml
   name: Deploy
   
   on:
     push:
       branches: [ main ]
       tags:
         - 'v*'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: |
             cd backend-node
             npm ci
             cd ../bazi-app-vue
             npm ci
         
         - name: Build backend
           run: |
             cd backend-node
             npm run build
         
         - name: Build frontend
           run: |
             cd bazi-app-vue
             npm run build
         
         - name: Login to Docker Hub
           uses: docker/login-action@v2
           with:
             username: ${{ secrets.DOCKER_HUB_USERNAME }}
             password: ${{ secrets.DOCKER_HUB_TOKEN }}
         
         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v2
         
         - name: Build and push backend
           uses: docker/build-push-action@v4
           with:
             context: ./backend-node
             push: true
             tags: ${{ secrets.DOCKER_HUB_USERNAME }}/peixuan-backend:latest
         
         - name: Build and push frontend
           uses: docker/build-push-action@v4
           with:
             context: ./bazi-app-vue
             push: true
             tags: ${{ secrets.DOCKER_HUB_USERNAME }}/peixuan-frontend:latest
         
         - name: Deploy to production
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.SSH_HOST }}
             username: ${{ secrets.SSH_USERNAME }}
             key: ${{ secrets.SSH_PRIVATE_KEY }}
             script: |
               cd /opt/peixuan
               docker-compose pull
               docker-compose up -d
               docker system prune -af
   ```

#### B. 版本管理與發布
1. **創建版本管理腳本**
   ```bash
   # 新增 scripts/version.sh
   #!/bin/bash
   
   # 獲取當前版本
   current_version=$(node -p "require('./package.json').version")
   echo "Current version: $current_version"
   
   # 解析版本號
   IFS='.' read -r major minor patch <<< "$current_version"
   
   # 根據參數增加版本號
   case "$1" in
     major)
       major=$((major + 1))
       minor=0
       patch=0
       ;;
     minor)
       minor=$((minor + 1))
       patch=0
       ;;
     patch|*)
       patch=$((patch + 1))
       ;;
   esac
   
   # 新版本號
   new_version="$major.$minor.$patch"
   echo "New version: $new_version"
   
   # 更新 package.json
   npm version "$new_version" --no-git-tag-version
   
   # 更新前端 package.json
   cd ../bazi-app-vue
   npm version "$new_version" --no-git-tag-version
   cd ../backend-node
   
   # 創建 git 標籤
   git add ../bazi-app-vue/package.json package.json
   git commit -m "chore: bump version to $new_version"
   git tag -a "v$new_version" -m "Version $new_version"
   
   echo "Version $new_version created. Push with: git push && git push --tags"
   ```

2. **添加發布腳本**
   ```bash
   # 新增 scripts/release.sh
   #!/bin/bash
   
   # 檢查是否提供版本類型
   if [ -z "$1" ]; then
     echo "Usage: $0 <patch|minor|major>"
     exit 1
   fi
   
   # 確保工作目錄乾淨
   if [ -n "$(git status --porcelain)" ]; then
     echo "Error: Working directory not clean. Commit or stash changes first."
     exit 1
   fi
   
   # 更新版本
   ./version.sh "$1"
   
   # 獲取新版本
   new_version=$(node -p "require('./package.json').version")
   
   # 推送到遠端
   git push && git push --tags
   
   echo "Version $new_version released successfully!"
   ```

3. **添加發布腳本到 package.json**
   ```json
   "scripts": {
     "release:patch": "bash scripts/release.sh patch",
     "release:minor": "bash scripts/release.sh minor",
     "release:major": "bash scripts/release.sh major"
   }
   ```

---

## 📊 優化指標與監控

### 效能指標
- **API 響應時間**: < 50ms (P95)
- **快取命中率**: > 90%
- **系統吞吐量**: > 1000 請求/秒
- **冷啟動時間**: < 5 秒

### 測試指標
- **E2E 測試覆蓋率**: > 80% 關鍵流程
- **單元測試覆蓋率**: > 80%
- **視覺回歸測試**: 關鍵 UI 組件 100% 覆蓋
- **測試通過率**: > 98%

### CI/CD 指標
- **部署頻率**: 每週至少 1 次
- **部署時間**: < 10 分鐘
- **回滾時間**: < 5 分鐘
- **變更失敗率**: < 5%

---

## 🛠️ 實施時間表

### 第1週
- ✅ 安裝 Redis 依賴
- ✅ 創建 Redis 快取服務
- ✅ 更新環境變數配置
- ✅ 創建統一快取介面

### 第2週
- ✅ 更新 API 路由使用新的快取管理器
- ✅ 創建快取預熱服務
- ✅ 安裝 Playwright
- ✅ 創建 Playwright 配置

### 第3週
- ✅ 創建 E2E 測試
- ✅ 設置視覺回歸測試
- ✅ 創建 GitHub Actions CI 工作流
- ✅ 創建 E2E 測試工作流

### 第4週
- ✅ 創建部署工作流
- ✅ 創建版本管理腳本
- ✅ 添加發布腳本
- ✅ 進行全面測試和優化

---

## 🔄 驗證與回歸測試計劃

### 效能驗證
1. **負載測試**
   - 使用 k6 進行負載測試
   - 模擬 1000 並發用戶
   - 測量系統穩定性和響應時間

2. **快取效能測試**
   - 測量快取命中率
   - 比較記憶體快取和 Redis 快取的效能差異
   - 測試快取預熱效果

### 功能驗證
1. **E2E 測試覆蓋**
   - 確保所有關鍵用戶流程都有 E2E 測試覆蓋
   - 驗證測試在不同瀏覽器中的通過率

2. **視覺回歸測試**
   - 確保 UI 組件在不同瀏覽器中的一致性
   - 驗證視覺回歸測試的穩定性

### CI/CD 驗證
1. **部署流程測試**
   - 測試自動化部署流程
   - 驗證回滾機制
   - 測量部署時間

2. **版本管理測試**
   - 測試版本管理腳本
   - 驗證發布流程

---

## 📝 結論

本優化計劃將顯著提升佩璇智能命理分析平台的效能、穩定性和可靠性。通過實作分佈式快取、E2E 測試和 CI/CD 流程，我們預計能達成以下成果：

- 🚀 API 響應時間提升 90%
- 🧪 測試覆蓋率達到 80%+
- 🔄 自動化部署流程
- 💪 系統穩定性顯著增強

這些優化將為用戶提供更流暢的體驗，同時為開發團隊建立更可靠的開發和部署流程，有利於未來功能的擴展和維護。

---

*計劃制定日期: 2025-02-10*  
*預計完成日期: 2025-03-10*  
*優先級: 高*
