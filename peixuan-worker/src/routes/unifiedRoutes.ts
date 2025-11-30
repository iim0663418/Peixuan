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
    try {
      const controller = new UnifiedController();
      const input = await req.json();
      const result = await controller.calculate(input);

      return Response.json(result);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
