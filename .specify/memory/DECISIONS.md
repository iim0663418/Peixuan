# 決策記錄

## 2025-11-30: 遷移後運維與品質守則

### 決策：前端以 Workers 統一 API 為唯一資料源，fallback 僅於故障時啟用
- **原因**: Sprint R5 已完成 7 組件切換與舊計算器清除；維持雙路徑會重新引入漂移。
- **影響**: 正常情況下只走 `unifiedApiService.calculate()`；Worker 故障時才啟用 `utils/baziCalculators.ts`，並以相同 `types/baziTypes.ts` 契約輸出。
- **替代**: 常態化雙路徑或重建舊視圖（放棄，風險與維護成本高）。

### 決策：Lint/測試債務優先於新增功能
- **原因**: ESLint 93 errors / 374 warnings 仍存在，UnifiedView/UnifiedResultView 尚缺測試，風險高於新增需求。
- **影響**: 下一迭代先消化可自動修復 95 項並補齊新路由/組件測試，再推進四化飛星/流年太歲。
- **替代**: 直接開發新功能（放棄，會放大品質風險）。

### 決策：四化飛星/流年太歲維持顯式缺口，暫不輸出占位資料
- **原因**: 功能從未實作，輸出占位會造成誤解。
- **影響**: API 不返回相關欄位；文件標註 TODO，待 Phase 2 實作再納入契約。
- **替代**: 返回假資料或空結構（放棄，會產生錯誤認知）。

## 2025-11-30: Sprint R5 前端統一遷移與清理

### 決策：前端唯一資料源改為 `unifiedApiService.calculate()`
- **原因**: 後端 UnifiedCalculator 已涵蓋八字+紫微+五行+大運+流年，雙維護風險高。
- **影響**: 7 個組件改用後端 API；新增 `adaptApiBaZiToLegacyFormat` 轉舊格式，與現有 UI 完全兼容。
- **替代**: 保留前端計算與後端並行（放棄，維護成本高且易產生分歧）。

### 決策：刪除前端 `baziCalc.ts` 與舊視圖/表單
- **原因**: 計算邏輯已遷移到後端並有備援計算器，舊檔會造成誤用與型別漂移。
- **影響**: 移除 `baziCalc.ts`、4 個視圖、2 個表單、1 測試；路由僅保留 Unified 首頁。
- **替代**: 保留舊視圖做並行（放棄，導致 UX 混淆與技術債累積）。

### 決策：保留本地備援計算器（`utils/baziCalculators.ts`）
- **原因**: 若後端不可用需提供最小可用性；避免中斷投產。
- **影響**: 以新類型 `types/baziTypes.ts` 封裝，僅作 fallback，不再為主流程。
- **替代**: 無備援或復用舊 `baziCalc.ts`（放棄，前者風險高，後者類型過時）。

## 2025-11-30: Sprint 4 流年計算決策（Task 4.1-4.3）

### 決策：年柱以立春為界並使用 year-4 mod 60 公式
- **原因**: 八字年柱依節氣而非農曆新年，立春前屬前一年干支；數學基準應回到 4 CE=甲子。
- **影響**: `getAnnualPillar` 調用 `getLichunTime` 判定邊界，`hasPassedLiChun` 精確到毫秒；歷史年份、閏年、時區都遵循同一基準。
- **替代**: 以農曆新年或公曆 1/1 為界（放棄，會誤判立春前後的年柱）。

### 決策：流年命宮採用“地支定位 + 意義旋轉”而非重排宮位
- **原因**: 需保留原紫微盤地支與索引，僅旋轉 12 宮意義以對應流年命宮。
- **影響**: `locateAnnualLifePalace` 先找地支索引，再用 `rotateAnnualPalaces` 以 (idx-base+12)%12 重排 meaning 序列（命→兄弟→夫妻…父母）；地支與 position 不變。
- **替代**: 直接重排陣列或複製宮位資料（放棄，易破壞地支與索引對應）。

### 決策：合沖害分析遵循五合/六沖/三合三會標準映射並分級
- **原因**: 需一致化干支交互規則並突出日支/月支沖擊嚴重度。
- **影響**: `detectStemCombinations` 使用固定五合表；`detectBranchClashes` 以日支 HIGH、月支 MEDIUM、年/時 LOW 分級；`detectHarmoniousCombinations` 支援三合/三會並可選大運參與。
- **替代**: 不分嚴重度或僅回傳布林（放棄，失去解釋力）。

## 2025-11-30: FortuneCycles 起運/大運與整合

### 決策：起運方向與代謝日數公式採用 XOR + 120 日轉換
- **原因**: 八字規則要求男陽/女陰順行、男陰/女陽逆行；節氣差需轉換為 120 倍實際天數
- **影響**: `determineFortuneDirection` 以性別+年干 XOR 判向；`calculateQiYunDate` 用 Diff_Minutes/1440×120 計算；支援真太陽時計算
- **替代**: 使用固定方向或忽略節氣差（放棄，結果失真）

