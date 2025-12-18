/**
 * Analyze Controller
 * Provides AI-powered astrological analysis endpoint
 */

import { UnifiedCalculator } from '../calculation/integration/calculator';
import { formatToMarkdown } from '../formatters/markdownFormatter';
import { formatAdvancedMarkdown } from '../formatters/advancedMarkdownFormatter';
import { AIServiceManager } from '../services/aiServiceManager';
import { ChartCacheService } from '../services/chartCacheService';
import { AnalysisCacheService } from '../services/analysisCacheService';
import { AdvancedAnalysisCacheService } from '../services/advancedAnalysisCacheService';
import type { BirthInfo, CalculationResult } from '../calculation/types';
import type { AIOptions } from '../types/aiTypes';

export interface AnalyzeRequest {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  longitude?: number;
  isLeapMonth?: boolean;
}

export interface AnalyzeResponse {
  calculation: CalculationResult;
  aiAnalysis: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AnalyzeController {
  private aiServiceManager: AIServiceManager;
  private chartCacheService: ChartCacheService;
  private analysisCacheService: AnalysisCacheService;
  private advancedAnalysisCacheService: AdvancedAnalysisCacheService;

  constructor(aiServiceManager: AIServiceManager) {
    this.aiServiceManager = aiServiceManager;
    this.chartCacheService = new ChartCacheService();
    this.analysisCacheService = new AnalysisCacheService();
    this.advancedAnalysisCacheService = new AdvancedAnalysisCacheService();
  }

  /**
   * Analyze astrological chart with AI
   * 
   * @param requestData - Birth information
   * @returns Calculation result with AI analysis
   */
  async analyze(requestData: AnalyzeRequest): Promise<AnalyzeResponse> {
    try {
      // Step 1: Validate and parse input
      // Support multiple date formats:
      // - ISO format: "2024-01-01T12:00:00" or "2024-01-01 12:00:00"
      // - Separated: birthDate="2024-01-01", birthTime="12:00"
      let solarDate: Date;

      // Try to parse birthDate directly if it already contains time
      const directDate = new Date(requestData.birthDate);
      if (!isNaN(directDate.getTime()) && requestData.birthDate.includes('T')) {
        solarDate = directDate;
      } else {
        // Parse date and time separately
        const dateParts = requestData.birthDate.split(/[-\/]/);
        const timeParts = requestData.birthTime.split(':');

        if (dateParts.length !== 3 || timeParts.length < 2) {
          throw new Error('Invalid birth date or time format. Expected date: YYYY-MM-DD, time: HH:mm');
        }

        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        const second = timeParts[2] ? parseInt(timeParts[2]) : 0;

        solarDate = new Date(year, month, day, hour, minute, second);
      }

      if (isNaN(solarDate.getTime())) {
        throw new Error('Invalid birth date or time format. Expected date: YYYY-MM-DD, time: HH:mm');
      }

      if (!requestData.gender || !['male', 'female'].includes(requestData.gender)) {
        throw new Error('Invalid gender: must be "male" or "female"');
      }

      // Step 2: Prepare birth info
      const birthInfo: BirthInfo = {
        solarDate,
        longitude: requestData.longitude || 121.5,
        gender: requestData.gender,
        isLeapMonth: requestData.isLeapMonth || false,
      };

      // Step 3: Calculate chart
      const calculator = new UnifiedCalculator();
      const calculation = calculator.calculate(birthInfo);

      // Step 4: Convert to Markdown (exclude steps for AI, personality-only mode)
      const markdown = formatToMarkdown(calculation, { excludeSteps: true, personalityOnly: true });

      // Step 5: Build prompt and get AI analysis (default locale: zh-TW)
      const prompt = this.buildAnalysisPrompt(markdown, 'zh-TW');
      const aiResponse = await this.aiServiceManager.generate(prompt);

      // Step 6: Return combined result
      return {
        calculation,
        aiAnalysis: aiResponse.text,
        usage: aiResponse.metadata.usage,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith('Validation failed:')) {
          throw new Error(`Input validation error: ${error.message.replace('Validation failed: ', '')}`);
        }
        throw error;
      }
      throw new Error('Unknown error during analysis');
    }
  }

