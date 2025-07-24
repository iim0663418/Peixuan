<CodeStyleGuide version="1.0" language="zh-TW">
  <Section name="CodeStyleAndAuthoring">
    <Rule desc="僅允許使用《ES Modules》語法（import/export），禁止《CommonJS》">
      僅採用 ES Modules，禁止 require。
    </Rule>
    <Rule desc="優先結構化 import 與單一主函式或元件匯出">
      使用解構 import，單檔單主體，命名依團隊規範。
    </Rule>
    <Rule desc="重點邏輯註解與安全防護">
      為《存取控制》、《輸入驗證》、《安全邏輯》加註註解。
    </Rule>
    <Rule desc="禁止硬編碼任何敏感資訊">
      不得出現《密碼》、《API Key》。
    </Rule>
    <Rule desc="強制所有外部輸入驗證與過濾">
      所有輸入必經驗證及消毒。
    </Rule>
    <Rule desc="遵守官方語言風格指引">
      以官方 Style Guide 為唯一標準。
    </Rule>
  </Section>
  <Section name="DevWorkflowAndCollaboration">
    <Rule desc="每次異動必跑型別與靜態檢查">
      程式異動必跑 type check、lint。
    </Rule>
    <Rule desc="Pull Request 安全性檢查與自動測試紀錄">
      PR 附 npm audit 報告、測試截圖或日誌。
    </Rule>
    <Rule desc="開發過程優先目標測試">
      僅執行變動檔案相關測試（npm run test &lt;file&gt;）。
    </Rule>
    <Rule desc="依賴變更需更新 SBOM 並檢查新套件安全性">
      依賴異動須同步 SBOM，審查新套件安全。
    </Rule>
    <Rule desc="記錄安全邏輯異動">
      《認證》、《授權》、《安全控管》須記錄，PR 中標註。
    </Rule>
  </Section>
  <Section name="SecureByDefaultGeneration">
    <Rule desc="嚴禁不安全預設值與硬編碼">
      產生程式碼不得出現硬編碼密碼或不安全設定。
    </Rule>
    <Rule desc="強制所有輸入驗證、消毒與最小權限原則">
      每個輸入皆須驗證，採最小權限。
    </Rule>
    <Rule desc="優先採用框架內建安全防護">
      如有內建安全設計，務必使用。
    </Rule>
    <Rule desc="產生程式碼前明列外部依賴">
      所有外部依賴必列清單。
    </Rule>
    <Rule desc="每段程式碼摘要已實作安全措施">
      各段程式需有安全措施摘要（如驗證、權限說明）。
    </Rule>
    <Rule desc="程式碼必須結構清晰、模組化與充分註解">
      結構明確、註解完整、易讀。
    </Rule>
  </Section>
  <Section name="ProjectManagement">
    <Rule desc="任務開始前先自動讀取/建立前次工作日誌">
      任務起始自 /doc 讀取，無則建立新日誌。
    </Rule>
    <Rule desc="任務結束後以標準命名存入/更新日誌">
      檔名格式「工作日誌_vyyyy-mm-dd_{標題}.md」，存於 /doc。
    </Rule>
    <Rule desc="日誌聚焦模型可讀欄位與結構化追蹤資訊">
      僅記錄《任務清單》、《任務 Map》、《狀態》與執行摘要，減少敘事性描述。
    </Rule>
  </Section>
  <Extension>
    <!-- 自訂擴充規則區，可未來新增 -->
  </Extension>
</CodeStyleGuide>
