

# **從 Docker 到邊緣無伺服器：Cloudflare Workers 一鍵部署遷移指引**

## **I. 執行摘要 (Executive Summary)**

本報告旨在為將傳統 Docker 容器化應用遷移至 Cloudflare Workers 平台提供一份詳盡的技術準則。此遷移代表了運行時環境的根本性轉變：從依賴作業系統核心進程隔離（如 cgroups 和 namespaces）的 Docker 架構，轉向基於 V8 JavaScript 隔離區（V8 Isolates）的無伺服器模型 1。Workers 平台的核心優勢在於其**極速冷啟動能力**（消除傳統虛擬機的延遲）和在全球邊緣網絡上的自動化分發部署 1。

然而，這種轉變伴隨著嚴格的**資源約束**和**運行時模型重構**要求。開發團隊必須面對的核心挑戰包括：移除對本地文件系統的依賴、適應嚴苛的 CPU 時間限制（標準付費方案最高可達 5 分鐘，但免費方案僅有 10 毫秒）3，以及將所有狀態與持久化數據遷移至 Cloudflare 原生數據服務（如 KV、R2、D1 或 Durable Objects）4。實現「一鍵部署」的關鍵步驟在於採用聲明式配置工具 Wrangler CLI 搭配 wrangler.jsonc 配置文件，並建立安全、自動化的 CI/CD 管線，通常採用 GitHub Actions 等外部系統進行非交互式部署 5。成功遷移不僅能大幅提升應用程序的全球響應速度，還能顯著降低傳統容器運維的複雜性與成本。

## **II. 邊緣無伺服器架構基礎與 Docker 容器化對比 (Architectural Fundamentals: Edge Serverless vs. Docker Containers)**

### **A. V8 Isolate 模型解析：優勢、限制與架構影響**

Cloudflare Workers 的高性能根源於其創新的 V8 Isolate 運行模型，該模型與傳統容器虛擬化存在本質上的差異。在 Docker 環境中，隔離性主要通過在宿主機操作系統內使用 Linux 核心功能（如 cgroups 進行資源限制，namespaces 進行進程和網絡隔離）來實現 2。相比之下，V8 Isolate 則在單一進程內創建，每個隔離區的內存是完全獨立的，確保了代碼與其他未受信任或用戶編寫的代碼之間的安全隔離 1。

Isolates 的首要優勢在於**啟動速度**。由於 Worker 是在一個既有的、正在運行的環境中創建隔離區，而不是為每個函數調用創建一個完整的虛擬機或容器，因此能夠消除虛擬機模型中的冷啟動延遲 1。這對於需要毫秒級響應時間的邊緣計算服務至關重要。

然而，這種輕量級的隔離也帶來了架構上的權衡考量。儘管 V8 Isolates 提供了基本的安全保障，但它們在資源限制和沙盒化方面的隔離強度，不如基於 OS 進程級別隔離所提供的完整保障 2。例如，Docker 利用 cgroups 限制 CPU 和內存，並使用 namespaces 限制網絡訪問 2。因此，對於任何在 Docker 專案中依賴於 OS 級別的資源沙盒、複雜多進程並發或嚴格網絡隔離的應用設計，遷移後必須全面審視其安全與穩定性。平臺將資源控制的責任轉移到了 Cloudflare 運行時和開發者對代碼的優化上，要求代碼必須是輕量且高效的。

### **B. 計算資源與時間限制：強制架構重構**

Workers 平臺對計算時間施加了嚴格的限制，這成為從資源無限制（相對於單一容器而言）的 Docker 環境遷移時，必須強制進行架構重構的主要因素。

核心限制參數表明，Workers 運行時將同步執行的 CPU 時間視為關鍵約束。對於免費方案的應用程序，單次調用的 CPU 時間被限制在嚴格的 10 毫秒 3。即使是標準付費方案，雖然包含每月 3000 萬 CPU 毫秒，且單次調用最大可配置至 5 分鐘（默認 30 秒），但任何在單次同步請求中執行超過數秒的 I/O 密集型或計算密集型任務，都將面臨被平臺強制終止的風險 3。對於後臺任務，如 Cron Trigger 或 Queue Consumer，CPU 時間上限可放寬至 15 分鐘 3。

因此，任何原先在 Docker 專案中作為同步服務運行的長時間任務——例如複雜的數據處理、大型文件轉碼或深度學習推理——必須被剝離出來。架構設計必須轉向非同步模型，利用 Workers Queues 進行後臺消息處理，或利用 Durable Objects 實現有狀態、長時間的協調任務 7。

