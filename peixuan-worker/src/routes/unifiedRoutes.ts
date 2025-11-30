import { Router } from 'itty-router';
import { UnifiedController } from '../controllers/unifiedController';

/**
 * Unified Routes
 *
 * Provides POST /api/v1/calculate endpoint for unified calculations.
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
   * }
   */
  router.post('/api/v1/calculate', async (req: any) => {
    console.log('[Route] POST /api/v1/calculate received');
    try {
      console.log('[Route] Creating controller...');
      const controller = new UnifiedController();
      
      console.log('[Route] Parsing JSON...');
      const input = await req.json();
      console.log('[Route] Input:', JSON.stringify(input));
      
      console.log('[Route] Calling controller.calculate...');
      const result = await controller.calculate(input);
      
      console.log('[Route] Returning response...');
      return Response.json(result);
    } catch (error: any) {
      console.error('[Route] Error:', error.message);
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
