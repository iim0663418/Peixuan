/**
 * Analyze Routes
 * Provides AI-powered analysis endpoint
 */

import type { AutoRouter } from 'itty-router';
import { AnalyzeController } from '../controllers/analyzeController';

export function createAnalyzeRoutes(router: ReturnType<typeof AutoRouter>, env: any) {
  /**
   * POST /api/v1/analyze
   * 
   * Calculates astrological chart and provides AI-powered analysis
   * 
   * Request body:
   * {
   *   birthDate: string (YYYY-MM-DD)
   *   birthTime: string (HH:mm)
   *   gender: 'male' | 'female'
   *   longitude?: number (default: 121.5)
   *   isLeapMonth?: boolean (default: false)
   * }
   * 
   * Response:
   * {
   *   calculation: CalculationResult
   *   aiAnalysis: string
   *   usage?: { promptTokens, completionTokens, totalTokens }
   * }
   */
  router.post('/api/v1/analyze', async (req: any) => {
    try {
      // Get Gemini API key from environment
      const geminiApiKey = env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        return new Response(
          JSON.stringify({ error: 'Gemini API key not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const controller = new AnalyzeController(geminiApiKey);
      const input = await req.json();
      const result = await controller.analyze(input);

      return result; // AutoRouter will convert to JSON Response
    } catch (error) {
      console.error('Analyze error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });

  /**
   * GET /api/v1/analyze/check
   *
   * Checks if analysis cache exists for a chart
   *
   * Query params:
   * - chartId: string (required)
   *
   * Response:
   * {
   *   cached: boolean
   * }
   */
  router.get('/api/v1/analyze/check', async (req: any) => {
    try {
      const url = new URL(req.url);
      const chartId = url.searchParams.get('chartId');

      if (!chartId) {
        return new Response(
          JSON.stringify({ error: 'chartId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const geminiApiKey = env.GEMINI_API_KEY;
      const controller = new AnalyzeController(geminiApiKey);
      const result = await controller.checkCache(chartId, env);

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Check cache error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check cache' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });

  /**
   * GET /api/v1/analyze/stream
   *
   * Streams AI-powered analysis for an existing chart using Server-Sent Events (SSE)
   *
   * Query parameters:
   * - chartId: string (required) - The ID of the chart to analyze
   * - locale: string (optional) - Language locale (zh-TW or en, default: zh-TW)
   *
   * Response:
   * - Content-Type: text/event-stream
   * - Format: SSE events with incremental analysis text
   * - Final event: "data: [DONE]\n\n"
   */
  router.get('/api/v1/analyze/stream', async (req: any) => {
    try {
      // Parse URL and get chartId from query params
      const url = new URL(req.url);
      const chartId = url.searchParams.get('chartId');
      const locale = url.searchParams.get('locale') || 'zh-TW';

      // Validate chartId
      if (!chartId) {
        return new Response(
          JSON.stringify({ error: 'Missing chartId parameter' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get Gemini API key from environment
      const geminiApiKey = env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        return new Response(
          JSON.stringify({ error: 'Gemini API key not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create controller and call analyzeStream
      const controller = new AnalyzeController(geminiApiKey);
      const stream = await controller.analyzeStream(chartId, env, locale);

      // Return Response with SSE headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      console.error('Analyze stream error:', error);

      // Convert error to Peixuan-style message
      let errorMessage = '哎呀～佩璇遇到了一些小問題呢...';
      
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        
        // Handle quota exceeded (429)
        if (errMsg.includes('quota') || errMsg.includes('429')) {
          // Try to extract retry delay
          const retryMatch = error.message.match(/retry in (\d+)/i);
          if (retryMatch) {
            const seconds = parseInt(retryMatch[1]);
            const minutes = Math.ceil(seconds / 60);
            errorMessage = `佩璇累了，需要休息一下喔～請等 ${minutes} 分鐘後再來找我吧！✨`;
          } else {
            errorMessage = '佩璇今天太忙了，需要休息一下～請稍後再來找我喔！💫';
          }
        }
        // Handle other errors
        else if (errMsg.includes('not found')) {
          errorMessage = '咦？佩璇找不到你的命盤資料耶...要不要重新算一次呢？🔮';
        } else if (errMsg.includes('timeout')) {
          errorMessage = '哎呀～佩璇算得太專心，時間有點久了...要不要再試一次呢？⏰';
        } else {
          errorMessage = `佩璇遇到了一些小狀況：${error.message} 💭`;
        }
      }

      // Return error in SSE format
      const errorStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      });

      return new Response(errorStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  });

  /**
   * GET /api/v1/analyze/advanced/check
   *
   * Checks if advanced analysis cache exists for a chart
   *
   * Query params:
   * - chartId: string (required)
   *
   * Response:
   * {
   *   cached: boolean
   * }
   */
  router.get('/api/v1/analyze/advanced/check', async (req: any) => {
    try {
      const url = new URL(req.url);
      const chartId = url.searchParams.get('chartId');
      const locale = url.searchParams.get('locale') || 'zh-TW';

      if (!chartId) {
        return new Response(
          JSON.stringify({ error: 'chartId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const geminiApiKey = env.GEMINI_API_KEY;
      const controller = new AnalyzeController(geminiApiKey);
      const result = await controller.checkAdvancedCache(chartId, env, locale);

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Check advanced cache error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check advanced cache' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });

  /**
   * GET /api/v1/analyze/advanced/stream
   *
   * Streams advanced AI-powered analysis for an existing chart using Server-Sent Events (SSE)
   *
   * Query parameters:
   * - chartId: string (required) - The ID of the chart to analyze
   * - locale: string (optional) - Language locale (zh-TW or en, default: zh-TW)
   *
   * Response:
   * - Content-Type: text/event-stream
   * - Format: SSE events with incremental advanced analysis text
   * - Final event: "data: [DONE]\n\n"
   */
  router.get('/api/v1/analyze/advanced/stream', async (req: any) => {
    try {
      // Parse URL and get chartId from query params
      const url = new URL(req.url);
      const chartId = url.searchParams.get('chartId');
      const locale = url.searchParams.get('locale') || 'zh-TW';

      // Validate chartId
      if (!chartId) {
        return new Response(
          JSON.stringify({ error: 'Missing chartId parameter' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get Gemini API key from environment
      const geminiApiKey = env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        return new Response(
          JSON.stringify({ error: 'Gemini API key not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create controller and call analyzeAdvancedStream
      const controller = new AnalyzeController(geminiApiKey);
      const stream = await controller.analyzeAdvancedStream(chartId, env, locale);

      // Return Response with SSE headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      console.error('Analyze advanced stream error:', error);

      // Convert error to Peixuan-style message
      let errorMessage = '哎呀～佩璇遇到了一些小問題呢...';
      
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        
        // Handle quota exceeded (429)
        if (errMsg.includes('quota') || errMsg.includes('429')) {
          const retryMatch = error.message.match(/retry in (\d+)/i);
          if (retryMatch) {
            const seconds = parseInt(retryMatch[1]);
            const minutes = Math.ceil(seconds / 60);
            errorMessage = `佩璇累了，需要休息一下喔～請等 ${minutes} 分鐘後再來找我吧！✨`;
          } else {
            errorMessage = '佩璇今天太忙了，需要休息一下～請稍後再來找我喔！💫';
          }
        }
        else if (errMsg.includes('not found')) {
          errorMessage = '咦？佩璇找不到你的命盤資料耶...要不要重新算一次呢？🔮';
        } else if (errMsg.includes('timeout')) {
          errorMessage = '哎呀～佩璇算得太專心，時間有點久了...要不要再試一次呢？⏰';
        } else {
          errorMessage = `佩璇遇到了一些小狀況：${error.message} 💭`;
        }
      }

      // Return error in SSE format
      const errorStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      });

      return new Response(errorStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  });
}