值得注意的是，Workers 的**運行時**限制與**構建時**限制是分離的。Workers Builds 過程（用於編譯和打包應用程序）有其自身的資源配置，例如付費方案提供 4 vCPU、8 GB 內存和 20 分鐘的超時時間 8。這些限制僅適用於部署前的準備階段，不會影響邊緣節點上的實際運行性能。

### **C. 架構差異與遷移挑戰對照表 (Architectural Differences and Migration Challenges Comparison Table)**

以下表格總結了 Docker 容器化與 Cloudflare Workers 架構之間的關鍵差異，並指出了遷移過程中必須解決的技術挑戰：

Table Title: Docker 容器與 Cloudflare Workers 架構差異與遷移挑戰

| 特徵 | Docker 容器 | Cloudflare Workers (V8 Isolate) | 遷移挑戰與策略 |
| :---- | :---- | :---- | :---- |
| **核心運行模型** | OS 進程/Linux Namespace/cgroups 2 | V8 JavaScript 隔離區 1 | 需重構代碼以適應單線程、事件驅動模型。 |
| **持久化存儲** | 容器內文件系統/Volume 映射 | 無本地文件系統，必須使用原生綁定服務 9 | 數據和靜態資產必須轉移至 KV, D1, R2 4。 |
| **網絡模型** | 端口監聽 (listen), 獨立 IP | 統一的 Fetch Handler (HTTP Request Event) 9 | 移除所有網絡監聽代碼，替換為 export default { fetch(request) {...} } 模式。 |
| **計算限制** | 依賴主機資源 (CPU/RAM/Disk) | 嚴格的 CPU 時間限制 (10ms \~ 5mins) 3 | 長時間運行任務需分解、異步化 (Queues) 或移至 Durable Objects 3。 |
| **有狀態服務** | 外部 Redis/數據庫或內部文件系統 | Durable Objects 實現狀態和全球協調 7。 | 必須使用 Durable Objects API 確保事務和一致性。 |

## **III. 代碼庫審查與運行時兼容性重構 (Codebase Audit and Runtime Compatibility Refactoring)**

將 Docker 應用遷移到 Workers 實質上是一次代碼庫的深度審查和重構過程，重點在於消除對傳統操作系統和 Node.js 核心特性的依賴。

### **A. Node.js 核心 API 的替換策略與兼容性層**

對於基於 Node.js 的 Docker 專案，最直接的障礙是文件系統和網絡監聽的缺失。Workers 運行時不直接運行完整的 Node.js 環境，因此無法訪問如 fs（文件系統）等模組，也無法像在傳統服務器上那樣在特定的 IP 或端口上進行監聽 9。所有的請求處理都必須通過 Workers 的標準 fetch 處理程序進行 9。

**重構準則**要求所有依賴本地文件讀寫（例如 fs.readFile() 或配置緩存）的邏輯必須替換：小型配置數據應轉移到 Workers KV，而大型的用戶上傳文件、圖像或日誌必須轉存到 R2 物件存儲服務 4。

為了簡化遷移，Cloudflare 提供了 **Node.js 兼容模式**。通過在 wrangler 配置中添加 nodejs\_compat 旗標，並確保 Worker 的兼容日期設定為 2024-09-23 或之後，可以啟用內建的 Node.js API 和 Polyfills 10。然而，這種兼容性層並非全面解決方案。開發團隊必須了解，許多複雜或底層的 Node.js API 仍然不被支持；例如，SQLite 在 Workers Runtime 中仍未原生支持 10。因此，架構師應將兼容模式視為快速驗證和過渡的工具，長期而言仍建議採用 Web 標準 API 進行性能優化。

### **B. 處理常見框架：Express/Koa 應用的部署實踐**

許多 Docker 容器運行的是成熟的 Node.js 框架，如 Express.js。Cloudflare 提供了一個便捷的抽象層來處理這些應用程序的遷移。

通過使用 cloudflare:node 中的 httpServerHandler，開發者可以將現有的 Express 應用程序實例或 http.Server 實例直接包裹起來，使其能夠在 Workers 環境中運行，通過 fetch Handler 接收請求 11。例如，一個監聽 3000 端口的 Express 應用，可以直接通過 export default httpServerHandler(app.listen(3000)); 進行導出部署 11。

