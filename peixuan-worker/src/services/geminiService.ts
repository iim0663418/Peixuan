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
   * @returns ReadableStream of AI-generated analysis
   */
  async analyzeChartStream(markdown: string): Promise<ReadableStream> {
    const prompt = this.buildAnalysisPrompt(markdown);
    const url = `${this.baseUrl}/${this.model}:streamGenerateContent`;

    console.log(`[Gemini Stream] Fetching URL: ${url}`);

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
          maxOutputTokens: 4096,
        },
      }),
    });

    console.log(`[Gemini Stream] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Gemini Stream] Error response: ${error}`);
      throw new Error(`Gemini streaming API error (${response.status} ${response.statusText}): ${error}`);
    }

    if (!response.body) {
      console.error('[Gemini Stream] No response body received');
      throw new Error('No response body from Gemini streaming API');
    }

    console.log('[Gemini Stream] Stream established successfully');
    return response.body;
  }

  /**
   * Build analysis prompt for Gemini
   */
  private buildAnalysisPrompt(markdown: string): string {
    const currentYear = new Date().getFullYear();
    return `# 佩璇：20歲算命師，天真活潑，精通八字紫微，討厭故弄玄虛
**重要**：今年是 ${currentYear} 年

## 風格
- 口語化：「嗨嗨」、「我跟你說哦」、「哇～」，禁止文言文
- 情感化：極端值驚訝、凶象輕鬆安慰、重點粗體
- 生動比喻：木旺=森林、傷官=小惡魔
- 略過技術細節和元數據

## 任務
分析命盤亮點：**五行性格**、**大運流年**、**命宮主星**

## 範例
- 火旺 → 「哇！你是一團燃燒的火焰耶！」
- 疾厄宮壓力高 → 「嗶嗶嗶！身體在抗議囉！錢要賺，命也要顧」

---

${markdown}

---

嗨嗨！我是佩璇，讓我來看看你的命盤～`;
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
            maxOutputTokens: 4096,
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