  /**
   * Check if analysis cache exists for a chart
   * @param chartId - The chart ID to check
   * @param env - Cloudflare Worker environment
   * @returns Object with cached status
   */
  async checkCache(chartId: string, env: { DB: D1Database }): Promise<{ cached: boolean }> {
    const cachedAnalysis = await this.analysisCacheService.getAnalysis(chartId, 'ai-streaming', env);
    return { cached: !!cachedAnalysis };
  }

  /**
   * Analyze astrological chart with streaming AI response
   *
   * @param chartId - The chart ID to analyze
   * @param env - Cloudflare Worker environment with DB binding
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns ReadableStream in SSE format
   */
  async analyzeStream(chartId: string, env: { DB: D1Database }, locale: string = 'zh-TW'): Promise<ReadableStream> {
    console.log('[analyzeStream] Entry, chartId:', chartId, 'locale:', locale);

    const encoder = new TextEncoder();
    const analysisType = `ai-streaming-${locale}`;
    
    // Bind methods to preserve this context
    const buildAnalysisPrompt = this.buildAnalysisPrompt.bind(this);
    const aiServiceManager = this.aiServiceManager;
    const self = this;

    // Return stream immediately to establish SSE connection
    return new ReadableStream({
      async start(controller) {
        try {
          // Send immediate loading message
          const loadingMessage = locale === 'en'
            ? 'Let me see~ I am analyzing your chart carefully...\n\n'
            : '好我看看～讓我仔細分析一下你的命盤...\n\n';
          const sseData = `data: ${JSON.stringify({ text: loadingMessage })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          console.log('[analyzeStream] Loading message sent, locale:', locale);

          // Step 0: Check analysis cache first
          const analysisCacheService = new AnalysisCacheService();
          const cachedAnalysis = await analysisCacheService.getAnalysis(chartId, analysisType, env);

          if (cachedAnalysis) {
            console.log('[analyzeStream] Cache hit! Returning cached analysis');
            const cachedText = typeof cachedAnalysis.result === 'string'
              ? cachedAnalysis.result
              : (cachedAnalysis.result as any).text || JSON.stringify(cachedAnalysis.result);

            // Send cached content line by line
            const lines = cachedText.split('\n');
            for (const line of lines) {
              const sseData = `data: ${JSON.stringify({ text: line + '\n' })}\n\n`;
              controller.enqueue(encoder.encode(sseData));
              await new Promise(resolve => setTimeout(resolve, 10));
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }

          // Step 1: Read chart data from D1
          const chartCacheService = new ChartCacheService();
          const chart = await chartCacheService.getChart(chartId, env);
          console.log('[analyzeStream] After getChart, found:', !!chart);

          if (!chart) {
            const errorData = `data: ${JSON.stringify({ error: 'Chart not found' })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
            return;
          }

          // Step 2: Convert to Markdown
          const calculation: CalculationResult = typeof chart.chartData === 'string'
            ? JSON.parse(chart.chartData)
            : chart.chartData;
          const markdown = formatToMarkdown(calculation, { excludeSteps: true, personalityOnly: true });

          // Step 3: Build prompt and call AI service with fallback support
          console.log('[analyzeStream] Before buildAnalysisPrompt');
          const prompt = buildAnalysisPrompt(markdown, locale);

          console.log('[analyzeStream] Before AI service generateStream');
          const aiOptions: AIOptions = { locale };
          const { stream: aiStream, metadata } = await aiServiceManager.generateStream(prompt, aiOptions);
          console.log('[analyzeStream] AI service succeeded, provider:', metadata.provider, 'fallback:', metadata.fallbackTriggered);

          // Step 4: Process AI stream using unified method
          const fullText = await self.processAIStream(
            aiStream,
            metadata.provider,
            controller,
            '[analyzeStream]'
          );

          // Save to cache with correct chartId and analysisType
          if (fullText) {
            await analysisCacheService.saveAnalysis(
              chartId,
              analysisType,
              { text: fullText },
              env
            );
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[analyzeStream] Error:', error);
          const errorData = `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });
  }

  /**
   * Create SSE stream from cached analysis
   * @param cachedText - The cached analysis text
   * @returns ReadableStream in SSE format
   */
  private createCachedSSEStream(cachedText: string): ReadableStream {
    const encoder = new TextEncoder();
    // Split by lines to preserve Markdown formatting
    const lines = cachedText.split('\n');

    return new ReadableStream({
      async start(controller) {
        console.log('[createCachedSSEStream] Sending', lines.length, 'cached lines');

        for (const line of lines) {
          // Send each line with newline preserved
          const sseData = `data: ${JSON.stringify({ text: line + '\n' })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          // Shorter delay for faster playback
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Send [DONE] signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        console.log('[createCachedSSEStream] Stream complete');
      }
    });
  }

  /**
   * Process AI stream and convert to SSE format
   * Unified method to handle different AI providers (Azure, Gemini)
   *
   * @param aiStream - ReadableStream from AI provider
   * @param provider - AI provider name ('azure' or 'gemini')
   * @param logPrefix - Prefix for console logs
   * @returns Object with fullText accumulated and SSE controller
   */
  private async processAIStream(
    aiStream: ReadableStream,
    provider: 'azure' | 'gemini',
    controller: ReadableStreamDefaultController,
    logPrefix: string
  ): Promise<string> {
    const reader = aiStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullText = '';
    let chunkCount = 0;

    if (provider === 'azure') {
      // Azure OpenAI: Plain text chunks
      console.log(`${logPrefix} Processing Azure OpenAI text stream`);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`${logPrefix} Azure stream done, total chunks:`, chunkCount);
          break;
        }

        chunkCount++;
        const text = decoder.decode(value, { stream: true });
        if (text) {
          fullText += text;
          const sseData = `data: ${JSON.stringify({ text })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          console.log(`${logPrefix} Chunk`, chunkCount, 'sent, length:', text.length);
        }
      }
    } else {
      // Gemini: JSON array format
      console.log(`${logPrefix} Processing Gemini JSON array stream`);
      let buffer = '';

      // Step 1: Accumulate entire buffer
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`${logPrefix} Gemini stream done, total chunks received:`, chunkCount);
          break;
        }

        chunkCount++;
        console.log(`${logPrefix} Chunk`, chunkCount, 'received, bytes:', value.length);
        buffer += decoder.decode(value, { stream: true });
      }

      console.log(`${logPrefix} Complete buffer accumulated, size:`, buffer.length);

      // Step 2: Parse as JSON array
      try {
        const jsonArray = JSON.parse(buffer);

        if (!Array.isArray(jsonArray)) {
          throw new Error('Expected JSON array from Gemini API');
        }

        console.log(`${logPrefix} Parsed JSON array, length:`, jsonArray.length);

        // Step 3: Extract and send text from each object
        for (let i = 0; i < jsonArray.length; i++) {
          const obj = jsonArray[i];
          const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (text) {
            fullText += text;
            console.log(`${logPrefix} Object`, i + 1, '- text chunk extracted, length:', text.length);
            const sseData = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } else {
            console.log(`${logPrefix} Object`, i + 1, '- no text content found');
          }
        }

        console.log(`${logPrefix} All text chunks sent, total text length:`, fullText.length);
      } catch (parseError) {
        console.error(`${logPrefix} JSON parse failed:`, parseError);
        console.error(`${logPrefix} Buffer preview:`, buffer.substring(0, 500));
        throw new Error(`Failed to parse Gemini response: ${parseError}`);
      }
    }

    return fullText;
  }

  /**
   * Transform Gemini streaming response to SSE format
   *
   * @deprecated This method is no longer used. analyzeStream now handles stream processing directly.
   *
   * Gemini API returns JSON array format: [{...},{...}]
   * Strategy:
   * 1. Accumulate entire response buffer
   * 2. Parse as JSON array when complete
   * 3. Extract text from each object's candidates[0].content.parts[0].text
   * 4. Send each text chunk as SSE
   *
   * @param geminiStream - ReadableStream from Gemini API
   * @param chartId - The chart ID for caching
   * @param env - Cloudflare Worker environment
   * @returns ReadableStream in SSE format
   */
  private transformToSSE(
    geminiStream: ReadableStream,
    chartId: string,
    env: { DB: D1Database }
  ): ReadableStream {
    const reader = geminiStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    let fullText = '';
    let chunkCount = 0;

    console.log('[transformToSSE] Starting stream transformation for chartId:', chartId);

    return new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Accumulate entire buffer
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[transformToSSE] Stream done, total chunks received:', chunkCount);
              break;
            }

            chunkCount++;
            console.log('[transformToSSE] Chunk', chunkCount, 'received, bytes:', value.length);
            buffer += decoder.decode(value, { stream: true });
          }

          console.log('[transformToSSE] Complete buffer accumulated, size:', buffer.length);

          // Step 2: Try to parse as JSON array
          try {
            const jsonArray = JSON.parse(buffer);

            if (!Array.isArray(jsonArray)) {
              throw new Error('Expected JSON array from Gemini API');
            }

            console.log('[transformToSSE] Parsed JSON array, length:', jsonArray.length);

            // Step 3: Extract and send text from each object
            for (let i = 0; i < jsonArray.length; i++) {
              const obj = jsonArray[i];
              const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text || '';

              if (text) {
                fullText += text;
                console.log('[transformToSSE] Object', i + 1, '- text chunk extracted, length:', text.length);
                const sseData = `data: ${JSON.stringify({ text })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              } else {
                console.log('[transformToSSE] Object', i + 1, '- no text content found');
              }
            }

            console.log('[transformToSSE] All text chunks sent, total text length:', fullText.length);
          } catch (parseError) {
            console.error('[transformToSSE] JSON parse failed:', parseError);
            console.error('[transformToSSE] Buffer preview:', buffer.substring(0, 500));
            throw new Error(`Failed to parse Gemini response: ${parseError}`);
          }

          // Step 4: Save complete analysis to D1
          if (fullText) {
            console.log('[transformToSSE] Saving analysis to cache');
            const analysisCacheService = new AnalysisCacheService();
            await analysisCacheService.saveAnalysis(
              chartId,
              'ai-streaming',
              { text: fullText },
              env
            );
            console.log('[transformToSSE] Analysis saved successfully');
          }

          // Step 5: Send completion event
          console.log('[transformToSSE] Sending completion event');
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[transformToSSE] Stream error:', error);
          controller.error(error);
        }
      },
    });
  }

  /**
   * Check if advanced analysis cache exists for a chart
   * @param chartId - The chart ID to check
   * @param env - Cloudflare Worker environment
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns Object with cached status
   */
  async checkAdvancedCache(chartId: string, env: { DB: D1Database }, locale: string = 'zh-TW'): Promise<{ cached: boolean }> {
    const analysisType = `ai-advanced-${locale}`;
    const cachedAnalysis = await this.advancedAnalysisCacheService.getAnalysis(chartId, analysisType, env);
    return { cached: !!cachedAnalysis };
  }

  /**
   * Analyze astrological chart with advanced streaming AI response
   *
   * @param chartId - The chart ID to analyze
   * @param env - Cloudflare Worker environment with DB binding
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns ReadableStream in SSE format
   */
  async analyzeAdvancedStream(chartId: string, env: { DB: D1Database }, locale: string = 'zh-TW'): Promise<ReadableStream> {
    console.log('[analyzeAdvancedStream] Entry, chartId:', chartId, 'locale:', locale);

    // Step 0: Define analysis type based on locale
    const analysisType = `ai-advanced-${locale}`;
    const cachedAnalysis = await this.advancedAnalysisCacheService.getAnalysis(chartId, analysisType, env);
    if (cachedAnalysis) {
      console.log('[analyzeAdvancedStream] Cache hit! Returning cached analysis');
      const cachedText = typeof cachedAnalysis.result === 'string'
        ? cachedAnalysis.result
        : (cachedAnalysis.result as any).text || JSON.stringify(cachedAnalysis.result);
      return this.createCachedSSEStream(cachedText);
    }

    // Step 1: Read chart data from D1
    const chart = await this.chartCacheService.getChart(chartId, env);
    console.log('[analyzeAdvancedStream] After getChart, found:', !!chart);
    if (!chart) {
      throw new Error('Chart not found');
    }

    // Step 2: Convert to Advanced Markdown
    const calculation: CalculationResult = typeof chart.chartData === 'string'
      ? JSON.parse(chart.chartData)
      : chart.chartData;
    console.log('[analyzeAdvancedStream] calculation keys:', Object.keys(calculation));
    console.log('[analyzeAdvancedStream] calculation.bazi:', !!calculation.bazi);
    console.log('[analyzeAdvancedStream] calculation.ziwei:', !!calculation.ziwei);
    const advancedMarkdown = formatAdvancedMarkdown(calculation);
    console.log('[analyzeAdvancedStream] advancedMarkdown length:', advancedMarkdown.length);

    // Step 3: Build prompt and call AI service with fallback support
    console.log('[analyzeAdvancedStream] Before buildAdvancedAnalysisPrompt');
    const prompt = this.buildAdvancedAnalysisPrompt(advancedMarkdown, locale);

    console.log('[analyzeAdvancedStream] Before AI service generateStream');
    const aiOptions: AIOptions = { locale };
    const { stream: aiStream, metadata } = await this.aiServiceManager.generateStream(prompt, aiOptions);
    console.log('[analyzeAdvancedStream] AI service succeeded, provider:', metadata.provider, 'fallback:', metadata.fallbackTriggered);

    // Step 4: Transform to SSE format with advanced cache
    return this.transformAdvancedToSSE(aiStream, chartId, analysisType, env, metadata.provider);
  }

  /**
   * Transform AI advanced streaming response to SSE format
   *
   * Similar to transformToSSE but saves to advancedAnalysisCacheService
   * Handles both Azure OpenAI (text stream) and Gemini (JSON array) formats
   *
   * @param aiStream - ReadableStream from AI provider
   * @param chartId - The chart ID for caching
   * @param analysisType - The analysis type (e.g., 'ai-advanced-zh-TW', 'ai-advanced-en')
   * @param env - Cloudflare Worker environment
   * @param provider - AI provider name ('azure' or 'gemini')
   * @returns ReadableStream in SSE format
   */
  private transformAdvancedToSSE(
    aiStream: ReadableStream,
    chartId: string,
    analysisType: string,
    env: { DB: D1Database },
    provider: 'azure' | 'gemini'
  ): ReadableStream {
    const encoder = new TextEncoder();

    console.log('[transformAdvancedToSSE] Starting stream transformation for chartId:', chartId, 'analysisType:', analysisType, 'provider:', provider);

    const self = this; // Capture 'this' context
    return new ReadableStream({
      async start(controller) {
        try {
          // Use unified processAIStream method
          const fullText = await self.processAIStream(
            aiStream,
            provider,
            controller,
            '[transformAdvancedToSSE]'
          );

          // Save complete advanced analysis to D1
          if (fullText) {
            console.log('[transformAdvancedToSSE] Saving advanced analysis to cache');
            const advancedAnalysisCacheService = new AdvancedAnalysisCacheService();
            await advancedAnalysisCacheService.saveAnalysis(
              chartId,
              analysisType,
              { text: fullText },
              env
            );
            console.log('[transformAdvancedToSSE] Advanced analysis saved successfully');
          }

          // Send completion event
          console.log('[transformAdvancedToSSE] Sending completion event');
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[transformAdvancedToSSE] Stream error:', error);
          controller.error(error);
        }
      }
    });
  }

  /**
   * Build analysis prompt for AI
   * @param markdown - Chart data in Markdown format
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns Formatted prompt string
   */
  private buildAnalysisPrompt(markdown: string, locale = 'zh-TW'): string {
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
   * Build advanced analysis prompt for AI
   * @param markdown - Advanced chart data in Markdown format
   * @param locale - Language locale (zh-TW or en, default: zh-TW)
   * @returns Formatted prompt string
   */
  private buildAdvancedAnalysisPrompt(markdown: string, locale = 'zh-TW'): string {
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

整體來看，你的四化能量有12條飛化邊，其中化忌佔了4條、化祿3條、化權3條、化科2條，這代表你的命盤能量流動活躍，但壓力和資源並存。

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
}