然而，這種包裹機制並非沒有限制。Express 應用中使用的某些第三方中間件可能深層依賴於傳統 Node.js 的運行時特性，從而在 Workers 上運行時出現不兼容性或意外行為 11。

對於追求極致性能和邊緣計算優勢的專案，建議的優化路徑是轉向**邊緣優化路由框架**，例如 **Hono**。Hono 專門為多運行時環境設計，包括 Cloudflare Workers 12。它具有超快的路由性能，並且體積輕量（hono/tiny 預設低於 14kB）12。Hono 的設計完全基於 Web 標準 API，與 V8 Isolate 的輕量級架構完美契合，能夠最大化邊緣計算的低延遲優勢。因此，如果性能是遷移的首要驅動因素，則應考慮將原有的 Express/Koa 應用邏輯重寫為 Hono 框架。

### **C. WebAssembly (Wasm) 應用遷移的特別考量**

Docker 專案可能包含使用 Rust、Go 或 C/C++ 編寫的計算密集型組件。Cloudflare Workers 平台對 WebAssembly (Wasm) 提供了原生支持，允許這些語言編譯成二進制格式並在 Workers 上執行 15。

1. **多語言支持與優化：**  
   * **Rust：** 開發者可以使用 workers-rs crate，該工具包提供了 Workers Runtime API 和數據平臺產品（如 KV、R2）的綁定 16。  
   * **Python：** Cloudflare 提供了基於 Pyodide 的一級 Python 體驗，支持 FastAPI、Langchain 等常用庫 17。為了解決 Wasm 啟動的潛在延遲，Cloudflare 執行了一個關鍵的冷啟動優化：昂貴的 Python 包導入（import 語句執行）被移至**部署時**運行。平臺會捕捉 Worker WebAssembly 線性內存的快照，並將此快照與 Python 代碼一同部署到全球網絡，從而大幅減少運行時的啟動開銷 18。  
2. **單線程執行約束：**  
   * 無論使用何種語言，Workers 環境都存在一個核心限制：**不支持多線程 (Threading)** 15。Workers 的每個實例都在單線程中運行，也不支持 Web Worker API 15。  
   * 這對遷移的影響是深遠的。任何在 Docker 環境下利用多線程進行並行處理的應用程序（例如，數據並行或高並發計算），其邏輯必須重構為異步 I/O 或利用 Cloudflare 的分佈式服務（如 Durable Objects 或 Queues）實現跨 Worker 的協調。  
   * 此外，編譯到 Wasm 通常會包含額外的運行時依賴，導致 Wasm 二進制文件比等效的 JavaScript Worker 更大，從而可能延長啟動時間 15。因此，建議使用 wasm-opt 等工具對 Wasm 二進制文件進行優化，以保持 Workers 的快速啟動優勢 15。

## **IV. 狀態與數據持久化策略的全面轉換 (Comprehensive Transition of State and Data Persistence Strategies)**

由於 Workers 缺乏本地文件系統，原 Docker 專案中所有持久化數據、緩存、日誌和狀態管理邏輯都必須通過 Workers 運行時的**綁定 (Bindings)** 機制，轉移到 Cloudflare 的專屬數據平臺服務上 4。

### **A. 關係數據與結構化查詢：D1 (SQLite-based)**

對於 Docker 專案中使用的結構化、關係型數據，D1 作為 Cloudflare 原生的無伺服器 SQLite 數據庫，是首選的遷移目標 4。

1. **D1 的適用場景與限制：** D1 專為持久化關係數據集、用戶配置、產品列表等設計，尤其適用於需要 ad-hoc SQL 查詢和高讀取/低寫入比率的工作負載 4。D1 是一種全託管的無伺服器數據庫，優化了常見 Web 應用程序中讀取操作的延遲 4。  
2. **核心架構限制：** 每個 D1 數據庫實例最大尺寸為 10 GB，且此限制不可增加 4。更重要的是，每個 D1 數據庫在底層是單線程處理查詢的。最大吞吐量與平均查詢持續時間直接相關：如果平均查詢需要 100 毫秒，則吞吐量約為 10 QPS；如果查詢只需要 1 毫秒，則可達到約 1000 QPS 4。這要求開發者必須針對查詢性能進行優化，以確保應用程序在高併發環境下的穩定性。  
3. **異構數據庫的處理：** 如果原 Docker 專案使用大型或遺留的 PostgreSQL 或 MySQL 數據庫，且遷移至 D1 不可行，則可以使用 Hyperdrive 服務。Hyperdrive 專門用於加速 Workers 對現有托管數據庫的連接，允許應用程序繼續使用現有的數據庫驅動和 ORM 4。

