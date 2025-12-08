/**
 * Analyze Controller
 * Provides AI-powered astrological analysis endpoint
 */

import { UnifiedCalculator } from '../calculation/integration/calculator';
import { formatToMarkdown } from '../formatters/markdownFormatter';
import { formatAdvancedMarkdown } from '../formatters/advancedMarkdownFormatter';
import { GeminiService } from '../services/geminiService';
import { ChartCacheService } from '../services/chartCacheService';
import { AnalysisCacheService } from '../services/analysisCacheService';
import { AdvancedAnalysisCacheService } from '../services/advancedAnalysisCacheService';
import type { BirthInfo, CalculationResult } from '../calculation/types';

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
  private geminiService: GeminiService;
  private chartCacheService: ChartCacheService;
  private analysisCacheService: AnalysisCacheService;
  private advancedAnalysisCacheService: AdvancedAnalysisCacheService;

  constructor(geminiApiKey: string) {
    this.geminiService = new GeminiService({
      apiKey: geminiApiKey,
      model: 'gemini-2.5-flash',
      maxRetries: 3,
    });
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
      const birthDateTime = `${requestData.birthDate} ${requestData.birthTime}`;
      const solarDate = new Date(birthDateTime);

      if (isNaN(solarDate.getTime())) {
        throw new Error('Invalid birth date or time format');
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

      // Step 5: Get AI analysis
      const geminiResponse = await this.geminiService.analyzeChart(markdown);

      // Step 6: Return combined result
      return {
        calculation,
        aiAnalysis: geminiResponse.text,
        usage: geminiResponse.usage,
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

          // Step 3: Call Gemini Stream with locale
          console.log('[analyzeStream] Before geminiService.analyzeChartStream');
          const geminiService = new GeminiService({ apiKey: env.GEMINI_API_KEY || '' });
          const geminiStream = await geminiService.analyzeChartStream(markdown, locale);
          console.log('[analyzeStream] After geminiService.analyzeChartStream, stream:', !!geminiStream);

          // Step 4: Process Gemini stream
          const reader = geminiStream.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullText = '';
          let chunkCount = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[analyzeStream] Stream done, total chunks received:', chunkCount);
              break;
            }

            chunkCount++;
            console.log('[analyzeStream] Chunk', chunkCount, 'received, bytes:', value.length);
            buffer += decoder.decode(value, { stream: true });
          }

          console.log('[analyzeStream] Complete buffer accumulated, size:', buffer.length);

          // Parse and send
          const jsonArray = JSON.parse(buffer);
          console.log('[analyzeStream] Parsed JSON array, length:', jsonArray.length);

          for (let i = 0; i < jsonArray.length; i++) {
            const obj = jsonArray[i];
            const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (text) {
              fullText += text;
              const sseData = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }
          }

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
   * Transform Gemini streaming response to SSE format
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

    // Step 3: Call Gemini Advanced Stream with locale
    console.log('[analyzeAdvancedStream] Before geminiService.analyzeAdvancedStream');
    const geminiStream = await this.geminiService.analyzeAdvancedStream(advancedMarkdown, locale);
    console.log('[analyzeAdvancedStream] After geminiService.analyzeAdvancedStream, stream:', !!geminiStream);

    // Step 4: Transform to SSE format with advanced cache
    return this.transformAdvancedToSSE(geminiStream, chartId, analysisType, env);
  }

  /**
   * Transform Gemini advanced streaming response to SSE format
   *
   * Similar to transformToSSE but saves to advancedAnalysisCacheService
   *
   * @param geminiStream - ReadableStream from Gemini API
   * @param chartId - The chart ID for caching
   * @param analysisType - The analysis type (e.g., 'ai-advanced-zh-TW', 'ai-advanced-en')
   * @param env - Cloudflare Worker environment
   * @returns ReadableStream in SSE format
   */
  private transformAdvancedToSSE(
    geminiStream: ReadableStream,
    chartId: string,
    analysisType: string,
    env: { DB: D1Database }
  ): ReadableStream {
    const reader = geminiStream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    let fullText = '';
    let chunkCount = 0;

    console.log('[transformAdvancedToSSE] Starting stream transformation for chartId:', chartId, 'analysisType:', analysisType);

    return new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Accumulate entire buffer
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[transformAdvancedToSSE] Stream done, total chunks received:', chunkCount);
              break;
            }

            chunkCount++;
            console.log('[transformAdvancedToSSE] Chunk', chunkCount, 'received, bytes:', value.length);
            buffer += decoder.decode(value, { stream: true });
          }

          console.log('[transformAdvancedToSSE] Complete buffer accumulated, size:', buffer.length);

          // Step 2: Try to parse as JSON array
          try {
            const jsonArray = JSON.parse(buffer);

            if (!Array.isArray(jsonArray)) {
              throw new Error('Expected JSON array from Gemini API');
            }

            console.log('[transformAdvancedToSSE] Parsed JSON array, length:', jsonArray.length);

            // Step 3: Extract and send text from each object
            for (let i = 0; i < jsonArray.length; i++) {
              const obj = jsonArray[i];
              const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text || '';

              if (text) {
                fullText += text;
                console.log('[transformAdvancedToSSE] Object', i + 1, '- text chunk extracted, length:', text.length);
                const sseData = `data: ${JSON.stringify({ text })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              } else {
                console.log('[transformAdvancedToSSE] Object', i + 1, '- no text content found');
              }
            }

            console.log('[transformAdvancedToSSE] All text chunks sent, total text length:', fullText.length);
          } catch (parseError) {
            console.error('[transformAdvancedToSSE] JSON parse failed:', parseError);
            console.error('[transformAdvancedToSSE] Buffer preview:', buffer.substring(0, 500));
            throw new Error(`Failed to parse Gemini response: ${parseError}`);
          }

          // Step 4: Save complete advanced analysis to D1
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

          // Step 5: Send completion event
          console.log('[transformAdvancedToSSE] Sending completion event');
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[transformAdvancedToSSE] Stream error:', error);
          controller.error(error);
        }
      },
    });
  }
}
