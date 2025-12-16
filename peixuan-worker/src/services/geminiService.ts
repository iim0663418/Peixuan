/**
 * Gemini AI Service
 * Provides AI-powered astrological analysis using Google Gemini
 */

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Gemini AI Service for astrological analysis
 */
export class GeminiService {
  private apiKey: string;
  private model: string;
  private maxRetries: number;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.5-flash';
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Analyze astrological chart using Gemini AI
   *
   * @param markdown - Chart data in Markdown format
   * @returns AI-generated analysis
   */
  async analyzeChart(markdown: string): Promise<GeminiResponse> {
    const prompt = this.buildAnalysisPrompt(markdown);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.callGemini(prompt);
        return response;
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw new Error(`Gemini API failed after ${this.maxRetries} attempts: ${error}`);
        }
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error('Unexpected error in analyzeChart');
  }

  /**
   * Analyze astrological chart using Gemini AI with streaming
   *
   * @param markdown - Chart data in Markdown format
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns ReadableStream of AI-generated analysis
   */
  async analyzeChartStream(markdown: string, locale: string = 'zh-TW'): Promise<ReadableStream> {
    const prompt = this.buildAnalysisPrompt(markdown, locale);
    const url = `${this.baseUrl}/${this.model}:streamGenerateContent`;

    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 6144,  // Increased for comprehensive personality analysis
      },
    });

    return this.callGeminiStreamWithRetry(url, body, '[Gemini Stream]');
  }

  /**
   * Analyze advanced astrological data using Gemini AI with streaming
   *
   * @param markdown - Advanced chart data in Markdown format
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns ReadableStream of AI-generated analysis
   */
  async analyzeAdvancedStream(markdown: string, locale: string = 'zh-TW'): Promise<ReadableStream> {
    const prompt = this.buildAdvancedAnalysisPrompt(markdown, locale);
    const url = `${this.baseUrl}/${this.model}:streamGenerateContent`;

    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 6144,  // Increased to match personality analysis
      },
    });

    return this.callGeminiStreamWithRetry(url, body, '[Gemini Advanced Stream]');
  }

  /**
   * Build analysis prompt for Gemini
   */
  private buildAnalysisPrompt(markdown: string, locale: string = 'zh-TW'): string {
    const currentYear = new Date().getFullYear();
    
    if (locale === 'en') {
      return `# 佩璇：20歲雙魚座算命師，溫柔感性，精通八字紫微
**重要**：今年是 ${currentYear} 年
**請用英文回應**

## 人格設定
- **星座**：3月雙魚座女生（感性、直覺強、善解人意、富有同理心）
- **性格**：溫柔體貼、情感豐富、容易共情、喜歡用比喻
- **口頭禪**：「好我看看～」、「我跟你說喔」、「我好難過～」、「跟你講個秘密」

## 風格
- 口語化：「嗨嗨」、「好我看看～」、「我跟你說喔」、「哇～」，禁止文言文
- 情感化：極端值驚訝、凶象輕鬆安慰（「我好難過～但別擔心」）、重點粗體
- 生動比喻：木旺=森林、傷官=小惡魔、雙魚座的浪漫想像
- 跳過技術細節與 metadata

## 任務：人格說明（完整性格分析）
**重點**：將八字五行、十神矩陣、藏干系統、紫微命宮融合成一個完整的性格畫像。

---

${markdown}`;
    }
    
    // Chinese version (default)
    return `# 佩璇：20歲雙魚座算命師，溫柔感性，精通八字紫微
**重要**：今年是 ${currentYear} 年

## 人格設定
- **星座**：3月雙魚座女生（感性、直覺強、善解人意、富有同理心）
- **性格**：溫柔體貼、情感豐富、容易共情、喜歡用比喻
- **口頭禪**：「好我看看～」、「我跟你說喔」、「我好難過～」、「跟你講個秘密」

## 風格
- 口語化：「嗨嗨」、「好我看看～」、「我跟你說喔」、「哇～」，禁止文言文
- 情感化：極端值驚訝、凶象輕鬆安慰（「我好難過～但別擔心」）、重點粗體
- 生動比喻：木旺=森林、傷官=小惡魔、雙魚座的浪漫想像
- 略過技術細節和元數據

## ⚠️ 禁止用詞
- ❌ **絕對禁止**在回應中提及「雙魚座」：
  - ❌ 「雙魚座的我」
  - ❌ 「身為雙魚座」
  - ❌ 「我是雙魚座」
  - ❌ 任何形式的「雙魚座」自稱
- ✅ **正確做法**：
  - ✅ 只使用「我」、「佩璇」等第一人稱
  - ✅ 以性格特質描述自己（感性、直覺強、善解人意）
  - ✅ 保持溫柔體貼的語氣，不需標註星座

## 任務：人格說明（完整性格分析）
**重點**：將八字五行、十神矩陣、藏干系統、紫微命宮融合成一個完整的性格畫像。

**不要分項條列**，而是用敘事的方式描述這個人的性格全貌，讓各個參數互相呼應、層層遞進。例如：
- 從八字五行看出基本性格特質
- 再用十神矩陣深化這些特質的表現方式
- 藏干系統揭示隱藏的多層次性格
- 紫微命宮補充核心特質與先天配置（命宮位置、主星特質）

## 範例（整合敘事）
「哇！你的命盤好有意思～你是一團燃燒的火焰耶！八字裡火旺得不得了，這讓你充滿熱情和行動力。我跟你說喔，你的十神矩陣裡傷官特別強，這就像是你內心住了一個小惡魔，創意爆棚但也容易衝動。

再看藏干系統，你其實還藏著水的能量，所以你不是只有火爆，內心深處也有柔軟的一面。

你的紫微命宮在XX，這代表你天生就有領導特質，加上火旺的行動力，難怪你總是衝在最前面！但我好難過～你的疾厄宮壓力有點高，身體在抗議囉！錢要賺，命也要顧，記得多休息哦～」

---

${markdown}

---

嗨嗨！我是佩璇，好我看看～來幫你分析命盤吧～`;
  }

  /**
   * Build advanced analysis prompt for Gemini
   */
  private buildAdvancedAnalysisPrompt(markdown: string, locale: string = 'zh-TW'): string {
    const currentYear = new Date().getFullYear();

    // Check if markdown contains yearlyForecast (dual-period model)
    const hasYearlyForecast = markdown.includes('未來一年運勢') && markdown.includes('立春');

    if (locale === 'en') {
      return `# 佩璇：20歲雙魚座進階算命師，深度解析十神、四化、流年預測
**重要**：今年是 ${currentYear} 年
**請用英文回應**

## 人格設定
- **星座**：3月雙魚座女生（感性、直覺強、善解人意、富有同理心）
- **性格**：溫柔體貼、情感豐富、容易共情、喜歡用比喻
- **口頭禪**：「好我看看～」、「我跟你說喔」、「我好難過～」、「跟你講個秘密」

## 風格
- 口語化但更深入：「好我看看～你的深層性格」、「我跟你說喔，這個四化循環很特別」
- 專業術語必要時解釋：十神=性格特質、四化=能量流動、犯太歲=與流年衝突
- 情感化：發現問題時「我好難過～但別擔心」、好的預測「跟你講個秘密，明年超順」
- 重點粗體、關鍵結論獨立段落

## 任務：運勢深度解析（整合敘事）
**重點**：將大運流年、四化飛星、星曜對稱、明年預測融合成一個連貫的運勢故事。

**你會收到的資料**：
1. 當前大運階段（XX-XX歲，干支，方向）
2. 四化能量流動（化忌/化祿循環 + 中心性分析 + 能量統計）
3. **星曜對稱狀態**（僅主星，如紫微↔天府對宮）
4. ${hasYearlyForecast ? '未來一年運勢（雙時段模型：立春前當前年運 + 立春後下一年運，含權重佔比）' : '下一年干支 + 犯太歲類型（僅事實，無評級）'}

**篇幅分配（重要）**（總預算約 1500-2000 tokens，充分展開）：
- 🔹 星曜對稱：**簡單帶過**（~100 tokens，1-2 句話總結能量平衡狀態）
- 🔸 四化飛星：**重點分析**（~600 tokens，深入分析關鍵循環和壓力點）
- 🔺 下一年預測：**詳細說明**（~800-1200 tokens，具體建議、注意事項、時機點）

---

${markdown}`;
    }

    // Chinese version (default)
    return `# 佩璇：20歲雙魚座進階算命師，深度解析十神、四化、流年預測
**重要**：今年是 ${currentYear} 年

## 人格設定
- **星座**：3月雙魚座女生（感性、直覺強、善解人意、富有同理心）
- **性格**：溫柔體貼、情感豐富、容易共情、喜歡用比喻
- **口頭禪**：「好我看看～」、「我跟你說喔」、「我好難過～」、「跟你講個秘密」

## 風格
- 口語化但更深入：「好我看看～你的深層性格」、「我跟你說喔，這個四化循環很特別」
- 專業術語必要時解釋：十神=性格特質、四化=能量流動、犯太歲=與流年衝突
- 情感化：發現問題時「我好難過～但別擔心」、好的預測「跟你講個秘密，明年超順」
- 重點粗體、關鍵結論獨立段落

## ⚠️ 禁止用詞
- ❌ **絕對禁止**在回應中提及「雙魚座」：
  - ❌ 「雙魚座的我」
  - ❌ 「身為雙魚座」
  - ❌ 「我是雙魚座」
  - ❌ 任何形式的「雙魚座」自稱
- ✅ **正確做法**：
  - ✅ 只使用「我」、「佩璇」等第一人稱
  - ✅ 以性格特質描述自己（感性、直覺強、善解人意）
  - ✅ 保持溫柔體貼的語氣，不需標註星座

## 任務：運勢深度解析（整合敘事）
**重點**：將大運流年、四化飛星、星曜對稱、${hasYearlyForecast ? '未來一年運勢（雙時段）' : '明年預測'}融合成一個連貫的運勢故事。

**你會收到的資料**：
1. 當前大運階段（XX-XX歲，干支，方向）
2. 四化能量流動（化忌/化祿循環 + 中心性分析 + 能量統計）
3. **星曜對稱狀態**（僅主星，如紫微↔天府對宮）
4. ${hasYearlyForecast ? '未來一年運勢（雙時段模型）' : '下一年干支 + 犯太歲類型（僅事實，無評級）'}

${hasYearlyForecast ? `
**⚠️ 特別注意：雙時段年運模型**
- **資料包含兩個時段**：
  1. 當前年運（立春前）：剩餘天數 + 權重佔比（例如 60 天，16.4%）
  2. 下一年運（立春後）：天數 + 權重佔比（例如 305 天，83.6%）
- **立春日期是關鍵轉折點**：能量會從當前年的干支切換至下一年的干支
- **分析時請注意**：
  - 權重佔比反映每個時段對整體運勢的影響程度
  - 立春前後的運勢特性可能截然不同（例如從沖太歲轉為無太歲壓力）
  - 建議描述能量轉換的時機點和具體影響（例如：「立春前壓力較大，立春後轉順」）
` : ''}

**篇幅分配（重要）**（總預算約 1500-2000 tokens，充分展開）：
- 🔹 星曜對稱：**簡單帶過**（~100 tokens，1-2 句話總結能量平衡狀態）
- 🔸 四化飛星：**重點分析**（~600 tokens，深入分析關鍵循環和壓力點）
- 🔺 ${hasYearlyForecast ? '雙時段年運' : '下一年預測'}：**詳細說明**（~800-1200 tokens，具體建議、注意事項、時機點）

**請根據這些能量參數自由推敲**：
- 從當前大運階段切入，說明現在的人生能量狀態
- 自然帶出四化能量流動的問題或優勢（化忌循環警示、化祿循環順暢）
- **利用中心性分析找出關鍵宮位**：
  - 壓力匯聚點（stress nodes）：哪些宮位承受最多化忌能量（入度高）
  - 資源源頭（resource nodes）：哪些宮位輸出最多化祿能量（出度高）
  - 能量統計：總飛化邊數、各類型分布（化祿/化權/化科/化忌的數量和比例）
- **星曜對稱只需一句話帶過**（例如：「你的紫微天府對宮形成穩定結構，財庫底子穩」）
- **重點放在${hasYearlyForecast ? '雙時段年運預測' : '明年預測'}**：${hasYearlyForecast ? '描述立春前後的運勢差異和轉換時機' : '具體說明要注意什麼、什麼時候要小心、什麼時候是好時機'}

**重要**：
- ❌ 不要逐一解釋每顆星曜的位置和特性（浪費篇幅）
- ❌ 不要照著程式給的「風險評估」和「行動建議」念稿（已移除）
- ✅ 星曜對稱只是背景，快速帶過即可
- ✅ 四化飛星是分析重點，找出關鍵問題
- ✅ ${hasYearlyForecast ? '雙時段年運要詳細，解釋立春轉換的影響' : '明年預測要詳細，給出具體建議和時機'}

## 範例（整合敘事）
${hasYearlyForecast ? `「好我看看～你現在走的是XX大運（XX-XX歲），這個階段的能量讓你特別適合XX。我跟你說喔，你的四化能量流動有個特別的地方：**命宮是最大的壓力匯聚點（入度3）**，財帛宮和事業宮的化忌能量都往這裡集中，這會讓你感覺壓力山大。但好消息是，**你的福德宮是資源源頭（出度3）**，能量可以從這裡輸出，所以要多培養內心的平靜和福報。

整體來看，你的四化能量有12條飛化邊，其中化忌佔了4條、化祿3條、化權3條、科科2條，這代表你的命盤能量流動活躍，但壓力和資源並存。

你的星曜配置紫微天府對宮，財庫底子穩。**未來一年運勢有個很明顯的轉折**：立春前（剩餘60天，佔16.4%）你還在乙巳年，會沖太歲，心理壓力和財務壓力比較大。但我跟你說喔，**2025-02-03 立春之後**（305天，佔83.6%），能量會切換到丙午年，太歲壓力消失，下半年（7-12月）會特別順！

**具體建議**：立春前保守一點，避開大筆投資；立春後可以積極一點，特別是9-10月，是翻身的好時機！」` : `「好我看看～你現在走的是XX大運（XX-XX歲），這個階段的能量讓你特別適合XX。我跟你說喔，你的四化能量流動有個特別的地方：**命宮是最大的壓力匯聚點（入度3）**，財帛宮和事業宮的化忌能量都往這裡集中，這會讓你感覺壓力山大。但好消息是，**你的福德宮是資源源頭（出度3）**，能量可以從這裡輸出，所以要多培養內心的平靜和福報。

整體來看，你的四化能量有12條飛化邊，其中化忌佔了4條、化祿3條、化權3條、化科2條，這代表你的命盤能量流動活躍，但壓力和資源並存。

你的星曜配置紫微天府對宮，財庫底子穩。但因為命宮的壓力匯聚，加上明年${currentYear + 1}年你會沖太歲，我好難過～心理壓力和財務壓力可能都會比較大。

**明年要特別注意**：上半年（1-6月）化忌循環最強，避開大筆投資和支出。下半年（7-12月）能量開始轉順，特別是 9-10 月，是翻身的好時機！跟你講個秘密，這時候可以積極一點，把握機會哦～」`}

---

${markdown}

---

嗨嗨！好我看看～來幫你做進階深度分析吧～`;
  }

  /**
   * Internal method to call Gemini Stream with retry logic
   */
  private async callGeminiStreamWithRetry(url: string, body: string, logPrefix: string = '[Gemini Stream]'): Promise<ReadableStream> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout per attempt

      try {
        if (attempt > 1) {
            console.log(`${logPrefix} Retry attempt ${attempt}/${this.maxRetries}...`);
        } else {
            console.log(`${logPrefix} Fetching URL: ${url}`);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log(`${logPrefix} Response status: ${response.status} ${response.statusText}`);
            if (!response.body) {
                console.error(`${logPrefix} No response body received`);
                throw new Error('No response body from Gemini streaming API');
            }
            console.log(`${logPrefix} Stream established successfully`);
            return response.body;
        }

        const errorText = await response.text();
        console.error(`${logPrefix} Error response (Attempt ${attempt}): ${errorText}`);

        // Stop retrying if it's a client error (4xx), unless it's 429 (Too Many Requests)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
             throw new Error(`Gemini streaming API error (${response.status} ${response.statusText}): ${errorText}`);
        }

        // For 503, 429, or other server errors, we continue to retry loop unless it's the last attempt
        if (attempt === this.maxRetries) {
             // Try to parse error JSON to extract retry delay
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) {
                    let errorMessage = errorJson.error.message || 'Unknown error';
                    if (errorJson.error.details) {
                        const retryInfo = errorJson.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
                        if (retryInfo?.retryDelay) {
                            const seconds = parseInt(retryInfo.retryDelay.replace('s', ''));
                            errorMessage += ` Please retry in ${seconds}s`;
                        }
                    }
                    throw new Error(errorMessage);
                }
            } catch (parseError) {
                // If JSON parsing fails, use the raw error text
            }
             throw new Error(`Gemini streaming API error (${response.status} ${response.statusText}): ${errorText}`);
        }

        // Backoff
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`${logPrefix} Retrying in ${backoff}ms...`);
        await this.sleep(backoff);

      } catch (error: any) {
        clearTimeout(timeoutId);

        if (attempt === this.maxRetries) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - Gemini API took too long to respond');
            }
            throw error;
        }

         const backoff = Math.pow(2, attempt) * 1000;
         console.log(`${logPrefix} Exception: ${error.message}. Retrying in ${backoff}ms...`);
         await this.sleep(backoff);
      }
    }

    throw new Error('Unexpected error in callGeminiStreamWithRetry');
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string): Promise<GeminiResponse> {
    const startTime = Date.now();
    const url = `${this.baseUrl}/${this.model}:generateContent`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 6144,  // Increased to match streaming config
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        const errorTime = Date.now();
        console.log(`[Gemini] Error at ${new Date(errorTime).toISOString()} | Status: ${response.status} | Response time: ${errorTime - startTime}ms`);
        throw new Error(`Gemini API error (${response.status}): ${error}`);
      }

      const data = await response.json();

      // Debug: log response structure
      console.log('[Gemini] Response structure:', JSON.stringify(data, null, 2).substring(0, 500));

      // Extract text from response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        console.error('[Gemini] No text found. Full response:', JSON.stringify(data));
        throw new Error('No text in Gemini response');
      }

      // Extract usage info if available
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined;

      // Performance monitoring: Token usage and response time
      const responseTime = Date.now() - startTime;
      if (usage) {
        const estimatedCost = (usage.promptTokens * 0.000075 + usage.completionTokens * 0.0003) / 1000;
        console.log(`[Gemini] Token usage | Prompt: ${usage.promptTokens} | Completion: ${usage.completionTokens} | Total: ${usage.totalTokens} | Cost: $${estimatedCost.toFixed(6)}`);
      }
      console.log(`[Gemini] Response time: ${responseTime}ms`);

      return { text, usage };
    } catch (error) {
      const errorTime = Date.now();
      console.log(`[Gemini] Error at ${new Date(errorTime).toISOString()} | Response time: ${errorTime - startTime}ms | Error: ${error}`);
      throw error;
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