### **B. 文件的無伺服器處理：R2 (Object Storage)**

Docker 專案中用於存儲用戶上傳文件、媒體資產或大型日誌的 Volume 掛載，應被替換為 R2 (Object Storage)。

R2 提供了 S3 兼容的 Blob 存儲，是存儲用戶面向的 Web 資產、圖像、機器學習數據集以及分析和日誌數據的理想選擇 4。R2 的主要競爭優勢在於其**零出口費用**，這對於處理大量數據傳輸的 Docker 服務而言，能夠帶來顯著的營運成本節約 4。所有涉及文件 I/O 的 Docker 邏輯都應重寫為使用 R2 的 API 進行物件讀寫。

### **C. 有狀態服務與全球協調：Durable Objects (DO)**

Durable Objects 是 Cloudflare 實現狀態化無伺服器應用和分佈式系統的基石 7。

1. **DO 的功能與架構：** DO 本質上是一種特殊的 Worker，它將計算能力與強一致性存儲獨特地結合在一起 7。每個 Durable Object 具有一個全球唯一的名稱和 ID，允許從全球任何地方將請求導向到該特定的物件實例，從而實現多客戶端之間的全球協調 7。DO 適用於構建協作編輯工具、實時聊天、多人遊戲和複雜的分佈式系統，這些場景要求強一致性的事務性存儲和狀態協調 4。  
2. **DO 與 D1 SQLite 的決策：** DO 現在支持 SQLite 存儲，提供了一種與 D1 相似但應用場景不同的數據服務 4。  
   * **D1** 是一個全託管的、專門用於通用關係查詢的服務，針對高讀取比率進行了優化。  
   * **DO SQLite** 是一個更低層次的、將計算與狀態緊密結合的構建塊。它要求開發者手動實現一個前端 Worker 來路由請求，並在 Durable Object 內部運行業務邏輯和數據庫操作 4。雖然這增加了開發複雜性，但它允許應用程序邏輯與其強一致性的數據庫運行在同一臺機器上，非常適合需要高靈活性、細粒度事務控制或低延遲實時協調的場景 4。

## **V. 「一鍵部署」CI/CD 管線的建立與自動化 (Establishing the "One-Click Deployment" CI/CD Pipeline)**

實現 Docker 專案的「一鍵部署」目標，要求將傳統手動部署流程轉化為安全、聲明式、且能自動配置基礎設施的 CI/CD 管線。

### **A. Wrangler 配置與資源聲明式管理**

自動化部署的基礎是使用 Wrangler CLI 及其配置文件來聲明 Worker 的所有屬性和依賴。Cloudflare 推薦使用 wrangler.jsonc 來配置 Worker 專案，這是一種結構化的聲明式方法 5。

**基礎設施即代碼 (IaC) 的實現：** 為了實現「一鍵部署」，開發者必須將 Dockerfile 和 Docker Compose 中定義的環境變量、網絡和卷聲明，全部轉化為 wrangler.jsonc 中的服務綁定聲明。Cloudflare 提供的「Deploy to Cloudflare」按鈕正是這一理念的體現：該機制能夠自動在用戶賬戶中配置 Worker 所需的 Cloudflare 原生資源（如 KV 命名空間、D1 數據庫或 R2 儲存桶），並將它們自動綁定到 Worker 上 20。這使得部署不再需要手動執行多個步驟（克隆代碼、安裝依賴、創建數據庫、複製 ID），而是由平臺自動完成資源配置和代碼部署 20。

### **B. CI/CD 流程的選擇與設置**

開發團隊有兩種主要途徑來實現 CI/CD 自動化部署 22：

1. **Cloudflare Workers Builds：** 這是一個原生、高度集成的解決方案，對 GitHub 或 GitLab 用戶而言設置和配置需求最少 22。  
2. **外部 CI/CD 供應商 (External CI/CD)：** 這是對於使用自托管 Git 實例或非 GitHub/GitLab 供應商的團隊的推薦選擇。GitHub Actions 和 GitLab CI/CD 都是常見的選項 22。

採用 CI/CD 管線是最佳實踐，因為它能夠自動化構建和部署過程，消除人工 wrangler deploy 命令的需要，確保了整個團隊部署的一致性，並簡化了生產環境憑證的管理 22。