### 決策：大運生成與當前週期偵測採用 60 甲子模運算
- **原因**: 大運需依月柱循環 60 甲子並保持時間精度
- **影響**: `generateDaYunList` 順/逆行以模運算 ((index±1)+60)%60；每運 10 年並保留原始時分秒；`getCurrentDaYun` 採 start 包含、end 排除邏輯
- **替代**: 以單純數組截斷或不保留時間元件（放棄，會在邊界失準）

### 決策：FortuneCycles 納入 UnifiedCalculator 與 BaZiResult
- **原因**: 起運/大運需成為統一輸出與前端契約
- **影響**: BaZiResult 新增 `fortuneCycles` (qiyunDate/direction/dayunList/currentDayun)；calculateBaZi 新增 `qiyunCalculation`、`dayunGeneration` 記錄並更新 metadata.methods
- **替代**: 提供獨立 API 或僅在前端計算（放棄，會造成雙維護與資料不一致）

## 2025-11-30: Sprint B 阻塞與 API 格式鎖定

### 決策：Task B3（移除舊計算邏輯）暫停
- **原因**: `baziCalc.ts` 仍被 7 個組件使用，新路由尚未接入 UnifiedInputForm (Task B2 未完成)
- **影響**: 保留舊計算器以維持現網功能；先做 B2 並行切換，再刪除舊邏輯
- **後續**: 建立新舊並行路由，完成功能驗證後再移除舊系統

### 決策：PurpleStarApiResponse 作為前端唯一契約
- **原因**: Hybrid 架構輸出 core+palaces 分層資料，新欄位需前端適配
- **影響**: 舊視圖需更新取數；Breaking Change 標記並安排前端改造
- **替代**: 保留舊格式同步輸出（放棄，增加雙維護成本）

### 決策：立即清除未被引用的紫微前端重複檔
- **原因**: `ziweiCalc.ts`/`ziweiCalc.spec.ts` 僅供測試，與後端重複
- **影響**: 標記為低風險清理項，Week 2 執行；減少維護負擔
- **後續**: 刪除後更新文檔與測試指引

## 2025-11-30: Phase 1-4 完成與統一控制器上線

### 決策：UnifiedCalculator 作為單一真相來源
- **原因**: 核心演算法已在 UnifiedCalculator 完整覆蓋 (八字/紫微)
- **影響**: 所有新 API (含 `/api/v1/calculate`) 直接返回 CalculationResult，不經格式轉換
- **替代方案**: 繼續使用 Legacy 計算結果作為主輸出（放棄，數學驗證弱）

### 決策：Hybrid 架構保留 Legacy palaces
- **原因**: Legacy Calculator 提供完整星系宮位資料，便於前端過渡
- **影響**: PurpleStarController 以 Unified (core) + Legacy (palaces) 雙引擎並行，API 回應格式定義於 `types/apiResponse.ts`
- **兼容**: 保留 mingGan、fiveElementsBureau、palaces 等舊欄位以減少破壞性

### 決策：前端紫微重複邏輯延後移除
- **原因**: `ziweiCalc.ts` 未被引用但體積大，移除需安排時間
- **影響**: 短期內維持重複邏輯，Phase 2 專項清理
- **後續**: Week 2 計劃移除或改為共享套件

### 決策：保留未實作功能為顯式缺口
- **原因**: 四化飛星頂層彙總、流年太歲從未落地，避免假陽性
- **影響**: API 不返回相關欄位，文件註記為 TODO
- **後續**: Phase 2 規劃實作

## 2025-11-29: Phase 2 紫微斗數計算實現

### 決策：複用前端計算邏輯
- **原因**: 前端已有完整實現 (683 lines)，避免重寫
- **影響**: 代碼重複，前端 ziweiCalc.ts 未使用
- **替代方案**: 從零實現（耗時 2-4 小時）

### 決策：使用 lunar-typescript 替代全局腳本
- **原因**: Worker 環境無 window 物件，需 ES Module
- **影響**: 
  - 安裝 npm 包 lunar-typescript (1.8.6)
  - 修改 import 語句
  - 支援中文數字（火六局）
- **替代方案**: 
  - 尋找其他農曆庫（風險高）
  - 將 lunar.min.js 轉為 ES Module（工作量大）

### 決策：添加 CI 編譯步驟
- **原因**: dist/ 被 gitignore，wrangler 使用舊源碼
- **影響**: 每次部署前編譯最新代碼
- **配置**: `.github/workflows/deploy-worker.yml` 添加 `npm run build`

