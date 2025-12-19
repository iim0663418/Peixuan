import type { Router } from 'itty-router';
import { UnifiedController } from '../controllers/unifiedController';

/**
 * Unified Routes
 *
 * Provides POST /api/v1/calculate endpoint for unified calculations.
 * Supports multiple output formats (JSON, Markdown).
 *
 * Reference: IMPLEMENTATION_PLAN_PHASE1.md Sprint A Task A2
 */
export function createUnifiedRoutes(router: Router) {
  /**
   * POST /api/v1/calculate
   *
   * Calculates complete BaZi and ZiWei chart with all fields:
   * - BaZi: fourPillars, hiddenStems, tenGods, calculationSteps
   * - ZiWei: lifePalace, bodyPalace, bureau, stars, symmetry, calculationSteps
   *
   * Request body:
   * {
   *   birthDate: string (YYYY-MM-DD)
   *   birthTime: string (HH:mm)
   *   gender: 'male' | 'female'
   *   longitude?: number (default: 121.5)
   *   isLeapMonth?: boolean (default: false)
   *   format?: 'json' | 'markdown' (default: 'json')
   * }
   */
  router.post('/api/v1/calculate', async (req: any, env: any) => {
    const controller = new UnifiedController();
    const input = await req.json();
    
    // Support format from both query parameter and request body
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || input.format || 'json';
    
    const result = await controller.calculate(input, format, env);

    // Return appropriate response based on format
    if (format === 'markdown') {
      return new Response(result as string, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      });
    }

    // Default JSON response
    return result; // AutoRouter will automatically convert to JSON Response
  });
}