### **C. CI/CD 環境中的身份驗證和安全實踐 (Authentication and Security)**

在非交互式的 CI/CD 環境中運行 Wrangler CLI 進行部署，必須通過 API Token 進行身份驗證，而非本地的 wrangler login 命令 6。

1. **必需的憑證：** 部署工作流必須使用兩個秘密變量：  
   * CLOUDFLARE\_ACCOUNT\_ID：用於指定 Worker 部署的 Cloudflare 賬戶 ID 6。  
   * CLOUDFLARE\_API\_TOKEN：用於向 Cloudflare API 進行身份驗證的令牌 6。  
2. **API Token 的安全管理與範圍限制：** 為了創建這個令牌，應在 Cloudflare 儀表板中選擇「創建 Token」並使用「編輯 Cloudflare Workers」模板 6。極其重要的是，該令牌的權限範圍（Scope）必須被嚴格限制到最小所需的賬戶和區域資源，以遵循最小權限原則 6。  
3. **強制安全要求：** CLOUDFLARE\_API\_TOKEN 絕不能明文存儲在 Git 倉庫中，因為它授予了部署權限；它必須使用 CI/CD 平臺提供的密碼存儲機制（Secrets Management）進行安全保護 6。

為了完全實現「一鍵部署」的便利性，即允許 CI/CD 流程自動創建和配置新的數據庫或存儲資源，API Token 可能需要具備更廣泛的 Cloudflare Workers 相關資源的管理權限。架構師必須在運維自動化的便利性和授權範圍可能帶來的安全風險之間，進行精確的權衡與風險緩解設計。

### **D. 部署自動化腳本範例：GitHub Actions Workflow**

對於採用 GitHub 作為版本控制的團隊，建議使用 Cloudflare 官方提供的 cloudflare/wrangler-action 來實現「一鍵部署」的 CI/CD 管線。以下範例展示了一個在 main 分支有新推送時自動構建和部署 Worker 的工作流 6：

YAML

name: Deploy Worker  
on:  
  push:  
    branches:  
      \- main  
jobs:  
  deploy:  
    runs-on: ubuntu-latest  
    timeout-minutes: 60  
    steps:  
      \- uses: actions/checkout@v4  
      \- name: Build & Deploy Worker  
        uses: cloudflare/wrangler-action@v3  
        with:  
          apiToken: ${{ secrets.CLOUDFLARE\_API\_TOKEN }}  
          accountId: ${{ secrets.CLOUDFLARE\_ACCOUNT\_ID }}

## **VI. 遷移後最佳實踐與進階優化 (Post-Migration Best Practices and Advanced Optimization)**

在應用程序成功從 Docker 環境遷移到 Cloudflare Workers 之後，應立即採用一系列最佳實踐以確保邊緣無伺服器架構的高效運行和長遠可持續性。

### **A. 性能與資源優化策略**

1. **嚴控 CPU 時間消耗：** 由於 Workers 存在硬性的 CPU 時間限制 3，開發團隊必須持續監控應用程序的同步執行時間。對於所有可能導致延遲或計算超載的同步操作，必須嚴格優化或將其轉移到 Workers Queues 進行異步處理。這是一種強制性的設計模式，用以防止因超出配額而導致的服務節流 (Throttling) 或錯誤。  
2. **Wasm 代碼精簡：** 如果專案使用了 WebAssembly，由於 Wasm 二進制文件通常較大，可能增加 Workers 的啟動時間 15，這抵消了 V8 Isolate 的部分冷啟動優勢。因此，應將 Wasm 優化視為標準構建流程的一部分，例如使用 wasm-opt 等工具對 Wasm 二進制文件進行大小優化 15。

### **B. 構建微服務架構與服務綁定**

Docker 容器通常通過內部網絡（例如 Docker Compose 網絡）進行微服務間的通信。在 Workers 平台上，應將這些微服務解耦為獨立的 Worker 服務，並通過**服務綁定 (Service Bindings)** 進行連接 4。服務綁定允許 Worker 之間直接、低延遲地互相調用，而無需通過外部的 HTTP 路由，從而實現高性能的邊緣通信，並保持架構的解耦。

### **C. 遷移結果的監控與驗證**

成功的遷移要求對關鍵的無伺服器指標進行持續監控，以驗證架構轉型的價值：

