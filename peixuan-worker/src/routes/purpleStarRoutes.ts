import { Router } from 'itty-router';
import { ChartController } from '../controllers/chartController';

/**
 * Purple Star Routes - Facade Pattern
 * 
 * This is a temporary facade to resolve 404 errors by converting
 * request/response formats between frontend expectations and backend storage.
 * 
 * Phase 2 TODO: Implement actual purple star calculation logic in dedicated controller.
 */
export function createPurpleStarRoutes(router: Router) {
  router.post('/api/v1/purple-star/calculate', async (req: any, env: any) => {
    try {
      const controller = new ChartController(env.CACHE);
      const input = await req.json();
      
      // Transform input format for chartController
      const chartData = {
        type: 'purple-star',
        data: input,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        location: typeof input.location === 'string' ? input.location : input.location?.name || '未知',
        name: input.name || 'Anonymous'
      };
      
      const savedChart = await controller.saveChart(env.DB, 'anonymous', chartData);
      
      // Transform response format for frontend
      return Response.json({
        data: {
          chart: savedChart.chartData
        }
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });
}