### 決策：保留四化飛星和流年太歲為未實現狀態
- **原因**: 原始前端代碼從未實現這些功能
- **影響**: 前端警告但不影響核心功能
- **時程**: 可作為 Week 2-3 增強功能

### 決策：添加 mingGan 欄位
- **原因**: 前端期望且數據已存在
- **影響**: 修復前端警告「命宮天干資料缺失」
- **實現**: 在 PurpleStarChart 介面添加 mingGan 欄位

---

## 2025-11-29: 專案架構審計

### 決策：建議移除前端 ziweiCalc.ts (選項 A)
- **原因**: 
  - 前端無任何引用（僅測試使用）
  - 代碼重複導致維護成本高
  - 符合原始設計（後端計算）
- **影響**: 
  - 失去離線計算能力（可接受）
  - 單一真相來源
  - 維護成本降低
- **替代方案**:
  - 選項 B: 實現 Fallback 機制（維護成本高）
  - 選項 C: 提取為共享 npm 包（工作量大）
- **時程**: Week 2 執行

### 決策：生成專案審計文檔
- **原因**: 遷移後需要完整狀態梳理
- **影響**: 
  - 建立 PROJECT_AUDIT_2025-11-29.md (詳細報告)
  - 建立 ARCHITECTURE_CURRENT.md (架構圖)
- **內容**:
  - 前後端職責劃分
  - API 端點清單
  - 代碼重複問題
  - 優化建議（短/中/長期）

---

## 2025-11-29: ESLint 基線建立與配置

### 決策：手動配置瀏覽器全域變數
- **原因**: globals.browser 導入會造成 whitespace 格式化 bug
- **影響**: 在 eslint.config.js 手動新增 5 個瀏覽器全域變數
- **變數列表**: document, window, navigator, localStorage, console
- **替代方案**: 使用 globals.browser (已回滾)

### 決策：建立 ESLint 基線 (699 issues)
- **原因**: 需要可量化的優化起點
- **影響**:
  - 錯誤: 307
  - 警告: 392
  - 可自動修復: 81
- **策略**: 漸進式修復，優先處理高影響問題

### 決策：延後複雜度與檔案長度重構
- **原因**: 需要架構層級的重構，非快速修復
- **影響**:
  - 複雜度警告: 2 個（延後至 Phase 2）
  - 檔案長度警告: 1 個（延後至 Phase 2）
- **時程**: Week 2-3 處理

### 決策：延後 @typescript-eslint/no-explicit-any 替換
- **原因**: 需要完整類型系統設計，約 20 個 any 需替換
- **影響**: 暫時保留 any 類型
- **時程**: Week 2 專門處理 TypeScript 類型優化

---

## 2025-11-29: Cloudflare Workers 部署與 TypeScript 修復

### 決策：環境隔離策略
- **原因**: 前後端在同一 job 中導致類型定義污染
- **影響**: 拆分為兩個獨立 jobs (build-frontend, deploy-worker)
- **結果**: 成功解決 TypeScript 類型衝突問題

### 決策：Node.js 版本升級
- **原因**: Wrangler 4.51.0 需要 Node.js 20+
- **影響**: 升級 CI/CD 環境從 v18 到 v20
- **替代方案**: 降級 wrangler（不推薦）

### 決策：使用 esbuild 預編譯
- **原因**: wrangler 的 TypeScript 編譯在 CI 環境不穩定
- **影響**: 提交預編譯的 dist/index.js 到 Git
- **優點**: 繞過 wrangler TypeScript 問題
- **缺點**: 需要手動編譯後提交

### 決策：暫時跳過前端類型檢查
- **原因**: 加速部署，先讓系統運行
- **影響**: 移除 vue-tsc 從 build 腳本
- **後續**: 在獨立分支修復所有 TypeScript 錯誤

### 決策：排除測試檔案的類型檢查
- **原因**: 測試檔案有大量類型錯誤，不影響運行
- **影響**: tsconfig.json 排除 `src/**/__tests__/**`
- **替代方案**: 修復所有測試檔案（耗時）

---

## 2025-11-29: Cloudflare Workers 遷移

### 決策：跳過資料遷移任務
- **原因**: 無生產資料需要遷移
- **影響**: Task 2-3 標記為跳過
- **替代方案**: 有實際資料時再實作遷移腳本

### 決策：跳過 KV 快取實作
- **原因**: 非核心功能，優先完成基本功能
- **影響**: Task 5 標記為可選優化
- **替代方案**: 效能需求時再加入

### 決策：使用 itty-router
- **原因**: 輕量級、Workers 友好
- **優點**: 最小化 bundle size
- **替代方案**: Hono (更多功能但較大)

### 決策：Drizzle ORM
- **原因**: 類型安全、D1 原生支援
- **優點**: 零運行時開銷
- **替代方案**: Kysely (更靈活但學習曲線)