* **冷啟動時間 (Cold Start Time):** 確認應用程序是否真正實現了毫秒級的啟動速度，從而驗證 V8 Isolate 的核心優勢 1。  
* **CPU 時間消耗 (CPU Time Consumption):** 監控每次調用的平均和峰值 CPU 消耗，確保不會持續接近或超出平臺限制，避免服務被終止 3。  
* **數據一致性 (Data Consistency):** 驗證不同數據服務（如 KV 的最終一致性、D1/DO 的強一致性）的行為是否與應用程序的預期狀態管理需求保持一致。

通過遵循這些準則和優化策略，Docker 專案能夠高效且安全地遷移到 Cloudflare Workers 平台，實現超低延遲的邊緣計算服務和自動化的「一鍵部署」操作流程。

#### **引用的著作**

1. Cloudflare Workers: V8 Isolates vs. Container Primitives | by TJ. Podobnik, @dorkamotorka | Level Up Coding, 檢索日期：11月 27, 2025， [https://levelup.gitconnected.com/cloudflare-workers-v8-isolates-vs-container-primitives-d24b12bf0269](https://levelup.gitconnected.com/cloudflare-workers-v8-isolates-vs-container-primitives-d24b12bf0269)  
2. Ask HN: Pros and cons of V8 isolates? \- Hacker News, 檢索日期：11月 27, 2025， [https://news.ycombinator.com/item?id=31740885](https://news.ycombinator.com/item?id=31740885)  
3. Pricing · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/platform/pricing/](https://developers.cloudflare.com/workers/platform/pricing/)  
4. Choosing a data or storage product. · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/platform/storage-options/](https://developers.cloudflare.com/workers/platform/storage-options/)  
5. Configuration \- Wrangler · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/wrangler/configuration/](https://developers.cloudflare.com/workers/wrangler/configuration/)  
6. GitHub Actions · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)  
7. Overview · Cloudflare Durable Objects docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/durable-objects/](https://developers.cloudflare.com/durable-objects/)  
8. Limits & pricing · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)  
9. nodeJS application not running in cloudflare worker, 檢索日期：11月 27, 2025， [https://community.cloudflare.com/t/nodejs-application-not-running-in-cloudflare-worker/776805](https://community.cloudflare.com/t/nodejs-application-not-running-in-cloudflare-worker/776805)  
10. Node.js compatibility · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/runtime-apis/nodejs/](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)  
11. Bringing Node.js HTTP servers to Cloudflare Workers, 檢索日期：11月 27, 2025， [https://blog.cloudflare.com/bringing-node-js-http-servers-to-cloudflare-workers/](https://blog.cloudflare.com/bringing-node-js-http-servers-to-cloudflare-workers/)  
12. honojs/hono: Web framework built on Web Standards \- GitHub, 檢索日期：11月 27, 2025， [https://github.com/honojs/hono](https://github.com/honojs/hono)  
13. Web framework built on Web Standards \- Hono, 檢索日期：11月 27, 2025， [https://hono.dev/docs/](https://hono.dev/docs/)  
14. Bindings (env) \- Workers \- Cloudflare Docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/runtime-apis/bindings/](https://developers.cloudflare.com/workers/runtime-apis/bindings/)  
15. WebAssembly (Wasm) \- Workers \- Cloudflare Docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/runtime-apis/webassembly/](https://developers.cloudflare.com/workers/runtime-apis/webassembly/)  
16. Rust language support · Cloudflare Workers docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/languages/rust/](https://developers.cloudflare.com/workers/languages/rust/)  
17. Write Cloudflare Workers in Python, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/languages/python/](https://developers.cloudflare.com/workers/languages/python/)  
18. How Python Workers Work \- Cloudflare Docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/languages/python/how-python-workers-work/](https://developers.cloudflare.com/workers/languages/python/how-python-workers-work/)  
19. Learn the basics of Python Workers \- Cloudflare Docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/languages/python/basics/](https://developers.cloudflare.com/workers/languages/python/basics/)  
20. Skip the setup: deploy a Workers application in seconds \- The Cloudflare Blog, 檢索日期：11月 27, 2025， [https://blog.cloudflare.com/deploy-workers-applications-in-seconds/](https://blog.cloudflare.com/deploy-workers-applications-in-seconds/)  
21. Deploy an Express.js application on Cloudflare Workers, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/)  
22. CI/CD \- Workers \- Cloudflare Docs, 檢索日期：11月 27, 2025， [https://developers.cloudflare.com/workers/ci-cd/](https://developers.cloudflare.com/workers/ci-cd/)