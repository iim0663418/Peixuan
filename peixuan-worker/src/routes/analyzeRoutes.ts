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
   * GET /api/v1/analyze/stream
   *
   * Streams AI-powered analysis for an existing chart using Server-Sent Events (SSE)
   *
   * Query parameters:
   * - chartId: string (required) - The ID of the chart to analyze
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
      const stream = await controller.analyzeStream(chartId, env);

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

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });
}
