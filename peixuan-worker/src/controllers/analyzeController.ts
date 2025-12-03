/**
 * Analyze Controller
 * Provides AI-powered astrological analysis endpoint
 */

import { UnifiedCalculator } from '../calculation/integration/calculator';
import { formatToMarkdown } from '../formatters/markdownFormatter';
import { GeminiService } from '../services/geminiService';
import { ChartCacheService } from '../services/chartCacheService';
import { AnalysisCacheService } from '../services/analysisCacheService';
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

  constructor(geminiApiKey: string) {
    this.geminiService = new GeminiService({
      apiKey: geminiApiKey,
      model: 'gemini-2.5-flash',
      maxRetries: 3,
    });
    this.chartCacheService = new ChartCacheService();
    this.analysisCacheService = new AnalysisCacheService();
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

      // Step 4: Convert to Markdown (exclude steps for AI)
      const markdown = formatToMarkdown(calculation, { excludeSteps: true });

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
   * Analyze astrological chart with streaming AI response
   *
   * @param chartId - The chart ID to analyze
   * @param env - Cloudflare Worker environment with DB binding
   * @returns ReadableStream in SSE format
   */
  async analyzeStream(chartId: string, env: { DB: D1Database }): Promise<ReadableStream> {
    console.log('[analyzeStream] Entry, chartId:', chartId);

    // Step 1: Read chart data from D1
    const chart = await this.chartCacheService.getChart(chartId, env);
    console.log('[analyzeStream] After getChart, found:', !!chart);
    if (!chart) {
      throw new Error('Chart not found');
    }

    // Step 2: Convert to Markdown
    const calculation: CalculationResult = typeof chart.chartData === 'string'
      ? JSON.parse(chart.chartData)
      : chart.chartData;
    const markdown = formatToMarkdown(calculation, { excludeSteps: true });

    // Step 3: Call Gemini Stream
    console.log('[analyzeStream] Before geminiService.analyzeChartStream');
    const geminiStream = await this.geminiService.analyzeChartStream(markdown);
    console.log('[analyzeStream] After geminiService.analyzeChartStream, stream:', !!geminiStream);

    // Step 4: Transform to SSE format
    return this.transformToSSE(geminiStream, chartId, env);
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
}
